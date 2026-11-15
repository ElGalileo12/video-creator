// Los personajes de Gali Esport, siempre iguales en todos los videos:
// - Camilo, el organizador de torneos (polo morado, credencial, gafas, pelo crespo). Nació en `torneo-whatsapp`.
// - Daniel, el entrenador de la Sub-14 (chaqueta azul, silbato). Nació en `gali-un-equipo`; poses de `quien-me-debe`.
// - Sergio, el papá de Mateo (chaqueta terracota, barba corta). Nació en `entrenar-en-serio`.
// - Mateo (13 años, el 7 de la Sub-14) y cualquier otro niño jugador (`Nino`). De `entrenar-en-serio`.
// Cada uno se coloca por los pies: `x`, `y` (píxeles del video) y `alto`.
import type { CSSProperties, FC, ReactNode } from 'react';
import { AZUL_DANIEL, MORADO_CAMILO, ROSA_SUB14 } from './tema';

// --- Colocar un personaje ----------------------------------------------------------------------------------

export type Colocado = {
  /** Pies del personaje, en píxeles del video. */
  x: number;
  y: number;
  alto: number;
  rot?: number;
  opacidad?: number;
  espejo?: boolean;
  style?: CSSProperties;
};

export const Colocar: FC<Colocado & { proporcion: number; viewBox: string; children: ReactNode }> = ({ x, y, alto, rot = 0, opacidad = 1, espejo, style, proporcion, viewBox, children }) => {
  const ancho = alto * proporcion;
  const { transform: extra, ...resto } = style ?? {};
  return (
    <svg
      width={ancho}
      height={alto}
      viewBox={viewBox}
      style={{ position: 'absolute', left: x - ancho / 2, top: y - alto, opacity: opacidad, overflow: 'visible', transformOrigin: '50% 100%', ...resto, transform: `${extra ?? ''} rotate(${rot}deg) scaleX(${espejo ? -1 : 1})` }}
    >
      {children}
    </svg>
  );
};

// --- Camilo, el organizador ----------------------------------------------------------------------------------

export type Expresion = 'feliz' | 'agobiado' | 'tranquilo' | 'pensando';
export type ManosCamilo = 'celular' | 'escribe' | 'cabeza' | 'pulgar' | 'bolsillo' | 'tablilla';

/** Celular pequeño en la mano (en el sistema del personaje). */
const CelMano: FC<{ x: number; y: number; rot: number; chat?: boolean }> = ({ x, y, rot, chat = true }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x - 19} y={y - 33} width={38} height={66} rx={7} fill="#0B0F17" />
    <rect x={x - 16} y={y - 29} width={32} height={58} rx={5} fill={chat ? '#EFEAE2' : '#1E293B'} />
    {chat && (
      <>
        <rect x={x - 16} y={y - 29} width={32} height={9} rx={3} fill="#F0F2F5" />
        <rect x={x - 13} y={y - 16} width={18} height={6} rx={2} fill="#FFFFFF" />
        <rect x={x - 5} y={y - 7} width={18} height={6} rx={2} fill="#D9FDD3" />
        <rect x={x - 13} y={y + 2} width={20} height={6} rx={2} fill="#FFFFFF" />
        <rect x={x - 13} y={y + 11} width={14} height={6} rx={2} fill="#FFFFFF" />
      </>
    )}
  </g>
);

/** La tablilla con las planillas, sostenida con los dos brazos frente al pecho; `hojas` las apila (1 a 6). */
const TablillaMano: FC<{ hojas: number; polo: string; piel: string }> = ({ hojas, polo, piel }) => (
  <>
    <path d="M 66 162 Q 40 214 74 252" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
    <g transform="rotate(-6 110 228)">
      <rect x={70} y={176} width={84} height={108} rx={7} fill="#A16207" stroke="#713F12" strokeWidth={2} />
      {Array.from({ length: Math.max(1, Math.round(hojas)) }, (_, k) => (
        <g key={k} transform={`translate(${-k * 1.6} ${-k * 2.2}) rotate(${(k % 2 ? 1 : -1) * k * 0.8} 112 232)`}>
          <rect x={77} y={188} width={70} height={90} rx={2} fill={k % 2 ? '#F8FAFC' : '#FFFDF5'} stroke="#CBD5E1" strokeWidth={1} />
          {[0, 1, 2, 3, 4].map((l) => <rect key={l} x={84} y={204 + l * 13} width={l === 0 ? 40 : 52} height={2.6} rx={1.3} fill="#64748B" opacity={0.55} />)}
        </g>
      ))}
      <rect x={96} y={170} width={32} height={16} rx={4} fill="#94A3B8" stroke="#64748B" strokeWidth={1.5} />
    </g>
    <circle cx={78} cy={256} r={12} fill={piel} />
    <path d="M 154 162 Q 186 206 150 232" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
    <line x1={146} y1={238} x2={128} y2={212} stroke="#F59E0B" strokeWidth={5} strokeLinecap="round" />
    <circle cx={146} cy={234} r={12} fill={piel} />
  </>
);

/**
 * Camilo: polo morado con cuello blanco, credencial de organizador colgada, gafas y pelo crespo.
 * `en` dice qué hace con las manos.
 */
export const Camilo: FC<Colocado & { expresion?: Expresion; en?: ManosCamilo; mirada?: 'frente' | 'abajo' | 'arriba' | 'lado'; parpadeo?: boolean; paso?: number; hojas?: number }> = ({
  expresion = 'feliz', en, mirada = 'frente', parpadeo = false, paso, hojas = 1, ...colocado
}) => {
  const piel = '#C68A5E';
  const pelo = '#1A1110';
  const polo = MORADO_CAMILO;
  const poloOscuro = '#5B21B6';
  const pantalon = '#2B3445';
  const agobiado = expresion === 'agobiado';
  const pensando = expresion === 'pensando';
  const ojoY = mirada === 'abajo' ? 100 : mirada === 'arriba' ? 91 : 96;
  const ojoX = mirada === 'arriba' ? 2 : mirada === 'lado' ? 4 : 0;
  const s = paso !== undefined ? Math.sin(paso) : 0;
  const brazoIzqLibre = en !== 'escribe' && en !== 'tablilla';
  return (
    <Colocar {...colocado} proporcion={220 / 460} viewBox="0 0 220 460">
      <ellipse cx={110} cy={452} rx={74} ry={10} fill="black" opacity={0.3} />
      {/* Piernas y tenis */}
      <g transform={`rotate(${s * 6} 90 290)`}>
        <rect x={74} y={282} width={32} height={150} rx={12} fill={pantalon} />
        <rect x={58} y={424} width={52} height={22} rx={11} fill="#F8FAFC" />
        <rect x={58} y={440} width={52} height={6} rx={3} fill={polo} />
      </g>
      <g transform={`rotate(${-s * 6} 130 290)`}>
        <rect x={114} y={282} width={32} height={150} rx={12} fill={pantalon} />
        <rect x={110} y={424} width={52} height={22} rx={11} fill="#F8FAFC" />
        <rect x={110} y={440} width={52} height={6} rx={3} fill={polo} />
      </g>
      {/* Brazo izquierdo (el del lado izquierdo del dibujo) */}
      {brazoIzqLibre && (
        <>
          <path d="M 66 162 Q 46 212 48 262" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 64 156 Q 56 176 54 196" stroke={poloOscuro} strokeWidth={28} strokeLinecap="butt" fill="none" opacity={0.25} />
          <circle cx={48} cy={274} r={13} fill={piel} />
          {en === 'cabeza' && <CelMano x={48} y={286} rot={8} />}
        </>
      )}
      {/* Polo */}
      <path d="M 62 150 Q 110 136 158 150 L 166 292 Q 110 302 54 292 Z" fill={polo} />
      <path d="M 56 280 Q 110 290 164 280 L 166 294 Q 110 304 54 294 Z" fill={poloOscuro} />
      <rect x={98} y={124} width={24} height={28} rx={8} fill={piel} />
      {/* Cuello blanco y botones */}
      <path d="M 84 146 L 110 164 L 100 176 L 80 154 Z M 136 146 L 110 164 L 120 176 L 140 154 Z" fill="#F8FAFC" />
      <line x1={110} y1={166} x2={110} y2={200} stroke={poloOscuro} strokeWidth={3} />
      <circle cx={110} cy={180} r={2.6} fill="#F8FAFC" />
      <circle cx={110} cy={194} r={2.6} fill="#F8FAFC" />
      {/* Credencial de organizador */}
      <path d="M 96 152 L 104 214 M 124 152 L 116 214" stroke="#0EA5E9" strokeWidth={3.5} fill="none" />
      <g transform="rotate(-4 110 232)">
        <rect x={94} y={210} width={32} height={42} rx={5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.5} />
        <rect x={94} y={210} width={32} height={11} rx={4} fill="#0EA5E9" />
        <circle cx={110} cy={232} r={6} fill="#CBD5E1" />
        <rect x={100} y={241} width={20} height={3} rx={1.5} fill="#94A3B8" />
        <rect x={102} y={246} width={16} height={2.5} rx={1.2} fill="#CBD5E1" />
      </g>
      {/* Brazos según lo que hace */}
      {en === 'celular' && (
        <>
          <path d="M 156 162 Q 182 200 172 238" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 172 238 Q 160 230 140 222" stroke={polo} strokeWidth={24} strokeLinecap="round" fill="none" />
          <CelMano x={128} y={200} rot={-12} />
          <circle cx={136} cy={222} r={12} fill={piel} />
        </>
      )}
      {en === 'escribe' && (
        <>
          <path d="M 66 162 Q 46 214 84 232" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 154 162 Q 176 214 136 232" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <CelMano x={110} y={204} rot={0} />
          <circle cx={90} cy={226} r={12} fill={piel} />
          <circle cx={130} cy={226} r={12} fill={piel} />
          <circle cx={118} cy={212} r={6} fill={piel} />
        </>
      )}
      {en === 'pulgar' && (
        <>
          <path d="M 156 164 Q 192 168 196 120" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={196} cy={106} r={14} fill={piel} />
          <rect x={192} y={80} width={9} height={22} rx={4.5} fill={piel} />
        </>
      )}
      {en === 'bolsillo' && (
        <>
          <path d="M 154 162 Q 176 206 150 262" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={148} cy={270} r={13} fill={piel} />
        </>
      )}
      {en === 'cabeza' && (
        <>
          <path d="M 156 164 Q 204 150 164 80" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={160} cy={72} r={13} fill={piel} />
        </>
      )}
      {en === undefined && (
        <>
          <path d="M 154 162 Q 174 212 172 262" stroke={polo} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={172} cy={274} r={13} fill={piel} />
        </>
      )}
      {en === 'tablilla' && <TablillaMano hojas={hojas} polo={polo} piel={piel} />}
      {/* Cabeza */}
      <circle cx={68} cy={96} r={9} fill={piel} />
      <circle cx={152} cy={96} r={9} fill={piel} />
      <circle cx={110} cy={92} r={42} fill={piel} />
      {/* Pelo crespo */}
      <g fill={pelo}>
        <path d="M 70 92 Q 64 52 110 48 Q 156 52 150 92 Q 146 72 130 66 Q 110 74 90 66 Q 74 72 70 92 Z" />
        {[[74, 70, 13], [86, 56, 14], [102, 49, 14], [119, 49, 14], [135, 56, 14], [146, 70, 13], [80, 82, 9], [141, 82, 9]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      {/* Cejas */}
      <path
        d={agobiado ? 'M 85 78 L 101 72 M 119 72 L 135 78' : pensando ? 'M 85 74 Q 94 68 102 73 M 118 77 Q 126 75 135 77' : 'M 85 76 Q 94 71 102 75 M 118 75 Q 126 71 135 76'}
        stroke={pelo} strokeWidth={4} strokeLinecap="round" fill="none"
      />
      {/* Ojos */}
      {parpadeo ? (
        <path d="M 89 96 h 12 M 119 96 h 12" stroke="#1F2937" strokeWidth={3.5} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={95 + ojoX} cy={ojoY} r={agobiado ? 5.2 : 4.6} fill="#1F2937" />
          <circle cx={125 + ojoX} cy={ojoY} r={agobiado ? 5.2 : 4.6} fill="#1F2937" />
        </>
      )}
      {/* Gafas */}
      <g stroke="#111827" strokeWidth={3} fill="rgba(255,255,255,0.12)">
        <circle cx={95} cy={96} r={12} />
        <circle cx={125} cy={96} r={12} />
      </g>
      <path d="M 107 95 Q 110 92 113 95 M 83 94 L 70 91 M 137 94 L 150 91" stroke="#111827" strokeWidth={3} fill="none" />
      <circle cx={86} cy={112} r={6} fill="#F87171" opacity={0.22} />
      <circle cx={134} cy={112} r={6} fill="#F87171" opacity={0.22} />
      {/* Boca */}
      {expresion === 'feliz' && <path d="M 96 116 Q 110 131 124 116" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {expresion === 'tranquilo' && <path d="M 99 118 Q 110 125 121 118" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {pensando && <path d="M 100 121 Q 112 117 122 122" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {agobiado && (
        <>
          <path d="M 98 124 Q 110 115 122 124" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M 150 60 Q 158 74 152 82 Q 144 80 150 60 Z" fill="#7DD3FC" />
        </>
      )}
    </Colocar>
  );
};

/** Billete (en el sistema de coordenadas del personaje, centrado en (0, 0)). */
const BilleteMini: FC<{ x: number; y: number; rot?: number; escala?: number }> = ({ x, y, rot = 0, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${escala})`}>
    <rect x={-26} y={-13} width={52} height={26} rx={3} fill="#9FD8A8" stroke="#3F8F55" strokeWidth={1.6} />
    <circle cx={0} cy={0} r={7} fill="none" stroke="#3F8F55" strokeWidth={1.6} />
    <text x={0} y={3.5} textAnchor="middle" fontSize={10} fontWeight={900} fill="#2F6E40">$</text>
  </g>
);

// --- Daniel -------------------------------------------------------------------------------------------

export type ManosDaniel = 'celular' | 'pulgar' | 'recibe' | 'bolsillo' | 'papel' | 'papeles' | 'calculadora' | 'cabeza' | 'hombros';

/** Daniel, el entrenador (el profe de la serie): chaqueta azul y silbato. `en` dice qué hace con las manos. */
export const Daniel: FC<Colocado & { expresion?: Expresion; en?: ManosDaniel; mirada?: 'frente' | 'abajo' | 'arriba' | 'lado'; parpadeo?: boolean; billetes?: number }> = ({
  expresion = 'feliz', en, mirada = 'frente', parpadeo = false, billetes = 0, ...colocado
}) => {
  const piel = '#E9B88F';
  const chaqueta = AZUL_DANIEL;
  const chaquetaOscura = '#1D4ED8';
  const agobiado = expresion === 'agobiado';
  const pensando = expresion === 'pensando';
  const ojoY = mirada === 'abajo' ? 100 : mirada === 'arriba' ? 91 : 96;
  const ojoX = mirada === 'arriba' ? 3 : mirada === 'lado' ? 4 : 0;
  const brazoIzqLibre = en !== 'papel' && en !== 'papeles' && en !== 'hombros';
  return (
    <Colocar {...colocado} proporcion={220 / 460} viewBox="0 0 220 460">
      <ellipse cx={110} cy={452} rx={74} ry={10} fill="black" opacity={0.3} />
      <rect x={74} y={282} width={32} height={150} rx={12} fill="#1E293B" />
      <rect x={114} y={282} width={32} height={150} rx={12} fill="#1E293B" />
      <rect x={58} y={424} width={52} height={22} rx={11} fill="#F8FAFC" />
      <rect x={110} y={424} width={52} height={22} rx={11} fill="#F8FAFC" />
      <rect x={58} y={440} width={52} height={6} rx={3} fill="#94A3B8" />
      <rect x={110} y={440} width={52} height={6} rx={3} fill="#94A3B8" />
      {/* Brazo izquierdo */}
      {brazoIzqLibre && (
        <>
          <path d="M 66 162 Q 46 212 48 262" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 60 170 Q 42 214 44 258" stroke="white" strokeOpacity={0.5} strokeWidth={3} fill="none" />
          <circle cx={48} cy={274} r={13} fill={piel} />
        </>
      )}
      {en === 'hombros' && (
        <>
          <path d="M 66 162 Q 26 176 30 128" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={30} cy={116} r={13} fill={piel} />
        </>
      )}
      {/* Chaqueta */}
      <path d="M 62 150 Q 110 136 158 150 L 166 292 Q 110 302 54 292 Z" fill={chaqueta} />
      <path d="M 56 280 Q 110 290 164 280 L 166 294 Q 110 304 54 294 Z" fill={chaquetaOscura} />
      <line x1={110} y1={156} x2={110} y2={298} stroke="white" strokeOpacity={0.85} strokeWidth={3} />
      {/* Bolsillo (con billetes asomando) */}
      {billetes > 0 && (
        <g opacity={Math.min(1, billetes)}>
          <BilleteMini x={140} y={252} rot={-14} escala={0.7} />
          <BilleteMini x={132} y={256} rot={8} escala={0.7} />
        </g>
      )}
      <path d="M 122 254 L 158 252 L 160 270 L 124 272 Z" fill={chaquetaOscura} opacity={0.85} />
      <rect x={98} y={126} width={24} height={26} rx={8} fill={piel} />
      <path d="M 86 146 L 110 172 L 134 146 L 128 140 L 110 158 L 92 140 Z" fill={chaquetaOscura} />
      <path d="M 99 150 L 110 196 L 121 150" stroke="white" strokeWidth={2.5} fill="none" />
      <rect x={103} y={192} width={18} height={10} rx={5} fill="#CBD5E1" stroke="#94A3B8" strokeWidth={1.5} />
      {en === 'celular' && (
        <>
          <path d="M 156 162 Q 182 200 172 238" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 172 238 Q 160 230 140 222" stroke={chaqueta} strokeWidth={24} strokeLinecap="round" fill="none" />
          <g transform="rotate(-12 128 200)">
            <rect x={110} y={168} width={38} height={66} rx={7} fill="#0B0F17" />
            <rect x={113} y={172} width={32} height={58} rx={5} fill="#F6F8FB" />
            <rect x={116} y={178} width={26} height={7} rx={2} fill="#2563EB" opacity={0.9} />
            <rect x={116} y={190} width={26} height={8} rx={2} fill="#10B981" opacity={0.85} />
            <rect x={116} y={202} width={26} height={8} rx={2} fill="#CBD5E1" />
            <rect x={116} y={214} width={26} height={8} rx={2} fill="#CBD5E1" />
          </g>
          <circle cx={136} cy={222} r={12} fill={piel} />
        </>
      )}
      {en === 'calculadora' && (
        <>
          <path d="M 156 162 Q 182 200 172 238" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 172 238 Q 160 230 140 222" stroke={chaqueta} strokeWidth={24} strokeLinecap="round" fill="none" />
          <g transform="rotate(-10 128 204)">
            <rect x={104} y={166} width={50} height={76} rx={7} fill="#334155" />
            <rect x={109} y={172} width={40} height={14} rx={2} fill="#A7F3D0" />
            {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={110 + c * 13} y={192 + r * 15} width={10} height={11} rx={2} fill={c === 2 && r === 2 ? '#F59E0B' : '#CBD5E1'} />))}
          </g>
          <circle cx={136} cy={226} r={12} fill={piel} />
        </>
      )}
      {en === 'pulgar' && (
        <>
          <path d="M 156 164 Q 192 168 196 120" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={196} cy={106} r={14} fill={piel} />
          <rect x={192} y={80} width={9} height={22} rx={4.5} fill={piel} />
        </>
      )}
      {en === 'recibe' && (
        <>
          <path d="M 156 164 Q 196 196 226 204" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <ellipse cx={240} cy={206} rx={16} ry={11} fill={piel} />
        </>
      )}
      {en === 'bolsillo' && (
        <>
          <path d="M 154 162 Q 176 206 150 254" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={145} cy={262} r={13} fill={piel} />
        </>
      )}
      {en === 'cabeza' && (
        <>
          <path d="M 156 164 Q 204 150 164 80" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={160} cy={72} r={13} fill={piel} />
        </>
      )}
      {en === 'hombros' && (
        <>
          <path d="M 154 162 Q 194 176 190 128" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={190} cy={116} r={13} fill={piel} />
        </>
      )}
      {en === 'papel' && (
        <>
          <path d="M 66 162 Q 50 214 82 232" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <g transform="rotate(-8 110 210)">
            <path d="M 76 176 L 142 172 L 146 244 L 80 248 Z" fill="#FFFDF5" stroke="#CBD5E1" strokeWidth={1.5} />
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M 86 ${190 + k * 13} q 12 -3 24 0 t 24 0`} stroke="#1E3A8A" strokeWidth={2.2} fill="none" opacity={0.75} />)}
          </g>
          <circle cx={84} cy={236} r={12} fill={piel} />
          <path d="M 154 162 Q 176 206 140 222" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <line x1={132} y1={226} x2={118} y2={204} stroke="#111827" strokeWidth={4} strokeLinecap="round" />
          <circle cx={136} cy={224} r={12} fill={piel} />
        </>
      )}
      {en === 'papeles' && (
        <>
          <path d="M 66 162 Q 40 210 58 236" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 154 162 Q 180 210 162 236" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          {[-16, -4, 8].map((r, k) => (
            <g key={k} transform={`rotate(${r} 110 236)`}>
              <rect x={74} y={196} width={72} height={88} rx={3} fill={k === 1 ? '#FFFDF5' : '#F1F5F9'} stroke="#CBD5E1" strokeWidth={1.5} />
              {[0, 1, 2].map((l) => <rect key={l} x={84} y={210 + l * 14} width={44} height={3} rx={1.5} fill="#64748B" opacity={0.5} />)}
            </g>
          ))}
          <circle cx={60} cy={244} r={12} fill={piel} />
          <circle cx={160} cy={244} r={12} fill={piel} />
        </>
      )}
      {en === undefined && (
        <>
          <path d="M 154 162 Q 174 212 172 262" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={172} cy={274} r={13} fill={piel} />
        </>
      )}
      {/* Cabeza */}
      <circle cx={68} cy={96} r={9} fill={piel} />
      <circle cx={152} cy={96} r={9} fill={piel} />
      <circle cx={110} cy={92} r={42} fill={piel} />
      <path d="M 68 94 Q 64 44 110 46 Q 158 44 152 94 Q 148 70 128 64 Q 106 74 86 64 Q 72 72 68 94 Z" fill="#2A1A10" />
      <path
        d={agobiado ? 'M 86 80 L 102 74 M 118 74 L 134 80' : pensando ? 'M 86 76 Q 95 70 103 75 M 117 79 Q 125 77 134 79' : 'M 86 78 Q 95 73 103 77 M 117 77 Q 125 73 134 78'}
        stroke="#2A1A10" strokeWidth={4} strokeLinecap="round" fill="none"
      />
      {parpadeo ? (
        <path d="M 89 96 h 12 M 119 96 h 12" stroke="#1F2937" strokeWidth={3.5} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={95 + ojoX} cy={ojoY} r={agobiado ? 5.5 : 4.8} fill="#1F2937" />
          <circle cx={125 + ojoX} cy={ojoY} r={agobiado ? 5.5 : 4.8} fill="#1F2937" />
        </>
      )}
      <circle cx={88} cy={110} r={6} fill="#F87171" opacity={0.25} />
      <circle cx={132} cy={110} r={6} fill="#F87171" opacity={0.25} />
      {expresion === 'feliz' && <path d="M 95 113 Q 110 129 125 113" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {expresion === 'tranquilo' && <path d="M 99 115 Q 110 123 121 115" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {pensando && <path d="M 100 118 Q 112 114 122 119" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      {agobiado && (
        <>
          <path d="M 98 122 Q 110 113 122 122" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M 150 58 Q 158 72 152 80 Q 144 78 150 58 Z" fill="#7DD3FC" />
        </>
      )}
    </Colocar>
  );
};

/** Nombre viejo de Daniel en los primeros videos. */
export const Profe = Daniel;

// --- Sergio, el papá de Mateo ----------------------------------------------------------------------------------

export type GestoSergio = 'orgulloso' | 'concentrado' | 'serio' | 'feliz';
export type BrazosSergio = 'libres' | 'cintura' | 'celular' | 'bajo';

/**
 * Sergio: chaqueta terracota sobre camiseta blanca, jean y barba corta. Mismo trazo y proporciones que Daniel.
 * `celular` lo tiene frente al pecho; `bajo`, colgando en la mano; `cintura`, las manos en la cintura.
 */
export const Sergio: FC<Colocado & { gesto?: GestoSergio; brazos?: BrazosSergio; mirada?: 'frente' | 'abajo' | 'lado'; parpadeo?: boolean; cabeza?: number }> = ({
  gesto = 'feliz', brazos = 'libres', mirada = 'frente', parpadeo = false, cabeza = 0, ...colocado
}) => {
  const piel = '#D6A077';
  const pelo = '#3B2416';
  const chaqueta = '#C2410C';
  const chaquetaOscura = '#9A3412';
  const jean = '#355C8E';
  const ojoY = mirada === 'abajo' ? 101 : 96;
  const ojoX = mirada === 'lado' ? 4 : 0;
  const brazoLibre = (lado: 'izq' | 'der') =>
    lado === 'izq' ? (
      <>
        <path d="M 66 162 Q 46 212 48 262" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
        <circle cx={48} cy={274} r={13} fill={piel} />
      </>
    ) : (
      <>
        <path d="M 154 162 Q 174 212 172 262" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
        <circle cx={172} cy={274} r={13} fill={piel} />
      </>
    );
  return (
    <Colocar {...colocado} proporcion={220 / 460} viewBox="0 0 220 460">
      <ellipse cx={110} cy={452} rx={76} ry={10} fill="black" opacity={0.3} />
      {/* Piernas (jean) y zapatos */}
      <rect x={74} y={282} width={32} height={152} rx={12} fill={jean} />
      <rect x={114} y={282} width={32} height={152} rx={12} fill={jean} />
      <path d="M 90 300 V 424 M 130 300 V 424" stroke="#2B4A73" strokeWidth={2} />
      <rect x={60} y={426} width={50} height={20} rx={10} fill="#7C4A21" />
      <rect x={110} y={426} width={50} height={20} rx={10} fill="#7C4A21" />
      <rect x={60} y={440} width={50} height={6} rx={3} fill="#4A2C14" />
      <rect x={110} y={440} width={50} height={6} rx={3} fill="#4A2C14" />
      {/* Brazo izquierdo (detrás del cuerpo cuando va a la cintura) */}
      {brazos === 'cintura' ? (
        <>
          <path d="M 66 162 L 30 212 L 58 250" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={62} cy={252} r={13} fill={piel} />
        </>
      ) : (
        brazoLibre('izq')
      )}
      {/* Chaqueta abierta con camiseta blanca */}
      <path d="M 62 150 Q 110 136 158 150 L 166 292 Q 110 302 54 292 Z" fill={chaqueta} />
      <path d="M 95 150 L 125 150 L 121 294 Q 110 296 99 294 Z" fill="#F8FAFC" />
      <path d="M 95 152 L 99 294 M 125 152 L 121 294" stroke="#7C2D12" strokeWidth={3} />
      <path d="M 56 280 Q 76 286 99 288 L 99 296 Q 76 296 54 294 Z M 121 288 Q 144 286 164 280 L 166 294 Q 144 296 121 296 Z" fill={chaquetaOscura} />
      <rect x={98} y={124} width={24} height={28} rx={8} fill={piel} />
      <path d="M 82 146 L 98 150 L 104 182 Z M 138 146 L 122 150 L 116 182 Z" fill={chaquetaOscura} />
      <path d="M 98 150 Q 110 162 122 150" stroke="#E2E8F0" strokeWidth={3} fill="none" />
      {/* Brazo derecho */}
      {brazos === 'cintura' && (
        <>
          <path d="M 154 162 L 190 212 L 162 250" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={158} cy={252} r={13} fill={piel} />
        </>
      )}
      {brazos === 'libres' && brazoLibre('der')}
      {brazos === 'celular' && (
        <>
          <path d="M 156 162 Q 184 200 172 238" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M 172 238 Q 160 230 140 222" stroke={chaqueta} strokeWidth={24} strokeLinecap="round" fill="none" />
          <g transform="rotate(-12 128 200)">
            <rect x={110} y={168} width={38} height={66} rx={7} fill="#0B0F17" />
            <rect x={113} y={172} width={32} height={58} rx={5} fill="#F8FAFC" />
            <rect x={116} y={178} width={26} height={7} rx={3.5} fill="#CBD5E1" />
            <rect x={116} y={190} width={22} height={4} rx={2} fill="#3B82F6" />
            <rect x={116} y={198} width={26} height={3} rx={1.5} fill="#94A3B8" />
            <rect x={116} y={208} width={22} height={4} rx={2} fill="#3B82F6" />
            <rect x={116} y={216} width={26} height={3} rx={1.5} fill="#94A3B8" />
          </g>
          <circle cx={136} cy={222} r={12} fill={piel} />
        </>
      )}
      {brazos === 'bajo' && (
        <>
          <path d="M 154 162 Q 174 212 172 262" stroke={chaqueta} strokeWidth={28} strokeLinecap="round" fill="none" />
          <g transform="rotate(8 176 286)">
            <rect x={164} y={262} width={24} height={42} rx={5} fill="#0B0F17" />
            <rect x={166.5} y={265} width={19} height={36} rx={3} fill="#E2E8F0" />
          </g>
          <circle cx={172} cy={274} r={13} fill={piel} />
        </>
      )}
      {/* Cabeza */}
      <g transform={`rotate(${cabeza} 110 130)`}>
        <circle cx={68} cy={96} r={9} fill={piel} />
        <circle cx={152} cy={96} r={9} fill={piel} />
        <circle cx={110} cy={92} r={42} fill={piel} />
        <path d="M 69 94 Q 62 46 108 45 Q 158 43 151 92 Q 148 68 126 60 Q 98 72 82 62 Q 72 72 69 94 Z" fill={pelo} />
        {/* Barba corta y bigote */}
        <path d="M 70 98 Q 72 138 110 138 Q 148 138 150 98 Q 146 124 110 125 Q 74 124 70 98 Z" fill={pelo} opacity={0.88} />
        <path d="M 97 109 Q 110 103 123 109 Q 110 113 97 109 Z" fill={pelo} />
        <path
          d={gesto === 'serio' ? 'M 86 77 L 102 81 M 118 81 L 134 77' : gesto === 'concentrado' ? 'M 86 79 Q 95 76 103 79 M 117 79 Q 125 76 134 79' : 'M 86 77 Q 95 71 103 76 M 117 76 Q 125 71 134 77'}
          stroke={pelo} strokeWidth={4.5} strokeLinecap="round" fill="none"
        />
        {parpadeo ? (
          <path d="M 89 96 h 12 M 119 96 h 12" stroke="#1F2937" strokeWidth={3.5} strokeLinecap="round" />
        ) : (
          <>
            <circle cx={95 + ojoX} cy={ojoY} r={4.8} fill="#1F2937" />
            <circle cx={125 + ojoX} cy={ojoY} r={4.8} fill="#1F2937" />
          </>
        )}
        <circle cx={86} cy={106} r={6} fill="#F87171" opacity={0.22} />
        <circle cx={134} cy={106} r={6} fill="#F87171" opacity={0.22} />
        {gesto === 'orgulloso' && <path d="M 98 114 Q 110 126 122 114 Z" fill="#7C2D12" stroke="#7C2D12" strokeWidth={3} strokeLinejoin="round" />}
        {gesto === 'feliz' && <path d="M 99 115 Q 110 124 121 115" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
        {gesto === 'concentrado' && <path d="M 102 118 H 118" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" />}
        {gesto === 'serio' && <path d="M 101 120 Q 110 115 119 120" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />}
      </g>
    </Colocar>
  );
};

// --- Mateo y los otros niños --------------------------------------------------------------------------------------

/**
 * Un niño jugador (el dibujo de Mateo en `entrenar-en-serio`). `camiseta` y `numero` son su ropa; `piel` y `pelo`
 * lo distinguen de otros. `patada` (0 → 1) sube la pierna derecha; `paso` lo hace trotar (fase en radianes).
 */
export const Nino: FC<Colocado & { camiseta: string; numero?: number; medias?: string; patada?: number; paso?: number; brazos?: 'abajo' | 'balance' | 'arriba'; mirada?: 'frente' | 'arriba' | 'abajo'; sonrisa?: 'grande' | 'normal'; piel?: string; pelo?: string }> = ({
  camiseta, numero, medias, patada = 0, paso, brazos = 'abajo', mirada = 'frente', sonrisa = 'normal', piel = '#D9A47A', pelo = '#2A1A10', ...colocado
}) => {
  const trota = paso !== undefined;
  const s = trota ? Math.sin(paso) : 0;
  const salto = trota ? Math.abs(s) * 5 : 0;
  const brazoIzq = brazos === 'arriba' ? 150 : brazos === 'balance' ? 38 + patada * 20 : 8 + s * 24;
  const brazoDer = brazos === 'arriba' ? -150 : brazos === 'balance' ? -30 - patada * 16 : -8 - s * 24;
  const colorMedias = medias ?? '#F8FAFC';
  const ojoY = mirada === 'abajo' ? 46 : mirada === 'arriba' ? 41 : 44;
  const pierna = (x: number, giro: number, adelante: number) => (
    <g transform={`rotate(${giro} ${x} 118)`}>
      <path d={`M ${x} 118 L ${x + adelante} 147`} stroke={piel} strokeWidth={9.5} strokeLinecap="round" />
      <path d={`M ${x + adelante * 0.66} 137 L ${x + adelante * 0.97} 146`} stroke={colorMedias} strokeWidth={10.5} strokeLinecap="round" />
      <ellipse cx={x + adelante + 2} cy={150.5} rx={8.5} ry={4.6} fill="#111827" />
    </g>
  );
  return (
    <Colocar {...colocado} proporcion={80 / 160} viewBox="0 0 80 160">
      <ellipse cx={40} cy={156} rx={22} ry={4.5} fill="black" opacity={0.3} />
      <g transform={`translate(0 ${-salto})`}>
        {pierna(32, 0, -s * 5)}
        {pierna(48, -patada * 72, s * 5)}
        {/* Brazos */}
        <g transform={`rotate(${brazoIzq} 22 70)`}>
          <path d="M 22 70 L 16 100" stroke={piel} strokeWidth={8} strokeLinecap="round" />
          <path d="M 22 70 L 19 83" stroke={camiseta} strokeWidth={11.5} strokeLinecap="round" />
        </g>
        <g transform={`rotate(${brazoDer} 58 70)`}>
          <path d="M 58 70 L 64 100" stroke={piel} strokeWidth={8} strokeLinecap="round" />
          <path d="M 58 70 L 61 83" stroke={camiseta} strokeWidth={11.5} strokeLinecap="round" />
        </g>
        {/* Pantaloneta y camiseta */}
        <rect x={22} y={103} width={36} height={22} rx={6} fill={numero !== undefined ? '#F8FAFC' : '#1E293B'} />
        <path d="M 21 68 Q 40 60 59 68 L 61 110 L 19 110 Z" fill={camiseta} />
        <path d="M 33 63 Q 40 70 47 63" stroke="white" strokeOpacity={0.75} strokeWidth={3} fill="none" />
        {numero !== undefined && (
          <text x={40} y={98} textAnchor="middle" fontSize={21} fontWeight={900} fill="white">
            {numero}
          </text>
        )}
        {/* Cabeza */}
        <circle cx={40} cy={42} r={18} fill={piel} />
        <path d="M 22 42 Q 20 19 41 21 Q 61 21 58 41 Q 55 30 46 27 Q 36 33 22 42 Z" fill={pelo} />
        <circle cx={34} cy={ojoY} r={2.4} fill="#1F2937" />
        <circle cx={46} cy={ojoY} r={2.4} fill="#1F2937" />
        <circle cx={30.5} cy={49} r={2.6} fill="#F87171" opacity={0.25} />
        <circle cx={49.5} cy={49} r={2.6} fill="#F87171" opacity={0.25} />
        {sonrisa === 'grande' ? (
          <path d="M 34.5 50.5 Q 40 57.5 45.5 50.5 Z" fill="#7C2D12" stroke="#7C2D12" strokeWidth={1.6} strokeLinejoin="round" />
        ) : (
          <path d="M 35 51 Q 40 55 45 51" stroke="#7C2D12" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        )}
      </g>
    </Colocar>
  );
};

/** Mateo, con la camiseta rosada de la Sub-14 y el 7. */
export const Mateo: FC<Omit<Parameters<typeof Nino>[0], 'camiseta'> & { camiseta?: string }> = ({ camiseta = ROSA_SUB14, numero = 7, ...resto }) => (
  <Nino camiseta={camiseta} numero={numero} {...resto} />
);
