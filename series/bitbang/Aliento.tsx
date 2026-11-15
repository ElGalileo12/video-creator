// El soplo de Anaxímenes (cap 5): una cabeza de perfil grande al estilo de las vasijas que sopla con la boca
// abierta o con los labios apretados, la mano de píxeles que recibe el aire, el chorro de cuadraditos entre
// las dos y una nube de aire «tangible». Para usar dentro de un SVG. Todo sale del fotograma y de random().
import type { FC } from 'react';
import { random } from 'remotion';
import { Pixelado } from './Criaturas';
import { CabezaGriega } from './Siluetas';
import { bb } from './tema';

const T = bb.terracota;
const TINTA = bb.tinta;

/** Dónde sale el aire de la cabeza centrada en (x, y) con radio `r`: más adelante con los labios apretados. */
export const bocaDe = (x: number, y: number, r: number, labios: number) => ({ x: x + ((31 + 7 * labios) * r) / 30, y: y + (15 * r) / 30 });

/** Cabeza de perfil (mirando a la derecha) con cuello y hombros, centrada en (x, y). `labios` 0 = boca abierta, 1 = apretados. */
export const CabezaSopla: FC<{ x: number; y: number; r: number; labios: number; opacidad?: number }> = ({ x, y, r, labios, opacidad = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 30})`} opacity={opacidad}>
    <path d="M -64 96 Q -60 62 -22 54 L 16 54 Q 52 62 58 96 Z" fill={T} />
    <path d="M -50 70 Q -4 84 46 70" stroke={bb.ambar} strokeWidth={3.5} fill="none" />
    <rect x={-10} y={22} width={20} height={36} fill={T} />
    <CabezaGriega pelo="largo" />
    {/* Boca abierta: un hueco oscuro en el perfil. */}
    <ellipse cx={27} cy={15} rx={5.5} ry={6.5 * (1 - labios) + 0.5} fill={TINTA} opacity={1 - labios} />
    {/* Labios apretados: una «o» que sobresale, con un agujerito. */}
    <g opacity={labios}>
      <ellipse cx={31 + 2 * labios} cy={15} rx={5.5} ry={4.2} fill={T} stroke={TINTA} strokeWidth={1.2} />
      <ellipse cx={36 + 2 * labios} cy={15} rx={1.3} ry={1.8} fill={TINTA} />
    </g>
  </g>
);

// Mano abierta de frente (15 × 19): X piel, D sombra entre los dedos, H brillo.
const MANO = [
  '.......XX......',
  '....XX.XX.XX...',
  '....XX.XX.XX...',
  '....XH.XH.XH...',
  '....XX.XX.XX.X.',
  '....XX.XX.XX.XX',
  '....XX.XX.XX.XX',
  '....XX.XX.XX.XH',
  '....XXDXXDXXDXX',
  'XX..XXXXXXXXXXX',
  'XXX.XXXXXXXXXXX',
  '.XXXXXXXXXXXXXX',
  '..XXXXXXXDDXXXX',
  '...XXXXXXXXDXXX',
  '....XXXXXXXXXXX',
  '.....XXXXXXXXX.',
  '.....XXXXXXXXX.',
  '.....XDXXXXDXX.',
  '.....XXXXXXXXX.',
]

/** Mano de píxeles centrada en (x, y). `calor` −1 (frío, verde) a 1 (tibio, ámbar) la tiñe. */
export const ManoPixeles: FC<{ x: number; y: number; lado: number; calor?: number; opacidad?: number }> = ({ x, y, lado, calor = 0, opacidad = 1 }) => {
  const tinte = calor > 0 ? bb.ambar : bb.verde;
  return (
    <g opacity={opacidad}>
      <Pixelado filas={MANO} paleta={{ X: T, D: bb.terracotaOscura, H: bb.terracotaClara }} x={x} y={y} lado={lado} />
      {calor !== 0 && <Pixelado filas={MANO} paleta={{ X: tinte, D: tinte, H: tinte }} x={x} y={y} lado={lado} opacidad={0.5 * Math.min(1, Math.abs(calor))} />}
    </g>
  );
};

/** Ancho de la mano (px) con ese lado de cuadradito: para saber dónde llega el aire. */
export const anchoMano = (lado: number) => MANO[0].length * lado;

type SoploProps = {
  /** Boca (de donde sale el aire) en el fotograma `nace`. */
  boca: (nace: number) => { x: number; y: number };
  /** Hasta dónde llega el aire (el borde de la mano). */
  hastaX: number;
  frame: number;
  /** Fotogramas entre los que sale aire. */
  desde: number;
  hasta?: number;
  /** 0 = boca abierta (nube ancha, lenta, ámbar, cuadraditos separados); 1 = labios apretados (chorro fino, rápido, verde, apretado). */
  labios: (nace: number) => number;
  semilla?: string;
};

const AMBARES = [bb.ambar, '#F2C46D', bb.terracotaClara];
const VERDES = [bb.verde, '#9DFFC4', '#2BD873'];

/** El aire que sale de la boca: cada fotograma nacen unos cuadraditos que vuelan hasta la mano y se esparcen en la palma. */
export const Soplo: FC<SoploProps> = ({ boca, hastaX, frame: f, desde, hasta = 1e9, labios, semilla = 'soplo' }) => {
  const cuadros = [];
  const primero = Math.max(desde, f - 70);
  for (let nace = primero; nace <= Math.min(f, hasta); nace++) {
    const l = labios(nace);
    const { x: x0, y: y0 } = boca(nace);
    const porFotograma = Math.round(2 + 3 * l);
    for (let k = 0; k < porFotograma; k++) {
      const r = (c: string) => random(`${semilla}-${nace}-${k}-${c}`);
      const edad = f - nace + r('e');
      const v = (7 + 8 * l) * (0.85 + 0.3 * r('v'));
      const abre = ((30 - 26 * l) * (r('a') - 0.5) * 2 * Math.PI) / 180;
      const llega = (hastaX - x0) / (v * Math.cos(abre));
      const vuela = Math.min(edad, llega);
      const resto = Math.max(0, edad - llega);
      // Al llegar a la mano se apagan enseguida.
      const vida = Math.min(1 - resto / 4, 1 - 0.6 * Math.max(0, vuela / llega - 0.8) / 0.2);
      if (vida <= 0) continue;
      const ondula = (8 - 6 * l) * Math.sin(edad * 0.35 + r('o') * 6);
      const px = x0 + Math.cos(abre) * v * vuela;
      const py = y0 + Math.sin(abre) * v * vuela + ondula + (r('s') - 0.5) * 2 * resto * v * 0.3;
      // Con la boca abierta, el aire se separa y los cuadraditos crecen; con los labios apretados, van juntos y chicos.
      const lado = ((18 + 8 * r('t')) * (1 - l) + (8 + 4 * r('t')) * l) * (1 + (1 - l) * Math.min(1, vuela / llega) * 0.35);
      const lista = l < 0.5 ? AMBARES : VERDES;
      cuadros.push(
        <rect
          key={`${nace}-${k}`}
          x={Math.round(px / 3) * 3 - lado / 2}
          y={Math.round(py / 3) * 3 - lado / 2}
          width={lado}
          height={lado}
          fill={lista[Math.floor(r('c') * lista.length)]}
          opacity={Math.min(1, vida * 1.4) * Math.min(1, (edad + 1) / 3) * (0.75 + 0.25 * l)}
        />,
      );
    }
  }
  return <g shapeRendering="crispEdges">{cuadros}</g>;
};

const CLAROS = [bb.hueso, '#DCE1E6', '#C2CAD2', '#E8E2D6'];

/** Nube de aire «tangible»: cuadraditos claros que flotan juntos en un círculo de radio `r`. `aparece` 0–1 la arma. */
export const NubeAire: FC<{ x: number; y: number; r: number; frame: number; aparece: number; cantidad?: number; semilla?: string }> = ({
  x, y, r, frame: f, aparece, cantidad = 70, semilla = 'nube-aire',
}) => {
  if (aparece <= 0) return null;
  return (
    <g shapeRendering="crispEdges">
      {Array.from({ length: cantidad }, (_, i) => {
        const q = (c: string) => random(`${semilla}-${i}-${c}`);
        const turno = q('turno');
        const s = Math.min(1, Math.max(0, (aparece - turno * 0.5) / 0.5));
        if (s <= 0) return null;
        const a = q('a') * Math.PI * 2;
        const d = Math.sqrt(q('d')) * r * (0.55 + 0.45 * s) * (1 + 0.6 * (1 - s));
        const lado = 10 + 10 * q('l');
        const px = x + Math.cos(a) * d * 1.25 + 6 * Math.sin(f * 0.05 + q('o') * 6);
        const py = y + Math.sin(a) * d * 0.85 + 5 * Math.cos(f * 0.04 + q('p') * 6);
        return <rect key={i} x={px - lado / 2} y={py - lado / 2} width={lado} height={lado} fill={CLAROS[Math.floor(q('c') * CLAROS.length)]} opacity={s * (0.55 + 0.4 * q('op'))} />;
      })}
    </g>
  );
};
