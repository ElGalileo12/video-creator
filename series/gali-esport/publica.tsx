// La página PÚBLICA del torneo en un celular (lo que ven los papás), fiel a la app con SU estilo (azul de marca, tono
// 240, letra Inter y números en JetBrains Mono). Código (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport/app/tournaments/[id]/
// - components/TourneyHero.tsx: «Torneos / nombre», «Compartir», título, fechas, equipos, «EN CURSO» y las cifras
//   «Avance», «Días restantes» y «En vivo». No se muestra «Exportar».
// - components/PhaseTabs.tsx: «Próximos partidos», «Calendario», «Fase de grupos», «Eliminatorias».
// - components/ScheduleTab.tsx: la tarjeta del partido en vivo (sin la pestaña de alineaciones).
// - components/MatchModal.tsx: el detalle del partido con «Goles» y la «Línea de tiempo».
// - components/League.tsx: la tabla del grupo (PJ, G, E, P, GF, GC, DG, PTS y resultados).
// - tournament.css: medidas de celular (≤ 640 px).
// Todo en puntos del celular (430 × 932); va dentro de `Celular`.
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { MapPin } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { Punto } from './computador';
import { AvatarVivo, GlifoEvento, ProximosPartidos } from './envivo';
import { COPA, mono } from './tema';
import { type Evento, FASE, type FilaTabla, grupoDe, type Partido, PARTIDOS_COPA } from './partidos';

export const { fontFamily: inter } = cargarInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] });

/** El celular grande de la página pública (iPhone de 430 × 932 puntos). */
export const PANTALLA_PUB = { ancho: 430, alto: 932 };

/** Azul de marca de la vista pública (--brand-*, tono 240). */
export const MARCA_PUB = {
  b50: 'oklch(0.972 0.014 240)',
  b100: 'oklch(0.935 0.04 240)',
  b500: 'oklch(0.62 0.18 240)',
  b600: 'oklch(0.55 0.20 240)',
  b700: 'oklch(0.48 0.19 240)',
  b800: 'oklch(0.40 0.16 240)',
};
const V = {
  bg: '#F6F8FB', surface: '#FFFFFF', sunken: '#FAFBFC', border: '#E5E9F0', borderStrong: '#D9DFE8', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
  greenText: '#047857', greenDot: '#10B981', redText: '#B91C1C', redBg: '#FEF2F2', redBorder: '#FECACA', redDot: '#EF4444', slate: '#F1F5F9',
};

const Icono: FC<{ d: string[]; tamano?: number; style?: CSSProperties }> = ({ d, tamano = 12, style }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d.map((x, i) => (
      <path key={i} d={x} />
    ))}
  </svg>
);
const CALENDARIO = ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'];
const PERSONAS = ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'];

// --- Encabezado y pestañas -----------------------------------------------------------------------------------------

export type CifrasPub = { jugados: number; total: number; diasRestantes: number; fase: string; enVivo: [string, string][] };

const StatPub: FC<{ kicker: string; value: string; sub?: string; progress?: number; amber?: boolean }> = ({ kicker, value, sub, progress, amber }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: amber ? '#fcd34d' : '#bae6fd', marginBottom: 4 }}>{kicker}</div>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05 }}>{value}</div>
    {progress != null ? (
      <div style={{ marginTop: 8 }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.16)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 999 }} />
        </div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>{sub}</div>}
      </div>
    ) : (
      sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>{sub}</div>
    )}
  </div>
);

/** El encabezado del torneo (TourneyHero) en celular. */
export const HeroPublico: FC<{ cifras: CifrasPub; f?: number }> = ({ cifras, f = 0 }) => {
  const avance = Math.round((cifras.jugados / cifras.total) * 100);
  return (
    <div style={{ position: 'relative', overflow: 'hidden', color: 'white', padding: '16px 14px 16px', background: `linear-gradient(135deg, ${MARCA_PUB.b800} 0%, ${MARCA_PUB.b600} 60%, ${MARCA_PUB.b500} 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,.1) 0%, transparent 50%)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: mono, minWidth: 0, overflow: 'hidden' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 6px', borderRadius: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', flexShrink: 0 }}>
            <Icono d={['M15 18l-6-6 6-6']} tamano={13} />
            Torneos
          </span>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{COPA.nombre}</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.015em', lineHeight: 1.1 }}>{COPA.nombre}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.78)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icono d={CALENDARIO} />7 Nov — 13 Dic
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icono d={PERSONAS} />8 equipos
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }} />
            <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>EN CURSO</span>
          </div>
        </div>
        <div style={{ alignSelf: 'stretch', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '18px 22px', display: 'grid', gridTemplateColumns: `repeat(${cifras.enVivo.length ? 3 : 2}, minmax(0, 1fr))`, gap: 14 }}>
          <StatPub kicker="Avance" value={`${avance}%`} sub={`${cifras.jugados}/${cifras.total} partidos`} progress={avance} />
          <StatPub kicker="Días restantes" value={String(cifras.diasRestantes)} sub={`Fase: ${cifras.fase}`} amber />
          {cifras.enVivo.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fca5a5', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5', opacity: 0.65 + 0.35 * Math.cos((f / 42) * Math.PI * 2), flexShrink: 0 }} />
                En vivo
              </div>
              {cifras.enVivo.map(([a, b]) => (
                <div key={a} style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                  {a}
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, margin: '0 5px' }}>vs</span>
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export type FasePub = 'proximos' | 'calendario' | 'grupos' | 'eliminatorias';
const FASES_PUB: { id: FasePub; nombre: string; icono: string[] }[] = [
  { id: 'proximos', nombre: 'Próximos partidos', icono: CALENDARIO },
  { id: 'calendario', nombre: 'Calendario', icono: [...CALENDARIO, 'M8 14h.01', 'M12 14h.01', 'M16 14h.01'] },
  { id: 'grupos', nombre: 'Fase de grupos', icono: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
  { id: 'eliminatorias', nombre: 'Eliminatorias', icono: ['M3 3H9V9H3', 'M3 15H9V21H3', 'M9 6H15', 'M9 18H15', 'M15 6V18', 'M15 12H21'] },
];

/** Las pestañas (PhaseTabs) como se ven en celular: subrayadas, con desplazamiento horizontal. */
export const PestanasPublicas: FC<{ activa: FasePub; desplazar?: number; apretar?: { id: FasePub; t: number } }> = ({ activa, desplazar = 0, apretar }) => (
  <div style={{ position: 'relative', background: MARCA_PUB.b800 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 50, padding: '0 32px 0 8px', borderBottom: '1px solid rgba(255,255,255,.12)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', transform: `translateX(${-desplazar}px)` }}>
        {FASES_PUB.map((x) => {
          const on = x.id === activa;
          const a = apretar?.id === x.id ? apretar.t : 0;
          return (
            <span key={x.id} style={{ padding: '0 16px 11px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? 'white' : 'rgba(255,255,255,.75)', boxShadow: on ? 'inset 0 -3px 0 0 rgba(255,255,255,.9)' : undefined, whiteSpace: 'nowrap', flexShrink: 0, opacity: 1 - 0.3 * a }}>
              <Icono d={x.icono} tamano={14} />
              {x.nombre}
            </span>
          );
        })}
      </div>
    </div>
    <div style={{ position: 'absolute', right: 0, top: 0, width: 52, height: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 14, paddingRight: 10, boxSizing: 'border-box', background: `linear-gradient(to right, transparent 0%, ${MARCA_PUB.b800} 52%)`, color: 'rgba(255,255,255,.75)', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>›</div>
  </div>
);

// --- El partido en vivo («Próximos partidos») ---------------------------------------------------------------------------

export type DatosVivo = { p: Partido; fase: string; minuto: number; marcador: [number, number]; eventos: Evento[] };

const LadoPub: FC<{ nombre: string; derecha: boolean; eventos: Evento[] }> = ({ nombre, derecha, eventos }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: derecha ? 'flex-end' : 'flex-start', gap: 12, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: derecha ? 'row-reverse' : 'row', maxWidth: '100%' }}>
      <div style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))' }}>
        <AvatarVivo nombre={nombre} tamano={48} />
      </div>
      <div style={{ minWidth: 0, textAlign: derecha ? 'right' : 'left' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 500 }}>{derecha ? 'Visitante' : 'Local'}</div>
      </div>
    </div>
    {eventos.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: derecha ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
        {[...eventos]
          .sort((a, b) => a.minuto - b.minuto)
          .map((e) => (
            <div key={e.jugador} style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: derecha ? 'row-reverse' : 'row', fontSize: 12, color: 'rgba(255,255,255,0.82)', maxWidth: '100%' }}>
              <GlifoEvento tipo={e.tipo} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{e.jugador}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{`${e.minuto}'`}</span>
            </div>
          ))}
      </div>
    )}
  </div>
);

/** La tarjeta del partido en vivo de la página pública (solo lectura; sin la pestaña de alineaciones). */
export const VivoPublico: FC<DatosVivo & { f?: number; resalte?: number }> = ({ p, fase, minuto, marcador, eventos, f = 0, resalte = 0 }) => (
  <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', color: '#fff', background: 'linear-gradient(160deg, #0a1f33 0%, #0c3f63 55%, #0e5a86 100%)', boxShadow: `0 18px 48px rgba(2, 132, 199, ${0.28 + 0.3 * resalte}), 0 0 0 ${3 * resalte}px rgba(125,211,252,${0.6 * resalte})` }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 100% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(80% 80% at 0% 100%, rgba(2,132,199,0.22), transparent 60%)' }} />
    <div style={{ position: 'relative', padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.16)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.18)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.32)', fontWeight: 700, fontSize: 11 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', opacity: 0.65 + 0.35 * Math.cos((f / 42) * Math.PI * 2) }} />
          EN VIVO
        </span>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.74)', fontWeight: 500 }}>{fase}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <MapPin size={11} />
          {p.sede}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: '#fff' }}>{`${minuto}'`}</div>
    </div>
    <div style={{ position: 'relative', padding: '16px 14px 14px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
      <LadoPub nombre={p.local} derecha={false} eventos={eventos.filter((e) => e.lado === 'local')} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 700 }}>Marcador</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
          <span>{marcador[0]}</span>
          <span style={{ color: 'rgba(255,255,255,0.32)', fontWeight: 600, fontSize: 30 }}>–</span>
          <span>{marcador[1]}</span>
        </div>
      </div>
      <LadoPub nombre={p.visitante} derecha eventos={eventos.filter((e) => e.lado === 'visitante')} />
    </div>
  </div>
);

/** La pestaña «Próximos partidos» con el partido en vivo arriba. */
export const ProximosPublico: FC<{ vivo: DatosVivo; f?: number; resalteVivo?: number }> = ({ vivo, f, resalteVivo }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <VivoPublico {...vivo} f={f} resalte={resalteVivo} />
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#14101a', letterSpacing: '-0.01em' }}>Próximos partidos</div>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#7a7388' }}>Los siguientes encuentros programados.</p>
      </div>
    </div>
  </div>
);

// --- El detalle del partido (MatchModal) ---------------------------------------------------------------------------------

const LogoPub: FC<{ nombre: string; tamano: number }> = ({ nombre, tamano }) => (
  <div style={{ width: tamano, height: tamano, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: tamano * 0.38, fontWeight: 700, flexShrink: 0 }}>{nombre.slice(0, 2).toUpperCase()}</div>
);

const Insignia: FC<{ tipo: Evento['tipo'] }> = ({ tipo }) => {
  const base: CSSProperties = { width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 };
  if (tipo === 'gol') return <span style={{ ...base, background: '#fff', boxShadow: `inset 0 0 0 1.5px ${V.borderStrong}`, fontSize: 12 }}>⚽</span>;
  const amarilla = tipo === 'amarilla';
  return (
    <span style={{ ...base, background: amarilla ? '#FEF9E7' : '#FEF2F2', boxShadow: `inset 0 0 0 1.5px ${amarilla ? '#FDE68A' : '#FECACA'}` }}>
      <span style={{ display: 'inline-block', width: 11, height: 15, borderRadius: 2, background: amarilla ? '#F5C518' : '#E5484D' }} />
    </span>
  );
};

const Etiqueta: FC<{ children: string; primero?: boolean }> = ({ children, primero }) => (
  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: V.subtle, margin: primero ? '4px 0 12px' : '18px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
    {children}
    <span style={{ flex: 1, borderTop: `1px solid ${V.border}` }} />
  </div>
);

/** La línea de tiempo (MatchTimeline): local a la izquierda, visitante a la derecha, el minuto al centro. */
export const LineaDeTiempo: FC<{ eventos: Evento[]; visibles?: number }> = ({ eventos, visibles = eventos.length }) => {
  let h = 0;
  let a = 0;
  return (
    <div style={{ position: 'relative', padding: '4px 0' }}>
      <div style={{ position: 'absolute', left: '50%', top: 8, bottom: 8, width: 2, background: V.border, transform: 'translateX(-50%)' }} />
      {eventos.map((e, i) => {
        const gol = e.tipo === 'gol';
        if (gol) e.lado === 'local' ? h++ : a++;
        const t = Math.max(0, Math.min(1, visibles - i));
        const local = e.lado === 'local';
        return (
          <div key={e.jugador} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 38px 1fr', alignItems: 'center', minHeight: 40, padding: '4px 0', opacity: t, transform: `translateY(${(1 - t) * 10}px)` }}>
            <div style={{ gridColumn: local ? 1 : 3, gridRow: 1, display: 'flex', justifyContent: local ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 10px', border: `1px solid ${gol ? '#CBE9D8' : V.border}`, borderRadius: 10, background: gol ? '#FBFDFB' : 'white', boxShadow: '0 1px 2px rgba(15,23,42,.03)', flexDirection: local ? 'row-reverse' : 'row', textAlign: local ? 'right' : 'left' }}>
                <Insignia tipo={e.tipo} />
                <span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{e.jugador}</span>
                  {gol && <span style={{ fontFamily: mono, fontWeight: 800, fontSize: 13, color: V.greenText, whiteSpace: 'nowrap' }}> {`${h}–${a}`}</span>}
                </span>
              </div>
            </div>
            <div style={{ gridColumn: 2, gridRow: 1, justifySelf: 'center', zIndex: 2 }}>
              <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: gol ? '#fff' : V.muted, background: gol ? V.text : 'white', border: `1px solid ${gol ? V.text : V.border}`, borderRadius: 999, padding: '3px 0', width: 40, textAlign: 'center' }}>{`${e.minuto}'`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** El detalle del partido (MatchModal) en celular: marcador «estadio», «Goles» y «Línea de tiempo». */
export const DetallePartido: FC<DatosVivo & { t: number; f?: number; visibles?: number; desplazar?: number }> = ({ p, fase, minuto, marcador, eventos, t, f = 0, visibles, desplazar = 0 }) => {
  if (t <= 0) return null;
  const fecha = new Date(2026, 10, p.dia).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const goles = (lado: Evento['lado']) => eventos.filter((e) => e.tipo === 'gol' && e.lado === lado);
  const columna = (lado: Evento['lado'], nombre: string, borde: boolean) => (
    <div style={{ padding: '14px 16px', borderTop: borde ? `1px solid ${V.border}` : undefined }}>
      <div style={{ margin: '0 0 9px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: V.subtle, fontWeight: 700 }}>Goles · {nombre}</div>
      {goles(lado).length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '3px 0', color: V.subtle, fontWeight: 500, fontStyle: 'italic' }}>Sin goles</div>
      ) : (
        goles(lado).map((g) => (
          <div key={g.jugador} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, padding: '3px 0' }}>
            <span>⚽</span>
            {g.jugador}
            <span style={{ fontFamily: mono, fontSize: 11, color: V.muted, fontWeight: 600 }}>{`${g.minuto}'`}</span>
          </div>
        ))
      )}
    </div>
  );
  const equipo = (nombre: string, rol: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center', minWidth: 0 }}>
      <LogoPub nombre={nombre} tamano={56} />
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.2 }}>{nombre}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: V.subtle }}>{rol}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(15,23,42,.6)', opacity: Math.min(1, t * 2), display: 'grid', placeItems: 'center' }}>
      <div style={{ width: PANTALLA_PUB.ancho - 32, maxHeight: PANTALLA_PUB.alto - 64, overflow: 'hidden', background: 'white', borderRadius: 16, boxShadow: '0 30px 80px rgba(15,23,42,0.25)', transform: `translateY(${(1 - t) * 20}px) scale(${0.96 + 0.04 * t})`, color: V.text }}>
        <div style={{ transform: `translateY(${-desplazar}px)` }}>
          <div style={{ position: 'relative', overflow: 'hidden', padding: '16px 16px 18px', borderBottom: `1px solid ${V.border}`, background: `radial-gradient(120% 80% at 50% -20%, oklch(0.55 0.20 240 / .07), transparent 60%), linear-gradient(180deg,#FBFCFE,#F4F7FB)` }}>
            <div style={{ position: 'absolute', left: '50%', top: 54, transform: 'translateX(-50%)', width: 120, height: 120, border: `1.5px solid ${MARCA_PUB.b100}`, borderRadius: '50%', opacity: 0.5 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: `1.5px solid ${MARCA_PUB.b100}`, opacity: 0.45 }} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: V.muted }}>{fase}</div>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: V.slate, display: 'grid', placeItems: 'center', color: V.muted, fontSize: 14 }}>✕</span>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
              {equipo(p.local, 'Local')}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, minWidth: 140 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 11px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, color: V.redText, background: V.redBg, border: `1px solid ${V.redBorder}` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: V.redDot, opacity: 0.5 + 0.5 * Math.cos((f / 42) * Math.PI * 2) }} />
                  {`EN VIVO · ${minuto}'`}
                </span>
                <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 36, lineHeight: 1, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: marcador[0] >= marcador[1] ? V.text : V.subtle }}>{marcador[0]}</span>
                  <span style={{ color: V.subtle, fontSize: 28 }}>–</span>
                  <span style={{ color: marcador[1] >= marcador[0] ? V.text : V.subtle }}>{marcador[1]}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: V.muted, textAlign: 'center' }}>{fecha}</span>
              </div>
              {equipo(p.visitante, 'Visitante')}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: `1px solid ${V.border}`, padding: '0 14px', gap: 4 }}>
            <span style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: MARCA_PUB.b700, borderBottom: `2px solid ${MARCA_PUB.b600}`, marginBottom: -1 }}>Resumen</span>
          </div>
          <div style={{ padding: '14px 16px 20px', fontFamily: inter }}>
            <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${V.border}`, borderRadius: 12, background: V.sunken, marginBottom: 18, overflow: 'hidden' }}>
              <div style={{ flex: 1, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: V.subtle, fontWeight: 600, marginBottom: 4 }}>Estadio</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.sede}</div>
              </div>
            </div>
            <Etiqueta primero>Goles</Etiqueta>
            <div style={{ border: `1px solid ${V.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
              {columna('local', p.local, false)}
              {columna('visitante', p.visitante, true)}
            </div>
            <Etiqueta>Línea de tiempo</Etiqueta>
            <LineaDeTiempo eventos={eventos} visibles={visibles} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- La tabla del grupo (League) ------------------------------------------------------------------------------------------

/** Tabla pública de un grupo, con su franja de clasificación y la tendencia de cada equipo. */
export const TablaPublica: FC<{ grupo: string; filas: FilaTabla[]; tendencia?: Record<string, 'up' | 'down' | 'flat'>; resalte?: { equipo: string; t: number } }> = ({ grupo, filas, tendencia = {}, resalte }) => {
  const jornadas = filas.reduce((m, r) => Math.max(m, r.pj), 0);
  const th: CSSProperties = { fontSize: 11, fontWeight: 500, color: V.muted, textAlign: 'center', padding: '12px 10px', borderBottom: `1px solid ${V.border}`, background: V.sunken, whiteSpace: 'nowrap' };
  const td: CSSProperties = { padding: '12px 10px', borderBottom: `1px solid ${V.border}`, fontSize: 13, textAlign: 'center', color: V.text, whiteSpace: 'nowrap' };
  const punto = (r: 'W' | 'D' | 'L', k: number) => (
    <span key={k} style={{ width: 18, height: 18, borderRadius: '50%', color: 'white', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center', background: r === 'W' ? V.greenDot : r === 'D' ? V.subtle : V.redDot }}>{r}</span>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 8, padding: '0 4px', fontSize: 10, color: V.subtle, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 12, borderRadius: 2, background: V.greenDot }} />
          Clasifican · top 2 de cada grupo
        </span>
      </div>
      <div style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>{grupo}</div>
          <div style={{ fontSize: 13, color: V.muted, marginTop: -3 }}>
            {filas.length} equipos · {jornadas} {jornadas === 1 ? 'jornada' : 'jornadas'}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left', paddingLeft: 24, width: 36 }}>#</th>
              <th style={{ ...th, textAlign: 'left' }}>Equipo</th>
              {['PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'PTS'].map((c) => (
                <th key={c} style={th}>
                  {c}
                </th>
              ))}
              <th style={{ ...th, textAlign: 'left' }}>Resultados</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((r, i) => {
              const tend = tendencia[r.equipo] ?? 'flat';
              const res = resalte?.equipo === r.equipo ? resalte.t : 0;
              return (
                <tr key={r.equipo} style={{ background: res > 0 ? `rgba(224,231,255,${0.9 * res})` : undefined }}>
                  <td style={{ ...td, paddingLeft: 24, textAlign: 'left', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 3, height: 26, borderRadius: 2, background: i < 2 ? V.greenDot : V.subtle, opacity: i < 2 ? 1 : 0.4 }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: mono, fontWeight: 600, fontSize: 13 }}>
                      {i + 1}
                      {tend === 'up' && <span style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `5px solid ${V.greenDot}` }} />}
                      {tend === 'down' && <span style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `5px solid ${V.redDot}` }} />}
                      {tend === 'flat' && <span style={{ width: 7, height: 2, background: V.subtle, borderRadius: 1 }} />}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'left', fontWeight: 500 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <LogoPub nombre={r.equipo} tamano={26} />
                      {r.equipo}
                    </span>
                  </td>
                  <td style={td}>{r.pj}</td>
                  <td style={td}>{r.g}</td>
                  <td style={td}>{r.e}</td>
                  <td style={td}>{r.p}</td>
                  <td style={td}>{r.gf}</td>
                  <td style={td}>{r.gc}</td>
                  <td style={{ ...td, color: r.dg > 0 ? V.greenText : r.dg < 0 ? V.redText : V.muted, fontWeight: 500 }}>
                    {r.dg > 0 ? '+' : ''}
                    {r.dg}
                  </td>
                  <td style={{ ...td, fontWeight: 700 }}>{r.pts}</td>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>{r.forma.map(punto)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- La página completa ---------------------------------------------------------------------------------------------------

/** La página pública del torneo en el celular: encabezado, pestañas y el contenido de la pestaña activa. */
export const PaginaPublica: FC<{ cifras: CifrasPub; activa: FasePub; f?: number; desplazarPestanas?: number; scroll?: number; children: ReactNode }> = ({ cifras, activa, f, desplazarPestanas, scroll = 0, children }) => (
  <div style={{ position: 'absolute', inset: 0, background: V.bg, fontFamily: inter, color: V.text, fontSize: 14, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 54 - scroll }}>
      <HeroPublico cifras={cifras} f={f} />
      <PestanasPublicas activa={activa} desplazar={desplazarPestanas} />
      <div style={{ padding: '14px 12px' }}>{children}</div>
    </div>
    {/* La barra de Safari abajo */}
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, background: 'rgba(249,249,249,0.94)', borderTop: '0.5px solid rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'center', paddingTop: 10, boxSizing: 'border-box', zIndex: 30 }}>
      <div style={{ height: 44, width: 380, borderRadius: 14, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: '-apple-system, "SF Pro Text", Helvetica, sans-serif', fontSize: 16, color: '#111' }}>
        <svg width={11} height={14} viewBox="0 0 11 14">
          <rect x={0.5} y={6} width={10} height={7.5} rx={1.5} fill="#555" />
          <path d="M2.5 6V4a3 3 0 0 1 6 0v2" stroke="#555" strokeWidth={1.4} fill="none" />
        </svg>
        galiesport.com
      </div>
    </div>
  </div>
);


// --- La página pública en la computadora (desde `que-todos-lo-vean`) ---------------------------------------------------
// Medidas de escritorio de tournament.css: encabezado (padding 28px 32px 20px), pestañas en una píldora sobre azul oscuro
// y «Próximos partidos» en tarjetas de 4 por fila. Recién publicado: «PRÓXIMAMENTE», avance 0 % y «Días para arrancar».
// Va dentro de `Pantalla` (1440 × 1040). Solo se muestra «Compartir» (no «Exportar»).

/** Centro del botón «Compartir» del encabezado. */
export const COMPARTIR_ESC: Punto = { x: 1440 - 32 - 54, y: 28 + 15.5 };
/** Alto del encabezado y de la franja de pestañas (medidos). */
export const ESC_PUB = { hero: 212, pestanas: 74 };

const BotonHero: FC<{ hover?: number; apretar?: number; children: ReactNode }> = ({ hover = 0, apretar = 0, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: `rgba(255,255,255,${0.12 + 0.08 * hover})`, color: 'white', border: '1px solid rgba(255,255,255,.18)', transform: apretar > 0 ? `scale(${1 - apretar * 0.06})` : undefined, boxShadow: hover > 0 ? `0 0 0 ${4 * hover}px rgba(255,255,255,0.22)` : 'none' }}>{children}</span>
);

/** Encabezado (TourneyHero) de escritorio de un torneo recién publicado. */
export const HeroPublicoEscritorio: FC<{ hoverCompartir?: number; apretarCompartir?: number }> = ({ hoverCompartir = 0, apretarCompartir = 0 }) => (
  <div style={{ position: 'relative', overflow: 'hidden', color: 'white', padding: '28px 32px 20px', height: ESC_PUB.hero, boxSizing: 'border-box', background: `linear-gradient(135deg, ${MARCA_PUB.b800} 0%, ${MARCA_PUB.b600} 60%, ${MARCA_PUB.b500} 100%)` }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,.1) 0%, transparent 50%)' }} />
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: mono }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 6px', borderRadius: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)' }}>
          <Icono d={['M15 18l-6-6 6-6']} tamano={13} />
          Torneos
        </span>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ color: 'white' }}>{COPA.nombre}</span>
      </div>
      <BotonHero hover={hoverCompartir} apretar={apretarCompartir}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </BotonHero>
    </div>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.02em', lineHeight: 1.1 }}>{COPA.nombre}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icono d={CALENDARIO} />7 Nov — 13 Dic
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icono d={PERSONAS} />8 equipos
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }} />
          <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>PRÓXIMAMENTE</span>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, width: 380, boxSizing: 'border-box' }}>
        <StatPub kicker="Avance" value="0%" sub="0/12 partidos" progress={0} />
        <StatPub kicker="Días para arrancar" value={String(COPA.diasParaArrancar)} sub={`Fase: ${FASE}`} amber />
      </div>
    </div>
  </div>
);

/** Las pestañas (PhaseTabs) de escritorio: una píldora con las cuatro. `resalte` ilumina las que nombra la voz. */
export const PestanasEscritorio: FC<{ activa: FasePub; resalte?: Partial<Record<FasePub, number>> }> = ({ activa, resalte = {} }) => (
  <div style={{ background: MARCA_PUB.b800, padding: '0 32px', height: ESC_PUB.pestanas, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.08)', padding: 4, borderRadius: 999, border: '1px solid rgba(255,255,255,.12)' }}>
      {FASES_PUB.map((x) => {
        const on = x.id === activa;
        const r = resalte[x.id] ?? 0;
        return (
          <span key={x.id} style={{ padding: '8px 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: on ? 600 : 500, whiteSpace: 'nowrap', background: on ? 'white' : `rgba(255,255,255,${0.22 * r})`, color: on ? MARCA_PUB.b700 : `rgba(255,255,255,${0.75 + 0.25 * r})`, boxShadow: on ? `0 2px 8px rgba(0,0,0,.15)${r > 0 ? `, 0 0 0 ${4 * r}px rgba(125,211,252,0.7)` : ''}` : r > 0 ? `0 0 0 ${3 * r}px rgba(125,211,252,0.7)` : 'none', transform: r > 0 ? `scale(${1 + 0.06 * r})` : undefined }}>
            <Icono d={x.icono} tamano={14} />
            {x.nombre}
          </span>
        );
      })}
    </div>
  </div>
);

/** La página pública del torneo en la computadora, en «Próximos partidos». `scroll` baja el contenido. */
export const PaginaPublicaEscritorio: FC<{ resalte?: Partial<Record<FasePub, number>>; hoverCompartir?: number; apretarCompartir?: number; scroll?: number }> = ({ resalte, hoverCompartir, apretarCompartir, scroll = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: V.bg, fontFamily: inter, color: V.text, fontSize: 14, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll }}>
      <HeroPublicoEscritorio hoverCompartir={hoverCompartir} apretarCompartir={apretarCompartir} />
      <PestanasEscritorio activa="proximos" resalte={resalte} />
      <div style={{ padding: '24px 32px' }}>
        <ProximosPartidos partidos={PARTIDOS_COPA} fase={FASE} grupoDe={(e) => grupoDe(e)?.nombre} columnas={4} sinCalendario titulo={16} />
      </div>
    </div>
  </div>
);
