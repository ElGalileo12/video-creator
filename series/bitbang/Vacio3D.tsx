// El vacío en 3D (especial «¿Qué tan vacío es el vacío?»):
// · `Tubo3D`: el tubo del haz del acelerador, abierto por arriba como un dibujo en corte, que se pierde a lo lejos.
//   Adentro flotan moléculas de gas gris; los paquetes de protones (ámbar) pasan por el eje. `vaciar` saca casi todas
//   las moléculas, `frio` cubre las paredes de escarcha y `pegar` lleva las que quedan a la pared, donde se congelan.
// · `Trampa3D`: la trampa de antimateria: una columna de anillos dorados (los electrodos) dentro de un cilindro de
//   acero que se hiela, abierta siempre del lado de la cámara, con la partícula que da vueltas en el centro.
// Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
type V3 = [number, number, number];

export type CamaraVacio = { distancia: number; elevacion: number; azimut: number; objetivo: V3 };

const suave = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

/** Pone la cámara de three donde dice `camara` (también la usa Supernova3D). */
export const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraVacio, centroY: number) => {
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
export const proyectorVacio = (camara: CamaraVacio, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.3, 400);
  colocarCamara(camera, camara, centroY);
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

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
  return m;
};

const ACERO = ['#55628A', '#4A5578'].map((c) => new THREE.Color(c));
const ACERO_OSCURO = new THREE.Color('#2A3350');
const HIELO = ['#9FD6EC', '#CFF3FF', '#7FBFDC'].map((c) => new THREE.Color(c));
const CORTE = new THREE.Color('#C4572A');
const GAS = ['#8C95A8', '#A3ACBE', '#77809A'].map((c) => new THREE.Color(c));
const AMBAR = new THREE.Color('#F5A623');
const BLANCO = new THREE.Color('#FFF9EC');

// --- El tubo del acelerador ------------------------------------------------------------------------------------

/** Tubo a lo largo de z: de z = CERCA (hacia la cámara) a z = LEJOS; radio RADIO. Abierto por arriba. */
export const TUBO = { radio: 2, cerca: 16, lejos: -40, paso: 0.5 };
const NA = 26;
const NZ = Math.round((TUBO.cerca - TUBO.lejos) / TUBO.paso);
const abierto = (a: number) => Math.sin(a) > 0.3;
const N_MOL = 150;
/** Las moléculas con `vive` mayor que esto quedan después de vaciar el tubo. */
const QUEDAN = 0.88;
const PAQUETES = 3;
const POR_PAQUETE = 5;
const VELOCIDAD = 1.1;
/** z donde un paquete choca con la molécula del eje (si hay choque). */
export const Z_CHOQUE = -3;

export type EstadoTubo = {
  /** Reloj (fotogramas del video completo). */
  t: number;
  /** 0–1: casi todas las moléculas desaparecen. */
  vaciar: number;
  /** 0–1: la escarcha cubre las paredes (de cerca hacia lejos). */
  frio: number;
  /** 0–1: las moléculas que quedan vuelan a la pared y se congelan ahí. */
  pegar: number;
  /** Fotograma (en `t`) en que un paquete choca con la molécula del eje (ver `siguientePaso`); sin él, esa molécula
   *  no está. */
  choque?: number;
};

const crearMoleculas = () =>
  Array.from({ length: N_MOL }, (_, i) => {
    const r = (k: string) => random(`tubo-mol-${i}-${k}`);
    const rad = 1.55 * Math.sqrt(r('r'));
    const a = r('a') * Math.PI * 2;
    // Las que se quedan terminan en la mitad de abajo de la pared (la que se ve).
    const pared = Math.PI + 0.35 + r('p') * (Math.PI - 0.7);
    return { i, x: rad * Math.cos(a), y: rad * Math.sin(a), z: mezclar(r('z'), TUBO.cerca - 4, TUBO.lejos + 6), vive: i === 0 ? 0 : r('v'), pared, fase: r('f') * 6.28, r };
  });

/** Lugar de la molécula `m` en el fotograma `t` (la 0 está en el eje, donde la choca el protón). */
const lugarMolecula = (m: ReturnType<typeof crearMoleculas>[number], e: EstadoTubo): V3 => {
  if (m.i === 0) {
    const tras = e.choque !== undefined ? Math.max(0, e.t - e.choque) : 0;
    return [0.4 * tras, 0.25 * tras, Z_CHOQUE - 0.6 * tras];
  }
  const dx = 0.18 * Math.sin(e.t * 0.05 + m.fase);
  const dy = 0.18 * Math.cos(e.t * 0.043 + m.fase * 1.3);
  const dz = 0.35 * Math.sin(e.t * 0.031 + m.fase * 0.7);
  const libre: V3 = [m.x + dx, m.y + dy, m.z + dz];
  const p = suave((e.pegar - m.r('pega') * 0.4) / 0.6);
  const pared: V3 = [(TUBO.radio - 0.22) * Math.cos(m.pared), (TUBO.radio - 0.22) * Math.sin(m.pared), m.z];
  return [mezclar(p, libre[0], pared[0]), mezclar(p, libre[1], pared[1]), mezclar(p, libre[2], pared[2])];
};

const RECORRIDO = TUBO.cerca + 6 - (TUBO.lejos - 4);

/** Centro (z) del paquete `k` en el fotograma `t`. Viajan hacia lo lejos y vuelven a entrar por cerca. */
const zPaquete = (k: number, t: number) => {
  const z = Z_CHOQUE - VELOCIDAD * t + (k * RECORRIDO) / PAQUETES;
  const m = (((TUBO.cerca + 6 - z) % RECORRIDO) + RECORRIDO) % RECORRIDO;
  return TUBO.cerca + 6 - m;
};

/** Primer fotograma desde `t` en que un paquete pasa por la molécula del eje (para hacerlos chocar ahí). */
export const siguientePaso = (t: number) => {
  const cada = RECORRIDO / PAQUETES / VELOCIDAD;
  return Math.ceil(t / cada) * cada;
};

/** Dónde está la molécula del choque (para la ráfaga 2D). */
export const puntoChoque: V3 = [0, 0, Z_CHOQUE];

export type Tubo3DProps = EstadoTubo & { camara: CamaraVacio; centroY?: number; opacidad?: number };

const EscenaTubo: FC<Omit<Tubo3DProps, 'opacidad'>> = ({ camara, centroY = ALTO / 2, ...e }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const moleculas = useMemo(crearMoleculas, []);
  const paredes = useMemo(() => caja(new THREE.MeshLambertMaterial(), NA * NZ), []);
  const bridas = useMemo(() => caja(new THREE.MeshLambertMaterial(), NA * 9), []);
  const gas = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_MOL), []);
  const protones = useMemo(() => caja(new THREE.MeshBasicMaterial(), PAQUETES * POR_PAQUETE), []);

  // Las paredes: baldosas de acero que se hielan de cerca hacia lejos.
  let k = 0;
  const arco = ((2 * Math.PI * TUBO.radio) / NA) * 0.94;
  for (let iz = 0; iz < NZ; iz++) {
    const z = TUBO.cerca - (iz + 0.5) * TUBO.paso;
    const lejania = iz / NZ;
    for (let ia = 0; ia < NA; ia++) {
      const a = ((ia + 0.5) / NA) * Math.PI * 2;
      const i = k++;
      if (abierto(a)) {
        ocultar(paredes, i);
        continue;
      }
      const borde = abierto(a + (2 * Math.PI) / NA) || abierto(a - (2 * Math.PI) / NA);
      o.position.set(TUBO.radio * Math.cos(a), TUBO.radio * Math.sin(a), z);
      o.rotation.set(0, 0, a - Math.PI / 2);
      o.scale.set(arco, 0.16, TUBO.paso * 0.92);
      o.updateMatrix();
      paredes.setMatrixAt(i, o.matrix);
      const r = (s: string) => random(`tubo-pared-${iz}-${ia}-${s}`);
      const hielo = suave((e.frio * 1.5 - lejania * 0.9 - r('h') * 0.35) / 0.25);
      color.copy(borde ? CORTE : ACERO[(iz + ia) % 2]).lerp(HIELO[Math.floor(r('c') * 3)], borde ? hielo * 0.6 : hielo);
      if (hielo > 0.9 && random(`tubo-brillo-${iz}-${ia}-${Math.floor(e.t / 5)}`) < 0.04) color.set('#FFFFFF');
      paredes.setColorAt(i, color);
    }
  }
  listo(paredes);

  // Bridas: aros más gruesos cada tanto, como las uniones de un tubo de verdad.
  k = 0;
  for (let b = 0; b < 9; b++) {
    const z = TUBO.cerca - 1 - b * 5.5;
    for (let ia = 0; ia < NA; ia++) {
      const a = ((ia + 0.5) / NA) * Math.PI * 2;
      const i = k++;
      if (abierto(a)) {
        ocultar(bridas, i);
        continue;
      }
      o.position.set((TUBO.radio + 0.14) * Math.cos(a), (TUBO.radio + 0.14) * Math.sin(a), z);
      o.rotation.set(0, 0, a - Math.PI / 2);
      o.scale.set(arco * 1.08, 0.34, 0.36);
      o.updateMatrix();
      bridas.setMatrixAt(i, o.matrix);
      color.copy(ACERO_OSCURO).lerp(HIELO[0], 0.7 * suave((e.frio * 1.5 - (b / 9) * 0.9) / 0.25));
      bridas.setColorAt(i, color);
    }
  }
  listo(bridas);

  // El gas: casi todo se va al vaciar; lo que queda se pega a la pared y se congela.
  moleculas.forEach((m) => {
    const [x, y, z] = lugarMolecula(m, e);
    const sale = m.i === 0 ? (e.choque !== undefined ? suave((e.t - e.choque) / 14) : 1) : m.vive > QUEDAN ? 0 : suave((e.vaciar - (m.vive / QUEDAN) * 0.7) / 0.3);
    if (sale >= 1) {
      ocultar(gas, m.i);
      return;
    }
    const l = 0.26 * (1 - sale);
    o.position.set(x, y, z);
    o.rotation.set(m.fase, m.fase * 0.7 + e.t * 0.02, 0);
    o.scale.setScalar(l);
    o.updateMatrix();
    gas.setMatrixAt(m.i, o.matrix);
    // Pegadas a la pared siguen grises (sobre la escarcha clara se ven bien).
    gas.setColorAt(m.i, GAS[m.i % 3]);
  });
  listo(gas);

  // Los paquetes de protones: cubitos ámbar en fila sobre el eje.
  for (let p = 0; p < PAQUETES; p++) {
    const zc = zPaquete(p, e.t);
    for (let q = 0; q < POR_PAQUETE; q++) {
      const i = p * POR_PAQUETE + q;
      o.position.set(0, 0, zc + q * 0.32);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(q === 0 ? 0.26 : 0.2 - q * 0.025);
      o.updateMatrix();
      protones.setMatrixAt(i, o.matrix);
      protones.setColorAt(i, q === 0 ? BLANCO : AMBAR);
    }
  }
  listo(protones);

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[-4, 10, 8]} intensity={1.2} />
      <directionalLight position={[6, -4, 4]} intensity={0.3} color="#ffd9a8" />
      <primitive object={paredes} />
      <primitive object={bridas} />
      <primitive object={gas} />
      <primitive object={protones} />
      {/* El haz: una línea tenue sobre el eje */}
      <mesh position={[0, 0, (TUBO.cerca + TUBO.lejos) / 2]}>
        <boxGeometry args={[0.05, 0.05, TUBO.cerca - TUBO.lejos]} />
        <meshBasicMaterial color="#F5A623" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </>
  );
};

/** El tubo 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Tubo3D: FC<Tubo3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 400, position: [0, 0, 40] }}>
        <EscenaTubo {...props} />
      </LienzoTres>
    </div>
  );

// --- La trampa de antimateria ----------------------------------------------------------------------------------

/** Medidas: anillos (electrodos) de radio ANILLO, dentro de un cilindro de radio LATA y alto ALTO_LATA, centrado en 0. */
export const TRAMPA = { anillo: 1.25, anillos: 7, altoAnillo: 0.5, junta: 0.14, lata: 2.1, altoLata: 6.4 };
const NA_ANILLO = 30;
const NA_LATA = 36;
const NY_LATA = 14;
const N_ESCARCHA = 140;
const N_VAPOR = 60;
const ORO = ['#D9A441', '#C08A2E', '#E6B85C'].map((c) => new THREE.Color(c));
const COBRE = new THREE.Color('#C77A3A');

export type EstadoTrampa = {
  t: number;
  /** 0–1: el cilindro se hiela y suelta vapor frío. */
  helada: number;
  /** 0–1: la partícula aparece (crece) en el centro. */
  particula: number;
};

/** Diferencia entre dos ángulos (radianes), de 0 a π. */
const entre = (a: number, b: number) => Math.abs(((((a - b) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);

/** Dónde está la partícula: da vueltitas en el centro de la trampa. */
export const lugarParticula = (t: number): V3 => [0.32 * Math.cos(t * 0.33), 0.22 * Math.sin(t * 0.11), 0.32 * Math.sin(t * 0.33)];

export type Trampa3DProps = EstadoTrampa & { camara: CamaraVacio; centroY?: number; opacidad?: number };

const EscenaTrampa: FC<Omit<Trampa3DProps, 'opacidad'>> = ({ camara, centroY = ALTO / 2, ...e }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const az = (camara.azimut * Math.PI) / 180;
  const anillos = useMemo(() => caja(new THREE.MeshLambertMaterial(), NA_ANILLO * TRAMPA.anillos), []);
  const lata = useMemo(() => caja(new THREE.MeshLambertMaterial(), NA_LATA * (NY_LATA + 4)), []);
  const escarcha = useMemo(() => caja(new THREE.MeshLambertMaterial(), N_ESCARCHA), []);
  const vapor = useMemo(() => caja(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.35, depthWrite: false }), N_VAPOR), []);
  const particula = useMemo(() => caja(new THREE.MeshBasicMaterial(), 2), []);

  // Los electrodos: aros dorados apilados, abiertos del lado de la cámara (el del medio, de cobre).
  const paso = TRAMPA.altoAnillo + TRAMPA.junta;
  let k = 0;
  for (let n = 0; n < TRAMPA.anillos; n++) {
    const y = (n - (TRAMPA.anillos - 1) / 2) * paso;
    for (let ia = 0; ia < NA_ANILLO; ia++) {
      const a = ((ia + 0.5) / NA_ANILLO) * Math.PI * 2;
      const i = k++;
      if (entre(a, az) < 1.05) {
        ocultar(anillos, i);
        continue;
      }
      o.position.set(TRAMPA.anillo * Math.sin(a), y, TRAMPA.anillo * Math.cos(a));
      o.rotation.set(0, a, 0);
      o.scale.set(((2 * Math.PI * TRAMPA.anillo) / NA_ANILLO) * 0.96, TRAMPA.altoAnillo, 0.32);
      o.updateMatrix();
      anillos.setMatrixAt(i, o.matrix);
      anillos.setColorAt(i, n === (TRAMPA.anillos - 1) / 2 ? COBRE : ORO[(ia + n) % 3]);
    }
  }
  listo(anillos);

  // El cilindro de acero (y sus dos bridas), abierto del lado de la cámara, que se hiela de abajo hacia arriba.
  k = 0;
  const altoBaldosa = TRAMPA.altoLata / NY_LATA;
  for (let iy = -2; iy < NY_LATA + 2; iy++) {
    const brida = iy < 0 || iy >= NY_LATA;
    const y = brida ? (iy < 0 ? -TRAMPA.altoLata / 2 - 0.2 * (iy + 2) - 0.1 : TRAMPA.altoLata / 2 + 0.2 * (iy - NY_LATA) + 0.1) : -TRAMPA.altoLata / 2 + (iy + 0.5) * altoBaldosa;
    const rad = brida ? TRAMPA.lata + 0.25 : TRAMPA.lata;
    for (let ia = 0; ia < NA_LATA; ia++) {
      const a = ((ia + 0.5) / NA_LATA) * Math.PI * 2;
      const i = k++;
      const diferencia = entre(a, az);
      if (diferencia < 1.2) {
        ocultar(lata, i);
        continue;
      }
      const borde = diferencia < 1.2 + (2 * Math.PI) / NA_LATA;
      o.position.set(rad * Math.sin(a), y, rad * Math.cos(a));
      o.rotation.set(0, a, 0);
      o.scale.set(((2 * Math.PI * rad) / NA_LATA) * 0.95, brida ? 0.2 : altoBaldosa * 0.93, brida ? 0.4 : 0.16);
      o.updateMatrix();
      lata.setMatrixAt(i, o.matrix);
      const r = (s: string) => random(`trampa-lata-${iy}-${ia}-${s}`);
      const hielo = suave((e.helada * 1.6 - ((iy + 2) / (NY_LATA + 4)) * 0.8 - r('h') * 0.3) / 0.25);
      color.copy(borde ? CORTE : brida ? ACERO_OSCURO : ACERO[(iy + ia) % 2]).lerp(HIELO[Math.floor(r('c') * 3)], borde ? hielo * 0.5 : hielo);
      if (hielo > 0.9 && random(`trampa-brillo-${iy}-${ia}-${Math.floor(e.t / 5)}`) < 0.035) color.set('#FFFFFF');
      lata.setColorAt(i, color);
    }
  }
  listo(lata);

  // Escarcha: cristalitos blancos pegados por fuera del cilindro.
  for (let i = 0; i < N_ESCARCHA; i++) {
    const r = (s: string) => random(`trampa-escarcha-${i}-${s}`);
    const a = r('a') * Math.PI * 2;
    const ve = suave((e.helada - r('t') * 0.7) / 0.3);
    if (ve <= 0 || entre(a, az) < 1.25) {
      ocultar(escarcha, i);
      continue;
    }
    const y = mezclar(r('y'), -TRAMPA.altoLata / 2, TRAMPA.altoLata / 2);
    o.position.set((TRAMPA.lata + 0.12) * Math.sin(a), y, (TRAMPA.lata + 0.12) * Math.cos(a));
    o.rotation.set(r('x') * 3, a, r('z') * 3);
    o.scale.setScalar((0.08 + 0.1 * r('l')) * ve);
    o.updateMatrix();
    escarcha.setMatrixAt(i, o.matrix);
    escarcha.setColorAt(i, HIELO[1]);
  }
  listo(escarcha);

  // Vapor frío que cae por los lados.
  for (let i = 0; i < N_VAPOR; i++) {
    const r = (s: string) => random(`trampa-vapor-${i}-${s}`);
    if (e.helada <= 0.2) {
      ocultar(vapor, i);
      continue;
    }
    const vida = 70 + r('v') * 40;
    const edad = ((e.t + r('f') * vida) % vida) / vida;
    const a = r('a') * Math.PI * 2;
    const rad = TRAMPA.lata + 0.3 + edad * 0.6 + r('r') * 0.3;
    o.position.set(rad * Math.sin(a), -TRAMPA.altoLata / 2 + 1.5 - edad * 2.4 + r('y') * 1.5, rad * Math.cos(a));
    o.rotation.set(edad * 2, a, 0);
    o.scale.setScalar((0.07 + 0.1 * r('l')) * Math.sin(Math.PI * edad) * suave((e.helada - 0.2) / 0.4));
    o.updateMatrix();
    vapor.setMatrixAt(i, o.matrix);
    vapor.setColorAt(i, HIELO[1]);
  }
  listo(vapor);

  // La partícula: núcleo blanco y una caja cian alrededor (el brillo lo pone el 2D).
  const [px, py, pz] = lugarParticula(e.t);
  [0, 1].forEach((i) => {
    if (e.particula <= 0) return ocultar(particula, i);
    o.position.set(px, py, pz);
    o.rotation.set(e.t * 0.05, e.t * 0.07, 0);
    o.scale.setScalar((i === 0 ? 0.14 : 0.26) * e.particula);
    o.updateMatrix();
    particula.setMatrixAt(i, o.matrix);
    particula.setColorAt(i, i === 0 ? new THREE.Color('#FFFFFF') : new THREE.Color('#3DD6F5'));
  });
  listo(particula);

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[-5, 9, 7]} intensity={1.1} />
      <directionalLight position={[6, -3, -4]} intensity={0.35} color="#9fdcf2" />
      <primitive object={anillos} />
      <primitive object={lata} />
      <primitive object={escarcha} />
      <primitive object={particula} />
      <primitive object={vapor} />
    </>
  );
};

/** La trampa 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Trampa3D: FC<Trampa3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 400, position: [0, 0, 40] }}>
        <EscenaTrampa {...props} />
      </LienzoTres>
    </div>
  );
