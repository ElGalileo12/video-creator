// Camino que se bifurca: un tronco que sube y se abre en dos ramas, cada una con su letrero. Una rama puede
// llevar un obstáculo (un muro de ladrillos de píxeles con su nombre) y un viajero (un punto) recorre el camino.
// Todo en coordenadas del video; los valores 0–1 los pone la escena con su reloj.
import type { FC } from 'react';
import { bb, letra } from './tema';

type P = { x: number; y: number };

export type Rama = {
  texto: string;
  color: string;
  /** 0–1: cuánto de la rama ya está encendido. */
  enciende: number;
  /** 0–1: el letrero entra con un resorte. */
  letrero: number;
};

export type Obstaculo = {
  rama: 'izquierda' | 'derecha';
  /** Dónde va en la rama (0 = el cruce, 1 = el final). */
  en: number;
  /** Nombre del obstáculo, a su derecha (una o más líneas, separadas con \n). */
  texto: string;
  /** 0–1: cae desde arriba. */
  aparece: number;
  /** 0–1: golpe que lo hace latir. */
  late?: number;
};

export type Viajero = {
  /** 0–1 por el tronco y luego 1–2 por la rama elegida. */
  t: number;
  rama: 'izquierda' | 'derecha';
  color?: string;
  etiqueta?: string;
  /** 0–1: la etiqueta se apaga (p. ej. cuando el viajero entra en una rama y estorbaría). */
  etiquetaOpacidad?: number;
  pulso?: number;
};

type Props = {
  x: number;
  /** Abajo del tronco, el cruce y el final de las ramas (alturas en px). */
  yBase: number;
  yCruce: number;
  yFin: number;
  /** Cuánto se separa cada rama del centro al final (px). */
  abre: number;
  /** 0–1: el tronco se dibuja de abajo arriba. */
  tronco: number;
  izquierda: Rama;
  derecha: Rama;
  obstaculo?: Obstaculo;
  viajero?: Viajero;
  opacidad?: number;
  frame: number;
};

/** Punto y dirección de una curva de Bézier cúbica en t. */
const bezier = (a: P, b: P, c: P, d: P, t: number) => {
  const u = 1 - t;
  const x = u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x;
  const y = u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y;
  const dx = 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x);
  const dy = 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y);
  return { x, y, angulo: (Math.atan2(dy, dx) * 180) / Math.PI };
};

/** Letrero de terminal (una o más líneas, separadas con \n) en un solo recuadro centrado en (x, y). */
const Letrero: FC<{ x: number; y: number; texto: string; color: string; aparece: number; tamano?: number }> = ({ x, y, texto, color: c, aparece, tamano = 40 }) => {
  if (aparece <= 0) return null;
  const lineas = texto.split('\n');
  const paso = tamano * 1.2;
  const ancho = Math.max(...lineas.map((l) => l.length)) * tamano * 0.62 + 40;
  const alto = lineas.length * paso + 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * aparece})`} opacity={Math.min(1, aparece * 1.6)}>
      <rect x={-ancho / 2} y={-alto / 2} width={ancho} height={alto} fill="rgba(5,8,15,0.85)" stroke={c} strokeOpacity={0.7} strokeWidth={3} />
      {lineas.map((linea, i) => (
        <text key={i} x={0} y={(i - (lineas.length - 1) / 2) * paso + tamano * 0.36} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={tamano} letterSpacing={2} fill={c}>
          {linea}
        </text>
      ))}
    </g>
  );
};

/** Muro de ladrillos de píxeles centrado en (0, 0), perpendicular al camino. */
const Muro: FC<{ ancho: number; color: string }> = ({ ancho, color: c }) => {
  const alto = 22;
  const filas = 3;
  const ladrillo = 44;
  return (
    <g shapeRendering="crispEdges">
      {Array.from({ length: filas }, (_, f) => {
        const corre = f % 2 ? ladrillo / 2 : 0;
        const cuantos = Math.ceil(ancho / ladrillo) + 1;
        return Array.from({ length: cuantos }, (_, k) => {
          const x0 = -ancho / 2 + k * ladrillo - corre;
          const x1 = Math.min(ancho / 2, x0 + ladrillo);
          const xa = Math.max(-ancho / 2, x0);
          if (x1 - xa < 4) return null;
          return <rect key={`${f}-${k}`} x={xa + 2} y={-filas * alto / 2 + f * alto + 2} width={x1 - xa - 4} height={alto - 4} fill={k % 3 === f % 2 ? bb.terracotaClara : c} stroke={bb.tinta} strokeWidth={2} />;
        });
      })}
    </g>
  );
};

export const Bifurcacion: FC<Props> = ({ x, yBase, yCruce, yFin, abre, tronco, izquierda, derecha, obstaculo, viajero, opacidad = 1, frame }) => {
  const cruce = { x, y: yCruce };
  const curva = (lado: -1 | 1) =>
    [cruce, { x, y: yCruce - (yCruce - yFin) * 0.45 }, { x: x + lado * abre, y: yCruce - (yCruce - yFin) * 0.45 }, { x: x + lado * abre, y: yFin }] as const;
  const ramas = { izquierda: { datos: izquierda, curva: curva(-1) }, derecha: { datos: derecha, curva: curva(1) } };
  const caminoRama = (c: ReturnType<typeof curva>) => `M ${c[0].x} ${c[0].y} C ${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y} ${c[3].x} ${c[3].y}`;
  const enRama = (rama: keyof typeof ramas, t: number) => {
    const [a, b, c, d] = ramas[rama].curva;
    return bezier(a, b, c, d, t);
  };
  const posViajero = viajero && (viajero.t <= 1 ? { x, y: yBase + (yCruce - yBase) * viajero.t } : enRama(viajero.rama, Math.min(1, viajero.t - 1)));
  const ob = obstaculo && enRama(obstaculo.rama, obstaculo.en);
  return (
    <g opacity={opacidad}>
      {/* Camino apagado (punteado) y encendido encima */}
      <line x1={x} y1={yBase} x2={x} y2={yBase + (yCruce - yBase) * tronco} stroke={bb.hueso} strokeOpacity={0.55} strokeWidth={14} strokeLinecap="square" />
      {(Object.keys(ramas) as (keyof typeof ramas)[]).map((k) => {
        const { datos, curva: c } = ramas[k];
        const fin = c[3];
        return (
          <g key={k}>
            <path d={caminoRama(c)} fill="none" stroke={bb.hueso} strokeOpacity={0.3 * tronco} strokeWidth={10} strokeDasharray="14 14" />
            {datos.enciende > 0 && (
              <path d={caminoRama(c)} fill="none" stroke={datos.color} strokeWidth={14} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - datos.enciende} strokeLinecap="square" style={{ filter: `drop-shadow(0 0 12px ${datos.color}88)` }} />
            )}
            <Letrero x={fin.x} y={fin.y - 70} texto={datos.texto} color={datos.color} aparece={datos.letrero} />
          </g>
        );
      })}
      {ob && obstaculo.aparece > 0 && (
        <g transform={`translate(${ob.x} ${ob.y - (1 - obstaculo.aparece) * 220}) rotate(${ob.angulo + 90}) scale(${1 + 0.08 * (obstaculo.late ?? 0)})`} opacity={Math.min(1, obstaculo.aparece * 2)}>
          <Muro ancho={170} color={bb.terracota} />
        </g>
      )}
      {ob && obstaculo.aparece > 0 && (
        <g opacity={Math.min(1, obstaculo.aparece * 2)}>
          {obstaculo.texto.split('\n').map((linea, i) => (
            <text key={i} x={ob.x + 96} y={ob.y + i * 40} fontFamily={letra.mono} fontWeight={700} fontSize={34} letterSpacing={2} fill={bb.terracotaClara} stroke={bb.tinta} strokeWidth={8} paintOrder="stroke">
              {linea}
            </text>
          ))}
        </g>
      )}
      {viajero && posViajero && (
        <g transform={`translate(${posViajero.x} ${posViajero.y})`}>
          <circle r={26 + 14 * (viajero.pulso ?? 0)} fill={viajero.color ?? bb.verde} opacity={0.18 + 0.1 * Math.sin(frame / 6)} />
          <rect x={-14} y={-14} width={28} height={28} fill={viajero.color ?? bb.verde} stroke={bb.tinta} strokeWidth={4} />
          {viajero.etiqueta && (viajero.etiquetaOpacidad ?? 1) > 0 && (
            <text opacity={viajero.etiquetaOpacidad ?? 1} x={-40} y={10} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={32} letterSpacing={2} fill={viajero.color ?? bb.verde} stroke={bb.tinta} strokeWidth={8} paintOrder="stroke">
              {viajero.etiqueta}
            </text>
          )}
        </g>
      )}
    </g>
  );
};
