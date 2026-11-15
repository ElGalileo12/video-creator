// La escalera de la vida: peldaños que suben de izquierda a derecha (NACER, COMPLEJA, INTELIGENTE, SOBREVIVIR),
// cada uno con su ícono de píxeles y su nombre, que se encienden uno a uno. Encima pueden ir muros de ladrillos
// (el Gran Filtro, firme o «fantasma» con un «?») delante de cualquier peldaño y un viajero (un punto) que salta
// de peldaño en peldaño. Todo en coordenadas del video; los valores 0–1 los pone la escena con su reloj.
import type { FC } from 'react';
import { CelulaPixeles, MicrobioPixeles } from './Criaturas';
import { BombillaPixeles, CohetePixeles } from './Iconos';
import { SignoPregunta } from './Pixeles';
import { bb, letra } from './tema';

export type GeoEscalera = {
  /** Borde izquierdo del primer peldaño y altura del suelo (px). */
  x: number;
  piso: number;
  /** Ancho de cada peldaño, alto del primero y cuánto sube cada uno de los siguientes (px). */
  ancho: number;
  primero: number;
  sube: number;
};

/** La escalera de cuatro peldaños, de 90 a 970 px de ancho y del suelo (1300) a 790. */
export const ESCALERA_VIDA: GeoEscalera = { x: 90, piso: 1300, ancho: 220, primero: 90, sube: 140 };

export type IconoPeldano = 'microbio' | 'celula' | 'bombilla' | 'cohete';
export type Peldano = { texto: string; icono: IconoPeldano };

export const PELDANOS_VIDA: Peldano[] = [
  { texto: 'NACER', icono: 'microbio' },
  { texto: 'COMPLEJA', icono: 'celula' },
  { texto: 'INTELIGENTE', icono: 'bombilla' },
  { texto: 'SOBREVIVIR', icono: 'cohete' },
];

/** Borde izquierdo y altura de la cara de arriba del peldaño k. */
export const xPeldano = (g: GeoEscalera, k: number) => g.x + k * g.ancho;
export const topePeldano = (g: GeoEscalera, k: number) => g.piso - g.primero - k * g.sube;
/** Centro del ícono del peldaño k. */
export const iconoPeldano = (g: GeoEscalera, k: number) => ({ x: xPeldano(g, k) + g.ancho * 0.45, y: topePeldano(g, k) - 62 });

const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;
/** Donde se apoya un muro puesto delante del peldaño k: sobre el peldaño anterior (o el suelo). Acepta k con decimales. */
const baseMuro = (g: GeoEscalera, en: number) => {
  const base = (k: number) => (k <= 0 ? g.piso : topePeldano(g, k - 1));
  const k0 = Math.floor(en);
  return mezcla(base(k0), base(k0 + 1), en - k0);
};
const GROSOR_MURO = 48;
/** Arriba al centro del muro delante del peldaño `en` (para letreros y flechas). */
export const puntoMuro = (g: GeoEscalera, en: number, alto = 1.7) => ({ x: g.x + en * g.ancho - GROSOR_MURO / 2 - 2, y: baseMuro(g, en) - alto * g.sube });
/** Dónde se para el viajero en el peldaño `en` (con decimales: a mitad de un salto). */
export const puntoViajero = (g: GeoEscalera, en: number) => {
  const p = (k: number) => ({ x: xPeldano(g, k) + g.ancho * 0.2, y: topePeldano(g, k) - 16 });
  const k0 = Math.floor(en);
  const t = en - k0;
  const a = p(k0);
  const b = p(k0 + 1);
  return { x: mezcla(a.x, b.x, t), y: mezcla(a.y, b.y, t) - Math.sin(Math.PI * t) * 70 };
};

export type EstadoPeldano = {
  /** 0–1: el peldaño sube desde el suelo. */
  aparece: number;
  /** 0–1: se enciende con su color (la cara de arriba, el nombre y el ícono). */
  enciende: number;
  color?: string;
  /** 0–1: se apaga a medias (para que resalte otro). */
  tenue?: number;
  /** Insignia sobre el ícono (p. ej. «✓ FÁCIL»), con su color y su entrada 0–1. */
  marca?: { texto: string; color: string; aparece: number };
};

export type MuroEscalera = {
  /** Delante de qué peldaño va (con decimales mientras se desliza). */
  en: number;
  /** 0–1: cae desde arriba. */
  aparece: number;
  /** Alto en «escalones» (1 = lo que sube un peldaño). */
  alto?: number;
  color?: string;
  /** 0–1: de ladrillo firme a fantasma (transparente, con borde punteado y «?»). */
  fantasma?: number;
  /** 0–1: golpe que lo hace latir. */
  late?: number;
  /** Cuánto se levanta (px), p. ej. para saltar por encima del viajero mientras se desliza. */
  eleva?: number;
  /** Letrero encima (una o más líneas, separadas con \n). */
  texto?: string;
  textoOpacidad?: number;
};

export type ViajeroEscalera = {
  en: number;
  aparece: number;
  color?: string;
  etiqueta?: string;
  etiquetaOpacidad?: number;
  pulso?: number;
};

type Props = {
  geo?: GeoEscalera;
  peldanos: EstadoPeldano[];
  nombres?: Peldano[];
  muros?: MuroEscalera[];
  viajero?: ViajeroEscalera;
  frame: number;
  opacidad?: number;
};

const Icono: FC<{ icono: IconoPeldano; x: number; y: number; luz: number; color: string; frame: number }> = ({ icono, x, y, luz, frame }) => {
  const encendido = luz > 0.5;
  if (icono === 'microbio') return <MicrobioPixeles x={x - 26} y={y + 10} lado={6} enciende={luz} frame={frame} />;
  if (icono === 'celula') return <g opacity={encendido ? 1 : 0.35}><CelulaPixeles x={x} y={y} lado={8} /></g>;
  if (icono === 'bombilla') return <BombillaPixeles x={x} y={y} lado={8} luz={luz} />;
  return <CohetePixeles x={x} y={y} lado={8} frame={frame} fuego={luz} apagado={!encendido} />;
};

/** Muro vertical de ladrillos de píxeles, apoyado en (x, base), de `alto` px. */
const MuroVertical: FC<{ x: number; base: number; alto: number; color: string; fantasma: number }> = ({ x, base, alto, color: c, fantasma }) => {
  const fila = 24;
  const filas = Math.max(1, Math.round(alto / fila));
  const izq = x - GROSOR_MURO / 2;
  const ladrillos = Array.from({ length: filas }, (_, r) => {
    const y = base - (r + 1) * fila;
    const cortes = r % 2 ? [0, 12, 36, 48] : [0, 24, 48];
    return cortes.slice(0, -1).map((a, k) => (
      <rect key={`${r}-${k}`} x={izq + a + 2} y={y + 2} width={cortes[k + 1] - a - 4} height={fila - 4} fill={(r + k) % 3 === 0 ? bb.terracotaClara : c} stroke={bb.tinta} strokeWidth={2} />
    ));
  });
  const arriba = base - filas * fila;
  return (
    <g shapeRendering="crispEdges">
      <g opacity={1 - 0.75 * fantasma}>{ladrillos}</g>
      {fantasma > 0 && (
        <rect x={izq - 6} y={arriba - 6} width={GROSOR_MURO + 12} height={filas * fila + 6} fill="none" stroke={c} strokeWidth={4} strokeDasharray="10 8" opacity={fantasma} />
      )}
    </g>
  );
};

export const Escalera: FC<Props> = ({ geo: g = ESCALERA_VIDA, peldanos, nombres = PELDANOS_VIDA, muros = [], viajero, frame, opacidad = 1 }) => (
  <g opacity={opacidad}>
    {/* Suelo */}
    <rect x={g.x - 60} y={g.piso} width={nombres.length * g.ancho + 120} height={6} fill="#2A3350" shapeRendering="crispEdges" />
    {peldanos.map((e, k) => {
      if (e.aparece <= 0) return null;
      const c = e.color ?? bb.verde;
      const tope = mezcla(g.piso, topePeldano(g, k), Math.min(1, e.aparece));
      const x0 = xPeldano(g, k);
      const luz = e.enciende;
      const icono = iconoPeldano(g, k);
      return (
        <g key={k} opacity={Math.min(1, e.aparece * 2) * (1 - 0.6 * (e.tenue ?? 0))}>
          <rect x={x0} y={tope} width={g.ancho} height={g.piso - tope} fill={bb.noche} stroke="#2A3350" strokeWidth={3} shapeRendering="crispEdges" />
          {/* Rayitas de piedra */}
          {Array.from({ length: Math.floor((g.piso - tope - 20) / 34) }, (_, r) => (
            <rect key={r} x={x0 + 14 + ((r * 37) % 60)} y={tope + 76 + r * 34} width={40} height={4} fill="#1E2740" shapeRendering="crispEdges" />
          ))}
          <rect x={x0} y={tope} width={g.ancho} height={12} fill={luz > 0 ? c : '#3A4256'} opacity={luz > 0 ? 0.4 + 0.6 * luz : 1} style={{ filter: luz > 0.3 ? `drop-shadow(0 0 ${14 * luz}px ${c})` : undefined }} shapeRendering="crispEdges" />
          <text x={x0 + g.ancho / 2} y={tope + 52} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={nombres[k].texto.length > 9 ? 27 : 30} letterSpacing={1} fill={luz > 0.5 ? c : '#6B7590'} opacity={Math.min(1, e.aparece)}>
            {nombres[k].texto}
          </text>
          {e.aparece > 0.85 && <Icono icono={nombres[k].icono} x={icono.x} y={icono.y} luz={luz} color={c} frame={frame} />}
          {e.marca && e.marca.aparece > 0 && (
            <g transform={`translate(${icono.x} ${icono.y - 92}) scale(${0.5 + 0.5 * e.marca.aparece})`} opacity={Math.min(1, e.marca.aparece * 1.6)}>
              <rect x={-e.marca.texto.length * 11 - 18} y={-26} width={e.marca.texto.length * 22 + 36} height={50} fill="rgba(5,8,15,0.88)" stroke={e.marca.color} strokeWidth={3} />
              <text x={0} y={10} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={32} letterSpacing={1} fill={e.marca.color}>
                {e.marca.texto}
              </text>
            </g>
          )}
        </g>
      );
    })}
    {muros.map((m, i) => {
      if (m.aparece <= 0) return null;
      const alto = (m.alto ?? 1.7) * g.sube;
      const c = m.color ?? bb.terracota;
      const p = puntoMuro(g, m.en, m.alto ?? 1.7);
      p.y -= m.eleva ?? 0;
      const base = baseMuro(g, m.en) - (m.eleva ?? 0);
      const fantasma = m.fantasma ?? 0;
      const late = m.late ?? 0;
      return (
        <g key={i} opacity={Math.min(1, m.aparece * 2)}>
          <g transform={`translate(0 ${-(1 - Math.min(1, m.aparece)) * 260}) translate(${p.x} ${base}) scale(${1 + 0.1 * late}) translate(${-p.x} ${-base})`}>
            <MuroVertical x={p.x} base={base} alto={alto} color={c} fantasma={fantasma} />
            {fantasma > 0.05 && <SignoPregunta x={p.x} y={base - alto / 2} lado={8} color={c} opacidad={fantasma} />}
          </g>
          {m.texto &&
            m.texto.split('\n').map((linea, k, todas) => (
              <text
                key={k}
                x={p.x}
                y={p.y - 26 - (todas.length - 1 - k) * 38}
                textAnchor="middle"
                fontFamily={letra.mono}
                fontWeight={700}
                fontSize={32}
                letterSpacing={2}
                fill={c === bb.terracota ? bb.terracotaClara : c}
                stroke={bb.tinta}
                strokeWidth={8}
                paintOrder="stroke"
                opacity={m.textoOpacidad ?? 1}
              >
                {linea}
              </text>
            ))}
        </g>
      );
    })}
    {viajero && viajero.aparece > 0 && (() => {
      const p = puntoViajero(g, viajero.en);
      const c = viajero.color ?? bb.verde;
      const s = Math.min(1, viajero.aparece);
      return (
        <g transform={`translate(${p.x} ${p.y})`} opacity={Math.min(1, viajero.aparece * 1.6)}>
          <circle r={(26 + 16 * (viajero.pulso ?? 0)) * s} fill={c} opacity={0.2 + 0.1 * Math.sin(frame / 6)} />
          <rect x={-15 * s} y={-15 * s} width={30 * s} height={30 * s} fill={c} stroke={bb.tinta} strokeWidth={4} shapeRendering="crispEdges" />
          {viajero.etiqueta && (viajero.etiquetaOpacidad ?? 1) > 0 && (
            <text opacity={viajero.etiquetaOpacidad ?? 1} x={-34} y={10} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={32} letterSpacing={2} fill={c} stroke={bb.tinta} strokeWidth={8} paintOrder="stroke">
              {viajero.etiqueta}
            </text>
          )}
        </g>
      );
    })()}
  </g>
);
