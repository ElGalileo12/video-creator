// Las piezas 2D del especial «La pared de aire» (van solas en el gancho o encima del 3D de OndaChoque3D.tsx):
// · `Paisaje`: el suelo con cuadrícula en perspectiva, las tres probetas (vidrio, muro, columna), el destello en el
//   horizonte y la pared de aire que se acerca hasta golpear.
// · `RelojReal` («t = 4,2 s») y `ReglaSonido`: la luz llega casi al instante y la onda avanza ≈ 3 s por kilómetro.
// · `GraficaPresion`: la presión en un punto (perfil de Friedlander): salto, viento detrás y succión, con cursor.
// · `CorteOnda`: el corte de lado del rebote: la original, la reflejada, el tallo de Mach y el punto triple.
// · `FlechaViento`, `BarraAire` (unos pocos % de la presión del aire), `GraficaDecae` (la fuerza del frente baja con la
//   distancia hasta quedar bajo el umbral del vidrio: sonido) y `BarraEnergia` (cerca de la mitad empuja aire).
// Todas las magnitudes son unidades arbitrarias, salvo los 343 m/s del sonido.
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { Brillo, INCANDESCENTE } from './Calor';
import { ALTURA, FIN_PERFIL, geometriaFrente, perfilPresion, presionFrente, UMBRALES } from './OndaChoque3D';
import { bb, letra } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;
const coma = (n: number, dec = 1) => n.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const VEL_SONIDO_M_S = 343;
export const SEG_POR_KM = 1000 / VEL_SONIDO_M_S;

type Punto = { x: number; y: number };
export type Proyector = (x: number, y: number, z: number) => Punto;

// --- El paisaje del gancho ---------------------------------------------------------------------------------------

/** Altura del horizonte en el video. */
export const HORIZONTE = 900;
const SUELO = '#141C30';
const REJA = '#3A4A72';
const VIDRIO = '#3DD6F5';
const MURO = '#B4BED8';
const MURO_TOPE = '#D9DFEE';
const COLUMNA = '#F1E9DA';

type PaisajeProps = {
  /** 0–1: el destello que lo llena todo (frame 0) */
  destello: number;
  /** 0–1: el punto de luz en el horizonte. */
  horizonte: number;
  /** −1 = sin pared; 0–1 = la pared avanza desde el horizonte hasta pasar las probetas. */
  pared: number;
  /** Fotogramas desde que golpeó (para las astillas); negativo si todavía no. */
  golpe: number;
  reloj: number;
};

/** Base de las probetas del paisaje. */
const BASE = 1215;

/** Suelo con cuadrícula en perspectiva, las tres probetas y la pared de aire que llega. */
export const Paisaje: FC<PaisajeProps> = ({ destello, horizonte, pared, golpe, reloj }) => {
  const lineas: ReactNode[] = [];
  for (let k = 1; k <= 40; k++) {
    const y = HORIZONTE + 700 / (k * 0.55);
    if (y > 1920) continue;
    lineas.push(<line key={`h${k}`} x1={-100} y1={y} x2={1180} y2={y} stroke={REJA} strokeWidth={k < 4 ? 3 : 2} opacity={limitar(1.2 - k / 30)} />);
  }
  for (let k = -9; k <= 9; k++) {
    lineas.push(<line key={`v${k}`} x1={540} y1={HORIZONTE} x2={540 + k * 300} y2={1920} stroke={REJA} strokeWidth={2.5} opacity={0.85} />);
  }
  // La pared: banda entre dos medias elipses que crecen desde el horizonte (más alta cuanto más cerca).
  let muroAire: ReactNode = null;
  let delante = false;
  if (pared >= 0) {
    const q = limitar(pared);
    const ry = 6 + 430 * q ** 2.3;
    const rx = 240 + 2.6 * ry;
    const ryArriba = -0.12 * ry;
    const abajo = (dy: number) => `M ${540 - rx} ${HORIZONTE} A ${rx} ${Math.abs(dy)} 0 0 ${dy >= 0 ? 0 : 1} ${540 + rx} ${HORIZONTE}`;
    const banda = `${abajo(ry)} A ${rx} ${Math.abs(ryArriba)} 0 0 ${ryArriba >= 0 ? 1 : 0} ${540 - rx} ${HORIZONTE} Z`;
    const yAbajo = HORIZONTE + ry;
    const yArriba = HORIZONTE + ryArriba;
    delante = yAbajo > BASE;
    muroAire = (
      <g opacity={limitar(q * 6) * (1 - limitar((golpe - 6) / 10))}>
        <defs>
          <linearGradient id="pared-aire" x1="0" y1={yArriba} x2="0" y2={yAbajo} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={bb.terracotaClara} stopOpacity={0.08} />
            <stop offset="0.7" stopColor={bb.terracotaClara} stopOpacity={0.5} />
            <stop offset="1" stopColor={bb.terracota} stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <path d={banda} fill="url(#pared-aire)" />
        <path d={abajo(ry)} fill="none" stroke={INCANDESCENTE} strokeWidth={4 + 6 * q} opacity={0.9} />
        <path d={abajo(ryArriba)} fill="none" stroke={bb.terracotaClara} strokeWidth={3 + 4 * q} strokeDasharray="20 12" strokeDashoffset={reloj * 4} opacity={0.8} />
        {/* Polvo levantado en el borde de abajo. */}
        <g shapeRendering="crispEdges">
          {Array.from({ length: 34 }, (_, i) => {
            const u = random(`pared-polvo-${i}`) * 2 - 1;
            const x = 540 + u * rx * 0.95;
            const yb = HORIZONTE + ry * Math.sqrt(Math.max(0, 1 - u * u));
            const l = 6 + 14 * q * random(`pared-l-${i}`);
            return <rect key={i} x={x} y={yb - l * (1 + 2 * random(`pared-h-${i}`))} width={l} height={l} fill={i % 3 ? '#D3BE9F' : bb.terracotaClara} opacity={0.75} />;
          })}
        </g>
      </g>
    );
  }
  // Las probetas tiemblan y el vidrio se astilla al llegar la pared.
  const sacude = golpe >= 0 ? Math.sin(golpe * 2.4) * 14 * Math.max(0, 1 - golpe / 16) : 0;
  const inclina = golpe >= 0 ? 9 * limitar(golpe / 10) : 0;
  const roto = golpe >= 0;
  return (
    <g>
      <rect x={-200} y={HORIZONTE} width={1480} height={1100} fill={SUELO} />
      <g>{lineas}</g>
      <line x1={-200} y1={HORIZONTE} x2={1280} y2={HORIZONTE} stroke={REJA} strokeWidth={3} />
      {horizonte > 0 && (
        <g>
          <Brillo x={540} y={HORIZONTE - 4} r={360} color={bb.ambar} opacidad={0.5 * horizonte} aplastar={0.45} />
          <Brillo x={540} y={HORIZONTE - 4} r={120} color={INCANDESCENTE} opacidad={horizonte} />
          <Brillo x={540} y={HORIZONTE - 4} r={34} color="#FFFFFF" opacidad={horizonte} />
        </g>
      )}
      {!delante && muroAire}
      <g transform={`translate(${sacude} 0)`} shapeRendering="crispEdges">
        {/* Sombras en el suelo */}
        <ellipse cx={300} cy={BASE + 6} rx={100} ry={14} fill="#000" opacity={0.35} />
        <ellipse cx={540} cy={BASE + 6} rx={115} ry={16} fill="#000" opacity={0.35} />
        <ellipse cx={790} cy={BASE + 6} rx={50} ry={12} fill="#000" opacity={0.35} />
        {/* Vidrio: panel cian translúcido con marco. */}
        {!roto ? (
          <g>
            <rect x={225} y={BASE - 210} width={150} height={210} fill={VIDRIO} opacity={0.35} />
            <rect x={225} y={BASE - 210} width={150} height={210} fill="none" stroke="#C9F6FF" strokeWidth={6} />
            <rect x={245} y={BASE - 190} width={18} height={70} fill="#FFFFFF" opacity={0.45} />
          </g>
        ) : (
          Array.from({ length: 30 }, (_, i) => {
            const col = i % 5;
            const fila = Math.floor(i / 5);
            const t = golpe;
            const vx = 6 + 10 * random(`astilla-vx-${i}`);
            const vy = -4 - 9 * random(`astilla-vy-${i}`);
            const x = 225 + col * 30 + vx * t;
            const y = Math.min(BASE - 10, BASE - 210 + fila * 35 + vy * t + 0.9 * t * t);
            return <rect key={i} x={x} y={y} width={22} height={22} fill={i % 4 ? VIDRIO : '#C9F6FF'} opacity={0.85} transform={`rotate(${t * 20 * (random(`astilla-g-${i}`) - 0.5)} ${x + 11} ${y + 11})`} />;
          })
        )}
        {/* Muro: bloque con cara de arriba en perspectiva. */}
        <g transform={`rotate(${inclina} 630 ${BASE})`}>
          <polygon points={`450,${BASE - 170} 630,${BASE - 170} 610,${BASE - 196} 470,${BASE - 196}`} fill={MURO_TOPE} />
          <rect x={450} y={BASE - 170} width={180} height={170} fill={MURO} />
          <rect x={450} y={BASE - 170} width={180} height={170} fill="none" stroke="#EEF2FB" strokeWidth={4} opacity={0.8} />
        </g>
        {/* Columna */}
        <g transform={`rotate(${inclina * 0.25} 820 ${BASE})`}>
          <rect x={762} y={BASE - 260} width={56} height={260} fill={COLUMNA} />
          <rect x={800} y={BASE - 260} width={18} height={260} fill="#D6CEC0" />
          <ellipse cx={790} cy={BASE - 260} rx={28} ry={8} fill="#FFFFFF" />
        </g>
      </g>
      {delante && muroAire}
      {destello > 0 && <rect x={-200} y={-200} width={1480} height={2400} fill="#FFFFFF" opacity={destello} />}
    </g>
  );
};

// --- Reloj y regla del sonido --------------------------------------------------------------------------------------

/** «t = 4,2 s» en un recuadro verde de terminal (HTML). */
export const RelojReal: FC<{ x: number; y: number; segundos: number; tamano?: number; opacidad?: number; derecha?: boolean }> = ({ x, y, segundos, tamano = 38, opacidad = 1, derecha }) =>
  opacidad <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        top: y,
        ...(derecha ? { right: 1080 - x } : { left: x }),
        padding: '4px 18px',
        background: 'rgba(5,8,15,0.78)',
        border: `2px solid ${bb.verde}66`,
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: tamano,
        color: bb.verde,
        textShadow: `0 0 14px ${bb.verde}66`,
        whiteSpace: 'nowrap',
        opacity: opacidad,
      }}
    >
      {`t = ${coma(Math.max(0, segundos))} s`}
    </div>
  );

type ReglaProps = {
  y: number;
  /** Segundos desde el destello. */
  segundos: number;
  /** Kilómetros de la explosión hasta «TÚ». */
  total: number;
  aparece: number;
  /** 0–1: resalta el rótulo de los 3 s por kilómetro. */
  marca?: number;
};

const X_TU = 130;
const X_EXP = 960;

/** La luz (casi al instante) y la onda (≈ 3 s por km) de la explosión, a la derecha, hasta ti, a la izquierda. */
export const ReglaSonido: FC<ReglaProps> = ({ y, segundos, total, aparece, marca = 0 }) => {
  if (aparece <= 0) return null;
  const km = Math.min(total, segundos / SEG_POR_KM);
  const xKm = (k: number) => X_EXP - (k / total) * (X_EXP - X_TU);
  const xOnda = xKm(km);
  const llego = km >= total;
  return (
    <g opacity={limitar(aparece * 2)}>
      {/* La luz: ya llegó entera. */}
      <line x1={X_EXP} y1={y - 58} x2={X_TU + 20} y2={y - 58} stroke={bb.ambar} strokeWidth={5} />
      <polygon points={`${X_TU},${y - 58} ${X_TU + 26},${y - 72} ${X_TU + 26},${y - 44}`} fill={bb.ambar} />
      <text x={(X_TU + X_EXP) / 2} y={y - 78} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={32} fill={bb.ambar}>
        LUZ: CASI AL INSTANTE
      </text>
      {/* El camino de la onda, con una marca por kilómetro. */}
      <line x1={X_TU} y1={y} x2={X_EXP} y2={y} stroke={bb.hueso} strokeWidth={3} opacity={0.45} />
      <line x1={xOnda} y1={y} x2={X_EXP} y2={y} stroke={bb.terracotaClara} strokeWidth={8} strokeDasharray="14 8" />
      {Array.from({ length: Math.floor(total) + 1 }, (_, k) => (
        <g key={k}>
          <line x1={xKm(k)} y1={y - 12} x2={xKm(k)} y2={y + 12} stroke={bb.hueso} strokeWidth={3} opacity={0.8} />
          {k > 0 && (
            <text x={xKm(k)} y={y + 44} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso} opacity={0.85}>
              {`${k} km`}
            </text>
          )}
        </g>
      ))}
      {/* La onda: un arco de cuadritos que avanza. */}
      <g shapeRendering="crispEdges" transform={`translate(${xOnda} ${y})`}>
        {[-3, -2, -1, 0, 1, 2, 3].map((j) => (
          <rect key={j} x={-8 + Math.abs(j) * 4} y={j * 11 - 5} width={10} height={10} fill={j === 0 ? INCANDESCENTE : bb.terracotaClara} />
        ))}
      </g>
      {/* La explosión (derecha) y tú (izquierda). */}
      <Brillo x={X_EXP} y={y} r={44} color={bb.ambar} opacidad={0.8} />
      <rect x={X_EXP - 9} y={y - 9} width={18} height={18} fill={INCANDESCENTE} />
      <text x={X_TU} y={y + 44} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={36} fill={llego ? bb.terracotaClara : bb.verde}>
        TÚ
      </text>
      <rect x={X_TU - 9} y={y - 9} width={18} height={18} fill={llego ? bb.terracotaClara : bb.verde} />
      <text x={(X_TU + X_EXP) / 2} y={y + 96} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={30 * (1 + 0.12 * marca)} fill={marca > 0.3 ? bb.ambar : bb.terracotaClara}>
        ≈ 3 s POR KILÓMETRO (A GRAN DISTANCIA)
      </text>
    </g>
  );
};

// --- Gráfica de la presión en un punto ------------------------------------------------------------------------------

type GraficaPresionProps = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Tiempo local donde va el cursor (0 = llega el frente, 1 = fin del empujón). */
  cursor: number;
  aparece: number;
  /** 0–1: los rótulos del salto, del viento y de la succión. */
  salto?: number;
  viento?: number;
  succion?: number;
};

const T0 = -0.55;
const T1 = FIN_PERFIL + 0.25;
const P0 = -0.34;
const P1 = 1.1;

/** Presión contra tiempo en un punto fijo: normal, salto casi vertical, el empujón que baja y la succión bajo lo normal. */
export const GraficaPresion: FC<GraficaPresionProps> = ({ x, y, ancho, alto, cursor, aparece, salto = 0, viento = 0, succion = 0 }) => {
  if (aparece <= 0) return null;
  const IZQ = 150;
  const DER = 24;
  const ARRIBA = 46;
  const ABAJO = 22;
  const w = ancho - IZQ - DER;
  const h = alto - ARRIBA - ABAJO;
  const px = (t: number) => x + IZQ + ((t - T0) / (T1 - T0)) * w;
  const py = (p: number) => y + ARRIBA + ((P1 - p) / (P1 - P0)) * h;
  const linea = (desde: number, hasta: number) => {
    const pts: string[] = [];
    for (let t = desde; t < hasta; t += 0.025) {
      if (t < 0 && t + 0.025 >= 0) {
        pts.push(`${px(0).toFixed(1)},${py(0).toFixed(1)}`, `${px(0).toFixed(1)},${py(1).toFixed(1)}`);
        continue;
      }
      pts.push(`${px(t).toFixed(1)},${py(perfilPresion(t)).toFixed(1)}`);
    }
    pts.push(`${px(hasta).toFixed(1)},${py(perfilPresion(hasta)).toFixed(1)}`);
    return pts.join(' ');
  };
  const c = limitar(cursor, T0, T1);
  const yCero = py(0);
  return (
    <g opacity={limitar(aparece * 2)}>
      <rect x={x} y={y} width={ancho} height={alto} fill="rgba(5,8,15,0.84)" stroke={`${bb.verde}55`} strokeWidth={2} />
      <text x={x + 18} y={y + 32} fontFamily={letra.mono} fontWeight={700} fontSize={24} letterSpacing={2} fill={bb.verde}>
        PRESIÓN EN UN PUNTO
      </text>
      <text x={x + ancho - 20} y={y + 32} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={22} fill={bb.hueso} opacity={0.7}>
        TIEMPO →
      </text>
      <line x1={x + IZQ - 10} y1={yCero} x2={x + ancho - DER} y2={yCero} stroke={bb.hueso} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      <text x={x + IZQ - 18} y={yCero + 8} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={22} fill={bb.hueso} opacity={0.85}>
        NORMAL
      </text>
      <polyline points={linea(T0, T1)} fill="none" stroke={bb.hueso} strokeWidth={4} opacity={0.25} strokeLinejoin="round" />
      {c > T0 && <polyline points={linea(T0, Math.min(c, 1))} fill="none" stroke={bb.terracotaClara} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${bb.terracota})` }} />}
      {c > 1 && <polyline points={linea(1, c)} fill="none" stroke={bb.cian} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${bb.cian})` }} />}
      <line x1={px(c)} y1={y + ARRIBA - 6} x2={px(c)} y2={y + alto - 8} stroke={bb.verde} strokeWidth={3} strokeDasharray="8 6" />
      <rect x={px(c) - 10} y={py(perfilPresion(c)) - 10} width={20} height={20} fill={INCANDESCENTE} stroke={c > 1 ? bb.cian : bb.terracotaClara} strokeWidth={3} />
      {salto > 0 && (
        <text x={px(0) + 18} y={py(1) + 10} fontFamily={letra.mono} fontWeight={700} fontSize={26} fill={bb.terracotaClara} opacity={limitar(salto * 2)}>
          ← SALTO DE PRESIÓN
        </text>
      )}
      {viento > 0 && (
        <text x={px(0.5) + 4} y={py(0.3) - 6} fontFamily={letra.mono} fontWeight={700} fontSize={24} fill={bb.hueso} opacity={limitar(viento * 2)}>
          VIENTO DETRÁS DEL FRENTE
        </text>
      )}
      {succion > 0 && (
        <text x={px(2.25)} y={py(-0.25) + 4} textAnchor="middle" dominantBaseline="hanging" fontFamily={letra.mono} fontWeight={700} fontSize={26} fill={bb.cian} opacity={limitar(succion * 2)}>
          SUCCIÓN
        </text>
      )}
    </g>
  );
};

// --- El corte del rebote --------------------------------------------------------------------------------------------

type CorteProps = {
  proy: Proyector;
  a: number;
  reloj: number;
  aparece: number;
};

const puntosArco = (proy: Proyector, cx: number, cy: number, r: number, desde: number, hasta: number, pasos = 90) => {
  const pts: string[] = [];
  for (let k = 0; k <= pasos; k++) {
    const f = mezclar(k / pasos, desde, hasta);
    const p = proy(cx + r * Math.sin(f), cy + r * Math.cos(f), 0);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(' ');
};

/** Dónde poner los rótulos del corte (en el mundo): tope de la original y del rebote, y el punto triple (lado derecho). */
export const puntosCorte = (a: number) => {
  const g = geometriaFrente(a);
  return {
    original: [0, ALTURA + a, 0] as [number, number, number],
    rebote: [0, g.ar - ALTURA, 0] as [number, number, number],
    triple: [g.rs, g.hT, 0] as [number, number, number],
  };
};

/** El corte de lado (plano z = 0): la onda original, la reflejada desde el suelo y el tallo de Mach que las une. */
export const CorteOnda: FC<CorteProps> = ({ proy, a, reloj, aparece }) => {
  if (aparece <= 0 || a <= 0) return null;
  const g = geometriaFrente(a);
  const fO = a <= ALTURA ? Math.PI : Math.acos(limitar((g.hT - ALTURA) / a, -1, 1));
  const fR = g.ar > ALTURA + g.hT ? Math.acos(limitar((g.hT + ALTURA) / g.ar, -1, 1)) : 0;
  const tallo = [-1, 1].map((s) => [proy(s * g.rs, 0, 0), proy(s * g.rs, g.hT, 0)]);
  return (
    <g opacity={limitar(aparece)}>
      {g.verOriginal > 0 && (
        <g opacity={g.verOriginal}>
          <polyline points={puntosArco(proy, 0, ALTURA, a, -fO, fO)} fill="none" stroke={bb.terracotaClara} strokeWidth={26} opacity={0.15} />
          <polyline points={puntosArco(proy, 0, ALTURA, a, -fO, fO)} fill="none" stroke={bb.terracotaClara} strokeWidth={7} strokeDasharray="22 10" strokeDashoffset={reloj * 3} />
        </g>
      )}
      {g.verRebote > 0 && fR > 0.01 && (
        <g opacity={g.verRebote}>
          <polyline points={puntosArco(proy, 0, -ALTURA, g.ar, -fR, fR)} fill="none" stroke={bb.ambar} strokeWidth={22} opacity={0.14} />
          <polyline points={puntosArco(proy, 0, -ALTURA, g.ar, -fR, fR)} fill="none" stroke={bb.ambar} strokeWidth={6} strokeDasharray="16 9" strokeDashoffset={-reloj * 3} />
        </g>
      )}
      {g.verMach > 0 && g.hT > 0.004 && (
        <g opacity={g.verMach}>
          {tallo.map(([p0, p1], k) => (
            <g key={k}>
              <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={bb.terracotaClara} strokeWidth={34} opacity={0.3} />
              <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={INCANDESCENTE} strokeWidth={11} strokeLinecap="square" />
              <rect x={p1.x - 9} y={p1.y - 9} width={18} height={18} fill={bb.verde} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// --- Flechas de viento ---------------------------------------------------------------------------------------------

/** Flecha gruesa de pantalla, de `de` a `a` (el viento: terracota hacia afuera, cian cuando se devuelve). */
export const FlechaViento: FC<{ de: Punto; a: Punto; color: string; opacidad?: number; grosor?: number }> = ({ de, a, color: c, opacidad = 1, grosor = 12 }) => {
  const dx = a.x - de.x;
  const dy = a.y - de.y;
  const largo = Math.hypot(dx, dy);
  if (opacidad <= 0 || largo < 8) return null;
  const ux = dx / largo;
  const uy = dy / largo;
  const punta = Math.min(largo * 0.55, grosor * 2.6);
  const bx = a.x - ux * punta;
  const by = a.y - uy * punta;
  const nx = -uy * grosor * 1.6;
  const ny = ux * grosor * 1.6;
  return (
    <g opacity={opacidad}>
      <line x1={de.x} y1={de.y} x2={bx} y2={by} stroke="rgba(5,8,15,0.55)" strokeWidth={grosor + 8} />
      <polygon points={`${a.x},${a.y} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`} fill="rgba(5,8,15,0.55)" transform={`translate(${ux * 3} ${uy * 3})`} />
      <line x1={de.x} y1={de.y} x2={bx} y2={by} stroke={c} strokeWidth={grosor} />
      <polygon points={`${a.x},${a.y} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`} fill={c} />
    </g>
  );
};

// --- Barras (HTML) ------------------------------------------------------------------------------------------------

const Recuadro: FC<{ y: number; aparece: number; children: ReactNode }> = ({ y, aparece, children }) =>
  aparece <= 0 ? null : (
    <div style={{ position: 'absolute', left: 70, top: y, width: 940, padding: '18px 22px 20px', boxSizing: 'border-box', background: 'rgba(5,8,15,0.84)', border: `2px solid ${bb.verde}55`, opacity: limitar(aparece * 2), transform: `translateY(${(1 - limitar(aparece)) * 30}px)` }}>
      {children}
    </div>
  );

const textoMono = (tamano: number, c: string) => ({ fontFamily: letra.mono, fontWeight: 700, fontSize: tamano, color: c, whiteSpace: 'nowrap' as const, letterSpacing: 1 });

/** «PRESIÓN DEL AIRE = 100 %» y, al final, el poquito extra que basta para quebrar un vidrio. */
export const BarraAire: FC<{ y: number; aparece: number; llena: number; extra: number; rompe: number; reloj: number }> = ({ y, aparece, llena, extra, rompe, reloj }) => {
  const BLOQUE = 34;
  const N = 24;
  const late = extra > 0.5 ? 0.75 + 0.25 * Math.sin(reloj / 2.5) : 1;
  return (
    <Recuadro y={y} aparece={aparece}>
      <div style={{ ...textoMono(26, bb.hueso), marginBottom: 12 }}>PRESIÓN NORMAL DEL AIRE = 100 %</div>
      <div style={{ position: 'relative', height: 44 }}>
        {Array.from({ length: Math.round(N * limitar(llena)) }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: k * BLOQUE, top: 0, width: BLOQUE - 5, height: 44, background: bb.hueso, opacity: 0.55 }} />
        ))}
        {extra > 0 && (
          <div style={{ position: 'absolute', left: N * BLOQUE + 4, top: -6, width: (BLOQUE - 5) * limitar(extra * 1.5), height: 56, background: bb.terracotaClara, opacity: late, boxShadow: `0 0 18px ${bb.terracotaClara}` }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, opacity: limitar(extra * 2) }}>
        <div style={textoMono(26, bb.cian)}>{rompe > 0 ? 'BASTA PARA QUEBRAR UN VIDRIO →' : ''}</div>
        <div style={textoMono(28, bb.terracotaClara)}>+ POCOS %</div>
      </div>
    </Recuadro>
  );
};

/** Cerca de la mitad de la energía empuja aire; el resto es luz, calor y radiación. */
export const BarraEnergia: FC<{ y: number; aparece: number; mitad: number; resto: number }> = ({ y, aparece, mitad, resto }) => {
  const ANCHO = 892;
  return (
    <Recuadro y={y} aparece={aparece}>
      <div style={{ ...textoMono(26, bb.hueso), marginBottom: 14 }}>ENERGÍA DE UNA EXPLOSIÓN NUCLEAR</div>
      <div style={{ position: 'relative', height: 70, width: ANCHO, background: 'rgba(244,239,230,0.08)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: 70, width: (ANCHO / 2) * limitar(mitad), background: bb.terracotaClara, boxShadow: `0 0 20px ${bb.terracota}` }} />
        <div style={{ position: 'absolute', left: ANCHO / 2 + 4, top: 0, height: 70, width: (ANCHO / 2 - 4) * limitar(resto), background: bb.ambar, opacity: 0.45 }} />
        <div style={{ position: 'absolute', left: 0, width: ANCHO / 2, top: 0, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', ...textoMono(30, bb.tinta), opacity: limitar((mitad - 0.6) * 3) }}>
          EMPUJAR AIRE
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ ...textoMono(26, bb.terracotaClara), opacity: limitar((mitad - 0.5) * 3) }}>≈ LA MITAD</div>
        <div style={{ ...textoMono(24, bb.ambar), opacity: limitar(resto * 2) }}>EL RESTO: LUZ, CALOR, RADIACIÓN</div>
      </div>
    </Recuadro>
  );
};

// --- Gráfica: el frente se debilita con la distancia ---------------------------------------------------------------

type GraficaDecaeProps = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Distancia del frente (mismas unidades que el radio del 3D). */
  distancia: number;
  aparece: number;
  /** 0–1: rótulo final «SOLO SONIDO: COMO UN TRUENO». */
  trueno?: number;
};

const D0 = 1.6;
const D1 = 12;
const PMAX = 0.5;

/** La fuerza del frente contra la distancia (presionFrente), con los umbrales del muro y del vidrio y un punto que viaja. */
export const GraficaDecae: FC<GraficaDecaeProps> = ({ x, y, ancho, alto, distancia, aparece, trueno = 0 }) => {
  if (aparece <= 0) return null;
  const IZQ = 130;
  const DER = 28;
  const ARRIBA = 46;
  const ABAJO = 24;
  const w = ancho - IZQ - DER;
  const h = alto - ARRIBA - ABAJO;
  const px = (d: number) => x + IZQ + ((d - D0) / (D1 - D0)) * w;
  const py = (p: number) => y + ARRIBA + (1 - Math.min(p, PMAX) / PMAX) * h;
  const linea = (desde: number, hasta: number) => {
    const pts: string[] = [];
    for (let d = desde; d < hasta; d += 0.08) pts.push(`${px(d).toFixed(1)},${py(presionFrente(d)).toFixed(1)}`);
    pts.push(`${px(hasta).toFixed(1)},${py(presionFrente(hasta)).toFixed(1)}`);
    return pts.join(' ');
  };
  const d = limitar(distancia, D0, D1);
  const bajoVidrio = presionFrente(d) < UMBRALES.VIDRIO;
  const umbral = (p: number, texto: string, c: string) => (
    <g>
      <line x1={x + IZQ} y1={py(p)} x2={x + ancho - DER} y2={py(p)} stroke={c} strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />
      <text x={x + IZQ - 14} y={py(p) + 8} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={22} fill={c}>
        {texto}
      </text>
    </g>
  );
  return (
    <g opacity={limitar(aparece * 2)}>
      <rect x={x} y={y} width={ancho} height={alto} fill="rgba(5,8,15,0.84)" stroke={`${bb.verde}55`} strokeWidth={2} />
      <text x={x + 18} y={y + 32} fontFamily={letra.mono} fontWeight={700} fontSize={24} letterSpacing={2} fill={bb.verde}>
        FUERZA DEL FRENTE
      </text>
      <text x={x + ancho - 20} y={y + alto - 12} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={22} fill={bb.hueso} opacity={0.7}>
        DISTANCIA →
      </text>
      {umbral(UMBRALES.MURO, 'MURO', MURO)}
      {umbral(UMBRALES.VIDRIO, 'VIDRIO', bb.cian)}
      <polyline points={linea(D0, D1)} fill="none" stroke={bb.hueso} strokeWidth={4} opacity={0.25} />
      <polyline points={linea(D0, d)} fill="none" stroke={bajoVidrio ? INCANDESCENTE : bb.terracotaClara} strokeWidth={7} style={{ filter: `drop-shadow(0 0 8px ${bb.terracota})` }} />
      <rect x={px(d) - 11} y={py(presionFrente(d)) - 11} width={22} height={22} fill={INCANDESCENTE} stroke={bajoVidrio ? bb.cian : bb.terracotaClara} strokeWidth={3} />
      {trueno > 0 && (
        <text x={x + ancho - 30} y={py(UMBRALES.VIDRIO) - 22} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={INCANDESCENTE} opacity={limitar(trueno * 2)}>
          SOLO SONIDO: UN TRUENO
        </text>
      )}
    </g>
  );
};
