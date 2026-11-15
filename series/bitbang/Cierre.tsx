// Cierre de cada capítulo: el logo 3D nace de un destello, «BITBANG · LA FÍSICA EN DISPUTA» y el botón
// «SÍGUEME». La voz dice «Sígueme para más historias de la física.». Los últimos fotogramas vuelven al
// cielo de estrellas del principio, para que el video empalme en bucle.
import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { golpe, resorte, tramo, useDuracion, useMomento } from '../../src/escena';
import { RafagaPixeles } from './Pixeles';
import { Planeta3D } from './Planeta3D';
import { Plano } from './Plano';
import { bb, letra, SERIE } from './tema';

const CENTRO_PLANETA = 800;

export const CierreSerie: FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duracion = useDuracion();
  const sigueme = useMomento('sígueme');
  const historias = useMomento('historias');
  const destello = golpe(f, 0, 14);
  const nombre = resorte(f, 6, fps, { damping: 12, stiffness: 170 });
  const boton = resorte(f, sigueme + 2, fps, { damping: 10, stiffness: 200 });
  const lema = `${SERIE.lema}`;
  const escrito = lema.slice(0, Math.round(tramo(f, historias - 4, 16) * lema.length));
  const queda = 1 - tramo(f, duracion - 14, 11);
  return (
    <Plano salida={false} origen={{ x: 540, y: CENTRO_PLANETA }} zoom={0.04}>
      <AbsoluteFill style={{ opacity: queda }}>
        <div
          style={{
            position: 'absolute',
            left: 540 - 360,
            top: CENTRO_PLANETA - 360,
            width: 720,
            height: 720,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${bb.hueso} 0%, ${bb.ambar}AA 22%, transparent 62%)`,
            opacity: destello,
            transform: `scale(${0.4 + 1.2 * destello})`,
          }}
        />
        <Planeta3D desde={2} centroY={CENTRO_PLANETA} radio={210} />
        <RafagaPixeles x={540} y={CENTRO_PLANETA} desde={3} cantidad={64} apertura={360} velocidad={[8, 28]} gravedad={0.12} vida={40} colores={[bb.verde, bb.ambar]} semilla="logo" tamano={[6, 14]} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 330,
            textAlign: 'center',
            fontFamily: letra.titulo,
            fontWeight: 900,
            fontSize: 118,
            letterSpacing: 6,
            color: bb.ambar,
            opacity: Math.min(1, nombre * 1.5),
            transform: `scale(${0.7 + 0.3 * nombre})`,
            textShadow: `0 0 40px ${bb.ambar}44, 0 8px 30px rgba(0,0,0,0.6)`,
          }}
        >
          {SERIE.nombre}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 472, textAlign: 'center', fontFamily: letra.mono, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: bb.verde, textShadow: `0 0 16px ${bb.verde}66`, whiteSpace: 'pre' }}>
          {escrito.padEnd(lema.length, ' ')}
        </div>
        {boton > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1112, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                background: bb.ambar,
                color: bb.tinta,
                fontFamily: letra.texto,
                fontWeight: 700,
                fontSize: 92,
                letterSpacing: 2,
                padding: '10px 54px',
                boxShadow: `8px 8px 0 ${bb.verde}, 0 20px 50px rgba(0,0,0,0.5)`,
                transform: `scale(${0.5 + 0.5 * boton})`,
                opacity: Math.min(1, boton * 1.5),
              }}
            >
              SÍGUEME
            </div>
          </div>
        )}
        <RafagaPixeles x={540} y={1170} desde={sigueme} cantidad={26} apertura={360} velocidad={[6, 16]} gravedad={0.25} vida={26} colores={[bb.verde, bb.ambar, bb.hueso]} semilla="sigueme" />
      </AbsoluteFill>
    </Plano>
  );
};
