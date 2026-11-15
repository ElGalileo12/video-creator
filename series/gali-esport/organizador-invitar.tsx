// El organizador invita entrenadores (diseño actual de la app, colores --o-*), desde `organizador-torneo`.
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Invitaciones: app/(dashboard)/organizer/tournaments/[id]/invitations/InvitationsClient.tsx (tarjetas con su estado,
//   «Reenviar» / «Eliminar», «Link de inscripción» y «Resumen»).
// - Panel «Invitar Coach»: tournaments/[id]/InviteCoachModal.tsx + InviteContactsDrawer.tsx (520 px a la derecha, pestañas
//   «De mi lista» / «Invitar nuevo», etiqueta «sin cuenta», «Enviar (N) invitaciones», mensajes verde y rojo).
// - El error para un correo sin cuenta: app/api/tournaments/[id]/invitations/route.ts.
// - Equipos: tournaments/[id]/teams/TeamsClient.tsx. Contactos: organizer/coaches/ContactsClient.tsx.
// No se muestran ni se tocan «Link de inscripción», «Importar CSV» ni «Enviar mensaje al coach» (no funcionan bien): si
// salen en el diseño quedan quietos. Medidas en píxeles de la página de 1440 (organizador-panel.tsx).
import { Archive, CheckSquare, Copy, Gamepad2, Link2, Mail, MoreHorizontal, RefreshCw, Search, Send, Square, Star, Trash2, Trophy, Upload, UserPlus, Users, Users2, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { schibsted } from './letras';
import { ANCHO_O, anilloO, cajaO, COLUMNAS_O, O, SIDE_O, X0_O, Y_CONTENIDO_O } from './organizador-panel';

// =============================================================================================================
// Datos de ejemplo (inventados, correos @ejemplo.com)
// =============================================================================================================

export type ContactoO = { id: string; nombre: string; correo: string; equipo: string | null; cuenta: boolean; favorito: boolean; veces: number; ultima: string };
const c = (id: string, nombre: string, correo: string, equipo: string | null, favorito: boolean, veces: number, ultima: string, cuenta = true): ContactoO => ({ id, nombre, correo, equipo, cuenta, favorito, veces, ultima });

/** «De mi lista» antes de invitar (favoritos primero, luego la última invitación, como la app). */
export const LISTA_O: ContactoO[] = [
  c('carlos', 'Carlos Rodríguez', 'carlos.rodriguez@ejemplo.com', 'Academia Fénix Bogotá', true, 2, '3 oct 2026'),
  c('diana', 'Diana Salazar', 'diana.salazar@ejemplo.com', 'Club Halcones', true, 2, '3 oct 2026'),
  c('felipe', 'Felipe Arango', 'felipe.arango@ejemplo.com', 'Deportivo Norte', false, 1, '3 oct 2026'),
  c('andres', 'Andrés Peña', 'andres.pena@ejemplo.com', null, false, 1, '15 ago 2026', false),
  c('jorge', 'Jorge Méndez', 'jorge.mendez@ejemplo.com', 'Escuela Tiburones', false, 1, '14 jun 2026'),
  c('natalia', 'Natalia Ríos', 'natalia.rios@ejemplo.com', 'Leones FC', false, 1, '14 jun 2026'),
];
/** Los cuatro que se marcan (no Felipe ni Andrés Peña, que no tiene cuenta). */
export const MARCADOS_O = ['carlos', 'diana', 'jorge', 'natalia'];

export const CAMILA_O = { nombre: 'Camila Torres', correo: 'camila.torres@ejemplo.com', equipo: 'Águilas FC' };
export const NUEVO_O = { nombre: 'Julián Vargas', correo: 'nuevo.entrenador@ejemplo.com' };
export const ERROR_SIN_CUENTA = 'Ese correo no pertenece a un entrenador registrado. Pídele que cree su cuenta y su equipo antes de invitarlo.';

/** La libreta de Contactos al final del video. */
export const CONTACTOS_O: ContactoO[] = [
  c('carlos', 'Carlos Rodríguez', 'carlos.rodriguez@ejemplo.com', 'Academia Fénix Bogotá', true, 3, '12 nov 2026'),
  c('diana', 'Diana Salazar', 'diana.salazar@ejemplo.com', 'Club Halcones', true, 3, '12 nov 2026'),
  c('julian', NUEVO_O.nombre, NUEVO_O.correo, null, false, 1, '12 nov 2026'),
  c('camila', CAMILA_O.nombre, CAMILA_O.correo, null, false, 1, '12 nov 2026'),
  c('jorge', 'Jorge Méndez', 'jorge.mendez@ejemplo.com', 'Escuela Tiburones', false, 2, '12 nov 2026'),
  c('natalia', 'Natalia Ríos', 'natalia.rios@ejemplo.com', 'Leones FC', false, 2, '12 nov 2026'),
  c('felipe', 'Felipe Arango', 'felipe.arango@ejemplo.com', 'Deportivo Norte', false, 1, '3 oct 2026'),
  c('andres', 'Andrés Peña', 'andres.pena@ejemplo.com', null, false, 1, '15 ago 2026', false),
];

export type EstadoInvO = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type InvitacionO = { id: string; nombre: string; correo: string; estado: EstadoInvO };

// =============================================================================================================
// Piezas
// =============================================================================================================

const TARJETA: CSSProperties = { background: O.surface, border: `1px solid ${O.line}`, borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)', boxSizing: 'border-box' };
const PALETA = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#db2777', '#ca8a04', '#2563eb', '#9333ea'];
const colorDe = (k: string) => {
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return PALETA[h % PALETA.length];
};
const oscurecer = (hex: string, d: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, v + d));
  return '#' + ((f(n >> 16) << 16) | (f((n >> 8) & 0xff) << 8) | f(n & 0xff)).toString(16).padStart(6, '0');
};
const iniciales = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const AvatarDegradado: FC<{ nombre: string; tam?: number; radio?: number | string }> = ({ nombre, tam = 40, radio = '50%' }) => {
  const k = colorDe(nombre);
  return (
    <span style={{ width: tam, height: tam, borderRadius: radio, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: tam * 0.36, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${k} 0%, ${oscurecer(k, -18)} 100%)` }}>
      {iniciales(nombre)}
    </span>
  );
};
/** Avatar de un contacto: iniciales sobre el acento suave. */
const AvatarContacto: FC<{ nombre: string; tam?: number; color?: string }> = ({ nombre, tam = 32, color = O.accentText }) => (
  <div style={{ width: tam, height: tam, borderRadius: '50%', background: `color-mix(in srgb, ${color} 13%, transparent)`, color, display: 'grid', placeItems: 'center', fontSize: tam * 0.36, fontWeight: 700, flexShrink: 0 }}>{iniciales(nombre)}</div>
);

const PILL_INV: Record<EstadoInvO, { l: string; color: string; bg: string }> = {
  PENDING: { l: 'Pendiente', color: O.waitFg, bg: O.waitBg },
  ACCEPTED: { l: 'Aceptada', color: O.okFg, bg: O.okBg },
  REJECTED: { l: 'Rechazada', color: O.outFg, bg: O.outBg },
};
const Pildora: FC<{ l: string; color: string; bg: string; punto?: boolean; resalte?: number }> = ({ l, color, bg, punto = true, resalte }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color, flexShrink: 0, boxShadow: anilloO(resalte) }}>
    {punto && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
    {l}
  </span>
);
const SinCuenta: FC = () => <span style={{ fontSize: 10, fontWeight: 600, color: O.ink3, background: O.bgAlt, borderRadius: 6, padding: '1px 5px' }}>sin cuenta</span>;

const BotonAcento: FC<{ children: ReactNode; hover?: number; apretar?: number; resalte?: number; style?: CSSProperties }> = ({ children, hover = 0, apretar = 0, resalte, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, background: O.accent, color: O.onAccent, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', boxSizing: 'border-box', boxShadow: [anilloO(resalte), '0 6px 16px rgba(2,132,199,0.22)'].filter(Boolean).join(', '), filter: hover > 0.5 ? 'brightness(1.08)' : undefined, transform: `scale(${1 - apretar * 0.05})`, ...style }}>{children}</div>
);

// =============================================================================================================
// Invitaciones
// =============================================================================================================

const Y0 = Y_CONTENIDO_O;
const IZQ = COLUMNAS_O.izq.ancho;
const ANCHO_TARJETA = (IZQ - 12) / 2;
/** Medidas de la pestaña Invitaciones. */
export const INVITACIONES_O = {
  titulo: cajaO(X0_O, Y0, 360, 49),
  invitar: cajaO(X0_O + IZQ - 145, Y0 + 11, 145, 38),
  vacio: cajaO(X0_O, Y0 + 69, IZQ, 264),
  vacioBoton: cajaO(X0_O + IZQ / 2 - 72, Y0 + 69 + 48 + 56 + 14 + 21 + 4 + 19 + 16, 145, 38),
  tarjeta: (i: number) => cajaO(X0_O + (i % 2) * (ANCHO_TARJETA + 12), Y0 + 69 + Math.floor(i / 2) * 128, ANCHO_TARJETA, 116),
  reenviar: (i: number) => {
    const t = INVITACIONES_O.tarjeta(i);
    return cajaO(t.x + 15, t.y + 69, (ANCHO_TARJETA - 30 - 6) / 2, 32);
  },
  enlace: cajaO(COLUMNAS_O.der.x, Y0, 340, 146),
  resumen: cajaO(COLUMNAS_O.der.x, Y0 + 162, 340, 190),
};

export type DatosInvitacionesO = {
  invitaciones: InvitacionO[];
  /** Cada tarjeta entra (id → 0..1). */
  entra?: Record<string, number>;
  hover?: { invitar?: number; reenviar?: number };
  apretar?: { invitar?: number; reenviar?: number };
  /** Tarjeta (índice) cuyo «Reenviar» tiene el mouse encima. */
  reenviarEn?: number;
  resalte?: Partial<Record<'invitar' | 'resumen' | 'tarjetas' | 'titulo', number>>;
  /** Resalte de la píldora de estado de una tarjeta (id → 0..1). */
  resalteEstado?: Record<string, number>;
};

export const PaginaInvitacionesO: FC<{ d: DatosInvitacionesO }> = ({ d }) => {
  const I = INVITACIONES_O;
  const r = d.resalte ?? {};
  const cuenta = (e: EstadoInvO) => d.invitaciones.filter((i) => i.estado === e).length;
  return (
    <>
      <div style={{ position: 'absolute', left: I.titulo.x, top: I.titulo.y, borderRadius: 10, boxShadow: anilloO(r.titulo) }}>
        <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: O.ink, lineHeight: '26px' }}>Invitaciones</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: O.ink3 }}>Coaches invitados a este torneo y su estado.</p>
      </div>
      <BotonAcento hover={d.hover?.invitar} apretar={d.apretar?.invitar} resalte={r.invitar} style={{ position: 'absolute', left: I.invitar.x, top: I.invitar.y, width: I.invitar.ancho, height: I.invitar.alto }}>
        <UserPlus size={15} /> Invitar coach
      </BotonAcento>

      {d.invitaciones.length === 0 ? (
        <div style={{ position: 'absolute', left: I.vacio.x, top: I.vacio.y, width: I.vacio.ancho, ...TARJETA, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: O.accentSoft, color: O.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Mail size={26} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: O.ink }}>Sin invitaciones</div>
          <div style={{ fontSize: 13, color: O.ink3, marginTop: 4, marginBottom: 16 }}>Invita coaches para que inscriban sus equipos en este torneo.</div>
          <BotonAcento style={{ width: 145, height: 38 }}>
            <UserPlus size={15} /> Invitar coach
          </BotonAcento>
        </div>
      ) : (
        d.invitaciones.map((inv, i) => {
          const t = I.tarjeta(i);
          const e = d.entra?.[inv.id] ?? 1;
          const p = PILL_INV[inv.estado];
          const pend = inv.estado === 'PENDING';
          const hv = d.reenviarEn === i ? d.hover?.reenviar ?? 0 : 0;
          const ap = d.reenviarEn === i ? d.apretar?.reenviar ?? 0 : 0;
          return (
            <div key={inv.id} style={{ position: 'absolute', left: t.x, top: t.y, width: t.ancho, height: t.alto, ...TARJETA, padding: 14, opacity: e, transform: `translateY(${(1 - e) * 14}px)`, boxShadow: [anilloO(r.tarjetas), TARJETA.boxShadow].filter(Boolean).join(', ') }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AvatarDegradado nombre={inv.nombre} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: O.ink, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.nombre}</div>
                  <div style={{ fontSize: 11.5, color: O.ink3, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={11} />
                    {inv.correo}
                  </div>
                </div>
                <Pildora {...p} resalte={d.resalteEstado?.[inv.id]} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
                {pend && (
                  <div style={{ flex: 1, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, background: hv > 0.5 ? O.accentLine : O.accentSoft, color: O.accentStrong, fontSize: 13, fontWeight: 600, transform: `scale(${1 - ap * 0.05})` }}>
                    <RefreshCw size={13} />
                    Reenviar
                  </div>
                )}
                <div style={{ flex: 1, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, color: O.outFg, fontSize: 13, fontWeight: 600 }}>
                  <Trash2 size={13} />
                  Eliminar
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Columna derecha */}
      <div style={{ position: 'absolute', left: I.enlace.x, top: I.enlace.y, width: 340, ...TARJETA, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontFamily: schibsted, fontSize: 14, fontWeight: 700, color: O.ink }}>Link de inscripción</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0, padding: '9px 12px', border: `1px solid ${O.line}`, borderRadius: 10, fontSize: 12, color: O.ink2, background: O.sunken, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>https://galiesport.com/t/3f9c2a71-8d4e-4b6a-9c15-2e7f0b5d4a18/join</div>
          <div style={{ width: 38, borderRadius: 10, background: O.accentSoft, color: O.accentStrong, display: 'grid', placeItems: 'center' }}>
            <Copy size={15} />
          </div>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: O.ink3 }}>Comparte este link para que coaches se inscriban directamente.</p>
      </div>
      <div style={{ position: 'absolute', left: I.resumen.x, top: I.resumen.y, width: 340, ...TARJETA, padding: 16, boxShadow: [anilloO(r.resumen), TARJETA.boxShadow].filter(Boolean).join(', ') }}>
        <h3 style={{ margin: '0 0 12px', fontFamily: schibsted, fontSize: 14, fontWeight: 700, color: O.ink }}>Resumen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(
            [
              ['Aceptadas', cuenta('ACCEPTED'), '#059669'],
              ['Pendientes', cuenta('PENDING'), '#d97706'],
              ['Rechazadas', cuenta('REJECTED'), O.outFg],
            ] as const
          ).map(([l, n, k]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: O.sunken, borderRadius: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: k }} />
              <span style={{ flex: 1, fontSize: 12.5, color: O.ink2, fontWeight: 500 }}>{l}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: O.ink }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// Panel «Invitar Coach» (InviteContactsDrawer con la configuración de coach)
// =============================================================================================================

const PX = ANCHO_O - 520;
const PIX = PX + 20;
const PIW = 480;
const AYUDA_NUEVO = 'Invita a un coach externo. Recibirá un email con un enlace de invitación al torneo y quedará guardado en tu lista para próximos torneos.';

/** Medidas del panel «Invitar Coach», según el alto `vh`, la pestaña, el mensaje de arriba y cuántos van marcados. */
export const INVITAR_O = (vh: number, tab: 'lista' | 'nuevo', mensaje: 'ninguno' | 'corto' | 'largo', marcados: number) => {
  const alto = mensaje === 'ninguno' ? 0 : mensaje === 'corto' ? 39 : 56;
  const yb = 96 + (alto ? 12 + alto : 0);
  const anchoLista = 98 + (marcados > 0 ? 28 : 0);
  const items = yb + 16 + 38 + 12 + (marcados > 0 ? 17 + 12 : 0);
  return {
    panel: cajaO(PX, 0, 520, vh),
    cerrar: cajaO(PX + 520 - 20 - 30, 14, 30, 30),
    tabLista: cajaO(PIX, 59, anchoLista, 37),
    tabNuevo: cajaO(PIX + anchoLista, 59, 116, 37),
    mensaje: cajaO(PIX, 96 + 12, PIW, alto),
    buscar: cajaO(PIX, yb + 16, PIW, 38),
    item: (i: number) => cajaO(PIX, items + i * 66, PIW, 54),
    lista: (n: number) => cajaO(PIX, items, PIW, n * 66 - 12),
    ayuda: cajaO(PIX, yb + 20, PIW, 40),
    campo: (i: number) => cajaO(PIX, yb + 76 + i * 76 + 22, PIW, 38),
    cancelar: cajaO(PIX, vh - 54, (PIW - 10) / 3, 38),
    enviar: cajaO(PIX + (PIW - 10) / 3 + 10, vh - 54, ((PIW - 10) * 2) / 3, 38),
    tab,
  };
};

export type DatosInvitarCoach = {
  t: number;
  tab: 'lista' | 'nuevo';
  /** Contactos que todavía no están invitados a este torneo. */
  disponibles: ContactoO[];
  marcados: string[];
  /** Cada fila que se va al enviar (id → 1..0). */
  sale?: Record<string, number>;
  mensaje?: { tipo: 'ok' | 'error'; texto: string; t: number } | null;
  nombre: string;
  correo: string;
  equipo: string;
  foco?: 'nombre' | 'correo' | 'equipo' | null;
  enviando?: boolean;
  filaHover?: string | null;
  hover?: Partial<Record<'enviar' | 'nuevo' | 'lista' | 'cancelar', number>>;
  apretar?: Partial<Record<'enviar' | 'nuevo' | 'cancelar', number>>;
  resalte?: Partial<Record<'tabLista' | 'tabNuevo' | 'lista' | 'enviar' | 'mensaje' | 'correo' | 'buscar', number>>;
};

const CampoNuevo: FC<{ label: string; valor: string; placeholder: string; foco?: boolean; resalte?: number }> = ({ label, valor, placeholder, foco, resalte }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: O.ink2, lineHeight: '17px' }}>{label}</label>
    <div style={{ height: 38, boxSizing: 'border-box', padding: '9px 12px', fontSize: 13, border: `1px solid ${foco ? O.accent : O.line}`, borderRadius: 8, color: valor ? O.ink : O.ink3, background: O.surface, boxShadow: [anilloO(resalte), foco ? `0 0 0 3px color-mix(in srgb, ${O.accent} 22%, transparent)` : null].filter(Boolean).join(', ') || undefined, whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {valor || placeholder}
      {foco && <span style={{ display: 'inline-block', width: 1.5, height: 15, marginLeft: 1, background: O.ink, verticalAlign: 'text-bottom' }} />}
    </div>
  </div>
);

export const PanelInvitarCoach: FC<{ d: DatosInvitarCoach; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const r = d.resalte ?? {};
  const n = d.marcados.length;
  const msg = d.mensaje && d.mensaje.t > 0 ? d.mensaje : null;
  const largo = msg && msg.texto.length > 70;
  const M = INVITAR_O(vh, d.tab, msg ? (largo ? 'largo' : 'corto') : 'ninguno', d.tab === 'lista' ? n : 0);
  const listo = d.tab === 'nuevo' || n > 0;
  const deshabilitado = d.enviando || !listo;
  const color = O.accentText;
  const pestana = (on: boolean): CSSProperties => ({ height: 37, boxSizing: 'border-box', padding: '8px 16px', borderBottom: `2px solid ${on ? color : 'transparent'}`, color: on ? color : O.ink3, fontWeight: on ? 600 : 400, fontSize: 13, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' });
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.4 * d.t})`, backdropFilter: `blur(${4 * d.t}px)`, zIndex: 100 }} />
      <div style={{ position: 'absolute', left: PX + (1 - d.t) * 540, top: 0, width: 520, height: vh, background: O.surface, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', zIndex: 101 }}>
        <div style={{ position: 'absolute', left: -PX, top: 0, width: ANCHO_O, height: vh }}>
          {/* Encabezado */}
          <div style={{ position: 'absolute', left: PX, top: 0, width: 520, height: 59, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${O.bgAlt}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users2 size={18} color={color} />
              <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 16, fontWeight: 600, color: O.ink }}>Invitar Coach</h2>
            </div>
            <div style={{ padding: 6, display: 'flex', color: O.ink3 }}>
              <X size={18} />
            </div>
          </div>
          {/* Pestañas */}
          <div style={{ position: 'absolute', left: PX, top: 59, width: 520, height: 37, boxSizing: 'border-box', borderBottom: `1px solid ${O.bgAlt}` }} />
          <div style={{ position: 'absolute', left: M.tabLista.x, top: 59, ...pestana(d.tab === 'lista'), boxShadow: anilloO(r.tabLista), borderRadius: (r.tabLista ?? 0) > 0 ? 8 : 0 }}>
            De mi lista
            {n > 0 && <span style={{ marginLeft: 6, background: color, color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{n}</span>}
          </div>
          <div style={{ position: 'absolute', left: M.tabNuevo.x, top: 59, ...pestana(d.tab === 'nuevo'), color: d.tab === 'nuevo' ? color : (h.nuevo ?? 0) > 0.5 ? O.ink2 : O.ink3, boxShadow: anilloO(r.tabNuevo), borderRadius: (r.tabNuevo ?? 0) > 0 ? 8 : 0, transform: `scale(${1 - (a.nuevo ?? 0) * 0.05})` }}>Invitar nuevo</div>

          {/* Mensaje (verde o rojo) */}
          {msg && (
            <div style={{ position: 'absolute', left: M.mensaje.x, top: M.mensaje.y, width: PIW, height: M.mensaje.alto, boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, background: msg.tipo === 'error' ? O.outBg : O.okBg, border: `1px solid ${msg.tipo === 'error' ? O.outLine : O.okLine}`, color: msg.tipo === 'error' ? O.outFg : '#16a34a', fontSize: 12, lineHeight: '17px', opacity: Math.min(1, msg.t * 1.5), boxShadow: anilloO(r.mensaje) }}>{msg.texto}</div>
          )}

          {d.tab === 'lista' ? (
            <>
              <div style={{ position: 'absolute', left: M.buscar.x, top: M.buscar.y, width: PIW, height: 38, boxSizing: 'border-box', padding: '9px 12px 9px 32px', fontSize: 13, border: `1px solid ${O.line}`, borderRadius: 8, color: O.ink3, boxShadow: anilloO(r.buscar) }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: 12, color: O.ink3 }} />
                Buscar por nombre, email o equipo…
              </div>
              {n > 0 && <div style={{ position: 'absolute', left: PIX, top: M.buscar.y + 38 + 12, fontSize: 12, lineHeight: '17px', color }}>Limpiar selección ({n})</div>}
              <div style={{ position: 'absolute', left: M.lista(1).x - 6, top: M.lista(1).y - 6, width: PIW + 12, height: d.disponibles.length * 66 - 12 + 12, borderRadius: 14, boxShadow: anilloO(r.lista) }} />
              {d.disponibles.map((k, i) => {
                const it = M.item(i);
                const sel = d.marcados.includes(k.id);
                const sale = d.sale?.[k.id] ?? 1;
                const hv = d.filaHover === k.id;
                return (
                  <div
                    key={k.id}
                    style={{
                      position: 'absolute',
                      left: it.x,
                      top: it.y,
                      width: it.ancho,
                      height: it.alto,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1px solid ${sel ? color : hv ? O.accentLine : O.line}`,
                      background: sel ? `color-mix(in srgb, ${color} 3%, transparent)` : O.surface,
                      opacity: sale,
                      transform: `scale(${0.96 + 0.04 * sale})`,
                    }}
                  >
                    <AvatarContacto nombre={k.nombre} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: O.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {k.favorito && <Star size={12} fill="#f59e0b" color="#f59e0b" />}
                        {k.nombre}
                        {!k.cuenta && <SinCuenta />}
                      </div>
                      <div style={{ fontSize: 11, color: O.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {k.correo}
                        {k.equipo ? ` · ${k.equipo}` : ''}
                      </div>
                    </div>
                    {sel ? <CheckSquare size={18} color={color} /> : <Square size={18} color={O.line} />}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <p style={{ position: 'absolute', left: PIX, top: M.ayuda.y, width: PIW, margin: 0, fontSize: 13, lineHeight: '20px', color: O.ink3 }}>{AYUDA_NUEVO}</p>
              {(
                [
                  ['Nombre del coach', d.nombre, 'Ej: Carlos Ramírez', 'nombre'],
                  ['Email *', d.correo, 'coach@email.com', 'correo'],
                  ['Nombre del equipo', d.equipo, 'Ej: Tiburones FC', 'equipo'],
                ] as const
              ).map(([l, v, p, k], i) => (
                <div key={l} style={{ position: 'absolute', left: PIX, top: M.campo(i).y - 22, width: PIW }}>
                  <CampoNuevo label={l} valor={v} placeholder={p} foco={d.foco === k} resalte={k === 'correo' ? r.correo : 0} />
                </div>
              ))}
            </>
          )}

          {/* Pie */}
          <div style={{ position: 'absolute', left: PX, top: vh - 71, width: 520, height: 71, boxSizing: 'border-box', borderTop: `1px solid ${O.bgAlt}` }} />
          <div style={{ position: 'absolute', left: M.cancelar.x, top: M.cancelar.y, width: M.cancelar.ancho, height: 38, boxSizing: 'border-box', borderRadius: 10, border: `1px solid ${O.line}`, background: (h.cancelar ?? 0) > 0.5 ? O.sunken : O.surface, color: O.ink2, fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center', transform: `scale(${1 - (a.cancelar ?? 0) * 0.05})` }}>Cancelar</div>
          <div
            style={{
              position: 'absolute',
              left: M.enviar.x,
              top: M.enviar.y,
              width: M.enviar.ancho,
              height: 38,
              borderRadius: 10,
              background: deshabilitado ? O.line : color,
              color: deshabilitado ? O.ink3 : O.surface,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              filter: (h.enviar ?? 0) > 0.5 && !deshabilitado ? 'brightness(1.12)' : undefined,
              transform: `scale(${1 - (a.enviar ?? 0) * 0.05})`,
              boxShadow: anilloO(r.enviar),
            }}
          >
            <UserPlus size={14} />
            {d.enviando ? 'Enviando…' : d.tab === 'lista' ? `Enviar ${n > 0 ? `(${n})` : ''} invitación${n !== 1 ? 'es' : ''}` : 'Enviar invitación'}
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// Equipos
// =============================================================================================================

export type EquipoO = { equipo: string; coach: string };
export const ACEPTADOS_O: EquipoO[] = [
  { equipo: 'Academia Fénix Bogotá', coach: 'Carlos Rodríguez' },
  { equipo: 'Club Halcones', coach: 'Diana Salazar' },
  { equipo: 'Águilas FC', coach: CAMILA_O.nombre },
];
export const EQUIPOS_O = {
  cupo: cajaO(X0_O, Y0, IZQ, 108),
  distribucion: cajaO(COLUMNAS_O.der.x, Y0, 340, 266),
  lista: cajaO(X0_O, Y0 + 192, IZQ, 24 + 10 + 3 * 61 + 2),
};

export const PaginaEquiposO: FC<{ aceptados: EquipoO[]; maximo: number; entra?: number; resalte?: { cupo?: number; distribucion?: number; lista?: number } }> = ({ aceptados, maximo, entra = 1, resalte = {} }) => {
  const n = aceptados.length;
  const pct = maximo ? (n / maximo) * 100 : 0;
  const disponible = Math.max(0, maximo - n);
  const R = 52;
  const circ = 2 * Math.PI * R;
  const segs = [
    { v: n, color: '#10b981', l: 'Aceptados' },
    { v: 0, color: '#f59e0b', l: 'Pendientes' },
    { v: disponible, color: O.line, l: 'Disponible' },
  ];
  const total = segs.reduce((s, x) => s + x.v, 0) || 1;
  let acum = 0;
  return (
    <div style={{ opacity: entra }}>
      {/* Cupo */}
      <div style={{ position: 'absolute', left: EQUIPOS_O.cupo.x, top: EQUIPOS_O.cupo.y, width: IZQ, height: 108, ...TARJETA, padding: 18, display: 'flex', alignItems: 'center', gap: 18, boxShadow: [anilloO(resalte.cupo), TARJETA.boxShadow].filter(Boolean).join(', ') }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: O.accentSoft, color: O.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Users size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 6px', fontFamily: schibsted, fontSize: 17, fontWeight: 700, color: O.ink, letterSpacing: '-0.02em' }}>Equipos inscritos</h3>
          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: O.ink2 }}>
            <span>
              <strong style={{ color: O.ink }}>{n}</strong> aceptados
            </span>
            <span>·</span>
            <span>
              <strong style={{ color: O.ink }}>0</strong> pendientes
            </span>
            <span>·</span>
            <span>
              Máximo <strong style={{ color: O.ink }}>{maximo}</strong>
            </span>
          </div>
          <div style={{ marginTop: 12, height: 8, background: O.bgAlt, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${O.accent}, ${O.accentStrong})`, borderRadius: 999 }} />
          </div>
        </div>
        <BotonAcento style={{ width: 145, height: 38 }}>
          <UserPlus size={15} /> Invitar coach
        </BotonAcento>
      </div>
      {/* Buscar y agrupar */}
      <div style={{ position: 'absolute', left: X0_O, top: Y0 + 128, width: IZQ, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color={O.ink3} style={{ position: 'absolute', left: 12, top: 14 }} />
          <div style={{ padding: '11px 13px 11px 36px', border: `1px solid ${O.line}`, borderRadius: 12, fontSize: 14, color: O.ink3, background: O.surface, height: 44, boxSizing: 'border-box' }}>Buscar equipo o coach…</div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: O.ink2 }}>
          Agrupar:
          <div style={{ display: 'inline-flex', padding: 3, background: O.surface, border: `1px solid ${O.line}`, borderRadius: 10 }}>
            <span style={{ background: O.accent, color: O.onAccent, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}>Por estado</span>
            <span style={{ color: O.ink2, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}>Lista</span>
          </div>
        </div>
      </div>
      {/* Aceptados */}
      <div style={{ position: 'absolute', left: X0_O, top: EQUIPOS_O.lista.y, width: IZQ, borderRadius: 16, boxShadow: anilloO(resalte.lista) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, height: 24 }}>
          <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: O.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aceptados</h3>
          <Pildora l={String(n)} color={O.okFg} bg={O.okBg} punto={false} />
        </div>
        <div style={{ ...TARJETA, overflow: 'hidden' }}>
          {aceptados.map((e, i) => (
            <div key={e.equipo} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', height: 61, boxSizing: 'border-box', borderTop: i ? `1px solid ${O.bgAlt}` : 'none' }}>
              <AvatarDegradado nombre={e.equipo} tam={36} radio={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: O.ink, letterSpacing: '-0.01em' }}>{e.equipo}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 12, color: O.ink3 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <AvatarDegradado nombre={e.coach} tam={18} />
                    {e.coach}
                  </span>
                  <span>·</span>
                  <span>Inscrito 12 nov</span>
                </div>
              </div>
              <span style={{ padding: '6px 8px', borderRadius: 10, border: `1px solid ${O.line}`, background: O.surface, color: O.ink2, fontSize: 12, fontWeight: 600 }}>Sin puesto ▾</span>
              <Pildora l="Aceptado" color={O.okFg} bg={O.okBg} />
              <span style={{ display: 'inline-flex', padding: 8, color: O.ink2 }}>
                <MoreHorizontal size={16} />
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Distribución */}
      <div style={{ position: 'absolute', left: EQUIPOS_O.distribucion.x, top: EQUIPOS_O.distribucion.y, width: 340, ...TARJETA, padding: 16, boxShadow: [anilloO(resalte.distribucion), TARJETA.boxShadow].filter(Boolean).join(', ') }}>
        <h3 style={{ margin: '0 0 12px', fontFamily: schibsted, fontSize: 14, fontWeight: 700, color: O.ink }}>Distribución</h3>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={60} cy={60} r={R} stroke={O.bgAlt} strokeWidth={14} fill="none" />
            {segs.map((s, i) => {
              const len = (s.v / total) * circ;
              const el = <circle key={i} cx={60} cy={60} r={R} stroke={s.color} strokeWidth={14} fill="none" strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-acum} transform="rotate(-90 60 60)" />;
              acum += len;
              return el;
            })}
            <text x={60} y={58} textAnchor="middle" style={{ fontSize: 18, fontWeight: 800, fill: O.ink, letterSpacing: '-0.025em' }}>
              {n}/{maximo}
            </text>
            <text x={60} y={76} textAnchor="middle" style={{ fontSize: 10, fill: O.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              EQUIPOS
            </text>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {segs.map((s) => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: O.ink2 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              <span style={{ flex: 1 }}>{s.l}</span>
              <span style={{ fontWeight: 700, color: O.ink }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Acceso rápido (quieto: «Importar CSV» y «Link de inscripción» no se tocan) */}
      <div style={{ position: 'absolute', left: COLUMNAS_O.der.x, top: Y0 + 282, width: 340, ...TARJETA, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontFamily: schibsted, fontSize: 14, fontWeight: 700, color: O.ink }}>Acceso rápido</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(
            [
              [UserPlus, 'Invitar desde lista', true],
              [Upload, 'Importar CSV', false],
              [Link2, 'Link de inscripción', false],
            ] as const
          ).map(([Icono, l, suave]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: suave ? O.accentSoft : O.surface, color: suave ? O.accentStrong : O.ink, border: `1px solid ${suave ? 'transparent' : O.line}` }}>
              <Icono size={15} /> {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================================================
// Contactos (la libreta del organizador)
// =============================================================================================================

const CX = SIDE_O + 28;
const CWC = ANCHO_O - SIDE_O - 56;
const Y_TABLA = 80 + 88 + 24 + 128 + 28 + 30 + 14 + 34 + 16;
const FILA_C = 61;
const COLS = '1fr 200px 160px 90px 120px 40px';
export const CONTACTOS_P = {
  header: cajaO(CX, 80, CWC, 88),
  stats: cajaO(CX, 80 + 88 + 24, CWC, 128),
  stat: (i: number) => {
    const fr = (CWC - 42) / 4.4;
    const x = CX + [0, fr + 14, 2 * fr + 28, 3 * fr + 42][i];
    return cajaO(x, 80 + 88 + 24, i === 3 ? fr * 1.4 : fr, 128);
  },
  tabla: cajaO(CX, Y_TABLA, CWC, 37 + 8 * FILA_C),
  fila: (i: number) => cajaO(CX, Y_TABLA + 37 + i * FILA_C, CWC, FILA_C),
  estrella: (i: number) => cajaO(CX + 16, Y_TABLA + 37 + i * FILA_C + 21, 19, 19),
};

export type DatosContactosO = {
  contactos: ContactoO[];
  favoritos: string[];
  /** La estrella que se enciende (id → 0..1). */
  prende?: Record<string, number>;
  hoverEstrella?: string | null;
  apretarEstrella?: number;
  resalte?: Partial<Record<'header' | 'tabla' | 'favoritos' | 'invitaciones' | 'stats' | 'fila', number>>;
  /** Fila resaltada (id). */
  filaResalte?: string | null;
};

const StatContacto: FC<{ r: { x: number; y: number; ancho: number; alto: number }; label: string; valor: number; sub: string; color: string; icono: ReactNode; resalte?: number }> = ({ r, label, valor, sub, color, icono, resalte }) => (
  <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, boxSizing: 'border-box', background: O.surface, border: `1px solid ${O.line}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: anilloO(resalte) }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: O.ink3 }}>{label}</span>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'grid', placeItems: 'center', color }}>{icono}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: O.ink, lineHeight: 1 }}>{valor}</div>
    <div style={{ fontSize: 11, color: O.ink3 }}>{sub}</div>
  </div>
);

export const PaginaContactosO: FC<{ d: DatosContactosO }> = ({ d }) => {
  const P = CONTACTOS_P;
  const r = d.resalte ?? {};
  const favs = d.contactos.filter((k) => d.favoritos.includes(k.id)).length;
  const conCuenta = d.contactos.filter((k) => k.cuenta).length;
  const total = d.contactos.reduce((s, k) => s + k.veces, 0);
  const top = [...d.contactos].sort((a, b) => b.veces - a.veces)[0];
  const chip = (on: boolean): CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? O.accent : O.line}`, background: on ? `color-mix(in srgb, ${O.accent} 8%, transparent)` : O.surface, color: on ? O.accentText : O.ink3, height: 30, boxSizing: 'border-box' });
  return (
    <>
      <div style={{ position: 'absolute', left: P.header.x, top: P.header.y, width: P.header.ancho, height: P.header.alto, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderRadius: 16, border: `1px solid ${O.line}`, background: O.surface, padding: '16px 20px', boxShadow: anilloO(r.header) }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <span style={{ width: 4, borderRadius: 99, background: O.accent }} />
          <div style={{ padding: '2px 0' }}>
            <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em', color: O.ink }}>Contactos</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: O.ink3, lineHeight: 1.43 }}>Tu libreta de coaches y jugadores. Cada invitación que envías queda guardada aquí para re-invitar con un clic.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: O.accent, color: O.onAccent, borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
          <UserPlus size={14} /> Añadir contacto
        </div>
      </div>
      <div style={{ position: 'absolute', left: P.stats.x - 6, top: P.stats.y - 6, width: P.stats.ancho + 12, height: P.stats.alto + 12, borderRadius: 18, boxShadow: anilloO(r.stats) }} />
      <StatContacto r={P.stat(0)} label="Coaches guardados" valor={d.contactos.length} sub={`${conCuenta} con cuenta`} color="#22c55e" icono={<Users2 size={16} />} />
      <StatContacto r={P.stat(1)} label="Favoritos" valor={favs} sub="marcados con estrella" color="#f59e0b" icono={<Star size={16} />} resalte={r.favoritos} />
      <StatContacto r={P.stat(2)} label="Invitaciones enviadas" valor={total} sub="acumuladas a estos contactos" color="#3b82f6" icono={<Send size={16} />} resalte={r.invitaciones} />
      {(() => {
        const s = P.stat(3);
        return (
          <div style={{ position: 'absolute', left: s.x, top: s.y, width: s.ancho, height: s.alto, boxSizing: 'border-box', background: O.nav, borderRadius: 14, padding: '18px 20px', color: '#fff', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Más invitado</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{top.nombre}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{top.veces} invitaciones</div>
          </div>
        );
      })()}
      {/* Tipo y barra */}
      <div style={{ position: 'absolute', left: CX, top: 80 + 88 + 24 + 128 + 28, display: 'flex', gap: 4 }}>
        <span style={chip(true)}>
          <Users2 size={13} /> Coaches
        </span>
        <span style={chip(false)}>
          <Gamepad2 size={13} /> Jugadores
        </span>
      </div>
      <div style={{ position: 'absolute', left: CX, top: 80 + 88 + 24 + 128 + 28 + 30 + 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: 320, height: 34, boxSizing: 'border-box', padding: '8px 12px 8px 32px', fontSize: 13, border: `1px solid ${O.line}`, borderRadius: 8, color: O.ink3, background: O.surface }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: 10, color: O.ink3 }} />
          Buscar por nombre, correo o equipo…
        </div>
        <span style={chip(false)}>
          <Star size={13} /> Solo favoritos
        </span>
        <span style={chip(false)}>
          <Archive size={13} /> Incluir archivados
        </span>
      </div>
      {/* Tabla */}
      <div style={{ position: 'absolute', left: P.tabla.x, top: P.tabla.y, width: P.tabla.ancho, background: O.surface, borderRadius: 14, border: `1px solid ${O.line}`, overflow: 'hidden', boxShadow: anilloO(r.tabla) }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 16px', height: 37, boxSizing: 'border-box', background: O.sunken, borderBottom: `1px solid ${O.line}`, fontSize: 11, fontWeight: 600, color: O.ink3, textTransform: 'uppercase', letterSpacing: '0.05em', gap: 8, alignItems: 'center' }}>
          <div>Coach</div>
          <div>Correo</div>
          <div>Equipo</div>
          <div>Invitado</div>
          <div>Última vez</div>
          <div />
        </div>
        {d.contactos.map((k) => {
          const fav = d.favoritos.includes(k.id);
          const prende = d.prende?.[k.id] ?? (fav ? 1 : 0);
          const hv = d.hoverEstrella === k.id;
          const res = d.filaResalte === k.id ? r.fila ?? 0 : 0;
          return (
            <div key={k.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 16px', height: FILA_C, boxSizing: 'border-box', borderBottom: `1px solid ${O.bgAlt}`, background: res > 0 ? `rgba(14,165,233,${0.06 * res})` : O.surface, alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ display: 'flex', padding: 2, color: prende > 0.5 ? '#f59e0b' : hv ? O.ink3 : O.line, transform: `scale(${1 + (d.prende?.[k.id] !== undefined ? Math.sin(Math.min(1, prende) * Math.PI) * 0.5 : 0) - (hv ? (d.apretarEstrella ?? 0) * 0.15 : 0)})` }}>
                  <Star size={15} fill={prende > 0.5 ? '#f59e0b' : 'none'} />
                </span>
                <AvatarContacto nombre={k.nombre} tam={36} color={O.accent} />
                <div style={{ fontSize: 13, fontWeight: 600, color: O.ink, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  {k.nombre}
                  {!k.cuenta && <SinCuenta />}
                </div>
              </div>
              <div style={{ fontSize: 12, color: O.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.correo}</div>
              <div style={{ fontSize: 12, color: O.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.equipo ?? '—'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: O.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Trophy size={12} color={O.line} />
                {k.veces}
              </div>
              <div style={{ fontSize: 12, color: O.ink3 }}>{k.ultima}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', color: O.ink3 }}>
                <MoreHorizontal size={15} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
