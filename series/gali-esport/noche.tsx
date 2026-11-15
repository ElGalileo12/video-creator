// La noche en el escritorio, cuando toca pasar todo al computador: la pared oscura con la ventana y la luna, la lámpara,
// la taza y el portátil con una hoja de cálculo (genérica, sin marca). De `quien-me-debe`, hecho reutilizable en
// `sabado-de-partidos`.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { SISTEMA } from './tema';

/** Habitación de noche: pared oscura, luz cálida de lámpara, la ventana con la luna y el escritorio (arriba en `mesa`). */
export const Noche: FC<{ luz?: number; mesa?: number }> = ({ luz = 1, mesa = 1390 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: 'linear-gradient(#0A1020 0%, #111A2E 60%, #0A1020 100%)' }} />
    <AbsoluteFill style={{ opacity: luz, background: 'radial-gradient(ellipse 60% 38% at 78% 52%, rgba(255,196,120,0.30) 0%, rgba(255,170,90,0.10) 45%, rgba(0,0,0,0) 100%)' }} />
    <div style={{ position: 'absolute', left: 70, top: 560, width: 250, height: 300, borderRadius: 12, background: 'linear-gradient(#16223D, #1E2D50)', border: '10px solid #2A3654', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', left: 140, top: 40, width: 56, height: 56, borderRadius: '50%', background: '#F8F3D8', boxShadow: '0 0 40px rgba(248,243,216,0.5)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 8, background: '#2A3654' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 8, background: '#2A3654' }} />
    </div>
  </AbsoluteFill>
);

/** El escritorio de madera (va encima de quien está sentado detrás). */
export const Escritorio: FC<{ y?: number }> = ({ y = 1390 }) => (
  <>
    <div style={{ position: 'absolute', left: -40, right: -40, top: y, height: 70, background: 'linear-gradient(#8B5E3C, #6B4429)', borderRadius: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
    <div style={{ position: 'absolute', left: -40, right: -40, top: y + 70, height: 600, background: 'linear-gradient(#3A2516, #1A1009)' }} />
  </>
);

/** Lámpara de escritorio, con su cono de luz. `x`, `y`: la base. */
export const Lampara: FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={260} height={420} viewBox="0 0 260 420" style={{ position: 'absolute', left: x - 130, top: y - 420, overflow: 'visible' }}>
    <path d="M 40 -10 L 250 420 L -170 420 Z" fill="rgba(255,210,140,0.10)" />
    <ellipse cx={150} cy={410} rx={70} ry={14} fill="#334155" />
    <path d="M 150 400 L 120 230 L 60 120" stroke="#475569" strokeWidth={14} strokeLinecap="round" fill="none" />
    <path d="M 10 70 L 110 40 L 120 110 L 30 150 Z" fill="#F59E0B" />
    <ellipse cx={40} cy={130} rx={30} ry={16} fill="#FEF3C7" />
  </svg>
);

/** Taza de café humeante. `x`, `y`: la base. */
export const Taza: FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <svg width={120} height={160} viewBox="0 0 120 160" style={{ position: 'absolute', left: x - 60, top: y - 160, overflow: 'visible' }}>
    {[0, 1].map((k) => (
      <path key={k} d={`M ${45 + k * 22} 40 q 10 -14 0 -26 q -10 -12 0 -26`} stroke="rgba(255,255,255,0.35)" strokeWidth={5} fill="none" strokeLinecap="round" transform={`translate(0 ${Math.sin((f + k * 20) / 12) * 4})`} />
    ))}
    <path d="M 20 60 L 100 60 L 92 150 L 28 150 Z" fill="#E2E8F0" />
    <path d="M 100 76 q 28 6 18 34 q -8 18 -22 16" stroke="#E2E8F0" strokeWidth={10} fill="none" />
    <rect x={30} y={88} width={60} height={22} rx={4} fill="#2563EB" opacity={0.7} />
  </svg>
);

export const PANTALLA_PORTATIL = { ancho: 784, alto: 520 };

/** Portátil abierto con lo que se le pase en la pantalla (784 × 520). `x`, `y`: centro. */
export const Portatil: FC<{ x: number; y: number; t: number; escala?: number; children: ReactNode }> = ({ x, y, t, escala = 1, children }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, width: 880, transform: `translate(-50%, -50%) scale(${(0.85 + 0.15 * t) * escala})`, opacity: Math.min(1, t * 1.5), fontFamily: SISTEMA }}>
      <div style={{ position: 'relative', margin: '0 30px', width: 820, height: PANTALLA_PORTATIL.alto + 36, boxSizing: 'border-box', padding: 18, borderRadius: '26px 26px 8px 8px', background: '#1F2937', boxShadow: '0 0 60px rgba(255,200,120,0.12), 0 30px 70px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'relative', width: PANTALLA_PORTATIL.ancho, height: PANTALLA_PORTATIL.alto, overflow: 'hidden', borderRadius: 6, background: '#FFFFFF' }}>{children}</div>
      </div>
      <div style={{ width: 880, height: 26, borderRadius: '6px 6px 30px 30px', background: 'linear-gradient(#9CA3AF, #6B7280)', boxShadow: '0 16px 30px rgba(0,0,0,0.5)' }} />
    </div>
  ) : null;

export type PropsHojaCalculo = {
  archivo: string;
  /** Anchos de las columnas de datos (la de los números de fila va aparte). */
  anchos: number[];
  /** La primera fila son los títulos. */
  filas: string[][];
  /** Cuántas celdas se ven en cada columna (con decimales: la última se va escribiendo). */
  llenas: number[];
  /** Celda con error: fila y columna (de datos), el texto y cuánto destella (0 → 1). */
  error?: { fila: number; col: number; texto: string; t: number };
  /** Lo que se ve en la barra de fórmulas. */
  formula?: string;
  f: number;
};

/** Una hoja de cálculo genérica (barra verde con el archivo, fórmulas, columnas A, B, C… y filas numeradas). */
export const HojaCalculo: FC<PropsHojaCalculo> = ({ archivo, anchos, filas, llenas, error, formula = '', f }) => {
  const cols = [56, ...anchos];
  const colX = cols.reduce<number[]>((xs, w) => [...xs, xs[xs.length - 1] + w], [0]);
  const altoF = 46;
  const arriba = 86;
  const destello = error && error.t > 0 ? 0.5 + 0.5 * Math.sin(f * 0.9) : 0;
  const gris = '#F1F5F9';
  const borde = '#CBD5E1';
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SISTEMA }}>
      <div style={{ height: 44, background: '#1D6F42', color: 'white', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 5, background: 'white', color: '#1D6F42', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900 }}>X</span>
        {archivo}
      </div>
      <div style={{ height: 42, borderBottom: `1px solid ${borde}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', fontSize: 18, color: '#334155' }}>
        <span style={{ fontStyle: 'italic', color: '#64748B' }}>fx</span>
        <span style={{ color: error && error.t > 0 ? '#B91C1C' : '#334155' }}>{formula}</span>
      </div>
      {['', ...anchos.map((_, i) => String.fromCharCode(65 + i))].map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: colX[i], top: arriba, width: cols[i], height: 34, background: gris, borderRight: `1px solid ${borde}`, borderBottom: `1px solid ${borde}`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: 16, color: '#64748B' }}>{c}</div>
      ))}
      {filas.map((fila, r) => (
        <div key={r}>
          <div style={{ position: 'absolute', left: 0, top: arriba + 34 + r * altoF, width: cols[0], height: altoF, background: gris, borderRight: `1px solid ${borde}`, borderBottom: '1px solid #E2E8F0', boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: 16, color: '#64748B' }}>{r + 1}</div>
          {fila.map((v, c) => {
            const malo = error && error.t > 0 && error.fila === r && error.col === c;
            const avance = r === 0 ? 1 : Math.max(0, Math.min(1, llenas[c] - (r - 1)));
            const texto = malo ? error.texto : Array.from(v).slice(0, Math.ceil(Array.from(v).length * avance)).join('');
            return (
              <div key={c} style={{ position: 'absolute', left: colX[c + 1], top: arriba + 34 + r * altoF, width: cols[c + 1], height: altoF, borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 20, fontWeight: r === 0 ? 700 : 400, color: malo ? '#B91C1C' : '#0F172A', background: malo ? `rgba(254,202,202,${0.4 + 0.6 * destello})` : r === 0 ? '#F8FAFC' : 'white', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {texto}
              </div>
            );
          })}
        </div>
      ))}
      {error && error.t > 0 && (
        <div style={{ position: 'absolute', left: colX[error.col + 1], top: arriba + 34 + error.fila * altoF, width: cols[error.col + 1], height: altoF, border: `4px solid rgba(220,38,38,${0.5 + 0.5 * destello})`, boxSizing: 'border-box' }} />
      )}
    </div>
  );
};
