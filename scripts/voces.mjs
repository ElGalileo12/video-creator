// Voces de ElevenLabs.
// Uso:
//   pnpm voces                     → las voces de tu cuenta (las que ya puedes usar)
//   pnpm voces buscar [palabra] → voces en español de la biblioteca → catalogo-voces.html
//   pnpm voces agregar <id>     → añade a tu cuenta una voz del catálogo

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'https://api.elevenlabs.io';
const raiz = new URL('..', import.meta.url).pathname;
const rutaCache = join(raiz, '.cache', 'biblioteca-voces.json');

const salir = (mensaje) => {
  console.error(`\n${mensaje}`);
  process.exit(1);
};

try {
  process.loadEnvFile(join(raiz, '.env'));
} catch {
  // Se avisa abajo si falta la clave.
}
const clave = process.env.ELEVENLABS_API_KEY?.trim();
if (!clave) salir('Falta la clave de ElevenLabs: pégala en el archivo .env, después de ELEVENLABS_API_KEY=');

const pedir = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: { 'xi-api-key': clave, 'Content-Type': 'application/json', ...opciones.headers },
  });
  const cuerpo = await respuesta.text();
  if (respuesta.status === 401) salir(`La clave de ElevenLabs no funciona. Revisa el archivo .env.\n${cuerpo}`);
  if (!respuesta.ok) salir(`ElevenLabs respondió con error ${respuesta.status}:\n${cuerpo}`);
  return JSON.parse(cuerpo);
};

const escapar = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Datos de la voz en español (acento y muestra), si la voz tiene una versión verificada en español.
const enEspanol = (v) => v.verified_languages?.find((l) => l.language === 'es');

// --- Mis voces -----------------------------------------------------------------

const misVoces = async () => {
  const { voices } = await pedir('/v2/voices?page_size=100');
  console.log(`Tienes ${voices.length} voces:\n`);
  for (const v of voices) {
    const etiquetas = [v.labels?.gender, v.labels?.age, v.labels?.accent].filter(Boolean).join(', ');
    console.log(`${v.name.padEnd(28)} ${v.voice_id}  ${etiquetas}`);
  }
  console.log('\nPara usar una, pon en el guion: "voz": { "proveedor": "elevenlabs", "id": "<id>", "nombre": "<nombre>" }');
};

// --- Buscar en la biblioteca ---------------------------------------------------

const buscar = async (palabra) => {
  const voces = [];
  for (let pagina = 0; pagina < 3; pagina++) {
    const filtros = new URLSearchParams({
      language: 'es',
      page_size: '100',
      sort: 'usage_character_count_1y',
      page: String(pagina),
    });
    if (palabra) filtros.set('search', palabra);
    const datos = await pedir(`/v1/shared-voices?${filtros}`);
    voces.push(...datos.voices);
    if (!datos.has_more) break;
  }
  if (voces.length === 0) salir('No encontré voces con esa búsqueda.');

  mkdirSync(join(raiz, '.cache'), { recursive: true });
  writeFileSync(rutaCache, JSON.stringify(voces, null, 2));
  writeFileSync(join(raiz, 'catalogo-voces.html'), catalogo(voces, palabra));

  const porAcento = {};
  for (const v of voces) {
    const acento = enEspanol(v)?.accent ?? v.accent ?? 'sin dato';
    porAcento[acento] = (porAcento[acento] ?? 0) + 1;
  }
  console.log(`Encontré ${voces.length} voces en español:`);
  for (const [acento, n] of Object.entries(porAcento).sort((a, b) => b[1] - a[1])) console.log(`  ${acento}: ${n}`);
  console.log('\nÁbrelas y escúchalas en catalogo-voces.html');
  console.log('Para usar una: pnpm voces agregar <id>');
};

const catalogo = (voces, palabra) => {
  const tarjetas = voces
    .map((v) => {
      const es = enEspanol(v);
      const acento = es?.accent ?? v.accent ?? '';
      const genero = (v.gender ?? '').toLowerCase();
      const etiquetas = [
        genero === 'female' ? 'mujer' : genero === 'male' ? 'hombre' : genero,
        v.age,
        acento,
        v.descriptive,
        v.use_case?.replaceAll('_', ' '),
      ].filter(Boolean);
      return `
      <article data-genero="${escapar(genero)}" data-acento="${escapar(acento)}">
        <header>
          <h2>${escapar(v.name)}</h2>
          ${v.free_users_allowed === false ? '<span class="pago">solo planes de pago</span>' : ''}
        </header>
        <p class="etiquetas">${etiquetas.map((e) => `<span>${escapar(e)}</span>`).join('')}</p>
        <p class="descripcion">${escapar(v.description)}</p>
        <audio controls preload="none" src="${escapar(es?.preview_url ?? v.preview_url)}"></audio>
        <p class="id"><code>${escapar(v.voice_id)}</code><button data-id="${escapar(v.voice_id)}">Copiar id</button></p>
      </article>`;
    })
    .join('');

  const acentos = [...new Set(voces.map((v) => enEspanol(v)?.accent ?? v.accent).filter(Boolean))].sort();

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catálogo de voces</title>
<style>
  :root { --fondo: #f6f4ef; --tarjeta: #fff; --texto: #1b1f2a; --tenue: #687083; --borde: #e3e0d8; --acento: #e0a400; }
  @media (prefers-color-scheme: dark) {
    :root { --fondo: #0c1322; --tarjeta: #16203a; --texto: #f6f1e7; --tenue: #8c97ad; --borde: #26314d; --acento: #ffc83d; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px 48px; background: var(--fondo); color: var(--texto); font: 15px/1.45 system-ui, sans-serif; }
  main { max-width: 1100px; margin: 0 auto; }
  h1 { margin: 0 0 4px; font-size: 26px; }
  .sub { margin: 0 0 18px; color: var(--tenue); }
  .filtros { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .filtros button, .filtros select { font: inherit; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--borde); background: var(--tarjeta); color: var(--texto); cursor: pointer; }
  .filtros button[aria-pressed="true"] { background: var(--acento); border-color: var(--acento); color: #1b1f2a; }
  .grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  article { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
  article header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  h2 { margin: 0; font-size: 17px; }
  .pago { font-size: 12px; color: var(--tenue); white-space: nowrap; }
  .etiquetas { margin: 0; display: flex; flex-wrap: wrap; gap: 4px; }
  .etiquetas span { font-size: 12px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--borde); color: var(--tenue); }
  .descripcion { margin: 0; color: var(--tenue); font-size: 13px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  audio { width: 100%; }
  .id { margin: 0; display: flex; gap: 8px; align-items: center; justify-content: space-between; }
  code { font-size: 12px; color: var(--tenue); overflow-wrap: anywhere; }
  .id button { font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--borde); background: transparent; color: var(--texto); cursor: pointer; }
</style>
</head>
<body>
<main>
  <h1>Catálogo de voces en español</h1>
  <p class="sub">${voces.length} voces de la biblioteca de ElevenLabs${palabra ? ` · búsqueda: “${escapar(palabra)}”` : ''}. Dale play para escuchar cada una.
    Ojo: con el plan gratis estas voces no se pueden usar desde la fábrica; hace falta el plan Creator o cargar 5 USD de créditos.</p>
  <div class="filtros">
    <button data-genero="" aria-pressed="true">Todas</button>
    <button data-genero="female" aria-pressed="false">Mujeres</button>
    <button data-genero="male" aria-pressed="false">Hombres</button>
    <select aria-label="Acento">
      <option value="">Todos los acentos</option>
      ${acentos.map((a) => `<option value="${escapar(a)}">${escapar(a)}</option>`).join('')}
    </select>
  </div>
  <div class="grilla">${tarjetas}</div>
</main>
<script>
  let genero = '';
  let acento = '';
  const filtrar = () => {
    for (const t of document.querySelectorAll('article')) {
      t.hidden = (genero && t.dataset.genero !== genero) || (acento && t.dataset.acento !== acento);
    }
  };
  for (const b of document.querySelectorAll('.filtros button')) {
    b.addEventListener('click', () => {
      genero = b.dataset.genero;
      document.querySelectorAll('.filtros button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      filtrar();
    });
  }
  document.querySelector('.filtros select').addEventListener('change', (e) => { acento = e.target.value; filtrar(); });
  for (const b of document.querySelectorAll('.id button')) {
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.id); b.textContent = '¡Copiado!'; }
      catch { b.textContent = 'Cópialo a mano'; }
      setTimeout(() => (b.textContent = 'Copiar id'), 1500);
    });
  }
  // Solo una muestra suena a la vez.
  document.addEventListener('play', (e) => {
    for (const a of document.querySelectorAll('audio')) if (a !== e.target) a.pause();
  }, true);
</script>
</body>
</html>
`;
};

// --- Agregar una voz de la biblioteca --------------------------------------------

const agregar = async (id) => {
  if (!id) salir('Uso: pnpm voces agregar <id>');
  if (!existsSync(rutaCache)) salir('Primero busca voces con: pnpm voces buscar');
  const voz = JSON.parse(readFileSync(rutaCache, 'utf8')).find((v) => v.voice_id === id);
  if (!voz) salir(`La voz ${id} no está en el último catálogo. Búscala de nuevo con: pnpm voces buscar`);

  const { voice_id } = await pedir(`/v1/voices/add/${voz.public_owner_id}/${voz.voice_id}`, {
    method: 'POST',
    body: JSON.stringify({ new_name: voz.name }),
  });
  console.log(`Listo: "${voz.name}" ya está en tu cuenta.\n`);
  console.log('Para usarla, pon esto en "voz" del guion:');
  console.log(JSON.stringify({ proveedor: 'elevenlabs', id: voice_id, nombre: voz.name }));
};

// --- Inicio ------------------------------------------------------------------------

const [accion, valor] = process.argv.slice(2).filter((a) => a !== '--');
if (!accion) await misVoces();
else if (accion === 'buscar') await buscar(valor);
else if (accion === 'agregar') await agregar(valor);
else salir('Uso: pnpm voces | pnpm voces buscar [palabra] | pnpm voces agregar <id>');
