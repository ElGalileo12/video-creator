// Línea de tiempo de la serie: un punto por capítulo. Los de capítulos anteriores quedan encendidos
// tenues y el del capítulo actual se enciende con su nombre y su fecha.
import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { resorte, tramo } from '../../src/escena';
import { bb, letra, SERIE } from './tema';

export type Hito = { nombre: string; fecha: string };

/** Un hito por capítulo, en orden. Cada capítulo nuevo añade el suyo. */
export const HITOS: Hito[] = [
  { nombre: 'TALES', fecha: '585 a.C.' },
  { nombre: 'ANAXIMANDRO', fecha: 'c. 570 a.C.' },
  { nombre: 'MAPA DEL MUNDO', fecha: 'SIGLO VI a.C.' },
  { nombre: 'ORIGEN HUMANO', fecha: 'SIGLO VI a.C.' },
  { nombre: 'TODO ES AIRE', fecha: 'SIGLO VI a.C.' },
  { nombre: 'TODO FLUYE', fecha: 'SIGLOS VI–V a.C.' },
  { nombre: 'ÁTOMOS', fecha: 'SIGLO V a.C.' },
  { nombre: 'ARQUÍMEDES', fecha: 'SIGLO III a.C.' },
];

const PASO = 170;

type Props = {
  y: number;
  /** Capítulo actual (1 = el primero). */
  capitulo: number;
  /** Hitos en orden (el del capítulo actual incluido). Por defecto, los de la serie. */
  hitos?: Hito[];
  /** Fotograma en que se dibuja la línea y en que se enciende el punto actual. */
  desde: number;
  enciende: number;
  opacidad?: number;
};

export const LineaDeTiempo: FC<Props> = ({ y, capitulo, hitos = HITOS, desde, enciende, opacidad = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const actual = capitulo - 1;
  const inicioX = 150 + Math.min(actual, 2) * PASO - actual * PASO;
  const linea = tramo(frame, desde, 18);
  const brillo = resorte(frame, enciende, fps, { damping: 10, stiffness: 160 });
  const pulso = 0.5 + 0.5 * Math.sin((frame - enciende) / 5);
  const visibles = Array.from({ length: SERIE.capitulos }, (_, i) => i).filter((i) => {
    const x = inicioX + i * PASO;
    return x > -40 && x < 1120;
  });
  return (
    <svg width={1080} height={300} style={{ position: 'absolute', left: 0, top: y - 150, overflow: 'visible', opacity: opacidad }}>
      <defs>
        <linearGradient id="bb-linea-tiempo" x1="0" x2="1">
          <stop offset="0" stopColor={bb.hueso} stopOpacity={0.5} />
          <stop offset="0.75" stopColor={bb.hueso} stopOpacity={0.35} />
          <stop offset="1" stopColor={bb.hueso} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={60} y={148} width={1000 * linea} height={4} fill="url(#bb-linea-tiempo)" />
      {visibles.map((i) => {
        const x = inicioX + i * PASO;
        const aparece = tramo(frame, desde + 4 + (x / 1080) * 14, 6);
        const lejos = Math.max(0, Math.min(1, (x - 700) / 360));
        if (i === actual) {
          return (
            <g key={i}>
              <circle cx={x} cy={150} r={22 + 22 * brillo * pulso} fill={bb.ambar} opacity={0.25 * brillo} />
              <rect x={x - 13} y={137} width={26} height={26} fill={brillo > 0.05 ? bb.ambar : bb.noche} stroke={bb.ambar} strokeWidth={3} opacity={aparece} />
              <g opacity={Math.min(1, brillo * 1.4)} transform={`translate(0 ${(1 - brillo) * 14})`}>
                <text x={x - 18} y={112} fontFamily={letra.titulo} fontWeight={900} fontSize={42} fill={bb.ambar}>
                  {hitos[i]?.nombre}
                </text>
                <text x={x - 18} y={204} fontFamily={letra.mono} fontWeight={700} fontSize={30} fill={bb.verde}>
                  {hitos[i]?.fecha}
                </text>
              </g>
            </g>
          );
        }
        const pasado = i < actual;
        return (
          <rect
            key={i}
            x={x - 9}
            y={141}
            width={18}
            height={18}
            fill={pasado ? bb.ambar : bb.fondo}
            stroke={pasado ? bb.ambar : bb.hueso}
            strokeWidth={3}
            opacity={aparece * (pasado ? 0.6 : 0.45) * (1 - lejos)}
          />
        );
      })}
    </svg>
  );
};
