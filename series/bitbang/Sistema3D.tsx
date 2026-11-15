// Un sistema estelar en 3D, hecho de cubitos como el logo: la estrella (que hierve), la zona habitable como un anillo
// de baldosas verdes sobre el plano de las órbitas (con, si se pide, la franja caliente de adentro y la helada de afuera)
// y planetas de cubitos (ilustraciones: no son imágenes reales). La cámara sale del fotograma: nada de animaciones
// propias de three. Órbitas, rótulos y llamaradas van en 2D encima, ubicados con `proyectorSistema`.
// Las órbitas están en el plano y = 0; las unidades son libres (en los videos, el centro de la zona habitable queda cerca de 1).
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { BRILLO_ESTRELLA, COLORES_ESTRELLA, type TipoEstrella } from './Estrella';
import { atmosferaPlaneta, cubosPlaneta, type TipoPlaneta } from './Marte3D';
import { bb } from './tema';

const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

export type CamaraSistema = {
  /** Grados sobre el plano de las órbitas (90 = desde arriba). */
  elevacion: number;
  /** Vuelta alrededor del punto mirado, en grados. */
  azimut: number;
  /** Píxeles que mide una unidad del sistema en el punto mirado. */
  escala: number;
  /** Dónde cae en el video el punto mirado (px). */
  centro: { x: number; y: number };
  /** Punto del plano al que mira la cámara (por defecto, la estrella). */
  mira?: { x: number; z: number };
};

const ajustar = (camara: THREE.PerspectiveCamera, c: CamaraSistema) => {
  const distancia = ALTO / (2 * TAN * c.escala);
  const el = (Math.min(89.6, c.elevacion) * Math.PI) / 180;
  const az = (c.azimut * Math.PI) / 180;
  const m = c.mira ?? { x: 0, z: 0 };
  camara.position.set(m.x + distancia * Math.cos(el) * Math.sin(az), distancia * Math.sin(el), m.z + distancia * Math.cos(el) * Math.cos(az));
  camara.up.set(0, 1, 0);
  camara.lookAt(m.x, 0, m.z);
  camara.setViewOffset(camara.aspect * ALTO, ALTO, ANCHO / 2 - c.centro.x, ALTO / 2 - c.centro.y, camara.aspect * ALTO, ALTO);
  camara.updateProjectionMatrix();
  camara.updateMatrixWorld();
};

export type PuntoSistema = { x: number; y?: number; z: number };

/** Función que lleva un punto del sistema a su lugar en el video (px). `delante` = false si queda detrás de la cámara. */
export const proyectorSistema = (c: CamaraSistema) => {
  const camara = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.01, 2000);
  ajustar(camara, c);
  const v = new THREE.Vector3();
  return (p: PuntoSistema) => {
    v.set(p.x, p.y ?? 0, p.z).project(camara);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO, delante: v.z < 1 };
  };
};

/**
 * Punto de una órbita con la estrella en un foco. `radio` = semieje mayor; `angulo` (radianes) recorre la órbita;
 * con `excentricidad` > 0 es una elipse cuyo punto más cercano a la estrella mira hacia `perihelio` (radianes).
 */
export const enOrbita = (radio: number, angulo: number, excentricidad = 0, perihelio = 0) => {
  const b = radio * Math.sqrt(1 - excentricidad * excentricidad);
  const px = radio * (Math.cos(angulo) - excentricidad);
  const pz = -b * Math.sin(angulo);
  const c = Math.cos(perihelio);
  const s = Math.sin(perihelio);
  return { x: px * c - pz * s, z: px * s + pz * c };
};

type OrbitaProps = {
  camara: CamaraSistema;
  radio: number;
  excentricidad?: number;
  perihelio?: number;
  /** 0–1: cuánto de la vuelta está dibujado, empezando en `inicio` (radianes). */
  progreso?: number;
  inicio?: number;
  color?: string;
  grosor?: number;
  discontinua?: boolean;
  opacidad?: number;
};

/** Órbita en 2D sobre el sistema (dentro de un `Lienzo`). */
export const Orbita: FC<OrbitaProps> = ({ camara, radio, excentricidad = 0, perihelio = 0, progreso = 1, inicio = 0, color: c = bb.hueso, grosor = 3, discontinua = true, opacidad = 0.4 }) => {
  if (progreso <= 0 || opacidad <= 0) return null;
  const proyectar = proyectorSistema(camara);
  const n = Math.max(2, Math.round(140 * progreso));
  const puntos = Array.from({ length: n + 1 }, (_, i) => {
    const p = proyectar(enOrbita(radio, inicio + (i / n) * progreso * 2 * Math.PI, excentricidad, perihelio));
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  return <polyline points={puntos} fill="none" stroke={c} strokeWidth={grosor} strokeDasharray={discontinua ? '10 10' : undefined} opacity={opacidad} />;
};

// --- Estrella --------------------------------------------------------------------------------------------

const RADIO_ESTRELLA = 7; // en cubitos

const CUBOS_ESTRELLA = (() => {
  const lista: { x: number; y: number; z: number }[] = [];
  for (let x = -RADIO_ESTRELLA; x <= RADIO_ESTRELLA; x++) {
    for (let y = -RADIO_ESTRELLA; y <= RADIO_ESTRELLA; y++) {
      for (let z = -RADIO_ESTRELLA; z <= RADIO_ESTRELLA; z++) {
        const d = Math.hypot(x, y, z);
        if (d <= RADIO_ESTRELLA + 0.45 && d >= RADIO_ESTRELLA - 1.3) lista.push({ x, y, z });
      }
    }
  }
  return lista;
})();

export type EstrellaSistema = {
  tipo: TipoEstrella;
  /** Radio en unidades del sistema. */
  radio: number;
  /** 0–1: destello (se aclara hacia el blanco). */
  destello?: number;
};

const BLANCO = new THREE.Color('#FFF8EC');

const EstrellaCubos: FC<{ estrella: EstrellaSistema; frame: number }> = ({ estrella, frame }) => {
  const malla = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), new THREE.MeshBasicMaterial({ toneMapped: false }), CUBOS_ESTRELLA.length);
    const o = new THREE.Object3D();
    CUBOS_ESTRELLA.forEach((c, i) => {
      o.position.set(c.x, c.y, c.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, BLANCO);
    });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  const paleta = COLORES_ESTRELLA[estrella.tipo];
  const turno = Math.floor(frame / 4);
  const c = new THREE.Color();
  CUBOS_ESTRELLA.forEach((_, i) => {
    const base = random(`bb-sol3d-${i}`);
    const cambia = random(`bb-sol3d-${i}-${turno}`) < 0.3;
    c.set(paleta[Math.floor(((base + (cambia ? 0.37 : 0)) % 1) * paleta.length)]);
    if (estrella.destello) c.lerp(BLANCO, 0.7 * estrella.destello);
    malla.setColorAt(i, c);
  });
  malla.instanceColor!.needsUpdate = true;
  return (
    <group scale={estrella.radio / RADIO_ESTRELLA} rotation={[0.2, frame * 0.008, 0]}>
      <primitive object={malla} />
    </group>
  );
};

// --- Zona habitable ------------------------------------------------------------------------------------

export type ZonaSistema = {
  interior: number;
  exterior: number;
  /** 0–1: las baldosas verdes aparecen dando la vuelta, como un radar. */
  aparece: number;
  /** 0–1: la franja caliente de adentro (terracota) y la helada de afuera (celeste). */
  bandas?: number;
  /** 0–1: golpe de brillo. */
  late?: number;
  opacidad?: number;
};

type Baldosa = { x: number; z: number; vuelta: number; r: number };

const crearBaldosas = (desde: number, hasta: number, paso: number, semilla: string): Baldosa[] => {
  const lista: Baldosa[] = [];
  const n = Math.ceil(hasta / paso);
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = (i + 0.5) * paso;
      const z = (j + 0.5) * paso;
      const d = Math.hypot(x, z);
      if (d < desde || d > hasta) continue;
      lista.push({ x, z, vuelta: (Math.atan2(-z, x) / (2 * Math.PI) + 1.25) % 1, r: random(`${semilla}-${i}-${j}`) });
    }
  }
  return lista;
};

const Baldosas: FC<{ baldosas: Baldosa[]; paso: number; colores: string[]; aparece: number; opacidad: number; late?: number; frame: number }> = ({
  baldosas, paso, colores, aparece, opacidad, late = 0, frame,
}) => {
  const malla = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    return new THREE.InstancedMesh(new THREE.BoxGeometry(paso * 0.8, paso * 0.14, paso * 0.8), material, baldosas.length);
  }, [baldosas, paso]);
  const o = new THREE.Object3D();
  const c = new THREE.Color();
  const turno = Math.floor(frame / 5);
  baldosas.forEach((b, i) => {
    const s = Math.max(0, Math.min(1, (aparece * 1.25 - b.vuelta) / 0.25));
    o.position.set(b.x, 0, b.z);
    o.scale.setScalar(Math.max(0.0001, s));
    o.updateMatrix();
    malla.setMatrixAt(i, o.matrix);
    const brillo = 0.75 + 0.25 * random(`${b.r}-${turno}`) + 0.5 * late;
    c.set(colores[Math.floor(b.r * colores.length)]).multiplyScalar(brillo);
    malla.setColorAt(i, c);
  });
  malla.instanceMatrix.needsUpdate = true;
  malla.instanceColor!.needsUpdate = true;
  (malla.material as THREE.MeshBasicMaterial).opacity = opacidad;
  return <primitive object={malla} />;
};

const VERDES = [bb.verde, '#2FE07A', '#5BFFA0', '#39FF88'];
const CALIENTES = [bb.terracota, bb.terracotaClara, '#D96A3A'];
const HELADAS = ['#9FD8FF', '#DCE6F0', '#B8E2FF'];

const ZonaBaldosas: FC<{ zona: ZonaSistema; estrella: EstrellaSistema; frame: number }> = ({ zona, estrella, frame }) => {
  const { interior, exterior } = zona;
  const paso = (exterior - interior) / 7;
  const verdes = useMemo(() => crearBaldosas(interior, exterior, paso, 'bb-zona'), [interior, exterior, paso]);
  const calientes = useMemo(() => crearBaldosas(estrella.radio * 1.7, interior - paso * 0.3, paso, 'bb-caliente'), [estrella.radio, interior, paso]);
  const heladas = useMemo(() => crearBaldosas(exterior + paso * 0.3, exterior * 1.45, paso, 'bb-helada'), [exterior, paso]);
  const opacidad = zona.opacidad ?? 1;
  const bandas = (zona.bandas ?? 0) * opacidad;
  return (
    <>
      {zona.aparece > 0 && <Baldosas baldosas={verdes} paso={paso} colores={VERDES} aparece={zona.aparece} opacidad={0.4 * opacidad} late={zona.late} frame={frame} />}
      {bandas > 0 && <Baldosas baldosas={calientes} paso={paso} colores={CALIENTES} aparece={1} opacidad={0.3 * bandas} frame={frame} />}
      {bandas > 0 && <Baldosas baldosas={heladas} paso={paso} colores={HELADAS} aparece={1} opacidad={0.16 * bandas} frame={frame} />}
    </>
  );
};

// --- Planetas ------------------------------------------------------------------------------------------

const RADIO_PLANETA = 6; // en cubitos

export type PlanetaSistema = {
  tipo: TipoPlaneta;
  /** Lugar en el plano de las órbitas (ver `enOrbita`). */
  x: number;
  z: number;
  /** Radio en unidades del sistema. */
  radio: number;
  /** Vuelta sobre su eje, en radianes. */
  giro: number;
  opacidad?: number;
  /** 0–1: halo de atmósfera detrás (en 2D). */
  halo?: number;
};

const PlanetaCubos: FC<{ planeta: PlanetaSistema }> = ({ planeta }) => {
  const { tipo } = planeta;
  const malla = useMemo(() => {
    const cubos = cubosPlaneta(tipo, RADIO_PLANETA);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), new THREE.MeshLambertMaterial({ transparent: true }), cubos.length);
    const o = new THREE.Object3D();
    cubos.forEach((c, i) => {
      o.position.set(c.x, c.y, c.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.color);
    });
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor!.needsUpdate = true;
    return m;
  }, [tipo]);
  (malla.material as THREE.MeshLambertMaterial).opacity = planeta.opacidad ?? 1;
  return (
    <group position={[planeta.x, 0, planeta.z]} scale={planeta.radio / RADIO_PLANETA} rotation={[0.18, 0, 0.32]}>
      <group rotation={[0, planeta.giro, 0]}>
        <primitive object={malla} />
      </group>
    </group>
  );
};

// --- Todo junto ----------------------------------------------------------------------------------------

export type Sistema3DProps = {
  camara: CamaraSistema;
  estrella: EstrellaSistema;
  zona?: ZonaSistema;
  planetas?: PlanetaSistema[];
  frame: number;
  opacidad?: number;
};

const Escena: FC<Sistema3DProps> = ({ camara, estrella, zona, planetas = [], frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(camera, camara);
  return (
    <>
      <ambientLight intensity={0.95} />
      <pointLight position={[0, 0, 0]} intensity={4.5} decay={0} />
      <EstrellaCubos estrella={estrella} frame={frame} />
      {zona && <ZonaBaldosas zona={zona} estrella={estrella} frame={frame} />}
      {planetas.map((p, i) => ((p.opacidad ?? 1) > 0 && p.radio > 0 ? <PlanetaCubos key={`${p.tipo}-${i}`} planeta={p} /> : null))}
    </>
  );
};

/** El sistema, del tamaño del cuadro entero (sin bordes visibles), con el resplandor de la estrella y los halos de los planetas en 2D detrás. */
export const Sistema3D: FC<Sistema3DProps> = ({ opacidad = 1, ...props }) => {
  if (opacidad <= 0) return null;
  const proyectar = proyectorSistema(props.camara);
  const centro = proyectar({ x: 0, z: 0 });
  const rs = props.estrella.radio * props.camara.escala;
  const brillo = BRILLO_ESTRELLA[props.estrella.tipo];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      {centro.delante && (
        <div
          style={{
            position: 'absolute',
            left: centro.x - rs * 3.4,
            top: centro.y - rs * 3.4,
            width: rs * 6.8,
            height: rs * 6.8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${brillo}AA 0%, ${brillo}44 22%, ${brillo}14 45%, transparent 68%)`,
            opacity: 0.8 + 0.4 * (props.estrella.destello ?? 0),
          }}
        />
      )}
      {(props.planetas ?? []).map((p, i) => {
        const halo = (p.halo ?? 0) * (p.opacidad ?? 1);
        if (halo <= 0) return null;
        const q = proyectar(p);
        const r = p.radio * props.camara.escala;
        const c = atmosferaPlaneta(p.tipo);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: q.x - r * 1.6,
              top: q.y - r * 1.6,
              width: r * 3.2,
              height: r * 3.2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${c}66 0%, ${c}33 36%, ${c}10 52%, transparent 68%)`,
              opacity: halo,
            }}
          />
        );
      })}
      <LienzoTres flat camera={{ fov: FOV, near: 0.01, far: 2000, position: [0, 0, 10] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
};
