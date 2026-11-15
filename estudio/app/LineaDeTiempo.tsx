// Línea de tiempo: escenas como bloques (ancho según su duración), pista de notas para Claude,
// pista de voz con cada palabra, pista de música, regla precisa (hasta fotogramas), reloj con
// milisegundos, controles por fotograma, atajos de teclado y arrastrar para reordenar.
import type { PlayerRef } from '@remotion/player';
import { useEffect, useRef, useState, type FC, type MouseEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { TiempoEscena } from '../../src/tipos';

export type BloqueEscena = {
  id: string;
  numero: number;
  inicio: number;
  duracion: number;
  icono: string;
  tipo: string;
  texto: string;
  pendiente: boolean;
};

/** Nota ya ubicada en el tiempo del video (segundos absolutos). */
export type NotaEnLinea = { id: string; inicio: number; fin: number; texto: string; estado: 'pendiente' | 'hecha' };

type Props = {
  bloques: BloqueEscena[];
  /** Tiempos de la vista previa: se usan para dibujar cada palabra de la voz en su momento. */
  escenas: TiempoEscena[];
  notas: NotaEnLinea[];
  duracion: number;
  fps: number;
  seleccion: string | null;
  notaElegida: string | null;
  musica: string | null;
  reproductor: RefObject<PlayerRef | null>;
  /** Botones de guardar, generar voz y renderizar. */
  acciones: ReactNode;
  /** Aviso de trabajo en curso o error, debajo de la barra. */
  estado?: ReactNode;
  onSeleccionar: (id: string) => void;
  onMover: (desde: number, hasta: number) => void;
  onDuplicar: (id: string) => void;
  onBorrar: (id: string) => void;
  onAgregar: () => void;
  onMusica: () => void;
  onCrearNota: (desde: number, hasta: number) => void;
  onElegirNota: (id: string) => void;
};

// Píxeles por segundo de cada nivel de zoom. En el último, un fotograma mide unos 11 px.
const ZOOMS = [10, 16, 24, 36, 54, 80, 120, 180, 260, 340];
const MARGEN = 10;

/** "1:05.250": minutos, segundos y milisegundos. */
export const tiempoPreciso = (segundos: number) => {
  const ms = Math.max(0, Math.round(segundos * 1000));
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};

// Etiqueta de la regla con los decimales justos para el intervalo.
const etiquetaRegla = (segundos: number, intervalo: number) => {
  const decimales = intervalo >= 1 ? 0 : intervalo >= 0.5 ? 1 : 2;
  const m = Math.floor(segundos / 60 + 1e-9);
  const s = segundos - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(decimales)}`;
};

/** Fotograma actual del reproductor, actualizado en vivo. */
const useFotograma = (reproductor: RefObject<PlayerRef | null>) => {
  const [fotograma, setFotograma] = useState(0);
  useEffect(() => {
    const r = reproductor.current;
    if (!r) return;
    const actualizar = (e: { detail: { frame: number } }) => setFotograma(e.detail.frame);
    setFotograma(r.getCurrentFrame());
    r.addEventListener('frameupdate', actualizar);
    r.addEventListener('seeked', actualizar);
    return () => {
      r.removeEventListener('frameupdate', actualizar);
      r.removeEventListener('seeked', actualizar);
    };
  }, [reproductor]);
  return fotograma;
};

/** Marca roja que sigue al reproductor y se mantiene a la vista. */
const Cabezal: FC<{ reproductor: RefObject<PlayerRef | null>; fps: number; pps: number; contenedor: RefObject<HTMLDivElement | null> }> = ({
  reproductor, fps, pps, contenedor,
}) => {
  const fotograma = useFotograma(reproductor);
  const x = (fotograma / fps) * pps;
  useEffect(() => {
    const caja = contenedor.current;
    if (!caja) return;
    if (x < caja.scrollLeft + 30 || x > caja.scrollLeft + caja.clientWidth - 60) caja.scrollLeft = Math.max(0, x - caja.clientWidth * 0.3);
  }, [x, contenedor]);
  return <div className="cabezal" style={{ left: x + MARGEN }} />;
};

/** Reloj con milisegundos y número de fotograma. */
const Reloj: FC<{ reproductor: RefObject<PlayerRef | null>; fps: number; duracion: number }> = ({ reproductor, fps, duracion }) => {
  const fotograma = useFotograma(reproductor);
  return (
    <span className="reloj" title="Tiempo actual / duración total · fotograma (hay 30 por segundo)">
      <strong>{tiempoPreciso(fotograma / fps)}</strong>
      <span className="tenue"> / {tiempoPreciso(duracion)}</span>
      <span className="fotograma">fotograma {fotograma}</span>
    </span>
  );
};

export const LineaDeTiempo: FC<Props> = ({
  bloques, escenas, notas, duracion, fps, seleccion, notaElegida, musica, reproductor, acciones, estado,
  onSeleccionar, onMover, onDuplicar, onBorrar, onAgregar, onMusica, onCrearNota, onElegirNota,
}) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);
  // Arrastre de bloques con el puntero: si se mueve más de 6 px es arrastre; si no, es un clic.
  const arrastre = useRef<{ indice: number; x0: number; activo: boolean } | null>(null);
  // Tramo que se está marcando en la pista de notas (en segundos).
  const [tramo, setTramo] = useState<{ desde: number; hasta: number } | null>(null);

  // Zoom inicial: el mayor con el que cabe todo el video a la vista.
  const zoomQueCabe = () => {
    const ancho = (contenedor.current?.clientWidth ?? 800) - 150;
    return Math.max(0, ZOOMS.findLastIndex((pps) => pps * duracion <= ancho));
  };
  const [zoom, setZoom] = useState(3);
  useEffect(() => {
    setZoom(zoomQueCabe());
  }, []);
  const pps = ZOOMS[zoom];
  const ancho = Math.max(duracion * pps, 200);
  const segundoEn = (e: { clientX: number }, elemento: HTMLElement) => (e.clientX - elemento.getBoundingClientRect().left) / pps;
  const aFotograma = (s: number) => Math.round(Math.min(duracion, Math.max(0, s)) * fps) / fps;

  // Zoom con Ctrl/⌘ + rueda (o pellizco en el trackpad).
  useEffect(() => {
    const caja = contenedor.current;
    if (!caja) return;
    const rueda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(ZOOMS.length - 1, Math.max(0, z + (e.deltaY < 0 ? 1 : -1))));
    };
    caja.addEventListener('wheel', rueda, { passive: false });
    return () => caja.removeEventListener('wheel', rueda);
  }, []);

  const irAFotograma = (f: number) => {
    const r = reproductor.current;
    if (!r) return;
    r.pause();
    r.seekTo(Math.min(Math.round(duracion * fps) - 1, Math.max(0, Math.round(f))));
  };
  const irA = (segundo: number) => irAFotograma(segundo * fps);
  const mover = (fotogramas: number) => irAFotograma((reproductor.current?.getCurrentFrame() ?? 0) + fotogramas);
  const saltarEscena = (direccion: -1 | 1) => {
    const ahora = (reproductor.current?.getCurrentFrame() ?? 0) / fps;
    const inicios = bloques.map((b) => b.inicio);
    const siguiente = direccion > 0 ? inicios.find((s) => s > ahora + 0.001) : [...inicios].reverse().find((s) => s < ahora - 0.05);
    irA(siguiente ?? (direccion < 0 ? 0 : ahora));
  };

  // Atajos: espacio reproduce/pausa, ←/→ un fotograma, Mayús + ←/→ un segundo.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
      const r = reproductor.current;
      if (!r) return;
      if (e.key === ' ') {
        e.preventDefault();
        r.toggle();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const paso = e.shiftKey ? fps : 1;
        r.pause();
        r.seekTo(Math.min(Math.round(duracion * fps) - 1, Math.max(0, r.getCurrentFrame() + (e.key === 'ArrowRight' ? paso : -paso))));
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [reproductor, fps, duracion]);

  const clicEnRegla = (e: MouseEvent<HTMLDivElement>) => irA(segundoEn(e, e.currentTarget));

  // --- Reordenar bloques ---
  const destinoEn = (x: number) => {
    const hijos = [...(pista.current?.querySelectorAll<HTMLElement>('.bloque') ?? [])];
    const i = hijos.findIndex((h) => {
      const r = h.getBoundingClientRect();
      return x < r.left + r.width / 2;
    });
    return i < 0 ? hijos.length : i;
  };
  const terminarArrastre = (x: number, id: string, inicio: number) => {
    const a = arrastre.current;
    arrastre.current = null;
    setArrastrando(null);
    setDestino(null);
    if (!a) return;
    if (!a.activo) {
      onSeleccionar(id);
      irA(inicio);
      return;
    }
    const d = destinoEn(x);
    if (d !== a.indice && d !== a.indice + 1) onMover(a.indice, d > a.indice ? d - 1 : d);
  };

  // --- Marcar un tramo en la pista de notas ---
  const empezarTramo = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.nota')) return;
    const s = aFotograma(segundoEn(e, e.currentTarget));
    e.currentTarget.setPointerCapture(e.pointerId);
    setTramo({ desde: s, hasta: s });
  };
  const moverTramo = (e: PointerEvent<HTMLDivElement>) => {
    if (tramo) setTramo({ ...tramo, hasta: aFotograma(segundoEn(e, e.currentTarget)) });
  };
  const terminarTramo = () => {
    if (!tramo) return;
    const desde = Math.min(tramo.desde, tramo.hasta);
    const hasta = Math.max(tramo.desde, tramo.hasta);
    setTramo(null);
    if ((hasta - desde) * pps >= 6) onCrearNota(desde, hasta);
    else irA(desde);
  };

  // Regla: marcas principales con texto cada ~80 px y marcas menores entre ellas.
  const INTERVALOS = [1 / fps, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30];
  const mayor = INTERVALOS.find((i) => i * pps >= 80) ?? 30;
  const divisiones = mayor < 0.1 ? 1 : mayor === 0.1 ? 3 : mayor === 2 ? 4 : 5;
  const menor = mayor / divisiones;
  const marcas: { s: number; mayor: boolean }[] = [];
  for (let k = 0; k * menor <= duracion + 1e-6; k++) marcas.push({ s: k * menor, mayor: k % divisiones === 0 });

  return (
    <div className="linea-de-tiempo">
      <div className="linea-barra">
        <div className="botones izquierda">{acciones}</div>
        <div className="transporte">
          <button className="boton texto" onClick={() => saltarEscena(-1)} title="Escena anterior">
            ⏮
          </button>
          <button className="boton texto" onClick={() => mover(-1)} title="Un fotograma atrás (←)">
            ◀
          </button>
          <Reloj reproductor={reproductor} fps={fps} duracion={duracion} />
          <button className="boton texto" onClick={() => mover(1)} title="Un fotograma adelante (→)">
            ▶
          </button>
          <button className="boton texto" onClick={() => saltarEscena(1)} title="Escena siguiente">
            ⏭
          </button>
        </div>
        <div className="zoom">
          <button className="boton texto" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} title="Alejar (Ctrl + rueda)">
            −
          </button>
          <button className="boton texto pequeno" onClick={() => setZoom(zoomQueCabe())} title="Ver todo el video">
            Ajustar
          </button>
          <button className="boton texto" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} title="Acercar (Ctrl + rueda)">
            +
          </button>
        </div>
      </div>
      {estado}
      <div className="linea-scroll" ref={contenedor}>
        <div className="linea-contenido" style={{ width: ancho + 150 + MARGEN * 2 }}>
          <div className="regla" style={{ width: ancho }} onClick={clicEnRegla}>
            {marcas.map((m) => (
              <span key={m.s.toFixed(4)} className={m.mayor ? 'mayor' : 'menor'} style={{ left: m.s * pps }}>
                {m.mayor && etiquetaRegla(m.s, mayor)}
              </span>
            ))}
          </div>

          {/* Notas para Claude: arrastra para marcar un tramo. */}
          <div
            className="pista-notas"
            style={{ width: ancho }}
            onPointerDown={empezarTramo}
            onPointerMove={moverTramo}
            onPointerUp={terminarTramo}
            onPointerCancel={() => setTramo(null)}
          >
            {notas.length === 0 && !tramo && <span className="pista-ayuda">Arrastra aquí para marcar un tramo y dejarle una nota a Claude</span>}
            {notas.map((n) => (
              <div
                key={n.id}
                className={`nota ${n.estado} ${n.id === notaElegida ? 'elegida' : ''}`}
                style={{ left: n.inicio * pps, width: Math.max(8, (n.fin - n.inicio) * pps) }}
                title={`${tiempoPreciso(n.inicio)} → ${tiempoPreciso(n.fin)}\n${n.texto || '(sin texto)'}`}
                onClick={() => {
                  onElegirNota(n.id);
                  irA(n.inicio);
                }}
              >
                {n.estado === 'hecha' ? '✓ ' : '✎ '}
                {n.texto || 'Nota nueva'}
              </div>
            ))}
            {tramo && (
              <div
                className="nota marcando"
                style={{ left: Math.min(tramo.desde, tramo.hasta) * pps, width: Math.abs(tramo.hasta - tramo.desde) * pps }}
              >
                {tiempoPreciso(Math.min(tramo.desde, tramo.hasta))} → {tiempoPreciso(Math.max(tramo.desde, tramo.hasta))}
              </div>
            )}
          </div>

          <div className="pista-escenas" ref={pista}>
            {bloques.map((b, i) => (
              <div
                key={b.id}
                className={`bloque ${b.id === seleccion ? 'elegido' : ''} ${b.pendiente ? 'pendiente' : ''} ${arrastrando === i ? 'arrastrando' : ''}`}
                style={{ width: b.duracion * pps }}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  arrastre.current = { indice: i, x0: e.clientX, activo: false };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const a = arrastre.current;
                  if (!a) return;
                  if (!a.activo && Math.abs(e.clientX - a.x0) > 6) {
                    a.activo = true;
                    setArrastrando(a.indice);
                  }
                  if (a.activo) setDestino(destinoEn(e.clientX));
                }}
                onPointerUp={(e) => terminarArrastre(e.clientX, b.id, b.inicio)}
                onPointerCancel={() => {
                  arrastre.current = null;
                  setArrastrando(null);
                  setDestino(null);
                }}
                title={`${b.texto}\n${tiempoPreciso(b.inicio)} → ${tiempoPreciso(b.inicio + b.duracion)}`}
              >
                {destino === i && arrastrando !== null && <span className="marca-soltar izquierda" />}
                {destino === i + 1 && arrastrando !== null && i === bloques.length - 1 && <span className="marca-soltar derecha" />}
                <div className="bloque-cabeza">
                  <span className="bloque-numero">{b.numero}</span>
                  <span className="bloque-icono" title={b.tipo}>
                    {b.icono}
                  </span>
                  <span className="bloque-duracion">{b.duracion.toFixed(2)} s</span>
                </div>
                <div className="bloque-texto">{b.texto}</div>
                {b.pendiente && <div className="bloque-aviso">voz por generar</div>}
                {b.id === seleccion && (
                  <div className="bloque-acciones" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
                    <button title="Duplicar escena" onClick={() => onDuplicar(b.id)}>
                      ⧉
                    </button>
                    <button title="Borrar escena" disabled={bloques.length === 1} onClick={() => onBorrar(b.id)}>
                      🗑
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button className="bloque-agregar" onClick={onAgregar} title="Agregar una escena">
              + Escena
            </button>
          </div>

          {/* Pista de voz: cada palabra en el momento exacto en que se dice. */}
          <div className="pista-voz" style={{ width: ancho }}>
            {escenas.flatMap((e) =>
              e.palabras.map((p, k) => {
                const inicio = e.inicio + p.inicio;
                return (
                  <span
                    key={`${e.id}-${k}`}
                    className={e.audio ? '' : 'estimada'}
                    style={{ left: inicio * pps, width: Math.max(2, (p.fin - p.inicio) * pps - 1) }}
                    title={`${p.texto}  ${tiempoPreciso(inicio)} → ${tiempoPreciso(e.inicio + p.fin)}`}
                    onClick={() => irA(inicio)}
                  >
                    {p.texto}
                  </span>
                );
              }),
            )}
          </div>

          <div className="pista-musica" style={{ width: ancho }} onClick={onMusica}>
            {musica ? <span>♪ {musica}</span> : <span className="tenue">+ Agregar música de fondo</span>}
          </div>
          <Cabezal reproductor={reproductor} fps={fps} pps={pps} contenedor={contenedor} />
        </div>
      </div>
    </div>
  );
};
