// Puente entre partes de un video completo de especiales (YouTube): como `Puente`, pero sin línea del tiempo ni
// adornos griegos (temas modernos). Abajo va la ruta del video: una casilla por parte, el cursor viaja de la anterior
// a la que empieza y esta se enciende con su nombre. El título entra palabra por palabra cuando la voz lo dice.
// El primero abre el video, con «BITBANG» en grande. Las estrellas que pasan rápido las pone el fondo horizontal.
import type { FC } from 'react';
import { AbsoluteFill, Easing, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { golpe, mezclar, resorte, tramo, useMomento } from '../../src/escena';
import { ANCHO_H } from '../../src/horizontal';
import type { PalabraTitulo } from './Tarjeta';
import { bb, letra, SERIE } from './tema';

const Y_RUTA = 840;
const PASO = 330;
/** x de la casilla número `i` (0 = la primera), con las `total` partes en fila. */
const xParte = (i: number, total: number) => ANCHO_H / 2 + (i - (total - 1) / 2) * PASO;

/** Fila de cuadritos cian que se dibuja de izquierda a derecha (el separador, en vez de la greca). */
const Pixeles: FC<{ y: number; ancho: number; progreso: number }> = ({ y, ancho, progreso }) => {
  const lado = 10;
  const paso = 22;
  const n = Math.floor(ancho / paso);
  const x0 = ANCHO_H / 2 - ((n - 1) * paso + lado) / 2;
  return (
    <svg width={ANCHO_H} height={lado} style={{ position: 'absolute', left: 0, top: y }} shapeRendering="crispEdges">
      {Array.from({ length: n }, (_, i) => {
        const centro = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
        if (centro > progreso) return null;
        return <rect key={i} x={x0 + i * paso} y={0} width={lado} height={lado} fill={i % 4 === 0 ? bb.ambar : bb.cian} opacity={0.35 + 0.5 * (1 - centro)} />;
      })}
    </svg>
  );
};

const Ruta: FC<{ partes: string[]; actual: number }> = ({ partes, actual }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = partes.length;
  const aparece = tramo(f, 0, 12);
  const viaje = tramo(f, 4, 18, Easing.inOut(Easing.cubic));
  const cursor = mezclar(viaje, xParte(actual - 1, total), xParte(actual, total));
  const brillo = resorte(f, 20, fps, { damping: 10, stiffness: 160 });
  const pulso = 0.5 + 0.5 * Math.sin((f - 20) / 5);
  const izq = xParte(0, total) - PASO / 2;
  const der = xParte(total - 1, total) + PASO / 2;
  return (
    <svg width={ANCHO_H} height={300} style={{ position: 'absolute', left: 0, top: Y_RUTA - 150, overflow: 'visible', opacity: aparece }}>
      <defs>
        <linearGradient id="bb-ruta-linea" x1="0" x2="1">
          <stop offset="0" stopColor={bb.hueso} stopOpacity={0} />
          <stop offset="0.1" stopColor={bb.hueso} stopOpacity={0.4} />
          <stop offset="0.9" stopColor={bb.hueso} stopOpacity={0.4} />
          <stop offset="1" stopColor={bb.hueso} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={izq} y={148} width={der - izq} height={4} fill="url(#bb-ruta-linea)" />
      <rect x={izq} y={147} width={Math.max(0, cursor - izq)} height={6} fill={bb.ambar} opacity={0.55} />
      {partes.map((nombre, i) => {
        if (i === actual) return null;
        const pasado = i < actual;
        return (
          <g key={i}>
            <rect x={xParte(i, total) - 10} y={140} width={20} height={20} fill={pasado ? bb.ambar : bb.fondo} stroke={pasado ? bb.ambar : bb.hueso} strokeWidth={3} opacity={pasado ? 0.65 : 0.4} />
            <text x={xParte(i, total)} y={204} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={22} letterSpacing={1} fill={bb.hueso} opacity={pasado ? 0.45 : 0.3}>
              {nombre}
            </text>
          </g>
        );
      })}
      <circle cx={cursor} cy={150} r={22 + 22 * brillo * pulso} fill={bb.ambar} opacity={0.12 + 0.18 * brillo} />
      <rect x={cursor - 15} y={135} width={30} height={30} fill={bb.ambar} stroke={bb.hueso} strokeWidth={brillo > 0.5 ? 3 : 0} />
      <g opacity={Math.min(1, brillo * 1.4)} transform={`translate(0 ${(1 - brillo) * 14})`}>
        <text x={xParte(actual, total)} y={108} textAnchor="middle" fontFamily={letra.titulo} fontWeight={900} fontSize={40} fill={bb.ambar}>
          {partes[actual]}
        </text>
        <text x={xParte(actual, total)} y={210} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={26} fill={bb.verde}>
          {`PARTE ${actual + 1}/${total}`}
        </text>
      </g>
    </svg>
  );
};

type Props = {
  /** Parte que empieza (1 = la primera). */
  parte: number;
  /** Nombre corto de cada parte, en orden (va en la ruta de abajo). */
  partes: string[];
  titulo: PalabraTitulo[];
  tamano?: number;
};

export const PuenteRuta: FC<Props> = ({ parte, partes, titulo, tamano = 104 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const primero = parte === 1;
  const momentos = titulo.map((p) => (p === 'salto' ? 0 : useMomento(p.voz, p.vez)));
  const lema = `${SERIE.nombre} · ${SERIE.lema}`;
  const escrito = primero ? SERIE.lema : lema;
  const letras = Math.round(tramo(f, 2, 16) * escrito.length);
  const nombre = resorte(f, 0, fps, { damping: 12, stiffness: 170 });
  const arriba = primero ? 330 : 270;
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
      <Pixeles y={arriba + 66} ancho={600} progreso={tramo(f, 4, 16)} />
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: arriba + 110,
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
                margin: '0 20px',
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
      <Ruta partes={partes} actual={parte - 1} />
    </AbsoluteFill>
  );
};
