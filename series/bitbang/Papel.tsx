// Papel de la serie (2D, para usar dentro de un SVG): la hoja sobre la mesa vista en perspectiva o de lado,
// la hoja que se dobla por la mitad (cada doblez duplica las capas), el rollo de papel higiénico que se desenrolla,
// una regla de píxeles y los edificios de píxeles (el Burj Khalifa y edificios comunes) para comparar alturas.
import type { FC } from 'react';
import { random } from 'remotion';
import { Pixelado } from './Criaturas';
import { bb } from './tema';

const PAPEL = bb.hueso;
const PAPEL_SOMBRA = '#CFC6B6';
const PAPEL_LINEA = '#A89F90';

/**
 * Hoja sobre la mesa con su cara de arriba en perspectiva: `fondo` px de profundidad (0 = vista de lado, una tira
 * de `capa` px de alto). `base` es el borde de abajo del canto de la hoja.
 */
export const HojaPlana: FC<{ x: number; base: number; ancho: number; capa: number; fondo: number; opacidad?: number }> = ({ x, base, ancho, capa, fondo, opacidad = 1 }) => {
  const arriba = base - capa;
  const atras = ancho * (0.5 - 0.09 * Math.min(1, fondo / 200));
  return (
    <g opacity={opacidad}>
      {fondo > 1 && <polygon points={`${x - ancho / 2},${arriba} ${x + ancho / 2},${arriba} ${x + atras},${arriba - fondo} ${x - atras},${arriba - fondo}`} fill={PAPEL} />}
      {fondo > 1 && <line x1={x - atras} y1={arriba - fondo} x2={x + atras} y2={arriba - fondo} stroke={PAPEL_SOMBRA} strokeWidth={2} />}
      <rect x={x - ancho / 2} y={arriba} width={ancho} height={capa} fill={fondo > 1 ? PAPEL_SOMBRA : PAPEL} />
    </g>
  );
};

/** Capas de una pila de papel (rectángulo con una línea entre capa y capa mientras miden 3 px o más). */
const Capas: FC<{ x: number; y: number; ancho: number; capa: number; cantidad: number }> = ({ x, y, ancho, capa, cantidad }) => {
  const lineas = capa >= 2.5 && cantidad <= 256;
  return (
    <g>
      <rect x={x} y={y} width={ancho} height={capa * cantidad} fill={PAPEL} />
      {lineas &&
        Array.from({ length: cantidad - 1 }, (_, i) => (
          <line key={i} x1={x} y1={y + (i + 1) * capa} x2={x + ancho} y2={y + (i + 1) * capa} stroke={PAPEL_LINEA} strokeWidth={Math.min(2, capa * 0.35)} opacity={Math.min(1, (capa - 2.5) / 2)} />
        ))}
      <rect x={x} y={y} width={ancho} height={capa * cantidad} fill="none" stroke={PAPEL_SOMBRA} strokeWidth={1.5} />
    </g>
  );
};

/**
 * Hoja vista de lado sobre la mesa, doblada `dobleces` veces (entero), centrada en `x`. `avance` 0–1 es el doblez
 * siguiente: la mitad derecha gira por encima y cae sobre la izquierda, y la pila se corre al centro.
 * Cada doblez deja la mitad de largo y el doble de capas.
 */
export const HojaDoblada: FC<{ x: number; base: number; ancho: number; capa: number; dobleces: number; avance: number; opacidad?: number }> = ({
  x, base, ancho, capa, dobleces, avance, opacidad = 1,
}) => {
  const cantidad = 2 ** dobleces;
  const w = ancho / cantidad;
  const h = capa * cantidad;
  const izq = x - w / 2;
  const corre = (w / 4) * avance;
  return (
    <g opacity={opacidad} transform={`translate(${corre} 0)`}>
      {avance > 0 ? (
        <>
          <Capas x={izq} y={base - h} ancho={w / 2} capa={capa} cantidad={cantidad} />
          <g transform={`rotate(${-180 * avance} ${x} ${base - h})`}>
            <Capas x={x} y={base - h} ancho={w / 2} capa={capa} cantidad={cantidad} />
          </g>
        </>
      ) : (
        <Capas x={izq} y={base - h} ancho={w} capa={capa} cantidad={cantidad} />
      )}
    </g>
  );
};

/**
 * Rollo de papel higiénico visto de costado, centrado en (x, y), con la tira desenrollada en el piso hacia la derecha
 * (`largo` px). El rollo se achica un poco a medida que se desenrolla (`gastado` 0–1).
 */
export const RolloPapel: FC<{ x: number; y: number; radio: number; largo: number; gastado?: number; opacidad?: number }> = ({ x, y, radio, largo, gastado = 0, opacidad = 1 }) => {
  const r = radio * (1 - 0.35 * gastado);
  const piso = y + radio;
  const tubo = radio * 0.42;
  return (
    <g opacity={opacidad}>
      {largo > 0 && (
        <g>
          <rect x={x} y={piso - 10} width={largo} height={10} fill={PAPEL} />
          {Array.from({ length: Math.floor(largo / 70) }, (_, i) => (
            <line key={i} x1={x + 70 * (i + 1)} y1={piso - 10} x2={x + 70 * (i + 1)} y2={piso} stroke={PAPEL_LINEA} strokeWidth={2} strokeDasharray="2 2" />
          ))}
        </g>
      )}
      {/* El rollo apoyado en el piso: su borde de abajo toca la tira. */}
      <g transform={`translate(0 ${radio - r})`}>
        <circle cx={x} cy={y} r={r} fill={PAPEL} />
        {[0.86, 0.72, 0.6].map((k) => (k * r > tubo + 4 ? <circle key={k} cx={x} cy={y} r={k * r} fill="none" stroke={PAPEL_SOMBRA} strokeWidth={2} /> : null))}
        <circle cx={x} cy={y} r={tubo} fill="#B88A5A" />
        <circle cx={x} cy={y} r={tubo * 0.78} fill={bb.tinta} />
      </g>
    </g>
  );
};

/** Regla vertical de píxeles que sube desde `base` hasta `alto` px, con `marcas` divisiones. `aparece` 0–1 la dibuja de abajo arriba. */
export const Regla: FC<{ x: number; base: number; alto: number; marcas: number; aparece: number; color?: string }> = ({ x, base, alto, marcas, aparece, color: c = bb.verde }) => {
  if (aparece <= 0) return null;
  const visible = alto * Math.min(1, aparece);
  return (
    <g shapeRendering="crispEdges">
      <rect x={x - 3} y={base - visible} width={6} height={visible} fill={c} />
      {Array.from({ length: marcas + 1 }, (_, i) => {
        const y = base - (alto * i) / marcas;
        if (base - y > visible + 0.5) return null;
        const largo = i === 0 || i === marcas ? 34 : i % 5 === 0 ? 24 : 14;
        return <rect key={i} x={x - largo} y={y - 2} width={largo} height={4} fill={c} />;
      })}
    </g>
  );
};

/** Tramos del Burj Khalifa de abajo arriba: hasta qué fracción de la altura llega cada uno, su ancho y hacia dónde se corre. */
const TRAMOS_BURJ: [number, number, number][] = [
  [0.18, 0.15, 0],
  [0.32, 0.125, -0.012],
  [0.45, 0.105, 0.01],
  [0.56, 0.085, -0.008],
  [0.66, 0.068, 0.006],
  [0.74, 0.052, -0.004],
  [0.8, 0.038, 0.003],
  [0.86, 0.026, 0],
  [1, 0.008, 0],
];

/** El Burj Khalifa de píxeles parado en `base`, centrado en `x`, de `alto` px (aguja incluida). */
export const BurjPixeles: FC<{ x: number; base: number; alto: number; opacidad?: number; luces?: number }> = ({ x, base, alto, opacidad = 1, luces = 1 }) => {
  let desde = 0;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {TRAMOS_BURJ.map(([hasta, ancho, corre], i) => {
        const y0 = base - alto * hasta;
        const y1 = base - alto * desde;
        desde = hasta;
        const w = Math.max(2, alto * ancho);
        const cx = x + alto * corre;
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={y0} width={w} height={y1 - y0} fill="#2A3552" />
            <rect x={cx - w / 2} y={y0} width={Math.max(1, w * 0.22)} height={y1 - y0} fill="#3E4F78" />
          </g>
        );
      })}
      {luces > 0 &&
        alto > 160 &&
        Array.from({ length: 40 }, (_, i) => {
          const h = 0.04 + random(`burj-luz-${i}`) * 0.76;
          const tramo = TRAMOS_BURJ.find(([hasta]) => hasta >= h)!;
          const w = alto * tramo[1];
          const lx = x + alto * tramo[2] + (random(`burj-luz-x-${i}`) - 0.5) * w * 0.7;
          const lado = Math.max(2, alto / 160);
          return <rect key={i} x={lx} y={base - alto * h} width={lado} height={lado} fill={bb.ambar} opacity={0.75 * luces} />;
        })}
    </g>
  );
};

/** Edificio común de píxeles (caja con ventanas) parado en `base`, centrado en `x`. */
export const EdificioPixeles: FC<{ x: number; base: number; alto: number; ancho: number; semilla: string; opacidad?: number }> = ({ x, base, alto, ancho, semilla, opacidad = 1 }) => {
  const lado = Math.max(2, Math.min(ancho / 6, alto / 14));
  const filas = Math.floor((alto - lado) / (lado * 2));
  const columnas = Math.floor((ancho - lado) / (lado * 2));
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <rect x={x - ancho / 2} y={base - alto} width={ancho} height={alto} fill="#222B44" />
      {alto > 24 &&
        Array.from({ length: filas * columnas }, (_, i) =>
          random(`${semilla}-${i}`) < 0.4 ? (
            <rect key={i} x={x - ancho / 2 + lado + (i % columnas) * lado * 2} y={base - alto + lado + Math.floor(i / columnas) * lado * 2} width={lado} height={lado} fill={bb.ambar} opacity={0.6} />
          ) : null,
        )}
    </g>
  );
};

// Persona de pie de frente (7 × 17): C cabeza, R ropa, P piernas.
const PERSONA = ['..CCC..', '..CCC..', '..CCC..', '...C...', '.RRRRR.', 'RRRRRRR', 'R.RRR.R', 'R.RRR.R', 'R.RRR.R', 'C.RRR.C', '..RRR..', '..P.P..', '..P.P..', '..P.P..', '..P.P..', '..P.P..', '.PP.PP.'];

/** Persona de píxeles parada en `base`, de `alto` px. */
export const PersonaPixeles: FC<{ x: number; base: number; alto: number; opacidad?: number }> = ({ x, base, alto, opacidad = 1 }) => {
  const lado = alto / PERSONA.length;
  return <Pixelado filas={PERSONA} paleta={{ C: bb.terracotaClara, R: bb.cian, P: '#3B4A70' }} x={x} y={base - alto / 2} lado={lado} opacidad={opacidad} />;
};
