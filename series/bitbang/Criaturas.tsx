// Criaturas de píxeles de la serie (2D): el pez y el bebé. Cada dibujo es una plantilla de letras
// (una letra = un cuadradito de un color; '.' = vacío), centrada en (x, y) y mirando a la derecha.
import type { FC } from 'react';
import { bb } from './tema';

export type Paleta = Record<string, string>;

type PixeladoProps = {
  filas: string[];
  paleta: Paleta;
  x: number;
  y: number;
  /** Lado de cada cuadradito (px). */
  lado: number;
  espejo?: boolean;
  /** 0–1: se arma de izquierda a derecha. */
  aparece?: number;
  opacidad?: number;
};

/** Dibujo de píxeles a partir de una plantilla de letras, para usar dentro de un SVG. */
export const Pixelado: FC<PixeladoProps> = ({ filas, paleta, x, y, lado, espejo, aparece = 1, opacidad = 1 }) => {
  const ancho = filas[0].length;
  const x0 = x - (ancho * lado) / 2;
  const y0 = y - (filas.length * lado) / 2;
  return (
    <g shapeRendering="crispEdges" opacity={opacidad}>
      {filas.flatMap((fila, r) =>
        fila.split('').map((k, c) => {
          const relleno = paleta[k];
          if (!relleno || (c + r * 0.4) / (ancho + filas.length * 0.4) > aparece * 1.05) return null;
          const col = espejo ? ancho - 1 - c : c;
          return <rect key={`${r}-${c}`} x={x0 + col * lado} y={y0 + r * lado} width={lado + 0.5} height={lado + 0.5} fill={relleno} />;
        }),
      )}
    </g>
  );
};

const PEZ = [
  '.......DDDD.......',
  '......DDDDDD......',
  'TT...BBBBBBBBBB...',
  'TTT.BBBBBBBBGBBBB.',
  '.TTBBBBBBBBBGBWWB.',
  '..TBBBBBBBBBGBWKBB',
  '.TTLLLLLLLLLGLLLL.',
  'TTT.LLLLLLLLLLLL..',
  'TT....LLLLLLLLL...',
  '.......FFF........',
];

const PALETA_PEZ: Paleta = {
  B: '#2F6FA3',
  L: '#9FD0F0',
  D: '#1D3F66',
  T: '#1D3F66',
  F: '#1D3F66',
  G: '#183556',
  W: bb.hueso,
  K: bb.tinta,
};

/** Pez de píxeles (18 × 10 cuadraditos). */
export const PezPixeles: FC<Omit<PixeladoProps, 'filas' | 'paleta'>> = (props) => <Pixelado filas={PEZ} paleta={PALETA_PEZ} {...props} />;

const BEBE = [
  '....HHHH....',
  '...HSSSSH...',
  '..SSSSSSSS..',
  '.SSSSSSSSSS.',
  '.SSKSSSSKSS.',
  '.SSSSSSSSSS.',
  '.SSSSRRSSSS.',
  '..SSSSSSSS..',
  '....SSSS....',
  'S.SSSSSSSS.S',
  'SSSSSSSSSSSS',
  '..PPPPPPPP..',
  '..PPPPPPPP..',
  '.SSS....SSS.',
];

const PALETA_BEBE: Paleta = { S: bb.terracotaClara, H: bb.tinta, K: bb.tinta, R: bb.terracotaOscura, P: bb.hueso };

/** Bebé de frente, de píxeles (12 × 14 cuadraditos): cabeza grande, pañal y los brazos abiertos. */
export const BebePixeles: FC<Omit<PixeladoProps, 'filas' | 'paleta'>> = (props) => <Pixelado filas={BEBE} paleta={PALETA_BEBE} {...props} />;

const MICROBIO = [
  '....GGGGGGGG....',
  '..GGLLLLLLLLGG..',
  '.GLLWLLLLLLLLLG.',
  '.GLLLLLLLWLLLLG.',
  '.GLLLLWLLLLLLLG.',
  '..GGLLLLLLLLGG..',
  '....GGGGGGGG....',
];

const MICROBIO_APAGADO: Paleta = { G: '#2A3142', L: '#3A4256', W: '#55607A' };
const MICROBIO_ENCENDIDO: Paleta = { G: '#1FA35A', L: '#5BE38F', W: '#D2FFE6' };

/**
 * Microbio de píxeles (un bacilo de 16 × 7 con su cola), centrado en (x, y) y mirando a la derecha.
 * `enciende` 0–1 lo pasa de gris a verde con brillo; la cola ondula con `frame`.
 */
export const MicrobioPixeles: FC<{ x: number; y: number; lado: number; enciende?: number; frame: number; aparece?: number; opacidad?: number; espejo?: boolean }> = ({
  x, y, lado, enciende = 1, frame, aparece = 1, opacidad = 1, espejo,
}) => {
  if (aparece <= 0) return null;
  const encendido = enciende > 0.5;
  const paleta = encendido ? MICROBIO_ENCENDIDO : MICROBIO_APAGADO;
  const s = espejo ? -1 : 1;
  // Cola: cuadraditos sobre una onda que avanza.
  const cola = Array.from({ length: 7 }, (_, k) => ({ dx: (8 + k) * lado, dy: Math.round(1.3 * Math.sin(frame / 4 - k * 0.9)) * lado * 0.6 }));
  return (
    <g
      transform={`translate(${x} ${y + Math.sin(frame / 9) * lado * 0.4}) scale(${0.6 + 0.4 * Math.min(1, aparece)})`}
      opacity={Math.min(1, aparece * 1.6) * opacidad}
      style={{ filter: enciende > 0 ? `drop-shadow(0 0 ${18 * enciende}px #39FF88${encendido ? 'aa' : '44'})` : undefined }}
      shapeRendering="crispEdges"
    >
      {cola.map((c, k) => (
        <rect key={k} x={s * c.dx - (s < 0 ? lado : 0)} y={c.dy - lado / 2} width={lado} height={lado} fill={paleta.G} opacity={1 - k * 0.1} />
      ))}
      <Pixelado filas={MICROBIO} paleta={paleta} x={0} y={0} lado={lado} espejo={espejo} />
    </g>
  );
};

const CELULA = [
  '...CCCCC...',
  '.CCLLLLLCC.',
  '.CLLLLLMLC.',
  'CLLNNNLLLLC',
  'CLNNONNLLLC',
  'CLNNNNNLMLC',
  'CLLNNNLLLLC',
  '.CLMLLLLLC.',
  '.CCLLLLLCC.',
  '...CCCCC...',
];

/** Célula compleja (eucariota) de píxeles, 11 × 10: membrana cian, núcleo ámbar y mitocondrias terracota. */
export const CelulaPixeles: FC<Omit<PixeladoProps, 'filas' | 'paleta'>> = (props) => (
  <Pixelado filas={CELULA} paleta={{ C: '#2BA8C8', L: '#7FE3F5', N: bb.ambar, O: '#FFD9A0', M: bb.terracotaClara }} {...props} />
);
