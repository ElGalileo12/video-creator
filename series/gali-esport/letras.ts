// Las letras actuales de la app (app/fonts.ts), con los mismos archivos: public/gali-esport/fuentes/.
//   Instrument Sans   → texto (la letra por defecto de la app)
//   Schibsted Grotesk → títulos h1–h3
//   JetBrains Mono    → cifras, horas y etiquetas
// Las pantallas viejas del kit siguen con Montserrat (tema.ts); las nuevas (registro.tsx) usan estas.
import { continueRender, delayRender, staticFile } from 'remotion';

const cargar = (familia: string, archivo: string, pesos: string) => {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return familia;
  const espera = delayRender(`Cargando la letra ${familia}`);
  // `staticFile` se resuelve un instante después: el Estudio fija dónde sirve public/ (remotion_staticBase)
  // recién después de importar los módulos.
  setTimeout(() => {
    const cara = new FontFace(familia, `url('${staticFile(`gali-esport/fuentes/${archivo}`)}') format('woff2')`, { weight: pesos, display: 'block' });
    cara
      .load()
      .then(() => {
        document.fonts.add(cara);
        continueRender(espera);
      })
      .catch((error) => {
        console.error(error);
        continueRender(espera);
      });
  }, 0);
  return familia;
};

/** Texto de la app (`font-sans`). */
export const instrument = `"${cargar('GE Instrument Sans', 'instrument-sans-latin.woff2', '400 700')}", system-ui, sans-serif`;
/** Títulos de la app (h1, h2, h3 y `font-display`). */
export const schibsted = `"${cargar('GE Schibsted Grotesk', 'schibsted-grotesk-latin.woff2', '600 800')}", system-ui, sans-serif`;
/** Etiquetas y cifras (`font-mono`). */
export const jetbrains = `"${cargar('GE JetBrains Mono', 'jetbrains-mono-latin.woff2', '500 800')}", ui-monospace, monospace`;
