// Publicar el torneo (desde `que-todos-lo-vean`), fiel a la app. Código (solo lectura):
// /Users/galileo/Documents/Gali Esport/gali-esport/app/(dashboard)/organizer/tournaments/[id]/
// - PublishModal.tsx: «Publicar torneo» (cohete violeta #7c3aed), «Requisitos completados» con su contador y su barra,
//   los 8 requisitos con su marca verde, «Cancelar» y «Publicar ahora» («Publicando…»).
// - TournamentDetailClient.tsx (PublishCallout): el aviso «Listo para publicar» del Resumen con todo completo.
// El aviso verde «¡Torneo publicado exitosamente!» es `AvisoApp` (invitaciones.tsx).
// Todo en píxeles de la app (pantalla de 1440 × 1040); va dentro de `Pantalla`.
import { ArrowRight, CheckCircle2, Rocket, Send, X } from 'lucide-react';
import type { FC } from 'react';
import { apretado, PANTALLA, type Punto } from './computador';

/** Los 8 requisitos, en el orden de la app (CHECKLIST_DEFS). */
export const REQUISITOS = [
  'Nombre del torneo',
  'Deporte definido',
  'Formato definido',
  'Fecha de inicio',
  'Fecha de fin',
  'Cupo máximo definido',
  'Mínimo 2 equipos aceptados',
  'Al menos 1 fase creada',
];

// Medidas de la ventana (maxWidth 460, centrada en la pantalla), calculadas con la letra de la app.
const ANCHO = 460;
const CABECERA = 65;
const PROGRESO = 50;
const FILA = 19.5;
const HUECO = 8;
const LISTA = 16 + REQUISITOS.length * FILA + (REQUISITOS.length - 1) * HUECO + 16;
const PIE = 72.5;
const ALTO = CABECERA + PROGRESO + LISTA + PIE;
/** La ventana «Publicar torneo» en la pantalla. */
export const VENTANA_PUB = { x: (PANTALLA.ancho - ANCHO) / 2, y: (PANTALLA.alto - ALTO) / 2, ancho: ANCHO, alto: ALTO };
/** Rectángulo de la fila `i` de requisitos (marca + texto). */
export const filaRequisito = (i: number) => ({ x: VENTANA_PUB.x + 22, y: VENTANA_PUB.y + CABECERA + PROGRESO + 16 + i * (FILA + HUECO), ancho: ANCHO - 44, alto: FILA });
/** Centro del botón «Publicar ahora». */
export const BOTON_PUBLICAR_AHORA: Punto = { x: VENTANA_PUB.x + 22 + (ANCHO - 44 - 10) / 3 + 10 + ((ANCHO - 44 - 10) * 2) / 3 / 2, y: VENTANA_PUB.y + ALTO - PIE + 1 + 16 + 19.75 };
/** Centro del contador «8/8». */
export const CONTADOR_PUB: Punto = { x: VENTANA_PUB.x + ANCHO - 22 - 12, y: VENTANA_PUB.y + CABECERA + 20 + 9 };

export type PropsVentanaPublicar = {
  /** Abierta (0 → 1): el fondo oscuro y la ventana. */
  t: number;
  /** Opacidad de cada fila (0 mientras su pieza anda en el 3D). */
  filas?: number[];
  /** Latido de la marca verde de cada fila (0 → 1 → 0). */
  golpes?: number[];
  resalteContador?: number;
  hoverPublicar?: number;
  apretarPublicar?: number;
  publicando?: boolean;
  /** Sin el fondo oscuro (para la «foto» del 3D). */
  sinFondo?: boolean;
};

/** Una fila de requisito: marca verde y texto. */
export const FilaRequisito: FC<{ texto: string; golpe?: number; opacidad?: number; i?: number }> = ({ texto, golpe = 0, opacidad = 1, i }) => (
  <div data-fila={i} style={{ display: 'flex', alignItems: 'center', gap: 10, height: FILA, opacity: opacidad }}>
    <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0, transform: golpe > 0 ? `scale(${1 + golpe * 0.45})` : undefined, filter: golpe > 0 ? `drop-shadow(0 0 ${6 * golpe}px rgba(34,197,94,0.9))` : undefined }} />
    <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{texto}</span>
  </div>
);

/** La ventana «Publicar torneo» con todos los requisitos completos (8/8). */
export const VentanaPublicar: FC<PropsVentanaPublicar> = ({ t, filas, golpes, resalteContador = 0, hoverPublicar = 0, apretarPublicar = 0, publicando = false, sinFondo = false }) => {
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: sinFondo ? 'transparent' : `rgba(0,0,0,${0.4 * Math.min(1, t)})`, backdropFilter: sinFondo ? undefined : `blur(${4 * Math.min(1, t)}px)` }}>
      <div data-ventana style={{ position: 'absolute', left: VENTANA_PUB.x, top: VENTANA_PUB.y, width: ANCHO, height: ALTO, background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 16}px) scale(${0.96 + 0.04 * t})` }}>
        {/* Cabecera */}
        <div style={{ height: CABECERA, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={18} color="#7c3aed" />
            <div style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Publicar torneo</div>
          </div>
          <div style={{ padding: 6, color: '#64748b', display: 'flex' }}>
            <X size={18} />
          </div>
        </div>
        {/* Progreso */}
        <div style={{ height: PROGRESO, boxSizing: 'border-box', padding: '20px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, height: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Requisitos completados</span>
            <span data-contador style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'inline-block', transform: resalteContador > 0 ? `scale(${1 + resalteContador * 0.6})` : undefined, transformOrigin: '100% 50%' }}>
              {REQUISITOS.length}/{REQUISITOS.length}
            </span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 6 }} />
          </div>
        </div>
        {/* Requisitos */}
        <div style={{ height: LISTA, boxSizing: 'border-box', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: HUECO }}>
          {REQUISITOS.map((r, i) => (
            <FilaRequisito key={r} i={i} texto={r} opacidad={filas?.[i] ?? 1} golpe={golpes?.[i] ?? 0} />
          ))}
        </div>
        {/* Pie */}
        <div style={{ height: PIE, boxSizing: 'border-box', display: 'flex', gap: 10, padding: '16px 22px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ flex: 1, height: 39.5, boxSizing: 'border-box', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, display: 'grid', placeItems: 'center' }}>Cancelar</div>
          <div
            data-publicar
            style={{
              flex: 2, height: 39.5, borderRadius: 10, background: publicando ? '#e2e8f0' : '#7c3aed', color: publicando ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: apretado(apretarPublicar),
              boxShadow: hoverPublicar > 0 && !publicando ? `0 0 0 ${4 * hoverPublicar}px rgba(124,58,237,0.25)` : 'none',
            }}
          >
            <Rocket size={14} />
            {publicando ? 'Publicando…' : 'Publicar ahora'}
          </div>
        </div>
      </div>
    </div>
  );
};

/** El aviso «Listo para publicar» del Resumen, con todo completo (PublishCallout). */
export const AvisoListo: FC<{ resalte?: number }> = ({ resalte = 0 }) => (
  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 18, color: '#fff', background: 'linear-gradient(135deg, #0ea5e9, #0c4a6e)', boxShadow: `0 12px 32px rgba(2, 132, 199, ${0.22 + 0.3 * resalte})` }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.5px)', backgroundSize: '14px 14px', maskImage: 'linear-gradient(135deg, black 0%, transparent 60%)', WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 60%)' }} />
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <Send size={13} />
        Listo para publicar
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>¡Tu torneo está listo!</div>
      <div style={{ fontSize: 12.5, opacity: 0.86, marginBottom: 14 }}>Publica para que los coaches puedan inscribir sus equipos.</div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 999 }} />
      </div>
      <div style={{ width: '100%', padding: '10px 14px', background: '#fff', color: '#0369a1', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' }}>
        Publicar ahora
        <ArrowRight size={15} />
      </div>
    </div>
  </div>
);
