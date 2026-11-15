// Editor de un video: vista previa arriba (siempre completa), paneles de escena, notas, música y
// publicación al lado, y la línea de tiempo abajo.
import { Player, type PlayerRef } from '@remotion/player';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { PLANTILLAS } from '../../src/plantillas';
import { proyectos } from '../../src/proyectos';
import { VideoHorizontal } from '../../src/VideoHorizontal';
import { VideoVertical } from '../../src/VideoVertical';
import { api, type DetalleProyecto, type EscenaGuion, type Guion, type Nota, type Trabajo } from './api';
import { EstadoVideo, formatearTiempo, SelectorCategoria, SelectorVoz, useCategorias, useVoces } from './comun';
import { marcarCambiosSinGuardar, useEventos } from './eventos';
import { LineaDeTiempo, type BloqueEscena } from './LineaDeTiempo';
import { PanelEscena, PanelMusica, PanelNotas, SelectorPlantilla } from './Paneles';
import { armarVistaPrevia, type VistaPrevia } from './vistaPrevia';

type TrabajoEnVivo = { accion: Trabajo['accion']; lineas: string[]; estado?: 'listo' | 'falló' };
type Pestana = 'escena' | 'notas' | 'musica' | 'publicacion';

const NOMBRE_TRABAJO = { voz: 'Voz', render: 'Render', tiempos: 'Actualizando el video' };

const copiar = (texto: string) => navigator.clipboard.writeText(texto).catch(() => {});

// Lo que el Estudio deja editar del guion (y lo que se compara para saber si hay cambios).
const editable = (g: Guion) => ({
  titulo: g.titulo,
  voz: g.voz,
  portada: g.portada,
  post: g.post,
  musica: g.musica ?? null,
  escenas: g.escenas.map(({ id, texto, voz, transicion, pausa, dibujo, plantilla }) => ({ id, texto, voz, transicion, pausa, dibujo, plantilla })),
});

// Nombre libre para una escena nueva o duplicada: "chips" → "chips-2", "chips-3"…
const nuevoId = (base: string, usados: Set<string>) => {
  const raiz = base.replace(/-\d+$/, '').slice(0, 34) || 'escena';
  for (let i = 2; ; i++) if (!usados.has(`${raiz}-${i}`)) return `${raiz}-${i}`;
};

// Las notas se guardan pegadas a una escena; aquí se pasan a segundos del video y de vuelta.
const ubicar = (n: Nota, vista: VistaPrevia | null) => {
  const escena = vista?.tiempos.escenas.find((e) => e.id === n.escena);
  const inicio = escena ? escena.inicio + n.desde : n.inicio;
  return { ...n, inicio, fin: inicio + n.duracion };
};
const anclar = (inicio: number, vista: VistaPrevia | null) => {
  const escenas = vista?.tiempos.escenas ?? [];
  const escena = escenas.findLast((e) => e.inicio <= inicio + 1e-6) ?? escenas[0];
  return { escena: escena?.id ?? null, desde: +(inicio - (escena?.inicio ?? 0)).toFixed(3), inicio: +inicio.toFixed(3) };
};

const ErrorDelVideo: FC<{ error: Error }> = ({ error }) => (
  <div className="error-video">
    <strong>No se pudo dibujar esta parte del video.</strong>
    <p>{error.message}</p>
    <p className="tenue">Si cambiaste una palabra que usa una animación hecha a medida, pídele a Claude en el chat que ajuste esa escena.</p>
  </div>
);

export const Proyecto: FC<{ id: string }> = ({ id }) => {
  const enPaquete = proyectos.find((p) => p.id === id);
  const [detalle, setDetalle] = useState<DetalleProyecto | null>(null);
  const [borrador, setBorrador] = useState<Guion | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [pestana, setPestana] = useState<Pestana>('escena');
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trabajo, setTrabajo] = useState<TrabajoEnVivo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaElegida, setNotaElegida] = useState<string | null>(null);
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const notasSinGuardar = useRef(false);
  const { voces, planGratis } = useVoces();
  const { categorias, recargarCategorias } = useCategorias();
  const [categoria, setCategoria] = useState<string | null>(null);
  const [avisoCategoria, setAvisoCategoria] = useState<string | null>(null);
  // División dentro de la categoría (p. ej. Gali Esport: Entrenador, Organizador, Jugador). `undefined`: la guardada.
  const [divisiones, setDivisiones] = useState<Record<string, string[]>>({});
  const [division, setDivision] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    api.divisiones().then(setDivisiones).catch(() => {});
  }, []);
  // La categoría y la división no son parte del video: se guardan al momento, sin pasar por «Guardar».
  const cambiarCategoria = async (nueva: string) => {
    setCategoria(nueva);
    try {
      await api.cambiarCategoria(id, nueva);
      recargarCategorias();
      // Al cambiar de categoría el servidor quita la división si ya no corresponde.
      const estado = await api.proyecto(id);
      setDivision(estado.division);
      setAvisoCategoria('Guardada');
    } catch (e) {
      setAvisoCategoria((e as Error).message);
    }
  };
  const cambiarDivision = async (nueva: string | null) => {
    setDivision(nueva);
    try {
      await api.cambiarDivision(id, nueva);
      setAvisoCategoria('Guardada');
    } catch (e) {
      setAvisoCategoria((e as Error).message);
    }
  };
  const reproductor = useRef<PlayerRef>(null);

  const cargar = useCallback(
    async (conservarBorrador = false) => {
      const d = await api.proyecto(id);
      setDetalle(d);
      if (!conservarBorrador) setBorrador(structuredClone(d.guion));
      setSeleccion((s) => s ?? d.guion.escenas[0]?.id ?? null);
      if (d.trabajo) setTrabajo({ accion: d.trabajo.accion, lineas: d.trabajo.lineas });
    },
    [id],
  );
  const cargarNotas = useCallback(() => {
    if (!notasSinGuardar.current) api.notas(id).then(setNotas).catch(() => {});
  }, [id]);
  useEffect(() => {
    cargar().catch((e) => setError(e.message));
    cargarNotas();
    // Un trabajo recién terminado suele recargar la página: se muestra su resultado igual.
    const reciente = JSON.parse(sessionStorage.getItem(`trabajo:${id}`) ?? 'null');
    sessionStorage.removeItem(`trabajo:${id}`);
    if (reciente && Date.now() - reciente.fecha < 20000) setTrabajo(reciente.trabajo);
  }, [cargar, cargarNotas, id]);

  const hayCambios = useMemo(
    () => Boolean(detalle && borrador && JSON.stringify(editable(detalle.guion)) !== JSON.stringify(editable(borrador))),
    [detalle, borrador],
  );
  useEffect(() => {
    marcarCambiosSinGuardar(hayCambios);
    return () => marcarCambiosSinGuardar(false);
  }, [hayCambios]);

  useEventos((e) => {
    if (e.tipo === 'archivos') {
      cargar(hayCambios).catch(() => {});
      cargarNotas();
      return;
    }
    if (e.tipo !== 'trabajo' || e.proyecto !== id) return;
    if (e.estado === 'empezó') setTrabajo({ accion: e.accion, lineas: [] });
    else if (e.linea) setTrabajo((t) => ({ accion: e.accion, lineas: [...(t?.lineas ?? []).slice(-80), e.linea!] }));
    else if (e.estado) {
      const terminado: TrabajoEnVivo = { accion: e.accion, lineas: e.ultimas ?? [], estado: e.estado as 'listo' | 'falló' };
      sessionStorage.setItem(`trabajo:${id}`, JSON.stringify({ trabajo: terminado, fecha: Date.now() }));
      setTrabajo((t) => ({ ...terminado, lineas: t?.lineas.length ? t.lineas : terminado.lineas }));
      cargar(hayCambios).catch(() => {});
    }
  });

  // Vista previa del borrador: se ve en el reproductor sin guardar.
  const vista = useMemo(
    () => (borrador && detalle ? armarVistaPrevia(borrador, detalle.guion, enPaquete?.tiempos) : null),
    [borrador, detalle, enPaquete],
  );
  const vistaActual = useRef(vista);
  vistaActual.current = vista;
  const fps = vista?.tiempos.fps ?? 30;
  const totalFotogramas = Math.max(1, Math.round((vista?.tiempos.duracion ?? 1) * fps));

  // Recordar en qué momento del video estabas (al abrir, se muestra un momento con imagen).
  const fotogramaInicial = Math.min(totalFotogramas - 1, Number(sessionStorage.getItem(`fotograma:${id}`)) || 45);
  const cargado = Boolean(vista);
  useEffect(() => {
    const r = reproductor.current;
    if (!r) return;
    const alAvanzar = (e: { detail: { frame: number } }) => sessionStorage.setItem(`fotograma:${id}`, String(e.detail.frame));
    r.addEventListener('frameupdate', alAvanzar);
    return () => r.removeEventListener('frameupdate', alAvanzar);
  }, [id, cargado]);
  const posicionActual = () => (reproductor.current?.getCurrentFrame() ?? 0) / fps;
  const irA = (segundo: number) => {
    reproductor.current?.pause();
    reproductor.current?.seekTo(Math.min(totalFotogramas - 1, Math.max(0, Math.round(segundo * fps))));
  };

  // --- Notas: se guardan solas, medio segundo después del último cambio ---------------------------
  useEffect(() => {
    if (!notasSinGuardar.current) return;
    setGuardandoNotas(true);
    const espera = setTimeout(() => {
      const conInicio = notas.map((n) => ({ ...n, inicio: +ubicar(n, vistaActual.current).inicio.toFixed(3) }));
      api
        .guardarNotas(id, conInicio)
        .catch((e) => setError(`No se pudieron guardar las notas: ${e.message}`))
        .finally(() => {
          notasSinGuardar.current = false;
          setGuardandoNotas(false);
        });
    }, 600);
    return () => clearTimeout(espera);
  }, [notas, id]);
  const cambiarNotas = (cambio: (ns: Nota[]) => Nota[]) => {
    notasSinGuardar.current = true;
    setNotas(cambio);
  };
  const crearNota = (desde: number, hasta: number) => {
    const nota: Nota = {
      id: `nota-${Date.now().toString(36)}`,
      ...anclar(desde, vista),
      duracion: +Math.max(1 / fps, hasta - desde).toFixed(3),
      texto: '',
      estado: 'pendiente',
      creada: new Date().toISOString(),
    };
    cambiarNotas((ns) => [...ns, nota]);
    setNotaElegida(nota.id);
    setPestana('notas');
    irA(desde);
  };
  const cambiarNota = (idNota: string, cambio: Partial<Nota> & { fin?: number }) =>
    cambiarNotas((ns) =>
      ns.map((n) => {
        if (n.id !== idNota) return n;
        const actual = ubicar(n, vista);
        const { fin, ...resto } = cambio;
        let nueva: Nota = { ...n, ...resto };
        if (cambio.inicio !== undefined || fin !== undefined) {
          const inicio = Math.max(0, cambio.inicio ?? actual.inicio);
          const final = Math.max(inicio + 1 / fps, fin ?? inicio + n.duracion);
          nueva = { ...nueva, ...anclar(inicio, vista), duracion: +(final - inicio).toFixed(3) };
        }
        if (cambio.texto !== undefined && n.estado === 'hecha' && cambio.texto !== n.texto) nueva.estado = 'pendiente';
        return nueva;
      }),
    );
  const borrarNota = (idNota: string) => {
    cambiarNotas((ns) => ns.filter((n) => n.id !== idNota));
    setNotaElegida(null);
  };

  // --- Cambios en el borrador de escenas -----------------------------------------------------------
  const cambiarEscenas = (cambio: (escenas: EscenaGuion[]) => EscenaGuion[]) => setBorrador((b) => b && { ...b, escenas: cambio(b.escenas) });
  const cambiarEscena = (idEscena: string, cambio: Partial<EscenaGuion>) =>
    cambiarEscenas((es) => es.map((e) => (e.id === idEscena ? { ...e, ...cambio } : e)));
  const mover = (desde: number, hasta: number) =>
    cambiarEscenas((es) => {
      const copia = [...es];
      const [escena] = copia.splice(desde, 1);
      copia.splice(hasta, 0, escena);
      return copia;
    });
  const duplicar = (idEscena: string) => {
    if (!borrador) return;
    const i = borrador.escenas.findIndex((e) => e.id === idEscena);
    const original = borrador.escenas[i];
    const copia: EscenaGuion = { ...structuredClone(original), id: nuevoId(original.id, new Set(borrador.escenas.map((e) => e.id))) };
    // Una copia de un dibujo a medida usa el mismo dibujo que la original.
    if (!copia.plantilla) copia.dibujo = original.dibujo ?? original.id;
    cambiarEscenas((es) => [...es.slice(0, i + 1), copia, ...es.slice(i + 1)]);
    setSeleccion(copia.id);
  };
  const borrar = (idEscena: string) => {
    if (!borrador || borrador.escenas.length === 1) return;
    const i = borrador.escenas.findIndex((e) => e.id === idEscena);
    cambiarEscenas((es) => es.filter((e) => e.id !== idEscena));
    setSeleccion(borrador.escenas[i + 1]?.id ?? borrador.escenas[i - 1]?.id ?? null);
  };
  const agregar = (tipo: string, texto: string) => {
    if (!borrador) return;
    const nueva: EscenaGuion = {
      id: nuevoId('escena', new Set(borrador.escenas.map((e) => e.id))),
      texto,
      plantilla: { tipo, ...structuredClone(PLANTILLAS[tipo].inicial) },
    };
    const i = borrador.escenas.findIndex((e) => e.id === seleccion);
    const donde = i < 0 ? borrador.escenas.length : i + 1;
    cambiarEscenas((es) => [...es.slice(0, donde), nueva, ...es.slice(donde)]);
    setSeleccion(nueva.id);
    setPestana('escena');
    setAgregando(false);
  };

  const guardar = async () => {
    if (!borrador) return;
    setGuardando(true);
    setError(null);
    try {
      await api.guardarGuion(id, editable(borrador));
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const lanzar = async (accion: 'voz' | 'render') => {
    setError(null);
    try {
      await (accion === 'voz' ? api.generarVoz(id) : api.renderizar(id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (error && !detalle) return <p className="pagina error">{error}</p>;
  if (!detalle || !borrador || !vista) return <p className="pagina tenue">Cargando…</p>;

  const enCurso = Boolean(trabajo && !trabajo.estado);
  // Los videos completos (YouTube) son horizontales: otro reproductor y el video arriba a lo ancho.
  const horizontal = (enPaquete?.formato ?? detalle.formato) === 'horizontal';
  // Capítulos de YouTube («0:00 Nombre») según dónde cae ahora cada escena que abre un capítulo.
  const capitulosYoutube = vista.tiempos.escenas
    .filter((e) => detalle.guion.capitulos?.[e.id])
    .map((e) => `${formatearTiempo(Math.floor(e.inicio))} ${detalle.guion.capitulos![e.id]}`)
    .join('\n');
  // En el post, {titulo} y {capitulos} se reemplazan al renderizar (scripts/render.mjs); al copiar, también.
  const postFinal = borrador.post.replaceAll('{titulo}', borrador.titulo).replaceAll('{capitulos}', capitulosYoutube);
  const pendientes = detalle.vozPendiente;
  const elegida = borrador.escenas.find((e) => e.id === seleccion) ?? borrador.escenas[0];
  const numeroElegida = borrador.escenas.indexOf(elegida) + 1;
  const progreso =
    trabajo?.accion === 'render' ? Number(/Video: (\d+)%/.exec(trabajo.lineas.findLast((l) => /Video:/.test(l)) ?? '')?.[1] ?? 0) : null;
  const notasUbicadas = notas.map((n) => ubicar(n, vista)).sort((a, b) => a.inicio - b.inicio);
  const notasPendientes = notas.filter((n) => n.estado === 'pendiente').length;

  const bloques: BloqueEscena[] = vista.tiempos.escenas.map((t, i) => {
    const e = borrador.escenas[i];
    const definicion = e.plantilla ? PLANTILLAS[e.plantilla.tipo] : null;
    return {
      id: e.id,
      numero: i + 1,
      inicio: t.inicio,
      duracion: t.duracion,
      icono: definicion?.icono ?? '✎',
      tipo: definicion?.nombre ?? 'Dibujo a medida',
      texto: e.texto,
      pendiente: vista.pendientes.has(e.id),
    };
  });

  const acciones = (
    <>
      <button className="boton primario" disabled={!hayCambios || guardando} onClick={guardar}>
        {guardando ? 'Guardando…' : hayCambios ? 'Guardar cambios' : 'Guardado'}
      </button>
      {hayCambios && (
        <button className="boton texto" onClick={() => setBorrador(structuredClone(detalle.guion))}>
          Deshacer
        </button>
      )}
      <button
        className="boton"
        disabled={hayCambios || enCurso || pendientes.length === 0}
        title={hayCambios ? 'Guarda primero los cambios' : undefined}
        onClick={() => lanzar('voz')}
      >
        Generar voz{pendientes.length ? ` (${pendientes.length})` : ''}
        {pendientes.length > 0 && <small>{detalle.creditosPorPagar > 0 ? ` ≈ ${detalle.creditosPorPagar} créditos` : ' · gratis'}</small>}
      </button>
      <button
        className="boton"
        disabled={hayCambios || enCurso || pendientes.length > 0 || !enPaquete}
        title={pendientes.length ? 'Primero genera la voz' : hayCambios ? 'Guarda primero los cambios' : undefined}
        onClick={() => lanzar('render')}
      >
        Renderizar
      </button>
    </>
  );

  const estado = (error || trabajo) && (
    <div className="linea-estado">
      {error && <span className="error">{error}</span>}
      {trabajo && (
        <span className={`trabajo-linea ${trabajo.estado ?? 'en-curso'}`}>
          <strong>
            {NOMBRE_TRABAJO[trabajo.accion]}: {trabajo.estado === 'listo' ? 'terminado ✓' : trabajo.estado === 'falló' ? 'falló' : 'en curso…'}
          </strong>
          {progreso !== null && !trabajo.estado && (
            <span className="barra">
              <span style={{ width: `${progreso}%` }} />
            </span>
          )}
          <span className="tenue">{trabajo.lineas.at(-1)}</span>
          {trabajo.estado && (
            <button className="boton texto" onClick={() => setTrabajo(null)}>
              Cerrar
            </button>
          )}
        </span>
      )}
    </div>
  );

  return (
    <section className={`pagina editor ${horizontal ? 'horizontal' : ''}`}>
      <div className="editor-cabeza">
        <a className="volver" href={horizontal ? '#/completos' : '#/'}>
          {horizontal ? '← Videos completos' : '← Videos'}
        </a>
        <h1>{detalle.titulo}</h1>
        {hayCambios && <span className="etiqueta aviso">Viendo tus cambios sin guardar</span>}
        <EstadoVideo proyecto={{ ...detalle, trabajo: enCurso ? { accion: trabajo!.accion, lineas: [], inicio: 0 } : null }} />
      </div>

      <div className="editor-centro">
        <div className="editor-video">
          <div className="marco-video">
            {enPaquete ? (
              <Player
                ref={reproductor}
                component={horizontal ? VideoHorizontal : VideoVertical}
                inputProps={{ proyecto: id, tiempos: vista.tiempos }}
                durationInFrames={totalFotogramas}
                initialFrame={fotogramaInicial}
                fps={fps}
                compositionWidth={horizontal ? 1920 : 1080}
                compositionHeight={horizontal ? 1080 : 1920}
                controls
                acknowledgeRemotionLicense
                errorFallback={({ error: e }) => <ErrorDelVideo error={e} />}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="sin-vista">Este video todavía se está preparando. Claude lo está armando.</div>
            )}
          </div>
        </div>

        <div className="editor-panel">
          <div className="pestanas">
            <button className={pestana === 'escena' ? 'activa' : ''} onClick={() => setPestana('escena')}>
              Escena
            </button>
            <button className={pestana === 'notas' ? 'activa' : ''} onClick={() => setPestana('notas')}>
              Notas{notasPendientes ? ` (${notasPendientes})` : ''}
            </button>
            <button className={pestana === 'musica' ? 'activa' : ''} onClick={() => setPestana('musica')}>
              Música
            </button>
            <button className={pestana === 'publicacion' ? 'activa' : ''} onClick={() => setPestana('publicacion')}>
              Publicación
            </button>
          </div>

          {pestana === 'escena' && elegida && (
            <PanelEscena
              key={elegida.id}
              escena={elegida}
              numero={numeroElegida}
              total={borrador.escenas.length}
              proyecto={id}
              pendiente={vista.pendientes.has(elegida.id)}
              voces={voces}
              planGratis={planGratis}
              onCambio={(cambio) => cambiarEscena(elegida.id, cambio)}
              onMover={(d) => mover(numeroElegida - 1, numeroElegida - 1 + d)}
              onDuplicar={() => duplicar(elegida.id)}
              onBorrar={() => borrar(elegida.id)}
            />
          )}

          {pestana === 'notas' && (
            <PanelNotas
              notas={notasUbicadas}
              elegida={notaElegida}
              proyecto={id}
              guardando={guardandoNotas}
              posicionActual={posicionActual}
              onElegir={(idNota) => {
                setNotaElegida(idNota);
                const n = notasUbicadas.find((x) => x.id === idNota);
                if (n) irA(n.inicio);
              }}
              onCambio={cambiarNota}
              onBorrar={borrarNota}
              onNuevaAqui={() => crearNota(posicionActual(), Math.min(vista.tiempos.duracion, posicionActual() + 2))}
              onIrA={irA}
            />
          )}

          {pestana === 'musica' && <PanelMusica musica={borrador.musica} onCambio={(musica) => setBorrador({ ...borrador, musica })} />}

          {pestana === 'publicacion' && (
            <div className="panel publicacion">
              <div className="dos-campos">
                <label className="campo">
                  <span>Título del video</span>
                  <input value={borrador.titulo} onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })} />
                </label>
                <label className="campo">
                  <span>
                    Categoría en tu biblioteca
                    {avisoCategoria && <small className="tenue">{avisoCategoria}</small>}
                  </span>
                  <SelectorCategoria valor={categoria ?? detalle.categoria} categorias={categorias} onCambio={cambiarCategoria} />
                </label>
              </div>
              {divisiones[categoria ?? detalle.categoria] && (
                <label className="campo">
                  <span>División en {categoria ?? detalle.categoria}</span>
                  <select value={(division === undefined ? detalle.division : division) ?? ''} onChange={(e) => cambiarDivision(e.target.value || null)}>
                    <option value="">Sin división</option>
                    {divisiones[categoria ?? detalle.categoria].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="campo">
                <span>Voz de todo el video</span>
                <SelectorVoz valor={borrador.voz} voces={voces} planGratis={planGratis} onCambio={(voz) => voz && setBorrador({ ...borrador, voz })} />
              </label>
              <div className="dos-campos">
                <label className="campo">
                  <span>Portada: texto</span>
                  <input value={borrador.portada.titulo} onChange={(e) => setBorrador({ ...borrador, portada: { ...borrador.portada, titulo: e.target.value } })} />
                </label>
                <label className="campo">
                  <span>Portada: palabra resaltada</span>
                  <input
                    value={borrador.portada.destacar}
                    onChange={(e) => setBorrador({ ...borrador, portada: { ...borrador.portada, destacar: e.target.value } })}
                  />
                </label>
              </div>
              <label className="campo">
                <span>
                  Texto del post
                  <button className="boton texto" onClick={() => copiar(postFinal)}>
                    Copiar
                  </button>
                </span>
                <textarea rows={8} value={borrador.post} onChange={(e) => setBorrador({ ...borrador, post: e.target.value })} />
              </label>
              {horizontal && (
                <div className="campo">
                  <span>Capítulos para YouTube</span>
                  <pre className="capitulos-youtube">{capitulosYoutube || 'Este video no tiene capítulos marcados.'}</pre>
                  <small className="tenue">
                    En el texto, {'{capitulos}'} se cambia por esta lista y {'{titulo}'} por el título del video (al copiar y al renderizar).
                  </small>
                </div>
              )}
              <div className="descargas">
                {detalle.video ? (
                  <a className="boton" href={detalle.video.url} download={`${id}.mp4`}>
                    Descargar video
                  </a>
                ) : (
                  <span className="tenue">Renderiza el video para poder descargarlo.</span>
                )}
                {detalle.portada && (
                  <a className="boton" href={detalle.portada} download={`${id}-portada.jpg`}>
                    Descargar portada
                  </a>
                )}
              </div>
              {detalle.portada && <img className="portada-grande" src={detalle.portada} alt="Portada" />}
            </div>
          )}
        </div>
      </div>

      <div className="editor-abajo">
        <LineaDeTiempo
          bloques={bloques}
          escenas={vista.tiempos.escenas}
          notas={notasUbicadas}
          duracion={vista.tiempos.duracion}
          fps={fps}
          seleccion={elegida?.id ?? null}
          notaElegida={pestana === 'notas' ? notaElegida : null}
          musica={borrador.musica ? borrador.musica.archivo.replace(/^musica\//, '') : null}
          reproductor={reproductor}
          acciones={acciones}
          estado={estado}
          onSeleccionar={(idEscena) => {
            setSeleccion(idEscena);
            setPestana('escena');
          }}
          onMover={mover}
          onDuplicar={duplicar}
          onBorrar={borrar}
          onAgregar={() => setAgregando(true)}
          onMusica={() => setPestana('musica')}
          onCrearNota={crearNota}
          onElegirNota={(idNota) => {
            setNotaElegida(idNota);
            setPestana('notas');
          }}
        />
      </div>

      {agregando && <SelectorPlantilla onElegir={agregar} onCerrar={() => setAgregando(false)} />}
    </section>
  );
};
