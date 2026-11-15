// BitBang · La física en disputa: colores, letras y datos de la serie.
// Los 24 capítulos usan este kit; cada video solo cambia sus escenas y textos.
import { loadFont as cargarCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as cargarJetBrains } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as cargarGrotesk } from '@remotion/google-fonts/SpaceGrotesk';

export const bb = {
  fondo: '#0B0F1A',
  /** Acento principal */
  ambar: '#F5A623',
  /** Detalles de época griega, sellos, marcos */
  terracota: '#C4572A',
  terracotaOscura: '#8E3D1E',
  terracotaClara: '#E07A45',
  hueso: '#F4EFE6',
  /** Etiquetas tipo terminal, contador, píxeles */
  verde: '#39FF88',
  /** Reservado para las temporadas modernas: casi no usarlo */
  cian: '#3DD6F5',
  noche: '#121829',
  nocheClara: '#1A2238',
  tinta: '#05080F',
};

// Solo los pesos que se usan. loadFont espera a que la letra cargue antes de dibujar.
export const letra = {
  /** Títulos y fechas: aire clásico */
  titulo: cargarCinzel('normal', { weights: ['700', '900'], subsets: ['latin', 'latin-ext'] }).fontFamily,
  /** Subtítulos y texto principal */
  texto: cargarGrotesk('normal', { weights: ['700'], subsets: ['latin', 'latin-ext'] }).fontFamily,
  /** Etiquetas tipo terminal y contador */
  mono: cargarJetBrains('normal', { weights: ['500', '700'], subsets: ['latin', 'latin-ext'] }).fontFamily,
};

export const SERIE = { nombre: 'BITBANG', lema: 'LA FÍSICA EN DISPUTA', capitulos: 24 };

/** Zona segura para TikTok/Reels: nada importante fuera de este rectángulo. */
export const SEGURA = { arriba: 150, abajo: 1620, izquierda: 60, derecha: 1020 };
