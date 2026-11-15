// Papeles y bocadillos: el cuaderno de espiral escrito a mano, el pensamiento en una nube, las respuestas que flotan
// y las etiquetas. De `torneo-whatsapp`.
import type { CSSProperties, FC, ReactNode } from 'react';
import { aMano, MORADO_CAMILO, SISTEMA } from './tema';

export type LineaCuaderno = { texto: string; tachado?: number; color?: string };

/** Cuaderno de espiral con las fechas. Cada línea se escribe cuando `escrito` pasa por su número; `tachado` la raya. */
export const Cuaderno: FC<{ x: number; y: number; t: number; titulo: string; lineas: LineaCuaderno[]; escrito: number; rot?: number; escala?: number }> = ({ x, y, t, titulo, lineas, escrito, rot = 0, escala = 1 }) => {
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 520, height: 600, transform: `translate(-50%, -50%) scale(${(0.7 + 0.3 * t) * escala}) rotate(${rot}deg)`, opacity: Math.min(1, t * 1.6), filter: 'drop-shadow(0 26px 40px rgba(0,0,0,0.55))' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: '#FFFDF6', overflow: 'hidden' }}>
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 128 + i * 46, height: 2, background: '#BFDBFE', opacity: 0.8 }} />
        ))}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 86, width: 2, background: '#FCA5A5', opacity: 0.7 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 36, background: '#7C3AED', opacity: 0.85 }} />
      </div>
      {/* Espiral */}
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', top: -14, left: 40 + i * 54, width: 18, height: 44, borderRadius: 9, border: '4px solid #94A3B8', boxSizing: 'border-box', background: 'transparent' }} />
      ))}
      <div style={{ position: 'relative', padding: '58px 30px 0 104px', fontFamily: aMano, color: '#1E3A8A' }}>
        <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1, marginBottom: 20, textDecoration: 'underline' }}>{titulo}</div>
        {lineas.map((l, i) => {
          const avance = Math.max(0, Math.min(1, escrito - i));
          if (avance <= 0) return null;
          const n = Math.ceil(Array.from(l.texto).length * avance);
          const raya = l.tachado ?? 0;
          return (
            <div key={i} style={{ position: 'relative', fontSize: 46, fontWeight: 700, lineHeight: '46px', height: 46, whiteSpace: 'nowrap', color: l.color ?? '#1E3A8A', width: 'fit-content' }}>
              {Array.from(l.texto).slice(0, n).join('')}
              {raya > 0 && <div style={{ position: 'absolute', left: -6, top: 24, height: 5, borderRadius: 3, width: `calc(${raya * 100}% + 12px)`, background: '#DC2626', transform: 'rotate(-2deg)' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Pensamiento escrito a mano en una nube, con sus burbujitas. `t` (0 → 1) lo hace aparecer. */
export const Pensamiento: FC<{ x: number; y: number; texto: ReactNode; t: number; ancho?: number; cola?: 'izquierda' | 'derecha' | 'abajo'; rot?: number }> = ({ x, y, texto, t, ancho = 430, cola = 'abajo', rot = 0 }) => {
  if (t <= 0) return null;
  const burbujas = cola === 'izquierda' ? [[-40, 90, 22], [-80, 140, 14]] : cola === 'derecha' ? [[ancho + 30, 90, 22], [ancho + 66, 140, 14]] : [[ancho * 0.3, 0, 22], [ancho * 0.22, 46, 14]];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: ancho, opacity: Math.min(1, t * 2), transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * t}) rotate(${rot}deg)`, transformOrigin: '50% 100%' }}>
      <div style={{ position: 'relative', background: 'white', borderRadius: 48, padding: '24px 34px 28px', fontFamily: aMano, fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: '#0F172A', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', textAlign: 'center' }}>
        {texto}
        {burbujas.map(([bx, by, r], i) => (
          <div key={i} style={{ position: 'absolute', left: bx - r, top: cola === 'abajo' ? `calc(100% + ${by + 10}px)` : by, width: r * 2, height: r * 2, borderRadius: '50%', background: 'white', boxShadow: '0 10px 24px rgba(0,0,0,0.35)' }} />
        ))}
      </div>
    </div>
  );
};

/** Una de las «respuestas» que flotan sobre Camilo: de dónde sale (icono) y qué dice. */
export const Respuesta: FC<{ x: number; y: number; t: number; icono: ReactNode; texto: string; color: string; rot?: number; temblor?: number }> = ({ x, y, t, icono, texto, color, rot = 0, temblor = 0 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * t}) rotate(${rot + Math.sin(temblor * 40) * 4 * (temblor > 0 && temblor < 1 ? 1 : 0)}deg)`, opacity: Math.min(1, t * 2), display: 'flex', alignItems: 'center', gap: 18, padding: '18px 30px 18px 18px', borderRadius: 30, background: 'white', border: `6px solid ${color}`, boxShadow: '0 20px 44px rgba(0,0,0,0.45)', fontFamily: SISTEMA, whiteSpace: 'nowrap' }}>
      <div style={{ width: 76, height: 76, borderRadius: 20, background: color, display: 'grid', placeItems: 'center', fontSize: 44 }}>{icono}</div>
      <span style={{ fontSize: 54, fontWeight: 800, color: '#0F172A', letterSpacing: -1 }}>{texto}</span>
    </div>
  ) : null;

/** Etiqueta con un texto («Copa Galileo»). */
export const Etiqueta: FC<{ x: number; y: number; t: number; children: ReactNode; color?: string; tamano?: number }> = ({ x, y, t, children, color = MORADO_CAMILO, tamano = 42 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * t})`, opacity: Math.min(1, t * 2), background: 'rgba(12,19,34,0.9)', border: `4px solid ${color}`, color: 'white', borderRadius: 999, padding: '10px 28px', fontSize: tamano, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 14px 30px rgba(0,0,0,0.45)', fontFamily: SISTEMA }}>{children}</div>
  ) : null;

// --- La planilla de juego en papel (desde `sabado-de-partidos`) ------------------------------------------------------

export type MarcaPlanilla = 'gol' | 'amarilla' | 'roja';
export type FilaPlanilla = { min: string; jugador: string; marca: MarcaPlanilla; tachado?: boolean; corregido?: string };

/** Lo que anotó Camilo a mano un sábado de la Liga Infantil Sub-10 (antes de Gali Esport). */
export const FILAS_PLANILLA: FilaPlanilla[] = [
  { min: "12'", jugador: 'Juan P.', marca: 'gol' },
  { min: "27'", jugador: 'Simón', marca: 'gol' },
  { min: "31'", jugador: '#4 Díaz', marca: 'amarilla' },
  { min: "40'", jugador: 'Pipe', marca: 'roja' },
  { min: "44'", jugador: 'Tomi', marca: 'gol', tachado: true, corregido: 'Tommy?' },
  { min: "52'", jugador: 'Juan P.', marca: 'gol' },
];

/** El dibujito a lápiz de cada marca: un balón o una tarjeta rayada de amarillo o rojo. */
export const MarcaLapiz: FC<{ marca: MarcaPlanilla; tamano?: number }> = ({ marca, tamano = 40 }) =>
  marca === 'gol' ? (
    <svg width={tamano} height={tamano} viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
      <circle cx={20} cy={20} r={15} fill="none" stroke="#334155" strokeWidth={2.6} />
      <path d="M 20 12 L 27 17 L 24.5 25.5 L 15.5 25.5 L 13 17 Z" fill="#334155" opacity={0.85} />
      <path d="M 20 12 L 20 5.5 M 27 17 L 33.5 14.5 M 24.5 25.5 L 29 32 M 15.5 25.5 L 11 32 M 13 17 L 6.5 14.5" stroke="#334155" strokeWidth={2} />
    </svg>
  ) : (
    <svg width={tamano * 0.75} height={tamano} viewBox="0 0 30 40" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`tarjeta-${marca}`}>
          <rect x={3} y={3} width={24} height={34} rx={2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#tarjeta-${marca})`}>
        {Array.from({ length: 12 }, (_, k) => (
          <path key={k} d={`M ${-10 + k * 5} 42 L ${8 + k * 5} -2`} stroke={marca === 'amarilla' ? '#EAB308' : '#DC2626'} strokeWidth={3.4} opacity={0.9} />
        ))}
      </g>
      <rect x={3} y={3} width={24} height={34} rx={2} fill="none" stroke="#334155" strokeWidth={2.2} transform="rotate(-2 15 20)" />
    </svg>
  );

export const PLANILLA = { ancho: 760, alto: 980, fila: 66, arribaFilas: 360 };

/**
 * Planilla de juego de papel. Las filas se escriben cuando `escrito` pasa por su número; `apurada` (0 → 1) tuerce y
 * desordena la letra de las últimas filas y `tachones` raya lo que estaba mal.
 */
export const Planilla: FC<{ escrito: number; apurada?: number; tachones?: number; marcador?: number; filas?: FilaPlanilla[]; style?: CSSProperties }> = ({ escrito, apurada = 0, tachones = 0, marcador = 0, filas = FILAS_PLANILLA, style }) => {
  const impreso: CSSProperties = { fontFamily: SISTEMA, color: '#475569', fontSize: 22, fontWeight: 600 };
  const mano: CSSProperties = { fontFamily: aMano, fontSize: 46, fontWeight: 700, color: '#1E3A8A', lineHeight: 1, whiteSpace: 'nowrap' };
  const cols = [44, 150, 500, 640];
  return (
    <div style={{ position: 'relative', width: PLANILLA.ancho, height: PLANILLA.alto, borderRadius: 10, background: '#FFFDF6', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', ...style }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: '#7C3AED', opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', fontFamily: SISTEMA, fontSize: 36, fontWeight: 900, letterSpacing: 3, color: '#1E293B' }}>PLANILLA DE JUEGO</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 94, textAlign: 'center', ...impreso, fontSize: 20, fontWeight: 500, color: '#64748B' }}>Liga Infantil Sub-10 · Sábado</div>
      <div style={{ position: 'absolute', left: 44, right: 44, top: 134, height: 3, background: '#1E293B', opacity: 0.8 }} />
      {/* Datos del partido */}
      {[
        { x: 44, y: 166, label: 'Local:', valor: 'Gaviotas' },
        { x: 400, y: 166, label: 'Visitante:', valor: 'Rayos' },
        { x: 44, y: 236, label: 'Cancha:', valor: '1' },
        { x: 400, y: 236, label: 'Hora:', valor: '9:00' },
      ].map((d) => (
        <div key={d.label} style={{ position: 'absolute', left: d.x, top: d.y, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={impreso}>{d.label}</span>
          <span style={{ ...mano, fontSize: 44, borderBottom: '2px solid #CBD5E1', paddingRight: 30 }}>{d.valor}</span>
        </div>
      ))}
      {/* Tabla */}
      <div style={{ position: 'absolute', left: 30, right: 30, top: 300, height: 54, background: '#F1F5F9', borderRadius: 6, display: 'flex', alignItems: 'center', ...impreso, fontSize: 20, fontWeight: 800, letterSpacing: 1.5, color: '#334155' }}>
        <span style={{ position: 'absolute', left: cols[0] - 30 + 6 }}>MIN</span>
        <span style={{ position: 'absolute', left: cols[1] - 30 + 6 }}>JUGADOR</span>
        <span style={{ position: 'absolute', left: cols[2] - 30 + 6 }}>EVENTO</span>
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 30, right: 30, top: PLANILLA.arribaFilas + (i + 1) * PLANILLA.fila, height: 2, background: '#BFDBFE' }} />
      ))}
      {[cols[1] - 12, cols[2] - 12].map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: 300, width: 2, height: 54 + 8 * PLANILLA.fila + 6, background: '#BFDBFE' }} />
      ))}
      {filas.map((fila, i) => {
        const avance = Math.max(0, Math.min(1, escrito - i));
        if (avance <= 0) return null;
        const prisa = i >= 3 ? apurada : apurada * 0.3;
        const giro = [-1.5, 1, -0.5, 2, -3, 2.5][i % 6] * (0.4 + prisa * 1.6);
        const y = PLANILLA.arribaFilas + i * PLANILLA.fila + 8;
        const corte = (s: string) => Array.from(s).slice(0, Math.ceil(Array.from(s).length * Math.min(1, avance * 1.6))).join('');
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: y, width: PLANILLA.ancho, height: PLANILLA.fila, transform: `rotate(${giro}deg) translateX(${prisa * (i % 2 ? 10 : -6)}px)`, transformOrigin: '30% 50%' }}>
            <span style={{ ...mano, position: 'absolute', left: cols[0], top: 8 }}>{corte(fila.min)}</span>
            <span style={{ ...mano, position: 'absolute', left: cols[1], top: 8, fontSize: 46 + prisa * 6, letterSpacing: prisa * 2 }}>
              {corte(fila.jugador)}
              {fila.tachado && tachones > 0 && <span style={{ position: 'absolute', left: -8, top: 22, height: 6, width: `calc(${tachones * 100}% + 16px)`, background: '#334155', borderRadius: 3, transform: 'rotate(-4deg)' }} />}
              {fila.tachado && fila.corregido && tachones > 0.5 && <span style={{ position: 'absolute', left: '105%', top: -14, fontSize: 36, color: '#B91C1C', transform: 'rotate(-8deg)', opacity: Math.min(1, (tachones - 0.5) * 3) }}>{fila.corregido}</span>}
            </span>
            {avance > 0.6 && (
              <span style={{ position: 'absolute', left: cols[2] + 6, top: 6, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, (avance - 0.6) * 3) }}>
                <MarcaLapiz marca={fila.marca} tamano={44} />
                <span style={{ ...mano, fontSize: 40, color: '#334155' }}>{fila.marca}</span>
              </span>
            )}
          </div>
        );
      })}
      {/* Borrón de la letra apurada */}
      {apurada > 0.3 && <div style={{ position: 'absolute', left: 420, top: PLANILLA.arribaFilas + 4.2 * PLANILLA.fila, width: 150, height: 70, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(51,65,85,0.28), rgba(51,65,85,0))', opacity: Math.min(1, (apurada - 0.3) * 2), transform: 'rotate(-12deg)' }} />}
      {/* Marcador */}
      <div style={{ position: 'absolute', left: 44, top: PLANILLA.alto - 92, display: 'flex', alignItems: 'baseline', gap: 16, opacity: marcador }}>
        <span style={{ ...impreso, fontSize: 24, fontWeight: 800, color: '#334155' }}>MARCADOR:</span>
        <span style={{ ...mano, fontSize: 54 }}>
          <span style={{ position: 'relative' }}>
            2<span style={{ position: 'absolute', left: -6, right: -6, top: 26, height: 5, background: '#334155', transform: 'rotate(-20deg)' }} />
          </span>{' '}
          3 – 1
        </span>
      </div>
    </div>
  );
};

/** La tablilla de Camilo con sus planillas, suelta (para guardarla). `x`, `y`: centro; `ancho` en píxeles del video. */
export const Tablilla: FC<{ x: number; y: number; ancho: number; rot?: number; hojas?: number; opacidad?: number }> = ({ x, y, ancho, rot = 0, hojas = 3, opacidad = 1 }) => (
  <svg width={ancho} height={(ancho * 120) / 88} viewBox="66 168 92 126" style={{ position: 'absolute', left: x - ancho / 2, top: y - (ancho * 120) / 88 / 2, transform: `rotate(${rot}deg)`, opacity: opacidad, overflow: 'visible', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }}>
    <rect x={70} y={176} width={84} height={108} rx={7} fill="#A16207" stroke="#713F12" strokeWidth={2} />
    {Array.from({ length: Math.max(1, Math.round(hojas)) }, (_, k) => (
      <g key={k} transform={`translate(${-k * 1.6} ${-k * 2.2}) rotate(${(k % 2 ? 1 : -1) * k * 0.8} 112 232)`}>
        <rect x={77} y={188} width={70} height={90} rx={2} fill={k % 2 ? '#F8FAFC' : '#FFFDF5'} stroke="#CBD5E1" strokeWidth={1} />
        {[0, 1, 2, 3, 4].map((l) => (
          <rect key={l} x={84} y={204 + l * 13} width={l === 0 ? 40 : 52} height={2.6} rx={1.3} fill="#64748B" opacity={0.55} />
        ))}
      </g>
    ))}
    <rect x={96} y={170} width={32} height={16} rx={4} fill="#94A3B8" stroke="#64748B" strokeWidth={1.5} />
  </svg>
);
