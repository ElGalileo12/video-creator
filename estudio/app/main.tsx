// Punto de entrada del Estudio: navegación entre pantallas y recarga en vivo.
import { StrictMode, useEffect, useState, type FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Biblioteca } from './Biblioteca';
import { Encabezado } from './comun';
import { hayCambiosSinGuardar, useEventos } from './eventos';
import { Marca } from './Marca';
import { Nuevo } from './Nuevo';
import { Proyecto } from './Proyecto';
import './estilos.css';

// Los archivos de public/ (audio, logo) se sirven en /public.
Object.assign(window, { remotion_staticBase: '/public' });

const useRuta = () => {
  const leer = () => window.location.hash.replace(/^#/, '') || '/';
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const alCambiar = () => setRuta(leer());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return ruta;
};

const App: FC = () => {
  const ruta = useRuta();
  const [version, setVersion] = useState<number | null>(null);
  const [nuevaVersion, setNuevaVersion] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  // Cuando cambia algún archivo del proyecto, el servidor reempaqueta y avisa: se recarga la página
  // (si no hay cambios sin guardar) para ver la versión nueva del video.
  useEventos((e) => {
    if (e.tipo !== 'hola' && e.tipo !== 'recargar') return;
    setErrorCodigo(e.error);
    if (e.error) return;
    if (version === null) return setVersion(e.version);
    if (e.version !== version) {
      if (hayCambiosSinGuardar()) setNuevaVersion(true);
      else window.location.reload();
    }
  });

  // Los videos completos se abren desde su apartado (#/completos/<id>), así el menú marca dónde estás.
  const proyecto = /^\/(?:proyecto|completos)\/([a-z0-9-]+)$/.exec(ruta)?.[1];
  const pedido = /^\/pedido\/([\w-]+)$/.exec(ruta)?.[1];
  let pantalla = <Biblioteca key="cortos" />;
  if (proyecto) pantalla = <Proyecto key={proyecto} id={proyecto} />;
  else if (pedido) pantalla = <Nuevo key={pedido} archivo={`${pedido}.json`} />;
  else if (ruta === '/completos') pantalla = <Biblioteca key="completos" formato="horizontal" />;
  else if (ruta === '/nuevo') pantalla = <Nuevo />;
  else if (ruta === '/marca') pantalla = <Marca />;

  return (
    <>
      <Encabezado ruta={ruta} />
      {errorCodigo && (
        <div className="aviso-global error">
          <strong>El código de las animaciones tiene un error.</strong> Si Claude está trabajando, espera a que termine; si
          no, pídele que lo revise.
          <details>
            <summary>Ver detalle</summary>
            <pre>{errorCodigo}</pre>
          </details>
        </div>
      )}
      {nuevaVersion && !errorCodigo && (
        <div className="aviso-global">
          Hay una versión nueva del video. Guarda tus cambios y luego
          <button className="boton texto" onClick={() => window.location.reload()}>
            actualiza la vista
          </button>
        </div>
      )}
      <main>{pantalla}</main>
    </>
  );
};

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
