// WhatsApp, como lo usan los entrenadores y organizadores antes de Gali Esport: los globos de mensaje, las notas de voz,
// el chat del grupo «Copa Galileo 🏆» (de `torneo-whatsapp`), un chat de uno a uno y las burbujas en grande.
// También el aviso que manda Gali Esport al publicar un evento, con sus botones «Voy / No voy / Tal vez».
// Todo se dibuja en puntos del celular (390 × 844); va dentro de `Celular`.
import type { CSSProperties, FC } from 'react';
import type { PuntoCel } from './celular';
import { Isotipo } from './marca';
import { MARINO, SISTEMA } from './tema';

export type Mensaje =
  | { tipo: 'texto'; de?: string; color?: string; texto: string; hora: string; mio?: boolean; leido?: boolean }
  | { tipo: 'audio'; de: string; color: string; dur: string; hora: string }
  | { tipo: 'sticker'; emoji: string; hora: string }
  | { tipo: 'sistema'; texto: string }
  /**
   * Una foto (desde `que-todos-lo-vean`): `Imagen` la dibuja en 260 × `alto`. `borrosa` = sin descargar (borrosa y con el
   * botón de descarga); `pie` es el texto bajo la foto.
   */
  | { tipo: 'foto'; de?: string; color?: string; hora: string; mio?: boolean; leido?: boolean; Imagen: FC; alto?: number; borrosa?: boolean; pie?: string };

export const ALTO_MENSAJE = (m: Mensaje) => {
  if (m.tipo === 'texto') return (m.mio || !m.de ? 38 : 56) + (m.texto.length > 30 ? 21 : 0) + 5;
  if (m.tipo === 'audio') return 74;
  if (m.tipo === 'sistema') return 44;
  if (m.tipo === 'foto') return (m.de && !m.mio ? 22 : 0) + (m.alto ?? 200) + 6 + (m.pie ? 26 : 0) + 5;
  return 94;
};

const Hora: FC<{ hora: string; mio?: boolean; leido?: boolean }> = ({ hora, mio, leido = true }) => (
  <span style={{ fontSize: 11, color: '#667781', marginLeft: 8, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3, float: 'right', marginTop: 6 }}>
    {hora}
    {mio && <span style={{ color: leido ? '#53BDEB' : '#8696A0', fontSize: 13 }}>✓✓</span>}
  </span>
);

/** Onda de un audio de WhatsApp. `avance` (0 → 1) pinta de verde lo que ya sonó. */
export const Onda: FC<{ barras: number; alto: number; color: string; avance?: number; colorAvance?: string }> = ({ barras, alto, color, avance = 0, colorAvance = '#00A884' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: alto * 0.08, height: alto }}>
    {Array.from({ length: barras }, (_, i) => (
      <span key={i} style={{ width: alto * 0.09, height: alto * (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))), borderRadius: alto, background: i / barras < avance ? colorAvance : color }} />
    ))}
  </div>
);

/** Un mensaje del grupo, en píxeles del celular. */
export const Globo: FC<{ m: Mensaje }> = ({ m }) => {
  const sombra = '0 1px 0.5px rgba(11,20,26,0.13)';
  if (m.tipo === 'sticker') return <div style={{ fontSize: 76, lineHeight: 1, padding: '4px 6px' }}>{m.emoji}</div>;
  if (m.tipo === 'sistema') {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: '#FFFFFF', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#54656F', boxShadow: sombra }}>{m.texto}</span>
      </div>
    );
  }
  const mio = (m.tipo === 'texto' || m.tipo === 'foto') && m.mio;
  const caja: CSSProperties = { display: 'inline-block', maxWidth: 290, background: mio ? '#D9FDD3' : 'white', borderRadius: mio ? '10px 0 10px 10px' : '0 10px 10px 10px', padding: '6px 9px 7px', boxShadow: sombra, fontSize: 15.5, lineHeight: '21px', color: '#111B21', textAlign: 'left' };
  return (
    <div style={{ textAlign: mio ? 'right' : 'left' }}>
      <div style={caja}>
        {'de' in m && m.de && <div style={{ fontSize: 13, fontWeight: 600, color: m.color, lineHeight: '17px' }}>{m.de}</div>}
        {m.tipo === 'texto' && (
          <>
            {m.texto}
            <Hora hora={m.hora} mio={m.mio} leido={m.leido} />
          </>
        )}
        {m.tipo === 'foto' && <FotoGlobo m={m} />}
        {m.tipo === 'audio' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 230, height: 40 }}>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <path d="M7 4 L20 12 L7 20 Z" fill="#8696A0" />
            </svg>
            <Onda barras={22} alto={26} color="#B6BEC2" />
            <span style={{ fontSize: 11, color: '#667781' }}>{m.dur}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/** La foto dentro de su globo, con la hora encima (o borrosa y con el botón de descarga). */
const FotoGlobo: FC<{ m: Extract<Mensaje, { tipo: 'foto' }> }> = ({ m }) => {
  const alto = m.alto ?? 200;
  return (
    <div style={{ margin: '-3px -6px -4px', padding: 0 }}>
      <div style={{ position: 'relative', width: 260, height: alto, borderRadius: 7, overflow: 'hidden', background: '#CBD5E1' }}>
        <div style={{ position: 'absolute', inset: 0, filter: m.borrosa ? 'blur(7px) saturate(0.7)' : undefined, transform: m.borrosa ? 'scale(1.08)' : undefined }}>
          <m.Imagen />
        </div>
        {m.borrosa && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 54, height: 54, marginLeft: -27, marginTop: -27, borderRadius: '50%', background: 'rgba(11,20,26,0.55)', display: 'grid', placeItems: 'center' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4 V16 M6 11 L12 17 L18 11 M5 20 H19" />
            </svg>
          </div>
        )}
        {!m.pie && (
          <span style={{ position: 'absolute', right: 8, bottom: 5, fontSize: 11, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.6)', display: 'inline-flex', gap: 3 }}>
            {m.hora}
            {m.mio && <span style={{ color: m.leido === false ? 'white' : '#53BDEB', fontSize: 13 }}>✓✓</span>}
          </span>
        )}
      </div>
      {m.pie && (
        <div style={{ padding: '4px 6px 0', fontSize: 15.5 }}>
          {m.pie}
          <Hora hora={m.hora} mio={m.mio} leido={m.leido} />
        </div>
      )}
    </div>
  );
};

/** Copa dorada (icono). */
export const Copa: FC<{ tamano: number; style?: CSSProperties }> = ({ tamano, style }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 64 64" style={{ flexShrink: 0, ...style }}>
    <path d="M18 8 H46 V22 Q46 38 32 40 Q18 38 18 22 Z" fill="#F5B301" />
    <path d="M18 12 H8 Q8 28 20 30 M46 12 H56 Q56 28 44 30" stroke="#F5B301" strokeWidth={4.5} fill="none" />
    <path d="M28 40 H36 V48 H28 Z" fill="#D99A00" />
    <rect x={20} y={48} width={24} height={8} rx={2} fill="#B45309" />
    <path d="M24 12 Q24 26 31 32" stroke="#FDE68A" strokeWidth={3} fill="none" strokeLinecap="round" />
  </svg>
);

/** Cabecera del chat del grupo. */
const CabeceraGrupo: FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 108, background: '#F0F2F5', borderBottom: '1px solid #D1D7DB', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px', boxSizing: 'border-box', gap: 10, zIndex: 30 }}>
    <svg width={14} height={22} viewBox="0 0 14 22">
      <path d="M12 2 L3 11 L12 20" stroke="#0F172A" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EDE9FE', display: 'grid', placeItems: 'center' }}>
      <Copa tamano={28} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#111B21', whiteSpace: 'nowrap' }}>Copa Galileo 🏆</div>
      <div style={{ fontSize: 13, color: '#667781', whiteSpace: 'nowrap' }}>Camilo, Coach Ríos, Daniel, Andrés…</div>
    </div>
  </div>
);

const ARRIBA_CHAT = 108;
const ABAJO_CHAT = 752;

/**
 * Pantalla del grupo. `lista` son los mensajes en orden; `visibles` cuántos se ven (con decimales: el último va
 * entrando). Se apilan desde abajo, como en WhatsApp. `escrito` es lo que Camilo tiene a medio escribir.
 */
export const PantallaGrupo: FC<{ lista: Mensaje[]; visibles: number; escrito?: string; escribiendo?: boolean; sinLeer?: number; golpeSinLeer?: number }> = ({ lista, visibles, escrito = '', escribiendo, sinLeer = 0, golpeSinLeer = 0 }) => {
  const n = Math.max(0, Math.min(lista.length, Math.ceil(visibles)));
  const parte = visibles - Math.floor(visibles) || 1;
  const ultimo = n - 1;
  const colocados: { m: Mensaje; y: number; t: number }[] = [];
  let abajo = ABAJO_CHAT - 8;
  for (let i = ultimo; i >= 0 && abajo > ARRIBA_CHAT - 200; i--) {
    const t = i === ultimo ? parte : 1;
    const alto = ALTO_MENSAJE(lista[i]);
    colocados.push({ m: lista[i], y: abajo - alto, t });
    abajo -= alto * (i === ultimo ? Math.min(1, t * 1.4) : 1);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EFEAE2' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 10px 10px, #000 1.5px, transparent 0)', backgroundSize: '26px 26px' }} />
      {colocados.map(({ m, y, t }, k) => (
        <div key={`${n}-${k}`} style={{ position: 'absolute', left: 12, right: 12, top: y, opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * 18}px) scale(${0.94 + 0.06 * t})`, transformOrigin: '50% 100%' }}>
          <Globo m={m} />
        </div>
      ))}
      <CabeceraGrupo />
      {sinLeer > 0 && (
        <div style={{ position: 'absolute', right: 16, top: ABAJO_CHAT - 64, minWidth: 44, height: 44, borderRadius: 22, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 16, display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 20, padding: '0 8px', boxSizing: 'border-box', transform: `scale(${1 + golpeSinLeer * 0.25})` }}>{sinLeer}</div>
      )}
      {/* Barra de escribir */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, background: '#F0F2F5', display: 'flex', alignItems: 'flex-start', padding: '12px 12px 0', boxSizing: 'border-box', gap: 10, zIndex: 30 }}>
        <div style={{ flex: 1, minHeight: 44, borderRadius: 22, background: 'white', color: escrito ? '#111B21' : '#8696A0', fontSize: 16, display: 'flex', alignItems: 'center', padding: '0 18px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {escrito || 'Mensaje'}
          {escribiendo && <span style={{ display: 'inline-block', width: 2, height: 20, background: '#00A884', marginLeft: 1 }} />}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#00A884', display: 'grid', placeItems: 'center' }}>
          {escrito ? (
            <svg width={20} height={20} viewBox="0 0 24 24">
              <path d="M3 20 L21 12 L3 4 L5 11 L14 12 L5 13 Z" fill="white" />
            </svg>
          ) : (
            <svg width={18} height={22} viewBox="0 0 18 22">
              <rect x={5} y={1} width={8} height={13} rx={4} fill="white" />
              <path d="M2 10 Q2 17 9 17 Q16 17 16 10 M9 17 V21" stroke="white" strokeWidth={2} fill="none" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

/** Botón de enviar (para el toque). */
export const ENVIAR: PuntoCel = { x: 356, y: 786 };

/** Un mensaje del grupo en grande, flotando en el video. `t` (0 → 1) lo hace aparecer. */
export const BurbujaGrande: FC<{ m: Mensaje; x: number; y: number; t: number; rot?: number; escala?: number }> = ({ m, x, y, t, rot = 0, escala = 1 }) => {
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${t})`, fontFamily: SISTEMA, filter: 'drop-shadow(0 14px 24px rgba(0,0,0,0.45))' }}>
      <div style={{ transform: `scale(${2.6 * escala})`, transformOrigin: '50% 50%' }}>
        <Globo m={m} />
      </div>
    </div>
  );
};

/** Pastilla roja de «sin leer» (como la del icono de la app). */
export const SinLeer: FC<{ x: number; y: number; t: number; n: number; golpe?: number }> = ({ x, y, t, n, golpe = 0 }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${t * (1 + golpe * 0.18)})`, minWidth: 150, height: 150, borderRadius: 75, padding: '0 30px', boxSizing: 'border-box', background: '#EF4444', border: '8px solid white', color: 'white', fontFamily: SISTEMA, fontWeight: 800, fontSize: 76, display: 'grid', placeItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', letterSpacing: -2 }}>
      {n}
    </div>
  ) : null;

// --- Chat de uno a uno -----------------------------------------------------------------------------------------

/** Cabecera de un chat con una persona: foto (inicial), nombre y estado. */
const CabeceraChat: FC<{ nombre: string; color: string; estado: string }> = ({ nombre, color, estado }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 108, background: '#F0F2F5', borderBottom: '1px solid #D1D7DB', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px', boxSizing: 'border-box', gap: 10, zIndex: 30 }}>
    <svg width={14} height={22} viewBox="0 0 14 22">
      <path d="M12 2 L3 11 L12 20" stroke="#0F172A" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, color: 'white', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700 }}>{Array.from(nombre)[0]}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#111B21', whiteSpace: 'nowrap' }}>{nombre}</div>
      <div style={{ fontSize: 13, color: '#667781', whiteSpace: 'nowrap' }}>{estado}</div>
    </div>
  </div>
);

/**
 * Chat de uno a uno. Igual que el grupo: `lista` en orden, `visibles` cuántos se ven (el último va entrando) y
 * `escrito` lo que se está escribiendo abajo.
 */
export const PantallaChat: FC<{ nombre: string; color: string; estado?: string; lista: Mensaje[]; visibles: number; escrito?: string; escribiendo?: boolean }> = ({ nombre, color, estado = 'en línea', lista, visibles, escrito = '', escribiendo }) => {
  const n = Math.max(0, Math.min(lista.length, Math.ceil(visibles)));
  const parte = visibles - Math.floor(visibles) || 1;
  const colocados: { m: Mensaje; y: number; t: number }[] = [];
  let abajo = ABAJO_CHAT - 8;
  for (let i = n - 1; i >= 0 && abajo > ARRIBA_CHAT - 200; i--) {
    const t = i === n - 1 ? parte : 1;
    const alto = ALTO_MENSAJE(lista[i]);
    colocados.push({ m: lista[i], y: abajo - alto, t });
    abajo -= alto * (i === n - 1 ? Math.min(1, t * 1.4) : 1);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EFEAE2' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 10px 10px, #000 1.5px, transparent 0)', backgroundSize: '26px 26px' }} />
      {colocados.map(({ m, y, t }, k) => (
        <div key={`${n}-${k}`} style={{ position: 'absolute', left: 12, right: 12, top: y, opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * 18}px) scale(${0.94 + 0.06 * t})`, transformOrigin: '50% 100%' }}>
          <Globo m={m} />
        </div>
      ))}
      <CabeceraChat nombre={nombre} color={color} estado={estado} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, background: '#F0F2F5', display: 'flex', alignItems: 'flex-start', padding: '12px 12px 0', boxSizing: 'border-box', gap: 10, zIndex: 30 }}>
        <div style={{ flex: 1, minHeight: 44, borderRadius: 22, background: 'white', color: escrito ? '#111B21' : '#8696A0', fontSize: 16, display: 'flex', alignItems: 'center', padding: '0 18px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {escrito || 'Mensaje'}
          {escribiendo && <span style={{ display: 'inline-block', width: 2, height: 20, background: '#00A884', marginLeft: 1 }} />}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#00A884', display: 'grid', placeItems: 'center' }}>
          <svg width={20} height={20} viewBox="0 0 24 24">
            <path d="M3 20 L21 12 L3 4 L5 11 L14 12 L5 13 Z" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- El aviso de Gali Esport por WhatsApp ----------------------------------------------------------------------

/**
 * Texto de la plantilla «invitation» que manda la app al publicar un evento (app/lib/whatsapp.ts):
 * jugador, título del evento, fecha y hora como las escribe la app (es-CO) y lugar.
 */
export const textoAviso = (jugador: string, evento: string, fecha: string, hora: string, lugar: string) =>
  `Hola ${jugador}, se programó un nuevo partido ${evento} el día ${fecha}, a las ${hora} en ${lugar}. Por favor, confirma tu disponibilidad para este horario.`;

/** Respuestas rápidas de la plantilla (hacen el «Voy / No voy / Tal vez» en la app). */
export const BOTONES_AVISO = ['Voy', 'No voy', 'Tal vez'] as const;
/** Centro del botón «Voy» en la pantalla, para el toque (con un texto de ~8 líneas, como el de `textoAviso`). */
export const BOTON_VOY: PuntoCel = { x: 195, y: 342 };

/**
 * Chat con la cuenta de empresa «Gali Esport»: llega el aviso con sus botones y, si `respuesta` > 0, sale «Voy».
 * `llega` (0 → 1) hace aparecer el mensaje; `voy` (0 → 1) marca el botón apretado.
 */
export const PantallaAvisoGali: FC<{ texto: string; hora: string; llega: number; voy?: number; respuesta?: number }> = ({ texto, hora, llega, voy = 0, respuesta = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#EFEAE2', fontFamily: SISTEMA }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 10px 10px, #000 1.5px, transparent 0)', backgroundSize: '26px 26px' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 108, background: '#F0F2F5', borderBottom: '1px solid #D1D7DB', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px', boxSizing: 'border-box', gap: 10 }}>
      <svg width={14} height={22} viewBox="0 0 14 22">
        <path d="M12 2 L3 11 L12 20" stroke="#0F172A" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: MARINO, display: 'grid', placeItems: 'center' }}>
        <Isotipo tamano={30} trazo="#FFFFFF" />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#111B21', display: 'flex', alignItems: 'center', gap: 6 }}>
          Gali Esport
          <svg width={16} height={16} viewBox="0 0 16 16">
            <circle cx={8} cy={8} r={8} fill="#25D366" />
            <path d="M4.5 8.2 L7 10.6 L11.6 5.6" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 13, color: '#667781' }}>Cuenta de empresa</div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: '50%', top: 128, transform: 'translateX(-50%)', background: 'white', color: '#54656F', fontSize: 12.5, padding: '5px 12px', borderRadius: 8, boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)' }}>HOY</div>
    <div style={{ position: 'absolute', left: 14, top: 172, width: 318, opacity: Math.min(1, llega * 2), transform: `translateY(${(1 - llega) * 30}px) scale(${0.92 + 0.08 * llega})`, transformOrigin: '0 0' }}>
      <div style={{ background: 'white', borderRadius: '0 10px 10px 10px', padding: '9px 11px 8px', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)', fontSize: 16, lineHeight: 1.36, color: '#111B21' }}>
        {texto}
        <div style={{ textAlign: 'right', fontSize: 11.5, color: '#667781', marginTop: 4 }}>{hora}</div>
      </div>
      {BOTONES_AVISO.map((b, i) => (
        <div key={b} style={{ marginTop: 3, height: 44, borderRadius: 10, background: i === 0 && voy > 0 ? `rgba(231,241,245,${Math.min(1, voy * 2)})` : 'white', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#027EB5', fontSize: 16, fontWeight: 500 }}>
          <svg width={16} height={14} viewBox="0 0 16 14">
            <path d="M6 1 L1 6 L6 11 M1 6 H10 Q15 6 15 11 V13" stroke="#027EB5" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {b}
        </div>
      ))}
      {respuesta > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, marginRight: -4 }}>
          <div style={{ opacity: Math.min(1, respuesta * 2), transform: `translateY(${(1 - respuesta) * 24}px)`, background: '#D9FDD3', borderRadius: '10px 0 10px 10px', padding: '8px 12px', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)', fontSize: 17, color: '#111B21', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            Voy
            <span style={{ fontSize: 11.5, color: '#667781', display: 'flex', alignItems: 'center', gap: 3 }}>
              {hora} <span style={{ color: '#53BDEB', fontSize: 13 }}>✓✓</span>
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
);
