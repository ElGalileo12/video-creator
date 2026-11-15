// Firma de una escena: cambia si cambia su texto o su voz.
// La usan scripts/voz.mjs (para no regenerar lo que no cambió) y el Estudio (para avisar qué falta).
import { createHash } from 'node:crypto';

export const vozDeEscena = (guion, escena) => ({ ...guion.voz, ...escena.voz });

export const firmaEscena = (guion, escena) =>
  createHash('sha1')
    .update(JSON.stringify({ voz: vozDeEscena(guion, escena), texto: escena.texto }))
    .digest('hex')
    .slice(0, 12);
