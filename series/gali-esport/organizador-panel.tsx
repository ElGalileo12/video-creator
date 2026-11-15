// El panel del ORGANIZADOR en escritorio con el diseño ACTUAL de la app (desde `organizador-torneo`, nov 2026): colores
// propios del bloque `.org-root` (variables --o-*, modo claro: fondo #fbfcfd, acento cian #16c7e6), letras Instrument Sans /
// Schibsted Grotesk / JetBrains Mono. Las pantallas viejas del organizador (organizador.tsx, invitaciones.tsx, azul cielo)
// quedan para los videos viejos.
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Marco: app/(dashboard)/organizer/layout.tsx, components/layout/SideNav.tsx + NavLinks.tsx (Inicio, Mensajes, Torneos,
//   Contactos, Calendario, Perfil), RoleSwitcher, TopBar.tsx (tema y campanita), NotificationBell.tsx, SupportWidget.tsx,
//   components/ui/toast.tsx (abajo a la derecha).
// - Inicio: app/(dashboard)/organizer/page.tsx. Mis torneos: tournaments/TournamentsClient.tsx + PageHeader.tsx.
// - «Crear torneo» (panel a la derecha, 448 px, 3 pasos): tournaments/CreateTournamentModal.tsx y app/lib/stat-profiles.ts.
// - El torneo: tournaments/[id]/TournamentSidebar.tsx (encabezado oscuro y pestañas), TournamentDetailClient.tsx (Resumen de
//   un borrador) y PublishModal.tsx («Publicar torneo», 8 requisitos).
// Invitaciones, el panel «Invitar Coach», Equipos y Contactos están en organizador-invitar.tsx.
// Página de 1440 × `vh`; las medidas exportadas van en píxeles de la página (para el puntero y la cámara).
import {
  ArrowLeft, ArrowRight, Calendar, CalendarCheck, CalendarDays, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronRight, Globe, Home, Image as ImagenIcono, Layers, MessageCircle,
  MessagesSquare, Moon, PencilLine, PlayCircle, Plus, Rocket, Search, Send, Share2, Trophy, Upload, User, UserCheck, UserPlus, Users, Users2, X, XCircle, Zap,
  Bell, Network, Mail, Settings, Wallet,
} from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';

// =============================================================================================================
// Medidas y colores
// =============================================================================================================

export const ANCHO_O = 1440;
export const SIDE_O = 176;
export const BARRA_O = 52;
/** Borde izquierdo y ancho del contenido de las páginas (`.o-page`: padding 32px 40px, máximo 1320). */
export const X0_O = SIDE_O + 40;
export const CW_O = ANCHO_O - SIDE_O - 80;

/** Variables `--o-*` del `.org-root` en modo claro (app/global.css). */
export const O = {
  bg: '#fbfcfd',
  surface: '#ffffff',
  sunken: '#f6f9fb',
  bgAlt: '#f2f6f9',
  line: '#e3e9ef',
  ink: '#0a1520',
  ink2: '#3d4c5c',
  ink3: '#7d8b99',
  accent: '#16c7e6',
  accentText: '#0e7490',
  accentStrong: '#0c4a6e',
  accentSoft: '#eaf6fa',
  accentLine: '#cfe9f1',
  onAccent: '#04212c',
  okBg: '#ecfdf5',
  okFg: '#047857',
  okLine: '#a7f3d0',
  waitBg: '#fdf3dc',
  waitFg: '#92600e',
  outBg: '#fde8e8',
  outFg: '#b42323',
  outLine: '#f6c4c4',
  nav: 'radial-gradient(60% 140% at 90% 0%, rgba(0, 212, 255, 0.2), transparent 70%), linear-gradient(180deg, #111f2e, #09111b)',
};
/** Grises de Tailwind que usa la ventana «Crear torneo». */
const G = { g50: '#f9fafb', g100: '#f3f4f6', g200: '#e5e7eb', g300: '#d1d5db', g400: '#9ca3af', g500: '#6b7280', g600: '#4b5563', g700: '#374151', g800: '#1f2937', g900: '#111827' };

export type CajaO = { x: number; y: number; ancho: number; alto: number };
export const cajaO = (x: number, y: number, ancho: number, alto: number): CajaO => ({ x, y, ancho, alto });
export const centroO = (r: CajaO) => ({ x: r.x + r.ancho / 2, y: r.y + r.alto / 2 });
/** Anillo de realce (el mismo azul de los otros tutoriales). */
export const anilloO = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const sombraAnillo = (t: number | undefined, base?: string) => [anilloO(t ?? 0), base].filter(Boolean).join(', ') || undefined;

// =============================================================================================================
// Datos de ejemplo (inventados; los mismos en todo el video)
// =============================================================================================================

export const ORGANIZADOR_O = { nombre: 'Andrés Pardo', correo: 'andres.pardo@ejemplo.com' };
export const TORNEO_O = {
  id: '3f9c2a71-8d4e-4b6a-9c15-2e7f0b5d4a18',
  nombre: 'Copa Fénix 2027',
  deporte: 'Fútbol',
  modalidad: 'Por coach',
  formato: 'Grupos + Eliminación',
  inicio: '2027-01-15',
  fin: '2027-02-28',
  inicioCorto: '15 ene',
  finCorto: '28 feb',
  maximo: 8,
  descripcion: 'Torneo de escuelas de fútbol Sub-13 en Bogotá. Premios para los tres primeros.',
  /** Días entre el 12 de noviembre de 2026 y el 15 de enero de 2027. */
  diasParaArrancar: 64,
};
export const OTROS_TORNEOS_O = [
  { nombre: 'Liga Norte Sub-11 2026', estado: 'IN_PROGRESS' as const, formato: 'Liga', equipos: 10, maximo: 10, inicio: '6 sept 2026' },
  { nombre: 'Torneo Relámpago Sub-15', estado: 'FINISHED' as const, formato: 'Elim. simple', equipos: 8, maximo: 8, inicio: '14 jun 2026' },
];

// =============================================================================================================
// Marco: menú lateral, barra de arriba, campanita, soporte y avisos
// =============================================================================================================

const ENLACES_O: { nombre: string; Icono: typeof Home }[] = [
  { nombre: 'Inicio', Icono: Home },
  { nombre: 'Mensajes', Icono: MessagesSquare },
  { nombre: 'Torneos', Icono: Trophy },
  { nombre: 'Contactos', Icono: Users2 },
  { nombre: 'Calendario', Icono: CalendarCheck },
  { nombre: 'Perfil', Icono: User },
];
/** Un enlace del menú lateral, en la página. */
export const enlaceOrg = (nombre: string) => cajaO(14, 60 + ENLACES_O.findIndex((e) => e.nombre === nombre) * 38, SIDE_O - 28, 36);

const MenuOrganizador: FC<{ vh: number; activo: string; hoverEn?: string; hover?: number; resalte?: number }> = ({ vh, activo, hoverEn, hover = 0, resalte = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SIDE_O, height: vh, background: O.surface, borderRight: `1px solid ${O.line}`, padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: `1px solid ${O.line}`, boxSizing: 'border-box' }}>
      <Isotipo tamano={32} />
      <div style={{ fontFamily: schibsted, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: O.ink }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ENLACES_O.map(({ nombre, Icono }) => {
        const on = nombre === activo;
        const h = !on && nombre === hoverEn ? hover : 0;
        return (
          <div
            key={nombre}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              height: 36,
              padding: '0 10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: on ? 500 : 400,
              color: on ? O.accentStrong : h > 0.5 ? O.ink : O.ink2,
              background: on ? O.accentSoft : h > 0 ? `rgba(242,246,249,${h})` : 'transparent',
              boxShadow: on ? anilloO(resalte) : undefined,
            }}
          >
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span>{nombre}</span>
          </div>
        );
      })}
    </nav>
    {/* Cambiar de rol */}
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20 + 50 + 8, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px', borderRadius: 10, fontSize: 12, color: O.ink2 }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', color: O.ink3 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6" />
        </svg>
      </span>
      <span style={{ flex: 1, fontWeight: 500 }}>Cambiar de rol</span>
      <ChevronDown size={14} />
    </div>
    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 20 + 50 + 8 + 40 + 12, height: 1, background: O.line }} />
    {/* Tarjeta del usuario */}
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: `1px solid ${O.line}`, background: O.sunken, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: O.accent, color: O.onAccent, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>A</div>
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: `2px solid ${O.sunken}`, boxSizing: 'border-box' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: O.ink }}>{ORGANIZADOR_O.nombre}</div>
        <div style={{ fontSize: 11, color: O.ink2 }}>Organizador</div>
      </div>
      <ChevronDown size={14} color={O.ink3} />
    </div>
  </div>
);

const ALTO_AVISO = 95;
/** La campanita (botón de 34 a la derecha de la barra). */
export const CAMPANA_O = cajaO(ANCHO_O - 20 - 34, 9, 34, 34);
/** La lista de avisos (360 de ancho, alineada a la derecha de la campanita). */
export const AVISOS_O = { x: ANCHO_O - 20 - 360, y: 9 + 34 + 8, ancho: 360, item: (i: number) => cajaO(ANCHO_O - 20 - 360, 9 + 34 + 8 + 46 + i * ALTO_AVISO, 360, ALTO_AVISO) };

export type AvisoO = { glifo: string; fondo: string; color: string; titulo: string; cuerpo: string | null; cuando: string; leido?: boolean };
/** El aviso de la app cuando un entrenador acepta (TOURNAMENT_INVITE_ACCEPTED, app/lib/notifications.ts). */
export const avisoAceptada = (quien: string, torneo: string, cuando = 'ahora'): AvisoO => ({ glifo: '✓', fondo: '#ECFDF5', color: '#059669', titulo: 'Aceptaron tu invitación', cuerpo: `${quien} aceptó la invitación a ${torneo}.`, cuando });
export const avisoRechazada = (quien: string, torneo: string, cuando = 'ahora'): AvisoO => ({ glifo: '✕', fondo: '#FEF2F2', color: '#DC2626', titulo: 'Rechazaron tu invitación', cuerpo: `${quien} rechazó la invitación a ${torneo}.`, cuando });

export type DatosCampanaO = { sinLeer: number; vaiven?: number; abierta?: number; hover?: number; hoverItem?: number; avisos: AvisoO[]; resalteItem?: number };

const BotonBarraO: FC<{ children: ReactNode; abierto?: boolean; hover?: number; style?: CSSProperties }> = ({ children, abierto, hover = 0, style }) => (
  <div
    style={{
      position: 'relative',
      width: 34,
      height: 34,
      borderRadius: 10,
      display: 'grid',
      placeItems: 'center',
      border: `1px solid ${abierto ? O.accentLine : O.line}`,
      background: abierto ? O.accentSoft : hover > 0.5 ? O.sunken : O.surface,
      color: abierto ? O.accentStrong : hover > 0.5 ? O.ink : O.ink2,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

const BarraO: FC<{ campana?: DatosCampanaO }> = ({ campana }) => {
  const abierta = (campana?.abierta ?? 0) > 0.5;
  const giro = campana?.vaiven ? Math.sin(campana.vaiven * Math.PI * 6) * 16 * (1 - campana.vaiven) : 0;
  return (
    <div style={{ position: 'absolute', left: SIDE_O, right: 0, top: 0, height: BARRA_O, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '0 20px', background: O.surface, borderBottom: `1px solid ${O.line}`, boxSizing: 'border-box', zIndex: 30 }}>
      <BotonBarraO>
        <Moon size={17} />
      </BotonBarraO>
      <BotonBarraO abierto={abierta} hover={campana?.hover}>
        <span style={{ display: 'grid', transform: `rotate(${giro}deg)`, transformOrigin: '50% 10%' }}>
          <Bell size={17} />
        </span>
        {(campana?.sinLeer ?? 0) > 0 && (
          <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'content-box', borderRadius: 99, border: `2px solid ${O.surface}`, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', lineHeight: 1 }}>
            {campana?.sinLeer}
          </span>
        )}
      </BotonBarraO>
    </div>
  );
};

const ListaAvisosO: FC<{ d: DatosCampanaO }> = ({ d }) => {
  const t = d.abierta ?? 0;
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: AVISOS_O.x, top: AVISOS_O.y, width: AVISOS_O.ancho, background: O.surface, border: `1px solid ${O.line}`, borderRadius: 14, boxShadow: '0 12px 40px rgba(15,23,42,0.14)', zIndex: 70, overflow: 'hidden', opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -6}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', height: 46, boxSizing: 'border-box', borderBottom: `1px solid ${O.line}` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: O.ink }}>Notificaciones</span>
        {d.sinLeer > 0 && <span style={{ color: O.accentText, fontSize: 12, fontWeight: 600 }}>Marcar todas como leídas</span>}
      </div>
      {d.avisos.map((a, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            padding: '11px 14px',
            height: ALTO_AVISO,
            boxSizing: 'border-box',
            borderBottom: `1px solid ${O.bgAlt}`,
            background: i === 0 && (d.hoverItem ?? 0) > 0.5 ? '#dff0f6' : a.leido ? O.surface : O.accentSoft,
            boxShadow: i === 0 ? anilloO(d.resalteItem) : undefined,
            position: 'relative',
          }}
        >
          <span style={{ width: 30, height: 30, borderRadius: 8, background: a.fondo, color: a.color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{a.glifo}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: a.leido ? 500 : 700, color: O.ink, lineHeight: 1.35 }}>{a.titulo}</span>
            {a.cuerpo && <span style={{ display: 'block', fontSize: 12, color: O.ink2, marginTop: 2, lineHeight: 1.35 }}>{a.cuerpo}</span>}
            <span style={{ display: 'block', fontSize: 11, color: O.ink3, marginTop: 3 }}>{a.cuando}</span>
          </span>
          {!a.leido && <span style={{ width: 8, height: 8, borderRadius: 99, background: O.accent, marginTop: 6, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
};

/** El aviso (toast) de la app: abajo a la derecha, entra desde la derecha. `t` 0 → 1 → 0. */
export const ToastO: FC<{ vh: number; t: number; texto: string; tipo?: 'success' | 'error' }> = ({ vh, t, texto, tipo = 'success' }) => {
  if (t <= 0) return null;
  const c = tipo === 'success' ? { bg: '#F0FDF4', borde: '#BBF7D0', icono: '#16A34A', texto: '#14532D', Icono: CheckCircle } : { bg: '#FEF2F2', borde: '#FECACA', icono: '#DC2626', texto: '#7F1D1D', Icono: XCircle };
  const ancho = Math.min(360, Math.max(260, 14 * 2 + 18 + 10 + texto.length * 6.6 + 10 + 18));
  return (
    <div style={{ position: 'absolute', left: ANCHO_O - 24 - ancho, top: vh - 24 - 46, width: ancho, height: 46, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10, background: c.bg, border: `1px solid ${c.borde}`, borderRadius: 12, padding: '12px 14px', boxShadow: '0 8px 24px rgba(15,23,42,0.10)', opacity: t, transform: `translateX(${(1 - t) * 24}px)`, zIndex: 9999 }}>
      <c.Icono size={18} color={c.icono} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.texto, lineHeight: 1.45 }}>{texto}</span>
      <X size={14} color={c.icono} style={{ opacity: 0.6 }} />
    </div>
  );
};

/** El botón redondo de soporte (SupportWidget), abajo a la derecha. */
const BotonSoporteO: FC<{ vh: number }> = ({ vh }) => (
  <div style={{ position: 'absolute', left: ANCHO_O - 20 - 56, top: vh - 20 - 56, width: 56, height: 56, borderRadius: 99, display: 'grid', placeItems: 'center', background: O.accent, color: O.onAccent, boxShadow: '0 10px 28px rgba(15,23,42,0.25)', zIndex: 45 }}>
    <MessageCircle size={24} />
  </div>
);

/**
 * El marco del panel del organizador: fondo, el contenido (desplazado `scroll`), la barra, el menú, el soporte y, encima,
 * las ventanas (`encima`). `activo` es el enlace marcado del menú.
 */
export const MarcoOrganizador: FC<{
  vh: number;
  activo: string;
  scroll?: number;
  hoverEn?: string;
  hover?: number;
  resalteMenu?: number;
  campana?: DatosCampanaO;
  children?: ReactNode;
  encima?: ReactNode;
}> = ({ vh, activo, scroll = 0, hoverEn, hover, resalteMenu, campana, children, encima }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_O, height: vh, overflow: 'hidden', background: O.bg, fontFamily: instrument, color: O.ink, lineHeight: 1.5, WebkitFontSmoothing: 'antialiased' }}>
    <div style={{ position: 'absolute', left: 0, top: -scroll, width: ANCHO_O }}>{children}</div>
    <BarraO campana={campana} />
    <MenuOrganizador vh={vh} activo={activo} hoverEn={hoverEn} hover={hover} resalte={resalteMenu} />
    <BotonSoporteO vh={vh} />
    {campana && <ListaAvisosO d={campana} />}
    {encima}
  </div>
);

// =============================================================================================================
// Piezas comunes
// =============================================================================================================

/** El encabezado de las páginas (components/layout/PageHeader.tsx). */
const EncabezadoPagina: FC<{ x: number; y: number; ancho: number; alto: number; titulo: string; subtitulo: string; acciones?: ReactNode; resalte?: number }> = ({ x, y, ancho, alto, titulo, subtitulo, acciones, resalte }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: ancho, height: alto, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderRadius: 16, border: `1px solid ${O.line}`, background: O.surface, padding: '16px 20px', boxShadow: sombraAnillo(resalte, '0 1px 2px rgba(15, 23, 42, 0.04)') }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', minWidth: 0 }}>
      <span style={{ width: 4, borderRadius: 99, background: O.accent, flexShrink: 0 }} />
      <div style={{ padding: '2px 0' }}>
        <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em', color: O.ink }}>{titulo}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: O.ink3, lineHeight: 1.43 }}>{subtitulo}</p>
      </div>
    </div>
    {acciones}
  </div>
);

const BotonPrimario: FC<{ children: ReactNode; hover?: number; apretar?: number; resalte?: number; style?: CSSProperties }> = ({ children, hover = 0, apretar = 0, resalte, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: O.accent,
      color: O.onAccent,
      borderRadius: 12,
      padding: '10px 18px',
      fontSize: 14,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      boxShadow: sombraAnillo(resalte, '0 6px 16px rgba(2,132,199,0.22)'),
      filter: hover > 0.5 ? 'brightness(1.08)' : undefined,
      transform: `scale(${1 - apretar * 0.05})`,
      ...style,
    }}
  >
    {children}
  </div>
);

const TARJETA: CSSProperties = { background: O.surface, border: `1px solid ${O.line}`, borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)', boxSizing: 'border-box' };

// =============================================================================================================
// Inicio del organizador
// =============================================================================================================

/** El enlace «Torneos recientes» y demás medidas del Inicio. */
export const INICIO_O = {
  hero: cajaO(X0_O, BARRA_O + 32, CW_O, 196),
  crear: cajaO(X0_O + 32, BARRA_O + 32 + 28 + 98, 138, 38),
  stats: BARRA_O + 32 + 196 + 28,
  listas: BARRA_O + 32 + 196 + 28 + 131 + 28,
};

const Chispa: FC<{ color: string; datos: number[] }> = ({ color, datos }) => {
  const max = Math.max(...datos, 1);
  const pts = datos.map((v, i) => `${2 + (i / (datos.length - 1)) * 76},${26 - (v / max) * 24}`).join(' ');
  return (
    <svg width={80} height={28} viewBox="0 0 80 28" fill="none">
      <polyline points={pts} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
    </svg>
  );
};

export const PaginaInicioO: FC<{ resalte?: { hero?: number; crear?: number } }> = ({ resalte = {} }) => {
  const h = INICIO_O.hero;
  const stats = [
    { label: 'Torneos totales', valor: 2, Icono: Trophy, color: O.accent, datos: [0, 0, 1, 0, 1, 0] },
    { label: 'Equipos activos', valor: 10, Icono: Users, color: '#10B981', datos: [4, 6, 8, 8, 10, 10] },
    { label: 'Partidos jugados', valor: 24, Icono: PlayCircle, color: '#F59E0B', datos: [2, 5, 3, 6, 4, 5] },
    { label: 'Coaches', valor: 7, Icono: UserCheck, color: O.ink3, datos: [1, 2, 4, 5, 6, 7] },
  ];
  const anchoStat = (CW_O - 42) / 4;
  const anchoLista = (CW_O - 18) / 2;
  return (
    <>
      {/* Hero */}
      <div style={{ position: 'absolute', left: h.x, top: h.y, width: h.ancho, height: h.alto, borderRadius: 18, background: O.nav, border: '1px solid rgba(255,255,255,0.16)', boxShadow: sombraAnillo(resalte.hero, '0 24px 48px -28px rgba(0,0,0,0.55)'), padding: '28px 32px', boxSizing: 'border-box', color: '#f1f6f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 120% at 85% 0%, rgba(0,212,255,0.22), transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '36px 36px', maskImage: 'linear-gradient(90deg, transparent 20%, #000 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 20%, #000 100%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: jetbrains, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#38d9f0', marginBottom: 8 }}>Bienvenido de vuelta</div>
          <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 30, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff' }}>{ORGANIZADOR_O.nombre}</h1>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4, marginBottom: 20 }}>2 torneos gestionados</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(180deg, #41e3f7, #16c7e6)', color: '#04212c', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, boxShadow: sombraAnillo(resalte.crear, '0 8px 20px -8px rgba(56,217,240,0.6)') }}>
              <Plus size={15} /> Crear torneo
            </div>
            {[
              { n: 10, l: 'equipos activos' },
              { n: 3, l: 'próximos partidos' },
              { n: 24, l: 'jugados' },
            ].map((k) => (
              <div key={k.l} style={{ borderLeft: '1px solid rgba(255,255,255,0.14)', paddingLeft: 16 }}>
                <div style={{ fontFamily: jetbrains, fontSize: 20, fontWeight: 700, lineHeight: 1, color: '#fff' }}>{k.n}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 18px', minWidth: 190, border: '1px solid rgba(56,217,240,0.28)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8, marginBottom: 6 }}>En curso</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{OTROS_TORNEOS_O[0].nombre}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Fútbol · 10 equipos</div>
        </div>
      </div>

      {/* Cifras */}
      {stats.map((s, i) => (
        <div key={s.label} style={{ position: 'absolute', left: X0_O + i * (anchoStat + 14), top: INICIO_O.stats, width: anchoStat, height: 131, ...TARJETA, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${s.color} 12%, transparent)`, display: 'grid', placeItems: 'center' }}>
              <s.Icono size={18} color={s.color} />
            </div>
            <Chispa color={s.color} datos={s.datos} />
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: O.ink }}>{s.valor}</div>
            <div style={{ fontSize: 12, color: O.ink2, marginTop: 4 }}>{s.label}</div>
          </div>
        </div>
      ))}

      {/* Torneos recientes y próximos partidos */}
      {[
        {
          titulo: 'Torneos recientes',
          enlace: 'Ver todos',
          filas: OTROS_TORNEOS_O.map((t) => ({
            a: t.nombre,
            chip: t.estado === 'IN_PROGRESS' ? { l: 'En curso', c: '#16a34a', bg: 'color-mix(in srgb, #16a34a 13%, transparent)' } : { l: 'Finalizado', c: O.ink2, bg: O.line },
            barra: t.estado === 'IN_PROGRESS' ? 46 : 100,
            b: `Fútbol · ${t.equipos} equipos · ${t.formato === 'Liga' ? 'Liga' : 'Elim. simple'}`,
          })),
        },
        {
          titulo: 'Próximos partidos',
          enlace: 'Ver calendario',
          filas: [
            { a: 'Leones FC vs Club Halcones', hora: '14 nov, 09:00 a.m.', b: `${OTROS_TORNEOS_O[0].nombre} · Fase regular` },
            { a: 'Deportivo Norte vs Escuela Tiburones', hora: '14 nov, 11:00 a.m.', b: `${OTROS_TORNEOS_O[0].nombre} · Fase regular` },
            { a: 'Academia Fénix Bogotá vs Pumas FC', hora: '21 nov, 09:00 a.m.', b: `${OTROS_TORNEOS_O[0].nombre} · Fase regular` },
          ],
        },
      ].map((l, k) => (
        <div key={l.titulo} style={{ position: 'absolute', left: X0_O + k * (anchoLista + 18), top: INICIO_O.listas, width: anchoLista, ...TARJETA, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: `1px solid ${O.line}` }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{l.titulo}</span>
            <span style={{ fontSize: 12, color: O.accent, display: 'flex', alignItems: 'center', gap: 2 }}>
              {l.enlace} <ChevronRight size={13} />
            </span>
          </div>
          {l.filas.map((f, i) => (
            <div key={i} style={{ padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'chip' in f ? 6 : 3 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{f.a}</div>
                {'chip' in f && f.chip ? (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: f.chip.c, background: f.chip.bg }}>{f.chip.l}</span>
                ) : (
                  <span style={{ fontSize: 11, color: O.accent, fontWeight: 500 }}>{'hora' in f ? f.hora : ''}</span>
                )}
              </div>
              {'barra' in f && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 4, background: O.bgAlt, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.barra}%`, background: 'chip' in f && f.chip ? f.chip.c : O.ink3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: O.ink3 }}>{f.barra}%</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: O.ink3 }}>{f.b}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

// =============================================================================================================
// Mis torneos
// =============================================================================================================

const Y_MT = BARRA_O + 32;
const ANCHO_CREAR_MT = 152;
export const MIS_TORNEOS_O = {
  header: cajaO(X0_O, Y_MT, CW_O, 86),
  crear: cajaO(X0_O + CW_O - 20 - ANCHO_CREAR_MT, Y_MT + 23, ANCHO_CREAR_MT, 40),
  kpis: Y_MT + 86 + 24,
  filtros: Y_MT + 86 + 24 + 127 + 24,
  tarjetas: Y_MT + 86 + 24 + 127 + 24 + 42 + 20,
  tarjeta: (i: number) => cajaO(X0_O + i * ((CW_O - 36) / 3 + 18), Y_MT + 86 + 24 + 127 + 24 + 42 + 20, (CW_O - 36) / 3, 214),
};

type EstadoT = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
const ESTADO_T: Record<EstadoT, { l: string; color: string; bg: string; acento: string }> = {
  DRAFT: { l: 'Borrador', color: O.ink2, bg: O.bgAlt, acento: O.line },
  PUBLISHED: { l: 'Publicado', color: O.accentStrong, bg: O.accentSoft, acento: O.accentText },
  IN_PROGRESS: { l: 'En curso', color: O.okFg, bg: O.okBg, acento: '#10b981' },
  FINISHED: { l: 'Finalizado', color: '#0c4a6e', bg: O.accentSoft, acento: '#0c4a6e' },
  CANCELLED: { l: 'Cancelado', color: O.outFg, bg: O.outBg, acento: '#ef4444' },
};

const KpiO: FC<{ label: string; valor: string | number; sub: string; icono: ReactNode; bg: string; color: string; trend?: string; trendColor?: string }> = ({ label, valor, sub, icono, bg, color, trend, trendColor }) => (
  <div style={{ background: O.surface, border: `1px solid ${O.line}`, borderRadius: 14, padding: 14, boxShadow: '0 1px 2px rgba(31,25,41,0.04)', height: 127, boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icono}</span>
      {trend && <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: `color-mix(in srgb, ${trendColor} 9%, transparent)`, color: trendColor }}>{trend}</span>}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1, color: O.ink }}>{valor}</div>
    <div style={{ fontSize: 12, color: O.ink3, marginTop: 4 }}>{label}</div>
    <div style={{ fontSize: 11, color: O.ink3, marginTop: 2 }}>{sub}</div>
  </div>
);

export const PaginaMisTorneos: FC<{ hover?: { crear?: number }; apretar?: { crear?: number }; resalte?: { header?: number; crear?: number; tarjetas?: number } }> = ({ hover = {}, apretar = {}, resalte = {} }) => {
  const M = MIS_TORNEOS_O;
  const anchoKpi = (CW_O - 42) / 4;
  const filtros: [string, number][] = [
    ['Todos', 2],
    ['Borrador', 0],
    ['Publicado', 0],
    ['En curso', 1],
    ['Finalizado', 1],
    ['Cancelado', 0],
  ];
  return (
    <>
      <EncabezadoPagina
        {...M.header}
        titulo="Mis torneos"
        subtitulo="Gestiona y organiza tus torneos deportivos."
        resalte={resalte.header}
        acciones={
          <BotonPrimario hover={hover.crear} apretar={apretar.crear} resalte={resalte.crear} style={{ width: ANCHO_CREAR_MT, height: 40, padding: 0 }}>
            <Plus size={16} /> Crear torneo
          </BotonPrimario>
        }
      />
      {/* KPIs */}
      <div style={{ position: 'absolute', left: X0_O, top: M.kpis, width: CW_O, display: 'grid', gridTemplateColumns: `repeat(3, ${anchoKpi}px) ${anchoKpi}px`, gap: 14 }}>
        <KpiO label="Torneos totales" valor={2} sub="0 en borrador" icono={<Trophy size={15} />} bg={O.accentSoft} color={O.accentText} trend="2 total" trendColor={O.accentStrong} />
        <KpiO label="En curso" valor={1} sub="torneos activos" icono={<Zap size={15} />} bg={O.okBg} color={O.okFg} trend="activo" trendColor={O.okFg} />
        <KpiO label="Equipos inscritos" valor={18} sub="en todos los torneos" icono={<Users size={15} />} bg={O.accentSoft} color={O.accentStrong} trend="18 total" trendColor={O.accentStrong} />
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, padding: 14, color: '#fff', background: O.nav, boxShadow: '0 12px 32px rgba(3, 105, 161, 0.22)', height: 127, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={15} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.18)' }}>sáb, 14 nov</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>09:00 a.m.</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{OTROS_TORNEOS_O[0].nombre}</div>
          <div style={{ fontSize: 10.5, opacity: 0.78, marginTop: 4 }}>Leones FC vs Club Halcones</div>
        </div>
      </div>
      {/* Filtros y buscador */}
      <div style={{ position: 'absolute', left: X0_O, top: M.filtros, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: O.surface, border: `1px solid ${O.line}`, borderRadius: 12, boxShadow: '0 1px 2px rgba(31,25,41,0.04)' }}>
          {filtros.map(([l, n], i) => (
            <div key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: i === 0 ? O.accent : 'transparent', color: i === 0 ? O.onAccent : O.ink2 }}>
              {l}
              {n > 0 && <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, padding: '1px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center', boxSizing: 'border-box', background: i === 0 ? 'rgba(255,255,255,0.22)' : O.bgAlt, color: i === 0 ? O.onAccent : O.ink3 }}>{n}</span>}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', width: 340 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: O.ink3 }} />
          <div style={{ padding: '10px 12px 10px 36px', border: `1px solid ${O.line}`, borderRadius: 12, fontSize: 14, color: O.ink3, background: O.surface, height: 42, boxSizing: 'border-box' }}>Buscar torneo…</div>
        </div>
      </div>
      {/* Tarjetas */}
      {OTROS_TORNEOS_O.map((t, i) => {
        const r = M.tarjeta(i);
        const cfg = ESTADO_T[t.estado];
        const pct = Math.min(100, (t.equipos / t.maximo) * 100);
        return (
          <div key={t.nombre} style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, display: 'flex', flexDirection: 'column', background: O.surface, border: `1px solid ${O.line}`, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', boxShadow: anilloO(resalte.tarjetas) }}>
            <div style={{ height: 4, background: cfg.acento }} />
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: O.accentSoft, color: O.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trophy size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontFamily: schibsted, fontWeight: 700, fontSize: 16, color: O.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>{t.nombre}</h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, flexShrink: 0 }}>
                      {t.estado === 'IN_PROGRESS' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />}
                      {cfg.l}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: O.ink3 }}>Fútbol · {t.formato}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: O.ink2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Users size={14} color={O.ink3} /> {t.equipos} / {t.maximo} equipos
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} color={O.ink3} /> {t.inicio}
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: O.ink3, marginBottom: 6 }}>
                  <span>Cupos</span>
                  <span>
                    {t.equipos}/{t.maximo}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: O.bgAlt, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ef4444' : `linear-gradient(90deg, ${O.accent}, ${O.accentStrong})`, borderRadius: 999 }} />
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: O.accentText, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Ver detalle <ChevronRight size={14} />
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: O.accentStrong, background: O.accentSoft }}>
                  <Globe size={13} /> Ver torneo
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// =============================================================================================================
// «Crear torneo»: el panel de la derecha con los 3 pasos
// =============================================================================================================

const DX = ANCHO_O - 448;
const IX = DX + 24;
const IW = 400;
const B0 = 169;
/** Las tarjetas de Modalidad tienen la descripción en dos líneas. */
const MOD_H = 78;
/** Donde empieza «Formato» (con el deporte elegido); sin deporte sube `SIN_DEPORTE`. */
const SEC_FORMATO = 164 + 20 + 8 + MOD_H + 8 + 16 + 16;
const SIN_DEPORTE = -(SEC_FORMATO - 164);
/** Medidas de la ventana «Crear torneo» (paso 0, 1 y 2), según el alto `vh`. */
export const CREAR_T = (vh: number) => ({
  panel: cajaO(DX, 0, 448, vh),
  cerrar: cajaO(DX + 448 - 24 - 32, 22, 32, 32),
  paso: (i: number) => cajaO([DX + 24 + 27.5, DX + 24 + 206.5, DX + 24 + 379][i] - 16, 98, 32, 32),
  // Paso 1: Información
  nombre: cajaO(IX, B0 + 24, IW, 42),
  deporte: cajaO(IX, B0 + 82 + 24, IW, 42),
  opcionDeporte: (i: number) => cajaO(IX + 1, B0 + 82 + 24 + 42 + 4 + 6 + i * 32, IW - 2, 32),
  modalidad: cajaO(IX, B0 + 164, IW, 20 + 8 + MOD_H + 8 + 16),
  modo: (i: number) => cajaO(IX + i * 204, B0 + 164 + 28, 196, MOD_H),
  ayudaModo: cajaO(IX, B0 + 164 + 28 + MOD_H + 8, IW, 16),
  formato: (i: number) => cajaO(IX + (i % 2) * 204, B0 + SEC_FORMATO + 28 + Math.floor(i / 2) * 70, 196, 62),
  formatos: cajaO(IX, B0 + SEC_FORMATO, IW, 28 + 132),
  descripcion: cajaO(IX, B0 + SEC_FORMATO + 176 + 24, IW, 82),
  portada: cajaO(IX, B0 + SEC_FORMATO + 298 + 28, IW, 62),
  // Paso 2: Fechas y cupos
  inicio: cajaO(IX, B0 + 24, 194, 42),
  fin: cajaO(IX + 206, B0 + 24, 194, 42),
  maximo: cajaO(IX, B0 + 82 + 24, IW, 42),
  ayudaMaximo: cajaO(IX, B0 + 82 + 24 + 42 + 4, IW, 16),
  // Paso 3: Revisión
  resumen: cajaO(IX, B0 + 82 + 12, IW, 248),
  aviso: cajaO(IX, B0 + 82 + 12 + 248 + 12, IW, 32),
  // Pie
  cancelar: cajaO(IX, vh - 62, 196, 42),
  siguiente: cajaO(IX + 204, vh - 62, 196, 42),
});

export type DatosCrearTorneo = {
  /** El panel entra desde la derecha (0 → 1) y se va (1 → 0). */
  t: number;
  paso: 0 | 1 | 2;
  nombre: string;
  deporte: boolean;
  /** La lista del deporte abierta (0 → 1). */
  lista?: number;
  listaHover?: number | null;
  modo: 0 | 1;
  formato: number;
  descripcion: string;
  portada: number;
  inicio: string;
  fin: string;
  maximo: string;
  creando?: boolean;
  foco?: 'nombre' | 'descripcion' | 'inicio' | 'fin' | 'maximo' | null;
  hover?: Partial<Record<'deporte' | 'modo0' | 'formato3' | 'portada' | 'siguiente' | 'crear', number>>;
  apretar?: Partial<Record<'deporte' | 'modo0' | 'formato3' | 'portada' | 'siguiente' | 'crear', number>>;
  resalte?: Partial<Record<'nombre' | 'deporte' | 'modalidad' | 'modo0' | 'ayudaModo' | 'formatos' | 'descripcion' | 'portada' | 'fechas' | 'maximo' | 'resumen' | 'aviso' | 'pasos', number>>;
};

const MODOS = [
  { label: 'Por coach', desc: 'Invitas al coach y él inscribe a su equipo' },
  { label: 'Equipo libre', desc: 'Tú defines cuántos van en cada escuadra' },
];
const FORMATOS = [
  { label: 'Liga', desc: 'Todos contra todos en rondas' },
  { label: 'Eliminación simple', desc: 'Un partido elimina al equipo' },
  { label: 'Eliminación doble', desc: 'Dos derrotas para eliminar' },
  { label: 'Grupos + Eliminación', desc: 'Fase de grupos y eliminatorias' },
];

const Etiqueta: FC<{ children: ReactNode }> = ({ children }) => <div style={{ fontSize: 14, fontWeight: 500, color: G.g700, lineHeight: '20px' }}>{children}</div>;

const Campo: FC<{ r: CajaO; valor: string; placeholder: string; foco?: boolean; resalte?: number; derecha?: ReactNode; alto?: number; arriba?: boolean; sinCursor?: boolean }> = ({ r, valor, placeholder, foco, resalte, derecha, arriba, sinCursor }) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.ancho,
      height: r.alto,
      boxSizing: 'border-box',
      border: `1px solid ${foco ? O.accent : G.g200}`,
      borderRadius: 12,
      padding: '10px 12px',
      fontSize: 14,
      lineHeight: '20px',
      color: valor ? G.g900 : G.g400,
      background: '#fff',
      boxShadow: sombraAnillo(resalte, foco ? `0 0 0 2px ${O.accent}` : undefined),
      display: 'flex',
      alignItems: arriba ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
    }}
  >
    <span style={{ whiteSpace: arriba ? 'normal' : 'nowrap' }}>
      {foco && !sinCursor && !valor && <span style={{ display: 'inline-block', width: 1.5, height: 17, marginRight: 1, background: G.g900, verticalAlign: 'text-bottom' }} />}
      {valor || placeholder}
      {foco && !sinCursor && valor && <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, background: G.g900, verticalAlign: 'text-bottom' }} />}
    </span>
    {derecha}
  </div>
);

const Opcion: FC<{ r: CajaO; label: string; desc: string; on: boolean; hover?: number; apretar?: number; resalte?: number }> = ({ r, label, desc, on, hover = 0, apretar = 0, resalte }) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.ancho,
      height: r.alto,
      boxSizing: 'border-box',
      padding: 12,
      borderRadius: 12,
      border: `2px solid ${on ? O.accent : hover > 0.5 ? G.g300 : G.g200}`,
      background: on ? O.accentSoft : '#fff',
      transform: `scale(${1 - apretar * 0.04})`,
      boxShadow: anilloO(resalte),
    }}
  >
    {on && (
      <span style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 99, background: O.accent, display: 'grid', placeItems: 'center' }}>
        <Check size={12} color={O.onAccent} strokeWidth={3} />
      </span>
    )}
    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: '16px', color: on ? O.accentText : G.g800 }}>{label}</p>
    <p style={{ margin: '2px 0 0', fontSize: 11, lineHeight: '16px', color: G.g400 }}>{desc}</p>
  </div>
);

const FilaResumen: FC<{ l: string; v: string }> = ({ l, v }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
    <span style={{ color: G.g500, fontSize: 12, lineHeight: '16px' }}>{l}</span>
    <span style={{ color: G.g900, fontSize: 12, lineHeight: '16px', fontWeight: 500, textAlign: 'right', maxWidth: 200 }}>{v}</span>
  </div>
);

/** La portada que se sube (cancha y trofeo abstractos, sin personas ni logos). */
export const PortadaCopa: FC<{ alto: number }> = ({ alto }) => (
  <svg width="100%" height={alto} viewBox="0 0 400 96" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="pc-cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0c4a6e" />
        <stop offset="1" stopColor="#0e7490" />
      </linearGradient>
      <linearGradient id="pc-pasto" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
      <radialGradient id="pc-luz" cx="0.72" cy="0.1" r="0.6">
        <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.7" />
        <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="pc-oro" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <rect width="400" height="96" fill="url(#pc-cielo)" />
    <rect width="400" height="96" fill="url(#pc-luz)" />
    <path d="M0 58 L400 50 L400 96 L0 96 Z" fill="url(#pc-pasto)" />
    {[0, 1, 2, 3, 4].map((k) => (
      <path key={k} d={`M${k * 80} ${57.6 - k * 1.6} L${k * 80 + 40} ${56.8 - k * 1.6} L${k * 80 + 40} 96 L${k * 80} 96 Z`} fill="#ffffff" opacity={0.06} />
    ))}
    <path d="M0 58 L400 50" stroke="#ffffff" strokeOpacity={0.8} strokeWidth={1.2} />
    <ellipse cx="200" cy="76" rx="54" ry="11" fill="none" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={1.2} />
    <path d="M200 54 L200 96" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={1.2} />
    {/* Trofeo */}
    <g transform="translate(300 14)">
      <path d="M14 4 h28 v14 a14 14 0 0 1 -28 0 Z" fill="url(#pc-oro)" />
      <path d="M14 8 h-7 a7 7 0 0 0 9 11 M42 8 h7 a7 7 0 0 1 -9 11" fill="none" stroke="#f59e0b" strokeWidth={2.4} />
      <rect x="25" y="32" width="6" height="8" fill="#d97706" />
      <rect x="18" y="40" width="20" height="6" rx="2" fill="url(#pc-oro)" />
      <path d="M20 9 q2 9 6 13" stroke="#fff7d6" strokeOpacity={0.8} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
    {/* Balón */}
    <g transform="translate(86 66)">
      <circle r="9" fill="#ffffff" />
      <path d="M0 -4 l3.8 2.8 -1.5 4.4 h-4.6 l-1.5 -4.4 Z" fill="#0f172a" />
    </g>
  </svg>
);

export const PanelCrearTorneo: FC<{ d: DatosCrearTorneo; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const C = CREAR_T(vh);
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const r = d.resalte ?? {};
  const pasos = ['Información', 'Fechas y cupos', 'Revisión'];
  const anchos = [55, 70, 42];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.45 * d.t})`, backdropFilter: `blur(${6 * d.t}px)`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: DX + (1 - d.t) * 460, top: 0, width: 448, height: vh, background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', zIndex: 101, fontFamily: instrument }}>
        {/* Encabezado */}
        <div style={{ height: 78, boxSizing: 'border-box', padding: '20px 24px 16px', borderBottom: `1px solid ${G.g100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 16, lineHeight: '24px', fontWeight: 600, color: G.g900 }}>Crear torneo</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, lineHeight: '16px', color: G.g400 }}>Configura tu torneo en 3 pasos. Podrás editar todo después.</p>
          </div>
          <div style={{ padding: 6, marginTop: 2 }}>
            <X size={20} color={G.g400} />
          </div>
        </div>
        {/* Pasos */}
        <div style={{ position: 'absolute', left: 24, top: 98, width: IW, height: 51, display: 'flex', alignItems: 'flex-start', borderRadius: 10, boxShadow: anilloO(r.pasos) }}>
          {pasos.map((p, i) => (
            <div key={p} style={{ display: 'contents' }}>
              <div style={{ width: anchos[i], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, background: i <= d.paso ? O.accent : G.g100, color: i <= d.paso ? O.onAccent : G.g400 }}>
                  {i < d.paso ? <Check size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, lineHeight: '15px', whiteSpace: 'nowrap', color: i <= d.paso ? O.accentText : G.g400 }}>{p}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, margin: '16px 8px 0', background: i < d.paso ? O.accent : G.g200 }} />}
            </div>
          ))}
        </div>

        {/* Paso 1: Información */}
        {d.paso === 0 && (
          <div style={{ position: 'absolute', left: -DX, top: 0, width: ANCHO_O, height: vh }}>
            <div style={{ position: 'absolute', left: IX, top: B0, width: IW }}>
              <Etiqueta>
                Nombre del torneo <span style={{ color: '#ef4444' }}>*</span>
              </Etiqueta>
            </div>
            <Campo r={C.nombre} valor={d.nombre} placeholder="ej. Copa Galileo 2026" foco={d.foco === 'nombre'} resalte={r.nombre} />
            <div style={{ position: 'absolute', left: IX, top: B0 + 82, width: IW }}>
              <Etiqueta>
                Deporte <span style={{ color: '#ef4444' }}>*</span>
              </Etiqueta>
            </div>
            <Campo r={C.deporte} valor={d.deporte ? 'Fútbol' : ''} placeholder="Seleccionar deporte..." foco={(d.lista ?? 0) > 0.5} sinCursor resalte={(r.deporte ?? 0) + (a.deporte ?? 0) * 0.3} derecha={<ChevronDown size={16} color={G.g500} />} />
            {d.deporte && (
              <>
                <div style={{ position: 'absolute', left: IX, top: B0 + 164, width: IW, height: 20 + 8 + MOD_H + 8 + 16, borderRadius: 12, boxShadow: anilloO(r.modalidad) }}>
                  <Etiqueta>Modalidad</Etiqueta>
                </div>
                {MODOS.map((m, i) => (
                  <Opcion key={m.label} r={C.modo(i)} label={m.label} desc={m.desc} on={d.modo === i} hover={i === 0 ? h.modo0 : 0} apretar={i === 0 ? a.modo0 : 0} resalte={i === 0 ? r.modo0 : 0} />
                ))}
                <div style={{ position: 'absolute', left: C.ayudaModo.x, top: C.ayudaModo.y, width: IW, fontSize: 11, lineHeight: '16px', color: G.g400, borderRadius: 6, boxShadow: anilloO(r.ayudaModo) }}>Invitarás coaches y cada uno inscribe a su equipo.</div>
              </>
            )}
            <div style={{ position: 'absolute', left: IX, top: B0 + (d.deporte ? SEC_FORMATO : 164), width: IW, height: 28 + 132, borderRadius: 12, boxShadow: anilloO(r.formatos) }}>
              <Etiqueta>Formato</Etiqueta>
            </div>
            {FORMATOS.map((f, i) => {
              const c = C.formato(i);
              const dy = d.deporte ? 0 : SIN_DEPORTE;
              return <Opcion key={f.label} r={{ ...c, y: c.y + dy }} label={f.label} desc={f.desc} on={d.formato === i} hover={i === 3 ? h.formato3 : 0} apretar={i === 3 ? a.formato3 : 0} />;
            })}
            {(() => {
              const dy = d.deporte ? 0 : SIN_DEPORTE;
              const ds = { ...C.descripcion, y: C.descripcion.y + dy };
              const pt = { ...C.portada, y: C.portada.y + dy };
              const subida = d.portada;
              return (
                <>
                  <div style={{ position: 'absolute', left: IX, top: ds.y - 24, width: IW }}>
                    <Etiqueta>Descripción</Etiqueta>
                  </div>
                  <Campo r={ds} valor={d.descripcion} placeholder="Describe brevemente tu torneo, reglamento, premios..." foco={d.foco === 'descripcion'} resalte={r.descripcion} arriba />
                  <div style={{ position: 'absolute', left: IX, top: pt.y - 28, width: IW }}>
                    <Etiqueta>Imagen de portada</Etiqueta>
                  </div>
                  {subida > 0.5 ? (
                    <div style={{ position: 'absolute', left: pt.x, top: pt.y, width: IW, height: 96, borderRadius: 12, overflow: 'hidden', border: `1px solid ${G.g200}`, boxSizing: 'border-box', opacity: Math.min(1, (subida - 0.5) * 2), boxShadow: anilloO(r.portada) }}>
                      <PortadaCopa alto={96} />
                      <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.8)', borderRadius: 99, padding: '2px 8px', fontSize: 12, color: G.g600 }}>Cambiar</span>
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', left: pt.x, top: pt.y, width: IW, height: pt.alto, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: `1px dashed ${G.g200}`, borderRadius: 12, padding: '12px 16px', background: (h.portada ?? 0) > 0.5 ? G.g100 : G.g50, transform: `scale(${1 - (a.portada ?? 0) * 0.03})`, boxShadow: anilloO(r.portada) }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: `1px solid ${G.g200}`, display: 'grid', placeItems: 'center' }}>
                          <ImagenIcono size={15} color={G.g400} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', fontWeight: 500, color: G.g700 }}>Subir portada</p>
                          <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: G.g400 }}>PNG o JPG, recomendado 1600×600px</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${G.g200}`, borderRadius: 8, padding: '6px 12px', background: '#fff', fontSize: 12, fontWeight: 500, color: G.g600 }}>
                        <Upload size={11} />
                        {subida > 0 ? 'Subiendo…' : 'Subir'}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            {/* La lista del deporte (select nativo) */}
            {(d.lista ?? 0) > 0 && (
              <div style={{ position: 'absolute', left: C.deporte.x + 1, top: C.deporte.y + C.deporte.alto + 4, width: IW - 2, background: '#fff', border: `1px solid ${G.g300}`, borderRadius: 8, boxShadow: '0 10px 24px rgba(0,0,0,0.18)', padding: '6px 0', zIndex: 5, opacity: d.lista, fontSize: 14 }}>
                {['Seleccionar deporte...', 'Baloncesto', 'Fútbol'].map((o, i) => (
                  <div key={o} style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', background: d.listaHover === i ? '#2563eb' : 'transparent', color: d.listaHover === i ? '#fff' : G.g900 }}>
                    {o}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Fechas y cupos */}
        {d.paso === 1 && (
          <div style={{ position: 'absolute', left: -DX, top: 0, width: ANCHO_O, height: vh }}>
            <div style={{ position: 'absolute', left: IX - 6, top: B0 - 6, width: IW + 12, height: 66 + 12, borderRadius: 14, boxShadow: anilloO(r.fechas) }} />
            <div style={{ position: 'absolute', left: IX, top: B0 }}>
              <Etiqueta>Fecha inicio</Etiqueta>
            </div>
            <div style={{ position: 'absolute', left: IX + 206, top: B0 }}>
              <Etiqueta>Fecha fin</Etiqueta>
            </div>
            <Campo r={C.inicio} valor={d.inicio} placeholder="dd/mm/aaaa" foco={d.foco === 'inicio'} derecha={<CalendarDays size={16} color={G.g700} />} />
            <Campo r={C.fin} valor={d.fin} placeholder="dd/mm/aaaa" foco={d.foco === 'fin'} derecha={<CalendarDays size={16} color={G.g700} />} />
            <div style={{ position: 'absolute', left: IX, top: B0 + 82 }}>
              <Etiqueta>Máximo de equipos</Etiqueta>
            </div>
            <Campo r={C.maximo} valor={d.maximo} placeholder="Sin límite" foco={d.foco === 'maximo'} resalte={r.maximo} />
            <div style={{ position: 'absolute', left: IX, top: C.ayudaMaximo.y, fontSize: 11, lineHeight: '16px', color: G.g400 }}>Deja en blanco para no tener límite.</div>
          </div>
        )}

        {/* Paso 3: Revisión */}
        {d.paso === 2 && (
          <div style={{ position: 'absolute', left: 24, top: B0, width: IW, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ height: 80, borderRadius: 12, overflow: 'hidden', border: `1px solid ${G.g200}` }}>
              <PortadaCopa alto={80} />
            </div>
            <div style={{ background: G.g50, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: anilloO(r.resumen) }}>
              <FilaResumen l="Nombre" v={TORNEO_O.nombre} />
              <FilaResumen l="Deporte" v="Fútbol" />
              <FilaResumen l="Modalidad" v="Por coach" />
              <FilaResumen l="Formato" v="Grupos + Eliminación" />
              <FilaResumen l="Inicio" v={TORNEO_O.inicio} />
              <FilaResumen l="Fin" v={TORNEO_O.fin} />
              <FilaResumen l="Max. equipos" v={String(TORNEO_O.maximo)} />
              <FilaResumen l="Descripción" v={TORNEO_O.descripcion} />
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: G.g400, borderRadius: 6, boxShadow: anilloO(r.aviso) }}>
              El torneo se creará en estado <span style={{ fontWeight: 600 }}>Borrador</span>. Podrás publicarlo cuando esté listo.
            </p>
          </div>
        )}

        {/* Pie */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, boxSizing: 'border-box', padding: '8px 24px 20px', borderTop: `1px solid ${G.g100}`, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 42, boxSizing: 'border-box', border: `1px solid ${G.g200}`, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500, color: G.g600 }}>Cancelar</div>
          {d.paso < 2 ? (
            <div style={{ flex: 1, height: 42, borderRadius: 12, background: O.accent, color: O.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 14, fontWeight: 500, filter: (h.siguiente ?? 0) > 0.5 ? 'brightness(1.1)' : undefined, transform: `scale(${1 - (a.siguiente ?? 0) * 0.04})` }}>
              Siguiente <span style={{ fontSize: 16, lineHeight: 1 }}>›</span>
            </div>
          ) : (
            <div style={{ flex: 1, height: 42, borderRadius: 12, background: O.accent, color: O.onAccent, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500, opacity: d.creando ? 0.5 : 1, filter: (h.crear ?? 0) > 0.5 ? 'brightness(1.1)' : undefined, transform: `scale(${1 - (a.crear ?? 0) * 0.04})` }}>
              {d.creando ? 'Creando...' : 'Crear torneo'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// La página del torneo: encabezado oscuro y pestañas (TournamentSidebar.tsx)
// =============================================================================================================

export const H_HERO_O = 265;
const Y_TABS = BARRA_O + H_HERO_O;
/** Donde empieza el contenido de cada pestaña (debajo de las pestañas, con el padding de `.o-page`). */
export const Y_CONTENIDO_O = Y_TABS + 50 + 32;

const TABS_O: { label: string; Icono: typeof Home; ancho: number }[] = [
  { label: 'Resumen', Icono: Home, ancho: 104 },
  { label: 'Equipos', Icono: Users, ancho: 102 },
  { label: 'Fases y partidos', Icono: Network, ancho: 156 },
  { label: 'Calendario', Icono: CalendarDays, ancho: 122 },
  { label: 'Invitaciones', Icono: Mail, ancho: 132 },
  { label: 'Finanzas', Icono: Wallet, ancho: 110 },
  { label: 'Configuración', Icono: Settings, ancho: 142 },
];
const CONTADOR = 30;
/** Una pestaña del torneo (los contadores la ensanchan). */
export const pestanaTorneo = (label: string, cuentas: Partial<Record<string, number>> = {}) => {
  let x = X0_O;
  for (const t of TABS_O) {
    const w = t.ancho + (cuentas[t.label] ? CONTADOR : 0);
    if (t.label === label) return cajaO(x, Y_TABS, w, 49);
    x += w;
  }
  throw new Error(`No está la pestaña ${label}`);
};
const ACCIONES_HERO = { invitar: 142, editar: 96, publicar: 164 };
/** Botones del encabezado del torneo. */
export const HERO_O = {
  publicar: cajaO(X0_O + CW_O - ACCIONES_HERO.publicar, BARRA_O + 24, ACCIONES_HERO.publicar, 40),
  editar: cajaO(X0_O + CW_O - ACCIONES_HERO.publicar - 8 - ACCIONES_HERO.editar, BARRA_O + 24, ACCIONES_HERO.editar, 40),
  invitar: cajaO(X0_O + CW_O - ACCIONES_HERO.publicar - 16 - ACCIONES_HERO.editar - ACCIONES_HERO.invitar, BARRA_O + 24, ACCIONES_HERO.invitar, 40),
  titulo: cajaO(X0_O, BARRA_O + 24 + 40 + 32, 736, 113),
  estado: cajaO(X0_O + 82 + 252, BARRA_O + 24 + 40 + 32 + 5, 92, 26),
  stats: cajaO(X0_O + 736 + 28, BARRA_O + 24 + 40 + 32, 420, 113),
};

export type DatosHeroO = {
  aceptados: number;
  pendientes: number;
  tab: string;
  hoverTab?: string | null;
  hover?: Partial<Record<'invitar' | 'publicar' | 'tab', number>>;
  apretar?: Partial<Record<'invitar' | 'publicar' | 'tab', number>>;
  resalte?: Partial<Record<'estado' | 'titulo' | 'invitar' | 'tabs' | 'contadorEquipos' | 'publicar' | 'pestana', number>>;
};

const HeroChip: FC<{ Icono: typeof Zap; children: ReactNode }> = ({ Icono, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, whiteSpace: 'nowrap', lineHeight: 1.4 }}>
    <Icono size={13} />
    {children}
  </span>
);
const HeroStat: FC<{ kicker: string; valor: string; sub: string; progreso?: number; ambar?: boolean }> = ({ kicker, valor, sub, progreso, ambar }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: ambar ? '#fcd34d' : O.accentLine, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kicker}</div>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05 }}>{valor}</div>
    {progreso != null ? (
      <div style={{ marginTop: 8 }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.16)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progreso}%`, height: '100%', background: O.surface }} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
    ) : (
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>
    )}
  </div>
);

const BOTON_HERO: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: '#fff', borderRadius: 12, height: 40, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '-0.01em', boxSizing: 'border-box' };

/** El encabezado oscuro y las pestañas del torneo (borrador recién creado). */
export const EncabezadoTorneoO: FC<{ d: DatosHeroO }> = ({ d }) => {
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const r = d.resalte ?? {};
  const cuentas: Record<string, number> = { Equipos: d.aceptados, Invitaciones: d.pendientes };
  return (
    <>
      <div style={{ position: 'absolute', left: SIDE_O, top: BARRA_O, width: ANCHO_O - SIDE_O, height: H_HERO_O, overflow: 'hidden', color: '#fff', background: O.nav }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.4px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(115deg, black 0%, transparent 65%)', WebkitMaskImage: 'linear-gradient(115deg, black 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', right: '-8%', top: '-30%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.32), transparent 62%)', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', right: '18%', bottom: '-40%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.34), transparent 65%)', filter: 'blur(10px)' }} />
      </div>
      {/* Fila de arriba: volver y acciones */}
      <div style={{ position: 'absolute', left: X0_O, top: BARRA_O + 29, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600 }}>
        <ArrowLeft size={13} /> Mis torneos
      </div>
      <div style={{ position: 'absolute', left: HERO_O.invitar.x, top: HERO_O.invitar.y, width: HERO_O.invitar.ancho, ...BOTON_HERO, background: (h.invitar ?? 0) > 0.5 ? 'rgba(255,255,255,0.24)' : BOTON_HERO.background, boxShadow: anilloO(r.invitar), transform: `scale(${1 - (a.invitar ?? 0) * 0.05})` }}>
        <UserPlus size={15} /> Invitar coach
      </div>
      <div style={{ position: 'absolute', left: HERO_O.editar.x, top: HERO_O.editar.y, width: HERO_O.editar.ancho, ...BOTON_HERO }}>
        <PencilLine size={15} /> Editar
      </div>
      <div style={{ position: 'absolute', left: HERO_O.publicar.x, top: HERO_O.publicar.y, width: HERO_O.publicar.ancho, ...BOTON_HERO, background: O.surface, border: `1px solid ${O.surface}`, color: O.accentStrong, fontWeight: 700, boxShadow: sombraAnillo(r.publicar, '0 8px 20px rgba(0,0,0,0.18)'), filter: (h.publicar ?? 0) > 0.5 ? 'brightness(0.96)' : undefined, transform: `scale(${1 - (a.publicar ?? 0) * 0.05})` }}>
        <Send size={15} /> Publicar torneo
      </div>
      {/* Título del torneo */}
      <div style={{ position: 'absolute', left: HERO_O.titulo.x, top: HERO_O.titulo.y, width: HERO_O.titulo.ancho, height: HERO_O.titulo.alto, display: 'flex', alignItems: 'center', gap: 18, color: '#fff', borderRadius: 14, boxShadow: anilloO(r.titulo) }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 24px rgba(12, 74, 110, 0.35)', flexShrink: 0, alignSelf: 'flex-start', marginTop: 6 }}>
          {/* La portada recortada al centro (object-fit: cover) */}
          <div style={{ width: 267, marginLeft: -101.5 }}>
            <PortadaCopa alto={64} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#fff' }}>{TORNEO_O.nombre}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', boxShadow: anilloO(r.estado) }}>Borrador</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.92)' }}>
            <HeroChip Icono={Zap}>Grupos + Eliminación</HeroChip>
            <HeroChip Icono={Users}>
              <span>
                <strong style={{ fontWeight: 700 }}>
                  {d.aceptados}/{TORNEO_O.maximo}
                </strong>
                <span style={{ opacity: 0.78, marginLeft: 4 }}>equipos</span>
              </span>
            </HeroChip>
            <HeroChip Icono={CalendarDays}>{`${TORNEO_O.inicioCorto} – ${TORNEO_O.finCorto}`}</HeroChip>
          </div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'flex-start', gap: 7, maxWidth: 560 }}>
            <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{TORNEO_O.descripcion}</span>
            <PencilLine size={13} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0, marginTop: 3 }} />
          </div>
        </div>
      </div>
      {/* Cifras */}
      <div style={{ position: 'absolute', left: HERO_O.stats.x, top: HERO_O.stats.y, width: HERO_O.stats.ancho, height: HERO_O.stats.alto, boxSizing: 'border-box', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
        <HeroStat kicker="Avance" valor="0%" sub="0/0 partidos" progreso={0} />
        <HeroStat kicker="Días para arrancar" valor={String(TORNEO_O.diasParaArrancar)} sub="" ambar />
        <HeroStat kicker="Próximos" valor="0" sub="partidos programados" />
      </div>
      {/* Pestañas */}
      <div style={{ position: 'absolute', left: SIDE_O, top: Y_TABS, width: ANCHO_O - SIDE_O, height: 50, boxSizing: 'border-box', background: 'rgba(251,252,253,0.92)', borderBottom: `1px solid ${O.line}` }} />
      <div style={{ position: 'absolute', left: X0_O, top: Y_TABS, height: 49, display: 'flex', borderRadius: 10, boxShadow: anilloO(r.tabs) }}>
        {TABS_O.map((t) => {
          const on = t.label === d.tab;
          const hv = !on && t.label === d.hoverTab ? h.tab ?? 0 : 0;
          const n = cuentas[t.label];
          return (
            <div
              key={t.label}
              style={{
                width: t.ancho + (n ? CONTADOR : 0),
                height: 49,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                boxSizing: 'border-box',
                color: on ? O.accentText : hv > 0.5 ? O.ink : O.ink2,
                fontWeight: on ? 700 : 500,
                fontSize: 13.5,
                letterSpacing: '-0.01em',
                borderBottom: `2px solid ${on ? O.accent : 'transparent'}`,
                whiteSpace: 'nowrap',
                transform: hv > 0 ? `scale(${1 - (a.tab ?? 0) * 0.04})` : undefined,
                boxShadow: t.label === d.tab ? anilloO(r.pestana) : undefined,
                borderRadius: t.label === d.tab && (r.pestana ?? 0) > 0 ? 8 : 0,
              }}
            >
              <t.Icono size={15} />
              {t.label}
              {n ? (
                <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, background: on ? O.accentSoft : O.bgAlt, color: on ? O.accentStrong : O.ink3, padding: '3px 7px', borderRadius: 999, minWidth: 18, textAlign: 'center', boxSizing: 'border-box', boxShadow: t.label === 'Equipos' ? anilloO(r.contadorEquipos) : undefined }}>{n}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

// --- Resumen de un borrador (TournamentDetailClient.tsx) --------------------------------------------------------------------

const IZQ_ANCHO = CW_O - 24 - 340;
const DER_X = X0_O + IZQ_ANCHO + 24;
/** Columna derecha de las pestañas (340 de ancho). */
export const COLUMNAS_O = { izq: cajaO(X0_O, Y_CONTENIDO_O, IZQ_ANCHO, 0), der: cajaO(DER_X, Y_CONTENIDO_O, 340, 0) };

export const ResumenBorradorO: FC<{ resalte?: { publicar?: number; invitar?: number } }> = ({ resalte = {} }) => {
  const y = Y_CONTENIDO_O;
  const acciones: [typeof UserPlus, string][] = [
    [UserPlus, 'Invitar coach'],
    [Layers, 'Crear nueva fase'],
    [Calendar, 'Agendar partido'],
    [Share2, 'Compartir torneo'],
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: X0_O, top: y, width: IZQ_ANCHO }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: schibsted, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Próximos partidos</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: O.ink3 }}>Los siguientes encuentros programados.</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: O.ink2, padding: '7px 12px', borderRadius: 10, border: `1px solid ${O.line}`, background: O.surface }}>
            Ver calendario <ArrowRight size={13} />
          </span>
        </div>
        <div style={{ ...TARJETA, padding: '32px 20px', textAlign: 'center', fontSize: 13, color: O.ink3 }}>No hay partidos programados todavía.</div>
      </div>
      <div style={{ position: 'absolute', left: DER_X, top: y, width: 340, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 18, color: '#fff', background: O.nav, boxShadow: sombraAnillo(resalte.publicar, '0 12px 32px rgba(2, 132, 199, 0.22)') }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Send size={13} /> Listo para publicar
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Faltan 2 cosas</div>
          <div style={{ fontSize: 12.5, opacity: 0.86, marginBottom: 14 }}>Completa el checklist y publícalo para empezar a recibir inscripciones.</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: `${(5 / 7) * 100}%`, height: '100%', background: O.surface }} />
          </div>
          <div style={{ padding: '10px 14px', background: O.surface, color: O.accentStrong, borderRadius: 12, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Ver checklist <ArrowRight size={15} />
          </div>
        </div>
        <div style={{ ...TARJETA, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${O.bgAlt}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontFamily: schibsted, fontSize: 14, fontWeight: 700 }}>Equipos recientes</h3>
            <ArrowRight size={14} color={O.ink2} />
          </div>
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12.5, color: O.ink3 }}>
            Aún no hay equipos.
            <div style={{ marginTop: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: O.accentSoft, color: O.accentStrong, fontSize: 13, fontWeight: 600, boxShadow: anilloO(resalte.invitar) }}>
                <UserPlus size={13} /> Invitar coach
              </span>
            </div>
          </div>
        </div>
        <div style={{ ...TARJETA, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: schibsted, fontSize: 14, fontWeight: 700 }}>Acciones rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {acciones.map(([Icono, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: O.sunken, border: `1px solid ${O.bgAlt}`, borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: O.surface, color: O.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${O.line}` }}>
                  <Icono size={14} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{l}</span>
                <ArrowRight size={14} color={O.ink3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// «Publicar torneo» (PublishModal.tsx)
// =============================================================================================================

export const REQUISITOS_O = ['Nombre del torneo', 'Deporte definido', 'Formato definido', 'Fecha de inicio', 'Fecha de fin', 'Cupo máximo definido', 'Mínimo 2 equipos aceptados', 'Al menos 1 fase creada'];
export const PUBLICAR_O = (vh: number) => {
  const alto = 415;
  const x = (ANCHO_O - 460) / 2;
  const y = Math.round((vh - alto) / 2);
  return { r: cajaO(x, y, 460, alto), requisito: (i: number) => cajaO(x + 22 - 6, y + 63 + 49 + 16 + i * 26 - 4, 300, 26), cancelar: cajaO(x + 22, y + alto - 55, 140, 38), publicar: cajaO(x + 22 + 150, y + alto - 55, 266, 38), cerrar: cajaO(x + 460 - 22 - 30, y + 17, 30, 30) };
};
export type DatosPublicarO = { t: number; cumplidos: boolean[]; hover?: { cancelar?: number; publicar?: number }; apretar?: { cancelar?: number }; resalte?: Partial<Record<number | 'publicar' | 'barra', number>> };

export const VentanaPublicarO: FC<{ d: DatosPublicarO; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const P = PUBLICAR_O(vh);
  const n = d.cumplidos.filter(Boolean).length;
  const todo = n === d.cumplidos.length;
  const r = d.resalte ?? {};
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.4 * d.t})`, backdropFilter: `blur(${4 * d.t}px)`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: P.r.x, top: P.r.y, width: P.r.ancho, height: P.r.alto, background: O.surface, borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', zIndex: 101, opacity: Math.min(1, d.t * 1.4), transform: `scale(${0.95 + 0.05 * d.t})` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', height: 63, boxSizing: 'border-box', borderBottom: `1px solid ${O.bgAlt}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={18} color={O.accentText} />
            <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 16, fontWeight: 700, color: O.ink }}>Publicar torneo</h2>
          </div>
          <X size={18} color={O.ink3} />
        </div>
        <div style={{ padding: '20px 22px 0', borderRadius: 10, boxShadow: anilloO(r.barra) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: O.ink3 }}>Requisitos completados</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: todo ? '#16a34a' : O.accentText }}>
              {n}/{d.cumplidos.length}
            </span>
          </div>
          <div style={{ height: 6, background: O.bgAlt, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(n / d.cumplidos.length) * 100}%`, background: todo ? 'linear-gradient(90deg, #22c55e, #16a34a)' : `linear-gradient(90deg, ${O.accent}, #a855f7)`, borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REQUISITOS_O.map((l, i) => {
            const ok = d.cumplidos[i];
            return (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 18, borderRadius: 8, boxShadow: anilloO(r[i]), outline: (r[i] ?? 0) > 0 ? `6px solid rgba(14,165,233,${0.08 * (r[i] ?? 0)})` : undefined }}>
                {ok ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
                <span style={{ fontSize: 13, color: ok ? O.ink2 : O.ink3 }}>{l}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 10, padding: '16px 22px', borderTop: `1px solid ${O.bgAlt}` }}>
          <div style={{ flex: 1, height: 38, boxSizing: 'border-box', borderRadius: 10, border: `1px solid ${O.line}`, background: (d.hover?.cancelar ?? 0) > 0.5 ? O.sunken : O.surface, color: O.ink2, fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center', transform: `scale(${1 - (d.apretar?.cancelar ?? 0) * 0.05})` }}>Cancelar</div>
          <div style={{ flex: 2, height: 38, borderRadius: 10, background: todo ? O.accent : O.line, color: todo ? O.onAccent : O.ink3, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: anilloO(r.publicar) }}>
            <Rocket size={14} /> Publicar ahora
          </div>
        </div>
      </div>
    </>
  );
};
