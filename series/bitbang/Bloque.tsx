// Lo que no cambia (cap 6, Parménides): el bloque verde macizo de cuadraditos, visto en perspectiva, con escarcha;
// y la flecha en vuelo que se queda quieta en el aire («el movimiento sería una ilusión»). En SVG.
import type { FC } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { bb } from './tema';

type BloqueProps = {
  /** Centro de la cara de adelante. */
  x: number;
  y: number;
  /** Lado de la cara de adelante (px). */
  lado: number;
  /** Cuadraditos por lado. */
  celdas?: number;
  /** 0–1: entra cayendo y se asienta. */
  aparece?: number;
  /** 0–1: cristales de escarcha en los bordes. */
  escarcha?: number;
  /** 0–1: brillo que late (para resaltarlo). */
  brillo?: number;
  color?: string;
  opacidad?: number;
};

const sombra = (c: string, k: number) => {
  const n = (i: number) => Math.round(parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) * k);
  return `rgb(${n(0)},${n(1)},${n(2)})`;
};

/** Bloque de cuadraditos: cara de adelante, tapa y costado derecho. */
export const BloqueCongelado: FC<BloqueProps> = ({ x, y, lado, celdas = 6, aparece = 1, escarcha = 0, brillo = 0, color: c = bb.verde, opacidad = 1 }) => {
  const halo = useIdSvg();
  if (aparece <= 0) return null;
  const u = lado / celdas;
  const fondo = lado * 0.32;
  const x0 = x - lado / 2;
  const y0 = y - lado / 2;
  const cae = (1 - Math.min(1, aparece)) * -160;
  const caras = [];
  for (let i = 0; i < celdas; i++) {
    for (let j = 0; j < celdas; j++) {
      const r = random(`bloque-${i}-${j}`);
      caras.push(<rect key={`f${i}-${j}`} x={x0 + i * u + 2} y={y0 + j * u + 2} width={u - 4} height={u - 4} fill={sombra(c, 0.78 + 0.22 * r)} />);
      // Tapa: paralelogramos hacia arriba a la derecha.
      if (j === 0) {
        for (let k = 0; k < 3; k++) {
          const px = x0 + i * u + (k * fondo) / 3;
          const py = y0 - (k * fondo) / 3;
          caras.push(
            <path key={`t${i}-${k}`} d={`M ${px + 2} ${py - 2} l ${u - 4} 0 l ${fondo / 3 - 2} ${-fondo / 3 + 2} l ${-u + 4} 0 Z`} fill={sombra(c, 0.95 + 0.05 * r)} />,
          );
        }
      }
      if (i === celdas - 1) {
        for (let k = 0; k < 3; k++) {
          const px = x0 + lado + (k * fondo) / 3;
          const py = y0 + j * u - (k * fondo) / 3;
          caras.push(
            <path key={`s${j}-${k}`} d={`M ${px + 2} ${py + 2} l ${fondo / 3 - 2} ${-fondo / 3 + 2} l 0 ${u - 4} l ${-fondo / 3 + 2} ${fondo / 3 - 2} Z`} fill={sombra(c, 0.5 + 0.1 * r)} />,
          );
        }
      }
    }
  }
  const cristales = [];
  if (escarcha > 0) {
    for (let k = 0; k < 46; k++) {
      const r = (s: string) => random(`escarcha-${k}-${s}`);
      if (r('n') > escarcha) continue;
      // En el borde de la cara de adelante.
      const lado4 = Math.floor(r('l') * 4);
      const t = r('t');
      const [px, py] = [
        [x0 + t * lado, y0],
        [x0 + lado, y0 + t * lado],
        [x0 + t * lado, y0 + lado],
        [x0, y0 + t * lado],
      ][lado4];
      const s = 6 + r('s') * 8;
      cristales.push(<rect key={k} x={px - s / 2 + (r('dx') - 0.5) * 14} y={py - s / 2 + (r('dy') - 0.5) * 14} width={s} height={s} fill={r('c') < 0.6 ? bb.hueso : '#D8FFE9'} opacity={0.9} />);
    }
  }
  return (
    <g shapeRendering="crispEdges" opacity={opacidad * Math.min(1, aparece * 2)} transform={`translate(0 ${cae})`}>
      <defs>
        <radialGradient id={halo}>
          <stop offset="0" stopColor={c} stopOpacity={0.3} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x + fondo / 2} cy={y - fondo / 2} rx={lado * 1.05} ry={lado * 1.05} fill={`url(#${halo})`} opacity={0.35 + 0.65 * brillo} />
      {caras}
      <rect x={x0} y={y0} width={lado} height={lado} fill="none" stroke={bb.hueso} strokeWidth={3} opacity={0.3 + 0.5 * brillo} />
      {cristales}
    </g>
  );
};

/** Flecha griega en vuelo hacia la derecha, con la punta en (x, y). `congela` 0–1 la vuelve verde y borra la estela. */
export const FlechaVuelo: FC<{ x: number; y: number; largo?: number; frame: number; congela?: number; escala?: number; opacidad?: number }> = ({
  x, y, largo = 360, frame, congela = 0, escala = 1, opacidad = 1,
}) => {
  const madera = congela > 0.5 ? '#2BD873' : bb.terracotaClara;
  const punta = congela > 0.5 ? bb.verde : bb.hueso;
  const pluma = congela > 0.5 ? '#8CFFC0' : bb.ambar;
  const estela = 1 - congela;
  return (
    <g shapeRendering="crispEdges" opacity={opacidad} transform={`translate(${x} ${y}) scale(${escala}) translate(${-x} ${-y})`}>
      {estela > 0.01 &&
        Array.from({ length: 6 }, (_, k) => {
          const r = random(`estela-${k}`);
          const largoLinea = 120 + r * 160;
          const desplaza = ((frame * 22 + r * 200) % 160) * estela;
          return <rect key={k} x={x - largo - largoLinea - desplaza} y={y - 52 + k * 20} width={largoLinea * estela} height={6} fill={bb.hueso} opacity={0.25 + 0.3 * r} />;
        })}
      <rect x={x - largo} y={y - 5} width={largo - 40} height={10} fill={madera} />
      <path d={`M ${x} ${y} L ${x - 56} ${y - 26} L ${x - 44} ${y} L ${x - 56} ${y + 26} Z`} fill={punta} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <path d={`M ${x - largo + 8 + k * 22} ${y - 5} l -26 -26 l 18 0 l 26 26 Z`} fill={pluma} />
          <path d={`M ${x - largo + 8 + k * 22} ${y + 5} l -26 26 l 18 0 l 26 -26 Z`} fill={pluma} />
        </g>
      ))}
      {congela > 0.3 &&
        Array.from({ length: 16 }, (_, k) => {
          const r = (s: string) => random(`flecha-hielo-${k}-${s}`);
          const s = 6 + r('s') * 8;
          return <rect key={`h${k}`} x={x - largo + r('x') * largo - s / 2} y={y - 14 + r('y') * 28 - s / 2} width={s} height={s} fill={bb.hueso} opacity={Math.min(1, (congela - 0.3) * 2) * 0.85} />;
        })}
    </g>
  );
};
