// KAZE figures, drawn like brush-and-ink manga: a hidden skeleton (hip, torso, head, two-bone IK arms and legs)
// carries a few SOLID painted masses (hakama as one shape, kimono, sleeves, head, hands, feet), each with a flat wash,
// dry-brush grain, a darker pooled edge and one outline that swells and tapers like a loaded brush.
// The outline boils 12 times a second with a per-figure seed. Poses are numbers that tween with easing; the grip moves
// on arcs around the shoulder; cloth, hair and cords lag the body on springs.
import { INK, rgba, mix, ribbon, drop, clamp, lerp, hash, makeCanvas, rng } from './brush.js';
import { ATK } from './data.js';

const E = { out: (t) => 1 - (1 - t) * (1 - t), inout: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)), back: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2) };
// a pose: hip offset, lean, head tilt, feet, grip (relative to hip), sword angle (0 = forward, -PI/2 = up)
const mk = (o) => Object.assign({ hx: 0, hy: -49, lean: 0.06, head: 0, ff: [12, 0], fb: [-14, 0], grip: [16, -52], sw: -0.75, kneel: 0, roll: 0, sheath: 0, open: 0 }, o);
export const POSE = {
  stand: mk({ grip: [8, -50], sw: 0.9, sheath: 1, ff: [6, 0], fb: [-8, 0], hy: -51, lean: 0.03 }),
  guard: mk({ grip: [20, -58], sw: -0.62, lean: 0.14, head: 0.1, ff: [18, 0], fb: [-24, 0], hy: -46 }),
  parry: mk({ grip: [19, -70], sw: -1.45, lean: -0.1, head: -0.1, ff: [18, 0], fb: [-20, 0], hy: -44 }),
  s1w: mk({ grip: [-8, -94], sw: -2.6, lean: -0.22, ff: [16, 0], fb: [-22, 0], hy: -46 }), s1a: mk({ grip: [42, -44], sw: 0.6, lean: 0.55, head: 0.25, ff: [40, 0], fb: [-34, 0], hy: -38 }),
  s2w: mk({ grip: [16, -34], sw: 0.95, lean: 0.32, hy: -42, ff: [22, 0], fb: [-18, 0] }), s2a: mk({ grip: [28, -92], sw: -1.3, lean: -0.08, ff: [24, 0], fb: [-14, 0], hy: -47 }),
  s3w: mk({ grip: [-12, -92], sw: -2.9, lean: -0.2, ff: [16, 0], fb: [-22, 0] }), s3a: mk({ grip: [46, -40], sw: 0.72, lean: 0.62, head: 0.3, ff: [46, 0], fb: [-38, 0], hy: -34 }),
  hw: mk({ grip: [-4, -100], sw: -1.95, lean: -0.15, ff: [16, 0], fb: [-18, 0] }), ha: mk({ grip: [42, -34], sw: 1.0, lean: 0.65, head: 0.3, ff: [44, 0], fb: [-38, 0], hy: -33 }),
  thw: mk({ grip: [-8, -60], sw: 0.02, lean: -0.05, ff: [14, 0], fb: [-18, 0] }), tha: mk({ grip: [44, -58], sw: 0.02, lean: 0.5, head: 0.2, ff: [42, 0], fb: [-36, 0], hy: -38 }),
  swpw: mk({ grip: [-12, -40], sw: 2.7, lean: 0.25, ff: [16, 0], fb: [-20, 0], hy: -40 }), swpa: mk({ grip: [34, -30], sw: 0.25, lean: 0.4, ff: [30, 0], fb: [-22, 0], hy: -34 }),
  hit: mk({ grip: [8, -52], sw: -0.3, lean: -0.42, ff: [16, 0], fb: [-10, 0], hy: -47, head: -0.3 }),
  stun: mk({ grip: [4, -50], sw: 0.2, lean: -0.3, head: -0.2 }),
  opened: mk({ grip: [-6, -92], sw: -2.2, lean: -0.5, head: -0.45, ff: [18, 0], fb: [-6, 0], hy: -47, open: 1 }),
  dodge: mk({ hy: -22, lean: 1.2, head: 0.5, ff: [14, -6], fb: [-6, -4], grip: [16, -22], sw: 0.25 }),
  bow: mk({ grip: [8, -50], sw: 0.9, sheath: 1, lean: 0.95, head: 0.3, ff: [6, 0], fb: [-6, 0], hy: -49 }),
  sit: mk({ grip: [10, -24], sw: 0.9, sheath: 1, lean: 0.05, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  kneel: mk({ grip: [24, -6], sw: 0.0, sheath: 0, lean: 0.25, head: 0.35, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  focus: mk({ grip: [8, -42], sw: 0.95, sheath: 1, lean: 0.5, ff: [30, 0], fb: [-34, 0], hy: -32, head: 0.15 }),
  iai: mk({ grip: [50, -60], sw: 0.04, lean: 0.6, head: 0.2, ff: [46, 0], fb: [-40, 0], hy: -30 }),
  heal: mk({ grip: [10, -40], sw: 0.9, sheath: 1, lean: 0.25, hy: -30, head: 0.35, kneel: 1, ff: [-10, 0], fb: [-14, 0] }),
  dead: mk({ grip: [10, -8], sw: 0.1, lean: -1.45, head: -0.3, hy: -12, ff: [24, 0], fb: [18, 0] }),
  // bow (archer)
  // guard stances as shape language: each cast member holds the sword its own way
  hasso: mk({ grip: [6, -84], sw: -1.95, lean: 0.12, ff: [22, 0], fb: [-26, 0], hy: -42 }),
  waki: mk({ grip: [-8, -42], sw: 2.75, lean: 0.24, head: 0.15, ff: [22, 0], fb: [-24, 0], hy: -43 }),
  jodan: mk({ grip: [8, -104], sw: -1.35, lean: -0.05, ff: [11, 0], fb: [-13, 0], hy: -50 }),
  iaigoshi: mk({ grip: [8, -48], sw: 0.95, sheath: 1, lean: 0.06, ff: [9, 0], fb: [-11, 0], hy: -50 }),
  bowg: mk({ grip: [24, -44], sw: -1.57, kneel: 1, hy: -27, lean: 0.05, ff: [-14, 0], fb: [-14, 0] }), boww: mk({ grip: [28, -48], sw: -1.57, kneel: 1, hy: -28, lean: -0.1, ff: [-14, 0], fb: [-14, 0] }),
  gedan: mk({ grip: [28, -38], sw: 0.45, lean: 0.22, head: 0.15, ff: [28, 0], fb: [-32, 0], hy: -39 }),
  // shield brute
  bashw: mk({ grip: [-8, -64], sw: -2.35, lean: 0.06, ff: [16, 0], fb: [-18, 0], hy: -47 }), basha: mk({ grip: [8, -56], sw: -1.0, lean: 0.4, ff: [30, 0], fb: [-24, 0], hy: -42 }),
};
const POSEK = Object.keys(POSE[`guard`]);
export function lerpPose(a, b, t, out = {}, snapFlags) {
  for (const k of POSEK) {
    const va = a[k], vb = b[k];
    if (k === 'grip') {
      // hands travel on an arc around the shoulder, not on a straight line
      const ax = va[0] - 2, ay = va[1] + 82, bx = vb[0] - 2, by = vb[1] + 82;
      const ra = Math.hypot(ax, ay), rb = Math.hypot(bx, by); let aa = Math.atan2(ay, ax), ab = Math.atan2(by, bx);
      while (ab - aa > Math.PI) ab -= Math.PI * 2; while (aa - ab > Math.PI) ab += Math.PI * 2;
      const r = lerp(ra, rb, t), an = lerp(aa, ab, t); out.grip = out.grip || [0, 0]; out.grip[0] = 2 + Math.cos(an) * r; out.grip[1] = -82 + Math.sin(an) * r;
    } else if (Array.isArray(va)) { out[k] = out[k] || [0, 0]; out[k][0] = lerp(va[0], vb[0], t); out[k][1] = lerp(va[1], vb[1], t); }
    else out[k] = k === 'sheath' || k === 'kneel' ? (snapFlags || t >= 0.5 ? vb : va) : lerp(va, vb, t);
  }
  return out;
}
const ATKPOSE = {
  cut: ['s1w', 's1a'], combo: ['s1w', 's1a'], cut2: ['s2w', 's2a'], flurry: ['s1w', 's1a'], flurry2: ['s2w', 's2a'], flurry3: ['s3w', 's3a'],
  thrust: ['thw', 'tha'], dthrust: ['thw', 'tha'], lunge: ['thw', 'tha'], rthrust: ['thw', 'tha'], sweep: ['swpw', 'swpa'], overhead: ['hw', 'ha'],
  shoot: ['boww', 'boww'], bash: ['bashw', 'basha'],
};
const GUARD = { ronin: 'guard', bandit: 'hasso', duelist: 'waki', master: 'iaigoshi', spear: 'thw', archer: 'bowg', brute: 'bashw', gonroku: 'gedan', shizu: 'jodan', ono: 'thw', hyoe: 'bashw' };
export const guardPose = (look) => POSE[GUARD[look] || 'guard'];

// Pose for a sim entity. fig is the persistent render-side record (keeps the previous pose for blending).
export function poseFor(fig, e, kind, t, isPlayer, extra) {
  const P = POSE, gname = GUARD[kind] || 'guard';
  let a = P[gname], b = a, u = 0;
  const st = e.st, tt = e.stt;
  if (isPlayer) {
    const sl = [['s1w', 's1a'], ['s2w', 's2a'], ['s3w', 's3a']];
    const drawn = e.drawn;
    const base = drawn ? P.guard : P.stand;
    switch (st) {
      case 'slash': { const [w, ac] = sl[e.combo || 0], A = extra.slash[e.combo || 0]; if (tt < A.wind) { a = base; b = P[w]; u = E.out(tt / A.wind); } else if (tt < A.wind + A.act) { a = P[w]; b = P[ac]; u = E.out((tt - A.wind) / A.act); } else { a = P[ac]; b = P.guard; u = E.inout(clamp((tt - A.wind - A.act) / A.rec, 0, 1)); } break; }
      case 'heavy': case 'counter': { const A = extra[st]; if (tt < A.wind) { a = P.guard; b = P.hw; u = E.out(tt / A.wind); } else if (tt < A.wind + A.act) { a = P.hw; b = P.ha; u = E.out((tt - A.wind) / A.act); } else { a = P.ha; b = P.guard; u = E.inout(clamp((tt - A.wind - A.act) / A.rec, 0, 1)); } break; }
      case 'guard': a = P.guard; b = P.parry; u = E.out(clamp(tt / 0.07, 0, 1)); break;
      case 'dodge': a = P.dodge; b = P.dodge; break;
      case 'hit': a = P.hit; b = P.hit; break;
      case 'bow': a = P.stand; b = P.bow; u = Math.sin(clamp(tt / 1.2, 0, 1) * Math.PI); u = clamp(u * 1.6, 0, 1); break;
      case 'sit': a = P.stand; b = P.sit; u = E.inout(clamp(tt / 0.6, 0, 1)); break;
      case 'heal': a = base; b = P.heal; u = Math.sin(clamp(tt / 0.75, 0, 1) * Math.PI); break;
      case 'take': a = P.stand; b = P.bow; u = Math.sin(clamp(tt / 1.0, 0, 1) * Math.PI) * 0.6; break;
      case 'focus': a = P.focus; b = P.focus; break;
      case 'iai': a = P.focus; b = P.iai; u = E.out(clamp(tt / 0.12, 0, 1)); break;
      case 'kneel': a = P.stand; b = P.kneel; u = E.inout(clamp(tt / 1.2, 0, 1)); break;
      case 'dead': a = P.hit; b = P.dead; u = E.out(clamp(tt / 0.5, 0, 1)); break;
      default: a = base; b = base;
    }
  } else {
    const A = e.atk ? ATK[e.atk] : null, ap = e.atk ? ATKPOSE[e.atk] : null;
    const g = P[gname];
    switch (st) {
      case 'wind': { const w = P[ap[0]]; a = g; b = w; u = E.out(clamp(tt / (e.windT * 0.6), 0, 1)); if (e.feinting) u *= 0.55; break; }
      case 'act': a = P[ap[0]]; b = P[ap[1]]; u = E.out(clamp(tt / (A.act * 0.6), 0, 1)); break;
      case 'rec': a = P[ap[1]]; b = g; u = E.inout(clamp(tt / A.rec, 0, 1)); break;
      case 'stun': a = P.stun; b = P.stun; break;
      case 'stagger': a = P.hit; b = P.stun; u = clamp(tt / 0.6, 0, 1); break;
      case 'block': a = P.parry; b = P.parry; break;
      case 'opened': a = P.opened; b = g; u = E.inout(clamp((tt - 0.6) / 0.6, 0, 1)); break;
      case 'shift': a = P.focus; b = g; u = E.inout(clamp((tt - 0.9) / 0.6, 0, 1)); break;
      case 'dead': a = P.hit; b = P.dead; u = E.out(clamp(tt / 0.55, 0, 1)); break;
      default: a = g; b = g;
    }
    if (kind === 'brute' && (st === 'wind' || st === 'act' || st === 'rec') && e.atk === 'overhead') { /* club overhead uses hw/ha */ }
  }
  lerpPose(a, b, u, fig.target);
  // anticipation: a small dip and lean back at the start of every attack windup, then a held pose before the strike
  if (!isPlayer && st === 'wind') { const dip = Math.sin(Math.PI * clamp(tt / (e.windT * 0.4), 0, 1)); fig.target.hy += 5 * dip; fig.target.lean -= 0.14 * dip; }
  if (isPlayer && (st === 'heavy' || st === 'slash') && tt < 0.06) { fig.target.hy += 3; }
  // smooth any pose discontinuity (state changes) over ~70 ms
  if (!fig.pose.ff) lerpPose(fig.target, fig.target, 0, fig.pose);
  const k = fig.snap ? 1 : Math.min(1, extra.dt * 16);
  lerpPose(fig.pose, fig.target, k, fig.pose, true); fig.snap = false;
  return fig.pose;
}

// ---------------- drawing ----------------
// colour routing: FLATC paints a figure as one flat colour (rim light, the ink flash frame); SHADE darkens it toward
// a black silhouette when the duel sky turns red.
let FLATC = null, SHADE = 0; const SHC = new Map();
function cc(c) {
  if (FLATC) return FLATC;
  if (SHADE < 0.03 || typeof c !== 'string' || c[0] !== '#') return c;
  const q = Math.round(SHADE * 20), key = c + q; let v = SHC.get(key); if (!v) { v = mix(c, '#0b0605', q / 20); SHC.set(key, v); } return v;
}
const rib = (g, pts, wf, col, a, e) => ribbon(g, pts, wf, cc(col), a, e);
const dr = (g, x, y, r, col, a) => drop(g, x, y, r, cc(col), a);
// two-bone IK: from a toward target b with lengths l1, l2. bend: +1/-1 sets which side the joint goes.
function ik(ax, ay, bx, by, l1, l2, bend, out) {
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 0.001; const dd = Math.min(d, l1 + l2 - 0.01);
  const a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), base = Math.atan2(dy, dx);
  const an = base + a * bend; out[0] = ax + Math.cos(an) * l1; out[1] = ay + Math.sin(an) * l1;
  out[2] = ax + (dx / d) * dd; out[3] = ay + (dy / d) * dd; return out;
}
const PAPER = '#efe7d4', SKIN = '#e6dac2';
// The cast. kind: which pose set it uses. Colours are ink washes; one accent each. sc: size, bulk: width.
export const LOOKS = {
  ronin: { kind: 'ronin', sc: 1.18, bulk: 1, kim: '#1d1a17', hak: '#3f3a35', slv: '#25211d', skin: SKIN, hat: 'kasa', hatCol: '#6d604c', weapon: 'katana', hl: 1, scarf: 1 },
  bandit: { kind: 'bandit', sc: 1.1, bulk: 1.05, kim: '#655d55', hak: '#7f766b', slv: '#5a5249', skin: '#d6c3a3', hat: 'band', acc: '#8e3f2a', weapon: 'katana', hl: 0.7, shins: 1 },
  spear: { kind: 'spear', sc: 1.12, bulk: 1, kim: '#55575c', hak: '#727274', slv: '#4b4d52', skin: '#d9c8aa', hat: 'jingasa', acc: '#2f3d57', weapon: 'spear', hl: 0.82, armor: 1, shins: 1 },
  archer: { kind: 'archer', sc: 1.06, bulk: 0.92, kim: '#68664f', hak: '#86836b', slv: '#5e5c47', skin: '#d9c8aa', hat: 'hood', acc: '#56623f', weapon: 'bow', hl: 0.8, quiver: 1, shins: 1 },
  brute: { kind: 'brute', sc: 1.3, bulk: 1.45, kim: '#4e4036', hak: '#6a5b4f', slv: '#463a31', skin: '#c9ab88', hat: 'bald', acc: '#7a5634', weapon: 'club', shield: 1, hl: 0.85, shins: 1 },
  duelist: { kind: 'duelist', sc: 1.12, bulk: 0.95, kim: '#2c262b', hak: '#5a525c', slv: '#3b3039', skin: '#ddd0b8', hat: 'tail', acc: '#5a3a52', weapon: 'katana', hl: 1, coat: '#3e313c' },
  // bosses: each its own shape language
  gonroku: { kind: 'bandit', sc: 1.3, bulk: 1.55, kim: '#3f352d', hak: '#5f5145', slv: '#382f28', skin: '#cfb18c', hat: 'band', acc: '#8e3f2a', weapon: 'odachi', hl: 0.8, shins: 1, beard: 'dark' },
  ono: { kind: 'spear', sc: 1.42, bulk: 0.9, kim: '#46423b', hak: '#615c53', slv: '#3e3a34', skin: '#d6c4a4', hat: 'jingasa', hatW: 1.35, acc: '#3a3328', weapon: 'spear', hl: 0.86, mino: '#7a6948', shins: 1 },
  shizu: { kind: 'duelist', sc: 1.1, bulk: 0.78, kim: '#24212a', hak: '#77717d', slv: '#2f2b35', skin: '#e3d7c0', hat: 'longhair', weapon: 'katana', hl: 1.06, upright: 1 },
  hyoe: { kind: 'brute', sc: 1.27, bulk: 1.35, kim: '#3a3535', hak: '#57504d', slv: '#332f2f', skin: '#cdb593', hat: 'bald', weapon: 'club', shield: 1, acc: '#5a4a3a', hl: 0.86, lantern: 1, hunch: 0.3, shins: 1 },
  master: { kind: 'master', sc: 1.12, bulk: 0.82, kim: '#252220', hak: '#625d58', slv: '#2e2a27', skin: '#e2d6bf', hat: 'white', weapon: 'katana', hl: 1.04, coat: '#47433f', coatLong: 1, beard: 'white' },
};
export const BOSSLOOK = { gonroku: 'gonroku', ono: 'ono', shizu: 'shizu', hyoe: 'hyoe', sotetsu: 'master' };

// dry-brush grain: a small tile of streaks and flecks, laid inside every mass
let GRAIN = null;
function grain(g) {
  if (GRAIN || typeof document === 'undefined') return GRAIN;
  const c = makeCanvas(96, 96), q = c.getContext('2d'), R = rng(41); q.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const x = R() * 96, y = R() * 96, l = 6 + R() * 22, an = 1.35 + (R() - 0.5) * 0.4; q.strokeStyle = cc(`rgba(8,6,4,${0.06 + R() * 0.12})`); q.lineWidth = 0.5 + R() * 1.4; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); q.stroke(); }
  for (let i = 0; i < 45; i++) { const x = R() * 96, y = R() * 96, l = 3 + R() * 12, an = 1.35 + (R() - 0.5) * 0.5; q.strokeStyle = cc(`rgba(245,238,222,${0.06 + R() * 0.14})`); q.lineWidth = 0.4 + R() * 0.9; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); q.stroke(); }
  GRAIN = g.createPattern(c, 'repeat'); return GRAIN;
}
// boil: points wobble a little, re-seeded 12 times a second (frame n), different for every figure and part
function boil(P, seed, n, amp) {
  if (!amp) return P; const out = [];
  for (let i = 0; i < P.length; i++) out.push([P[i][0] + (hash(i * 7 + n * 131, seed) - 0.5) * amp, P[i][1] + (hash(i * 13 + n * 97, seed + 5) - 0.5) * amp]);
  return out;
}
// closed Catmull-Rom through the points, as a flat list of samples
function closedCurve(P, k = 3) {
  const n = P.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let j = 0; j < k; j++) { const u = j / k, u2 = u * u, u3 = u2 * u; out.push([
      0.5 * (2 * p1[0] + (p2[0] - p0[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * u3),
      0.5 * (2 * p1[1] + (p2[1] - p0[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * u3)]); }
  }
  return out;
}
function openCurve(P, k = 4) {
  if (P.length < 3) return P.slice(); const n = P.length, out = [];
  for (let i = 0; i < n - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    for (let j = 0; j < k; j++) { const u = j / k, u2 = u * u, u3 = u2 * u; out.push([0.5 * (2 * p1[0] + (p2[0] - p0[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * u3), 0.5 * (2 * p1[1] + (p2[1] - p0[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * u3)]); } }
  out.push(P[n - 1]); return out;
}
// a brush line along points: hair-thin at the ends, swelling where the brush is loaded
const FLAT = [];
export const LINESTATS = { on: false, list: [] };
export function brushLine(g, S, w, col, a, seed, o = {}) {
  const n = S.length; if (n < 2) return; FLAT.length = 0; for (const q of S) FLAT.push(q[0], q[1]);
  const t0 = o.t0 ?? 0.08, sw = o.swell ?? 1;
  const wf = (u) => { const prof = Math.min(1, u / Math.max(0.01, t0)) * Math.min(1, (1 - u) / 0.35); return w * (0.18 + 0.82 * Math.pow(Math.max(0, prof), 0.7)) * (1 + (hash(Math.floor(u * 9), seed) - 0.5) * 0.5 * sw); };
  if (LINESTATS.on && o.outline) { let mx = 0, mn = 1e9; for (let i = 0; i <= 20; i++) { const v = wf(i / 20); mx = Math.max(mx, v); mn = Math.min(mn, v); } LINESTATS.list.push([mx, mn]); }
  ribbon(g, FLAT, wf, cc(col), a, 0); return;
  rib(g, FLAT, (u) => { const prof = Math.min(1, u / Math.max(0.01, t0)) * Math.min(1, (1 - u) / 0.35); return w * (0.18 + 0.82 * Math.pow(Math.max(0, prof), 0.7)) * (1 + (hash(Math.floor(u * 9), seed) - 0.5) * 0.5 * sw); }, col, a, 0);
}
// One painted mass: flat wash, dry-brush grain, pooled darker edge, and one swelling outline in two or three strokes.
function mass(g, P, o) {
  const B = boil(P, o.seed, o.n, o.amp), S = closedCurve(B, 3), A = o.a ?? 1;
  g.beginPath(); for (let i = 0; i < S.length; i++) i ? g.lineTo(S[i][0], S[i][1]) : g.moveTo(S[i][0], S[i][1]); g.closePath();
  g.globalAlpha = A; g.fillStyle = cc(o.col); g.fill();
  if (o.tex !== 0 && !FLATC) {
    g.save(); g.clip();
    const pat = grain(g); if (pat) { if (pat.setTransform && typeof DOMMatrix !== 'undefined') pat.setTransform(new DOMMatrix([0.3, 0, 0, 0.3, o.ox || 0, o.oy || 0])); g.globalAlpha = A * (o.tex ?? 0.9); g.fillStyle = cc(pat); g.fill(); }
    g.globalAlpha = A * 0.28; g.strokeStyle = cc(INK); g.lineWidth = (o.lw || 2) * 2.4; g.stroke();
    if (o.inside) o.inside(g);
    g.restore();
  }
  if (o.ink !== null) {
    // the outline: split into a few strokes with gaps where the brush lifts
    const m = S.length, cuts = o.strokes || 3, off = Math.floor(hash(1, o.seed) * m);
    for (let k = 0; k < cuts; k++) {
      const s0 = off + Math.floor((k * m) / cuts), s1 = off + Math.floor(((k + 1) * m) / cuts) + 2, seg = [];
      for (let i = s0; i <= s1; i++) seg.push(S[i % m]);
      brushLine(g, seg, o.lw || 2, cc(o.ink || INK), A * 0.95, o.seed + k * 17, { t0: 0.15, outline: 1 });
    }
  }
  g.globalAlpha = 1;
}
// a sweeping open stroke (hair, folds, cords, tails)
function sweep(g, P, w, col, a, seed, k = 4) { brushLine(g, openCurve(P, k), w, col, a, seed, { t0: 0.2 }); }

// Draw one figure. g is in world units (y down), (x, y) the ground point under the hip.
// fig: render-side record { pose, target, scarf, t, seed, cloth, sq... }. o: { face, alpha, wind, vx, dt, boilN, sash, shield, draw, expr }
export function drawFigure(g, x, y, look, pose, fig, o) {
  const L = LOOKS[look] || LOOKS.bandit, f = o.face, A = o.alpha ?? 1, bulk = L.bulk, dt = Math.min(o.dt ?? 0.016, 0.05);
  FLATC = o.flat || null; SHADE = o.shade || 0;
  const sc = L.sc, wind = o.wind || 0, t = fig.t || 0, vx = o.vx || 0, seed = fig.seed || 1, bn = o.boilN || 0, amp = o.reduced ? 0 : 0.55 * sc;
  // overlapping action: cloth lags the body on a spring and overshoots when it stops
  const tgt = clamp(-vx * 0.04 + wind * 5, -11, 11) + Math.sin(t * 5.3 + seed) * (0.6 + Math.abs(wind) * 1.6);
  fig.cv = (fig.cv || 0) + ((tgt - (fig.cx || 0)) * 90 - (fig.cv || 0) * 9) * dt; fig.cx = (fig.cx || 0) + fig.cv * dt; const cloth = fig.cx;
  // squash and stretch (landings, hits)
  fig.sqv = (fig.sqv || 0) + (-(fig.sq || 0) * 260 - (fig.sqv || 0) * 16) * dt; fig.sq = (fig.sq || 0) + fig.sqv * dt;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (Math.abs(fig.sq) > 0.002) { g.translate(x, y); g.scale(1 + fig.sq * 0.45, 1 - fig.sq); g.translate(-x, -y); }
  if (o.roll) { const k = Math.sin(Math.min(1, Math.abs(o.roll) / 6.283) * Math.PI); g.translate(x, y); g.scale(1 + k * 0.12, 1 - k * 0.22); g.translate(-x, -y); }
  const breath = Math.sin(t * 2.2 + seed * 3.1) * (o.still ? 0.15 : 0.35) * sc; // idle is still and tall
  const lean = pose.lean + (L.hunch || 0) * (pose.lean > -0.6 ? 1 : 0) - (L.upright ? 0.05 : 0);
  const lift = pose.kneel || pose.hy > -30 ? 0 : 6 * clamp((-pose.hy - 30) / 18, 0, 1); // longer legs stand taller
  const H = [x + f * pose.hx * sc, y + (pose.hy - lift) * sc + breath * 0.4];
  const T = 37 * sc, ax = Math.sin(lean) * f, ay = -Math.cos(lean);
  const N = [H[0] + ax * T, H[1] + ay * T + breath];
  const nfx = f * -ay, nfy = f * ax; // front normal of the torso
  const ha = lean + pose.head + (L.hunch ? 0.25 : 0), Hd = [N[0] + Math.sin(ha) * f * 9 * sc, N[1] - Math.cos(ha) * 9 * sc];
  const ink = INK, mo = (P, col, extra) => mass(g, P, Object.assign({ col, seed: seed + (extra && extra.k || 0), n: bn, amp, a: A, lw: 1.75 * sc, ox: x, oy: y }, extra));
  // ---- legs (IK) ----
  const legs = [];
  for (const [ft, back] of [[pose.fb, 1], [pose.ff, 0]]) {
    const hx = H[0] - nfx * (back ? 3 : -3) * sc, hy = H[1];
    const F = [x + f * ft[0] * sc, y + ft[1] * sc];
    if (pose.kneel) { const knee = back ? [H[0] + f * 17 * sc, y - 3 * sc] : [H[0] + f * 20 * sc, y - 4 * sc]; legs.push({ hx, hy, kx: knee[0], ky: knee[1], fx: H[0] - f * 13 * sc, fy: y - 1, back }); }
    else { ik(hx, hy, F[0], F[1], 29 * sc, 29 * sc, f > 0 ? -1 : 1, T4); legs.push({ hx, hy, kx: T4[0], ky: T4[1], fx: T4[2], fy: T4[3], back }); }
  }
  const [LB, LF] = legs, hl = L.hl;
  for (const l of legs) { const fl = cloth * (l.back ? 0.9 : 0.6); const h2 = Math.min(0.9, hl * 0.9); l.hemx = lerp(l.kx, l.fx, h2) + fl; l.hemy = Math.min(l.fy - 3 * sc, lerp(l.ky, l.fy, h2) + (hl > 1 ? 6 * sc : 0)); }
  // ---- weapon geometry ----
  const sw = pose.sw, dx = Math.cos(sw) * f, dy = Math.sin(sw);
  const G = [H[0] + f * pose.grip[0] * sc - f * pose.hx * sc, y + (pose.grip[1] - lift) * sc + (pose.hy + 49) * 0.4 * sc];
  const Sf = [N[0] + nfx * 2 * sc - ax * 5 * sc, N[1] + nfy * 2 * sc - ay * 5 * sc], Sb = [N[0] - nfx * 5 * sc - ax * 6 * sc, N[1] - nfy * 5 * sc - ay * 6 * sc];
  let hand2;
  if (L.weapon === 'spear') hand2 = [G[0] - dx * 32 * sc, G[1] - dy * 32 * sc];
  else if (L.weapon === 'bow') hand2 = [G[0] - f * (o.draw || 0) * 26 * sc - f * 6 * sc, G[1] + 2 * sc];
  else if (L.weapon === 'club') hand2 = null;
  else hand2 = [G[0] - dx * 8 * sc, G[1] - dy * 8 * sc];
  if (pose.sheath && (L.weapon === 'katana' || L.weapon === 'odachi')) { const swing = o.walkPh != null ? Math.sin(o.walkPh) * 7 * sc : 0; hand2 = [H[0] - nfx * (4 * sc) + f * swing, H[1] + 12 * sc]; }
  if (pose.open) hand2 = [N[0] - f * 28 * sc, N[1] + 6 * sc];
  // ---- behind the body: scarf, hair, quiver, lantern pole ----
  if (L.scarf && fig.scarf) {
    const ch = fig.scarf; ch[0][0] = N[0] - f * 2 * sc; ch[0][1] = N[1] + 2 * sc; const pts = []; for (const q of ch) pts.push(q[0], q[1]);
    rib(g, pts, (u) => (6.5 - u * 4.5) * sc, o.scarf || ink, A, 0); g.globalAlpha = A * 0.9; g.strokeStyle = cc(ink); g.lineWidth = 1.1 * sc; g.stroke(); g.globalAlpha = 1;
  }
  if (L.hat === 'longhair') { const nape = [Hd[0] - f * 5 * sc, Hd[1] + 2 * sc]; const tip = [N[0] - f * (16 * sc) + cloth * 1.6, lerp(N[1], H[1], 0.75)]; mo([nape, [lerp(nape[0], tip[0], 0.5) - f * 5 * sc, lerp(nape[1], tip[1], 0.5)], tip, [tip[0] + f * 4 * sc, tip[1] - 6 * sc], [Hd[0] - f * 1 * sc, N[1]]], '#141210', { k: 31, tex: 0.5, lw: 1.6 * sc }); }
  if (L.quiver) mo([[N[0] - f * 6 * sc, N[1] - 2 * sc], [N[0] - f * 13 * sc, N[1] - 1 * sc], [H[0] - f * 16 * sc, H[1] - 4 * sc], [H[0] - f * 9 * sc, H[1] - 4 * sc]], L.acc, { k: 33 });
  if (L.quiver) for (let i = 0; i < 3; i++) sweep(g, [[N[0] - f * (7 + i * 2.5) * sc, N[1] - 1 * sc], [N[0] - f * (6 + i * 3) * sc, N[1] - 13 * sc]], 1.6 * sc, ink, A, seed + i);
  if (L.lantern) {
    const base = [N[0] - f * 10 * sc, N[1] + 6 * sc], top = [N[0] - f * 22 * sc, N[1] - 46 * sc], lx = top[0] + f * 14 * sc + cloth * 0.8, ly = top[1] + 16 * sc;
    sweep(g, [base, [lerp(base[0], top[0], 0.5) - f * 2 * sc, lerp(base[1], top[1], 0.5)], top, [top[0] + f * 14 * sc, top[1] + 2 * sc]], 2.6 * sc, ink, A, seed + 3);
    if (!FLATC) { g.globalAlpha = A * 0.5; const gl = g.createRadialGradient(lx, ly, 2, lx, ly, 46 * sc); gl.addColorStop(0, 'rgba(247,238,214,0.8)'); gl.addColorStop(1, 'rgba(247,238,214,0)'); g.fillStyle = cc(gl); g.fillRect(lx - 46 * sc, ly - 46 * sc, 92 * sc, 92 * sc); g.globalAlpha = 1; }
    mo([[lx, ly - 9 * sc], [lx + 6 * sc, ly - 5 * sc], [lx + 6.5 * sc, ly + 5 * sc], [lx, ly + 9 * sc], [lx - 6.5 * sc, ly + 5 * sc], [lx - 6 * sc, ly - 5 * sc]], '#f3ead4', { k: 35, tex: 0.2, lw: 1.4 * sc });
  }
  // ---- back arm (sleeve mass) ----
  const arm = (S, hx2, hy2, back, k) => {
    ik(S[0], S[1], hx2, hy2, 19 * sc, 18 * sc, f > 0 ? 1 : -1, T4b);
    const ex = T4b[0], ey = T4b[1], wx = T4b[2], wy = T4b[3];
    const ux = ex - S[0], uy = ey - S[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul; // perpendicular of upper arm
    const vx2 = wx - ex, vy2 = wy - ey, vl = Math.hypot(vx2, vy2) || 1, qx = -vy2 / vl, qy = vx2 / vl;
    const tied = !pose.sheath && L === LOOKS.ronin, drop = [cloth * 1.2 * (back ? 1 : 0.8) - f * (back ? 2 : 0), ((tied ? 6 : 15) + Math.abs(cloth) * 0.2) * sc];
    const w = 7 * sc * Math.sqrt(bulk), cuff = [lerp(ex, wx, 0.45), lerp(ey, wy, 0.45)];
    const P = [[S[0] + px * w, S[1] + py * w], [ex + px * w * 0.9, ey + py * w * 0.9], [cuff[0] + qx * w * 0.75, cuff[1] + qy * w * 0.75], [cuff[0] - qx * w * 0.75, cuff[1] - qy * w * 0.75],
      [lerp(ex, cuff[0], 0.4) + drop[0], lerp(ey, cuff[1], 0.4) + drop[1]], [ex + drop[0] * 0.7 - px * w * 0.3, ey + drop[1] * 0.75], [S[0] - px * w, S[1] - py * w]];
    // forearm: bare, pale, tapering to the wrist
    rib(g, [cuff[0], cuff[1], wx, wy], (u) => (5 - u * 1.6) * sc, back ? mix(L.skin, '#000000', 0.18) : L.skin, A, 0); g.globalAlpha = A; g.strokeStyle = cc(INK); g.lineWidth = 1.1 * sc; g.stroke();
    if (!back) { // the strip of untouched paper that separates the near arm from the torso
      const S2 = closedCurve(P, 3); g.beginPath(); S2.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.globalAlpha = A * 0.85; g.strokeStyle = cc(PAPER); g.lineWidth = 2.4 * sc; g.stroke(); }
    mo(P, back ? mix(L.slv, '#000000', 0.25) : mix(L.slv, PAPER, 0.16), { k: 40 + k, lw: 1.7 * sc });
    // a fold where the sleeve hangs
    sweep(g, [[lerp(S[0], ex, 0.6), lerp(S[1], ey, 0.6) + 3 * sc], [ex + drop[0] * 0.4, ey + drop[1] * 0.5], [lerp(ex, cuff[0], 0.5) + drop[0] * 0.6, lerp(ey, cuff[1], 0.5) + drop[1] * 0.8]], 1.3 * sc, PAPER, A * 0.5, seed + k);
    // hand: a pale mass with a knuckle line
    const hxp = wx + (wx - ex) / vl * 2.5 * sc, hyp = wy + (wy - ey) / vl * 2.5 * sc;
    mo([[hxp - 3.6 * sc, hyp - 2.6 * sc], [hxp + 3.2 * sc, hyp - 3.2 * sc], [hxp + 4 * sc, hyp + 2 * sc], [hxp - 1 * sc, hyp + 3.6 * sc], [hxp - 4 * sc, hyp + 1 * sc]], L.skin, { k: 50 + k, tex: 0.15, lw: 1.3 * sc, strokes: 2 });
  };
  if ((L.weapon === 'katana' || L.weapon === 'odachi') && !o.noWeapon) {
    const sa = 0.5 + cloth * 0.01, s0 = [H[0] + f * 6 * sc, H[1] - 6 * sc], s1 = [s0[0] - f * Math.cos(sa) * 44 * sc, s0[1] + Math.sin(sa) * 44 * sc];
    rib(g, [s0[0], s0[1], lerp(s0[0], s1[0], 0.5), lerp(s0[1], s1[1], 0.5) + 1 * sc, s1[0], s1[1]], (u) => (3.8 - u * 1.4) * sc, '#15120f', A, 0.6);
  }
  if ((L.weapon === 'katana' || L.weapon === 'odachi') && !o.noWeapon && (L === LOOKS.ronin || L.kind === 'duelist' || L.kind === 'master')) {
    const s0 = [H[0] + f * 3 * sc, H[1] - 9 * sc], s1 = [s0[0] - f * 26 * sc, s0[1] + 13 * sc];
    rib(g, [s0[0], s0[1], s1[0], s1[1]], (u) => (3.2 - u * 1) * sc, '#1c1714', A, 0.6);
    sweep(g, [s0, [s0[0] + f * 9 * sc, s0[1] - 5 * sc]], 3 * sc, INK, A, seed + 152, 2);
  }
  if (hand2) arm(Sb, hand2[0], hand2[1], 1, 1);
  // ---- feet (pale, in sandals), then the hakama over them ----
  for (const l of legs) {
    const F = [l.fx, l.fy], toe = pose.kneel && !l.back ? -1 : 1;
    if (L.shins) mo([[l.hemx - 3 * sc, l.hemy - 2 * sc], [l.hemx + 3 * sc, l.hemy - 2 * sc], [F[0] + 2.5 * sc, F[1] - 4 * sc], [F[0] - 2.5 * sc, F[1] - 4 * sc]], L.skin, { k: 60 + l.back, tex: 0.1, lw: 1.3 * sc, strokes: 2 });
    mo([[F[0] - f * 3.5 * sc, F[1] - 0.5 * sc], [F[0] - f * 2 * sc, F[1] - 5 * sc], [F[0] + f * 3 * sc * toe, F[1] - 4.5 * sc], [F[0] + f * 8.5 * sc * toe, F[1] - 0.5 * sc]], L.skin, { k: 62 + l.back, tex: 0.1, lw: 1.3 * sc, strokes: 2 });
    sweep(g, [[F[0] - f * 4 * sc, F[1]], [F[0] + f * 9 * sc * toe, F[1] + 0.3 * sc]], 1.8 * sc, ink, A, seed + 64);
    sweep(g, [[F[0] - f * 1.5 * sc, F[1] - 4.5 * sc], [F[0] + f * 4 * sc * toe, F[1] - 1 * sc]], 0.9 * sc, ink, A, seed + 65);
  }
  // hakama: ONE shape for both legs, split only as far as the legs part
  {
    const mv = clamp(Math.abs(vx) / 160 + Math.abs(cloth) * 0.05, 0, 1), w0 = 8 * sc * bulk, w1 = 6.6 * sc * bulk, w2 = (7.4 + mv * 4.5) * sc * bulk;
    const side = (l, outer) => { // perpendicular at knee and hem, pointing to the outer side of this leg
      const s = l.back ? -1 : 1; const qx0 = l.kx - l.hx, qy0 = l.ky - l.hy, ql = Math.hypot(qx0, qy0) || 1; let px0 = -qy0 / ql, py0 = qx0 / ql; if (px0 * f * s < 0) { px0 = -px0; py0 = -py0; }
      const rx0 = l.hemx - l.kx, ry0 = l.hemy - l.ky, rl = Math.hypot(rx0, ry0) || 1; let mx0 = -ry0 / rl, my0 = rx0 / rl; if (mx0 * f * s < 0) { mx0 = -mx0; my0 = -my0; }
      return { px0, py0, mx0, my0 };
    };
    const b = side(LB), fr = side(LF);
    const Wb = [H[0] - nfx * w0 + ax * 2 * sc, H[1] - nfy * w0 + ay * 2 * sc], Wf = [H[0] + nfx * w0 * 0.95 + ax * 2 * sc, H[1] + nfy * w0 * 0.95 + ay * 2 * sc];
    const kneeMid = [(LB.kx + LF.kx) / 2, (LB.ky + LF.ky) / 2], spread = Math.hypot(LB.hemx - LF.hemx, LB.hemy - LF.hemy);
    const C = [lerp(H[0], kneeMid[0], 0.55 + clamp((60 * sc - spread) / (60 * sc), 0, 0.4)), lerp(H[1], kneeMid[1], 0.55 + clamp((60 * sc - spread) / (60 * sc), 0, 0.4)) + 6 * sc];
    const P = [Wb, [LB.kx + b.px0 * w1, LB.ky + b.py0 * w1], [LB.hemx + b.mx0 * w2 + cloth * 0.5, LB.hemy + b.my0 * w2], [LB.hemx - b.mx0 * w2 * 0.6, LB.hemy - b.my0 * w2 * 0.6 + 1 * sc], C,
      [LF.hemx - fr.mx0 * w2 * 0.6, LF.hemy - fr.my0 * w2 * 0.6 + 1 * sc], [LF.hemx + fr.mx0 * w2 + cloth * 0.3, LF.hemy + fr.my0 * w2], [LF.kx + fr.px0 * w1, LF.ky + fr.py0 * w1], Wf];
    mo(P, L.hak, { k: 70, lw: 2.3 * sc, strokes: 4, inside: (q) => {
      // dry-brush pleats sweeping from the waist into each hem
      for (const [l, s2] of [[LB, -1], [LF, 1]]) for (const kk of [-0.45, 0, 0.45]) { const sx = lerp(Wb[0], Wf[0], 0.5 + s2 * 0.25 + kk * 0.2), sy = lerp(Wb[1], Wf[1], 0.5) + 4 * sc; sweep(q, [[sx, sy], [l.kx + kk * 8 * sc, l.ky], [l.hemx + kk * 12 * sc + cloth * 0.4, l.hemy - 2 * sc]], 1.3 * sc, kk === 0 ? INK : PAPER, A * (kk === 0 ? 0.35 : 0.3), seed + 80 + kk * 10 + s2); }
    } });
  }
  // ---- torso: kimono, obi, white collar ----
  const tw = 21 * sc * bulk, tp = (u, s) => [lerp(H[0], N[0], u) + nfx * s, lerp(H[1], N[1], u) + nfy * s];
  if (L.coat && L.coatLong) { const hem = [H[0] - nfx * 16 * sc + cloth * 1.4, y - 4 * sc]; mo([tp(1, -tw * 0.5), tp(0.4, -tw * 0.62), hem, [hem[0] + f * 22 * sc, y - 3 * sc], tp(0.2, tw * 0.3)], L.coat, { k: 90, lw: 2 * sc }); }
  mo([tp(0, -tw * 0.36), tp(0.45, -tw * 0.5), tp(0.98, -tw * 0.52), tp(1.08, -3 * sc), tp(1.04, 4 * sc), tp(0.95, tw * 0.44), tp(0.55, tw * 0.5), tp(0, tw * 0.38)], L.kim, { k: 91, lw: 2.2 * sc, inside: (q) => {
    sweep(q, [tp(0.9, -tw * 0.3), tp(0.5, -tw * 0.35 + cloth * 0.2), tp(0.12, -tw * 0.25)], 1.4 * sc, PAPER, A * 0.28, seed + 92);
  } });
  if (L.armor) mo([tp(0.15, -tw * 0.35), tp(0.85, -tw * 0.4), tp(0.9, tw * 0.5), tp(0.15, tw * 0.56)], '#2c2e33', { k: 93, lw: 1.9 * sc, inside: (q) => { for (let i = 1; i < 4; i++) sweep(q, [tp(i * 0.22, -tw * 0.35), tp(i * 0.22, tw * 0.56)], 0.9 * sc, PAPER, A * 0.4, seed + 94 + i); } });
  if (L.coat && !L.coatLong) { const hem = [H[0] - nfx * 18 * sc + cloth * 1.6, H[1] + 26 * sc]; mo([tp(1, -tw * 0.52), tp(0.5, -tw * 0.66), hem, [H[0] - nfx * 2 * sc + cloth * 0.6, H[1] + 22 * sc], tp(0.3, tw * 0.1), tp(0.98, 0)], L.coat, { k: 95, lw: 2 * sc }); }
  if (L.coatLong) mo([tp(1, -tw * 0.52), tp(0.5, -tw * 0.62), tp(0.1, -tw * 0.5), tp(0.25, tw * 0.1), tp(0.98, 0)], L.coat, { k: 96, lw: 2 * sc });
  // the white under-collar: untouched paper in the dark mass
  sweep(g, [tp(1.04, 1.5 * sc), tp(0.75, tw * 0.3), tp(0.5, tw * 0.48)], 2.8 * sc, PAPER, A * 0.92, seed + 97);
  { const o0 = tp(0.08, -tw * 0.42), o1 = tp(0.08, tw * 0.44); rib(g, [o0[0], o0[1], o1[0], o1[1]], () => 6.5 * sc, o.sash || L.obi || '#7a7064', A, 0.8); sweep(g, [tp(0.02, -tw * 0.3), [tp(0.02, -tw * 0.3)[0] - f * 5 * sc + cloth * 0.6, tp(0.02, -tw * 0.3)[1] + 10 * sc]], 2.4 * sc, o.sash || L.obi || '#7a7064', A, seed + 98); }
  if (L.mino) {
    // the scarecrow's straw raincoat: a ragged cape over the shoulders, all dry straw strokes
    const P = [tp(1.08, -6 * sc), tp(1.0, -tw * 0.8), tp(0.3, -tw * 0.95), [H[0] - nfx * tw * 0.6 + cloth, H[1] + 18 * sc], [H[0] - nfx * 8 * sc + cloth, H[1] + 10 * sc], [H[0] + nfx * 4 * sc + cloth * 0.6, H[1] + 16 * sc], tp(0.45, tw * 0.75), tp(1.0, tw * 0.45)];
    mo(P, L.mino, { k: 98, lw: 1.8 * sc, strokes: 5, inside: (q) => { for (let i = 0; i < 9; i++) { const u = i / 8; const top = [lerp(P[1][0], P[7][0], u), lerp(P[1][1], P[7][1], u)]; sweep(q, [top, [top[0] - f * 2 * sc + cloth * 0.6, top[1] + 30 * sc]], 1.2 * sc, i % 2 ? INK : PAPER, A * 0.35, seed + 99 + i); } } });
  }
  // ---- neck, head, hair, face ----
  const neckA = [N[0] + nfx * 1 * sc, N[1] + 2 * sc];
  mo([[neckA[0] - 3 * sc, neckA[1]], [neckA[0] + 3.4 * sc, neckA[1]], [Hd[0] + 3 * sc * f, Hd[1] + 4 * sc], [Hd[0] - 3 * sc * f, Hd[1] + 3 * sc]], L.skin, { k: 100, tex: 0.1, lw: 1.3 * sc, strokes: 2 });
  const hc = Math.cos(ha), hs = Math.sin(ha) * f, hk = 0.94 * sc, HP = (u, v) => [Hd[0] + (u * hc - v * hs) * hk * f, Hd[1] + (u * hs * f + v * hc) * hk];
  // head: skull, jaw toward the front; face is a pale mass
  const headP = [HP(-6.5, -2), HP(-4, -8), HP(2, -8.4), HP(6.2, -4), HP(6.8, 1.5), HP(5.2, 5.5), HP(1.5, 7.8), HP(-3.5, 6.5), HP(-6.5, 3)];
  mo(headP, L.skin, { k: 102, tex: 0.12, lw: 1.6 * sc, strokes: 2 });
  if (L.hat !== 'bald' && L.hat !== 'kasa' && L.hat !== 'jingasa' && L.hat !== 'hood') {
    // hair as a solid black mass over the back and top of the skull, plus sweeping strands
    const hcol = L.hat === 'white' ? '#e4ddcf' : '#141210';
    mo([HP(-7.2, 3.5), HP(-7, -4), HP(-2, -9.4), HP(4.5, -7.6), HP(3, -4.5), HP(-1, -4), HP(-2.5, 1), HP(-4, 4.5)], hcol, { k: 104, tex: 0.4, lw: 1.5 * sc });
    const knot = HP(-3, -10.5);
    if (L.hat === 'tail') sweep(g, [knot, HP(-9, -8), [knot[0] - f * 14 * sc + cloth * 1.4, knot[1] + 10 * sc], [knot[0] - f * 22 * sc + cloth * 2.2, knot[1] + 22 * sc]], 4.2 * sc, '#141210', A, seed + 105);
    else if (L.hat === 'band') { sweep(g, [knot, HP(-4, -13), HP(1, -14.5)], 3.8 * sc, '#141210', A, seed + 106); sweep(g, [knot, HP(-7, -13), HP(-9, -15.5)], 2.6 * sc, '#141210', A, seed + 107); }
    else sweep(g, [knot, HP(-1.5, -12.5), HP(1.5, -12)], 3.4 * sc, hcol, A, seed + 108);
  }
  if (L.hat === 'band' || L.hat === 'bald' && L.acc && L.shield && !L.lantern) {
    if (L.hat === 'band') { const b0 = HP(-6.8, -3), b1 = HP(6.4, -3.6); rib(g, [b0[0], b0[1], b1[0], b1[1]], () => 3.2 * sc, L.acc, A, 0); sweep(g, [b0, [b0[0] - f * 8 * sc + cloth * 1.2, b0[1] + 2 * sc], [b0[0] - f * 15 * sc + cloth * 2, b0[1] + 5 * sc]], 2.2 * sc, L.acc, A, seed + 109); }
  }
  if (L.beard) { const c0 = HP(5, 4), c1 = HP(1, 8.5); sweep(g, [c0, c1, [c1[0] - f * 2 * sc + cloth * 0.5, c1[1] + (L.beard === 'white' ? 9 : 4) * sc]], (L.beard === 'white' ? 2.6 : 3.4) * sc, L.beard === 'white' ? '#e9e2d3' : '#151311', A, seed + 110); }
  if (L.hat === 'kasa') { const n0 = HP(-6.5, -1), n1 = HP(-8.5, 6), n2 = [HP(-5, 9)[0] + cloth * 0.5, HP(-5, 9)[1]]; mo([n0, HP(-2, -2), HP(-3.2, 4), n2, n1], '#141210', { k: 109, tex: 0.3, lw: 1.3 * sc, strokes: 2 }); sweep(g, [HP(-7.5, 4), [HP(-10, 10)[0] + cloth * 0.8, HP(-10, 10)[1]]], 1.6 * sc, '#141210', A, seed + 119); }
  // face: in shadow under a hat; one decisive line for the eye
  const shaded = L.hat === 'kasa' || L.hat === 'jingasa' || L.hat === 'hood';
  if (shaded) { g.save(); g.beginPath(); const S = closedCurve(headP, 2); S.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.clip(); g.globalAlpha = A * 0.62; g.fillStyle = cc('#2a2420'); const sh = HP(0, -1.2); g.fillRect(Hd[0] - 12 * sc, Hd[1] - 14 * sc, 24 * sc, (sh[1] - (Hd[1] - 14 * sc))); g.restore(); }
  const ex = o.expr || 'calm', eye = HP(3.6, 0.4);
  if (ex === 'wide') { sweep(g, [[eye[0] - f * 1.6 * sc, eye[1] - 1.2 * sc], [eye[0] + f * 1.8 * sc, eye[1] - 1.5 * sc]], 1.2 * sc, INK, A, seed + 111); dr(g, eye[0] + f * 0.6 * sc, eye[1] + 0.2 * sc, 0.9 * sc, INK, A); }
  else if (ex === 'hurt') { sweep(g, [[eye[0] - f * 2 * sc, eye[1] - 1.4 * sc], [eye[0] + f * 0.6 * sc, eye[1]], [eye[0] - f * 2 * sc, eye[1] + 1.2 * sc]], 1.2 * sc, INK, A, seed + 112); const m = HP(3.4, 5); dr(g, m[0], m[1], 1.1 * sc, INK, A); }
  else if (ex === 'win') { sweep(g, [[eye[0] - f * 2 * sc, eye[1] - 0.2 * sc], [eye[0], eye[1] + 0.8 * sc], [eye[0] + f * 1.6 * sc, eye[1] - 0.1 * sc]], 1.1 * sc, INK, A, seed + 113); const m = HP(3.3, 5.2); sweep(g, [[m[0] - f * 1.4 * sc, m[1]], [m[0] + f * 1.2 * sc, m[1] - 0.4 * sc]], 0.9 * sc, INK, A * 0.8, seed + 114); }
  else sweep(g, [[eye[0] - f * 1.8 * sc, eye[1] + 0.2 * sc], [eye[0] + f * 1.8 * sc, eye[1] - 0.6 * sc]], 1.3 * sc, INK, A, seed + 115);
  if (!o.noHat) drawHat(g, L, HP, Hd, f, sc, A, cloth, t, seed, bn, amp, mo, o);
  // ---- front: shield, weapon, front arm ----
  if (L.shield) {
    const out = o.shieldOut ? 12 : 0, SX = H[0] + f * (18 + out) * sc, SY = H[1] - 16 * sc, w = 7 * sc, h = 32 * sc;
    if (!o.shield) arm(Sf, H[0] + f * 13 * sc, H[1] - 6 * sc, 0, 3);
    else mo([[SX - w, SY - h], [SX + w, SY - h * 1.04], [SX + w * 1.05, SY + h * 0.95], [SX - w, SY + h]], L.acc || '#6a5038', { k: 120, lw: 2.4 * sc, strokes: 4, inside: (q) => { for (let i = 0; i < 4; i++) dr(q, SX, SY - h * 0.75 + i * h * 0.5, 1.6 * sc, INK, A); sweep(q, [[SX - w * 0.2, SY - h], [SX - w * 0.3, SY + h]], 1 * sc, PAPER, A * 0.35, seed + 121); } });
    // the front hand on the shield's grip
    if (o.shield) arm(Sf, SX - f * 2 * sc, SY + 2 * sc, 0, 3);
  }
  if (!o.noWeapon) drawWeapon(g, L, G, dx, dy, f, sc, A, pose, o, seed, H, cloth);
  if (!(L.shield)) arm(Sf, pose.sheath && L.weapon !== 'spear' && L.weapon !== 'bow' ? H[0] + f * 9 * sc : G[0], pose.sheath && L.weapon !== 'spear' && L.weapon !== 'bow' ? H[1] - 4 * sc : G[1], 0, 2);
  else if (L.weapon === 'club') arm(Sb, G[0], G[1], 0, 4);
  g.restore(); g.globalAlpha = 1;
  let top = 1e9, bot = -1e9; for (const q of headP) { top = Math.min(top, q[1]); bot = Math.max(bot, q[1]); }
  FLATC = null; SHADE = 0;
  return { G, dx, dy, N, H, Hd, hand2, headTop: top, chin: bot, sc };
}
const T4 = [0, 0, 0, 0], T4b = [0, 0, 0, 0];

function drawHat(g, L, HP, Hd, f, sc, A, cloth, t, seed, bn, amp, mo, o) {
  if (L.hat === 'kasa') {
    // a wide straw hat: one mass, dark underside, straw strokes from the crown, and a cord that swings late
    const k = L.hatW || 1, P = [HP(-24 * k, -1.5), HP(-14 * k, -8), HP(-2, -16.5), HP(2, -16.5), HP(14 * k, -8.5), HP(25 * k, -2), HP(10, 0.3), HP(-10, 0.6)];
    mo(P, o.hatCol || L.hatCol, { k: 130, lw: 2.3 * sc, strokes: 3, inside: (q) => {
      for (let i = -4; i <= 4; i++) sweep(q, [HP(i * 0.9, -15.5), HP(i * 5.6 * k, -1)], 0.9 * sc, i % 2 ? PAPER : INK, A * 0.32, seed + 131 + i, 2);
      rib(q, [HP(-24 * k, -1.2)[0], HP(-24 * k, -1.2)[1], HP(0, 1.2)[0], HP(0, 1.2)[1], HP(25 * k, -1.7)[0], HP(25 * k, -1.7)[1]], () => 3 * sc, INK, A * 0.55, 0);
    } });
    const c0 = HP(-3, 0), c1 = HP(1.5, 9.5); sweep(g, [c0, [c1[0] + cloth * 0.25, c1[1]], [c1[0] - f * 2 * sc + cloth * 0.4, c1[1] + 3 * sc]], 0.8 * sc, INK, A * 0.8, seed + 140);
  } else if (L.hat === 'jingasa') {
    const k = L.hatW || 1;
    mo([HP(-15 * k, -1), HP(-2, -11), HP(2, -11), HP(15 * k, -1.5), HP(6, 0.5), HP(-6, 0.5)], L.acc, { k: 132, lw: 2.1 * sc, inside: (q) => sweep(q, [HP(-10 * k, -2.5), HP(0, -9), HP(10 * k, -2.5)], 1 * sc, PAPER, A * 0.35, seed + 133) });
  } else if (L.hat === 'hood') {
    mo([HP(-8.5, 7), HP(-9, -5), HP(-3, -10.5), HP(5, -9), HP(7.5, -3), HP(4, -3.5), HP(1, 1), HP(-1, 8)], L.acc, { k: 134, lw: 1.8 * sc });
  }
}
function drawWeapon(g, L, G, dx, dy, f, sc, A, pose, o, seed, H, cloth) {
  const px = -dy, py = dx;
  // sheath at the hip for sword users
  if (L.weapon === 'katana' || L.weapon === 'odachi') {
    const s0 = [H[0] + f * 9 * sc, H[1] - 5 * sc];
    if (pose.sheath) { const h1 = [s0[0] + f * 11 * sc, s0[1] - 5 * sc]; sweep(g, [s0, h1], 3.6 * sc, INK, A, seed + 151, 2); o._tip = h1; return; }
  }
  if (L.weapon === 'katana' || L.weapon === 'odachi') {
    const big = L.weapon === 'odachi', len = (big ? 72 : 62) * sc, bw = (big ? 3.6 : 2.3) * sc;
    const ex = G[0] + dx * len, ey = G[1] + dy * len, cvx = px * 3 * sc * f, cvy = py * 3 * sc * f;
    // wrapped hilt: dark cord with the diamond gaps of the wrap showing paper
    const h0 = [G[0] - dx * 15 * sc, G[1] - dy * 15 * sc];
    rib(g, [h0[0], h0[1], G[0], G[1]], () => 3.6 * sc, '#120f0d', A, 0);
    for (let i = 1; i < 5; i++) dr(g, lerp(h0[0], G[0], i / 5), lerp(h0[1], G[1], i / 5), 0.75 * sc, PAPER, A * 0.9);
    // the blade: bright steel with a clean curve, a dark spine and a hard edge
    const mid = [G[0] + dx * len * 0.52 + cvx, G[1] + dy * len * 0.52 + cvy];
    const B = [[G[0] + dx * 2 * sc + px * bw * 0.5, G[1] + dy * 2 * sc + py * bw * 0.5], [mid[0] + px * bw * 0.45, mid[1] + py * bw * 0.45], [ex, ey], [mid[0] - px * bw * 0.4, mid[1] - py * bw * 0.4], [G[0] + dx * 2 * sc - px * bw * 0.5, G[1] + dy * 2 * sc - py * bw * 0.5]];
    g.globalAlpha = A; g.fillStyle = cc('#f7f3ea'); g.beginPath(); g.moveTo(B[0][0], B[0][1]); g.quadraticCurveTo(B[1][0] * 2 - (B[0][0] + B[2][0]) / 2, B[1][1] * 2 - (B[0][1] + B[2][1]) / 2, B[2][0], B[2][1]); g.quadraticCurveTo(B[3][0] * 2 - (B[2][0] + B[4][0]) / 2, B[3][1] * 2 - (B[2][1] + B[4][1]) / 2, B[4][0], B[4][1]); g.closePath(); g.fill();
    g.strokeStyle = cc(INK); g.lineWidth = 0.9 * sc; g.stroke();
    brushLine(g, openCurve([B[0], [mid[0] + px * bw * 0.5, mid[1] + py * bw * 0.5], B[2]], 4), 1.5 * sc, INK, A, seed + 153, { t0: 0.05 });
    // guard (tsuba): a dark oval across the blade
    g.save(); g.translate(G[0] + dx * 1.5 * sc, G[1] + dy * 1.5 * sc); g.rotate(Math.atan2(dy, dx)); g.globalAlpha = A; g.fillStyle = cc('#0f0c0a'); g.beginPath(); g.ellipse(0, 0, 1.6 * sc, 4.4 * sc, 0, 0, 6.3); g.fill(); g.restore();
    o._tip = [ex, ey];
  } else if (L.weapon === 'spear') {
    const k = L === LOOKS.ono ? 1.25 : 1, b0 = [G[0] - dx * 64 * sc * k, G[1] - dy * 64 * sc * k], tip = [G[0] + dx * 82 * sc * k, G[1] + dy * 82 * sc * k];
    sweep(g, [b0, [(b0[0] + tip[0]) / 2 + px * 1.5 * sc, (b0[1] + tip[1]) / 2 + py * 1.5 * sc], tip], 3 * sc, INK, A, seed + 154, 3);
    const P = [[tip[0] + dx * 18 * sc, tip[1] + dy * 18 * sc], [tip[0] + px * 3 * sc, tip[1] + py * 3 * sc], [tip[0] - dx * 2 * sc, tip[1] - dy * 2 * sc], [tip[0] - px * 3 * sc, tip[1] - py * 3 * sc]];
    g.globalAlpha = A; g.fillStyle = cc('#ece6d8'); g.beginPath(); P.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill(); g.strokeStyle = cc(INK); g.lineWidth = 1.4 * sc; g.stroke();
    o._tip = P[0];
  } else if (L.weapon === 'bow') {
    const bx = G[0], by = G[1], hh = 36 * sc, pull = (o.draw || 0) * 22 * sc;
    sweep(g, [[bx - f * 4 * sc, by - hh], [bx + f * 13 * sc, by], [bx - f * 4 * sc, by + hh * 0.8]], 3 * sc, INK, A, seed + 155, 6);
    g.globalAlpha = A * 0.9; g.strokeStyle = cc(INK); g.lineWidth = 0.7 * sc; g.beginPath(); g.moveTo(bx - f * 4 * sc, by - hh); g.lineTo(bx - f * (4 * sc + pull), by); g.lineTo(bx - f * 4 * sc, by + hh * 0.8); g.stroke();
    if (o.draw > 0.1) sweep(g, [[bx - f * (4 * sc + pull), by], [bx + f * 16 * sc, by]], 1.4 * sc, INK, A, seed + 156, 2);
    o._tip = [bx + f * 13 * sc, by];
  } else if (L.weapon === 'club') {
    const len = 58 * sc, ex = G[0] + dx * len, ey = G[1] + dy * len;
    const P = [[G[0] - dx * 8 * sc + px * 2.5 * sc, G[1] - dy * 8 * sc + py * 2.5 * sc], [ex + px * 6 * sc, ey + py * 6 * sc], [ex + dx * 3 * sc, ey + dy * 3 * sc], [ex - px * 6 * sc, ey - py * 6 * sc], [G[0] - dx * 8 * sc - px * 2.5 * sc, G[1] - dy * 8 * sc - py * 2.5 * sc]];
    mass(g, P, { col: '#2b2420', seed: seed + 157, n: o.boilN || 0, amp: o.reduced ? 0 : 0.4 * sc, a: A, lw: 1.9 * sc, ox: G[0], oy: G[1], inside: (q) => { for (let i = 0; i < 5; i++) dr(q, G[0] + dx * len * (0.45 + i * 0.12), G[1] + dy * len * (0.45 + i * 0.12), 1.4 * sc, '#cfc6b4', A * 0.8); } });
    o._tip = [ex, ey];
  }
}

// render-side record for a figure: pose buffers, springs and a scarf chain
export function newFig(withScarf, seed) {
  const f = { pose: {}, target: {}, t: 0, snap: true, seed: seed || 1 + Math.floor(Math.random() * 9999), cx: 0, cv: 0, sq: 0, sqv: 0 };
  if (withScarf) f.scarf = Array.from({ length: 8 }, () => [0, 0, 0, 0]);
  return f;
}
export function stepScarf(fig, ax, ay, face, wind, vx, dt, init) {
  const ch = fig.scarf; if (!ch) return; const seg = 6.2;
  if (!init && ch.inited && Math.hypot(ch[1][0] - ax, ch[1][1] - ay) > seg * 4) init = true;
  if (init || !ch.inited) { for (let i = 0; i < ch.length; i++) { ch[i][0] = ch[i][2] = ax - face * i * seg; ch[i][1] = ch[i][3] = ay; } ch.inited = true; }
  ch[0][0] = ax; ch[0][1] = ay;
  const h = Math.min(dt, 1 / 30);
  for (let i = 1; i < ch.length; i++) {
    const q = ch[i]; const vxq = clamp((q[0] - q[2]) * 0.9, -8, 8), vyq = clamp((q[1] - q[3]) * 0.9, -8, 8);
    q[2] = q[0]; q[3] = q[1];
    const flap = Math.sin(fig.t * (7 + Math.abs(vx) * 0.03) - i * 0.9) * 0.6 * (0.4 + Math.abs(wind) + Math.abs(vx) / 120);
    q[0] += vxq + (wind * 300 - vx * 0.6) * h * h + flap * 0.25 * (i / ch.length); q[1] += vyq + (420 + flap * 900 * (i / ch.length)) * h * h;
  }
  for (let it = 0; it < 3; it++) for (let i = 1; i < ch.length; i++) {
    const a = ch[i - 1], b = ch[i]; const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = (d - seg) / d;
    if (i === 1) { b[0] -= dx * k; b[1] -= dy * k; } else { a[0] += dx * k * 0.5; a[1] += dy * k * 0.5; b[0] -= dx * k * 0.5; b[1] -= dy * k * 0.5; }
  }
}

// The fox: a white fox in ink. Body and head one mass, the tail one sweeping mass with a paper tip, legs as tapered strokes.
export function drawFoxFig(g, x, y, f, run, t, seed, n, reduced) {
  const amp = reduced ? 0 : 0.5, b = run ? Math.sin(t * 20) * 2.5 : Math.sin(t * 2) * 0.6;
  const P = (u, v) => [x + u * f, y + v];
  for (const [lx, ph] of [[-11, 0], [-6, 2.5], [9, 1], [13, 3.5]]) { const s = run ? Math.sin(t * 20 + ph) * 7 : 0; sweep(g, [P(lx, -12), P(lx + s * 0.5, -6), P(lx + s, 0)], 2.4, INK, 1, seed + lx); }
  mass(g, [P(-16, -14 + b * 0.3), P(-10, -21 + b * 0.3), P(6, -21), P(14, -22 - (run ? 0 : 4)), P(17, -30 - (run ? 0 : 4)), P(19, -24 - (run ? 0 : 4)), P(27, -21 - (run ? 0 : 3)), P(18, -15), P(10, -10), P(-10, -9)], { col: '#efe6d2', seed, n, amp, a: 1, lw: 1.7, ox: x, oy: y });
  dr(g, P(21, -24 - (run ? 0 : 4))[0], P(21, -24 - (run ? 0 : 4))[1], 1.1, INK, 1);
  mass(g, [P(-14, -17), P(-24, -24 - b), P(-38, -30 + Math.sin(t * 4) * 2), P(-46, -26), P(-36, -18), P(-22, -13)], { col: '#e8dec8', seed: seed + 9, n, amp, a: 1, lw: 1.6, ox: x, oy: y, inside: (q) => sweep(q, [P(-18, -18), P(-30, -24), P(-40, -26)], 1.2, INK, 0.3, seed + 3) });
  sweep(g, [P(17, -29 - (run ? 0 : 4)), P(15, -36 - (run ? 0 : 4))], 2.2, INK, 1, seed + 5, 2);
}

export function walkLegs(pose, dist, speed, st) {
  if (speed < 8 || !(st === 'move' || st === 'enter' || st === 'ready' || st === 'approach' || st === 'idle' || st === 'wind')) return;
  const run = speed > 200, stride = run ? 22 : 15, ph = dist / (run ? 26 : 19);
  const s1 = Math.sin(ph), c1 = Math.cos(ph);
  pose.ff = [pose.ff[0] * 0.3 + s1 * stride, Math.min(0, -Math.max(0, c1) * (run ? 9 : 5))];
  pose.fb = [pose.fb[0] * 0.3 - s1 * stride, Math.min(0, -Math.max(0, -c1) * (run ? 9 : 5))];
  pose.hy += Math.abs(c1) * (run ? 3 : 1.5) - (run ? 4 : 1); if (run) pose.lean += 0.14;
}
