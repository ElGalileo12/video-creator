// Crear la cuenta en Gali Esport, en el navegador del celular (la versión móvil de la app: 390 px de ancho).
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Inicio:            feature/public/landing/LandingPage.tsx + landing.css (tema claro) y components/common/SiteHeader.tsx
//                      (en móvil, la barra flotante con hamburguesa; el botón del héroe «Empieza gratis» lleva a /signup).
// - Registro:          app/(auth)/signup/[[...sign-up]]/SignUpClient.tsx + components/common/PasswordField.tsx.
// - Revisa tu correo y Verificando tu correo: app/(auth)/verification/email/page.tsx.
// - El correo:         app/lib/email.ts (`sendVerificationEmail` dentro de `emailWrapper`), a lo ancho del celular.
// - Inicio de sesión:  app/(auth)/signin/[[...sign-in]]/SignInClient.tsx (con el aviso verde de ?verified=true).
// - Selector de rol:   app/(auth)/select-role/SelectRoleClient.tsx (`ROLES`: textos, íconos, colores y brillo de cada rol).
// - Cargando:          components/common/Loading.tsx («Entrando a tu panel de …»).
// Erratas del código corregidas a pedido del usuario: «REGRISTRO» → «REGISTRO» y «Registrate» → «Regístrate».
// La ventana para elegir cuenta (`ElegirCuenta`) es genérica: no imita la de Google.
//
// Todo va en puntos del celular, dentro de `Celular`. `Navegador` pone la barra de dirección (con la ruta) y desplaza
// la página con `scroll`; las posiciones que devuelven los `layout…` están en píxeles de la página (sin la barra):
// `aPantalla(p, scroll)` las pasa a la pantalla del celular, donde va el `Dedo`.
import type { CSSProperties, FC, ReactNode } from 'react';
import { ArrowRight, CalendarCheck, Eye, FileText, Home, Lock, Newspaper, School, Shield, Trophy, User, Users, Users2, type LucideIcon } from 'lucide-react';
import { Img, interpolate, staticFile } from 'remotion';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';
import { montserrat, SISTEMA } from './tema';

// --- Colores (Tailwind 3, como en la app) ---------------------------------------------------------------------------

export const SKY = { s50: '#f0f9ff', s100: '#e0f2fe', s200: '#bae6fd', s400: '#38bdf8', s500: '#0ea5e9', s600: '#0284c7', s700: '#0369a1', s800: '#075985', s900: '#0c4a6e' };
const NAVY = '#0c4a6e';
const ROJO = '#ef4444';
const BORDE = '#e5e5e5';

// --- El navegador del celular ---------------------------------------------------------------------------------------

/** Alto de la barra del navegador (con la barra de estado del celular encima). */
export const NAV_ALTO = 100;
/** Lo que se ve de la página debajo de la barra. */
export const VISTA = { ancho: 390, alto: 844 - NAV_ALTO };
export type Pt = { x: number; y: number };
/** Un punto de la página (desplazada `scroll`) en la pantalla del celular. */
export const aPantalla = (p: Pt, scroll: number): Pt => ({ x: p.x, y: NAV_ALTO + p.y - scroll });

/**
 * La barra de dirección con la ruta (`galiesport.com/signup`) y la página debajo, desplazada `scroll`.
 * `destello` (0 → 1) ilumina la barra cuando cambia la ruta; `carga` (0 → 1) es la línea azul de carga.
 */
export const Navegador: FC<{ url: string; scroll?: number; destello?: number; carga?: number; fondo?: string; children: ReactNode }> = ({ url, scroll = 0, destello = 0, carga = 0, fondo = '#ffffff', children }) => {
  const i = url.indexOf('/');
  const dominio = i < 0 ? url : url.slice(0, i);
  const ruta = i < 0 ? '' : url.slice(i);
  return (
    <div style={{ position: 'absolute', inset: 0, background: fondo }}>
      <div style={{ position: 'absolute', left: 0, top: NAV_ALTO, width: VISTA.ancho, height: VISTA.alto, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -scroll, width: VISTA.ancho }}>{children}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: NAV_ALTO, background: '#F2F2F7', borderBottom: '1px solid #D9D9DF', zIndex: 40 }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: 52,
            height: 40,
            borderRadius: 12,
            background: '#E3E3E8',
            boxShadow: destello > 0 ? `inset 0 0 0 999px rgba(14,165,233,${0.16 * destello}), 0 0 0 ${3 * destello}px rgba(14,165,233,${0.45 * destello})` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0 14px',
            fontFamily: SISTEMA,
            fontSize: 16,
          }}
        >
          <svg width={11} height={14} viewBox="0 0 11 14" style={{ flexShrink: 0 }}>
            <rect x={0.5} y={6} width={10} height={7.5} rx={1.6} fill="#3C3C43" />
            <path d="M2.5 6V4.2a3 3 0 0 1 6 0V6" stroke="#3C3C43" strokeWidth={1.4} fill="none" />
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
            <span style={{ color: '#1C1C1E', fontWeight: 600 }}>{dominio}</span>
            <span style={{ color: '#6E6E73' }}>{ruta}</span>
          </span>
        </div>
        {carga > 0 && carga < 1 && <div style={{ position: 'absolute', left: 0, bottom: -1, height: 3, width: `${carga * 100}%`, background: '#0A84FF', borderRadius: 2 }} />}
      </div>
    </div>
  );
};

/** El dedo que toca la pantalla (un círculo, como en las grabaciones de pantalla). `onda` (0 → 1) es el toque. */
export const Dedo: FC<{ en: Pt; opacidad?: number; apretar?: number; onda?: number }> = ({ en, opacidad = 1, apretar = 0, onda = 0 }) =>
  opacidad > 0 ? (
    <>
      {onda > 0 && onda < 1 && (
        <div style={{ position: 'absolute', left: en.x - 24, top: en.y - 24, width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(14,165,233,0.85)', boxSizing: 'border-box', transform: `scale(${0.7 + onda * 1.5})`, opacity: (1 - onda) * opacidad, zIndex: 199 }} />
      )}
      <div
        style={{
          position: 'absolute',
          left: en.x - 22,
          top: en.y - 22,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.55)',
          border: '2px solid rgba(15,23,42,0.35)',
          boxSizing: 'border-box',
          boxShadow: '0 6px 16px rgba(15,23,42,0.35)',
          opacity: opacidad,
          transform: `scale(${1 - 0.2 * apretar})`,
          zIndex: 200,
        }}
      />
    </>
  ) : null;

// --- Piezas de las pantallas de acceso --------------------------------------------------------------------------------

/** La «G» de Google del botón de la app (la app carga el logo oficial). */
export const LogoG: FC<{ tamano?: number }> = ({ tamano = 20 }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

/** Cursor de texto que parpadea; fijo mientras se escribe. */
const Caret: FC<{ f: number; fijo?: boolean }> = ({ f, fijo }) => (
  <span style={{ display: 'inline-block', width: 1.6, height: 20, marginLeft: 1, background: SKY.s800, verticalAlign: 'middle', opacity: fijo || Math.floor(f / 16) % 2 === 0 ? 1 : 0 }} />
);

/** Un bloque de la tarjeta, puesto en `y` (desde el borde de arriba de la tarjeta). */
const B: FC<{ y: number; h?: number; style?: CSSProperties; children: ReactNode }> = ({ y, h, style, children }) => (
  <div style={{ position: 'absolute', left: 32, width: 294, top: y, height: h, ...style }}>{children}</div>
);

/** La tarjeta blanca de las pantallas de acceso (bg-white/90, rounded-2xl, shadow-lg). */
const Tarjeta: FC<{ top: number; alto: number; children: ReactNode }> = ({ top, alto, children }) => (
  <div style={{ position: 'absolute', left: 16, top, width: 358, height: alto, borderRadius: 16, background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', color: '#0a0a0a' }}>{children}</div>
);

/** Fondo de foto de las pantallas de acceso (next/image con `fill` y `object-cover`). */
const FotoFondo: FC<{ archivo: string; alto: number }> = ({ archivo, alto }) => (
  <Img src={staticFile(`gali-esport/${archivo}`)} style={{ position: 'absolute', left: 0, top: 0, width: VISTA.ancho, height: alto, objectFit: 'cover' }} />
);

const Titulos: FC = () => (
  <B y={32} h={56} style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: schibsted, fontSize: 20, lineHeight: '28px', fontWeight: 700, color: SKY.s900 }}>Bienvenido a Gali Esport</div>
    <div style={{ fontSize: 14, lineHeight: '20px', color: SKY.s700, marginTop: 8 }}>Tu sitio ideal para la gestión de equipos</div>
  </B>
);

const Pildora: FC<{ texto: string }> = ({ texto }) => (
  <B y={112} h={28} style={{ textAlign: 'center' }}>
    <span style={{ display: 'inline-block', background: SKY.s500, borderRadius: 999, padding: '4px 24px', color: 'white', fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{texto}</span>
  </B>
);

/** Campo de correo o de contraseña (con su ícono, el foco y lo escrito). */
const Campo: FC<{ y: number; tipo: 'correo' | 'clave'; placeholder: string; valor: string; foco: boolean; f: number; escribiendo?: boolean; borde?: boolean; apagado?: boolean }> = ({ y, tipo, placeholder, valor, foco, f, escribiendo, borde, apagado }) => {
  const Icono = tipo === 'correo' ? User : Lock;
  const alto = borde ? 42 : 40;
  return (
    <B y={y} h={alto} style={{ opacity: apagado ? 0.5 : 1 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: SKY.s50, border: borde ? `1px solid ${foco ? 'transparent' : SKY.s200}` : undefined, boxShadow: foco ? `0 0 0 2px ${SKY.s400}` : undefined }} />
      <Icono size={20} color={SKY.s400} style={{ position: 'absolute', left: 12, top: alto / 2 - 10 }} />
      <div style={{ position: 'absolute', left: 40, right: tipo === 'clave' ? 44 : 16, top: 0, height: alto, display: 'flex', alignItems: 'center', fontSize: 16, color: SKY.s800, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {valor ? <span style={tipo === 'clave' ? { letterSpacing: 2.5, fontSize: 15 } : undefined}>{tipo === 'clave' ? '•'.repeat(valor.length) : valor}</span> : !foco && <span>{placeholder}</span>}
        {foco && <Caret f={f} fijo={escribiendo} />}
      </div>
      {tipo === 'clave' && <Eye size={20} color={SKY.s500} style={{ position: 'absolute', right: 16, top: alto / 2 - 10 }} />}
    </B>
  );
};

/** La casilla nativa (checkbox). */
const Casilla: FC<{ marcada: boolean; golpe?: number }> = ({ marcada, golpe = 0 }) => (
  <span style={{ flexShrink: 0, width: 13, height: 13, marginTop: 4, borderRadius: 3, boxSizing: 'border-box', border: marcada ? 'none' : '1px solid #767676', background: marcada ? '#0075ff' : 'white', display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.35 * golpe})` }}>
    {marcada && (
      <svg width={9} height={9} viewBox="0 0 10 10">
        <path d="M1.8 5.2 4.1 7.4 8.4 2.6" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </span>
);

const BotonGoogle: FC<{ y: number; texto: string; apretar?: number; apagado?: boolean }> = ({ y, texto, apretar = 0, apagado }) => (
  <B y={y} h={38} style={{ opacity: apagado ? 0.5 : 1 }}>
    <div style={{ height: 38, boxSizing: 'border-box', border: `1px solid ${BORDE}`, borderRadius: 6, background: apretar > 0 ? '#f3f4f6' : 'white', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: apretar > 0 ? `scale(${1 - 0.04 * apretar})` : undefined }}>
      <LogoG />
      <span style={{ marginLeft: 8, fontSize: 14, lineHeight: '20px', fontWeight: 500, color: '#1f2937' }}>{texto}</span>
    </div>
  </B>
);

const BotonAzul: FC<{ y: number; texto: string; apretar?: number; apagado?: boolean }> = ({ y, texto, apretar = 0, apagado }) => (
  <B y={y} h={40} style={{ opacity: apagado ? 0.5 : 1 }}>
    <div style={{ height: 40, borderRadius: 6, background: apretar > 0 ? SKY.s600 : SKY.s500, color: 'white', fontWeight: 700, fontSize: 16, display: 'grid', placeItems: 'center', transform: apretar > 0 ? `scale(${1 - 0.04 * apretar})` : undefined }}>{texto}</div>
  </B>
);

// --- Registro (/signup) -----------------------------------------------------------------------------------------------

export type EstadoRegistro = {
  correo: string;
  clave: string;
  confirmar: string;
  foco?: 'correo' | 'clave' | 'confirmar' | null;
  escribiendo?: boolean;
  acepto: boolean;
  golpeCasilla?: number;
  cargando?: boolean;
  apretarGoogle?: number;
  apretarRegistrar?: number;
  f: number;
};

const REGLAS = [
  { texto: 'Al menos una mayúscula', cumple: (v: string) => /[A-Z]/.test(v) },
  { texto: 'Al menos un número', cumple: (v: string) => /[0-9]/.test(v) },
  { texto: 'Al menos un carácter especial (!@#$...)', cumple: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

/** Dónde queda cada cosa del registro (en la página). La tarjeta crece con la pista de la contraseña y el error. */
export const layoutRegistro = (e: { clave: string; confirmar: string }) => {
  const pista = e.clave.length > 0 ? 84 : 0;
  const error = e.clave !== e.confirmar ? 16 : 0;
  const alto = 592 + pista + error;
  const seccion = Math.max(VISTA.alto, alto + 32);
  const top = (seccion - alto) / 2;
  const correo = top + 164;
  const clave = correo + 58;
  const confirmar = clave + 40 + pista + 16;
  const terminos = confirmar + 40 + error + 16;
  const google = terminos + 96;
  const registrar = google + 54;
  return {
    top, alto, seccion, correo, clave, pista: clave + 40, confirmar, terminos, google, registrar,
    /** Centros para los toques. */
    toques: {
      correo: { x: 210, y: correo + 21 },
      clave: { x: 210, y: clave + 20 },
      confirmar: { x: 210, y: confirmar + 20 },
      casilla: { x: 54.5, y: terminos + 10.5 },
      google: { x: 195, y: google + 19 },
      registrar: { x: 195, y: registrar + 20 },
    },
  };
};

/** La pista de la contraseña: «Tu contraseña debe contener:» y las tres reglas con ✓ o ✗. `resalte` ilumina la que se cumple. */
const PistaClave: FC<{ y: number; clave: string; resalte?: number[] }> = ({ y, clave, resalte = [] }) => (
  <B y={y} h={84} style={{ fontSize: 12, lineHeight: '16px', textAlign: 'left', paddingTop: 8, boxSizing: 'border-box' }}>
    <p style={{ margin: '0 0 4px', color: SKY.s800 }}>Tu contraseña debe contener:</p>
    {REGLAS.map((r, i) => {
      const ok = r.cumple(clave);
      return (
        <div key={r.texto} style={{ marginTop: i ? 4 : 0, color: ok ? SKY.s900 : ROJO, display: 'flex' }}>
          <span style={{ display: 'inline-block', borderRadius: 4, padding: '0 3px', margin: '0 -3px', background: (resalte[i] ?? 0) > 0 ? `rgba(14,165,233,${0.22 * (resalte[i] ?? 0)})` : 'transparent' }}>
            {ok ? '✓' : '✗'} {r.texto}
          </span>
        </div>
      );
    })}
  </B>
);

export const PaginaRegistro: FC<{ e: EstadoRegistro; resaltePista?: number[] }> = ({ e, resaltePista }) => {
  const L = layoutRegistro(e);
  const r = (y: number) => y - L.top;
  const apagado = !!e.cargando;
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: L.seccion, fontFamily: instrument, lineHeight: 1.5, overflow: 'hidden' }}>
      <FotoFondo archivo="camisetas.webp" alto={L.seccion} />
      <Tarjeta top={L.top} alto={L.alto}>
        <Titulos />
        <Pildora texto="REGISTRO DE USUARIO" />
        <Campo y={r(L.correo)} tipo="correo" borde placeholder="Correo electrónico" valor={e.correo} foco={e.foco === 'correo'} escribiendo={e.escribiendo} f={e.f} apagado={apagado} />
        <Campo y={r(L.clave)} tipo="clave" placeholder="Contraseña" valor={e.clave} foco={e.foco === 'clave'} escribiendo={e.escribiendo} f={e.f} apagado={apagado} />
        {e.clave.length > 0 && <PistaClave y={r(L.pista)} clave={e.clave} resalte={resaltePista} />}
        <Campo y={r(L.confirmar)} tipo="clave" placeholder="Confirmar contraseña" valor={e.confirmar} foco={e.foco === 'confirmar'} escribiendo={e.escribiendo} f={e.f} apagado={apagado} />
        {e.clave !== e.confirmar && (
          <B y={r(L.confirmar) + 40} h={16} style={{ fontSize: 12, lineHeight: '16px', color: ROJO, textAlign: 'left' }}>
            Las contraseñas no coinciden
          </B>
        )}
        <B y={r(L.terminos)} h={80} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left', fontSize: 14, lineHeight: '20px', color: SKY.s900, opacity: apagado ? 0.5 : 1 }}>
          <Casilla marcada={e.acepto} golpe={e.golpeCasilla} />
          <span>
            Acepto las <span style={{ color: SKY.s600, textDecoration: 'underline' }}>Condiciones de Servicio</span> y la <span style={{ color: SKY.s600, textDecoration: 'underline' }}>Política de Privacidad</span>, y autorizo el tratamiento de mis datos personales conforme a ellas (Ley 1581 de 2012).
          </span>
        </B>
        <BotonGoogle y={r(L.google)} texto="Regístrate con Google" apretar={e.apretarGoogle} apagado={apagado} />
        <BotonAzul y={r(L.registrar)} texto={e.cargando ? 'Registrando...' : 'Registrarse'} apretar={e.apretarRegistrar} apagado={apagado} />
        <B y={r(L.registrar) + 56} h={20} style={{ textAlign: 'center', fontSize: 14, lineHeight: '20px', color: SKY.s800 }}>
          ¿Ya tienes una cuenta? <span style={{ color: SKY.s500 }}>Inicia sesión</span>
        </B>
      </Tarjeta>
    </div>
  );
};

// --- Revisa tu correo y Verificando (/verification/email) -------------------------------------------------------------

/** Dónde está el recuadro «El enlace expirará en 30 minutos.» (en la página). */
export const layoutRevisa = () => {
  const alto = 463;
  const top = (VISTA.alto - alto) / 2;
  return { top, alto, aviso: { y: top + 280, alto: 46 } };
};

/** «Revisa tu correo», con el correo escrito. `resalteAviso` (0 → 1) ilumina el recuadro de los 30 minutos. */
export const PaginaRevisaCorreo: FC<{ correo: string; resalteAviso?: number }> = ({ correo, resalteAviso = 0 }) => {
  const L = layoutRevisa();
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: VISTA.alto, fontFamily: instrument, lineHeight: 1.5, overflow: 'hidden' }}>
      <FotoFondo archivo="campo-futbol.webp" alto={VISTA.alto} />
      <Tarjeta top={L.top} alto={L.alto}>
        <B y={32} h={80} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: SKY.s100, display: 'grid', placeItems: 'center' }}>
            <svg width={48} height={48} fill="none" stroke={SKY.s500} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </B>
        <B y={136} h={120} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: schibsted, fontSize: 24, lineHeight: '32px', fontWeight: 700, color: '#111827' }}>Revisa tu correo</div>
          <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '20px', color: '#4b5563' }}>
            Te enviamos un enlace de verificación a <strong>{correo}</strong>. Haz clic en el enlace para activar tu cuenta.
          </p>
        </B>
        <B y={280} h={46}>
          <div style={{ height: 46, boxSizing: 'border-box', borderRadius: 8, background: SKY.s50, border: `1px solid ${SKY.s200}`, color: SKY.s700, fontSize: 14, lineHeight: '20px', display: 'grid', placeItems: 'center', boxShadow: resalteAviso > 0 ? `0 0 0 ${4 * resalteAviso}px rgba(14,165,233,${0.45 * resalteAviso})` : undefined, transform: `scale(${1 + 0.04 * resalteAviso})` }}>
            El enlace expirará en 30 minutos.
          </div>
        </B>
        <B y={350} h={37} style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, boxSizing: 'border-box', textAlign: 'center', fontSize: 14, lineHeight: '20px', color: '#4b5563' }}>
          ¿No recibiste el correo? <span style={{ color: SKY.s500, fontWeight: 600 }}>Reenviar enlace</span>
        </B>
        <B y={411} h={20} style={{ textAlign: 'center', fontSize: 14, lineHeight: '20px', color: SKY.s500 }}>
          Volver al inicio de sesión
        </B>
      </Tarjeta>
    </div>
  );
};

/** «Verificando tu correo»: el giro, el anillo que late y los tres puntos (con el fotograma `f`). */
export const PaginaVerificando: FC<{ f: number }> = ({ f }) => {
  const s = f / 30;
  const anillo = (s % 1.4) / 1.4;
  const punto = (i: number) => {
    const t = ((s - i * 0.2) % 1.4 + 1.4) % 1.4 / 1.4;
    const v = t < 0.4 ? t / 0.4 : t < 0.8 ? 1 - (t - 0.4) / 0.4 : 0;
    return { opacity: v, transform: `scale(${0.5 + 0.5 * v})` };
  };
  const top = (VISTA.alto - 340) / 2;
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: VISTA.alto, fontFamily: instrument, overflow: 'hidden' }}>
      <FotoFondo archivo="campo-futbol.webp" alto={VISTA.alto} />
      <Tarjeta top={top} alto={340}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 96, height: 96, display: 'grid', placeItems: 'center' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #38bdf8', transform: `scale(${0.8 + 0.8 * anillo})`, opacity: 0.8 * (1 - anillo) }} />
            <span style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: '#e0f2fe' }} />
            <svg width={56} height={56} viewBox="0 0 56 56" fill="none" style={{ position: 'relative', transform: `rotate(${(s / 0.9) * 360}deg)` }}>
              <circle cx={28} cy={28} r={24} stroke="#bae6fd" strokeWidth={5} />
              <path d="M28 4a24 24 0 0 1 24 24" stroke="#0ea5e9" strokeWidth={5} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: schibsted, fontSize: 20, fontWeight: 700, color: NAVY }}>Verificando tu correo</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block', ...punto(i) }} />
              ))}
            </div>
          </div>
        </div>
      </Tarjeta>
    </div>
  );
};

// --- Inicio de sesión (/signin?verified=true) -------------------------------------------------------------------------

export type EstadoSesion = { correo: string; clave: string; foco?: 'correo' | 'clave' | null; escribiendo?: boolean; verificado: boolean; pulsoAviso?: number; cargando?: boolean; apretarEntrar?: number; f: number };

export const layoutSesion = (verificado: boolean) => {
  const aviso = verificado ? 66 + 24 : 0;
  const alto = 472 + aviso;
  const top = (VISTA.alto - alto) / 2;
  const correo = top + 164 + aviso;
  const clave = correo + 58;
  const google = clave + 40 + 16 + 16 + 16;
  const entrar = google + 54;
  return { top, alto, aviso: top + 164, correo, clave, google, entrar, toques: { correo: { x: 210, y: correo + 21 }, clave: { x: 210, y: clave + 20 }, entrar: { x: 195, y: entrar + 20 }, registrate: { x: 284, y: entrar + 66 } } };
};

export const PaginaInicioSesion: FC<{ e: EstadoSesion }> = ({ e }) => {
  const L = layoutSesion(e.verificado);
  const r = (y: number) => y - L.top;
  const p = e.pulsoAviso ?? 0;
  const apagado = !!e.cargando;
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: VISTA.alto, fontFamily: instrument, lineHeight: 1.5, overflow: 'hidden' }}>
      <FotoFondo archivo="campo-futbol.webp" alto={VISTA.alto} />
      <Tarjeta top={L.top} alto={L.alto}>
        <Titulos />
        <Pildora texto="INICIO DE SESIÓN" />
        {e.verificado && (
          <B y={164} h={66}>
            <div style={{ height: 66, boxSizing: 'border-box', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 14, lineHeight: '20px', padding: '12px 16px', textAlign: 'center', boxShadow: p > 0 ? `0 0 0 ${5 * p}px rgba(34,197,94,${0.35 * p})` : undefined, transform: `scale(${1 + 0.05 * p})` }}>
              ¡Correo verificado! Ya puedes iniciar sesión.
            </div>
          </B>
        )}
        <Campo y={r(L.correo)} tipo="correo" borde placeholder="Correo electrónico" valor={e.correo} foco={e.foco === 'correo'} escribiendo={e.escribiendo} f={e.f} apagado={apagado} />
        <Campo y={r(L.clave)} tipo="clave" placeholder="Contraseña" valor={e.clave} foco={e.foco === 'clave'} escribiendo={e.escribiendo} f={e.f} apagado={apagado} />
        <B y={r(L.clave) + 56} h={16} style={{ textAlign: 'right', fontSize: 12, lineHeight: '16px', color: SKY.s700, fontWeight: 600 }}>
          ¿Has olvidado tu contraseña?
        </B>
        <BotonGoogle y={r(L.google)} texto="Iniciar sesión con Google" apagado={apagado} />
        <BotonAzul y={r(L.entrar)} texto={e.cargando ? 'Iniciando sesión...' : 'Iniciar sesión'} apretar={e.apretarEntrar} apagado={apagado} />
        <B y={r(L.entrar) + 56} h={20} style={{ textAlign: 'center', fontSize: 14, lineHeight: '20px', color: SKY.s800 }}>
          ¿Aún no tienes una cuenta? <span style={{ color: SKY.s500 }}>Regístrate</span>
        </B>
      </Tarjeta>
    </div>
  );
};

// --- El correo de verificación, en la app de correo del celular --------------------------------------------------------

/** Dónde empieza la tarjeta del correo (en la pantalla, sin desplazar). */
const CORREO_Y = 266;
/** Alturas de los bloques de la tarjeta (a lo ancho del celular: 358 px). */
const CC = { cabecera: 81, linea: 3, arriba: 40, kicker: 22, titulo: 93, hola: 27.5, parrafo: 164, boton: 47 };
const Y_BOTON = CC.cabecera + CC.linea + CC.arriba + CC.kicker + CC.titulo + CC.hola + CC.parrafo;
/** Centro del botón «Verificar mi correo» en la pantalla, con el correo desplazado `scroll`. */
export const botonVerificar = (scroll: number): Pt => ({ x: 195, y: CORREO_Y + Y_BOTON + CC.boton / 2 - scroll });

const Logotexto: FC<{ tamano: number; color: string }> = ({ tamano, color }) => (
  <span style={{ fontFamily: instrument, fontSize: tamano, fontWeight: 800, color, letterSpacing: 2, textTransform: 'uppercase' }}>
    GALI <span style={{ color: SKY.s500 }}>ESPORT</span>
  </span>
);

/** La app de correo con «Confirma tu correo — Gali Esport» abierto. `apretar` hunde el botón; `scroll` baja el correo. */
export const PantallaCorreoVerificacion: FC<{ nombre: string; hora: string; scroll?: number; apretar?: number }> = ({ nombre, hora, scroll = 0, apretar = 0 }) => {
  const IS: CSSProperties = { fontFamily: instrument };
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#ffffff', fontFamily: SISTEMA, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll, height: 2000 }}>
        <div style={{ position: 'absolute', left: 18, right: 18, top: 108, fontSize: 21, lineHeight: '27px', color: '#1f1f1f' }}>
          Confirma tu correo — Gali Esport{' '}
          <span style={{ display: 'inline-block', fontSize: 12, lineHeight: '18px', padding: '0 6px', borderRadius: 4, background: '#e9eef6', color: '#444746', verticalAlign: 'middle' }}>Recibidos</span>
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, top: 186, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: SKY.s500, color: 'white', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600 }}>G</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1f1f1f' }}>Gali Esport</span>
              <span style={{ fontSize: 13, color: '#5e5e5e' }}>{hora}</span>
            </div>
            <div style={{ fontSize: 13, color: '#5e5e5e' }}>para mí ▾</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: CORREO_Y - 18, height: 1500, background: SKY.s50 }} />
        <div style={{ position: 'absolute', left: 16, top: CORREO_Y, width: 358, background: '#ffffff', borderRadius: 4, boxShadow: '0 2px 8px rgba(14,165,233,0.10),0 0 0 1px rgba(14,165,233,0.08)', overflow: 'hidden' }}>
          <div style={{ height: CC.cabecera, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, boxSizing: 'border-box' }}>
            <Logotexto tamano={24} color={NAVY} />
          </div>
          <div style={{ margin: '0 48px', height: CC.linea, background: `linear-gradient(90deg,${SKY.s500} 0%,${NAVY} 100%)`, borderRadius: 2 }} />
          <div style={{ padding: `${CC.arriba}px 48px 8px` }}>
            <p style={{ ...IS, margin: 0, height: CC.kicker, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: SKY.s500 }}>Verificación de cuenta</p>
            <div style={{ ...IS, height: CC.titulo, fontSize: 28, fontWeight: 400, color: NAVY, lineHeight: 1.3 }}>Confirma tu correo electrónico</div>
            <p style={{ ...IS, margin: 0, height: CC.hola, fontSize: 15, color: '#374151', lineHeight: 1.3 }}>
              Hola, <strong style={{ color: NAVY }}>{nombre}</strong>
            </p>
            <p style={{ ...IS, margin: 0, height: CC.parrafo, fontSize: 15, color: '#4b5563', lineHeight: 1.75 }}>
              Gracias por unirte a <strong style={{ color: NAVY }}>Gali Esport</strong>. Para activar tu cuenta y acceder a todas las funciones de la plataforma, confirma tu dirección de correo electrónico haciendo clic en el botón.
            </p>
            <div style={{ height: CC.boton, display: 'flex', justifyContent: 'center' }}>
              <span style={{ ...IS, display: 'inline-flex', alignItems: 'center', padding: '0 36px', borderRadius: 3, background: apretar > 0 ? SKY.s600 : SKY.s500, color: '#ffffff', fontSize: 14, fontWeight: 600, letterSpacing: 0.5, transform: apretar > 0 ? `scale(${1 - apretar * 0.06})` : undefined }}>Verificar mi correo</span>
            </div>
          </div>
          <div style={{ padding: '36px 48px' }}>
            <div style={{ borderLeft: `3px solid ${SKY.s500}`, paddingLeft: 20 }}>
              <p style={{ ...IS, margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>¿Por qué verificar tu correo?</p>
              <p style={{ ...IS, margin: '0 0 8px', fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                — <strong style={{ color: NAVY }}>Seguridad:</strong> Protege tu cuenta de accesos no autorizados.
              </p>
              <p style={{ ...IS, margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                — <strong style={{ color: NAVY }}>Acceso completo:</strong> Desbloquea la gestión de equipos, jugadores y torneos.
              </p>
            </div>
          </div>
          <div style={{ padding: '0 48px 36px' }}>
            <p style={{ ...IS, margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.7, borderTop: `1px solid ${SKY.s50}`, paddingTop: 20 }}>
              Si no creaste esta cuenta, puedes ignorar este correo con seguridad.
              <br />
              Este enlace expirará en <strong>30 minutos</strong>.
            </p>
          </div>
          <div style={{ background: NAVY, padding: '28px 48px 24px' }}>
            <Logotexto tamano={16} color="#ffffff" />
          </div>
        </div>
      </div>
      {/* Barra de herramientas (fija) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 98, background: '#ffffff', zIndex: 5 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 50, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
          <svg width={22} height={22} viewBox="0 0 24 24">
            <path d="M20 12H5M11 5l-7 7 7 7" stroke="#444746" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid #444746', boxSizing: 'border-box', opacity: 0.85 }} />
            ))}
            <span style={{ fontSize: 22, lineHeight: '18px', fontWeight: 700, color: '#444746' }}>⋮</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Aviso del correo que baja desde arriba de la pantalla. `t` (0 → 1) lo hace bajar; `apretar` lo hunde. */
export const AVISO_CORREO: Pt = { x: 195, y: 96 };
export const AvisoCorreo: FC<{ t: number; hora?: string; apretar?: number }> = ({ t, hora = 'ahora', apretar = 0 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: 10, right: 10, top: 52 - (1 - t) * 150, height: 88, borderRadius: 24, background: 'rgba(246,246,248,0.97)', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', boxSizing: 'border-box', fontFamily: SISTEMA, zIndex: 60, transform: `scale(${1 - 0.03 * apretar})` }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(180deg,#38bdf8,#0284c7)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x={3} y={5} width={18} height={14} rx={2} />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e' }}>Gali Esport</span>
          <span style={{ fontSize: 13, color: '#8e8e93' }}>{hora}</span>
        </div>
        <div style={{ fontSize: 15, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Confirma tu correo — Gali Esport</div>
        <div style={{ fontSize: 14, color: '#6e6e73', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Verificación de cuenta · Confirma tu correo electrónico</div>
      </div>
    </div>
  ) : null;

// --- Elegir la cuenta (genérica) --------------------------------------------------------------------------------------

/** Centro de la cuenta de la lista (en la pantalla). */
export const CUENTA_TOQUE: Pt = { x: 195, y: 443 };

/** Ventana sobria para elegir la cuenta con que se entra. `t` (0 → 1) la hace aparecer; `elegida` (0 → 1) marca la fila. */
export const ElegirCuenta: FC<{ t: number; nombre: string; correo: string; elegida?: number }> = ({ t, nombre, correo, elegida = 0 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: 0, right: 0, top: NAV_ALTO, bottom: 0, zIndex: 30 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.45 * t})` }} />
      <div style={{ position: 'absolute', left: 22, right: 22, top: 230, borderRadius: 22, background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '24px 0 10px', fontFamily: SISTEMA, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 30}px) scale(${0.94 + 0.06 * t})` }}>
        <div style={{ padding: '0 24px', fontSize: 21, fontWeight: 700, color: '#111827' }}>Elige una cuenta</div>
        <div style={{ padding: '4px 24px 16px', fontSize: 15, color: '#6b7280' }}>para continuar a Gali Esport</div>
        <div style={{ borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', background: elegida > 0 ? `rgba(14,165,233,${0.12 * elegida})` : 'transparent' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: SKY.s600, color: 'white', display: 'grid', placeItems: 'center', fontSize: 19, fontWeight: 700, flexShrink: 0 }}>{nombre[0]}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{nombre}</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>{correo}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', fontSize: 16, color: '#374151' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid #d1d5db', boxSizing: 'border-box', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <User size={20} color="#6b7280" />
          </div>
          Usar otra cuenta
        </div>
      </div>
    </div>
  ) : null;

// --- El inicio (/) en el celular ---------------------------------------------------------------------------------------

/** Centro del botón «Empieza gratis» (en la página). */
export const EMPIEZA: Pt = { x: 195, y: 487 };
/** La hamburguesa de la barra (abre el menú) y «Iniciar sesión» dentro del menú (en la página). */
export const MENU_HAMBURGUESA: Pt = { x: 342, y: 36 };
export const MENU_LOGIN: Pt = { x: 160, y: 643 };

/**
 * El menú del celular (SiteHeader: gs-drawer): entra desde la izquierda sobre el velo azul, con el lockup y la ✕,
 * los enlaces y abajo «Iniciar sesión» y «Empezar →». `t` (0 → 1) lo abre; `apretarLogin` hunde «Iniciar sesión».
 */
const MenuMovil: FC<{ t: number; apretarLogin?: number }> = ({ t, apretarLogin = 0 }) =>
  t > 0 ? (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,74,110,0.4)', backdropFilter: 'blur(2px)', opacity: Math.min(1, t * 1.2), zIndex: 60 }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 320,
          boxSizing: 'border-box',
          padding: '17.6px 17.6px 24px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0e1c2b, #0a1420)',
          color: '#e2e8f0',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 60px rgba(0,0,0,0.55)',
          transform: `translateX(${(t - 1) * 100}%)`,
          fontFamily: instrument,
          lineHeight: 1.5,
          zIndex: 61,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <LockupGali alto={26} />
          <span style={{ width: 36, height: 36, borderRadius: 9, boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 19.2, lineHeight: 1 }}>✕</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0' }}>
          {['Torneos', 'Clubes', 'Blog', 'Precios', 'Nosotros'].map((x) => (
            <span key={x} style={{ display: 'block', padding: 13.6, borderRadius: 10, color: '#97a9bd', fontSize: 15.2, fontWeight: 500 }}>
              {x}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 9.6, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ display: 'block', textAlign: 'center', padding: 11.2, borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: apretarLogin > 0 ? `rgba(255,255,255,${0.1 * apretarLogin})` : undefined, color: '#e2e8f0', fontWeight: 600, fontSize: 13.6, transform: apretarLogin > 0 ? `scale(${1 - 0.04 * apretarLogin})` : undefined }}>
            Iniciar sesión
          </span>
          <span style={{ display: 'block', textAlign: 'center', padding: 11.2, borderRadius: 999, background: 'linear-gradient(180deg, #41e3f7, #16c7e6)', color: '#04212c', fontWeight: 600, fontSize: 15.2 }}>Empezar →</span>
        </div>
      </div>
    </>
  ) : null;

/** El lockup «GALI ESPORT» blanco de la barra (public/svg/gali-esport-lockup-horizontal-oscuro.svg, con su letra). */
export const LockupGali: FC<{ alto: number }> = ({ alto }) => (
  <svg height={alto} viewBox="0 0 593 140" style={{ display: 'block' }}>
    <g transform="translate(20 20)">
      <path d="M86 40L86 36A22 22 0 0 0 64 14L36 14A22 22 0 0 0 14 36L14 64A22 22 0 0 0 36 86L64 86A22 22 0 0 0 86 64L86 60" fill="none" stroke="#FFFFFF" strokeWidth={13} />
      <path d="M48 27.5H68L64 36.5H44Z M48 45.5H90L86 54.5H44Z M48 63.5H68L64 72.5H44Z" fill="#00D4FF" />
    </g>
    <text x={156} y={70} dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={60} letterSpacing={4.8} fill="#FFFFFF">GALI</text>
    <text x={323.76} y={70} dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={500} fontSize={60} letterSpacing={4.8} fill="#94A3B8">ESPORT</text>
  </svg>
);

/**
 * El héroe del inicio en el celular (tema claro): «Gestiona. Entrena. Gana.» que sube al cargar (`s`, segundos desde
 * que abre), el texto, «Empieza gratis» y «Ver cómo funciona». `hover`/`apretar` para el botón.
 */
export const PaginaInicioMovil: FC<{ s: number; hover?: number; apretar?: number; menu?: number; apretarMenu?: number; apretarLogin?: number }> = ({ s, hover = 0, apretar = 0, menu = 0, apretarMenu = 0, apretarLogin = 0 }) => {
  const sube = (retraso: number, dur: number) => interpolate(s, [retraso, retraso + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  const palabras = ['Gestiona.', 'Entrena.', 'Gana.'];
  const fade = (retraso: number): CSSProperties => {
    const t = sube(retraso, 1);
    return { opacity: t, transform: `translateY(${(1 - t) * 18}px)` };
  };
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: VISTA.alto, background: '#fbfcfd', fontFamily: instrument, color: '#0a1520', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(55% 45% at 50% 0%, rgba(0,212,255,0.16), transparent 70%)' }} />
      {/* Héroe */}
      <div style={{ position: 'absolute', left: 20, right: 20, top: 108, height: 32, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: jetbrains, fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0e7490', lineHeight: '16px', textWrap: 'balance', ...fade(0.5) } as CSSProperties}>
        Gali Esport · Clubes, torneos y jugadores
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 168, textAlign: 'center', fontFamily: schibsted, fontWeight: 800, fontSize: 57.6, letterSpacing: '-0.045em', lineHeight: 0.9 }}>
        {palabras.map((p, i) => {
          const t = sube(0.1 + i * 0.13, 1.1);
          const grad = i === palabras.length - 1;
          return (
            <span
              key={p}
              style={{
                display: 'block',
                padding: '0 0.04em',
                opacity: t,
                transform: `translateY(${(1 - t) * 0.3}em)`,
                filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined,
                ...(grad ? { background: 'linear-gradient(100deg, #0c4a6e 0%, #0e7490 38%, #00a9d4 78%, #00c8f2 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : {}),
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
      <p style={{ position: 'absolute', left: 20, right: 20, top: 356, margin: 0, textAlign: 'center', fontSize: 17.6, lineHeight: 1.5, color: '#3d4c5c', textWrap: 'balance', ...fade(0.55) } as CSSProperties}>
        Equipos, entrenamientos, torneos y pagos de tu club, en una sola plataforma para entrenadores, organizadores y jugadores.
      </p>
      <div style={{ position: 'absolute', left: 0, right: 0, top: EMPIEZA.y - 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, ...fade(0.7) }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', height: 52, padding: '0 1.65rem', borderRadius: 999, background: '#0a1520', color: 'white', fontWeight: 600, fontSize: 16, boxShadow: `0 ${14 + 4 * hover}px ${30 + 6 * hover}px -14px rgba(14,116,144,0.45)`, transform: `translateY(${-hover}px) scale(${1 + 0.02 * hover - 0.05 * apretar})` }}>
          Empieza gratis
          <ArrowRight size={18} />
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0e7490', fontWeight: 600, fontSize: 16 }}>
          Ver cómo funciona
          <ArrowRight size={18} />
        </span>
      </div>
      {/* El portátil del panel asoma abajo, todavía inclinado */}
      <div style={{ position: 'absolute', left: 30, right: 30, top: 640, height: 260, perspective: 900, ...fade(0.9) }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 16, padding: 8, boxSizing: 'border-box', background: 'linear-gradient(180deg,#e4e8ec,#aab2bb)', boxShadow: '0 50px 100px -40px rgba(10,21,32,0.35)', transform: 'rotateX(38deg)', transformOrigin: '50% 0%' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 9, background: '#f4f7fa', display: 'flex', gap: 8, padding: 10, boxSizing: 'border-box' }}>
            <div style={{ width: 56, borderRadius: 6, background: '#ffffff', border: '1px solid #e3e9ef' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ height: 34, borderRadius: 6, background: '#ffffff', border: '1px solid #e3e9ef' }} />
              <div style={{ flex: 1, borderRadius: 6, background: '#eaf6fa' }} />
            </div>
          </div>
        </div>
      </div>
      {/* Barra flotante (fija): lockup, botón claro/noche y hamburguesa */}
      <div style={{ position: 'absolute', zIndex: 50, left: 16, right: 16, top: 10, height: 52, boxSizing: 'border-box', padding: '0 12px 0 16px', borderRadius: 14, color: '#e2e8f0', background: 'linear-gradient(180deg, rgba(17,31,46,0.9), rgba(9,17,27,0.92))', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 14px 34px -16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: montserrat }}>
        <LockupGali alto={30} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#97a9bd', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </span>
          <span style={{ width: 40, height: 40, padding: '0 9px', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, background: `rgba(255,255,255,${0.05 + 0.15 * apretarMenu})`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, transform: apretarMenu > 0 ? `scale(${1 - 0.08 * apretarMenu})` : undefined }}>
            {[0, 1, 2].map((i) => {
              const x = Math.min(1, menu * 1.5);
              const forma = i === 1 ? { opacity: 1 - x } : { transform: `translateY(${(i === 0 ? 7 : -7) * x}px) rotate(${(i === 0 ? 45 : -45) * x}deg)` };
              return <span key={i} style={{ display: 'block', height: 2, borderRadius: 2, background: '#cbd5e1', ...forma }} />;
            })}
          </span>
        </div>
      </div>
      <MenuMovil t={menu} apretarLogin={apretarLogin} />
    </div>
  );
};

// --- Selector de rol (/select-role) -------------------------------------------------------------------------------------

type Funcion = { Icono: LucideIcon; label: string; desc: string; lineas: 1 | 2 };
export type RolApp = { key: 'ORGANIZER' | 'COACH' | 'PLAYER'; label: string; tagline: string; description: string; lineasDesc: 2 | 3; flecha: string; glow: string; Tab: FC<{ color: string }>; features: Funcion[] };

const TabIcono: FC<{ color: string; children: ReactNode }> = ({ color, children }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconOrganizer: FC<{ color: string }> = ({ color }) => (
  <TabIcono color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </TabIcono>
);
const IconCoach: FC<{ color: string }> = ({ color }) => (
  <TabIcono color={color}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </TabIcono>
);
const IconPlayer: FC<{ color: string }> = ({ color }) => (
  <TabIcono color={color}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </TabIcono>
);

/** Los tres roles, como `ROLES` de SelectRoleClient.tsx. `lineas` y `lineasDesc`: cuántas líneas ocupa cada texto a 390 px. */
export const ROLES: RolApp[] = [
  {
    key: 'ORGANIZER',
    label: 'Organizador',
    tagline: 'para quien convoca, coordina y reúne',
    description: 'Crea torneos, coordina entrenadores y publica resultados desde un solo lugar.',
    lineasDesc: 2,
    flecha: '#d946ef',
    glow: 'rgba(217,70,239,0.28)',
    Tab: IconOrganizer,
    features: [
      { Icono: Home, label: 'Inicio', desc: 'Resumen de tus torneos y actividad reciente', lineas: 2 },
      { Icono: Trophy, label: 'Torneos', desc: 'Crea y gestiona tus torneos e inscripciones', lineas: 2 },
      { Icono: Users2, label: 'Mis Entrenadores', desc: 'Aprueba y coordina a los entrenadores vinculados', lineas: 2 },
      { Icono: CalendarCheck, label: 'Calendario', desc: 'Calendario unificado de partidos y eventos', lineas: 2 },
    ],
  },
  {
    key: 'COACH',
    label: 'Entrenador',
    tagline: 'para quien planifica, convoca y analiza',
    description: 'Gestiona tu escuela, planifica tus partidos y lleva el control de tus jugadores.',
    lineasDesc: 2,
    flecha: '#0ea5e9',
    glow: 'rgba(56,189,248,0.32)',
    Tab: IconCoach,
    features: [
      { Icono: Home, label: 'Inicio', desc: 'Resumen general de tu escuela y equipos', lineas: 1 },
      { Icono: School, label: 'Mi Escuela', desc: 'Publicaciones, categorías y noticias de tu escuela', lineas: 2 },
      { Icono: Trophy, label: 'Partidos', desc: 'Programa partidos y arma tus alineaciones', lineas: 2 },
      { Icono: Shield, label: 'Equipo', desc: 'Gestiona tu equipo y la información de tus jugadores', lineas: 2 },
      { Icono: Users, label: 'Usuarios', desc: 'Administra los jugadores vinculados a tu escuela', lineas: 2 },
      { Icono: FileText, label: 'Facturas', desc: 'Factura y cobra a tus jugadores', lineas: 1 },
    ],
  },
  {
    key: 'PLAYER',
    label: 'Jugador',
    tagline: 'para quien entrena, registra y compite',
    description: 'Sigue tu progreso, revisa tus entrenamientos y mantente conectado con tu equipo.',
    lineasDesc: 3,
    flecha: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    Tab: IconPlayer,
    features: [
      { Icono: Home, label: 'Inicio', desc: 'Resumen de tu actividad y próximos eventos', lineas: 2 },
      { Icono: Newspaper, label: 'Novedades', desc: 'Feed de noticias y publicaciones de tu equipo', lineas: 2 },
      { Icono: CalendarCheck, label: 'Asistencia', desc: 'Registra tu asistencia a entrenamientos y partidos', lineas: 2 },
      { Icono: FileText, label: 'Facturas', desc: 'Consulta y paga las facturas de tu club', lineas: 1 },
      { Icono: User, label: 'Perfil', desc: 'Tu ficha deportiva: posición, edad y estadísticas', lineas: 2 },
    ],
  },
];

const altoFuncion = (n: 1 | 2) => (n === 1 ? 61 : 77);
const PESTANAS_Y = 207;
/** Arriba de la descripción del rol (debajo del nombre y la frase en mono). */
const DESCRIPCION_Y = 364;

/** Dónde queda cada cosa del selector (en la página) para el rol `i`. */
export const layoutRol = (i: number) => {
  const rol = ROLES[i];
  const funciones: number[] = [];
  let y = DESCRIPCION_Y + rol.lineasDesc * 24.375 + 24;
  for (const fn of rol.features) {
    funciones.push(y);
    y += altoFuncion(fn.lineas) + 10;
  }
  const boton = y - 10 + 28;
  return {
    pestanas: PESTANAS_Y,
    pestana: (k: number): Pt => ({ x: 53 + 94.67 * (k + 0.5), y: PESTANAS_Y + 22.5 }),
    funciones,
    finFunciones: y - 10,
    boton,
    continuar: { x: 48 + 118, y: boton + 24 } as Pt,
    finTarjeta: boton + 48 + 28,
  };
};

const mezclarRgba = (a: string, b: string, t: number) => {
  const pa = a.match(/[\d.]+/g)!.map(Number);
  const pb = b.match(/[\d.]+/g)!.map(Number);
  const m = pa.map((v, k) => v + (pb[k] - v) * t);
  return `rgba(${Math.round(m[0])},${Math.round(m[1])},${Math.round(m[2])},${m[3].toFixed(3)})`;
};

/**
 * El selector de rol. `pestana` es la posición de la pastilla blanca (0, 1, 2; con decimales mientras se desliza),
 * `rol` el contenido que se ve, `aparece` (0 → 1) su entrada (roleFade), `brillo` el paso del brillo del rol anterior
 * (`rolAntes`) al de ahora. `resalte[k]` ilumina la función k; `resaltePestanas` las pestañas.
 */
export const PaginaElegirRol: FC<{ pestana: number; rol: number; rolAntes?: number; brillo?: number; aparece?: number; resalte?: number[]; resaltePestanas?: number; resaltePestana?: number[]; apretarContinuar?: number }> = ({ pestana, rol: i, rolAntes = i, brillo = 1, aparece = 1, resalte = [], resaltePestanas = 0, resaltePestana = [], apretarContinuar = 0 }) => {
  const rol = ROLES[i];
  const L = layoutRol(i);
  const glow = mezclarRgba(ROLES[rolAntes].glow, rol.glow, brillo);
  const activa = Math.round(pestana);
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: Math.max(VISTA.alto, L.finTarjeta + 64), background: '#f7f7f5', fontFamily: instrument, lineHeight: 1.5, color: '#0f172a' }}>
      {/* Barra de arriba */}
      <div style={{ position: 'absolute', left: 20, top: 0, height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Img src={staticFile('gali-esport/svg/gali-esport-isotipo-color.svg')} style={{ height: 36, width: 36 }} />
        <span style={{ fontFamily: schibsted, fontSize: 16.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          <span style={{ color: NAVY }}>Gali </span>
          <span style={{ color: SKY.s500 }}>Esport</span>
        </span>
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 96, fontFamily: schibsted, fontSize: 30, lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' }}>
        ¿Qué te trae a <span style={{ color: SKY.s600 }}>Gali Esport</span>?
      </div>
      {/* La tarjeta del rol */}
      <div style={{ position: 'absolute', left: 20, right: 20, top: 179, height: L.finTarjeta - 179, borderRadius: 20, overflow: 'hidden', color: 'white', background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 55%, #020617 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 78% 30%, ${glow}, transparent 55%)` }} />
        {/* Pestañas */}
        <div style={{ position: 'absolute', left: 28, right: 28, top: PESTANAS_Y - 179, height: 45, boxSizing: 'border-box', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: 4, display: 'flex', boxShadow: resaltePestanas > 0 ? `0 0 0 ${4 * resaltePestanas}px rgba(255,255,255,${0.35 * resaltePestanas})` : undefined }}>
          <div style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc((100% - 8px) / 3)', borderRadius: 999, background: 'white', transform: `translateX(${pestana * 100}%)` }} />
          {ROLES.map((r, k) => {
            const h = resaltePestana[k] ?? 0;
            const color = k === activa ? '#0f172a' : h > 0 ? `rgba(255,255,255,${0.65 + 0.35 * h})` : 'rgba(255,255,255,0.65)';
            // En la app (12,5 px, ícono de 16 y 6 de espacio) «Organizador» casi no cabe en su pastilla a 390 px de
            // ancho; aquí va un poco más chico para que cada pestaña respire (lo pidió el usuario).
            return (
              <div key={r.key} style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11.5, fontWeight: 500, letterSpacing: '-0.01em', color, borderRadius: 999, boxShadow: h > 0 ? `0 0 0 ${2.5 * h}px ${ROLES[k].flecha}` : undefined, transform: h > 0 ? `scale(${1 + 0.06 * h})` : undefined }}>
                <r.Tab color={color} />
                {r.label}
              </div>
            );
          })}
        </div>
        {/* Contenido del rol (roleFade) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: aparece, transform: `translateY(${(1 - aparece) * 6}px)` }}>
          <div style={{ position: 'absolute', left: 28, right: 28, top: 284 - 179, fontFamily: schibsted, fontSize: 36, lineHeight: '40px', fontWeight: 700, letterSpacing: '-0.025em' }}>{rol.label}</div>
          <div style={{ position: 'absolute', left: 28, right: 28, top: 330 - 179, fontFamily: jetbrains, fontSize: 12, lineHeight: '18px', color: 'rgba(255,255,255,0.45)' }}>{rol.tagline}</div>
          <div style={{ position: 'absolute', left: 28, right: 28, top: DESCRIPCION_Y - 179, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,0.8)' }}>{rol.description}</div>
          {rol.features.map((fn, k) => {
            const h = resalte[k] ?? 0;
            return (
              <div
                key={fn.label}
                style={{
                  position: 'absolute',
                  left: 28,
                  right: 28,
                  top: L.funciones[k] - 179,
                  height: altoFuncion(fn.lineas),
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  borderRadius: 12,
                  background: `rgba(255,255,255,${0.06 + 0.1 * h})`,
                  border: `1px solid ${h > 0 ? mezclarRgba('rgba(255,255,255,0.1)', rol.glow.replace(/[\d.]+\)$/, '1)'), h) : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: h > 0 ? `0 0 ${18 * h}px ${rol.glow}` : undefined,
                  padding: '12px 14px',
                  transform: `scale(${1 + 0.03 * h})`,
                }}
              >
                <span style={{ marginTop: 2, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <fn.Icono size={14} color="white" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{fn.label}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.375, color: 'rgba(255,255,255,0.55)' }}>{fn.desc}</div>
                </div>
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 28, top: L.boton - 179, height: 48, display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999, background: 'white', color: '#0f172a', fontWeight: 500, fontSize: 14, padding: '0 10px 0 20px', transform: apretarContinuar > 0 ? `scale(${1 - 0.05 * apretarContinuar})` : undefined, transformOrigin: '30% 50%' }}>
            Continuar como {rol.label}
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: rol.flecha, display: 'grid', placeItems: 'center' }}>
              <ArrowRight size={14} color="white" />
            </span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: L.finTarjeta + 24, fontSize: 12, color: '#64748b' }}>
        ¿No estás seguro? <span style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'underline', textUnderlineOffset: 2 }}>Compara los 3 roles</span>
      </div>
    </div>
  );
};

/** «Entrando a tu panel de …» (Loading.tsx): el isotipo con dos ondas, el giro y los tres puntos. `s` en segundos. */
export const PantallaCargando: FC<{ mensaje: string; s: number }> = ({ mensaje, s }) => {
  const onda = (retraso: number) => {
    const t = (((s - retraso) % 1.8) + 1.8) % 1.8 / 1.8;
    return { transform: `scale(${0.85 + 0.65 * t})`, opacity: 0.55 * (1 - t) };
  };
  const punto = (i: number) => {
    const t = (((s - i * 0.15) % 1.2) + 1.2) % 1.2 / 1.2;
    const v = t < 0.4 ? t / 0.4 : t < 0.8 ? 1 - (t - 0.4) / 0.4 : 0;
    return { transform: `translateY(${-4 * v}px)`, opacity: 0.35 + 0.65 * v };
  };
  const entra = Math.min(1, s / 0.35);
  return (
    <div style={{ position: 'relative', width: VISTA.ancho, height: VISTA.alto, background: '#f7f7f5', fontFamily: instrument, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 84, height: 84, display: 'grid', placeItems: 'center', opacity: entra, transform: `translateY(${(1 - entra) * 6}px)` }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: SKY.s500, ...onda(0) }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: SKY.s500, ...onda(0.9) }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxSizing: 'border-box', border: `3px solid ${SKY.s100}`, borderTopColor: SKY.s600, background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transform: `rotate(${s * 360}deg)` }} />
        <Isotipo tamano={40} style={{ position: 'relative' }} />
      </div>
      <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 2, fontSize: 16, lineHeight: '24px', fontWeight: 500, color: '#475569', opacity: entra }}>
        {mensaje.replace(/(\.{3}|…)$/, '')}
        <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: SKY.s600, display: 'inline-block', ...punto(i) }} />
          ))}
        </span>
      </p>
    </div>
  );
};
