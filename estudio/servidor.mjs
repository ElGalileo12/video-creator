// Estudio: interfaz local para ver y editar los videos.
// Uso: pnpm estudio → http://localhost:4321
//
// - Empaqueta la interfaz (estudio/app) con esbuild y avisa al navegador cuando cambia
//   cualquier archivo del proyecto (guion, tiempos, escenas, marca…), para recargar la vista previa.
// - Ofrece una API para leer y guardar guiones, generar la voz, renderizar, pedir videos nuevos y editar la marca.
// - Con el botón «Empezar», lanza Claude Code en segundo plano para hacer un pedido de principio a fin.
// - Solo escucha en esta computadora (127.0.0.1).

import { execFileSync, spawn } from 'node:child_process';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, watch, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import * as esbuild from 'esbuild';
import { firmaEscena, vozDeEscena } from '../scripts/firma.mjs';

const PUERTO = Number(process.env.PORT ?? 4321);
const raiz = normalize(new URL('..', import.meta.url).pathname).replace(/\/$/, '');
const ruta = (...partes) => join(raiz, ...partes);
try {
  process.loadEnvFile(ruta('.env'));
} catch {
  // Sin .env el Estudio funciona igual, solo sin las voces de ElevenLabs.
}

const leerJson = (archivo) => JSON.parse(readFileSync(archivo, 'utf8'));
const escribirJson = (archivo, datos) => writeFileSync(archivo, JSON.stringify(datos, null, 2) + '\n');

// --- Avisos en vivo (Server-Sent Events) ------------------------------------------

const clientes = new Set();
const avisar = (evento) => {
  const datos = `data: ${JSON.stringify(evento)}\n\n`;
  for (const cliente of clientes) cliente.write(datos);
};

// --- Interfaz: se reempaqueta sola cuando cambia algún archivo que usa ----------------

let paquete = { js: '', css: '', error: null, version: 0 };
const contexto = await esbuild.context({
  entryPoints: [ruta('estudio/app/main.tsx')],
  bundle: true,
  write: false,
  outdir: ruta('estudio/.salida'),
  format: 'esm',
  jsx: 'automatic',
  loader: { '.png': 'dataurl', '.svg': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'silent',
  plugins: [
    {
      name: 'avisar-al-navegador',
      setup(build) {
        build.onEnd((resultado) => {
          if (resultado.errors.length > 0) {
            paquete.error = resultado.errors
              .map((e) => `${e.location ? `${e.location.file}:${e.location.line}` : ''}\n${e.text}`)
              .join('\n\n');
          } else {
            const salida = (fin) => resultado.outputFiles.find((f) => f.path.endsWith(fin))?.text ?? '';
            paquete = { js: salida('.js'), css: salida('.css'), error: null, version: paquete.version + 1 };
          }
          avisar({ tipo: 'recargar', version: paquete.version, error: paquete.error });
        });
      },
    },
  ],
});
await contexto.watch();

// Pedidos y videos terminados no forman parte de la interfaz empaquetada: se vigilan aparte
// para que la biblioteca se actualice sola (por ejemplo, cuando Claude termina un video desde el chat).
let esperaArchivos = null;
const avisarArchivos = () => {
  clearTimeout(esperaArchivos);
  esperaArchivos = setTimeout(() => avisar({ tipo: 'archivos' }), 400);
};
for (const carpeta of ['pedidos', 'listos']) {
  mkdirSync(ruta(carpeta), { recursive: true });
  watch(ruta(carpeta), { recursive: true }, avisarArchivos);
}
watch(ruta('proyectos'), { recursive: true }, (_, nombre) => {
  if (String(nombre).endsWith('notas.json')) avisarArchivos();
});
watch(raiz, (_, nombre) => {
  if (nombre === 'categorias.json') avisarArchivos();
});

// --- Proyectos ------------------------------------------------------------------------

const ID_VALIDO = /^[a-z0-9][a-z0-9-]*$/;

const idsDeProyectos = () =>
  readdirSync(ruta('proyectos'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && ID_VALIDO.test(d.name) && existsSync(ruta('proyectos', d.name, 'guion.json')))
    .map((d) => d.name);

const exigirProyecto = (id) => {
  if (!ID_VALIDO.test(id) || !existsSync(ruta('proyectos', id, 'guion.json'))) {
    throw Object.assign(new Error(`No existe el proyecto "${id}"`), { estado: 404 });
  }
};

// Fecha del último cambio de una carpeta (sin entrar en subcarpetas pesadas).
const ultimoCambio = (carpeta) => {
  if (!existsSync(carpeta)) return 0;
  const info = statSync(carpeta);
  if (info.isFile()) return info.mtimeMs;
  return Math.max(0, ...readdirSync(carpeta).map((n) => ultimoCambio(join(carpeta, n))));
};

const estadoDeProyecto = (id) => {
  const guion = leerJson(ruta('proyectos', id, 'guion.json'));
  const archivoTiempos = ruta('proyectos', id, 'tiempos.json');
  const tiempos = existsSync(archivoTiempos) ? leerJson(archivoTiempos) : null;
  const firmas = new Map((tiempos?.escenas ?? []).map((e) => [e.id, e.firma]));
  const pendientes = guion.escenas.filter((e) => firmas.get(e.id) !== firmaEscena(guion, e));
  const vozPendiente = pendientes.map((e) => e.id);
  // Las que no están en la memoria de voces y son de ElevenLabs cuestan créditos.
  const porPagar = pendientes.filter((e) => {
    const voz = vozDeEscena(guion, e);
    return voz.proveedor === 'elevenlabs' && !existsSync(ruta('.cache', 'voz', id, `${firmaEscena(guion, e)}.mp3`));
  });

  const video = ruta('listos', id, 'video.mp4');
  const fechaVideo = existsSync(video) ? statSync(video).mtimeMs : 0;
  const fechaSrc = Math.max(
    0,
    ...readdirSync(ruta('src'))
      .filter((n) => n !== 'proyectos.ts')
      .map((n) => ultimoCambio(ruta('src', n))),
  );
  const fechaProyecto = Math.max(
    0,
    ...readdirSync(ruta('proyectos', id))
      .filter((n) => n !== 'notas.json')
      .map((n) => ultimoCambio(ruta('proyectos', id, n))),
  );
  const fechaFuentes = Math.max(fechaProyecto, fechaSrc, ultimoCambio(ruta('marca.json')));
  const registrado = readFileSync(ruta('src', 'proyectos.ts'), 'utf8').includes(`'../proyectos/${id}'`);

  return {
    id,
    titulo: guion.titulo,
    formato: guion.formato === 'horizontal' ? 'horizontal' : 'vertical',
    categoria: categoriaDe(id),
    division: leerCategorias().division[id] ?? null,
    // Fecha en que se creó el video (la de su carpeta, que no cambia al editarlo): ordena las divisiones.
    creado: Math.round(statSync(ruta('proyectos', id)).birthtimeMs),
    escenas: guion.escenas.length,
    duracion: tiempos?.duracion ?? null,
    registrado,
    vozPendiente,
    notasPendientes: leerNotas(id).filter((n) => n.estado === 'pendiente').length,
    vozPorPagar: porPagar.map((e) => e.id),
    creditosPorPagar: porPagar.reduce((n, e) => n + e.texto.length, 0),
    video: fechaVideo
      ? { url: `/listos/${id}/video.mp4?v=${Math.round(fechaVideo)}`, alDia: fechaVideo >= fechaFuentes }
      : null,
    portada: existsSync(ruta('listos', id, 'portada.jpg'))
      ? `/listos/${id}/portada.jpg?v=${Math.round(statSync(ruta('listos', id, 'portada.jpg')).mtimeMs)}`
      : null,
    trabajo: trabajos.get(id) ?? null,
  };
};

// Guarda lo que el Estudio puede editar: datos generales, la lista completa de escenas
// (con su orden, duplicados, borrados y plantillas) y la música. Todo se valida antes de escribir.
const ID_ESCENA = /^[a-z0-9][a-z0-9-]{0,40}$/;
const MUSICA_VALIDA = /^musica\/[\w.-]+\.(mp3|wav|m4a|ogg)$/;
const invalido = (mensaje) => Object.assign(new Error(mensaje), { estado: 400 });

const guardarGuion = (id, nuevo) => {
  const archivo = ruta('proyectos', id, 'guion.json');
  const guion = leerJson(archivo);
  const texto = (v, campo) => {
    if (typeof v !== 'string' || !v.trim()) throw invalido(`Falta ${campo}`);
    return v.trim();
  };
  const voz = (v) => {
    if (!v || !['mac', 'elevenlabs', 'ninguna'].includes(v.proveedor)) throw invalido('Voz no válida');
    return v;
  };
  const plantilla = (p) => {
    if (!p || typeof p.tipo !== 'string' || !/^[a-z]+$/.test(p.tipo)) throw invalido('Plantilla no válida');
    const limpia = { tipo: p.tipo };
    for (const [clave, valor] of Object.entries(p)) {
      if (clave === 'tipo' || !/^[a-zA-Z]+$/.test(clave)) continue;
      if (typeof valor === 'string') limpia[clave] = valor.slice(0, 300);
      else if (Array.isArray(valor)) limpia[clave] = valor.slice(0, 10).map((x) => String(x).slice(0, 120));
    }
    return limpia;
  };

  if (nuevo.titulo !== undefined) guion.titulo = texto(nuevo.titulo, 'el título');
  if (nuevo.voz !== undefined) guion.voz = voz(nuevo.voz);
  if (nuevo.portada !== undefined) {
    guion.portada = { titulo: texto(nuevo.portada.titulo, 'el título de la portada'), destacar: texto(nuevo.portada.destacar, 'la palabra destacada') };
  }
  if (nuevo.post !== undefined) guion.post = String(nuevo.post);

  if (nuevo.escenas !== undefined) {
    if (!Array.isArray(nuevo.escenas) || nuevo.escenas.length === 0) throw invalido('El video necesita al menos una escena');
    // Los videos completos (horizontales) juntan varios cortos: admiten muchas más escenas.
    const maximo = guion.formato === 'horizontal' ? 200 : 30;
    if (nuevo.escenas.length > maximo) throw invalido(`Máximo ${maximo} escenas`);
    const vistos = new Set();
    guion.escenas = nuevo.escenas.map((e) => {
      if (!ID_ESCENA.test(e.id ?? '')) throw invalido(`Nombre de escena no válido: "${e.id}"`);
      if (vistos.has(e.id)) throw invalido(`Hay dos escenas con el mismo nombre: "${e.id}"`);
      vistos.add(e.id);
      const escena = { id: e.id, texto: texto(e.texto, `el texto de la escena "${e.id}"`) };
      if (e.voz) escena.voz = voz(e.voz);
      if (e.transicion === 'corte') escena.transicion = 'corte';
      const pausa = Number(e.pausa);
      if (e.pausa !== undefined && e.pausa !== null && e.pausa !== '' && pausa >= 0 && pausa <= 60) escena.pausa = pausa;
      if (e.dibujo) {
        if (!ID_ESCENA.test(e.dibujo)) throw invalido(`Dibujo no válido en "${e.id}"`);
        escena.dibujo = e.dibujo;
      }
      if (e.plantilla) escena.plantilla = plantilla(e.plantilla);
      return escena;
    });
  }

  if (nuevo.musica !== undefined) {
    if (nuevo.musica === null) delete guion.musica;
    else {
      const m = nuevo.musica;
      if (!MUSICA_VALIDA.test(m.archivo ?? '') || !existsSync(ruta('public', m.archivo))) throw invalido('Esa canción no está en la biblioteca');
      guion.musica = {
        archivo: m.archivo,
        volumen: Math.min(1, Math.max(0, Number(m.volumen) || 0)),
        bajarConVoz: Boolean(m.bajarConVoz),
        desde: Math.min(600, Math.max(0, Number(m.desde) || 0)),
      };
    }
  }
  escribirJson(archivo, guion);
};

// --- Categorías de la biblioteca (categorias.json) ----------------------------------------------
//
// Solo ordenan la biblioteca; no son parte del video (por eso no van en guion.json, donde marcarían
// el video como cambiado). { "orden": ["Gali Esport", …], "videos": { "<id>": "<categoría>" } }.
// Un video sin categoría va a «Variados».
// Una categoría puede partirse en divisiones (p. ej. Gali Esport: Entrenador, Organizador, Jugador):
// "divisiones": { "<categoría>": ["<división>", …] } y "division": { "<id>": "<división>" }. Dentro de cada
// división los videos van del más antiguo al más nuevo.

const archivoCategorias = ruta('categorias.json');
const CATEGORIA_POR_DEFECTO = 'Variados';
const leerCategorias = () => {
  const datos = existsSync(archivoCategorias) ? leerJson(archivoCategorias) : {};
  return {
    orden: Array.isArray(datos.orden) ? datos.orden : [],
    videos: datos.videos ?? {},
    divisiones: datos.divisiones ?? {},
    division: datos.division ?? {},
  };
};
const categoriaDe = (id) => leerCategorias().videos[id] ?? CATEGORIA_POR_DEFECTO;
const listaCategorias = () => {
  const { orden, videos } = leerCategorias();
  return [...new Set([...orden, ...Object.values(videos), CATEGORIA_POR_DEFECTO])];
};
const nombreCategoria = (valor) => {
  const categoria = String(valor ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!categoria) throw invalido('Escribe el nombre de la categoría');
  return categoria;
};
const guardarDivision = (id, valor) => {
  const datos = leerCategorias();
  const posibles = datos.divisiones[datos.videos[id] ?? CATEGORIA_POR_DEFECTO] ?? [];
  if (valor === null || valor === '') delete datos.division[id];
  else if (posibles.includes(valor)) datos.division[id] = valor;
  else throw invalido('Esa división no existe en la categoría del video');
  escribirJson(archivoCategorias, datos);
};
const guardarCategoria = (id, valor) => {
  const categoria = nombreCategoria(valor);
  const datos = leerCategorias();
  datos.videos[id] = categoria;
  if (!datos.orden.includes(categoria)) datos.orden.push(categoria);
  // Al cambiar de categoría, la división vieja ya no sirve.
  if (!(datos.divisiones[categoria] ?? []).includes(datos.division[id])) delete datos.division[id];
  escribirJson(archivoCategorias, datos);
};

// --- Notas para Claude (proyectos/<id>/notas.json) ----------------------------------------------
//
// Cada nota marca un tramo del video: empieza `desde` segundos después del inicio de la escena `escena`
// (así se mueve con su escena si se reordena) y dura `duracion`. `inicio` es su segundo absoluto la
// última vez que se guardó, por si la escena ya no existe. Claude las marca "hecha" con una `respuesta`.

const leerNotas = (id) => {
  const archivo = ruta('proyectos', id, 'notas.json');
  return existsSync(archivo) ? leerJson(archivo) : [];
};

const guardarNotas = (id, notas) => {
  if (!Array.isArray(notas) || notas.length > 200) throw invalido('Notas no válidas');
  const numero = (v, max) => Math.min(max, Math.max(0, Number(v) || 0));
  const limpias = notas.map((n) => {
    if (!/^[\w-]{1,40}$/.test(n.id ?? '')) throw invalido('Nota no válida');
    return {
      id: n.id,
      escena: ID_ESCENA.test(n.escena ?? '') ? n.escena : null,
      desde: numero(n.desde, 3600),
      duracion: Math.max(1 / 30, numero(n.duracion, 600)),
      inicio: numero(n.inicio, 3600),
      texto: String(n.texto ?? '').slice(0, 2000),
      ...(typeof n.imagen === 'string' && /^[\w./-]+\.(png|jpe?g|webp|gif)$/i.test(n.imagen) ? { imagen: n.imagen } : {}),
      estado: n.estado === 'hecha' ? 'hecha' : 'pendiente',
      ...(n.respuesta ? { respuesta: String(n.respuesta).slice(0, 2000) } : {}),
      creada: String(n.creada ?? new Date().toISOString()),
    };
  });
  escribirJson(ruta('proyectos', id, 'notas.json'), limpias);
  return limpias;
};

// --- Archivos subidos: música (biblioteca común) e imágenes de cada video --------------------

const TIPOS_MUSICA = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'm4a',
  'audio/ogg': 'ogg',
};

const nombreSeguro = (nombre, porDefecto) =>
  String(nombre ?? '')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || porDefecto;

const listarArchivos = (carpeta, prefijo) =>
  existsSync(carpeta)
    ? readdirSync(carpeta)
        .filter((n) => !n.startsWith('.'))
        .sort()
        .map((n) => ({ archivo: `${prefijo}/${n}`, nombre: n, tamano: statSync(join(carpeta, n)).size }))
    : [];

const guardarSubida = (carpeta, nombre, extension, datos) => {
  mkdirSync(carpeta, { recursive: true });
  let final = `${nombre}.${extension}`;
  for (let i = 2; existsSync(join(carpeta, final)); i++) final = `${nombre}-${i}.${extension}`;
  writeFileSync(join(carpeta, final), datos);
  return final;
};

// --- Trabajos largos (voz y render) --------------------------------------------------------

const trabajos = new Map();

const lanzar = (id, accion, script, argumentos = []) => {
  if (trabajos.has(id)) throw Object.assign(new Error('Ya hay un trabajo en curso para este video'), { estado: 409 });
  const trabajo = { accion, lineas: [], inicio: Date.now() };
  trabajos.set(id, trabajo);
  avisar({ tipo: 'trabajo', proyecto: id, accion, estado: 'empezó' });

  const hijo = spawn(process.execPath, [ruta('scripts', script), id, ...argumentos], { cwd: raiz });
  let resto = '';
  const leer = (datos) => {
    const lineas = (resto + datos.toString()).split('\n');
    resto = lineas.pop();
    for (const linea of lineas.filter((l) => l.trim())) {
      trabajo.lineas.push(linea);
      if (trabajo.lineas.length > 200) trabajo.lineas.shift();
      avisar({ tipo: 'trabajo', proyecto: id, accion, linea });
    }
  };
  hijo.stdout.on('data', leer);
  hijo.stderr.on('data', leer);
  hijo.on('close', (codigo) => {
    if (resto.trim()) leer('\n');
    trabajos.delete(id);
    avisar({ tipo: 'trabajo', proyecto: id, accion, estado: codigo === 0 ? 'listo' : 'falló', ultimas: trabajo.lineas.slice(-6) });
  });
};

// --- ElevenLabs y voces del Mac ------------------------------------------------------------

const memoria = new Map();
const recordar = async (clave, segundos, calcular) => {
  const guardado = memoria.get(clave);
  if (guardado && Date.now() - guardado.fecha < segundos * 1000) return guardado.valor;
  const valor = await calcular();
  memoria.set(clave, { valor, fecha: Date.now() });
  return valor;
};

const elevenLabs = async (camino) => {
  const clave = process.env.ELEVENLABS_API_KEY?.trim();
  if (!clave) return null;
  const respuesta = await fetch(`https://api.elevenlabs.io${camino}`, { headers: { 'xi-api-key': clave } });
  if (!respuesta.ok) return null;
  return respuesta.json();
};

const PAISES = { es_ES: 'España', es_MX: 'México', es_US: 'EE. UU.', es_AR: 'Argentina', es_CO: 'Colombia' };

const TRADUCCIONES = {
  female: 'mujer',
  male: 'hombre',
  neutral: 'neutra',
  young: 'joven',
  middle_aged: 'mediana edad',
  old: 'mayor',
  american: 'acento de EE. UU.',
  british: 'acento británico',
  australian: 'acento australiano',
  'latin american': 'latinoamericana',
  mexican: 'mexicana',
  colombian: 'colombiana',
  argentine: 'argentina',
  peninsular: 'de España',
};

const voces = () =>
  recordar('voces', 600, async () => {
    const mac = execFileSync('say', ['-v', '?'], { encoding: 'utf8' })
      .split('\n')
      .map((l) => /^(.+?)\s+(es_[A-Z]{2})\s/.exec(l))
      .filter(Boolean)
      // "Eddy (Español (España))" → se muestra "Eddy · España"; el nombre completo es el que usa `say`.
      .map(([, nombre, idioma]) => ({
        nombre: nombre.trim(),
        etiqueta: `${nombre.replace(/\s*\(.*\)\s*$/, '').trim()} · ${PAISES[idioma] ?? idioma}`,
        idioma,
      }))
      .filter((v, i, todas) => todas.findIndex((w) => w.nombre === v.nombre) === i);
    const datos = await elevenLabs('/v2/voices?page_size=100');
    const eleven = (datos?.voices ?? []).map((v) => ({
      id: v.voice_id,
      nombre: v.name.split(' - ')[0],
      descripcion: [v.labels?.gender, v.labels?.age, v.labels?.accent]
        .filter(Boolean)
        .map((etiqueta) => TRADUCCIONES[etiqueta] ?? etiqueta)
        .join(', '),
      espanol: v.verified_languages?.some((l) => l.language === 'es') ?? false,
      biblioteca: v.category !== 'premade',
    }));
    return { mac, elevenlabs: eleven };
  });

const creditos = () =>
  recordar('creditos', 60, async () => {
    const s = await elevenLabs('/v1/user/subscription');
    if (!s) return null;
    return {
      plan: s.tier,
      usados: s.character_count,
      limite: s.character_limit,
      renueva: s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : null,
    };
  });

// --- Pedidos de videos nuevos --------------------------------------------------------------

const carpetaPedidos = ruta('pedidos');
const pedidos = () =>
  existsSync(carpetaPedidos)
    ? readdirSync(carpetaPedidos)
        .filter((n) => n.endsWith('.json'))
        .sort()
        .map((n) => ({ archivo: n, ...leerJson(join(carpetaPedidos, n)) }))
    : [];

const crearPedido = (datos) => {
  const tema = String(datos.tema ?? '').trim();
  if (!tema) throw Object.assign(new Error('Escribe el tema del video'), { estado: 400 });
  mkdirSync(carpetaPedidos, { recursive: true });
  const slug = tema
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const fecha = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const archivo = `${fecha}-${slug || 'video'}.json`;
  escribirJson(join(carpetaPedidos, archivo), {
    tema,
    detalles: String(datos.detalles ?? '').trim(),
    voz: datos.voz ?? null,
    duracion: Number(datos.duracion) || 40,
    ...(datos.categoria ? { categoria: nombreCategoria(datos.categoria) } : {}),
    estado: 'pendiente',
    creado: new Date().toISOString(),
  });
  return archivo;
};

// Imágenes de un pedido: van en pedidos/<pedido>/ y se anotan en el JSON del pedido.
// `uso`: "referencia" (Claude la mira para entender el tema o el estilo) o "video" (aparece en el video).
const TIPOS_IMAGEN = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const guardarImagenPedido = (archivo, tipo, uso, datos) => {
  const json = join(carpetaPedidos, archivo);
  if (!/^[\w-]+\.json$/.test(archivo) || !existsSync(json)) throw Object.assign(new Error('Pedido no válido'), { estado: 400 });
  const extension = TIPOS_IMAGEN[tipo];
  if (!extension) throw Object.assign(new Error('Las imágenes deben ser PNG, JPG, WEBP o GIF'), { estado: 400 });
  const pedido = leerJson(json);
  const carpeta = join(carpetaPedidos, archivo.replace(/\.json$/, ''));
  mkdirSync(carpeta, { recursive: true });
  // Primer número libre (al editar se pueden quitar imágenes del medio).
  const usados = new Set((pedido.imagenes ?? []).map((i) => i.archivo.replace(/\.\w+$/, '')));
  let numero = 1;
  while (usados.has(`imagen-${numero}`)) numero++;
  const nombre = `imagen-${numero}.${extension}`;
  writeFileSync(join(carpeta, nombre), datos);
  pedido.imagenes = [...(pedido.imagenes ?? []), { archivo: nombre, uso: uso === 'video' ? 'video' : 'referencia' }];
  escribirJson(json, pedido);
  return pedido;
};

// Editar un pedido que todavía no está hecho. `imagenes`: las que se quedan, con su uso; las demás se borran
// de pedidos/<pedido>/ (las nuevas se suben aparte, como al crearlo).
const editarPedido = (archivo, datos) => {
  const json = join(carpetaPedidos, archivo);
  if (!/^[\w-]+\.json$/.test(archivo) || !existsSync(json)) throw Object.assign(new Error('Pedido no válido'), { estado: 400 });
  if (trabajoClaude?.pedido === archivo) throw Object.assign(new Error('Primero detén este video'), { estado: 409 });
  const pedido = leerJson(json);
  if (pedido.estado === 'hecho') throw Object.assign(new Error('Este pedido ya está hecho'), { estado: 400 });
  const tema = String(datos.tema ?? '').trim();
  if (!tema) throw Object.assign(new Error('Escribe el tema del video'), { estado: 400 });
  const quedan = new Map((datos.imagenes ?? []).map((i) => [i.archivo, i.uso === 'video' ? 'video' : 'referencia']));
  const carpeta = join(carpetaPedidos, archivo.replace(/\.json$/, ''));
  for (const imagen of pedido.imagenes ?? []) if (!quedan.has(imagen.archivo)) rmSync(join(carpeta, imagen.archivo), { force: true });
  const imagenes = (pedido.imagenes ?? []).filter((i) => quedan.has(i.archivo)).map((i) => ({ archivo: i.archivo, uso: quedan.get(i.archivo) }));
  const { categoria, imagenes: _, ...resto } = pedido;
  escribirJson(json, {
    ...resto,
    tema,
    detalles: String(datos.detalles ?? '').trim(),
    voz: datos.voz ?? null,
    duracion: Number(datos.duracion) || 40,
    ...(datos.categoria ? { categoria: nombreCategoria(datos.categoria) } : {}),
    ...(imagenes.length ? { imagenes } : {}),
    editado: new Date().toISOString(),
  });
  return { archivo, ...leerJson(json) };
};

// Borrar de una vez los pedidos ya hechos (el JSON y su carpeta de imágenes). Los videos no se tocan: las imágenes
// que salen en un video se copian a public/<id>/ al hacerlo.
const borrarPedidosHechos = () => {
  const hechos = pedidos().filter((p) => p.estado === 'hecho' && p.archivo !== trabajoClaude?.pedido);
  for (const { archivo } of hechos) {
    rmSync(join(carpetaPedidos, archivo), { force: true });
    rmSync(join(carpetaPedidos, archivo.replace(/\.json$/, '')), { recursive: true, force: true });
  }
  return { borrados: hechos.length };
};

// --- Claude Code: hace los pedidos en segundo plano ----------------------------------------------
//
// Usa el Claude Code instalado en este Mac, con la cuenta del usuario (no necesita clave aparte).
// Solo puede tocar la carpeta del proyecto y usar los comandos de la lista.

const CLAUDE = [process.env.CLAUDE_BIN, join(homedir(), '.local/bin/claude')].find((r) => r && existsSync(r)) ?? 'claude';
const PERMISOS = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Skill', 'TodoWrite',
  'Bash(pnpm voz *)', 'Bash(pnpm render *)', 'Bash(pnpm voces *)', 'Bash(pnpm exec tsc *)',
  'Bash(mkdir *)', 'Bash(cp *)', 'Bash(ls *)', 'Bash(sips *)',
];

let trabajoClaude = null; // { pedido, tema, lineas, inicio, proceso, detenido }
let ultimoResultado = null; // { pedido, tema, estado, resumen, proyecto, fin }

// Traduce cada paso de Claude a una frase que el usuario entienda (o null si no vale la pena mostrarlo).
const describirPaso = (herramienta, entrada = {}) => {
  const archivo = String(entrada.file_path ?? entrada.path ?? '').replace(`${raiz}/`, '');
  const comando = String(entrada.command ?? '');
  switch (herramienta) {
    case 'WebSearch':
      return `Investigando: «${entrada.query}»`;
    case 'WebFetch':
      try {
        return `Leyendo una fuente: ${new URL(entrada.url).hostname.replace(/^www\./, '')}`;
      } catch {
        return 'Leyendo una fuente';
      }
    case 'Skill':
      return 'Siguiendo el proceso para hacer videos';
    case 'Read':
      if (/^pedidos\/.+\.(png|jpe?g|webp|gif)$/i.test(archivo)) return 'Mirando tu imagen';
      if (/^\.revision\//.test(archivo)) return 'Revisando un fotograma del video';
      return null;
    case 'Write':
    case 'Edit':
      if (/guion\.json$/.test(archivo)) return 'Escribiendo el guion';
      if (/fuentes\.md$/.test(archivo)) return 'Anotando las fuentes';
      if (/(Escenas|dibujos)\.tsx$/.test(archivo)) return 'Dibujando y animando las escenas';
      if (/src\/proyectos\.ts$/.test(archivo)) return 'Agregando el video al Estudio';
      if (/^pedidos\//.test(archivo)) return 'Actualizando el pedido';
      return `Editando ${archivo}`;
    case 'Bash':
      if (/pnpm voz/.test(comando)) return 'Generando la voz';
      if (/--revisar/.test(comando)) return 'Sacando fotogramas para revisar';
      if (/pnpm render/.test(comando)) return 'Renderizando el video final';
      if (/tsc/.test(comando)) return 'Comprobando que el código no tenga errores';
      if (/^cp /.test(comando)) return 'Copiando tus imágenes al video';
      return null;
    default:
      return null;
  }
};

const empezarPedido = (archivo) => {
  const json = join(carpetaPedidos, archivo);
  if (!/^[\w-]+\.json$/.test(archivo) || !existsSync(json)) throw Object.assign(new Error('Pedido no válido'), { estado: 400 });
  if (trabajoClaude) throw Object.assign(new Error('Ya estoy haciendo otro video. Espera a que termine.'), { estado: 409 });
  const pedido = leerJson(json);
  if (pedido.estado === 'hecho') throw Object.assign(new Error('Este pedido ya está hecho'), { estado: 400 });
  pedido.estado = 'en curso';
  escribirJson(json, pedido);

  const carpeta = join(carpetaPedidos, archivo.replace(/\.json$/, ''));
  mkdirSync(carpeta, { recursive: true });
  const registro = createWriteStream(join(carpeta, 'registro.jsonl'), { flags: 'a' });

  const instrucciones =
    `Haz el video del pedido pedidos/${archivo} con la skill hacer-video, de principio a fin. ` +
    'Trabajas solo, lanzado desde el botón «Empezar» del Estudio: no hagas preguntas, decide tú con lo que dice el pedido, ' +
    'y si algo falla, intenta arreglarlo. Al terminar, deja el pedido con "estado": "hecho" y "proyecto": "<id>", ' +
    'y responde con un resumen de 2 o 3 frases para el usuario, en español y sin tecnicismos.';
  const proceso = spawn(
    CLAUDE,
    ['-p', instrucciones, '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--allowedTools', ...PERMISOS],
    { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const trabajo = { pedido: archivo, tema: pedido.tema, lineas: [], inicio: Date.now(), proceso, detenido: false, resumen: null, exito: false };
  trabajoClaude = trabajo;
  avisar({ tipo: 'claude', pedido: archivo, estado: 'empezó' });

  const anotar = (linea) => {
    if (!linea || trabajo.lineas.at(-1) === linea) return;
    trabajo.lineas.push(linea);
    if (trabajo.lineas.length > 300) trabajo.lineas.shift();
    avisar({ tipo: 'claude', pedido: archivo, linea });
  };

  let resto = '';
  proceso.stdout.on('data', (datos) => {
    const lineas = (resto + datos.toString()).split('\n');
    resto = lineas.pop();
    for (const texto of lineas.filter((l) => l.trim())) {
      registro.write(texto + '\n');
      let evento;
      try {
        evento = JSON.parse(texto);
      } catch {
        continue;
      }
      if (evento.type === 'assistant') {
        for (const parte of evento.message?.content ?? []) {
          if (parte.type === 'tool_use') anotar(describirPaso(parte.name, parte.input));
          if (parte.type === 'text' && parte.text.trim()) anotar(`💬 ${parte.text.trim().split('\n')[0].slice(0, 220)}`);
        }
      }
      if (evento.type === 'result') {
        trabajo.resumen = String(evento.result ?? '').trim();
        trabajo.exito = evento.subtype === 'success' && !evento.is_error;
      }
    }
  });
  proceso.stderr.on('data', (datos) => registro.write(`# error: ${datos}`));
  proceso.on('error', (error) => {
    registro.write(`# no se pudo iniciar Claude Code: ${error.message}\n`);
    anotar(`No se pudo iniciar Claude Code: ${error.message}`);
  });
  proceso.on('close', () => {
    registro.end();
    const final = existsSync(json) ? leerJson(json) : null;
    const hecho = final?.estado === 'hecho';
    const estado = trabajo.detenido ? 'detenido' : hecho ? 'listo' : 'falló';
    if (final && !hecho) {
      final.estado = 'pendiente';
      escribirJson(json, final);
    }
    ultimoResultado = {
      pedido: archivo,
      tema: trabajo.tema,
      estado,
      resumen: trabajo.detenido ? 'Lo detuviste. Puedes volver a empezarlo cuando quieras.' : trabajo.resumen,
      proyecto: final?.proyecto ?? null,
      fin: Date.now(),
    };
    trabajoClaude = null;
    avisar({ tipo: 'claude', pedido: archivo, estado, resumen: ultimoResultado.resumen, proyecto: ultimoResultado.proyecto });
  });
};

const detenerPedido = () => {
  if (!trabajoClaude) throw Object.assign(new Error('No hay ningún video en marcha'), { estado: 409 });
  trabajoClaude.detenido = true;
  trabajoClaude.proceso.kill('SIGTERM');
  return { ok: true };
};

const estadoClaude = () => ({
  activo: trabajoClaude && {
    pedido: trabajoClaude.pedido,
    tema: trabajoClaude.tema,
    lineas: trabajoClaude.lineas.slice(-40),
    inicio: trabajoClaude.inicio,
  },
  ultimo: ultimoResultado,
});

// --- Marca ------------------------------------------------------------------------------------

const guardarMarca = (nueva) => {
  const marca = leerJson(ruta('marca.json'));
  const HEX = /^#[0-9a-fA-F]{6}$/;
  for (const [nombre, valor] of Object.entries(nueva.colores ?? {})) {
    if (!(nombre in marca.colores) || !HEX.test(valor)) throw Object.assign(new Error(`Color no válido: ${nombre}`), { estado: 400 });
    marca.colores[nombre] = valor;
  }
  if (nueva.fuente !== undefined) marca.fuente = String(nueva.fuente);
  if (nueva.cuenta !== undefined) marca.cuenta = String(nueva.cuenta).trim().slice(0, 40);
  if (nueva.marcaDeAgua !== undefined) marca.marcaDeAgua = Boolean(nueva.marcaDeAgua);
  if (nueva.logo === '') marca.logo = '';
  escribirJson(ruta('marca.json'), marca);
};

const TIPOS_LOGO = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' };
const guardarLogo = (tipo, datos) => {
  const extension = TIPOS_LOGO[tipo];
  if (!extension) throw Object.assign(new Error('El logo debe ser PNG, JPG, WEBP o SVG'), { estado: 400 });
  const carpeta = ruta('public', 'marca');
  rmSync(carpeta, { recursive: true, force: true });
  mkdirSync(carpeta, { recursive: true });
  writeFileSync(join(carpeta, `logo.${extension}`), datos);
  const marca = leerJson(ruta('marca.json'));
  marca.logo = `marca/logo.${extension}`;
  escribirJson(ruta('marca.json'), marca);
};

// --- HTTP ------------------------------------------------------------------------------------------

const TIPOS = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

// Sirve un archivo de `base`, con soporte de rangos para poder adelantar el video.
const servirArchivo = (req, res, base, relativo) => {
  const destino = normalize(join(base, relativo));
  if (!destino.startsWith(base + sep) || !existsSync(destino) || !statSync(destino).isFile()) {
    res.writeHead(404).end('No encontrado');
    return;
  }
  const tamano = statSync(destino).size;
  const cabeceras = {
    'Content-Type': TIPOS[extname(destino).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
  };
  const rango = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (rango && (rango[1] || rango[2])) {
    const inicio = rango[1] ? Number(rango[1]) : Math.max(0, tamano - Number(rango[2]));
    const fin = rango[1] && rango[2] ? Math.min(Number(rango[2]), tamano - 1) : tamano - 1;
    if (inicio > fin || inicio >= tamano) {
      res.writeHead(416, { 'Content-Range': `bytes */${tamano}` }).end();
      return;
    }
    res.writeHead(206, { ...cabeceras, 'Content-Range': `bytes ${inicio}-${fin}/${tamano}`, 'Content-Length': fin - inicio + 1 });
    createReadStream(destino, { start: inicio, end: fin }).pipe(res);
    return;
  }
  res.writeHead(200, { ...cabeceras, 'Content-Length': tamano });
  createReadStream(destino).pipe(res);
};

const leerCuerpo = (req, limite = 6 * 1024 * 1024) =>
  new Promise((resolver, rechazar) => {
    const partes = [];
    let total = 0;
    req.on('data', (parte) => {
      total += parte.length;
      if (total > limite) {
        rechazar(Object.assign(new Error('El archivo es demasiado grande'), { estado: 413 }));
        req.destroy();
      } else partes.push(parte);
    });
    req.on('end', () => resolver(Buffer.concat(partes)));
    req.on('error', rechazar);
  });

const json = (res, estado, datos) => {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(JSON.stringify(datos));
};

const HTML = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Estudio de videos</title>
<link rel="stylesheet" href="/app.css">
</head>
<body>
<div id="raiz"></div>
<script type="module" src="/app.js"></script>
</body>
</html>`;

const rutas = [
  ['GET', /^\/api\/proyectos$/, () => idsDeProyectos().map(estadoDeProyecto)],
  [
    'GET',
    /^\/api\/proyectos\/([^/]+)$/,
    (id) => {
      exigirProyecto(id);
      return { ...estadoDeProyecto(id), guion: leerJson(ruta('proyectos', id, 'guion.json')) };
    },
  ],
  [
    'PUT',
    /^\/api\/proyectos\/([^/]+)\/guion$/,
    (id, cuerpo) => {
      exigirProyecto(id);
      guardarGuion(id, JSON.parse(cuerpo));
      // tiempos.json (orden, duraciones, plantillas, música) se rearma al momento si no hay voz que
      // pagar: las voces que faltan están en la memoria o son del Mac, así que no gasta créditos.
      if (estadoDeProyecto(id).vozPorPagar.length === 0 && !trabajos.has(id)) lanzar(id, 'tiempos', 'voz.mjs');
      return estadoDeProyecto(id);
    },
  ],
  [
    'PUT',
    /^\/api\/proyectos\/([^/]+)\/categoria$/,
    (id, cuerpo) => (exigirProyecto(id), guardarCategoria(id, JSON.parse(cuerpo).categoria), estadoDeProyecto(id)),
  ],
  ['GET', /^\/api\/categorias$/, () => listaCategorias()],
  ['GET', /^\/api\/divisiones$/, () => leerCategorias().divisiones],
  [
    'PUT',
    /^\/api\/proyectos\/([^/]+)\/division$/,
    (id, cuerpo) => (exigirProyecto(id), guardarDivision(id, JSON.parse(cuerpo).division ?? null), estadoDeProyecto(id)),
  ],
  ['POST', /^\/api\/proyectos\/([^/]+)\/voz$/, (id) => (exigirProyecto(id), lanzar(id, 'voz', 'voz.mjs'), { ok: true })],
  ['POST', /^\/api\/proyectos\/([^/]+)\/render$/, (id) => (exigirProyecto(id), lanzar(id, 'render', 'render.mjs'), { ok: true })],
  ['GET', /^\/api\/voces$/, () => voces()],
  ['GET', /^\/api\/musica$/, () => listarArchivos(ruta('public', 'musica'), 'musica')],
  ['GET', /^\/api\/proyectos\/([^/]+)\/notas$/, (id) => (exigirProyecto(id), leerNotas(id))],
  ['PUT', /^\/api\/proyectos\/([^/]+)\/notas$/, (id, cuerpo) => (exigirProyecto(id), guardarNotas(id, JSON.parse(cuerpo)))],
  [
    'GET',
    /^\/api\/proyectos\/([^/]+)\/imagenes$/,
    (id) => (exigirProyecto(id), listarArchivos(ruta('public', id, 'imagenes'), `${id}/imagenes`)),
  ],
  ['GET', /^\/api\/creditos$/, () => creditos()],
  ['GET', /^\/api\/pedidos$/, () => pedidos()],
  ['POST', /^\/api\/pedidos$/, (_, cuerpo) => ({ archivo: crearPedido(JSON.parse(cuerpo)) })],
  ['PUT', /^\/api\/pedidos\/([^/]+)$/, (archivo, cuerpo) => editarPedido(archivo, JSON.parse(cuerpo))],
  ['POST', /^\/api\/pedidos\/borrar-hechos$/, () => borrarPedidosHechos()],
  [
    'DELETE',
    /^\/api\/pedidos\/([^/]+)$/,
    (archivo) => {
      if (!/^[\w-]+\.json$/.test(archivo)) throw Object.assign(new Error('Pedido no válido'), { estado: 400 });
      if (trabajoClaude?.pedido === archivo) throw Object.assign(new Error('Primero detén este video'), { estado: 409 });
      rmSync(join(carpetaPedidos, archivo), { force: true });
      rmSync(join(carpetaPedidos, archivo.replace(/\.json$/, '')), { recursive: true, force: true });
      return { ok: true };
    },
  ],
  ['GET', /^\/api\/claude$/, () => estadoClaude()],
  ['POST', /^\/api\/claude\/detener$/, () => detenerPedido()],
  ['POST', /^\/api\/pedidos\/([^/]+)\/empezar$/, (archivo) => (empezarPedido(archivo), estadoClaude())],
  ['GET', /^\/api\/marca$/, () => leerJson(ruta('marca.json'))],
  ['PUT', /^\/api\/marca$/, (_, cuerpo) => (guardarMarca(JSON.parse(cuerpo)), leerJson(ruta('marca.json')))],
];

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const camino = decodeURIComponent(url.pathname);

    if (camino === '/') return void res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(HTML);
    if (camino === '/app.js') return void res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' }).end(paquete.js);
    if (camino === '/app.css') return void res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-cache' }).end(paquete.css);
    if (camino === '/eventos') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(`data: ${JSON.stringify({ tipo: 'hola', version: paquete.version, error: paquete.error })}\n\n`);
      clientes.add(res);
      req.on('close', () => clientes.delete(res));
      return;
    }
    if (camino.startsWith('/public/')) return servirArchivo(req, res, ruta('public'), camino.slice('/public/'.length));
    if (camino.startsWith('/listos/')) return servirArchivo(req, res, ruta('listos'), camino.slice('/listos/'.length));

    // Imágenes de los pedidos (solo imágenes, nunca los JSON).
    if (camino.startsWith('/pedidos/') && /\.(png|jpe?g|webp|gif)$/i.test(camino)) {
      return servirArchivo(req, res, carpetaPedidos, camino.slice('/pedidos/'.length));
    }
    const subida = req.method === 'POST' && /^\/api\/pedidos\/([^/]+)\/imagenes$/.exec(camino);
    if (subida) {
      const uso = url.searchParams.get('uso');
      return json(res, 200, guardarImagenPedido(subida[1], req.headers['content-type'], uso, await leerCuerpo(req, 15 * 1024 * 1024)));
    }
    if (req.method === 'POST' && camino === '/api/musica') {
      const extension = TIPOS_MUSICA[req.headers['content-type']];
      if (!extension) throw invalido('La música debe ser MP3, WAV, M4A u OGG');
      const datos = await leerCuerpo(req, 40 * 1024 * 1024);
      const nombre = guardarSubida(ruta('public', 'musica'), nombreSeguro(url.searchParams.get('nombre'), 'cancion'), extension, datos);
      return json(res, 200, { archivo: `musica/${nombre}` });
    }
    const subidaImagen = req.method === 'POST' && /^\/api\/proyectos\/([^/]+)\/imagenes$/.exec(camino);
    if (subidaImagen) {
      exigirProyecto(subidaImagen[1]);
      const extension = TIPOS_IMAGEN[req.headers['content-type']];
      if (!extension) throw invalido('Las imágenes deben ser PNG, JPG, WEBP o GIF');
      const datos = await leerCuerpo(req, 15 * 1024 * 1024);
      const carpeta = ruta('public', subidaImagen[1], 'imagenes');
      const nombre = guardarSubida(carpeta, nombreSeguro(url.searchParams.get('nombre'), 'imagen'), extension, datos);
      return json(res, 200, { archivo: `${subidaImagen[1]}/imagenes/${nombre}` });
    }
    if (req.method === 'POST' && camino === '/api/marca/logo') {
      guardarLogo(req.headers['content-type'], await leerCuerpo(req));
      return json(res, 200, leerJson(ruta('marca.json')));
    }
    for (const [metodo, patron, manejar] of rutas) {
      const coincide = req.method === metodo && patron.exec(camino);
      if (coincide) {
        const cuerpo = ['PUT', 'POST'].includes(metodo) ? (await leerCuerpo(req)).toString('utf8') || '{}' : '';
        return json(res, 200, await manejar(coincide[1], cuerpo));
      }
    }
    json(res, 404, { error: 'No encontrado' });
  } catch (error) {
    json(res, error.estado ?? 500, { error: error.message });
  }
});

for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => {
    trabajoClaude?.proceso.kill('SIGTERM');
    process.exit(0);
  });
}

servidor.listen(PUERTO, '127.0.0.1', () => {
  console.log(`Estudio abierto en http://localhost:${PUERTO}`);
});
