// El partido en vivo del ROL ORGANIZADOR, fiel a la app (mismos textos, colores, radios e iconos). Código (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport/app/(dashboard)/organizer/tournaments/[id]/TournamentDetailClient.tsx
// - LiveMatchCard: el tablero oscuro con azul cielo (#0ea5e9 / #0369a1): «EN VIVO» / «MEDIO TIEMPO», la fase, la sede,
//   el reloj («34'» o «DESCANSO»), cada lado con «+ Anotar gol», «−», las tarjetas amarilla (#facc15) y roja (#ef4444)
//   y su lista de eventos (jugador y minuto), «MARCADOR» y el pie con la ayuda, «Medio tiempo» / «Empezar 2º tiempo»,
//   «Ver calendario» y «Finalizar partido». No se muestra el control «Tiempo extra» ni los «Penales».
// - PlayerPickerModal: «¿Quién anotó?» / «Tarjeta amarilla a…» con el equipo, «Buscar o escribir nombre…», el minuto
//   y la lista de jugadores (número, nombre y posición), más «Anotar gol de “…”» con lo escrito.
// - El Resumen con el partido en vivo arriba, «Próximos partidos» por día, «Equipos recientes» y «Acciones rápidas».
// Los textos de gol y tarjetas salen de app/lib/stat-profiles.ts (perfil de fútbol).
// Todo en píxeles de la app (1440 × 1040); va dentro de `PaginaDetalle` (organizador.tsx).
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, Clock, ExternalLink, Layers, MapPin, Pause, Play, Search, UserPlus, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { apretado, Cursor, PANTALLA, type Punto } from './computador';
import { iniciales, type Jugador, sombra } from './equipos';
import { DETALLE, TARJETA_DET } from './organizador';
import { type Evento, type Partido, PARTIDOS_COPA, type TipoEvento } from './partidos';
import { LILA } from './tema';

// --- Colores del tablero ------------------------------------------------------------------------------------------

/** TEAM_PALETTE de TournamentDetailClient y de la página pública (distinta a la de Fases y partidos). */
const PALETA_VIVO = ['#a21caf', '#2563eb', '#0891b2', '#dc2626', '#ea580c', '#16a34a', '#7c3aed', '#db2777', '#0d9488', '#ca8a04'];
export const colorVivo = (nombre: string) => {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA_VIVO[h % PALETA_VIVO.length];
};

/** Las tarjetas del perfil de fútbol (stat-profiles.ts). */
export const AMARILLA = '#facc15';
export const ROJA = '#ef4444';

/** Avatar de equipo con iniciales y degradado (Avatar de TournamentDetailClient). */
export const AvatarVivo: FC<{ nombre: string; tamano?: number; redondo?: boolean; color?: string }> = ({ nombre, tamano = 36, redondo, color }) => {
  const c = color ?? colorVivo(nombre);
  return (
    <span style={{ width: tamano, height: tamano, borderRadius: redondo ? '50%' : tamano <= 28 ? 8 : tamano >= 48 ? 12 : 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: tamano * 0.36, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${c} 0%, ${sombra(c, -18)} 100%)`, lineHeight: 1 }}>
      {iniciales(nombre)}
    </span>
  );
};

/** La tarjeta como glifo: un rectángulo de color (CardGlyph). */
export const Tarjeta: FC<{ color: string; tamano?: number }> = ({ color, tamano = 13 }) => (
  <span style={{ display: 'inline-block', width: tamano * 0.72, height: tamano, borderRadius: 2, background: color, boxShadow: '0 1px 2px rgba(0,0,0,0.35)', flexShrink: 0 }} />
);

/** El ícono de un evento en la lista: ⚽ o la tarjeta (EventGlyph). */
export const GlifoEvento: FC<{ tipo: TipoEvento }> = ({ tipo }) =>
  tipo === 'gol' ? <span style={{ fontSize: 11 }}>⚽</span> : <Tarjeta color={tipo === 'amarilla' ? AMARILLA : ROJA} tamano={12} />;

// --- El tablero ---------------------------------------------------------------------------------------------------

export type Periodo = 'primero' | 'descanso' | 'segundo';
export type BotonTablero = 'gol-local' | 'gol-visitante' | 'amarilla-local' | 'amarilla-visitante' | 'roja-local' | 'roja-visitante' | 'medio' | 'segundo' | 'ver' | 'finalizar';

export type PropsTablero = {
  p: Partido;
  fase: string;
  periodo: Periodo;
  minuto: number;
  marcador: [number, number];
  /** Los eventos que ya se ven en las listas de cada lado. */
  eventos?: Evento[];
  /** El ratón encima de un botón (0 → 1) y el botón apretado. */
  hover?: { boton: BotonTablero; t: number };
  apretar?: { boton: BotonTablero; t: number };
  /** Resalta una fila de eventos (por su jugador) o el marcador (0 → 1). */
  resalteEvento?: { jugador: string; t: number };
  resalteMarcador?: number;
  /** El punto rojo de «EN VIVO» late (fotograma del video). */
  f?: number;
  /** Para la «foto» del 3D: los números del marcador no se dibujan (pero ocupan su lugar). */
  sinNumeros?: boolean;
};

const DE = (b: BotonTablero, x?: { boton: BotonTablero; t: number }) => (x?.boton === b ? x.t : 0);

/** Un lado del tablero (TeamLiveSide). */
const Lado: FC<{ nombre: string; derecha: boolean; eventos: Evento[]; lado: 'local' | 'visitante'; puedeQuitar: boolean; hover?: PropsTablero['hover']; apretar?: PropsTablero['apretar']; resalteEvento?: PropsTablero['resalteEvento'] }> = ({ nombre, derecha, eventos, lado, puedeQuitar, hover, apretar, resalteEvento }) => {
  const tarjetaBtn = (b: BotonTablero, color: string) => {
    const h = DE(b, hover);
    return (
      <span data-boton={b} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: `rgba(255,255,255,${0.06 + 0.14 * h})`, border: `1px solid rgba(255,255,255,${0.16 + 0.3 * h})`, boxSizing: 'border-box', transform: apretado(DE(b, apretar)) }}>
        <Tarjeta color={color} />
      </span>
    );
  };
  const gol = `gol-${lado}` as BotonTablero;
  const hGol = DE(gol, hover);
  return (
    <div data-lado={lado} style={{ display: 'flex', flexDirection: 'column', alignItems: derecha ? 'flex-end' : 'flex-start', gap: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: derecha ? 'row-reverse' : 'row', maxWidth: '100%' }}>
        <div data-avatar={lado} style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))' }}>
          <AvatarVivo nombre={nombre} tamano={48} />
        </div>
        <div style={{ minWidth: 0, textAlign: derecha ? 'right' : 'left' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{nombre}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 500 }}>{lado === 'local' ? 'Local' : 'Visitante'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: derecha ? 'row-reverse' : 'row' }}>
        <span data-boton={gol} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, color: '#fff', fontSize: 12.5, fontWeight: 700, boxShadow: `0 6px 14px rgba(2,132,199,0.32), 0 0 0 ${3 * hGol}px rgba(125,211,252,${0.55 * hGol})`, letterSpacing: '-0.005em', lineHeight: '18px', transform: apretado(DE(gol, apretar)), boxSizing: 'border-box' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>+</span>
          Anotar gol
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1, opacity: puedeQuitar ? 1 : 0.35, boxSizing: 'border-box' }}>−</span>
        {tarjetaBtn(`amarilla-${lado}` as BotonTablero, AMARILLA)}
        {tarjetaBtn(`roja-${lado}` as BotonTablero, ROJA)}
      </div>
      {eventos.length > 0 && (
        <div data-eventos={lado} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: derecha ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
          {[...eventos]
            .sort((a, b) => a.minuto - b.minuto)
            .map((e) => {
              const r = resalteEvento?.jugador === e.jugador ? resalteEvento.t : 0;
              return (
                <div key={e.jugador + e.minuto} data-evento={e.jugador} style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: derecha ? 'row-reverse' : 'row', fontSize: 12, color: 'rgba(255,255,255,0.82)', maxWidth: '100%', borderRadius: 6, background: r > 0 ? `rgba(125,211,252,${0.22 * r})` : undefined, boxShadow: r > 0 ? `0 0 0 ${4 * r}px rgba(125,211,252,${0.22 * r})` : undefined }}>
                  <GlifoEvento tipo={e.tipo} />
                  <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{e.jugador}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{`${e.minuto}'`}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

/** El tablero en vivo (LiveMatchCard), del ancho de la columna izquierda del Resumen (868 px). */
export const TableroEnVivo: FC<PropsTablero & { style?: CSSProperties }> = ({ p, fase, periodo, minuto, marcador, eventos = [], hover, apretar, resalteEvento, resalteMarcador = 0, f = 0, sinNumeros, style }) => {
  const descanso = periodo === 'descanso';
  const latido = 0.65 + 0.35 * Math.cos((f / 42) * Math.PI * 2);
  const pie = (b: BotonTablero, base: CSSProperties, children: ReactNode) => {
    const h = DE(b, hover);
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 12.5, lineHeight: '18px', boxSizing: 'border-box', transform: apretado(DE(b, apretar)), boxShadow: h > 0 ? `0 0 0 ${3 * h}px rgba(255,255,255,${0.35 * h})` : undefined, ...base }}>{children}</span>;
  };
  return (
    <div data-tablero style={{ position: 'relative', width: DETALLE.izquierda.ancho, borderRadius: 18, overflow: 'hidden', color: '#fff', background: 'linear-gradient(160deg, #0a1f33 0%, #0c3f63 55%, #0e5a86 100%)', boxShadow: '0 18px 48px rgba(2, 132, 199, 0.28), 0 0 0 1px rgba(255,255,255,0.04) inset', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 100% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(80% 80% at 0% 100%, rgba(2,132,199,0.22), transparent 60%)' }} />
      {/* Cabecera */}
      <div style={{ position: 'relative', padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {descanso ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.18)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.32)', fontWeight: 700, fontSize: 11, lineHeight: '16.5px' }}>
              <Pause size={11} fill="currentColor" />
              MEDIO TIEMPO
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.18)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.32)', fontWeight: 700, fontSize: 11, lineHeight: '16.5px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', opacity: latido }} />
              EN VIVO
            </span>
          )}
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.74)', fontWeight: 500 }}>{fase}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            <MapPin size={11} />
            {p.sede}
          </span>
        </div>
        {descanso ? (
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.08em', color: '#fcd34d', lineHeight: '33px' }}>DESCANSO</div>
        ) : (
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: '#fff', lineHeight: '33px' }}>{`${minuto}'`}</div>
        )}
      </div>
      {/* Marcador */}
      <div style={{ position: 'relative', padding: '24px 22px 20px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 18 }}>
        <Lado nombre={p.local} derecha={false} lado="local" eventos={eventos.filter((e) => e.lado === 'local')} puedeQuitar={marcador[0] > 0} hover={hover} apretar={apretar} resalteEvento={resalteEvento} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 700 }}>Marcador</div>
          <div data-marcador style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1, transform: `scale(${1 + 0.12 * resalteMarcador})`, textShadow: resalteMarcador > 0 ? `0 0 ${24 * resalteMarcador}px rgba(125,211,252,0.9)` : undefined, visibility: sinNumeros ? 'hidden' : undefined }}>
            <span>{marcador[0]}</span>
            <span style={{ color: 'rgba(255,255,255,0.32)', fontWeight: 600, fontSize: 30 }}>–</span>
            <span>{marcador[1]}</span>
          </div>
        </div>
        <Lado nombre={p.visitante} derecha lado="visitante" eventos={eventos.filter((e) => e.lado === 'visitante')} puedeQuitar={marcador[1] > 0} hover={hover} apretar={apretar} resalteEvento={resalteEvento} />
      </div>
      {/* Pie */}
      <div style={{ position: 'relative', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <AlertCircle size={12} />
          Usa <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, margin: '0 2px' }}>+ Anotar gol</strong> o <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, margin: '0 2px' }}>−</strong> para ajustar el marcador
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {descanso
            ? pie('segundo', { background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.45)', color: '#86efac', fontWeight: 700 }, (
                <>
                  <Play size={13} fill="currentColor" />
                  Empezar 2º tiempo
                </>
              ))
            : periodo === 'primero'
              ? pie('medio', { background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }, (
                  <>
                    <Pause size={13} fill="currentColor" />
                    Medio tiempo
                  </>
                ))
              : null}
          {pie('ver', { background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }, (
            <>
              <Calendar size={13} />
              Ver calendario
            </>
          ))}
          {pie('finalizar', { padding: '7px 13px', background: '#fff', border: '1px solid #fff', color: '#1f1929', fontWeight: 700 }, (
            <>
              <CheckCircle2 size={13} />
              Finalizar partido
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Elegir jugador (PlayerPickerModal) ------------------------------------------------------------------------------

/** Las preguntas y verbos del perfil de fútbol (stat-profiles.ts). */
export const PREGUNTA: Record<TipoEvento, { pregunta: string; verbo: string }> = {
  gol: { pregunta: '¿Quién anotó?', verbo: 'Anotar gol de' },
  amarilla: { pregunta: 'Tarjeta amarilla a…', verbo: 'Amonestar a' },
  roja: { pregunta: 'Tarjeta roja a…', verbo: 'Expulsar a' },
};

export type PropsSelector = {
  /** Abre (0 → 1). */
  t: number;
  f: number;
  tipo: TipoEvento;
  equipo: string;
  jugadores: Jugador[];
  /** Lo escrito en el buscador. Filtra por nombre o número, como la app. */
  consulta: string;
  minuto: string;
  foco?: 'buscar' | 'minuto' | null;
  resalteMinuto?: number;
  /** La fila (por número de jugador) bajo el ratón y la que se aprieta. */
  hoverFila?: { numero: number; t: number };
  apretarFila?: { numero: number; t: number };
};

/** Filtra como la app: por nombre o por número. */
export const filtrar = (jugadores: Jugador[], consulta: string) => {
  const q = consulta.trim().toLowerCase();
  return q ? jugadores.filter((j) => j.nombre.toLowerCase().includes(q) || String(j.numero).includes(q)) : jugadores;
};

/** Alturas del selector (medidas): cabecera, buscador y cada fila. */
export const SELECTOR = { ancho: 420, cabecera: 70, buscador: 61, fila: 57, alto: (filas: number, manual: boolean) => 70 + 61 + 6 + filas * 57 + (manual ? 4 + 40 : 0) + 10 };

/** Rectángulo del selector en la pantalla (la app lo centra; con muchos jugadores llega al 82 % del alto). */
export const cajaSelector = (filas: number, manual: boolean) => {
  const alto = Math.min(SELECTOR.alto(filas, manual), PANTALLA.alto * 0.82);
  return { x: (PANTALLA.ancho - SELECTOR.ancho) / 2, y: (PANTALLA.alto - alto) / 2, ancho: SELECTOR.ancho, alto };
};

/** Centro de la fila `i` de la lista y del campo de minuto. */
export const filaSelector = (i: number, filas: number, manual: boolean): Punto => {
  const c = cajaSelector(filas, manual);
  return { x: c.x + SELECTOR.ancho / 2, y: c.y + SELECTOR.cabecera + SELECTOR.buscador + 6 + i * SELECTOR.fila + SELECTOR.fila / 2 };
};
export const minutoSelector = (filas: number, manual: boolean): Punto => {
  const c = cajaSelector(filas, manual);
  return { x: c.x + SELECTOR.ancho - 18 - 28, y: c.y + SELECTOR.cabecera + SELECTOR.buscador / 2 };
};

export const SelectorJugador: FC<PropsSelector> = ({ t, f, tipo, equipo, jugadores, consulta, minuto, foco = null, resalteMinuto = 0, hoverFila, apretarFila }) => {
  if (t <= 0) return null;
  const lista = filtrar(jugadores, consulta);
  const manual = consulta.trim();
  const conManual = manual.length > 1 && !lista.some((j) => j.nombre.toLowerCase() === manual.toLowerCase());
  const caja = cajaSelector(lista.length, conManual);
  const { pregunta, verbo } = PREGUNTA[tipo];
  const campo: CSSProperties = { padding: '9px 10px', borderRadius: 9, border: '1px solid #e7e3ee', fontSize: 13, color: '#1f1929', background: '#fff', boxSizing: 'border-box', lineHeight: '17px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 120, background: 'rgba(15,23,42,0.62)', opacity: Math.min(1, t * 1.6) }}>
      <div style={{ position: 'absolute', left: caja.x, top: caja.y, width: SELECTOR.ancho, height: caja.alto, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 70px rgba(15,23,42,0.35)', transform: `scale(${0.96 + 0.04 * t}) translateY(${(1 - t) * 10}px)`, boxSizing: 'border-box' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #ececf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, height: SELECTOR.cabecera, boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#8b8696', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', lineHeight: '16.5px' }}>{pregunta}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1f1929', lineHeight: '22.5px' }}>{equipo}</div>
          </div>
          <span style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #ececf3', background: '#fafafb', display: 'grid', placeItems: 'center', color: '#555064', boxSizing: 'border-box' }}>
            <X size={15} />
          </span>
        </div>
        <div style={{ padding: '12px 18px', display: 'flex', gap: 8, borderBottom: '1px solid #f1eef6', height: SELECTOR.buscador, boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11.5, color: '#9b96a6' }} />
            <div style={{ ...campo, paddingLeft: 32, borderColor: foco === 'buscar' ? '#c4b5fd' : '#e7e3ee' }}>
              {consulta || (foco !== 'buscar' && <span style={{ color: '#9b96a6' }}>Buscar o escribir nombre…</span>)}
              {foco === 'buscar' && <Cursor f={f} alto={16} color="#1f1929" />}
              {foco === 'buscar' && !consulta && <span style={{ color: '#9b96a6' }}>Buscar o escribir nombre…</span>}
            </div>
          </div>
          <div style={{ ...campo, width: 56, justifyContent: 'center', boxShadow: resalteMinuto > 0 ? `0 0 0 ${3 * resalteMinuto}px rgba(124,58,237,${0.35 * resalteMinuto})` : undefined, borderColor: resalteMinuto > 0.3 ? '#a78bfa' : '#e7e3ee', fontWeight: resalteMinuto > 0.3 ? 700 : 400 }}>
            {minuto || <span style={{ color: '#9b96a6' }}>min</span>}
          </div>
        </div>
        <div style={{ padding: '6px 10px 10px', overflow: 'hidden' }}>
          {lista.map((j) => {
            const h = hoverFila?.numero === j.numero ? hoverFila.t : 0;
            return (
              <div key={j.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderRadius: 10, background: h > 0 ? `rgba(246,244,251,${h})` : 'transparent', boxSizing: 'border-box', height: SELECTOR.fila, transform: apretado(apretarFila?.numero === j.numero ? apretarFila.t : 0) }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: '#efeaf8', color: '#7c3aed', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{j.numero}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#1f1929', whiteSpace: 'nowrap', lineHeight: '20px' }}>{j.nombre}</span>
                  {j.posicion && <span style={{ display: 'block', fontSize: 11.5, color: '#8b8696', lineHeight: '17px' }}>{j.posicion}</span>}
                </span>
              </div>
            );
          })}
          {conManual && (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginTop: 4, borderRadius: 10, border: '1px dashed #d9d4e6', background: '#fafafb', color: '#5b5470', fontSize: 13, fontWeight: 600, boxSizing: 'border-box', height: 40, whiteSpace: 'nowrap' }}>
              <UserPlus size={15} />
              {verbo} “{manual}”
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- El Resumen con el partido en vivo ------------------------------------------------------------------------------

/** Donde queda el tablero en la pantalla (arriba de la columna izquierda del Resumen). */
export const TABLERO = { x: DETALLE.izquierda.x, y: DETALLE.cuerpo, ancho: DETALLE.izquierda.ancho };

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Tarjeta de «Próximos partidos» (UpcomingCard). */
export const TarjetaProximo: FC<{ p: Partido; fase: string; grupo?: string }> = ({ p, fase, grupo }) => {
  const equipo = (nombre: string, rol: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center', minWidth: 0 }}>
      <AvatarVivo nombre={nombre} tamano={44} redondo />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1d2230', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{nombre}</div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: '#8b93a4' }}>{rol}</div>
    </div>
  );
  return (
    <div style={{ background: '#fff', border: '1px solid #e9ebf1', borderRadius: 16, overflow: 'hidden', boxShadow: '0 14px 34px -28px rgba(20,22,34,.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f4f4f8', borderBottom: '1px solid #f0f1f6', fontSize: 11.5, fontWeight: 600, color: '#515a6e' }}>
        <Clock size={13} color="#8b93a4" />
        <span style={{ color: '#1d2230', fontWeight: 700 }}>{p.hora}</span>
        <span style={{ color: '#8b93a4', opacity: 0.5 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600, color: '#8b93a4', whiteSpace: 'nowrap' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: colorVivo(grupo ?? fase) }} />
          {grupo && <span style={{ color: '#1d2230', fontWeight: 700 }}>{grupo}</span>}
          {grupo && <span style={{ opacity: 0.5 }}>·</span>}
          <span>{fase}</span>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: '#4f46e5', background: '#eef0ff', whiteSpace: 'nowrap' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4f46e5' }} />
          Programado
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14, padding: 18 }}>
        {equipo(p.local, 'Local')}
        <span style={{ fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace", fontSize: 13, fontWeight: 700, color: '#8b93a4', letterSpacing: '.08em' }}>VS</span>
        {equipo(p.visitante, 'Visitante')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderTop: '1px solid #f0f1f6', fontSize: 12.5, fontWeight: 500, color: '#1d2230' }}>
        <MapPin size={14} color="#8b93a4" />
        {p.sede}
      </div>
    </div>
  );
};

/**
 * «Próximos partidos» agrupados por día (el Resumen muestra 6). `columnas` = tarjetas por fila (la página pública de
 * escritorio usa 4) y `sinCalendario` quita «Ver calendario» (que la página pública no tiene).
 */
export const ProximosPartidos: FC<{ partidos: Partido[]; fase: string; grupoDe?: (equipo: string) => string | undefined; columnas?: number; sinCalendario?: boolean; titulo?: number }> = ({ partidos, fase, grupoDe, columnas = 2, sinCalendario, titulo = 15 }) => {
  const dias = [...new Set(partidos.map((p) => p.dia))];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: titulo, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em' }}>Próximos partidos</div>
          <p style={{ margin: '2px 0 0', fontSize: titulo === 15 ? 12.5 : 13, color: '#7a7388' }}>Los siguientes encuentros programados.</p>
        </div>
        {!sinCalendario && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#3a3344' }}>
            Ver calendario <ArrowRight size={13} />
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {dias.map((dia) => {
          const delDia = partidos.filter((p) => p.dia === dia);
          const fecha = new Date(2026, 10, dia);
          const semana = SEMANA[fecha.getDay()];
          return (
            <div key={dia}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid #e9ebf1', boxShadow: '0 1px 2px rgba(20,22,34,.05)', lineHeight: 1, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#4f46e5' }}>{MESES[10].toUpperCase()}</span>
                  <span style={{ fontSize: 19, fontWeight: 800, color: '#1d2230', letterSpacing: '-.02em', marginTop: 1 }}>{dia}</span>
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1d2230', letterSpacing: '-.01em', lineHeight: 1 }}>{semana[0].toUpperCase() + semana.slice(1)}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#8b93a4', lineHeight: 1 }}>{dia} de noviembre</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#7a7388', padding: '4px 10px', borderRadius: 999, background: '#fff', border: '1px solid #e9ebf1' }}>
                  {delDia.length} {delDia.length === 1 ? 'partido' : 'partidos'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`, gap: 12 }}>
                {delDia.map((p) => (
                  <TarjetaProximo key={p.id} p={p} fase={fase} grupo={grupoDe?.(p.local)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AccionRapida: FC<{ icon: typeof UserPlus; label: string }> = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: LILA.suave, border: '1px solid #f1eef6', borderRadius: 10 }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${LILA.borde}`, flexShrink: 0, boxSizing: 'border-box' }}>
      <Icon size={14} />
    </div>
    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1f1929' }}>{label}</span>
    <ArrowRight size={14} color={LILA.sutil} />
  </div>
);

export type PropsResumenVivo = {
  /** El tablero (o nada, si no hay partido en vivo). */
  tablero?: ReactNode;
  proximos: Partido[];
  fase: string;
  grupoDe?: (equipo: string) => string | undefined;
  /** Equipos recientes: nombre del equipo y de su coach. */
  recientes: { equipo: string; coach: string }[];
  /** Arriba de la columna derecha (p. ej. el aviso «Listo para publicar» de un borrador, publicar.tsx). */
  aviso?: ReactNode;
  /** Torneo en borrador: sin la última acción rápida (no se muestra «Compartir torneo»). */
  borrador?: boolean;
};

/** La pestaña Resumen de un torneo publicado y en juego. */
export const ResumenEnVivo: FC<PropsResumenVivo> = ({ tablero, proximos, fase, grupoDe, recientes, aviso, borrador }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
      {tablero}
      <ProximosPartidos partidos={proximos} fase={fase} grupoDe={grupoDe} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {aviso}
      <div style={{ ...TARJETA_DET, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f1eef6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: LILA.texto }}>Equipos recientes</div>
          <ArrowRight size={14} color={LILA.oscuro} />
        </div>
        {recientes.map((r, i) => (
          <div key={r.equipo} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderTop: i === 0 ? 'none' : '1px solid #f1eef6' }}>
            <AvatarVivo nombre={r.equipo} tamano={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#14101a' }}>{r.equipo}</div>
              <div style={{ fontSize: 11.5, color: '#7a7388' }}>{r.coach}</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, color: '#047857', background: '#d1fae5' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              Aceptado
            </span>
          </div>
        ))}
      </div>
      <div style={{ ...TARJETA_DET, padding: 16 }}>
        <div style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: LILA.texto }}>Acciones rápidas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AccionRapida icon={UserPlus} label="Invitar coach" />
          <AccionRapida icon={Layers} label="Crear nueva fase" />
          <AccionRapida icon={Calendar} label="Agendar partido" />
          {!borrador && <AccionRapida icon={ExternalLink} label="Ver torneo publicado" />}
        </div>
      </div>
    </div>
  </div>
);

/** Los partidos programados después de uno (para «Próximos partidos»; la app muestra 6). */
export const proximosDespuesDe = (p: Partido, lista: Partido[] = PARTIDOS_COPA) => lista.filter((x) => x.dia > p.dia || (x.dia === p.dia && x.hora > p.hora)).slice(0, 6);
