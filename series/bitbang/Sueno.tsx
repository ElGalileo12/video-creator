// El sueño en 2D (especial «Despiertas y no puedes moverte», la parálisis del sueño). Todo de píxeles, de noche:
// · `CaraAlmohada`: la cara vista desde arriba, en la almohada, con ojos que se abren de golpe y miran a los lados.
// · `Dormitorio`: el cuarto de lado (ventana con luna, puerta, cama) con la persona acostada boca arriba: abre el ojo,
//   respira, siente un peso en el pecho, se incorpora y se «enciende»; en la puerta puede aparecer una sombra plana.
// · `SombraPixeles`, `Cronometro`, `PersonaChica`, `ManoDedo` (un dedo que se mueve), `Calendario`, `CruzMedica` y los
//   íconos de las causas (`IconoBateria`, `IconoReloj`, `IconoRayo`, `IconoBocaArriba`).
import type { FC, ReactNode } from 'react';
import { random } from 'remotion';
import { Halo } from './Bosque';
import { Pixelado } from './Criaturas';
import { mezclarColor } from './Frio';
import { bb } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (x: number) => {
  const v = limitar(x);
  return v * v * (3 - 2 * v);
};

/** Colores de noche (todo un poco azul, con la luz de la luna). */
export const NOCHE = {
  pared: '#1B2542',
  piso: '#131B30',
  marco: '#2A3350',
  vidrio: '#1B2A4A',
  luna: '#E8EEF8',
  puerta: '#2A3656',
  madera: '#2A2238',
  colchon: '#4A5B88',
  almohada: '#7C88AA',
  sabana: '#24427A',
  sabanaClara: '#2E5290',
  pijama: '#6A86B8',
  piel: '#B98A70',
  pielSombra: '#8E644F',
  pelo: '#231C30',
  sombra: '#04060C',
};

/** Rectángulo de píxeles (borde nítido). */
const R: FC<{ x: number; y: number; w: number; h: number; c: string; o?: number }> = ({ x, y, w, h, c, o }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} opacity={o} shapeRendering="crispEdges" />
);

/** Celdas de una elipse en una grilla de `lado` px (para dibujar círculos de píxeles). */
const celdasElipse = (cx: number, cy: number, rx: number, ry: number, lado: number) => {
  const out: { x: number; y: number }[] = [];
  for (let y = -ry; y < ry; y += lado)
    for (let x = -rx; x < rx; x += lado) {
      const px = x + lado / 2;
      const py = y + lado / 2;
      if ((px / rx) ** 2 + (py / ry) ** 2 <= 1) out.push({ x: cx + x, y: cy + y });
    }
  return out;
};

const Elipse: FC<{ cx: number; cy: number; rx: number; ry: number; lado: number; c: string; o?: number }> = ({ cx, cy, rx, ry, lado, c, o }) => (
  <g fill={c} opacity={o} shapeRendering="crispEdges">
    {celdasElipse(cx, cy, rx, ry, lado).map((p, i) => (
      <rect key={i} x={p.x} y={p.y} width={lado + 0.5} height={lado + 0.5} />
    ))}
  </g>
);

// --- La cara en la almohada (vista desde arriba) ---------------------------------------------------------------

type CaraProps = {
  x: number;
  y: number;
  /** Lado del cuadradito (px); la cara mide ~14 cuadraditos de ancho. */
  lado: number;
  /** 0 = ojos cerrados, 1 = muy abiertos. */
  abre: number;
  /** −1 (izquierda) a 1 (derecha): hacia dónde miran las pupilas. */
  mirada?: number;
  opacidad?: number;
};

/** La cara de quien duerme, vista desde arriba en la almohada, con la sábana hasta el cuello. */
export const CaraAlmohada: FC<CaraProps> = ({ x, y, lado: l, abre, mirada = 0, opacidad = 1 }) => {
  const ojoY = y - l * 0.5;
  const ojos = [x - l * 3.5, x + l * 3.5];
  const cejas = abre * l * 0.8;
  return (
    <g opacity={opacidad}>
      {/* almohada y pelo */}
      <R x={x - l * 13} y={y - l * 11} w={l * 26} h={l * 17} c={NOCHE.almohada} />
      <R x={x - l * 13} y={y - l * 11} w={l * 26} h={l} c="#8E9ABA" />
      <R x={x - l * 13} y={y + l * 5} w={l * 26} h={l} c="#66729A" />
      <Elipse cx={x} cy={y - l * 1.6} rx={l * 8.6} ry={l * 9.4} lado={l} c={NOCHE.pelo} />
      {/* cara y orejas */}
      <Elipse cx={x - l * 7.2} cy={y + l * 0.3} rx={l * 1.4} ry={l * 2} lado={l} c={NOCHE.pielSombra} />
      <Elipse cx={x + l * 7.2} cy={y + l * 0.3} rx={l * 1.4} ry={l * 2} lado={l} c={NOCHE.pielSombra} />
      <Elipse cx={x} cy={y + l * 0.6} rx={l * 7} ry={l * 8.4} lado={l} c={NOCHE.piel} />
      <R x={x - l * 7} y={y - l * 7} w={l * 14} h={l * 2} c={NOCHE.pelo} />
      <R x={x - l * 5} y={y - l * 5} w={l * 2} h={l} c={NOCHE.pelo} />
      <R x={x + l * 3} y={y - l * 5} w={l * 3} h={l} c={NOCHE.pelo} />
      {/* cejas (suben al abrir los ojos) */}
      {ojos.map((ox, i) => (
        <R key={`c${i}`} x={ox - l * 1.5} y={ojoY - l * 2.2 - cejas} w={l * 3} h={l * 0.7} c={NOCHE.pelo} />
      ))}
      {/* ojos: una raya cerrada o el blanco con la pupila */}
      {ojos.map((ox, i) =>
        abre < 0.08 ? (
          <R key={`o${i}`} x={ox - l * 1.5} y={ojoY - l * 0.15} w={l * 3} h={l * 0.5} c={NOCHE.pielSombra} />
        ) : (
          <g key={`o${i}`}>
            <R x={ox - l * 1.5} y={ojoY - l * abre} w={l * 3} h={l * 2 * abre} c={bb.hueso} />
            <R x={ox - l * 0.5 + mirada * l * 0.9} y={ojoY - l * Math.min(1, abre)} w={l} h={l * 2 * Math.min(1, abre)} c={bb.tinta} />
          </g>
        ),
      )}
      {/* nariz y boca */}
      <R x={x - l * 0.5} y={y + l * 1.2} w={l} h={l * 2} c={NOCHE.pielSombra} />
      <R x={x - l * 1.5} y={y + l * 4.6} w={l * 3} h={l * 0.6} c="#7A4A3E" />
      {/* sábana hasta el cuello */}
      <R x={x - l * 13} y={y + l * 6.5} w={l * 26} h={l * 8} c={NOCHE.sabana} />
      <R x={x - l * 13} y={y + l * 6.5} w={l * 26} h={l * 1.2} c={NOCHE.sabanaClara} />
      {abre >= 0.08 && <Halo x={x} y={ojoY} r={l * 9} color={bb.hueso} opacidad={0.1 * abre} aplastar={0.4} />}
    </g>
  );
};

// --- La sombra (silueta plana) ---------------------------------------------------------------------------------

/** Silueta plana de píxeles, de pie, con el borde algo deshilachado. Nada de ojos ni rasgos: solo una forma. */
export const SombraPixeles: FC<{ x: number; base: number; alto: number; aparece: number; borde?: string; color?: string }> = ({
  x, base, alto, aparece, borde, color: c = NOCHE.sombra,
}) => {
  if (aparece <= 0) return null;
  const l = alto / 40;
  const filas: { y: number; mitad: number }[] = [];
  for (let r = 0; r < 40; r++) {
    // cabeza (filas 0–7), cuello, hombros y un cuerpo que se ensancha hacia abajo como un manto
    const mitad = r < 8 ? 3.2 * Math.sqrt(Math.max(0, 1 - ((r - 3.6) / 4.2) ** 2)) : r < 9 ? 1.6 : r < 12 ? 4.2 + (r - 9) * 1.1 : 7.2 + (r - 12) * 0.12;
    filas.push({ y: base - alto + r * l, mitad });
  }
  return (
    <g opacity={Math.min(1, aparece * 1.2)}>
      {borde && <Halo x={x} y={base - alto * 0.55} r={alto * 0.5} color={borde} opacidad={0.25 * aparece} aplastar={1.4} />}
      <g shapeRendering="crispEdges" fill={c}>
        {filas.flatMap(({ y, mitad }, r) => {
          const n = Math.round(mitad);
          return Array.from({ length: 2 * n }, (_, k) => {
            const cx = x + (k - n) * l;
            // los bordes del manto se deshilachan y aparecen de abajo arriba
            const orilla = k === 0 || k === 2 * n - 1;
            if (orilla && random(`sombra-${r}-${k}`) < 0.45) return null;
            if ((40 - r) / 40 > aparece * 1.3) return null;
            return <rect key={`${r}-${k}`} x={cx} y={y} width={l + 0.5} height={l + 0.5} />;
          });
        })}
      </g>
    </g>
  );
};

// --- El cuarto de lado, con la persona acostada --------------------------------------------------------------

export const DORMITORIO = {
  /** Centro de la cabeza (px) y punto de la cadera sobre el que gira al incorporarse. */
  cabeza: { x: 196, y: 1022 },
  cadera: { x: 470, y: 1076 },
  pecho: { x: 330, y: 1030 },
  ojo: { x: 214, y: 1004 },
  puerta: { x: 880, base: 1236, alto: 520 },
  ventana: { x: 380, y: 548, ancho: 230, alto: 220 },
};

type DormitorioProps = {
  /** Reloj (fotogramas) para el brillo de la luna y la respiración. */
  reloj: number;
  /** 0 = ojo cerrado, 1 = abierto (y brilla en la oscuridad). */
  ojo?: number;
  /** 0–1: cuánto sube el pecho al respirar. */
  respira?: number;
  /** 0–1: un peso oscuro aprieta el pecho. */
  peso?: number;
  /** 0–1: la sombra aparece en la puerta. */
  sombra?: number;
  bordeSombra?: string;
  /** 0–1: se incorpora (gira en la cadera). */
  sentado?: number;
  /** 0–1: el cuerpo se «enciende» en ámbar de la cabeza a los pies. */
  enciende?: number;
  opacidad?: number;
};

export const Dormitorio: FC<DormitorioProps> = ({ reloj, ojo = 0, respira = 0, peso = 0, sombra = 0, bordeSombra, sentado = 0, enciende = 0, opacidad = 1 }) => {
  const D = DORMITORIO;
  const v = D.ventana;
  const luz = (xc: number) => suave((enciende * 820 - (xc - 120)) / 140);
  const tono = (base: string, xc: number) => (enciende > 0 ? mezclarColor(base, bb.ambar, 0.75 * luz(xc)) : base);
  const pechoSube = respira * 10;
  const giro = 78 * suave(sentado);
  return (
    <g opacity={opacidad}>
      {/* pared, piso y marco del cuadro */}
      <R x={50} y={480} w={980} h={820} c={NOCHE.pared} />
      <R x={50} y={1236} w={980} h={64} c={NOCHE.piso} />
      {/* ventana con la luna */}
      <R x={v.x - 12} y={v.y - 12} w={v.ancho + 24} h={v.alto + 24} c={NOCHE.marco} />
      <R x={v.x} y={v.y} w={v.ancho} h={v.alto} c={NOCHE.vidrio} />
      <Elipse cx={v.x + v.ancho * 0.7} cy={v.y + v.alto * 0.3} rx={30} ry={30} lado={10} c={NOCHE.luna} o={0.85 + 0.1 * Math.sin(reloj / 20)} />
      <R x={v.x + v.ancho / 2 - 6} y={v.y} w={12} h={v.alto} c={NOCHE.marco} />
      <R x={v.x} y={v.y + v.alto / 2 - 6} w={v.ancho} h={12} c={NOCHE.marco} />
      <polygon points={`${v.x},${v.y + v.alto} ${v.x + v.ancho},${v.y + v.alto} ${v.x + 160},1100 ${v.x - 230},1100`} fill="#9FB8E0" opacity={0.11} />
      {/* puerta (el pasillo apenas iluminado) y la sombra */}
      <R x={D.puerta.x - 92} y={D.puerta.base - D.puerta.alto - 16} w={184} h={D.puerta.alto + 16} c={NOCHE.marco} />
      <R x={D.puerta.x - 80} y={D.puerta.base - D.puerta.alto} w={160} h={D.puerta.alto} c={NOCHE.puerta} />
      <SombraPixeles x={D.puerta.x} base={D.puerta.base} alto={D.puerta.alto * 0.86} aparece={sombra} borde={bordeSombra} />
      {/* cama */}
      <R x={70} y={950} w={30} h={290} c={NOCHE.madera} />
      <R x={100} y={1080} w={660} h={48} c={NOCHE.colchon} />
      <R x={100} y={1128} w={660} h={30} c={NOCHE.madera} />
      <R x={110} y={1158} w={20} h={80} c={NOCHE.madera} />
      <R x={730} y={1158} w={20} h={80} c={NOCHE.madera} />
      <R x={112} y={1046} w={150} h={36} c={NOCHE.almohada} />
      {/* la persona: cabeza y torso giran en la cadera al incorporarse */}
      <g transform={`rotate(${giro} ${D.cadera.x} ${D.cadera.y})`}>
        {/* torso (pijama) con el pecho que sube y baja */}
        <R x={226} y={1018 - pechoSube} w={250} h={62 + pechoSube} c={tono(NOCHE.pijama, 350)} />
        <R x={226} y={1018 - pechoSube} w={250} h={6} c={tono('#8AA4D2', 350)} />
        {/* brazo apoyado sobre el cuerpo */}
        <R x={252} y={1044 - pechoSube * 0.6} w={150} h={20} c={tono('#56709E', 330)} />
        <R x={402} y={1042 - pechoSube * 0.3} w={34} h={22} c={tono(NOCHE.piel, 420)} />
        {/* peso en el pecho */}
        {peso > 0 && (
          <g>
            <R x={268} y={1018 - pechoSube - 70 * peso} w={130} h={70 * peso} c={NOCHE.sombra} o={0.85} />
            {[300, 366].map((ax) => (
              <g key={ax} opacity={Math.min(1, peso * 1.5)} transform={`translate(0 ${-22 - pechoSube - 70 * peso - 70})`}>
                <R x={ax - 6} y={1040} w={12} h={30} c={bb.ambar} />
                <R x={ax - 18} y={1070} w={36} h={12} c={bb.ambar} />
                <R x={ax - 6} y={1082} w={12} h={10} c={bb.ambar} />
              </g>
            ))}
          </g>
        )}
        {/* cabeza de lado, mirando arriba */}
        <Elipse cx={D.cabeza.x} cy={D.cabeza.y} rx={40} ry={36} lado={8} c={tono(NOCHE.piel, 196)} />
        <Elipse cx={D.cabeza.x - 14} cy={D.cabeza.y + 6} rx={30} ry={30} lado={8} c={NOCHE.pelo} />
        <R x={D.cabeza.x + 20} y={D.cabeza.y - 44} w={12} h={10} c={tono(NOCHE.piel, 210)} />
        <R x={D.cabeza.x + 4} y={D.cabeza.y + 20} w={14} h={10} c={tono(NOCHE.pielSombra, 200)} />
        {ojo < 0.1 ? (
          <R x={D.ojo.x - 8} y={D.ojo.y} w={16} h={4} c={NOCHE.pielSombra} />
        ) : (
          <g>
            <Halo x={D.ojo.x} y={D.ojo.y} r={34} color={bb.hueso} opacidad={0.35 * ojo} />
            <R x={D.ojo.x - 8} y={D.ojo.y - 5 * ojo} w={16} h={10 * ojo} c={bb.hueso} />
            <R x={D.ojo.x - 2} y={D.ojo.y - 4 * ojo} w={6} h={8 * ojo} c={bb.tinta} />
          </g>
        )}
      </g>
      {/* sábana sobre las piernas, con los pies que asoman como un bulto */}
      <R x={450} y={1052} w={300} h={30} c={tono(NOCHE.sabana, 600)} />
      <R x={450} y={1052} w={300} h={6} c={tono(NOCHE.sabanaClara, 600)} />
      <R x={700} y={1030} w={44} h={24} c={tono(NOCHE.sabana, 720)} />
    </g>
  );
};

// --- Cronómetro, personas, mano, calendario, cruz ----------------------------------------------------------------

/** Cronómetro de píxeles: aro, botón y una aguja que da `vueltas` (puede ser fraccionaria). */
export const Cronometro: FC<{ x: number; y: number; r: number; vueltas: number; color?: string; arco?: number; opacidad?: number }> = ({
  x, y, r, vueltas, color: c = bb.hueso, arco = 0, opacidad = 1,
}) => {
  const l = r / 9;
  const ang = vueltas * Math.PI * 2 - Math.PI / 2;
  const marcas = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <R x={x - l * 1.5} y={y - r - l * 3} w={l * 3} h={l * 2} c={c} />
      <R x={x - l * 0.75} y={y - r - l * 1.2} w={l * 1.5} h={l * 1.4} c={c} />
      {celdasElipse(x, y, r, r, l)
        .filter((p) => {
          const d = Math.hypot(p.x + l / 2 - x, p.y + l / 2 - y);
          return d > r - l * 1.2;
        })
        .map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={l + 0.5} height={l + 0.5} fill={c} />
        ))}
      {arco > 0 &&
        celdasElipse(x, y, r - l * 1.6, r - l * 1.6, l)
          .filter((p) => {
            const a = (Math.atan2(p.y + l / 2 - y, p.x + l / 2 - x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
            return a <= arco * Math.PI * 2;
          })
          .map((p, i) => <rect key={`a${i}`} x={p.x} y={p.y} width={l + 0.5} height={l + 0.5} fill={bb.cian} opacity={0.35} />)}
      {marcas.map((a, i) => (
        <rect key={`m${i}`} x={x + Math.cos(a) * (r - l * 2.4) - l / 2} y={y + Math.sin(a) * (r - l * 2.4) - l / 2} width={l} height={l} fill={c} opacity={0.6} />
      ))}
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={`g${k}`} x={x + Math.cos(ang) * k * l - l / 2} y={y + Math.sin(ang) * k * l - l / 2} width={l} height={l} fill={bb.ambar} />
      ))}
      <R x={x - l} y={y - l} w={l * 2} h={l * 2} c={bb.ambar} />
    </g>
  );
};

const PERSONA_CHICA = ['.XXX.', '.XXX.', '.....', 'XXXXX', 'XXXXX', 'XXXXX', '.X.X.', '.X.X.', '.X.X.'];
export const ALTO_PERSONA_CHICA = PERSONA_CHICA.length;

/** Persona chiquita de píxeles (5 × 9 cuadros), centrada en x y parada sobre `base`. `brillo` 0–1 le pone un halo. */
export const PersonaChica: FC<{ x: number; base: number; lado: number; color: string; brillo?: number; opacidad?: number }> = ({ x, base, lado, color: c, brillo = 0, opacidad = 1 }) => (
  <g opacity={opacidad}>
    {brillo > 0 && <Halo x={x} y={base - lado * 4.5} r={lado * 7} color={c} opacidad={0.45 * brillo} />}
    <Pixelado filas={PERSONA_CHICA} paleta={{ X: c }} x={x} y={base - (PERSONA_CHICA.length * lado) / 2} lado={lado} />
  </g>
);

/** Mano de píxeles abierta con los dedos hacia arriba. `dedo` 0–1 dobla el índice (para «mover un dedo»). */
export const ManoDedo: FC<{ x: number; y: number; lado: number; dedo: number; color?: string; opacidad?: number }> = ({ x, y, lado: l, dedo, color: c = NOCHE.piel, opacidad = 1 }) => {
  const borde = NOCHE.pielSombra;
  // dedos: [columna, alto en cuadros]; el índice es el primero
  const dedos: [number, number][] = [
    [-3, 6],
    [-1, 7],
    [1, 6],
    [3, 4.5],
  ];
  const palma = { x: x - l * 4, y: y - l * 3, w: l * 8, h: l * 7 };
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {dedos.map(([col, alto], i) => {
        const a = i === 0 ? alto - 3.2 * dedo : alto;
        const fx = x + col * l - l;
        return (
          <g key={i}>
            <rect x={fx} y={palma.y - a * l} width={l * 2} height={a * l + l} fill={c} />
            <rect x={fx} y={palma.y - a * l} width={l * 2} height={l * 0.6} fill="#D9B39A" />
            <rect x={fx + l * 1.7} y={palma.y - a * l} width={l * 0.3} height={a * l} fill={borde} />
          </g>
        );
      })}
      {/* pulgar hacia un lado */}
      <rect x={palma.x - l * 2.4} y={palma.y + l * 1.6} width={l * 2.6} height={l * 2} fill={c} />
      <rect x={palma.x - l * 3.4} y={palma.y + l * 0.6} width={l * 1.6} height={l * 2} fill={c} />
      <rect x={palma.x} y={palma.y} width={palma.w} height={palma.h} fill={c} />
      <rect x={palma.x} y={palma.y + palma.h - l * 0.6} width={palma.w} height={l * 0.6} fill={borde} />
      <rect x={palma.x + l * 1.5} y={palma.y + palma.h} width={palma.w - l * 3} height={l * 2.5} fill={c} />
    </g>
  );
};

/** Calendario de un mes (7 × 4 días). `marcas` = días marcados con una X (0–27) que aparecen según `aparece` (0–1). */
export const Calendario: FC<{ x: number; y: number; dia: number; marcas: number[]; aparece: number; opacidad?: number }> = ({ x, y, dia, marcas, aparece, opacidad = 1 }) => {
  const ancho = dia * 7;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <rect x={x - ancho / 2 - 8} y={y - dia * 0.9} width={ancho + 16} height={dia * 4 + dia * 0.9 + 8} fill={bb.noche} stroke={bb.verde} strokeOpacity={0.5} strokeWidth={4} />
      <rect x={x - ancho / 2 - 8} y={y - dia * 0.9} width={ancho + 16} height={dia * 0.6} fill={bb.terracota} />
      {Array.from({ length: 28 }, (_, i) => {
        const cx = x - ancho / 2 + (i % 7) * dia;
        const cy = y + Math.floor(i / 7) * dia;
        const k = marcas.indexOf(i);
        const sale = k < 0 ? 0 : limitar(aparece * marcas.length - k);
        return (
          <g key={i}>
            <rect x={cx + 4} y={cy + 4} width={dia - 8} height={dia - 8} fill={bb.nocheClara} />
            {sale > 0 && (
              <g opacity={sale} transform={`translate(${cx + dia / 2} ${cy + dia / 2}) scale(${0.6 + 0.4 * sale})`}>
                <rect x={-dia * 0.32} y={-dia * 0.07} width={dia * 0.64} height={dia * 0.14} fill={bb.terracotaClara} transform="rotate(45)" />
                <rect x={-dia * 0.32} y={-dia * 0.07} width={dia * 0.64} height={dia * 0.14} fill={bb.terracotaClara} transform="rotate(-45)" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Cruz de salud (un «+» de píxeles) centrada en (x, y). */
export const CruzMedica: FC<{ x: number; y: number; lado: number; aparece: number; color?: string }> = ({ x, y, lado: l, aparece, color: c = bb.verde }) =>
  aparece <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * aparece}) translate(${-x} ${-y})`} opacity={Math.min(1, aparece * 1.5)}>
      <Halo x={x} y={y} r={l * 7} color={c} opacidad={0.35} />
      <R x={x - l * 1.5} y={y - l * 4.5} w={l * 3} h={l * 9} c={c} />
      <R x={x - l * 4.5} y={y - l * 1.5} w={l * 9} h={l * 3} c={c} />
    </g>
  );

// --- Íconos de las causas (para tarjetas) ----------------------------------------------------------------------

const Icono: FC<{ filas: string[]; paleta: Record<string, string>; lado: number }> = ({ filas, paleta, lado }) => (
  <svg width={filas[0].length * lado} height={filas.length * lado} style={{ display: 'block' }}>
    <Pixelado filas={filas} paleta={paleta} x={(filas[0].length * lado) / 2} y={(filas.length * lado) / 2} lado={lado} />
  </svg>
);

export const IconoBateria: FC<{ lado: number }> = ({ lado }) => (
  <Icono lado={lado} filas={['XXXXXXXXX.', 'X.......X.', 'XRR.....XX', 'XRR.....XX', 'X.......X.', 'XXXXXXXXX.']} paleta={{ X: bb.verde, R: bb.terracotaClara }} />
);
export const IconoReloj: FC<{ lado: number }> = ({ lado }) => (
  <Icono lado={lado} filas={['..XXXXX..', '.X.....X.', 'X...H...X', 'X...H...X', 'X...HHH.X', 'X.......X', '.X.....X.', '..XXXXX..']} paleta={{ X: bb.verde, H: bb.ambar }} />
);
export const IconoRayo: FC<{ lado: number }> = ({ lado }) => (
  <Icono lado={lado} filas={['...XXXX', '..XXXX.', '.XXXX..', 'XXXXXXX', '..XXXX.', '.XXXX..', 'XXX....', 'X......']} paleta={{ X: bb.ambar }} />
);
export const IconoBocaArriba: FC<{ lado: number }> = ({ lado }) => (
  <Icono
    lado={lado}
    filas={['..A.........', '.AAA........', '..A.........', '.HH.........', 'HHHH........', 'HHHHXXXXXXXX', '.HH.XXXXXXXX', 'BBBBBBBBBBBB']}
    paleta={{ A: bb.ambar, H: NOCHE.piel, X: '#4C6CA0', B: bb.verde }}
  />
);

/** Ojo de píxeles (para una tarjeta): el blanco y la pupila que va de un lado a otro con `mirada` −1–1. */
export const IconoOjo: FC<{ lado: number; mirada: number }> = ({ lado: l, mirada }) => (
  <svg width={l * 9} height={l * 5} style={{ display: 'block' }} shapeRendering="crispEdges">
    <rect x={l} y={0} width={l * 7} height={l * 5} fill={bb.hueso} />
    <rect x={0} y={l} width={l * 9} height={l * 3} fill={bb.hueso} />
    <rect x={l * (3.5 + 2.2 * mirada)} y={l} width={l * 2} height={l * 3} fill={bb.tinta} />
  </svg>
);

/** Pecho con flechas que aprietan (para una tarjeta). */
export const IconoPecho: FC<{ lado: number; aprieta: number }> = ({ lado: l, aprieta }) => (
  <svg width={l * 10} height={l * 8} style={{ display: 'block' }} shapeRendering="crispEdges">
    <rect x={0} y={l * 5} width={l * 10} height={l * 3} fill="#4C6CA0" />
    {[2, 7].map((cx) => (
      <g key={cx} transform={`translate(0 ${aprieta * l})`}>
        <rect x={l * (cx - 0.5)} y={0} width={l} height={l * 2.5} fill={bb.ambar} />
        <rect x={l * (cx - 1.5)} y={l * 2.5} width={l * 3} height={l} fill={bb.ambar} />
        <rect x={l * (cx - 0.5)} y={l * 3.5} width={l} height={l} fill={bb.ambar} />
      </g>
    ))}
  </svg>
);

/** Silueta chiquita (para una tarjeta). */
export const IconoSombra: FC<{ lado: number }> = ({ lado }) => (
  <Icono lado={lado} filas={['..XXX..', '.XXXXX.', '..XXX..', '.XXXXX.', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX']} paleta={{ X: bb.terracotaClara }} />
);

/** Tarjeta con un ícono a la izquierda y un texto (HTML, encima del dibujo). Entra con `aparece` 0–1 desde un lado. */
export const TarjetaIcono: FC<{ x: number; y: number; ancho: number; texto: string; color: string; aparece: number; icono: ReactNode; fuente: string; tamano?: number }> = ({
  x, y, ancho, texto, color: c, aparece, icono, fuente, tamano = 44,
}) =>
  aparece <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: ancho,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '16px 26px',
        background: 'rgba(5,8,15,0.86)',
        border: `3px solid ${c}`,
        boxShadow: `6px 6px 0 ${c}44`,
        fontFamily: fuente,
        fontWeight: 700,
        fontSize: tamano,
        letterSpacing: 2,
        color: c,
        textShadow: `0 0 14px ${c}55`,
        opacity: Math.min(1, aparece * 1.6),
        transform: `translateX(${(1 - aparece) * 140}px) scale(${0.85 + 0.15 * aparece})`,
        transformOrigin: 'left center',
      }}
    >
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 110 }}>{icono}</div>
      <div style={{ lineHeight: 1.1 }}>{texto}</div>
    </div>
  );
