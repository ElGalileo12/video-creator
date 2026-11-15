// Kit de Gali Esport: todo lo que se repite en los videos de la marca, para no rehacerlo en cada uno.
// (Igual que series/bitbang para la serie de física.) Un video nuevo de Gali Esport importa de aquí:
//   import { Camilo, Daniel, Cancha, Cielo, Celular, MarcaFinal, ... } from '../../series/gali-esport';
//
// - tema.ts          colores de la marca y de la app, letras (Montserrat, a mano, sistema), datos de la Copa Galileo.
// - marca.tsx        el isotipo, el bloque «GALI / ESPORT» y `MarcaFinal` (el logo del cierre).
// - personajes.tsx   Camilo (el organizador), Daniel (el entrenador de la Sub-14), Sergio (papá de Mateo), Mateo y otros niños.
// - escenario.tsx    el cielo del atardecer y la cancha en perspectiva.
// - celular.tsx      el celular en grande y el toque de un dedo.
// - whatsapp.tsx     globos, notas de voz, el grupo «Copa Galileo 🏆», un chat de uno a uno, las burbujas grandes y
//                    el aviso de Gali Esport al publicar un evento (`PantallaAvisoGali`, con «Voy / No voy / Tal vez»).
// - papeles.tsx      cuaderno escrito a mano, la planilla de juego de papel, pensamientos, respuestas y etiquetas.
// - computador.tsx   la app en el monitor (con cámara), el velo de los subtítulos, el puntero y los clics.
// - animar.ts        recorridos de cámara y de puntero, texto que se escribe, tiempos de un clic.
// - organizador.tsx  rol organizador: menú, detalle del torneo (encabezado, pestañas) y su Resumen.
// - invitaciones.tsx panel «Invitar Coach», pestañas Invitaciones y Equipos, plantilla y el aviso verde de la app.
// - correo.tsx       la invitación por correo en el celular y la página «¡Invitación aceptada!».
// - fases.tsx        pestaña «Fases y partidos» (sin fases, la fase con sus tarjetas de partido) y las ventanas
//                    «Nueva fase», «Nuevo partido» y «Editar partido» (fecha, hora y sede).
// - envivo.tsx       el partido en vivo del organizador: tablero («Anotar gol», tarjetas, eventos, «Finalizar partido»),
//                    el selector «¿Quién anotó?» y el Resumen de un torneo en juego.
// - publica.tsx      la página pública del torneo en el celular (encabezado, pestañas, partido en vivo, detalle con la
//                    línea de tiempo y la tabla del grupo).
// - noche.tsx        la noche en el escritorio: lámpara, taza y el portátil con una hoja de cálculo.
// - calendario.tsx   pestaña «Calendario» del torneo (vista Mes con insignias, Próximos partidos, Leyenda, detalle de un
//                    día) y el «Calendario» general del menú (todos los torneos, filtros).
// - partidos.ts      los 8 equipos y los 12 partidos de la Copa Galileo en noviembre, sus sedes, los otros torneos de
//                    Camilo y las fechas como las escribe la app.
// - equipos.ts       coaches, equipos y la plantilla Sub-14 (inventados, siempre los mismos) y colores de la app.
// - publicar.tsx    la ventana «Publicar torneo» (los 8 requisitos, «Publicar ahora») y el aviso «¡Tu torneo está listo!».
// - entrenador.tsx  rol entrenador en la computadora (1280 × 1040): menú, Mi Escuela con «Mis torneos», Equipo y «Crear evento».
// - jugador.tsx     rol jugador en la computadora: menú y Novedades («Eventos del equipo», evento destacado, «Confirmado»).
//                   La página pública de escritorio está en publica.tsx (`PaginaPublicaEscritorio`).
// - registro.tsx  crear la cuenta en el navegador del celular (versión móvil, 390 px): inicio, registro con la pista de
//                   la contraseña, «Revisa tu correo», el correo de verificación, inicio de sesión, la ventana genérica
//                   para elegir cuenta (Google), el selector de rol con sus tres roles y «Entrando a tu panel». Usa las
//                   letras actuales de la app (letras.ts: Instrument Sans, Schibsted Grotesk, JetBrains Mono).
// - ventana.tsx     la ventana del navegador de computador (pestañas, barra de dirección con candado, línea de carga), la
//                   `Vista` (cámara sobre la página de 1280 de ancho), el puntero con flecha o manito, la onda del clic y
//                   un `Realce` (anillo). Para tutoriales en escritorio dentro del video vertical.
// - escuela-publica.tsx  el perfil público de una escuela en escritorio (Academia Fénix Bogotá): encabezado con portada,
//                   escudo, insignia de verificada, chips, bio y marcador; pestañas; Noticias, Información y Cuerpo
//                   técnico. Datos de ejemplo (`ACADEMIA`, `PERFIL_COMPLETO`) e imágenes dibujadas (escudo del fénix,
//                   portada de cancha, avatares ilustrados).
// - escuela-panel.tsx    el entrenador en escritorio armando su escuela: menú y barra, Mi Escuela (portada, logo, banner
//                   del registro legal, pestaña Información, columna derecha con Apariencia y Equipo técnico), el panel
//                   «Bienvenido» → «Crear escuela», la ficha del equipo técnico y el panel «Registro legal».
// - solicitud.tsx  «Solicitar unirme» en escritorio: la ventana «Únete a …» con el formulario (acudiente, datos del
//                   jugador, categoría «Sugerida», mensaje), «Último paso: inicia sesión o regístrate», «Enviando…» y
//                   «¡Solicitud enviada!», y el inicio de sesión de computador (foto de cancha y tarjeta de 448 px).
// - admin.tsx       el administrador en escritorio (página de 1280): menú con el contador de «Mensajes», barra, encabezado
//                   «Mensajes» con las pestañas de canales y la bandeja de TikTok: «Conecta la cuenta de TikTok», la página de
//                   autorización de TikTok, aviso verde, cuenta conectada, videos con sus comentarios (responder, «Gali»,
//                   «Ver 2 respuestas más»), conversaciones («Solicitud», no leídos) y el chat con la ventana de 48 h. Medidas
//                   fijas (`ADMIN`, `yPanel`…) para llevar el puntero. Para demos de revisión de apps (TikTok, Meta).
// - clubes.tsx      galiesport.com/clubes en escritorio («Tu escuela, cerca de ti.», «Escuelas cerca de mí», chips «A menos
//                   de … km», tarjetas de escuela con su distancia), la página de inicio de escritorio y la barra pública, y el
//                   aviso del navegador que pide la ubicación (`PermisoUbicacion`: «Bloquear / Permitir»).
// - canchas.tsx     «Canchas» del entrenador (los 4 pasos, «Agrega tu primera cancha», la lista con su mapa) y el panel
//                   «Nueva cancha» (nombre y sede, buscador, mapa con pin y zona, «Estoy aquí», tipo, horario del acta y
//                   el acta), con el mapa dibujado en colores de OpenStreetMap (`MapaCalles`). Menú: `MarcoEntrenador`
//                   con `menuActivo="Canchas"`.
// - usuarios.tsx    «Usuarios» del entrenador en escritorio (página de 1440, `ANCHO_U`): pestañas Miembros/Solicitudes, barra,
//                   filtros (estado, sede, categoría), la tabla con «Lesionado» y el menú «⋯», «Crear nueva categoría»,
//                   «Invitar nuevo miembro» (con su lista de categorías), «Importar invitaciones», Solicitudes con «Aprobar»,
//                   «Perfil de usuario» (lesión, paz y salvo), la ventana de lesión, la selección en grupo con «Enviar
//                   mensaje», la campanita con sus avisos, el globo de descarga del navegador y el Perfil del jugador con su
//                   tarjeta «Lesión». Datos de ejemplo de la Academia Fénix (`MIEMBROS_U`, `CATEGORIAS_U`).
// - torneos-entrenador.tsx  los torneos del entrenador en escritorio (página de 1440, dentro de `MarcoUsuarios` con `activo`):
//                   la invitación a un torneo («Cómo es el torneo», «Costos», «Aceptar invitación»), Partidos con «Partidos de
//                   torneo» («Asistiré» / «No asistiré», «Convocar jugadores», «N convocados») y el armador de plantillas
//                   simplificado, la ventana «Convocar al partido» y la convocatoria por WhatsApp (`PantallaConvocatoria`, con
//                   la plantilla nueva: «Convocatoria a partido», Voy / Tal vez / No voy). Datos: Copa Navidad Sub-13.
//                   En usuarios.tsx: el aviso del correo repetido al invitar, la solicitud configurable con «¡Copiado!» y la
//                   campanita con el aviso de torneo (trofeo).
// - organizador-panel.tsx  el ORGANIZADOR con el diseño ACTUAL de la app (colores --o-* en modo claro, acento cian, página de
//                   1440): marco (menú, barra, campanita con «Aceptaron tu invitación», soporte, toast), Inicio, Mis torneos,
//                   la ventana «Crear torneo» (Información / Fechas y cupos / Revisión, portada dibujada `PortadaCopa`), el
//                   encabezado oscuro del torneo con sus pestañas, el Resumen de un borrador y «Publicar torneo».
//                   Datos: Andrés Pardo y la Copa Fénix 2027. Desde `organizador-torneo`.
// - organizador-invitar.tsx  Invitaciones (tarjetas, «Reenviar», Resumen), el panel «Invitar Coach» («De mi lista» con
//                   «sin cuenta», «Invitar nuevo», mensajes verde y rojo), Equipos (cupo y «Distribución») y Contactos (libreta
//                   con favoritos). Datos: Carlos, Diana, Jorge, Natalia, Felipe, Andrés Peña, Camila Torres y Julián Vargas.
// - partidos-armador.tsx  «Partidos» del ENTRENADOR completo y fiel (página de 1440, colores naranjas de .matches-scope):
//                   encabezado (renombrar, «Fecha del partido», Guardado, Guardar plantilla), «Plantillas guardadas», barra
//                   (Categoría, Formación, «+ Nueva», «Fútbol 11», «En cancha · n/11»), «Convocados» (✚ ▪ $ XI S «Pend.»), la
//                   cancha con sus casillas por formación (`zonasDe`), «Alineación» (Titulares / Suplentes, la «C»), el aviso de la
//                   cancha llena, la ficha del jugador, las tarjetas que se arrastran, el cursor «no se puede» y las ventanas
//                   «Nueva plantilla» y «Nueva Formación». `geoArmador` / `geoAlineacion` dan las medidas. Datos: Academia Fénix,
//                   Sub-13 (18 + 1 invitado) y Sub-15. Desde `partidos-alineacion`.
// - partidos-jugador.tsx  Equipo → «Eventos del equipo» (1440) y «Crear evento» normal (tipo, sede, plantilla…); el jugador:
//                   menú, inicio (PlayerHeader, «Próximos eventos», «Detalles») y el detalle del partido con su alineación
//                   (LineupView: titular/suplente, Capitán, «Tú»). `MarcoUsuarios` acepta `menu` (el del jugador) y la
//                   campanita, `icono: 'calendario'`.
// - tresd.ts         ayudas para los momentos 3D (cámara, proyector, texturas con letra de la app). Se importa
//                    aparte (`from '../../series/gali-esport/tresd'`) para que los videos sin 3D no carguen three.
//
// Reglas de la marca: textos de la app idénticos a la original y cada pantalla con SUS colores. No mostrar
// «Link de inscripción», «Importar CSV» ni «Enviar mensaje al coach» (no funcionan). Las invitaciones van por correo.
// Tampoco «Re-sortear», la vista «Semana» del calendario ni «Exportar» del calendario general ni de la página pública.
// En el partido en vivo no se muestran «Penales», «Tiempo extra» ni alineaciones. La app no avisa de
// choques de horario ni de cancha: no insinuarlo. La sede de un partido es texto libre.
// El cierre de cada video es el logo (`MarcaFinal`). Los videos viejos tienen sus propias copias de estas piezas.
export * from './admin';
export * from './animar';
export * from './calendario';
export * from './celular';
export * from './computador';
export * from './correo';
export * from './entrenador';
export * from './envivo';
export * from './equipos';
export * from './escenario';
export * from './fases';
export * from './invitaciones';
export * from './jugador';
export * from './marca';
export * from './noche';
export * from './organizador';
export * from './papeles';
export * from './partidos';
export * from './personajes';
export * from './publica';
export * from './publicar';
export * from './registro';
export * from './letras';
export * from './tema';
export * from './whatsapp';
export * from './ventana';
export * from './escuela-publica';
export * from './escuela-panel';
export * from './solicitud';
export * from './clubes';
export * from './canchas';
export * from './usuarios';
export * from './torneos-entrenador';
export * from './organizador-panel';
export * from './organizador-invitar';
export * from './partidos-armador';
export * from './partidos-jugador';
