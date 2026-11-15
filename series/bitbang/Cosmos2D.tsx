// El cosmos en 2D (SVG, dentro de un `Lienzo`): la Vía Láctea de frente hecha de cuadraditos (los mismos brazos que
// `Galaxia3D`) y la red cósmica (nudos de galaxias unidos por filamentos), dentro de un círculo de radio 1.
// Se dibujan a cualquier tamaño en pantalla: lo que cae fuera del cuadro no se dibuja (sirve para alejarse desde adentro).
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import { ALTO, ANCHO } from '../../src/estilo';
import { campana, puntoBrazo } from './Galaxia3D';
import { bb } from './tema';

type PuntoPlano = { x: number; y: number; color: string; brillo: number; grande: boolean };

const COLORES_BRAZO = [bb.hueso, bb.hueso, '#C9D6F0', '#9FB0D0', bb.cian];
const COLORES_BULBO = ['#FFE2B0', bb.ambar, '#F2C46D'];

const crearGalaxia = (): PuntoPlano[] => {
  const lista: PuntoPlano[] = [];
  for (let i = 0; i < 1300; i++) {
    const k = `gx2d-${i}`;
    const p = puntoBrazo(k);
    lista.push({ x: p.x, y: p.z, color: COLORES_BRAZO[Math.floor(random(`${k}-c`) * COLORES_BRAZO.length)], brillo: 0.4 + 0.6 * random(`${k}-l`), grande: random(`${k}-g`) < 0.05 });
  }
  for (let i = 0; i < 320; i++) {
    const k = `gx2d-bulbo-${i}`;
    lista.push({ x: campana(`${k}-x`) * 0.11, y: campana(`${k}-y`) * 0.11, color: COLORES_BULBO[Math.floor(random(`${k}-c`) * COLORES_BULBO.length)], brillo: 0.5 + 0.5 * random(`${k}-l`), grande: false });
  }
  return lista;
};

/** Nudos de la red cósmica y sus filamentos (cada nudo con sus dos vecinos más cercanos). */
const crearRed = (): PuntoPlano[] => {
  const nudos = Array.from({ length: 30 }, (_, i) => {
    const r = Math.sqrt(random(`red-r-${i}`)) * 0.95;
    const a = random(`red-a-${i}`) * Math.PI * 2;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  const lados = new Set<string>();
  nudos.forEach((p, i) => {
    nudos
      .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
      .filter((v) => v.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => lados.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const lista: PuntoPlano[] = [];
  const colores = ['#9FB0D0', bb.cian, bb.hueso, '#B79CFF'];
  [...lados].forEach((lado, l) => {
    const [a, b] = lado.split('-').map(Number);
    const p = nudos[a];
    const q = nudos[b];
    const largo = Math.hypot(q.x - p.x, q.y - p.y);
    const cantidad = Math.round(20 + largo * 60);
    for (let i = 0; i < cantidad; i++) {
      const k = `red-f-${l}-${i}`;
      const t = random(`${k}-t`);
      const nx = -(q.y - p.y) / largo;
      const ny = (q.x - p.x) / largo;
      const lejos = campana(`${k}-n`) * 0.012;
      lista.push({ x: p.x + (q.x - p.x) * t + nx * lejos, y: p.y + (q.y - p.y) * t + ny * lejos, color: colores[Math.floor(random(`${k}-c`) * colores.length)], brillo: 0.3 + 0.5 * random(`${k}-l`), grande: false });
    }
  });
  nudos.forEach((p, n) => {
    for (let i = 0; i < 22; i++) {
      const k = `red-n-${n}-${i}`;
      lista.push({ x: p.x + campana(`${k}-x`) * 0.022, y: p.y + campana(`${k}-y`) * 0.022, color: i % 5 === 0 ? bb.ambar : bb.hueso, brillo: 0.6 + 0.4 * random(`${k}-l`), grande: i === 0 });
    }
  });
  return lista;
};

type PuntosProps = {
  puntos: PuntoPlano[];
  cx: number;
  cy: number;
  radio: number;
  giro: number;
  aplastar: number;
  opacidad: number;
  lado: number;
};

const Puntos: FC<PuntosProps> = ({ puntos, cx, cy, radio, giro, aplastar, opacidad, lado }) => {
  if (opacidad <= 0) return null;
  if (radio < 3) return <rect x={cx - 3} y={cy - 3} width={6} height={6} fill={bb.hueso} opacity={opacidad} />;
  const c = Math.cos(giro);
  const s = Math.sin(giro);
  const celdas = [];
  for (let i = 0; i < puntos.length; i++) {
    const p = puntos[i];
    const x = cx + (p.x * c - p.y * s) * radio;
    const y = cy + (p.x * s + p.y * c) * radio * aplastar;
    if (x < -20 || x > ANCHO + 20 || y < -20 || y > ALTO + 20) continue;
    const t = p.grande ? lado * 1.8 : lado;
    celdas.push(<rect key={i} x={x - t / 2} y={y - t / 2} width={t} height={t} fill={p.color} opacity={p.brillo} />);
  }
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {celdas}
    </g>
  );
};

/** La Vía Láctea de frente: centro en (cx, cy) y `radio` px (puede ser enorme: solo se dibuja lo que entra en el cuadro). */
export const Galaxia2D: FC<{ cx: number; cy: number; radio: number; giro?: number; aplastar?: number; opacidad?: number }> = ({ cx, cy, radio, giro = 0, aplastar = 0.85, opacidad = 1 }) => {
  const puntos = useMemo(crearGalaxia, []);
  const lado = Math.max(2, Math.min(8, radio / 65));
  return (
    <g>
      {radio > 20 && radio < 3000 && <ellipse cx={cx} cy={cy} rx={radio * 0.75} ry={radio * 0.75 * aplastar} fill="#9FB0D0" opacity={0.07 * opacidad} />}
      {radio > 20 && radio < 3000 && <ellipse cx={cx} cy={cy} rx={radio * 0.25} ry={radio * 0.25 * aplastar} fill={bb.ambar} opacity={0.2 * opacidad} />}
      <Puntos puntos={puntos} cx={cx} cy={cy} radio={radio} giro={giro} aplastar={aplastar} opacidad={opacidad} lado={lado} />
    </g>
  );
};

/** La red cósmica: nudos de galaxias unidos por filamentos, en un círculo de `radio` px centrado en (cx, cy). */
export const RedCosmica: FC<{ cx: number; cy: number; radio: number; giro?: number; opacidad?: number }> = ({ cx, cy, radio, giro = 0, opacidad = 1 }) => {
  const puntos = useMemo(crearRed, []);
  const lado = Math.max(2, Math.min(6, radio / 110));
  return <Puntos puntos={puntos} cx={cx} cy={cy} radio={radio} giro={giro} aplastar={1} opacidad={opacidad} lado={lado} />;
};
