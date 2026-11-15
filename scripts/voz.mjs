// Genera la voz de cada escena y los tiempos de cada palabra, y arma tiempos.json, que es lo que
// dibuja el video: orden de escenas, duraciones, plantillas y música.
// Uso: pnpm voz <proyecto>
// Lee proyectos/<proyecto>/guion.json y escribe:
//   public/<proyecto>/NN-<escena>.wav (Mac) o .mp3 (ElevenLabs)
//   proyectos/<proyecto>/tiempos.json
//
// La voz va en "voz" del guion, y cada escena puede cambiarla con su propio "voz":
//   { "proveedor": "mac", "nombre": "Paulina", "velocidad": 175 }
//   { "proveedor": "elevenlabs", "id": "<voice_id>", "nombre": "<para recordarla>",
//     "modelo": "eleven_multilingual_v2", "ajustes": { "stability": 0.5, "speed": 1.05 } }
//   { "proveedor": "ninguna" }  → sin voz: cada escena dura su "pausa" (segundos) y el texto es un subtítulo fijo.
// ElevenLabs necesita la clave en .env (ELEVENLABS_API_KEY).
// Las frases cuyo texto y voz ya se generaron alguna vez no se vuelven a pagar: se guardan en
// .cache/voz/<proyecto>/ y se recuperan de ahí.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { firmaEscena, vozDeEscena } from './firma.mjs';

const FPS = 30;
const RESPIRO = 0.4; // segundos de silencio al final de cada escena (se cambia con "pausa" en el guion)
const COLA_FINAL = 1.0; // segundos extra al final del video

const salir = (mensaje) => {
  console.error(`\n${mensaje}`);
  process.exit(1);
};

const proyecto = process.argv.slice(2).find((a) => a !== '--');
if (!proyecto) salir('Uso: pnpm voz <proyecto>');

const raiz = new URL('..', import.meta.url).pathname;
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch {
  // Sin .env solo funciona la voz del Mac.
}

const carpeta = join(raiz, 'proyectos', proyecto);
const guion = JSON.parse(readFileSync(join(carpeta, 'guion.json'), 'utf8'));
const carpetaAudio = join(raiz, 'public', proyecto);
mkdirSync(carpetaAudio, { recursive: true });
const rutaTiempos = join(carpeta, 'tiempos.json');
const anteriores = existsSync(rutaTiempos) ? JSON.parse(readFileSync(rutaTiempos, 'utf8')).escenas : [];

// --- Voz del Mac -----------------------------------------------------------

const vozMac = (texto, archivo, voz) => {
  execFileSync('say', [
    '-v', voz.nombre,
    '-r', String(voz.velocidad ?? 175),
    '--file-format=WAVE',
    '--data-format=LEI16@44100',
    '-o', archivo,
    texto,
  ]);
  const tramos = tramosDeVoz(leerWav(archivo));
  return { palabras: tiemposDePalabras(texto, tramos), finVoz: tramos.at(-1)[1] };
};

// --- ElevenLabs --------------------------------------------------------------

const explicarError = (estado, cuerpo) => {
  let detalle = cuerpo;
  try {
    const d = JSON.parse(cuerpo).detail;
    detalle = typeof d === 'string' ? d : (d?.message ?? cuerpo);
  } catch {
    // El cuerpo no era JSON: se muestra tal cual.
  }
  if (estado === 401) return `La clave de ElevenLabs no funciona. Revisa el archivo .env.\n(${detalle})`;
  if (estado === 404) return `ElevenLabs no encuentra esa voz en tu cuenta. Agrégala con: pnpm voces agregar <id>\n(${detalle})`;
  if (/quota|credits/i.test(detalle)) return `Se acabaron los créditos de ElevenLabs de este mes.\n(${detalle})`;
  return `ElevenLabs respondió con error ${estado}:\n${detalle}`;
};

// Convierte los tiempos por letra de ElevenLabs en tiempos por palabra.
const palabrasDeAlineacion = (alineacion) => {
  const { characters: letras, character_start_times_seconds: inicios, character_end_times_seconds: finales } = alineacion;
  const palabras = [];
  let actual = null;
  letras.forEach((letra, i) => {
    if (/\s/.test(letra)) {
      actual = null;
      return;
    }
    if (!actual) {
      actual = { texto: '', inicio: inicios[i], fin: finales[i] };
      palabras.push(actual);
    }
    actual.texto += letra;
    actual.fin = finales[i];
  });
  return palabras.map((p) => ({ texto: p.texto, inicio: +p.inicio.toFixed(3), fin: +p.fin.toFixed(3) }));
};

const vozElevenLabs = async (texto, archivo, voz, contexto) => {
  const clave = process.env.ELEVENLABS_API_KEY?.trim();
  if (!clave) salir('Falta la clave de ElevenLabs: pégala en el archivo .env, después de ELEVENLABS_API_KEY=');
  if (!voz.id) salir('Falta el "id" de la voz en guion.json. Puedes ver tus voces con: pnpm voces');

  const respuesta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voz.id}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': clave, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: texto,
        model_id: voz.modelo ?? 'eleven_multilingual_v2',
        previous_text: contexto.antes,
        next_text: contexto.despues,
        voice_settings: voz.ajustes,
      }),
    },
  );
  if (!respuesta.ok) salir(explicarError(respuesta.status, await respuesta.text()));

  const datos = await respuesta.json();
  writeFileSync(archivo, Buffer.from(datos.audio_base64, 'base64'));
  const palabras = palabrasDeAlineacion(datos.alignment);
  return { palabras, finVoz: palabras.at(-1).fin };
};

// --- Análisis del audio del Mac ---------------------------------------------

// Lee un WAV PCM de 16 bits y devuelve sus muestras normalizadas (-1..1).
const leerWav = (archivo) => {
  const buf = readFileSync(archivo);
  let pos = 12;
  let canales = 1;
  let frecuencia = 44100;
  while (pos < buf.length) {
    const id = buf.toString('ascii', pos, pos + 4);
    const tam = buf.readUInt32LE(pos + 4);
    if (id === 'fmt ') {
      canales = buf.readUInt16LE(pos + 10);
      frecuencia = buf.readUInt32LE(pos + 12);
    }
    if (id === 'data') {
      const n = Math.floor(tam / 2 / canales);
      const muestras = new Float32Array(n);
      for (let i = 0; i < n; i++) muestras[i] = buf.readInt16LE(pos + 8 + i * 2 * canales) / 32768;
      return { muestras, frecuencia };
    }
    pos += 8 + tam + (tam % 2);
  }
  throw new Error(`No encontré audio en ${archivo}`);
};

// Tramos donde hay voz, separados por silencios de al menos 150 ms.
const tramosDeVoz = ({ muestras, frecuencia }) => {
  const ventana = Math.round(frecuencia * 0.01);
  const energia = [];
  for (let i = 0; i + ventana <= muestras.length; i += ventana) {
    let suma = 0;
    for (let j = i; j < i + ventana; j++) suma += muestras[j] * muestras[j];
    energia.push(Math.sqrt(suma / ventana));
  }
  const pico = Math.max(...energia);
  const umbral = Math.max(pico * 0.03, 0.002);
  const tramos = [];
  let inicio = -1;
  let silencio = 0;
  energia.forEach((e, i) => {
    if (e > umbral) {
      if (inicio < 0) inicio = i;
      silencio = 0;
    } else if (inicio >= 0 && ++silencio >= 15) {
      tramos.push([inicio * 0.01, (i - silencio + 1) * 0.01]);
      inicio = -1;
      silencio = 0;
    }
  });
  if (inicio >= 0) tramos.push([inicio * 0.01, (energia.length - silencio) * 0.01]);
  return tramos;
};

// Peso aproximado de una palabra: sus sílabas (grupos de vocales).
const silabas = (palabra) =>
  Math.max(1, (palabra.toLowerCase().match(/[aeiouáéíóúü]+/g) ?? []).length);

// Reparte las palabras dentro de los tramos de voz.
// Si las pausas del audio coinciden con la puntuación del texto, cada grupo de
// palabras va en su tramo; si no, se reparte todo en proporción a las sílabas.
const tiemposDePalabras = (texto, tramos) => {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const grupos = [[]];
  palabras.forEach((p, i) => {
    grupos.at(-1).push(p);
    if (/[.,;:?!…]$/.test(p) && i < palabras.length - 1) grupos.push([]);
  });

  const repartir = (lista, [desde, hasta]) => {
    const total = lista.reduce((s, p) => s + silabas(p) + 0.3, 0);
    let t = desde;
    return lista.map((p) => {
      const dur = ((silabas(p) + 0.3) / total) * (hasta - desde);
      const r = { texto: p, inicio: +t.toFixed(3), fin: +(t + dur).toFixed(3) };
      t += dur;
      return r;
    });
  };

  if (tramos.length === grupos.length) return grupos.flatMap((g, i) => repartir(g, tramos[i]));
  return repartir(palabras, [tramos[0][0], tramos.at(-1)[1]]);
};

// --- Proceso -----------------------------------------------------------------

// Memoria de voces: cada audio se guarda por su firma en .cache/voz/<proyecto>/, para que volver
// a un texto o a una voz anterior no gaste créditos otra vez.
const carpetaMemoria = join(raiz, '.cache', 'voz', proyecto);
mkdirSync(carpetaMemoria, { recursive: true });
const recordar = (firma, audio, datos) => {
  const destino = join(carpetaMemoria, `${firma}.${audio.split('.').pop()}`);
  if (!existsSync(destino)) copyFileSync(audio, destino);
  writeFileSync(join(carpetaMemoria, `${firma}.json`), JSON.stringify(datos));
};
const recuperar = (firma, extension) => {
  const audio = join(carpetaMemoria, `${firma}.${extension}`);
  const datos = join(carpetaMemoria, `${firma}.json`);
  return existsSync(audio) && existsSync(datos) ? { audio, datos: JSON.parse(readFileSync(datos, 'utf8')) } : null;
};

// Antes de cambiar nada, las voces que ya existen pasan a la memoria.
for (const e of anteriores) {
  const audio = join(raiz, 'public', e.audio);
  if (e.firma && existsSync(audio)) recordar(e.firma, audio, { palabras: e.palabras, finVoz: e.finVoz });
}

const escenas = [];
let inicio = 0;
let generadas = 0;

for (const [i, escena] of guion.escenas.entries()) {
  const voz = vozDeEscena(guion, escena);
  const extension = voz.proveedor === 'mac' ? 'wav' : 'mp3';
  const nombre = `${String(i + 1).padStart(2, '0')}-${escena.id}.${extension}`;
  const archivo = join(carpetaAudio, nombre);
  const firma = firmaEscena(guion, escena);

  const previa = anteriores.find((e) => e.id === escena.id && e.firma === firma);
  const recordada = recuperar(firma, extension);
  let resultado;
  let origen;
  if (voz.proveedor === 'ninguna') {
    // Sin voz: la escena dura lo que diga su "pausa" y el texto sale como subtítulo fijo.
    const duracion = Math.ceil((escena.pausa ?? 3) * FPS) / FPS + (i === guion.escenas.length - 1 ? COLA_FINAL : 0);
    console.log(`${escena.id}  ${duracion.toFixed(2)} s  sin voz`);
    escenas.push({
      id: escena.id,
      texto: escena.texto,
      audio: '',
      inicio: +inicio.toFixed(4),
      duracion: +duracion.toFixed(4),
      transicion: escena.transicion ?? 'fundido',
      ...(escena.dibujo ? { dibujo: escena.dibujo } : {}),
      ...(escena.plantilla ? { plantilla: escena.plantilla } : {}),
      firma,
      finVoz: 0,
      palabras: [],
    });
    inicio += duracion;
    continue;
  } else if (previa && existsSync(archivo)) {
    resultado = { palabras: previa.palabras, finVoz: previa.finVoz };
    origen = 'sin cambios';
  } else if (recordada) {
    copyFileSync(recordada.audio, archivo);
    resultado = recordada.datos;
    origen = 'recuperada de la memoria, gratis';
  } else {
    if (voz.proveedor === 'mac') {
      resultado = vozMac(escena.texto, archivo, voz);
    } else if (voz.proveedor === 'elevenlabs') {
      resultado = await vozElevenLabs(escena.texto, archivo, voz, {
        antes: guion.escenas[i - 1]?.texto,
        despues: guion.escenas[i + 1]?.texto,
      });
    } else {
      salir(`Proveedor de voz desconocido: "${voz.proveedor}" (usa "mac" o "elevenlabs").`);
    }
    recordar(firma, archivo, resultado);
    origen = 'nueva';
    generadas++;
  }

  let duracion = resultado.finVoz + (escena.pausa ?? RESPIRO);
  if (i === guion.escenas.length - 1) duracion += COLA_FINAL;
  // Redondear a fotogramas completos para que las escenas encajen sin huecos.
  duracion = Math.ceil(duracion * FPS) / FPS;

  console.log(`${nombre}  ${duracion.toFixed(2)} s  ${voz.nombre ?? voz.id}  (${origen})`);

  escenas.push({
    id: escena.id,
    texto: escena.texto,
    audio: `${proyecto}/${nombre}`,
    inicio: +inicio.toFixed(4),
    duracion: +duracion.toFixed(4),
    transicion: escena.transicion ?? 'fundido',
    ...(escena.dibujo ? { dibujo: escena.dibujo } : {}),
    ...(escena.plantilla ? { plantilla: escena.plantilla } : {}),
    firma,
    finVoz: resultado.finVoz,
    palabras: resultado.palabras,
  });
  inicio += duracion;
}

// Quitar de public/ los audios que ya no usa ninguna escena (siguen en la memoria).
const enUso = new Set(escenas.map((e) => e.audio.split('/').pop()));
for (const nombre of readdirSync(carpetaAudio)) {
  if (/\.(mp3|wav)$/.test(nombre) && !enUso.has(nombre)) unlinkSync(join(carpetaAudio, nombre));
}

const tiempos = { fps: FPS, duracion: +inicio.toFixed(4), escenas, musica: guion.musica ?? null };
writeFileSync(rutaTiempos, JSON.stringify(tiempos, null, 2) + '\n');
console.log(`\n${generadas} frases nuevas. Total: ${inicio.toFixed(1)} s → proyectos/${proyecto}/tiempos.json`);
