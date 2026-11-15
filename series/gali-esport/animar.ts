// Ayudas de animación de los videos de la app: recorridos de cámara y de puntero por tramos, texto que se escribe
// letra por letra y los tiempos de un clic. De `torneo-whatsapp`.
import { Easing } from 'remotion';
import { golpe, mezclar, tramo } from '../../src/escena';
import type { Camara, Punto } from './computador';

/** Recorrido por tramos: arranca en `inicial` y en cada paso va suave hacia el valor siguiente. */
export const recorrido = <T>(f: number, inicial: T, pasos: [desde: number, dur: number, valor: T][], mezcla: (t: number, a: T, b: T) => T): T =>
  pasos.reduce((actual, [desde, dur, valor]) => mezcla(tramo(f, desde, dur), actual, valor), inicial);
export const mezclarPunto = (t: number, a: Punto, b: Punto): Punto => ({ x: mezclar(t, a.x, b.x), y: mezclar(t, a.y, b.y) });
export const mezclarCamara = (t: number, a: Camara, b: Camara): Camara => ({ foco: mezclarPunto(t, a.foco, b.foco), en: mezclarPunto(t, a.en, b.en), escala: mezclar(t, a.escala, b.escala) });
/** La cámara del monitor, que pasa por cada `[desde, duración, cámara]`. */
export const camaras = (f: number, inicial: Camara, pasos: [number, number, Camara][]) => recorrido(f, inicial, pasos, mezclarCamara);
/** El puntero, que pasa por cada `[desde, duración, punto]`. */
export const ruta = (f: number, inicial: Punto, pasos: [number, number, Punto][]) => recorrido(f, inicial, pasos, mezclarPunto);

/** Texto que se va escribiendo letra por letra desde el fotograma `desde`. */
export const escribir = (texto: string, f: number, desde: number, porLetra = 1.2) =>
  f < desde ? '' : Array.from(texto).slice(0, Math.max(0, Math.min(texto.length, Math.floor((f - desde) / porLetra) + 1))).join('');

/** La onda de un clic en el fotograma `en` (0 → 1). */
export const clic = (f: number, en: number) => tramo(f, en, 14, Easing.linear);
/** El botón se hunde un instante en el fotograma `en`. */
export const apretar = (f: number, en: number) => golpe(f, en - 1, 8);
/** El puntero se ve del mismo tamaño en el video aunque la cámara se acerque. */
export const tamanoPuntero = (cam: Camara) => Math.max(0.8, 1.5 / cam.escala);
