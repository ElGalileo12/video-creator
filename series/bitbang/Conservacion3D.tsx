// Cambio y permanencia en 3D (cap 6): un montón de cubitos ámbar que nunca se quedan quietos («CAMBIO») y un bloque
// verde macizo («PERMANENCIA») se acercan y se funden: el bloque queda como núcleo y los ámbar fluyen alrededor.
// Después esa pieza se vuelve la pesa de un péndulo que cuelga de una viga (`pendulo`, `angulo`).
// Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
const LADO = 4;
const N = LADO ** 3;
/** Largo del péndulo: la viga está en y = LARGO y la pesa, en reposo, en el origen. */
export const LARGO_PENDULO = 9;
const HILO = 16;
const VIGA = 9;
const TOTAL = 2 * N + HILO + VIGA;

type V3 = [number, number, number];

export type CamaraConservacion = { distancia: number; elevacion: number; azimut: number; objetivo: V3 };

const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraConservacion, centroY: number) => {
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

/** Dónde cae en el video (px) un punto del mundo, con esa cámara: para poner rótulos 2D encima. */
export const proyectorConservacion = (camara: CamaraConservacion, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.5, 400);
  colocarCamara(camera, camara, centroY);
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

/** Centro de la pesa del péndulo con ese ángulo (grados; positivo = hacia la derecha). */
export const pesaPendulo = (angulo: number): V3 => {
  const a = (angulo * Math.PI) / 180;
  return [LARGO_PENDULO * Math.sin(a), LARGO_PENDULO * (1 - Math.cos(a)), 0];
};

/** Separación (en x) de cada montón al principio. */
export const SEPARACION = 4.0;
/** Radio de la cáscara ámbar alrededor del núcleo verde. */
const CASCARA = 3.7;

const crear = () =>
  Array.from({ length: N }, (_, id) => {
    const r = (k: string) => random(`conserva-${id}-${k}`);
    const a = id % LADO;
    const b = Math.floor(id / LADO) % LADO;
    const c = Math.floor(id / LADO ** 2);
    const grilla: V3 = [a - 1.5, b - 1.5, c - 1.5];
    // Puntos repartidos parejo en una esfera (espiral de Fibonacci): latitud y longitud de cada cubito ámbar.
    const y = 1 - (2 * (id + 0.5)) / N;
    const lat = Math.asin(y);
    const lon = id * Math.PI * (3 - Math.sqrt(5));
    return { id, grilla, lat, lon, r };
  });

type Pieza = ReturnType<typeof crear>[number];

const AMBAR = ['#F5A623', '#FFC65C', '#E07A45', '#FFE3A0'].map((c) => new THREE.Color(c));
const VERDES = ['#39FF88', '#2BD873', '#5CFF9D'].map((c) => new THREE.Color(c));
const COLOR_HILO = new THREE.Color('#F4EFE6');
const COLOR_VIGA = new THREE.Color('#C4572A');

const suave = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};

/** Posición de un cubito ámbar (relativa al centro de su montón) cuando todavía va suelto: tiembla sin parar. */
const ambarSuelto = (p: Pieza, t: number): V3 => {
  const [gx, gy, gz] = p.grilla;
  const m = (k: string, w: number) => 0.38 * Math.sin(t * (0.09 + 0.05 * p.r(`w${k}`)) * w + 6.3 * p.r(k));
  const giro = t * 0.035;
  const x = gx * 1.12 + m('x', 1);
  const z = gz * 1.12 + m('z', 1.2);
  return [x * Math.cos(giro) + z * Math.sin(giro), gy * 1.12 + m('y', 0.9), -x * Math.sin(giro) + z * Math.cos(giro)];
};

/** Posición en la cáscara: fluye alrededor del núcleo (cada latitud gira a su ritmo). */
const ambarCascara = (p: Pieza, t: number): V3 => {
  const lon = p.lon + t * (0.05 + 0.03 * Math.cos(p.lat * 2));
  const lat = p.lat + 0.12 * Math.sin(t * 0.04 + p.lon);
  return [CASCARA * Math.cos(lat) * Math.cos(lon), CASCARA * Math.sin(lat), CASCARA * Math.cos(lat) * Math.sin(lon)];
};

export type Conservacion3DProps = {
  /** Reloj propio (fotogramas), que sigue corriendo entre escenas. */
  t: number;
  camara: CamaraConservacion;
  centroY?: number;
  /** 0–1: los cubitos llegan volando (los ámbar desde la izquierda, los verdes desde la derecha). */
  aparece?: number;
  /** 0–1: los dos montones se acercan al centro. */
  junta?: number;
  /** 0–1: los ámbar pasan a la cáscara alrededor del bloque verde. */
  funde?: number;
  /** 0–1: aparecen la viga y el hilo, y la pieza se achica hasta ser la pesa. */
  pendulo?: number;
  /** Ángulo del péndulo (grados). */
  angulo?: number;
  opacidad?: number;
};

const o = new THREE.Object3D();
const color = new THREE.Color();
const v = new THREE.Vector3();
const giroPesa = new THREE.Euler();

const Escena: FC<Conservacion3DProps> = ({ t, camara, centroY = ALTO / 2, aparece = 1, junta = 0, funde = 0, pendulo = 0, angulo = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const piezas = useMemo(crear, []);
  const malla = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), TOTAL), []);

  const sep = SEPARACION * (1 - suave(junta));
  const escala = 1 - 0.45 * suave(pendulo);
  const nucleo = 1 - 0.18 * suave(funde);
  const centro = pesaPendulo(angulo);
  giroPesa.set(0, 0, (angulo * Math.PI) / 180);
  const llegada = (p: Pieza) => suave((aparece - p.r('llega') * 0.4) / 0.6);

  /** Coloca el cubito `i`: `local` es relativo al centro de la pesa (antes de achicarla y girarla). */
  const poner = (i: number, local: V3, lado: number, lejos: V3, llega: number, c: THREE.Color) => {
    v.set(...local).multiplyScalar(escala).applyEuler(giroPesa);
    const pos: V3 = [v.x + centro[0], v.y + centro[1], v.z + centro[2]];
    o.position.set(...(pos.map((x, e) => lejos[e] + (x - lejos[e]) * llega) as V3));
    const s = Math.max(0.0001, lado * escala * llega);
    o.scale.set(s, s, s);
    o.rotation.copy(giroPesa);
    o.updateMatrix();
    malla.setMatrixAt(i, o.matrix);
    malla.setColorAt(i, c);
  };

  piezas.forEach((p, i) => {
    // Ámbar: del montón suelto (a la izquierda) a la cáscara.
    const suelto = ambarSuelto(p, t);
    const cascara = ambarCascara(p, t);
    const f = suave((funde - p.r('funde') * 0.3) / 0.7);
    const local = suelto.map((x, e) => x + (e === 0 ? -sep : 0) + (cascara[e] - x - (e === 0 ? -sep : 0)) * f) as V3;
    color.copy(AMBAR[Math.floor(random(`conserva-titila-${p.id}-${Math.floor(t / 3)}`) * AMBAR.length)]);
    poner(i, local, 0.78, [-26 + p.r('lx') * 8, (p.r('ly') - 0.5) * 16, (p.r('lz') - 0.5) * 8], llegada(p), color);
    // Verde: el bloque quieto (a la derecha), que pasa a ser el núcleo.
    const [gx, gy, gz] = p.grilla;
    poner(N + i, [gx * nucleo + sep, gy * nucleo, gz * nucleo], 0.95 * nucleo, [26 - p.r('rx') * 8, (p.r('ry') - 0.5) * 16, (p.r('rz') - 0.5) * 8], llegada(p), VERDES[Math.floor(p.r('verde') * VERDES.length)]);
  });

  // El hilo: de la viga a la pesa, crece hacia abajo.
  const a = (angulo * Math.PI) / 180;
  const largoHilo = LARGO_PENDULO - (CASCARA + 0.5) * escala;
  for (let k = 0; k < HILO; k++) {
    const u = (k + 0.5) / HILO;
    const visible = suave((pendulo * 1.3 - u) * 6);
    o.position.set(Math.sin(a) * u * largoHilo, LARGO_PENDULO - Math.cos(a) * u * largoHilo, 0);
    o.scale.setScalar(Math.max(0.0001, 0.3 * visible));
    o.rotation.set(0, 0, a);
    o.updateMatrix();
    malla.setMatrixAt(2 * N + k, o.matrix);
    malla.setColorAt(2 * N + k, COLOR_HILO);
  }
  // La viga de donde cuelga.
  for (let k = 0; k < VIGA; k++) {
    const visible = suave((pendulo - Math.abs(k - (VIGA - 1) / 2) * 0.06) * 3);
    o.position.set((k - (VIGA - 1) / 2) * 0.62, LARGO_PENDULO + 0.35, 0);
    o.scale.set(Math.max(0.0001, 0.6 * visible), Math.max(0.0001, 0.5 * visible), Math.max(0.0001, 0.6 * visible));
    o.rotation.set(0, 0, 0);
    o.updateMatrix();
    malla.setMatrixAt(2 * N + HILO + k, o.matrix);
    malla.setColorAt(2 * N + HILO + k, COLOR_VIGA);
  }
  malla.instanceMatrix.needsUpdate = true;
  malla.instanceColor!.needsUpdate = true;

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[-6, 9, 10]} intensity={1.35} />
      <directionalLight position={[8, -3, 4]} intensity={0.3} color="#ffd9a8" />
      <primitive object={malla} />
    </>
  );
};

/** La pieza 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Conservacion3D: FC<Conservacion3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.5, far: 400, position: [0, 0, 60] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
