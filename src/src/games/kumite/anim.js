// NEON KUMITE · animation: keyframed poses per fighter and move, interpolated with easing.
// Poses are hand/foot targets in fighter-local units (x forward, y up); the rig solves elbows and knees.
import { FIGHTERS } from './data.js';
import { LOOKS } from './rig.js';
const D2R = Math.PI / 180;
// hip height that bends the knees `dev` degrees with the feet at fx (front) and bx (back): a ready fighter stands tall
function hipFor(id, fx, bx, dev) {
  const L = LOOKS[id]; const l1 = L.leg[0], l2 = L.leg[1];
  const d = Math.sqrt(l1 * l1 + l2 * l2 + 2 * l1 * l2 * Math.cos(dev * D2R));
  const spread = (Math.abs(fx - 4) + Math.abs(bx + 4)) / 2;
  return Math.round(Math.sqrt(Math.max(1, d * d - spread * spread)) + 8);
}

// P(hipX, hipY, lean, head, nearHand x,y, farHand x,y, nearFoot x,y, farFoot x,y, handN, handF, toeN, toeF, extra)
// hand kinds: 0 open, 1 fist, 2 blade, 3 grab
function P(a, x) {
  const p = { hip: [a[0], a[1]], lean: a[2], head: a[3], hn: [a[4], a[5]], hf: [a[6], a[7]], fn: [a[8], a[9]], ff: [a[10], a[11]], handN: a[12] ?? 1, handF: a[13] ?? 1, toeN: a[14] || 0, toeF: a[15] || 0, rot: 0, sq: 1, str: 1 };
  return x ? Object.assign(p, x) : p;
}
function lerp(a, b, t) {
  const o = { hip: [a.hip[0] + (b.hip[0] - a.hip[0]) * t, a.hip[1] + (b.hip[1] - a.hip[1]) * t] };
  for (const k of ['hn', 'hf', 'fn', 'ff']) o[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
  for (const k of ['lean', 'head', 'toeN', 'toeF', 'rot', 'sq', 'str']) o[k] = (a[k] ?? (k === 'sq' || k === 'str' ? 1 : 0)) + ((b[k] ?? (k === 'sq' || k === 'str' ? 1 : 0)) - (a[k] ?? (k === 'sq' || k === 'str' ? 1 : 0))) * t;
  const pick = t < 0.5 ? a : b;
  o.handN = pick.handN; o.handF = pick.handF; o.strike = b.strike || a.strike; o.kneeN = pick.kneeN; o.kneeF = pick.kneeF; o.fx = pick.fx; o.alpha = (a.alpha ?? 1) + ((b.alpha ?? 1) - (a.alpha ?? 1)) * t;
  return o;
}
const ease = { io: (t) => t * t * (3 - 2 * t), out: (t) => 1 - (1 - t) * (1 - t), in3: (t) => t * t * t, snap: (t) => 1 - Math.pow(1 - t, 3) };
const off = (p, dx, dy) => { const o = lerp(p, p, 0); o.hip[0] += dx; o.hip[1] += dy; for (const k of ['hn', 'hf']) { o[k][0] += dx; o[k][1] += dy; } return o; };

// ---------------------------------------------------------------- base poses per fighter
const OLD_HIP = { rin: 77, ganji: 72, suzu: 90, sayo: 70 }; // stance hips the hand-keyed special poses were drawn for
const HY = { rin: hipFor('rin', 24, -16, 22), ganji: hipFor('ganji', 30, -24, 22), suzu: hipFor('suzu', 14, -22, 16), sayo: hipFor('sayo', 34, -32, 30) };
const SHY = (id) => HY[id] + LOOKS[id].torso - 7; // shoulder height
const BASE = {
  // RIN: light and forward on the balls of the feet, lead fist out, chin behind it, back heel up
  rin: { stance: P([3, HY.rin, 10, 2, 40, SHY('rin') + 10, 22, SHY('rin') + 2, 24, 0, -16, 0, 1, 1, 0, 30]), crouch: P([-2, 50, 26, 10, 36, 100, 22, 92, 28, 0, -24, 0, 1, 1, 0, 34]) },
  // GANJI: planted square, wide base, open hands low and forward like a doorman about to take a collar
  ganji: { stance: P([0, HY.ganji, 8, 0, 50, SHY('ganji') - 18, 30, SHY('ganji') - 12, 30, 0, -24, 0, 3, 3, 0, 8]), crouch: P([-2, 48, 26, 10, 46, 86, 26, 80, 32, 0, -32, 0, 3, 3, 0, 18]) },
  // SUZU: tall, side-on and still; one hand up conducting the drone, the other on her hip
  suzu: { stance: P([0, HY.suzu, -3, 2, 30, SHY('suzu') + 4, -14, HY.suzu + 8, 14, 0, -22, 0, 2, 0, 0, 12]), crouch: P([-2, 54, 22, 8, 36, 104, 12, 94, 28, 0, -26, 0, 2, 1, 0, 26]) },
  // SAYO: low and coiled, weight sitting back, palm forward, rear hand high behind her
  sayo: { stance: P([-2, HY.sayo, 12, 2, 46, SHY('sayo') - 2, -22, SHY('sayo') + 22, 34, 0, -32, 0, 2, 2, 0, 22]), crouch: P([-2, 44, 26, 10, 44, 92, 0, 106, 36, 0, -34, 0, 2, 2, 0, 32]) },
};
for (const id in BASE) {
  const b = BASE[id], s = b.stance, c = b.crouch, y = s.hip[1], cy = c.hip[1];
  b.block = P([-5, y - 4, 8, 14, 32, y + 64, 26, y + 54, s.fn[0] - 4, 0, s.ff[0] - 6, 0, 1, 1, 0, 18]);
  b.cblock = P([-6, cy - 3, 22, 16, 32, cy + 60, 24, cy + 52, c.fn[0] - 2, 0, c.ff[0], 0, 1, 1, 0, 30]);
  b.jsq = P([0, y - 20, 18, 10, 30, y + 26, -14, y + 22, s.fn[0], 0, s.ff[0], 0, 1, 1, 0, 0], { sq: 0.9 });
  b.rise = P([0, 90, 6, -8, 36, 152, 14, 142, 22, 36, -14, 50, 1, 1, -10, 10], { sq: 1.05 });
  b.fall = P([0, 86, 10, 4, 34, 134, 12, 124, 18, 8, -18, 16, 1, 1, 10, -10]);
  b.land = P([0, y - 18, 20, 10, 34, y + 30, 8, y + 24, s.fn[0] + 3, 0, s.ff[0] - 3, 0, 1, 1, 0, 0], { sq: 0.88 });
  b.dashF = P([10, y - 8, 30, 6, 36, y + 30, -30, y + 24, 38, 10, -40, 18, 1, 1, 0, 34]);
  b.dashB = P([-8, y + 2, -14, -8, 32, y + 56, 8, y + 46, 14, 14, -24, 4, 1, 1, 10, 0]);
  // hit high: the head snaps back and the whole body follows in one backward curve, arms trailing forward
  b.hitHead = P([-12, y + 1, -28, -34, 24, y + 40, 6, y + 30, s.fn[0] + 2, 0, s.ff[0] - 12, 0, 0, 0, 10, 0]);
  // hit in the gut: folds over the blow, hands come in, hips pushed back
  b.hitGut = P([-12, y - 8, 42, 26, 24, y + 14, 12, y + 18, s.fn[0] - 6, 0, s.ff[0] - 6, 0, 0, 0, 0, 14]);
  b.hitLow = P([-6, y - 10, 14, -12, 42, y + 46, -28, y + 38, 38, 22, s.ff[0], 0, 0, 0, 34, 0]);
  b.hitCrouch = P([-8, cy, 0, -28, 24, cy + 62, -12, cy + 54, c.fn[0], 0, c.ff[0], 0, 0, 0, 0, 20]);
  b.juggle = P([0, 72, -36, -28, 42, 126, -26, 140, 46, 34, 16, 20, 0, 0, 0, 0]);
  b.down = P([0, 12, 0, 8, -10, 160, 8, 152, 6, -68, -8, -70, 0, 0, 0, 0], { rot: 90 });
  b.held = P([0, 80, -18, -28, 28, 120, -16, 112, 14, 6, -12, 14, 0, 0, 24, 24]);
  b.tech = P([-12, y, -14, -10, 50, y + 50, 34, y + 40, s.fn[0], 0, s.ff[0] - 12, 0, 0, 0, 0, 0]);
  b.lose = P([0, y - 10, 38, 38, 22, y, 6, y - 2, s.fn[0] - 8, 0, s.ff[0] + 6, 0, 0, 0, 0, 0]);
}
// ending illustrations for the arcade story cards
BASE.rin.ending = P([0, 84, -10, -16, 18, 158, -14, 100, 10, 0, -18, 0, 1, 0, 0, 20]); // leaning back, skewer to her mouth, other hand on the hip
BASE.ganji.ending = P([0, 70, 18, 10, 20, 118, 32, 112, 34, 0, -30, 0, 1, 1, 0, 0]); // arms folded, settled, head down, done for the night
BASE.suzu.ending = P([0, 92, -8, -10, 40, 176, -12, 98, 6, 0, -18, 0, 0, 0, 0, 24]); // arm up, launching the drone
BASE.sayo.ending = P([0, 50, 26, -6, 44, 74, 10, 110, 36, 0, -30, 0, 0, 2, 0, 30]); // crouched on the roof edge, chin on the back of her hand
// win poses: each one a still you could put on a poster
// win poses: poster stills
BASE.rin.win = P([0, HY.rin + 2, -8, -14, 20, SHY('rin') + 72, -12, HY.rin + 12, 12, 0, -20, 0, 1, 0, 0, 26]); // fist to the sky, hand on the hip, weight on one leg
BASE.ganji.win = P([0, HY.ganji, -6, -14, 14, SHY('ganji') - 14, 34, SHY('ganji') - 18, 34, 0, -34, 0, 1, 1, 0, 0]); // arms folded over the chest, chin up, planted wide
BASE.suzu.win = P([0, HY.suzu + 2, -6, 4, 24, SHY('suzu') + 44, -14, HY.suzu + 8, 4, 0, -16, 0, 2, 0, 0, 30]); // two fingers to the visor, hip cocked, feet crossed
BASE.sayo.win = P([0, HY.sayo - 4, 12, 14, 44, HY.sayo + 30, -40, SHY('sayo') + 42, 28, 6, -20, 0, 2, 2, 50, 0]); // palm low, rear arm sweeping high, toe pointed
for (const id in BASE) { // lose: bent over, hands on the knees, still looking at the winner
  const y = HY[id]; BASE[id].lose = P([-4, y - 12, 50, -34, 24, y - 34, 12, y - 38, BASE[id].stance.fn[0] + 4, 0, BASE[id].stance.ff[0] - 4, 0, 0, 0, 0, 0]);
  // a short idle fidget unique to each fighter so nobody stands like a mannequin
  const st = BASE[id].stance, sh = SHY(id);
  BASE[id].fidget = {
    rin: P([3, HY.rin, 6, 18, 40, sh + 10, 30, sh + 18, 24, 0, -22, 0, 1, 0, 0, 30]), // checks the watch on her rear wrist
    ganji: P([0, HY.ganji, 4, -22, 50, sh - 18, 30, sh - 12, 30, 0, -30, 0, 3, 3, 0, 8], { rot: 0 }), // cracks his neck to one side
    suzu: P([0, HY.suzu, -3, -6, 14, sh + 34, -14, HY.suzu + 8, 14, 0, -22, 0, 2, 0, 0, 12]), // taps the side of her visor
    sayo: P([-2, HY.sayo, 10, 0, 64, sh - 20, -22, sh + 22, 34, 0, -32, 0, 0, 2, 0, 22]), // flicks the near sleeve out
  }[id];
}
const MV = {
  rin: {
    L5: { a: P([-2, 78, 2, 4, 24, 126, 16, 122, 24, 0, -24, 0, 1, 1, 0, 18]), s: P([8, 77, 18, 10, 78, 126, 18, 124, 32, 0, -20, 0, 1, 1, 0, 26], { strike: 'hn', str: 1.08 }), f: P([4, 78, 12, 8, 60, 126, 18, 122, 28, 0, -22, 0, 1, 1, 0, 22]) },
    H5: { a: P([-2, 80, 4, 0, 26, 130, 8, 118, 28, 40, -14, 0, 1, 1, 10, 20]), s: P([-10, 84, -20, -8, 6, 134, -28, 120, 94, 118, -12, 0, 1, 1, 24, 34], { strike: 'fn', str: 1.08 }), f: P([-6, 82, -10, -4, 16, 130, -18, 120, 64, 66, -12, 0, 1, 1, 10, 24]) },
    L2: { a: P([-4, 46, 22, 10, 30, 94, 18, 88, 32, 14, -26, 0, 1, 1, 10, 30]), s: P([-8, 44, 16, 6, 26, 94, 14, 86, 84, 8, -26, 0, 1, 1, 0, 30], { strike: 'fn', str: 1.05 }), f: P([-6, 46, 20, 8, 28, 94, 16, 86, 60, 6, -26, 0, 1, 1, 0, 30]) },
    H2: { a: P([-6, 38, 34, 10, 30, 70, 10, 76, 30, 4, -26, 0, 1, 1, 0, 30]), s: P([-14, 26, 44, 14, 24, 30, 4, 58, 104, 6, -20, 0, 0, 1, 0, 30], { strike: 'fn', str: 1.08 }), f: P([-10, 30, 40, 12, 26, 34, 6, 62, 70, 6, -22, 0, 0, 1, 0, 30]) },
    Lj: { a: P([0, 80, 4, 2, 30, 134, 8, 126, 2, 46, -12, 46, 1, 1, 0, 0]), s: P([4, 84, 14, 8, 28, 140, 4, 130, 48, 64, -14, 42, 1, 1, 30, 0], { strike: 'fn' }), f: P([0, 82, 10, 6, 26, 128, 6, 120, 26, 50, -12, 44, 1, 1, 10, 0]) },
    Hj: { a: P([0, 88, -12, -4, 24, 130, -8, 126, 40, 70, -16, 48, 1, 1, 0, 0]), s: P([0, 86, -6, -2, 22, 128, -12, 122, 52, 12, -18, 46, 1, 1, 40, 0], { strike: 'fn', str: 1.06 }), f: P([0, 86, 6, 4, 28, 138, -6, 130, 30, 40, -18, 48, 1, 1, 10, 0]) },
    S: { a: P([-6, 76, 2, 4, 26, 118, 4, 112, 26, 0, -26, 0, 1, 1, 0, 30]), s: P([10, 92, 4, 6, 36, 122, -6, 140, 30, 62, -26, 14, 1, 1, 20, 40], { strike: 'fn', kneeN: 1 }), f: P([8, 86, 8, 6, 34, 120, 0, 132, 28, 50, -24, 6, 1, 1, 10, 30]) },
    fS: { a: P([0, 84, -10, -6, 26, 134, -10, 126, 40, 150, -16, 8, 1, 1, 0, 0]), s: P([6, 84, -4, -2, 26, 132, -12, 124, 70, 58, -16, 6, 1, 1, 30, 10], { strike: 'fn', str: 1.08 }), f: P([4, 80, 4, 0, 28, 130, -6, 122, 50, 20, -18, 0, 1, 1, 20, 10]) },
    bS: { a: P([0, 66, 18, 10, 26, 104, 6, 98, 26, 0, -24, 0, 1, 1, 0, 0]), s: P([0, 96, -8, -12, 18, 156, -12, 140, 24, 120, -10, 26, 1, 1, 20, 30], { strike: 'fn', kneeN: 1 }), f: P([0, 92, -4, -6, 22, 146, -8, 134, 26, 96, -10, 22, 1, 1, 10, 20]) },
    jS: { a: P([0, 84, 14, 6, 24, 128, 0, 120, 28, 40, -14, 50, 1, 1, 0, 0]), s: P([0, 72, 22, 10, 20, 118, -18, 118, 48, -2, -18, 42, 1, 1, 40, 0], { strike: 'fn', str: 1.05 }), f: null },
    EX: { a: P([-6, 74, 4, 4, 24, 116, 4, 110, 26, 0, -26, 0, 1, 1, 0, 30]), s: P([12, 96, 2, 4, 40, 124, -8, 146, 30, 66, -26, 14, 1, 1, 20, 40], { strike: 'fn', kneeN: 1 }), f: P([10, 94, -6, -6, 30, 150, -6, 138, 28, 108, -18, 30, 1, 1, 10, 30], { strike: 'fn' }) },
    SU: { a: P([-8, 70, 20, 8, 24, 104, -12, 98, 30, 0, -34, 0, 1, 1, 0, 40]), s: P([12, 90, 10, 6, 40, 124, -8, 138, 34, 66, -26, 20, 1, 1, 20, 40], { strike: 'fn' }), f: P([6, 84, 8, 6, 34, 124, 0, 130, 30, 40, -24, 6, 1, 1, 10, 30]) },
    TH: { a: P([4, 78, 16, 8, 40, 120, 30, 112, 28, 0, -22, 0, 0, 0, 0, 20]), s: P([10, 78, 20, 8, 56, 120, 48, 112, 32, 0, -20, 0, 3, 3, 0, 20]), f: P([-6, 78, -14, -8, 22, 126, 10, 118, 26, 0, -30, 0, 3, 3, 0, 24]) },
  },
  ganji: {
    L5: { a: P([-4, 72, 10, 8, 30, 106, 20, 96, 28, 0, -28, 0, 0, 3, 0, 14]), s: P([10, 70, 24, 10, 78, 110, 26, 98, 36, 0, -24, 0, 0, 3, 0, 24], { strike: 'hn', str: 1.08 }), f: P([6, 71, 20, 10, 64, 108, 24, 96, 32, 0, -26, 0, 0, 3, 0, 20]) },
    H5: { a: P([-8, 76, -14, -8, 6, 172, 0, 164, 26, 0, -30, 0, 1, 1, 0, 10]), s: P([12, 64, 40, 16, 84, 100, 72, 104, 40, 0, -26, 0, 1, 1, 0, 30], { strike: 'hn', str: 1.06 }), f: P([8, 62, 42, 18, 76, 74, 66, 80, 38, 0, -26, 0, 1, 1, 0, 30]) },
    L2: { a: P([-4, 46, 26, 12, 40, 76, 22, 70, 16, 24, -28, 0, 3, 3, 10, 20]), s: P([-8, 44, 20, 10, 38, 78, 20, 70, 76, 10, -28, 0, 3, 3, 0, 20], { strike: 'fn', str: 1.05 }), f: P([-6, 45, 24, 12, 38, 76, 20, 70, 56, 6, -28, 0, 3, 3, 0, 20]) },
    H2: { a: P([-4, 54, 26, 12, 30, 72, 18, 70, 28, 0, -28, 0, 1, 1, 0, 20]), s: P([6, 80, -10, -12, 36, 184, 8, 110, 30, 0, -26, 0, 1, 1, 0, 30], { strike: 'hn', str: 1.06 }), f: P([4, 78, -6, -8, 32, 170, 10, 108, 30, 0, -26, 0, 1, 1, 0, 30]) },
    Lj: { a: P([0, 78, -6, 0, 4, 140, 16, 110, 20, 36, -12, 40, 1, 1, 0, 0]), s: P([4, 80, 24, 10, 40, 82, 18, 104, 22, 34, -12, 40, 1, 1, 0, 0], { strike: 'hn' }), f: P([2, 78, 18, 8, 38, 92, 18, 106, 22, 36, -12, 40, 1, 1, 0, 0]) },
    Hj: { a: P([0, 82, -10, -6, 36, 142, -16, 140, 26, 36, -18, 40, 3, 3, 0, 0]), s: P([0, 70, 30, 14, 54, 40, -8, 48, 30, 30, -16, 36, 0, 0, 0, 0], { rot: 0, strike: 'hn' }), f: P([0, 78, 6, 4, 40, 112, 4, 108, 26, 36, -16, 38, 1, 1, 0, 0]) },
    S: { a: P([-8, 72, -2, 0, 18, 116, 8, 108, 30, 0, -28, 0, 3, 3, 0, 16]), s: P([14, 66, 34, 12, 80, 108, 70, 96, 40, 0, -24, 0, 3, 3, 0, 30], { strike: 'hn' }), f: P([10, 66, 30, 12, 66, 100, 58, 92, 36, 0, -24, 0, 3, 3, 0, 30]) },
    fS: { a: P([-8, 72, 6, 6, -26, 118, 20, 96, 24, 0, -30, 0, 0, 1, 0, 14]), s: P([12, 72, 22, 10, 92, 132, -10, 100, 40, 0, -22, 0, 0, 1, 0, 30], { strike: 'hn', str: 1.05, fx: 'armor' }), f: P([10, 72, 18, 8, 80, 128, -4, 100, 36, 0, -24, 0, 0, 1, 0, 30]) },
    bS: { a: P([-4, 60, 16, 4, 40, 110, 30, 104, 28, 0, -28, 0, 3, 3, 0, 14]), s: P([4, 84, -12, -20, 40, 192, 26, 184, 26, 0, -26, 0, 3, 3, 0, 30], { strike: 'hn' }), f: P([2, 82, -8, -14, 38, 180, 24, 172, 26, 0, -26, 0, 3, 3, 0, 30]) },
    dS: { a: P([-6, 80, -6, -6, 30, 124, 4, 118, 30, 70, -28, 0, 1, 1, 0, 14]), s: P([4, 56, 24, 16, 44, 92, 20, 88, 44, 0, -30, 0, 1, 1, 0, 20], { strike: 'fn', sq: 0.9 }), f: P([2, 60, 22, 12, 42, 94, 20, 90, 42, 0, -30, 0, 1, 1, 0, 20]) },
    EX: { a: P([-10, 70, -4, 0, 16, 112, 6, 106, 30, 0, -30, 0, 3, 3, 0, 16]), s: P([18, 64, 38, 14, 92, 108, 82, 96, 46, 0, -24, 0, 3, 3, 0, 30], { strike: 'hn' }), f: P([12, 66, 32, 12, 74, 100, 64, 92, 40, 0, -24, 0, 3, 3, 0, 30]) },
    SU: { a: P([-8, 66, 24, 12, 54, 94, 44, 88, 30, 0, -32, 0, 3, 3, 0, 16]), s: P([16, 64, 36, 12, 94, 110, 84, 98, 46, 0, -26, 0, 3, 3, 0, 30], { strike: 'hn' }), f: P([12, 66, 32, 12, 78, 104, 68, 94, 40, 0, -26, 0, 3, 3, 0, 30]) },
    TH: { a: P([2, 72, 16, 8, 46, 108, 36, 100, 30, 0, -26, 0, 0, 0, 0, 16]), s: P([10, 72, 22, 10, 62, 112, 52, 104, 34, 0, -24, 0, 3, 3, 0, 20]), f: P([-6, 72, -14, -8, 22, 120, 10, 112, 26, 0, -30, 0, 3, 3, 0, 24]) },
  },
  suzu: {
    L5: { a: P([-2, 80, 0, 0, 22, 116, -2, 100, 18, 0, -20, 0, 2, 0, 0, 12]), s: P([8, 80, 14, 6, 78, 126, 0, 108, 26, 0, -18, 0, 0, 1, 0, 22], { strike: 'hn', str: 1.06, fx: 'zap' }), f: P([4, 80, 10, 4, 60, 122, 0, 104, 22, 0, -20, 0, 0, 1, 0, 18]) },
    H5: { a: P([-4, 82, -6, -4, 28, 126, 0, 112, 26, 48, -18, 0, 2, 1, 0, 12]), s: P([-12, 84, -20, -8, 30, 132, -16, 118, 100, 84, -16, 0, 2, 1, 20, 20], { strike: 'fn', str: 1.06 }), f: P([-8, 82, -12, -6, 28, 128, -10, 114, 70, 60, -16, 0, 2, 1, 10, 16]) },
    L2: { a: P([-2, 48, 22, 10, 30, 90, 12, 84, 30, 12, -24, 0, 2, 1, 0, 26]), s: P([-6, 46, 18, 8, 30, 92, 12, 84, 82, 8, -24, 0, 2, 1, 0, 26], { strike: 'fn', fx: 'zap' }), f: P([-4, 47, 20, 8, 30, 90, 12, 84, 58, 6, -24, 0, 2, 1, 0, 26]) },
    H2: { a: P([-4, 40, 30, 10, 34, 70, 4, 74, 30, 4, -24, 0, 0, 1, 0, 26]), s: P([-12, 30, 40, 12, 30, 34, 0, 60, 116, 6, -22, 0, 0, 1, 0, 30], { strike: 'fn', str: 1.08 }), f: P([-8, 32, 36, 12, 30, 38, 2, 62, 80, 6, -22, 0, 0, 1, 0, 30]) },
    Lj: { a: P([0, 82, -6, -4, 20, 150, 0, 120, 18, 40, -12, 46, 2, 1, 0, 0]), s: P([0, 82, 16, 8, 52, 78, 0, 116, 20, 38, -12, 44, 2, 1, 0, 0], { strike: 'hn' }), f: P([0, 84, -4, -2, 30, 138, 4, 126, 22, 40, -12, 46, 2, 1, 0, 0]) },
    Hj: { a: P([0, 86, -8, -4, 24, 130, -6, 122, 32, 60, -14, 46, 2, 1, 0, 0]), s: P([0, 84, -4, 0, 24, 128, -8, 122, 44, 4, -16, 44, 2, 1, 30, 0], { strike: 'fn' }), f: P([0, 84, 6, 2, 28, 138, -4, 130, 24, 38, -16, 46, 2, 1, 0, 0]) },
    S: { a: P([-4, 80, -4, -2, 14, 128, -6, 104, 18, 0, -22, 0, 0, 0, 0, 12]), s: P([4, 80, 8, 2, 70, 132, -14, 108, 24, 0, -20, 0, 0, 0, 0, 18], { fx: 'cast' }), f: P([2, 80, 6, 2, 60, 130, -12, 106, 22, 0, -20, 0, 0, 0, 0, 16]) },
    fS: { a: P([-4, 78, -2, -4, 18, 120, -6, 102, 18, 0, -22, 0, 0, 0, 0, 12]), s: P([0, 82, -10, -14, 50, 172, -14, 106, 22, 0, -22, 0, 0, 0, 0, 16], { fx: 'cast' }), f: P([0, 84, 2, 0, 38, 130, -12, 100, 20, 0, -22, 0, 0, 1, 0, 14]) },
    dS: { a: P([-2, 60, 16, 10, 30, 96, 6, 90, 26, 0, -22, 0, 0, 0, 0, 20]), s: P([4, 36, 34, 18, 62, 8, 10, 70, 30, 0, -24, 8, 0, 0, 0, 40], { fx: 'cast' }), f: P([2, 40, 30, 14, 56, 12, 8, 74, 28, 0, -24, 6, 0, 0, 0, 40]) },
    bS: { a: P([0, 70, 16, 10, 20, 98, 6, 92, 18, 0, -22, 0, 1, 1, 0, 12]), s: P([0, 84, -6, -10, 44, 162, -40, 152, 24, 0, -26, 0, 0, 0, 0, 12], { fx: 'arc' }), f: P([0, 80, 10, 4, 34, 112, -6, 100, 22, 0, -26, 0, 1, 1, 0, 12]) },
    EX: { a: P([-6, 78, -6, -2, 10, 128, -8, 104, 18, 0, -24, 0, 0, 0, 0, 12]), s: P([6, 78, 12, 4, 76, 130, 60, 122, 28, 0, -20, 0, 0, 0, 0, 20], { fx: 'cast' }), f: P([4, 78, 10, 4, 66, 128, 52, 120, 26, 0, -20, 0, 0, 0, 0, 18]) },
    SU: { a: P([-6, 78, -8, -4, 10, 140, -10, 132, 18, 0, -24, 0, 0, 0, 0, 12]), s: P([2, 78, 4, 2, 72, 128, 64, 118, 30, 0, -22, 0, 0, 0, 0, 20], { fx: 'beam' }), f: P([-4, 86, -6, -2, 30, 104, 10, 100, 18, 0, -22, 0, 1, 1, 0, 12]) },
    TH: { a: P([2, 80, 10, 4, 40, 118, 26, 108, 20, 0, -20, 0, 0, 0, 0, 12]), s: P([8, 80, 16, 6, 56, 118, 46, 110, 24, 0, -20, 0, 3, 3, 0, 16]), f: P([-6, 80, -14, -8, 22, 128, 10, 120, 26, 0, -30, 0, 3, 3, 0, 24]) },
  },
  sayo: {
    L5: { a: P([-2, 68, 4, 2, 34, 114, -14, 120, 34, 0, -30, 0, 2, 2, 0, 16]), s: P([8, 68, 16, 8, 76, 122, -22, 116, 42, 0, -26, 0, 2, 2, 0, 24], { strike: 'hn', str: 1.08 }), f: P([4, 68, 12, 6, 60, 120, -18, 118, 38, 0, -28, 0, 2, 2, 0, 20]) },
    H5: { a: P([-2, 72, 2, 0, 34, 120, -16, 124, 26, 46, -28, 0, 2, 2, 10, 16]), s: P([-10, 80, -26, -10, 20, 128, -36, 112, 86, 150, -18, 0, 2, 2, 30, 30], { strike: 'fn', str: 1.08 }), f: P([-6, 78, -16, -6, 24, 126, -30, 116, 60, 96, -20, 0, 2, 2, 20, 24]) },
    L2: { a: P([-4, 40, 24, 10, 36, 84, 0, 94, 32, 0, -30, 0, 2, 2, 0, 30]), s: P([4, 36, 32, 14, 80, 20, -6, 92, 40, 0, -28, 0, 2, 2, 0, 30], { strike: 'hn', str: 1.06 }), f: P([2, 38, 28, 12, 64, 26, -4, 92, 38, 0, -28, 0, 2, 2, 0, 30]) },
    H2: { a: P([-4, 34, 30, 12, 36, 70, -6, 80, 30, 4, -30, 0, 2, 2, 0, 30]), s: P([-12, 24, 44, 14, 30, 28, -10, 54, 108, 6, -24, 0, 0, 2, 0, 30], { strike: 'fn', str: 1.08 }), f: P([-8, 26, 40, 14, 30, 30, -8, 56, 76, 6, -24, 0, 0, 2, 0, 30]) },
    Lj: { a: P([0, 82, 10, 6, 32, 130, -10, 134, 20, 42, 8, 56, 2, 2, 0, 0]), s: P([0, 80, 40, 20, 22, 126, -14, 140, 30, 24, -32, 22, 2, 2, 30, 30], { strike: 'ff', rot: -20 }), f: P([0, 82, 30, 14, 24, 120, -12, 128, 24, 30, -20, 36, 2, 2, 20, 20]) },
    Hj: { a: P([0, 88, -16, -6, 24, 136, -16, 132, 30, 140, -16, 50, 2, 2, 0, 0]), s: P([0, 84, -6, -2, 24, 130, -18, 126, 54, 4, -18, 46, 2, 2, 40, 0], { strike: 'fn', str: 1.08 }), f: P([0, 84, 8, 4, 30, 136, -12, 132, 28, 40, -18, 48, 2, 2, 0, 0]) },
    S: { a: P([0, 56, 20, 10, 30, 100, -6, 110, 30, 0, -28, 0, 2, 2, 0, 20], { alpha: 1 }), s: P([0, 96, 0, 0, 8, 160, -4, 164, 6, 30, -6, 34, 2, 2, 40, 40], { alpha: 0.05, fx: 'vanish' }), f: P([0, 64, 12, 6, 40, 110, -10, 118, 32, 0, -28, 0, 2, 2, 0, 16]) },
    fS: { a: P([-4, 82, -20, -10, 28, 132, -20, 130, 30, 150, -20, 40, 2, 2, 0, 0], { rot: -30 }), s: P([4, 84, 24, 10, 30, 126, -20, 130, 74, 66, -16, 40, 2, 2, 40, 0], { strike: 'fn', str: 1.08 }), f: P([2, 80, 16, 8, 30, 124, -18, 126, 54, 30, -18, 20, 2, 2, 20, 0]) },
    dS: { a: P([-2, 44, 24, 12, 36, 80, -6, 92, 18, 0, -30, 0, 2, 2, 0, 30]), s: P([-6, 26, -36, -20, -26, 10, -34, 24, 74, 10, 34, 6, 0, 0, 20, 10], { strike: 'fn' }), f: P([-4, 28, -30, -16, -22, 12, -30, 26, 68, 10, 30, 6, 0, 0, 20, 10]) },
    bS: { a: P([-2, 66, 6, 4, 40, 118, -12, 120, 32, 0, -30, 0, 2, 2, 0, 16]), s: P([-4, 64, 0, 4, 30, 140, 24, 128, 30, 0, -32, 0, 2, 2, 0, 20], { fx: 'veil' }), f: P([2, 72, 18, 8, 44, 104, -20, 124, 36, 0, -32, 0, 2, 2, 0, 20]) },
    VS: { a: P([-6, 64, 0, 0, 20, 120, -20, 118, 30, 0, -30, 0, 2, 2, 0, 20]), s: P([10, 66, 24, 10, 86, 110, -30, 116, 46, 0, -26, 0, 0, 2, 0, 30], { strike: 'hn', str: 1.1 }), f: P([6, 66, 18, 8, 70, 110, -24, 116, 40, 0, -28, 0, 0, 2, 0, 26]) },
    EX: { a: P([0, 56, 20, 10, 30, 100, -6, 110, 30, 0, -28, 0, 2, 2, 0, 20], { alpha: 0.05, fx: 'vanish' }), s: P([-4, 84, -20, -10, 24, 140, -24, 126, 60, 156, -16, 0, 2, 2, 30, 30], { strike: 'fn', str: 1.1 }), f: P([-2, 80, -12, -6, 26, 134, -22, 124, 44, 110, -18, 0, 2, 2, 20, 24]) },
    SU: { a: P([-6, 60, 30, 10, 30, 96, -20, 104, 36, 0, -36, 0, 2, 2, 0, 40]), s: P([14, 66, 30, 10, 90, 112, -34, 110, 48, 0, -30, 0, 0, 2, 0, 40], { strike: 'hn', str: 1.1 }), f: P([10, 66, 24, 10, 76, 112, -28, 112, 44, 0, -30, 0, 0, 2, 0, 36]) },
    TH: { a: P([2, 68, 10, 4, 48, 114, 30, 110, 34, 0, -28, 0, 0, 0, 0, 16]), s: P([8, 68, 16, 6, 60, 116, 50, 112, 38, 0, -26, 0, 3, 3, 0, 20]), f: P([-6, 68, -14, -8, 22, 116, 10, 108, 26, 0, -30, 0, 3, 3, 0, 24]) },
  },
};

// grab / cinematic sequences for the attacker, keyed by frame in the grab
const SEQ = {
  TH: (b) => [[0, MV_TH_HOLD(b)], [14, P([0, b.stance.hip[1], -14, -10, 40, 160, 30, 150, 26, 0, -26, 0, 3, 3, 0, 20])], [26, P([12, b.stance.hip[1] - 6, 34, 10, 76, 100, 60, 90, 38, 0, -22, 0, 0, 0, 0, 30])], [40, b.stance]],
  ganji_S: [[0, P([10, 66, 30, 12, 66, 104, 58, 94, 36, 0, -24, 0, 3, 3, 0, 30])], [18, P([0, 80, -16, -14, 30, 186, 22, 180, 30, 0, -28, 0, 3, 3, 0, 20])], [34, P([4, 84, -20, -16, 34, 196, 26, 188, 30, 0, -28, 0, 3, 3, 0, 20])], [40, P([16, 50, 54, 20, 70, 30, 60, 34, 44, 0, -30, 0, 3, 3, 0, 30], { sq: 0.92 })], [50, BASE_REF('ganji', 'stance')]],
  ganji_EX: [[0, P([14, 64, 36, 12, 72, 104, 62, 94, 40, 0, -24, 0, 3, 3, 0, 30])], [20, P([0, 82, -18, -14, 26, 190, 18, 182, 30, 0, -28, 0, 3, 3, 0, 20])], [38, P([0, 86, -24, -16, 30, 200, 22, 192, 30, 0, -28, 0, 3, 3, 0, 20])], [46, P([18, 46, 58, 22, 74, 26, 64, 30, 46, 0, -30, 0, 3, 3, 0, 30], { sq: 0.9 })], [56, BASE_REF('ganji', 'stance')]],
  ganji_SU: [[0, P([14, 64, 36, 12, 72, 104, 62, 94, 40, 0, -24, 0, 3, 3, 0, 30])], [14, P([10, 70, 30, 10, 74, 150, -20, 110, 40, 0, -24, 0, 3, 1, 0, 30])], [22, P([12, 72, 34, 10, 60, 110, 70, 140, 40, 0, -24, 0, 1, 3, 0, 30])], [30, P([0, 82, -16, -14, 30, 190, 22, 182, 30, 0, -28, 0, 3, 3, 0, 20])], [52, P([0, 88, -22, -18, 26, 236, 20, 228, 30, 0, -28, 0, 3, 3, 0, 20])], [72, P([20, 42, 60, 24, 80, 22, 66, 26, 48, 0, -32, 0, 3, 3, 0, 30], { sq: 0.88 })], [84, BASE_REF('ganji', 'stance')]],
  ganji_bS: [[0, P([4, 84, -12, -20, 40, 192, 26, 184, 26, 0, -26, 0, 3, 3, 0, 30])], [16, P([2, 86, -18, -20, 36, 210, 26, 200, 26, 0, -26, 0, 3, 3, 0, 30])], [30, P([16, 50, 54, 20, 70, 34, 60, 38, 44, 0, -30, 0, 3, 3, 0, 30], { sq: 0.92 })], [40, BASE_REF('ganji', 'stance')]],
  rin_SU: [[0, P([12, 90, 10, 6, 40, 124, -8, 138, 34, 66, -26, 20, 1, 1, 20, 40])], [6, P([-8, 82, -20, -8, 6, 134, -28, 120, 90, 124, -12, 0, 1, 1, 24, 34], { strike: 'fn' })], [12, P([6, 80, 16, 10, 78, 128, 18, 124, 32, 0, -20, 0, 1, 1, 0, 26], { strike: 'hn' })], [18, P([8, 78, 18, 8, 22, 122, 80, 118, 30, 0, -22, 0, 1, 1, 0, 26], { strike: 'hf' })], [24, P([-8, 84, -18, -8, 8, 134, -26, 122, 92, 90, -12, 0, 1, 1, 24, 34], { strike: 'fn' })], [32, P([-6, 82, -16, -6, 10, 132, -24, 120, 94, 116, -12, 0, 1, 1, 24, 34], { strike: 'fn' })], [42, P([10, 92, 4, 6, 36, 122, -6, 140, 30, 62, -26, 14, 1, 1, 20, 40], { strike: 'fn' })], [50, P([-2, 70, 20, 10, 24, 104, 8, 98, 26, 0, -24, 0, 1, 1, 0, 20])], [56, P([0, 100, -14, -16, 18, 160, -12, 140, 30, 170, -10, 20, 1, 1, 0, 30], { strike: 'fn', str: 1.1 })], [70, BASE_REF('rin', 'stance')]],
  sayo_SU: [[0, P([14, 66, 30, 10, 90, 112, -34, 110, 48, 0, -30, 0, 0, 2, 0, 40])], [10, P([10, 66, 24, 10, 86, 120, -30, 116, 46, 0, -26, 0, 0, 2, 0, 30], { strike: 'hn', alpha: 0.6 })], [20, P([-10, 80, -26, -10, 20, 128, -36, 112, 86, 150, -18, 0, 2, 2, 30, 30], { strike: 'fn', alpha: 0.6 })], [30, P([4, 36, 32, 14, 80, 30, -6, 92, 40, 0, -28, 0, 2, 2, 0, 30], { strike: 'hn', alpha: 0.6 })], [40, P([10, 66, 24, 10, 86, 110, -30, 116, 46, 0, -26, 0, 0, 2, 0, 30], { strike: 'hn', alpha: 0.6 })], [50, P([-10, 80, -26, -10, 20, 128, -36, 112, 86, 140, -18, 0, 2, 2, 30, 30], { strike: 'fn', alpha: 0.7 })], [58, P([0, 56, 20, 10, 30, 100, -6, 110, 30, 0, -28, 0, 2, 2, 0, 20])], [66, P([0, 90, -20, -14, 24, 150, -24, 136, 50, 170, -16, 10, 2, 2, 30, 30], { strike: 'fn', str: 1.12 })], [78, BASE_REF('sayo', 'stance')]],
};
function BASE_REF(id, k) { return BASE[id][k]; }
function MV_TH_HOLD(b) { return P([8, b.stance.hip[1], 18, 8, 52, 118, 44, 110, 30, 0, -22, 0, 3, 3, 0, 20]); }
const seqCache = {};
function seqFor(id, mv) {
  const k = id + '_' + mv; if (seqCache[k]) return seqCache[k];
  return (seqCache[k] = SEQ[k] || SEQ.TH(BASE[id]));
}
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, pa] = keys[i], [tb, pb] = keys[i + 1];
    if (t <= tb) { const k = (t - ta) / Math.max(1, tb - ta); return lerp(pa, pb, pb.strike ? ease.snap(k) : ease.io(k)); }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------- main entry: pose for a fighter this frame
export function poseFor(f, S, rs) {
  const B = BASE[f.id];
  const t = (rs.t || 0);
  const ch = FIGHTERS[f.id];
  let p;
  const breath = Math.sin(t * 2.6 + f.side) * 1.4;
  switch (f.st) {
    case 'idle': case 'guard': {
      const bounce = f.id === 'rin' ? -Math.abs(Math.sin(t * 5.2 + f.side)) * 3.2 : f.id === 'suzu' ? breath * 0.3 : f.id === 'ganji' ? breath * 0.6 : breath;
      p = f.st === 'guard' ? B.block : off(B.stance, 0, bounce);
      if (f.st === 'idle' && B.fidget) { // a short personal fidget every few seconds of standing still
        const cyc = (f.sf + f.side * 97) % 260; if (f.sf > 90 && cyc < 48) { const k = Math.sin((cyc / 48) * Math.PI); p = lerp(p, B.fidget, ease.io(Math.min(1, k * 1.6))); }
      }
      if (f.st === 'idle') { p.hn[1] += breath * 0.6; p.hf[1] += breath * 0.8; }
      break;
    }
    case 'walk': {
      const dir = Math.sign(f.vx * f.face) || 1;
      const ph = (rs.walk || 0);
      const s = B.stance;
      const st = 15;
      p = lerp(s, s, 0);
      const a = ph * Math.PI * 2;
      p.fn = [s.fn[0] + Math.cos(a) * st * dir, Math.max(0, Math.sin(a)) * 12];
      p.ff = [s.ff[0] + Math.cos(a + Math.PI) * st * dir, Math.max(0, Math.sin(a + Math.PI)) * 12];
      p.hip = [s.hip[0] + 2 * dir, s.hip[1] - Math.abs(Math.sin(a * 2)) * 3 + 1];
      p.lean = s.lean + 4 * dir;
      p.hn[1] += Math.sin(a) * 2; p.hf[1] -= Math.sin(a) * 2;
      break;
    }
    case 'crouch': p = off(B.crouch, 0, breath * 0.6); break;
    case 'jsq': p = B.jsq; break;
    case 'air': {
      const k = Math.max(0, Math.min(1, (ch.jumpV - f.vy) / (ch.jumpV * 2)));
      p = lerp(B.rise, B.fall, ease.io(k));
      if (Math.abs(f.vx) > 1 && (f.id === 'sayo' || f.id === 'rin')) { // forward/back flips for the acrobats
        const air = 2 * ch.jumpV / ch.grav; const prog = Math.min(1, f.sf / air);
        p.rot = -Math.sign(f.vx * f.face) * ease.io(Math.min(1, prog * 1.25)) * 360;
        p.fn = [14, 50]; p.ff = [-4, 46]; p.hn = [24, 108]; p.hf = [10, 104];
        if (prog > 0.8) p = lerp(p, B.fall, (prog - 0.8) / 0.2);
      }
      break;
    }
    case 'land': p = lerp(B.land, B.stance, Math.min(1, f.sf / Math.max(1, f.landRec + 3))); break;
    case 'dash': {
      const n = f.dashDir > 0 ? ch.dashF[0] : ch.dashB[0];
      p = lerp(f.dashDir > 0 ? B.dashF : B.dashB, B.stance, ease.io(Math.max(0, (f.sf - n * 0.55) / (n * 0.45))));
      break;
    }
    case 'block': {
      const base = f.crouchBlk ? B.cblock : B.block;
      p = lerp(off(base, -5, -2), base, Math.min(1, f.sf / 5));
      break;
    }
    case 'hit': {
      const r = f.crouchBlk ? B.hitCrouch : f.react === 'head' ? B.hitHead : f.react === 'low' ? B.hitLow : B.hitGut;
      const tot = f.sf + f.stun; const k = f.sf < 3 ? ease.out(f.sf / 3) : 1 - ease.io(Math.max(0, (f.sf - tot * 0.5) / (tot * 0.5)));
      p = lerp(f.crouchBlk ? B.crouch : B.stance, r, Math.max(0, Math.min(1, k)));
      break;
    }
    case 'juggle': case 'ko': case 'reset': {
      p = lerp(B.juggle, B.juggle, 0);
      const spin = f.st === 'reset' ? -Math.min(1, f.sf / 26) * 360 : Math.max(-100, -f.sf * 4 - (f.vy < 0 ? 20 : 0));
      p.rot = f.st === 'reset' ? spin : -spin * 0.8 + 0;
      if (f.st !== 'reset') p.rot = Math.min(80, f.sf * 3.2);
      p.fn = [40 + Math.sin(f.sf * 0.4) * 6, 30]; p.ff = [12, 18 + Math.cos(f.sf * 0.4) * 6];
      if (f.st === 'reset' && f.sf > 18) p = lerp(p, B.fall, Math.min(1, (f.sf - 18) / 8));
      break;
    }
    case 'down': case 'dead': {
      p = lerp(B.down, B.down, 0);
      if (f.st === 'dead') { p.hn = [-14, 160]; p.hf = [10, 150]; }
      p.sq = f.sf < 6 ? 1 - Math.sin(f.sf / 6 * Math.PI) * 0.08 : 1;
      break;
    }
    case 'rise': {
      const k = Math.min(1, f.sf / 18);
      p = k < 0.55 ? lerp(B.down, B.crouch, ease.io(k / 0.55)) : lerp(B.crouch, B.stance, ease.io((k - 0.55) / 0.45));
      break;
    }
    case 'win': p = lerp(B.stance, B.win, ease.out(Math.min(1, f.sf / 18))); p = off(p, 0, Math.sin(t * 2) * 1.2); break;
    case 'lose': p = lerp(B.stance, B.lose, ease.io(Math.min(1, f.sf / 30))); break;
    case 'held': {
      p = lerp(B.held, B.held, 0);
      p.rot = rs.heldRot || 0;
      break;
    }
    case 'tech': p = lerp(B.tech, B.stance, Math.min(1, f.sf / 16)); break;
    case 'grab': {
      const mv = f.grab ? f.grab.mv : 'TH';
      const keys = seqFor(f.id, mv === 'TH' || !SEQ[f.id + '_' + mv] ? (mv === 'TH' ? 'TH' : mv) : mv);
      p = keyed(Array.isArray(keys) ? keys : SEQ.TH(B), f.sf);
      break;
    }
    case 'atk': p = movePose(f, B); break;
    default: p = B.stance;
  }
  return p;
}

// ---------------------------------------------------------------- keyed strikes
// The hand-keyed special poses were drawn for lower stances: lift their hips and hands onto the new ones.
for (const id in MV) {
  const d = HY[id] - OLD_HIP[id];
  const lift = (p) => { if (!p || p._lifted) return; p._lifted = 1; p.hip[1] += d; p.hn[1] += d; p.hf[1] += d; };
  for (const k in MV[id]) { const m = FIGHTERS[id].moves[k]; if (m && m.air) continue; const A = MV[id][k]; lift(A.a); lift(A.s); lift(A.f); }
  for (const k of ['ending']) { const p = BASE[id][k]; p.hip[1] += d; p.hn[1] += d; p.hf[1] += d; }
}
// Every strike is keyed from its own hitbox, so the active pose lands exactly where the hit is:
// startup coils the whole body away from the target, active is full extension with hips and shoulders through it,
// the back foot driving and the head on the target, recovery overshoots and settles.
const KIND = {
  rin: { L5: 'jab', H5: 'kickHigh', L2: 'kickLow', H2: 'sweep', Lj: 'airKnee', Hj: 'airStamp', S: 'knee', fS: 'axe', bS: 'kneeUp', EX: 'knee', SU: 'knee', TH: 'grab' },
  ganji: { L5: 'jab', H5: 'hammer', L2: 'kickLow', H2: 'upper', Lj: 'airHand', S: 'grab', fS: 'lariat', bS: 'grabUp', EX: 'grab', SU: 'grab', TH: 'grab' },
  suzu: { L5: 'jab', H5: 'kickHigh', L2: 'kickLow', H2: 'sweep', Lj: 'airHand', Hj: 'airStamp', TH: 'grab' },
  sayo: { L5: 'jab', H5: 'kickHigh', L2: 'palmLow', H2: 'sweep', Hj: 'airStamp', VS: 'jab', EX: 'kickHigh', SU: 'jab', TH: 'grab' },
};
const HAND = { rin: 1, ganji: 0, suzu: 2, sayo: 2 };
function keyStrike(id, k, kind) {
  const m = FIGHTERS[id].moves[k], sc = FIGHTERS[id].scale, s = BASE[id].stance, c = BASE[id].crouch, y = HY[id], sh = SHY(id);
  const h = m.hit || [10, 60, 70, 120];
  const T = [h[2] / sc - 4, ((h[1] + h[3]) / 2) / sc];
  const fx = s.fn[0], bx = s.ff[0], hk = HAND[id];
  const Q = (a, x) => P(a, x);
  switch (kind) {
    case 'jab': return {
      a: Q([-5, y - 3, 0, 8, 14, sh - 2, 24, sh - 10, fx - 4, 0, bx, 0, 1, 1, 0, 18]),
      s: Q([10, y - 4, 20, -10, T[0], T[1], 18, sh - 8, fx + 8, 0, bx + 6, 0, hk, 1, 0, 36], { strike: 'hn', str: 1.08 }),
      f: Q([7, y - 4, 15, -6, T[0] - 16, T[1] - 6, 20, sh - 8, fx + 6, 0, bx + 4, 0, hk, 1, 0, 30]) };
    case 'hammer': return {
      a: Q([-8, y + 2, -16, -6, -6, sh + 46, -2, sh + 40, fx - 2, 0, bx, 0, 1, 1, 0, 10]),
      s: Q([14, y - 10, 40, -18, T[0], T[1], T[0] - 12, T[1] + 6, fx + 12, 0, bx + 4, 0, 1, 1, 0, 34], { strike: 'hn', str: 1.06 }),
      f: Q([10, y - 14, 44, -20, T[0] - 6, T[1] - 22, T[0] - 16, T[1] - 16, fx + 10, 0, bx + 4, 0, 1, 1, 0, 30]) };
    case 'upper': return {
      a: Q([-4, c.hip[1] + 4, 30, 6, 20, c.hip[1] - 4, 26, c.hip[1] + 26, c.fn[0], 0, c.ff[0], 0, 1, 1, 0, 24]),
      s: Q([8, y + 6, -10, -18, T[0], T[1], 14, sh - 14, fx + 6, 0, bx + 4, 0, 1, 1, 0, 40], { strike: 'hn', str: 1.06 }),
      f: Q([6, y + 2, -4, -12, T[0] - 6, T[1] - 16, 14, sh - 14, fx + 4, 0, bx + 4, 0, 1, 1, 0, 30]) };
    case 'lariat': return {
      a: Q([-8, y, 2, 4, -32, sh - 6, 22, sh - 18, fx - 4, 0, bx - 4, 0, 0, 1, 0, 12]),
      s: Q([14, y - 2, 18, -8, T[0], T[1], -12, sh - 20, fx + 16, 0, bx + 6, 0, 0, 1, 0, 34], { strike: 'hn', str: 1.05, fx: 'armor' }),
      f: Q([12, y - 2, 12, -4, T[0] - 24, T[1] - 4, -6, sh - 20, fx + 14, 0, bx + 6, 0, 0, 1, 0, 30]) };
    case 'kickHigh': { const high = T[1] > y + 30; return {
      a: Q([-2, y - 2, 2, 4, 30, sh + 6, 10, sh - 4, T[0] * 0.3, y * (high ? 0.7 : 0.5), bx + 4, 0, 1, 1, 10, 16]),
      s: Q([-8, y + 2, high ? -26 : -16, high ? 20 : 12, 26, sh + 2, -30, sh - 18, T[0], T[1], bx + 8, 0, 1, 1, 26, 0], { strike: 'fn', str: 1.08 }),
      f: Q([-4, y, high ? -14 : -8, 10, 28, sh + 4, -22, sh - 14, T[0] * 0.6, (T[1] + y * 0.5) / 2, bx + 6, 0, 1, 1, 12, 0]) }; }
    case 'kickLow': return {
      a: Q([-2, c.hip[1], 24, 8, 32, c.hip[1] + 44, 20, c.hip[1] + 36, c.fn[0] - 8, 20, c.ff[0], 0, 1, 1, 10, 30]),
      s: Q([-8, c.hip[1] - 2, 14, 4, 28, c.hip[1] + 46, 16, c.hip[1] + 38, T[0], Math.max(6, T[1] - 4), c.ff[0], 0, 1, 1, 0, 30], { strike: 'fn', str: 1.05 }),
      f: Q([-5, c.hip[1], 20, 6, 30, c.hip[1] + 44, 18, c.hip[1] + 36, T[0] * 0.65, 8, c.ff[0], 0, 1, 1, 0, 30]) };
    case 'sweep': return {
      a: Q([-4, c.hip[1] - 6, 34, 10, 28, 18, 8, c.hip[1] + 24, 22, 6, c.ff[0], 0, 0, 1, 0, 30]),
      s: Q([-14, c.hip[1] - 18, 46, 18, 26, 6, -8, c.hip[1] + 10, T[0], 6, c.ff[0] + 6, 0, 0, 1, 0, 30], { strike: 'fn', str: 1.08 }),
      f: Q([-10, c.hip[1] - 14, 40, 14, 26, 8, -4, c.hip[1] + 14, T[0] * 0.65, 6, c.ff[0] + 4, 0, 0, 1, 0, 30]) };
    case 'palmLow': return {
      a: Q([-6, c.hip[1], 20, 8, 10, c.hip[1] + 14, 0, c.hip[1] + 50, c.fn[0], 0, c.ff[0], 0, 2, 2, 0, 30]),
      s: Q([6, c.hip[1] - 8, 38, -16, T[0], Math.max(12, T[1]), -10, c.hip[1] + 46, c.fn[0] + 8, 0, c.ff[0] + 4, 0, 2, 2, 0, 36], { strike: 'hn', str: 1.06 }),
      f: Q([4, c.hip[1] - 6, 32, -10, T[0] - 14, Math.max(14, T[1] + 4), -8, c.hip[1] + 46, c.fn[0] + 6, 0, c.ff[0] + 4, 0, 2, 2, 0, 32]) };
    case 'knee': case 'kneeUp': { const up = kind === 'kneeUp'; return {
      a: Q([-4, y - 10, 20, 8, 28, sh - 2, 14, sh - 8, fx, 0, bx - 6, 0, 1, 1, 0, 20]),
      s: Q([6, y + (up ? 14 : 8), up ? -6 : 2, up ? -16 : -4, T[0] - 4, T[1] + 22, 12, sh + (up ? 20 : 0), T[0] - 26, T[1] - 26, bx + 4, up ? 26 : 8, 1, 1, 20, 34], { strike: 'fn', kneeN: 1 }),
      f: Q([4, y + 2, 6, 0, 30, sh, 12, sh - 6, 10, y * 0.45, bx + 2, 0, 1, 1, 10, 24]) }; }
    case 'axe': return {
      a: Q([0, y + 6, -16, -8, 26, sh + 10, -12, sh + 4, 34, y + 70, bx + 10, 30, 1, 1, 0, 0]),
      s: Q([6, y + 4, 6, -10, 26, sh + 6, -14, sh, T[0], T[1], bx + 10, 20, 1, 1, 34, 10], { strike: 'fn', str: 1.08 }),
      f: Q([4, y, 6, -4, 28, sh + 4, -10, sh, T[0] * 0.7, Math.max(8, T[1] - 30), bx + 6, 0, 1, 1, 20, 10]) };
    case 'airKnee': case 'airStamp': case 'airHand': { const B = BASE[id].fall; const tuck = { hip: [0, 84] };
      const limb = kind === 'airHand' ? 'hn' : 'fn';
      const a = P([0, 86, kind === 'airStamp' ? -12 : 8, 4, 22, 136, 4, 128, kind === 'airKnee' ? -16 : 8, kind === 'airKnee' ? 30 : 52, -8, 56, 1, 1, 0, 0]); // a real tuck
      const sPose = kind === 'airHand' ? P([2, 84, 24, -10, T[0], T[1], -4, 124, 18, 34, -12, 40, hk, 1, 0, 0], { strike: 'hn' })
        : kind === 'airKnee' ? P([4, 86, 10, -6, 30, 140, 4, 132, T[0] - 10, T[1] - 30, -14, 40, 1, 1, 30, 0], { strike: 'fn', kneeN: 1 })
        : P([0, 88, -8, 12, 26, 138, -10, 130, T[0], T[1], -18, 46, 1, 1, 40, 0], { strike: 'fn', str: 1.06 });
      const f = lerp(sPose, a, 0.45); f.strike = undefined; return { a, s: sPose, f }; }
    case 'grab': case 'grabUp': { const up = kind === 'grabUp'; return {
      a: Q([-6, y - (up ? 12 : 4), up ? 22 : 4, 6, 14, up ? sh - 30 : sh - 22, 4, up ? sh - 34 : sh - 26, fx - 4, 0, bx - 4, 0, 0, 0, 0, 14]),
      s: Q([10, y + (up ? 8 : -6), up ? -12 : 22, up ? -20 : -6, T[0], T[1] + (up ? 10 : 0), T[0] - 10, T[1] - 6, fx + 12, 0, bx + 6, 0, 3, 3, 0, 32], { strike: 'hn' }),
      f: Q([-6, y - 2, -10, 0, 22, sh - 8, 12, sh - 14, fx + 2, 0, bx - 2, 0, 3, 3, 0, 20]) }; }
  }
  return null;
}
for (const id in KIND) for (const k in KIND[id]) { const g = keyStrike(id, k, KIND[id][k]); if (g) MV[id][k] = { ...MV[id][k], ...g }; }

function movePose(f, B) {
  const m = FIGHTERS[f.id].moves[f.mv];
  const A = MV[f.id][f.mv] || MV[f.id].S;
  const st = m.st, ac = Math.max(1, m.ac), rc = m.rc, tot = st + ac + rc;
  const t = f.mf;
  const base = m.air ? B.fall : f.mv === 'L2' || f.mv === 'H2' ? B.crouch : B.stance;
  const ka = Math.max(1, st - Math.min(3, Math.ceil(st * 0.35))); // anticipation peak
  if (m.air && m.dive) { return t < st ? lerp(base, A.a, ease.out(t / st)) : A.s; }
  let p;
  if (t <= ka) p = lerp(base, A.a, ease.out(t / ka));
  else if (t < st) p = lerp(A.a, A.s, ease.in3((t - ka) / (st - ka)));
  else if (t < st + ac) { p = A.s; if (m.hits > 1 && A.f && m.gap) { const k = ((t - st) % m.gap) / m.gap; p = lerp(A.s, A.f, Math.sin(k * Math.PI) * 0.6); } }
  else {
    const r = (t - st - ac) / Math.max(1, rc);
    const fol = A.f || A.s;
    p = r < 0.45 ? lerp(A.s, fol, ease.out(r / 0.45)) : lerp(fol, base, ease.io((r - 0.45) / 0.55));
  }
  if (f.mv === 'SU' && f.id === 'suzu' && t >= st && t < st + ac) p = A.s;
  if (A.s.strike && t >= st && t < st + ac) { // commit: hips turn through the strike and the back foot drives
    p = lerp(p, p, 0); const kick = A.s.strike === 'fn' || A.s.strike === 'ff';
    p.hip[0] += kick ? 2 : 5; p.lean += kick ? -3 : 5; p.toeF = Math.max(p.toeF || 0, 32);
  }
  if (f.mv === 'bS' && f.id === 'sayo') p = t < st ? lerp(base, A.s, ease.out(t / st)) : t < m.parry[1] ? A.s : lerp(A.s, base, ease.io((t - m.parry[1]) / (tot - m.parry[1])));
  if (f.mv === 'fS' && f.id === 'sayo' && t >= 2 && t <= 22) { const k = (t - 2) / 20; p = lerp(p, p, 0); p.rot = -k * 360; }
  // smear hint: from the anticipation pose to the strike
  p = lerp(p, p, 0);
  if (A.s.strike && t >= ka && t <= st + 2) { p.smear = { limb: A.s.strike, from: A.a[A.s.strike], k: 1 - Math.abs(t - st) / 3 }; }
  return p;
}
export { BASE, MV };
