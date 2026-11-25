// NEON KUMITE · design metrics, computed in a browser from the real rig code. Driven by tools/measure.cjs.
import { drawFighter, drawSilhouette, solve, LOOKS, FACES, stillChains, METRICS } from '../rig.js';
import { BASE, MV } from '../anim.js';
import { FIGHTERS, ROSTER } from '../data.js';
import { STAGES, createStage, drawBack, drawFloor } from '../stages.js';
import { cameraScale } from '../render.js';

const S = 2; // px per world unit for the offscreen masks
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// render a pose as a solid mask; returns { data, w, h, bbox }
function mask(id, pose, chains) {
  const w = 700, h = 700; const c = canvas(w, h); const g = c.getContext('2d');
  g.setTransform(S, 0, 0, -S, w / 2, h - 40);
  drawSilhouette(g, id, pose, '#000', chains);
  const d = g.getImageData(0, 0, w, h).data; const m = new Uint8Array(w * h);
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 128) { m[i] = 1; const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { m, w, h, bbox: [x0, y0, x1, y1] };
}
const heightU = (M) => (M.bbox[3] - M.bbox[1]) / S;
function diffFrac(A, B) { let x = 0, u = 0; for (let i = 0; i < A.m.length; i++) { const a = A.m[i], b = B.m[i]; if (a || b) u++; if (a !== b) x++; } return x / Math.max(1, u); }
// normalise a mask to a 160-px-tall box anchored at the feet centre, for cast comparisons
function norm(M) {
  const [x0, y0, x1, y1] = M.bbox; const hh = y1 - y0; const N = 160, W = 200; const out = new Uint8Array(W * N);
  const cx = (x0 + x1) / 2; const k = hh / N;
  for (let y = 0; y < N; y++) for (let x = 0; x < W; x++) { const sx = Math.round(cx + (x - W / 2) * k), sy = Math.round(y0 + y * k); if (sx >= 0 && sx < M.w && sy >= 0 && sy < M.h && M.m[sy * M.w + sx]) out[y * W + x] = 1; }
  return out;
}
function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] && b[k]) i++; if (a[k] || b[k]) u++; } return i / Math.max(1, u); }
// solid run through the spine at shoulder height
function shoulderWidth(M, J, scale) {
  const y = Math.round(M.h - 40 - J.shN[1] * S); const sx = Math.round(M.w / 2 + ((J.shN[0] + J.shF[0]) / 2) * S);
  let a = sx, b = sx; while (a > 0 && M.m[y * M.w + a - 1]) a--; while (b < M.w - 1 && M.m[y * M.w + b + 1]) b++;
  return (b - a) / S;
}
function lum(r, g, b) { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function fighterLum(id, rim, light) {
  const w = 500, h = 500; const c = canvas(w, h); const g = c.getContext('2d');
  g.setTransform(S, 0, 0, -S, w / 2, h - 40);
  drawFighter(g, id, BASE[id].stance, { lw: 2.6, light, rim, rimDir: -1, state: 'idle', chains: stillChains(id, BASE[id].stance) });
  const d = g.getImageData(0, 0, w, h).data; let s = 0, n = 0;
  for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 200) { s += lum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); n++; }
  return s / Math.max(1, n);
}
function stageLum(sid) {
  const w = 960, h = 540; const c = canvas(w, h); const g = c.getContext('2d');
  const st = createStage(sid, 1); const cam = { x: 550, scale: 1.5, W: w, H: h, gy: h * 0.86, t: 3 };
  drawBack(g, st, cam); drawFloor(g, st, cam);
  const d = g.getImageData(260, 160, 440, 300).data; let s = 0, n = 0; // the band behind the fighters
  for (let i = 0; i < d.length; i += 4) { s += lum(d[i], d[i + 1], d[i + 2]); n++; }
  return s / n;
}
function faceDistinct(id) {
  // render the head alone per expression and count how many differ visibly from all the others
  const keys = ['idle', 'atk', 'hit', 'block', 'win', 'lose', 'ko', 'held'];
  const imgs = keys.map((k) => {
    const c = canvas(160, 160); const g = c.getContext('2d'); const L = LOOKS[id]; const J = solve(L, BASE[id].stance);
    g.setTransform(4, 0, 0, -4, 80 - J.head[0] * 4, 80 + J.head[1] * 4);
    drawFighter(g, id, BASE[id].stance, { lw: 2.6, face: FACES[k], rimA: 0, flat: true });
    return g.getImageData(0, 0, 160, 160).data;
  });
  const distinct = [];
  imgs.forEach((a, i) => { const isNew = distinct.every((j) => { let dpx = 0; const b = imgs[j]; for (let q = 0; q < a.length; q += 4) if (Math.abs(a[q] - b[q]) + Math.abs(a[q + 1] - b[q + 1]) + Math.abs(a[q + 2] - b[q + 2]) > 60) dpx++; return dpx > 40; }); if (isNew) distinct.push(i); });
  return distinct.map((i) => keys[i]);
}

window.measure = () => {
  const cam = { desk: cameraScale(960, 540, false, false), land: cameraScale(750, 342, false, true), landH: 342 };
  const out = { fighters: {}, cast: {}, stages: {} };
  const idleN = {};
  for (const id of ROSTER) {
    const ch = FIGHTERS[id], L = LOOKS[id], P0 = BASE[id].stance;
    const M = mask(id, P0, stillChains(id, P0)); const H = heightU(M); const J = solve(L, P0);
    const geo = METRICS(id); // widths of the drawn limb shapes and head/face geometry, in local units
    const r = {};
    r.heightU = H;
    r.screenDesk = (H * ch.scale * cam.desk) / 540;
    r.screenLand = (H * ch.scale * cam.land) / cam.landH;
    r.forearmMin = geo.forearmMin / H; r.shinMin = geo.shinMin / H; r.thighMin = geo.thighMin / H; r.upperArmMin = geo.upperArmMin / H;
    r.shoulders = shoulderWidth(M, J) / H;
    r.head = geo.headH / H;
    const px = ch.scale * cam.desk; // CSS px per local unit in a desktop fight
    r.browPx = geo.browH * px; r.eyePx = geo.eyeH * px; r.mouthPx = geo.mouthH * px;
    r.outlinePx = geo.outline * px; r.innerPx = geo.inner * px;
    r.outlinePxLand = geo.outline * ch.scale * cam.land; r.innerPxLand = geo.inner * ch.scale * cam.land;
    r.lum = fighterLum(id, '#ff9a3c', [0.5, 0.85]);
    r.faces = faceDistinct(id);
    // poses: startup (anticipation), active (strike), recovery (follow-through) for every attack
    const moves = {};
    const idleM = M;
    for (const k of Object.keys(MV[id])) {
      const A = MV[id][k]; if (!A || !A.a || !A.s) continue;
      const ma = mask(id, A.a), ms = mask(id, A.s), mf = A.f ? mask(id, A.f) : null;
      const d = { sIdle: diffFrac(ms, idleM), aIdle: diffFrac(ma, idleM), as: diffFrac(ma, ms), fs: mf ? diffFrac(mf, ms) : null, fIdle: mf ? diffFrac(mf, idleM) : null };
      const limb = A.s.strike; let tip = null;
      if (limb) { const ja = solve(L, A.a), js = solve(L, A.s); const key = { hn: 'haN', hf: 'haF', fn: 'ftN', ff: 'ftF' }[limb]; tip = Math.hypot(js[key][0] - ja[key][0], js[key][1] - ja[key][1]) / H; }
      d.tip = tip; d.limb = limb || null;
      moves[k] = d;
    }
    r.moves = moves;
    out.fighters[id] = r;
    idleN[id] = norm(M);
  }
  for (let i = 0; i < ROSTER.length; i++) for (let j = i + 1; j < ROSTER.length; j++) out.cast[ROSTER[i] + '/' + ROSTER[j]] = iou(idleN[ROSTER[i]], idleN[ROSTER[j]]);
  for (const sid of Object.keys(STAGES)) out.stages[sid] = stageLum(sid);
  return out;
};
window.ready = true;
