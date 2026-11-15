// Genera el video terminado, la portada y el texto del post.
// Uso:
//   pnpm render <proyecto>                     → listos/<proyecto>/video.mp4, portada.jpg, post.txt
//   pnpm render <proyecto> --revisar=40,120    → solo esos fotogramas, en .revision/<proyecto>/

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [proyecto, ...opciones] = process.argv.slice(2).filter((a) => a !== '--');
if (!proyecto) {
  console.error('Uso: pnpm render <proyecto> [--revisar=fotograma,fotograma,...]');
  process.exit(1);
}
const revisar = opciones.find((o) => o.startsWith('--revisar='))?.slice('--revisar='.length);

const raiz = new URL('..', import.meta.url).pathname;
const inputProps = { proyecto };
// Aceleración gráfica del Mac para las escenas 3D (WebGL).
const chromiumOptions = { gl: 'angle' };

console.log('Preparando el proyecto…');
const serveUrl = await bundle({ entryPoint: join(raiz, 'src/index.ts') });
const video = await selectComposition({ serveUrl, id: proyecto, inputProps, chromiumOptions });

if (revisar) {
  const carpeta = join(raiz, '.revision', proyecto);
  rmSync(carpeta, { recursive: true, force: true });
  mkdirSync(carpeta, { recursive: true });
  for (const frame of revisar.split(',').map(Number)) {
    const output = join(carpeta, `f${String(frame).padStart(4, '0')}.jpg`);
    await renderStill({ composition: video, serveUrl, inputProps, frame, output, imageFormat: 'jpeg', scale: 0.5, chromiumOptions });
    console.log(output);
  }
  process.exit(0);
}

const salida = join(raiz, 'listos', proyecto);
mkdirSync(salida, { recursive: true });

// "salida": [ancho, alto] en el guion entrega el video a otro tamaño (p. ej. 1280×720), con la misma imagen escalada.
const guionVideo = JSON.parse(readFileSync(join(raiz, 'proyectos', proyecto, 'guion.json'), 'utf8'));
const escala = guionVideo.salida ? guionVideo.salida[0] / video.width : 1;

let ultimo = -1;
await renderMedia({
  composition: video,
  serveUrl,
  inputProps,
  codec: 'h264',
  scale: escala,
  chromiumOptions,
  outputLocation: join(salida, 'video.mp4'),
  onProgress: ({ progress }) => {
    const paso = Math.floor(progress * 10);
    if (paso > ultimo) {
      ultimo = paso;
      console.log(`Video: ${paso * 10}%`);
    }
  },
});

const portada = await selectComposition({ serveUrl, id: `${proyecto}-portada`, inputProps });
await renderStill({
  composition: portada,
  serveUrl,
  inputProps,
  output: join(salida, 'portada.jpg'),
  imageFormat: 'jpeg',
  jpegQuality: 92,
  chromiumOptions,
});

// En el post, {titulo} es el título del video y {capitulos} la lista «0:00 Nombre» para YouTube: sale de
// "capitulos" del guion (id de la escena donde empieza cada capítulo → nombre) y de dónde cae cada escena.
const guion = JSON.parse(readFileSync(join(raiz, 'proyectos', proyecto, 'guion.json'), 'utf8'));
const tiempos = JSON.parse(readFileSync(join(raiz, 'proyectos', proyecto, 'tiempos.json'), 'utf8'));
const minuto = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const capitulos = tiempos.escenas
  .filter((e) => guion.capitulos?.[e.id])
  .map((e) => `${minuto(e.inicio)} ${guion.capitulos[e.id]}`)
  .join('\n');
const post = guion.post.replaceAll('{titulo}', guion.titulo).replaceAll('{capitulos}', capitulos);
writeFileSync(join(salida, 'post.txt'), post + '\n');

console.log(`\nListo: listos/${proyecto}/video.mp4, portada.jpg y post.txt`);
