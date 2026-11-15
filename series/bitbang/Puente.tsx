// Puente entre capítulos en el video horizontal (YouTube): las estrellas pasan como en un viaje (eso lo hace
// el fondo), la línea del tiempo avanza hasta el filósofo que sigue y el título entra cuando la voz lo dice.
// Sin «CAP n». El primero abre el video, con «BITBANG» en grande.
import type { FC } from 'react';
import { AbsoluteFill, Easing, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { golpe, mezclar, resorte, tramo, useMomento } from '../../src/escena';
import { ANCHO_H } from '../../src/horizontal';
import { Greca } from './Griego';
import { HITOS } from './LineaDeTiempo';
import type { PalabraTitulo } from './Tarjeta';
import { bb, letra, SERIE } from './tema';

const Y_LINEA = 830;
const PASO = 200;
/** x del hito número `i` (0 = Tales), con todos los de la serie en fila. */
const xHito = (i: number) => ANCHO_H / 2 + (i - (HITOS.length - 1) / 2) * PASO;

/** Línea del tiempo horizontal: el cursor viaja del hito anterior al actual y este se enciende con su nombre. */
const Linea: FC<{ actual: number }> = ({ actual }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const aparece = tramo(f, 0, 12);
  const viaje = tramo(f, 4, 18, Easing.inOut(Easing.cubic));
  const cursor = mezclar(viaje, xHito(Math.max(0, actual - 1)) - (actual === 0 ? PASO : 0), xHito(actual));
  const brillo = resorte(f, 20, fps, { damping: 10, stiffness: 160 });
  const pulso = 0.5 + 0.5 * Math.sin((f - 20) / 5);
  const despues = Array.from({ length: 4 }, (_, k) => HITOS.length + k);
  return (
    <svg width={ANCHO_H} height={300} style={{ position: 'absolute', left: 0, top: Y_LINEA - 150, overflow: 'visible', opacity: aparece }}>
      <defs>
        <linearGradient id="bb-puente-linea" x1="0" x2="1">
          <stop offset="0" stopColor={bb.hueso} stopOpacity={0} />
          <stop offset="0.12" stopColor={bb.hueso} stopOpacity={0.4} />
          <stop offset="0.88" stopColor={bb.hueso} stopOpacity={0.4} />
          <stop offset="1" stopColor={bb.hueso} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={80} y={148} width={ANCHO_H - 160} height={4} fill="url(#bb-puente-linea)" />
      <rect x={xHito(0) - PASO} y={147} width={Math.max(0, cursor - xHito(0) + PASO)} height={6} fill={bb.ambar} opacity={0.55} />
      {HITOS.map((_, i) => {
        if (i === actual) return null;
        const pasado = i < actual;
        return (
          <rect key={i} x={xHito(i) - 10} y={140} width={20} height={20} fill={pasado ? bb.ambar : bb.fondo} stroke={pasado ? bb.ambar : bb.hueso} strokeWidth={3} opacity={pasado ? 0.65 : 0.4} />
        );
      })}
      {despues.map((i, k) => (
        <rect key={i} x={xHito(i) - 8} y={142} width={16} height={16} fill={bb.fondo} stroke={bb.hueso} strokeWidth={3} opacity={0.3 * (1 - k / 4)} />
      ))}
      <circle cx={cursor} cy={150} r={22 + 22 * brillo * pulso} fill={bb.ambar} opacity={0.12 + 0.18 * brillo} />
      <rect x={cursor - 15} y={135} width={30} height={30} fill={bb.ambar} stroke={bb.hueso} strokeWidth={brillo > 0.5 ? 3 : 0} />
      <g opacity={Math.min(1, brillo * 1.4)} transform={`translate(0 ${(1 - brillo) * 14})`}>
        <text x={xHito(actual)} y={108} textAnchor="middle" fontFamily={letra.titulo} fontWeight={900} fontSize={40} fill={bb.ambar}>
          {HITOS[actual].nombre}
        </text>
        <text x={xHito(actual)} y={210} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.verde}>
          {HITOS[actual].fecha}
        </text>
      </g>
    </svg>
  );
};

type Props = {
  /** Capítulo que empieza (1 = el primero). */
  capitulo: number;
  titulo: PalabraTitulo[];
  tamano?: number;
};

export const Puente: FC<Props> = ({ capitulo, titulo, tamano = 104 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const primero = capitulo === 1;
  const momentos = titulo.map((p) => (p === 'salto' ? 0 : useMomento(p.voz, p.vez)));
  const lema = `${SERIE.nombre} · ${SERIE.lema}`;
  const escrito = primero ? SERIE.lema : lema;
  const letras = Math.round(tramo(f, 2, 16) * escrito.length);
  const nombre = resorte(f, 0, fps, { damping: 12, stiffness: 170 });
  const arriba = primero ? 330 : 290;
  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
      {primero && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 120,
            textAlign: 'center',
            fontFamily: letra.titulo,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: 10,
            lineHeight: 1,
            color: bb.ambar,
            opacity: Math.min(1, nombre * 1.5),
            transform: `scale(${0.7 + 0.3 * nombre})`,
            textShadow: `0 0 50px ${bb.ambar}44, 0 10px 34px rgba(0,0,0,0.6)`,
          }}
        >
          {SERIE.nombre}
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: arriba, textAlign: 'center', fontFamily: letra.mono, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: bb.verde, textShadow: `0 0 16px ${bb.verde}66`, whiteSpace: 'pre' }}>
        {escrito.slice(0, letras).padEnd(escrito.length, ' ')}
      </div>
      <svg width={ANCHO_H} height={60} style={{ position: 'absolute', left: 0, top: arriba + 56 }}>
        <Greca x={ANCHO_H / 2 - 300} y={16} ancho={600} alto={22} progreso={tramo(f, 4, 16)} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 160,
          right: 160,
          top: arriba + 130,
          textAlign: 'center',
          fontFamily: letra.titulo,
          fontWeight: 700,
          fontSize: tamano,
          lineHeight: 1.12,
          color: bb.hueso,
          textShadow: '0 10px 34px rgba(0,0,0,0.6)',
        }}
      >
        {titulo.map((p, i) => {
          if (p === 'salto') return <br key={i} />;
          const s = resorte(f, momentos[i] - 2, fps, { damping: 12, stiffness: 220 });
          const brillo = p.destacar || p.color ? golpe(f, momentos[i] - 2, 16) : 0;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 22px',
                color: p.color ?? (p.destacar ? bb.ambar : bb.hueso),
                opacity: Math.min(1, s * 1.6),
                transform: `translateY(${(1 - s) * 30}px) scale(${1 + 0.08 * brillo})`,
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
      <Linea actual={capitulo - 1} />
    </AbsoluteFill>
  );
};
