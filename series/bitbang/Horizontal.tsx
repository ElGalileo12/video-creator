// BitBang en horizontal (YouTube): varios capítulos seguidos en un solo video (ver src/VideoHorizontal.tsx).
// Entre capítulos va un puente (`crearPuente`, escena «puente-n») en vez de la tarjeta «CAP n»: en cada uno las
// estrellas del fondo pasan rápido, como en un viaje. Arriba a la izquierda, «BITBANG · <hito>» del capítulo.
// Un video de especiales usa `crearPuenteRuta` (sin línea del tiempo ni griego) y `crearEstiloHorizontal(nombres)`.
import type { FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ALTO_H, ANCHO_H } from '../../src/horizontal';
import type { EstiloVideo, TiempoEscena, Tiempos } from '../../src/tipos';
import { Lineas } from './Encima';
import { Estrellas } from './Fondo';
import { HITOS } from './LineaDeTiempo';
import { Puente } from './Puente';
import { PuenteRuta } from './PuenteRuta';
import type { PalabraTitulo } from './Tarjeta';
import { bb, letra, SERIE } from './tema';

const dibujoDe = (e: TiempoEscena) => e.dibujo ?? e.id;
/** Número de capítulo de una escena de puente («puente-3» → 3), o null si no es un puente. */
const puenteDe = (e: TiempoEscena) => Number(/^puente-(\d+)$/.exec(dibujoDe(e))?.[1] ?? 0) || null;

/** Escena de puente del capítulo `capitulo`: la voz dice el título (sin «Capítulo n»). */
export const crearPuente = (capitulo: number, titulo: PalabraTitulo[], tamano?: number): FC => {
  const PuenteCapitulo: FC = () => <Puente capitulo={capitulo} titulo={titulo} tamano={tamano} />;
  return PuenteCapitulo;
};

/** Escena de puente de un video de especiales: la parte `parte` de `partes` (nombres cortos, en orden). */
export const crearPuenteRuta = (parte: number, partes: string[], titulo: PalabraTitulo[], tamano?: number): FC => {
  const PuenteParte: FC = () => <PuenteRuta parte={parte} partes={partes} titulo={titulo} tamano={tamano} />;
  return PuenteParte;
};

// --- Viaje por las estrellas en cada puente -----------------------------------------------------------------

const VIAJE = { sube: 8, queda: 16, baja: 34, fuerza: 70 };

/** Rapidez extra del viaje (0–1) a `t` fotogramas de empezado un puente. */
const empuje = (t: number) =>
  t < 0 || t > VIAJE.baja
    ? 0
    : t < VIAJE.sube
      ? t / VIAJE.sube
      : t < VIAJE.queda
        ? 1
        : 1 - (t - VIAJE.queda) / (VIAJE.baja - VIAJE.queda);

const FondoViaje: FC<{ tiempos: Tiempos }> = ({ tiempos }) => {
  const f = useCurrentFrame();
  const puentes = tiempos.escenas.filter((e) => puenteDe(e)).map((e) => Math.round(e.inicio * tiempos.fps));
  let viaje = f;
  let rapidez = 0;
  for (const p of puentes) {
    if (p > f) break;
    for (let t = 0; t < Math.min(f - p, VIAJE.baja); t++) viaje += VIAJE.fuerza * empuje(t);
    rapidez = Math.max(rapidez, empuje(f - p));
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 50% 80%, ${bb.nocheClara} 0%, ${bb.fondo} 70%)` }}>
      <Estrellas ancho={ANCHO_H} alto={ALTO_H} viaje={viaje} estela={VIAJE.fuerza * 4 * rapidez} />
    </AbsoluteFill>
  );
};

// --- Lo que va encima: líneas de pantalla vieja e insignia del capítulo --------------------------------------

/**
 * «BITBANG · TALES_» arriba a la izquierda: de qué capítulo es lo que se ve, sin número. Se oculta en puentes y cierre.
 * `nombres` cambia el de cada capítulo (por defecto, el hito de la línea del tiempo).
 */
const Insignia: FC<{ tiempos: Tiempos; nombres?: string[] }> = ({ tiempos, nombres }) => {
  const f = useCurrentFrame();
  const { fps, escenas } = tiempos;
  const i = escenas.findLastIndex((e) => Math.round(e.inicio * fps) <= f);
  const escena = escenas[Math.max(0, i)];
  if (!escena || puenteDe(escena) || dibujoDe(escena).endsWith('cierre')) return null;
  const capitulo = escenas.slice(0, i + 1).reduce((n, e) => puenteDe(e) ?? n, 1);
  const anterior = escenas[i - 1];
  // Aparece suave después de un puente; entre escenas del mismo capítulo queda fija.
  const opacidad = anterior && !puenteDe(anterior) ? 1 : interpolate(f - Math.round(escena.inicio * fps), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const cursor = Math.floor(f / 15) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        top: 40,
        padding: '6px 14px',
        border: `2px solid ${bb.verde}55`,
        background: 'rgba(5,8,15,0.55)',
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 1,
        color: bb.verde,
        textShadow: `0 0 14px ${bb.verde}66`,
        whiteSpace: 'pre',
        opacity: opacidad,
      }}
    >
      {`${SERIE.nombre} · ${(nombres ?? HITOS.map((h) => h.nombre))[capitulo - 1] ?? SERIE.lema}`}
      <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
    </div>
  );
};

/** Estilo de un video horizontal de BitBang; `nombres` es lo que dice la insignia en cada capítulo (ver `Insignia`). */
export const crearEstiloHorizontal = (nombres?: string[]): EstiloVideo => {
  const EncimaHorizontal: FC<{ tiempos: Tiempos }> = ({ tiempos }) => (
    <AbsoluteFill>
      <Lineas />
      <Insignia tiempos={tiempos} nombres={nombres} />
    </AbsoluteFill>
  );
  return {
    fuente: letra.texto,
    subtitulos: { fuente: letra.texto, resaltado: 'contorno', apagar: true },
    horizontal: { Fondo: FondoViaje, Encima: EncimaHorizontal },
  };
};

/** Estilo de un video horizontal de BitBang (capítulos de la línea del tiempo). */
export const estiloBitBangHorizontal = crearEstiloHorizontal();
