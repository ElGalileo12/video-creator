// La app en la computadora: el monitor con su cámara (`foco` de la app que cae en `en` del video, con `escala`), el
// velo de arriba para los subtítulos, el puntero del ratón y la onda de cada clic. Todo se dibuja en píxeles de la
// app (pantalla de 1440 × 1040), y `Pantalla` lo escala como una cámara. De `quien-me-debe` y `torneo-whatsapp`.
import type { FC, ReactNode } from 'react';
import { GRIS, GS, montserrat } from './tema';

export const PANTALLA = { ancho: 1440, alto: 1040 };
const BISEL = 22;
export type Punto = { x: number; y: number };
export type Camara = { foco: Punto; en: Punto; escala: number };

/** Dónde cae en el video un punto de la pantalla, con la misma cámara que `Pantalla`. */
export const enVideo = (p: Punto, cam: Camara): Punto => ({ x: cam.en.x + (p.x - cam.foco.x) * cam.escala, y: cam.en.y + (p.y - cam.foco.y) * cam.escala });

/**
 * Monitor con la app. Mover `foco`, `en` y `escala` es mover la cámara. `marco` apaga el borde negro.
 * `tam` cambia el tamaño de la pantalla (por defecto 1440 × 1040; el entrenador y el jugador usan 1280 × 1040).
 */
export const Pantalla: FC<Camara & { opacidad?: number; marco?: number; fondo?: string; tam?: { ancho: number; alto: number }; children: ReactNode }> = ({ foco, en, escala, opacidad = 1, marco = 1, fondo = '#F6F8FB', tam = PANTALLA, children }) => (
  <div style={{ position: 'absolute', left: en.x, top: en.y, opacity: opacidad, transformOrigin: '0 0', transform: `scale(${escala}) translate(${-(foco.x + BISEL)}px, ${-(foco.y + BISEL)}px)` }}>
    <div
      style={{
        width: tam.ancho + BISEL * 2,
        height: tam.alto + BISEL * 2,
        padding: BISEL,
        borderRadius: 34,
        boxSizing: 'border-box',
        background: `linear-gradient(160deg, rgba(42,50,66,${marco}) 0%, rgba(11,15,23,${marco}) 35%, rgba(11,15,23,${marco}) 70%, rgba(35,42,56,${marco}) 100%)`,
        boxShadow: `0 0 0 2px rgba(58,67,86,${marco}), 0 50px 120px rgba(0,0,0,${0.6 * marco})`,
      }}
    >
      <div style={{ position: 'relative', width: tam.ancho, height: tam.alto, borderRadius: 12, overflow: 'hidden', background: fondo, fontFamily: montserrat, color: GS.texto, lineHeight: 1.5 }}>{children}</div>
    </div>
  </div>
);

/** Velo oscuro en la parte de arriba del video: tapa la pantalla clara donde van los subtítulos. */
export const Velo: FC<{ opacidad: number }> = ({ opacidad }) =>
  opacidad > 0 ? (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, opacity: opacidad, background: 'linear-gradient(to bottom, #0C1322 0px, #0C1322 475px, rgba(12,19,34,0.8) 535px, rgba(12,19,34,0) 640px)' }} />
  ) : null;

/** Puntero del ratón (en píxeles de la app). */
export const Puntero: FC<{ en: Punto; opacidad?: number; apretar?: number; tamano?: number }> = ({ en, opacidad = 1, apretar = 0, tamano = 1 }) =>
  opacidad > 0 ? (
    <svg width={22} height={30} viewBox="0 0 22 30" style={{ position: 'absolute', left: en.x - 2, top: en.y - 1, opacity: opacidad, zIndex: 300, overflow: 'visible', transform: `scale(${tamano * (1 - apretar * 0.12)})`, transformOrigin: '2px 1px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}>
      <path d="M2 1 L2 24 L8 18.5 L12 28 L16 26.3 L12.2 17 L20 17 Z" fill="#0F172A" stroke="white" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  ) : null;

/** Onda de un clic. `t` va de 0 a 1. */
export const Clic: FC<{ en: Punto; t: number; color?: string }> = ({ en, t, color = 'rgba(147,51,234,0.55)' }) =>
  t > 0 && t < 1 ? (
    <div style={{ position: 'absolute', left: en.x - 18, top: en.y - 18, width: 36, height: 36, borderRadius: '50%', border: `3px solid ${color}`, transform: `scale(${0.4 + t * 1.6})`, opacity: 1 - t, zIndex: 299, boxSizing: 'border-box' }} />
  ) : null;


/** Escala de un botón apretado (`a` de 0 a 1). */
export const apretado = (a: number) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);

/** Cursor de texto que parpadea (`f` es el fotograma). */
export const Cursor: FC<{ f: number; color?: string; alto?: number }> = ({ f, color = GRIS.g900, alto = 18 }) => (
  <span style={{ display: 'inline-block', width: 1.5, height: alto, marginLeft: 1, background: color, opacity: Math.floor(f / 15) % 2 ? 0 : 1, verticalAlign: 'middle' }} />
);
