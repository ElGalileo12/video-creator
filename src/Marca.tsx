import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { color, marca } from './estilo';

/** Logo y @cuenta en una esquina del video, si la marca de agua está activada en marca.json. */
export const MarcaDeAgua: FC<{ siempre?: boolean; abajo?: boolean }> = ({ siempre, abajo }) => {
  if (!siempre && !marca.marcaDeAgua) return null;
  if (!marca.logo && !marca.cuenta) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: abajo ? 0 : 56,
        right: abajo ? 0 : undefined,
        top: abajo ? undefined : 64,
        bottom: abajo ? 110 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: abajo ? 'center' : 'flex-start',
        gap: 16,
        opacity: 0.88,
      }}
    >
      {marca.logo && <Img src={staticFile(marca.logo)} style={{ height: 64, width: 64, objectFit: 'contain', borderRadius: 14 }} />}
      {marca.cuenta && (
        <span style={{ fontSize: 40, fontWeight: 800, color: color.texto, textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}>
          {marca.cuenta}
        </span>
      )}
    </div>
  );
};
