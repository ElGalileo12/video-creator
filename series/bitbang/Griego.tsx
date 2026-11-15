// Adornos de época griega: greca (meandro), globo de diálogo con marco de vasija, sello, medallones,
// iconos de dioses y un templo lejano.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { mezclar, tramo } from '../../src/escena';
import { RafagaPixeles } from './Pixeles';
import { bb, letra } from './tema';

/** Camino de una greca horizontal desde (x, y) de `ancho` px; `alto` es la altura del dibujo. */
export const caminoGreca = (x: number, y: number, ancho: number, alto: number) => {
  const u = alto / 4;
  const periodos = Math.floor(ancho / (4 * u));
  let d = `M ${x} ${y + alto}`;
  for (let i = 0; i < periodos; i++) {
    const x0 = x + i * 4 * u;
    d += ` L ${x0} ${y} L ${x0 + 3 * u} ${y} L ${x0 + 3 * u} ${y + 2 * u} L ${x0 + u} ${y + 2 * u} L ${x0 + u} ${y + alto} L ${x0 + 4 * u} ${y + alto}`;
  }
  return d;
};

/** Franja de greca entre dos líneas, para usar dentro de un SVG. `progreso` la dibuja de izquierda a derecha. */
export const Greca: FC<{ x: number; y: number; ancho: number; alto?: number; color?: string; grosor?: number; progreso?: number }> = ({
  x, y, ancho, alto = 28, color: c = bb.terracota, grosor = 4, progreso = 1,
}) => {
  if (progreso <= 0) return null;
  return (
    <g stroke={c} strokeWidth={grosor} fill="none" strokeLinejoin="miter">
      <path d={caminoGreca(x, y, ancho, alto)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progreso} />
      <line x1={x} y1={y - alto * 0.35} x2={x + ancho * progreso} y2={y - alto * 0.35} />
      <line x1={x} y1={y + alto * 1.35} x2={x + ancho * progreso} y2={y + alto * 1.35} />
    </g>
  );
};

type GloboProps = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Punta del globo (hacia quien habla), en coordenadas del video. */
  punta: { x: number; y: number };
  escala?: number;
  children: ReactNode;
  style?: CSSProperties;
};

/** Globo de diálogo con marco terracota y greca arriba y abajo, como el borde de una vasija. */
export const GloboVasija: FC<GloboProps> = ({ x, y, ancho, alto, punta, escala = 1, children, style }) => {
  const base = Math.max(x + 60, Math.min(x + ancho - 60, punta.x));
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${punta.x}px ${punta.y}px`, transform: `scale(${escala})`, opacity: Math.min(1, escala * 1.5), ...style }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M ${base - 40} ${y + alto - 4} L ${punta.x} ${punta.y} L ${base + 30} ${y + alto - 4} Z`} fill={bb.terracota} />
        <path d={`M ${base - 24} ${y + alto - 10} L ${punta.x} ${punta.y - 18} L ${base + 16} ${y + alto - 10} Z`} fill="#17121A" />
        <rect x={x} y={y} width={ancho} height={alto} rx={22} fill="#17121A" stroke={bb.terracota} strokeWidth={8} />
        <Greca x={x + 34} y={y + 22} ancho={ancho - 68} alto={18} grosor={3} />
        <Greca x={x + 34} y={y + alto - 44} ancho={ancho - 68} alto={18} grosor={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: x + 40,
          top: y + 66,
          width: ancho - 80,
          height: alto - 132,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Sello de tinta torcido, con el borde doble y huecos de desgaste. */
export const Sello: FC<{ x: number; y: number; texto: string; escala?: number; rot?: number; color?: string; tamano?: number }> = ({
  x, y, texto, escala = 1, rot = -12, color: c = bb.terracota, tamano = 112,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${escala})`,
      opacity: Math.min(1, escala > 1.3 ? 2.6 - escala : 1),
      padding: '10px 34px 6px',
      border: `10px solid ${c}`,
      outline: `4px solid ${c}`,
      outlineOffset: 8,
      color: c,
      fontFamily: letra.titulo,
      fontWeight: 900,
      fontSize: tamano,
      letterSpacing: 4,
      whiteSpace: 'nowrap',
      background: 'rgba(11,15,26,0.55)',
      maskImage: 'radial-gradient(circle at 30% 40%, black 60%, rgba(0,0,0,0.75) 100%)',
    }}
  >
    {texto}
  </div>
);

/** Medallón redondo con borde terracota, para encerrar un icono. */
export const Medallon: FC<{ x: number; y: number; r: number; children?: ReactNode; brillo?: string }> = ({ x, y, r, children, brillo = bb.ambar }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#17121A" />
    <circle cx={x} cy={y} r={r * 0.95} fill="none" stroke={brillo} strokeWidth={2} opacity={0.35} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={bb.terracota} strokeWidth={10} />
    {children}
  </g>
);

/** Rayo de Zeus centrado en (x, y), de alto `t`. */
export const Rayo: FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color: c = bb.ambar }) => {
  const u = t / 10;
  return (
    <path
      d={`M ${x + u * 1.2} ${y - u * 5} L ${x - u * 2.6} ${y + u * 0.6} L ${x - u * 0.2} ${y + u * 0.6} L ${x - u * 1.4} ${y + u * 5} L ${x + u * 2.8} ${y - u * 1.2} L ${x + u * 0.4} ${y - u * 1.2} L ${x + u * 2.2} ${y - u * 5} Z`}
      fill={c}
    />
  );
};

/** Tridente de Poseidón centrado en (x, y), de alto `t`. */
export const Tridente: FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color: c = bb.ambar }) => {
  const u = t / 10;
  return (
    <g fill={c}>
      <rect x={x - u * 0.35} y={y - u * 2.2} width={u * 0.7} height={u * 7.2} rx={u * 0.2} />
      <path d={`M ${x - u * 2.6} ${y - u * 4.6} L ${x - u * 2.1} ${y - u * 4.6} L ${x - u * 2.0} ${y - u * 2.4} Q ${x} ${y - u * 1.2} ${x + u * 2.0} ${y - u * 2.4} L ${x + u * 2.1} ${y - u * 4.6} L ${x + u * 2.6} ${y - u * 4.6} L ${x + u * 2.6} ${y - u * 1.9} Q ${x} ${y - u * 0.2} ${x - u * 2.6} ${y - u * 1.9} Z`} />
      <path d={`M ${x - u * 0.45} ${y - u * 2.2} L ${x - u * 0.45} ${y - u * 4.4} L ${x} ${y - u * 5.2} L ${x + u * 0.45} ${y - u * 4.4} L ${x + u * 0.45} ${y - u * 2.2} Z`} />
      <path d={`M ${x - u * 2.95} ${y - u * 4.4} L ${x - u * 2.35} ${y - u * 5.4} L ${x - u * 1.75} ${y - u * 4.4} Z`} />
      <path d={`M ${x + u * 1.75} ${y - u * 4.4} L ${x + u * 2.35} ${y - u * 5.4} L ${x + u * 2.95} ${y - u * 4.4} Z`} />
    </g>
  );
};

/** El sol (Helios) con la rueda de su carro: disco con rayos sobre una rueda de radios. */
export const CarroSol: FC<{ x: number; y: number; t: number; giro?: number; color?: string }> = ({ x, y, t, giro = 0, color: c = bb.ambar }) => {
  const u = t / 10;
  return (
    <g>
      <g transform={`rotate(${giro} ${x} ${y - u * 1.2})`}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line key={i} x1={x + Math.cos(a) * u * 2.6} y1={y - u * 1.2 + Math.sin(a) * u * 2.6} x2={x + Math.cos(a) * u * 3.9} y2={y - u * 1.2 + Math.sin(a) * u * 3.9} stroke={c} strokeWidth={u * 0.55} strokeLinecap="round" />
          );
        })}
      </g>
      <circle cx={x} cy={y - u * 1.2} r={u * 2.1} fill={c} />
      <g transform={`rotate(${giro * 2} ${x} ${y + u * 3})`} stroke={bb.terracotaClara} strokeWidth={u * 0.4} fill="none">
        <circle cx={x} cy={y + u * 3} r={u * 1.7} />
        {[0, 45, 90, 135].map((g) => (
          <line key={g} x1={x - Math.cos((g * Math.PI) / 180) * u * 1.7} y1={y + u * 3 - Math.sin((g * Math.PI) / 180) * u * 1.7} x2={x + Math.cos((g * Math.PI) / 180) * u * 1.7} y2={y + u * 3 + Math.sin((g * Math.PI) / 180) * u * 1.7} />
        ))}
      </g>
    </g>
  );
};

/** Templo dórico lejano (silueta), con la base en (x, y) y `ancho` px. */
export const Templo: FC<{ x: number; y: number; ancho: number; color?: string }> = ({ x, y, ancho, color: c = '#151C30' }) => {
  const columnas = 6;
  const alto = ancho * 0.42;
  const paso = ancho / columnas;
  return (
    <g fill={c}>
      <rect x={x - 12} y={y - 14} width={ancho + 24} height={14} />
      <rect x={x - 4} y={y - 24} width={ancho + 8} height={10} />
      {Array.from({ length: columnas }, (_, i) => (
        <rect key={i} x={x + i * paso + paso * 0.22} y={y - 24 - alto} width={paso * 0.56} height={alto} />
      ))}
      <rect x={x - 6} y={y - 24 - alto - 26} width={ancho + 12} height={26} />
      <path d={`M ${x - 14} ${y - 24 - alto - 26} L ${x + ancho / 2} ${y - 24 - alto - 26 - ancho * 0.16} L ${x + ancho + 14} ${y - 24 - alto - 26} Z`} />
    </g>
  );
};

/** Sello que cae de golpe en `desde` (escala 2,4 → 1), con su ráfaga de tinta. */
export const SelloCae: FC<{ x: number; y: number; texto: string; desde: number; rot?: number; tamano?: number; color?: string }> = ({
  x, y, texto, desde, rot = -6, tamano = 72, color: c = bb.terracota,
}) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const escala = mezclar(tramo(f, desde, 6, Easing.in(Easing.quad)), 2.4, 1);
  return (
    <>
      <Sello x={x} y={y} texto={texto} escala={escala} rot={rot} tamano={tamano} color={c} />
      <RafagaPixeles x={x} y={y} desde={desde + 6} cantidad={26} apertura={360} velocidad={[6, 15]} gravedad={0.3} vida={22} colores={[c, bb.hueso]} semilla={`sello-${texto}`} />
    </>
  );
};
