// Los átomos de Demócrito en 3D (cap 7). Una manzana de cubitos (cáscara roja, pulpa crema, semillas) que se corta
// por la mitad una y otra vez (`cortes` 0–12: con 12 cada cubito queda suelto), se achica y se hace polvo (`achica`,
// `polvo`). Después esos mismos cubitos flotan en el vacío con su forma (cubo, esfera o pirámide: `sueltos`, `forma`,
// `colorAtomo`) y se acomodan en una manzana y luego en una vasija griega (`manzana`, `vasija`).
// Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
/** Celdas por lado de la grilla de la manzana (4 cortes por eje: 2⁴ = 16). */
const G = 16;
/** Separación que suma cada cubito cuando ya están todos cortados: la grilla queda con paso 1 + SEPARA. */
export const SEPARA = 0.7;
export const CORTES_MAX = 12;
/** Paso de la grilla de la vasija (los cubitos quedan un poco más juntos que en la manzana). */
const PASO_VASIJA = 0.85;

type V3 = [number, number, number];
export type TipoAtomo = 'cubo' | 'esfera' | 'piramide';

export type CamaraAtomos = { distancia: number; elevacion: number; azimut: number; objetivo: V3 };

const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraAtomos, centroY: number) => {
  const el = (camara.elevacion * Math.PI) / 180;
  const az = (camara.azimut * Math.PI) / 180;
  const [ox, oy, oz] = camara.objetivo;
  const d = camara.distancia;
  camera.position.set(ox + d * Math.cos(el) * Math.sin(az), oy + d * Math.sin(el), oz + d * Math.cos(el) * Math.cos(az));
  camera.lookAt(ox, oy, oz);
  camera.setViewOffset(camera.aspect * ALTO, ALTO, 0, ALTO / 2 - centroY, camera.aspect * ALTO, ALTO);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
};

/** Dónde cae en el video (px) un punto del mundo, con esa cámara: para poner rótulos y el cuchillo 2D encima. */
export const proyectorAtomos = (camara: CamaraAtomos, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.3, 600);
  colocarCamara(camera, camara, centroY);
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

/** Píxeles que mide una unidad del mundo a esa distancia de la cámara. */
export const pxPorUnidad = (distancia: number) => ALTO / (2 * distancia * Math.tan(((FOV / 2) * Math.PI) / 180));

// --- La manzana -------------------------------------------------------------------------------------------------

const A = 7.3;
const B = 6.7;
const CENTRO: V3 = [7.5, 6.5, 7.5];

const enCuerpo = (i: number, j: number, k: number) => {
  const x = i - CENTRO[0];
  const y = j - CENTRO[1];
  const z = k - CENTRO[2];
  const r = Math.hypot(x, z);
  const ancho = A * (1 + 0.05 * (y / B));
  if ((r / ancho) ** 2 + (y / B) ** 2 > 1) return false;
  const borde = B * Math.sqrt(Math.max(0, 1 - (r / A) ** 2));
  // Hoyuelo de arriba (donde nace el palito) y de abajo.
  if (r < 2.6 && y > borde - 1.6 * (1 - r / 2.6)) return false;
  if (r < 2.2 && y < -borde + 0.9 * (1 - r / 2.2)) return false;
  return true;
};

const PALITO: V3[] = [
  [8, 13, 7],
  [8, 14, 7],
  [9, 15, 7],
];
const HOJA: V3[] = [
  [10, 13, 7],
  [11, 13, 7],
  [10, 14, 7],
  [11, 14, 7],
  [12, 14, 7],
  [12, 15, 7],
  [13, 15, 7],
];
const SEMILLAS = ['1.5,0.5', '-1.5,-0.5', '0.5,-1.5', '-0.5,1.5'];

const hex = (c: string) => new THREE.Color(c);
const CASCARA = ['#C9452B', '#B5361F', '#D4502F', '#E07A45', '#A82E1C'].map(hex);
const PULPA = ['#F2E6C8', '#EADBB2', '#F7EFD9'].map(hex);
const CORAZON = hex('#E6D29A');
const SEMILLA = hex('#3A1E12');
const MADERA = hex('#4A2A18');
const HOJAS = ['#39FF88', '#2BD873'].map(hex);
const COLORES_TIPO: Record<TipoAtomo, THREE.Color[]> = {
  cubo: ['#F5A623', '#FFC65C', '#FFB43A'].map(hex),
  esfera: ['#39FF88', '#2BD873', '#7DFFB0'].map(hex),
  piramide: ['#E07A45', '#F4EFE6', '#C4572A'].map(hex),
};
const TERRACOTA = ['#C4572A', '#B84E24', '#CF6233'].map(hex);
const NEGRO_VASIJA = hex('#1E1612');
const AMBAR = hex('#F5A623');
const DESTACADO = hex('#FFC65C');

export type Atomo = {
  id: number;
  celda: V3;
  /** Lugar en la manzana entera (paso 1, centrada). */
  manzana: V3;
  colorManzana: THREE.Color;
  tipo: TipoAtomo;
  colorTipo: THREE.Color;
  /** Lugar donde flota en el vacío. */
  casa: V3;
  vasija: V3;
  colorVasija: THREE.Color;
  r: (k: string) => number;
};

// --- La vasija (perfil de revolución, en unidades de celda; u = 0 abajo, 1 arriba) ----------------------------------

const ALTO_VASIJA = 19;
const radioVasija = (u: number) => {
  if (u < 0.06) return 3.2;
  if (u < 0.1) return 2.2;
  if (u < 0.66) return 2.0 + 4.4 * Math.sin((Math.PI * (u - 0.1)) / 0.56) ** 0.8;
  if (u < 0.9) return 2.0 + 0.4 * ((u - 0.66) / 0.24);
  return 3.1;
};
const colorVasijaEn = (u: number, r: (k: string) => number) => {
  if (u < 0.06 || u > 0.93) return NEGRO_VASIJA;
  if ((u > 0.29 && u < 0.34) || (u > 0.56 && u < 0.62)) return NEGRO_VASIJA;
  if (u > 0.45 && u < 0.47) return AMBAR;
  return TERRACOTA[Math.floor(r('vc') * TERRACOTA.length)];
};

/** Celdas de la vasija (con sus asas), con la más honda al final, escalada para que haya al menos `n`. */
const celdasVasija = (n: number) => {
  for (let s = 1; s < 2; s += 0.02) {
    const alto = Math.round(ALTO_VASIJA * s);
    const celdas: { p: V3; hondo: number; u: number }[] = [];
    const ancho = Math.ceil(7 * s) + 1;
    for (let b = 0; b < alto; b++) {
      const u = (b + 0.5) / alto;
      const radio = radioVasija(u) * s;
      for (let a = -ancho; a <= ancho; a++) {
        for (let c = -ancho; c <= ancho; c++) {
          const r = Math.hypot(a, c);
          if (r <= radio) celdas.push({ p: [a, b - alto / 2, c], hondo: radio - r, u });
        }
      }
    }
    // Asas: un arco a cada lado, del hombro al cuello.
    for (const lado of [-1, 1]) {
      for (let q = 0; q <= 16; q++) {
        const ang = (q / 16) * Math.PI;
        const u = 0.6 + 0.24 * (q / 16);
        const x = lado * (radioVasija(u) * s + Math.sin(ang) * 2.4 * s);
        const y = u * alto - alto / 2 + Math.sin(ang) * 1.2 * s;
        const p: V3 = [Math.round(x), Math.round(y), 0];
        if (!celdas.some((e) => e.p[0] === p[0] && e.p[1] === p[1] && e.p[2] === p[2])) celdas.push({ p, hondo: -1, u: 0.95 });
      }
    }
    if (celdas.length >= n) {
      celdas.sort((x, y) => x.hondo - y.hondo);
      return celdas.slice(0, n);
    }
  }
  throw new Error('La vasija no alcanza');
};

const angulo = (p: V3) => Math.atan2(p[2], p[0]);

let creados: Atomo[] | null = null;

/** Los cubitos de la manzana con todo lo que necesitan (se calculan una sola vez). */
export const atomos = (): Atomo[] => {
  if (creados) return creados;
  const celdas: { c: V3; tipo: 'cuerpo' | 'palito' | 'hoja' }[] = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) for (let k = 0; k < G; k++) if (enCuerpo(i, j, k)) celdas.push({ c: [i, j, k], tipo: 'cuerpo' });
  PALITO.forEach((c) => celdas.push({ c, tipo: 'palito' }));
  HOJA.forEach((c) => celdas.push({ c, tipo: 'hoja' }));
  const n = celdas.length;
  const lista = celdas.map(({ c, tipo }, id): Atomo => {
    const r = (k: string) => random(`atomos3d-${id}-${k}`);
    const [i, j, k] = c;
    const manzana: V3 = [i - CENTRO[0], j - CENTRO[1], k - CENTRO[2]];
    let colorManzana: THREE.Color;
    if (tipo === 'palito') colorManzana = MADERA;
    else if (tipo === 'hoja') colorManzana = HOJAS[Math.floor(r('h') * HOJAS.length)];
    else {
      const borde = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(([a, b, d]) => !enCuerpo(i + a, j + b, k + d));
      const [x, y, z] = manzana;
      if (borde) colorManzana = CASCARA[Math.floor(r('c') * CASCARA.length)];
      else if (Math.abs(y) < 1 && SEMILLAS.includes(`${x},${z}`)) colorManzana = SEMILLA;
      else if (Math.hypot(x, z) < 2.2 && Math.abs(y) < 2.6) colorManzana = CORAZON;
      else colorManzana = PULPA[Math.floor(r('p') * PULPA.length)];
    }
    const t = r('tipo');
    const tipoAtomo: TipoAtomo = t < 0.42 ? 'cubo' : t < 0.74 ? 'esfera' : 'piramide';
    const colores = COLORES_TIPO[tipoAtomo];
    return {
      id,
      celda: c,
      manzana,
      colorManzana,
      tipo: tipoAtomo,
      colorTipo: colores[Math.floor(r('ct') * colores.length)],
      casa: [(r('cx') - 0.5) * 46, (r('cy') - 0.5) * 62, -42 + r('cz') * 52],
      vasija: [0, 0, 0],
      colorVasija: TERRACOTA[0],
      r,
    };
  });
  // Cada cubito va al lugar de la vasija que le corresponde por altura (y, a igual altura, por ángulo): así el cambio
  // de forma se ve ordenado, de abajo hacia arriba.
  const vasija = celdasVasija(n);
  const orden = (p: V3) => p[1] * 100 + angulo(p);
  const porAltura = [...lista].sort((a, b) => orden(a.manzana) - orden(b.manzana));
  const lugares = [...vasija].sort((a, b) => orden(a.p) - orden(b.p));
  porAltura.forEach((a, k) => {
    const l = lugares[k];
    a.vasija = l.p.map((v) => v * PASO_VASIJA) as V3;
    a.colorVasija = colorVasijaEn(l.u, a.r);
  });
  creados = lista;
  return lista;
};

// --- Estado de cada cubito ----------------------------------------------------------------------------------------

export type EstadoAtomos = {
  /** Reloj (fotogramas) para lo que se mueve solo: el flotar en el vacío. */
  t: number;
  /** 0–12: cortes hechos (con decimales, el que está en curso). Del 1 al 3: x, y, z; y así de nuevo, cada vez más finos. */
  cortes?: number;
  /** 0–1: los cubitos sueltos se achican (los cortes siguen sin que se vean). */
  achica?: number;
  /** 0–1: desaparecen (se hacen nada). */
  polvo?: number;
  /** 0–1: se van a flotar en el vacío. */
  sueltos?: number;
  /** 0–1: cada uno toma su forma (cubo, esfera o pirámide). */
  forma?: number;
  /** 0–1: pasan de los colores de la manzana a los de su forma. */
  colorAtomo?: number;
  /** 0–1: se juntan otra vez en la manzana. */
  manzana?: number;
  /** 0–1: se acomodan en la vasija. */
  vasija?: number;
  /** 0–1: todos menos `elegido` se apagan. */
  foco?: number;
  elegido?: number;
};

const suave = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};

/** Avance propio de un cubito: empiezan un poco desfasados (`desfase` 0–1 del total). */
const propio = (valor: number, a: Atomo, clave: string, desfase = 0.3) => suave((valor - a.r(clave) * desfase) / (1 - desfase));

export type Pose = { pos: V3; lado: number; forma: number; color: THREE.Color; giro: V3 };

const c1 = new THREE.Color();
const c2 = new THREE.Color();

export const poseAtomo = (a: Atomo, e: EstadoAtomos): Pose => {
  const { t, cortes = 0, achica = 0, polvo = 0, sueltos = 0, forma = 0, colorAtomo = 0, manzana = 0, vasija = 0, foco = 0, elegido = -1 } = e;
  const pos: V3 = [...a.manzana];
  for (let k = 1; k <= CORTES_MAX; k++) {
    const p = suave(cortes - (k - 1));
    if (p <= 0) break;
    const eje = (k - 1) % 3;
    const nivel = Math.floor((k - 1) / 3);
    const bit = (a.celda[eje] >> (3 - nivel)) & 1;
    pos[eje] += (bit ? 1 : -1) * SEPARA * 2 ** (3 - nivel) * 0.5 * p;
  }
  const s = propio(sueltos, a, 'su', 0.35);
  const m = propio(manzana, a, 'ma', 0.35);
  const v = propio(vasija, a, 'va', 0.35);
  if (s > 0) {
    const w = (k: string) => 0.025 + 0.03 * a.r(`w${k}`);
    const flota: V3 = [
      a.casa[0] + 1.5 * Math.sin(t * w('x') + 6.3 * a.r('fx')),
      a.casa[1] + 1.5 * Math.sin(t * w('y') + 6.3 * a.r('fy')),
      a.casa[2] + 1.1 * Math.sin(t * w('z') + 6.3 * a.r('fz')),
    ];
    for (let q = 0; q < 3; q++) pos[q] += (flota[q] - pos[q]) * s;
  }
  for (let q = 0; q < 3; q++) pos[q] += (a.manzana[q] - pos[q]) * m;
  for (let q = 0; q < 3; q++) pos[q] += (a.vasija[q] - pos[q]) * v;

  const ach = propio(achica, a, 'ac', 0.3);
  const pol = propio(polvo, a, 'po', 0.45);
  let lado = 0.92 * (1 - 0.72 * ach) * (1 - pol);
  lado += (0.8 - lado) * v;

  const ca = propio(colorAtomo, a, 'co', 0.3);
  c1.copy(a.colorManzana).lerp(a.colorTipo, ca).lerp(a.colorManzana, m);
  c2.copy(c1).lerp(a.colorVasija, v);
  // `foco` 0–0.6 destaca al elegido; de 0.6 a 1 los demás se achican y quedan como polvo alrededor.
  const resalta = Math.min(1, foco / 0.6);
  const aisla = Math.max(0, (foco - 0.6) / 0.4);
  if (a.id === elegido) {
    lado *= 1 + 0.35 * resalta;
    c2.lerp(DESTACADO, resalta * (1 - ca));
  } else {
    lado *= 1 - 0.72 * aisla;
    c2.multiplyScalar(1 - 0.5 * resalta - 0.2 * aisla);
  }

  const quieto = 1 - Math.max(m, v);
  const giro: V3 = [(t * 0.03 * (a.r('gx') - 0.5) * 2 + a.r('g0') * 6) * s * quieto, (t * 0.04 * (a.r('gy') - 0.5) * 2 + a.r('g1') * 6) * s * quieto, 0];
  return { pos, lado, forma: a.tipo === 'cubo' ? 0 : propio(forma, a, 'fo', 0.3), color: c2.clone(), giro };
};

/** Posición en el mundo del cubito `id` con ese estado (para apuntarle la cámara o ponerle algo encima). */
export const posicionAtomo = (id: number, e: EstadoAtomos) => poseAtomo(atomos()[id], e).pos;

/**
 * El cubito que queda más al frente, mirando desde ese ángulo, cuando ya están todos cortados (nada lo tapa).
 * Se elige entre los cubos (los que no cambian de forma).
 */
export const atomoAlFrente = (azimut: number, elevacion: number) => {
  const az = (azimut * Math.PI) / 180;
  const el = (elevacion * Math.PI) / 180;
  const dir: V3 = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
  let mejor = 0;
  let puntaje = -Infinity;
  for (const a of atomos()) {
    if (a.tipo !== 'cubo') continue;
    const p = poseAtomo(a, { t: 0, cortes: CORTES_MAX }).pos;
    const valor = p[0] * dir[0] + p[1] * dir[1] + p[2] * dir[2];
    if (valor > puntaje) {
      puntaje = valor;
      mejor = a.id;
    }
  }
  return mejor;
};

// --- La escena 3D ---------------------------------------------------------------------------------------------------

export type Atomos3DProps = EstadoAtomos & { camara: CamaraAtomos; centroY?: number; opacidad?: number };

const o = new THREE.Object3D();
const OCULTO = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);

const Escena: FC<Atomos3DProps> = ({ camara, centroY = ALTO / 2, ...estado }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const lista = useMemo(atomos, []);
  const mallas = useMemo(() => {
    const material = () => new THREE.MeshLambertMaterial({ flatShading: true });
    return {
      cubo: new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material(), lista.length),
      esfera: new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.64, 1), material(), lista.length),
      piramide: new THREE.InstancedMesh(new THREE.ConeGeometry(0.72, 1.05, 4), material(), lista.length),
    };
  }, [lista]);

  lista.forEach((a, i) => {
    const p = poseAtomo(a, estado);
    const poner = (malla: THREE.InstancedMesh, lado: number) => {
      if (lado < 0.002) {
        malla.setMatrixAt(i, OCULTO);
      } else {
        o.position.set(...p.pos);
        o.rotation.set(...p.giro);
        o.scale.setScalar(lado);
        o.updateMatrix();
        malla.setMatrixAt(i, o.matrix);
      }
      malla.setColorAt(i, p.color);
    };
    poner(mallas.cubo, p.lado * (1 - p.forma));
    poner(mallas.esfera, a.tipo === 'esfera' ? p.lado * p.forma : 0);
    poner(mallas.piramide, a.tipo === 'piramide' ? p.lado * p.forma : 0);
  });
  for (const malla of Object.values(mallas)) {
    malla.instanceMatrix.needsUpdate = true;
    malla.instanceColor!.needsUpdate = true;
  }

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-6, 10, 9]} intensity={1.3} />
      <directionalLight position={[8, -4, 5]} intensity={0.3} color="#ffd9a8" />
      <primitive object={mallas.cubo} />
      <primitive object={mallas.esfera} />
      <primitive object={mallas.piramide} />
    </>
  );
};

/** La pieza 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Atomos3D: FC<Atomos3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 600, position: [0, 0, 80] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
