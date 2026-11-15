// Cielo nocturno de píxeles: tres capas de estrellas que titilan y se deslizan a distinta velocidad
// (lejos despacio, cerca más rápido), para dar profundidad. Usa el reloj del video completo.
import { useMemo, type FC } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { ALTO, ANCHO } from '../../src/estilo';
import { bb } from './tema';

const CAPAS = [
  { cantidad: 150, tamano: [3, 4], velocidad: 0.05, brillo: 0.45 },
  { cantidad: 60, tamano: [5, 6], velocidad: 0.14, brillo: 0.7 },
  { cantidad: 16, tamano: [8, 8], velocidad: 0.3, brillo: 0.95 },
];
const COLORES = [bb.hueso, bb.hueso, bb.hueso, bb.ambar, '#9FB0D0'];

type Estrella = { x: number; y: number; t: number; color: string; fase: number; ritmo: number; brillo: number; v: number };

const useEstrellas = (ancho: number, alto: number) =>
  useMemo(
    () =>
      CAPAS.flatMap((capa, c) =>
        Array.from({ length: capa.cantidad }, (_, i): Estrella => {
          const r = (k: string) => random(`bb-estrella-${c}-${i}-${k}`);
          return {
            x: r('x') * (ancho + 40),
            y: r('y') * alto * 0.92,
            t: capa.tamano[0] + Math.round(r('t') * (capa.tamano[1] - capa.tamano[0])),
            color: COLORES[Math.floor(r('c') * COLORES.length)],
            fase: r('f') * Math.PI * 2,
            ritmo: 0.04 + r('r') * 0.08,
            brillo: capa.brillo * (0.6 + r('b') * 0.4),
            v: capa.velocidad,
          };
        }),
      ),
    [ancho, alto],
  );

type EstrellasProps = {
  frame?: number;
  opacidad?: number;
  /** Tamaño del cielo (por defecto, el del video vertical). */
  ancho?: number;
  alto?: number;
  /** Cuánto se han corrido, en «fotogramas» (por defecto, el fotograma): para acelerarlas en un viaje. */
  viaje?: number;
  /** Largo de la estela de cada estrella, en fotogramas de recorrido (0 = puntos quietos). */
  estela?: number;
};

/** Las estrellas, sin el fondo. `frame` permite congelarlas (portada) o moverlas con otro reloj. */
export const Estrellas: FC<EstrellasProps> = ({ frame: fijo, opacidad = 1, ancho = ANCHO, alto = ALTO, viaje, estela = 0 }) => {
  const actual = useCurrentFrame();
  const frame = fijo ?? actual;
  const corrido = viaje ?? frame;
  const estrellas = useEstrellas(ancho, alto);
  return (
    <svg width={ancho} height={alto} style={{ position: 'absolute', inset: 0, opacity: opacidad }} shapeRendering="crispEdges">
      {estrellas.map((e, i) => {
        // Titileo en tres escalones, como un píxel que cambia de brillo.
        const onda = Math.sin(frame * e.ritmo + e.fase);
        const paso = onda > 0.55 ? 1 : onda > -0.3 ? 0.65 : 0.3;
        const x = ((((e.x - corrido * e.v) % (ancho + 40)) + ancho + 40) % (ancho + 40)) - 20;
        const destello = e.t >= 8 && paso === 1 && estela === 0;
        const cola = estela * e.v;
        return (
          <g key={i} opacity={e.brillo * paso}>
            {cola > 1 && <rect x={Math.round(x)} y={Math.round(e.y) + e.t / 4} width={cola} height={e.t / 2} fill={e.color} opacity={0.55} />}
            <rect x={Math.round(x)} y={Math.round(e.y)} width={e.t} height={e.t} fill={e.color} />
            {destello && (
              <>
                <rect x={Math.round(x) - e.t} y={Math.round(e.y) + e.t / 4} width={e.t * 3} height={e.t / 2} fill={e.color} opacity={0.5} />
                <rect x={Math.round(x) + e.t / 4} y={Math.round(e.y) - e.t} width={e.t / 2} height={e.t * 3} fill={e.color} opacity={0.5} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Fondo de toda la serie: azul noche con un brillo tenue abajo y el cielo de píxeles. */
export const FondoBitBang: FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 55% at 50% 78%, ${bb.nocheClara} 0%, ${bb.fondo} 70%)` }}>
    <Estrellas />
  </AbsoluteFill>
);
