// Arma en el navegador los tiempos del borrador para verlo en el reproductor sin guardar.
// Reordenar, duplicar o borrar escenas solo reacomoda voces que ya existen; las escenas con texto
// nuevo se muestran con una duración estimada y sin audio hasta que se genere su voz.
// (Las cuentas son las mismas que hace scripts/voz.mjs, que es el que manda al guardar.)
import type { Palabra, TiempoEscena, Tiempos } from '../../src/tipos';
import type { Guion, Voz } from './api';

const FPS = 30;
const RESPIRO = 0.4;
const COLA_FINAL = 1.0;

const mismaVoz = (a: Voz, b: Voz) => JSON.stringify(a) === JSON.stringify(b);

export type VistaPrevia = { tiempos: Tiempos; pendientes: Set<string> };

export const armarVistaPrevia = (borrador: Guion, guardado: Guion, tiempos: Tiempos | undefined): VistaPrevia => {
  const generadas = tiempos?.escenas ?? [];
  const guardadaPorId = new Map(guardado.escenas.map((e) => [e.id, e]));
  const vozGuardada = (id: string) => {
    const e = guardadaPorId.get(id);
    return e ? (e.voz ?? guardado.voz) : null;
  };
  const pendientes = new Set<string>();
  let inicio = 0;

  const escenas = borrador.escenas.map((e, i): TiempoEscena => {
    const voz = e.voz ?? borrador.voz;
    // La voz ya generada de esta escena, o de otra con el mismo texto y la misma voz (al duplicar).
    const propia = generadas.find((t) => t.id === e.id);
    const candidata = [propia, ...generadas].find((t) => {
      if (!t || t.texto !== e.texto) return false;
      const original = vozGuardada(t.id);
      return original !== null && mismaVoz(original, voz);
    });

    let palabras: Palabra[];
    let finVoz: number;
    let audio = '';
    if (voz?.proveedor === 'ninguna') {
      // Sin voz: la escena dura su pausa (por defecto 3 s), igual que en scripts/voz.mjs.
      palabras = [];
      finVoz = 0;
    } else if (candidata) {
      palabras = candidata.palabras;
      finVoz = candidata.finVoz ?? candidata.palabras.at(-1)?.fin ?? 1;
      audio = candidata.audio;
    } else {
      pendientes.add(e.id);
      const sueltas = e.texto.split(/\s+/).filter(Boolean);
      finVoz = Math.max(1.5, sueltas.length * 0.38);
      palabras = sueltas.map((texto, k) => ({
        texto,
        inicio: +((k * finVoz) / sueltas.length).toFixed(3),
        fin: +(((k + 1) * finVoz) / sueltas.length).toFixed(3),
      }));
    }

    let duracion = finVoz + (e.pausa ?? (voz?.proveedor === 'ninguna' ? 3 : RESPIRO));
    if (i === borrador.escenas.length - 1) duracion += COLA_FINAL;
    duracion = Math.ceil(duracion * FPS) / FPS;
    const tiempo: TiempoEscena = {
      id: e.id,
      texto: e.texto,
      audio,
      inicio: +inicio.toFixed(4),
      duracion: +duracion.toFixed(4),
      transicion: e.transicion ?? 'fundido',
      palabras,
      finVoz,
      ...(e.dibujo ? { dibujo: e.dibujo } : {}),
      ...(e.plantilla ? { plantilla: e.plantilla } : {}),
    };
    inicio += duracion;
    return tiempo;
  });

  return { tiempos: { fps: FPS, duracion: +inicio.toFixed(4), escenas, musica: borrador.musica ?? null }, pendientes };
};
