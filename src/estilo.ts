import * as Inter from '@remotion/google-fonts/Inter';
import * as Lexend from '@remotion/google-fonts/Lexend';
import * as Montserrat from '@remotion/google-fonts/Montserrat';
import * as Nunito from '@remotion/google-fonts/Nunito';
import * as Outfit from '@remotion/google-fonts/Outfit';
import * as Poppins from '@remotion/google-fonts/Poppins';
import * as Rubik from '@remotion/google-fonts/Rubik';
import * as Sora from '@remotion/google-fonts/Sora';
import marca from '../marca.json';

// La marca (colores, fuente, logo, cuenta) se edita desde el Estudio y vive en marca.json.

// Cada fuente tiene sus propios tipos; aquí solo importa lo común a todas.
type ModuloFuente = {
  getInfo: () => { fonts: { normal?: Record<string, unknown> } };
  loadFont: (estilo: 'normal', opciones: { weights: string[]; subsets: string[] }) => { fontFamily: string };
};
const FUENTES = { Montserrat, Poppins, Nunito, Rubik, Outfit, Sora, Lexend, Inter } as unknown as Record<string, ModuloFuente>;
export const FUENTES_DISPONIBLES = Object.keys(FUENTES);

// Solo se cargan los pesos gruesos (700 en adelante), que son los que usan los videos.
const cargarFuente = (modulo: ModuloFuente) => {
  const pesos = Object.keys(modulo.getInfo().fonts.normal ?? {}).filter((p) => Number(p) >= 700);
  return modulo.loadFont('normal', { weights: pesos, subsets: ['latin', 'latin-ext'] }).fontFamily;
};

export const fontFamily = cargarFuente(FUENTES[marca.fuente] ?? FUENTES.Montserrat);

export const ANCHO = 1080;
export const ALTO = 1920;
/** Centro de la zona de dibujo, debajo de los subtítulos. */
export const CENTRO = { x: 540, y: 1080 };

export const color = {
  // Colores de marca: fondo, fondo2, texto, acento, coral, turquesa (marca.json)
  ...marca.colores,
  // Colores de los dibujos
  tenue: '#8C97AD',
  hierro: '#667184',
  hierroClaro: '#9AA5B8',
  hierroOscuro: '#3A4252',
  suelo: '#1E2534',
  hueco: '#030509',
};

export { marca };
