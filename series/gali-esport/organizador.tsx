// Pantallas del ROL ORGANIZADOR de Gali Esport en la computadora, fieles a la app (mismos textos, colores, radios,
// fuentes e iconos). Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Menú lateral: components/layout/SideNav.tsx y NavLinks.tsx (enlaces del organizador y la tarjeta de Camilo).
// - Detalle del torneo: app/(dashboard)/organizer/tournaments/[id]/TournamentSidebar.tsx (encabezado azul cielo,
//   botones «Invitar coach», «Editar», «Publicar torneo», chips, cifras y pestañas con sus contadores) y
//   TournamentDetailClient.tsx (la pestaña Resumen con «Listo para publicar»).
// Todo en píxeles de la app (pantalla de 1440 × 1040); va dentro de `Pantalla` (computador.tsx).
// Las otras pestañas (Invitaciones, Equipos) y los paneles laterales están en invitaciones.tsx.
import {
  ArrowLeft, ArrowRight, Calendar, CalendarCheck, CalendarDays, ChevronDown, ExternalLink, Home, Layers, Mail, MapPin, Network, PencilLine, Send, Settings, Share2, Trophy, UserPlus, Users, Users2, Zap,
} from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { apretado, PANTALLA, type Punto } from './computador';
import { Isotipo } from './marca';
import { AZUL, CIELO, COPA, GS, LILA } from './tema';

// --- Menú lateral del organizador ------------------------------------------------------------------------------

export const LATERAL = 176;
const ENLACES = [
  { nombre: 'Inicio', icono: Home },
  { nombre: 'Torneos', icono: Trophy },
  { nombre: 'Contactos', icono: Users2 },
  { nombre: 'Calendario', icono: CalendarCheck },
];
/** Centro de un enlace del menú lateral. */
export const enlace = (nombre: string): Punto => ({ x: 70, y: 79 + ENLACES.findIndex((e) => e.nombre === nombre) * 40 });

export const MenuLateral: FC<{ activo: string }> = ({ activo }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: LATERAL, height: PANTALLA.alto, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
      <Isotipo tamano={32} />
      <div style={{ fontWeight: 600, fontSize: 14 }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ENLACES.map(({ nombre, icono: Icono }) => {
        const on = nombre === activo;
        return (
          <div key={nombre} style={{ display: 'flex', alignItems: 'center', gap: 11, height: 38, padding: '0 10px', borderRadius: 8, fontSize: 13, fontWeight: on ? 500 : 400, color: on ? AZUL.b700 : GS.tenue, background: on ? AZUL.b50 : 'transparent', boxSizing: 'border-box' }}>
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span>{nombre}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: AZUL.b600, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>C</div>
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #f8fafc', boxSizing: 'border-box' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Camilo</div>
        <div style={{ fontSize: 11, color: GS.tenue }}>Organizador</div>
      </div>
      <ChevronDown size={14} color={GS.sutil} />
    </div>
  </div>
);

// --- Detalle del torneo: medidas ---------------------------------------------------------------------------------

// El contenedor del detalle tiene -mx-6: el contenido queda 24 px más afuera por cada lado.
const DET_X = LATERAL - 24 + 40;
const DET_ANCHO = PANTALLA.ancho - LATERAL + 48 - 80;
export const DETALLE = {
  x: DET_X,
  ancho: DET_ANCHO,
  altoHero: 268,
  altoPestanas: 49,
  /** Donde empieza el contenido de cada pestaña (con su padding de 32 px). */
  cuerpo: 268 + 49 + 32,
  /** Columna derecha (340 px) del contenido. */
  derecha: { x: DET_X + DET_ANCHO - 340, ancho: 340 },
  /** Columna izquierda (el resto, con 24 px de separación). */
  izquierda: { x: DET_X, ancho: DET_ANCHO - 340 - 24 },
};
/** El aviso «Listo para publicar» (columna derecha, arriba). */
export const AVISO = { x: DETALLE.derecha.x, y: DETALLE.cuerpo, ancho: 340, alto: 203 };
/** Título del torneo en el encabezado. */
export const TITULO_DETALLE: Punto = { x: DET_X + 82 + 140, y: 24 + 41 + 32 + 22 };

// Anchos de los textos medidos con Montserrat (para saber dónde cae cada botón y pestaña).
const ANCHO_BOTON = { invitar: 147.3, editar: 98.2, publicar: 167.5 };
/** Centro del botón «Invitar coach» del encabezado. */
export const BOTON_INVITAR: Punto = { x: DET_X + DET_ANCHO - ANCHO_BOTON.publicar - 8 - ANCHO_BOTON.editar - 8 - ANCHO_BOTON.invitar / 2, y: 24 + 20.5 };
/** Centro del botón blanco del encabezado: «Publicar torneo» (borrador) o «Ver torneo» (publicado). */
export const BOTON_PUBLICAR: Punto = { x: DET_X + DET_ANCHO - ANCHO_BOTON.publicar / 2, y: 24 + 20.5 };
export const BOTON_VER: Punto = { x: DET_X + DET_ANCHO - 134 / 2, y: 24 + 20.5 };

export type Pestana = 'Resumen' | 'Equipos' | 'Fases y partidos' | 'Calendario' | 'Invitaciones' | 'Configuración';
const PESTANAS: { label: Pestana; icon: typeof Home; texto: [normal: number, activa: number] }[] = [
  { label: 'Resumen', icon: Home, texto: [64.75, 66.0] },
  { label: 'Equipos', icon: Users, texto: [54.65, 56.04] },
  { label: 'Fases y partidos', icon: Network, texto: [107.65, 111.99] },
  { label: 'Calendario', icon: CalendarDays, texto: [72.53, 75.0] },
  { label: 'Invitaciones', icon: Mail, texto: [80.45, 84.04] },
  { label: 'Configuración', icon: Settings, texto: [94.48, 97.8] },
];
/**
 * Equipos aceptados (contador de «Equipos» y chip del encabezado), invitaciones pendientes (contador de «Invitaciones»)
 * y partidos del torneo (contador de «Fases y partidos» y cifras del encabezado; todos programados, ninguno jugado).
 */
export type Cuentas = { aceptados: number; pendientes: number; partidos?: number };
const cuentaDe = (p: Pestana, c: Cuentas) => (p === 'Equipos' ? c.aceptados : p === 'Invitaciones' ? c.pendientes : p === 'Fases y partidos' ? (c.partidos ?? 0) : 0) || undefined;
const anchoPestana = (i: number, activa: Pestana, c: Cuentas) => {
  const p = PESTANAS[i];
  const n = cuentaDe(p.label, c);
  return 14 + 15 + 7 + p.texto[p.label === activa ? 1 : 0] + (n ? 7 + Math.max(18, String(n).length * 6.5 + 14) : 0) + 14;
};
/** Centro de una pestaña (en píxeles de la app). */
export const centroPestana = (p: Pestana, activa: Pestana, c: Cuentas): Punto => {
  const i = PESTANAS.findIndex((x) => x.label === p);
  const x = PESTANAS.slice(0, i).reduce((s, _, k) => s + anchoPestana(k, activa, c), DET_X);
  return { x: x + anchoPestana(i, activa, c) / 2, y: DETALLE.altoHero + 24 };
};

// --- Detalle del torneo: encabezado y pestañas ---------------------------------------------------------------------

const HeroChip: FC<{ icon: typeof Zap; children: ReactNode }> = ({ icon: Icon, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, whiteSpace: 'nowrap', lineHeight: 1.4 }}>
    <Icon size={13} />
    {children}
  </span>
);

const HeroStat: FC<{ kicker: string; value: string; sub?: string; progress?: number; accent?: 'amber' | 'live'; live?: boolean }> = ({ kicker, value, sub, progress, accent, live }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent === 'amber' ? '#fcd34d' : accent === 'live' ? '#fca5a5' : '#bae6fd', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
      {live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5' }} />}
      {kicker}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05 }}>{value}</div>
    {progress != null ? (
      <div style={{ marginTop: 8 }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.16)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 999 }} />
        </div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    ) : (
      sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>
    )}
  </div>
);

/**
 * Un torneo ya publicado y en juego (desde `sabado-de-partidos`): la insignia dice «Publicado», el botón blanco es
 * «Ver torneo», sale el chip de sedes y las cifras cuentan los partidos jugados y los que están en vivo.
 */
export type TorneoEnJuego = { jugados: number; enVivo: number; sedes: number; diasRestantes: number };

export type PropsEncabezado = {
  activa: Pestana;
  cuentas: Cuentas;
  /** Sin esto, el torneo es un borrador recién creado. */
  enJuego?: TorneoEnJuego;
  /** Publicado pero sin partidos jugados (desde `que-todos-lo-vean`): «Publicado» y «Ver torneo», cifras de antes de arrancar. */
  publicado?: boolean;
  /** El ratón encima del botón blanco («Publicar torneo» / «Ver torneo») y el botón apretado. */
  hoverPublicar?: number;
  apretarPublicar?: number;
  /** El ratón encima de «Invitar coach» (0 → 1) y el botón apretado. */
  hoverInvitar?: number;
  apretarInvitar?: number;
  /** Resalta una pestaña (0 → 1), p. ej. la que se va a pulsar. */
  hoverPestana?: { p: Pestana; t: number };
  resalteBorrador?: number;
  /** Cuánto bajó la página (px). Las pestañas se quedan pegadas arriba, como en la app. */
  scroll?: number;
  /** Nombre de la fase con partidos programados (sale bajo «Días para arrancar»). */
  fase?: string;
};

/** Encabezado azul cielo del torneo y la barra de pestañas (TournamentSidebar.tsx). */
export const EncabezadoTorneo: FC<PropsEncabezado> = ({ activa, cuentas, enJuego, publicado, hoverInvitar = 0, apretarInvitar = 0, hoverPublicar = 0, apretarPublicar = 0, hoverPestana, resalteBorrador = 0, scroll = 0, fase }) => {
  const visible = !!enJuego || !!publicado;
  const partidos = cuentas.partidos ?? 0;
  const avance = enJuego && partidos ? Math.round((enJuego.jugados / partidos) * 100) : 0;
  const programados = partidos - (enJuego ? enJuego.jugados + enJuego.enVivo : 0);
  const boton: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: '#fff', borderRadius: 12, padding: '9px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '-0.01em', lineHeight: '21px', boxSizing: 'border-box' };
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll, height: DETALLE.altoHero, overflow: 'hidden', color: '#fff', background: 'radial-gradient(140% 120% at 0% 0%, #0ea5e9 0%, #0284c7 22%, #0369a1 45%, #075985 70%, #0c4a6e 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.4px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(115deg, black 0%, transparent 65%)', WebkitMaskImage: 'linear-gradient(115deg, black 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', right: '-8%', top: '-30%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.32), transparent 62%)', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', right: '18%', bottom: '-40%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.34), transparent 65%)', filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', left: DET_X - LATERAL, top: 24, width: DET_ANCHO }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, height: 41 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600 }}>
              <ArrowLeft size={13} /> Mis torneos
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...boton, background: `rgba(255,255,255,${0.16 + 0.12 * hoverInvitar})`, transform: apretado(apretarInvitar), boxShadow: hoverInvitar > 0 ? `0 0 0 ${3 * hoverInvitar}px rgba(255,255,255,0.25)` : 'none' }}>
                <UserPlus size={15} /> Invitar coach
              </span>
              <span style={boton}>
                <PencilLine size={15} /> Editar
              </span>
              <span style={{ ...boton, background: hoverPublicar > 0 ? `rgba(255,255,255,${1 - 0.08 * hoverPublicar})` : '#fff', border: '1px solid #fff', color: CIELO.s700, fontWeight: 700, boxShadow: `0 8px 20px rgba(0,0,0,0.18)${hoverPublicar > 0 ? `, 0 0 0 ${4 * hoverPublicar}px rgba(255,255,255,0.35)` : ''}`, transform: apretado(apretarPublicar) }}>
                {visible ? (
                  <>
                    <ExternalLink size={15} /> Ver torneo
                  </>
                ) : (
                  <>
                    <Send size={15} /> Publicar torneo
                  </>
                )}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 28, alignItems: 'center', height: 115 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, minWidth: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(12, 74, 110, 0.35)', boxSizing: 'border-box' }}>
                <Trophy size={30} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.1 }}>{COPA.nombre}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', whiteSpace: 'nowrap', transform: `scale(${1 + 0.15 * resalteBorrador})` }}>
                    {visible ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.92)' }}>
                  <HeroChip icon={Zap}>
                    <span>{COPA.formato}</span>
                  </HeroChip>
                  <HeroChip icon={Users}>
                    <span>
                      <strong style={{ fontWeight: 700 }}>
                        {cuentas.aceptados}/{COPA.maximo}
                      </strong>
                      <span style={{ opacity: 0.78, marginLeft: 4 }}>equipos</span>
                    </span>
                  </HeroChip>
                  <HeroChip icon={CalendarDays}>
                    <span>{COPA.fechas}</span>
                  </HeroChip>
                  {enJuego && enJuego.sedes > 0 && (
                    <HeroChip icon={MapPin}>
                      <span>{`${enJuego.sedes} sede${enJuego.sedes === 1 ? '' : 's'}`}</span>
                    </HeroChip>
                  )}
                </div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'flex-start', gap: 7 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.44)', fontStyle: 'italic' }}>Agregar descripción…</span>
                  <PencilLine size={13} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0, marginTop: 3 }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, alignItems: 'stretch' }}>
              <HeroStat kicker="Avance" value={`${avance}%`} sub={`${enJuego?.jugados ?? 0}/${partidos} partidos`} progress={avance} />
              <HeroStat kicker={enJuego ? 'Días restantes' : 'Días para arrancar'} value={String(enJuego ? enJuego.diasRestantes : COPA.diasParaArrancar)} sub={fase ? `Fase: ${fase}` : undefined} accent="amber" />
              {enJuego && enJuego.enVivo > 0 ? (
                <HeroStat kicker="En vivo" value={String(enJuego.enVivo)} sub={`${enJuego.enVivo === 1 ? 'partido' : 'partidos'} jugándose`} accent="live" live />
              ) : (
                <HeroStat kicker="Próximos" value={String(programados)} sub="partidos programados" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: Math.max(0, DETALLE.altoHero - scroll), height: DETALLE.altoPestanas, background: 'rgba(250,250,251,0.92)', borderBottom: `1px solid ${LILA.borde}`, boxSizing: 'border-box', zIndex: 2 }}>
        <div style={{ position: 'absolute', left: DET_X - LATERAL, top: 0, display: 'flex' }}>
          {PESTANAS.map((p) => {
            const on = p.label === activa;
            const Icon = p.icon;
            const n = cuentaDe(p.label, cuentas);
            const hover = hoverPestana?.p === p.label ? hoverPestana.t : 0;
            return (
              <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '14px 14px', color: on ? CIELO.s600 : hover > 0.5 ? CIELO.s700 : LILA.medio, fontWeight: on ? 700 : 500, fontSize: 13.5, borderBottom: `2px solid ${on ? CIELO.s600 : 'transparent'}`, whiteSpace: 'nowrap', letterSpacing: '-0.01em', lineHeight: '18px', background: hover > 0 ? `rgba(2,132,199,${0.08 * hover})` : 'transparent', borderRadius: '8px 8px 0 0', boxSizing: 'border-box', height: DETALLE.altoPestanas - 1 }}>
                <Icon size={15} />
                {p.label}
                {n !== undefined && (
                  <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, background: on ? CIELO.s100 : '#eef2f7', color: on ? CIELO.s700 : '#64748b', padding: '3px 7px', borderRadius: 999, minWidth: 18, textAlign: 'center', boxSizing: 'border-box' }}>{n}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

// --- Pestaña Resumen (TournamentDetailClient.tsx) ---------------------------------------------------------------

export const TARJETA_DET: CSSProperties = { background: '#fff', border: `1px solid ${LILA.borde}`, borderRadius: 16, boxShadow: '0 1px 2px rgba(31, 25, 41, 0.04)' };

const AccionRapida: FC<{ icon: typeof UserPlus; label: string }> = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: LILA.suave, border: '1px solid #f1eef6', borderRadius: 10 }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', color: CIELO.s600, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${LILA.borde}`, flexShrink: 0, boxSizing: 'border-box' }}>
      <Icon size={14} />
    </div>
    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1f1929' }}>{label}</span>
    <ArrowRight size={14} color={LILA.sutil} />
  </div>
);

/** El resumen del torneo recién creado: sin partidos, «Listo para publicar» y acciones rápidas. */
export const ResumenTorneo: FC<{ resalteAviso?: number; brilloBarra?: number }> = ({ resalteAviso = 0, brilloBarra = 1 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ margin: 0, fontSize: 15, fontWeight: 700, color: LILA.texto, letterSpacing: '-0.01em' }}>Próximos partidos</div>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: LILA.tenue }}>Los siguientes encuentros programados.</p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: LILA.oscuro, whiteSpace: 'nowrap' }}>
          Ver calendario <ArrowRight size={13} />
        </span>
      </div>
      <div style={{ ...TARJETA_DET, padding: '32px 20px', textAlign: 'center', fontSize: 13, color: LILA.tenue }}>No hay partidos programados todavía.</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 18, color: '#fff', background: 'linear-gradient(135deg, #0ea5e9, #0c4a6e)', boxShadow: `0 12px 32px rgba(2, 132, 199, ${0.22 + 0.3 * resalteAviso})` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.5px)', backgroundSize: '14px 14px', maskImage: 'linear-gradient(135deg, black 0%, transparent 60%)', WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Send size={13} />
            Listo para publicar
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Faltan 2 cosas</div>
          <div style={{ fontSize: 12.5, opacity: 0.86, marginBottom: 14 }}>Completa el checklist y publícalo para empezar a recibir inscripciones.</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: `${(5 / 7) * 100 * Math.min(1, 0.001 + brilloBarra)}%`, height: '100%', background: '#fff', borderRadius: 999 }} />
          </div>
          <div style={{ width: '100%', padding: '10px 14px', background: '#fff', color: CIELO.s700, borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' }}>
            Ver checklist
            <ArrowRight size={15} />
          </div>
        </div>
      </div>
      <div style={{ ...TARJETA_DET, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f1eef6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ margin: 0, fontSize: 14, fontWeight: 700, color: LILA.texto }}>Equipos recientes</div>
          <ArrowRight size={14} color={LILA.oscuro} />
        </div>
        <div style={{ padding: 20, textAlign: 'center', fontSize: 12.5, color: LILA.tenue }}>
          Aún no hay equipos.
          <div style={{ marginTop: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: CIELO.s50, color: CIELO.s700, fontSize: 13, fontWeight: 600 }}>
              <UserPlus size={13} /> Invitar coach
            </span>
          </div>
        </div>
      </div>
      <div style={{ ...TARJETA_DET, padding: 16 }}>
        <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: LILA.texto }}>Acciones rápidas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AccionRapida icon={UserPlus} label="Invitar coach" />
          <AccionRapida icon={Layers} label="Crear nueva fase" />
          <AccionRapida icon={Calendar} label="Agendar partido" />
          <AccionRapida icon={Share2} label="Compartir torneo" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * El detalle del torneo: menú no incluido (va aparte, `MenuLateral`), encabezado, pestañas y el contenido de la
 * pestaña activa (`children`; si no hay, el Resumen).
 */
export const PaginaDetalle: FC<Partial<PropsEncabezado> & { children?: ReactNode }> = ({ activa = 'Resumen', cuentas = { aceptados: 0, pendientes: 0 }, children, scroll = 0, ...encabezado }) => (
  <div style={{ position: 'absolute', left: LATERAL, top: 0, right: 0, bottom: 0, background: LILA.pagina, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: DET_X - LATERAL, top: DETALLE.cuerpo - scroll, width: DET_ANCHO }}>{children ?? <ResumenTorneo />}</div>
    <EncabezadoTorneo activa={activa} cuentas={cuentas} scroll={scroll} {...encabezado} />
  </div>
);
