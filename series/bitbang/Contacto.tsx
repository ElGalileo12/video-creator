// Lo que hacemos para hacernos notar (especial «El bosque oscuro»): el radiotelescopio de Arecibo con su plato en el
// valle, las tres torres y la plataforma colgada; la sonda Voyager con su disco de oro; el mapa de púlsares de la tapa
// del disco; la Tierra de píxeles y una columna de bits que sube. Para usar dentro de un SVG (Lienzo).
import type { FC } from 'react';
import { random } from 'remotion';
import { useMarco } from '../../src/horizontal';
import { bb, letra } from './tema';

/** Radiotelescopio de Arecibo: plato hundido entre cerros con el borde en (x, y), ancho `ancho`. */
export const Arecibo: FC<{ x: number; y: number; ancho: number; opacidad?: number }> = ({ x, y, ancho, opacidad = 1 }) => {
  const { izq, der } = useMarco();
  const rx = ancho / 2;
  const ry = rx * 0.26;
  // En un video horizontal los cerros siguen hasta los bordes del cuadro (en vertical no se ven: quedan afuera).
  const izqCerro = x - rx * 1.7;
  const derCerro = x + rx * 1.7;
  const lados = izq < izqCerro || der > derCerro;
  const torres = [
    { x: x - rx * 1.02, base: y + ry * 0.4, alto: rx * 0.95 },
    { x: x + rx * 1.02, base: y + ry * 0.4, alto: rx * 0.95 },
    { x: x + rx * 0.12, base: y - ry * 0.95, alto: rx * 0.72 },
  ];
  const plataforma = { x, y: y - rx * 0.62 };
  return (
    <g opacity={opacidad}>
      {lados && (
        <>
          <path d={`M${izq - 40},${y + 10} L${izq - 40},${y - ry * 1.1} Q${(izq + izqCerro) / 2},${y - ry * 2.3} ${izqCerro + rx * 0.2},${y + 10} Z`} fill="#0F2A22" />
          <path d={`M${der + 40},${y + 10} L${der + 40},${y - ry * 1.3} Q${(der + derCerro) / 2},${y - ry * 2.5} ${derCerro - rx * 0.2},${y + 10} Z`} fill="#0F2A22" />
        </>
      )}
      {/* Cerros de atrás */}
      <path d={`M${x - rx * 1.6},${y + 10} Q${x - rx * 1.1},${y - ry * 2.4} ${x - rx * 0.4},${y - ry * 1.2} Q${x + rx * 0.3},${y - ry * 2.6} ${x + rx * 0.9},${y - ry * 1.3} Q${x + rx * 1.4},${y - ry * 2.2} ${x + rx * 1.7},${y + 10} Z`} fill="#0F2A22" />
      {torres.slice(2).map((t, i) => (
        <rect key={i} x={t.x - 7} y={t.base - t.alto} width={14} height={t.alto} fill="#5D6680" shapeRendering="crispEdges" />
      ))}
      {/* El plato: la cara de adentro, con la malla */}
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#8C93A8" />
      <ellipse cx={x} cy={y + ry * 0.12} rx={rx * 0.94} ry={ry * 0.86} fill="#6E7690" />
      {[0.75, 0.55, 0.35, 0.16].map((k) => (
        <ellipse key={k} cx={x} cy={y + ry * 0.3 * (1 - k)} rx={rx * 0.94 * k} ry={ry * 0.86 * k} fill="none" stroke="#9AA2B8" strokeWidth={2} opacity={0.7} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x} y1={y + ry * 0.3} x2={x + Math.cos(a) * rx * 0.94} y2={y + ry * 0.12 + Math.sin(a) * ry * 0.86} stroke="#9AA2B8" strokeWidth={2} opacity={0.5} />;
      })}
      {/* Cerros de adelante, que tapan la mitad de abajo del borde */}
      <path d={`M${x - rx * 1.7},${y + 1200} L${x - rx * 1.7},${y + ry * 0.2} Q${x - rx * 0.6},${y + ry * 1.9} ${x},${y + ry * 1.2} Q${x + rx * 0.7},${y + ry * 1.9} ${x + rx * 1.7},${y + ry * 0.1} L${x + rx * 1.7},${y + 1200} Z`} fill="#0B211A" />
      {lados && (
        <>
          <path d={`M${izq - 40},${y + 1200} L${izq - 40},${y + ry * 0.9} Q${(izq + izqCerro) / 2},${y - ry * 0.2} ${izqCerro + 2},${y + ry * 0.2} L${izqCerro + 2},${y + 1200} Z`} fill="#0B211A" />
          <path d={`M${der + 40},${y + 1200} L${der + 40},${y + ry * 0.8} Q${(der + derCerro) / 2},${y - ry * 0.3} ${derCerro - 2},${y + ry * 0.1} L${derCerro - 2},${y + 1200} Z`} fill="#0B211A" />
        </>
      )}
      {/* Cables, torres de adelante y la plataforma colgada */}
      {torres.map((t, i) => (
        <line key={i} x1={t.x} y1={t.base - t.alto} x2={plataforma.x} y2={plataforma.y - 6} stroke="#A9B0C4" strokeWidth={3} opacity={0.8} />
      ))}
      {torres.slice(0, 2).map((t, i) => (
        <rect key={i} x={t.x - 9} y={t.base - t.alto} width={18} height={t.alto} fill="#7A839C" shapeRendering="crispEdges" />
      ))}
      <g shapeRendering="crispEdges">
        <rect x={plataforma.x - rx * 0.26} y={plataforma.y - 10} width={rx * 0.52} height={20} fill="#B8BFD0" />
        <rect x={plataforma.x - rx * 0.18} y={plataforma.y + 10} width={rx * 0.36} height={8} fill="#7A839C" />
        <rect x={plataforma.x - 26} y={plataforma.y + 18} width={52} height={44} fill={bb.hueso} />
        <rect x={plataforma.x - 18} y={plataforma.y + 62} width={36} height={10} fill="#B8BFD0" />
      </g>
    </g>
  );
};

/** Dónde queda la plataforma colgada de Arecibo (de ahí sale la señal). */
export const plataformaArecibo = (x: number, y: number, ancho: number) => ({ x, y: y - (ancho / 2) * 0.62 + 70 });

/** Sonda Voyager de frente: la antena blanca grande, el cuerpo con el disco de oro y los brazos. Centro de la antena en (x, y). */
export const SondaVoyager: FC<{ x: number; y: number; escala?: number; giro?: number; brilloDisco?: number; opacidad?: number }> = ({
  x, y, escala = 1, giro = 0, brilloDisco = 0, opacidad = 1,
}) => (
  <g opacity={opacidad} transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
    {/* Brazos: magnetómetro (largo y fino), instrumentos y generadores */}
    <line x1={-20} y1={-30} x2={-330} y2={-250} stroke="#8C93A8" strokeWidth={4} />
    <line x1={-40} y1={110} x2={-230} y2={170} stroke="#8C93A8" strokeWidth={8} />
    <g shapeRendering="crispEdges">
      <rect x={-290} y={140} width={70} height={56} fill="#6E7690" />
      <rect x={-276} y={150} width={22} height={22} fill="#3A4256" />
    </g>
    <line x1={40} y1={110} x2={250} y2={170} stroke="#8C93A8" strokeWidth={8} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={140 + i * 42} y={126 + i * 12} width={34} height={44} fill="#5D6680" stroke="#3A4256" strokeWidth={3} />
    ))}
    {/* Cuerpo (diez lados) con el disco de oro */}
    <polygon points="-80,70 -55,52 55,52 80,70 80,130 55,148 -55,148 -80,130" fill="#7A839C" />
    <polygon points="-80,70 -55,52 55,52 80,70" fill="#9AA2B8" />
    {brilloDisco > 0 && <circle cx={34} cy={100} r={40} fill={bb.ambar} opacity={0.35 * brilloDisco} />}
    <circle cx={34} cy={100} r={26} fill="#E9B44C" stroke="#9C6F14" strokeWidth={3} />
    <circle cx={34} cy={100} r={15} fill="none" stroke="#B9862A" strokeWidth={2} />
    <circle cx={34} cy={100} r={4} fill="#9C6F14" />
    {/* Antena */}
    <circle cx={0} cy={0} r={120} fill={bb.hueso} />
    <circle cx={0} cy={0} r={104} fill="#DCD5C8" />
    <circle cx={0} cy={0} r={70} fill="none" stroke="#C4BCAE" strokeWidth={3} />
    {[-90, 30, 150].map((a) => (
      <line key={a} x1={Math.cos((a * Math.PI) / 180) * 100} y1={Math.sin((a * Math.PI) / 180) * 100} x2={0} y2={0} stroke="#8C93A8" strokeWidth={4} />
    ))}
    <circle cx={0} cy={0} r={16} fill="#5D6680" />
    <circle cx={0} cy={0} r={7} fill={bb.hueso} />
  </g>
);

/** Dónde queda el disco de oro de la sonda dibujada en (x, y) con esa escala (sin giro). */
export const discoVoyager = (x: number, y: number, escala = 1) => ({ x: x + 34 * escala, y: y + 100 * escala });

// Las 14 líneas del mapa de púlsares: ángulo (grados) y largo (0–1). Imitan la forma del de la tapa, no sus datos.
const PULSARES = [
  [8, 0.62], [27, 0.38], [52, 0.82], [71, 0.5], [97, 0.7], [118, 0.33], [139, 0.9],
  [163, 0.45], [196, 0.58], [221, 0.8], [248, 0.36], [272, 0.66], [301, 0.48], [329, 0.74],
] as const;

/**
 * Mapa de púlsares del disco de oro: 14 líneas que salen del Sol (cada una con su código en rayitas) y una más larga
 * hacia el centro de la galaxia. `progreso` 0–1 las dibuja; `sol` 0–1 hace latir el centro.
 */
export const MapaPulsares: FC<{ cx: number; cy: number; r: number; progreso: number; sol?: number; color?: string }> = ({ cx, cy, r, progreso, sol = 0, color: c = '#6B4708' }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#E1AE45" />
    {[0.92, 0.78, 0.6].map((k) => (
      <circle key={k} cx={cx} cy={cy} r={r * k} fill="none" stroke="#C99530" strokeWidth={2} />
    ))}
    <line x1={cx} y1={cy} x2={cx + r * 0.95 * Math.min(1, progreso * 1.3)} y2={cy} stroke={c} strokeWidth={4} />
    {PULSARES.map(([a, largo], i) => {
      const p = Math.min(1, Math.max(0, progreso * 1.4 - i * 0.03));
      if (p <= 0) return null;
      const rad = (a * Math.PI) / 180;
      const L = r * 0.88 * largo * p;
      const ux = Math.cos(rad);
      const uy = Math.sin(rad);
      const marcas = Math.floor((L / (r * 0.88)) * 9);
      return (
        <g key={i} stroke={c}>
          <line x1={cx} y1={cy} x2={cx + ux * L} y2={cy + uy * L} strokeWidth={3} />
          {Array.from({ length: marcas }, (_, k) => {
            const d = (L * (k + 1)) / (marcas + 1);
            const m = random(`pulsar-${i}-${k}`) < 0.5 ? 5 : 10;
            return <line key={k} x1={cx + ux * d - uy * m} y1={cy + uy * d + ux * m} x2={cx + ux * d + uy * m} y2={cy + uy * d - ux * m} strokeWidth={2} />;
          })}
        </g>
      );
    })}
    {sol > 0 && <circle cx={cx} cy={cy} r={14 + 22 * sol} fill={bb.hueso} opacity={0.5 * sol} />}
    <circle cx={cx} cy={cy} r={8} fill={sol > 0.3 ? bb.hueso : c} />
  </g>
);

/** La Tierra de píxeles, centrada en (x, y): océanos, continentes y nubes. `luces` 0–1 enciende ciudades en ámbar. */
export const TierraPixeles: FC<{ x: number; y: number; radio: number; lado?: number; luces?: number; opacidad?: number }> = ({ x, y, radio, lado = 6, luces = 0, opacidad = 1 }) => {
  const n = Math.ceil((radio * 2) / lado);
  const celdas = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = x - radio + (i + 0.5) * lado;
      const cy = y - radio + (j + 0.5) * lado;
      const d = Math.hypot(cx - x, cy - y) / radio;
      if (d > 1) continue;
      const u = (cx - x) / radio;
      const v = (cy - y) / radio;
      const tierra = Math.sin(u * 4.2 + 1.3) + Math.cos(v * 3.6 - u * 1.7) > 0.75;
      const nube = Math.sin(u * 7 + v * 2.5) > 0.86;
      let fill = tierra ? '#3E9E5A' : '#2F6FA3';
      if (nube) fill = bb.hueso;
      if (tierra && luces > 0 && random(`tierra-luz-${i}-${j}`) < 0.35) fill = bb.ambar;
      if (d > 0.82) fill = tierra ? '#2B7342' : '#1F4E78';
      celdas.push(<rect key={`${i}-${j}`} x={cx - lado / 2} y={cy - lado / 2} width={lado + 0.5} height={lado + 0.5} fill={fill} />);
    }
  }
  return (
    <g opacity={opacidad}>
      <circle cx={x} cy={y} r={radio * 1.35} fill={bb.cian} opacity={0.12} />
      <g shapeRendering="crispEdges">{celdas}</g>
    </g>
  );
};

/** Columna de bits («1», «0») que sube desde (x, y) y se apaga arriba. `desde`: fotograma en que sale el primero. */
export const BitsQueSuben: FC<{ x: number; y: number; frame: number; desde: number; hasta?: number; alto?: number; tamano?: number; color?: string; semilla?: string }> = ({
  x, y, frame, desde, hasta = 1e9, alto = 700, tamano = 34, color: c = bb.verde, semilla = 'bits',
}) => {
  if (frame < desde) return null;
  const bits = [];
  for (let k = 0; ; k++) {
    const t0 = desde + k * 2;
    if (t0 > frame || t0 > hasta) break;
    const edad = frame - t0;
    const vida = 30;
    if (edad > vida) continue;
    const r = (s: string) => random(`${semilla}-${k}-${s}`);
    const dx = (r('x') - 0.5) * 120;
    bits.push(
      <text key={k} x={x + dx} y={y - (edad / vida) * alto} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={tamano} fill={c} opacity={1 - edad / vida}>
        {r('b') < 0.5 ? '0' : '1'}
      </text>,
    );
  }
  return <g>{bits}</g>;
};
