// La materia cerca del cero absoluto (especial «El lugar más frío del universo»): el condensado de Bose-Einstein
// (puntos que se juntan en una sola onda), el helio superfluido que trepa por las paredes del vaso, el imán que flota
// sobre un superconductor y la torre de caída libre de Bremen con su cápsula. En SVG, dentro de un `Lienzo`.
import type { FC } from 'react';
import { Easing, random } from 'remotion';
import { Halo } from './Bosque';
import { CuboIso } from './Atomo';
import { HIELO } from './Frio';
import { bb, letra } from './tema';

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

// --- Condensado de Bose-Einstein ----------------------------------------------------------------------------------

type CondensadoProps = {
  cx: number;
  cy: number;
  /** Rectángulo (centrado en cx, cy) donde andan sueltos al principio. */
  ancho: number;
  alto: number;
  cantidad: number;
  reloj: number;
  /** 0–1: se juntan en el centro. */
  junta: number;
  /** 0–1: dejan de verse como puntos y son una sola onda brillante. */
  une: number;
  /** Tamaño de la onda. */
  radio?: number;
  semilla?: string;
};

export const Condensado: FC<CondensadoProps> = ({ cx, cy, ancho, alto, cantidad, reloj, junta, une, radio = 190, semilla = 'condensado' }) => {
  const j = Easing.inOut(Easing.cubic)(limitar(junta));
  const puntos = 1 - limitar(une * 1.4);
  // Paquete de onda: una sinusoide con envolvente de campana que late.
  const onda = Array.from({ length: 121 }, (_, k) => {
    const u = (k - 60) / 60;
    const x = cx + u * radio * 1.9;
    const y = cy + Math.exp(-u * u * 4.5) * Math.sin(u * 13 - reloj * 0.35) * radio * 0.32 * une;
    return `${k === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      {une > 0 && (
        <g>
          <Halo x={cx} y={cy} r={radio * (1.1 + 0.08 * Math.sin(reloj / 5)) * une} color={bb.cian} opacidad={0.7 * une} />
          {[0, 1, 2].map((k) => {
            const t = ((reloj * 1.6 + k * 40) % 120) / 120;
            return <circle key={k} cx={cx} cy={cy} r={radio * (0.3 + 1.1 * t)} fill="none" stroke={bb.cian} strokeWidth={5} opacity={0.5 * (1 - t) * une} />;
          })}
          <ellipse cx={cx} cy={cy} rx={radio * 0.32 * une} ry={radio * 0.32 * une} fill={HIELO} opacity={0.9 * une} />
          <path d={onda} fill="none" stroke={HIELO} strokeWidth={8} strokeLinecap="round" opacity={une} />
        </g>
      )}
      {puntos > 0 && (
        <g shapeRendering="crispEdges" opacity={puntos}>
          {Array.from({ length: cantidad }, (_, i) => {
            const r = (k: string) => random(`${semilla}-${i}-${k}`);
            const sx = cx + (r('x') - 0.5) * ancho;
            const sy = cy + (r('y') - 0.5) * alto;
            // Al juntarse quedan en un disco chico alrededor del centro.
            const a = r('a') * Math.PI * 2;
            const d = Math.sqrt(r('d')) * radio * 0.45;
            const ex = cx + Math.cos(a + reloj * 0.08) * d;
            const ey = cy + Math.sin(a + reloj * 0.08) * d;
            const temblor = 9 * (1 - j);
            const x = mezclar(j, sx, ex) + temblor * Math.sin(reloj * (0.9 + r('f')) + r('p') * 6.28);
            const y = mezclar(j, sy, ey) + temblor * Math.cos(reloj * (0.8 + r('g')) + r('q') * 6.28);
            const lado = 9 + Math.round(r('t') * 5);
            return <rect key={i} x={x - lado / 2} y={y - lado / 2} width={lado} height={lado} fill={r('c') < 0.75 ? bb.cian : HIELO} opacity={0.65 + 0.35 * r('o')} />;
          })}
        </g>
      )}
    </g>
  );
};

// --- Helio superfluido --------------------------------------------------------------------------------------------

type VasoProps = {
  /** Centro del vaso y el fondo (y). */
  x: number;
  base: number;
  ancho: number;
  alto: number;
  /** 0–1: altura del helio adentro. */
  nivel: number;
  /** 0–1: la película sube por dentro (0–0.45), cruza el borde (0.45–0.55) y baja por fuera (0.55–1). */
  trepa: number;
  /** Fotograma desde que cuelgan gotas por debajo (con `reloj`). */
  gotasDesde?: number;
  reloj: number;
  lado?: number;
  opacidad?: number;
};

export const VasoSuperfluido: FC<VasoProps> = ({ x, base, ancho, alto, nivel, trepa, gotasDesde, reloj, lado: l = 10, opacidad = 1 }) => {
  const vidrio = '#6F7FA8';
  const izq = x - ancho / 2;
  const der = x + ancho / 2;
  const borde = base - alto;
  const superficie = base - l - (alto - 2 * l) * limitar(nivel);
  const t = limitar(trepa);
  const dentro = limitar(t / 0.45);
  const cruza = limitar((t - 0.45) / 0.1);
  const fuera = limitar((t - 0.55) / 0.45);
  const yDentro = mezclar(dentro, superficie, borde);
  const yFuera = mezclar(fuera, borde, base);
  const helio = bb.cian;
  const pelicula = '#9FF6FF';
  const gotas = [];
  if (gotasDesde !== undefined && reloj >= gotasDesde) {
    for (const lado of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const ciclo = 26;
        const edad = (reloj - gotasDesde + k * 9 + (lado > 0 ? 5 : 0)) % ciclo;
        if (reloj - gotasDesde < k * 9) continue;
        const gx = lado < 0 ? izq - l : der;
        const gy = base + 0.5 * 0.9 * edad * edad;
        gotas.push(<rect key={`${lado}-${k}`} x={gx} y={gy} width={l} height={l * 1.4} fill={pelicula} opacity={1 - edad / ciclo} />);
      }
    }
  }
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      <Halo x={x} y={superficie + (base - superficie) / 2} r={ancho * 0.75} color={bb.cian} opacidad={0.25} aplastar={0.7} />
      <rect x={izq + l} y={superficie} width={ancho - 2 * l} height={base - l - superficie} fill={helio} opacity={0.85} />
      <rect x={izq + l} y={superficie} width={ancho - 2 * l} height={l * 0.6} fill={HIELO} opacity={0.8} />
      {/* Paredes y fondo del vaso */}
      <rect x={izq} y={borde} width={l} height={alto} fill={vidrio} opacity={0.7} />
      <rect x={der - l} y={borde} width={l} height={alto} fill={vidrio} opacity={0.7} />
      <rect x={izq} y={base - l} width={ancho} height={l} fill={vidrio} opacity={0.7} />
      <rect x={izq + 1.6 * l} y={borde + 2 * l} width={l * 0.5} height={alto * 0.55} fill="#FFFFFF" opacity={0.12} />
      {/* La película que trepa, más clara que el helio y con brillo para que se vea sobre el vidrio */}
      {t > 0 && (
        <g fill={pelicula} style={{ filter: `drop-shadow(0 0 ${l}px ${bb.cian})` }}>
          <rect x={izq + l} y={yDentro} width={l * 0.7} height={superficie - yDentro} />
          <rect x={der - 1.7 * l} y={yDentro} width={l * 0.7} height={superficie - yDentro} />
          {cruza > 0 && (
            <>
              <rect x={izq - l * 0.7 + (1 - cruza) * 1.7 * l} y={borde - l * 0.7} width={(l * 2.4) * cruza} height={l * 0.7} />
              <rect x={der - l} y={borde - l * 0.7} width={(l * 2.4) * cruza} height={l * 0.7} />
            </>
          )}
          {fuera > 0 && (
            <>
              <rect x={izq - l * 0.7} y={borde - l * 0.7} width={l * 0.7} height={yFuera - borde + l * 0.7} />
              <rect x={der} y={borde - l * 0.7} width={l * 0.7} height={yFuera - borde + l * 0.7} />
            </>
          )}
        </g>
      )}
      {gotas}
    </g>
  );
};

// --- Imán que flota sobre un superconductor -----------------------------------------------------------------------

const CARAS_IMAN = { arriba: '#E07A45', izquierda: '#C4572A', derecha: '#8E3D1E' };

type ImanProps = {
  /** Centro de la cara de arriba del disco. */
  x: number;
  y: number;
  ancho: number;
  /** 0–1: el imán se separa del disco y flota. */
  sube: number;
  /** 0–1: líneas de campo. */
  campo?: number;
  reloj: number;
  lado?: number;
  opacidad?: number;
};

/** Dónde queda el imán (centro de su cara de abajo, aprox.) para una altura `sube`. */
export const posicionIman = (x: number, y: number, lado: number, sube: number, reloj: number) => ({
  x,
  y: y - lado * 0.95 - sube * lado * 1.1 - sube * Math.sin(reloj / 7) * 7,
});

export const ImanLevita: FC<ImanProps> = ({ x, y, ancho, sube, campo = 0, reloj, lado = 110, opacidad = 1 }) => {
  const ry = ancho * 0.17;
  const grosor = 46;
  const iman = posicionIman(x, y, lado, sube, reloj);
  const vapor = Array.from({ length: 26 }, (_, k) => {
    const r = (s: string) => random(`iman-vapor-${k}-${s}`);
    const ciclo = 40 + r('c') * 30;
    const edad = (reloj + r('e') * ciclo) % ciclo;
    const a = r('a') * Math.PI * 2;
    const px = x + Math.cos(a) * (ancho / 2) * (0.9 + edad / ciclo * 0.5);
    const py = y + Math.sin(a) * ry + edad * 1.6;
    const t = 8 + r('t') * 10;
    return <rect key={k} x={px - t / 2} y={py} width={t} height={t} fill={HIELO} opacity={0.4 * (1 - edad / ciclo)} />;
  });
  const lineas = [1, 2, 3].map((k) => {
    const abajo = iman.y + lado * 0.15;
    const arriba = iman.y - lado * 1.55;
    const a = 70 + k * 62;
    const desfase = -reloj * 2.2;
    const curva = (s: number) => `M ${x} ${arriba} C ${x + s * a} ${arriba - 40 * k} ${x + s * a * 1.15} ${abajo + 4} ${x + s * lado * 0.9} ${abajo + 6}`;
    return (
      <g key={k} opacity={campo * (1 - k * 0.15)}>
        <path d={curva(-1)} fill="none" stroke={bb.verde} strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={desfase} />
        <path d={curva(1)} fill="none" stroke={bb.verde} strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={desfase} />
      </g>
    );
  });
  return (
    <g opacity={opacidad}>
      <Halo x={x} y={y} r={ancho * 0.7} color={bb.cian} opacidad={0.25} aplastar={0.35} />
      <path d={`M ${x - ancho / 2} ${y} L ${x - ancho / 2} ${y + grosor} A ${ancho / 2} ${ry} 0 0 0 ${x + ancho / 2} ${y + grosor} L ${x + ancho / 2} ${y} Z`} fill="#141C30" />
      <ellipse cx={x} cy={y} rx={ancho / 2} ry={ry} fill="#22324F" stroke={bb.cian} strokeWidth={5} />
      <ellipse cx={x} cy={y} rx={ancho / 2 - 26} ry={ry - 9} fill="none" stroke={HIELO} strokeWidth={2} opacity={0.35} />
      <g shapeRendering="crispEdges">{vapor}</g>
      <ellipse cx={x} cy={y} rx={lado * (0.9 - 0.2 * sube)} ry={lado * 0.26 * (0.9 - 0.2 * sube)} fill="#05080F" opacity={0.55 - 0.3 * sube} />
      {campo > 0 && lineas}
      <CuboIso x={iman.x} y={iman.y - lado * 0.45} lado={lado * 0.9} caras={CARAS_IMAN} />
      <text x={iman.x} y={iman.y - lado * 0.95} textAnchor="middle" fontFamily={letra.mono} fontWeight={700} fontSize={lado * 0.32} fill={bb.hueso} opacity={0.9}>
        N
      </text>
    </g>
  );
};

// --- Torre de caída libre -----------------------------------------------------------------------------------------

/** Por dónde cae la cápsula dentro de la torre: de `arriba` a `abajo` (y del centro de la cápsula). */
export const tuboTorre = (arriba: number, suelo: number) => ({ arriba: arriba + 110, abajo: suelo - 150 });

export const TorreCaida: FC<{ x: number; arriba: number; suelo: number; ancho: number; aparece?: number; opacidad?: number }> = ({ x, arriba, suelo, ancho, aparece = 1, opacidad = 1 }) => {
  if (aparece <= 0) return null;
  const alto = (suelo - arriba) * Math.min(1, aparece);
  const top = suelo - alto;
  const cupula = 120;
  const w = ancho / 2;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {/* Edificio de la base */}
      <rect x={x - w * 2.6} y={suelo - 90} width={w * 5.2} height={90} fill="#1E2740" />
      {[-1.9, -1.2, 1.2, 1.9].map((k) => (
        <rect key={k} x={x + k * w - 12} y={suelo - 62} width={24} height={30} fill={bb.ambar} opacity={0.5} />
      ))}
      {/* Columna */}
      <rect x={x - w} y={top + cupula} width={ancho} height={Math.max(0, alto - cupula)} fill="#2E3858" />
      <rect x={x + w * 0.45} y={top + cupula} width={w * 0.55} height={Math.max(0, alto - cupula)} fill="#3B4770" />
      <rect x={x - w * 0.42} y={top + cupula - 10} width={w * 0.84} height={Math.max(0, alto - cupula - 60)} fill="#0B0F1A" opacity={0.85} />
      {Array.from({ length: Math.max(0, Math.floor((alto - cupula - 100) / 70)) }, (_, k) => (
        <rect key={k} x={x - w * 0.85} y={top + cupula + 40 + k * 70} width={w * 0.3} height={14} fill="#55628A" />
      ))}
      {/* Cúpula de vidrio arriba */}
      <rect x={x - w * 1.5} y={top + 22} width={w * 3} height={cupula - 22} fill={bb.cian} opacity={0.22} />
      <rect x={x - w * 1.5} y={top + 22} width={w * 3} height={8} fill={bb.hueso} opacity={0.8} />
      <rect x={x - w * 1.5} y={top + cupula - 8} width={w * 3} height={8} fill={bb.hueso} opacity={0.8} />
      <rect x={x - w * 1.5} y={top + 22} width={8} height={cupula - 22} fill={bb.hueso} opacity={0.8} />
      <rect x={x + w * 1.5 - 8} y={top + 22} width={8} height={cupula - 22} fill={bb.hueso} opacity={0.8} />
      <rect x={x - w * 1.1} y={top} width={w * 2.2} height={24} fill="#3B4770" />
      <rect x={x - 3} y={top - 50} width={6} height={50} fill={bb.hueso} opacity={0.7} />
      <rect x={x - 6} y={top - 56} width={12} height={10} fill={bb.terracotaClara} />
    </g>
  );
};

/** La cápsula del experimento: un cilindro con una ventanita donde se ve la nube de átomos. */
export const CapsulaCaida: FC<{ x: number; y: number; ancho: number; estela?: number; opacidad?: number }> = ({ x, y, ancho, estela = 0, opacidad = 1 }) => {
  const alto = ancho * 1.9;
  return (
    <g opacity={opacidad} shapeRendering="crispEdges">
      {estela > 0 &&
        [-0.3, 0, 0.3].map((k) => (
          <rect key={k} x={x + k * ancho - 3} y={y - alto / 2 - 160 * estela} width={6} height={150 * estela} fill={bb.hueso} opacity={0.35} />
        ))}
      <rect x={x - ancho / 2} y={y - alto / 2} width={ancho} height={alto} fill={bb.hueso} />
      <rect x={x - ancho / 2} y={y - alto / 2} width={ancho} height={10} fill="#A89F90" />
      <rect x={x - ancho / 2} y={y + alto / 2 - 10} width={ancho} height={10} fill="#A89F90" />
      <rect x={x - ancho * 0.3} y={y - ancho * 0.3} width={ancho * 0.6} height={ancho * 0.6} fill="#0E1424" />
      <rect x={x - 6} y={y - 6} width={12} height={12} fill={bb.cian} />
    </g>
  );
};
