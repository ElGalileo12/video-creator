import type { FC } from 'react';
import type { Encuadre } from './horizontal';

/** Tiempos en segundos, relativos al inicio de la escena. */
export type Palabra = { texto: string; inicio: number; fin: number };

/** Datos de una escena hecha con plantilla (ver src/plantillas.tsx). */
export type DatosPlantilla = { tipo: string } & Record<string, string | string[] | undefined>;

/** Música de fondo: archivo dentro de public/, volumen 0–1 y segundo de la canción donde empieza. */
export type Musica = { archivo: string; volumen: number; bajarConVoz: boolean; desde: number };

export type TiempoEscena = {
  id: string;
  texto: string;
  /** Ruta del audio dentro de public/. Vacía en la vista previa de una escena sin voz todavía. */
  audio: string;
  inicio: number;
  duracion: number;
  transicion: 'fundido' | 'corte';
  palabras: Palabra[];
  /** Usar el dibujo de otra escena (p. ej. al duplicar). Por defecto, el de su propio id. */
  dibujo?: string;
  /** Si existe, la escena se dibuja con esa plantilla en vez de con un dibujo a medida. */
  plantilla?: DatosPlantilla;
  /** Fin de la voz en segundos y firma de texto+voz (los escribe scripts/voz.mjs). */
  finVoz?: number;
  firma?: string;
};

export type Tiempos = { fps: number; duracion: number; escenas: TiempoEscena[]; musica?: Musica | null };

/**
 * Aspecto propio de un proyecto o de una serie (p. ej. BitBang). Lo que falte se toma de la marca.
 * `Fondo` y `Encima` se dibujan con el reloj del video completo, no con el de cada escena.
 */
export type EstiloVideo = {
  /** Familia de letra de todo el video (ya cargada con @remotion/google-fonts). */
  fuente?: string;
  /** Reemplaza al fondo de la marca. */
  Fondo?: FC;
  /** Capa fija por encima de todas las escenas: insignias, barra de progreso… */
  Encima?: FC;
  subtitulos?: {
    /** En el tercio de abajo (y ≈ 1340–1560) en vez de arriba. */
    abajo?: boolean;
    fuente?: string;
    /** 'pildora' (por defecto): la palabra que suena va sobre fondo de color. 'contorno': letras con borde oscuro y la que suena en color. */
    resaltado?: 'pildora' | 'contorno';
    /** Se apagan poco después de la última palabra de cada escena (útil para cerrar en bucle). */
    apagar?: boolean;
    /** Escenas sin subtítulos (p. ej. una tarjeta de título). */
    ocultarEn?: string[];
  };
  /** Solo para videos horizontales (ver src/VideoHorizontal.tsx). */
  horizontal?: {
    /** Escala y altura con que se ven las escenas verticales. Por defecto, `ENCUADRE_H` (src/horizontal.tsx). */
    encuadre?: Encuadre;
    /** Fondo y capa de encima del cuadro horizontal; reciben los tiempos (p. ej. para saber dónde hay un puente). */
    Fondo?: FC<{ tiempos: Tiempos }>;
    Encima?: FC<{ tiempos: Tiempos }>;
  };
};

export type Proyecto = {
  id: string;
  /** 'horizontal': video de YouTube (1920×1080) con escenas verticales colocadas en un escenario. Por defecto, vertical. */
  formato?: 'vertical' | 'horizontal';
  tiempos: Tiempos;
  /** Dibujos a medida, por id de escena. Las escenas con plantilla no necesitan uno. */
  escenas: Record<string, FC>;
  /** Solo en videos horizontales: dibujos que ocupan el cuadro horizontal entero, sin escenario ni subtítulos (p. ej. puentes). */
  escenasHorizontales?: Record<string, FC>;
  /**
   * `Dibujo` va debajo del título en la portada vertical. En un video horizontal es la miniatura entera (1280×720)
   * y recibe el título y la palabra destacada para escribirlos a su manera.
   */
  portada: { titulo: string; destacar: string; Dibujo: FC<{ titulo?: string; destacar?: string }> };
  /** Color de resaltado de los subtítulos y la portada. Por defecto, el acento de la marca. */
  acento?: string;
  estilo?: EstiloVideo;
};

