// El fondo de las historias de Gali Esport: el cielo de la tarde y la cancha de fútbol en perspectiva.
// `calido` (0 → 1) pasa de la noche a la luz naranja del atardecer.
import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { mezclar } from '../../src/escena';
import { Lienzo } from '../../src/piezas';

const HORIZONTE = 760;
const ALTURA = 1000;
const ZOOM_X = 1480;
const LEJOS = 4;
const CERCA = 0.75;
const proyectar = (X: number, z: number): [number, number] => [540 + (X * ZOOM_X) / z, HORIZONTE + ALTURA / z];
const camino = (puntos: [number, number][], cerrar = false) => puntos.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + (cerrar ? ' Z' : '');
const FRANJAS = Array.from({ length: 10 }, (_, i) => {
  const z1 = LEJOS - ((LEJOS - CERCA) * i) / 10;
  const z2 = LEJOS - ((LEJOS - CERCA) * (i + 1)) / 10;
  return camino([proyectar(-1, z1), proyectar(1, z1), proyectar(1, z2), proyectar(-1, z2)], true);
});
const MITAD = 2.1;
const CIRCULO = camino(Array.from({ length: 49 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  return proyectar(Math.cos(a) * 0.22, MITAD + Math.sin(a) * 0.32);
}));
const BORDE = camino([proyectar(-0.94, LEJOS - 0.08), proyectar(0.94, LEJOS - 0.08), proyectar(0.94, CERCA), proyectar(-0.94, CERCA)]);
const LINEA_MEDIA = camino([proyectar(-0.94, MITAD), proyectar(0.94, MITAD)]);
const AREA = camino([proyectar(-0.42, LEJOS - 0.08), proyectar(-0.42, LEJOS - 0.6), proyectar(0.42, LEJOS - 0.6), proyectar(0.42, LEJOS - 0.08)]);
const [ARCO_X1, ARCO_Y] = proyectar(-0.12, LEJOS - 0.08);
const [ARCO_X2] = proyectar(0.12, LEJOS - 0.08);

export const Cielo: FC<{ calido: number }> = ({ calido }) => (
  <AbsoluteFill style={{ opacity: calido, background: `radial-gradient(ellipse 90% 40% at 50% ${(HORIZONTE / 1920) * 100}%, rgba(255,170,90,0.55) 0%, rgba(214,104,74,0.28) 45%, rgba(12,19,34,0) 100%)` }} />
);

export const Cancha: FC<{ calido?: number; opacidad?: number }> = ({ calido = 0, opacidad = 1 }) => {
  const claro = `rgb(${mezclar(calido, 46, 86)}, ${mezclar(calido, 139, 150)}, ${mezclar(calido, 82, 70)})`;
  const oscuro = `rgb(${mezclar(calido, 38, 74)}, ${mezclar(calido, 122, 134)}, ${mezclar(calido, 72, 62)})`;
  return (
    <Lienzo style={{ opacity: opacidad }}>
      <defs>
        <linearGradient id="nieblaCanchaGali" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C1322" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#0C1322" stopOpacity={0} />
        </linearGradient>
      </defs>
      {FRANJAS.map((d, i) => (
        <path key={i} d={d} fill={i % 2 ? claro : oscuro} />
      ))}
      <g fill="none" stroke="white" strokeOpacity={0.8} strokeLinejoin="round">
        <path d={BORDE} strokeWidth={6} />
        <path d={LINEA_MEDIA} strokeWidth={5} />
        <path d={CIRCULO} strokeWidth={5} />
        <path d={AREA} strokeWidth={4} />
      </g>
      <path d={`M ${ARCO_X1} ${ARCO_Y} V ${ARCO_Y - 46} H ${ARCO_X2} V ${ARCO_Y}`} fill="none" stroke="white" strokeWidth={6} strokeLinejoin="round" />
      <rect x={0} y={proyectar(0, LEJOS)[1]} width={1080} height={1920} fill="url(#nieblaCanchaGali)" />
    </Lienzo>
  );
};
