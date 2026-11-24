// Headless REDLINE simulation checks. Run: node test/sim.test.mjs
import assert from 'node:assert/strict';
import { createSim, LANES, RAIL, MAX, START_S, FINALE_S } from '../src/game/sim.js';
import * as C1 from '../src/game/track/c1.js';
import { readFileSync } from 'node:fs';
const c1json = JSON.parse(readFileSync(new URL('../src/game/track/c1.json', import.meta.url)));

function run({ seconds, bot, seed = 1, config = {}, mode = 'play' }) {
  const ev = {};
  let over = null;
  const sim = createSim({ mode, seed, config, onEvent: (e) => {
    ev[e.type] = (ev[e.type] || 0) + 1;
    if (e.type === 'over') over = e;
    if (process.env.DEBUG && e.type === 'hit') {
      const S = sim.S;
      console.log(`  HIT t=${S.time.toFixed(1)} x=${S.x.toFixed(2)} v=${S.speed.toFixed(0)}`, S.cars.filter((c) => Math.abs(c.z - S.z) < 40).map((c) => `[L${c.lane}${c.target !== c.lane ? '>' + c.target : ''} x${c.x.toFixed(1)} dz${(c.z - S.z).toFixed(1)} v${c.speed.toFixed(0)}${c.hit ? ' HIT' : ''}]`).join(' '));
    }
  } });
  const dt = 1 / 60;
  let t = 0, maxAbsX = 0, kerb = 0;
  for (; t < seconds && !(over && sim.S.overT > 1); t += dt) {
    bot(sim.input, sim.S, sim);
    sim.step(dt);
    maxAbsX = Math.max(maxAbsX, Math.abs(sim.S.x));
    if (sim.S.onKerb && sim.S.count <= 0) kerb += dt;
  }
  return { ev, over, t, S: sim.S, maxAbsX, kerb };
}
const fmt = (r) => `${JSON.stringify(r.ev)} t=${r.t.toFixed(0)}s score=${Math.round(r.S.score)} top=${(r.S.topSpeed * 3.6).toFixed(0)}kmh kerb=${r.kerb.toFixed(1)}s`;

// A decent human-ish driver: looks ~2s ahead, commits to lane changes, won't cut across a car beside it.
function driver({ heatCap = 70, look = 150 } = {}) {
  let target = 0, think = 0;
  const danger = (S, lx) => {
    let d = 0;
    for (const c of S.cars) {
      const dz = c.z - S.z;
      if (dz > (c.kind === 'hauler' ? -11 : -7) && dz < look && Math.abs(c.x - lx) < 2.6) d += (look - dz) * 2;
      const between = (c.x - S.x) * (c.x - lx) <= 0 || Math.abs(c.x - lx) < 2.6;
      if (dz > (c.kind === 'hauler' ? -11 : -7) && dz < 12 && between && Math.abs(lx - S.x) > 0.5) d += 1000; // car alongside: don't swerve into it
    }
    return d;
  };
  return (inp, S, sim) => {
    think -= 1 / 60;
    const settled = Math.abs(target - S.x) < 0.6;
    if (think <= 0 && (settled || danger(S, target) > 150)) {
      think = 0.15;
      let best = target, bs = -1e9;
      for (const lx of LANES) {
        let sc = -Math.abs(lx - S.x) * 0.4 - danger(S, lx);
        for (const s of S.shardList) { const dz = s.z - S.z; if (!s.taken && dz > 0 && dz < 60 && Math.abs(s.x - lx) < 1.6) sc += (60 - dz) * 0.1; }
        if (sc > bs) { bs = sc; best = lx; }
      }
      target = best;
    }
    let d = target - S.x - S.vx * 0.3;
    if (S.glitch > 0) d = -d;
    inp.axis = Math.max(-1, Math.min(1, d * 0.8));
    inp.brake = S.cars.some((c) => { const dz = c.z - S.z; return dz > 0 && dz < 12 + (S.speed - c.speed) * 0.9 && Math.abs(c.x - S.x) < 2.3 && S.speed > c.speed + 3; });
    inp.boost = !inp.brake && S.heat < heatCap && Math.abs(sim.curveAt(S.z + 40)) < 0.6;
  };
}

// 1) countdown: nothing moves for ~3.6s, then GO
const cd = run({ seconds: 3.4, bot: (i) => { i.boost = true; } });
assert.equal(cd.S.z, 0, 'car holds during countdown');
assert.equal(cd.ev.count, 3);

// 2) skilled driver survives a long time, scores, decrypts, near-misses, slipstreams
const runs = [1, 2, 3, 4, 5].map((seed) => run({ seconds: 240, bot: driver(), seed, config: { police: false } }));
runs.forEach((r, i) => console.log(`skilled#${i + 1}:`, fmt(r)));
const good = runs.reduce((a, r) => (r.t > a.t ? r : a));
const avgT = runs.reduce((a, r) => a + r.t, 0) / runs.length;
const totalShards = runs.reduce((a, r) => a + (r.ev.shard || 0), 0);
console.log(`skilled avg run ${avgT.toFixed(0)}s, ${totalShards} shards over ${runs.length} runs`);
assert.ok(totalShards > 60 && runs.some((r) => (r.ev.casefile || 0) >= 4), 'collects shards and decrypts files');
assert.ok(good.S.topSpeed * 3.6 > 280, 'overclock pushes past 280 km/h');
assert.ok(avgT > 40, 'a careful driver averages a proper arcade run (40s+) on STREET');
assert.ok(runs.every((r) => r.maxAbsX <= RAIL + 1e-9), 'guardrail holds');

// 3) no-steer, full-overclock: curves throw you into the rail; overheating glitches you
const lazy = run({ seconds: 120, bot: (i) => { i.boost = true; }, seed: 5, config: { race: false, police: false } });
console.log('lazy     :', fmt(lazy));
assert.ok(lazy.ev.glitch >= 1, 'overheating triggers a glitch');
assert.ok(lazy.maxAbsX > 2.5, 'curves push an unsteered car off its line');
assert.ok(lazy.ev.hit >= 1, 'an unsteered car eventually hits traffic');

// 4) every difficulty ends when lives run out, exactly once
for (const difficulty of ['chill', 'street', 'redline']) {
  const r = run({ seconds: 900, bot: (i, S) => { i.axis = (0 - S.x) * 0.5; i.boost = true; }, seed: 11, config: { difficulty } });
  console.log(`${difficulty.padEnd(9)}:`, fmt(r));
  assert.ok(r.over && r.ev.over === 1 && r.S.lives === 0, `${difficulty}: game over once`);
}

// 5) rain lowers grip: same driver, more kerb time or fewer files is expected — just check it runs and grips less
const wet = run({ seconds: 120, bot: driver(), seed: 3, config: { weather: 'rain' } });
console.log('rain     :', fmt(wet));

// 6) vehicles differ: the bike out-accelerates the car over the first 3s after GO
const launch = (car) => run({ seconds: 3.6 + 3, bot: (i) => { i.boost = false; }, config: { car } }).S.speed;
assert.ok(launch('bike') > launch('wedge'), 'bike launches harder than the car');

// 7) files: five shards each
for (const r of [...runs, lazy, wet]) assert.equal(r.ev.casefile || 0, Math.min(10, Math.floor((r.ev.shard || 0) / 5)));

// 8) attract mode never ends and keeps moving
const demo = run({ seconds: 120, bot: () => {}, mode: 'attract', seed: 9 });
console.log('attract  :', fmt(demo));
assert.ok(!demo.over && demo.S.dist > 4000, 'autopilot drives indefinitely');
const clamp = (v) => Math.max(-1, Math.min(1, v));
// 9) the real road: C1 inner loop geometry, tunnels, districts, junctions, merge zones, laps
{
  const L = C1.LENGTH, p = { x: 0, y: 0 }, q = { x: 0, y: 0 };
  // the loop closes and wraps
  C1.posAt(0, p); C1.posAt(L - 0.001, q);
  assert.ok(Math.hypot(p.x - q.x, p.y - q.y) < 1, 'position is continuous across s = 0');
  C1.posAt(L - 10, p); C1.posAt(-10, q);
  assert.ok(Math.hypot(p.x - q.x, p.y - q.y) < 1e-6 && C1.wrap(L + 5) === 5 && C1.wrap(-5) === L - 5, 'wrap() maps any s onto the loop');
  let maxStep = 0, maxDc = 0;
  for (let s = 0; s <= L + 10; s += 5) { C1.posAt(s, p); C1.posAt(s + 5, q); maxStep = Math.max(maxStep, Math.hypot(p.x - q.x, p.y - q.y)); maxDc = Math.max(maxDc, Math.abs(C1.curveAt(s + 5) - C1.curveAt(s))); }
  assert.ok(maxStep < 8 && maxDc < 0.15, `no jumps anywhere on the loop (step ${maxStep.toFixed(2)} m, curve change ${maxDc.toFixed(3)} per 5 m)`);
  // heading: the inner loop runs counter-clockwise, so one lap turns -360 degrees
  let turn = 0, hTurn = 0;
  for (let s = 0; s < L; s += 1) turn += C1.realCurvAt(s);
  for (let s = 0; s < L; s += 10) { let d = C1.headingAt(s + 10) - C1.headingAt(s); d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI; hTurn += d; }
  const deg = (r) => (r * 180) / Math.PI;
  console.log(`C1: ${L} m, heading over a lap ${deg(hTurn).toFixed(1)} deg (curvature integral ${deg(turn).toFixed(1)} deg), max |curve| ${Math.max(...Array.from({ length: L / 10 }, (_, i) => Math.abs(C1.curveAt(i * 10)))).toFixed(2)}`);
  assert.ok(Math.abs(deg(hTurn) + 360) < 0.5 && Math.abs(deg(C1.TOTAL_TURN) + 360) < 0.5, 'heading integrates to -360 deg per lap');
  assert.ok(Math.abs(deg(turn) + 360) < 25, 'the curvature integrates to roughly -360 deg too');
  // tunnels are the real ones: every tagged sample is inside a span, spans are ordered, real total 2.76 km
  const raw = c1json.tunnel;
  for (let i = 0; i < raw.length; i++) if (raw[i] === '1') assert.ok(C1.tunnelAt(i * 10 + 1), `tunnel flag at s=${i * 10}`);
  let tunLen = 0;
  C1.tunnelSpans.forEach((t, k) => { tunLen += t.to - t.from; assert.ok(t.from < t.to && (k === 0 || t.from > C1.tunnelSpans[k - 1].to + 50), 'tunnel spans ordered and merged'); });
  assert.ok(tunLen >= raw.split('1').length - 1 && tunLen < 2900 && C1.tunnelSpans.some((t) => t.name === 'Chiyoda Tunnel' && t.to - t.from > 1000), 'tunnels match the data');
  assert.ok(!C1.tunnelAt(3500) && C1.tunnelAt(7000) && C1.tunnelAt(8500), 'Edobashi in the open, Chiyoda and Kasumigaseki tunnels underground');
  // districts cover the loop with no gaps and no overlaps
  let cover = 0;
  C1.DISTRICTS.forEach((d, k) => { const nx = C1.DISTRICTS[(k + 1) % C1.DISTRICTS.length]; assert.equal(d.to, nx.from, `${d.id} ends where ${nx.id} starts`); cover += C1.wrap(d.to - d.from); assert.ok(d.name && d.jp && d.style); });
  assert.equal(cover, L, 'districts cover the whole loop');
  for (const id of ['shiodome', 'ginza', 'kyobashi', 'nihonbashi', 'otemachi', 'takebashi', 'kitanomaru', 'miyakezaka', 'kasumigaseki', 'tanimachi', 'iikura', 'shibakoen', 'hamazakibashi']) assert.ok(C1.DISTRICTS.some((d) => d.id === id), id);
  assert.equal(C1.districtAt(0).id, 'shiodome'); assert.equal(C1.districtAt(3200).id, 'nihonbashi'); assert.equal(C1.districtAt(12000).id, 'shibakoen');
  // junctions: real names, in loop order, English filled in
  assert.deepEqual(C1.JCT_EVENTS.map((e) => e.name), ['Edobashi JCT', 'Takebashi JCT', 'Miyakezaka JCT', 'Tanimachi JCT', 'Ichinohashi JCT', 'Hamazakibashi JCT']);
  assert.ok(C1.JUNCTIONS.every((j) => j.name && j.jp && (j.kind === 'jct' || j.kind === 'exit')), 'every junction is named');
  assert.ok(C1.JUNCTIONS.some((j) => j.jp === '霞が関' && j.name === 'Kasumigaseki'));
  // landmarks: the palace is inside the loop; Tokyo Tower stands ~400 m off the road at Shibakoen
  const pts = []; for (let s = 0; s < L; s += 10) { C1.posAt(s, p); pts.push([p.x, p.y]); }
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const lm = (id) => C1.LANDMARKS.find((l) => l.id === id);
  assert.ok(inside(lm('imperial-palace').x, lm('imperial-palace').y), 'Imperial Palace inside the loop');
  // the real C1 runs along the Furukawa, south of Shiba Park, so Tokyo Tower is inside the loop; Roppongi Hills and the Budokan are not
  assert.ok(inside(lm('tokyo-tower').x, lm('tokyo-tower').y) && !inside(lm('roppongi-hills').x, lm('roppongi-hills').y) && !inside(lm('budokan').x, lm('budokan').y), 'landmarks on the right side of the loop');
  assert.ok(C1.distanceTo(11550, lm('tokyo-tower')) < 600 && Math.abs(C1.bearingTo(11550, lm('tokyo-tower'))) > 1, 'Tokyo Tower beside the road at Shibakoen');
  // the loop runs counter-clockwise, so what is inside it is on the driver's left (negative bearing)
  assert.ok(Math.abs(C1.bearingTo(7000, lm('imperial-palace')) + Math.PI / 2) < 0.2, 'the palace is on the left in the Chiyoda tunnel');
  assert.ok(C1.bearingTo(11550, lm('tokyo-tower')) < -1.2, 'Tokyo Tower is off the left shoulder at Shibakoen');

  // the sim: wraps, counts laps, calls the real JCTs in order, and merge zones pay double
  const names = [], ev = {};
  const sim = createSim({ mode: 'play', seed: 8, config: { police: false, race: false, zen: true }, onEvent: (e) => { ev[e.type] = (ev[e.type] || 0) + 1; if (e.type === 'junction') names.push(e.name); } });
  assert.equal(sim.S.s, START_S, 'the run starts just past Shiodome');
  assert.equal(sim.S.district.id, 'shiodome');
  for (let t = 0; t < 4; t += 1 / 60) sim.step(1 / 60);
  let nmMerge = 0, nmPlain = 0, carsMerge = 0, carsPlain = 0, fMerge = 0, fPlain = 0;
  while (sim.S.z < L + 600) {
    const S = sim.S;
    S.files = 0; S.shards = 0; S.heat = 0; // never reach the finale in this lap
    // lane-keeping on a hand-placed line, dodging traffic just by sitting in the gaps
    const near = S.cars.filter((c) => c.z - S.z > -6 && c.z - S.z < 60);
    const free = LANES.find((lx) => !near.some((c) => Math.abs(c.x - lx) < 2.4)) ?? 0;
    sim.input.axis = clamp((free - S.x - S.vx * 0.3) * 0.8);
    sim.input.boost = Math.abs(sim.curveAt(S.z + 40)) < 0.6;
    sim.step(1 / 60);
    if (S.merge) { carsMerge += S.cars.filter((c) => c.z > S.z && c.z < S.z + 300).length; fMerge++; } else { carsPlain += S.cars.filter((c) => c.z > S.z && c.z < S.z + 300).length; fPlain++; }
  }
  console.log(`one lap: ${names.join(' > ')}; laps ${sim.S.lap}, s ${sim.S.s.toFixed(0)}; cars within 300 m: merge ${(carsMerge / fMerge).toFixed(1)} vs ${(carsPlain / fPlain).toFixed(1)}`);
  assert.equal(sim.S.lap, 2, 'a lap counts');
  assert.ok(Math.abs(sim.S.s - C1.wrap(START_S + sim.S.z)) < 1e-6 && sim.S.s < 1000, 'position wraps around the loop');
  assert.deepEqual(names.slice(0, 6), C1.JCT_EVENTS.map((e) => e.name), 'the real JCTs are called in order');
  assert.ok(sim.S.sector >= 7, 'sectors run JCT to JCT');
  assert.ok(carsMerge / fMerge > (carsPlain / fPlain) * 1.1, 'merge zones carry more traffic');
  // near miss in a merge zone vs on an open stretch
  const nm = (s) => { let pts = 0; const m = createSim({ mode: 'play', seed: 2, config: { police: false, race: false, startS: s }, onEvent: (e) => { if (e.type === 'nearmiss') pts = e.pts; } });
    for (let t = 0; t < 4; t += 1 / 60) m.step(1 / 60);
    const S = m.S; S.cars.length = 0; S.speed = 50; S.x = 0;
    S.cars.push({ id: 900, z: S.z + 1, lane: 2, target: 2, x: 2.9, speed: 30, cruise: 30, kind: 'sedan', paint: 0, blink: 0, brake: false, prevDz: 1, hit: 0, think: 99 });
    for (let t = 0; t < 0.5 && !pts; t += 1 / 60) m.step(1 / 60);
    return [pts, S.merge]; };
  const [pm, inM] = nm(C1.JCT_EVENTS[0].s + 40), [pp, inP] = nm(4300);
  assert.ok(inM && !inP && pm === pp * 2 && pp > 0, `near misses pay double in a merge zone (${pm} vs ${pp})`);
}

// 9b) a bot drives a whole lap at racing speed without touching the rail, on every difficulty (the real hairpins included)
for (const difficulty of ['chill', 'street', 'redline']) for (const weather of ['clear', 'rain']) {
  const sim = createSim({ mode: 'play', seed: 5, config: { difficulty, weather, police: false, race: false, zen: true }, onEvent: (e) => { if (e.type === 'scrape' || e.type === 'slam') rail++; } });
  let rail = 0, maxX = 0, t = 0, vSum = 0, n = 0;
  const bot = driver({ heatCap: 70 });
  for (; sim.S.z < C1.LENGTH && t < 400; t += 1 / 60) {
    sim.S.files = 0; sim.S.shards = 0; sim.S.lives = sim.S.maxLives;
    bot(sim.input, sim.S, sim); sim.step(1 / 60);
    if (sim.S.count <= 0) { maxX = Math.max(maxX, Math.abs(sim.S.x)); vSum += sim.S.speed; n++; }
  }
  const avg = (vSum / n) * 3.6;
  console.log(`full lap ${difficulty.padEnd(7)} ${weather.padEnd(5)}: ${t.toFixed(0)} s, avg ${avg.toFixed(0)} km/h, top ${(sim.S.topSpeed * 3.6).toFixed(0)}, max |x| ${maxX.toFixed(2)}, rail contacts ${rail}`);
  assert.ok(sim.S.z >= C1.LENGTH, 'completes the lap');
  assert.ok(rail === 0 && maxX < RAIL, `${difficulty}/${weather}: never leaves the road`);
  assert.ok(avg > (weather === 'rain' ? 150 : 160), `${difficulty}/${weather}: at racing speed`);
}
// 9c) the road alone, flat out: an empty C1, overclocking whenever the engine is cool, never lifting for a bend
for (const [car, weather] of [['wedge', 'clear'], ['bike', 'clear'], ['wedge', 'rain']]) {
  const sim = createSim({ mode: 'play', seed: 1, config: { car, weather, police: false, race: false, zen: true }, onEvent: (e) => { if (e.type === 'scrape' || e.type === 'slam') rail++; } });
  let rail = 0, maxX = 0, t = 0, vSum = 0, n = 0;
  for (; sim.S.z < C1.LENGTH && t < 400; t += 1 / 60) {
    const S = sim.S; S.cars.length = 0; S.files = 0; S.shards = 0;
    sim.input.boost = S.heat < 80 && S.glitch <= 0;
    sim.input.axis = clamp((0 - S.x - S.vx * 0.3) * 0.8);
    sim.step(1 / 60);
    if (S.count <= 0) { maxX = Math.max(maxX, Math.abs(S.x)); vSum += S.speed; n++; }
  }
  const avg = (vSum / n) * 3.6;
  console.log(`empty lap flat out ${car.padEnd(5)} ${weather.padEnd(5)}: ${t.toFixed(0)} s, avg ${avg.toFixed(0)} km/h, max |x| ${maxX.toFixed(2)}, rail contacts ${rail}`);
  assert.ok(rail === 0 && maxX < 3.6, `${car}/${weather}: the real hairpins hold at full speed with a lane to spare`);
}

// 10) finale: the tenth file ends the run at the lookout (no crash, car stops, 'complete' fires once)
{
  const ev = [];
  const sim = createSim({ mode: 'play', seed: 21, onEvent: (e) => ev.push(e.type) });
  const bot = driver();
  let t = 0;
  for (; t < 300 && !sim.S.done; t += 1 / 60) {
    if (sim.S.count <= 0 && sim.S.files < 9) { sim.S.files = 9; sim.S.shards = 45; sim.S.lives = 99; }
    bot(sim.input, sim.S, sim);
    sim.step(1 / 60);
  }
  console.log('finale    :', `files=${sim.S.files} done=${sim.S.done} speed=${sim.S.speed.toFixed(1)} t=${t.toFixed(0)}s`);
  assert.ok(ev.includes('finale') && ev.filter((x) => x === 'complete').length === 1, 'finale then exactly one complete');
  assert.ok(sim.S.done && sim.S.speed <= 0.5 && !sim.S.over, 'car comes to rest at the lookout, not a game over');
}
// 10b) pacing: whoever drives, the tenth file opens on the first lap somewhere around FINALE_S (Tanimachi to Shibakoen)
{
  const at = [];
  for (const seed of [1, 2, 3]) {
    let fin = null;
    const sim = createSim({ mode: 'play', seed, config: { zen: true, police: false }, onEvent: (e) => { if (e.type === 'finale') fin = sim.S.s; } });
    const bot = driver();
    for (let t = 0; t < 400 && fin == null; t += 1 / 60) { bot(sim.input, sim.S, sim); sim.step(1 / 60); }
    at.push(fin);
  }
  console.log(`pacing: finale at s = ${at.map((s) => Math.round(s)).join(', ')} (${at.map((s) => C1.districtAt(s).name).join(', ')})`);
  assert.ok(at.every((s) => s != null && s > FINALE_S - 2200 && s < FINALE_S + 1800), 'the finale lands near Tokyo Tower on the first lap');
}
// 11) nothing ever overlaps: attract mode and the invulnerability window after a hit
for (const [mode, seed] of [['attract', 4], ['play', 6]]) {
  const sim = createSim({ mode, seed });
  let overlaps = 0, hitsSeen = 0;
  for (let t = 0; t < 150; t += 1 / 60) {
    if (mode === 'play') { sim.input.boost = true; sim.input.axis = (0 - sim.S.x) * 0.4; sim.S.lives = 99; }
    sim.step(1 / 60);
    if (sim.S.invuln > 0) hitsSeen++;
    const S = sim.S, w = S.car.bike ? 1.45 : 1.95;
    if (S.count <= 0) for (const c of S.cars) if (Math.abs(c.z - S.z) < 4.2 && Math.abs(c.x - S.x) < w - 0.05 && !(mode === 'play' && S.invuln > 1.5)) overlaps++;
  }
  console.log(`no-overlap ${mode}: overlapping frames=${overlaps}${mode === 'play' ? `, frames invulnerable=${hitsSeen}` : ''}`);
  assert.equal(overlaps, 0, `${mode}: vehicles never sit inside each other`);
}
// rival: never inside traffic or the player, stays in a race (mostly within 300 m), and positions actually change
{
  for (const seed of [1, 2, 3]) {
    const sim = createSim({ mode: 'play', seed, config: {}, onEvent: (e) => { if (e.type === 'overtake' || e.type === 'overtaken') swaps++; } });
    let swaps = 0, inside = 0, far = 0, frames = 0;
    const bot = driver();
    for (let t = 0; t < 240 && !sim.S.over; t += 1 / 60) {
      bot(sim.input, sim.S, sim); sim.step(1 / 60);
      if (sim.S.count > 0) continue;
      frames++;
      const R = sim.S.rival;
      if (sim.S.cars.some((c) => Math.abs(c.z - R.z) < 4.3 && Math.abs(c.x - R.x) < 1.9)) inside++;
      if (Math.abs(R.z - sim.S.z) < 4.3 && Math.abs(R.x - sim.S.x) < 1.9) inside++;
      if (Math.abs(R.z - sim.S.z) > 300) far++;
    }
    console.log(`rival seed ${seed}: swaps=${swaps} overlapFrames=${inside} farShare=${(far / frames).toFixed(2)}`);
    assert.equal(inside, 0, 'rival never overlaps');
    assert.ok(far / frames < 0.2, 'rival stays in the race');
  }
}


// police: sustained top speed builds heat; a cruiser that boxes you in busts you; outrunning them all works
{
  const ev = {};
  const sim = createSim({ mode: 'play', seed: 2, config: { race: false }, onEvent: (e) => { ev[e.type] = (ev[e.type] || 0) + 1; } });
  for (let t = 0; t < 4; t += 1 / 60) sim.step(1 / 60);
  for (let t = 0; t < 120 && !ev.police; t += 1 / 60) { sim.S.cars.length = 0; sim.S.heat = 0; sim.input.boost = true; sim.input.axis = -sim.S.x * 0.3; sim.step(1 / 60); }
  assert.ok(ev.police, 'flat-out driving draws the police');
  for (let t = 0; t < 30 && !ev.busted; t += 1 / 60) { sim.S.cars.length = 0; sim.input.boost = false; sim.input.brake = true; sim.step(1 / 60); }
  assert.ok(ev.busted, 'slowing down with police on you gets you busted');
  console.log('police: drawn, then busted');
}

// tunnels and rain: the road is wet outside and dry inside; wet braking is longer; flat out on water aquaplanes
{
  const mk = (weather) => { const sim = createSim({ mode: 'play', seed: 4, config: { weather, race: false, police: false } }); for (let t = 0; t < 4; t += 1 / 60) sim.step(1 / 60); return sim; };
  const stopDist = (weather, z0) => { const sim = mk(weather); const S = sim.S; S.z = z0; S.cars.length = 0; S.speed = 60; const a = S.z; sim.input.brake = true; while (S.speed > 0.1) { S.cars.length = 0; sim.step(1 / 60); } return S.z - a; };
  const zOpen = 3300 - START_S, zTun = 6700 - START_S; // Edobashi viaduct; the Chiyoda tunnel
  const dry = stopDist('clear', zOpen), wet = stopDist('rain', zOpen), tun = stopDist('rain', zTun);
  console.log(`braking from 216 km/h: dry ${dry.toFixed(0)} m, rain ${wet.toFixed(0)} m, rain inside a tunnel ${tun.toFixed(0)} m`);
  assert.ok(wet > dry * 1.15, 'rain lengthens braking');
  assert.ok(Math.abs(tun - dry) < 3, 'a tunnel is dry even when it rains');
  const sim = mk('rain'); sim.S.z = zOpen; sim.S.speed = MAX * 1.3; sim.S.cars.length = 0; sim.step(1 / 60);
  assert.ok(sim.S.wet && sim.S.aqua > 0.5, 'flat out in the rain aquaplanes');
  sim.S.z = zTun + 50; sim.S.cars.length = 0; sim.step(1 / 60);
  assert.ok(sim.S.inTunnel && !sim.S.wet && sim.S.aqua === 0, 'no aquaplaning in the tunnel');
  for (const t of C1.tunnelSpans) assert.ok(sim.tunnelAt(t.from + 5 - START_S) && !sim.tunnelAt(t.from - 15 - START_S), `the ${t.from} m tunnel is where the data says`);
  const tn = sim.tunnelNear(6000 - START_S);
  assert.ok(Math.abs(tn.z0 - (6060 - START_S)) < 1e-6 && tn.z1 - tn.z0 === 80, 'tunnelNear finds the next tunnel ahead');
}

// crashes: harder hits are more severe, a truck barely moves, zen costs no life, the last hit spins you out
{
  const hit = (cfg, kind, v, cv) => { let ev = null; const sim = createSim({ mode: 'play', seed: 2, config: { police: false, race: false, ...cfg }, onEvent: (e) => { if (e.type === 'hit') ev = e; } });
    for (let t = 0; t < 4; t += 1 / 60) sim.step(1 / 60);
    const S = sim.S; S.cars.length = 0; S.speed = v; S.x = 0; S.vx = 0;
    const c = { id: 999, z: S.z + 3, lane: 1, target: 1, x: 0, speed: cv, cruise: cv, kind, paint: 0, blink: 0, brake: false, prevDz: 3, hit: 0, think: 99 };
    S.cars.push(c); sim.step(1 / 60); return { ev, S, c, sim }; };
  const soft = hit({}, 'sedan', 40, 34), hard = hit({}, 'sedan', 90, 30), truck = hit({}, 'hauler', 90, 30), zen = hit({ zen: true }, 'sedan', 90, 30);
  assert.ok(soft.ev && hard.ev && hard.ev.sev > soft.ev.sev + 0.3, 'closing speed sets the severity');
  assert.ok(hard.S.speed < hard.c.speed, 'after a rear-end you are slower than the car you hit');
  assert.ok(truck.c.speed - 30 < (hard.c.speed - 30) * 0.5, 'a truck is shunted far less than a car');
  assert.ok(hard.S.crash && !hard.S.crash.final && hard.S.lives === hard.S.maxLives - 1, 'a hit costs one life and starts the crash animation');
  assert.equal(zen.S.lives, zen.S.maxLives, 'zen: no damage');
  const last = hit({}, 'sedan', 80, 30); last.S.lives = 1; last.S.invuln = 0; last.S.hitstop = 0; last.S.crash = null; last.S.cars.length = 0;
  last.S.cars.push({ id: 1000, z: last.S.z + 3, lane: 1, target: 1, x: last.S.x, speed: 20, cruise: 20, kind: 'hatch', paint: 0, blink: 0, brake: false, prevDz: 3, hit: 0, think: 99 });
  last.sim.step(1 / 60);
  assert.ok(last.S.over && last.S.crash && last.S.crash.final, 'the last hit is a spin-out');
  console.log(`crash severity: soft ${soft.ev.sev.toFixed(2)}, hard ${hard.ev.sev.toFixed(2)}, truck shunt +${(truck.c.speed - 30).toFixed(1)} m/s vs car +${(hard.c.speed - 30).toFixed(1)} m/s`);
}

// police: nothing below one full star; free run has no race result
{
  const sim = createSim({ mode: 'play', seed: 3, config: { race: false } });
  for (let t = 0; t < 4; t += 1 / 60) sim.step(1 / 60);
  sim.S.wanted = 0.9; sim.S.cars.length = 0; sim.S.speed = 30; sim.step(1 / 60);
  assert.equal(sim.S.cops.length, 0, 'no cruiser before a full star');
  sim.S.wanted = 1.01; sim.step(1 / 60);
  assert.equal(sim.S.cops.length, 1, 'one star, one cruiser');
  let fin = null; const free = createSim({ mode: 'play', seed: 3, config: { race: false, police: false }, onEvent: (e) => { if (e.type === 'finale') fin = e; } });
  for (let t = 0; t < 4; t += 1 / 60) free.step(1 / 60);
  free.S.files = 9; free.S.shards = 49; free.S.cars.length = 0; free.S.shardList.length = 0; free.S.shardList.push({ z: free.S.z + 2, x: free.S.x, taken: false, missed: false, id: 5000 });
  for (let t = 0; t < 1 && !fin; t += 1 / 60) { free.S.cars.length = 0; free.step(1 / 60); }
  assert.ok(fin && fin.won === null, 'free run: no winner is announced');
}
console.log('ALL SIM CHECKS PASSED');
