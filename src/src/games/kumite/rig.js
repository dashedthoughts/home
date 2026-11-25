// NEON KUMITE · fighter drawing. Each body region is ONE designed shape (tapered limbs with real shoulders, elbows, knees;
// clothing as single masses), painted flat with one cel-shadow tone and a rim light from the stage, then inked twice:
// a heavy pass around the whole silhouette and a light pass inside. Faces are a few bold marks driven by an expression state.
// Local space: x forward, y up, origin between the feet. Poses give hand/foot targets; IK solves elbows and knees.
const D2R = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export const LOOKS = {
  // RIN: compact and springy. Courier cap with an amber clip visor, cropped hi-vis jacket, messenger bag, chunky sneakers.
  rin: {
    arm: [29, 28], leg: [42, 41], torso: 56, neck: 6, head: 11.8, chest: 34, waist: 19, hips: 24, hand: 1.24, foot: 28, armW: 1.0, legW: 1.0,
    skin: '#e6ad84', hair: '#16141c', main: '#c6ff24', mainD: '#6e9a10', dark: '#1c1d27', darkD: '#0e0f16', leg2: '#2c2f40', shoe: '#f3f1ea', shoeD: '#a8a6b6',
    accent: '#c6ff24', cap: '#22232d', visor: '#ffb21f', bag: '#2b2d38', glove: '#1b1c24', ink: '#0b0b10',
  },
  // GANJI: a broad wedge. Huge shoulders and chest, heavy forearms (one a hydraulic prosthetic), long canvas work coat, boots.
  ganji: {
    arm: [33, 33], leg: [41, 39], torso: 64, neck: 5, head: 12.4, chest: 56, waist: 30, hips: 32, hand: 1.5, foot: 31, armW: 1.5, legW: 1.4,
    skin: '#c78659', hair: '#221713', main: '#6e5b42', mainD: '#33291d', dark: '#3d3f4b', darkD: '#1c1d24', shoe: '#17171b', shoeD: '#0a0a0c',
    accent: '#ff5a1f', metal: '#9aa3b3', metalD: '#4f5666', shirt: '#e8e0cf', beard: '#2a1b14', ink: '#0b0b10',
  },
  // SUZU: long coat, long legs, sharp triangles. Triangular visor, high pointed collar, coat tails cut to points, drone.
  suzu: {
    arm: [30, 29], leg: [48, 47], torso: 56, neck: 6, head: 12.4, chest: 50, waist: 18, hips: 22, hand: 1.12, foot: 27, armW: 1.08, legW: 1.05,
    skin: '#f0c7a6', hair: '#26324f', main: '#2f5880', mainD: '#142c45', dark: '#56698a', darkD: '#222b38', shoe: '#0d1219', shoeD: '#05080c',
    accent: '#00f0ff', light: '#e4ecf2', lightD: '#93a4b3', ink: '#05080c',
  },
  // SAYO: narrow and flowing. Wide drop sleeves and a long scarf that trail the teleports, flared hakama trousers, high ponytail.
  sayo: {
    arm: [29, 28], leg: [46, 45], torso: 54, neck: 6, head: 11.9, chest: 30, waist: 16, hips: 21, hand: 1.15, foot: 26, armW: 1.03, legW: 1.0,
    skin: '#e9bb98', hair: '#110b15', main: '#5c1651', mainD: '#2c0928', dark: '#1a1020', darkD: '#0b060f', shoe: '#ece7f2', shoeD: '#a59cb5',
    accent: '#ff2bd6', wrap: '#e3dde6', sleeve: '#241630', sleeveD: '#110a18', ink: '#0b070d',
  },
};
const ALT = {
  rin: { main: '#ff8a1f', mainD: '#9a4a08', accent: '#ff8a1f', hair: '#e8e1d4', cap: '#f2efe6', visor: '#00d8ff' },
  ganji: { main: '#d9d2c2', mainD: '#8f897b', accent: '#00d8ff', shirt: '#1c1c22', metal: '#c9a64a', metalD: '#7d6420' },
  suzu: { main: '#3d1838', mainD: '#220b20', accent: '#ff2bd6', hair: '#d9d4e8' },
  sayo: { main: '#163f6e', mainD: '#0a2242', accent: '#00f0ff', hair: '#f0ece6', sleeve: '#1d2f4a', sleeveD: '#0c1626' },
};
const altCache = {};
export function sideColor(id, alt) { return alt ? ALT[id].accent : null; }
function altLook(id) { return altCache[id] || (altCache[id] = { ...LOOKS[id], ...ALT[id] }); }

// ---------------------------------------------------------------- skeleton
function ik(ax, ay, tx, ty, l1, l2, bend) {
  let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy) || 0.001;
  const max = (l1 + l2) * 0.999, min = Math.abs(l1 - l2) + 1;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) { dx *= min / d; dy *= min / d; d = min; }
  const a = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const g = a + bend * A;
  return [ax + Math.cos(g) * l1, ay + Math.sin(g) * l1, ax + dx, ay + dy];
}
export function solve(L, p) {
  const J = {};
  const lean = (p.lean || 0) * D2R;
  const hx = p.hip[0], hy = p.hip[1];
  const up = [Math.sin(lean), Math.cos(lean)], fw = [up[1], -up[0]];
  J.up = up; J.fw = fw;
  J.hip = [hx, hy];
  J.chest = [hx + up[0] * L.torso * 0.7, hy + up[1] * L.torso * 0.7];
  J.neck = [hx + up[0] * L.torso, hy + up[1] * L.torso];
  const ha = lean + (p.head || 0) * D2R; J.headA = ha;
  const hr = L.head;
  J.head = [J.neck[0] + Math.sin(ha) * (L.neck + hr * 0.95) + fw[0] * 2, J.neck[1] + Math.cos(ha) * (L.neck + hr * 0.95) + fw[1] * 2];
  // 3/4 view: the near shoulder sits forward of the spine, the far one behind it
  const sh = L.chest * 0.26;
  J.shN = [J.neck[0] - up[0] * 7 + fw[0] * sh, J.neck[1] - up[1] * 7 + fw[1] * sh];
  J.shF = [J.neck[0] - up[0] * 6 - fw[0] * sh * 0.8, J.neck[1] - up[1] * 6 - fw[1] * sh * 0.8];
  J.hpN = [hx + fw[0] * 4, hy + fw[1] * 4 - 3];
  J.hpF = [hx - fw[0] * 4, hy - fw[1] * 4 - 3];
  const st = p.str || 1;
  let r = ik(J.shN[0], J.shN[1], p.hn[0], p.hn[1], L.arm[0], L.arm[1] * (p.strike === 'hn' ? st : 1), -1); J.elN = [r[0], r[1]]; J.haN = [r[2], r[3]];
  r = ik(J.shF[0], J.shF[1], p.hf[0], p.hf[1], L.arm[0], L.arm[1] * (p.strike === 'hf' ? st : 1), -1); J.elF = [r[0], r[1]]; J.haF = [r[2], r[3]];
  r = ik(J.hpN[0], J.hpN[1], p.fn[0], p.fn[1] + 5, L.leg[0], L.leg[1] * (p.strike === 'fn' ? st : 1), p.kneeN || 1); J.knN = [r[0], r[1]]; J.ftN = [r[2], r[3]];
  r = ik(J.hpF[0], J.hpF[1], p.ff[0], p.ff[1] + 5, L.leg[0], L.leg[1] * (p.strike === 'ff' ? st : 1), p.kneeF || 1); J.knF = [r[0], r[1]]; J.ftF = [r[2], r[3]];
  return J;
}

// ---------------------------------------------------------------- shape builders (all return Path2D)
function curve(path, pts, closed, moveFirst = true) { // Catmull-Rom through points
  const n = pts.length; if (n < 2) return path;
  const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  if (moveFirst) path.moveTo(pts[0][0], pts[0][1]); else path.lineTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    path.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) path.closePath();
  return path;
}
// every closed shape is wound the same way, so a union of parts (silhouettes) fills solid under the nonzero rule
const blob = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return curve(new Path2D(), a < 0 ? pts.slice().reverse() : pts, true); };
// A two-segment limb A→B→C as ONE tapered outline. prof: [[t (0..2), wSideA, wSideB], ...]
function limb(A, B, C, prof, k = 1, endK = 1) {
  const seg = (t) => (t <= 1 ? [A, B, t] : [B, C, t - 1]);
  const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; };
  const nAB = nrm(A, B), nBC = nrm(B, C); let nB = [nAB[0] + nBC[0], nAB[1] + nBC[1]]; const nl = Math.hypot(nB[0], nB[1]) || 1; nB = [nB[0] / nl, nB[1] / nl];
  const Lp = [], Rp = [];
  for (const [t, wa, wb] of prof) {
    const [a, b, u] = seg(t); const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
    const n = t === 1 ? nB : t < 1 ? (u < 0.15 && t > 0 ? nB : nAB) : (u < 0.15 ? nB : nBC);
    const e = t > 1.5 ? 1 + (endK - 1) * (t - 1.5) * 2 : 1;
    Lp.push([x + n[0] * wa * k * e, y + n[1] * wa * k * e]); Rp.push([x - n[0] * wb * k * e, y - n[1] * wb * k * e]);
  }
  return blob(Lp.concat(Rp.reverse()));
}
const along = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// a tapered ribbon along a path (scarves, tails, ponytails, coat panels); pointed=true ends in a sharp tip
function ribbon(pts, w0, w1, pointed) {
  if (pts.length < 2) return null;
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; const k = i / (pts.length - 1);
    const w = (w0 + (w1 - w0) * k) * (pointed && i === pts.length - 1 ? 0.05 : 1);
    L.push([pts[i][0] - (dy / d) * w, pts[i][1] + (dx / d) * w]); R.push([pts[i][0] + (dy / d) * w, pts[i][1] - (dx / d) * w]);
  }
  return blob(L.concat(R.reverse()));
}

// ---------------------------------------------------------------- painting
let SIL = null, SILPATH = null, SILBASE = null, TINT = null, SPEED = 0; let LWO = 5, LWI = 1.6, LIGHT = [0.5, 0.85], RIM = '#00f0ff', RIMDIR = 1, RIMA = 0.9, FLAT = false, INK = '#0b0b10';
// part = { path, paint(ctx, lit) | col, shd, detail(ctx), noRim }
function paintPart(ctx, P) {
  const { path } = P; const k = P.sh || 4.5;
  const fillAs = (lit) => { if (P.paint) P.paint(ctx, lit); else { ctx.fillStyle = lit ? P.col : P.shd; ctx.fill(path); } };
  // cel shade: shadow tone (tinted by the stage), then the lit tone inside the shape shifted toward the light,
  // leaving one hard crescent of shadow on the side away from it
  const shade = () => {
    fillAs(false);
    if (TINT) { ctx.save(); ctx.globalAlpha *= 0.3; ctx.fillStyle = TINT; ctx.fill(path); ctx.restore(); }
    ctx.save(); ctx.translate(LIGHT[0] * k, LIGHT[1] * k); ctx.clip(path); ctx.translate(-LIGHT[0] * k, -LIGHT[1] * k); fillAs(true); ctx.restore();
  };
  ctx.save(); ctx.clip(path);
  if (FLAT) fillAs(true);
  else {
    shade();
    if (P.hl) { // one hard highlight band on the lit edge: highlight everywhere, then re-shade all but that band
      ctx.fillStyle = P.hl; ctx.fill(path);
      ctx.save(); ctx.translate(-LIGHT[0] * 2.2, -LIGHT[1] * 2.2); ctx.clip(path); ctx.translate(LIGHT[0] * 2.2, LIGHT[1] * 2.2); shade(); ctx.restore();
    }
  }
  if (P.detail) P.detail(ctx);
  // rim: a thin broken highlight on the edge facing the stage's key light, upper body and head only
  if (!FLAT && P.rim && RIMA > 0) { ctx.save(); ctx.translate(-LIGHT[0] * 2.2, -LIGHT[1] * 2.2); ctx.setLineDash([7, 5]); ctx.strokeStyle = RIM; ctx.globalAlpha *= RIMA * 0.6; ctx.lineWidth = 1.5; ctx.stroke(path); ctx.restore(); }
  ctx.restore();
}
function drawParts(ctx, parts) {
  // pass 1: the whole silhouette in ink, thick. Pass 2: each part painted, with a light inner line.
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (SIL) { const m = SILBASE.multiply(ctx.getTransform()); for (const P of parts) if (P && P.path) SILPATH.addPath(P.path, m); return; } // silhouettes collect one union path
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = LWO;
  for (const P of parts) { if (!P || !P.path) continue; ctx.fill(P.path); ctx.stroke(P.path); }
  for (const P of parts) {
    if (!P || !P.path) continue;
    paintPart(ctx, P);
    const ga = ctx.globalAlpha; ctx.strokeStyle = INK; ctx.lineWidth = P.lw || LWI; ctx.globalAlpha = ga * 0.9; ctx.stroke(P.path); ctx.globalAlpha = ga;
  }
}
// two-tone fill split across a line (sleeve / skin, shorts / leggings): fills col1 on the A side, col2 beyond the split
function splitPaint(path, S, dir, c1, s1, c2, s2) {
  return (ctx, lit) => {
    ctx.fillStyle = lit ? c1 : s1; ctx.fill(path);
    const nx = -dir[1], ny = dir[0];
    ctx.beginPath(); ctx.moveTo(S[0] + nx * 300, S[1] + ny * 300); ctx.lineTo(S[0] + nx * 300 + dir[0] * 400, S[1] + ny * 300 + dir[1] * 400); ctx.lineTo(S[0] - nx * 300 + dir[0] * 400, S[1] - ny * 300 + dir[1] * 400); ctx.lineTo(S[0] - nx * 300, S[1] - ny * 300); ctx.closePath();
    ctx.fillStyle = lit ? c2 : s2; ctx.fill();
  };
}
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
function line(ctx, pts, w, col, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.restore(); }

const shadeCache = {};
export function shadeOf(hex, k = 0.6, tint = [38, 18, 70]) {
  const key = hex + k; if (shadeCache[key]) return shadeCache[key];
  const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c, t) => Math.round(c * k + t * (1 - k) * 0.5);
  return (shadeCache[key] = `rgb(${m(r, tint[0])},${m(g, tint[1])},${m(b, tint[2])})`);
}
const farC = (c) => shadeOf(c, 0.7, [16, 8, 36]); // far-side limbs a clear step darker

// ---------------------------------------------------------------- limb profiles
const ARM = [[0, 9.4, 9.0], [0.22, 8.2, 7.8], [0.55, 7.4, 7.3], [0.82, 6.4, 6.0], [1, 5.4, 5.2], [1.22, 6.4, 6.0], [1.6, 5.2, 4.8], [2, 4.3, 4.2]];
const ARM_G = [[0, 8.6, 8.2], [0.25, 7.8, 7.6], [0.6, 7.4, 7.3], [1, 5.6, 5.4], [1.25, 6.8, 6.6], [1.6, 6.6, 6.4], [2, 5.2, 5.1]]; // heavy forearms
const LEG = [[0, 12, 11], [0.3, 11, 10.2], [0.75, 8.2, 7.6], [1, 7, 6.4], [1.15, 6.6, 7.4], [1.4, 5.8, 7.6], [1.75, 4.5, 4.8], [2, 4.2, 4.2]];
const LEG_BAGGY = [[0, 11, 10.5], [0.4, 10.5, 10], [1, 9.5, 9], [1.5, 9.4, 9.2], [1.9, 8.6, 8.4], [2, 8, 8]];
const HAKAMA = [[0, 11.5, 11], [0.5, 11.5, 11.5], [1, 12.5, 12.5], [1.5, 14, 14], [1.92, 15.5, 15.5], [2, 15, 15]];

// ---------------------------------------------------------------- hands and feet
function handPath(w, el, kind, sz) {
  const a = Math.atan2(w[1] - el[1], w[0] - el[0]);
  const T = (x, y) => [w[0] + (x * Math.cos(a) - y * Math.sin(a)) * sz, w[1] + (x * Math.sin(a) + y * Math.cos(a)) * sz];
  let pts;
  if (kind === 1) pts = [[-2, -6.5], [5, -8.2], [12, -7.6], [15, -3.5], [15, 4], [11.5, 8.2], [3, 8.6], [-2, 7]]; // fist
  else if (kind === 2) pts = [[-2, -5], [8, -5], [16, -3.5], [19, -0.5], [17, 2.5], [9, 4.5], [-2, 5]]; // blade
  else if (kind === 3) pts = [[-2, -6], [6, -8], [13, -7.5], [16, -4], [11, -1.5], [16, 1.5], [14, 6], [5, 8], [-2, 6]]; // grab claw
  else pts = [[-2, -6], [9, -6.5], [15, -4], [16, 0], [13, 4], [7, 7.5], [-2, 6]]; // open
  return { path: blob(pts.map(([x, y]) => T(x, y))), T };
}
function footPath(kn, an, L, toe, style) {
  const shin = Math.atan2(an[1] - kn[1], an[0] - kn[0]);
  let a = shin + Math.PI / 2; if (an[1] < 10) a = (toe || 0) * D2R; else a += (toe || 0) * D2R;
  const l = L.foot; const T = (x, y) => [an[0] + x * Math.cos(a) - y * Math.sin(a), an[1] + x * Math.sin(a) + y * Math.cos(a)];
  let pts;
  if (style === 'sneaker') pts = [[-8, -5], [-8, 5], [l * 0.35, 7], [l * 0.85, 4], [l + 2, -1], [l + 1, -5.5]];
  else if (style === 'boot') pts = [[-8, -5.5], [-8, 9], [l * 0.5, 8], [l * 0.9, 4], [l + 2, -1.5], [l + 1, -6]];
  else if (style === 'point') pts = [[-7, -5], [-6, 7], [l * 0.45, 5], [l + 4, -2], [l + 2, -5]];
  else pts = [[-7, -5], [-6, 5], [l * 0.55, 4.5], [l, 1], [l + 1, -4.5]]; // tabi
  return { path: blob(pts.map(([x, y]) => T(x, y))), T };
}

// ---------------------------------------------------------------- faces
// expression: { brow (-1 worried .. +1 angry), eye (0 shut .. 1.3 wide), mouth (0 shut .. 1 open), curve (-1 frown .. +1 grin), teeth }
const BROW_T = 0.48, BROW_K = 1.5, EYE_H = 0.31, MOUTH_H = 0.58;
const HEAD_TOP = { rin: 1.2, ganji: 1.08, suzu: 1.22, sayo: 1.22 };
export const FACES = {
  idle: { brow: 0.35, eye: 1, mouth: 0, curve: -0.15, teeth: 0 },
  atk: { brow: 1, eye: 0.85, mouth: 0.7, curve: -0.3, teeth: 1 },
  hit: { brow: -0.7, eye: 0.15, mouth: 0.85, curve: -0.7, teeth: 0 },
  block: { brow: 0.9, eye: 0.55, mouth: 0.25, curve: -0.6, teeth: 1 },
  win: { brow: 0.15, eye: 0.85, mouth: 0.4, curve: 0.9, teeth: 1 },
  lose: { brow: -0.8, eye: 0.35, mouth: 0.2, curve: -0.9, teeth: 0 },
  ko: { brow: -0.5, eye: 0, mouth: 0.45, curve: -0.6, teeth: 0 },
  held: { brow: -0.9, eye: 1.3, mouth: 0.75, curve: -0.5, teeth: 0 },
};
function face(ctx, L, id, r, F) {
  const ink = L.ink;
  const m = ctx.getTransform(); const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? Math.min(2, window.devicePixelRatio) : 1;
  if (r * Math.hypot(m.a, m.b) / dpr < 15) return faceBold(ctx, L, id, r, F); // small on screen: fewer, bolder marks
  // brows: thick wedges; angry = front ends dip toward the nose
  const brow = (x0, x1, y, w, k) => {
    const tilt = F.brow * r * 0.22 * BROW_K * k;
    const p = new Path2D(); p.moveTo(x0, y - tilt * 0.2); p.lineTo(x1, y - tilt); p.lineTo(x1 - 0.06 * r, y - tilt - w); p.lineTo(x0 + 0.02 * r, y - tilt * 0.2 + w * 1.1); p.closePath();
    ctx.fillStyle = id === 'ganji' ? L.beard : ink; ctx.fill(p);
  };
  const eye = (cx, cy, w, h, iris) => {
    const o = clamp(F.eye, 0, 1.3);
    if (o < 0.12) { line(ctx, [[cx - w, cy], [cx, cy - h * 0.25], [cx + w, cy]], r * 0.09, ink); return; }
    const e = new Path2D(); e.moveTo(cx - w, cy); e.quadraticCurveTo(cx, cy + h * o * 1.15, cx + w, cy + h * 0.1); e.quadraticCurveTo(cx, cy - h * o * 0.85, cx - w, cy); e.closePath();
    ctx.fillStyle = '#f7f3ea'; ctx.fill(e); ctx.save(); ctx.clip(e);
    ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(cx + w * 0.3, cy + h * 0.05, h * 0.75, 0, 7); ctx.fill();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(cx + w * 0.38, cy + h * 0.05, h * 0.38, 0, 7); ctx.fill();
    ctx.fillStyle = '#fffbea'; ctx.beginPath(); ctx.arc(cx + w * 0.5, cy + h * 0.32, h * 0.2, 0, 7); ctx.fill(); // catch light
    ctx.restore(); ctx.strokeStyle = ink; ctx.lineWidth = r * 0.075; ctx.stroke(e);
    line(ctx, [[cx - w * 1.05, cy + h * o * 0.55], [cx + w * 0.9, cy + h * o * 0.75]], r * 0.07, ink); // upper lid line
  };
  const mouth = (cx, cy, w) => {
    const op = clamp(F.mouth, 0, 1), cu = F.curve;
    if (op < 0.12) { line(ctx, [[cx - w, cy + cu * r * 0.06], [cx, cy - cu * r * 0.06], [cx + w * 0.8, cy + cu * r * 0.08]], r * 0.085, ink); return; }
    const m = new Path2D(); const h = r * MOUTH_H * op;
    m.moveTo(cx - w, cy + cu * r * 0.12); m.quadraticCurveTo(cx, cy + r * 0.06 - cu * r * 0.04, cx + w * 0.85, cy + cu * r * 0.14); m.quadraticCurveTo(cx + w * 0.1, cy - h - cu * r * 0.05, cx - w, cy + cu * r * 0.12); m.closePath();
    ctx.fillStyle = '#3a0d16'; ctx.fill(m);
    if (F.teeth) { ctx.save(); ctx.clip(m); ctx.fillStyle = '#f5f0e6'; ctx.fillRect(cx - w, cy - h * 0.25, w * 2, r * 0.3); ctx.restore(); }
    ctx.strokeStyle = ink; ctx.lineWidth = r * 0.08; ctx.stroke(m);
  };
  const irisC = { rin: '#6b3f1e', ganji: '#3a2a20', suzu: '#2a4d7a', sayo: '#7a1a66' }[id];
  // 3/4 view: far eye small near the nose line, near eye larger
  if (id !== 'suzu') {
    eye(r * 0.4, r * 0.08, r * 0.27, r * EYE_H, irisC);
    eye(r * 0.86, r * 0.1, r * 0.14, r * EYE_H * 0.78, irisC);
  }
  brow(r * 0.08, r * 0.68, r * 0.5, r * BROW_T, 1);
  brow(r * 0.76, r * 1.02, r * 0.52, r * BROW_T * 0.7, 0.85);
  // nose: a small wedge on the profile edge
  line(ctx, [[r * 0.98, r * 0.08], [r * 1.12, -r * 0.2], [r * 0.95, -r * 0.27]], r * 0.07, ink);
  mouth(r * 0.64, -r * 0.55, r * 0.32);
}

// The face at phone size: two solid eyes, one heavy brow bar, a mouth shape. No lids, catch lights or nose line.
function faceBold(ctx, L, id, r, F) {
  const ink = L.ink, tilt = F.brow * r * 0.34;
  const bar = new Path2D(); bar.moveTo(r * 0.06, r * 0.5); bar.lineTo(r * 1.04, r * 0.5 - tilt); bar.lineTo(r * 1.0, r * 0.5 - tilt + r * 0.32); bar.lineTo(r * 0.08, r * 0.5 + r * 0.3); bar.closePath();
  ctx.fillStyle = id === 'ganji' ? L.beard : ink; ctx.fill(bar);
  if (id !== 'suzu') {
    const o = clamp(F.eye, 0, 1.3);
    for (const [cx, w] of [[0.42, 0.2], [0.86, 0.13]]) {
      if (o < 0.15) { line(ctx, [[(cx - w) * r, 0.1 * r], [(cx + w) * r, 0.1 * r]], r * 0.14, ink); continue; }
      ctx.beginPath(); ctx.ellipse(cx * r, 0.1 * r, w * r, r * 0.26 * Math.min(1, o), 0, 0, 7); ctx.fillStyle = ink; ctx.fill();
    }
  }
  const op = clamp(F.mouth, 0, 1);
  if (op < 0.15) line(ctx, [[0.42 * r, -0.55 * r + F.curve * r * 0.08], [0.9 * r, -0.55 * r - F.curve * r * 0.06]], r * 0.14, ink);
  else { ctx.beginPath(); ctx.ellipse(0.68 * r, -0.56 * r, 0.26 * r, Math.max(0.1, op) * 0.3 * r, 0, 0, 7); ctx.fillStyle = '#2a0a10'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = r * 0.1; ctx.stroke(); }
}
function head(ctx, L, id, J, F, opts) {
  const r = L.head; const [x, y] = J.head; const a = J.headA; const ink = L.ink;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-a);
  const skin = L.skin, skinD = shadeOf(L.skin);
  // skull and jaw as one shape, 3/4 view facing +x
  const jaw = id === 'ganji' ? 1.12 : 1;
  const skull = [[-0.98, 0.2], [-0.85, 0.8], [-0.25, 1.1], [0.45, 1.04], [0.92, 0.66], [1.02, 0.28], [1.08, -0.02], [1.16, -0.2], [1.0, -0.3], [0.96, -0.62], [0.72 * jaw, -1.02], [0.42, -1.08], [-0.15, -0.72 * jaw], [-0.55, -0.42]].map(([u, v]) => [u * r, v * r]);
  const sk = blob(skull);
  const parts = [];
  const back = [];
  // hair and headgear behind / over the skull
  if (id === 'rin') {
    back.push({ path: blob([[-1.0, 0.45], [-1.25, 0.05], [-1.05, -0.25], [-0.7, -0.05], [-0.6, 0.3]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: '#000' });
  }
  if (id === 'suzu') back.push({ path: blob([[-1.08, 0.55], [-1.12, -0.35], [-0.85, -0.85], [-0.55, -0.55], [-0.35, 0.2], [0.1, 0.9]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: shadeOf(L.hair, 0.6) });
  if (id === 'sayo') back.push({ path: blob([[-1.04, 0.6], [-1.12, -0.25], [-0.95, -0.75], [-0.55, -0.45], [-0.45, 0.4]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: '#000' });
  parts.push(...back);
  parts.push({ path: sk, rim: 1, col: skin, shd: skinD, sh: 3.5, detail: (c) => {
    // stubble / beard and cheek shadow
    if (id === 'ganji') { c.fillStyle = L.beard; c.fill(blob([[-0.45, -0.25], [0.15, -0.05], [0.7, -0.38], [1.0, -0.4], [0.98, -0.62], [0.6, -1.05], [0.0, -1.02], [-0.5, -0.65]].map(([u, v]) => [u * r, v * r]))); c.fillStyle = 'rgba(30,18,14,0.35)'; c.fill(blob([[-1, 0.2], [-0.8, 0.82], [-0.2, 1.1], [0.4, 1.04], [0.2, 0.7], [-0.4, 0.5]].map(([u, v]) => [u * r, v * r]))); }
    face(c, L, id, r, F);
    // ear
    c.fillStyle = skinD; c.beginPath(); c.ellipse(-r * 0.22, -r * 0.02, r * 0.17, r * 0.25, 0.2, 0, 7); c.fill(); c.strokeStyle = ink; c.lineWidth = r * 0.07; c.stroke();
  } });
  // front hair / headgear masses
  if (id === 'rin') {
    // courier cap: crown + panel + brim, then the amber clip visor over the eyes
    parts.push({ path: blob([[-1.02, 0.28], [-0.92, 0.85], [-0.3, 1.18], [0.45, 1.12], [0.86, 0.72], [0.62, 0.5], [-0.2, 0.42], [-0.7, 0.2]].map(([u, v]) => [u * r, v * r])), col: L.cap, shd: shadeOf(L.cap, 0.55), detail: (c) => { c.fillStyle = L.accent; c.fill(blob([[0.05, 1.12], [0.42, 1.08], [0.62, 0.62], [0.25, 0.56]].map(([u, v]) => [u * r, v * r]))); } });
    parts.push({ path: blob([[0.48, 0.66], [1.0, 0.68], [1.55, 0.5], [1.5, 0.38], [0.9, 0.45], [0.5, 0.48]].map(([u, v]) => [u * r, v * r])), col: L.cap, shd: shadeOf(L.cap, 0.5), noRim: true });
  } else if (id === 'ganji') {
    // shaved skull keeps a dark short crop on top; small round tinted glasses
    parts.push({ path: blob([[-0.85, 0.55], [-0.4, 1.02], [0.35, 1.05], [0.75, 0.75], [0.5, 0.62], [-0.3, 0.6]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: '#000', noRim: true });
  } else if (id === 'suzu') {
    // sharp bob with blade bangs, and the triangular visor across the eyes
    parts.push({ path: blob([[-0.95, 0.35], [-0.8, 0.95], [-0.15, 1.2], [0.55, 1.12], [1.02, 0.7], [1.08, 0.18], [0.82, 0.48], [0.68, 0.22], [0.48, 0.55], [0.2, 0.42], [-0.2, 0.6], [-0.55, 0.3]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: shadeOf(L.hair, 0.55) });
  } else if (id === 'sayo') {
    parts.push({ path: blob([[-0.98, 0.3], [-0.72, 0.95], [-0.05, 1.2], [0.62, 1.05], [1.02, 0.58], [0.9, 0.35], [0.55, 0.62], [0.05, 0.62], [-0.35, 0.25], [-0.55, -0.35], [-0.75, -0.2]].map(([u, v]) => [u * r, v * r])), col: L.hair, shd: '#000', detail: (c) => { c.fillStyle = L.accent; c.beginPath(); c.arc(-0.78 * r, 0.82 * r, 0.16 * r, 0, 7); c.fill(); } });
  }
  // a few flyaway spikes that trail the motion
  const fly = clamp(-SPEED * 0.12, -0.5, 0.6);
  const spike = (bx, by, tx, ty, w) => blob([[bx * r, (by + w) * r], [(tx - fly) * r, (ty + fly * 0.3) * r], [bx * r, (by - w) * r]]);
  if (id === 'rin') parts.splice(back.length, 0, { path: spike(-0.92, 0.2, -1.45, -0.05, 0.14), col: L.hair, shd: '#000', noRim: true });
  if (id === 'suzu') { parts.splice(back.length, 0, { path: spike(-0.95, -0.4, -1.3, -0.85, 0.16), col: L.hair, shd: shadeOf(L.hair, 0.55), noRim: true }); }
  if (id === 'sayo') parts.push({ path: spike(0.55, 0.62, 1.0, -0.15, 0.1), col: L.hair, shd: '#000', noRim: true });
  const lwo = LWO, lwi = LWI; LWO = Math.min(LWO, r * 0.34); LWI = Math.min(LWI, r * 0.12);
  drawParts(ctx, parts);
  LWO = lwo; LWI = lwi;
  // visors and glasses on top of the face
  if (SIL) { ctx.restore(); return; }
  if (id === 'rin') { const v = blob([[0.22, 0.32], [1.08, 0.36], [1.12, 0.02], [0.3, -0.04]].map(([u, w]) => [u * r, w * r])); ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = L.visor; ctx.fill(v); ctx.restore(); ctx.strokeStyle = ink; ctx.lineWidth = r * 0.09; ctx.stroke(v); line(ctx, [[0.3 * r, 0.26 * r], [1.0 * r, 0.3 * r]], r * 0.06, '#fff3c8', 0.8); }
  if (id === 'ganji') { for (const [cx, rr] of [[0.42, 0.2], [0.86, 0.13]]) { ctx.beginPath(); ctx.ellipse(cx * r, 0.12 * r, rr * r, rr * r * 0.85, 0, 0, 7); ctx.fillStyle = 'rgba(255,120,40,0.45)'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = r * 0.08; ctx.stroke(); } line(ctx, [[0.62 * r, 0.14 * r], [0.73 * r, 0.14 * r]], r * 0.07, ink); }
  if (id === 'suzu') {
    const nar = 1 - clamp(F.brow, 0, 1) * 0.35; // the visor narrows when she is angry
    const v = blob([[0.08, 0.34 * nar], [1.14, 0.3 * nar], [1.12, -0.04], [0.6, -0.1], [0.12, 0.0]].map(([u, w]) => [u * r, w * r + 0.06 * r]));
    ctx.fillStyle = '#062029'; ctx.fill(v); ctx.strokeStyle = ink; ctx.lineWidth = r * 0.1; ctx.stroke(v);
    line(ctx, [[0.22 * r, 0.18 * r], [1.04 * r, 0.16 * r]], r * 0.11 * (F.eye < 0.2 ? 0.4 : 1), F.mouth > 0.7 && F.brow < 0 ? '#ff4d6d' : L.accent);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- secondary motion chains
export function chain(n, len) { return { n, len, p: [], init: false }; }
export function stepChain(ch, ax, ay, dirx, gravity, wind, dt) {
  if (!ch.init) { for (let i = 0; i < ch.n; i++) ch.p.push([ax - dirx * i * ch.len, ay - i * 2, ax - dirx * i * ch.len, ay - i * 2]); ch.init = true; }
  ch.p[0][0] = ax; ch.p[0][1] = ay; ch.p[0][2] = ax; ch.p[0][3] = ay;
  const k = Math.min(2, dt * 60);
  for (let i = 1; i < ch.n; i++) { const q = ch.p[i]; const vx = (q[0] - q[2]) * 0.9, vy = (q[1] - q[3]) * 0.9; q[2] = q[0]; q[3] = q[1]; q[0] += vx + wind * k; q[1] += vy + gravity * k; }
  for (let it = 0; it < 3; it++) for (let i = 1; i < ch.n; i++) {
    const a = ch.p[i - 1], b = ch.p[i]; const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 0.001;
    const r = (d - ch.len) / d; if (i === 1) { b[0] -= dx * r; b[1] -= dy * r; } else { a[0] += dx * r * 0.5; a[1] += dy * r * 0.5; b[0] -= dx * r * 0.5; b[1] -= dy * r * 0.5; }
  }
}

// ---------------------------------------------------------------- the fighter
function faceFor(state, win) {
  if (win) return FACES.win;
  return FACES[{ atk: 'atk', grab: 'atk', hit: 'hit', juggle: 'hit', reset: 'hit', block: 'block', guard: 'block', win: 'win', lose: 'lose', ko: 'ko', dead: 'ko', down: 'ko', held: 'held' }[state] || 'idle'];
}
function build(ctx, id, p, opts, L) {
  const J = solve(L, p);
  const ch = opts.chains || {};
  const parts = [];
  const sk = L.skin, skD = shadeOf(L.skin);
  const fsz = (limb) => (p.strike === limb ? 1.32 : 1); // foreshortening: the striking hand or foot is drawn bigger
  const up = J.up, fw = J.fw;
  const T = (t, s) => [J.hip[0] + up[0] * L.torso * t + fw[0] * s, J.hip[1] + up[1] * L.torso * t + fw[1] * s];
  const C = (c) => c; // near colour
  // ---------- 1. back accessories
  if (id === 'rin') {
    if (ch.tail) parts.push({ path: ribbon(ch.tail, 3.4, 1.2, true), col: L.hair, shd: '#000', noRim: true });
    const bob = ch.tail && ch.tail[2] ? (ch.tail[2][1] - (J.neck[1] + 10)) * 0.15 : 0;
    const b0 = T(0.55, -L.chest * 0.62), b1 = T(0.98, -L.chest * 0.6);
    parts.push({ path: blob([[b0[0] - 3, b0[1] + bob - 4], [b0[0] - 15, b0[1] + bob + 2], [b1[0] - 16, b1[1] + bob], [b1[0] - 2, b1[1] + 3]]), col: L.bag, shd: shadeOf(L.bag, 0.5), detail: (c) => line(c, [[b0[0] - 13, b0[1] + bob + 12], [b0[0] - 3, b0[1] + bob + 12]], 2.2, L.accent) });
  }
  if (id === 'sayo') {
    if (ch.tail) parts.push({ path: ribbon(ch.tail, 4.5, 1.5, true), col: L.hair, shd: '#000', noRim: true });
    if (ch.scarf) parts.push({ path: ribbon(ch.scarf, 5, 3, true), col: L.accent, shd: shadeOf(L.accent, 0.55) });
  }
  if ((id === 'suzu' || id === 'ganji') && ch.coat) {
    const w0 = id === 'suzu' ? 9 : 12, w1 = id === 'suzu' ? 7 : 10;
    parts.push({ path: ribbon(ch.coat.map((q, i) => [q[0] - 3, q[1] + i * 0.5]), w0, w1, id === 'suzu'), col: farC(L.main), shd: L.mainD, detail: id === 'suzu' ? (c) => line(c, ch.coat, 1.6, L.accent, 0.7) : null });
  }
  // ---------- 2. far leg and foot
  pushLeg(parts, id, L, J.hpF, J.knF, J.ftF, p.toeF, true, 1);
  // ---------- 3. far arm
  pushArm(parts, id, L, J.shF, J.elF, J.haF, p.handF, true, p.strike === 'hf' ? 1.25 : 1, opts);
  // ---------- 4. torso and pelvis (one mass each), collar
  const w = L.waist / 2, c2 = L.chest / 2, hp = L.hips / 2;
  const pel = { rin: L.dark, ganji: L.dark, suzu: L.dark, sayo: L.main }[id];
  parts.push({ path: blob([T(-0.16, -hp * 1.05), T(-0.2, hp * 0.9), T(0.1, hp * 1.08), T(0.24, hp * 0.95), T(0.24, -hp * 1.1), T(0.05, -hp * 1.2)]), col: pel, shd: shadeOf(pel, 0.5) });
  let tpts;
  if (id === 'ganji') tpts = [T(0.05, -w * 1.05), T(0.05, w * 1.15), T(0.4, w * 1.35), T(0.72, c2 * 1.05), T(0.92, c2 * 0.85), T(1.04, c2 * 0.3), T(1.06, -c2 * 0.45), T(0.92, -c2 * 0.95), T(0.62, -c2 * 0.8), T(0.32, -w * 1.15)];
  else if (id === 'suzu') tpts = [T(0.0, -w * 1.1), T(0.0, w * 1.1), T(0.42, w * 1.0), T(0.72, c2 * 1.1), T(0.95, c2 * 0.7), T(1.02, -c2 * 0.3), T(0.84, -c2 * 0.95), T(0.4, -w * 1.1)];
  else if (id === 'rin') tpts = [T(0.12, -w * 1.45), T(0.1, w * 1.5), T(0.3, w * 1.3), T(0.7, c2 * 1.22), T(0.96, c2 * 0.72), T(1.04, -c2 * 0.35), T(0.86, -c2 * 1.1), T(0.42, -w * 1.35)];
  else tpts = [T(0.0, -w * 1.1), T(0.0, w * 1.12), T(0.4, w * 1.02), T(0.72, c2 * 1.12), T(0.96, c2 * 0.66), T(1.02, -c2 * 0.32), T(0.84, -c2 * 0.98), T(0.42, -w * 1.08)];
  const tcol = id === 'sayo' ? L.dark : L.main, tshd = id === 'sayo' ? L.darkD : L.mainD;
  const thl = { rin: '#f1ffa6', ganji: '#86704f', suzu: '#3a6189', sayo: '#3a2648' }[id];
  parts.push({ path: blob(tpts), rim: 1, col: tcol, shd: tshd, hl: thl, detail: (c) => torsoDetail(c, id, L, T, J) });
  // ---------- 5. near leg
  pushLeg(parts, id, L, J.hpN, J.knN, J.ftN, p.toeN, false, fsz('fn'));
  // ---------- 6. neck (one shape) — the head is drawn after the body pass
  const nk0 = T(0.9, 0), nk1 = [J.head[0] - (J.head[0] - J.neck[0]) * 0.35, J.head[1] - (J.head[1] - J.neck[1]) * 0.35];
  const nw = id === 'ganji' ? 9 : 4.6;
  parts.push({ path: ribbon([nk0, nk1], nw, nw * 0.9), col: shadeOf(L.skin, 0.8), shd: skD, noRim: true }); // the neck sits in the jaw's shadow
  if (id === 'suzu') parts.push({ path: blob([T(0.86, -c2 * 0.9), T(1.18, -c2 * 0.6), T(1.32, -c2 * 0.05), T(1.0, c2 * 0.3), T(0.9, c2 * 0.62), T(0.86, 0)]), col: L.main, shd: L.mainD, detail: (c) => line(c, [T(1.3, -c2 * 0.05), T(0.92, c2 * 0.58)], 1.6, L.accent) });
  if (id === 'ganji') parts.push({ path: blob([T(0.82, -c2 * 0.95), T(1.08, -c2 * 0.75), T(1.12, -c2 * 0.1), T(0.98, c2 * 0.55), T(0.84, c2 * 0.4), T(0.9, -c2 * 0.2)]), col: L.main, shd: L.mainD, detail: (c) => line(c, [T(1.1, -c2 * 0.1), T(0.96, c2 * 0.5)], 2, L.accent, 0.9) });
  // ---------- 7. near arm (drawn last so strikes read in front)
  const nearArm = [];
  pushArm(nearArm, id, L, J.shN, J.elN, J.haN, p.handN, false, fsz('hn'), opts);
  return { J, parts, nearArm };
}
function torsoDetail(c, id, L, T, J) {
  const c2 = L.chest / 2, w = L.waist / 2;
  // a hard shadow shape under the chest: the ribcage turning under toward the waist
  c.save(); c.globalAlpha *= 0.35; c.fillStyle = '#000'; c.fill(blob([T(0.34, w * 0.2), T(0.56, c2 * 1.25), T(0.44, c2 * 1.4), T(0.26, w * 1.3)])); c.restore();
  if (id === 'rin') {
    c.fillStyle = L.dark; c.fill(blob([T(-0.05, -w * 1.2), T(-0.05, w * 1.2), T(0.16, w * 1.1), T(0.16, -w * 1.2)]));
    line(c, [T(0.5, -c2 * 1.2), T(0.52, c2 * 1.2)], 3.4, '#e8f2ff'); line(c, [T(0.5, -c2 * 1.2), T(0.52, c2 * 1.2)], 0.8, '#9aa6b8');
    line(c, [T(0.98, -c2 * 0.5), T(0.18, c2 * 0.95)], 3.6, '#17181f'); // bag strap
    c.fillStyle = L.mainD; c.fill(blob([T(0.9, -c2 * 0.5), T(1.04, -c2 * 0.2), T(1.0, c2 * 0.55), T(0.86, c2 * 0.5)])); // collar
    line(c, [T(0.86, c2 * 0.15), T(0.2, c2 * 0.05)], 1.6, '#3a4a12'); for (let i = 0; i < 6; i++) line(c, [T(0.24 + i * 0.1, c2 * 0.05), T(0.27 + i * 0.1, c2 * 0.2)], 0.9, '#3a4a12'); // zip
    line(c, [T(0.95, -c2 * 0.7), T(0.62, -c2 * 1.05)], 1, 'rgba(0,0,0,0.45)'); // yoke seam
  } else if (id === 'ganji') {
    c.fillStyle = L.shirt; c.fill(blob([T(0.12, w * 0.4), T(0.95, c2 * 0.25), T(0.94, c2 * 0.9), T(0.5, c2 * 1.2), T(0.12, w * 1.3)]));
    line(c, [T(0.95, c2 * 0.2), T(0.55, c2 * 0.55), T(0.12, w * 0.45)], 2.4, '#000', 0.9); // coat lapel edge
    c.fillStyle = L.accent; c.fill(blob([T(0.02, -w * 1.1), T(0.02, w * 1.3), T(0.1, w * 1.3), T(0.1, -w * 1.1)])); // belt band
  } else if (id === 'suzu') {
    c.fillStyle = L.light; c.fill(blob([T(0.05, w * 0.15), T(0.92, c2 * 0.2), T(0.9, c2 * 0.9), T(0.45, c2 * 1.15), T(0.05, w * 1.2)]));
    line(c, [T(0.96, c2 * 0.2), T(0.05, w * 0.2)], 1.8, L.accent);
    c.fillStyle = '#0a1018'; c.fill(blob([T(0.12, -w * 1.2), T(0.12, w * 1.25), T(0.2, w * 1.25), T(0.2, -w * 1.2)]));
  } else if (id === 'sayo') {
    line(c, [T(1.0, c2 * 0.35), T(0.25, -w * 0.4)], 2.6, '#33223f'); line(c, [T(0.98, -c2 * 0.3), T(0.3, w * 0.7)], 2.2, '#3f2d4d');
    c.fillStyle = L.accent; c.fill(blob([T(-0.04, -w * 1.25), T(-0.04, w * 1.3), T(0.16, w * 1.25), T(0.16, -w * 1.25)])); // obi sash
    line(c, [T(0.06, w * 1.2), T(-0.2, w * 1.6)], 2.2, L.accent); line(c, [T(0.06, w * 1.2), T(-0.14, w * 0.9)], 2.2, L.accent); // wrap ties
  }
}
function crease(c, A, B, C, side, len) {
  const u1 = unit(A, B), u2 = unit(B, C); const bx = u2[0] - u1[0], by = u2[1] - u1[1]; const d = Math.hypot(bx, by); if (d < 0.25) return;
  const nx = bx / d, ny = by / d; line(c, [[B[0] + nx * side * 2, B[1] + ny * side * 2], [B[0] + nx * side * 2 + u1[0] * len, B[1] + ny * side * 2 + u1[1] * len]], 1.3, 'rgba(0,0,0,0.55)');
}
function pushLeg(parts, id, L, hp, kn, ft, toe, far, fs) {
  const f = (c) => (far ? farC(c) : c);
  const k = L.legW;
  if (id === 'sayo') {
    const path = limb(hp, kn, ft, HAKAMA, 1, 1);
    parts.push({ path, col: f(L.main), shd: L.mainD, hl: far ? null : '#8b2c7e', detail: (c) => { const m = along(kn, ft, 0.4); line(c, [along(hp, kn, 0.3), m], 1.4, 'rgba(0,0,0,0.4)'); } });
  } else if (id === 'ganji') {
    parts.push({ path: limb(hp, kn, ft, LEG_BAGGY, 1.05, 1), rim: 1, col: f(L.dark), shd: L.darkD, detail: (c) => { crease(c, hp, kn, ft, 1, -7); line(c, [along(hp, kn, 0.4), along(hp, kn, 0.62)], 1.2, 'rgba(255,255,255,0.12)'); } });
  } else if (id === 'rin') {
    const path = limb(hp, kn, ft, LEG, k, fs);
    const S = along(hp, kn, 0.62), dir = unit(hp, kn);
    parts.push({ path, paint: splitPaint(path, S, dir, f(L.dark), L.darkD, f(L.leg2), shadeOf(L.leg2, 0.55)), detail: (c) => crease(c, hp, kn, ft, 1, -6) });
  } else { // suzu: slim trousers into tall pointed boots
    const path = limb(hp, kn, ft, LEG, k, fs);
    const S = along(kn, ft, 0.15), dir = unit(kn, ft);
    parts.push({ path, paint: splitPaint(path, S, dir, f(L.dark), L.darkD, f(L.shoe), L.shoeD), detail: (c) => line(c, [along(kn, ft, 0.2), along(kn, ft, 0.85)], 1.4, L.accent, 0.8) });
  }
  const style = { rin: 'sneaker', ganji: 'boot', suzu: 'point', sayo: 'tabi' }[id];
  const sz = fs > 1 ? 1.22 : 1;
  const Lf = { ...L, foot: L.foot * sz };
  const { path, T } = footPath(kn, ft, Lf, toe, style);
  parts.push({ path, col: f(L.shoe), shd: L.shoeD, sh: 2.5, noRim: id === 'sayo', detail: (c) => {
    if (id === 'rin') { line(c, [T(-7, -3.2), T(Lf.foot + 1, -3.4)], 3, far ? '#7da61e' : L.accent); line(c, [T(4, 3), T(12, 4)], 1.2, 'rgba(0,0,0,0.5)'); }
    if (id === 'suzu') line(c, [T(-6, -2.5), T(Lf.foot, -2.5)], 1.6, L.accent);
    if (id === 'sayo') line(c, [T(Lf.foot * 0.72, 1), T(Lf.foot * 0.72, -4.5)], 1.2, '#6a6078');
    if (id === 'ganji') line(c, [T(-7, -3.5), T(Lf.foot, -3.5)], 2.4, '#000');
  } });
}
function pushArm(parts, id, L, sh, el, ha, kind, far, fs, opts) {
  const f = (c) => (far ? farC(c) : c);
  const skin = f(L.skin), skD = shadeOf(L.skin);
  if (id === 'ganji') {
    const path = limb(sh, el, ha, ARM_G, 1.0, fs);
    if (!far) { // hydraulic prosthetic forearm: steel, piston lines, glowing joints
      const S = along(el, ha, 0.02), dir = unit(el, ha);
      parts.push({ path, rim: 1, paint: splitPaint(path, S, dir, L.main, L.mainD, L.metal, L.metalD), detail: (c) => {
        const u = unit(el, ha), n = [-u[1], u[0]]; const off = (p, d) => [p[0] + n[0] * d, p[1] + n[1] * d];
        line(c, [off(along(el, ha, 0.12), 3.2), off(along(el, ha, 0.8), 3.2)], 2.6, L.metalD); line(c, [off(along(el, ha, 0.12), 3.2), off(along(el, ha, 0.55), 3.2)], 1.1, '#e8eef8', 0.9); // piston
        line(c, [off(along(el, ha, 0.2), -3), off(along(el, ha, 0.85), -3)], 2.2, L.metalD); // second piston
        line(c, [along(el, ha, 0.45), off(along(el, ha, 0.45), 6)], 1, '#000', 0.6); line(c, [along(el, ha, 0.62), off(along(el, ha, 0.62), -6)], 1, '#000', 0.6); // panel seams
        c.fillStyle = L.accent; c.beginPath(); c.arc(el[0], el[1], 3.6, 0, 7); c.fill();
      } });
      const { path: hp } = handPath(ha, el, kind, L.hand * fs);
      parts.push({ path: hp, col: L.metal, shd: L.metalD, sh: 2.5, hl: '#e8eef8' });
      return;
    }
    const S = along(el, ha, 0.35), dir = unit(el, ha);
    parts.push({ path, rim: 1, paint: splitPaint(path, S, dir, f(L.main), L.mainD, f(L.skin), skD), detail: (c) => { for (let i = 0; i < 3; i++) line(c, [along(el, ha, 0.5 + i * 0.14), along(el, ha, 0.56 + i * 0.14)], 4.5, '#e8e0cf', 0.85); } });
    const { path: hp } = handPath(ha, el, kind, L.hand * fs);
    parts.push({ path: hp, col: skin, shd: skD, sh: 2.5 });
    return;
  }
  const k = L.armW;
  const path = limb(sh, el, ha, ARM, k, fs);
  if (id === 'rin') { // jacket sleeve to the elbow, bare forearm, black glove
    const S = along(sh, el, 0.92), dir = unit(sh, el);
    parts.push({ path, rim: 1, paint: splitPaint(path, S, dir, f(L.main), L.mainD, skin, skD), detail: (c) => line(c, [along(sh, el, 0.5), along(sh, el, 0.75)], 2.6, '#e8f2ff', far ? 0.5 : 0.9) });
    const { path: hp, T: HT } = handPath(ha, el, kind, L.hand * fs); parts.push({ path: hp, col: f(L.glove), shd: '#000', sh: 2, detail: (c) => { line(c, [HT(1, -6), HT(1, 6)], 2.2, '#e9e6dc', 0.9); line(c, [HT(4, -6.5), HT(4, 6.5)], 1.4, '#e9e6dc', 0.7); } }); // tape over the knuckle wrap
  } else if (id === 'suzu') { // coat sleeve all the way, cyan cuff, light glove
    parts.push({ path, rim: 1, col: f(L.main), shd: L.mainD, detail: (c) => line(c, [along(el, ha, 0.82), along(el, ha, 0.95)], 4, L.accent, 0.9) });
    const { path: hp } = handPath(ha, el, kind, L.hand * fs); parts.push({ path: hp, col: f(L.light), shd: L.lightD, sh: 2 });
  } else { // sayo: bare arms with tape, and a wide drop sleeve hanging off the upper arm
    const S = along(sh, el, 0.55), dir = unit(sh, el);
    const sw = opts && opts.sleeve != null ? opts.sleeve : 0;
    const e = el, d = [0, -1];
    const lag = (opts && opts.vx ? -opts.vx * 2.2 : 0) + Math.sin((opts && opts.t || 0) * 5 + (far ? 1 : 0)) * 1.5;
    const sleeve = blob([along(sh, el, 0.2), [e[0] + 6, e[1] + 4], [e[0] + 4 + lag * 0.5, e[1] - 16 - sw], [e[0] - 8 + lag, e[1] - 24 - sw], [e[0] - 12 + lag * 0.6, e[1] - 6], along(sh, el, 0.1)]);
    const inner = blob([along(sh, el, 0.3), [e[0] + 2, e[1] - 2], [e[0] - 2 + lag * 0.6, e[1] - 12 - sw * 0.6], [e[0] - 8 + lag * 0.7, e[1] - 10], along(sh, el, 0.2)]);
    parts.push({ path: sleeve, col: f(L.sleeve), shd: L.sleeveD, detail: (c) => line(c, [[e[0] + 4 + lag * 0.5, e[1] - 15 - sw], [e[0] - 8 + lag, e[1] - 23 - sw]], 2.4, L.accent, far ? 0.4 : 0.8) });
    parts.push({ path: inner, col: f(L.main), shd: L.mainD }); // the under-layer peeking out
    parts.push({ path, rim: 1, paint: splitPaint(path, S, dir, f(L.sleeve), L.sleeveD, skin, skD), detail: (c) => { for (let i = 0; i < 3; i++) line(c, [along(el, ha, 0.45 + i * 0.15), along(el, ha, 0.5 + i * 0.15)], 6.5, f(L.wrap), 0.9); } });
    const { path: hp } = handPath(ha, el, kind, L.hand * fs); parts.push({ path: hp, col: skin, shd: skD, sh: 2 });
  }
}

export function drawFighter(ctx, id, p, opts = {}) {
  const L = opts.alt ? altLook(id) : LOOKS[id];
  INK = L.ink; LWO = (opts.lw || 2.6) * 1.9; LWI = (opts.lw || 2.6) * 0.5; TINT = opts.tint || null; SPEED = opts.vx || 0; LIGHT = opts.light || [0.5, 0.85]; RIM = opts.rim || '#00f0ff'; RIMDIR = opts.rimDir || 1; RIMA = opts.rimA == null ? 0.9 : opts.rimA; FLAT = !!opts.flat;
  ctx.save();
  if (p.rot) { ctx.translate(p.hip[0], p.hip[1]); ctx.rotate(p.rot * D2R); ctx.translate(-p.hip[0], -p.hip[1]); }
  if (p.sq && p.sq !== 1) ctx.scale(1 / Math.sqrt(p.sq), p.sq);
  const { J, parts, nearArm } = build(ctx, id, p, opts, L);
  const F = opts.face || faceFor(opts.state, opts.win);
  // body, then head, then the near arm on top (one ink pass for body + arm so the silhouette outline is continuous)
  drawParts(ctx, parts);
  head(ctx, L, id, J, F, opts);
  if (id === 'sayo' && opts.chains && opts.chains.scarfFront && !SIL) drawParts(ctx, [{ path: ribbon(opts.chains.scarfFront, 5, 4), col: L.accent, shd: shadeOf(L.accent, 0.55) }]);
  drawParts(ctx, nearArm);
  ctx.restore();
  return J;
}
// one flat colour, used for after-images, the hit flash and the model sheet's silhouette row
export function drawSilhouette(ctx, id, p, col, chains) {
  // every part goes into ONE path that is filled once, so overlaps never darken a translucent silhouette
  const base = ctx.getTransform(); SILBASE = base.inverse(); SILPATH = new Path2D(); SIL = col;
  try { drawFighter(ctx, id, p, { chains, flat: true, rimA: 0 }); } finally { SIL = null; }
  ctx.save(); ctx.setTransform(base); ctx.fillStyle = col; ctx.fill(SILPATH, 'nonzero'); ctx.restore(); SILPATH = null;
}

// Hanging accessories for still drawings (portraits, the model sheet), shaped as if caught mid-sway.
export function stillChains(id, p) {
  const mk = (x0, y0, dx, dy, n, sag = 0.6) => Array.from({ length: n }, (_, i) => [x0 + dx * i, y0 + dy * i - i * i * sag]);
  const h = p.hip;
  return { rin: { tail: mk(h[0] - 12, h[1] + 74, -6, -1, 5) }, sayo: { tail: mk(h[0] - 8, h[1] + 78, -8, -2, 6), scarf: mk(h[0] - 2, h[1] + 46, -9, -3, 7, 0.5) }, suzu: { coat: mk(h[0] - 6, h[1] + 6, -6, -10, 5, 0.3) }, ganji: { coat: mk(h[0] - 10, h[1] + 10, -5, -9, 4, 0.3) } }[id] || {};
}

// Geometry of the drawn shapes, for tools/measure.cjs (local units, before the fighter's scale).
export const GAME_LW = 1.75;
export function METRICS(id) {
  const L = LOOKS[id]; const r = L.head;
  const minW = (prof, t0, t1, k) => Math.min(...prof.filter(([t]) => t >= t0 && t <= t1).map(([, a, b]) => (a + b) * k));
  const arm = id === 'ganji' ? ARM_G : ARM; const ak = id === 'ganji' ? 1 : L.armW;
  const leg = id === 'sayo' ? HAKAMA : id === 'ganji' ? LEG_BAGGY : LEG; const lk = id === 'ganji' ? 1.05 : id === 'sayo' ? 1 : L.legW;
  const lwo = GAME_LW * 1.9, lwi = GAME_LW * 0.5;
  return {
    forearmMin: minW(arm, 1.1, 1.9, ak), upperArmMin: minW(arm, 0.15, 0.75, ak), thighMin: minW(leg, 0.15, 0.75, lk), shinMin: minW(leg, 1.25, 1.75, lk),
    headH: r * (HEAD_TOP[id] + 1.0), browH: r * (BROW_T + 0.22 * BROW_K * FACES.idle.brow), eyeH: r * EYE_H * 2 * FACES.idle.eye, mouthH: r * MOUTH_H * Math.max(FACES.atk.mouth, FACES.hit.mouth) + r * 0.12,
    outline: lwo / 2 + lwi / 2, inner: lwi,
  };
}
