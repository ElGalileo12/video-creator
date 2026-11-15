// La Vía Láctea en 3D: miles de puntos (estrellas) en dos brazos espirales, un bulbo central y un disco tenue,
// todo hecho con random() (siempre la misma galaxia). La cámara sale del fotograma: nada de animaciones de three.
// Encima, en 2D: las colonias (una ola que salta de estrella en estrella y deja rutas), las civilizaciones
// (puntos que se encienden y se apagan) y la nave de píxeles, ubicadas con `proyectorGalaxia`. La galaxia mide 1 de radio y está en el plano y = 0.
import { useThree } from '@react-three/fiber';
import { useMemo, type FC } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import { ALTO, ANCHO } from '../../src/estilo';
import { LienzoTres } from '../../src/LienzoTres';
import { bb } from './tema';

const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

/** Distancia de cámara a la que el radio de la galaxia (1) mide `radioPx` en pantalla. */
export const distanciaGalaxia = (radioPx: number) => ALTO / (2 * TAN * radioPx);

export type CamaraGalaxia = {
  /** Grados sobre el plano de la galaxia (90 = desde arriba). */
  elevacion: number;
  /** Vuelta alrededor del punto mirado, en grados: girarlo con el fotograma hace que la galaxia rote. */
  azimut: number;
  distancia: number;
  /** Altura en el video (px) del punto mirado. */
  centroY: number;
  /** Punto de la galaxia al que mira la cámara (por defecto, el centro). */
  mira?: { x: number; z: number };
};

const ajustar = (camara: THREE.PerspectiveCamera, c: CamaraGalaxia) => {
  const el = (Math.min(89.6, c.elevacion) * Math.PI) / 180;
  const az = (c.azimut * Math.PI) / 180;
  const m = c.mira ?? { x: 0, z: 0 };
  camara.position.set(m.x + c.distancia * Math.cos(el) * Math.sin(az), c.distancia * Math.sin(el), m.z + c.distancia * Math.cos(el) * Math.cos(az));
  camara.up.set(0, 1, 0);
  camara.lookAt(m.x, 0, m.z);
  camara.setViewOffset(camara.aspect * ALTO, ALTO, 0, ALTO / 2 - c.centroY, camara.aspect * ALTO, ALTO);
  camara.updateProjectionMatrix();
  camara.updateMatrixWorld();
};

export type Punto3D = { x: number; y: number; z: number };

/** Función que lleva un punto de la galaxia a su lugar en el video (px). `delante` = false si queda detrás de la cámara. */
export const proyectorGalaxia = (c: CamaraGalaxia) => {
  const camara = new THREE.PerspectiveCamera(FOV, ANCHO / ALTO, 0.01, 100);
  ajustar(camara, c);
  const v = new THREE.Vector3();
  return (p: Punto3D) => {
    v.set(p.x, p.y, p.z).project(camara);
    return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO, delante: v.z < 1 };
  };
};

/** Píxeles por unidad de la galaxia a la distancia de la cámara (sirve para escalar dibujos 2D encima). */
export const escalaGalaxia = (c: CamaraGalaxia) => ALTO / (2 * TAN * c.distancia);

// --- Estrellas ---------------------------------------------------------------------------------------

/** Número al azar con forma de campana (media 0, desviación 1), siempre igual para la misma clave. */
export const campana = (clave: string) => {
  const u = Math.max(1e-6, random(`${clave}-u`));
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random(`${clave}-v`));
};

const BRAZOS = 2;
const VUELTA = 4.4; // cuánto se enrollan los brazos

/** Un punto al azar de un brazo espiral (t 0–1 a lo largo del brazo). */
export const puntoBrazo = (clave: string) => {
  const brazo = Math.floor(random(`${clave}-b`) * BRAZOS);
  const t = Math.pow(random(`${clave}-t`), 0.85);
  const radio = 0.1 + 0.9 * t;
  const ang = (brazo * 2 * Math.PI) / BRAZOS + radio * VUELTA;
  const ancho = 0.045 + 0.075 * radio;
  return {
    x: radio * Math.cos(ang) + campana(`${clave}-x`) * ancho,
    z: radio * Math.sin(ang) + campana(`${clave}-z`) * ancho,
    y: campana(`${clave}-y`) * 0.022 * (1.2 - 0.6 * radio),
  };
};

const COLORES_BRAZO = [bb.hueso, bb.hueso, '#C9D6F0', '#9FB0D0', '#9FB0D0', bb.cian, '#FFD9A0'];
const COLORES_BULBO = ['#FFE2B0', bb.ambar, '#F2C46D', bb.hueso];

type Estrella = Punto3D & { color: THREE.Color; grande: boolean };

const crearEstrellas = (): Estrella[] => {
  const lista: Estrella[] = [];
  const agregar = (p: Punto3D, colores: string[], clave: string, brillo: [number, number], grande = 0.03) => {
    const color = new THREE.Color(colores[Math.floor(random(`${clave}-c`) * colores.length)]);
    color.multiplyScalar(brillo[0] + random(`${clave}-l`) * (brillo[1] - brillo[0]));
    lista.push({ ...p, color, grande: random(`${clave}-g`) < grande });
  };
  for (let i = 0; i < 5200; i++) agregar(puntoBrazo(`gx-brazo-${i}`), COLORES_BRAZO, `gx-brazo-${i}`, [0.35, 1]);
  // Disco tenue entre los brazos.
  for (let i = 0; i < 1800; i++) {
    const k = `gx-disco-${i}`;
    const radio = Math.min(1.1, -Math.log(Math.max(1e-4, random(`${k}-r`))) * 0.32);
    const ang = random(`${k}-a`) * 2 * Math.PI;
    agregar({ x: radio * Math.cos(ang), z: radio * Math.sin(ang), y: campana(`${k}-y`) * 0.03 }, COLORES_BRAZO, k, [0.2, 0.55], 0.01);
  }
  // Bulbo: una nube cálida y apretada en el centro.
  for (let i = 0; i < 1200; i++) {
    const k = `gx-bulbo-${i}`;
    agregar({ x: campana(`${k}-x`) * 0.1, z: campana(`${k}-z`) * 0.1, y: campana(`${k}-y`) * 0.055 }, COLORES_BULBO, k, [0.18, 0.5], 0.02);
  }
  return lista;
};

const nube = (estrellas: Estrella[], tamano: number) => {
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(estrellas.flatMap((e) => [e.x, e.y, e.z]), 3));
  geometria.setAttribute('color', new THREE.Float32BufferAttribute(estrellas.flatMap((e) => [e.color.r, e.color.g, e.color.b]), 3));
  const material = new THREE.PointsMaterial({ size: tamano, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  return new THREE.Points(geometria, material);
};

export type Galaxia3DProps = {
  camara: CamaraGalaxia;
  opacidad?: number;
  /** Desenfoque en px (para el zoom rápido del principio). */
  desenfoque?: number;
  /** Multiplica el tamaño de los puntos (de cerca se ven más gordos). */
  tamano?: number;
};

const Escena: FC<Galaxia3DProps> = ({ camara, tamano = 1 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(camera, camara);
  const [chicas, grandes] = useMemo(() => {
    const estrellas = crearEstrellas();
    return [nube(estrellas.filter((e) => !e.grande), 3), nube(estrellas.filter((e) => e.grande), 6)];
  }, []);
  (chicas.material as THREE.PointsMaterial).size = Math.round(3 * tamano);
  (grandes.material as THREE.PointsMaterial).size = Math.round(6 * tamano);
  return (
    <>
      <primitive object={chicas} />
      <primitive object={grandes} />
    </>
  );
};

/** La galaxia, del tamaño del cuadro entero (sin bordes visibles), con un brillo cálido en el centro. */
export const Galaxia3D: FC<Galaxia3DProps> = ({ opacidad = 1, desenfoque = 0, ...props }) => {
  const centro = proyectorGalaxia(props.camara)({ x: 0, y: 0, z: 0 });
  const r = escalaGalaxia(props.camara) * 0.42;
  const achata = Math.max(0.15, Math.sin((props.camara.elevacion * Math.PI) / 180));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: opacidad, filter: desenfoque > 0.05 ? `blur(${desenfoque}px)` : undefined }}>
      {centro.delante && (
        <div
          style={{
            position: 'absolute',
            left: centro.x - r,
            top: centro.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${bb.ambar}66 0%, ${bb.terracota}22 40%, transparent 70%)`,
            transform: `scaleY(${achata})`,
          }}
        />
      )}
      <LienzoTres flat camera={{ fov: FOV, near: 0.01, far: 100, position: [0, 0, 10] }}>
        <Escena {...props} />
      </LienzoTres>
    </div>
  );
};

// --- Colonias: una ola que salta de estrella en estrella -----------------------------------------------

export type Colonia = Punto3D & {
  /** Índice de la colonia de la que salió la nave (−1 = el origen). */
  padre: number;
  /** Momento (0–1) en que sale la nave del padre y en que llega. */
  sale: number;
  llega: number;
};

/**
 * Sistemas al azar sobre los brazos y, desde el más cercano a `origen`, una red de saltos cortos: cada sistema
 * nuevo se une al ya colonizado que tenga más cerca (árbol de Prim). La nave tarda lo que mide el salto más una
 * espera en cada parada. Los tiempos van de 0 a 1.
 */
export const crearColonias = ({ cantidad = 180, origen = { x: 0.62, z: -0.3 }, semilla = 'colonias', espera = 0.04 } = {}): Colonia[] => {
  const puntos: Punto3D[] = [];
  for (let i = 0; puntos.length < cantidad; i++) {
    const p = puntoBrazo(`${semilla}-${i}`);
    if (Math.hypot(p.x, p.z) > 0.22) puntos.push(p);
  }
  const distancia = (a: Punto3D, b: Punto3D) => Math.hypot(a.x - b.x, a.z - b.z);
  const inicio = puntos.reduce((mejor, p, i) => (distancia(p, { x: origen.x, y: 0, z: origen.z }) < distancia(puntos[mejor], { x: origen.x, y: 0, z: origen.z }) ? i : mejor), 0);
  const llega = puntos.map(() => 0);
  const padre = puntos.map(() => inicio);
  const cerca = puntos.map((p) => distancia(p, puntos[inicio]));
  const colonizado = puntos.map((_, i) => i === inicio);
  for (let n = 1; n < puntos.length; n++) {
    let k = -1;
    for (let j = 0; j < puntos.length; j++) if (!colonizado[j] && (k < 0 || cerca[j] < cerca[k])) k = j;
    colonizado[k] = true;
    llega[k] = llega[padre[k]] + espera + cerca[k];
    for (let j = 0; j < puntos.length; j++) {
      if (colonizado[j]) continue;
      const d = distancia(puntos[j], puntos[k]);
      if (d < cerca[j]) {
        cerca[j] = d;
        padre[j] = k;
      }
    }
  }
  const total = Math.max(...llega);
  return puntos.map((p, i) => ({
    ...p,
    padre: i === inicio ? -1 : padre[i],
    sale: i === inicio ? 0 : (llega[padre[i]] + espera) / total,
    llega: llega[i] / total,
  }));
};

/** La rama más larga desde el origen: por ahí viaja la nave que se ve de cerca. */
export const rutaPrincipal = (colonias: Colonia[], saltos: number) => {
  const hijos = colonias.map((_, i) => colonias.flatMap((c, k) => (c.padre === i ? [k] : [])));
  const hondo = (i: number): number => 1 + Math.max(0, ...hijos[i].map(hondo));
  const ruta = [colonias.findIndex((c) => c.padre < 0)];
  while (ruta.length <= saltos) {
    const siguientes = hijos[ruta.at(-1)!];
    if (siguientes.length === 0) break;
    ruta.push(siguientes.reduce((a, b) => (hondo(b) > hondo(a) ? b : a)));
  }
  return ruta;
};

/** Dónde va la nave de la ruta en el momento `avance` (0–1), y hacia dónde mira. */
export const naveEnRuta = (colonias: Colonia[], ruta: number[], avance: number) => {
  for (let k = 1; k < ruta.length; k++) {
    const c = colonias[ruta[k]];
    const a = colonias[ruta[k - 1]];
    if (avance < c.sale) return { ...a, hacia: c, volando: false };
    if (avance < c.llega) {
      const t = (avance - c.sale) / (c.llega - c.sale);
      const s = t * t * (3 - 2 * t);
      return { x: a.x + (c.x - a.x) * s, y: a.y + (c.y - a.y) * s, z: a.z + (c.z - a.z) * s, hacia: c, volando: true };
    }
  }
  const ultima = colonias[ruta.at(-1)!];
  return { ...ultima, hacia: ultima, volando: false };
};

type ColoniasProps = {
  colonias: Colonia[];
  camara: CamaraGalaxia;
  /** Momento de la ola (0–1). */
  avance: number;
  color?: string;
  opacidad?: number;
  /** Grosor de las rutas y lado de los cuadraditos (px). */
  grosor?: number;
  lado?: number;
};

/** Rutas ámbar entre colonias y un cuadradito en cada estrella colonizada (con un anillo al llegar). */
export const Colonias: FC<ColoniasProps> = ({ colonias, camara, avance, color: c = bb.ambar, opacidad = 1, grosor = 3, lado = 9 }) => {
  const proyectar = proyectorGalaxia(camara);
  const pantalla = colonias.map(proyectar);
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: opacidad }}>
      <g stroke={c} strokeWidth={grosor} strokeLinecap="square" opacity={0.8}>
        {colonias.map((col, i) => {
          if (col.padre < 0 || avance < col.sale) return null;
          const a = pantalla[col.padre];
          const b = pantalla[i];
          if (!a.delante || !b.delante) return null;
          const t = Math.min(1, (avance - col.sale) / Math.max(1e-6, col.llega - col.sale));
          return <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * t} y2={a.y + (b.y - a.y) * t} />;
        })}
      </g>
      <g shapeRendering="crispEdges">
        {colonias.map((col, i) => {
          const p = pantalla[i];
          if (avance < col.llega || !p.delante) return null;
          const edad = (avance - col.llega) / 0.04;
          return (
            <g key={i}>
              {edad < 1 && <circle cx={p.x} cy={p.y} r={lado * (1 + 2.5 * edad)} fill="none" stroke={c} strokeWidth={3} opacity={1 - edad} />}
              <rect x={p.x - lado / 2} y={p.y - lado / 2} width={lado} height={lado} fill={c} stroke={bb.tinta} strokeWidth={2} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// --- Civilizaciones: puntos que se encienden y se apagan sobre los brazos -----------------------------------

export type PuntoCivilizacion = Punto3D & {
  /** Turno (0–1) en que se enciende y en que se apaga. */
  enciende: number;
  apaga: number;
};

/** `cantidad` puntos al azar sobre los brazos (fuera del bulbo), siempre los mismos para la misma semilla. */
export const puntosGalaxia = (cantidad: number, semilla = 'civilizaciones'): PuntoCivilizacion[] => {
  const lista: PuntoCivilizacion[] = [];
  for (let i = 0; lista.length < cantidad; i++) {
    const p = puntoBrazo(`${semilla}-${i}`);
    if (Math.hypot(p.x, p.z) > 0.2) lista.push({ ...p, enciende: random(`${semilla}-e-${i}`), apaga: random(`${semilla}-a-${i}`) });
  }
  return lista;
};

type CivilizacionesProps = {
  puntos: PuntoCivilizacion[];
  camara: CamaraGalaxia;
  /** 0–1: cuántas se han encendido (cada una en su turno, con un anillo). */
  encendidas: number;
  /** 0–1: cuántas se han vuelto a apagar. */
  apagadas?: number;
  color?: string;
  lado?: number;
  opacidad?: number;
};

/** Un cuadradito por civilización: aparece con un anillo cuando `encendidas` pasa su turno y se apaga con `apagadas`. */
export const Civilizaciones: FC<CivilizacionesProps> = ({ puntos, camara, encendidas, apagadas = 0, color: c = bb.ambar, lado = 10, opacidad = 1 }) => {
  const proyectar = proyectorGalaxia(camara);
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: opacidad }} shapeRendering="crispEdges">
      {puntos.map((punto, i) => {
        if (encendidas < punto.enciende || apagadas > punto.apaga) return null;
        const p = proyectar(punto);
        if (!p.delante) return null;
        const edad = (encendidas - punto.enciende) / 0.06;
        return (
          <g key={i}>
            {edad < 1 && <circle cx={p.x} cy={p.y} r={lado * (0.8 + 2.2 * edad)} fill="none" stroke={c} strokeWidth={3} opacity={1 - edad} />}
            <rect x={p.x - lado / 2} y={p.y - lado / 2} width={lado} height={lado} fill={c} stroke={bb.tinta} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
};

// --- Nave de píxeles -----------------------------------------------------------------------------------

/** Dibujo de la nave mirando a la derecha: A casco ámbar, H hueso, C ventana cian. */
const NAVE = ['...HH....', '..AAAA...', '.AAAAAAA.', 'AAAACCAAA', '.AAAAAAA.', '..AAAA...', '...HH....'];
const COLOR_NAVE: Record<string, string> = { A: bb.ambar, H: bb.hueso, C: bb.cian };

/** Nave de píxeles centrada en (x, y), girada `angulo` grados, con fuego verde que titila si `fuego`. */
export const NavePixeles: FC<{ x: number; y: number; angulo: number; lado?: number; fuego?: boolean; frame: number; opacidad?: number }> = ({
  x, y, angulo, lado = 7, fuego = true, frame, opacidad = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo})`} opacity={opacidad} shapeRendering="crispEdges" style={{ filter: `drop-shadow(0 0 3px ${bb.tinta}) drop-shadow(0 0 10px ${bb.ambar}88)` }}>
    {fuego &&
      [0, 1, 2].map((k) => {
        const largo = 1 + ((frame + k) % 3);
        return <rect key={k} x={-4.5 * lado - largo * lado} y={(k - 1) * lado - lado / 2} width={largo * lado} height={lado} fill={k === 1 ? bb.verde : bb.ambar} opacity={k === 1 ? 0.95 : 0.6} />;
      })}
    {NAVE.flatMap((fila, r) =>
      fila.split('').map((k, col) =>
        COLOR_NAVE[k] ? <rect key={`${r}-${col}`} x={(col - 4.5) * lado} y={(r - 3.5) * lado} width={lado + 0.5} height={lado + 0.5} fill={COLOR_NAVE[k]} /> : null,
      ),
    )}
  </g>
);
