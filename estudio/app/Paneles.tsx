// Paneles del editor: la escena elegida, la música y el selector de plantillas para agregar escenas.
import { useEffect, useState, type FC } from 'react';
import { PLANTILLAS, type CampoPlantilla } from '../../src/plantillas';
import { api, type ArchivoSubido, type EscenaGuion, type Musica, type Nota, type Voces } from './api';
import { tiempoPreciso } from './LineaDeTiempo';
import { SelectorVoz } from './comun';

// --- Imágenes del video ---------------------------------------------------------------------

export const SelectorImagen: FC<{ proyecto: string; valor: string; onCambio: (archivo: string) => void }> = ({ proyecto, valor, onCambio }) => {
  const [imagenes, setImagenes] = useState<ArchivoSubido[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cargar = () => api.imagenes(proyecto).then(setImagenes).catch(() => setImagenes([]));
  useEffect(() => {
    cargar();
  }, [proyecto]);

  const subir = async (archivo?: File) => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const { archivo: ruta } = await api.subirImagen(proyecto, archivo);
      await cargar();
      onCambio(ruta);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="selector-imagen">
      <div className="imagenes-proyecto">
        {imagenes.map((img) => (
          <button key={img.archivo} className={img.archivo === valor ? 'elegida' : ''} onClick={() => onCambio(img.archivo)} title={img.nombre}>
            <img src={`/public/${img.archivo}`} alt="" />
          </button>
        ))}
        <label className="subir-imagen">
          {subiendo ? '…' : '+ Subir'}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => subir(e.target.files?.[0])} />
        </label>
      </div>
      {error && <p className="error pequeno">{error}</p>}
    </div>
  );
};

// --- Un campo de plantilla ----------------------------------------------------------------------

const CampoEditor: FC<{ campo: CampoPlantilla; valor: string | string[] | undefined; proyecto: string; onCambio: (v: string | string[]) => void }> = ({
  campo, valor, proyecto, onCambio,
}) => {
  const comoTexto = typeof valor === 'string' ? valor : '';
  let control;
  if (campo.tipo === 'textoLargo') control = <textarea rows={3} value={comoTexto} onChange={(e) => onCambio(e.target.value)} />;
  else if (campo.tipo === 'opcion')
    control = (
      <select value={comoTexto} onChange={(e) => onCambio(e.target.value)}>
        {campo.opciones?.map(([v, nombre]) => (
          <option key={v} value={v}>
            {nombre}
          </option>
        ))}
      </select>
    );
  else if (campo.tipo === 'lista')
    control = (
      <textarea
        rows={4}
        value={(Array.isArray(valor) ? valor : []).join('\n')}
        onChange={(e) => onCambio(e.target.value.split('\n'))}
      />
    );
  else if (campo.tipo === 'imagen') control = <SelectorImagen proyecto={proyecto} valor={comoTexto} onCambio={onCambio} />;
  else control = <input value={comoTexto} onChange={(e) => onCambio(e.target.value)} />;
  return (
    <label className="campo">
      <span>{campo.etiqueta}</span>
      {control}
      {campo.ayuda && <small className="tenue">{campo.ayuda}</small>}
    </label>
  );
};

// --- Panel de la escena elegida ----------------------------------------------------------------

export const PanelEscena: FC<{
  escena: EscenaGuion;
  numero: number;
  total: number;
  proyecto: string;
  pendiente: boolean;
  voces: Voces | null;
  planGratis: boolean;
  onCambio: (cambio: Partial<EscenaGuion>) => void;
  onMover: (direccion: -1 | 1) => void;
  onDuplicar: () => void;
  onBorrar: () => void;
}> = ({ escena, numero, total, proyecto, pendiente, voces, planGratis, onCambio, onMover, onDuplicar, onBorrar }) => {
  const definicion = escena.plantilla ? PLANTILLAS[escena.plantilla.tipo] : null;
  const cambiarDato = (clave: string, valor: string | string[]) =>
    onCambio({ plantilla: { ...escena.plantilla!, [clave]: valor } });
  return (
    <div className="panel">
      <div className="panel-cabeza">
        <h3>
          Escena {numero} <span className="tenue">· {escena.id}</span>
        </h3>
        <span className="etiqueta">{definicion ? `Plantilla: ${definicion.nombre}` : 'Dibujo a medida'}</span>
      </div>

      <label className="campo">
        <span>Lo que dice la voz</span>
        <textarea rows={Math.max(2, Math.ceil(escena.texto.length / 42))} value={escena.texto} onChange={(e) => onCambio({ texto: e.target.value })} />
      </label>
      {pendiente && <p className="aviso-pequeno">Esta escena necesita generar su voz (botón «Generar voz»).</p>}

      {definicion ? (
        definicion.campos.map((campo) => (
          <CampoEditor key={campo.clave} campo={campo} valor={escena.plantilla?.[campo.clave]} proyecto={proyecto} onCambio={(v) => cambiarDato(campo.clave, v)} />
        ))
      ) : (
        <p className="tenue pequeno">
          Esta animación la dibujó Claude a medida{escena.dibujo ? ` (es una copia de «${escena.dibujo}»)` : ''}. Para cambiarla, pídeselo en el
          chat. Si cambias el texto, revisa que la animación siga a tiempo.
        </p>
      )}

      <div className="opciones-escena">
        <label>
          Voz
          <SelectorVoz valor={escena.voz} voces={voces} planGratis={planGratis} heredar="La del video" onCambio={(voz) => onCambio({ voz: voz ?? undefined })} />
        </label>
        <label>
          Entrada
          <select value={escena.transicion ?? 'fundido'} onChange={(e) => onCambio({ transicion: e.target.value as 'corte' | 'fundido' })}>
            <option value="fundido">Fundido</option>
            <option value="corte">Corte directo</option>
          </select>
        </label>
        <label>
          Pausa al final
          <input
            type="number"
            min={0}
            max={60}
            step={0.1}
            placeholder="0.4"
            value={escena.pausa ?? ''}
            onChange={(e) => onCambio({ pausa: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="botones izquierda">
        <button className="boton" disabled={numero === 1} onClick={() => onMover(-1)}>
          ← Antes
        </button>
        <button className="boton" disabled={numero === total} onClick={() => onMover(1)}>
          Después →
        </button>
        <button className="boton" onClick={onDuplicar}>
          ⧉ Duplicar
        </button>
        <button className="boton peligro" disabled={total === 1} onClick={onBorrar}>
          🗑 Borrar
        </button>
      </div>
    </div>
  );
};

// --- Música de fondo ----------------------------------------------------------------------------

export const PanelMusica: FC<{ musica: Musica | undefined; onCambio: (musica: Musica | undefined) => void }> = ({ musica, onCambio }) => {
  const [canciones, setCanciones] = useState<ArchivoSubido[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cargar = () => api.musica().then(setCanciones).catch(() => setCanciones([]));
  useEffect(() => {
    cargar();
  }, []);

  const elegir = (archivo: string | null) =>
    onCambio(archivo ? { archivo, volumen: musica?.volumen ?? 0.2, bajarConVoz: musica?.bajarConVoz ?? true, desde: 0 } : undefined);

  const subir = async (archivo?: File) => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const { archivo: ruta } = await api.subirMusica(archivo);
      await cargar();
      elegir(ruta);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-cabeza">
        <h3>Música de fondo</h3>
      </div>
      <ul className="canciones">
        <li className={!musica ? 'elegida' : ''}>
          <label>
            <input type="radio" checked={!musica} onChange={() => elegir(null)} /> Sin música
          </label>
        </li>
        {canciones.map((c) => (
          <li key={c.archivo} className={musica?.archivo === c.archivo ? 'elegida' : ''}>
            <label>
              <input type="radio" checked={musica?.archivo === c.archivo} onChange={() => elegir(c.archivo)} /> {c.nombre}
            </label>
            {musica?.archivo === c.archivo && <audio controls preload="none" src={`/public/${c.archivo}`} />}
          </li>
        ))}
      </ul>
      <label className="boton">
        {subiendo ? 'Subiendo…' : '+ Subir canción'}
        <input type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg" hidden onChange={(e) => subir(e.target.files?.[0])} />
      </label>
      {error && <p className="error pequeno">{error}</p>}

      {musica && (
        <div className="ajustes-musica">
          <label className="campo">
            <span>Volumen: {Math.round(musica.volumen * 100)} %</span>
            <input type="range" min={0} max={100} value={Math.round(musica.volumen * 100)} onChange={(e) => onCambio({ ...musica, volumen: Number(e.target.value) / 100 })} />
          </label>
          <label className="casilla">
            <input type="checkbox" checked={musica.bajarConVoz} onChange={(e) => onCambio({ ...musica, bajarConVoz: e.target.checked })} />
            Bajar la música cuando habla la voz
          </label>
          <label className="campo">
            <span>Empezar la canción en el segundo</span>
            <input type="number" min={0} step={1} value={musica.desde} onChange={(e) => onCambio({ ...musica, desde: Math.max(0, Number(e.target.value) || 0) })} />
          </label>
        </div>
      )}
      <p className="tenue pequeno">
        Usa música tuya o libre de derechos para redes (por ejemplo, la Biblioteca de audio de YouTube o Pixabay Music). Si se acaba antes
        que el video, vuelve a empezar.
      </p>
    </div>
  );
};

// --- Agregar una escena con plantilla ----------------------------------------------------------

export const SelectorPlantilla: FC<{ onElegir: (tipo: string, texto: string) => void; onCerrar: () => void }> = ({ onElegir, onCerrar }) => {
  const [tipo, setTipo] = useState('titulo');
  const [texto, setTexto] = useState('');
  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar escena</h2>
        <div className="plantillas">
          {Object.entries(PLANTILLAS).map(([clave, p]) => (
            <button key={clave} className={`plantilla ${tipo === clave ? 'elegida' : ''}`} onClick={() => setTipo(clave)}>
              <span className="plantilla-icono">{p.icono}</span>
              <strong>{p.nombre}</strong>
              <small>{p.descripcion}</small>
            </button>
          ))}
        </div>
        <label className="campo">
          <span>¿Qué dice la voz en esta escena?</span>
          <textarea rows={3} autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Una o dos frases cortas." />
        </label>
        <p className="tenue pequeno">Luego llenas la plantilla en el panel de la escena. La voz se genera con el botón «Generar voz».</p>
        <div className="botones">
          <button className="boton" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="boton primario" disabled={!texto.trim()} onClick={() => onElegir(tipo, texto.trim())}>
            Agregar escena
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Notas para Claude ---------------------------------------------------------------------------

export const PanelNotas: FC<{
  notas: (Nota & { fin: number })[];
  elegida: string | null;
  proyecto: string;
  guardando: boolean;
  posicionActual: () => number;
  onElegir: (id: string) => void;
  onCambio: (id: string, cambio: Partial<Nota> & { fin?: number }) => void;
  onBorrar: (id: string) => void;
  onNuevaAqui: () => void;
  onIrA: (segundo: number) => void;
}> = ({ notas, elegida, proyecto, guardando, posicionActual, onElegir, onCambio, onBorrar, onNuevaAqui, onIrA }) => {
  const nota = notas.find((n) => n.id === elegida);
  const pendientes = notas.filter((n) => n.estado === 'pendiente').length;
  return (
    <div className="panel">
      <div className="panel-cabeza">
        <h3>Notas para Claude</h3>
        <span className="tenue pequeno">{guardando ? 'Guardando…' : 'Se guardan solas'}</span>
      </div>
      <p className="tenue pequeno">
        Arrastra sobre la pista de notas (arriba de las escenas) para marcar un tramo y escribe qué quieres cambiar ahí. Cuando termines,
        escríbele a Claude en el chat: <b>«revisa mis notas»</b>.
      </p>
      <button className="boton" onClick={onNuevaAqui}>
        + Nota en la posición actual
      </button>

      {nota && (
        <div className="nota-editor">
          <div className="dos-campos">
            <label className="campo">
              <span>Desde (segundos)</span>
              <div className="con-boton">
                <input type="number" step={0.001} min={0} value={nota.inicio.toFixed(3)} onChange={(e) => onCambio(nota.id, { inicio: Number(e.target.value) })} />
                <button className="boton texto" title="Usar la posición del reproductor" onClick={() => onCambio(nota.id, { inicio: posicionActual() })}>
                  ⌖ aquí
                </button>
              </div>
            </label>
            <label className="campo">
              <span>Hasta (segundos)</span>
              <div className="con-boton">
                <input type="number" step={0.001} min={0} value={nota.fin.toFixed(3)} onChange={(e) => onCambio(nota.id, { fin: Number(e.target.value) })} />
                <button className="boton texto" title="Usar la posición del reproductor" onClick={() => onCambio(nota.id, { fin: posicionActual() })}>
                  ⌖ aquí
                </button>
              </div>
            </label>
          </div>
          <p className="tenue pequeno">
            {tiempoPreciso(nota.inicio)} → {tiempoPreciso(nota.fin)} · {(nota.fin - nota.inicio).toFixed(3)} s
            <button className="boton texto" onClick={() => onIrA(nota.inicio)}>
              Ir al tramo
            </button>
          </p>
          <label className="campo">
            <span>¿Qué quieres en este tramo?</span>
            <textarea
              rows={4}
              autoFocus={!nota.texto}
              value={nota.texto}
              placeholder="Por ejemplo: que el fondo sea azul en este tramo, y después una imagen de la tira de leds a la derecha."
              onChange={(e) => onCambio(nota.id, { texto: e.target.value })}
            />
          </label>
          <div className="campo">
            <span>Imagen de referencia (opcional)</span>
            <SelectorImagen proyecto={proyecto} valor={nota.imagen ?? ''} onCambio={(imagen) => onCambio(nota.id, { imagen })} />
            {nota.imagen && (
              <button className="boton texto" onClick={() => onCambio(nota.id, { imagen: undefined })}>
                Quitar imagen
              </button>
            )}
          </div>
          {nota.estado === 'hecha' && (
            <div className="respuesta-claude">
              <strong>✓ Claude:</strong> {nota.respuesta || 'Hecho.'}
            </div>
          )}
          <div className="botones izquierda">
            {nota.estado === 'hecha' ? (
              <button className="boton" onClick={() => onCambio(nota.id, { estado: 'pendiente' })}>
                Volver a pedir
              </button>
            ) : null}
            <button className="boton peligro" onClick={() => onBorrar(nota.id)}>
              🗑 Borrar nota
            </button>
          </div>
        </div>
      )}

      {notas.length > 0 && (
        <>
          <h3 className="subtitulo-panel">
            Todas las notas <span className="tenue pequeno">({pendientes} pendientes)</span>
          </h3>
          <ul className="lista-notas">
            {notas.map((n) => (
              <li key={n.id} className={`${n.estado} ${n.id === elegida ? 'elegida' : ''}`} onClick={() => onElegir(n.id)}>
                <span className="tiempo">
                  {tiempoPreciso(n.inicio)} → {tiempoPreciso(n.fin)}
                </span>
                <span className="texto">{n.texto || '(sin texto)'}</span>
                <span className={`etiqueta ${n.estado === 'hecha' ? 'bien' : 'aviso'}`}>{n.estado === 'hecha' ? 'hecha' : 'pendiente'}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
