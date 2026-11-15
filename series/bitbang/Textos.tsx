// Textos animados de la serie: letrero de terminal que se escribe letra por letra y frases que entran
// palabra por palabra (con la palabra clave en ámbar), contador, letrero con borde, línea de «Fuente: …» y el aviso
// «ILUSTRACIÓN» para lo que no es una imagen real.
import type { CSSProperties, FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { resorte } from '../../src/escena';
import { bb, letra } from './tema';

export type LineaTerminal = { texto: string; desde: number; hasta: number };

/** Texto verde de terminal que se escribe solo. Cada línea se escribe entre `desde` y `hasta` (fotogramas). */
export const Terminal: FC<{ x: number; y: number; lineas: LineaTerminal[]; tamano?: number; color?: string; prompt?: string; opacidad?: number }> = ({
  x, y, lineas, tamano = 44, color: c = bb.verde, prompt = '> ', opacidad = 1,
}) => {
  const frame = useCurrentFrame();
  const cursor = Math.floor(frame / 12) % 2 === 0;
  const activa = lineas.findLastIndex((l) => frame >= l.desde);
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: letra.mono, fontWeight: 700, fontSize: tamano, lineHeight: 1.45, color: c, textShadow: `0 0 18px ${c}55`, whiteSpace: 'pre', opacity: opacidad }}>
      {lineas.map((l, i) => {
        if (frame < l.desde) return null;
        const avance = Math.min(1, (frame - l.desde) / Math.max(1, l.hasta - l.desde));
        const visible = l.texto.slice(0, Math.round(avance * l.texto.length));
        return (
          <div key={i}>
            {prompt}
            {visible}
            {i === activa && <span style={{ opacity: cursor || avance < 1 ? 1 : 0 }}>_</span>}
          </div>
        );
      })}
    </div>
  );
};

export type PalabraFrase = { texto: string; desde: number; color?: string; tamano?: number; salto?: boolean };

/** Frase que entra palabra por palabra con un resorte ágil y un pequeño glitch verde al aparecer. */
export const Frase: FC<{ palabras: PalabraFrase[]; y: number; tamano?: number; fuente?: string; color?: string; style?: CSSProperties; salida?: number }> = ({
  palabras, y, tamano = 96, fuente = letra.texto, color: c = bb.hueso, style, salida,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fuera = salida === undefined ? 0 : Math.min(1, Math.max(0, (frame - salida) / 6));
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: y,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: '0 26px',
        fontFamily: fuente,
        fontWeight: 700,
        fontSize: tamano,
        lineHeight: 1.08,
        letterSpacing: -1,
        textAlign: 'center',
        opacity: 1 - fuera,
        transform: `translateY(${-fuera * 30}px)`,
        ...style,
      }}
    >
      {palabras.map((p, i) => {
        if (p.salto) return <div key={i} style={{ flexBasis: '100%', height: 0 }} />;
        const s = resorte(frame, p.desde, fps, { damping: 12, stiffness: 230, mass: 0.55 });
        const glitch = frame >= p.desde && frame < p.desde + 3;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontSize: p.tamano,
              color: glitch ? bb.verde : (p.color ?? c),
              opacity: Math.min(1, s * 1.6),
              transform: `translate(${glitch ? (i % 2 ? 8 : -8) : 0}px, ${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
              textShadow: '0 8px 30px rgba(0,0,0,0.65)',
            }}
          >
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

/** Contador de terminal en un recuadro («DATOS: 12»). `golpe` 0–1 lo hace latir en ámbar cuando sube. */
export const Contador: FC<{ x: number; y: number; etiqueta: string; valor: string | number; tamano?: number; golpe?: number; opacidad?: number }> = ({
  x, y, etiqueta, valor, tamano = 56, golpe = 0, opacidad = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      padding: '6px 22px',
      background: 'rgba(5,8,15,0.75)',
      border: `2px solid ${bb.verde}55`,
      fontFamily: letra.mono,
      fontWeight: 700,
      fontSize: tamano,
      color: bb.verde,
      textShadow: `0 0 16px ${bb.verde}66`,
      whiteSpace: 'pre',
      opacity: opacidad,
      transformOrigin: 'left center',
      transform: `scale(${1 + 0.08 * golpe})`,
    }}
  >
    {`${etiqueta}: `}
    <span style={{ color: golpe > 0.3 ? bb.ambar : bb.verde }}>{String(valor).padStart(2, ' ')}</span>
  </div>
);

/** Letrero centrado de terminal, con borde (p. ej. «TRAS CONSIDERAR EL SILENCIO»). Entra con `aparece` 0–1. */
export const Rotulo: FC<{ y: number; texto: string; color: string; aparece: number; tamano?: number }> = ({ y, texto, color: c, aparece, tamano = 36 }) =>
  aparece <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: Math.min(1, aparece * 1.6) }}>
      <div
        style={{
          padding: '6px 22px',
          background: 'rgba(5,8,15,0.8)',
          border: `2px solid ${c}88`,
          fontFamily: letra.mono,
          fontWeight: 700,
          fontSize: tamano,
          letterSpacing: 3,
          color: c,
          textShadow: `0 0 14px ${c}66`,
          transform: `scale(${0.6 + 0.4 * aparece})`,
          whiteSpace: 'pre',
        }}
      >
        {texto}
      </div>
    </div>
  );

/** «Fuente: …» pequeño, abajo del dibujo («\n» para otro renglón). */
export const Fuente: FC<{ texto: string; x?: number; y: number; opacidad: number; tamano?: number }> = ({ texto, x = 70, y, opacidad, tamano = 28 }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontFamily: letra.mono, fontWeight: 500, fontSize: tamano, lineHeight: 1.3, whiteSpace: 'pre', color: bb.hueso, opacity: 0.7 * opacidad }}>{texto}</div>
);

/** Aviso pequeño «ILUSTRACIÓN» centrado en (x, y), junto a un dibujo que no es una imagen real (p. ej. un exoplaneta). */
export const Ilustracion: FC<{ x: number; y: number; opacidad: number; texto?: string }> = ({ x, y, opacidad, texto = 'ILUSTRACIÓN' }) =>
  opacidad <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        padding: '2px 12px',
        background: 'rgba(5,8,15,0.7)',
        border: `2px dashed ${bb.hueso}77`,
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 2,
        color: bb.hueso,
        opacity: 0.85 * Math.min(1, opacidad),
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );

/** Letrero con borde centrado en (x, y), para nombrar algo del dibujo. Entra con `aparece` 0–1. */
export const Etiqueta: FC<{ x: number; y: number; texto: string; color: string; aparece: number; tamano?: number }> = ({ x, y, texto, color: c, aparece, tamano = 44 }) =>
  aparece <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * aparece})`,
        opacity: Math.min(1, aparece * 1.5),
        padding: '4px 20px',
        background: 'rgba(5,8,15,0.8)',
        border: `3px solid ${c}`,
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: tamano,
        letterSpacing: 3,
        color: c,
        textShadow: `0 0 16px ${c}66`,
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
