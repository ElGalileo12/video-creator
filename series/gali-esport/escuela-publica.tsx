// El perfil público de una escuela en escritorio ({slug}.galiesport.com), fiel a la app (desde `mi-escuela`).
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Armado: app/equipos/[slug]/TeamProfilePage.tsx (fondo #f0f6fb, ancho máximo 1200, px 24).
// - Encabezado: feature/public/components/TeamProfileHero.tsx (portada, escudo, nombre con la insignia «Escuela
//   verificada», chips Activo / ubicación «· n sedes» / «Desde 2010» / categoría · deporte, bio, «Solicitar unirme»,
//   «Compartir» y el marcador Partidos, Goles, Victorias, Plantilla).
// - Pestañas y filtros Sede / Categoría: TeamProfileTabs.tsx. Noticias: NewsPanel.tsx. Información: InfoTab.tsx.
//   Cuerpo técnico: StaffTab.tsx.
// Todo en píxeles de la página (1280 de ancho). `scroll` baja la página.
// También las imágenes de ejemplo (dibujadas aquí, nada de fotos reales): el escudo del fénix, la portada de cancha y
// los avatares ilustrados del cuerpo técnico.
import { Banknote, CalendarDays, Check, ChevronDown, ChevronRight, ClipboardList, Clock, CreditCard, IdCard, Info, MapPin, MessagesSquare, Newspaper, Share2, ShieldCheck, Sparkles, Tag, Trophy, UserPlus, Users, Zap } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { instrument, jetbrains, schibsted } from './letras';

// =============================================================================================================
// Datos de ejemplo (los del pedido, siempre los mismos)
// =============================================================================================================

export const ACADEMIA = {
  nombre: 'Academia Fénix Bogotá',
  slug: 'academia-fenix-bogota',
  host: 'academia-fenix-bogota.galiesport.com',
  ubicacion: 'Bogotá, Colombia',
  fundacion: '2010',
  bio: 'Formamos futbolistas desde los 5 años en Bogotá, con entrenadores licenciados y dos sedes. ¡Ven a una clase de prueba gratis!',
  azul: '#2563eb',
  verde: '#16a34a',
  telefono: '300 123 4567',
  categoria: 'Sub-10',
  deporte: 'Fútbol',
  entrenador: 'Carlos Rodríguez',
};

// =============================================================================================================
// Color (feature/public/model/color.ts)
// =============================================================================================================

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
};
const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
export const darkenHex = (h: string, a: number) => hex(...(rgb(h).map((v) => v * (1 - a)) as [number, number, number]));
export const lightenHex = (h: string, a: number) => hex(...(rgb(h).map((v) => v + (255 - v) * a) as [number, number, number]));
/** Mezcla dos colores hex (t de 0 a 1). */
export const mezclarHex = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};
const luminance = (h: string) => {
  const l = rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};
const readableOn = (h: string) => (luminance(h) > 0.4 ? '#0b1f2e' : '#ffffff');
/** Pesos colombianos como los escribe la app (Intl es-CO, COP): «$ 80.000». */
export const formatCOP = (n: number) => `$ ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const INK = '#0b1f2e';
const MUTED = '#4a6478';
const LINE = 'rgba(11,31,46,.08)';

// =============================================================================================================
// Imágenes de ejemplo
// =============================================================================================================

/** El logo de la escuela: escudo verde con un fénix (imagen cuadrada, fondo blanco). */
export const EscudoFenix: FC<{ tamano?: number | string; style?: CSSProperties }> = ({ tamano = '100%', style }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 100 100" style={{ display: 'block', ...style }}>
    <defs>
      <linearGradient id="ef-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#22c55e" />
        <stop offset="1" stopColor="#0f6b34" />
      </linearGradient>
      <linearGradient id="ef-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="#ffffff" />
    <path d="M50 7 L85 18 V47 C85 70 70 86 50 94 C30 86 15 70 15 47 V18 Z" fill="url(#ef-g)" stroke="#0b4d26" strokeWidth="2.5" />
    <path d="M50 13 L79 22.5 V47 C79 66 67 80 50 87.5 C33 80 21 66 21 47 V22.5 Z" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.6" />
    {/* alas */}
    <path d="M50 46 C45 36 36 30 25 31 C31 34 34 38 35 42 C30 40 26 41 23 44 C30 45 34 48 36 52 C32 52 29 54 27 57 C35 56 42 55 47 58 Z" fill="url(#ef-f)" />
    <path d="M50 46 C55 36 64 30 75 31 C69 34 66 38 65 42 C70 40 74 41 77 44 C70 45 66 48 64 52 C68 52 71 54 73 57 C65 56 58 55 53 58 Z" fill="url(#ef-f)" />
    {/* cuerpo, cabeza y cola de llamas */}
    <path d="M50 36 C53 38 54 42 53 47 L53 62 C53 66 51.5 68 50 70 C48.5 68 47 66 47 62 L47 47 C46 42 47 38 50 36 Z" fill="#fff7d6" />
    <circle cx="50" cy="33" r="4" fill="#fff7d6" />
    <path d="M50 29.5 L52.5 26 L51.2 30.5 Z" fill="#fde68a" />
    <path d="M50 70 C46 74 44 77 45 82 C47 79 48.5 78 50 78 C51.5 78 53 79 55 82 C56 77 54 74 50 70 Z" fill="url(#ef-f)" />
    <path d="M50 74 C48 77 48 80 50 84 C52 80 52 77 50 74 Z" fill="#ef4444" opacity="0.85" />
  </svg>
);

/** La portada: una cancha abstracta (césped a franjas y líneas blancas, sin personas). Llena su contenedor. */
export const PortadaCancha: FC<{ style?: CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', ...style }}>
    <defs>
      <linearGradient id="pc-cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14532d" />
        <stop offset="1" stopColor="#166534" />
      </linearGradient>
      <radialGradient id="pc-luz" cx="0.7" cy="0.1" r="0.8">
        <stop offset="0" stopColor="#bbf7d0" stopOpacity="0.45" />
        <stop offset="1" stopColor="#bbf7d0" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="300" fill="url(#pc-cielo)" />
    {Array.from({ length: 12 }, (_, k) => (
      <rect key={k} x={k * 100} y="0" width="100" height="300" fill={k % 2 ? '#15803d' : '#16a34a'} opacity="0.9" />
    ))}
    <rect width="1200" height="300" fill="url(#pc-luz)" />
    <g fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="5">
      <rect x="40" y="30" width="1120" height="240" />
      <line x1="600" y1="30" x2="600" y2="270" />
      <circle cx="600" cy="150" r="62" />
      <rect x="40" y="85" width="120" height="130" />
      <rect x="1040" y="85" width="120" height="130" />
      <path d="M160 118 A40 40 0 0 1 160 182" />
      <path d="M1040 118 A40 40 0 0 0 1040 182" />
    </g>
    <circle cx="600" cy="150" r="7" fill="#ffffff" fillOpacity="0.9" />
  </svg>
);

export type Persona = 'carlos' | 'andres' | 'laura';
const PERSONAS: Record<Persona, { fondo: string; piel: string; pelo: string; camisa: string; largo?: boolean; barba?: boolean }> = {
  carlos: { fondo: '#dcfce7', piel: '#e0ac69', pelo: '#2b1d14', camisa: '#16a34a', barba: true },
  andres: { fondo: '#dbeafe', piel: '#c68642', pelo: '#1f1a17', camisa: '#0f172a' },
  laura: { fondo: '#fce7f3', piel: '#f1c27d', pelo: '#5b3a1e', camisa: '#0ea5e9', largo: true },
};

/** Avatar ilustrado (no es una foto real). Llena su contenedor. */
export const AvatarIlustrado: FC<{ persona: Persona; style?: CSSProperties }> = ({ persona, style }) => {
  const p = PERSONAS[persona];
  return (
    <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', ...style }}>
      <rect width="100" height="120" fill={p.fondo} />
      {p.largo && <path d="M27 50 C25 28 37 18 50 18 C63 18 75 28 73 50 L75 86 L25 86 Z" fill={p.pelo} />}
      <path d="M14 120 C14 96 30 86 50 86 C70 86 86 96 86 120 Z" fill={p.camisa} />
      <path d="M42 80 L58 80 L58 92 C55 96 45 96 42 92 Z" fill={p.piel} />
      <ellipse cx="50" cy="56" rx="19" ry="23" fill={p.piel} />
      {!p.largo && <path d="M31 52 C29 33 39 26 50 26 C62 26 71 33 69 52 C66 42 60 38 50 38 C40 38 34 42 31 52 Z" fill={p.pelo} />}
      {p.largo && <path d="M31 50 C31 34 40 28 50 28 C60 28 69 34 69 50 C64 40 57 37 50 37 C43 37 36 40 31 50 Z" fill={p.pelo} />}
      {p.barba && <path d="M33 60 C34 74 42 80 50 80 C58 80 66 74 67 60 C63 68 57 70 50 70 C43 70 37 68 33 60 Z" fill={p.pelo} opacity="0.85" />}
      <circle cx="43" cy="56" r="2.2" fill="#1f2937" />
      <circle cx="57" cy="56" r="2.2" fill="#1f2937" />
      <path d="M44 67 Q50 71 56 67" fill="none" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

// =============================================================================================================
// El perfil público
// =============================================================================================================

export type SedePublica = { nombre: string; direccion: string; horario: string; mensualidad: number };
export const SEDES_ACADEMIA: SedePublica[] = [
  { nombre: 'Sede Norte', direccion: 'Cra. 15 #127-40, Usaquén, Bogotá', horario: 'Sub-10: martes y jueves 4:00–5:30 pm', mensualidad: 60000 },
  { nombre: 'Sede principal', direccion: 'Calle 63 #50-20, Bogotá', horario: 'Sub-12: lunes y miércoles 4:00–5:30 pm', mensualidad: 60000 },
];

export type InfoPublica = {
  prueba: boolean;
  sedes: SedePublica[];
  inscripcion: number | null;
  mensualidad: number | null;
  uniforme: number | null;
  incluye: string | null;
  uniformeDetalle: string | null;
  descuentos: string | null;
  pagos: string[];
  notasPago: string | null;
  requisitos: string | null;
  politicas: string | null;
  whatsapp: boolean;
  correo: string | null;
};

export const INFO_ACADEMIA: InfoPublica = {
  prueba: true,
  sedes: SEDES_ACADEMIA,
  inscripcion: 80000,
  mensualidad: 60000,
  uniforme: 120000,
  incluye: '3 entrenamientos por semana, seguro deportivo e hidratación.',
  uniformeDetalle: 'Camiseta, pantaloneta, medias y morral.',
  descuentos: '10% por segundo hermano',
  pagos: ['Efectivo', 'Transferencia bancaria', 'Nequi'],
  notasPago: null,
  requisitos: 'Fotocopia del documento, certificado de EPS y foto 3x4',
  politicas: null,
  whatsapp: true,
  correo: 'contacto@ejemplo.com',
};

export type MiembroPublico = { nombre: string; rol: string | null; persona?: Persona; foto: boolean; nacionalidad?: string; licencia?: string; bio?: string; entrenador?: boolean; nuevo?: number };
export const STAFF_ACADEMIA: MiembroPublico[] = [
  { nombre: 'Carlos Rodríguez', rol: 'Entrenador principal', persona: 'carlos', foto: true, nacionalidad: 'Colombiana', licencia: 'C', bio: 'Entrenador con licencia C. Forma futbolistas en Bogotá desde 2010.', entrenador: true },
  { nombre: 'Andrés Gómez', rol: 'Asistente técnico', persona: 'andres', foto: true, nacionalidad: 'Colombiana' },
  { nombre: 'Laura Martínez', rol: 'Preparadora física', persona: 'laura', foto: true, nacionalidad: 'Colombiana' },
];

export type PestanaPublica = 'noticias' | 'informacion' | 'cuerpo';

export type DatosPerfil = {
  pc: string;
  nombre: string;
  logo: number;
  portada: number;
  /** La insignia de verificada (0 → 1 aparece con un saltito). */
  verificada: number;
  bio: string;
  ubicacion: string;
  desde: string;
  categoria: string | null;
  unirse: boolean;
  marcador: boolean;
  pestana: PestanaPublica;
  /** 0 → 1: el contenido de la pestaña entra (al cambiar de pestaña). */
  entra?: number;
  info: InfoPublica | null;
  staff: MiembroPublico[];
  instagram: boolean;
};

export const PERFIL_COMPLETO: DatosPerfil = {
  pc: ACADEMIA.verde,
  nombre: ACADEMIA.nombre,
  logo: 1,
  portada: 1,
  verificada: 1,
  bio: ACADEMIA.bio,
  ubicacion: ACADEMIA.ubicacion,
  desde: ACADEMIA.fundacion,
  categoria: ACADEMIA.categoria,
  unirse: true,
  marcador: true,
  pestana: 'noticias',
  info: INFO_ACADEMIA,
  staff: STAFF_ACADEMIA,
  instagram: true,
};

// --- Medidas (escritorio, contenedor de 1152 que empieza en x = 64) ---
const C0 = 64;
const CW = 1152;
const BANNER = 184;
/** Alto del bloque escudo · datos · botones (nombre, chips y una bio de dos líneas). */
const CABEZA = 150;
const MARCADOR = 136;
export const HERO_P = { x: C0, y: 24, ancho: CW, alto: BANNER + CABEZA + 24 + MARCADOR + 28 };
export const ESCUDO_P = { x: C0 + 28, y: 24 + BANNER - 64, ancho: 112, alto: 128 };
export const NOMBRE_P = { x: C0 + 28 + 112 + 24, y: 24 + BANNER + 18 };
export const CHIPS_P = { x: NOMBRE_P.x, y: NOMBRE_P.y + 36 + 11 };
export const BIO_P = { x: NOMBRE_P.x, y: CHIPS_P.y + 28 + 11, ancho: 560, alto: 46 };
export const MARCADOR_P = { x: C0 + 28, y: 24 + BANNER + CABEZA + 24, ancho: CW - 56, alto: MARCADOR };
export const UNIRME_P = { x: C0 + CW - 28 - 130 - 8 - 172, y: NOMBRE_P.y, ancho: 172, alto: 40 };
const Y_PESTANAS = HERO_P.y + HERO_P.alto + 20;
export const PESTANAS_P = { x: C0, y: Y_PESTANAS, ancho: 818, alto: 50 };
const ANCHOS_PESTANA = [114, 137, 159, 121, 115, 143, 109];
const PESTANAS: { key: string; label: string; Icono: typeof Newspaper }[] = [
  { key: 'noticias', label: 'Noticias', Icono: Newspaper },
  { key: 'informacion', label: 'Información', Icono: Info },
  { key: 'cuerpo', label: 'Cuerpo técnico', Icono: IdCard },
  { key: 'plantilla', label: 'Plantilla', Icono: Users },
  { key: 'partidos', label: 'Partidos', Icono: CalendarDays },
  { key: 'estadisticas', label: 'Estadísticas', Icono: Zap },
  { key: 'torneos', label: 'Torneos', Icono: Trophy },
];
/** Centro de una pestaña del perfil público. */
export const pestanaPublica = (key: string) => {
  const i = PESTANAS.findIndex((p) => p.key === key);
  const x = C0 + 1 + 4.8 + ANCHOS_PESTANA.slice(0, i).reduce((a, b) => a + b + 4, 0);
  return { x: x + ANCHOS_PESTANA[i] / 2, y: Y_PESTANAS + 25, ancho: ANCHOS_PESTANA[i], x0: x };
};
/** Arriba del contenido de la pestaña. */
export const Y_CONTENIDO = Y_PESTANAS + 50 + 16;

// --- Encabezado ---

const IconoVerificada: FC<{ t: number }> = ({ t }) =>
  t > 0 ? (
    <span style={{ display: 'inline-block', width: '0.72em', height: '0.72em', marginLeft: '0.28em', verticalAlign: '-0.04em', color: '#2563eb', transform: `scale(${t})`, transformOrigin: '50% 60%' }}>
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3L2.6 15.8l1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z" />
        <path d="M7.8 12.4l2.7 2.7 5.7-5.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : null;

const Chip: FC<{ children: ReactNode; vivo?: boolean; t?: number }> = ({ children, vivo, t = 1 }) =>
  t > 0 ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5.6,
        minHeight: 28,
        padding: '0 10.4px',
        borderRadius: 999,
        background: vivo ? '#e3f7e8' : '#f3f7fa',
        border: `1px solid ${vivo ? '#c3ebcf' : LINE}`,
        color: vivo ? '#17692c' : MUTED,
        fontSize: 12.16,
        fontWeight: vivo ? 800 : 600,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        opacity: Math.min(1, t * 1.4),
        transform: `scale(${0.85 + 0.15 * t})`,
      }}
    >
      {children}
    </span>
  ) : null;

const Celda: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6.4, minWidth: 0, padding: '16.8px 18.4px 16px', background: 'rgba(255,255,255,.62)' }}>
    <span style={{ fontSize: 9.92, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED }}>{label}</span>
    {children}
  </div>
);
const Valor: FC<{ n: number | string; small?: string }> = ({ n, small }) => (
  <span style={{ display: 'flex', alignItems: 'baseline', gap: 5.6, fontFamily: jetbrains, fontWeight: 800, fontSize: 36, lineHeight: 1, color: INK, letterSpacing: '-.04em' }}>
    {n}
    {small && <small style={{ fontSize: '.42em', fontWeight: 700, letterSpacing: 0, color: MUTED }}>{small}</small>}
  </span>
);
const Sub: FC<{ children: ReactNode }> = ({ children }) => <span style={{ fontFamily: jetbrains, fontSize: 10.56, fontWeight: 600, color: MUTED, whiteSpace: 'nowrap' }}>{children}</span>;
const Barra: FC<{ partes: [number, string][] }> = ({ partes }) => {
  const total = partes.reduce((a, [n]) => a + n, 0);
  return (
    <div style={{ display: 'flex', gap: 2, height: 6, margin: '6px 0', borderRadius: 999, overflow: 'hidden', background: 'rgba(11,31,46,.08)' }}>
      {total > 0 && partes.filter(([n]) => n > 0).map(([n, c], k) => <span key={k} style={{ display: 'block', height: '100%', width: `${(n / total) * 100}%`, background: c }} />)}
    </div>
  );
};

const GOLES = [2, 3, 1, 4, 2, 3, 2, 5, 1, 3, 2, 3];
const RACHA = ['V', 'V', 'E', 'V', 'D'];

const Marcador: FC<{ pc: string; lleno: boolean }> = ({ pc, lleno }) => {
  const accent = luminance(pc) > 0.7 ? darkenHex(pc, 0.35) : pc;
  const W = 100;
  const H = 18;
  const max = Math.max(...GOLES);
  const xy = GOLES.map((v, i) => [(i * W) / (GOLES.length - 1), H - 2 - (v / max) * (H - 4)]);
  const linea = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: MARCADOR_P.x - C0,
        top: MARCADOR_P.y - 24,
        width: MARCADOR_P.ancho,
        height: MARCADOR_P.alto,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
        gap: 1,
        borderRadius: 17.6,
        overflow: 'hidden',
        border: `1px solid ${LINE}`,
        boxSizing: 'border-box',
        background: `radial-gradient(90% 120% at 0% 0%, ${accent}29, transparent 60%), radial-gradient(70% 90% at 100% 100%, ${accent}12, transparent 60%), #e8edf1`,
      }}
    >
      <Celda label="Partidos">
        <Valor n={lleno ? 12 : 0} />
        <div style={{ display: 'flex', gap: 3, height: 18 }}>
          {RACHA.map((r, i) => (
            <span
              key={i}
              style={{
                flex: '1 1 0',
                maxWidth: 18,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                fontFamily: jetbrains,
                fontSize: 8.8,
                fontWeight: 800,
                boxSizing: 'border-box',
                ...(lleno
                  ? r === 'V'
                    ? { background: accent, color: readableOn(accent) }
                    : r === 'E'
                      ? { background: 'rgba(11,31,46,.16)', color: INK }
                      : { background: '#f87171', color: INK }
                  : { border: '1px dashed rgba(11,31,46,.2)' }),
              }}
            >
              {lleno ? r : ''}
            </span>
          ))}
        </div>
        <Sub>{lleno ? 'Últimos 5' : 'Sin partidos aún'}</Sub>
      </Celda>
      <Celda label="Goles">
        <Valor n={lleno ? 31 : 0} />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 18 }}>
          {lleno ? (
            <>
              <path d={`${linea} L${W},${H} L0,${H} Z`} fill={accent} opacity=".18" />
              <path d={linea} fill="none" stroke={accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </>
          ) : (
            <line x1="0" y1={H - 2} x2={W} y2={H - 2} stroke="rgba(11,31,46,.2)" strokeWidth="1.5" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        <Sub>{lleno ? '2.6 por partido' : '0.0 por partido'}</Sub>
      </Celda>
      <Celda label="Victorias">
        <Valor n={lleno ? 8 : 0} small={lleno ? '67%' : '0%'} />
        <Barra partes={lleno ? [[8, accent], [2, 'rgba(11,31,46,.22)'], [2, '#f87171']] : []} />
        <Sub>{lleno ? '8V · 2E · 2D' : '0V · 0E · 0D'}</Sub>
      </Celda>
      <Celda label="Plantilla">
        <Valor n={lleno ? 24 : 0} small={lleno ? '/24' : '/0'} />
        <Barra partes={lleno ? [[1, accent]] : []} />
        <Sub>Todos activos</Sub>
      </Celda>
    </div>
  );
};

/** La cabecera del perfil (TeamProfileHero), en su lugar de la página. */
export const HeroEscuela: FC<{ d: DatosPerfil }> = ({ d }) => {
  const pc = d.pc;
  const pcText = readableOn(pc) === '#ffffff' ? pc : darkenHex(pc, 0.45);
  const vd = darkenHex(pc, 0.6);
  const dk = darkenHex(pc, 0.3);
  const lt = lightenHex(pc, 0.35);
  const palabras = d.nombre.trim().split(/\s+/);
  const ultima = palabras.pop() ?? '';
  const cabeza = palabras.join(' ');
  const iniciales = d.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const lugar = d.ubicacion;
  const sedes = d.info?.sedes.length ?? 0;
  const catSport = d.categoria ? `${d.categoria} · ${ACADEMIA.deporte}` : '';
  return (
    <div style={{ position: 'absolute', left: HERO_P.x, top: HERO_P.y, width: HERO_P.ancho, height: HERO_P.alto, borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 0 rgba(11,31,46,.04), 0 18px 40px -12px rgba(12,75,110,.18)' }}>
      {/* Portada */}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: BANNER, background: `linear-gradient(120deg, ${vd} 0%, ${dk} 35%, ${pc} 75%, ${lt} 100%)`, overflow: 'hidden' }}>
        {d.portada > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: d.portada, background: vd }}>
            <PortadaCancha />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.09, backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 16px)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.35), transparent 70%)' }} />
      </div>

      {/* Escudo */}
      <div style={{ position: 'absolute', left: ESCUDO_P.x - C0, top: ESCUDO_P.y - 24, width: 112, height: 128, filter: 'drop-shadow(0 10px 18px rgba(11,31,46,.18))' }}>
        <div
          style={{
            position: 'relative',
            width: 112,
            height: 128,
            borderRadius: '22px 22px 32px 32px / 16px 16px 36px 36px',
            border: '4px solid #ffffff',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: `linear-gradient(160deg, ${pc} 0%, ${darkenHex(pc, 0.16)} 100%)`,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span style={{ fontFamily: instrument, fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>{iniciales}</span>
          <div style={{ position: 'absolute', inset: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }} />
          {d.logo > 0 && (
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: d.logo }}>
              <EscudoFenix />
            </div>
          )}
        </div>
      </div>

      {/* Nombre y datos */}
      <div style={{ position: 'absolute', left: NOMBRE_P.x - C0, top: NOMBRE_P.y - 24, right: 28 + (d.unirse ? 172 + 8 : 0) + 130 + 24, display: 'flex', flexDirection: 'column', gap: 11.2 }}>
        <h1 style={{ margin: 0, fontFamily: schibsted, fontWeight: 800, color: INK, fontSize: 34.4, lineHeight: 1.04, letterSpacing: '-.028em', minHeight: 36, whiteSpace: 'nowrap' }}>
          {cabeza && <>{cabeza} </>}
          <span style={{ whiteSpace: 'nowrap' }}>
            {ultima}
            <IconoVerificada t={d.verificada} />
          </span>
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6.4 }}>
          <Chip vivo>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1d9a3e' }} />
            Activo
          </Chip>
          {lugar && (
            <Chip>
              <MapPin size={13} style={{ opacity: 0.8 }} />
              {lugar}
              {sedes >= 2 && <span style={{ color: pcText, fontWeight: 800 }}>· {sedes} sedes</span>}
            </Chip>
          )}
          {d.desde && (
            <Chip>
              <CalendarDays size={13} style={{ opacity: 0.8 }} />
              Desde {d.desde}
            </Chip>
          )}
          {catSport && <Chip>{catSport}</Chip>}
        </div>
        {d.bio && <p style={{ margin: 0, maxWidth: BIO_P.ancho, color: MUTED, fontSize: 14.4, lineHeight: 1.55 }}>{d.bio}</p>}
      </div>

      {/* Botones */}
      <div style={{ position: 'absolute', right: 28, top: NOMBRE_P.y - 24, display: 'flex', gap: 8 }}>
        {d.unirse && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7.2, width: 172, height: 40, borderRadius: 999, background: pc, color: readableOn(pc), boxShadow: `0 6px 18px ${pc}55`, fontSize: 13.76, fontWeight: 700, whiteSpace: 'nowrap' }}>
            <UserPlus size={16} strokeWidth={2.2} />
            Solicitar unirme
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7.2, width: 130, height: 40, borderRadius: 999, background: '#f3f7fa', border: `1px solid ${LINE}`, color: MUTED, fontSize: 13.76, fontWeight: 700, boxSizing: 'border-box' }}>
          <Share2 size={16} strokeWidth={2} />
          Compartir
        </span>
      </div>

      <Marcador pc={pc} lleno={d.marcador} />
    </div>
  );
};

// --- Pestañas ---

const Pestanas: FC<{ pc: string; activa: PestanaPublica; sedes: number; categoria: string | null }> = ({ pc, activa, sedes, categoria }) => (
  <>
    <div style={{ position: 'absolute', left: PESTANAS_P.x, top: PESTANAS_P.y, width: PESTANAS_P.ancho, height: PESTANAS_P.alto, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 999, overflow: 'hidden', boxShadow: '0 4px 14px -6px rgba(12,75,110,.16)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 4, padding: 4.8 }}>
        {PESTANAS.map(({ key, label, Icono }, i) => {
          const on = key === activa;
          return (
            <span key={key} style={{ flexShrink: 0, width: ANCHOS_PESTANA[i], height: 38, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6.4, fontSize: 13.6, fontWeight: 700, whiteSpace: 'nowrap', color: on ? readableOn(pc) : MUTED, background: on ? pc : 'transparent', boxShadow: on ? `0 4px 12px ${pc}45` : undefined }}>
              <Icono size={16} />
              {label}
            </span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7, background: 'linear-gradient(270deg, #fff 45%, rgba(255,255,255,0))', boxSizing: 'border-box' }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#f0f6fb', boxShadow: '0 1px 3px rgba(11,31,46,.15)', display: 'grid', placeItems: 'center', color: INK }}>
          <ChevronRight size={16} strokeWidth={2.4} />
        </span>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 1280 - C0 - CW, top: PESTANAS_P.y + 1, display: 'flex', gap: 8 }}>
      {sedes >= 2 && <Filtro label="Sede" valor="Todas" icono={<MapPin size={15} />} ancho={150} />}
      {categoria && <Filtro label="Categoría" valor={categoria} icono={<span style={{ width: 9, height: 9, borderRadius: '50%', background: pc }} />} ancho={160} activo pc={pc} />}
    </div>
  </>
);

const Filtro: FC<{ label: string; valor: string; icono: ReactNode; ancho: number; activo?: boolean; pc?: string }> = ({ label, valor, icono, ancho, activo, pc }) => (
  <div style={{ width: ancho, height: 48, display: 'flex', alignItems: 'center', gap: 9.6, padding: '0 12.8px 0 13.6px', borderRadius: 15.2, background: '#fff', border: `1px solid ${activo && pc ? `${pc}55` : 'rgba(11,31,46,.1)'}`, boxShadow: activo && pc ? `0 0 0 3px ${pc}14` : undefined, boxSizing: 'border-box' }}>
    <span style={{ display: 'grid', placeItems: 'center', color: activo && pc ? pc : '#8aa0b2' }}>{icono}</span>
    <span style={{ display: 'flex', flexDirection: 'column', flex: 1, lineHeight: 1.15 }}>
      <span style={{ fontSize: 9.6, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8aa0b2' }}>{label}</span>
      <span style={{ fontSize: 13.76, fontWeight: 700, color: INK }}>{valor}</span>
    </span>
    <ChevronDown size={16} color="#8aa0b2" />
  </div>
);

// --- Contenido de las pestañas ---

const Tarjeta: FC<{ Icono: typeof Newspaper; titulo: string; pc: string; children: ReactNode; style?: CSSProperties; resalte?: number }> = ({ Icono, titulo, pc, children, style, resalte = 0 }) => (
  <div style={{ background: '#fff', borderRadius: 16, boxShadow: resalte > 0 ? `0 1px 2px rgba(0,0,0,.05), 0 0 0 ${3 * resalte}px rgba(14,165,233,${0.9 * resalte})` : '0 1px 2px rgba(0,0,0,.05)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 34, height: 34, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${pc}14`, color: pc }}>
        <Icono size={18} />
      </span>
      <h3 style={{ margin: 0, fontFamily: schibsted, fontSize: 14, fontWeight: 700, color: INK }}>{titulo}</h3>
    </div>
    {children}
  </div>
);
const Texto: FC<{ children: ReactNode }> = ({ children }) => <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{children}</p>;
const Precio: FC<{ label: string; valor: number; pc: string; ultimo?: boolean }> = ({ label, valor, pc, ultimo }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: ultimo ? undefined : '1px solid rgba(0,0,0,.06)' }}>
    <span style={{ fontSize: 14, color: MUTED }}>{label}</span>
    <span style={{ fontSize: 16, fontWeight: 800, color: pc }}>{formatCOP(valor)}</span>
  </div>
);
const Rotulo: FC<{ children: ReactNode }> = ({ children }) => <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.025em', color: '#8aa0b2' }}>{children}</p>;

/** Resaltes de la pestaña Información (0 → 1). */
export type ResalteInfo = { costos?: number; horarios?: number; pagos?: number; requisitos?: number };

/** Dónde quedan las tarjetas de Información (vista general con dos sedes). */
export const INFO_P = { prueba: Y_CONTENIDO, sedes: Y_CONTENIDO + 54 + 16, columnas: Y_CONTENIDO + 54 + 16 + 278 + 16 };
/** Lo mismo sin sedes ni clase de prueba (escuela recién creada): las columnas van arriba. */
const INFO_SIN_SEDES = Y_CONTENIDO;

const InfoTab: FC<{ pc: string; info: InfoPublica | null; resalte?: ResalteInfo; nuevo?: number }> = ({ pc, info, resalte = {}, nuevo = 1 }) => {
  if (!info || (!info.inscripcion && !info.mensualidad && !info.uniforme && !info.pagos.length && !info.requisitos && !info.sedes.length)) {
    return <p style={{ position: 'absolute', left: C0, width: CW, top: Y_CONTENIDO + 30, margin: 0, textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>La escuela aún no ha publicado su información.</p>;
  }
  const multi = info.sedes.length >= 2;
  const yCol = multi ? INFO_P.columnas : info.prueba ? Y_CONTENIDO + 70 : INFO_SIN_SEDES;
  const col = (CW - 16) / 2;
  const entra: CSSProperties = { opacity: nuevo, transform: `translateY(${(1 - nuevo) * 10}px)` };
  return (
    <>
      {info.prueba && (
        <div style={{ position: 'absolute', left: C0, top: INFO_P.prueba, width: CW, height: 54, borderRadius: 16, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, background: `${pc}12`, border: `1px solid ${pc}30`, boxSizing: 'border-box' }}>
          <Sparkles size={20} color={pc} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: INK }}>Ofrecemos clase de prueba gratuita. ¡Anímate a conocernos!</p>
        </div>
      )}
      {multi && (
        <Tarjeta Icono={MapPin} titulo="Nuestras sedes" pc={pc} style={{ position: 'absolute', left: C0, top: INFO_P.sedes, width: CW, height: 278 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {info.sedes.map((v) => (
              <div key={v.nombre} style={{ borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(0,0,0,.08)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: INK }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc }} />
                  {v.nombre}
                </span>
                <p style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 6, color: MUTED }}>
                  <MapPin size={16} color={pc} style={{ marginTop: 2, flexShrink: 0 }} />
                  {v.direccion}
                </p>
                <p style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 6, color: MUTED, borderRadius: 6, boxShadow: (resalte.horarios ?? 0) > 0 ? `0 0 0 ${3 * (resalte.horarios ?? 0)}px rgba(14,165,233,${0.9 * (resalte.horarios ?? 0)})` : undefined, background: (resalte.horarios ?? 0) > 0 ? `rgba(224,242,254,${resalte.horarios})` : undefined }}>
                  <Clock size={16} color={pc} style={{ marginTop: 2, flexShrink: 0 }} />
                  {v.horario}
                </p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-.025em', color: pc }}>
                  {formatCOP(v.mensualidad)} <span style={{ fontSize: 12, fontWeight: 600, color: '#8aa0b2' }}>/ mes</span>
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {['Ver sede', 'Cómo llegar'].map((b) => (
                    <span key={b} style={{ fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '8px 16px', background: `${pc}14`, color: pc }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}
      <div style={{ position: 'absolute', left: C0, top: yCol, width: col, display: 'flex', flexDirection: 'column', gap: 16, ...entra }}>
        {(info.inscripcion || info.mensualidad || info.uniforme) && (
          <Tarjeta Icono={Banknote} titulo="Costos" pc={pc} resalte={resalte.costos}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {info.inscripcion != null && <Precio label="Inscripción" valor={info.inscripcion} pc={pc} />}
              {info.mensualidad != null && <Precio label="Mensualidad" valor={info.mensualidad} pc={pc} />}
              {info.uniforme != null && <Precio label="Uniforme" valor={info.uniforme} pc={pc} ultimo />}
            </div>
            {info.incluye && (
              <div>
                <Rotulo>La mensualidad incluye</Rotulo>
                <Texto>{info.incluye}</Texto>
              </div>
            )}
            {info.uniformeDetalle && (
              <div>
                <Rotulo>Uniforme</Rotulo>
                <Texto>{info.uniformeDetalle}</Texto>
              </div>
            )}
          </Tarjeta>
        )}
        {info.pagos.length > 0 && (
          <Tarjeta Icono={CreditCard} titulo="Formas de pago" pc={pc} resalte={resalte.pagos}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {info.pagos.map((o) => (
                <span key={o} style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '4px 12px', background: `${pc}14`, color: pc }}>
                  {o}
                </span>
              ))}
            </div>
          </Tarjeta>
        )}
      </div>
      <div style={{ position: 'absolute', left: C0 + col + 16, top: yCol, width: col, display: 'flex', flexDirection: 'column', gap: 16, ...entra }}>
        {info.descuentos && (
          <Tarjeta Icono={Tag} titulo="Descuentos" pc={pc}>
            <Texto>{info.descuentos}</Texto>
          </Tarjeta>
        )}
        {info.requisitos && (
          <Tarjeta Icono={ClipboardList} titulo="Requisitos de inscripción" pc={pc} resalte={resalte.requisitos}>
            <Texto>{info.requisitos}</Texto>
          </Tarjeta>
        )}
        {info.politicas && (
          <Tarjeta Icono={ShieldCheck} titulo="Políticas" pc={pc}>
            <Texto>{info.politicas}</Texto>
          </Tarjeta>
        )}
        {(info.whatsapp || info.correo) && (
          <Tarjeta Icono={MessagesSquare} titulo="¿Dudas? Escríbenos" pc={pc}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {info.whatsapp && <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '8px 16px', color: '#fff', background: pc }}>WhatsApp</span>}
              {info.correo && <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '8px 16px', background: `${pc}14`, color: pc }}>{info.correo}</span>}
            </div>
          </Tarjeta>
        )}
      </div>
    </>
  );
};

/** Una tarjeta del cuerpo técnico: 373 de ancho, 3 por fila. */
export const STAFF_P = { ancho: (CW - 32) / 3, alto: 214 };
const iniciales = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const StaffTab: FC<{ pc: string; staff: MiembroPublico[] }> = ({ pc, staff }) =>
  staff.length === 0 ? (
    <p style={{ position: 'absolute', left: C0, width: CW, top: Y_CONTENIDO + 30, margin: 0, textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>Esta escuela aún no ha publicado su cuerpo técnico.</p>
  ) : (
    <>
      {staff.map((m, i) => {
        const principal = /entrenador\s+principal/i.test(m.rol ?? '');
        const subtitulo = !!m.rol && !(m.entrenador && principal);
        const datos = [m.nacionalidad && { l: 'Nacionalidad', v: m.nacionalidad }, m.licencia && { l: 'Licencia', v: m.licencia }].filter(Boolean) as { l: string; v: string }[];
        const t = m.nuevo ?? 1;
        return (
          <div
            key={m.nombre}
            style={{
              position: 'absolute',
              left: C0 + i * (STAFF_P.ancho + 16),
              top: Y_CONTENIDO,
              width: STAFF_P.ancho,
              height: STAFF_P.alto,
              display: 'flex',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #f3f4f6',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              opacity: t,
              transform: `translateY(${(1 - t) * 14}px) scale(${0.96 + 0.04 * t})`,
            }}
          >
            <div style={{ position: 'relative', width: 150, flexShrink: 0, background: `linear-gradient(160deg, ${pc}22, ${pc}0a)` }}>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 900, color: pc }}>{iniciales(m.nombre)}</div>
              {m.foto && m.persona && <AvatarIlustrado persona={m.persona} />}
              {m.entrenador && <span style={{ position: 'absolute', left: 12, bottom: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.025em', borderRadius: 6, padding: '4px 8px', color: '#fff', background: pc }}>Entrenador principal</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: schibsted, fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.25 }}>{m.nombre}</h3>
                {subtitulo && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{m.rol}</p>}
              </div>
              {datos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {datos.map((f) => (
                    <div key={f.l}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.025em', color: '#9ca3af' }}>{f.l}</div>
                      <div style={{ fontSize: 12, color: '#1f2937' }}>{f.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {m.bio && <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.6, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>{m.bio}</p>}
            </div>
          </div>
        );
      })}
    </>
  );

const NoticiasTab: FC<{ pc: string; instagram: boolean }> = ({ pc, instagram }) => (
  <>
    <div style={{ position: 'absolute', left: C0, top: Y_CONTENIDO, width: instagram ? CW - 280 - 20 : CW, padding: 24, background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 4px 16px rgba(12,75,110,.06)', boxSizing: 'border-box' }}>
      <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 18.4, fontWeight: 800, color: INK, letterSpacing: '-.015em' }}>Noticias del club</h2>
      <p style={{ margin: '2.4px 0 16px', fontSize: 12.8, color: MUTED }}>Comunicados y actualizaciones públicas</p>
      <div style={{ display: 'flex', gap: 14.4, alignItems: 'flex-start', padding: '13.6px 0' }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `${pc}14`, color: pc, display: 'grid', placeItems: 'center' }}>
          <UserPlus size={18} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4.8 }}>
            <span style={{ padding: '2.4px 8.8px', borderRadius: 999, fontSize: 10.9, fontWeight: 800, background: `${pc}18`, color: pc }}>Matrícula abierta</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4.8, color: '#8aaabb', fontSize: 11.5 }}>
              <CalendarDays size={12} />5 nov 2026
            </span>
          </div>
          <p style={{ margin: '0 0 3.2px', fontSize: 15.2, fontWeight: 700, color: INK, lineHeight: 1.35 }}>Matrícula abierta 2027</p>
          <p style={{ margin: 0, fontSize: 12.8, color: MUTED, lineHeight: 1.5 }}>Abrimos inscripciones para todas las categorías. Escríbenos y ven a una clase de prueba gratis.</p>
        </div>
      </div>
    </div>
    {instagram && (
      <div style={{ position: 'absolute', left: C0 + CW - 280, top: Y_CONTENIDO, width: 280, padding: 19.2, background: '#fff', borderRadius: 17.6, border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 4px 16px rgba(12,75,110,.06)', boxSizing: 'border-box' }}>
        <p style={{ margin: '0 0 14.4px', fontSize: 16, fontWeight: 800, color: INK }}>Redes sociales</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13.6, padding: '12px 14.4px', borderRadius: 13.6, background: '#f0f6fb', border: '1px solid rgba(0,0,0,.06)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10.4, background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 11.5 }}>IG</div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.2 }}>Instagram</p>
            <p style={{ margin: '1.6px 0 0', fontSize: 11.7, color: MUTED }}>@academiafenix</p>
          </div>
        </div>
      </div>
    )}
  </>
);

/** La página pública entera. `scroll` la sube. `resalte` ilumina tarjetas de Información. */
export const PerfilEscuela: FC<{ d: DatosPerfil; scroll?: number; resalte?: ResalteInfo; nuevoInfo?: number }> = ({ d, scroll = 0, resalte, nuevoInfo }) => (
  <div style={{ position: 'absolute', left: 0, top: -scroll, width: 1280, height: 2400, background: '#f0f6fb', fontFamily: instrument, color: INK, lineHeight: 1.5 }}>
    <HeroEscuela d={d} />
    <Pestanas pc={d.pc} activa={d.pestana} sedes={d.info?.sedes.length ?? 0} categoria={d.categoria} />
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, opacity: d.entra ?? 1, transform: `translateY(${(1 - (d.entra ?? 1)) * 8}px)` }}>
      {d.pestana === 'noticias' && <NoticiasTab pc={d.pc} instagram={d.instagram} />}
      {d.pestana === 'informacion' && <InfoTab pc={d.pc} info={d.info} resalte={resalte} nuevo={nuevoInfo} />}
      {d.pestana === 'cuerpo' && <StaffTab pc={d.pc} staff={d.staff} />}
    </div>
  </div>
);
