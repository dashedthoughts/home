// NEON KUMITE · three stages. Real places, invented shops: every sign below is an invented name, written in correct Japanese.
//   viaduct: Shimbashi, under the Shuto Expressway deck, with the train line running overhead behind it.
//   alley:   a narrow lantern yokocho in the rain (Shinjuku). Wet ground reflects the neon.
//   roof:    a helipad roof near Hamamatsucho, Tokyo Tower in the distance.
import { STAGE_L, STAGE_R } from './sim.js';

export const STAGES = {
  viaduct: { id: 'viaduct', name: 'SHIMBASHI VIADUCT', jp: '新橋 高架下', key: [0.55, 0.83], rim: '#ff9a3c', rim2: '#00d8ff', ambient: '#1a1230', haze: '#3a1d48', reflect: 0.16, floor: '#1b1922', music: 0 },
  alley: { id: 'alley', name: 'RAIN ALLEY', jp: '雨の横丁', key: [0.3, 0.95], rim: '#ff2bd6', rim2: '#00f0ff', ambient: '#140e22', haze: '#2a1838', reflect: 0.34, floor: '#121019', music: 1 },
  roof: { id: 'roof', name: 'HELIPAD ROOF', jp: '屋上ヘリポート', key: [0.6, 0.8], rim: '#7fd4ff', rim2: '#ff3f6e', ambient: '#0f1430', haze: '#4a2a5e', reflect: 0.2, floor: '#22252f', music: 2 },
};
export const STAGE_IDS = ['viaduct', 'alley', 'roof'];

function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const JP = '"Noto Sans JP", "Hiragino Sans", sans-serif';

// A vertical neon sign: plate, glowing tube text, flicker handled by caller via alpha.
function vsign(g, x, y, text, col, w = 26, glow = 1) {
  const n = [...text].length; const h = n * w * 0.95 + w * 0.4;
  g.save();
  g.fillStyle = '#0c0a12'; g.strokeStyle = col; g.lineWidth = 2;
  g.fillRect(x - w / 2 - 4, y, w + 8, h); g.strokeRect(x - w / 2 - 4, y, w + 8, h);
  g.font = `900 ${w * 0.78}px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = col; g.shadowBlur = 12 * glow; g.fillStyle = col;
  [...text].forEach((c, i) => g.fillText(c, x, y + w * 0.65 + i * w * 0.95));
  g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = 0.55;
  [...text].forEach((c, i) => g.fillText(c, x, y + w * 0.65 + i * w * 0.95));
  g.restore();
  return h;
}
function hsign(g, x, y, text, col, size = 22, bg = '#0c0a12') {
  g.save(); g.font = `900 ${size}px ${JP}`; const w = g.measureText(text).width + size * 0.8;
  g.fillStyle = bg; g.fillRect(x - w / 2, y - size * 0.75, w, size * 1.5); g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(x - w / 2, y - size * 0.75, w, size * 1.5);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 10; g.fillStyle = col; g.fillText(text, x, y + 1);
  g.shadowBlur = 0; g.globalAlpha = 0.5; g.fillStyle = '#fff'; g.fillText(text, x, y + 1); g.restore();
}
function lantern(g, x, y, r, col, text) {
  g.save();
  const grd = g.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2); grd.addColorStop(0, col + '66'); grd.addColorStop(1, col + '00');
  g.fillStyle = grd; g.beginPath(); g.arc(x, y, r * 3.2, 0, 7); g.fill();
  g.fillStyle = '#111'; g.fillRect(x - r * 0.55, y - r * 1.25, r * 1.1, r * 0.25); g.fillRect(x - r * 0.55, y + r * 1.0, r * 1.1, r * 0.25);
  g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = '#1a0808'; g.lineWidth = 1.5; g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.25)'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(x, y + i * r * 0.36, r * Math.sqrt(1 - (i * 0.36) ** 2 / 1.2), r * 0.08, 0, 0, 7); g.stroke(); }
  if (text) { g.fillStyle = '#1a0606'; g.font = `900 ${r * 0.72}px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...text].forEach((c, i, a) => g.fillText(c, x, y + (i - (a.length - 1) / 2) * r * 0.72)); }
  g.restore();
}
function windows(g, x, y, w, h, R, lit = 0.45, cols = ['#ffd58a', '#9fd8ff', '#ffe9c4']) {
  const cw = 7 + Math.floor(R() * 4), chh = 9 + Math.floor(R() * 4);
  for (let yy = y + 6; yy < y + h - 8; yy += chh) for (let xx = x + 5; xx < x + w - 8; xx += cw) {
    if (R() < lit) { g.fillStyle = cols[Math.floor(R() * cols.length)]; g.globalAlpha = 0.35 + R() * 0.6; g.fillRect(xx, yy, cw - 3, chh - 4); }
  }
  g.globalAlpha = 1;
}

// Layers are painted once into offscreen canvases (in layer units), then scrolled with parallax.
function layerCanvas(w, h, res) { const c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w * res)); c.height = Math.max(2, Math.round(h * res)); const g = c.getContext('2d'); g.scale(res, res); return [c, g]; }

export function createStage(id, quality = 1) {
  const S = STAGES[id] || STAGES.viaduct;
  const st = { ...S, layers: [], t: 0, train: -1, trainX: 0, steam: [], drops: [], splashes: [], flick: 0, beams: 0 };
  const res = 1.6 * quality;
  const R = rng(id.length * 977 + 13);
  // world spans STAGE_L..STAGE_R; layers are drawn relative to the stage centre so parallax keeps things framed
  const LW = 1700;
  if (id === 'viaduct') {
    // far: office towers with windows, a red aviation light or two
    const [c1, g1] = layerCanvas(LW, 420, res * 0.6);
    for (let x = 0; x < LW; x += 40 + R() * 70) {
      const w = 50 + R() * 110, h = 120 + R() * 260;
      g1.fillStyle = `hsl(${245 + R() * 20},30%,${9 + R() * 6}%)`; g1.fillRect(x, 420 - h, w, h);
      windows(g1, x, 420 - h, w, h, R, 0.32);
      if (R() < 0.3) { g1.fillStyle = '#ff2a2a'; g1.fillRect(x + w / 2 - 2, 420 - h - 4, 4, 4); }
    }
    st.layers.push({ c: c1, k: 0.15, w: LW, h: 420, y: 60, res: res * 0.6 });
    // mid: the train viaduct (brick arches) with a vertical sign row beneath
    const [c2, g2] = layerCanvas(LW, 360, res * 0.8);
    g2.fillStyle = '#2a1a1e'; g2.fillRect(0, 40, LW, 60);
    for (let x = 0; x < LW; x += 120) { g2.fillStyle = '#24161b'; g2.fillRect(x, 100, 22, 260); g2.fillStyle = '#1a0f14'; g2.beginPath(); g2.moveTo(x + 22, 100); g2.quadraticCurveTo(x + 71, 150, x + 120, 100); g2.lineTo(x + 120, 360); g2.lineTo(x + 22, 360); g2.closePath(); g2.fill(); }
    g2.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 44; y < 100; y += 7) g2.fillRect(0, y, LW, 1);
    const signs = [['やきとり', '#ff4d4d'], ['居酒屋', '#ffb340'], ['大衆酒場', '#4dd2ff'], ['ホルモン', '#ff6ad5'], ['立ち飲み', '#ffe14d'], ['カラオケ', '#7cff6b'], ['串焼き', '#ff8c42']];
    for (let i = 0; i < 9; i++) { const [t, c] = signs[i % signs.length]; vsign(g2, 80 + i * 180 + R() * 40, 128, t, c, 22); }
    g2.fillStyle = '#0b0910'; g2.fillRect(0, 300, LW, 60);
    for (let x = 30; x < LW; x += 160) { g2.fillStyle = '#ffcf7a'; g2.globalAlpha = 0.6; g2.fillRect(x, 270 + R() * 10, 60, 26); g2.globalAlpha = 1; }
    st.layers.push({ c: c2, k: 0.45, w: LW, h: 360, y: 0, res: res * 0.8, train: 1 });
  } else if (id === 'alley') {
    const [c1, g1] = layerCanvas(LW, 440, res * 0.6);
    g1.fillStyle = '#0d0a16'; g1.fillRect(0, 0, LW, 440);
    for (let x = 0; x < LW; x += 60 + R() * 60) { const w = 60 + R() * 90, h = 200 + R() * 220; g1.fillStyle = `hsl(${260 + R() * 30},25%,${7 + R() * 5}%)`; g1.fillRect(x, 440 - h, w, h); windows(g1, x, 440 - h, w, h, R, 0.22, ['#ff9ad5', '#9fd8ff', '#ffd58a']); }
    // tangled overhead wires
    g1.strokeStyle = '#05040a'; g1.lineWidth = 1.5; for (let i = 0; i < 14; i++) { g1.beginPath(); const y0 = 40 + R() * 120; g1.moveTo(0, y0); g1.bezierCurveTo(LW * 0.3, y0 + 40 + R() * 40, LW * 0.6, y0 + 20 + R() * 60, LW, y0 + R() * 50); g1.stroke(); }
    st.layers.push({ c: c1, k: 0.2, w: LW, h: 440, y: 80, res: res * 0.6 });
    // mid: the shop fronts lining the alley
    const [c2, g2] = layerCanvas(LW, 380, res * 0.9);
    const shops = [['居酒屋', '雨宿り', '#ff3b5c'], ['スナック', '夜光', '#ff2bd6'], ['らーめん', '七星', '#ffcf3a'], ['おでん', '小町', '#4de1ff'], ['焼鳥', '赤提灯', '#ff6a3d'], ['占い', '月影', '#b48cff'], ['立ち飲み', '一番星', '#7cff6b']];
    let x = 0, i = 0;
    while (x < LW) {
      const w = 150 + R() * 70; const [a, b, c] = shops[i++ % shops.length];
      g2.fillStyle = `hsl(${10 + R() * 30},18%,${10 + R() * 5}%)`; g2.fillRect(x, 40, w - 6, 340);
      g2.fillStyle = '#2a1d16'; g2.fillRect(x + 8, 236, w - 22, 144);
      g2.fillStyle = '#ffd9a0'; g2.globalAlpha = 0.55; for (let k = 0; k < 4; k++) g2.fillRect(x + 12 + k * (w - 30) / 4, 244, (w - 30) / 4 - 4, 70); g2.globalAlpha = 1; // shoji glow
      g2.fillStyle = c; g2.globalAlpha = 0.85; g2.fillRect(x + 8, 236, w - 22, 26); g2.globalAlpha = 1; // noren
      g2.fillStyle = '#0a0a0a'; for (let k = 1; k < 4; k++) g2.fillRect(x + 8 + k * (w - 22) / 4 - 1, 236, 2, 26);
      g2.font = `900 15px ${JP}`; g2.fillStyle = '#fff'; g2.textAlign = 'center'; g2.fillText(b, x + (w - 14) / 2, 255);
      vsign(g2, x + w - 30, 60, a, c, 20);
      hsign(g2, x + (w - 40) / 2, 200, b, c, 17);
      g2.fillStyle = '#3a3d46'; g2.fillRect(x + 14, 90 + R() * 40, 34, 22); g2.fillStyle = '#23252b'; g2.fillRect(x + 18, 94 + R() * 30, 26, 14); // aircon unit
      x += w;
    }
    st.layers.push({ c: c2, k: 0.55, w: LW, h: 380, y: 0, res: res * 0.9 });
    st.lanterns = []; for (let k = 0; k < 14; k++) st.lanterns.push({ x: -150 + k * 105 + R() * 30, y: 182 + R() * 16, c: R() < 0.7 ? '#e8322a' : '#f4ecd8', t: ['酒', '焼鳥', 'おでん', '酒場'][k % 4] });
  } else {
    const [c1, g1] = layerCanvas(LW * 1.2, 460, res * 0.6);
    // skyline: layered silhouettes, aviation lights; Tokyo Tower painted live (it glows)
    for (let layer = 0; layer < 3; layer++) {
      for (let x = 0; x < LW * 1.2; x += 30 + R() * 50) {
        const w = 40 + R() * 90, h = (layer === 0 ? 260 : layer === 1 ? 180 : 110) + R() * 160 - layer * 20;
        g1.fillStyle = `hsl(${235 + layer * 8},35%,${10 + layer * 4}%)`; g1.fillRect(x, 460 - h, w, h);
        g1.globalAlpha = 0.55 + layer * 0.15; windows(g1, x, 460 - h, w, h, R, 0.08 + layer * 0.06, ['#ffd58a', '#bde3ff', '#ffe9c4']); g1.globalAlpha = 1;
        if (R() < 0.35) { g1.fillStyle = '#ff2a2a'; g1.fillRect(x + w / 2 - 2, 460 - h - 5, 4, 4); }
      }
    }
    st.layers.push({ c: c1, k: 0.12, w: LW * 1.2, h: 460, y: 40, res: res * 0.6, tower: 1 });
    const [c2, g2] = layerCanvas(LW, 260, res * 0.9);
    // rooftop clutter at the deck edge: water tank, HVAC boxes, antenna masts
    for (let x = 40; x < LW; x += 260 + R() * 120) {
      g2.fillStyle = '#20242f'; g2.fillRect(x, 150, 120, 80); g2.fillStyle = '#2b3140'; for (let k = 0; k < 4; k++) g2.fillRect(x + 8 + k * 28, 162, 20, 20);
      g2.fillStyle = '#161922'; g2.beginPath(); g2.ellipse(x + 190, 120, 34, 12, 0, 0, 7); g2.fill(); g2.fillRect(x + 156, 120, 68, 90);
      g2.strokeStyle = '#2a2f3c'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(x + 250, 230); g2.lineTo(x + 250, 30); g2.stroke();
    }
    g2.fillStyle = '#12151d'; g2.fillRect(0, 226, LW, 34);
    g2.strokeStyle = '#3b4252'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(0, 200); g2.lineTo(LW, 200); g2.stroke();
    for (let x = 0; x < LW; x += 30) { g2.beginPath(); g2.moveTo(x, 200); g2.lineTo(x, 228); g2.stroke(); }
    st.layers.push({ c: c2, k: 0.5, w: LW, h: 260, y: 0, res: res * 0.9 });
    st.masts = []; for (let k = 0; k < 6; k++) st.masts.push({ x: 40 + k * 300 + 250, ph: R() * 6 });
  }
  return st;
}

// ---------------------------------------------------------------- per-frame drawing
// cam: { x, scale, W, H, gy (ground screen y), t, rm (reduced motion) }
export function drawBack(ctx, st, cam) {
  const { W, H, gy, scale } = cam;
  const t = cam.t;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, gy);
  if (st.id === 'viaduct') { sky.addColorStop(0, '#0b0a1d'); sky.addColorStop(0.6, '#24123a'); sky.addColorStop(1, '#4a1f45'); }
  else if (st.id === 'alley') { sky.addColorStop(0, '#07060d'); sky.addColorStop(0.7, '#1a1030'); sky.addColorStop(1, '#2c1238'); }
  else { sky.addColorStop(0, '#050a22'); sky.addColorStop(0.55, '#1a1b4a'); sky.addColorStop(0.85, '#5a2a63'); sky.addColorStop(1, '#a0456a'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, gy + 2);
  if (st.id === 'roof') { // stars
    ctx.fillStyle = '#cfd8ff'; for (let i = 0; i < 60; i++) { const x = ((i * 137.5) % 1) * 0 + ((i * 97) % W); const y = (i * 53) % (gy * 0.5); ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.3 + i); ctx.fillRect(x, y, 1.5, 1.5); } ctx.globalAlpha = 1;
  }
  const mid = (STAGE_L + STAGE_R) / 2;
  for (const L of st.layers) {
    const s = scale * (0.55 + 0.45 * L.k);
    const ox = W / 2 - (L.w / 2) * s - (cam.x - mid) * scale * L.k;
    const oy = gy - (L.y + L.h) * s; // L.y = height of the layer's bottom edge above the floor line
    ctx.drawImage(L.c, ox, oy, L.w * s, L.h * s);
    if (L.tower) drawTower(ctx, ox + L.w * 0.7 * s, gy - 20 * scale, scale * 0.95, t);
    if (L.train) drawTrain(ctx, st, ox, oy, s, L, t);
    // atmospheric haze: pushes each layer back and keeps the fighters on top readable
    const hz = ctx.createLinearGradient(0, gy - 260 * scale, 0, gy);
    hz.addColorStop(0, hexA(st.haze, 0)); hz.addColorStop(1, hexA(st.haze, L.k < 0.3 ? 0.55 : 0.28));
    ctx.fillStyle = hz; ctx.fillRect(0, gy - 260 * scale, W, 260 * scale);
  }
  if (st.id === 'roof') { // a slow searchlight sweep
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      const a = Math.sin(t * 0.25 + i * 2.2) * 0.5 - Math.PI / 2; const x0 = W * (0.2 + i * 0.6), y0 = gy * 0.95;
      const g = ctx.createLinearGradient(x0, y0, x0 + Math.cos(a) * H, y0 + Math.sin(a) * H); g.addColorStop(0, 'rgba(160,200,255,0.10)'); g.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a - 0.05) * H * 1.2, y0 + Math.sin(a - 0.05) * H * 1.2); ctx.lineTo(x0 + Math.cos(a + 0.05) * H * 1.2, y0 + Math.sin(a + 0.05) * H * 1.2); ctx.fill();
    }
    ctx.restore();
  }
  // near layer, world space (k = 1)
  const wx = (x) => (x - cam.x) * scale + W / 2;
  if (st.id === 'viaduct') {
    // the expressway deck overhead and its piers
    const deckY = gy - 300 * scale;
    ctx.fillStyle = '#17141f'; ctx.fillRect(0, deckY - 70 * scale, W, 70 * scale);
    ctx.fillStyle = '#211d2b'; ctx.fillRect(0, deckY - 14 * scale, W, 14 * scale);
    ctx.fillStyle = '#0d0b12'; ctx.fillRect(0, deckY - 70 * scale, W, 6 * scale);
    for (let x = -200; x <= 1300; x += 330) {
      const sx = wx(x);
      // T-pier: column + cap, sodium lamp underneath
      ctx.fillStyle = '#1f1b28'; ctx.fillRect(sx - 34 * scale, deckY, 68 * scale, gy - deckY);
      ctx.fillStyle = '#2a2535'; ctx.fillRect(sx - 34 * scale, deckY, 14 * scale, gy - deckY);
      ctx.fillStyle = '#272233'; ctx.beginPath(); ctx.moveTo(sx - 110 * scale, deckY); ctx.lineTo(sx + 110 * scale, deckY); ctx.lineTo(sx + 40 * scale, deckY + 40 * scale); ctx.lineTo(sx - 40 * scale, deckY + 40 * scale); ctx.closePath(); ctx.fill();
      const lg = ctx.createRadialGradient(sx + 120 * scale, deckY + 8 * scale, 2, sx + 120 * scale, deckY + 8 * scale, 150 * scale); lg.addColorStop(0, 'rgba(255,170,80,0.35)'); lg.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = lg; ctx.fillRect(sx - 40 * scale, deckY, 320 * scale, 260 * scale);
      ctx.fillStyle = '#ffb35a'; ctx.fillRect(sx + 110 * scale, deckY + 2 * scale, 20 * scale, 4 * scale);
      // a small sign bolted to the pier (route name is real: 首都高速 = Shuto Expressway; the number plate is decoration)
      ctx.fillStyle = '#0d5c3a'; ctx.fillRect(sx - 26 * scale, deckY + 70 * scale, 52 * scale, 24 * scale);
      ctx.fillStyle = '#e8f5ee'; ctx.font = `900 ${10 * scale}px ${JP}`; ctx.textAlign = 'center'; ctx.fillText('首都高速', sx, deckY + 86 * scale);
    }
    // yakitori stall
    drawStall(ctx, wx(820), gy, scale, t, st);
    drawVending(ctx, wx(250), gy, scale, t);
  } else if (st.id === 'alley') {
    for (const L of st.lanterns) {
      const sx = wx(L.x * 0.85 + cam.x * 0.15), sy = gy - L.y * scale + Math.sin(t * 1.4 + L.x) * 2 * scale;
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, sy - 40 * scale); ctx.lineTo(sx, sy - 14 * scale); ctx.stroke();
      lantern(ctx, sx, sy, 11 * scale, L.c, L.c === '#e8322a' ? L.t : null);
    }
  } else {
    // helipad deck edge lights and masts
    for (const m of st.masts) { const sx = wx(m.x * 0.6 + cam.x * 0.4); const on = Math.sin(t * 2 + m.ph) > 0.3; if (on) { ctx.fillStyle = '#ff3030'; ctx.shadowColor = '#ff3030'; ctx.shadowBlur = 10; ctx.fillRect(sx - 2, gy - 250 * scale * 0.7, 4, 4); ctx.shadowBlur = 0; } }
  }
}

function drawTower(ctx, x, base, s, t) {
  // Tokyo Tower: tapering lattice, two observation decks, orange-white lighting (drawn as glowing lines)
  const h = 330 * s; const w0 = 52 * s;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, base - h * 0.45, 4, x, base - h * 0.45, h * 0.6); glow.addColorStop(0, 'rgba(255,120,40,0.22)'); glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow; ctx.fillRect(x - h, base - h * 1.1, h * 2, h * 1.2);
  ctx.strokeStyle = 'rgba(255,140,60,0.95)'; ctx.lineWidth = Math.max(1, 1.6 * s);
  const wAt = (k) => w0 * Math.pow(1 - k, 1.6) + 2 * s;
  ctx.beginPath();
  for (let side = -1; side <= 1; side += 2) { ctx.moveTo(x + side * w0, base); for (let k = 0; k <= 1.001; k += 0.05) ctx.lineTo(x + side * wAt(k), base - h * k); }
  for (let k = 0.05; k < 0.95; k += 0.06) { const a = wAt(k), b = wAt(k + 0.06); ctx.moveTo(x - a, base - h * k); ctx.lineTo(x + b, base - h * (k + 0.06)); ctx.moveTo(x + a, base - h * k); ctx.lineTo(x - b, base - h * (k + 0.06)); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,230,190,0.95)';
  ctx.fillRect(x - wAt(0.36) - 6 * s, base - h * 0.37, 2 * (wAt(0.36) + 6 * s), 7 * s);
  ctx.fillRect(x - wAt(0.62) - 3 * s, base - h * 0.63, 2 * (wAt(0.62) + 3 * s), 5 * s);
  ctx.fillStyle = Math.sin(t * 3) > 0 ? '#ff3030' : '#7a1010'; ctx.fillRect(x - 1.5 * s, base - h - 4 * s, 3 * s, 4 * s);
  ctx.restore();
}
function drawTrain(ctx, st, ox, oy, s, L, t) {
  // a commuter train crossing the viaduct every ~14 s
  const period = 14, len = 900; const ph = (t % period) / period;
  const x = -len + ph * (L.w + len * 2) * 1.0;
  if (ph > 0.92) return;
  const y = oy + 8 * s;
  ctx.save();
  ctx.fillStyle = '#1b1d24'; ctx.fillRect(ox + x * s, y, len * s, 34 * s);
  ctx.fillStyle = '#c8ccd6'; ctx.fillRect(ox + x * s, y + 26 * s, len * s, 4 * s);
  for (let k = 0; k < len; k += 18) { if (k % 180 > 160) continue; ctx.fillStyle = '#ffe6a8'; ctx.globalAlpha = 0.9; ctx.fillRect(ox + (x + k) * s + 3 * s, y + 8 * s, 12 * s, 12 * s); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#3df07a'; ctx.fillRect(ox + x * s, y + 22 * s, len * s, 2 * s);
  ctx.restore();
  st.trainNear = ph > 0.05 && ph < 0.85;
}
function drawStall(ctx, x, gy, s, t, st) {
  // a yakitori stall: counter, red lanterns, a noren reading やきとり, and smoke off the grill
  ctx.save();
  ctx.fillStyle = '#3a2218'; ctx.fillRect(x - 90 * s, gy - 62 * s, 180 * s, 62 * s);
  ctx.fillStyle = '#5a3424'; ctx.fillRect(x - 96 * s, gy - 68 * s, 192 * s, 10 * s);
  ctx.fillStyle = '#2a1712'; ctx.fillRect(x - 86 * s, gy - 150 * s, 8 * s, 90 * s); ctx.fillRect(x + 78 * s, gy - 150 * s, 8 * s, 90 * s);
  ctx.fillStyle = '#7a1e1a'; ctx.fillRect(x - 96 * s, gy - 160 * s, 192 * s, 14 * s);
  ctx.fillStyle = '#e9e0cc'; for (let i = 0; i < 4; i++) { ctx.fillRect(x - 84 * s + i * 42 * s, gy - 146 * s, 38 * s, 34 * s); }
  ctx.fillStyle = '#1a0d0a'; ctx.font = `900 ${17 * s}px ${JP}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ['や', 'き', 'と', 'り'].forEach((c, i) => ctx.fillText(c, x - 65 * s + i * 42 * s, gy - 128 * s));
  const glow = ctx.createRadialGradient(x, gy - 60 * s, 4, x, gy - 60 * s, 120 * s); glow.addColorStop(0, 'rgba(255,120,50,0.45)'); glow.addColorStop(1, 'rgba(255,120,50,0)');
  ctx.fillStyle = glow; ctx.fillRect(x - 130 * s, gy - 180 * s, 260 * s, 180 * s);
  ctx.fillStyle = '#ff5a2a'; ctx.fillRect(x - 40 * s, gy - 72 * s, 80 * s, 4 * s);
  ctx.restore();
  lantern(ctx, x - 110 * s, gy - 132 * s + Math.sin(t * 1.7) * 1.5 * s, 13 * s, '#e8322a', '焼鳥');
  lantern(ctx, x + 110 * s, gy - 132 * s + Math.sin(t * 1.5 + 1) * 1.5 * s, 13 * s, '#e8322a', '酒');
  // steam / smoke from the grill
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const k = ((t * 0.35 + i / 9) % 1); const px = x + (i - 4) * 8 * s + Math.sin(t + i) * 10 * s * k; const py = gy - 74 * s - k * 150 * s;
    ctx.globalAlpha = (1 - k) * 0.22; ctx.fillStyle = '#d8d2e8'; ctx.beginPath(); ctx.arc(px, py, (8 + k * 26) * s, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawVending(ctx, x, gy, s, t) {
  ctx.save();
  ctx.fillStyle = '#d9dde6'; ctx.fillRect(x - 34 * s, gy - 130 * s, 68 * s, 130 * s);
  ctx.fillStyle = '#2b6fd6'; ctx.fillRect(x - 30 * s, gy - 126 * s, 60 * s, 14 * s);
  ctx.fillStyle = '#eaf6ff'; ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 9); ctx.fillRect(x - 28 * s, gy - 108 * s, 56 * s, 56 * s); ctx.globalAlpha = 1;
  const cols = ['#ff4d4d', '#ffd24d', '#4dd2ff', '#7cff6b', '#ff8c42', '#c28cff'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = cols[(r * 5 + c) % 6]; ctx.fillRect(x - 25 * s + c * 10.5 * s, gy - 104 * s + r * 18 * s, 7 * s, 13 * s); }
  ctx.fillStyle = '#16181d'; ctx.fillRect(x - 24 * s, gy - 34 * s, 48 * s, 12 * s);
  const g = ctx.createRadialGradient(x, gy - 80 * s, 4, x, gy - 80 * s, 110 * s); g.addColorStop(0, 'rgba(200,230,255,0.25)'); g.addColorStop(1, 'rgba(200,230,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 110 * s, gy - 190 * s, 220 * s, 190 * s);
  ctx.restore();
}

export function drawFloor(ctx, st, cam) {
  const { W, H, gy, scale } = cam;
  const g = ctx.createLinearGradient(0, gy, 0, H);
  if (st.id === 'alley') { g.addColorStop(0, '#1d1526'); g.addColorStop(1, '#09070d'); }
  else if (st.id === 'roof') { g.addColorStop(0, '#2b2f3b'); g.addColorStop(1, '#101219'); }
  else { g.addColorStop(0, '#26222f'); g.addColorStop(1, '#0c0b10'); }
  ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);
  const wx = (x) => (x - cam.x) * scale + W / 2;
  ctx.save();
  if (st.id === 'viaduct') {
    // painted road lines in perspective-ish bands
    ctx.fillStyle = 'rgba(240,235,220,0.18)';
    for (let x = -400; x < 1500; x += 120) { const a = wx(x), b = wx(x + 60); ctx.beginPath(); ctx.moveTo(a, gy + 30 * scale); ctx.lineTo(b, gy + 30 * scale); ctx.lineTo(b + 8 * scale, gy + 36 * scale); ctx.lineTo(a + 8 * scale, gy + 36 * scale); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,200,60,0.28)'; ctx.fillRect(0, gy + 3 * scale, W, 2 * scale);
  } else if (st.id === 'alley') {
    // wet cobbles + neon streak reflections under each lantern
    ctx.globalCompositeOperation = 'lighter';
    for (const L of st.lanterns) { const sx = wx(L.x * 0.85 + cam.x * 0.15); const gr = ctx.createLinearGradient(0, gy, 0, gy + 90 * scale); gr.addColorStop(0, L.c === '#e8322a' ? 'rgba(232,50,42,0.30)' : 'rgba(244,236,216,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - 7 * scale, gy, 14 * scale, 90 * scale); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
    for (let y = gy + 8; y < H; y += 10 + (y - gy) * 0.12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  } else {
    // helipad: big painted circle and H, edge lights
    const cx = wx(550), cy = gy + 34 * scale;
    ctx.strokeStyle = 'rgba(255,214,80,0.7)'; ctx.lineWidth = 5 * scale; ctx.beginPath(); ctx.ellipse(cx, cy, 300 * scale, 26 * scale, 0, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(245,245,240,0.22)'; ctx.lineWidth = 2 * scale; ctx.beginPath(); ctx.ellipse(cx, cy, 250 * scale, 20 * scale, 0, 0, 7); ctx.stroke();
    for (let x = -200; x < 1400; x += 80) { const on = Math.sin(cam.t * 3 + x * 0.05) > 0; ctx.fillStyle = on ? '#6dff9a' : '#1d4d2e'; ctx.fillRect(wx(x) - 3, gy + 1, 6, 3); }
  }
  ctx.restore();
}

// rain, foreground occluders, vignette
export function drawFront(ctx, st, cam, dt) {
  const { W, H, gy, scale } = cam;
  if (st.id === 'alley') {
    const n = cam.lowFx ? 60 : 140;
    while (st.drops.length < n) st.drops.push({ x: Math.random() * W, y: Math.random() * H, v: 900 + Math.random() * 500, l: 14 + Math.random() * 16 });
    ctx.save(); ctx.strokeStyle = 'rgba(190,200,255,0.28)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const d of st.drops) {
      d.y += d.v * dt; d.x -= d.v * dt * 0.18;
      if (d.y > gy + (H - gy) * Math.random()) { if (st.splashes.length < 40) st.splashes.push({ x: d.x, y: Math.max(gy, d.y), t: 0 }); d.y = -20; d.x = Math.random() * (W + 100); }
      ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * 0.18, d.y - d.l);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(200,210,255,0.35)';
    for (let i = st.splashes.length - 1; i >= 0; i--) { const s = st.splashes[i]; s.t += Math.max(0, dt); if (s.t > 0.25) { st.splashes.splice(i, 1); continue; } ctx.beginPath(); ctx.ellipse(s.x, s.y, 2 + s.t * 30, 1 + s.t * 6, 0, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  if (st.id === 'viaduct') {
    // foreground pier edge on the far left/right when the camera nears the walls
    const wx = (x) => (x - cam.x) * scale + W / 2;
    for (const x of [-75, 1175]) { const sx = wx(x); if (sx > -120 * scale && sx < W + 120 * scale) { ctx.fillStyle = '#0a090e'; ctx.fillRect(sx - 60 * scale, 0, 120 * scale, H); ctx.fillStyle = '#16131d'; ctx.fillRect(sx - 60 * scale + (x < 0 ? 110 : 0) * scale, 0, 10 * scale, H); } } // kept outside the walls so a cornered fighter is never hidden
  }
  // vignette
  const v = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
