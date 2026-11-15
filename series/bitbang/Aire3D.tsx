// La materia de Anaxímenes en 3D (cap 5): los mismos 512 cubitos pasan de fuego a aire, viento, nube, agua,
// tierra y piedra según qué tan apretados estén. `nivel` (0 = fuego … 6 = piedra, con decimales) mezcla las
// dos formas vecinas. Todo sale del fotograma y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { ESTADOS_DENSIDAD } from './Densidad';

const FOV = 30;
const LADO = 8;
const N = LADO ** 3;

type V3 = [number, number, number];

type Particula = {
  id: number;
  /** Lugar en el bloque de piedra (8 × 8 × 8, centrado, separación 1). */
  cubo: V3;
  /** El mismo lugar llevado a una bola de radio 1 (lo del centro del bloque queda en el centro de la bola). */
  bola: V3;
  /** Un punto al azar de la bola de radio 1, sin relación con el bloque (para las bolitas de la nube). */
  suelto: V3;
  /** Columna del bloque (0–7, de izquierda a derecha). */
  columna: number;
  r: (k: string) => number;
};

const puntoEnBola = (r: (k: string) => number, k: string): V3 => {
  const u = r(`${k}u`) * 2 - 1;
  const a = r(`${k}a`) * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const d = Math.cbrt(r(`${k}d`));
  return [s * Math.cos(a) * d, u * d, s * Math.sin(a) * d];
};

const crearParticulas = (): Particula[] =>
  Array.from({ length: N }, (_, id) => {
    const r = (k: string) => random(`aire3d-${id}-${k}`);
    const a = id % LADO;
    const b = Math.floor(id / LADO) % LADO;
    const c = Math.floor(id / LADO ** 2);
    const cubo: V3 = [a - 3.5, b - 3.5, c - 3.5];
    // Capa del bloque (1 = las 8 del centro … 4 = la cáscara): en la bola, cada capa ocupa un cuarto del radio,
    // así la bola queda pareja por dentro.
    const capa = Math.max(...cubo.map((v) => Math.abs(v) + 0.5));
    const largo = Math.hypot(...cubo);
    const radio = (capa - 1 + r('capa')) / 4;
    const bola = cubo.map((v, i) => (v / largo) * radio + (r(`j${i}`) - 0.5) * 0.1) as V3;
    return { id, cubo, bola, suelto: puntoEnBola(r, 's'), columna: a, r };
  });

type Forma = { pos: V3; lado: number; estira?: number; giro?: number; color?: THREE.Color };

const COLORES_FUEGO = ['#FFE3A0', '#F5A623', '#E07A45', '#C4572A'].map((c) => new THREE.Color(c));
const colorFuego = (h: number) => {
  const x = Math.min(2.999, h * 3);
  const i = Math.floor(x);
  return new THREE.Color().lerpColors(COLORES_FUEGO[i], COLORES_FUEGO[i + 1], x - i);
};

/** Bolitas de la nube: centro (x, y, z) y radio, de izquierda a derecha. */
const BOLITAS: [number, number, number, number][] = [
  [-3.9, -0.6, 0, 1.9],
  [-2, 0.5, 0.3, 2.4],
  [0.2, 1.1, -0.2, 2.8],
  [2.4, 0.4, 0.2, 2.3],
  [4.2, -0.5, 0, 1.8],
];
const BOLITA_DE_COLUMNA = [0, 1, 1, 2, 2, 3, 3, 4];

/**
 * Forma de la partícula `p` en el estado `k` (0 = fuego … 6 = piedra) en el fotograma `t`. `az` es el azimut de la
 * cámara (radianes): la nube gira con ella para verse siempre a lo ancho.
 */
const forma = (p: Particula, k: number, t: number, az: number): Forma => {
  const [bx, by, bz] = p.bola;
  const [cx, cy, cz] = p.cubo;
  switch (k) {
    case 0: {
      // Fuego: una llama que sube sin parar, ancha abajo y en punta arriba. Lo de arriba es más rojo y más chico.
      const h = (p.r('h') + t * (0.011 + 0.008 * p.r('vh'))) % 1;
      const ancho = 3.4 * Math.pow(1 - h, 0.8) * (0.55 + 0.45 * Math.min(1, h * 4));
      const a = Math.atan2(bz, bx);
      const rho = Math.sqrt(p.r('rho'));
      const vaiven = 0.8 * h * Math.sin(t * 0.13 + h * 5);
      const titila = 0.75 + 0.5 * random(`aire3d-titila-${p.id}-${Math.floor(t / 2)}`);
      return { pos: [Math.cos(a) * rho * ancho + vaiven, -5.4 + h * 12.5, Math.sin(a) * rho * ancho], lado: 0.5 * (1 - 0.65 * h) * titila, color: colorFuego(h + 0.25 * rho) };
    }
    case 1: {
      // Aire: una bola suelta, con los cubitos chicos y separados, que se mueven despacio.
      const m = (e: string, v: number) => 0.4 * Math.sin(t * (0.04 + 0.02 * p.r(`w${e}`)) + 6 * p.r(e)) + v * 6.2;
      return { pos: [m('x', bx), m('y', by), m('z', bz)], lado: 0.3 };
    }
    case 2: {
      // Viento: un remolino de cuatro corrientes que giran alrededor del centro (más ancho arriba);
      // los cubitos se estiran en la dirección en que van.
      const c = p.id % 4;
      const giro = p.r('s') * Math.PI * 2 + t * 0.07 * (1 + 0.15 * c);
      const radio = (2.4 + 1.1 * c) * (0.85 + 0.3 * p.r('vr'));
      return {
        pos: [Math.cos(giro) * radio, (c - 1.5) * 1.7 + 0.5 * Math.sin(giro * 2 + c) + (p.r('vy') - 0.5) * 0.7, Math.sin(giro) * radio],
        lado: 0.3,
        estira: 2.8,
        giro: -giro - Math.PI / 2,
      };
    }
    case 3: {
      // Nube: cinco bolitas que se tocan, con la base plana.
      const [px, py, pz, pr] = BOLITAS[BOLITA_DE_COLUMNA[p.columna]];
      const [sx, sy, sz] = p.suelto;
      let y = py + sy * pr;
      if (y < -1.7) y = -1.7 + (y + 1.7) * 0.25;
      const x = px + sx * pr;
      const z = pz + sz * pr * 0.9;
      return { pos: [x * Math.cos(az) + z * Math.sin(az), y + 0.15 * Math.sin(t * 0.05 + px), -x * Math.sin(az) + z * Math.cos(az)], lado: 0.62 };
    }
    case 4: {
      // Agua: una gota (en punta arriba) que tiembla un poco.
      const R = 3.2;
      const sube = by > 0 ? by * 1.75 : by;
      const angosta = by > 0 ? 1 - 0.85 * Math.pow(by, 1.3) : 1;
      const tiembla = 1 + 0.04 * Math.sin(t * 0.22 + by * 4);
      return { pos: [bx * R * angosta * tiembla, sube * R - 0.8, bz * R * angosta * tiembla], lado: 0.68 };
    }
    case 5: {
      // Tierra: un terrón: el bloque redondeado y desparejo.
      const j = (e: string) => (p.r(e) - 0.5) * 0.36;
      return { pos: [cx * 0.56 + bx * 2.1 + j('tx'), cy * 0.56 + by * 2.1 + j('ty'), cz * 0.56 + bz * 2.1 + j('tz')], lado: 0.86 };
    }
    default: {
      // Piedra: bloque macizo de cubitos, con las esquinas metidas hacia adentro.
      const esquina = Math.abs(cx) + Math.abs(cy) + Math.abs(cz) > 8.6 ? 0.78 : 1;
      return { pos: [cx * esquina, cy * esquina, cz * esquina], lado: 0.97 };
    }
  }
};

/** Color fijo de cada partícula en cada estado (el fuego lo calcula `forma`). */
const crearColores = (particulas: Particula[]) =>
  ESTADOS_DENSIDAD.map((e, k) =>
    particulas.map((p) => {
      const c = new THREE.Color(e.colores[Math.floor(p.r(`color${k}`) * e.colores.length)]);
      c.offsetHSL(0, 0, (p.r(`luz${k}`) - 0.5) * 0.06);
      return c;
    }),
  );

const suave = (x: number) => x * x * (3 - 2 * x);

export type CamaraAire = { distancia: number; elevacion: number; azimut: number };

/** Píxeles del video por unidad del mundo a esa distancia de cámara (en el centro de la escena). */
export const escalaAire = (distancia: number) => ALTO / (2 * distancia * Math.tan(((FOV / 2) * Math.PI) / 180));

export type Aire3DProps = {
  /** 0 = fuego, 1 = aire, 2 = viento, 3 = nube, 4 = agua, 5 = tierra, 6 = piedra. */
  nivel: number;
  /** Reloj propio (fotogramas), que sigue corriendo entre escenas. */
  t: number;
  camara: CamaraAire;
  /** Altura en el video (px) del centro de la materia. */
  centroY?: number;
  /** 0–1: los cubitos llegan volando desde la izquierda y se juntan. */
  aparece?: number;
  opacidad?: number;
};

const o = new THREE.Object3D();
const color = new THREE.Color();
const BRASA = new THREE.Color('#FF8A20');

const Escena: FC<Aire3DProps> = ({ nivel, t, camara, centroY = ALTO / 2, aparece = 1 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const el = (camara.elevacion * Math.PI) / 180;
  const az = (camara.azimut * Math.PI) / 180;
  const d = camara.distancia;
  camera.position.set(d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az));
  camera.lookAt(0, 0, 0);
  camera.setViewOffset(camera.aspect * ALTO, ALTO, 0, ALTO / 2 - centroY, camera.aspect * ALTO, ALTO);
  camera.updateProjectionMatrix();

  const particulas = useMemo(crearParticulas, []);
  const colores = useMemo(() => crearColores(particulas), [particulas]);
  const material = useMemo(() => new THREE.MeshLambertMaterial(), []);
  const malla = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, N), [material]);

  const k0 = Math.max(0, Math.min(5, Math.floor(nivel)));
  const mezcla = suave(Math.max(0, Math.min(1, nivel - k0)));
  particulas.forEach((p, i) => {
    const a = forma(p, k0, t, az);
    const b = forma(p, k0 + 1, t, az);
    const pos = a.pos.map((v, e) => v + (b.pos[e] - v) * mezcla) as V3;
    // Los que llegan: desde lejos a la izquierda, cada uno a su ritmo.
    const propio = Math.max(0, Math.min(1, (aparece - p.r('llega') * 0.4) / 0.6));
    const llega = suave(propio);
    const lejos: V3 = [p.suelto[0] * 18 - 16, p.suelto[1] * 14 - 2, p.suelto[2] * 10];
    o.position.set(...(pos.map((v, e) => lejos[e] + (v - lejos[e]) * llega) as V3));
    const lado = (a.lado + (b.lado - a.lado) * mezcla) * llega;
    const estira = (a.estira ?? 1) + ((b.estira ?? 1) - (a.estira ?? 1)) * mezcla;
    o.scale.set(Math.max(0.0001, lado * estira), Math.max(0.0001, lado), Math.max(0.0001, lado));
    o.rotation.set(0, (a.giro ?? 0) * (1 - mezcla) + (b.giro ?? 0) * mezcla, 0);
    o.updateMatrix();
    malla.setMatrixAt(i, o.matrix);
    color.lerpColors(a.color ?? colores[k0][i], b.color ?? colores[k0 + 1][i], mezcla);
    malla.setColorAt(i, color);
  });
  malla.instanceMatrix.needsUpdate = true;
  malla.instanceColor!.needsUpdate = true;
  // El fuego brilla con luz propia.
  material.emissive.copy(BRASA).multiplyScalar(0.32 * Math.max(0, 1 - nivel));

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[-6, 9, 10]} intensity={1.35} />
      <directionalLight position={[8, -3, 4]} intensity={0.3} color="#ffd9a8" />
      <primitive object={malla} />
    </>
  );
};

/** La materia de cubitos, del tamaño del cuadro entero (sin bordes visibles). */
export const Aire3D: FC<Aire3DProps> = ({ opacidad = 1, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.5, far: 400, position: [0, 0, 80] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
