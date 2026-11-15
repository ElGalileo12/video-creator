// CONVOCAR con una plantilla y lo que VE EL JUGADOR (desde `partidos-alineacion`), en escritorio y en la página de 1440
// (`ANCHO_U`), dentro de `MarcoUsuarios`. Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Equipo → «Eventos del equipo»: app/(dashboard)/coach/team/TeamEventsClient.tsx con components/layout/PageHeader.tsx
//   (tarjeta con la barrita de la marca), TeamEventKPIs, EventList y TeamEventRail (aproximados).
// - «Crear evento»: feature/coach/components/team/CreateTeamEventModal.tsx (tipo, sede, título, «Plantilla del equipo ·
//   opcional» con sus tarjetas LineupCard, fecha, hora, lugar, duración, descripción, RSVP, WhatsApp, recordatorio).
//   Al abrir, el tipo es Entrenamiento (con Enfoque y Cancha, aquí resumidos).
// - El jugador: components/layout/NavLinks.tsx (menú del jugador), PlayerHome.tsx con PlayerHeader y UpcomingEventsList
//   («Próximos eventos», «Detalles»), EventDetailModal.tsx (cabecera, InfoRow, «¿Vas a asistir?» con RsvpButtons: Voy /
//   Tal vez / No puedo y el estado «Confirmado») y LineupView.tsx («Alineación», «Eres titular · Juegas de …», «Vas de
//   suplente», «Capitán», la cancha con «Tú» en amarillo y «Suplentes · N»).
// - El aviso en la campanita: app/lib/event-push.ts (`notifyEventInApp`: «Partido: {título}», «{fecha} · {lugar} —
//   {equipo}») con el 📅 de NotificationBell (aquí dibujado).
import { CalendarDays, ChevronDown, Clock, FileText, FolderLock, Home, Lock, MapPin, MessagesSquare, Newspaper, Plus, Tag, User, X, CalendarCheck } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { Tonos } from './escuela-panel';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';
import { Cesped, jugadorA, type JugadorA, PLANTILLA_AMISTOSO, PLANTILLA_FESTIVAL, PLANTILLA_FINAL, type PlantillaA, ROLES_A, zonasDe, nombreCat } from './partidos-armador';
import { ANCHO_U } from './usuarios';

const caja = (x: number, y: number, ancho: number, alto: number) => ({ x, y, ancho, alto });
type Caja = ReturnType<typeof caja>;
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);
const SIDE = 176;
const X0 = SIDE + 24;
const AW = ANCHO_U - SIDE - 48;
const TEXTO = '#0F172A';
const TENUE = '#64748B';
const SUTIL = '#94A3B8';
const BORDE = '#E5E9F0';
const HUNDIDO = '#FAFBFC';
const PIZARRA = '#F1F5F9';

/** El partido de ejemplo. */
export const PARTIDO_P = {
  titulo: 'Academia Fénix vs Club Halcones',
  fecha: '21/11/2026',
  hora: '09:00 a. m.',
  lugar: 'Cancha Sede Norte',
  fechaLarga: 'Sábado, 21 de noviembre de 2026',
  horaCorta: '09:00',
  aviso: { titulo: 'Partido: Academia Fénix vs Club Halcones', cuerpo: 'sáb, 21 de nov, 9:00 a. m. · Cancha Sede Norte — Academia Fénix Bogotá' },
};

// =============================================================================================================
// Equipo → «Eventos del equipo»
// =============================================================================================================

/** El botón «Crear evento» de la cabecera. */
export const CREAR_EVENTO_P = caja(X0 + AW - 21 - 147, 76 + 24, 147, 40);

const KPIS_P = [
  { fondo: '#ECFDF5', color: '#16A34A', icono: () => <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, valor: '3', label: 'Próximos eventos', sub: 'próx. 30 días' },
  { fondo: '#F0FDF4', color: '#16A34A', icono: () => <polyline points="20 6 9 17 4 12" />, valor: '12/16', label: 'Confirmados próximo evento', sub: '75% del equipo' },
  { fondo: '#FFFBEB', color: '#D97706', icono: () => <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, valor: '4', label: 'Sin responder', sub: 'recordar al equipo' },
  { fondo: '#EFF6FF', color: '#2563EB', icono: () => <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, valor: '88%', label: 'Asistencia promedio', sub: 'últimos 30 días' },
];
const EVENTOS_P = [
  { dia: 'MAR', num: 17, mes: 'NOV', rel: 'EN 3 DÍAS', titulo: 'Entrenamiento Sub-13', hora: '05:00 p. m.', lugar: 'Cancha Sede Norte', rsvp: [12, 2, 0] },
  { dia: 'JUE', num: 19, mes: 'NOV', rel: 'EN 5 DÍAS', titulo: 'Entrenamiento Sub-13', hora: '05:00 p. m.', lugar: 'Cancha Sede Norte', rsvp: [9, 1, 1] },
];

/** Equipo → «Eventos del equipo» (Sub-13). `tn`: la marca de la escuela. */
export const PaginaEquipoP: FC<{ tn: Tonos; hoverCrear?: number; apretarCrear?: number; resalteCrear?: number }> = ({ tn, hoverCrear = 0, apretarCrear = 0, resalteCrear = 0 }) => {
  const listaW = AW - 320 - 20;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, fontFamily: instrument, color: TEXTO }}>
      <div style={{ position: 'absolute', left: X0, top: 76, width: AW, height: 88, boxSizing: 'border-box', borderRadius: 16, border: `1px solid ${BORDE}`, background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.04)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
          <span style={{ width: 4, borderRadius: 999, background: tn.b600 }} />
          <div style={{ padding: '2px 0' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em', fontFamily: schibsted }}>Eventos del equipo</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: TENUE }}>Gestiona y organiza los eventos de tu equipo</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px', boxSizing: 'border-box', borderRadius: 12, border: `1px solid ${BORDE}`, background: '#fff', fontSize: 14, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3B82F6' }} />
            Sub-13 <ChevronDown size={14} color={TENUE} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 147, height: 40, justifyContent: 'center', boxSizing: 'border-box', color: '#fff', fontWeight: 500, borderRadius: 12, fontSize: 14, background: hoverCrear > 0.5 ? tn.b700 : tn.b600, boxShadow: `0 1px 2px rgba(0,0,0,0.05)${resalteCrear > 0 ? `, ${anillo(resalteCrear)}` : ''}`, transform: hundir(apretarCrear) }}>
            <Plus size={16} /> Crear evento
          </div>
        </div>
      </div>
      {KPIS_P.map((k, i) => (
        <div key={k.label} style={{ position: 'absolute', left: X0 + i * ((AW - 48) / 4 + 16), top: 184, width: (AW - 48) / 4, height: 80, boxSizing: 'border-box', background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: k.fondo, color: k.color, display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <k.icono />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{k.valor}</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>{k.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: SUTIL }}>{k.sub}</p>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: X0, top: 284, width: listaW, height: 46, boxSizing: 'border-box', background: '#fff', border: `1px solid ${BORDE}`, borderRadius: 12, padding: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 520, height: 30, boxSizing: 'border-box', border: `1px solid ${BORDE}`, borderRadius: 8, background: HUNDIDO, fontSize: 12, color: SUTIL, display: 'flex', alignItems: 'center', paddingLeft: 12, gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUTIL} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          Buscar evento, autor o etiqueta...
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', background: PIZARRA, borderRadius: 8, padding: 3, gap: 2 }}>
          {['Próximos', 'Pasados', 'Todos'].map((s, i) => (
            <span key={s} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: i === 0 ? 600 : 500, background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? TEXTO : TENUE }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: X0 + 4, top: 352, width: listaW - 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUTIL }}>Esta semana 2</span>
        <div style={{ flex: 1, height: 1, background: BORDE }} />
      </div>
      {EVENTOS_P.map((ev, i) => (
        <div key={ev.num} style={{ position: 'absolute', left: X0, top: 376 + i * 96, width: listaW, height: 88, boxSizing: 'border-box', background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${BORDE}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 60, borderRadius: 10, border: `1px solid ${i === 0 ? tn.b600 : BORDE}`, background: i === 0 ? tn.b600 : HUNDIDO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: i === 0 ? 'rgba(255,255,255,0.75)' : TENUE }}>{ev.dia}</span>
            <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, margin: '2px 0', color: i === 0 ? '#fff' : TEXTO }}>{ev.num}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: i === 0 ? 'rgba(255,255,255,0.75)' : SUTIL }}>{ev.mes}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8' }}>Entrenamiento</span>
              <span style={{ padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: PIZARRA, color: TENUE, fontFamily: jetbrains }}>{ev.rel}</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{ev.titulo}</p>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: TENUE }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} color={SUTIL} /> {ev.hora}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} color={SUTIL} /> {ev.lugar}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, fontFamily: jetbrains, fontSize: 11, fontWeight: 600 }}>
            <span style={{ padding: '3px 8px', borderRadius: 999, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857' }}>✓ {ev.rsvp[0]}</span>
            <span style={{ padding: '3px 8px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>? {ev.rsvp[1]}</span>
            <span style={{ padding: '3px 8px', borderRadius: 999, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>✕ {ev.rsvp[2]}</span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: X0 + listaW + 20, top: 284, width: 320, height: 300, boxSizing: 'border-box', background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Noviembre 2026</span>
          <CalendarDays size={16} color={SUTIL} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 6, textAlign: 'center' }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 600, color: SUTIL }}>{d}</span>
          ))}
          {Array.from({ length: 35 }, (_, i) => i - 5).map((n, i) => {
            const dia = n;
            const valido = dia >= 1 && dia <= 30;
            const hoy = dia === 14;
            return (
              <div key={i} style={{ position: 'relative', height: 30, display: 'grid', placeItems: 'center' }}>
                {valido && <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: hoy ? 700 : 500, background: hoy ? tn.b600 : 'transparent', color: hoy ? '#fff' : TEXTO }}>{dia}</span>}
                {valido && [17, 19].includes(dia) && <span style={{ position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, background: '#3B82F6' }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =============================================================================================================
// «Crear evento» (CreateTeamEventModal)
// =============================================================================================================

const MW = 640;
const MB = 22;
const MIW = MW - 2 * MB;
const CABEZA_M = 82;
const PIE_M = 66;
const LINEUPS_P: PlantillaA[] = [PLANTILLA_FINAL, PLANTILLA_AMISTOSO, PLANTILLA_FESTIVAL];

export type DatosCrearEvento = {
  t: number;
  tipo: 'TRAINING' | 'MATCH';
  titulo: string;
  /** Plantilla elegida (id) o null = «Sin plantilla». */
  plantilla: string | null;
  fecha: string;
  hora: string;
  lugar: string;
  foco?: 'titulo' | 'fecha' | 'hora' | 'lugar' | null;
  publicando?: boolean;
  hover?: { partido?: number; plantilla?: string | null; publicar?: number };
  apretar?: { partido?: number; plantilla?: number; publicar?: number };
  resalte?: Partial<Record<'tipo' | 'titulo' | 'plantillas' | 'ayuda' | 'whatsapp' | 'cobertura', number>>;
};

/** Alturas de cada bloque (con su margen de abajo). */
const bloques = (tipo: DatosCrearEvento['tipo']) => {
  const b = { tipo: 24 + 68 + 14, enfoque: tipo === 'TRAINING' ? 24 + 3 * 54 + 22 + 14 : 0, sede: 24 + 35 + 6 + 16.5 + 14, cancha: tipo === 'TRAINING' ? 24 + 50 + 6 + 16.5 + 14 : 0, titulo: 24 + 38 + 14, plantilla: tipo === 'MATCH' ? 24 + 2 * 69 + 8 + 6 + 15.4 + 14 : 0, fecha: 24 + 38 + 14, lugar: 24 + 38 + 14, descripcion: 24 + 80 + 14, interruptor: 60 + 8, cobertura: 22.5 };
  return b;
};
const cuerpoM = (tipo: DatosCrearEvento['tipo']) => {
  const b = bloques(tipo);
  return 18 + b.tipo + b.enfoque + b.sede + b.cancha + b.titulo + b.plantilla + b.fecha + b.lugar + b.descripcion + 3 * b.interruptor + (tipo === 'MATCH' ? b.cobertura : 0) + 18;
};
/** Dónde queda todo en «Crear evento». */
export const CREAR_EVENTO_V = (vh: number, tipo: DatosCrearEvento['tipo']) => {
  const alto = CABEZA_M + cuerpoM(tipo) + PIE_M;
  const r = caja((ANCHO_U - MW) / 2, Math.max(16, Math.round((vh - alto) / 2)), MW, alto);
  const b = bloques(tipo);
  const x = r.x + MB;
  const y0 = r.y + CABEZA_M + 18;
  const yTitulo = y0 + b.tipo + b.enfoque + b.sede + b.cancha;
  const yPl = yTitulo + b.titulo;
  const yFecha = yPl + b.plantilla;
  const half = (MIW - 8) / 2;
  const yInt = yFecha + b.fecha + b.lugar + b.descripcion;
  return {
    r,
    tipo: (i: number) => caja(x + i * ((MIW - 24) / 5 + 6), y0 + 24, (MIW - 24) / 5, 68),
    titulo: caja(x, yTitulo + 24, MIW, 38),
    plantillas: caja(x, yPl + 24, MIW, 2 * 69 + 8),
    plantilla: (i: number) => caja(x + (i % 2) * (half + 8), yPl + 24 + Math.floor(i / 2) * 77, half, 69),
    ayuda: caja(x, yPl + 24 + 146 + 6, MIW, 16),
    fecha: caja(x, yFecha + 24, half + 2, 38),
    hora: caja(x + half + 10, yFecha + 24, half - 2, 38),
    lugar: caja(x, yFecha + b.fecha + 24, half + 2, 38),
    whatsapp: caja(x, yInt + b.interruptor, MIW, 60),
    publicar: caja(r.x + MW - MB - 122, r.y + alto - PIE_M + 14, 122, 38),
  };
};

const Etq: FC<{ children: ReactNode }> = ({ children }) => <div style={{ fontSize: 12, fontWeight: 500, color: TENUE, marginBottom: 6, height: 18, lineHeight: '18px' }}>{children}</div>;
const Ent: FC<{ valor?: string; ejemplo?: string; alto?: number; flecha?: boolean; foco?: boolean; resalte?: number; tn: Tonos }> = ({ valor, ejemplo, alto = 38, flecha, foco, resalte, tn }) => (
  <div style={{ height: alto, padding: '0 12px', border: `1px solid ${foco ? tn.b500 : BORDE}`, borderRadius: 8, background: foco ? '#fff' : HUNDIDO, fontSize: 13, color: valor ? TEXTO : SUTIL, display: 'flex', alignItems: alto > 40 ? 'flex-start' : 'center', paddingTop: alto > 40 ? 9 : 0, justifyContent: 'space-between', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: anillo(resalte) }}>
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {valor || ejemplo}
      {foco && <span style={{ display: 'inline-block', width: 1.5, height: 16, background: TEXTO, marginLeft: 1 }} />}
    </span>
    {flecha && <ChevronDown size={13} color={TENUE} />}
  </div>
);
const Interruptor: FC<{ etiqueta: string; descripcion: string; on: boolean; tn: Tonos; resalte?: number }> = ({ etiqueta, descripcion, on, tn, resalte }) => (
  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 12px', border: `1px solid ${BORDE}`, borderRadius: 9, background: HUNDIDO, marginBottom: 8, boxSizing: 'border-box', boxShadow: anillo(resalte) }}>
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: '19.5px' }}>{etiqueta}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: TENUE, lineHeight: '16.5px' }}>{descripcion}</p>
    </div>
    <span style={{ position: 'relative', width: 36, height: 20, borderRadius: 999, background: on ? tn.b600 : '#D9DFE8', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
    </span>
  </div>
);
const MiniCancha: FC = () => (
  <svg width="36" height="46" viewBox="0 0 36 46" style={{ flexShrink: 0, borderRadius: 6 }}>
    <defs>
      <linearGradient id="miniCanchaP" x1="0" y1="0" x2="0" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2A7D44" />
        <stop offset="50%" stopColor="#2F8A4B" />
        <stop offset="100%" stopColor="#2A7D44" />
      </linearGradient>
    </defs>
    <rect width="36" height="46" rx="6" fill="url(#miniCanchaP)" />
    {[0, 13, 26, 39].map((y) => (
      <rect key={y} x="0" y={y} width="36" height="6.5" fill="rgba(0,0,0,0.05)" />
    ))}
    <rect x="3" y="3" width="30" height="40" rx="1" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <line x1="3" y1="23" x2="33" y2="23" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
    <circle cx="18" cy="23" r="5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <circle cx="18" cy="23" r="1" fill="rgba(255,255,255,0.7)" />
    <rect x="9" y="3" width="18" height="7" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <rect x="13" y="3" width="10" height="3" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <rect x="9" y="36" width="18" height="7" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <rect x="13" y="40" width="10" height="3" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
  </svg>
);
const TarjetaLineup: FC<{ l: PlantillaA | null; elegida: boolean; tn: Tonos; hover?: boolean; apretar?: number; style?: CSSProperties }> = ({ l, elegida, tn, hover, apretar = 0, style }) => (
  <div style={{ height: 69, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${elegida ? tn.b600 : hover ? '#94A3B8' : BORDE}`, background: elegida ? tn.b50 : hover ? PIZARRA : l ? HUNDIDO : '#fff', boxSizing: 'border-box', transform: hundir(apretar), ...style }}>
    {l ? (
      <MiniCancha />
    ) : (
      <div style={{ width: 36, height: 46, borderRadius: 6, background: PIZARRA, border: '1.5px dashed #D9DFE8', display: 'grid', placeItems: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: SUTIL, fontWeight: 600 }}>—</span>
      </div>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l ? l.nombre : 'Sin plantilla'}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: TENUE, fontFamily: jetbrains }}>{l ? `${l.formacion} · ${nombreCat(l.cat)}` : 'Solo evento'}</p>
    </div>
  </div>
);

const TIPOS_P = [
  { v: 'TRAINING', label: 'Entrenamiento', bg: '#EFF6FF', color: '#1D4ED8', d: () => <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
  { v: 'MATCH', label: 'Partido', bg: '', color: '', d: () => <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" /></> },
  { v: 'MEETING', label: 'Reunión', bg: '#F5F3FF', color: '#6D28D9', d: () => <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  { v: 'CALL', label: 'Convocatoria', bg: '#ECFEFF', color: '#0E7490', d: () => <path d="M3 11l18-8-8 18-2-8-8-2z" /> },
  { v: 'ANNOUNCEMENT', label: 'Anuncio', bg: '#FEF3C7', color: '#92400E', d: () => <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></> },
];
const ENFOQUE_P = [
  { g: 'Físico', o: ['Fuerza', 'Velocidad', 'Resistencia', 'Agilidad', 'Movilidad'] },
  { g: 'Con balón', o: ['Técnica', 'Táctica', 'Balón parado', 'Partido de práctica', 'Arqueros', 'Tiro'] },
  { g: 'Complementario', o: ['Recuperación', 'Prevención', 'Mental', 'Evaluación'] },
];

export const VentanaCrearEvento: FC<{ d: DatosCrearEvento; vh: number; tn: Tonos }> = ({ d, vh, tn }) => {
  if (d.t <= 0) return null;
  const L = CREAR_EVENTO_V(vh, d.tipo);
  const r = d.resalte ?? {};
  const half = (MIW - 8) / 2;
  const partido = d.tipo === 'MATCH';
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.45 * Math.min(1, d.t * 1.5)})`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: MW, height: L.r.alto, background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', overflow: 'hidden', zIndex: 101, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.97 + 0.03 * d.t})`, display: 'flex', flexDirection: 'column', fontFamily: instrument, color: TEXTO }}>
        <div style={{ height: CABEZA_M, padding: '18px 22px', borderBottom: `1px solid ${BORDE}`, display: 'flex', justifyContent: 'space-between', boxSizing: 'border-box', flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: '24px' }}>Crear evento</h3>
            <p style={{ margin: 0, fontSize: 12, color: TENUE, lineHeight: '18px' }}>Será visible solo para los miembros del equipo</p>
          </div>
          <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: TENUE }}>
            <X size={14} />
          </span>
        </div>
        <div style={{ flex: 1, padding: `18px ${MB}px`, boxSizing: 'border-box' }}>
          {/* Tipo */}
          <div style={{ marginBottom: 14 }}>
            <Etq>Tipo de evento</Etq>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, borderRadius: 9, boxShadow: anillo(r.tipo) }}>
              {TIPOS_P.map((o) => {
                const on = d.tipo === o.v;
                const h = o.v === 'MATCH' && (d.hover?.partido ?? 0) > 0.5 && !on;
                return (
                  <div key={o.v} style={{ height: 68, border: `1.5px solid ${on ? tn.b600 : h ? '#D9DFE8' : BORDE}`, borderRadius: 9, background: on ? tn.b50 : HUNDIDO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box', transform: o.v === 'MATCH' ? hundir(d.apretar?.partido) : undefined }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: o.bg || tn.b50, color: o.color || tn.b700 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <o.d />
                      </svg>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: on ? tn.b700 : TEXTO }}>{o.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {!partido && (
            <div style={{ marginBottom: 14 }}>
              <Etq>
                Enfoque del entrenamiento <span style={{ color: SUTIL, fontWeight: 400 }}>· opcional, hasta 3</span>
              </Etq>
              {ENFOQUE_P.map((g) => (
                <div key={g.g} style={{ height: 54 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10.5, fontWeight: 600, color: SUTIL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.g}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {g.o.map((o) => (
                      <span key={o} style={{ padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${BORDE}`, background: HUNDIDO }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
              <p style={{ margin: '6px 0 0', fontSize: 11, color: TENUE }}>Marca qué se trabaja en la sesión: tus jugadores lo verán en el evento.</p>
            </div>
          )}
          {/* Sede */}
          <div style={{ marginBottom: 14 }}>
            <Etq>Sede</Etq>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todas las sedes', 'Sede Norte', 'Sede principal'].map((s, i) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 35, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${i === 0 ? tn.b600 : BORDE}`, background: i === 0 ? tn.b50 : HUNDIDO, color: i === 0 ? tn.b700 : TEXTO, boxSizing: 'border-box' }}>
                  {i > 0 && <MapPin size={12} />}
                  {s}
                </span>
              ))}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: TENUE, lineHeight: '16.5px' }}>Se convoca a los jugadores de todas las sedes.</p>
          </div>
          {!partido && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Etq>Cancha</Etq>
                <span style={{ fontSize: 11, fontWeight: 500, color: tn.b700 }}>Gestionar canchas</span>
              </div>
              <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 9, border: `1.5px solid ${tn.b600}`, background: tn.b50, boxSizing: 'border-box' }}>
                <MapPin size={14} color={tn.b700} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Cancha Sede Norte</span>
                  <span style={{ display: 'block', fontSize: 11, color: TENUE }}>Acta: lun, mié y vie · 4:00 p. m. – 7:00 p. m.</span>
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 999, padding: '2px 8px' }}>Acta validada</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: TENUE }}>Los jugadores marcan su llegada y salida por GPS en esta cancha.</p>
            </div>
          )}
          {/* Título */}
          <div style={{ marginBottom: 14 }}>
            <Etq>Título</Etq>
            <Ent tn={tn} valor={d.titulo} ejemplo={partido ? 'Ej. Tigres FC vs Panteras FC' : 'Ej. Entrenamiento de pretemporada'} foco={d.foco === 'titulo'} resalte={r.titulo} />
          </div>
          {/* Plantilla */}
          {partido && (
            <div style={{ marginBottom: 14 }}>
              <Etq>
                Plantilla del equipo <span style={{ color: SUTIL, fontWeight: 400 }}>· opcional</span>
              </Etq>
              <div style={{ display: 'grid', gridTemplateColumns: `${half}px ${half}px`, gap: 8, borderRadius: 10, boxShadow: anillo(r.plantillas) }}>
                <TarjetaLineup l={null} elegida={d.plantilla === null} tn={tn} />
                {LINEUPS_P.map((l) => (
                  <TarjetaLineup key={l.id} l={l} elegida={d.plantilla === l.id} tn={tn} hover={d.hover?.plantilla === l.id} apretar={d.hover?.plantilla === l.id ? d.apretar?.plantilla : 0} />
                ))}
              </div>
              <p style={{ margin: '6px 2px 0', fontSize: 11, color: TENUE, lineHeight: '15.4px', borderRadius: 4, background: (r.ayuda ?? 0) > 0 ? `rgba(253,224,71,${0.55 * (r.ayuda ?? 0)})` : undefined }}>
                {d.plantilla ? 'Solo se convoca y se avisa por WhatsApp a los titulares y suplentes de esta plantilla.' : 'Sin plantilla: se convoca a todos los jugadores de la categoría.'}
              </p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <Etq>Fecha</Etq>
              <Ent tn={tn} valor={d.fecha} ejemplo="dd/mm/aaaa" foco={d.foco === 'fecha'} />
            </div>
            <div>
              <Etq>Hora</Etq>
              <Ent tn={tn} valor={d.hora} ejemplo="--:-- --" foco={d.foco === 'hora'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <Etq>Lugar</Etq>
              <Ent tn={tn} valor={d.lugar} ejemplo="Cancha Norte" foco={d.foco === 'lugar'} />
            </div>
            <div>
              <Etq>Duración</Etq>
              <Ent tn={tn} valor="Sin especificar" flecha />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Etq>Descripción</Etq>
            <Ent tn={tn} ejemplo="Detalles, lista de equipamiento, instrucciones..." alto={80} />
          </div>
          <Interruptor etiqueta="Solicitar confirmación (RSVP)" descripcion="Los miembros podrán responder Voy / No voy / Tal vez" on tn={tn} />
          {partido ? (
            <Interruptor etiqueta="Enviar invitación por WhatsApp" descripcion="A cada jugador convocado, con fecha, hora, cancha y botones para confirmar" on tn={tn} resalte={r.whatsapp} />
          ) : (
            <Interruptor etiqueta="Enviar invitación por WhatsApp" descripcion="Por ahora solo los partidos se avisan por WhatsApp. Este evento les llega por la app." on={false} tn={tn} />
          )}
          {partido && (
            <p style={{ margin: '-2px 0 8px', paddingLeft: 2, height: 14.5, fontSize: 11, lineHeight: '14.5px', color: '#059669' }}>
              <span style={{ borderRadius: 4, background: (r.cobertura ?? 0) > 0 ? `rgba(253,224,71,${0.6 * (r.cobertura ?? 0)})` : undefined, padding: '0 3px', margin: '0 -3px' }}>✓ Todos los jugadores recibirán el aviso</span>
            </p>
          )}
          <Interruptor etiqueta="Recordatorio 24h antes" descripcion="Notificación automática a quienes no han confirmado" on={false} tn={tn} />
        </div>
        <div style={{ height: PIE_M, padding: '0 22px', background: HUNDIDO, borderTop: `1px solid ${BORDE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: TENUE, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={14} /> Solo el equipo verá esto
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ height: 38, padding: '0 16px', borderRadius: 8, border: `1px solid ${BORDE}`, background: '#fff', fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>Cancelar</span>
            <span style={{ width: 122, height: 38, borderRadius: 8, background: (d.hover?.publicar ?? 0) > 0.5 ? tn.b700 : tn.b600, color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: d.publicando ? 0.65 : 1, transform: hundir(d.apretar?.publicar) }}>
              {d.publicando && <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', boxSizing: 'border-box' }} />}
              {d.publicando ? 'Publicando...' : 'Publicar evento'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// El jugador: menú, inicio y detalle del partido
// =============================================================================================================

const ENLACES_JUGADOR_P = [
  { nombre: 'Inicio', Icono: Home },
  { nombre: 'Mensajes', Icono: MessagesSquare },
  { nombre: 'Novedades', Icono: Newspaper },
  { nombre: 'Asistencia', Icono: CalendarCheck },
  { nombre: 'Facturas', Icono: FileText },
  { nombre: 'Documentos', Icono: FolderLock },
  { nombre: 'Perfil', Icono: User },
];

/** El menú del jugador (mismo SideNav que el entrenador). */
export const MenuJugadorP: FC<{ tn: Tonos; vh: number; nombre: string }> = ({ tn, vh, nombre }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SIDE, height: vh, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20, fontFamily: instrument, color: TEXTO }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: '1px solid #e2e8f0' }}>
      <Isotipo tamano={32} />
      <div style={{ fontFamily: schibsted, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ENLACES_JUGADOR_P.map(({ nombre: n, Icono }) => {
        const on = n === 'Inicio';
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 11, height: 36, padding: '0 10px', borderRadius: 8, fontSize: 13, fontWeight: on ? 500 : 400, color: on ? tn.b700 : '#64748b', background: on ? tn.b50 : 'transparent' }}>
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span>{n}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: tn.b600, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>{nombre[0]}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Jugador</div>
      </div>
      <ChevronDown size={14} color="#94a3b8" />
    </div>
  </div>
);

/** El jugador que mira: Mateo (titular y capitán) o Juan David (suplente). */
export type VistaJugador = 'mateo' | 'juandavid';
const PERFIL_P: Record<VistaJugador, { meta: string; sesiones: string }> = {
  mateo: { meta: 'Academia Fénix Bogotá · 12 años · 1.52 m', sesiones: '24 sesiones · 6 partidos' },
  juandavid: { meta: 'Academia Fénix Bogotá · 12 años · 1.49 m', sesiones: '21 sesiones · 5 partidos' },
};

const X_INICIO = X0;
const Y_EVENTOS = 76 + 134 + 20;
/** La fila del partido en «Próximos eventos» y su botón «Detalles». */
export const FILA_PARTIDO_P = caja(X_INICIO, Y_EVENTOS + 60 + 97, AW, 97);
export const DETALLES_P = caja(X_INICIO + AW - 20 - 92, Y_EVENTOS + 60 + 97 + 31, 92, 34);

const IcoPartido = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** Inicio del jugador: PlayerHeader y «Próximos eventos» (un entrenamiento y el partido). */
export const PaginaInicioJugador: FC<{ quien: VistaJugador; hoverDetalles?: number; apretarDetalles?: number; resalte?: { partido?: number; detalles?: number } }> = ({ quien, hoverDetalles = 0, apretarDetalles = 0, resalte = {} }) => {
  const p = jugadorA(quien);
  const perfil = PERFIL_P[quien];
  const filas = [
    { tipo: 'TRAINING', dow: 'MAR', num: 17, titulo: 'Entrenamiento Sub-13', hora: '17:00', lugar: 'Cancha Sede Norte' },
    { tipo: 'MATCH', dow: 'SÁB', num: 21, titulo: PARTIDO_P.titulo, hora: '09:00', lugar: PARTIDO_P.lugar },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, fontFamily: instrument, color: '#111827' }}>
      <div style={{ position: 'absolute', left: X0, top: 76, width: AW, height: 134, boxSizing: 'border-box', borderRadius: 16, border: '1px solid #E5E7EB', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 22, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontSize: 160, fontWeight: 900, letterSpacing: -8, lineHeight: 0.8, color: '#EFF6FF' }}>{p.num}</div>
        <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 18, background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 50%,#1d4ed8 100%)', boxShadow: '0 10px 24px rgba(37,99,235,0.25)', color: '#fff', fontSize: 28, fontWeight: 700, letterSpacing: -1, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {p.nombre.split(' ').slice(0, 2).map((w) => w[0]).join('')}
        </div>
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.25 }}>{p.nombre}</span>
            <span style={{ borderRadius: 999, background: '#2563EB', padding: '3px 10px', fontSize: 13, fontWeight: 700, color: '#fff' }}>#{p.num}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF' }}>
            <strong style={{ fontWeight: 600, color: '#4B5563' }}>{p.pos}</strong> · {perfil.meta}
          </p>
          <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
            {['Pierna hábil: derecha', '2026/27', perfil.sesiones].map((t, i) => (
              <span key={t} style={{ borderRadius: 999, background: i === 0 ? '#EFF6FF' : '#F9FAFB', padding: '4px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', color: i === 0 ? '#1D4ED8' : '#6B7280' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, border: '1px solid #E5E7EB', background: '#F9FAFB', padding: '10px 14px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 0 4px #DBEAFE' }} />
            <div>
              <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF' }}>Readiness</p>
              <p style={{ margin: 0, fontFamily: jetbrains, fontSize: 18, fontWeight: 800, color: '#1F2937' }}>
                87<span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>/100</span>
              </p>
            </div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            EN FORMA
          </span>
        </div>
      </div>
      {/* Próximos eventos */}
      <div style={{ position: 'absolute', left: X_INICIO, top: Y_EVENTOS, width: AW, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.2px' }}>Próximos eventos</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Tus partidos, entrenamientos y reuniones de los próximos días</div>
        </div>
        <span style={{ color: '#1D4ED8', fontWeight: 600, fontSize: 13 }}>Ver todo ›</span>
      </div>
      <div style={{ position: 'absolute', left: X_INICIO, top: Y_EVENTOS + 60, width: AW, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {filas.map((f, i) => {
          const partido = f.tipo === 'MATCH';
          return (
            <div key={f.num} style={{ height: 97, boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 18, alignItems: 'center', padding: '0 20px', borderBottom: i === 0 ? '1px solid #E5E7EB' : 'none', background: partido && (resalte.partido ?? 0) > 0 ? `rgba(254,242,242,${0.6 * (resalte.partido ?? 0)})` : undefined }}>
              <div style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 6px', textAlign: 'center', lineHeight: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.7 }}>{f.dow}</div>
                <div style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 2px', fontFamily: jetbrains }}>{f.num}</div>
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>NOV</div>
              </div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: partido ? '#FEF2F2' : '#EFF6FF', color: partido ? '#C0392B' : '#2563EB', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                  {partido ? (
                    <IcoPartido />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  )}
                  {partido ? 'Partido' : 'Entrenamiento'}
                </span>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.titulo}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6B7280' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <CalendarDays size={13} /> {f.hora}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} /> {f.lugar}
                  </span>
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: 92, height: 34, justifyContent: 'center', boxSizing: 'border-box', background: partido && hoverDetalles > 0.5 ? '#F3F4F6' : '#F9FAFB', border: `1px solid ${partido && hoverDetalles > 0.5 ? '#D1D5DB' : '#E5E7EB'}`, borderRadius: 8, color: '#374151', fontWeight: 600, fontSize: 12, transform: partido ? hundir(apretarDetalles) : undefined, boxShadow: partido ? anillo(resalte.detalles) : undefined }}>
                Detalles ›
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Detalle del partido (EventDetailModal + LineupView) ------------------------------------------------------------------

/** La alineación del partido: casilla del 4-3-3 → jugador, suplentes y capitán. */
export const ALINEACION_FINAL = {
  alineacion: { 'zona-0': 'santiago', 'zona-1': 'tomas', 'zona-2': 'isabella', 'zona-3': 'daniela', 'zona-4': 'martina', 'zona-5': 'emiliano', 'zona-6': 'mateo', 'zona-7': 'valentina', 'zona-8': 'luciana', 'zona-9': 'jeronimo', 'zona-10': 'laura' } as Record<string, string>,
  suplentes: ['simon', 'felipe', 'juandavid', 'david'],
  capitan: 'mateo',
};

const ANCHO_DET = 512;
const ALTO_DET = 1140;
const CABEZA_DET = 96;
const PIE_DET = 63;
/** Dónde queda el detalle (ventana, la sección «Alineación», la cancha y los botones de asistir). */
export const DETALLE_V = (vh: number) => {
  const r = caja((ANCHO_U - ANCHO_DET) / 2, Math.round((vh - ALTO_DET) / 2), ANCHO_DET, ALTO_DET);
  const x = r.x + 20;
  const yLineup = r.y + CABEZA_DET + 16 + 5 * 52 - 12 + 16;
  return {
    r,
    alineacion: caja(x, yLineup, ANCHO_DET - 40, 30 + 66 + 12 + 494 + 12 + 50),
    aviso: caja(x, yLineup + 28, ANCHO_DET - 40, 62),
    cancha: caja(x + (ANCHO_DET - 40 - 320) / 2, yLineup + 28 + 62 + 12, 320, 494),
    suplentes: caja(x, yLineup + 28 + 62 + 12 + 494 + 12, ANCHO_DET - 40, 50),
    voy: caja(r.x + ANCHO_DET - 20 - 268 + 3, r.y + ALTO_DET - PIE_DET + 15, 66, 33),
  };
};

const InfoFila: FC<{ icono: ReactNode; label: string; children: ReactNode }> = ({ icono, label, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, height: 40 }}>
    <span style={{ marginTop: 2, width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', color: '#64748B', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icono}</span>
    <div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: '#94A3B8', lineHeight: '16px' }}>{label}</p>
      <div style={{ fontSize: 14, color: '#1E293B', lineHeight: '20px' }}>{children}</div>
    </div>
  </div>
);

const corto = (n: string) => {
  const p = n.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[1][0]}.` : p[0];
};

export type DatosDetalle = { t: number; quien: VistaJugador; respuesta?: 'YES' | null; hoverVoy?: number; apretarVoy?: number; resalte?: Partial<Record<'aviso' | 'capitan' | 'tu' | 'suplentes' | 'asistir', number>> };

export const VentanaDetalleEvento: FC<{ d: DatosDetalle; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const L = DETALLE_V(vh);
  const r = d.resalte ?? {};
  const zonas = zonasDe('4-3-3');
  const yo = d.quien;
  const titular = Object.values(ALINEACION_FINAL.alineacion).includes(yo);
  const miZona = zonas.find((z) => ALINEACION_FINAL.alineacion[z.id] === yo);
  const capitan = ALINEACION_FINAL.capitan === yo;
  const banner = titular
    ? { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', title: 'Eres titular', sub: `Juegas de ${ROLES_A[miZona!.rol].one.toLowerCase()}` }
    : { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', title: 'Vas de suplente', sub: 'Empiezas en el banco y puedes entrar durante el partido' };
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.5 * Math.min(1, d.t * 1.5)})`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: ANCHO_DET, height: ALTO_DET, background: '#fff', borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 101, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.97 + 0.03 * d.t})`, display: 'flex', flexDirection: 'column', fontFamily: instrument, color: '#0F172A' }}>
        <div style={{ height: CABEZA_DET, boxSizing: 'border-box', padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, background: '#FFE4E1', color: '#C0392B' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="14" r="5" />
                  <path d="M14 14h7v-3l-7-2" />
                </svg>
                Partido
              </span>
              <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 600, background: '#F1F5F9', color: '#64748B' }}>En 7 días</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.375 }}>{PARTIDO_P.titulo}</h2>
          </div>
          <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: '#64748B' }}>
            <X size={16} />
          </span>
        </div>
        <div style={{ flex: 1, padding: '16px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoFila icono={<CalendarDays size={15} />} label="Fecha">
              {PARTIDO_P.fechaLarga}
            </InfoFila>
            <InfoFila icono={<Clock size={15} />} label="Hora">
              {PARTIDO_P.horaCorta}
            </InfoFila>
            <InfoFila icono={<MapPin size={15} />} label="Lugar">
              <span style={{ fontWeight: 500 }}>{PARTIDO_P.lugar}</span>
            </InfoFila>
            <InfoFila icono={<Tag size={15} />} label="Categoría">
              Sub-13
            </InfoFila>
            <InfoFila icono={<User size={15} />} label="Publicado por">
              Carlos Rodríguez
            </InfoFila>
          </div>
          {/* LineupView */}
          <div>
            <div style={{ height: 20, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: '#94A3B8' }}>Alineación</p>
              <span style={{ borderRadius: 999, background: '#F1F5F9', padding: '2px 10px', fontFamily: jetbrains, fontSize: 11, fontWeight: 600, color: '#475569' }}>4-3-3 · Fútbol 11</span>
            </div>
            <div style={{ height: 62, boxSizing: 'border-box', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, padding: '0 14px', background: banner.bg, border: `1px solid ${banner.border}`, color: banner.color, boxShadow: anillo(r.aviso, titular ? '16,185,129' : '245,158,11') }}>
              {titular && miZona && <span style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: ROLES_A[miZona.rol].color, flexShrink: 0 }}>{ROLES_A[miZona.rol].tag}</span>}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{banner.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.9 }}>{banner.sub}</p>
              </div>
              {capitan && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, border: '1px solid #FCD34D', background: '#FEF3C7', padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#92400E', flexShrink: 0, boxShadow: anillo(r.capitan, '245,158,11') }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#F59E0B', color: '#fff', fontSize: 9, fontWeight: 900, display: 'grid', placeItems: 'center' }}>C</span>
                  Capitán
                </span>
              )}
            </div>
            <div style={{ position: 'relative', width: 320, height: 494, margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
              <Cesped puntos={false} />
              {zonas.map((z) => {
                const id = ALINEACION_FINAL.alineacion[z.id];
                const p = jugadorA(id);
                const soyYo = id === yo;
                const esC = id === ALINEACION_FINAL.capitan;
                return (
                  <div key={z.id} style={{ position: 'absolute', left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: ROLES_A[z.rol].color, border: soyYo ? '3px solid #FDE047' : '2px solid rgba(255,255,255,0.9)', boxShadow: soyYo ? `0 0 0 ${3 + 6 * (r.tu ?? 0)}px rgba(253,224,71,${0.35 + 0.4 * (r.tu ?? 0)})` : '0 2px 6px rgba(0,0,0,0.25)', boxSizing: 'border-box' }}>{p.num}</div>
                      {esC && <span style={{ position: 'absolute', right: -6, top: -6, width: 16, height: 16, borderRadius: '50%', border: '1px solid #fff', background: '#F59E0B', color: '#fff', fontSize: 8, fontWeight: 900, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>C</span>}
                    </div>
                    <span style={{ marginTop: 2, maxWidth: 76, borderRadius: 4, padding: '0 4px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', background: soyYo ? '#FDE047' : 'rgba(15,23,42,0.55)', color: soyYo ? '#422006' : '#fff' }}>{soyYo ? 'Tú' : corto(p.nombre)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, borderRadius: 8, boxShadow: anillo(r.suplentes, '245,158,11') }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: '#94A3B8' }}>Suplentes · {ALINEACION_FINAL.suplentes.length}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALINEACION_FINAL.suplentes.map((id) => {
                  const p: JugadorA = jugadorA(id);
                  const soyYo = id === yo;
                  return (
                    <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, border: `1px solid ${soyYo ? '#FCD34D' : '#E2E8F0'}`, background: soyYo ? '#FFFBEB' : '#fff', color: soyYo ? '#78350F' : '#334155', padding: '4px 8px', fontSize: 12, fontWeight: 500, boxShadow: soyYo ? anillo(r.tu, '245,158,11') : undefined }}>
                      <span style={{ fontFamily: jetbrains, fontSize: 10, color: '#94A3B8' }}>{p.num}</span>
                      {soyYo ? 'Tú' : corto(p.nombre)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#64748B' }}>
            <span style={{ marginRight: 4, color: '#94A3B8' }}>Respuestas del equipo:</span>
            <span style={{ borderRadius: 6, background: '#ECFDF5', padding: '2px 8px', color: '#047857' }}>{d.respuesta === 'YES' ? 9 : 8} van</span>
            <span style={{ borderRadius: 6, background: '#FFFBEB', padding: '2px 8px', color: '#92400E' }}>1 tal vez</span>
            <span style={{ borderRadius: 6, background: '#FEF2F2', padding: '2px 8px', color: '#B91C1C' }}>0 no</span>
          </div>
        </div>
        <div style={{ height: PIE_DET, boxSizing: 'border-box', borderTop: '1px solid #F1F5F9', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: (r.asistir ?? 0) > 0 ? `inset 0 0 0 ${3 * (r.asistir ?? 0)}px rgba(14,165,233,${0.8 * (r.asistir ?? 0)})` : undefined }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>¿Vas a asistir?</span>
          {d.respuesta === 'YES' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: '#E7F7EE', color: '#047857', fontSize: 12.5, fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-11" />
              </svg>
              Confirmado
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textDecoration: 'underline' }}>cambiar</span>
            </span>
          ) : (
            <div style={{ display: 'inline-flex', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 3, gap: 2 }}>
              {[
                { l: 'Voy', i: <path d="M5 12l5 5 9-11" /> },
                { l: 'Tal vez', i: <path d="M9 9a3 3 0 1 1 5.5 1.5c-.7 1-2 1.5-2.5 2.5v1M12 17.5v.01" /> },
                { l: 'No puedo', i: <path d="M6 6l12 12M18 6L6 18" /> },
              ].map((b, k) => {
                const h = k === 0 && (d.hoverVoy ?? 0) > 0.5;
                return (
                  <span key={b.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: h ? '#0A7E3F' : '#64748B', background: h ? '#E7F7EE' : 'transparent', transform: k === 0 ? hundir(d.apretarVoy) : undefined }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {b.i}
                    </svg>
                    {b.l}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export type { Caja as CajaP };
