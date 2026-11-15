---
name: hacer-video
description: Crea un video animado nuevo de principio a fin (investigación, guion, voz, animación, revisión y render). Úsala cuando el usuario pida un video sobre un tema, o diga "haz los videos pendientes" (pedidos guardados desde el Estudio en pedidos/).
---

# Hacer un video

Sigue los pasos de CLAUDE.md ("Hacer un video nuevo"). Resumen y reglas extra:

1. **Pedido.** Si el usuario dice "haz los videos pendientes", lee `pedidos/*.json` con `"estado": "pendiente"`.
   Cambia su estado a `"en curso"` al empezar y a `"hecho"` (con `"proyecto": "<id>"`) al terminar.
   Respeta `detalles`, `duracion` (segundos) y `voz` (si es null, usa la voz del último video).
   **Imágenes** (`imagenes` del pedido, archivos en `pedidos/<pedido>/`): míralas todas con Read antes de escribir.
   - `"uso": "referencia"`: sirven para entender el tema, el objeto o el estilo; dibuja a partir de ellas.
   - `"uso": "video"`: cópialas a `public/<id>/` y muéstralas en la escena que les corresponda con `Foto`
     (`src/piezas.tsx`), haciéndolas aparecer en la palabra que las nombra.
   Si el usuario sube imágenes directo en el chat, trátalas igual (pregunta el uso si no queda claro).
2. **Investigar.** Busca el tema en la web y verifica cada dato en al menos una fuente confiable.
   Guarda las fuentes en `proyectos/<id>/fuentes.md`. Si un dato no se puede verificar, no lo uses.
3. **Guion** (`proyectos/<id>/guion.json`): español neutro latinoamericano, frases cortas.
   Gancho en la primera escena (pregunta o dato sorprendente, menos de 3 s), 7 a 10 escenas,
   cierre pidiendo seguir la cuenta. `id` del proyecto en minúsculas con guiones.
4. **Voz:** `pnpm voz <id>` (avisa los créditos que se gastarán si es ElevenLabs).
5. **Animación:** `proyectos/<id>/Escenas.tsx` + `index.ts`, y registrar en `src/proyectos.ts`.
   Las escenas simples (un dato, una lista, una foto, una comparación) pueden ir con `"plantilla"` en el guion:
   así el usuario las puede editar después en el Estudio sin pedírtelo. Las que explican algo visualmente
   (mecanismos, procesos) van dibujadas a medida.
   Cada movimiento arranca en la palabra que lo nombra (`useMomento`). Reutiliza `src/piezas.tsx`
   (`Pieza`, `Lienzo`, `Trazo`, `Suelo`, `Pildora`, `Foto`).
6. **Revisar:** `pnpm render <id> --revisar=...` con 1 o 2 fotogramas por escena; mira cada imagen
   y corrige lo que se vea mal (textos tapados, cosas fuera de cuadro, animaciones que no se entienden).
7. **Entregar:** `pnpm render <id>`. Dile al usuario que ya está en el Estudio (pestaña Videos).
8. **Categoría:** anota el video en `categorias.json` (`"videos": { "<id>": "<categoría>" }`): la del pedido
   (`categoria`) si la trae; si no, «Gali Esport» (videos de la app), «BitBang» (serie de física) o «Variados».
   Si es una categoría nueva, añádela también al final de `"orden"`. Si la categoría tiene divisiones
   (`"divisiones"`, p. ej. Gali Esport: Entrenador, Organizador, Jugador), anota también la del video en
   `"division": { "<id>": "<división>" }` según su protagonista (Daniel → Entrenador, Camilo → Organizador,
   un jugador → Jugador); si no está claro, pregúntale al usuario.
