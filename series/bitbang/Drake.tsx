// La ecuación de Drake (1961): N = R* · fp · ne · fl · fi · fc · L. Cada factor va en un cuadro de terminal que se
// pinta con el color de su grupo: cian = astronomía (lo que ya se mide), terracota = biología y ámbar = sociedad
// (casi pura suposición). Debajo, llaves con el nombre del grupo; encima, signos de pregunta de píxeles.
// Y los deslizadores de cada factor: un valor fijo (la perilla) que puede abrirse en una campana (un rango).
// Todo en SVG, dentro de un `Lienzo`; los valores 0–1 los pone la escena con su reloj.
import type { FC } from 'react';
import { interpolateColors } from 'remotion';
import { SignoPregunta } from './Pixeles';
import { bb, letra } from './tema';

export type GrupoDrake = 'astronomia' | 'biologia' | 'sociedad';

export const COLOR_GRUPO: Record<GrupoDrake, string> = { astronomia: bb.cian, biologia: bb.terracotaClara, sociedad: bb.ambar };
export const NOMBRE_GRUPO: Record<GrupoDrake, string> = { astronomia: 'ASTRONOMÍA', biologia: 'BIOLOGÍA', sociedad: 'SOCIEDAD' };

export type Termino = { letra: string; indice: string; arriba?: boolean; grupo: GrupoDrake };

/** Los siete factores, en el orden de la ecuación. */
export const TERMINOS_DRAKE: Termino[] = [
  { letra: 'R', indice: '*', arriba: true, grupo: 'astronomia' },
  { letra: 'f', indice: 'p', grupo: 'astronomia' },
  { letra: 'n', indice: 'e', grupo: 'astronomia' },
  { letra: 'f', indice: 'l', grupo: 'biologia' },
  { letra: 'f', indice: 'i', grupo: 'biologia' },
  { letra: 'f', indice: 'c', grupo: 'sociedad' },
  { letra: 'L', indice: '', grupo: 'sociedad' },
];

export const CUADRO_DRAKE = { ancho: 104, alto: 128, paso: 130 };

/** Centro (x) del factor `i` en una fila centrada en `x`. */
export const xTermino = (i: number, x = 540, escala = 1) => x + (i - 3) * CUADRO_DRAKE.paso * escala;

/** Letra del factor con su índice («R*», «fp»…), centrada en (0, 0). */
export const TextoTermino: FC<{ termino: Termino; color: string; tamano?: number; y?: number }> = ({ termino, color: c, tamano = 70, y = 0 }) => (
  <text x={0} y={y + tamano * 0.26} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={tamano} fill={c}>
    {termino.letra}
    {termino.indice && (
      <tspan fontSize={tamano * 0.58} dy={termino.arriba ? -tamano * 0.36 : tamano * 0.2}>
        {termino.indice}
      </tspan>
    )}
  </text>
);

export type EstadoTermino = {
  /** 0–1: entra con un resorte (los primeros fotogramas, en verde: el glitch de la serie). */
  aparece: number;
  /** 0–1: del hueso al color de su grupo. */
  color?: number;
  /** 0–1: signo de pregunta de píxeles encima. */
  pregunta?: number;
  /** 0–1: lo hace latir. */
  golpe?: number;
  /** 0–1: lo apaga un poco, para que resalten los otros. */
  tenue?: number;
};

export type LlaveGrupo = { desde: number; hasta: number; texto: string; color: string; aparece: number };

type FormulaProps = {
  /** Centro vertical de la fila de cuadros. */
  y: number;
  x?: number;
  escala?: number;
  terminos: EstadoTermino[];
  /** 0–1: «N =» encima de la fila, con su explicación debajo. */
  n?: number;
  textoN?: string;
  llaves?: LlaveGrupo[];
  opacidad?: number;
};

/** La fórmula en una fila: «N =» arriba y los siete cuadros multiplicados («·») debajo. */
export const FormulaDrake: FC<FormulaProps> = ({ y, x = 540, escala = 1, terminos, n = 0, textoN, llaves = [], opacidad = 1 }) => {
  const { ancho, alto } = CUADRO_DRAKE;
  return (
    <g opacity={opacidad} transform={`translate(${x} ${y}) scale(${escala}) translate(${-x} ${-y})`}>
      {n > 0 && (
        <g opacity={Math.min(1, n * 1.6)} transform={`translate(${x} ${y - 290}) scale(${0.7 + 0.3 * n})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={150} fill={bb.verde} style={{ filter: `drop-shadow(0 0 18px ${bb.verde}66)` }}>
            N<tspan fill={bb.hueso}> =</tspan>
          </text>
          {textoN && (
            <text x={0} y={62} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={32} letterSpacing={2} fill={bb.hueso} opacity={0.85}>
              {textoN}
            </text>
          )}
        </g>
      )}
      {/* Los puntos de multiplicar entre cuadros */}
      <g shapeRendering="crispEdges">
        {terminos.slice(0, -1).map((t, i) => {
          const o = Math.min(t.aparece, terminos[i + 1].aparece);
          return o <= 0 ? null : <rect key={i} x={xTermino(i, x) + CUADRO_DRAKE.paso / 2 - 6} y={y - 6} width={12} height={12} fill={bb.hueso} opacity={o} />;
        })}
      </g>
      {terminos.map((t, i) => {
        if (t.aparece <= 0) return null;
        const termino = TERMINOS_DRAKE[i];
        const glitch = t.aparece < 0.45;
        const c = glitch ? bb.verde : interpolateColors(t.color ?? 0, [0, 1], [bb.hueso, COLOR_GRUPO[termino.grupo]]);
        const s = (0.6 + 0.4 * t.aparece) * (1 + 0.12 * (t.golpe ?? 0));
        const cx = xTermino(i, x);
        return (
          <g key={i} opacity={Math.min(1, t.aparece * 1.6) * (1 - 0.6 * (t.tenue ?? 0))}>
            <g transform={`translate(${cx} ${y}) scale(${s})`}>
              <rect x={-ancho / 2 + 6} y={-alto / 2 + 6} width={ancho} height={alto} fill={c} opacity={0.35} shapeRendering="crispEdges" />
              <rect x={-ancho / 2} y={-alto / 2} width={ancho} height={alto} fill="rgba(5,8,15,0.9)" stroke={c} strokeWidth={4} shapeRendering="crispEdges" />
              <TextoTermino termino={termino} color={c} />
            </g>
            {(t.pregunta ?? 0) > 0 && (
              <g transform={`translate(${cx} ${y - alto / 2 - 62}) scale(${0.5 + 0.5 * Math.min(1, t.pregunta!)})`}>
                <SignoPregunta x={0} y={0} lado={7} color={COLOR_GRUPO[termino.grupo]} aparece={t.pregunta!} />
              </g>
            )}
          </g>
        );
      })}
      {llaves.map((ll, k) => {
        if (ll.aparece <= 0) return null;
        const a = xTermino(ll.desde, x) - ancho / 2;
        const b = xTermino(ll.hasta, x) + ancho / 2;
        const medio = (a + b) / 2;
        const abre = Math.min(1, ll.aparece * 1.4);
        const yl = y + alto / 2 + 26;
        return (
          <g key={k} shapeRendering="crispEdges">
            <rect x={medio - ((b - a) / 2) * abre} y={yl} width={(b - a) * abre} height={5} fill={ll.color} />
            <rect x={medio - ((b - a) / 2) * abre} y={yl - 14} width={5} height={19} fill={ll.color} opacity={abre} />
            <rect x={medio + ((b - a) / 2) * abre - 5} y={yl - 14} width={5} height={19} fill={ll.color} opacity={abre} />
            <text x={medio} y={yl + 50} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={34} letterSpacing={3} fill={ll.color} opacity={Math.min(1, ll.aparece)}>
              {ll.texto}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// --- Deslizadores -------------------------------------------------------------------------------------

export type FilaDeslizador = {
  /** Índice del factor (0–6). */
  termino: number;
  /** Dónde está la perilla (0–1 a lo largo de la barra). */
  valor: number;
  /** De dónde a dónde puede ir (0–1): angosta si se mide, casi toda la barra si es suposición. */
  banda: [number, number];
};

type DeslizadoresProps = {
  x: number;
  y: number;
  ancho: number;
  /** Distancia vertical entre filas. */
  paso?: number;
  filas: FilaDeslizador[];
  /** 0–1: la perilla (un número fijo) se abre en una campana de píxeles sobre su banda (un rango). */
  rango?: number;
  /** 0–1 por fila: entra de izquierda a derecha. */
  aparece?: number[];
  opacidad?: number;
};

const CAMPANA = { columna: 16, alto: 60 };

/** Una fila por factor: su nombre, la barra, la banda posible y la perilla (o la campana). */
export const Deslizadores: FC<DeslizadoresProps> = ({ x, y, ancho, paso = 92, filas, rango = 0, aparece, opacidad = 1 }) => {
  const x0 = x + 130;
  const largo = x + ancho - x0;
  return (
    <g opacity={opacidad}>
      {filas.map((fila, k) => {
        const entra = aparece?.[k] ?? 1;
        if (entra <= 0) return null;
        const termino = TERMINOS_DRAKE[fila.termino];
        const c = COLOR_GRUPO[termino.grupo];
        const yf = y + k * paso;
        const [b0, b1] = fila.banda;
        const medio = (b0 + b1) / 2;
        const sigma = Math.max(0.03, (b1 - b0) / 4.5);
        const columnas = Math.ceil(largo / CAMPANA.columna);
        return (
          <g key={k} opacity={Math.min(1, entra * 1.5)} transform={`translate(${(1 - entra) * -60} 0)`}>
            <g transform={`translate(${x + 50} ${yf})`}>
              <TextoTermino termino={termino} color={c} tamano={54} />
            </g>
            <g shapeRendering="crispEdges">
              <rect x={x0} y={yf - 3} width={largo * entra} height={6} fill={bb.hueso} opacity={0.22} />
              <rect x={x0 + b0 * largo} y={yf - 13} width={(b1 - b0) * largo} height={26} fill={c} opacity={0.2 * (1 - rango * 0.6)} />
              <rect x={x0 + b0 * largo} y={yf - 18} width={4} height={36} fill={c} opacity={0.7} />
              <rect x={x0 + b1 * largo - 4} y={yf - 18} width={4} height={36} fill={c} opacity={0.7} />
              {rango > 0 &&
                Array.from({ length: columnas }, (_, j) => {
                  const u = (j + 0.5) / columnas;
                  if (u < b0 || u > b1) return null;
                  const d = (u - medio) / (sigma * (0.35 + 0.65 * rango));
                  const h = Math.round((CAMPANA.alto * rango * Math.exp(-0.5 * d * d)) / 8) * 8;
                  if (h < 8) return null;
                  return <rect key={j} x={x0 + j * CAMPANA.columna + 1} y={yf - h} width={CAMPANA.columna - 2} height={h} fill={c} opacity={0.9} />;
                })}
              {rango < 1 && (
                <g opacity={1 - rango}>
                  <rect x={x0 + fila.valor * largo - 18} y={yf - 18} width={36} height={36} fill={c} stroke={bb.tinta} strokeWidth={3} />
                  <rect x={x0 + fila.valor * largo - 6} y={yf - 6} width={12} height={12} fill={bb.tinta} opacity={0.5} />
                </g>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
};
