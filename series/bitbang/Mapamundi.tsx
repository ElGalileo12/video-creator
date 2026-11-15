// El mapa del mundo de Anaximandro (reconstrucción esquemática: no sobrevive ninguna copia): un disco con el mar
// en el centro, las tierras alrededor (Europa, Asia y Libia, separadas por mares y ríos) y el océano rodeándolo
// todo. La misma cuadrícula sirve para el dibujo 2D de píxeles y para el disco 3D (Mapa3D), así los dos
// coinciden vistos desde arriba.
import type { FC } from 'react';
import { random } from 'remotion';
import { bb } from './tema';

export type TipoCelda = 'oceano' | 'mar' | 'rio' | 'europa' | 'asia' | 'libia';

/** Celdas a lo ancho del disco. */
export const CELDAS = 42;
/** Donde empieza el océano (en radios del disco). */
export const BORDE_OCEANO = 0.84;

/** Coordenadas del mapa: u hacia el este, v hacia el sur; el disco entero tiene radio 1. */
export type PuntoMapa = { u: number; v: number };

// Mares como elipses (centro, radios y giro en radianes).
const MARES = [
  { u: -0.32, v: 0.1, ru: 0.54, rv: 0.13, giro: 0 }, // Mediterráneo occidental, hasta las Columnas de Hércules
  { u: 0.25, v: 0.14, ru: 0.27, rv: 0.12, giro: 0 }, // Mediterráneo oriental
  { u: 0.08, v: -0.06, ru: 0.08, rv: 0.15, giro: 0 }, // Egeo
  { u: -0.1, v: -0.05, ru: 0.045, rv: 0.13, giro: -0.6 }, // Adriático
  { u: 0.36, v: -0.37, ru: 0.27, rv: 0.12, giro: 0 }, // mar Negro
  { u: 0.17, v: -0.22, ru: 0.04, rv: 0.08, giro: 0 }, // estrechos
  { u: 0.47, v: -0.53, ru: 0.07, rv: 0.06, giro: 0 }, // lago Meótide
  { u: 0.74, v: -0.44, ru: 0.08, rv: 0.27, giro: 0 }, // mar Caspio, abierto al océano del norte
  { u: 0.6, v: 0.52, ru: 0.05, rv: 0.3, giro: -0.45 }, // mar Rojo
  { u: 0.8, v: 0.3, ru: 0.05, rv: 0.15, giro: -0.8 }, // golfo Pérsico
];

// Ríos que separan los continentes: el Nilo (Libia | Asia) y el Tanais (Europa | Asia).
const RIOS: [number, number][][] = [
  [[0.35, 0.24], [0.37, 0.42], [0.34, 0.6], [0.4, 0.9]],
  [[0.47, -0.57], [0.43, -0.7], [0.46, -0.9]],
];

const distanciaSegmento = (u: number, v: number, [a, b]: [number, number][]) => {
  const du = b[0] - a[0];
  const dv = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((u - a[0]) * du + (v - a[1]) * dv) / (du * du + dv * dv)));
  return Math.hypot(u - a[0] - t * du, v - a[1] - t * dv);
};

const esMar = (u: number, v: number) =>
  MARES.some((m) => {
    const c = Math.cos(m.giro);
    const s = Math.sin(m.giro);
    const du = (u - m.u) * c + (v - m.v) * s;
    const dv = -(u - m.u) * s + (v - m.v) * c;
    // Un poco de ondulación para que la costa no sea una elipse perfecta.
    return (du / m.ru) ** 2 + (dv / m.rv) ** 2 < 1 + 0.22 * Math.sin(u * 23 + 1) * Math.cos(v * 19 + 2);
  });

const esRio = (u: number, v: number) => RIOS.some((rio) => rio.slice(1).some((p, i) => distanciaSegmento(u, v, [rio[i], p]) < 0.032));

/** Qué hay en el punto (u, v) del mapa (null = fuera del disco). */
export const tipoMapa = (u: number, v: number): TipoCelda | null => {
  const r = Math.hypot(u, v);
  if (r > 1) return null;
  if (r > BORDE_OCEANO) return 'oceano';
  if (esMar(u, v)) return 'mar';
  if (esRio(u, v)) return 'rio';
  if (u < 0.13) return v < 0.1 ? 'europa' : 'libia';
  if (v < -0.2 && u < 0.18) return 'europa';
  if (v < -0.46 && u < 0.45) return 'europa';
  if (v > 0.2 && u < 0.35 + (v - 0.24) * 0.06) return 'libia';
  return 'asia';
};

export const PALETA_MAPA: Record<TipoCelda, string[]> = {
  oceano: ['#2F6FA3', '#2A6496', '#3478B0'],
  mar: ['#1D3F66', '#183556', '#1F4470'],
  rio: ['#3478B0'],
  europa: [bb.terracota, '#A84824', '#B4642E'],
  asia: [bb.ambar, '#E39A2C', '#D49A3A'],
  libia: ['#E7C88F', '#D9B377', '#EBD3A3'],
};

export type Celda = { i: number; j: number; u: number; v: number; tipo: TipoCelda; color: string };

/** Centro de la celda (i, j) en coordenadas del mapa. */
export const centroCelda = (i: number, j: number): PuntoMapa => ({ u: (i + 0.5) / (CELDAS / 2) - 1, v: (j + 0.5) / (CELDAS / 2) - 1 });

/** Color de una celda: siempre el mismo para la misma celda (en 2D y en 3D). */
export const colorCelda = (i: number, j: number, tipo: TipoCelda) => {
  const paleta = PALETA_MAPA[tipo];
  return paleta[Math.floor(random(`mapa-${i}-${j}`) * paleta.length)];
};

/**
 * Las celdas del mapa. `borde(angulo)` deforma el contorno: multiplica el radio del disco en esa dirección
 * (1 = el círculo perfecto). Con borde, la cuadrícula se extiende más allá del disco original.
 */
export const celdasMapa = (borde?: (angulo: number) => number): Celda[] => {
  const extra = borde ? Math.ceil(CELDAS * 0.2) : 0;
  const lista: Celda[] = [];
  for (let j = -extra; j < CELDAS + extra; j++) {
    for (let i = -extra; i < CELDAS + extra; i++) {
      const { u, v } = centroCelda(i, j);
      const s = borde ? borde(Math.atan2(v, u)) : 1;
      const tipo = tipoMapa(u / s, v / s);
      if (tipo) lista.push({ i, j, u, v, tipo, color: colorCelda(i, j, tipo) });
    }
  }
  return lista;
};

const CELDAS_DISCO = celdasMapa();

/** Mileto, en la costa de Asia frente al Egeo (cerca del centro del mapa). */
export const MILETO: PuntoMapa = { u: 0.18, v: 0.0 };

const esTierra = (t: TipoCelda | null) => t === 'europa' || t === 'asia' || t === 'libia';

/** Celdas de tierra que tocan el mar: la costa. */
const CELDAS_COSTA = CELDAS_DISCO.filter((c) => {
  if (!esTierra(c.tipo)) return false;
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([di, dj]) => {
    const { u, v } = centroCelda(c.i + di, c.j + dj);
    return tipoMapa(u, v) === 'mar';
  });
});

/** Lleva un punto a la celda de costa más cercana. */
const enLaCosta = (p: PuntoMapa): PuntoMapa => {
  let mejor = CELDAS_COSTA[0];
  for (const c of CELDAS_COSTA) if (Math.hypot(c.u - p.u, c.v - p.v) < Math.hypot(mejor.u - p.u, mejor.v - p.v)) mejor = c;
  return { u: mejor.u, v: mejor.v };
};

/** Puntos de costa que «traen» los barcos, en el orden en que se unen alrededor del mar. */
export const COSTAS: (PuntoMapa & { nombre: string })[] = [
  { nombre: 'Columnas de Hércules', u: -0.8, v: 0.03 },
  { nombre: 'Masalia', u: -0.45, v: -0.05 },
  { nombre: 'Sicilia', u: -0.12, v: 0.0 },
  { nombre: 'Atenas', u: 0.0, v: -0.05 },
  { nombre: 'Tracia', u: 0.12, v: -0.3 },
  { nombre: 'Olbia', u: 0.3, v: -0.52 },
  { nombre: 'Fasis', u: 0.66, v: -0.37 },
  { nombre: 'Sinope', u: 0.38, v: -0.24 },
  { nombre: 'Fenicia', u: 0.54, v: 0.12 },
  { nombre: 'Náucratis', u: 0.34, v: 0.28 },
  { nombre: 'Cirene', u: 0.05, v: 0.26 },
  { nombre: 'Cartago', u: -0.22, v: 0.25 },
].map((c) => ({ ...c, ...enLaCosta(c) }));

/** Dónde poner el nombre de cada parte del mapa. */
export const ETIQUETAS_MAPA = {
  mar: { u: -0.3, v: 0.1, texto: 'MAR', color: '#9FD0F0' },
  europa: { u: -0.4, v: -0.42, texto: 'EUROPA', color: bb.terracotaClara },
  asia: { u: 0.58, v: -0.06, texto: 'ASIA', color: bb.ambar },
  libia: { u: -0.3, v: 0.5, texto: 'LIBIA', color: '#EBD3A3' },
  oceano: { u: -0.92, v: -0.06, texto: 'OCÉANO', color: bb.verde },
};

type Mapa2DProps = {
  /** Centro y radio del disco en el video (px). */
  x: number;
  y: number;
  radio: number;
  /** 0–1 por celda: hace aparecer cada cuadradito (por defecto, todos visibles). */
  revelar?: (c: Celda) => number;
  /** Deforma el contorno (ver `celdasMapa`). */
  borde?: (angulo: number) => number;
  opacidad?: number;
};

/** El mapa en cuadraditos, visto desde arriba. */
export const Mapa2D: FC<Mapa2DProps> = ({ x, y, radio, revelar, borde, opacidad = 1 }) => {
  const lado = (radio * 2) / CELDAS;
  const celdas = borde ? celdasMapa(borde) : CELDAS_DISCO;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {celdas.map((c) => {
        const a = revelar ? revelar(c) : 1;
        if (a <= 0) return null;
        const l = (lado + 0.6) * Math.min(1, a);
        return <rect key={`${c.i}-${c.j}`} x={x + c.u * radio - l / 2} y={y + c.v * radio - l / 2} width={l} height={l} fill={c.color} opacity={Math.min(1, a * 1.5)} />;
      })}
    </g>
  );
};
