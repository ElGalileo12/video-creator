// Lo caliente (especial «El lugar más caliente del universo», espejo de Frio.tsx): el color que pasa de ámbar a blanco
// incandescente, números grandes con potencias de diez, núcleos de protones y neutrones que se unen o se rompen, el
// protón con sus tres quarks unidos por gluones (que se estiran, se cortan y se derriten), el río de quarks sueltos, el
// anillo del acelerador, la escala de potencias de diez y el muro de la temperatura de Planck.
// Todo en SVG, dentro de un `Lienzo`, salvo `Potencia` (texto HTML).
import type { CSSProperties, FC } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { AtomoPixel, mezclarColor } from './Frio';
import { bb, letra } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Blanco incandescente, lo más caliente. */
export const INCANDESCENTE = '#FFF9EC';
const AMARILLO = '#FFD978';

/** Color de algo según lo caliente que está: 0 = ámbar, 0.55 = amarillo, 1 = blanco incandescente. */
export const colorCalor = (t: number) => (t < 0.55 ? mezclarColor(bb.ambar, AMARILLO, t / 0.55) : mezclarColor(AMARILLO, INCANDESCENTE, (t - 0.55) / 0.45));

const formato = new Intl.NumberFormat('es-CO');
/** Número con puntos de miles («15.000.000»). */
export const numeroEs = (n: number) => formato.format(n);

/** Redondea a tres cifras (para que los contadores que suben no muestren basura: 3.160.000, no 3.162.278). */
export const tresCifras = (v: number) => {
  if (v < 1000) return Math.round(v);
  const p = 10 ** (Math.floor(Math.log10(v)) - 2);
  return Math.round(v / p) * p;
};

/** Potencia de diez en texto HTML: «5,5×10» con el «12» chiquito arriba (las letras de la serie no traen superíndices). */
export const Potencia: FC<{ base: string; exp: string | number; unidad?: string; style?: CSSProperties }> = ({ base, exp, unidad, style }) => (
  <span style={{ whiteSpace: 'nowrap', ...style }}>
    {base}
    <span style={{ fontSize: '0.56em', verticalAlign: '0.72em', marginLeft: '0.04em' }}>{exp}</span>
    {unidad ? <span>{` ${unidad}`}</span> : null}
  </span>
);

/** Resplandor de degradado radial de cualquier color (también «rgb(…)», que `Halo` no acepta). */
export const Brillo: FC<{ x: number; y: number; r: number; color: string; opacidad?: number; aplastar?: number }> = ({ x, y, r, color: c, opacidad = 1, aplastar = 1 }) => {
  const id = useIdSvg();
  if (opacidad <= 0 || r <= 0) return null;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={c} stopOpacity={1} />
          <stop offset="0.35" stopColor={c} stopOpacity={0.45} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={r} ry={r * aplastar} fill={`url(#${id})`} opacity={opacidad} />
    </g>
  );
};

// --- Núcleos ---------------------------------------------------------------------------------------------------

export const PROTON = '#E07A45';
export const NEUTRON = '#C9CFDA';

/** Lugar del nucleón `i` en un núcleo (en girasol: el 0 en el centro), relativo al centro. */
export const lugarNucleon = (i: number, radio: number) => {
  const d = radio * 1.3 * Math.sqrt(i);
  const a = i * 2.39996;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d };
};

type NucleoProps = {
  x: number;
  y: number;
  /** Cuántos protones y neutrones (los pares son protones). */
  cantidad: number;
  /** Radio de cada nucleón. */
  radio: number;
  reloj: number;
  /** Cuánto tiemblan (px). */
  agitacion?: number;
  /** 0–1: se rompe y cada pieza sale volando hasta `distancia` px. */
  separar?: number;
  distancia?: number;
  /** 0–1: los nucleones se ponen blancos de calor. */
  calor?: number;
  opacidad?: number;
  semilla?: string;
};

/** Un núcleo: bolitas de píxeles naranjas (protones) y grises (neutrones) apiñadas, que tiemblan o se separan. */
export const Nucleo: FC<NucleoProps> = ({ x, y, cantidad, radio, reloj, agitacion = 2, separar = 0, distancia = 420, calor = 0, opacidad = 1, semilla = 'nucleo' }) => {
  if (opacidad <= 0) return null;
  const piezas = Array.from({ length: cantidad }, (_, i) => {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    const base = lugarNucleon(i, radio);
    const ang = (i === 0 ? r('a0') * Math.PI * 2 : Math.atan2(base.y, base.x)) + (r('a') - 0.5) * 1.1;
    const lejos = distancia * (0.55 + 0.6 * r('v')) * separar;
    const temblor = agitacion * (1 - 0.6 * separar);
    return {
      i,
      x: x + base.x + Math.cos(ang) * lejos + temblor * Math.sin(reloj * (1.1 + r('fx')) + r('px') * 6.28),
      y: y + base.y + Math.sin(ang) * lejos + temblor * Math.cos(reloj * (1.2 + r('fy')) + r('py') * 6.28),
      d: Math.hypot(base.x, base.y),
    };
  }).sort((a, b) => b.d - a.d);
  return (
    <g opacity={opacidad}>
      {piezas.map((p) => (
        <AtomoPixel key={p.i} x={p.x} y={p.y} radio={radio} color={mezclarColor(p.i % 2 === 0 ? PROTON : NEUTRON, INCANDESCENTE, calor)} celdas={7} />
      ))}
    </g>
  );
};

// --- Quarks y gluones ------------------------------------------------------------------------------------------

/** Los tres «colores» de los quarks de un protón (el color de los quarks es un nombre, no un color de verdad). */
export const COLORES_QUARK = [bb.ambar, bb.cian, bb.terracotaClara];

/** Un quark: bolita de píxeles con su resplandor. */
export const Quark: FC<{ x: number; y: number; radio: number; color: string; brillo?: number; opacidad?: number }> = ({ x, y, radio, color: c, brillo = 1, opacidad = 1 }) =>
  opacidad <= 0 ? null : (
    <g opacity={opacidad}>
      <Brillo x={x} y={y} r={radio * 2.4} color={c} opacidad={0.4 * brillo} />
      <AtomoPixel x={x} y={y} radio={radio} color={c} celdas={7} />
    </g>
  );

type GluonProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  reloj: number;
  /** 0–1: se corta por el medio y cada mitad se recoge hacia su quark. */
  rompe?: number;
  lado?: number;
  color?: string;
  opacidad?: number;
};

/** El hilo de gluones entre dos quarks: una onda de cuadraditos que vibra; estirado, se adelgaza. */
export const Gluon: FC<GluonProps> = ({ x1, y1, x2, y2, reloj, rompe = 0, lado = 9, color: c = bb.verde, opacidad = 1 }) => {
  const largo = Math.hypot(x2 - x1, y2 - y1);
  if (largo < 1 || opacidad <= 0 || rompe >= 1) return null;
  const nx = -(y2 - y1) / largo;
  const ny = (x2 - x1) / largo;
  const n = Math.max(8, Math.round(largo / (lado * 0.9)));
  const amplitud = Math.min(16, largo * 0.08) * limitar(170 / largo, 0.25, 1);
  const vueltas = Math.max(3, Math.round(largo / 45));
  const puntos = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const tt = t < 0.5 ? t * (1 - rompe) : 1 - (1 - t) * (1 - rompe);
    const onda = Math.sin(tt * Math.PI * 2 * vueltas - reloj * 0.7) * amplitud * Math.sin(tt * Math.PI);
    const px = x1 + (x2 - x1) * tt + nx * onda;
    const py = y1 + (y2 - y1) * tt + ny * onda;
    const l = lado * (largo > 260 ? 0.75 : 1);
    puntos.push(<rect key={k} x={px - l / 2} y={py - l / 2} width={l} height={l} fill={c} />);
  }
  return (
    <g opacity={opacidad * (1 - rompe * 0.4)} shapeRendering="crispEdges">
      {puntos}
    </g>
  );
};

/** Dónde están los tres quarks de un protón centrado en (x, y): en triángulo, temblando un poco. */
export const lugaresQuarks = (x: number, y: number, distancia: number, reloj: number, semilla = 'quarks') =>
  [-90, 30, 150].map((g, k) => {
    const r = (s: string) => random(`${semilla}-${k}-${s}`);
    const a = (g * Math.PI) / 180 + 0.12 * Math.sin(reloj * 0.08 + k * 2);
    return {
      x: x + Math.cos(a) * distancia + 5 * Math.sin(reloj * (0.5 + r('f')) + r('p') * 6.28),
      y: y + Math.sin(a) * distancia + 5 * Math.cos(reloj * (0.55 + r('g')) + r('q') * 6.28),
    };
  });

type ProtonProps = {
  x: number;
  y: number;
  radio: number;
  reloj: number;
  /** 0–1: los quarks de adentro se ven. */
  quarks?: number;
  /** 0–1: la cáscara se derrite (gotea hacia abajo y se apaga). */
  derrite?: number;
  opacidad?: number;
};

/** Un protón grande: cáscara de píxeles naranjas, medio transparente, con sus tres quarks y gluones adentro. */
export const ProtonPixeles: FC<ProtonProps> = ({ x, y, radio, reloj, quarks = 1, derrite = 0, opacidad = 1 }) => {
  if (opacidad <= 0 || radio <= 1) return null;
  const lado = Math.max(6, Math.round(radio / 9));
  const n = Math.ceil(radio / lado);
  const celdas = [];
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const d = Math.hypot(i + 0.5, j + 0.5) * lado;
      if (d > radio) continue;
      const r = (s: string) => random(`proton-${i}-${j}-${s}`);
      const borde = d > radio - lado * 1.6;
      const cae = derrite ** 1.6 * (40 + 420 * r('v')) * (0.6 + 0.4 * ((j + n) / (2 * n)));
      const se = limitar(1 - derrite * (0.7 + 0.6 * r('o')));
      if (se <= 0.02) continue;
      const alto = lado * (1 + derrite * 3 * r('g'));
      celdas.push(
        <rect
          key={`${i}-${j}`}
          x={x + i * lado + Math.sin(reloj * 0.3 + i) * 4 * derrite}
          y={y + j * lado + cae}
          width={lado + 0.5}
          height={alto + 0.5}
          fill={mezclarColor(PROTON, INCANDESCENTE, derrite)}
          opacity={(borde ? 0.95 : 0.22) * se}
        />,
      );
    }
  }
  const q = lugaresQuarks(x, y, radio * 0.45, reloj);
  const rq = radio * 0.17;
  return (
    <g opacity={opacidad}>
      <Brillo x={x} y={y} r={radio * 1.5} color={PROTON} opacidad={0.3 * (1 - derrite)} />
      <g shapeRendering="crispEdges">{celdas}</g>
      {quarks > 0 && (
        <g opacity={limitar(quarks * 1.4)}>
          {[0, 1, 2].map((k) => (
            <Gluon key={k} x1={q[k].x} y1={q[k].y} x2={q[(k + 1) % 3].x} y2={q[(k + 1) % 3].y} reloj={reloj} lado={Math.max(5, rq * 0.3)} />
          ))}
          {q.map((p, k) => (
            <Quark key={k} x={p.x} y={p.y} radio={rq} color={COLORES_QUARK[k]} />
          ))}
        </g>
      )}
    </g>
  );
};

type FlujoProps = {
  cx: number;
  cy: number;
  ancho: number;
  alto: number;
  cantidad: number;
  reloj: number;
  /** 0–1: cuántos se ven. */
  aparece?: number;
  /** px por fotograma. */
  velocidad?: number;
  semilla?: string;
};

/** El plasma de quarks y gluones: un río de quarks sueltos que fluye parejo, sin turbulencia (casi sin fricción). */
export const FlujoQuarks: FC<FlujoProps> = ({ cx, cy, ancho, alto, cantidad, reloj, aparece = 1, velocidad = 7, semilla = 'flujo' }) => {
  const largo = ancho + 240;
  const izquierda = cx - ancho / 2 - 120;
  const centro = (x: number, t: number) => cy + alto * 0.16 * Math.sin(((x - cx) / ancho) * Math.PI * 1.6 + t * 0.035);
  const lugar = (i: number, t: number) => {
    const r = (s: string) => random(`${semilla}-${i}-${s}`);
    const u = r('u') * 2 - 1;
    const v = velocidad * (0.85 + 0.3 * (1 - u * u)) * (0.95 + 0.1 * r('v'));
    const avance = (r('x') * largo + v * t) % largo;
    const x = izquierda + avance;
    return { x, y: centro(x, t) + u * (alto / 2) * (0.92 + 0.08 * Math.sin(t * 0.1 + i)), salto: avance < v * 3 };
  };
  return (
    <g shapeRendering="crispEdges">
      {Array.from({ length: cantidad }, (_, i) => {
        const r = (s: string) => random(`${semilla}-${i}-${s}`);
        if (r('o') > aparece) return null;
        const gluon = i % 6 === 5;
        const c = gluon ? bb.verde : COLORES_QUARK[i % 3];
        const l = gluon ? 8 : 12 + Math.round(r('t') * 6);
        const p = lugar(i, reloj);
        const estela = p.salto
          ? null
          : [3, 6].map((d, k) => {
              const q = lugar(i, reloj - d);
              return <rect key={d} x={q.x - l / 2} y={q.y - l / 2} width={l * 0.8} height={l * 0.8} fill={c} opacity={k ? 0.12 : 0.28} />;
            });
        return (
          <g key={i}>
            {estela}
            <rect x={p.x - l / 2} y={p.y - l / 2} width={l} height={l} fill={c} />
          </g>
        );
      })}
    </g>
  );
};

// --- El acelerador ---------------------------------------------------------------------------------------------

/** Punto del anillo en el ángulo `ang` (radianes, 0 = derecha, π/2 = abajo). */
export const puntoAnillo = (x: number, y: number, rx: number, ry: number, ang: number) => ({ x: x + rx * Math.cos(ang), y: y + ry * Math.sin(ang) });

type ColisionadorProps = {
  x: number;
  y: number;
  /** Radios de la elipse (iguales = visto desde arriba; `ry` chico = en perspectiva). */
  rx: number;
  ry: number;
  reloj: number;
  /** 0–1: el anillo se va dibujando. */
  aparece?: number;
  /** 0–1: brillo del haz que corre por adentro. */
  haz?: number;
  /** Con los dos paquetes de partículas que giran en sentidos contrarios. */
  paquetes?: boolean;
  lado?: number;
  opacidad?: number;
};

/** El anillo del acelerador en píxeles: túnel de acero, el haz ámbar que corre adentro, los cuatro detectores y el
 *  anillo chico que lo alimenta. */
export const Colisionador: FC<ColisionadorProps> = ({ x, y, rx, ry, reloj, aparece = 1, haz = 1, paquetes = true, lado = 12, opacidad = 1 }) => {
  if (aparece <= 0 || opacidad <= 0) return null;
  const n = Math.ceil((2 * Math.PI * Math.max(rx, ry)) / lado);
  const tubo = [];
  const luz = [];
  for (let k = 0; k < n * aparece; k++) {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    const p = puntoAnillo(x, y, rx, ry, a);
    tubo.push(<rect key={k} x={p.x - lado * 0.9} y={p.y - lado * 0.9} width={lado * 1.8} height={lado * 1.8} fill="#2A3350" />);
    const pulso = 0.35 + 0.65 * Math.max(0, Math.sin(a * 6 - reloj * 0.35));
    luz.push(<rect key={k} x={p.x - lado * 0.3} y={p.y - lado * 0.3} width={lado * 0.6} height={lado * 0.6} fill={bb.ambar} opacity={haz * pulso} />);
  }
  const sps = { x: x - rx * 0.62, y: y - ry * 0.98, r: Math.min(rx, ry) * 0.3 };
  const nS = Math.ceil((2 * Math.PI * sps.r) / lado);
  const det = aparece >= 1 ? [Math.PI / 2, 0, Math.PI, -Math.PI / 2] : [];
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {aparece >= 1 &&
        Array.from({ length: nS }, (_, k) => {
          const a = (k / nS) * Math.PI * 2;
          return <rect key={k} x={sps.x + Math.cos(a) * sps.r * (rx / Math.max(rx, ry)) - lado * 0.6} y={sps.y + Math.sin(a) * sps.r * (ry / Math.max(rx, ry)) - lado * 0.6} width={lado * 1.2} height={lado * 1.2} fill="#2A3350" opacity={0.8} />;
        })}
      {tubo}
      {luz}
      {det.map((a, k) => {
        const p = puntoAnillo(x, y, rx, ry, a);
        const s = lado * 2.6;
        return (
          <g key={k}>
            <rect x={p.x - s} y={p.y - s * 0.8} width={2 * s} height={1.6 * s} fill="#55628A" />
            <rect x={p.x - s * 0.55} y={p.y - s * 0.45} width={1.1 * s} height={0.9 * s} fill="#0E1424" />
            <rect x={p.x - s * 0.2} y={p.y - s * 0.2} width={0.4 * s} height={0.4 * s} fill={bb.verde} opacity={0.6 + 0.4 * Math.sin(reloj * 0.4 + k)} />
          </g>
        );
      })}
      {paquetes &&
        aparece >= 1 &&
        [1, -1].map((s) =>
          [0, 4, 8].map((d, k) => {
            const p = puntoAnillo(x, y, rx, ry, s * (reloj - d) * 0.09 + (s > 0 ? 0 : Math.PI));
            const l = lado * (1.1 - k * 0.3);
            return <rect key={`${s}-${d}`} x={p.x - l / 2} y={p.y - l / 2} width={l} height={l} fill={k ? bb.ambar : INCANDESCENTE} opacity={haz * (1 - k * 0.3)} />;
          }),
        )}
    </g>
  );
};

// --- Escala de potencias de diez -------------------------------------------------------------------------------

/** Altura (px) de la temperatura `k` en una escala que va de 10^min (abajo) a 10^max (arriba). */
export const alturaLog = (k: number, min: number, max: number, abajo: number, arriba: number) => abajo - ((Math.log10(k) - min) / (max - min)) * (abajo - arriba);

export type MarcaLog = { k: number; texto: string; color: string; aparece?: number; grande?: boolean };

type EscalaLogProps = {
  x: number;
  abajo: number;
  arriba: number;
  /** Potencias de diez de los extremos (pueden cambiar para estirar la escala). */
  min: number;
  max: number;
  marcas?: MarcaLog[];
  /** Hasta dónde llega el «líquido» de la escala (temperatura en K; 0 = vacía). */
  nivel?: number;
  colorNivel?: string;
  opacidad?: number;
};

/** Regla vertical de potencias de diez (cada raya, 10 veces más caliente) con marcas a la derecha. */
export const EscalaLog: FC<EscalaLogProps> = ({ x, abajo, arriba, min, max, marcas = [], nivel = 0, colorNivel = bb.ambar, opacidad = 1 }) => {
  const rango = max - min;
  const cada = rango > 22 ? 5 : rango > 11 ? 2 : 1;
  const rayas = [];
  for (let p = Math.ceil(min); p <= Math.floor(max); p++) {
    const y = abajo - ((p - min) / rango) * (abajo - arriba);
    const mayor = p % cada === 0;
    rayas.push(
      <g key={p}>
        <rect x={x - (mayor ? 16 : 9)} y={y - 2} width={mayor ? 32 : 18} height={4} fill={bb.hueso} opacity={mayor ? 0.8 : 0.4} />
        {mayor && (
          <text x={x - 30} y={y + 10} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso} opacity={0.75}>
            10
            <tspan dy={-14} fontSize={18}>
              {p}
            </tspan>
          </text>
        )}
      </g>,
    );
  }
  const tope = nivel > 0 ? Math.max(arriba, alturaLog(nivel, min, max, abajo, arriba)) : abajo;
  return (
    <g opacity={opacidad}>
      <g shapeRendering="crispEdges">
        <rect x={x - 6} y={arriba} width={12} height={abajo - arriba} fill="#0E1424" />
        <rect x={x - 6} y={tope} width={12} height={abajo - tope} fill={colorNivel} />
        <rect x={x - 10} y={arriba} width={4} height={abajo - arriba} fill="#B9C6E0" opacity={0.7} />
        <rect x={x + 6} y={arriba} width={4} height={abajo - arriba} fill="#B9C6E0" opacity={0.7} />
        {rayas}
      </g>
      {marcas.map((m, k) => {
        const a = m.aparece ?? 1;
        if (a <= 0) return null;
        const y = alturaLog(m.k, min, max, abajo, arriba);
        if (y < arriba - 4 || y > abajo + 4) return null;
        return (
          <g key={k} opacity={limitar(a * 1.5)}>
            <rect x={x - 12} y={y - 12} width={24} height={24} fill={m.color} shapeRendering="crispEdges" />
            <line x1={x + 18} x2={x + 70} y1={y} y2={y} stroke={m.color} strokeWidth={4} strokeDasharray="8 6" />
            <text x={x + 82} y={y + (m.grande ? 13 : 10)} fontFamily={letra.mono} fontWeight={700} fontSize={m.grande ? 38 : 30} fill={m.color}>
              {m.texto}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// --- El muro de Planck -----------------------------------------------------------------------------------------

type MuroProps = {
  x1: number;
  x2: number;
  /** Borde de abajo del muro (el muro sube desde ahí `alto` px y se apaga hacia arriba). */
  abajo: number;
  alto: number;
  reloj: number;
  /** 0–1: los ladrillos van apareciendo de abajo hacia arriba. */
  aparece?: number;
  /** 0–1: las grietas de luz se abren. */
  grietas?: number;
  /** 0–1: brillo del borde de abajo. */
  brillo?: number;
};

const GRIETAS = [
  [[0.22, 0], [0.25, -0.18], [0.2, -0.34], [0.27, -0.52], [0.23, -0.7]],
  [[0.56, 0], [0.52, -0.22], [0.58, -0.4], [0.53, -0.62], [0.59, -0.86]],
  [[0.82, 0], [0.86, -0.16], [0.8, -0.3], [0.85, -0.5]],
];

/** El muro terracota de la temperatura de Planck: ladrillos de píxeles, con grietas de luz que se abren. */
export const MuroPlanck: FC<MuroProps> = ({ x1, x2, abajo, alto, reloj, aparece = 1, grietas = 0, brillo = 1 }) => {
  if (aparece <= 0) return null;
  const ancho = x2 - x1;
  const lad = { w: 84, h: 38, junta: 6 };
  const filas = Math.ceil(alto / lad.h);
  const ladrillos = [];
  for (let f = 0; f < filas; f++) {
    const vis = limitar(aparece * (filas + 2) - f);
    if (vis <= 0) continue;
    const y = abajo - (f + 1) * lad.h;
    const corrido = f % 2 ? lad.w / 2 : 0;
    const apaga = 1 - (f / filas) * 0.75;
    for (let c = -1; c * lad.w < ancho + lad.w; c++) {
      const bx = x1 + c * lad.w + corrido;
      const a = Math.max(bx, x1);
      const b = Math.min(bx + lad.w - lad.junta, x2);
      if (b <= a) continue;
      const r = random(`muro-${f}-${c}`);
      const tono = r < 0.33 ? bb.terracota : r < 0.66 ? '#A8492A' : bb.terracotaOscura;
      ladrillos.push(<rect key={`${f}-${c}`} x={a} y={y + lad.junta / 2 - (1 - vis) * 20} width={b - a} height={lad.h - lad.junta} fill={tono} opacity={vis * apaga} />);
    }
  }
  const caminos = GRIETAS.map((g) => g.map(([u, v], i) => `${i ? 'L' : 'M'} ${x1 + u * ancho} ${abajo + v * alto}`).join(' '));
  return (
    <g>
      <rect x={x1} y={abajo - alto} width={ancho} height={alto} fill="#140B0B" opacity={0.85 * limitar(aparece * 2)} />
      <g shapeRendering="crispEdges">{ladrillos}</g>
      {grietas > 0 &&
        caminos.map((d, k) => (
          <g key={k}>
            <path d={d} stroke={bb.ambar} strokeWidth={22} fill="none" opacity={0.35 + 0.15 * Math.sin(reloj * 0.5 + k)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - grietas} strokeLinejoin="round" />
            <path d={d} stroke={INCANDESCENTE} strokeWidth={6} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - grietas} strokeLinejoin="round" />
          </g>
        ))}
      <rect x={x1} y={abajo - 4} width={ancho} height={8} fill={bb.terracotaClara} opacity={(0.6 + 0.4 * Math.sin(reloj * 0.3)) * brillo * limitar(aparece * 2)} />
      <rect x={x1} y={abajo - 18} width={ancho} height={36} fill={bb.terracotaClara} opacity={0.15 * brillo * limitar(aparece * 2)} />
    </g>
  );
};
