// Pantallas del ROL ENTRENADOR (Daniel, CD Norte) en la computadora, fieles a la app (desde `que-todos-lo-vean`; el
// menú, Equipo y «Crear evento» vienen de `sabado-casi-sale-mal`). Código de la app (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport
// - Menú del entrenador: components/layout/NavLinks.tsx y SideNav.tsx.
// - Mi Escuela: app/(dashboard)/coach/school/page.tsx (portada, publicaciones, barra derecha y, al final, la tarjeta de
//   torneos de la línea 1310) con feature/coach/components/tournaments/CoachTournamentOverview.tsx: «Mis torneos»,
//   estado, «Mi posición» (#, pts, GD) y la tabla (#, Equipo, PJ, GD, PTS). Sin el botón «Ver torneo» de la tarjeta.
// - Equipo → «Eventos del equipo»: app/(dashboard)/coach/team/TeamEventsClient.tsx y feature/coach/components/team/.
// - «Crear evento»: feature/coach/components/team/CreateTeamEventModal.tsx (tipo, título, plantilla, fecha, hora, lugar,
//   «Enviar notificación por WhatsApp» y «Publicar evento»).
// Todo en píxeles de la app (pantalla de 1280 × 1040): va dentro de `Pantalla` con `tam={PANTALLA_APP}`.
import { Bell, CalendarDays, ChevronDown, Clock, FileText, Globe, Home, Lock, MapPin, Plus, School, Shield, SquarePen, Trash2, Trophy, Users, X, Zap } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { Cursor, type Punto } from './computador';
import { Isotipo } from './marca';
import { mono } from './tema';

/** La pantalla del entrenador y del jugador (1280 × 1040). */
export const PANTALLA_APP = { ancho: 1280, alto: 1040 };

/** Azul de la escuela (--brand-hue 224). */
export const AZUL_ESC = {
  b50: 'oklch(0.972 0.014 224)',
  b100: 'oklch(0.935 0.035 224)',
  b200: 'oklch(0.88 0.075 224)',
  b500: 'oklch(0.62 0.20 224)',
  b600: 'oklch(0.55 0.22 224)',
  b700: 'oklch(0.48 0.21 224)',
  b800: 'oklch(0.40 0.17 224)',
};
/** Color principal de la escuela de Daniel (profile.primary_color; por defecto #2563eb). */
export const PRIMARIO = '#2563eb';
const BORDE = '#E5E9F0';
const BORDE_FUERTE = '#D9DFE8';
const TEXTO = '#0F172A';
const TENUE = '#64748B';
const SUTIL = '#94A3B8';
const HUNDIDO = '#FAFBFC';
const PIZARRA = '#F1F5F9';

// --- Menú lateral y barra superior ------------------------------------------------------------------------------

export const LATERAL_APP = 176;
const X0 = LATERAL_APP + 24;

type Enlace = { nombre: string; icono: typeof Home };
const ENLACES_ENTRENADOR: Enlace[] = [
  { nombre: 'Inicio', icono: Home },
  { nombre: 'Mi Escuela', icono: School },
  { nombre: 'Partidos', icono: Trophy },
  { nombre: 'Equipo', icono: Shield },
  { nombre: 'Usuarios', icono: Users },
  { nombre: 'Informes', icono: FileText },
];
/** Centro de un enlace del menú lateral (cualquier rol: todos empiezan en el mismo lugar). */
export const enlaceApp = (enlaces: Enlace[], nombre: string): Punto => ({ x: 70, y: 79 + enlaces.findIndex((e) => e.nombre === nombre) * 40 });
export const enlaceEntrenador = (nombre: string) => enlaceApp(ENLACES_ENTRENADOR, nombre);

/** Menú lateral de la app con los enlaces de un rol y la tarjeta de la persona abajo. */
export const MenuApp: FC<{ enlaces: Enlace[]; activo: string; nombre: string; rol: string; resalte?: number }> = ({ enlaces, activo, nombre, rol, resalte = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: LATERAL_APP, height: PANTALLA_APP.alto, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
      <Isotipo tamano={32} />
      <div style={{ fontWeight: 600, fontSize: 14 }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {enlaces.map(({ nombre: n, icono: Icono }) => {
        const on = n === activo;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 11, height: 38, padding: '0 10px', borderRadius: 8, fontSize: 13, fontWeight: on ? 500 : 400, color: on ? AZUL_ESC.b700 : TENUE, background: on ? AZUL_ESC.b50 : 'transparent', boxSizing: 'border-box', boxShadow: on && resalte > 0 ? `0 0 0 ${3 * resalte}px ${AZUL_ESC.b200}` : 'none' }}>
            <Icono size={16} style={{ flexShrink: 0 }} />
            <span>{n}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: AZUL_ESC.b600, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>{nombre[0]}</div>
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #f8fafc', boxSizing: 'border-box' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{nombre}</div>
        <div style={{ fontSize: 11, color: TENUE }}>{rol}</div>
      </div>
      <ChevronDown size={14} color={SUTIL} />
    </div>
  </div>
);

export const MenuEntrenador: FC<{ activo: string; resalte?: number }> = ({ activo, resalte }) => <MenuApp enlaces={ENLACES_ENTRENADOR} activo={activo} nombre="Daniel" rol="Entrenador" resalte={resalte} />;

export const BarraSuperior: FC = () => (
  <div style={{ position: 'absolute', left: LATERAL_APP, right: 0, top: 0, height: 52, background: '#fff', borderBottom: '1px solid #e2e8f0', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ position: 'absolute', right: 20, top: 9, width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0', background: '#fff', color: TEXTO, boxSizing: 'border-box' }}>
      <Bell size={18} />
    </div>
  </div>
);

// =============================================================================================================
// Mi Escuela y «Mis torneos»
// =============================================================================================================

export type FilaPosicion = { pos: number; equipo: string; color: string | null; pj: number; pts: number; gd: string; propio?: boolean };
export type TorneoEntrenador = { nombre: string; sub?: string; estado: 'EN_CURSO' | 'INSCRIPCIONES' | 'FINALIZADO' | 'BORRADOR'; etiqueta: string; tabla: FilaPosicion[] };

const CHIP_ESTADO: Record<TorneoEntrenador['estado'], { color: string; bg: string }> = {
  EN_CURSO: { color: '#16a34a', bg: '#dcfce7' },
  INSCRIPCIONES: { color: '#0284c7', bg: '#e0f2fe' },
  FINALIZADO: { color: '#6b7280', bg: '#f3f4f6' },
  BORRADOR: { color: '#d97706', bg: '#fef3c7' },
};
const colorGD = (gd: string) => (gd.startsWith('+') ? '#16a34a' : gd === '0' ? '#9ca3af' : '#dc2626');

/** Lo que se puede resaltar en la tarjeta: el nombre del torneo, «Mi posición» y la tabla (0 → 1). */
export type ResalteTorneo = { nombre?: number; posicion?: number; tabla?: number };

/** La tarjeta de un torneo (TournamentCard), sin «Ver torneo». */
export const TarjetaTorneoEntrenador: FC<{ t: TorneoEntrenador; pc?: string; resalte?: ResalteTorneo }> = ({ t, pc = PRIMARIO, resalte = {} }) => {
  const chip = CHIP_ESTADO[t.estado];
  const mia = t.tabla.find((f) => f.propio);
  const vivo = t.estado === 'EN_CURSO';
  const anillo = (r = 0, color = 'rgba(250,204,21,0.9)') => (r > 0 ? `0 0 0 ${4 * r}px ${color}` : undefined);
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${vivo ? `${pc}40` : BORDE}`, borderRadius: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${BORDE}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXTO, lineHeight: 1.3, flex: 1, minWidth: 0, borderRadius: 4, boxShadow: anillo(resalte.nombre), background: (resalte.nombre ?? 0) > 0 ? `rgba(254,240,138,${0.8 * (resalte.nombre ?? 0)})` : undefined, width: 'fit-content' }}>{t.nombre}</p>
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, backgroundColor: chip.bg, color: chip.color, whiteSpace: 'nowrap' }}>{t.etiqueta}</span>
        </div>
        {t.sub && <p style={{ margin: '4px 0 0', fontSize: 11, color: TENUE }}>{t.sub}</p>}
        {mia && (
          <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: `${pc}0d`, border: `1px solid ${pc}25`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: anillo(resalte.posicion) }}>
            <span style={{ fontSize: 11, color: pc, fontWeight: 600 }}>Mi posición</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: '#374151' }}>#{mia.pos}</span>
              <span style={{ color: pc }}>{mia.pts} pts</span>
              <span style={{ color: colorGD(mia.gd) }}>{mia.gd} GD</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, boxShadow: (resalte.tabla ?? 0) > 0 ? `inset 0 0 0 ${3 * (resalte.tabla ?? 0)}px rgba(250,204,21,0.9)` : undefined }}>
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 36px 36px', padding: '6px 16px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
          {['#', 'Equipo', 'PJ', 'GD', 'PTS'].map((h, i) => (
            <span key={h} style={{ fontSize: 9, fontWeight: 700, color: SUTIL, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 1 ? 'center' : 'left' }}>{h}</span>
          ))}
        </div>
        {t.tabla.map((f, i) => (
          <div key={f.equipo} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 36px 36px', padding: '8px 16px', borderBottom: i < t.tabla.length - 1 ? '1px solid #F8FAFC' : 'none', backgroundColor: f.propio ? `${pc}0c` : 'transparent', borderLeft: `3px solid ${f.propio ? pc : 'transparent'}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: f.propio ? pc : '#9CA3AF' }}>{f.pos}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {f.color && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: f.color, flexShrink: 0 }} />}
              <span style={{ fontSize: 11, whiteSpace: 'nowrap', color: f.propio ? pc : '#374151', fontWeight: f.propio ? 800 : 500 }}>{f.equipo}</span>
            </div>
            <span style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>{f.pj}</span>
            <span style={{ fontSize: 11, textAlign: 'center', fontWeight: 600, color: colorGD(f.gd) }}>{f.gd}</span>
            <span style={{ fontSize: 11, fontWeight: 800, textAlign: 'center', color: f.propio ? pc : '#374151' }}>{f.pts}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 12px', borderRadius: 8, background: '#F1F5F9', color: '#374151', fontSize: 12, fontWeight: 600 }}>Gestionar partidos</div>
      </div>
    </div>
  );
};

/** La sección de torneos de Mi Escuela (CoachTournamentOverview dentro de su tarjeta blanca). */
export const SeccionMisTorneos: FC<{ torneos: TorneoEntrenador[]; resalte?: ResalteTorneo; pc?: string }> = ({ torneos, resalte, pc = PRIMARIO }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${BORDE}`, borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${pc}18`, color: pc, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Trophy style={{ width: 16, height: 16 }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXTO, lineHeight: 1.2 }}>Mis torneos</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: TENUE }}>Tabla de posiciones actualizada</p>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      {torneos.map((t, i) => (
        <TarjetaTorneoEntrenador key={t.nombre} t={t} pc={pc} resalte={i === 0 ? resalte : undefined} />
      ))}
    </div>
  </div>
);

/** Dónde queda la tarjeta de torneos en Mi Escuela (al final de la página, sin bajar). */
export const MIS_TORNEOS = { x: X0, y: 996, ancho: 1056 };
/** La primera tarjeta de torneo dentro de la sección (sin bajar la página). */
export const TARJETA_TORNEO = { x: X0 + 24, y: 996 + 20 + 48, ancho: (1056 - 48 - 32) / 3 };

/** Mi Escuela: portada, publicaciones, barra derecha y, abajo, «Mis torneos». `scroll` baja la página. */
export const PaginaMiEscuela: FC<{ scroll?: number; torneos: TorneoEntrenador[]; resalte?: ResalteTorneo }> = ({ scroll = 0, torneos, resalte }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: '#F6F8FB', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll }}>
      {/* Portada y datos de la escuela */}
      <div style={{ position: 'absolute', left: X0, top: 76, width: 732, height: 260, background: '#fff', borderRadius: 12, border: `1px solid ${BORDE}`, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
        <div style={{ height: 150, background: `linear-gradient(135deg, ${AZUL_ESC.b600}, ${AZUL_ESC.b800})`, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <div style={{ position: 'absolute', left: 24, top: 106, width: 96, height: 96, borderRadius: 18, background: AZUL_ESC.b50, border: '4px solid #fff', outline: `2px solid ${AZUL_ESC.b100}`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', color: AZUL_ESC.b600, fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>C</div>
        <div style={{ position: 'absolute', left: 140, top: 168 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Club Deportivo Norte</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} /> Pública
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: TENUE, alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: AZUL_ESC.b600, fontWeight: 500 }}>
              <Globe size={14} /> club-deportivo-norte.galiesport.com
            </span>
            <span style={{ width: 1, height: 12, background: BORDE }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> Bogotá
            </span>
          </div>
        </div>
      </div>
      {/* Publicaciones (esqueleto) */}
      <div style={{ position: 'absolute', left: X0, top: 352, width: 732, height: 620, background: '#fff', borderRadius: 12, border: `1px solid ${BORDE}` }}>
        <div style={{ display: 'flex', gap: 18, padding: '14px 20px', borderBottom: `1px solid ${BORDE}`, fontSize: 13, fontWeight: 500, color: TENUE }}>
          <span style={{ color: AZUL_ESC.b700, borderBottom: `2px solid ${AZUL_ESC.b600}`, paddingBottom: 12, marginBottom: -15 }}>Publicaciones</span>
          <span>Información</span>
          <span>Actividad</span>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 20, right: 20, top: 70 + i * 180, height: 160, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 16, boxSizing: 'border-box' }}>
            <div style={{ width: 90, height: 20, borderRadius: 999, background: PIZARRA }} />
            <div style={{ width: 360, height: 14, borderRadius: 6, background: '#E5E7EB', marginTop: 14 }} />
            <div style={{ width: 520, height: 10, borderRadius: 6, background: PIZARRA, marginTop: 12 }} />
            <div style={{ width: 460, height: 10, borderRadius: 6, background: PIZARRA, marginTop: 8 }} />
          </div>
        ))}
      </div>
      {/* Barra derecha */}
      <div style={{ position: 'absolute', left: X0 + 756, top: 76, width: 300, height: 136, background: '#fff', borderRadius: 12, border: `1px solid ${BORDE}`, padding: 16, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Formulario «Solicitar unirme»</div>
        <div style={{ fontSize: 12, color: TENUE, marginTop: 6, lineHeight: 1.5 }}>Recibe solicitudes de nuevas familias desde tu página pública.</div>
        <div style={{ marginTop: 12, height: 32, borderRadius: 8, background: AZUL_ESC.b50, color: AZUL_ESC.b600, fontSize: 12, fontWeight: 600, display: 'grid', placeItems: 'center' }}>Ver solicitudes</div>
      </div>
      <div style={{ position: 'absolute', left: X0 + 756, top: 226, width: 300, boxSizing: 'border-box', background: `linear-gradient(135deg, ${AZUL_ESC.b600}, ${AZUL_ESC.b800})`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.15)', color: 'white', display: 'grid', placeItems: 'center' }}>
            <Plus size={13} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Crear publicación</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px', lineHeight: 1.5 }}>Comparte novedades, logros y anuncios con tu comunidad.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 0', borderRadius: 8, background: 'white', color: AZUL_ESC.b700, fontSize: 13, fontWeight: 600 }}>
          <Plus size={14} strokeWidth={2.5} /> Nueva publicación
        </div>
      </div>
      <div style={{ position: 'absolute', left: X0 + 756, top: 408, width: 300, height: 200, background: '#fff', borderRadius: 12, border: `1px solid ${BORDE}`, padding: 16, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Redes sociales</div>
        {['Instagram', 'Facebook', 'TikTok'].map((r, i) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: ['linear-gradient(135deg,#833AB4,#E1306C,#F77737)', '#1877F2', '#0F172A'][i] }} />
            <span style={{ fontSize: 12, color: TENUE }}>{r}</span>
          </div>
        ))}
      </div>
      {/* Torneos */}
      <div style={{ position: 'absolute', left: MIS_TORNEOS.x, top: MIS_TORNEOS.y, width: MIS_TORNEOS.ancho }}>
        <SeccionMisTorneos torneos={torneos} resalte={resalte} />
      </div>
    </div>
  </div>
);

// =============================================================================================================
// Equipo → «Eventos del equipo»
// =============================================================================================================

/** Botón «Crear evento» de la cabecera. */
export const CREAR_EVENTO: Punto = { x: 1188, y: 100 };

type TipoEv = 'TRAINING' | 'MATCH';
const TIPO_TARJETA: Record<TipoEv, { label: string; bg: string; border: string; color: string; Icono: typeof Zap }> = {
  TRAINING: { label: 'Entrenamiento', bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8', Icono: Zap },
  MATCH: { label: 'Partido', bg: AZUL_ESC.b50, border: AZUL_ESC.b100, color: AZUL_ESC.b700, Icono: Trophy },
};

export type DatosEvento = { tipo: TipoEv; titulo: string; dia: string; num: number; mes: string; rel: string; hora: string; lugar: string; rsvp: [number, number, number]; pronto: boolean };

/** La semana del 21 de octubre de 2026 (miércoles) en el Equipo de Daniel. */
export const EVENTOS_SEMANA: DatosEvento[] = [
  { tipo: 'TRAINING', titulo: 'Entrenamiento Sub-14', dia: 'JUE', num: 22, mes: 'OCT', rel: 'MAÑANA', hora: '05:00 p. m.', lugar: 'Cancha Norte', rsvp: [9, 2, 1], pronto: true },
  { tipo: 'TRAINING', titulo: 'Entrenamiento Sub-14', dia: 'SÁB', num: 24, mes: 'OCT', rel: 'EN 3 DÍAS', hora: '09:00 a. m.', lugar: 'Cancha Norte', rsvp: [6, 3, 0], pronto: true },
];
const EVENTOS_PROXIMOS: DatosEvento[] = [
  { tipo: 'TRAINING', titulo: 'Entrenamiento Sub-14', dia: 'MAR', num: 27, mes: 'OCT', rel: 'EN 6 DÍAS', hora: '05:00 p. m.', lugar: 'Cancha Norte', rsvp: [2, 0, 0], pronto: false },
  { tipo: 'TRAINING', titulo: 'Entrenamiento Sub-14', dia: 'JUE', num: 29, mes: 'OCT', rel: 'EN 8 DÍAS', hora: '05:00 p. m.', lugar: 'Cancha Norte', rsvp: [1, 0, 0], pronto: false },
];

const Chip: FC<{ fondo: string; borde: string; color: string; children: ReactNode }> = ({ fondo, borde, color, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 44, padding: '3px 6px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${borde}`, background: fondo, color, fontFamily: mono, boxSizing: 'border-box' }}>{children}</span>
);

/** RsvpChips: ✓ voy, ? tal vez, ✕ no. */
const ChipsRsvp: FC<{ n: [number, number, number] }> = ({ n }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    <Chip fondo="#ECFDF5" borde="#A7F3D0" color="#047857">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      {n[0]}
    </Chip>
    <Chip fondo="#FEF3C7" borde="#FDE68A" color="#92400E">
      <span style={{ width: 10, height: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, lineHeight: 1 }}>?</span>
      {n[1]}
    </Chip>
    <Chip fondo="#FEF2F2" borde="#FECACA" color="#B91C1C">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      {n[2]}
    </Chip>
  </div>
);

/** TeamEventCard. */
const TarjetaEvento: FC<{ ev: DatosEvento; y: number }> = ({ ev, y }) => {
  const cfg = TIPO_TARJETA[ev.tipo];
  const Icono = cfg.Icono;
  return (
    <div style={{ position: 'absolute', left: X0, top: y, width: 716, height: 88, boxSizing: 'border-box', background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${BORDE}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 56, height: 60, flexShrink: 0, borderRadius: 10, border: `1px solid ${ev.pronto ? AZUL_ESC.b600 : BORDE}`, background: ev.pronto ? AZUL_ESC.b600 : HUNDIDO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: ev.pronto ? 'rgba(255,255,255,0.75)' : TENUE }}>{ev.dia}</span>
        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, margin: '2px 0', letterSpacing: '-0.02em', color: ev.pronto ? '#fff' : TEXTO }}>{ev.num}</span>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', color: ev.pronto ? 'rgba(255,255,255,0.75)' : SUTIL }}>{ev.mes}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
            <Icono style={{ width: 11, height: 11 }} />
            {cfg.label}
          </span>
          <span style={{ padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: PIZARRA, color: TENUE, fontFamily: mono, letterSpacing: '0.04em' }}>{ev.rel}</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, margin: '0 0 4px', color: TEXTO, whiteSpace: 'nowrap' }}>{ev.titulo}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: TENUE }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Clock style={{ width: 12, height: 12, color: SUTIL }} />
            {ev.hora}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <MapPin style={{ width: 12, height: 12, color: SUTIL }} />
            {ev.lugar}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <ChipsRsvp n={ev.rsvp} />
        <div style={{ display: 'flex', gap: 2, opacity: 0 }}>
          {[SquarePen, Bell, Trash2].map((I, k) => (
            <div key={k} style={{ width: 28, height: 28 }}>
              <I style={{ width: 13, height: 13 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KPIS = [
  { fondo: AZUL_ESC.b50, color: AZUL_ESC.b600, icono: () => <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, valor: '4', label: 'Próximos eventos', sub: 'próx. 30 días' },
  { fondo: '#F0FDF4', color: '#16A34A', icono: () => <polyline points="20 6 9 17 4 12" />, valor: '9/13', label: 'Confirmados próximo evento', sub: '69% del equipo' },
  { fondo: '#FFFBEB', color: '#D97706', icono: () => <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, valor: '1', label: 'Sin responder', sub: 'recordar al equipo' },
  { fondo: '#EFF6FF', color: '#2563EB', icono: () => <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, valor: '86%', label: 'Asistencia promedio', sub: 'últimos 30 días' },
];

/** Mini calendario del riel derecho (octubre de 2026 empieza en jueves; hoy es el 21). */
const MiniCalendario: FC = () => {
  const celdas = Array.from({ length: 35 }, (_, i) => i - 3);
  return (
    <div style={{ position: 'absolute', left: X0 + 736, top: 250, width: 320, height: 300, background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Octubre 2026</span>
        <CalendarDays size={16} color={SUTIL} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 6, textAlign: 'center' }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 600, color: SUTIL }}>{d}</span>
        ))}
        {celdas.map((n, i) => {
          const dia = n + 1;
          const valido = dia >= 1 && dia <= 31;
          const hoy = dia === 21;
          const evento = [22, 24, 27, 29].includes(dia);
          return (
            <div key={i} style={{ position: 'relative', height: 30, display: 'grid', placeItems: 'center' }}>
              {valido && <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: hoy ? 700 : 500, background: hoy ? AZUL_ESC.b600 : 'transparent', color: hoy ? 'white' : TEXTO }}>{dia}</span>}
              {valido && evento && <span style={{ position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, background: '#3B82F6' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TARJETA_Y = (i: number) => 372 + i * 96;

/** Equipo → «Eventos del equipo» de la Sub-14. */
export const PaginaEquipo: FC<{ hoverCrear?: number; apretarCrear?: number }> = ({ hoverCrear = 0, apretarCrear = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#F9FAFB' }}>
    <div style={{ position: 'absolute', left: X0, top: 76 }}>
      <div style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em', color: TEXTO }}>Eventos del equipo</div>
      <p style={{ margin: '4px 0 0', fontSize: 14, color: TENUE }}>Gestiona y organiza los eventos de tu equipo</p>
    </div>
    <div style={{ position: 'absolute', right: 24, top: 80, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: `1px solid ${BORDE}`, background: 'white', fontSize: 14, fontWeight: 500 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#EC4899' }} />
        Sub-14 <ChevronDown size={14} color={TENUE} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontWeight: 500, padding: '10px 20px', borderRadius: 12, fontSize: 14, background: apretarCrear > 0 || hoverCrear > 0.5 ? AZUL_ESC.b700 : AZUL_ESC.b600, boxShadow: `0 1px 2px rgba(0,0,0,0.05)${hoverCrear > 0 ? `, 0 0 0 ${4 * hoverCrear}px ${AZUL_ESC.b200}` : ''}`, transform: `scale(${1 - apretarCrear * 0.05})` }}>
        <Plus size={16} /> Crear evento
      </div>
    </div>
    {KPIS.map((k, i) => (
      <div key={k.label} style={{ position: 'absolute', left: X0 + i * 268, top: 150, width: 252, height: 80, boxSizing: 'border-box', background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: k.fondo, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><k.icono /></svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TEXTO, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{k.valor}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{k.label}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: SUTIL }}>{k.sub}</p>
        </div>
      </div>
    ))}
    <div style={{ position: 'absolute', left: X0, top: 250, width: 716, height: 46, boxSizing: 'border-box', background: '#fff', border: `1px solid ${BORDE}`, borderRadius: 12, padding: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 470, height: 30, boxSizing: 'border-box', border: `1px solid ${BORDE}`, borderRadius: 8, background: HUNDIDO, fontSize: 12, color: SUTIL, display: 'flex', alignItems: 'center', paddingLeft: 36 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUTIL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: 7 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        Buscar evento, autor o etiqueta......
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', background: PIZARRA, borderRadius: 8, padding: 3, gap: 2 }}>
        {['Próximos', 'Pasados', 'Todos'].map((s, i) => (
          <span key={s} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: i === 0 ? 600 : 500, background: i === 0 ? 'white' : 'transparent', color: i === 0 ? TEXTO : TENUE, boxShadow: i === 0 ? '0 1px 2px rgba(15,23,42,0.08)' : 'none' }}>{s}</span>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', left: X0, top: 304, display: 'flex', gap: 6 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: `1px solid ${BORDE}`, background: '#fff', color: TENUE }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6' }} />
        Entrenamiento
        <span style={{ fontSize: 10, fontFamily: mono, color: SUTIL }}>4</span>
      </span>
    </div>
    <div style={{ position: 'absolute', left: X0 + 4, top: 352, width: 708, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUTIL, whiteSpace: 'nowrap' }}>Esta semana 2</span>
      <div style={{ flex: 1, height: 1, background: BORDE }} />
    </div>
    {EVENTOS_SEMANA.map((ev, i) => (
      <TarjetaEvento key={i} ev={ev} y={TARJETA_Y(i)} />
    ))}
    <div style={{ position: 'absolute', left: X0 + 4, top: TARJETA_Y(2) + 12, width: 708, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUTIL, whiteSpace: 'nowrap' }}>Próximamente 2</span>
      <div style={{ flex: 1, height: 1, background: BORDE }} />
    </div>
    {EVENTOS_PROXIMOS.map((ev, i) => (
      <TarjetaEvento key={`p${i}`} ev={ev} y={TARJETA_Y(2) + 34 + i * 96} />
    ))}
    <MiniCalendario />
    <div style={{ position: 'absolute', left: X0 + 736, top: 566, width: 320, height: 190, background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUTIL }}>Próximo evento</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>Entrenamiento Sub-14</div>
      <div style={{ fontSize: 12, color: TENUE, marginTop: 4 }}>jue 22 oct · 05:00 p. m.</div>
      <div style={{ height: 6, borderRadius: 3, background: PIZARRA, marginTop: 18, overflow: 'hidden' }}>
        <div style={{ width: '69%', height: '100%', background: '#10B981' }} />
      </div>
      <div style={{ fontSize: 11, color: TENUE, marginTop: 6 }}>9 de 13 confirmados</div>
    </div>
  </div>
);

// =============================================================================================================
// «Crear evento» (CreateTeamEventModal)
// =============================================================================================================

const MOD = { x: 320, y: 30, ancho: 640 };
const B = 22;
const ANCHO_CUERPO = MOD.ancho - B * 2;
const MEDIO = (ANCHO_CUERPO - 12) / 2;
const Y_CAMPOS = MOD.y + 402;
/** Medidas del modal y centros de sus controles. */
export const VENTANA_EVENTO = {
  ...MOD,
  alto: 954,
  partido: { x: MOD.x + B + (ANCHO_CUERPO - 24) / 5 + 6 + (ANCHO_CUERPO - 24) / 10, y: MOD.y + 152 },
  titulo: { x: MOD.x + 80, y: MOD.y + 242 },
  plantilla: { x: MOD.x + B + ANCHO_CUERPO * 0.75 + 2, y: MOD.y + 332 },
  fecha: { x: MOD.x + B + 80, y: Y_CAMPOS + 42 },
  whatsapp: { x: MOD.x + B + ANCHO_CUERPO - 30, y: Y_CAMPOS + 331 + 28 },
  publicar: { x: MOD.x + MOD.ancho - B - 66, y: MOD.y + 954 - 30 },
};

const Etiqueta: FC<{ children: ReactNode; x?: number; y: number }> = ({ children, x = B, y }) => (
  <label style={{ position: 'absolute', left: x, top: y, display: 'block', fontSize: 12, fontWeight: 500, color: TENUE }}>{children}</label>
);
const Entrada: FC<{ x: number; y: number; ancho: number; valor?: string; ejemplo?: string; flecha?: boolean; alto?: number; cursor?: boolean; f?: number }> = ({ x, y, ancho, valor, ejemplo, flecha, alto = 36, cursor, f = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: ancho, height: alto, boxSizing: 'border-box', padding: '9px 12px', border: `1px solid ${cursor ? AZUL_ESC.b500 : BORDE}`, borderRadius: 8, fontSize: 13, lineHeight: '16px', background: cursor ? '#fff' : HUNDIDO, color: valor ? TEXTO : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden' }}>
    {valor || (cursor ? '' : ejemplo)}
    {cursor && <Cursor f={f} alto={14} />}
    {flecha && <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 11, color: TENUE }} />}
  </div>
);

const TIPOS = [
  { etiqueta: 'Entrenamiento', fondo: '#EFF6FF', color: '#1D4ED8' },
  { etiqueta: 'Partido', fondo: AZUL_ESC.b50, color: AZUL_ESC.b700 },
  { etiqueta: 'Reunión', fondo: '#F5F3FF', color: '#6D28D9' },
  { etiqueta: 'Convocatoria', fondo: '#ECFEFF', color: '#0E7490' },
  { etiqueta: 'Anuncio', fondo: '#FEF3C7', color: '#92400E' },
];
const IconoTipo: FC<{ i: number }> = ({ i }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {i === 0 && <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />}
    {i === 1 && <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" /></>}
    {i === 2 && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
    {i === 3 && <path d="M3 11l18-8-8 18-2-8-8-2z" />}
    {i === 4 && <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></>}
  </svg>
);

const MiniCancha: FC = () => (
  <svg width="36" height="46" viewBox="0 0 36 46" style={{ flexShrink: 0, borderRadius: 6 }}>
    <rect width="36" height="46" rx="6" fill="#2F8A4B" />
    {[0, 13, 26, 39].map((y) => <rect key={y} x="0" y={y} width="36" height="6.5" fill="rgba(0,0,0,0.05)" />)}
    <g stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none">
      <rect x="3" y="3" width="30" height="40" rx="1" />
      <line x1="3" y1="23" x2="33" y2="23" />
      <circle cx="18" cy="23" r="5" />
      <rect x="9" y="3" width="18" height="7" rx="0.5" />
      <rect x="9" y="36" width="18" height="7" rx="0.5" />
    </g>
  </svg>
);

/** La plantilla que Daniel guardó para la Copa (LineupCard). */
export const PLANTILLA_COPA = { nombre: 'Copa Galileo', detalle: '4-3-3 · Sub-14' };

const TarjetaPlantilla: FC<{ x: number; y: number; ancho: number; ninguna?: boolean; elegida: boolean; apretar?: number }> = ({ x, y, ancho, ninguna, elegida, apretar = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: ancho, height: 69, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${elegida ? AZUL_ESC.b600 : BORDE}`, background: elegida ? AZUL_ESC.b50 : ninguna ? '#fff' : HUNDIDO, transform: `scale(${1 - apretar * 0.04})` }}>
    {ninguna ? (
      <div style={{ width: 36, height: 46, borderRadius: 6, background: PIZARRA, border: `1.5px dashed ${BORDE_FUERTE}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 13, color: SUTIL, fontWeight: 600 }}>—</span>
      </div>
    ) : (
      <MiniCancha />
    )}
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXTO, lineHeight: 1.2 }}>{ninguna ? 'Sin plantilla' : PLANTILLA_COPA.nombre}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: TENUE, fontFamily: mono }}>{ninguna ? 'Solo evento' : PLANTILLA_COPA.detalle}</p>
    </div>
  </div>
);

const Interruptor: FC<{ on: boolean }> = ({ on }) => (
  <div style={{ position: 'relative', width: 36, height: 20, borderRadius: 999, background: on ? AZUL_ESC.b600 : BORDE_FUERTE, flexShrink: 0 }}>
    <span style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transform: on ? 'translateX(16px)' : 'none' }} />
  </div>
);

const FilaInterruptor: FC<{ y: number; etiqueta: string; descripcion: string; on: boolean; resalte?: number }> = ({ y, etiqueta, descripcion, on, resalte = 0 }) => (
  <div style={{ position: 'absolute', left: B, top: y, width: ANCHO_CUERPO, height: 57, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${resalte > 0 ? '#86EFAC' : BORDE}`, borderRadius: 9, background: resalte > 0 ? `rgba(220,252,231,${resalte})` : HUNDIDO, gap: 16, boxShadow: resalte > 0 ? `0 0 0 ${4 * resalte}px rgba(37,211,102,0.35)` : 'none' }}>
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: TEXTO }}>{etiqueta}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: TENUE }}>{descripcion}</p>
    </div>
    <Interruptor on={on} />
  </div>
);

export type PropsVentanaEvento = {
  abierto: number;
  f?: number;
  partido: boolean;
  apretarPartido?: number;
  titulo: string;
  cursorTitulo?: boolean;
  plantilla: boolean;
  apretarPlantilla?: number;
  fecha: string;
  hora: string;
  lugar: string;
  resalteWhatsapp?: number;
  hoverPublicar?: number;
  apretarPublicar?: number;
  publicando?: boolean;
  /** Cuánto bajó el contenido del modal (px), para ver el pie en una pantalla baja. */
  scroll?: number;
};

/** Modal «Crear evento» con un partido y su plantilla, y el aviso por WhatsApp activo. */
export const VentanaEvento: FC<PropsVentanaEvento> = ({
  abierto, f = 0, partido: esPartido, apretarPartido = 0, titulo, cursorTitulo, plantilla, apretarPlantilla = 0, fecha, hora, lugar, resalteWhatsapp = 0, hoverPublicar = 0, apretarPublicar = 0, publicando,
}) => {
  if (abierto <= 0) return null;
  const ancho = (ANCHO_CUERPO - 24) / 5;
  const yPlantilla = esPartido ? 0 : -128;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: `rgba(15,23,42,${0.45 * abierto})` }}>
      <div style={{ position: 'absolute', left: MOD.x, top: MOD.y, width: MOD.ancho, height: VENTANA_EVENTO.alto + yPlantilla, background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', overflow: 'hidden', opacity: abierto, transform: `scale(${0.97 + 0.03 * abierto})` }}>
        <div style={{ height: 76, boxSizing: 'border-box', padding: '18px 22px', borderBottom: `1px solid ${BORDE}` }}>
          <div style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: TEXTO }}>Crear evento</div>
          <p style={{ margin: 0, fontSize: 12, color: TENUE }}>Será visible solo para los miembros del equipo</p>
          <X size={14} style={{ position: 'absolute', right: 31, top: 27, color: TENUE }} />
        </div>
        <Etiqueta y={94}>Tipo de evento</Etiqueta>
        {TIPOS.map((t, i) => {
          const on = esPartido ? i === 1 : false;
          return (
            <div key={t.etiqueta} style={{ position: 'absolute', left: B + i * (ancho + 6), top: 118, width: ancho, height: 68, boxSizing: 'border-box', border: `1.5px solid ${on ? AZUL_ESC.b600 : BORDE}`, borderRadius: 9, background: on ? AZUL_ESC.b50 : HUNDIDO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, transform: i === 1 ? `scale(${1 - apretarPartido * 0.05})` : undefined }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: t.fondo, color: t.color }}>
                <IconoTipo i={i} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: on ? AZUL_ESC.b700 : TEXTO }}>{t.etiqueta}</span>
            </div>
          );
        })}
        <Etiqueta y={200}>Título</Etiqueta>
        <Entrada x={B} y={224} ancho={ANCHO_CUERPO} valor={titulo} ejemplo="Ej. Entrenamiento de pretemporada" cursor={cursorTitulo} f={f} />
        {esPartido && (
          <>
            <Etiqueta y={274}>
              Plantilla del equipo <span style={{ color: SUTIL, fontWeight: 400 }}>· opcional</span>
            </Etiqueta>
            <TarjetaPlantilla x={B} y={298} ancho={(ANCHO_CUERPO - 8) / 2} ninguna elegida={!plantilla} />
            <TarjetaPlantilla x={B + (ANCHO_CUERPO - 8) / 2 + 8} y={298} ancho={(ANCHO_CUERPO - 8) / 2} elegida={plantilla} apretar={apretarPlantilla} />
            <p style={{ position: 'absolute', left: B, top: 373, width: ANCHO_CUERPO, margin: 0, fontSize: 11, color: TENUE, lineHeight: 1.4 }}>
              {plantilla ? 'Solo se convoca y se avisa por WhatsApp a los titulares y suplentes de esta plantilla.' : 'Sin plantilla: se convoca a todos los jugadores de la categoría.'}
            </p>
          </>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 402 + yPlantilla }}>
          <Etiqueta y={0}>Fecha</Etiqueta>
          <Entrada x={B} y={24} ancho={MEDIO} valor={fecha} ejemplo="dd/mm/aaaa" />
          <Etiqueta x={B + MEDIO + 12} y={0}>Hora</Etiqueta>
          <Entrada x={B + MEDIO + 12} y={24} ancho={MEDIO} valor={hora} ejemplo="--:-- -----" />
          <Etiqueta y={74}>Lugar</Etiqueta>
          <Entrada x={B} y={98} ancho={MEDIO} valor={lugar} ejemplo="Cancha Norte" />
          <Etiqueta x={B + MEDIO + 12} y={74}>Duración</Etiqueta>
          <Entrada x={B + MEDIO + 12} y={98} ancho={MEDIO} valor="2 horas" flecha />
          <Etiqueta y={148}>Descripción</Etiqueta>
          <Entrada x={B} y={172} ancho={ANCHO_CUERPO} alto={80} ejemplo="Detalles, lista de equipamiento, instrucciones..." />
          <FilaInterruptor y={266} etiqueta="Solicitar confirmación (RSVP)" descripcion="Los miembros podrán responder Voy / No voy / Tal vez" on />
          <FilaInterruptor y={331} etiqueta="Enviar notificación por WhatsApp" descripcion="A cada jugador invitado, con fecha, hora y enlace para confirmar" on resalte={resalteWhatsapp} />
          <p style={{ position: 'absolute', left: B + 2, top: 394, margin: 0, fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✓</span> Todos los jugadores recibirán el aviso
          </p>
          <FilaInterruptor y={418} etiqueta="Recordatorio 24h antes" descripcion="Notificación automática a quienes no han confirmado" on={false} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 61, boxSizing: 'border-box', padding: '14px 22px', background: HUNDIDO, borderTop: `1px solid ${BORDE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: TENUE, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={14} /> Solo el equipo verá esto
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${BORDE}`, background: '#fff', fontSize: 13, fontWeight: 500 }}>Cancelar</div>
            <div style={{ padding: '8px 18px', borderRadius: 8, background: apretarPublicar > 0 || hoverPublicar > 0.5 ? AZUL_ESC.b700 : AZUL_ESC.b600, color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, opacity: publicando ? 0.65 : 1, transform: `scale(${1 - apretarPublicar * 0.05})`, boxShadow: hoverPublicar > 0 ? `0 0 0 ${4 * hoverPublicar}px ${AZUL_ESC.b200}` : 'none' }}>
              {publicando && <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', boxSizing: 'border-box', transform: `rotate(${f * 24}deg)` }} />}
              {publicando ? 'Publicando...' : 'Publicar evento'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
