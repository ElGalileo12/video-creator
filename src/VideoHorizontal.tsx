import type { FC } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { EscenaContexto } from './escena';
import { color, fontFamily } from './estilo';
import { ENCUADRE_H, Escenario, SUBTITULOS_H } from './horizontal';
import { MarcaDeAgua } from './Marca';
import { Fondo } from './piezas';
import { PLANTILLAS } from './plantillas';
import { buscarProyecto } from './proyectos';
import { Subtitulos } from './Subtitulos';
import type { Tiempos } from './tipos';
import { Aparecer, MusicaDeFondo, SinDibujo } from './VideoVertical';

const FondoSimple: FC<{ tiempos: Tiempos }> = () => <Fondo />;

/**
 * Video horizontal 1920×1080 (YouTube): una secuencia por escena, como el vertical. Cada dibujo vertical va en un
 * `Escenario` (src/horizontal.tsx) y los subtítulos en una franja abajo. Las escenas de `escenasHorizontales`
 * (p. ej. los puentes entre capítulos) ocupan el cuadro entero y no llevan subtítulos.
 * `tiempos` permite ver en el Estudio cambios todavía sin guardar.
 */
export const VideoHorizontal: FC<{ proyecto: string; tiempos?: Tiempos }> = ({ proyecto, tiempos: vistaPrevia }) => {
  const { tiempos: guardados, escenas, escenasHorizontales = {}, acento, estilo = {} } = buscarProyecto(proyecto);
  const tiempos = vistaPrevia ?? guardados;
  const { fps } = useVideoConfig();
  const { encuadre = ENCUADRE_H, Fondo: FondoVideo = FondoSimple, Encima } = estilo.horizontal ?? {};
  const { ocultarEn = [], abajo: _abajo, ...subtitulos } = estilo.subtitulos ?? {};
  return (
    <AbsoluteFill style={{ fontFamily: estilo.fuente ?? fontFamily, color: color.texto, background: color.fondo }}>
      <FondoVideo tiempos={tiempos} />
      {tiempos.escenas.map((e) => {
        const desde = Math.round(e.inicio * fps);
        const hasta = Math.round((e.inicio + e.duracion) * fps);
        const Ancho = e.plantilla ? undefined : escenasHorizontales[e.dibujo ?? e.id];
        const Dibujo = (e.plantilla ? PLANTILLAS[e.plantilla.tipo]?.Componente : escenas[e.dibujo ?? e.id]) ?? SinDibujo;
        return (
          <Sequence key={e.id} from={desde} durationInFrames={Math.max(1, hasta - desde)} name={e.id}>
            <EscenaContexto.Provider value={e}>
              {e.audio && <Html5Audio src={staticFile(e.audio)} />}
              <Aparecer activo={e.transicion !== 'corte'}>
                {Ancho ? (
                  <Ancho />
                ) : (
                  <Escenario encuadre={encuadre}>
                    <Dibujo />
                  </Escenario>
                )}
              </Aparecer>
              {!Ancho && !ocultarEn.includes(e.id) && <Subtitulos acento={acento} {...subtitulos} {...SUBTITULOS_H} />}
            </EscenaContexto.Provider>
          </Sequence>
        );
      })}
      {tiempos.musica && <MusicaDeFondo musica={tiempos.musica} tiempos={tiempos} />}
      {Encima && <Encima tiempos={tiempos} />}
      <MarcaDeAgua />
    </AbsoluteFill>
  );
};
