// Las piezas 2D del especial «Antes de que parpadees» (van encima del 3D de Explosion3D.tsx):
// el ojo de píxeles que parpadea, el reloj de órdenes de magnitud («t ≈ 3×10⁻⁶ s»), el rótulo de la fase, las barras de
// temperatura (la explosión contra el corazón del Sol), la gráfica del doble destello con su cursor, el anillo 2D de la
// onda de choque y la línea del tiempo logarítmica con las tres físicas y el parpadeo.
// Todo en SVG dentro de un `Lienzo`, salvo `RelojLog`, `ChipFase` y `BarrasTemperatura` (HTML).
import type { FC, ReactNode } from 'react';
import { Brillo, INCANDESCENTE, numeroEs, Potencia } from './Calor';
import { luzAparente, tiempoReal, TIEMPOS_REFERENCIA_S } from './Explosion3D';
import { NOCHE } from './Sueno';
import { bb, letra } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

// --- El ojo ---------------------------------------------------------------------------------------------------------

const ESCLERA = '#F4EFE6';
const ESCLERA_SOMBRA = '#D6CEC0';
const IRIS_OSCURO = '#1A7F98';

type OjoProps = {
  x: number;
  y: number;
  /** Lado de cada cuadrito (px). */
  lado: number;
  /** 1 = abierto, 0 = cerrado. */
  abre: number;
  /** 0–1: un punto blanco que brilla en la pupila. */
  brillo?: number;
  opacidad?: number;
};

const ANCHO_OJO = 15;
const ALTO_OJO = 8;
/** Contorno del ojo (almendra): cuánto se abre en la columna cx. */
const almendra = (cx: number, extra = 0) => Math.max(0, 1 - (cx / (ANCHO_OJO + 0.5 + extra)) ** 2) ** 0.75;

/** Un ojo grande de cuadritos, con piel alrededor, párpado con pestañas, iris cian y pupila. Centro de la pupila en (x, y). */
export const OjoPixeles: FC<OjoProps> = ({ x, y, lado: l, abre, brillo = 0, opacidad = 1 }) => {
  const celdas: ReactNode[] = [];
  const a = limitar(abre);
  for (let i = -ANCHO_OJO - 3; i <= ANCHO_OJO + 3; i++) {
    const arribaPiel = -(ALTO_OJO + 2.4) * almendra(i, 3);
    const abajoPiel = (0.75 * ALTO_OJO + 2.2) * almendra(i, 3);
    const arriba = -ALTO_OJO * almendra(i);
    const abajo = 0.75 * ALTO_OJO * almendra(i);
    const parpado = mezclar(a, abajo, arriba);
    for (let j = -ALTO_OJO - 3; j <= ALTO_OJO; j++) {
      if (j < arribaPiel || j > abajoPiel) continue;
      let c: string;
      const dentro = almendra(i) > 0 && j >= arriba && j <= abajo;
      if (!dentro) c = j < 0 ? NOCHE.piel : NOCHE.pielSombra;
      else if (j < parpado - 0.5) c = NOCHE.piel;
      else if (j < parpado + 0.5) c = NOCHE.pielSombra;
      else {
        const dist = Math.hypot(i, j);
        if (dist < 2.3) c = bb.tinta;
        else if (dist < 3.6) c = bb.cian;
        else if (dist < 4.8) c = IRIS_OSCURO;
        else c = Math.abs(i) > ANCHO_OJO - 4 ? ESCLERA_SOMBRA : ESCLERA;
        if (i === -1 && j === -2) c = '#FFFFFF';
      }
      celdas.push(<rect key={`${i}:${j}`} x={x + (i - 0.5) * l} y={y + (j - 0.5) * l} width={l + 0.5} height={l + 0.5} fill={c} />);
    }
    // Pestañas: dos cuadritos oscuros sobre el borde del párpado, cada tres columnas.
    if (Math.abs(i) <= ANCHO_OJO - 2 && i % 3 === 0 && almendra(i) > 0) {
      const borde = Math.round(mezclar(a, 0.75 * ALTO_OJO * almendra(i), -ALTO_OJO * almendra(i)));
      const lado = i < 0 ? -1 : i > 0 ? 1 : 0;
      celdas.push(<rect key={`p1:${i}`} x={x + (i - 0.5) * l} y={y + (borde - 1.5) * l} width={l} height={l} fill={NOCHE.pelo} />);
      celdas.push(<rect key={`p2:${i}`} x={x + (i - 0.5 + 0.5 * lado) * l} y={y + (borde - 2.5) * l} width={l} height={l} fill={NOCHE.pelo} />);
    }
  }
  return (
    <g opacity={opacidad}>
      <Brillo x={x} y={y} r={(ANCHO_OJO + 6) * l} color={bb.cian} opacidad={0.16} aplastar={0.55} />
      <g shapeRendering="crispEdges">{celdas}</g>
      {brillo > 0 && (
        <>
          <Brillo x={x} y={y} r={l * 9 * brillo} color={INCANDESCENTE} opacidad={brillo} />
          <Brillo x={x} y={y} r={l * 3} color="#FFFFFF" opacidad={brillo} />
        </>
      )}
    </g>
  );
};

// --- Reloj, rótulo de fase y barras de temperatura (HTML) -----------------------------------------------------------------

/** «t ≈ 3×10⁻⁶ s» (una cifra decimal) o «t ≈ 12 s». Recuadro de terminal verde. */
export const RelojLog: FC<{ x: number; y: number; segundos: number; tamano?: number; opacidad?: number; derecha?: boolean }> = ({ x, y, segundos, tamano = 40, opacidad = 1, derecha }) => {
  if (opacidad <= 0) return null;
  let valor: ReactNode;
  if (segundos <= 0) valor = '0 s';
  else if (segundos >= 0.95) valor = `${numeroEs(Math.round(segundos))} s`;
  else {
    let e = Math.floor(Math.log10(segundos));
    let m = Math.round((segundos / 10 ** e) * 10) / 10;
    if (m >= 10) {
      m = 1;
      e += 1;
    }
    const delante = m === 1 ? '' : `${m.toLocaleString('es-CO')}×`;
    valor = <Potencia base={`${delante}10`} exp={`−${-e}`} unidad="s" />;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        ...(derecha ? { right: 1080 - x } : { left: x }),
        padding: '4px 18px',
        background: 'rgba(5,8,15,0.78)',
        border: `2px solid ${bb.verde}66`,
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: tamano,
        color: bb.verde,
        textShadow: `0 0 14px ${bb.verde}66`,
        whiteSpace: 'nowrap',
        opacity: opacidad,
      }}
    >
      {segundos <= 0 ? 't = ' : 't ≈ '}
      {valor}
    </div>
  );
};

/** «FASE 1 · RADIACIÓN»: rótulo chico a la izquierda, con un cuadrito del color de la fase. */
export const ChipFase: FC<{ y: number; texto: string; color: string; aparece: number; x?: number }> = ({ y, texto, color: c, aparece, x = 60 }) =>
  aparece <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x - 30 * (1 - limitar(aparece)),
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 16px',
        background: 'rgba(5,8,15,0.78)',
        border: `2px solid ${c}99`,
        fontFamily: letra.mono,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 2,
        color: c,
        opacity: limitar(aparece * 1.5),
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ width: 16, height: 16, background: c }} />
      {texto}
    </div>
  );

/** Barra de cuadritos que crece hasta `ancho` px (con flecha al final si `flecha`). */
const BarraBloques: FC<{ ancho: number; llena: number; alto: number; color: string; colorFinal?: string; flecha?: boolean }> = ({ ancho, llena, alto, color: c, colorFinal, flecha }) => {
  const BLOQUE = 26;
  const n = Math.floor(ancho / BLOQUE);
  const hasta = Math.round(n * limitar(llena));
  const bloques = [];
  for (let k = 0; k < hasta; k++) {
    bloques.push(<div key={k} style={{ position: 'absolute', left: k * BLOQUE, top: 0, width: BLOQUE - 4, height: alto, background: colorFinal && k > n * 0.45 ? colorFinal : c }} />);
  }
  return (
    <div style={{ position: 'relative', width: ancho + 40, height: alto }}>
      {bloques}
      {flecha && hasta === n && (
        <div style={{ position: 'absolute', left: n * BLOQUE, top: -10, width: 0, height: 0, borderTop: `${alto / 2 + 10}px solid transparent`, borderBottom: `${alto / 2 + 10}px solid transparent`, borderLeft: `30px solid ${colorFinal ?? c}` }} />
      )}
    </div>
  );
};

/** La explosión (decenas de millones de K, barra larga con flecha) contra el corazón del Sol (1,5×10⁷ K). */
export const BarrasTemperatura: FC<{ y: number; explosion: number; sol: number }> = ({ y, explosion, sol }) => {
  const fila = (texto: ReactNode, aparece: number, barra: ReactNode, colorTexto: string) =>
    aparece <= 0 ? null : (
      <div style={{ opacity: limitar(aparece * 2), marginBottom: 18 }}>
        <div style={{ fontFamily: letra.mono, fontWeight: 700, fontSize: 28, letterSpacing: 1, color: colorTexto, marginBottom: 8, whiteSpace: 'nowrap', textShadow: '0 4px 14px rgba(0,0,0,0.8)' }}>{texto}</div>
        {barra}
      </div>
    );
  return (
    <div style={{ position: 'absolute', left: 60, top: y, width: 960, padding: '16px 20px 0', background: `rgba(5,8,15,${0.7 * limitar(explosion * 3)})` }}>
      {fila(<>LA EXPLOSIÓN: DECENAS DE MILLONES DE K</>, explosion, <BarraBloques ancho={860} llena={explosion} alto={30} color={bb.ambar} colorFinal={INCANDESCENTE} flecha />, INCANDESCENTE)}
      {fila(
        <>
          CORAZÓN DEL SOL: <Potencia base="1,5×10" exp={7} unidad="K" />
        </>,
        sol,
        <BarraBloques ancho={286} llena={sol} alto={30} color={bb.ambar} />,
        bb.ambar,
      )}
    </div>
  );
};

// --- Anillo de la onda de choque (SVG) ----------------------------------------------------------------------------------

/** La onda de choque vista encima del 3D: un anillo punteado que gira, con un halo. */
export const AnilloOnda: FC<{ x: number; y: number; r: number; reloj: number; color?: string; opacidad?: number }> = ({ x, y, r, reloj, color: c = bb.terracotaClara, opacidad = 1 }) =>
  r <= 0 || opacidad <= 0 ? null : (
    <g opacity={opacidad}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={30} opacity={0.16} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={8} strokeDasharray="22 10" strokeDashoffset={reloj * 3} opacity={0.9} />
    </g>
  );

// --- Gráfica del doble destello (SVG) -------------------------------------------------------------------------------------

/** Fracción (0–1) del eje logarítmico de 10⁻⁶ s a `hasta` s donde cae el tiempo `s`. */
const enEjeLog = (s: number, hasta: number) => (Math.log10(s) + 6) / (Math.log10(hasta) + 6);

/** Texto SVG «10⁻⁴» (el exponente chico, con tspan). */
const DiezA: FC<{ x: number; y: number; exp: number; tamano?: number; anchor?: 'start' | 'middle' | 'end'; color?: string; sufijo?: string }> = ({ x, y, exp, tamano = 24, anchor = 'middle', color: c = bb.hueso, sufijo = '' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={letra.mono} fontWeight={700} fontSize={tamano} fill={c}>
    {exp === 0 ? `1${sufijo}` : '10'}
    {exp !== 0 && (
      <tspan dy={-tamano * 0.45} fontSize={tamano * 0.62}>
        {`−${-exp}`}
      </tspan>
    )}
    {exp !== 0 && sufijo && <tspan dy={tamano * 0.45}>{sufijo}</tspan>}
  </text>
);

type GraficaProps = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Fase donde va el cursor. */
  cursor: number;
  /** 0–1: el recuadro y la curva aparecen. */
  aparece: number;
  /** 0–1: rótulos del primer y del segundo pulso. */
  primero?: number;
  segundo?: number;
};

const FASE_FIN_GRAFICA = 840;

/** Brillo contra tiempo (eje logarítmico, de 10⁻⁶ s a 1 s): toda la curva de `luzAparente` tenue y, hasta el cursor, en ámbar. */
export const GraficaDestello: FC<GraficaProps> = ({ x, y, ancho, alto, cursor, aparece, primero = 0, segundo = 0 }) => {
  if (aparece <= 0) return null;
  const IZQ = 34;
  const ABAJO = 46;
  const ARRIBA = 40;
  const w = ancho - IZQ - 24;
  const h = alto - ABAJO - ARRIBA;
  const x0 = x + IZQ;
  const y0 = y + alto - ABAJO;
  const px = (p: number) => x0 + enEjeLog(tiempoReal(p), 1) * w;
  const py = (p: number) => y0 - luzAparente(p) * h;
  const puntos = (desde: number, hasta: number) => {
    const lista: string[] = [];
    for (let p = desde; p <= hasta; p += 5) lista.push(`${px(p).toFixed(1)},${py(p).toFixed(1)}`);
    lista.push(`${px(hasta).toFixed(1)},${py(hasta).toFixed(1)}`);
    return lista.join(' ');
  };
  const c = Math.min(FASE_FIN_GRAFICA, Math.max(0, cursor));
  const dibuja = limitar(aparece);
  return (
    <g opacity={limitar(aparece * 2)}>
      <rect x={x} y={y} width={ancho} height={alto} fill="rgba(5,8,15,0.82)" stroke={`${bb.verde}55`} strokeWidth={2} />
      <text x={x + 16} y={y + 30} fontFamily={letra.mono} fontWeight={700} fontSize={22} letterSpacing={2} fill={bb.verde}>
        LUZ QUE SE VE
      </text>
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke={bb.hueso} strokeWidth={3} opacity={0.6} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h} stroke={bb.hueso} strokeWidth={3} opacity={0.6} />
      {[-6, -4, -2, 0].map((e) => (
        <g key={e}>
          <line x1={x0 + ((e + 6) / 6) * w} y1={y0} x2={x0 + ((e + 6) / 6) * w} y2={y0 + 8} stroke={bb.hueso} strokeWidth={3} opacity={0.6} />
          <DiezA x={x0 + ((e + 6) / 6) * w} y={y0 + 34} exp={e} anchor={e === -6 ? 'start' : e === 0 ? 'end' : 'middle'} sufijo=" s" />
        </g>
      ))}
      <defs>
        <clipPath id="destello-dibuja">
          <rect x={x0 - 10} y={y} width={(w + 20) * dibuja} height={alto} />
        </clipPath>
      </defs>
      <g clipPath="url(#destello-dibuja)">
        <polyline points={puntos(0, FASE_FIN_GRAFICA)} fill="none" stroke={bb.hueso} strokeWidth={4} opacity={0.3} strokeLinejoin="round" />
        {c > 0 && <polyline points={puntos(0, c)} fill="none" stroke={bb.ambar} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${bb.ambar})` }} />}
      </g>
      {c > 0 && (
        <g>
          <line x1={px(c)} y1={y0} x2={px(c)} y2={y0 - h - 6} stroke={bb.verde} strokeWidth={3} strokeDasharray="8 6" />
          <rect x={px(c) - 10} y={py(c) - 10} width={20} height={20} fill={INCANDESCENTE} stroke={bb.ambar} strokeWidth={3} />
        </g>
      )}
      {primero > 0 && (
        <text x={px(270)} y={py(270) - 22} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={22} fill={bb.cian} opacity={limitar(primero * 2)}>
          PRIMER PULSO: POCA ENERGÍA
        </text>
      )}
      {segundo > 0 && (
        <text x={px(650) - 14} y={py(650) + 4} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={24} fill={bb.ambar} opacity={limitar(segundo * 2)}>
          SEGUNDO PULSO
        </text>
      )}
    </g>
  );
};

// --- Línea del tiempo de las tres físicas (SVG) ------------------------------------------------------------------------------

const ICONO = 64;

/** Punto blanco con rayitas cian (radiación). */
const IconoRadiacion: FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <Brillo x={x} y={y} r={44} color={bb.cian} opacidad={0.6} />
    {Array.from({ length: 8 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return <rect key={k} x={x + Math.cos(a) * 24 - 5} y={y + Math.sin(a) * 24 - 5} width={10} height={10} fill={bb.cian} />;
    })}
    <rect x={x - 9} y={y - 9} width={18} height={18} fill={INCANDESCENTE} />
  </g>
);

/** Arcos terracota que se abren (onda de choque). */
const IconoChoque: FC<{ x: number; y: number }> = ({ x, y }) => (
  <g fill="none" stroke={bb.terracotaClara} strokeWidth={7}>
    <circle cx={x} cy={y} r={10} fill={bb.ambar} stroke="none" />
    <circle cx={x} cy={y} r={22} strokeDasharray="10 6" />
    <circle cx={x} cy={y} r={34} strokeDasharray="12 7" opacity={0.6} />
  </g>
);

const FILAS_HONGO = ['..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', '.XXXXXXXX.', '...XXXX...', '....XX....', '....XX....', '....XX....', '..XXXXXX..'];
/** Hongo de cuadritos (convección). */
export const HongoPixeles: FC<{ x: number; y: number; lado: number; color?: string; opacidad?: number }> = ({ x, y, lado: l, color: c = bb.ambar, opacidad = 1 }) => (
  <g opacity={opacidad} shapeRendering="crispEdges">
    {FILAS_HONGO.flatMap((fila, j) =>
      fila.split('').map((ch, i) => (ch === 'X' ? <rect key={`${i}:${j}`} x={x + (i - 5) * l} y={y + (j - 4.5) * l} width={l} height={l} fill={j >= 4 && j < 8 ? '#D3BE9F' : j === 8 ? '#D3BE9F' : c} /> : null)),
    )}
  </g>
);

type LineaFasesProps = {
  /** Altura del eje. */
  y: number;
  /** 0–1: cuánto se llena cada banda (radiación, choque, convección). */
  bandas: [number, number, number];
  /** 0–1: la marca del parpadeo. */
  parpadeo: number;
  aparece: number;
  reloj: number;
};

/** Eje logarítmico de 10⁻⁶ s a 60 s con las tres físicas en bandas que se llenan en orden y la marca del parpadeo (0,1 s). */
export const LineaFases: FC<LineaFasesProps> = ({ y, bandas, parpadeo, aparece, reloj }) => {
  if (aparece <= 0) return null;
  const X0 = 90;
  const X1 = 990;
  const T = TIEMPOS_REFERENCIA_S;
  const xs = (s: number) => X0 + enEjeLog(s, T.FIN) * (X1 - X0);
  const ALTO_BANDA = 110;
  const xp = xs(0.1);
  const tramos = [
    { desde: T.RADIACION, hasta: T.CHOQUE_ADELANTA, texto: 'RADIACIÓN', color: bb.cian, Icono: IconoRadiacion },
    { desde: T.CHOQUE_ADELANTA, hasta: T.CONVECCION_INICIO, texto: 'ONDA DE CHOQUE', color: bb.terracotaClara, Icono: IconoChoque },
    { desde: T.CONVECCION_INICIO, hasta: T.FIN, texto: 'CONVECCIÓN', color: bb.ambar, Icono: null },
  ];
  return (
    <g opacity={limitar(aparece * 2)}>
      {tramos.map((b, k) => {
        const a = xs(b.desde);
        const z = xs(b.hasta);
        const lleno = limitar(bandas[k]);
        const cx = (a + z) / 2;
        // El rótulo del choque va antes de la marca del parpadeo, para que la raya no lo cruce.
        const cTexto = k === 1 ? (a + xp) / 2 : cx;
        return (
          <g key={b.texto}>
            <rect x={a + 3} y={y - ALTO_BANDA - 8} width={z - a - 6} height={ALTO_BANDA} fill="none" stroke={b.color} strokeWidth={3} strokeDasharray="10 8" opacity={0.45} />
            {lleno > 0 && (
              <>
                <rect x={a + 3} y={y - ALTO_BANDA - 8} width={(z - a - 6) * lleno} height={ALTO_BANDA} fill={b.color} opacity={0.92} />
                <text x={cTexto} y={y - ALTO_BANDA / 2 + 2} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={k === 1 ? 30 : 25} fill={bb.tinta} opacity={limitar((lleno - 0.6) * 3)}>
                  {b.texto}
                </text>
                <g opacity={limitar((lleno - 0.3) * 2)} transform={`translate(0 ${-8 * (1 - lleno)})`}>
                  {b.Icono ? <b.Icono x={cx} y={y - ALTO_BANDA - 8 - ICONO} /> : <HongoPixeles x={cx} y={y - ALTO_BANDA - 8 - ICONO} lado={9} />}
                </g>
              </>
            )}
          </g>
        );
      })}
      <line x1={X0} y1={y} x2={X1} y2={y} stroke={bb.hueso} strokeWidth={4} opacity={0.8} />
      {[-6, -4, -2, 0].map((e) => (
        <g key={e}>
          <line x1={xs(10 ** e)} y1={y} x2={xs(10 ** e)} y2={y + 12} stroke={bb.hueso} strokeWidth={4} opacity={0.8} />
          <DiezA x={xs(10 ** e)} y={y + 44} exp={e} anchor={e === -6 ? 'start' : 'middle'} tamano={28} sufijo=" s" />
        </g>
      ))}
      <line x1={X1} y1={y} x2={X1} y2={y + 12} stroke={bb.hueso} strokeWidth={4} opacity={0.8} />
      <text x={X1} y={y + 44} textAnchor="end" fontFamily={letra.mono} fontWeight={700} fontSize={28} fill={bb.hueso}>
        60 s
      </text>
      {parpadeo > 0 && (
        <g opacity={limitar(parpadeo * 2)}>
          <line x1={xp} y1={y - ALTO_BANDA - 40} x2={xp} y2={y + 70} stroke={bb.verde} strokeWidth={4} strokeDasharray="10 7" strokeDashoffset={-reloj} />
          <OjoPixeles x={xp} y={y + 122} lado={4} abre={1} />
          <text x={xp} y={y + 196} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={30} fill={bb.verde}>
            PARPADEO ≈ 0,1 s
          </text>
        </g>
      )}
    </g>
  );
};
