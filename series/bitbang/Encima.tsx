// Lo que se ve fijo en todo el video: la insignia del capítulo, la barra de progreso y unas líneas
// de pantalla vieja muy suaves. Usa el reloj del video completo.
import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { bb, letra, SEGURA, SERIE } from './tema';

/** Un capítulo numerado o un video especial de la serie (fuera de los 24). */
export type CapituloSerie = number | 'especial';

/** Lo que dice la insignia después de «BITBANG · »: «CAP 3/24» o «ESPECIAL». */
export const etiquetaCapitulo = (capitulo: CapituloSerie) =>
  capitulo === 'especial' ? 'ESPECIAL' : `CAP ${capitulo}/${SERIE.capitulos}`;

/** «BITBANG · CAP 1/24_» (o «BITBANG · ESPECIAL_») arriba a la izquierda, con el cursor parpadeando. */
export const Insignia: FC<{ capitulo: CapituloSerie }> = ({ capitulo }) => {
  const frame = useCurrentFrame();
  const cursor = Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: SEGURA.izquierda,
        top: SEGURA.arriba + 18,
        padding: '8px 16px',
        border: `2px solid ${bb.verde}55`,
        background: 'rgba(5,8,15,0.55)',
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: 1,
        color: bb.verde,
        textShadow: `0 0 14px ${bb.verde}66`,
        whiteSpace: 'pre',
      }}
    >
      {`${SERIE.nombre} · ${etiquetaCapitulo(capitulo)}`}
      <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
    </div>
  );
};

/** Barra muy discreta que avanza con el video, justo encima de la zona de los botones de la app. */
export const BarraProgreso: FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const avance = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const ancho = SEGURA.derecha - SEGURA.izquierda - 80;
  return (
    <div style={{ position: 'absolute', left: SEGURA.izquierda, top: SEGURA.abajo - 10, width: ancho, height: 4, background: 'rgba(244,239,230,0.12)' }}>
      <div style={{ width: ancho * avance, height: 4, background: bb.ambar, opacity: 0.75 }} />
      <div style={{ position: 'absolute', left: ancho * avance - 4, top: -2, width: 8, height: 8, background: bb.ambar }} />
    </div>
  );
};

/** Líneas horizontales finas, como una pantalla antigua. Casi no se notan. */
export const Lineas: FC = () => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)',
      opacity: 0.45,
      pointerEvents: 'none',
    }}
  />
);

/** Capa fija de un capítulo. La barra de progreso solo la lleva el capítulo 1 (el usuario no la quiere en los demás). */
export const crearEncima = (capitulo: CapituloSerie, barra = false): FC => {
  const Encima: FC = () => (
    <AbsoluteFill>
      <Lineas />
      <Insignia capitulo={capitulo} />
      {barra && <BarraProgreso />}
    </AbsoluteFill>
  );
  return Encima;
};
