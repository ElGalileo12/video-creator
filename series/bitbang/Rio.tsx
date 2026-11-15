// El río de píxeles (cap 6): franjas de agua ámbar, con rayas de luz que corren hacia la derecha, y ondas cuadradas
// alrededor de lo que está parado adentro. `congela` 0–1 lo vuelve verde y lo detiene (el río de Parménides).
// Las filas de arriba están más lejos: más finas, más lentas y más apagadas. Todo sale de `avance` (cuánto corrió el
// agua) y de random() con semilla. En SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { random } from 'remotion';
import { useMarco } from '../../src/horizontal';

const AGUA = ['#F5A623', '#E9951A', '#FFC65C', '#E07A45'];
const HIELO = ['#39FF88', '#2BD873', '#8CFFC0', '#1E9E57'];
const BRILLO_AGUA = '#FFF1C9';
const BRILLO_HIELO = '#E6FFF1';
const FONDO_AGUA = '#4A2A0E';
const FONDO_HIELO = '#0C3F24';

/** Mezcla dos colores #RRGGBB. */
const mezclarColor = (a: string, b: string, t: number) => {
  const n = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t)).join(',')})`;
};

/** Alto de la fila `r` (0 = la de más lejos) cuando la de más cerca mide `lado`. */
const altoFila = (r: number, filas: number, lado: number) => Math.round(lado * (0.5 + 0.5 * (r / Math.max(1, filas - 1))));

/** Altura (px) del borde de arriba de la fila `r` de un río que empieza en `y`. */
export const filaRio = (y: number, filas: number, lado: number, r: number) => {
  let total = y;
  for (let k = 0; k < r; k++) total += altoFila(k, filas, lado);
  return total;
};

type RioProps = {
  /** Borde de arriba del río (px). */
  y: number;
  filas?: number;
  /** Alto de la fila de más cerca (px). */
  lado?: number;
  /** Cuánto corrió el agua desde el principio (el que llama decide la velocidad y cuándo se frena). */
  avance: number;
  /** 0 = agua ámbar que corre, 1 = hielo verde quieto. */
  congela?: number;
  /** Solo las filas desde `desdeFila` hasta `hastaFila` (para dibujar el frente del río encima de las piernas). */
  desdeFila?: number;
  hastaFila?: number;
  /** 0–1: el agua entra desde la izquierda. */
  aparece?: number;
  opacidad?: number;
  semilla?: string;
};

export const RioPixeles: FC<RioProps> = ({
  y, filas = 9, lado = 30, avance, congela = 0, desdeFila = 0, hastaFila = filas, aparece = 1, opacidad = 1, semilla = 'rio',
}) => {
  // De borde a borde de lo que se ve (en el video horizontal, más ancho que el lienzo).
  const { izq, der } = useMarco();
  const inicio = izq - 40;
  const borde = inicio + aparece * (der - izq + 120);
  const piezas = [];
  for (let r = desdeFila; r < hastaFila; r++) {
    const alto = altoFila(r, filas, lado);
    const y0 = filaRio(y, filas, lado, r);
    const cerca = r / Math.max(1, filas - 1);
    // Fondo de la fila: el agua honda.
    piezas.push(<rect key={`f${r}`} x={inicio} y={y0} width={Math.max(0, borde - inicio)} height={alto} fill={mezclarColor(FONDO_AGUA, FONDO_HIELO, congela)} opacity={0.55 + 0.45 * cerca} />);
    // Rayas de luz: cada bloque de 4 casillas tiene una raya de 1 a 4 casillas, de un color.
    const casilla = alto * 2.2;
    // `avance` va en pasos de 24 px: la fila de más cerca corre 1,2 pasos por cada uno; la de más lejos, 0,35.
    const corrido = avance * 24 * (0.35 + 0.85 * cerca) + random(`${semilla}-fila-${r}`) * 400;
    const primero = Math.floor((corrido + izq - 60) / (casilla * 4));
    const ultimo = Math.ceil((corrido + der + 120) / (casilla * 4));
    for (let b = primero; b <= ultimo; b++) {
      const h = (k: string) => random(`${semilla}-${r}-${b}-${k}`);
      if (h('hay') < 0.28) continue;
      const a = Math.floor(h('a') * 2);
      const largo = Math.min(4 - a, 1 + Math.floor(h('l') * 3.4));
      const x = (b * 4 + a) * casilla - corrido;
      if (x > borde) continue;
      const brilla = h('b') > 0.8;
      const i = Math.floor(h('c') * AGUA.length);
      const c = brilla ? mezclarColor(BRILLO_AGUA, BRILLO_HIELO, congela) : mezclarColor(AGUA[i], HIELO[i], congela);
      piezas.push(<rect key={`${r}-${b}`} x={x} y={y0 + 2} width={Math.min(largo * casilla - 3, borde - x)} height={alto - 4} fill={c} opacity={0.5 + 0.5 * cerca} />);
    }
  }
  return (
    <g shapeRendering="crispEdges" opacity={opacidad}>
      {piezas}
    </g>
  );
};

/**
 * Ondas de píxeles que salen de (x, y) cada `cada` fotogramas y se abren aplastadas (el agua se ve de lado).
 * `congeladaEn`: fotograma en que se quedan quietas; `quietas` 0–1 las vuelve verdes.
 */
export const Ondas: FC<{ x: number; y: number; frame: number; cada?: number; ancho?: number; quietas?: number; congeladaEn?: number; lado?: number }> = ({
  x, y, frame, cada = 26, ancho = 300, quietas = 0, congeladaEn = Infinity, lado = 12,
}) => {
  const t = Math.min(frame, congeladaEn);
  const anillos = [];
  const color = mezclarColor(BRILLO_AGUA, BRILLO_HIELO, quietas);
  for (let k = 0; k < 3; k++) {
    const abre = ((t + k * cada) % (cada * 3)) / (cada * 3);
    const rx = 50 + abre * ancho;
    const ry = rx * 0.16;
    const n = Math.max(8, Math.round((rx * 2 * Math.PI) / (lado * 2.4)));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // Cuadrar la elipse: cada cuadradito cae en la grilla de `lado` px.
      const px = Math.round((x + Math.cos(a) * rx) / lado) * lado;
      const py = Math.round((y + Math.sin(a) * ry) / lado) * lado;
      anillos.push(<rect key={`${k}-${i}`} x={px - lado / 2} y={py - lado / 2} width={lado} height={lado * 0.6} fill={color} opacity={(1 - abre) * 0.95} />);
    }
  }
  return <g shapeRendering="crispEdges">{anillos}</g>;
};
