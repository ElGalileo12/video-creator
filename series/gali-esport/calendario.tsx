// Los dos calendarios del ROL ORGANIZADOR, fieles a la app (mismos textos y colores):
// - Pestaña «Calendario» del torneo (app/(dashboard)/organizer/tournaments/[id]/calendar/CalendarClient.tsx), azul cielo:
//   la vista «Mes» con las insignias de cada partido, «Próximos partidos», «Leyenda» y el detalle de un día. La vista
//   «Semana» no se muestra (está a medio hacer en la app).
// - «Calendario» del menú (app/(dashboard)/organizer/calendar/CalendarClient.tsx), violeta (#7c3aed): «Vista global de
//   partidos en todos tus torneos», los filtros por torneo y los partidos agrupados por día. Sin «Exportar».
// La cuadrícula del mes se dibuja con medidas fijas (`celdaDia`, `pildora`) para que el 3D aterrice justo encima.
import { Calendar as IconoCalendario, ChevronLeft, ChevronRight, Clock, MapPin, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { apretado, PANTALLA, type Punto } from './computador';
import { AvatarEquipo } from './fases';
import { colorDe } from './equipos';
import { DETALLE, LATERAL } from './organizador';
import { FASE, fechaLarga, hora12, HOY, MES_COPA, type Partido, type PartidoGeneral, partidosDel, semanaCorta } from './partidos';
import { COPA } from './tema';

const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";
const CARD: CSSProperties = { background: '#fff', border: '1px solid #e7e3ee', borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)', boxSizing: 'border-box' };
const CIELO = '#0284c7';

/** Colores de cada estado en el calendario del torneo (insignias del mes y leyenda). */
export const ESTADO_MES = {
  FINISHED: { dot: '#10b981', bg: '#ecfdf5' },
  IN_PROGRESS: { dot: '#ef4444', bg: '#fef2f2' },
  PENDING: { dot: '#f59e0b', bg: '#fffbeb' },
  SCHEDULED: { dot: '#0ea5e9', bg: '#f0f9ff' },
};

// --- Medidas de la vista «Mes» (píxeles de la app, con la página sin bajar) ----------------------------------------

const SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
/** Celdas vacías antes del día 1 (la semana empieza el lunes). */
const INICIO = (new Date(MES_COPA.anio, MES_COPA.mes, 1).getDay() + 6) % 7;
const CELDAS = Math.ceil((INICIO + MES_COPA.dias) / 7) * 7;

export const CAL = {
  x: DETALLE.x,
  ancho: DETALLE.ancho - 340 - 24,
  /** La barra de arriba (flechas, mes, «Hoy» y «Mes / Lista»). */
  barra: 38.75,
  /** Arriba de la tarjeta del mes (la barra y 18 px de separación). */
  tarjeta: DETALLE.cuerpo + 38.75 + 18,
  cabecera: 36.5,
  celda: { ancho: (DETALLE.ancho - 340 - 24 - 2) / 7, alto: 124 },
  filas: CELDAS / 7,
  derecha: { x: DETALLE.x + DETALLE.ancho - 340, ancho: 340 },
};
/** Alto de toda la tarjeta del mes. */
export const ALTO_MES = 1 + CAL.cabecera + 1 + CAL.filas * CAL.celda.alto + 1;

/** Fila y columna del día. */
export const lugarDia = (dia: number) => ({ fila: Math.floor((INICIO + dia - 1) / 7), col: (INICIO + dia - 1) % 7 });
/** La celda del día (rectángulo, con la página bajada `scroll` px). */
export const celdaDia = (dia: number, scroll = 0) => {
  const { fila, col } = lugarDia(dia);
  return { x: CAL.x + 1 + col * CAL.celda.ancho, y: CAL.tarjeta - scroll + 1 + CAL.cabecera + 1 + fila * CAL.celda.alto, ancho: CAL.celda.ancho, alto: CAL.celda.alto, col };
};
/** La insignia `k` del día (rectángulo). */
export const ALTO_PILDORA = 19.75;
export const pildora = (dia: number, k: number, scroll = 0) => {
  const c = celdaDia(dia, scroll);
  return { x: c.x + 8, y: c.y + 8 + 22 + 4 + k * (ALTO_PILDORA + 3), ancho: c.ancho - 16 - (c.col < 6 ? 1 : 0), alto: ALTO_PILDORA };
};

// --- Piezas ----------------------------------------------------------------------------------------------------------

/** Insignia de un partido en el día (DayMatchPill): «CD Norte v Halcones». */
export const Pildora: FC<{ p: Partido; style?: CSSProperties }> = ({ p, style }) => {
  const c = ESTADO_MES.SCHEDULED;
  return (
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 5, padding: '2px 6px', background: c.bg, borderRadius: 6, borderLeft: `2px solid ${c.dot}`, overflow: 'hidden', boxSizing: 'border-box', ...style }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, color: '#1f1929', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
        {p.local} <span style={{ color: '#a8a3b3', fontWeight: 700 }}>v</span> {p.visitante}
      </span>
    </div>
  );
};

const BotonIcono: FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: '#fff', border: '1px solid #e7e3ee', color: '#3a3344', boxSizing: 'border-box' }}>{children}</span>
);

const Seg: FC<{ on: boolean; children: ReactNode }> = ({ on, children }) => (
  <span style={{ background: on ? CIELO : 'transparent', color: on ? '#fff' : '#555064', borderRadius: 7, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, lineHeight: 1.5 }}>{children}</span>
);

const Proximo: FC<{ p: Partido }> = ({ p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: '#f0f9ff', color: '#0369a1', flexShrink: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{MES_COPA.corto}</div>
      <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{p.dia}</div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#14101a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.local} vs {p.visitante}
      </div>
      <div style={{ fontSize: 11, color: '#7a7388', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Clock size={10} />
        {p.hora}
        <span>·</span>
        <MapPin size={10} />
        {p.sede}
      </div>
    </div>
  </div>
);

const Leyenda: FC<{ color: string; texto: string }> = ({ color, texto }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 12, height: 4, borderRadius: 2, background: color }} />
    {texto}
  </div>
);

export type PropsCalendario = {
  partidos: Partido[];
  /** Se ven las insignias de los partidos (no, mientras las fichas 3D están encima). */
  insignias?: boolean;
  /** Resalta el día que se pulsa. */
  hoverDia?: { dia: number; t: number };
  apretarDia?: { dia: number; t: number };
};

/**
 * El contenido de la pestaña «Calendario» del torneo en la vista «Mes». Va dentro de `PaginaDetalle`; la cuadrícula
 * está posicionada en píxeles fijos (`celdaDia`) relativos a la esquina del contenido.
 */
export const PaginaCalendario: FC<PropsCalendario> = ({ partidos, insignias = true, hoverDia, apretarDia }) => {
  const proximos = [...partidos].sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora)).slice(0, 4);
  const top = CAL.tarjeta - DETALLE.cuerpo;
  const fila0 = top + 1 + CAL.cabecera + 1;
  return (
    <div style={{ position: 'relative', height: top + ALTO_MES }}>
      {/* Barra */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: CAL.ancho, height: CAL.barra, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BotonIcono>
            <ChevronLeft size={16} />
          </BotonIcono>
          <BotonIcono>
            <ChevronRight size={16} />
          </BotonIcono>
          <div style={{ margin: '0 6px', fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: '#14101a', textTransform: 'capitalize' }}>
            {MES_COPA.nombre} {MES_COPA.anio}
          </div>
          <span style={{ color: '#3a3344', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}>Hoy</span>
        </div>
        <div style={{ display: 'inline-flex', padding: 3, background: '#fff', border: '1px solid #e7e3ee', borderRadius: 10 }}>
          <Seg on>Mes</Seg>
          <Seg on={false}>Lista</Seg>
        </div>
      </div>
      {/* El mes */}
      <div style={{ ...CARD, position: 'absolute', left: 0, top, width: CAL.ancho, height: ALTO_MES, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8f6fb', borderBottom: '1px solid #f1eef6', height: CAL.cabecera + 1, boxSizing: 'border-box' }}>
          {SEMANA.map((d) => (
            <div key={d} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#555064', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
              {d}
            </div>
          ))}
        </div>
      </div>
      {Array.from({ length: CELDAS }, (_, idx) => {
        const dia = idx - INICIO + 1;
        const real = dia >= 1 && dia <= MES_COPA.dias;
        const fila = Math.floor(idx / 7);
        const col = idx % 7;
        const hoy = real && MES_COPA.mes === HOY.mes && dia === HOY.dia;
        const delDia = real ? partidosDel(dia, partidos) : [];
        const hover = hoverDia?.dia === dia ? hoverDia.t : 0;
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: 1 + col * CAL.celda.ancho,
              top: fila0 + fila * CAL.celda.alto,
              width: CAL.celda.ancho,
              height: CAL.celda.alto,
              padding: 8,
              boxSizing: 'border-box',
              background: hover > 0 ? `rgba(240,249,255,${hover})` : hoy ? '#f7fbff' : '#fff',
              borderRight: col === 6 ? 'none' : '1px solid #f1eef6',
              borderBottom: idx >= CELDAS - 7 ? 'none' : '1px solid #f1eef6',
              opacity: real ? 1 : 0.4,
              transform: apretarDia?.dia === dia ? apretado(apretarDia.t) : undefined,
              borderRadius: idx === CELDAS - 7 ? '0 0 0 15px' : idx === CELDAS - 1 ? '0 0 15px 0' : undefined,
            }}
          >
            {real && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: hoy ? '#fff' : '#3a3344', width: 22, height: 22, borderRadius: 6, background: hoy ? CIELO : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{dia}</div>
                {delDia.length > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#a8a3b3', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{delDia.length}</span>}
              </div>
            )}
          </div>
        );
      })}
      {insignias &&
        partidos.map((p) => {
          const k = partidosDel(p.dia, partidos).indexOf(p);
          const r = pildora(p.dia, k);
          return <Pildora key={p.id} p={p} style={{ left: r.x - CAL.x, top: r.y - DETALLE.cuerpo, width: r.ancho, height: r.alto }} />;
        })}
      {/* Columna derecha */}
      <div style={{ position: 'absolute', left: CAL.derecha.x - CAL.x, top: 0, width: 340, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...CARD, padding: 16 }}>
          <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#14101a' }}>Próximos partidos</div>
          {proximos.length === 0 ? (
            <div style={{ fontSize: 12.5, color: '#7a7388' }}>No hay partidos próximos.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {proximos.map((p) => (
                <Proximo key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
        <div style={{ ...CARD, padding: 16 }}>
          <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#14101a' }}>Leyenda</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#3a3344' }}>
            <Leyenda color="#10b981" texto="Finalizado" />
            <Leyenda color="#ef4444" texto="En vivo" />
            <Leyenda color="#0ea5e9" texto="Programado" />
            <Leyenda color="#f59e0b" texto="Por definir (TBD)" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- El detalle de un día (DayDetailModal) ---------------------------------------------------------------------------

const TarjetaDia: FC<{ p: Partido; divisor: boolean; resalteSede?: number }> = ({ p, divisor, resalteSede = 0 }) => {
  const nombre: CSSProperties = { fontSize: 15, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
  return (
    <div style={{ padding: '16px 18px', borderTop: divisor ? '1px solid #f1eef6' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 600, color: '#8b93a4' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: colorDe(FASE), flexShrink: 0 }} />
          <span>{FASE}</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, color: '#2563eb', background: '#eff6ff', whiteSpace: 'nowrap' }}>Programado</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 11, minWidth: 0 }}>
          <span style={nombre}>{p.local}</span>
          <AvatarEquipo nombre={p.local} tamano={34} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#a8a3b3', letterSpacing: '.1em', padding: '4px 9px', borderRadius: 8, background: '#f4f5f8' }}>VS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <AvatarEquipo nombre={p.visitante} tamano={34} />
          <span style={nombre}>{p.visitante}</span>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 12.5, color: '#7a7388', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color="#a8a3b3" />
          {p.hora}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cfd3dc' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, padding: '0 4px', margin: '0 -4px', background: resalteSede > 0 ? `rgba(224,242,254,${resalteSede})` : 'transparent', color: resalteSede > 0.5 ? '#0369a1' : '#7a7388' }}>
          <MapPin size={12} color="#a8a3b3" />
          {p.sede}
        </span>
      </div>
    </div>
  );
};

/** El detalle de un día: «2 partidos», «Sábado, 7 De Noviembre» y una tarjeta por partido. */
export const DetalleDia: FC<{ t: number; dia: number; partidos: Partido[]; resalteSede?: number }> = ({ t, dia, partidos, resalteSede = 0 }) => {
  if (t <= 0) return null;
  const delDia = partidosDel(dia, partidos);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(20,16,26,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: `blur(${2 * t}px)`, WebkitBackdropFilter: `blur(${2 * t}px)`, opacity: Math.min(1, t * 1.6) }}>
      <div style={{ ...CARD, width: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden', transform: `scale(${0.96 + 0.04 * t}) translateY(${(1 - t) * 10}px)` }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1eef6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CIELO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {delDia.length} {delDia.length === 1 ? 'partido' : 'partidos'}
            </div>
            <div style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 800, color: '#14101a', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{fechaLarga(dia)}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: '#f8f6fb', border: '1px solid #e7e3ee', color: '#3a3344', flexShrink: 0, boxSizing: 'border-box' }}>
            <X size={15} />
          </span>
        </div>
        <div>
          {delDia.map((p, i) => (
            <TarjetaDia key={p.id} p={p} divisor={i > 0} resalteSede={i === 0 ? resalteSede : 0} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Centro del día en la pantalla (para pulsarlo). */
export const centroDia = (dia: number, scroll = 0): Punto => {
  const c = celdaDia(dia, scroll);
  return { x: c.x + c.ancho / 2, y: c.y + c.alto / 2 + 14 };
};
/** La «X» del detalle de un día con dos partidos (medido). */
export const CERRAR_DETALLE: Punto = { x: PANTALLA.ancho / 2 + 186, y: 383.7 };
/** Las pastillas de filtro del calendario general (medidas): «Todos los torneos» y luego cada torneo. */
export const FILTROS_GENERAL: Punto[] = [
  { x: 271.9, y: 123.5 },
  { x: 416.6, y: 123.5 },
  { x: 566.5, y: 123.5 },
  { x: 736.4, y: 123.5 },
];

// --- «Calendario» del menú: todos los torneos (violeta) ---------------------------------------------------------------

const ESTADO_GENERAL = { SCHEDULED: { texto: 'Programado', color: '#3b82f6', bg: '#eff6ff' } };

const AvatarGeneral: FC<{ nombre: string }> = ({ nombre }) => (
  <div style={{ width: 28, height: 28, borderRadius: 28 * 0.3, background: '#7c3aed22', color: '#7c3aed', display: 'grid', placeItems: 'center', fontSize: 28 * 0.38, fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>{nombre.slice(0, 2).toUpperCase()}</div>
);

const FilaGeneral: FC<{ p: PartidoGeneral; resalteTorneo?: number }> = ({ p, resalteTorneo = 0 }) => {
  const equipo: CSSProperties = { fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{hora12(p.hora)}</span>
      </div>
      <div style={{ width: 1, height: 30, background: '#e2e8f0', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
        <AvatarGeneral nombre={p.local} />
        <span style={equipo}>{p.local}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', flexShrink: 0 }}>VS</span>
        <span style={equipo}>{p.visitante}</span>
        <AvatarGeneral nombre={p.visitante} />
      </div>
      <div style={{ flexShrink: 0, maxWidth: 160, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', borderRadius: 4, background: resalteTorneo > 0 ? `rgba(124,58,237,${0.14 * resalteTorneo})` : 'transparent', padding: '0 3px', margin: '0 -3px' }}>{p.torneo}</span>
        <span style={{ fontSize: 10, color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p.sede}</span>
      </div>
      <div style={{ padding: '3px 8px', borderRadius: 12, background: ESTADO_GENERAL.SCHEDULED.bg, color: ESTADO_GENERAL.SCHEDULED.color, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{ESTADO_GENERAL.SCHEDULED.texto}</div>
    </div>
  );
};

export type PropsGeneral = {
  partidos: PartidoGeneral[];
  /** El torneo filtrado ('' = «Todos los torneos»). */
  filtro: string;
  /** Resalta un filtro (el ratón encima) y lo aprieta. */
  hoverFiltro?: { torneo: string; t: number };
  apretarFiltro?: { torneo: string; t: number };
  /** Resalta el nombre del torneo en cada fila (0 → 1). */
  resalteTorneos?: number;
  /** Cuánto bajó la página (px). */
  scroll?: number;
};

/** Los torneos con partidos este mes, en el orden de los filtros. */
export const TORNEOS_GENERAL = (partidos: PartidoGeneral[]) => [COPA.nombre, ...new Set(partidos.map((p) => p.torneo).filter((t) => t !== COPA.nombre))];

/** La página «Calendario» del menú (va a la derecha de `MenuLateral`). */
export const PaginaCalendarioGeneral: FC<PropsGeneral> = ({ partidos, filtro, hoverFiltro, apretarFiltro, resalteTorneos = 0, scroll = 0 }) => {
  const lista = filtro ? partidos.filter((p) => p.torneo === filtro) : partidos;
  const dias = [...new Set(lista.map((p) => p.dia))];
  const pastilla = (torneo: string, texto: string) => {
    const on = filtro === torneo;
    const hover = hoverFiltro?.torneo === torneo ? hoverFiltro.t : 0;
    return (
      <span
        key={torneo || 'todos'}
        style={{
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: on ? '#7c3aed' : hover > 0 ? `rgba(245,243,255,${hover})` : '#fff',
          color: on ? '#fff' : hover > 0.5 ? '#7c3aed' : '#64748b',
          boxShadow: on ? '0 2px 8px rgba(124,58,237,0.25)' : hover > 0 ? `0 0 0 ${2.5 * hover}px rgba(124,58,237,0.45), 0 1px 3px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.08)',
          transform: apretarFiltro?.torneo === torneo ? apretado(apretarFiltro.t) : hover > 0 ? `scale(${1 + 0.06 * hover})` : undefined,
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}
      >
        {texto}
      </span>
    );
  };
  const navegar: CSSProperties = { padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center' };
  return (
    <div style={{ position: 'absolute', left: LATERAL, top: 0, right: 0, bottom: 0, background: '#f6f8fb', overflow: 'hidden' }}>
      <div style={{ padding: 28, transform: `translateY(${-scroll}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
          <div>
            <div style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Calendario</div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Vista global de partidos en todos tus torneos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {pastilla('', 'Todos los torneos')}
          {TORNEOS_GENERAL(partidos).map((t) => pastilla(t, t))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={navegar}>
            <ChevronLeft size={14} />
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', textTransform: 'capitalize', minWidth: 170, textAlign: 'center' }}>
            {MES_COPA.nombre} de {MES_COPA.anio}
          </span>
          <span style={navegar}>
            <ChevronRight size={14} />
          </span>
          <span style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12 }}>Hoy</span>
        </div>
        {dias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e9edf3' }}>
            <IconoCalendario size={44} color="#e2e8f0" />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Sin partidos programados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dias.map((dia) => (
              <div key={dia} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 54, flexShrink: 0, textAlign: 'center', background: '#fff', borderRadius: 12, padding: '10px 6px', border: '1px solid #e9edf3', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{semanaCorta(dia)}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.15 }}>{String(dia).padStart(2, '0')}</div>
                  <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{MES_COPA.corto}</div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e9edf3', overflow: 'hidden' }}>
                  {lista
                    .filter((p) => p.dia === dia)
                    .map((p) => (
                      <FilaGeneral key={p.id} p={p} resalteTorneo={resalteTorneos} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
