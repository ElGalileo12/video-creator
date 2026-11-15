// El mapa de Anaximandro en 3D: el mismo disco de cuadraditos de Mapa2D hecho cubitos (las tierras un piso
// más altas que el mar, dos pisos de piedra debajo, como la cara de arriba de su Tierra-tambor).
// Visto desde arriba con `distanciaMapa(radioPx)` coincide con el dibujo 2D. La cámara y todo el movimiento
// salen del fotograma: nada de animaciones propias de three. Los textos van en 2D encima, con `proyectarMapa`.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { CELDAS, celdasMapa } from './Mapamundi';
import { bb } from './tema';

const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
const LADO = 2 / CELDAS;
/** Altura de la superficie de las tierras y del agua (para poner etiquetas encima). */
export const ALTURA_TIERRA = 1.5 * LADO;
export const ALTURA_AGUA = 0.5 * LADO;

/** Distancia de cámara a la que el disco mide `radioPx` en pantalla visto desde arriba. */
export const distanciaMapa = (radioPx: number) => ALTO / (2 * TAN * radioPx);

export type CamaraMapa = {
  /** Grados sobre el horizonte (90 = desde arriba, con el norte arriba). */
  elevacion: number;
  /** Giro alrededor del disco, en grados. */
  azimut: number;
  distancia: number;
  /** Altura del centro del disco en el video (px). */
  centroY: number;
};

const ajustar = (camara: THREE.PerspectiveCamera, c: CamaraMapa) => {
  // Justo en 90° la cámara no sabe hacia dónde es «arriba»: se queda un pelo antes.
  const el = (Math.min(89.6, c.elevacion) * Math.PI) / 180;
  const az = (c.azimut * Math.PI) / 180;
  camara.position.set(c.distancia * Math.cos(el) * Math.sin(az), c.distancia * Math.sin(el), c.distancia * Math.cos(el) * Math.cos(az));
  camara.up.set(0, 1, 0);
  camara.lookAt(0, 0, 0);
  camara.setViewOffset(camara.aspect * ALTO, ALTO, 0, ALTO / 2 - c.centroY, camara.aspect * ALTO, ALTO);
  camara.updateProjectionMatrix();
  camara.updateMatrixWorld();
};

/** Dónde cae en el video (px) el punto (u, v) del mapa, a la altura `alto`. */
export const proyectarMapa = (u: number, v: number, c: CamaraMapa, alto = ALTURA_TIERRA) => {
  const camara = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.05, 100);
  ajustar(camara, c);
  const p = new THREE.Vector3(u, alto, v).project(camara);
  return { x: ((p.x + 1) / 2) * ANCHO, y: ((1 - p.y) / 2) * ALTO };
};

const ESTRATOS = ['#8E3D1E', '#7E3F22'];

type Cubo = { x: number; y: number; z: number; color: THREE.Color; oceano: boolean; angulo: number };

const crearCubos = (): Cubo[] => {
  const lista: Cubo[] = [];
  for (const c of celdasMapa()) {
    const r = Math.hypot(c.u, c.v);
    const color = new THREE.Color(c.color);
    const tierra = c.tipo === 'europa' || c.tipo === 'asia' || c.tipo === 'libia';
    const base = { x: c.u, z: c.v, oceano: c.tipo === 'oceano', angulo: Math.atan2(c.v, c.u) };
    // Las tierras llevan un cubito más: asoman sobre el agua.
    lista.push({ ...base, y: tierra ? LADO : 0, color });
    if (tierra) lista.push({ ...base, y: 0, color: color.clone().multiplyScalar(0.8), oceano: false });
    // Los pisos de piedra solo hacen falta en el borde (lo de adentro no se ve).
    if (r > 1 - 2.2 * LADO) ESTRATOS.forEach((e, k) => lista.push({ ...base, y: -(k + 1) * LADO, color: new THREE.Color(e), oceano: false }));
  }
  return lista;
};

const VERDE = new THREE.Color(bb.verde);

export type Mapa3DProps = {
  camara: CamaraMapa;
  /** 0–1: brillo verde que da la vuelta al océano (0 = apagado). */
  oceano?: number;
  /** Anillo que se dibuja alrededor del disco: cuánto de la vuelta (0–1), color y radio. */
  anillo?: { arco: number; color: string; radio?: number; opacidad?: number };
  opacidad?: number;
};

const Escena: FC<Mapa3DProps> = ({ camara, oceano = 0, anillo }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(camera, camara);

  const cubos = useMemo(crearCubos, []);
  const malla = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(LADO * 0.97, LADO * 0.97, LADO * 0.97), new THREE.MeshLambertMaterial(), cubos.length);
    const o = new THREE.Object3D();
    cubos.forEach((c, i) => {
      o.position.set(c.x, c.y, c.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.color);
    });
    return m;
  }, [cubos]);

  // El océano se enciende en verde con una ola que da la vuelta al disco y queda con un tinte suave.
  const tinte = new THREE.Color();
  cubos.forEach((c, i) => {
    if (!c.oceano) return;
    const o = oceano * 1.2;
    const vuelta = ((c.angulo + Math.PI) / (2 * Math.PI)) * 0.6;
    const ola = Math.max(0, Math.min(1, (o - vuelta) * 4));
    const brillo = ola * (1 - 0.6 * Math.max(0, Math.min(1, (o - vuelta - 0.25) * 3)));
    tinte.copy(c.color).lerp(VERDE, brillo);
    malla.setColorAt(i, tinte);
  });
  if (malla.instanceColor) malla.instanceColor.needsUpdate = true;

  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Desde casi arriba: las caras de arriba quedan con su color de siempre (como en el 2D) y los lados más oscuros. */}
      <directionalLight position={[-2, 10, 4]} intensity={0.55} />
      <directionalLight position={[3, 2, 8]} intensity={0.15} color="#ffd9a8" />
      <primitive object={malla} />
      {anillo && anillo.arco > 0 && (
        <mesh position={[0, ALTURA_AGUA + 0.004, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
          <torusGeometry args={[(anillo.radio ?? 1) * (1 + LADO * 0.2), 0.011, 6, 180, Math.PI * 2 * Math.min(1, anillo.arco)]} />
          <meshBasicMaterial color={anillo.color} transparent opacity={anillo.opacidad ?? 1} />
        </mesh>
      )}
    </>
  );
};

/** El disco del mapa, del tamaño del cuadro entero (sin bordes visibles). */
export const Mapa3D: FC<Mapa3DProps> = ({ opacidad = 1, ...props }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
    <LienzoTres flat camera={{ fov: FOV, near: 0.05, far: 100, position: [0, 0, 10] }}>
      <Escena {...props} />
    </LienzoTres>
  </div>
);
