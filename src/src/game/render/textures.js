// Procedural canvas textures + a neon environment map for reflections. No image files anywhere.
import * as THREE from 'three';
import { mulberry } from '../sim.js';

const canvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};

// Asphalt: 10.8 m wide × 24 m long tile. Edge lines + two dashed lane lines + grime + puddle mask (alpha → roughness).
export function roadTextures() {
  const W = 512, H = 1024;
  const [c, g] = canvas(W, H);
  const r = mulberry(4);
  g.fillStyle = '#17151d';
  g.fillRect(0, 0, W, H);
  // aggregate speckle
  for (let i = 0; i < 26000; i++) {
    const v = 18 + r() * 26;
    g.fillStyle = `rgb(${v},${v - 2},${v + 6})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  // tyre tracks (darker, polished) in each lane
  const lane = W / 3;
  g.globalAlpha = 0.18;
  g.fillStyle = '#05040a';
  for (let l = 0; l < 3; l++) for (const o of [0.28, 0.72]) g.fillRect(l * lane + lane * o - 14, 0, 28, H);
  g.globalAlpha = 1;
  // edge lines
  g.fillStyle = '#d9d6ce';
  g.fillRect(10, 0, 9, H);
  g.fillRect(W - 19, 0, 9, H);
  // dashed lane lines: 6 m dash, 6 m gap (tile = 24 m → 2 dashes)
  for (let l = 1; l < 3; l++) {
    for (let k = 0; k < 2; k++) {
      g.fillStyle = '#e8e2c8';
      g.fillRect(l * lane - 4, k * (H / 2), 8, H / 4);
    }
  }
  // cracks / patches
  g.strokeStyle = 'rgba(0,0,0,.35)';
  for (let i = 0; i < 18; i++) {
    g.lineWidth = 1 + r() * 1.5;
    g.beginPath();
    let x = r() * W, y = r() * H;
    g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += (r() - 0.5) * 40; y += r() * 30; g.lineTo(x, y); }
    g.stroke();
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;

  // roughness: wet puddles (dark = glossy). Painted lines are rougher.
  const [rc, rg] = canvas(256, 512);
  rg.fillStyle = '#9a9a9a';
  rg.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 60; i++) {
    const x = r() * 256, y = r() * 512, rx = 10 + r() * 50, ry = 20 + r() * 90;
    const grd = rg.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    grd.addColorStop(0, 'rgba(10,10,10,0.95)');
    grd.addColorStop(1, 'rgba(10,10,10,0)');
    rg.fillStyle = grd;
    rg.beginPath();
    rg.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    rg.fill();
  }
  const rough = new THREE.CanvasTexture(rc);
  for (const t of [map, rough]) {
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  }
  return { map, rough };
}

// Kerb: alternating 3 m neon blocks (emissive map).
export function kerbTexture(a, b) {
  const [c, g] = canvas(16, 128);
  g.fillStyle = a;
  g.fillRect(0, 0, 16, 64);
  g.fillStyle = b;
  g.fillRect(0, 64, 16, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  return t;
}

// Ground beside the road: faint neon survey grid.
export function gridTexture(color) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#000';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = color;
  g.globalAlpha = 0.5;
  g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  g.globalAlpha = 0.15;
  g.lineWidth = 1;
  for (let i = 64; i < 256; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// Billboard panel with a slogan. The house shape: cut corner + HUD ticks.
export function billboardTexture(text, color, sub = '') {
  const [c, g] = canvas(1024, 384);
  g.fillStyle = '#07060b';
  g.fillRect(0, 0, 1024, 384);
  // halftone dots
  g.fillStyle = color;
  g.globalAlpha = 0.12;
  for (let y = 10; y < 384; y += 14) for (let x = 10 + ((y / 14) % 2) * 7; x < 1024; x += 14) {
    const s = 1 + 3 * (x / 1024);
    g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  g.strokeStyle = color;
  g.lineWidth = 14;
  g.strokeRect(18, 18, 988, 348);
  g.beginPath(); g.moveTo(1006, 300); g.lineTo(940, 366); g.lineTo(1006, 366); g.closePath(); g.fill();
  g.font = '700 150px Rajdhani, "Chakra Petch", Arial Narrow, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let size = 150;
  while (g.measureText(text).width > 900 && size > 60) { size -= 6; g.font = `700 ${size}px Rajdhani, "Chakra Petch", Arial Narrow, sans-serif`; }
  g.fillStyle = color;
  g.fillText(text, 512, sub ? 172 : 196);
  if (sub) {
    g.font = '400 34px "Share Tech Mono", monospace';
    g.globalAlpha = 0.8;
    g.fillText(sub, 512, 300);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function plateTexture(text = '2FAST4U') {
  const [c, g] = canvas(256, 64);
  g.fillStyle = '#e9e4d8';
  g.fillRect(0, 0, 256, 64);
  g.fillStyle = '#0d0d0d';
  g.fillRect(4, 4, 248, 56);
  g.fillStyle = '#e9e4d8';
  g.font = '400 40px "Share Tech Mono", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Neon "room" rendered once into a PMREM env map: what the car paint and wet road reflect.
export function neonEnvironment(renderer, colors) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05040a');
  const box = new THREE.BoxGeometry(1, 1, 1);
  const add = (color, intensity, pos, scale) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity * 0.55) }));
    m.position.set(...pos);
    m.scale.set(...scale);
    scene.add(m);
  };
  // sky strip, horizon glow, long neon tubes on both sides, a few window blocks
  add(colors.horizon, 1.6, [0, 10, -30], [120, 6, 1]);
  add(colors.zenith, 1.0, [0, 30, 0], [120, 1, 120]);
  add(colors.a, 4, [-14, 4, 0], [0.4, 0.4, 80]);
  add(colors.b, 4, [14, 4, 0], [0.4, 0.4, 80]);
  add(colors.c, 2.5, [-20, 9, -10], [0.3, 12, 6]);
  add(colors.a, 2.5, [22, 7, 8], [0.3, 8, 5]);
  add(colors.glow, 2.0, [0, 6, 30], [60, 4, 1]);
  add('#ffffff', 3, [0, 18, -6], [10, 0.3, 0.3]);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(scene, 0.02);
  pm.dispose();
  scene.traverse((o) => o.material && o.material.dispose());
  box.dispose();
  return rt;
}

// ---------------------------------------------------------------- Tokyo signage (render/tokyo.js)
// One 2048² canvas atlas holds every shop sign, road sign and plate, so the whole city's signage is two draw calls.
// Shop names are invented (config.js TOKYO_SIGNS); road signs follow Japanese conventions (green guide signs, white text,
// romaji below, red-ring speed limits with blue numerals, ward boundary plates). Drawn again once the web fonts arrive.
export const JP = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
const fitFont = (g, text, weight, family, max, width) => {
  let size = max;
  g.font = `${weight} ${size}px ${family}`;
  while (g.measureText(text).width > width && size > 8) { size -= 2; g.font = `${weight} ${size}px ${family}`; }
  return size;
};
export function fitText(g, text, x, y, width, max, weight = 900, family = JP) { fitFont(g, text, weight, family, max, width); g.fillText(text, x, y); }
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
export { rr as roundRect };

/** entries: [{ id, w, h, draw(g, w, h) }] → { texture, rect(id) → [u, v, du, dv], redraw() } (shelf-packed, 4 px gutters). */
export function createAtlas(entries, size = 2048) {
  const [c, g] = canvas(size, size);
  const pos = new Map();
  const sorted = [...entries].sort((a, b) => b.h - a.h);
  let x = 0, y = 0, rowH = 0;
  for (const e of sorted) {
    const w = e.w + 8, h = e.h + 8;
    if (x + w > size) { x = 0; y += rowH; rowH = 0; }
    if (y + h > size) { console.warn('atlas full at', e.id); break; }
    pos.set(e.id, [x + 4, y + 4, e.w, e.h, e]);
    x += w; rowH = Math.max(rowH, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  const redraw = () => {
    g.clearRect(0, 0, size, size);
    for (const [, [px, py, w, h, e]] of pos) {
      g.save(); g.translate(px, py); g.beginPath(); g.rect(-2, -2, w + 4, h + 4); g.clip();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      try { e.draw(g, w, h); } catch { /* a missing glyph never breaks the atlas */ }
      g.restore();
      // gutter: repeat the cell's border colour outward so mipmaps don't bleed neighbours in
      for (const [sx, sy, sw, sh, dx, dy, dw, dh] of [[px, py, w, 1, px, py - 4, w, 4], [px, py + h - 1, w, 1, px, py + h, w, 4], [px, py, 1, h, px - 4, py, 4, h], [px + w - 1, py, 1, h, px + w, py, 4, h]]) g.drawImage(c, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    tex.needsUpdate = true;
  };
  redraw();
  return {
    texture: tex,
    has: (id) => pos.has(id),
    rect(id) { const p = pos.get(id); if (!p) return [0, 0, 0, 0]; return [p[0] / size, 1 - (p[1] + p[3]) / size, p[2] / size, p[3] / size]; },
    aspect(id) { const p = pos.get(id); return p ? p[2] / p[3] : 1; },
    redraw,
  };
}

// Shuto-style guide sign for a gantry (one canvas per gantry, redrawn as each JCT comes up).
// kind 'advance': name + distance; kind 'jct': branch route(s) with arrows on the left, C1 straight on.
export const SHUTO_GREEN = '#0d7a4a';
export function routeShield(g, x, y, h, label, inverse = false) {
  g.save();
  g.font = `900 ${Math.round(h * 0.62)}px Rajdhani, "Chakra Petch", sans-serif`;
  const w = Math.max(h * 1.15, g.measureText(label).width + h * 0.45);
  rr(g, x, y, w, h, h * 0.2);
  g.fillStyle = inverse ? '#ffffff' : SHUTO_GREEN; g.fill();
  g.lineWidth = Math.max(2, h * 0.07); g.strokeStyle = inverse ? SHUTO_GREEN : '#ffffff'; g.stroke();
  g.fillStyle = inverse ? SHUTO_GREEN : '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, x + w / 2, y + h * 0.55);
  g.restore();
  return w;
}
export function guideSignTexture(tex) {
  const W = 1024, H = 384;
  const [c, g] = tex && tex.image ? [tex.image, tex.image.getContext('2d')] : canvas(W, H);
  const t = tex || new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.draw = (o) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = SHUTO_GREEN; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff'; g.lineWidth = 8; rr(g, 10, 10, W - 20, H - 20, 18); g.stroke();
    g.fillStyle = '#ffffff'; g.textBaseline = 'middle';
    const arrow = (x, y, s, dir) => { // dir 0 = up, -1 = up-left
      g.save(); g.translate(x, y); g.rotate(dir * 0.6); g.beginPath();
      g.moveTo(0, -s); g.lineTo(s * 0.62, -s * 0.28); g.lineTo(s * 0.2, -s * 0.28); g.lineTo(s * 0.2, s); g.lineTo(-s * 0.2, s); g.lineTo(-s * 0.2, -s * 0.28); g.lineTo(-s * 0.62, -s * 0.28); g.closePath(); g.fill(); g.restore();
    };
    if (!o) { g.textAlign = 'center'; routeShield(g, 380, 60, 110, 'C1'); fitText(g, '都心環状線', 640, 215, 700, 96); g.font = '600 52px Rajdhani, sans-serif'; g.fillText('Inner Circular Route', 512, 310); }
    else if (o.kind === 'advance') {
      routeShield(g, 46, 46, 96, 'C1');
      g.textAlign = 'left'; fitText(g, o.jp, 190, 120, 560, 120);
      g.font = '600 56px Rajdhani, sans-serif'; g.fillText(o.name, 196, 222);
      g.textAlign = 'right'; g.font = '700 92px Rajdhani, sans-serif'; g.fillText(o.dist, W - 50, 120);
      g.textAlign = 'left'; g.font = '500 40px "Noto Sans JP", sans-serif'; g.fillText('内回り  Inner Loop', 196, 300);
    } else {
      // left half: the branch route(s); right: C1 continues
      g.fillStyle = '#ffffff'; g.fillRect(W * 0.56, 30, 6, H - 60);
      const br = o.branches || [];
      br.forEach((b, i) => {
        const y = br.length > 1 ? 70 + i * 150 : 110;
        arrow(70, y + 40, 46, -1);
        const sw = routeShield(g, 120, y - 10, 78, b[0]);
        g.textAlign = 'left'; fitText(g, b[1], 140 + sw, y + 22, 400 - sw, 84);
        g.font = '600 40px Rajdhani, sans-serif'; g.fillText(b[2], 142 + sw, y + 86);
      });
      arrow(W * 0.56 + 70, 190, 64, 0);
      routeShield(g, W * 0.56 + 130, 60, 92, 'C1');
      g.textAlign = 'left'; fitText(g, o.next || '都心環状線', W * 0.56 + 130, 225, 300, 72);
      g.font = '600 40px Rajdhani, sans-serif'; g.fillText(o.nextEn || 'Inner Loop', W * 0.56 + 132, 295);
      g.font = '700 30px "Noto Sans JP", sans-serif'; g.textAlign = 'right'; g.fillText(o.jp, W - 40, H - 44);
    }
    t.needsUpdate = true;
  };
  return t;
}
