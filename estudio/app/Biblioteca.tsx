// Pantalla principal: los cortos (con filtro por categoría) y los pedidos pendientes. Con formato «horizontal»
// es el apartado «Videos completos»: los videos largos para YouTube que unen varios cortos.
import { useEffect, useState, type FC } from 'react';
import { proyectos } from '../../src/proyectos';
import { api, type EstadoProyecto, type Pedido } from './api';
import { EstadoVideo, formatearTiempo } from './comun';
import { useEventos } from './eventos';

const TODOS = '';
const claveFiltro = (formato: Formato) => (formato === 'horizontal' ? 'estudio:categoria-completos' : 'estudio:categoria');

// El filtro elegido se recuerda en este navegador (si se puede).
const leerFiltro = (formato: Formato) => {
  try {
    return localStorage.getItem(claveFiltro(formato)) ?? TODOS;
  } catch {
    return TODOS;
  }
};
const guardarFiltro = (formato: Formato, valor: string) => {
  try {
    localStorage.setItem(claveFiltro(formato), valor);
  } catch {
    // Sin almacenamiento, el filtro dura solo esta visita.
  }
};

type Formato = EstadoProyecto['formato'];

// El formato sale del código del video (src/proyectos.ts) y, si todavía no está registrado, del servidor.
const formatoDe = (v: EstadoProyecto): Formato => proyectos.find((p) => p.id === v.id)?.formato ?? v.formato ?? 'vertical';

const TarjetaVideo: FC<{ v: EstadoProyecto }> = ({ v }) => (
  <a className="tarjeta-video" href={formatoDe(v) === 'horizontal' ? `#/completos/${v.id}` : `#/proyecto/${v.id}`}>
    <div className={`miniatura ${formatoDe(v) === 'horizontal' ? 'ancha' : ''}`}>{v.portada ? <img src={v.portada} alt="" /> : <span>Sin portada</span>}</div>
    <div className="datos">
      <h3>{v.titulo}</h3>
      <p className="tenue">
        {v.duracion ? formatearTiempo(v.duracion) : '—'} · {v.escenas} escenas
      </p>
      <EstadoVideo proyecto={v} />
      {v.notasPendientes > 0 && (
        <span className="etiqueta aviso">
          {v.notasPendientes} {v.notasPendientes === 1 ? 'nota' : 'notas'} para Claude
        </span>
      )}
    </div>
  </a>
);

const Grilla: FC<{ lista: EstadoProyecto[]; anchos: boolean }> = ({ lista, anchos }) => (
  <div className={`grilla-videos ${anchos ? 'anchos' : ''}`}>
    {lista.map((v) => (
      <TarjetaVideo key={v.id} v={v} />
    ))}
  </div>
);

/** Una categoría partida en divisiones (p. ej. Gali Esport: Entrenador, Organizador, Jugador), cada una del video más antiguo al más nuevo. */
const Divisiones: FC<{ nombres: string[]; lista: EstadoProyecto[]; anchos: boolean }> = ({ nombres, lista, anchos }) => {
  const porFecha = [...lista].sort((a, b) => (a.creado ?? 0) - (b.creado ?? 0));
  const sueltos = porFecha.filter((v) => !v.division || !nombres.includes(v.division));
  const secciones = nombres.map((nombre) => ({ nombre, videos: porFecha.filter((v) => v.division === nombre) }));
  if (sueltos.length) secciones.push({ nombre: 'Sin división', videos: sueltos });
  return (
    <>
      {secciones.map(({ nombre, videos }) => (
        <div key={nombre} className="division">
          <h3>
            {nombre} <span className="cuenta">{videos.length}</span>
          </h3>
          {videos.length ? <Grilla lista={videos} anchos={anchos} /> : <p className="tenue">Todavía no hay videos de {nombre.toLowerCase()}.</p>}
        </div>
      ))}
    </>
  );
};

export const Biblioteca: FC<{ formato?: Formato }> = ({ formato = 'vertical' }) => {
  const completos = formato === 'horizontal';
  const [todos, setVideos] = useState<EstadoProyecto[] | null>(null);
  const videos = todos && todos.filter((v) => formatoDe(v) === formato);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [divisiones, setDivisiones] = useState<Record<string, string[]>>({});
  const [filtro, setFiltro] = useState(() => leerFiltro(formato));
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    api.proyectos().then(setVideos).catch((e) => setError(e.message));
    api.categorias().then(setCategorias).catch(() => {});
    api.divisiones().then(setDivisiones).catch(() => {});
    api.pedidos().then(setPedidos).catch(() => {});
  };
  useEffect(cargar, []);
  useEventos((e) => {
    if ((e.tipo === 'trabajo' && e.estado) || e.tipo === 'archivos') cargar();
  });

  const [porCancelar, setPorCancelar] = useState<string | null>(null);
  const cancelar = async (pedido: Pedido) => {
    await api.borrarPedido(pedido.archivo);
    setPorCancelar(null);
    cargar();
  };

  const abiertos = completos ? [] : pedidos.filter((p) => p.estado !== 'hecho');
  const hechos = completos ? [] : pedidos.filter((p) => p.estado === 'hecho');

  const [porBorrarHechos, setPorBorrarHechos] = useState(false);
  const borrarHechos = async () => {
    await api.borrarPedidosHechos();
    setPorBorrarHechos(false);
    cargar();
  };

  // Categorías con al menos un video, en el orden guardado; las que no estén en la lista, al final.
  const conVideos = videos ? [...new Set([...categorias, ...videos.map((v) => v.categoria)])].filter((c) => videos.some((v) => v.categoria === c)) : [];
  const activo = conVideos.includes(filtro) ? filtro : TODOS;
  const elegir = (categoria: string) => {
    setFiltro(categoria);
    guardarFiltro(formato, categoria);
  };
  const grupos = (activo === TODOS ? conVideos : [activo]).map((c) => ({ categoria: c, lista: videos?.filter((v) => v.categoria === c) ?? [] }));

  return (
    <section className="pagina">
      <div className="titulo-pagina">
        <h1>{completos ? 'Videos completos' : 'Tus videos'}</h1>
        {!completos && (
          <a className="boton primario" href="#/nuevo">
            + Video nuevo
          </a>
        )}
      </div>
      {completos && (
        <p className="tenue subtitulo-pagina">
          Videos largos en horizontal para YouTube, hechos uniendo cortos. Se editan igual que un corto. Para armar uno nuevo,
          pídemelo en el chat (por ejemplo: <b>«une los capítulos 8 al 14 de BitBang»</b>).
        </p>
      )}

      {(abiertos.length > 0 || hechos.length > 0) && (
        <div className="caja pedidos">
          <div className="cabeza-pedidos">
            <h2>Pedidos pendientes</h2>
            {hechos.length > 0 &&
              (porBorrarHechos ? (
                <span className="confirmar">
                  ¿Borrar {hechos.length === 1 ? 'el pedido ya hecho' : `los ${hechos.length} pedidos ya hechos`}? Tus videos no
                  se tocan.
                  <button className="boton texto" onClick={borrarHechos}>
                    Sí
                  </button>
                  <button className="boton texto" onClick={() => setPorBorrarHechos(false)}>
                    No
                  </button>
                </span>
              ) : (
                <button className="boton texto" onClick={() => setPorBorrarHechos(true)}>
                  Borrar pedidos ya hechos ({hechos.length})
                </button>
              ))}
          </div>
          {abiertos.length === 0 && <p className="tenue sin-pedidos">No hay pedidos esperando.</p>}
          <ul>
            {abiertos.map((p) => (
              <li key={p.archivo}>
                <div>
                  <strong>{p.tema}</strong>
                  {p.detalles && <p>{p.detalles}</p>}
                  {p.imagenes && p.imagenes.length > 0 && (
                    <div className="imagenes-pedido">
                      {p.imagenes.map((img) => (
                        <figure key={img.archivo} title={img.uso === 'video' ? 'Se usará en el video' : 'De referencia'}>
                          <img src={`/pedidos/${p.archivo.replace(/\.json$/, '')}/${img.archivo}`} alt="" />
                          {img.uso === 'video' && <figcaption>en el video</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}
                  <small>
                    {p.estado === 'en curso' ? 'Claude lo está haciendo…' : 'Esperando a Claude'} · unos {p.duracion} s
                    {p.categoria && ` · ${p.categoria}`}
                  </small>
                </div>
                <div className="acciones-pedido">
                  <a className="boton" href={`#/pedido/${p.archivo.replace(/\.json$/, '')}`}>
                    Editar
                  </a>
                  {p.estado === 'pendiente' &&
                    (porCancelar === p.archivo ? (
                      <span className="confirmar">
                        ¿Cancelarlo?
                        <button className="boton texto" onClick={() => cancelar(p)}>
                          Sí
                        </button>
                        <button className="boton texto" onClick={() => setPorCancelar(null)}>
                          No
                        </button>
                      </span>
                    ) : (
                      <button className="boton texto" onClick={() => setPorCancelar(p.archivo)}>
                        Cancelar
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
          {abiertos.length > 0 && (
            <p className="ayuda">
              Para que los haga, escríbeme en el chat: <b>«haz los videos pendientes»</b>.
            </p>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {!videos && !error && <p className="tenue">Cargando…</p>}
      {videos && videos.length === 0 && (
        <p className="tenue">{completos ? 'Todavía no hay videos completos.' : 'Todavía no hay videos. Pide el primero en «Video nuevo».'}</p>
      )}

      {conVideos.length > 1 && (
        <div className="filtro-categorias" role="tablist">
          <button role="tab" className={`chip ${activo === TODOS ? 'activa' : ''}`} onClick={() => elegir(TODOS)}>
            Todos <span className="cuenta">{videos?.length}</span>
          </button>
          {conVideos.map((c) => (
            <button key={c} role="tab" className={`chip ${activo === c ? 'activa' : ''}`} onClick={() => elegir(c)}>
              {c} <span className="cuenta">{videos?.filter((v) => v.categoria === c).length}</span>
            </button>
          ))}
        </div>
      )}

      {grupos.map(({ categoria, lista }) => (
        <div key={categoria} className="grupo-videos">
          {conVideos.length > 1 && activo === TODOS && <h2>{categoria}</h2>}
          {divisiones[categoria] ? (
            <Divisiones nombres={divisiones[categoria]} lista={lista} anchos={completos} />
          ) : (
            <Grilla lista={lista} anchos={completos} />
          )}
        </div>
      ))}
    </section>
  );
};
