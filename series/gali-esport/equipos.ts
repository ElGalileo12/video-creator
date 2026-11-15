// La gente y los equipos de la serie (inventados, siempre los mismos): los coaches que Camilo invita a la
// Copa Galileo, sus equipos y la plantilla Sub-14 de Daniel (CD Norte). Y los colores e iniciales con que la app
// pinta a cada equipo y persona (TEAM_PALETTE de teams/TeamsClient.tsx e invitations/InvitationsClient.tsx).

export type Coach = {
  id: string;
  /** Como lo guardó Camilo en sus contactos. */
  nombre: string;
  email: string;
  equipo: string;
  /** Color de su nombre en WhatsApp. */
  colorChat: string;
  favorito?: boolean;
  /** Sin cuenta en Gali Esport (la app lo marca «sin cuenta»). */
  sinCuenta?: boolean;
};

export const COACHES: Coach[] = [
  { id: 'daniel', nombre: 'Daniel', email: 'daniel.cdnorte@gmail.com', equipo: 'CD Norte', colorChat: '#00A884', favorito: true },
  { id: 'rios', nombre: 'Coach Ríos', email: 'rios.halcones@gmail.com', equipo: 'Halcones', colorChat: '#1F7AEC' },
  { id: 'andres', nombre: 'Andrés', email: 'andres.atleticosur@gmail.com', equipo: 'Atlético Sur', colorChat: '#DC6E4F' },
  { id: 'marcela', nombre: 'Marcela', email: 'marcela.leones@gmail.com', equipo: 'Leones', colorChat: '#E542A3' },
  { id: 'julian', nombre: 'Profe Julián', email: 'julian.tigresfc@gmail.com', equipo: 'Tigres FC', colorChat: '#8B5CF6', sinCuenta: true },
];
export const coach = (id: string) => COACHES.find((c) => c.id === id)!;

/** Una coach nueva, que no estaba en la lista: se invita solo con su correo. */
export const NUEVA: Coach = { id: 'sofia', nombre: 'Sofía Méndez', email: 'sofia@pumasfc.com', equipo: 'Pumas FC', colorChat: '#0891B2', sinCuenta: true };

// --- Colores e iniciales como en la app ---------------------------------------------------------------------

const PALETA = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#db2777', '#ca8a04', '#2563eb', '#9333ea'];

/** El color que la app le da a un nombre (siempre el mismo para el mismo nombre). */
export const colorDe = (nombre: string) => {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA[h % PALETA.length];
};

/** Aclara u oscurece un color #rrggbb. */
export const sombra = (hex: string, cuanto: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + cuanto));
  return '#' + (c(n >> 16) * 0x10000 + c((n >> 8) & 0xff) * 0x100 + c(n & 0xff)).toString(16).padStart(6, '0');
};

/** Degradado de un avatar sin foto. */
export const degradadoDe = (nombre: string) => `linear-gradient(135deg, ${colorDe(nombre)} 0%, ${sombra(colorDe(nombre), -18)} 100%)`;

/** Iniciales: las primeras letras de las dos primeras palabras. */
export const iniciales = (nombre: string) =>
  nombre.split(/\s+/).filter(Boolean).map((w) => Array.from(w)[0]).slice(0, 2).join('').toUpperCase() || '?';

// --- La Sub-14 de Daniel (CD Norte) -------------------------------------------------------------------------

export type Rol = 'GK' | 'DEF' | 'MID' | 'FWD';
/** `posicion`: como la escribe la app bajo el nombre (formatPosition de app/lib/position-labels.ts). */
export type Jugador = { id: string; nombre: string; numero: number; rol: Rol; posicion?: string };

/** Los mismos jugadores de `y-quien-juega` y `quien-me-debe`. */
export const SUB14: Jugador[] = [
  { id: 'mateo', nombre: 'Mateo Rojas', numero: 7, rol: 'FWD', posicion: 'Delantero Centro' },
  { id: 'lucas', nombre: 'Lucas Pérez', numero: 6, rol: 'MID', posicion: 'Mediocentro Defensivo' },
  { id: 'santiago', nombre: 'Santiago Mejía', numero: 14, rol: 'MID', posicion: 'Mediocentro' },
  { id: 'tomas', nombre: 'Tomás Gómez', numero: 8, rol: 'MID', posicion: 'Mediocentro' },
  { id: 'felipe', nombre: 'Felipe Herrera', numero: 9, rol: 'FWD', posicion: 'Extremo Derecho' },
  { id: 'juan', nombre: 'Juan Castro', numero: 2, rol: 'DEF', posicion: 'Lateral Derecho' },
  { id: 'diego', nombre: 'Diego Rivera', numero: 4, rol: 'DEF', posicion: 'Defensa Central' },
  { id: 'samuel', nombre: 'Samuel Ortiz', numero: 1, rol: 'GK', posicion: 'Portero' },
  { id: 'nicolas', nombre: 'Nicolás Vargas', numero: 5, rol: 'DEF', posicion: 'Lateral Izquierdo' },
  { id: 'andres', nombre: 'Andrés Molina', numero: 3, rol: 'DEF', posicion: 'Defensa Central' },
  { id: 'julian', nombre: 'Julián Torres', numero: 10, rol: 'MID', posicion: 'Mediocentro Ofensivo' },
  { id: 'bruno', nombre: 'Bruno Silva', numero: 17, rol: 'FWD', posicion: 'Segundo Delantero' },
  { id: 'sebastian', nombre: 'Sebastián Díaz', numero: 12, rol: 'GK', posicion: 'Portero' },
  { id: 'gabriel', nombre: 'Gabriel Ramos', numero: 16, rol: 'DEF', posicion: 'Defensa Central' },
];

/**
 * La plantilla en el orden en que la app la muestra al elegir jugador (API de jugadores del equipo): porteros,
 * defensas, mediocampistas y delanteros, y dentro de cada grupo por número.
 */
export const ordenApp = (lista: Jugador[]) => {
  const prioridad = (p = '') => (/portero|arquero/i.test(p) ? 0 : /defensa|central|lateral/i.test(p) ? 1 : /medio|volante|centrocampista/i.test(p) ? 2 : 3);
  return [...lista].sort((a, b) => prioridad(a.posicion) - prioridad(b.posicion) || a.numero - b.numero || a.nombre.localeCompare(b.nombre));
};

// --- Pumas FC (de Sofía Méndez), el rival de CD Norte en `sabado-de-partidos` -------------------------------------

export const PUMAS: Jugador[] = [
  { id: 'joaquin', nombre: 'Joaquín Rincón', numero: 1, rol: 'GK', posicion: 'Portero' },
  { id: 'emiliano', nombre: 'Emiliano Vega', numero: 5, rol: 'DEF', posicion: 'Defensa Central' },
  { id: 'martin', nombre: 'Martín Cárdenas', numero: 8, rol: 'MID', posicion: 'Mediocentro' },
  { id: 'matias', nombre: 'Matías Ospina', numero: 9, rol: 'FWD', posicion: 'Delantero Centro' },
];
