// Agua, oro y plata (cap 8, Arquímedes): el vaso de píxeles con agua que sube y se derrama por los lados, la bañera
// griega, la corona y el lingote (con cuadritos de plata escondidos), la balanza de dos platos, el martillo y el
// pergamino que se abre. Sin cian: el agua es azul noche. Todo en SVG, para usar dentro de un Lienzo.
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { Halo } from './Bosque';
import { Greca } from './Griego';
import { bb, letra } from './tema';

/** `cae`: el agua que se derrama, más clara para que se vea contra el vidrio. */
export const AGUA = { fondo: '#132B47', medio: '#1D3F66', claro: '#2E6299', cae: '#4F86C6', brillo: '#9CC3EA' };
const VIDRIO = '#6F7FA8';
const PLATA = ['#F4EFE6', '#C9CED6', '#E3E6EC'];

const limitar = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Agua que pasa por encima de una pared (cara de afuera en `borde`, con grosor `pared`) y cae por fuera hasta `abajo`. */
const Chorro: FC<{ borde: number; pared: number; lado: -1 | 1; arriba: number; abajo: number; fuerza: number; reloj: number; l: number }> = ({
  borde, pared, lado, arriba, abajo, fuerza, reloj, l,
}) => {
  if (fuerza <= 0) return null;
  const ancho = l * (1 + 1.6 * limitar(fuerza));
  const x0 = lado < 0 ? borde - ancho : borde;
  const paso = l * 2.6;
  const n = Math.ceil((abajo - arriba) / paso) + 1;
  return (
    <g opacity={limitar(fuerza * 3)}>
      {/* La lámina que cruza el borde y el chorro que baja por fuera */}
      <rect x={lado < 0 ? x0 : borde - pared - l} y={arriba - l * 1.1} width={ancho + pared + l} height={l * 1.2} fill={AGUA.cae} />
      <rect x={x0} y={arriba - l * 0.2} width={ancho} height={abajo - arriba} fill={AGUA.cae} opacity={0.85} />
      {Array.from({ length: n }, (_, k) => {
        const y = arriba + ((reloj * 16 + k * paso) % (n * paso));
        if (y > abajo - 2 * l) return null;
        return <rect key={k} x={x0 + ancho * (k % 2 ? 0.2 : 0.45)} y={y} width={ancho * 0.35} height={l * 1.6} fill={AGUA.brillo} opacity={0.9} />;
      })}
      {/* Salpicaduras abajo */}
      {[0, 1, 2].map((k) => {
        const fase = ((reloj + k * 5) % 14) / 14;
        return (
          <rect key={k} x={x0 + ancho / 2 + lado * (8 + 34 * fase + k * 10) - l * 0.4} y={abajo - l - 120 * fase * (1 - fase) * (0.6 + 0.2 * k)} width={l * 0.8} height={l * 0.8} fill={AGUA.brillo} opacity={1 - fase} />
        );
      })}
    </g>
  );
};

/** Charco en el piso (`y`) que se extiende `extiende` px a cada lado de un objeto de ancho `ancho` centrado en x. */
const Charco: FC<{ x: number; y: number; ancho: number; extiende: number; l: number }> = ({ x, y, ancho, extiende, l }) => {
  if (extiende <= 0) return null;
  const izq = x - ancho / 2 - extiende;
  const total = ancho + 2 * extiende;
  return (
    <g>
      <rect x={izq} y={y - l * 0.6} width={total} height={l} fill={AGUA.cae} />
      <rect x={izq + l} y={y - l * 0.6} width={Math.max(0, total * 0.3)} height={l * 0.3} fill={AGUA.brillo} opacity={0.8} />
      <rect x={izq + total * 0.62} y={y - l * 0.6} width={Math.max(0, total * 0.2)} height={l * 0.3} fill={AGUA.brillo} opacity={0.6} />
    </g>
  );
};

type RecipienteProps = {
  /** Centro y fondo (y) del recipiente. */
  x: number;
  base: number;
  ancho: number;
  alto: number;
  /** Altura del agua: 0 vacío, 1 hasta el borde. */
  nivel: number;
  /** 0–1: el agua rebasa el borde y cae por los dos lados. */
  derrame?: number;
  /** Px que el charco se extiende a cada lado de la base. */
  charco?: number;
  /** Fotograma (para las olas y el agua que cae). */
  reloj: number;
  lado?: number;
  opacidad?: number;
  /** Lo que se mete en el agua: debajo de la superficie se tiñe de agua. */
  children?: ReactNode;
};

/** Vaso o recipiente de vidrio de píxeles, de lado, con agua. */
export const Recipiente: FC<RecipienteProps> = ({ x, base, ancho, alto, nivel, derrame = 0, charco = 0, reloj, lado: l = 10, opacidad = 1, children }) => {
  const izq = x - ancho / 2;
  const der = x + ancho / 2;
  const borde = base - alto;
  const fondo = base - l;
  const superficie = fondo - (alto - l) * limitar(nivel);
  const anchoAgua = ancho - 2 * l;
  const columnas = Math.floor(anchoAgua / l);
  const agitado = 0.5 + 1.2 * limitar(derrame);
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <Charco x={x} y={base} ancho={ancho} extiende={charco} l={l} />
      <rect x={izq + l} y={superficie} width={anchoAgua} height={fondo - superficie} fill={AGUA.medio} />
      {children}
      <rect x={izq + l} y={superficie} width={anchoAgua} height={fondo - superficie} fill={AGUA.claro} opacity={0.38} />
      {Array.from({ length: columnas }, (_, i) => {
        const ola = Math.round(Math.sin(reloj * 0.28 + i * 0.9) * agitado);
        return <rect key={i} x={izq + l + i * l} y={superficie - l * 0.5 + ola * l * 0.35} width={l} height={l * 0.6} fill={AGUA.brillo} opacity={0.75} />;
      })}
      {/* Paredes y fondo de vidrio */}
      <rect x={izq} y={borde} width={l} height={alto} fill={VIDRIO} opacity={0.8} />
      <rect x={der - l} y={borde} width={l} height={alto} fill={VIDRIO} opacity={0.8} />
      <rect x={izq} y={base - l} width={ancho} height={l} fill={VIDRIO} opacity={0.8} />
      <rect x={izq + 1.8 * l} y={borde + 2 * l} width={l * 0.6} height={alto * 0.5} fill="#FFFFFF" opacity={0.14} />
      <Chorro borde={izq} pared={l} lado={-1} arriba={borde} abajo={base} fuerza={derrame} reloj={reloj} l={l} />
      <Chorro borde={der} pared={l} lado={1} arriba={borde} abajo={base} fuerza={derrame} reloj={reloj + 7} l={l} />
    </g>
  );
};

type BaneraProps = {
  /** Centro y piso (y) de la bañera. */
  x: number;
  base: number;
  ancho: number;
  alto: number;
  /** 0–1: el agua llena la boca de la bañera (lo que se ve por arriba). */
  nivel: number;
  derrame?: number;
  charco?: number;
  reloj: number;
  lado?: number;
  opacidad?: number;
  /** Quien se mete: se dibuja entre el fondo y el agua, y la pared de adelante lo tapa. */
  children?: ReactNode;
};

/** Alto de la boca de la bañera (lo que se ve del interior, por encima de la pared de adelante). */
export const bocaBanera = (l = 10) => 5 * l;

/** Bañera griega de terracota, de lado y vista un poco desde arriba. */
export const Banera: FC<BaneraProps> = ({ x, base, ancho, alto, nivel, derrame = 0, charco = 0, reloj, lado: l = 10, opacidad = 1, children }) => {
  const izq = x - ancho / 2;
  const der = x + ancho / 2;
  const pie = base - l * 1.5;
  const borde = pie - alto;
  const boca = bocaBanera(l);
  const superficie = borde - boca * limitar(nivel);
  const columnas = Math.floor((ancho - 2 * l) / l);
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <Charco x={x} y={base} ancho={ancho} extiende={charco} l={l} />
      {/* Borde de atrás y el interior */}
      <rect x={izq} y={borde - boca - l} width={ancho} height={l} fill={bb.terracotaClara} />
      <rect x={izq + l} y={borde - boca} width={ancho - 2 * l} height={boca} fill="#2A1A12" />
      {children}
      {nivel > 0 && (
        <g>
          <rect x={izq + l} y={superficie} width={ancho - 2 * l} height={borde - superficie} fill={AGUA.medio} opacity={0.92} />
          {Array.from({ length: columnas }, (_, i) => {
            const ola = Math.round(Math.sin(reloj * 0.3 + i * 0.8) * (0.6 + limitar(derrame)));
            return <rect key={i} x={izq + l + i * l} y={superficie + ola * l * 0.35} width={l} height={l * 0.5} fill={AGUA.brillo} opacity={0.7} />;
          })}
        </g>
      )}
      {/* Los lados de la boca y la pared de adelante, con la franja de greca */}
      <rect x={izq} y={borde - boca} width={l} height={boca} fill={bb.terracota} />
      <rect x={der - l} y={borde - boca} width={l} height={boca} fill={bb.terracota} />
      <rect x={izq} y={borde} width={ancho} height={alto - 2 * l} fill={bb.terracota} />
      <rect x={izq + l} y={pie - 2 * l} width={ancho - 2 * l} height={l} fill={bb.terracota} />
      <rect x={izq + 2 * l} y={pie - l} width={ancho - 4 * l} height={l} fill={bb.terracotaOscura} />
      <rect x={izq} y={borde + alto * 0.62} width={ancho} height={alto * 0.38 - 2 * l} fill={bb.terracotaOscura} opacity={0.55} />
      <rect x={izq - l * 0.5} y={borde - l * 0.6} width={ancho + l} height={l} fill={bb.terracotaClara} />
      <Greca x={izq + 2 * l} y={borde + alto * 0.28} ancho={ancho - 4 * l} alto={alto * 0.22} color={bb.ambar} grosor={4} />
      {/* Patas */}
      <rect x={izq + 3 * l} y={pie} width={2 * l} height={base - pie} fill={bb.terracotaOscura} />
      <rect x={der - 5 * l} y={pie} width={2 * l} height={base - pie} fill={bb.terracotaOscura} />
      <Chorro borde={izq} pared={l} lado={-1} arriba={borde - l * 0.6} abajo={base} fuerza={derrame} reloj={reloj} l={l} />
      <Chorro borde={der} pared={l} lado={1} arriba={borde - l * 0.6} abajo={base} fuerza={derrame} reloj={reloj + 7} l={l} />
    </g>
  );
};

// --- Oro y plata -------------------------------------------------------------------------------------------------------

const CORONA = [
  '..B.......B.......B..',
  '.BOB.....BOB.....BOB.',
  '.OOO.....OOO.....OOO.',
  '.OOO..B..OOO..B..OOO.',
  '.OOO.OOO.OOO.OOO.OOO.',
  '.OOOOOOOOOOOOOOOOOOO.',
  '.OOOOOOOOOOOOOOOOOOO.',
  'ooooooooooooooooooooo',
  'ooRRoooooGGGoooooRRoo',
  'ooRRoooooGGGoooooRRoo',
  'ooooooooooooooooooooo',
  '.OOOOOOOOOOOOOOOOOOO.',
];

const LINGOTE = ['...BBBBBBBB...', '..OOOOOOOOOO..', '.OOOOOOOOOOOO.', 'oooooooooooooo', 'oooooooooooooo'];

const COLOR_ORO: Record<string, string> = { O: bb.ambar, o: '#C47D10', B: '#FFE3A0', R: bb.terracota, G: bb.verde };

/** Ancho y alto (px) de la corona con ese lado de cuadradito. */
export const medidaCorona = (lado: number) => ({ ancho: CORONA[0].length * lado, alto: CORONA.length * lado });

/** Dibujo de oro de píxeles centrado en (x, y); `plata` 0–1 cambia cuadritos de oro por plata (al azar, con `semilla`). */
const Oro: FC<{ filas: string[]; x: number; y: number; lado: number; plata: number; brillo?: number; semilla: string; opacidad?: number }> = ({
  filas, x, y, lado, plata, brillo = 0, semilla, opacidad = 1,
}) => {
  const x0 = x - (filas[0].length * lado) / 2;
  const y0 = y - (filas.length * lado) / 2;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {brillo > 0 && <Halo x={x} y={y} r={filas[0].length * lado * 0.8} color={bb.ambar} opacidad={0.3 * Math.min(1.5, brillo)} aplastar={0.7} />}
      {filas.flatMap((fila, r) =>
        fila.split('').map((k, c) => {
          if (!COLOR_ORO[k]) return null;
          const esPlata = (k === 'O' || k === 'o') && random(`${semilla}-${r}-${c}`) < plata * 0.45;
          const color = esPlata ? PLATA[Math.floor(random(`${semilla}-p-${r}-${c}`) * PLATA.length)] : COLOR_ORO[k];
          return <rect key={`${r}-${c}`} x={x0 + c * lado} y={y0 + r * lado} width={lado + 0.5} height={lado + 0.5} fill={color} />;
        }),
      )}
    </g>
  );
};

/** Corona de oro de píxeles (21 × 12) centrada en (x, y). `plata` 0–1 deja ver cuadritos de plata mezclados. */
export const CoronaPixeles: FC<{ x: number; y: number; lado: number; plata?: number; brillo?: number; opacidad?: number }> = ({
  x, y, lado, plata = 0, brillo = 0, opacidad,
}) => <Oro filas={CORONA} x={x} y={y} lado={lado} plata={plata} brillo={brillo} semilla="corona" opacidad={opacidad} />;

/** Lingote de oro de lado (14 × 5) centrado en (x, y). */
export const LingotePixeles: FC<{ x: number; y: number; lado: number; brillo?: number; opacidad?: number }> = ({ x, y, lado, brillo = 0, opacidad }) => (
  <Oro filas={LINGOTE} x={x} y={y} lado={lado} plata={0} brillo={brillo} semilla="lingote" opacidad={opacidad} />
);

// --- La balanza ----------------------------------------------------------------------------------------------------------

type BalanzaProps = {
  /** Centro y piso (y) de la balanza. */
  x: number;
  base: number;
  /** Alto del poste (hasta el eje del brazo). */
  alto: number;
  /** Mitad del largo del brazo. */
  brazo: number;
  /** Grados: positivo baja el plato derecho. */
  inclina: number;
  /** Lo que va en cada plato, dibujado con el origen en el centro de la superficie del plato. */
  izquierda?: ReactNode;
  derecha?: ReactNode;
  opacidad?: number;
};

const CUELGA = 0.42;

/** Balanza de dos platos que cuelgan de un brazo; el fiel de arriba marca si está pareja. */
export const Balanza: FC<BalanzaProps> = ({ x, base, alto, brazo, inclina, izquierda, derecha, opacidad = 1 }) => {
  const eje = { x, y: base - alto };
  const a = (inclina * Math.PI) / 180;
  const punta = (lado: -1 | 1) => ({ x: eje.x + lado * brazo * Math.cos(a), y: eje.y + lado * brazo * Math.sin(a) });
  const cuelga = alto * CUELGA;
  const plato = (lado: -1 | 1, contenido: ReactNode) => {
    const p = punta(lado);
    const y = p.y + cuelga;
    return (
      <g>
        <line x1={p.x} y1={p.y} x2={p.x - 70} y2={y} stroke={bb.hueso} strokeWidth={3} opacity={0.7} />
        <line x1={p.x} y1={p.y} x2={p.x + 70} y2={y} stroke={bb.hueso} strokeWidth={3} opacity={0.7} />
        <g transform={`translate(${p.x} ${y})`}>{contenido}</g>
        <path d={`M ${p.x - 86} ${y} L ${p.x + 86} ${y} Q ${p.x + 70} ${y + 30} ${p.x} ${y + 32} Q ${p.x - 70} ${y + 30} ${p.x - 86} ${y} Z`} fill="#B87A10" stroke={bb.tinta} strokeWidth={4} />
        <rect x={p.x - 86} y={y - 3} width={172} height={6} fill={bb.ambar} />
      </g>
    );
  };
  return (
    <g opacity={opacidad}>
      <path d={`M ${x - 90} ${base} L ${x + 90} ${base} L ${x + 50} ${base - 30} L ${x - 50} ${base - 30} Z`} fill="#6B4423" stroke={bb.tinta} strokeWidth={4} />
      <rect x={x - 9} y={eje.y} width={18} height={alto - 30} fill="#8A5A2E" stroke={bb.tinta} strokeWidth={3} />
      {plato(-1, izquierda)}
      {plato(1, derecha)}
      <g transform={`rotate(${inclina} ${eje.x} ${eje.y})`}>
        <rect x={eje.x - brazo - 8} y={eje.y - 8} width={2 * brazo + 16} height={16} rx={8} fill="#C47D10" stroke={bb.tinta} strokeWidth={4} />
        <path d={`M ${eje.x - 9} ${eje.y - 8} L ${eje.x} ${eje.y - 64} L ${eje.x + 9} ${eje.y - 8} Z`} fill={bb.ambar} stroke={bb.tinta} strokeWidth={3} />
      </g>
      <circle cx={eje.x} cy={eje.y} r={12} fill={bb.ambar} stroke={bb.tinta} strokeWidth={4} />
    </g>
  );
};

// --- Martillo y pergamino --------------------------------------------------------------------------------------------------

/** Martillo con el mango hacia abajo; (x, y) es el centro de la cabeza y `angulo` lo gira (grados). */
export const Martillo: FC<{ x: number; y: number; lado: number; angulo?: number; opacidad?: number }> = ({ x, y, lado: l, angulo = 0, opacidad = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo})`} opacity={opacidad} shapeRendering="crispEdges">
    <rect x={-l * 0.8} y={l} width={l * 1.6} height={l * 9} fill="#8A5A2E" />
    <rect x={-l * 0.8} y={l * 8} width={l * 1.6} height={l * 2} fill="#6B4423" />
    <rect x={-l * 3.5} y={-l * 1.5} width={l * 7} height={l * 3} fill="#8C93A8" />
    <rect x={-l * 3.5} y={-l * 1.5} width={l * 7} height={l * 0.8} fill="#C9CED6" />
    <rect x={l * 3.5} y={-l} width={l} height={l * 2} fill="#6E7587" />
  </g>
);

type PergaminoProps = {
  /** Centro del pergamino abierto. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** 0–1: se desenrolla desde el centro. */
  abre: number;
  /** Título («\n» para otro renglón). */
  titulo: string;
  /** 0–1: aparece el dibujo de un cuerpo que flota, con la flecha del empuje. */
  dibujo?: number;
  opacidad?: number;
};

/** Pergamino que se desenrolla, con un título en letras clásicas, renglones escritos y un dibujo de flotación. */
export const Pergamino: FC<PergaminoProps> = ({ x, y, ancho, alto, abre, titulo, dibujo = 0, opacidad = 1 }) => {
  const recorte = useIdSvg();
  if (abre <= 0) return null;
  const visible = ancho * limitar(abre);
  const izq = x - visible / 2;
  const arriba = y - alto / 2;
  const renglones = titulo.split('\n');
  const yTexto = arriba + 70 + renglones.length * 50;
  const centroDibujo = { x, y: y + alto * 0.24 };
  return (
    <g opacity={opacidad}>
      <defs>
        <clipPath id={recorte}>
          <rect x={izq} y={arriba - 10} width={visible} height={alto + 20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${recorte})`}>
        <rect x={x - ancho / 2} y={arriba} width={ancho} height={alto} fill="#E8D9B5" />
        <rect x={x - ancho / 2} y={arriba} width={ancho} height={alto} fill="none" stroke="#B89C6A" strokeWidth={6} />
        {renglones.map((r, i) => (
          <text key={i} x={x} y={arriba + 80 + i * 50} textAnchor="middle" fontFamily={letra.titulo} fontWeight={900} fontSize={42} fill="#3A2614">
            {r}
          </text>
        ))}
        {Array.from({ length: 4 }, (_, i) => {
          const largo = (0.55 + 0.35 * random(`renglon-${i}`)) * (ancho - 120);
          return <rect key={i} x={x - (ancho - 120) / 2} y={yTexto + i * 30} width={largo} height={8} rx={4} fill="#3A2614" opacity={0.45} />;
        })}
        {dibujo > 0 && (
          <g opacity={limitar(dibujo * 2)}>
            {/* Agua, un cuerpo que flota y la flecha del empuje */}
            <line x1={centroDibujo.x - 170} y1={centroDibujo.y} x2={centroDibujo.x + 170} y2={centroDibujo.y} stroke="#2E4A6B" strokeWidth={5} />
            {[-120, -40, 40, 120].map((dx) => (
              <path key={dx} d={`M ${centroDibujo.x + dx - 24} ${centroDibujo.y + 22} q 12 -10 24 0 q 12 10 24 0`} stroke="#2E4A6B" strokeWidth={3} fill="none" opacity={0.6} />
            ))}
            <path d={`M ${centroDibujo.x - 70} ${centroDibujo.y - 40} L ${centroDibujo.x + 70} ${centroDibujo.y - 40} L ${centroDibujo.x + 50} ${centroDibujo.y + 30} L ${centroDibujo.x - 50} ${centroDibujo.y + 30} Z`} fill="none" stroke="#3A2614" strokeWidth={5} />
            <g transform={`translate(0 ${(1 - limitar(dibujo)) * 30})`} opacity={limitar(dibujo * 1.5 - 0.3)}>
              <line x1={centroDibujo.x} y1={centroDibujo.y + 100} x2={centroDibujo.x} y2={centroDibujo.y + 2} stroke={bb.terracota} strokeWidth={8} />
              <path d={`M ${centroDibujo.x - 18} ${centroDibujo.y + 22} L ${centroDibujo.x} ${centroDibujo.y - 6} L ${centroDibujo.x + 18} ${centroDibujo.y + 22} Z`} fill={bb.terracota} />
            </g>
          </g>
        )}
      </g>
      {/* Los dos rollos */}
      {[izq, izq + visible].map((rx, i) => (
        <g key={i}>
          <rect x={rx - 16} y={arriba - 22} width={32} height={alto + 44} rx={14} fill="#8A5A2E" stroke={bb.tinta} strokeWidth={4} />
          <rect x={rx - 10} y={arriba - 34} width={20} height={14} rx={4} fill={bb.ambar} />
          <rect x={rx - 10} y={arriba + alto + 20} width={20} height={14} rx={4} fill={bb.ambar} />
        </g>
      ))}
    </g>
  );
};
