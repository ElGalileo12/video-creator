# Fábrica de videos animados con Claude

Objetivo: escribirle a Claude "hazme un video sobre X" y recibir un video vertical
animado, con voz, subtítulos palabra por palabra, portada y texto del post.
Sin grabar y sin editar a mano.

## Referencia: resultaaquee.com (revisado el 18-oct-2026)

Lo que vende (49 € + IVA lanzamiento, luego 79 €, pago único):

- "Una carpeta con el programa que necesita tu IA": instrucciones y plantillas
  para Claude Code o Codex. El trabajo lo hace la IA con tu propia cuenta.
- Voz con ElevenLabs (cuenta aparte, ~0,25 € por video).
- Videos verticales 1080×1920 de ~30 s, temas de curiosidades
  ("¿por qué el gancho del metro está suelto?").
- Dibujos de objetos estilo 3D, fondo oscuro, subtítulos palabra por palabra
  con la palabra clave resaltada.
- Entrega: `video.mp4`, `portada.jpg`, `texto-del-post.txt`.
- Solo español de España e inglés.

Proceso que muestran: buscar información y fuentes → escribir el texto →
hacer los dibujos → animar cada frase en su palabra → revisar el video tres veces.

## Cómo lo hacemos nosotros

| Paso | Herramienta |
|---|---|
| Investigar y escribir el guion | Claude (búsqueda web) |
| Voz | Voz del Mac (pruebas) → ElevenLabs (con tiempos exactos por palabra) |
| Dibujos y animación | Remotion (videos hechos con código React), Three.js para 3D |
| Subtítulos palabra por palabra | Componente propio, usando los tiempos de la voz |
| Render | Remotion → MP4 1080×1920 |
| Revisión | Claude saca fotogramas, los mira y corrige |

Costo: $0 en software. Pagas solo la voz (si usas ElevenLabs) y tu plan de Claude.
Remotion es gratis para personas y empresas de hasta 3 personas.

## Fases

1. ✅ **Primer video de prueba** (18-oct-2026) — "¿Por qué las tapas de alcantarilla son redondas?",
   35 s, voz del Mac, 9 escenas animadas. Resultado en `listos/alcantarillas/`.
   - ✅ ElevenLabs conectado (18-oct-2026): voz "Will" (gratis) con el modelo Eleven v4 y tiempos
     exactos por palabra. Plan gratis: 10.000 créditos/mes, ~550 por video. Las voces nativas
     de la biblioteca necesitan cargar 5 USD o el plan Creator.
2. **Estilo propio** — fuente, colores, tipo de dibujo; catálogo de escenas reutilizables
   (objeto que aparece, zoom a un detalle, flecha que señala, comparación, número gigante).
3. **Un solo prompt** — empaquetarlo como skill de Claude Code: "hazme un video sobre X";
   ideas de temas, portada y texto del post incluidos.
4. **Extras** — música y efectos de sonido, voz con acento latino en ElevenLabs,
   formato horizontal para YouTube, 3D.

## A tener en cuenta

- Los primeros videos se verán más simples que los de referencia; la calidad sube
  ajustando el estilo en varias rondas.
- Cada video gasta bastante uso del plan de Claude (investigar, programar, revisar).
- Las vistas vienen sobre todo de buenos temas y buenos ganchos, no de la herramienta.
