// Conversación con el servidor del Estudio (estudio/servidor.mjs).

export type Voz = {
  /** 'ninguna': video sin voz (cada escena dura su pausa y el texto es un subtítulo fijo). */
  proveedor: 'mac' | 'elevenlabs' | 'ninguna';
  id?: string;
  nombre?: string;
  modelo?: string;
  velocidad?: number;
  ajustes?: Record<string, number>;
};

export type DatosPlantilla = { tipo: string } & Record<string, string | string[] | undefined>;

export type EscenaGuion = {
  id: string;
  texto: string;
  voz?: Voz;
  transicion?: 'corte' | 'fundido';
  pausa?: number;
  /** Usar el dibujo a medida de otra escena (al duplicar). */
  dibujo?: string;
  /** Escena hecha con una plantilla editable. */
  plantilla?: DatosPlantilla;
};

export type Musica = { archivo: string; volumen: number; bajarConVoz: boolean; desde: number };

export type ArchivoSubido = { archivo: string; nombre: string; tamano: number };

/**
 * Nota para Claude sobre un tramo del video. Empieza `desde` segundos después del inicio de la
 * escena `escena` (así se mueve con ella) y dura `duracion`; `inicio` es su segundo absoluto.
 */
export type Nota = {
  id: string;
  escena: string | null;
  desde: number;
  duracion: number;
  inicio: number;
  texto: string;
  imagen?: string;
  estado: 'pendiente' | 'hecha';
  respuesta?: string;
  creada: string;
};

export type Guion = {
  titulo: string;
  /** 'horizontal': video completo para YouTube (1920×1080). Lo pone Claude al armarlo; el Estudio no lo cambia. */
  formato?: 'vertical' | 'horizontal';
  /** Videos completos: id de la escena donde empieza cada capítulo de YouTube → su nombre (va en el post como {capitulos}). */
  capitulos?: Record<string, string>;
  voz: Voz;
  escenas: EscenaGuion[];
  portada: { titulo: string; destacar: string };
  post: string;
  musica?: Musica;
};

export type Trabajo = { accion: 'voz' | 'render' | 'tiempos'; lineas: string[]; inicio: number };

export type EstadoProyecto = {
  id: string;
  titulo: string;
  /** Corto vertical o video completo horizontal (apartado «Videos completos»). */
  formato: 'vertical' | 'horizontal';
  /** Grupo en la biblioteca (categorias.json). */
  categoria: string;
  /** División dentro de la categoría, si la categoría tiene (p. ej. Gali Esport: Entrenador, Organizador, Jugador). */
  division: string | null;
  /** Cuándo se creó el video (milisegundos): ordena las divisiones del más antiguo al más nuevo. */
  creado: number;
  escenas: number;
  duracion: number | null;
  registrado: boolean;
  vozPendiente: string[];
  notasPendientes: number;
  /** Escenas cuya voz no está en la memoria y cuesta créditos de ElevenLabs. */
  vozPorPagar: string[];
  creditosPorPagar: number;
  video: { url: string; alDia: boolean } | null;
  portada: string | null;
  trabajo: Trabajo | null;
};

export type DetalleProyecto = EstadoProyecto & { guion: Guion };

export type Voces = {
  mac: { nombre: string; etiqueta: string; idioma: string }[];
  elevenlabs: { id: string; nombre: string; descripcion: string; espanol: boolean; biblioteca: boolean }[];
};

export type Creditos = { plan: string; usados: number; limite: number; renueva: string | null } | null;

export type Pedido = {
  archivo: string;
  tema: string;
  detalles: string;
  voz: Voz | null;
  duracion: number;
  estado: 'pendiente' | 'en curso' | 'hecho';
  creado: string;
  proyecto?: string;
  categoria?: string;
  imagenes?: { archivo: string; uso: UsoImagen }[];
};

/** "referencia": Claude la mira para entender el tema o el estilo. "video": aparece dentro del video. */
export type UsoImagen = 'referencia' | 'video';

export type Marca = {
  cuenta: string;
  logo: string;
  marcaDeAgua: boolean;
  fuente: string;
  colores: Record<string, string>;
};

const pedir = async <T,>(camino: string, opciones?: RequestInit): Promise<T> => {
  const respuesta = await fetch(camino, opciones);
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error ?? `Error ${respuesta.status}`);
  return datos as T;
};

const enviar = (metodo: string, datos?: unknown): RequestInit => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: datos === undefined ? undefined : JSON.stringify(datos),
});

export const api = {
  proyectos: () => pedir<EstadoProyecto[]>('/api/proyectos'),
  proyecto: (id: string) => pedir<DetalleProyecto>(`/api/proyectos/${id}`),
  guardarGuion: (id: string, guion: object) => pedir<EstadoProyecto>(`/api/proyectos/${id}/guion`, enviar('PUT', guion)),
  generarVoz: (id: string) => pedir<{ ok: true }>(`/api/proyectos/${id}/voz`, enviar('POST')),
  renderizar: (id: string) => pedir<{ ok: true }>(`/api/proyectos/${id}/render`, enviar('POST')),
  voces: () => pedir<Voces>('/api/voces'),
  musica: () => pedir<ArchivoSubido[]>('/api/musica'),
  subirMusica: (archivo: File) =>
    pedir<{ archivo: string }>(`/api/musica?nombre=${encodeURIComponent(archivo.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': archivo.type || 'audio/mpeg' },
      body: archivo,
    }),
  notas: (id: string) => pedir<Nota[]>(`/api/proyectos/${id}/notas`),
  guardarNotas: (id: string, notas: Nota[]) => pedir<Nota[]>(`/api/proyectos/${id}/notas`, enviar('PUT', notas)),
  imagenes: (id: string) => pedir<ArchivoSubido[]>(`/api/proyectos/${id}/imagenes`),
  subirImagen: (id: string, archivo: File) =>
    pedir<{ archivo: string }>(`/api/proyectos/${id}/imagenes?nombre=${encodeURIComponent(archivo.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': archivo.type },
      body: archivo,
    }),
  creditos: () => pedir<Creditos>('/api/creditos'),
  pedidos: () => pedir<Pedido[]>('/api/pedidos'),
  categorias: () => pedir<string[]>('/api/categorias'),
  cambiarCategoria: (id: string, categoria: string) => pedir<EstadoProyecto>(`/api/proyectos/${id}/categoria`, enviar('PUT', { categoria })),
  /** Divisiones de cada categoría que las tiene: { "Gali Esport": ["Entrenador", …] }. */
  divisiones: () => pedir<Record<string, string[]>>('/api/divisiones'),
  cambiarDivision: (id: string, division: string | null) => pedir<EstadoProyecto>(`/api/proyectos/${id}/division`, enviar('PUT', { division })),
  crearPedido: (datos: { tema: string; detalles: string; voz: Voz | null; duracion: number; categoria: string }) =>
    pedir<{ archivo: string }>('/api/pedidos', enviar('POST', datos)),
  /** `imagenes`: las que ya tenía y se quedan (con su uso); las demás se borran. */
  editarPedido: (
    archivo: string,
    datos: { tema: string; detalles: string; voz: Voz | null; duracion: number; categoria: string; imagenes: { archivo: string; uso: UsoImagen }[] },
  ) => pedir<Pedido>(`/api/pedidos/${archivo}`, enviar('PUT', datos)),
  subirImagenPedido: (pedido: string, imagen: File, uso: UsoImagen) =>
    pedir<Pedido>(`/api/pedidos/${pedido}/imagenes?uso=${uso}`, {
      method: 'POST',
      headers: { 'Content-Type': imagen.type },
      body: imagen,
    }),
  borrarPedido: (archivo: string) => pedir<{ ok: true }>(`/api/pedidos/${archivo}`, enviar('DELETE')),
  borrarPedidosHechos: () => pedir<{ borrados: number }>('/api/pedidos/borrar-hechos', enviar('POST')),
  marca: () => pedir<Marca>('/api/marca'),
  guardarMarca: (marca: Partial<Marca>) => pedir<Marca>('/api/marca', enviar('PUT', marca)),
  subirLogo: (archivo: File) =>
    pedir<Marca>('/api/marca/logo', { method: 'POST', headers: { 'Content-Type': archivo.type }, body: archivo }),
};
