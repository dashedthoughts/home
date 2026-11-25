// KAZE scenery: every landscape is painted procedurally with the brush engine into cached tiles.
// A Band is one parallax plane (factor f). Its content is a list of objects in band space; tiles of TW units
// are painted on demand (each object draws itself with its own seed into every tile it touches, so seams match).
import { INK, rng, fbm, noise1, clamp, lerp, makeCanvas, rgba, mix, stroke, leaf, drop } from './brush.js';
import { CHAPTERS, groundH } from './data.js';

export const TW = 512;
export class Band {
  constructor(f, yTop, yBot, res, objs, opt = {}) { this.f = f; this.yTop = yTop; this.yBot = yBot; this.res = res; this.objs = objs; this.cache = new Map(); this.scale = 0; this.range = opt.range || null; this.max = opt.max || 6; }
  tile(i) {
    let t = this.cache.get(i); if (t) { this.cache.delete(i); this.cache.set(i, t); return t; }
    const [yT, yB] = this.range ? this.range(i) : [this.yTop, this.yBot];
    const s = this.scale, c = makeCanvas(TW * s, (yB - yT) * s), g = c.getContext('2d');
    g.setTransform(s, 0, 0, s, -i * TW * s, -yT * s);
    const x0 = i * TW, x1 = x0 + TW;
    // pad generously: blur halos and texture strokes spill past an object's declared range, and a neighbour tile
    // that skipped the object would show a cut (a pale vertical seam in the sky)
    for (const o of this.objs) if (o.x1 >= x0 - 120 && o.x0 <= x1 + 120) { g.save(); o.draw(g, rng(o.seed)); g.restore(); }
    t = { c, yT, yB }; this.cache.set(i, t);
    while (this.cache.size > this.max) this.cache.delete(this.cache.keys().next().value);
    return t;
  }
  setScale(s) { if (Math.abs(s - this.scale) > 1e-3) { this.scale = s; this.cache.clear(); } }
  // red variant of a tile for boss fights: a gradient map, ink to near-black, paper and mist to the red glow
  redTile(t, pal) {
    const c = makeCanvas(t.c.width, t.c.height), g = c.getContext('2d'); g.drawImage(t.c, 0, 0);
    const id = g.getImageData(0, 0, c.width, c.height), d = id.data, gain = this.redGain || 1.5;
    const gl = parseInt((this.f === 1 ? pal.ground : pal.glow).slice(1), 16), ik = parseInt(pal.ink.slice(1), 16);
    const gr = (gl >> 16) & 255, gg = (gl >> 8) & 255, gb = gl & 255, ir = (ik >> 16) & 255, ig = (ik >> 8) & 255, ib = ik & 255;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255; let k = Math.min(1, Math.max(0, (0.93 - l) / 0.7 * gain)); k = Math.pow(k, 0.75);
      d[i] = gr + (ir - gr) * k; d[i + 1] = gg + (ig - gg) * k; d[i + 2] = gb + (ib - gb) * k;
    }
    g.putImageData(id, 0, 0); t.red = c; return c;
  }
  // draw visible tiles; budget: how many new tiles may be painted this frame (prefetch is lazy)
  draw(ctx, v, budget) {
    const f = this.f, K = v.k * (1 + (v.zoom - 1) * f);
    const bx0 = v.camX * f - v.W / 2 / K, bx1 = v.camX * f + v.W / 2 / K;
    const i0 = Math.floor(bx0 / TW), i1 = Math.floor(bx1 / TW);
    for (let i = i0; i <= i1; i++) {
      const t = this.tile(i);
      const sx0 = Math.round(v.W / 2 + (i * TW - v.camX * f) * K), sx1 = Math.round(v.W / 2 + ((i + 1) * TW - v.camX * f) * K);
      const sy = Math.round(v.cy + (t.yT - v.camY * f + 100) * K);
      ctx.drawImage(t.c, sx0, sy, sx1 - sx0, Math.round((t.yB - t.yT) * K));
      if (v.red > 0.01) {
        if (!t.red && budget.r > 0) { budget.r--; this.redTile(t, v.pal); }
        if (t.red) { ctx.globalAlpha = v.red; ctx.drawImage(t.red, sx0, sy, sx1 - sx0, Math.round((t.yB - t.yT) * K)); ctx.globalAlpha = 1; }
      }
    }
    // prefetch the next tile in the direction of travel
    if (budget.n > 0) { const j = v.vx >= 0 ? i1 + 1 : i0 - 1; if (!this.cache.has(j)) { budget.n--; this.max = Math.max(this.max, i1 - i0 + 3); this.tile(j); } }
  }
}
const obj = (x0, x1, seed, draw) => ({ x0, x1, seed, draw });

// ---------- painters ----------
// A peak: wash that fades into mist, a pooled dark ridge, texture strokes (cun) down its slopes, moss dots.
export function peak(g, R, cx, base, ph, hw, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.5, n = 48, asym = o.asym ?? (R() - 0.5) * 0.8, sd = Math.floor(R() * 999), sub = (R() < 0.5 ? -1 : 1) * (0.45 + R() * 0.25);
  const P = [];
  for (let i = 0; i <= n; i++) {
    const u = -1 + (2 * i) / n, uu = u - asym * (1 - u * u) * 0.45;
    let y = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(uu), o.sharp ?? 1.8)), o.round ?? 1.25);
    // shoulders: a lower sub-peak on one side makes the silhouette less like a triangle
    const sh = 0.55 * Math.exp(-Math.pow((u - sub) / 0.28, 2)); y = Math.max(y, sh * (1 - Math.abs(u) * 0.6));
    y += (fbm(i * 0.22, sd) - 0.5) * (o.rough ?? 0.26) * Math.sqrt(Math.max(0, 1 - Math.abs(u)));
    P.push([cx + u * hw, base - ph * Math.max(0, y)]);
  }
  const top = base - ph;
  const gr = g.createLinearGradient(0, top, 0, base);
  gr.addColorStop(0, rgba(ink, a)); gr.addColorStop(0.35, rgba(ink, a * 0.62)); gr.addColorStop(0.8, rgba(ink, a * 0.12)); gr.addColorStop(1, rgba(ink, 0));
  g.beginPath(); g.moveTo(P[0][0], base); for (const q of P) g.lineTo(q[0], q[1]); g.lineTo(P[n][0], base); g.closePath(); g.fillStyle = gr; g.fill();
  if (o.tint) { const tg = g.createLinearGradient(0, top, 0, base); tg.addColorStop(0, rgba(o.tint, 0)); tg.addColorStop(0.5, rgba(o.tint, o.tintA ?? 0.18)); tg.addColorStop(1, rgba(o.tint, 0)); g.fillStyle = tg; g.fill(); }
  // wet-in-wet blooms: soft darker patches inside the wash
  for (let k = 0; k < (o.blooms ?? 3); k++) { const i = 8 + Math.floor(R() * (n - 16)), q = P[i], r = ph * (0.12 + R() * 0.2); const bg = g.createRadialGradient(q[0], q[1] + r * 0.9, 0, q[0], q[1] + r * 0.9, r); bg.addColorStop(0, rgba(ink, a * 0.35)); bg.addColorStop(0.7, rgba(ink, a * 0.12)); bg.addColorStop(1, rgba(ink, 0)); g.fillStyle = bg; g.fillRect(q[0] - r, q[1] - r * 0.1, r * 2, r * 2); }
  // pooled ridge band
  g.save(); g.shadowColor = rgba(ink, a); g.shadowBlur = o.blur ?? 3;
  g.beginPath(); for (let i = 0; i <= n; i++) i ? g.lineTo(P[i][0], P[i][1]) : g.moveTo(P[i][0], P[i][1]);
  for (let i = n; i >= 0; i--) { const th = ph * (0.035 + 0.05 * noise1(i * 0.4, sd + 5)) * (1 - Math.abs(-1 + (2 * i) / n) * 0.6); g.lineTo(P[i][0], P[i][1] + th); }
  g.closePath(); g.fillStyle = rgba(ink, a * 0.55); g.fill(); g.restore();
  if (o.ridge !== false) {
    // ridge line in two or three broken dry strokes
    let i = 0; while (i < n) { const j = Math.min(n, i + 8 + Math.floor(R() * 14)); const seg = P.slice(i, j + 1).map((q, k, arr) => [q[0], q[1] + 0.5, 0.5 + 0.5 * Math.sin((k / (arr.length - 1)) * Math.PI)]);
      if (seg.length > 2 && R() < 0.85) stroke(g, seg, { w: (o.rw ?? 2.4), alpha: a * 1.3, dry: 0.55, seed: Math.floor(R() * 1e6), color: ink, taper: [0.2, 0.3], edge: 0.2 }); i = j + Math.floor(R() * 3); }
  }
  // texture strokes down the slopes
  const tex = o.tex ?? 10;
  for (let k = 0; k < tex; k++) {
    const i = 3 + Math.floor(R() * (n - 6)), q = P[i], side = i < n / 2 ? -1 : 1;
    const len = ph * (0.12 + R() * 0.28), x2 = q[0] + side * len * (0.25 + R() * 0.35), y2 = q[1] + len;
    stroke(g, [[q[0], q[1] + 2, 0.9], [lerp(q[0], x2, 0.5) + (R() - 0.5) * 6, lerp(q[1], y2, 0.5), 0.7], [x2, y2, 0.2]], { w: (o.tw ?? 2.2) * (0.6 + R()), alpha: a * 0.7, dry: 0.75, seed: Math.floor(R() * 1e6), color: ink, taper: [0.05, 0.7] });
  }
  // moss dots along the ridge
  const dots = o.dots ?? 6;
  for (let k = 0; k < dots; k++) { const i = 4 + Math.floor(R() * (n - 8)), q = P[i]; for (let m = 0; m < 3; m++) drop(g, q[0] + (R() - 0.5) * 10, q[1] + 1 + R() * 4, 0.8 + R() * 1.6, ink, a * 1.2); }
  return P;
}
export function mist(g, x0, x1, yA, yB, paper, a = 0.95) {
  const gr = g.createLinearGradient(0, yA, 0, yB); gr.addColorStop(0, rgba(paper, 0)); gr.addColorStop(0.55, rgba(paper, a * 0.8)); gr.addColorStop(1, rgba(paper, a));
  g.fillStyle = gr; g.fillRect(x0, yA, x1 - x0, yB - yA);
}
// a soft horizontal cloud bank in paper colour, it erases ink like real mist on a scroll
export function cloud(g, R, x, y, len, th, paper, a = 0.85) {
  g.save(); g.fillStyle = rgba(paper, a); g.shadowColor = rgba(paper, a); g.shadowBlur = th * 1.4;
  g.beginPath(); const n = 10;
  for (let i = 0; i <= n; i++) { const u = i / n, px = x + u * len, py = y - th * Math.sin(u * Math.PI) * (0.6 + R() * 0.5); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  for (let i = n; i >= 0; i--) { const u = i / n; g.lineTo(x + u * len, y + th * 0.35 * Math.sin(u * Math.PI)); }
  g.fill(); g.restore();
}
export function pine(g, R, x, base, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.85, lean = (R() - 0.5) * 0.5 + (o.lean || 0);
  const pts = []; for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([x + Math.sin(t * 2.6 + R()) * h * 0.06 + lean * h * t * t, base - h * t, 1 - t * 0.6]); }
  stroke(g, pts, { w: h * 0.05 + 1.5, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink, taper: [0.02, 0.4], edge: 0.6 });
  // bark marks
  for (let i = 0; i < 4; i++) { const q = pts[1 + Math.floor(R() * 3)]; drop(g, q[0] + (R() - 0.5) * 3, q[1] + R() * 6, 0.6 + R(), ink, a); }
  // limbs with needle clusters, layered like the classic brush pines
  const tiers = 3 + Math.floor(R() * 3);
  for (let k = 0; k < tiers; k++) {
    const t = 0.38 + (k / tiers) * 0.6, q = pts[Math.min(5, Math.round(t * 5))], side = k % 2 ? 1 : -1, L = h * (0.22 + R() * 0.25) * (1 - t * 0.5);
    const ex = q[0] + side * L, ey = q[1] - L * 0.15 + (R() - 0.5) * 8;
    stroke(g, [[q[0], q[1], 0.8], [lerp(q[0], ex, 0.5), q[1] - 4, 0.6], [ex, ey, 0.3]], { w: h * 0.022 + 1, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink });
    needles(g, R, ex, ey, L * 0.75, h * 0.11, ink, a, o.wash);
    needles(g, R, lerp(q[0], ex, 0.55), ey + 2, L * 0.55, h * 0.08, ink, a * 0.85, o.wash);
  }
  needles(g, R, pts[5][0], pts[5][1], h * 0.22, h * 0.1, ink, a, o.wash);
}
function needles(g, R, x, y, wdt, ht, ink, a, wash) {
  if (wash) { g.save(); g.globalAlpha = 0.22; g.fillStyle = wash; g.beginPath(); g.ellipse(x, y + ht * 0.2, wdt * 0.6, ht * 0.55, 0, 0, 6.3); g.fill(); g.restore(); }
  g.save(); g.globalAlpha = a * 0.16; g.fillStyle = ink; g.beginPath(); g.ellipse(x, y + ht * 0.15, wdt * 0.55, ht * 0.42, 0, 0, 6.3); g.fill(); g.restore();
  // fans of needles radiating upward
  const fans = 3 + Math.floor(wdt / 14);
  g.strokeStyle = ink; g.lineCap = 'round';
  for (let f = 0; f < fans; f++) {
    const fx = x + (R() - 0.5) * wdt, fy = y + (R() - 0.3) * ht * 0.5; const nN = 7 + Math.floor(R() * 5);
    for (let k = 0; k < nN; k++) {
      const ang = -Math.PI / 2 + (k / (nN - 1) - 0.5) * 2.4 + (R() - 0.5) * 0.2, l = ht * (0.45 + R() * 0.4);
      g.globalAlpha = a * (0.55 + R() * 0.4); g.lineWidth = 0.7 + R() * 0.9;
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(ang) * l, fy + Math.sin(ang) * l * 0.55); g.stroke();
    }
  }
}
// a bamboo stalk from base upward, with nodes and leaf sprays. Used for static bands and swaying sprites.
export function bamboo(g, R, x, base, h, w, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.85, lean = o.lean ?? (R() - 0.5) * 0.06;
  let y = base, cx = x, k = 0; const nodes = [];
  while (y > base - h) {
    const seg = (34 + R() * 26) * clamp(w / 6, 0.75, 1.8) * Math.max(0.7, 1 - k * 0.02), y2 = Math.max(base - h, y - seg), cx2 = cx + lean * seg;
    stroke(g, [[cx, y - 1.5, 0.95], [(cx + cx2) / 2, (y + y2) / 2, 1], [cx2, y2 + 1.5, 0.95]], { w, alpha: a, dry: 0.35 + R() * 0.25, seed: Math.floor(R() * 1e6), color: ink, taper: [0.02, 0.04], tip: 0.85, edge: 0.7, bristles: Math.max(3, Math.round(w)) });
    if (o.wash) { g.save(); g.globalAlpha = 0.18; g.strokeStyle = o.wash; g.lineWidth = w * 0.7; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx2, y2); g.stroke(); g.restore(); }
    // node: a short dark stroke with hooked ends
    g.save(); g.strokeStyle = ink; g.globalAlpha = a; g.lineWidth = Math.max(0.8, w * 0.22); g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx2 - w * 0.75, y2 + 1.2); g.quadraticCurveTo(cx2, y2 - 1.2, cx2 + w * 0.75, y2 + 1.2); g.stroke(); g.restore();
    nodes.push([cx2, y2]); y = y2; cx = cx2; k++;
  }
  // leaves: sprays from upper nodes, pointing down and out, like the character 个 and 介
  const lf = o.leaves ?? 1;
  for (let i = Math.floor(nodes.length * 0.35); i < nodes.length; i++) {
    if (R() > 0.55 * lf) continue;
    const [nx, ny] = nodes[i], side = R() < 0.5 ? -1 : 1;
    const tx = nx + side * (10 + R() * 22), ty = ny - 6 - R() * 10;
    g.save(); g.strokeStyle = ink; g.globalAlpha = a * 0.9; g.lineWidth = Math.max(0.6, w * 0.12); g.beginPath(); g.moveTo(nx, ny); g.quadraticCurveTo((nx + tx) / 2, ny - 2, tx, ty); g.stroke(); g.restore();
    const nl = 3 + Math.floor(R() * 4);
    for (let j = 0; j < nl; j++) {
      const ang = side > 0 ? 0.25 + (j / nl) * 1.3 + (R() - 0.5) * 0.3 : Math.PI - 0.25 - (j / nl) * 1.3 + (R() - 0.5) * 0.3;
      const L = (18 + R() * 16) * (w / 5) * (o.leafScale || 1);
      if (o.wash) leaf(g, tx + 1, ty + 1, ang + 0.05, L * 1.05, L * 0.2, o.wash, 0.35);
      leaf(g, tx, ty, ang, L, L * 0.16, ink, a * (0.7 + R() * 0.3), (R() - 0.5) * 0.3);
    }
  }
  return nodes;
}
export function grassClump(g, R, x, base, h, ink, a, n = 7) {
  g.strokeStyle = ink; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (R() - 0.5) * 1.2, l = h * (0.5 + R() * 0.6), bx = x + (R() - 0.5) * 8;
    const ex = bx + Math.cos(ang) * l, ey = base + Math.sin(ang) * l;
    g.globalAlpha = a * (0.6 + R() * 0.4); g.lineWidth = 0.8 + R() * 1.2;
    g.beginPath(); g.moveTo(bx, base); g.quadraticCurveTo(bx + (ex - bx) * 0.2, base + (ey - base) * 0.6, ex, ey); g.stroke();
  }
}
export function torii(g, R, x, base, h, w, o = {}) {
  const ink = o.ink || INK, red = o.red || '#c4442b', a = o.a ?? 0.9, pw = w * 0.075;
  const lx = x - w * 0.36, rx = x + w * 0.36;
  // pillars: vermilion wash then ink edges
  for (const px of [lx, rx]) {
    g.save(); g.globalAlpha = a * 0.85; g.fillStyle = red; g.fillRect(px - pw / 2, base - h * 0.86, pw, h * 0.86); g.restore();
    stroke(g, [[px - pw / 2, base, 1], [px - pw / 2, base - h * 0.86, 1]], { w: Math.max(1, pw * 0.25), alpha: a * 0.9, dry: 0.45, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.05], tip: 0.9 });
    g.save(); g.globalAlpha = a; g.fillStyle = ink; g.fillRect(px - pw * 0.62, base - h * 0.08, pw * 1.24, h * 0.08); g.restore();
  }
  // nuki (lower beam) and kasagi (upper beam with lifted ends)
  g.save(); g.globalAlpha = a * 0.85; g.fillStyle = red; g.fillRect(x - w * 0.46, base - h * 0.72, w * 0.92, h * 0.055); g.restore();
  const ky = base - h * 0.88;
  g.save(); g.globalAlpha = a * 0.88; g.fillStyle = red; g.beginPath(); g.moveTo(x - w * 0.56, ky - h * 0.07); g.quadraticCurveTo(x, ky + h * 0.0, x + w * 0.56, ky - h * 0.07); g.lineTo(x + w * 0.5, ky + h * 0.04); g.quadraticCurveTo(x, ky + h * 0.08, x - w * 0.5, ky + h * 0.04); g.closePath(); g.fill(); g.restore();
  stroke(g, [[x - w * 0.6, ky - h * 0.1, 0.5], [x - w * 0.3, ky - h * 0.04, 1], [x + w * 0.3, ky - h * 0.04, 1], [x + w * 0.6, ky - h * 0.1, 0.5]], { w: h * 0.06, alpha: a, dry: 0.3, seed: Math.floor(R() * 1e6), color: ink, taper: [0.1, 0.1], tip: 0.5 });
}
export function stoneLantern(g, R, x, base, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.8, s = h / 60;
  const wash = (x0, y0, w, hh) => { g.save(); g.globalAlpha = a * 0.35; g.fillStyle = ink; g.fillRect(x0, y0, w, hh); g.restore(); stroke(g, [[x0, y0 + hh, 1], [x0, y0, 1], [x0 + w, y0, 1]], { w: 1.6 * s + 0.5, alpha: a, dry: 0.55, seed: Math.floor(R() * 1e6), color: ink, taper: [0.05, 0.1], tip: 0.6 }); };
  wash(x - 9 * s, base - 6 * s, 18 * s, 6 * s); wash(x - 3.5 * s, base - 30 * s, 7 * s, 24 * s); wash(x - 10 * s, base - 34 * s, 20 * s, 4 * s);
  g.save(); g.globalAlpha = a * 0.3; g.fillStyle = ink; g.fillRect(x - 7 * s, base - 46 * s, 14 * s, 12 * s); g.restore();
  if (o.glow) { g.save(); g.globalAlpha = 0.9; g.fillStyle = o.glow; g.fillRect(x - 4 * s, base - 44 * s, 8 * s, 8 * s); g.restore(); }
  stroke(g, [[x - 14 * s, base - 45 * s, 0.6], [x, base - 54 * s, 1], [x + 14 * s, base - 45 * s, 0.6]], { w: 3.2 * s, alpha: a, dry: 0.4, seed: Math.floor(R() * 1e6), color: ink });
  drop(g, x, base - 57 * s, 2.4 * s, ink, a);
}
// small roofed shrine (hokora) on a stone: the checkpoints
export function hokora(g, R, x, base, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.88, acc = o.accent;
  g.save(); g.globalAlpha = a * 0.3; g.fillStyle = ink; g.beginPath(); g.ellipse(x, base - 4, 26, 7, 0, 0, 6.3); g.fill(); g.restore();
  stroke(g, [[x - 24, base - 4, 0.8], [x, base - 9, 1], [x + 24, base - 4, 0.8]], { w: 3, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink });
  g.save(); g.globalAlpha = a * 0.42; g.fillStyle = ink; g.fillRect(x - 12, base - 38, 24, 29); g.restore();
  if (acc) { g.save(); g.globalAlpha = 0.5; g.fillStyle = acc; g.fillRect(x - 6, base - 30, 12, 14); g.restore(); }
  stroke(g, [[x - 12, base - 9, 1], [x - 12, base - 38, 1]], { w: 2, alpha: a, dry: 0.5, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.1], tip: 0.8 });
  stroke(g, [[x + 12, base - 9, 1], [x + 12, base - 38, 1]], { w: 2, alpha: a, dry: 0.5, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.1], tip: 0.8 });
  // roof with lifted eaves
  g.save(); g.globalAlpha = a * 0.75; g.fillStyle = ink; g.beginPath(); g.moveTo(x - 24, base - 37); g.quadraticCurveTo(x - 10, base - 42, x, base - 54); g.quadraticCurveTo(x + 10, base - 42, x + 24, base - 37); g.quadraticCurveTo(x, base - 41, x - 24, base - 37); g.fill(); g.restore();
  stroke(g, [[x - 26, base - 35, 0.4], [x - 12, base - 42, 1], [x, base - 53, 0.9], [x + 12, base - 42, 1], [x + 26, base - 35, 0.4]], { w: 3.2, alpha: a, dry: 0.35, seed: Math.floor(R() * 1e6), color: ink, taper: [0.15, 0.15] });
  // paper streamers (shide)
  for (const sx of [-6, 6]) { g.save(); g.globalAlpha = a * 0.7; g.strokeStyle = ink; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + sx, base - 38); g.lineTo(x + sx + 2, base - 32); g.lineTo(x + sx - 1, base - 29); g.lineTo(x + sx + 2, base - 25); g.stroke(); g.restore(); }
}
// a rough rock (with moss dots); also the haiku seat and the hidden shrine base
export function rock(g, R, x, base, w, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.8, n = 14, P = [];
  for (let i = 0; i <= n; i++) { const t = i / n, ang = Math.PI + t * Math.PI; const r = 1 + (R() - 0.5) * 0.25; P.push([x + Math.cos(ang) * w * 0.5 * r, base + Math.sin(ang) * h * r * (0.85 + 0.15 * Math.sin(t * 9))]); }
  const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, rgba(ink, a * 0.42)); gr.addColorStop(1, rgba(ink, a * 0.08));
  g.beginPath(); g.moveTo(P[0][0], base); for (const q of P) g.lineTo(q[0], q[1]); g.closePath(); g.fillStyle = gr; g.fill();
  stroke(g, P.map((q, i) => [q[0], q[1], 0.6 + 0.4 * Math.sin((i / n) * Math.PI)]), { w: 2.6, alpha: a, dry: 0.55, seed: Math.floor(R() * 1e6), color: ink, taper: [0.05, 0.2] });
  stroke(g, [[x - w * 0.1, base - h * 0.85, 0.8], [x + w * 0.05, base - h * 0.4, 0.5], [x - w * 0.05, base - h * 0.1, 0.2]], { w: 1.6, alpha: a * 0.7, dry: 0.75, seed: Math.floor(R() * 1e6), color: ink });
  for (let i = 0; i < 6; i++) { const q = P[2 + Math.floor(R() * (n - 4))]; drop(g, q[0] + (R() - 0.5) * 4, q[1] + R() * 3, 0.8 + R() * 1.3, ink, a); }
}
function cedar(g, R, x, base, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.7;
  stroke(g, [[x, base, 1], [x + (R() - 0.5) * 4, base - h * 0.5, 0.8], [x, base - h, 0.3]], { w: h * 0.035 + 1, alpha: a, dry: 0.55, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.3] });
  const tiers = 7 + Math.floor(R() * 4);
  for (let k = 0; k < tiers; k++) {
    const t = 0.2 + (k / tiers) * 0.8, y = base - h * t, wd = h * 0.2 * (1 - t) + 6;
    g.save(); g.globalAlpha = a * 0.5; g.fillStyle = ink; g.beginPath(); g.moveTo(x - wd, y + 6); g.quadraticCurveTo(x, y - 10, x + wd, y + 6); g.quadraticCurveTo(x, y + 2, x - wd, y + 6); g.fill(); g.restore();
    stroke(g, [[x - wd, y + 6, 0.3], [x - wd * 0.3, y - 2, 1], [x + wd * 0.3, y - 2, 1], [x + wd, y + 6, 0.3]], { w: 2.2, alpha: a, dry: 0.7, seed: Math.floor(R() * 1e6), color: ink });
  }
}
function house(g, R, x, base, s, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.75;
  g.save(); g.globalAlpha = a * 0.25; g.fillStyle = ink; g.fillRect(x - 30 * s, base - 22 * s, 60 * s, 22 * s); g.restore();
  for (const px of [-28, -8, 12, 28]) stroke(g, [[x + px * s, base, 1], [x + px * s, base - 22 * s, 1]], { w: 1.4 * s + 0.4, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.1], tip: 0.7 });
  // thatched roof: thick wash and dry strokes
  g.save(); g.globalAlpha = a * 0.6; g.fillStyle = ink; g.beginPath(); g.moveTo(x - 40 * s, base - 20 * s); g.lineTo(x - 18 * s, base - 50 * s); g.lineTo(x + 18 * s, base - 50 * s); g.lineTo(x + 40 * s, base - 20 * s); g.closePath(); g.fill(); g.restore();
  for (let i = 0; i < 9; i++) { const t = i / 8; stroke(g, [[x - 18 * s + 36 * s * t, base - 50 * s, 0.8], [x - 40 * s + 80 * s * t, base - 20 * s, 0.3]], { w: 1.6 * s, alpha: a * 0.6, dry: 0.85, seed: Math.floor(R() * 1e6), color: ink }); }
  stroke(g, [[x - 42 * s, base - 19 * s, 0.6], [x + 42 * s, base - 19 * s, 0.6]], { w: 2.5 * s, alpha: a, dry: 0.5, seed: Math.floor(R() * 1e6), color: ink });
  stroke(g, [[x - 20 * s, base - 51 * s, 1], [x + 20 * s, base - 51 * s, 1]], { w: 4 * s, alpha: a, dry: 0.4, seed: Math.floor(R() * 1e6), color: ink });
}
// [inkfx petals] an old cherry in full bloom: a gnarled dry-brush trunk, dark ink branches, blossom as soft pink washes
function oldCherry(g, R, x, base, h, pink) {
  const lean = (R() - 0.5) * 0.5, T = [[x, base, 1], [x + lean * h * 0.15 + (R() - 0.5) * 16, base - h * 0.28, 0.95], [x + lean * h * 0.3 + (R() - 0.5) * 22, base - h * 0.5, 0.75]];
  const ends = [];
  // blossom first (behind the branches): overlapping soft washes, a darker heart in a few, and loose dabs at the edges
  const masses = [];
  for (let k = 0; k < 7; k++) { const q = T[1 + (k % 2)], ang = -Math.PI / 2 + (R() - 0.5) * 2.6, L = h * (0.28 + R() * 0.3); masses.push([q[0] + Math.cos(ang) * L, q[1] + Math.sin(ang) * L * 0.55, q, ang, L]); }
  for (const [mx, my] of masses) for (let i = 0; i < 5; i++) { const r = h * (0.09 + R() * 0.1), px = mx + (R() - 0.5) * h * 0.22, py = my + (R() - 0.5) * h * 0.12, rg = g.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, rgba(pink, 0.3 + R() * 0.15)); rg.addColorStop(0.7, rgba(pink, 0.16)); rg.addColorStop(1, rgba(pink, 0)); g.fillStyle = rg; g.fillRect(px - r, py - r, r * 2, r * 2); }
  stroke(g, T, { w: h * 0.07, alpha: 0.6, dry: 0.65, seed: Math.floor(R() * 1e6), taper: [0, 0.4] });
  for (const [ex, ey, q] of masses) { stroke(g, [[q[0], q[1], 0.75], [lerp(q[0], ex, 0.5) + (R() - 0.5) * 18, lerp(q[1], ey, 0.5) + (R() - 0.5) * 10, 0.5], [ex, ey, 0.15]], { w: h * 0.022, alpha: 0.5, dry: 0.6, seed: Math.floor(R() * 1e6) }); ends.push([ex, ey]); }
  for (const [mx, my] of masses) for (let i = 0; i < 10; i++) { const px = mx + (R() - 0.5) * h * 0.3, py = my + (R() - 0.5) * h * 0.16; drop(g, px, py, 1.2 + R() * 2.4, R() < 0.2 ? mix(pink, INK, 0.25) : pink, 0.35 + R() * 0.3); }
}
function cherry(g, R, x, base, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.8, pink = o.pink || '#d48a9c';
  const pts = [[x, base, 1], [x + (R() - 0.5) * 20, base - h * 0.35, 0.9], [x + (R() - 0.5) * 30, base - h * 0.6, 0.6]];
  stroke(g, pts, { w: h * 0.07, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.4] });
  const ends = [];
  for (let k = 0; k < 6; k++) {
    const q = pts[1 + (k % 2)], ang = -Math.PI / 2 + (R() - 0.5) * 2.4, L = h * (0.25 + R() * 0.3);
    const ex = q[0] + Math.cos(ang) * L, ey = q[1] + Math.sin(ang) * L * 0.6;
    stroke(g, [[q[0], q[1], 0.7], [lerp(q[0], ex, 0.5) + (R() - 0.5) * 10, lerp(q[1], ey, 0.5), 0.5], [ex, ey, 0.2]], { w: h * 0.03, alpha: a, dry: 0.6, seed: Math.floor(R() * 1e6), color: ink });
    ends.push([ex, ey]);
  }
  for (const [ex, ey] of ends) for (let i = 0; i < 16; i++) { const r = h * 0.12 * Math.sqrt(R()); const an = R() * 6.3; drop(g, ex + Math.cos(an) * r * 1.4, ey + Math.sin(an) * r, 1.5 + R() * 3.5, pink, 0.35 + R() * 0.3); }
  for (const [ex, ey] of ends) for (let i = 0; i < 5; i++) drop(g, ex + (R() - 0.5) * h * 0.2, ey + (R() - 0.5) * h * 0.12, 0.8 + R() * 1, ink, 0.6);
}
function castle(g, R, x, base, s, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.55;
  // stone base (ishigaki) with curved flanks
  g.save(); g.globalAlpha = a * 0.5; g.fillStyle = ink; g.beginPath(); g.moveTo(x - 80 * s, base); g.quadraticCurveTo(x - 66 * s, base - 30 * s, x - 60 * s, base - 60 * s); g.lineTo(x + 60 * s, base - 60 * s); g.quadraticCurveTo(x + 66 * s, base - 30 * s, x + 80 * s, base); g.closePath(); g.fill(); g.restore();
  for (let i = 0; i < 9; i++) stroke(g, [[x - 74 * s + i * 2 * s, base - i * 7 * s, 0.6], [x + 74 * s - i * 2 * s, base - i * 7 * s, 0.6]], { w: 1.2 * s, alpha: a * 0.6, dry: 0.85, seed: Math.floor(R() * 1e6), color: ink });
  // tiers
  let y = base - 60 * s, w = 54 * s;
  for (let t = 0; t < 4; t++) {
    const hh = (t === 0 ? 30 : 22) * s;
    g.save(); g.globalAlpha = a * 0.22; g.fillStyle = ink; g.fillRect(x - w, y - hh, w * 2, hh); g.restore();
    for (let wi = -2; wi <= 2; wi++) { g.save(); g.globalAlpha = a * 0.6; g.fillStyle = ink; g.fillRect(x + wi * w * 0.35 - 2 * s, y - hh * 0.6, 4 * s, hh * 0.3); g.restore(); }
    // roof with upswept eaves
    const ry = y - hh, rw = w * 1.3;
    g.save(); g.globalAlpha = a * 0.75; g.fillStyle = ink; g.beginPath(); g.moveTo(x - rw, ry + 2 * s); g.quadraticCurveTo(x - rw * 0.6, ry - 2 * s, x - w * 0.6, ry - 12 * s); g.lineTo(x + w * 0.6, ry - 12 * s); g.quadraticCurveTo(x + rw * 0.6, ry - 2 * s, x + rw, ry + 2 * s); g.quadraticCurveTo(x, ry - 2 * s, x - rw, ry + 2 * s); g.fill(); g.restore();
    stroke(g, [[x - rw - 4 * s, ry - 2 * s, 0.4], [x - rw * 0.6, ry, 1], [x + rw * 0.6, ry, 1], [x + rw + 4 * s, ry - 2 * s, 0.4]], { w: 2.4 * s, alpha: a * 1.2, dry: 0.4, seed: Math.floor(R() * 1e6), color: ink, taper: [0.1, 0.1] });
    if (t === 1 || t === 2) { g.save(); g.globalAlpha = a * 0.7; g.fillStyle = ink; g.beginPath(); g.moveTo(x - 12 * s, ry - 4 * s); g.quadraticCurveTo(x, ry - 22 * s, x + 12 * s, ry - 4 * s); g.fill(); g.restore(); }
    y = ry - 12 * s; w *= 0.78;
  }
  // shachi ornaments at the ridge
  drop(g, x - w * 0.9, y - 2 * s, 2.5 * s, ink, a * 1.3); drop(g, x + w * 0.9, y - 2 * s, 2.5 * s, ink, a * 1.3);
}
function terraces(g, R, x0, x1, top, rows, o) {
  const ink = o.ink || INK, acc = o.accent;
  let y = top;
  for (let r = 0; r < rows; r++) {
    const amp = 6 + r * 2.5, sd = Math.floor(R() * 999), dy = 11 + r * 5.5;
    const pts = []; for (let x = x0; x <= x1; x += 40) pts.push([x, y + Math.sin((x - x0) * 0.006 + r) * amp + (fbm(x * 0.004, sd) - 0.5) * 22, 0.4 + 0.6 * noise1(x * 0.01, sd)]);
    // water in the paddy below each wall catches the sky
    if (acc) { g.save(); g.globalAlpha = 0.16 + R() * 0.16; g.fillStyle = acc; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1] + 2); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + dy * 0.8); g.fill(); g.restore(); }
    // [inkfx ground] the wet earth under each bank as a soft hanging wash, the bank one broken stroke of varying weight
    hangWash(g, pts, 5 + r * 1.2, ink, 0.12 + r * 0.015, 4);
    { let run = []; const fl = () => { if (run.length > 1) stroke(g, run, { w: 1.3 + r * 0.35, alpha: 0.32 + r * 0.05, dry: 0.6, seed: sd + Math.floor(run[0][0]), color: ink, taper: [0.2, 0.2], tip: 0.3, step: 3 }); run = []; };
      for (const q of pts) { if (noise1(q[0] * 0.013, sd) < 0.22) fl(); else run.push([q[0], q[1], 0.35 + 0.8 * noise1(q[0] * 0.03, sd + 2)]); } fl(); }
    // rice: a few thin stalks in loose clusters where the field is thick, bare elsewhere
    for (let i = 0; i < pts.length; i++) if (fbm(pts[i][0] * 0.006, sd + 4, 3) > 0.55 && R() < 0.55) { const bx = pts[i][0] + R() * 30, by = pts[i][1], n = 2 + Math.floor(R() * 3); for (let k = 0; k < n; k++) { const x = bx + (k - n / 2) * (1.5 + R() * 2), h = (3 + r * 1.1) * (0.6 + R() * 0.7), l = (R() - 0.5) * 0.4; stroke(g, [[x, by, 1], [x + l * h, by - h, 0.1]], { w: 0.8 + r * 0.12, alpha: 0.22 + r * 0.03, dry: 0.3, seed: sd + i * 7 + k, edge: 0, taper: [0, 0.7], color: ink }); } }
    y += dy;
  }
}
function lanternPost(g, R, x, base, h, o = {}) {
  const ink = o.ink || INK, a = o.a ?? 0.85;
  stroke(g, [[x, base, 1], [x + 1, base - h, 1]], { w: 2.4, alpha: a, dry: 0.5, seed: Math.floor(R() * 1e6), color: ink, taper: [0, 0.05], tip: 0.8 });
  stroke(g, [[x - 1, base - h + 2, 0.8], [x + 16, base - h - 2, 0.6]], { w: 2, alpha: a, dry: 0.5, seed: Math.floor(R() * 1e6), color: ink });
}

// ---------- skies (screen space) ----------
function mistLobe(g, x, y, rx, ry, col, a) {
  const rg = g.createRadialGradient(x, y, 0, x, y, rx); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(0.6, rgba(col, a * 0.55)); rg.addColorStop(1, rgba(col, 0));
  g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = rg; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore();
}
function sunBloom(g, R, x, y, r, col, a) {
  // wet core: soft, with a faint pooled ring where the pigment gathered as it dried
  let rg = g.createRadialGradient(x, y, 0, x, y, r * 1.25); rg.addColorStop(0, rgba(col, a * 0.82)); rg.addColorStop(0.62, rgba(col, a * 0.72)); rg.addColorStop(0.8, rgba(col, a * 0.5)); rg.addColorStop(1, rgba(col, 0));
  g.fillStyle = rg; g.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
  // bleed: lobes that crept outward through the wet paper, more on the lower side (the sheet was tilted)
  for (let i = 0; i < 16; i++) {
    const an = R() * 6.2832, d = r * (0.7 + R() * 0.5), lx = x + Math.cos(an) * d, ly = y + Math.sin(an) * d * (Math.sin(an) > 0 ? 1.15 : 0.9), lr = r * (0.25 + R() * 0.35);
    rg = g.createRadialGradient(lx, ly, 0, lx, ly, lr); rg.addColorStop(0, rgba(col, a * 0.2)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
  }
  // a wide faint halo of pigment carried by the water
  rg = g.createRadialGradient(x, y, r, x, y, r * 3); rg.addColorStop(0, rgba(col, a * 0.12)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  g.save(); g.globalAlpha = a * 0.22; g.strokeStyle = mix(col, INK, 0.3); g.lineWidth = Math.max(1, r * 0.035); g.beginPath(); g.arc(x, y, r * 1.02, 0.4, 2.6); g.stroke(); g.restore();
}
function fibres(g, R, W, H, k) {
  g.save(); g.lineCap = 'round'; g.strokeStyle = '#6b5638'; g.lineWidth = Math.max(0.5, 0.45 * k);
  const n = Math.round(W * H / 2600);
  for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H, a = R() * 6.2832, L = (4 + R() * 12) * k, c = (R() - 0.5) * 6 * k; g.globalAlpha = 0.035 + R() * 0.05; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 - Math.sin(a) * c, y + Math.sin(a) * L * 0.5 + Math.cos(a) * c, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  g.restore();
}
export function paintSky(g, W, H, k, ch, paper) {
  const C = CHAPTERS[ch], acc = C.accent, R = rng(ch * 97 + 5);
  const S = (v) => v * k;
  if (C.key === 'snow') {
    // night: the sky is a dark grainy wash; the moon is bare paper
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgba('#1c1f26', 0.94)); gr.addColorStop(0.55, rgba('#262a33', 0.86)); gr.addColorStop(1, rgba('#2f333b', 0.55));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) { const x = R() * W, y = R() * H * 0.6, r = Math.max(W, H) * (0.12 + R() * 0.2); const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(10,11,14,0.16)'); rg.addColorStop(1, 'rgba(10,11,14,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
    const mx = W * 0.74, my = H * 0.2, mr = S(34);
    const hal = g.createRadialGradient(mx, my, mr, mx, my, mr * 5); hal.addColorStop(0, rgba(acc, 0.35)); hal.addColorStop(1, rgba(acc, 0)); g.fillStyle = hal; g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 0.97; g.beginPath(); g.arc(mx, my, mr, 0, 6.3); g.fill(); g.globalAlpha = 0.25; g.beginPath(); g.arc(mx, my, mr * 1.25, 0, 6.3); g.fill(); g.restore();
    // a few stars: paper pricks through the wash
    g.save(); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.3 + R() * 0.6; g.beginPath(); g.arc(R() * W, R() * H * 0.5, S(0.4 + R() * 0.9), 0, 6.3); g.fill(); } g.restore();
    return;
  }
  const top = { bamboo: 0.1, terraces: 0.14, torii: 0.05, castle: 0.1 }[C.key];
  const gr = g.createLinearGradient(0, 0, 0, H * 0.7); gr.addColorStop(0, rgba(INK, top)); gr.addColorStop(1, rgba(INK, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // horizon glow in the chapter accent
  const ga = { bamboo: 0.12, terraces: 0.42, torii: 0.08, castle: 0.36 }[C.key];
  const hg = g.createLinearGradient(0, H * 0.25, 0, H * 0.8); hg.addColorStop(0, rgba(acc, 0)); hg.addColorStop(0.7, rgba(acc, ga)); hg.addColorStop(1, rgba(acc, ga * 0.4)); g.fillStyle = hg; g.fillRect(0, 0, W, H);
  // the sun: a wet disc with a darker pooled rim, partly veiled by a cloud stroke
  const sun = { bamboo: [0.22, 0.24, 26, 0.18], terraces: [0.7, 0.46, 46, 0.78], torii: [0.7, 0.13, 30, 0.85], castle: [0.3, 0.5, 40, 0.6] }[C.key];
  const sx = W * sun[0], sy = H * sun[1], sr = S(sun[2]);
  // [inkfx grade] the sun is a vermilion-family ink bloom bleeding into wet paper, not a hard disc
  sunBloom(g, R, sx, sy, sr, acc, sun[3]);
  // [inkfx grade] visible paper fibre in the sky: short, faint, warm hairs laid in the sheet
  fibres(g, R, W, H * 0.75, k);
  // long cloud strokes: thin dry ink above, paper veils across the sun
  // a couple of very faint dry streaks high up: wind written in the sky
  for (let i = 0; i < 2; i++) { const y = H * (0.08 + R() * 0.18), x = R() * W * 0.6, L = W * (0.25 + R() * 0.3); stroke(g, [[x, y, 0.2], [x + L * 0.5, y - S(4), 1], [x + L, y - S(1), 0.1]], { w: S(5), alpha: 0.07, dry: 0.92, seed: Math.floor(R() * 1e6), color: INK, taper: [0.3, 0.5], bristles: 14 }); }
  cloud(g, R, sx - sr * (1.6 + R()), sy + sr * (0.25 + R() * 0.3), sr * (3.4 + R() * 1.5), S(6 + R() * 3), paper, 0.55);
}

// ---------- chapter scene ----------
export function buildScene(ch) {
  const C = CHAPTERS[ch], paper = C.paper, acc = C.accent, key = C.key, L = C.len;
  const R = rng(1000 + ch * 31);
  const bands = [], lights = []; // [inkfx] lights: lantern fireboxes for the flame flicker
  const night = key === 'snow';
  const ink = INK;
  // far peaks: pale, high, few
  {
    const f = 0.05, objs = [], span = L * f + 1400;
    let x = -700;
    while (x < span) {
      const ph = (key === 'torii' ? 300 : 200) + R() * (key === 'torii' ? 140 : 110), hw = ph * (key === 'torii' ? 0.55 : 1.1) * (0.8 + R() * 0.5), sd = Math.floor(R() * 1e9);
      const cx = x, a = night ? 0.22 : 0.16;
      objs.push(obj(cx - hw, cx + hw, sd, (g, r) => { peak(g, r, cx, 30, ph, hw, { a, tex: 4, dots: 0, rw: 1.6, ink: night ? '#2a2d35' : ink, sharp: key === 'torii' ? 1.15 : 1.8, tint: night ? acc : null, tintA: 0.12 }); if (night) snowCaps(g, r, cx, 30, ph, hw, paper, { sharp: key === 'torii' ? 1.1 : 1.4 }); }));
      x += hw * (0.9 + R() * 0.6);
    }
    objs.push(obj(-1e5, 1e5, 3, (g, r) => mist(g, -1e5, 2e5, -150, 60, night ? '#3a3d44' : paper, night ? 0.5 : 0.92)));
    bands.push(new Band(f, -560, 60, 0.6, objs));
  }
  // middle range with cloud banks
  {
    const f = 0.14, objs = [], span = L * f + 1400; let x = -700;
    while (x < span) {
      const ph = 130 + R() * 120, hw = ph * (key === 'torii' ? 0.7 : 1.3) * (0.7 + R() * 0.6), sd = Math.floor(R() * 1e9), cx = x;
      objs.push(obj(cx - hw, cx + hw, sd, (g, r) => { peak(g, r, cx, 40, ph, hw, { a: night ? 0.3 : 0.3, tex: 9, dots: 5, ink: night ? '#262930' : ink, tint: key === 'terraces' || key === 'castle' ? acc : null, tintA: 0.14, sharp: key === 'torii' ? 1.2 : 1.8 }); if (night) snowCaps(g, r, cx, 40, ph, hw, paper);
        if (key === 'torii' && r() < 0.5) { for (let i = 0; i < 3; i++) pine(g, r, cx + (r() - 0.5) * hw, 40 - ph * (0.5 + r() * 0.3), 18 + r() * 10, { a: 0.35 }); } }));
      x += hw * (0.8 + R() * 0.7);
    }
    if (key === 'castle') { const cx = (L - 900) * f; objs.push(obj(cx - 200, cx + 200, 77, (g, r) => { cloud(g, r, cx - 190, 34, 380, 12, paper, 0.9); castle(g, r, cx, 36, 1.05, { a: 0.62 }); })); }
    for (let i = 0; i < span / 260; i++) { const cx = -700 + i * 260 + R() * 200, cy = -60 - R() * 100, len = 180 + R() * 260, sd = Math.floor(R() * 1e9); objs.push(obj(cx - 30, cx + len + 30, sd, (g, r) => cloud(g, r, cx, cy, len, 9 + r() * 10, night ? '#3a3d44' : paper, night ? 0.35 : 0.8))); }
    objs.push(obj(-1e5, 1e5, 4, (g) => mist(g, -1e5, 2e5, -90, 70, night ? '#41444b' : paper, night ? 0.55 : 0.94)));
    bands.push(new Band(f, -380, 70, 0.7, objs));
  }
  // near band (f .32): chapter-specific mid-ground
  {
    const f = 0.32, objs = [], span = L * f + 1400;
    // [inkfx grade] a sea of mist lobes behind this range (drawn first, so the near peaks rise out of it and the far ranges sink into it)
    for (let x = -800; x < span + 200; x += 70 + R() * 110) { const cx = x, cy = -30 + R() * 50, rx = 90 + R() * 150, ry = 14 + R() * 22, al = (night ? 0.32 : 0.42) + R() * 0.18; objs.push(obj(cx - rx, cx + rx, 0, (g) => mistLobe(g, cx, cy, rx, ry, night ? '#3d4049' : paper, al))); }
    if (key === 'bamboo') {
      for (let x = -700; x < span; x += 8 + R() * 18) { if (fbm(x * 0.006, 41) < 0.5) continue; const sd = Math.floor(R() * 1e9), h = 300 + R() * 160, w = 2.5 + R() * 2.5, cx = x; objs.push(obj(cx - 60, cx + 60, sd, (g, r) => bamboo(g, r, cx, 60, h, w, { a: 0.12 + r() * 0.1, leaves: 0.7, wash: acc, leafScale: 0.8 }))); }
    } else if (key === 'terraces') {
      let x = -700; while (x < span) { const sd = Math.floor(R() * 1e9), cx = x, ph = 70 + R() * 60, hw = 260 + R() * 200; objs.push(obj(cx - hw, cx + hw, sd, (g, r) => { peak(g, r, cx, 60, ph, hw, { a: 0.24, tex: 6, dots: 10, round: 1, sharp: 2, tint: acc, tintA: 0.2 }); })); x += hw * 1.1; }
      for (let x = -700; x < span; x += 600) { const sd = Math.floor(R() * 1e9), cx = x; objs.push(obj(cx - 20, cx + 640, sd, (g, r) => terraces(g, r, cx, cx + 620, -10, 5, { accent: acc }))); }
      for (let x = -400; x < span; x += 700 + R() * 600) { const sd = Math.floor(R() * 1e9), cx = x; objs.push(obj(cx - 60, cx + 60, sd, (g, r) => { house(g, r, cx, 0, 0.8, { a: 0.5 }); pine(g, r, cx + 50, 4, 60, { a: 0.5 }); })); }
    } else if (key === 'torii') {
      let x = -700; while (x < span) { const sd = Math.floor(R() * 1e9), cx = x, ph = 220 + R() * 120, hw = 140 + R() * 80; objs.push(obj(cx - hw, cx + hw, sd, (g, r) => { peak(g, r, cx, 60, ph, hw, { a: 0.3, tex: 12, dots: 12, sharp: 1.1, round: 1.2 }); for (let i = 0; i < 5; i++) cedar(g, r, cx + (r() - 0.5) * hw * 1.2, 60 - ph * (0.1 + r() * 0.4), 40 + r() * 30, { a: 0.3 }); })); x += hw * 1.4; }
      // a far line of gates climbing the slope into the mist
      for (let x = -600; x < span; x += 700) { const cx = x, sd = Math.floor(R() * 1e9); objs.push(obj(cx - 40, cx + 520, sd, (g, r) => { for (let i = 0; i < 14; i++) torii(g, r, cx + i * 34, 20 - i * 14, 30, 28, { a: 0.5 - i * 0.025, red: acc }); })); }
    } else if (key === 'snow') {
      for (let x = -700; x < span; x += 40 + R() * 70) { const sd = Math.floor(R() * 1e9), cx = x, h = 70 + R() * 90; objs.push(obj(cx - 60, cx + 60, sd, (g, r) => { pine(g, r, cx, 50, h, { a: 0.55, ink: '#202329' }); snowOnPine(g, r, cx, 50, h, paper); })); }
    } else if (key === 'castle') {
      for (let x = -700; x < span; x += 90 + R() * 160) { const sd = Math.floor(R() * 1e9), c2 = x; objs.push(obj(c2 - 70, c2 + 70, sd, (g, r) => cherry(g, r, c2, 50, 70 + r() * 50, { a: 0.4, pink: acc }))); }
    }
    objs.push(obj(-1e5, 1e5, 5, (g) => mist(g, -1e5, 2e5, -70, 80, night ? '#4a4c52' : paper, night ? 0.5 : 0.95)));
    bands.push(new Band(f, -480, 80, 0.8, objs));
  }
  // mid-ground (f .62): denser, darker
  {
    const f = 0.62, objs = [], span = L * f + 1400;
    if (key === 'bamboo') {
      for (let x = -700; x < span; x += 14 + R() * 30) { if (fbm(x * 0.005, 77) < 0.56) continue; const sd = Math.floor(R() * 1e9), h = 440 + R() * 100, w = 4.5 + R() * 3, cx = x; objs.push(obj(cx - 70, cx + 70, sd, (g, r) => bamboo(g, r, cx, 70, h, w, { a: 0.26 + r() * 0.14, leaves: 0.9, wash: acc, leafScale: 0.95 }))); }
    } else if (key === 'terraces') {
      for (let x = -700; x < span; x += 160 + R() * 260) { const sd = Math.floor(R() * 1e9), cx = x; objs.push(obj(cx - 80, cx + 80, sd, (g, r) => { if (r() < 0.5) pine(g, r, cx, 60, 110 + r() * 60, { a: 0.6 }); else reeds(g, r, cx, 60, 50, 0.5); })); }
    } else if (key === 'torii') {
      for (let x = -700; x < span; x += 50 + R() * 90) { const sd = Math.floor(R() * 1e9), cx = x; objs.push(obj(cx - 50, cx + 50, sd, (g, r) => cedar(g, r, cx, 70, 220 + r() * 120, { a: 0.42 }))); }
    } else if (key === 'snow') {
      for (let x = -700; x < span; x += 70 + R() * 140) { const sd = Math.floor(R() * 1e9), cx = x, h = 140 + R() * 120; objs.push(obj(cx - 80, cx + 80, sd, (g, r) => { pine(g, r, cx, 70, h, { a: 0.75, ink: '#16181d' }); snowOnPine(g, r, cx, 70, h, paper); })); }
    } else if (key === 'castle') {
      for (let x = -700; x < span; x += 140 + R() * 220) { const sd = Math.floor(R() * 1e9), cx = x; objs.push(obj(cx - 110, cx + 110, sd, (g, r) => cherry(g, r, cx, 70, 130 + r() * 60, { a: 0.6, pink: acc }))); }
      // [inkfx petals] the grove: old cherries in full bloom where the road nears the castle (band x = world x * f)
      { const bx = (C.ev.find((e) => e.t === 'boss') || { x: L }).x; for (let wx = bx - 1500; wx < bx + 900; wx += 420 + R() * 260) { const sd = Math.floor(R() * 1e9), cx = wx * f + (R() - 0.5) * 40, h = 300 + R() * 110; objs.push(obj(cx - h, cx + h, sd, (g, r) => oldCherry(g, r, cx, 74, h, acc))); } }
    }
    objs.push(obj(-1e5, 1e5, 6, (g) => mist(g, -1e5, 2e5, -40, 100, night ? '#55575c' : paper, night ? 0.45 : 0.9)));
    bands.push(new Band(f, -560, 100, 0.9, objs));
  }
  // play band (f 1): the ground and everything fixed on it. Tiles follow the ground height.
  {
    const objs = [];
    const gy = (x) => -groundH(ch, x);
    for (let x = -600; x < L + 600; x += 120) {
      const x0 = x, sd = Math.floor(R() * 1e9);
      objs.push(obj(x0 - 10, x0 + 150, sd, (g, r) => groundPiece(g, r, ch, x0, x0 + 140, gy)));
    }
    // fixed props by chapter
    for (const e of C.ev) {
      const ex = e.x, sd = Math.floor(R() * 1e9);
      if (e.t === 'shrine') objs.push(obj(ex - 70, ex + 70, sd, (g, r) => { hokora(g, r, ex, gy(ex) + 2, { accent: acc, ink: night ? '#121317' : INK }); }));
      if (e.t === 'haiku') objs.push(obj(ex - 120, ex + 120, sd, (g, r) => { rock(g, r, ex + 4, gy(ex) + 2, 46, 16, {}); pine(g, r, ex + 70, gy(ex + 70) + 2, 150, { a: 0.8, lean: -0.3 }); }));
    }
    if (key === 'torii') {
      // stone steps on the slopes and lanterns along the path
      for (let x = 0; x < L; x += 300 + R() * 200) { const cx = x, sd = Math.floor(R() * 1e9); lights.push({ x: cx, base: gy(cx) + 4, h: 52 + rng(sd)() * 14, ph: (sd % 1000) / 159 }); objs.push(obj(cx - 30, cx + 30, sd, (g, r) => stoneLantern(g, r, cx, gy(cx) + 4, 52 + r() * 14, { a: 0.7 }))); }
    }
    if (key === 'castle') for (let x = C.bridge[0]; x <= C.bridge[1]; x += 110) { const cx = x, sd = Math.floor(R() * 1e9); objs.push(obj(cx - 10, cx + 120, sd, (g, r) => bridgeRail(g, r, cx, gy, x === C.bridge[0], x + 110 > C.bridge[1]))); }
    const range = (i) => { let lo = 1e9, hi = -1e9; for (let x = i * TW - 40; x <= (i + 1) * TW + 40; x += 32) { const y = gy(x); lo = Math.min(lo, y); hi = Math.max(hi, y); } return [Math.floor(lo - 260), Math.ceil(hi + 260)]; };
    bands.push(new Band(1, 0, 0, 1, objs, { range, max: 6 }));
  }
  [2.6, 2.1, 1.7, 1.4, 1.15].forEach((gn, i) => { if (bands[i]) bands[i].redGain = gn; });
  return { ch, key, paper, accent: acc, night, bands, lights };
}
function snowCaps(g, R, cx, base, ph, hw, paper, o = {}) {
  // snow is paper left bare: lift the wash off the upper slopes, ragged where it meets rock
  const n = 40, sd = Math.floor(R() * 999), top = [], low = [];
  for (let i = 0; i <= n; i++) { const u = -0.62 + (1.24 * i) / n; const y = base - ph * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), o.sharp ?? 1.8)), o.round ?? 1.25); top.push([cx + u * hw, y]); low.push([cx + u * hw, y + ph * (0.12 + 0.22 * fbm(i * 0.35, sd)) * (1 - Math.abs(u) * 0.7)]); }
  g.save(); g.fillStyle = paper; g.globalAlpha = 0.82; g.shadowColor = paper; g.shadowBlur = 3;
  g.beginPath(); top.forEach((q, i) => (i ? g.lineTo(q[0], q[1] + 1) : g.moveTo(q[0], q[1] + 1))); for (let i = n; i >= 0; i--) g.lineTo(low[i][0], low[i][1]); g.closePath(); g.fill(); g.restore();
  // a few shadow strokes down the snow
  for (let k = 0; k < 5; k++) { const i = 6 + Math.floor(R() * (n - 12)), q = top[i]; stroke(g, [[q[0], q[1] + 3, 0.7], [q[0] + (R() - 0.5) * 20, low[i][1] + 6, 0.2]], { w: 1.6, alpha: 0.35, dry: 0.8, seed: Math.floor(R() * 1e6), color: '#2a2e36' }); }
}
function snowOnPine(g, R, x, base, h, paper) {
  // soft clumps of snow resting on the needle fans
  g.save(); g.fillStyle = paper; g.shadowColor = paper; g.shadowBlur = 2;
  for (let k = 0; k < 14; k++) { const t = 0.35 + R() * 0.62, y = base - h * t, w = h * 0.2 * (1.1 - t); const cx = x + (R() - 0.5) * w * 2; g.globalAlpha = 0.55 + R() * 0.35; g.beginPath(); g.moveTo(cx - w * 0.5, y); g.quadraticCurveTo(cx - w * 0.2, y - 3 - R() * 3, cx, y - 2); g.quadraticCurveTo(cx + w * 0.3, y - 4 - R() * 3, cx + w * 0.5, y + 1); g.quadraticCurveTo(cx, y + 2, cx - w * 0.5, y); g.fill(); }
  g.restore();
}
function reeds(g, R, x, base, h, a) { // [inkfx flora] thin stalks of different heights in a loose cluster, a couple bowing over
  const n = 3 + Math.floor(R() * 5);
  for (let i = 0; i < n; i++) { const bx = x + (R() - 0.5) * 34, l = h * (0.45 + R() * 0.65), bow = R() < 0.3 ? (R() < 0.5 ? -1 : 1) * (0.4 + R() * 0.5) : (R() - 0.5) * 0.25;
    stroke(g, [[bx, base, 1], [bx + Math.sin(bow) * l * 0.4, base - l * 0.55, 0.65], [bx + Math.sin(bow) * l * 0.9, base - l * Math.cos(bow * 0.8), 0.08]], { w: 1.4, alpha: a * (0.6 + R() * 0.4), dry: 0.35, seed: Math.floor(R() * 1e6), edge: 0, taper: [0, 0.85], tip: 0.05 }); }
}
function bridgeRail(g, R, x, gy, first, last) {
  const y0 = gy(x), y1 = gy(x + 110);
  // deck edge: two long strokes; posts with bronze caps (giboshi)
  stroke(g, [[x, y0 + 2, 1], [x + 112, y1 + 2, 1]], { w: 5, alpha: 0.85, dry: 0.35, seed: Math.floor(R() * 1e6), taper: [0, 0], tip: 1 });
  stroke(g, [[x, y0 + 12, 1], [x + 112, y1 + 12, 1]], { w: 3, alpha: 0.55, dry: 0.6, seed: Math.floor(R() * 1e6), taper: [0, 0], tip: 1 });
  stroke(g, [[x, y0 - 34, 1], [x + 112, y1 - 34, 1]], { w: 3, alpha: 0.75, dry: 0.45, seed: Math.floor(R() * 1e6), taper: [0, 0], tip: 1 });
  stroke(g, [[x, y0 - 18, 1], [x + 112, y1 - 18, 1]], { w: 1.8, alpha: 0.55, dry: 0.6, seed: Math.floor(R() * 1e6), taper: [0, 0], tip: 1 });
  stroke(g, [[x, y0 + 2, 1], [x, y0 - 40, 1]], { w: 4.2, alpha: 0.9, dry: 0.35, seed: Math.floor(R() * 1e6), taper: [0, 0.05], tip: 0.9 });
  g.save(); g.globalAlpha = 0.85; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y0 - 43, 3.6, 3, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(x - 1.5, y0 - 45); g.quadraticCurveTo(x, y0 - 52, x + 1.5, y0 - 45); g.fill(); g.restore();
  // piers and water below
  if (!first && !last && (Math.round(x / 110) % 3 === 0)) { stroke(g, [[x + 50, y0 + 14, 1], [x + 50, y0 + 120, 0.6]], { w: 8, alpha: 0.45, dry: 0.6, seed: Math.floor(R() * 1e6), taper: [0, 0.5] }); }
  for (let i = 0; i < 3; i++) { const yy = y0 + 70 + R() * 90, xx = x + R() * 100; stroke(g, [[xx, yy, 0.3], [xx + 30 + R() * 40, yy, 1], [xx + 70 + R() * 30, yy + 1, 0.2]], { w: 1.4, alpha: 0.25, dry: 0.8, seed: Math.floor(R() * 1e6) }); }
}
// [inkfx ground] one 120-unit piece of the play band. Seam-free by construction: fills cover exactly [x0, x1) and follow the
// ground line (no per-piece gradients), every height is a pure function of x, so neighbouring pieces and tiles meet exactly.
const jit = (x, ch) => (noise1(x * 0.37, ch * 7 + 1) - 0.5) * 1.2;
function lineAt(gy, ch, x0, x1, dy, step = 6) { const P = []; for (let x = x0; x <= x1 + 0.01; x += step) P.push([x, gy(x) + dy + jit(x + dy * 13, ch), 1]); return P; }
// a soft wash hanging below a line: stacked thin bands so the falloff follows the ground, no hard lower edge
function hangWash(g, P, depth, col, a, bands = 7) {
  for (let k = 1; k <= bands; k++) {
    const d = depth * Math.pow(k / bands, 1.6); g.globalAlpha = a / bands; g.fillStyle = col; g.beginPath();
    g.moveTo(P[0][0], P[0][1]); for (const q of P) g.lineTo(q[0], q[1]); for (let i = P.length - 1; i >= 0; i--) g.lineTo(P[i][0], P[i][1] + d); g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
}
// a bank: one wet-edged stroke whose weight swells and thins with x and breaks in a few places
function bankStroke(g, gy, ch, x0, x1, dy, w, a, sd) {
  // taper only where the bank really breaks, never at a piece boundary
  let run = null, open0 = false;
  const flush = (open1) => { if (run && run.length > 1) stroke(g, run, { w, alpha: a, dry: 0.42, seed: sd + Math.floor(run[0][0]), taper: [open0 ? 0 : 0.15, open1 ? 0 : 0.15], tip: open0 && open1 ? 1 : 0.3, step: 2, edge: 0.75 }); run = null; };
  for (let x = x0 - 2; x <= x1 + 2.01; x += 6) {
    const gap = noise1(x * 0.011, sd) < 0.2; if (gap) { flush(false); continue; }
    if (!run) { run = []; open0 = x < x0; }
    const p = 0.45 + 0.75 * noise1(x * 0.02, sd + 3); run.push([x, gy(x) + dy + jit(x + dy * 13, ch), p]);
  }
  flush(true);
}
function groundPiece(g, R, ch, x0, x1, gy) {
  const C = CHAPTERS[ch], key = C.key, x1f = x0 + 120;
  const P = lineAt(gy, ch, x0, x1f, 0);
  // paper below the line: what is behind the path must not show under it
  g.fillStyle = C.paper; g.beginPath(); g.moveTo(P[0][0], P[0][1] + 1); for (const q of P) g.lineTo(q[0], q[1] + 1); g.lineTo(x1f, P[P.length - 1][1] + 700); g.lineTo(x0, P[0][1] + 700); g.closePath(); g.fill();
  const sd = 9000 + ch * 101;
  if (key === 'snow') {
    // snow is the paper itself; a blue-grey shadow wash gives it form, the edge a dry grey line
    hangWash(g, P, 46, C.accent, 0.22, 6);
    bankStroke(g, gy, ch, x0, x1f, 0, 2, 0.42, sd);
    return;
  }
  if (key === 'terraces') {
    // the path: worn earth, a wet-edged bank stroke, a few dry drags of the brush
    hangWash(g, P, 26, '#6b4f2a', 0.2, 6);
    bankStroke(g, gy, ch, x0, x1f, 0, 4.4, 0.85, sd);
    if (R() < 0.6) { const xx = x0 + R() * 90, yy = gy(xx) + 8 + R() * 10; stroke(g, [[xx, yy, 0.2], [xx + 14 + R() * 20, yy + 0.6, 0.9], [xx + 30 + R() * 22, yy + 1, 0.1]], { w: 1.6, alpha: 0.28, dry: 0.85, seed: Math.floor(R() * 1e6), edge: 0, bristles: 5, color: '#4a3b28' }); }
    // two paddies below: pale water (the paper, faintly holding the sky), a dark wet bank above each
    for (const [off, deep] of [[30, 0], [96, 1]]) {
      const W0 = lineAt(gy, ch, x0, x1f, off);
      hangWash(g, W0, 44, C.accent, 0.12 - deep * 0.03, 5);
      hangWash(g, W0, 10, '#5a4428', 0.16, 4); // the wet earth just under the bank
      bankStroke(g, gy, ch, x0, x1f, off, 2.6 - deep * 0.6, 0.62 - deep * 0.1, sd + 17 + deep * 31);
      // ripples: one or two horizontal dry drags per piece at most, never on a grid
      const nr = R() < 0.55 ? 1 : R() < 0.5 ? 2 : 0;
      for (let i = 0; i < nr; i++) { const xx = x0 + R() * 100, yy = gy(xx) + off + 12 + R() * 28, L = 18 + R() * 46; stroke(g, [[xx, yy, 0.15], [xx + L * 0.45, yy + 0.4, 0.8], [xx + L, yy + 0.2, 0.1]], { w: 1.1, alpha: 0.22 + R() * 0.12, dry: 0.85, seed: Math.floor(R() * 1e6), edge: 0, bristles: 4 }); }
      // rice stalks: thin single verticals with a faint broken reflection under the water line
      const ns = R() < 0.55 ? 0 : 1 + Math.floor(R() * 2);
      for (let i = 0; i < ns; i++) {
        const xx = x0 + R() * 110, yy = gy(xx) + off + 6 + R() * 18, n = 1 + Math.floor(R() * 3);
        for (let k = 0; k < n; k++) { const bx = xx + (k - n / 2) * (2.5 + R() * 4), h = 5 + R() * 12 - deep * 2, lean = (R() - 0.5) * 0.7;
          stroke(g, [[bx, yy, 1], [bx + lean * h * 0.4, yy - h * 0.55, 0.7], [bx + lean * h, yy - h * 0.95, 0.06]], { w: 0.95 + R() * 0.4, alpha: 0.4 + R() * 0.3, dry: 0.3, seed: Math.floor(R() * 1e6), edge: 0, taper: [0, 0.85], tip: 0.05 });
          stroke(g, [[bx, yy + 1.5, 0.6], [bx - lean * h * 0.3, yy + 1.5 + h * 0.4, 0.1]], { w: 0.9, alpha: 0.16, dry: 0.7, seed: Math.floor(R() * 1e6), edge: 0, bristles: 3 }); }
      }
    }
    return;
  }
  const wa = key === 'castle' ? 0.06 : 0.15;
  if (key === 'castle') { const bx = (C.ev.find((e) => e.t === 'boss') || { x: 1e9 }).x; if (x0 > bx - 1550 && x0 < bx + 950) { const n = 10 + Math.floor(R() * 14); for (let i = 0; i < n; i++) { const x = x0 + R() * 120, y = gy(x) + 1 + R() * R() * 26; const pk = R() < 0.25 ? mix(C.accent, INK, 0.2) : mix(C.accent, '#ffffff', 0.35); g.globalAlpha = 0.35 + R() * 0.35; g.fillStyle = pk; g.beginPath(); g.ellipse(x, y, 1.6 + R() * 1.4, 0.8 + R() * 0.5, (R() - 0.5) * 0.8, 0, 6.2832); g.fill(); } g.globalAlpha = 1; } } // [inkfx petals] the fallen carpet
  hangWash(g, P, 150, INK, wa, 8);
  bankStroke(g, gy, ch, x0, x1f, 0, key === 'stone' ? 3.2 : 4.2, 0.85, sd);
  // a fainter second edge gives the stone path depth (broken, not a ruled line)
  if (key === 'stone') bankStroke(g, gy, ch, x0, x1f, 15, 1.8, 0.22, sd + 77);
  if (key === 'stone') {
    // steps: short verticals where the path climbs
    for (let x = x0; x < x1f; x += 18) { const y = gy(x), y2 = gy(x + 18); if (y - y2 > 1.2) { stroke(g, [[x + 18, y2, 1], [x + 18, y + 1, 1]], { w: 1.6, alpha: 0.6, dry: 0.5, seed: Math.floor(R() * 1e6), taper: [0, 0], tip: 1 }); } }
  }
  if (key === 'grass') {
    // a few pebbles, now and then a stone; the grass itself is the painted clumps in the prop layer
    for (let i = 0; i < 2; i++) if (R() < 0.6) { const x = x0 + R() * 120; drop(g, x, gy(x) + 2 + R() * 4, 0.8 + R() * 1.2, INK, 0.55); }
    if (R() < 0.18) { const x = x0 + R() * 120; rock(g, R, x, gy(x) + 4, 18 + R() * 16, 7 + R() * 6, { a: 0.7 }); }
  }
}

// ---------- the duel sky: a staged mood for boss fights ----------
// each chapter keeps its own note inside the red (disc ring, horizon hue, how the snow turns rose)
export const REDP = {
  bamboo: { top: '#3d0b0a', mid: '#8e1d14', hor: '#cf4a26', disc: '#f1e4cf', ring: '#a9c584', ink: '#120605', glow: '#b8381f', ground: '#3a120d', part: '#9fc27a' },
  terraces: { top: '#4a120a', mid: '#a3301a', hor: '#e0782f', disc: '#f6e2b8', ring: '#e8b54e', ink: '#160806', glow: '#c75a24', ground: '#3d160b', part: '#f0b050' },
  torii: { top: '#34070a', mid: '#8a1414', hor: '#c8321f', disc: '#efe1d2', ring: '#f06a48', ink: '#100405', glow: '#a82818', ground: '#36100c', part: '#f07048' },
  snow: { top: '#2c0f18', mid: '#7a2a3a', hor: '#c06478', disc: '#f2e6ea', ring: '#9cbbe0', ink: '#12070b', glow: '#b25a6c', ground: '#c98f9c', part: '#f6d3da' },
  castle: { top: '#3e0c06', mid: '#9b2a10', hor: '#e0601f', disc: '#f6e0c8', ring: '#eba0b2', ink: '#140604', glow: '#c4481a', ground: '#3a120a', part: '#f4a8b8' },
};
export function paintRedSky(W, H, k, key) {
  const P = REDP[key], c = makeCanvas(W, H), g = c.getContext('2d'), R = rng(77 + key.length);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, P.top); gr.addColorStop(0.45, P.mid); gr.addColorStop(0.78, P.hor); gr.addColorStop(1, P.mid);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // the wash is uneven: darker ink bleeds up from the horizon in soft blooms, paler pools where the brush lifted
  for (let i = 0; i < 26; i++) { const x = R() * W, y = H * (0.35 + R() * 0.5), r = Math.max(W, H) * (0.05 + R() * 0.14); const rg = g.createRadialGradient(x, y, 0, x, y, r); const dark = R() < 0.6; rg.addColorStop(0, dark ? 'rgba(20,4,3,0.22)' : 'rgba(255,220,190,0.12)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 7; i++) { const y = H * (0.5 + R() * 0.35), x = R() * W * 0.7, L = W * (0.2 + R() * 0.4); stroke(g, [[x, y, 0.2], [x + L * 0.5, y - 3 * k, 1], [x + L, y + 2 * k, 0.2]], { w: (6 + R() * 10) * k, alpha: 0.18, dry: 0.8, seed: Math.floor(R() * 1e6), color: '#1a0504', taper: [0.3, 0.4], bristles: 16 }); }
  return c;
}
