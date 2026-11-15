// El Gran Filtro como muro de ladrillos que cruza la pantalla: cae desde arriba y los puntos de vida que suben
// desde abajo se deshacen contra él; solo uno lo atraviesa (en el fotograma `cruza`) y sigue hacia arriba.
// Para usar dentro de un `Lienzo` (SVG del tamaño del video).
import type { FC } from 'react';
import { random } from 'remotion';
import { bb, letra } from './tema';

const ALTO_MURO = 72;

type Props = {
  /** Altura del centro del muro, de donde salen las vidas y hasta donde sube la que cruza (px). */
  y: number;
  suelo: number;
  cielo: number;
  /** 0–1: el muro cae desde arriba (un resorte). */
  muro: number;
  /** Fotograma en que empiezan a subir las vidas y en que la afortunada atraviesa el muro. */
  desde: number;
  cruza: number;
  frame: number;
  cantidad?: number;
  semilla?: string;
  /** Letreros de abajo y de arriba (vacíos para no ponerlos). */
  abajo?: string;
  arriba?: string;
};

export const MuroFiltro: FC<Props> = ({ y: yMuro, suelo, cielo, muro, desde, cruza, frame: f, cantidad = 34, semilla = 'filtro', abajo = 'VIDA', arriba = '' }) => {
  const bajoMuro = yMuro + ALTO_MURO / 2;
  const caida = yMuro - (1 - muro) * 420;
  const vidas = Array.from({ length: cantidad }, (_, i) => ({
    x: 110 + random(`${semilla}-x-${i}`) * 860,
    sale: desde + Math.round(random(`${semilla}-s-${i}`) * Math.max(10, cruza - desde - 30)),
    v: 8 + random(`${semilla}-v-${i}`) * 4,
    color: random(`${semilla}-c-${i}`) < 0.5 ? bb.verde : bb.cian,
  }));
  // La afortunada: llega al muro justo en `cruza`, lo atraviesa y sube.
  const vA = 9;
  const saleA = cruza - (suelo - bajoMuro) / vA;
  const yA = f < cruza ? suelo - vA * (f - saleA) : bajoMuro - 13 * (f - cruza);
  const llega = Math.max(cielo, yA);
  const rompe = f >= cruza && f < cruza + 14;
  return (
    <g>
      <g shapeRendering="crispEdges">
        {vidas.map((v, i) => {
          const t = f - v.sale;
          if (t < 0) return null;
          const choque = (suelo - bajoMuro) / v.v;
          if (t < choque) {
            const y = suelo - v.v * t;
            return <rect key={i} x={v.x - 9} y={y - 9} width={18} height={18} fill={v.color} opacity={Math.min(1, t / 4)} />;
          }
          const e = t - choque;
          if (e > 16 || muro < 0.9) return null;
          return (
            <g key={i} opacity={1 - e / 16}>
              {[0, 1, 2, 3, 4, 5].map((k) => {
                const a = Math.PI * (0.15 + 0.7 * random(`${semilla}-chispa-${i}-${k}`));
                const r = (3 + 4 * random(`${semilla}-chispa-v-${i}-${k}`)) * e;
                return <rect key={k} x={v.x + Math.cos(a) * r - 4} y={bajoMuro + Math.sin(a) * r * 0.8 - 4} width={8} height={8} fill={v.color} />;
              })}
            </g>
          );
        })}
        {f >= saleA && (
          <>
            {f >= cruza && <rect x={535} y={llega} width={10} height={bajoMuro - llega} fill={bb.cian} opacity={0.35 * Math.max(0, 1 - (f - cruza - 20) / 10)} />}
            <rect x={531} y={llega - 9} width={18} height={18} fill={bb.cian} />
          </>
        )}
      </g>
      <g transform={`translate(0 ${caida - yMuro})`} opacity={Math.min(1, muro * 2)} shapeRendering="crispEdges">
        {[0, 1, 2].map((fila) =>
          Array.from({ length: 13 }, (_, k) => {
            const x = 40 + k * 80 - (fila % 2 ? 40 : 0);
            const ancho = Math.min(1040, x + 80) - Math.max(40, x);
            if (ancho < 10) return null;
            const cerca = Math.abs(Math.max(40, x) + ancho / 2 - 540) < 60 && fila === 1;
            return (
              <rect
                key={`${fila}-${k}`}
                x={Math.max(40, x) + 3}
                y={yMuro - ALTO_MURO / 2 + fila * 24 + 3}
                width={ancho - 6}
                height={18}
                fill={cerca && rompe ? bb.hueso : (k + fila) % 3 === 0 ? bb.terracotaClara : bb.terracota}
                stroke={bb.tinta}
                strokeWidth={2}
              />
            );
          }),
        )}
      </g>
      {abajo && (
        <text x={540} y={suelo + 44} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={34} letterSpacing={6} fill={bb.verde} opacity={0.85 * Math.min(1, muro * 2)}>
          {abajo}
        </text>
      )}
      {arriba && (
        <text x={540} y={cielo - 30} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={34} letterSpacing={6} fill={bb.cian} opacity={0.85 * Math.min(1, muro * 2)}>
          {arriba}
        </text>
      )}
    </g>
  );
};
