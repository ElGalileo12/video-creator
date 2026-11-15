// Ayudas para los momentos 3D de los videos de la app (de `torneo-whatsapp/Formatos3D.tsx`):
// la cámara que orbita un punto, el proyector para poner textos 2D encima del 3D, texturas dibujadas en un lienzo
// (con la letra de la app ya cargada) y un halo redondo para sombras y brillos.
//
// Regla de los pasos 2D ↔ 3D: el mundo usa 1 unidad = 100 píxeles de la app, y una cámara de arriba con FOV 30 a la
// distancia `distanciaArriba(escala)` ve exactamente lo mismo que la cámara 2D de `Pantalla` con esa escala.
import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import * as THREE from 'three';
import { montserrat } from './tema';

export const FOV = 30;

/** Distancia a la que la cámara 3D de arriba coincide píxel a píxel con una cámara 2D de esa escala. */
export const distanciaArriba = (escala: number) => 960 / (escala * 100 * Math.tan(((FOV / 2) * Math.PI) / 180));

export type Cam3D = { pos: THREE.Vector3; objetivo: THREE.Vector3 };
/** Cámara a distancia `r` del `objetivo`: `theta` es el ángulo desde la vertical (0 = de arriba) y `phi` el giro. */
export const camaraDesde = (theta: number, phi: number, r: number, objetivo: THREE.Vector3): Cam3D => ({
  pos: new THREE.Vector3(r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.cos(phi)).add(objetivo),
  objetivo,
});

/** Proyecta puntos del mundo a píxeles del video (1080 × 1920) con la cámara de este fotograma. */
export const crearProyector = (cam: Cam3D) => {
  const c = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 200);
  c.position.copy(cam.pos);
  c.lookAt(cam.objetivo);
  c.updateMatrixWorld();
  const v = new THREE.Vector3();
  return (x: number, y: number, z: number) => {
    v.set(x, y, z).project(c);
    return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920 };
  };
};

export const lienzo = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

export const textura = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Degradado redondo (para sombras suaves y halos). */
export const texturaRadial = (centro: string, borde: string) => {
  const [c, ctx] = lienzo(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, centro);
  g.addColorStop(1, borde);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

/** Parte un texto en líneas que quepan en `ancho` (como hace el navegador). */
export const partir = (ctx: CanvasRenderingContext2D, texto: string, ancho: number) => {
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of texto.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > ancho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  lineas.push(actual);
  return lineas;
};

/**
 * Espera a que la letra de la app cargue de verdad antes de dibujar texturas con texto (si no, salen con serifas).
 * `pesos` son los grosores de Montserrat que usan las texturas.
 */
export const useFuentes = (pesos: number[] = [400, 600, 700]) => {
  const [listas, setListas] = useState(false);
  const [espera] = useState(() => delayRender('Fuentes de las texturas 3D'));
  useEffect(() => {
    let vivo = true;
    const intentar = async (n: number) => {
      const caras = await Promise.all(pesos.map((p) => document.fonts.load(`${p} 12px ${montserrat}`)));
      if (!vivo) return;
      if (caras.every((c) => c.length > 0) || n > 200) setListas(true);
      else setTimeout(() => intentar(n + 1), 50);
    };
    intentar(0);
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (listas) continueRender(espera);
  }, [listas, espera]);
  return listas;
};

// --- «Foto» de una pantalla de la app para usarla como textura ---------------------------------------------------
// De `cada-partido-en-su-lugar`: en vez de redibujar a mano una pantalla en un lienzo, se dibuja la pantalla de verdad
// (los mismos componentes 2D) fuera de cuadro y se copian sus cajas, textos e íconos tal como los dejó el navegador.
// Así el tablero 3D coincide con la pantalla 2D al entrar y al salir del 3D.

type Op =
  | { t: 'caja'; x: number; y: number; w: number; h: number; o: number; bg: string | null; grad: string | null; bw: number[]; bc: string[]; rad: number[] }
  | { t: 'texto'; x: number; y: number; h: number; o: number; texto: string; font: string; color: string; ls: string; fs: number }
  | { t: 'svg'; x: number; y: number; w: number; h: number; o: number; html: string }
  | { t: 'recorte'; x: number; y: number; w: number; h: number; rad: number[] }
  | { t: 'fin' };

const transformarTexto = (texto: string, tt: string) =>
  tt === 'uppercase' ? texto.toUpperCase() : tt === 'capitalize' ? texto.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase()) : texto;

/** `degradados`: copiar también los fondos con degradados lineales y radiales (si no, solo el del encabezado del torneo). */
export type OpcionesFoto = { degradados?: boolean };

/**
 * Cuánto está achicada (o agrandada) la pantalla en el navegador. En el render vale 1, pero en la vista previa del
 * Estudio y de Remotion Studio el video se dibuja más chico y getBoundingClientRect devuelve medidas achicadas.
 */
export const escalaEnPantalla = (raiz: HTMLElement) => (raiz.offsetWidth ? raiz.getBoundingClientRect().width / raiz.offsetWidth : 1);

/** Rectángulo de `el` dentro de `raiz`, en píxeles de la pantalla sin achicar. */
export const rectDentro = (raiz: HTMLElement, el: Element | Range) => {
  const r0 = raiz.getBoundingClientRect();
  const k = escalaEnPantalla(raiz);
  const r = el.getBoundingClientRect();
  return { x: (r.left - r0.left) / k, y: (r.top - r0.top) / k, w: r.width / k, h: r.height / k };
};

const leerDom = (raiz: HTMLElement, opciones: OpcionesFoto = {}): Op[] => {
  const ops: Op[] = [];
  const visitar = (el: Element, opacidad: number) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const o = opacidad * parseFloat(cs.opacity);
    if (o <= 0.001) return;
    const { x, y, w: ancho, h: alto } = rectDentro(raiz, el);
    const r = { width: ancho, height: alto };
    if (el.tagName.toLowerCase() === 'svg') {
      let html = el.outerHTML.split('currentColor').join(cs.color);
      if (!html.includes('xmlns=')) html = html.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      ops.push({ t: 'svg', x, y, w: r.width, h: r.height, o, html });
      return;
    }
    const lados = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const bw = lados.map((s) => (cs.getPropertyValue(`border-${s.toLowerCase()}-style`) === 'none' ? 0 : parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`))));
    const bc = lados.map((s) => cs.getPropertyValue(`border-${s.toLowerCase()}-color`));
    const rad = ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((s) => Math.min(parseFloat(cs.getPropertyValue(`border-${s}-radius`)) || 0, r.width / 2, r.height / 2));
    const bg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : null;
    const grad = cs.backgroundImage.startsWith('radial-gradient(140%') || (opciones.degradados && cs.backgroundImage.includes('gradient(')) ? cs.backgroundImage : null;
    if (el !== raiz && r.width > 0 && (bg || grad || bw.some((w) => w > 0))) ops.push({ t: 'caja', x, y, w: r.width, h: r.height, o, bg, grad, bw, bc, rad });
    const recorta = el !== raiz && cs.overflow === 'hidden';
    if (recorta) ops.push({ t: 'recorte', x, y, w: r.width, h: r.height, rad });
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) {
        const texto = (n.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (!texto) continue;
        const rango = document.createRange();
        rango.selectNodeContents(n);
        const rr = rectDentro(raiz, rango);
        ops.push({
          t: 'texto',
          x: rr.x,
          y: rr.y,
          h: rr.h,
          o,
          texto: transformarTexto(texto, cs.textTransform),
          font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          color: cs.color,
          ls: cs.letterSpacing,
          fs: parseFloat(cs.fontSize),
        });
      } else if (n.nodeType === Node.ELEMENT_NODE) visitar(n as Element, o);
    }
    if (recorta) ops.push({ t: 'fin' });
  };
  for (const hijo of Array.from(raiz.children)) visitar(hijo, 1);
  return ops;
};

const cargarImagen = (html: string) =>
  new Promise<HTMLImageElement | null>((resolver) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => resolver(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(html)}`;
  });

/** Parte un texto por las comas que no están dentro de paréntesis. */
const partirComas = (texto: string) => {
  const partes: string[] = [];
  let nivel = 0;
  let actual = '';
  for (const c of texto) {
    if (c === '(') nivel++;
    if (c === ')') nivel--;
    if (c === ',' && nivel === 0) {
      partes.push(actual.trim());
      actual = '';
    } else actual += c;
  }
  if (actual.trim()) partes.push(actual.trim());
  return partes;
};

/** Paradas de color de un degradado («rgba(…) 55%»); las que no dicen dónde van se reparten. */
const paradas = (args: string[]) => {
  const lista = args.map((a) => {
    const m = a.match(/^(.*?)\s+([\d.]+)%$/);
    return m ? { color: m[1], pos: parseFloat(m[2]) / 100 } : { color: a, pos: NaN };
  });
  if (Number.isNaN(lista[0].pos)) lista[0].pos = 0;
  if (Number.isNaN(lista[lista.length - 1].pos)) lista[lista.length - 1].pos = 1;
  for (let i = 1; i < lista.length - 1; i++) {
    if (!Number.isNaN(lista[i].pos)) continue;
    let j = i;
    while (Number.isNaN(lista[j].pos)) j++;
    const a = lista[i - 1].pos;
    const b = lista[j].pos;
    for (let k = i; k < j; k++) lista[k].pos = a + ((b - a) * (k - i + 1)) / (j - i + 1);
  }
  return lista.map((p) => ({ color: p.color === 'transparent' ? 'rgba(0, 0, 0, 0)' : p.color, pos: Math.max(0, Math.min(1, p.pos)) }));
};

/** Pinta los fondos con degradados lineales y radiales de una caja (como los da getComputedStyle). */
const pintarCapas = (ctx: CanvasRenderingContext2D, fondo: string, x: number, y: number, w: number, h: number, rad: number[]) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
  ctx.clip();
  for (const capa of partirComas(fondo).reverse()) {
    const m = capa.match(/^(linear|radial)-gradient\((.*)\)$/s);
    if (!m) continue;
    const args = partirComas(m[2]);
    if (m[1] === 'linear') {
      let grados = 180;
      if (/deg$/.test(args[0])) grados = parseFloat(args.shift()!);
      else if (/^to /.test(args[0])) {
        const a = args.shift()!;
        grados = a.includes('right') ? 90 : a.includes('left') ? 270 : a.includes('top') ? 0 : 180;
      }
      const ang = (grados * Math.PI) / 180;
      const dx = Math.sin(ang);
      const dy = -Math.cos(ang);
      const largo = Math.abs(w * dx) + Math.abs(h * dy);
      const cx = x + w / 2;
      const cy = y + h / 2;
      const g = ctx.createLinearGradient(cx - (dx * largo) / 2, cy - (dy * largo) / 2, cx + (dx * largo) / 2, cy + (dy * largo) / 2);
      for (const p of paradas(args)) g.addColorStop(p.pos, p.color);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    } else {
      // «120% 90% at 100% 0%», «circle at 85% 20%», «closest-side»…
      let forma = /^(circle|ellipse|closest|farthest|[\d.]+(%|px))/.test(args[0]) || args[0].includes(' at ') || args[0].startsWith('at ') ? args.shift()! : '';
      const [tam, pos = '50% 50%'] = forma.includes('at ') ? forma.split(/\s*at\s+/) : [forma, '50% 50%'];
      const leer = (v: string, total: number) => (v.endsWith('%') ? (parseFloat(v) / 100) * total : parseFloat(v));
      const [px, py] = pos.trim().split(/\s+/);
      const cx = x + leer(px ?? '50%', w);
      const cy = y + leer(py ?? px ?? '50%', h);
      const medidas = tam.trim().split(/\s+/).filter((v) => /^[\d.]+(%|px)$/.test(v));
      let rx: number;
      let ry: number;
      const lejos = Math.max(Math.hypot(cx - x, cy - y), Math.hypot(cx - x - w, cy - y), Math.hypot(cx - x, cy - y - h), Math.hypot(cx - x - w, cy - y - h));
      if (medidas.length === 2) [rx, ry] = [leer(medidas[0], w), leer(medidas[1], h)];
      else if (tam.includes('closest-side')) rx = ry = Math.min(cx - x, x + w - cx, cy - y, y + h - cy);
      else if (tam.includes('circle')) rx = ry = lejos;
      else [rx, ry] = [Math.max(cx - x, x + w - cx) * Math.SQRT2, Math.max(cy - y, y + h - cy) * Math.SQRT2];
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      for (const p of paradas(args)) g.addColorStop(p.pos, p.color);
      ctx.fillStyle = g;
      ctx.fillRect(x - cx, (y - cy) * (rx / ry), w, h * (rx / ry));
      ctx.restore();
    }
  }
  ctx.restore();
};

/** El degradado del encabezado azul cielo del torneo (radial-gradient(140% 120% at 0% 0%, …)). */
const pintarDegradado = (ctx: CanvasRenderingContext2D, grad: string, x: number, y: number, w: number, h: number) => {
  const paradas = [...grad.matchAll(/(rgba?\([^)]*\))\s+([\d.]+)%/g)].map((m) => [m[1], parseFloat(m[2]) / 100] as const);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  // Elipse de 140 % del ancho por 120 % del alto, con centro en la esquina de arriba a la izquierda.
  const rx = w * 1.4;
  const ry = h * 1.2;
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  for (const [color, p] of paradas) g.addColorStop(Math.min(1, p), color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, (h * rx) / ry);
  ctx.restore();
};

/**
 * Copia en un lienzo lo que el navegador dibujó dentro de `raiz` (un div del tamaño de la pantalla, sin transformar):
 * fondos y bordes de las cajas, textos (con su letra, color y espaciado) e íconos SVG. `escala` = píxeles del lienzo
 * por píxel de la app.
 */
export const fotografiarDom = async (raiz: HTMLElement, escala: number, opciones: OpcionesFoto = {}) => {
  const r0 = { width: raiz.offsetWidth, height: raiz.offsetHeight };
  const ops = leerDom(raiz, opciones);
  const imagenes = await Promise.all(ops.map((op) => (op.t === 'svg' ? cargarImagen(op.html) : Promise.resolve(null))));
  const [c, ctx] = lienzo(Math.round(r0.width * escala), Math.round(r0.height * escala));
  ctx.scale(escala, escala);
  ctx.fillStyle = getComputedStyle(raiz).backgroundColor;
  ctx.fillRect(0, 0, r0.width, r0.height);
  ops.forEach((op, i) => {
    if (op.t === 'recorte') {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(op.x, op.y, op.w, op.h, op.rad);
      ctx.clip();
      return;
    }
    if (op.t === 'fin') {
      ctx.restore();
      return;
    }
    ctx.globalAlpha = op.o;
    if (op.t === 'caja') {
      if (op.grad) {
        if (opciones.degradados) pintarCapas(ctx, op.grad, op.x, op.y, op.w, op.h, op.rad);
        else pintarDegradado(ctx, op.grad, op.x, op.y, op.w, op.h);
      }
      if (op.bg) {
        ctx.beginPath();
        ctx.roundRect(op.x, op.y, op.w, op.h, op.rad);
        ctx.fillStyle = op.bg;
        ctx.fill();
      }
      const [arriba, der, abajo, izq] = op.bw;
      if (arriba > 0 && arriba === der && der === abajo && abajo === izq && op.bc.every((c) => c === op.bc[0])) {
        ctx.beginPath();
        ctx.roundRect(op.x + arriba / 2, op.y + arriba / 2, op.w - arriba, op.h - arriba, op.rad.map((r) => Math.max(0, r - arriba / 2)));
        ctx.strokeStyle = op.bc[0];
        ctx.lineWidth = arriba;
        ctx.stroke();
      } else {
        if (arriba > 0) ((ctx.fillStyle = op.bc[0]), ctx.fillRect(op.x, op.y, op.w, arriba));
        if (der > 0) ((ctx.fillStyle = op.bc[1]), ctx.fillRect(op.x + op.w - der, op.y, der, op.h));
        if (abajo > 0) ((ctx.fillStyle = op.bc[2]), ctx.fillRect(op.x, op.y + op.h - abajo, op.w, abajo));
        if (izq > 0) ((ctx.fillStyle = op.bc[3]), ctx.fillRect(op.x, op.y, izq, op.h));
      }
    } else if (op.t === 'texto') {
      ctx.font = op.font;
      ctx.letterSpacing = op.ls === 'normal' ? '0px' : op.ls;
      ctx.fillStyle = op.color;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      // La caja del texto mide ascendente + descendente de la letra (Montserrat: 0,968 y 0,251).
      ctx.fillText(op.texto, op.x, op.y + op.h * (0.968 / 1.219));
    } else if (op.t === 'svg') {
      const img = imagenes[i];
      if (img) ctx.drawImage(img, op.x, op.y, op.w, op.h);
    }
    ctx.globalAlpha = 1;
  });
  return c;
};

/**
 * Hace la «foto» de la pantalla dibujada dentro de `ref` una sola vez (cuando la letra ya cargó) y la devuelve como
 * textura. Mientras tanto detiene el render.
 */
export const useFotoDom = (ref: { current: HTMLElement | null }, listo: boolean, escala = 2) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [espera] = useState(() => delayRender('Foto de la pantalla para el 3D'));
  useEffect(() => {
    if (!listo || tex || !ref.current) return;
    let vivo = true;
    fotografiarDom(ref.current, escala).then((c) => {
      if (!vivo) return;
      setTex(textura(c));
      continueRender(espera);
    });
    return () => {
      vivo = false;
    };
  }, [listo, tex, ref, escala, espera]);
  return tex;
};
