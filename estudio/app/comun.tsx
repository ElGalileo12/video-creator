// Piezas de interfaz que usan varias pantallas.
import { useEffect, useState, type FC } from 'react';
import { api, type Creditos, type EstadoProyecto, type Voces, type Voz } from './api';
import { useEventos } from './eventos';

export const formatearTiempo = (segundos: number) => {
  const s = Math.max(0, Math.round(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const Encabezado: FC<{ ruta: string }> = ({ ruta }) => {
  const [creditos, setCreditos] = useState<Creditos>(null);
  const cargar = () => {
    api.creditos().then(setCreditos).catch(() => setCreditos(null));
  };
  useEffect(cargar, []);
  useEventos((e) => {
    if (e.tipo === 'trabajo' && e.estado === 'listo' && e.accion === 'voz') cargar();
  });
  const activa = (prefijo: string) => (ruta === prefijo || (prefijo !== '/' && ruta.startsWith(prefijo)) ? 'activa' : '');
  return (
    <header className="encabezado">
      <a className="marca-estudio" href="#/">
        <span className="logo-estudio">▶</span> Estudio
      </a>
      <nav>
        <a className={activa('/') || activa('/proyecto')} href="#/">
          Videos
        </a>
        <a className={activa('/completos')} href="#/completos">
          Videos completos
        </a>
        <a className={activa('/nuevo')} href="#/nuevo">
          Video nuevo
        </a>
        <a className={activa('/marca')} href="#/marca">
          Marca
        </a>
      </nav>
      {creditos && (
        <div className="creditos" title={creditos.renueva ? `Se renuevan el ${creditos.renueva}` : undefined}>
          <span>Voz ElevenLabs</span>
          <div className="barra">
            <div style={{ width: `${Math.min(100, (creditos.usados / creditos.limite) * 100)}%` }} />
          </div>
          <span>
            {(creditos.limite - creditos.usados).toLocaleString('es')} créditos libres
          </span>
        </div>
      )}
    </header>
  );
};

/** Etiqueta con el estado de un video: si le falta voz, render, o está listo. */
export const EstadoVideo: FC<{ proyecto: EstadoProyecto }> = ({ proyecto: p }) => {
  if (p.trabajo) return <span className="etiqueta trabajando">{{ voz: 'Generando voz…', render: 'Renderizando…', tiempos: 'Actualizando…' }[p.trabajo.accion]}</span>;
  if (!p.registrado) return <span className="etiqueta">En preparación</span>;
  if (p.vozPendiente.length) return <span className="etiqueta aviso">Voz por generar ({p.vozPendiente.length})</span>;
  if (!p.video) return <span className="etiqueta aviso">Sin renderizar</span>;
  if (!p.video.alDia) return <span className="etiqueta aviso">Cambios sin renderizar</span>;
  return <span className="etiqueta bien">Listo</span>;
};

const claveVoz = (voz?: Voz | null) =>
  !voz ? '' : voz.proveedor === 'ninguna' ? 'ninguna' : voz.proveedor === 'mac' ? `mac:${voz.nombre}` : `el:${voz.id}`;

/** Selector de voz: voces de ElevenLabs de la cuenta y voces del Mac. */
export const SelectorVoz: FC<{
  valor: Voz | null | undefined;
  voces: Voces | null;
  planGratis: boolean;
  heredar?: string;
  onCambio: (voz: Voz | null) => void;
}> = ({ valor, voces, planGratis, heredar, onCambio }) => {
  const actual = claveVoz(valor);
  const conocida =
    !valor ||
    voces?.elevenlabs.some((v) => `el:${v.id}` === actual) ||
    voces?.mac.some((v) => `mac:${v.nombre}` === actual) ||
    actual === 'ninguna';

  const elegir = (clave: string) => {
    if (!clave) return onCambio(null);
    if (clave === actual) return onCambio(valor ?? null);
    if (clave === 'ninguna') return onCambio({ proveedor: 'ninguna', nombre: 'Sin voz' });
    if (clave.startsWith('mac:')) return onCambio({ proveedor: 'mac', nombre: clave.slice(4), velocidad: 175 });
    const v = voces?.elevenlabs.find((x) => `el:${x.id}` === clave);
    onCambio({ proveedor: 'elevenlabs', id: clave.slice(3), nombre: v?.nombre, modelo: 'eleven_v4' });
  };

  const propias = voces?.elevenlabs.filter((v) => !v.biblioteca) ?? [];
  const biblioteca = voces?.elevenlabs.filter((v) => v.biblioteca) ?? [];

  return (
    <select value={actual} onChange={(e) => elegir(e.target.value)}>
      {heredar !== undefined && <option value="">{heredar}</option>}
      {!conocida && valor && <option value={actual}>{valor.nombre ?? valor.id}</option>}
      <option value="ninguna">Sin voz (solo subtítulos)</option>
      {propias.length > 0 && (
        <optgroup label="ElevenLabs · voz natural">
          {[...propias]
            .sort((a, b) => Number(b.espanol) - Number(a.espanol))
            .map((v) => (
              <option key={v.id} value={`el:${v.id}`}>
                {v.nombre} · {v.descripcion}
                {v.espanol ? ' · español' : ''}
              </option>
            ))}
        </optgroup>
      )}
      {biblioteca.length > 0 && (
        <optgroup label={planGratis ? 'Biblioteca ElevenLabs · necesita plan de pago' : 'Biblioteca ElevenLabs'}>
          {biblioteca.map((v) => (
            <option key={v.id} value={`el:${v.id}`} disabled={planGratis}>
              {v.nombre} · {v.descripcion}
            </option>
          ))}
        </optgroup>
      )}
      {voces && (
        <optgroup label="Voces del Mac · gratis, para pruebas">
          {voces.mac.map((v) => (
            <option key={v.nombre} value={`mac:${v.nombre}`}>
              {v.etiqueta}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
};

const NUEVA = '__nueva';

/**
 * Selector de categoría de la biblioteca, con la opción de crear una nueva.
 * `vacio` añade una primera opción sin categoría (p. ej. «La elige Claude»).
 */
export const SelectorCategoria: FC<{ valor: string; categorias: string[]; vacio?: string; onCambio: (categoria: string) => void }> = ({
  valor, categorias, vacio, onCambio,
}) => {
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');
  const lista = valor && !categorias.includes(valor) ? [...categorias, valor] : categorias;
  const crear = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    onCambio(limpio);
    setCreando(false);
    setNombre('');
  };
  if (creando) {
    return (
      <span className="nueva-categoria">
        <input
          autoFocus
          placeholder="Nombre de la categoría"
          value={nombre}
          maxLength={40}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              crear();
            }
            if (e.key === 'Escape') setCreando(false);
          }}
        />
        <button type="button" className="boton" onClick={crear} disabled={!nombre.trim()}>
          Crear
        </button>
        <button type="button" className="boton texto" onClick={() => setCreando(false)}>
          Cancelar
        </button>
      </span>
    );
  }
  return (
    <select value={valor} onChange={(e) => (e.target.value === NUEVA ? setCreando(true) : onCambio(e.target.value))}>
      {vacio !== undefined && <option value="">{vacio}</option>}
      {lista.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={NUEVA}>+ Nueva categoría…</option>
    </select>
  );
};

/** Lista de categorías de la biblioteca (para los selectores). */
export const useCategorias = () => {
  const [categorias, setCategorias] = useState<string[]>([]);
  const cargar = () => {
    api.categorias().then(setCategorias).catch(() => {});
  };
  useEffect(cargar, []);
  return { categorias, recargarCategorias: cargar };
};

/** Carga las voces y el plan una vez por pantalla. */
export const useVoces = () => {
  const [voces, setVoces] = useState<Voces | null>(null);
  const [planGratis, setPlanGratis] = useState(false);
  useEffect(() => {
    api.voces().then(setVoces).catch(() => setVoces({ mac: [], elevenlabs: [] }));
    api.creditos().then((c) => setPlanGratis(c?.plan === 'free')).catch(() => {});
  }, []);
  return { voces, planGratis };
};
