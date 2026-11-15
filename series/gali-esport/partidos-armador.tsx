// PARTIDOS del ENTRENADOR en escritorio (desde `partidos-alineacion`): el armador de plantillas COMPLETO, fiel a la app,
// en la página de 1440 (`ANCHO_U`) dentro de `MarcoUsuarios` con `activo="Partidos"`. Código de la app (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport
// - app/(dashboard)/coach/matches/MatchesClient.tsx: los colores de `.matches-scope` (naranja, --brand-hue 30), el tablero
//   de 3 columnas (300px 1fr 270px), el aviso amarillo de la cancha llena, el panel «Alineación» (RightPanel, Titulares y
//   Suplentes con su zona de soltar, la «C» del capitán), las ventanas «Nueva plantilla» y «Nueva Formación» y las
//   tarjetas que se arrastran (DraggingBenchCard / DraggingFieldCard).
// - feature/coach/components/matches/: MatchesPageHeader (nombre con lápiz, «Fecha del partido», Guardado, Restablecer,
//   Guardar plantilla), MatchesTemplatesRow («Plantillas guardadas», «Empezar desde cero»), MatchesToolstrip (fila de
//   escritorio: Categoría, Formación, «+ Nueva», «Fútbol 11» y «En cancha · n/11»), MatchesLeftPanel («Convocados»,
//   leyenda, ✚ ▪ $ XI S «Pend.»), MatchesPitch (cancha, fichas con su rol y la «C») y PlayerTooltip (la ficha).
// - feature/coach/utils/formations.ts: formaciones de fútbol 11 y dónde va cada casilla (`zonasDe`).
// Todo en píxeles de la página; `geoArmador(d)` da dónde queda cada cosa para llevar el puntero y la cámara.
// Datos de ejemplo inventados: Academia Fénix Bogotá, Sub-13 (18 aceptados y 1 invitado) y Sub-15.
import { Trash2 } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { instrument, jetbrains, schibsted } from './letras';
import { ANCHO_U } from './usuarios';

const caja = (x: number, y: number, ancho: number, alto: number) => ({ x, y, ancho, alto });
export type CajaA = ReturnType<typeof caja>;
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);
const mezcla = (t: number, a: number, b: number) => a + (b - a) * t;

// --- Colores de .matches-scope -------------------------------------------------------------------------------------------

export const MC = {
  b50: 'oklch(0.972 0.014 30)',
  b100: 'oklch(0.935 0.045 30)',
  b200: 'oklch(0.88 0.09 30)',
  b400: 'oklch(0.72 0.17 30)',
  b500: 'oklch(0.66 0.18 30)',
  b600: 'oklch(0.60 0.19 30)',
  b700: 'oklch(0.52 0.18 30)',
  bg: '#F6F8FB',
  surface: '#FFFFFF',
  sunken: '#FAFBFC',
  border: '#E5E9F0',
  strong: '#D9DFE8',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  redBg: '#FEF2F2',
  redBorder: '#FECACA',
  redText: '#B91C1C',
  amberBg: '#FEF3C7',
  amberBorder: '#FDE68A',
  amberText: '#92400E',
  slateBg: '#F1F5F9',
  slateBorder: '#E2E8F0',
};

// --- Roles y posiciones del fútbol (app/lib/sports.ts) ------------------------------------------------------------------

export type RolA = 'GK' | 'DEF' | 'MID' | 'FWD';
export const ROLES_A: Record<RolA, { badge: string; tag: string; one: string; many: string; color: string }> = {
  GK: { badge: 'GK', tag: 'POR', one: 'Portero', many: 'Porteros', color: '#6366F1' },
  DEF: { badge: 'DEF', tag: 'DEF', one: 'Defensa', many: 'Defensas', color: '#0EA5E9' },
  MID: { badge: 'MID', tag: 'MED', one: 'Mediocampista', many: 'Mediocampistas', color: '#10B981' },
  FWD: { badge: 'FWD', tag: 'DEL', one: 'Delantero', many: 'Delanteros', color: '#F97316' },
};
const ORDEN_ROLES: RolA[] = ['GK', 'DEF', 'MID', 'FWD'];

// --- Jugadores de ejemplo ------------------------------------------------------------------------------------------------

export type CatA = 'sub10' | 'sub15' | 'sub13';
export const CATEGORIAS_A: { id: CatA; nombre: string }[] = [
  { id: 'sub10', nombre: 'Sub-10' },
  { id: 'sub15', nombre: 'Sub-15' },
  { id: 'sub13', nombre: 'Sub-13' },
];
export const nombreCat = (c: CatA | null) => CATEGORIAS_A.find((x) => x.id === c)?.nombre ?? null;

export type JugadorA = {
  id: string;
  nombre: string;
  num: number | null;
  /** La posición exacta (findPosition(...).label). */
  pos: string;
  rol: RolA;
  cat: CatA;
  aceptado: boolean;
  estado?: 'injured' | 'suspended';
  lesion?: { desc: string; desde: string; hasta: string };
  pagado?: boolean;
};

const j = (id: string, nombre: string, num: number | null, pos: string, rol: RolA, cat: CatA, extra: Partial<JugadorA> = {}): JugadorA => ({ id, nombre, num, pos, rol, cat, aceptado: true, pagado: true, ...extra });

/** Sub-13 de la Academia Fénix: 18 aceptados (Samuel lesionado, Andrés sancionado, Daniela debe la mensualidad) y 1 invitado. */
export const SUB13_A: JugadorA[] = [
  j('santiago', 'Santiago Pérez', 1, 'Portero', 'GK', 'sub13'),
  j('tomas', 'Tomás Gil', 2, 'Lateral derecho', 'DEF', 'sub13'),
  j('martina', 'Martina López', 3, 'Lateral izquierdo', 'DEF', 'sub13'),
  j('isabella', 'Isabella Torres', 4, 'Defensa central', 'DEF', 'sub13'),
  j('daniela', 'Daniela Mora', 5, 'Defensa central', 'DEF', 'sub13', { pagado: false }),
  j('emiliano', 'Emiliano Vargas', 6, 'Mediocentro defensivo', 'MID', 'sub13'),
  j('samuel', 'Samuel Rojas', 7, 'Extremo derecho', 'FWD', 'sub13', { estado: 'injured', lesion: { desc: 'Esguince de tobillo', desde: '3 nov', hasta: '24 nov' } }),
  j('mateo', 'Mateo Castro', 8, 'Mediocentro', 'MID', 'sub13'),
  j('jeronimo', 'Jerónimo Reyes', 9, 'Delantero centro', 'FWD', 'sub13'),
  j('valentina', 'Valentina Ruiz', 10, 'Mediocentro ofensivo', 'MID', 'sub13'),
  j('luciana', 'Luciana Medina', 11, 'Extremo izquierdo', 'FWD', 'sub13'),
  j('simon', 'Simón Arango', 12, 'Portero', 'GK', 'sub13'),
  j('felipe', 'Felipe Cárdenas', 13, 'Defensa central', 'DEF', 'sub13'),
  j('juandavid', 'Juan David Herrera', 14, 'Mediocentro', 'MID', 'sub13'),
  j('andres', 'Andrés Morales', 15, 'Mediocentro ofensivo', 'MID', 'sub13', { estado: 'suspended' }),
  j('david', 'David Quintero', 16, 'Delantero centro', 'FWD', 'sub13'),
  j('laura', 'Laura Beltrán', 17, 'Extremo derecho', 'FWD', 'sub13'),
  j('julian', 'Julián Pardo', 18, 'Lateral derecho', 'DEF', 'sub13'),
  j('gabriela', 'Gabriela Núñez', null, 'Delantero', 'FWD', 'sub13', { aceptado: false, pagado: undefined }),
];

/** Sub-15 (la plantilla «Amistoso vs Leones», 4-4-2). */
export const SUB15_A: JugadorA[] = [
  j('gabriel', 'Gabriel Ortiz', 1, 'Portero', 'GK', 'sub15'),
  j('nicolas', 'Nicolás Gómez', 2, 'Lateral derecho', 'DEF', 'sub15'),
  j('sebastian', 'Sebastián Acosta', 3, 'Lateral izquierdo', 'DEF', 'sub15'),
  j('martin', 'Martín Silva', 4, 'Defensa central', 'DEF', 'sub15'),
  j('alejandro', 'Alejandro Ríos', 5, 'Defensa central', 'DEF', 'sub15'),
  j('joaquin', 'Joaquín Peña', 6, 'Mediocentro defensivo', 'MID', 'sub15'),
  j('manuel', 'Manuel Duarte', 7, 'Mediocentro', 'MID', 'sub15'),
  j('diego', 'Diego Salazar', 8, 'Mediocentro', 'MID', 'sub15'),
  j('pablo', 'Pablo Rincón', 9, 'Delantero centro', 'FWD', 'sub15'),
  j('lucas', 'Lucas Herrera', 10, 'Mediocentro ofensivo', 'MID', 'sub15'),
  j('esteban', 'Esteban Mejía', 11, 'Extremo izquierdo', 'FWD', 'sub15'),
  j('miguel', 'Miguel Cano', 12, 'Portero', 'GK', 'sub15'),
  j('santiagov', 'Santiago Vélez', 14, 'Mediocentro', 'MID', 'sub15'),
  j('oscar', 'Óscar Rueda', 16, 'Delantero centro', 'FWD', 'sub15'),
];
export const JUGADORES_A: JugadorA[] = [...SUB13_A, ...SUB15_A];
export const jugadorA = (id: string) => JUGADORES_A.find((x) => x.id === id)!;

/** Último apellido en mayúsculas (getLabel de MatchesPitch). */
const etiquetaCancha = (n: string) => n.trim().split(/\s+/).at(-1)!.toUpperCase();

// --- Formaciones (formations.ts) ------------------------------------------------------------------------------------------

export const FORMACIONES_11 = ['4-3-3', '4-4-2', '3-4-3', '4-2-3-1', '3-5-2'];
export type ZonaA = { id: string; rol: RolA; x: number; y: number };
const MITAD: Record<number, number> = { 2: 13, 3: 25, 4: 37, 5: 42 };
const repartir = (n: number) => (n <= 1 ? [50] : Array.from({ length: n }, (_, i) => 50 - (MITAD[n] ?? 44) + (2 * (MITAD[n] ?? 44) * i) / (n - 1)));
const lineas = (n: number, atras: number, adelante: number) => (n === 1 ? [(atras + adelante) / 2] : Array.from({ length: n }, (_, k) => atras - ((atras - adelante) * k) / (n - 1)));
/** Las casillas de una formación de fútbol (portero abajo, delanteros arriba), en % de la cancha. */
export const zonasDe = (formacion: string): ZonaA[] => {
  const caps = formacion.split('-').map(Number);
  const ys = lineas(caps.length, 80, 18);
  const zonas: ZonaA[] = [{ id: 'zona-0', rol: 'GK', x: 50, y: 93 }];
  let i = 1;
  caps.forEach((n, k) => {
    for (const x of repartir(n)) zonas.push({ id: `zona-${i++}`, rol: k === 0 ? 'DEF' : k === caps.length - 1 ? 'FWD' : 'MID', x, y: ys[k] });
  });
  return zonas;
};
/** Mezcla dos formaciones con el mismo número de casillas (las casillas se mueven a su nuevo sitio). */
export const mezclarZonas = (t: number, a: ZonaA[], b: ZonaA[]): ZonaA[] => b.map((z, i) => ({ ...z, x: mezcla(t, a[i]?.x ?? z.x, z.x), y: mezcla(t, a[i]?.y ?? z.y, z.y) }));

// --- Plantillas guardadas ---------------------------------------------------------------------------------------------------

export type PlantillaA = { id: string; nombre: string; formacion: string; enCancha: number; cat: CatA; color: string; cuando: string };
export const PLANTILLA_AMISTOSO: PlantillaA = { id: 'amistoso', nombre: 'Amistoso vs Leones · Sub-15', formacion: '4-4-2', enCancha: 11, cat: 'sub15', color: '#8B5CF6', cuando: 'Hace 3 días' };
export const PLANTILLA_FESTIVAL: PlantillaA = { id: 'festival', nombre: 'Festival Sub-10', formacion: '3-2-1', enCancha: 7, cat: 'sub10', color: '#10B981', cuando: '8 de nov' };
export const PLANTILLA_FINAL: PlantillaA = { id: 'final', nombre: 'Final Copa Fénix · Sub-13', formacion: '4-3-3', enCancha: 11, cat: 'sub13', color: '#0EA5E9', cuando: 'Hoy · 10:42 a. m.' };
/** La alineación del amistoso de la Sub-15 (4-4-2): casilla → jugador, suplentes y capitán. */
export const ALINEACION_AMISTOSO = {
  alineacion: { 'zona-0': 'gabriel', 'zona-1': 'nicolas', 'zona-2': 'martin', 'zona-3': 'alejandro', 'zona-4': 'sebastian', 'zona-5': 'manuel', 'zona-6': 'joaquin', 'zona-7': 'diego', 'zona-8': 'lucas', 'zona-9': 'pablo', 'zona-10': 'esteban' } as Record<string, string | null>,
  suplentes: ['miguel', 'santiagov', 'oscar'],
  capitan: 'diego',
  fecha: '15/11/2026, 04:00 p. m.',
  fechaCancha: 'dom 15 nov 2026 · 4:00 pm',
};

// =============================================================================================================
// Estado y medidas
// =============================================================================================================

export type EstadoArmador = {
  plantillas: PlantillaA[];
  activa: string | null;
  titulo: string;
  /** Renombrando la plantilla: lo escrito (y si el texto está seleccionado, recién abierto). */
  editando?: { texto: string; seleccion?: boolean } | null;
  /** Lo que muestra el campo de fecha ('' = «dd/mm/aaaa, --:-- --»); `fechaCancha` el texto sobre la cancha. */
  fecha: string;
  fechaCancha?: string;
  fechaFoco?: boolean;
  guardando?: boolean;
  /** 0 → 1: la etiqueta verde «Guardado». */
  guardado?: number;
  categoria: CatA | null;
  formacion: string;
  formaciones: string[];
  /** Las casillas ya ubicadas (se pueden pasar mezcladas para que se muevan). */
  zonas: ZonaA[];
  alineacion: Record<string, string | null>;
  suplentes: string[];
  capitan: string | null;
  /** 0 → 1: el aviso amarillo de la cancha llena (empuja el tablero). */
  aviso?: number;
  /** El jugador que se está arrastrando (su fila queda tenue) y dónde está encima. */
  arrastrando?: string | null;
  sobre?: string | null;
  /** Posición de cada fila de «Convocados» y de «Alineación» (índice; con decimales mientras se mueven). */
  filaConv?: Record<string, number>;
  filaTit?: Record<string, number>;
  filaSup?: Record<string, number>;
  /** 0 → 1 al aparecer una ficha en la cancha. */
  aparece?: Record<string, number>;
  hover?: { nueva?: number; titulo?: number; guardar?: number; cat?: CatA | null; form?: string | null; masNueva?: number; c?: string | null; tarjeta?: string | null; aviso?: number };
  apretar?: { nueva?: number; guardar?: number; cat?: number; form?: number; masNueva?: number; c?: number; tarjeta?: number };
  resalte?: Partial<Record<'titulo' | 'fecha' | 'asterisco' | 'categorias' | 'formaciones' | 'masNueva' | 'contador' | 'leyenda' | 'convocados' | 'titulares' | 'suplentes' | 'aviso' | 'guardar' | 'guardado' | 'tarjeta' | 'cancha' | 'chipCat', number>>;
  /** Realce de filas de «Convocados» por jugador. */
  resalteFila?: Record<string, number>;
  /** Realce de la «C» del capitán (en la Alineación y en la cancha). */
  resalteC?: number;
};

const SIDE = 176;
export const X0_A = SIDE + 24;
export const AW_A = ANCHO_U - SIDE - 48;
const IZQ = 300;
const DER = 270;
const CEN = AW_A - IZQ - DER - 28;
const FILA_C = 52;
const PASO_C = 58;
const FILA_D = 47;
const PASO_D = 52;
const CABEZA_PANEL = 44;
const LEYENDA = 36;
const TARJ_W = (AW_A - 4 * 10) / 5;
const CANCHA = { w: 420, h: 640 };

const ANCHO_CAT = 59;
const anchoForm = (f: string) => (f.length > 5 ? 60 : 50);

/** Dónde queda todo (cambia si se está renombrando o si está el aviso de la cancha llena). */
export const geoArmador = (d: Pick<EstadoArmador, 'editando' | 'aviso' | 'plantillas' | 'formaciones' | 'guardado'>) => {
  const altoCabeza = d.editando ? 83 : 68;
  const yCabeza = 76;
  const yPlant = yCabeza + altoCabeza + 16;
  const yTarjetas = yPlant + 25;
  const yBarra = yTarjetas + 66 + 14;
  const yAviso = yBarra + 52 + 14;
  const yTablero = yAviso + 52 * (d.aviso ?? 0);
  const yc = yBarra + 26;
  const derecha = X0_A + AW_A - 17;
  const guardar = caja(derecha - 144, yCabeza + altoCabeza / 2 - 18, 144, 36);
  const restablecer = caja(guardar.x - 12 - 119, guardar.y, 119, 36);
  const correr = (d.guardado ?? 0) > 0 ? 106 : 0;
  const fecha = caja(restablecer.x - 12 - 350 - correr, guardar.y, 350, 36);
  let fx = 757 + 3;
  const formaciones = d.formaciones.map((f) => {
    const r = caja(fx, yc - 12, anchoForm(f), 24);
    fx += anchoForm(f) + 2;
    return r;
  });
  const xPitch = X0_A + IZQ + 14 + 1 + 14 + (CEN - 30 - CANCHA.w) / 2;
  const yPitch = yTablero + 1 + 14 + 22 + 10;
  const xDer = X0_A + IZQ + 14 + CEN + 14;
  return {
    altoCabeza,
    titulo: caja(X0_A + 17 + 38 + 12, yCabeza + altoCabeza / 2 - 14, 300, 28),
    lapiz: caja(X0_A + 17 + 50 + 4, yCabeza + altoCabeza / 2 - 7, 14, 14),
    fecha,
    fechaCampo: caja(fecha.x + 132, fecha.y, 200, 36),
    guardar,
    restablecer,
    guardado: caja(fecha.x + 350 + 12, guardar.y + 3, 94, 30),
    tarjeta: (i: number) => caja(X0_A + i * (TARJ_W + 10), yTarjetas, TARJ_W, 66),
    nueva: caja(X0_A + d.plantillas.length * (TARJ_W + 10), yTarjetas, TARJ_W, 66),
    barra: caja(X0_A, yBarra, AW_A, 52),
    categorias: caja(297, yc - 15, 357, 30),
    cat: (i: number) => caja(297 + 3 + i * (ANCHO_CAT + 2), yc - 12, ANCHO_CAT, 24),
    formacionesCaja: caja(757, yc - 15, 357, 30),
    formacion: (f: string) => formaciones[d.formaciones.indexOf(f)] ?? formaciones[0],
    masNueva: caja(1124, yc - 12, 65, 24),
    contador: caja(1199, yc - 13, 202, 26),
    aviso: caja(X0_A, yAviso, AW_A, 40),
    tablero: yTablero,
    izq: caja(X0_A, yTablero, IZQ, 0),
    leyenda: caja(X0_A + 1, yTablero + 1 + CABEZA_PANEL, IZQ - 2, LEYENDA),
    /** Fila `i` de «Convocados» (puede ser decimal). */
    filaConv: (i: number) => caja(X0_A + 11, yTablero + 1 + CABEZA_PANEL + LEYENDA + 10 + i * PASO_C, IZQ - 22, FILA_C),
    cancha: caja(xPitch, yPitch, CANCHA.w, CANCHA.h),
    zona: (z: ZonaA) => ({ x: xPitch + (z.x / 100) * CANCHA.w, y: yPitch + (z.y / 100) * CANCHA.h }),
    der: caja(xDer, yTablero, DER, 0),
    xDer,
  };
};
export type GeoArmador = ReturnType<typeof geoArmador>;

/** El panel «Alineación»: dónde va cada fila de Titulares y Suplentes, y las dos zonas para soltar. */
export const geoAlineacion = (g: GeoArmador, nTit: number, nSup: number) => {
  const x = g.xDer + 1 + 10;
  const w = DER - 2 - 20;
  const yTitHead = g.tablero + 1 + 41.5 + 10;
  const yTit = yTitHead + 25;
  const altoTit = Math.max(44, nTit * PASO_D - 5);
  const ySupHead = yTit + altoTit + 5 + 6;
  const ySup = ySupHead + 25;
  const altoSup = Math.max(44, nSup * PASO_D - 5);
  return {
    titulares: caja(x, yTitHead, w, 25 + altoTit),
    suplentes: caja(x, ySupHead, w, 25 + altoSup),
    filaTit: (i: number) => caja(x, yTit + i * PASO_D, w, FILA_D),
    filaSup: (i: number) => caja(x, ySup + i * PASO_D, w, FILA_D),
    /** La «C» de una fila (centro). */
    c: (fila: CajaA) => ({ x: fila.x + fila.ancho - 10 - 11, y: fila.y + FILA_D / 2 }),
  };
};

// --- Quién está dónde ----------------------------------------------------------------------------------------------------

export const enCancha = (d: Pick<EstadoArmador, 'alineacion'>) => new Set(Object.values(d.alineacion).filter(Boolean) as string[]);
const deLaCategoria = (cat: CatA | null) => JUGADORES_A.filter((p) => (cat ? p.cat === cat : true));
/** El orden de «Convocados»: banca → en cancha → suplentes → invitados (MatchesLeftPanel). */
export const ordenConvocados = (d: Pick<EstadoArmador, 'alineacion' | 'suplentes' | 'categoria'>) => {
  const lista = deLaCategoria(d.categoria);
  const asignados = enCancha(d);
  const acept = lista.filter((p) => p.aceptado);
  const banca = acept.filter((p) => !asignados.has(p.id) && !d.suplentes.includes(p.id));
  const campo = acept.filter((p) => asignados.has(p.id));
  const sup = acept.filter((p) => d.suplentes.includes(p.id));
  const pend = lista.filter((p) => !p.aceptado);
  return [...banca, ...campo, ...sup, ...pend].map((p) => p.id);
};
/** Titulares (en el orden de la lista de jugadores) y suplentes de la categoría. */
export const titularesDe = (d: Pick<EstadoArmador, 'alineacion' | 'categoria'>) => {
  const a = enCancha(d);
  return deLaCategoria(d.categoria).filter((p) => a.has(p.id)).map((p) => p.id);
};
export const suplentesDe = (d: Pick<EstadoArmador, 'suplentes' | 'categoria'>) => deLaCategoria(d.categoria).filter((p) => d.suplentes.includes(p.id)).map((p) => p.id);

// =============================================================================================================
// Piezas
// =============================================================================================================

const Svg: FC<{ tam: number; ancho?: number; color?: string; style?: CSSProperties; children: ReactNode }> = ({ tam, ancho = 2, color = 'currentColor', style, children }) => (
  <svg width={tam} height={tam} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);
const Caret: FC<{ alto?: number; color?: string }> = ({ alto = 18, color = MC.text }) => <span style={{ display: 'inline-block', width: 1.5, height: alto, background: color, marginLeft: 1, verticalAlign: 'middle' }} />;

// --- Encabezado (MatchesPageHeader) --------------------------------------------------------------------------------------

const Encabezado: FC<{ d: EstadoArmador; g: GeoArmador }> = ({ d, g }) => {
  const r = d.resalte ?? {};
  const nuevo = d.titulo === 'Nueva plantilla';
  const hg = d.hover?.guardar ?? 0;
  return (
    <div style={{ position: 'absolute', left: X0_A, top: 76, width: AW_A, height: g.altoCabeza, boxSizing: 'border-box', padding: '0 16px', borderRadius: 16, border: `1px solid ${MC.border}`, background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: MC.b50, color: MC.b700, display: 'grid', placeItems: 'center', border: `1px solid ${MC.b100}`, flexShrink: 0, boxSizing: 'border-box' }}>
          <Svg tam={18}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </Svg>
        </div>
        {d.editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ width: 260, height: 36, boxSizing: 'border-box', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: MC.text, background: MC.sunken, border: `1.5px solid ${MC.b600}`, borderRadius: 8, padding: '0 10px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: d.editando.texto.length > 21 ? 'flex-end' : 'flex-start', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {d.editando.texto ? (
                <span style={{ background: d.editando.seleccion ? 'rgba(59,130,246,0.28)' : undefined, flexShrink: 0 }}>{d.editando.texto}</span>
              ) : (
                <span style={{ color: MC.subtle, fontWeight: 700 }}>Nombre de la plantilla</span>
              )}
              {!d.editando.seleccion && <Caret alto={20} />}
            </div>
            <span style={{ fontSize: 11, color: MC.muted, paddingLeft: 2, lineHeight: '16px' }}>Enter para guardar · Esc para cancelar</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '2px 4px', borderRadius: 6, background: (d.hover?.titulo ?? 0) > 0 ? `rgba(250,251,252,${d.hover?.titulo})` : 'transparent', boxShadow: anillo(r.titulo) }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1, color: nuevo ? MC.muted : MC.text, whiteSpace: 'nowrap', borderBottom: `1.5px dashed ${MC.strong}`, fontFamily: instrument }}>{d.titulo}</h1>
            <Svg tam={14} color={MC.muted} style={{ flexShrink: 0 }}>
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </Svg>
          </div>
        )}
      </div>
      {/* Fecha del partido */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 350, height: 36, padding: '0 12px', boxSizing: 'border-box', border: `1px solid ${d.fechaFoco ? MC.b400 : MC.border}`, borderRadius: 8, background: '#fff', fontSize: 12, flexShrink: 0, boxShadow: anillo(r.fecha) }}>
        <span style={{ color: MC.muted, fontWeight: 500, whiteSpace: 'nowrap' }}>
          Fecha del partido{' '}
          <span style={{ color: MC.redText, display: 'inline-block', borderRadius: 4, padding: '0 2px', background: (r.asterisco ?? 0) > 0 ? `rgba(254,202,202,${r.asterisco})` : undefined, transform: `scale(${1 + 0.5 * (r.asterisco ?? 0)})` }}>*</span>
        </span>
        <span style={{ flex: 1, fontFamily: jetbrains, fontSize: 12, color: MC.text, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
          {d.fecha ? (
            <>
              <span>{d.fecha}</span>
              <span style={{ color: MC.text, opacity: 0.35 }}>{'dd/mm/aaaa, --:-- --'.slice(d.fecha.length)}</span>
            </>
          ) : (
            <span>dd/mm/aaaa, --:-- --</span>
          )}
        </span>
        <Svg tam={14} color={MC.text}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      </div>
      {(d.guardado ?? 0) > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #A7F3D0', background: '#ECFDF5', fontSize: 12, fontWeight: 500, color: '#047857', flexShrink: 0, opacity: d.guardado, transform: `scale(${0.9 + 0.1 * (d.guardado ?? 0)})`, boxShadow: anillo(r.guardado, '16,185,129') }}>
          <Svg tam={13} ancho={2.5}>
            <path d="M5 13l4 4L19 7" />
          </Svg>
          Guardado
        </div>
      )}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, width: 119, padding: '0 12px', boxSizing: 'border-box', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${MC.border}`, background: '#fff', color: MC.text, flexShrink: 0 }}>
        <Svg tam={13}>
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </Svg>
        Restablecer
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, width: 144, padding: '0 12px', boxSizing: 'border-box', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${hg > 0.5 ? MC.b700 : MC.b600}`, background: hg > 0.5 ? MC.b700 : MC.b600, color: '#fff', flexShrink: 0, opacity: d.guardando ? 0.65 : 1, transform: hundir(d.apretar?.guardar), boxShadow: anillo(r.guardar) }}>
        {d.guardando ? (
          <>
            <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', boxSizing: 'border-box' }} />
            Guardando…
          </>
        ) : (
          <>
            <Svg tam={13}>
              <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </Svg>
            Guardar plantilla
          </>
        )}
      </div>
    </div>
  );
};

// --- Plantillas guardadas (MatchesTemplatesRow) ---------------------------------------------------------------------------

const FilaPlantillas: FC<{ d: EstadoArmador; g: GeoArmador }> = ({ d, g }) => {
  const y = 76 + g.altoCabeza + 16;
  const hn = d.hover?.nueva ?? 0;
  const nueva = g.nueva;
  return (
    <>
      <div style={{ position: 'absolute', left: X0_A, top: y, width: AW_A, height: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: MC.subtle }}>Plantillas guardadas</span>
        {d.plantillas.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, color: MC.muted, fontFamily: jetbrains }}>
            {d.plantillas.length} {d.plantillas.length === 1 ? 'guardada' : 'guardadas'}
          </span>
        )}
      </div>
      {d.plantillas.map((t, i) => {
        const r = g.tarjeta(i);
        const on = t.id === d.activa;
        const h = d.hover?.tarjeta === t.id;
        return (
          <div key={t.id} style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, boxSizing: 'border-box', background: on ? MC.b50 : '#fff', border: `1px solid ${on ? MC.b600 : h ? MC.b400 : MC.border}`, borderRadius: 12, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: on ? `0 0 0 3px oklch(0.60 0.19 30 / 0.12)${t.id === 'final' && (d.resalte?.tarjeta ?? 0) > 0 ? `, ${anillo(d.resalte?.tarjeta)}` : ''}` : 'none', transform: h && !on ? 'translateY(-1px)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: MC.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{t.nombre}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {t.enCancha !== 11 && <span style={{ fontFamily: jetbrains, fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: on ? '#fff' : MC.slateBg, color: on ? MC.b700 : MC.subtle }}>F{t.enCancha}</span>}
                <span style={{ fontFamily: jetbrains, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: on ? '#fff' : MC.slateBg, color: on ? MC.b700 : MC.muted }}>{t.formacion}</span>
                <span style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', color: MC.subtle }}>
                  <Trash2 size={11} />
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MC.muted }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
                <span style={{ fontWeight: 500 }}>{nombreCat(t.cat)}</span>
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: MC.subtle, whiteSpace: 'nowrap' }}>{t.cuando}</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: nueva.x, top: nueva.y, width: nueva.ancho, height: 66, boxSizing: 'border-box', border: `1.5px dashed ${hn > 0.5 ? MC.b500 : MC.strong}`, background: hn > 0 ? MC.b50 : 'transparent', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: hn > 0.5 ? MC.b700 : MC.muted, fontWeight: 500, fontSize: 13, transform: hundir(d.apretar?.nueva) }}>
        <Svg tam={15}>
          <path d="M12 4v16m8-8H4" />
        </Svg>
        Empezar desde cero
      </div>
    </>
  );
};

// --- Barra (MatchesToolstrip, fila de escritorio) -------------------------------------------------------------------------

const ETIQUETA: CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: MC.subtle, whiteSpace: 'nowrap', flexShrink: 0, paddingRight: 8, borderRight: `1px solid ${MC.border}`, marginRight: 2, lineHeight: 1, width: 72, boxSizing: 'border-box' };
const Seg: FC<{ on: boolean; ancho: number; hover?: boolean; apretar?: number; children: ReactNode }> = ({ on, ancho, hover, apretar = 0, children }) => (
  <span style={{ width: ancho, height: 24, boxSizing: 'border-box', borderRadius: 6, fontSize: 12, fontWeight: on ? 600 : 500, color: on || hover ? MC.text : MC.muted, background: on ? '#fff' : hover ? 'rgba(255,255,255,0.55)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: on ? '0 1px 2px rgba(15,23,42,0.04)' : 'none', transform: hundir(apretar) }}>{children}</span>
);

const Barra: FC<{ d: EstadoArmador; g: GeoArmador; asignados: number }> = ({ d, g, asignados }) => {
  const r = d.resalte ?? {};
  const lleno = asignados === d.zonas.length;
  return (
    <div style={{ position: 'absolute', left: g.barra.x, top: g.barra.y, width: AW_A, height: 52, boxSizing: 'border-box', background: '#fff', border: `1px solid ${MC.border}`, borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={ETIQUETA}>Categoría</span>
      <div style={{ width: 357, height: 30, display: 'inline-flex', background: MC.slateBg, borderRadius: 8, padding: 3, gap: 2, boxSizing: 'border-box', flexShrink: 0, boxShadow: anillo(r.categorias) }}>
        {CATEGORIAS_A.map((c) => (
          <Seg key={c.id} on={d.categoria === c.id} ancho={ANCHO_CAT} hover={d.hover?.cat === c.id} apretar={d.hover?.cat === c.id ? d.apretar?.cat : 0}>
            {c.nombre}
          </Seg>
        ))}
      </div>
      <div style={{ width: 1, height: 20, background: MC.border, flexShrink: 0 }} />
      <span style={ETIQUETA}>Formación</span>
      <div style={{ width: 357, height: 30, display: 'inline-flex', background: MC.slateBg, borderRadius: 8, padding: 3, gap: 2, boxSizing: 'border-box', flexShrink: 0, overflow: 'hidden', boxShadow: anillo(r.formaciones) }}>
        {d.formaciones.map((f) => (
          <Seg key={f} on={d.formacion === f} ancho={anchoForm(f)} hover={d.hover?.form === f} apretar={d.hover?.form === f ? d.apretar?.form : 0}>
            {f}
          </Seg>
        ))}
      </div>
      <span style={{ width: 65, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 12, fontWeight: 500, color: (d.hover?.masNueva ?? 0) > 0.5 ? MC.b600 : MC.muted, whiteSpace: 'nowrap', flexShrink: 0, transform: hundir(d.apretar?.masNueva), boxShadow: anillo(r.masNueva) }}>+ Nueva</span>
      <div style={{ flexShrink: 0, paddingLeft: 10, borderLeft: `1px solid ${MC.border}`, height: 26, display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: MC.muted, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, boxShadow: anillo(r.contador) }}>
          <span title="Jugadores en cancha (portero incluido)." style={{ fontFamily: jetbrains, fontSize: 11, fontWeight: 700, color: MC.muted, background: MC.slateBg, border: `1px solid ${MC.slateBorder}`, borderRadius: 999, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, lineHeight: 1 }}>
            Fútbol 11
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ opacity: 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <span>
            En cancha ·{' '}
            <span style={{ fontFamily: jetbrains, fontWeight: 700, color: lleno ? '#047857' : MC.b600 }}>
              {asignados}/{d.zonas.length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Convocados (MatchesLeftPanel) ---------------------------------------------------------------------------------------

const Bandera: FC<{ bg: string; borde: string; color: string; children: ReactNode; size?: number; mono?: boolean }> = ({ bg, borde, color, children, size = 11, mono }) => (
  <div style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', background: bg, border: `1px solid ${borde}`, color, fontSize: size, fontWeight: 700, fontFamily: mono ? jetbrains : undefined, boxSizing: 'border-box' }}>{children}</div>
);

/** La fila de un jugador en «Convocados»; `estado`: banca, en cancha (XI), suplente (S) o invitado (Pend.). */
export const FilaConvocado: FC<{ p: JugadorA; estado: 'bench' | 'field' | 'supl' | 'pending'; tenue?: boolean; hover?: boolean; resalte?: number; style?: CSSProperties }> = ({ p, estado, tenue, hover, resalte = 0, style }) => {
  const les = p.estado === 'injured';
  const san = p.estado === 'suspended';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '0 10px', height: FILA_C, boxSizing: 'border-box', borderRadius: 8, background: les ? '#FEF2F2' : san ? '#FEF3C7' : MC.sunken, border: `1px solid ${les ? '#FECACA' : san ? '#FDE68A' : hover ? MC.strong : MC.border}`, boxShadow: hover ? '0 1px 4px rgba(15,23,42,0.07)' : resalte > 0 ? anillo(resalte) : undefined, opacity: tenue ? 0.2 : estado === 'pending' ? 0.45 : 1, ...style }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: les ? '#FEF2F2' : san ? '#FEF3C7' : '#fff', border: `1px solid ${les ? '#FECACA' : san ? '#FDE68A' : MC.border}`, display: 'grid', placeItems: 'center', fontFamily: jetbrains, fontWeight: 700, fontSize: 11, color: les ? '#B91C1C' : san ? '#92400E' : MC.text, boxSizing: 'border-box' }}>{p.num ?? '–'}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: les ? '#B91C1C' : MC.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{p.nombre}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: ROLES_A[p.rol].color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: MC.muted, lineHeight: 1.5 }}>{p.pos}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {les && (
          <Bandera bg="#FEF2F2" borde="#FECACA" color="#B91C1C">
            ✚
          </Bandera>
        )}
        {san && (
          <Bandera bg="#FEF3C7" borde="#FDE68A" color="#92400E">
            ▪
          </Bandera>
        )}
        {estado === 'field' && (
          <Bandera bg={MC.b100} borde={MC.b200} color={MC.b700} size={10} mono>
            XI
          </Bandera>
        )}
        {estado === 'supl' && (
          <Bandera bg="#F1F5F9" borde="#E2E8F0" color={MC.muted} size={10} mono>
            S
          </Bandera>
        )}
        {p.pagado === false && p.aceptado && !les && !san && (
          <Bandera bg="#FEF2F2" borde="#FECACA" color="#B91C1C" size={10}>
            $
          </Bandera>
        )}
        {estado === 'pending' && <span style={{ fontSize: 10, color: MC.subtle }}>Pend.</span>}
      </div>
    </div>
  );
};

const CabezaPanel: FC<{ titulo: string; cuenta: string; icono: ReactNode; mono13?: boolean }> = ({ titulo, cuenta, icono, mono13 }) => (
  <div style={{ height: CABEZA_PANEL, padding: '0 14px', borderBottom: `1px solid ${MC.border}`, background: MC.sunken, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {icono}
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: MC.subtle }}>{titulo}</span>
    </div>
    <span style={{ fontFamily: jetbrains, fontSize: mono13 ? 13 : 11, fontWeight: 600, color: MC.muted }}>{cuenta}</span>
  </div>
);

const PanelConvocados: FC<{ d: EstadoArmador; g: GeoArmador; alto: number }> = ({ d, g, alto }) => {
  const orden = ordenConvocados(d);
  const asignados = enCancha(d);
  const r = d.resalte ?? {};
  return (
    <div style={{ position: 'absolute', left: X0_A, top: g.tablero, width: IZQ, height: alto, boxSizing: 'border-box', background: '#fff', border: `1px solid ${MC.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: anillo(r.convocados) }}>
      <CabezaPanel
        titulo="Convocados"
        cuenta={String(orden.length)}
        mono13
        icono={
          <Svg tam={14} ancho={1.8} color={MC.subtle}>
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </Svg>
        }
      />
      <div style={{ height: LEYENDA, padding: '0 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 14, background: (r.leyenda ?? 0) > 0 ? `rgba(254,243,199,${0.8 * (r.leyenda ?? 0)})` : '#fff', boxSizing: 'border-box' }}>
        {ORDEN_ROLES.map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: ROLES_A[k].color }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: MC.muted }}>{ROLES_A[k].tag}</span>
          </div>
        ))}
      </div>
      {orden.map((id, i) => {
        const p = jugadorA(id);
        const y = (d.filaConv?.[id] ?? i) * PASO_C;
        const estado = !p.aceptado ? 'pending' : asignados.has(id) ? 'field' : d.suplentes.includes(id) ? 'supl' : 'bench';
        return (
          <FilaConvocado key={id} p={p} estado={estado} tenue={d.arrastrando === id && estado !== 'field'} resalte={d.resalteFila?.[id]} style={{ position: 'absolute', left: 10, top: CABEZA_PANEL + LEYENDA + 10 + y, width: IZQ - 22 }} />
        );
      })}
    </div>
  );
};

// --- La cancha (MatchesPitch) -------------------------------------------------------------------------------------------

/** La ficha de un jugador en la cancha. */
export const FichaCancha: FC<{ p: JugadorA; rol: RolA; capitan?: boolean; tenue?: boolean; escala?: number; resalteC?: number }> = ({ p, rol, capitan, tenue, escala = 1, resalteC = 0 }) => {
  const color = ROLES_A[rol].color;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: tenue ? 0.2 : 1, transform: `scale(${escala})` }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color})`, border: '2.5px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 14px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
          <span style={{ fontFamily: jetbrains, fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1 }}>{p.num ?? '?'}</span>
        </div>
        <div style={{ position: 'absolute', top: -4, left: -4, width: 18, height: 18, borderRadius: 4, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
          <span style={{ color: '#fff', fontSize: 7, fontWeight: 800, letterSpacing: '0.02em' }}>{ROLES_A[rol].badge}</span>
        </div>
        {capitan && (
          <div style={{ position: 'absolute', bottom: -4, left: -4, width: 18, height: 18, borderRadius: '50%', background: '#F59E0B', border: '2px solid rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 4px rgba(0,0,0,0.3)${resalteC > 0 ? `, 0 0 0 ${4 * resalteC}px rgba(253,224,71,${0.9 * resalteC})` : ''}`, boxSizing: 'border-box' }}>
            <span style={{ color: '#fff', fontSize: 8, fontWeight: 900 }}>C</span>
          </div>
        )}
      </div>
      <div style={{ background: 'rgba(0,0,0,0.58)', borderRadius: 4, padding: '1px 5px', maxWidth: 64 }}>
        <span style={{ fontFamily: schibsted, fontWeight: 700, fontSize: 8, color: '#fff', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{etiquetaCancha(p.nombre)}</span>
      </div>
    </div>
  );
};

/** El césped con sus líneas (viewBox de 68 × 105). */
export const Cesped: FC<{ puntos?: boolean }> = ({ puntos = true }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2A7D44 0%, #2F8A4B 50%, #2A7D44 100%)' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0 7%, rgba(0,0,0,0.04) 7% 14%)' }} />
    <svg width="100%" height="100%" viewBox="0 0 68 105" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" fill="none">
        <rect x="1" y="1" width="66" height="103" />
        <line x1="1" y1="52.5" x2="67" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.85" y="1" width="40.3" height="16.5" />
        <rect x="13.85" y="87.5" width="40.3" height="16.5" />
        <rect x="24.85" y="1" width="18.3" height="5.5" />
        <rect x="24.85" y="99.5" width="18.3" height="5.5" />
        {puntos && (
          <>
            <circle cx="34" cy="52.5" r="0.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="34" cy="11" r="0.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="34" cy="94" r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d="M 25.75 17.5 A 9.15 9.15 0 0 0 42.25 17.5" />
            <path d="M 25.75 87.5 A 9.15 9.15 0 0 1 42.25 87.5" />
            <path d="M 1 2 A 1 1 0 0 0 2 1" />
            <path d="M 67 2 A 1 1 0 0 1 66 1" />
            <path d="M 1 103 A 1 1 0 0 1 2 104" />
            <path d="M 67 103 A 1 1 0 0 0 66 104" />
          </>
        )}
      </g>
    </svg>
  </div>
);

const PanelCancha: FC<{ d: EstadoArmador; g: GeoArmador; alto: number }> = ({ d, g, alto }) => {
  const x = X0_A + IZQ + 14;
  const cat = nombreCat(d.categoria);
  const r = d.resalte ?? {};
  return (
    <div style={{ position: 'absolute', left: x, top: g.tablero, width: CEN, height: alto, boxSizing: 'border-box', background: '#fff', border: `1px solid ${MC.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        {cat ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#FFFBEB', color: '#B45309', boxShadow: anillo(r.chipCat, '245,158,11') }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
            {cat}
          </span>
        ) : (
          <span />
        )}
        {d.fechaCancha && <span style={{ fontFamily: jetbrains, fontSize: 11, color: MC.muted }}>{d.fechaCancha}</span>}
        <span style={{ fontFamily: jetbrains, fontWeight: 600, color: MC.text, background: MC.slateBg, padding: '3px 9px', borderRadius: 999, fontSize: 11 }}>{d.formacion}</span>
      </div>
      <div style={{ position: 'absolute', left: g.cancha.x - x - 1, top: 1 + 14 + 22 + 10 - 1, width: CANCHA.w, height: CANCHA.h, borderRadius: 12, overflow: 'hidden', boxShadow: `inset 0 0 40px rgba(0,0,0,0.25)${(r.cancha ?? 0) > 0 ? `, ${anillo(r.cancha)}` : ''}` }}>
        <Cesped />
        {d.zonas.map((z) => {
          const id = d.alineacion[z.id] ?? null;
          const p = id ? jugadorA(id) : null;
          const sobre = d.sobre === z.id;
          return (
            <div key={z.id} style={{ position: 'absolute', left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: p ? 2 : 1 }}>
              {p ? (
                <div style={{ position: 'relative' }}>
                  <FichaCancha p={p} rol={p.rol} capitan={d.capitan === id} tenue={d.arrastrando === id} escala={d.aparece?.[p.id] ?? 1} resalteC={d.resalteC} />
                  {sobre && <div style={{ position: 'absolute', left: '50%', top: 0, width: 58, height: 58, marginLeft: -29, marginTop: -5, borderRadius: '50%', boxShadow: '0 0 0 2px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)' }} />}
                </div>
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px dashed rgba(255,255,255,${sobre ? 0.9 : 0.5})`, background: `rgba(255,255,255,${sobre ? 0.4 : 0.18})`, boxShadow: sobre ? '0 0 20px rgba(255,255,255,0.25)' : 'none', display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 300, lineHeight: 1 }}>+</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Alineación (RightPanel) -----------------------------------------------------------------------------------------------

const CabezaGrupo: FC<{ label: string; cuenta: string }> = ({ label, cuenta }) => (
  <div style={{ height: 25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 2px 0', fontSize: 10, fontWeight: 600, color: MC.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', boxSizing: 'border-box' }}>
    <span>{label}</span>
    <span style={{ fontFamily: jetbrains, fontSize: 10, fontWeight: 600, background: MC.slateBg, color: MC.muted, padding: '1px 6px', borderRadius: 999, letterSpacing: 0 }}>{cuenta}</span>
  </div>
);

/** Una fila de la Alineación (titular o suplente) con la «C» del capitán. */
export const FilaAlineacion: FC<{ p: JugadorA; suplente?: boolean; capitan?: boolean; hoverC?: boolean; apretarC?: number; resalteC?: number; tenue?: boolean; style?: CSSProperties }> = ({ p, suplente, capitan, hoverC, apretarC = 0, resalteC = 0, tenue, style }) => {
  const color = ROLES_A[p.rol].color;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '0 10px', height: FILA_D, boxSizing: 'border-box', background: suplente ? MC.sunken : '#fff', border: suplente ? `1px dashed ${MC.border}` : `1px solid ${MC.b600}`, boxShadow: suplente ? 'none' : '0 0 0 2px oklch(0.66 0.18 30 / 0.12)', borderRadius: 8, opacity: tenue ? 0.25 : 1, ...style }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: suplente ? '#fff' : color, border: suplente ? `1px solid ${MC.border}` : '1px solid transparent', display: 'grid', placeItems: 'center', fontFamily: jetbrains, fontWeight: 700, fontSize: 11, color: suplente ? MC.text : '#fff', boxSizing: 'border-box' }}>{p.num ?? '–'}</div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.2, color: MC.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
        <div style={{ fontSize: 11, color: MC.muted, display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.1 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
          {p.pos}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {p.pagado === false && (
          <Bandera bg={MC.redBg} borde={MC.redBorder} color={MC.redText} size={10}>
            $
          </Bandera>
        )}
        <div style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', boxSizing: 'border-box', background: capitan ? '#F59E0B' : hoverC ? '#FEF3C7' : 'transparent', border: `1px solid ${capitan ? '#D97706' : hoverC ? '#FDE68A' : 'transparent'}`, color: capitan ? '#fff' : hoverC ? '#D97706' : MC.subtle, fontSize: 10, fontWeight: 900, transform: hundir(apretarC), boxShadow: anillo(resalteC, '245,158,11') }}>C</div>
      </div>
    </div>
  );
};

const PanelAlineacion: FC<{ d: EstadoArmador; g: GeoArmador; alto: number }> = ({ d, g, alto }) => {
  const tit = titularesDe(d);
  const sup = suplentesDe(d);
  const L = geoAlineacion(g, tit.length, sup.length);
  const r = d.resalte ?? {};
  const x = g.xDer;
  const sobreTit = d.sobre === 'titulares';
  const sobreSup = d.sobre === 'suplentes';
  const lleno = tit.length >= d.zonas.length;
  const rel = (c: CajaA) => ({ left: c.x - x - 1, top: c.y - g.tablero - 1, width: c.ancho });
  return (
    <div style={{ position: 'absolute', left: x, top: g.tablero, width: DER, height: alto, boxSizing: 'border-box', background: '#fff', border: `1px solid ${MC.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 41.5, padding: '0 14px', borderBottom: `1px solid ${MC.border}`, background: MC.sunken, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Svg tam={14} color={MC.subtle}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </Svg>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: MC.subtle }}>Alineación</span>
        </div>
        <span style={{ fontFamily: jetbrains, fontSize: 11, fontWeight: 600, color: MC.muted }}>
          {tit.length}/{d.zonas.length}
        </span>
      </div>
      {/* Titulares */}
      <div style={{ position: 'absolute', ...rel(L.titulares), height: L.titulares.alto, borderRadius: 8, boxShadow: anillo(r.titulares) }}>
        <CabezaGrupo label="Titulares" cuenta={`${tit.length}/${d.zonas.length}`} />
        <div style={{ position: 'absolute', left: sobreTit ? -4 : 0, right: sobreTit ? -4 : 0, top: 25 - (sobreTit ? 4 : 0), bottom: sobreTit ? -4 : 0, borderRadius: 8, border: `1.5px dashed ${sobreTit ? (lleno ? '#FCA5A5' : MC.b400) : 'transparent'}`, background: sobreTit ? (lleno ? 'oklch(0.97 0.02 20 / 0.6)' : 'oklch(0.972 0.014 30 / 0.5)') : 'transparent' }} />
        {tit.length === 0 && <p style={{ position: 'absolute', left: 0, right: 0, top: 25, margin: 0, fontSize: 12, color: MC.subtle, lineHeight: '44px', textAlign: 'center' }}>{sobreTit ? 'Suelta para ubicar en la cancha' : 'Sin titulares'}</p>}
      </div>
      {tit.map((id, i) => {
        const c = L.filaTit(d.filaTit?.[id] ?? i);
        return <FilaAlineacion key={id} p={jugadorA(id)} capitan={d.capitan === id} hoverC={d.hover?.c === id} apretarC={d.hover?.c === id ? d.apretar?.c : 0} resalteC={d.capitan === id ? (d.resalteC ?? 0) : 0} style={{ position: 'absolute', ...rel(c) }} />;
      })}
      {/* Suplentes */}
      <div style={{ position: 'absolute', ...rel(L.suplentes), height: L.suplentes.alto, borderRadius: 8, boxShadow: anillo(r.suplentes) }}>
        <CabezaGrupo label="Suplentes" cuenta={`${sup.length}`} />
        <div style={{ position: 'absolute', left: sobreSup ? -4 : 0, right: sobreSup ? -4 : 0, top: 25 - (sobreSup ? 4 : 0), bottom: sobreSup ? -4 : 0, borderRadius: 8, border: `1.5px dashed ${sobreSup ? MC.b400 : 'transparent'}`, background: sobreSup ? 'oklch(0.972 0.014 30 / 0.5)' : 'transparent' }} />
        {sup.length === 0 && !sobreSup && <p style={{ position: 'absolute', left: 0, right: 0, top: 25, margin: 0, fontSize: 12, color: MC.subtle, lineHeight: '44px', textAlign: 'center' }}>Arrastra jugadores aquí</p>}
      </div>
      {sup.map((id, i) => {
        const c = L.filaSup(d.filaSup?.[id] ?? i);
        return <FilaAlineacion key={id} p={jugadorA(id)} suplente capitan={d.capitan === id} tenue={d.arrastrando === id} style={{ position: 'absolute', ...rel(c) }} />;
      })}
    </div>
  );
};

// --- El aviso de la cancha llena ------------------------------------------------------------------------------------------

export const AVISO_CANCHA_LLENA = 'La cancha ya está completa (11/11 titulares). Baja a un jugador a suplentes o a convocados para subir a otro.';
const AvisoLleno: FC<{ d: EstadoArmador; g: GeoArmador }> = ({ d, g }) => {
  const t = d.aviso ?? 0;
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: g.aviso.x, top: g.aviso.y, width: AW_A, height: 40, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 8, border: '1px solid #FDE68A', background: (d.hover?.aviso ?? 0) > 0.5 ? '#FEF3C7' : '#FFFBEB', color: '#92400E', fontSize: 13, lineHeight: 1.4, opacity: Math.min(1, t * 1.4), boxShadow: anillo(d.resalte?.aviso, '245,158,11') }}>
      <Svg tam={15}>
        <path d="M12 9v3.75m0 3.75h.008M10.34 3.94l-8.4 14.55A1.5 1.5 0 003.24 21h17.52a1.5 1.5 0 001.3-2.51L13.66 3.94a1.5 1.5 0 00-2.6 0z" />
      </Svg>
      <span style={{ flex: 1 }}>{AVISO_CANCHA_LLENA}</span>
    </div>
  );
};

// =============================================================================================================
// La página
// =============================================================================================================

/** El armador de plantillas entero (va dentro de `MarcoUsuarios`, que pone el menú y la barra). */
export const PaginaPartidos: FC<{ d: EstadoArmador }> = ({ d }) => {
  const g = geoArmador(d);
  const asignados = enCancha(d).size;
  const nConv = ordenConvocados(d).length;
  const altoIzq = CABEZA_PANEL + LEYENDA + 20 + nConv * PASO_C - 6 + 2;
  const tit = titularesDe(d).length;
  const sup = suplentesDe(d).length;
  const altoDer = 41.5 + 10 + 25 + Math.max(44, tit * PASO_D - 5) + 11 + 25 + Math.max(44, sup * PASO_D - 5) + 10 + 2;
  const altoCen = 1 + 14 + 22 + 10 + CANCHA.h + 14 + 1;
  const alto = Math.max(altoIzq, altoDer, altoCen);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, fontFamily: instrument, color: MC.text, fontSize: 14 }}>
      <Encabezado d={d} g={g} />
      <FilaPlantillas d={d} g={g} />
      <Barra d={d} g={g} asignados={asignados} />
      <AvisoLleno d={d} g={g} />
      <PanelConvocados d={d} g={g} alto={alto} />
      <PanelCancha d={d} g={g} alto={alto} />
      <PanelAlineacion d={d} g={g} alto={alto} />
    </div>
  );
};

// =============================================================================================================
// Lo que flota encima: ficha del jugador, tarjetas que se arrastran, ventanas y el cursor de «no se puede»
// =============================================================================================================

/** La ficha que sale al pasar el mouse (PlayerTooltip), con su esquina en (x, y) de la página. */
export const FichaJugador: FC<{ p: JugadorA; x: number; y: number; t?: number }> = ({ p, x, y, t = 1 }) => {
  if (t <= 0) return null;
  const les = p.estado === 'injured';
  const san = p.estado === 'suspended';
  const chip = (bg: string, color: string, texto: string) => <span style={{ background: bg, color, padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 500 }}>{texto}</span>;
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 300, background: '#0F172A', color: '#fff', borderRadius: 10, padding: '10px 12px', minWidth: 240, maxWidth: 280, boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: 12, fontFamily: instrument, opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 4}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: ROLES_A[p.rol].color, display: 'grid', placeItems: 'center', fontFamily: jetbrains, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.num ?? '?'}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{p.nombre}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: jetbrains, marginTop: 2, whiteSpace: 'nowrap' }}>
            {p.pos} · {nombreCat(p.cat)}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 8 }}>
        {['Goles', 'Asist.', 'Min.', 'Amarillas'].map((l) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11 }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</span>
            <span style={{ fontFamily: jetbrains, fontWeight: 600 }}>—</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {p.pagado === true && chip('rgba(16,185,129,0.18)', '#6EE7B7', 'Mensualidad al día')}
        {p.pagado === false && chip('rgba(239,68,68,0.18)', '#FCA5A5', 'Mensualidad pendiente')}
        {!les && !san && chip('rgba(16,185,129,0.18)', '#6EE7B7', 'Disponible')}
        {les && chip('rgba(239,68,68,0.18)', '#FCA5A5', 'Lesionado')}
        {san && chip('rgba(245,158,11,0.18)', '#FCD34D', 'Sancionado')}
      </div>
      {les && p.lesion && (
        <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>
          <b style={{ color: '#fff', display: 'block', marginBottom: 2, fontSize: 11, fontWeight: 600 }}>{p.lesion.desc}</b>
          <span>
            Desde {p.lesion.desde} · ETA {p.lesion.hasta}
          </span>
        </div>
      )}
      {san && (
        <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D', fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>
          <b style={{ color: '#fff', display: 'block', fontSize: 11, fontWeight: 600 }}>Jugador sancionado</b>
        </div>
      )}
    </div>
  );
};

/** La tarjeta que sigue al mouse al arrastrar desde Convocados o Suplentes (DraggingBenchCard), esquina en (x, y). */
export const TarjetaArrastre: FC<{ p: JugadorA; x: number; y: number }> = ({ p, x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, zIndex: 320, width: 220, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, border: '1px solid #60A5FA', background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', opacity: 0.97, transform: 'rotate(1.5deg)', boxSizing: 'border-box', fontFamily: instrument }}>
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{p.num ?? '–'}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '20px' }}>{p.nombre}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', lineHeight: '16px' }}>{p.pos}</p>
    </div>
  </div>
);

/** La ficha que sigue al mouse al arrastrar desde la cancha (DraggingFieldCard → FieldBadge), centro del disco en (x, y). */
export const FichaArrastre: FC<{ p: JugadorA; x: number; y: number }> = ({ p, x, y }) => (
  <div style={{ position: 'absolute', left: x - 32, top: y - 23, width: 64, zIndex: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(145deg, #1d4ba0 0%, #0d2557 100%)', border: '2.5px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: jetbrains, fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{p.num ?? '?'}</span>
    </div>
    <span style={{ fontFamily: instrument, fontWeight: 600, fontSize: 9.5, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)', letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{etiquetaCancha(p.nombre)}</span>
  </div>
);

/** El cursor «no se puede» (not-allowed) del navegador, en píxeles de la página. */
export const CursorProhibido: FC<{ en: { x: number; y: number }; tamano?: number; opacidad?: number }> = ({ en, tamano = 1, opacidad = 1 }) =>
  opacidad > 0 ? (
    <div style={{ position: 'absolute', left: en.x, top: en.y, width: 0, height: 0, opacity: opacidad, zIndex: 401, transform: `scale(${tamano})`, transformOrigin: '0 0', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
      <svg width={40} height={40} viewBox="0 0 40 40" style={{ position: 'absolute', left: -2, top: -1, overflow: 'visible' }}>
        <path d="M2 1 L2 24 L8 18.5 L12 28 L16 26.3 L12.2 17 L20 17 Z" fill="#0F172A" stroke="white" strokeWidth={1.6} strokeLinejoin="round" />
        <circle cx="25" cy="27" r="8" fill="#fff" stroke="#DC2626" strokeWidth={2.8} />
        <path d="M19.5 21.5 L30.5 32.5" stroke="#DC2626" strokeWidth={2.8} strokeLinecap="round" />
      </svg>
    </div>
  ) : null;

// --- Ventanas (Nueva plantilla y Nueva Formación) -------------------------------------------------------------------------

const ANCHO_V = 384;
const ALTO_PLANTILLA = 244;
const ALTO_FORMACION = 198;
const ventana = (vh: number, alto: number) => caja((ANCHO_U - ANCHO_V) / 2, Math.round((vh - alto) / 2), ANCHO_V, alto);
/** Dónde queda todo en «Nueva plantilla». */
export const NUEVA_PLANTILLA_V = (vh: number) => {
  const r = ventana(vh, ALTO_PLANTILLA);
  const x = r.x + 25;
  const y = r.y + 25 + 36 + 16;
  const w = (334 - 24) / 4;
  return { r, opcion: (i: number) => caja(x + i * (w + 8), y, w, 42), otra: caja(x, y + 42 + 12, 334, 34), cancelar: caja(x, y + 42 + 12 + 34 + 8 + 8, 163, 38), crear: caja(x + 171, y + 42 + 12 + 34 + 8 + 8, 163, 38) };
};
/** Dónde queda todo en «Nueva Formación». */
export const NUEVA_FORMACION_V = (vh: number) => {
  const r = ventana(vh, ALTO_FORMACION);
  const x = r.x + 25;
  const y = r.y + 25 + 36 + 16;
  return { r, campo: caja(x, y, 334, 42), cancelar: caja(x, y + 42 + 4 + 12, 163, 38), agregar: caja(x + 171, y + 42 + 4 + 12, 163, 38) };
};

const FondoVentana: FC<{ t: number }> = ({ t }) => <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.3 * t})`, backdropFilter: `blur(${4 * t}px)`, zIndex: 200 }} />;
const CabezaVentana: FC<{ titulo: string; sub: string; icono: ReactNode }> = ({ titulo, sub, icono }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 36, marginBottom: 16 }}>
    <div style={{ width: 36, height: 36, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>{icono}</div>
    <div>
      <h3 style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 14, lineHeight: '20px' }}>{titulo}</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', lineHeight: '16px' }}>{sub}</p>
    </div>
  </div>
);
const BotonesVentana: FC<{ ok: string; hover?: number; apretar?: number }> = ({ ok, hover = 0, apretar = 0 }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <span style={{ flex: 1, height: 38, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500, color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: 12, boxSizing: 'border-box' }}>Cancelar</span>
    <span style={{ flex: 1, height: 38, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 600, color: '#fff', background: hover > 0.5 ? '#1D4ED8' : '#2563EB', borderRadius: 12, transform: hundir(apretar) }}>{ok}</span>
  </div>
);

export type DatosNuevaPlantilla = { t: number; elegida: number; hover?: number | null; hoverCrear?: number; apretar?: { opcion?: number; crear?: number } };
const PRESETS = [5, 7, 9, 11];
export const VentanaNuevaPlantilla: FC<{ d: DatosNuevaPlantilla; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const L = NUEVA_PLANTILLA_V(vh);
  return (
    <>
      <FondoVentana t={Math.min(1, d.t * 1.5)} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: ANCHO_V, height: ALTO_PLANTILLA, boxSizing: 'border-box', background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: 24, zIndex: 201, fontFamily: instrument, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.96 + 0.04 * d.t})` }}>
        <CabezaVentana
          titulo="Nueva plantilla"
          sub="¿Cuántos jugadores en cancha? (portero incluido)"
          icono={
            <Svg tam={20}>
              <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z" />
            </Svg>
          }
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {PRESETS.map((n) => {
            const on = d.elegida === n;
            const h = d.hover === n && !on;
            return (
              <span key={n} style={{ height: 42, display: 'grid', placeItems: 'center', borderRadius: 12, fontSize: 14, fontWeight: 600, border: `1px solid ${on ? '#2563EB' : '#E5E7EB'}`, background: on ? '#2563EB' : h ? '#F9FAFB' : '#fff', color: on ? '#fff' : '#4B5563', boxSizing: 'border-box', transform: d.hover === n ? hundir(d.apretar?.opcion) : undefined }}>
                {n}
              </span>
            );
          })}
        </div>
        <div style={{ height: 34, display: 'grid', placeItems: 'center', marginBottom: 8, borderRadius: 12, fontSize: 12, fontWeight: 500, border: '1px solid #E5E7EB', color: '#6B7280', boxSizing: 'border-box' }}>Otra cantidad</div>
        <div style={{ height: 8 }} />
        <BotonesVentana ok="Crear" hover={d.hoverCrear} apretar={d.apretar?.crear} />
      </div>
    </>
  );
};

export type DatosNuevaFormacion = { t: number; texto: string; foco?: boolean; hoverAgregar?: number; apretarAgregar?: number };
export const VentanaNuevaFormacion: FC<{ d: DatosNuevaFormacion; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const L = NUEVA_FORMACION_V(vh);
  return (
    <>
      <FondoVentana t={Math.min(1, d.t * 1.5)} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: ANCHO_V, height: ALTO_FORMACION, boxSizing: 'border-box', background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: 24, zIndex: 201, fontFamily: instrument, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.96 + 0.04 * d.t})` }}>
        <CabezaVentana
          titulo="Nueva Formación"
          sub="Fútbol 11 · el portero (1) se agrega automáticamente"
          icono={
            <Svg tam={20}>
              <path d="M12 4v16m8-8H4" />
            </Svg>
          }
        />
        <div style={{ height: 42, display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 12, border: `1px solid ${d.foco ? 'transparent' : '#E5E7EB'}`, boxShadow: d.foco ? '0 0 0 2px #3B82F6' : undefined, fontFamily: jetbrains, fontSize: 14, color: d.texto ? '#111827' : '#9CA3AF', marginBottom: 4, boxSizing: 'border-box', whiteSpace: 'pre' }}>
          {d.texto || 'Ej: 4-3-3  →  suma debe ser 10'}
          {d.foco && d.texto && <Caret alto={18} color="#111827" />}
        </div>
        <div style={{ height: 12 }} />
        <BotonesVentana ok="Agregar" hover={d.hoverAgregar} apretar={d.apretarAgregar} />
      </div>
    </>
  );
};

// --- Ayudas para el video ----------------------------------------------------------------------------------------------------

/** Posiciones de las filas mezcladas entre dos órdenes (para que bajen o suban al cambiar). */
export const mezclarOrden = (t: number, antes: string[], ahora: string[]): Record<string, number> => {
  const r: Record<string, number> = {};
  ahora.forEach((id, i) => {
    const j0 = antes.indexOf(id);
    r[id] = j0 < 0 ? i : mezcla(t, j0, i);
  });
  return r;
};
