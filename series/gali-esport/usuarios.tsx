// «Usuarios» del ENTRENADOR en escritorio (desde `usuarios`), fiel a la app, y el perfil del JUGADOR con su lesión.
// Código de la app (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// - Página: app/(dashboard)/coach/customers/CustomersClient.tsx (pestañas «Miembros» / «Solicitudes» con la burbuja roja),
//   feature/coach/components/customers/CustomersHeader.tsx, CustomersToolbar.tsx (la barra de escritorio), CategoryTabs.tsx
//   («Jugadores · N resultados», tarjetas Todos/Activos/Invitados/Suspendidos, filas «Sede» y «Categoría»), TableView.tsx
//   (columnas, «🩹 Lesionado», el menú «⋯» con su submenú de categorías), BulkActionBar.tsx.
// - Ventanas: CategoryModal.tsx («Crear nueva categoría»), InviteModal.tsx («Invitar nuevo miembro»), ImportModal.tsx
//   («Importar invitaciones»), JoinRequestsPanel.tsx (Solicitudes), UserDrawer.tsx («Perfil de usuario»),
//   BulkModals.tsx («Enviar mensaje»), components/ui/confirm-dialog.tsx, components/ui/form-modal.tsx y
//   components/injury/InjuryDialog.tsx.
// - Campanita: components/layout/NotificationBell.tsx (aviso PLAYER_INJURY «🩹», «{nombre} reportó una lesión»).
// - Jugador: app/(dashboard)/player/profile/ProfileClient.tsx, feature/player/components/ProfileTabs.tsx,
//   CurrentTeamSection.tsx, InjurySection.tsx y PersonalInfoSection.tsx.
// Modelo de pantalla: 1440 × `vh` (ANCHO_U, un escritorio de 1440, como pide el pedido). Las medidas exportadas están en píxeles de la página (sin restar `scroll`), para llevar
// el puntero y la cámara. Datos de ejemplo inventados (Academia Fénix Bogotá, correos @ejemplo.com).
import { AlertTriangle, Bell, CalendarDays, Check, CheckCircle, CheckCircle2, ChevronDown, Download, Edit, FileSpreadsheet, FolderLock, HeartPulse, Info, LayoutDashboard, List, Mail, Moon, MoreVertical, Pause, Pencil, Play, Plus, Search, Send, ShieldCheck, Tag, Trash2, Trophy, Upload, X } from 'lucide-react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { ACADEMIA } from './escuela-publica';
import { MenuEntrenadorPC, type Tonos } from './escuela-panel';
import { instrument, jetbrains, schibsted } from './letras';
import { Isotipo } from './marca';

// =============================================================================================================
// Datos de ejemplo
// =============================================================================================================

export type CatId = 'sub10' | 'sub15' | 'sub13';
export type CategoriaU = { id: CatId; nombre: string; codigo: string; color: string };
/** En el orden de la app (por fecha de creación): la Sub-13 se crea en el video. */
export const CATEGORIAS_U: CategoriaU[] = [
  { id: 'sub10', nombre: 'Sub-10', codigo: 'S10', color: '#10B981' },
  { id: 'sub15', nombre: 'Sub-15', codigo: 'S15', color: '#8B5CF6' },
  { id: 'sub13', nombre: 'Sub-13', codigo: 'S13', color: '#3B82F6' },
];
export const catU = (id: CatId | null) => CATEGORIAS_U.find((c) => c.id === id) ?? null;

export type SedeId = 'norte' | 'principal';
export const SEDES_U: { id: SedeId; nombre: string }[] = [
  { id: 'norte', nombre: 'Sede Norte' },
  { id: 'principal', nombre: 'Sede principal' },
];
const nombreSede = (s: SedeId | null) => SEDES_U.find((x) => x.id === s)?.nombre ?? null;

export type EstadoU = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type MiembroU = {
  id: string;
  /** Las invitaciones pendientes llegan sin nombre ni categoría (app/api/coach/members). */
  nombre: string;
  correo: string;
  cat: CatId | null;
  sede: SedeId | null;
  estado: EstadoU;
  ultima: string | null;
  registrado: string;
  invitacion?: boolean;
  lesion?: string | null;
  telefono?: string;
  pazYSalvo?: boolean;
};

const m = (id: string, nombre: string, cat: CatId, sede: SedeId, estado: EstadoU, ultima: string, registrado: string, extra: Partial<MiembroU> = {}): MiembroU => ({
  id,
  nombre,
  correo: `${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.')}@ejemplo.com`,
  cat,
  sede,
  estado,
  ultima,
  registrado,
  ...extra,
});
const inv = (correo: string, sede: SedeId | null, registrado: string): MiembroU => ({ id: correo, nombre: '', correo, cat: null, sede, estado: 'PENDING', ultima: null, registrado, invitacion: true });

/** Los miembros (por fecha de ingreso, del más nuevo al más viejo) y después las invitaciones pendientes. */
export const MIEMBROS_U: MiembroU[] = [
  m('martin', 'Martín Silva', 'sub15', 'norte', 'ACTIVE', '9/11/2026', '2/11/2026'),
  m('salome', 'Salomé Navarro', 'sub10', 'principal', 'ACTIVE', '10/11/2026', '28/10/2026'),
  m('gabriel', 'Gabriel Ortiz', 'sub15', 'principal', 'ACTIVE', '8/11/2026', '20/10/2026'),
  m('valentina', 'Valentina Ruiz', 'sub15', 'principal', 'ACTIVE', '10/11/2026', '14/10/2026', { telefono: '+57 315 482 6610' }),
  m('daniela', 'Daniela Mora', 'sub10', 'norte', 'ACTIVE', '9/11/2026', '6/10/2026'),
  m('mateo', 'Mateo Castro', 'sub15', 'norte', 'ACTIVE', '7/11/2026', '30/9/2026', { telefono: '+57 300 718 2245' }),
  m('tomas', 'Tomás Jiménez', 'sub10', 'norte', 'SUSPENDED', '2/10/2026', '22/9/2026'),
  m('isabella', 'Isabella Torres', 'sub10', 'principal', 'ACTIVE', '10/11/2026', '15/9/2026'),
  m('santiago', 'Santiago Pérez', 'sub15', 'norte', 'ACTIVE', '9/11/2026', '8/9/2026'),
  m('samuel', 'Samuel Rojas', 'sub15', 'norte', 'ACTIVE', '6/11/2026', '1/9/2026'),
  m('sofia', 'Sofía Ramírez', 'sub10', 'principal', 'ACTIVE', '8/11/2026', '25/8/2026'),
  m('nicolas', 'Nicolás Gómez', 'sub15', 'principal', 'ACTIVE', '9/11/2026', '18/8/2026'),
  m('antonella', 'Antonella Cruz', 'sub10', 'norte', 'ACTIVE', '5/11/2026', '11/8/2026'),
  m('sebastian', 'Sebastián Acosta', 'sub15', 'norte', 'ACTIVE', '10/11/2026', '4/8/2026'),
  m('mariana', 'Mariana Díaz', 'sub10', 'principal', 'ACTIVE', '7/11/2026', '28/7/2026'),
  inv('luciana.medina@ejemplo.com', 'norte', '5/11/2026'),
  inv('emiliano.vargas@ejemplo.com', null, '29/10/2026'),
  inv('jeronimo.reyes@ejemplo.com', 'principal', '21/10/2026'),
];
/** El jugador que entra al aprobar la solicitud (la cuenta la maneja su acudiente, con su correo). */
export const JUAN_ESTEBAN: MiembroU = { id: 'juanesteban', nombre: 'Juan Esteban López', correo: 'marcela.lopez@ejemplo.com', cat: 'sub13', sede: 'norte', estado: 'ACTIVE', ultima: '10/11/2026', registrado: '10/11/2026' };
export const INVITACION_JUAN_DAVID = inv('juan.herrera@ejemplo.com', 'norte', '10/11/2026');
/** Las filas de la plantilla de Excel (Importar). */
export const IMPORTADOS = [
  ['andres.morales@ejemplo.com', 'Andrés', 'Morales'],
  ['camila.rios@ejemplo.com', 'Camila', 'Ríos'],
  ['felipe.cardenas@ejemplo.com', 'Felipe', 'Cárdenas'],
  ['juliana.pardo@ejemplo.com', 'Juliana', 'Pardo'],
  ['david.quintero@ejemplo.com', 'David', 'Quintero'],
  ['laura.beltran@ejemplo.com', 'Laura', 'Beltrán'],
] as const;
export const INVITACIONES_IMPORTADAS: MiembroU[] = IMPORTADOS.map(([c]) => inv(c, null, '10/11/2026'));

/** La curita (el emoji 🩹 de la app), dibujada para que el render no dependa de las letras de emojis. */
export const Curita: FC<{ tam?: number; style?: CSSProperties }> = ({ tam = 14, style }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
    <g transform="rotate(-45 12 12)">
      <rect x="1" y="7.5" width="22" height="9" rx="4.5" fill="#F5C28E" stroke="#D99A5E" strokeWidth="0.8" />
      <rect x="8.5" y="7.5" width="7" height="9" fill="#EBA56A" />
      {[
        [10.2, 10],
        [13.8, 10],
        [10.2, 14],
        [13.8, 14],
        [12, 12],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.75" fill="#C98349" />
      ))}
    </g>
  </svg>
);

// --- Avatares (TableView.tsx: color por el nombre e iniciales) ---
const AVATAR_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
export const colorAvatar = (nombre: string) => {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
};
export const inicialesU = (nombre: string) =>
  nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// --- Filtros (CustomersClient + CategoryTabs) ---
export type FiltrosU = { estado: EstadoU | null; sede: SedeId | null; cat: CatId | null; buscar: string };
export const SIN_FILTROS: FiltrosU = { estado: null, sede: null, cat: null, buscar: '' };
const pasa = (x: MiembroU, f: FiltrosU, sin: keyof FiltrosU | null = null) =>
  (sin === 'estado' || !f.estado || x.estado === f.estado) &&
  (sin === 'sede' || !f.sede || x.sede === f.sede) &&
  (sin === 'cat' || !f.cat || x.cat === f.cat) &&
  (sin === 'buscar' || !f.buscar.trim() || x.nombre.toLowerCase().includes(f.buscar.toLowerCase()) || x.correo.toLowerCase().includes(f.buscar.toLowerCase()));
export const filtrarMiembros = (lista: MiembroU[], f: FiltrosU) => lista.filter((x) => pasa(x, f));

// =============================================================================================================
// Colores y medidas
// =============================================================================================================

const TINTA = '#0F172A';
const GRIS = '#64748B';
const SUAVE = '#94A3B8';
const LINEA = '#E5E9F0';
const AZUL = '#2563EB';
const anillo = (t = 0, color = '14,165,233') => (t > 0 ? `0 0 0 ${3 * t}px rgba(${color},${0.95 * t}), 0 0 ${20 * t}px rgba(${color},${0.45 * t})` : undefined);
const hundir = (a = 0) => (a > 0 ? `scale(${1 - a * 0.06})` : undefined);
const caja = (x: number, y: number, ancho: number, alto: number) => ({ x, y, ancho, alto });
export type Caja = ReturnType<typeof caja>;

/** Ancho de la página de escritorio de Usuarios. */
export const ANCHO_U = 1440;
const SIDE = 176;
const X0 = SIDE + 24;
const AW = ANCHO_U - SIDE - 48;
/** Ancho de adentro de la tarjeta de filtros. */
const IW = AW - 2 - 48;

export const U = {
  header: caja(X0, 76, AW, 86),
  miembros: caja(X0 + 4, 190, 86, 34),
  solicitudes: caja(X0 + 94, 190, 128, 34),
  burbuja: caja(X0 + 94 + 96, 198, 18, 18),
  toolbar: caja(X0, 246, AW, 70),
  buscar: caja(X0 + 15, 261, AW - 30 - 738, 40),
  vista: caja(X0 + AW - 15 - 726, 264, 170, 34),
  kanban: caja(X0 + AW - 15 - 723, 267, 86, 28),
  exportar: caja(X0 + AW - 15 - 544, 261, 107, 40),
  importar: caja(X0 + AW - 15 - 425, 261, 107, 40),
  crear: caja(X0 + AW - 15 - 306, 261, 147, 40),
  invitar: caja(X0 + AW - 15 - 147, 261, 147, 40),
  tarjeta: caja(X0, 332, AW, 385),
  editarCat: caja(X0 + 25 + IW - 140, 357, 140, 36),
  /** Las tarjetas de estado: 0 Todos, 1 Activos, 2 Invitados, 3 Suspendidos. */
  estado: (i: number) => caja(X0 + 25 + i * ((IW - 36) / 4 + 12), 423, (IW - 36) / 4, 106),
  filaSedes: caja(X0 + 25, 573, 446, 40),
  /** Píldoras de sede: 0 Todas, 1 Sede Norte, 2 Sede principal. */
  sede: (i: number) => caja(X0 + 25 + 4 + [0, 160, 289][i], 577, [156, 125, 149][i], 32),
  /** Chips de categoría: 0 Todas, 1 Sub-10, 2 Sub-15, 3 Sub-13. */
  chip: (i: number) => caja(X0 + 25 + [0, 210, 327, 444][i], 657, [202, 109, 109, 109][i], 35),
  filaChips: caja(X0 + 25, 657, 553, 35),
  tabla: 737,
  cabeza: 40,
  fila: 71,
};
/** Columnas de la tabla (x de inicio y ancho): casilla, usuario, correo, categoría, sede, estado, última sesión, registrado, menú. */
const COLS = [44, 278, 246, 110, 130, 120, 126, 104, 56];
const colX = (i: number) => X0 + 1 + COLS.slice(0, i).reduce((a, b) => a + b, 0);
export const filaY = (i: number) => U.tabla + 1 + U.cabeza + i * U.fila;
export const FILA = {
  fila: (i: number) => caja(X0 + 1, filaY(i), AW - 2, U.fila),
  casilla: (i: number) => caja(colX(0) + 16, filaY(i) + 27.5, 16, 16),
  nombre: (i: number) => caja(colX(1) + 16, filaY(i) + 16, 200, 38),
  estado: (i: number) => caja(colX(5) + 16, filaY(i) + 24, 84, 23),
  categoria: (i: number) => caja(colX(3) + 16, filaY(i) + 24, 70, 23),
  puntos: (i: number) => caja(colX(8) + 14, filaY(i) + 21.5, 28, 28),
};

// =============================================================================================================
// Piezas pequeñas
// =============================================================================================================

const Avatar: FC<{ nombre: string; tam: number; letra?: number }> = ({ nombre, tam, letra = tam * 0.34 }) => (
  <div style={{ width: tam, height: tam, borderRadius: '50%', background: colorAvatar(nombre), color: '#fff', display: 'grid', placeItems: 'center', fontSize: letra, fontWeight: 600, flexShrink: 0 }}>{inicialesU(nombre)}</div>
);

const ESTADOS: Record<EstadoU, { label: string; bg: string; border: string; color: string; dot: string }> = {
  ACTIVE: { label: 'Verificado', bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', dot: '#10B981' },
  PENDING: { label: 'Pendiente', bg: '#FEF3C7', border: '#FDE68A', color: '#92400E', dot: '#F59E0B' },
  SUSPENDED: { label: 'Suspendido', bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C', dot: '#EF4444' },
};
export const InsigniaEstado: FC<{ estado: EstadoU; resalte?: number }> = ({ estado, resalte = 0 }) => {
  const e = ESTADOS[estado];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, border: `1px solid ${e.border}`, background: e.bg, color: e.color, boxShadow: anillo(resalte), lineHeight: 1.5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.dot }} />
      {e.label}
    </span>
  );
};
export const InsigniaCategoria: FC<{ cat: CatId | null; resalte?: number }> = ({ cat, resalte = 0 }) => {
  const c = catU(cat);
  if (!c) return <span style={{ color: SUAVE, fontSize: 13 }}>—</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${c.color}33`, background: `${c.color}15`, color: c.color, boxShadow: anillo(resalte), lineHeight: 1.5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {c.nombre}
    </span>
  );
};

const btnBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 14px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  border: `1px solid ${LINEA}`,
  background: '#fff',
  color: TINTA,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
};
const etiqueta: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: TINTA, lineHeight: 1.5 };
const campo = (foco = false, alto = 38): CSSProperties => ({
  height: alto,
  padding: '0 12px',
  border: `1px solid ${foco ? '#3B82F6' : LINEA}`,
  boxShadow: foco ? '0 0 0 3px rgba(59,130,246,0.1)' : undefined,
  borderRadius: 8,
  fontSize: 13,
  background: '#fff',
  color: TINTA,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});
const Cursor: FC<{ alto?: number }> = ({ alto = 16 }) => <span style={{ display: 'inline-block', width: 1.5, height: alto, background: TINTA, marginLeft: 1, verticalAlign: 'middle' }} />;
/** Texto de un campo: lo escrito (con cursor si `foco`) o el ejemplo en gris. */
const Escrito: FC<{ valor: string; ejemplo: string; foco?: boolean; mono?: boolean }> = ({ valor, ejemplo, foco, mono }) => (
  <span style={{ color: valor ? TINTA : SUAVE, fontFamily: mono ? jetbrains : undefined, display: 'inline-flex', alignItems: 'center' }}>
    {foco && !valor && <Cursor />}
    {valor || ejemplo}
    {foco && valor && <Cursor />}
  </span>
);

const Velo: FC<{ t: number; z?: number }> = ({ t, z = 100 }) => (t > 0 ? <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.45 * t})`, zIndex: z }} /> : null);

/** Una ventana centrada (CategoryModal, InviteModal, ImportModal y FormModal comparten el aspecto). */
export const ventanaCentrada = (vh: number, ancho: number, alto: number) => caja((ANCHO_U - ancho) / 2, Math.round((vh - alto) / 2), ancho, alto);
const Ventana: FC<{ r: Caja; t: number; z?: number; children: ReactNode }> = ({ r, t, z = 102, children }) =>
  t > 0 ? (
    <>
      <Velo t={Math.min(1, t * 1.5)} z={z} />
      <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.ancho, height: r.alto, background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', overflow: 'hidden', zIndex: z + 1, opacity: Math.min(1, t * 1.6), transform: `scale(${0.97 + 0.03 * t})`, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </>
  ) : null;
/** Alto de la cabecera de una ventana: 20 + título (24,3) + 4 + subtítulo (18,85 por línea) + 12. */
export const CABEZA = 79;
export const CABEZA_2 = 98;
const Cabeza: FC<{ titulo: string; sub?: ReactNode; cerrar?: boolean; alto?: number }> = ({ titulo, sub, cerrar, alto = CABEZA }) => (
  <div style={{ height: alto, boxSizing: 'border-box', padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: TINTA, fontFamily: schibsted, lineHeight: 1.35 }}>{titulo}</h3>
      {sub && <p style={{ margin: 0, color: GRIS, fontSize: 13, lineHeight: 1.45 }}>{sub}</p>}
    </div>
    {cerrar && <X size={18} color={GRIS} style={{ margin: 6 }} />}
  </div>
);
const Pie: FC<{ children: ReactNode; alto?: number }> = ({ children, alto = 70 }) => (
  <div style={{ height: alto, flexShrink: 0, padding: '0 24px', background: '#FAFBFC', borderTop: `1px solid ${LINEA}`, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', boxSizing: 'border-box' }}>{children}</div>
);
type Boton = { hover?: number; apretar?: number; resalte?: number };
const BotonPrimario: FC<Boton & { children: ReactNode; color?: string; ancho?: number }> = ({ children, hover = 0, apretar = 0, resalte = 0, color = AZUL, ancho }) => (
  <span style={{ ...btnBase, height: 38, width: ancho, background: color, color: '#fff', border: `1px solid ${color}`, filter: hover > 0 ? `brightness(${1 - 0.1 * hover})` : undefined, transform: hundir(apretar), boxShadow: anillo(resalte) }}>{children}</span>
);
const BotonSecundario: FC<Boton & { children: ReactNode; style?: CSSProperties }> = ({ children, hover = 0, apretar = 0, resalte = 0, style }) => (
  <span style={{ ...btnBase, height: 38, background: hover > 0 ? `rgba(248,250,252,${hover})` : '#fff', transform: hundir(apretar), boxShadow: anillo(resalte), ...style }}>{children}</span>
);

// =============================================================================================================
// Marco: menú, barra de arriba con la campanita y sus avisos
// =============================================================================================================

export const CAMPANA = caja(ANCHO_U - 20 - 34, 9, 34, 34);
export const AVISOS = { x: ANCHO_U - 20 - 360, y: 51, ancho: 360, item: caja(ANCHO_U - 20 - 360, 51 + 46, 360, 76) };

/** Un aviso viejo de la lista (ya leído): glifo, fondo y color del cuadrito, título, cuerpo y hace cuánto. */
export type AvisoViejo = { glifo: string; fondo: string; color: string; titulo: string; cuerpo: string | null; cuando: string };
const AVISOS_VIEJOS: AvisoViejo[] = [
  { glifo: '+', fondo: '#EFF6FF', color: AZUL, titulo: 'Nueva solicitud para unirse', cuerpo: 'Juan Esteban López · Sub-13', cuando: '2 h' },
  { glifo: '✓', fondo: '#ECFDF5', color: '#059669', titulo: 'Todos los documentos de Daniela Mora están completos', cuerpo: null, cuando: '1 d' },
];
/** `icono`: el del aviso nuevo (la curita de PLAYER_INJURY o el trofeo de TOURNAMENT_INVITE, NotificationBell.tsx). */
export type DatosCampana = { sinLeer: number; vaiven?: number; abierta?: number; hover?: number; apretar?: number; hoverItem?: number; aviso?: { titulo: string; cuerpo: string }; icono?: 'curita' | 'trofeo' | 'calendario'; viejos?: AvisoViejo[] };

const Campanita: FC<{ d?: DatosCampana }> = ({ d }) => {
  const ab = (d?.abierta ?? 0) > 0.5;
  const giro = d?.vaiven ? Math.sin(d.vaiven * Math.PI * 6) * 16 * (1 - d.vaiven) : 0;
  return (
    <div style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', border: `1px solid ${ab ? '#dbeafe' : (d?.hover ?? 0) > 0.5 ? '#d9dfe8' : '#e2e8f0'}`, background: ab ? '#eff6ff' : '#fff', color: ab ? '#1d4ed8' : TINTA, boxSizing: 'border-box', transform: hundir(d?.apretar) }}>
      <span style={{ display: 'grid', transform: `rotate(${giro}deg)`, transformOrigin: '50% 10%' }}>
        <Bell size={17} />
      </span>
      {(d?.sinLeer ?? 0) > 0 && (
        <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'content-box', borderRadius: 99, border: '2px solid #fff', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: '16px', textAlign: 'center' }}>{d?.sinLeer}</span>
      )}
    </div>
  );
};

const ListaAvisos: FC<{ d: DatosCampana }> = ({ d }) => {
  const t = d.abierta ?? 0;
  if (t <= 0 || !d.aviso) return null;
  const leido = d.sinLeer === 0;
  return (
    <div style={{ position: 'absolute', left: AVISOS.x, top: AVISOS.y, width: 360, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 14, boxShadow: '0 12px 40px rgba(15,23,42,0.14)', zIndex: 70, overflow: 'hidden', opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -6}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #F1F5F9', height: 46, boxSizing: 'border-box' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: TINTA }}>Notificaciones</span>
        {!leido && <span style={{ color: AZUL, fontSize: 12, fontWeight: 600 }}>Marcar todas como leídas</span>}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '11px 14px', minHeight: 76, boxSizing: 'border-box', borderBottom: '1px solid #F8FAFC', background: (d.hoverItem ?? 0) > 0 ? `rgba(234,241,255,${d.hoverItem})` : leido ? '#fff' : '#F5F9FF' }}>
        {d.icono === 'calendario' ? (
          <span style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CalendarDays size={16} strokeWidth={2.2} />
          </span>
        ) : d.icono === 'trofeo' ? (
          <span style={{ width: 30, height: 30, borderRadius: 8, background: '#FEF3C7', color: '#B45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Trophy size={16} strokeWidth={2.2} />
          </span>
        ) : (
          <span style={{ width: 30, height: 30, borderRadius: 8, background: '#FEF2F2', color: '#DC2626', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            <Curita tam={18} />
          </span>
        )}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: leido ? 500 : 700, color: TINTA, lineHeight: 1.35 }}>{d.aviso.titulo}</span>
          <span style={{ display: 'block', fontSize: 12, color: GRIS, marginTop: 2, lineHeight: 1.35 }}>{d.aviso.cuerpo}</span>
          <span style={{ display: 'block', fontSize: 11, color: SUAVE, marginTop: 3 }}>ahora</span>
        </span>
        {!leido && <span style={{ width: 8, height: 8, borderRadius: 99, background: AZUL, marginTop: 6, flexShrink: 0 }} />}
      </div>
      {(d.viejos ?? AVISOS_VIEJOS).map(({ glifo: g, fondo: bg, color: c, titulo, cuerpo, cuando }) => (
        <div key={titulo} style={{ display: 'flex', gap: 10, padding: '11px 14px', borderBottom: '1px solid #F8FAFC' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: bg, color: c, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{g}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: TINTA, lineHeight: 1.35 }}>{titulo}</span>
            {cuerpo && <span style={{ display: 'block', fontSize: 12, color: GRIS, marginTop: 2, lineHeight: 1.35 }}>{cuerpo}</span>}
            <span style={{ display: 'block', fontSize: 11, color: SUAVE, marginTop: 3 }}>{cuando}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

const Barra: FC<{ campana?: DatosCampana }> = ({ campana }) => (
  <div style={{ position: 'absolute', left: SIDE, right: 0, top: 0, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '0 20px', background: '#fff', borderBottom: '1px solid #e2e8f0', boxSizing: 'border-box', zIndex: 60 }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0', background: '#fff', color: TINTA, boxSizing: 'border-box' }}>
      <Moon size={17} />
    </div>
    <Campanita d={campana} />
  </div>
);

/**
 * El panel del entrenador (página de 1440) con «Usuarios» activo: el contenido va desplazado `scroll`; lo de `encima`
 * (ventanas) queda fijo. `activo` marca otro enlace del menú ('' = ninguno, como en una invitación a torneo);
 * `hoverEn` / `hover` iluminan un enlace con el mouse encima.
 */
export const MarcoUsuarios: FC<{ tn: Tonos; vh: number; scroll?: number; resalteMenu?: number; campana?: DatosCampana; activo?: string; hoverEn?: string; hover?: number; menu?: ReactNode; children?: ReactNode; encima?: ReactNode }> = ({ tn, vh, scroll = 0, resalteMenu, campana, activo = 'Usuarios', hoverEn, hover, menu, children, encima }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, height: vh, overflow: 'hidden', background: '#F6F8FB', fontFamily: instrument, color: TINTA, lineHeight: 1.5 }}>
    <div style={{ position: 'absolute', left: 0, top: -scroll, width: ANCHO_U }}>{children}</div>
    <Barra campana={campana} />
    {menu ?? <MenuEntrenadorPC tn={tn} vh={vh} activo={activo} resalte={resalteMenu} hoverEn={hoverEn} hover={hover} />}
    {campana && <ListaAvisos d={campana} />}
    {encima}
  </div>
);

// =============================================================================================================
// La página Usuarios
// =============================================================================================================

export type DatosUsuarios = {
  tab: 'miembros' | 'solicitudes';
  /** Solicitudes pendientes (la burbuja roja). */
  pendientes: number;
  miembros: MiembroU[];
  filtros: FiltrosU;
  categorias: CatId[];
  /** El chip nuevo aparece (0 → 1). */
  chipNuevo?: number;
  buscando?: boolean;
  seleccion?: string[];
  /** Fila con el mouse encima (índice en la lista filtrada). */
  filaHover?: number | null;
  /** Fila con el `⋯` iluminado. */
  puntosHover?: number | null;
  hover?: Partial<Record<'crear' | 'invitar' | 'importar' | 'exportar' | 'miembros' | 'solicitudes' | 'estado0' | 'estado1' | 'estado2' | 'estado3' | 'sede1' | 'chip2' | 'chip3', number>>;
  apretar?: Partial<Record<'crear' | 'invitar' | 'importar' | 'exportar' | 'miembros' | 'solicitudes' | 'sede1' | 'chip2' | 'chip3' | 'estado2', number>>;
  resalte?: Partial<Record<'menu' | 'header' | 'chips' | 'invitar' | 'tabla' | 'estado1' | 'estado2' | 'estado3' | 'filaSedes' | 'buscar' | 'burbuja' | 'crear' | 'importar' | 'exportar', number>>;
  /** Resalte de la insignia de estado o de categoría de una fila (por id del miembro). */
  resalteEstado?: { id: string; t: number };
  resalteCategoria?: { id: string; t: number };
  /** Filas que entran (id → 0..1). */
  entra?: Record<string, number>;
  solicitud?: DatosSolicitudes;
  /** El jugador que se lesionó aparece con la etiqueta «🩹 Lesionado». */
  lesionados?: string[];
};

const ContenidoUsuarios: FC<{ d: DatosUsuarios; tn: Tonos; marca: string }> = ({ d, tn, marca }) => {
  const r = d.resalte ?? {};
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  return (
    <>
      {/* Encabezado (PageHeader) */}
      <div style={{ position: 'absolute', left: U.header.x, top: U.header.y, width: U.header.ancho, height: U.header.alto, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 16, boxShadow: anillo(r.header) ?? '0 1px 2px rgba(15,23,42,0.04)', boxSizing: 'border-box', padding: '16px 20px', display: 'flex', gap: 12 }}>
        <span style={{ width: 4, borderRadius: 99, background: tn.b600, flexShrink: 0 }} />
        <div style={{ paddingTop: 2 }}>
          <h1 style={{ margin: 0, fontFamily: schibsted, fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em' }}>Usuarios</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: GRIS, lineHeight: 1.43 }}>Gestiona a todos los miembros de tu escuela de fútbol</p>
        </div>
      </div>

      {/* Pestañas Miembros / Solicitudes */}
      <div style={{ position: 'absolute', left: X0, top: 186, width: 230, height: 42, padding: 4, borderRadius: 12, background: '#EEF2F7', display: 'flex', gap: 4, boxSizing: 'border-box' }}>
        {(['miembros', 'solicitudes'] as const).map((k) => {
          const on = d.tab === k;
          return (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, width: k === 'miembros' ? 86 : d.pendientes > 0 ? 128 : 104, borderRadius: 9, fontSize: 13, fontWeight: 600, background: on ? '#fff' : (h[k] ?? 0) > 0 ? `rgba(255,255,255,${0.5 * (h[k] ?? 0)})` : 'transparent', color: on ? TINTA : GRIS, boxShadow: on ? '0 1px 3px rgba(15,23,42,0.08)' : 'none', transform: hundir(a[k]) }}>
              {k === 'miembros' ? 'Miembros' : 'Solicitudes'}
              {k === 'solicitudes' && d.pendientes > 0 && (
                <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', boxSizing: 'border-box', boxShadow: anillo(r.burbuja), transform: `scale(${1 + 0.3 * (r.burbuja ?? 0)})` }}>{d.pendientes}</span>
              )}
            </span>
          );
        })}
      </div>

      {d.tab === 'solicitudes' ? (
        <PanelSolicitudes d={d.solicitud ?? {}} marca={marca} />
      ) : (
        <>
          <BarraHerramientas d={d} marca={marca} />
          <TarjetaFiltros d={d} />
          <Tabla d={d} />
        </>
      )}
    </>
  );
};

const BarraHerramientas: FC<{ d: DatosUsuarios; marca: string }> = ({ d, marca }) => {
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const r = d.resalte ?? {};
  const boton = (k: 'exportar' | 'importar' | 'crear', icono: ReactNode, texto: string) => (
    <span key={k} style={{ ...btnBase, position: 'absolute', left: U[k].x, top: U[k].y, width: U[k].ancho, height: U[k].alto, background: (h[k] ?? 0) > 0 ? `rgba(248,250,252,${h[k]})` : '#fff', borderColor: (h[k] ?? 0) > 0.5 ? '#CBD5E1' : LINEA, transform: hundir(a[k]), boxShadow: anillo(r[k]) }}>
      {icono} {texto}
    </span>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: U.toolbar.x, top: U.toolbar.y, width: U.toolbar.ancho, height: U.toolbar.alto, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 12, boxSizing: 'border-box' }} />
      <div style={{ ...campo(d.buscando, 40), position: 'absolute', left: U.buscar.x, top: U.buscar.y, width: U.buscar.ancho, paddingLeft: 38, background: d.buscando ? '#fff' : '#FAFBFC', boxShadow: anillo(r.buscar) ?? (d.buscando ? '0 0 0 3px rgba(59,130,246,0.1)' : undefined) }}>
        <Search size={16} color={SUAVE} style={{ position: 'absolute', left: 12 }} />
        <Escrito valor={d.filtros.buscar} ejemplo="Buscar por nombre o correo..." foco={d.buscando} />
      </div>
      <div style={{ position: 'absolute', left: U.vista.x, top: U.vista.y, width: U.vista.ancho, height: U.vista.alto, background: '#F1F5F9', borderRadius: 8, padding: 3, display: 'flex', gap: 2, boxSizing: 'border-box' }}>
        {[
          ['Kanban', <LayoutDashboard key="k" size={14} />, false],
          ['Tabla', <List key="t" size={14} />, true],
        ].map(([t, ic, on]) => (
          <span key={t as string} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: on ? '#fff' : 'transparent', color: on ? TINTA : GRIS, boxShadow: on ? '0 1px 2px rgba(15,23,42,0.04)' : 'none' }}>
            {ic}
            {t}
          </span>
        ))}
      </div>
      {boton('exportar', <Download size={14} />, 'Exportar')}
      {boton('importar', <Upload size={14} />, 'Importar')}
      {boton('crear', <Plus size={14} />, 'Crear categoría')}
      <span style={{ ...btnBase, position: 'absolute', left: U.invitar.x, top: U.invitar.y, width: U.invitar.ancho, height: U.invitar.alto, background: marca, color: '#fff', border: `1px solid ${marca}`, filter: (h.invitar ?? 0) > 0 ? `brightness(${1 - 0.1 * (h.invitar ?? 0)})` : undefined, transform: hundir(a.invitar), boxShadow: anillo(r.invitar) }}>
        <Mail size={14} /> Invitar usuario
      </span>
    </>
  );
};

const TARJETAS_ESTADO: { id: EstadoU | null; label: string; dot: string; tone: string }[] = [
  { id: null, label: 'Todos', dot: '#475569', tone: '#64748B' },
  { id: 'ACTIVE', label: 'Activos', dot: '#10B981', tone: '#047857' },
  { id: 'PENDING', label: 'Invitados', dot: '#F59E0B', tone: '#B45309' },
  { id: 'SUSPENDED', label: 'Suspendidos', dot: '#EF4444', tone: '#DC2626' },
];

const TarjetaFiltros: FC<{ d: DatosUsuarios }> = ({ d }) => {
  const f = d.filtros;
  const r = d.resalte ?? {};
  const h = d.hover ?? {};
  const a = d.apretar ?? {};
  const resultado = filtrarMiembros(d.miembros, f).length;
  const paraEstado = d.miembros.filter((x) => pasa(x, { ...f, buscar: '' }, 'estado'));
  const paraSede = d.miembros.filter((x) => pasa(x, { ...f, buscar: '' }, 'sede'));
  const paraCat = d.miembros.filter((x) => pasa(x, { ...f, buscar: '' }, 'cat'));
  const total = paraEstado.length;
  const cuenta = (s: EstadoU | null) => (s ? paraEstado.filter((x) => x.estado === s).length : total);
  const parte = (s: EstadoU) => (total > 0 ? (cuenta(s) / total) * 100 : 0);
  const k = (s: string) => s as keyof NonNullable<DatosUsuarios['hover']>;
  return (
    <div style={{ position: 'absolute', left: U.tarjeta.x, top: U.tarjeta.y, width: U.tarjeta.ancho, height: U.tarjeta.alto, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.05)', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', left: 24, top: 24 }}>
        <h2 style={{ margin: 0, fontFamily: schibsted, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: TINTA }}>Jugadores</h2>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: GRIS, lineHeight: 1.5 }}>
          {resultado} {resultado === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>
      <span style={{ position: 'absolute', right: 24, top: 24, display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 99, background: '#0F172A', color: '#fff', fontSize: 13, fontWeight: 600, opacity: f.cat ? 1 : 0.4 }}>
        <Pencil size={13} /> Editar categoría
      </span>

      {/* Tarjetas de estado */}
      {TARJETAS_ESTADO.map((s, i) => {
        const r0 = U.estado(i);
        const on = f.estado === s.id;
        const segs = (s.id ? [s] : TARJETAS_ESTADO.slice(1)).map((c) => ({ color: c.dot, w: parte(c.id!) }));
        const hv = h[k(`estado${i}`)] ?? 0;
        return (
          <div key={s.label} style={{ position: 'absolute', left: r0.x - U.tarjeta.x, top: r0.y - U.tarjeta.y, width: r0.ancho, height: r0.alto, boxSizing: 'border-box', borderRadius: 16, border: `2px solid ${on ? '#475569' : 'transparent'}`, background: on ? '#fff' : hv > 0 ? '#EAEFF6' : '#F4F7FB', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: anillo((r as Record<string, number>)[`estado${i}`]), transform: hundir((a as Record<string, number>)[`estado${i}`]) }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#334155', lineHeight: 1.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: s.dot }} />
              {s.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.025em', color: TINTA }}>{cuenta(s.id)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.tone }}>{s.id ? `${Math.round(parte(s.id))}%` : 'miembros'}</span>
            </span>
            <span style={{ marginTop: 4, display: 'flex', height: 6, gap: 2, borderRadius: 99, overflow: 'hidden', background: 'rgba(226,232,240,0.7)' }}>
              {segs.map((g) => g.w > 0 && <span key={g.color} style={{ width: `${g.w}%`, height: '100%', borderRadius: 99, background: g.color, flexShrink: 0 }} />)}
            </span>
          </div>
        );
      })}

      {/* Sede */}
      <p style={{ position: 'absolute', left: 24, top: 549 - U.tarjeta.y, margin: 0, fontSize: 12, fontWeight: 600, color: GRIS, lineHeight: '16px' }}>Sede</p>
      <div style={{ position: 'absolute', left: 24, top: 573 - U.tarjeta.y, height: 40, padding: 4, gap: 4, borderRadius: 99, background: '#EEF2F7', display: 'flex', boxSizing: 'border-box', boxShadow: anillo(r.filaSedes) }}>
        {[{ id: null, nombre: 'Todas las sedes' }, ...SEDES_U].map((v, i) => {
          const on = f.sede === v.id;
          const hv = i === 1 ? (h.sede1 ?? 0) : 0;
          return (
            <span key={v.nombre} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: U.sede(i).ancho, height: 32, borderRadius: 99, fontSize: 13, fontWeight: 600, background: on ? '#fff' : 'transparent', color: on || hv > 0.5 ? TINTA : '#475569', boxShadow: on ? '0 1px 3px rgba(15,23,42,0.1)' : 'none', transform: hundir(i === 1 ? a.sede1 : 0) }}>
              {v.nombre}
              <span style={{ fontSize: 12, fontWeight: 500, color: on ? '#334155' : GRIS }}>{v.id ? paraSede.filter((x) => x.sede === v.id).length : paraSede.length}</span>
            </span>
          );
        })}
      </div>

      {/* Categoría */}
      <p style={{ position: 'absolute', left: 24, top: 633 - U.tarjeta.y, margin: 0, fontSize: 12, fontWeight: 600, color: GRIS, lineHeight: '16px' }}>Categoría</p>
      <div style={{ position: 'absolute', left: 24, top: 657 - U.tarjeta.y, height: 35, boxShadow: anillo(r.chips), borderRadius: 10 }}>
        {[null, ...d.categorias].map((id, i) => {
          const c = catU(id);
          const n = id ? paraCat.filter((x) => x.cat === id).length : paraCat.length;
          const on = f.cat === id;
          const vacio = n === 0 && !on;
          const r0 = U.chip(i);
          const nuevo = id === 'sub13' ? (d.chipNuevo ?? 1) : 1;
          const hv = (h as Record<string, number>)[`chip${i}`] ?? 0;
          return (
            <span key={id ?? 'todas'} style={{ position: 'absolute', left: r0.x - U.filaChips.x, top: 0, width: r0.ancho, height: 35, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 10, border: `1.5px ${vacio ? 'dashed' : 'solid'} ${on ? '#64748B' : vacio ? '#E2E8F0' : 'transparent'}`, background: on ? '#fff' : vacio ? 'transparent' : hv > 0 ? '#EAEFF6' : '#F4F7FB', fontSize: 13, fontWeight: 600, color: vacio ? SUAVE : '#1E293B', opacity: nuevo, transform: `scale(${0.6 + 0.4 * nuevo}) ${hundir((a as Record<string, number>)[`chip${i}`]) ?? ''}`, whiteSpace: 'nowrap' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c?.color ?? '#94A3B8', opacity: vacio ? 0.4 : 1, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{c?.nombre ?? 'Todas las categorías'}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: vacio ? '#CBD5E1' : GRIS }}>{n}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Tabla: FC<{ d: DatosUsuarios }> = ({ d }) => {
  const filas = filtrarMiembros(d.miembros, d.filtros);
  const sel = new Set(d.seleccion ?? []);
  const todas = filas.length > 0 && filas.every((x) => sel.has(x.id));
  const titulos = ['', 'Usuario', 'Correo', 'Categoría', 'Sede', 'Estado', 'Última sesión', 'Registrado', ''];
  const alto = U.cabeza + Math.max(1, filas.length) * U.fila + 2;
  return (
    <div style={{ position: 'absolute', left: X0, top: U.tabla, width: AW, height: alto, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: anillo(d.resalte?.tabla) ?? '0 1px 2px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', height: U.cabeza, background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
        {titulos.map((t, i) => (
          <div key={i} style={{ width: COLS[i], padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUAVE, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
            {i === 0 ? <Casilla on={todas} /> : t}
          </div>
        ))}
      </div>
      {filas.length === 0 ? (
        <div style={{ height: U.fila, display: 'grid', placeItems: 'center', fontSize: 13, color: GRIS }}>Sin resultados para tu búsqueda.</div>
      ) : (
        filas.map((x, i) => <FilaTabla key={x.id} x={x} sel={sel.has(x.id)} hover={d.filaHover === i} puntos={d.puntosHover === i} d={d} />)
      )}
    </div>
  );
};

const Casilla: FC<{ on: boolean }> = ({ on }) => (
  <span style={{ width: 16, height: 16, borderRadius: 2, display: 'inline-grid', placeItems: 'center', border: `1px solid ${on ? AZUL : '#CBD5E1'}`, background: on ? AZUL : '#fff', boxSizing: 'border-box' }}>{on && <Check size={10} color="#fff" strokeWidth={3} />}</span>
);

const FilaTabla: FC<{ x: MiembroU; sel: boolean; hover: boolean; puntos: boolean; d: DatosUsuarios }> = ({ x, sel, hover, puntos, d }) => {
  const nombre = x.nombre || x.correo;
  const entra = d.entra?.[x.id] ?? 1;
  const lesion = !!x.lesion || d.lesionados?.includes(x.id);
  const celda = (i: number, contenido: ReactNode, extra: CSSProperties = {}) => (
    <div style={{ width: COLS[i], padding: '0 16px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', ...extra }}>{contenido}</div>
  );
  return (
    <div style={{ display: 'flex', height: U.fila, borderBottom: '1px solid #E2E8F0', boxSizing: 'border-box', background: sel ? (hover ? '#E0F2FE' : '#F0F9FF') : hover ? '#F8FAFC' : entra < 1 ? `rgba(220,252,231,${1 - entra})` : '#fff', opacity: 0.3 + 0.7 * entra }}>
      {celda(0, <Casilla on={sel} />)}
      {celda(
        1,
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar nombre={nombre} tam={32} letra={11} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: TINTA, display: 'flex', alignItems: 'center', gap: 6, lineHeight: '20px', whiteSpace: 'nowrap' }}>
              {x.nombre || '—'}
              {lesion && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', lineHeight: '14px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Curita tam={11} />
                  Lesionado
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: GRIS, marginTop: 2, lineHeight: '16px' }}>{x.invitacion ? 'Invitado' : 'Jugador'}</div>
          </div>
        </div>,
      )}
      {celda(2, <span style={{ fontFamily: jetbrains, fontSize: 12, color: TINTA, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.correo}</span>)}
      {celda(3, <InsigniaCategoria cat={x.cat} resalte={d.resalteCategoria?.id === x.id ? d.resalteCategoria.t : 0} />)}
      {celda(4, x.sede ? <span style={{ fontSize: 13, color: TINTA, whiteSpace: 'nowrap' }}>{nombreSede(x.sede)}</span> : <span style={{ color: SUAVE, fontSize: 13 }}>Por asignar</span>)}
      {celda(5, <InsigniaEstado estado={x.estado} resalte={d.resalteEstado?.id === x.id ? d.resalteEstado.t : 0} />)}
      {celda(6, <span style={{ fontSize: 13, color: GRIS }}>{x.ultima ?? '—'}</span>)}
      {celda(7, <span style={{ fontSize: 13, color: GRIS }}>{x.registrado}</span>)}
      {celda(
        8,
        <span style={{ width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', color: SUAVE, background: puntos ? '#F1F5F9' : 'transparent', marginLeft: -2 }}>
          <MoreVertical size={16} />
        </span>,
        { padding: '0 14px' },
      )}
    </div>
  );
};

// =============================================================================================================
// El menú «⋯» de una fila y su submenú de categorías (TableView.tsx → SharedMenu)
// =============================================================================================================

export type ItemMenu = 'ver' | 'mover' | 'norte' | 'principal' | 'copiar' | 'suspender' | 'mensaje' | 'eliminar';
const ITEMS_MENU: ItemMenu[] = ['ver', 'mover', 'norte', 'principal', 'copiar', 'suspender', 'mensaje', 'eliminar'];
/** Alto de cada cosa del menú, en orden: cabecera, ítems, separadores y rótulos. */
const ALTOS_MENU = { cabeza: 47 + 6, item: 36, sep: 13, rotulo: 22 };
/** Dónde queda cada ítem del menú abierto bajo el `⋯` de la fila `fila`. */
export const menuFila = (fila: number) => {
  const p = FILA.puntos(fila);
  const x = p.x + p.ancho - 240;
  const y = p.y + p.alto + 4;
  let cy = y + 6 + ALTOS_MENU.cabeza;
  const pos: Record<string, number> = {};
  const it = (k: ItemMenu) => {
    pos[k] = cy;
    cy += ALTOS_MENU.item;
  };
  it('ver');
  it('mover');
  cy += ALTOS_MENU.sep + ALTOS_MENU.rotulo;
  it('norte');
  it('principal');
  cy += ALTOS_MENU.sep;
  it('copiar');
  cy += ALTOS_MENU.sep + ALTOS_MENU.rotulo;
  it('suspender');
  it('mensaje');
  cy += ALTOS_MENU.sep;
  it('eliminar');
  const alto = cy + 6 - y;
  return {
    x,
    y,
    alto,
    item: (k: ItemMenu) => caja(x + 6, pos[k], 228, ALTOS_MENU.item),
    sub: caja(x + 6 - 266, pos.mover, 260, 6 + 42 + 3 * 34 + 8),
    subItem: (i: number) => caja(x + 6 - 266 + 10, pos.mover + 6 + 42 + 2 + i * 34, 240, 32),
  };
};

export type DatosMenuFila = { fila: number; miembro: MiembroU; t: number; hover?: ItemMenu | null; apretar?: number; sub?: number; subHover?: number | null; resalte?: Partial<Record<ItemMenu, number>> };

export const MenuFila: FC<{ d: DatosMenuFila }> = ({ d }) => {
  if (d.t <= 0) return null;
  const L = menuFila(d.fila);
  const x = d.miembro;
  const c = catU(x.cat);
  const susp = x.estado === 'SUSPENDED';
  const item = (k: ItemMenu, icono: ReactNode, texto: ReactNode, extra: CSSProperties = {}, derecha?: ReactNode) => {
    const on = d.hover === k;
    const peligro = k === 'eliminar';
    return (
      <div key={k} style={{ height: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap', color: peligro ? '#B91C1C' : TINTA, background: on ? (peligro ? '#FEF2F2' : '#F1F5F9') : 'transparent', boxShadow: anillo(d.resalte?.[k]), transform: on ? hundir(d.apretar) : undefined, boxSizing: 'border-box', ...extra }}>
        <span style={{ width: 16, display: 'grid', placeItems: 'center', color: peligro ? '#B91C1C' : GRIS, flexShrink: 0 }}>{icono}</span>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between', minWidth: 0 }}>{texto}</span>
        {derecha}
      </div>
    );
  };
  const sep = <div style={{ height: 1, background: LINEA, margin: '6px 4px' }} />;
  const rotulo = (t: string) => <div style={{ height: 22, fontSize: 10, fontWeight: 600, color: SUAVE, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', boxSizing: 'border-box' }}>{t}</div>;
  const svg = (p: ReactNode) => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {p}
    </svg>
  );
  const pin = svg(
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>,
  );
  return (
    <>
      <div style={{ position: 'absolute', left: L.x, top: L.y, width: 240, padding: 6, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 10, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', zIndex: 95, boxSizing: 'border-box', opacity: Math.min(1, d.t * 1.5), transform: `translateY(${(1 - d.t) * -6}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 10px', borderBottom: `1px solid ${LINEA}`, marginBottom: 6, height: 47, boxSizing: 'border-box' }}>
          <Avatar nombre={x.nombre || x.correo} tam={28} letra={10} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TINTA, lineHeight: 1.2 }}>{x.nombre || '—'}</div>
            <div style={{ fontSize: 11, color: GRIS, lineHeight: 1.2, marginTop: 1 }}>{x.correo}</div>
          </div>
        </div>
        {item(
          'ver',
          svg(
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>,
          ),
          'Ver perfil',
        )}
        {item(
          'mover',
          svg(
            <>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </>,
          ),
          <>
            <span>Mover a categoría</span>
            {c && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: GRIS, fontWeight: 500, padding: '1px 6px 1px 5px', borderRadius: 4, background: '#F1F5F9' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color }} />
                {c.nombre}
              </span>
            )}
          </>,
          {},
          <span style={{ color: SUAVE, fontSize: 10 }}>›</span>,
        )}
        {sep}
        {rotulo('Sede')}
        {SEDES_U.map((s) =>
          item(s.id, pin, s.nombre, { color: x.sede === s.id ? '#1D4ED8' : TINTA, fontWeight: x.sede === s.id ? 500 : 400 }, x.sede === s.id ? <Check size={12} color={AZUL} /> : null),
        )}
        {sep}
        {item(
          'copiar',
          svg(
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </>,
          ),
          'Copiar correo',
        )}
        {sep}
        {rotulo('Estado')}
        {item(
          'suspender',
          susp
            ? svg(
                <>
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </>,
              )
            : svg(
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>,
              ),
          susp ? 'Reactivar acceso' : 'Suspender acceso',
        )}
        {item(
          'mensaje',
          svg(
            <>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </>,
          ),
          'Enviar mensaje',
        )}
        {sep}
        {item('eliminar', <Trash2 size={14} />, 'Eliminar usuario')}
      </div>
      {(d.sub ?? 0) > 0 && (
        <div style={{ position: 'absolute', left: L.sub.x, top: L.sub.y, width: 260, padding: 6, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 10, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', zIndex: 96, boxSizing: 'border-box', opacity: Math.min(1, (d.sub ?? 0) * 1.5) }}>
          <div style={{ padding: 6, position: 'relative' }}>
            <Search size={13} color={SUAVE} style={{ position: 'absolute', left: 16, top: 17 }} />
            <div style={{ height: 30, padding: '0 10px 0 30px', fontSize: 12, border: '1px solid #3B82F6', borderRadius: 6, background: '#fff', color: SUAVE, display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
              <Cursor alto={14} />
              Buscar categoría…
            </div>
          </div>
          <div style={{ padding: '2px 4px 4px' }}>
            {CATEGORIAS_U.map((k, i) => {
              const actual = x.cat === k.id;
              return (
                <div key={k.id} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', borderRadius: 6, fontSize: 13, background: actual ? '#EFF6FF' : d.subHover === i ? '#F1F5F9' : 'transparent', color: actual ? '#1D4ED8' : TINTA, fontWeight: actual ? 500 : 400, boxSizing: 'border-box', marginTop: i ? 2 : 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: k.color, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{k.nombre}</span>
                  {actual && <Check size={12} color={AZUL} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// =============================================================================================================
// Crear categoría (CategoryModal.tsx)
// =============================================================================================================

const CAT_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#64748B'];
const ALTO_CATEGORIA = CABEZA + 88 + 76 + 72 + 76 + 76 + 104 + 76 + 76 + 70;
export const CATEGORIA_V = (vh: number) => {
  const r = ventanaCentrada(vh, 540, ALTO_CATEGORIA);
  const bx = r.x + 24;
  const by = r.y + CABEZA;
  const half = (540 - 48 - 12) / 2;
  return {
    r,
    preview: caja(bx, by, 492, 72),
    nombre: caja(bx, by + 88 + 24, half, 38),
    codigo: caja(bx + half + 12, by + 88 + 24, half, 38),
    color: (i: number) => caja(bx + i * 40, by + 164 + 24, 32, 32),
    filaColor: caja(bx, by + 164, 492, 56),
    edadMin: caja(bx, by + 236 + 24, half, 38),
    edadMax: caja(bx + half + 12, by + 236 + 24, half, 38),
    genero: caja(bx, by + 312 + 24, half, 38),
    capacidad: caja(bx + half + 12, by + 312 + 24, half, 38),
    sedes: caja(bx, by + 388, 492, 88),
    crear: caja(r.x + 540 - 24 - 150, r.y + ALTO_CATEGORIA - 70 + 16, 150, 38),
  };
};
export type DatosCategoria = {
  t: number;
  nombre: string;
  codigo: string;
  color: string;
  edadMin: string;
  edadMax: string;
  capacidad: string;
  foco?: 'nombre' | 'codigo' | 'edadMin' | 'edadMax' | 'capacidad' | null;
  hover?: { crear?: number; color?: number };
  apretar?: { crear?: number; color?: number };
  resalte?: Partial<Record<'color' | 'genero' | 'sedes' | 'preview' | 'capacidad', number>>;
  creando?: boolean;
};
export const VentanaCategoria: FC<{ d: DatosCategoria; vh: number }> = ({ d, vh }) => {
  const L = CATEGORIA_V(vh);
  const prev = d.codigo || (d.nombre ? d.nombre.slice(0, 3).toUpperCase() : 'S??');
  const half = L.nombre.ancho;
  const fila = (izq: ReactNode, der: ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: `${half}px ${half}px`, gap: 12, height: 60, marginBottom: 16 }}>
      {izq}
      {der}
    </div>
  );
  const input = (label: ReactNode, valor: string, ejemplo: string, foco: boolean, resalte = 0) => (
    <div>
      <label style={etiqueta}>{label}</label>
      <div style={{ ...campo(foco), boxShadow: anillo(resalte) ?? campo(foco).boxShadow }}>
        <Escrito valor={valor} ejemplo={ejemplo} foco={foco} />
      </div>
    </div>
  );
  return (
    <Ventana r={L.r} t={d.t}>
      <Cabeza titulo="Crear nueva categoría" sub="Define los parámetros de la categoría deportiva." />
      <div style={{ padding: '0 24px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, height: 72, boxSizing: 'border-box', background: '#FAFBFC', border: `1px solid ${LINEA}`, borderRadius: 10, marginBottom: 16, boxShadow: anillo(d.resalte?.preview) }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center', background: `${d.color}15`, color: d.color, fontWeight: 700, fontSize: 14 }}>{prev}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{d.nombre || 'Nombre de la categoría'}</div>
            <div style={{ fontSize: 11, color: GRIS, marginTop: 2 }}>{(d.edadMin && d.edadMax ? `${d.edadMin}–${d.edadMax} años` : 'Vista previa') + ' · Masculino'}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${d.color}33`, background: `${d.color}15`, color: d.color }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
            {d.nombre || 'Nueva'}
          </span>
        </div>
        {fila(
          input(
            <>
              Nombre <span style={{ color: '#B91C1C' }}>*</span>
            </>,
            d.nombre,
            'Ej. Sub-13',
            d.foco === 'nombre',
          ),
          input('Código corto', d.codigo, 'S13', d.foco === 'codigo'),
        )}
        <div style={{ height: 56, marginBottom: 16, borderRadius: 8, boxShadow: anillo(d.resalte?.color) }}>
          <label style={etiqueta}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {CAT_COLORS.map((c) => (
              <span key={c} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${d.color === c ? TINTA : 'transparent'}`, background: c, display: 'grid', placeItems: 'center', boxSizing: 'border-box', transform: c === '#3B82F6' ? hundir(d.apretar?.color) : undefined }}>
                {d.color === c && <Check size={14} color="#fff" strokeWidth={3} />}
              </span>
            ))}
          </div>
        </div>
        {fila(input('Edad mínima', d.edadMin, '12', d.foco === 'edadMin'), input('Edad máxima', d.edadMax, '13', d.foco === 'edadMax'))}
        {fila(
          <div>
            <label style={etiqueta}>Género</label>
            <div style={{ ...campo(false), justifyContent: 'space-between', boxShadow: anillo(d.resalte?.genero) }}>
              Masculino <ChevronDown size={14} color={GRIS} />
            </div>
          </div>,
          input('Capacidad máxima', d.capacidad, '25', d.foco === 'capacidad', d.resalte?.capacidad),
        )}
        <div style={{ height: 88, marginBottom: 16, borderRadius: 8, boxShadow: anillo(d.resalte?.sedes) }}>
          <label style={etiqueta}>Sedes donde se ofrece</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Todas las sedes', ...SEDES_U.map((s) => s.nombre)].map((s, i) => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: `1px solid ${i === 0 ? '#3B82F6' : LINEA}`, background: i === 0 ? '#EFF6FF' : '#fff', color: i === 0 ? '#1D4ED8' : '#334155', boxSizing: 'border-box' }}>
                {i === 0 && <Check size={12} strokeWidth={3} />}
                {s}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: GRIS, margin: '6px 0 0' }}>Se ofrece en todas las sedes, también en las que crees después.</p>
        </div>
        <div style={{ height: 60, marginBottom: 16 }}>
          <label style={etiqueta}>Descripción</label>
          <div style={campo(false)}>
            <span style={{ color: SUAVE }}>Notas internas (opcional)</span>
          </div>
        </div>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#FAFBFC', borderRadius: 8, border: `1px solid ${LINEA}`, boxSizing: 'border-box' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Categoría activa</div>
            <div style={{ fontSize: 11, color: GRIS, marginTop: 2 }}>Visible para asignar usuarios</div>
          </div>
          <span style={{ width: 38, height: 22, borderRadius: 11, background: AZUL, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, left: 18, width: 18, height: 18, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </span>
        </div>
      </div>
      <Pie>
        <BotonSecundario>Cancelar</BotonSecundario>
        <BotonPrimario ancho={150} hover={d.hover?.crear} apretar={d.apretar?.crear}>
          <Plus size={14} /> {d.creando ? 'Creando…' : 'Crear categoría'}
        </BotonPrimario>
      </Pie>
    </Ventana>
  );
};

// =============================================================================================================
// Invitar nuevo miembro (InviteModal.tsx) y las confirmaciones (ConfirmDialog)
// =============================================================================================================

const ALTO_INVITAR = CABEZA + 4 + 76 + 76 + 102 + 84 + 148 + 76 + 70;
/** Alto del aviso «Este correo ya está asociado…» bajo el correo (con su margen de 6). */
export const ALTO_AVISO_CORREO = 74;
/** `aviso` (0 → 1): el aviso del correo repetido abierto; empuja todo lo de abajo y la ventana crece. */
export const INVITAR_V = (vh: number, aviso = 0) => {
  const extra = ALTO_AVISO_CORREO * aviso;
  const alto = ALTO_INVITAR + extra;
  const r = ventanaCentrada(vh, 480, alto);
  const bx = r.x + 24;
  const by = r.y + CABEZA + 4;
  const half = (480 - 48 - 12) / 2;
  const h8 = (432 - 8) / 2;
  const ySede = by + 76 + 76 + 102 + 84 + extra;
  const yCat = ySede + 148;
  return {
    r,
    correo: caja(bx, by + 24, 432, 38),
    aviso: caja(bx, by + 24 + 38 + 6, 432, ALTO_AVISO_CORREO - 6),
    nombre: caja(bx, by + 76 + 24 + extra, half, 38),
    apellido: caja(bx + half + 12, by + 76 + 24 + extra, half, 38),
    rol: caja(bx, by + 152 + 24 + extra, 432, 62),
    sede: (i: number) => (i < 2 ? caja(bx + i * (h8 + 8), ySede + 24, h8, 50) : caja(bx, ySede + 24 + 58, 432, 50)),
    categoria: caja(bx, yCat + 24, 432, 38),
    opcion: (i: number) => caja(bx, yCat + 24 + 40 + 4 + i * 30, 432, 30),
    enviar: caja(r.x + 480 - 24 - 160, r.y + alto - 70 + 16, 160, 38),
  };
};
export type DatosInvitar = {
  t: number;
  /** El aviso amarillo del correo que ya es de un jugador (0 → 1), como en InviteModal.tsx. */
  aviso?: number;
  /** El correo seleccionado (fondo azul), antes de reemplazarlo. */
  correoSeleccionado?: boolean;
  /** Qué sede se ilumina con `hover.sede` / `apretar.sede` (0 Sede Norte, 1 Sede principal). */
  sedeMarcada?: 0 | 1;
  correo: string;
  nombre: string;
  apellido: string;
  sede: SedeId | null | 'despues';
  categoria: CatId | null;
  /** La lista de categorías abierta (0 → 1) y la opción con el mouse. */
  lista?: number;
  listaHover?: number | null;
  foco?: 'correo' | 'nombre' | 'apellido' | null;
  hover?: { enviar?: number; sede?: number };
  apretar?: { enviar?: number; sede?: number; categoria?: number };
  resalte?: { rol?: number };
  enviando?: boolean;
};
const IconoPersona = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);
const IconoAcudiente = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <path d="M3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    <circle cx="17" cy="10" r="2" />
    <path d="M21 17v-.5a2.5 2.5 0 0 0-2.5-2.5h-1" />
  </svg>
);
const IconoPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconoDespues = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const Opcion: FC<{ on: boolean; icono: ReactNode; titulo: string; desc: string; alto?: number; hover?: number; apretar?: number; resalte?: number }> = ({ on, icono, titulo, desc, alto = 50, hover = 0, apretar = 0, resalte = 0 }) => (
  <div style={{ height: alto, border: `1px solid ${on ? '#3B82F6' : hover > 0.5 ? '#CBD5E1' : LINEA}`, borderRadius: 8, padding: '0 12px', display: 'flex', gap: 10, alignItems: 'center', background: on ? '#EFF6FF' : '#fff', boxSizing: 'border-box', transform: hundir(apretar), boxShadow: anillo(resalte), minWidth: 0 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', background: '#fff', border: `1px solid ${on ? '#3B82F6' : LINEA}`, color: on ? AZUL : GRIS, flexShrink: 0, boxSizing: 'border-box' }}>{icono}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: TINTA, lineHeight: 1.4 }}>{titulo}</div>
      <div style={{ fontSize: 10, color: GRIS, marginTop: 1, lineHeight: 1.3 }}>{desc}</div>
    </div>
  </div>
);
export const VentanaInvitar: FC<{ d: DatosInvitar; vh: number }> = ({ d, vh }) => {
  const av = d.aviso ?? 0;
  const L = INVITAR_V(vh, av);
  const half = L.nombre.ancho;
  const marcada = d.sedeMarcada ?? 0;
  const h8 = L.sede(0).ancho;
  const c = catU(d.categoria);
  const sedes = [
    { id: 'norte', titulo: 'Sede Norte', desc: '$ 60.000/mes · Bogotá', icono: <IconoPin /> },
    { id: 'principal', titulo: 'Sede principal', desc: '$ 70.000/mes · Bogotá', icono: <IconoPin /> },
    { id: 'despues', titulo: 'Asignar después', desc: 'Queda sin sede hasta que se la asignes desde la plantilla', icono: <IconoDespues /> },
  ];
  return (
    <Ventana r={L.r} t={d.t}>
      <Cabeza titulo="Invitar nuevo miembro" sub="Se enviará un correo con un enlace para activar la cuenta." />
      <div style={{ padding: '4px 24px 0', flex: 1, position: 'relative' }}>
        <div style={{ height: 60 + ALTO_AVISO_CORREO * av, marginBottom: 16, position: 'relative' }}>
          <label style={etiqueta}>Correo electrónico</label>
          <div style={campo(d.foco === 'correo')}>
            {d.correoSeleccionado ? (
              <span style={{ background: '#B4D5FE', color: TINTA, borderRadius: 2 }}>{d.correo}</span>
            ) : (
              <Escrito valor={d.correo} ejemplo="nombre@correo.com" foco={d.foco === 'correo'} />
            )}
          </div>
          {av > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6, padding: '8px 10px', borderRadius: 6, background: '#FFFBEB', border: '1px solid #FDE68A', height: ALTO_AVISO_CORREO - 6, boxSizing: 'border-box', opacity: Math.min(1, av * 1.5), overflow: 'hidden' }}>
              <Info size={13} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11.5, color: '#92400E', margin: 0, lineHeight: 1.4 }}>
                Este correo ya está asociado a la cuenta de un jugador. Si es otro estudiante (por ejemplo, un hermano o hermana), usa un correo distinto para su cuenta.
              </p>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `${half}px ${half}px`, gap: 12, height: 60, marginBottom: 16 }}>
          <div>
            <label style={etiqueta}>Nombre</label>
            <div style={campo(d.foco === 'nombre')}>
              <Escrito valor={d.nombre} ejemplo="Nombre" foco={d.foco === 'nombre'} />
            </div>
          </div>
          <div>
            <label style={etiqueta}>Apellido</label>
            <div style={campo(d.foco === 'apellido')}>
              <Escrito valor={d.apellido} ejemplo="Apellido" foco={d.foco === 'apellido'} />
            </div>
          </div>
        </div>
        <div style={{ height: 86, marginBottom: 16 }}>
          <label style={etiqueta}>Rol</label>
          <div style={{ display: 'grid', gridTemplateColumns: `${h8}px ${h8}px`, gap: 8, borderRadius: 8, boxShadow: anillo(d.resalte?.rol) }}>
            <Opcion on alto={62} icono={<IconoPersona />} titulo="Jugador" desc="Miembro del equipo" />
            <Opcion on={false} alto={62} icono={<IconoAcudiente />} titulo="Padre/Tutor" desc="Por si el jugador es menor de edad" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD',  marginBottom: 16, height: 68, boxSizing: 'border-box' }}>
          <Info size={14} color="#0284C7" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11.5, color: '#075985', margin: 0, lineHeight: 1.4 }}>Si el jugador es menor de edad, al completar su perfil se le pedirá la autorización de su acudiente antes de poder usar el resto de la plataforma.</p>
        </div>
        <div style={{ height: 132, marginBottom: 16 }}>
          <label style={etiqueta}>Sede</label>
          <div style={{ display: 'grid', gridTemplateColumns: `${h8}px ${h8}px`, gap: 8 }}>
            {sedes.map((s, i) => (
              <div key={s.id} style={{ gridColumn: i === 2 ? '1 / -1' : undefined }}>
                <Opcion on={d.sede === s.id} icono={s.icono} titulo={s.titulo} desc={s.desc} hover={i === marcada ? d.hover?.sede : 0} apretar={i === marcada ? d.apretar?.sede : 0} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 60, marginBottom: 16 }}>
          <label style={etiqueta}>Categoría deportiva</label>
          <div style={{ ...campo((d.lista ?? 0) > 0.5), justifyContent: 'space-between', transform: hundir(d.apretar?.categoria) }}>
            <span>{c?.nombre ?? 'Sub-10'}</span>
            <ChevronDown size={14} color={GRIS} />
          </div>
        </div>
      </div>
      <Pie>
        <BotonSecundario>Cancelar</BotonSecundario>
        <BotonPrimario ancho={160} hover={d.hover?.enviar} apretar={d.apretar?.enviar}>
          <Send size={14} /> {d.enviando ? 'Enviando…' : 'Enviar invitación'}
        </BotonPrimario>
      </Pie>
    </Ventana>
  );
};
/** La lista desplegable de «Categoría deportiva» (va encima de la ventana). */
export const ListaCategoriasInvitar: FC<{ d: DatosInvitar; vh: number }> = ({ d, vh }) => {
  const t = d.lista ?? 0;
  if (t <= 0 || d.t <= 0) return null;
  const L = INVITAR_V(vh, d.aviso ?? 0);
  const ops = ['Sin categoría', 'Sub-10', 'Sub-15', 'Sub-13'];
  return (
    <div style={{ position: 'absolute', left: L.opcion(0).x, top: L.opcion(0).y - 1, width: 432, background: '#fff', border: '1px solid #CBD5E1', borderRadius: 8, boxShadow: '0 12px 30px rgba(15,23,42,0.18)', zIndex: 140, overflow: 'hidden', opacity: Math.min(1, t * 1.6), padding: '4px 0' }}>
      {ops.map((o, i) => (
        <div key={o} style={{ height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 13, background: d.listaHover === i ? '#2563EB' : 'transparent', color: d.listaHover === i ? '#fff' : TINTA }}>{o}</div>
      ))}
    </div>
  );
};

export type DatosConfirmar = { t: number; titulo: string; mensaje: ReactNode; tipo: 'success' | 'danger' | 'default'; confirmar: string; cancelar?: string; hover?: number; apretar?: number; hoverCancelar?: number; apretarCancelar?: number };
export const CONFIRMAR_V = (vh: number, alto = 168) => {
  const r = ventanaCentrada(vh, 420, alto);
  return { r, confirmar: caja(r.x + 420 - 24 - 150, r.y + alto - 24 - 36, 150, 36), cancelar: caja(r.x + 420 - 24 - 150 - 8 - 92, r.y + alto - 24 - 36, 92, 36) };
};
export const Confirmacion: FC<{ d: DatosConfirmar; vh: number; alto?: number }> = ({ d, vh, alto = 168 }) => {
  if (d.t <= 0) return null;
  const L = CONFIRMAR_V(vh, alto);
  const ok = d.tipo === 'success';
  const peligro = d.tipo === 'danger';
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,23,42,${0.45 * Math.min(1, d.t * 1.5)})`, zIndex: 200 }} />
      <div style={{ position: 'absolute', left: L.r.x, top: L.r.y, width: 420, height: alto, background: '#fff', borderRadius: 14, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', padding: 24, boxSizing: 'border-box', zIndex: 201, opacity: Math.min(1, d.t * 1.6), transform: `scale(${0.97 + 0.03 * d.t})` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: ok ? '#F0FDF4' : peligro ? '#FEF2F2' : '#FEF3C7', color: ok ? '#15803D' : peligro ? '#B91C1C' : '#92400E' }}>{ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}</div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TINTA }}>{d.titulo}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: GRIS, lineHeight: 1.5 }}>{d.mensaje}</p>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 8 }}>
          {!ok && <span style={{ ...btnBase, height: 36, width: 92, padding: 0, background: (d.hoverCancelar ?? 0) > 0 ? '#F8FAFC' : '#fff', transform: hundir(d.apretarCancelar) }}>{d.cancelar ?? 'Cancelar'}</span>}
          <span style={{ ...btnBase, height: 36, minWidth: ok ? 92 : 150, padding: '0 16px', border: `1px solid ${ok ? '#BBF7D0' : peligro ? '#FECACA' : AZUL}`, background: ok ? '#16A34A' : peligro ? '#EF4444' : AZUL, color: '#fff', filter: (d.hover ?? 0) > 0 ? `brightness(${1 - 0.1 * (d.hover ?? 0)})` : undefined, transform: hundir(d.apretar) }}>{d.confirmar}</span>
        </div>
      </div>
    </>
  );
};
/** El botón «Aceptar» de una confirmación de éxito (un solo botón a la derecha). */
export const aceptarConfirmacion = (vh: number, alto = 168) => {
  const r = ventanaCentrada(vh, 420, alto);
  return caja(r.x + 420 - 24 - 92, r.y + alto - 24 - 36, 92, 36);
};

// =============================================================================================================
// Importar invitaciones (ImportModal.tsx)
// =============================================================================================================

const ALTO_IMPORTAR = (filas: boolean) => CABEZA + 4 + 152 + 14 + (filas ? 178 : 152) + 14 + (filas ? 36 + 6 * 33 + 14 : 0) + 70;
export const IMPORTAR_V = (vh: number, filas: boolean) => {
  const alto = ALTO_IMPORTAR(filas);
  const r = ventanaCentrada(vh, 540, alto);
  const bx = r.x + 24;
  const by = r.y + CABEZA + 4;
  return {
    r,
    paso1: caja(bx, by, 492, 152),
    descargar: caja(bx + 38 + 16, by + 98, 214, 38),
    paso2: caja(bx, by + 166, 492, filas ? 178 : 152),
    seleccionar: caja(bx + 38 + 16, by + 166 + 98, 180, 38),
    vista: caja(bx, by + 166 + 178 + 14, 492, 36 + 6 * 33),
    enviar: caja(r.x + 540 - 24 - 190, r.y + alto - 70 + 16, 190, 38),
  };
};
export type DatosImportar = { t: number; archivo: boolean; filas: number; enviando?: boolean; hover?: { descargar?: number; seleccionar?: number; enviar?: number }; apretar?: { seleccionar?: number; enviar?: number }; resalte?: { paso1?: number; paso2?: number; vista?: number } };
export const VentanaImportar: FC<{ d: DatosImportar; vh: number }> = ({ d, vh }) => {
  const conFilas = d.archivo;
  const L = IMPORTAR_V(vh, conFilas);
  const paso = (n: number, icono: ReactNode, titulo: string, texto: string, boton: ReactNode, resalte = 0, extra?: ReactNode) => (
    <div style={{ border: `1px solid ${LINEA}`, borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: anillo(resalte), height: n === 2 && conFilas ? 178 : 152, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, height: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'grid', placeItems: 'center' }}>{icono}</div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{titulo}</p>
      </div>
      <p style={{ margin: '0 0 12px 38px', fontSize: 12, color: GRIS, lineHeight: 1.5, height: 36 }}>{texto}</p>
      <div style={{ marginLeft: 38 }}>
        {boton}
        {extra}
      </div>
    </div>
  );
  return (
    <Ventana r={L.r} t={d.t}>
      <Cabeza titulo="Importar invitaciones" sub="Invita a varias personas a la vez con la plantilla de Excel." cerrar />
      <div style={{ padding: '4px 24px 0', flex: 1 }}>
        {paso(
          1,
          <FileSpreadsheet size={15} color={AZUL} />,
          '1. Descarga la plantilla base',
          'Elige el rol y la categoría; el archivo vendrá pre-cargado con listas desplegables.',
          <BotonSecundario hover={d.hover?.descargar}>
            <Download size={14} /> Descargar plantilla (.xlsx)
          </BotonSecundario>,
          d.resalte?.paso1,
        )}
        {paso(
          2,
          <Upload size={15} color={AZUL} />,
          '2. Sube la plantilla diligenciada',
          'Se enviará un correo de invitación a cada dirección válida del archivo.',
          <BotonSecundario hover={d.hover?.seleccionar} apretar={d.apretar?.seleccionar}>
            <FileSpreadsheet size={14} /> {d.archivo ? 'Cambiar archivo' : 'Seleccionar archivo'}
          </BotonSecundario>,
          d.resalte?.paso2,
          d.archivo && (
            <p style={{ margin: '8px 0 0', fontSize: 12 }}>
              <strong>invitaciones-sub13.xlsx</strong>
              <span style={{ color: '#16A34A' }}> — {IMPORTADOS.length} filas detectadas</span>
            </p>
          ),
        )}
        {conFilas && (
          <div style={{ border: `1px solid ${LINEA}`, borderRadius: 12, overflow: 'hidden', boxShadow: anillo(d.resalte?.vista) }}>
            <div style={{ padding: '0 12px', height: 36, display: 'flex', alignItems: 'center', background: '#FAFBFC', borderBottom: `1px solid ${LINEA}`, fontSize: 11, fontWeight: 600, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.5, boxSizing: 'border-box' }}>Se enviarán {IMPORTADOS.length} invitaciones</div>
            {IMPORTADOS.slice(0, d.filas).map(([c, n, a], i) => (
              <div key={c} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0 12px', height: 33, alignItems: 'center', borderBottom: '1px solid #F1F5F9', fontSize: 12, boxSizing: 'border-box', opacity: Math.min(1, Math.max(0, d.filas - i)) }}>
                <span>{c}</span>
                <span style={{ color: SUAVE }}>
                  {n} {a} · Jugador · Sub-13
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Pie>
        <BotonSecundario>Cancelar</BotonSecundario>
        <span style={{ ...btnBase, height: 38, width: 190, border: `1px solid ${AZUL}`, background: AZUL, color: '#fff', opacity: d.archivo ? 1 : 0.6, transform: hundir(d.apretar?.enviar), filter: (d.hover?.enviar ?? 0) > 0 ? `brightness(${1 - 0.1 * (d.hover?.enviar ?? 0)})` : undefined }}>
          <Send size={14} /> {d.enviando ? 'Enviando…' : `Enviar ${d.archivo ? IMPORTADOS.length : ''} invitaciones`}
        </span>
      </Pie>
    </Ventana>
  );
};

// =============================================================================================================
// Solicitudes (JoinRequestsPanel.tsx)
// =============================================================================================================

/** Quien pide unirse (la tarjeta de la solicitud). */
export type SolicitudU = { nombre: string; iniciales: string; edad: number; cat: CatId; sede: string; correo: string; telefono: string; hace: string; acudiente: string; mensaje: string };
export const SOLICITUD_JUAN_ESTEBAN: SolicitudU = {
  nombre: 'Juan Esteban López',
  iniciales: 'JE',
  edad: 12,
  cat: 'sub13',
  sede: 'Sede Norte',
  correo: 'marcela.lopez@ejemplo.com',
  telefono: '+57 310 482 7731',
  hace: 'hace 2 h',
  acudiente: 'Marcela López',
  mensaje: '¿Tienen cupo para empezar en enero?',
};
export type DatosSolicitudes = {
  aprobada?: number;
  aprobando?: boolean;
  /** La solicitud (por defecto la de Juan Esteban López). */
  persona?: SolicitudU;
  /** La tarjeta llega (0 → 1); en 0 se ve «No tienes solicitudes pendientes». Sin dato, ya está. */
  entra?: number;
  /** «Copiar enlace» cambió a «¡Copiado!». */
  copiado?: boolean;
  hover?: { aprobar?: number; copiar?: number; whatsapp?: number };
  apretar?: { aprobar?: number; copiar?: number; whatsapp?: number };
  resalte?: Partial<Record<'formulario' | 'enlace' | 'sede' | 'categoria' | 'tarjeta' | 'mensaje' | 'copiar' | 'whatsapp', number>>;
};
const Y_SOL = 246;
/** Ancho de «Compartir por WhatsApp» y de «Copiar enlace» (12,5 px, semibold). */
const W_WA = 192;
const W_COPIAR = 128;
export const SOLICITUDES = {
  formulario: caja(X0, Y_SOL, AW, 142),
  enlace: caja(X0 + 16, Y_SOL + 90, AW - 32 - W_WA - W_COPIAR - 16, 36),
  copiar: caja(X0 + AW - 16 - W_WA - 8 - W_COPIAR, Y_SOL + 90, W_COPIAR, 36),
  whatsapp: caja(X0 + AW - 16 - W_WA, Y_SOL + 90, W_WA, 36),
  filtros: caja(X0, Y_SOL + 156, 400, 31),
  tarjeta: caja(X0, Y_SOL + 156 + 31 + 14, AW, 206),
  sede: caja(X0 + 17 + 33, Y_SOL + 201 + 156, 116, 34),
  categoria: caja(X0 + 17 + 33 + 116 + 8 + 63, Y_SOL + 201 + 156, 100, 34),
  aprobar: caja(X0 + AW - 17 - 92, Y_SOL + 201 + 156, 92, 34),
  rechazar: caja(X0 + AW - 17 - 92 - 8 - 92, Y_SOL + 201 + 156, 92, 34),
};
const barBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${LINEA}`, background: '#fff', color: '#334155', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', boxSizing: 'border-box' };
const PanelSolicitudes: FC<{ d: DatosSolicitudes; marca: string }> = ({ d, marca }) => {
  const r = d.resalte ?? {};
  const fuera = d.aprobada ?? 0;
  const entra = d.entra ?? 1;
  const p = d.persona ?? SOLICITUD_JUAN_ESTEBAN;
  const pc = catU(p.cat);
  const enlace = `${ACADEMIA.slug}.galiesport.com/unirse`;
  /** Lo que se ve de la tarjeta (llega y, al aprobar, se va). */
  const vis = entra * (1 - fuera);
  const vacio = Math.max(fuera > 0.6 ? (fuera - 0.6) / 0.4 : 0, entra < 1 ? 1 - Math.min(1, entra * 2.5) : 0);
  const select = (label: string, valor: string, ancho: number, resalte = 0) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569' }}>
      {label}
      <span style={{ height: 34, width: ancho, padding: '0 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff', color: TINTA, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', boxShadow: anillo(resalte) }}>
        {valor}
        <ChevronDown size={13} color={GRIS} />
      </span>
    </span>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: SOLICITUDES.formulario.x, top: SOLICITUDES.formulario.y, width: AW, height: 142, background: '#fff', border: `1px solid ${LINEA}`, borderRadius: 12, padding: 16, boxSizing: 'border-box', boxShadow: anillo(r.formulario) }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Formulario de inscripción</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: '#065F46', background: '#D1FAE5', borderRadius: 99, padding: '2px 8px' }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: '#10B981' }} />
                Recibiendo solicitudes
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: GRIS, lineHeight: 1.5 }}>Comparte este enlace con jugadores y acudientes para que pidan unirse a tu escuela. Cada solicitud aparece en esta lista para que la apruebes o la rechaces.</p>
          </div>
          <span style={{ ...barBtn, color: GRIS }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M12 2v10" />
              <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
            </svg>
            Apagar formulario
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 36, borderRadius: 8, background: '#F8FAFC', border: `1px solid ${LINEA}`, color: '#334155', fontSize: 12.5, boxSizing: 'border-box', boxShadow: anillo(r.enlace) }}>
            <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {enlace}
          </div>
          <span style={{ ...barBtn, width: W_COPIAR, background: (d.hover?.copiar ?? 0) > 0 ? `rgba(248,250,252,${d.hover?.copiar})` : '#fff', transform: hundir(d.apretar?.copiar), boxShadow: anillo(r.copiar), color: d.copiado ? '#047857' : '#334155' }}>
            {d.copiado ? (
              <Check size={13} strokeWidth={2.6} />
            ) : (
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            {d.copiado ? '¡Copiado!' : 'Copiar enlace'}
          </span>
          <span style={{ ...barBtn, width: W_WA, color: '#047857', borderColor: '#A7F3D0', background: '#ECFDF5', filter: (d.hover?.whatsapp ?? 0) > 0 ? `brightness(${1 - 0.05 * (d.hover?.whatsapp ?? 0)})` : undefined, transform: hundir(d.apretar?.whatsapp), boxShadow: anillo(r.whatsapp) }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Compartir por WhatsApp
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: X0, top: SOLICITUDES.filtros.y, display: 'flex', gap: 6 }}>
        {['Pendientes', 'Aprobadas', 'Rechazadas', 'Canceladas'].map((f, i) => (
          <span key={f} style={{ height: 31, padding: '0 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', border: `1px solid ${i === 0 ? marca : LINEA}`, background: i === 0 ? marca : '#fff', color: i === 0 ? '#fff' : '#475569', boxSizing: 'border-box' }}>{f}</span>
        ))}
      </div>
      {vacio > 0 && (
        <div style={{ position: 'absolute', left: X0, top: SOLICITUDES.tarjeta.y, width: AW, background: '#fff', borderRadius: 12, border: `1px solid ${LINEA}`, padding: '48px 24px', textAlign: 'center', boxSizing: 'border-box', opacity: vacio }}>
          <p style={{ margin: 0, color: '#475569', fontWeight: 600, fontSize: 14 }}>No tienes solicitudes pendientes</p>
          <p style={{ margin: '6px 0 0', color: SUAVE, fontSize: 12.5 }}>
            Publica y comparte tu formulario de inscripción desde <span style={{ color: marca, fontWeight: 600 }}>Mi Escuela</span>.
          </p>
        </div>
      )}
      {vis > 0 && (
        <div style={{ position: 'absolute', left: X0, top: SOLICITUDES.tarjeta.y, width: AW, height: 206, background: '#fff', borderRadius: 12, border: `1px solid ${LINEA}`, padding: 16, boxSizing: 'border-box', boxShadow: anillo(r.tarjeta) ?? '0 1px 2px rgba(15,23,42,0.04)', opacity: vis, transform: `translateX(${fuera * 40}px) translateY(${(1 - entra) * -16}px)` }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: marca, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{p.iniciales}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{p.nombre}</span>
                <span style={{ fontSize: 12, color: GRIS }}>{p.edad} años</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#334155', background: '#F1F5F9', borderRadius: 99, padding: '2px 8px' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: pc?.color ?? '#3B82F6' }} />
                  {pc?.nombre}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: '#334155', background: '#F1F5F9', borderRadius: 99, padding: '2px 8px' }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.sede}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: GRIS, marginTop: 4, display: 'flex', gap: 14 }}>
                <span>{p.correo}</span>
                <span style={{ color: '#047857', fontWeight: 600 }}>{p.telefono} · WhatsApp</span>
                <span>{p.hace}</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#334155', margin: '6px 0 0' }}>Enviada por su acudiente: {p.acudiente}</p>
              <p style={{ fontSize: 13, color: '#334155', margin: '8px 0 0', background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', boxShadow: anillo(r.mensaje) }}>“{p.mensaje}”</p>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 16, right: 16, top: 156, paddingTop: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -12, height: 1, background: '#F1F5F9' }} />
            {select('Sede', p.sede, 116, r.sede)}
            {select('Categoría', pc?.nombre ?? 'Sin categoría', 100, r.categoria)}
            <div style={{ flex: 1 }} />
            <span style={{ height: 34, width: 92, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#B91C1C', fontSize: 13, fontWeight: 600, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>Rechazar</span>
            <span style={{ height: 34, width: 92, borderRadius: 8, background: marca, color: '#fff', fontSize: 13, fontWeight: 700, display: 'grid', placeItems: 'center', opacity: d.aprobando ? 0.7 : 1, transform: hundir(d.apretar?.aprobar), filter: (d.hover?.aprobar ?? 0) > 0 ? `brightness(${1 - 0.1 * (d.hover?.aprobar ?? 0)})` : undefined }}>{d.aprobando ? 'Aprobando…' : 'Aprobar'}</span>
          </div>
        </div>
      )}
    </>
  );
};

// =============================================================================================================
// Perfil de usuario (UserDrawer.tsx) y la lesión (InjuryDialog.tsx)
// =============================================================================================================

export type DatosPerfilUsuario = {
  t: number;
  miembro: MiembroU;
  /** Lesión registrada (texto completo de la fila «Lesión»). */
  lesion?: string | null;
  pazYSalvo?: boolean;
  hover?: Partial<Record<'lesion' | 'paz' | 'cerrar', number>>;
  apretar?: Partial<Record<'lesion' | 'paz' | 'cerrar', number>>;
  resalte?: Partial<Record<'lesion' | 'fichaje' | 'botonLesion' | 'paz' | 'info', number>>;
};
const DRAWER_X = ANCHO_U - 460;
/** Cuántas líneas ocupa el texto de la lesión en la fila (≈ 54 letras por línea). */
const lineasLesion = (t: string | null | undefined) => (t ? Math.ceil(t.length / 54) : 1);
export const PERFIL = (lesion?: string | null) => {
  const extra = (lineasLesion(lesion) - 1) * 19.5;
  const yAcc = 332 + 7 * 44.5 + extra + 24 + 16.5 + 10;
  const bx = DRAWER_X + 24;
  const w = (460 - 48 - 8) / 2;
  const boton = (fila: number, col: number) => caja(bx + col * (w + 8), yAcc + fila * 47.5, w, 39.5);
  return {
    cerrar: caja(ANCHO_U - 20 - 32, 16, 32, 32),
    filaLesion: caja(bx, 332 + 4 * 44.5, 412, 44.5 + extra),
    filaFichaje: caja(bx, 332 + 3 * 44.5, 412, 44.5),
    mensaje: boton(0, 0),
    lesion: boton(1, 1),
    paz: boton(2, 0),
    info: caja(bx, 296, 412, 26),
  };
};
export const PerfilUsuario: FC<{ d: DatosPerfilUsuario; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0) return null;
  const x = d.miembro;
  const c = catU(x.cat);
  const st = ESTADOS[x.estado];
  const L = PERFIL(d.lesion);
  const filas: { label: string; valor: ReactNode; mono?: boolean; peligro?: boolean; k?: 'lesion' | 'fichaje'; alto?: number }[] = [
    { label: 'Rol', valor: 'Jugador' },
    { label: 'Categoría', valor: c?.nombre ?? 'Sin categoría' },
    { label: 'Teléfono', valor: x.telefono ?? '—', mono: true },
    { label: 'Estado de fichaje', valor: d.pazYSalvo ? 'Paz y salvo' : 'Pendiente', k: 'fichaje' },
    { label: 'Lesión', valor: d.lesion ?? 'Sin lesión', peligro: !!d.lesion, k: 'lesion', alto: L.filaLesion.alto },
    { label: 'Última sesión', valor: x.ultima ?? '—' },
    { label: 'Registrado el', valor: x.registrado },
  ];
  const accion = (k: string, icono: ReactNode, texto: string, estilo: CSSProperties = {}, hover = 0, apretar = 0, resalte = 0) => (
    <span key={k} style={{ ...btnBase, height: 39.5, background: hover > 0 ? (estilo.color === '#B91C1C' ? '#FEF2F2' : estilo.color === '#047857' ? '#ECFDF5' : '#F8FAFC') : '#fff', transform: hundir(apretar), boxShadow: anillo(resalte), ...estilo }}>
      {icono} {texto}
    </span>
  );
  return (
    <>
      <Velo t={Math.min(1, d.t * 1.4)} z={100} />
      <div style={{ position: 'absolute', left: DRAWER_X + (1 - d.t) * 460, top: 0, width: 460, height: vh, background: '#fff', boxShadow: '0 20px 50px rgba(15,23,42,0.15)', zIndex: 101, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 65, padding: '0 20px', borderBottom: `1px solid ${LINEA}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, fontFamily: schibsted }}>Perfil de usuario</h3>
          <span style={{ width: 32, height: 32, borderRadius: 6, display: 'grid', placeItems: 'center', color: GRIS, background: (d.hover?.cerrar ?? 0) > 0 ? '#F1F5F9' : 'transparent', transform: hundir(d.apretar?.cerrar) }}>
            <X size={16} />
          </span>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 187, borderBottom: `1px solid ${LINEA}`, marginBottom: 20, boxSizing: 'border-box' }}>
            <Avatar nombre={x.nombre} tam={72} letra={24} />
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, lineHeight: 1.5 }}>{x.nombre}</div>
            <div style={{ fontSize: 13, color: GRIS, marginTop: 2 }}>{x.correo}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, border: `1px solid ${st.border}`, background: st.bg, color: st.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                {st.label}
              </span>
              {c && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${c.color}33`, background: `${c.color}15`, color: c.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                  {c.nombre}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, marginBottom: 10, borderRadius: 6, boxShadow: anillo(d.resalte?.info) }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: SUAVE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Información</span>
            <span style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', color: GRIS }}>
              <Pencil size={14} />
            </span>
          </div>
          {filas.map((f) => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: f.alto ?? 44.5, boxSizing: 'border-box', padding: '12px 0', borderBottom: `1px solid ${LINEA}`, borderRadius: f.k ? 6 : 0, boxShadow: f.k ? anillo(d.resalte?.[f.k]) : undefined }}>
              <span style={{ fontSize: 12, color: GRIS, flexShrink: 0 }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: f.peligro ? '#B91C1C' : TINTA, fontFamily: f.mono ? jetbrains : undefined, textAlign: 'right', lineHeight: 1.5 }}>{f.valor}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 600, color: SUAVE, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '24px 0 10px', lineHeight: 1.5 }}>Acciones</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {accion('m', <Send size={14} />, 'Enviar mensaje')}
            {accion('d', <FolderLock size={14} />, 'Documentos')}
            {accion('s', <Pause size={14} />, 'Suspender')}
            {d.lesion
              ? accion('l', <HeartPulse size={14} />, 'Ver lesión', { color: '#B91C1C', border: '1px solid #FECACA' }, d.hover?.lesion, d.apretar?.lesion, d.resalte?.botonLesion)
              : accion('l', <HeartPulse size={14} />, 'Registrar lesión', {}, d.hover?.lesion, d.apretar?.lesion, d.resalte?.botonLesion)}
            {d.pazYSalvo
              ? accion('p', <ShieldCheck size={14} />, 'Quitar paz y salvo', { color: '#B91C1C', border: '1px solid #FECACA' }, 0, 0, d.resalte?.paz)
              : accion('p', <ShieldCheck size={14} />, 'Marcar paz y salvo', { color: '#047857', border: '1px solid #A7F3D0' }, d.hover?.paz, d.apretar?.paz, d.resalte?.paz)}
          </div>
          <div style={{ marginTop: 8 }}>{accion('e', <Trash2 size={14} />, 'Eliminar usuario', { width: '100%', color: '#B91C1C', border: '1px solid #FECACA' })}</div>
        </div>
      </div>
    </>
  );
};

export type DatosLesion = {
  t: number;
  titulo: string;
  sub: string;
  descripcion: string;
  desde: string;
  hasta: string;
  foco?: 'descripcion' | 'desde' | 'hasta' | null;
  guardando?: boolean;
  hover?: { guardar?: number };
  apretar?: { guardar?: number };
};
const ALTO_LESION = CABEZA_2 + 4 + 74 + 60 + 16 + 66;
export const LESION_V = (vh: number) => {
  const r = ventanaCentrada(vh, 460, ALTO_LESION);
  const bx = r.x + 24;
  const by = r.y + CABEZA_2 + 4;
  const half = (460 - 48 - 12) / 2;
  return { r, descripcion: caja(bx, by + 24, 412, 38), desde: caja(bx, by + 74 + 24, half, 38), hasta: caja(bx + half + 12, by + 74 + 24, half, 38), guardar: caja(r.x + 460 - 24 - 150, r.y + ALTO_LESION - 66 + 14, 150, 38) };
};
const CampoFecha: FC<{ valor: string; foco: boolean }> = ({ valor, foco }) => (
  <div style={{ ...campo(foco), justifyContent: 'space-between' }}>
    <span style={{ color: valor ? TINTA : SUAVE, display: 'inline-flex', alignItems: 'center' }}>
      {valor || 'dd/mm/aaaa'}
      {foco && <Cursor />}
    </span>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TINTA} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  </div>
);
export const VentanaLesion: FC<{ d: DatosLesion; vh: number }> = ({ d, vh }) => {
  const L = LESION_V(vh);
  const half = L.desde.ancho;
  return (
    <Ventana r={L.r} t={d.t} z={150}>
      <Cabeza titulo={d.titulo} sub={d.sub} alto={CABEZA_2} />
      <div style={{ padding: '4px 24px 16px', flex: 1 }}>
        <div style={{ height: 60, marginBottom: 14 }}>
          <label style={etiqueta}>¿Qué lesión es?</label>
          <div style={campo(d.foco === 'descripcion')}>
            <Escrito valor={d.descripcion} ejemplo="Ej: esguince de tobillo derecho" foco={d.foco === 'descripcion'} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `${half}px ${half}px`, gap: 12 }}>
          <div>
            <label style={etiqueta}>Desde</label>
            <CampoFecha valor={d.desde} foco={d.foco === 'desde'} />
          </div>
          <div>
            <label style={etiqueta}>
              Regreso estimado <span style={{ color: SUAVE, fontWeight: 400 }}>(opcional)</span>
            </label>
            <CampoFecha valor={d.hasta} foco={d.foco === 'hasta'} />
          </div>
        </div>
      </div>
      <Pie alto={66}>
        <BotonSecundario>Cancelar</BotonSecundario>
        <BotonPrimario ancho={150} hover={d.hover?.guardar} apretar={d.apretar?.guardar}>
          <HeartPulse size={14} /> {d.guardando ? 'Guardando…' : 'Guardar lesión'}
        </BotonPrimario>
      </Pie>
    </Ventana>
  );
};

// =============================================================================================================
// Acciones en grupo (BulkActionBar.tsx y BulkModals.tsx → «Enviar mensaje»)
// =============================================================================================================

export const BARRA_SEL = (vh: number) => {
  const y = vh - 20 - 46;
  return { r: caja(X0, y, AW, 46), reasignar: caja(X0 + 16 + 112 + 12 + 1 + 12, y + 7, 160, 32), mensaje: caja(X0 + 16 + 112 + 12 + 1 + 12 + 160 + 12, y + 7, 128, 32), eliminar: caja(X0 + AW - 12 - 36 - 12 - 84, y + 7, 84, 32) };
};
export type DatosBarraSel = { n: number; t: number; hover?: 'reasignar' | 'mensaje' | 'eliminar' | null; apretar?: number; resalte?: Partial<Record<'reasignar' | 'mensaje', number>> };
export const BarraSeleccion: FC<{ d: DatosBarraSel; vh: number }> = ({ d, vh }) => {
  if (d.t <= 0 || d.n <= 0) return null;
  const L = BARRA_SEL(vh);
  const b = (k: 'reasignar' | 'mensaje' | 'eliminar', icono: ReactNode, texto: string, ancho: number, color = '#fff') => (
    <span style={{ width: ancho, height: 32, borderRadius: 6, color, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: d.hover === k ? 'rgba(255,255,255,0.1)' : 'transparent', transform: d.hover === k ? hundir(d.apretar) : undefined, boxShadow: anillo(k === 'eliminar' ? 0 : d.resalte?.[k]) }}>
      {icono} {texto}
    </span>
  );
  return (
    <div style={{ position: 'absolute', left: L.r.x, top: L.r.y + (1 - d.t) * 10, width: AW, height: 46, background: '#0F172A', color: '#fff', borderRadius: 12, padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 20px 50px rgba(15,23,42,0.15)', boxSizing: 'border-box', zIndex: 50, opacity: d.t }}>
      <span style={{ width: 112, height: 26, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
        {d.n} seleccionado{d.n !== 1 ? 's' : ''}
      </span>
      <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
      {b('reasignar', <Edit size={14} />, 'Reasignar categoría', 160)}
      {b('mensaje', <Send size={14} />, 'Enviar mensaje', 128)}
      <span style={{ flex: 1 }} />
      {b('eliminar', <Trash2 size={14} />, 'Eliminar', 84, '#FCA5A5')}
      <span style={{ width: 36, height: 32, display: 'grid', placeItems: 'center' }}>
        <X size={16} />
      </span>
    </div>
  );
};

export const MENSAJE_GRUPO = 'Recuerden que el sábado el entrenamiento empieza a las 8:00 a. m.';
export const MOTIVO_MENOR = 'Con menores de edad solo hay mensajes directos si su acudiente autorizó la cuenta; mientras tanto, se habla en el grupo del equipo.';
const ALTO_MENSAJE = (res: boolean) => (res ? CABEZA + 4 + 44 + 12 + 112 + 16 + 66 : CABEZA + 4 + 24 + 120 + 20.5 + 8 + 54 + 16 + 66);
export const MENSAJE_V = (vh: number, res: boolean) => {
  const alto = ALTO_MENSAJE(res);
  const r = ventanaCentrada(vh, 500, alto);
  return { r, texto: caja(r.x + 24, r.y + CABEZA + 4 + 24, 452, 120), enviar: caja(r.x + 500 - 24 - 92, r.y + alto - 66 + 14, 92, 38), cerrar: caja(r.x + 500 - 24 - 84, r.y + alto - 66 + 14, 84, 38), fallo: caja(r.x + 24, r.y + CABEZA + 4 + 44 + 12, 452, 112), ok: caja(r.x + 24, r.y + CABEZA + 4, 452, 44) };
};
export type DatosMensajeGrupo = { t: number; n: number; texto: string; foco?: boolean; enviando?: boolean; resultado?: number; hover?: { enviar?: number; cerrar?: number }; apretar?: { enviar?: number; cerrar?: number }; resalte?: { fallo?: number; ok?: number } };
export const VentanaMensajeGrupo: FC<{ d: DatosMensajeGrupo; vh: number }> = ({ d, vh }) => {
  const res = (d.resultado ?? 0) > 0;
  const L = MENSAJE_V(vh, res);
  return (
    <Ventana r={L.r} t={d.t} z={150}>
      <Cabeza titulo="Enviar mensaje" sub={`Le llega a cada jugador por su chat en Mensajes. ${d.n} destinatarios.`} />
      <div style={{ padding: '4px 24px 16px', flex: 1 }}>
        {res ? (
          <div style={{ opacity: d.resultado }}>
            <p style={{ margin: 0, fontSize: 13, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '0 12px', height: 44, display: 'flex', alignItems: 'center', boxSizing: 'border-box', boxShadow: anillo(d.resalte?.ok) }}>Mensaje enviado a {d.n - 1} jugadores.</p>
            <div style={{ marginTop: 12, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', height: 112, boxSizing: 'border-box', boxShadow: anillo(d.resalte?.fallo, '245,158,11') }}>
              <p style={{ margin: '0 0 6px', fontSize: 12.5, fontWeight: 600, color: '#92400E' }}>No les llegó a</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                <li>
                  <strong>Samuel Rojas</strong>: {MOTIVO_MENOR}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <label style={etiqueta}>Mensaje</label>
            <div style={{ ...campo(!!d.foco, 120), alignItems: 'flex-start', padding: '9px 12px', whiteSpace: 'normal', lineHeight: 1.5 }}>
              <span>
                {d.texto ? (
                  <>
                    {d.texto}
                    {d.foco && <Cursor />}
                  </>
                ) : (
                  <>
                    {d.foco && <Cursor />}
                    <span style={{ color: SUAVE }}>Ej: {MENSAJE_GRUPO}</span>
                  </>
                )}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: SUAVE, textAlign: 'right' }}>{d.texto.length}/2000</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: GRIS, lineHeight: 1.45, height: 54 }}>Con menores de edad solo hay mensajes directos si su acudiente autorizó la cuenta; si no, te avisamos y puedes escribirles por el grupo de la categoría.</p>
          </>
        )}
      </div>
      <Pie alto={66}>
        {res ? (
          <>
            <BotonSecundario>Ir a Mensajes</BotonSecundario>
            <BotonPrimario ancho={84} hover={d.hover?.cerrar} apretar={d.apretar?.cerrar}>
              Cerrar
            </BotonPrimario>
          </>
        ) : (
          <>
            <BotonSecundario>Cancelar</BotonSecundario>
            <BotonPrimario ancho={92} hover={d.hover?.enviar} apretar={d.apretar?.enviar}>
              <Send size={14} /> {d.enviando ? 'Enviando…' : 'Enviar'}
            </BotonPrimario>
          </>
        )}
      </Pie>
    </Ventana>
  );
};

// =============================================================================================================
// La descarga del navegador (Exportar → el .xlsx)
// =============================================================================================================

/** El globo de descargas del navegador, en píxeles del video, debajo de la barra de dirección (a la derecha). */
export const GloboDescarga: FC<{ t: number; anchoVentana: number; archivo: string; listo: number }> = ({ t, anchoVentana, archivo, listo }) =>
  t > 0 ? (
    <div style={{ position: 'absolute', right: 14, top: 114 + 6, width: Math.min(560, anchoVentana - 28), background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)', zIndex: 800, padding: '16px 18px', boxSizing: 'border-box', fontFamily: '-apple-system, "SF Pro Text", Helvetica, sans-serif', opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -10}px)` }}>
      <div style={{ fontSize: 19, fontWeight: 600, color: '#202124', marginBottom: 12 }}>Descargas recientes</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#1D6F42', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>X</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 19, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{archivo}</div>
          <div style={{ fontSize: 16, color: '#5F6368', marginTop: 3 }}>{listo >= 1 ? '9,8 KB · Listo' : 'Descargando…'}</div>
          <div style={{ height: 4, borderRadius: 2, background: '#E8EAED', marginTop: 6, overflow: 'hidden', opacity: listo >= 1 ? 0 : 1 }}>
            <div style={{ width: `${listo * 100}%`, height: '100%', background: '#1A73E8' }} />
          </div>
        </div>
      </div>
    </div>
  ) : null;

// =============================================================================================================
// El jugador: menú, perfil y la tarjeta «Lesión»
// =============================================================================================================

const ENLACES_JUGADOR_PC = ['Inicio', 'Mensajes', 'Novedades', 'Asistencia', 'Facturas', 'Documentos', 'Perfil'];
const IconoMenu: FC<{ n: string }> = ({ n }) => {
  const p: Record<string, ReactNode> = {
    Inicio: <path d="M3 10.5 12 3l9 7.5V21H3z M9 21v-6h6v6" />,
    Mensajes: <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2zM18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />,
    Novedades: <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z" />,
    Asistencia: <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4" />,
    Facturas: <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v5h5M16 13H8M16 17H8M10 9H8" />,
    Documentos: <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2zM10 14h4v4h-4zM11 14v-1a1 1 0 0 1 2 0v1" />,
    Perfil: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {p[n]}
    </svg>
  );
};
const MenuJugadorPC: FC<{ tn: Tonos; vh: number; nombre: string }> = ({ tn, vh, nombre }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SIDE, height: vh, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '0 14px 20px', boxSizing: 'border-box', zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 8px', borderBottom: '1px solid #e2e8f0' }}>
      <Isotipo tamano={32} />
      <div style={{ fontFamily: schibsted, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Gali Esport</div>
    </div>
    <nav style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ENLACES_JUGADOR_PC.map((n) => {
        const on = n === 'Perfil';
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 11, height: 36, padding: '0 10px', borderRadius: 8, fontSize: 13, fontWeight: on ? 500 : 400, color: on ? tn.b700 : '#64748b', background: on ? tn.b50 : 'transparent' }}>
            <IconoMenu n={n} />
            <span>{n}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 20, display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: tn.b600, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12 }}>{nombre[0]}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Jugador</div>
      </div>
      <ChevronDown size={14} color="#94a3b8" />
    </div>
  </div>
);

const PX = SIDE + 20;
const PW = ANCHO_U - SIDE - 40;
export const PERFIL_JUGADOR = { lesion: caja(PX, 350, PW, 172), reportar: caja(PX + PW - 24 - 112, 350 + 24 + 3, 112, 30), caja: caja(PX + 24, 350 + 24 + 36 + 20, PW - 48, 66) };
export type DatosPerfilJugador = { lesion?: { texto: string; fechas: string } | null; entra?: number; hover?: { reportar?: number }; apretar?: { reportar?: number }; resalte?: { tarjeta?: number } };

const IconoTarjeta: FC<{ children: ReactNode; bg: string; color: string }> = ({ children, bg, color }) => <div style={{ width: 36, height: 36, borderRadius: 12, background: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{children}</div>;
const Tarjeta: FC<{ y: number; alto: number; children: ReactNode; resalte?: number }> = ({ y, alto, children, resalte = 0 }) => (
  <div style={{ position: 'absolute', left: PX, top: y, width: PW, height: alto, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: anillo(resalte) ?? '0 1px 2px rgba(0,0,0,0.05)', padding: 24, boxSizing: 'border-box' }}>{children}</div>
);
const CabezaTarjeta: FC<{ icono: ReactNode; titulo: string; sub: string; derecha?: ReactNode }> = ({ icono, titulo, sub, derecha }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36, marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icono}
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.25 }}>{titulo}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', lineHeight: 1.4 }}>{sub}</p>
      </div>
    </div>
    {derecha}
  </div>
);

/** El perfil del jugador (desplazado: la cabecera oscura queda arriba, fuera de la vista). `encima`: la ventana de la lesión. */
export const PaginaPerfilJugador: FC<{ tn: Tonos; vh: number; nombre: string; d: DatosPerfilJugador; campana?: DatosCampana; encima?: ReactNode }> = ({ tn, vh, nombre, d, encima }) => {
  const les = d.lesion;
  const e = d.entra ?? 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO_U, height: vh, overflow: 'hidden', background: '#F9FAFB', fontFamily: instrument, color: TINTA, lineHeight: 1.5 }}>
      {/* El final de la cabecera del perfil (PlayerHeaderA), con el panel de rendimiento */}
      <div style={{ position: 'absolute', left: PX, top: -120, width: PW, height: 180, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 18, height: 54, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #EEF0F3' }}>
          {['Partidos', 'Goles', 'Asistencias', 'Seguidores'].map((s, i) => (
            <div key={s} style={{ paddingTop: 10, fontSize: 11, color: '#6B7280' }}>
              {s} <b style={{ color: TINTA, marginLeft: 8, fontSize: 15 }}>{['14', '6', '4', '—'][i]}</b>
            </div>
          ))}
        </div>
      </div>
      {/* Pestañas (ProfileTabs) */}
      <div style={{ position: 'absolute', left: PX, top: 76, width: PW, height: 52, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4 }}>
        {['Resumen', 'Estadísticas', 'Trayectoria', 'Logros', 'Tarjetas', 'Redes'].map((t, i) => (
          <span key={t} style={{ padding: '0 16px', height: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 12, fontSize: 14, fontWeight: 500, background: i === 0 ? '#111827' : 'transparent', color: i === 0 ? '#fff' : '#6B7280' }}>{t}</span>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ padding: '0 12px', height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#047857', background: '#ECFDF5' }}>Ver perfil público</span>
      </div>
      {/* Equipo actual */}
      <Tarjeta y={144} alto={190}>
        <CabezaTarjeta
          icono={
            <IconoTarjeta bg="#EFF6FF" color={AZUL}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
              </svg>
            </IconoTarjeta>
          }
          titulo="Equipo actual"
          sub="Información del club en el que juegas actualmente"
          derecha={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#9CA3AF', border: '1px solid #E5E7EB', padding: '0 12px', height: 30, borderRadius: 8 }}>
              <Pencil size={12} /> Editar
            </span>
          }
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #F3F4F6', background: 'rgba(249,250,251,0.6)', borderRadius: 12, padding: '0 16px', height: 84 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #16A34A, #0F7A37)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>AF</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{ACADEMIA.nombre}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Sub-15</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>Desde oct. 2026</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: AZUL, letterSpacing: '0.025em' }}>Jugador</span>
        </div>
      </Tarjeta>
      {/* Lesión (InjurySection) */}
      <Tarjeta y={PERFIL_JUGADOR.lesion.y} alto={172} resalte={d.resalte?.tarjeta}>
        <CabezaTarjeta
          icono={
            <IconoTarjeta bg={les ? '#FEF2F2' : '#ECFDF5'} color={les ? '#DC2626' : '#059669'}>
              <HeartPulse size={16} />
            </IconoTarjeta>
          }
          titulo="Lesión"
          sub="Avísale a tu entrenador si estás lesionado"
          derecha={
            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', border: '1px solid #E5E7EB', width: 112, height: 30, display: 'grid', placeItems: 'center', borderRadius: 8, background: (d.hover?.reportar ?? 0) > 0 ? '#F9FAFB' : '#fff', transform: hundir(d.apretar?.reportar), boxSizing: 'border-box' }}>{les ? 'Editar' : 'Reportar lesión'}</span>
          }
        />
        {les ? (
          <div style={{ border: '1px solid #FEE2E2', background: 'rgba(254,242,242,0.6)', borderRadius: 12, padding: '0 16px', height: 66, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: e }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#991B1B', lineHeight: 1.25 }}>{les.texto}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(185,28,28,0.8)' }}>{les.fechas}</p>
          </div>
        ) : (
          <div style={{ border: '1px solid #D1FAE5', background: 'rgba(236,253,245,0.5)', borderRadius: 12, padding: '0 16px', height: 66, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#065F46' }}>Sin lesiones</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(4,120,87,0.8)' }}>Si te lesionas, repórtalo aquí y tu entrenador lo sabrá al instante.</p>
          </div>
        )}
      </Tarjeta>
      {/* Información personal (PersonalInfoSection), lo que alcanza a verse */}
      <Tarjeta y={538} alto={900}>
        <CabezaTarjeta
          icono={
            <IconoTarjeta bg="#F3F4F6" color="#374151">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 9h4M7 13h10M7 17h6" />
              </svg>
            </IconoTarjeta>
          }
          titulo="Información personal"
          sub="Datos básicos · usa los íconos del ojo para definir qué es público"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Nombres', nombre.split(' ')[0]],
            ['Apellidos', nombre.split(' ').slice(1).join(' ')],
            ['Documento', '1.019.884.215'],
            ['Fecha de nacimiento', '12 de abril de 2012'],
            ['Edad', '14 años'],
            ['Tipo de sangre', 'O+'],
            ['Teléfono', '+57 315 482 6610'],
            ['Email', 'valentina.ruiz@ejemplo.com'],
          ].map(([k, v]) => (
            <div key={k} style={{ border: '1px solid #F3F4F6', borderRadius: 12, padding: '10px 14px', height: 62, boxSizing: 'border-box' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{v}</div>
            </div>
          ))}
        </div>
      </Tarjeta>
      <Barra />
      <MenuJugadorPC tn={tn} vh={vh} nombre={nombre} />
      {encima}
    </div>
  );
};

/** El texto de la fila «Lesión» del perfil (UserDrawer: descripción · desde · regreso estimado). */
export const textoLesion = (descripcion: string, desde: string, hasta?: string) => [descripcion, `desde ${desde}`, hasta ? `regreso estimado ${hasta}` : null].filter(Boolean).join(' · ');

export { ContenidoUsuarios };
