// El vacío (especial «¿Qué tan vacío es el vacío?», tercero de los límites tras Frio.tsx y Calor.tsx): el cubo de
// alambre de 1 cm³ (o 1 m³) con lo que hay adentro, el borde de la Tierra visto desde la órbita, la trampa helada de
// antimateria vista de lado, las placas de metal del efecto Casimir y las partículas virtuales: parejas (ámbar y
// cian) que aparecen, se separan un poco, vuelven a juntarse y desaparecen con un destello.
// Todo en SVG, dentro de un `Lienzo`, y determinista (random con semilla).
import type { FC } from 'react';
import { random } from 'remotion';
import { Brillo } from './Calor';
import { bb } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// --- El cubo de alambre ----------------------------------------------------------------------------------------

/** Punto (u, v, w) de un cubo isométrico centrado en (x, y) de arista `lado`; u, v, w van de −0,5 a 0,5 (v hacia arriba). */
export const puntoCubo = (x: number, y: number, lado: number, u: number, v: number, w: number) => ({
  x: x + (u - w) * 0.866 * lado,
  y: y + (u + w) * 0.5 * lado - v * lado,
});

// Las 12 aristas: las tres que salen del vértice de atrás (−,−,−) quedan escondidas (punteadas).
const ARISTAS: [number[], number[], boolean][] = [
  [[-1, 1, -1], [1, 1, -1], false],
  [[1, 1, -1], [1, 1, 1], false],
  [[1, 1, 1], [-1, 1, 1], false],
  [[-1, 1, 1], [-1, 1, -1], false],
  [[1, 1, -1], [1, -1, -1], false],
  [[1, 1, 1], [1, -1, 1], false],
  [[-1, 1, 1], [-1, -1, 1], false],
  [[1, -1, -1], [1, -1, 1], false],
  [[1, -1, 1], [-1, -1, 1], false],
  [[-1, 1, -1], [-1, -1, -1], true],
  [[-1, -1, -1], [1, -1, -1], true],
  [[-1, -1, -1], [-1, -1, 1], true],
];

type CuboAlambreProps = {
  x: number;
  y: number;
  lado: number;
  color?: string;
  /** 0–1: las aristas se van dibujando una tras otra. */
  aparece?: number;
  grosor?: number;
  /** Opacidad del relleno de las caras de arriba y de adelante. */
  relleno?: number;
  opacidad?: number;
};

/** Cubo de alambre isométrico (aristas de terminal; las de atrás, punteadas). */
export const CuboAlambre: FC<CuboAlambreProps> = ({ x, y, lado, color: c = bb.verde, aparece = 1, grosor = 5, relleno = 0.06, opacidad = 1 }) => {
  if (aparece <= 0 || opacidad <= 0) return null;
  const p = (a: number[]) => puntoCubo(x, y, lado, a[0] / 2, a[1] / 2, a[2] / 2);
  const cara = (vs: number[][]) => vs.map((v) => p(v)).map((q) => `${q.x},${q.y}`).join(' ');
  return (
    <g opacity={opacidad} strokeLinecap="square">
      {relleno > 0 && (
        <g fill={c} opacity={relleno * limitar(aparece * 2 - 1)}>
          <polygon points={cara([[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]])} />
          <polygon points={cara([[1, 1, -1], [1, 1, 1], [1, -1, 1], [1, -1, -1]])} opacity={0.6} />
          <polygon points={cara([[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]])} opacity={0.35} />
        </g>
      )}
      {ARISTAS.map(([a, b, atras], k) => {
        const t = limitar(aparece * ARISTAS.length - k);
        if (t <= 0) return null;
        const pa = p(a);
        const pb = p(b);
        return (
          <line
            key={k}
            x1={pa.x}
            y1={pa.y}
            x2={pa.x + (pb.x - pa.x) * t}
            y2={pa.y + (pb.y - pa.y) * t}
            stroke={c}
            strokeWidth={atras ? grosor * 0.7 : grosor}
            strokeDasharray={atras ? `${grosor * 2} ${grosor * 2}` : undefined}
            opacity={atras ? 0.45 : 1}
          />
        );
      })}
    </g>
  );
};

// --- El borde de la Tierra -------------------------------------------------------------------------------------

/** Lo de arriba de una Tierra de píxeles enorme (centro en (x, y), muy abajo): solo las celdas entre `desde` y `hasta`
 *  (y), para no dibujar miles de cuadros que no se ven. Con la capa de aire en cian. */
export const HorizonteTierra: FC<{ x: number; y: number; radio: number; desde: number; hasta: number; lado?: number; giro?: number; opacidad?: number }> = ({
  x, y, radio, desde, hasta, lado = 14, giro = 0, opacidad = 1,
}) => {
  if (opacidad <= 0) return null;
  const celdas = [];
  const x0 = Math.floor((x - radio) / lado) * lado;
  for (let cy = Math.floor(desde / lado) * lado + lado / 2; cy < hasta; cy += lado) {
    const dy = cy - y;
    if (Math.abs(dy) > radio) continue;
    const media = Math.sqrt(radio * radio - dy * dy);
    for (let cx = Math.max(x0, Math.floor((x - media) / lado) * lado) + lado / 2; cx < x + media; cx += lado) {
      const d = Math.hypot(cx - x, dy) / radio;
      if (d > 1) continue;
      // Los continentes se corren con `giro` (px): la Tierra gira debajo de la órbita.
      const u = (cx - x + giro) / 150;
      const v = (cy - y) / 60;
      const tierra = Math.sin(u * 1.3 + 1.3) + Math.cos(v * 1.1 - u * 0.7) > 0.7;
      const nube = Math.sin(u * 2.3 + v * 0.9) * Math.cos(u * 0.7 - v * 1.3) > 0.72;
      let fill = tierra ? '#3E9E5A' : '#2F6FA3';
      if (nube) fill = bb.hueso;
      if (d > 0.985) fill = tierra ? '#2B7342' : '#1F4E78';
      celdas.push(<rect key={`${cx}-${cy}`} x={cx - lado / 2} y={cy - lado / 2} width={lado + 0.5} height={lado + 0.5} fill={fill} />);
    }
  }
  return (
    <g opacity={opacidad}>
      <ellipse cx={x} cy={y} rx={radio * 1.03} ry={radio * 1.03} fill={bb.cian} opacity={0.1} />
      <ellipse cx={x} cy={y} rx={radio * 1.012} ry={radio * 1.012} fill="none" stroke={bb.cian} strokeWidth={6} opacity={0.45} />
      <g shapeRendering="crispEdges">{celdas}</g>
    </g>
  );
};

// --- La trampa helada de antimateria, de lado -------------------------------------------------------------------

/** La trampa vista de lado (centro en (x, y)): una columna de anillos dorados dentro de un cilindro helado, con la
 *  partícula brillando en el medio. `helada` 0–1 pone la escarcha; `luz` 0–1 enciende la partícula. */
export const TrampaPixeles: FC<{ x: number; y: number; ancho: number; alto: number; lado?: number; helada?: number; luz?: number; reloj?: number; opacidad?: number }> = ({
  x, y, ancho, alto, lado = 10, helada = 1, luz = 1, reloj = 0, opacidad = 1,
}) => {
  if (opacidad <= 0) return null;
  const cols = Math.round(ancho / lado);
  const filas = Math.round(alto / lado);
  const x0 = x - (cols * lado) / 2;
  const y0 = y - (filas * lado) / 2;
  const celdas = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < filas; j++) {
      const borde = i === 0 || i === cols - 1;
      const tapa = j < 2 || j >= filas - 2;
      const anillo = !borde && !tapa && Math.floor((j - 2) / 3) % 2 === 0 && i > 1 && i < cols - 2;
      const hueco = !borde && !tapa && !anillo;
      let fill = hueco ? '#0E1424' : anillo ? (i % 3 === 0 ? '#C08A2E' : '#D9A441') : '#3A4466';
      if ((borde || tapa) && random(`trampa-hielo-${i}-${j}`) < helada * 0.75) fill = random(`trampa-tono-${i}-${j}`) < 0.5 ? '#BFEFFF' : '#E8FBFF';
      celdas.push(<rect key={`${i}-${j}`} x={x0 + i * lado} y={y0 + j * lado} width={lado + 0.5} height={lado + 0.5} fill={fill} />);
    }
  }
  const px = x + Math.cos(reloj * 0.3) * lado * 0.6;
  const py = y + Math.sin(reloj * 0.21) * lado * 0.8;
  return (
    <g opacity={opacidad}>
      <Brillo x={x} y={y} r={ancho * 0.9} color={bb.cian} opacidad={0.12 * helada} />
      <g shapeRendering="crispEdges">{celdas}</g>
      {luz > 0 && (
        <>
          <Brillo x={px} y={py} r={lado * 4} color={bb.cian} opacidad={0.8 * luz} />
          <rect x={px - lado * 0.6} y={py - lado * 0.6} width={lado * 1.2} height={lado * 1.2} fill="#E8FBFF" opacity={luz} shapeRendering="crispEdges" />
        </>
      )}
    </g>
  );
};

// --- El efecto Casimir -----------------------------------------------------------------------------------------

/** Placa de metal de píxeles, de canto, centrada en (x, y): cuerpo gris acero con un filo claro y uno oscuro. */
export const PlacaMetal: FC<{ x: number; y: number; ancho: number; alto: number; lado?: number; opacidad?: number }> = ({ x, y, ancho, alto, lado = 10, opacidad = 1 }) => {
  if (opacidad <= 0) return null;
  const cols = Math.max(3, Math.round(ancho / lado));
  const filas = Math.round(alto / lado);
  const x0 = x - (cols * lado) / 2;
  const y0 = y - (filas * lado) / 2;
  const celdas = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < filas; j++) {
      const fill = i === 0 ? '#DDE3EE' : i === cols - 1 ? '#55628A' : random(`placa-${i}-${j}`) < 0.12 ? '#A3ACBE' : '#8C95A8';
      celdas.push(<rect key={`${i}-${j}`} x={x0 + i * lado} y={y0 + j * lado} width={lado + 0.5} height={lado + 0.5} fill={fill} />);
    }
  }
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {celdas}
    </g>
  );
};

type ParesProps = {
  /** Rectángulo donde aparecen. */
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  /** Fotograma del video completo (así no saltan entre escenas). */
  reloj: number;
  cantidad: number;
  /** 0–1: qué parte de las parejas está activa (0 = el vacío en calma). */
  aparece?: number;
  lado?: number;
  /** Cuánto se separan (px). */
  separacion?: number;
  /** 0–1 según el lugar: menos parejas donde da menos (p. ej. entre las placas). */
  peso?: (x: number, y: number) => number;
  semilla?: string;
};

/** Partículas virtuales: parejas (ámbar y cian) que nacen juntas, se separan un poco, vuelven y se apagan con un
 *  destello; cada vez en otro lugar. Es la imagen habitual del vacío cuántico, no partículas que se vean. */
export const ParesVirtuales: FC<ParesProps> = ({ x1, x2, y1, y2, reloj, cantidad, aparece = 1, lado = 12, separacion = 46, peso, semilla = 'pares' }) => {
  if (aparece <= 0) return null;
  const piezas = [];
  for (let i = 0; i < cantidad; i++) {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    const periodo = 26 + Math.round(r('p') * 22);
    const corrido = reloj + r('f') * periodo;
    const vuelta = Math.floor(corrido / periodo);
    const t = (corrido % periodo) / periodo;
    const q = (k: string) => random(`${semilla}-${i}-${vuelta}-${k}`);
    const x = x1 + q('x') * (x2 - x1);
    const y = y1 + q('y') * (y2 - y1);
    if (q('v') > aparece * (peso ? peso(x, y) : 1)) continue;
    const vida = 0.72;
    if (t > vida + 0.12) continue;
    const ang = q('a') * Math.PI * 2;
    const abre = t < vida ? Math.sin((Math.PI * t) / vida) : 0;
    const d = (separacion * (0.6 + 0.5 * q('d')) * abre) / 2;
    const l = lado * (0.8 + 0.4 * q('l'));
    const nace = t < 0.1 ? 1 - t / 0.1 : 0;
    const muere = t >= vida ? 1 - (t - vida) / 0.12 : 0;
    const opac = t < vida ? limitar(t / 0.08) : 0;
    piezas.push(
      <g key={i}>
        {opac > 0 && (
          <>
            <line x1={x - Math.cos(ang) * d} y1={y - Math.sin(ang) * d} x2={x + Math.cos(ang) * d} y2={y + Math.sin(ang) * d} stroke={bb.hueso} strokeWidth={2} strokeDasharray="4 5" opacity={0.25 * opac} />
            <rect x={x - Math.cos(ang) * d - l / 2} y={y - Math.sin(ang) * d - l / 2} width={l} height={l} fill={bb.ambar} opacity={opac} />
            <rect x={x + Math.cos(ang) * d - l / 2} y={y + Math.sin(ang) * d - l / 2} width={l} height={l} fill={bb.cian} opacity={opac} />
          </>
        )}
        {(nace > 0 || muere > 0) && <rect x={x - l * 0.7} y={y - l * 0.7} width={l * 1.4} height={l * 1.4} fill="#FFFFFF" opacity={0.8 * Math.max(nace, muere)} />}
      </g>,
    );
  }
  return <g shapeRendering="crispEdges">{piezas}</g>;
};
