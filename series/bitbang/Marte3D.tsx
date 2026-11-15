// Marte (o la Tierra, un planeta océano, Venus, una roca o un mundo helado) en 3D, hecho de cubitos como el logo: una esfera hueca con
// manchas, casquetes polares y, en Marte, el gran cañón. Gira despacio con el fotograma y lleva un halo de atmósfera en 2D
// detrás. `cubosPlaneta` da los mismos cubitos a otro tamaño (los planetas de Sistema3D).
// La cámara y el giro salen del fotograma: nada de animaciones propias de three.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';

const FOV = 30;
const DISTANCIA = 20;
/** Píxeles del video por unidad del mundo 3D, en el plano del planeta. */
const PX_POR_UNIDAD = ALTO / (2 * DISTANCIA * Math.tan(((FOV / 2) * Math.PI) / 180));
const RADIO = 12; // en cubitos

export type TipoPlaneta = 'marte' | 'tierra' | 'oceano' | 'venus' | 'roca' | 'hielo';

/** Mancha en la superficie: centro (latitud, longitud en grados) y radio en grados. */
type Mancha = { lat: number; lon: number; r: number };

const ESTILO: Record<TipoPlaneta, { base: string[]; mancha: string[]; manchas: Mancha[]; polo: number; hielo: string[]; atmosfera: string }> = {
  marte: {
    base: ['#C8643B', '#D9773F', '#B85A33', '#E08A4E', '#CF6A3C'],
    mancha: ['#7A3A22', '#8E4527', '#6B3020'],
    // Syrtis Major, Acidalia, Mare Erythraeum, Cimmerium y Sabaeus.
    manchas: [
      { lat: 10, lon: 70, r: 17 },
      { lat: 45, lon: -30, r: 19 },
      { lat: -25, lon: -40, r: 22 },
      { lat: -22, lon: 140, r: 24 },
      { lat: -8, lon: 20, r: 14 },
    ],
    polo: 74,
    hielo: ['#F4EFE6', '#DCE6F0'],
    atmosfera: '#E07A45',
  },
  tierra: {
    base: ['#2F6FA3', '#285F8F', '#3478B0'],
    mancha: ['#4E9A45', '#3E8B3A', '#C9A15A', '#5BAA4A'],
    // Continentes a grandes rasgos.
    manchas: [
      { lat: 45, lon: -100, r: 24 },
      { lat: -15, lon: -60, r: 20 },
      { lat: 5, lon: 20, r: 24 },
      { lat: 50, lon: 60, r: 30 },
      { lat: -25, lon: 135, r: 14 },
    ],
    polo: 70,
    hielo: ['#F4EFE6', '#E8F0F8'],
    atmosfera: '#3DD6F5',
  },
  // Un mundo cubierto de agua con nubes (ilustración de un exoplaneta: no se sabe cómo es).
  oceano: {
    base: ['#2F7FC0', '#2A6FAE', '#3A8FD0', '#2563A0', '#3386C8'],
    mancha: ['#E8F1F8', '#CFE2F0', '#DCEAF4'],
    manchas: [
      { lat: 30, lon: -120, r: 16 },
      { lat: -10, lon: -20, r: 13 },
      { lat: 15, lon: 70, r: 18 },
      { lat: -35, lon: 150, r: 15 },
      { lat: 50, lon: 20, r: 12 },
    ],
    polo: 72,
    hielo: ['#F4EFE6', '#E8F0F8'],
    atmosfera: '#3DD6F5',
  },
  venus: {
    base: ['#E8C98A', '#D9B877', '#F0D9A0', '#E2C184'],
    mancha: ['#C9A15A', '#B8904C'],
    manchas: [
      { lat: 20, lon: -80, r: 22 },
      { lat: -30, lon: 60, r: 26 },
    ],
    polo: 95,
    hielo: ['#F0D9A0'],
    atmosfera: '#F0D9A0',
  },
  roca: {
    base: ['#8A7F72', '#7A6F64', '#9A8E80', '#847868'],
    mancha: ['#5E554C', '#6B6157'],
    manchas: [
      { lat: 10, lon: 40, r: 18 },
      { lat: -30, lon: -70, r: 20 },
      { lat: 40, lon: 160, r: 15 },
    ],
    polo: 95,
    hielo: ['#9A8E80'],
    atmosfera: '#9A8E80',
  },
  // Un mundo helado (demasiado lejos de su estrella).
  hielo: {
    base: ['#DCEAF4', '#C8DCEB', '#E8F1F8', '#B8D0E4'],
    mancha: ['#9FC4E0', '#8DB6D6'],
    manchas: [
      { lat: 15, lon: -60, r: 20 },
      { lat: -25, lon: 80, r: 18 },
      { lat: 40, lon: 150, r: 14 },
    ],
    polo: 60,
    hielo: ['#F4F8FC', '#FFFFFF'],
    atmosfera: '#9FD8FF',
  },
};

/** Color del halo de atmósfera de cada tipo de planeta. */
export const atmosferaPlaneta = (tipo: TipoPlaneta) => ESTILO[tipo].atmosfera;

export type CuboPlaneta = { x: number; y: number; z: number; color: THREE.Color };

/** Distancia en grados entre dos puntos de la esfera. */
const distanciaAngular = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const r = Math.PI / 180;
  const c = Math.sin(lat1 * r) * Math.sin(lat2 * r) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lon1 - lon2) * r);
  return Math.acos(Math.max(-1, Math.min(1, c))) / r;
};

/** Cubitos de la cáscara de un planeta de `radio` cubitos, centrado en 0 (siempre los mismos para el mismo tipo y radio). */
export const cubosPlaneta = (tipo: TipoPlaneta, radio = RADIO): CuboPlaneta[] => {
  const e = ESTILO[tipo];
  const lista: CuboPlaneta[] = [];
  for (let x = -radio; x <= radio; x++) {
    for (let y = -radio; y <= radio; y++) {
      for (let z = -radio; z <= radio; z++) {
        const d = Math.hypot(x, y, z);
        if (d > radio + 0.45 || d < radio - 1.3) continue;
        const r = (k: string) => random(`bb-${tipo}-${x}-${y}-${z}-${k}`);
        const lat = (Math.asin(y / d) * 180) / Math.PI;
        const lon = (Math.atan2(z, x) * 180) / Math.PI;
        // Borde irregular de las manchas: el radio cambia un poco con el ángulo.
        const enMancha = e.manchas.some((m) => distanciaAngular(lat, lon, m.lat, m.lon) < m.r * (0.8 + 0.4 * r('borde')));
        const canon = tipo === 'marte' && Math.abs(lat + 9) < 2.6 && lon > -110 && lon < -45;
        let lista2 = enMancha || canon ? e.mancha : e.base;
        if (Math.abs(lat) > e.polo - 6 * r('polo')) lista2 = e.hielo;
        const color = new THREE.Color(lista2[Math.floor(r('c') * lista2.length)]);
        color.offsetHSL(0, 0, (r('l') - 0.5) * 0.06);
        lista.push({ x, y, z, color });
      }
    }
  }
  return lista;
};

const Escena: FC<{ tipo: TipoPlaneta; giro: number; tamano: number; xMundo: number; yMundo: number }> = ({ tipo, giro, tamano, xMundo, yMundo }) => {
  const { camera } = useThree();
  camera.position.set(0, 0, DISTANCIA);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  const malla = useMemo(() => {
    const cubos = cubosPlaneta(tipo);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), new THREE.MeshLambertMaterial(), cubos.length);
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
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[-8, 6, 10]} intensity={1.45} />
      <directionalLight position={[8, -4, 4]} intensity={0.25} color="#ffd9a8" />
      <group position={[xMundo, yMundo, 0]} scale={tamano} rotation={[0.18, 0, 0.32]}>
        <group rotation={[0, giro, 0]}>
          <primitive object={malla} />
        </group>
      </group>
    </>
  );
};

export type Marte3DProps = {
  /** Centro del planeta en el video (px). */
  x?: number;
  y?: number;
  /** Radio del planeta en el video (px). */
  radio: number;
  /** Vuelta sobre su eje, en radianes (sale del fotograma). */
  giro: number;
  tipo?: TipoPlaneta;
  opacidad?: number;
  /** 0–1: halo de atmósfera detrás. */
  halo?: number;
};

/** Marte (o la Tierra) de cubitos, del tamaño del cuadro entero (sin bordes visibles). */
export const Marte3D: FC<Marte3DProps> = ({ x = ANCHO / 2, y = ALTO / 2, radio, giro, tipo = 'marte', opacidad = 1, halo = 1 }) => {
  if (opacidad <= 0 || radio <= 0) return null;
  const tamano = radio / PX_POR_UNIDAD / RADIO;
  const c = ESTILO[tipo].atmosfera;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      {halo > 0 && (
        <div
          style={{
            position: 'absolute',
            left: x - radio * 1.5,
            top: y - radio * 1.5,
            width: radio * 3,
            height: radio * 3,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c}55 0%, ${c}33 34%, ${c}12 48%, transparent 66%)`,
            opacity: halo,
          }}
        />
      )}
      <LienzoTres flat camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, DISTANCIA] }}>
        <Escena tipo={tipo} giro={giro} tamano={tamano} xMundo={(x - ANCHO / 2) / PX_POR_UNIDAD} yMundo={(ALTO / 2 - y) / PX_POR_UNIDAD} />
      </LienzoTres>
    </div>
  );
};
