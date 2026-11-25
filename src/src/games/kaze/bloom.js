// KAZE ink blooms: wet-on-wet ink blossoming into damp paper. A few bloom shapes are painted once (cauliflower edges,
// a darker rim where the pigment pooled as the water front stopped, granulation just inside the rim) and reused,
// tinted, scaled and faded, for chapter openings and closings, important moments, slow sky blooms and breathing mist.
import { rng, makeCanvas, rgba } from './brush.js';

const SZ = 384, N_SHAPES = 4;
let kit = null;

function contour(R, size) {
  const a = [R() * 6.3, R() * 6.3, R() * 6.3, R() * 6.3], r0 = size * 0.4, pts = [];
  const lobes = Array.from({ length: 9 }, () => ({ th: R() * 6.2832, w: 0.12 + R() * 0.16, h: 0.05 + R() * 0.07 }));
  for (let i = 0; i < 180; i++) {
    const th = (i / 180) * 6.2832;
    let r = 1 + 0.1 * Math.sin(3 * th + a[0]) + 0.06 * Math.sin(5 * th + a[1]) + 0.035 * Math.sin(9 * th + a[2]) + 0.018 * Math.sin(19 * th + a[3]);
    for (const L of lobes) { let d = Math.abs(th - L.th); d = Math.min(d, 6.2832 - d); if (d < L.w) r += L.h * Math.cos((d / L.w) * Math.PI * 0.5); } // cauliflower back-runs
    pts.push([Math.cos(th) * r0 * r, Math.sin(th) * r0 * r]);
  }
  return pts;
}
function path(g, P, cx, cy, s = 1) { g.beginPath(); g.moveTo(cx + P[0][0] * s, cy + P[0][1] * s); for (const p of P) g.lineTo(cx + p[0] * s, cy + p[1] * s); g.closePath(); }
const blurOk = typeof document !== 'undefined' && 'filter' in (makeCanvas(1, 1).getContext('2d'));

function shape(seed) {
  const R = rng(seed), P = contour(R, SZ), c = SZ / 2;
  // body: white alpha, a soft wet falloff just inside the edge, uneven pigment inside
  const fill = makeCanvas(SZ, SZ), f = fill.getContext('2d');
  if (blurOk) f.filter = `blur(${SZ * 0.012}px)`;
  f.fillStyle = '#fff'; f.globalAlpha = 0.55; path(f, P, c, c, 0.98); f.fill();
  f.globalAlpha = 0.25; for (let k = 0; k < 5; k++) { path(f, P, c + (R() - 0.5) * SZ * 0.08, c + (R() - 0.5) * SZ * 0.08, 0.55 + R() * 0.35); f.fill(); }
  f.filter = 'none';
  // solid: the same contour, opaque, for cutting the paper away in openings
  const solid = makeCanvas(SZ, SZ), so = solid.getContext('2d'); if (blurOk) so.filter = `blur(${SZ * 0.008}px)`; so.fillStyle = '#fff'; path(so, P, c, c, 0.98); so.fill(); so.filter = 'none';
  // rim: where the water front stopped the pigment pooled: a fine dark line, a soft band inside it, granulation
  const rim = makeCanvas(SZ, SZ), q = rim.getContext('2d');
  if (blurOk) q.filter = `blur(${SZ * 0.01}px)`;
  q.strokeStyle = '#fff'; q.globalAlpha = 0.22; q.lineWidth = SZ * 0.035; path(q, P, c, c, 0.965); q.stroke();
  if (blurOk) q.filter = 'blur(0.6px)';
  q.globalAlpha = 0.7; q.lineWidth = SZ * 0.007; path(q, P, c, c, 0.985); q.stroke();
  q.filter = 'none'; q.fillStyle = '#fff';
  for (let i = 0; i < 700; i++) { const p = P[(R() * P.length) | 0], u = 0.82 + R() * 0.16; q.globalAlpha = 0.06 + R() * 0.16; q.beginPath(); q.arc(c + p[0] * u, c + p[1] * u, 0.4 + R() * 0.9, 0, 6.2832); q.fill(); }
  return { fill, rim, solid };
}
function tint(src, col) { const c = makeCanvas(src.width, src.height), g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return c; }

export function bloomKit() {
  if (kit || typeof document === 'undefined') return kit;
  const shapes = []; for (let i = 0; i < N_SHAPES; i++) shapes.push(shape(4100 + i * 77));
  const cache = new Map();
  kit = {
    shapes, SZ,
    // a tinted pair (wash body, rim) for shape i
    get(i, col) { const key = i + col; let v = cache.get(key); if (!v) { const s = shapes[i % N_SHAPES]; v = { fill: tint(s.fill, col), rim: tint(s.rim, col) }; cache.set(key, v); if (cache.size > 16) cache.delete(cache.keys().next().value); } return v; },
    // draw a bloom centred at (x, y) with radius r (pixels); body and rim alphas separate so it can dry (rim outlives the body)
    draw(g, i, col, x, y, r, aBody, aRim, rot = 0) {
      const v = this.get(i, col), s = (r * 2) / (SZ * 0.8);
      if (rot) { g.save(); g.translate(x, y); g.rotate(rot); x = 0; y = 0; }
      const w = SZ * s;
      if (aBody > 0.003) { g.globalAlpha = aBody; g.drawImage(v.fill, x - w / 2, y - w / 2, w, w); }
      if (aRim > 0.003) { g.globalAlpha = aRim; g.drawImage(v.rim, x - w / 2, y - w / 2, w, w); }
      if (rot) g.restore();
    },
    // an elliptical bloom (mist banks): rx, ry in pixels
    drawE(g, i, col, x, y, rx, ry, aBody, aRim) {
      const v = this.get(i, col), w = (rx * 2) / 0.8, h = (ry * 2) / 0.8;
      if (aBody > 0.003) { g.globalAlpha = aBody; g.drawImage(v.fill, x - w / 2, y - h / 2, w, h); }
      if (aRim > 0.003) { g.globalAlpha = aRim; g.drawImage(v.rim, x - w / 2, y - h / 2, w, h); }
    },
    // the paper mask for openings and closings: the scene shows through blooms that open from a few points.
    // Drawn at half resolution into `m` (re-used), then laid over the frame.
    reveal(g, m, W, H, paper, ink, p, pts) {
      // paper, then every bloom's pooled rim, then the holes cut slightly inside the rims: one wet front, dark at its edge
      const mw = m.width, mh = m.height, q = m.getContext('2d'), D = Math.hypot(mw, mh), ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.fillStyle = paper; q.fillRect(0, 0, mw, mh);
      for (const P of pts) { const u = Math.max(0, Math.min(1, (p - P.d) / (1 - P.d))); if (u <= 0) continue; const r = (0.04 + 0.96 * ease(u)) * D * P.s, w = (r * 2) / 0.8; const v = this.get(P.i, ink); q.globalAlpha = 0.6 * Math.min(1, u * 8) * (1 - u * 0.6); q.drawImage(v.rim, P.x * mw - w / 2, P.y * mh - w / 2, w, w); }
      q.globalCompositeOperation = 'destination-out';
      for (const P of pts) { const u = Math.max(0, Math.min(1, (p - P.d) / (1 - P.d))); if (u <= 0) continue; const r = (0.04 + 0.96 * ease(u)) * D * P.s * 0.955, w = (r * 2) / 0.8; const f0 = shapes[P.i % N_SHAPES].solid; q.globalAlpha = 1; q.drawImage(f0, P.x * mw - w / 2, P.y * mh - w / 2, w, w); }
      q.globalCompositeOperation = 'source-over';
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = Math.min(1, (1 - p) / 0.22); g.drawImage(m, 0, 0, W, H); g.globalAlpha = 1;
    },
  };
  return kit;
}
