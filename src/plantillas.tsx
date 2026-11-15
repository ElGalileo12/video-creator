// Plantillas de escena: se editan desde el Estudio con un formulario, sin tocar código.
// Cada plantilla define sus campos (para el formulario) y su animación.
import type { FC } from 'react';
import { AbsoluteFill, interpolateColors, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { resorte, tramo, useEscena } from './escena';
import { color } from './estilo';
import { Foto, Pildora } from './piezas';
import type { DatosPlantilla } from './tipos';

export type CampoPlantilla = {
  clave: string;
  etiqueta: string;
  tipo: 'texto' | 'textoLargo' | 'imagen' | 'lista' | 'opcion';
  opciones?: [string, string][];
  ayuda?: string;
};

export type DefinicionPlantilla = {
  nombre: string;
  descripcion: string;
  icono: string;
  campos: CampoPlantilla[];
  inicial: Record<string, string | string[]>;
  Componente: FC;
};

const COLORES: [string, string][] = [
  ['acento', 'Resaltado'],
  ['turquesa', 'Dato'],
  ['coral', 'Alerta'],
  ['texto', 'Texto'],
];
const colorDe = (nombre: string | undefined) => color[(nombre ?? 'acento') as keyof typeof color] ?? color.acento;

const useDatos = () => (useEscena().plantilla ?? { tipo: '' }) as DatosPlantilla;
const texto = (d: DatosPlantilla, clave: string) => (typeof d[clave] === 'string' ? (d[clave] as string) : '');
const lista = (d: DatosPlantilla, clave: string) =>
  (Array.isArray(d[clave]) ? (d[clave] as string[]) : []).map((x) => x.trim()).filter(Boolean);

// Fotograma de la escena en el que la voz llega a cierta fracción de lo que dice (0–1).
const useMomentoRelativo = () => {
  const escena = useEscena();
  const { fps } = useVideoConfig();
  const fin = escena.palabras.at(-1)?.fin ?? escena.duracion * 0.8;
  return (fraccion: number) => Math.round(fin * fraccion * fps);
};

// --- Texto grande ----------------------------------------------------------------------------

const Titulo: FC = () => {
  const d = useDatos();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tinta = colorDe(texto(d, 'color'));
  const palabras = texto(d, 'titulo').split(/\s+/).filter(Boolean);
  const sub = texto(d, 'subtitulo');
  const halo = tramo(f, 0, 20);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px' }}>
      <div
        style={{
          position: 'absolute',
          left: 540 - 420,
          top: 1050 - 420,
          width: 840,
          height: 840,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tinta}44 0%, transparent 65%)`,
          opacity: halo,
          transform: `scale(${0.8 + 0.2 * halo + Math.sin(f / 30) * 0.02})`,
        }}
      />
      <div style={{ marginTop: 120, textAlign: 'center' }}>
        <div style={{ fontSize: 124, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, color: tinta, textShadow: '0 10px 40px rgba(0,0,0,0.55)' }}>
          {palabras.map((p, i) => {
            const s = resorte(f, 4 + i * 4, fps, { damping: 11, stiffness: 160 });
            return (
              <span key={i} style={{ display: 'inline-block', margin: '0 14px', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})` }}>
                {p}
              </span>
            );
          })}
        </div>
        {sub && (
          <div style={{ marginTop: 36, fontSize: 56, fontWeight: 700, color: color.texto, opacity: tramo(f, 10 + palabras.length * 4, 12) }}>{sub}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// --- Foto con acercamiento --------------------------------------------------------------------

const FotoPlantilla: FC = () => {
  const d = useDatos();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imagen = texto(d, 'imagen');
  const pie = texto(d, 'pie');
  const contener = texto(d, 'ajuste') === 'contain';
  return (
    <AbsoluteFill>
      {imagen ? (
        <Foto src={imagen} y={1040} ancho={860} alto={contener ? 760 : 860} ajuste={contener ? 'contain' : 'cover'} zoom={0.1} rot={-1.5} />
      ) : (
        <div
          style={{
            position: 'absolute', left: 110, top: 610, width: 860, height: 860, borderRadius: 28,
            border: `6px dashed ${color.tenue}`, display: 'grid', placeItems: 'center', color: color.tenue, fontSize: 48, fontWeight: 700,
          }}
        >
          Elige una imagen
        </div>
      )}
      {pie && <Pildora x={540} y={1545} texto={pie} fondo={color.acento} tinta={color.fondo} tamano={48} escala={resorte(f, 12, fps, { damping: 11 })} rot={-2} />}
    </AbsoluteFill>
  );
};

// --- Número gigante ---------------------------------------------------------------------------

const Numero: FC = () => {
  const d = useDatos();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const valor = texto(d, 'valor');
  const etiqueta = texto(d, 'etiqueta');
  const tinta = colorDe(texto(d, 'color'));
  const entra = resorte(f, 0, fps, { damping: 12, stiffness: 120 });
  // Cada cifra gira como en una máquina tragamonedas hasta quedarse en su valor.
  const mostrado = [...valor]
    .map((c, i) => (/\d/.test(c) && f < 8 + i * 3 ? String(Math.floor(random(`${i}-${f}`) * 10)) : c))
    .join('');
  const tamano = Math.min(230, Math.round(1500 / Math.max(4, valor.length)));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((k) => {
        const t = ((f + k * 22) % 66) / 66;
        return (
          <div
            key={k}
            style={{
              position: 'absolute', left: 540 - 260, top: 1020 - 260, width: 520, height: 520, borderRadius: '50%',
              border: `6px solid ${tinta}`, opacity: (1 - t) * 0.3 * entra, transform: `scale(${0.8 + t * 1.1})`,
            }}
          />
        );
      })}
      <div style={{ marginTop: 100, textAlign: 'center', transform: `scale(${0.6 + 0.4 * entra})`, opacity: Math.min(1, entra * 1.5) }}>
        <div style={{ fontSize: tamano, fontWeight: 900, color: tinta, letterSpacing: -3, fontVariantNumeric: 'tabular-nums', textShadow: '0 12px 50px rgba(0,0,0,0.6)' }}>
          {mostrado}
        </div>
        {etiqueta && <div style={{ fontSize: 60, fontWeight: 800, color: color.texto, marginTop: 10, opacity: tramo(f, 14, 10) }}>{etiqueta}</div>}
      </div>
    </AbsoluteFill>
  );
};

// --- Lista ------------------------------------------------------------------------------------

const Lista: FC = () => {
  const d = useDatos();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const momento = useMomentoRelativo();
  const titulo = texto(d, 'titulo');
  const elementos = lista(d, 'elementos').slice(0, 5);
  const alto = 150;
  const arriba = 1060 - ((elementos.length - 1) * alto) / 2 + (titulo ? 50 : 0);
  return (
    <AbsoluteFill>
      {titulo && (
        <div style={{ position: 'absolute', left: 70, right: 70, top: arriba - 190, textAlign: 'center', fontSize: 70, fontWeight: 900, color: color.acento, opacity: tramo(f, 0, 10) }}>
          {titulo}
        </div>
      )}
      {elementos.map((el, k) => {
        const s = resorte(f, momento((k + 0.2) / elementos.length), fps, { damping: 13 });
        return (
          <div
            key={k}
            style={{
              position: 'absolute', left: 100, right: 100, top: arriba + k * alto - 58, height: 116, borderRadius: 22,
              background: color.fondo2, border: '2px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px',
              opacity: s, transform: `translateX(${(1 - s) * -120}px)`, boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            }}
          >
            <span style={{ width: 64, height: 64, flexShrink: 0, borderRadius: '50%', background: color.acento, color: color.fondo, display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 900 }}>
              {k + 1}
            </span>
            <span style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>{el}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- Comparación ------------------------------------------------------------------------------

const Comparacion: FC = () => {
  const d = useDatos();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const momento = useMomentoRelativo();
  const ganador = texto(d, 'ganador');
  const fallo = tramo(f, momento(0.75), 12);
  const lados: [string, number, string, string][] = [
    ['izquierda', 305, texto(d, 'tituloIzquierda'), texto(d, 'valorIzquierda')],
    ['derecha', 765, texto(d, 'tituloDerecha'), texto(d, 'valorDerecha')],
  ];
  return (
    <AbsoluteFill>
      {lados.map(([lado, x, titulo, valor], i) => {
        const s = resorte(f, 2 + i * 8, fps, { damping: 13 });
        const gana = ganador === lado;
        const pierde = ganador !== '' && ganador !== 'ninguno' && !gana;
        return (
          <div
            key={lado}
            style={{
              position: 'absolute', left: x - 205, top: 1060 - 320, width: 410, height: 640, borderRadius: 30,
              background: color.fondo2, border: `5px solid ${gana ? interpolateColors(fallo, [0, 1], ['rgba(255,255,255,0.1)', color.turquesa]) : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 30, textAlign: 'center',
              opacity: s * (pierde ? 1 - 0.45 * fallo : 1),
              transform: `translateX(${(1 - s) * (i === 0 ? -200 : 200)}px) scale(${gana ? 1 + 0.05 * fallo : 1})`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontSize: 50, fontWeight: 800, color: color.texto, lineHeight: 1.1 }}>{titulo}</div>
            <div style={{ fontSize: 96, fontWeight: 900, color: gana ? color.turquesa : color.acento, lineHeight: 1 }}>{valor}</div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute', left: 540 - 62, top: 1060 - 62, width: 124, height: 124, borderRadius: '50%', background: color.coral,
          color: color.fondo, display: 'grid', placeItems: 'center', fontSize: 50, fontWeight: 900,
          transform: `scale(${resorte(f, 14, fps, { damping: 9 })})`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        VS
      </div>
    </AbsoluteFill>
  );
};

export const PLANTILLAS: Record<string, DefinicionPlantilla> = {
  titulo: {
    nombre: 'Texto grande',
    descripcion: 'Una frase grande en el centro, palabra por palabra.',
    icono: 'Aa',
    campos: [
      { clave: 'titulo', etiqueta: 'Texto', tipo: 'texto' },
      { clave: 'subtitulo', etiqueta: 'Texto pequeño debajo (opcional)', tipo: 'texto' },
      { clave: 'color', etiqueta: 'Color', tipo: 'opcion', opciones: COLORES },
    ],
    inicial: { titulo: 'Tu frase aquí', subtitulo: '', color: 'acento' },
    Componente: Titulo,
  },
  foto: {
    nombre: 'Foto',
    descripcion: 'Una imagen con marco y un acercamiento lento.',
    icono: '🖼',
    campos: [
      { clave: 'imagen', etiqueta: 'Imagen', tipo: 'imagen' },
      { clave: 'pie', etiqueta: 'Etiqueta (opcional)', tipo: 'texto' },
      {
        clave: 'ajuste',
        etiqueta: 'Encuadre',
        tipo: 'opcion',
        opciones: [
          ['cover', 'Llenar el marco'],
          ['contain', 'Ver la imagen completa'],
        ],
      },
    ],
    inicial: { imagen: '', pie: '', ajuste: 'cover' },
    Componente: FotoPlantilla,
  },
  numero: {
    nombre: 'Número gigante',
    descripcion: 'Un dato en grande, con sus cifras girando al aparecer.',
    icono: '#',
    campos: [
      { clave: 'valor', etiqueta: 'Número o dato', tipo: 'texto', ayuda: 'Por ejemplo: 16.777.216 o 3,6 A' },
      { clave: 'etiqueta', etiqueta: 'Qué significa', tipo: 'texto' },
      { clave: 'color', etiqueta: 'Color', tipo: 'opcion', opciones: COLORES },
    ],
    inicial: { valor: '100', etiqueta: 'veces más', color: 'acento' },
    Componente: Numero,
  },
  lista: {
    nombre: 'Lista',
    descripcion: 'De 2 a 5 puntos que aparecen uno a uno mientras habla la voz.',
    icono: '☰',
    campos: [
      { clave: 'titulo', etiqueta: 'Título (opcional)', tipo: 'texto' },
      { clave: 'elementos', etiqueta: 'Puntos (uno por línea)', tipo: 'lista' },
    ],
    inicial: { titulo: '', elementos: ['Primer punto', 'Segundo punto', 'Tercer punto'] },
    Componente: Lista,
  },
  comparacion: {
    nombre: 'Comparación',
    descripcion: 'Dos opciones lado a lado, y cuál gana.',
    icono: '⇄',
    campos: [
      { clave: 'tituloIzquierda', etiqueta: 'Izquierda: nombre', tipo: 'texto' },
      { clave: 'valorIzquierda', etiqueta: 'Izquierda: valor', tipo: 'texto' },
      { clave: 'tituloDerecha', etiqueta: 'Derecha: nombre', tipo: 'texto' },
      { clave: 'valorDerecha', etiqueta: 'Derecha: valor', tipo: 'texto' },
      {
        clave: 'ganador',
        etiqueta: 'Cuál gana',
        tipo: 'opcion',
        opciones: [
          ['ninguno', 'Ninguno'],
          ['izquierda', 'Izquierda'],
          ['derecha', 'Derecha'],
        ],
      },
    ],
    inicial: { tituloIzquierda: 'Antes', valorIzquierda: '10', tituloDerecha: 'Ahora', valorDerecha: '100', ganador: 'derecha' },
    Componente: Comparacion,
  },
};

