// Panel de administrador de Gali Esport en escritorio (página de 1280 de ancho) y su bandeja de TikTok: menú lateral con
// el contador de «Mensajes», barra superior, encabezado «Mensajes» con las pestañas de canales (Plataforma, WhatsApp,
// Instagram, Facebook, TikTok), tarjeta «Conecta la cuenta de TikTok», aviso verde, cuenta conectada, pestañas
// «Mensajes directos / Comentarios», lista de videos con sus comentarios (responder, «Ver 2 respuestas más»), lista de
// conversaciones, el chat con el aviso de las 48 h y la caja para escribir, y la página de autorización de TikTok.
// Copiado de la app: app/admin/soporte/** (TikTokInboxClient, TikTokComments, TikTokDirectMessages, ChannelSwitch),
// components/layout/{SideNav,NavLinks,TopBar}.tsx, components/support/{ChatThread,ChatComposer}.tsx y UserAvatar.
// Todo va en píxeles de la página; las medidas fijas (`ADMIN`, `yPestanas`, `yPanel`) dicen dónde cae cada botón, para
// llevar el puntero. Los datos (videos, comentarios, conversaciones) los pone cada video. Desde `tiktok-admin-demo`.
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  Building2, CheckCircle2, Clock, Copy, CreditCard, Database, ExternalLink, FileCheck2, Headset, Heart, LayoutDashboard, Link2,
  Map as MapIcon, MessageCircle, MessagesSquare, Moon, Newspaper, RefreshCw, Reply, SendHorizontal, Trophy, Unplug, UserPlus, Users,
  UsersRound, X, Zap, type LucideIcon,
} from 'lucide-react';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';

// --- Colores y medidas ----------------------------------------------------------------------------------------------------

/** Colores del panel (variables --o-* y la paleta de Tailwind que usa la app). */
export const AD = {
  fondo: '#F6F8FB',
  linea: '#E5E9F0',
  lineaSuave: '#F1F5F9',
  borde: '#e2e8f0',
  tinta: '#0F172A',
  tinta2: '#475569',
  tinta3: '#94A3B8',
  muted: '#64748b',
  g900: '#111827',
  g800: '#1f2937',
  g700: '#374151',
  g600: '#4b5563',
  g500: '#6b7280',
  g400: '#9ca3af',
  g200: '#e5e7eb',
  g100: '#f3f4f6',
  g50: '#f9fafb',
  azul: '#2563eb',
  azul50: '#EFF6FF',
  azul700: '#1d4ed8',
  bgAlt: '#F1F5F9',
  hundido: '#F8FAFC',
  verde50: '#f0fdf4',
  verde200: '#bbf7d0',
  verde600: '#16a34a',
  verde700: '#15803d',
  ambar50: '#fffbeb',
  ambar700: '#b45309',
  cielo100: '#e0f2fe',
  cielo700: '#0369a1',
};

/** Medidas fijas de la página de mensajes del admin (en píxeles de la página). */
export const ADMIN = {
  ancho: 1280,
  menu: 176,
  barra: 52,
  pad: 24,
  /** Borde izquierdo y derecho del contenido. */
  x0: 200,
  x1: 1256,
  yEncabezado: 76,
  altoEncabezado: 78,
  hueco: 16,
  altoAviso: 38,
  altoPestanas: 28,
  /** Ancho de la columna izquierda (videos o conversaciones). */
  lista: 320,
  cabeceraVideos: 37,
  filaVideo: 85,
  cabeceraComentarios: 61,
  cabeceraConversaciones: 45,
  filaConversacion: 100,
  cabeceraChat: 65,
  /** Pestañas «Mensajes directos» y «Comentarios». */
  pestanaDm: 152,
  pestanaComentarios: 122,
  /** Botón «Responder» bajo un comentario. */
  botonResponder: 80,
  botonPublicar: 72,
};

/** Dónde empiezan las pestañas «Mensajes directos / Comentarios», según cuánto se ve el aviso verde (0–1). */
export const yPestanas = (aviso: number) => ADMIN.yEncabezado + ADMIN.altoEncabezado + ADMIN.hueco + aviso * (ADMIN.altoAviso + ADMIN.hueco);
/** Dónde empieza el panel blanco (videos/comentarios o conversaciones). */
export const yPanel = (aviso: number) => yPestanas(aviso) + ADMIN.altoPestanas + ADMIN.hueco;
/** Comienzo de la sección derecha del panel. */
export const xSeccion = ADMIN.x0 + 1 + ADMIN.lista;

// --- Piezas sueltas -------------------------------------------------------------------------------------------------------

/** Anillo naranja alrededor de algo (`t` de 0 a 1), para señalarlo en un demo. `margen`: cuánto se separa (negativo: por dentro). */
export const Anillo: FC<{ t?: number; radio?: number; margen?: number; bloque?: boolean; style?: CSSProperties; children: ReactNode }> = ({ t = 0, radio = 10, margen = 5, bloque, style, children }) => (
  <span style={{ position: 'relative', display: bloque ? 'flex' : 'inline-flex', ...style }}>
    {children}
    {t > 0 && (
      <span
        style={{
          position: 'absolute',
          inset: -margen,
          borderRadius: Math.max(2, radio + margen),
          boxShadow: `0 0 0 ${2.5 * t}px rgba(249,115,22,${0.95 * t}), 0 0 ${18 * t}px rgba(249,115,22,${0.45 * t})`,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    )}
  </span>
);

const primera = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase('es-CO') ?? '';
/** Iniciales como las saca la app («Laura M.» → «LM»). */
export const inicialesAdmin = (nombre: string) => {
  const p = nombre.replace(/@.*$/, '').split(/[\s._-]+/).filter(Boolean);
  if (!p.length) return '?';
  return p.length === 1 ? primera(p[0]) : `${primera(p[0])}${primera(p[p.length - 1])}`;
};

/** Avatar de los listados del admin sin foto: iniciales en celeste. */
export const AvatarIniciales: FC<{ nombre: string; tamano: number }> = ({ nombre, tamano }) => (
  <span
    style={{
      width: tamano,
      height: tamano,
      borderRadius: '50%',
      background: AD.cielo100,
      color: AD.cielo700,
      display: 'grid',
      placeItems: 'center',
      fontWeight: 700,
      fontSize: Math.max(10, Math.round(tamano * 0.36)),
      flexShrink: 0,
    }}
  >
    {inicialesAdmin(nombre)}
  </span>
);

/** Foto de perfil de la cuenta de TikTok de Gali: el isotipo en un círculo blanco. */
export const AvatarGali: FC<{ tamano: number }> = ({ tamano }) => (
  <span style={{ width: tamano, height: tamano, borderRadius: '50%', background: '#fff', boxShadow: `inset 0 0 0 1px ${AD.linea}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
    <Isotipo tamano={tamano * 0.7} />
  </span>
);

const Avatar: FC<{ nombre: string; tamano: number; gali?: boolean }> = ({ nombre, tamano, gali }) =>
  gali ? <AvatarGali tamano={tamano} /> : <AvatarIniciales nombre={nombre} tamano={tamano} />;

/** Cursor de escribir. */
const Caret: FC<{ alto?: number }> = ({ alto = 18 }) => (
  <span style={{ display: 'inline-block', width: 1.5, height: alto, background: AD.tinta, verticalAlign: 'text-bottom', marginLeft: 1 }} />
);

const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);

// --- Menú lateral, barra y página ------------------------------------------------------------------------------------------

type Enlace = { nombre: string; Icono: LucideIcon; contador?: boolean };
const ENLACES: Enlace[] = [
  { nombre: 'Panel', Icono: LayoutDashboard },
  { nombre: 'Mensajes', Icono: Headset, contador: true },
  { nombre: 'Torneos', Icono: Trophy },
  { nombre: 'Usuarios', Icono: Users },
  { nombre: 'Instituciones', Icono: Building2 },
  { nombre: 'Suscripciones', Icono: CreditCard },
  { nombre: 'Revisar documentos', Icono: FileCheck2 },
  { nombre: 'Canchas', Icono: MapIcon },
  { nombre: 'Blog', Icono: Newspaper },
  { nombre: 'Nosotros', Icono: UsersRound },
  { nombre: 'Schema DB', Icono: Database },
];

export type UsuarioAdmin = { nombre: string; rol: string };

/** Menú lateral del administrador (176 px), con «Mensajes» activo y su contador (suma de todos los canales). */
export const MenuAdmin: FC<{ alto: number; contador: number; realceContador?: number; usuario: UsuarioAdmin }> = ({ alto, contador, realceContador = 0, usuario }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: ADMIN.menu,
      height: alto,
      boxSizing: 'border-box',
      background: '#fff',
      borderRight: `1px solid ${AD.borde}`,
      padding: '0 14px 20px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: ADMIN.barra, padding: '0 8px', flexShrink: 0, borderBottom: `1px solid ${AD.borde}`, boxSizing: 'border-box' }}>
      <Isotipo tamano={32} />
      <div style={{ fontWeight: 700, fontSize: 14, fontFamily: schibsted, letterSpacing: '-0.01em', color: AD.tinta }}>Gali Esport</div>
    </div>
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
      {ENLACES.map(({ nombre, Icono, contador: conContador }) => {
        const activo = nombre === 'Mensajes';
        return (
          <div
            key={nombre}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: 10,
              minHeight: 36,
              boxSizing: 'border-box',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activo ? 500 : 400,
              color: activo ? AD.azul700 : AD.muted,
              background: activo ? AD.azul50 : 'transparent',
            }}
          >
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, lineHeight: 1, whiteSpace: 'nowrap' }}>{nombre}</span>
            {conContador && contador > 0 && (
              <Anillo t={realceContador} radio={9} margen={2.5}>
                <span style={{ minWidth: 18, height: 18, padding: '0 4px', boxSizing: 'border-box', borderRadius: 9, background: AD.azul, color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {contador > 99 ? '99+' : contador}
                </span>
              </Anillo>
            )}
          </div>
        );
      })}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: `1px solid ${AD.borde}`, background: AD.hundido }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: AD.azul, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>{primera(usuario.nombre)}</div>
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: `2px solid ${AD.hundido}`, boxSizing: 'border-box' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, color: AD.tinta, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario.nombre}</div>
        <div style={{ fontSize: 11, color: AD.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario.rol}</div>
      </div>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={AD.tinta3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
);

/** Página del admin: menú, barra superior (con el botón claro/oscuro) y el fondo gris. `children` va en píxeles de la página. */
export const PaginaAdmin: FC<{ alto: number; contadorMenu: number; realceMenu?: number; usuario: UsuarioAdmin; children: ReactNode }> = ({ alto, contadorMenu, realceMenu, usuario, children }) => (
  <div style={{ position: 'relative', width: ADMIN.ancho, height: alto, background: AD.fondo, overflow: 'hidden', fontFamily: instrument, color: AD.tinta }}>
    <MenuAdmin alto={alto} contador={contadorMenu} realceContador={realceMenu} usuario={usuario} />
    <div style={{ position: 'absolute', left: ADMIN.menu, right: 0, top: 0, height: ADMIN.barra, background: '#fff', borderBottom: `1px solid ${AD.borde}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${AD.borde}`, display: 'grid', placeItems: 'center', color: AD.tinta2, boxSizing: 'border-box' }}>
        <Moon size={17} />
      </div>
    </div>
    {children}
  </div>
);

// --- Encabezado «Mensajes» y pestañas de canales ------------------------------------------------------------------------------

export type Canal = 'platform' | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok';
const CANALES: { clave: Canal; nombre: string }[] = [
  { clave: 'platform', nombre: 'Plataforma' },
  { clave: 'whatsapp', nombre: 'WhatsApp' },
  { clave: 'instagram', nombre: 'Instagram' },
  { clave: 'facebook', nombre: 'Facebook' },
  { clave: 'tiktok', nombre: 'TikTok' },
];

/** Pestañas de canales con lo pendiente de cada uno (ChannelSwitch). */
export const CambioCanal: FC<{ activo: Canal; contadores: Partial<Record<Canal, number>>; realce?: Partial<Record<Canal, number>> }> = ({ activo, contadores, realce = {} }) => (
  <div style={{ display: 'inline-flex', borderRadius: 12, padding: 4, background: AD.bgAlt }}>
    {CANALES.map(({ clave, nombre }) => {
      const on = clave === activo;
      const n = contadores[clave] ?? 0;
      return (
        <span
          key={clave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 26,
            whiteSpace: 'nowrap',
            borderRadius: 8,
            padding: '0 12px',
            fontSize: 12,
            fontWeight: 600,
            background: on ? '#fff' : 'transparent',
            color: on ? AD.tinta : AD.tinta2,
            boxShadow: on ? '0 1px 2px rgba(15, 23, 42, 0.08)' : undefined,
          }}
        >
          {nombre}
          {n > 0 && (
            <Anillo t={realce[clave] ?? 0} radio={9} margen={2.5}>
              <span style={{ minWidth: 18, height: 18, padding: '0 6px', boxSizing: 'border-box', borderRadius: 9, background: AD.azul, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
            </Anillo>
          )}
        </span>
      );
    })}
  </div>
);

/** Encabezado de /admin/soporte/<canal>: «Mensajes», las pestañas de canales, la explicación y (a la derecha) `derecha`. */
export const EncabezadoMensajes: FC<{ canal: Canal; contadores: Partial<Record<Canal, number>>; realceCanales?: Partial<Record<Canal, number>>; texto: string; derecha?: ReactNode }> = ({ canal, contadores, realceCanales, texto, derecha }) => (
  <div style={{ position: 'absolute', left: ADMIN.x0, top: ADMIN.yEncabezado, width: ADMIN.x1 - ADMIN.x0, height: ADMIN.altoEncabezado }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 34 }}>
      <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 24, fontWeight: 700, color: AD.g900, lineHeight: '32px' }}>Mensajes</h1>
      <CambioCanal activo={canal} contadores={contadores} realce={realceCanales} />
    </div>
    <p style={{ margin: '4px 0 0', maxWidth: 800, height: 40, fontSize: 14, lineHeight: '20px', color: AD.g500 }}>{texto}</p>
    {derecha && <div style={{ position: 'absolute', right: 0, top: 0 }}>{derecha}</div>}
  </div>
);

export const TEXTO_TIKTOK = 'Mensajes directos y comentarios de la cuenta de TikTok de Gali. Lo que respondas aquí sale desde esa cuenta, igual que si lo escribieras en la app de TikTok.';

// --- Bandeja de TikTok: conectar ------------------------------------------------------------------------------------------------

/** Dónde cae el botón «Conectar con TikTok» (centro). */
export const BOTON_CONECTAR = { x: ADMIN.x0 + 20 + 110, y: yPestanas(0) + 126 };

/** Tarjeta «Conecta la cuenta de TikTok» con el botón negro (lo ve un super administrador). */
export const TarjetaConectarTikTok: FC<{ apretar?: number; realce?: number }> = ({ apretar = 0, realce = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: ADMIN.x0,
      top: yPestanas(0),
      width: 672,
      boxSizing: 'border-box',
      borderRadius: 16,
      border: `1px solid ${AD.linea}`,
      background: '#fff',
      padding: 20,
      fontSize: 14,
      color: AD.g700,
    }}
  >
    <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 700, color: AD.g900 }}>Conecta la cuenta de TikTok</div>
    <p style={{ margin: '8px 0 0', lineHeight: '20px', height: 40 }}>
      Inicia sesión con la cuenta de empresa de TikTok de Gali y autoriza el acceso. Después verás aquí sus mensajes directos y los comentarios de sus videos.
    </p>
    <Anillo t={realce} radio={12} style={{ marginTop: 16 }}>
      <span
        style={{
          width: 220,
          height: 36,
          borderRadius: 12,
          background: '#000',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          transform: hundir(apretar),
        }}
      >
        <Link2 size={16} />
        Conectar con TikTok
        <ExternalLink size={13} style={{ opacity: 0.7 }} />
      </span>
    </Anillo>
    <div style={{ marginTop: 16, fontSize: 12, lineHeight: '16px', color: AD.g500 }}>
      Redirect URL registrada en la app de TikTok:
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, border: `1px solid ${AD.g200}`, background: AD.g50, padding: '6px 10px' }}>
        <code style={{ flex: 1, fontFamily: jetbrains, fontSize: 12, color: AD.g800 }}>https://galiesport.com/api/admin/tiktok/callback</code>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: AD.g600 }}>
          <Copy size={13} /> Copiar
        </span>
      </div>
    </div>
  </div>
);

/** La cuenta de TikTok conectada, arriba a la derecha (con el botón para desconectar). */
export const CuentaTikTok: FC<{ nombre: string; usuario: string; realce?: number }> = ({ nombre, usuario, realce = 0 }) => (
  <Anillo t={realce} radio={12}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: `1px solid ${AD.linea}`, background: '#fff', padding: '6px 10px' }}>
      <AvatarGali tamano={28} />
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: AD.g900 }}>{nombre}</div>
        <div style={{ fontSize: 11, color: AD.g500 }}>@{usuario}</div>
      </div>
      <span style={{ marginLeft: 4, width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: AD.g500 }}>
        <Unplug size={15} />
      </span>
    </div>
  </Anillo>
);

/** Dónde cae la X del aviso verde. */
export const CERRAR_AVISO = { x: ADMIN.x1 - 20, y: yPestanas(0) + ADMIN.altoAviso / 2 };

/** Aviso verde «Cuenta de TikTok conectada.» (`t` 0–1: lo que se ve de su alto, para cerrarlo plegándose). */
export const AvisoConectada: FC<{ t: number; realce?: number }> = ({ t, realce = 0 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: ADMIN.x0, top: yPestanas(0), width: ADMIN.x1 - ADMIN.x0, height: ADMIN.altoAviso * t, opacity: Math.min(1, t * 1.6), overflow: 'visible' }}>
      <Anillo t={realce} radio={12} bloque>
        <div
          style={{
            flex: 1,
            height: ADMIN.altoAviso,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
            border: `1px solid ${AD.verde200}`,
            background: AD.verde50,
            color: AD.verde700,
            padding: '0 12px',
            fontSize: 14,
            transform: `scaleY(${0.6 + 0.4 * t})`,
            transformOrigin: '50% 0',
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Cuenta de TikTok conectada.</span>
          <X size={16} />
        </div>
      </Anillo>
    </div>
  ) : null;

/** Centros de las pestañas «Mensajes directos» y «Comentarios» (con el aviso verde a la vista `aviso`). */
export const pestanaTikTok = (cual: 'dms' | 'comentarios', aviso = 0) => ({
  x: cual === 'dms' ? ADMIN.x0 + ADMIN.pestanaDm / 2 : ADMIN.x0 + ADMIN.pestanaDm + 6 + ADMIN.pestanaComentarios / 2,
  y: yPestanas(aviso) + ADMIN.altoPestanas / 2,
});

const Pill: FC<{ on: boolean; ancho: number; Icono: LucideIcon; apretar?: number; children: ReactNode }> = ({ on, ancho, Icono, apretar = 0, children }) => (
  <span
    style={{
      width: ancho,
      height: ADMIN.altoPestanas,
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      background: on ? AD.azul : AD.bgAlt,
      color: on ? '#fff' : AD.tinta2,
      transform: on ? hundir(apretar) : undefined,
    }}
  >
    <Icono size={14} />
    {children}
  </span>
);

/** Pestañas «Mensajes directos / Comentarios» y el estado de los avisos al instante (webhook). */
export const PestanasTikTok: FC<{ vista: 'dms' | 'comentarios'; aviso: number; ultimoAviso: string; apretar?: number }> = ({ vista, aviso, ultimoAviso, apretar = 0 }) => {
  return (
    <div style={{ position: 'absolute', left: ADMIN.x0, top: yPestanas(aviso), width: ADMIN.x1 - ADMIN.x0, height: ADMIN.altoPestanas, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <Pill on={vista === 'dms'} ancho={ADMIN.pestanaDm} Icono={MessagesSquare} apretar={apretar}>
          Mensajes directos
        </Pill>
        <Pill on={vista === 'comentarios'} ancho={ADMIN.pestanaComentarios} Icono={MessageCircle} apretar={apretar}>
          Comentarios
        </Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: AD.g500 }}>
        <Zap size={13} color={AD.verde600} />
        <span>
          <span style={{ fontWeight: 600, color: AD.g700 }}>Avisos al instante activos</span> · último aviso hace {ultimoAviso}
        </span>
      </div>
    </div>
  );
};

/** El panel blanco de la bandeja, del final de las pestañas al pie de la página. `children`: columna izquierda y derecha. */
export const PanelBandeja: FC<{ aviso: number; alto: number; izquierda: ReactNode; derecha: ReactNode }> = ({ aviso, alto, izquierda, derecha }) => (
  <div
    style={{
      position: 'absolute',
      left: ADMIN.x0,
      top: yPanel(aviso),
      width: ADMIN.x1 - ADMIN.x0,
      height: alto - ADMIN.pad - yPanel(aviso),
      boxSizing: 'border-box',
      borderRadius: 16,
      border: `1px solid ${AD.linea}`,
      background: '#fff',
      overflow: 'hidden',
      display: 'flex',
    }}
  >
    <div style={{ width: ADMIN.lista, flexShrink: 0, borderRight: `1px solid ${AD.linea}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{izquierda}</div>
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>{derecha}</div>
  </div>
);

const Vacio: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center', fontSize: 14, color: AD.g500 }}>{children}</div>
);
export const Cargando: FC = () => <p style={{ margin: 0, padding: 16, fontSize: 14, color: AD.g500 }}>Cargando…</p>;

const Actualizar: FC = () => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 600, color: AD.g600 }}>
    <RefreshCw size={13} /> Actualizar
  </span>
);

// --- Comentarios -------------------------------------------------------------------------------------------------------------

export type VideoTikTok = { descripcion: string; comentarios: number; likes: number; fecha: string; Miniatura: FC };

/** Centro de la fila del video `k` en la lista (con el aviso verde a la vista `aviso`). */
export const filaVideo = (k: number, aviso = 0) => ({ x: ADMIN.x0 + ADMIN.lista / 2, y: yPanel(aviso) + 1 + ADMIN.cabeceraVideos + ADMIN.filaVideo * k + ADMIN.filaVideo / 2 });

/** Columna izquierda: «Videos de la cuenta». `aparecer` (0–1) los va mostrando de arriba abajo. */
export const ListaVideos: FC<{ videos: VideoTikTok[]; elegido?: number | null; cargando?: boolean; aparecer?: number; realceConteo?: number }> = ({ videos, elegido = null, cargando, aparecer = 1, realceConteo = 0 }) => (
  <>
    <div style={{ height: ADMIN.cabeceraVideos, boxSizing: 'border-box', borderBottom: `1px solid ${AD.linea}`, padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: AD.g500 }}>Videos de la cuenta</div>
    {cargando ? (
      <Cargando />
    ) : (
      videos.map((v, k) => {
        const t = Math.max(0, Math.min(1, aparecer * (videos.length + 1) - k));
        return (
          <div
            key={k}
            style={{
              height: ADMIN.filaVideo,
              flexShrink: 0,
              boxSizing: 'border-box',
              borderBottom: `1px solid ${AD.lineaSuave}`,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: k === elegido ? AD.azul50 : undefined,
              opacity: t,
              transform: `translateY(${(1 - t) * 8}px)`,
            }}
          >
            <span style={{ position: 'relative', width: 48, height: 64, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: AD.g100 }}>
              <v.Miniatura />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 14, lineHeight: '20px', color: AD.g800, height: 40 }}>{v.descripcion}</span>
              <span style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, lineHeight: '16px', color: AD.g500 }}>
                <Anillo t={k === 0 ? realceConteo : 0} radio={6} style={{ gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MessageCircle size={11} /> {v.comentarios}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Heart size={11} /> {v.likes}
                  </span>
                </Anillo>
                <span>{v.fecha}</span>
              </span>
            </span>
          </div>
        );
      })
    )}
  </>
);

export type ComentarioTikTok = {
  nombre: string;
  usuario?: string;
  texto: string;
  fecha: string;
  likes?: number;
  /** Es de la cuenta de Gali (lleva la etiqueta «Gali» y su foto). */
  gali?: boolean;
  realceGali?: number;
  /** Fondo azul suave que se apaga (0–1): recién publicado. */
  nuevo?: number;
};

const FilaComentario: FC<{ c: ComentarioTikTok; chico?: boolean }> = ({ c, chico }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 8, background: c.nuevo ? `rgba(37,99,235,${0.1 * c.nuevo})` : undefined, boxShadow: c.nuevo ? `0 0 0 4px rgba(37,99,235,${0.1 * c.nuevo})` : undefined }}>
    <Avatar nombre={c.nombre} tamano={chico ? 26 : 32} gali={c.gali} />
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px', height: 16 }}>
        <span style={{ fontWeight: 600, color: AD.g900 }}>{c.nombre}</span>
        {c.usuario && <span style={{ color: AD.g400 }}>@{c.usuario}</span>}
        {c.gali && (
          <Anillo t={c.realceGali ?? 0} radio={8}>
            <span style={{ borderRadius: 99, padding: '0 6px', fontSize: 10, lineHeight: '15px', fontWeight: 600, background: AD.azul50, color: AD.azul700 }}>Gali</span>
          </Anillo>
        )}
        <span style={{ color: AD.g400 }}>· {c.fecha}</span>
      </div>
      <p style={{ margin: '2px 0 0', fontSize: chico ? 13 : 14, lineHeight: chico ? '19.5px' : '20px', color: AD.g800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.texto}</p>
      {!!c.likes && (
        <span style={{ marginTop: 4, height: 16, display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: AD.g500 }}>
          <Heart size={11} /> {c.likes}
        </span>
      )}
    </div>
  </div>
);

export type FormularioRespuesta = { texto: string; caret: boolean; enviando?: boolean; apretar?: number; maximo?: number };
export type HiloComentario = {
  comentario: ComentarioTikTok;
  respuestas: ComentarioTikTok[];
  /** Respuestas que TikTok no trajo con el comentario («Ver n respuestas más»). */
  faltan: number;
  cargandoRespuestas?: boolean;
  formulario?: FormularioRespuesta | null;
  apretarResponder?: number;
};

const HiloComentarios: FC<{ hilo: HiloComentario }> = ({ hilo }) => {
  const { comentario, respuestas, faltan, formulario, cargandoRespuestas } = hilo;
  const maximo = formulario?.maximo ?? 150;
  const largo = formulario?.texto.length ?? 0;
  const listo = largo > 0 && !formulario?.enviando;
  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${AD.lineaSuave}` }}>
      <FilaComentario c={comentario} />
      <div style={{ marginLeft: 44, marginTop: 6, height: 16, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
        <span style={{ width: ADMIN.botonResponder, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: AD.g600, transform: hundir(hilo.apretarResponder) }}>
          <Reply size={13} /> Responder
        </span>
        {faltan > 0 && <span style={{ fontWeight: 600, color: AD.azul, opacity: cargandoRespuestas ? 0.6 : 1 }}>{cargandoRespuestas ? 'Cargando…' : `Ver ${faltan === 1 ? '1 respuesta más' : `${faltan} respuestas más`}`}</span>}
      </div>
      {respuestas.length > 0 && (
        <div style={{ marginLeft: 44, marginTop: 8, borderLeft: `1px solid ${AD.linea}`, paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {respuestas.map((r, k) => (
            <FilaComentario key={k} c={r} chico />
          ))}
        </div>
      )}
      {formulario && (
        <div style={{ marginLeft: 44, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34 }}>
            <div style={{ flex: 1, minWidth: 0, height: 34, boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${formulario.caret ? '#93c5fd' : AD.g200}`, boxShadow: formulario.caret ? '0 0 0 2px rgba(37,99,235,0.15)' : undefined, padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {formulario.texto ? <span style={{ color: AD.g900 }}>{formulario.texto}</span> : null}
              {formulario.caret && <Caret />}
              {!formulario.texto && <span style={{ color: AD.g400 }}>Responder a {comentario.nombre}…</span>}
            </div>
            <span style={{ width: ADMIN.botonPublicar, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, background: AD.azul, color: '#fff', opacity: listo ? 1 : 0.5, transform: hundir(formulario.apretar) }}>
              {formulario.enviando ? 'Enviando…' : 'Publicar'}
            </span>
          </div>
          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11, lineHeight: '16px', color: AD.g400 }}>
            <span>La respuesta es pública y sale desde la cuenta de TikTok de Gali.</span>
            <span>
              {largo}/{maximo}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/** Centro del botón «Responder» del primer comentario y de «Ver n respuestas más» a su lado. */
export const botonesPrimerComentario = (aviso = 0) => {
  const y = yPanel(aviso) + 1 + ADMIN.cabeceraComentarios + 8 + 12 + 58 + 6 + 8;
  const x = xSeccion + 16 + 44;
  return { responder: { x: x + ADMIN.botonResponder / 2, y }, verMas: { x: x + ADMIN.botonResponder + 12 + 62, y } };
};
/** Centro del botón «Publicar» del formulario del primer comentario (sin respuestas a la vista). */
export const botonPublicar = (aviso = 0) => ({ x: ADMIN.x1 - 1 - 16 - ADMIN.botonPublicar / 2, y: yPanel(aviso) + 1 + ADMIN.cabeceraComentarios + 8 + 12 + 58 + 6 + 16 + 8 + 17 });

/** Columna derecha: el video elegido y sus comentarios. Sin video: «Elige un video para ver sus comentarios.» */
export const ComentariosVideo: FC<{ video: VideoTikTok | null; hilos: HiloComentario[]; cargando?: boolean; aparecer?: number }> = ({ video, hilos, cargando, aparecer = 1 }) =>
  !video ? (
    <Vacio>Elige un video para ver sus comentarios.</Vacio>
  ) : (
    <>
      <div style={{ height: ADMIN.cabeceraComentarios, flexShrink: 0, boxSizing: 'border-box', borderBottom: `1px solid ${AD.linea}`, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: AD.g900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.descripcion}</div>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: AD.azul }}>Ver en TikTok</div>
        </div>
        <Actualizar />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '8px 16px' }}>
        {cargando ? (
          <p style={{ margin: 0, padding: '16px 0', fontSize: 14, color: AD.g500 }}>Cargando…</p>
        ) : (
          hilos.map((h, k) => {
            const t = Math.max(0, Math.min(1, aparecer * (hilos.length + 1) - k));
            return (
              <div key={k} style={{ opacity: t, transform: `translateY(${(1 - t) * 8}px)` }}>
                <HiloComentarios hilo={h} />
              </div>
            );
          })
        )}
      </div>
    </>
  );

// --- Mensajes directos ---------------------------------------------------------------------------------------------------------

export type ConversacionTikTok = {
  nombre: string;
  fecha: string;
  vista: string;
  solicitud?: boolean;
  teSigue?: boolean;
  noLeida?: boolean;
  /** El último mensaje lo mandó Gali («Gali: …»). */
  deGali?: boolean;
  realce?: number;
};

/** Centro de la conversación `k` en la lista. */
export const filaConversacion = (k: number, aviso = 0) => ({ x: ADMIN.x0 + ADMIN.lista / 2, y: yPanel(aviso) + 1 + ADMIN.cabeceraConversaciones + ADMIN.filaConversacion * k + ADMIN.filaConversacion / 2 });

/** Columna izquierda: «n conversaciones», «Actualizar» y la lista. */
export const ListaConversaciones: FC<{ conversaciones: ConversacionTikTok[]; elegida?: number | null; apretar?: number; aparecer?: number }> = ({ conversaciones, elegida = null, apretar = 0, aparecer = 1 }) => (
  <>
    <div style={{ height: ADMIN.cabeceraConversaciones, flexShrink: 0, boxSizing: 'border-box', borderBottom: `1px solid ${AD.linea}`, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: AD.g500 }}>
        {conversaciones.length} conversacion{conversaciones.length === 1 ? '' : 'es'}
      </span>
      <Actualizar />
    </div>
    {conversaciones.map((c, k) => {
      const activa = k === elegida;
      const t = Math.max(0, Math.min(1, aparecer * (conversaciones.length + 1) - k));
      return (
        <div
          key={k}
          style={{
            height: ADMIN.filaConversacion,
            flexShrink: 0,
            boxSizing: 'border-box',
            borderBottom: `1px solid ${AD.lineaSuave}`,
            padding: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: activa ? AD.azul50 : undefined,
            opacity: t,
            transform: activa && apretar ? hundir(apretar * 0.4) : undefined,
          }}
        >
          <AvatarIniciales nombre={c.nombre} tamano={36} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 20 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: c.noLeida ? 700 : 500, color: c.noLeida ? AD.g900 : AD.g800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</span>
              <span style={{ fontSize: 11, color: AD.g400 }}>{c.fecha}</span>
            </div>
            <div style={{ marginTop: 2, height: 18, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <Anillo t={c.realce ?? 0} radio={8} style={{ gap: 6 }}>
                {c.solicitud && <span style={{ borderRadius: 99, padding: '1px 6px', fontWeight: 600, background: AD.ambar50, color: AD.ambar700 }}>Solicitud</span>}
                {c.teSigue && <span style={{ color: AD.g500 }}>Te sigue</span>}
              </Anillo>
            </div>
            <div style={{ marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12, lineHeight: '16px', color: c.noLeida ? AD.g800 : AD.g500 }}>
              {c.deGali && <span style={{ fontWeight: 500 }}>Gali: </span>}
              {c.vista}
            </div>
          </div>
          {c.noLeida && <span style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', background: AD.azul, flexShrink: 0 }} />}
        </div>
      );
    })}
  </>
);

export type MensajeChat = {
  texto: string;
  /** Lo escribió Gali (va a la derecha, en azul). */
  mio: boolean;
  /** Quién lo envió: el admin, o «Desde la app de TikTok». */
  autor?: string;
  hora: string;
  enviando?: boolean;
  realceEtiqueta?: number;
};

/** Centro del botón de enviar y de la caja de escribir (la caja crece hacia arriba; el botón queda abajo). */
export const cajaChat = (alto: number) => {
  const y = alto - ADMIN.pad - 1 - 10 - 20;
  return { enviar: { x: ADMIN.x1 - 1 - 12 - 20, y }, caja: { x: (xSeccion + ADMIN.x1) / 2 - 20, y } };
};

/**
 * Columna derecha de los mensajes directos: encabezado de la persona, el chat (ChatThread: día, etiqueta con su nombre,
 * burbujas y debajo «autor · hora»), el aviso de la ventana de 48 h y la caja para escribir (ChatComposer).
 * `abajo` muestra el final del chat (como cuando la app baja al último mensaje).
 */
export const ChatTikTok: FC<{
  nombre: string;
  solicitud?: boolean;
  teSigue?: boolean;
  dia: string;
  mensajes: MensajeChat[];
  ventana: string | null;
  realceVentana?: number;
  borrador: string;
  caret?: boolean;
  apretarEnviar?: number;
  abajo?: boolean;
}> = ({ nombre, solicitud, teSigue, dia, mensajes, ventana, realceVentana = 0, borrador, caret, apretarEnviar = 0, abajo }) => {
  const puede = borrador.trim().length > 0;
  const primero = nombre.split(' ')[0];
  return (
    <>
      <div style={{ height: ADMIN.cabeceraChat, flexShrink: 0, boxSizing: 'border-box', borderBottom: `1px solid ${AD.linea}`, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarIniciales nombre={nombre} tamano={40} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: AD.g900 }}>{nombre}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px', color: AD.g500 }}>
            {teSigue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserPlus size={12} /> Te sigue
              </span>
            )}
            {solicitud && <span style={{ color: AD.ambar700 }}>Solicitud de mensaje</span>}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: abajo ? 'flex-end' : 'flex-start', background: '#fff' }}>
        <div style={{ padding: '16px 14px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: AD.tinta3, background: AD.bgAlt, borderRadius: 99, padding: '3px 10px' }}>{dia}</span>
          </div>
          {mensajes.map((m, k) => {
            const previo = mensajes[k - 1];
            const mismoLado = !!previo && previo.mio === m.mio;
            return (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: m.mio ? 'flex-end' : 'flex-start', marginTop: k === 0 ? 0 : mismoLado ? 3 : 10 }}>
                {!m.mio && !mismoLado && <span style={{ fontSize: 11, fontWeight: 600, color: AD.tinta3, margin: '0 4px 3px' }}>{primero}</span>}
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '8px 12px',
                    borderRadius: 16,
                    borderBottomRightRadius: m.mio ? 6 : 16,
                    borderBottomLeftRadius: m.mio ? 16 : 6,
                    background: m.mio ? AD.azul : AD.bgAlt,
                    color: m.mio ? '#fff' : AD.tinta,
                    border: m.mio ? 'none' : `1px solid ${AD.linea}`,
                    fontSize: 14,
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                    opacity: m.enviando ? 0.6 : 1,
                  }}
                >
                  {m.texto}
                </div>
                <Anillo t={m.realceEtiqueta ?? 0} radio={6} style={{ margin: '3px 6px 0' }}>
                  <span style={{ fontSize: 10.5, color: AD.tinta3 }}>{m.enviando ? 'Enviando…' : [m.mio ? m.autor : null, m.hora].filter(Boolean).join(' · ')}</span>
                </Anillo>
              </div>
            );
          })}
        </div>
      </div>
      {ventana && (
        <Anillo t={realceVentana} radio={8} margen={-4} bloque>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 6, borderTop: `1px solid ${AD.linea}`, padding: '6px 12px', fontSize: 11.5, lineHeight: '17px', color: AD.g500 }}>
            <Clock size={12} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{ventana}</span>
          </div>
        </Anillo>
      )}
      <div style={{ borderTop: `1px solid ${AD.linea}`, background: '#fff', padding: '10px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div
            style={{
              flex: 1,
              minHeight: 40,
              boxSizing: 'border-box',
              padding: '9px 12px',
              borderRadius: 12,
              border: `1px solid ${caret ? '#93c5fd' : AD.borde}`,
              boxShadow: caret ? '0 0 0 2px rgba(37,99,235,0.12)' : undefined,
              background: AD.hundido,
              fontSize: 14,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              color: AD.tinta,
            }}
          >
            {borrador}
            {caret && <Caret alto={19} />}
            {!borrador && <span style={{ color: AD.tinta3 }}>Responder desde la cuenta de TikTok de Gali…</span>}
          </div>
          <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, display: 'grid', placeItems: 'center', background: puede ? AD.azul : '#E2E8F0', color: puede ? '#fff' : AD.tinta3, transform: hundir(apretarEnviar) }}>
            <SendHorizontal size={18} />
          </span>
        </div>
      </div>
    </>
  );
};

/** Columna derecha sin conversación elegida. */
export const SinConversacion: FC = () => <Vacio>Elige una conversación de la lista.</Vacio>;

// --- Autorización de TikTok -----------------------------------------------------------------------------------------------------

export type PermisoTikTok = { texto: string; nombre: string };

const TARJETA_AUT = { ancho: 520, arriba: 64, pad: 28 };
/** Centro del botón «Autorizar» y caja de la lista de permisos (para acercar la cámara). */
export const AUTORIZAR = {
  boton: { x: 640 + 6 + (TARJETA_AUT.ancho - 2 * TARJETA_AUT.pad - 12) / 4, y: TARJETA_AUT.arriba + 403 + 22 },
  lista: { x: 640, y: TARJETA_AUT.arriba + 185 + 100 },
};

/**
 * Página de autorización de TikTok (www.tiktok.com/v2/auth/authorize) a la que lleva «Conectar con TikTok»: la app pide
 * permiso a la cuenta de empresa y muestra lo que podrá hacer. Dibujo genérico, sin el logo de TikTok.
 */
export const AutorizacionTikTok: FC<{ alto: number; app: string; cuenta: string; permisos: PermisoTikTok[]; apretar?: number; realceLista?: number }> = ({ alto, app, cuenta, permisos, apretar = 0, realceLista = 0 }) => {
  const { ancho, arriba, pad } = TARJETA_AUT;
  const anchoBoton = (ancho - 2 * pad - 12) / 2;
  return (
    <div style={{ position: 'relative', width: ADMIN.ancho, height: alto, background: '#F1F1F2', fontFamily: instrument, color: '#161823', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 48, background: '#fff', borderBottom: '1px solid #E3E3E4', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
        <span style={{ fontFamily: schibsted, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>TikTok</span>
        <span style={{ marginLeft: 12, fontSize: 13, color: '#75767C' }}>for Business</span>
      </div>
      <div style={{ position: 'absolute', left: (ADMIN.ancho - ancho) / 2, top: arriba, width: ancho, boxSizing: 'border-box', padding: pad, borderRadius: 16, background: '#fff', border: '1px solid #E3E3E4', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', boxShadow: '0 0 0 1px #E3E3E4', display: 'grid', placeItems: 'center' }}>
            <Isotipo tamano={36} />
          </span>
          <span style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2].map((k) => (
              <span key={k} style={{ width: 5, height: 5, borderRadius: '50%', background: '#B9BABE' }} />
            ))}
          </span>
          <span style={{ width: 48, height: 48, borderRadius: '50%', background: '#161823', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: schibsted, fontWeight: 800, fontSize: 15 }}>Tk</span>
        </div>
        <div style={{ marginTop: 14, height: 24, textAlign: 'center', fontSize: 18, fontWeight: 700, lineHeight: '24px' }}>{app} quiere acceder a tu cuenta</div>
        <div style={{ marginTop: 2, height: 18, textAlign: 'center', fontSize: 13, color: '#75767C' }}>@{cuenta} · Cuenta de empresa</div>
        <div style={{ marginTop: 14, height: 1, background: '#EDEDEE' }} />
        <div style={{ marginTop: 12, height: 18, fontSize: 13, fontWeight: 600, color: '#545559' }}>{app} podrá:</div>
        <Anillo t={realceLista} radio={10} bloque style={{ marginTop: 6 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {permisos.map((p) => (
              <div key={p.nombre} style={{ height: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#E8F7EE', color: '#11A35C', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, lineHeight: '18px', fontWeight: 500 }}>{p.texto}</span>
                  <span style={{ display: 'block', fontSize: 11, lineHeight: '15px', color: '#8A8B91', fontFamily: jetbrains }}>{p.nombre}</span>
                </span>
              </div>
            ))}
          </div>
        </Anillo>
        <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
          <span style={{ width: anchoBoton, height: 44, borderRadius: 8, background: '#F1F1F2', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 600 }}>Cancelar</span>
          <span style={{ width: anchoBoton, height: 44, borderRadius: 8, background: '#FE2C55', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 600, transform: hundir(apretar) }}>Autorizar</span>
        </div>
      </div>
    </div>
  );
};
