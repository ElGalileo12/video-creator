// Paisaje de la serie: el mar de noche con olas, la luna de píxeles y una roca de la orilla.
import type { FC } from 'react';
import { useMarco } from '../../src/horizontal';
import { bb } from './tema';

const CAPAS_MAR = ['#0F2238', '#132B47', '#183556', '#1D3F66'];

/** Mar con olas suaves que se mueven. `y` es la línea del horizonte. */
export const Mar: FC<{ y: number; frame: number; opacidad?: number }> = ({ y, frame, opacidad = 1 }) => {
  // De borde a borde de lo que se ve (en el video horizontal, más ancho que el lienzo).
  const { izq, der } = useMarco();
  return (
    <g opacity={opacidad}>
      {CAPAS_MAR.map((c, i) => {
        const base = y + i * 52;
        const amp = 7 + i * 4;
        const largo = 170 + i * 50;
        const fase = frame * (0.05 + i * 0.025) + i;
        let d = `M ${izq - 20} ${base}`;
        for (let x = izq - 20; x <= der + 20; x += 20) d += ` L ${x} ${base + Math.sin(x / largo * Math.PI * 2 + fase) * amp}`;
        const borde = d;
        d += ` L ${der + 20} 1920 L ${izq - 20} 1920 Z`;
        return (
          <g key={i}>
            <path d={d} fill={c} />
            <path d={borde} stroke={bb.hueso} strokeOpacity={0.12 + i * 0.03} strokeWidth={3} fill="none" />
          </g>
        );
      })}
      {/* Reflejo de la luna, en rayitas de píxel */}
      <g fill={bb.ambar} shapeRendering="crispEdges">
        {Array.from({ length: 9 }, (_, i) => {
          const w = 70 - i * 6 + Math.sin(frame * 0.2 + i) * 10;
          return <rect key={i} x={830 - w / 2 + Math.sin(frame * 0.1 + i * 1.3) * 8} y={y + 20 + i * 24} width={w} height={6} opacity={0.5 - i * 0.04} />;
        })}
      </g>
    </g>
  );
};

/** Luna de píxeles. */
export const Luna: FC<{ x: number; y: number; r?: number; opacidad?: number }> = ({ x, y, r = 40, opacidad = 1 }) => (
  <g opacity={opacidad} shapeRendering="crispEdges">
    <defs>
      <radialGradient id="bb-luna-brillo">
        <stop offset="0" stopColor={bb.hueso} stopOpacity={0.16} />
        <stop offset="1" stopColor={bb.hueso} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r * 2.6} fill="url(#bb-luna-brillo)" />
    {Array.from({ length: Math.ceil((r * 2) / 8) }, (_, fila) =>
      Array.from({ length: Math.ceil((r * 2) / 8) }, (_, col) => {
        const px = x - r + col * 8;
        const py = y - r + fila * 8;
        if (Math.hypot(px + 4 - x, py + 4 - y) > r) return null;
        const sombra = Math.hypot(px + 4 - (x + r * 0.45), py + 4 - (y - r * 0.2)) < r * 0.85;
        return <rect key={`${fila}-${col}`} x={px} y={py} width={8} height={8} fill={sombra ? '#3A3A48' : '#EADFC8'} opacity={sombra ? 0.0 : 1} />;
      }),
    )}
  </g>
);

/** Roca de la orilla, con la cima en (x, y). */
export const Roca: FC<{ x: number; y: number }> = ({ x, y }) => (
  <path d={`M ${x - 110} ${y + 90} L ${x - 90} ${y + 20} L ${x - 40} ${y} L ${x + 50} ${y + 4} L ${x + 96} ${y + 40} L ${x + 120} ${y + 90} Z`} fill="#141A2C" />
);
