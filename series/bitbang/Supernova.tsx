// La supernova en 2D (especial «El día que una estrella se derrumba»): las casillas de Pauli (un electrón en cada una, que
// se agrietan cuando ceden), flechas de gravedad que aprietan hacia un centro, la cucharadita de materia de estrella y la
// multitud de la balanza, la tabla periódica con los elementos que salen de las estrellas, íconos de sangre y hueso, y una
// persona hecha de polvo de estrellas. Todo en SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { Pixelado } from './Criaturas';
import { PersonaPixeles } from './Papel';
import { bb, letra } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// --- Casillas de Pauli -----------------------------------------------------------------------------------------------

type CasillasProps = {
  /** Centro de la cuadrícula. */
  x: number;
  y: number;
  columnas: number;
  filas: number;
  celda: number;
  /** 0–1: los electrones van ocupando casillas (uno por casilla), en desorden. */
  llena: number;
  /** 0–1: la cuadrícula se agrieta y se descompone (cuando ceden). */
  grieta?: number;
  reloj: number;
  /** Recorte circular (centro y radio) para verla «dentro» del núcleo. */
  recorte?: { x: number; y: number; r: number };
  opacidad?: number;
};

/** Cuadrícula de casillas con un solo electrón en cada una: no cabe ni uno más. */
export const CasillasPauli: FC<CasillasProps> = ({ x, y, columnas, filas, celda, llena, grieta = 0, reloj, recorte, opacidad = 1 }) => {
  const id = useIdSvg();
  const x0 = x - (columnas * celda) / 2;
  const y0 = y - (filas * celda) / 2;
  const total = columnas * filas;
  const casillas = Array.from({ length: total }, (_, i) => {
    const c = i % columnas;
    const f = Math.floor(i / columnas);
    const r = (s: string) => random(`pauli-${i}-${s}`);
    // Al agrietarse, cada casilla se corre y se ladea un poco, y algunas se rompen.
    const dx = grieta * (r('dx') - 0.5) * celda * 0.5;
    const dy = grieta * (r('dy') - 0.5) * celda * 0.5;
    const giro = grieta * (r('g') - 0.5) * 30;
    const cx = x0 + (c + 0.5) * celda + dx;
    const cy = y0 + (f + 0.5) * celda + dy;
    const ocupada = r('orden') < llena * 1.08 - 0.04;
    const llega = limitar((llena * 1.08 - 0.04 - r('orden')) * 8);
    const tiembla = 3 * Math.sin(reloj * 0.9 + i * 1.7);
    return { cx, cy, giro, ocupada, llega, tiembla, rota: grieta > 0.3 && r('rota') < (grieta - 0.3) * 0.9 };
  });
  return (
    <g opacity={opacidad}>
      {recorte && (
        <defs>
          <clipPath id={id}>
            <circle cx={recorte.x} cy={recorte.y} r={recorte.r} />
          </clipPath>
        </defs>
      )}
      <g clipPath={recorte ? `url(#${id})` : undefined} shapeRendering="crispEdges">
        {recorte && <circle cx={recorte.x} cy={recorte.y} r={recorte.r} fill="rgba(5,8,15,0.88)" />}
        {casillas.map((k, i) => (
          <g key={i} transform={`rotate(${k.giro} ${k.cx} ${k.cy})`} opacity={k.rota ? 0.25 : 1}>
            <rect x={k.cx - celda / 2 + 3} y={k.cy - celda / 2 + 3} width={celda - 6} height={celda - 6} fill="rgba(61,214,245,0.07)" stroke={k.rota ? bb.terracotaClara : bb.cian} strokeWidth={3} opacity={0.75} />
            {k.ocupada && (
              <g transform={`translate(${k.cx + k.tiembla * 0.6} ${k.cy - (1 - k.llega) * celda * 0.8 + k.tiembla * 0.4})`} opacity={k.llega}>
                <rect x={-celda * 0.2} y={-celda * 0.2} width={celda * 0.4} height={celda * 0.4} fill={bb.cian} />
                <rect x={-celda * 0.09} y={-celda * 0.09} width={celda * 0.18} height={celda * 0.18} fill="#E8FBFF" />
              </g>
            )}
          </g>
        ))}
        {grieta > 0 && <Grietas x={x} y={y} ancho={columnas * celda} alto={filas * celda} avance={grieta} />}
      </g>
      {recorte && <circle cx={recorte.x} cy={recorte.y} r={recorte.r} fill="none" stroke={bb.cian} strokeWidth={5} />}
    </g>
  );
};

/** Grietas blancas en zigzag que salen del centro. */
const Grietas: FC<{ x: number; y: number; ancho: number; alto: number; avance: number }> = ({ x, y, ancho, alto, avance }) => (
  <g>
    {Array.from({ length: 7 }, (_, k) => {
      const a = (k / 7) * Math.PI * 2 + random(`grieta-${k}`) * 0.6;
      const largo = Math.max(ancho, alto) * 0.62 * limitar(avance * 1.6 - k * 0.06);
      const puntos = [`${x},${y}`];
      for (let s = 1; s <= 6; s++) {
        const d = (largo * s) / 6;
        const lado = (random(`grieta-${k}-${s}`) - 0.5) * 40;
        puntos.push(`${x + Math.cos(a) * d - Math.sin(a) * lado},${y + Math.sin(a) * d + Math.cos(a) * lado}`);
      }
      return <polyline key={k} points={puntos.join(' ')} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinejoin="bevel" opacity={0.9} />;
    })}
  </g>
);

// --- Flechas de gravedad -----------------------------------------------------------------------------------------------

/** Flechas alrededor de un círculo que apuntan a su centro y empujan. `aparece` 0–1, `empuje` 0–1 las mete hacia adentro.
 * Con `afuera`, apuntan hacia afuera (un rebote). */
export const FlechasGravedad: FC<{ cx: number; cy: number; radio: number; cantidad?: number; largo?: number; aparece: number; empuje?: number; reloj: number; color?: string; giro?: number; afuera?: boolean }> = ({
  cx, cy, radio, cantidad = 8, largo = 90, aparece, empuje = 0, reloj, color: c = bb.terracotaClara, giro = 22.5, afuera = false,
}) => {
  if (aparece <= 0) return null;
  const grosor = largo * 0.2;
  return (
    <g opacity={limitar(aparece * 1.5)} shapeRendering="crispEdges">
      {Array.from({ length: cantidad }, (_, k) => {
        const a = ((k * 360) / cantidad + giro) * (Math.PI / 180);
        const latido = 8 * Math.sin(reloj * 0.35 + k);
        const d = radio + largo + 30 * (1 - aparece) - empuje * largo * 0.6 + latido;
        const px = cx + Math.cos(a) * d;
        const py = cy + Math.sin(a) * d;
        const grados = (a * 180) / Math.PI + (afuera ? 0 : 180);
        const base = afuera ? -largo : 0;
        return (
          <g key={k} transform={`translate(${px} ${py}) rotate(${grados}) translate(${base} 0)`}>
            <rect x={0} y={-grosor / 2} width={largo * 0.62} height={grosor} fill={c} />
            <polygon points={`${largo * 0.55},${-grosor * 1.5} ${largo},0 ${largo * 0.55},${grosor * 1.5}`} fill={c} />
          </g>
        );
      })}
    </g>
  );
};

// --- La cucharadita y la multitud -------------------------------------------------------------------------------------

const CUCHARA = [
  '..BBBBB...................',
  '.BMMMMMB..................',
  'BMMWWMMMB.................',
  'BMWWMMMMBHHHHHHHHHHHHHHH..',
  'BMMMMMMMBHHHHHHHHHHHHHHHHH',
  'BMMMMMMMB.............HHH.',
  '.BMMMMMB..................',
  '..BBBBB...................',
];

/** Cucharadita (vista de arriba) llena de materia de estrella de neutrones, blanca y brillante. Centro del cuenco en (x, y). */
export const Cucharadita: FC<{ x: number; y: number; lado: number; brillo?: number; opacidad?: number }> = ({ x, y, lado, brillo = 1, opacidad = 1 }) => {
  const id = useIdSvg();
  // La plantilla mide 26 de ancho y el cuenco está en las columnas 0–8: se corre para que (x, y) caiga en el cuenco.
  const cx = x + (13 - 4.5) * lado;
  return (
    <g opacity={opacidad}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
          <stop offset="0.4" stopColor={bb.ambar} stopOpacity={0.35} />
          <stop offset="1" stopColor={bb.ambar} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={lado * 9} fill={`url(#${id})`} opacity={brillo} />
      <Pixelado filas={CUCHARA} paleta={{ B: '#AEB6C6', H: '#C9CFDA', M: '#F4F7FF', W: '#FFFFFF' }} x={cx} y={y} lado={lado} />
    </g>
  );
};

/** Montón de personitas en pirámide (filas de abajo hacia arriba), con la base en `base`. */
export const Multitud: FC<{ x: number; base: number; alto: number; filas?: number[]; opacidad?: number }> = ({ x, base, alto, filas = [6, 5, 4, 3], opacidad = 1 }) => {
  const ancho = (alto / 17) * 7 * 1.12;
  return (
    <g opacity={opacidad}>
      {filas.flatMap((n, f) =>
        Array.from({ length: n }, (_, k) => <PersonaPixeles key={`${f}-${k}`} x={x + (k - (n - 1) / 2) * ancho} base={base - f * alto * 0.8} alto={alto} />),
      )}
    </g>
  );
};

// --- Tabla periódica -------------------------------------------------------------------------------------------------

/** Columna (1–18) y fila (1–7; lantánidos 8,6 y actínidos 9,6) del elemento de número atómico z. */
const lugarElemento = (z: number): [number, number] => {
  if (z === 1) return [1, 1];
  if (z === 2) return [18, 1];
  if (z <= 4) return [z - 2, 2];
  if (z <= 10) return [z + 8, 2];
  if (z <= 12) return [z - 10, 3];
  if (z <= 18) return [z, 3];
  if (z <= 36) return [z - 18, 4];
  if (z <= 54) return [z - 36, 5];
  if (z <= 56) return [z - 54, 6];
  if (z <= 71) return [z - 57 + 3, 8.6];
  if (z <= 86) return [z - 68, 6];
  if (z <= 88) return [z - 86, 7];
  if (z <= 103) return [z - 89 + 3, 9.6];
  return [z - 100, 7];
};

export type ElementoResaltado = { z: number; simbolo: string; color: string; aparece: number };

/** Tabla periódica esquemática (118 casillas sin texto) con algunos elementos encendidos y su símbolo. (x, y): esquina. */
export const TablaPeriodica: FC<{ x: number; y: number; celda: number; aparece: number; resaltados: ElementoResaltado[]; opacidad?: number }> = ({ x, y, celda, aparece, resaltados, opacidad = 1 }) => {
  if (aparece <= 0) return null;
  const casilla = (z: number) => {
    const [c, f] = lugarElemento(z);
    return { cx: x + (c - 0.5) * celda, cy: y + (f - 0.5) * celda };
  };
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {Array.from({ length: 118 }, (_, i) => {
        const z = i + 1;
        const { cx, cy } = casilla(z);
        const llega = limitar(aparece * 1.6 - (cx - x) / (18 * celda) * 0.6);
        return <rect key={z} x={cx - celda / 2 + 3} y={cy - celda / 2 + 3} width={celda - 6} height={celda - 6} fill="rgba(244,239,230,0.06)" stroke={bb.hueso} strokeWidth={2} opacity={0.35 * llega} />;
      })}
      {resaltados.map((e) => {
        if (e.aparece <= 0) return null;
        const { cx, cy } = casilla(e.z);
        // `aparece` suele venir de un resorte: si pasa de 1, la casilla late un poco más grande.
        const lado = celda * (0.6 + 0.4 * e.aparece);
        return (
          <g key={e.z} opacity={limitar(e.aparece * 1.6)}>
            <rect x={cx - lado / 2} y={cy - lado / 2} width={lado} height={lado} fill={e.color} />
            <text x={cx} y={cy + celda * 0.17} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={celda * 0.48} fill={bb.tinta}>
              {e.simbolo}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** Centro (px) de la casilla del elemento z en una tabla dibujada en (x, y) con esa celda. */
export const centroElemento = (z: number, x: number, y: number, celda: number) => {
  const [c, f] = lugarElemento(z);
  return { x: x + (c - 0.5) * celda, y: y + (f - 0.5) * celda };
};

// --- Íconos --------------------------------------------------------------------------------------------------------

const HUESO = ['.HH.......HH.', 'HHHH.....HHHH', '.HHHHHHHHHHH.', '.DDDDDDDDDDD.', 'DDDD.....DDDD', '.DD.......DD.'];

/** Hueso de píxeles (13 × 6). */
export const HuesoPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <Pixelado filas={HUESO} paleta={{ H: bb.hueso, D: '#C9C2B4' }} x={x} y={y} lado={lado} opacidad={opacidad} />
);

// --- Persona de polvo de estrellas ----------------------------------------------------------------------------------

const SILUETA = [
  '.....XXX.....',
  '....XXXXX....',
  '....XXXXX....',
  '....XXXXX....',
  '.....XXX.....',
  '......X......',
  '..XXXXXXXXX..',
  '.XXXXXXXXXXX.',
  '.XXXXXXXXXXX.',
  'XX.XXXXXXX.XX',
  'XX.XXXXXXX.XX',
  'XX.XXXXXXX.XX',
  'XX.XXXXXXX.XX',
  'XX.XXXXXXX.XX',
  'X..XXXXXXX..X',
  '...XXXXXXX...',
  '...XXX.XXX...',
  '...XXX.XXX...',
  '...XXX.XXX...',
  '...XX...XX...',
  '...XX...XX...',
  '...XX...XX...',
  '...XX...XX...',
  '..XXX...XXX..',
];
const PUNTOS_SILUETA = SILUETA.flatMap((fila, f) => fila.split('').flatMap((k, c) => (k === 'X' ? [{ c, f }] : [])));
const COLORES_POLVO = [bb.cian, bb.ambar, '#FFD24A', bb.hueso, bb.terracotaClara, '#FFFFFF'];

/** Una persona hecha de puntitos de colores que llegan volando desde una nube y titilan. Centro en (x, y). */
export const PersonaEstelar: FC<{ x: number; y: number; lado: number; arma: number; reloj: number; desde?: { x: number; y: number; r: number } }> = ({ x, y, lado, arma, reloj, desde }) => {
  const x0 = x - (SILUETA[0].length * lado) / 2;
  const y0 = y - (SILUETA.length * lado) / 2;
  return (
    <g shapeRendering="crispEdges">
      {PUNTOS_SILUETA.map(({ c, f }, i) => {
        const r = (s: string) => random(`polvo-${i}-${s}`);
        const llega = limitar((arma - r('orden') * 0.5) / 0.5);
        const suave = llega * llega * (3 - 2 * llega);
        const a = r('a') * Math.PI * 2;
        const ox = desde ? desde.x + Math.cos(a) * desde.r * r('d') : x0 + c * lado;
        const oy = desde ? desde.y + Math.sin(a) * desde.r * r('d') : y0 + f * lado;
        const px = ox + (x0 + c * lado - ox) * suave;
        const py = oy + (y0 + f * lado - oy) * suave;
        const titila = 0.6 + 0.4 * Math.sin(reloj * 0.4 + r('t') * 6.28);
        const l = lado * (0.45 + 0.35 * r('l'));
        return <rect key={i} x={px + (lado - l) / 2} y={py + (lado - l) / 2} width={l} height={l} fill={COLORES_POLVO[Math.floor(r('c') * COLORES_POLVO.length)]} opacity={(0.35 + 0.65 * suave) * titila} />;
      })}
    </g>
  );
};
