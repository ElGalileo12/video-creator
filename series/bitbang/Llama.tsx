// La llama de cubitos (cap 6, el fuego de Heráclito) y el pebetero de tres patas donde arde.
// La llama nunca está quieta: el borde ondula y cada cuadradito titila con random() por fotograma. En SVG.
import type { FC } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { bb } from './tema';

const CALOR = ['#C4572A', '#E07A45', '#F5A623', '#FFC65C', '#FFF1C9'];

type LlamaProps = {
  /** Centro de la base de la llama. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  frame: number;
  lado?: number;
  /** 0–1: crece desde la base. */
  aparece?: number;
  /** 0–1: ondula y titila más fuerte («nunca está quieto»). */
  agita?: number;
  /** Chispas que suben. */
  chispas?: boolean;
  opacidad?: number;
  semilla?: string;
};

export const LlamaPixeles: FC<LlamaProps> = ({ x, y, ancho, alto, frame, lado = 16, aparece = 1, agita = 0, chispas = true, opacidad = 1, semilla = 'llama' }) => {
  const halo = useIdSvg();
  if (aparece <= 0) return null;
  const altoReal = alto * aparece;
  const filas = Math.ceil(altoReal / lado);
  const columnas = Math.ceil(ancho / lado) + 4;
  const paso = Math.floor(frame / 2);
  const fuerza = 1 + 1.6 * agita;
  const celdas = [];
  for (let r = 0; r < filas; r++) {
    const v = (r + 0.5) / Math.max(1, filas);
    // Media anchura de la llama a esa altura: ancha abajo, en punta arriba, con la base redondeada.
    const media = (ancho / 2) * Math.pow(1 - v, 0.75) * (0.55 + 0.45 * Math.min(1, v * 3.5));
    // El cuerpo se mece, más arriba que abajo.
    const centro = x + v * ancho * 0.1 * fuerza * (Math.sin(frame * 0.21 + v * 4) + 0.5 * Math.sin(frame * 0.53 + v * 9));
    for (let c = -columnas / 2; c < columnas / 2; c++) {
      const cx = x + c * lado;
      const r0 = random(`${semilla}-${r}-${c}-${paso}`);
      const dx = Math.abs(cx + lado / 2 - centro);
      if (dx > media + (r0 - 0.5) * lado * 1.6 * fuerza) continue;
      const calor = 1 - (dx / Math.max(1, media)) * 0.55 - v * 0.75 + (r0 - 0.5) * 0.25;
      const i = Math.max(0, Math.min(CALOR.length - 1, Math.floor(calor * CALOR.length)));
      celdas.push(<rect key={`${r}-${c}`} x={cx} y={y - (r + 1) * lado} width={lado - 1} height={lado - 1} fill={CALOR[i]} />);
    }
  }
  const sueltas = [];
  if (chispas) {
    for (let k = 0; k < 10 + Math.round(10 * agita); k++) {
      const r = (s: string) => random(`${semilla}-chispa-${k}-${s}`);
      const vida = 26 + r('v') * 20;
      const edad = (frame + r('e') * vida) % vida;
      const sx = x + (r('x') - 0.5) * ancho * 0.6 + Math.sin(edad * 0.3 + k) * 10 * fuerza;
      const sy = y - altoReal * (0.55 + 0.6 * (edad / vida)) * (0.8 + 0.4 * r('h'));
      sueltas.push(<rect key={k} x={Math.round(sx / 4) * 4} y={Math.round(sy / 4) * 4} width={lado * 0.5} height={lado * 0.5} fill={r('c') < 0.5 ? CALOR[3] : CALOR[2]} opacity={(1 - edad / vida) * aparece} />);
    }
  }
  return (
    <g shapeRendering="crispEdges" opacity={opacidad}>
      <defs>
        <radialGradient id={halo}>
          <stop offset="0" stopColor={bb.ambar} stopOpacity={0.32} />
          <stop offset="0.5" stopColor={bb.ambar} stopOpacity={0.1} />
          <stop offset="1" stopColor={bb.ambar} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y - altoReal * 0.4} rx={ancho * 1.3} ry={altoReal * 0.85} fill={`url(#${halo})`} opacity={0.85 + 0.15 * Math.sin(frame * 0.4)} />
      {celdas}
      {sueltas}
    </g>
  );
};

/**
 * Pebetero griego: un cuenco ancho y bajo sobre una columna con base escalonada. `x, y` = boca del cuenco;
 * `alto` = de la boca al suelo.
 */
export const Pebetero: FC<{ x: number; y: number; ancho?: number; alto?: number }> = ({ x, y, ancho = 170, alto = 230 }) => {
  const a = ancho / 2;
  const fondo = y + a * 0.42;
  const suelo = y + alto;
  const columna = Math.max(12, a * 0.2);
  return (
    <g>
      <rect x={x - a * 0.75} y={suelo - 14} width={a * 1.5} height={14} fill={bb.tinta} />
      <rect x={x - a * 0.52} y={suelo - 26} width={a * 1.04} height={13} fill={bb.terracotaOscura} />
      <rect x={x - columna / 2} y={fondo} width={columna} height={suelo - 26 - fondo} fill={bb.terracotaOscura} />
      <g stroke={bb.tinta} strokeWidth={2.5} opacity={0.6}>
        <line x1={x - columna * 0.18} y1={fondo + 8} x2={x - columna * 0.18} y2={suelo - 30} />
        <line x1={x + columna * 0.18} y1={fondo + 8} x2={x + columna * 0.18} y2={suelo - 30} />
      </g>
      <rect x={x - columna * 0.9} y={(fondo + suelo) / 2 - 6} width={columna * 1.8} height={10} fill={bb.ambar} opacity={0.85} />
      <rect x={x - columna * 1.1} y={fondo - 4} width={columna * 2.2} height={12} fill={bb.tinta} />
      <path d={`M ${x - a} ${y} Q ${x - a * 0.85} ${fondo} ${x} ${fondo} Q ${x + a * 0.85} ${fondo} ${x + a} ${y} Z`} fill={bb.terracotaOscura} />
      <path d={`M ${x - a * 0.9} ${y + a * 0.14} Q ${x} ${y + a * 0.3} ${x + a * 0.9} ${y + a * 0.14}`} stroke={bb.ambar} strokeWidth={5} fill="none" opacity={0.85} />
      <rect x={x - a - 10} y={y - 9} width={ancho + 20} height={13} rx={4} fill={bb.tinta} />
    </g>
  );
};
