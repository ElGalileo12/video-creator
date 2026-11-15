// «Escuelas cerca de mí» en el computador (galiesport.com/clubes), la página de inicio de escritorio y el aviso del
// navegador que pide la ubicación, fieles a la app (desde `pedir-cupo`).
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Barra de arriba: components/common/SiteHeader.tsx + .gs-nav* de app/global.css (flotante, oscura, 1240 de ancho):
//   Torneos, Clubes, Blog, Precios, Nosotros · botón claro/noche · «Iniciar sesión» · «EMPEZAR →».
// - Inicio: feature/public/landing/LandingPage.tsx («Gestiona. Entrena. Gana.»).
// - Clubes: app/clubes/page.tsx + feature/public/landing/ClubsPage.tsx y landing.css (.lp-page-hero, .lp-tn-*, .lp-cl-*).
//   Solo salen escuelas públicas y verificadas. «Escuelas cerca de mí» pide la ubicación al navegador («Buscando tu
//   ubicación…»); con ella el botón pasa a «Cerca de ti ✕», aparecen las distancias (a la cancha o sede más cercana de
//   cada escuela), los chips «A menos de 2 · 5 · 10 · 25 · 50 km» (10 por defecto), el orden «Más cercanas» y la nota
//   «Tu ubicación no sale de tu dispositivo…» (la distancia se calcula en el navegador).
// Todo en píxeles de la página (1280 de ancho), salvo `PermisoUbicacion`, que va en píxeles del video.
import { ArrowRight, BadgeCheck, CalendarDays, ChevronDown, LayoutGrid, List, LoaderCircle, LocateFixed, MapPin, Search, Tags, Users, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { EscudoFenix, PortadaCancha } from './escuela-publica';
import { instrument, jetbrains, schibsted } from './letras';
import { LockupGali } from './registro';

// --- Colores de la landing en tema claro (landing.css, .lp) ---
const LP = {
  bg: '#fbfcfd',
  bgAlt: '#f2f6f9',
  ink: '#0a1520',
  ink2: '#3d4c5c',
  ink3: '#7d8b99',
  line: 'rgba(10,21,32,0.08)',
  surface: '#ffffff',
  surfaceLine: 'rgba(10,21,32,0.08)',
  accent: '#0e7490',
  accentBright: '#00d4ff',
  grad: 'linear-gradient(100deg, #0c4a6e 0%, #0e7490 38%, #00a9d4 78%, #00c8f2 100%)',
  glow: 'rgba(0,212,255,0.16)',
  btnGlow: 'rgba(14,116,144,0.45)',
  okBg: '#e3f6fa',
  okFg: '#0e7490',
  pitch1: '#0c4a6e',
  pitch2: '#082f48',
};
const textoGrad: CSSProperties = { background: LP.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${22 * t}px rgba(${color},${0.45 * t})` : '');
const sube = (s: number, retraso: number, dur = 1) => {
  const t = Math.min(1, Math.max(0, (s - retraso) / dur));
  return 1 - Math.pow(1 - t, 3);
};

// =============================================================================================================
// La barra de arriba (SiteHeader)
// =============================================================================================================

const BARRA = { x: 20, y: 10, ancho: 1240, alto: 52 };
const ENLACES_PUBLICOS: [string, number][] = [
  ['Torneos', 53],
  ['Clubes', 46],
  ['Blog', 30],
  ['Precios', 53],
  ['Nosotros', 61],
];
const X_ENLACES = 375;
const xEnlace = (i: number) => X_ENLACES + ENLACES_PUBLICOS.slice(0, i).reduce((a, [, w]) => a + w + 32, 0);
/** El enlace «Clubes» de la barra (en la página). */
export const ENLACE_CLUBES = { x: xEnlace(1), y: BARRA.y + 16, ancho: 46, alto: 20 };

export const BarraPublicaPC: FC<{ activo?: string; hover?: number; apretar?: number }> = ({ activo, hover = 0, apretar = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: BARRA.x,
      top: BARRA.y,
      width: BARRA.ancho,
      height: BARRA.alto,
      boxSizing: 'border-box',
      borderRadius: 14,
      background: 'linear-gradient(180deg, rgba(17,31,46,0.94), rgba(9,17,27,0.96))',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 14px 34px -16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
      zIndex: 50,
      fontFamily: instrument,
    }}
  >
    <div style={{ position: 'absolute', left: 16, top: 10 }}>
      <LockupGali alto={30} />
    </div>
    {ENLACES_PUBLICOS.map(([nombre, w], i) => {
      const on = nombre === activo;
      const h = nombre === 'Clubes' ? hover : 0;
      return (
        <div key={nombre} style={{ position: 'absolute', left: xEnlace(i) - BARRA.x, top: 15, width: w, height: 20, textAlign: 'center', fontSize: 13.6, fontWeight: on ? 600 : 500, letterSpacing: '0.03em', color: on || h > 0.5 ? '#ffffff' : '#97a9bd', whiteSpace: 'nowrap', transform: apretar > 0 && nombre === 'Clubes' ? `scale(${1 - apretar * 0.06})` : undefined }}>
          {nombre}
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: -6, height: 2, borderRadius: 2, background: '#38d9f0', boxShadow: '0 0 10px rgba(56,217,240,0.6)', transform: `scaleX(${on ? 1 : h})` }} />
        </div>
      );
    })}
    <div style={{ position: 'absolute', right: 12, top: 0, height: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#97a9bd', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
      <span style={{ color: '#97a9bd', fontSize: 13.6, fontWeight: 500, letterSpacing: '0.03em' }}>Iniciar sesión</span>
      <span style={{ padding: '8px 20.8px', borderRadius: 8, background: 'linear-gradient(180deg, #41e3f7, #16c7e6)', color: '#04212c', fontFamily: schibsted, fontSize: 13.1, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 8px 20px -8px rgba(56,217,240,0.6)' }}>Empezar →</span>
    </div>
  </div>
);

// =============================================================================================================
// La página de inicio en el computador (solo el héroe y el portátil que asoma)
// =============================================================================================================

const PALABRAS = ['Gestiona.', 'Entrena.', 'Gana.'];

/** `s`: segundos desde que cargó (el título sube palabra por palabra, como en la app). */
export const PaginaInicioPC: FC<{ vh: number; s: number; hoverClubes?: number; apretarClubes?: number }> = ({ vh, s, hoverClubes = 0, apretarClubes = 0 }) => {
  const fade = (retraso: number): CSSProperties => {
    const t = sube(s, retraso);
    return { opacity: t, transform: `translateY(${(1 - t) * 18}px)` };
  };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, overflow: 'hidden', background: LP.bg, fontFamily: instrument, color: LP.ink }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(55% 45% at 50% 0%, ${LP.glow}, transparent 70%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: jetbrains, fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: LP.accent, ...fade(0) }}>
        Gali Esport · Clubes, torneos y jugadores
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 186, textAlign: 'center', fontFamily: schibsted, fontWeight: 800, fontSize: 120, letterSpacing: '-0.045em', lineHeight: 0.9 }}>
        {PALABRAS.map((p, i) => {
          const t = sube(s, 0.1 + i * 0.13, 1.1);
          return (
            <span key={p} style={{ display: 'block', padding: '0 0.04em', opacity: t, transform: `translateY(${(1 - t) * 0.3}em)`, filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined }}>
              <span style={i === 2 ? textoGrad : undefined}>{p}</span>
            </span>
          );
        })}
      </div>
      <p style={{ position: 'absolute', left: 0, right: 0, top: 538, margin: '0 auto', width: 675, textAlign: 'center', fontSize: 19.8, lineHeight: 1.5, color: LP.ink2, ...fade(0.55) }}>
        Equipos, entrenamientos, torneos y pagos de tu club, en una sola plataforma para entrenadores, organizadores y jugadores.
      </p>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 628, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, ...fade(0.7) }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, height: 52, padding: '0 26px', borderRadius: 999, background: LP.ink, color: '#fff', fontWeight: 600, fontSize: 16, boxShadow: `0 14px 30px -14px ${LP.btnGlow}` }}>
          Empieza gratis <ArrowRight size={18} />
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: LP.accent, fontWeight: 600, fontSize: 16 }}>
          Ver cómo funciona <ArrowRight size={18} />
        </span>
      </div>
      {/* El portátil del panel asoma abajo, todavía inclinado */}
      <div style={{ position: 'absolute', left: 170, right: 170, top: 760, height: 520, perspective: 1600, ...fade(0.9) }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 22, padding: 14, boxSizing: 'border-box', background: 'linear-gradient(180deg,#e4e8ec,#aab2bb)', boxShadow: '0 50px 100px -40px rgba(10,21,32,0.35), 0 24px 48px -24px rgba(10,21,32,0.2)', transform: 'rotateX(34deg)', transformOrigin: '50% 0%' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 12, background: '#f4f7fa', display: 'flex', gap: 14, padding: 16, boxSizing: 'border-box' }}>
            <div style={{ width: 150, borderRadius: 10, background: '#fff', border: '1px solid #e3e9ef', padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[70, 90, 60, 80, 70].map((w, k) => (
                <span key={k} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: k === 1 ? '#cfe9f1' : '#e3e9ef' }} />
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ height: 60, borderRadius: 10, background: '#fff', border: '1px solid #e3e9ef' }} />
              <div style={{ display: 'flex', gap: 14, height: 110 }}>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ flex: 1, borderRadius: 10, background: '#fff', border: '1px solid #e3e9ef' }} />
                ))}
              </div>
              <div style={{ flex: 1, borderRadius: 10, background: '#eaf6fa' }} />
            </div>
          </div>
        </div>
      </div>
      <BarraPublicaPC hover={hoverClubes} apretar={apretarClubes} />
    </div>
  );
};

// =============================================================================================================
// Clubes: datos de ejemplo (inventados) y medidas
// =============================================================================================================

export type EscuelaCerca = {
  nombre: string;
  bio: string;
  /** Ciudad, departamento (lo que sale sin ubicación). */
  lugar: string;
  /** Nombre de la sede o cancha más cercana (con ubicación). */
  sede: string;
  km: number;
  abiertas: boolean;
  jugadores: number;
  categorias: number;
  fundada: number;
  fenix?: boolean;
};

/** En orden de «Más relevantes» (primero las que reciben jugadores, luego las más grandes). */
export const ESCUELAS_CERCA: EscuelaCerca[] = [
  { nombre: 'Club Atlético Tunjuelito', bio: 'Más de 15 años formando jugadores en el sur de Bogotá. Categorías de Sub-6 a Sub-17.', lugar: 'Bogotá, Cundinamarca', sede: 'Sede Tunjuelito', km: 17.6, abiertas: true, jugadores: 120, categorias: 7, fundada: 2005 },
  { nombre: 'Academia Fénix Bogotá', bio: 'Formamos futbolistas desde los 5 años en Bogotá, con entrenadores licenciados y dos sedes. ¡Ven a una clase de prueba gratis!', lugar: 'Bogotá, Cundinamarca', sede: 'Sede Norte', km: 1.2, abiertas: true, jugadores: 86, categorias: 6, fundada: 2010, fenix: true },
  { nombre: 'Club Deportivo Los Cerezos', bio: 'Fútbol formativo para niños y niñas de 6 a 15 años en el norte de Bogotá.', lugar: 'Bogotá, Cundinamarca', sede: 'Sede Cedritos', km: 3.8, abiertas: true, jugadores: 54, categorias: 4, fundada: 2015 },
  { nombre: 'Escuela de Fútbol Halcones', bio: 'Entrenamientos entre semana y partidos los sábados. Categorías desde Sub-8.', lugar: 'Bogotá, Cundinamarca', sede: 'Sede Suba', km: 7.5, abiertas: false, jugadores: 40, categorias: 3, fundada: 2018 },
];
export const RADIOS_KM = [2, 5, 10, 25, 50];

/** Las escuelas que se ven: sin ubicación, todas por relevancia; con ubicación, las del radio por cercanía. */
export const escuelasVisibles = (conUbicacion: boolean, radio: number) =>
  conUbicacion ? ESCUELAS_CERCA.filter((e) => e.km <= radio).sort((a, b) => a.km - b.km) : ESCUELAS_CERCA;

const KM = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
const distancia = (km: number) => (km < 1 ? `a ${Math.max(100, Math.round((km * 1000) / 100) * 100)} m` : `a ${KM.format(km < 10 ? km : Math.round(km))} km`);

// Medidas (contenedor de 1160 centrado: contenido de x = 80 a 1200)
const CX = 80;
const CW = 1120;
const Y_HEROE = 180;
const Y_TOOLS = 619;
const Y_CHIPS = Y_TOOLS + 66 + 16;
const ALTO_CHIPS = 38;
const ANCHO_TARJETA = 360;
const ALTO_TARJETA = 448;
const yCuenta = (u: number) => Y_TOOLS + 66 + 16 + 12 + (ALTO_CHIPS + 16) * u;
const yGrilla = (u: number) => yCuenta(u) + 16 + 16;
const anchoCerca = (estado: DatosClubes['ubicacion']) => (estado === 'si' ? 166 : estado === 'buscando' ? 236 : 224);
const xChip = (i: number) => CX + 90 + RADIOS_KM.slice(0, i).reduce((a, r) => a + (r < 10 ? 64 : 73) + 8, 0);

export const CLUBES_P = {
  cerca: (estado: DatosClubes['ubicacion'] = 'no') => ({ x: CX + 10, y: Y_TOOLS + 10, ancho: anchoCerca(estado), alto: 46 }),
  chip: (i: number) => ({ x: xChip(i), y: Y_CHIPS, ancho: RADIOS_KM[i] < 10 ? 64 : 73, alto: ALTO_CHIPS }),
  /** Tarjeta `i` de la grilla (`u` 1 con ubicación: los chips de distancia la bajan). */
  tarjeta: (i: number, u: number) => ({ x: CX + (i % 3) * (ANCHO_TARJETA + 20), y: yGrilla(u) + Math.floor(i / 3) * (ALTO_TARJETA + 20), ancho: ANCHO_TARJETA, alto: ALTO_TARJETA }),
  /** El renglón de la sede con la distancia, dentro de la tarjeta `i`. */
  sede: (i: number, u: number) => ({ x: CX + (i % 3) * (ANCHO_TARJETA + 20) + 22, y: yGrilla(u) + 157.5 + 42 + 25 + 10 - 2, ancho: 250, alto: 26 }),
  verEscuela: (i: number, u: number) => ({ x: CX + (i % 3) * (ANCHO_TARJETA + 20) + ANCHO_TARJETA - 22 - 100, y: yGrilla(u) + ALTO_TARJETA - 49 + 12, ancho: 100, alto: 24 }),
  nota: (u: number, filas = 1) => ({ x: CX, y: yGrilla(u) + filas * (ALTO_TARJETA + 20) - 4, ancho: 640, alto: 24 }),
  cuenta: (u: number) => ({ x: CX, y: yCuenta(u) - 2, ancho: 300, alto: 20 }),
};

// =============================================================================================================
// La tarjeta de una escuela
// =============================================================================================================

const Balon: FC<{ size?: number; color?: string }> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.6l4 2.9-1.5 4.7h-5L8 10.5z" fill={color} />
    <path d="M12 7.6V2.6M16 10.5l4.6-1.6M14.5 15.2l2.9 4M9.5 15.2l-2.9 4M8 10.5L3.4 8.9" />
  </svg>
);

const ArteCancha: FC = () => (
  <svg viewBox="0 0 160 70" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1}>
    <g style={{ vectorEffect: 'non-scaling-stroke' } as CSSProperties}>
      <rect x="8" y="7" width="144" height="56" rx="1.5" />
      <line x1="80" y1="7" x2="80" y2="63" />
      <circle cx="80" cy="35" r="10" />
      <rect x="8" y="19" width="20" height="32" />
      <rect x="132" y="19" width="20" height="32" />
      <rect x="8" y="27" width="7" height="16" />
      <rect x="145" y="27" width="7" height="16" />
      <path d="M28 29a7 7 0 0 1 0 12M132 29a7 7 0 0 0 0 12" />
    </g>
  </svg>
);

const CONECTORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en']);
const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter((w) => !CONECTORES.has(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const chipPortada: CSSProperties = {
  position: 'absolute',
  top: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '6px 12px',
  borderRadius: 999,
  background: 'rgba(6,18,28,0.42)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: '#fff',
  fontSize: 12.8,
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

export const TarjetaEscuela: FC<{ e: EscuelaCerca; conUbicacion: number; hover?: number; apretar?: number; resalte?: number; resalteSede?: number; f?: number }> = ({ e, conUbicacion, hover = 0, apretar = 0, resalte = 0, resalteSede = 0, f = 0 }) => {
  const pulso = (f % 54) / 54;
  return (
    <div
      style={{
        width: ANCHO_TARJETA,
        height: ALTO_TARJETA,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 26,
        background: LP.surface,
        border: `1px solid ${hover > 0 ? `rgba(0,212,255,${0.4 * hover})` : LP.surfaceLine}`,
        boxShadow: [hover > 0 ? `0 50px 100px -40px rgba(10,21,32,${0.35 * hover}), 0 24px 48px -24px rgba(10,21,32,${0.2 * hover})` : '0 20px 40px -32px rgba(10,21,32,0.35)', anillo(resalte)].filter(Boolean).join(', '),
        transform: `translateY(${-4 * hover}px) scale(${1 - 0.02 * apretar})`,
        boxSizing: 'border-box',
        color: LP.ink,
      }}
    >
      <div style={{ position: 'relative', height: 157.5, flexShrink: 0, isolation: 'isolate', background: `radial-gradient(80% 120% at 100% 0%, rgba(0,212,255,0.26), transparent 55%), linear-gradient(160deg, ${LP.pitch1}, ${LP.pitch2})` }}>
        {e.fenix ? (
          <>
            <PortadaCancha />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,18,28,0.55), rgba(6,18,28,0) 60%)' }} />
          </>
        ) : (
          <ArteCancha />
        )}
        <span style={{ ...chipPortada, left: 14, paddingLeft: 8 }}>
          <Balon color="#7fe9fb" />
          Fútbol
        </span>
        {e.abiertas && (
          <span style={{ ...chipPortada, right: 14, background: 'rgba(0,212,255,0.18)', borderColor: 'rgba(0,212,255,0.45)' }}>
            <i style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: LP.accentBright }}>
              <i style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: LP.accentBright, opacity: 0.6 * (1 - pulso), transform: `scale(${1 + pulso * 1.6})` }} />
            </i>
            Inscripciones abiertas
          </span>
        )}
        <span style={{ position: 'absolute', left: 20, bottom: -28, width: 56, height: 56, borderRadius: 18, overflow: 'hidden', background: LP.surface, border: `1px solid ${LP.surfaceLine}`, boxShadow: '0 12px 24px -12px rgba(10,21,32,0.5)', display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
          {e.fenix ? <EscudoFenix /> : <b style={{ fontFamily: schibsted, fontSize: 18.4, fontWeight: 800, letterSpacing: '-0.04em', ...textoGrad }}>{iniciales(e.nombre)}</b>}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '42px 22px 20px', minHeight: 0 }}>
        <div style={{ fontFamily: schibsted, fontSize: 22.4, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
          {e.nombre}
          <BadgeCheck size={20} color={LP.accent} style={{ marginLeft: 7, verticalAlign: -2 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: LP.ink3, fontSize: 14.4, height: 22 }}>
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7, borderRadius: 99, boxShadow: anillo(resalteSede), padding: resalteSede > 0 ? '2px 6px' : 0, margin: resalteSede > 0 ? '-2px -6px' : 0 }}>
            <MapPin size={15} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap' }}>{conUbicacion > 0.5 ? e.sede : e.lugar}</span>
            {conUbicacion > 0 && (
              <em style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 99, background: LP.okBg, color: LP.okFg, fontSize: 12, fontStyle: 'normal', fontWeight: 600, opacity: conUbicacion, transform: `scale(${0.7 + 0.3 * conUbicacion})` }}>{distancia(e.km)}</em>
            )}
          </span>
        </div>
        <div style={{ color: LP.ink2, lineHeight: 1.55, fontSize: 16, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', height: 49.6 } as CSSProperties}>{e.bio}</div>
        <div style={{ display: 'flex', marginTop: 'auto', paddingTop: 10 }}>
          {(
            [
              [Users, 'Jugadores', String(e.jugadores)],
              [Tags, 'Categorías', String(e.categorias)],
              [CalendarDays, 'Fundada', String(e.fundada)],
            ] as const
          ).map(([Icono, dt, dd], k) => (
            <div key={dt} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: k ? '0 12px' : '0 12px 0 0', borderLeft: k ? `1px solid ${LP.line}` : undefined }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: LP.ink3, fontFamily: jetbrains, fontSize: 10.6, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Icono size={13} />
                {dt}
              </span>
              <span style={{ fontSize: 15.2, fontWeight: 600 }}>{dd}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 49, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', borderTop: `1px solid ${LP.line}`, boxSizing: 'border-box' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: LP.ink2, fontSize: 13.8 }}>
          <BadgeCheck size={17} color={LP.accent} />
          Escuela verificada
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: LP.accent, fontSize: 14.4, fontWeight: 600 }}>
          Ver escuela
          <ArrowRight size={16} style={{ transform: `translateX(${3 * hover}px)` }} />
        </span>
      </div>
    </div>
  );
};

// =============================================================================================================
// La página /clubes
// =============================================================================================================

export type DatosClubes = {
  /** Segundos desde que cargó (el héroe entra con su fundido). */
  s: number;
  ubicacion: 'no' | 'buscando' | 'si';
  /** 0 → 1 al llegar la ubicación: bajan los chips de distancia y la lista se reordena. */
  u?: number;
  radio: number;
  /** El radio anterior, mientras la lista cambia (`cambio` 0 → 1). */
  radioAntes?: number;
  cambio?: number;
  f?: number;
  hover?: Partial<Record<'cerca' | 'chip' | 'tarjeta', number>>;
  apretar?: Partial<Record<'cerca' | 'chip' | 'tarjeta', number>>;
  /** Índice del chip de radio con el puntero encima o apretado. */
  chip?: number;
  /** Tarjeta (en la lista visible) con el puntero encima. */
  tarjeta?: number;
  resalte?: Partial<Record<'sede' | 'chips' | 'nota' | 'cuenta' | 'tarjeta', number>>;
};

const Select: FC<{ ancho: number; children: ReactNode }> = ({ ancho, children }) => (
  <span style={{ position: 'relative', width: ancho, height: 46, display: 'flex', alignItems: 'center', padding: '0 40px 0 18px', boxSizing: 'border-box', borderRadius: 999, background: LP.bgAlt, border: `1px solid ${LP.surfaceLine}`, fontSize: 14.4, fontWeight: 600, whiteSpace: 'nowrap' }}>
    {children}
    <ChevronDown size={16} color={LP.ink3} style={{ position: 'absolute', right: 14 }} />
  </span>
);

const Grilla: FC<{ lista: EscuelaCerca[]; u: number; d: DatosClubes }> = ({ lista, u, d }) => (
  <>
    {lista.map((e, i) => {
      const r = CLUBES_P.tarjeta(i, u);
      const esta = d.tarjeta === i;
      return (
        <div key={e.nombre} style={{ position: 'absolute', left: r.x, top: r.y }}>
          <TarjetaEscuela e={e} conUbicacion={d.ubicacion === 'si' ? u : 0} hover={esta ? d.hover?.tarjeta : 0} apretar={esta ? d.apretar?.tarjeta : 0} resalte={esta ? d.resalte?.tarjeta : 0} resalteSede={i === 0 ? d.resalte?.sede : 0} f={d.f} />
        </div>
      );
    })}
  </>
);

export const PaginaClubesPC: FC<{ d: DatosClubes; vh: number }> = ({ d, vh }) => {
  const u = d.ubicacion === 'si' ? (d.u ?? 1) : 0;
  const lista = escuelasVisibles(d.ubicacion === 'si', d.radio);
  const antes = d.radioAntes != null && (d.cambio ?? 1) < 1 ? escuelasVisibles(true, d.radioAntes) : null;
  const cambio = d.cambio ?? 1;
  const fade = (retraso: number): CSSProperties => {
    const t = sube(d.s, retraso);
    return { opacity: t, transform: `translateY(${(1 - t) * 18}px)` };
  };
  const cerca = CLUBES_P.cerca(d.ubicacion);
  const filtrosX = CX + CW - 10 - 596;
  const cuenta = `${lista.length} ${lista.length === 1 ? 'escuela' : 'escuelas'}${d.ubicacion === 'si' ? ` a menos de ${d.radio} km` : ''}`;
  const abiertas = ESCUELAS_CERCA.filter((e) => e.abiertas).length;
  // Al llegar la ubicación la lista vieja se desvanece y entra la ordenada por cercanía
  const listaSin = d.ubicacion === 'si' && u < 1 ? escuelasVisibles(false, d.radio) : null;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, overflow: 'hidden', background: LP.bg, fontFamily: instrument, color: LP.ink }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 600, background: `radial-gradient(55% 60% at 50% 0%, ${LP.glow}, transparent 70%)` }} />

      {/* Héroe */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: Y_HEROE, textAlign: 'center', fontFamily: jetbrains, fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: LP.accent, ...fade(0) }}>Escuelas verificadas</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: Y_HEROE + 38, textAlign: 'center', fontFamily: schibsted, fontWeight: 800, fontSize: 92, letterSpacing: '-0.045em', lineHeight: 0.9, ...fade(0.1) }}>
        Tu escuela,
        <br />
        <span style={{ ...textoGrad, padding: '0 0.04em' }}>cerca de ti.</span>
      </div>
      <p style={{ position: 'absolute', left: 0, right: 0, top: Y_HEROE + 226, margin: '0 auto', width: 640, textAlign: 'center', fontSize: 19.8, lineHeight: 1.5, color: LP.ink2, ...fade(0.25) }}>
        Escuelas deportivas con su registro legal verificado en Gali Esport. Busca por ciudad o barrio, o encuentra las que entrenan cerca de tu ubicación.
      </p>
      <div style={{ position: 'absolute', left: 0, right: 0, top: Y_HEROE + 337, display: 'flex', justifyContent: 'center', gap: 10, ...fade(0.35) }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: LP.surface, border: `1px solid ${LP.surfaceLine}`, color: LP.ink2, fontSize: 14.7 }}>
          <b style={{ color: LP.ink }}>{ESCUELAS_CERCA.length}</b> escuelas verificadas
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: LP.okBg, color: LP.okFg, fontSize: 14.7 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: LP.accentBright }} />
          <b>{abiertas}</b> con inscripciones abiertas
        </span>
      </div>

      {/* Barra: cerca de mí, buscador y filtros */}
      <div style={{ position: 'absolute', left: CX, top: Y_TOOLS, width: CW, height: 66, borderRadius: 28, background: LP.surface, border: `1px solid ${LP.surfaceLine}`, boxShadow: '0 24px 48px -36px rgba(10,21,32,0.4)', boxSizing: 'border-box' }} />
      <div
        style={{
          position: 'absolute',
          left: cerca.x,
          top: cerca.y,
          width: cerca.ancho,
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          background: d.ubicacion === 'si' ? LP.okBg : LP.ink,
          color: d.ubicacion === 'si' ? LP.okFg : '#fff',
          opacity: d.ubicacion === 'buscando' ? 0.85 : 1,
          boxShadow: d.ubicacion === 'si' ? undefined : `0 ${12 + 4 * (d.hover?.cerca ?? 0)}px 26px -14px ${LP.btnGlow}`,
          transform: `translateY(${-(d.hover?.cerca ?? 0)}px) scale(${1 - 0.05 * (d.apretar?.cerca ?? 0)})`,
          fontSize: 15.2,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {d.ubicacion === 'buscando' ? <LoaderCircle size={18} style={{ transform: `rotate(${((d.f ?? 0) * 13) % 360}deg)` }} /> : <LocateFixed size={18} />}
        {d.ubicacion === 'buscando' ? 'Buscando tu ubicación…' : d.ubicacion === 'si' ? 'Cerca de ti' : 'Escuelas cerca de mí'}
        {d.ubicacion === 'si' && <X size={18} style={{ marginLeft: 2, opacity: 0.7 }} />}
      </div>
      <div style={{ position: 'absolute', left: cerca.x + cerca.ancho + 10, top: Y_TOOLS + 10, width: filtrosX - (cerca.x + cerca.ancho + 10) - 10, height: 46, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 0 16px', borderRadius: 999, background: LP.bgAlt, color: LP.ink3, boxSizing: 'border-box', fontSize: 15.7, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Search size={18} style={{ flexShrink: 0 }} />
        Escuela, barrio o dirección
      </div>
      <div style={{ position: 'absolute', left: filtrosX, top: Y_TOOLS + 10, display: 'flex', gap: 10 }}>
        <Select ancho={193}>Todas las ciudades</Select>
        <Select ancho={108}>Fútbol</Select>
        <Select ancho={173}>{d.ubicacion === 'si' ? 'Más cercanas' : 'Más relevantes'}</Select>
        <span style={{ width: 92, height: 46, display: 'flex', padding: 4, gap: 0, borderRadius: 999, background: LP.bgAlt, border: `1px solid ${LP.surfaceLine}`, boxSizing: 'border-box' }}>
          {[LayoutGrid, List].map((Icono, k) => (
            <span key={k} style={{ flex: 1, display: 'grid', placeItems: 'center', borderRadius: 999, background: k === 0 ? LP.surface : 'transparent', color: k === 0 ? LP.ink : LP.ink2, boxShadow: k === 0 ? '0 4px 12px -4px rgba(10,21,32,0.25)' : undefined }}>
              <Icono size={17} />
            </span>
          ))}
        </span>
      </div>

      {/* Chips de distancia */}
      {u > 0 && (
        <div style={{ position: 'absolute', left: CX, top: Y_CHIPS, height: ALTO_CHIPS, display: 'flex', alignItems: 'center', gap: 8, opacity: u, transform: `translateY(${(1 - u) * -10}px)`, borderRadius: 999, boxShadow: anillo(d.resalte?.chips), padding: (d.resalte?.chips ?? 0) > 0 ? '0 6px' : 0, margin: (d.resalte?.chips ?? 0) > 0 ? '0 -6px' : 0 }}>
          <span style={{ width: 78, marginRight: 4, color: LP.ink3, fontSize: 14.4, whiteSpace: 'nowrap' }}>A menos de</span>
          {RADIOS_KM.map((r, i) => {
            const on = r === d.radio;
            const h = d.chip === i ? (d.hover?.chip ?? 0) : 0;
            return (
              <span key={r} style={{ width: r < 10 ? 64 : 73, height: ALTO_CHIPS, display: 'grid', placeItems: 'center', boxSizing: 'border-box', borderRadius: 999, background: on ? LP.ink : LP.surface, border: `1px solid ${on ? LP.ink : h > 0 ? LP.accentBright : LP.surfaceLine}`, color: on ? LP.bg : h > 0 ? LP.ink : LP.ink2, fontSize: 14.7, fontWeight: 500, transform: d.chip === i ? `scale(${1 - 0.06 * (d.apretar?.chip ?? 0)})` : undefined }}>
                {r} km
              </span>
            );
          })}
        </div>
      )}

      {/* Cuántas */}
      <div style={{ position: 'absolute', left: CX, top: yCuenta(u), width: CW, height: 16, display: 'flex', alignItems: 'center', gap: 14, fontFamily: jetbrains, fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: LP.ink3 }}>
        <span style={{ whiteSpace: 'nowrap', borderRadius: 6, boxShadow: anillo(d.resalte?.cuenta), padding: (d.resalte?.cuenta ?? 0) > 0 ? '2px 6px' : 0, margin: (d.resalte?.cuenta ?? 0) > 0 ? '-2px -6px' : 0 }}>{cuenta}</span>
        <span style={{ flex: 1, height: 1, background: LP.line }} />
      </div>

      {/* Las tarjetas */}
      {listaSin ? (
        <>
          <div style={{ opacity: 1 - Math.min(1, u * 2) }}>
            <Grilla lista={listaSin} u={u} d={{ ...d, ubicacion: 'no' }} />
          </div>
          <div style={{ opacity: Math.max(0, u * 2 - 1) }}>
            <Grilla lista={lista} u={u} d={d} />
          </div>
        </>
      ) : antes ? (
        <>
          <div style={{ opacity: 1 - Math.min(1, cambio * 2) }}>
            <Grilla lista={antes} u={u} d={d} />
          </div>
          <div style={{ opacity: Math.max(0, cambio * 2 - 1) }}>
            <Grilla lista={lista} u={u} d={d} />
          </div>
        </>
      ) : (
        <Grilla lista={lista} u={u} d={d} />
      )}

      {/* La nota de la ubicación */}
      {u > 0 && (
        <p style={{ position: 'absolute', left: CX, top: CLUBES_P.nota(u, Math.ceil(lista.length / 3)).y, margin: 0, color: LP.ink3, fontSize: 14.1, lineHeight: 1.55, opacity: u, borderRadius: 8, boxShadow: anillo(d.resalte?.nota), padding: (d.resalte?.nota ?? 0) > 0 ? '2px 8px' : 0, marginLeft: (d.resalte?.nota ?? 0) > 0 ? -8 : 0, background: (d.resalte?.nota ?? 0) > 0 ? `rgba(255,255,255,${d.resalte?.nota})` : undefined, whiteSpace: 'nowrap' }}>
          Tu ubicación no sale de tu dispositivo: la distancia se calcula en tu navegador.
        </p>
      )}

      <BarraPublicaPC activo="Clubes" />
    </div>
  );
};

// =============================================================================================================
// El aviso del navegador: «galiesport.com quiere · Saber tu ubicación · Bloquear / Permitir»
// =============================================================================================================

/** Medidas en píxeles del video, dentro de la vista de la ventana (debajo de la barra de dirección). */
export const PERMISO = { x: 132, y: 2, ancho: 440, alto: 176, permitir: { x: 132 + 440 - 24 - 118, y: 2 + 176 - 24 - 44, ancho: 118, alto: 44 } };

export const PermisoUbicacion: FC<{ t: number; sitio?: string; hover?: number; apretar?: number }> = ({ t, sitio = 'galiesport.com', hover = 0, apretar = 0 }) =>
  t > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: PERMISO.x,
        top: PERMISO.y,
        width: PERMISO.ancho,
        height: PERMISO.alto,
        borderRadius: 14,
        background: '#FFFFFF',
        boxShadow: '0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)',
        fontFamily: '-apple-system, "SF Pro Text", Helvetica, sans-serif',
        opacity: Math.min(1, t * 1.5),
        transform: `translateY(${(1 - t) * -12}px) scale(${0.96 + 0.04 * t})`,
        transformOrigin: '20% 0%',
        zIndex: 600,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'absolute', left: 26, top: 24, fontSize: 21, color: '#202124' }}>{sitio} quiere</div>
      <div style={{ position: 'absolute', right: 22, top: 18, fontSize: 26, color: '#5F6368', lineHeight: 1 }}>×</div>
      <div style={{ position: 'absolute', left: 26, top: 66, display: 'flex', alignItems: 'center', gap: 14, fontSize: 19, color: '#3C4043' }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="#5F6368">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
        Saber tu ubicación
      </div>
      <div style={{ position: 'absolute', right: 24 + 118 + 12, bottom: 24, height: 44, padding: '0 22px', display: 'grid', placeItems: 'center', borderRadius: 22, border: '1.5px solid #DADCE0', color: '#1A73E8', fontSize: 18, fontWeight: 500, boxSizing: 'border-box' }}>Bloquear</div>
      <div
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
          width: 118,
          height: 44,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 22,
          background: hover > 0 ? `rgb(${26 - 6 * hover},${115 - 14 * hover},${232 - 22 * hover})` : '#1A73E8',
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 600,
          transform: `scale(${1 - 0.06 * apretar})`,
          boxShadow: hover > 0 ? `0 2px 8px rgba(26,115,232,${0.4 * hover})` : undefined,
        }}
      >
        Permitir
      </div>
    </div>
  ) : null;
