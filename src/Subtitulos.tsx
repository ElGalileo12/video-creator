import { useMemo, type FC } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { resorte, useEscena } from './escena';
import { color } from './estilo';
import type { EstiloVideo, Palabra } from './tipos';

const MAX_PALABRAS = 3;
const MAX_LETRAS = 22;

// Agrupa las palabras en bloques cortos, cortando después de cada signo de puntuación.
const partir = (palabras: Palabra[]) => {
  const bloques: Palabra[][] = [[]];
  for (const p of palabras) {
    const actual = bloques.at(-1)!;
    const letras = actual.reduce((n, q) => n + q.texto.length + 1, 0) + p.texto.length;
    if (actual.length > 0 && (actual.length >= MAX_PALABRAS || letras > MAX_LETRAS)) bloques.push([p]);
    else actual.push(p);
    if (/[.,;:…]$/.test(p.texto)) bloques.push([]);
  }
  return bloques.filter((b) => b.length > 0);
};

// Quita comillas, comas y puntos finales; deja ¿? y ¡! porque cambian el sentido.
const limpiar = (texto: string) => texto.replace(/^[«"“]+/, '').replace(/[.,;:…»"”]+$/, '');

// Borde oscuro alrededor de cada letra, hecho con sombras en 16 direcciones.
const CONTORNO = [
  ...Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * 6).toFixed(1)}px ${(Math.sin(a) * 6).toFixed(1)}px 0 rgba(5,8,15,0.95)`;
  }),
  '0 8px 26px rgba(0,0,0,0.7)',
].join(', ');

type Props = {
  acento?: string;
  /** Dónde van (para otros formatos, como el horizontal). Por defecto, la franja del video vertical. */
  caja?: { top: number; left: number; right: number };
  /** Tamaño de letra. Por defecto, el del video vertical. */
  tamano?: number;
} & Omit<NonNullable<EstiloVideo['subtitulos']>, 'ocultarEn'>;

/** Subtítulos palabra por palabra, con la palabra que se está diciendo resaltada. */
export const Subtitulos: FC<Props> = ({ acento = color.acento, abajo, fuente, resaltado = 'pildora', apagar, caja, tamano }) => {
  const escena = useEscena();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bloques = useMemo(() => partir(escena.palabras), [escena]);
  if (bloques.length === 0) return null;

  // Cada palabra aparece dos fotogramas antes de oírse, para que se sienta a tiempo.
  const aparece = (p: Palabra) => Math.round(p.inicio * fps) - 2;
  const bloque = bloques.findLast((b) => aparece(b[0]) <= frame) ?? bloques[0];
  const actual = bloque.findLastIndex((p) => aparece(p) <= frame);
  const contorno = resaltado === 'contorno';
  const finVoz = Math.round((escena.palabras.at(-1)?.fin ?? escena.duracion) * fps);
  const visible = apagar ? interpolate(frame, [finVoz + 14, finVoz + 22], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  if (visible <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: caja?.top ?? (abajo ? 1340 : 250),
        opacity: visible,
        fontFamily: fuente,
        left: caja?.left ?? 60,
        right: caja?.right ?? 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        gap: '4px 6px',
        fontSize: tamano ?? (contorno ? 82 : 86),
        fontWeight: contorno ? 700 : 800,
        lineHeight: 1.18,
        letterSpacing: -1,
      }}
    >
      {bloque.map((p, i) => {
        const s = resorte(frame, aparece(p), fps, { damping: 12, stiffness: 220, mass: 0.5 });
        const resaltada = i === actual;
        return (
          <span
            key={`${p.inicio}-${i}`}
            style={{
              display: 'inline-block',
              padding: contorno ? '0 8px' : '0 16px',
              borderRadius: 18,
              opacity: Math.min(1, s * 1.4),
              transform: `translateY(${(1 - s) * 28}px) scale(${(0.75 + 0.25 * s) * (contorno && resaltada ? 1.06 : 1)})`,
              background: resaltada && !contorno ? acento : 'transparent',
              color: resaltada ? (contorno ? acento : color.fondo) : color.texto,
              textShadow: contorno ? CONTORNO : resaltada ? 'none' : '0 6px 24px rgba(0,0,0,0.65)',
            }}
          >
            {limpiar(p.texto)}
          </span>
        );
      })}
    </div>
  );
};
