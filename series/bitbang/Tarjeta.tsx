// Tarjeta de título de cada capítulo: «BITBANG · LA FÍSICA EN DISPUTA», «CAP n» enorme y el título
// entrando palabra por palabra cuando la voz lo dice («Capítulo n: <título>.»).
import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { golpe, resorte, tramo, useMomento } from '../../src/escena';
import { Lienzo } from '../../src/piezas';
import { Greca } from './Griego';
import { Plano } from './Plano';
import { bb, letra, SERIE } from './tema';

/** Una palabra del título: lo que se escribe, la palabra de la voz que la hace entrar (`vez` si se repite) y si va en ámbar. */
export type PalabraTitulo = { texto: string; voz: string; vez?: number; destacar?: boolean; color?: string } | 'salto';

type Props = {
  capitulo: number;
  /** Cómo dice la voz el número («uno», «dos»…): ahí late el «CAP n». */
  numero: string;
  titulo: PalabraTitulo[];
  tamano?: number;
};

const Tarjeta: FC<Props> = ({ capitulo, numero, titulo, tamano = 84 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const momentos = titulo.map((p) => (p === 'salto' ? 0 : useMomento(p.voz, p.vez)));
  // Empieza ya a medio entrar: el primer fotograma del video no queda vacío.
  const cap = resorte(f + 8, 0, fps, { damping: 11, stiffness: 200 });
  const late = golpe(f, useMomento(numero) - 2, 14);
  const lema = `${SERIE.nombre} · ${SERIE.lema}`;
  const escrito = lema.slice(0, Math.round(Math.min(1, (f + 6) / 16) * lema.length));
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: 560, fontFamily: letra.mono, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: bb.verde, textShadow: `0 0 16px ${bb.verde}66`, whiteSpace: 'pre' }}>
        {escrito.padEnd(lema.length, ' ')}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 610,
          fontFamily: letra.titulo,
          fontWeight: 900,
          fontSize: 230,
          lineHeight: 1,
          color: bb.ambar,
          opacity: Math.min(1, cap * 1.5),
          transform: `scale(${(0.6 + 0.4 * cap) * (1 + 0.06 * late)})`,
          textShadow: `0 0 ${60 + 40 * late}px ${bb.ambar}55, 0 12px 40px rgba(0,0,0,0.6)`,
        }}
      >
        CAP {capitulo}
      </div>
      <Lienzo>
        <Greca x={270} y={872} ancho={540} alto={24} progreso={tramo(f, 2, 14)} />
      </Lienzo>
      <div style={{ position: 'absolute', top: 960, width: 940, textAlign: 'center', fontFamily: letra.titulo, fontWeight: 700, fontSize: tamano, lineHeight: 1.15, color: bb.hueso }}>
        {titulo.map((p, i) => {
          if (p === 'salto') return <br key={i} />;
          const s = resorte(f, momentos[i] - 2, fps, { damping: 12, stiffness: 220 });
          const brillo = p.destacar || p.color ? golpe(f, momentos[i] - 2, 16) : 0;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 14px',
                color: p.color ?? (p.destacar ? bb.ambar : bb.hueso),
                opacity: Math.min(1, s * 1.6),
                transform: `translateY(${(1 - s) * 30}px) scale(${1 + 0.15 * brillo})`,
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** La escena de título completa (sin glitch de entrada: es el primer fotograma del video). */
export const TarjetaTitulo: FC<Props> = (props) => (
  <Plano entrada={false} zoom={0.03}>
    <Tarjeta {...props} />
  </Plano>
);
