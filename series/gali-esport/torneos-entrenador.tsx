// Los TORNEOS del ENTRENADOR en escritorio (desde `invitar-y-torneos`), fieles a la app, en la página de 1440 (`ANCHO_U`)
// dentro de `MarcoUsuarios` (con `activo`). Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Aviso en la campanita: app/lib/notifications.ts (`notifyTournamentInvite`: «Te invitaron a un torneo», «{torneo} — revisa
//   los detalles y responde la invitación.») con el trofeo de components/layout/NotificationBell.tsx (TOURNAMENT_INVITE).
// - La invitación: components/tournament/InvitationDetail.tsx (/coach/tournament-invitations/{id}): «Invitación a torneo»,
//   «Cómo es el torneo», «Costos», «Tu respuesta» con «Aceptar invitación» / «Rechazar» y, al aceptar, «Aceptaste esta
//   invitación. Tu equipo quedó inscrito; …» con «Ver el torneo →». Ningún enlace del menú queda marcado en esa ruta.
// - Partidos (/coach/matches): arriba feature/coach/components/TournamentMatchConfirmations.tsx («Partidos de torneo»,
//   «Asistiré» / «No asistiré», «Convocar jugadores» / «Editar convocatoria», «N convocados · Plantilla …») y abajo el armador
//   de plantillas (app/(dashboard)/coach/matches/MatchesClient.tsx con MatchesPageHeader, MatchesTemplatesRow,
//   MatchesToolstrip, MatchesLeftPanel, MatchesPitch y RightPanel), simplificado y con su color naranja (--brand-hue 30).
// - «Convocar al partido»: feature/coach/components/team/CreateTeamEventModal.tsx con `tournamentMatch` (se abre solo al
//   responder «Asistiré» si aún no hay convocatoria).
// - El aviso al jugador por WhatsApp: plantilla `invitation_match` de app/lib/whatsapp.ts («Convocatoria a partido», «Hola
//   {jugador}, fuiste convocado al partido {local vs visitante} el {fecha} a las {hora} en la cancha {cancha}.», botones
//   Voy / Tal vez / No voy). `PantallaConvocatoria` va dentro de `Celular`.
// Las medidas exportadas están en píxeles de la página (sin restar `scroll`), para llevar el puntero y la cámara.
// Datos de ejemplo inventados: la Copa Navidad Sub-13 de Camilo y la Academia Fénix Bogotá de Carlos.
import { Check, ChevronDown, Clock, Lock, MapPin, Trophy, Users, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { Tonos } from './escuela-panel';
import { instrument, jetbrains } from './letras';
import { Isotipo } from './marca';
import { MARINO, SISTEMA } from './tema';
import { ANCHO_U } from './usuarios';

const caja = (x: number, y: number, ancho: number, alto: number) => ({ x, y, ancho, alto });
type Caja = ReturnType<typeof caja>;
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);
const SIDE = 176;
const TOP = 52;

// =============================================================================================================
// El torneo de ejemplo
// =============================================================================================================

export const COPA_NAVIDAD = {
  nombre: 'Copa Navidad Sub-13',
  deporte: 'Fútbol',
  organiza: 'Camilo',
  descripcion: 'Torneo de fin de año para escuelas de Bogotá: fase de grupos y después eliminación directa. Todos los partidos son en fin de semana.',
  filas: [
    ['Formato', 'Grupos + Eliminación'],
    ['Inicio', '28 de noviembre de 2026'],
    ['Fin', '19 de diciembre de 2026'],
    ['Cupos', '5 de 8 equipos'],
    ['Categoría', 'Sub-13'],
    ['Sedes', 'Polideportivo Norte, Cancha El Bosque'],
    ['Duración por tiempo', '25 min'],
    ['Puntos', 'Victoria 3 · Empate 1 · Derrota 0'],
  ] as [string, string][],
  costos: [
    ['Inscripción por equipo', '$250.000 COP'],
    ['Arbitraje (por partido, antes de jugar)', '$40.000 COP'],
    ['Tarjeta amarilla (por jugador)', '$5.000 COP'],
    ['Tarjeta roja (por jugador)', '$10.000 COP'],
  ] as [string, string][],
  vence: '17 de nov, 11:59 p. m.',
};
/** El aviso de la campanita (`notifyTournamentInvite`). */
export const AVISO_TORNEO = { titulo: 'Te invitaron a un torneo', cuerpo: `${COPA_NAVIDAD.nombre} — revisa los detalles y responde la invitación.` };

/** Logo del torneo (logoUrl): un escudo navideño con la copa. */
export const LogoCopaNavidad: FC<{ tam?: number }> = ({ tam = 56 }) => (
  <svg width={tam} height={tam} viewBox="0 0 56 56" style={{ display: 'block', borderRadius: 12 }}>
    <defs>
      <linearGradient id="copaNavFondo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#B91C1C" />
        <stop offset="1" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="copaNavOro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FDE68A" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="56" height="56" rx="12" fill="url(#copaNavFondo)" />
    {[[9, 10], [46, 13], [12, 44], [44, 42], [28, 7]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#FEE2E2" opacity={0.8} />
    ))}
    <path d="M19 15h18v6a9 9 0 0 1-18 0z" fill="url(#copaNavOro)" />
    <path d="M19 17h-4a4 4 0 0 0 4 6M37 17h4a4 4 0 0 1-4 6" stroke="#FCD34D" strokeWidth="2" fill="none" />
    <rect x="26" y="29" width="4" height="7" fill="#F59E0B" />
    <rect x="21" y="36" width="14" height="4" rx="1.5" fill="url(#copaNavOro)" />
    <path d="M28 17.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4z" fill="#FFFBEB" />
    <text x="28" y="49" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#FEF3C7" fontFamily="Arial, sans-serif" letterSpacing="0.6">SUB-13</text>
  </svg>
);

// =============================================================================================================
// La invitación (InvitationDetail.tsx): tarjetas blancas de 712 px centradas (maxWidth 760, p-6)
// =============================================================================================================

const GRAY = { 100: '#F3F4F6', 200: '#E5E7EB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 900: '#111827' };
const IX = SIDE + (ANCHO_U - SIDE - 760) / 2 + 24;
const IW = 712;
const KICK = 16.5 + 8;
const FILA_T = 40;
const yTarjeta2 = TOP + 24 + 182 + 16;
const yTarjeta3 = yTarjeta2 + 20 + KICK + 40 + 41 * 7 + 20 + 16;
const yTarjeta4 = yTarjeta3 + 20 + KICK + 40 + 41 * 3 + 20 + 16;
const filaT = (y0: number, i: number) => caja(IX, y0 + 20 + KICK + (i === 0 ? 0 : 40 + 41 * (i - 1)), IW, i === 0 ? 40 : 41);

export const INV_T = {
  tarjeta1: caja(IX, TOP + 24, IW, 182),
  tarjeta2: caja(IX, yTarjeta2, IW, 20 + KICK + 40 + 41 * 7 + 20),
  tarjeta3: caja(IX, yTarjeta3, IW, 20 + KICK + 40 + 41 * 3 + 20),
  tarjeta4: caja(IX, yTarjeta4, IW, 20 + KICK + 20 + 16 + 40 + 20),
  /** Las filas de «Cómo es el torneo» (0 Formato … 7 Puntos). */
  fila: (i: number) => filaT(yTarjeta2, i),
  costo: (i: number) => filaT(yTarjeta3, i),
  aceptar: caja(IX + 20, yTarjeta4 + 20 + KICK + 20 + 16, 168, 40),
  rechazar: caja(IX + 20 + 168 + 12, yTarjeta4 + 20 + KICK + 20 + 16, 106, 40),
  respuesta: caja(IX + 20, yTarjeta4 + 20 + KICK, IW - 40, 40),
  verTorneo: caja(IX + 20, yTarjeta4 + 20 + KICK + 40 + 12, 112, 20),
  fin: yTarjeta4 + 20 + KICK + 20 + 16 + 40 + 20,
};

export type DatosInvitacionT = {
  /** «Tu respuesta» pasa a «Aceptaste esta invitación…» (0 → 1). */
  aceptada: number;
  aceptando?: boolean;
  hover?: { aceptar?: number; verTorneo?: number };
  apretar?: { aceptar?: number };
  resalte?: Partial<Record<'encabezado' | 'formato' | 'fechas' | 'cupos' | 'costos' | 'inscripcion' | 'respuesta' | 'inscrito', number>>;
  /** La página entra (0 → 1) mientras carga. */
  entra?: number;
};

const Kicker: FC<{ children: ReactNode }> = ({ children }) => (
  <p style={{ margin: 0, marginBottom: 8, height: 16.5, fontSize: 11, fontWeight: 700, color: GRAY[400], textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: '16.5px' }}>{children}</p>
);
const tarjetaT: CSSProperties = { position: 'absolute', left: IX, width: IW, background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: 20, boxSizing: 'border-box' };
const FilaT: FC<{ label: string; valor: ReactNode; primera?: boolean; resalte?: number }> = ({ label, valor, primera, resalte = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '10px 0', height: primera ? 40 : 41, boxSizing: 'border-box', borderTop: primera ? undefined : `1px solid ${GRAY[100]}`, position: 'relative' }}>
    {resalte > 0 && <div style={{ position: 'absolute', left: -10, right: -10, top: 2, bottom: 2, borderRadius: 8, background: `rgba(14,165,233,${0.1 * resalte})`, boxShadow: anillo(resalte * 0.8) }} />}
    <span style={{ position: 'relative', fontSize: 14, lineHeight: '20px', color: GRAY[500] }}>{label}</span>
    <span style={{ position: 'relative', fontSize: 14, lineHeight: '20px', fontWeight: 500, color: GRAY[900], textAlign: 'right' }}>{valor}</span>
  </div>
);

export const PaginaInvitacionTorneo: FC<{ d: DatosInvitacionT }> = ({ d }) => {
  const r = d.resalte ?? {};
  const t = COPA_NAVIDAD;
  const ac = d.aceptada;
  const entra = d.entra ?? 1;
  const resFila = (i: number) => (i === 0 ? r.formato : i === 1 || i === 2 ? r.fechas : i === 3 ? r.cupos : 0) ?? 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, opacity: entra, transform: `translateY(${(1 - entra) * 12}px)` }}>
      {/* Invitación a torneo */}
      <div style={{ ...tarjetaT, top: INV_T.tarjeta1.y, height: INV_T.tarjeta1.alto, boxShadow: anillo(r.encabezado) ?? tarjetaT.boxShadow }}>
        <Kicker>Invitación a torneo</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          <LogoCopaNavidad />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 20, lineHeight: '25px', fontWeight: 700, color: GRAY[900] }}>{t.nombre}</h1>
            <p style={{ margin: '2px 0 0', fontSize: 14, lineHeight: '20px', color: GRAY[500] }}>
              {t.deporte} · Organiza {t.organiza}
            </p>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 14, lineHeight: '22.75px', color: GRAY[600] }}>{t.descripcion}</p>
      </div>

      {/* Cómo es el torneo */}
      <div style={{ ...tarjetaT, top: INV_T.tarjeta2.y, height: INV_T.tarjeta2.alto }}>
        <Kicker>Cómo es el torneo</Kicker>
        {t.filas.map(([l, v], i) => (
          <FilaT key={l} label={l} valor={v} primera={i === 0} resalte={resFila(i)} />
        ))}
      </div>

      {/* Costos */}
      <div style={{ ...tarjetaT, top: INV_T.tarjeta3.y, height: INV_T.tarjeta3.alto, boxShadow: anillo(r.costos) ?? tarjetaT.boxShadow }}>
        <Kicker>Costos</Kicker>
        {t.costos.map(([l, v], i) => (
          <FilaT key={l} label={l} valor={v} primera={i === 0} resalte={i === 0 ? r.inscripcion : 0} />
        ))}
      </div>

      {/* Tu respuesta */}
      <div style={{ ...tarjetaT, top: INV_T.tarjeta4.y, height: INV_T.tarjeta4.alto, boxShadow: anillo(r.respuesta) ?? tarjetaT.boxShadow }}>
        <Kicker>Tu respuesta</Kicker>
        {ac < 1 && (
          <div style={{ opacity: 1 - ac }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: '20px', color: GRAY[600] }}>Esta invitación vence el {t.vence}.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 168, height: 40, borderRadius: 12, background: '#059669', color: '#fff', fontSize: 14, fontWeight: 600, display: 'grid', placeItems: 'center', opacity: d.aceptando ? 0.6 : 1, filter: (d.hover?.aceptar ?? 0) > 0 ? `brightness(${1 - 0.1 * (d.hover?.aceptar ?? 0)})` : undefined, transform: hundir(d.apretar?.aceptar) }}>Aceptar invitación</span>
              <span style={{ width: 106, height: 40, borderRadius: 12, border: `1px solid ${GRAY[200]}`, color: GRAY[700], fontSize: 14, fontWeight: 600, display: 'grid', placeItems: 'center', boxSizing: 'border-box', opacity: d.aceptando ? 0.6 : 1 }}>Rechazar</span>
            </div>
          </div>
        )}
        {ac > 0 && (
          <div style={{ position: 'absolute', left: 20, right: 20, top: 20 + KICK, opacity: ac, transform: `translateY(${(1 - ac) * 6}px)` }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: GRAY[700], borderRadius: 6, background: (r.inscrito ?? 0) > 0 ? `rgba(253,224,71,${0.55 * (r.inscrito ?? 0)})` : undefined }}>
              Aceptaste esta invitación. Tu equipo quedó inscrito; el organizador te confirmará el pago de la inscripción.
            </p>
            <span style={{ display: 'inline-block', marginTop: 12, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: '#0284C7', textDecoration: (d.hover?.verTorneo ?? 0) > 0.5 ? 'underline' : undefined }}>Ver el torneo →</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================================================
// Partidos: «Partidos de torneo» (TournamentMatchConfirmations.tsx)
// =============================================================================================================

export type PartidoTorneo = { rival: string; local: boolean; fecha: string; cancha: string };
/** Los partidos de la Academia en la Copa Navidad (como los escribe `fmt` de la app, es-CO). */
export const PARTIDOS_NAVIDAD: PartidoTorneo[] = [
  { rival: 'Halcones', local: true, fecha: 'sáb, 28 de nov, 9:00 a. m.', cancha: 'Polideportivo Norte' },
  { rival: 'Leones', local: false, fecha: 'dom, 29 de nov, 10:30 a. m.', cancha: 'Cancha El Bosque' },
  { rival: 'Pumas FC', local: true, fecha: 'sáb, 5 de dic, 9:00 a. m.', cancha: 'Polideportivo Norte' },
];
export type RespuestaT = 'CONFIRMED' | 'DECLINED' | null;

const SX = SIDE + 24;
const SW = ANCHO_U - SIDE - 48;
const SY = TOP + 20;
/** Alto de cada partido: 1 + 11 + 40 (rival y botones) + 12 + 8 + 1 + 33 (convocatoria) + 11 + 1. */
const FILA_P = 118;
const RX = SX + 1 + 18;
const RW = SW - 2 - 36;
const W_SI = 92;
const W_NO = 114;
const W_CONV = 146;
const yFilaP = (i: number) => SY + 1 + 16 + 40 + 12 + i * (FILA_P + 8);
export const PART = {
  seccion: caja(SX, SY, SW, 1 + 16 + 40 + 12 + 3 * FILA_P + 2 * 8 + 16 + 1),
  chip: caja(RX + RW - 104, SY + 1 + 16 + 8, 104, 24),
  fila: (i: number) => caja(RX, yFilaP(i), RW, FILA_P),
  asistire: (i: number) => caja(RX + RW - 14 - W_NO - 6 - W_SI, yFilaP(i) + 12 + 3.5, W_SI, 33),
  noAsistire: (i: number) => caja(RX + RW - 14 - W_NO, yFilaP(i) + 12 + 3.5, W_NO, 33),
  convocar: (i: number) => caja(RX + RW - 14 - W_CONV, yFilaP(i) + 1 + 11 + 40 + 12 + 9, W_CONV, 33),
  resumen: (i: number) => caja(RX + 14, yFilaP(i) + 1 + 11 + 40 + 12 + 9, 420, 33),
};
const FIN_SECCION = PART.seccion.y + PART.seccion.alto;

export type DatosPartidosT = {
  respuestas: RespuestaT[];
  /** Convocados de cada partido (null = aún no convocó). */
  convocados: (number | null)[];
  plantilla?: string;
  /** Teclas: asistire0, noAsistire0, convocar0… */
  hover?: Partial<Record<string, number>>;
  apretar?: Partial<Record<string, number>>;
  ocupado?: number | null;
  resalte?: Partial<Record<string, number>>;
};

const BotonRespuesta: FC<{ on: boolean; tipo: 'si' | 'no'; hover?: number; apretar?: number; resalte?: number; ocupado?: boolean }> = ({ on, tipo, hover = 0, apretar = 0, resalte = 0, ocupado }) => {
  const c = tipo === 'si' ? { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857' } : { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: tipo === 'si' ? W_SI : W_NO, height: 33, borderRadius: 9, fontSize: 12.5, fontWeight: 600, boxSizing: 'border-box', background: on ? c.bg : hover > 0 ? `rgba(248,250,252,${hover})` : '#fff', border: `1px solid ${on ? c.border : hover > 0.5 ? '#CBD5E1' : '#E5E9F0'}`, color: on ? c.color : '#64748B', opacity: ocupado ? 0.6 : 1, transform: hundir(apretar), boxShadow: anillo(resalte) }}>
      {tipo === 'si' ? <Check size={13} /> : <X size={13} />}
      {tipo === 'si' ? 'Asistiré' : 'No asistiré'}
    </span>
  );
};

const SeccionPartidosTorneo: FC<{ d: DatosPartidosT; tn: Tonos }> = ({ d, tn }) => {
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const r = d.resalte ?? {};
  const sinResponder = d.respuestas.filter((x) => !x).length;
  return (
    <div style={{ position: 'absolute', left: SX, top: SY, width: SW, height: PART.seccion.alto, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 16, padding: '16px 18px', boxSizing: 'border-box', boxShadow: anillo(r.seccion) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, marginBottom: 12 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: tn.b50, color: tn.b600, display: 'grid', placeItems: 'center' }}>
          <Trophy size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: '22px' }}>Partidos de torneo</h2>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: '18px' }}>Confirma si tu equipo asistirá a cada partido.</div>
        </div>
        {sinResponder > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', boxShadow: anillo(r.chip) }}>{sinResponder} sin responder</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PARTIDOS_NAVIDAD.map((m, i) => {
          const st = d.respuestas[i];
          const conv = d.convocados[i];
          return (
            <div key={m.rival} style={{ position: 'relative', height: FILA_P, padding: '11px 13px', border: '1px solid #E5E9F0', borderRadius: 12, background: '#FAFBFC', boxSizing: 'border-box', boxShadow: anillo(r[`fila${i}`]) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 40 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: '20px' }}>
                    {m.local ? 'vs' : 'visita a'} {m.rival}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'flex', gap: 10, lineHeight: '18px' }}>
                    <span>{COPA_NAVIDAD.nombre}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {m.fecha}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} />
                      {m.cancha}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', gap: 6 }}>
                  <BotonRespuesta tipo="si" on={st === 'CONFIRMED'} hover={h[`asistire${i}`]} apretar={a[`asistire${i}`]} resalte={r[`asistire${i}`]} ocupado={d.ocupado === i} />
                  <BotonRespuesta tipo="no" on={st === 'DECLINED'} hover={h[`noAsistire${i}`]} apretar={a[`noAsistire${i}`]} resalte={r[`noAsistire${i}`]} ocupado={d.ocupado === i} />
                </div>
              </div>
              {(conv !== null || st !== 'DECLINED') && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed #E5E9F0', display: 'flex', alignItems: 'center', gap: 10, height: 42, boxSizing: 'border-box' }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 6, padding: '2px 4px', margin: '-2px -4px', background: (r[`resumen${i}`] ?? 0) > 0 ? `rgba(253,224,71,${0.6 * (r[`resumen${i}`] ?? 0)})` : undefined, color: conv !== null ? '#334155' : undefined }}>
                      <Users size={13} style={{ flexShrink: 0 }} />
                      {conv !== null ? `${conv} convocado${conv === 1 ? '' : 's'} · ${d.plantilla ? `Plantilla ${d.plantilla}` : 'Sin plantilla (todo el equipo)'}` : 'Aún no has convocado a tus jugadores'}
                    </span>
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: W_CONV,
                      height: 33,
                      borderRadius: 9,
                      fontSize: 12.5,
                      fontWeight: 600,
                      boxSizing: 'border-box',
                      transform: hundir(a[`convocar${i}`]),
                      boxShadow: anillo(r[`convocar${i}`]),
                      ...(conv !== null
                        ? { background: (h[`convocar${i}`] ?? 0) > 0 ? '#F8FAFC' : '#fff', border: '1px solid #E5E9F0', color: '#0F172A' }
                        : { background: tn.b600, border: `1px solid ${tn.b600}`, color: '#fff', filter: (h[`convocar${i}`] ?? 0) > 0 ? `brightness(${1 - 0.1 * (h[`convocar${i}`] ?? 0)})` : undefined }),
                    }}
                  >
                    {conv !== null ? 'Editar convocatoria' : 'Convocar jugadores'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- El armador de plantillas (MatchesClient.tsx), simplificado, con su naranja (--brand-hue 30) ----------------

const NAR = { b50: 'oklch(0.972 0.014 30)', b100: 'oklch(0.935 0.045 30)', b600: 'oklch(0.60 0.19 30)', b700: 'oklch(0.52 0.18 30)' };
const ROLES = [
  { tag: 'POR', color: '#6366F1' },
  { tag: 'DEF', color: '#0EA5E9' },
  { tag: 'MED', color: '#10B981' },
  { tag: 'DEL', color: '#F97316' },
];
type JugadorP = { nombre: string; rol: 0 | 1 | 2 | 3; num: number };
/** Los titulares de la plantilla «Titulares Sub-13» (4-3-3) y los suplentes. */
export const TITULARES_NAVIDAD: JugadorP[] = [
  { nombre: 'Tomás Rincón', rol: 0, num: 1 },
  { nombre: 'Samuel Díaz', rol: 1, num: 2 },
  { nombre: 'Juan Esteban López', rol: 1, num: 4 },
  { nombre: 'Martín Gil', rol: 1, num: 5 },
  { nombre: 'Lucas Prieto', rol: 1, num: 3 },
  { nombre: 'Emilio Rojas', rol: 2, num: 8 },
  { nombre: 'Andrés Vélez', rol: 2, num: 6 },
  { nombre: 'Pablo Suárez', rol: 2, num: 10 },
  { nombre: 'Nicolás Mejía', rol: 3, num: 7 },
  { nombre: 'Felipe Cano', rol: 3, num: 9 },
  { nombre: 'David Ospina', rol: 3, num: 11 },
];
export const SUPLENTES_NAVIDAD: JugadorP[] = [
  { nombre: 'Simón Arango', rol: 0, num: 12 },
  { nombre: 'Jacobo Reyes', rol: 1, num: 13 },
  { nombre: 'Miguel Ángel Ruiz', rol: 2, num: 14 },
  { nombre: 'Thiago Molina', rol: 2, num: 15 },
  { nombre: 'Matías León', rol: 3, num: 16 },
];
export const PLANTILLA_NAVIDAD = 'Titulares Sub-13';
/** Dónde va cada titular en la cancha (0..1 de ancho y alto), 4-3-3 atacando hacia arriba. */
const POS_433: [number, number][] = [
  [0.5, 0.9],
  [0.16, 0.7], [0.39, 0.74], [0.61, 0.74], [0.84, 0.7],
  [0.25, 0.49], [0.5, 0.53], [0.75, 0.49],
  [0.2, 0.25], [0.5, 0.2], [0.8, 0.25],
];
const corto = (n: string) => {
  const p = n.split(' ');
  return p.length > 2 ? `${p[0]} ${p[1][0]}.` : `${p[0]} ${p[1]?.[0] ?? ''}.`;
};
const iniciales = (n: string) => n.split(' ').map((x) => x[0]).slice(0, 2).join('');

const AY = FIN_SECCION + 24;
export const ARMADOR = {
  encabezado: caja(SX, AY, SW, 68),
  plantillas: caja(SX, AY + 68 + 16, SW, 26 + 66),
  barra: caja(SX, AY + 68 + 16 + 92 + 14, SW, 46),
  tablero: caja(SX, AY + 68 + 16 + 92 + 14 + 46 + 14, SW, 620),
};
const PanelCabeza: FC<{ titulo: string; cuenta: string; icono: ReactNode }> = ({ titulo, cuenta, icono }) => (
  <div style={{ height: 44, padding: '0 14px', borderBottom: '1px solid #E5E9F0', background: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {icono}
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8' }}>{titulo}</span>
    </span>
    <span style={{ fontFamily: jetbrains, fontSize: 12, fontWeight: 600, color: '#64748B' }}>{cuenta}</span>
  </div>
);
const FilaJugador: FC<{ j: JugadorP; tenue?: boolean }> = ({ j, tenue }) => (
  <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px', border: '1px solid #E5E9F0', borderRadius: 8, background: '#fff', opacity: tenue ? 0.5 : 1, boxSizing: 'border-box' }}>
    <span style={{ width: 4, height: 22, borderRadius: 2, background: ROLES[j.rol].color }} />
    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', color: '#475569', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{iniciales(j.nombre)}</span>
    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden' }}>{j.nombre}</span>
    <span style={{ fontFamily: jetbrains, fontSize: 11, color: '#94A3B8' }}>{ROLES[j.rol].tag}</span>
  </div>
);

const ArmadorPlantillas: FC<{ resalte?: number }> = ({ resalte = 0 }) => {
  const T = ARMADOR.tablero;
  const izq = 300;
  const der = 270;
  const cw = SW - izq - der - 28;
  return (
    <>
      {/* Encabezado: nombre de la plantilla, fecha del partido, Restablecer y Guardar plantilla */}
      <div style={{ position: 'absolute', left: SX, top: ARMADOR.encabezado.y, width: SW, height: 68, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 16, padding: '14px 16px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: NAR.b50, color: NAR.b700, border: `1px solid ${NAR.b100}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path strokeLinecap="round" d="M3 9h18M9 21V9" />
          </svg>
        </span>
        <span style={{ flex: 1, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: '#0F172A' }}>
          <span style={{ borderBottom: '1.5px dashed #D9DFE8' }}>{PLANTILLA_NAVIDAD}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', border: '1px solid #E5E9F0', borderRadius: 8, fontSize: 12, boxSizing: 'border-box' }}>
          <span style={{ color: '#64748B', fontWeight: 500 }}>
            Fecha del partido <span style={{ color: '#B91C1C' }}>*</span>
          </span>
          <span style={{ fontFamily: jetbrains }}>28/11/2026, 09:00 a. m.</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 12px', border: '1px solid #E5E9F0', borderRadius: 8, fontSize: 12, fontWeight: 500, boxSizing: 'border-box' }}>Restablecer</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: NAR.b600, color: '#fff', boxSizing: 'border-box' }}>Guardar plantilla</span>
      </div>

      {/* Plantillas guardadas */}
      <div style={{ position: 'absolute', left: SX, top: ARMADOR.plantillas.y, width: SW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: 16, marginBottom: 10, fontSize: 10, fontWeight: 600 }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8' }}>Plantillas guardadas</span>
          <span style={{ color: '#64748B', fontFamily: jetbrains }}>1 guardada</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          <div style={{ height: 66, padding: '11px 13px', borderRadius: 10, border: `1.5px solid ${NAR.b600}`, background: NAR.b50, boxSizing: 'border-box', boxShadow: anillo(resalte) }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{PLANTILLA_NAVIDAD}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', marginTop: 4 }}>
              <span style={{ fontFamily: jetbrains, fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#fff', border: '1px solid #E5E9F0' }}>4-3-3</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
              Sub-13
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94A3B8' }}>11 + 5</span>
            </div>
          </div>
          <div style={{ height: 66, borderRadius: 10, border: '1.5px dashed #D9DFE8', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: '#64748B', boxSizing: 'border-box' }}>+ Nueva plantilla</div>
        </div>
      </div>

      {/* Barra: categoría, jugadores en cancha y formación */}
      <div style={{ position: 'absolute', left: SX, top: ARMADOR.barra.y, width: SW, height: 46, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18, padding: '0 14px', boxSizing: 'border-box', fontSize: 12.5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>Categoría</span>
          <span style={{ fontWeight: 600 }}>Sub-13</span>
          <ChevronDown size={13} color="#94A3B8" />
        </span>
        <span style={{ width: 1, height: 22, background: '#E5E9F0' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>Formación</span>
          <span style={{ fontWeight: 600, fontFamily: jetbrains }}>4-3-3</span>
          <ChevronDown size={13} color="#94A3B8" />
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: jetbrains, fontSize: 12, color: '#047857', fontWeight: 600 }}>11/11</span>
      </div>

      {/* Tablero: convocados, cancha y alineación */}
      <div style={{ position: 'absolute', left: SX, top: T.y, width: izq, height: T.alto, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', boxSizing: 'border-box' }}>
        <PanelCabeza titulo="Convocados" cuenta="16" icono={<Users size={14} color="#94A3B8" />} />
        <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', borderBottom: '1px solid #E5E9F0' }}>
          {ROLES.map((x) => (
            <span key={x.tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#64748B' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: x.color }} />
              {x.tag}
            </span>
          ))}
        </div>
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...SUPLENTES_NAVIDAD, ...TITULARES_NAVIDAD.slice(0, 7)].map((j, i) => (
            <FilaJugador key={j.nombre} j={j} tenue={i >= SUPLENTES_NAVIDAD.length} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SX + izq + 14, top: T.y, width: cw, height: T.alto, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 14, boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(180deg, #2A7D44, #2F8A4B 50%, #2A7D44)' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 12.5}%`, height: '6.25%', background: 'rgba(0,0,0,0.05)' }} />
          ))}
          <div style={{ position: 'absolute', inset: 14, border: '2px solid rgba(255,255,255,0.55)', borderRadius: 3 }} />
          <div style={{ position: 'absolute', left: 14, right: 14, top: '50%', height: 2, background: 'rgba(255,255,255,0.55)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 110, height: 110, marginLeft: -55, marginTop: -55, border: '2px solid rgba(255,255,255,0.55)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', left: '28%', right: '28%', top: 14, height: 70, border: '2px solid rgba(255,255,255,0.55)', borderTop: 'none' }} />
          <div style={{ position: 'absolute', left: '28%', right: '28%', bottom: 14, height: 70, border: '2px solid rgba(255,255,255,0.55)', borderBottom: 'none' }} />
          {TITULARES_NAVIDAD.map((j, i) => (
            <div key={j.nombre} style={{ position: 'absolute', left: `${POS_433[i][0] * 100}%`, top: `${POS_433[i][1] * 100}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', border: `3px solid ${ROLES[j.rol].color}`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: '#0F172A', boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>{j.num}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(15,23,42,0.55)', borderRadius: 5, padding: '1px 6px', whiteSpace: 'nowrap' }}>{corto(j.nombre)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SX + SW - der, top: T.y, width: der, height: T.alto, background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', boxSizing: 'border-box' }}>
        <PanelCabeza titulo="Alineación" cuenta="11/11" icono={<Check size={14} color="#94A3B8" />} />
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', padding: '2px 2px 4px' }}>
            <span>Titulares</span>
            <span style={{ fontFamily: jetbrains }}>11/11</span>
          </div>
          {TITULARES_NAVIDAD.slice(0, 11).map((j) => (
            <div key={j.nombre} style={{ height: 34, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRadius: 7, background: '#FAFBFC', border: '1px solid #EEF1F5', fontSize: 12, fontWeight: 600, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: jetbrains, fontSize: 11, color: '#94A3B8', width: 16 }}>{j.num}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{j.nombre}</span>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: ROLES[j.rol].color }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/** La página Partidos del entrenador: «Partidos de torneo» arriba y el armador de plantillas abajo. */
export const PaginaPartidosCoach: FC<{ d: DatosPartidosT; tn: Tonos; entra?: number; resaltePlantilla?: number }> = ({ d, tn, entra = 1, resaltePlantilla }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, opacity: entra, transform: `translateY(${(1 - entra) * 12}px)` }}>
    <SeccionPartidosTorneo d={d} tn={tn} />
    <ArmadorPlantillas resalte={resaltePlantilla} />
  </div>
);

// =============================================================================================================
// «Convocar al partido» (CreateTeamEventModal.tsx con `tournamentMatch`)
// =============================================================================================================

const MW = 640;
const MB = 22;
const MIW = MW - 2 * MB;
/** Alturas de cada bloque del cuerpo (con su margen de abajo). */
const BLOQ = { torneo: 50 + 14, sede: 82 + 14, titulo: 64 + 14, plantilla: 115 + 14, fecha: 64 + 14, lugar: 64 + 14, descripcion: 104 + 14, interruptor: 60 + 8, cobertura: 22.5 };
const CABEZA_M = 82;
const PIE_M = 66;
const CUERPO_M = 18 + BLOQ.torneo + BLOQ.sede + BLOQ.titulo + BLOQ.plantilla + BLOQ.fecha + BLOQ.lugar + BLOQ.descripcion + 2 * BLOQ.interruptor + BLOQ.cobertura + BLOQ.interruptor + 18;
export const ALTO_CONVOCAR = CABEZA_M + CUERPO_M + PIE_M;
export const CONVOCAR_V = (vh: number) => {
  const r = caja((ANCHO_U - MW) / 2, Math.round((vh - ALTO_CONVOCAR) / 2), MW, ALTO_CONVOCAR);
  const x = r.x + MB;
  const y0 = r.y + CABEZA_M + 18;
  const yPl = y0 + BLOQ.torneo + BLOQ.sede + BLOQ.titulo;
  const yInt = yPl + BLOQ.plantilla + BLOQ.fecha + BLOQ.lugar + BLOQ.descripcion;
  const half = (MIW - 8) / 2;
  return {
    r,
    torneo: caja(x, y0, MIW, 50),
    titulo: caja(x, y0 + BLOQ.torneo + BLOQ.sede + 24, MIW, 40),
    plantillas: caja(x, yPl + 24, MIW, 69),
    plantilla: (i: number) => caja(x + i * (half + 8), yPl + 24, half, 69),
    ayuda: caja(x, yPl + 24 + 69 + 6, MIW, 16),
    fecha: caja(x, yPl + BLOQ.plantilla, MIW, 64),
    whatsapp: caja(x, yInt + BLOQ.interruptor, MIW, 60),
    cobertura: caja(x, yInt + 2 * BLOQ.interruptor - 2, MIW, 17),
    publicar: caja(r.x + MW - MB - 122, r.y + ALTO_CONVOCAR - PIE_M + 14, 122, 38),
    cerrar: caja(r.x + MW - MB - 32, r.y + 18, 32, 32),
  };
};

export type DatosConvocar = {
  t: number;
  /** Plantilla elegida (true = «Titulares Sub-13»; false = «Sin plantilla»). */
  plantilla: boolean;
  publicando?: boolean;
  hover?: { plantilla?: number; ninguna?: number; publicar?: number };
  apretar?: { plantilla?: number; publicar?: number };
  resalte?: Partial<Record<'torneo' | 'titulo' | 'plantillas' | 'ayuda' | 'whatsapp' | 'cobertura', number>>;
};

const Etq: FC<{ children: ReactNode }> = ({ children }) => <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6, height: 18, lineHeight: '18px' }}>{children}</div>;
const Ent: FC<{ valor?: string; ejemplo?: string; alto?: number; flecha?: boolean; resalte?: number }> = ({ valor, ejemplo, alto = 40, flecha, resalte }) => (
  <div style={{ height: alto, padding: '0 12px', border: '1px solid #E5E9F0', borderRadius: 8, background: '#FAFBFC', fontSize: 13, color: valor ? '#0F172A' : '#94A3B8', display: 'flex', alignItems: alto > 40 ? 'flex-start' : 'center', paddingTop: alto > 40 ? 9 : 0, justifyContent: 'space-between', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: anillo(resalte) }}>
    <span>{valor || ejemplo}</span>
    {flecha && <ChevronDown size={13} color="#64748B" />}
  </div>
);
const Interruptor: FC<{ etiqueta: string; descripcion: string; on: boolean; tn: Tonos; resalte?: number }> = ({ etiqueta, descripcion, on, tn, resalte }) => (
  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 12px', border: '1px solid #E5E9F0', borderRadius: 9, background: '#FAFBFC', marginBottom: 8, boxSizing: 'border-box', boxShadow: anillo(resalte) }}>
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#0F172A', lineHeight: '19.5px' }}>{etiqueta}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748B', lineHeight: '16.5px' }}>{descripcion}</p>
    </div>
    <span style={{ position: 'relative', width: 36, height: 20, borderRadius: 999, background: on ? tn.b600 : '#D9DFE8', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
    </span>
  </div>
);
const MiniCancha: FC = () => (
  <svg width="36" height="46" viewBox="0 0 36 46" style={{ flexShrink: 0, borderRadius: 6 }}>
    <defs>
      <linearGradient id="miniCanchaConv" x1="0" y1="0" x2="0" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2A7D44" />
        <stop offset="50%" stopColor="#2F8A4B" />
        <stop offset="100%" stopColor="#2A7D44" />
      </linearGradient>
    </defs>
    <rect width="36" height="46" rx="6" fill="url(#miniCanchaConv)" />
    {[0, 13, 26, 39].map((y) => (
      <rect key={y} x="0" y={y} width="36" height="6.5" fill="rgba(0,0,0,0.05)" />
    ))}
    <rect x="3" y="3" width="30" height="40" rx="1" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <line x1="3" y1="23" x2="33" y2="23" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
    <circle cx="18" cy="23" r="5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <rect x="9" y="3" width="18" height="7" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
    <rect x="9" y="36" width="18" height="7" rx="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
  </svg>
);
const TarjetaPlantilla: FC<{ ninguna?: boolean; elegida: boolean; tn: Tonos; hover?: number; apretar?: number }> = ({ ninguna, elegida, tn, hover = 0, apretar = 0 }) => (
  <div style={{ height: 69, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${elegida ? tn.b600 : hover > 0.5 ? '#94A3B8' : '#E5E9F0'}`, background: elegida ? tn.b50 : hover > 0 ? `rgba(241,245,249,${hover})` : ninguna ? '#fff' : '#FAFBFC', boxSizing: 'border-box', transform: hundir(apretar) }}>
    {ninguna ? (
      <div style={{ width: 36, height: 46, borderRadius: 6, background: '#F1F5F9', border: '1.5px dashed #D9DFE8', display: 'grid', placeItems: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>—</span>
      </div>
    ) : (
      <MiniCancha />
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>{ninguna ? 'Sin plantilla' : PLANTILLA_NAVIDAD}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748B', fontFamily: jetbrains }}>{ninguna ? 'Solo evento' : '4-3-3 · Sub-13'}</p>
    </div>
  </div>
);
/** El ícono de Partido (balón) en el color de la marca. */
const IconoPartido: FC<{ tn: Tonos }> = ({ tn }) => (
  <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0, background: tn.b50, color: tn.b700 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
    </svg>
  </div>
);

export const VentanaConvocar: FC<{ d: DatosConvocar; vh: number; tn: Tonos }> = ({ d, vh, tn }) => {
  if (d.t <= 0) return null;
  const L = CONVOCAR_V(vh);
  const r = d.resalte ?? {};
  const half = (MIW - 8) / 2;
  const m = PARTIDOS_NAVIDAD[0];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.45 * Math.min(1, d.t * 1.5)})`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: MW, height: ALTO_CONVOCAR, background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', overflow: 'hidden', zIndex: 101, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.97 + 0.03 * d.t})`, display: 'flex', flexDirection: 'column', fontFamily: instrument, color: '#0F172A' }}>
        <div style={{ height: CABEZA_M, padding: '18px 22px', borderBottom: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', gap: 12, boxSizing: 'border-box', flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: '24px' }}>Convocar al partido</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: '18px' }}>Elige la plantilla: sus titulares y suplentes reciben la invitación.</p>
          </div>
          <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: '#64748B' }}>
            <X size={14} />
          </span>
        </div>
        <div style={{ height: CUERPO_M, padding: `18px ${MB}px`, boxSizing: 'border-box', flexShrink: 0 }}>
          <div style={{ height: 50, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 9, border: '1px solid #E5E9F0', background: '#FAFBFC', boxSizing: 'border-box', boxShadow: anillo(r.torneo) }}>
            <IconoPartido tn={tn} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>Partido de torneo</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: '#64748B', lineHeight: '16.5px' }}>{COPA_NAVIDAD.nombre}</p>
            </div>
          </div>
          <div style={{ height: 82, marginBottom: 14 }}>
            <Etq>Sede</Etq>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todas las sedes', 'Sede Norte', 'Sede principal'].map((s, i) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 35, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1.5px solid ${i === 0 ? tn.b600 : '#E5E9F0'}`, background: i === 0 ? tn.b50 : '#FAFBFC', color: i === 0 ? tn.b700 : '#0F172A', boxSizing: 'border-box' }}>
                  {i > 0 && <MapPin size={12} />}
                  {s}
                </span>
              ))}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748B', lineHeight: '16.5px' }}>Se convoca a los jugadores de todas las sedes.</p>
          </div>
          <div style={{ height: 64, marginBottom: 14 }}>
            <Etq>Título</Etq>
            <Ent valor={`vs ${m.rival} · ${COPA_NAVIDAD.nombre}`} resalte={r.titulo} />
          </div>
          <div style={{ height: 115, marginBottom: 14 }}>
            <Etq>
              Plantilla del equipo <span style={{ color: '#94A3B8', fontWeight: 400 }}>· opcional</span>
            </Etq>
            <div style={{ display: 'grid', gridTemplateColumns: `${half}px ${half}px`, gap: 8, borderRadius: 10, boxShadow: anillo(r.plantillas) }}>
              <TarjetaPlantilla ninguna elegida={!d.plantilla} tn={tn} hover={d.hover?.ninguna} />
              <TarjetaPlantilla elegida={d.plantilla} tn={tn} hover={d.hover?.plantilla} apretar={d.apretar?.plantilla} />
            </div>
            <p style={{ margin: '6px 2px 0', fontSize: 11, color: '#64748B', lineHeight: '15.4px', borderRadius: 4, background: (r.ayuda ?? 0) > 0 ? `rgba(253,224,71,${0.55 * (r.ayuda ?? 0)})` : undefined }}>
              {d.plantilla ? 'Solo se convoca y se avisa por WhatsApp a los titulares y suplentes de esta plantilla.' : 'Sin plantilla: se convoca a todos los jugadores del equipo.'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 64, marginBottom: 14 }}>
            <div>
              <Etq>Fecha</Etq>
              <Ent valor="28/11/2026" />
            </div>
            <div>
              <Etq>Hora</Etq>
              <Ent valor="09:00 a. m." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 64, marginBottom: 14 }}>
            <div>
              <Etq>Lugar</Etq>
              <Ent valor={m.cancha} />
            </div>
            <div>
              <Etq>Duración</Etq>
              <Ent valor="Sin especificar" flecha />
            </div>
          </div>
          <div style={{ height: 104, marginBottom: 14 }}>
            <Etq>Descripción</Etq>
            <Ent ejemplo="Detalles, lista de equipamiento, instrucciones..." alto={80} />
          </div>
          <Interruptor etiqueta="Solicitar confirmación (RSVP)" descripcion="Los miembros podrán responder Voy / No voy / Tal vez" on tn={tn} />
          <Interruptor etiqueta="Enviar invitación por WhatsApp" descripcion="A cada jugador convocado, con fecha, hora, cancha y botones para confirmar" on tn={tn} resalte={r.whatsapp} />
          <p style={{ margin: '-2px 0 8px', paddingLeft: 2, height: 16.5, fontSize: 11, lineHeight: '16.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ borderRadius: 4, background: (r.cobertura ?? 0) > 0 ? `rgba(253,224,71,${0.6 * (r.cobertura ?? 0)})` : undefined, padding: '0 3px', margin: '0 -3px' }}>✓ Todos los jugadores recibirán el aviso</span>
          </p>
          <Interruptor etiqueta="Recordatorio 24h antes" descripcion="Notificación automática a quienes no han confirmado" on={false} tn={tn} />
        </div>
        <div style={{ height: PIE_M, padding: '0 22px', background: '#FAFBFC', borderTop: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={14} /> Solo el equipo verá esto
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #E5E9F0', background: '#fff', fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>Cancelar</span>
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
// El aviso por WhatsApp (plantilla `invitation_match`), en el celular del jugador
// =============================================================================================================

/** El cuerpo de la plantilla con sus 5 datos (jugador, local vs visitante, fecha, hora y cancha). */
export const textoConvocatoria = (jugador: string, partido: string, fecha: string, hora: string, cancha: string) =>
  `Hola ${jugador}, fuiste convocado al partido ${partido} el ${fecha} a las ${hora} en la cancha ${cancha}.`;
export const BOTONES_CONVOCATORIA = ['Voy', 'Tal vez', 'No voy'] as const;
/** Centro del botón «Voy» en la pantalla del celular (con el texto de `textoConvocatoria` en 8 líneas). */
export const BOTON_VOY_CONV = { x: 173, y: 403 };

/**
 * Chat con la cuenta de empresa «Gali Esport»: llega la convocatoria con su encabezado y sus botones; `voy` (0 → 1) marca
 * «Voy» apretado y `respuesta` (0 → 1) hace salir el «Voy» del jugador.
 */
export const PantallaConvocatoria: FC<{ texto: string; hora: string; llega: number; voy?: number; respuesta?: number; resalte?: number[] }> = ({ texto, hora, llega, voy = 0, respuesta = 0, resalte = [] }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#EFEAE2', fontFamily: SISTEMA }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 10px 10px, #000 1.5px, transparent 0)', backgroundSize: '26px 26px' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 108, background: '#F0F2F5', borderBottom: '1px solid #D1D7DB', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px', boxSizing: 'border-box', gap: 10 }}>
      <svg width={14} height={22} viewBox="0 0 14 22">
        <path d="M12 2 L3 11 L12 20" stroke="#0F172A" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: MARINO, display: 'grid', placeItems: 'center' }}>
        <Isotipo tamano={30} trazo="#FFFFFF" />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#111B21', display: 'flex', alignItems: 'center', gap: 6 }}>
          Gali Esport
          <svg width={16} height={16} viewBox="0 0 16 16">
            <circle cx={8} cy={8} r={8} fill="#25D366" />
            <path d="M4.5 8.2 L7 10.6 L11.6 5.6" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 13, color: '#667781' }}>Cuenta de empresa</div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: '50%', top: 128, transform: 'translateX(-50%)', background: 'white', color: '#54656F', fontSize: 12.5, padding: '5px 12px', borderRadius: 8, boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)' }}>HOY</div>
    <div style={{ position: 'absolute', left: 14, top: 172, width: 318, opacity: Math.min(1, llega * 2), transform: `translateY(${(1 - llega) * 30}px) scale(${0.92 + 0.08 * llega})`, transformOrigin: '0 0' }}>
      <div style={{ background: 'white', borderRadius: '0 10px 10px 10px', padding: '9px 11px 8px', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)', fontSize: 16, lineHeight: 1.36, color: '#111B21' }}>
        <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 6 }}>Convocatoria a partido</div>
        {texto}
        <div style={{ marginTop: 10 }}>Confirma tu asistencia con uno de los botones.</div>
        <div style={{ textAlign: 'right', fontSize: 11.5, color: '#667781', marginTop: 4 }}>{hora}</div>
      </div>
      {BOTONES_CONVOCATORIA.map((b, i) => (
        <div key={b} style={{ marginTop: 3, height: 44, borderRadius: 10, background: i === 0 && voy > 0 ? `rgba(231,241,245,${Math.min(1, voy * 2)})` : 'white', boxShadow: anillo(resalte[i] ?? 0) ?? '0 1px 0.5px rgba(11,20,26,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#027EB5', fontSize: 16, fontWeight: 500, transform: `scale(${1 + 0.04 * (resalte[i] ?? 0)})` }}>
          <svg width={16} height={14} viewBox="0 0 16 14">
            <path d="M6 1 L1 6 L6 11 M1 6 H10 Q15 6 15 11 V13" stroke="#027EB5" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {b}
        </div>
      ))}
      {respuesta > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, marginRight: -4 }}>
          <div style={{ opacity: Math.min(1, respuesta * 2), transform: `translateY(${(1 - respuesta) * 24}px)`, background: '#D9FDD3', borderRadius: '10px 0 10px 10px', padding: '8px 12px', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)', fontSize: 17, color: '#111B21', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            Voy
            <span style={{ fontSize: 11.5, color: '#667781', display: 'flex', alignItems: 'center', gap: 3 }}>
              {hora} <span style={{ color: '#53BDEB', fontSize: 13 }}>✓✓</span>
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
);

