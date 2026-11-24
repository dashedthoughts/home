// NEON KUMITE · procedural 2D skeletal rigs. Bold ink outline, flat colour, one cel-shadow tone, rim light from the stage neon.
// Everything is drawn in fighter-local space: x forward, y up, origin between the feet, before the fighter's scale.
const D2R = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export const LOOKS = {
  rin: {
    arm: [29, 27], leg: [43, 42], torso: 49, neck: 7, head: 13.5, chest: 25, waist: 19, hand: 1.0, foot: 23,
    skin: '#e9b48c', hair: '#15151d', main: '#b8ff2e', mainD: '#5f8a10', dark: '#1c1e29', darkD: '#0f1018', shoe: '#f2f1e9', shoeD: '#a9a8b8', accent: '#b8ff2e', ink: '#0b0b10',
  },
  ganji: {
    arm: [33, 31], leg: [41, 39], torso: 57, neck: 6, head: 12.5, chest: 37, waist: 30, hand: 1.28, foot: 25,
    skin: '#c88a60', hair: '#2a1d17', main: '#1d1d26', mainD: '#0f0f15', dark: '#262631', darkD: '#14141b', shoe: '#18181d', shoeD: '#0b0b0e', accent: '#ff5a1f', metal: '#8f98a8', metalD: '#4c5363', shirt: '#ece6da', ink: '#0b0b10',
  },
  suzu: {
    arm: [29, 27], leg: [42, 42], torso: 51, neck: 7, head: 13, chest: 24, waist: 18, hand: 0.95, foot: 22,
    skin: '#f1c9aa', hair: '#2b3754', main: '#1b2b3c', mainD: '#0f1824', dark: '#151d28', darkD: '#0b1018', shoe: '#0f151d', shoeD: '#070a0f', accent: '#00f0ff', light: '#e6edf2', lightD: '#9aa9b6', ink: '#06080c',
  },
  sayo: {
    arm: [29, 28], leg: [44, 43], torso: 49, neck: 7, head: 13, chest: 23, waist: 17, hand: 0.98, foot: 22,
    skin: '#ebbf9c', hair: '#120c16', main: '#58154e', mainD: '#2e0a2a', dark: '#1a1020', darkD: '#0d0711', shoe: '#e9e4ef', shoeD: '#a49cb3', accent: '#ff2bd6', wrap: '#e3dde6', ink: '#0b070d',
  },
};

const ALT = {
  rin: { main: '#ff8a1f', mainD: '#9a4a08', accent: '#ff8a1f', hair: '#e8e1d4' },
  ganji: { main: '#e6e0d4', mainD: '#9d978c', accent: '#00d8ff', shirt: '#1c1c22', metal: '#c9a64a', metalD: '#7d6420' },
  suzu: { main: '#3d1838', mainD: '#220b20', accent: '#ff2bd6', hair: '#d9d4e8' },
  sayo: { main: '#163f6e', mainD: '#0a2242', accent: '#00f0ff', hair: '#f0ece6' },
};
const altCache = {};
function altLook(id) { return altCache[id] || (altCache[id] = { ...LOOKS[id], ...ALT[id] }); }
// ---------------------------------------------------------------- math
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
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

// Solve joint positions from a pose (targets in local space).
export function solve(L, p) {
  const J = {};
  const lean = (p.lean || 0) * D2R;
  const hx = p.hip[0], hy = p.hip[1];
  const up = [Math.sin(lean), Math.cos(lean)]; // torso axis
  const fw = [up[1], -up[0]];
  J.hip = [hx, hy];
  J.chest = [hx + up[0] * L.torso * 0.72, hy + up[1] * L.torso * 0.72];
  J.neck = [hx + up[0] * L.torso, hy + up[1] * L.torso];
  const ha = lean + (p.head || 0) * D2R;
  J.headA = ha;
  J.head = [J.neck[0] + Math.sin(ha) * (L.neck + L.head * 1.02), J.neck[1] + Math.cos(ha) * (L.neck + L.head * 1.02)];
  const sh = L.chest * 0.18;
  J.shN = [J.neck[0] - up[0] * 4 + fw[0] * sh, J.neck[1] - up[1] * 4 + fw[1] * sh];
  J.shF = [J.neck[0] - up[0] * 5 - fw[0] * sh, J.neck[1] - up[1] * 5 - fw[1] * sh];
  J.hpN = [hx + fw[0] * 4, hy + fw[1] * 4 - 2];
  J.hpF = [hx - fw[0] * 4, hy - fw[1] * 4 - 2];
  const st = p.str || 1;
  const [ex, ey, wx, wy] = ik(J.shN[0], J.shN[1], p.hn[0], p.hn[1], L.arm[0], L.arm[1] * (p.strike === 'hn' ? st : 1), -1);
  J.elN = [ex, ey]; J.haN = [wx, wy];
  const [ex2, ey2, wx2, wy2] = ik(J.shF[0], J.shF[1], p.hf[0], p.hf[1], L.arm[0], L.arm[1] * (p.strike === 'hf' ? st : 1), -1);
  J.elF = [ex2, ey2]; J.haF = [wx2, wy2];
  const [kx, ky, ax, ay] = ik(J.hpN[0], J.hpN[1], p.fn[0], p.fn[1] + 4, L.leg[0], L.leg[1] * (p.strike === 'fn' ? st : 1), p.kneeN || 1);
  J.knN = [kx, ky]; J.ftN = [ax, ay];
  const [kx2, ky2, ax2, ay2] = ik(J.hpF[0], J.hpF[1], p.ff[0], p.ff[1] + 4, L.leg[0], L.leg[1] * (p.strike === 'ff' ? st : 1), p.kneeF || 1);
  J.knF = [kx2, ky2]; J.ftF = [ax2, ay2];
  return J;
}

// ---------------------------------------------------------------- drawing primitives
let LW = 2.6; // ink width in local units, set per draw
let LIGHT = [0.6, 0.8], RIM = '#00f0ff', RIMA = 0.9;
function capsule(ctx, a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 0.001;
  const ang = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.arc(a[0], a[1], ra, ang + Math.PI / 2, ang - Math.PI / 2, false);
  ctx.arc(b[0], b[1], rb, ang - Math.PI / 2, ang + Math.PI / 2, false);
  ctx.closePath();
  return [dx / d, dy / d];
}
// A limb segment: fill, cel shadow on the side away from the key light, rim on the lit edge, ink outline.
function limb(ctx, a, b, ra, rb, col, shd, ink = '#0b0b10') {
  ra *= THICK; rb *= THICK;
  const [ux, uy] = capsule(ctx, a, b, ra, rb);
  ctx.fillStyle = col; ctx.fill();
  const nx = -uy, ny = ux; const lit = nx * LIGHT[0] + ny * LIGHT[1] > 0 ? 1 : -1;
  ctx.save(); ctx.clip();
  ctx.beginPath();
  ctx.moveTo(a[0] - nx * lit * 0.15 * ra, a[1] - ny * lit * 0.15 * ra);
  ctx.lineTo(b[0] - nx * lit * 0.15 * rb, b[1] - ny * lit * 0.15 * rb);
  ctx.lineTo(b[0] - nx * lit * rb * 3 + ux * rb * 2, b[1] - ny * lit * rb * 3 + uy * rb * 2);
  ctx.lineTo(a[0] - nx * lit * ra * 3 - ux * ra * 2, a[1] - ny * lit * ra * 3 - uy * ra * 2);
  ctx.closePath(); ctx.fillStyle = shd; ctx.fill();
  // rim light: a thin neon line just inside the edge that faces the rim source
  const rl = nx * RIMDIR > 0 ? 1 : -1;
  ctx.beginPath(); ctx.moveTo(a[0] + nx * rl * (ra - LW * 0.55), a[1] + ny * rl * (ra - LW * 0.55)); ctx.lineTo(b[0] + nx * rl * (rb - LW * 0.55), b[1] + ny * rl * (rb - LW * 0.55));
  ctx.strokeStyle = RIM; ctx.globalAlpha = RIMA * 0.85; ctx.lineWidth = LW * 0.75; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.restore();
  capsule(ctx, a, b, ra, rb); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke();
}
let RIMDIR = 1; const THICK = 1.18;
function poly(ctx, pts, col, shd, shadeFn, ink = '#0b0b10', rimEdge) {
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (shd && shadeFn) { ctx.save(); ctx.clip(); ctx.beginPath(); shadeFn(); ctx.fillStyle = shd; ctx.fill(); if (rimEdge) { ctx.beginPath(); rimEdge(); ctx.strokeStyle = RIM; ctx.globalAlpha = RIMA * 0.8; ctx.lineWidth = LW * 0.8; ctx.stroke(); ctx.globalAlpha = 1; } ctx.restore(); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
  ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.lineJoin = 'round'; ctx.stroke();
}
function smooth(ctx, pts) { // closed Catmull-Rom-ish curve through points
  const n = pts.length; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) ctx.moveTo(p1[0], p1[1]);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  ctx.closePath();
}
function shape(ctx, pts, col, shd, ink, shadeOffset = 5) {
  smooth(ctx, pts); ctx.fillStyle = col; ctx.fill();
  if (shd) {
    ctx.save(); ctx.clip();
    const ox = -LIGHT[0] * shadeOffset, oy = -LIGHT[1] * shadeOffset;
    ctx.beginPath(); ctx.rect(-400, -400, 800, 800); smooth(ctx, pts.map((p) => [p[0] - ox, p[1] - oy]));
    ctx.fillStyle = shd; ctx.fill('evenodd');
    ctx.translate(RIMDIR * 2.2, 0.6); smooth(ctx, pts); ctx.translate(-RIMDIR * 2.2, -0.6);
    ctx.restore();
    smooth(ctx, pts);
  }
  ctx.strokeStyle = ink || '#0b0b10'; ctx.lineWidth = LW; ctx.lineJoin = 'round'; ctx.stroke();
}
// rim line along one side of a closed smooth shape: draw shape stroke clipped to a half plane
function rimShape(ctx, pts) {
  ctx.save(); smooth(ctx, pts); ctx.clip();
  ctx.translate(-RIMDIR * LW * 1.1, 0); smooth(ctx, pts); ctx.translate(RIMDIR * LW * 1.1, 0);
  ctx.strokeStyle = RIM; ctx.globalAlpha = RIMA * 0.75; ctx.lineWidth = LW * 1.1; ctx.stroke();
  ctx.restore(); ctx.globalAlpha = 1;
}

function hand(ctx, w, el, kind, sz, col, shd, ink, glove) {
  const ang = Math.atan2(w[1] - el[1], w[0] - el[0]);
  ctx.save(); ctx.translate(w[0], w[1]); ctx.rotate(ang); ctx.scale(sz, sz);
  let pts;
  if (kind === 1) pts = [[-2, -6], [9, -7.5], [12.5, -3], [12.5, 4], [9, 7.5], [-2, 7]]; // fist
  else if (kind === 2) pts = [[-2, -5], [14, -4], [18, -1], [17, 3], [12, 4.5], [-2, 5]]; // blade / chop
  else if (kind === 3) pts = [[-2, -6], [10, -8], [15, -6], [14, -1], [9, 1], [15, 3], [13, 7], [4, 7.5], [-2, 6]]; // grab claw
  else pts = [[-2, -6], [11, -6], [15, -2], [14, 3], [8, 6.5], [-2, 6]]; // open
  shape(ctx, pts, glove || col, shd, ink, 3);
  if (kind === 1) { ctx.beginPath(); ctx.moveTo(8.5, -5); ctx.quadraticCurveTo(10, 0, 8.5, 5); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.55; ctx.stroke(); }
  ctx.restore();
}
function foot(ctx, kn, an, L, toe, col, shd, ink, accent) {
  const shin = Math.atan2(an[1] - kn[1], an[0] - kn[0]);
  let a = shin + Math.PI / 2; // perpendicular to the shin, toes forward
  if (an[1] < 9) a = (toe || 0) * D2R; // planted: flat on the floor
  else a += (toe || 0) * D2R;
  ctx.save(); ctx.translate(an[0], an[1]); ctx.rotate(a);
  const l = L.foot;
  const pts = [[-7, 2], [-7, -5.5], [l * 0.55, -5.5], [l, -4], [l + 1, 0.5], [l * 0.6, 5], [-2, 7]];
  shape(ctx, pts, col, shd, ink, 3);
  if (accent) { ctx.beginPath(); ctx.moveTo(-6, -2.6); ctx.lineTo(l * 0.9, -2.6); ctx.strokeStyle = accent; ctx.lineWidth = LW * 0.9; ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- secondary motion (scarves, coat tails, ponytails)
export function chain(n, len) { return { n, len, p: [], init: false }; }
export function stepChain(ch, ax, ay, dirx, gravity, wind, dt) {
  if (!ch.init) { for (let i = 0; i < ch.n; i++) ch.p.push([ax - dirx * i * ch.len, ay - i * 2, ax - dirx * i * ch.len, ay - i * 2]); ch.init = true; }
  ch.p[0][0] = ax; ch.p[0][1] = ay; ch.p[0][2] = ax; ch.p[0][3] = ay;
  const k = Math.min(2, dt * 60);
  for (let i = 1; i < ch.n; i++) {
    const q = ch.p[i]; const vx = (q[0] - q[2]) * 0.9, vy = (q[1] - q[3]) * 0.9;
    q[2] = q[0]; q[3] = q[1]; q[0] += vx + wind * k; q[1] += vy + gravity * k;
  }
  for (let it = 0; it < 3; it++) for (let i = 1; i < ch.n; i++) {
    const a = ch.p[i - 1], b = ch.p[i]; const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 0.001;
    const r = (d - ch.len) / d; if (i === 1) { b[0] -= dx * r; b[1] -= dy * r; } else { a[0] += dx * r * 0.5; a[1] += dy * r * 0.5; b[0] -= dx * r * 0.5; b[1] -= dy * r * 0.5; }
  }
}
function ribbon(ctx, pts, w0, w1, col, shd, ink) {
  if (pts.length < 2) return;
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; const w = w0 + (w1 - w0) * (i / (pts.length - 1));
    L.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]); R.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]);
  }
  const all = L.concat(R.reverse());
  ctx.beginPath(); all.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (shd) { ctx.save(); ctx.clip(); ctx.beginPath(); R.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); pts.slice().reverse().forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = shd; ctx.fill(); ctx.restore(); ctx.beginPath(); all.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
  ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.9; ctx.lineJoin = 'round'; ctx.stroke();
}

// ---------------------------------------------------------------- torso and head
function torso(ctx, L, J, col, shd, ink) {
  const [hx, hy] = J.hip, [nx, ny] = J.neck;
  const ux = (nx - hx) / L.torso, uy = (ny - hy) / L.torso, fx = uy, fy = -ux;
  const c = L.chest / 2, w = L.waist / 2;
  const P = (t, s) => [hx + ux * L.torso * t + fx * s, hy + uy * L.torso * t + fy * s];
  const pts = [P(-0.06, -w), P(-0.06, w * 1.05), P(0.42, w * 1.0), P(0.74, c * 1.12), P(0.98, c * 0.7), P(1.02, -c * 0.35), P(0.8, -c * 0.95), P(0.4, -w * 1.02)];
  shape(ctx, pts, col, shd, ink, 6);
  return { P, ux, uy, fx, fy };
}
function headShape(ctx, L, J, look, id, t) {
  const r = L.head * 1.16; const [x, y] = J.head; const a = J.headA;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-a);
  const skin = L.skin, skinD = shadeOf(L.skin);
  const ink = L.ink;
  // back hair layers first
  if (id === 'sayo') { /* ponytail drawn by chain */ }
  // skull + jaw
  const pts = [[-r * 0.95, r * 0.1], [-r * 0.7, r * 0.85], [0, r * 1.08], [r * 0.75, r * 0.8], [r * 1.0, r * 0.12], [r * 0.98, -r * 0.35], [r * 0.6, -r * 0.92], [r * 0.05, -r * 1.06], [-r * 0.5, -r * 0.8]];
  shape(ctx, pts, skin, skinD, ink, 4);
  // ear
  ctx.beginPath(); ctx.ellipse(-r * 0.12, -r * 0.05, r * 0.2, r * 0.27, 0, 0, Math.PI * 2); ctx.fillStyle = skinD; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.6; ctx.stroke();
  const eye = (ex, ey, angry) => {
    ctx.beginPath(); ctx.moveTo(ex - r * 0.18, ey + r * 0.05); ctx.lineTo(ex + r * 0.2, ey - r * 0.02); ctx.lineTo(ex + r * 0.17, ey - r * 0.13); ctx.closePath();
    ctx.fillStyle = '#f7f4ee'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex + r * 0.08, ey - r * 0.04, r * 0.06, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
    ctx.beginPath(); ctx.moveTo(ex - r * 0.25, ey + r * (angry ? 0.18 : 0.22)); ctx.lineTo(ex + r * 0.28, ey + r * (angry ? 0.12 : 0.2)); ctx.lineWidth = LW * 0.85; ctx.stroke();
  };
  const st = look.state || '';
  const hurt = st === 'hit' || st === 'juggle' || st === 'ko' || st === 'dead' || st === 'held';
  if (id === 'rin') {
    // short spiky bob, headband, goggles up on the forehead
    shape(ctx, [[-r * 1.05, r * 0.05], [-r * 1.25, r * 0.55], [-r * 0.9, r * 0.75], [-r * 1.35, r * 1.0], [-r * 0.6, r * 1.12], [-r * 0.1, r * 1.28], [r * 0.55, r * 1.1], [r * 1.02, r * 0.62], [r * 0.6, r * 0.46], [-r * 0.2, r * 0.42], [-r * 0.5, -r * 0.2]], L.hair, '#000', ink, 3);
    ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 0.5); ctx.quadraticCurveTo(0, r * 0.78, r * 1.0, r * 0.48); ctx.strokeStyle = L.accent; ctx.lineWidth = LW * 1.6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(r * 0.55, r * 0.78, r * 0.32, r * 0.22, -0.2, 0, Math.PI * 2); ctx.fillStyle = '#20232f'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.7; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(r * 0.62, r * 0.8, r * 0.16, r * 0.1, -0.2, 0, Math.PI * 2); ctx.fillStyle = L.accent; ctx.fill();
    if (!hurt) eye(r * 0.6, r * 0.1, 1); else hurtEye(ctx, r, ink);
    mouth(ctx, r, ink, hurt, look.win);
  } else if (id === 'ganji') {
    // shaved head with stubble shading, beard, sunglasses
    ctx.save(); smooth(ctx, pts); ctx.clip(); ctx.beginPath(); ctx.ellipse(-r * 0.15, r * 0.75, r * 1.0, r * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(40,25,20,0.35)'; ctx.fill(); ctx.restore();
    shape(ctx, [[r * 0.1, -r * 0.35], [r * 0.95, -r * 0.3], [r * 0.9, -r * 0.75], [r * 0.4, -r * 1.12], [-r * 0.2, -r * 1.0], [-r * 0.45, -r * 0.5]], L.hair, null, ink);
    ctx.beginPath(); ctx.moveTo(r * 0.1, r * 0.22); ctx.lineTo(r * 1.06, r * 0.2); ctx.lineTo(r * 1.0, -r * 0.05); ctx.lineTo(r * 0.3, -r * 0.08); ctx.closePath(); ctx.fillStyle = '#0d0d12'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.55, r * 0.15); ctx.lineTo(r * 0.85, r * 0.13); ctx.strokeStyle = L.accent; ctx.lineWidth = LW * 0.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.2); ctx.lineTo(r * 0.1, r * 0.2); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.6; ctx.stroke();
    if (hurt) { ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.62); ctx.lineTo(r * 0.85, -r * 0.55); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.8; ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.6); ctx.quadraticCurveTo(r * 0.7, -r * 0.68, r * 0.9, -r * 0.55); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.7; ctx.stroke(); }
  } else if (id === 'suzu') {
    // navy bob with a long fringe, glowing visor
    shape(ctx, [[-r * 1.05, -r * 0.6], [-r * 1.2, r * 0.3], [-r * 0.8, r * 1.0], [r * 0.1, r * 1.22], [r * 0.85, r * 0.95], [r * 1.12, r * 0.4], [r * 0.95, r * 0.18], [r * 0.4, r * 0.55], [-r * 0.3, r * 0.3], [-r * 0.6, -r * 0.35], [-r * 0.75, -r * 0.85]], L.hair, '#151b2b', ink, 3);
    ctx.beginPath(); ctx.moveTo(r * 0.0, r * 0.2); ctx.lineTo(r * 1.12, r * 0.22); ctx.lineTo(r * 1.08, -r * 0.12); ctx.lineTo(r * 0.05, -r * 0.08); ctx.closePath();
    ctx.fillStyle = '#071a22'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.7; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.2, r * 0.08); ctx.lineTo(r * 1.04, r * 0.09); ctx.strokeStyle = hurt ? '#ff4d6d' : L.accent; ctx.lineWidth = LW * 1.1; ctx.stroke();
    mouth(ctx, r, ink, hurt, look.win);
  } else if (id === 'sayo') {
    // sleek black hair, high tie, fringe; a thin magenta mark under the eye
    shape(ctx, [[-r * 1.02, -r * 0.4], [-r * 1.08, r * 0.45], [-r * 0.55, r * 1.12], [r * 0.25, r * 1.18], [r * 0.95, r * 0.75], [r * 1.05, r * 0.25], [r * 0.7, r * 0.45], [r * 0.15, r * 0.62], [-r * 0.45, r * 0.05], [-r * 0.6, -r * 0.6]], L.hair, '#000', ink, 3);
    ctx.beginPath(); ctx.arc(-r * 0.55, r * 0.95, r * 0.22, 0, Math.PI * 2); ctx.fillStyle = L.accent; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.6; ctx.stroke();
    if (!hurt) eye(r * 0.6, r * 0.12, 0); else hurtEye(ctx, r, ink);
    ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.12); ctx.lineTo(r * 0.75, -r * 0.18); ctx.strokeStyle = L.accent; ctx.lineWidth = LW * 0.7; ctx.stroke();
    mouth(ctx, r, ink, hurt, look.win);
  }
  ctx.save(); RIMA *= 0.45; rimShape(ctx, pts); RIMA /= 0.45; ctx.restore();
  ctx.restore();
}
function hurtEye(ctx, r, ink) { ctx.beginPath(); ctx.moveTo(r * 0.42, r * 0.22); ctx.lineTo(r * 0.78, r * 0.0); ctx.moveTo(r * 0.42, -r * 0.02); ctx.lineTo(r * 0.78, r * 0.2); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.7; ctx.stroke(); }
function mouth(ctx, r, ink, hurt, win) {
  ctx.beginPath();
  if (hurt) { ctx.ellipse(r * 0.72, -r * 0.55, r * 0.14, r * 0.17, 0, 0, Math.PI * 2); ctx.fillStyle = '#3a0d14'; ctx.fill(); }
  else if (win) { ctx.moveTo(r * 0.5, -r * 0.5); ctx.quadraticCurveTo(r * 0.75, -r * 0.62, r * 0.92, -r * 0.45); }
  else { ctx.moveTo(r * 0.55, -r * 0.55); ctx.lineTo(r * 0.88, -r * 0.52); }
  ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.6; ctx.stroke();
}

const shadeCache = {};
export function shadeOf(hex, k = 0.62, tint = [40, 20, 70]) {
  const key = hex + k; if (shadeCache[key]) return shadeCache[key];
  const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c, t) => Math.round(c * k + t * (1 - k) * 0.5);
  return (shadeCache[key] = `rgb(${m(r, tint[0])},${m(g, tint[1])},${m(b, tint[2])})`);
}

// ---------------------------------------------------------------- per-fighter draw
// ctx is already transformed to fighter-local space (x forward, y up). opts: {light:[x,y] local, rim, rimDir, lw, state, win, chains, flash, t}
export function drawSilhouette(ctx, id, p, col, chains) {
  const L = LOOKS[id]; const J = solve(L, p);
  ctx.save();
  if (p.rot) { ctx.translate(p.hip[0], p.hip[1]); ctx.rotate(p.rot * D2R); ctx.translate(-p.hip[0], -p.hip[1]); }
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = (a, b, w) => { ctx.lineWidth = w * 2 * THICK; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  const big = id === 'ganji' ? 1.35 : 1;
  seg(J.hpF, J.knF, 9 * big); seg(J.knF, J.ftF, 7 * big); seg(J.hpN, J.knN, 9 * big); seg(J.knN, J.ftN, 7 * big);
  seg(J.shF, J.elF, 7 * big); seg(J.elF, J.haF, 6 * big); seg(J.shN, J.elN, 7 * big); seg(J.elN, J.haN, 6 * big);
  seg(J.hip, J.neck, L.chest * 0.42); seg(J.neck, J.head, 5);
  ctx.beginPath(); ctx.arc(J.head[0], J.head[1], L.head * 1.12, 0, 7); ctx.fill();
  for (const [h, e] of [[J.haN, J.elN], [J.haF, J.elF]]) { ctx.beginPath(); ctx.arc(h[0] + (h[0] - e[0]) * 0.15, h[1] + (h[1] - e[1]) * 0.15, 8 * L.hand, 0, 7); ctx.fill(); }
  for (const f of [J.ftN, J.ftF]) { ctx.beginPath(); ctx.ellipse(f[0] + 6, f[1] - 1, L.foot * 0.6, 6, 0, 0, 7); ctx.fill(); }
  if (id === 'sayo') { seg(J.hpN, J.knN, 12); seg(J.knN, J.ftN, 13); seg(J.hpF, J.knF, 12); seg(J.knF, J.ftF, 13); }
  if (chains) for (const k in chains) { const c = chains[k]; if (!c || c.length < 2) continue; ctx.lineWidth = 6; ctx.beginPath(); c.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); }
  ctx.restore();
}
export function drawFighter(ctx, id, p, opts) {
  const L = opts.alt ? altLook(id) : LOOKS[id];
  LW = opts.lw || 2.6; LIGHT = opts.light || [0.5, 0.85]; RIM = opts.rim || '#00f0ff'; RIMDIR = opts.rimDir || 1; RIMA = opts.rimA == null ? 0.9 : opts.rimA;
  const J = solve(L, p);
  const ink = L.ink;
  ctx.save();
  if (p.rot) { ctx.translate(p.hip[0], p.hip[1]); ctx.rotate(p.rot * D2R); ctx.translate(-p.hip[0], -p.hip[1]); }
  if (p.sq && p.sq !== 1) { ctx.translate(0, 0); ctx.scale(1 / Math.sqrt(p.sq), p.sq); }
  const skin = L.skin, skinD = shadeOf(L.skin);
  const look = { state: opts.state, win: opts.win };
  const far = (c) => shadeOf(c, 0.78, [20, 10, 40]);
  const ch = opts.chains || {};
  // ---------- back layer: far arm, far leg, back accessories
  const sleeveF = id === 'ganji' ? L.main : id === 'suzu' ? L.main : id === 'rin' ? L.main : L.dark;
  const glove = id === 'suzu' ? L.light : null;
  // chains behind the body (scarf, ponytail, coat tails)
  if (id === 'sayo' && ch.scarf) ribbon(ctx, ch.scarf, 4.5, 2.2, L.accent, shadeOf(L.accent), ink);
  if (id === 'sayo' && ch.tail) ribbon(ctx, ch.tail, 4, 1.2, L.hair, '#000', ink);
  if (id === 'suzu' && ch.coat) ribbon(ctx, ch.coat, 9, 6, far(L.main), L.mainD, ink);
  if (id === 'ganji' && ch.coat) ribbon(ctx, ch.coat, 8, 5, far(L.main), L.mainD, ink);
  if (id === 'rin' && ch.tail) ribbon(ctx, ch.tail, 3.2, 1, L.hair, '#000', ink);
  // far leg
  legDraw(ctx, id, L, J.hpF, J.knF, J.ftF, p.toeF, true, ink);
  // far arm
  armDraw(ctx, id, L, J.shF, J.elF, J.haF, p.handF, true, ink, glove);
  // backpack / bag
  if (id === 'rin') { const t = J; const bx = t.chest[0] - Math.cos(-0) * 0, by = t.chest[1]; const ux = (J.neck[0] - J.hip[0]) / L.torso, uy = (J.neck[1] - J.hip[1]) / L.torso; const fx = uy, fy = -ux; const P = (a, s) => [J.hip[0] + ux * L.torso * a + fx * s, J.hip[1] + uy * L.torso * a + fy * s]; shape(ctx, [P(0.2, -10), P(0.25, -22), P(0.75, -24), P(0.85, -12)], '#2b2c36', '#16161d', ink, 4); }
  if (id === 'suzu') { const ux = (J.neck[0] - J.hip[0]) / L.torso, uy = (J.neck[1] - J.hip[1]) / L.torso; const fx = uy, fy = -ux; const P = (a, s) => [J.hip[0] + ux * L.torso * a + fx * s, J.hip[1] + uy * L.torso * a + fy * s]; shape(ctx, [P(0.45, -8), P(0.5, -18), P(0.95, -17), P(1.0, -8)], '#263445', '#141c26', ink, 3); ctx.beginPath(); const a1 = P(0.98, -14), a2 = P(1.45, -20); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.8; ctx.stroke(); ctx.beginPath(); ctx.arc(a2[0], a2[1], 2.4, 0, 7); ctx.fillStyle = L.accent; ctx.fill(); }
  // ---------- body
  const tcol = id === 'rin' ? L.main : id === 'ganji' ? L.main : id === 'suzu' ? L.main : L.dark;
  const tshd = id === 'rin' ? L.mainD : id === 'ganji' ? L.mainD : id === 'suzu' ? L.mainD : L.darkD;
  // pelvis / hips (trousers)
  const pel = id === 'sayo' ? L.main : L.dark, pelD = id === 'sayo' ? L.mainD : L.darkD;
  ctx.beginPath(); ctx.ellipse(J.hip[0], J.hip[1] - 2, L.waist * 0.62, 9, 0, 0, Math.PI * 2); ctx.fillStyle = pel; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke();
  const T = torso(ctx, L, J, tcol, tshd, ink);
  costume(ctx, id, L, J, T, ink, opts);
  // ---------- front layer: near leg, head, near arm
  legDraw(ctx, id, L, J.hpN, J.knN, J.ftN, p.toeN, false, ink);
  // neck
  limb(ctx, [J.neck[0] - (J.neck[0] - J.hip[0]) * 0.05, J.neck[1] - 3], [J.head[0] - (J.head[0] - J.neck[0]) * 0.4, J.head[1] - (J.head[1] - J.neck[1]) * 0.4], id === 'ganji' ? 7.5 : 4.6, id === 'ganji' ? 7 : 4.2, skin, skinD, ink);
  if (id === 'suzu') { ctx.beginPath(); ctx.moveTo(J.neck[0] - 7, J.neck[1] - 4); ctx.quadraticCurveTo(J.neck[0], J.neck[1] + 6, J.neck[0] + 8, J.neck[1] - 3); ctx.lineTo(J.neck[0] + 6, J.neck[1] - 9); ctx.lineTo(J.neck[0] - 6, J.neck[1] - 9); ctx.closePath(); ctx.fillStyle = L.main; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke(); }
  headShape(ctx, L, J, look, id, opts.t || 0);
  if (id === 'sayo' && ch.scarfFront) ribbon(ctx, ch.scarfFront, 4.5, 3.5, L.accent, shadeOf(L.accent), ink);
  armDraw(ctx, id, L, J.shN, J.elN, J.haN, p.handN, false, ink, glove);
  ctx.restore();
  return J;
}

function legDraw(ctx, id, L, hp, kn, ft, toe, isFar, ink) {
  const f = (c) => (isFar ? shadeOf(c, 0.78, [20, 10, 40]) : c);
  const shoeCol = f(L.shoe), shoeD = shadeOf(L.shoe);
  if (id === 'sayo') {
    // hakama: wide flared trouser leg
    const flare = (a, b, ra, rb) => limb(ctx, a, b, ra, rb, f(L.main), L.mainD, ink);
    flare(hp, kn, 11, 12.5); flare(kn, [ft[0] + (kn[0] - ft[0]) * 0.18, ft[1] + (kn[1] - ft[1]) * 0.18 + 2], 12.5, 13.5);
    foot(ctx, kn, ft, L, toe, shoeCol, shoeD, ink);
    ctx.beginPath(); ctx.moveTo(ft[0] - 2, ft[1] - 1); ctx.lineTo(ft[0] + L.foot * 0.55, ft[1] - 1);
    return;
  }
  const leg = id === 'rin' ? L.dark : L.dark;
  const legD = L.darkD;
  if (id === 'rin') { limb(ctx, hp, kn, 10, 7.5, f(leg), legD, ink); limb(ctx, kn, ft, 7.5, 5.2, f('#2b2e40'), '#151722', ink); }
  else if (id === 'ganji') { limb(ctx, hp, kn, 13, 11, f(leg), legD, ink); limb(ctx, kn, ft, 11, 9, f(leg), legD, ink); }
  else { limb(ctx, hp, kn, 9.5, 7.5, f(leg), legD, ink); limb(ctx, kn, ft, 7.5, 6.5, f(L.shoe), shoeD, ink); }
  foot(ctx, kn, ft, L, toe, shoeCol, shoeD, ink, id === 'rin' ? (isFar ? '#7da61e' : L.accent) : id === 'suzu' ? L.accent : null);
}
function armDraw(ctx, id, L, sh, el, ha, kind, isFar, ink, glove) {
  const f = (c) => (isFar ? shadeOf(c, 0.78, [20, 10, 40]) : c);
  const skin = f(L.skin), skinD = shadeOf(L.skin);
  if (id === 'ganji' && !isFar) {
    // hydraulic prosthetic arm: steel segments with glowing joints
    limb(ctx, sh, el, 11, 9.5, L.metal, L.metalD, ink);
    limb(ctx, el, ha, 9.5, 8.5, L.metal, L.metalD, ink);
    for (const j of [sh, el]) { ctx.beginPath(); ctx.arc(j[0], j[1], 4.2, 0, 7); ctx.fillStyle = L.accent; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.7; ctx.stroke(); }
    const mx = (el[0] + ha[0]) / 2, my = (el[1] + ha[1]) / 2; ctx.beginPath(); ctx.moveTo(el[0], el[1]); ctx.lineTo(mx, my); ctx.strokeStyle = 'rgba(255,90,31,0.8)'; ctx.lineWidth = LW * 0.8; ctx.stroke();
    hand(ctx, ha, el, kind, L.hand, L.metal, L.metalD, ink);
    return;
  }
  if (id === 'ganji') { limb(ctx, sh, el, 12, 10, f(L.main), L.mainD, ink); limb(ctx, el, ha, 10, 8, f(L.main), L.mainD, ink); hand(ctx, ha, el, kind, L.hand, skin, skinD, ink); return; }
  if (id === 'rin') { limb(ctx, sh, el, 7.2, 6, f(L.main), L.mainD, ink); limb(ctx, el, ha, 5.4, 4.4, skin, skinD, ink); hand(ctx, ha, el, kind, L.hand, f('#20222c'), '#111', ink); return; }
  if (id === 'suzu') { limb(ctx, sh, el, 7.2, 6.4, f(L.main), L.mainD, ink); limb(ctx, el, ha, 6.4, 5.4, f(L.main), L.mainD, ink); const cx = el[0] + (ha[0] - el[0]) * 0.8, cy = el[1] + (ha[1] - el[1]) * 0.8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ha[0], ha[1]); ctx.strokeStyle = L.accent; ctx.lineWidth = LW * 0.9; ctx.stroke(); hand(ctx, ha, el, kind, L.hand, skin, skinD, ink, f(L.light)); return; }
  // sayo: bare arms with tape wraps
  limb(ctx, sh, el, 6.2, 5.2, skin, skinD, ink); limb(ctx, el, ha, 5.2, 4.3, skin, skinD, ink);
  for (let i = 1; i <= 3; i++) { const t = 0.45 + i * 0.13; const x = el[0] + (ha[0] - el[0]) * t, y = el[1] + (ha[1] - el[1]) * t; const dx = ha[0] - el[0], dy = ha[1] - el[1], d = Math.hypot(dx, dy) || 1; ctx.beginPath(); ctx.moveTo(x - dy / d * 4.6, y + dx / d * 4.6); ctx.lineTo(x + dy / d * 4.6 + dx / d * 2, y - dx / d * 4.6 + dy / d * 2); ctx.strokeStyle = f(L.wrap); ctx.lineWidth = LW * 0.9; ctx.stroke(); }
  hand(ctx, ha, el, kind, L.hand, skin, skinD, ink);
}

function costume(ctx, id, L, J, T, ink, opts) {
  const { P } = T;
  if (id === 'rin') {
    // cropped courier jacket: reflective band, collar, dark under-shirt at the waist, bag strap across the chest
    poly(ctx, [P(-0.06, -L.waist / 2), P(-0.06, L.waist / 2 * 1.05), P(0.26, L.waist / 2), P(0.26, -L.waist / 2)], L.dark, null);
    ctx.beginPath(); const a = P(0.5, -L.chest * 0.45), b = P(0.52, L.chest * 0.5); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = '#eef6d0'; ctx.lineWidth = LW * 1.6; ctx.stroke(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.4; ctx.stroke();
    ctx.beginPath(); const s1 = P(1.0, -L.chest * 0.3), s2 = P(0.28, L.chest * 0.5); ctx.moveTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]); ctx.strokeStyle = '#25262f'; ctx.lineWidth = LW * 2; ctx.stroke(); ctx.strokeStyle = ink; ctx.lineWidth = LW * 0.4; ctx.stroke();
    const n1 = P(0.97, -L.chest * 0.35), n2 = P(1.06, L.chest * 0.3); ctx.beginPath(); ctx.moveTo(n1[0], n1[1]); ctx.lineTo(n2[0], n2[1]); ctx.strokeStyle = L.mainD; ctx.lineWidth = LW * 2.2; ctx.stroke();
  } else if (id === 'ganji') {
    // open suit jacket over a white shirt, orange tie
    const sh = [P(0.12, L.waist * 0.05), P(0.98, L.chest * 0.05), P(0.96, L.chest * 0.42), P(0.55, L.chest * 0.5), P(0.12, L.waist * 0.5)];
    poly(ctx, sh, L.shirt, null);
    poly(ctx, [P(0.95, L.chest * 0.22), P(0.9, L.chest * 0.34), P(0.35, L.chest * 0.34), P(0.25, L.chest * 0.25), P(0.35, L.chest * 0.18)], L.accent, null);
    ctx.beginPath(); const l1 = P(1.0, L.chest * 0.0), l2 = P(0.6, L.chest * 0.18), l3 = P(0.1, L.waist * 0.22); ctx.moveTo(l1[0], l1[1]); ctx.lineTo(l2[0], l2[1]); ctx.lineTo(l3[0], l3[1]); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke();
    ctx.beginPath(); const b1 = P(-0.05, -L.waist * 0.5), b2 = P(-0.05, L.waist * 0.55); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.strokeStyle = '#000'; ctx.lineWidth = LW * 1.6; ctx.stroke();
  } else if (id === 'suzu') {
    // long coat front panel with cyan trim and a light inner suit
    poly(ctx, [P(0.0, L.waist * 0.1), P(0.95, L.chest * 0.1), P(0.93, L.chest * 0.48), P(0.5, L.chest * 0.52), P(0.0, L.waist * 0.52)], L.light, null);
    ctx.beginPath(); const c1 = P(1.0, L.chest * 0.08), c2 = P(-0.3, L.waist * 0.28); ctx.moveTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.strokeStyle = L.accent; ctx.lineWidth = LW * 1.1; ctx.stroke();
    ctx.beginPath(); const w1 = P(0.15, -L.waist * 0.52), w2 = P(0.15, L.waist * 0.55); ctx.moveTo(w1[0], w1[1]); ctx.lineTo(w2[0], w2[1]); ctx.strokeStyle = '#0b1118'; ctx.lineWidth = LW * 1.8; ctx.stroke();
  } else if (id === 'sayo') {
    // crossed wrap top and a magenta sash; hakama top band
    poly(ctx, [P(-0.08, -L.waist * 0.55), P(-0.08, L.waist * 0.58), P(0.18, L.waist * 0.56), P(0.18, -L.waist * 0.55)], L.accent, null);
    ctx.beginPath(); const x1 = P(1.0, L.chest * 0.25), x2 = P(0.25, -L.waist * 0.2); ctx.moveTo(x1[0], x1[1]); ctx.lineTo(x2[0], x2[1]); ctx.strokeStyle = '#2c1d36'; ctx.lineWidth = LW * 1.4; ctx.stroke();
    ctx.beginPath(); const y1 = P(0.98, -L.chest * 0.25), y2 = P(0.3, L.waist * 0.45); ctx.moveTo(y1[0], y1[1]); ctx.lineTo(y2[0], y2[1]); ctx.strokeStyle = '#3a2747'; ctx.lineWidth = LW * 1.2; ctx.stroke();
  }
}
