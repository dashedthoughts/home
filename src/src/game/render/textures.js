// Procedural canvas textures + a neon environment map for reflections. No image files anywhere.
import * as THREE from 'three';
import { mulberry } from '../sim.js';

const canvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};

// Asphalt: 10.8 m wide × 24 m long tile (47 px/m across, 43 px/m along), mipmapped + anisotropic so paint never crawls.
// What is drawn, as on the real Shuto deck: dark neutral asphalt with fine aggregate, darker polished tyre lanes and an
// oil line between them, worn white edge lines and lane dashes, cat's-eye studs in the gaps, sealed cracks, one patch
// repair, and a steel expansion joint across the deck once per tile (every 24 m; the real viaduct's are ~30 m apart).
// The second texture carries surface state: G = roughness (dark blobs = hollows that fill with water in rain; the post
// chain reads the same channel for puddles), B = micro-gloss (fine grain + polished tyre lanes) that breaks reflections up.
export function roadTextures() {
  // 1024×2048 = ~1 cm per texel: the title bay puts the camera 1.3 m above this surface, and at half this size the
  // paint wear read as blocky pixels. (4 MB + mips on the GPU; drawn once at load.)
  const W = 1024, H = 2048, K = W / 512;
  const [c, g] = canvas(W, H);
  const r = mulberry(4);
  const lane = W / 3, pxm = H / 24;
  g.fillStyle = '#1f1f21';
  g.fillRect(0, 0, W, H);
  // broad tonal drift: no two metres of asphalt are the same grey
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H, rad = (60 + r() * 160) * K, v = r() < 0.5 ? 0 : 255;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${v},${v},${v},0.05)`); grd.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = grd;
    for (const dy of [0, H, -H]) { g.save(); g.translate(0, dy); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore(); } // wraps in v: no seam
  }
  // fine aggregate, per texel: mostly dark grit, a few pale stones
  { const im = g.getImageData(0, 0, W, H), d = im.data;
    for (let k = 0; k < d.length; k += 4) {
      const n = r(), v = n > 0.972 ? 78 + (n - 0.972) * 1900 : d[k] * (0.55 + n * 0.95);
      d[k] = d[k + 1] = v; d[k + 2] = v + 1;
    }
    g.putImageData(im, 0, 0); }
  // a patch repair: a slightly darker, smoother rectangle with a sealed edge
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(lane * 1.12, H * 0.58, lane * 0.7, H * 0.16);
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2 * K; g.strokeRect(lane * 1.12, H * 0.58, lane * 0.7, H * 0.16);
  // tyre lanes (darker, polished) with soft edges, and the oil line down the middle of each lane
  const band = (x, hw, a) => {
    const grd = g.createLinearGradient(x - hw, 0, x + hw, 0);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, `rgba(0,0,0,${a})`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(x - hw, 0, hw * 2, H);
  };
  for (let l = 0; l < 3; l++) { band(l * lane + lane * 0.27, 26 * K, 0.34); band(l * lane + lane * 0.73, 26 * K, 0.34); band(l * lane + lane * 0.5, 9 * K, 0.22); }
  // sealed cracks (bitumen lines)
  g.strokeStyle = 'rgba(0,0,0,.5)';
  for (let i = 0; i < 9; i++) {
    g.lineWidth = (1 + r() * 1.2) * K;
    g.beginPath();
    let x = r() * W, y = r() * H * 0.8;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 34 * K; y += r() * 30 * K; g.lineTo(x, y); }
    g.stroke();
  }
  // paint: solid edge lines, 6 m dashes with 6 m gaps (two per tile). Worn: not pure white, thinned in soft scuffs
  // along the direction of travel (low contrast, so it reads as wear and not as noise when the camera is close)
  const paint = (x, y, w, h, wear) => {
    g.fillStyle = '#c4c2bb'; g.fillRect(x, y, w, h);
    for (let i = 0, n = (w * h * wear / (K * K)) | 0; i < n; i++) {
      g.fillStyle = `rgba(30,30,31,${0.12 + r() * 0.3})`;
      g.fillRect(x + r() * w, y + r() * h, (1 + r() * 2.2) * K, (2 + r() * 9) * K);
    }
  };
  paint(10 * K, 0, 9 * K, H, 0.05);
  paint(W - 19 * K, 0, 9 * K, H, 0.05);
  for (let l = 1; l < 3; l++) for (let k = 0; k < 2; k++) paint(l * lane - 4 * K, k * (H / 2), 8 * K, H / 4, 0.09);
  // cat's-eye studs: a dark housing with a pale reflector, in the middle of each gap and along both edge lines
  const stud = (x, y, col) => { g.fillStyle = '#060607'; g.fillRect(x - 5 * K, y - 6 * K, 10 * K, 12 * K); g.fillStyle = col; g.fillRect(x - 3 * K, y - 3 * K, 6 * K, 5 * K); };
  for (let k = 0; k < 2; k++) {
    const y = k * (H / 2) + H * 0.375;
    for (let l = 1; l < 3; l++) stud(l * lane, y, '#f3ead2');
    stud(26 * K, y, '#ffc45a'); stud(W - 26 * K, y, '#ffc45a');
  }
  // expansion joint: a steel strip across the whole deck, a shadow line either side
  { const y = Math.round(H * 0.93), h = Math.max(3, Math.round(0.09 * pxm));
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, y - 2 * K, W, h + 4 * K);
    g.fillStyle = '#34363a'; g.fillRect(0, y, W, h); }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;

  const [rc, rg] = canvas(256, 512);
  // G: base roughness; B: micro-gloss
  rg.fillStyle = 'rgb(0,154,150)';
  rg.fillRect(0, 0, 256, 512);
  // polished tyre lanes are glossier (B up); they also hold a film of water in rain
  for (let l = 0; l < 3; l++) for (const o of [0.27, 0.73]) {
    const x = (l + o) * (256 / 3), grd = rg.createLinearGradient(x - 14, 0, x + 14, 0);
    grd.addColorStop(0, 'rgba(0,150,255,0)'); grd.addColorStop(0.5, 'rgba(0,128,255,0.55)'); grd.addColorStop(1, 'rgba(0,150,255,0)');
    rg.fillStyle = grd; rg.fillRect(x - 14, 0, 28, 512);
  }
  // hollows: dark in G = glossy
  for (let i = 0; i < 60; i++) {
    const x = r() * 256, y = r() * 512, rx = 10 + r() * 50, ry = 20 + r() * 90;
    const grd = rg.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    grd.addColorStop(0, 'rgba(0,10,255,0.95)');
    grd.addColorStop(1, 'rgba(0,10,255,0)');
    rg.fillStyle = grd;
    rg.beginPath();
    rg.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    rg.fill();
  }
  // grain in B only (the asphalt's texture breaks a reflection into glints); G is left smooth so puddle edges stay clean
  { const im = rg.getImageData(0, 0, 256, 512), d = im.data;
    for (let k = 0; k < d.length; k += 4) d[k + 2] = Math.max(0, Math.min(255, d[k + 2] * (0.5 + r() * 0.62)));
    rg.putImageData(im, 0, 0); }
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
