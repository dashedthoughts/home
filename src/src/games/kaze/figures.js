// KAZE figures: brush-drawn people. A tiny skeleton (hip, torso, head, two-bone IK arms and legs),
// poses as numbers that tween with easing, and cloth (hakama, sleeves, hat, scarf) that answers the wind.
import { INK, rgba, mix, ribbon, drop, clamp, lerp } from './brush.js';
import { ATK } from './data.js';

const E = { out: (t) => 1 - (1 - t) * (1 - t), inout: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)), back: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2) };
// a pose: hip offset, lean, head tilt, feet, grip (relative to hip), sword angle (0 = forward, -PI/2 = up)
const mk = (o) => Object.assign({ hx: 0, hy: -49, lean: 0.06, head: 0, ff: [12, 0], fb: [-14, 0], grip: [16, -52], sw: -0.75, kneel: 0, roll: 0, sheath: 0, open: 0 }, o);
export const POSE = {
  stand: mk({ grip: [8, -50], sw: 0.9, sheath: 1, ff: [7, 0], fb: [-7, 0], hy: -50, lean: 0.02 }),
  guard: mk({}),
  parry: mk({ grip: [17, -66], sw: -1.42, lean: -0.04, ff: [16, 0], fb: [-16, 0], hy: -46 }),
  s1w: mk({ grip: [-2, -82], sw: -2.5, lean: -0.05 }), s1a: mk({ grip: [30, -50], sw: 0.55, lean: 0.25, ff: [22, 0], fb: [-14, 0], hy: -45 }),
  s2w: mk({ grip: [20, -40], sw: 0.8, lean: 0.2 }), s2a: mk({ grip: [24, -84], sw: -1.15, lean: 0.05, ff: [20, 0] }),
  s3w: mk({ grip: [-10, -86], sw: -2.85, lean: -0.12, ff: [14, 0], fb: [-18, 0] }), s3a: mk({ grip: [36, -46], sw: 0.7, lean: 0.35, ff: [30, 0], fb: [-20, 0], hy: -40 }),
  hw: mk({ grip: [-4, -100], sw: -1.95, lean: -0.15, ff: [16, 0], fb: [-18, 0] }), ha: mk({ grip: [32, -40], sw: 1.0, lean: 0.45, ff: [30, 0], fb: [-22, 0], hy: -38 }),
  thw: mk({ grip: [-8, -60], sw: 0.02, lean: -0.05, ff: [14, 0], fb: [-18, 0] }), tha: mk({ grip: [36, -60], sw: 0.02, lean: 0.35, ff: [32, 0], fb: [-22, 0], hy: -42 }),
  swpw: mk({ grip: [-12, -40], sw: 2.7, lean: 0.25, ff: [16, 0], fb: [-20, 0], hy: -40 }), swpa: mk({ grip: [34, -30], sw: 0.25, lean: 0.4, ff: [30, 0], fb: [-22, 0], hy: -34 }),
  hit: mk({ grip: [8, -52], sw: -0.3, lean: -0.42, ff: [16, 0], fb: [-10, 0], hy: -47, head: -0.3 }),
  stun: mk({ grip: [4, -50], sw: 0.2, lean: -0.3, head: -0.2 }),
  opened: mk({ grip: [-6, -92], sw: -2.2, lean: -0.5, head: -0.45, ff: [18, 0], fb: [-6, 0], hy: -47, open: 1 }),
  dodge: mk({ hy: -24, lean: 0.9, ff: [12, -12], fb: [-8, -6], grip: [10, -30], sw: 0.3 }),
  bow: mk({ grip: [8, -50], sw: 0.9, sheath: 1, lean: 0.95, head: 0.3, ff: [6, 0], fb: [-6, 0], hy: -49 }),
  sit: mk({ grip: [10, -24], sw: 0.9, sheath: 1, lean: 0.05, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  kneel: mk({ grip: [24, -6], sw: 0.0, sheath: 0, lean: 0.25, head: 0.35, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  focus: mk({ grip: [6, -46], sw: 0.95, sheath: 1, lean: 0.32, ff: [24, 0], fb: [-24, 0], hy: -38, head: -0.1 }),
  iai: mk({ grip: [40, -62], sw: 0.05, lean: 0.45, ff: [34, 0], fb: [-28, 0], hy: -34 }),
  heal: mk({ grip: [10, -40], sw: 0.9, sheath: 1, lean: 0.25, hy: -30, head: 0.35, kneel: 1, ff: [-10, 0], fb: [-14, 0] }),
  dead: mk({ grip: [10, -8], sw: 0.1, lean: -1.45, head: -0.3, hy: -12, ff: [24, 0], fb: [18, 0] }),
  // bow (archer)
  bowg: mk({ grip: [22, -64], sw: -1.57 }), boww: mk({ grip: [26, -66], sw: -1.57, lean: -0.08, ff: [16, 0], fb: [-16, 0] }),
  // shield brute
  bashw: mk({ grip: [-10, -60], sw: -1.2, lean: -0.1 }), basha: mk({ grip: [8, -56], sw: -1.0, lean: 0.4, ff: [30, 0], fb: [-24, 0], hy: -42 }),
};
const POSEK = Object.keys(POSE[`guard`]);
export function lerpPose(a, b, t, out = {}, snapFlags) {
  for (const k of POSEK) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va)) { out[k] = out[k] || [0, 0]; out[k][0] = lerp(va[0], vb[0], t); out[k][1] = lerp(va[1], vb[1], t); }
    else out[k] = k === 'sheath' || k === 'kneel' ? (snapFlags || t >= 0.5 ? vb : va) : lerp(va, vb, t);
  }
  return out;
}
const ATKPOSE = {
  cut: ['s1w', 's1a'], combo: ['s1w', 's1a'], cut2: ['s2w', 's2a'], flurry: ['s1w', 's1a'], flurry2: ['s2w', 's2a'], flurry3: ['s3w', 's3a'],
  thrust: ['thw', 'tha'], dthrust: ['thw', 'tha'], lunge: ['thw', 'tha'], rthrust: ['thw', 'tha'], sweep: ['swpw', 'swpa'], overhead: ['hw', 'ha'],
  shoot: ['boww', 'boww'], bash: ['bashw', 'basha'],
};
const GUARD = { ronin: 'guard', bandit: 'guard', duelist: 'guard', master: 'guard', spear: 'thw', archer: 'bowg', brute: 'bashw' };

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
  // smooth any pose discontinuity (state changes) over ~70 ms
  if (!fig.pose.ff) lerpPose(fig.target, fig.target, 0, fig.pose);
  const k = fig.snap ? 1 : Math.min(1, extra.dt * 16);
  lerpPose(fig.pose, fig.target, k, fig.pose, true); fig.snap = false;
  return fig.pose;
}

// two-bone IK: from a toward target b with lengths l1, l2. bend: +1/-1 sets which side the joint goes.
function ik(ax, ay, bx, by, l1, l2, bend, out) {
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 0.001; const dd = Math.min(d, l1 + l2 - 0.01);
  const a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), base = Math.atan2(dy, dx);
  const an = base + a * bend; out[0] = ax + Math.cos(an) * l1; out[1] = ay + Math.sin(an) * l1;
  out[2] = ax + (dx / d) * dd; out[3] = ay + (dy / d) * dd; return out;
}
const T4 = [0, 0, 0, 0], T4b = [0, 0, 0, 0];

export const LOOKS = {
  ronin: { sc: 1.12, wash: 0.52, hat: 'kasa', scarf: 1, weapon: 'katana', hak: 1 },
  bandit: { sc: 1, wash: 0.34, hat: 'band', weapon: 'katana', hak: 0.75 },
  spear: { sc: 1, wash: 0.34, hat: 'jingasa', weapon: 'spear', hak: 0.8 },
  archer: { sc: 0.97, wash: 0.32, hat: 'hood', weapon: 'bow', hak: 0.8, quiver: 1 },
  brute: { sc: 1.2, wash: 0.42, hat: 'bald', weapon: 'club', shield: 1, hak: 0.8, bulk: 1.35 },
  duelist: { sc: 1.02, wash: 0.4, hat: 'tail', weapon: 'katana', hak: 1, coat: 1 },
  master: { sc: 1.04, wash: 0.46, hat: 'topknot', weapon: 'katana', hak: 1, coat: 1, beard: 1 },
};

// Draw one figure. g is in world units (y down), (x, y) the ground point under the hip.
// fig: render-side record { pose, target, scarf:[...], t }. o: { face, alpha, accent, wind, vx, glint, boss, ink, shield }
export function drawFigure(g, x, y, look, pose, fig, o) {
  const L = LOOKS[look] || LOOKS.bandit, sc = L.sc, f = o.face, ink = o.ink || INK, A = o.alpha ?? 1, bulk = L.bulk || 1;
  const wind = o.wind || 0, t = fig.t || 0, vx = o.vx || 0;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (pose.roll) { /* unused */ }
  // dodge roll: rotate the crouched body around its centre
  if (o.roll) { g.translate(x, y - 22 * sc); g.rotate(o.roll * f); g.translate(-x, -(y - 22 * sc)); }
  const H = [x + f * pose.hx * sc, y + pose.hy * sc];
  const T = 33 * sc, lean = pose.lean;
  const N = [H[0] + Math.sin(lean) * f * T, H[1] - Math.cos(lean) * T];
  const ha = lean + pose.head, Hd = [N[0] + Math.sin(ha) * f * 9 * sc, N[1] - Math.cos(ha) * 9 * sc];
  const sway = (wind * 4 + Math.sin(t * 3.1) * 1.2) * sc, trail = clamp(-vx * 0.03, -6, 6) + wind * 5;
  const wash = rgba(ink, L.wash * A), dark = ink;
  // legs (IK, knees forward)
  const legs = [];
  for (const [ft, back] of [[pose.fb, 1], [pose.ff, 0]]) {
    const hx = H[0] - f * (back ? 3 : -3) * sc, hy = H[1];
    const F = [x + f * ft[0] * sc, y + ft[1] * sc];
    if (pose.kneel) {
      const knee = back ? [H[0] + f * 16 * sc, y - 3 * sc] : [H[0] + f * 19 * sc, y - 4 * sc];
      legs.push([hx, hy, knee[0], knee[1], H[0] - f * 12 * sc, y - 1 * sc, back]);
    } else { ik(hx, hy, F[0], F[1], 27 * sc, 27 * sc, f > 0 ? -1 : 1, T4); legs.push([hx, hy, T4[0], T4[1], T4[2], T4[3], back]); }
  }
  // hakama: each leg a wide pleated trouser that flares at the hem and lifts in the wind
  for (const lg of legs) {
    const [hx, hy, kx, ky, fx, fy, back] = lg, hl = L.hak;
    const flut = sway * 0.7 - f * trail * 0.35 + Math.sin(t * 6 + (back ? 1.7 : 0)) * 0.8 * (0.3 + Math.abs(wind));
    const hemx = lerp(kx, fx, hl) + flut, hemy = lerp(ky, fy, hl) - 1;
    const ax = kx - hx, ay = ky - hy, al = Math.hypot(ax, ay) || 1, nx = -ay / al, ny = ax / al;
    const bx = hemx - kx, by = hemy - ky, bl = Math.hypot(bx, by) || 1, mx = -by / bl, my = bx / bl;
    const w0 = 9 * sc * bulk, w1 = 10.5 * sc * bulk, w2 = 15 * sc * bulk;
    const P0 = [hx + nx * w0, hy + ny * w0], P1 = [kx + nx * w1, ky + ny * w1], P2 = [hemx + mx * w2 + flut * 0.6, hemy + my * w2], Q2 = [hemx - mx * w2 + flut * 0.3, hemy - my * w2], Q1 = [kx - nx * w1, ky - ny * w1], Q0 = [hx - nx * w0, hy - ny * w0];
    g.globalAlpha = 1; g.fillStyle = back ? rgba(ink, Math.min(0.9, L.wash * 1.35) * A) : wash;
    g.beginPath(); g.moveTo(P0[0], P0[1]); g.quadraticCurveTo(P1[0], P1[1], P2[0], P2[1]); g.quadraticCurveTo((P2[0] + Q2[0]) / 2, (P2[1] + Q2[1]) / 2 + 2 * sc, Q2[0], Q2[1]); g.quadraticCurveTo(Q1[0], Q1[1], Q0[0], Q0[1]); g.closePath(); g.fill();
    // brushed outer edges and two pleats
    g.globalAlpha = A; ribbon(g, [P0[0], P0[1], P1[0], P1[1], P2[0], P2[1]], (u) => (2.6 - u * 1.6) * sc, dark, A * 0.9, 0);
    ribbon(g, [Q0[0], Q0[1], Q1[0], Q1[1], Q2[0], Q2[1]], (u) => (1.8 - u * 1.2) * sc, dark, A * 0.6, 0);
    g.strokeStyle = dark; g.lineWidth = 0.8 * sc; g.globalAlpha = A * 0.45;
    for (const k of [0.33, 0.66]) { g.beginPath(); g.moveTo(lerp(P0[0], Q0[0], k), lerp(P0[1], Q0[1], k)); g.quadraticCurveTo(lerp(P1[0], Q1[0], k), lerp(P1[1], Q1[1], k), lerp(P2[0], Q2[0], k), lerp(P2[1], Q2[1], k)); g.stroke(); }
    g.globalAlpha = A;
    if (hl < 1 || pose.kneel) { g.lineWidth = 2.6 * sc; g.beginPath(); g.moveTo(hemx, hemy); g.lineTo(fx, fy); g.stroke(); }
    ribbon(g, [fx - f * 2 * sc, fy - 1.5 * sc, fx + f * 3 * sc, fy - 0.8 * sc, fx + f * 7 * sc, fy], (u) => (3 - u) * sc, dark, A, 0);
  }
  // weapon geometry
  const sw = pose.sw, dx = Math.cos(sw) * f, dy = Math.sin(sw);
  const G = [H[0] + f * pose.grip[0] * sc, H[1] + (pose.grip[1] - pose.hy) * sc * 1 + (pose.hy - -49) * 0 ];
  // grip is relative to the ground point vertically (so crouches lower the hands too)
  G[1] = y + pose.grip[1] * sc + (pose.hy + 49) * 0.4 * sc;
  const S = [N[0] - f * 1.5 * sc, N[1] + 4 * sc];
  // back sleeve and arm first
  let hand2;
  if (L.weapon === 'spear') hand2 = [G[0] - dx * 30 * sc, G[1] - dy * 30 * sc];
  else if (L.weapon === 'bow') hand2 = [G[0] - f * (o.draw || 0) * 26 * sc - f * 6 * sc, G[1] + 2 * sc];
  else if (L.weapon === 'club') hand2 = [G[0], G[1]];
  else hand2 = [G[0] - dx * 7 * sc, G[1] - dy * 7 * sc];
  if (pose.sheath && L.weapon === 'katana') hand2 = [H[0] - f * 2 * sc, H[1] + 6 * sc];
  if (pose.open) hand2 = [N[0] - f * 26 * sc, N[1] + 8 * sc];
  const arm = (sx, sy, hx2, hy2, back) => {
    ik(sx, sy, hx2, hy2, 18 * sc, 18 * sc, f > 0 ? 1 : -1, T4b);
    const ex = T4b[0], ey = T4b[1], wx = T4b[2], wy = T4b[3];
    // sleeve: hangs from the arm and trails with wind and motion
    const dropx = sway * 1.6 - f * trail, dropy = 15 * sc;
    g.globalAlpha = 1; g.fillStyle = back ? rgba(ink, L.wash * 1.3 * A) : rgba(ink, (L.wash + 0.06) * A);
    g.beginPath(); g.moveTo(sx, sy - 3 * sc); g.lineTo(ex, ey - 2 * sc); g.lineTo(lerp(ex, wx, 0.7), lerp(ey, wy, 0.7));
    g.quadraticCurveTo(lerp(ex, wx, 0.6) + dropx, lerp(ey, wy, 0.6) + dropy, ex + dropx * 0.6 - f * 4 * sc, ey + dropy * 0.9);
    g.quadraticCurveTo(sx + dropx * 0.3, sy + dropy * 0.8, sx, sy + 6 * sc); g.closePath(); g.fill();
    g.globalAlpha = A; g.strokeStyle = dark; g.lineWidth = 1.4 * sc; g.beginPath(); g.moveTo(lerp(ex, wx, 0.6), lerp(ey, wy, 0.6)); g.quadraticCurveTo(lerp(ex, wx, 0.6) + dropx, lerp(ey, wy, 0.6) + dropy, ex + dropx * 0.6 - f * 4 * sc, ey + dropy * 0.9); g.stroke();
    // forearm and hand
    g.lineWidth = 2.6 * sc; g.beginPath(); g.moveTo(lerp(ex, wx, 0.5), lerp(ey, wy, 0.5)); g.lineTo(wx, wy); g.stroke();
    drop(g, wx, wy, 2.3 * sc, dark, A);
  };
  arm(S[0] - f * 3 * sc, S[1], hand2[0], hand2[1], 1);
  // quiver
  if (L.quiver) { g.globalAlpha = A * 0.8; g.strokeStyle = dark; g.lineWidth = 4 * sc; g.beginPath(); g.moveTo(N[0] - f * 8 * sc, N[1] + 2 * sc); g.lineTo(H[0] - f * 10 * sc, H[1] - 4 * sc); g.stroke(); g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(N[0] - f * (6 + i * 2) * sc, N[1] + 2 * sc); g.lineTo(N[0] - f * (4 + i * 3) * sc, N[1] - 8 * sc); g.stroke(); } }
  // torso (kimono): narrow at the obi, broad at the shoulders, a darker wash than the hakama
  const tw = 19 * sc * bulk;
  ribbon(g, [H[0], H[1] + 2 * sc, lerp(H[0], N[0], 0.5), lerp(H[1], N[1], 0.5), N[0], N[1] + 1 * sc], (u) => tw * (0.82 + u * 0.32), rgba(ink, Math.min(0.92, L.wash + 0.16) * A), 1, 0);
  if (L.coat) { const cx = H[0] - f * 6 * sc + sway - f * trail * 0.6, cy = H[1] + 26 * sc; g.globalAlpha = 1; g.fillStyle = rgba(ink, L.wash * 0.9 * A); g.beginPath(); g.moveTo(N[0] - f * 8 * sc, N[1] + 2 * sc); g.quadraticCurveTo(H[0] - f * 14 * sc, H[1], cx - f * 6 * sc, cy); g.lineTo(cx + f * 10 * sc, cy - 4 * sc); g.lineTo(H[0] + f * 2 * sc, H[1]); g.closePath(); g.fill(); }
  g.globalAlpha = A;
  ribbon(g, [H[0] - f * tw * 0.42, H[1], lerp(H[0], N[0], 0.5) - f * tw * 0.62, lerp(H[1], N[1], 0.5), N[0] - f * tw * 0.5, N[1] + 3 * sc], (u) => (1.2 + Math.sin(u * Math.PI) * 1.8) * sc, dark, A * 0.95, 0);
  g.strokeStyle = dark;
  // collar (the kimono's crossing line)
  g.lineWidth = 1.4 * sc; g.beginPath(); g.moveTo(N[0] - f * 4 * sc, N[1] + 1 * sc); g.lineTo(lerp(N[0], H[0], 0.45) + f * 3 * sc, lerp(N[1], H[1], 0.45)); g.stroke();
  // obi
  g.globalAlpha = A; g.fillStyle = o.sash || dark; ribbon(g, [H[0] + Math.sin(lean) * f * 2 * sc, H[1] - 2 * sc, H[0] + Math.sin(lean) * f * 7 * sc, H[1] - 10 * sc], () => tw * 0.98, o.sash || dark, A * 0.92, 0);
  // sheath at the hip
  if (L.weapon === 'katana') {
    const sa = 0.35, sx0 = H[0] + f * 8 * sc, sy0 = H[1] - 6 * sc;
    g.globalAlpha = A; g.strokeStyle = dark; g.lineWidth = 2.6 * sc; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(sx0 - f * Math.cos(sa) * 40 * sc, sy0 + Math.sin(sa) * 40 * sc); g.stroke();
  }
  // head
  g.globalAlpha = A; g.fillStyle = dark; g.beginPath(); g.ellipse(Hd[0] + f * 0.5 * sc, Hd[1] + 0.5 * sc, 5.8 * sc, 6.8 * sc, ha * f, 0, 6.3); g.fill();
  drawHat(g, L, Hd, ha, f, sc, A, dark, wind, t, o);
  // scarf: a verlet chain anchored at the neck
  if (L.scarf && fig.scarf) {
    const ch = fig.scarf; ch[0][0] = N[0] - f * 2 * sc; ch[0][1] = N[1] + 2 * sc;
    const pts = []; for (const q of ch) pts.push(q[0], q[1]);
    ribbon(g, pts, (u) => (5.6 - u * 3.6) * sc, o.scarf || dark, A * 0.95, 0.5);
  }
  // front arm and weapon
  if (L.shield) {
    const SX = H[0] + f * (o.shieldOut ? 22 : 14) * sc, SY = H[1] - 18 * sc;
    if (o.shield) {
      g.globalAlpha = A * 0.85; g.fillStyle = rgba(ink, 0.55 * A); g.fillRect(SX - 5 * sc, SY - 30 * sc, 10 * sc, 58 * sc);
      g.globalAlpha = A; g.strokeStyle = dark; g.lineWidth = 2.2 * sc; g.strokeRect(SX - 5 * sc, SY - 30 * sc, 10 * sc, 58 * sc);
      for (let i = 0; i < 4; i++) drop(g, SX, SY - 24 * sc + i * 15 * sc, 1.4 * sc, dark, A);
    }
  }
  drawWeapon(g, L, G, dx, dy, f, sc, A, dark, pose, o, H);
  if (L.weapon !== 'club') arm(S[0] + f * 2 * sc, S[1] + 1 * sc, G[0], G[1], 0);
  else arm(S[0] + f * 2 * sc, S[1] + 1 * sc, G[0], G[1], 0);
  // beard
  if (L.beard) { g.globalAlpha = A * 0.8; g.strokeStyle = dark; g.lineWidth = 1.2 * sc; g.beginPath(); g.moveTo(Hd[0] + f * 4 * sc, Hd[1] + 5 * sc); g.quadraticCurveTo(Hd[0] + f * 3 * sc, Hd[1] + 12 * sc, Hd[0] - f * 1 * sc + sway, Hd[1] + 16 * sc); g.stroke(); }
  g.restore();
  return { G, dx, dy, N, H, Hd };
}
function drawHat(g, L, Hd, ha, f, sc, A, dark, wind, t, o) {
  // hats stay on: the brim tilts a little with the head, never flips
  ha = L.hat === 'kasa' || L.hat === 'jingasa' ? clamp(ha * 0.5, -0.3, 0.35) : ha;
  const c = Math.cos(ha), s = Math.sin(ha) * f;
  const P = (u, v) => [Hd[0] + u * c * sc - v * s * sc, Hd[1] + u * s * sc + v * c * sc];
  g.globalAlpha = A;
  if (L.hat === 'kasa') {
    // a wide straw hat: wash body, dark brim, dry strands from the crown
    const a1 = P(-21, 0), a2 = P(21, 0), ap = P(0, -13), m = P(0, 2);
    g.fillStyle = o.hatCol || '#5b5248'; g.beginPath(); g.moveTo(a1[0], a1[1]); g.quadraticCurveTo(P(-8, -8)[0], P(-8, -8)[1], ap[0], ap[1]); g.quadraticCurveTo(P(8, -8)[0], P(8, -8)[1], a2[0], a2[1]); g.quadraticCurveTo(m[0], m[1], a1[0], a1[1]); g.fill();
    g.strokeStyle = dark; g.lineWidth = 2.2 * sc; g.beginPath(); g.moveTo(a1[0], a1[1]); g.quadraticCurveTo(m[0], m[1], a2[0], a2[1]); g.stroke();
    g.lineWidth = 0.8 * sc; g.globalAlpha = A * 0.6;
    for (let i = -3; i <= 3; i++) { const e = P(i * 6, 0), q = P(i * 1.2, -11); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(e[0], e[1]); g.stroke(); }
    g.globalAlpha = A * 0.4; g.fillStyle = '#f3ecdc'; g.beginPath(); g.moveTo(P(-14, -2)[0], P(-14, -2)[1]); g.quadraticCurveTo(P(-6, -9)[0], P(-6, -9)[1], P(-1, -12)[0], P(-1, -12)[1]); g.quadraticCurveTo(P(-7, -6)[0], P(-7, -6)[1], P(-14, -2)[0], P(-14, -2)[1]); g.fill();
    // chin cord
    g.globalAlpha = A * 0.7; g.lineWidth = 0.8 * sc; const cb = P(2, 9); g.beginPath(); g.moveTo(P(-5, 1)[0], P(-5, 1)[1]); g.lineTo(cb[0], cb[1]); g.lineTo(P(6, 1)[0], P(6, 1)[1]); g.stroke();
  } else if (L.hat === 'jingasa') {
    const a1 = P(-14, -3), a2 = P(14, -3), ap = P(0, -11);
    g.fillStyle = rgba(INK, 0.8 * A); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(ap[0], ap[1]); g.lineTo(a2[0], a2[1]); g.closePath(); g.fill();
    g.strokeStyle = dark; g.lineWidth = 1.8 * sc; g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke();
  } else if (L.hat === 'band') {
    const b1 = P(-6, -3), b2 = P(6, -3); g.strokeStyle = o.bandCol || dark; g.lineWidth = 2.6 * sc; g.beginPath(); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.stroke();
    const tl = P(-7, -3); g.lineWidth = 1.5 * sc; g.beginPath(); g.moveTo(tl[0], tl[1]); g.quadraticCurveTo(tl[0] - f * 6 * sc + wind * 4, tl[1] + 3 * sc, tl[0] - f * 13 * sc + wind * 8 + Math.sin(t * 9) * 2, tl[1] + 1 * sc + Math.sin(t * 7) * 2); g.stroke();
    const kn = P(-2, -10); drop(g, kn[0], kn[1], 2.6 * sc, dark, A);
  } else if (L.hat === 'hood') {
    const h1 = P(-8, 6), h2 = P(-9, -6), h3 = P(4, -9); g.fillStyle = rgba(INK, 0.7 * A); g.beginPath(); g.moveTo(h1[0], h1[1]); g.quadraticCurveTo(h2[0], h2[1], h3[0], h3[1]); g.lineTo(P(7, -2)[0], P(7, -2)[1]); g.quadraticCurveTo(P(-2, 0)[0], P(-2, 0)[1], h1[0], h1[1]); g.fill();
  } else if (L.hat === 'tail' || L.hat === 'topknot') {
    const k = P(-3, -8); drop(g, k[0], k[1], 2.8 * sc, dark, A);
    if (L.hat === 'tail') { g.strokeStyle = dark; g.lineWidth = 2.4 * sc; g.beginPath(); g.moveTo(k[0], k[1]); g.bezierCurveTo(k[0] - f * 8 * sc, k[1] + 4 * sc, k[0] - f * 14 * sc + wind * 6, k[1] + 10 * sc, k[0] - f * 22 * sc + wind * 10 + Math.sin(t * 5) * 3, k[1] + 16 * sc); g.stroke(); }
    else { g.strokeStyle = dark; g.lineWidth = 2 * sc; g.beginPath(); g.moveTo(k[0], k[1]); g.lineTo(k[0] + f * 4 * sc, k[1] - 4 * sc); g.stroke(); }
  }
}
function drawWeapon(g, L, G, dx, dy, f, sc, A, dark, pose, o, H) {
  g.globalAlpha = A; g.strokeStyle = dark;
  if (L.weapon === 'katana') {
    if (pose.sheath) return;
    const len = 50 * sc, ex = G[0] + dx * len, ey = G[1] + dy * len, px = -dy, py = dx;
    // hilt behind the hands
    g.lineWidth = 3 * sc; g.beginPath(); g.moveTo(G[0] - dx * 11 * sc, G[1] - dy * 11 * sc); g.lineTo(G[0], G[1]); g.stroke();
    // blade with a little curve; the edge catches light (paper colour) when the glint flashes
    g.lineWidth = 1.8 * sc; g.beginPath(); g.moveTo(G[0], G[1]); g.quadraticCurveTo(G[0] + dx * len * 0.5 + px * 2.2 * sc * f, G[1] + dy * len * 0.5 + py * 2.2 * sc * f, ex, ey); g.stroke();
    g.lineWidth = 3.4 * sc; g.beginPath(); g.moveTo(G[0] + px * 3 * sc, G[1] + py * 3 * sc); g.lineTo(G[0] - px * 3 * sc, G[1] - py * 3 * sc); g.stroke();
    o._tip = [ex, ey];
  } else if (L.weapon === 'spear') {
    const b0 = [G[0] - dx * 62 * sc, G[1] - dy * 62 * sc], tip = [G[0] + dx * 82 * sc, G[1] + dy * 82 * sc];
    g.lineWidth = 2.2 * sc; g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(tip[0], tip[1]); g.stroke();
    const px = -dy, py = dx; g.fillStyle = dark; g.beginPath(); g.moveTo(tip[0] + dx * 16 * sc, tip[1] + dy * 16 * sc); g.lineTo(tip[0] + px * 2.6 * sc, tip[1] + py * 2.6 * sc); g.lineTo(tip[0] - px * 2.6 * sc, tip[1] - py * 2.6 * sc); g.closePath(); g.fill();
    o._tip = [tip[0] + dx * 14 * sc, tip[1] + dy * 14 * sc];
  } else if (L.weapon === 'bow') {
    const bx = G[0], by = G[1], hh = 34 * sc, pull = (o.draw || 0) * 22 * sc;
    g.lineWidth = 2 * sc; g.beginPath(); g.moveTo(bx - f * 4 * sc, by - hh); g.quadraticCurveTo(bx + f * 12 * sc, by, bx - f * 4 * sc, by + hh * 0.75); g.stroke();
    g.lineWidth = 0.7 * sc; g.beginPath(); g.moveTo(bx - f * 4 * sc, by - hh); g.lineTo(bx - f * (4 * sc + pull), by); g.lineTo(bx - f * 4 * sc, by + hh * 0.75); g.stroke();
    if (o.draw > 0.1) { g.lineWidth = 1.2 * sc; g.beginPath(); g.moveTo(bx - f * (4 * sc + pull), by); g.lineTo(bx + f * 14 * sc, by); g.stroke(); }
    o._tip = [bx + f * 12 * sc, by];
  } else if (L.weapon === 'club') {
    const len = 54 * sc, ex = G[0] + dx * len, ey = G[1] + dy * len;
    ribbon(g, [G[0] - dx * 8 * sc, G[1] - dy * 8 * sc, G[0] + dx * len * 0.5, G[1] + dy * len * 0.5, ex, ey], (u) => (3 + u * 6) * sc, dark, A * 0.9, 0);
    for (let i = 0; i < 4; i++) drop(g, G[0] + dx * len * (0.5 + i * 0.13), G[1] + dy * len * (0.5 + i * 0.13), 1.3 * sc, dark, A);
    o._tip = [ex, ey];
  }
}

// render-side record for a figure: pose buffers and a scarf chain
export function newFig(withScarf) {
  const f = { pose: {}, target: {}, t: 0, snap: true };
  if (withScarf) f.scarf = Array.from({ length: 8 }, () => [0, 0, 0, 0]);
  return f;
}
export function stepScarf(fig, ax, ay, face, wind, vx, dt, init) {
  const ch = fig.scarf; if (!ch) return; const seg = 5.4;
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
