// «Solicitar unirme»: lo que ve un papá (o un jugador) para pedir cupo en una escuela, en escritorio (desde `pedir-cupo`).
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Ventana: feature/join/components/JoinModal.tsx (560 px, arriba a 40 px, «Solicitud de ingreso» / «Únete a …»).
// - Contenido: feature/join/components/JoinFlow.tsx (sin sesión: formulario con «Continuar» → «Último paso: inicia sesión
//   o regístrate» → al entrar, «Enviando tu solicitud…» → «¡Solicitud enviada!»).
// - Formulario: feature/join/components/JoinForm.tsx («¿Quién está llenando el formulario?», acudiente, datos del jugador,
//   «Celular (WhatsApp)», categoría «Sugerida» por la edad, mensaje opcional).
// - Inicio de sesión en escritorio: app/(auth)/signin/[[...sign-in]]/SignInClient.tsx (foto de cancha y tarjeta de 448 px).
// Todo en píxeles de la pantalla (1280 de ancho). Los paneles fijos se dibujan sobre la página.
import { CalendarDays, ChevronDown, Eye, Lock, User } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import { ACADEMIA, EscudoFenix } from './escuela-publica';
import { instrument, schibsted } from './letras';

const C = { text: '#0F172A', muted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC' };
const anillo = (t = 0) => (t > 0 ? `0 0 0 ${3 * t}px rgba(14,165,233,${0.95 * t}), 0 0 ${20 * t}px rgba(14,165,233,${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.05})` : undefined);

export type CategoriaCupo = { id: string; nombre: string; edad: string };
/** Las categorías abiertas de la Academia (de ejemplo). */
export const CATEGORIAS_ACADEMIA: CategoriaCupo[] = [
  { id: 'sub8', nombre: 'Sub-8', edad: '6–8 años' },
  { id: 'sub10', nombre: 'Sub-10', edad: '9–10 años' },
  { id: 'sub12', nombre: 'Sub-12', edad: '11–12 años' },
];

// --- Medidas ---
const M = { x: 360, ancho: 560, y: 40, cabecera: 88 };
const IX = M.x + 20;
const IW = M.ancho - 40;
const COL = (IW - 12) / 2;
const Y0 = M.y + M.cabecera + 8;

/** Dónde queda cada parte del formulario (cambia si se elige «Soy el acudiente»). */
export const layoutSolicitud = (acudiente: boolean) => {
  const form = Y0 + 42 + 16;
  const quien = form;
  const botones = quien + 19.5 + 8;
  let y = quien + (acudiente ? 94 : 70) + 18;
  const nombreAcudiente = acudiente ? y : null;
  if (acudiente) y += 69.5 + 18;
  const nombres = y;
  y += 69.5 + 18;
  const fecha = y;
  y += 69.5 + 18;
  const categoria = y;
  y += 127.5 + 18;
  const mensaje = y;
  y += 105.5 + 18;
  const continuar = y;
  const fin = continuar + 45 + 10 + 18 + 22;
  const input = (yy: number, col = 0) => ({ x: IX + col * (COL + 12), y: yy + 25.5, ancho: COL, alto: 44 });
  return {
    quien: { jugador: { x: IX, y: botones, ancho: COL, alto: 42.5 }, acudiente: { x: IX + COL + 12, y: botones, ancho: COL, alto: 42.5 } },
    nombreAcudiente: nombreAcudiente == null ? null : { x: IX, y: nombreAcudiente + 25.5, ancho: IW, alto: 44 },
    nombres: input(nombres),
    apellidos: input(nombres, 1),
    fecha: input(fecha),
    celular: input(fecha, 1),
    categoria: (i: number) => ({ x: IX + (i % 2) * (COL + 12), y: categoria + 27.5 + Math.floor(i / 2) * 56, ancho: COL, alto: 44 }),
    categoriaY: categoria,
    mensaje: { x: IX, y: mensaje + 25.5, ancho: IW, alto: 80 },
    continuar: { x: IX, y: continuar, ancho: IW, alto: 45 },
    fin,
  };
};
/** «Último paso»: los botones «Iniciar sesión» y «Crear cuenta nueva». */
export const PASO_CUENTA = {
  iniciar: { x: IX, y: Y0 + 93 + 14, ancho: IW, alto: 45 },
  crear: { x: IX, y: Y0 + 93 + 14 + 45 + 14, ancho: IW, alto: 45 },
  texto: { x: IX, y: Y0, ancho: IW, alto: 93 },
};
/** «¡Solicitud enviada!»: el texto de la campanita. */
export const PASO_ENVIADA = { texto: { x: M.x + 90, y: Y0 + 16 + 64 + 10 + 32 + 10, ancho: 380, alto: 66 }, ventana: { x: M.x, y: M.y, ancho: M.ancho, alto: 360 } };

export type DatosSolicitud = {
  paso: 'form' | 'cuenta' | 'enviando' | 'enviada';
  acudiente: boolean;
  nombreAcudiente: string;
  nombres: string;
  apellidos: string;
  fecha: string;
  edad: string | null;
  celular: string;
  categoria: string | null;
  sugerida: string | null;
  mensaje: string;
  escribiendo?: 'nombreAcudiente' | 'nombres' | 'apellidos' | 'fecha' | 'celular' | 'mensaje' | null;
  hover?: Partial<Record<'acudiente' | 'continuar' | 'iniciar' | 'crear', number>>;
  apretar?: Partial<Record<'acudiente' | 'continuar' | 'iniciar', number>>;
  resalte?: Partial<Record<'categoria' | 'iniciar' | 'crear' | 'campanita' | 'revisa' | 'correo', number>>;
  /** Fotograma, para el giro de «Enviando…». */
  f: number;
  /** El paso nuevo entra (0 → 1). */
  entra?: number;
};

const inputStyle: CSSProperties = { width: '100%', height: 44, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'white', fontSize: 14, color: C.text, boxSizing: 'border-box', display: 'flex', alignItems: 'center', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden' };
const Caret: FC<{ on?: boolean }> = ({ on }) => (on ? <span style={{ display: 'inline-block', width: 1.5, height: 18, margin: '0 1px', background: C.text, verticalAlign: 'middle', flexShrink: 0 }} /> : null);
const enfoque = (on?: boolean): CSSProperties => (on ? { borderColor: '#93c5fd', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' } : {});

const Campo: FC<{ x: number; y: number; ancho: number; label: string; nota?: string | null; children: ReactNode }> = ({ x, y, ancho, label, nota, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: ancho }}>
    <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 6, height: 19.5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
      {nota && <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{nota}</span>}
    </span>
    {children}
  </div>
);
const Texto: FC<{ valor: string; ph?: string; caret?: boolean }> = ({ valor, ph = '', caret }) => (
  <>
    {!valor && <Caret on={caret} />}
    <span style={{ color: valor ? C.text : '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis' }}>{valor || ph}</span>
    {valor && <Caret on={caret} />}
  </>
);
const Bandera: FC = () => (
  <svg width={21} height={14} viewBox="0 0 3 2" style={{ borderRadius: 2, flexShrink: 0 }}>
    <rect width="3" height="1" fill="#FCD116" />
    <rect y="1" width="3" height="0.5" fill="#003893" />
    <rect y="1.5" width="3" height="0.5" fill="#CE1126" />
  </svg>
);

const Formulario: FC<{ d: DatosSolicitud; pc: string }> = ({ d, pc }) => {
  const L = layoutSolicitud(d.acudiente);
  const e = d.escribiendo;
  const who = d.acudiente ? ' del jugador' : '';
  const ha = d.hover?.acudiente ?? 0;
  const hc = d.hover?.continuar ?? 0;
  return (
    <>
      <p style={{ position: 'absolute', left: IX, top: Y0, width: IW, margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.5 }}>Llena tus datos y luego inicia sesión o crea tu cuenta en Gali Esport: la solicitud se enviará automáticamente.</p>
      <span style={{ position: 'absolute', left: IX, top: L.quien.jugador.y - 27.5, fontSize: 13, fontWeight: 600, color: C.text }}>¿Quién está llenando el formulario?</span>
      {[
        { r: L.quien.jugador, label: 'Soy el jugador', on: !d.acudiente, h: 0, a: 0 },
        { r: L.quien.acudiente, label: 'Soy el acudiente', on: d.acudiente, h: ha, a: d.apretar?.acudiente ?? 0 },
      ].map(({ r, label, on, h, a }) => (
        <span key={label} style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'grid', placeItems: 'center', boxSizing: 'border-box', border: `1.5px solid ${on ? pc : h > 0 ? '#CBD5E1' : C.border}`, background: on ? `${pc}12` : 'white', color: on ? pc : C.muted, transform: hundir(a) }}>
          {label}
        </span>
      ))}
      {d.acudiente && <p style={{ position: 'absolute', left: IX, top: L.quien.jugador.y + 42.5 + 6, margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Padre, madre o tutor legal. La cuenta con la que envías la solicitud queda a tu cargo.</p>}
      {L.nombreAcudiente && (
        <Campo x={IX} y={L.nombreAcudiente.y - 25.5} ancho={IW} label="Tu nombre completo (acudiente)">
          <div style={{ ...inputStyle, ...enfoque(e === 'nombreAcudiente') }}>
            <Texto valor={d.nombreAcudiente} ph="Ej. María Gómez" caret={e === 'nombreAcudiente'} />
          </div>
        </Campo>
      )}
      <Campo x={L.nombres.x} y={L.nombres.y - 25.5} ancho={COL} label={`Nombres${who}`}>
        <div style={{ ...inputStyle, ...enfoque(e === 'nombres') }}>
          <Texto valor={d.nombres} caret={e === 'nombres'} />
        </div>
      </Campo>
      <Campo x={L.apellidos.x} y={L.apellidos.y - 25.5} ancho={COL} label={`Apellidos${who}`}>
        <div style={{ ...inputStyle, ...enfoque(e === 'apellidos') }}>
          <Texto valor={d.apellidos} caret={e === 'apellidos'} />
        </div>
      </Campo>
      <Campo x={L.fecha.x} y={L.fecha.y - 25.5} ancho={COL} label={`Fecha de nacimiento${who}`} nota={d.edad}>
        <div style={{ ...inputStyle, justifyContent: 'space-between', ...enfoque(e === 'fecha') }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: d.fecha ? C.text : '#9CA3AF' }}>{d.fecha || 'dd/mm/aaaa'}</span>
            <Caret on={e === 'fecha'} />
          </span>
          <CalendarDays size={16} color={C.text} />
        </div>
      </Campo>
      <Campo x={L.celular.x} y={L.celular.y - 25.5} ancho={COL} label="Celular (WhatsApp)">
        <div style={{ ...inputStyle, gap: 8, ...enfoque(e === 'celular') }}>
          <Bandera />
          <ChevronDown size={12} color="#6b7280" />
          <span style={{ color: C.text }}>+57</span>
          <Texto valor={d.celular} ph="300 1234567" caret={e === 'celular'} />
        </div>
      </Campo>
      <span style={{ position: 'absolute', left: IX, top: L.categoriaY, fontSize: 13, fontWeight: 600, color: C.text }}>Categoría</span>
      {CATEGORIAS_ACADEMIA.map((c, i) => {
        const r = L.categoria(i);
        const on = d.categoria === c.id;
        const sug = d.sugerida === c.id;
        return (
          <div key={c.id} style={{ ...inputStyle, position: 'absolute', left: r.x, top: r.y, width: r.ancho, gap: 8, border: `1px solid ${on ? pc : C.border}`, boxShadow: [on ? `inset 0 0 0 1px ${pc}` : null, sug ? anillo(d.resalte?.categoria) : null].filter(Boolean).join(', ') || undefined, background: on ? `${pc}14` : 'white' }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: pc, flexShrink: 0 }} />
            <span style={{ fontWeight: 700 }}>{c.nombre}</span>
            <span style={{ flex: 1 }} />
            {sug ? (
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: '#047857', background: '#D1FAE5', borderRadius: 5, padding: '2px 6px' }}>Sugerida</span>
            ) : (
              <span style={{ fontSize: 12, color: C.muted }}>{c.edad}</span>
            )}
          </div>
        );
      })}
      <Campo x={L.mensaje.x} y={L.mensaje.y - 25.5} ancho={IW} label="Mensaje para el entrenador (opcional)">
        <div style={{ ...inputStyle, height: 80, alignItems: 'flex-start', whiteSpace: 'normal', ...enfoque(e === 'mensaje') }}>
          <span>
            {!d.mensaje && <Caret on={e === 'mensaje'} />}
            <span style={{ color: d.mensaje ? C.text : '#9CA3AF' }}>{d.mensaje || 'Posición, experiencia, disponibilidad de horario…'}</span>
            {d.mensaje && <Caret on={e === 'mensaje'} />}
          </span>
        </div>
      </Campo>
      <span style={{ position: 'absolute', left: L.continuar.x, top: L.continuar.y, width: IW, height: 45, borderRadius: 12, background: pc, color: 'white', fontSize: 14, fontWeight: 700, display: 'grid', placeItems: 'center', filter: hc > 0 ? `brightness(${1 - 0.08 * hc})` : undefined, transform: hundir(d.apretar?.continuar) }}>Continuar</span>
      <p style={{ position: 'absolute', left: IX, top: L.continuar.y + 45 + 10, width: IW, margin: 0, fontSize: 12, color: C.muted, textAlign: 'center' }}>El entrenador revisará tu solicitud y podrá contactarte por WhatsApp.</p>
    </>
  );
};

const PasoCuenta: FC<{ d: DatosSolicitud; pc: string }> = ({ d, pc }) => {
  const r = d.resalte ?? {};
  return (
    <>
      <div style={{ position: 'absolute', left: IX, top: Y0, width: IW }}>
        <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.35 }}>Último paso: inicia sesión o regístrate</h2>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.5 }}>
          Guardamos tus datos: apenas entres a tu cuenta, la solicitud se enviará sola. Si la creas con tu correo, primero confírmalo con el enlace que te enviaremos.{' '}
          <span style={{ borderRadius: 4, background: (r.correo ?? 0) > 0 ? `rgba(224,242,254,${r.correo})` : undefined, boxShadow: anillo(r.correo) }}>Como eres el acudiente, usa tu propio correo.</span>
        </p>
      </div>
      <span style={{ position: 'absolute', left: PASO_CUENTA.iniciar.x, top: PASO_CUENTA.iniciar.y, width: IW, height: 45, borderRadius: 12, background: pc, color: 'white', fontWeight: 700, fontSize: 14, display: 'grid', placeItems: 'center', boxShadow: anillo(r.iniciar), filter: (d.hover?.iniciar ?? 0) > 0 ? `brightness(${1 - 0.08 * (d.hover?.iniciar ?? 0)})` : undefined, transform: hundir(d.apretar?.iniciar) }}>Iniciar sesión</span>
      <span style={{ position: 'absolute', left: PASO_CUENTA.crear.x, top: PASO_CUENTA.crear.y, width: IW, height: 45, borderRadius: 12, border: `1px solid ${C.border}`, color: C.text, fontWeight: 600, fontSize: 14, display: 'grid', placeItems: 'center', boxSizing: 'border-box', boxShadow: anillo(r.crear) }}>Crear cuenta nueva</span>
      <span style={{ position: 'absolute', left: IX, top: PASO_CUENTA.crear.y + 45 + 14, width: IW, height: 31.5, color: C.muted, fontSize: 13, fontWeight: 600, display: 'grid', placeItems: 'center' }}>← Editar mis datos</span>
    </>
  );
};

const PasoEnviando: FC<{ pc: string; f: number }> = ({ pc, f }) => (
  <div style={{ position: 'absolute', left: IX, top: Y0, width: IW, display: 'grid', placeItems: 'center', gap: 14, padding: '36px 0' }}>
    <span style={{ width: 40, height: 40, borderRadius: 99, border: `3px solid ${pc}33`, borderTopColor: pc, boxSizing: 'border-box', transform: `rotate(${(f / 24) * 360}deg)` }} />
    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.muted }}>Enviando tu solicitud…</p>
  </div>
);

const PasoEnviada: FC<{ d: DatosSolicitud; pc: string }> = ({ d, pc }) => {
  const r = d.resalte ?? {};
  const t = d.entra ?? 1;
  return (
    <div style={{ position: 'absolute', left: IX, top: Y0, width: IW, display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center', padding: '16px 0 4px' }}>
      <span style={{ width: 64, height: 64, borderRadius: 99, background: '#D1FAE5', color: '#059669', display: 'grid', placeItems: 'center', transform: `scale(${0.6 + 0.4 * t})` }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5 9-9" strokeDasharray={20} strokeDashoffset={20 * (1 - t)} />
        </svg>
      </span>
      <h3 style={{ margin: '4px 0 0', fontFamily: schibsted, fontSize: 20, fontWeight: 800, color: C.text }}>¡Solicitud enviada!</h3>
      <p style={{ margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.5, maxWidth: 380 }}>
        <span style={{ borderRadius: 4, background: (r.revisa ?? 0) > 0 ? `rgba(224,242,254,${r.revisa})` : undefined, boxShadow: anillo(r.revisa), WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>{ACADEMIA.nombre} revisará tu solicitud para la categoría Sub-10.</span>{' '}
        <span style={{ borderRadius: 4, background: (r.campanita ?? 0) > 0 ? `rgba(224,242,254,${r.campanita})` : undefined, boxShadow: anillo(r.campanita), WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>Te avisaremos en la campanita de tu panel cuando el entrenador responda.</span>
      </p>
      <span style={{ marginTop: 8, padding: '11px 28px', borderRadius: 12, background: pc, color: 'white', fontSize: 14, fontWeight: 700 }}>Listo</span>
    </div>
  );
};

/** JoinModal con su contenido, sobre la página pública (pantalla de alto `vh`). `t` la abre (0 → 1). */
export const VentanaSolicitud: FC<{ d: DatosSolicitud; vh: number; t: number; pc: string }> = ({ d, vh, t, pc }) => {
  if (t <= 0) return null;
  const alto = d.paso === 'form' ? layoutSolicitud(d.acudiente).fin - M.y : d.paso === 'cuenta' ? PASO_CUENTA.crear.y + 45 + 14 + 31.5 + 22 - M.y : d.paso === 'enviando' ? Y0 + 147 + 22 - M.y : Y0 + 275 - M.y;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, zIndex: 100, fontFamily: instrument, lineHeight: 1.5 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.55 * t})`, backdropFilter: `blur(${3 * t}px)` }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 18}px)` }}>
        <div style={{ position: 'absolute', left: M.x, top: M.y, width: M.ancho, height: alto, background: 'white', borderRadius: 20, boxShadow: '0 24px 60px rgba(15,23,42,.25)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', height: M.cabecera, boxSizing: 'border-box', background: `linear-gradient(180deg, ${pc}1f 0%, #ffffff 100%)` }}>
            <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 14, background: 'white', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
              <EscudoFenix />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: '.05em' }}>Solicitud de ingreso</p>
              <h2 style={{ margin: '2px 0 0', fontFamily: schibsted, fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Únete a {ACADEMIA.nombre}</h2>
            </div>
            <span style={{ width: 34, height: 34, borderRadius: 99, border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: 15, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>✕</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, opacity: d.entra ?? 1 }}>
          {d.paso === 'form' && <Formulario d={d} pc={pc} />}
          {d.paso === 'cuenta' && <PasoCuenta d={d} pc={pc} />}
          {d.paso === 'enviando' && <PasoEnviando pc={pc} f={d.f} />}
          {d.paso === 'enviada' && <PasoEnviada d={d} pc={pc} />}
        </div>
      </div>
    </div>
  );
};

// --- Inicio de sesión en escritorio ---

const SKY = { s50: '#f0f9ff', s200: '#bae6fd', s400: '#38bdf8', s500: '#0ea5e9', s700: '#0369a1', s800: '#075985', s900: '#0c4a6e' };
const TX = 416 + 32;
/** La tarjeta de inicio de sesión (448 px, centrada) y sus controles, según el alto `vh`. */
export const SESION_PC = (vh: number) => {
  const top = (vh - 472) / 2;
  return { top, correo: { x: TX, y: top + 164, ancho: 384, alto: 42 }, clave: { x: TX, y: top + 222, ancho: 384, alto: 40 }, entrar: { x: TX, y: top + 364, ancho: 384, alto: 40 } };
};

export type DatosSesionPC = { correo: string; clave: string; foco?: 'correo' | 'clave' | null; cargando?: boolean; apretarEntrar?: number };

/** /signin en el computador: foto de la cancha y la tarjeta «Bienvenido a Gali Esport». */
export const PaginaInicioSesionPC: FC<{ d: DatosSesionPC; vh: number }> = ({ d, vh }) => {
  const L = SESION_PC(vh);
  const ap = d.cargando ? 0.5 : 1;
  const campo = (r: { x: number; y: number; ancho: number; alto: number }, Icono: typeof User, valor: string, ph: string, foco: boolean, clave?: boolean, borde?: boolean) => (
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, borderRadius: 6, background: SKY.s50, border: borde ? `1px solid ${foco ? 'transparent' : SKY.s200}` : undefined, boxShadow: foco ? `0 0 0 2px ${SKY.s400}` : undefined, boxSizing: 'border-box', opacity: ap }}>
      <Icono size={20} color={SKY.s400} style={{ position: 'absolute', left: 12, top: r.alto / 2 - 10 - (borde ? 1 : 0) }} />
      <div style={{ position: 'absolute', left: 40, right: clave ? 44 : 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 16, color: SKY.s800, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {valor ? <span style={clave ? { letterSpacing: 2.5, fontSize: 15 } : undefined}>{clave ? '•'.repeat(valor.length) : valor}</span> : !foco && <span>{ph}</span>}
        {foco && <Caret on />}
      </div>
      {clave && <Eye size={20} color={SKY.s500} style={{ position: 'absolute', right: 16, top: r.alto / 2 - 10 }} />}
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh, overflow: 'hidden', fontFamily: instrument, lineHeight: 1.5 }}>
      <Img src={staticFile('gali-esport/campo-futbol.webp')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', left: 416, top: L.top, width: 448, height: 472, borderRadius: 16, background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ position: 'absolute', left: 32, right: 32, top: 32 }}>
          <div style={{ fontFamily: schibsted, fontSize: 20, lineHeight: '28px', fontWeight: 700, color: SKY.s900 }}>Bienvenido a Gali Esport</div>
          <div style={{ fontSize: 14, lineHeight: '20px', color: SKY.s700, marginTop: 8 }}>Tu sitio ideal para la gestión de equipos</div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 112 }}>
          <span style={{ display: 'inline-block', background: SKY.s500, borderRadius: 999, padding: '4px 24px', color: 'white', fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>INICIO DE SESIÓN</span>
        </div>
        <div style={{ position: 'absolute', right: 32, top: 222 + 40 + 16, fontSize: 12, lineHeight: '16px', color: SKY.s700, fontWeight: 600 }}>¿Has olvidado tu contraseña?</div>
        <div style={{ position: 'absolute', left: 32, right: 32, top: 222 + 40 + 16 + 16 + 16, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 500, color: '#1f2937', opacity: ap }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z" />
          </svg>
          Iniciar sesión con Google
        </div>
        <div style={{ position: 'absolute', left: 32, right: 32, top: 364 + 40 + 16, fontSize: 14, lineHeight: '20px', color: SKY.s800, fontWeight: 300 }}>
          ¿Aún no tienes una cuenta? <span style={{ color: SKY.s500 }}>Regístrate</span>
        </div>
      </div>
      {campo(L.correo, User, d.correo, 'Correo electrónico', d.foco === 'correo', false, true)}
      {campo(L.clave, Lock, d.clave, 'Contraseña', d.foco === 'clave', true)}
      <div style={{ position: 'absolute', left: L.entrar.x, top: L.entrar.y, width: 384, height: 40, borderRadius: 6, background: SKY.s500, color: 'white', fontWeight: 700, fontSize: 16, display: 'grid', placeItems: 'center', opacity: ap, transform: hundir(d.apretarEntrar) }}>{d.cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}</div>
    </div>
  );
};
