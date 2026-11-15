// El cuchillo (cap 7) y el tajo de luz que deja al cortar. En SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { mezclar, tramo } from '../../src/escena';
import { bb } from './tema';

type Punto = { x: number; y: number };

/** Cuchillo con la punta en (x, y), apuntando hacia `angulo` grados (0 = a la derecha, 90 = hacia abajo). */
export const Cuchillo: FC<{ x: number; y: number; angulo: number; largo?: number; opacidad?: number }> = ({ x, y, angulo, largo: L = 300, opacidad = 1 }) => {
  const h = 0.13 * L;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angulo})`} opacity={opacidad}>
      <path d={`M 0 0 L ${-0.16 * L} ${-h} L ${-0.62 * L} ${-h} L ${-0.62 * L} ${0.03 * L} L ${-0.12 * L} ${0.03 * L} Z`} fill="#D9DEE6" stroke={bb.tinta} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${-0.1 * L} ${-0.02 * L} L ${-0.6 * L} ${-0.02 * L}`} stroke="#FFFFFF" strokeWidth={4} opacity={0.8} />
      <rect x={-0.67 * L} y={-h - 6} width={0.05 * L} height={h + 0.03 * L + 12} fill={bb.ambar} stroke={bb.tinta} strokeWidth={3} />
      <rect x={-L} y={-h * 0.85} width={0.33 * L} height={h * 0.95} rx={8} fill={bb.terracota} stroke={bb.tinta} strokeWidth={4} />
      {[0.25, 0.5, 0.75].map((k) => (
        <rect key={k} x={-L + k * 0.33 * L - 4} y={-h * 0.45} width={8} height={8} fill={bb.ambar} />
      ))}
    </g>
  );
};

type TajoProps = {
  de: Punto;
  a: Punto;
  /** Fotograma en que empieza el corte. */
  desde: number;
  /** Fotogramas que tarda en cruzar. */
  dur?: number;
  /** Con el cuchillo dibujado en la punta del tajo. */
  cuchillo?: boolean;
  largoCuchillo?: number;
  color?: string;
  grosor?: number;
};

/** Raya de luz que cruza de `de` a `a` (como la hoja al cortar) y se apaga. */
export const Tajo: FC<TajoProps> = ({ de, a, desde, dur = 6, cuchillo = false, largoCuchillo = 260, color: c = bb.ambar, grosor = 8 }) => {
  const f = useCurrentFrame();
  if (f < desde || f > desde + dur + 14) return null;
  const p = tramo(f, desde, dur, Easing.out(Easing.quad));
  const cola = tramo(f, desde + dur * 0.4, dur + 6, Easing.in(Easing.quad));
  const apaga = 1 - tramo(f, desde + dur, 14);
  const punta = { x: mezclar(p, de.x, a.x), y: mezclar(p, de.y, a.y) };
  const inicio = { x: mezclar(cola, de.x, a.x), y: mezclar(cola, de.y, a.y) };
  const angulo = (Math.atan2(a.y - de.y, a.x - de.x) * 180) / Math.PI;
  return (
    <g>
      <line x1={inicio.x} y1={inicio.y} x2={punta.x} y2={punta.y} stroke={c} strokeWidth={grosor * 4} strokeLinecap="round" opacity={0.3 * apaga} />
      <line x1={inicio.x} y1={inicio.y} x2={punta.x} y2={punta.y} stroke={bb.hueso} strokeWidth={grosor} strokeLinecap="round" opacity={apaga} />
      {cuchillo && <Cuchillo x={punta.x} y={punta.y} angulo={angulo} largo={largoCuchillo} opacidad={1 - tramo(f, desde + dur, 8)} />}
    </g>
  );
};
