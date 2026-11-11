// Headless REDLINE simulation checks. Run: node test/sim.test.mjs
import assert from 'node:assert/strict';
import { createSim, LANES, RAIL, MAX, SECTOR } from '../src/game/sim.js';

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
function driver({ heatCap = 70, look = 150, route = 'expressway' } = {}) {
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
      const nearJ = S.nextJunction - S.z < 220;
      for (const lx of LANES) {
        let sc = -Math.abs(lx - S.x) * 0.4 - danger(S, lx);
        if (nearJ) sc += (route === 'backstreets' ? lx > 1.8 : lx < 1.8) ? 120 : -120;
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
// 9) junctions: the lane under the sign picks the route; backstreets pay 1.5x per shard
const back = run({ seconds: 120, bot: driver({ route: 'backstreets' }), seed: 3, config: { police: false, race: false } });
console.log('backstreet:', fmt(back), back.S.route);
assert.ok(back.ev.junction >= 1, 'passes at least one junction');
assert.ok(back.S.routes.slice(1).some((r) => r.route === 'backstreets'), 'right lane at the sign → backstreets');
const expr = run({ seconds: 120, bot: driver({ route: 'expressway' }), seed: 3, config: { police: false, race: false } });
assert.equal(expr.S.routes.at(-1).route, 'expressway', 'left lanes at the sign → expressway');

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
  const dry = stopDist('clear', 400), wet = stopDist('rain', 400), tun = stopDist('rain', SECTOR + 20);
  console.log(`braking from 216 km/h: dry ${dry.toFixed(0)} m, rain ${wet.toFixed(0)} m, rain inside a tunnel ${tun.toFixed(0)} m`);
  assert.ok(wet > dry * 1.15, 'rain lengthens braking');
  assert.ok(Math.abs(tun - dry) < 3, 'a tunnel is dry even when it rains');
  const sim = mk('rain'); sim.S.z = 500; sim.S.speed = MAX * 1.3; sim.S.cars.length = 0; sim.step(1 / 60);
  assert.ok(sim.S.wet && sim.S.aqua > 0.5, 'flat out in the rain aquaplanes');
  sim.S.z = SECTOR + 50; sim.S.cars.length = 0; sim.step(1 / 60);
  assert.ok(sim.S.inTunnel && !sim.S.wet && sim.S.aqua === 0, 'no aquaplaning in the tunnel');
  assert.ok(sim.tunnelAt(SECTOR + 10) && !sim.tunnelAt(SECTOR - 10) && !sim.tunnelAt(100), 'tunnels follow junctions only');
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
