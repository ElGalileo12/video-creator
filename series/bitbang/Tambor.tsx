// La Tierra como la imaginaba Anaximandro: un tambor de columna (cilindro tres veces más ancho que alto),
// visto casi de lado. También los «apoyos» que la sostendrían (agua y tambores de duda) y la pila
// infinita de apoyos. (x, y) es el centro del cilindro; `rx` su radio en pantalla.
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { SignoPregunta } from './Pixeles';
import { bb, letra } from './tema';

export type TipoTambor = 'tierra' | 'agua' | 'duda';

/** Medidas que coinciden con el tambor 3D (Tierra3D) mirado desde 10° de altura. */
export const TAMBOR = { rx: 230, alto: 150, ry: 40 };

type Props = {
  x: number;
  y: number;
  tipo: TipoTambor;
  rx?: number;
  /** Fotograma, para que se mueva el agua. */
  frame?: number;
  etiqueta?: string;
  opacidad?: number;
  /** 0–1: entra creciendo desde su centro. */
  aparece?: number;
};

const ESTRATOS = ['#C4572A', '#A84824', '#B4642E', '#8E3D1E'];

/** Contorno de la cara lateral (lo que se ve del costado), entre el borde de arriba y el de abajo. */
const caminoLado = (x: number, arriba: number, abajo: number, rx: number, ry: number) =>
  `M ${x - rx} ${arriba} L ${x - rx} ${abajo} A ${rx} ${ry} 0 0 0 ${x + rx} ${abajo} L ${x + rx} ${arriba} A ${rx} ${ry} 0 0 1 ${x - rx} ${arriba} Z`;

export const Tambor: FC<Props> = ({ x, y, tipo, rx = TAMBOR.rx, frame = 0, etiqueta, opacidad = 1, aparece = 1 }) => {
  const recorte = useIdSvg();
  const sombra = useIdSvg();
  if (aparece <= 0) return null;
  const k = rx / TAMBOR.rx;
  const alto = TAMBOR.alto * k;
  const ry = TAMBOR.ry * k;
  const arriba = y - alto / 2;
  const abajo = y + alto / 2;
  const lado = caminoLado(x, arriba, abajo, rx, ry);
  let capas: ReactNode = null;
  let tapa: ReactNode = null;
  if (tipo === 'tierra') {
    capas = (
      <g shapeRendering="crispEdges">
        {ESTRATOS.map((c, i) => (
          <rect key={i} x={x - rx} y={arriba + (i * (alto + ry)) / ESTRATOS.length} width={rx * 2} height={(alto + ry) / ESTRATOS.length + 1} fill={c} />
        ))}
        {Array.from({ length: 40 }, (_, i) => (
          <rect
            key={`p${i}`}
            x={x - rx + random(`tambor-px-${i}`) * rx * 2}
            y={arriba + 8 + random(`tambor-py-${i}`) * (alto + ry - 16)}
            width={12 * k}
            height={8 * k}
            fill={random(`tambor-pc-${i}`) > 0.5 ? '#7E3F22' : '#D4743E'}
            opacity={0.7}
          />
        ))}
      </g>
    );
    tapa = (
      <g>
        <ellipse cx={x} cy={arriba} rx={rx} ry={ry} fill="#1D3F66" />
        <ellipse cx={x} cy={arriba} rx={rx * 0.8} ry={ry * 0.72} fill="#D49A3A" />
        <g shapeRendering="crispEdges">
          {Array.from({ length: 14 }, (_, i) => {
            const a = random(`tierra-a-${i}`) * Math.PI * 2;
            const d = Math.sqrt(random(`tierra-d-${i}`)) * 0.62;
            return (
              <rect key={i} x={x + Math.cos(a) * d * rx - 10 * k} y={arriba + Math.sin(a) * d * ry - 4 * k} width={20 * k} height={8 * k} fill={i % 3 ? '#F5A623' : '#C4572A'} />
            );
          })}
        </g>
        <ellipse cx={x} cy={arriba} rx={rx} ry={ry} fill="none" stroke="#E07A45" strokeWidth={4 * k} />
      </g>
    );
  } else if (tipo === 'agua') {
    capas = (
      <g>
        <rect x={x - rx} y={arriba} width={rx * 2} height={alto + ry} fill="#183556" />
        {[0.3, 0.55, 0.8].map((t, i) => {
          let d = `M ${x - rx} ${arriba + t * (alto + ry)}`;
          for (let px = x - rx; px <= x + rx; px += 16) d += ` L ${px} ${arriba + t * (alto + ry) + Math.sin(px / 40 + frame * 0.15 + i) * 5 * k}`;
          return <path key={i} d={d} stroke="#9FD0F0" strokeOpacity={0.35} strokeWidth={3 * k} fill="none" />;
        })}
      </g>
    );
    tapa = (
      <g>
        <ellipse cx={x} cy={arriba} rx={rx} ry={ry} fill="#2F6FA3" />
        {[0.35, 0.65].map((t, i) => (
          <ellipse key={i} cx={x} cy={arriba} rx={rx * (t + 0.08 * Math.sin(frame * 0.12 + i * 2))} ry={ry * (t + 0.08 * Math.sin(frame * 0.12 + i * 2))} fill="none" stroke="#9FD0F0" strokeOpacity={0.5} strokeWidth={3 * k} />
        ))}
      </g>
    );
  } else {
    capas = <rect x={x - rx} y={arriba} width={rx * 2} height={alto + ry} fill="#0E1426" />;
    tapa = <ellipse cx={x} cy={arriba} rx={rx} ry={ry} fill="#121829" stroke={bb.ambar} strokeOpacity={0.7} strokeWidth={4 * k} strokeDasharray={`${14 * k} ${10 * k}`} />;
  }
  return (
    <g opacity={opacidad * Math.min(1, aparece * 1.5)} transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * Math.min(1, aparece)}) translate(${-x} ${-y})`}>
      <defs>
        <clipPath id={recorte}>
          <path d={lado} />
        </clipPath>
        <linearGradient id={sombra} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.5} />
          <stop offset="0.35" stopColor="#000" stopOpacity={0} />
          <stop offset="0.7" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${recorte})`}>
        {capas}
        <path d={lado} fill={`url(#${sombra})`} />
      </g>
      {tipo === 'duda' && (
        <>
          <path d={lado} fill="none" stroke={bb.ambar} strokeOpacity={0.7} strokeWidth={4 * k} strokeDasharray={`${14 * k} ${10 * k}`} />
          <SignoPregunta x={x} y={y + ry / 2} lado={9 * k} />
        </>
      )}
      {tapa}
      {etiqueta && (
        <text x={x} y={y + ry / 2 + 16 * k} textAnchor="middle" fontFamily={letra.titulo} fontWeight={900} fontSize={46 * k} letterSpacing={4 * k} fill={bb.hueso} style={{ paintOrder: 'stroke' }} stroke={bb.tinta} strokeWidth={8 * k} strokeOpacity={0.6}>
          {etiqueta}
        </text>
      )}
    </g>
  );
};

/** Tipo de cada piso de la pila: la Tierra arriba, el agua debajo y luego dudas sin fin. */
export const tipoPiso = (i: number): TipoTambor => (i === 0 ? 'tierra' : i === 1 ? 'agua' : 'duda');

type PilaProps = {
  /** Centro del primer piso (la Tierra) en el video, antes de mover la cámara. */
  x?: number;
  y: number;
  paso?: number;
  /** Cuánto bajó la cámara (px). */
  camara?: number;
  /** Cuánto se ve de cada piso (0–1). Devolver 0 para ocultarlo. */
  aparece: (i: number) => number;
  frame?: number;
  /** Rótulo «APOYO n» a la izquierda de cada piso que sostiene. */
  apoyos?: (i: number) => number;
};

/** Pila de apoyos que no termina nunca: solo dibuja los pisos que caen dentro del cuadro. */
export const PilaInfinita: FC<PilaProps> = ({ x = 540, y, paso = 210, camara = 0, aparece, frame = 0, apoyos }) => {
  const primero = Math.max(0, Math.floor((camara - y - 300) / paso));
  const ultimo = Math.ceil((camara + 2200 - y) / paso);
  const pisos: ReactNode[] = [];
  for (let i = ultimo; i >= primero; i--) {
    const a = aparece(i);
    if (a <= 0) continue;
    const yi = y + i * paso - camara;
    const rotulo = apoyos?.(i) ?? 0;
    pisos.push(
      <g key={i}>
        <Tambor x={x} y={yi} tipo={tipoPiso(i)} aparece={a} frame={frame} etiqueta={i === 0 ? 'TIERRA' : i === 1 ? 'AGUA' : undefined} />
        {rotulo > 0 && (
          <text x={x - TAMBOR.rx - 28} y={yi + 12} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={30} fill={bb.verde} opacity={rotulo}>
            {`APOYO ${i}`}
          </text>
        )}
      </g>,
    );
  }
  // Se dibujan de abajo arriba: cada piso tapa la parte de atrás del que tiene debajo.
  return <g>{pisos}</g>;
};
