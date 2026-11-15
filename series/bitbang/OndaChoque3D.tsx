// La onda de choque en 3D (especial «La pared de aire», continuación de «Antes de que parpadees»), toda en una sola
// escena que avanza con `a`, el radio del frente (unidades del dibujo; la explosión está a ALTURA = 1 sobre el suelo):
// la esfera terracota crece en el aire y empuja los cubitos del aire (viento detrás del frente, terracota) → toca el suelo
// y rebota (casquete ámbar) → la reflejada alcanza a la original y se unen en el tallo de Mach, una pared pegada al suelo
// → detrás, la succión: el aire se devuelve (cian) → la pared llega a las probetas (vidrio, muro, columna): el vidrio se
// astilla, el muro aguanta el golpe pero el viento lo vuelca, la columna resiste → más lejos solo se rompe el vidrio →
// la onda se debilita y quedan anillos de sonido sobre el suelo.
// Sin armas, ciudades ni personas: probetas geométricas en un suelo con cuadrícula, todo en unidades arbitrarias.
// Las curvas de abajo (`presionFrente`, `perfilPresion`, `geometriaFrente`, `llegadaA`, `anguloMuro`…) son la única
// fuente de verdad: las usan el 3D, las gráficas 2D y los rótulos. Cada escena solo elige qué tramo de `a` recorre.
// La cámara es la del vacío (`CamaraVacio`, `colocarCamara`); los rótulos 2D se ubican con `proyectorVacio`.
// Todo sale de `a`, del reloj `t` y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { mezclarCamaraEstrella } from './Supernova3D';
import { type CamaraVacio, colocarCamara } from './Vacio3D';

const FOV = 30;
type V3 = [number, number, number];

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;
/** 0→1 suave entre a y b. */
const entre = (p: number, a: number, b: number) => {
  const v = limitar((p - a) / (b - a));
  return v * v * (3 - 2 * v);
};
const campana = (p: number, centro: number, ancho: number) => Math.exp(-(((p - centro) / ancho) ** 2));

// --- La física (unidades arbitrarias) ------------------------------------------------------------------------------

/** Altura de la explosión sobre el suelo. */
export const ALTURA = 1;

/** Fuerza del frente (sobrepresión pico, 1 = a una altura de distancia) a distancia r de la explosión: baja al repartirse. */
export const presionFrente = (r: number) => (1 / Math.max(0.35, r)) ** 1.3;

/** Umbrales de falla (misma escala que presionFrente). El muro cae por el viento que lo empuja, no por el golpe. */
export const UMBRALES = { VIDRIO: 0.06, MURO: 0.17, COLUMNA: 0.45 };

/** Largo de la fase positiva (en unidades de radio) de un punto que el frente alcanzó a distancia r. */
const largoPositivo = (r: number) => 0.3 + 0.25 * r;

/** Perfil de Friedlander normalizado (pico 1) en el tiempo local τ (0 = llega el frente, 1 = fin de la fase positiva):
 * salto instantáneo, caída, una succión suave y larga (mínimo ≈ −0,25) y vuelta a lo normal en τ = 3,5. */
export const perfilPresion = (tau: number) => {
  if (tau < 0) return 0;
  if (tau <= 1) return (1 - tau) * Math.exp(-1.6 * tau);
  if (tau <= 3.5) return -0.25 * Math.sin(Math.PI * ((tau - 1) / 2.5)) ** 1.3;
  return 0;
};
export const FIN_PERFIL = 3.5;

/** Cuánto se ha corrido el aire (0–1): sale con el viento en la fase positiva y vuelve la mitad con la succión. */
const desplazamiento = (tau: number) => {
  if (tau <= 0) return 0;
  if (tau <= 1) return 1 - (1 - tau) ** 2;
  return 1 - 0.5 * entre(tau, 1, FIN_PERFIL);
};

/** Dónde empieza el tallo de Mach (distancia en el suelo) y cuánto sube el punto triple. */
const INICIO_MACH = 0.9;
const alturaTriple = (rg: number) => (rg > INICIO_MACH ? 0.32 * (rg - INICIO_MACH) ** 0.85 : 0);

/** Geometría del frente con radio a: la original (centro en la explosión), la reflejada (centro bajo el suelo, va un
 * poco más rápido porque viaja por aire ya comprimido) y el tallo de Mach (pared vertical de radio rs y alto hT). */
export const geometriaFrente = (a: number) => {
  const rg = a > ALTURA ? Math.sqrt(a * a - ALTURA * ALTURA) : 0;
  const hT = alturaTriple(rg);
  const rs = a > ALTURA ? Math.sqrt(Math.max(0, a * a - (hT - ALTURA) ** 2)) : 0;
  const ar = a > ALTURA ? Math.sqrt(rs * rs + (hT + ALTURA) ** 2) : a;
  return {
    /** Radio de la original, del rebote y del tallo (en el suelo); alto del punto triple. */
    a, ar, rs, hT,
    verOriginal: entre(a, 0.015, 0.06) * (1 - 0.85 * debilitar(a)),
    verRebote: entre(a, ALTURA, ALTURA + 0.12) * (1 - debilitar(a)),
    verMach: entre(rg, INICIO_MACH - 0.05, INICIO_MACH + 0.2) * (1 - 0.85 * debilitar(a)),
  };
};

/** 0–1: el frente se adelgaza en anillos de sonido. */
export const debilitar = (a: number) => entre(a, 5.5, 9);
/** 0–1: anillos de sonido sobre el suelo (y se apagan al final). */
export const verAnillos = (a: number) => entre(a, 5, 6.6) * (1 - entre(a, 11, 12.5));

/** Radio del frente (a) cuando llega al suelo a distancia g de la explosión. */
export const llegadaA = (g: number) => {
  if (g <= 0) return ALTURA;
  let lo = ALTURA;
  let hi = 40;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (geometriaFrente(m).rs < g) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
};

// --- Las probetas ------------------------------------------------------------------------------------------------

export type TipoProbeta = 'vidrio' | 'muro' | 'columna';
export type Probeta = { tipo: TipoProbeta; x: number; z: number };
/** Dos filas de probetas en la dirección +x. En cada una el frente llega primero al vidrio, luego al muro y a la columna.
 * `vel`: cuánto avanza `a` por segundo en la escena que la muestra (para que los restos caigan a buen ritmo). */
export const FILAS = {
  media: { vel: 0.16, probetas: [{ tipo: 'vidrio', x: 2.6, z: 0.45 }, { tipo: 'muro', x: 3.3, z: -0.05 }, { tipo: 'columna', x: 3.9, z: -0.55 }] as Probeta[] },
  lejos: { vel: 0.9, probetas: [{ tipo: 'vidrio', x: 5.1, z: 0.5 }, { tipo: 'muro', x: 5.8, z: 0 }, { tipo: 'columna', x: 6.4, z: -0.5 }] as Probeta[] },
};
export type NombreFila = keyof typeof FILAS;

export const MEDIDAS = { vidrio: { ancho: 0.56, alto: 0.46, grueso: 0.035 }, muro: { ancho: 0.56, alto: 0.4, grueso: 0.16 }, columna: { radio: 0.075, alto: 0.62 } };

/** Radio del frente cuando llega a una probeta (al plano de su cara, por el lado de la explosión). */
export const llegadaProbeta = (p: Probeta) => {
  const medio = p.tipo === 'vidrio' ? MEDIDAS.vidrio.grueso / 2 : p.tipo === 'muro' ? MEDIDAS.muro.grueso / 2 : MEDIDAS.columna.radio;
  return llegadaA(Math.hypot(p.x - medio, p.z));
};

/** ¿Falla esta probeta en esa fila? Lo decide la fuerza del frente contra el umbral. */
export const falla = (p: Probeta) => presionFrente(llegadaProbeta(p)) > UMBRALES[p.tipo === 'vidrio' ? 'VIDRIO' : p.tipo === 'muro' ? 'MURO' : 'COLUMNA'];

/** Momentos del muro que cae (en Δ = a − llegada): aguanta el golpe, el viento lo empuja y cede. */
export const MURO_DELTA = { aguanta: 0.05, empuja: 0.14, cede: 0.42, fin: 0.58 };

/** Inclinación del muro (grados, hacia afuera). Si no falla, solo tiembla. */
export const anguloMuro = (d: number, cae: boolean) => {
  if (d <= 0) return 0;
  const golpe = 4.5 * campana(d, 0.04, 0.045);
  if (!cae) return golpe;
  const empuja = 15 * entre(d, MURO_DELTA.empuja - 0.04, MURO_DELTA.cede);
  const cede = 75 * limitar((d - MURO_DELTA.cede) / (MURO_DELTA.fin - MURO_DELTA.cede)) ** 2;
  return Math.min(90, golpe + empuja + cede);
};

/** Comprueba que las curvas hagan lo que prometen (solo avisa en la consola). */
const comprobarCurvas = () => {
  const problemas: string[] = [];
  for (let r = 0.4; r < 12; r += 0.1) if (presionFrente(r + 0.1) >= presionFrente(r)) problemas.push(`presionFrente no baja en r=${r.toFixed(1)}`);
  if (!(perfilPresion(0) === 1 && perfilPresion(2.25) < -0.2)) problemas.push('el perfil no tiene salto en 0 ni succión');
  const [vM, mM, cM] = FILAS.media.probetas.map(falla);
  const [vL, mL, cL] = FILAS.lejos.probetas.map(falla);
  if (!(vM && mM && !cM)) problemas.push('en la fila media deberían fallar vidrio y muro, no la columna');
  if (!(vL && !mL && !cL)) problemas.push('en la fila lejana solo debería fallar el vidrio');
  let antes = 0;
  for (let a = ALTURA; a < 14; a += 0.05) {
    const rs = geometriaFrente(a).rs;
    if (rs < antes) problemas.push(`el tallo retrocede en a=${a.toFixed(2)}`);
    antes = rs;
  }
  const dist = 1000 / 343;
  if (dist < 2.8 || dist > 3) problemas.push('los segundos por kilómetro no dan ≈ 3');
  if (problemas.length) console.error('OndaChoque3D:', problemas);
};
comprobarCurvas();

// --- Cámara -------------------------------------------------------------------------------------------------------

type Toma = [number, CamaraVacio];
/** Tomas de la cámara según el radio del frente: cerca de la esfera en el aire → de lado (corte) para el rebote →
 * gira hasta las probetas → sube y se aleja sobre los anillos de sonido. */
const TOMAS: Toma[] = [
  [0, { distancia: 4.4, elevacion: 12, azimut: 20, objetivo: [0, 1, 0] }],
  [0.55, { distancia: 8.4, elevacion: 12, azimut: 16, objetivo: [0, 0.95, 0] }],
  [0.86, { distancia: 13, elevacion: 9, azimut: 10, objetivo: [0, 0.95, 0] }],
  [1.12, { distancia: 15.5, elevacion: 4, azimut: 0, objetivo: [0, 1.15, 0] }],
  [2.0, { distancia: 19, elevacion: 4, azimut: 0, objetivo: [0, 1.35, 0] }],
  [2.66, { distancia: 7.2, elevacion: 13, azimut: 16, objetivo: [3.1, 0.35, 0] }],
  [3.4, { distancia: 6.8, elevacion: 13, azimut: 17, objetivo: [3.25, 0.32, 0] }],
  [4.0, { distancia: 7.2, elevacion: 15, azimut: 17, objetivo: [3.5, 0.3, 0] }],
  [5.6, { distancia: 15, elevacion: 28, azimut: 14, objetivo: [4.6, 0.2, 0] }],
  [10, { distancia: 34, elevacion: 50, azimut: 10, objetivo: [4.8, 0, 0] }],
  [12.5, { distancia: 44, elevacion: 64, azimut: 6, objetivo: [3.5, 0, 0] }],
];

/** La cámara para el radio a (y un vaivén muy leve con el reloj t). */
export const camaraOnda = (a: number, t = 0): CamaraVacio => {
  let cam = TOMAS[TOMAS.length - 1][1];
  if (a <= TOMAS[0][0]) cam = TOMAS[0][1];
  else
    for (let i = 1; i < TOMAS.length; i++) {
      const [a1, c1] = TOMAS[i];
      if (a <= a1) {
        const [a0, c0] = TOMAS[i - 1];
        cam = mezclarCamaraEstrella(entre(a, a0, a1), c0, c1);
        break;
      }
    }
  return { ...cam, azimut: cam.azimut + 1.5 * Math.sin(t / 150) };
};

// --- Piezas de three ----------------------------------------------------------------------------------------------

const o = new THREE.Object3D();
const color = new THREE.Color();
const X = new THREE.Vector3(1, 0, 0);
const dir = new THREE.Vector3();
const ocultar = (malla: THREE.InstancedMesh, i: number) => {
  o.position.set(0, -999, 0);
  o.scale.setScalar(0.0001);
  o.rotation.set(0, 0, 0);
  o.updateMatrix();
  malla.setMatrixAt(i, o.matrix);
};
const listo = (malla: THREE.InstancedMesh) => {
  malla.instanceMatrix.needsUpdate = true;
  if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
};
const caja = (material: THREE.Material, n: number) => {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, n);
  m.setColorAt(0, new THREE.Color('#ffffff'));
  m.frustumCulled = false;
  return m;
};

const GRIS_AIRE = new THREE.Color('#A3ACC6');
const TERRACOTA = new THREE.Color('#C4572A');
const TERRACOTA_CLARA = new THREE.Color('#E07A45');
const CIAN = new THREE.Color('#3DD6F5');
const CIAN_CLARO = new THREE.Color('#C9F6FF');
const AMBAR = new THREE.Color('#F5A623');
const INCANDESCENTE = new THREE.Color('#FFF9EC');

/** Lado de un cubito por cada unidad de distancia a la cámara: así todos se ven del mismo tamaño (~11 px). */
const PX_CUBO = 0.0034;

type GranoAire = { p: V3; llega: number; largo: number; empuje: number; d: V3; u: number };

const N_ESFERA = 380;
const N_SUELO = 800;
const N_FILAS = 320;
const N_AIRE = N_ESFERA + N_SUELO + N_FILAS;

/** Cada cubito de aire, con el radio del frente al que lo alcanza (por la esfera o, pegado al suelo, por el tallo). */
const crearAire = (): GranoAire[] =>
  Array.from({ length: N_AIRE }, (_, i) => {
    let x: number;
    let y: number;
    let z: number;
    if (i < N_ESFERA) {
      const zz = random(`aire-z-${i}`) * 2 - 1;
      const ang = random(`aire-a-${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - zz * zz);
      const r = 0.14 + 2.4 * random(`aire-r-${i}`) ** 0.8;
      x = s * Math.cos(ang) * r;
      y = ALTURA + zz * r;
      z = s * Math.sin(ang) * r;
      if (y < 0.04) y = 0.04 + Math.abs(y) * 0.5;
    } else if (i < N_ESFERA + N_SUELO) {
      const rg = 0.3 + 8 * random(`aire-g-${i}`) ** 0.85;
      const ang = random(`aire-t-${i}`) * Math.PI * 2;
      x = rg * Math.cos(ang);
      z = rg * Math.sin(ang);
      y = 0.03 + 1.2 * random(`aire-y-${i}`) ** 2;
    } else {
      x = 2.1 + 4.8 * random(`aire-fx-${i}`);
      z = -1.7 + 3.4 * random(`aire-fz-${i}`);
      y = 0.03 + 0.9 * random(`aire-fy-${i}`) ** 1.6;
    }
    const g = Math.hypot(x, z);
    const esfera = Math.hypot(x, y - ALTURA, z);
    const porSuelo = llegadaA(g);
    // Pegado al suelo lo alcanza el tallo (que va delante); más arriba, la esfera.
    const bajo = y < alturaTriple(Math.max(g, INICIO_MACH)) + 0.05;
    const llega = bajo ? Math.min(esfera, porSuelo) : esfera;
    // Dirección del viento: desde la explosión; cerca del suelo, casi horizontal.
    const dx = x;
    const dz = z;
    let dy = (y - ALTURA) * limitar(y / 0.6);
    if (bajo) dy = 0;
    const n = Math.hypot(dx, dy, dz) || 1;
    return {
      p: [x, y, z] as V3,
      llega,
      largo: largoPositivo(llega),
      empuje: 1.1 * Math.min(4, presionFrente(llega)) ** 0.85,
      d: [dx / n, dy / n, dz / n] as V3,
      u: random(`aire-u-${i}`),
    };
  });

type Resto = { p: V3; v: V3; giro: V3; lado: number };
const N_RESTOS = 40;
/** Astillas de un vidrio: salen hacia afuera y un poco hacia arriba, giran y caen. */
const crearRestos = (pr: Probeta, semilla: string): Resto[] =>
  Array.from({ length: N_RESTOS }, (_, i) => {
    const col = i % 8;
    const fila = Math.floor(i / 8);
    return {
      p: [pr.x, 0.03 + ((fila + 0.5) / 5) * MEDIDAS.vidrio.alto + 0.03 * (random(`${semilla}-py-${i}`) - 0.5), pr.z + ((col + 0.5) / 8 - 0.5) * MEDIDAS.vidrio.ancho] as V3,
      v: [0.45 + 0.9 * random(`${semilla}-vx-${i}`), 0.15 + 0.8 * random(`${semilla}-vy-${i}`), (random(`${semilla}-vz-${i}`) - 0.5) * 0.7] as V3,
      giro: [random(`${semilla}-gx-${i}`) * 14 - 7, random(`${semilla}-gy-${i}`) * 14 - 7, random(`${semilla}-gz-${i}`) * 14 - 7] as V3,
      lado: 0.045 + 0.04 * random(`${semilla}-l-${i}`),
    };
  });

const GRAVEDAD = 3.2;

/** Bordes claros de una caja (para que las probetas se lean sobre el fondo oscuro). */
const Bordes: FC<{ medidas: V3; color: string; opacidad?: number }> = ({ medidas, color: c, opacidad = 1 }) => {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...medidas)), [medidas]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={c} transparent opacity={opacidad} />
    </lineSegments>
  );
};

const MEDIDAS_VIDRIO: V3 = [MEDIDAS.vidrio.grueso, MEDIDAS.vidrio.alto, MEDIDAS.vidrio.ancho];
const MEDIDAS_MURO: V3 = [MEDIDAS.muro.grueso, MEDIDAS.muro.alto, MEDIDAS.muro.ancho];

/** Una fila de probetas: el vidrio se reemplaza por astillas al llegar el frente, el muro rota sobre su arista de
 * afuera (si falla) y la columna apenas tiembla. */
const Fila: FC<{ nombre: NombreFila; a: number }> = ({ nombre, a }) => {
  const fila = FILAS[nombre];
  const [vidrio, muro, columna] = fila.probetas;
  const restos = useMemo(() => crearRestos(vidrio, `restos-${nombre}`), [vidrio, nombre]);
  const astillas = useMemo(() => caja(new THREE.MeshBasicMaterial({ color: CIAN_CLARO, transparent: true, opacity: 0.9 }), N_RESTOS), []);
  const dV = a - llegadaProbeta(vidrio);
  const dM = a - llegadaProbeta(muro);
  const dC = a - llegadaProbeta(columna);
  const roto = dV >= 0 && falla(vidrio);
  const tt = Math.max(0, dV) / fila.vel;
  restos.forEach((r, i) => {
    if (!roto) {
      ocultar(astillas, i);
      return;
    }
    const y0 = r.p[1];
    const tSuelo = (r.v[1] + Math.sqrt(r.v[1] ** 2 + 2 * GRAVEDAD * Math.max(0, y0 - 0.01))) / GRAVEDAD;
    const te = Math.min(tt, tSuelo);
    o.position.set(r.p[0] + r.v[0] * te, Math.max(0.01, y0 + r.v[1] * te - (GRAVEDAD * te * te) / 2), r.p[2] + r.v[2] * te);
    o.rotation.set(r.giro[0] * te, r.giro[1] * te, r.giro[2] * te);
    o.scale.set(r.lado, r.lado * 0.9, 0.012);
    o.updateMatrix();
    astillas.setMatrixAt(i, o.matrix);
  });
  listo(astillas);
  const angM = (anguloMuro(dM, falla(muro)) * Math.PI) / 180;
  const angC = ((2.2 * campana(dC, 0.05, 0.06)) * Math.PI) / 180;
  const brilloV = roto ? 0 : 1;
  return (
    <>
      {brilloV > 0 && (
        <group position={[vidrio.x, MEDIDAS.vidrio.alto / 2 + 0.02, vidrio.z]}>
          <mesh>
            <boxGeometry args={MEDIDAS_VIDRIO} />
            <meshBasicMaterial color={CIAN} transparent opacity={0.38} depthWrite={false} />
          </mesh>
          <Bordes medidas={MEDIDAS_VIDRIO} color="#C9F6FF" />
        </group>
      )}
      <primitive object={astillas} />
      {/* El muro gira sobre su arista de abajo del lado de afuera (x + grueso/2). */}
      <group position={[muro.x + MEDIDAS.muro.grueso / 2, 0, muro.z]} rotation={[0, 0, -angM]}>
        <group position={[-MEDIDAS.muro.grueso / 2, MEDIDAS.muro.alto / 2, 0]}>
          <mesh>
            <boxGeometry args={MEDIDAS_MURO} />
            <meshLambertMaterial color="#B4BED8" />
          </mesh>
          <Bordes medidas={MEDIDAS_MURO} color="#EEF2FB" opacidad={0.8} />
        </group>
      </group>
      <group position={[columna.x + MEDIDAS.columna.radio, 0, columna.z]} rotation={[0, 0, -angC]}>
        <mesh position={[-MEDIDAS.columna.radio, MEDIDAS.columna.alto / 2, 0]}>
          <cylinderGeometry args={[MEDIDAS.columna.radio, MEDIDAS.columna.radio * 1.08, MEDIDAS.columna.alto, 14]} />
          <meshLambertMaterial color="#F1E9DA" />
        </mesh>
      </group>
    </>
  );
};

export type EstadoOnda = {
  /** Radio del frente (unidades del dibujo; la explosión está a ALTURA = 1). */
  a: number;
  /** Reloj del video (fotogramas): titileos. */
  t: number;
};

const EscenaOnda: FC<EstadoOnda & { camara: CamaraVacio; centroY: number }> = ({ a, t, camara, centroY }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const aire = useMemo(crearAire, []);
  const cubos = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_AIRE), []);
  const suelo = useMemo(() => {
    const g = new THREE.GridHelper(80, 80, '#46588A', '#46588A');
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).opacity = 0.75;
    return g;
  }, []);

  const d = camara.distancia;
  const el = (camara.elevacion * Math.PI) / 180;
  const az = (camara.azimut * Math.PI) / 180;
  const [ox, oy, oz] = camara.objetivo;
  const cx = ox + d * Math.cos(el) * Math.sin(az);
  const cy = oy + d * Math.sin(el);
  const cz = oz + d * Math.cos(el) * Math.cos(az);

  const geo = geometriaFrente(a);
  const debil = debilitar(a);
  const quedaAire = 1 - entre(a, 4.4, 6.2);

  // El aire: quieto delante del frente; detrás, el viento lo corre hacia afuera (terracota) y la succión lo devuelve (cian).
  // Cerca de la explosión el empujón es tan fuerte que el aire viaja pegado al frente (una capa apretada) y el centro queda
  // casi vacío; lejos, apenas se corre.
  aire.forEach((g, i) => {
    const tau = (a - g.llega) / g.largo;
    const tope = 0.85 * Math.max(0, a - g.llega);
    const s = Math.min(desplazamiento(tau) * g.empuje, tope);
    const enCapa = desplazamiento(tau) * g.empuje > tope;
    const x = g.p[0] + g.d[0] * s;
    const y = Math.max(0.02, g.p[1] + g.d[1] * s);
    const z = g.p[2] + g.d[2] * s;
    const dc = Math.hypot(x - cx, y - cy, z - cz);
    if (quedaAire <= 0 || dc < 0.3 * d) {
      ocultar(cubos, i);
      return;
    }
    const P = perfilPresion(tau);
    const vel = enCapa ? 1 : Math.abs(desplazamiento(tau + 0.02) - desplazamiento(tau - 0.02)) / 0.04;
    color.copy(GRIS_AIRE).multiplyScalar(0.9 + 0.15 * g.u);
    if (P > 0 || enCapa) color.lerp(TERRACOTA_CLARA, limitar(Math.max(P, enCapa ? 0.8 : 0) * (0.75 + 0.4 * Math.min(1, presionFrente(g.llega)))) * (1 - 0.6 * debil));
    else if (P < 0) color.lerp(CIAN, limitar(-P * 2.6));
    o.position.set(x, y, z);
    // Un poco estirado en la dirección del viento, según lo rápido que se mueve.
    dir.set(g.d[0], g.d[1], g.d[2]);
    o.quaternion.setFromUnitVectors(X, dir);
    const tocado = tau > 0 ? 1 : 0.8;
    const lado = PX_CUBO * dc * quedaAire * tocado * (1 + 0.35 * campana(tau, 0.04, 0.12));
    const estira = 1 + 0.8 * limitar((vel * Math.min(1, g.empuje)) / 1.6) * (1 - debil);
    o.scale.set(lado * estira, lado, lado);
    o.updateMatrix();
    cubos.setMatrixAt(i, o.matrix);
    cubos.setColorAt(i, color);
  });
  listo(cubos);

  // Las tres ondas (casquetes): la original sobre el punto triple, la reflejada desde el suelo, y el tallo de Mach.
  const tOriginal = Math.acos(limitar((geo.hT - ALTURA) / Math.max(1e-6, a), -1, 1));
  const tRebote = Math.acos(limitar((geo.hT + ALTURA) / Math.max(1e-6, geo.ar), -1, 1));
  const verNucleo = 1 - entre(a, 1.2, 2.4);
  const anillos = verAnillos(a);
  const opMalla = mezclar(entre(a, 1.5, 3.4), 0.5, 0.16);
  const opRelleno = mezclar(entre(a, 1.5, 3.4), 0.13, 0.05);
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[6, 10, 9]} intensity={1.0} />
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial color="#18213A" />
        </mesh>
        <primitive object={suelo} position={[0, 0.004, 0]} />
      </group>
      <Fila nombre="media" a={a} />
      <Fila nombre="lejos" a={a} />
      <primitive object={cubos} />
      {verNucleo > 0 && (
        <mesh position={[0, ALTURA, 0]} scale={0.06 * (1 + 0.15 * Math.sin(t / 3)) * verNucleo}>
          <icosahedronGeometry args={[1, 3]} />
          <meshBasicMaterial color={INCANDESCENTE} />
        </mesh>
      )}
      {geo.verOriginal > 0 && (
        <group position={[0, ALTURA, 0]} scale={Math.max(0.001, a)}>
          <mesh>
            <sphereGeometry args={[1, 44, 26, 0, Math.PI * 2, 0, tOriginal]} />
            <meshBasicMaterial color={TERRACOTA_CLARA} wireframe transparent opacity={opMalla * geo.verOriginal} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.995, 44, 26, 0, Math.PI * 2, 0, tOriginal]} />
            <meshBasicMaterial color={TERRACOTA} transparent opacity={opRelleno * geo.verOriginal} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}
      {geo.verRebote > 0 && tRebote > 0.01 && (
        <group position={[0, -ALTURA, 0]} scale={geo.ar}>
          <mesh>
            <sphereGeometry args={[1, 44, 20, 0, Math.PI * 2, 0, tRebote]} />
            <meshBasicMaterial color={AMBAR} wireframe transparent opacity={0.42 * geo.verRebote * (1 - 0.6 * entre(a, 2, 3))} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.995, 44, 20, 0, Math.PI * 2, 0, tRebote]} />
            <meshBasicMaterial color={AMBAR} transparent opacity={0.08 * geo.verRebote} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}
      {geo.verMach > 0 && geo.hT > 0.005 && (
        <group position={[0, geo.hT / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[geo.rs, geo.rs, geo.hT, 96, 1, true]} />
            <meshBasicMaterial color={TERRACOTA_CLARA} transparent opacity={0.34 * geo.verMach} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, geo.hT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[geo.rs, 0.006 + 0.0012 * d, 6, 160]} />
            <meshBasicMaterial color={INCANDESCENTE} transparent opacity={0.9 * geo.verMach} />
          </mesh>
          <mesh position={[0, -geo.hT / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(0, geo.rs - 0.05 - 0.002 * d), geo.rs + 0.02, 120]} />
            <meshBasicMaterial color={TERRACOTA_CLARA} transparent opacity={0.8 * geo.verMach} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}
      {/* Anillos de sonido: el frente, ya débil, deja ondas finas detrás. */}
      {anillos > 0 &&
        Array.from({ length: 8 }, (_, k) => {
          const r = geo.rs - k * 0.6;
          if (r < 0.4) return null;
          const grosor = 0.012 + 0.0016 * d;
          return (
            <mesh key={k} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - grosor, r + grosor, 160]} />
              <meshBasicMaterial color={k === 0 ? INCANDESCENTE : CIAN_CLARO} transparent opacity={anillos * 0.6 * (1 - k / 8.5)} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          );
        })}
    </>
  );
};

export type OndaChoque3DProps = EstadoOnda & { camara: CamaraVacio; centroY?: number; opacidad?: number };

/** La onda de choque en 3D, del tamaño del cuadro entero. */
export const OndaChoque3D: FC<OndaChoque3DProps> = ({ opacidad = 1, centroY = ALTO / 2, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.1, far: 400, position: [0, 0, 40] }}>
        <EscenaOnda {...props} centroY={centroY} />
      </LienzoTres>
    </div>
  );
