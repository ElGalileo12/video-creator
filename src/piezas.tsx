// Piezas de dibujo que sirven para cualquier video.
import { useId, useMemo, type CSSProperties, type FC, type ReactNode } from 'react';
import { AbsoluteFill, Img, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CENTRO, color } from './estilo';
import { useMarco } from './horizontal';

/** Id válido para usar en url(#...) dentro de un SVG. */
export const useIdSvg = () => 'i' + useId().replace(/[^a-zA-Z0-9]/g, '');

/** Fondo oscuro con un brillo que se mueve muy despacio. */
export const Fondo: FC = () => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 95) * 10;
  const y = 52 + Math.cos(frame / 120) * 8;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${color.fondo2} 0%, ${color.fondo} 62%)`,
      }}
    />
  );
};

type PiezaProps = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rot?: number;
  escala?: number;
  escalaY?: number;
  /** Altura aparente sobre el suelo: cuanto más alta, más lejos y difusa la sombra. */
  sombra?: number;
  opacidad?: number;
  filtro?: string;
  children: ReactNode;
};

/** Coloca un dibujo centrado en (x, y), con giro, escala y sombra que siempre cae hacia abajo. */
export const Pieza: FC<PiezaProps> = ({
  x, y, ancho, alto, rot = 0, escala = 1, escalaY = 1, sombra = 0, opacidad = 1, filtro = '', children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - ancho / 2,
      top: y - alto / 2,
      width: ancho,
      height: alto,
      opacity: opacidad,
      filter: `${sombra > 0 ? `drop-shadow(${sombra * 0.25}px ${sombra}px ${sombra * 0.9}px rgba(0,0,0,0.55))` : ''} ${filtro}`,
    }}
  >
    <div style={{ width: '100%', height: '100%', transform: `rotate(${rot}deg) scale(${escala}) scaleY(${escalaY})` }}>
      {children}
    </div>
  </div>
);

/** SVG del tamaño del video, para dibujar con coordenadas en píxeles. */
export const Lienzo: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => {
  // En un video horizontal el lienzo cubre todo lo que se ve, con las mismas coordenadas (ver src/horizontal.tsx).
  const { izq, der, arriba, abajo } = useMarco();
  const ancho = der - izq;
  const alto = abajo - arriba;
  return (
    <svg width={ancho} height={alto} viewBox={`${izq} ${arriba} ${ancho} ${alto}`} style={{ position: 'absolute', left: izq, top: arriba, ...style }}>
      {children}
    </svg>
  );
};

type TrazoProps = {
  d: string;
  progreso: number;
  color: string;
  grosor?: number;
  opacidad?: number;
  discontinuo?: boolean;
};

/** Dibuja un camino SVG poco a poco: `progreso` va de 0 (nada) a 1 (completo). */
export const Trazo: FC<TrazoProps> = ({ d, progreso, color: c, grosor = 10, opacidad = 1, discontinuo }) => {
  const mascara = useIdSvg();
  if (progreso <= 0) return null;
  const base = { d, fill: 'none', strokeWidth: grosor, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (!discontinuo) {
    return <path {...base} stroke={c} opacity={opacidad} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progreso} />;
  }
  // Línea discontinua que también se dibuja poco a poco: se revela con una máscara.
  return (
    <g opacity={opacidad}>
      <mask id={mascara}>
        <path {...base} stroke="white" strokeWidth={grosor + 4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progreso} />
      </mask>
      <path {...base} stroke={c} strokeDasharray={`${grosor * 2} ${grosor * 1.8}`} mask={`url(#${mascara})`} />
    </g>
  );
};

export const caminoCirculo = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;

export const caminoCuadrado = (cx: number, cy: number, lado: number) => {
  const m = lado / 2;
  return `M ${cx - m} ${cy - m} H ${cx + m} V ${cy + m} H ${cx - m} Z`;
};

export const caminoLinea = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} L ${x2} ${y2}`;

/** Suelo de asfalto visto desde arriba: un círculo con grano que se desvanece en los bordes. */
export const Suelo: FC<{ x?: number; y?: number; r?: number }> = ({ x = CENTRO.x, y = CENTRO.y, r = 480 }) => {
  const puntos = useMemo(
    () =>
      Array.from({ length: 260 }, (_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const d = Math.sqrt(random(`d${i}`)) * r;
        return {
          cx: Math.cos(a) * d,
          cy: Math.sin(a) * d,
          r: 1.5 + random(`r${i}`) * 3.5,
          claro: random(`c${i}`) > 0.5,
          o: 0.25 + random(`o${i}`) * 0.45,
        };
      }),
    [r],
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: color.suelo,
        maskImage: 'radial-gradient(circle, black 58%, transparent 71%)',
      }}
    >
      <svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}>
        {puntos.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.claro ? '#3A4357' : '#121722'} opacity={p.o} />
        ))}
      </svg>
    </div>
  );
};

/** Etiqueta de texto en una píldora de color. */
export const Pildora: FC<{
  x: number;
  y: number;
  texto: string;
  fondo: string;
  tinta: string;
  tamano?: number;
  escala?: number;
  rot?: number;
}> = ({ x, y, texto, fondo, tinta, tamano = 56, escala = 1, rot = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${escala})`,
      background: fondo,
      color: tinta,
      fontSize: tamano,
      fontWeight: 900,
      padding: `${tamano * 0.18}px ${tamano * 0.5}px`,
      borderRadius: tamano * 0.4,
      whiteSpace: 'nowrap',
      boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
    }}
  >
    {texto}
  </div>
);

type FotoProps = {
  /** Ruta dentro de public/, p. ej. "mi-video/foto-1.jpg". */
  src: string;
  x?: number;
  y?: number;
  ancho?: number;
  alto?: number;
  /** Fotograma de la escena en el que aparece (p. ej. con useMomento). */
  desde?: number;
  /** Cuánto se acerca poco a poco (0.08 = 8 %). */
  zoom?: number;
  rot?: number;
  ajuste?: 'cover' | 'contain';
};

/** Foto con marco, sombra, entrada suave y un acercamiento lento (efecto documental). */
export const Foto: FC<FotoProps> = ({
  src, x = CENTRO.x, y = CENTRO.y, ancho = 820, alto = 820, desde = 0, zoom = 0.08, rot = 0, ajuste = 'cover',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = frame < desde ? 0 : spring({ frame: frame - desde, fps, config: { damping: 14, stiffness: 120 } });
  const acercamiento = 1 + zoom * Math.min(1, Math.max(0, (frame - desde) / (fps * 6)));
  return (
    <div
      style={{
        position: 'absolute',
        left: x - ancho / 2,
        top: y - alto / 2,
        width: ancho,
        height: alto,
        borderRadius: 28,
        overflow: 'hidden',
        border: `6px solid ${color.texto}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        background: color.fondo2,
        opacity: entra,
        transform: `translateY(${(1 - entra) * 60}px) rotate(${rot}deg) scale(${0.9 + 0.1 * entra})`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: ajuste, transform: `scale(${acercamiento})` }} />
    </div>
  );
};
