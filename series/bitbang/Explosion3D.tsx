// La bola de fuego en cámara lenta (especial «Antes de que parpadees»), toda en una sola escena 3D que avanza con la
// fase `p` (los fotogramas locales del pedido, 0–1230): núcleo blanco → frente de rayos X cian que vuelve plasma el aire
// → la onda de choque terracota adelanta a la bola de fuego y la tapa (por eso la luz baja y vuelve a subir) → nube de
// Wilson blanca detrás del choque → la bola sube como una burbuja, se vuelve un anillo que gira, el polvo forma el tallo
// y se aplana contra una capa de aire estable (el hongo). Sin armas, ciudades ni personas: suelo abstracto con cuadrícula.
// Las curvas (`tiempoReal`, `luzAparente`, radios, Wilson, altura…) son la única fuente de verdad: las usan el 3D, la
// gráfica del doble destello y los relojes 2D. Cada escena solo elige qué tramo de `p` recorre según su voz.
// La cámara es la del vacío (`CamaraVacio`, `colocarCamara`); los rótulos 2D se ubican con `proyectorVacio`.
// Todo sale de `p`, del reloj `t` y de random() con semilla: nada de animaciones propias de three.
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

// --- Fases y curvas ---------------------------------------------------------------------------------------------------

/** Momentos de la explosión en unidades de fase (los fotogramas locales del pedido). */
export const FASE = {
  RADIACION_INICIO: 0,
  PLASMA_APARECE: 60,
  CHOQUE_ADELANTA: 330,
  MINIMO_LUZ: 480,
  BREAKAWAY: 560,
  SEGUNDO_MAXIMO: 650,
  WILSON_INICIO: 700,
  WILSON_FIN: 800,
  ASCENSO_INICIO: 840,
  TORO_FORMADO: 1000,
  TALLO_FORMADO: 1080,
  CAPA_ESTABLE: 1150,
  APLANA_FIN: 1230,
} as const;

/** Tiempos de referencia (s), solo órdenes de magnitud: cambian con cada explosión. */
export const TIEMPOS_REFERENCIA_S = { RADIACION: 1e-6, CHOQUE_ADELANTA: 1e-4, BREAKAWAY: 1e-2, CONVECCION_INICIO: 1, FIN: 60 };

const PUNTOS_TIEMPO: [number, number][] = [
  [FASE.RADIACION_INICIO, TIEMPOS_REFERENCIA_S.RADIACION],
  [FASE.CHOQUE_ADELANTA, TIEMPOS_REFERENCIA_S.CHOQUE_ADELANTA],
  [FASE.BREAKAWAY, TIEMPOS_REFERENCIA_S.BREAKAWAY],
  [FASE.ASCENSO_INICIO, TIEMPOS_REFERENCIA_S.CONVECCION_INICIO],
  [FASE.APLANA_FIN, TIEMPOS_REFERENCIA_S.FIN],
];

/** Segundos reales que corresponden a la fase p: interpola log10(t) por tramos (reloj de órdenes de magnitud). */
export const tiempoReal = (p: number) => {
  const q = limitar(p, PUNTOS_TIEMPO[0][0], PUNTOS_TIEMPO[PUNTOS_TIEMPO.length - 1][0]);
  for (let i = 1; i < PUNTOS_TIEMPO.length; i++) {
    const [p1, t1] = PUNTOS_TIEMPO[i];
    if (q <= p1) {
      const [p0, t0] = PUNTOS_TIEMPO[i - 1];
      return 10 ** mezclar((q - p0) / (p1 - p0), Math.log10(t0), Math.log10(t1));
    }
  }
  return TIEMPOS_REFERENCIA_S.FIN;
};

/** Brillo que se ve desde afuera (0–1): un primer pulso chico, el valle cuando el choque tapa la bola y un segundo
 * pulso mucho mayor. Lo usan el 3D, la gráfica del doble destello y su cursor. */
export const luzAparente = (p: number) => {
  const primero = 0.3 * campana(p, 270, 85);
  const segundo = p < FASE.SEGUNDO_MAXIMO ? campana(p, FASE.SEGUNDO_MAXIMO, 85) : 0.12 + 0.88 * campana(p, FASE.SEGUNDO_MAXIMO, 190);
  return limitar(Math.max(0.03, primero + segundo));
};

/** Radio de la bola de fuego hacia el final de la radiación (unidades 3D). */
export const R_BOLA = 1;

/** Frente de rayos X: crece muy rápido al principio y se frena; desde que lo adelanta el choque, casi no crece. */
export const radioFrente = (p: number) =>
  p <= FASE.CHOQUE_ADELANTA ? R_BOLA * (1 - (1 - Math.max(0, p) / FASE.CHOQUE_ADELANTA) ** 2.2) : R_BOLA * (1 + 0.25 * entre(p, FASE.CHOQUE_ADELANTA, FASE.ASCENSO_INICIO));

/** Onda de choque: nace justo detrás del frente, lo alcanza en CHOQUE_ADELANTA y sigue hacia afuera. */
export const radioChoque = (p: number) =>
  p <= FASE.CHOQUE_ADELANTA
    ? radioFrente(p) * mezclar(limitar((p - 240) / (FASE.CHOQUE_ADELANTA - 240)), 0.9, 1)
    : R_BOLA * (1 + 1.7 * ((p - FASE.CHOQUE_ADELANTA) / 470) ** 0.7);

/** 0–1: cuánto tapa el choque a la bola de fuego (opaco hasta que se aclara, en BREAKAWAY). */
export const tapaChoque = (p: number) => entre(p, FASE.CHOQUE_ADELANTA, 420) * (1 - entre(p, 520, 600));

/** 0–0,5: la nube de Wilson sube y baja suave entre WILSON_INICIO y WILSON_FIN. */
export const opacidadWilson = (p: number) => 0.5 * Math.sin(Math.PI * limitar((p - FASE.WILSON_INICIO) / (FASE.WILSON_FIN - FASE.WILSON_INICIO))) ** 0.6;

/** Altura máxima del centro de la burbuja, el suelo y la capa de aire estable. */
export const H_BURBUJA = 5;
export const SUELO_Y = -1.4;
export const CAPA_Y = 5.75;

/** Altura del centro de la bola de fuego: sube como una burbuja desde ASCENSO_INICIO y se frena bajo la capa estable. */
export const alturaBurbuja = (p: number) => H_BURBUJA * entre(p, FASE.ASCENSO_INICIO, 1110) + 0.3 * aplanamiento(p);
/** 0–1: la bola se vuelve un anillo que gira. */
export const toroBurbuja = (p: number) => entre(p, 920, FASE.TORO_FORMADO + 40);
/** 0–1: el tallo de polvo sube del suelo hasta la burbuja. */
export const crecerTallo = (p: number) => entre(p, 960, FASE.TALLO_FORMADO);
/** 0–1: aparece la capa de aire estable. */
export const verCapa = (p: number) => entre(p, 1120, FASE.CAPA_ESTABLE + 10);
/** 0–1: el anillo se aplana contra la capa (alto ×0,4, ancho ×2,1). */
export const aplanamiento = (p: number) => entre(p, FASE.CAPA_ESTABLE, FASE.APLANA_FIN);
/** Tamaño de la bola de fuego (crece un poco al subir). */
export const escalaBola = (p: number) => radioFrente(Math.min(p, FASE.ASCENSO_INICIO)) + 0.2 * entre(p, FASE.ASCENSO_INICIO, 1100);
/** Radios del anillo (grande y del tubo) y dónde termina por abajo (para el tallo y los rótulos). */
export const anilloBurbuja = (p: number) => {
  const e = escalaBola(p);
  const a = aplanamiento(p);
  return { grande: 0.85 * e, tubo: 0.5 * e, ancho: mezclar(a, 1, 2.1), alto: mezclar(a, 1, 0.4) };
};

/** Revisa que las curvas cumplan lo que prometen (solo avisa en la consola). */
const comprobarCurvas = () => {
  const problemas: string[] = [];
  let antes = -Infinity;
  for (let p = 0; p <= FASE.APLANA_FIN; p += 5) {
    const t = tiempoReal(p);
    if (!(t > antes)) problemas.push(`tiempoReal no crece en p=${p}`);
    antes = t;
    if (p >= FASE.CHOQUE_ADELANTA && radioChoque(p) < radioFrente(p)) problemas.push(`el choque va detrás del frente en p=${p}`);
    const l = luzAparente(p);
    if (l < 0 || l > 1) problemas.push(`luzAparente fuera de 0–1 en p=${p}`);
    const w = opacidadWilson(p);
    if (w < 0 || w > 0.5) problemas.push(`opacidadWilson fuera de 0–0,5 en p=${p}`);
  }
  if (!(luzAparente(FASE.MINIMO_LUZ) < luzAparente(270) && luzAparente(270) < luzAparente(FASE.SEGUNDO_MAXIMO))) problemas.push('la luz no hace pulso chico → valle → pulso grande');
  if (problemas.length) console.error('Explosion3D:', problemas);
};
comprobarCurvas();

// --- Cámara -----------------------------------------------------------------------------------------------------------

/** La cámara: cerca del núcleo al principio, se aleja con el radio del frente y del choque; con `vista` = 1, lejos y más
 * arriba para ver el suelo, el tallo y el hongo. */
export const camaraExplosion = (p: number, vista: number, t: number): CamaraVacio => {
  const azimut = 28 + 8 * Math.sin(t / 240);
  const radio = Math.max(radioFrente(p), Math.min(radioChoque(p), 2.6));
  const cerca: CamaraVacio = { distancia: 2.2 + 6.4 * radio, elevacion: 12, azimut, objetivo: [0, 0, 0] };
  const lejos: CamaraVacio = { distancia: 36, elevacion: 10, azimut, objetivo: [0, 2.5, 0] };
  return mezclarCamaraEstrella(limitar(vista), cerca, lejos);
};

/** Radio en pantalla (px) de una esfera de radio R vista a distancia d (FOV 30). */
export const radioEnPantalla = (R: number, d: number) => ((ALTO / 2) / Math.tan((15 * Math.PI) / 180)) * (R / Math.sqrt(Math.max(1e-6, d * d - R * R)));

// --- Las piezas --------------------------------------------------------------------------------------------------------

const o = new THREE.Object3D();
const color = new THREE.Color();
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
const alAzar = (semilla: string): V3 => {
  const z = random(`${semilla}-z`) * 2 - 1;
  const a = random(`${semilla}-a`) * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(a), z, s * Math.sin(a)];
};

const GRIS_AIRE = new THREE.Color('#A3ACC6');
/** El aire de afuera, un poco más apagado para que no compita con la bola (pálido, nunca oscuro). */
const GRIS_LEJOS = new THREE.Color('#8C96B3');
const CIAN = new THREE.Color('#3DD6F5');
const CIAN_CLARO = new THREE.Color('#C9F6FF');
const INCANDESCENTE = new THREE.Color('#FFF9EC');
const AMBAR = new THREE.Color('#F5A623');
/** La bola ya fría: nube pálida y cálida (nunca oscura). */
const NUBE = new THREE.Color('#EBD3B8');
const TERRACOTA = new THREE.Color('#C4572A');
const TERRACOTA_CLARA = new THREE.Color('#E07A45');
const POLVO = new THREE.Color('#D3BE9F');
const BLANCO = new THREE.Color('#FFFFFF');

/** Lado de un cubito por cada unidad de distancia de la cámara: así se ven siempre del mismo tamaño (~15 px). */
const PX_CUBO = 0.0042;

const N_BOLA = 760;
const N_AIRE = 620;
const N_NUBE = 820;
const N_POLVO = 340;

type GranoBola = { d: V3; r: number; u: number; tita: number; fi: number; s: number };
type GranoAire = { d: V3; r: number; u: number };
type GranoPolvo = { r0: number; tita: number; u0: number; vel: number; u: number };

const crearBola = (): GranoBola[] =>
  Array.from({ length: N_BOLA }, (_, i) => {
    const d = alAzar(`bola-${i}`);
    return {
      d,
      r: 1.2 * R_BOLA * Math.cbrt(random(`bola-r-${i}`)),
      u: random(`bola-u-${i}`),
      tita: Math.atan2(d[2], d[0]),
      fi: random(`bola-fi-${i}`) * Math.PI * 2,
      s: Math.sqrt(random(`bola-s-${i}`)),
    };
  });
const crearAire = (): GranoAire[] =>
  Array.from({ length: N_AIRE }, (_, i) => ({ d: alAzar(`aire-${i}`), r: Math.cbrt(mezclar(random(`aire-r-${i}`), 1.28 ** 3, 2.5 ** 3)), u: random(`aire-u-${i}`) }));
const crearNube = (): GranoAire[] => Array.from({ length: N_NUBE }, (_, i) => ({ d: alAzar(`wilson-${i}`), r: 1, u: random(`wilson-u-${i}`) }));
const crearPolvo = (): GranoPolvo[] =>
  Array.from({ length: N_POLVO }, (_, i) => ({
    r0: 0.3 + 1.9 * random(`polvo-r-${i}`) ** 1.5,
    tita: random(`polvo-t-${i}`) * Math.PI * 2,
    u0: random(`polvo-u0-${i}`),
    vel: random(`polvo-v-${i}`),
    u: random(`polvo-u-${i}`),
  }));

export type EstadoExplosion = {
  /** Fase de la explosión (0–1230, ver FASE). */
  p: number;
  /** Reloj del video (fotogramas): titileos, giro del anillo y polvo que sube. */
  t: number;
  /** 0 = cámara cerca de la bola; 1 = lejos, con el suelo a la vista. */
  vista?: number;
};

const EscenaExplosion: FC<EstadoExplosion & { camara: CamaraVacio; centroY: number }> = ({ p, t, vista = 0, camara, centroY }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const bola = useMemo(crearBola, []);
  const aire = useMemo(crearAire, []);
  const nube = useMemo(crearNube, []);
  const polvo = useMemo(crearPolvo, []);
  const cubosBola = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_BOLA), []);
  const cubosAire = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_AIRE), []);
  const materialNube = useMemo(() => new THREE.MeshLambertMaterial({ color: BLANCO, transparent: true, depthWrite: false }), []);
  const cubosNube = useMemo(() => caja(materialNube, N_NUBE), [materialNube]);
  const cubosPolvo = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_POLVO), []);
  const suelo = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, '#3A4A72', '#3A4A72');
    (g.material as THREE.Material).transparent = true;
    return g;
  }, []);
  const rejaCapa = useMemo(() => {
    const g = new THREE.GridHelper(13, 13, '#BDF3FF', '#BDF3FF');
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).depthWrite = false;
    return g;
  }, []);

  const d = camara.distancia;
  const lado = PX_CUBO * d;
  // Dónde está la cámara: lo que queda pegado a ella se esconde (si no, tapa todo).
  const el = (camara.elevacion * Math.PI) / 180;
  const az = (camara.azimut * Math.PI) / 180;
  const [ox, oy, oz] = camara.objetivo;
  const cam = new THREE.Vector3(ox + d * Math.cos(el) * Math.sin(az), oy + d * Math.sin(el), oz + d * Math.cos(el) * Math.cos(az));
  const pegado = (x: number, y: number, z: number) => (x - cam.x) ** 2 + (y - cam.y) ** 2 + (z - cam.z) ** 2 < (0.45 * d) ** 2;

  const frente = radioFrente(p);
  const choque = radioChoque(p);
  const tapa = tapaChoque(p);
  const luz = luzAparente(p);
  const h = alturaBurbuja(p);
  const toro = toroBurbuja(p);
  const anillo = anilloBurbuja(p);
  const e = escalaBola(p);
  const enfria = entre(p, 600, 950);
  const nubeFria = entre(p, 950, FASE.APLANA_FIN);
  const giro = t * 0.045;

  // La bola de fuego: aire gris que el frente vuelve plasma; después sube y se vuelve el anillo del hongo.
  bola.forEach((g, i) => {
    const plasma = limitar((frente - g.r) / 0.1);
    const crece = Math.max(1, e / R_BOLA);
    let x = g.d[0] * g.r * crece;
    let y = g.d[1] * g.r * crece;
    let z = g.d[2] * g.r * crece;
    if (p > FASE.ASCENSO_INICIO - 40) {
      const fi = g.fi - giro * (0.8 + 0.4 * g.u);
      const rr = anillo.grande + anillo.tubo * g.s * Math.cos(fi);
      const tx = rr * Math.cos(g.tita) * anillo.ancho;
      const ty = anillo.tubo * g.s * Math.sin(fi) * anillo.alto;
      const tz = rr * Math.sin(g.tita) * anillo.ancho;
      x = mezclar(toro, x, tx);
      y = mezclar(toro, y, ty);
      z = mezclar(toro, z, tz);
    }
    y += h;
    if (pegado(x, y, z)) {
      ocultar(cubosBola, i);
      return;
    }
    color.copy(GRIS_AIRE);
    if (plasma > 0) {
      const caliente = CIAN_CLARO.clone().lerp(INCANDESCENTE, limitar((frente - g.r) / 0.35));
      caliente.lerp(AMBAR, 0.75 * enfria * (0.6 + 0.4 * g.u)).lerp(NUBE, 0.85 * nubeFria * (0.5 + 0.5 * g.s));
      color.lerp(caliente, plasma);
      if (random(`bola-titila-${i}-${Math.floor(t / 3)}`) < 0.05 * plasma * (1 - nubeFria)) color.lerp(INCANDESCENTE, 0.7);
    }
    o.position.set(x, y, z);
    o.rotation.set(g.u * 3 + giro * 0.3, g.s * 3, 0);
    o.scale.setScalar(lado * (1 + 0.35 * plasma) * (1 + 0.5 * toro));
    o.updateMatrix();
    cubosBola.setMatrixAt(i, o.matrix);
    cubosBola.setColorAt(i, color);
  });
  listo(cubosBola);

  // El aire de alrededor: el choque lo empuja al pasar y lo tiñe de terracota. Se va al alejarse la cámara.
  const quedaAire = 1 - entre(vista, 0.2, 0.8);
  aire.forEach((g, i) => {
    const golpe = choque > 0 ? campana(choque - g.r, 0.15, 0.22) : 0;
    const r = g.r + 0.28 * golpe + 0.08 * limitar((choque - g.r) / 0.5);
    const x = g.d[0] * r;
    const y = g.d[1] * r;
    const z = g.d[2] * r;
    if (quedaAire <= 0 || pegado(x, y, z) || r > 2.75) {
      ocultar(cubosAire, i);
      return;
    }
    color.copy(GRIS_LEJOS).multiplyScalar(0.92 + 0.12 * g.u).lerp(TERRACOTA_CLARA, 0.8 * golpe);
    o.position.set(x, y, z);
    o.rotation.set(g.u * 4, g.u * 7, 0);
    o.scale.setScalar(lado * 0.6 * quedaAire * (1 + 0.6 * golpe));
    o.updateMatrix();
    cubosAire.setMatrixAt(i, o.matrix);
    cubosAire.setColorAt(i, color);
  });
  listo(cubosAire);

  // La nube de Wilson: una cáscara blanca, un poco por dentro del choque, que aparece y se va.
  const wilson = opacidadWilson(p);
  materialNube.opacity = Math.min(0.85, wilson * 1.6);
  nube.forEach((g, i) => {
    const r = 0.86 * choque * (1 + 0.05 * (g.u - 0.5));
    const x = g.d[0] * r;
    const y = g.d[1] * r * 0.92;
    const z = g.d[2] * r;
    if (wilson <= 0.005 || pegado(x, y, z)) {
      ocultar(cubosNube, i);
      return;
    }
    o.position.set(x, y, z);
    o.rotation.set(g.u * 5, g.u * 9, 0);
    o.scale.setScalar(lado * (1.4 + 1.0 * g.u));
    o.updateMatrix();
    cubosNube.setMatrixAt(i, o.matrix);
    cubosNube.setColorAt(i, BLANCO);
  });
  listo(cubosNube);

  // El tallo: polvo que el aire que sube arrastra desde el suelo hasta debajo del anillo, en espiral.
  const tallo = crecerTallo(p);
  const base = h - anillo.tubo * anillo.alto * 0.6;
  polvo.forEach((g, i) => {
    if (tallo <= 0) {
      ocultar(cubosPolvo, i);
      return;
    }
    const u = (g.u0 + t * 0.006 * (0.6 + 0.8 * g.vel)) % 1;
    const y = SUELO_Y + u * tallo * (base - SUELO_Y);
    const r = mezclar(u ** 0.3, g.r0, 0.16 + 0.12 * g.u);
    const a = g.tita + u * 4 + t * 0.01;
    color.copy(POLVO).multiplyScalar(0.9 + 0.15 * g.u).lerp(AMBAR, 0.35 * u * (1 - nubeFria));
    o.position.set(r * Math.cos(a), y, r * Math.sin(a));
    o.rotation.set(g.u * 4, a, 0);
    o.scale.setScalar(lado * (0.8 + 0.5 * g.u));
    o.updateMatrix();
    cubosPolvo.setMatrixAt(i, o.matrix);
    cubosPolvo.setColorAt(i, color);
  });
  listo(cubosPolvo);

  const verFrente = entre(p, 2, 14) * (1 - entre(p, FASE.CHOQUE_ADELANTA, 440));
  const verChoque = entre(p, 240, 290) * (1 - entre(p, 790, 840));
  const nucleo = 1 - entre(p, 760, 860);
  const capa = verCapa(p);
  (suelo.material as THREE.Material).opacity = 0.75 * vista;
  (rejaCapa.material as THREE.Material).opacity = 0.55 * capa;
  const colorChoque = TERRACOTA_CLARA.clone().lerp(TERRACOTA, 0.25 * tapa);
  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 10, 9]} intensity={1.1} />
      <directionalLight position={[-6, -3, 4]} intensity={0.35} color="#ffd9a8" />
      {vista > 0 && (
        <group position={[0, SUELO_Y, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial color="#141C30" transparent opacity={0.85 * vista} depthWrite={false} />
          </mesh>
          <primitive object={suelo} position={[0, 0.005, 0]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[3.2, 32]} />
            <meshBasicMaterial color={AMBAR} transparent opacity={0.3 * vista * (0.3 + 0.7 * luz) * (1 - 0.6 * nubeFria)} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
      {capa > 0 && (
        <group position={[0, CAPA_Y, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[13, 13]} />
            <meshBasicMaterial color={CIAN} transparent opacity={0.1 * capa} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <primitive object={rejaCapa} />
        </group>
      )}
      <primitive object={cubosBola} />
      <primitive object={cubosAire} />
      <primitive object={cubosPolvo} />
      {tallo > 0 && (
        <mesh position={[0, (SUELO_Y + base) / 2, 0]}>
          <cylinderGeometry args={[0.2, 0.32, Math.max(0.01, (base - SUELO_Y) * tallo), 8, 1, true]} />
          <meshBasicMaterial color={POLVO} transparent opacity={0.28 * tallo} depthWrite={false} />
        </mesh>
      )}
      {nucleo > 0 && (
        <mesh scale={(0.045 + 0.035 * luz) * nucleo}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={INCANDESCENTE} />
        </mesh>
      )}
      {verFrente > 0 && (
        <group scale={Math.max(0.001, frente)}>
          <mesh>
            <icosahedronGeometry args={[1, 2]} />
            <meshBasicMaterial color={CIAN} wireframe transparent opacity={0.55 * verFrente} depthWrite={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.99, 2]} />
            <meshBasicMaterial color={CIAN} transparent opacity={0.14 * verFrente} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
      {verChoque > 0 && (
        <group scale={choque}>
          <mesh>
            <icosahedronGeometry args={[1, 3]} />
            <meshBasicMaterial color={colorChoque} wireframe transparent opacity={0.55 * verChoque} depthWrite={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.99, 3]} />
            <meshBasicMaterial color={colorChoque} transparent opacity={(0.1 + 0.78 * tapa) * verChoque} depthWrite={false} />
          </mesh>
        </group>
      )}
      <primitive object={cubosNube} />
    </>
  );
};

export type Explosion3DProps = EstadoExplosion & { camara: CamaraVacio; centroY?: number; opacidad?: number };

/** La explosión en 3D, del tamaño del cuadro entero. */
export const Explosion3D: FC<Explosion3DProps> = ({ opacidad = 1, centroY = ALTO / 2, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.1, far: 400, position: [0, 0, 40] }}>
        <EscenaExplosion {...props} centroY={centroY} />
      </LienzoTres>
    </div>
  );
