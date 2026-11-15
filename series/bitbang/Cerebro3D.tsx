// El cerebro en 3D (especial «Despiertas y no puedes moverte», la parálisis del sueño). Esquema en cubitos, de lado:
// arriba un cerebro grande (corteza en dos hemisferios, cerebelo atrás, tronco cerebral con la protuberancia), de él baja
// la médula hasta un cuerpo acostado boca arriba en una cama (cabeza a la izquierda), y corre por su espalda.
// · `rem` 0–1: la corteza late en cian (soñando). `despierta` 0–1: la corteza pasa a ámbar (la mente despierta).
// · `apagon` 0–1: la señal sale de la protuberancia, baja por la médula y apaga el cuerpo segmento a segmento
//   (del cuello a los pies): encendido es un pijama cálido (ámbar) y apagado, el mismo cuerpo pálido y frío (nunca negro:
//   el usuario no lo quiere oscuro). Los ojos y el diafragma (verde) nunca se apagan.
// · `alarma` 0–1: las amígdalas (adentro, abajo de la corteza) laten en terracota. `rayos` 0–1 quita la corteza del lado de
//   la cámara para verlas.
// Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
type V3 = [number, number, number];

export type CamaraCerebro = { distancia: number; elevacion: number; azimut: number; objetivo: V3 };

const suave = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraCerebro, centroY: number) => {
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

/** Dónde cae en el video (px) un punto del mundo, con esa cámara: para poner rótulos y brillos 2D encima. */
export const proyectorCerebro = (camara: CamaraCerebro, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.3, 400);
  colocarCamara(camera, camara, centroY);
  return (p: V3) => {
    const v = new THREE.Vector3(...p).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

/** Lugares del esquema, para rótulos y brillos 2D. */
export const PUNTOS_CEREBRO: Record<'corteza' | 'protuberancia' | 'amigdala' | 'medula' | 'cuerpo' | 'ojos' | 'diafragma' | 'pies', V3> = {
  corteza: [0.4, 3.75, 0],
  protuberancia: [-0.35, 1.05, 0.35],
  amigdala: [0.75, 1.75, 0.8],
  medula: [-1.15, -0.6, 0],
  cuerpo: [0.4, -1.9, 0],
  ojos: [-2.18, -1.45, 0],
  diafragma: [-0.55, -1.85, 0],
  pies: [2.75, -1.85, 0],
};

// --- Colores ---------------------------------------------------------------------------------------------------

const C = (c: string) => new THREE.Color(c);
const CORTEZA = ['#6E7AA4', '#606C96', '#7C88B0'].map(C);
const SURCO = C('#3E4870');
const CEREBELO = ['#6E7AA4', '#5E6A94'].map(C);
const TRONCO = C('#7380AC');
const CIAN = C('#3DD6F5');
const CIAN_CLARO = C('#BDF3FF');
const AMBAR = C('#F5A623');
const AMBAR_CLARO = C('#FFD58A');
const TERRACOTA = C('#E07A45');
const VERDE = C('#39FF88');
const BLANCO = C('#F4EFE6');
const NEGRO = C('#1B1F2A');
/** Encendido: el pijama cálido y la piel. Apagado: el mismo cuerpo pálido y frío (claro, nunca negro). */
const TELAS = {
  camisa: { on: ['#EFB45C', '#E3A64E'].map(C), off: ['#C3D3E8', '#B3C5DF'].map(C) },
  pantalon: { on: ['#C97E40', '#BC7336'].map(C), off: ['#A6BAD6', '#98AECD'].map(C) },
  piel: { on: ['#E2A886', '#D69B79'].map(C), off: ['#CDD6E5', '#C1CBDD'].map(C) },
  pelo: { on: ['#3E3048', '#352940'].map(C), off: ['#3E3048', '#352940'].map(C) },
};
const CAMA = C('#3A4878');
const SABANA = C('#56689C');
const ALMOHADA = C('#C9D4EE');
const MEDULA = C('#6474A2');

// --- Formas en cubitos -------------------------------------------------------------------------------------------

const LADO = 0.17;

type Cubito = { x: number; y: number; z: number; lado: number; r: (k: string) => number };

/** Cubitos de la cáscara de un elipsoide (grosor ~2 cubitos), con una función que decide si va o no. */
const cascara = (centro: V3, radios: V3, nombre: string, lado = LADO, filtro: (x: number, y: number, z: number) => boolean = () => true): Cubito[] => {
  const out: Cubito[] = [];
  const [cx, cy, cz] = centro;
  const [rx, ry, rz] = radios;
  const grosor = (lado * 2.2) / Math.min(rx, ry, rz);
  for (let x = -rx; x <= rx; x += lado)
    for (let y = -ry; y <= ry; y += lado)
      for (let z = -rz; z <= rz; z += lado) {
        const d = Math.sqrt((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2);
        if (d > 1 || d < 1 - grosor) continue;
        if (!filtro(cx + x, cy + y, cz + z)) continue;
        const i = out.length;
        out.push({ x: cx + x, y: cy + y, z: cz + z, lado, r: (k) => random(`${nombre}-${i}-${k}`) });
      }
  return out;
};

/** Cubitos que llenan un elipsoide. */
const lleno = (centro: V3, radios: V3, nombre: string, lado = LADO): Cubito[] => {
  const out: Cubito[] = [];
  const [cx, cy, cz] = centro;
  const [rx, ry, rz] = radios;
  for (let x = -rx; x <= rx + 1e-6; x += lado)
    for (let y = -ry; y <= ry + 1e-6; y += lado)
      for (let z = -rz; z <= rz + 1e-6; z += lado) {
        if ((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2 > 1.05) continue;
        const i = out.length;
        out.push({ x: cx + x, y: cy + y, z: cz + z, lado, r: (k) => random(`${nombre}-${i}-${k}`) });
      }
  return out;
};

/** Cubitos que llenan una caja (de `a` a `b`). */
const caja3 = (a: V3, b: V3, nombre: string, lado = LADO): Cubito[] => {
  const out: Cubito[] = [];
  for (let x = a[0] + lado / 2; x < b[0]; x += lado)
    for (let y = a[1] + lado / 2; y < b[1]; y += lado)
      for (let z = a[2] + lado / 2; z < b[2]; z += lado) {
        const i = out.length;
        out.push({ x, y, z, lado, r: (k) => random(`${nombre}-${i}-${k}`) });
      }
  return out;
};

// El cerebro: corteza (dos hemisferios con una ranura en el medio), cerebelo, tronco con la protuberancia.
const CENTRO_CORTEZA: V3 = [0.25, 2.55, 0];
const crearCorteza = () =>
  cascara(CENTRO_CORTEZA, [2.25, 1.35, 1.65], 'cerebro-corteza', LADO, (x, y, z) => {
    if (Math.abs(z) < LADO * 0.9 && y > 2.3) return false; // la ranura entre los hemisferios
    if (y < 1.6 && x < 0.1) return false; // abajo y atrás va el cerebelo
    if (y < 1.35) return false;
    return true;
  });
const crearCerebelo = () => cascara([-1.25, 1.42, 0], [0.85, 0.5, 1.15], 'cerebro-cerebelo');
const crearTronco = () => [
  ...caja3([-0.75, -0.05, -0.32], [-0.15, 1.75, 0.32], 'cerebro-tronco'),
];
const crearProtuberancia = () => lleno([-0.35, 1.05, 0], [0.42, 0.36, 0.42], 'cerebro-protuberancia');
const crearAmigdalas = () => [...lleno([0.75, 1.75, 0.8], [0.22, 0.2, 0.2], 'amigdala-a'), ...lleno([0.75, 1.75, -0.8], [0.22, 0.2, 0.2], 'amigdala-b')];

// La médula: del tronco baja hasta la nuca del cuerpo y sigue por la espalda hasta la cadera.
const CURVA_MEDULA = new THREE.CatmullRomCurve3(
  [
    [-0.45, -0.05, 0],
    [-0.75, -0.75, 0],
    [-1.45, -1.25, 0],
    [-1.62, -1.85, 0],
    [-1.3, -2.12, 0],
    [-0.3, -2.14, 0],
    [0.65, -2.12, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
);
const N_MEDULA = 70;

// El cuerpo acostado boca arriba (cabeza a la izquierda, cara hacia arriba). Cada parte tiene su lugar a lo largo de la
// médula (0 = el tronco cerebral, 1 = los pies) para apagarse en orden, y cada cubito su tela (camisa, pantalón, piel, pelo).
type Tela = keyof typeof TELAS;
type CubitoCuerpo = Cubito & { tela: Tela };
type Parte = { nombre: string; en: number; apagable: boolean; cubos: CubitoCuerpo[] };
/** Cubitos más chicos que los del cerebro: el cuerpo se ve más fino. */
const LC = 0.09;

/** Un «tubo» acostado a lo largo de x (de x0 a x1), de sección elíptica: radios ry(t) y rz(t), con t de 0 a 1. */
const tubo = (x0: number, x1: number, cy: number, cz: number, ry: (t: number) => number, rz: (t: number) => number, nombre: string, tela: Tela): CubitoCuerpo[] => {
  const out: CubitoCuerpo[] = [];
  for (let x = x0 + LC / 2; x < x1; x += LC) {
    const t = (x - x0) / (x1 - x0);
    const a = ry(t);
    const b = rz(t);
    for (let y = -a; y <= a + 1e-6; y += LC)
      for (let z = -b; z <= b + 1e-6; z += LC) {
        if ((y / a) ** 2 + (z / b) ** 2 > 1.04) continue;
        const i = out.length;
        out.push({ x, y: cy + y, z: cz + z, lado: LC, tela, r: (k) => random(`${nombre}-${i}-${k}`) });
      }
  }
  return out;
};

const conTela = (cubos: Cubito[], tela: (c: Cubito) => Tela): CubitoCuerpo[] => cubos.map((c) => ({ ...c, tela: tela(c) }));

const CABEZA: V3 = [-2.12, -1.8, 0];
const crearCuerpo = (): Parte[] => {
  const [hx, hy] = CABEZA;
  // pelo atrás (hacia la coronilla, a la izquierda) y abajo, sobre la almohada; la cara mira arriba
  const cabeza = conTela(lleno(CABEZA, [0.36, 0.33, 0.3], 'cuerpo-cabeza', LC), (c) => (c.x < hx - 0.16 || (c.y < hy - 0.06 && c.x < hx + 0.12) ? 'pelo' : 'piel'));
  const nariz = conTela(caja3([hx - 0.02, hy + 0.3, -0.05], [hx + 0.08, hy + 0.42, 0.05], 'cuerpo-nariz', LC), () => 'piel');
  const orejas = conTela([...lleno([hx + 0.02, hy - 0.02, 0.3], [0.07, 0.09, 0.05], 'cuerpo-oreja-a', LC), ...lleno([hx + 0.02, hy - 0.02, -0.3], [0.07, 0.09, 0.05], 'cuerpo-oreja-b', LC)], () => 'piel');
  const brazo = (z: number, k: string) => tubo(-1.42, 0.28, -2.02, z, (t) => 0.13 - 0.03 * t, (t) => 0.13 - 0.03 * t, `cuerpo-brazo-${k}`, 'camisa');
  const mano = (z: number, k: string) => conTela(lleno([0.4, -2.05, z], [0.14, 0.07, 0.1], `cuerpo-mano-${k}`, LC), () => 'piel');
  const pierna = (z: number, k: string) => tubo(0.42, 2.4, -1.99, z, (t) => 0.2 - 0.06 * t, (t) => 0.19 - 0.06 * t, `cuerpo-pierna-${k}`, 'pantalon');
  const pie = (z: number, k: string) => conTela(lleno([2.46, -1.9, z], [0.07, 0.2, 0.09], `cuerpo-pie-${k}`, LC), () => 'piel');
  return [
    { nombre: 'cabeza', en: 0.4, apagable: false, cubos: [...cabeza, ...nariz, ...orejas] },
    { nombre: 'cuello', en: 0.45, apagable: true, cubos: tubo(-1.84, -1.58, -1.92, 0, () => 0.13, () => 0.14, 'cuerpo-cuello', 'piel') },
    // torso: hombros anchos que se angostan hacia la cintura, con el pecho un poco más alto
    { nombre: 'torso', en: 0.6, apagable: true, cubos: tubo(-1.6, 0.45, -1.9, 0, (t) => 0.31 - 0.05 * t, (t) => 0.52 - 0.12 * t + (t < 0.08 ? -0.1 * (1 - t / 0.08) : 0), 'cuerpo-torso', 'camisa') },
    { nombre: 'brazoA', en: 0.55, apagable: true, cubos: brazo(0.68, 'a') },
    { nombre: 'brazoB', en: 0.55, apagable: true, cubos: brazo(-0.68, 'b') },
    { nombre: 'manoA', en: 0.68, apagable: true, cubos: mano(0.68, 'a') },
    { nombre: 'manoB', en: 0.68, apagable: true, cubos: mano(-0.68, 'b') },
    { nombre: 'piernaA', en: 0.82, apagable: true, cubos: pierna(0.21, 'a') },
    { nombre: 'piernaB', en: 0.82, apagable: true, cubos: pierna(-0.21, 'b') },
    { nombre: 'pieA', en: 0.95, apagable: true, cubos: pie(0.21, 'a') },
    { nombre: 'pieB', en: 0.95, apagable: true, cubos: pie(-0.21, 'b') },
  ];
};

/** 1 = encendido (músculos activos), 0 = apagado. Del cuello a los pies, con un poco de desorden por cubito. */
export const nivelParte = (en: number, apagon: number, azar = 0) => 1 - suave((apagon * 1.15 - en - azar * 0.08) / 0.12);

// --- Mallas ------------------------------------------------------------------------------------------------------

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
const malla = (material: THREE.Material, n: number) => {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, Math.max(1, n));
  m.setColorAt(0, new THREE.Color('#ffffff'));
  m.frustumCulled = false;
  return m;
};
const poner = (m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, escala: number, c: THREE.Color) => {
  o.position.set(x, y, z);
  o.rotation.set(0, 0, 0);
  o.scale.setScalar(escala);
  o.updateMatrix();
  m.setMatrixAt(i, o.matrix);
  m.setColorAt(i, c);
};

export type EstadoCerebro = {
  /** Reloj (fotogramas del video completo). */
  t: number;
  /** 0–1: la corteza late en cian (fase REM, soñando). */
  rem: number;
  /** 0–1: la corteza pasa a ámbar (despierta). */
  despierta: number;
  /** 0–1: la señal baja por la médula y apaga el cuerpo. */
  apagon: number;
  /** 0–1: la protuberancia (el «interruptor») se enciende en cian. */
  interruptor: number;
  /** 0–1: las amígdalas laten en terracota. */
  alarma: number;
  /** 0–1: se va la corteza del lado de la cámara (para ver adentro). */
  rayos: number;
};

type Cerebro3DProps = EstadoCerebro & { camara: CamaraCerebro; centroY?: number; opacidad?: number };

const EscenaCerebro: FC<Omit<Cerebro3DProps, 'opacidad'>> = ({ camara, centroY = ALTO / 2, ...e }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const formas = useMemo(
    () => ({ corteza: crearCorteza(), cerebelo: crearCerebelo(), tronco: crearTronco(), protuberancia: crearProtuberancia(), amigdalas: crearAmigdalas(), cuerpo: crearCuerpo() }),
    [],
  );
  const nCuerpo = formas.cuerpo.reduce((s, p) => s + p.cubos.length, 0);
  const mallas = useMemo(
    () => ({
      corteza: malla(new THREE.MeshLambertMaterial(), formas.corteza.length),
      cerebelo: malla(new THREE.MeshLambertMaterial(), formas.cerebelo.length),
      tronco: malla(new THREE.MeshLambertMaterial(), formas.tronco.length + formas.protuberancia.length),
      amigdalas: malla(new THREE.MeshBasicMaterial(), formas.amigdalas.length),
      medula: malla(new THREE.MeshBasicMaterial(), N_MEDULA),
      cuerpo: malla(new THREE.MeshLambertMaterial(), nCuerpo),
      luces: malla(new THREE.MeshBasicMaterial(), 6),
    }),
    [formas, nCuerpo],
  );

  const pulso = 0.5 + 0.5 * Math.sin(e.t * 0.22);
  // La corteza del lado de la cámara se va con `rayos` (de afuera hacia adentro).
  const camZ = Math.cos((camara.azimut * Math.PI) / 180);
  const camX = Math.sin((camara.azimut * Math.PI) / 180);
  const cercania = (x: number, z: number) => ((x - CENTRO_CORTEZA[0]) * camX + z * camZ) / 1.7;

  formas.corteza.forEach((c, i) => {
    const corte = cercania(c.x, c.z);
    const se = e.rayos > 0 ? suave((corte - mezclar(e.rayos, 1.2, -0.05) + c.r('rayo') * 0.15) / 0.15) : 0;
    if (se >= 1) return ocultar(mallas.corteza, i);
    // Pliegues: franjas onduladas más oscuras (surcos) sobre la superficie.
    const surco = Math.sin(c.x * 3.1 + Math.sin(c.y * 4.2 + c.z * 2.3) * 1.6) > 0.72;
    color.copy(surco ? SURCO : CORTEZA[Math.floor(c.r('c') * 3)]);
    // Soñando: ondas cian que recorren la corteza.
    const onda = 0.5 + 0.5 * Math.sin(e.t * 0.18 - c.x * 1.4 + c.y * 0.8);
    if (e.rem > 0) color.lerp(surco ? CIAN : CIAN_CLARO, e.rem * (0.35 + 0.55 * onda) * (surco ? 0.8 : 0.6));
    if (e.despierta > 0) color.lerp(surco ? AMBAR : AMBAR_CLARO, e.despierta * (surco ? 0.85 : 0.7));
    poner(mallas.corteza, i, c.x, c.y, c.z, c.lado * 0.92 * (1 - se), color);
  });
  listo(mallas.corteza);

  formas.cerebelo.forEach((c, i) => {
    const corte = cercania(c.x, c.z);
    const se = e.rayos > 0 ? suave((corte - mezclar(e.rayos, 1.2, 0.1) + c.r('rayo') * 0.15) / 0.15) : 0;
    color.copy(CEREBELO[Math.floor(Math.abs(c.y * 9)) % 2]);
    poner(mallas.cerebelo, i, c.x, c.y, c.z, c.lado * 0.92 * (1 - se), color);
  });
  listo(mallas.cerebelo);

  // El tronco y la protuberancia (el «interruptor»), que se enciende en cian.
  let k = 0;
  formas.tronco.forEach((c) => {
    color.copy(TRONCO).lerp(CIAN, e.interruptor * 0.25);
    poner(mallas.tronco, k++, c.x, c.y, c.z, c.lado * 0.92, color);
  });
  formas.protuberancia.forEach((c) => {
    color.copy(TRONCO).lerp(c.r('c') < 0.5 ? CIAN : CIAN_CLARO, e.interruptor * (0.75 + 0.25 * pulso));
    poner(mallas.tronco, k++, c.x, c.y, c.z, c.lado * 0.95, color);
  });
  listo(mallas.tronco);

  // Las amígdalas: se ven solo con rayos; laten con la alarma.
  const late = 1 + 0.18 * e.alarma * Math.sin(e.t * 0.3);
  formas.amigdalas.forEach((c, i) => {
    color.copy(TRONCO).lerp(TERRACOTA, Math.min(1, 0.35 + e.alarma));
    const [ax, ay, az] = PUNTOS_CEREBRO.amigdala;
    const zc = c.z > 0 ? az : -az;
    poner(mallas.amigdalas, i, ax + (c.x - ax) * late, ay + (c.y - ay) * late, zc + (c.z - zc) * late, c.lado * 0.95 * late, color);
  });
  listo(mallas.amigdalas);

  // La médula: cubitos en la curva; la señal es un tren de cubitos claros que baja.
  const frente = e.apagon * 1.15;
  for (let i = 0; i < N_MEDULA; i++) {
    const u = i / (N_MEDULA - 1);
    const p = CURVA_MEDULA.getPointAt(u);
    const enCuerpo = 0.45 + u * 0.4; // posición equivalente a lo largo del cuerpo
    const tren = e.apagon > 0 && e.apagon < 1 ? Math.max(0, 1 - Math.abs(enCuerpo - frente) / 0.08) : 0;
    const recorrida = e.apagon > 0 ? suave((frente - enCuerpo) / 0.05) : 0;
    color.copy(MEDULA).lerp(CIAN, Math.max(0.5 * recorrida * e.interruptor, tren));
    if (tren > 0.5) color.lerp(CIAN_CLARO, tren - 0.5);
    poner(mallas.medula, i, p.x, p.y, p.z, 0.15 * (1 + 0.6 * tren), color);
  }
  listo(mallas.medula);

  // El cuerpo: encendido (pijama cálido) o apagado (pálido y frío, con un brillo cian que lo recorre). La cabeza no se apaga.
  k = 0;
  formas.cuerpo.forEach((parte) => {
    parte.cubos.forEach((c) => {
      const tela = TELAS[c.tela];
      const v = Math.floor(c.r('c') * 2);
      const n = parte.apagable ? nivelParte(parte.en, e.apagon, c.r('azar')) : 1;
      color.copy(tela.off[v]).lerp(tela.on[v], n);
      if (n < 1 && c.tela !== 'pelo') color.lerp(CIAN_CLARO, (1 - n) * 0.25 * (0.5 + 0.5 * Math.sin(e.t * 0.12 - c.x * 1.6)));
      poner(mallas.cuerpo, k++, c.x, c.y, c.z, c.lado * 0.94, color);
    });
  });
  listo(mallas.cuerpo);

  // Lo que nunca se apaga: los ojos (arriba de la cabeza) y el diafragma (en el torso).
  const latido = 0.75 + 0.25 * Math.sin(e.t * 0.12);
  const [hx, hy] = CABEZA;
  // los ojos: el blanco y la pupila verde (se mueven: nunca se apagan)
  const mira = 0.03 * Math.sin(e.t * 0.2);
  poner(mallas.luces, 0, hx - 0.08, hy + 0.3, 0.12, 0.1, BLANCO);
  poner(mallas.luces, 1, hx - 0.08, hy + 0.3, -0.12, 0.1, BLANCO);
  poner(mallas.luces, 2, hx - 0.08 + mira, hy + 0.34, 0.12, 0.06, VERDE);
  poner(mallas.luces, 3, hx - 0.08 + mira, hy + 0.34, -0.12, 0.06, VERDE);
  // la boca
  o.position.set(hx + 0.17, hy + 0.27, 0);
  o.rotation.set(0, 0, 0);
  o.scale.set(0.04, 0.03, 0.12);
  o.updateMatrix();
  mallas.luces.setMatrixAt(4, o.matrix);
  mallas.luces.setColorAt(4, NEGRO);
  // el diafragma: una franja verde que late sobre el pecho
  o.position.set(-0.55, -1.6, 0);
  o.scale.set(0.16, 0.05 + 0.04 * latido, 0.8);
  o.updateMatrix();
  mallas.luces.setMatrixAt(5, o.matrix);
  mallas.luces.setColorAt(5, VERDE);
  listo(mallas.luces);

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-5, 10, 9]} intensity={1.25} />
      <directionalLight position={[7, -4, 5]} intensity={0.3} color="#ffd9a8" />
      <primitive object={mallas.corteza} />
      <primitive object={mallas.cerebelo} />
      <primitive object={mallas.tronco} />
      <primitive object={mallas.amigdalas} />
      <primitive object={mallas.medula} />
      <primitive object={mallas.cuerpo} />
      <primitive object={mallas.luces} />
      {/* La cama y la almohada */}
      <mesh position={[0.25, -2.42, 0]}>
        <boxGeometry args={[5.8, 0.3, 2.1]} />
        <meshLambertMaterial color={CAMA} />
      </mesh>
      <mesh position={[0.25, -2.24, 0]}>
        <boxGeometry args={[5.8, 0.06, 2.06]} />
        <meshLambertMaterial color={SABANA} />
      </mesh>
      <mesh position={[-2.2, -2.13, 0]}>
        <boxGeometry args={[0.8, 0.16, 1.1]} />
        <meshLambertMaterial color={ALMOHADA} />
      </mesh>
    </>
  );
};

/** El esquema completo (cerebro, médula y cuerpo acostado) en su propio lienzo 3D, del tamaño del cuadro. */
export const Cerebro3D: FC<Cerebro3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 400, position: [0, 0, 40] }}>
        <EscenaCerebro {...props} />
      </LienzoTres>
    </div>
  );
