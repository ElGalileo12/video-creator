// Estilo de marca: colores, fuente, logo y cuenta. Se aplica a todos los videos.
import { Thumbnail } from '@remotion/player';
import { useEffect, useMemo, useState, type FC } from 'react';
import { FUENTES_DISPONIBLES } from '../../src/estilo';
import { Portada } from '../../src/Portada';
import { proyectos } from '../../src/proyectos';
import { VideoVertical } from '../../src/VideoVertical';
import { api, type Marca as DatosMarca } from './api';
import { marcarCambiosSinGuardar } from './eventos';

const COLORES: [string, string, string][] = [
  ['fondo', 'Fondo', 'El color de fondo de todo el video'],
  ['fondo2', 'Brillo del fondo', 'La luz suave que se mueve detrás'],
  ['texto', 'Texto', 'Subtítulos y textos'],
  ['acento', 'Resaltado', 'La palabra que se está diciendo y los detalles importantes'],
  ['coral', 'Alerta', 'Para lo que está mal o falla'],
  ['turquesa', 'Dato', 'Para lo que está bien o un dato clave'],
];

// Carga las fuentes para poder verlas en la lista (solo en el Estudio).
const enlaceFuentes = `https://fonts.googleapis.com/css2?${FUENTES_DISPONIBLES.map((f) => `family=${f}:wght@800`).join('&')}&display=swap`;

export const Marca: FC = () => {
  const [marca, setMarca] = useState<DatosMarca | null>(null);
  const [guardada, setGuardada] = useState<DatosMarca | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionLogo, setVersionLogo] = useState(0);

  useEffect(() => {
    api.marca().then((m) => {
      setMarca(m);
      setGuardada(m);
    });
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: enlaceFuentes });
    document.head.append(link);
    return () => link.remove();
  }, []);

  const hayCambios = useMemo(() => JSON.stringify(marca) !== JSON.stringify(guardada), [marca, guardada]);
  useEffect(() => {
    marcarCambiosSinGuardar(hayCambios);
    return () => marcarCambiosSinGuardar(false);
  }, [hayCambios]);

  if (!marca) return <p className="pagina tenue">Cargando…</p>;

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const m = await api.guardarMarca(marca);
      setMarca(m);
      setGuardada(m);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const subirLogo = async (archivo?: File) => {
    if (!archivo) return;
    setError(null);
    try {
      const m = await api.subirLogo(archivo);
      setMarca({ ...marca, logo: m.logo });
      setGuardada((g) => g && { ...g, logo: m.logo });
      setVersionLogo((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const ejemplo = proyectos[0];

  return (
    <section className="pagina">
      <div className="titulo-pagina">
        <h1>Marca</h1>
        <button className="boton primario" disabled={!hayCambios || guardando} onClick={guardar}>
          {guardando ? 'Guardando…' : hayCambios ? 'Guardar y aplicar' : 'Guardado'}
        </button>
      </div>
      <p className="tenue">Se aplica a todos los videos. Para que los videos ya hechos cambien, vuelve a renderizarlos.</p>
      {error && <p className="error">{error}</p>}

      <div className="columnas">
        <div className="columna-edicion">
          <div className="caja">
            <h2>Tu cuenta</h2>
            <label className="campo">
              <span>Nombre de la cuenta</span>
              <input placeholder="@tucuenta" value={marca.cuenta} onChange={(e) => setMarca({ ...marca, cuenta: e.target.value })} />
            </label>
            <div className="logo-fila">
              <div className="logo-muestra">{marca.logo ? <img src={`/public/${marca.logo}?v=${versionLogo}`} alt="Logo" /> : <span>Sin logo</span>}</div>
              <label className="boton">
                Subir logo
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => subirLogo(e.target.files?.[0])} />
              </label>
              {marca.logo && (
                <button className="boton texto" onClick={() => setMarca({ ...marca, logo: '' })}>
                  Quitar
                </button>
              )}
            </div>
            <label className="casilla">
              <input type="checkbox" checked={marca.marcaDeAgua} onChange={(e) => setMarca({ ...marca, marcaDeAgua: e.target.checked })} />
              Mostrar el logo y la cuenta en una esquina de todos los videos
            </label>
          </div>

          <div className="caja">
            <h2>Fuente</h2>
            <div className="fuentes">
              {FUENTES_DISPONIBLES.map((f) => (
                <button key={f} className={`fuente ${marca.fuente === f ? 'elegida' : ''}`} onClick={() => setMarca({ ...marca, fuente: f })}>
                  <span style={{ fontFamily: `'${f}'`, fontWeight: 800 }}>¿Por qué?</span>
                  <small>{f}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="caja">
            <h2>Colores</h2>
            <div className="colores">
              {COLORES.map(([clave, nombre, ayuda]) => (
                <label key={clave} className="color">
                  <input
                    type="color"
                    value={marca.colores[clave]}
                    onChange={(e) => setMarca({ ...marca, colores: { ...marca.colores, [clave]: e.target.value } })}
                  />
                  <span>
                    <strong>{nombre}</strong>
                    <small>{ayuda}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {ejemplo && (
          <div className="columna-video">
            <p className="tenue pequeno">{hayCambios ? 'Guarda para ver los cambios aquí:' : 'Así se ve ahora:'}</p>
            <div className="muestras-marca">
              <Thumbnail
                component={Portada}
                inputProps={{ proyecto: ejemplo.id }}
                compositionWidth={1080}
                compositionHeight={1920}
                frameToDisplay={0}
                durationInFrames={1}
                fps={30}
                style={{ width: '100%', borderRadius: 12 }}
              />
              <Thumbnail
                component={VideoVertical}
                inputProps={{ proyecto: ejemplo.id }}
                compositionWidth={1080}
                compositionHeight={1920}
                frameToDisplay={75}
                durationInFrames={Math.round(ejemplo.tiempos.duracion * ejemplo.tiempos.fps)}
                fps={ejemplo.tiempos.fps}
                style={{ width: '100%', borderRadius: 12 }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
