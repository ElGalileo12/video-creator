// Por qué flota un barco de hierro (cap 8, Arquímedes): un tanque de vidrio con agua azul noche, un bloque de
// 72 cubitos de hierro que baja y se hunde, y el mismo hierro hecho láminas que arma un casco y flota. El «agua
// apartada» es una caja fantasma verde (la del bloque, chica; la del casco, grande). Las cuentas son las de verdad:
// la misma masa de hierro (densidad 7,87) en forma de casco aparta su peso en agua y flota con ese calado.
// Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
type V3 = [number, number, number];

/** Tanque (por dentro): x ∈ [−7, 7], z ∈ [−3,5, 3,5], y ∈ [0, 6,5]. */
export const TANQUE = { ancho: 14, fondo: 7, alto: 6.5 };
const AREA = TANQUE.ancho * TANQUE.fondo;
/** Altura del agua sin nada adentro. */
export const NIVEL0 = 4.0;

const N = 72;
const GROSOR = 0.08;
/** Lado de cada cubito del bloque: el mismo volumen que una lámina de 1 × 1 × GROSOR. */
const LADO = Math.cbrt(GROSOR);
const BLOQUE = { x: 6, y: 3, z: 4 };
const VOL_HIERRO = N * GROSOR;
const DENSIDAD_HIERRO = 7.87;
/** El casco: 7 × 4 de piso y dos vueltas de pared de 1 de alto. */
const CASCO = { x: 7, z: 4 };
const VOL_BARCO = VOL_HIERRO * DENSIDAD_HIERRO;
/** Cuánto se hunde el casco para apartar su peso en agua. */
export const CALADO = VOL_BARCO / (CASCO.x * CASCO.z);
export const ALTO_CASCO = GROSOR + 2;

export type CamaraFlotar = { distancia: number; elevacion: number; azimut: number; objetivo: V3 };

export type EstadoFlotar = {
  /** Reloj propio (fotogramas). */
  t: number;
  /** 0–1: el bloque baja desde arriba del agua hasta el fondo. */
  baja: number;
  /** 0–1: los cubitos se aplanan en láminas y arman el casco, que queda flotando. */
  barco: number;
  /** 0–1: se ve el agua apartada (caja verde). */
  fantasma: number;
};

const suave = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

const ALTO_BLOQUE = BLOQUE.y * LADO;
/** Centro (y) del bloque. */
const yBloque = (baja: number) => mezclar(suave(baja), NIVEL0 + 3.2, ALTO_BLOQUE / 2);

/** Parte del bloque que está bajo el agua (0–1), con el nivel sin subir (la diferencia es mínima). */
const sumergido = (baja: number) => Math.max(0, Math.min(1, (NIVEL0 - (yBloque(baja) - ALTO_BLOQUE / 2)) / ALTO_BLOQUE));

/** Altura del agua: sube según cuánta agua aparta lo que hay adentro. */
export const nivelAgua = (e: EstadoFlotar) => NIVEL0 + mezclar(suave(e.barco), VOL_HIERRO * sumergido(e.baja), VOL_BARCO) / AREA;

/** Fondo del casco (y) cuando flota, con el vaivén. */
const fondoCasco = (e: EstadoFlotar) => nivelAgua(e) - CALADO + 0.05 * Math.sin(e.t * 0.12);
const balanceo = (e: EstadoFlotar) => ((2.2 * Math.PI) / 180) * Math.sin(e.t * 0.09) * suave(e.barco);

/** Centro del bloque en el mundo. */
export const centroBloque = (e: EstadoFlotar): V3 => [0, yBloque(e.baja), 0];
/** Centro del fondo del casco en el mundo (sin el balanceo). */
export const centroCasco = (e: EstadoFlotar): V3 => [0, fondoCasco(e), 0];

type Lugar = { pos: V3; escala: V3 };

/** Dónde va cada cubito en el bloque y cada lámina en el casco (relativo al centro del fondo), ordenados igual. */
const crear = () => {
  const bloque: V3[] = [];
  for (let y = 0; y < BLOQUE.y; y++)
    for (let x = 0; x < BLOQUE.x; x++)
      for (let z = 0; z < BLOQUE.z; z++) bloque.push([(x - (BLOQUE.x - 1) / 2) * LADO, (y - (BLOQUE.y - 1) / 2) * LADO, (z - (BLOQUE.z - 1) / 2) * LADO]);
  const casco: Lugar[] = [];
  for (let x = 0; x < CASCO.x; x++)
    for (let z = 0; z < CASCO.z; z++) casco.push({ pos: [x - (CASCO.x - 1) / 2, GROSOR / 2, z - (CASCO.z - 1) / 2], escala: [1, GROSOR, 1] });
  for (let anillo = 0; anillo < 2; anillo++) {
    const y = GROSOR + 0.5 + anillo;
    for (let x = 0; x < CASCO.x; x++) {
      for (const lado of [-1, 1]) casco.push({ pos: [x - (CASCO.x - 1) / 2, y, lado * (CASCO.z / 2 - GROSOR / 2)], escala: [1, 1, GROSOR] });
    }
    for (let z = 0; z < CASCO.z; z++) {
      for (const lado of [-1, 1]) casco.push({ pos: [lado * (CASCO.x / 2 - GROSOR / 2), y, z - (CASCO.z - 1) / 2], escala: [GROSOR, 1, 1] });
    }
  }
  return bloque.map((b, i) => ({ id: i, bloque: b, casco: casco[i], anillo: casco[i].pos[1] > 1.2 ? 2 : casco[i].pos[1] > 0.3 ? 1 : 0, r: (k: string) => random(`flotar-${i}-${k}`) }));
};

const HIERRO = ['#A3ACBE', '#8C95A8', '#B8C0CF', '#7E879A'].map((c) => new THREE.Color(c));
const CASCO_COLOR = [['#8E3D1E', '#A84824'], ['#C4572A', '#B04C24'], ['#F5A623', '#E9951A']].map((p) => p.map((c) => new THREE.Color(c)));
const AGUA_SUP = ['#2E6299', '#24507F', '#9CC3EA'].map((c) => new THREE.Color(c));
const VERDE = new THREE.Color('#39FF88');
const VIDRIO = new THREE.Color('#8C9BC4');

/** Las 12 aristas de una caja (centro, medidas): dónde va cada una y su escala, para dibujarlas con cubitos finos. */
const aristas = (c: V3, m: V3, g: number): Lugar[] => {
  const [cx, cy, cz] = c;
  const [mx, my, mz] = m.map((v) => v / 2);
  const lista: Lugar[] = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      lista.push({ pos: [cx, cy + a * my, cz + b * mz], escala: [m[0] + g, g, g] });
      lista.push({ pos: [cx + a * mx, cy, cz + b * mz], escala: [g, m[1] + g, g] });
      lista.push({ pos: [cx + a * mx, cy + b * my, cz], escala: [g, g, m[2] + g] });
    }
  return lista;
};

const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraFlotar, centroY: number) => {
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

/** Dónde cae en el video (px) un punto del mundo, con esa cámara: para poner flechas y rótulos 2D encima. */
export const proyectorFlotar = (camara: CamaraFlotar, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.5, 400);
  colocarCamara(camera, camara, centroY);
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

export type Flotar3DProps = EstadoFlotar & { camara: CamaraFlotar; centroY?: number; opacidad?: number };

const o = new THREE.Object3D();
const v = new THREE.Vector3();
const giro = new THREE.Euler();
const color = new THREE.Color();
const COLUMNAS = TANQUE.ancho;
const FILAS = TANQUE.fondo;
const BORDES_TANQUE = aristas([0, TANQUE.alto / 2, 0], [TANQUE.ancho, TANQUE.alto, TANQUE.fondo], 0.12);

const Escena: FC<Omit<Flotar3DProps, 'opacidad'>> = ({ camara, centroY = ALTO / 2, ...e }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const piezas = useMemo(crear, []);
  const hierro = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), N), []);
  const superficie = useMemo(
    () => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, depthWrite: false }), COLUMNAS * FILAS),
    [],
  );
  const lineas = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 24), []);
  const fantasma = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: VERDE }), 12), []);

  const nivel = nivelAgua(e);
  const fondo = fondoCasco(e);
  const rol = balanceo(e);
  const yB = yBloque(e.baja);

  // El hierro: del bloque (que baja) a las láminas del casco (que flota y se balancea).
  giro.set(rol, 0, 0);
  piezas.forEach((p, i) => {
    const f = suave((e.barco - p.r('arma') * 0.35) / 0.65);
    const desde: V3 = [p.bloque[0], p.bloque[1] + yB, p.bloque[2]];
    v.set(...p.casco.pos).applyEuler(giro);
    const hasta: V3 = [v.x, v.y + fondo, v.z];
    const arco = Math.sin(Math.PI * f) * (1.6 + p.r('arco'));
    o.position.set(mezclar(f, desde[0], hasta[0]), mezclar(f, desde[1], hasta[1]) + arco, mezclar(f, desde[2], hasta[2]));
    o.scale.set(mezclar(f, LADO * 0.96, p.casco.escala[0] * 0.98), mezclar(f, LADO * 0.96, p.casco.escala[1]), mezclar(f, LADO * 0.96, p.casco.escala[2] * 0.98));
    o.rotation.set(rol * f, 0, 0);
    o.updateMatrix();
    hierro.setMatrixAt(i, o.matrix);
    const tonos = CASCO_COLOR[p.anillo];
    color.copy(HIERRO[Math.floor(p.r('gris') * HIERRO.length)]).lerp(tonos[Math.floor(p.r('tono') * tonos.length)], f);
    hierro.setColorAt(i, color);
  });
  hierro.instanceMatrix.needsUpdate = true;
  hierro.instanceColor!.needsUpdate = true;

  // La superficie del agua en baldosas que suben y bajan un poco.
  for (let c = 0; c < COLUMNAS; c++) {
    for (let r = 0; r < FILAS; r++) {
      const k = c * FILAS + r;
      const ola = 0.05 * Math.sin(e.t * 0.16 + c * 0.7 + r * 0.45);
      o.position.set(c - (COLUMNAS - 1) / 2, nivel + ola, r - (FILAS - 1) / 2);
      o.scale.set(0.94, 0.06, 0.94);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      superficie.setMatrixAt(k, o.matrix);
      const brilla = random(`flotar-brillo-${k}-${Math.floor(e.t / 6)}`) < 0.03;
      superficie.setColorAt(k, brilla ? AGUA_SUP[2] : AGUA_SUP[(c + r) % 2]);
    }
  }
  superficie.instanceMatrix.needsUpdate = true;
  superficie.instanceColor!.needsUpdate = true;

  // Las aristas del tanque.
  BORDES_TANQUE.forEach((a, i) => {
    o.position.set(...a.pos);
    o.scale.set(...a.escala);
    o.rotation.set(0, 0, 0);
    o.updateMatrix();
    lineas.setMatrixAt(i, o.matrix);
    lineas.setColorAt(i, VIDRIO);
  });
  for (let i = BORDES_TANQUE.length; i < 24; i++) {
    o.scale.setScalar(0.0001);
    o.updateMatrix();
    lineas.setMatrixAt(i, o.matrix);
    lineas.setColorAt(i, VIDRIO);
  }
  lineas.instanceMatrix.needsUpdate = true;
  lineas.instanceColor!.needsUpdate = true;

  // El agua apartada: la caja del bloque (lo que tiene bajo el agua) o la del casco hasta la línea de flotación.
  const b = suave(e.barco);
  const anchoF = mezclar(b, BLOQUE.x * LADO, CASCO.x);
  const fondoF = mezclar(b, BLOQUE.z * LADO, CASCO.z);
  const abajoF = mezclar(b, yB - ALTO_BLOQUE / 2, fondo);
  const arribaF = mezclar(b, Math.min(nivel, yB + ALTO_BLOQUE / 2), nivel);
  const altoF = Math.max(0.001, arribaF - abajoF);
  const verFantasma = e.fantasma > 0.001 && altoF > 0.01;
  aristas([0, abajoF + altoF / 2, 0], [anchoF, altoF, fondoF], 0.07).forEach((a, i) => {
    o.position.set(...a.pos);
    o.scale.set(...(a.escala.map((s) => Math.max(0.0001, verFantasma ? s * (s < 0.1 ? suave(e.fantasma) : 1) : 0.0001)) as V3));
    o.rotation.set(0, 0, 0);
    o.updateMatrix();
    fantasma.setMatrixAt(i, o.matrix);
  });
  fantasma.instanceMatrix.needsUpdate = true;

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[-6, 12, 10]} intensity={1.3} />
      <directionalLight position={[8, -3, 6]} intensity={0.3} color="#ffd9a8" />
      {/* Mesa */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[TANQUE.ancho + 3, 0.9, TANQUE.fondo + 3]} />
        <meshLambertMaterial color="#5A3A1E" />
      </mesh>
      <primitive object={hierro} />
      <primitive object={lineas} />
      {verFantasma && <primitive object={fantasma} />}
      {verFantasma && (
        <mesh position={[0, abajoF + altoF / 2, 0]} scale={[anchoF, altoF, fondoF]} renderOrder={2}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={VERDE} transparent opacity={0.16 * suave(e.fantasma)} depthWrite={false} />
        </mesh>
      )}
      {/* El agua (transparente, para ver lo que está adentro) y su superficie */}
      <mesh position={[0, nivel / 2, 0]} renderOrder={3}>
        <boxGeometry args={[TANQUE.ancho - 0.05, nivel, TANQUE.fondo - 0.05]} />
        <meshLambertMaterial color="#2E6299" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <primitive object={superficie} renderOrder={4} />
      <mesh position={[0, TANQUE.alto / 2, 0]} renderOrder={5}>
        <boxGeometry args={[TANQUE.ancho, TANQUE.alto, TANQUE.fondo]} />
        <meshBasicMaterial color={VIDRIO} transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

/** El tanque 3D, del tamaño del cuadro entero (sin bordes visibles). */
export const Flotar3D: FC<Flotar3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.5, far: 400, position: [0, 0, 60] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
