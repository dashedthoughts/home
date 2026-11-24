// KAZE brush engine: ink on paper with Canvas 2D. Everything here is deterministic given a seed.
// Strokes are resampled along a Catmull-Rom spline, given a pressure/taper profile, then built from
// a soft body (wet ink), a darker pooled edge, and bristle streaks that run dry as ink load falls.
export const INK = '#17130f';

export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash = (n, s = 0) => { let h = Math.imul((n | 0) ^ (s * 0x27d4eb2d), 0x9E3779B1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
// 1D value noise and fbm (smooth, seeded): used for ridges, terraces and wobble.
export function noise1(x, s = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
export function fbm(x, s = 0, oct = 4) { let v = 0, a = 0.5, fr = 1, n = 0; for (let o = 0; o < oct; o++) { v += noise1(x * fr, s + o * 17) * a; n += a; a *= 0.5; fr *= 2.03; } return v / n; }
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

export function makeCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c;
}
export function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function mix(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// Resample control points [x, y, p] along a Catmull-Rom spline at a fixed arc step.
const SBUF = [];
function sample(pts, step) {
  SBUF.length = 0;
  const n = pts.length; if (n < 2) return SBUF;
  let s = 0, px = pts[0][0], py = pts[0][1];
  SBUF.push({ x: px, y: py, p: pts[0][2] ?? 1, s: 0 });
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]); const m = Math.max(2, Math.ceil(segLen / step));
    for (let j = 1; j <= m; j++) {
      const t = j / m, t2 = t * t, t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      s += Math.hypot(x - px, y - py); px = x; py = y;
      SBUF.push({ x, y, p: lerp(p1[2] ?? 1, p2[2] ?? 1, t), s });
    }
  }
  const N = SBUF.length;
  for (let i = 0; i < N; i++) {
    const a = SBUF[Math.max(0, i - 1)], b = SBUF[Math.min(N - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; SBUF[i].nx = -dy / l; SBUF[i].ny = dx / l;
  }
  return SBUF;
}

// The main brush. o: { w, color, alpha, dry (0 wet .. 1 bone dry), taper [start, end] as length fractions,
// bristles, bleed (px blur), edge (pooled edge strength), seed, step, tip (min width fraction) }
export function stroke(g, pts, o = {}) {
  const S = sample(pts, o.step ?? 1.6); const n = S.length; if (n < 2) return;
  const R = rng(o.seed ?? 7), w = o.w ?? 6, col = o.color ?? INK, A = o.alpha ?? 0.9, dry = o.dry ?? 0.2;
  const L = S[n - 1].s || 1, t0 = o.taper ? o.taper[0] : 0.12, t1 = o.taper ? o.taper[1] : 0.4, tip = o.tip ?? 0.08;
  const W = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = S[i].s / L; const prof = Math.min(1, t0 > 0 ? Math.sqrt(smooth(0, t0, t)) : 1) * (t1 > 0 ? 1 - smooth(1 - t1, 1, t) * (1 - tip) : 1);
    W[i] = w * S[i].p * Math.max(tip, prof) * (1 + (noise1(S[i].s * 0.05, o.seed ?? 3) - 0.5) * 0.25);
  }
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // body: a soft ribbon of wet ink (thinner as the brush dries)
  if (dry < 0.85) {
    g.beginPath();
    for (let i = 0; i < n; i++) { const q = S[i], h = W[i] * 0.5 * (1 - dry * 0.35); i ? g.lineTo(q.x + q.nx * h, q.y + q.ny * h) : g.moveTo(q.x + q.nx * h, q.y + q.ny * h); }
    for (let i = n - 1; i >= 0; i--) { const q = S[i], h = W[i] * 0.5 * (1 - dry * 0.35); g.lineTo(q.x - q.nx * h, q.y - q.ny * h); }
    g.closePath();
    g.fillStyle = col;
    if (o.bleed) { g.shadowColor = rgba(col.length === 7 ? col : INK, 0.5 * A); g.shadowBlur = o.bleed; }
    g.globalAlpha = A * (0.62 - dry * 0.45); g.fill();
    g.shadowBlur = 0;
    // pooled edge: wet ink dries darker at its rim
    if ((o.edge ?? 0.5) > 0) { g.globalAlpha = A * (o.edge ?? 0.5) * 0.55; g.strokeStyle = col; g.lineWidth = Math.max(0.6, w * 0.07); g.stroke(); }
  }
  // bristles: streaks that break where the ink load runs out
  const K = o.bristles ?? Math.max(3, Math.min(24, Math.round(w * 0.9)));
  g.strokeStyle = col; g.globalAlpha = A * (0.32 + dry * 0.5);
  for (let k = 0; k < K; k++) {
    const off = ((k + 0.5) / K) * 2 - 1 + (R() - 0.5) * 0.25;
    let load = 1 - R() * dry * 0.6; const rate = dry * (0.6 + R() * 1.4) / L;
    const bw = Math.max(0.5, (w / K) * (1.1 + R() * 0.8));
    g.lineWidth = bw; g.beginPath(); let on = false;
    for (let i = 0; i < n; i += 2) {
      const q = S[i]; load -= rate * (i ? S[i].s - S[i - 2 < 0 ? 0 : i - 2].s : 0);
      const gap = load + (noise1(q.s * 0.12 + k * 13.1, (o.seed ?? 1) + k) - 0.5) * 0.9 * dry < 0.35;
      if (Math.abs(off) * W[i] * 0.5 > W[i] * 0.5 || gap) { on = false; continue; }
      const h = off * W[i] * 0.5, x = q.x + q.nx * h, y = q.y + q.ny * h;
      if (!on) { g.moveTo(x, y); on = true; } else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}

// A quick tapered ribbon for things drawn every frame (figures, arcs, grass). No bristles.
// pts: flat array [x0,y0,x1,y1,...], widths: Float32Array or function(t)->w.
export function ribbon(g, pts, wfn, col, a, edge = 0) {
  const n = pts.length >> 1; if (n < 2) return;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const ax = pts[Math.max(0, i - 1) * 2], ay = pts[Math.max(0, i - 1) * 2 + 1], bx = pts[Math.min(n - 1, i + 1) * 2], by = pts[Math.min(n - 1, i + 1) * 2 + 1];
    const l = Math.hypot(bx - ax, by - ay) || 1, h = wfn(i / (n - 1)) * 0.5;
    const x = pts[i * 2] - ((by - ay) / l) * h, y = pts[i * 2 + 1] + ((bx - ax) / l) * h; i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  for (let i = n - 1; i >= 0; i--) {
    const ax = pts[Math.max(0, i - 1) * 2], ay = pts[Math.max(0, i - 1) * 2 + 1], bx = pts[Math.min(n - 1, i + 1) * 2], by = pts[Math.min(n - 1, i + 1) * 2 + 1];
    const l = Math.hypot(bx - ax, by - ay) || 1, h = wfn(i / (n - 1)) * 0.5;
    g.lineTo(pts[i * 2] + ((by - ay) / l) * h, pts[i * 2 + 1] - ((bx - ax) / l) * h);
  }
  g.closePath(); g.globalAlpha = a; g.fillStyle = col; g.fill();
  if (edge) { g.globalAlpha = a * edge; g.strokeStyle = col; g.lineWidth = 0.8; g.stroke(); }
}

// Bamboo-leaf / pine-needle dab: a tapered blade from (x,y) along angle.
export function leaf(g, x, y, ang, len, w, col, a, bend = 0.15) {
  const c = Math.cos(ang), s = Math.sin(ang), px = -s, py = c;
  const mx = x + c * len * 0.42 + px * len * bend, my = y + s * len * 0.42 + py * len * bend;
  const ex = x + c * len + px * len * bend * 0.4, ey = y + s * len + py * len * bend * 0.4;
  g.beginPath(); g.moveTo(x, y);
  g.quadraticCurveTo(mx + px * w, my + py * w, ex, ey);
  g.quadraticCurveTo(mx - px * w * 0.7, my - py * w * 0.7, x, y);
  g.globalAlpha = a; g.fillStyle = col; g.fill();
}

// Ink drop with a darker rim (wet edge), for splashes.
export function drop(g, x, y, r, col, a) {
  g.globalAlpha = a * 0.75; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  if (r > 2) { g.globalAlpha = a * 0.5; g.strokeStyle = col; g.lineWidth = Math.max(0.6, r * 0.22); g.stroke(); }
}

// Soft wash: a blurred, low-alpha fill whose path is supplied by fn(g). Pools a darker band along its top.
export function wash(g, fn, col, a, blur = 0) {
  g.save(); g.fillStyle = col; g.globalAlpha = a;
  if (blur) { g.shadowColor = col; g.shadowBlur = blur; }
  g.beginPath(); fn(g); g.fill(); g.restore();
}

// Paper: warm base with low-frequency mottling, plus a separate multiply layer of grain, fibres and vignette.
export function makePaper(w, h, base, seed = 1) {
  const R = rng(seed);
  const c = makeCanvas(w, h), g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  // mottling: two octaves of upscaled noise
  for (const [cell, a] of [[Math.max(w, h) / 9, 0.06], [Math.max(w, h) / 40, 0.05]]) {
    const cw = Math.ceil(w / cell) + 2, ch = Math.ceil(h / cell) + 2, m = makeCanvas(cw, ch), mg = m.getContext('2d'), id = mg.createImageData(cw, ch);
    for (let i = 0; i < cw * ch; i++) { const v = R(); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v > 0.5 ? 255 : 60; id.data[i * 4 + 3] = Math.abs(v - 0.5) * 2 * 255; }
    mg.putImageData(id, 0, 0); g.globalAlpha = a; g.imageSmoothingEnabled = true; g.drawImage(m, -cell, -cell, cw * cell, ch * cell);
  }
  g.globalAlpha = 1;
  return c;
}
export function makeGrain(w, h, seed = 2, vignette = 0.22, warm = '#5a4630') {
  const R = rng(seed), c = makeCanvas(w, h), g = c.getContext('2d');
  // fine grain tile (multiply: white is neutral)
  const T = 256, t = makeCanvas(T, T), tg = t.getContext('2d'), id = tg.createImageData(T, T);
  for (let i = 0; i < T * T; i++) { const v = 255 - Math.pow(R(), 6) * 34 - R() * 5; id.data[i * 4] = v; id.data[i * 4 + 1] = v - 2; id.data[i * 4 + 2] = v - 6; id.data[i * 4 + 3] = 255; }
  tg.putImageData(id, 0, 0);
  g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, w, h);
  // fibres: short curved threads, mostly darker, some lighter
  const nf = Math.round((w * h) / 1800);
  g.lineCap = 'round';
  for (let i = 0; i < nf; i++) {
    const x = R() * w, y = R() * h, a = R() * Math.PI, l = 6 + R() * 26, cv = (R() - 0.5) * 10;
    g.strokeStyle = R() < 0.8 ? 'rgba(120,96,64,' + (0.05 + R() * 0.09) + ')' : 'rgba(255,255,255,0.5)';
    g.lineWidth = 0.4 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 - Math.sin(a) * cv, y + Math.sin(a) * l * 0.5 + Math.cos(a) * cv, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // a few soft stains (old paper)
  for (let i = 0; i < 6; i++) {
    const x = R() * w, y = R() * h, r = (0.08 + R() * 0.2) * Math.max(w, h), gr = g.createRadialGradient(x, y, r * 0.2, x, y, r);
    gr.addColorStop(0, 'rgba(200,170,120,0.07)'); gr.addColorStop(1, 'rgba(200,170,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  // vignette: scroll edges darken
  const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, rgba(warm, vignette)); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  return c;
}
