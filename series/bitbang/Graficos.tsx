// Gráficos de la serie: la barra de probabilidad (0–100 %) que se llena hasta un valor y muestra un rango rayado
// encima (p. ej. «de 53 % a 99,6 %») y la lupa que agranda un punto (p. ej. un microbio en Marte). En SVG, dentro de un `Lienzo`.
import type { FC, ReactNode } from 'react';
import { useIdSvg } from '../../src/piezas';
import { bb, letra } from './tema';

export type MarcaBarra = { en: number; texto: string; color: string; aparece: number };

type BarraProps = {
  x: number;
  y: number;
  ancho: number;
  alto?: number;
  /** 0–1: hasta dónde va el relleno sólido. */
  lleno: number;
  /** Tramo rayado que sigue al sólido: de `lleno` hasta `hasta` (0–1). */
  hasta?: number;
  color?: string;
  colorRango?: string;
  marcas?: MarcaBarra[];
  opacidad?: number;
};

/** Barra de 0 a 100 %, con el relleno sólido, el tramo rayado del rango y marcas con su texto debajo. */
export const BarraProbabilidad: FC<BarraProps> = ({ x, y, ancho, alto = 92, lleno, hasta = 0, color: c = bb.cian, colorRango = bb.ambar, marcas = [], opacidad = 1 }) => {
  const rayas = useIdSvg();
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <defs>
        <pattern id={rayas} width={24} height={24} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={24} height={24} fill={colorRango} opacity={0.25} />
          <rect width={12} height={24} fill={colorRango} opacity={0.85} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={ancho} height={alto} fill="rgba(5,8,15,0.8)" />
      {hasta > lleno && <rect x={x + lleno * ancho} y={y} width={(hasta - lleno) * ancho} height={alto} fill={`url(#${rayas})`} />}
      <rect x={x} y={y} width={lleno * ancho} height={alto} fill={c} style={{ filter: `drop-shadow(0 0 14px ${c}66)` }} />
      <rect x={x} y={y} width={ancho} height={alto} fill="none" stroke={bb.hueso} strokeWidth={4} />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <rect key={t} x={x + t * ancho - 2} y={y + alto} width={4} height={t % 0.5 === 0 ? 18 : 10} fill={bb.hueso} opacity={0.6} />
      ))}
      <text x={x} y={y - 18} fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso} opacity={0.6}>
        0 %
      </text>
      <text x={x + ancho} y={y - 18} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso} opacity={0.6}>
        100 %
      </text>
      {marcas.map((m, k) =>
        m.aparece <= 0 ? null : (
          <g key={k} opacity={Math.min(1, m.aparece * 1.6)}>
            <rect x={x + m.en * ancho - 3} y={y - 10} width={6} height={alto + 34} fill={m.color} />
            <text
              x={x + m.en * ancho}
              y={y + alto + 74}
              textAnchor={m.en > 0.9 ? 'end' : 'middle'}
              fontFamily={letra.mono}
              fontWeight={700}
              fontSize={46}
              fill={m.color}
              transform={`translate(0 ${(1 - Math.min(1, m.aparece)) * 20})`}
            >
              {m.texto}
            </text>
          </g>
        ),
      )}
    </g>
  );
};

/**
 * Lupa: un anillo chico sobre un punto (x, y) y, unida por una línea, una burbuja grande en (cx, cy) con lo que
 * se ve de cerca (`children`, dibujado por quien la usa en esas coordenadas). `aparece` 0–1 la abre.
 */
export const Lupa: FC<{ x: number; y: number; cx: number; cy: number; r: number; aparece: number; color?: string; children?: ReactNode }> = ({
  x, y, cx, cy, r, aparece, color: c = bb.verde, children,
}) => {
  if (aparece <= 0) return null;
  const s = Math.min(1, aparece);
  const d = Math.hypot(cx - x, cy - y) || 1;
  // La línea va del anillo chico al borde de la burbuja.
  const fx = cx - ((cx - x) / d) * r * s;
  const fy = cy - ((cy - y) / d) * r * s;
  return (
    <g opacity={Math.min(1, aparece * 1.6)}>
      <circle cx={x} cy={y} r={22} fill="none" stroke={c} strokeWidth={4} />
      <line x1={x + ((cx - x) / d) * 22} y1={y + ((cy - y) / d) * 22} x2={x + (fx - x) * s} y2={y + (fy - y) * s} stroke={c} strokeWidth={4} strokeDasharray="10 8" />
      <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="rgba(5,8,15,0.9)" stroke={c} strokeWidth={5} />
        <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke={c} strokeWidth={2} opacity={0.35} />
        {children}
      </g>
    </g>
  );
};
