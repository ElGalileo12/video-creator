// La criatura-pez de Anaximandro en 3D: un pez de cubitos cubierto de corteza espinosa, varado en una orilla
// (un disco de agua y arena que flota, como la Tierra-tambor) y con un humano de cubitos adentro.
// La corteza se deja ver por dentro (rayos X), se agrieta y revienta; el humano pasa de encogido a de pie
// y camina a tierra. La cámara y todo el movimiento salen de las props: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { bb } from './tema';

const FOV = 30;

// --- El pez ----------------------------------------------------------------------------------------------

/** Medio largo, medio alto y medio ancho del cuerpo (en cubitos). */
const A = 11;
const B = 6;
const C = 4.5;
/** Centro del cuerpo en el mundo: la panza toca el suelo (y = 0). La cabeza mira hacia +x. */
export const PEZ = { x: -4, y: B, z: 0 };

/** El cuerpo se afina hacia la cola (x < 0) y un poco hacia la boca. */
const grosor = (x: number) => (x < 0 ? 1 - 0.5 * Math.pow(-x / A, 1.6) : 1 - 0.3 * (x / A) ** 2);
const dentro = (x: number, y: number, z: number) => {
  const g = grosor(x);
  return (x / A) ** 2 + (y / (B * g)) ** 2 + (z / (C * g)) ** 2 <= 1;
};

const CORTEZA = ['#5C2E19', '#7E3F22', '#8E3D1E', '#A84824', '#6B3A1F'];
const PANZA = ['#B4642E', '#A84824'];
const ALETA = ['#1D3F66', '#2F6FA3', '#183556'];

type Pieza = {
  /** Posición respecto del centro del pez. */
  p: THREE.Vector3;
  /** Hacia dónde sale volando al reventar. */
  n: THREE.Vector3;
  color: THREE.Color;
  escala: THREE.Vector3;
  giro: THREE.Quaternion;
  /** Las piezas de la cresta se encienden con la grieta. */
  cresta: boolean;
  /** La mitad cercana a la cámara se encoge con los rayos X (no las aletas). */
  rayos: boolean;
  semilla: string;
};

const color = (lista: string[], semilla: string) => {
  const c = new THREE.Color(lista[Math.floor(random(semilla) * lista.length)]);
  c.offsetHSL(0, 0, (random(`${semilla}-l`) - 0.5) * 0.08);
  return c;
};

const UNO = new THREE.Vector3(1, 1, 1);
const QUIETO = new THREE.Quaternion();
const ARRIBA = new THREE.Vector3(0, 1, 0);

const crearPez = (): Pieza[] => {
  const piezas: Pieza[] = [];
  const zMax = Math.ceil(C);
  for (let x = -A; x <= A; x++) {
    for (let y = -B; y <= B; y++) {
      for (let z = -zMax; z <= zMax; z++) {
        if (!dentro(x, y, z)) continue;
        // Solo la cáscara: lo de adentro no se ve (y deja lugar al humano).
        const vecinos = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        if (vecinos.every(([a, b, c]) => dentro(x + a, y + b, z + c))) continue;
        const g = grosor(x);
        const n = new THREE.Vector3(x / A ** 2, y / (B * g) ** 2, z / (C * g) ** 2).normalize();
        const s = `pez-${x}-${y}-${z}`;
        piezas.push({
          p: new THREE.Vector3(x, y, z),
          n,
          color: color(n.y < -0.45 ? PANZA : CORTEZA, s),
          escala: UNO,
          giro: QUIETO,
          cresta: z === 0 && n.y > 0.5,
          rayos: true,
          semilla: s,
        });
        // Espinas: palitos que salen de la corteza (no en la panza).
        if (n.y > -0.3 && random(`${s}-espina`) < 0.16) {
          const largo = 1.5 + random(`${s}-largo`) * 1.3;
          piezas.push({
            p: new THREE.Vector3(x, y, z).addScaledVector(n, 0.45 + largo / 2),
            n,
            color: color(['#D9B98A', '#C9A06A', bb.hueso], `${s}-e`),
            escala: new THREE.Vector3(0.3, largo, 0.3),
            giro: new THREE.Quaternion().setFromUnitVectors(ARRIBA, n),
            cresta: false,
            rayos: true,
            semilla: `${s}-espina`,
          });
        }
      }
    }
  }
  // Cola en abanico, con la horquilla al final.
  for (let k = 1; k <= 6; k++) {
    const alto = Math.round(1 + k * 0.9);
    for (let y = -alto; y <= alto; y++) {
      if (k > 3 && Math.abs(y) < (k - 3) * 0.8) continue;
      const s = `cola-${k}-${y}`;
      piezas.push({ p: new THREE.Vector3(-A - k, y, 0), n: new THREE.Vector3(-1, y / 4, 0).normalize(), color: color(ALETA, s), escala: UNO, giro: QUIETO, cresta: false, rayos: false, semilla: s });
    }
  }
  // Aleta de arriba.
  for (let x = -5; x <= 3; x++) {
    const techo = Math.ceil(B * grosor(x) * Math.sqrt(Math.max(0, 1 - (x / A) ** 2)));
    const alto = Math.round(3.5 * (1 - Math.abs(x + 1) / 4.5));
    for (let h = 1; h <= alto; h++) {
      const s = `aleta-${x}-${h}`;
      piezas.push({ p: new THREE.Vector3(x, techo + h - 0.5, 0), n: new THREE.Vector3(0, 1, 0), color: color(ALETA, s), escala: UNO, giro: QUIETO, cresta: false, rayos: false, semilla: s });
    }
  }
  // Ojos: blanco con la pupila delante.
  for (const lado of [1, -1]) {
    piezas.push({ p: new THREE.Vector3(7.2, 1.5, lado * 3.35), n: new THREE.Vector3(0.3, 0.3, lado).normalize(), color: new THREE.Color(bb.hueso), escala: new THREE.Vector3(1.4, 1.4, 1.2), giro: QUIETO, cresta: false, rayos: lado > 0, semilla: `ojo-${lado}` });
    piezas.push({ p: new THREE.Vector3(7.6, 1.6, lado * 3.9), n: new THREE.Vector3(0.3, 0.3, lado).normalize(), color: new THREE.Color(bb.tinta), escala: new THREE.Vector3(0.7, 0.8, 0.6), giro: QUIETO, cresta: false, rayos: lado > 0, semilla: `pupila-${lado}` });
  }
  return piezas;
};

const GRAVEDAD = 0.03;

/** Dónde está una pieza `e` fotogramas después de reventar: sale volando, cae y queda en el suelo. */
const volar = (pz: Pieza, e: number, salida: THREE.Vector3, giro: THREE.Euler) => {
  const r = (k: string) => random(`${pz.semilla}-${k}`);
  const v = 0.18 + r('v') * 0.32;
  const vy = 0.12 + r('vy') * 0.3 + Math.max(0, pz.n.y) * v;
  const y0 = PEZ.y + pz.p.y;
  const suelo = 0.4 + r('s') * 0.3;
  // Momento en que toca el suelo (y deja de moverse).
  const toca = (vy + Math.sqrt(vy * vy + 2 * GRAVEDAD * Math.max(0, y0 - suelo))) / GRAVEDAD;
  const t = Math.min(e, toca);
  salida.set(PEZ.x + pz.p.x + pz.n.x * v * t, Math.max(suelo, y0 + vy * t - 0.5 * GRAVEDAD * t * t), PEZ.z + pz.p.z + pz.n.z * v * t);
  const vueltas = t * (0.08 + r('g') * 0.15);
  giro.set(vueltas * (r('a') - 0.5) * 2, vueltas, vueltas * (r('b') - 0.5) * 2);
  return e >= toca;
};

// --- La orilla ---------------------------------------------------------------------------------------------

const RADIO_SUELO = 25;
const CENTRO_SUELO = -2;
/** Agua a la izquierda de esta línea, arena a la derecha (ondula un poco). */
const orilla = (z: number) => 1.5 + 1.6 * Math.sin(z * 0.33) + 0.8 * Math.sin(z * 0.9 + 1);

const AGUA = ['#1D3F66', '#2F6FA3', '#183556', '#245683'];
const ARENA = ['#C9821A', '#D49A3A', '#B4642E', '#D4A24A'];
const ESTRATOS = ['#7E3F22', '#8E3D1E', '#5C2E19'];

type Baldosa = { x: number; z: number; y: number; color: THREE.Color; agua: boolean };

const crearSuelo = () => {
  const lista: Baldosa[] = [];
  for (let i = -RADIO_SUELO; i <= RADIO_SUELO; i++) {
    for (let z = -RADIO_SUELO; z <= RADIO_SUELO; z++) {
      const d = Math.hypot(i, z);
      if (d > RADIO_SUELO + 0.3) continue;
      const x = CENTRO_SUELO + i;
      const s = `suelo-${i}-${z}`;
      const hasta = orilla(z) - x;
      const agua = hasta > 0;
      const espuma = agua && hasta < 1 && random(`${s}-esp`) < 0.6;
      const mojada = !agua && hasta > -1.2;
      const c = espuma ? new THREE.Color('#9FD0F0') : mojada ? new THREE.Color('#8E5A26') : color(agua ? AGUA : ARENA, s);
      lista.push({ x, z, y: agua ? -0.85 : -0.5, color: c, agua });
      // El borde del disco muestra las capas de abajo, como la Tierra-tambor.
      if (d > RADIO_SUELO - 1.3) {
        for (let k = 1; k <= 3; k++) lista.push({ x, z, y: -0.5 - k, color: color(ESTRATOS, `${s}-${k}`), agua: false });
      }
    }
  }
  return lista;
};

// --- El humano ---------------------------------------------------------------------------------------------

const S = 0.5;
type Cubo = [number, number, number];
/** Cubitos de lado S que llenan la caja [x0, x1] × [y0, y1] × [z0, z1]. */
const caja = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
  const lista: Cubo[] = [];
  for (let x = x0 + S / 2; x < x1; x += S) for (let y = y0 + S / 2; y < y1; y += S) for (let z = z0 + S / 2; z < z1; z += S) lista.push([x, y, z]);
  return lista;
};

const TORSO = caja(-0.5, 0.5, 0, 3, -1, 1);
const CABEZA_TODA = caja(-0.75, 0.75, 0, 1.5, -0.75, 0.75);
const PELO = CABEZA_TODA.filter(([x, y]) => y > 1 || x < -0.3);
const CARA = CABEZA_TODA.filter(([x, y]) => !(y > 1 || x < -0.3));
const BRAZO = caja(-0.25, 0.25, -2.5, 0, -0.25, 0.25);
const MUSLO = caja(-0.5, 0.5, -2, 0, -0.5, 0.5);
const CANILLA = [...caja(-0.5, 0.5, -2, 0, -0.5, 0.5), ...caja(-0.5, 1, -2.5, -2, -0.5, 0.5)];
/** Altura de la cadera sobre el suelo, de pie (escala 1). */
export const CADERA = 4.5;

const Bloque: FC<{ cubos: Cubo[]; material: THREE.Material }> = ({ cubos, material }) => {
  const malla = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(S * 0.94, S * 0.94, S * 0.94), material, cubos.length);
    const o = new THREE.Object3D();
    cubos.forEach(([x, y, z], i) => {
      o.position.set(x, y, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    return m;
  }, [cubos, material]);
  return <primitive object={malla} />;
};

export type Humano = {
  /** Cadera en el mundo. */
  x: number;
  y: number;
  escala: number;
  /** 1 = encogido como un feto; 0 = de pie. */
  encogido: number;
  /** Fase del paso (radianes) y cuánto camina (0–1). */
  paso: number;
  andar: number;
  /** 0–1: cuánto brilla en ámbar (adentro del pez brilla; afuera casi nada). */
  brillo: number;
};

/** El humano de cubitos, de perfil mirando a +x. Las articulaciones giran en el plano del paso. */
const HumanoCubos: FC<Humano> = ({ x, y, escala, encogido: e, paso, andar, brillo }) => {
  const piel = useMemo(() => new THREE.MeshLambertMaterial({ color: bb.terracota, emissive: new THREE.Color(bb.ambar) }), []);
  const pelo = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1A1210', emissive: new THREE.Color(bb.ambar) }), []);
  piel.emissiveIntensity = 0.6 * brillo;
  pelo.emissiveIntensity = 0.25 * brillo;
  const m = (de: number, encogidoA: number) => de * (1 - e) + encogidoA * e;
  const s = Math.sin(paso) * andar;
  const torso = m(-0.06 * andar, -0.75);
  const cabeza = m(0, -0.5);
  const brazoA = m(-0.45 * s, 1.25);
  const brazoB = m(0.45 * s, 1.05);
  const musloA = m(0.5 * s, 1.95);
  const musloB = m(-0.5 * s, 1.85);
  const rodillaA = m(-0.7 * Math.max(0, Math.sin(paso - 1)) * andar, -2.35);
  const rodillaB = m(-0.7 * Math.max(0, Math.sin(paso + Math.PI - 1)) * andar, -2.3);
  const rebote = Math.abs(Math.cos(paso)) * 0.15 * andar;
  return (
    <group position={[x, y + rebote * escala, 0]} scale={escala}>
      <group rotation={[0, 0, torso]}>
        <Bloque cubos={TORSO} material={piel} />
        <group position={[0, 3.05, 0]} rotation={[0, 0, cabeza]}>
          <Bloque cubos={CARA} material={piel} />
          <Bloque cubos={PELO} material={pelo} />
        </group>
        <group position={[0, 2.8, 1.25]} rotation={[0, 0, brazoA]}>
          <Bloque cubos={BRAZO} material={piel} />
        </group>
        <group position={[0, 2.8, -1.25]} rotation={[0, 0, brazoB]}>
          <Bloque cubos={BRAZO} material={piel} />
        </group>
      </group>
      {[
        [0.5, musloA, rodillaA],
        [-0.5, musloB, rodillaB],
      ].map(([z, muslo, rodilla], i) => (
        <group key={i} position={[0, 0, z]} rotation={[0, 0, muslo]}>
          <Bloque cubos={MUSLO} material={piel} />
          <group position={[0, -2, 0]} rotation={[0, 0, rodilla]}>
            <Bloque cubos={CANILLA} material={piel} />
          </group>
        </group>
      ))}
    </group>
  );
};

// --- La escena -----------------------------------------------------------------------------------------------

export type CamaraPez = {
  /** Punto al que mira (mundo). */
  objetivo: [number, number, number];
  distancia: number;
  /** Grados. Azimut 0 = de costado (desde +z); positivo gira hacia la cabeza del pez. */
  elevacion: number;
  azimut: number;
};

export type Pez3DProps = {
  /** Reloj propio (fotogramas), que sigue corriendo entre escenas. */
  t: number;
  camara: CamaraPez;
  /** Altura en el video (px) donde cae el objetivo de la cámara. */
  centroY?: number;
  /** 0–1: la mitad de la corteza que da a la cámara se encoge y deja ver adentro. */
  rayos?: number;
  /** 0–1: la grieta de la cresta avanza de la cabeza a la cola. */
  grieta?: number;
  /** Fotogramas desde que reventó la corteza (sin definir = entera). */
  estallido?: number;
  humano?: Humano;
  opacidad?: number;
};

/** Pone la cámara según `camara` y corre el cuadro para que el objetivo caiga en `centroY`. */
const colocarCamara = (camera: THREE.PerspectiveCamera, camara: CamaraPez, centroY: number) => {
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

/** Dónde cae en el video (px) un punto del mundo, con esa cámara: para poner etiquetas 2D encima. */
export const proyectorPez = (camara: CamaraPez, centroY = ALTO / 2) => {
  const camera = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.5, 400);
  colocarCamara(camera, camara, centroY);
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO };
  };
};

const Escena: FC<Pez3DProps> = ({ t, camara, centroY = ALTO / 2, rayos = 0, grieta = 0, estallido, humano }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const az = (camara.azimut * Math.PI) / 180;

  const piezas = useMemo(crearPez, []);
  const mallaPez = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), new THREE.MeshLambertMaterial(), piezas.length);
    piezas.forEach((pz, i) => m.setColorAt(i, pz.color));
    return m;
  }, [piezas]);
  // La grieta: los cubitos de la cresta se encienden (sin luz, para que brillen) de la cabeza a la cola.
  const cresta = useMemo(() => piezas.filter((pz) => pz.cresta).sort((a, b) => b.p.x - a.p.x), [piezas]);
  const mallaGrieta = useMemo(
    () => new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), new THREE.MeshBasicMaterial({ color: '#FFE6A0' }), cresta.length),
    [cresta],
  );
  const suelo = useMemo(crearSuelo, []);
  const [arena, agua] = useMemo(() => [suelo.filter((b) => !b.agua), suelo.filter((b) => b.agua)], [suelo]);
  const mallaArena = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 1, 0.98), new THREE.MeshLambertMaterial(), arena.length);
    const o = new THREE.Object3D();
    arena.forEach((b, i) => {
      o.position.set(b.x, b.y, b.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, b.color);
    });
    return m;
  }, [arena]);
  const mallaAgua = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 1, 0.98), new THREE.MeshLambertMaterial(), agua.length);
    agua.forEach((b, i) => m.setColorAt(i, b.color));
    return m;
  }, [agua]);

  const o = new THREE.Object3D();
  agua.forEach((b, i) => {
    o.position.set(b.x, b.y + 0.12 * Math.sin(t * 0.09 + b.x * 0.5 + b.z * 0.3), b.z);
    o.updateMatrix();
    mallaAgua.setMatrixAt(i, o.matrix);
  });
  mallaAgua.instanceMatrix.needsUpdate = true;

  // Lado del pez que da a la cámara (para los rayos X: se quita la mitad de ese costado).
  const haciaCamara = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
  const temblor = grieta > 0 && estallido === undefined ? grieta * 0.18 : 0;
  const pos = new THREE.Vector3();
  const giro = new THREE.Euler();
  piezas.forEach((pz, i) => {
    let escala = 1;
    if (estallido !== undefined) {
      const quieta = volar(pz, estallido, pos, giro);
      o.position.copy(pos);
      o.quaternion.copy(pz.giro);
      o.rotateX(giro.x).rotateY(giro.y).rotateZ(giro.z);
      // Las espinas se deshacen; la corteza queda tirada en la arena, más chica.
      const espina = pz.escala.y > 1.2;
      escala = espina ? 1 - Math.min(1, estallido / 14) : quieta ? 0.75 : 1;
    } else {
      o.position.set(PEZ.x + pz.p.x, PEZ.y + pz.p.y, PEZ.z + pz.p.z);
      if (temblor > 0) o.position.x += (random(`temblor-${Math.floor(t)}`) - 0.5) * temblor;
      o.quaternion.copy(pz.giro);
      if (rayos > 0 && pz.rayos && pz.p.z * Math.sign(haciaCamara.z || 1) > 0.4) {
        // La ola de rayos X avanza de la cabeza a la cola y se lleva la mitad cercana.
        escala = 1 - Math.min(1, Math.max(0, rayos * 1.6 - ((A - pz.p.x) / (2 * A)) * 0.6));
      }
    }
    o.scale.set(pz.escala.x * escala, pz.escala.y * escala, pz.escala.z * escala);
    o.updateMatrix();
    mallaPez.setMatrixAt(i, o.matrix);
  });
  mallaPez.instanceMatrix.needsUpdate = true;
  cresta.forEach((pz, i) => {
    const encendida = estallido === undefined && grieta > 0 && (A - pz.p.x) / (2 * A) < grieta;
    o.position.set(PEZ.x + pz.p.x, PEZ.y + pz.p.y, PEZ.z + pz.p.z);
    o.quaternion.copy(QUIETO);
    o.scale.setScalar(encendida ? 1 : 0.0001);
    o.updateMatrix();
    mallaGrieta.setMatrixAt(i, o.matrix);
  });
  mallaGrieta.instanceMatrix.needsUpdate = true;

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-4, 9, 7]} intensity={1.5} />
      <directionalLight position={[8, -2, 4]} intensity={0.35} color="#ffd9a8" />
      <primitive object={mallaArena} />
      <primitive object={mallaAgua} />
      <primitive object={mallaPez} />
      <primitive object={mallaGrieta} />
      {humano && <HumanoCubos {...humano} />}
    </>
  );
};

/** La orilla con el pez, del tamaño del cuadro entero (sin bordes visibles). */
export const Pez3D: FC<Pez3DProps> = ({ opacidad = 1, ...props }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
    <LienzoTres flat camera={{ fov: FOV, near: 0.5, far: 400, position: [0, 0, 80] }}>
      <Escena {...props} />
    </LienzoTres>
  </div>
);
