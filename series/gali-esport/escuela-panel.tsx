// El panel del ENTRENADOR en escritorio para armar la escuela (desde `mi-escuela`), fiel a la app.
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Marco: app/(dashboard)/coach/layout.tsx, components/layout/SideNav.tsx (176 px), NavLinks.tsx, TopBar.tsx (52 px).
// - Mi Escuela: app/(dashboard)/coach/school/page.tsx (portada con «Cambiar portada» / «Ajustar», recuadro del logo
//   «Cambiar logo», «Editar perfil», «Ver perfil público», banner del registro legal, cifras, pestañas Información /
//   Publicaciones / Registro legal / Actividad y la columna derecha: Formulario de inscripción, Crear publicación,
//   Redes sociales, Apariencia, Tipo de equipo, Pagos, Sedes y Equipo técnico).
// - Pestaña Información: feature/coach/components/school/SchoolInfoTab.tsx (sin sedes: horario y cancha aquí).
// - «Bienvenido» / «Crear escuela»: components/school/dashboard/EditProfileDrawer.tsx + components/account/AccountModeCards.tsx.
// - Apariencia: components/school/dashboard/AppearanceSection.tsx (paleta: azul #2563EB, verde #16A34A…).
// - Ficha del equipo técnico: feature/coach/components/school/StaffMemberModal.tsx.
// - Registro legal: feature/coach/components/school/LegalDrawer.tsx, LegalSection.tsx y sections/DocumentosCarga.tsx.
// Modelo de pantalla: 1280 × `vh` (alto de la vista). El contenido va desplazado `scroll`; el menú, la barra de arriba
// y los paneles quedan fijos, como en el navegador. Las medidas exportadas son de la página (sin restar `scroll`).
import { ArrowRight, Bell, Building2, Calendar, CheckCircle, ChevronDown, Clock, CreditCard, ExternalLink, Eye, FileText, FolderLock, Globe, Headset, Home, Image as Foto, MapPin, MapPinned, MessageCircle, MessagesSquare, Moon, Pencil, Plus, PlusCircle, Save, School, Shield, ShieldCheck, SendHorizontal, SquarePen, Trophy, Users, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { ACADEMIA, AvatarIlustrado, EscudoFenix, formatCOP, PortadaCancha } from './escuela-publica';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';

// =============================================================================================================
// Colores
// =============================================================================================================

/** Los tonos de la marca de la escuela (--brand-*), según el tono oklch del color principal. */
export const tonos = (hue: number) => ({
  b50: `oklch(0.972 0.014 ${hue})`,
  b100: `oklch(0.935 0.035 ${hue})`,
  b200: `oklch(0.88 0.075 ${hue})`,
  b500: `oklch(0.62 0.20 ${hue})`,
  b600: `oklch(0.55 0.22 ${hue})`,
  b700: `oklch(0.48 0.21 ${hue})`,
  b800: `oklch(0.40 0.17 ${hue})`,
});
export type Tonos = ReturnType<typeof tonos>;
export const HUE_AZUL = 224;
export const HUE_VERDE = 150;

const css = {
  bg: '#F6F8FB',
  surface: '#FFFFFF',
  border: '#E5E9F0',
  borderStrong: '#D9DFE8',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  greenBg: '#ECFDF5',
  greenText: '#047857',
  greenBorder: '#A7F3D0',
  slateBg: '#F1F5F9',
  shadowSm: '0 1px 2px rgba(15,23,42,0.04)',
  shadowMd: '0 4px 12px rgba(15,23,42,0.06)',
};
const tarjeta: CSSProperties = { position: 'absolute', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', boxSizing: 'border-box' };
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);

// =============================================================================================================
// Medidas (página de 1280; contenido de 1040 que empieza en x = 208, y = 80)
// =============================================================================================================

export const VH_PANEL = 911;
const SIDE = 176;
const X0 = SIDE + 32;
const AN = 1040;
const MAIN = { x: X0, ancho: 700 };
const COL = { x: X0 + 700 + 20, ancho: 320 };
const Y_GRID = 676;

export const ME = {
  logo: { x: X0 + 24, y: 245, ancho: 96, alto: 96 },
  cambiarPortada: { x: X0 + AN - 14 - 128, y: 94, ancho: 128, alto: 32 },
  editar: { x: X0 + AN - 24 - 160 - 8 - 125, y: 298, ancho: 125, alto: 39 },
  verPerfil: { x: X0 + AN - 24 - 160, y: 298, ancho: 160, alto: 39 },
  banner: { x: X0, y: 381, ancho: AN, alto: 93 },
  completar: { x: X0 + AN - 18 - 149, y: 408, ancho: 149, alto: 37 },
  pestanas: { x: MAIN.x, y: Y_GRID, ancho: MAIN.ancho, alto: 48 },
  pestanaInfo: { x: MAIN.x + 15, y: Y_GRID + 6, ancho: 100, alto: 42 },
};

/** Alto de las tarjetas de la columna derecha (la de Apariencia crece con el aviso «Color actualizado»). */
const altosColumna = (aviso: number, miembros: number) => [192, 152, 100, 185 + 42 * aviso, 136, 126, 142, 16 + 34 + 62 * miembros + 40 + 16];
/** Arriba de cada tarjeta de la columna derecha: 0 formulario, 1 publicación, 2 redes, 3 apariencia, 4 tipo, 5 pagos, 6 sedes, 7 equipo. */
export const columnaY = (i: number, aviso = 0, miembros = 1) => altosColumna(aviso, miembros).slice(0, i).reduce((a, h) => a + h + 14, Y_GRID);
export const COLUMNA = COL;
/** Centro de un color de la paleta de Apariencia (0 azul, 1 verde…). */
export const colorPaleta = (i: number, aviso = 0) => ({ x: COL.x + 16 + 14 + i * 36, y: columnaY(3) + 16 + 34 + 42 * aviso + 22.5 + 14 });
/** Fila de un integrante del equipo técnico (0 = tú) y el botón «Agregar miembro». */
export const filaEquipoTecnico = (i: number) => ({ x: COL.x + 16, y: columnaY(7) + 16 + 34 + i * 62, ancho: COL.ancho - 32, alto: 62 });
export const agregarMiembro = (miembros: number) => ({ x: COL.x + 16, y: columnaY(7, 0, miembros) + 16 + 34 + 62 * miembros + 6, ancho: COL.ancho - 32, alto: 34 });

// Pestaña Información (dentro del panel principal)
const IX = MAIN.x + 18;
const IW = MAIN.ancho - 36;
const Y_INFO = Y_GRID + 48 + 18;
const SEC = { costos: Y_INFO + 36 + 14, pagos: Y_INFO + 36 + 14 + 430 + 14, horarios: Y_INFO + 36 + 14 + 430 + 14 + 246 + 14 };
const SEC_INSCRIPCION = SEC.horarios + 249 + 14;
export const INFO_ME = {
  costos: { x: IX, y: SEC.costos, ancho: IW, alto: 430 },
  pagos: { x: IX, y: SEC.pagos, ancho: IW, alto: 246 },
  inscripcion: { x: IX, y: SEC_INSCRIPCION, ancho: IW, alto: 312 },
  /** Los tres montos: Inscripción, Mensualidad, Uniforme. */
  monto: (i: number) => ({ x: IX + 17 + i * (202.7 + 12), y: SEC.costos + 16 + 41 + 12 + 18 + 5, ancho: 202.7, alto: 39.5 }),
  requisitos: { x: IX + 17, y: SEC_INSCRIPCION + 16 + 21 + 12 + 18 + 5, ancho: IW - 34, alto: 78.5 },
  guardar: { x: IX + IW - 161, y: SEC_INSCRIPCION + 312 + 14, ancho: 161, alto: 37 },
};
export const OPCIONES_PAGO = ['Efectivo', 'Transferencia bancaria', 'Nequi', 'Daviplata', 'PSE', 'Tarjeta débito/crédito', 'Pago en línea (Gali Esport)'];
const anchoOpcion = (o: string, on: boolean) => Math.round(26 + o.length * 6.3 + (on ? 11 : 0));
/** Dónde queda cada opción de pago (cambia de ancho al marcarla con «✓»). */
export const opcionesPago = (marcadas: string[]) => {
  const ancho = IW - 34;
  let x = 0;
  let y = 0;
  return OPCIONES_PAGO.map((o) => {
    const w = anchoOpcion(o, marcadas.includes(o));
    if (x > 0 && x + w > ancho) {
      x = 0;
      y += 38;
    }
    const r = { o, x: IX + 17 + x, y: SEC.pagos + 16 + 21 + 12 + y, ancho: w, alto: 30 };
    x += w + 8;
    return r;
  });
};

// =============================================================================================================
// Menú lateral y barra de arriba (fijos)
// =============================================================================================================

const ENLACES: { nombre: string; Icono: typeof Home }[] = [
  { nombre: 'Inicio', Icono: Home },
  { nombre: 'Mensajes', Icono: MessagesSquare },
  { nombre: 'Mi Escuela', Icono: School },
  { nombre: 'Partidos', Icono: Trophy },
  { nombre: 'Equipo', Icono: Shield },
  { nombre: 'Canchas', Icono: MapPinned },
  { nombre: 'Usuarios', Icono: Users },
  { nombre: 'Documentos', Icono: FolderLock },
  { nombre: 'Informes', Icono: FileText },
];
/** El enlace «Mi Escuela» del menú (en la pantalla). */
export const ENLACE_MI_ESCUELA = { x: 14, y: 60 + 2 * 38, ancho: SIDE - 28, alto: 36 };

/** El enlace `i` del menú (0 Inicio … 5 Canchas …), en la pantalla. */
export const enlaceMenu = (nombre: string) => ({ x: 14, y: 60 + ENLACES.findIndex((e) => e.nombre === nombre) * 38, ancho: SIDE - 28, alto: 36 });

/** `activo`: el enlace marcado (por defecto «Mi Escuela»); `hover` 0 → 1 ilumina el enlace `hoverEn`. */
export const MenuEntrenadorPC: FC<{ tn: Tonos; vh: number; resalte?: number; activo?: string; hoverEn?: string; hover?: number }> = ({ tn, vh, resalte = 0, activo = 'Mi Escuela', hoverEn, hover = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SIDE, height: vh, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: '1px solid #e2e8f0' }}>
      <Isotipo tamano={32} />
      <div style={{ fontFamily: schibsted, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ENLACES.map(({ nombre, Icono }) => {
        const on = nombre === activo;
        const h = !on && nombre === hoverEn ? hover : 0;
        return (
          <div key={nombre} style={{ display: 'flex', alignItems: 'center', gap: 11, height: 36, padding: '0 10px', borderRadius: 8, fontSize: 13, fontWeight: on ? 500 : 400, color: on ? tn.b700 : h > 0.5 ? css.text : '#64748b', background: on ? tn.b50 : h > 0 ? `rgba(241,245,249,${h})` : 'transparent', boxShadow: on ? anillo(resalte) : undefined }}>
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span>{nombre}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20 + 50 + 8, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 10, fontSize: 12, color: '#64748b' }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: '#F3F4F6', color: '#6B7280', display: 'grid', placeItems: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6" />
        </svg>
      </span>
      <span style={{ flex: 1, fontWeight: 500 }}>Cambiar de rol</span>
      <ChevronDown size={14} />
    </div>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: tn.b600, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>C</div>
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #f8fafc', boxSizing: 'border-box' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ACADEMIA.entrenador}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Entrenador</div>
      </div>
      <ChevronDown size={14} color="#94a3b8" />
    </div>
  </div>
);

const BotonBarra: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0', background: '#fff', color: css.text, boxSizing: 'border-box' }}>{children}</div>
);
export const BarraArribaPC: FC = () => (
  <div style={{ position: 'absolute', left: SIDE, right: 0, top: 0, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '0 20px', background: '#fff', borderBottom: '1px solid #e2e8f0', boxSizing: 'border-box', zIndex: 20 }}>
    <BotonBarra>
      <Moon size={17} />
    </BotonBarra>
    <BotonBarra>
      <Bell size={18} />
    </BotonBarra>
  </div>
);

// --- Soporte: el botón flotante y el chat con el «Equipo Gali» (components/support/SupportWidget.tsx) ---

export type DatosSoporte = {
  /** El chat abierto (0 → 1). */
  t: number;
  borrador: string;
  escribiendo?: boolean;
  /** El mensaje enviado aparece (0 → 1); `hora` = ya no dice «Enviando…». */
  enviado: number;
  hora?: boolean;
  apretarEnviar?: number;
  hoverCerrar?: number;
};
export const MENSAJE_SOPORTE = 'Mi escuela está en Perú, ¿cómo hago el registro legal?';
/** El chat (380 de ancho, abajo a la derecha, encima del botón) y sus controles, según el alto `vh` de la pantalla. */
export const CHAT = (vh: number) => {
  const alto = Math.min(600, vh - 112);
  const y = vh - 88 - alto;
  const x = 1280 - 20 - 380;
  return { x, y, ancho: 380, alto, cerrar: { x: x + 380 - 12 - 34, y: y + 13, ancho: 34, alto: 34 }, texto: { x: x + 12, y: y + alto - 50, ancho: 380 - 24 - 48, alto: 40 }, enviar: { x: x + 380 - 12 - 40, y: y + alto - 50, ancho: 40, alto: 40 } };
};

const ChatSoporte: FC<{ tn: Tonos; vh: number; d: DatosSoporte }> = ({ tn, vh, d }) => {
  if (d.t <= 0) return null;
  const c = CHAT(vh);
  const puede = d.borrador.trim().length > 0;
  return (
    <div style={{ position: 'absolute', left: c.x, top: c.y, width: c.ancho, height: c.alto, zIndex: 48, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 16, border: '1px solid #E5E9F0', background: '#fff', boxShadow: '0 24px 60px rgba(15,23,42,0.22)', boxSizing: 'border-box', opacity: Math.min(1, d.t * 1.4), transform: `translateY(${(1 - d.t) * 16}px) scale(${0.97 + 0.03 * d.t})`, transformOrigin: '100% 100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 14px', borderBottom: '1px solid #E5E9F0', height: 61, boxSizing: 'border-box' }}>
        <span style={{ width: 36, height: 36, borderRadius: 99, display: 'grid', placeItems: 'center', background: tn.b50, color: tn.b700, flexShrink: 0 }}>
          <Headset size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Equipo Gali</div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>Te respondemos aquí y te avisamos en la campanita</div>
        </div>
        <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#475569', background: (d.hoverCerrar ?? 0) > 0 ? `rgba(241,245,249,${d.hoverCerrar})` : 'transparent' }}>
          <X size={18} />
        </span>
      </div>
      <div style={{ flex: 1, padding: '16px 14px 8px', overflow: 'hidden' }}>
        {d.enviado > 0 ? (
          <div style={{ opacity: d.enviado }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 12px' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', borderRadius: 99, padding: '3px 10px' }}>Hoy</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: `translateY(${(1 - d.enviado) * 10}px)` }}>
              <div style={{ maxWidth: '82%', padding: '8px 12px', borderRadius: 16, borderBottomRightRadius: 6, background: tn.b600, color: '#fff', fontSize: 14, lineHeight: 1.45, opacity: d.hora ? 1 : 0.6 }}>{MENSAJE_SOPORTE}</div>
              <span style={{ fontSize: 10.5, color: '#94A3B8', margin: '3px 6px 0' }}>{d.hora ? '10:24\u00a0a.\u00a0m.' : 'Enviando…'}</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '28px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Hola, Carlos</div>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5, color: '#475569' }}>¿Tienes una duda o algo no funciona como esperabas? Escríbenos: pagos, torneos, tu escuela o lo que necesites.</p>
          </div>
        )}
      </div>
      <div style={{ borderTop: '1px solid #E5E9F0', padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ flex: 1, minHeight: 40, padding: '9px 12px', borderRadius: 12, border: `1px solid ${d.escribiendo ? '#93c5fd' : '#E2E8F0'}`, background: '#F8FAFC', color: d.borrador ? '#0F172A' : '#94A3B8', fontSize: 14, lineHeight: 1.45, boxSizing: 'border-box' }}>
          {!d.borrador && d.escribiendo && <span style={{ display: 'inline-block', width: 1.5, height: 17, marginRight: 1, background: '#0F172A', verticalAlign: 'middle' }} />}
          {d.borrador || 'Escribe tu mensaje…'}
          {d.borrador && d.escribiendo && <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, background: '#0F172A', verticalAlign: 'middle' }} />}
        </div>
        <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, display: 'grid', placeItems: 'center', background: puede ? tn.b600 : '#E2E8F0', color: puede ? '#fff' : '#94A3B8', transform: hundir(d.apretarEnviar) }}>
          <SendHorizontal size={18} />
        </span>
      </div>
    </div>
  );
};

/** El botón redondo de soporte, abajo a la derecha (con el chat abierto muestra la X). */
const BotonSoporte: FC<{ tn: Tonos; vh: number; abierto: boolean }> = ({ tn, vh, abierto }) => (
  <div style={{ position: 'absolute', left: 1280 - 20 - 56, top: vh - 20 - 56, width: 56, height: 56, borderRadius: 99, display: 'grid', placeItems: 'center', background: tn.b600, color: '#fff', boxShadow: '0 10px 28px rgba(15,23,42,0.25)', zIndex: 45 }}>
    {abierto ? <X size={24} /> : <MessageCircle size={24} />}
  </div>
);

/** El marco del panel: fondo, menú, barra, el contenido desplazado `scroll` y el soporte flotante. */
export const MarcoEntrenador: FC<{ tn: Tonos; vh: number; scroll?: number; resalteMenu?: number; menuActivo?: string; menuHoverEn?: string; menuHover?: number; soporte?: DatosSoporte; children?: ReactNode; encima?: ReactNode }> = ({ tn, vh, scroll = 0, resalteMenu, menuActivo, menuHoverEn, menuHover, soporte, children, encima }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, overflow: 'hidden', background: css.bg, fontFamily: instrument, color: css.text, lineHeight: 1.5 }}>
    <div style={{ position: 'absolute', left: 0, top: -scroll, width: 1280 }}>{children}</div>
    <BarraArribaPC />
    <MenuEntrenadorPC tn={tn} vh={vh} resalte={resalteMenu} activo={menuActivo} hoverEn={menuHoverEn} hover={menuHover} />
    <BotonSoporte tn={tn} vh={vh} abierto={(soporte?.t ?? 0) > 0.5} />
    {soporte && <ChatSoporte tn={tn} vh={vh} d={soporte} />}
    {encima}
  </div>
);

// =============================================================================================================
// Mi Escuela
// =============================================================================================================

export type DatosMiEscuela = {
  hue: number;
  /** El color elegido en Apariencia (texto en mayúsculas al lado de la paleta). */
  hex: string;
  logo: number;
  subiendoLogo?: boolean;
  hoverLogo?: number;
  portada: number;
  subiendoPortada?: boolean;
  /** «Color actualizado» en Apariencia (0 → 1). */
  avisoColor?: number;
  inscripcion: string;
  mensualidad: string;
  uniforme: string;
  pagos: string[];
  requisitos: string;
  /** Cursor de escribir en un campo de Información. */
  escribiendo?: 'inscripcion' | 'mensualidad' | 'uniforme' | 'requisitos' | null;
  infoGuardada?: number;
  fotoCarlos: number;
  andres: number;
  legalPct: number;
  legalN: number;
  /** Botón hundido (0 → 1) y botón con el puntero encima. */
  apretar?: Partial<Record<'portada' | 'logo' | 'completar' | 'verPerfil' | 'guardarInfo' | 'agregar' | 'fila' | 'verde', number>>;
  hover?: Partial<Record<'portada' | 'completar' | 'verPerfil' | 'guardarInfo' | 'agregar' | 'fila', number>>;
  resalte?: Partial<Record<'banner' | 'apariencia' | 'equipo' | 'tu' | 'pestanaInfo' | 'costos' | 'pagos' | 'requisitos', number>>;
};

const MiniBarras: FC<{ color: string }> = ({ color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 28 }}>
    {Array.from({ length: 7 }, (_, k) => (
      <span key={k} style={{ flex: 1, height: 3, borderRadius: 2, background: color, opacity: 0.25 }} />
    ))}
  </div>
);

const Cifra: FC<{ x: number; icono: ReactNode; iconoBg: string; iconoColor: string; chip: string; chipBg: string; chipColor: string; valor: string; texto: string; pie?: ReactNode }> = ({ x, icono, iconoBg, iconoColor, chip, chipBg, chipColor, valor, texto, pie }) => (
  <div style={{ position: 'absolute', left: x, top: 494, width: (AN - 36) / 4, height: 162, background: css.surface, border: `1px solid ${css.border}`, borderRadius: 12, padding: 16, boxShadow: css.shadowSm, boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconoBg, color: iconoColor, display: 'grid', placeItems: 'center' }}>{icono}</div>
      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, fontWeight: 600, background: chipBg, color: chipColor, fontFamily: jetbrains }}>{chip}</span>
    </div>
    <div style={{ fontFamily: schibsted, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{valor}</div>
    <div style={{ fontSize: 12, color: css.muted, marginTop: 4 }}>{texto}</div>
    {pie && <div style={{ marginTop: 10 }}>{pie}</div>}
  </div>
);

const Campo: FC<{ label: string; valor: string; ph: string; alto?: number; caret?: boolean; resalte?: number; mono?: boolean }> = ({ label, valor, ph, alto = 39.5, caret, resalte = 0 }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 500, color: css.muted, minWidth: 0 }}>
    {label}
    <div style={{ height: alto, padding: '9px 12px', fontSize: 13, color: valor ? css.text : '#9ca3af', background: css.surface, border: `1px solid ${caret ? '#93c5fd' : css.borderStrong}`, borderRadius: 8, boxSizing: 'border-box', lineHeight: 1.5, overflow: 'hidden', boxShadow: anillo(resalte) }}>
      {!valor && caret && <span style={{ display: 'inline-block', width: 1.5, height: 16, marginRight: 1, background: css.text, verticalAlign: 'middle' }} />}
      {valor || ph}
      {valor && caret && <span style={{ display: 'inline-block', width: 1.5, height: 16, marginLeft: 1, background: css.text, verticalAlign: 'middle' }} />}
    </div>
  </label>
);
const Seccion: FC<{ y: number; alto: number; titulo: string; hint?: string; resalte?: number; children: ReactNode }> = ({ y, alto, titulo, hint, resalte = 0, children }) => (
  <div style={{ position: 'absolute', left: IX, top: y, width: IW, height: alto, border: `1px solid ${css.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', boxShadow: anillo(resalte), background: '#fff' }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: css.text }}>{titulo}</div>
      {hint && <div style={{ fontSize: 12, color: css.muted, marginTop: 2 }}>{hint}</div>}
    </div>
    {children}
  </div>
);
const miles = (s: string) => (s ? Number(s).toLocaleString('es-CO').replace(/,/g, '.') : '');

/** La pestaña Información de Mi Escuela (SchoolInfoTab, escuela sin sedes). */
const InfoMiEscuela: FC<{ d: DatosMiEscuela; tn: Tonos }> = ({ d, tn }) => {
  const r = d.resalte ?? {};
  const opciones = opcionesPago(d.pagos);
  const guardada = d.infoGuardada ?? 0;
  const h = d.hover?.guardarInfo ?? 0;
  return (
    <>
      <div style={{ position: 'absolute', left: IX, top: Y_INFO, width: IW, fontSize: 12, color: css.muted }}>
        Esta información aparece en la pestaña <b>Información</b> de la página pública de tu escuela. Lo que dejes vacío no se muestra.
      </div>
      <Seccion y={SEC.costos} alto={430} titulo="Costos" hint="Valores en pesos colombianos (COP)." resalte={r.costos}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Campo label="Inscripción" valor={miles(d.inscripcion)} ph="Ej: 80.000" caret={d.escribiendo === 'inscripcion'} />
          <Campo label="Mensualidad" valor={miles(d.mensualidad)} ph="Ej: 60.000" caret={d.escribiendo === 'mensualidad'} />
          <Campo label="Uniforme" valor={miles(d.uniforme)} ph="Ej: 120.000" caret={d.escribiendo === 'uniforme'} />
        </div>
        <Campo label="¿Qué incluye la mensualidad?" valor="" ph="Ej: 3 entrenamientos por semana, seguro deportivo, hidratación…" alto={59} />
        <Campo label="Detalle del uniforme" valor="" ph="Ej: camiseta, pantaloneta, medias y morral" alto={59} />
        <Campo label="Descuentos" valor="" ph="Ej: 10% por segundo hermano, 5% pagando el trimestre" alto={59} />
      </Seccion>
      <Seccion y={SEC.pagos} alto={246} titulo="Formas de pago" resalte={r.pagos}>
        <div style={{ position: 'relative', height: 68 }} />
        <Campo label="Instrucciones de pago" valor="" ph="Ej: Bancolombia ahorros 000-000000-00 a nombre de… Pagar los primeros 5 días de cada mes." alto={78.5} />
      </Seccion>
      {opciones.map((o) => {
        const on = d.pagos.includes(o.o);
        return (
          <span key={o.o} style={{ position: 'absolute', left: o.x, top: o.y, width: o.ancho, height: o.alto, borderRadius: 999, fontSize: 12, fontWeight: 500, display: 'grid', placeItems: 'center', whiteSpace: 'nowrap', background: on ? tn.b50 : css.surface, color: on ? tn.b600 : css.muted, border: `1px solid ${on ? tn.b200 : css.borderStrong}`, boxSizing: 'border-box' }}>
            {on ? '✓ ' : ''}
            {o.o}
          </span>
        );
      })}
      <Seccion y={SEC.horarios} alto={249} titulo="Horarios y sede">
        <Campo label="Días y horarios de entrenamiento" valor="" ph="Ej: Sub-10: martes y jueves 4:00–5:30 pm" alto={98} />
        <Campo label="Sede / cancha" valor="" ph="Ej: Cancha sintética Parque El Country, Cra 15 #80-10" />
      </Seccion>
      <Seccion y={SEC_INSCRIPCION} alto={312} titulo="Inscripción y políticas" resalte={r.requisitos}>
        <Campo label="Requisitos para inscribirse" valor={d.requisitos} ph="Ej: Fotocopia del documento, certificado de EPS, foto 3x4, autorización del acudiente" alto={78.5} caret={d.escribiendo === 'requisitos'} />
        <Campo label="Políticas (devoluciones, inasistencias, etc.)" valor="" ph="Ej: La mensualidad no es reembolsable. Avisar ausencias con 24 h de anticipación." alto={78.5} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: css.text }}>
          <span style={{ width: 13, height: 13, border: '1px solid #767676', borderRadius: 3, background: '#fff' }} />
          Ofrecemos clase de prueba gratuita
        </label>
      </Seccion>
      <div style={{ position: 'absolute', left: IX, top: INFO_ME.guardar.y, width: IW, height: 37, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        {guardada > 0 && <span style={{ fontSize: 12, fontWeight: 500, color: css.greenText, opacity: guardada }}>Información guardada</span>}
        <span style={{ width: 161, height: 37, borderRadius: 8, background: tn.b600, color: 'white', fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center', transform: hundir(d.apretar?.guardarInfo), filter: h > 0 ? `brightness(${1 - 0.08 * h})` : undefined }}>Guardar información</span>
      </div>
    </>
  );
};

const CabeceraTarjeta: FC<{ tn: Tonos; icono: ReactNode; titulo: string; derecha?: ReactNode; mb?: number }> = ({ tn, icono, titulo, derecha, mb = 12 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mb }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#111827' }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: tn.b50, color: tn.b600, display: 'grid', placeItems: 'center' }}>{icono}</span>
      {titulo}
    </div>
    {derecha}
  </div>
);
const botonChico: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 8px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 12, fontWeight: 600 };
const PALETA = ['#2563EB', '#16A34A', '#7C3AED', '#C2410C', '#EA580C', '#EAB308', '#BE185D'];
const COLORES_AVATAR = ['oklch(0.55 0.22 340)', 'oklch(0.55 0.22 224)'];

const ColumnaDerecha: FC<{ d: DatosMiEscuela; tn: Tonos }> = ({ d, tn }) => {
  const aviso = d.avisoColor ?? 0;
  const miembros = d.andres > 0 ? 2 : 1;
  const y = (i: number) => columnaY(i, aviso, miembros);
  const hs = altosColumna(aviso, miembros);
  const r = d.resalte ?? {};
  const hAg = d.hover?.agregar ?? 0;
  const hFila = d.hover?.fila ?? 0;
  return (
    <>
      {/* Formulario de inscripción */}
      <div style={{ ...tarjeta, left: COL.x, top: y(0), width: COL.ancho, height: hs[0] }}>
        <CabeceraTarjeta tn={tn} mb={8} titulo="Formulario de inscripción" icono={<Users size={13} />} />
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5 }}>Comparte un enlace para que jugadores y acudientes pidan unirse. Tú apruebas o rechazas cada solicitud.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111827' }}>Formulario apagado</span>
          <span style={{ width: 36, height: 20, borderRadius: 99, position: 'relative', background: '#D1D5DB' }}>
            <span style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: 99, background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <span style={botonChico}>Vista previa</span>
          <span style={{ ...botonChico, color: tn.b600, borderColor: tn.b50, background: tn.b50 }}>Solicitudes</span>
        </div>
      </div>
      {/* Crear publicación */}
      <div style={{ position: 'absolute', left: COL.x, top: y(1), width: COL.ancho, height: hs[1], background: `linear-gradient(135deg, ${tn.b600}, ${tn.b800})`, borderRadius: 12, padding: 16, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.15)', color: 'white', display: 'grid', placeItems: 'center' }}>
            <Plus size={13} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Crear publicación</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px', lineHeight: 1.5 }}>Comparte novedades, logros y anuncios con tu comunidad.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 8, background: 'white', color: tn.b700, fontSize: 13, fontWeight: 600 }}>
          <Plus size={14} strokeWidth={2.5} /> Nueva publicación
        </div>
      </div>
      {/* Redes sociales */}
      <div style={{ ...tarjeta, left: COL.x, top: y(2), width: COL.ancho, height: hs[2], border: `1px solid ${css.border}`, boxShadow: css.shadowSm }}>
        <CabeceraTarjeta tn={tn} titulo="Redes sociales" icono={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>} derecha={<Pencil size={14} color={css.subtle} />} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 8, border: '1px dashed #D1D5DB', color: css.muted, fontSize: 12, fontWeight: 500 }}>
          <PlusCircle size={13} /> Agregar red social
        </div>
      </div>
      {/* Apariencia */}
      <div style={{ ...tarjeta, left: COL.x, top: y(3), width: COL.ancho, height: hs[3], boxShadow: anillo(r.apariencia) ?? tarjeta.boxShadow }}>
        <CabeceraTarjeta tn={tn} titulo="Apariencia" icono={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="13" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="10" cy="20" r="2.5" /></svg>} derecha={<SquarePen size={14} color="#9CA3AF" />} />
        {aviso > 0 && (
          <div style={{ fontSize: 12, padding: '7px 10px', borderRadius: 8, marginBottom: 10, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', opacity: aviso, height: 32, boxSizing: 'border-box' }}>Color actualizado</div>
        )}
        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>Color principal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          {PALETA.map((c, i) => (
            <span key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, flexShrink: 0, outline: d.hex.toUpperCase() === c ? '2px solid #111827' : 'none', outlineOffset: 3, transform: i === 1 ? hundir(d.apretar?.verde) : undefined }} />
          ))}
          <span style={{ fontSize: 11, fontFamily: jetbrains, color: '#64748B', marginLeft: 4 }}>{d.hex.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>Portada</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${tn.b600}, ${tn.b700})`, border: `1px solid ${tn.b100}` }} />
          <span style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid #D1D5DB', color: '#374151' }}>Cambiar</span>
        </div>
      </div>
      {/* Tipo de equipo */}
      <div style={{ ...tarjeta, left: COL.x, top: y(4), width: COL.ancho, height: hs[4] }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Tipo de equipo</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', lineHeight: 1.33 }}>
          Ahora usas la plataforma como <strong>escuela o club profesional</strong>.
        </p>
        <span style={{ display: 'inline-block', marginTop: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, fontWeight: 500, color: '#374151' }}>Cambiar a aficionado</span>
      </div>
      {/* Pagos */}
      <div style={{ ...tarjeta, left: COL.x, top: y(5), width: COL.ancho, height: hs[5] }}>
        <CabeceraTarjeta
          tn={tn}
          mb={14}
          titulo="Pagos"
          icono={<CreditCard size={13} />}
          derecha={
            <span style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${d.hex}40`, background: tn.b50, color: d.hex, display: 'grid', placeItems: 'center' }}>
              <Pencil size={13} />
            </span>
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Pasarela</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#92400e', background: '#fef9c3', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 20 }}>Sin conectar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Mensualidad</span>
            {d.infoGuardada ? <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{formatCOP(60000)}</span> : <span style={{ fontSize: 12, color: '#9CA3AF' }}>No configurada</span>}
          </div>
        </div>
      </div>
      {/* Sedes */}
      <div style={{ ...tarjeta, left: COL.x, top: y(6), width: COL.ancho, height: hs[6] }}>
        <CabeceraTarjeta tn={tn} mb={8} titulo="Sedes" icono={<MapPin size={13} />} />
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5 }}>¿Entrenas en más de una cancha? Crea tus sedes: cada una con su dirección, horario y mensualidad.</p>
        <span style={{ ...botonChico, color: tn.b600, borderColor: tn.b50, background: tn.b50 }}>
          <Plus size={13} /> Crear primera sede
        </span>
      </div>
      {/* Equipo técnico */}
      <div style={{ ...tarjeta, left: COL.x, top: y(7), width: COL.ancho, height: hs[7], boxShadow: anillo(r.equipo) ?? tarjeta.boxShadow }}>
        <CabeceraTarjeta tn={tn} titulo="Equipo técnico" icono={<Users size={13} />} />
        {[
          { n: ACADEMIA.entrenador, rol: 'Entrenador principal', tu: true, foto: d.fotoCarlos, persona: 'carlos' as const, t: 1 },
          ...(d.andres > 0 ? [{ n: 'Andrés Gómez', rol: 'Asistente técnico', tu: false, foto: 0, persona: 'andres' as const, t: d.andres }] : []),
        ].map((m, i) => (
          <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', height: 62, boxSizing: 'border-box', opacity: m.t, borderRadius: 8, background: i === 0 && hFila > 0 ? `rgba(241,245,249,${hFila})` : undefined, transform: i === 0 ? hundir(d.apretar?.fila) : undefined }}>
            <div style={{ position: 'relative', width: 34, height: 34, borderRadius: 9, flexShrink: 0, overflow: 'hidden', background: COLORES_AVATAR[i], display: 'grid', placeItems: 'center', color: 'white', fontWeight: 600, fontSize: 11 }}>
              {m.n
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')}
              {m.foto > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: m.foto }}>
                  <AvatarIlustrado persona={m.persona} />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.n}
                {m.tu && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: tn.b600, background: tn.b50, borderRadius: 5, padding: '1px 5px', boxShadow: anillo(r.tu) }}>Tú</span>}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{m.rol}</div>
              {m.tu && <div style={{ fontSize: 10.5, color: '#B45309' }}>Completar ficha →</div>}
            </div>
            <span style={{ fontSize: 11, color: '#6B7280', opacity: i === 0 ? hFila : 0 }}>Editar</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 8, marginTop: 6, border: `1px dashed ${hAg > 0 ? tn.b500 : '#D1D5DB'}`, color: hAg > 0 ? tn.b600 : '#6B7280', fontSize: 12, fontWeight: 500, transform: hundir(d.apretar?.agregar), height: 34, boxSizing: 'border-box' }}>
          <Plus size={12} strokeWidth={2.5} /> Agregar miembro
        </div>
      </div>
    </>
  );
};

/** La página Mi Escuela (contenido, en coordenadas de la página). */
export const PaginaMiEscuelaPC: FC<{ d: DatosMiEscuela }> = ({ d }) => {
  const tn = tonos(d.hue);
  const r = d.resalte ?? {};
  const hp = d.hover?.portada ?? 0;
  const hc = d.hover?.completar ?? 0;
  const hv = d.hover?.verPerfil ?? 0;
  const cifra = (AN - 36) / 4;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 2300 }}>
      {/* Portada y cabecera */}
      <div style={{ position: 'absolute', left: X0, top: 80, width: AN, height: 281, background: css.surface, border: `1px solid ${css.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: css.shadowSm, boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: `radial-gradient(circle at 20% 30%, ${tn.b500} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${tn.b700} 0%, transparent 50%), linear-gradient(135deg, ${tn.b600}, ${tn.b700})` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.5 }} />
          {d.portada > 0 && (
            <div style={{ position: 'absolute', inset: 0, opacity: d.portada }}>
              <PortadaCancha />
            </div>
          )}
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
            {d.portada >= 1 && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', fontWeight: 500, fontSize: 12 }}>Ajustar</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: 128, height: 32, borderRadius: 8, background: `rgba(15,23,42,${0.6 + 0.2 * hp})`, border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', color: 'white', fontWeight: 500, fontSize: 12, boxSizing: 'border-box', transform: hundir(d.apretar?.portada), opacity: d.subiendoPortada ? 0.6 : 1 }}>
              <Foto size={14} />
              {d.subiendoPortada ? 'Subiendo…' : 'Cambiar portada'}
            </span>
          </div>
        </div>
      </div>
      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: ME.logo.x,
          top: ME.logo.y,
          width: 96,
          height: 96,
          borderRadius: 18,
          background: d.logo > 0 ? css.surface : tn.b50,
          border: `4px solid ${css.surface}`,
          outline: `2px solid ${tn.b100}`,
          boxShadow: css.shadowMd,
          display: 'grid',
          placeItems: 'center',
          color: tn.b600,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          overflow: 'hidden',
          boxSizing: 'border-box',
          transform: hundir(d.apretar?.logo),
        }}
      >
        {d.subiendoLogo ? <div style={{ fontSize: 12, fontWeight: 500 }}>…</div> : 'A'}
        {d.logo > 0 && !d.subiendoLogo && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', opacity: d.logo }}>
            <EscudoFenix />
          </div>
        )}
        {(d.hoverLogo ?? 0) > 0 && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', opacity: d.hoverLogo }}>
            <Foto size={22} color="white" />
          </div>
        )}
      </div>
      {/* Nombre y datos */}
      <div style={{ position: 'absolute', left: X0 + 24 + 96 + 20, top: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{ACADEMIA.nombre}</h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: css.greenBg, color: css.greenText, border: `1px solid ${css.greenBorder}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            Pública
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 13, color: css.muted, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Globe size={14} />
            <span style={{ color: d.hex, fontWeight: 500 }}>{ACADEMIA.host}</span>
          </span>
          <span style={{ width: 1, height: 12, background: css.border }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} /> {ACADEMIA.ubicacion}
          </span>
          <span style={{ width: 1, height: 12, background: css.border }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} /> Activa desde nov. de 2026
          </span>
        </div>
      </div>
      {/* Botones */}
      <span style={{ position: 'absolute', left: ME.editar.x, top: ME.editar.y, width: ME.editar.ancho, height: ME.editar.alto, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1px solid ${css.border}`, background: 'white', boxSizing: 'border-box' }}>
        <SquarePen size={14} /> Editar perfil
      </span>
      <span style={{ position: 'absolute', left: ME.verPerfil.x, top: ME.verPerfil.y, width: ME.verPerfil.ancho, height: ME.verPerfil.alto, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, fontSize: 13, fontWeight: 500, background: hv > 0 ? tn.b700 : tn.b600, color: 'white', boxSizing: 'border-box', transform: hundir(d.apretar?.verPerfil) }}>
        <ExternalLink size={14} /> Ver perfil público
      </span>

      {/* Banner del registro legal */}
      <div style={{ position: 'absolute', left: ME.banner.x, top: ME.banner.y, width: AN, height: ME.banner.alto, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 12, background: `linear-gradient(to right, ${tn.b50}, transparent 60%), ${css.surface}`, border: `1px solid ${tn.b100}`, boxSizing: 'border-box', boxShadow: anillo(r.banner) }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: css.surface, border: `1px solid ${tn.b100}`, display: 'grid', placeItems: 'center', color: tn.b600 }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Completa el registro legal para activar tu escuela</div>
          <div style={{ fontSize: 12, color: css.muted }}>Sube los documentos requeridos y podrás aceptar pagos de jugadores.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <div style={{ width: 240, height: 6, borderRadius: 3, background: css.slateBg, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: tn.b600, width: `${d.legalPct}%`, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: css.muted, fontFamily: jetbrains, fontWeight: 500 }}>
              {d.legalPct}% · {d.legalN} de 15
            </span>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: ME.completar.ancho, height: ME.completar.alto, borderRadius: 8, background: hc > 0 ? tn.b700 : tn.b600, color: 'white', fontSize: 13, fontWeight: 500, flexShrink: 0, transform: hundir(d.apretar?.completar) }}>
          Completar ahora <ArrowRight size={14} />
        </span>
      </div>

      {/* Cifras */}
      <Cifra x={X0} icono={<FileText size={16} />} iconoBg={tn.b50} iconoColor={d.hex} chip="+0 hoy" chipBg={css.greenBg} chipColor={css.greenText} valor="0" texto="Publicaciones · últimos 7 días" pie={<MiniBarras color={d.hex} />} />
      <Cifra x={X0 + cifra + 12} icono={<Users size={16} />} iconoBg="#F5F3FF" iconoColor="#7C3AED" chip="de 0" chipBg="#F5F3FF" chipColor="#7C3AED" valor="0" texto="Jugadores activos · últimos 7 días" pie={<MiniBarras color="#7C3AED" />} />
      <Cifra x={X0 + (cifra + 12) * 2} icono={<CreditCard size={16} />} iconoBg={css.slateBg} iconoColor={css.muted} chip="gratis" chipBg={css.slateBg} chipColor={css.muted} valor="Free" texto="Plan gratuito · sin pagos registrados" />
      <div style={{ position: 'absolute', left: X0 + (cifra + 12) * 3, top: 494, width: cifra, height: 162, borderRadius: 12, padding: 16, background: `linear-gradient(135deg, ${tn.b600}, ${tn.b800})`, boxSizing: 'border-box' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: 'white', marginBottom: 12 }}>
          <Clock size={16} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Sin próximos partidos</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>Aún no tienes partidos programados.</div>
        <span style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
          Programar un partido <ArrowRight size={12} />
        </span>
      </div>

      {/* Panel principal con pestañas */}
      <div style={{ position: 'absolute', left: MAIN.x, top: Y_GRID, width: MAIN.ancho, height: INFO_ME.guardar.y + 37 + 18 - Y_GRID, background: css.surface, border: `1px solid ${css.border}`, borderRadius: 16, boxShadow: css.shadowSm, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${css.border}`, padding: '6px 14px 0' }}>
          {[
            { l: 'Información', on: true },
            { l: 'Publicaciones', count: '0' },
            { l: 'Registro legal', badge: `${d.legalPct}%` },
            { l: 'Actividad' },
          ].map((t) => (
            <span key={t.l} style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: t.on ? tn.b600 : css.muted, borderBottom: `2px solid ${t.on ? tn.b600 : 'transparent'}`, marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', borderRadius: t.on ? 6 : undefined, boxShadow: t.on ? anillo(r.pestanaInfo) : undefined }}>
              {t.l}
              {(t.count || t.badge) && <span style={{ background: css.slateBg, color: css.muted, fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, fontFamily: t.badge ? jetbrains : undefined }}>{t.count ?? t.badge}</span>}
            </span>
          ))}
        </div>
      </div>
      <InfoMiEscuela d={d} tn={tn} />
      <ColumnaDerecha d={d} tn={tn} />
    </div>
  );
};

// =============================================================================================================
// Paneles y ventanas (fijos en la pantalla)
// =============================================================================================================

const Fondo: FC<{ t: number }> = ({ t }) => (t > 0 ? <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.55 * t})`, backdropFilter: `blur(${6 * t}px)`, zIndex: 49 }} /> : null);

const inputPanel = (activo?: boolean): CSSProperties => ({ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 13, color: '#374151', border: `1px solid ${activo ? '#93c5fd' : '#D1D5DB'}`, borderRadius: 9, background: 'white', lineHeight: 1.5, minHeight: 39.5, boxShadow: activo ? '0 0 0 3px rgba(37,99,235,0.12)' : undefined });
const Caret: FC<{ on?: boolean }> = ({ on }) => (on ? <span style={{ display: 'inline-block', width: 1.5, height: 16, marginLeft: 1, background: '#111827', verticalAlign: 'middle' }} /> : null);
const CampoPanel: FC<{ label: string; valor: string; ph: string; caret?: boolean; hint?: ReactNode; filas?: number; children?: ReactNode }> = ({ label, valor, ph, caret, hint, filas = 1, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}</label>
    {children ?? (
      <div style={{ ...inputPanel(caret), height: filas > 1 ? filas * 19.5 + 20 : 39.5, color: valor ? '#374151' : '#9CA3AF', overflow: 'hidden' }}>
        {!valor && <Caret on={caret} />}
        {valor || ph}
        {valor && <Caret on={caret} />}
      </div>
    )}
    {hint}
  </div>
);
const BanderaCO: FC = () => (
  <svg width={21} height={14} viewBox="0 0 3 2" style={{ borderRadius: 2, flexShrink: 0 }}>
    <rect width="3" height="1" fill="#FCD116" />
    <rect y="1" width="3" height="0.5" fill="#003893" />
    <rect y="1.5" width="3" height="0.5" fill="#CE1126" />
  </svg>
);

export type DatosPanelEscuela = {
  /** 'modo' = «Bienvenido» (elegir el tipo); 'form' = «Crear escuela». */
  vista: 'modo' | 'form';
  hoverEscuela?: number;
  apretarEscuela?: number;
  nombre: string;
  telefono: string;
  slug: string;
  bio: string;
  ubicacion: string;
  anio: string;
  escribiendo?: 'nombre' | 'telefono' | 'slug' | 'bio' | 'ubicacion' | 'anio' | null;
  resalte?: Partial<Record<'slug' | 'vista' | 'bio' | 'pista' | 'nombre', number>>;
  apretarCrear?: number;
  hoverCrear?: number;
};
/** Medidas del panel «Crear escuela» (en la pantalla de alto `vh`). */
export const PANEL_ESCUELA = {
  x: 1280 - 480,
  tarjetaEscuela: { x: 1280 - 480 + 24, y: 151, ancho: 432, alto: 95 },
  campo: (k: 'nombre' | 'telefono' | 'slug' | 'bio' | 'ubicacion' | 'anio') =>
    ({
      nombre: { x: 824, y: 119, ancho: 432, alto: 39.5 },
      telefono: { x: 824, y: 196.5, ancho: 432, alto: 39.5 },
      slug: { x: 824, y: 274, ancho: 432, alto: 39.5 },
      bio: { x: 824, y: 372, ancho: 432, alto: 78.5 },
      ubicacion: { x: 824, y: 509, ancho: 210, alto: 39.5 },
      anio: { x: 1046, y: 509, ancho: 210, alto: 39.5 },
    })[k],
  vistaPrevia: { x: 824, y: 317.5, ancho: 330, alto: 17 },
  pista: { x: 824, y: 454.5, ancho: 300, alto: 17 },
  crear: (vh: number) => ({ x: 824, y: vh - 51.5, ancho: 432, alto: 37.5 }),
};

/** El panel de la derecha «Bienvenido» → «Crear escuela» (EditProfileDrawer, 480 px) con el fondo oscurecido. */
export const PanelEscuela: FC<{ d: DatosPanelEscuela; vh: number; t: number; fondo?: number }> = ({ d, vh, t, fondo = t }) => {
  const modo = d.vista === 'modo';
  const r = d.resalte ?? {};
  const he = d.hoverEscuela ?? 0;
  return (
    <>
      <Fondo t={fondo} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 480, height: vh, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.14)', transform: `translateX(${(1 - t) * 100}%)`, fontFamily: instrument }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12, height: 73, boxSizing: 'border-box' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', border: '1px solid #dbeafe', display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
            <Pencil size={16} color="#2563eb" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>{modo ? 'Bienvenido' : 'Crear escuela'}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{modo ? 'Cuéntanos cómo vas a usar Gali Esport' : 'Configura el perfil público de tu escuela'}</p>
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          {modo ? (
            <>
              <div>
                <h3 style={{ margin: 0, fontFamily: schibsted, fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 1.43 }}>¿Qué tipo de equipo vas a crear?</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af', lineHeight: 1.33 }}>Puedes cambiarlo después desde tu perfil.</p>
              </div>
              {[
                { Icono: Building2, l: 'Escuela o club profesional', desc: 'Entrenamientos, categorías, cobros a jugadores, documentos y perfil público de tu escuela.', h: he, a: d.apretarEscuela ?? 0 },
                { Icono: Users, l: 'Equipo aficionado', desc: 'Para jugar con tus amigos, torneos de fin de semana y llevar el historial de partidos y goles. Sin entrenamientos ni pagos.', h: 0, a: 0 },
              ].map(({ Icono, l, desc, h, a }) => (
                <div key={l} style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 12, border: `1px solid ${h > 0 ? '#3b82f6' : '#e5e7eb'}`, background: h > 0 ? `rgba(239,246,255,${0.4 * h})` : 'white', transform: hundir(a), boxShadow: h > 0 ? `0 0 0 ${2 * h}px rgba(59,130,246,${0.35 * h})` : undefined }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icono size={20} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827' }}>{l}</span>
                    <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.625 }}>{desc}</span>
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              <CampoPanel label="Nombre *" valor={d.nombre} ph="Academia Fénix Bogotá" caret={d.escribiendo === 'nombre'} />
              <CampoPanel label="Tu teléfono *" valor="" ph="">
                <div style={{ ...inputPanel(d.escribiendo === 'telefono'), display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                  <BanderaCO />
                  <ChevronDown size={12} color="#6b7280" />
                  <span style={{ color: '#374151' }}>+57</span>
                  <span style={{ color: d.telefono ? '#374151' : '#9CA3AF' }}>
                    {!d.telefono && <Caret on={d.escribiendo === 'telefono'} />}
                    {d.telefono || '300 1234567'}
                    {d.telefono && <Caret on={d.escribiendo === 'telefono'} />}
                  </span>
                </div>
              </CampoPanel>
              <CampoPanel
                label="Slug (URL amigable)"
                valor={d.slug}
                ph="academia-fenix-bogota"
                caret={d.escribiendo === 'slug'}
                hint={
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, display: 'block', borderRadius: 4, width: 'fit-content', boxShadow: anillo(r.vista), background: (r.vista ?? 0) > 0 ? `rgba(224,242,254,${r.vista})` : undefined }}>
                    Vista previa: <span style={{ color: '#2563eb' }}>{`${d.slug || '…'}.galiesport.com`}</span>
                  </span>
                }
              />
              <CampoPanel
                label="Bio"
                valor={d.bio}
                ph="Cuéntanos sobre tu escuela…"
                filas={3}
                caret={d.escribiendo === 'bio'}
                hint={<span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, display: 'block', borderRadius: 4, width: 'fit-content', boxShadow: anillo(r.pista), background: (r.pista ?? 0) > 0 ? `rgba(224,242,254,${r.pista})` : undefined }}>Se muestra debajo del nombre en tu perfil público.</span>}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <CampoPanel label="Ubicación" valor={d.ubicacion} ph="Bogotá, Colombia" caret={d.escribiendo === 'ubicacion'} />
                <CampoPanel label="Año de fundación" valor={d.anio} ph="2010" caret={d.escribiendo === 'anio'} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <span style={{ width: 15, height: 15, borderRadius: 3, background: '#2563eb', display: 'grid', placeItems: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.6">
                    <polyline points="3,8 6.5,11.5 13,4.5" />
                  </svg>
                </span>
                Perfil público
              </label>
            </>
          )}
        </div>
        {!modo && (
          <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 24px', height: 65.5, boxSizing: 'border-box' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 37.5, borderRadius: 8, fontSize: 13, fontWeight: 600, background: (d.hoverCrear ?? 0) > 0 ? '#1d4ed8' : '#2563eb', color: 'white', transform: hundir(d.apretarCrear) }}>
              <Save size={14} /> Crear escuela
            </span>
          </div>
        )}
      </div>
    </>
  );
};

// --- Ficha del equipo técnico ---

export type DatosFicha = {
  tipo: 'entrenador' | 'nuevo';
  foto: number;
  nombre: string;
  apellido: string;
  rol: string;
  escribiendo?: 'nombre' | 'apellido' | 'rol' | null;
  hoverSubir?: number;
  apretarSubir?: number;
  apretarGuardar?: number;
  hoverGuardar?: number;
};
/** Medidas de la ventana de la ficha (720 px, centrada; `vh` es el alto de la pantalla). */
export const FICHA = {
  x: 280,
  ancho: 720,
  subir: { x: 390, y: 116.5, ancho: 85, alto: 34 },
  foto: { x: 302, y: 122.75, ancho: 72, alto: 72 },
  campo: (k: 'nombre' | 'apellido' | 'rol') => ({ nombre: { x: 302, y: 264 }, apellido: { x: 759.3, y: 264 }, rol: { x: 302, y: 398.5 } })[k],
  guardar: (vh: number) => ({ x: 894, y: vh - 24 - 61 + 14, ancho: 84, alto: 35.5 }),
};

const CampoFicha: FC<{ label: string; valor?: string; caret?: boolean; select?: boolean }> = ({ label, valor = '', caret, select }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 11, color: '#6B7280' }}>{label}</span>
    <div style={{ height: 36.75, boxSizing: 'border-box', padding: '8px 10px', fontSize: 12.5, borderRadius: 8, border: `1px solid ${caret ? '#93c5fd' : '#D1D5DB'}`, background: 'white', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: caret ? '0 0 0 3px rgba(37,99,235,0.12)' : undefined }}>
      <span>
        {valor}
        <Caret on={caret} />
      </span>
      {select && <ChevronDown size={13} color="#6b7280" />}
    </div>
  </label>
);
const SeccionFicha: FC<{ titulo: string; children: ReactNode }> = ({ titulo, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8, lineHeight: 1.5 }}>{titulo}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>{children}</div>
  </div>
);

/** StaffMemberModal: «Ficha del entrenador» (tú) o «Nuevo integrante del equipo». */
export const VentanaFicha: FC<{ d: DatosFicha; vh: number; t: number }> = ({ d, vh, t }) => {
  if (t <= 0) return null;
  const coach = d.tipo === 'entrenador';
  const e = d.escribiendo;
  return (
    <>
      <Fondo t={Math.min(1, t * 1.5)} />
      <div style={{ position: 'absolute', left: FICHA.x, top: 24, width: FICHA.ancho, height: vh - 48, zIndex: 60, background: 'white', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: Math.min(1, t * 1.6), transform: `scale(${0.96 + 0.04 * t})`, fontFamily: instrument }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 74.5, boxSizing: 'border-box' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>{coach ? 'Ficha del entrenador' : 'Nuevo integrante del equipo'}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{coach ? 'Algunos datos vienen de tu perfil — complétalos o corrígelos.' : 'Cuerpo técnico y demás integrantes de la escuela.'}</p>
          </div>
          <span style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', display: 'grid', placeItems: 'center', color: '#6B7280', boxSizing: 'border-box' }}>
            <X size={16} />
          </span>
        </div>
        <div style={{ flex: 1, padding: '18px 22px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 14, flexShrink: 0, overflow: 'hidden', border: d.foto > 0 ? '2px solid transparent' : '2px dashed #D1D5DB', display: 'grid', placeItems: 'center', background: '#F1F5F9', color: '#9CA3AF', boxSizing: 'border-box' }}>
              <Foto size={22} />
              {d.foto > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: d.foto }}>
                  <AvatarIlustrado persona={coach ? 'carlos' : 'andres'} />
                </div>
              )}
            </div>
            <div>
              <span style={{ display: 'inline-block', fontSize: 12, padding: '7px 14px', borderRadius: 8, border: `1px solid ${(d.hoverSubir ?? 0) > 0 ? '#cbd5e1' : '#E5E7EB'}`, background: (d.hoverSubir ?? 0) > 0 ? '#f8fafc' : 'white', color: '#6B7280', transform: hundir(d.apretarSubir) }}>{d.foto > 0 ? 'Cambiar foto' : 'Subir foto'}</span>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF' }}>JPG o PNG, máx 3MB.</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: '#374151' }}>
                <span style={{ width: 13, height: 13, borderRadius: 3, background: '#2563eb', display: 'grid', placeItems: 'center' }}>
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="3,8 6.5,11.5 13,4.5" />
                  </svg>
                </span>
                Estado: <strong>Activo</strong>
              </label>
            </div>
          </div>
          <SeccionFicha titulo="Identidad">
            <CampoFicha label="Nombre" valor={d.nombre} caret={e === 'nombre'} />
            <CampoFicha label="Segundo nombre" />
            <CampoFicha label="Apellido" valor={d.apellido} caret={e === 'apellido'} />
            <CampoFicha label="Segundo apellido" />
            <CampoFicha label="Nombre corto" />
            <CampoFicha label="Género" valor="—" select />
            <CampoFicha label="Rol / cargo" valor={d.rol} caret={e === 'rol'} />
          </SeccionFicha>
          <SeccionFicha titulo="Documento y federación">
            <CampoFicha label="C.I. / Documento" />
            <CampoFicha label="Núm. de pasaporte" />
            <CampoFicha label="Núm. de registro" />
            <CampoFicha label="FIFA ID" />
            <CampoFicha label="Licencia aprobada" valor={coach ? 'C' : '—'} select />
          </SeccionFicha>
          <SeccionFicha titulo="Nacimiento y contacto">
            <CampoFicha label="Fecha de nacimiento" />
            <CampoFicha label="Nacionalidad" valor={coach ? 'Colombiana' : ''} />
            <CampoFicha label="País de nacimiento" />
          </SeccionFicha>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: 61, boxSizing: 'border-box' }}>
          <span style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', color: '#6B7280', width: 80, boxSizing: 'border-box', textAlign: 'center' }}>Cancelar</span>
          <span style={{ fontSize: 13, padding: '8px 0', width: 84, textAlign: 'center', borderRadius: 8, background: (d.hoverGuardar ?? 0) > 0 ? '#1d4ed8' : '#2563EB', color: 'white', fontWeight: 500, transform: hundir(d.apretarGuardar) }}>Guardar</span>
        </div>
      </div>
    </>
  );
};

// --- Registro legal ---

export type EstadoDoc = 'revision' | 'verificado';
export type DatosLegal = {
  hue: number;
  completados: number;
  /** Las secciones al 100 % (0 → 1). */
  completas: number;
  docsAbierto: boolean;
  docs: EstadoDoc[];
  /** El cuerpo del panel bajado (px). */
  scroll: number;
  resalteAviso?: number;
  hoverDocs?: number;
  resalteDocs?: number;
  hoverSoporte?: number;
  apretarSoporte?: number;
};
const DOCS = ['Cédula del representante legal', 'RUT', 'Cámara de Comercio', 'Certificado de existencia y representación'];
/** Medidas del panel «Registro legal» (720 px a la derecha). El cuerpo arranca en y = 116. */
export const LEGAL = {
  x: 1280 - 720,
  aviso: { x: 584, y: 138, ancho: 672, alto: 123 },
  progreso: { x: 560, y: 73, ancho: 720, alto: 43 },
  cabeceraDocs: (scroll: number) => ({ x: 584, y: 660.75 - scroll, ancho: 672, alto: 56 }),
  docs: (scroll: number) => ({ x: 584, y: 660.75 + 57 - scroll, ancho: 672, alto: 320 }),
  cerrar: { x: 1222, y: 19, ancho: 34, alto: 34 },
  /** «Escribir a soporte» dentro del aviso de Colombia (con el cuerpo sin bajar). */
  soporte: (scroll: number) => ({ x: 628, y: 214.75 - scroll, ancho: 150, alto: 32 }),
};

const SeccionLegal: FC<{ n?: number; titulo: string; pct: number; abierta?: boolean; tn: Tonos; children?: ReactNode; hover?: number; resalte?: number }> = ({ n, titulo, pct, abierta, tn, children, hover = 0, resalte = 0 }) => {
  const completa = pct === 100;
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: anillo(resalte) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', height: 56, boxSizing: 'border-box', background: abierta ? 'white' : hover > 0 ? '#EEF2F6' : '#F6F8FB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {n !== undefined ? (
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: tn.b600, color: 'white', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700 }}>{n}</span>
          ) : completa ? (
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#22C55E', color: 'white', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3,8 6.5,11.5 13,4.5" />
              </svg>
            </span>
          ) : null}
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{titulo}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: jetbrains, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: completa ? '#DCFCE7' : '#F1F5F9', color: completa ? '#15803D' : '#6B7280' }}>{pct}%</span>
          <ChevronDown size={16} color="#9CA3AF" style={{ transform: abierta ? 'rotate(180deg)' : undefined }} />
        </div>
      </div>
      {abierta && <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #F3F4F6', background: 'white' }}>{children}</div>}
    </div>
  );
};
const Leido: FC<{ label: string; valor: string }> = ({ label, valor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
    <div style={{ padding: '9px 12px', fontSize: 13, borderRadius: 9, background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', height: 39.5, boxSizing: 'border-box' }}>{valor}</div>
  </div>
);

/** LegalDrawer (720 px) con el aviso de Colombia, el progreso «x / 15» y las secciones. */
export const PanelLegal: FC<{ d: DatosLegal; vh: number; t: number }> = ({ d, vh, t }) => {
  if (t <= 0) return null;
  const tn = tonos(d.hue);
  const pct = Math.round((d.completados / 15) * 100);
  const sec = (base: number) => Math.round(base + (100 - base) * d.completas);
  return (
    <>
      <Fondo t={Math.min(1, t * 1.4)} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 720, height: vh, zIndex: 50, background: 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', transform: `translateX(${(1 - t) * 100}%)`, fontFamily: instrument, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 73, padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', background: 'white', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: tn.b50, border: `1px solid ${tn.b100}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
              <ShieldCheck size={20} color={tn.b600} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>Registro legal</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>Información requerida para activar tu escuela</p>
            </div>
          </div>
          <span style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', display: 'grid', placeItems: 'center', color: '#6B7280', boxSizing: 'border-box' }}>
            <X size={16} />
          </span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 73, height: 43, padding: '12px 24px', background: '#F6F8FB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14, boxSizing: 'border-box', zIndex: 2 }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Progreso</span>
          <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: tn.b600, width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: jetbrains, color: '#6B7280' }}>
            {d.completados} / 15 · {pct}%
          </span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 116, bottom: 63.5, overflow: 'hidden' }}>
          <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, transform: `translateY(${-d.scroll}px)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: anillo(d.resalteAviso) }}>
              <Globe size={18} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#111827' }}>Solo para escuelas en Colombia</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>Pedimos documentos colombianos: cédula, RUT y Cámara de Comercio. Si tu escuela está en otro país, escríbenos y te ayudamos a activarla.</p>
                <span style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: tn.b600, background: (d.hoverSoporte ?? 0) > 0 ? tn.b50 : 'white', border: `1px solid ${(d.hoverSoporte ?? 0) > 0 ? tn.b200 : '#E2E8F0'}`, transform: hundir(d.apretarSoporte) }}>
                  <MessageCircle size={14} /> Escribir a soporte
                </span>
              </div>
            </div>
            <SeccionLegal titulo="Contacto principal" pct={sec(50)} abierta tn={tn}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Leido label="Correo electrónico" valor="carlos.rodriguez@ejemplo.com" />
                <Leido label="Teléfono" valor="+57 300 123 4567" />
                <Leido label="Fecha de nacimiento" valor="14/03/1985" />
                <Leido label="Edad" valor="41 años" />
              </div>
            </SeccionLegal>
            <SeccionLegal n={1} titulo="Datos del representante legal" pct={sec(0)} tn={tn} />
            <SeccionLegal n={2} titulo="Datos de la escuela" pct={sec(0)} tn={tn} />
            <SeccionLegal n={3} titulo="Documentos a cargar" pct={sec(0)} tn={tn} abierta={d.docsAbierto} hover={d.hoverDocs} resalte={d.resalteDocs}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DOCS.map((l, i) => {
                  const ok = d.docs[i] === 'verificado';
                  const c = ok ? { bg: 'oklch(0.96 0.05 150)', color: 'oklch(0.42 0.15 150)' } : { bg: 'oklch(0.96 0.06 80)', color: 'oklch(0.5 0.14 80)' };
                  return (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', height: 65, boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', background: c.bg, color: c.color }}>{ok ? <CheckCircle size={14} /> : <Clock size={14} />}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 14, color: '#111827' }}>{l}</span>
                          <span style={{ fontSize: 12, color: c.color }}>{ok ? 'Verificado' : 'En revisión'}</span>
                        </div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, fontWeight: 500, color: '#4b5563', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                        <Eye size={14} /> Ver
                      </span>
                    </div>
                  );
                })}
              </div>
            </SeccionLegal>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 63.5, borderTop: '1px solid #E5E7EB', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, background: 'white', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9CA3AF' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: tn.b600 }}>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Los cambios se guardan automáticamente.
          </div>
          <span style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#6B7280', border: '1px solid #E5E7EB' }}>Cerrar</span>
        </div>
      </div>
    </>
  );
};
