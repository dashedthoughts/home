// KAZE figures, drawn like brush-and-ink manga: a hidden skeleton (hip, torso, head, two-bone IK arms and legs)
// carries a few SOLID painted masses (hakama as one shape, kimono, sleeves, head, hands, feet), each with a flat wash,
// dry-brush grain, a darker pooled edge and one outline that swells and tapers like a loaded brush.
// The outline boils 12 times a second with a per-figure seed. Poses are numbers that tween with easing; the grip moves
// on arcs around the shoulder; cloth, hair and cords lag the body on springs.
import { INK, rgba, mix, ribbon, drop, clamp, lerp, hash, makeCanvas, rng } from './brush.js';
import { ATK } from './data.js';
import { hakamaTargets, hakamaPolys, stepChain, hull, soften, insideConvex } from './cloth.js';

const E = { out: (t) => 1 - (1 - t) * (1 - t), inout: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)), back: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2) };
// a pose: hip offset, lean, head tilt, feet, grip (relative to hip), sword angle (0 = forward, -PI/2 = up)
const mk = (o) => Object.assign({ hx: 0, hy: -49, lean: 0.06, head: 0, ff: [12, 0], fb: [-14, 0], grip: [16, -52], sw: -0.75, kneel: 0, roll: 0, sheath: 0, open: 0 }, o);
export const POSE = {
  stand: mk({ grip: [8, -50], sw: 0.9, sheath: 1, ff: [6, 0], fb: [-8, 0], hy: -51, lean: 0.03 }),
  guard: mk({ grip: [20, -58], sw: -0.62, lean: 0.14, head: 0.1, ff: [18, 0], fb: [-24, 0], hy: -46 }),
  parry: mk({ grip: [19, -70], sw: -1.45, lean: -0.1, head: -0.1, ff: [18, 0], fb: [-20, 0], hy: -44 }),
  s1w: mk({ grip: [-8, -94], sw: -2.6, lean: -0.22, ff: [16, 0], fb: [-22, 0], hy: -46 }), s1a: mk({ grip: [42, -46], sw: 0.6, lean: 0.26, head: 0.2, ff: [36, 0], fb: [-30, -4], hy: -40 }),
  s2w: mk({ grip: [16, -34], sw: 0.95, lean: 0.32, hy: -42, ff: [22, 0], fb: [-18, 0] }), s2a: mk({ grip: [28, -92], sw: -1.3, lean: -0.08, ff: [24, 0], fb: [-14, 0], hy: -47 }),
  s3w: mk({ grip: [-12, -92], sw: -2.9, lean: -0.2, ff: [16, 0], fb: [-22, 0] }), s3a: mk({ grip: [46, -42], sw: 0.72, lean: 0.26, head: 0.25, ff: [40, 0], fb: [-34, -4], hy: -37 }),
  hw: mk({ grip: [-4, -100], sw: -1.95, lean: -0.15, ff: [16, 0], fb: [-18, 0] }), ha: mk({ grip: [42, -36], sw: 1.0, lean: 0.26, head: 0.25, ff: [40, 0], fb: [-34, -4], hy: -36 }),
  thw: mk({ grip: [-2, -52], sw: 0.02, lean: 0.0, ff: [16, 0], fb: [-20, 0] }), tha: mk({ grip: [44, -56], sw: 0.02, lean: 0.26, head: 0.15, ff: [40, 0], fb: [-34, -4], hy: -39 }),
  swpw: mk({ grip: [-12, -40], sw: 2.7, lean: 0.25, ff: [16, 0], fb: [-20, 0], hy: -40 }), swpa: mk({ grip: [34, -30], sw: 0.25, lean: 0.4, ff: [30, 0], fb: [-22, 0], hy: -34 }),
  hit: mk({ grip: [8, -52], sw: -0.3, lean: -0.42, ff: [16, 0], fb: [-10, 0], hy: -47, head: -0.3 }),
  stun: mk({ grip: [4, -50], sw: 0.2, lean: -0.3, head: -0.2 }),
  opened: mk({ grip: [-6, -92], sw: -2.2, lean: -0.5, head: -0.45, ff: [18, 0], fb: [-6, 0], hy: -47, open: 1 }),
  dodge: mk({ hy: -22, lean: 1.2, head: 0.5, ff: [14, -6], fb: [-6, -4], grip: [16, -22], sw: 0.25 }),
  bow: mk({ grip: [8, -50], sw: 0.9, sheath: 1, lean: 0.95, head: 0.3, ff: [6, 0], fb: [-6, 0], hy: -49 }),
  sit: mk({ grip: [10, -24], sw: 0.9, sheath: 1, lean: 0.05, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  kneel: mk({ grip: [24, -6], sw: 0.0, sheath: 0, lean: 0.25, head: 0.35, hy: -24, kneel: 1, ff: [-14, 0], fb: [-14, 0] }),
  focus: mk({ grip: [9, -44], sw: 0.95, sheath: 1, lean: 0.5, ff: [27, 0], fb: [-46, 0], hy: -34, head: -0.42 }),
  iai: mk({ grip: [50, -60], sw: 0.04, lean: 0.26, head: -0.15, ff: [42, 0], fb: [-40, -3], hy: -35 }),
  heal: mk({ grip: [10, -40], sw: 0.9, sheath: 1, lean: 0.25, hy: -30, head: 0.35, kneel: 1, ff: [-10, 0], fb: [-14, 0] }),
  dead: mk({ grip: [10, -8], sw: 0.1, lean: -1.45, head: -0.3, hy: -12, ff: [24, 0], fb: [18, 0] }),
  // bow (archer)
  // guard stances as shape language: each cast member holds the sword its own way
  hasso: mk({ grip: [6, -84], sw: -1.95, lean: 0.12, ff: [22, 0], fb: [-26, 0], hy: -42 }),
  waki: mk({ grip: [-8, -42], sw: 2.75, lean: 0.24, head: 0.15, ff: [22, 0], fb: [-24, 0], hy: -43 }),
  jodan: mk({ grip: [8, -104], sw: -1.35, lean: -0.05, ff: [11, 0], fb: [-13, 0], hy: -50 }),
  iaigoshi: mk({ grip: [8, -48], sw: 0.95, sheath: 1, lean: 0.06, ff: [9, 0], fb: [-11, 0], hy: -50 }),
  bowg: mk({ grip: [24, -44], sw: -1.57, kneel: 1, hy: -27, lean: 0.05, ff: [-14, 0], fb: [-14, 0] }), boww: mk({ grip: [28, -48], sw: -1.57, kneel: 1, hy: -28, lean: -0.1, ff: [-14, 0], fb: [-14, 0] }),
  katsugi: mk({ grip: [14, -72], sw: -2.7, lean: 0.08, head: 0.05, ff: [16, 0], fb: [-20, 0], hy: -46 }),
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
  out.gait = 0; // set again by walkLegs when a gait is applied
  return out;
}
const ATKPOSE = {
  cut: ['s1w', 's1a'], combo: ['s1w', 's1a'], cut2: ['s2w', 's2a'], flurry: ['s1w', 's1a'], flurry2: ['s2w', 's2a'], flurry3: ['s3w', 's3a'],
  thrust: ['thw', 'tha'], dthrust: ['thw', 'tha'], lunge: ['thw', 'tha'], rthrust: ['thw', 'tha'], sweep: ['swpw', 'swpa'], overhead: ['hw', 'ha'],
  shoot: ['boww', 'boww'], bash: ['bashw', 'basha'],
};
const GUARD = { ronin: 'guard', bandit: 'hasso', duelist: 'waki', master: 'iaigoshi', spear: 'thw', archer: 'bowg', brute: 'bashw', gonroku: 'katsugi', shizu: 'jodan', ono: 'thw', hyoe: 'bashw' };
export const guardPose = (look) => POSE[GUARD[look] || 'guard'];

// ---------- animation: pose to pose ----------
POSE.flick = mk({ grip: [28, -46], sw: 1.05, lean: 0.12, ff: [14, 0], fb: [-18, 0], hy: -48 });
POSE.sheathing = mk({ grip: [4, -52], sw: 2.75, lean: 0.06, ff: [10, 0], fb: [-12, 0], hy: -50 });
// Every strike: anticipation (weight back, hips cocked) -> a fast strike on an arc where the hips lead, the shoulders
// follow and the blade arrives last -> a held follow-through that overshoots -> recovery. Transitions between
// unrelated poses blend through an in-between over ~70 ms; within a state the pose follows its timeline exactly.
const FT = {};
function follow(wn, an) {
  const key = wn + '>' + an; if (FT[key]) return FT[key];
  const w = POSE[wn], a = POSE[an], o = lerpPose(a, a, 0, {});
  const ang = (q) => Math.atan2(q[1] + 82, q[0] - 2);
  let d = ang(a.grip) - ang(w.grip); while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  const r = Math.hypot(a.grip[0] - 2, a.grip[1] + 82), an2 = ang(a.grip) + Math.sign(d || 1) * 0.42;
  o.grip = [2 + Math.cos(an2) * r, -82 + Math.sin(an2) * r]; o.sw = a.sw + Math.sign(a.sw - w.sw || 1) * 0.38;
  o.lean = a.lean + 0.06; o.hx = (a.hx || 0) + 3; o.hy = a.hy + 1.5;
  return (FT[key] = o);
}
// strike timeline shared by the ronin and the foes; out is written into fig.target
function strike(out, base, wn, an, tt, W, Act, Rec, guard) {
  const w = POSE[wn], a = POSE[an], ft = follow(wn, an);
  if (tt < W) { const u = E.out(tt / W); lerpPose(base, w, u, out); out.hx = lerp(0, -4, u); }
  else if (tt < W + Act) {
    const u = (tt - W) / Act;
    lerpPose(w, a, 0, out);
    // hips first, shoulders after, blade last
    out.hx = lerp(-4, 5, Math.sqrt(u)); out.hy = lerp(w.hy, a.hy, Math.sqrt(u));
    out.ff = [lerp(w.ff[0], a.ff[0], Math.sqrt(u)), lerp(w.ff[1], a.ff[1], u)]; out.fb = [lerp(w.fb[0], a.fb[0], u), lerp(w.fb[1], a.fb[1], u)];
    out.lean = lerp(w.lean, a.lean, u * u * (3 - 2 * u)); out.head = lerp(w.head, a.head, u);
    const ug = u * u; const tmp = lerpPose(w, a, ug, {}); out.grip = tmp.grip; out.sw = tmp.sw;
  } else {
    const u = clamp((tt - W - Act) / Rec, 0, 1);
    if (u < 0.42) { lerpPose(a, ft, E.out(u / 0.42), out); out.hx = 5 + 3 * E.out(u / 0.42); }
    else { lerpPose(ft, guard, E.inout((u - 0.42) / 0.58), out); out.hx = lerp(8, 0, E.inout((u - 0.42) / 0.58)); }
  }
  return out;
}
// keyframes: [[t, pose, ease?], ...] sampled at tt
function keys(out, tt, K) {
  if (tt <= K[0][0]) return lerpPose(K[0][1], K[0][1], 0, out);
  for (let i = 1; i < K.length; i++) if (tt <= K[i][0]) { const u = (tt - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return lerpPose(K[i - 1][1], K[i][1], (K[i][2] || E.inout)(clamp(u, 0, 1)), out); }
  return lerpPose(K[K.length - 1][1], K[K.length - 1][1], 0, out);
}
const EI = (t) => t * t; // ease in: falls accelerate
const X = (base, o) => Object.assign(lerpPose(base, base, 0, {}), o);
POSE.snap = X(POSE.hit, { lean: -0.5, head: -0.55, hx: 0 });
POSE.catchStep = X(POSE.hit, { lean: -0.25, head: -0.2, hx: -5, fb: [-22, -3], ff: [10, 0] });
POSE.fold = X(POSE.stun, { lean: 0.55, head: 0.4, hy: -42, grip: [10, -40], sw: 0.6 });
POSE.lift = X(POSE.hit, { lean: -0.75, head: -0.5, hy: -58, ff: [16, -12], fb: [4, -16] });
POSE.downBack = X(POSE.dead, { lean: -1.42, hy: -11, ff: [26, 0], fb: [18, -3] });
POSE.deadFwd = mk({ grip: [26, -6], sw: 0.2, lean: 1.42, head: 0.25, hy: -10, ff: [-22, 0], fb: [-30, -2] });
POSE.knee = mk({ grip: [18, -30], sw: 0.5, lean: 0.35, head: 0.4, hy: -27, kneel: 1, ff: [-14, 0], fb: [-14, 0] });
POSE.rise = X(POSE.guard, { hy: -38, lean: 0.3, ff: [14, 0], fb: [-20, 0] });
// the dodge is a committed step-slide along the ground: plant, burst, slide low, skid, recover into guard
POSE.dPlant = mk({ grip: [14, -50], sw: -0.4, lean: -0.08, head: 0.1, ff: [12, 0], fb: [-20, 0], hy: -43 });
POSE.dBurst = mk({ grip: [24, -40], sw: 0.2, lean: 0.55, head: 0.35, ff: [36, -2], fb: [-34, -3], hy: -31 });
POSE.dSlide = mk({ grip: [22, -32], sw: 0.35, lean: 0.4, head: 0.3, ff: [34, 0], fb: [-42, -2], hy: -25 });
POSE.dSkid = mk({ grip: [18, -42], sw: -0.3, lean: -0.08, head: 0.05, ff: [26, -1], fb: [-26, 0], hy: -34 });
POSE.dBack1 = mk({ grip: [16, -54], sw: -0.6, lean: -0.3, head: -0.1, ff: [18, -3], fb: [-28, 0], hy: -36 });
POSE.dBack2 = mk({ grip: [14, -50], sw: -0.5, lean: -0.15, head: 0, ff: [24, -1], fb: [-30, 0], hy: -30 });
const DODGE = [[0, POSE.dPlant], [0.05, POSE.dPlant], [0.12, POSE.dBurst, E.out], [0.26, POSE.dSlide], [0.35, POSE.dSkid, E.out], [0.42, POSE.guard]];
const DODGE_RUN = [[0, POSE.dBurst], [0.16, POSE.dSlide], [0.33, POSE.dSkid, E.out], [0.42, POSE.guard]];
const DODGE_BACK = [[0, POSE.dPlant], [0.05, POSE.dBack1, E.out], [0.22, POSE.dBack2], [0.34, POSE.dSkid, E.out], [0.42, POSE.guard]];

// Pose for a sim entity. fig is the persistent render-side record.
export function poseFor(fig, e, kind, t, isPlayer, extra) {
  const P = POSE, gname = GUARD[kind] || 'guard', g = P[gname], T = fig.target, st = e.st, tt = e.stt;
  if (isPlayer) {
    const sl = [['s1w', 's1a'], ['s2w', 's2a'], ['s3w', 's3a']], base = e.drawn ? P.guard : P.stand;
    switch (st) {
      case 'slash': { const [w, ac] = sl[e.combo || 0], A = extra.slash[e.combo || 0]; strike(T, e.combo ? P[sl[e.combo - 1][1]] : base, w, ac, tt, A.wind, A.act, A.rec, P.guard); break; }
      case 'heavy': case 'counter': { const A = extra[st]; strike(T, P.guard, 'hw', 'ha', tt, A.wind, A.act, A.rec, P.guard); break; }
      case 'guard': lerpPose(P.guard, P.parry, E.out(clamp(tt / 0.06, 0, 1)), T); break;
      case 'dodge': { const back = e.dodgeDir != null && e.dodgeDir !== e.face; keys(T, tt, back ? DODGE_BACK : e.fromRun ? DODGE_RUN : DODGE); break; }
      case 'hit': if ((extra.hitDmg || 1) > 1) keys(T, tt, [[0, P.guard], [0.05, P.lift, E.out], [0.2, P.catchStep, EI], [0.36, P.guard]]); else keys(T, tt, [[0, P.guard], [0.05, P.snap, E.out], [0.16, P.catchStep], [0.36, P.guard]]); break;
      case 'bow': lerpPose(P.stand, P.bow, clamp(Math.sin(clamp(tt / 1.2, 0, 1) * Math.PI) * 1.6, 0, 1), T); break;
      case 'sit': lerpPose(P.stand, P.sit, E.inout(clamp(tt / 0.6, 0, 1)), T); break;
      case 'heal': lerpPose(base, P.heal, Math.sin(clamp(tt / 0.75, 0, 1) * Math.PI), T); break;
      case 'take': lerpPose(P.stand, P.bow, Math.sin(clamp(tt / 1.0, 0, 1) * Math.PI) * 0.6, T); break;
      case 'focus': lerpPose(P.focus, P.focus, 0, T); break;
      case 'iai': strike(T, P.focus, 'focus', 'iai', tt + 0.001, 0.001, 0.1, 1.2, P.iai); break;
      case 'kneel': lerpPose(P.stand, P.kneel, E.inout(clamp(tt / 1.2, 0, 1)), T); break;
      // the ronin's death: a hit, the knees go, a held moment, then a slow fall forward
      case 'dead': keys(T, tt, [[0, P.guard], [0.08, P.snap, E.out], [0.42, P.knee, E.inout], [0.62, P.knee], [1.0, P.deadFwd, EI]]); break;
      default: lerpPose(base, base, 0, T);
    }
  } else {
    const A = e.atk ? ATK[e.atk] : null, ap = e.atk ? ATKPOSE[e.atk] : null;
    switch (st) {
      case 'wind': { const u = E.out(clamp(tt / (e.windT * 0.6), 0, 1)) * (e.feinting ? 0.55 : 1); lerpPose(g, P[ap[0]], u, T); T.hx = lerp(0, -4, u);
        // anticipation: a small dip and lean back as the windup begins, then a held pose before the strike
        const dip = Math.sin(Math.PI * clamp(tt / (e.windT * 0.4), 0, 1)); T.hy += 5 * dip; T.lean -= 0.14 * dip; break; }
      case 'act': strike(T, g, ap[0], ap[1], e.windT + tt, e.windT, A.act, A.rec * (extra.rec || 1), g); break;
      case 'rec': strike(T, g, ap[0], ap[1], e.windT + A.act + tt, e.windT, A.act, A.rec * (extra.rec || 1), g); break;
      case 'stun': keys(T, tt, [[0, g], [0.05, P.snap, E.out], [0.14, P.catchStep], [Math.max(0.2, e.stunT || 0.32), g]]); break;
      case 'stagger': {
        const Ts = e.stunT || 0.9, heavyFall = Ts >= 0.85 && kind !== 'brute' && kind !== 'hyoe' && !e.boss;
        if (heavyFall) keys(T, tt, [[0, g], [0.06, P.lift, E.out], [0.3, P.downBack, EI], [Ts - 0.42, P.downBack], [Ts - 0.26, P.knee, E.out], [Ts - 0.1, P.rise], [Ts, g]]);
        else keys(T, tt, [[0, g], [0.06, P.snap, E.out], [0.3, P.fold], [Ts - 0.2, P.catchStep], [Ts, g]]);
        break;
      }
      case 'block': keys(T, tt, [[0, g], [0.05, P.parry, E.out], [0.24, P.parry], [0.34, X(P.parry, { lean: -0.12, hx: -3 })]]); break;
      case 'opened': keys(T, tt, [[0, P.parry], [0.07, P.opened, E.out], [0.6, P.opened], [1.2, g]]); break;
      case 'shift': lerpPose(P.focus, g, E.inout(clamp((tt - 0.9) / 0.6, 0, 1)), T); break;
      case 'dead': keys(T, tt, [[0, P.snap], [0.4, P.knee, E.inout], [0.8, P.deadFwd, EI]]); break;
      default: lerpPose(g, g, 0, T);
    }
  }
  // drawn in-betweens: when the state changes, blend from the last drawn pose; inside a state, follow exactly
  const key = st + (e.atk || '') + (e.combo || 0);
  if (!fig.pose.ff || fig.snap) { lerpPose(T, T, 0, fig.pose); fig.key = key; fig.bt = 1; fig.snap = false; return fig.pose; }
  if (key !== fig.key) { fig.key = key; fig.from = lerpPose(fig.pose, fig.pose, 0, fig.from || {}, true); fig.bt = 0; }
  fig.bt = Math.min(1, (fig.bt ?? 1) + (extra.dt || 0) / 0.07);
  if (fig.bt < 1) lerpPose(fig.from, T, E.inout(fig.bt), fig.pose, true); else lerpPose(T, T, 0, fig.pose, true);
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
const PAPER = '#efe7d4', SKIN = '#d9c3a0';
// The cast. kind: which pose set it uses. Colours are ink washes; one accent each. sc: size, bulk: width.
export const LOOKS = {
  ronin: { kind: 'ronin', sc: 1.18, bulk: 1, kim: '#1d1a17', hak: '#3f3a35', slv: '#25211d', skin: SKIN, hat: 'kasa', hatW: 1.6, hatCol: '#6d604c', weapon: 'katana', hl: 1, scarf: 0 },
  bandit: { kind: 'bandit', sc: 1.0, bulk: 1.12, kim: '#655d55', hak: '#655d55', slv: '#5a5249', skin: '#d6c3a3', hat: 'band', acc: '#8e3f2a', weapon: 'katana', hl: 0.42, shins: 1, head: 1.15, obi: '#3b342d' },
  spear: { kind: 'spear', sc: 1.12, bulk: 1, kim: '#55575c', hak: '#727274', slv: '#4b4d52', skin: '#d9c8aa', hat: 'jingasa', acc: '#1c1a19', weapon: 'spear', hl: 0.82, armor: 1, shins: 1, head: 1.2 },
  archer: { kind: 'archer', sc: 1.02, bulk: 0.92, kim: '#68664f', hak: '#86836b', slv: '#5e5c47', skin: '#d9c8aa', hat: 'jingasa', acc: '#1c1a19', weapon: 'bow', hl: 0.8, quiver: 1, shins: 1, head: 1.2 },
  brute: { kind: 'brute', sc: 1.3, bulk: 1.45, kim: '#4e4036', hak: '#6a5b4f', slv: '#463a31', skin: '#c9ab88', hat: 'bald', acc: '#7a5634', weapon: 'club', shield: 1, hl: 0.85, shins: 1 },
  duelist: { kind: 'duelist', sc: 1.12, bulk: 0.95, kim: '#2c262b', hak: '#5a525c', slv: '#3b3039', skin: '#ddd0b8', hat: 'chonmage', acc: '#5a3a52', weapon: 'katana', hl: 1, coat: '#3e313c' },
  // bosses: each its own shape language
  gonroku: { kind: 'bandit', sc: 1.3, bulk: 1.55, kim: '#3f352d', hak: '#5f5145', slv: '#382f28', skin: '#cfb18c', hat: 'band', acc: '#8e3f2a', weapon: 'odachi', hl: 0.8, shins: 1, beard: 'dark' },
  ono: { kind: 'spear', sc: 1.42, bulk: 0.9, kim: '#46423b', hak: '#615c53', slv: '#3e3a34', skin: '#d6c4a4', hat: 'kasa', hatW: 1.25, hatCol: '#7d6c4c', acc: '#3a3328', weapon: 'spear', hl: 0.86, mino: '#7a6948', shins: 1 },
  shizu: { kind: 'duelist', sc: 1.1, bulk: 0.78, kim: '#24212a', hak: '#77717d', slv: '#2f2b35', skin: '#e3d7c0', hat: 'longhair', weapon: 'naginata', hl: 1.06, upright: 1, band: '#efe7d4', tasuki: 1 },
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
  const S = o.raw ? P : closedCurve(boil(P, o.seed, o.n, o.amp), 3), A = o.a ?? 1;
  g.beginPath(); for (let i = 0; i < S.length; i++) i ? g.lineTo(S[i][0], S[i][1]) : g.moveTo(S[i][0], S[i][1]); g.closePath();
  g.globalAlpha = A; g.fillStyle = cc(o.col); g.fill();
  if (o.tex !== 0 && !FLATC) {
    g.save(); g.clip();
    const pat = grain(g); if (pat) { if (pat.setTransform && typeof DOMMatrix !== 'undefined') pat.setTransform(new DOMMatrix([0.3, 0, 0, 0.3, o.ox || 0, o.oy || 0])); g.globalAlpha = A * (o.tex ?? 0.9); g.fillStyle = cc(pat); g.fill(); }
    g.globalAlpha = A * 0.16; g.strokeStyle = cc(INK); g.lineWidth = (o.lw || 2) * 2.4; g.stroke();
    if (o.inside) o.inside(g);
    g.restore();
  }
  if (o.ink !== null) contour(g, S, o.lw || 2, cc(o.ink || INK), A * 0.95, o.seed);
  g.globalAlpha = 1;
}
// The contour of a mass, painted, not outlined: the brush is heaviest where the form turns away from the light (lit from
// the upper left) or sits in shadow, thins to a hair where it turns toward the light, and lifts off entirely on the lit
// side; each run of the stroke enters and leaves thin.
const LIGHT = [-0.55, -0.83];
function contour(g, S, lw, col, a, seed) {
  const m = S.length; if (m < 4) return; let ar = 0; for (let i = 0; i < m; i++) { const p = S[i], q = S[(i + 1) % m]; ar += p[0] * q[1] - q[0] * p[1]; } const sg = ar > 0 ? 1 : -1;
  const wt = new Float32Array(m);
  for (let i = 0; i < m; i++) { const p = S[(i - 1 + m) % m], q = S[(i + 1) % m]; let nx = (q[1] - p[1]) * sg, ny = -(q[0] - p[0]) * sg; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const lit = nx * LIGHT[0] + ny * LIGHT[1]; wt[i] = lit > 0.62 + (hash(Math.floor(i / 4), seed) - 0.5) * 0.3 ? 0 : clamp((0.62 - lit) / 1.4, 0.06, 1); }
  // start the walk at a gap, so every run is whole
  let s0 = 0; for (let i = 0; i < m; i++) if (wt[i] === 0) { s0 = i; break; }
  let run = [], ws = [];
  const flush = () => { if (run.length >= 3) { const n = run.length, flat = []; for (const q of run) flat.push(q[0], q[1]);
    ribbon(g, flat, (u) => { const i = Math.min(n - 1, Math.round(u * (n - 1))), e = Math.min(1, u * n / 3, (1 - u) * n / 3); return lw * (0.3 + 1.8 * ws[i]) * Math.max(0.15, e); }, col, a, 0); } run = []; ws = []; };
  for (let k = 0; k <= m; k++) { const i = (s0 + k) % m; if (wt[i] > 0 && k < m) { run.push(S[i]); ws.push(wt[i]); } else flush(); }
}
// the same painted contour along an open run of a closed polygon P (its orientation sets which side is outside)
function contourOpen(g, run, P, lw, col, a, seed) {
  let ar = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; ar += p[0] * q[1] - q[0] * p[1]; } const sg = ar > 0 ? 1 : -1, m = run.length;
  const wt = []; for (let i = 0; i < m; i++) { const p = run[Math.max(0, i - 1)], q = run[Math.min(m - 1, i + 1)]; let nx = (q[1] - p[1]) * sg, ny = -(q[0] - p[0]) * sg; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const lit = nx * LIGHT[0] + ny * LIGHT[1]; wt.push(lit > 0.62 + (hash(Math.floor(i / 4), seed) - 0.5) * 0.3 ? 0 : clamp((0.62 - lit) / 1.4, 0.08, 1)); }
  let r = [], ws = []; const flush = () => { if (r.length >= 3) { const n = r.length, flat = []; for (const q of r) flat.push(q[0], q[1]);
    ribbon(g, flat, (u) => { const i = Math.min(n - 1, Math.round(u * (n - 1))), e = Math.min(1, u * n / 3, (1 - u) * n / 3); return lw * (0.3 + 1.7 * ws[i]) * Math.max(0.15, e); }, col, a, 0); } r = []; ws = []; };
  for (let i = 0; i <= m; i++) { if (i < m && wt[i] > 0) { r.push(run[i]); ws.push(wt[i]); } else flush(); }
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

  const breath = Math.sin(t * 2.2 + seed * 3.1) * (o.still ? 0.15 : 0.35) * sc; // idle is still and tall
  const lean = pose.lean + (L.hunch || 0) * (pose.lean > -0.6 ? 1 : 0) - (L.upright ? 0.05 : 0);
  // proportions: legs (hip to sole) about 3.6 heads, collar to obi about 1.6 heads, a neck that is always visible.
  // Standing, walking, running and guard poses keep the hips at 0.47 of standing height or more: nothing is pressed
  // down; only kneels, crouches, rolls, falls and the standoff crouch go lower.
  const lift = pose.kneel || pose.hy > -30 ? 0 : 6 * clamp((-pose.hy - 30) / 18, 0, 1) + 3.5;
  const upright = !pose.kneel && (pose.hy <= -38 || pose.gait) && Math.abs(lean) < 0.75;
  // the head turns at most about 19 degrees on the neck: the shoulders and hips take a recoil
  const hdT = clamp(pose.head || 0, -0.33, 0.33) + (L.hunch ? 0.2 : 0), na = lean + hdT * 0.5, ha = lean + hdT;
  let hyU = pose.hy - lift; if (upright) hyU = Math.min(hyU, -0.47 * STAND_H, -(0.945 * STAND_H - TORSO * Math.cos(lean) - NECK * Math.cos(na) - 9.6 * Math.cos(ha)));
  const rise = hyU - (pose.hy - lift); // how much the hips were lifted to keep the stance tall (units, <= 0)
  const H = [x + f * pose.hx * sc, y + hyU * sc + breath * 0.4];
  const T = TORSO * sc, ax = Math.sin(lean) * f, ay = -Math.cos(lean);
  const N = [H[0] + ax * T, H[1] + ay * T + breath];
  const nfx = f * -ay, nfy = f * ax; // front normal of the torso
  // the neck is a fixed segment: it bends half as much as the head tilts, so the head can nod but never sinks
  const Hd = [N[0] + Math.sin(na) * f * NECK * sc + f * 1.4 * sc, N[1] - Math.cos(na) * NECK * sc];
  const ink = INK, mo = (P, col, extra) => mass(g, P, Object.assign({ col, seed: seed + (extra && extra.k || 0), n: bn, amp, a: A, lw: 1.75 * sc, ox: x, oy: y }, extra));
  // ---- legs (IK) ----
  const legs = [];
  for (const [ft, back] of [[pose.fb, 1], [pose.ff, 0]]) {
    const hx = H[0] - nfx * (back ? 3 : -3) * sc, hy = H[1];
    const F = [x + f * ft[0] * sc, y + ft[1] * sc];
    if (pose.kneel) { const knee = back ? [H[0] + f * 17 * sc, y - 3 * sc] : [H[0] + f * 20 * sc, y - 4 * sc]; legs.push({ hx, hy, kx: knee[0], ky: knee[1], fx: H[0] - f * 13 * sc, fy: y - 1, back }); }
    else { ik(hx, hy, F[0], F[1], LEG * sc, LEG * sc, f > 0 ? -1 : 1, T4); legs.push({ hx, hy, kx: T4[0], ky: T4[1], fx: T4[2], fy: T4[3], back }); }
  }
  const [LB, LF] = legs, hl = L.hl;
  const groundY = o.groundY ?? y, Bh = 110 * sc;
  // ---- weapon geometry ----
  let sw = pose.sw, dx = Math.cos(sw) * f, dy = Math.sin(sw);
  const G = [H[0] + f * pose.grip[0] * sc - f * pose.hx * sc, y + (pose.grip[1] - lift + rise) * sc + (pose.hy + 49) * 0.4 * sc];
  const Sf = [N[0] + nfx * 2 * sc - ax * 6.5 * sc, N[1] + nfy * 2 * sc - ay * 6.5 * sc], Sb = [N[0] - nfx * 5 * sc - ax * 7.5 * sc, N[1] - nfy * 5 * sc - ay * 6 * sc];
  let hand2;
  if (L.weapon === 'spear' || L.weapon === 'naginata') hand2 = [G[0] - dx * 32 * sc, G[1] - dy * 32 * sc];
  else if (L.weapon === 'bow') hand2 = [lerp(G[0] - f * 4 * sc, H[0] - f * 2 * sc, o.draw || 0), lerp(G[1], G[1] - 6 * sc, o.draw || 0)];
  else if (L.weapon === 'club') hand2 = null;
  else hand2 = [G[0] - dx * 12 * sc, G[1] - dy * 12 * sc];
  if (pose.sheath && (L.weapon === 'katana' || L.weapon === 'odachi')) { const swing = o.walkPh != null && !o.running ? Math.sin(o.walkPh) * 6 * sc : 0; hand2 = o.running ? [H[0] + f * 10.5 * sc, H[1] - 4.5 * sc] : [H[0] - nfx * (4 * sc) + f * swing, H[1] + 12 * sc]; }
  if (pose.open) hand2 = [N[0] - f * 28 * sc, N[1] + 6 * sc];
  // the archer's shot (kyudo): the bow raised overhead (uchiokoshi), then lowered while drawing until the string
  // hand is behind the ear at full draw; after the loose the bow turns in the hand
  if (L.weapon === 'bow' && (o.draw > 0 || o.loosed > 0)) {
    const d = o.draw || 0, E2 = (u) => u * u * (3 - 2 * u), up = E2(clamp(d / 0.35, 0, 1)), dn = E2(clamp((d - 0.35) / 0.65, 0, 1));
    const hi = [H[0] + f * 10 * sc, N[1] - 34 * sc], full = [N[0] + f * 31 * sc, N[1] + 3 * sc];
    const gx = d > 0 ? lerp(lerp(G[0], hi[0], up), full[0], dn) : full[0], gy = d > 0 ? lerp(lerp(G[1], hi[1], up), full[1], dn) : full[1];
    G[0] = gx; G[1] = gy;
    const ear = [Hd[0] - f * 5 * sc, Hd[1] + 3 * sc], nh = [G[0] - f * 7 * sc, G[1] + 2 * sc];
    hand2 = d > 0 ? [lerp(nh[0], ear[0], dn), lerp(nh[1], ear[1], dn)] : [ear[0] - f * 6 * sc * o.loosed, ear[1] + 4 * sc * (1 - o.loosed)];
    o._ear = hand2;
  }
  // ---- behind the body: scarf, hair, quiver, lantern pole ----
  if (L.scarf && fig.scarf) {
    const ch = fig.scarf; ch[0][0] = N[0] - f * 2 * sc; ch[0][1] = N[1] + 2 * sc; const pts = []; for (const q of ch) pts.push(q[0], q[1]);
    rib(g, pts, (u) => (6.5 - u * 4.2) * sc, o.scarf || ink, A, 0); g.globalAlpha = A * 0.4; g.strokeStyle = cc(ink); g.lineWidth = 0.8 * sc; g.stroke(); g.globalAlpha = 1; // the pale cloth: a soft edge, not an outlined tube
  }
  if (L.hat === 'longhair') { const nape = [Hd[0] - f * 5 * sc, Hd[1] + 2 * sc]; const tip = [N[0] - f * (16 * sc) + cloth * 1.6, lerp(N[1], H[1], 0.75)]; mo([nape, [lerp(nape[0], tip[0], 0.5) - f * 5 * sc, lerp(nape[1], tip[1], 0.5)], tip, [tip[0] + f * 4 * sc, tip[1] - 6 * sc], [Hd[0] - f * 1 * sc, N[1]]], '#141210', { k: 31, tex: 0.5, lw: 1.6 * sc }); }
  if (L.quiver) mo([[N[0] - f * 6 * sc, N[1] - 2 * sc], [N[0] - f * 13 * sc, N[1] - 1 * sc], [H[0] - f * 16 * sc, H[1] - 4 * sc], [H[0] - f * 9 * sc, H[1] - 4 * sc]], L.acc, { k: 33 });
  if (L.quiver) for (let i = 0; i < 3; i++) sweep(g, [[N[0] - f * (7 + i * 2.5) * sc, N[1] - 1 * sc], [N[0] - f * (6 + i * 3) * sc, N[1] - 13 * sc]], 1.6 * sc, ink, A, seed + i);
  if (L.lantern) {
    const base = [N[0] - f * 10 * sc, N[1] + 6 * sc], top = [N[0] - f * 22 * sc, N[1] - 46 * sc], tipx = top[0] + f * 16 * sc, tipy = top[1] + 1 * sc, lx = tipx + cloth * 0.9, ly = tipy + 17 * sc;
    sweep(g, [base, [lerp(base[0], top[0], 0.5) - f * 2 * sc, lerp(base[1], top[1], 0.5)], top, [top[0] + f * 14 * sc, top[1] + 2 * sc]], 2.6 * sc, ink, A, seed + 3);
    if (!FLATC && !o.flat && SHADE < 0.3) { g.globalAlpha = A * 0.5; const gl = g.createRadialGradient(lx, ly, 2, lx, ly, 46 * sc); gl.addColorStop(0, 'rgba(247,238,214,0.8)'); gl.addColorStop(1, 'rgba(247,238,214,0)'); g.fillStyle = gl; g.beginPath(); g.arc(lx, ly, 46 * sc, 0, 6.3); g.fill(); g.globalAlpha = 1; } // the glow: never in a silhouette pass, and a disc, never a box
    sweep(g, [[tipx, tipy], [lx, ly - 10 * sc]], 0.8 * sc, ink, A, seed + 4, 2);
    mo([[lx - 4 * sc, ly - 10 * sc], [lx + 4 * sc, ly - 10 * sc], [lx + 6.5 * sc, ly - 4 * sc], [lx + 6.5 * sc, ly + 4 * sc], [lx + 4 * sc, ly + 10 * sc], [lx - 4 * sc, ly + 10 * sc], [lx - 6.5 * sc, ly + 4 * sc], [lx - 6.5 * sc, ly - 4 * sc]], '#f4dfae', { k: 35, tex: 0.15, lw: 1.3 * sc, inside: (q) => { for (let i = -3; i <= 3; i++) sweep(q, [[lx - 6.5 * sc, ly + i * 2.6 * sc], [lx, ly + i * 2.6 * sc + 0.6 * sc], [lx + 6.5 * sc, ly + i * 2.6 * sc]], 0.6 * sc, '#8a5a2a', A * 0.7, seed + 36 + i, 2); } });
    rib(g, [lx - 4.5 * sc, ly - 10.5 * sc, lx + 4.5 * sc, ly - 10.5 * sc], () => 2.4 * sc, '#151110', A, 0); rib(g, [lx - 4.5 * sc, ly + 10.5 * sc, lx + 4.5 * sc, ly + 10.5 * sc], () => 2.4 * sc, '#151110', A, 0);
  }
  // ---- sleeves: rectangular bags from shoulder to wrist; the lower edge hangs under the forearm on a two-point
  // pendulum with lag. In a fight the ronin's sleeves are tied back with a crossing cord and the forearms are bare. ----
  const tiedSl = L === LOOKS.ronin ? !pose.sheath : !!L.tasuki;
  if (!fig.slv) fig.slv = {};
  fig.garment = { sleeves: [], feet: [] };
  const arm = (S, hx2, hy2, back, k) => {
    ik(S[0], S[1], hx2, hy2, 19 * sc, 18 * sc, f > 0 ? 1 : -1, T4b);
    const ex = T4b[0], ey = T4b[1], wx = T4b[2], wy = T4b[3];
    const ux = ex - S[0], uy = ey - S[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul;
    const vx2 = wx - ex, vy2 = wy - ey, vl = Math.hypot(vx2, vy2) || 1, qx = -vy2 / vl, qy = vx2 / vl;
    const w = (tiedSl ? 5 : 6) * sc * Math.sqrt(bulk), cu = tiedSl ? 0.14 : (back ? 0.85 : 0.62), cuff = [lerp(ex, wx, cu), lerp(ey, wy, cu)];
    const drop = tiedSl ? 4.5 * sc : 0.12 * Bh;
    const T2 = [[lerp(ex, cuff[0], 0.15), Math.max(lerp(ey, cuff[1], 0.15), ey) + drop], [lerp(ex, cuff[0], 0.85), Math.max(lerp(ey, cuff[1], 0.85), cuff[1]) + drop * 0.85]];
    const st = fig.slv[k] || (fig.slv[k] = {}); if (st.f != null && st.f !== f && st.p) { st.p.reverse(); st.v.reverse(); } st.f = f;
    const cons = T2.map((t) => { const dT = Math.hypot(t[0] - ex, t[1] - ey); return { K: [ex, ey], dmin: dT * 0.5, dmax: dT * 1.15 + 2 * sc, dev: Math.max(3 * sc, dT * 0.7) }; });
    stepChain(st, T2, cons, { dt: o.dt ?? 0.016, wind, reduced: o.reduced, floor: groundY, far: 70 * sc, w: 11, z: 0.38 });
    const bag = st.p;
    const S2 = [S[0] + ux / ul * 2.5 * sc, S[1] + uy / ul * 2.5 * sc]; // the sleeve hangs from just below the shoulder point, so the shoulder slopes
    const uw = back ? 0.7 : 0.55; const P = soften(hull([[S2[0] + px * w * uw, S2[1] + py * w * uw], [S2[0] - px * w * uw, S2[1] - py * w * uw], [ex + px * w * 0.85, ey + py * w * 0.85], [ex - px * w * 0.85, ey - py * w * 0.85],
      [cuff[0] + qx * w * 0.85, cuff[1] + qy * w * 0.85], [cuff[0] - qx * w * 0.85, cuff[1] - qy * w * 0.85], bag[0], bag[1]]), 5 * sc);
    if (fig.garment) fig.garment.sleeves.push({ k, poly: P, bag: bag.map((q) => [q[0], q[1]]), E: [ex, ey], W: [wx, wy], cuff, tied: tiedSl, drop });
    const fore = () => { rib(g, [cuff[0], cuff[1], wx, wy], (u) => (5 - u * 1.6) * sc, back ? mix(L.skin, '#000000', 0.18) : L.skin, A, 0); g.globalAlpha = A; g.strokeStyle = cc(INK); g.lineWidth = 1.1 * sc; g.stroke(); };
    if (back) fore();
    // the near sleeve sits a clear value step lighter than the torso, so the arm reads against the chest
    mo(P, back ? mix(L.slv, '#000000', 0.25) : mix(L.slv, PAPER, 0.34), { k: 40 + k, lw: 1.7 * sc, raw: 1, inside: (q) => {
      // folds only where the cloth works: a raised arm pulls a fold from shoulder to elbow; a hanging bag gathers under the elbow
      if (ey < S[1] - 4 * sc) sweep(q, [[S[0] - px * w * 0.3, S[1] - py * w * 0.3], [lerp(S[0], ex, 0.55) - px * w * 0.5, lerp(S[1], ey, 0.55) - py * w * 0.5], [ex - px * w * 0.2, ey - py * w * 0.2]], 1.3 * sc, PAPER, A * 0.45, seed + k);
      else sweep(q, [[ex, ey + 2 * sc], [lerp(ex, bag[0][0], 0.6), lerp(ey, bag[0][1], 0.6)], [lerp(cuff[0], bag[1][0], 0.7), lerp(cuff[1], bag[1][1], 0.7)]], 1.2 * sc, PAPER, A * 0.4, seed + k);
    } });
    // the cuff opening: a pale inner lining showing in the mouth of the sleeve, a dark lip, the forearm coming out of it
    if (!back) { const c0 = [cuff[0] + qx * w * 0.75, cuff[1] + qy * w * 0.75], c1 = [cuff[0] - qx * w * 0.75, cuff[1] - qy * w * 0.75], cm = [cuff[0] - vx2 / vl * 2.4 * sc, cuff[1] - vy2 / vl * 2.4 * sc];
      g.globalAlpha = A; g.fillStyle = cc(mix(L.slv, PAPER, 0.72)); g.beginPath(); g.moveTo(c0[0], c0[1]); g.quadraticCurveTo(cm[0], cm[1], c1[0], c1[1]); g.closePath(); g.fill(); }
    sweep(g, [[cuff[0] + qx * w * 0.8, cuff[1] + qy * w * 0.8], [cuff[0] - qx * w * 0.8, cuff[1] - qy * w * 0.8]], 1.4 * sc, INK, A * 0.85, seed + 44 + k, 2);
    if (!back) fore();
    // tied back for the fight: the tasuki cord binds the sleeve above the elbow
    if (tiedSl && !back) { const t0 = [lerp(S2[0], ex, 0.7) + px * w * 0.7, lerp(S2[1], ey, 0.7) + py * w * 0.7], t1 = [lerp(S2[0], ex, 0.78) - px * w * 0.7, lerp(S2[1], ey, 0.78) - py * w * 0.7]; sweep(g, [t0, t1], 1.3 * sc, L.tasuki ? '#efe7d4' : '#8c7a58', A * 0.95, seed + 46 + k, 2); }
    // hand: a pale mass with a knuckle line
    const hxp = wx + (wx - ex) / vl * 2.5 * sc, hyp = wy + (wy - ey) / vl * 2.5 * sc;
    mo([[hxp - 3.6 * sc, hyp - 2.6 * sc], [hxp + 3.2 * sc, hyp - 3.2 * sc], [hxp + 4 * sc, hyp + 2 * sc], [hxp - 1 * sc, hyp + 3.6 * sc], [hxp - 4 * sc, hyp + 1 * sc]], L.skin, { k: 50 + k, tex: 0.15, lw: 1.3 * sc, strokes: 2 });
  };
  if ((L.weapon === 'katana' || L.weapon === 'odachi') && !o.noWeapon) {
    const sa = 0.45 + cloth * 0.01, s0 = [H[0] + f * 6 * sc, H[1] - 6 * sc], s1 = [s0[0] - f * Math.cos(sa) * 56 * sc, s0[1] + Math.sin(sa) * 56 * sc];
    rib(g, [s0[0], s0[1], lerp(s0[0], s1[0], 0.5), lerp(s0[1], s1[1], 0.5) + 1 * sc, s1[0], s1[1]], (u) => (3.8 - u * 1.4) * sc, '#15120f', A, 0.6);
  }
  if ((L.weapon === 'katana' || L.weapon === 'odachi') && !o.noWeapon && (L === LOOKS.ronin || L === LOOKS.gonroku || L.kind === 'duelist' || L.kind === 'master')) {
    const s0 = [H[0] + f * 3 * sc, H[1] - 9 * sc], s1 = [s0[0] - f * 26 * sc, s0[1] + 13 * sc];
    rib(g, [s0[0], s0[1], s1[0], s1[1]], (u) => (3.2 - u * 1) * sc, '#1c1714', A, 0.6);
    sweep(g, [s0, [s0[0] + f * 9 * sc, s0[1] - 5 * sc]], 3 * sc, INK, A, seed + 152, 2);
  }
  if (hand2) arm(Sb, hand2[0], hand2[1], 1, 1);
  // ---- hakama: ONE garment. Per leg a convex envelope around the leg (waist, a ring round the knee, a hem chain that
  // hangs from the knee and trails the motion), a gusset that fills between the thighs above the split, shins (bare
  // legs only) behind it, tabi and sandals below it. ----
  const HG = hakamaTargets({ H, legs, f, nf: [nfx, nfy], dn: [-ax, -ay], sc, bulk, hl, groundY, kneel: !!pose.kneel, full: !L.shins, stride: o.running ? 1 : clamp((Math.abs(vx) - 120) / 110, 0, 1) * (o.walkPh != null ? 1 : 0) });
  if (!fig.hem) fig.hem = { f, c: [{}, {}] };
  if (fig.hem.f !== f) { for (const c of fig.hem.c) if (c.p) { c.p.reverse(); c.v.reverse(); } fig.hem.f = f; }
  const chains = HG.legs.map((l, i) => stepChain(fig.hem.c[i], l.T, l.cons, { dt: o.dt ?? 0.016, wind, reduced: o.reduced, minSpan: hl >= 0.8 ? 0.165 * Bh : 0, floor: l.floor, f, far: 90 * sc }).p);
  const HK = hakamaPolys(HG, chains), legP = HK.legs.map((q) => q.hull), thP = HK.legs.map((q) => q.thigh), gus = HK.gusset, all = [gus, thP[0], legP[0], thP[1], legP[1]];
  const backP = [thP[0], legP[0]], frontP = [thP[1], legP[1]], polyPath = (Ps) => { g.beginPath(); for (const P of Ps) { P.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); } };
  Object.assign(fig.garment, { full: !L.shins, look, groundY, Bh, hl, sc, bulk, f, kneel: !!pose.kneel, HG, legs: HK.legs.map((q, i) => ({ poly: q.hull, thigh: q.thigh, hem: chains[i].map((p) => [p[0], p[1]]), K: HG.legs[i].K, J: HG.legs[i].J, A: HG.legs[i].A, T: HG.legs[i].T, cons: HG.legs[i].cons, lift: HG.legs[i].lift, wrap: HG.legs[i].wrap, back: HG.legs[i].back })), gusset: gus });
  if (L.shins) for (const l of legs) { const F = [l.fx, l.fy], d = Math.hypot(F[0] - l.kx, F[1] - l.ky) || 1, nx = -(F[1] - l.ky) / d, ny = (F[0] - l.kx) / d;
    mo([[l.kx + nx * 3.4 * sc, l.ky + ny * 3.4 * sc], [l.kx - nx * 3.4 * sc, l.ky - ny * 3.4 * sc], [F[0] - nx * 2.4 * sc, F[1] - 4 * sc - ny * 2.4 * sc], [F[0] + nx * 2.4 * sc, F[1] - 4 * sc + ny * 2.4 * sc]], l.back ? mix(L.skin, '#000000', 0.15) : L.skin, { k: 60 + l.back, tex: 0.1, lw: 1.3 * sc, strokes: 2 }); }
  // feet in tabi and straw sandals, below the hem
  for (const l of legs) {
    const F = [l.fx, l.fy], toe = pose.kneel && !l.back ? -1 : 1, bare = !!L.shins, sockC = bare ? L.skin : '#e7e1d3';
    const P = [[F[0] - f * 4 * sc, F[1] - 0.6 * sc], [F[0] - f * 3.2 * sc, F[1] - 5.2 * sc], [F[0] + f * 1.5 * sc * toe, F[1] - 5.4 * sc], [F[0] + f * 5 * sc * toe, F[1] - 3.2 * sc], [F[0] + f * 8.6 * sc * toe, F[1] - 1.4 * sc], [F[0] + f * 8.8 * sc * toe, F[1] - 0.2 * sc]];
    mo(P, l.back ? mix(sockC, '#000000', 0.14) : sockC, { k: 62 + l.back, tex: 0.1, lw: 1.25 * sc, strokes: 2 });
    rib(g, [F[0] - f * 4.6 * sc, F[1] + 0.2 * sc, F[0] + f * 9.4 * sc * toe, F[1] + 0.2 * sc], () => 1.9 * sc, '#9c8758', A, 0.6); // the straw sole
    sweep(g, [[F[0] + f * 4.2 * sc * toe, F[1] - 1 * sc], [F[0] + f * 1 * sc * toe, F[1] - 4.6 * sc], [F[0] - f * 1.6 * sc, F[1] - 3.6 * sc]], 1.1 * sc, INK, A * 0.9, seed + 65); // the thong
    fig.garment.feet.push({ x0: Math.min(F[0] - 4.6 * sc, F[0] + f * 9.4 * sc), x1: Math.max(F[0] - 4.6 * sc, F[0] + f * 9.4 * sc), top: F[1] - 5.4 * sc, bot: F[1] + 0.2 * sc, grounded: F[1] > groundY - 2 * sc, back: l.back });
  }
  const kneeY = Math.min(HG.legs[0].K[1], HG.legs[1].K[1]);
  {
    const path = () => { g.beginPath(); for (const P of all) { P.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); } };
    path(); g.globalAlpha = A; g.fillStyle = cc(L.hak); g.fill();
    if (!FLATC) {
      g.save(); path(); g.clip();
      const pat = grain(g); if (pat) { if (pat.setTransform && typeof DOMMatrix !== 'undefined') pat.setTransform(new DOMMatrix([0.3, 0, 0, 0.3, x, y])); g.globalAlpha = A * 0.9; g.fillStyle = cc(pat); g.fill(); }
      // the back leg's cloth sits a shade deeper in the fold behind the front leg
      g.globalAlpha = A * (0.22 + 0.2 * HG.split); g.fillStyle = cc(INK); polyPath(backP); g.fill();
      g.globalAlpha = A; g.fillStyle = cc(L.hak); polyPath(frontP); g.fill();
      if (pat) { g.globalAlpha = A * 0.9; g.fillStyle = cc(pat); g.fill(); }
      // five long pleats, waist to hem, as tapered strokes (two on the back leg, three on the front)
      const Wb = HG.Wb, Wf = HG.Wf;
      HK.legs.forEach((lg, i) => { const l = HG.legs[i], n = i ? 3 : 2, hem = lg.hem;
        for (let j = 0; j < n; j++) { const u = (j + 0.7) / (n + 0.4), a0 = i ? 0.45 + 0.5 * u : 0.05 + 0.5 * u, w0 = [lerp(Wb[0], Wf[0], a0) - ax * 4 * sc, lerp(Wb[1], Wf[1], a0) - ay * 4 * sc];
          const hp = [lerp(hem[0][0], hem[3][0], u), lerp(hem[0][1], hem[3][1], u) - 1.5 * sc], kc = [lerp(l.ring[1][0], l.ring[0][0], u), lerp(l.ring[1][1], l.ring[0][1], u)];
          sweep(g, [w0, [lerp(w0[0], kc[0], 0.6), lerp(w0[1], kc[1], 0.6)], kc, hp], (j === 1 ? 1.5 : 1.2) * sc, j % 2 ? INK : PAPER, A * (j % 2 ? 0.42 : 0.26), seed + 80 + i * 7 + j); }
        // a fold breaks over a bent knee, only when the knee is actually bent
        const J = l.J, K = l.K, An = l.A, t1 = [K[0] - J[0], K[1] - J[1]], t2 = [An[0] - K[0], An[1] - K[1]], cb = (t1[0] * t2[0] + t1[1] * t2[1]) / ((Math.hypot(...t1) * Math.hypot(...t2)) || 1);
        if (cb < 0.75) { const k2 = clamp((0.75 - cb) / 0.9, 0, 1); for (const s2 of [-1, 1]) sweep(g, [[K[0] - f * 2 * sc, K[1] + 2 * sc], [K[0] - f * (6 + 3 * s2) * sc, K[1] + (7 + 4 * s2) * sc]], 1.2 * sc, INK, A * 0.45 * k2, seed + 88 + s2 + i); }
      });
      g.restore();
    }
    // the outline: only where an edge of one panel is not covered by another (the silhouette), plus the centre split
    // where it shows, from the knees down
    const edge = (P, others, pick, w, col, al, sd) => { const n = P.length, cov = P.map((q) => others.some((O) => insideConvex(O, q, 0.5)));
      let s0 = cov.indexOf(true); if (s0 < 0) s0 = 0; let run = [];
      // the silhouette is painted with the same light-weighted, broken contour as every mass
      const keep = P.map((q, j) => pick(q, cov[j])), Q = P.filter((q, j) => keep[j]);
      if (Q.length < 3) return; const S2 = []; for (let i = 0; i < n; i++) { const j = (s0 + i) % n; if (keep[j]) S2.push(P[j]); else if (S2.length && S2[S2.length - 1] !== null) S2.push(null); }
      let part = []; const go = () => { if (part.length >= 3) contourOpen(g, part, P, w, col, A * al, sd); part = []; };
      for (const q of S2) { if (q === null) go(); else part.push(q); } go(); };
    // the outer silhouette of each leg is a brush contour; where the front leg crosses the back one, a lighter inner edge
    all.forEach((P, i) => edge(P, all.filter((_, j) => j !== i), (q, c) => !c, (i ? 2.3 : 2.1) * sc, INK, 0.95, seed + 71 + i * 2));
    for (const P of frontP) edge(P, backP, (q, c) => c && q[1] > (HG.split > 0.3 ? HG.Hf[1] + 4 * sc : kneeY + 3 * sc) && !insideConvex(gus, q, 0.5), (HG.split > 0.3 ? 1.5 : 1.2) * sc, INK, 0.6, seed + 77);
    if (HG.split > 0.3) for (const P of backP) edge(P, [...frontP, gus], (q, c) => !c && q[1] > HG.Hb[1] + 2 * sc, 1.1 * sc, mix(L.hak, PAPER, 0.55), 0.6 * HG.split, seed + 79);
    // folds radiating from the crotch into each thigh when the legs part
    if (HG.split > 0.3) { const cr = [(HG.Hb[0] + HG.Hf[0]) / 2, (HG.Hb[1] + HG.Hf[1]) / 2 + 3 * sc]; for (const l of HG.legs) for (const t of [0.35, 0.6]) sweep(g, [cr, [lerp(cr[0], l.K[0], t), lerp(cr[1], l.K[1], t) + 1.5 * sc]], 1.0 * sc, INK, A * 0.35 * HG.split, seed + 90 + t * 10, 2); }
    // the stiff back board at the waist, and the side vent showing the kimono beneath
    const Wb = HG.Wb, up = [ax, ay];
    mo([[Wb[0] + f * 1 * sc, Wb[1]], [Wb[0] - f * 2.6 * sc + up[0] * 1 * sc, Wb[1] + up[1] * 1 * sc], [Wb[0] - f * 2.2 * sc + up[0] * 9 * sc, Wb[1] + up[1] * 9 * sc], [Wb[0] + f * 1.6 * sc + up[0] * 9 * sc, Wb[1] + up[1] * 9 * sc]], mix(L.hak, '#000000', 0.2), { k: 74, lw: 1.3 * sc, strokes: 2, tex: 0.4 });
    const V = [HG.Hb[0] + f * 3 * sc, HG.Hb[1] - 1 * sc]; mo([[V[0] - f * 2.2 * sc, V[1] - 5 * sc], [V[0] + f * 2.2 * sc, V[1] - 5 * sc], [V[0], V[1] + 4 * sc]], L.kim, { k: 76, lw: 1 * sc, strokes: 2, tex: 0.3 });
  }
  // ---- torso: kimono, obi, white collar ----
  const tw = 21 * sc * bulk, tp = (u, s) => [lerp(H[0], N[0], u) + nfx * s, lerp(H[1], N[1], u) + nfy * s];
  if (L.coat && L.coatLong) { const hem = [H[0] - nfx * 16 * sc + cloth * 1.4, y - 4 * sc]; mo([tp(1, -tw * 0.5), tp(0.4, -tw * 0.62), hem, [hem[0] + f * 22 * sc, y - 3 * sc], tp(0.2, tw * 0.3)], L.coat, { k: 90, lw: 2 * sc }); }
  // the kimono: a torso wedge with a real shoulder line, the neck sitting into the collar
  const torsoP = [tp(0, -tw * 0.36), tp(0.45, -tw * 0.47), tp(0.8, -tw * 0.48), tp(0.92, -tw * 0.4), tp(1.02, -tw * 0.14), tp(1.05, tw * 0.1), tp(0.95, tw * 0.36), tp(0.78, tw * 0.48), tp(0.4, tw * 0.47), tp(0, tw * 0.38)];
  mo(torsoP, L.kim, { k: 91, lw: 2.2 * sc, inside: (q) => {
    sweep(q, [tp(0.9, -tw * 0.3), tp(0.5, -tw * 0.35 + cloth * 0.2), tp(0.12, -tw * 0.25)], 1.4 * sc, PAPER, A * 0.22, seed + 92);
    // the shoulder line, and cloth gathering into the obi only where the body bends
    sweep(q, [tp(1.0, -tw * 0.38), tp(1.03, -tw * 0.05)], 1.3 * sc, PAPER, A * 0.3, seed + 93, 2);
    const lb = pose.lean; if (lb > 0.22) for (const v of [0.15, 0.32]) sweep(q, [tp(0.1, tw * 0.4), tp(0.1 + v, tw * (0.3 - v * 0.4))], 1.2 * sc, PAPER, A * 0.35 * clamp((lb - 0.22) / 0.3, 0, 1), seed + 94 + v * 10, 2);
    else if (lb < -0.15) for (const v of [0.15, 0.32]) sweep(q, [tp(0.1, -tw * 0.38), tp(0.1 + v, -tw * (0.28 - v * 0.4))], 1.2 * sc, PAPER, A * 0.35 * clamp((-lb - 0.15) / 0.3, 0, 1), seed + 96 + v * 10, 2);
  } });
  if (L.armor) mo([[H[0] - nfx * tw * 0.5, H[1] + 14 * sc], tp(0.05, -tw * 0.5), tp(0.05, tw * 0.55), [H[0] + nfx * tw * 0.55, H[1] + 14 * sc]], '#1e1c1c', { k: 92, lw: 1.7 * sc, inside: (q) => { for (let i = 1; i < 4; i++) sweep(q, [[H[0] + nfx * tw * (-0.5 + i * 0.27), H[1]], [H[0] + nfx * tw * (-0.5 + i * 0.27), H[1] + 14 * sc]], 0.9 * sc, PAPER, A * 0.35, seed + 140 + i); } });
  if (L.armor) mo([tp(0.15, -tw * 0.5), tp(0.85, -tw * 0.5), tp(0.9, tw * 0.55), tp(0.15, tw * 0.58)], '#1a1919', { k: 93, lw: 1.9 * sc, inside: (q) => { for (let i = 1; i < 4; i++) sweep(q, [tp(i * 0.22, -tw * 0.35), tp(i * 0.22, tw * 0.56)], 0.9 * sc, PAPER, A * 0.4, seed + 94 + i); } });
  if (L.coat && !L.coatLong) { const hem = [H[0] - nfx * 18 * sc + cloth * 1.6, H[1] + 26 * sc]; mo([tp(1, -tw * 0.52), tp(0.5, -tw * 0.66), hem, [H[0] - nfx * 2 * sc + cloth * 0.6, H[1] + 22 * sc], tp(0.3, tw * 0.1), tp(0.98, 0)], L.coat, { k: 95, lw: 2 * sc }); }
  if (L.coatLong) mo([tp(1, -tw * 0.52), tp(0.5, -tw * 0.62), tp(0.1, -tw * 0.5), tp(0.25, tw * 0.1), tp(0.98, 0)], L.coat, { k: 96, lw: 2 * sc });
  if (L.tasuki) { sweep(g, [tp(0.95, -tw * 0.5), tp(0.25, tw * 0.45)], 1.2 * sc, '#efe7d4', A, seed + 172); sweep(g, [tp(0.95, tw * 0.4), tp(0.25, -tw * 0.5)], 1.2 * sc, '#efe7d4', A, seed + 173); }
  // the white under-collar: untouched paper in the dark mass
  // running, the far hand holds the scabbards at the hip: a pale hand on the dark saya, past the body's outline
  if (o.running && hand2 && pose.sheath && (L.weapon === 'katana' || L.weapon === 'odachi')) { const hx = hand2[0], hy = hand2[1];
    mo([[hx - 3.4 * sc, hy - 2.4 * sc], [hx + 3 * sc, hy - 3 * sc], [hx + 3.8 * sc, hy + 1.8 * sc], [hx - 0.8 * sc, hy + 3.4 * sc], [hx - 3.8 * sc, hy + 1]], mix(L.skin, '#000000', 0.15), { k: 58, tex: 0.15, lw: 1.3 * sc, strokes: 2 }); }
  // neck: a column that sits down into the collar
  { const nb = tp(0.98, tw * 0.04), nt = [Hd[0] - f * 0.8 * sc, Hd[1] + 5.5 * sc]; const nx2 = nfx * 3.6 * sc, ny2 = nfy * 3.6 * sc;
    mo([[nb[0] - nx2, nb[1] - ny2], [nb[0] + nx2, nb[1] + ny2], [nt[0] + nx2 * 0.85, nt[1] + ny2 * 0.85], [nt[0] - nx2 * 0.9, nt[1] - ny2 * 0.9]], mix(L.skin, '#000000', 0.12), { k: 100, tex: 0.1, lw: 1.3 * sc, strokes: 2 }); }
  if (L.gourd) { const gx = H[0] - f * 10 * sc - nfx * 0, gy = H[1] + 6 * sc; sweep(g, [[H[0] - f * 6 * sc, H[1] - 2 * sc], [gx, gy - 6 * sc]], 0.9 * sc, INK, A, seed + 180, 2);
    mo([[gx - 2.4 * sc, gy - 6.5 * sc], [gx + 2.4 * sc, gy - 6.5 * sc], [gx + 2.2 * sc, gy - 3.6 * sc], [gx + 4.2 * sc, gy + 0.5 * sc], [gx + 3.4 * sc, gy + 4.4 * sc], [gx, gy + 5.4 * sc], [gx - 3.4 * sc, gy + 4.4 * sc], [gx - 4.2 * sc, gy + 0.5 * sc], [gx - 2.2 * sc, gy - 3.6 * sc]], '#a77a3e', { k: 181, lw: 1.2 * sc, tex: 0.3, strokes: 2 }); }
  // the V collar, left over right: a dark collar band with the pale under-collar line inside it, from the nape round
  // the front of the neck and down across the chest into the obi
  sweep(g, [tp(1.06, -tw * 0.2), tp(1.08, tw * 0.06), tp(0.9, tw * 0.3), tp(0.55, tw * 0.44), tp(0.2, tw * 0.44)], 3.4 * sc, mix(L.kim, PAPER, 0.16), A, seed + 97);
  sweep(g, [tp(1.09, -tw * 0.12), tp(1.1, tw * 0.1), tp(0.93, tw * 0.24), tp(0.62, tw * 0.36)], 1.7 * sc, PAPER, A * 0.92, seed + 98);
  if (tiedSl && L === LOOKS.ronin) { // the tasuki cord that ties the sleeves back, crossing over the back
    sweep(g, [tp(0.96, -tw * 0.46), tp(0.5, -tw * 0.05), tp(0.14, tw * 0.4)], 1.3 * sc, '#8c7a58', A * 0.9, seed + 175);
    sweep(g, [tp(0.96, tw * 0.3), tp(0.5, -tw * 0.1), tp(0.14, -tw * 0.42)], 1.3 * sc, '#8c7a58', A * 0.9, seed + 176); }
  { const o0 = tp(0.08, -tw * 0.37), o1 = tp(0.08, tw * 0.39); rib(g, [o0[0], o0[1], o1[0], o1[1]], () => 6.5 * sc, o.sash || L.obi || '#7a7064', A, 0.8); sweep(g, [tp(0.02, -tw * 0.3), [tp(0.02, -tw * 0.3)[0] - f * 5 * sc + cloth * 0.6, tp(0.02, -tw * 0.3)[1] + 10 * sc]], 2.4 * sc, o.sash || L.obi || '#7a7064', A, seed + 98); }
  if (L.mino) {
    // the scarecrow's straw raincoat: a ragged cape over the shoulders, all dry straw strokes
    const hem = []; for (let i = 0; i <= 10; i++) { const u = i / 10, bx = lerp(-tw * 0.95, tw * 0.75, u), dy = (i % 2 ? 10 : 20) * sc + Math.sin(i * 2.3) * 3 * sc; hem.push([H[0] + nfx * bx + cloth * (1 - u * 0.5), H[1] + dy]); }
    const P = [tp(1.08, -6 * sc), tp(1.0, -tw * 0.8), tp(0.3, -tw * 1.0), ...hem, tp(0.45, tw * 0.78), tp(1.0, tw * 0.45)];
    // tiers of straw: ragged rows across the coat
    const tierRows = (q) => { for (const v of [0.72, 0.42]) { const a0 = tp(v, -tw * 0.95), a1 = tp(v, tw * 0.75); for (let j = 0; j < 9; j++) { const u = j / 8, x0 = lerp(a0[0], a1[0], u), y0 = lerp(a0[1], a1[1], u); sweep(q, [[x0, y0 - 2 * sc], [x0 - f * 1 * sc + cloth * 0.3, y0 + (6 + (j % 3) * 2) * sc]], 1.3 * sc, INK, A * 0.55, seed + 160 + j, 2); } } };
    mo(P, L.mino, { k: 98, lw: 1.8 * sc, strokes: 5, inside: (q) => { for (let i = 0; i < 9; i++) { const u = i / 8; const top = [lerp(P[1][0], P[7][0], u), lerp(P[1][1], P[7][1], u)]; sweep(q, [top, [top[0] - f * 2 * sc + cloth * 0.6, top[1] + 30 * sc]], 1.2 * sc, i % 2 ? INK : PAPER, A * 0.35, seed + 99 + i); } tierRows(q); } });
  }
  // ---- neck, head, hair, face ----
  const hc = Math.cos(ha), hs = Math.sin(ha) * f, hk = 1.0 * sc * (L.head || 1), HP = (u, v) => [Hd[0] + (u * hc - v * hs) * hk * f, Hd[1] + (u * hs * f + v * hc) * hk];
  // head: skull, jaw toward the front; face is a pale mass
  const headP = HEADUV.map(([u, v]) => HP(u, v));
  if (fig.garment) { let w0 = 1e9, w1 = -1e9, v0 = 1e9, v1 = -1e9; for (const [u, v] of HEADUV) { w0 = Math.min(w0, u); w1 = Math.max(w1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); } fig.garment.head = { aspect: (v1 - v0) / (w1 - w0), brim: HATBRIM[L.hat] ?? null, top: v0, chin: v1 }; }
  mo(headP, mix(PAPER, L.skin, 0.6), { k: 102, tex: 0.05, ink: null });
  // one tapering stroke for the back of the skull and the cheek on the shadow side; bald heads show the crown too
  sweep(g, [HP(-6.6, -2.5), HP(-7, 1.5), HP(-5.6, 5), HP(-2.4, 7.6)], 1.3 * sc, INK, A * 0.9, seed + 103);
  if (L.hat === 'bald') { sweep(g, [HP(-7, -1), HP(-6, -7), HP(-1, -9.6), HP(3.5, -8.6)], 1.0 * sc, INK, A * 0.75, seed + 104);
    g.save(); g.beginPath(); closedCurve(headP, 2).forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.clip(); g.globalAlpha = A * 0.16; g.fillStyle = cc(INK);
    for (let i = 0; i < 70; i++) { const q = HP(-7 + hash(i, 11) * 13, -9.5 + hash(i, 13) * 10); g.fillRect(q[0], q[1], 0.45 * sc, 0.45 * sc); } g.restore(); }
  if (L.hat !== 'bald' && L.hat !== 'kasa' && L.hat !== 'jingasa' && L.hat !== 'hood') {
    // hair as a solid black mass over the back and top of the skull, plus sweeping strands
    const hcol = L.hat === 'white' ? '#e4ddcf' : '#141210';
    mo([HP(-7.2, 3.5), HP(-7, -4), HP(-2, -9.4), HP(4.5, -7.6), HP(3, -4.5), HP(-1, -4), HP(-2.5, 1), HP(-4, 4.5)], hcol, { k: 104, tex: 0.4, lw: 1.5 * sc });
    if (L.hat === 'chonmage') { mo([HP(-7.2, 3.5), HP(-7.4, -2.5), HP(-4.5, -4), HP(-3, 1), HP(-4, 4.5)], '#141210', { k: 105, tex: 0.3, lw: 1.3 * sc, strokes: 2 }); sweep(g, [HP(-4, -8.6), HP(-0.5, -9.6), HP(3, -9.2)], 2.6 * sc, '#141210', A, seed + 106); }
    const knot = HP(-3, -10.5);
    if (L.hat === 'tail') sweep(g, [knot, HP(-9, -8), [knot[0] - f * 14 * sc + cloth * 1.4, knot[1] + 10 * sc], [knot[0] - f * 22 * sc + cloth * 2.2, knot[1] + 22 * sc]], 4.2 * sc, '#141210', A, seed + 105);
    else if (L.hat === 'band') { sweep(g, [knot, HP(-4.5, -13.2), HP(-7.5, -14.6)], 3.6 * sc, '#141210', A, seed + 106); sweep(g, [knot, HP(-6.5, -12.4), HP(-9.5, -12.8)], 2.4 * sc, '#141210', A, seed + 107); }
    else sweep(g, [knot, HP(-3.5, -13), HP(-6.5, -13.6)], 3.2 * sc, hcol, A, seed + 108);
  }
  if (L.hat === 'band' || L.hat === 'bald' && L.acc && L.shield && !L.lantern) {
    if (L.hat === 'band') { const b0 = HP(-6.8, -3), b1 = HP(6.4, -3.6); rib(g, [b0[0], b0[1], b1[0], b1[1]], () => 3.2 * sc, L.acc, A, 0); sweep(g, [b0, [b0[0] - f * 8 * sc + cloth * 1.2, b0[1] + 2 * sc], [b0[0] - f * 15 * sc + cloth * 2, b0[1] + 5 * sc]], 2.2 * sc, L.acc, A, seed + 109); }
  }
  if (L.band) { const b0 = HP(-6.8, -3.4), b1 = HP(6.4, -4); rib(g, [b0[0], b0[1], b1[0], b1[1]], () => 2.4 * sc, L.band, A, 0); sweep(g, [b0, [b0[0] - f * 7 * sc + cloth, b0[1] + 4 * sc]], 1.6 * sc, L.band, A, seed + 171); const nape = HP(-6, 5); rib(g, [nape[0] - 2 * sc, nape[1], nape[0] + 2 * sc, nape[1] + 1 * sc], () => 2.6 * sc, L.band, A, 0); }
  if (L.beard) { const c0 = HP(5, 4), c1 = HP(1, 8.5); sweep(g, [c0, c1, [c1[0] - f * 2 * sc + cloth * 0.5, c1[1] + (L.beard === 'white' ? 9 : 4) * sc]], (L.beard === 'white' ? 2.6 : 3.4) * sc, L.beard === 'white' ? '#e9e2d3' : '#151311', A, seed + 110); }
  if (L.hat === 'kasa') { const n2 = [HP(-5.5, 8.5)[0] + cloth * 0.5, HP(-5.5, 8.5)[1]]; mo([HP(-7.4, -2.5), HP(-1.5, -3), HP(-2.6, 2.4), HP(-3.6, 5.4), n2, HP(-8, 5.5)], '#1a1613', { k: 109, tex: 0.3, lw: 1.3 * sc, strokes: 2 });
    sweep(g, [HP(-7.2, 3.5), [HP(-10.5, 9.5)[0] + cloth * 0.8, HP(-10.5, 9.5)[1]]], 1.8 * sc, '#1a1613', A, seed + 119); sweep(g, [HP(1.2, -2.6), HP(0.6, 1.2)], 0.9 * sc, '#1a1613', A * 0.9, seed + 120, 2); sweep(g, [HP(-4.5, 5.5), HP(-4.2, 9.6)], 0.8 * sc, '#1a1613', A * 0.8, seed + 121, 2); }
  if (!(L.hat === 'kasa' || L.hat === 'jingasa' || L.hat === 'hood')) {
  }
  // face: in shadow under a hat; one decisive line for the eye
  const shaded = L.hat === 'kasa' || L.hat === 'jingasa' || L.hat === 'hood';
  { g.save(); g.beginPath(); const S = closedCurve(headP, 2); S.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.clip();
    // the far side of the face in shade
    const c0 = HP(-8, -9), c1 = HP(-0.5, -9), c2 = HP(-1.5, 9), c3 = HP(-8, 9); g.globalAlpha = A * 0.2; g.fillStyle = cc(INK); g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.lineTo(c2[0], c2[1]); g.lineTo(c3[0], c3[1]); g.closePath(); g.fill();
    if (shaded) { const b0 = HP(-9, -12), b1 = HP(9, -12), b2 = HP(9, 0.2), b3 = HP(-9, 2.2); g.globalAlpha = A * 0.42; g.fillStyle = cc('#2e2621'); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.lineTo(b3[0], b3[1]); g.closePath(); g.fill(); }
    g.restore(); }
  // under a hat the brim hides the eyes, so the face is read from what is below it: the tip of the nose, the mouth,
  // the line of the jaw; bare-headed figures also get the bridge of the nose
  { g.save(); g.beginPath(); const S = closedCurve(headP, 2); S.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.clip();
    // a soft shadow under the jaw line, the nose's shadow, and stubble on the ronin
    const j0 = HP(-3, 3.5), j1 = HP(1, 8.8), j2 = HP(5, 9.2), j3 = HP(4.5, 7.2), j4 = HP(0.6, 6.4); g.globalAlpha = A * 0.22; g.fillStyle = cc(INK); g.beginPath(); g.moveTo(j0[0], j0[1]); g.lineTo(j1[0], j1[1]); g.lineTo(j2[0], j2[1]); g.lineTo(j3[0], j3[1]); g.lineTo(j4[0], j4[1]); g.closePath(); g.fill();
    if (L === LOOKS.ronin) { g.globalAlpha = A * 0.32; for (let i = 0; i < 16; i++) { const q = HP(-0.5 + (i % 4) * 1.6 + hash(i, 3) * 0.6, 4.6 + Math.floor(i / 4) * 1.0 + hash(i, 5) * 0.5); g.fillRect(q[0], q[1], 0.5 * sc, 0.5 * sc); } }
    const ns = HP(5.6, 1.6), ns2 = HP(7.4, 3.4), ns3 = HP(5.8, 3.6); g.globalAlpha = A * 0.25; g.beginPath(); g.moveTo(ns[0], ns[1]); g.lineTo(ns2[0], ns2[1]); g.lineTo(ns3[0], ns3[1]); g.closePath(); g.fill();
    g.restore(); }
  sweep(g, [HP(2.3, -2.0), HP(4.8, -2.7), HP(6.9, -3.1)], (L.hat === 'bald' ? 2.0 : 1.2) * sc, INK, A * 0.95, seed + 174, 2); // the brow, one angled stroke
  sweep(g, [HP(6.6, -1.6), HP(8.1, 2.6), HP(6.5, 3.4)], 1.15 * sc, INK, A * 0.9, seed + 116, 2); // the nose, an angled line
  sweep(g, [HP(3.9, 5.7), HP(6.1, o.expr === 'hurt' ? 5.9 : 5.4)], (o.expr === 'hurt' ? 1.3 : 1.0) * sc, INK, A * 0.8, seed + 118, 2); // the mouth: one short stroke
  sweep(g, [HP(-3.4, 3.2), HP(-0.6, 7.4), HP(3.6, 8.4)], 1.2 * sc, INK, A * 0.75, seed + 117, 2); // the jaw
  sweep(g, [HP(-1.6, -0.6), HP(-0.4, 0.4), HP(-0.8, 2.4), HP(-2, 2.8)], 1.0 * sc, INK, A * 0.7, seed + 122, 2); // the ear
  // the eyes: an almond suggested by an upper lid heavier at the outer corner, a dark iris dab touching the lid and
  // looking forward, a faint lower lid on the near eye; the far eye in 3/4 view a shorter stroke. Narrowed in a fight,
  // wide with white showing when struck, closed lines at peace.
  const ex = o.expr || 'calm', fierce = ex === 'calm' && !pose.sheath, wide = ex === 'wide' || ex === 'hurt';
  const lid = (u0, u1, v, arc, w0, w1, al, sd) => { const a2 = HP(u0, v), m = HP((u0 + u1) / 2, v - arc), b2 = HP(u1, v + arc * 0.3); rib(g, [a2[0], a2[1], m[0], m[1], b2[0], b2[1]], (u) => (w0 + (w1 - w0) * u) * sc * Math.min(1, (1 - u) * 6 + 0.35), INK, A * al, 0); };
  if (ex === 'win') { lid(5.9, 2.9, -0.4, -0.5, 0.35, 1.1, 0.9, 115); lid(7.9, 6.6, -0.6, -0.3, 0.3, 0.7, 0.7, 119); }
  else {
    const arc = wide ? 1.3 : fierce ? 0.25 : 0.7, v = fierce ? -0.4 : -0.7;
    if (wide) { const w0 = HP(5.9, v), w1 = HP(4.4, v - arc), w2 = HP(2.9, v), w3 = HP(4.4, v + 1.2); g.globalAlpha = A; g.fillStyle = cc(PAPER); g.beginPath(); g.moveTo(w0[0], w0[1]); g.quadraticCurveTo(w1[0], w1[1], w2[0], w2[1]); g.quadraticCurveTo(w3[0], w3[1], w0[0], w0[1]); g.fill(); }
    lid(5.9, 2.9, v, arc, 0.4, fierce ? 1.35 : 1.15, 0.95, 111);
    // the iris: a dark dab under the lid, toward the front, touching it (smaller and free of the lid when wide)
    const ir = HP(wide ? 4.7 : 5.0, v + (wide ? 0.2 : fierce ? 0.15 : 0.05)), r = (wide ? 0.85 : 1.05) * sc; dr(g, ir[0], ir[1], r, INK, A);
    if (!fierce) { const l0 = HP(3.3, v + (wide ? 1.3 : 0.9)), l1 = HP(5.5, v + (wide ? 1.2 : 0.8)); rib(g, [l0[0], l0[1], l1[0], l1[1]], (u) => 0.45 * sc * Math.sin(Math.PI * u), INK, A * 0.4, 0); }
    // the far eye, foreshortened behind the bridge of the nose
    lid(7.6, 6.5, v - 0.2, arc * 0.6, 0.3, 0.8, 0.8, 113);
  }
  if (!o.noHat) drawHat(g, L, HP, Hd, f, sc, A, cloth, t, seed, bn, amp, mo, o);
  // ---- front: shield, weapon, front arm ----
  if (L.shield) {
    const out = o.shieldOut ? 12 : 0, SX = H[0] + f * (18 + out) * sc, SY = H[1] - 14 * sc, w = 9 * sc, h = 42 * sc;
    if (!o.shield) arm(Sf, H[0] + f * 13 * sc, H[1] - 6 * sc, 0, 3);
    else mo([[SX - w, SY - h], [SX - w * 0.9, SY - h * 1.01], [SX + w * 0.9, SY - h * 1.01], [SX + w, SY - h], [SX + w, SY - h * 0.9], [SX + w * 1.02, SY + h * 0.9], [SX + w, SY + h], [SX + w * 0.9, SY + h * 1.01], [SX - w * 0.9, SY + h * 1.01], [SX - w, SY + h], [SX - w, SY + h * 0.9], [SX - w * 1.02, SY - h * 0.9]], '#6b5136', { k: 120, lw: 2.2 * sc, strokes: 4, inside: (q) => {
      for (const u of [-0.33, 0.33]) sweep(q, [[SX + w * u, SY - h], [SX + w * u, SY + h]], 0.9 * sc, INK, A * 0.6, seed + 121, 2);
      for (const v of [-0.6, 0.55]) { rib(q, [SX - w, SY + h * v, SX + w, SY + h * v], () => 3 * sc, '#1a1614', A, 0); for (const u of [-0.6, 0, 0.6]) dr(q, SX + w * u, SY + h * v, 1.1 * sc, '#cfc6b4', A * 0.9); } } });
    // the front hand on the shield's grip
    if (o.shield) arm(Sf, SX - f * 2 * sc, SY + 2 * sc, 0, 3);
  }
  if (!o.noWeapon) {
    // the blade tip never passes below the ground line: lift the angle until it clears
    const reach = (L.weapon === 'odachi' ? 64 : L.weapon === 'katana' ? 50 : L.weapon === 'naginata' ? 106 : L.weapon === 'spear' ? 100 : 0) * sc;
    if (reach && G[1] + dy * reach > y - 2) { const ny = clamp((y - 2 - G[1]) / reach, -1, 1); dy = ny; dx = Math.sign(dx || f) * Math.sqrt(1 - ny * ny); }
    drawWeapon(g, L, G, dx, dy, f, sc, A, pose, o, seed, H, cloth);
  }
  const pump = o.walkPh != null ? -Math.sin(o.walkPh) : 0;
  if (!(L.shield)) arm(Sf, pose.sheath && L.weapon !== 'spear' && L.weapon !== 'bow' ? H[0] + f * (10 + pump * (o.running ? 19 : 6)) * sc : G[0], pose.sheath && L.weapon !== 'spear' && L.weapon !== 'bow' ? H[1] - (4 + (o.running ? 8 + pump * 6 : 0)) * sc : G[1], 0, 2);
  else if (L.weapon === 'club') arm(Sb, G[0], G[1], 0, 4);
  g.restore(); g.globalAlpha = 1;
  let top = 1e9, bot = -1e9; for (const q of headP) { top = Math.min(top, q[1]); bot = Math.max(bot, q[1]); }
  FLATC = null; SHADE = 0;
  return { G, dx, dy, N, H, Hd, hand2, headTop: top, chin: bot, sc };
}
const T4 = [0, 0, 0, 0], T4b = [0, 0, 0, 0];
// the skull in head units (u forward, v down), and where each hat's brim sits on it (v)
const HEADUV = [[-7, -1.5], [-5.6, -7.6], [0, -9.6], [5, -8], [7, -3.2], [7.6, 0.6], [6.9, 4.4], [4.4, 7.6], [0.8, 8.6], [-2.8, 7], [-6.4, 3]];
const HATBRIM = { kasa: -3.2, jingasa: -3.2, hood: -3.5 };
// the body's measures, in units of sc: leg bones, torso, neck; STAND_H is the standing height to the top of the skull
export const LEG = 31, TORSO = 34, NECK = 13, STAND_H = 60.5 + TORSO + NECK + 9.6;

function drawHat(g, L, HP, Hd, f, sc, A, cloth, t, seed, bn, amp, mo, o) {
  if (L.hat === 'kasa') {
    // a wide straw hat: one mass, dark underside, straw strokes from the crown, and a cord that swings late
    // seated on the skull: the crown comes down to the brow, the brim about 2.2 head-widths, shallow, drooping at the edges
    const k = L.hatW || 1, lf = o.running ? 3.2 : 0, P = [HP(-16.5 * k, -0.4 + lf * 0.4), HP(-12 * k, -3.6), HP(-6.5, -9.6), HP(-2, -12), HP(3, -12), HP(7.5, -9.4), HP(13 * k, -4.2 - lf * 0.5), HP(17.5 * k, -0.8 - lf), HP(9, -3.3), HP(-9, -3.1)];
    mo(P, o.hatCol || L.hatCol, { k: 130, lw: 2.3 * sc, strokes: 3, inside: (q) => {
      for (let i = -4; i <= 4; i++) sweep(q, [HP(i * 1.1 + 0.5, -11.5), HP(i * 3.8 * k + 0.5, -1.2)], 0.9 * sc, i % 2 ? PAPER : INK, A * 0.32, seed + 131 + i, 2);
      rib(q, [HP(-15 * k, -0.6)[0], HP(-15 * k, -0.6)[1], HP(0, -1.2)[0], HP(0, -1.2)[1], HP(16 * k, -1)[0], HP(16 * k, -1)[1]], () => 2.4 * sc, INK, A * 0.5, 0);
    } });
    const c0 = HP(-5.5, -1.2), c1 = HP(-1, 8.6), c2 = HP(3.5, 9.2); sweep(g, [c0, [c1[0] + cloth * 0.15, c1[1]], c2], 0.7 * sc, INK, A * 0.8, seed + 140); // the chin cord, brim to under the jaw
  } else if (L.hat === 'jingasa') {
    const k = L.hatW || 1;
    mo([HP(-15 * k, -1.4), HP(-10 * k, -6.4), HP(-2.5, -12.8), HP(2.5, -12.8), HP(10 * k, -6.4), HP(15.5 * k, -1.8), HP(7, -3.3), HP(-7, -3.1)], L.acc, { k: 132, lw: 2.1 * sc, inside: (q) => sweep(q, [HP(-10 * k, -2.5), HP(0, -9), HP(10 * k, -2.5)], 1 * sc, PAPER, A * 0.35, seed + 133) });
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
    const big = L.weapon === 'odachi', len = (big ? 64 : 50) * sc, bw = (big ? 3.4 : 2.4) * sc;
    const ex = G[0] + dx * len, ey = G[1] + dy * len, cvx = px * len * 0.025 * f, cvy = py * len * 0.025 * f;
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
    const k = L === LOOKS.ono ? 1.3 : 1.2, b0 = [G[0] - dx * 64 * sc * k, G[1] - dy * 64 * sc * k], tip = [G[0] + dx * 82 * sc * k, G[1] + dy * 82 * sc * k];
    sweep(g, [b0, [(b0[0] + tip[0]) / 2 + px * 1.5 * sc, (b0[1] + tip[1]) / 2 + py * 1.5 * sc], tip], 3 * sc, INK, A, seed + 154, 3);
    const P = [[tip[0] + dx * 18 * sc, tip[1] + dy * 18 * sc], [tip[0] + px * 3 * sc, tip[1] + py * 3 * sc], [tip[0] - dx * 2 * sc, tip[1] - dy * 2 * sc], [tip[0] - px * 3 * sc, tip[1] - py * 3 * sc]];
    g.globalAlpha = A; g.fillStyle = cc('#ece6d8'); g.beginPath(); P.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill(); g.strokeStyle = cc(INK); g.lineWidth = 1.4 * sc; g.stroke();
    o._tip = P[0];
  } else if (L.weapon === 'naginata') {
    const b0 = [G[0] - dx * 72 * sc, G[1] - dy * 72 * sc], tip = [G[0] + dx * 80 * sc, G[1] + dy * 80 * sc];
    sweep(g, [b0, tip], 2.8 * sc, '#3a2a1e', A, seed + 170, 3);
    // the curved blade: pale steel, a dark spine, swept back like a long cleaver
    const e = [tip[0] + dx * 26 * sc + px * 6 * sc * f, tip[1] + dy * 26 * sc + py * 6 * sc * f];
    const B = [[tip[0] + px * 2.2 * sc, tip[1] + py * 2.2 * sc], [tip[0] + dx * 14 * sc + px * 4.8 * sc * f, tip[1] + dy * 14 * sc + py * 4.8 * sc * f], e, [tip[0] + dx * 12 * sc - px * 1 * sc * f, tip[1] + dy * 12 * sc - py * 1 * sc * f], [tip[0] - px * 2.2 * sc, tip[1] - py * 2.2 * sc]];
    g.globalAlpha = A; g.fillStyle = cc('#f3eee3'); g.beginPath(); B.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill(); g.strokeStyle = cc(INK); g.lineWidth = 1.1 * sc; g.stroke();
    rib(g, [tip[0] - dx * 2 * sc, tip[1] - dy * 2 * sc, tip[0] + dx * 1.5 * sc, tip[1] + dy * 1.5 * sc], () => 5 * sc, '#120f0d', A, 0);
    o._tip = e;
  } else if (L.weapon === 'bow') {
    const Lb = 150 * sc, up = [Math.sin(-0.08) * f, -Math.cos(0.08)], top = [G[0] + up[0] * Lb * 0.66, G[1] + up[1] * Lb * 0.66], bot = [G[0] - up[0] * Lb * 0.34, G[1] - up[1] * Lb * 0.34];
    const lz = o.loosed || 0, bend = 9 * sc * (1 + (o.draw || 0) * 0.5) * (1 - 1.6 * lz); // after the loose the bow turns in the hand
    // asymmetric: the long upper limb bows out more than the short lower one
    sweep(g, [bot, [G[0] + f * bend * 0.7, lerp(G[1], bot[1], 0.5)], [G[0] + f * 2 * sc, G[1]], [G[0] + f * bend, lerp(G[1], top[1], 0.45)], top], 3.2 * sc, INK, A, seed + 155, 6);
    const ear = o._ear || [H[0] - f * 2 * sc, G[1] - 6 * sc], dd = o.draw || 0, pull = clamp((dd - 0.35) / 0.65, 0, 1), nock = dd > 0.1 ? [lerp(G[0] - f * 2 * sc, ear[0], pull), lerp(G[1], ear[1], pull)] : [G[0] - f * 2 * sc + f * 10 * sc * lz, G[1]];
    g.globalAlpha = A * 0.9; g.strokeStyle = cc(INK); g.lineWidth = 0.7 * sc; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(nock[0], nock[1]); g.lineTo(bot[0], bot[1]); g.stroke();
    if (o.draw > 0.1) sweep(g, [nock, [G[0] + f * 16 * sc, G[1] - 1 * sc]], 1.4 * sc, INK, A, seed + 156, 2);
    o._tip = [G[0] + f * 14 * sc, G[1]]; o._nock = nock;
  } else if (L.weapon === 'club') {
    const len = 58 * sc, ex = G[0] + dx * len, ey = G[1] + dy * len;
    const P = [[G[0] - dx * 8 * sc + px * 2.5 * sc, G[1] - dy * 8 * sc + py * 2.5 * sc], [ex + px * 6 * sc, ey + py * 6 * sc], [ex + dx * 3 * sc, ey + dy * 3 * sc], [ex - px * 6 * sc, ey - py * 6 * sc], [G[0] - dx * 8 * sc - px * 2.5 * sc, G[1] - dy * 8 * sc - py * 2.5 * sc]];
    mass(g, P, { col: '#2b2420', seed: seed + 157, n: o.boilN || 0, amp: o.reduced ? 0 : 0.4 * sc, a: A, lw: 1.9 * sc, ox: G[0], oy: G[1], inside: (q) => {
      for (const u of [0.36, 0.97]) { const cx = G[0] + dx * len * u, cy = G[1] + dy * len * u; rib(q, [cx + px * 7 * sc, cy + py * 7 * sc, cx - px * 7 * sc, cy - py * 7 * sc], () => 3.2 * sc, '#0f0c0b', A, 0); }
      for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { const u = 0.45 + i * 0.09, cx = G[0] + dx * len * u + px * sd * 3.4 * sc * u, cy = G[1] + dy * len * u + py * sd * 3.4 * sc * u; dr(q, cx, cy, 1.3 * sc, '#cfc6b4', A * 0.85); } } });
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
  if (init || !ch.inited) { for (let i = 0; i < ch.length; i++) { ch[i][0] = ch[i][2] = ax - face * i * seg * 0.3; ch[i][1] = ch[i][3] = ay + i * seg * 0.95; } ch.inited = true; } // it starts hanging
  ch[0][0] = ax; ch[0][1] = ay;
  const h = Math.min(dt, 1 / 30);
  for (let i = 1; i < ch.length; i++) {
    const q = ch[i]; const vxq = clamp((q[0] - q[2]) * 0.9, -8, 8), vyq = clamp((q[1] - q[3]) * 0.9, -8, 8);
    q[2] = q[0]; q[3] = q[1];
    const flap = Math.sin(fig.t * (7 + Math.abs(vx) * 0.03) - i * 0.9) * 0.6 * (0.4 + Math.abs(wind) + Math.abs(vx) / 120);
    q[0] += vxq + (wind * 160 - vx * 0.35) * h * h + flap * 0.2 * (i / ch.length); q[1] += vyq + (1100 + flap * 600 * (i / ch.length)) * h * h; // a long cloth: it hangs, and swings
  }
  for (let it = 0; it < 3; it++) for (let i = 1; i < ch.length; i++) {
    const a = ch[i - 1], b = ch[i]; const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = (d - seg) / d;
    if (i === 1) { b[0] -= dx * k; b[1] -= dy * k; } else { a[0] += dx * k * 0.5; a[1] += dy * k * 0.5; b[0] -= dx * k * 0.5; b[1] -= dy * k * 0.5; }
  }
  // it hangs from the collar down the back: each segment within about 40 degrees of hanging straight down, the tail
  // allowed a little more so it can curl
  for (let i = 1; i < ch.length; i++) { const a = ch[i - 1], b = ch[i]; let an = Math.atan2(b[0] - a[0], b[1] - a[1]); const lim = i >= ch.length - 2 ? 0.95 : 0.7;
    an = clamp(an, -lim, lim); b[0] = a[0] + Math.sin(an) * seg; b[1] = a[1] + Math.cos(an) * seg; }
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

// ---------- gaits ----------
// A cycle is two steps. The stance foot moves back exactly as fast as the ground passes (no sliding): the phase comes
// from distance travelled, never from time. Swing feet travel on an eased arc with the knee lifted.
const GAITS = {
  ronin: { ws: 38, rs: 50, wd: 0.6, rd: 0.28, wl: 7, rl: 20, wb: 1.8, rb: 5, wn: 0.06, rn: 0.5, hy: 2, low: 6, kick: 15, reach: 12 },
  bandit: { ws: 30, rs: 40, wd: 0.58, rd: 0.4, wl: 8, rl: 12, wb: 3, rb: 5, wn: 0.22, rn: 0.32, hy: 5 },
  spear: { ws: 32, rs: 40, wd: 0.6, rd: 0.42, wl: 7, rl: 9, wb: 0.6, rb: 1.2, wn: 0.06, rn: 0.1, hy: 1 },
  brute: { ws: 30, rs: 36, wd: 0.66, rd: 0.5, wl: 10, rl: 12, wb: 4, rb: 6, wn: 0.1, rn: 0.14, hy: 2, stomp: 1 },
};
GAITS.archer = GAITS.spear; GAITS.duelist = GAITS.ronin; GAITS.master = GAITS.ronin; GAITS.gonroku = GAITS.bandit; GAITS.ono = GAITS.spear; GAITS.shizu = GAITS.ronin; GAITS.hyoe = GAITS.brute;
export function walkLegs(pose, dist, speed, st, look = 'ronin', acc = 0) {
  if (speed < 8 || !(st === 'move' || st === 'enter' || st === 'ready' || st === 'approach' || st === 'idle' || st === 'wind')) return -1;
  const G = GAITS[look] || GAITS.ronin, L = LOOKS[look] || LOOKS.ronin, sc = L.sc, run = speed > 200;
  const step = run ? G.rs : G.ws, C = step * 2, u = ((dist / C) % 1 + 1) % 1, d = run ? G.rd : G.wd, lift = run ? G.rl : G.wl, bob = run ? G.rb : G.wb;
  // a sprint: after toe-off the heel kicks high behind, then the leg reaches long in front before it lands
  const kick = run ? G.kick || 0 : 0, reach = run ? G.reach || 0 : 0;
  const foot = (q) => { q = ((q % 1) + 1) % 1; if (q < d) return [(d * C / 2 - q * C) / sc, 0];
    const k = (q - d) / (1 - d), e = k * k * (3 - 2 * k), sk = Math.sin(Math.PI * k);
    return [(lerp(-d * C / 2, d * C / 2, e) - kick * sk * (1 - k) * 2 + reach * sk * k * 2) / sc, -lift * sk / sc * (k < 0.5 ? 1.25 : 0.7)]; };
  pose.ff = foot(u); pose.fb = foot(u + 0.5); pose.gait = 1; // a walking or running body stays tall
  if (run && G.kick) { const back = 9; pose.ff[0] -= back; pose.fb[0] -= back; pose.hx = (pose.hx || 0) + 2; } // the sprint leans from the ankles: the feet drive from behind the hips
  // the hips drop just after each contact and rise in the passing and flight poses
  pose.hy += G.hy + bob * Math.cos(2 * Math.PI * (2 * u - 0.16)) - (run ? 3 : 0) + (run ? G.low || 0 : 0); // a swordsman runs low
  pose.lean += (run ? G.rn : G.wn) + clamp(acc / 2600, -0.22, 0.16);
  pose.head = (pose.head || 0) + (run ? -0.12 : 0); // the head stays up, eyes ahead, under the tipped brim
  return u;
}
