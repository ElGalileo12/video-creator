// El calendario de la Copa Galileo (de `cada-partido-en-su-lugar`): los 8 equipos aceptados, los 12 partidos de la
// «Fase de grupos» en noviembre de 2026 con su hora y su sede (texto libre en la app), y los otros torneos de Camilo
// que salen en el calendario general. Todo inventado, siempre lo mismo.
import { COPA } from './tema';

export type Partido = { id: string; local: string; visitante: string; dia: number; hora: string; sede: string };
export type PartidoGeneral = Partido & { torneo: string };

/** La primera fase que Camilo crea (tipo «Fase de grupos», orden 1). */
export const FASE = 'Fase de grupos';
export const SEDES = { norte: 'Polideportivo Norte', bosque: 'Cancha El Bosque', colegio: 'Colegio San José', pradera: 'Estadio La Pradera' };

/** Noviembre de 2026 (`mes` empieza en 0). El 1 cae domingo. */
export const MES_COPA = { anio: 2026, mes: 10, nombre: 'noviembre', corto: 'nov', dias: 30 };
/** Hoy en los videos de la serie (21 de octubre de 2026). */
export const HOY = { anio: 2026, mes: 9, dia: 21 };

export const EQUIPOS_COPA = ['CD Norte', 'Halcones', 'Leones', 'Pumas FC', 'Tigres FC', 'Cóndores', 'Lobos FC', 'Panteras'];

/** Tres fechas de grupos: A (CD Norte, Halcones, Leones, Pumas FC) y B (Tigres FC, Cóndores, Lobos FC, Panteras). */
export const PARTIDOS_COPA: Partido[] = [
  { id: 'p1', local: 'CD Norte', visitante: 'Halcones', dia: 7, hora: '15:00', sede: SEDES.norte },
  { id: 'p2', local: 'Leones', visitante: 'Pumas FC', dia: 7, hora: '17:00', sede: SEDES.norte },
  { id: 'p3', local: 'Tigres FC', visitante: 'Cóndores', dia: 8, hora: '10:00', sede: SEDES.bosque },
  { id: 'p4', local: 'Lobos FC', visitante: 'Panteras', dia: 8, hora: '12:00', sede: SEDES.bosque },
  { id: 'p5', local: 'Halcones', visitante: 'Leones', dia: 11, hora: '19:00', sede: SEDES.norte },
  { id: 'p6', local: 'CD Norte', visitante: 'Pumas FC', dia: 14, hora: '15:00', sede: SEDES.norte },
  { id: 'p7', local: 'Cóndores', visitante: 'Lobos FC', dia: 14, hora: '17:00', sede: SEDES.bosque },
  { id: 'p8', local: 'Panteras', visitante: 'Tigres FC', dia: 15, hora: '10:00', sede: SEDES.bosque },
  { id: 'p9', local: 'Pumas FC', visitante: 'Halcones', dia: 18, hora: '19:00', sede: SEDES.norte },
  { id: 'p10', local: 'Leones', visitante: 'CD Norte', dia: 21, hora: '15:00', sede: SEDES.norte },
  { id: 'p11', local: 'Lobos FC', visitante: 'Tigres FC', dia: 21, hora: '17:00', sede: SEDES.bosque },
  { id: 'p12', local: 'Cóndores', visitante: 'Panteras', dia: 22, hora: '10:00', sede: SEDES.bosque },
];

/** Los otros torneos de Camilo con partidos en noviembre. */
export const OTROS_TORNEOS = ['Liga Infantil Sub-10', 'Copa Relámpago Sub-16'];

/** Todos los partidos de noviembre de los torneos de Camilo, en orden (calendario general). */
export const PARTIDOS_GENERAL: PartidoGeneral[] = [
  ...PARTIDOS_COPA.map((p) => ({ ...p, torneo: COPA.nombre })),
  { id: 'l1', local: 'Gaviotas', visitante: 'Rayos', dia: 7, hora: '09:00', sede: SEDES.colegio, torneo: OTROS_TORNEOS[0] },
  { id: 'r1', local: 'Toros', visitante: 'Águilas', dia: 8, hora: '11:00', sede: SEDES.pradera, torneo: OTROS_TORNEOS[1] },
  { id: 'l2', local: 'Búhos', visitante: 'Delfines', dia: 14, hora: '09:00', sede: SEDES.colegio, torneo: OTROS_TORNEOS[0] },
  { id: 'r2', local: 'Águilas', visitante: 'Toros', dia: 15, hora: '11:00', sede: SEDES.pradera, torneo: OTROS_TORNEOS[1] },
  { id: 'l3', local: 'Rayos', visitante: 'Búhos', dia: 21, hora: '09:00', sede: SEDES.colegio, torneo: OTROS_TORNEOS[0] },
].sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora));

// --- Fechas como las escribe la app ---------------------------------------------------------------------------

const SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const SEMANA_CORTA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const diaSemana = (dia: number) => new Date(MES_COPA.anio, MES_COPA.mes, dia).getDay();

/** «7 nov» (tarjetas de partido). */
export const fechaCorta = (dia: number) => `${dia} ${MES_COPA.corto}`;
/** «sábado, 7 de noviembre» (detalle del día; la app la pone con mayúsculas por CSS). */
export const fechaLarga = (dia: number) => `${SEMANA[diaSemana(dia)]}, ${dia} de ${MES_COPA.nombre}`;
/** «sáb» (calendario general). */
export const semanaCorta = (dia: number) => SEMANA_CORTA[diaSemana(dia)];
/** «03:00 p.m.» (el calendario general escribe la hora con es-MX de 12 horas). */
export const hora12 = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};
/** «07/11/2026» (campo de fecha) y «07/11/2026, 15:00» (campo de fecha y hora). */
export const fechaCampo = (dia: number) => `${String(dia).padStart(2, '0')}/${String(MES_COPA.mes + 1).padStart(2, '0')}/${MES_COPA.anio}`;
export const partidosDel = (dia: number, lista: Partido[] = PARTIDOS_COPA) => lista.filter((p) => p.dia === dia);

// --- La Copa en juego (desde `sabado-de-partidos`) ---------------------------------------------------------------
// La «Fase de grupos» quedó sorteada en dos grupos y ya se jugaron cinco partidos. El sábado 14 de noviembre Camilo
// lleva en vivo CD Norte – Pumas FC (15:00, Polideportivo Norte): gana CD Norte 1–0 con gol de Mateo.

export const GRUPOS = [
  { nombre: 'Grupo A', equipos: ['CD Norte', 'Halcones', 'Leones', 'Pumas FC'] },
  { nombre: 'Grupo B', equipos: ['Tigres FC', 'Cóndores', 'Lobos FC', 'Panteras'] },
];
export const grupoDe = (equipo: string) => GRUPOS.find((g) => g.equipos.includes(equipo))!;

/** Goles de los partidos ya finalizados (local, visitante). */
export const RESULTADOS: Record<string, [number, number]> = { p1: [1, 1], p2: [2, 0], p3: [0, 2], p4: [1, 1], p5: [2, 1] };

/** El partido del sábado 14 que Camilo lleva en vivo. */
export const PARTIDO_SABADO = PARTIDOS_COPA.find((p) => p.id === 'p6')!;
export const MARCADOR_SABADO: [number, number] = [1, 0];

export type TipoEvento = 'gol' | 'amarilla' | 'roja';
export type Evento = { lado: 'local' | 'visitante'; tipo: TipoEvento; jugador: string; minuto: number };
/** Lo que pasó en el partido del sábado 14. */
export const EVENTOS_SABADO: Evento[] = [
  { lado: 'local', tipo: 'gol', jugador: 'Mateo Rojas', minuto: 34 },
  { lado: 'local', tipo: 'amarilla', jugador: 'Tomás Gómez', minuto: 38 },
  { lado: 'visitante', tipo: 'roja', jugador: 'Emiliano Vega', minuto: 41 },
];

export type FilaTabla = { equipo: string; pj: number; g: number; e: number; p: number; gf: number; gc: number; dg: number; pts: number; forma: ('W' | 'D' | 'L')[] };

/**
 * Tabla de un grupo como la calcula la app (computeStandings de StagesClient): 3 puntos por ganar y 1 por empatar;
 * orden por puntos, diferencia de gol, goles a favor y nombre.
 */
export const tablaGrupo = (equipos: string[], resultados: Record<string, [number, number]>): FilaTabla[] => {
  const filas = new Map(equipos.map((e) => [e, { equipo: e, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0, forma: [] as FilaTabla['forma'] }]));
  for (const partido of PARTIDOS_COPA) {
    const r = resultados[partido.id];
    const l = filas.get(partido.local);
    const v = filas.get(partido.visitante);
    if (!r || !l || !v) continue;
    l.pj++, v.pj++;
    l.gf += r[0], l.gc += r[1], v.gf += r[1], v.gc += r[0];
    if (r[0] > r[1]) (l.g++, v.p++, (l.pts += 3), l.forma.push('W'), v.forma.push('L'));
    else if (r[0] < r[1]) (v.g++, l.p++, (v.pts += 3), v.forma.push('W'), l.forma.push('L'));
    else (l.e++, v.e++, l.pts++, v.pts++, l.forma.push('D'), v.forma.push('D'));
  }
  return [...filas.values()].map((f) => ({ ...f, dg: f.gf - f.gc })).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo));
};
