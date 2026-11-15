// Personajes al estilo de las vasijas griegas de figuras rojas: cuerpo terracota, pelo y detalles
// en tinta oscura y adornos en ámbar. Se dibujan en SVG con el origen entre los pies, mirando a la derecha
// (para que miren a la izquierda, usar `espejo`). Unos 380 px de alto con escala 1.
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { bb } from './tema';

const T = bb.terracota;
const T2 = '#A84824';
const T3 = bb.terracotaOscura;
const TINTA = bb.tinta;

type Colocar = { x: number; y: number; escala?: number; espejo?: boolean; rot?: number; opacidad?: number };

/** Pone un personaje en (x, y) del lienzo, con su escala, giro y espejo. */
const Colocado: FC<Colocar & { children: ReactNode }> = ({ x, y, escala = 1, espejo, rot = 0, opacidad = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${espejo ? -escala : escala} ${escala})`} opacity={opacidad}>
    {children}
  </g>
);

/** `corto`: pelo corto de romano, sin la cinta ámbar. */
type Pelo = 'largo' | 'rizado' | 'mono' | 'corto';

/** Cabeza de perfil mirando a la derecha, centrada en (0, 0), radio 30. */
export const CabezaGriega: FC<{ barba?: boolean; pelo?: Pelo; risa?: boolean; ojos?: 'normal' | 'arriba' }> = ({
  barba, pelo = 'largo', risa, ojos = 'normal',
}) => (
  <g>
    {pelo === 'mono' && <circle cx={-31} cy={-12} r={15} fill={TINTA} />}
    <circle cx={0} cy={0} r={30} fill={T} />
    <path d="M 27 -7 L 38 3 L 29 7 Z" fill={T} />
    {pelo === 'largo' && <path d="M -31 4 Q -35 -31 -2 -34 Q 24 -35 30 -14 Q 12 -22 -2 -14 Q -10 2 -20 22 Q -30 18 -31 4 Z" fill={TINTA} />}
    {pelo === 'mono' && <path d="M -31 6 Q -34 -31 -2 -34 Q 24 -35 30 -15 Q 12 -21 -2 -13 Q -12 0 -22 10 Z" fill={TINTA} />}
    {pelo === 'rizado' && (
      <g fill={TINTA}>
        <path d="M -30 6 Q -33 -30 -2 -34 Q 22 -34 29 -16 Q 12 -20 -2 -12 Q -12 -2 -20 12 Z" />
        {[[-29, -4], [-25, -19], [-14, -29], [0, -34], [14, -32], [24, -24], [-30, 9]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={8} />
        ))}
      </g>
    )}
    {pelo === 'corto' && (
      <g fill={TINTA}>
        <path d="M -31 2 Q -34 -31 -2 -34 Q 22 -35 29 -18 Q 14 -25 -2 -20 Q -14 -12 -22 2 Z" />
        {[-14, -4, 6, 16].map((x) => (
          <rect key={x} x={x} y={-24} width={6} height={7} transform={`rotate(20 ${x} -24)`} />
        ))}
      </g>
    )}
    {pelo !== 'corto' && (
      <path d={pelo === 'rizado' ? 'M -26 -14 Q 0 -30 28 -20' : 'M -27 -12 Q 0 -27 27 -20'} stroke={bb.ambar} strokeWidth={5} fill="none" strokeLinecap="round" />
    )}
    {barba && (
      <>
        <path d="M -14 4 Q 6 14 31 10 Q 31 30 16 52 Q 0 40 -12 22 Z" fill={TINTA} />
        <path d="M 18 11 Q 26 8 34 12" stroke={TINTA} strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    )}
    {risa && <path d="M 20 12 L 35 11 L 27 23 Z" fill={TINTA} />}
    <ellipse cx={15} cy={-5} rx={6.5} ry={3.4} fill={bb.hueso} />
    <circle cx={ojos === 'arriba' ? 17 : 17.5} cy={ojos === 'arriba' ? -6.5 : -5} r={2.5} fill={TINTA} />
    <path d="M 7 -12 Q 15 -16 23 -12" stroke={TINTA} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

/** Pierna que cuelga de `cadera` y se balancea `angulo` grados. */
const Pierna: FC<{ x: number; y: number; largo: number; angulo: number; color: string }> = ({ x, y, largo, angulo, color: c }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo})`}>
    <rect x={-8} y={0} width={16} height={largo} rx={7} fill={c} />
    <ellipse cx={9} cy={largo - 3} rx={15} ry={6} fill={c} />
    <path d={`M -2 ${largo - 8} L 18 ${largo - 8}`} stroke={bb.ambar} strokeWidth={2.5} opacity={0.8} />
  </g>
);

/** Brazo de dos tramos (hombro → codo → mano), grueso y redondeado. */
const Brazo: FC<{ puntos: [number, number][]; color: string; dedo?: boolean }> = ({ puntos, color: c, dedo }) => {
  const [h, co, m] = puntos;
  const ang = Math.atan2(m[1] - co[1], m[0] - co[0]);
  return (
    <g>
      <path d={`M ${h[0]} ${h[1]} L ${co[0]} ${co[1]} L ${m[0]} ${m[1]}`} stroke={c} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={m[0]} cy={m[1]} r={10} fill={c} />
      {dedo && (
        <line x1={m[0]} y1={m[1]} x2={m[0] + Math.cos(ang) * 24} y2={m[1] + Math.sin(ang) * 24} stroke={c} strokeWidth={6} strokeLinecap="round" />
      )}
    </g>
  );
};

/** Franja ámbar con cuadraditos oscuros: el borde bordado de las túnicas. */
const Ribete: FC<{ d: string; x1: number; x2: number; y: number }> = ({ d, x1, x2, y }) => (
  <g>
    <path d={d} fill={bb.ambar} />
    {Array.from({ length: Math.floor((x2 - x1) / 16) }, (_, i) => (
      <rect key={i} x={x1 + 6 + i * 16} y={y} width={6} height={6} fill={TINTA} opacity={0.8} />
    ))}
  </g>
);

const mezcla = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export type PoseTales = {
  /** Giro de la cabeza en grados (negativo = mira hacia arriba). */
  cabeza?: number;
  /** Fase del paso (radianes). Sin valor, está quieto. */
  paso?: number;
  /** 0 = brazos abajo, 1 = brazos arriba (al caer). */
  brazosArriba?: number;
  ojos?: 'normal' | 'arriba';
};

/** Tales: viejo, barbado, con túnica larga y manto. */
export const Tales: FC<Colocar & PoseTales> = ({ cabeza = 0, paso, brazosArriba = 0, ojos, ...colocar }) => {
  const balanceo = paso === undefined ? 0 : Math.sin(paso) * 17;
  const brazoDelante = [
    [22, -286],
    mezcla([34, -222], [44, -352], brazosArriba),
    mezcla([56, -196], [52, -410], brazosArriba),
  ] as [number, number][];
  const brazoAtras = [
    [-22, -286],
    mezcla([-30, -222], [-44, -352], brazosArriba),
    mezcla([-26, -190], [-58, -404], brazosArriba),
  ] as [number, number][];
  return (
    <Colocado {...colocar}>
      <Brazo puntos={brazoAtras} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={-balanceo} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={balanceo} color={T} />
      <path d="M -30 -298 Q -46 -200 -60 -90 L 56 -90 Q 44 -200 30 -298 Z" fill={T} />
      <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
        <path d="M -12 -262 Q -18 -180 -26 -108" />
        <path d="M 8 -250 Q 10 -170 14 -108" />
        <path d="M 26 -230 Q 34 -170 40 -108" />
      </g>
      <Ribete d="M -58 -106 L 55 -106 L 56 -90 L -60 -90 Z" x1={-58} x2={55} y={-101} />
      <path d="M -31 -296 L 30 -296 L 40 -252 Q 0 -206 -52 -152 L -44 -232 Z" fill={T2} />
      <path d="M 40 -252 Q 0 -206 -52 -152" stroke={TINTA} strokeWidth={3} fill="none" opacity={0.7} />
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <Brazo puntos={brazoDelante} color={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega barba pelo="largo" ojos={ojos} />
      </g>
    </Colocado>
  );
};

/**
 * Tales dentro del pozo: la cabeza y las manos agarradas al borde (el borde en y = 0).
 * Para que la cabeza quede detrás de la pared del pozo y las manos delante, dibujar `parte="cabeza"`,
 * luego la pared, y luego `parte="manos"`.
 */
export const TalesAsomado: FC<Colocar & { cabeza?: number; asoma?: number; parte?: 'cabeza' | 'manos' | 'todo' }> = ({
  cabeza = -10, asoma = 1, parte = 'todo', ...colocar
}) => (
  <Colocado {...colocar}>
    <g transform={`translate(0 ${(1 - asoma) * 90})`}>
      {parte !== 'manos' && (
        <g transform={`translate(0 -38) rotate(${cabeza})`}>
          <CabezaGriega barba pelo="largo" ojos="arriba" />
        </g>
      )}
      {parte !== 'cabeza' && (
        <g opacity={Math.min(1, asoma * 3)}>
          <circle cx={-46} cy={-4} r={13} fill={T} />
          <circle cx={52} cy={-4} r={13} fill={T} />
          <rect x={-56} y={-6} width={20} height={12} rx={5} fill={T} />
          <rect x={42} y={-6} width={20} height={12} rx={5} fill={T} />
        </g>
      )}
    </g>
  </Colocado>
);

/** Vasija de agua (hidria) de figuras negras, para llevar sobre la cabeza. Base en (0, 0). */
const Hidria: FC = () => (
  <g>
    <path d="M -8 0 Q -40 -8 -42 -40 Q -40 -66 -16 -74 L -12 -88 L 12 -88 L 16 -74 Q 40 -66 42 -40 Q 40 -8 8 0 Z" fill={TINTA} />
    <rect x={-18} y={-94} width={36} height={8} rx={3} fill={TINTA} />
    <path d="M -40 -42 Q 0 -30 40 -42" stroke={T} strokeWidth={5} fill="none" />
    <path d="M -36 -26 Q 0 -16 36 -26" stroke={T} strokeWidth={3} fill="none" />
    <path d="M -38 -58 Q -56 -56 -50 -40" stroke={TINTA} strokeWidth={6} fill="none" />
  </g>
);

/** La sirvienta, con túnica larga y la hidria sobre la cabeza. `risa` 0–1 echa la cabeza hacia atrás. */
export const Sirvienta: FC<Colocar & { risa?: number }> = ({ risa = 0, ...colocar }) => (
  <Colocado {...colocar}>
    <Brazo puntos={[[-18, -262], [-34, -210], [-6, -186]]} color={T3} />
    <path d="M -26 -270 Q -42 -150 -54 -6 L 50 -6 Q 38 -150 24 -270 Z" fill={T} />
    <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round">
      <path d="M -10 -190 Q -20 -100 -32 -14" />
      <path d="M 8 -190 Q 10 -100 12 -14" />
      <path d="M 22 -180 Q 30 -100 36 -14" />
    </g>
    <rect x={-32} y={-206} width={60} height={9} fill={bb.ambar} />
    <Ribete d="M -53 -22 L 49 -22 L 50 -6 L -54 -6 Z" x1={-52} x2={48} y={-17} />
    <ellipse cx={-14} cy={-3} rx={14} ry={5} fill={T3} />
    <ellipse cx={30} cy={-3} rx={14} ry={5} fill={T3} />
    <rect x={-8} y={-292} width={16} height={28} fill={T} />
    <g transform={`translate(0 -282) rotate(${-14 * risa}) translate(2 -30)`}>
      <g transform="translate(-2 -26)">
        <Hidria />
      </g>
      <CabezaGriega pelo="mono" risa={risa > 0.3} ojos={risa > 0.3 ? 'arriba' : 'normal'} />
    </g>
    <Brazo puntos={[[18, -262], mezcla([44, -300], [46, -306], risa), mezcla([30, -352], [34, -356], risa)]} color={T} />
  </Colocado>
);

/** El alumno (Anaximandro joven): túnica corta, pelo rizado. `senala` 0–1 levanta el brazo apuntando. */
export const Alumno: FC<Colocar & { senala?: number; cabeza?: number }> = ({ senala = 0, cabeza = 0, ...colocar }) => (
  <Colocado {...colocar}>
    <Brazo puntos={[[-20, -262], [-30, -204], [-20, -170]]} color={T3} />
    <Pierna x={-12} y={-140} largo={140} angulo={4} color={T3} />
    <Pierna x={10} y={-140} largo={140} angulo={-6} color={T} />
    <path d="M -28 -280 Q -40 -200 -50 -128 L 46 -128 Q 36 -200 26 -280 Z" fill={T} />
    <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
      <path d="M -10 -246 Q -16 -190 -24 -142" />
      <path d="M 10 -240 Q 12 -190 16 -142" />
    </g>
    <Ribete d="M -49 -144 L 45 -144 L 46 -128 L -50 -128 Z" x1={-48} x2={44} y={-139} />
    <path d="M -28 -278 L 26 -278 L 34 -244 Q 0 -214 -44 -176 L -40 -230 Z" fill={T2} />
    <rect x={-8} y={-302} width={16} height={28} fill={T} />
    <g transform={`translate(0 -292) rotate(${cabeza}) translate(2 -31)`}>
      <CabezaGriega pelo="rizado" />
    </g>
    <Brazo
      puntos={[[18, -266], mezcla([30, -206], [66, -284], senala), mezcla([46, -180], [118, -300], senala)]}
      color={T}
      dedo={senala > 0.6}
    />
  </Colocado>
);

/**
 * Anaxímenes: sin barba, pelo largo, túnica larga y una banda de manto oscura cruzada sobre el pecho.
 * `extiende` 0–1 adelanta el brazo con la mano abierta (para tocar algo que tiene enfrente).
 */
export const Anaximenes: FC<Colocar & { extiende?: number; cabeza?: number }> = ({ extiende = 0, cabeza = 0, ...colocar }) => {
  const mano = mezcla([50, -194], [134, -266], extiende);
  return (
    <Colocado {...colocar}>
      <Brazo puntos={[[-20, -280], [-30, -218], [-6, -194]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={3} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-4} color={T} />
      <path d="M -28 -296 Q -44 -200 -58 -90 L 54 -90 Q 42 -200 28 -296 Z" fill={T} />
      <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
        <path d="M -14 -240 Q -20 -170 -28 -108" />
        <path d="M 10 -236 Q 12 -170 16 -108" />
        <path d="M 30 -214 Q 36 -160 40 -108" />
      </g>
      <Ribete d="M -56 -106 L 53 -106 L 54 -90 L -58 -90 Z" x1={-56} x2={53} y={-101} />
      <path d="M 24 -296 L 34 -276 L -36 -170 L -44 -192 Z" fill={T3} />
      <path d="M 30 -286 L -40 -182" stroke={bb.ambar} strokeWidth={4} opacity={0.8} />
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega pelo="largo" />
      </g>
      <Brazo puntos={[[18, -282], mezcla([32, -220], [74, -270], extiende), mano]} color={T} />
      {extiende > 0.4 && (
        <g transform={`translate(${mano[0]} ${mano[1]}) rotate(-80)`} opacity={Math.min(1, (extiende - 0.4) * 3)}>
          {[-9, -3, 3, 9].map((dx, i) => (
            <rect key={i} x={dx - 3} y={-26 + Math.abs(i - 1.5) * 3} width={6} height={18} rx={3} fill={T} />
          ))}
          <rect x={-18} y={-6} width={14} height={6} rx={3} fill={T} transform="rotate(-30)" />
        </g>
      )}
    </Colocado>
  );
};

/**
 * Heródoto: barba y pelo rizado, túnica larga y manto ámbar oscuro. `risa` 0–1 echa la cabeza atrás y abre la
 * boca; `senala` 0–1 levanta el brazo apuntando hacia adelante; la otra mano se agarra la panza.
 */
export const Herodoto: FC<Colocar & { risa?: number; senala?: number }> = ({ risa = 0, senala = 0, ...colocar }) => (
  <Colocado {...colocar}>
    <Brazo puntos={[[-22, -284], [-34, -226], [6, -214]]} color={T3} />
    <Pierna x={-6} y={-96} largo={96} angulo={3} color={T3} />
    <Pierna x={8} y={-96} largo={96} angulo={-4} color={T} />
    <path d="M -30 -298 Q -48 -200 -62 -90 L 58 -90 Q 46 -200 30 -298 Z" fill={T} />
    <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
      <path d="M -14 -250 Q -20 -180 -28 -108" />
      <path d="M 12 -246 Q 14 -170 18 -108" />
    </g>
    <Ribete d="M -60 -106 L 57 -106 L 58 -90 L -62 -90 Z" x1={-60} x2={57} y={-101} />
    <path d="M -31 -296 L 30 -296 L 44 -246 Q 4 -196 -54 -150 L -46 -236 Z" fill="#8A5A1C" />
    <path d="M 44 -246 Q 4 -196 -54 -150" stroke={TINTA} strokeWidth={3} fill="none" opacity={0.7} />
    <rect x={-9} y={-322} width={18} height={30} fill={T} />
    <g transform={`translate(0 -312) rotate(${-18 * risa}) translate(2 -33)`}>
      <CabezaGriega barba pelo="rizado" risa={risa > 0.3} ojos={risa > 0.3 ? 'arriba' : 'normal'} />
    </g>
    <Brazo
      puntos={[[20, -284], mezcla([34, -220], [70, -300], senala), mezcla([52, -192], [124, -326], senala)]}
      color={T}
      dedo={senala > 0.6}
    />
  </Colocado>
);

/**
 * Heráclito («el Oscuro»): barba, pelo largo y un manto oscuro con ribete ámbar sobre la túnica larga.
 * `extiende` 0–1 adelanta el brazo con la mano abierta (hacia el fuego o el río).
 */
export const Heraclito: FC<Colocar & { extiende?: number; cabeza?: number }> = ({ extiende = 0, cabeza = 0, ...colocar }) => {
  const mano = mezcla([48, -196], [138, -250], extiende);
  return (
    <Colocado {...colocar}>
      <Brazo puntos={[[-20, -282], [-30, -220], [-8, -196]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={3} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-4} color={T} />
      <path d="M -30 -298 Q -46 -200 -60 -90 L 56 -90 Q 44 -200 30 -298 Z" fill={T} />
      <Ribete d="M -58 -106 L 55 -106 L 56 -90 L -60 -90 Z" x1={-58} x2={55} y={-101} />
      <path d="M -32 -298 L 30 -298 L 46 -220 Q 30 -150 -6 -120 Q -40 -130 -62 -150 L -46 -240 Z" fill="#4A241B" />
      <path d="M 46 -220 Q 30 -150 -6 -120 Q -40 -130 -62 -150" stroke={bb.ambar} strokeWidth={4} fill="none" opacity={0.85} />
      <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round">
        <path d="M -20 -270 Q -26 -210 -34 -150" />
        <path d="M 14 -270 Q 18 -210 12 -140" />
      </g>
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega barba pelo="largo" />
      </g>
      <Brazo puntos={[[18, -284], mezcla([34, -222], [80, -262], extiende), mano]} color={T} />
      {extiende > 0.4 && (
        <g transform={`translate(${mano[0]} ${mano[1]}) rotate(-80)`} opacity={Math.min(1, (extiende - 0.4) * 3)}>
          {[-9, -3, 3, 9].map((dx, i) => (
            <rect key={i} x={dx - 3} y={-26 + Math.abs(i - 1.5) * 3} width={6} height={18} rx={3} fill={T} />
          ))}
        </g>
      )}
    </Colocado>
  );
};

/**
 * Demócrito («el filósofo que ríe»), el alumno: barba corta, pelo rizado, sonrisa, túnica corta y una banda verde
 * oscura cruzada. `senala` 0–1 levanta el brazo apuntando hacia adelante; `risa` 0–1 echa la cabeza un poco atrás.
 */
export const Democrito: FC<Colocar & { senala?: number; risa?: number; cabeza?: number }> = ({ senala = 0, risa = 0, cabeza = 0, ...colocar }) => (
  <Colocado {...colocar}>
    <Brazo puntos={[[-20, -262], [-32, -204], [-10, -176]]} color={T3} />
    <Pierna x={-12} y={-140} largo={140} angulo={4} color={T3} />
    <Pierna x={10} y={-140} largo={140} angulo={-5} color={T} />
    <path d="M -28 -280 Q -42 -200 -52 -128 L 48 -128 Q 38 -200 26 -280 Z" fill={T} />
    <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
      <path d="M -10 -246 Q -16 -190 -26 -142" />
      <path d="M 12 -240 Q 14 -190 18 -142" />
    </g>
    <Ribete d="M -51 -144 L 47 -144 L 48 -128 L -52 -128 Z" x1={-50} x2={46} y={-139} />
    <path d="M 22 -282 L 34 -264 L -38 -150 L -48 -170 Z" fill="#24523C" />
    <path d="M 28 -272 L -42 -160" stroke={bb.verde} strokeWidth={3} opacity={0.7} />
    <rect x={-30} y={-206} width={58} height={8} fill={bb.ambar} />
    <rect x={-8} y={-302} width={16} height={28} fill={T} />
    <g transform={`translate(0 -292) rotate(${cabeza - 10 * risa}) translate(2 -31)`}>
      <CabezaGriega barba pelo="rizado" risa />
    </g>
    <Brazo puntos={[[18, -266], mezcla([30, -206], [66, -284], senala), mezcla([44, -178], [120, -296], senala)]} color={T} dedo={senala > 0.6} />
  </Colocado>
);

/**
 * Leucipo, el maestro (de quien se sabe muy poco): mayor, barba y pelo largos, túnica larga, manto violeta oscuro
 * y un bastón. `explica` 0–1 levanta la mano abierta hacia adelante, como quien enseña.
 */
export const Leucipo: FC<Colocar & { explica?: number; cabeza?: number }> = ({ explica = 0, cabeza = 0, ...colocar }) => {
  const mano = mezcla([50, -196], [118, -300], explica);
  return (
    <Colocado {...colocar}>
      <rect x={-52} y={-372} width={9} height={372} rx={4} fill="#6B4423" stroke={TINTA} strokeWidth={2} />
      <Brazo puntos={[[-20, -282], [-40, -232], [-46, -214]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={2} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-3} color={T} />
      <path d="M -30 -298 Q -46 -200 -60 -90 L 56 -90 Q 44 -200 30 -298 Z" fill={T} />
      <Ribete d="M -58 -106 L 55 -106 L 56 -90 L -60 -90 Z" x1={-58} x2={55} y={-101} />
      <path d="M -32 -298 L 28 -298 L 40 -236 Q 10 -170 -24 -150 L -56 -168 L -44 -244 Z" fill="#3B2F4A" />
      <path d="M 40 -236 Q 10 -170 -24 -150" stroke={bb.hueso} strokeWidth={3} fill="none" opacity={0.6} />
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega barba pelo="largo" />
        <path d="M -12 22 Q 6 40 18 62 Q 2 58 -10 40 Z" fill={TINTA} />
      </g>
      <Brazo puntos={[[18, -284], mezcla([34, -222], [72, -250], explica), mano]} color={T} />
      {explica > 0.4 && (
        <g transform={`translate(${mano[0]} ${mano[1]}) rotate(-100)`} opacity={Math.min(1, (explica - 0.4) * 3)}>
          {[-9, -3, 3, 9].map((dx, i) => (
            <rect key={i} x={dx - 3} y={-26 + Math.abs(i - 1.5) * 3} width={6} height={18} rx={3} fill={T} />
          ))}
        </g>
      )}
    </Colocado>
  );
};

/**
 * Parménides: barba, pelo recogido en un moño y un manto claro, quieto como una estatua.
 * `apoya` 0–1 baja la mano abierta hacia adelante (sobre algo que tiene enfrente); `senala` 0–1 levanta el índice.
 */
export const Parmenides: FC<Colocar & { apoya?: number; senala?: number; cabeza?: number }> = ({ apoya = 0, senala = 0, cabeza = 0, ...colocar }) => {
  const manoApoya = mezcla([52, -192], [130, -214], apoya);
  const mano = mezcla(manoApoya, [70, -390], senala);
  const codo = mezcla(mezcla([34, -224], [86, -236], apoya), [78, -316], senala);
  return (
    <Colocado {...colocar}>
      <Brazo puntos={[[-20, -282], [-30, -220], [-8, -196]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={2} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-2} color={T} />
      <path d="M -30 -298 Q -44 -200 -56 -90 L 54 -90 Q 42 -200 30 -298 Z" fill={T} />
      <Ribete d="M -54 -106 L 53 -106 L 54 -90 L -56 -90 Z" x1={-54} x2={53} y={-101} />
      <path d="M -32 -298 L 24 -298 L 36 -270 L -20 -110 L -50 -110 L -44 -240 Z" fill="#D9C9A8" />
      <g stroke="#A8957A" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M 20 -280 L -32 -130" />
        <path d="M -6 -284 L -40 -170" />
      </g>
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega barba pelo="mono" />
      </g>
      <Brazo puntos={[[18, -284], codo, mano]} color={T} dedo={senala > 0.6} />
    </Colocado>
  );
};

const MANTO_ARQUIMEDES = '#2E4A6B';

/** Dónde queda la mano de adelante de Arquímedes (coordenadas del personaje) según cuánto `sostiene`. */
export const manoArquimedes = (sostiene: number) => mezcla([52, -194], [118, -258], sostiene);

/**
 * Arquímedes de Siracusa: barba y pelo rizado, túnica larga y manto azul noche (el agua) con ribete claro.
 * `sostiene` 0–1 adelanta la mano como quien muestra algo (ver `manoArquimedes`); `senala` 0–1 levanta el índice.
 */
export const Arquimedes: FC<Colocar & { sostiene?: number; senala?: number; cabeza?: number }> = ({ sostiene = 0, senala = 0, cabeza = 0, ...colocar }) => {
  const mano = mezcla(manoArquimedes(sostiene), [124, -326], senala);
  const codo = mezcla(mezcla([34, -222], [82, -234], sostiene), [72, -300], senala);
  return (
    <Colocado {...colocar}>
      <Brazo puntos={[[-20, -282], [-30, -220], [-8, -196]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={3} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-3} color={T} />
      <path d="M -30 -298 Q -46 -200 -60 -90 L 56 -90 Q 44 -200 30 -298 Z" fill={T} />
      <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
        <path d="M -14 -240 Q -20 -170 -28 -108" />
        <path d="M 12 -236 Q 14 -170 18 -108" />
      </g>
      <Ribete d="M -58 -106 L 55 -106 L 56 -90 L -60 -90 Z" x1={-58} x2={55} y={-101} />
      <path d="M -32 -298 L 30 -298 L 42 -238 Q 8 -176 -30 -150 L -58 -160 L -46 -242 Z" fill={MANTO_ARQUIMEDES} />
      <path d="M 42 -238 Q 8 -176 -30 -150" stroke={bb.hueso} strokeWidth={3} fill="none" opacity={0.65} />
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega barba pelo="rizado" />
      </g>
      <Brazo puntos={[[18, -284], codo, mano]} color={T} dedo={senala > 0.6} />
    </Colocado>
  );
};

/**
 * Arquímedes en la bañera: cabeza y hombros, con el origen en la base del cuello (lo de abajo lo tapa el agua).
 * `ojos="arriba"` y `risa` para el momento en que se le ocurre.
 */
export const ArquimedesBano: FC<Colocar & { cabeza?: number; risa?: boolean; ojos?: 'normal' | 'arriba' }> = ({ cabeza = 0, risa, ojos, ...colocar }) => (
  <Colocado {...colocar}>
    <path d="M -70 120 Q -72 20 -40 6 L 40 6 Q 72 20 70 120 Z" fill={T} />
    <path d="M -40 6 Q -50 30 -52 60" stroke={TINTA} strokeWidth={3} fill="none" opacity={0.4} />
    <rect x={-9} y={-16} width={18} height={26} fill={T} />
    <g transform={`translate(0 -6) rotate(${cabeza}) translate(2 -33)`}>
      <CabezaGriega barba pelo="rizado" risa={risa} ojos={ojos} />
    </g>
  </Colocado>
);

/**
 * Arquímedes corriendo desnudo hacia la derecha (con un mosaico de píxeles que lo tapa). `paso` es la fase de la
 * carrera (radianes); `grita` 0–1 echa la cabeza atrás y abre la boca.
 */
export const ArquimedesCorre: FC<Colocar & { paso: number; grita?: number }> = ({ paso, grita = 0, ...colocar }) => {
  const s = Math.sin(paso);
  const brazo = (lado: 1 | -1): [number, number][] => {
    const hombro: [number, number] = [lado > 0 ? 14 : -10, -282];
    const t = (lado * 38 * s * Math.PI) / 180;
    const codo: [number, number] = [hombro[0] + 62 * Math.sin(t), hombro[1] + 62 * Math.cos(t)];
    // El antebrazo, doblado hacia adelante.
    return [hombro, codo, [codo[0] + 50 * Math.cos(t), codo[1] - 50 * Math.sin(t)]];
  };
  const bloque = Math.floor(paso * 1.5);
  return (
    <Colocado {...colocar}>
      <g transform="rotate(8 0 -150)">
        <Brazo puntos={brazo(-1)} color={T3} />
      </g>
      <Pierna x={-4} y={-152} largo={150} angulo={-34 * s} color={T3} />
      <Pierna x={6} y={-152} largo={150} angulo={34 * s} color={T} />
      <g transform="rotate(8 0 -150)">
        <path d="M -28 -292 Q -36 -220 -30 -146 L 32 -146 Q 38 -220 28 -292 Z" fill={T} />
        <path d="M 8 -262 Q 20 -246 24 -226" stroke={TINTA} strokeWidth={3} fill="none" opacity={0.45} />
        <rect x={-9} y={-316} width={18} height={30} fill={T} />
        <g transform={`translate(0 -306) rotate(${-16 * grita}) translate(2 -33)`}>
          <CabezaGriega barba pelo="rizado" risa={grita > 0.3} />
        </g>
        <Brazo puntos={brazo(1)} color={T} />
        {/* El mosaico que lo tapa */}
        <g shapeRendering="crispEdges">
          {Array.from({ length: 12 }, (_, i) => {
            const c = i % 4;
            const r = Math.floor(i / 4);
            const tono = [T, T2, bb.hueso, T3][Math.floor(random(`censura-${i}-${bloque}`) * 4)];
            return <rect key={i} x={-34 + c * 17} y={-172 + r * 17} width={17.5} height={17.5} fill={tono} />;
          })}
        </g>
      </g>
    </Colocado>
  );
};

/** El rey Hierón de Siracusa: barba, túnica larga púrpura con bordes ámbar, cetro y una diadema de oro. `senala` 0–1 apunta adelante. */
export const Hieron: FC<Colocar & { senala?: number; cabeza?: number }> = ({ senala = 0, cabeza = 0, ...colocar }) => (
  <Colocado {...colocar}>
    <rect x={-50} y={-400} width={9} height={400} rx={4} fill="#C47D10" stroke={TINTA} strokeWidth={2} />
    <circle cx={-45.5} cy={-404} r={13} fill={bb.ambar} stroke={TINTA} strokeWidth={3} />
    <Brazo puntos={[[-20, -282], [-40, -240], [-44, -224]]} color={T3} />
    <Pierna x={-6} y={-96} largo={96} angulo={2} color={T3} />
    <Pierna x={8} y={-96} largo={96} angulo={-3} color={T} />
    <path d="M -32 -300 Q -50 -200 -66 -84 L 62 -84 Q 46 -200 32 -300 Z" fill="#5B2A5E" />
    <g stroke={TINTA} strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round">
      <path d="M -12 -250 Q -20 -170 -30 -100" />
      <path d="M 14 -246 Q 16 -170 22 -100" />
    </g>
    <Ribete d="M -64 -102 L 60 -102 L 62 -84 L -66 -84 Z" x1={-64} x2={60} y={-96} />
    <path d="M -34 -300 L 32 -300 L 30 -280 L -32 -280 Z" fill={bb.ambar} />
    <rect x={-9} y={-322} width={18} height={30} fill={T} />
    <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
      <CabezaGriega barba pelo="largo" />
      <path d="M -26 -26 L -22 -50 L -12 -36 L -2 -56 L 8 -36 L 18 -50 L 22 -26 Z" fill={bb.ambar} stroke={TINTA} strokeWidth={3} />
    </g>
    <Brazo puntos={[[18, -284], mezcla([36, -222], [72, -298], senala), mezcla([54, -196], [126, -322], senala)]} color={T} dedo={senala > 0.6} />
  </Colocado>
);

/**
 * Vitruvio, el arquitecto romano que contó la historia: sin barba, pelo corto y toga clara con franja terracota.
 * Sostiene un pergamino abierto y escribe en él (`escribe` es la fase de la mano con el punzón).
 */
export const Vitruvio: FC<Colocar & { escribe?: number; cabeza?: number }> = ({ escribe = 0, cabeza = 6, ...colocar }) => {
  const punzon: [number, number] = [96 + 16 * Math.sin(escribe), -214 + 5 * Math.cos(escribe * 2)];
  return (
    <Colocado {...colocar}>
      <Brazo puntos={[[-20, -282], [10, -226], [44, -214]]} color={T3} />
      <Pierna x={-6} y={-96} largo={96} angulo={2} color={T3} />
      <Pierna x={8} y={-96} largo={96} angulo={-2} color={T} />
      <path d="M -32 -298 Q -48 -200 -62 -90 L 58 -90 Q 46 -200 32 -298 Z" fill="#E8E1D3" />
      <path d="M 30 -298 L 44 -270 L -34 -96 L -60 -96 Z" fill="#D2C8B4" />
      <path d="M 44 -270 L -34 -96" stroke={bb.terracota} strokeWidth={9} />
      <g stroke="#A8957A" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8}>
        <path d="M -14 -250 Q -22 -170 -30 -110" />
        <path d="M 14 -230 Q 18 -170 24 -110" />
      </g>
      <rect x={-9} y={-322} width={18} height={30} fill={T} />
      <g transform={`translate(0 -312) rotate(${cabeza}) translate(2 -33)`}>
        <CabezaGriega pelo="corto" />
      </g>
      {/* El pergamino abierto */}
      <rect x={34} y={-238} width={92} height={44} fill={bb.hueso} stroke="#B89C6A" strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={44} y={-228 + i * 11} width={50 + ((i * 17) % 22)} height={4} fill={TINTA} opacity={0.45} />
      ))}
      <rect x={28} y={-244} width={10} height={56} rx={4} fill="#8A5A2E" />
      <rect x={122} y={-244} width={10} height={56} rx={4} fill="#8A5A2E" />
      <Brazo puntos={[[18, -284], [56, -232], punzon]} color={T} />
      <line x1={punzon[0]} y1={punzon[1]} x2={punzon[0] - 8} y2={punzon[1] - 26} stroke={bb.ambar} strokeWidth={4} strokeLinecap="round" />
    </Colocado>
  );
};
