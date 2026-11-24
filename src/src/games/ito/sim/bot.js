// A scripted courier. It only uses the inputs a player has (stick, camera yaw/pitch, swing, dash, zip, dive), so if it can
// finish a run, a person can. Used by the tests, the medal tuning and the title-screen attract mode.
// It is a tiny model-predictive controller: every 0.2 s it rolls the real physics forward for a few candidate plans
// ("attach now and hold for h seconds", "wait", "dash") and keeps the one that reaches the target soonest.
import { MODE, P, stepPlayer } from './physics.js';

const ROLL_DT = 1 / 60, HORIZON = 2.4, REPLAN = 0.2;
const scratchEv = [];
const rin = { mx: 0, my: 1, swing: false, dash: false, zip: false, dive: false, yaw: 0, pitch: 0 };

export function createBot() {
  return { t: 0, plan: null, replanT: 0, yaw: null, swing: false, lastMode: -1, modeT: 0, pressCool: 0, zipCool: 0, target: null, ring: -1, lastD: 1e9, stuckT: 0, magnet: null };
}
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function segD(ax, ay, az, bx, by, bz, q) {
  const dx = bx - ax, dy = by - ay, dz = bz - az, l2 = dx * dx + dy * dy + dz * dz;
  let t = l2 > 1e-9 ? ((q.x - ax) * dx + (q.y - ay) * dy + (q.z - az) * dz) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(ax + dx * t - q.x, ay + dy * t - q.y, az + dz * t - q.z);
}
function steer(pl, tg, yaw, inp) {
  const dx = tg.x - pl.x, dz = tg.z - pl.z, dy = tg.y - pl.y, hd = Math.hypot(dx, dz);
  inp.yaw = yaw;
  inp.pitch = Math.atan2(dy + 2, Math.max(hd, 1)) * 0.9;
  const drift = pl.vx * Math.cos(yaw) - pl.vz * Math.sin(yaw);
  inp.my = 1; inp.mx = Math.max(-1, Math.min(1, -drift * 0.15));
}

// roll a plan forward; returns a cost (lower is better)
// plan: { attach: bool (hold swing from now), hold: seconds of line from attach, dash: bool, dive: seconds }
function rollout(sim, plan, tg, magnetFn) {
  const pl = Object.assign({}, sim.S.pl);
  const city = sim.city;
  const yaw = Math.atan2(-(tg.x - pl.x), -(tg.z - pl.z));
  rin.swing = pl.prevSwing; rin.dash = false; rin.zip = false; rin.dive = false;
  let t = 0, holdLeft = plan.hold, attached = pl.mode === MODE.SWING, minD = 1e9, cost = 0, autoHold = 0, pressedDash = false;
  const steps = Math.ceil(HORIZON / ROLL_DT);
  for (let k = 0; k < steps; k++) {
    steer(pl, tg, yaw, rin);
    rin.dash = plan.dash && !pressedDash; pressedDash = true;
    rin.dive = t < (plan.dive || 0);
    if (pl.mode === MODE.SWING) {
      if (holdLeft !== null) { holdLeft -= ROLL_DT; rin.swing = holdLeft > 0; if (!rin.swing) holdLeft = null; }
      else { autoHold -= ROLL_DT; rin.swing = autoHold > 0; }
    } else if (pl.mode === MODE.AIR) {
      if (holdLeft !== null && plan.attach) rin.swing = true; // want to attach now
      else { rin.swing = pl.vy < 0 && pl.airT > 0.3 && pl.aim >= 0; if (rin.swing) autoHold = 1.3; }
    } else if (pl.mode === MODE.WALL) { rin.swing = pl.wallT > 0.3 && !rin.swing; }
    else if (pl.mode === MODE.GROUND) { rin.swing = !rin.swing; }
    else rin.swing = false;
    if (holdLeft !== null && !plan.attach && pl.mode !== MODE.SWING) holdLeft = null;
    scratchEv.length = 0;
    const px = pl.x, py = pl.y, pz = pl.z;
    stepPlayer(city, pl, rin, ROLL_DT, scratchEv, 0);
    magnetFn(pl, tg, ROLL_DT);
    t += ROLL_DT;
    for (let e = 0; e < scratchEv.length; e++) {
      const ty = scratchEv[e].type;
      if (ty === 'bounce') cost += 40;
      else if (ty === 'wall') cost += 4;
      else if (ty === 'land') cost += 3;
    }
    if (pl.y < 12) cost += (12 - pl.y) * ROLL_DT * 2;
    const d = segD(px, py, pz, pl.x, pl.y, pl.z, tg);
    if (d < minD) minD = d;
    if (d < 8) return cost + t; // threads the ring (with margin)
    void attached;
  }
  const dEnd = Math.hypot(tg.x - pl.x, tg.y - pl.y, tg.z - pl.z);
  let c = cost + HORIZON + 6 + Math.min(minD, dEnd) * 0.25 + dEnd * 0.35;
  if (pl.y < 14) c += (14 - pl.y) * 1.5;
  // speed is future progress
  c -= Math.hypot(pl.vx, pl.vz) * 0.12;
  return c;
}

const PLANS_AIR = [
  { attach: false, hold: null },
  { attach: true, hold: 0.5 }, { attach: true, hold: 0.85 }, { attach: true, hold: 1.2 }, { attach: true, hold: 1.6 }, { attach: true, hold: 2.1 },
  { attach: false, hold: null, dive: 0.5 },
  { attach: false, hold: null, dash: true },
];
const PLANS_SWING = [{ hold: 0 }, { hold: 0.2 }, { hold: 0.45 }, { hold: 0.8 }, { hold: 1.2 }];

export function botStep(b, sim, input, dt, magnetFn) {
  const S = sim.S, pl = S.pl;
  let tg = b.target;
  if (S.run && !S.run.done) tg = sim.runs[S.run.idx].rings[S.run.next];
  input.dash = false; input.zip = false; input.dive = false;
  if (!tg) { input.mx = 0; input.my = 0; input.swing = false; return; }
  const mf = magnetFn || b.magnet || (() => {});
  // progress watchdog: no progress for 4 s -> detour away from the wall for 2 s, then try again
  const dd = Math.hypot(tg.x - pl.x, tg.y - pl.y, tg.z - pl.z);
  if (dd < b.lastD - 1) { b.lastD = dd; b.stuckT = 0; } else b.stuckT += dt;
  if (b.stuckT > 6 && !b.escape) {
    const hx = tg.x - pl.x, hz = tg.z - pl.z, hl = Math.hypot(hx, hz) || 1;
    // sideways-and-back, alternating sides each time
    b.escSide = -(b.escSide || 1);
    b.escape = { x: pl.x - (hx / hl) * 40 + (-hz / hl) * 40 * b.escSide, y: pl.y + 25, z: pl.z - (hz / hl) * 40 + (hx / hl) * 40 * b.escSide, until: b.t + 2.2 };
    b.stuckT = 0; b.lastD = 1e9; b.plan = null;
  }
  if (b.escape) { if (b.t > b.escape.until) { b.escape = null; b.plan = null; } else tg = b.escape; }
  b.t += dt; b.modeT += dt; b.replanT -= dt; b.pressCool -= dt; b.zipCool -= dt;
  if (pl.mode !== b.lastMode) { b.lastMode = pl.mode; b.modeT = 0; b.replanT = 0; }
  const key = S.run ? S.run.next : b.target;
  if (b.ring !== key) { b.ring = key; b.replanT = 0; b.plan = null; b.lastD = 1e9; b.stuckT = 0; b.escape = null; }
  const want = Math.atan2(-(tg.x - pl.x), -(tg.z - pl.z));
  if (b.yaw === null) b.yaw = want;
  b.yaw += wrap(want - b.yaw) * Math.min(1, dt * 6);
  steer(pl, tg, b.yaw, input);
  const dy = tg.y - pl.y, hd = Math.hypot(tg.x - pl.x, tg.z - pl.z);
  let swing = b.swing;
  switch (pl.mode) {
    case MODE.GROUND:
      swing = b.modeT > 0.1 && !b.swing;
      break;
    case MODE.WALL:
      swing = b.modeT > (pl.wallUp ? 0.55 : 0.3) && !b.swing;
      break;
    case MODE.ZIP:
      swing = false;
      break;
    case MODE.AIR:
    case MODE.SWING: {
      if (b.replanT <= 0 || !b.plan) {
        b.replanT = REPLAN;
        const plans = pl.mode === MODE.SWING ? PLANS_SWING : PLANS_AIR;
        let best = null, bc = 1e9;
        for (const p of plans) {
          if (p.attach && pl.aim < 0) continue;
          if (p.dash && pl.dash < 1) continue;
          const plan = pl.mode === MODE.SWING ? { attach: false, hold: p.hold } : p;
          const c = rollout(sim, plan, tg, mf);
          if (c < bc) { bc = c; best = p; }
        }
        b.plan = best ? { ...best, start: b.t } : null;
      }
      const p = b.plan;
      if (pl.mode === MODE.SWING) {
        const left = p && p.hold !== undefined && p.hold !== null ? p.hold - (b.t - p.start) : 1;
        swing = left > 0 && pl.lineT < 2.6;
      } else {
        swing = !!(p && p.attach) && pl.aim >= 0;
        if (p && p.dash && b.t - p.start < dt * 1.5) input.dash = true;
        if (p && p.dive) input.dive = b.t - p.start < p.dive;
        if (swing && !b.swing && b.pressCool > 0) swing = false;
        if (swing) { b.plan = { attach: false, hold: p.hold, start: b.t, fromAttach: true }; }
      }
      if (!swing && b.swing) b.pressCool = 0.1;
      // need height that swings cannot give: zip
      if (pl.mode === MODE.AIR && dy > 25 && hd < 120 && pl.zipAim >= 0 && b.zipCool <= 0 && sim.city.perches[pl.zipAim * 4 + 1] < tg.y + 12) { input.zip = true; b.zipCool = 1.5; }
      break;
    }
    default:
  }
  b.swing = swing;
  input.swing = swing;
}
