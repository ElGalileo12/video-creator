import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { color, fontFamily } from './estilo';
import { MarcaDeAgua } from './Marca';
import { Fondo } from './piezas';
import { buscarProyecto } from './proyectos';

/** Imagen de portada: el dibujo del proyecto con el título grande arriba. */
export const Portada: FC<{ proyecto: string }> = ({ proyecto }) => {
  const { portada, acento = color.acento, estilo = {} } = buscarProyecto(proyecto);
  const { titulo, destacar, Dibujo } = portada;
  const FondoPortada = estilo.Fondo ?? Fondo;
  return (
    <AbsoluteFill style={{ fontFamily: estilo.fuente ?? fontFamily, color: color.texto }}>
      <FondoPortada />
      <Dibujo />
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 50,
          right: 50,
          textAlign: 'center',
          fontSize: 124,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: -2,
          textShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}
      >
        {titulo}
        <br />
        <span
          style={{
            display: 'inline-block',
            marginTop: 18,
            padding: '0 30px',
            borderRadius: 26,
            background: acento,
            color: color.fondo,
            textShadow: 'none',
          }}
        >
          {destacar}
        </span>
      </div>
      <MarcaDeAgua siempre abajo />
    </AbsoluteFill>
  );
};

/** Miniatura de un video horizontal (1280×720): el dibujo de la portada entero, que escribe el título a su manera. */
export const PortadaHorizontal: FC<{ proyecto: string }> = ({ proyecto }) => {
  const { portada, estilo = {} } = buscarProyecto(proyecto);
  const { titulo, destacar, Dibujo } = portada;
  return (
    <AbsoluteFill style={{ fontFamily: estilo.fuente ?? fontFamily, color: color.texto, background: color.fondo }}>
      <Dibujo titulo={titulo} destacar={destacar} />
    </AbsoluteFill>
  );
};
