// El logo de Gali Esport: el isotipo (public/svg/gali-esport-isotipo-color.svg de la app) y el bloque
// «GALI / ESPORT» con que cierran los videos de la marca (desde `torneo-whatsapp`).
import type { CSSProperties, FC } from 'react';
import { CELESTE, MARINO } from './tema';

/** Isotipo de Gali Esport. `trazo` es el marco; `barras`, las tres barras celestes. */
export const Isotipo: FC<{ tamano: number; trazo?: string; barras?: string; style?: CSSProperties }> = ({ tamano, trazo = MARINO, barras = CELESTE, style }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 100 100" style={{ flexShrink: 0, ...style }}>
    <path d="M86 40L86 36A22 22 0 0 0 64 14L36 14A22 22 0 0 0 14 36L14 64A22 22 0 0 0 36 86L64 86A22 22 0 0 0 86 64L86 60" fill="none" stroke={trazo} strokeWidth={13} />
    <path d="M48 27.5H68L64 36.5H44Z M48 45.5H90L86 54.5H44Z M48 63.5H68L64 72.5H44Z" fill={barras} />
  </svg>
);

/** Bloque del logo: isotipo blanco en su baldosa oscura y «GALI / ESPORT». Mide unos 520 × 150 px. */
export const LogoGali: FC<{ style?: CSSProperties }> = ({ style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 26, ...style }}>
    <div style={{ width: 150, height: 150, borderRadius: 40, background: 'linear-gradient(150deg, #13233A 0%, #0A1520 100%)', boxShadow: '0 0 0 3px rgba(0,212,255,0.35)', display: 'grid', placeItems: 'center' }}>
      <Isotipo tamano={120} trazo="#FFFFFF" />
    </div>
    <div style={{ lineHeight: 0.95, fontFamily: 'inherit' }}>
      <div style={{ fontSize: 84, fontWeight: 900, color: 'white', letterSpacing: 1 }}>GALI</div>
      <div style={{ fontSize: 64, fontWeight: 700, color: '#94A3B8', letterSpacing: 6 }}>ESPORT</div>
    </div>
  </div>
);

/**
 * El logo del cierre, centrado en (x, y). `t` (0 → 1, normalmente un resorte) lo hace subir y aparecer;
 * `golpe` (0 → 1 → 0) le da un latido en la palabra final.
 */
export const MarcaFinal: FC<{ t: number; golpe?: number; x?: number; y?: number }> = ({ t, golpe = 0, x = 540, y = 760 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, opacity: Math.min(1, t * 1.5), transform: `translate(-50%, -50%) translateY(${(1 - t) * 40}px) scale(${0.85 + 0.15 * t + golpe * 0.05})`, filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.55))' }}>
      <LogoGali />
    </div>
  ) : null;
