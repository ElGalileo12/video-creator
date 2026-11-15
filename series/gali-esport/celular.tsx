// El celular en grande (390 × 844 puntos de iPhone), con su barra de estado y la isla, y el toque de un dedo.
// Mover `foco`, `en` y `escala` es mover la cámara sobre la pantalla del celular.
import type { FC, ReactNode } from 'react';
import { SISTEMA } from './tema';

export const PANTALLA_CEL = { ancho: 390, alto: 844 };
const MARCO = 14;
export type PuntoCel = { x: number; y: number };
export type CamaraCel = { foco: PuntoCel; en: PuntoCel; escala: number };

/** Dónde cae en el video un punto de la pantalla del celular. */
export const enVideoCel = (p: PuntoCel, cam: CamaraCel): PuntoCel => ({ x: cam.en.x + (p.x - cam.foco.x) * cam.escala, y: cam.en.y + (p.y - cam.foco.y) * cam.escala });

/** `tam` cambia el tamaño de la pantalla (por defecto 390 × 844; la página pública usa 430 × 932). */
export const Celular: FC<CamaraCel & { rot?: number; opacidad?: number; fondo?: string; hora?: string; barraClara?: boolean; tam?: { ancho: number; alto: number }; children: ReactNode }> = ({ foco, en, escala, rot = 0, opacidad = 1, fondo = '#EFEAE2', hora = '19:58', barraClara = false, tam = PANTALLA_CEL, children }) => (
  <div style={{ position: 'absolute', left: en.x, top: en.y, opacity: opacidad, transformOrigin: '0 0', transform: `rotate(${rot}deg) scale(${escala}) translate(${-(foco.x + MARCO)}px, ${-(foco.y + MARCO)}px)` }}>
    <div style={{ width: tam.ancho + MARCO * 2, height: tam.alto + MARCO * 2, padding: MARCO, borderRadius: 66, background: 'linear-gradient(145deg, #2A3242 0%, #0B0F17 30%, #0B0F17 70%, #232A38 100%)', boxShadow: '0 0 0 2px #3A4356, 0 40px 90px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: tam.ancho, height: tam.alto, borderRadius: 52, overflow: 'hidden', background: fondo, fontFamily: SISTEMA }}>
        {children}
        <BarraEstado hora={hora} clara={barraClara} />
        <div style={{ position: 'absolute', left: tam.ancho / 2 - 62, top: 11, width: 124, height: 36, borderRadius: 18, background: '#05070B', zIndex: 60 }} />
      </div>
    </div>
  </div>
);/** Hora, señal, wifi y batería. `clara` la pinta blanca (para fondos oscuros). */
const BarraEstado: FC<{ hora: string; clara: boolean }> = ({ hora, clara }) => {
  const c = clara ? '#FFFFFF' : '#0F172A';
  return (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 44, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 30px 0 40px', color: c }}>
    <span style={{ fontSize: 16, fontWeight: 600 }}>{hora}</span>
    <svg width={74} height={14} viewBox="0 0 74 14">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 5} y={10 - i * 3} width={3.4} height={4 + i * 3} rx={1} fill={c} />
      ))}
      <path d="M31 4.5a10 10 0 0 1 14 0M33.3 7a6.6 6.6 0 0 1 9.4 0M35.6 9.5a3.2 3.2 0 0 1 4.8 0" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <rect x={50.5} y={1.5} width={20} height={11} rx={3} stroke={c} strokeOpacity={0.4} fill="none" />
      <rect x={52.5} y={3.5} width={11} height={7} rx={1.6} fill={c} />
    </svg>
  </div>
  );
};

/** Toque de un dedo en la pantalla del celular. `t` va de 0 a 1. */
export const Toque: FC<{ en: PuntoCel; t: number; color?: string }> = ({ en, t, color = 'rgba(0,168,132,0.7)' }) => {
  if (t <= 0 || t >= 1) return null;
  const aprieta = t < 0.35 ? t / 0.35 : 1;
  const suelta = t < 0.35 ? 0 : (t - 0.35) / 0.65;
  return (
    <>
      <div style={{ position: 'absolute', left: en.x - 22, top: en.y - 22, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', transform: `scale(${0.6 + 0.4 * aprieta})`, opacity: 1 - suelta, zIndex: 120 }} />
      <div style={{ position: 'absolute', left: en.x - 22, top: en.y - 22, width: 44, height: 44, borderRadius: '50%', border: `3px solid ${color}`, transform: `scale(${1 + suelta * 1.6})`, opacity: (1 - suelta) * (suelta > 0 ? 1 : 0), zIndex: 120, boxSizing: 'border-box' }} />
    </>
  );
};
