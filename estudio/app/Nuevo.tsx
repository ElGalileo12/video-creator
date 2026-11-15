// Pedir un video nuevo: queda guardado en pedidos/ (con sus imágenes) hasta que Claude lo haga.
// Con `archivo` es la misma pantalla para editar un pedido que todavía no está hecho.
import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type FC, type FormEvent } from 'react';
import { api, type Pedido, type UsoImagen, type Voz } from './api';
import { SelectorCategoria, SelectorVoz, useCategorias, useVoces } from './comun';

const IDEAS = [
  '¿Por qué el cielo es azul?',
  '¿Por qué los aviones dejan rayas blancas en el cielo?',
  '¿Cómo sabe el GPS dónde estás?',
  '¿Por qué el pan se pone duro?',
  '¿Por qué las cebollas nos hacen llorar?',
];

const TIPOS_ACEPTADOS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAXIMO_MB = 15;

/** `archivo`: imagen nueva por subir. `guardada`: la que el pedido ya tenía (nombre en pedidos/<pedido>/). */
type ImagenElegida = { archivo?: File; guardada?: string; vista: string; uso: UsoImagen };

const DURACIONES = [
  { valor: 30, nombre: 'Corto · unos 30 s' },
  { valor: 40, nombre: 'Normal · unos 40 s' },
  { valor: 60, nombre: 'Largo · hasta 60 s' },
];

const liberar = (imagen: ImagenElegida) => imagen.archivo && URL.revokeObjectURL(imagen.vista);

export const Nuevo: FC<{ archivo?: string }> = ({ archivo: editando }) => {
  // Al editar: null mientras carga, o el aviso si el pedido ya no se puede editar.
  const [cargado, setCargado] = useState<Pedido | null>(null);
  const [noEditable, setNoEditable] = useState<string | null>(null);
  const [tema, setTema] = useState('');
  const [detalles, setDetalles] = useState('');
  const [duracion, setDuracion] = useState(40);
  const [voz, setVoz] = useState<Voz | null>(null);
  const [categoria, setCategoria] = useState('');
  const { categorias } = useCategorias();
  const [imagenes, setImagenes] = useState<ImagenElegida[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { voces, planGratis } = useVoces();

  // Liberar las vistas previas al salir de la pantalla.
  const elegidas = useRef<ImagenElegida[]>([]);
  elegidas.current = imagenes;
  useEffect(() => () => elegidas.current.forEach(liberar), []);

  useEffect(() => {
    if (!editando) return;
    api
      .pedidos()
      .then((lista) => {
        const pedido = lista.find((p) => p.archivo === editando);
        if (!pedido) return setNoEditable('Este pedido ya no existe.');
        if (pedido.estado === 'hecho') return setNoEditable('Este pedido ya está hecho: lo encuentras en tus videos.');
        const carpeta = `/pedidos/${editando.replace(/\.json$/, '')}`;
        setTema(pedido.tema);
        setDetalles(pedido.detalles ?? '');
        setDuracion(pedido.duracion || 40);
        setVoz(pedido.voz ?? null);
        setCategoria(pedido.categoria ?? '');
        setImagenes((pedido.imagenes ?? []).map((i) => ({ guardada: i.archivo, vista: `${carpeta}/${i.archivo}`, uso: i.uso })));
        setCargado(pedido);
      })
      .catch((e) => setNoEditable((e as Error).message));
  }, [editando]);

  const agregar = (archivos: Iterable<File>) => {
    const nuevas: ImagenElegida[] = [];
    const rechazadas: string[] = [];
    for (const archivo of archivos) {
      if (!TIPOS_ACEPTADOS.includes(archivo.type)) rechazadas.push(`${archivo.name} (formato no admitido)`);
      else if (archivo.size > MAXIMO_MB * 1024 * 1024) rechazadas.push(`${archivo.name} (más de ${MAXIMO_MB} MB)`);
      else nuevas.push({ archivo, vista: URL.createObjectURL(archivo), uso: 'referencia' });
    }
    setImagenes((actuales) => [...actuales, ...nuevas]);
    setError(rechazadas.length ? `No se agregaron: ${rechazadas.join(', ')}. Usa PNG, JPG, WEBP o GIF.` : null);
  };

  const quitar = (i: number) =>
    setImagenes((actuales) => {
      liberar(actuales[i]);
      return actuales.filter((_, j) => j !== i);
    });

  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    agregar(e.dataTransfer.files);
  };

  const pegar = (e: ClipboardEvent) => {
    const archivos = [...e.clipboardData.files].filter((f) => f.type.startsWith('image/'));
    if (archivos.length) {
      e.preventDefault();
      agregar(archivos);
    }
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setEnviando(editando ? 'Guardando los cambios…' : 'Guardando el pedido…');
      const datos = { tema, detalles, voz, duracion, categoria };
      const quedan = imagenes.flatMap((i) => (i.guardada ? [{ archivo: i.guardada, uso: i.uso }] : []));
      const archivo = editando
        ? (await api.editarPedido(editando, { ...datos, imagenes: quedan })).archivo
        : (await api.crearPedido(datos)).archivo;
      const nuevas = imagenes.filter((i) => i.archivo);
      for (const [i, imagen] of nuevas.entries()) {
        setEnviando(`Subiendo imágenes (${i + 1} de ${nuevas.length})…`);
        await api.subirImagenPedido(archivo, imagen.archivo!, imagen.uso);
      }
      setListo(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(null);
    }
  };

  const empezarOtro = () => {
    imagenes.forEach(liberar);
    setTema('');
    setDetalles('');
    setImagenes([]);
    setListo(false);
  };

  if (editando && (noEditable || !cargado)) {
    return (
      <section className="pagina estrecha">
        {noEditable ? (
          <div className="caja">
            <p>{noEditable}</p>
            <a className="boton" href="#/">
              Volver a mis videos
            </a>
          </div>
        ) : (
          <p className="tenue">Cargando el pedido…</p>
        )}
      </section>
    );
  }

  if (listo && editando) {
    return (
      <section className="pagina estrecha">
        <div className="caja exito">
          <h1>¡Pedido actualizado!</h1>
          <p>
            <strong>{tema}</strong>
            {imagenes.length > 0 && ` · ${imagenes.length} ${imagenes.length === 1 ? 'imagen' : 'imágenes'}`}
          </p>
          <p>
            Cuando quieras que lo haga, escríbeme en el chat: <b>«haz los videos pendientes»</b>.
          </p>
          <div className="botones">
            <a className="boton primario" href="#/">
              Ver mis videos
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (listo) {
    return (
      <section className="pagina estrecha">
        <div className="caja exito">
          <h1>¡Pedido guardado!</h1>
          <p>
            <strong>{tema}</strong>
            {imagenes.length > 0 && ` · ${imagenes.length} ${imagenes.length === 1 ? 'imagen' : 'imágenes'}`}
          </p>
          <p>
            Ahora escríbeme en el chat: <b>«haz los videos pendientes»</b>. Investigo el tema, escribo el guion, genero la voz,
            animo cada escena y lo verás aparecer en tus videos.
          </p>
          <div className="botones">
            <a className="boton primario" href="#/">
              Ver mis videos
            </a>
            <button className="boton" onClick={empezarOtro}>
              Pedir otro
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina estrecha" onPaste={pegar}>
      <h1>{editando ? 'Editar pedido' : 'Video nuevo'}</h1>
      <p className="tenue">
        {editando
          ? 'Cambia lo que quieras y guarda. Claude lo hará con lo que quede aquí.'
          : 'Cuéntame de qué va. Una frase basta; si tienes imágenes que ayuden, súbelas.'}
      </p>
      <form className="formulario" onSubmit={enviar}>
        <label className="campo">
          <span>Tema</span>
          <input autoFocus={!editando} required placeholder="¿Por qué…?" value={tema} onChange={(e) => setTema(e.target.value)} />
        </label>
        {!editando && (
          <div className="ideas">
            {IDEAS.map((idea) => (
              <button type="button" key={idea} className="chip" onClick={() => setTema(idea)}>
                {idea}
              </button>
            ))}
          </div>
        )}
        <label className="campo">
          <span>Detalles (opcional)</span>
          <textarea
            autoFocus={Boolean(editando)}
            rows={editando ? 14 : 4}
            placeholder="Enfoque, datos que quieres que salgan, tono, a quién va dirigido, cómo usar las imágenes…"
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
          />
        </label>

        <div className="campo">
          <span>Imágenes (opcional)</span>
          <label
            className={`zona-imagenes ${arrastrando ? 'encima' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={soltar}
          >
            <input
              type="file"
              accept={TIPOS_ACEPTADOS.join(',')}
              multiple
              hidden
              onChange={(e) => {
                agregar(e.target.files ?? []);
                e.target.value = '';
              }}
            />
            <strong>Arrastra imágenes aquí o haz clic para elegirlas</strong>
            <small>También puedes pegarlas con Cmd + V. PNG, JPG, WEBP o GIF, hasta {MAXIMO_MB} MB.</small>
          </label>
          {imagenes.length > 0 && (
            <ul className="imagenes-elegidas">
              {imagenes.map((imagen, i) => (
                <li key={imagen.vista}>
                  <img src={imagen.vista} alt="" />
                  <select
                    value={imagen.uso}
                    onChange={(e) =>
                      setImagenes((actuales) => actuales.map((x, j) => (j === i ? { ...x, uso: e.target.value as UsoImagen } : x)))
                    }
                  >
                    <option value="referencia">Solo de referencia</option>
                    <option value="video">Usarla en el video</option>
                  </select>
                  <button type="button" className="boton texto" onClick={() => quitar(i)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <small className="tenue">
            «Solo de referencia»: la miro para entender el tema o copiar un estilo. «Usarla en el video»: aparece dentro del video.
          </small>
        </div>

        <div className="dos-campos">
          <label className="campo">
            <span>Voz</span>
            <SelectorVoz valor={voz} voces={voces} planGratis={planGratis} heredar="La de siempre" onCambio={setVoz} />
          </label>
          <label className="campo">
            <span>Duración</span>
            <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
              {DURACIONES.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.nombre}
                </option>
              ))}
              {!DURACIONES.some((d) => d.valor === duracion) && <option value={duracion}>Unos {duracion} s</option>}
            </select>
          </label>
        </div>
        <label className="campo">
          <span>Categoría</span>
          <SelectorCategoria valor={categoria} categorias={categorias} vacio="La elige Claude según el tema" onCambio={setCategoria} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="boton primario grande" disabled={Boolean(enviando) || !tema.trim()}>
          {enviando ?? (editando ? 'Guardar cambios' : 'Pedir video')}
        </button>
        {editando && (
          <a className="boton texto" href="#/">
            Volver sin guardar
          </a>
        )}
      </form>
    </section>
  );
};
