// Estrellas de la serie en 2D (SVG, dentro de un `Lienzo`): un disco de cuadraditos de su color, con halo, que hierve
// con el fotograma, y las llamaradas de píxeles que salen de su borde. Los colores por tipo los usa también Sistema3D.
import type { FC } from 'react';
import { random } from 'remotion';
import { tramo } from '../../src/escena';
import { bb } from './tema';

/** Tipos de estrella, de la más caliente a la más fría: F (blanca), G (como el Sol), K (naranja), M (roja). */
export type TipoEstrella = 'blanca' | 'sol' | 'naranja' | 'roja';

export const COLORES_ESTRELLA: Record<TipoEstrella, string[]> = {
  blanca: ['#FFF6E6', '#E6EEFF', '#FFFFFF', '#D6E2FF'],
  sol: ['#FFD27A', '#F5A623', '#FFE29A', '#F7B733', '#FFC34D'],
  naranja: ['#F28C38', '#E8772E', '#FFA552', '#F5A623'],
  roja: ['#E0503A', '#C4572A', '#FF6B4A', '#B8432A'],
};

/** Color del halo de cada tipo. */
export const BRILLO_ESTRELLA: Record<TipoEstrella, string> = { blanca: '#DCE6FF', sol: bb.ambar, naranja: '#F28C38', roja: '#E0503A' };

type EstrellaProps = {
  x: number;
  y: number;
  /** Radio del disco (px). */
  radio: number;
  tipo: TipoEstrella;
  frame: number;
  /** 0–1: crece desde el centro. */
  aparece?: number;
  /** Multiplica el halo (0 = sin halo). */
  brillo?: number;
  opacidad?: number;
  /** Lado de cada cuadradito (por defecto, un quinto del radio). */
  lado?: number;
};

/** Estrella de píxeles centrada en (x, y): cada cuadradito cambia de tono cada pocos fotogramas, como si hirviera. */
export const EstrellaPixeles: FC<EstrellaProps> = ({ x, y, radio, tipo, frame, aparece = 1, brillo = 1, opacidad = 1, lado: ladoFijo }) => {
  if (aparece <= 0 || opacidad <= 0) return null;
  const r = radio * Math.min(1.1, aparece);
  const lado = ladoFijo ?? Math.max(5, Math.round(radio / 5));
  const n = Math.ceil(r / lado);
  const paleta = COLORES_ESTRELLA[tipo];
  const turno = Math.floor(frame / 4);
  const celdas = [];
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const d = Math.hypot(i + 0.5, j + 0.5) * lado;
      if (d > r) continue;
      const base = random(`bb-estrella2d-${tipo}-${i}-${j}`);
      const cambia = random(`bb-estrella2d-${tipo}-${i}-${j}-${turno}`) < 0.3;
      const k = Math.floor(((base + (cambia ? 0.37 : 0)) % 1) * paleta.length);
      celdas.push(<rect key={`${i}-${j}`} x={x + i * lado} y={y + j * lado} width={lado + 0.5} height={lado + 0.5} fill={paleta[k]} opacity={d > r - lado ? 0.8 : 1} />);
    }
  }
  const halo = BRILLO_ESTRELLA[tipo];
  return (
    <g opacity={opacidad}>
      {brillo > 0 && (
        <>
          <circle cx={x} cy={y} r={r * 2.3} fill={halo} opacity={0.1 * brillo} />
          <circle cx={x} cy={y} r={r * 1.5} fill={halo} opacity={0.2 * brillo} />
        </>
      )}
      <g shapeRendering="crispEdges">{celdas}</g>
    </g>
  );
};

type LlamaradasProps = {
  /** Centro y radio (px) de la estrella. */
  x: number;
  y: number;
  radio: number;
  frame: number;
  /** Fotograma en que sale la primera. */
  desde: number;
  cantidad?: number;
  /** Fotogramas entre una y la siguiente. */
  ritmo?: number;
  /** Dirección media en grados (0 = derecha, −90 = arriba) y apertura del abanico. */
  angulo?: number;
  apertura?: number;
  /** Altura de los arcos, en radios de la estrella. */
  altura?: number;
  /** Lado de cada cuadradito (por defecto, un sexto del radio). */
  lado?: number;
  semilla?: string;
};

const VIDA_LLAMARADA = 24;

/** Arcos de píxeles que brotan del borde de la estrella, suben, se abren y se apagan, uno tras otro. */
export const Llamaradas: FC<LlamaradasProps> = ({ x, y, radio, frame, desde, cantidad = 6, ritmo = 9, angulo = 0, apertura = 300, altura = 1, lado: ladoFijo, semilla = 'llamaradas' }) => {
  const lado = ladoFijo ?? Math.max(6, Math.round(radio / 6));
  return (
    <g shapeRendering="crispEdges">
      {Array.from({ length: cantidad }, (_, k) => {
        const rnd = (s: string) => random(`${semilla}-${k}-${s}`);
        const t0 = desde + k * ritmo + Math.round(rnd('t') * ritmo * 0.5);
        const t = (frame - t0) / VIDA_LLAMARADA;
        if (t < 0 || t > 1) return null;
        const a = ((angulo + (rnd('a') - 0.5) * apertura) * Math.PI) / 180;
        const abre = 0.22 + 0.2 * rnd('abre');
        const sube = tramo(frame, t0, VIDA_LLAMARADA * 0.55);
        const h = radio * altura * (0.7 + 0.7 * rnd('h')) * sube;
        const borde = (b: number) => ({ x: x + Math.cos(b) * radio, y: y + Math.sin(b) * radio });
        const p0 = borde(a - abre);
        const p2 = borde(a + abre);
        const p1 = { x: x + Math.cos(a) * (radio + 2 * h), y: y + Math.sin(a) * (radio + 2 * h) };
        const apaga = 1 - tramo(frame, t0 + VIDA_LLAMARADA * 0.6, VIDA_LLAMARADA * 0.4);
        const pasos = 16;
        return (
          <g key={k} opacity={apaga}>
            <circle cx={p1.x * 0.15 + (p0.x + p2.x) * 0.425} cy={p1.y * 0.15 + (p0.y + p2.y) * 0.425} r={lado * 3.2} fill={bb.ambar} opacity={0.35 * (1 - t)} />
            {Array.from({ length: pasos + 1 }, (_, i) => {
              const u = i / pasos;
              const px = (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * p1.x + u * u * p2.x;
              const py = (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * p1.y + u * u * p2.y;
              const centro = 1 - Math.abs(u - 0.5) * 2;
              const c = centro > 0.6 ? bb.hueso : centro > 0.25 ? bb.ambar : bb.terracotaClara;
              return <rect key={i} x={px - lado / 2} y={py - lado / 2} width={lado} height={lado} fill={c} />;
            })}
          </g>
        );
      })}
    </g>
  );
};
