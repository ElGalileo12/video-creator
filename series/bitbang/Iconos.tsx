// Íconos de píxeles de la serie (plantillas de letras, centradas en (x, y)): bombilla (inteligencia),
// cohete (tecnología), rover y roca (Marte), gota de agua, y otras historias famosas: la manzana de Newton,
// la torre de Pisa y el pozo de Tales; y la Estación Espacial. Para usar dentro de un SVG.
import type { FC } from 'react';
import { Pixelado } from './Criaturas';
import { bb } from './tema';

const BOMBILLA = ['...HHH...', '..HYYYH..', '.HYYWYYH.', '.HYWYYYH.', '.HYYYYYH.', '..HYYYH..', '...HYH...', '...GGG...', '...GGG...', '....G....'];

/** Bombilla (9 × 10). `luz` 0–1 la enciende en ámbar con un halo. */
export const BombillaPixeles: FC<{ x: number; y: number; lado: number; luz: number; opacidad?: number }> = ({ x, y, lado, luz, opacidad = 1 }) => (
  <g opacity={opacidad}>
    {luz > 0 && <circle cx={x} cy={y - lado} r={lado * 7} fill={bb.ambar} opacity={0.22 * luz} />}
    <Pixelado
      filas={BOMBILLA}
      paleta={{ H: bb.hueso, Y: luz > 0.5 ? bb.ambar : '#3A3F52', W: luz > 0.5 ? bb.hueso : '#55607A', G: '#8C93A8' }}
      x={x}
      y={y}
      lado={lado}
    />
  </g>
);

const COHETE = ['....H....', '...HHH...', '...HCH...', '..HHHHH..', '..HCCCH..', '..HHHHH..', '..HHHHH..', '.AHHHHHA.', 'AAHHHHHAA', 'AA.HHH.AA'];

/** Cohete (9 × 10) que apunta arriba. `fuego` 0–1 enciende la llama, que titila con `frame`. */
export const CohetePixeles: FC<{ x: number; y: number; lado: number; fuego?: number; frame: number; apagado?: boolean; opacidad?: number }> = ({
  x, y, lado, fuego = 0, frame, apagado, opacidad = 1,
}) => {
  const largo = 1 + ((frame >> 1) % 3);
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {fuego > 0 &&
        [-1, 0, 1].map((k) => (
          <rect key={k} x={x + (k - 0.5) * lado} y={y + 5 * lado} width={lado} height={(k === 0 ? largo + 1 : largo) * lado * fuego} fill={k === 0 ? bb.hueso : bb.ambar} opacity={0.9} />
        ))}
      <Pixelado filas={COHETE} paleta={apagado ? { H: '#55607A', C: '#3A4256', A: '#3A3F52' } : { H: bb.hueso, C: bb.cian, A: bb.terracotaClara }} x={x} y={y} lado={lado} />
    </g>
  );
};

const ROVER = [
  '.........M....',
  '........MMM...',
  '.........M....',
  '..PPPPPPPPPP..',
  '.HHHHHHHHHHHH.',
  '..HKHHHHHHKH..',
  '.WWW.WWW..WWW.',
  '.WWW.WWW..WWW.',
];

/** Rover de Marte de perfil (14 × 8), mirando a la derecha. */
export const RoverPixeles: FC<{ x: number; y: number; lado: number; espejo?: boolean; opacidad?: number }> = ({ x, y, lado, espejo, opacidad = 1 }) => (
  <Pixelado filas={ROVER} paleta={{ M: bb.hueso, P: '#2F6FA3', H: bb.hueso, K: '#8C93A8', W: '#3A3F52' }} x={x} y={y} lado={lado} espejo={espejo} opacidad={opacidad} />
);

const ROCA = ['...RRRR...', '..RRSRRRR.', '.RRRRRRSRR', 'RRSRRRRRRR', 'RRRRRRRRRR'];

/** Roca gris (10 × 5): «nada», una piedra muerta. */
export const RocaPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <Pixelado filas={ROCA} paleta={{ R: '#7A6A5E', S: '#A3917F' }} x={x} y={y} lado={lado} opacidad={opacidad} />
);

const GOTA = ['....C....', '....C....', '...CCC...', '...CCC...', '..CCCCC..', '.CCLCCCC.', '.CLLCCCC.', 'CCLCCCCDC', 'CCCCCCCDC', '.CCCCCDD.', '..CDDDD..'];

const PALETAS_GOTA = { agua: { C: bb.cian, L: '#DFF8FF', D: '#1E8FB0' }, sangre: { C: '#D8303A', L: '#FFB3B3', D: '#8E1622' } };

/** Gota de agua (9 × 11), cian con un brillo; `tipo="sangre"` la pinta roja. */
export const GotaPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number; tipo?: keyof typeof PALETAS_GOTA }> = ({ x, y, lado, opacidad = 1, tipo = 'agua' }) => (
  <Pixelado filas={GOTA} paleta={PALETAS_GOTA[tipo]} x={x} y={y} lado={lado} opacidad={opacidad} />
);

const MANZANA = ['.....T.....', '....TL.....', '..RRR.RRR..', '.RRRRRRRRR.', 'RRHRRRRRRRR', 'RHRRRRRRRRR', 'RRRRRRRRRRR', 'RRRRRRRRRRR', '.RRRRRRRRR.', '..RRRRRRR..', '...RR.RR...'];

/** Manzana (11 × 11), la de Newton. */
export const ManzanaPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <Pixelado filas={MANZANA} paleta={{ R: bb.terracota, H: bb.hueso, T: '#6B4423', L: bb.verde }} x={x} y={y} lado={lado} opacidad={opacidad} />
);

const TORRE = ['..HHHHH..', '..HAHAH..', '.HHHHHHH.', '.HAHAHAH.', '.HHHHHHH.', '.HAHAHAH.', '.HHHHHHH.', '.HAHAHAH.', '.HHHHHHH.', '.HAHAHAH.', '.HHHHHHH.', '.HAHAHAH.', '.HHHHHHH.', 'HHHHHHHHH'];

/** Torre inclinada de Pisa (9 × 14), la de Galileo. */
export const TorrePisaPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <g transform={`rotate(6 ${x} ${y + 7 * lado})`}>
    <Pixelado filas={TORRE} paleta={{ H: bb.hueso, A: '#55607A' }} x={x} y={y} lado={lado} opacidad={opacidad} />
  </g>
);

const POZO = ['.WWWWWWWWW.', 'WWWWWWWWWWW', '.P.......P.', '.P...C...P.', '.P...C...P.', '.P..BBB..P.', 'SSSSSSSSSSS', 'SDSSDSSDSSS', 'SSSSSSSSSSS', 'SSDSSSDSSDS', 'SSSSSSSSSSS'];

/** Pozo de piedra con techito (11 × 11), el de Tales. */
export const PozoPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <Pixelado filas={POZO} paleta={{ W: bb.terracota, P: '#6B4423', C: bb.hueso, B: bb.ambar, S: '#8C93A8', D: '#55607A' }} x={x} y={y} lado={lado} opacidad={opacidad} />
);

const ESTACION = [
  '.PQ.PQ...........PQ.PQ.',
  '.QP.QP...........QP.QP.',
  '.PQ.PQ.....R.....PQ.PQ.',
  '.QP.QP....HHH....QP.QP.',
  'TTTTTTTTTTTHTTTTTTTTTTT',
  '.PQ.PQ....HHH....PQ.PQ.',
  '.QP.QP.....H.....QP.QP.',
  '.PQ.PQ....RHR....PQ.PQ.',
  '.QP.QP...........QP.QP.',
];

/** La Estación Espacial Internacional (23 × 9): la viga larga con sus paneles solares y los módulos en el medio. */
export const EstacionPixeles: FC<{ x: number; y: number; lado: number; opacidad?: number }> = ({ x, y, lado, opacidad = 1 }) => (
  <Pixelado filas={ESTACION} paleta={{ P: '#2F6FA3', Q: '#C9A24A', T: '#B9C6E0', H: bb.hueso, R: '#8C93A8' }} x={x} y={y} lado={lado} opacidad={opacidad} />
);
