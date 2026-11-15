import { Fragment } from 'react';
import { Composition, Still } from 'remotion';
import { ALTO, ANCHO } from './estilo';
import { ALTO_H, ANCHO_H } from './horizontal';
import { Portada, PortadaHorizontal } from './Portada';
import { proyectos } from './proyectos';
import { VideoHorizontal } from './VideoHorizontal';
import { VideoVertical } from './VideoVertical';

export const RemotionRoot = () => (
  <>
    {proyectos.map((p) => {
      const horizontal = p.formato === 'horizontal';
      return (
        <Fragment key={p.id}>
          <Composition
            id={p.id}
            component={horizontal ? VideoHorizontal : VideoVertical}
            durationInFrames={Math.round(p.tiempos.duracion * p.tiempos.fps)}
            fps={p.tiempos.fps}
            width={horizontal ? ANCHO_H : ANCHO}
            height={horizontal ? ALTO_H : ALTO}
            defaultProps={{ proyecto: p.id }}
          />
          <Still
            id={`${p.id}-portada`}
            component={horizontal ? PortadaHorizontal : Portada}
            width={horizontal ? 1280 : ANCHO}
            height={horizontal ? 720 : ALTO}
            defaultProps={{ proyecto: p.id }}
          />
        </Fragment>
      );
    })}
  </>
);
