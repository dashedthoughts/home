// ITO headless tests:  node src/games/ito/test.mjs   (from /home/user/home-site/src)
// 1) the pendulum conserves energy without pumping, 2) the auto-anchor never picks a swing that hits a wall or the street,
// 3) a scripted bot finishes all three delivery runs within gold x 1.5. Also prints swing-feel numbers.
import { createSim, STEP, MEDALS, MODE, P } from './sim/index.js';
import { assistCamera } from './sim/assist.js';
import { swingCore, chooseAnchor, attachRedirect, sphereHits, newPlayer, pivotFor } from './sim/physics.js';
import { insideAny, makeRng, HALF, roofBelow } from './sim/city.js';
import { createBot, botStep } from './sim/bot.js';

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++; };

// ---------- 1. energy ----------
{
  const pure = { ...P, REEL: 0, RESCUE: 0, CLEAR: -1e9, DRAG: 0 };
  let worst = 0;
  for (const [L, v0, ang] of [[30, 0, 1.2], [40, 25, 0.4], [55, 12, 0.9], [22, 34, 0.2]]) {
    const s = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, ax: 0, ay: 200, az: 0, L };
    s.x = Math.sin(ang) * L; s.y = 200 - Math.cos(ang) * L; s.vz = v0; // off-plane start: a true spherical pendulum
    const E = (q) => 0.5 * (q.vx * q.vx + q.vy * q.vy + q.vz * q.vz) + P.G * q.y;
    const E0 = E(s);
    for (let k = 0; k < 120 * 20; k++) {
      swingCore(s, STEP, 0, 0, 0, false, pure);
      const rel = Math.abs(E(s) - E0) / Math.max(1, Math.abs(0.5 * v0 * v0 + P.G * L));
      if (rel > worst) worst = rel;
    }
  }
  check(worst < 0.01, `pendulum energy drift over 20 s, 4 cases: worst ${(worst * 100).toFixed(3)}% (limit 1%)`);
}

// ---------- 2. auto-anchor safety ----------
{
  const sim = createSim();
  const city = sim.city;
  const rnd = makeRng(99);
  let found = 0, bad = 0, tried = 0;
  const s = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, ax: 0, ay: 0, az: 0, L: 0 };
  const t0 = performance.now();
  while (tried < 10000) {
    const pl = newPlayer();
    pl.x = (rnd() * 2 - 1) * (HALF - 30); pl.z = (rnd() * 2 - 1) * (HALF - 30); pl.y = 4 + rnd() * 140;
    if (insideAny(city, pl.x, pl.y, pl.z, 2)) continue;
    const a = rnd() * Math.PI * 2, hs = rnd() * 45;
    pl.vx = Math.sin(a) * hs; pl.vz = Math.cos(a) * hs; pl.vy = -25 + rnd() * 40;
    const yaw = a + (rnd() - 0.5) * 1.6;
    tried++;
    const k = chooseAnchor(city, pl, -Math.sin(yaw), -Math.cos(yaw));
    if (k < 0) continue;
    found++;
    // verify with the full-rate integrator, held swing, no steering, real radius
    const pv = pivotFor(city.anchors, k, pl.x, pl.z, pl.aimDx, pl.aimDz, {});
    Object.assign(s, { x: pl.x, y: pl.y, z: pl.z, vx: pl.vx, vy: pl.vy, vz: pl.vz, ax: pv.x, ay: pv.y, az: pv.z, fl: roofBelow(city, pv.x, pv.z, pv.y - 1) });
    attachRedirect(s, pl.aimDx, pl.aimDz);
    for (let n = 0; n < 120 * 1.2; n++) {
      swingCore(s, STEP, 0, 0, 0, true, P);
      if (s.y < P.R + 0.2 || sphereHits(city, s.x, s.y, s.z, P.R)) { bad++; break; }
    }
  }
  const ms = (performance.now() - t0) / tried;
  check(bad === 0, `auto-anchor: ${tried} random situations, ${found} anchors chosen, ${bad} swings hit a wall or the street (${ms.toFixed(3)} ms per choice)`);
  // coverage where people actually swing: over streets, heading along them, 15-75 m up
  let sTried = 0, sFound = 0;
  while (sTried < 3000) {
    const pl = newPlayer();
    const ns = rnd() < 0.5;
    if (ns) { pl.x = city.sx[1 + Math.floor(rnd() * 5)] + (rnd() - 0.5) * 10; pl.z = (rnd() * 2 - 1) * 300; }
    else { pl.z = city.sz[1 + Math.floor(rnd() * 5)] + (rnd() - 0.5) * 10; pl.x = (rnd() * 2 - 1) * 300; }
    pl.y = 15 + rnd() * 60;
    if (insideAny(city, pl.x, pl.y, pl.z, 2)) continue;
    const a = (ns ? (rnd() < 0.5 ? 0 : Math.PI) : (rnd() < 0.5 ? Math.PI / 2 : -Math.PI / 2)) + (rnd() - 0.5) * 0.6, hs = 10 + rnd() * 30;
    pl.vx = Math.sin(a) * hs; pl.vz = Math.cos(a) * hs; pl.vy = -15 + rnd() * 20;
    sTried++;
    const yaw = Math.atan2(-pl.vx, -pl.vz);
    if (chooseAnchor(city, pl, -Math.sin(yaw), -Math.cos(yaw)) >= 0) sFound++;
  }
  check(sFound > sTried * 0.85, `auto-anchor coverage over streets, heading along them, 15-75 m up: ${((100 * sFound) / sTried).toFixed(1)}% of ${sTried} (limit 85%)`);
}

// ---------- 2b. swing rhythm (how it feels): a human-style chain down the long avenue ----------
{
  const sim = createSim();
  const c = sim.city;
  sim.placeAt(c.sx[0] + 30, 40, c.sz[1], -Math.PI / 2, -1);
  sim.S.pl.vx = 20;
  const inp = sim.input;
  inp.yaw = -Math.PI / 2; inp.my = 1;
  let t = 0, attachT = 0, arcs = [], sp = [], low = 1e9, high = 0, lastRelease = 0;
  while (t < 14 && sim.S.pl.x < c.sx[6] - 40) {
    const pl = sim.S.pl;
    if (pl.mode === MODE.SWING) { inp.swing = !(pl.vy > 0.5 * Math.hypot(pl.vx, pl.vy, pl.vz) && pl.lineT > 0.5); }
    else inp.swing = pl.mode === MODE.AIR ? pl.vy < -2 && t - lastRelease > 0.35 : !inp.swing;
    inp.mx = Math.max(-1, Math.min(1, (c.sz[1] - pl.z) * 0.1 - pl.vz * 0.05));
    sim.step(); t += STEP;
    for (const e of sim.S.events) { if (e.type === 'attach') attachT = t; if (e.type === 'release') { arcs.push(t - attachT); lastRelease = t; } }
    sim.S.events.length = 0;
    if (t > 2) { sp.push(Math.hypot(pl.vx, pl.vy, pl.vz)); low = Math.min(low, pl.y); high = Math.max(high, pl.y); }
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  sp.sort((a, b) => a - b);
  console.log(`      rhythm: ${arcs.length} swings, arc ${avg(arcs).toFixed(2)} s avg (${arcs.map((a) => a.toFixed(1)).join(' ')}), speed p10/p50/p90 ${sp[sp.length * 0.1 | 0].toFixed(0)}/${sp[sp.length >> 1].toFixed(0)}/${sp[sp.length * 0.9 | 0].toFixed(0)} m/s, height ${low.toFixed(0)}-${high.toFixed(0)} m, ${(sim.S.pl.x - c.sx[0] - 30).toFixed(0)} m in ${t.toFixed(1)} s`);
  const a = avg(arcs), m = sp[sp.length >> 1];
  check(a > 1.3 && a < 2.6 && m > 22 && m < 45, `swing rhythm in the target window (arc 1.3-2.6 s, cruise 22-45 m/s)`);
}

// ---------- 3. players (personas) and the bot against the medal times ----------
// A first-timer: hold W, tap swing in a plain rhythm (about 1 s on, 0.35 s off, jittered), camera on assist (the engine's
// own assist function). "aimed" keeps the camera on the next ring instead. "hold" just holds W and swing.
function mulberry(s) { return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const wrapA = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function persona(run, kind, seed, limit = 180) {
  const sim = createSim(); const { S, input } = sim; sim.startRun(run);
  const rnd = mulberry(seed), rings = sim.runs[run].rings;
  const cam = { yaw: input.yaw, pitch: sim.runs[run].start.pitch };
  let t = 0, ph = 0, held = false, holdLen = 1.0, relLen = 0.35, maxLine = 0;
  while (t < limit && !S.run.done) {
    const pl = S.pl;
    let swing;
    if (kind === 'hold') swing = true;
    else {
      ph += STEP;
      if (held && ph > holdLen) { held = false; ph = 0; relLen = 0.35 * (0.6 + rnd() * 0.8); }
      else if (!held && ph > relLen) { held = true; ph = 0; holdLen = 1.0 * (0.6 + rnd() * 0.8); }
      swing = held;
    }
    const q = rings[S.run.next];
    if (kind === 'aimed') cam.yaw += wrapA(Math.atan2(-(q.x - pl.x), -(q.z - pl.z)) - cam.yaw) * Math.min(1, STEP * 3);
    Object.assign(input, { mx: 0, my: 1, swing, dash: false, zip: false, dive: false, yaw: cam.yaw, pitch: cam.pitch + 0.12, zipCone: 0.9 });
    sim.step(); S.events.length = 0;
    const p2 = S.pl;
    if (p2.mode === MODE.SWING) maxLine = Math.max(maxLine, p2.lineT);
    if (kind !== 'aimed' && !S.run.done && (Math.hypot(p2.vx, p2.vz) > 6 || p2.mode !== MODE.GROUND)) assistCamera(cam, p2, STEP, rings[S.run.next]);
    t += STEP;
  }
  return { done: S.run.done, t: S.run.done ? S.run.finishT : Infinity, rings: S.run.next, maxLine };
}
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const fmtT = (a) => a.map((r) => (r.done ? r.t.toFixed(0) : 'DNF')).join(' ');
{
  const plain = SEEDS.map((s) => persona(0, 'tap', s));
  const fin = plain.filter((r) => r.done).length, bronze = plain.filter((r) => r.t <= MEDALS[0].bronze).length;
  console.log(`      run 1, W + plain tap rhythm, no aiming: ${fmtT(plain)} s`);
  check(fin >= 7, `first-timer (W + tap rhythm, no aiming) finishes run 1 on ${fin}/8 seeds (need 7)`);
  check(bronze >= 5, `first-timer earns bronze (<= ${MEDALS[0].bronze} s) on run 1 on ${bronze}/8 seeds (need most)`);
  const aimed = SEEDS.map((s) => persona(0, 'aimed', s));
  const silver = aimed.filter((r) => r.t <= MEDALS[0].silver).length;
  console.log(`      run 1, tap rhythm with the camera on the ring: ${fmtT(aimed)} s`);
  check(silver >= 5, `aimed-rhythm player earns silver (<= ${MEDALS[0].silver} s) on run 1 on ${silver}/8 seeds`);
  for (const n of [1, 2]) {
    const r = SEEDS.map((s) => persona(n, 'aimed', s));
    const f = r.filter((x) => x.done).length;
    console.log(`      run ${n + 1}, aimed rhythm: ${fmtT(r)} s`);
    check(f >= 5, `aimed-rhythm player finishes run ${n + 1} on ${f}/8 seeds (need 5); bronze ${MEDALS[n].bronze} s, silver ${MEDALS[n].silver} s`);
  }
  const hold = persona(0, 'hold', 1, 60);
  check(hold.maxLine < 3.3, `holding swing never dangles: longest time on one line ${hold.maxLine.toFixed(2)} s, ${hold.rings} rings in 60 s`);
}
{
  for (let n = 0; n < 3; n++) {
    const times = [];
    for (let j = 0; j < 3; j++) {
      const sim = createSim(); const bot = createBot();
      sim.startRun(n);
      sim.S.pl.x += (j - 1) * 0.4; sim.S.pl.z += (j - 1) * 0.3;
      let t = 0;
      while (!sim.S.run.done && t < 300) { botStep(bot, sim, sim.input, STEP); sim.step(); sim.S.events.length = 0; t += STEP; }
      times.push(sim.S.run.done ? sim.S.run.t : Infinity);
    }
    const med = [...times].sort((a, b) => a - b)[1];
    const r = createSim().runs[n];
    console.log(`      run ${n + 1} ${r.name}: ${r.rings.length} rings, ${r.length.toFixed(0)} m; bot ${times.map((t) => t.toFixed(1)).join(' / ')} s`);
    check(med <= MEDALS[n].gold, `planning bot earns gold on run ${n + 1} (median ${med.toFixed(1)} <= ${MEDALS[n].gold} s)`);
  }
}

// ---------- 4. determinism ----------
{
  const runOnce = () => { const sim = createSim(); const bot = createBot(); sim.startRun(1); for (let k = 0; k < 120 * 12; k++) { botStep(bot, sim, sim.input, STEP); sim.step(); sim.S.events.length = 0; } return [sim.S.pl.x, sim.S.pl.y, sim.S.pl.z].map((v) => v.toFixed(6)).join(','); };
  const a = runOnce(), b = runOnce();
  check(a === b, `simulation is deterministic (${a})`);
}

console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL ITO CHECKS PASSED');
process.exit(failed ? 1 : 0);
