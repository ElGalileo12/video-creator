// «Canchas» del ENTRENADOR en escritorio: dónde entrena la escuela, con qué permiso (el acta) y en qué horario, fiel a la
// app (desde `pedir-cupo`). Va dentro de `MarcoEntrenador` (escuela-panel.tsx) con el menú en «Canchas».
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Página: app/(dashboard)/coach/canchas/CanchasClient.tsx (encabezado, los 4 pasos «Ubica la cancha · Sube el acta y
//   el horario · Validación · Check-in por GPS», «Agrega tu primera cancha», la lista con el mapa a la derecha).
// - «Nueva cancha»: feature/fields/components/FieldEditorDrawer.tsx (panel de 640 a la derecha: 1 Nombre y sede,
//   2 Ubicación con buscador, mapa y «Estoy aquí», 3 Tipo de cancha, 4 Horario autorizado en el acta, 5 Acta de la cancha).
// - Estado: feature/fields/components/PermitBadge.tsx («Falta el acta», «En validación», «Validada», «Rechazada»).
// - Mapa: feature/fields/map/FieldsMap.tsx + fields-map.css (Leaflet con OpenStreetMap; pin con la canchita, zona de
//   check-in punteada). Aquí el mapa es un dibujo con los colores de OpenStreetMap (calles, parque, cancha, casas).
// - Tipos y radios: app/lib/training-fields.ts (radio = media diagonal de la cancha + 10 m).
// Al crear la cancha, la escuela ya sale con su distancia en galiesport.com/clubes (app/clubes/page.tsx toma las
// canchas activas); la validación del acta solo habilita el check-in por GPS.
// Todo en píxeles de la página (1280 de ancho); el mapa se dibuja en metros alrededor de la cancha (x al este, y al sur).
import { CheckCircle2, Clock, Clock3, Crosshair, FileCheck2, FileText, FileUp, FileWarning, Info, Loader2, MapPin, Navigation, Pencil, Plus, Satellite, Search, ShieldCheck, X } from 'lucide-react';
import type { CSSProperties, FC } from 'react';
import type { Tonos } from './escuela-panel';
import { instrument, jetbrains } from './letras';

// =============================================================================================================
// Tipos de cancha y horario (app/lib/training-fields.ts)
// =============================================================================================================

export type TipoCancha = 'F11' | 'F9' | 'F8' | 'F7' | 'F5' | 'SALA' | 'OTRO';
export const TIPOS_CANCHA: Record<TipoCancha, { label: string; largo: number; ancho: number }> = {
  F11: { label: 'Fútbol 11', largo: 105, ancho: 68 },
  F9: { label: 'Fútbol 9', largo: 75, ancho: 50 },
  F8: { label: 'Fútbol 8', largo: 65, ancho: 45 },
  F7: { label: 'Fútbol 7', largo: 55, ancho: 35 },
  F5: { label: 'Fútbol 5', largo: 40, ancho: 20 },
  SALA: { label: 'Fútbol sala', largo: 40, ancho: 20 },
  OTRO: { label: 'Otro escenario', largo: 50, ancho: 30 },
};
export const TIPOS_ORDEN = Object.keys(TIPOS_CANCHA) as TipoCancha[];
export const radioZona = (t: TipoCancha) => Math.round(Math.hypot(TIPOS_CANCHA[t].largo, TIPOS_CANCHA[t].ancho) / 2 + 10);

/** Una franja del horario: `dia` 0 domingo … 6 sábado; minutos desde la medianoche. */
export type Franja = { dia: number; inicio: number; fin: number };
const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const ETIQUETAS_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
/** De lunes a domingo, como la app. */
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const resumenFranjas = (franjas: Franja[]) => {
  const grupos = new Map<string, number[]>();
  for (const s of franjas) {
    const k = `${hhmm(s.inicio)}–${hhmm(s.fin)}`;
    grupos.set(k, [...(grupos.get(k) ?? []), s.dia]);
  }
  return [...grupos.entries()].map(([r, dias]) => `${ORDEN_DIAS.filter((d) => dias.includes(d)).map((d) => ETIQUETAS_DIA[d]).join(', ')} ${r}`).join(' · ');
};

// =============================================================================================================
// Colores
// =============================================================================================================

const C = { borde: '#E5E9F0', texto: '#0F172A', tenue: '#64748B', muted: 'rgba(241,245,249,0.3)', mutedFuerte: '#F1F5F9' };
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${22 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);

export type EstadoActa = 'falta' | 'pendiente' | 'validada';
const ESTADOS: Record<EstadoActa, { label: string; fg: string; bg: string; borde: string; Icono: typeof Clock3 }> = {
  falta: { label: 'Falta el acta', fg: '#9A3412', bg: '#FFF7ED', borde: '#FED7AA', Icono: FileWarning },
  pendiente: { label: 'En validación', fg: '#92400E', bg: '#FFFBEB', borde: '#FDE68A', Icono: Clock3 },
  validada: { label: 'Validada', fg: '#047857', bg: '#ECFDF5', borde: '#A7F3D0', Icono: CheckCircle2 },
};

export const InsigniaActa: FC<{ estado: EstadoActa; resalte?: number; escala?: number }> = ({ estado, resalte = 0, escala = 1 }) => {
  const s = ESTADOS[estado];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, border: `1px solid ${s.borde}`, background: s.bg, color: s.fg, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: anillo(resalte, estado === 'validada' ? '16,185,129' : '14,165,233'), transform: escala !== 1 ? `scale(${escala})` : undefined }}>
      <s.Icono size={12} />
      {s.label}
    </span>
  );
};

// =============================================================================================================
// El mapa (dibujo con los colores de OpenStreetMap)
// =============================================================================================================

/** Lo que muestra el mapa: centro en metros y metros por píxel. */
export type VistaMapa = { x: number; y: number; mpp: number };
export type PinMapa = { x: number; y: number; tipo: 'picker' | 'pendiente' | 'validada'; radio?: number; seleccionado?: boolean; alzar?: number };

const OSM = { tierra: '#f2efe9', residencial: '#e0dfdf', casa: '#d9d0c9', casaBorde: '#c4b6ab', parque: '#c8facc', cancha: '#88e0be', canchaBorde: '#6fc4a2', calle: '#ffffff', calleBorde: '#c6bfb8', primaria: '#fcd6a4', primariaBorde: '#d39b55', secundaria: '#f7fabf', secundariaBorde: '#b9be72', sendero: '#fa8072' };

/** Calles: x de las carreras (norte–sur) y y de las calles (este–oeste), en metros. */
const CARRERAS = [-655, -545, -435, -325, -215, -105, 105, 215, 325, 435, 545, 655];
const CALLES = [-520, -410, -300, -190, -80, 80, 190, 300, 410, 520];
const ANCHO_CALLE = (x: number, eje: 'x' | 'y') => (eje === 'x' && x === -105 ? 18 : eje === 'y' && x === -80 ? 14 : 9);
const NOMBRE_CARRERA: Record<number, string> = { [-105]: 'Carrera 15', 105: 'Carrera 14', [-215]: 'Carrera 16', 215: 'Carrera 13', [-325]: 'Carrera 17' };
const NOMBRE_CALLE: Record<number, string> = { [-80]: 'Calle 127', 80: 'Calle 126', [-190]: 'Calle 128', 190: 'Calle 125' };

// Casas de cada manzana (fijas: un patrón por manzana para que no se vea repetido)
const pseudo = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
type Rect = { x: number; y: number; w: number; h: number };
const MANZANAS: { r: Rect; tipo: 'parque' | 'casas' | 'verde' }[] = [];
const CASAS: Rect[] = [];
{
  const xs = [-760, ...CARRERAS, 760];
  const ys = [-620, ...CALLES, 620];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const a = xs[i] + ANCHO_CALLE(xs[i], 'x') / 2;
      const b = xs[i + 1] - ANCHO_CALLE(xs[i + 1], 'x') / 2;
      const c = ys[j] + ANCHO_CALLE(ys[j], 'y') / 2;
      const d = ys[j + 1] - ANCHO_CALLE(ys[j + 1], 'y') / 2;
      const r = { x: a, y: c, w: b - a, h: d - c };
      if (xs[i] === -105 && ys[j] === -80) {
        MANZANAS.push({ r, tipo: 'parque' });
        continue;
      }
      const n = i * 31 + j * 7;
      if (pseudo(n) < 0.08) {
        MANZANAS.push({ r, tipo: 'verde' });
        continue;
      }
      MANZANAS.push({ r, tipo: 'casas' });
      // Casas en el borde de la manzana (frente a la calle), con patio en el centro
      const paso = 13 + Math.round(pseudo(n + 1) * 5);
      const fondo = 15 + Math.round(pseudo(n + 2) * 6);
      for (let x = r.x + 3; x + paso - 2 < r.x + r.w - 3; x += paso) {
        CASAS.push({ x, y: r.y + 3, w: paso - 2, h: fondo });
        CASAS.push({ x, y: r.y + r.h - 3 - fondo, w: paso - 2, h: fondo });
      }
      for (let y = r.y + 3 + fondo + 2; y + paso - 2 < r.y + r.h - 3 - fondo - 2; y += paso) {
        CASAS.push({ x: r.x + 3, y, w: fondo, h: paso - 2 });
        CASAS.push({ x: r.x + r.w - 3 - fondo, y, w: fondo, h: paso - 2 });
      }
    }
  }
}

/** El pin de la app (gs-pin): gota de color con la canchita blanca. La punta cae en (0, 0). */
const PinCancha: FC<{ color: string; seleccionado?: boolean; alzar?: number }> = ({ color, seleccionado, alzar = 0 }) => (
  <div style={{ position: 'absolute', left: -15, top: -36, width: 30, height: 38, transformOrigin: '50% 95%', transform: `scale(${seleccionado ? 1.28 : 1}) translateY(${-6 * alzar}px)` }}>
    <div style={{ position: 'absolute', left: 9, bottom: -2 - 3 * alzar, width: 12, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', filter: 'blur(1px)' }} />
    <div
      style={{
        position: 'absolute',
        left: 3,
        top: 0,
        width: 24,
        height: 24,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: color,
        boxShadow: seleccionado ? `0 0 0 2px #fff, 0 0 0 6px ${color}59, 0 8px 18px rgba(0,0,0,0.35)` : '0 0 0 2px #fff, 0 6px 14px rgba(0,0,0,0.28)',
      }}
    >
      <div style={{ position: 'absolute', left: 6, top: 6, width: 12, height: 12, border: '1.6px solid rgba(255,255,255,0.95)', borderRadius: 2, transform: 'rotate(45deg)', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: '50%', top: -1, bottom: -1, borderLeft: '1.4px solid rgba(255,255,255,0.95)' }} />
      </div>
    </div>
  </div>
);
const COLOR_PIN = { picker: '#0f766e', pendiente: '#f59e0b', validada: '#22c55e' };

export const MapaCalles: FC<{ ancho: number; alto: number; vista: VistaMapa; pines?: PinMapa[]; f?: number }> = ({ ancho, alto, vista, pines = [], f = 0 }) => {
  const { mpp } = vista;
  const aPx = (x: number, y: number) => ({ x: ancho / 2 + (x - vista.x) / mpp, y: alto / 2 + (y - vista.y) / mpp });
  const letra = 11.5 * mpp;
  const pitch = TIPOS_CANCHA.F8;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: OSM.tierra, fontFamily: instrument }}>
      <svg width={ancho} height={alto} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g transform={`translate(${ancho / 2} ${alto / 2}) scale(${1 / mpp}) translate(${-vista.x} ${-vista.y})`}>
          {MANZANAS.map(({ r, tipo }, k) => (
            <rect key={k} x={r.x} y={r.y} width={r.w} height={r.h} fill={tipo === 'parque' || tipo === 'verde' ? OSM.parque : OSM.residencial} />
          ))}
          {CASAS.map((c, k) => (
            <rect key={k} x={c.x} y={c.y} width={c.w} height={c.h} fill={OSM.casa} stroke={OSM.casaBorde} strokeWidth={0.6} />
          ))}
          {/* El parque: senderos y la cancha (65 × 45 m) */}
          <g fill="none" stroke={OSM.sendero} strokeWidth={1.4} strokeDasharray="3 2.4" opacity={0.8}>
            <rect x={-48} y={-38} width={96} height={76} rx={10} />
            <path d="M-96 0H-48M48 0H96M0 -71V-38M0 38V71" />
          </g>
          <rect x={-pitch.largo / 2} y={-pitch.ancho / 2} width={pitch.largo} height={pitch.ancho} fill={OSM.cancha} stroke={OSM.canchaBorde} strokeWidth={0.8} />
          {/* Calles: borde y relleno */}
          {CARRERAS.map((x) => (
            <line key={`bc${x}`} x1={x} y1={-700} x2={x} y2={700} stroke={x === -105 ? OSM.primariaBorde : OSM.calleBorde} strokeWidth={ANCHO_CALLE(x, 'x') + 2.2} />
          ))}
          {CALLES.map((y) => (
            <line key={`bl${y}`} x1={-800} y1={y} x2={800} y2={y} stroke={y === -80 ? OSM.secundariaBorde : OSM.calleBorde} strokeWidth={ANCHO_CALLE(y, 'y') + 2.2} />
          ))}
          {CARRERAS.filter((x) => x !== -105).map((x) => (
            <line key={`c${x}`} x1={x} y1={-700} x2={x} y2={700} stroke={OSM.calle} strokeWidth={ANCHO_CALLE(x, 'x')} />
          ))}
          {CALLES.map((y) => (
            <line key={`l${y}`} x1={-800} y1={y} x2={800} y2={y} stroke={y === -80 ? OSM.secundaria : OSM.calle} strokeWidth={ANCHO_CALLE(y, 'y')} />
          ))}
          <line x1={-105} y1={-700} x2={-105} y2={700} stroke={OSM.primaria} strokeWidth={18} />
          {/* Nombres */}
          <g fontFamily="Helvetica, Arial, sans-serif" fontSize={letra} fill="#555" stroke="#fff" strokeWidth={letra * 0.28} paintOrder="stroke" textAnchor="middle">
            {Object.entries(NOMBRE_CARRERA).map(([x, n]) => (
              <text key={n} transform={`translate(${Number(x) + letra * 0.35} ${vista.y - 60 * mpp}) rotate(-90)`}>{n}</text>
            ))}
            {Object.entries(NOMBRE_CALLE).map(([y, n]) => (
              <text key={n} x={vista.x + 150 * mpp} y={Number(y) + letra * 0.35}>{n}</text>
            ))}
            {mpp < 1.6 && (
              <text x={0} y={-48 - letra * 0.6} fill="#297a33" fontStyle="italic">Parque Santa Bárbara</text>
            )}
          </g>
          {/* Zonas de check-in */}
          {pines
            .filter((p) => p.radio)
            .map((p, k) => {
              const color = p.tipo === 'picker' ? '#0f766e' : COLOR_PIN[p.tipo];
              const relleno = p.tipo === 'picker' ? '#14b8a6' : COLOR_PIN[p.tipo];
              return <circle key={k} cx={p.x} cy={p.y} r={p.radio} fill={relleno} fillOpacity={p.tipo === 'picker' ? 0.12 : 0.1} stroke={color} strokeWidth={2 * mpp} strokeDasharray={`${6 * mpp} ${6 * mpp}`} />;
            })}
        </g>
      </svg>
      {pines.map((p, k) => {
        const q = aPx(p.x, p.y);
        const pulso = p.tipo === 'pendiente' ? (f % 66) / 66 : 0;
        return (
          <div key={k} style={{ position: 'absolute', left: q.x, top: q.y, width: 0, height: 0, zIndex: 3 }}>
            {p.tipo === 'pendiente' && (
              <div style={{ position: 'absolute', left: -21, top: -45, width: 42, height: 42, borderRadius: '50%', border: `2px solid ${COLOR_PIN.pendiente}`, opacity: 0.7 * (1 - pulso), transform: `scale(${0.8 + 0.7 * pulso})`, boxSizing: 'border-box' }} />
            )}
            <PinCancha color={COLOR_PIN[p.tipo]} seleccionado={p.seleccionado} alzar={p.alzar} />
          </div>
        );
      })}
      {/* Controles de Leaflet */}
      <div style={{ position: 'absolute', left: 10, top: 10, width: 34, borderRadius: 4, border: '2px solid rgba(0,0,0,0.2)', background: '#fff', backgroundClip: 'padding-box', overflow: 'hidden', zIndex: 4 }}>
        {['+', '−'].map((s, k) => (
          <div key={s} style={{ height: 30, display: 'grid', placeItems: 'center', fontFamily: '"Lucida Console", Monaco, monospace', fontSize: 22, fontWeight: 700, color: '#000', borderTop: k ? '1px solid #ccc' : undefined }}>
            {s}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, padding: '0 5px', background: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: '16px', color: '#333', zIndex: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ display: 'inline-block', width: 12, height: 8 }}>
          <span style={{ display: 'block', height: 4, background: '#4C7BE1' }} />
          <span style={{ display: 'block', height: 4, background: '#FFD500' }} />
        </span>
        <span style={{ color: '#0078A8' }}>Leaflet</span> | © <span style={{ color: '#0078A8' }}>OpenStreetMap</span>
      </div>
    </div>
  );
};

// =============================================================================================================
// La página «Canchas»
// =============================================================================================================

const X0 = 200;
const AN = 1056;
const Y_ENCABEZADO = 76;
const ALTO_ENCABEZADO = 88;
const Y_PASOS = Y_ENCABEZADO + ALTO_ENCABEZADO + 20;
const Y_CONTENIDO = Y_PASOS + 78 + 20;
const COL_IZQ = 482;
const X_MAPA = X0 + COL_IZQ + 20;

export const CANCHAS_P = {
  nuevaArriba: { x: X0 + AN - 20 - 150, y: Y_ENCABEZADO + 24, ancho: 150, alto: 40 },
  nuevaCentro: { x: X0 + AN / 2 - 75, y: Y_CONTENIDO + 218, ancho: 150, alto: 40 },
  tarjeta: { x: X0, y: Y_CONTENIDO + 30, ancho: COL_IZQ, alto: 228 },
  mapa: { x: X_MAPA, y: Y_CONTENIDO, ancho: AN - COL_IZQ - 20 },
};

const PASOS_CANCHA = [
  { Icono: MapPin, titulo: 'Ubica la cancha', texto: 'Marca el centro exacto en el mapa y su tamaño.' },
  { Icono: FileText, titulo: 'Sube el acta y el horario', texto: 'El permiso de uso y los días/horas que autoriza.' },
  { Icono: ShieldCheck, titulo: 'Validación', texto: 'El equipo de Gali Esport revisa cancha, acta y horario.' },
  { Icono: Satellite, titulo: 'Check-in por GPS', texto: 'Tus jugadores marcan entrada y salida desde la cancha.' },
];

export type CanchaGuardada = { nombre: string; direccion: string; ciudad: string; tipo: TipoCancha; sede: string | null; franjas: Franja[]; acta: string };

export type DatosCanchas = {
  vista: 'vacia' | 'lista';
  cancha?: CanchaGuardada;
  /** 0 → 1: el acta pasa de «En validación» a «Validada». */
  validada?: number;
  /** 0 → 1: la tarjeta y el mapa aparecen al guardar. */
  entra?: number;
  hover?: Partial<Record<'nueva', number>>;
  apretar?: Partial<Record<'nueva', number>>;
  resalte?: Partial<Record<'pasos' | 'badge' | 'gps' | 'pasoValidacion' | 'pasoGps', number>>;
  f?: number;
};

const BotonMarca: FC<{ tn: Tonos; hover?: number; apretar?: number; grande?: boolean; style?: CSSProperties }> = ({ tn, hover = 0, apretar = 0, grande, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: 150, height: 40, borderRadius: 12, background: hover > 0.5 ? tn.b700 : tn.b600, color: '#fff', fontSize: 14, fontWeight: grande ? 600 : 500, boxShadow: grande ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)', transform: hundir(apretar), whiteSpace: 'nowrap', ...style }}>
    <Plus size={16} />
    Nueva cancha
  </span>
);

export const PaginaCanchasPC: FC<{ tn: Tonos; vh: number; d: DatosCanchas }> = ({ tn, vh, d }) => {
  const ca = d.cancha;
  const val = d.validada ?? 0;
  const estado: EstadoActa = val >= 0.5 ? 'validada' : 'pendiente';
  const entra = d.entra ?? 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: vh }}>
      {/* Encabezado */}
      <div style={{ position: 'absolute', left: X0, top: Y_ENCABEZADO, width: AN, height: ALTO_ENCABEZADO, borderRadius: 16, border: `1px solid ${C.borde}`, background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.04)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, flex: 1, minWidth: 0 }}>
          <span style={{ width: 4, borderRadius: 99, background: tn.b600 }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em' }}>Canchas</div>
            <div style={{ marginTop: 4, fontSize: 14, color: C.tenue, whiteSpace: 'nowrap' }}>Dónde entrenas, con qué permiso y en qué horario. Con el acta validada, tus jugadores marcan asistencia por GPS.</div>
          </div>
        </div>
        <BotonMarca tn={tn} hover={0} />
      </div>

      {/* Cómo funciona */}
      <div style={{ position: 'absolute', left: X0, top: Y_PASOS, width: AN, height: 78, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.borde}`, background: C.borde, boxSizing: 'border-box', boxShadow: anillo(d.resalte?.pasos) }}>
        {PASOS_CANCHA.map(({ Icono, titulo, texto }, i) => {
          const r = i === 2 ? d.resalte?.pasoValidacion ?? 0 : i === 3 ? d.resalte?.pasoGps ?? 0 : 0;
          return (
            <div key={titulo} style={{ background: r > 0 ? `rgba(236,253,245,${r})` : '#fff', padding: '14px 16px', display: 'flex', gap: 12, boxSizing: 'border-box' }}>
              <span style={{ position: 'relative', flexShrink: 0 }}>
                <span style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', background: tn.b50, color: tn.b700 }}>
                  <Icono size={17} />
                </span>
                <span style={{ position: 'absolute', top: -6, left: -6, width: 18, height: 18, borderRadius: 99, display: 'grid', placeItems: 'center', fontFamily: jetbrains, fontSize: 10, fontWeight: 700, color: '#fff', background: tn.b600 }}>{i + 1}</span>
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{titulo}</span>
                <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: C.tenue, lineHeight: 1.375 }}>{texto}</span>
              </span>
            </div>
          );
        })}
      </div>

      {d.vista === 'vacia' || !ca ? (
        <div style={{ position: 'absolute', left: X0, top: Y_CONTENIDO, width: AN, height: 314, borderRadius: 16, border: `1px solid ${C.borde}`, background: '#fff', overflow: 'hidden', boxSizing: 'border-box', textAlign: 'center' }}>
          <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}>
            <g fill="none" stroke={tn.b700} strokeWidth={2}>
              <rect x="20" y="20" width="360" height="220" />
              <line x1="200" y1="20" x2="200" y2="240" />
              <circle cx="200" cy="130" r="36" />
              <rect x="20" y="80" width="54" height="100" />
              <rect x="326" y="80" width="54" height="100" />
            </g>
          </svg>
          <div style={{ position: 'relative', margin: '56px auto 16px', width: 56, height: 56, borderRadius: 16, display: 'grid', placeItems: 'center', background: tn.b600, color: '#fff' }}>
            <Navigation size={24} />
          </div>
          <div style={{ position: 'relative', fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em' }}>Agrega tu primera cancha</div>
          <div style={{ position: 'relative', margin: '6px auto 20px', maxWidth: 440, fontSize: 13, color: C.tenue, lineHeight: 1.625 }}>Con la ubicación exacta y el acta validada, cada jugador inicia y finaliza su entrenamiento desde el celular, solo si está en la cancha.</div>
          <BotonMarca tn={tn} grande hover={d.hover?.nueva} apretar={d.apretar?.nueva} style={{ position: 'relative' }} />
        </div>
      ) : (
        <div style={{ opacity: entra }}>
          {/* Columna de la izquierda: la cancha */}
          <div style={{ position: 'absolute', left: X0 + 4, top: Y_CONTENIDO, width: COL_IZQ - 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.tenue }}>1 cancha</span>
            <span style={{ fontSize: 12, color: C.tenue, borderRadius: 6, boxShadow: anillo(d.resalte?.gps, '16,185,129'), padding: (d.resalte?.gps ?? 0) > 0 ? '1px 6px' : 0, margin: (d.resalte?.gps ?? 0) > 0 ? '-1px -6px' : 0 }}>
              <strong style={{ color: '#047857' }}>{val >= 0.5 ? 1 : 0}</strong> con check-in por GPS
            </span>
          </div>
          <div style={{ position: 'absolute', left: X0, top: Y_CONTENIDO + 30, width: COL_IZQ, borderRadius: 16, border: `1px solid ${C.borde}`, background: '#fff', padding: 16, boxSizing: 'border-box', transform: `translateY(${(1 - entra) * 14}px)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>{ca.nombre}</span>
                  <InsigniaActa estado={estado} resalte={d.resalte?.badge} escala={1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, (val - 0.5) * 4)))} />
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: C.tenue, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  <MapPin size={12} />
                  {ca.direccion} · {ca.ciudad}
                </div>
              </div>
              <span style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.borde}`, color: C.tenue, display: 'grid' }}>
                <Pencil size={14} />
              </span>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 6, fontSize: 12 }}>
              <span style={{ color: C.tenue }}>Tipo</span>
              <span style={{ fontWeight: 500 }}>
                {TIPOS_CANCHA[ca.tipo].label}
                <span style={{ color: C.tenue, fontWeight: 400 }}> · zona de {radioZona(ca.tipo)} m</span>
                {ca.sede && <span style={{ color: C.tenue, fontWeight: 400 }}> · {ca.sede}</span>}
              </span>
              <span style={{ color: C.tenue, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Horario
              </span>
              <span style={{ fontWeight: 500 }}>{resumenFranjas(ca.franjas)}</span>
              <span style={{ color: C.tenue, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileText size={11} /> Acta
              </span>
              <span style={{ fontWeight: 500, textDecoration: 'underline dotted', textUnderlineOffset: 2 }}>{ca.acta}</span>
            </div>
            {val < 0.5 && (
              <div style={{ marginTop: 12, fontSize: 11, color: C.tenue, lineHeight: 1.5, opacity: 1 - Math.min(1, val * 2) }}>En revisión. Mientras tanto puedes programar entrenamientos; el check-in por GPS se activa al validarla.</div>
            )}
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: tn.b700 }}>
              <Navigation size={11} /> Abrir en Google Maps
            </div>
          </div>
          {/* El mapa */}
          <div style={{ position: 'absolute', left: X_MAPA, top: Y_CONTENIDO, width: AN - COL_IZQ - 20, height: 1149, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.borde}`, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
            <MapaCalles ancho={AN - COL_IZQ - 22} alto={vh - Y_CONTENIDO} vista={{ x: 67, y: 154, mpp: 0.75 }} pines={[{ x: 0, y: 0, tipo: estado === 'validada' ? 'validada' : 'pendiente', radio: radioZona(ca.tipo) }]} f={d.f} />
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================================================
// «Nueva cancha» (el panel de la derecha)
// =============================================================================================================

/** Alto del encabezado y del pie del panel. */
const ALTO_CABEZA = 100;
const ALTO_PIE = 69;
const XP = 640;
const XS = XP + 24 + 40;
const WS = 640 - 48 - 40;
/** Arriba de cada parte, en el cuerpo del panel (sin restar el desplazamiento). */
const Y_SEC = { nombre: 24, ubicacion: 130, tipo: 661, horario: 960, acta: 1416 };
const Y_CAMPOS = {
  nombre: Y_SEC.nombre + 36,
  busqueda: Y_SEC.ubicacion + 99,
  mapa: Y_SEC.ubicacion + 149,
  direccion: Y_SEC.ubicacion + 461,
  tipos: Y_SEC.tipo + 79,
  dias: Y_SEC.horario + 79,
  subir: Y_SEC.acta + 79,
};
export const ALTO_MAPA_PANEL = 300;
const FILA_DIA = 49;

export type DatosNuevaCancha = {
  /** 0 → 1: el panel entra desde la derecha. */
  t: number;
  /** Desplazamiento del cuerpo del panel. */
  scroll: number;
  nombre: string;
  sede: string | null;
  /** 0 → 1: la lista de sedes abierta; `sedeHover` la opción con el puntero. */
  menuSede?: number;
  sedeHover?: number;
  busqueda: string;
  buscando?: boolean;
  foco?: 'nombre' | 'busqueda' | null;
  pin: { x: number; y: number } | null;
  vista: VistaMapa;
  alzarPin?: number;
  direccion: string;
  ciudad: string;
  tipo: TipoCancha;
  franjas: Franja[];
  acta: string | null;
  guardando?: boolean;
  hover?: Partial<Record<'buscar' | 'aqui' | 'tipo' | 'acta' | 'crear' | 'dia' | 'sede', number>>;
  apretar?: Partial<Record<'buscar' | 'aqui' | 'tipo' | 'acta' | 'crear' | 'dia' | 'sede', number>>;
  tipoHover?: TipoCancha;
  diaHover?: number;
  resalte?: Partial<Record<'zona' | 'franjas' | 'acta' | 'aqui' | 'pin', number>>;
  f?: number;
};

export const SEDES_PANEL = ['Sede Norte', 'Sede principal'];

/** Medidas del panel en la página, con el cuerpo desplazado `scroll`. */
export const NUEVA_CANCHA = (vh: number, scroll: number) => {
  const py = (y: number) => ALTO_CABEZA + y - scroll;
  return {
    nombre: { x: XS, y: py(Y_CAMPOS.nombre), ancho: WS - 210, alto: 38 },
    sede: { x: XS + WS - 200, y: py(Y_CAMPOS.nombre), ancho: 200, alto: 38 },
    opcionSede: (i: number) => ({ x: XS + WS - 200, y: py(Y_CAMPOS.nombre) + 42 + 6 + i * 32, ancho: 200, alto: 32 }),
    busqueda: { x: XS, y: py(Y_CAMPOS.busqueda), ancho: WS - 100, alto: 38 },
    buscar: { x: XS + WS - 92, y: py(Y_CAMPOS.busqueda), ancho: 92, alto: 38 },
    mapa: { x: XS, y: py(Y_CAMPOS.mapa), ancho: WS, alto: ALTO_MAPA_PANEL },
    aqui: { x: XS + WS - 12 - 98, y: py(Y_CAMPOS.mapa + ALTO_MAPA_PANEL - 12 - 30), ancho: 98, alto: 30 },
    direccion: { x: XS, y: py(Y_CAMPOS.direccion), ancho: WS - 190, alto: 38 },
    tipo: (t: TipoCancha) => {
      const i = TIPOS_ORDEN.indexOf(t);
      return { x: XS + (i % 4) * ((WS - 24) / 4 + 8), y: py(Y_CAMPOS.tipos + Math.floor(i / 4) * 98), ancho: (WS - 24) / 4, alto: 90 };
    },
    /** El interruptor del día (`dia` 0 domingo … 6 sábado). */
    dia: (dia: number) => ({ x: XS + 12, y: py(Y_CAMPOS.dias + 1 + ORDEN_DIAS.indexOf(dia) * FILA_DIA + 10), ancho: 92, alto: 28 }),
    horario: { x: XS, y: py(Y_CAMPOS.dias), ancho: WS, alto: 7 * FILA_DIA + 2 },
    subir: { x: XS, y: py(Y_CAMPOS.subir), ancho: WS, alto: 76 },
    crear: { x: 1280 - 24 - 125, y: vh - ALTO_PIE + 16, ancho: 125, alto: 36 },
    /** Punto del mapa (en metros) → página. */
    enMapa: (v: VistaMapa, x: number, y: number) => ({ x: XS + WS / 2 + (x - v.x) / v.mpp, y: py(Y_CAMPOS.mapa) + ALTO_MAPA_PANEL / 2 + (y - v.y) / v.mpp }),
  };
};

const campo: CSSProperties = { position: 'absolute', height: 38, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, border: `1px solid ${C.borde}`, borderRadius: 8, background: '#fff', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' };
const Cursor: FC<{ f: number }> = ({ f }) => (Math.floor(f / 15) % 2 === 0 ? <span style={{ display: 'inline-block', width: 1.5, height: 16, marginLeft: 1, background: C.texto, verticalAlign: 'middle' }} /> : null);

const Seccion: FC<{ n: number; y: number; titulo: string; pista?: string }> = ({ n, y, titulo, pista }) => (
  <>
    <span style={{ position: 'absolute', left: XS - 40, top: y, width: 28, height: 28, borderRadius: 99, display: 'grid', placeItems: 'center', fontFamily: jetbrains, fontSize: 12, fontWeight: 700, background: 'var(--b50)', color: 'var(--b700)', border: '1px solid var(--b100)', boxSizing: 'border-box' }}>{n}</span>
    <div style={{ position: 'absolute', left: XS, top: y, fontSize: 14, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: '28px' }}>{titulo}</div>
    {pista && <div style={{ position: 'absolute', left: XS, top: y + 28, width: WS, fontSize: 12, lineHeight: 1.625, color: C.tenue }}>{pista}</div>}
  </>
);

/** El dibujo de la cancha a escala en la tarjeta de tipo. */
const GlifoCancha: FC<{ t: TipoCancha; on: boolean; tn: Tonos }> = ({ t, on, tn }) => {
  const { largo, ancho } = TIPOS_CANCHA[t];
  const w = Math.max(18, (largo / 105) * 44);
  const h = Math.max(10, (ancho / 105) * 44);
  const trazo = on ? '#fff' : tn.b600;
  return (
    <svg width={48} height={32} viewBox="0 0 48 32">
      <g transform={`translate(${(48 - w) / 2} ${(32 - h) / 2})`}>
        <rect width={w} height={h} rx={1.5} fill={on ? 'rgba(255,255,255,0.12)' : tn.b50} stroke={trazo} strokeWidth={1.2} />
        <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={trazo} strokeWidth={1} />
        <circle cx={w / 2} cy={h / 2} r={Math.min(h, w) / 6} fill="none" stroke={trazo} strokeWidth={1} />
      </g>
    </svg>
  );
};

const lat0 = 4.70412;
const lng0 = -74.04381;
const coordenadas = (p: { x: number; y: number }) => `${(lat0 - p.y / 111320).toFixed(5)}, ${(lng0 + p.x / (111320 * Math.cos((lat0 * Math.PI) / 180))).toFixed(5)}`;

export const PanelNuevaCancha: FC<{ tn: Tonos; vh: number; d: DatosNuevaCancha }> = ({ tn, vh, d }) => {
  if (d.t <= 0) return null;
  const f = d.f ?? 0;
  const L = NUEVA_CANCHA(vh, d.scroll);
  const radio = radioZona(d.tipo);
  const puedeGuardar = d.nombre.trim().length > 0 && d.direccion.trim().length >= 3 && !!d.pin;
  const vars = { '--b50': tn.b50, '--b100': tn.b100, '--b700': tn.b700 } as CSSProperties;
  const cuerpoAlto = vh - ALTO_CABEZA - ALTO_PIE;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 95, ...vars }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.42 * Math.min(1, d.t * 1.4)})` }} />
      <div style={{ position: 'absolute', left: XP + (1 - d.t) * 660, top: 0, width: 640, height: vh, background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontFamily: instrument, color: C.texto }}>
        {/* Encabezado */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: ALTO_CABEZA, borderBottom: `1px solid ${C.borde}`, padding: '20px 24px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.025em' }}>Nueva cancha</div>
          <div style={{ marginTop: 2, width: 520, fontSize: 12, color: C.tenue, lineHeight: 1.5 }}>Ubicación exacta, horario del acta y documento. El admin la valida antes de habilitar el check-in por GPS.</div>
          <span style={{ position: 'absolute', right: 18, top: 18, padding: 6, color: C.tenue, display: 'grid' }}>
            <X size={16} />
          </span>
        </div>

        {/* Cuerpo (se desplaza) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: ALTO_CABEZA, height: cuerpoAlto, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -XP, top: -d.scroll, width: 1280, height: 1700 }}>
            {/* 1 · Nombre y sede */}
            <Seccion n={1} y={Y_SEC.nombre} titulo="Nombre y sede" />
            <div style={{ ...campo, left: XS, top: Y_CAMPOS.nombre, width: WS - 210, borderColor: d.foco === 'nombre' ? tn.b600 : C.borde, color: d.nombre ? C.texto : '#9CA3AF' }}>
              {d.nombre || 'Ej. Cancha sintética El Salitre'}
              {d.foco === 'nombre' && <Cursor f={f} />}
            </div>
            <div style={{ ...campo, left: XS + WS - 200, top: Y_CAMPOS.nombre, width: 200, justifyContent: 'space-between', borderColor: (d.menuSede ?? 0) > 0 ? tn.b600 : C.borde, transform: hundir(d.apretar?.sede) }}>
              {d.sede ?? 'Sin sede'}
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.tenue} strokeWidth={2.4}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* 2 · Ubicación */}
            <Seccion n={2} y={Y_SEC.ubicacion} titulo="Ubicación" pista="Busca la dirección o pega el enlace de Google Maps de la cancha. Luego ajusta el pin al centro de la cancha: la zona punteada es donde tus jugadores podrán marcar." />
            <div style={{ ...campo, left: XS, top: Y_CAMPOS.busqueda, width: WS - 100, paddingLeft: 36, borderColor: d.foco === 'busqueda' ? tn.b600 : C.borde, color: d.busqueda ? C.texto : '#9CA3AF' }}>
              <Search size={14} color={C.tenue} style={{ position: 'absolute', left: 12 }} />
              {d.busqueda || 'Dirección, lugar o enlace de Google Maps'}
              {d.foco === 'busqueda' && <Cursor f={f} />}
            </div>
            <div style={{ position: 'absolute', left: XS + WS - 92, top: Y_CAMPOS.busqueda, width: 92, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: tn.b600, color: '#fff', fontSize: 13, fontWeight: 500, opacity: d.busqueda.trim().length < 3 || d.buscando ? 0.5 : 1, transform: hundir(d.apretar?.buscar) }}>
              {d.buscando ? <Loader2 size={14} style={{ transform: `rotate(${(f * 14) % 360}deg)` }} /> : <Search size={14} />}
              Buscar
            </div>
            <div style={{ position: 'absolute', left: XS, top: Y_CAMPOS.mapa, width: WS, height: ALTO_MAPA_PANEL, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.borde}`, boxSizing: 'border-box', boxShadow: anillo(d.resalte?.zona, '13,148,136') }}>
              <MapaCalles ancho={WS - 2} alto={ALTO_MAPA_PANEL - 2} vista={d.vista} pines={d.pin ? [{ x: d.pin.x, y: d.pin.y, tipo: 'picker', radio, seleccionado: true, alzar: d.alzarPin }] : []} f={f} />
              <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 6, zIndex: 5 }}>
                <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.borde}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{d.pin ? 'Arrastra el pin al centro de la cancha' : 'Toca el mapa para ubicar la cancha'}</span>
                {d.pin && <span style={{ padding: '4px 8px', borderRadius: 6, fontFamily: jetbrains, fontSize: 11, background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.borde}` }}>{coordenadas(d.pin)}</span>}
              </div>
              <div style={{ position: 'absolute', right: 12, bottom: 12, height: 30, padding: '0 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, background: (d.hover?.aqui ?? 0) > 0.5 ? '#F1F5F9' : '#fff', border: `1px solid ${C.borde}`, boxShadow: [`0 1px 3px rgba(0,0,0,0.12)`, anillo(d.resalte?.aqui)].filter(Boolean).join(', '), transform: hundir(d.apretar?.aqui), zIndex: 5 }}>
                <Crosshair size={13} /> Estoy aquí
              </div>
            </div>
            <div style={{ ...campo, left: XS, top: Y_CAMPOS.direccion, width: WS - 190, color: d.direccion ? C.texto : '#9CA3AF' }}>{d.direccion || 'Dirección'}</div>
            <div style={{ ...campo, left: XS + WS - 180, top: Y_CAMPOS.direccion, width: 180, color: d.ciudad ? C.texto : '#9CA3AF' }}>{d.ciudad || 'Ciudad'}</div>

            {/* 3 · Tipo de cancha */}
            <Seccion n={3} y={Y_SEC.tipo} titulo="Tipo de cancha" pista={`Define el tamaño de la zona de check-in: la cancha completa más 10 m alrededor (radio de ${radio} m).`} />
            {TIPOS_ORDEN.map((t) => {
              const r = L.tipo(t);
              const on = d.tipo === t;
              const h = d.tipoHover === t ? (d.hover?.tipo ?? 0) : 0;
              const a = d.tipoHover === t ? (d.apretar?.tipo ?? 0) : 0;
              return (
                <div key={t} style={{ position: 'absolute', left: r.x, top: r.y + d.scroll - ALTO_CABEZA, width: r.ancho, height: r.alto, borderRadius: 12, border: `1px solid ${on ? tn.b600 : h > 0 ? tn.b200 : C.borde}`, background: on ? tn.b600 : '#fff', color: on ? '#fff' : C.texto, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box', boxShadow: on ? '0 4px 6px -1px rgba(0,0,0,0.1)' : undefined, transform: `translateY(${on ? -1 : 0}px) ${hundir(a) ?? ''}` }}>
                  <GlifoCancha t={t} on={on} tn={tn} />
                  <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>{TIPOS_CANCHA[t].label}</span>
                  <span style={{ fontFamily: jetbrains, fontSize: 10, color: on ? 'rgba(255,255,255,0.8)' : C.tenue }}>
                    {TIPOS_CANCHA[t].largo}×{TIPOS_CANCHA[t].ancho} m · {radioZona(t)} m
                  </span>
                </div>
              );
            })}

            {/* 4 · Horario autorizado en el acta */}
            <Seccion n={4} y={Y_SEC.horario} titulo="Horario autorizado en el acta" pista="Días y horas en que el acta te permite usar la cancha. El admin lo compara con el documento y con los entrenamientos que programes." />
            <div style={{ position: 'absolute', left: XS, top: Y_CAMPOS.dias, width: WS, height: 7 * FILA_DIA + 2, borderRadius: 12, border: `1px solid ${C.borde}`, boxSizing: 'border-box', boxShadow: anillo(d.resalte?.franjas) }}>
              {ORDEN_DIAS.map((dia, k) => {
                const fr = d.franjas.filter((s) => s.dia === dia);
                const on = fr.length > 0;
                const h = d.diaHover === dia ? (d.hover?.dia ?? 0) : 0;
                return (
                  <div key={dia} style={{ position: 'absolute', left: 0, right: 0, top: k * FILA_DIA, height: FILA_DIA, borderTop: k ? `1px solid ${C.borde}` : undefined, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', boxSizing: 'border-box', background: h > 0 ? `rgba(241,245,249,${0.6 * h})` : undefined }}>
                    <span style={{ width: 92, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: on ? C.texto : C.tenue, transform: d.diaHover === dia ? hundir(d.apretar?.dia) : undefined }}>
                      <span style={{ position: 'relative', width: 32, height: 18, borderRadius: 99, background: on ? tn.b600 : '#E2E8F0', flexShrink: 0 }}>
                        <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: 99, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                      </span>
                      {NOMBRES_DIA[dia].slice(0, 1).toUpperCase() + NOMBRES_DIA[dia].slice(1, 3)}
                    </span>
                    {on ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {fr.map((s, i) => (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 4px 2px 6px', borderRadius: 8, border: `1px solid ${C.borde}`, background: 'rgba(241,245,249,0.3)', fontFamily: jetbrains, fontSize: 12 }}>
                            <span style={{ width: 74 }}>{hhmm(s.inicio)}</span>
                            <span style={{ color: C.tenue, fontSize: 11 }}>–</span>
                            <span style={{ width: 74, paddingLeft: 4 }}>{hhmm(s.fin)}</span>
                            <X size={12} color={C.tenue} />
                          </span>
                        ))}
                        <Plus size={14} color={C.tenue} />
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: C.tenue }}>Sin uso</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 5 · Acta de la cancha */}
            <Seccion n={5} y={Y_SEC.acta} titulo="Acta de la cancha" pista="El documento que te autoriza a entrenar en esta cancha (alcaldía, IDRD, junta de acción comunal…). Queda guardado también en tus documentos." />
            <div style={{ position: 'absolute', left: XS, top: Y_CAMPOS.subir, width: WS, height: 76, borderRadius: 12, border: `2px dashed ${(d.hover?.acta ?? 0) > 0.5 ? tn.b200 : C.borde}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', boxSizing: 'border-box', boxShadow: anillo(d.resalte?.acta), transform: hundir(d.apretar?.acta) }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: tn.b50, color: tn.b700, flexShrink: 0 }}>{d.acta ? <FileCheck2 size={18} /> : <FileUp size={18} />}</span>
              <span>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{d.acta ?? 'Selecciona el acta'}</span>
                <span style={{ display: 'block', fontSize: 11, color: C.tenue }}>PDF, JPG, PNG o WEBP · máximo 10 MB</span>
              </span>
            </div>
            <div style={{ position: 'absolute', left: XS, top: Y_CAMPOS.subir + 86, width: WS, display: 'flex', gap: 6, fontSize: 11, color: C.tenue, lineHeight: 1.5 }}>
              <Info size={12} style={{ flexShrink: 0, marginTop: 2 }} />
              Si cambias la ubicación, el tipo, el horario o el acta, la cancha vuelve a validación y el check-in se pausa hasta que el admin la apruebe.
            </div>

            {/* La lista de sedes (encima de todo lo del cuerpo) */}
            {(d.menuSede ?? 0) > 0 && (
              <div style={{ position: 'absolute', left: XS + WS - 200, top: Y_CAMPOS.nombre + 42, width: 200, padding: '6px 0', borderRadius: 8, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)', opacity: Math.min(1, (d.menuSede ?? 0) * 1.5), fontSize: 13, zIndex: 10 }}>
                {['Sin sede', ...SEDES_PANEL].map((s, i) => {
                  const on = d.sedeHover === i;
                  return (
                    <div key={s} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', margin: '0 5px', borderRadius: 5, background: on ? '#2563EB' : 'transparent', color: on ? '#fff' : C.texto }}>
                      <span style={{ width: 14 }}>{(d.sede ?? 'Sin sede') === s ? '✓' : ''}</span>
                      {s}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: ALTO_PIE, borderTop: `1px solid ${C.borde}`, background: 'rgba(241,245,249,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 24px', boxSizing: 'border-box' }}>
          <span style={{ padding: '0 16px', height: 36, display: 'grid', placeItems: 'center', fontSize: 13, border: `1px solid ${C.borde}`, borderRadius: 8, background: '#fff' }}>Cancelar</span>
          <span style={{ width: 125, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', borderRadius: 8, background: (d.hover?.crear ?? 0) > 0.5 ? tn.b700 : tn.b600, opacity: puedeGuardar ? 1 : 0.5, transform: hundir(d.apretar?.crear) }}>
            {d.guardando && <Loader2 size={14} style={{ transform: `rotate(${(f * 14) % 360}deg)` }} />}
            Crear cancha
          </span>
        </div>
      </div>
    </div>
  );
};
