// Avisos en vivo del servidor: recargas de la interfaz y progreso de los trabajos.
import { useEffect, useRef } from 'react';

export type Evento =
  | { tipo: 'hola' | 'recargar'; version: number; error: string | null }
  | { tipo: 'archivos' }
  | {
      tipo: 'trabajo';
      proyecto: string;
      accion: 'voz' | 'render' | 'tiempos';
      linea?: string;
      estado?: 'empezó' | 'listo' | 'falló';
      ultimas?: string[];
    };

const oyentes = new Set<(evento: Evento) => void>();
let fuente: EventSource | null = null;

export const escuchar = (oyente: (evento: Evento) => void) => {
  if (!fuente) {
    fuente = new EventSource('/eventos');
    fuente.onmessage = (mensaje) => {
      const evento = JSON.parse(mensaje.data) as Evento;
      for (const o of oyentes) o(evento);
    };
  }
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
};

export const useEventos = (oyente: (evento: Evento) => void) => {
  const actual = useRef(oyente);
  actual.current = oyente;
  useEffect(() => escuchar((evento) => actual.current(evento)), []);
};

// Las pantallas avisan si hay cambios sin guardar, para no recargar encima de ellos.
let cambiosSinGuardar = false;
export const marcarCambiosSinGuardar = (hay: boolean) => {
  cambiosSinGuardar = hay;
};
export const hayCambiosSinGuardar = () => cambiosSinGuardar;
