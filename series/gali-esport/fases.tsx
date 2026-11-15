// Pestaña «Fases y partidos» del detalle del torneo y sus ventanas, fieles a la app (mismos textos y colores):
// - app/(dashboard)/organizer/tournaments/[id]/stages/StagesClient.tsx: «Sin fases creadas», el encabezado de la fase
//   («Lista»/«Árbol» y «Agregar partido»), la barra de fases con «Nueva fase» y las tarjetas de partido de una fase sin
//   grupos (BracketMatch: toda la tarjeta abre «Editar partido»). Azul cielo (#0284c7).
// - CreateStageModal.tsx («Nueva fase») y CreateMatchModal.tsx («Nuevo partido»): Tailwind, botón blue-600.
// - UpdateMatchModal.tsx («Editar partido»: marcador, Estado, Fecha, Hora y Sede), azul cielo.
// No se muestra «Re-sortear» (solo sale en fases con grupos sorteados). Todo en píxeles de la app; va dentro de
// `PaginaDetalle` (organizador.tsx), y las ventanas encima de toda la pantalla.
import { Calendar, ChevronDown, Clock, List, MapPin, Network, Pencil, Plus, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { apretado, Cursor, PANTALLA, type Punto } from './computador';
import { colorDe, iniciales, sombra } from './equipos';
import { DETALLE } from './organizador';
import { fechaCampo, fechaCorta, FASE, type FilaTabla, type Partido } from './partidos';
import { mezclar } from '../../src/escena';
import { GRIS } from './tema';

const CARD: CSSProperties = { background: '#fff', border: '1px solid #e7e3ee', borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)', boxSizing: 'border-box' };
const CIELO = '#0284c7';

/** Avatar de equipo con iniciales (StagesClient: degradado del color del equipo). */
export const AvatarEquipo: FC<{ nombre: string; tamano?: number }> = ({ nombre, tamano = 28 }) => (
  <span style={{ width: tamano, height: tamano, borderRadius: tamano <= 28 ? 8 : tamano >= 48 ? 12 : 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: tamano * 0.36, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${colorDe(nombre)} 0%, ${sombra(colorDe(nombre), -18)} 100%)`, lineHeight: 1 }}>
    {iniciales(nombre)}
  </span>
);

// --- Medidas (en píxeles de la app, medidas en el navegador) -------------------------------------------------------

/** Esquina del contenido de la pestaña (con la página sin bajar). */
const X0 = DETALLE.x;
const Y0 = DETALLE.cuerpo;
const ANCHO = DETALLE.ancho;
const CENTRO = PANTALLA.ancho / 2;

/** Botón «Crear primera fase» del estado vacío. */
export const BOTON_PRIMERA_FASE: Punto = { x: X0 + ANCHO / 2, y: Y0 + 232.5 };
/** Botón «Agregar partido» del encabezado de la fase. */
export const BOTON_AGREGAR: Punto = { x: X0 + ANCHO - 76.5, y: Y0 + 37.7 };
/** Tarjeta «Nueva fase» de la barra de fases. */
export const BOTON_NUEVA_FASE: Punto = { x: X0 + 284.2, y: Y0 + 113.6 };
/** La tarjeta del partido `i` en la lista (rectángulo). */
export const ALTO_TARJETA = 127.5;
export const tarjetaPartido = (i: number) => ({ x: X0 + 4, y: Y0 + 180.8 + i * (ALTO_TARJETA + 14), ancho: 420, alto: ALTO_TARJETA });

// --- Estado vacío -------------------------------------------------------------------------------------------------

const botonCielo: CSSProperties = { display: 'inline-flex', alignItems: 'center', border: 'none', color: '#fff', fontWeight: 600, background: CIELO, boxShadow: '0 6px 16px rgba(2,132,199,0.22)', whiteSpace: 'nowrap', boxSizing: 'border-box' };

const SinFases: FC<{ hover: number; apretar: number }> = ({ hover, apretar }) => (
  <div style={{ ...CARD, padding: '56px 24px', textAlign: 'center' }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0f9ff', color: CIELO, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <Network size={26} />
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, color: '#14101a' }}>Sin fases creadas</div>
    <div style={{ fontSize: 13, color: '#7a7388', marginTop: 4, marginBottom: 18, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>Crea la primera fase para organizar partidos. Puedes hacer fase de grupos, eliminatorias o ligas.</div>
    <span style={{ ...botonCielo, gap: 8, padding: '10px 18px', borderRadius: 12, fontSize: 14, background: hover > 0 ? `color-mix(in srgb, #0369a1 ${hover * 100}%, ${CIELO})` : CIELO, transform: apretado(apretar) }}>
      <Plus size={15} />
      Crear primera fase
    </span>
  </div>
);

// --- Una fase con sus partidos ------------------------------------------------------------------------------------

/** Tarjeta de un partido de una fase sin grupos (BracketMatch): fase, fecha y hora, y los dos equipos. */
export const TarjetaPartido: FC<{ p: Partido; hover?: number; apretar?: number; style?: CSSProperties }> = ({ p, hover = 0, apretar = 0, style }) => {
  const fila = (nombre: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff' }}>
      <AvatarEquipo nombre={nombre} />
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#14101a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: '#3a3344', minWidth: 18, textAlign: 'right' }}>—</span>
    </div>
  );
  return (
    <div style={{ ...CARD, padding: 0, overflow: 'hidden', width: 420, transform: apretado(apretar), boxShadow: hover > 0 ? `0 0 0 ${2 * hover}px rgba(56,189,248,${0.7 * hover}), 0 8px 20px rgba(2,132,199,${0.16 * hover})` : CARD.boxShadow, ...style }}>
      <div style={{ padding: '6px 12px', background: '#f8f6fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#7a7388' }}>
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{FASE}</span>
        <span>
          {fechaCorta(p.dia)} · {p.hora}
        </span>
      </div>
      {fila(p.local)}
      <div style={{ height: 1, background: '#f1eef6' }} />
      {fila(p.visitante)}
    </div>
  );
};

export type PropsFases = {
  /** Sin fase: el estado vacío. Con fase: su encabezado, la barra de fases y sus partidos. */
  fase?: boolean;
  partidos?: Partido[];
  /** Cuántas tarjetas se ven; la última va entrando (parte decimal). */
  visibles?: number;
  hoverCrear?: number;
  apretarCrear?: number;
  hoverAgregar?: number;
  apretarAgregar?: number;
  /** La tarjeta que se pulsa. */
  hoverTarjeta?: { i: number; t: number };
  apretarTarjeta?: { i: number; t: number };
  /** Huecos punteados en vez de tarjetas (para el 3D, cuando las tarjetas se despegan). */
  sinTarjetas?: boolean;
};

/** El contenido de la pestaña «Fases y partidos». */
export const PaginaFases: FC<PropsFases> = ({ fase, partidos = [], visibles = partidos.length, hoverCrear = 0, apretarCrear = 0, hoverAgregar = 0, apretarAgregar = 0, hoverTarjeta, apretarTarjeta, sinTarjetas }) => {
  if (!fase) return <SinFases hover={hoverCrear} apretar={apretarCrear} />;
  const n = Math.ceil(visibles);
  const total = Math.floor(visibles + 0.0001);
  const seg = (on: boolean): CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: on ? '#fff' : 'transparent', color: on ? CIELO : '#64748b', boxShadow: on ? '0 1px 3px rgba(31,25,41,0.12)' : 'none' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#14101a' }}>{FASE}</div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7a7388' }}>
            {total} partidos · {FASE}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
            <span style={seg(true)}>
              <List size={14} />
              Lista
            </span>
            <span style={seg(false)}>
              <Network size={14} />
              Árbol
            </span>
          </div>
          <span style={{ ...botonCielo, gap: 6, padding: '7px 13px', borderRadius: 10, fontSize: 13, background: hoverAgregar > 0 ? `color-mix(in srgb, #0369a1 ${hoverAgregar * 100}%, ${CIELO})` : CIELO, transform: apretado(apretarAgregar) }}>
            <Plus size={14} strokeWidth={2.4} />
            Agregar partido
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, paddingBottom: 6 }}>
        <div style={{ flexShrink: 0, minWidth: 210, maxWidth: 250, padding: '12px 14px', borderRadius: 14, background: '#fff', border: '1.5px solid #38bdf8', boxShadow: '0 8px 20px rgba(2,132,199,0.16)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, fontSize: 12, fontWeight: 800, flexShrink: 0, background: CIELO, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{FASE}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#e0f2fe', overflow: 'hidden' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0369a1', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>0/{total} jug.</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, minWidth: 124, padding: '12px 14px', borderRadius: 14, background: 'transparent', border: '1.5px dashed #cbd5e1', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, boxSizing: 'border-box' }}>
          <Plus size={15} strokeWidth={2.5} />
          Nueva fase
        </div>
      </div>

      {partidos.length === 0 || n === 0 ? (
        <div style={{ ...CARD, padding: '28px 20px', textAlign: 'center', fontSize: 13, color: '#7a7388' }}>Sin partidos en esta fase. Agrega el primero.</div>
      ) : (
        <div style={{ padding: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 420 }}>
            {partidos.slice(0, n).map((p, i) => {
              const entra = i === n - 1 ? visibles - (n - 1) : 1;
              if (sinTarjetas) return <div key={p.id} style={{ height: ALTO_TARJETA, borderRadius: 16, border: '1.5px dashed #cbd5e1', boxSizing: 'border-box' }} />;
              return (
                <TarjetaPartido
                  key={p.id}
                  p={p}
                  hover={hoverTarjeta?.i === i ? hoverTarjeta.t : 0}
                  apretar={apretarTarjeta?.i === i ? apretarTarjeta.t : 0}
                  style={entra < 1 ? { opacity: Math.min(1, entra * 2), transform: `translateY(${(1 - entra) * -16}px) scale(${0.96 + 0.04 * entra})` } : undefined}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Ventanas de Tailwind: «Nueva fase» y «Nuevo partido» ------------------------------------------------------------

/** Ventana centrada sobre toda la pantalla, con su fondo oscuro. `t` (0 → 1) la abre. */
const Ventana: FC<{ t: number; ancho: number; fondo: string; desenfoque: number; children: ReactNode; style?: CSSProperties }> = ({ t, ancho, fondo, desenfoque, children, style }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: fondo, opacity: Math.min(1, t * 1.6), backdropFilter: `blur(${desenfoque * t}px)`, WebkitBackdropFilter: `blur(${desenfoque * t}px)` }}>
      <div style={{ width: ancho, background: '#fff', transform: `scale(${0.96 + 0.04 * t}) translateY(${(1 - t) * 10}px)`, ...style }}>{children}</div>
    </div>
  ) : null;

const etiquetaTw: CSSProperties = { fontSize: 12, lineHeight: '16px', fontWeight: 500, color: GRIS.g700 };
const campoTw = (foco: boolean): CSSProperties => ({ border: `1px solid ${GRIS.g200}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, lineHeight: '20px', color: GRIS.g900, background: '#fff', boxShadow: foco ? '0 0 0 2px #3b82f6' : 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, minHeight: 42, whiteSpace: 'nowrap' });
const Requerido = () => <span style={{ color: '#ef4444' }}> *</span>;

const CabeceraTw: FC<{ titulo: string }> = ({ titulo }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${GRIS.g100}` }}>
    <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: GRIS.g900 }}>{titulo}</div>
    <span style={{ padding: 6, borderRadius: 8, display: 'flex' }}>
      <X size={20} color={GRIS.g400} />
    </span>
  </div>
);

const botonTw: CSSProperties = { flex: 1, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, borderRadius: 12, fontSize: 14, lineHeight: '20px', boxSizing: 'border-box' };

const BotonesTw: FC<{ crear: string; apretar: number; hover: number }> = ({ crear, apretar, hover }) => (
  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
    <span style={{ ...botonTw, border: `1px solid ${GRIS.g200}`, color: GRIS.g600 }}>Cancelar</span>
    <span style={{ ...botonTw, background: hover > 0.5 ? '#1d4ed8' : '#2563eb', color: '#fff', transform: apretado(apretar) }}>{crear}</span>
  </div>
);

const Selector: FC<{ valor: string; foco?: boolean; tenue?: boolean }> = ({ valor, foco = false, tenue = false }) => (
  <div style={campoTw(foco)}>
    <span style={{ flex: 1, color: tenue ? GRIS.g900 : GRIS.g900 }}>{valor}</span>
    <ChevronDown size={16} color={GRIS.g700} strokeWidth={2.2} />
  </div>
);

/** Campos y botón de «Nueva fase» (medidos). */
export const CAMPO_FASE = { nombre: { x: CENTRO, y: 453.5 }, crear: { x: CENTRO + 86.5, y: 671.5 } };

export type PropsNuevaFase = { t: number; f: number; nombre: string; foco?: boolean; hoverCrear?: number; apretarCrear?: number };

/** «Nueva fase»: Nombre, Tipo y Orden. */
export const VentanaNuevaFase: FC<PropsNuevaFase> = ({ t, f, nombre, foco = false, hoverCrear = 0, apretarCrear = 0 }) => (
  <Ventana t={t} ancho={384} fondo="rgba(0,0,0,0.4)" desenfoque={4} style={{ borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
    <CabeceraTw titulo="Nueva fase" />
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={etiquetaTw}>
          Nombre<Requerido />
        </div>
        <div style={campoTw(foco)}>
          <span>
            {nombre || (!foco && <span style={{ color: GRIS.g400 }}>ej: Fase de grupos A</span>)}
            {foco && <Cursor f={f} alto={18} />}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={etiquetaTw}>Tipo</div>
        <Selector valor="Fase de grupos" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={etiquetaTw}>Orden</div>
        <div style={campoTw(false)}>1</div>
      </div>
      <BotonesTw crear="Crear fase" apretar={apretarCrear} hover={hoverCrear} />
    </div>
  </Ventana>
);

/** Campos y botón de «Nuevo partido» según cuántos equipos ya se eligieron (sin equipo hay un campo más). */
export const camposPartido = (local: boolean, visitante: boolean) => {
  const n = Number(local) + Number(visitante);
  const baja = 19 * n;
  return {
    local: { x: CENTRO, y: 415.5 + baja },
    visitante: { x: CENTRO, y: 531.5 + baja - (local ? 38 : 0) },
    fecha: { x: CENTRO, y: 647.5 + baja - 38 * n },
    crear: { x: CENTRO + 86.5, y: 709.5 + baja - 38 * n },
  };
};

export type PropsNuevoPartido = { t: number; local?: string; visitante?: string; fecha?: string; foco?: 'local' | 'visitante' | 'fecha' | null; hoverCrear?: number; apretarCrear?: number };

/** «Nuevo partido»: Equipo local, Equipo visitante y Fecha programada. Sin equipo elegido sale el campo «TBD». */
export const VentanaNuevoPartido: FC<PropsNuevoPartido> = ({ t, local, visitante, fecha, foco = null, hoverCrear = 0, apretarCrear = 0 }) => {
  const equipo = (etiqueta: string, valor: string | undefined, ref: string, enfocado: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={etiquetaTw}>
        {etiqueta}
        <Requerido />
      </div>
      <Selector valor={valor ?? '— TBD (por definir) —'} foco={enfocado} />
      {!valor && <div style={{ border: `1px solid ${GRIS.g200}`, borderRadius: 12, padding: '8px 12px', fontSize: 12, lineHeight: '16px', color: GRIS.g400, boxSizing: 'border-box' }}>{ref}</div>}
    </div>
  );
  return (
    <Ventana t={t} ancho={384} fondo="rgba(0,0,0,0.4)" desenfoque={4} style={{ borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
      <CabeceraTw titulo="Nuevo partido" />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {equipo('Equipo local', local, 'ej: Ganador Grupo A', foco === 'local')}
        {equipo('Equipo visitante', visitante, 'ej: Ganador Grupo B', foco === 'visitante')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={etiquetaTw}>Fecha programada</div>
          <div style={campoTw(foco === 'fecha')}>
            <span style={{ flex: 1, color: fecha ? GRIS.g900 : GRIS.g500 }}>{fecha ?? 'dd/mm/aaaa, --:--'}</span>
            <Calendar size={15} color={GRIS.g800} />
          </div>
        </div>
        <BotonesTw crear="Crear partido" apretar={apretarCrear} hover={hoverCrear} />
      </div>
    </Ventana>
  );
};

// --- «Editar partido» (UpdateMatchModal.tsx) --------------------------------------------------------------------------

/** UpdateMatchModal usa una paleta de 8 colores, sólidos. */
const PALETA_8 = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#db2777', '#ca8a04'];
export const colorModal = (nombre: string) => {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA_8[h % PALETA_8.length];
};

const etiquetaEd: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#1f1929', marginBottom: 6, letterSpacing: '-0.01em' };
const campoEd = (resalte: number, foco: boolean): CSSProperties => ({
  width: '100%',
  padding: '11px 13px',
  border: `1px solid ${foco ? '#38bdf8' : '#e7e3ee'}`,
  borderRadius: 12,
  fontSize: 14,
  lineHeight: '21px',
  background: resalte > 0 ? `rgba(224,242,254,${resalte})` : '#fff',
  color: '#14101a',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
  boxShadow: resalte > 0 ? `0 0 0 ${3 * resalte}px rgba(56,189,248,0.35)` : 'none',
});

export const VENTANA_EDITAR = { x: (PANTALLA.ancho - 560) / 2, y: (PANTALLA.alto - 645) / 2, ancho: 560, alto: 645 };
/** El recuadro del marcador y los centros de los campos y del botón (medidos). */
export const CAMPO_EDITAR = {
  marcador: { x: 464, y: 290, ancho: 512, alto: 198.5 },
  estado: { x: CENTRO, y: 551.5 },
  fecha: { x: 589, y: 639 },
  hora: { x: 851, y: 639 },
  sede: { x: CENTRO, y: 725.5 },
  guardar: { x: 886.6, y: 802 },
};

export type CampoEditar = 'fecha' | 'hora' | 'sede';
export type PropsEditar = {
  t: number;
  f: number;
  p: Partido;
  /** Lo escrito en «Sede». */
  sede: string;
  foco?: CampoEditar | null;
  resalte?: Partial<Record<CampoEditar, number>>;
  hoverGuardar?: number;
  apretarGuardar?: number;
  /** El recuadro del marcador se va (0 → 1) y deja su hueco (para el 3D). */
  sinMarcador?: number;
  /** Sin el fondo oscuro (cuando lo pone otra capa). */
  sinFondo?: boolean;
  /** Lo que dice «Estado» (por defecto «Programado»). */
  estado?: string;
  resalteEstado?: number;
  /** El menú del campo Estado abierto (0 → 1) y la opción bajo el ratón. */
  menuEstado?: { t: number; hover?: string };
};

/** Las opciones de «Estado» (STATUS_OPTIONS de UpdateMatchModal.tsx). */
export const ESTADOS_PARTIDO = ['Por definir', 'Programado', 'En curso', 'Finalizado', 'Aplazado', 'Cancelado'];
const ALTO_OPCION = 22;
/** Centro de una opción del menú de Estado (el menú del Mac pone la opción elegida sobre el campo). */
export const opcionEstado = (opcion: string, elegida = 'Programado'): Punto => ({
  x: CAMPO_EDITAR.estado.x - 180,
  y: CAMPO_EDITAR.estado.y + (ESTADOS_PARTIDO.indexOf(opcion) - ESTADOS_PARTIDO.indexOf(elegida)) * ALTO_OPCION,
});

/** El menú de un campo de selección como lo dibuja Chrome en el Mac (menú del sistema). */
const MenuSistema: FC<{ t: number; opciones: string[]; elegida: string; hover?: string; x: number; y: number; ancho: number }> = ({ t, opciones, elegida, hover, x, y, ancho }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y - opciones.indexOf(elegida) * ALTO_OPCION - ALTO_OPCION / 2 - 5, width: ancho, padding: '5px 0', borderRadius: 8, background: 'rgba(246,246,246,0.97)', border: '0.5px solid rgba(0,0,0,0.18)', boxShadow: '0 10px 30px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.05)', fontFamily: '-apple-system, "SF Pro Text", Helvetica, sans-serif', fontSize: 13, color: '#1d1d1f', opacity: Math.min(1, t * 2), zIndex: 140, boxSizing: 'border-box' }}>
      {opciones.map((o) => {
        const on = o === hover;
        return (
          <div key={o} style={{ position: 'relative', height: ALTO_OPCION, margin: '0 5px', padding: '0 10px 0 24px', borderRadius: 4, display: 'flex', alignItems: 'center', background: on ? '#0A64D2' : 'transparent', color: on ? '#fff' : '#1d1d1f' }}>
            {o === elegida && <span style={{ position: 'absolute', left: 8, fontSize: 12, fontWeight: 600 }}>✓</span>}
            {o}
          </div>
        );
      })}
    </div>
  ) : null;

const Escudo: FC<{ nombre: string }> = ({ nombre }) => (
  <span style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colorModal(nombre), color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{iniciales(nombre)}</span>
);

/** La ventana «Editar partido» con el marcador vacío, Estado «Programado», Fecha, Hora y Sede. */
export const VentanaEditarPartido: FC<PropsEditar> = ({ t, f, p, sede, foco = null, resalte = {}, hoverGuardar = 0, apretarGuardar = 0, sinMarcador = 0, sinFondo = false, estado = 'Programado', resalteEstado = 0, menuEstado }) => {
  if (t <= 0) return null;
  const equipo = (nombre: string) => (
    <div style={{ textAlign: 'center', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Escudo nombre={nombre} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#14101a', marginTop: 8, whiteSpace: 'nowrap' }}>{nombre}</div>
      <div style={{ width: '100%', padding: '8px 0', marginTop: 8, border: '1px solid #e7e3ee', borderRadius: 12, textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#a8a3b3', background: '#fff', boxSizing: 'border-box', lineHeight: '33px' }}>—</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, t * 1.6) }}>
      {!sinFondo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(20, 16, 26, 0.5)', backdropFilter: `blur(${2 * t}px)`, WebkitBackdropFilter: `blur(${2 * t}px)` }} />}
      <div style={{ position: 'relative', width: 560, height: VENTANA_EDITAR.alto, background: '#fff', borderRadius: 18, boxShadow: '0 28px 80px rgba(20, 16, 26, 0.32)', display: 'flex', flexDirection: 'column', transform: `scale(${0.96 + 0.04 * t}) translateY(${(1 - t) * 10}px)`, boxSizing: 'border-box' }}>
        <div style={{ padding: '22px 24px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CIELO, flexShrink: 0 }}>
            <Pencil size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#14101a' }}>Editar partido</div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7a7388' }}>{FASE}</p>
          </div>
          <span style={{ display: 'inline-flex', padding: 8, borderRadius: 10, color: '#3a3344' }}>
            <X size={18} />
          </span>
        </div>
        <div style={{ flex: 1, padding: '6px 24px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ background: '#f8f6fb', border: '1px solid #e7e3ee', borderRadius: 16, padding: 16, opacity: 1 - sinMarcador }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'start' }}>
                {equipo(p.local)}
                <div style={{ color: '#cfcad6', fontSize: 24, fontWeight: 800, paddingTop: 60 }}>–</div>
                {equipo(p.visitante)}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#a8a3b3', textAlign: 'center' }}>
                Solo los partidos en estado <strong style={{ color: '#7a7388' }}>Finalizado</strong> suman en la tabla de posiciones.
              </div>
            </div>
            {sinMarcador > 0 && <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1.5px dashed #cbd5e1', opacity: sinMarcador, boxSizing: 'border-box' }} />}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={etiquetaEd}>Estado</div>
            <div style={campoEd(resalteEstado, (menuEstado?.t ?? 0) > 0)}>{estado}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={etiquetaEd}>Fecha</div>
              <div style={campoEd(resalte.fecha ?? 0, foco === 'fecha')}>
                <span style={{ flex: 1 }}>{fechaCampo(p.dia)}</span>
                <Calendar size={15} color="#3a3344" />
              </div>
            </div>
            <div>
              <div style={etiquetaEd}>Hora</div>
              <div style={campoEd(resalte.hora ?? 0, foco === 'hora')}>
                <span style={{ flex: 1 }}>{p.hora}</span>
                <Clock size={15} color="#3a3344" />
              </div>
            </div>
          </div>
          <div>
            <div style={etiquetaEd}>Sede</div>
            <div style={campoEd(resalte.sede ?? 0, foco === 'sede')}>
              <span>
                {sede || (foco !== 'sede' && <span style={{ color: '#a8a3b3' }}>ej: Estadio Azteca, Ciudad de México</span>)}
                {foco === 'sede' && <Cursor f={f} alto={18} color="#14101a" />}
              </span>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1eef6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14, border: '1px solid #e7e3ee', background: '#fff', color: '#1f1929' }}>Cancelar</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14, border: 'none', background: hoverGuardar > 0.5 ? '#0369a1' : CIELO, color: '#fff', boxShadow: '0 6px 16px rgba(2,132,199,0.22)', transform: apretado(apretarGuardar) }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Guardar cambios
          </span>
        </div>
      </div>
      {menuEstado && <MenuSistema t={menuEstado.t} opciones={ESTADOS_PARTIDO} elegida="Programado" hover={menuEstado.hover} x={VENTANA_EDITAR.x + 24} y={CAMPO_EDITAR.estado.y} ancho={512} />}
    </div>
  );
};

// =============================================================================================================
// Una fase con grupos (desde `sabado-de-partidos`): StagesClient.tsx con la fase sorteada en «Grupo A» y «Grupo B».
// Encabezado («N grupos · M partidos programados» y «Agregar partido»; sin «Re-sortear», que desaparece cuando ya se
// jugó algún partido), la barra de fases con «n/N jug.» y una tarjeta por grupo con «Tabla» / «Partidos».
// =============================================================================================================

const MONO_SIS = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";

export type EstadoPartido = 'Programado' | 'En vivo' | 'Finalizado';
export type PartidoGrupo = Partido & { estado: EstadoPartido; goles?: [number, number] };

/** Pastillas de estado de las tarjetas (STATUS_C). */
const ESTADO_C: Record<EstadoPartido, { color: string; bg: string }> = {
  Programado: { color: '#1577c2', bg: '#e8f2fd' },
  'En vivo': { color: '#e1366b', bg: '#fdecf2' },
  Finalizado: { color: '#1f9d57', bg: '#e4f6ec' },
};

/** Tarjeta de un partido dentro de un grupo (MatchCard, «opción C»), con el lápiz de «Editar partido». */
export const TarjetaPartidoGrupo: FC<{ p: PartidoGrupo; hoverLapiz?: number; apretarLapiz?: number; resalte?: number }> = ({ p, hoverLapiz = 0, apretarLapiz = 0, resalte = 0 }) => {
  const c = ESTADO_C[p.estado];
  const hecho = p.estado === 'Finalizado';
  const equipo = (nombre: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', minWidth: 0 }}>
      <AvatarEquipo nombre={nombre} tamano={34} />
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2230', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{nombre}</div>
    </div>
  );
  return (
    <div style={{ border: '1px solid #e9ebf1', borderRadius: 15, overflow: 'hidden', background: hecho ? 'linear-gradient(180deg, #fbfdfb, #ffffff)' : '#fff', boxShadow: resalte > 0 ? `0 0 0 ${2 * resalte}px rgba(56,189,248,${0.8 * resalte}), 0 10px 26px -24px rgba(20,22,34,.4)` : '0 10px 26px -24px rgba(20,22,34,.4)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f4f5f8', borderBottom: '1px solid #f0f1f6' }}>
        <Clock size={14} color="#8b93a4" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1d2230', whiteSpace: 'nowrap' }}>
          {fechaCorta(p.dia)} · {p.hora}
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color }} />
          {p.estado}
        </span>
        <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 7, color: hoverLapiz > 0.5 ? CIELO : '#8b93a4', background: `rgba(2,132,199,${0.12 * hoverLapiz})`, flexShrink: 0, transform: apretado(apretarLapiz) }}>
          <Pencil size={13} />
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, padding: '16px 14px' }}>
        {equipo(p.local)}
        {p.goles ? (
          <div style={{ fontFamily: MONO_SIS, fontWeight: 800, fontSize: 20, color: '#1d2230', whiteSpace: 'nowrap' }}>
            {p.goles[0]}
            <span style={{ color: '#8b93a4', margin: '0 3px' }}>–</span>
            {p.goles[1]}
          </div>
        ) : (
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8b93a4', letterSpacing: '.1em' }}>VS</div>
        )}
        {equipo(p.visitante)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderTop: '1px solid #f0f1f6', fontSize: 12 }}>
        <MapPin size={14} color="#8b93a4" style={{ flexShrink: 0 }} />
        <span style={{ whiteSpace: 'nowrap', color: '#515a6e', fontWeight: 600 }}>{p.sede}</span>
      </div>
    </div>
  );
};

export const ALTO_FILA_TABLA = 43;

/**
 * La tabla del grupo (StandingsTable): #, Equipo, PJ, DG y Pts. Los dos primeros clasifican (número en verde).
 * Con `despues` y `t` (0 → 1) las filas se acomodan solas: cada equipo viaja de su puesto de `antes` al de `despues`
 * y sus cifras cambian a mitad de camino.
 */
export const TablaGrupo: FC<{ antes: FilaTabla[]; despues?: FilaTabla[]; t?: number; resalte?: { equipo: string; t: number } }> = ({ antes, despues = antes, t = 0, resalte }) => {
  const cab: CSSProperties = { padding: '9px 8px', fontSize: 10.5, fontWeight: 700, color: '#7a7388', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', lineHeight: '15.75px' };
  const celda: CSSProperties = { padding: '9px 8px', fontSize: 13, color: '#3a3344', fontVariantNumeric: 'tabular-nums', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };
  const columnas = '34px 1fr 36px 42px 44px';
  const nuevo = t >= 0.5;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: columnas, background: '#f8f6fb' }}>
        <div style={cab}>#</div>
        <div style={{ ...cab, textAlign: 'left' }}>Equipo</div>
        <div style={cab}>PJ</div>
        <div style={cab}>DG</div>
        <div style={{ ...cab, background: '#f0f9ff', color: '#0369a1' }}>Pts</div>
      </div>
      <div style={{ position: 'relative', height: antes.length * ALTO_FILA_TABLA }}>
        {antes.map((a) => {
          const i0 = antes.indexOf(a);
          const d = despues.find((x) => x.equipo === a.equipo) ?? a;
          const i1 = despues.indexOf(d);
          const fila = nuevo ? d : a;
          const i = nuevo ? i1 : i0;
          const clasifica = i < 2;
          const r = resalte?.equipo === a.equipo ? resalte.t : 0;
          const sube = i1 !== i0 ? Math.sin(t * Math.PI) : 0;
          return (
            <div key={a.equipo} style={{ position: 'absolute', left: 0, right: 0, top: mezclar(t, i0, i1) * ALTO_FILA_TABLA, height: ALTO_FILA_TABLA, display: 'grid', gridTemplateColumns: columnas, borderTop: '1px solid #f1eef6', background: r > 0 ? `rgba(224,242,254,${0.9 * r})` : '#fff', boxShadow: sube > 0 ? `0 ${10 * sube}px ${24 * sube}px rgba(2,132,199,${0.25 * sube})` : undefined, zIndex: i1 < i0 ? 2 : 1, boxSizing: 'border-box', transform: sube > 0 && i1 < i0 ? `scale(${1 + 0.03 * sube})` : undefined }}>
              <div style={celda}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 6, fontWeight: 700, fontSize: 11.5, background: clasifica ? '#d1fae5' : 'transparent', color: clasifica ? '#047857' : '#555064' }}>{i + 1}</span>
              </div>
              <div style={{ ...celda, justifyContent: 'flex-start', gap: 8 }}>
                <AvatarEquipo nombre={a.equipo} tamano={24} />
                <span style={{ fontWeight: 600, color: '#14101a', fontSize: 12.5, whiteSpace: 'nowrap' }}>{a.equipo}</span>
              </div>
              <div style={celda}>{fila.pj}</div>
              <div style={{ ...celda, color: fila.dg > 0 ? '#047857' : fila.dg < 0 ? '#dc2626' : '#7a7388', fontWeight: 600 }}>
                {fila.dg > 0 ? '+' : ''}
                {fila.dg}
              </div>
              <div style={{ ...celda, fontWeight: 800, fontSize: 14, color: '#0369a1', background: '#f0f9ff' }}>{fila.pts}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 14px', fontSize: 11, color: '#7a7388', borderTop: '1px solid #f1eef6', background: '#f8f6fb', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: 2 }} />
          Clasifican
        </span>
        <span style={{ color: '#a8a3b3' }}>PJ jugados · DG diferencia · Pts puntos</span>
      </div>
    </div>
  );
};

export type PropsGrupo = {
  nombre: string;
  equipos: number;
  partidos: PartidoGrupo[];
  modo: 'tabla' | 'partidos';
  /** La tabla (antes y después de un resultado, con su avance `t`). */
  tabla: { antes: FilaTabla[]; despues?: FilaTabla[]; t?: number; resalte?: { equipo: string; t: number } };
  hoverLapiz?: { id: string; t: number };
  apretarLapiz?: { id: string; t: number };
  resaltePartido?: { id: string; t: number };
};

/** Tarjeta de un grupo (GroupCard): letra, nombre, «n equipos · m partidos» y el selector «Tabla» / «Partidos». */
export const TarjetaGrupo: FC<PropsGrupo> = ({ nombre, equipos, partidos, modo, tabla, hoverLapiz, apretarLapiz, resaltePartido }) => {
  const seg = (on: boolean): CSSProperties => ({ background: on ? CIELO : 'transparent', color: on ? '#fff' : '#555064', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, lineHeight: '18px' });
  return (
    <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1eef6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: '#e0f2fe', color: '#0369a1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{nombre.split(' ').pop()}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em', lineHeight: '21px' }}>{nombre}</div>
            <div style={{ fontSize: 11, color: '#7a7388', marginTop: 1, lineHeight: '16.5px' }}>
              {equipos} equipos · {partidos.length} partidos
            </div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', padding: 3, background: '#f1eef6', borderRadius: 8, flexShrink: 0 }}>
          <span style={seg(modo === 'tabla')}>Tabla</span>
          <span style={seg(modo === 'partidos')}>Partidos</span>
        </div>
      </div>
      {modo === 'tabla' ? (
        <TablaGrupo {...tabla} />
      ) : (
        <div style={{ padding: '16px 16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {partidos.map((p) => (
            <TarjetaPartidoGrupo key={p.id} p={p} hoverLapiz={hoverLapiz?.id === p.id ? hoverLapiz.t : 0} apretarLapiz={apretarLapiz?.id === p.id ? apretarLapiz.t : 0} resalte={resaltePartido?.id === p.id ? resaltePartido.t : 0} />
          ))}
        </div>
      )}
    </div>
  );
};

/** Medidas de la fase con grupos (con la página sin bajar). */
export const FASE_GRUPOS = {
  /** Donde empiezan las tarjetas de grupo y su ancho (dos columnas). */
  grupos: { y: Y0 + 176.8, ancho: (ANCHO - 18) / 2, hueco: 18 },
  cabeceraGrupo: 64.5,
  /** Las tarjetas de partido dentro de un grupo (modo «Partidos»). */
  partido: { arriba: 16, lado: 16, hueco: 12, alto: 175.4 },
  /** La tabla del grupo: cabecera de columnas (la primera fila empieza debajo). */
  cabeceraTabla: 33.75,
};
/** Rectángulo de la tarjeta de grupo `g` (0 = A, 1 = B). */
export const tarjetaGrupo = (g: number) => ({ x: X0 + g * (FASE_GRUPOS.grupos.ancho + FASE_GRUPOS.grupos.hueco), y: FASE_GRUPOS.grupos.y, ancho: FASE_GRUPOS.grupos.ancho });
/** Rectángulo de la tarjeta del partido `i` del grupo `g` (modo «Partidos»). */
export const partidoEnGrupo = (g: number, i: number) => {
  const c = tarjetaGrupo(g);
  const P = FASE_GRUPOS.partido;
  const ancho = (c.ancho - 2 - P.lado * 2 - P.hueco) / 2;
  return { x: c.x + 1 + P.lado + (i % 2) * (ancho + P.hueco), y: c.y + FASE_GRUPOS.cabeceraGrupo + P.arriba + Math.floor(i / 2) * (P.alto + P.hueco), ancho, alto: P.alto };
};
/** Centro del lápiz de la tarjeta de partido `i` del grupo `g`. */
export const lapizPartido = (g: number, i: number): Punto => {
  const r = partidoEnGrupo(g, i);
  return { x: r.x + r.ancho - 14 - 12, y: r.y + 1 + 22.5 };
};

export type PropsFaseGrupos = {
  grupos: PropsGrupo[];
  jugados: number;
  total: number;
};

/** La pestaña «Fases y partidos» con la fase de grupos sorteada. */
export const PaginaFaseGrupos: FC<PropsFaseGrupos> = ({ grupos, jugados, total }) => {
  const pct = total ? Math.round((jugados / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#14101a' }}>{FASE}</div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7a7388' }}>
            {grupos.length} grupos · {total} partidos programados
          </p>
        </div>
        <span style={{ ...botonCielo, gap: 6, padding: '7px 13px', borderRadius: 10, fontSize: 13 }}>
          <Plus size={14} strokeWidth={2.4} />
          Agregar partido
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, paddingBottom: 6 }}>
        <div style={{ flexShrink: 0, minWidth: 210, maxWidth: 250, padding: '12px 14px', borderRadius: 14, background: '#fff', border: '1.5px solid #38bdf8', boxShadow: '0 8px 20px rgba(2,132,199,0.16)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, fontSize: 12, fontWeight: 800, flexShrink: 0, background: CIELO, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{FASE}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#e0f2fe', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: CIELO, borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0369a1', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {jugados}/{total} jug.
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0, minWidth: 124, padding: '12px 14px', borderRadius: 14, background: 'transparent', border: '1.5px dashed #cbd5e1', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, boxSizing: 'border-box' }}>
          <Plus size={15} strokeWidth={2.5} />
          Nueva fase
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        {grupos.map((g) => (
          <TarjetaGrupo key={g.nombre} {...g} />
        ))}
      </div>
    </div>
  );
};
