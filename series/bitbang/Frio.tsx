// Lo frío (especial «El lugar más frío del universo»): el termómetro de píxeles que pasa de ámbar a cian y a casi
// blanco, los átomos de píxeles que vibran según la temperatura y la escalera hacia el cero absoluto (cada escalón
// baja la mitad de lo que falta: se acerca sin llegar nunca). En SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { random } from 'remotion';
import { bb, letra } from './tema';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Mezcla dos colores «#RRGGBB» (t 0–1). */
export const mezclarColor = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * limitar(t))).join(',')})`;
};

/** Blanco helado, lo más frío. */
export const HIELO = '#E8FBFF';

/** Color de algo según lo frío que está: 0 = ámbar (tibio), 0.6 = cian, 1 = casi blanco. */
export const colorFrio = (t: number) => (t < 0.6 ? mezclarColor(bb.ambar, bb.cian, t / 0.6) : mezclarColor(bb.cian, HIELO, (t - 0.6) / 0.4));

/** Grados Celsius con el signo menos tipográfico y coma decimal («−273,15 °C»). */
export const celsius = (c: number, decimales = 0) => `${c < 0 ? '−' : ''}${Math.abs(c).toFixed(decimales).replace('.', ',')} °C`;

// --- Termómetro -------------------------------------------------------------------------------------------------

export type MarcaTermometro = { en: number; texto: string; color?: string; aparece?: number };

type TermometroProps = {
  /** Centro del tubo y su parte de arriba; `alto`: largo del tubo sin el bulbo. */
  x: number;
  arriba: number;
  alto: number;
  /** 0–1: hasta dónde llega el líquido (0 = el fondo del tubo). */
  nivel: number;
  /** 0–1: color del líquido (ver `colorFrio`). */
  frio?: number;
  /** Color fijo del líquido (en vez de `frio`), p. ej. `colorCalor` del especial del calor. */
  color?: string;
  lado?: number;
  /** Rayas con texto a la derecha del tubo (`en`: altura 0–1). */
  marcas?: MarcaTermometro[];
  /** 0–1: cristales de escarcha pegados al vidrio. */
  escarcha?: number;
  opacidad?: number;
};

export const Termometro: FC<TermometroProps> = ({ x, arriba, alto, nivel, frio = 0, color, lado: l = 12, marcas = [], escarcha = 0, opacidad = 1 }) => {
  const c = color ?? colorFrio(frio);
  const vidrio = '#B9C6E0';
  const fondo = arriba + alto;
  const tope = fondo - Math.round(((alto * limitar(nivel)) / l) * 2) * (l / 2);
  const bulbo = { x, y: fondo + 3.4 * l };
  const celdas = [];
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const cx = bulbo.x + i * l;
      const cy = bulbo.y + j * l;
      const d = Math.hypot(i, j);
      if (d > 4.6) continue;
      if (d <= 3.6) celdas.push(<rect key={`${i}-${j}`} x={cx - l / 2} y={cy - l / 2} width={l} height={l} fill={c} />);
      else if (!(Math.abs(i) <= 1 && j < 0)) celdas.push(<rect key={`${i}-${j}`} x={cx - l / 2} y={cy - l / 2} width={l} height={l} fill={vidrio} />);
    }
  }
  const cristales = [];
  for (let k = 0; k < 46; k++) {
    const r = (s: string) => random(`termo-escarcha-${k}-${s}`);
    if (r('a') > escarcha) continue;
    const lado = Math.round(l * (0.35 + 0.45 * r('t')));
    const izquierda = r('l') < 0.5;
    const px = x + (izquierda ? -1 : 1) * (2.5 * l + r('x') * l * 0.9) - (izquierda ? lado : 0);
    const py = arriba + r('y') * (alto + 6 * l);
    cristales.push(<rect key={k} x={px} y={py} width={lado} height={lado} fill={HIELO} opacity={0.55 + 0.4 * r('o')} />);
  }
  return (
    <g opacity={opacidad}>
      <circle cx={bulbo.x} cy={bulbo.y} r={7 * l} fill={c} opacity={0.13} />
      <g shapeRendering="crispEdges">
        <rect x={x - 1.5 * l} y={arriba} width={3 * l} height={alto + l} fill="#0E1424" />
        <rect x={x - 1.5 * l} y={tope} width={3 * l} height={fondo - tope + l} fill={c} />
        <rect x={x - 2.5 * l} y={arriba} width={l} height={alto} fill={vidrio} />
        <rect x={x + 1.5 * l} y={arriba} width={l} height={alto} fill={vidrio} />
        <rect x={x - 1.5 * l} y={arriba - l} width={3 * l} height={l} fill={vidrio} />
        {celdas}
        <rect x={x - 1.5 * l + 3} y={arriba + l} width={l * 0.4} height={alto - 2 * l} fill="#FFFFFF" opacity={0.2} />
        {Array.from({ length: 11 }, (_, k) => (
          <rect key={k} x={x + 2.5 * l + 6} y={fondo - (alto * k) / 10 - 2} width={k % 5 === 0 ? 1.6 * l : 0.9 * l} height={4} fill={bb.hueso} opacity={0.55} />
        ))}
        {cristales}
      </g>
      {marcas.map((m, k) => {
        const y = fondo - alto * m.en;
        const a = m.aparece ?? 1;
        if (a <= 0) return null;
        const col = m.color ?? bb.hueso;
        return (
          <g key={k} opacity={limitar(a * 1.5)}>
            <line x1={x - 2.5 * l - 10} x2={x + 2.5 * l + 10} y1={y} y2={y} stroke={col} strokeWidth={4} strokeDasharray="8 6" />
            <text x={x + 4.6 * l} y={y + 11} fontFamily={letra.mono} fontWeight={700} fontSize={30} fill={col}>
              {m.texto}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// --- Átomos -----------------------------------------------------------------------------------------------------

/** Un átomo de píxeles: disco de `celdas` cuadraditos de ancho, con brillo arriba a la izquierda y borde más oscuro. */
export const AtomoPixel: FC<{ x: number; y: number; radio: number; color: string; celdas?: number; opacidad?: number }> = ({
  x, y, radio, color: c, celdas: n = 5, opacidad = 1,
}) => {
  if (radio <= 0.5) return null;
  const l = (2 * radio) / n;
  const luz = mezclarColor(c.startsWith('#') ? c : '#FFFFFF', '#FFFFFF', 0.55);
  const rects = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u = i - (n - 1) / 2;
      const v = j - (n - 1) / 2;
      const d = Math.hypot(u, v);
      if (d > n / 2 - 0.1) continue;
      const brillo = u < 0 && v < 0 && Math.hypot(u + n * 0.2, v + n * 0.2) < n * 0.17;
      const borde = d > n / 2 - 1.05;
      rects.push(<rect key={`${i}-${j}`} x={x - radio + i * l} y={y - radio + j * l} width={l + 0.4} height={l + 0.4} fill={brillo ? luz : c} opacity={borde ? 0.72 : 1} />);
    }
  }
  return (
    <g shapeRendering="crispEdges" opacity={opacidad}>
      {rects}
    </g>
  );
};

/** Cuánto se corre el átomo `i` de su lugar al vibrar (`agitacion` px); determinista. */
export const vibracion = (i: number, reloj: number, agitacion: number, semilla = 'atomos') => {
  const r = (k: string) => random(`${semilla}-${i}-${k}`);
  const fx = 0.75 + r('fx') * 0.8;
  const fy = 0.75 + r('fy') * 0.8;
  return {
    x: agitacion * (0.7 * Math.sin(reloj * fx + r('px') * 6.28) + 0.3 * Math.sin(reloj * fx * 2.3 + r('qx') * 6.28)),
    y: agitacion * (0.7 * Math.sin(reloj * fy + r('py') * 6.28) + 0.3 * Math.sin(reloj * fy * 2.1 + r('qy') * 6.28)),
  };
};

/** Lugar de reposo del átomo `i` en la red (centrada en cx, cy). */
export const lugarAtomo = (i: number, cx: number, cy: number, columnas: number, filas: number, paso: number) => ({
  x: cx + ((i % columnas) - (columnas - 1) / 2) * paso,
  y: cy + (Math.floor(i / columnas) - (filas - 1) / 2) * paso,
});

type RedAtomosProps = {
  cx: number;
  cy: number;
  columnas: number;
  filas: number;
  paso: number;
  radio: number;
  /** Reloj (fotograma) que mueve la vibración: usar el del video completo para que no salte entre escenas. */
  reloj: number;
  /** Cuánto vibran (px). Con mucha agitación dejan una estela. */
  agitacion: number;
  /** 0–1: color (ver `colorFrio`). */
  frio?: number;
  /** Color fijo (en vez de `frio`). */
  color?: string;
  /** 0–1: van apareciendo, cada uno con un pequeño salto. */
  aparece?: number;
  /** Índice de un átomo que se queda cuando los demás se apagan (`apagar` 0–1). */
  foco?: number;
  apagar?: number;
  /** Para moverlos o pintarlos distinto (p. ej. cuando «enloquecen»). */
  mover?: (i: number, x: number, y: number) => { x: number; y: number; color?: string; radio?: number };
  semilla?: string;
};

export const RedAtomos: FC<RedAtomosProps> = ({
  cx, cy, columnas, filas, paso, radio, reloj, agitacion, frio = 0, color, aparece = 1, foco, apagar = 0, mover, semilla = 'atomos',
}) => {
  const c = color ?? colorFrio(frio);
  return (
    <g>
      {Array.from({ length: columnas * filas }, (_, i) => {
        const r = random(`${semilla}-${i}-aparece`);
        const sale = limitar((aparece * 1.5 - r * 0.5) * 1.4);
        const salto = sale < 1 ? Math.sin(sale * Math.PI) * 0.25 : 0;
        const tam = radio * (sale + salto);
        if (tam <= 0.5) return null;
        const opacidad = foco !== undefined && i !== foco ? 1 - apagar : 1;
        if (opacidad <= 0.01) return null;
        const base = lugarAtomo(i, cx, cy, columnas, filas, paso);
        const v = vibracion(i, reloj, agitacion, semilla);
        const final = mover ? mover(i, base.x + v.x, base.y + v.y) : { x: base.x + v.x, y: base.y + v.y };
        const antes = vibracion(i, reloj - 2, agitacion, semilla);
        const estela = agitacion > 5 && !mover;
        return (
          <g key={i} opacity={opacidad}>
            {estela && <AtomoPixel x={base.x + antes.x} y={base.y + antes.y} radio={tam} color={c} opacidad={0.22 * limitar((agitacion - 5) / 8)} />}
            <AtomoPixel x={final.x} y={final.y} radio={final.radio ?? tam} color={final.color ?? c} />
          </g>
        );
      })}
    </g>
  );
};

// --- Escalera hacia el cero ---------------------------------------------------------------------------------------

export type Escalon = { x: number; ancho: number; y: number };

/**
 * Escalones que bajan hacia el suelo (el cero absoluto): el primero arriba a la izquierda en (x, y) con `ancho`;
 * cada uno mide la mitad de ancho y baja la mitad de lo que falta. Terminan, sin tocarlo, en (x + 2·ancho, suelo).
 */
export const escalonesCero = (x: number, y: number, suelo: number, ancho: number, cantidad: number): Escalon[] => {
  const lista: Escalon[] = [];
  let px = x;
  let w = ancho;
  let falta = suelo - y;
  for (let k = 0; k < cantidad; k++) {
    lista.push({ x: px, ancho: w, y: suelo - falta });
    px += w;
    w /= 2;
    falta /= 2;
  }
  return lista;
};

/** Dónde se para algo de radio `r` en el centro del escalón. */
export const pisoEscalon = (e: Escalon, r: number) => ({ x: e.x + e.ancho / 2, y: e.y - r });

type EscaleraProps = {
  escalones: Escalon[];
  suelo: number;
  /** Cuántos escalones se ven (con decimales: el último crece). */
  dibujados?: number;
  color?: string;
  /** 0–1: brillo del suelo (la raya del cero). */
  brilloSuelo?: number;
  /** Desde dónde hasta dónde va la raya del suelo. */
  sueloDesde?: number;
  sueloHasta?: number;
  /** Cuánto se agranda al dibujarla (en una lupa): los bordes finos no engordan con el aumento. */
  escala?: number;
};

export const EscaleraCero: FC<EscaleraProps> = ({ escalones, suelo, dibujados = escalones.length, color: c = bb.cian, brilloSuelo = 1, sueloDesde = 60, sueloHasta = 1020, escala = 1 }) => (
  <g>
    <rect x={sueloDesde} y={suelo - 3} width={sueloHasta - sueloDesde} height={6} fill={bb.ambar} opacity={0.5 + 0.5 * brilloSuelo} />
    <rect x={sueloDesde} y={suelo - 12} width={sueloHasta - sueloDesde} height={24} fill={bb.ambar} opacity={0.12 * brilloSuelo} />
    {escalones.map((e, k) => {
      const a = limitar(dibujados - k);
      if (a <= 0) return null;
      const alto = (suelo - e.y) * a;
      const grosor = Math.max(1.5 / escala, Math.min(8, e.ancho / 12));
      if (e.ancho * escala < 0.5) return null;
      return (
        <g key={k}>
          <rect x={e.x} y={suelo - alto} width={e.ancho + 0.5 / escala} height={Math.max(0, alto - 3 / escala)} fill={bb.nocheClara} />
          <rect x={e.x} y={suelo - alto} width={e.ancho + 0.5 / escala} height={grosor} fill={c} />
          <rect x={e.x} y={suelo - alto} width={Math.max(1 / escala, grosor * 0.6)} height={Math.max(0, alto - 3 / escala)} fill={c} opacity={0.45} />
        </g>
      );
    })}
  </g>
);
