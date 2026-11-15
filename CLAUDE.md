# Fábrica de videos

Videos verticales animados (1080×1920, ~30 s) hechos con código en Remotion, con voz,
subtítulos palabra por palabra, portada y texto del post. Plan por fases y referencia en PLAN.md.

El usuario habla español y no programa: responder en español, sin tecnicismos.

Gestor de paquetes: **pnpm** (nunca npm ni npx). Comandos sueltos con `pnpm exec`, p. ej. `pnpm exec tsc --noEmit -p .`.
Todas las librerías de Remotion van en la misma versión exacta (hoy 4.0.536).

## Hacer un video nuevo

1. **Guion** — `proyectos/<id>/guion.json` (mismo formato que `alcantarillas`).
   Una frase por escena; gancho en la primera; cierre pidiendo seguir la cuenta.
   - `"transicion": "corte"` cuando la escena continúa el dibujo de la anterior (sin fundido).
   - `"pausa": <segundos>` para dejar tiempo a una animación después de la voz (por defecto 0.4).
   - `"plantilla": { "tipo": "titulo" | "foto" | "numero" | "lista" | "comparacion", ... }`: escena sin código,
     editable desde el Estudio (campos en `src/plantillas.tsx`). Útil para escenas simples.
   - `"dibujo": "<id>"`: usar el dibujo a medida de otra escena (lo pone el Estudio al duplicar).
   - `"musica": { "archivo": "musica/x.mp3", "volumen": 0.2, "bajarConVoz": true, "desde": 0 }` (opcional).
   - `portada` (título + palabra destacada) y `post` (texto con hashtags).
   - **Sin voz** (demos con subtítulos fijos): `"voz": { "proveedor": "ninguna" }` → cada escena dura su `"pausa"`
     (hasta 60 s; también se elige «Sin voz» en el Estudio). `"salida": [1280, 720]` entrega el video a otro tamaño.
     Ejemplo: `proyectos/tiktok-admin-demo` (demo para la revisión de TikTok, en inglés, con su propia capa de subtítulos).
2. **Voz** — `pnpm voz <id>` → audio en `public/<id>/` y `proyectos/<id>/tiempos.json` (el orden, las duraciones,
   plantillas y música que dibuja el video; se rearma cada vez que cambia el guion).
3. **Animación** — `proyectos/<id>/Escenas.tsx` (un componente por escena, con el mismo id),
   `proyectos/<id>/index.ts`, y registrar el proyecto en `src/proyectos.ts`.
   - `useMomento('palabra')` → fotograma en que la voz dice esa palabra. Todo movimiento arranca ahí.
   - Animación: `resorte`, `tramo`, `golpe`, `mezclar` (`src/escena.tsx`).
   - Piezas: `Pieza`, `Lienzo`, `Trazo`, `Suelo`, `Pildora`, `Foto` (`src/piezas.tsx`). Colores y fuente: `src/estilo.ts`.
   - **Kits de marca y de serie** (`series/`): `series/gali-esport` (Camilo, Daniel, cancha, celular, WhatsApp,
     pantallas del organizador (y su panel actual en cian: crear torneo, invitar coaches, contactos), correo de invitación, ventana de navegador de computador, panel de administrador con la bandeja de TikTok, perfil público y Mi Escuela
     del entrenador, Clubes «cerca de mí», Canchas del entrenador, logo y cierre; guía en su `index.ts`) y `series/bitbang`.
     Los videos de esas series importan de ahí en vez de copiar piezas de otro proyecto; lo nuevo que pueda repetirse
     se agrega al kit. Los videos viejos guardan sus propias copias (no tocarlas).
   - Zona de dibujo centrada en (540, 1080). Subtítulos arriba (y ≈ 250–470).
     Dejar libres los ~300 px de abajo y el borde derecho (botones de TikTok/Reels).
   - **3D** (ejemplo completo: `proyectos/muestra-3d/Led3D.tsx`): `ThreeCanvas` de `@remotion/three` con `flat`,
     del tamaño del cuadro entero (1080×1920) para que no se noten bordes. La cámara se calcula por fotograma
     (nada de animaciones propias de three). Luces suaves: con mucho brillo todo sale blanco.
     Paso 2D↔3D: empezar con una vista de arriba que coincida con el dibujo 2D, fundir y luego inclinar la cámara;
     para volver, enderezar la cámara a la misma vista y fundir al dibujo 2D. Etiquetas y textos van en 2D encima,
     ubicadas con `proyectar()`. El render ya usa `gl: 'angle'` (`scripts/render.mjs`), necesario para el 3D.
4. **Revisar** — `pnpm render <id> --revisar=f1,f2,...` → fotogramas en `.revision/<id>/`.
   Mirarlos en los momentos clave de cada escena y corregir antes del render final.
5. **Entregar** — `pnpm render <id>` → `listos/<id>/video.mp4`, `portada.jpg`, `post.txt`.

## Videos completos (horizontales, YouTube)

Varios cortos unidos en un video de 1920×1080 (ejemplo: `proyectos/bitbang-serie-1`, caps 1–7 de BitBang).
Son proyectos normales con `"formato": "horizontal"` en su guion: se editan en el Estudio (apartado «Videos completos»)
con las mismas funciones que un corto, y se entregan con `pnpm render <id>` (video, miniatura 1280×720 y post).
- **Guion:** escenas «c<n>-<escena>» que copian texto, voz y pausa de cada corto, así sus voces salen de la memoria
  (el ejemplo se armó con su `armado.mjs`, que deja el audio y los tiempos de cada escena en `.cache/voz/<id>/`).
  `"capitulos"`: id de la escena donde empieza cada capítulo → nombre; el post usa `{capitulos}` (lista «0:00 Nombre»)
  y `{titulo}`. Una frase igual con la misma voz comparte audio (misma firma).
- **Dibujo:** `src/VideoHorizontal.tsx`. Cada dibujo vertical va en un `Escenario` (`src/horizontal.tsx`); lo que
  ocupa todo el ancho (suelo, mar, fondos, 3D con `LienzoTres`, destellos con `Cubrir`) se estira con `useMarco()`,
  que en vertical devuelve el lienzo de siempre (los cortos no cambian). `escenasHorizontales` del proyecto: escenas
  que ocupan el cuadro entero, sin subtítulos (p. ej. los puentes de `series/bitbang/Horizontal.tsx`).
  `portada.Dibujo` es la miniatura entera y recibe `titulo` y `destacar`. Revisar cada escena con `--revisar`.
- **Especiales unidos** (ejemplo: `proyectos/bitbang-estamos-solos`, Fermi → Próxima b → Drake → Gran Filtro → bosque oscuro):
  sin línea del tiempo ni griego, con `crearPuenteRuta` (ruta de las partes) y `crearEstiloHorizontal(nombres)`.
  Los puentes son frases nuevas con voz: `armado.mjs`, `pnpm voz`, `armado.mjs --puentes` (silencio delante) y `pnpm voz`.
  Si un fondo del corto solo llena el lienzo vertical y no conviene tocar el corto, el proyecto lo cubre con `Cubrir`.

## Estudio (interfaz del usuario)

`pnpm estudio` → http://localhost:4321 (abrirlo en el panel del navegador). Código en `estudio/`:
`servidor.mjs` (API, recarga en vivo, trabajos de voz/render) y `app/` (React + reproductor de Remotion).
- **Editor de cada video:** línea de tiempo con escenas como bloques (arrastrar para reordenar, duplicar, borrar,
  «+ Escena» con plantilla), panel de la escena (texto, campos de plantilla, voz, entrada, pausa), música de fondo
  (biblioteca común en `public/musica/`, la sube el usuario) y publicación. La vista previa muestra los cambios sin
  guardar (`estudio/app/vistaPrevia.ts`). Al guardar, si no hay voz que pagar, el servidor rearma `tiempos.json` solo.
- La línea de tiempo tiene regla hasta fotogramas, reloj con milisegundos, ◀ ▶ por fotograma, atajos
  (espacio, ←/→, Mayús+←/→), pista de voz (cada palabra en su tiempo) y **pista de notas**.
- **Notas para Claude** (`proyectos/<id>/notas.json`): el usuario marca un tramo y escribe qué quiere ahí.
  Cada nota: `escena` + `desde` (segundos dentro de esa escena), `duracion`, `inicio` (segundo absoluto, respaldo),
  `texto`, `imagen?`, `estado` (`pendiente`/`hecha`), `respuesta?`. Se aplican con la skill `revisar-notas`
  («revisa mis notas»). Las notas no afectan al video.
- **Videos completos** (`#/completos`): los horizontales, con miniatura ancha; el editor es el mismo, con reproductor
  16:9 y, en Publicación, la lista de capítulos de YouTube.
- Pide videos nuevos (quedan en `pedidos/`, con imágenes opcionales en `pedidos/<pedido>/`, de referencia o para
  usar en el video; mientras no estén hechos se editan con «Editar» en la lista de pendientes, `#/pedido/<pedido>`;
  «Borrar pedidos ya hechos» borra de una vez los que tienen `"estado": "hecho"`, con sus imágenes) y edita la marca (`marca.json`: colores, fuente, logo, cuenta).
- **Categorías** (`categorias.json`: `orden` y `videos` → id: categoría): la biblioteca filtra por ellas; sin categoría,
  un video va a «Variados». Se cambian desde Publicación o al pedir un video. Van aparte del guion para no marcar
  el video como cambiado. Una categoría puede tener **divisiones** (`divisiones`: categoría → lista; `division`:
  id → división): Gali Esport se parte en Entrenador (Daniel), Organizador (Camilo), Jugador y Tutoriales (cómo usar la app), y dentro de cada
  división los videos van del más antiguo al más nuevo (fecha de la carpeta del proyecto). Se cambia en Publicación.
- Cambiar algo en `src/` marca todos los videos como «Cambios sin renderizar» (el Estudio compara fechas); si el
  cambio no altera los cortos, comprobarlo con fotogramas antes de volver a darlos por listos.
Los pedidos se hacen con la skill `hacer-video`.
Si cambias `estudio/servidor.mjs`, reinicia el servidor; lo demás se recarga solo.

`pnpm studio` abre Remotion Studio (la herramienta técnica de Remotion, en inglés).

## Voces

- **Mac** (`"proveedor": "mac"`): gratis, para pruebas. Tiempos por palabra aproximados
  (se reparten por sílabas dentro de los tramos de voz que detecta el script).
- **ElevenLabs** (`"proveedor": "elevenlabs", "id": "<voice_id>"`): voz natural y tiempos exactos.
  La clave va en `.env` (`ELEVENLABS_API_KEY`); nunca leerla ni mostrarla.
  - `pnpm voces` → voces de la cuenta del usuario.
  - `pnpm voces buscar [palabra]` → voces en español de la biblioteca → `catalogo-voces.html` para escucharlas.
  - `pnpm voces agregar <id>` → añade a la cuenta una voz del catálogo.
  - Desde el 21-10-2026 la cuenta tiene plan Starter (30.000 créditos al mes): las voces de la biblioteca
    ya funcionan una vez agregadas con `pnpm voces agregar <id>` (hasta 10 en la cuenta).
    En BitBang cap 4 se usó Alberto Rodríguez (`l1zE9xgNpUTaQCZzpNJa`, latino neutro, narrador).
  - Modelo recomendado: `eleven_v4` (habla español y da tiempos por letra).
- Cada escena puede llevar su propio `"voz"` (diálogos, varias voces).
- **Memoria de voces** (`.cache/voz/<id>/<firma>.*`): toda voz generada se guarda por su firma (texto + voz).
  Reordenar, duplicar o volver a un texto anterior la recupera gratis. No borrar esa carpeta.

## Notas

- Al renderizar, Remotion necesita internet la primera vez (descarga su navegador) y para la fuente.
