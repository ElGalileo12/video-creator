// Kit de la serie BitBang · La física en disputa (24 capítulos).
// Un capítulo nuevo solo necesita: `estilo: estiloBitBang(n)` y `acento: bb.ambar` en su index.ts,
// la tarjeta de título como primera escena (`TarjetaTitulo`, voz «Capítulo n: <título>.», sin subtítulos),
// sus propias escenas y el cierre común (`CierreSerie`, voz «Sígueme para más historias de la física.»),
// que solo pide seguir la cuenta (sin anunciar el próximo capítulo). Su hito va en `HITOS` (LineaDeTiempo.tsx).
// Un video especial (fuera de los 24) usa `estiloBitBang('especial')`: insignia «BITBANG · ESPECIAL», sin hito.
import type { EstiloVideo } from '../../src/tipos';
import { type CapituloSerie, crearEncima } from './Encima';
import { FondoBitBang } from './Fondo';
import { letra } from './tema';

/** La barra de progreso de abajo solo la lleva el capítulo 1: el usuario no la quiere en los demás. */
export const estiloBitBang = (capitulo: CapituloSerie, tarjeta = 'titulo'): EstiloVideo => ({
  fuente: letra.texto,
  Fondo: FondoBitBang,
  Encima: crearEncima(capitulo, capitulo === 1),
  subtitulos: { abajo: true, fuente: letra.texto, resaltado: 'contorno', apagar: true, ocultarEn: [tarjeta] },
});

export { etiquetaCapitulo, type CapituloSerie } from './Encima';
export { bb, letra, SEGURA, SERIE } from './tema';
