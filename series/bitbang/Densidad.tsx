// La densidad, en 2D (cap 5): la barra «MÁS APRETADO →» con un casillero por estado de la materia
// (de fuego a piedra) y la caja donde cabe cada vez más materia. Para usar dentro de un SVG.
import type { FC } from 'react';
import { random } from 'remotion';
import { bb, letra } from './tema';

export type EstadoDensidad = { nombre: string; colores: string[] };

/** Los estados de Anaxímenes, de más suelto a más apretado (mismos colores que el 3D de `Aire3D`). */
export const ESTADOS_DENSIDAD: EstadoDensidad[] = [
  { nombre: 'FUEGO', colores: ['#FFE3A0', bb.ambar, bb.terracotaClara, bb.terracota] },
  { nombre: 'AIRE', colores: ['#E6EBF0', '#CFD8E0', bb.hueso] },
  { nombre: 'VIENTO', colores: ['#D8DFE6', '#B8C3CE', '#E9EDF1'] },
  { nombre: 'NUBE', colores: [bb.hueso, '#DCE1E6', '#C2CAD2', '#9AA3AD'] },
  { nombre: 'AGUA', colores: ['#2F6FA3', '#3478B0', '#285F8F', '#5B93C4'] },
  { nombre: 'TIERRA', colores: ['#8A5A2B', '#6E4422', '#A06A35', '#5C3A1E'] },
  { nombre: 'PIEDRA', colores: ['#7D8590', '#6A717B', '#8C939C', '#5E656E'] },
];

/** Cuántos cuadraditos de 5 × 5 se encienden en el casillero de cada estado: cada vez más juntos. */
const LLENOS = [3, 5, 8, 12, 16, 20, 25];

type BarraProps = {
  /** Centro vertical de los nombres. */
  y: number;
  x?: number;
  ancho?: number;
  /** Estado actual: 0 = fuego … 6 = piedra (con decimales mientras pasa de uno a otro). */
  nivel: number;
  aparece: number;
  opacidad?: number;
};

/** Barra de estados con su nombre, un cuadro de puntos cada vez más lleno y el cursor ámbar en el estado actual. */
export const BarraDensidad: FC<BarraProps> = ({ y, x = 70, ancho = 940, nivel, aparece, opacidad = 1 }) => {
  if (aparece <= 0) return null;
  const n = ESTADOS_DENSIDAD.length;
  const paso = ancho / n;
  const actual = Math.round(nivel);
  const cursor = x + (nivel + 0.5) * paso;
  const linea = y + 96;
  return (
    <g opacity={opacidad * Math.min(1, aparece * 1.5)} transform={`translate(0 ${(1 - aparece) * 30})`}>
      {ESTADOS_DENSIDAD.map((e, i) => {
        const cx = x + (i + 0.5) * paso;
        const activo = i === actual;
        const brillo = Math.max(0, 1 - Math.abs(nivel - i));
        return (
          <g key={e.nombre}>
            <text x={cx} y={y + 11} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={activo ? 31 : 27} fill={activo ? bb.ambar : bb.hueso} opacity={activo ? 1 : 0.55}>
              {e.nombre}
            </text>
            <g shapeRendering="crispEdges" opacity={0.45 + 0.55 * brillo}>
              {Array.from({ length: 25 }, (_, k) => {
                const orden = random(`densidad-${i}-${k}`);
                const lleno = k < LLENOS[i];
                const col = k % 5;
                const fila = Math.floor(k / 5);
                return (
                  <rect
                    key={k}
                    x={cx - 30 + col * 12}
                    y={y + 30 + fila * 12}
                    width={10}
                    height={10}
                    fill={lleno ? e.colores[Math.floor(orden * e.colores.length)] : 'none'}
                    stroke={lleno ? 'none' : bb.hueso}
                    strokeOpacity={0.12}
                  />
                );
              })}
            </g>
          </g>
        );
      })}
      <rect x={x} y={linea + 22} width={ancho} height={4} fill={bb.hueso} opacity={0.35} />
      <path d={`M ${x + ancho} ${linea + 24} L ${x + ancho - 18} ${linea + 12} L ${x + ancho - 18} ${linea + 36} Z`} fill={bb.ambar} />
      <text x={x} y={linea + 66} fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso} opacity={0.6}>
        ← MÁS SUELTO
      </text>
      <text x={x + ancho} y={linea + 66} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={32} fill={bb.ambar}>
        MÁS APRETADO →
      </text>
      <rect x={cursor - 14} y={linea + 10} width={28} height={28} fill={bb.ambar} />
      <rect x={cursor - 3} y={y - 34} width={6} height={10} fill={bb.ambar} opacity={0.9} />
    </g>
  );
};

/** Caja de lado `lado` centrada en (x, y) donde caben hasta 8 × 8 cuadraditos; `llenos` 0–64 dice cuántos hay. */
export const CajaMateria: FC<{ x: number; y: number; lado: number; llenos: number; aparece: number; color?: string; semilla?: string }> = ({
  x, y, lado, llenos, aparece, color: c = bb.ambar, semilla = 'caja',
}) => {
  if (aparece <= 0) return null;
  const celda = lado / 8;
  // Orden al azar en que se ocupan los lugares: la caja se llena de a poco, sin patrón.
  const lugares = Array.from({ length: 64 }, (_, i) => i).sort((a, b) => random(`${semilla}-${a}`) - random(`${semilla}-${b}`));
  return (
    <g opacity={Math.min(1, aparece * 1.5)} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * aparece}) translate(${-x} ${-y})`}>
      <rect x={x - lado / 2 - 14} y={y - lado / 2 - 14} width={lado + 28} height={lado + 28} fill="rgba(5,8,15,0.6)" stroke={bb.hueso} strokeWidth={5} />
      <g shapeRendering="crispEdges">
        {lugares.slice(0, Math.floor(llenos)).map((p) => (
          <rect
            key={p}
            x={x - lado / 2 + (p % 8) * celda + 3}
            y={y - lado / 2 + Math.floor(p / 8) * celda + 3}
            width={celda - 6}
            height={celda - 6}
            fill={c}
            opacity={0.75 + 0.25 * random(`${semilla}-op-${p}`)}
          />
        ))}
      </g>
    </g>
  );
};
