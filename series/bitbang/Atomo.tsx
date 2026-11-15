// El átomo en 2D (cap 7): cubito visto en perspectiva isométrica, el mismo cubito que se raja y se abre (adentro, el
// núcleo y los electrones: el átomo moderno sí se divide) y un cuadro que se divide sin parar. En SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { bb } from './tema';

export type CarasCubo = { arriba: string; izquierda: string; derecha: string };
export const CARAS_AMBAR: CarasCubo = { arriba: '#FFC65C', izquierda: '#F5A623', derecha: '#C47D10' };

/** Cubo isométrico centrado en (x, y): mide 2·`lado` de alto (la arista de adelante va de y a y + lado). */
export const CuboIso: FC<{ x: number; y: number; lado: number; caras?: CarasCubo; borde?: number; opacidad?: number }> = ({
  x, y, lado: s, caras = CARAS_AMBAR, borde = 4, opacidad = 1,
}) => {
  const w = 0.866 * s;
  return (
    <g opacity={opacidad} stroke={bb.tinta} strokeWidth={borde} strokeLinejoin="round">
      <path d={`M ${x} ${y - s} L ${x + w} ${y - s / 2} L ${x} ${y} L ${x - w} ${y - s / 2} Z`} fill={caras.arriba} />
      <path d={`M ${x - w} ${y - s / 2} L ${x} ${y} L ${x} ${y + s} L ${x - w} ${y + s / 2} Z`} fill={caras.izquierda} />
      <path d={`M ${x} ${y} L ${x + w} ${y - s / 2} L ${x + w} ${y + s / 2} L ${x} ${y + s} Z`} fill={caras.derecha} />
    </g>
  );
};

/** Núcleo (protones y neutrones) y tres órbitas con su electrón. `aparece` 0–1 lo agranda; `frame` mueve los electrones. */
export const AtomoModerno: FC<{ x: number; y: number; radio: number; frame: number; aparece?: number }> = ({ x, y, radio: R, frame, aparece = 1 }) => {
  const brillo = useIdSvg();
  if (aparece <= 0) return null;
  const n = 14 * Math.min(1, aparece * 1.2);
  const nucleo = [[0, 0], [1.7, 0.4], [-1.6, 0.5], [0.4, 1.7], [-0.5, -1.7], [1.2, -1.3], [-1.3, 1.3], [0.9, 1.6], [-1.7, -0.9]];
  return (
    <g transform={`translate(${x} ${y}) scale(${aparece}) translate(${-x} ${-y})`}>
      <defs>
        <radialGradient id={brillo}>
          <stop offset="0" stopColor={bb.ambar} stopOpacity={0.55} />
          <stop offset="1" stopColor={bb.ambar} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={R * 0.55} fill={`url(#${brillo})`} />
      {[0, 60, 120].map((g) => (
        <ellipse key={g} cx={x} cy={y} rx={R} ry={R * 0.32} fill="none" stroke={bb.cian} strokeWidth={3} strokeDasharray="10 9" opacity={0.45} transform={`rotate(${g} ${x} ${y})`} />
      ))}
      {nucleo.map(([a, b], i) => (
        <circle key={i} cx={x + a * n} cy={y + b * n} r={n * 1.05} fill={i % 2 ? bb.hueso : bb.terracotaClara} stroke={bb.tinta} strokeWidth={3} />
      ))}
      {[0, 60, 120].map((g, k) => {
        const t = frame * (0.16 + 0.03 * k) + k * 2.1;
        const ex = R * Math.cos(t);
        const ey = R * 0.32 * Math.sin(t);
        const r = (g * Math.PI) / 180;
        return (
          <g key={g}>
            <circle cx={x + ex * Math.cos(r) - ey * Math.sin(r)} cy={y + ex * Math.sin(r) + ey * Math.cos(r)} r={20} fill={bb.cian} opacity={0.3} />
            <circle cx={x + ex * Math.cos(r) - ey * Math.sin(r)} cy={y + ex * Math.sin(r) + ey * Math.cos(r)} r={10} fill={bb.cian} />
          </g>
        );
      })}
    </g>
  );
};

type AbiertoProps = {
  x: number;
  y: number;
  lado: number;
  /** 0–1: la grieta de luz baja por el frente. */
  grieta: number;
  /** 0–1: las dos mitades se separan. */
  abre: number;
  /** Fotograma, para los electrones. */
  frame: number;
};

const GRIETA = [[0, -1], [0.07, -0.62], [-0.06, -0.22], [0.05, 0.18], [-0.07, 0.6], [0, 1]];

/** El cubito-átomo que se raja de arriba abajo y se abre en dos: adentro están el núcleo y los electrones. */
export const AtomoAbierto: FC<AbiertoProps> = ({ x, y, lado: s, grieta, abre, frame }) => {
  const izq = useIdSvg();
  const der = useIdSvg();
  const d = abre * s * 1.25;
  const giro = abre * 9;
  const camino = GRIETA.map(([a, b], i) => `${i ? 'L' : 'M'} ${x + a * s} ${y + b * s}`).join(' ');
  return (
    <g>
      <defs>
        <clipPath id={izq}>
          <rect x={x - 2 * s} y={y - 2 * s} width={2 * s} height={4 * s} />
        </clipPath>
        <clipPath id={der}>
          <rect x={x} y={y - 2 * s} width={2 * s} height={4 * s} />
        </clipPath>
      </defs>
      <AtomoModerno x={x} y={y} radio={s * 1.25} frame={frame} aparece={Math.min(1, abre * 1.3)} />
      <g transform={`translate(${-d} 0) rotate(${-giro} ${x} ${y + s})`} clipPath={`url(#${izq})`}>
        <CuboIso x={x} y={y} lado={s} />
      </g>
      <g transform={`translate(${d} 0) rotate(${giro} ${x} ${y + s})`} clipPath={`url(#${der})`}>
        <CuboIso x={x} y={y} lado={s} />
      </g>
      {grieta > 0 && abre < 0.3 && (
        <g opacity={1 - abre / 0.3}>
          <path d={camino} stroke={bb.ambar} strokeWidth={22} fill="none" opacity={0.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - grieta} />
          <path d={camino} stroke="#FFFFFF" strokeWidth={6} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - grieta} />
        </g>
      )}
    </g>
  );
};

/** Cuadro que se divide en 2 × 2, 4 × 4, 8 × 8… (`nivel`, con decimales mientras se abre la nueva división). */
export const CuadroQueSeDivide: FC<{ x: number; y: number; lado: number; nivel: number; frame: number; color?: string; aparece?: number }> = ({
  x, y, lado: L, nivel, frame, color: c = bb.verde, aparece = 1,
}) => {
  if (aparece <= 0) return null;
  const k = Math.min(5, Math.floor(nivel));
  const abre = nivel >= 5 ? 1 : nivel - k;
  const n = 2 ** k;
  const celda = L / n;
  const hueco = Math.max(1.5, celda * 0.14);
  const celdas = [];
  for (let i = 0; i < n * n; i++) {
    const a = i % n;
    const b = Math.floor(i / n);
    const r = random(`cuadro-${k}-${i}-${Math.floor(frame / 4)}`);
    // La división siguiente asoma como una cruz fina dentro de cada celda.
    celdas.push(
      <rect key={i} x={x - L / 2 + a * celda + hueco / 2} y={y - L / 2 + b * celda + hueco / 2} width={celda - hueco} height={celda - hueco} fill={c} opacity={0.65 + 0.35 * r} />,
    );
    if (abre > 0 && k < 5) {
      const cx = x - L / 2 + (a + 0.5) * celda;
      const cy = y - L / 2 + (b + 0.5) * celda;
      celdas.push(<rect key={`h${i}`} x={cx - (celda / 2) * abre} y={cy - (hueco / 4) * abre} width={celda * abre} height={(hueco / 2) * abre} fill={bb.fondo} />);
      celdas.push(<rect key={`v${i}`} x={cx - (hueco / 4) * abre} y={cy - (celda / 2) * abre} width={(hueco / 2) * abre} height={celda * abre} fill={bb.fondo} />);
    }
  }
  return (
    <g opacity={Math.min(1, aparece * 1.5)} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * aparece}) translate(${-x} ${-y})`} shapeRendering="crispEdges">
      <rect x={x - L / 2 - 8} y={y - L / 2 - 8} width={L + 16} height={L + 16} fill="none" stroke={c} strokeWidth={4} opacity={0.6} />
      {celdas}
    </g>
  );
};
