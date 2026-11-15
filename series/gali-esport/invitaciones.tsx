// Invitar coaches a un torneo y ver los equipos, como en la app (rol organizador). Código (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport/app/(dashboard)/organizer/tournaments/[id]/
// - Panel «Invitar Coach»: InviteCoachModal.tsx + InviteContactsDrawer.tsx (violeta #7c3aed; pestañas «De mi lista»
//   e «Invitar nuevo»; «Enviar (n) invitaciones» / «Enviar invitación»; avisos «n invitaciones enviadas» e
//   «Invitación enviada a …»).
// - Pestaña Invitaciones: invitations/InvitationsClient.tsx (tarjetas con estado Pendiente / Aceptada / Rechazada,
//   «Reenviar», «Eliminar» y el «Resumen»). No se muestra el «Link de inscripción» (no funciona todavía).
// - Pestaña Equipos: teams/TeamsClient.tsx («Equipos inscritos» con el cupo, Aceptados / Pendientes / Rechazados,
//   «Distribución»). De «Acceso rápido» solo va «Invitar desde lista» (sin «Importar CSV» ni «Link de inscripción»).
// - Plantilla: teams/TeamSquadDrawer.tsx (jugadores por posición y el entrenador).
// - Aviso abajo a la derecha: components/ui/toast.tsx.
// Todo en píxeles de la app (1440 × 1040); va dentro de `Pantalla`.
import { Check, CheckCircle, CheckSquare, Mail, MoreHorizontal, RefreshCw, Search, Square, Star, Trash2, UserCog, UserPlus, Users, Users2, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { apretado, Cursor, PANTALLA, type Punto } from './computador';
import { type Coach, degradadoDe, iniciales, type Jugador, SUB14 } from './equipos';
import { DETALLE } from './organizador';
import { CIELO, ESTADO, GRIS, LILA, PIZARRA, VIOLETA } from './tema';

// =============================================================================================================
// Panel «Invitar Coach»
// =============================================================================================================

export const PANEL_INV = { x: PANTALLA.ancho - 520, ancho: 520 };
/** Alturas del panel (en píxeles del panel). */
const P = { cabecera: 61, pestanas: 38.5, mensaje: 52, buscador: 39.5, limpiar: 30, fila: 58, hueco: 12, pie: 72.5 };
const CUERPO0 = P.cabecera + P.pestanas;
/** Anchos de las pestañas medidos con Montserrat 13 px. */
const TEXTO_TAB = { lista: [68.73, 70.82], nuevo: [84.59, 87.82] };

export type PestanaInv = 'lista' | 'nuevo';
/** Centro de la pestaña «De mi lista» o «Invitar nuevo» (en píxeles de la app). */
export const pestanaInv = (p: PestanaInv, activa: PestanaInv, seleccionados: number): Punto => {
  const badge = seleccionados > 0 ? 6 + 18.9 : 0;
  const lista = 16 + TEXTO_TAB.lista[activa === 'lista' ? 1 : 0] + badge + 16;
  const nuevo = 16 + TEXTO_TAB.nuevo[activa === 'nuevo' ? 1 : 0] + 16;
  return { x: PANEL_INV.x + 20 + (p === 'lista' ? lista / 2 : lista + nuevo / 2), y: P.cabecera + 19 };
};
/** Dónde empieza la fila `i` de la lista (en píxeles del panel). `mensaje` y `limpiar` van de 0 a 1. */
export const filaInvY = (i: number, mensaje = 0, limpiar = 0) => CUERPO0 + P.mensaje * mensaje + 16 + P.buscador + P.hueco + P.limpiar * limpiar + i * (P.fila + P.hueco);
/** Rectángulo de la fila `i` en píxeles de la app. */
export const filaInv = (i: number, mensaje = 0, limpiar = 0) => ({ x: PANEL_INV.x + 20, y: filaInvY(i, mensaje, limpiar), ancho: PANEL_INV.ancho - 40, alto: P.fila });
/** Centro del botón de enviar del pie. */
export const BOTON_ENVIAR: Punto = { x: PANEL_INV.x + 20 + (PANEL_INV.ancho - 40 - 10) / 3 + 10 + ((PANEL_INV.ancho - 40 - 10) * 2) / 3 / 2, y: PANTALLA.alto - P.pie + 1 + 16 + 19.75 };
/** Centro de cada campo de «Invitar nuevo» (0 nombre, 1 correo, 2 equipo). */
const CAMPO0 = CUERPO0 + 20 + 39 + 16;
export const campoNuevo = (i: number, mensaje = 0): Punto => ({ x: PANEL_INV.x + 20 + 160, y: CAMPO0 + P.mensaje * mensaje + i * (62.5 + 16) + 23 + 19.75 });

const ContactAvatar: FC<{ nombre: string; tamano?: number }> = ({ nombre, tamano = 32 }) => (
  <div style={{ width: tamano, height: tamano, borderRadius: '50%', background: `${VIOLETA}22`, color: VIOLETA, display: 'grid', placeItems: 'center', fontSize: tamano * 0.36, fontWeight: 700, flexShrink: 0 }}>{iniciales(nombre)}</div>
);

/** Una fila de la lista de contactos (también la usa el 3D para dibujar las tarjetas). */
export const FilaContacto: FC<{ c: Coach; marcado: boolean; style?: CSSProperties }> = ({ c, marcado, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid', borderColor: marcado ? VIOLETA : '#e9edf3', background: marcado ? `${VIOLETA}08` : '#fff', height: P.fila, boxSizing: 'border-box', ...style }}>
    <ContactAvatar nombre={c.nombre} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GRIS.g900, display: 'flex', alignItems: 'center', gap: 5, lineHeight: '19.5px' }}>
        {c.favorito && <Star size={12} fill="#f59e0b" color="#f59e0b" />}
        {c.nombre}
        {c.sinCuenta && <span style={{ fontSize: 10, fontWeight: 600, color: PIZARRA.s500, background: PIZARRA.s100, borderRadius: 6, padding: '1px 5px', lineHeight: '15px' }}>sin cuenta</span>}
      </div>
      <div style={{ fontSize: 11, color: PIZARRA.s500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '16.5px' }}>
        {c.email} · {c.equipo}
      </div>
    </div>
    {marcado ? <CheckSquare size={18} color={VIOLETA} /> : <Square size={18} color={PIZARRA.s300} />}
  </div>
);

export type PropsPanelInv = {
  f: number;
  /** 0 → 1: el panel entra desde la derecha (y el fondo se oscurece). */
  abierto: number;
  pestana: PestanaInv;
  /** Los contactos de la lista (los ya invitados no salen). */
  contactos: Coach[];
  /** Cuánto está marcado cada contacto (por id, 0 → 1). */
  marcados?: Record<string, number>;
  /** Filas que no se dibujan (están en 3D) pero guardan su lugar. */
  ocultas?: string[];
  /** Filas que se van (ya invitadas): 0 → 1 se encogen y desaparecen. */
  seVan?: { ids: string[]; t: number };
  nuevo?: { nombre: string; email: string; equipo: string; foco: number | null };
  /** El aviso verde de arriba (0 → 1). */
  mensaje?: { texto: string; t: number };
  apretarEnviar?: number;
  enviando?: boolean;
  /** Hover de una pestaña (0 → 1). */
  hoverPestana?: { p: PestanaInv; t: number };
  /** Fuerza «Limpiar selección (n)» (0 → 1), p. ej. para que se vaya suave al vaciar la selección. */
  limpiar?: { t: number; n: number };
};

const AYUDA_NUEVO = 'Invita a un coach externo. Recibirá un email con un enlace de invitación al torneo y quedará guardado en tu lista para próximos torneos.';
const CAMPOS = [
  { label: 'Nombre del coach', placeholder: 'Ej: Carlos Ramírez', clave: 'nombre' as const },
  { label: 'Email *', placeholder: 'coach@email.com', clave: 'email' as const },
  { label: 'Nombre del equipo', placeholder: 'Ej: Tiburones FC', clave: 'equipo' as const },
];

export const PanelInvitar: FC<PropsPanelInv> = ({ f, abierto, pestana, contactos, marcados = {}, ocultas = [], seVan, nuevo, mensaje, apretarEnviar = 0, enviando = false, hoverPestana, limpiar: forzado }) => {
  if (abierto <= 0) return null;
  const nMarcados = contactos.filter((c) => (marcados[c.id] ?? 0) > 0.5).length;
  const limpiar = pestana !== 'lista' ? 0 : forzado ? forzado.t : Math.min(1, contactos.reduce((m, c) => Math.max(m, (marcados[c.id] ?? 0) * 2), 0));
  const msg = mensaje?.t ?? 0;
  const desactivado = enviando || (pestana === 'lista' && nMarcados === 0);
  const tab = (activa: boolean, hover: number): CSSProperties => ({
    padding: '8px 16px',
    borderBottom: activa ? `2px solid ${VIOLETA}` : '2px solid transparent',
    color: activa ? VIOLETA : PIZARRA.s500,
    fontWeight: activa ? 600 : 400,
    fontSize: 13,
    lineHeight: '19.5px',
    whiteSpace: 'nowrap',
    background: hover > 0 ? `rgba(124,58,237,${0.06 * hover})` : 'none',
    borderRadius: '6px 6px 0 0',
  });
  // Posición de cada fila: las que se van encogen y suben a las de abajo.
  let acumulado = 0;
  const filas = contactos.map((c, i) => {
    const sale = seVan && seVan.ids.includes(c.id) ? seVan.t : 0;
    const y = filaInvY(i, msg, limpiar) - acumulado;
    acumulado += (P.fila + P.hueco) * sale;
    return { c, y, sale };
  });
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.4 * abierto})`, zIndex: 40 }} />
      <div style={{ position: 'absolute', top: 0, left: PANEL_INV.x + (1 - abierto) * PANEL_INV.ancho, width: PANEL_INV.ancho, height: PANTALLA.alto, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', zIndex: 41, overflow: 'hidden' }}>
        {/* Cabecera */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: P.cabecera, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${PIZARRA.s100}`, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users2 size={18} color={VIOLETA} />
            <div style={{ fontSize: 16, fontWeight: 600, color: GRIS.g900 }}>Invitar Coach</div>
          </div>
          <div style={{ padding: 6, display: 'flex', color: PIZARRA.s500 }}>
            <X size={18} />
          </div>
        </div>
        {/* Pestañas */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: P.cabecera, height: P.pestanas, display: 'flex', alignItems: 'flex-end', borderBottom: `1px solid ${PIZARRA.s100}`, padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={tab(pestana === 'lista', hoverPestana?.p === 'lista' ? hoverPestana.t : 0)}>
            De mi lista
            {nMarcados > 0 && <span style={{ marginLeft: 6, background: VIOLETA, color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{nMarcados}</span>}
          </div>
          <div style={tab(pestana === 'nuevo', hoverPestana?.p === 'nuevo' ? hoverPestana.t : 0)}>Invitar nuevo</div>
        </div>
        {/* Aviso verde */}
        {msg > 0 && (
          <div style={{ position: 'absolute', left: 20, right: 20, top: CUERPO0 + 12, padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 12, lineHeight: '18px', opacity: msg, transform: `translateY(${(1 - msg) * -8}px)` }}>{mensaje?.texto}</div>
        )}
        {/* Cuerpo */}
        {pestana === 'lista' ? (
          <>
            <div style={{ position: 'absolute', left: 20, right: 20, top: CUERPO0 + P.mensaje * msg + 16, height: P.buscador, border: `1px solid ${PIZARRA.s200}`, borderRadius: 8, boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 32, fontSize: 13, color: '#9ca3af' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, color: PIZARRA.s400 }} />
              Buscar por nombre, email o equipo…
            </div>
            {limpiar > 0 && (
              <div style={{ position: 'absolute', left: 20, top: CUERPO0 + P.mensaje * msg + 16 + P.buscador + P.hueco, fontSize: 12, lineHeight: '18px', color: VIOLETA, opacity: limpiar }}>Limpiar selección ({forzado ? forzado.n : nMarcados})</div>
            )}
            {filas.map(({ c, y, sale }) =>
              ocultas.includes(c.id) || sale >= 1 ? null : (
                <div key={c.id} style={{ position: 'absolute', left: 20, right: 20, top: y, opacity: 1 - sale, transform: `scale(${1 - 0.05 * sale})` }}>
                  <FilaContacto c={c} marcado={(marcados[c.id] ?? 0) > 0.5} />
                </div>
              ),
            )}
          </>
        ) : (
          <>
            <p style={{ position: 'absolute', left: 20, right: 20, top: CUERPO0 + P.mensaje * msg + 20, margin: 0, fontSize: 13, lineHeight: '19.5px', color: PIZARRA.s500 }}>{AYUDA_NUEVO}</p>
            {CAMPOS.map((c, i) => {
              const valor = nuevo?.[c.clave] ?? '';
              const foco = nuevo?.foco === i;
              return (
                <div key={c.clave} style={{ position: 'absolute', left: 20, right: 20, top: CAMPO0 + P.mensaje * msg + i * (62.5 + 16), display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: GRIS.g700, lineHeight: '18px' }}>{c.label}</label>
                  <div style={{ padding: '9px 12px', fontSize: 13, lineHeight: '19.5px', border: `1px solid ${PIZARRA.s200}`, borderRadius: 8, color: valor ? GRIS.g900 : '#9ca3af', boxShadow: foco ? `0 0 0 2px ${VIOLETA}55` : 'none', height: 39.5, boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {valor || c.placeholder}
                    {foco && valor && <Cursor f={f} alto={16} />}
                  </div>
                </div>
              );
            })}
          </>
        )}
        {/* Pie */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: P.pie, display: 'flex', gap: 10, padding: '16px 20px', borderTop: `1px solid ${PIZARRA.s100}`, boxSizing: 'border-box', background: '#fff' }}>
          <div style={{ flex: 1, borderRadius: 10, border: `1px solid ${PIZARRA.s200}`, background: '#fff', color: GRIS.g700, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cancelar</div>
          <div style={{ flex: 2, borderRadius: 10, background: desactivado ? PIZARRA.s200 : apretarEnviar > 0 ? '#6d28d9' : VIOLETA, color: desactivado ? PIZARRA.s400 : '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: apretado(apretarEnviar) }}>
            <UserPlus size={14} />
            {enviando ? 'Enviando…' : pestana === 'lista' ? `Enviar ${nMarcados > 0 ? `(${nMarcados})` : ''} ${nMarcados !== 1 ? 'invitaciones' : 'invitación'}` : 'Enviar invitación'}
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================================================
// Pestaña Invitaciones
// =============================================================================================================

const TARJETA: CSSProperties = { background: '#fff', border: `1px solid ${LILA.borde}`, borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)' };
const BOTON_CIELO: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, background: CIELO.s600, color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(2,132,199,0.22)', lineHeight: '21px' };

export type EstadoInv = 'PENDING' | 'ACCEPTED' | 'REJECTED';
const ESTADO_INV: Record<EstadoInv, { label: string; c: { bg: string; color: string } }> = {
  PENDING: { label: 'Pendiente', c: ESTADO.ambar },
  ACCEPTED: { label: 'Aceptada', c: ESTADO.verde },
  REJECTED: { label: 'Rechazada', c: ESTADO.rojo },
};

/** Pastilla de estado con su punto. `resalte` (0 → 1) la agranda y le pone un halo. */
const Pastilla: FC<{ bg: string; color: string; punto?: boolean; resalte?: number; children: ReactNode }> = ({ bg, color, punto = true, resalte = 0, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: '18px', background: bg, color, flexShrink: 0, transform: `scale(${1 + 0.18 * resalte})`, boxShadow: resalte > 0 ? `0 0 0 ${4 * resalte}px ${color}33` : 'none' }}>
    {punto && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
    {children}
  </span>
);

const AvatarRedondo: FC<{ nombre: string; tamano?: number }> = ({ nombre, tamano = 40 }) => (
  <span style={{ width: tamano, height: tamano, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: tamano * 0.36, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em', background: degradadoDe(nombre) }}>{iniciales(nombre)}</span>
);

export type Invitacion = { c: Coach; estado: EstadoInv };

/** Medidas de la pestaña Invitaciones (en píxeles de la app). */
const INV = { cabecera: 53.5, tarjeta: 137.75, hueco: 12, ancho: (DETALLE.izquierda.ancho - 12) / 2 };
/** Rectángulo de la tarjeta `i` (dos columnas). */
export const tarjetaInv = (i: number) => ({ x: DETALLE.izquierda.x + (i % 2) * (INV.ancho + INV.hueco), y: DETALLE.cuerpo + INV.cabecera + 20 + Math.floor(i / 2) * (INV.tarjeta + INV.hueco), ancho: INV.ancho, alto: INV.tarjeta });
/** Centro del botón «Reenviar» de la tarjeta `i`. */
export const botonReenviar = (i: number): Punto => {
  const t = tarjetaInv(i);
  return { x: t.x + 15 + (INV.ancho - 30 - 6) / 4, y: t.y + 15 + 62.25 + 12 + 16.75 };
};
/** La tarjeta «Resumen» de la columna derecha. */
export const RESUMEN_INV = { x: DETALLE.derecha.x, y: DETALLE.cuerpo, ancho: DETALLE.derecha.ancho, alto: 166 };

export type PropsInvitaciones = {
  invitaciones: Invitacion[];
  /** Resalte de las pastillas por estado (0 → 1). */
  resalte?: Partial<Record<EstadoInv, number>>;
  /** El ratón encima de «Reenviar» de la tarjeta `i` y el botón apretado. */
  reenviar?: { i: number; hover: number; apretar: number };
};

/** El contenido de la pestaña Invitaciones (va como `children` de `PaginaDetalle`). */
export const PaginaInvitaciones: FC<PropsInvitaciones> = ({ invitaciones, resalte = {}, reenviar }) => {
  const cuenta = (e: EstadoInv) => invitaciones.filter((i) => i.estado === e).length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, height: INV.cabecera }}>
          <div>
            <div style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: LILA.texto, lineHeight: '30px' }}>Invitaciones</div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: LILA.tenue, lineHeight: '19.5px' }}>Coaches invitados a este torneo y su estado.</p>
          </div>
          <span style={BOTON_CIELO}>
            <UserPlus size={15} /> Invitar coach
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {invitaciones.map((inv, i) => {
            const cfg = ESTADO_INV[inv.estado];
            const r = reenviar?.i === i ? reenviar : undefined;
            return (
              <div key={inv.c.id} style={{ ...TARJETA, padding: 14, height: INV.tarjeta, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AvatarRedondo nombre={inv.c.nombre} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: LILA.texto, letterSpacing: '-0.01em', lineHeight: '21px', whiteSpace: 'nowrap' }}>{inv.c.nombre}</div>
                    <div style={{ fontSize: 12, color: LILA.tenue, marginTop: 2, lineHeight: '18px' }}>{inv.c.equipo}</div>
                    <div style={{ fontSize: 11.5, color: LILA.sutil, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, lineHeight: '17.25px', whiteSpace: 'nowrap' }}>
                      <Mail size={11} />
                      {inv.c.email}
                    </div>
                  </div>
                  <Pastilla {...cfg.c} resalte={resalte[inv.estado] ?? 0}>
                    {cfg.label}
                  </Pastilla>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  {inv.estado === 'PENDING' && (
                    <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: r && r.hover > 0 ? CIELO.s100 : CIELO.s50, color: CIELO.s700, fontSize: 13, fontWeight: 600, lineHeight: '19.5px', transform: apretado(r?.apretar ?? 0) }}>
                      <RefreshCw size={13} />
                      Reenviar
                    </span>
                  )}
                  <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, color: '#dc2626', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>
                    <Trash2 size={13} />
                    Eliminar
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...TARJETA, padding: 16 }}>
          <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: LILA.texto }}>Resumen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Aceptadas', n: cuenta('ACCEPTED'), color: ESTADO.verde.punto, e: 'ACCEPTED' as const },
              { label: 'Pendientes', n: cuenta('PENDING'), color: ESTADO.ambar.punto, e: 'PENDING' as const },
              { label: 'Rechazadas', n: cuenta('REJECTED'), color: ESTADO.rojo.punto, e: 'REJECTED' as const },
            ].map((s) => {
              const r = resalte[s.e] ?? 0;
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: r > 0 ? `color-mix(in srgb, ${s.color} ${12 * r}%, ${LILA.suave})` : LILA.suave, borderRadius: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: LILA.oscuro, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: LILA.texto }}>{s.n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================================================
// Pestaña Equipos y plantilla
// =============================================================================================================

export type EstadoEquipo = 'ACCEPTED' | 'PENDING' | 'REJECTED';
export type Inscrito = { c: Coach; estado: EstadoEquipo; fecha: string };

const AvatarEquipo: FC<{ nombre: string; tamano?: number }> = ({ nombre, tamano = 36 }) => (
  <span style={{ width: tamano, height: tamano, borderRadius: tamano <= 28 ? 8 : tamano >= 48 ? 12 : 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: tamano * 0.36, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em', background: degradadoDe(nombre) }}>{iniciales(nombre)}</span>
);

/** Medidas de la pestaña Equipos (en píxeles de la app). */
const EQ = { capacidad: 109, buscador: 45, cabeceraSeccion: 26 + 10, fila: 66, hueco: 20 };
/** Rectángulo de la tarjeta «Equipos inscritos». */
export const CAPACIDAD = { x: DETALLE.izquierda.x, y: DETALLE.cuerpo, ancho: DETALLE.izquierda.ancho, alto: EQ.capacidad };
/** Dónde empieza la sección `s` (0 aceptados, 1 pendientes, 2 rechazados) según cuántas filas tiene cada una. */
const seccionY = (s: number, filas: number[]) => {
  let y = DETALLE.cuerpo + EQ.capacidad + EQ.hueco + EQ.buscador + EQ.hueco;
  for (let k = 0; k < s; k++) if (filas[k] > 0) y += EQ.cabeceraSeccion + filas[k] * EQ.fila + (filas[k] - 1) + 2 + EQ.hueco;
  return y;
};
/** Centro de la fila `i` de la sección `s`. */
export const filaEquipo = (s: number, i: number, filas: number[]): Punto => ({ x: DETALLE.izquierda.x + 200, y: seccionY(s, filas) + EQ.cabeceraSeccion + 1 + i * (EQ.fila + 1) + EQ.fila / 2 });

const SeccionEquipos: FC<{ titulo: string; c: { bg: string; color: string }; equipos: Inscrito[]; hoverFila?: { id: string; t: number }; apretarFila?: { id: string; t: number } }> = ({ titulo, c, equipos, hoverFila, apretarFila }) =>
  equipos.length === 0 ? null : (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, height: 26 }}>
        <div style={{ margin: 0, fontSize: 12, fontWeight: 700, color: LILA.oscuro, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{titulo}</div>
        <Pastilla {...c} punto={false}>
          {equipos.length}
        </Pastilla>
      </div>
      <div style={{ ...TARJETA, padding: 0, overflow: 'hidden' }}>
        {equipos.map((e, i) => {
          const est = e.estado === 'ACCEPTED' ? { c: ESTADO.verde, label: 'Aceptado' } : e.estado === 'PENDING' ? { c: ESTADO.ambar, label: 'Pendiente' } : { c: ESTADO.rojo, label: 'Rechazado' };
          const hover = hoverFila?.id === e.c.id ? hoverFila.t : 0;
          const ap = apretarFila?.id === e.c.id ? apretarFila.t : 0;
          return (
            <div key={e.c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', height: EQ.fila, boxSizing: 'border-box', borderTop: i > 0 ? '1px solid #f1eef6' : 'none', background: hover > 0 ? `color-mix(in srgb, ${LILA.suave} ${100 * hover}%, #fff)` : 'transparent', transform: apretado(ap) }}>
              <AvatarEquipo nombre={e.c.equipo} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: LILA.texto, letterSpacing: '-0.01em', lineHeight: '21px' }}>{e.c.equipo}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 12, color: LILA.tenue, lineHeight: '18px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff', background: degradadoDe(e.c.nombre) }}>{iniciales(e.c.nombre)}</span>
                    <span>{e.c.nombre}</span>
                  </span>
                  <span>·</span>
                  <span style={{ whiteSpace: 'nowrap' }}>Inscrito {e.fecha}</span>
                </div>
              </div>
              <Pastilla bg={est.c.bg} color={est.c.color}>{est.label}</Pastilla>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {e.estado === 'PENDING' && (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: ESTADO.verde.bg, color: ESTADO.verde.color, fontSize: 13, fontWeight: 600 }}>
                      <Check size={13} strokeWidth={3} />
                      Aceptar
                    </span>
                    <span style={{ display: 'inline-flex', padding: 8, color: LILA.tenue }}>
                      <X size={15} />
                    </span>
                  </>
                )}
                {e.estado === 'ACCEPTED' && (
                  <span style={{ display: 'inline-flex', padding: 8, color: LILA.medio }}>
                    <MoreHorizontal size={16} />
                  </span>
                )}
                {e.estado === 'REJECTED' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: CIELO.s50, color: CIELO.s700, fontSize: 13, fontWeight: 600 }}>
                    <Check size={13} strokeWidth={3} />
                    Aceptar
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

const Dona: FC<{ partes: { n: number; color: string; label: string }[]; centro: string }> = ({ partes, centro }) => {
  const total = partes.reduce((a, s) => a + s.n, 0) || 1;
  const r = 52;
  const c = 60;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <svg width={c * 2} height={c * 2} viewBox={`0 0 ${c * 2} ${c * 2}`}>
          <circle cx={c} cy={c} r={r} stroke="#f1eef6" strokeWidth={14} fill="none" />
          {partes.map((s, i) => {
            const largo = (s.n / total) * circ;
            const el = <circle key={i} cx={c} cy={c} r={r} stroke={s.color} strokeWidth={14} fill="none" strokeDasharray={`${largo} ${circ - largo}`} strokeDashoffset={-offset} transform={`rotate(-90 ${c} ${c})`} />;
            offset += largo;
            return el;
          })}
          <text x={c} y={c - 2} textAnchor="middle" style={{ fontSize: 18, fontWeight: 800, fill: LILA.texto, letterSpacing: '-0.025em' }}>
            {centro}
          </text>
          <text x={c} y={c + 16} textAnchor="middle" style={{ fontSize: 10, fill: LILA.tenue, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            equipos
          </text>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {partes.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: LILA.oscuro }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: LILA.texto }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type PropsEquipos = {
  equipos: Inscrito[];
  maximo: number;
  /** La barra del cupo se llena (0 → 1). */
  llenado?: number;
  hoverFila?: { id: string; t: number };
  apretarFila?: { id: string; t: number };
  /** Resalte de la tarjeta «Equipos inscritos» (0 → 1). */
  resalteCupo?: number;
};

/** El contenido de la pestaña Equipos (va como `children` de `PaginaDetalle`). */
export const PaginaEquipos: FC<PropsEquipos> = ({ equipos, maximo, llenado = 1, hoverFila, apretarFila, resalteCupo = 0 }) => {
  const aceptados = equipos.filter((e) => e.estado === 'ACCEPTED');
  const pendientes = equipos.filter((e) => e.estado === 'PENDING');
  const rechazados = equipos.filter((e) => e.estado === 'REJECTED');
  const pct = maximo > 0 ? (aceptados.length / maximo) * 100 : 0;
  const disponible = Math.max(0, maximo - aceptados.length - pendientes.length);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: EQ.hueco }}>
        <div style={{ ...TARJETA, padding: 18, display: 'flex', alignItems: 'center', gap: 18, height: EQ.capacidad, boxSizing: 'border-box', boxShadow: resalteCupo > 0 ? `0 0 0 ${4 * resalteCupo}px rgba(2,132,199,0.18), 0 1px 2px rgba(31,25,41,0.04)` : TARJETA.boxShadow }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: CIELO.s50, color: CIELO.s600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ margin: 0, fontSize: 17, fontWeight: 700, color: LILA.texto, letterSpacing: '-0.02em', lineHeight: '25.5px' }}>Equipos inscritos</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: LILA.medio, lineHeight: '19.5px' }}>
              <span>
                <strong style={{ color: LILA.texto }}>{aceptados.length}</strong> aceptados
              </span>
              <span>·</span>
              <span>
                <strong style={{ color: LILA.texto }}>{pendientes.length}</strong> pendientes
              </span>
              <span>·</span>
              <span>
                Máximo <strong style={{ color: LILA.texto }}>{maximo}</strong>
              </span>
            </div>
            <div style={{ marginTop: 12, height: 8, background: '#f1eef6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct * llenado}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #0369a1)', borderRadius: 999 }} />
            </div>
          </div>
          <span style={BOTON_CIELO}>
            <UserPlus size={15} /> Invitar coach
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', height: EQ.buscador }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color={LILA.sutil} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <div style={{ width: '100%', padding: '11px 13px 11px 36px', border: `1px solid ${LILA.borde}`, borderRadius: 12, fontSize: 14, lineHeight: '21px', background: '#fff', color: LILA.sutil, boxSizing: 'border-box' }}>Buscar equipo o coach…</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: LILA.medio }}>
            Agrupar:
            <div style={{ display: 'inline-flex', padding: 3, background: '#fff', border: `1px solid ${LILA.borde}`, borderRadius: 10 }}>
              <span style={{ background: CIELO.s600, color: '#fff', borderRadius: 7, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}>Por estado</span>
              <span style={{ color: LILA.medio, borderRadius: 7, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}>Lista</span>
            </div>
          </div>
        </div>
        <SeccionEquipos titulo="Aceptados" c={ESTADO.verde} equipos={aceptados} hoverFila={hoverFila} apretarFila={apretarFila} />
        <SeccionEquipos titulo="Pendientes" c={ESTADO.ambar} equipos={pendientes} hoverFila={hoverFila} apretarFila={apretarFila} />
        <SeccionEquipos titulo="Rechazados" c={ESTADO.rojo} equipos={rechazados} hoverFila={hoverFila} apretarFila={apretarFila} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...TARJETA, padding: 16 }}>
          <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: LILA.texto }}>Distribución</div>
          <Dona
            partes={[
              { n: aceptados.length, color: '#10b981', label: 'Aceptados' },
              { n: pendientes.length, color: '#f59e0b', label: 'Pendientes' },
              { n: disponible, color: LILA.borde, label: 'Disponible' },
            ]}
            centro={`${aceptados.length}/${maximo}`}
          />
        </div>
        <div style={{ ...TARJETA, padding: 16 }}>
          <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: LILA.texto }}>Acceso rápido</div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: CIELO.s50, color: CIELO.s700 }}>
            <UserPlus size={15} /> Invitar desde lista
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Plantilla de un equipo (panel lateral) ----------------------------------------------------------------

const GRUPOS: { rol: Jugador['rol']; label: string; color: string }[] = [
  { rol: 'GK', label: 'Arqueros', color: '#f59e0b' },
  { rol: 'DEF', label: 'Defensores', color: '#0284c7' },
  { rol: 'MID', label: 'Mediocampistas', color: '#16a34a' },
  { rol: 'FWD', label: 'Delanteros', color: '#dc2626' },
];
export const PANEL_PLANTILLA = { x: PANTALLA.ancho - 460, ancho: 460 };

/** El panel con la plantilla del equipo, por posiciones, y su entrenador. `abierto` (0 → 1) lo hace entrar. */
export const PanelPlantilla: FC<{ abierto: number; equipo: string; entrenador: string; jugadores?: Jugador[]; edad?: string; resalteGrupos?: number }> = ({ abierto, equipo, entrenador, jugadores = SUB14, edad = '13 años', resalteGrupos = 0 }) => {
  if (abierto <= 0) return null;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(20,16,26,${0.5 * abierto})`, zIndex: 60 }} />
      <div style={{ position: 'absolute', top: 0, left: PANEL_PLANTILLA.x + (1 - abierto) * PANEL_PLANTILLA.ancho, width: PANEL_PLANTILLA.ancho, height: PANTALLA.alto, background: LILA.pagina, boxShadow: '-12px 0 40px rgba(20,16,26,0.18)', zIndex: 61, overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${LILA.borde}`, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f1eef6', border: `1px solid ${LILA.borde}`, boxSizing: 'border-box' }}>
              <span style={{ fontWeight: 800, color: LILA.medio }}>{iniciales(equipo)}</span>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: LILA.texto, letterSpacing: '-0.02em', lineHeight: '27px' }}>{equipo}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontSize: 12.5, color: LILA.tenue }}>
                <Users size={13} />
                {jugadores.length} jugadores
              </div>
            </div>
            <span style={{ display: 'inline-flex', padding: 9, borderRadius: 10, border: `1px solid ${LILA.borde}`, background: '#fff', color: LILA.medio }}>
              <X size={17} />
            </span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: CIELO.s50, border: `1px solid ${CIELO.s100}` }}>
            <AvatarRedondo nombre={entrenador} tamano={36} />
            <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: LILA.texto }}>{entrenador}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: CIELO.s600, color: '#fff' }}>
              <UserCog size={12} /> Entrenador
            </span>
          </div>
        </div>
        <div style={{ padding: '18px 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {GRUPOS.map((g, k) => {
            const lista = jugadores.filter((j) => j.rol === g.rol).sort((a, b) => a.numero - b.numero);
            const r = Math.max(0, Math.min(1, resalteGrupos * 4 - k));
            return (
              <div key={g.rol} style={{ opacity: 0.35 + 0.65 * Math.min(1, abierto * 1.5), transform: `translateY(${(1 - r) * 0}px)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, boxShadow: r > 0 && r < 1 ? `0 0 0 ${5 * Math.sin(r * Math.PI)}px ${g.color}33` : 'none' }} />
                  <div style={{ margin: 0, fontSize: 12, fontWeight: 700, color: LILA.oscuro, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{g.label}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: g.color, background: `${g.color}14`, borderRadius: 999, padding: '2px 8px' }}>{lista.length}</span>
                </div>
                <div style={{ background: '#fff', border: `1px solid ${LILA.borde}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(31,25,41,0.04)' }}>
                  {lista.map((j, i) => (
                    <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i > 0 ? '1px solid #f1eef6' : 'none' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: g.color, background: `${g.color}14` }}>{j.numero}</span>
                      <AvatarRedondo nombre={j.nombre} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: LILA.texto }}>{j.nombre}</div>
                        <div style={{ fontSize: 12, color: LILA.tenue, marginTop: 2 }}>{edad}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// --- Aviso de la app (abajo a la derecha) ----------------------------------------------------------------------

/** El aviso verde de la app («Invitación reenviada»). `t` (0 → 1) lo hace entrar desde la derecha. */
export const AvisoApp: FC<{ t: number; texto: string }> = ({ t, texto }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 90, display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 14px', boxShadow: '0 8px 24px rgba(15,23,42,0.10)', minWidth: 260, maxWidth: 360, opacity: t, transform: `translateX(${(1 - t) * 24}px)`, boxSizing: 'border-box' }}>
      <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#14532D', lineHeight: 1.45 }}>{texto}</span>
      <X size={14} color="#16A34A" style={{ opacity: 0.6 }} />
    </div>
  ) : null;
/** Dónde queda el aviso (para encuadrarlo). */
export const AVISO_APP = { x: PANTALLA.ancho - 24 - 260, y: PANTALLA.alto - 24 - 45, ancho: 260, alto: 45 };
