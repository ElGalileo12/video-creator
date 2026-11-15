// Efectos de píxeles de la serie: ráfagas de cuadraditos (polvo, chispas, explosiones) y
// figuras que se desintegran en cuadraditos. Todo determinista (random con semilla).
import type { FC, ReactNode } from 'react';
import { random, useCurrentFrame } from 'remotion';
import { ALTO, ANCHO } from '../../src/estilo';
import { useIdSvg } from '../../src/piezas';
import { bb } from './tema';

type RafagaProps = {
  x: number;
  y: number;
  /** Fotograma de la escena en que sale. */
  desde: number;
  cantidad?: number;
  colores?: string[];
  /** Dirección media en grados (−90 = hacia arriba) y apertura del abanico. */
  angulo?: number;
  apertura?: number;
  velocidad?: [number, number];
  gravedad?: number;
  vida?: number;
  tamano?: [number, number];
  semilla?: string;
};

/** Cuadraditos que salen disparados desde un punto y caen con gravedad. */
export const RafagaPixeles: FC<RafagaProps> = ({
  x, y, desde, cantidad = 36, colores = [bb.ambar, bb.verde, bb.hueso], angulo = -90, apertura = 360,
  velocidad = [6, 20], gravedad = 0.6, vida = 32, tamano = [6, 16], semilla = 'rafaga',
}) => {
  const frame = useCurrentFrame();
  const t = frame - desde;
  if (t < 0 || t > vida) return null;
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} shapeRendering="crispEdges">
      {Array.from({ length: cantidad }, (_, i) => {
        const r = (k: string) => random(`${semilla}-${i}-${k}`);
        const a = ((angulo + (r('a') - 0.5) * apertura) * Math.PI) / 180;
        const v = velocidad[0] + r('v') * (velocidad[1] - velocidad[0]);
        const vidaPropia = vida * (0.6 + r('d') * 0.4);
        if (t > vidaPropia) return null;
        const lado = Math.round((tamano[0] + r('t') * (tamano[1] - tamano[0])) * (1 - (t / vidaPropia) * 0.5));
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.5 * gravedad * t * t;
        return (
          <rect
            key={i}
            x={Math.round(px / 4) * 4 - lado / 2}
            y={Math.round(py / 4) * 4 - lado / 2}
            width={lado}
            height={lado}
            fill={colores[Math.floor(r('c') * colores.length)]}
            opacity={Math.min(1, 1.6 * (1 - t / vidaPropia))}
          />
        );
      })}
    </svg>
  );
};

type DesintegrarProps = {
  /** Centro y radio del círculo que se desintegra (coordenadas del video). */
  x: number;
  y: number;
  radio: number;
  desde: number;
  dur?: number;
  celda?: number;
  colores?: string[];
  semilla?: string;
  /** Hacia dónde vuelan los cuadraditos: 1 = a la derecha (y se deshace de izquierda a derecha), −1 = a la izquierda. */
  hacia?: 1 | -1;
  /** Dibujo SVG (en coordenadas del video) que se deshace en cuadraditos. */
  children: ReactNode;
};

/** Un dibujo que se deshace celda por celda: cada cuadradito sale volando hacia arriba y se apaga. */
export const Desintegrar: FC<DesintegrarProps> = ({
  x, y, radio, desde, dur = 26, celda = 18, colores = [bb.ambar, bb.terracota, bb.hueso], semilla = 'desintegrar', hacia = 1, children,
}) => {
  const frame = useCurrentFrame();
  const mascara = useIdSvg();
  const n = Math.ceil((radio * 2) / celda) + 2;
  const quitadas: ReactNode[] = [];
  const particulas: ReactNode[] = [];
  if (frame >= desde) {
    for (let i = 0; i < n * n; i++) {
      const cx = x - radio - celda + (i % n) * celda;
      const cy = y - radio - celda + Math.floor(i / n) * celda;
      if (Math.hypot(cx + celda / 2 - x, cy + celda / 2 - y) > radio + celda * 0.75) continue;
      const r = (k: string) => random(`${semilla}-${i}-${k}`);
      // Se deshace de un lado al otro, con algo de azar.
      const lado0 = (cx - (x - radio)) / (radio * 2);
      const orden = 0.55 * (hacia > 0 ? lado0 : 1 - lado0) + 0.45 * r('o');
      const sale = desde + orden * dur;
      const edad = frame - sale;
      if (edad < 0) continue;
      quitadas.push(<rect key={i} x={cx - 0.75} y={cy - 0.75} width={celda + 1.5} height={celda + 1.5} fill="black" />);
      if (edad < 24) {
        const px = cx + hacia * (2 + r('vx') * 7) * edad;
        const py = cy - (3 + r('vy') * 6) * edad;
        const lado = celda * (1 - edad / 30);
        particulas.push(
          <rect key={i} x={px} y={py} width={lado} height={lado} fill={colores[Math.floor(r('c') * colores.length)]} opacity={1 - edad / 24} />,
        );
      }
    }
  }
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse" x={0} y={0} width={ANCHO} height={ALTO}>
          <rect x={0} y={0} width={ANCHO} height={ALTO} fill="white" />
          {quitadas}
        </mask>
      </defs>
      {frame <= desde + dur + 1 && <g mask={`url(#${mascara})`}>{children}</g>}
      <g shapeRendering="crispEdges">{particulas}</g>
    </svg>
  );
};

/** X de error de píxeles (9 × 9 cuadros) centrada en (x, y). `escala` > 1 la agranda (para que caiga de golpe). */
const CRUZ_PIXELES = ['XX.....XX', 'XXX...XXX', '.XXX.XXX.', '..XXXXX..', '...XXX...', '..XXXXX..', '.XXX.XXX.', 'XXX...XXX', 'XX.....XX'];
export const CruzPixeles: FC<{ x: number; y: number; lado: number; escala?: number; color?: string; opacidad?: number }> = ({
  x, y, lado, escala = 1, color: c = bb.terracota, opacidad = 1,
}) => (
  <g shapeRendering="crispEdges" fill={c} opacity={opacidad} transform={`translate(${x} ${y}) scale(${escala}) translate(${-x} ${-y})`}>
    {CRUZ_PIXELES.flatMap((fila, r) =>
      fila.split('').map((k, col) =>
        k === 'X' ? <rect key={`${r}-${col}`} x={x - 4.5 * lado + col * lado} y={y - 4.5 * lado + r * lado} width={lado - 2} height={lado - 2} /> : null,
      ),
    )}
  </g>
);

/** Signo de pregunta de píxeles (9 × 11 cuadros) centrado en (x, y). `aparece` 0–1 lo va armando de arriba abajo. */
const PREGUNTA_PIXELES = ['.XXXXXXX.', 'XX.....XX', 'XX.....XX', '.......XX', '......XX.', '....XXX..', '...XX....', '...XX....', '.........', '...XX....', '...XX....'];
export const SignoPregunta: FC<{ x: number; y: number; lado: number; aparece?: number; color?: string; opacidad?: number }> = ({
  x, y, lado, aparece = 1, color: c = bb.ambar, opacidad = 1,
}) => (
  <g shapeRendering="crispEdges" fill={c} opacity={opacidad}>
    {PREGUNTA_PIXELES.flatMap((fila, r) =>
      fila.split('').map((k, col) =>
        k === 'X' && (r * 9 + col) / 99 <= aparece * 1.1 ? (
          <rect key={`${r}-${col}`} x={x - 4.5 * lado + col * lado} y={y - 5.5 * lado + r * lado} width={lado - 2} height={lado - 2} />
        ) : null,
      ),
    )}
  </g>
);
