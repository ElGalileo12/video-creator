// Movimiento browniano (cap 7): la vista redonda del microscopio, un grano de polen que recibe empujones de las
// moléculas del agua (puntitos verdes que chocan y rebotan) y la traza en zigzag de Perrin (posiciones unidas por rectas).
// Todo sale del fotograma y de random() con semilla. En SVG, dentro de un `Lienzo`.
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { useIdSvg } from '../../src/piezas';
import { bb, letra } from './tema';

type Punto = { x: number; y: number };

/** Un choque: en el fotograma `t` una molécula pega desde `angulo` grados (0 = desde la derecha) y empuja `fuerza` px. */
export type Choque = { t: number; angulo: number; fuerza?: number };

/** Desplazamiento del grano en el fotograma `f`: cada choque lo empuja hacia el lado contrario y frena en `tau`. */
export const empujeGrano = (f: number, choques: Choque[], tau = 5): Punto => {
  let x = 0;
  let y = 0;
  for (const { t, angulo, fuerza = 22 } of choques) {
    if (f < t) continue;
    const a = (angulo * Math.PI) / 180;
    const k = fuerza * (1 - Math.exp(-(f - t) / tau));
    x -= Math.cos(a) * k;
    y -= Math.sin(a) * k;
  }
  return { x, y };
};

/** Choques al azar (con semilla) entre `desde` y `hasta`, uno cada `cada` fotogramas más o menos. */
export const choquesAlAzar = (desde: number, hasta: number, cada: number, semilla: string, fuerza: [number, number] = [14, 30]): Choque[] => {
  const lista: Choque[] = [];
  let t = desde;
  for (let i = 0; t < hasta; i++) {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    lista.push({ t: Math.round(t), angulo: r('a') * 360, fuerza: fuerza[0] + r('f') * (fuerza[1] - fuerza[0]) });
    t += cada * (0.6 + 0.8 * r('t'));
  }
  return lista;
};

type MicroscopioProps = {
  cx: number;
  cy: number;
  r: number;
  /** 0–1: se abre. */
  aparece: number;
  /** 0–1: cuadrícula de papel milimetrado (la del dibujo de Perrin). */
  cuadricula?: number;
  children?: ReactNode;
};

/** La vista redonda del microscopio, con su aro; lo de adentro (`children`) queda recortado al círculo. */
export const Microscopio: FC<MicroscopioProps> = ({ cx, cy, r, aparece, cuadricula = 0, children }) => {
  const recorte = useIdSvg();
  const luz = useIdSvg();
  if (aparece <= 0) return null;
  const paso = 60;
  return (
    <g opacity={Math.min(1, aparece * 1.6)} transform={`translate(${cx} ${cy}) scale(${0.3 + 0.7 * aparece}) translate(${-cx} ${-cy})`}>
      <defs>
        <clipPath id={recorte}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id={luz}>
          <stop offset="0" stopColor="#1C2A44" />
          <stop offset="1" stopColor="#0A0F1C" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 22} fill={bb.tinta} stroke={bb.hueso} strokeWidth={4} opacity={0.9} />
      <g clipPath={`url(#${recorte})`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${luz})`} />
        {cuadricula > 0 && (
          <g stroke={bb.hueso} strokeWidth={2} opacity={0.22 * cuadricula}>
            {Array.from({ length: Math.ceil((2 * r) / paso) + 1 }, (_, i) => {
              const v = cx - r + i * paso;
              const h = cy - r + i * paso;
              return (
                <g key={i}>
                  <line x1={v} y1={cy - r} x2={v} y2={cy + r} />
                  <line x1={cx - r} y1={h} x2={cx + r} y2={h} />
                </g>
              );
            })}
          </g>
        )}
        {children}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={bb.verde} strokeWidth={6} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <line key={i} x1={cx + Math.cos(a) * (r + 6)} y1={cy + Math.sin(a) * (r + 6)} x2={cx + Math.cos(a) * (r + (i % 6 ? 14 : 20))} y2={cy + Math.sin(a) * (r + (i % 6 ? 14 : 20))} stroke={bb.verde} strokeWidth={3} opacity={0.7} />;
      })}
    </g>
  );
};

/** Grano de polen de píxeles, redondo e irregular, centrado en (x, y). `brillo` 0–1 lo ilumina al recibir un golpe. */
export const Grano: FC<{ x: number; y: number; radio: number; lado?: number; brillo?: number; semilla?: string }> = ({ x, y, radio, lado = 14, brillo = 0, semilla = 'grano' }) => {
  const n = Math.ceil(radio / lado) + 1;
  const celdas = [];
  for (let a = -n; a <= n; a++) {
    for (let b = -n; b <= n; b++) {
      const d = Math.hypot(a, b) * lado;
      const r = random(`${semilla}-${a}-${b}`);
      if (d > radio * (0.86 + 0.18 * r)) continue;
      const borde = d > radio * 0.7;
      const fill = borde ? bb.terracotaClara : r < 0.3 ? '#FFC65C' : bb.ambar;
      celdas.push(<rect key={`${a}-${b}`} x={x + a * lado - lado / 2} y={y + b * lado - lado / 2} width={lado - 1} height={lado - 1} fill={fill} />);
    }
  }
  return (
    <g>
      {brillo > 0 && <circle cx={x} cy={y} r={radio + 10} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.5 * brillo} />}
      <g shapeRendering="crispEdges">{celdas}</g>
    </g>
  );
};

type MoleculasProps = {
  /** Caja donde se mueven (dan la vuelta al salir por un lado). */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  cantidad: number;
  frame: number;
  semilla?: string;
  lado?: number;
  opacidad?: number;
};

/** Moléculas de agua: puntitos verdes que van rápido en línea recta, cada uno a su velocidad. */
export const Moleculas: FC<MoleculasProps> = ({ x, y, ancho, alto, cantidad, frame, semilla = 'moleculas', lado = 10, opacidad = 1 }) => (
  <g shapeRendering="crispEdges" opacity={opacidad}>
    {Array.from({ length: cantidad }, (_, i) => {
      const r = (k: string) => random(`${semilla}-${i}-${k}`);
      const a = r('a') * Math.PI * 2;
      const v = 5 + r('v') * 9;
      const px = (((r('x') * ancho + Math.cos(a) * v * frame) % ancho) + ancho) % ancho;
      const py = (((r('y') * alto + Math.sin(a) * v * frame) % alto) + alto) % alto;
      return <rect key={i} x={x + px - lado / 2} y={y + py - lado / 2} width={lado} height={lado} fill={r('c') < 0.7 ? bb.verde : '#8CFFC0'} opacity={0.55 + 0.45 * r('o')} />;
    })}
  </g>
);

/** Las moléculas de cada choque: llegan derecho al grano (en `centro(t)`), pegan y rebotan, con un destello. */
export const Choques: FC<{ choques: Choque[]; frame: number; centro: (f: number) => Punto; radioGrano: number; lado?: number }> = ({ choques, frame, centro, radioGrano, lado = 12 }) => (
  <g>
    {choques.map((c, i) => {
      const dt = frame - c.t;
      if (dt < -16 || dt > 14) return null;
      const a = (c.angulo * Math.PI) / 180;
      // Rebota hacia un lado un poco girado.
      const sale = a + (random(`choque-sale-${i}`) - 0.5) * 1.6;
      const p = centro(c.t);
      const en = (d: number) => {
        const dist = radioGrano + lado + Math.abs(d) * 13;
        const ang = d < 0 ? a : sale;
        return { x: p.x + Math.cos(ang) * dist, y: p.y + Math.sin(ang) * dist };
      };
      const { x: mx, y: my } = en(dt);
      // Estela corta detrás de la molécula, para que se vea hacia dónde va.
      const atras = en(dt < 0 ? dt - 3 : Math.max(0, dt - 3));
      const flash = dt >= 0 && dt < 5 ? 1 - dt / 5 : 0;
      const g = centro(frame);
      return (
        <g key={i}>
          {flash > 0 && <circle cx={g.x + Math.cos(a) * radioGrano} cy={g.y + Math.sin(a) * radioGrano} r={14 + 26 * (1 - flash)} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={flash} />}
          <line x1={atras.x} y1={atras.y} x2={mx} y2={my} stroke={bb.verde} strokeWidth={lado * 0.6} opacity={0.5 * (1 - Math.max(0, dt) / 14)} />
          <rect x={mx - lado / 2} y={my - lado / 2} width={lado} height={lado} fill="#B8FFD6" opacity={1 - Math.max(0, dt) / 14} />
        </g>
      );
    })}
  </g>
);

/** Camino en zigzag (posiciones unidas por rectas, como el dibujo de Perrin). `avance` 0–1 lo va dibujando. */
export const TrazaPerrin: FC<{ puntos: Punto[]; avance: number; color?: string }> = ({ puntos, avance, color: c = bb.ambar }) => {
  if (avance <= 0 || puntos.length < 2) return null;
  const tramos = (puntos.length - 1) * Math.min(1, avance);
  const hechos = Math.floor(tramos);
  const resto = tramos - hechos;
  const visibles = puntos.slice(0, hechos + 1);
  if (hechos < puntos.length - 1) {
    const a = puntos[hechos];
    const b = puntos[hechos + 1];
    visibles.push({ x: a.x + (b.x - a.x) * resto, y: a.y + (b.y - a.y) * resto });
  }
  return (
    <g>
      <polyline points={visibles.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" />
      {puntos.slice(0, hechos + 1).map((p, i) => (
        <rect key={i} x={p.x - 7} y={p.y - 7} width={14} height={14} fill={bb.hueso} />
      ))}
    </g>
  );
};

/** Zigzag al azar desde `inicio`, con `pasos` saltos de largo `paso` (más o menos), sin salir del círculo (cx, cy, r). */
export const caminoAlAzar = (inicio: Punto, pasos: number, paso: number, semilla: string, cx: number, cy: number, r: number): Punto[] => {
  const lista = [inicio];
  for (let i = 0; i < pasos; i++) {
    const prev = lista[lista.length - 1];
    let k = 0;
    let p: Punto;
    do {
      const a = random(`${semilla}-${i}-${k}-a`) * Math.PI * 2;
      const l = paso * (0.4 + random(`${semilla}-${i}-${k}-l`) * 1.1);
      p = { x: prev.x + Math.cos(a) * l, y: prev.y + Math.sin(a) * l };
      k++;
    } while (Math.hypot(p.x - cx, p.y - cy) > r && k < 30);
    lista.push(p);
  }
  return lista;
};

/** Etiqueta chica de escala («~1 µm»), con una barrita. */
export const Escala: FC<{ x: number; y: number; largo: number; texto: string; opacidad?: number }> = ({ x, y, largo, texto, opacidad = 1 }) => (
  <g opacity={opacidad}>
    <rect x={x} y={y} width={largo} height={6} fill={bb.hueso} />
    <text x={x + largo / 2} y={y - 12} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={26} fill={bb.hueso}>
      {texto}
    </text>
  </g>
);
