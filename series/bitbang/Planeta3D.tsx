// Logo de BitBang en 3D: el planeta de píxeles (cubitos en franjas ámbar y terracota, con su mancha)
// y las líneas verdes de su campo magnético. Nace de un destello que explota en cubitos, que se
// acomodan en la esfera, y luego gira despacio. Todo sale del fotograma actual.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { tramo } from '../../src/escena';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { bb } from './tema';

const FOV = 30;
const DISTANCIA = 20;
/** Píxeles del video por unidad del mundo 3D, en el plano del planeta. */
const PX_POR_UNIDAD = ALTO / (2 * DISTANCIA * Math.tan(((FOV / 2) * Math.PI) / 180));
const RADIO = 10; // en cubitos

// Franjas de arriba (1) abajo (−1), como en el logo.
const FRANJAS: [number, string][] = [
  [0.86, '#A86A1C'],
  [0.7, '#C9821A'],
  [0.52, '#E39A2C'],
  [0.36, '#F5A623'],
  [0.22, '#C4572A'],
  [0.06, '#F2C46D'],
  [-0.1, '#F5A623'],
  [-0.26, '#E7C88F'],
  [-0.42, '#C4572A'],
  [-0.58, '#D49A3A'],
  [-0.76, '#A9562C'],
  [-1.01, '#7E3F22'],
];

type Voxel = { pos: THREE.Vector3; color: THREE.Color; verde: boolean; retraso: number; giro: THREE.Vector3 };

const crearVoxeles = (): Voxel[] => {
  const lista: Voxel[] = [];
  let i = 0;
  for (let x = -RADIO; x <= RADIO; x++) {
    for (let y = -RADIO; y <= RADIO; y++) {
      for (let z = -RADIO; z <= RADIO; z++) {
        const d = Math.hypot(x, y, z);
        if (d > RADIO + 0.45 || d < RADIO - 1.3) continue;
        const r = (k: string) => random(`bb-planeta-${i}-${k}`);
        const lat = y / RADIO + (r('n') - 0.5) * 0.09;
        const lon = Math.atan2(z, x);
        let hex = FRANJAS.find(([desde]) => lat >= desde)?.[1] ?? FRANJAS.at(-1)![1];
        // La gran mancha, un poco por debajo del ecuador.
        if (lat > -0.36 && lat < -0.12 && lon > 0.25 && lon < 0.95) hex = r('m') > 0.3 ? '#A3402B' : '#8E3324';
        const color = new THREE.Color(hex);
        if (r('s') < 0.18) color.offsetHSL(0, 0, (r('l') - 0.5) * 0.12);
        lista.push({
          pos: new THREE.Vector3(x, y, z),
          color,
          verde: r('v') < 0.3,
          retraso: r('d') * 10,
          giro: new THREE.Vector3(r('gx') - 0.5, r('gy') - 0.5, r('gz') - 0.5).multiplyScalar(8),
        });
        i++;
      }
    }
  }
  return lista;
};

/** Una línea de campo: sale de un polo, se abre hasta el ecuador y llega al otro polo. */
const curvaCampo = (ancho: number, alto: number, plano: number, lado: 1 | -1) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 41 }, (_, k) => {
      const th = (k / 40) * Math.PI;
      const x = lado * ancho * Math.pow(Math.sin(th), 1.5);
      return new THREE.Vector3(x * Math.cos(plano), alto * Math.cos(th), x * Math.sin(plano));
    }),
  );

const VERDE = new THREE.Color(bb.verde);
const AMBAR = new THREE.Color(bb.ambar);

const Escena: FC<{ desde: number; tamano: number; yMundo: number }> = ({ desde, tamano, yMundo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera } = useThree();
  camera.position.set(0, 0, DISTANCIA);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  const voxeles = useMemo(crearVoxeles, []);
  const malla = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.94, 0.94, 0.94), new THREE.MeshLambertMaterial(), voxeles.length);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(voxeles.length * 3), 3);
    return m;
  }, [voxeles]);
  const lineas = useMemo(
    () =>
      [0, Math.PI / 3, (2 * Math.PI) / 3].flatMap((plano) =>
        ([1, -1] as const).map((lado) => new THREE.TubeGeometry(curvaCampo(RADIO * 1.42, RADIO * 1.14, plano, lado), 120, 0.11, 6, false)),
      ),
    [],
  );

  // Cada cubito sale del centro, se pasa un poco y se acomoda (resorte con rebote).
  const objeto = new THREE.Object3D();
  const c = new THREE.Color();
  voxeles.forEach((v, i) => {
    const s = frame < desde + v.retraso ? 0 : spring({ frame: frame - desde - v.retraso, fps, config: { damping: 9, stiffness: 70, mass: 0.6 } });
    const suelto = Math.max(0, 1 - s);
    objeto.position.copy(v.pos).multiplyScalar(s);
    objeto.rotation.set(v.giro.x * suelto, v.giro.y * suelto, v.giro.z * suelto);
    objeto.scale.setScalar(s <= 0 ? 0.0001 : 0.5 + 0.5 * Math.min(1, s));
    objeto.updateMatrix();
    malla.setMatrixAt(i, objeto.matrix);
    const asentado = tramo(frame, desde + v.retraso + 14, 14);
    c.copy(v.verde ? VERDE : AMBAR).lerp(v.color, asentado);
    malla.setColorAt(i, c);
  });
  malla.instanceMatrix.needsUpdate = true;
  malla.instanceColor!.needsUpdate = true;

  const campo = tramo(frame, desde + 22, 28);
  const giroY = -0.5 + (frame - desde) * 0.013;

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-6, 8, 10]} intensity={1.5} />
      <directionalLight position={[8, -4, 4]} intensity={0.35} color="#ffd9a8" />
      <group position={[0, yMundo, 0]} scale={tamano} rotation={[0.2, 0, -0.1]}>
        <group rotation={[0, giroY, 0]}>
          <primitive object={malla} />
          {lineas.map((geometria, i) => {
            geometria.setDrawRange(0, Math.floor((geometria.index?.count ?? 0) * campo));
            return (
              <mesh key={i} geometry={geometria} visible={campo > 0}>
                <meshBasicMaterial color={bb.verde} transparent opacity={0.9} />
              </mesh>
            );
          })}
        </group>
      </group>
    </>
  );
};

type Props = {
  /** Fotograma de la escena en que el destello explota en cubitos. */
  desde: number;
  /** Altura del centro del planeta en el video (px). */
  centroY?: number;
  /** Radio del planeta en el video (px). */
  radio?: number;
  opacidad?: number;
};

/** El logo 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Planeta3D: FC<Props> = ({ desde, centroY = 800, radio = 230, opacidad = 1 }) => {
  const tamano = radio / PX_POR_UNIDAD / RADIO;
  const yMundo = (ALTO / 2 - centroY) / PX_POR_UNIDAD;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, DISTANCIA] }}>
        <Escena desde={desde} tamano={tamano} yMundo={yMundo} />
      </LienzoTres>
    </div>
  );
};
