// La supernova en 3D (especial «El día que una estrella se derrumba»):
// · `Estrella3D`: una estrella gigante de cubitos abierta como una cebolla (le falta el octavo que mira a la cámara), con sus
//   capas H, He, C, O, Si y el núcleo de hierro. Su estado la lleva por todo el colapso: las capas dejan de arder de afuera
//   hacia adentro, el núcleo se vuelve partículas (electrones y protones que se funden en neutrones y sueltan neutrinos), se
//   encoge, lo de encima cae y rebota, la onda de choque se frena, los neutrinos la reviven y todo sale volando.
// · `Fusion3D`: dos estrellas de neutrones que giran cada vez más cerca y más rápido hasta chocar: la nube dorada (kilonova).
// La cámara es la del vacío (`CamaraVacio`, `colocarCamara`); los rótulos 2D se ubican con `proyectorVacio`.
// Todo sale del estado y de random() con semilla: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { type CamaraVacio, colocarCamara } from './Vacio3D';

const FOV = 30;
type V3 = [number, number, number];

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezclar = (t: number, a: number, b: number) => a + (b - a) * t;

const o = new THREE.Object3D();
const color = new THREE.Color();
const EJE_Z = new THREE.Vector3(0, 0, 1);
const direccion = new THREE.Vector3();
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
  m.frustumCulled = false;
  return m;
};
/** Dirección al azar (uniforme en la esfera) con semilla. */
const alAzar = (semilla: string): V3 => {
  const z = random(`${semilla}-z`) * 2 - 1;
  const a = random(`${semilla}-a`) * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(a), z, s * Math.sin(a)];
};

const AMBAR = new THREE.Color('#F5A623');
const CIAN = new THREE.Color('#3DD6F5');
const CIAN_CLARO = new THREE.Color('#BDF3FF');
const VERDE = new THREE.Color('#39FF88');
const TERRACOTA = new THREE.Color('#C4572A');
const INCANDESCENTE = new THREE.Color('#FFF9EC');
const NEUTRON = new THREE.Color('#F4F7FF');
/** Una capa que ya no arde se pone pálida (nunca oscura). */
const PALIDO = new THREE.Color('#E6D2BF');
const CALIENTE = new THREE.Color('#FFE9A8');
/** La pared que rodea al núcleo, vista de cerca: gris lavanda, para que resalten las partículas blancas. */
const PARED = new THREE.Color('#9AA4C2');

// --- La estrella en capas ------------------------------------------------------------------------------------------

/** Lado de cada cubito y radio de la estrella en cubitos. */
const LADO = 0.25;
const RV = 22;
export const RADIO_ESTRELLA = RV * LADO;

/** Capas de afuera hacia adentro; `hasta`: radio exterior de la capa (fracción del radio de la estrella). */
export const CAPAS_ESTRELLA = [
  { simbolo: 'H', nombre: 'HIDRÓGENO', hasta: 1, color: '#C4572A' },
  { simbolo: 'He', nombre: 'HELIO', hasta: 0.83, color: '#E07A45' },
  { simbolo: 'C', nombre: 'CARBONO', hasta: 0.68, color: '#F5A623' },
  { simbolo: 'O', nombre: 'OXÍGENO', hasta: 0.55, color: '#FFD978' },
  { simbolo: 'Si', nombre: 'SILICIO', hasta: 0.42, color: '#F4EFE6' },
  { simbolo: 'Fe', nombre: 'HIERRO', hasta: 0.28, color: '#3DD6F5' },
];
const FE = CAPAS_ESTRELLA.length - 1;
export const RADIO_NUCLEO = CAPAS_ESTRELLA[FE].hasta * RADIO_ESTRELLA;
const COLOR_CAPA = CAPAS_ESTRELLA.map((c) => new THREE.Color(c.color));

/** Radio medio de la capa `i` (para su rótulo). */
export const radioCapa = (i: number) => ((CAPAS_ESTRELLA[i].hasta + (CAPAS_ESTRELLA[i + 1]?.hasta ?? 0)) / 2) * RADIO_ESTRELLA;

export type EstadoEstrella = {
  /** Reloj del video (fotogramas): titileos y partículas que se mueven. */
  t: number;
  /** 0–1: se abre el octavo que mira a la cámara (0 = la estrella entera). */
  abre?: number;
  /** 1 = todas las capas arden (titilan); al bajar a 0 se apagan de afuera hacia adentro y quedan pálidas. */
  arde?: number;
  /** 0–1: el núcleo de hierro brilla. */
  hierro?: number;
  /** 0–1: la gravedad aprieta un poco el núcleo. */
  aprieta?: number;
  /** 0–1: las capas de afuera desaparecen (queda la pared que rodea al núcleo) para ver bien el núcleo de cerca. */
  foco?: number;
  /** 0–1: el núcleo se ve por dentro: electrones (cian) y protones (ámbar). */
  particulas?: number;
  /** 0–1: cada electrón se funde con su protón, que pasa a ser un neutrón (blanco) con un destello. */
  funde?: number;
  /** 0–1: cuántos neutrinos (rayitas verdes) salen del centro. */
  neutrinos?: number;
  /** 0–1: el núcleo se encoge (de miles de km a unos 20). */
  colapso?: number;
  /** 0–1: las capas de adentro caen hacia el centro (las de afuera casi no se mueven). */
  caida?: number;
  /** Radio de la onda de choque (0 = no hay). Lo que está adentro sale empujado hasta ella. */
  choque?: number;
  /** 0–1: la onda se calienta (terracota → ámbar) y lo que empuja brilla. */
  calor?: number;
  /** 0–1: la onda se apaga (se vuelve tenue). */
  debil?: number;
  /** 0–1 (o más, la nube sigue abriéndose): todo sale volando. */
  estallido?: number;
};

type Cubito = { x: number; y: number; z: number; r: number; capa: number; u: number; v: number; octavo: boolean; pared: boolean };

let cubitos: Cubito[] | null = null;
/** Solo los cubitos que se ven: la superficie de la esfera, las tres caras del corte y la pared que rodea al núcleo
 * (cuando el núcleo se encoge, deja ver esa pared y no el hueco de la estrella por dentro). */
const crearCubitos = () => {
  if (cubitos) return cubitos;
  const R2 = RADIO_ESTRELLA * RADIO_ESTRELLA;
  const centro = (i: number) => (i + 0.5) * LADO;
  const dentro = (i: number, j: number, k: number) => centro(i) ** 2 + centro(j) ** 2 + centro(k) ** 2 <= R2;
  const quitado = (i: number, j: number, k: number) => i >= 0 && j >= 0 && k >= 0;
  const R_FE2 = (CAPAS_ESTRELLA[FE].hasta * RADIO_ESTRELLA) ** 2;
  const enNucleo = (i: number, j: number, k: number) => centro(i) ** 2 + centro(j) ** 2 + centro(k) ** 2 <= R_FE2;
  const vecinos: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const lista: Cubito[] = [];
  for (let i = -RV - 1; i <= RV; i++) {
    for (let j = -RV - 1; j <= RV; j++) {
      for (let k = -RV - 1; k <= RV; k++) {
        if (!dentro(i, j, k)) continue;
        const borde = vecinos.some(([a, b, c]) => !dentro(i + a, j + b, k + c));
        const octavo = quitado(i, j, k);
        const corte = !octavo && vecinos.some(([a, b, c]) => quitado(i + a, j + b, k + c) && dentro(i + a, j + b, k + c));
        const pared = !octavo && !enNucleo(i, j, k) && vecinos.some(([a, b, c]) => enNucleo(i + a, j + b, k + c));
        if (!borde && !corte && !pared) continue;
        const x = centro(i);
        const y = centro(j);
        const z = centro(k);
        const r = Math.hypot(x, y, z);
        let capa = 0;
        for (let c = FE; c >= 0; c--) {
          if (r <= CAPAS_ESTRELLA[c].hasta * RADIO_ESTRELLA + 1e-6) {
            capa = c;
            break;
          }
        }
        const n = lista.length;
        lista.push({ x, y, z, r, capa, u: random(`sn-cubo-${n}-u`), v: random(`sn-cubo-${n}-v`), octavo, pared: pared && !borde && !corte });
      }
    }
  }
  cubitos = lista;
  return lista;
};

/** Electrones y protones del núcleo, en parejas. */
const N_PARES = 120;
const pares = Array.from({ length: N_PARES }, (_, k) => {
  const d = alAzar(`sn-par-${k}`);
  const r = RADIO_NUCLEO * 0.88 * Math.cbrt(random(`sn-par-${k}-r`));
  return {
    p: [d[0] * r, d[1] * r, d[2] * r] as V3,
    e: alAzar(`sn-par-${k}-e`),
    fase: random(`sn-par-${k}-f`) * Math.PI * 2,
    umbral: random(`sn-par-${k}-umbral`),
  };
});

const N_NEUTRINOS = 170;
const VIDA_NEUTRINO = 26;
const neutrinos = Array.from({ length: N_NEUTRINOS }, (_, k) => ({
  d: alAzar(`sn-nu-${k}`),
  periodo: 30 + Math.floor(random(`sn-nu-${k}-p`) * 24),
  fase: Math.floor(random(`sn-nu-${k}-f`) * 60),
  umbral: random(`sn-nu-${k}-u`) * 0.95,
}));

const N_NUBE = 700;
const NUBE_COLORES = ['#F5A623', '#FFF9EC', '#E07A45', '#FFD978', '#C4572A'].map((c) => new THREE.Color(c));
const nube = Array.from({ length: N_NUBE }, (_, k) => ({
  d: alAzar(`sn-nube-${k}`),
  vel: 0.35 + random(`sn-nube-${k}-v`) * 0.9,
  c: Math.floor(random(`sn-nube-${k}-c`) * NUBE_COLORES.length),
  giro: random(`sn-nube-${k}-g`) * 6,
}));

/** Radio del núcleo con ese estado (para el brillo 2D que va encima). */
export const radioNucleo = (colapso = 0, aprieta = 0) => RADIO_NUCLEO * (1 - 0.88 * colapso) * (1 - 0.06 * aprieta);

/** Hacia dónde sale volando la tapa (el octavo que mira a la cámara). */
const SALE_TAPA = new THREE.Vector3(1, 1, 1).normalize();

const EscenaEstrella: FC<EstadoEstrella & { camara: CamaraVacio; centroY: number }> = ({ camara, centroY, ...e }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const lista = useMemo(crearCubitos, []);
  const cubos = useMemo(() => caja(new THREE.MeshLambertMaterial(), lista.length), [lista]);
  const protones = useMemo(() => caja(new THREE.MeshBasicMaterial(), N_PARES), []);
  const electrones = useMemo(() => caja(new THREE.MeshBasicMaterial(), N_PARES), []);
  const rayos = useMemo(() => caja(new THREE.MeshBasicMaterial({ color: VERDE }), N_NEUTRINOS), []);
  const restos = useMemo(() => caja(new THREE.MeshBasicMaterial(), N_NUBE), []);

  const { t, abre = 1, arde = 0, hierro = 0, aprieta = 0, foco = 0, particulas = 0, funde = 0, colapso = 0, caida = 0, choque = 0, calor = 0, debil = 0, estallido = 0 } = e;
  const sc = (1 - 0.88 * colapso) * (1 - 0.06 * aprieta);
  const rn = RADIO_NUCLEO * sc;
  const late = 0.5 + 0.5 * Math.sin(t * 0.3);

  // La estrella: cada cubito se mueve solo a lo largo de su radio (así las caras del corte siguen planas).
  lista.forEach((c, i) => {
    let r = c.r;
    let lado = LADO * 0.96;
    color.copy(COLOR_CAPA[c.capa]).multiplyScalar(0.92 + 0.16 * c.u);
    if (c.capa === FE) {
      r = c.r * sc;
      lado *= (1 - particulas) * Math.max(0.3, sc);
      color.lerp(CIAN_CLARO, hierro * (0.25 + 0.35 * late));
    } else {
      const d = (c.r - RADIO_NUCLEO) / (RADIO_ESTRELLA - RADIO_NUCLEO);
      const cae = limitar(caida * 1.3 - d * 0.3) ** 2;
      r = c.r - (c.r - (rn + 0.12 + d * 0.8)) * (1 - d) ** 2.2 * cae;
      if (c.pared) {
        lado = LADO * 1.02;
        color.lerp(PARED, 0.6 * foco);
      } else lado *= 1 - foco;
      const ardeCapa = limitar((arde - (1 - (c.capa + 1) / 5)) * 5);
      if (estallido <= 0) color.lerp(PALIDO, 0.2 * (1 - ardeCapa)).lerp(CALIENTE, 0.1 * ardeCapa);
      if (ardeCapa > 0 && random(`sn-titila-${i}-${Math.floor(t / 4)}`) < 0.035 * ardeCapa) color.lerp(CALIENTE, 0.7);
      if (choque > 0 && r < choque) r = choque * (0.94 + 0.06 * c.u);
      const cerca = choque > 0 ? limitar(1 - Math.abs(r - choque) / 0.7) : 0;
      if (cerca > 0) color.lerp(calor > 0 ? AMBAR : TERRACOTA, 0.55 * cerca).lerp(INCANDESCENTE, 0.45 * cerca * calor);
    }
    let x = (c.x / c.r) * r;
    let y = (c.y / c.r) * r;
    let z = (c.z / c.r) * r;
    if (c.octavo) {
      const q = limitar(abre * 1.5 - c.u * 0.5);
      if (q >= 1) {
        ocultar(cubos, i);
        return;
      }
      x += SALE_TAPA.x * q * 6;
      y += SALE_TAPA.y * q * 6;
      z += SALE_TAPA.z * q * 6;
      lado *= 1 - q;
    }
    if (estallido > 0 && c.capa !== FE) {
      if (c.v < (estallido - 0.55) * 0.6) {
        ocultar(cubos, i);
        return;
      }
      const lejos = estallido * (0.5 + c.u) * RADIO_ESTRELLA * 1.5;
      x += (c.x / c.r) * lejos;
      y += (c.y / c.r) * lejos;
      z += (c.z / c.r) * lejos;
      lado *= Math.max(0.15, 1 - 0.45 * estallido);
      color.lerp(INCANDESCENTE, 0.85 * limitar(1 - estallido * 4));
    }
    if (lado <= 0.001) {
      ocultar(cubos, i);
      return;
    }
    o.position.set(x, y, z);
    o.rotation.set(estallido * c.u * 4, estallido * c.v * 4, 0);
    o.scale.setScalar(lado);
    o.updateMatrix();
    cubos.setMatrixAt(i, o.matrix);
    cubos.setColorAt(i, color);
  });
  listo(cubos);

  // El núcleo por dentro: electrones que caen sobre su protón; el protón se vuelve neutrón con un destello.
  const tamano = Math.max(0.28, sc);
  pares.forEach((par, k) => {
    if (particulas <= 0) {
      ocultar(protones, k);
      ocultar(electrones, k);
      return;
    }
    const tiembla = 0.035;
    const px = par.p[0] * sc + tiembla * Math.sin(t * 0.21 + par.fase);
    const py = par.p[1] * sc + tiembla * Math.sin(t * 0.17 + par.fase * 2);
    const pz = par.p[2] * sc + tiembla * Math.sin(t * 0.19 + par.fase * 3);
    const q = limitar((funde - par.umbral * 0.7) / 0.3);
    const destello = q >= 1 ? limitar(1 - (funde - (par.umbral * 0.7 + 0.3)) / 0.07) : 0;
    o.position.set(px, py, pz);
    o.rotation.set(0, 0, 0);
    o.scale.setScalar(0.085 * particulas * tamano * (1 + 1.1 * destello));
    o.updateMatrix();
    protones.setMatrixAt(k, o.matrix);
    color.copy(q >= 1 ? NEUTRON : AMBAR).lerp(INCANDESCENTE, destello);
    protones.setColorAt(k, color);
    if (q >= 1) {
      ocultar(electrones, k);
      return;
    }
    // El electrón da vueltas cerca de su protón y cae sobre él.
    const a = t * 0.25 + par.fase;
    const lejos = 0.32 * sc * (1 - q * q);
    o.position.set(px + lejos * (par.e[0] * Math.cos(a) - par.e[2] * Math.sin(a)), py + lejos * par.e[1], pz + lejos * (par.e[2] * Math.cos(a) + par.e[0] * Math.sin(a)));
    o.scale.setScalar(0.055 * particulas * tamano);
    o.updateMatrix();
    electrones.setMatrixAt(k, o.matrix);
    electrones.setColorAt(k, CIAN);
  });
  listo(protones);
  listo(electrones);

  // Neutrinos: rayitas verdes que salen del núcleo en todas direcciones y lo atraviesan todo.
  const escala = camara.distancia / 50;
  neutrinos.forEach((nu, k) => {
    const edad = (t + nu.fase) % nu.periodo;
    if ((e.neutrinos ?? 0) <= nu.umbral || edad > VIDA_NEUTRINO) {
      ocultar(rayos, k);
      return;
    }
    const r = rn * 0.8 + edad * 0.42 * escala;
    direccion.set(nu.d[0], nu.d[1], nu.d[2]);
    o.position.set(nu.d[0] * r, nu.d[1] * r, nu.d[2] * r);
    o.quaternion.setFromUnitVectors(EJE_Z, direccion);
    const sale = 1 - edad / VIDA_NEUTRINO;
    o.scale.set(0.045 * escala, 0.045 * escala, 0.6 * escala * (0.4 + 0.6 * sale));
    o.updateMatrix();
    rayos.setMatrixAt(k, o.matrix);
    o.quaternion.identity();
  });
  listo(rayos);

  // La nube de la explosión, que llena lo que la estrella hueca no tiene.
  nube.forEach((n, k) => {
    if (estallido <= 0 || n.giro / 6 < (estallido - 0.8) * 0.6) {
      ocultar(restos, k);
      return;
    }
    const r = rn + estallido * n.vel * RADIO_ESTRELLA * 1.7;
    o.position.set(n.d[0] * r, n.d[1] * r, n.d[2] * r);
    o.rotation.set(n.giro + estallido * 3, n.giro, 0);
    o.scale.setScalar(0.17 * Math.max(0.25, 1 - 0.4 * estallido));
    o.updateMatrix();
    restos.setMatrixAt(k, o.matrix);
    color.copy(NUBE_COLORES[n.c]).lerp(INCANDESCENTE, limitar(1 - estallido * 2.5));
    restos.setColorAt(k, color);
  });
  listo(restos);

  const hayChoque = choque > 0 && estallido < 0.25;
  const colorChoque = TERRACOTA.clone().lerp(AMBAR, calor);
  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 10, 9]} intensity={1.15} />
      <directionalLight position={[-6, -3, 4]} intensity={0.35} color="#ffd9a8" />
      <primitive object={cubos} />
      <primitive object={protones} />
      <primitive object={electrones} />
      <primitive object={rayos} />
      <primitive object={restos} />
      {hayChoque && (
        <group scale={choque}>
          <mesh>
            <icosahedronGeometry args={[1, 3]} />
            <meshBasicMaterial color={colorChoque} wireframe transparent opacity={0.6 * (1 - estallido * 4) * (1 - 0.7 * debil)} depthWrite={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.99, 3]} />
            <meshBasicMaterial color={colorChoque} transparent opacity={(0.16 + 0.12 * calor) * (1 - 0.6 * debil)} depthWrite={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

export type Estrella3DProps = EstadoEstrella & { camara: CamaraVacio; centroY?: number; opacidad?: number };

/** La estrella en capas, del tamaño del cuadro entero (sin bordes visibles). */
export const Estrella3D: FC<Estrella3DProps> = ({ opacidad = 1, centroY = ALTO / 2, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 400, position: [0, 0, 40] }}>
        <EscenaEstrella {...props} centroY={centroY} />
      </LienzoTres>
    </div>
  );

// --- Dos estrellas de neutrones que chocan ---------------------------------------------------------------------------

export type EstadoFusion = {
  t: number;
  /** 0–1: giran cada vez más cerca y más rápido; en 1 se tocan. */
  giro: number;
  /** 0–1 (o más): la nube dorada del choque (kilonova). */
  kilonova?: number;
};

const SEPARACION = 4.4;
const VUELTAS = 4;
const RADIO_NEUTRONES = 0.5;

/** Dónde está cada estrella de neutrones (la otra está en el punto opuesto). Como en las ondas gravitacionales: la
 * distancia baja como (1 − giro)^¼ y las vueltas se aceleran al final. */
export const lugarFusion = (giro: number): V3 => {
  const g = limitar(giro);
  const a = Math.max(RADIO_NEUTRONES * 2, SEPARACION * (1 - g) ** 0.25) / 2;
  const fase = VUELTAS * Math.PI * 2 * (1 - (1 - g) ** 0.625);
  return [a * Math.cos(fase), 0, a * Math.sin(fase)];
};

const ESTELA = 90;
const N_ORO = 420;
const ORO = ['#FFD24A', '#F5A623', '#FFF2B0', '#FFE27A'].map((c) => new THREE.Color(c));
const ESTELA_COLOR = new THREE.Color('#BFD4FF');
const oro = Array.from({ length: N_ORO }, (_, k) => {
  const d = alAzar(`sn-oro-${k}`);
  // Más material sale por el plano de la órbita.
  const aplasta = random(`sn-oro-${k}-p`) < 0.6 ? 0.35 : 1;
  const n = Math.hypot(d[0], d[1] * aplasta, d[2]);
  return { d: [d[0] / n, (d[1] * aplasta) / n, d[2] / n] as V3, vel: 0.3 + random(`sn-oro-${k}-v`) * 0.9, c: Math.floor(random(`sn-oro-${k}-c`) * ORO.length), giro: random(`sn-oro-${k}-g`) * 6 };
});

const EscenaFusion: FC<EstadoFusion & { camara: CamaraVacio; centroY: number }> = ({ camara, centroY, t, giro, kilonova = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  colocarCamara(camera, camara, centroY);
  const estela = useMemo(() => caja(new THREE.MeshBasicMaterial(), ESTELA * 2), []);
  const polvo = useMemo(() => caja(new THREE.MeshBasicMaterial(), N_ORO), []);

  for (let k = 0; k < ESTELA; k++) {
    const g = giro - (k + 1) * 0.0045;
    const [x, y, z] = lugarFusion(g);
    for (const s of [1, -1]) {
      const i = k * 2 + (s === 1 ? 0 : 1);
      if (g <= 0 || kilonova > 0.25) {
        ocultar(estela, i);
        continue;
      }
      o.position.set(x * s, y, z * s);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(0.14 * (1 - k / ESTELA));
      o.updateMatrix();
      estela.setMatrixAt(i, o.matrix);
      color.copy(ESTELA_COLOR).lerp(new THREE.Color('#ffffff'), 1 - k / ESTELA);
      estela.setColorAt(i, color);
    }
  }
  listo(estela);

  oro.forEach((p, k) => {
    if (kilonova <= 0) {
      ocultar(polvo, k);
      return;
    }
    const r = 0.3 + kilonova * p.vel * 6;
    o.position.set(p.d[0] * r, p.d[1] * r, p.d[2] * r);
    o.rotation.set(p.giro + kilonova * 3, p.giro, 0);
    o.scale.setScalar(0.1 * Math.max(0.4, 1 - 0.3 * kilonova));
    o.updateMatrix();
    polvo.setMatrixAt(k, o.matrix);
    color.copy(ORO[p.c]).lerp(INCANDESCENTE, limitar(1 - kilonova * 3));
    polvo.setColorAt(k, color);
  });
  listo(polvo);

  const [x, y, z] = lugarFusion(giro);
  const quedan = kilonova <= 0;
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 9, 8]} intensity={1.0} />
      <primitive object={estela} />
      <primitive object={polvo} />
      {quedan &&
        [1, -1].map((s) => (
          <mesh key={s} position={[x * s, y, z * s]} rotation={[t * 0.05, t * 0.08 * s, 0]}>
            <icosahedronGeometry args={[RADIO_NEUTRONES, 1]} />
            <meshLambertMaterial color="#E6EEFF" emissive="#7FA8FF" emissiveIntensity={0.55} flatShading />
          </mesh>
        ))}
      {!quedan && (
        <mesh rotation={[t * 0.05, t * 0.07, 0]} scale={Math.max(0.5, 1.4 - kilonova)}>
          <icosahedronGeometry args={[RADIO_NEUTRONES * 1.1, 1]} />
          <meshLambertMaterial color="#FFF6DA" emissive="#FFD24A" emissiveIntensity={0.6} flatShading />
        </mesh>
      )}
    </>
  );
};

export type Fusion3DProps = EstadoFusion & { camara: CamaraVacio; centroY?: number; opacidad?: number };

/** El choque de dos estrellas de neutrones, del tamaño del cuadro entero. */
export const Fusion3D: FC<Fusion3DProps> = ({ opacidad = 1, centroY = ALTO / 2, ...props }) =>
  opacidad <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <LienzoTres flat camera={{ fov: FOV, near: 0.3, far: 400, position: [0, 0, 40] }}>
        <EscenaFusion {...props} centroY={centroY} />
      </LienzoTres>
    </div>
  );

/** Mezcla dos cámaras (la distancia en escala de potencias, para que acercarse se sienta parejo). */
export const mezclarCamaraEstrella = (t: number, a: CamaraVacio, b: CamaraVacio): CamaraVacio => ({
  distancia: Math.exp(mezclar(t, Math.log(a.distancia), Math.log(b.distancia))),
  elevacion: mezclar(t, a.elevacion, b.elevacion),
  azimut: mezclar(t, a.azimut, b.azimut),
  objetivo: [mezclar(t, a.objetivo[0], b.objetivo[0]), mezclar(t, a.objetivo[1], b.objetivo[1]), mezclar(t, a.objetivo[2], b.objetivo[2])],
});
