// Barcos griegos al estilo de las vasijas: la galera de lado (casco negro con el ojo en la proa, vela cuadrada
// a rayas y remos) y la misma vista desde arriba, chiquita, para los mapas.
import type { FC } from 'react';
import { bb } from './tema';

const TINTA = bb.tinta;

type Colocar = { x: number; y: number; escala?: number; espejo?: boolean; rot?: number; opacidad?: number };

/**
 * Galera de lado, mirando a la derecha, con la línea de flotación en (x, y). Unos 330 px de largo con escala 1.
 * `remos` es la fase de los remos (radianes); `tripulacion` 0–1 asoma las cabezas de los marineros.
 */
export const BarcoLado: FC<Colocar & { remos?: number; tripulacion?: number; vela?: number }> = ({
  x, y, escala = 1, espejo, rot = 0, opacidad = 1, remos = 0, tripulacion = 0, vela = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${espejo ? -escala : escala} ${escala})`} opacity={opacidad}>
    {/* Remos (detrás del casco, se hunden en el agua) */}
    {Array.from({ length: 8 }, (_, k) => {
      const x0 = -92 + k * 26;
      const vaiven = Math.sin(remos + k * 0.25) * 16;
      return <line key={k} x1={x0} y1={-24} x2={x0 - 26 + vaiven} y2={46} stroke={TINTA} strokeWidth={5} strokeLinecap="round" />;
    })}
    {/* Mástil, verga y vela cuadrada a rayas */}
    <rect x={-5} y={-236} width={10} height={204} fill="#5A3220" />
    <line x1={-96} y1={-226} x2={96} y2={-226} stroke="#5A3220" strokeWidth={8} strokeLinecap="round" />
    {vela > 0 && (
      <g transform={`translate(0 -226) scale(1 ${vela}) translate(0 226)`}>
        <path d="M -90 -222 L 90 -222 Q 104 -146 84 -76 L -84 -76 Q -72 -146 -90 -222 Z" fill={bb.hueso} />
        {[-48, 0, 48].map((sx) => (
          <path key={sx} d={`M ${sx} -222 Q ${sx + 10} -148 ${sx * 0.94} -76`} stroke={bb.terracota} strokeWidth={22} fill="none" />
        ))}
        <path d="M -90 -222 L 90 -222 Q 104 -146 84 -76 L -84 -76 Q -72 -146 -90 -222 Z" fill="none" stroke={TINTA} strokeWidth={4} opacity={0.6} />
      </g>
    )}
    {/* Cabezas de los marineros asomando por la borda */}
    {tripulacion > 0 &&
      [-70, -36, -2, 34, 68].map((cx, k) => (
        <circle key={k} cx={cx} cy={-42 - 14 * Math.min(1, tripulacion * 1.5 - k * 0.1)} r={11} fill={bb.terracota} />
      ))}
    {/* Casco: popa curvada hacia arriba, espolón en la proa */}
    <path d="M -146 -70 Q -132 -36 -112 -40 L 122 -40 L 152 -30 L 172 -6 L 134 -2 Q 0 20 -112 6 Q -140 -6 -146 -70 Z" fill={TINTA} />
    <path d="M -146 -70 Q -168 -106 -132 -110" stroke={TINTA} strokeWidth={9} fill="none" strokeLinecap="round" />
    <line x1={-112} y1={-30} x2={128} y2={-30} stroke={bb.terracota} strokeWidth={6} />
    <line x1={-100} y1={-14} x2={120} y2={-14} stroke={bb.ambar} strokeWidth={3} opacity={0.7} />
    {/* El ojo de la proa */}
    <ellipse cx={130} cy={-22} rx={9} ry={6} fill={bb.hueso} />
    <circle cx={132} cy={-22} r={3.5} fill={TINTA} />
  </g>
);

/**
 * Barco visto desde arriba, centrado en (x, y), apuntando hacia `angulo` (grados, 0 = derecha).
 * Unos 56 px de largo con escala 1. `estela` 0–1 dibuja los cuadraditos de espuma detrás.
 */
export const BarcoArriba: FC<{ x: number; y: number; angulo: number; escala?: number; estela?: number; opacidad?: number }> = ({
  x, y, angulo, escala = 1, estela = 1, opacidad = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo}) scale(${escala})`} opacity={opacidad}>
    <g shapeRendering="crispEdges" fill={bb.hueso}>
      {estela > 0 &&
        [0, 1, 2, 3].map((k) => (
          <rect key={k} x={-36 - k * 13} y={-3 - (k % 2) * 6 + 3} width={8 - k} height={8 - k} opacity={(0.6 - k * 0.13) * estela} />
        ))}
    </g>
    <path d="M 30 0 Q 12 -11 -24 -9 L -26 9 Q 12 11 30 0 Z" fill={bb.terracota} stroke={TINTA} strokeWidth={3} />
    <rect x={-3} y={-17} width={7} height={34} rx={2} fill={bb.hueso} />
    <circle cx={22} cy={-3} r={2.5} fill={bb.hueso} />
  </g>
);
