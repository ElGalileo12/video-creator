// El bosque oscuro (especial «El bosque oscuro»): pinos de píxeles en tres capas con profundidad (lejos claros y
// brumosos, cerca casi negros), cazadores en silueta con un ojo que brilla, ojos sueltos que se abren en la oscuridad,
// miras y anillos de señal que delatan a quien emite. Para usar dentro de un SVG (Lienzo).
// En un video horizontal las capas y la bruma se estiran hasta los bordes del cuadro (`useMarco`).
import type { FC } from 'react';
import { random } from 'remotion';
import { useMarco } from '../../src/horizontal';
import { Pixelado } from './Criaturas';
import { bb } from './tema';

/** Camino SVG de un pino de píxeles con la base en (x, base): pisos escalonados que se abren hacia abajo y un tronco. */
export const caminoPino = (x: number, base: number, alto: number, lado: number, pisos = 4) => {
  const filas = Math.max(6, Math.round(alto / lado));
  const tronco = Math.max(1, Math.round(filas * 0.08));
  const copa = filas - tronco;
  const anchoMax = alto * 0.34;
  const top = base - filas * lado;
  let d = '';
  for (let r = 0; r < filas; r++) {
    let mitad: number;
    if (r < copa) {
      const t = (r + 0.5) / copa;
      const piso = Math.min(pisos - 1, Math.floor(t * pisos));
      const dentro = t * pisos - piso;
      mitad = anchoMax * ((piso + 1) / pisos) * (0.3 + 0.7 * dentro);
    } else {
      mitad = Math.max(lado * 0.5, anchoMax * 0.07);
    }
    const m = Math.max(1, Math.round(mitad / lado)) * lado - lado / 2;
    d += `M${x - m},${top + r * lado}h${2 * m}v${lado + 0.5}h${-2 * m}z`;
  }
  return d;
};

/** Borde iluminado (luz de luna desde la izquierda) de un pino: un cuadradito en el extremo izquierdo de cada fila. */
const caminoBordePino = (x: number, base: number, alto: number, lado: number, pisos = 4) => {
  const filas = Math.max(6, Math.round(alto / lado));
  const tronco = Math.max(1, Math.round(filas * 0.08));
  const copa = filas - tronco;
  const anchoMax = alto * 0.34;
  const top = base - filas * lado;
  let d = '';
  for (let r = 0; r < copa; r++) {
    const t = (r + 0.5) / copa;
    const piso = Math.min(pisos - 1, Math.floor(t * pisos));
    const dentro = t * pisos - piso;
    const m = Math.max(1, Math.round((anchoMax * ((piso + 1) / pisos) * (0.3 + 0.7 * dentro)) / lado)) * lado - lado / 2;
    d += `M${x - m},${top + r * lado}h${lado * 0.6}v${lado}h${-lado * 0.6}z`;
  }
  return d;
};

export type NombreCapa = 'lejos' | 'medio' | 'cerca';

type DatosCapa = { base: number; alto: [number, number]; lado: number; color: string; borde?: string; suelo: string; paralaje: number; xs: number[] };

/** Las tres capas. `xs`: dónde va cada pino (coordenadas del mundo; el claro del medio queda libre para los cazadores). */
export const CAPAS_BOSQUE: Record<NombreCapa, DatosCapa> = {
  lejos: {
    base: 1160,
    alto: [230, 400],
    lado: 8,
    color: '#1A2440',
    borde: '#27355A',
    suelo: '#121A2D',
    paralaje: 0.35,
    xs: [-260, -170, -80, 10, 95, 180, 255, 340, 430, 520, 610, 700, 780, 870, 950, 1040, 1130, 1220, 1310],
  },
  medio: {
    base: 1270,
    alto: [430, 660],
    lado: 12,
    color: '#0E1528',
    borde: '#1F2B4C',
    suelo: '#090D19',
    paralaje: 0.65,
    xs: [-300, -160, -30, 90, 950, 1080, 1220, 1360],
  },
  cerca: { base: 1990, alto: [1150, 1400], lado: 18, color: '#04060C', suelo: '#04060C', paralaje: 1, xs: [-170, 1250] },
};

/** Una capa del bosque. `camara`: cuánto se corrió la vista a la derecha (px); `sube` 0–1: los pinos salen desde abajo. */
/**
 * Pinos de más a los lados, solo cuando se ve más que el lienzo vertical (video horizontal): siguen el paso de la capa
 * hacia afuera hasta el borde del cuadro. En vertical no hay ninguno, así los cortos quedan igual.
 */
const pinosDeMas = (capa: NombreCapa, izq: number, der: number) => {
  const xs = CAPAS_BOSQUE[capa].xs;
  if (capa === 'cerca' || (izq >= 0 && der <= 1080)) return [];
  const paso = capa === 'lejos' ? 88 : 140;
  const mas: { x: number; semilla: string }[] = [];
  for (let x = xs[0] - paso, k = 0; x > izq - 200; x -= paso, k++) mas.push({ x, semilla: `pino-${capa}-izq-${k}` });
  for (let x = xs.at(-1)! + paso, k = 0; x < der + 200; x += paso, k++) mas.push({ x, semilla: `pino-${capa}-der-${k}` });
  return mas;
};

export const CapaBosque: FC<{ capa: NombreCapa; camara?: number; sube?: number; luz?: number; opacidad?: number }> = ({ capa, camara = 0, sube = 1, luz = 0, opacidad = 1 }) => {
  const c = CAPAS_BOSQUE[capa];
  const { izq, der } = useMarco();
  const dy = (1 - sube) * (capa === 'cerca' ? 1500 : 900);
  const dx = -camara * c.paralaje;
  let cuerpo = '';
  let borde = '';
  const pinos = [...c.xs.map((x, i) => ({ x, semilla: `pino-${capa}-${i}` })), ...pinosDeMas(capa, izq, der)];
  pinos.forEach(({ x: x0, semilla }) => {
    const alto = c.alto[0] + random(semilla) * (c.alto[1] - c.alto[0]);
    const x = Math.round((x0 + dx) / c.lado) * c.lado;
    if (x < izq - 500 || x > der + 500) return;
    cuerpo += caminoPino(x, c.base + dy, alto, c.lado, capa === 'cerca' ? 6 : 4);
    if (c.borde) borde += caminoBordePino(x, c.base + dy, alto, c.lado, 4);
  });
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {capa !== 'cerca' && <rect x={izq - 40} y={c.base + dy - 2} width={der - izq + 80} height={1000} fill={c.suelo} />}
      <path d={cuerpo} fill={c.color} />
      {borde && <path d={borde} fill={c.borde} opacity={0.8 + 0.6 * luz} />}
    </g>
  );
};

/** Bruma entre capas: una franja que aclara lo que queda detrás. */
export const Bruma: FC<{ y: number; alto?: number; opacidad?: number }> = ({ y, alto = 260, opacidad = 1 }) => {
  const { izq, der } = useMarco();
  return (
    <g opacity={opacidad}>
      <defs>
        <linearGradient id="bosque-bruma" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A2238" stopOpacity={0} />
          <stop offset="0.6" stopColor="#1A2238" stopOpacity={0.55} />
          <stop offset="1" stopColor="#1A2238" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={izq - 40} y={y - alto / 2} width={der - izq + 80} height={alto} fill="url(#bosque-bruma)" />
    </g>
  );
};

// --- Cazador ---------------------------------------------------------------------------------------------------

const CAZADOR_ARRIBA = [
  '.....RRRR.............',
  '....RKKKKK............',
  '...RKKKKKKK...........',
  '...RKKKKKKE...........',
  '...RKKKKKKK...........',
  '....RKKKKK............',
  '..RKKKKKKKKK.GGG......',
  '..RKKKKKKKKKHHHHHHHHHH',
  '..RKKKKKKKKKGGGGGGGG..',
  '..RKKKKKKKKKKKG.......',
  '..RKKKKKKKK...........',
  '..RKKKKKKKK...........',
  '.RKKKKKKKKKK..........',
  '.RKKKKKKKKKK..........',
  '.RKKKKKKKKKKK.........',
  '.RKKKKKKKKKKK.........',
  '..RKKKKKKKKK..........',
];
const PIERNAS = [
  ['...RKKK.KKKK..........', '...RKK...KKK..........', '...RKK....KK..........', '..RKKK....KKK.........'],
  ['....RKKKKKKK..........', '.....RKKKKK...........', '.....RKK.KK...........', '....RKKK.KKK..........'],
];
/** Filas del cazador (22 × 21), mirando a la derecha: el cuerpo a la izquierda y el fusil, con su mira, hacia adelante. */
export const FILAS_CAZADOR = (paso = 0) => [...CAZADOR_ARRIBA, ...PIERNAS[paso % 2]];
export const ANCHO_CAZADOR = 22;
export const ALTO_CAZADOR = 21;
/** Dónde queda la punta del fusil, en cuadraditos desde el centro del dibujo (mirando a la derecha). */
export const PUNTA_FUSIL = { x: 10.5, y: -3 };
/** Centro del cuerpo (sin el fusil), en cuadraditos desde el centro del dibujo. */
const CUERPO = { x: -4.5, y: -0.5 };
/** Dónde queda el ojo, en cuadraditos desde el centro del dibujo. */
const OJO = { x: -0.5, y: -7 };

type CazadorProps = {
  /** Centro de los pies. */
  x: number;
  base: number;
  lado: number;
  espejo?: boolean;
  /** Número de paso al caminar (cambia la pose de las piernas). */
  paso?: number;
  /** 0–1: brillo del ojo. */
  ojo?: number;
  colorOjo?: string;
  /** Color del borde iluminado. */
  borde?: string;
  aparece?: number;
  opacidad?: number;
};

/** Cazador en silueta, encapuchado y con el fusil al hombro, con un ojo que brilla. */
export const CazadorPixeles: FC<CazadorProps> = ({ x, base, lado, espejo, paso = 0, ojo = 1, colorOjo = bb.ambar, borde = '#3A4A6E', aparece = 1, opacidad = 1 }) => {
  const cy = base - (ALTO_CAZADOR * lado) / 2;
  const sx = espejo ? -1 : 1;
  const ox = x + sx * OJO.x * lado;
  const oy = cy + OJO.y * lado;
  return (
    <g opacity={opacidad}>
      <Pixelado filas={FILAS_CAZADOR(paso)} paleta={{ K: '#03050A', R: borde, G: '#3A4766', H: '#6A7BA6', E: '#03050A' }} x={x} y={cy} lado={lado} espejo={espejo} aparece={aparece} />
      {ojo > 0 && aparece > 0.6 && <OjoCazador x={ox} y={oy} lado={lado} brillo={ojo} color={colorOjo} />}
    </g>
  );
};

/** Dónde queda el ojo de un cazador dibujado con esos datos. */
export const ojoCazador = (x: number, base: number, lado: number, espejo = false) => ({
  x: x + (espejo ? -1 : 1) * OJO.x * lado,
  y: base - (ALTO_CAZADOR * lado) / 2 + OJO.y * lado,
});

/** Resplandor suave (degradado radial) de un color, centrado en (x, y). */
export const Halo: FC<{ x: number; y: number; r: number; color: string; opacidad?: number; aplastar?: number }> = ({ x, y, r, color: c, opacidad = 1, aplastar = 1 }) => {
  const id = `halo-${c.replace('#', '')}`;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={c} stopOpacity={1} />
          <stop offset="0.35" stopColor={c} stopOpacity={0.45} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={r} ry={r * aplastar} fill={`url(#${id})`} opacity={opacidad} />
    </g>
  );
};

/** El ojo de un cazador solo (para dibujarlo encima de una capa de oscuridad). */
export const OjoCazador: FC<{ x: number; y: number; lado: number; brillo: number; color?: string }> = ({ x, y, lado, brillo, color: c = bb.ambar }) =>
  brillo <= 0 ? null : (
    <g>
      <Halo x={x} y={y} r={lado * 3.2} color={c} opacidad={0.5 * Math.min(1, brillo)} />
      <rect x={x - lado / 2} y={y - lado / 2} width={lado} height={lado} fill={c} opacity={Math.min(1, brillo)} shapeRendering="crispEdges" />
    </g>
  );

/** Centro del cuerpo de un cazador (el pecho), sin contar el fusil. */
export const pechoCazador = (x: number, base: number, lado: number, espejo = false) => ({
  x: x + (espejo ? -1 : 1) * CUERPO.x * lado,
  y: base - (ALTO_CAZADOR * lado) / 2 + CUERPO.y * lado,
});

/** Punta del fusil de un cazador (para apuntar o disparar desde ahí). */
export const puntaFusil = (x: number, base: number, lado: number, espejo = false) => ({
  x: x + (espejo ? -1 : 1) * PUNTA_FUSIL.x * lado,
  y: base - (ALTO_CAZADOR * lado) / 2 + PUNTA_FUSIL.y * lado,
});

// --- Ojos, miras y señales -------------------------------------------------------------------------------------

/** Par de ojos de píxeles en la oscuridad. `abre` 0–1 los abre de arriba abajo. */
export const Ojos: FC<{ x: number; y: number; lado: number; abre: number; color?: string; opacidad?: number }> = ({ x, y, lado, abre, color: c = bb.hueso, opacidad = 1 }) => {
  if (abre <= 0.02) return null;
  const alto = lado * abre;
  return (
    <g opacity={opacidad}>
      <Halo x={x} y={y} r={lado * 4.5} color={c} opacidad={0.3 * abre} aplastar={0.55} />
      <g fill={c} shapeRendering="crispEdges">
        <rect x={x - lado * 1.9} y={y - alto / 2} width={lado * 1.3} height={alto} />
        <rect x={x + lado * 0.6} y={y - alto / 2} width={lado * 1.3} height={alto} />
      </g>
    </g>
  );
};

/** Parpadeo: 1 casi siempre, baja a 0 un instante cada tanto (según la semilla). */
export const parpadeo = (frame: number, semilla: string) => {
  const ciclo = 70 + Math.floor(random(`${semilla}-ciclo`) * 60);
  const fase = Math.floor(random(`${semilla}-fase`) * ciclo);
  const t = (frame + fase) % ciclo;
  return t < 3 ? [0.4, 0, 0.5][t] : 1;
};

/** Mira de fusil centrada en (x, y): círculo, cuatro marcas y un punto. `aparece` 0–1 la cierra desde grande. */
export const Mira: FC<{ x: number; y: number; r: number; color?: string; aparece?: number; grosor?: number; opacidad?: number }> = ({
  x, y, r, color: c = bb.terracota, aparece = 1, grosor = 5, opacidad = 1,
}) => {
  if (aparece <= 0) return null;
  const s = 1 + 1.2 * (1 - Math.min(1, aparece));
  const R = r * s;
  return (
    <g opacity={Math.min(1, aparece * 1.6) * opacidad} stroke={c} strokeWidth={grosor} fill="none">
      <circle cx={x} cy={y} r={R} />
      <g shapeRendering="crispEdges">
        <line x1={x - R * 1.35} y1={y} x2={x - R * 0.5} y2={y} />
        <line x1={x + R * 0.5} y1={y} x2={x + R * 1.35} y2={y} />
        <line x1={x} y1={y - R * 1.35} x2={x} y2={y - R * 0.5} />
        <line x1={x} y1={y + R * 0.5} x2={x} y2={y + R * 1.35} />
      </g>
      <rect x={x - grosor * 0.7} y={y - grosor * 0.7} width={grosor * 1.4} height={grosor * 1.4} fill={c} stroke="none" />
    </g>
  );
};

/**
 * Anillos de señal que salen de (x, y): uno cada `cada` fotogramas desde `desde` hasta `hasta`, y crecen hasta `radio`
 * en `vida` fotogramas mientras se apagan.
 */
export const AnilloSenal: FC<{ x: number; y: number; frame: number; desde: number; hasta?: number; cada?: number; vida?: number; radio?: number; color?: string; grosor?: number; aplastar?: number }> = ({
  x, y, frame, desde, hasta = 1e9, cada = 12, vida = 40, radio = 420, color: c = bb.ambar, grosor = 8, aplastar = 1,
}) => {
  if (frame < desde) return null;
  const anillos = [];
  for (let k = 0; ; k++) {
    const t0 = desde + k * cada;
    if (t0 > frame || t0 > hasta) break;
    const edad = frame - t0;
    if (edad > vida) continue;
    const a = edad / vida;
    const r = 12 + radio * (1 - (1 - a) * (1 - a));
    anillos.push(<ellipse key={k} cx={x} cy={y} rx={r} ry={r * aplastar} fill="none" stroke={c} strokeWidth={grosor * (1 - 0.5 * a)} strokeDasharray={`${grosor * 2} ${grosor}`} opacity={(1 - a) * 0.95} />);
  }
  return <g>{anillos}</g>;
};
