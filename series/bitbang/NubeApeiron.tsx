// El ápeiron: una nube de cuadritos ámbar y terracota que cambia de forma todo el tiempo sin llegar a
// ser nada definido. Todo sale del fotograma y de random() con semilla.
import type { FC } from 'react';
import { random } from 'remotion';
import { useMarco } from '../../src/horizontal';
import { Lienzo } from '../../src/piezas';
import { bb } from './tema';

type Props = {
  x: number;
  y: number;
  /** Radio aproximado (px). La orilla nunca queda fija. */
  radio: number;
  /** Reloj de la nube (fotogramas). */
  t: number;
  /** Lado de cada cuadrito. */
  celda?: number;
  opacidad?: number;
};

const COLORES = [bb.terracotaOscura, bb.terracota, bb.terracotaClara, bb.ambar, '#F2C46D', bb.hueso];

export const NubeApeiron: FC<Props> = ({ x, y, radio, t, celda = 22, opacidad = 1 }) => {
  // Hasta los bordes de lo que se ve (en el video horizontal, más allá del lienzo).
  const marco = useMarco();
  if (radio <= 2) return null;
  const alcance = radio * 1.35;
  const x0 = Math.max(marco.izq - celda, Math.floor((x - alcance) / celda) * celda);
  const x1 = Math.min(marco.der + celda, x + alcance);
  const y0 = Math.max(marco.arriba - celda, Math.floor((y - alcance) / celda) * celda);
  const y1 = Math.min(marco.abajo + celda, y + alcance);
  const paso = Math.floor(t / 3);
  const celdas = [];
  for (let cy = y0; cy < y1; cy += celda) {
    for (let cx = x0; cx < x1; cx += celda) {
      const dx = cx + celda / 2 - x;
      const dy = cy + celda / 2 - y;
      const d = Math.hypot(dx, dy) / radio;
      if (d > 1.35) continue;
      // Ondas que se cruzan y se mueven en direcciones distintas: la forma nunca se repite.
      const onda =
        0.5 * Math.sin(dx * 0.012 + t * 0.06) +
        0.4 * Math.sin(dy * 0.014 - t * 0.05 + 1.3) +
        0.35 * Math.sin((dx + dy) * 0.009 + t * 0.08 + 2.1) +
        0.3 * Math.sin((dx - dy) * 0.019 - t * 0.07 + 4.2) +
        0.25 * Math.sin(Math.atan2(dy, dx) * 3 + t * 0.045);
      const clave = `${cx}-${cy}`;
      const chispa = random(`apeiron-${clave}-${paso}`) - 0.5;
      const v = 1 - d + 0.32 * onda + 0.12 * chispa;
      if (v < 0.12) continue;
      const tono = Math.min(COLORES.length - 1, Math.max(0, Math.floor((v + 0.25 * Math.sin(t * 0.04 + d * 4)) * 4.2)));
      celdas.push(<rect key={clave} x={cx} y={cy} width={celda - 3} height={celda - 3} fill={COLORES[tono]} opacity={Math.min(1, (v - 0.12) * 3)} />);
    }
  }
  return (
    <Lienzo style={{ opacity: opacidad }}>
      <g shapeRendering="crispEdges">{celdas}</g>
    </Lienzo>
  );
};
