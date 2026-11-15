// La Tierra de Anaximandro en 3D: un tambor de piedra hecho de cubitos (tres veces más ancho que alto),
// con la cara de arriba habitada y el océano alrededor, flotando sola en el centro de una esfera de
// estrellas. Desde el centro salen líneas de igual largo hacia el cielo, con pulsos que llegan a la vez.
// La cámara y todo el movimiento salen del fotograma: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { TAMBOR } from './Tambor';
import { bb } from './tema';

const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
/** Distancia de cámara a la que el tambor mide en pantalla lo mismo que el `Tambor` 2D (radio 230 px). */
export const DISTANCIA_2D = ALTO / (2 * TAN * TAMBOR.rx);

const R = 9; // radio en cubitos
const PISOS = 6; // alto en cubitos (18 de ancho: tres veces el alto)
const CIELO = 2.7; // radio de la esfera de estrellas (en radios de la Tierra)

const ESTRATOS = ['#7E3F22', '#A84824', '#8E3D1E', '#B4642E', '#C4572A'];
const TIERRA = ['#D49A3A', '#E39A2C', '#F5A623', '#C9821A', '#C4572A'];

type Cubo = { x: number; y: number; z: number; color: THREE.Color };

const crearCubos = (): Cubo[] => {
  const lista: Cubo[] = [];
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const d = Math.hypot(x, z);
      if (d > R + 0.3) continue;
      for (let y = 0; y < PISOS; y++) {
        // Solo la cáscara: lo de adentro no se ve.
        if (y > 0 && y < PISOS - 1 && d < R - 1.2) continue;
        const r = (k: string) => random(`tierra3d-${x}-${y}-${z}-${k}`);
        let hex: string;
        if (y === PISOS - 1) {
          // La cara habitada: tierra en el medio y el océano que la rodea.
          hex = d > R - 1.6 ? (r('o') > 0.4 ? '#2F6FA3' : '#1D3F66') : TIERRA[Math.floor(r('t') * TIERRA.length)];
        } else {
          hex = ESTRATOS[y % ESTRATOS.length];
        }
        const color = new THREE.Color(hex);
        color.offsetHSL(0, 0, (r('l') - 0.5) * 0.08);
        lista.push({ x, y, z, color });
      }
    }
  }
  return lista;
};

/** Puntos de la esfera del cielo (repartidos parejo) y un anillo en el ecuador. */
const crearEstrellas = () => {
  const puntos: THREE.Vector3[] = [];
  const n = 70;
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    puntos.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr).multiplyScalar(CIELO));
  }
  const anillo: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    anillo.push(new THREE.Vector3(Math.cos(a) * CIELO, 0, Math.sin(a) * CIELO));
  }
  return { puntos, anillo };
};

/** Direcciones de las líneas de igual largo: las seis del eje y ocho en diagonal. */
const RAYOS: THREE.Vector3[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1],
].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());

export type Tierra3DProps = {
  /** Reloj propio (fotogramas), que sigue corriendo entre escenas. */
  t: number;
  /** Altura y giro de la cámara (grados) y distancia (en radios de la Tierra). */
  elevacion: number;
  azimut: number;
  distancia: number;
  /** Altura del centro de la Tierra en el video (px). */
  centroY?: number;
  /** 0–1: aparece la esfera de estrellas. */
  cielo?: number;
  /** 0–1: se dibujan las líneas hacia el cielo. */
  lineas?: number;
  /** Fotograma (del reloj `t`) desde el que corren los pulsos por las líneas. */
  pulsos?: number;
  opacidad?: number;
};

const Escena: FC<Tierra3DProps> = ({ t, elevacion, azimut, distancia, centroY = ALTO / 2, cielo = 0, lineas = 0, pulsos }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const el = (elevacion * Math.PI) / 180;
  const az = (azimut * Math.PI) / 180;
  camera.position.set(distancia * Math.cos(el) * Math.sin(az), distancia * Math.sin(el), distancia * Math.cos(el) * Math.cos(az));
  camera.lookAt(0, 0, 0);
  // Corre el cuadro para que el centro de la Tierra caiga en `centroY` y no en el medio del video.
  camera.setViewOffset(camera.aspect * ALTO, ALTO, 0, ALTO / 2 - centroY, camera.aspect * ALTO, ALTO);
  camera.updateProjectionMatrix();

  const cubos = useMemo(crearCubos, []);
  const malla = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), new THREE.MeshLambertMaterial(), cubos.length);
    const o = new THREE.Object3D();
    cubos.forEach((c, i) => {
      o.position.set(c.x, c.y - (PISOS - 1) / 2, c.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.color);
    });
    return m;
  }, [cubos]);
  const { puntos, anillo } = useMemo(crearEstrellas, []);
  const estrellas = useMemo(() => [...puntos, ...anillo], [puntos, anillo]);
  const mallaEstrellas = useMemo(
    () => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: bb.ambar, transparent: true }), estrellas.length),
    [estrellas],
  );
  const o = new THREE.Object3D();
  estrellas.forEach((p, i) => {
    const r = random(`cielo3d-${i}`);
    const entra = Math.max(0, Math.min(1, cielo * 1.6 - r * 0.6));
    const titila = 0.75 + 0.25 * Math.sin(t * (0.08 + r * 0.1) + r * 9);
    const lado = (i >= puntos.length ? 0.07 : 0.055) * entra * titila;
    o.position.copy(p);
    o.rotation.set(0.6, 0.8, 0);
    o.scale.setScalar(Math.max(0.0001, lado));
    o.updateMatrix();
    mallaEstrellas.setMatrixAt(i, o.matrix);
  });
  mallaEstrellas.instanceMatrix.needsUpdate = true;
  (mallaEstrellas.material as THREE.MeshBasicMaterial).opacity = Math.min(1, cielo * 1.4);

  // Flota y gira despacio.
  const flota = Math.sin(t * 0.07) * 0.035;
  const giro = t * 0.006;
  // Todos los pulsos salen juntos del centro y llegan juntos al cielo: misma distancia.
  const fase = pulsos === undefined || t < pulsos ? -1 : ((t - pulsos) % 36) / 36;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[-4, 8, 6]} intensity={1.4} />
      <directionalLight position={[6, -3, 3]} intensity={0.35} color="#ffd9a8" />
      <group position={[0, flota, 0]} rotation={[0, giro, 0]} scale={1 / (R + 0.5)}>
        <primitive object={malla} />
      </group>
      <primitive object={mallaEstrellas} />
      {lineas > 0 &&
        RAYOS.map((d, i) => {
          const largo = CIELO * lineas;
          const medio = d.clone().multiplyScalar(largo / 2);
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
          return (
            <group key={i}>
              <mesh position={medio} quaternion={q}>
                <cylinderGeometry args={[0.011, 0.011, largo, 6]} />
                <meshBasicMaterial color={bb.ambar} transparent opacity={0.75} />
              </mesh>
              {fase >= 0 && (
                <mesh position={d.clone().multiplyScalar(CIELO * fase)}>
                  <boxGeometry args={[0.07, 0.07, 0.07]} />
                  <meshBasicMaterial color={bb.hueso} transparent opacity={1 - fase * 0.5} />
                </mesh>
              )}
            </group>
          );
        })}
    </>
  );
};

/** La Tierra flotando, del tamaño del cuadro entero (sin bordes visibles). */
export const Tierra3D: FC<Tierra3DProps> = ({ opacidad = 1, ...props }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
    <LienzoTres flat camera={{ fov: FOV, near: 0.05, far: 100, position: [0, 0, DISTANCIA_2D] }}>
      <Escena {...props} />
    </LienzoTres>
  </div>
);
