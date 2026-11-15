// La invitación por correo, vista en el celular del coach, y la página que se abre al aceptarla.
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - El correo: app/lib/email.ts (`sendTournamentInvitationEmail` dentro de `emailWrapper`): asunto
//   «Invitación al torneo <torneo> — Gali Esport», de «Gali Esport <noreply@galiesport.site>», cabecera «GALI ESPORT»,
//   «Invitación a torneo», «Te han invitado a un torneo», botones «Aceptar invitación» y «Rechazar».
// - Al aceptar: app/(auth)/verification/tournament-invite/page.tsx (✅ «¡Invitación aceptada!» sobre la foto del
//   estadio de public/login/campo-futbol.webp, aquí en public/gali-esport/campo-futbol.jpg).
// Todo en puntos del celular (390 × 844); va dentro de `Celular`.
import type { CSSProperties, FC } from 'react';
import { Img, staticFile } from 'remotion';
import type { PuntoCel } from './celular';
import { COPA, montserrat, SISTEMA } from './tema';

const SKY = '#0ea5e9';
const NAVY = '#0c4a6e';
const MF: CSSProperties = { fontFamily: montserrat };

// --- El correo en la app de correo del celular ---------------------------------------------------------------

/** Escala del correo (560 px de ancho) para que quepa en el celular con 16 pt de margen. */
const K = 358 / 560;
/** Dónde empieza la tarjeta del correo en la pantalla del celular. */
const TARJETA_Y = 266;
/** Alturas fijas de cada bloque de la tarjeta (en píxeles del correo). */
const C = { cabecera: 81, linea: 3, arriba: 40, kicker: 24, titulo: 56.4, hola: 27.5, parrafo: 78.75 + 32, botones: 51 };
const Y_BOTONES = C.cabecera + C.linea + C.arriba + C.kicker + C.titulo + C.hola + C.parrafo;
/** Centro del botón «Aceptar invitación» (en puntos del celular). */
export const BOTON_ACEPTAR: PuntoCel = { x: 16 + (48 + (464 - 377) / 2 + 106) * K, y: TARJETA_Y + (Y_BOTONES + C.botones / 2) * K };

const Logotexto: FC<{ tamano: number; color: string }> = ({ tamano, color }) => (
  <span style={{ ...MF, fontSize: tamano, fontWeight: 800, color, letterSpacing: 2, textTransform: 'uppercase' }}>
    GALI <span style={{ color: SKY }}>ESPORT</span>
  </span>
);

/** La tarjeta del correo, igual que el HTML que manda la app (560 px de ancho). */
const TarjetaCorreo: FC<{ coach: string; apretar: number; hover: number }> = ({ coach, apretar, hover }) => (
  <div style={{ width: 560, background: '#ffffff', borderRadius: 4, boxShadow: '0 2px 8px rgba(14,165,233,0.10),0 0 0 1px rgba(14,165,233,0.08)', overflow: 'hidden' }}>
    <div style={{ height: C.cabecera, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, boxSizing: 'border-box' }}>
      <Logotexto tamano={24} color={NAVY} />
    </div>
    <div style={{ margin: '0 48px', height: C.linea, background: `linear-gradient(90deg,${SKY} 0%,${NAVY} 100%)`, borderRadius: 2 }} />
    <div style={{ padding: `${C.arriba}px 48px 8px` }}>
      <p style={{ ...MF, margin: 0, height: C.kicker, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: SKY, fontWeight: 400 }}>Invitación a torneo</p>
      <div style={{ ...MF, margin: 0, height: C.titulo, fontSize: 28, fontWeight: 400, color: NAVY, lineHeight: 1.3 }}>Te han invitado a un torneo</div>
      <p style={{ ...MF, margin: 0, height: C.hola, fontSize: 15, color: '#374151', lineHeight: 1.3 }}>
        Hola, <strong style={{ color: NAVY }}>{coach}</strong>
      </p>
      <p style={{ ...MF, margin: 0, height: C.parrafo, fontSize: 15, color: '#4b5563', lineHeight: 1.75 }}>
        Has sido invitado a participar en el torneo <strong style={{ color: NAVY }}>{COPA.nombre}</strong> en <strong style={{ color: NAVY }}>Gali Esport</strong>. Acepta o rechaza la invitación usando los botones a continuación.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, height: C.botones }}>
        <span style={{ ...MF, display: 'inline-flex', alignItems: 'center', width: 212, justifyContent: 'center', borderRadius: 3, background: hover > 0 ? '#0284c7' : SKY, color: '#ffffff', fontSize: 14, fontWeight: 600, letterSpacing: 0.5, transform: apretar > 0 ? `scale(${1 - apretar * 0.06})` : undefined }}>Aceptar invitación</span>
        <span style={{ ...MF, display: 'inline-flex', alignItems: 'center', width: 153, justifyContent: 'center', borderRadius: 3, border: `2px solid ${NAVY}`, color: NAVY, fontSize: 14, fontWeight: 600, letterSpacing: 0.5, boxSizing: 'border-box' }}>Rechazar</span>
      </div>
    </div>
    <div style={{ padding: '0 48px 36px' }}>
      <p style={{ ...MF, margin: '32px 0 0', fontSize: 12, color: '#9ca3af', lineHeight: 1.7, borderTop: '1px solid #f0f9ff', paddingTop: 20 }}>
        Esta invitación expirará en <strong>1 hora</strong>.<br />
        Si no esperabas esta invitación, puedes ignorar este correo.
      </p>
    </div>
    <div style={{ background: NAVY, padding: '28px 48px 24px' }}>
      <Logotexto tamano={16} color="#ffffff" />
    </div>
  </div>
);

/** La app de correo del celular con la invitación abierta. `apretar` (0 → 1) hunde «Aceptar invitación». */
export const PantallaCorreo: FC<{ coach: string; apretar?: number; hover?: number; resalteAsunto?: number }> = ({ coach, apretar = 0, hover = 0, resalteAsunto = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#ffffff', fontFamily: SISTEMA }}>
    {/* Barra de herramientas */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 50, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', color: '#444746' }}>
      <svg width={22} height={22} viewBox="0 0 24 24">
        <path d="M20 12H5M11 5l-7 7 7 7" stroke="#444746" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', gap: 22 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid #444746', boxSizing: 'border-box', opacity: 0.85 }} />
        ))}
        <span style={{ fontSize: 22, lineHeight: '18px', fontWeight: 700 }}>⋮</span>
      </div>
    </div>
    {/* Asunto */}
    <div style={{ position: 'absolute', left: 18, right: 18, top: 108, fontSize: 21, lineHeight: '27px', color: '#1f1f1f', borderRadius: 8, background: resalteAsunto > 0 ? `rgba(14,165,233,${0.12 * resalteAsunto})` : 'transparent', boxShadow: resalteAsunto > 0 ? `0 0 0 ${6 * resalteAsunto}px rgba(14,165,233,${0.12 * resalteAsunto})` : 'none' }}>
      Invitación al torneo {COPA.nombre} — Gali Esport{' '}
      <span style={{ display: 'inline-block', fontSize: 12, lineHeight: '18px', padding: '0 6px', borderRadius: 4, background: '#e9eef6', color: '#444746', verticalAlign: 'middle' }}>Recibidos</span>
    </div>
    {/* Remitente */}
    <div style={{ position: 'absolute', left: 18, right: 18, top: 186, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: SKY, color: 'white', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600 }}>G</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1f1f1f' }}>Gali Esport</span>
          <span style={{ fontSize: 13, color: '#5e5e5e' }}>20:14</span>
        </div>
        <div style={{ fontSize: 13, color: '#5e5e5e' }}>para mí ▾</div>
      </div>
    </div>
    {/* Cuerpo del correo */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: TARJETA_Y - 18, bottom: 0, background: '#f0f9ff' }} />
    <div style={{ position: 'absolute', left: 16, top: TARJETA_Y, width: 560, transform: `scale(${K})`, transformOrigin: '0 0' }}>
      <TarjetaCorreo coach={coach} apretar={apretar} hover={hover} />
    </div>
  </div>
);

// --- La página «¡Invitación aceptada!» ---------------------------------------------------------------------------

/** La página que abre el botón, en el navegador del celular. `t` (0 → 1) hace aparecer la tarjeta. */
export const PaginaAceptada: FC<{ t?: number; golpe?: number }> = ({ t = 1, golpe = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#0b1b33', fontFamily: montserrat }}>
    {/* Barra del navegador */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 100, background: '#f2f2f7', zIndex: 5 }}>
      <div style={{ position: 'absolute', left: 14, right: 14, top: 54, height: 36, borderRadius: 10, background: '#e3e3e8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: SISTEMA, fontSize: 15, color: '#1c1c1e' }}>
        <svg width={11} height={13} viewBox="0 0 11 13">
          <rect x={0.5} y={5.5} width={10} height={7} rx={1.5} fill="#1c1c1e" />
          <path d="M2.5 5.5V3.8a3 3 0 0 1 6 0v1.7" stroke="#1c1c1e" strokeWidth={1.4} fill="none" />
        </svg>
        galiesport.site
      </div>
    </div>
    <Img src={staticFile('gali-esport/campo-futbol.jpg')} style={{ position: 'absolute', left: 0, top: 100, width: '100%', height: 744, objectFit: 'cover' }} />
    <div style={{ position: 'absolute', left: 16, right: 16, top: 300, background: 'rgba(255,255,255,0.9)', borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 24}px) scale(${0.96 + 0.04 * t})` }}>
      <div style={{ fontSize: 48, lineHeight: 1, transform: `scale(${1 + 0.25 * golpe})` }}>✅</div>
      <div>
        <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 700, color: '#16a34a' }}>¡Invitación aceptada!</div>
        <p style={{ fontSize: 14, lineHeight: '20px', color: '#4b5563', margin: '8px 0 0' }}>Ahora formas parte del torneo "{COPA.nombre}". Inicia sesión para gestionar tu equipo.</p>
      </div>
      <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: SKY }}>Ir al inicio de sesión</div>
    </div>
  </div>
);
