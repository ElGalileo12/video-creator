import { createContext, useContext } from 'react';
import { Easing, interpolate, spring, useVideoConfig, type SpringConfig } from 'remotion';
import type { TiempoEscena } from './tipos';

export const EscenaContexto = createContext<TiempoEscena | null>(null);

export const useEscena = () => {
  const escena = useContext(EscenaContexto);
  if (!escena) throw new Error('useEscena solo funciona dentro de una escena');
  return escena;
};

const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** Fotograma de la escena en el que la voz empieza a decir `palabra` (su aparición número `vez`). */
export const useMomento = (palabra: string, vez = 1) => {
  const escena = useEscena();
  const { fps } = useVideoConfig();
  let encontradas = 0;
  for (const p of escena.palabras) {
    if (normalizar(p.texto) === normalizar(palabra) && ++encontradas === vez) {
      return Math.round(p.inicio * fps);
    }
  }
  throw new Error(`La palabra "${palabra}" (vez ${vez}) no está en la escena "${escena.id}"`);
};

/** Duración de la escena actual en fotogramas. */
export const useDuracion = () => {
  const escena = useEscena();
  const { fps } = useVideoConfig();
  return Math.round(escena.duracion * fps);
};

/** Va de 0 a 1 con un pequeño rebote, empezando en el fotograma `desde`. */
export const resorte = (frame: number, desde: number, fps: number, config: Partial<SpringConfig> = {}) =>
  frame < desde
    ? 0
    : spring({ frame: frame - desde, fps, config: { damping: 14, stiffness: 140, mass: 0.7, ...config } });

/** Va de 0 a 1 de forma suave entre `desde` y `desde + dur`. */
export const tramo = (frame: number, desde: number, dur: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [desde, desde + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Sube de 0 a 1 y vuelve a 0: un golpe corto para resaltar algo. */
export const golpe = (frame: number, desde: number, dur = 14) =>
  interpolate(frame, [desde, desde + dur * 0.35, desde + dur], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;
