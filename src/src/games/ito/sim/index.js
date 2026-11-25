// ITO simulation: city + courier + delivery runs + free roam. Pure, deterministic, Node-testable.
import { buildCity, K, insideAny, clearance } from './city.js';
import { P, MODE, newPlayer, stepPlayer } from './physics.js';

export const STEP = 1 / 120;
export const RING_R = 10; // drawn radius of the ring (tube 0.75)
export const RING_HIT = 12; // capture radius: covers the whole drawn tube plus the body, so grazing the yellow counts
// per run: ring magnet radius (free flight bends toward the ring) and how hard anchor choice leans toward the next ring
// gate: crossing the ring's plane within this distance of its centre also counts (first-timer friendly)
export const ASSIST = [{ magnet: 62, guide: 1.4, gate: 16 }, { magnet: 48, guide: 1.0, gate: 14 }, { magnet: 44, guide: 0.9, gate: 14 }];
export const CRANE_R = 3.6;
export { MODE, P };

// Medal times (seconds), set from players, not the planner bot (see test.mjs personas):
// bronze = holding W and tapping swing in a plain rhythm with the camera on assist; silver = the same rhythm while
// keeping the camera on the next ring; gold = the planning bot's pace (an expert line with dashes).
export const MEDALS = [
  { gold: 24, silver: 65, bronze: 115 },
  { gold: 30, silver: 75, bronze: 130 },
  { gold: 42, silver: 100, bronze: 160 },
];

// Route language: [i, j, h] picks a point on the street grid (one of i, j may be fractional: mid-street),
// or { x, z, h } for an absolute point. Rings sit over streets, where the sky is open.
const ROUTES = [
  // east down the avenue, then a right turn south along the next big street
  { name: 'FIRST DROP', jp: '初便', start: [0.5, 1], rings: [[0.95, 1, 24], [1.4, 1, 22], [1.85, 1, 26], [2.3, 1, 24], [2.75, 1, 28], [3.2, 1, 26], [3.65, 1, 30], [4, 1.3, 28], [4, 1.7, 26], [4, 2.15, 24], [4, 2.6, 30]] },
  // south down a wide street, low along the walkway, then up the next street into the towers and out east
  { name: 'RUSH ORDER', jp: '急便', start: [2, 0.4], rings: [[2, 0.85, 30], [2, 1.3, 26], [2, 1.75, 24], [2.35, 2, 22], [2.75, 2, 22], [3.15, 2, 26], [3, 2.4, 30], [3, 2.8, 36], [3.4, 3, 40], [3.8, 3, 38], [4.25, 3, 34], [4.7, 3, 30], [5, 3.4, 28], [5, 3.85, 26]] },
  // along the rail viaduct, west through the tallest towers, down to the shrine in the park
  { name: 'LAST TRAIN', jp: '終電', start: [5, 0.2], rings: [[5, 0.6, 24], [5, 1.05, 26], [5, 1.5, 28], [4.7, 2, 32], [4.25, 2, 36], [3.75, 2, 40], [3, 2.4, 44], [3, 2.9, 42], [2.6, 3, 38], [2.1, 3, 34], [1.6, 3, 32], [1, 3.3, 30], [1, 3.75, 28], [1.35, 4, 24], { park: true, h: 18 }, { park: true, h: 22, dz: 36 }] },
];

function gridPoint(city, p) {
  if (p.park) return { x: city.park.cx, z: city.park.cz + (p.dz || 0) - 10, h: p.h };
  if (!Array.isArray(p)) return p;
  const [i, j, h] = p;
  const lerp = (arr, f) => { const a = Math.floor(f), t = f - a; return a >= arr.length - 1 ? arr[arr.length - 1] : arr[a] + (arr[a + 1] - arr[a]) * t; };
  return { x: lerp(city.sx, i), z: lerp(city.sz, j), h };
}

function buildRuns(city) {
  return ROUTES.map((r, idx) => {
    const rings = r.rings.map((p) => { const g = gridPoint(city, p); return { x: g.x, y: g.h, z: g.z }; });
    // nudge any ring that clips a structure (keeps the route honest if the seed changes)
    for (const q of rings) { const y0 = q.y; let k = 0; while (k++ < 20 && clearance(city, q.x, q.y, q.z, RING_R) < RING_R * 0.8) q.y += 3; q.nudged = q.y - y0; }
    const first = rings[0], second = rings[1];
    // start on a roof edge behind ring 1 on the course line, so "forward" already runs down the course
    let cx = second.x - first.x, cz = second.z - first.z;
    const cl = Math.hypot(cx, cz) || 1; cx /= cl; cz /= cl;
    const sp = { x: first.x - cx * 62, z: first.z - cz * 62 };
    let best = null, bd = 1e9;
    for (const b of city.boxes) {
      if (!(b.kind === K.TOWER || b.kind === K.PODIUM) || b.y1 < 18 || b.y1 > 70) continue;
      const qx = Math.max(b.x0 + 1.5, Math.min(b.x1 - 1.5, sp.x)), qz = Math.max(b.z0 + 1.5, Math.min(b.z1 - 1.5, sp.z));
      if (insideAny(city, qx, b.y1 + 1.2, qz)) continue;
      const d = Math.hypot(qx - sp.x, qz - sp.z) + Math.abs(b.y1 - first.y - 14) * 0.5;
      if (d < bd) { bd = d; best = { x: qx, y: b.y1 + P.R, z: qz, box: b.i }; }
    }
    // the first ring hangs at most 20 m under the start roof: the opening drop flows straight into it
    first.y = Math.max(first.y, best.y - 20);
    const yaw = Math.atan2(-(first.x - best.x), -(first.z - best.z));
    // camera pitch that frames ring 1 (and its beacon) at the start
    const pitch = Math.max(-0.55, Math.min(0.1, Math.atan2(first.y - (best.y + 2), Math.hypot(first.x - best.x, first.z - best.z)) - 0.05));
    // orientation of each ring: facing along the route
    for (let k = 0; k < rings.length; k++) {
      const a = k === 0 ? best : rings[k - 1], b = rings[Math.min(k + 1, rings.length - 1)];
      const q = rings[k];
      let dx = (k === rings.length - 1 ? q.x - a.x : b.x - a.x), dz = (k === rings.length - 1 ? q.z - a.z : b.z - a.z);
      const l = Math.hypot(dx, dz) || 1; q.fx = dx / l; q.fz = dz / l;
    }
    let len = 0, px = best.x, pz = best.z;
    for (const q of rings) { len += Math.hypot(q.x - px, q.z - pz); px = q.x; pz = q.z; }
    return { idx, name: r.name, jp: r.jp, rings, start: { ...best, yaw, pitch }, length: len, medals: MEDALS[idx], assist: ASSIST[idx] };
  });
}

// 30 paper cranes in interesting places, chosen deterministically from the city
function buildCranes(city) {
  const out = [];
  const ok = (x, y, z) => !insideAny(city, x, y, z, 1.2) && y > 2 && !out.some((c) => Math.hypot(c.x - x, c.y - y, c.z - z) < 30);
  const push = (x, y, z, where) => { if (out.length < 30 && ok(x, y, z)) { out.push({ x, y, z, where }); return true; } return false; };
  const tops = city.boxes.filter((b) => b.kind === K.CROWN || b.kind === K.TOWER).sort((a, b) => b.y1 - a.y1);
  // 1) the highest roofs in the city
  let n = 0;
  for (const b of tops) { if (n >= 7) break; if (push((b.x0 + b.x1) / 2, b.y1 + 1.6, (b.z0 + b.z1) / 2, 'summit')) n++; }
  // 2) mast tips
  n = 0;
  for (const m of city.masts) { if (n >= 3) break; if (push(m.x, m.y1 + 2.2, m.z, 'mast')) n++; }
  // 3) setback ledges (a roof with a taller tier on it)
  n = 0;
  for (const b of city.boxes) {
    if (n >= 5 || b.kind !== K.TOWER || b.y0 !== 0) continue;
    const up = city.boxes.find((c) => c.bid === b.bid && c.kind === K.TOWER && Math.abs(c.y0 - b.y1) < 0.01);
    if (!up || b.y1 < 50) continue;
    if (push(b.x0 + 1.6, b.y1 + 1.4, b.z0 + 1.6, 'ledge')) n++;
  }
  // 4) the walkway, the viaduct and the shrine
  const w = city.walk, v = city.viaduct, pk = city.park;
  push(w.x0 + (w.x1 - w.x0) * 0.2, w.y1 + 1.4, w.z, 'walkway');
  push(w.x0 + (w.x1 - w.x0) * 0.62, w.y0 - 2.5, w.z, 'under the walkway');
  push(w.x0 + (w.x1 - w.x0) * 0.9, w.y1 + 1.4, w.z, 'walkway');
  push(v.x, 15.4, -120, 'tracks'); push(v.x, 15.4, 160, 'tracks'); push(v.x, 6, 40, 'under the tracks');
  push(pk.torii.x, 11.8, pk.torii.z, 'torii'); push(pk.hall.x, 8.6, pk.hall.z, 'shrine roof');
  // 5) billboard tops
  n = 0;
  for (const b of city.boxes) { if (n >= 2 || b.kind !== K.BOARD) continue; if (push((b.x0 + b.x1) / 2, b.y1 + 1.3, (b.z0 + b.z1) / 2, 'billboard')) n++; }
  // 6) floating over intersections, low and high, until there are 30
  const rnd = city.rnd;
  let guard = 0;
  while (out.length < 30 && guard++ < 400) {
    const i = Math.floor(rnd() * 7), j = Math.floor(rnd() * 7);
    push(city.sx[i] + (rnd() - 0.5) * 8, 14 + rnd() * 70, city.sz[j] + (rnd() - 0.5) * 8, 'sky');
  }
  return out;
}

export function createSim(opts = {}) {
  const city = buildCity(opts.seed ?? 1729);
  const runs = buildRuns(city);
  const cranes = buildCranes(city);
  const S = {
    t: 0, pl: newPlayer(), mode: 'free', run: null, events: [], paused: false,
    style: { chain: 0, best: 0, score: 0, airT: 0, lastAct: 0 },
    stats: { top: 0, maxChain: 0, swings: 0, perfects: 0, dist: 0 },
    cranes: new Uint8Array(cranes.length), craneCount: 0,
    ghostRec: [],
  };
  const input = { mx: 0, my: 0, swing: false, dash: false, zip: false, dive: false, yaw: 0, pitch: 0 };

  // yaw here is a camera yaw (forward = (-sin, -cos)); the courier faces the same way
  function placeAt(x, y, z, yaw, box) {
    const pl = newPlayer();
    pl.x = pl.px = x; pl.y = pl.py = y; pl.z = pl.pz = z;
    pl.yaw = yaw + Math.PI;
    if (box >= 0) { pl.mode = MODE.GROUND; pl.roof = box; } else pl.mode = MODE.AIR;
    S.pl = pl;
    input.yaw = yaw;
  }
  function resetStats() {
    S.style.chain = 0; S.style.best = 0; S.style.score = 0; S.style.airT = 0;
    S.stats.top = 0; S.stats.maxChain = 0; S.stats.swings = 0; S.stats.perfects = 0; S.stats.dist = 0;
    S.ghostRec = [];
  }
  function startRun(n) {
    const r = runs[n];
    resetStats();
    S.mode = 'run';
    S.run = { idx: n, t: 0, started: false, next: 0, done: false, finishT: 0, splits: [] };
    placeAt(r.start.x, r.start.y, r.start.z, r.start.yaw, r.start.box);
    S.events.push({ type: 'runstart', idx: n });
  }
  function startFree(at) {
    resetStats();
    S.mode = 'free'; S.run = null;
    const r = runs[0];
    const p = at || r.start;
    placeAt(p.x, p.y, p.z, p.yaw || 0, p.box ?? -1);
  }
  function chainBump(k, what) {
    const st = S.style;
    st.chain += k;
    st.score += 10 * k * Math.max(1, st.chain);
    st.lastAct = S.t;
    if (st.chain > st.best) st.best = st.chain;
    if (st.chain > S.stats.maxChain) S.stats.maxChain = st.chain;
    S.events.push({ type: 'style', chain: st.chain, what, k });
  }
  function chainBreak() {
    if (S.style.chain >= 3) S.events.push({ type: 'chainend', chain: S.style.chain });
    S.style.chain = 0;
  }

  const ev = [];
  const guide = { x: 0, y: 0, z: 0, k: 0, mag: 0, ax: 0, az: 0 };
  function step() {
    const dt = STEP;
    S.t += dt;
    const pl = S.pl;
    const run = S.run;
    if (run && !run.done && !run.started) {
      if (input.swing || input.dash || input.zip || Math.abs(input.mx) + Math.abs(input.my) > 0.1) run.started = true;
    }
    const diveBefore = pl.diveT;
    // course guide for anchor choice
    if (run && !run.done) {
      const R = runs[run.idx].rings, q = R[run.next], nx = R[run.next + 1];
      guide.x = q.x; guide.y = q.y; guide.z = q.z; guide.k = runs[run.idx].assist.guide; guide.mag = runs[run.idx].assist.magnet;
      // anticipate the turn: close to a ring, lines are picked toward a point past it, on the way to the next one
      guide.ax = q.x; guide.az = q.z;
      const d = Math.hypot(q.x - pl.x, q.z - pl.z);
      if (nx && d < 40) { const lx = nx.x - q.x, lz = nx.z - q.z, ll = Math.hypot(lx, lz) || 1, w = (1 - d / 40) * 28; guide.ax += (lx / ll) * w; guide.az += (lz / ll) * w; }
      input.guide = guide;
    }
    else input.guide = null;
    ev.length = 0;
    stepPlayer(city, pl, input, dt, ev, S.t);
    // physics events -> style + forward
    for (let k = 0; k < ev.length; k++) {
      const e = ev[k];
      switch (e.type) {
        case 'release': if (e.rising) chainBump(e.perfect ? 2 : 1, e.perfect ? 'perfect' : 'swing'); if (e.perfect) S.stats.perfects++; break;
        case 'attach': S.stats.swings++; if (diveBefore > 0.5 && Math.hypot(pl.vx, pl.vy, pl.vz) > 30) chainBump(2, 'dive'); break;
        case 'wall': chainBump(1, 'wallrun'); break;
        case 'kick': chainBump(1, 'kick'); break;
        case 'close': chainBump(1, 'close'); break;
        case 'perch': chainBump(1, 'zip'); break;
        case 'bounce': chainBreak(); break;
        default:
      }
      S.events.push(e);
    }
    if (pl.mode === MODE.GROUND && pl.groundT > 0.6 && S.style.chain) chainBreak();
    const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
    if (sp > S.stats.top) S.stats.top = sp;
    S.stats.dist += sp * dt;
    // run logic
    if (run && !run.done) {
      if (run.started) run.t += dt;
      const r = runs[run.idx], q = r.rings[run.next];
      // swept test (segment from previous to current position against the ring sphere)
      if (segDist(pl.px, pl.py, pl.pz, pl.x, pl.y, pl.z, q.x, q.y, q.z) < RING_HIT || gateCross(pl, q, r.assist.gate)) {
        run.splits.push(run.t);
        run.next++;
        const last = run.next >= r.rings.length;
        S.events.push({ type: 'ring', i: run.next - 1, last, t: run.t });
        if (last) {
          run.done = true; run.finishT = run.t;
          S.events.push({ type: 'finish', idx: run.idx, t: run.t, top: S.stats.top, chain: S.stats.maxChain });
        }
      }
      // ghost: 10 Hz
      if (run.started && Math.round(run.t * 120) % 12 === 0) S.ghostRec.push(Math.round(pl.x * 10), Math.round(pl.y * 10), Math.round(pl.z * 10), Math.round(pl.yaw * 100), pl.mode);
    }
    // cranes (free roam)
    if (S.mode === 'free') {
      for (let k = 0; k < cranes.length; k++) {
        if (S.cranes[k]) continue;
        const c = cranes[k];
        if (Math.abs(c.x - pl.x) > 6 || Math.abs(c.z - pl.z) > 6) continue;
        if (segDist(pl.px, pl.py, pl.pz, pl.x, pl.y, pl.z, c.x, c.y, c.z) < CRANE_R) {
          S.cranes[k] = 1; S.craneCount++;
          chainBump(1, 'crane');
          S.events.push({ type: 'crane', i: k, count: S.craneCount, total: cranes.length });
        }
      }
    }
  }

  return { S, city, runs, cranes, input, step, startRun, startFree, placeAt };
}

// did this step cross the ring's plane (normal = its facing) within `R` of the centre?
export function gateCross(pl, q, R) {
  const a = (pl.px - q.x) * q.fx + (pl.pz - q.z) * q.fz, b = (pl.x - q.x) * q.fx + (pl.z - q.z) * q.fz;
  if (!(a < 0 && b >= 0)) return false;
  const t = a / (a - b);
  const x = pl.px + (pl.x - pl.px) * t, y = pl.py + (pl.y - pl.py) * t, z = pl.pz + (pl.z - pl.pz) * t;
  return Math.hypot(x - q.x, y - q.y, z - q.z) < R;
}

export function segDist(ax, ay, az, bx, by, bz, px, py, pz) {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const l2 = dx * dx + dy * dy + dz * dz;
  let t = l2 > 1e-9 ? ((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = ax + dx * t - px, qy = ay + dy * t - py, qz = az + dz * t - pz;
  return Math.sqrt(qx * qx + qy * qy + qz * qz);
}
