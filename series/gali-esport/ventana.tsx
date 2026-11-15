// La ventana de un navegador de computador (pestañas, barra de dirección y botones de ventana) para los tutoriales en
// escritorio, con la página adentro vista por una cámara (`Vista`), el puntero (flecha o manito) y la onda del clic.
// Desde `mi-escuela`. La ventana se dibuja en píxeles del video; la página, en píxeles de la app (1280 de ancho).
import type { CSSProperties, FC, ReactNode } from 'react';
import { Isotipo } from './marca';
import { SISTEMA } from './tema';

/** Ancho de la página de escritorio (los `md` y `lg` de la app están activos). */
export const ANCHO_PAGINA = 1280;
/** Alto de las pestañas y de la barra de dirección, en píxeles del video. */
export const CROMO = { pestanas: 54, barra: 60 };
export const ALTO_CROMO = CROMO.pestanas + CROMO.barra;

export type PuntoV = { x: number; y: number };
/** Cámara de la página: el punto `foco` de la página cae en `en` (píxeles de la vista) con `escala`. */
export type CamaraV = { foco: PuntoV; en: PuntoV; escala: number };

export type PestanaNav = { titulo: string; icono?: 'gali' | 'globo' | 'escudo'; escudo?: ReactNode };

const GRIS_PESTANAS = '#DEE1E6';
const TINTA = '#202124';
const TENUE = '#5F6368';

const IconoPestana: FC<{ p: PestanaNav }> = ({ p }) =>
  p.icono === 'gali' ? (
    <Isotipo tamano={22} />
  ) : p.icono === 'escudo' && p.escudo ? (
    <div style={{ width: 22, height: 22, flexShrink: 0 }}>{p.escudo}</div>
  ) : p.icono === 'globo' ? (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={TENUE} strokeWidth={2} style={{ flexShrink: 0 }}>
      <circle cx={12} cy={12} r={10} />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  ) : null;

/**
 * Ventana del navegador en (x, y) del video. `activa` es la pestaña que se ve; `url` el texto de la barra
 * (`caret` muestra el cursor de escribir; `realce` 0 → 1 ilumina la barra). `carga` 0 → 1 es la línea azul de carga.
 * `children` va en la vista (debajo de la barra), normalmente una `Vista`.
 */
export const VentanaNavegador: FC<{
  x: number;
  y: number;
  ancho: number;
  alto: number;
  pestanas: PestanaNav[];
  activa: number;
  url: string;
  caret?: boolean;
  realce?: number;
  carga?: number;
  fondo?: string;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ x, y, ancho, alto, pestanas, activa, url, caret, realce = 0, carga = 0, fondo = '#FFFFFF', style, children }) => {
  const [dominio, ...resto] = url.split('/');
  const ruta = resto.length ? `/${resto.join('/')}` : '';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: ancho,
        height: alto,
        borderRadius: 22,
        overflow: 'hidden',
        background: GRIS_PESTANAS,
        boxShadow: '0 50px 110px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(255,255,255,0.10)',
        fontFamily: SISTEMA,
        ...style,
      }}
    >
      {/* Pestañas y botones de ventana */}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: CROMO.pestanas }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c, k) => (
          <div key={c} style={{ position: 'absolute', left: 24 + k * 26, top: 20, width: 15, height: 15, borderRadius: '50%', background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
        ))}
        <div style={{ position: 'absolute', left: 110, bottom: 0, display: 'flex', alignItems: 'flex-end' }}>
          {pestanas.map((p, k) => {
            const on = k === activa;
            return (
              <div
                key={k}
                style={{
                  position: 'relative',
                  width: 300,
                  height: 42,
                  marginLeft: k ? -2 : 0,
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: '12px 12px 0 0',
                  background: on ? '#FFFFFF' : 'transparent',
                  color: on ? TINTA : TENUE,
                  fontSize: 19,
                }}
              >
                <IconoPestana p={p} />
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</span>
                <span style={{ fontSize: 22, color: TENUE, lineHeight: 1 }}>×</span>
                {!on && k + 1 !== activa && k < pestanas.length - 1 && <span style={{ position: 'absolute', right: 0, top: 10, bottom: 10, width: 1.5, background: '#AEB1B6' }} />}
              </div>
            );
          })}
          <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', fontSize: 28, color: TENUE, marginLeft: 6 }}>+</div>
        </div>
      </div>

      {/* Barra de dirección */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: CROMO.pestanas, height: CROMO.barra, background: '#FFFFFF', borderBottom: '1px solid #DADCE0', boxSizing: 'border-box' }}>
        <svg width={120} height={60} viewBox="0 0 120 60" fill="none" stroke={TENUE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: 0 }}>
          <path d="M30 30H14M21 23l-7 7 7 7" />
          <path d="M52 30h16M61 23l7 7-7 7" opacity={0.45} />
          <path d="M108 30a9 9 0 1 1-2.6-6.4M107 21v5h-5" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 140,
            right: 60,
            top: 9,
            height: 42,
            borderRadius: 21,
            background: realce > 0 ? `rgba(241,243,244,${1 - realce})` : '#F1F3F4',
            boxShadow: realce > 0 ? `0 0 0 ${3 * realce}px rgba(14,165,233,${0.9 * realce}), 0 0 ${26 * realce}px rgba(14,165,233,${0.55 * realce})` : undefined,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 18px',
            boxSizing: 'border-box',
            fontSize: 21,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <svg width={16} height={18} viewBox="0 0 16 18" fill={TENUE} style={{ flexShrink: 0 }}>
            <path d="M3 8V5.5a5 5 0 0 1 10 0V8h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm2 0h6V5.5a3 3 0 0 0-6 0z" />
          </svg>
          <span style={{ color: TINTA }}>
            {dominio}
            <span style={{ color: TENUE }}>{ruta}</span>
            {caret && <span style={{ display: 'inline-block', width: 2, height: 24, marginLeft: 1, background: TINTA, verticalAlign: 'middle' }} />}
          </span>
        </div>
        <div style={{ position: 'absolute', right: 22, top: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[0, 1, 2].map((k) => (
            <span key={k} style={{ width: 5, height: 5, borderRadius: '50%', background: TENUE }} />
          ))}
        </div>
        {carga > 0 && carga < 1 && <div style={{ position: 'absolute', left: 0, bottom: -1, height: 3, width: `${carga * 100}%`, background: '#1A73E8' }} />}
      </div>

      {/* La página */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: ALTO_CROMO, bottom: 0, overflow: 'hidden', background: fondo }}>{children}</div>
    </div>
  );
};

/** La página vista por la cámara: `children` va en píxeles de la página. */
export const Vista: FC<{ cam: CamaraV; children: ReactNode }> = ({ cam, children }) => (
  <div style={{ position: 'absolute', left: cam.en.x, top: cam.en.y, width: ANCHO_PAGINA, transformOrigin: '0 0', transform: `scale(${cam.escala}) translate(${-cam.foco.x}px, ${-cam.foco.y}px)` }}>{children}</div>
);

/** Dónde cae en la vista un punto de la página. */
export const enLaVista = (p: PuntoV, cam: CamaraV): PuntoV => ({ x: cam.en.x + (p.x - cam.foco.x) * cam.escala, y: cam.en.y + (p.y - cam.foco.y) * cam.escala });

/**
 * El puntero del ratón, en píxeles de la página: flecha o manito (sobre botones y enlaces). `tamano` lo agranda
 * (para que se vea igual aunque la cámara se acerque: `1.2 / escala`). `apretar` 0 → 1 lo achica en el clic.
 */
export const PunteroPC: FC<{ en: PuntoV; mano?: boolean; tamano?: number; apretar?: number; opacidad?: number }> = ({ en, mano, tamano = 1, apretar = 0, opacidad = 1 }) =>
  opacidad > 0 ? (
    <div style={{ position: 'absolute', left: en.x, top: en.y, width: 0, height: 0, opacity: opacidad, zIndex: 400, transform: `scale(${tamano * (1 - apretar * 0.14)})`, transformOrigin: '0 0', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
      {mano ? (
        <svg width={26} height={30} viewBox="0 0 26 30" style={{ position: 'absolute', left: -9, top: -2, overflow: 'visible' }}>
          <path
            d="M9 2.2c1.3 0 2.3 1 2.3 2.3v8.1l.9-.1V9.6c0-1.2 1-2.1 2.2-2.1s2.1.9 2.1 2.1v3l.9.1v-1.8c0-1.2 1-2.1 2.1-2.1s2.1.9 2.1 2.1v2.4l.8.2c0-1.1.9-1.9 2-1.9s2 .9 2 2V21c0 4-3.2 7.2-7.2 7.2h-3.4c-2.4 0-4.6-1.2-5.9-3.2l-5.4-8c-.6-.9-.4-2.2.5-2.9.9-.7 2.2-.5 2.9.3l1.3 1.6V4.5C6.7 3.2 7.7 2.2 9 2.2z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <path d="M11.3 18v5M15.6 18v5M19.8 18v5" stroke="#0F172A" strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      ) : (
        <svg width={22} height={30} viewBox="0 0 22 30" style={{ position: 'absolute', left: -2, top: -1, overflow: 'visible' }}>
          <path d="M2 1 L2 24 L8 18.5 L12 28 L16 26.3 L12.2 17 L20 17 Z" fill="#0F172A" stroke="white" strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      )}
    </div>
  ) : null;

/** La onda de un clic (`t` de 0 a 1), en píxeles de la página. */
export const OndaClic: FC<{ en: PuntoV; t: number; tamano?: number; color?: string }> = ({ en, t, tamano = 1, color = 'rgba(14,165,233,0.75)' }) =>
  t > 0 && t < 1 ? (
    <div style={{ position: 'absolute', left: en.x - 20 * tamano, top: en.y - 20 * tamano, width: 40 * tamano, height: 40 * tamano, borderRadius: '50%', border: `${3.5 * tamano}px solid ${color}`, transform: `scale(${0.35 + t * 1.5})`, opacity: 1 - t, zIndex: 399, boxSizing: 'border-box' }} />
  ) : null;

/** Anillo de realce alrededor de un rectángulo de la página (`t` de 0 a 1). */
export const Realce: FC<{ x: number; y: number; ancho: number; alto: number; t: number; radio?: number; color?: string; grosor?: number }> = ({ x, y, ancho, alto, t, radio = 12, color = '14,165,233', grosor = 3 }) =>
  t > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x - 5,
        top: y - 5,
        width: ancho + 10,
        height: alto + 10,
        borderRadius: radio + 5,
        boxShadow: `0 0 0 ${grosor * t}px rgba(${color},${0.95 * t}), 0 0 ${24 * t}px rgba(${color},${0.5 * t})`,
        pointerEvents: 'none',
        zIndex: 390,
      }}
    />
  ) : null;
