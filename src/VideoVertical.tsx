import { useMemo, type FC, type ReactNode } from 'react';
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EscenaContexto, tramo } from './escena';
import { color, fontFamily } from './estilo';
import { MarcaDeAgua } from './Marca';
import { Fondo } from './piezas';
import { PLANTILLAS } from './plantillas';
import { buscarProyecto } from './proyectos';
import { Subtitulos } from './Subtitulos';
import type { Musica, Tiempos } from './tipos';

export const Aparecer: FC<{ activo: boolean; children: ReactNode }> = ({ activo, children }) => {
  const frame = useCurrentFrame();
  if (!activo) return <AbsoluteFill>{children}</AbsoluteFill>;
  const t = tramo(frame, 0, 9, Easing.out(Easing.cubic));
  return <AbsoluteFill style={{ opacity: t, transform: `scale(${0.95 + 0.05 * t})` }}>{children}</AbsoluteFill>;
};

export const SinDibujo: FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', color: color.tenue, fontSize: 48, fontWeight: 700, textAlign: 'center', padding: 120 }}>
    Esta escena todavía no tiene dibujo.
  </AbsoluteFill>
);

/** Música de fondo: entra y sale suave, y baja cuando habla la voz. */
export const MusicaDeFondo: FC<{ musica: Musica; tiempos: Tiempos }> = ({ musica, tiempos }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const conVoz = useMemo(
    () =>
      tiempos.escenas
        .filter((e) => e.palabras.length > 0)
        .map((e) => [Math.round((e.inicio + e.palabras[0].inicio) * fps), Math.round((e.inicio + e.palabras.at(-1)!.fin) * fps)]),
    [tiempos, fps],
  );
  const volumen = (f: number) => {
    const bordes = Math.min(
      interpolate(f, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      interpolate(f, [durationInFrames - 30, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp' }),
    );
    let factor = 1;
    if (musica.bajarConVoz) {
      const distancia = Math.min(...conVoz.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)), Infinity);
      factor = interpolate(distancia, [0, 8], [0.35, 1], { extrapolateRight: 'clamp' });
    }
    return musica.volumen * bordes * factor;
  };
  // `extend`: al repetirse la canción, el volumen sigue el reloj del video y no vuelve a empezar.
  return (
    <Html5Audio
      src={staticFile(musica.archivo)}
      volume={volumen}
      loop
      loopVolumeCurveBehavior="extend"
      trimBefore={Math.round(musica.desde * fps)}
    />
  );
};

/**
 * Video vertical 1080×1920: una secuencia por escena, con su voz, su dibujo y sus subtítulos.
 * `tiempos` permite ver en el Estudio cambios todavía sin guardar (orden, plantillas, música…).
 */
export const VideoVertical: FC<{ proyecto: string; tiempos?: Tiempos }> = ({ proyecto, tiempos: vistaPrevia }) => {
  const { tiempos: guardados, escenas, acento, estilo = {} } = buscarProyecto(proyecto);
  const tiempos = vistaPrevia ?? guardados;
  const { fps } = useVideoConfig();
  const FondoVideo = estilo.Fondo ?? Fondo;
  const { ocultarEn = [], ...subtitulos } = estilo.subtitulos ?? {};
  return (
    <AbsoluteFill style={{ fontFamily: estilo.fuente ?? fontFamily, color: color.texto }}>
      <FondoVideo />
      {tiempos.escenas.map((e) => {
        const desde = Math.round(e.inicio * fps);
        const hasta = Math.round((e.inicio + e.duracion) * fps);
        const Dibujo = (e.plantilla ? PLANTILLAS[e.plantilla.tipo]?.Componente : escenas[e.dibujo ?? e.id]) ?? SinDibujo;
        return (
          <Sequence key={e.id} from={desde} durationInFrames={Math.max(1, hasta - desde)} name={e.id}>
            <EscenaContexto.Provider value={e}>
              {e.audio && <Html5Audio src={staticFile(e.audio)} />}
              <Aparecer activo={e.transicion !== 'corte'}>
                <Dibujo />
              </Aparecer>
              {!ocultarEn.includes(e.id) && <Subtitulos acento={acento} {...subtitulos} />}
            </EscenaContexto.Provider>
          </Sequence>
        );
      })}
      {tiempos.musica && <MusicaDeFondo musica={tiempos.musica} tiempos={tiempos} />}
      {estilo.Encima && <estilo.Encima />}
      <MarcaDeAgua />
    </AbsoluteFill>
  );
};
