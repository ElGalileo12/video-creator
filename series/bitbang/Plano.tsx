// Envoltorio de cada escena de BitBang: «respiración» de cámara (zoom lento 1.00 → 1.05),
// temblores de pantalla y la transición de glitch de píxeles al entrar y al salir.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { useDuracion, useEscena } from '../../src/escena';
import { useMarco } from '../../src/horizontal';
import { Lienzo } from '../../src/piezas';
import { bb } from './tema';

const LADO = 60;
const ENTRADA = 8;
const SALIDA = 5;

/** Cuadraditos que tapan la escena y se disuelven al entrar, y vuelven a aparecer en los últimos fotogramas. */
const Cuadraditos: FC<{ entrada: boolean; salida: boolean }> = ({ entrada, salida }) => {
  const frame = useCurrentFrame();
  const duracion = useDuracion();
  const { id } = useEscena();
  // Cubren todo lo que se ve (en un video horizontal, también los lados).
  const marco = useMarco();
  const x0 = Math.floor(marco.izq / LADO) * LADO;
  const y0 = Math.floor(marco.arriba / LADO) * LADO;
  const columnas = Math.ceil((marco.der - x0) / LADO);
  const filas = Math.ceil((marco.abajo - y0) / LADO);
  const entrando = entrada && frame < ENTRADA;
  const saliendo = salida && frame >= duracion - SALIDA;
  if (!entrando && !saliendo) return null;
  const celdas = [];
  for (let i = 0; i < columnas * filas; i++) {
    const r = random(`bb-glitch-${id}-${i}`);
    const visible = entrando ? r < 0.9 && frame < 1 + r * (ENTRADA - 1) : r < 0.55 && frame >= duracion - 1 - r * SALIDA;
    if (!visible) continue;
    const c = random(`bb-glitch-color-${id}-${i}`);
    const [fill, opacidad] =
      c < 0.035 ? [bb.ambar, 0.85] : c < 0.065 ? [bb.verde, 0.7] : c < 0.09 ? [bb.terracota, 0.8] : [bb.fondo, 1];
    celdas.push(
      <rect key={i} x={x0 + (i % columnas) * LADO} y={y0 + Math.floor(i / columnas) * LADO} width={LADO} height={LADO} fill={fill} opacity={opacidad} />,
    );
  }
  return (
    <Lienzo>
      <g shapeRendering="crispEdges">{celdas}</g>
    </Lienzo>
  );
};

export type Temblor = { desde: number; fuerza?: number; dur?: number };

/** Desplazamiento de un temblor de pantalla que se apaga solo. */
export const temblar = (frame: number, temblores: Temblor[]) => {
  let x = 0;
  let y = 0;
  for (const { desde, fuerza = 14, dur = 12 } of temblores) {
    const t = frame - desde;
    if (t < 0 || t > dur) continue;
    const a = fuerza * (1 - t / dur);
    x += Math.sin(t * 2.7) * a;
    y += Math.cos(t * 3.3) * a * 0.7;
  }
  return { x, y };
};

type PlanoProps = {
  children: ReactNode;
  /** Glitch de píxeles al empezar (desactivar cuando la escena continúa el dibujo de la anterior). */
  entrada?: boolean;
  /** Glitch de píxeles en los últimos fotogramas. */
  salida?: boolean;
  temblores?: Temblor[];
  /** Punto hacia el que se acerca la cámara. */
  origen?: { x: number; y: number };
  /** Cuánto se acerca a lo largo de la escena (0.05 = 5 %). */
  zoom?: number;
};

export const Plano: FC<PlanoProps> = ({ children, entrada = true, salida = true, temblores = [], origen = { x: 540, y: 860 }, zoom = 0.05 }) => {
  const frame = useCurrentFrame();
  const duracion = useDuracion();
  const respiro = 1 + zoom * Math.min(1, frame / Math.max(1, duracion));
  const { x, y } = temblar(frame, temblores);
  // Separación de color en los primeros y últimos fotogramas: el «golpe» del glitch.
  const golpe = (entrada && frame < 4) || (salida && frame >= duracion - 2);
  const corrimiento = golpe ? (random(`bb-corre-${frame}`) - 0.5) * 24 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${x + corrimiento}px, ${y}px) scale(${respiro})`,
          transformOrigin: `${origen.x}px ${origen.y}px`,
          filter: golpe ? `drop-shadow(7px 0 0 ${bb.terracota}99) drop-shadow(-7px 0 0 ${bb.verde}77)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      <Cuadraditos entrada={entrada} salida={salida} />
    </AbsoluteFill>
  );
};
