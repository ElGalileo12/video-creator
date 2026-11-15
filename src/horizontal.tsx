// Videos horizontales (YouTube, 1920×1080) hechos con escenas pensadas en vertical (1080×1920).
// Cada escena se dibuja igual que siempre, en su lienzo vertical, y el `Escenario` la coloca en el cuadro
// horizontal con una escala. Lo que se ve a los lados queda fuera del lienzo vertical: los dibujos que
// ocupan todo el ancho (suelo, mar, 3D…) leen `useMarco()` para estirarse hasta los bordes del cuadro.
import { createContext, useContext, type CSSProperties, type FC, type ReactNode } from 'react';
import { ALTO, ANCHO } from './estilo';

export const ANCHO_H = 1920;
export const ALTO_H = 1080;
/** Altura (en el cuadro horizontal) del centro de la zona de dibujo: debajo quedan los subtítulos. */
export const CENTRO_DIBUJO_H = 465;

/** Cómo se ve una escena vertical en el cuadro horizontal: su escala y qué altura del lienzo vertical va al centro. */
export type Encuadre = { escala: number; centroY: number };

/**
 * Encuadre por defecto: lo más grande que cabe la zona de dibujo vertical (y ≈ 250–1330) encima de los subtítulos.
 * Los subtítulos van abajo, en una sola franja.
 */
export const ENCUADRE_H: Encuadre = { escala: 0.87, centroY: 768 };
export const SUBTITULOS_H = { caja: { top: 968, left: 220, right: 220 }, tamano: 58 };

/** Parte del lienzo vertical que se ve, en sus propias coordenadas (en vertical: el lienzo entero). */
export type Marco = { izq: number; der: number; arriba: number; abajo: number };

const MARCO_VERTICAL: Marco = { izq: 0, der: ANCHO, arriba: 0, abajo: ALTO };
const MarcoContexto = createContext<Marco>(MARCO_VERTICAL);

export const useMarco = () => useContext(MarcoContexto);

/** Ancho visible y desde dónde empieza: para lienzos que deben cubrir todo lo que se ve. */
export const useAnchoVisible = () => {
  const { izq, der } = useMarco();
  return { izq, ancho: der - izq };
};

export const marcoDe = ({ escala, centroY }: Encuadre): Marco => {
  const izq = ANCHO / 2 - ANCHO_H / 2 / escala;
  const arriba = centroY - CENTRO_DIBUJO_H / escala;
  return { izq, der: ANCHO - izq, arriba, abajo: arriba + ALTO_H / escala };
};

/** Coloca un lienzo vertical (1080×1920) dentro del cuadro horizontal, centrado y a la escala del encuadre. */
export const Escenario: FC<{ encuadre: Encuadre; children: ReactNode }> = ({ encuadre, children }) => {
  const marco = marcoDe(encuadre);
  return (
    <MarcoContexto.Provider value={marco}>
      <div
        style={{
          position: 'absolute',
          left: -marco.izq * encuadre.escala,
          top: -marco.arriba * encuadre.escala,
          width: ANCHO,
          height: ALTO,
          transform: `scale(${encuadre.escala})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </MarcoContexto.Provider>
  );
};

/** Capa del tamaño de todo lo que se ve (en vertical, igual que `AbsoluteFill`): para destellos y fondos de escena. */
export const Cubrir: FC<{ style?: CSSProperties; children?: ReactNode }> = ({ style, children }) => {
  const { izq, der, arriba, abajo } = useMarco();
  return <div style={{ position: 'absolute', left: izq, top: arriba, width: der - izq, height: abajo - arriba, ...style }}>{children}</div>;
};
