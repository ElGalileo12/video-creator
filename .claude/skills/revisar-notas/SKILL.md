---
name: revisar-notas
description: Aplica las notas que el usuario dejó en la línea de tiempo del Estudio (proyectos/<id>/notas.json). Úsala cuando diga «revisa mis notas», «aplica las notas», «he dejado notas» o algo parecido.
---

# Revisar las notas del Estudio

1. **Buscar notas pendientes:** `proyectos/*/notas.json` con `"estado": "pendiente"` (si el usuario nombra un video,
   solo ese). Cuéntale cuántas hay y en qué videos antes de empezar.
2. **Ubicar cada tramo:** la nota empieza `desde` segundos después del inicio de la escena `escena`
   (su `inicio` está en `proyectos/<id>/tiempos.json`) y dura `duracion`. Si la escena ya no existe, usa
   `inicio` (segundo absoluto). Fotograma = segundos × 30.
3. **Mirar antes de tocar:** `pnpm render <id> --revisar=<fotogramas del tramo>` y lee esos fotogramas.
   Si la nota trae `imagen` (ruta dentro de `public/`), mírala también.
4. **Aplicar lo pedido, solo en ese tramo:**
   - Texto, voz, orden, pausas, plantillas o música → `guion.json`, y luego `pnpm voz <id>`
     (si hay voz nueva de ElevenLabs, di cuántos créditos gastará).
   - Cambios visuales dentro de una escena a medida → `Escenas.tsx`, limitando el efecto a ese tramo
     (fotogramas relativos a la escena). Si la nota habla de algo que dice la voz, ánclalo con `useMomento`.
   - Si pide quitar algo, quítalo.
   - Si una nota es ambigua o no se puede hacer, no inventes: déjala `"pendiente"` y escribe en `respuesta`
     la pregunta concreta.
5. **Comprobar:** vuelve a sacar fotogramas del tramo, y uno justo antes y otro justo después, para confirmar
   que el cambio quedó solo donde se pidió.
6. **Marcar cada nota resuelta:** `"estado": "hecha"` y `respuesta` con 1 o 2 frases en español sencillo
   sobre lo que cambiaste. No borres notas: el usuario las borra desde el Estudio.
7. **Entregar:** `pnpm render <id>` para dejar el video al día, y resume al usuario qué hiciste con cada nota.
