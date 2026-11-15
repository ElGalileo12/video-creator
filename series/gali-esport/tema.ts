// Gali Esport: colores, letras y datos que se repiten en todos los videos de la marca.
// Los colores de la app salen de su código (solo lectura): /Users/galileo/Documents/Gali Esport/gali-esport
// (app/global.css y cada pantalla). Cada pantalla lleva SUS colores: el inicio usa el azul de marca; la lista y el
// detalle de torneos, azul cielo; los paneles de crear torneo e invitar, morado.
import { loadFont as cargarCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as cargarMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as cargarMontserrat } from '@remotion/google-fonts/Montserrat';

/** La letra de la app (app/fonts.ts). */
export const { fontFamily: montserrat } = cargarMontserrat('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: mono } = cargarMono('normal', { weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext'] });
/** Letra a mano para cuadernos y pensamientos. */
export const { fontFamily: aMano } = cargarCaveat('normal', { weights: ['600', '700'], subsets: ['latin', 'latin-ext'] });
/** Letra del celular (WhatsApp, correo). */
export const SISTEMA = '-apple-system, "SF Pro Text", Helvetica, sans-serif';

// --- Marca -------------------------------------------------------------------------------------------------

/** Celeste del isotipo y acento de los videos. */
export const CELESTE = '#00D4FF';
/** Azul noche del isotipo. */
export const MARINO = '#0A1520';
/** Polo de Camilo, el organizador. */
export const MORADO_CAMILO = '#7C3AED';
/** Chaqueta de Daniel, el entrenador. */
export const AZUL_DANIEL = '#2563EB';
/** La categoría de Daniel. */
export const ROSA_SUB14 = '#EC4899';

// --- Colores de la app ----------------------------------------------------------------------------------------

/** Azul de marca (--brand-hue 224): inicio del organizador y menú. */
export const AZUL = {
  b50: 'oklch(0.972 0.014 224)',
  b100: 'oklch(0.935 0.035 224)',
  b200: 'oklch(0.88 0.075 224)',
  b500: 'oklch(0.62 0.20 224)',
  b600: 'oklch(0.55 0.22 224)',
  b700: 'oklch(0.48 0.21 224)',
};
/** Neutros del panel (--gs-*). */
export const GS = { fondo: '#F6F8FB', borde: '#E5E9F0', texto: '#0F172A', tenue: '#64748B', sutil: '#94A3B8', sombra: '0 1px 2px rgba(15,23,42,0.04)' };
/** Azul cielo de la lista y el detalle de torneos (Tailwind sky). */
export const CIELO = { s50: '#f0f9ff', s100: '#e0f2fe', s200: '#bae6fd', s500: '#0ea5e9', s600: '#0284c7', s700: '#0369a1', s800: '#075985', s900: '#0c4a6e' };
/** Lilas y grises cálidos de las páginas del organizador. */
export const LILA = { texto: '#14101a', tenue: '#7a7388', medio: '#555064', oscuro: '#3a3344', borde: '#e7e3ee', sutil: '#a8a3b3', fondo: '#f1eef6', suave: '#f8f6fb', pagina: '#fafafb' };
/** Tailwind 3: morado del panel «Crear torneo». */
export const MORADO = { p50: '#faf5ff', p400: '#c084fc', p500: '#a855f7', p600: '#9333ea', p700: '#7e22ce' };
/** Violeta del panel «Invitar Coach» (#7c3aed). */
export const VIOLETA = '#7c3aed';
/** Tailwind 3: grises. */
export const GRIS = { g50: '#f9fafb', g100: '#f3f4f6', g200: '#e5e7eb', g300: '#d1d5db', g400: '#9ca3af', g500: '#6b7280', g600: '#4b5563', g700: '#374151', g800: '#1f2937', g900: '#111827' };
/** Pizarra (slate) de los paneles laterales. */
export const PIZARRA = { s100: '#f1f5f9', s200: '#e2e8f0', s300: '#cbd5e1', s400: '#94a3b8', s500: '#64748b' };
/** Estados (aceptada, pendiente, rechazada) como en la app. */
export const ESTADO = {
  verde: { bg: '#d1fae5', color: '#047857', punto: '#059669' },
  ambar: { bg: '#fef3c7', color: '#b45309', punto: '#d97706' },
  rojo: { bg: '#fef2f2', color: '#dc2626', punto: '#dc2626' },
  gris: { bg: '#f1eef6', color: '#555064', punto: '#555064' },
};

// --- El torneo de la serie del organizador ----------------------------------------------------------------------

/** La Copa Galileo que Camilo creó en `torneo-whatsapp`. */
export const COPA = { nombre: 'Copa Galileo 2026', corto: 'Copa Galileo', maximo: 16, formato: 'Grupos + Eliminación', fechas: '7 nov – 13 dic', diasParaArrancar: 17 };
