// Lienzo 3D del tamaño del cuadro: en vertical, 1080×1920; en un video horizontal, todo el ancho que se ve
// (ver src/horizontal.tsx), con el mismo centro, así lo que proyectan las cámaras no se mueve.
// Las cámaras que usan setViewOffset deben tomar el ancho de `camera.aspect * ALTO`, no ANCHO.
import { ThreeCanvas } from '@remotion/three';
import type { ComponentProps, FC } from 'react';
import { ALTO, ANCHO } from './estilo';
import { useAnchoVisible } from './horizontal';

export const LienzoTres: FC<Omit<ComponentProps<typeof ThreeCanvas>, 'width' | 'height'>> = (props) => {
  // ThreeCanvas pide un ancho entero: se redondea hacia afuera, igual a cada lado del centro.
  const { izq } = useAnchoVisible();
  const mitad = Math.ceil(ANCHO / 2 - izq);
  return (
    <div style={{ position: 'absolute', left: ANCHO / 2 - mitad, top: 0, width: mitad * 2, height: ALTO }}>
      <ThreeCanvas {...props} width={mitad * 2} height={ALTO} />
    </div>
  );
};
