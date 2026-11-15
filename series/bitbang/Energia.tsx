// Barras de energía (cap 6): cinética y potencial que se pasan la energía una a la otra, y debajo el TOTAL,
// hecho de los mismos dos tramos, que nunca cambia de largo. Y los botones de votar del cierre. En SVG / HTML.
import type { FC } from 'react';
import { bb, letra } from './tema';

export type FilaEnergia = { nombre: string; valor: number; color: string };

type BarrasProps = {
  x: number;
  y: number;
  ancho: number;
  /** 0–1 cada una; el total es la suma (en un péndulo ideal, siempre 1). */
  cinetica: number;
  potencial: number;
  /** 0–1: las filas entran una tras otra. */
  aparece: number;
  /** 0–1: el TOTAL late en verde. */
  resalta?: number;
  /** Texto de la fila del total. */
  total?: string;
};

const ALTO = 46;
const PASO = 68;
const ETIQUETA = 290;

export const BarrasEnergia: FC<BarrasProps> = ({ x, y, ancho, cinetica, potencial, aparece, resalta = 0, total = 'TOTAL' }) => {
  if (aparece <= 0) return null;
  const largo = ancho - ETIQUETA;
  const filas: FilaEnergia[] = [
    { nombre: 'CINÉTICA', valor: cinetica, color: bb.ambar },
    { nombre: 'POTENCIAL', valor: potencial, color: bb.terracotaClara },
  ];
  const entra = (k: number) => Math.max(0, Math.min(1, aparece * 3 - k));
  const bx = x + ETIQUETA;
  const yt = y + 2 * PASO + 14;
  return (
    <g shapeRendering="crispEdges">
      {filas.map((f, k) => (
        <g key={f.nombre} opacity={entra(k)} transform={`translate(${(1 - entra(k)) * -30} 0)`}>
          <text x={x} y={y + k * PASO + ALTO - 10} fontFamily={letra.mono} fontWeight={700} fontSize={34} fill={f.color}>
            {f.nombre}
          </text>
          <rect x={bx} y={y + k * PASO} width={largo} height={ALTO} fill="rgba(5,8,15,0.8)" stroke={`${bb.hueso}55`} strokeWidth={2} />
          <rect x={bx} y={y + k * PASO} width={largo * Math.max(0, Math.min(1, f.valor))} height={ALTO} fill={f.color} />
        </g>
      ))}
      <g opacity={entra(2)} transform={`translate(${(1 - entra(2)) * -30} 0)`}>
        <rect x={x - 16} y={yt - 12} width={ancho + 32} height={ALTO + 24} fill={bb.verde} opacity={0.06 + 0.2 * resalta} />
        <text x={x} y={yt + ALTO - 10} fontFamily={letra.mono} fontWeight={700} fontSize={34} fill={bb.verde}>
          {total}
        </text>
        <rect x={bx} y={yt} width={largo * cinetica} height={ALTO} fill={bb.ambar} />
        <rect x={bx + largo * cinetica} y={yt} width={largo * potencial} height={ALTO} fill={bb.terracotaClara} />
        <rect x={bx - 4} y={yt - 4} width={largo + 8} height={ALTO + 8} fill="none" stroke={bb.verde} strokeWidth={5 + 3 * resalta} style={{ filter: `drop-shadow(0 0 ${8 + 14 * resalta}px ${bb.verde})` }} />
      </g>
    </g>
  );
};

/** Botón de votar («CAMBIA» / «PERMANECE»), centrado en (x, y). `pulsa` 0–1 lo hunde como si lo tocaran. */
export const BotonVoto: FC<{ x: number; y: number; texto: string; color: string; aparece: number; pulsa?: number; tamano?: number }> = ({
  x, y, texto, color: c, aparece, pulsa = 0, tamano = 58,
}) =>
  aparece <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${5 * pulsa}px, ${5 * pulsa}px) scale(${(0.5 + 0.5 * aparece) * (1 + 0.05 * pulsa)})`,
        opacity: Math.min(1, aparece * 1.5),
        background: c,
        color: bb.tinta,
        fontFamily: letra.texto,
        fontWeight: 700,
        fontSize: tamano,
        letterSpacing: 2,
        padding: '6px 34px',
        // «\n» en el texto lo parte en dos renglones (cap 7: «SE DIVIDE\nSIEMPRE»).
        whiteSpace: 'pre',
        textAlign: 'center',
        lineHeight: 1.05,
        boxShadow: `${8 - 5 * pulsa}px ${8 - 5 * pulsa}px 0 ${bb.hueso}, 0 0 ${20 + 40 * pulsa}px ${c}${pulsa > 0.3 ? 'AA' : '44'}`,
      }}
    >
      {texto}
    </div>
  );
