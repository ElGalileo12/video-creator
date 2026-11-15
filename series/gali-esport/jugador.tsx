// Pantallas del ROL JUGADOR (Mateo Rojas, CD Norte) en la computadora, fieles a la app (desde `que-todos-lo-vean`).
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Menú del jugador: components/layout/NavLinks.tsx (Inicio, Novedades, Asistencia, Facturas, Perfil).
// - Novedades: app/(dashboard)/player/feed/FeedClient.tsx («Eventos del equipo») con feature/player/components/feed/
//   PersonalStats, HeroEvent («Necesita tu respuesta», «Falta», «¿Vas a asistir?»), RsvpButtons («Confirmar asistencia»,
//   «Tal vez», «No puedo» y el estado «Confirmado»), FilterBar, GroupHeader, EventCard y la barra derecha
//   (sidebar/PendingList, AttendanceRing, MiniCalendar, aproximadas).
// Todo en píxeles de la app (pantalla de 1280 × 1040): va dentro de `Pantalla` con `tam={PANTALLA_APP}`.
import { CalendarCheck, FileText, Home, Newspaper, User } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { Punto } from './computador';
import { enlaceApp, LATERAL_APP, MenuApp } from './entrenador';
import { mono } from './tema';

const ENLACES_JUGADOR = [
  { nombre: 'Inicio', icono: Home },
  { nombre: 'Novedades', icono: Newspaper },
  { nombre: 'Asistencia', icono: CalendarCheck },
  { nombre: 'Facturas', icono: FileText },
  { nombre: 'Perfil', icono: User },
];
export const enlaceJugador = (nombre: string) => enlaceApp(ENLACES_JUGADOR, nombre);
export const MenuJugador: FC<{ activo: string; resalte?: number }> = ({ activo, resalte }) => <MenuApp enlaces={ENLACES_JUGADOR} activo={activo} nombre="Mateo Rojas" rol="Jugador" resalte={resalte} />;

const X0 = LATERAL_APP + 24;
const ANCHO = 1280 - LATERAL_APP - 48;
const RIEL = 340;
const PRINCIPAL = ANCHO - RIEL - 24;
/** Arriba del evento destacado (medido: cabecera, cifras y márgenes). */
const Y_HERO = 52 + 24 + 67 + 18 + 89 + 4 + 18 + 18;
/** El evento destacado en la pantalla. */
export const HERO_JUGADOR = { x: X0, y: Y_HERO, ancho: PRINCIPAL };
/** Centro del botón «Confirmar asistencia» del evento destacado. */
export const CONFIRMAR: Punto = { x: X0 + PRINCIPAL - 26 - 150, y: Y_HERO + 24 + 27 + 18 + 18 + 16 + 53 + 31 + 31 + 23 };

// --- Iconos (como en la app) -------------------------------------------------------------------------------------------

const Ico: FC<{ tam?: number; ancho?: number; style?: CSSProperties; children: ReactNode }> = ({ tam = 15, ancho = 2, style, children }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);
const IcoCalendario = ({ tam = 15 }) => (
  <Ico tam={tam} style={{ opacity: 0.85 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ico>
);
const IcoReloj = ({ tam = 15 }) => (
  <Ico tam={tam} style={{ opacity: 0.85 }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Ico>
);
const IcoLugar = ({ tam = 15 }) => (
  <Ico tam={tam} style={{ opacity: 0.85 }}>
    <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </Ico>
);
const IcoCheck = ({ tam = 14 }) => (
  <Ico tam={tam} ancho={2.5}>
    <path d="M5 12l5 5 9-11" />
  </Ico>
);
const IcoX = ({ tam = 14 }) => (
  <Ico tam={tam} ancho={2.5}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Ico>
);
const IcoQ = ({ tam = 14 }) => (
  <Ico tam={tam} ancho={2.5}>
    <path d="M9 9a3 3 0 1 1 5.5 1.5c-.7 1-2 1.5-2.5 2.5v1M12 17.5v.01" />
  </Ico>
);

// --- Cifras personales -------------------------------------------------------------------------------------------------

const TILES = [
  { bg: '#fff1ea', color: '#d35400', lbl: 'Pendientes de responder', icono: () => <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></> },
  { bg: '#e7f7ee', color: '#0a7e3f', lbl: 'Asistencia', icono: () => <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></> },
  { bg: '#eff6ff', color: '#1d4ed8', lbl: 'Partidos jugados', icono: () => <><circle cx="9" cy="14" r="5" /><path d="M14 14h7v-3l-7-2" /></> },
  { bg: '#fef3c7', color: '#b45309', lbl: 'Racha de asistencia', icono: () => <path d="M12 3c1 5 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 2 4-2-3 1-7 1-11z" /> },
];

const CifrasJugador: FC<{ pendientes: number }> = ({ pendientes }) => {
  const datos = [
    { val: String(pendientes), suf: '', sub: 'próx. 7 días' },
    { val: '92', suf: '%', sub: '11/12 sesiones · últ. 30 días' },
    { val: '5', suf: '/6', sub: 'de 6 convocatorias' },
    { val: '6', suf: ' días', sub: '¡Sigue así!' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
      {TILES.map((t, i) => (
        <div key={t.lbl} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0, background: t.bg, color: t.color }}>
            <Ico tam={18}>
              <t.icono />
            </Ico>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {datos[i].val}
              {datos[i].suf && <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginLeft: 2 }}>{datos[i].suf}</span>}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.lbl}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, whiteSpace: 'nowrap' }}>{datos[i].sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- El evento destacado (HeroEvent) ----------------------------------------------------------------------------------

export type EventoJugador = { titulo: string; fecha: string; hora: string; lugar: string; autor: string; falta: [number, number, number]; companeros: number };

/** El partido de la Copa que Daniel creó (sábado 7 de noviembre, 15:00). Desde el 21 de octubre, 18:20. */
export const PARTIDO_COPA_EVENTO: EventoJugador = { titulo: 'CD Norte vs. Halcones', fecha: 'sábado, 7 de noviembre de 2026', hora: '15:00', lugar: 'Polideportivo Norte', autor: 'Daniel', falta: [16, 20, 40], companeros: 4 };

export type PropsHero = { ev: EventoJugador; hoverConfirmar?: number; apretarConfirmar?: number; confirmado?: number; resalteConfirmado?: number };

export const HeroEvento: FC<PropsHero> = ({ ev, hoverConfirmar = 0, apretarConfirmar = 0, confirmado = 0, resalteConfirmado = 0 }) => {
  const boton: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' };
  return (
    <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #1e40af 100%)', color: '#fff', borderRadius: 22, padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 30px rgba(37,99,235,0.18), 0 2px 6px rgba(15,23,42,0.06)' }}>
      <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0))' }} />
      <div style={{ position: 'absolute', left: -40, bottom: -80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06), rgba(255,255,255,0))' }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', padding: '5px 10px', background: 'rgba(255,255,255,0.14)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
        Necesita tu respuesta
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'stretch', position: 'relative', zIndex: 1, marginTop: 18 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.4px', lineHeight: 1.15, margin: '8px 0 0' }}>{ev.titulo}</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 12 }}>
            {[
              { icono: <IcoCalendario />, texto: ev.fecha },
              { icono: <IcoReloj />, texto: ev.hora },
              { icono: <IcoLugar />, texto: ev.lugar },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>
                {m.icono} {m.texto}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>{ev.autor[0]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' }}>Publicado por</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{ev.autor}</span>
            </div>
          </div>
        </div>
        <div style={{ width: 300, flexShrink: 0, padding: '18px 20px 20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 16, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Falta</div>
          <div style={{ fontFamily: mono, fontWeight: 700, color: '#fff', marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10, letterSpacing: '-0.5px' }}>
            {ev.falta.map((v, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
                <b style={{ fontWeight: 700, fontSize: 30 }}>{String(v).padStart(2, '0')}</b>
                <i style={{ fontStyle: 'normal', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: 2 }}>{['d', 'h', 'm'][i]}</i>
              </span>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '16px 0 14px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.01em' }}>¿Vas a asistir?</div>
          <div style={{ position: 'relative', height: 96 }}>
            {/* Los tres botones (HeroRsvpButtons) */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 8, opacity: 1 - confirmado }}>
              <div style={{ ...boton, background: '#fff', color: '#0a7e3f', padding: '13px 16px', boxShadow: `0 6px 14px rgba(10,126,63,0.18)${hoverConfirmar > 0 ? `, 0 0 0 ${4 * hoverConfirmar}px rgba(255,255,255,0.35)` : ''}`, transform: apretarConfirmar > 0 ? `scale(${1 - apretarConfirmar * 0.05})` : undefined }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: '#0a7e3f', color: '#fff', flexShrink: 0 }}>
                  <IcoCheck tam={13} />
                </span>
                Confirmar asistencia
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ ...boton, flex: 1, background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)' }}>
                  <IcoQ /> Tal vez
                </div>
                <div style={{ ...boton, flex: 1, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
                  <IcoX /> No puedo
                </div>
              </div>
            </div>
            {/* El estado ya respondido */}
            {confirmado > 0 && (
              <div style={{ position: 'absolute', left: 0, top: 0, opacity: confirmado, transform: `scale(${0.85 + 0.15 * confirmado + 0.12 * resalteConfirmado})`, transformOrigin: '0 50%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: `rgba(255,255,255,${0.15 + 0.2 * resalteConfirmado})`, border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: resalteConfirmado > 0 ? `0 0 0 ${5 * resalteConfirmado}px rgba(134,239,172,0.5)` : 'none' }}>
                  <IcoCheck />
                  <span>Confirmado</span>
                  <span style={{ fontSize: 11, opacity: 0.7, textDecoration: 'underline' }}>cambiar</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.14)', fontSize: 12.5, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 1.45 }}>
            <strong style={{ color: '#fff', fontWeight: 700 }}>{ev.companeros + (confirmado >= 1 ? 1 : 0)} compañeros</strong> ya confirmaron su asistencia
          </div>
        </div>
      </div>
    </div>
  );
};

// --- La lista de eventos (FilterBar, GroupHeader y EventCard de un entrenamiento) ------------------------------------

const BarraFiltros: FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
    <div style={{ display: 'flex', gap: 6 }}>
      {['Todos', 'Entrenamientos', 'Partidos', 'Convocatorias'].map((x, i) => (
        <span key={x} style={{ padding: '7px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: i === 0 ? '#0f172a' : '#fff', color: i === 0 ? '#fff' : '#475569', border: `1px solid ${i === 0 ? '#0f172a' : '#e2e8f0'}` }}>{x}</span>
      ))}
    </div>
    <div style={{ marginLeft: 'auto', display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
      {['Próximos', 'Pasados', 'Todos'].map((x, i) => (
        <span key={x} style={{ padding: '5px 11px', borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 700 : 500, background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? '#0f172a' : '#64748b' }}>{x}</span>
      ))}
    </div>
  </div>
);

const Grupo: FC<{ texto: string; n: number }> = ({ texto, n }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 14px' }}>
    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>{texto}</div>
    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: 999 }}>{n}</div>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
);

/** Un entrenamiento de la lista, con sus botones «Voy / Tal vez / No puedo». */
const TarjetaEntrenamiento: FC<{ dia: string; num: number; rel: string; fecha: string; hora: string }> = ({ dia, num, rel, fecha, hora }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 20px', display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: 18, marginBottom: 12 }}>
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em' }}>{dia}</div>
      <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1, margin: '1px 0' }}>{num}</div>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em' }}>oct</div>
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8' }}>Entrenamiento</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: rel === 'Mañana' ? '#fff1ea' : '#f8fafc', color: rel === 'Mañana' ? '#c0392b' : '#64748b' }}>{rel}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px', margin: '8px 0 2px' }}>Entrenamiento Sub-14</div>
      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IcoCalendario tam={14} /> {fecha}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IcoReloj tam={14} /> {hora}
        </span>
      </div>
    </div>
    <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 3, gap: 2, height: 'fit-content' }}>
      {[
        { l: 'Voy', I: IcoCheck },
        { l: 'Tal vez', I: IcoQ },
        { l: 'No puedo', I: IcoX },
      ].map(({ l, I }) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
          <I />
          {l}
        </span>
      ))}
    </div>
  </div>
);

// --- La barra derecha (aproximada) --------------------------------------------------------------------------------------

const Riel: FC<{ pendiente: boolean }> = ({ pendiente }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>Por responder</span>
        {pendiente && <span style={{ fontFamily: mono, fontSize: 11, background: '#2563eb', color: '#fff', padding: '1px 7px', borderRadius: 999 }}>1</span>}
      </div>
      {pendiente ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <div style={{ width: 36, textAlign: 'center', fontFamily: mono }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>7</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>nov</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>CD Norte vs. Halcones</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Partido · En 2 sem</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px 0', fontSize: 12.5, color: '#94a3b8' }}>¡Todo respondido! 🎉</div>
      )}
    </div>
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={72} height={72} viewBox="0 0 36 36">
        <circle cx={18} cy={18} r={15} fill="none" stroke="#e2e8f0" strokeWidth={4} />
        <circle cx={18} cy={18} r={15} fill="none" stroke="#0a7e3f" strokeWidth={4} strokeDasharray={`${0.92 * 94.2} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
      </svg>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>Asistencia</div>
        <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>92%</div>
      </div>
    </div>
  </div>
);

// --- La página -------------------------------------------------------------------------------------------------------

/** Novedades → «Eventos del equipo», con el partido de la Copa como evento destacado. */
export const PaginaNovedades: FC<PropsHero & { scroll?: number }> = ({ scroll = 0, ...hero }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#f8fafc', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: X0, top: 52 + 24 - scroll, width: ANCHO }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, height: 67 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a', lineHeight: 1.5 }}>Eventos del equipo</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>Mantente al día con tus convocatorias, entrenamientos y partidos.</div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 999, background: '#fff', fontSize: 13, fontWeight: 600, color: '#334155', flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
          CD Norte
        </div>
      </div>
      <div style={{ margin: '18px 0 4px' }}>
        <CifrasJugador pendientes={(hero.confirmado ?? 0) >= 1 ? 0 : 1} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `minmax(0, 1fr) ${RIEL}px`, gap: 24, marginTop: 18 }}>
        <div>
          <div style={{ marginTop: 18 }}>
            <HeroEvento {...hero} />
          </div>
          <BarraFiltros />
          <Grupo texto="Esta semana" n={2} />
          <TarjetaEntrenamiento dia="jue" num={22} rel="Mañana" fecha="jueves, 22 de octubre de 2026" hora="17:00" />
          <TarjetaEntrenamiento dia="sáb" num={24} rel="En 3 días" fecha="sábado, 24 de octubre de 2026" hora="09:00" />
        </div>
        <Riel pendiente={(hero.confirmado ?? 0) < 1} />
      </div>
    </div>
  </div>
);
