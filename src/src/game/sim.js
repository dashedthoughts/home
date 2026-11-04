// REDLINE simulation · pure logic, no rendering, no DOM. Units: metres, seconds.
// Track space: z = distance travelled along the road, x = lateral offset from the centre line.

import { CARS, DIFFICULTY, WEATHER } from './config.js';

export const LANE_W = 3.6;
export const LANES = [-LANE_W, 0, LANE_W];
export const ROAD_HALF = 5.4;
export const RAIL = 6.05;          // guardrail (player centre can't pass this)
export const MAX = 70;             // m/s ≈ 252 km/h at car.top = 1
export const OC_TOP = 1.38;        // overclock top-speed multiplier
export const SLIP_TOP = 1.12;
const CAR_LEN = 4.4, CAR_W = 1.95;
const GLITCH_TIME = 3.0;
const SHARDS_PER_FILE = 5;
const TOTAL_FILES = 10;
export const SECTOR = 1500;        // a junction every 1.5 km
export const TUNNEL = 260;         // the tunnel right after each junction
export const ROUTES = {
  expressway: { name: 'EXPRESSWAY', traffic: 1.0, speed: 1.0, density: 1.0, shard: 1.0 },
  backstreets: { name: 'BACKSTREETS', traffic: 1.25, speed: 0.78, density: 1.0, shard: 1.5 },
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (t) => t * t * (3 - 2 * t);

export function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSim(opts = {}) {
  const emit = opts.onEvent || (() => {});
  let mode = opts.mode || 'attract';
  let cfg = { car: 'wedge', difficulty: 'street', weather: 'clear', assist: false, ...(opts.config || {}) };
  const input = { left: false, right: false, boost: false, brake: false, axis: 0, strike: false, wheelie: false };
  const S = {};
  let prnd = Math.random;
  let rnd = Math.random;

  // ---------- track: curvature & hills as smooth sections, generated lazily ----------
  let sections = [];
  function extendTrack(toZ) {
    while (!sections.length || sections[sections.length - 1].end < toZ) {
      const prev = sections[sections.length - 1];
      const start = prev ? prev.end : 0;
      const len = 180 + rnd() * 320;
      const straight = !prev || rnd() < 0.28;
      const c = straight ? 0 : (rnd() < 0.5 ? -1 : 1) * (0.35 + rnd() * 0.65);
      const h = rnd() < 0.45 ? 0 : (rnd() * 2 - 1);
      sections.push({ start, end: start + len, c, h, c0: prev ? prev.c : 0, h0: prev ? prev.h : 0 });
    }
    // drop sections far behind
    while (sections.length > 4 && sections[1].end < S.z - 400) sections.shift();
  }
  function sectionAt(z) {
    for (let i = sections.length - 1; i >= 0; i--) if (sections[i].start <= z) return sections[i];
    return sections[0];
  }
  function curveAt(z) {
    const s = sectionAt(z);
    const t = smooth(clamp((z - s.start) / Math.min(140, (s.end - s.start) * 0.45), 0, 1));
    return s.c0 + (s.c - s.c0) * t;
  }
  function hillAt(z) {
    const s = sectionAt(z);
    const t = smooth(clamp((z - s.start) / ((s.end - s.start) * 0.6), 0, 1));
    return s.h0 + (s.h - s.h0) * t;
  }

  function routeAt(z) {
    const rs = S.routes || [];
    for (let i = rs.length - 1; i >= 0; i--) if (rs[i].z0 <= z) return rs[i].route;
    return 'expressway';
  }

  // ---------- spawning ----------
  function spawnShards() {
    while (S.nextShardZ < S.z + 520) {
      if (S.finale) return;
      const z0 = S.nextShardZ;
      const inSector = ((z0 % SECTOR) + SECTOR) % SECTOR;
      if (inSector > SECTOR - 120 || inSector < TUNNEL + 40) { S.nextShardZ += 60; continue; } // keep junctions & tunnels clean
      const p = rnd();
      const lane = (rnd() * 3) | 0;
      const n = 6;
      for (let k = 0; k < n; k++) {
        let x = LANES[lane];
        if (p > 0.66) x = Math.sin((k / (n - 1)) * Math.PI * 2) * LANE_W; // weave
        else if (p > 0.38) x = LANES[lane] + (k / (n - 1)) * (lane === 2 ? -1 : 1) * LANE_W; // lane change
        S.shardList.push({ z: z0 + k * 9, x, taken: false, missed: false, id: S.uid++ });
      }
      S.nextShardZ += 170 + rnd() * 170;
    }
  }

  function laneFree(lane, z, gap) {
    for (const c of S.cars) if ((c.lane === lane || c.target === lane) && Math.abs(c.z - z) < gap) return false;
    return true;
  }

  // would putting a car in `lane` at z leave no free lane within ±win? (never build walls)
  function wouldWall(lane, z, self, win = 34) {
    let blocked = 0;
    for (let l = 0; l < 3; l++) {
      if (l === lane) continue;
      if (S.cars.some((c) => c !== self && (c.lane === l || c.target === l) && Math.abs(c.z - z) < win)) blocked++;
    }
    return blocked >= 2;
  }

  function spawnTraffic() {
    const diff = DIFFICULTY[cfg.difficulty] || DIFFICULTY.street;
    if (S.finale) return;
    const R = ROUTES[routeAt(S.z + 300)] || ROUTES.expressway;
    const want = Math.round((mode === 'attract' ? 9 : 13) * diff.density * R.traffic);
    let guard = 0;
    while (S.cars.length < want && guard++ < 20) {
      const z = S.z + 220 + rnd() * 260 + (S.cars.length === 0 ? -140 : 0);
      const lane = (rnd() * 3) | 0;
      if (!laneFree(lane, z, 28) || wouldWall(lane, z, null)) continue;
      const kind = rnd() < 0.16 ? 'hauler' : rnd() < 0.5 ? 'sedan' : 'hatch';
      const speed = (24 + rnd() * 18) * diff.trafficSpeed * R.speed * (kind === 'hauler' ? 0.85 : 1);
      S.cars.push({
        id: S.uid++, z, lane, target: lane, x: LANES[lane], speed, cruise: speed, kind,
        paint: (rnd() * 8) | 0, blink: 0, brake: false, prevDz: z - S.z, hit: 0, think: rnd() * 2,
      });
    }
  }

  // ---------- reset ----------
  function reset(seed) {
    rnd = seed != null ? mulberry(seed) : Math.random;
    prnd = seed != null ? mulberry(seed * 7 + 3) : Math.random; // pickups have their own stream, so traffic stays the same
    const car = CARS[cfg.car] || CARS.wedge;
    const diff = DIFFICULTY[cfg.difficulty] || DIFFICULTY.street;
    Object.assign(S, {
      z: 0, x: 0, vx: 0, steer: 0, speed: mode === 'attract' ? MAX * 0.8 : 0,
      heat: 0, glitch: 0, slip: 0, draft: 0, invuln: 0, hitstop: 0,
      lives: diff.lives, maxLives: diff.lives, score: 0, shards: 0, files: 0, chain: 0,
      nearMisses: 0, topSpeed: 0, dist: 0, time: 0, over: false, overT: 0,
      count: mode === 'play' ? 3.6 : 0, lastCount: 4,
      overclock: false, onKerb: false, scrape: 0, shake: 0, flash: 0,
      cars: [], shardList: [], nextShardZ: mode === 'play' ? 140 : 60, uid: 1,
      car, ai: { target: 0, think: 0 },
      route: 'expressway', routes: [{ z0: -1e9, route: 'expressway' }], nextJunction: SECTOR, sector: 1,
      finale: false, finaleT: 0, done: false,
      rival: { z: -9, x: LANES[2], lane: 2, target: 2, speed: mode === 'attract' ? MAX * 0.8 : 0, swapT: -9, think: 0, stun: 0, cd: 0.8, hits: 0, fight: false, fightT: 0, fightCd: 1.5 }, pos: 1, raceWon: null, strikeCd: 0, swing: 0, wheelie: 0, wanted: 0, cop: null, cops: [], bust: 0, lost: 0, busts: 0, powers: [], nextPowerZ: 520, ghost: 0,
    });
    sections = [];
    extendTrack(1200);
    spawnTraffic();
    spawnShards();
  }

  // ---------- autopilot (attract mode) ----------
  function autopilot(dt) {
    const ai = S.ai;
    ai.think -= dt;
    if (ai.think <= 0) {
      ai.think = 0.2;
      let best = 0, bestScore = -1e9;
      LANES.forEach((lx, li) => {
        let sc = -Math.abs(lx - S.x) * 0.3 - (li === 1 ? 0 : 0.2);
        for (const c of S.cars) {
          const dz = c.z - S.z;
          if (dz > -4 && dz < 90 && Math.abs(c.x - lx) < 2.4) sc -= (90 - dz) * 0.5;
        }
        for (const s of S.shardList) {
          const dz = s.z - S.z;
          if (!s.taken && dz > 0 && dz < 70 && Math.abs(s.x - lx) < 1.6) sc += (70 - dz) * 0.08;
        }
        if (sc > bestScore) { bestScore = sc; best = lx; }
      });
      ai.target = best;
    }
    const d = ai.target - S.x - S.vx * 0.35;
    input.axis = clamp(d * 0.9, -1, 1);
    input.left = input.right = false;
    const cap = MAX * (cfg.cruise || 1.4); // ambient screens can set a cruising speed
    input.boost = S.heat < 62 && Math.abs(curveAt(S.z + 30)) < 0.45 && S.speed < cap - 2;
    input.brake = S.speed > cap + 18; // only a big overshoot brakes; otherwise drag eases it down
  }

  // ---------- step ----------
  function step(dt) {
    S.time += dt;
    if (S.flash > 0) S.flash -= dt;
    if (S.shake > 0) S.shake -= dt;
    if (S.hitstop > 0) { S.hitstop -= dt; return; }

    const car = S.car;
    const weather = WEATHER[cfg.weather] || WEATHER.clear;
    const grip = car.grip * weather.grip;

    // countdown
    if (S.count > 0) {
      S.count -= dt;
      const n = Math.ceil(S.count);
      if (n !== S.lastCount && n >= 1 && n <= 3) emit({ type: 'count', n });
      S.lastCount = n;
      if (S.count <= 0) { emit({ type: 'go' }); if (S.car.bike) S.wheelie = 1.5; } // pop one off the line
    }
    const racing = S.count <= 0 && !S.over && !S.done;

    if (mode === 'attract') autopilot(dt);

    // ---- steering (digital keys + analog axis), with glitch inversion ----
    let target = clamp((input.right ? 1 : 0) - (input.left ? 1 : 0) + input.axis, -1, 1);
    if (S.glitch > 0) target = -target;
    if (!racing) target = 0;
    S.steer += (target - S.steer) * Math.min(1, dt * 11);

    // ---- longitudinal ----
    const overclock = racing && input.boost && S.glitch <= 0;
    const top = MAX * car.top * (overclock ? OC_TOP : 1) * (S.slip > 0 ? SLIP_TOP : 1);
    if (S.over) S.speed = Math.max(0, S.speed - 22 * dt);
    else if (!racing) S.speed = mode === 'attract' ? S.speed : 0;
    else if (S.finale) { /* coasting handled below */ }
    else if (input.brake) S.speed = Math.max(0, S.speed - 34 * dt);
    else if (S.speed < top) S.speed += 21 * car.accel * (overclock ? 1.25 : 1) * Math.max(0.12, 1 - (S.speed / top) ** 2) * dt;
    else S.speed = Math.max(top, S.speed - 9 * dt);
    S.onKerb = Math.abs(S.x) > ROAD_HALF - 0.95;
    if (S.onKerb && S.speed > MAX * 0.45) S.speed -= 7 * dt;

    const prevZ = S.z;
    S.z += S.speed * dt;
    S.dist += S.speed * dt;
    S.topSpeed = Math.max(S.topSpeed, S.speed);
    const sp = S.speed / MAX;

    // ---- lateral: grip-limited steering, centrifugal push, damping ----
    const steerPow = 34 * grip * clamp(S.speed / 16, 0, 1);
    S.vx += S.steer * steerPow * dt;
    const curve = curveAt(S.z);
    S.vx -= curve * sp * sp * 15 * dt;
    if (cfg.assist && Math.abs(target) < 0.15 && racing) {
      const lane = LANES.reduce((a, b) => (Math.abs(b - S.x) < Math.abs(a - S.x) ? b : a));
      S.vx += (lane - S.x) * 5 * dt;
    }
    S.vx *= Math.exp(-dt * 6.5 * grip);
    S.x += S.vx * dt;

    // guardrail: scrape along it, lose speed, get pushed back in
    S.scrape = Math.max(0, S.scrape - dt);
    if (Math.abs(S.x) > RAIL) {
      const side = Math.sign(S.x);
      S.x = side * RAIL;
      if (Math.abs(S.vx) > 2 || S.speed > 20) {
        if (S.scrape <= 0) emit({ type: 'scrape', side });
        S.scrape = 0.12;
      }
      S.vx = -side * Math.max(2.5, Math.abs(S.vx) * 0.4);
      S.speed *= Math.exp(-dt * 1.6);
      if (cfg.effects !== 'reduced') S.shake = Math.max(S.shake, 0.08);
    }

    // ---- heat / glitch ----
    if (S.glitch > 0) {
      S.glitch -= dt;
      if (S.glitch <= 0) { S.heat = 40; emit({ type: 'glitch-end' }); }
    } else if (overclock && S.speed > MAX * 0.5) {
      S.heat += (21 / car.cool) * dt;
      if (S.heat >= 100) {
        S.heat = 100;
        S.glitch = GLITCH_TIME;
        S.chain = 0;
        emit({ type: 'glitch' });
      }
    } else S.heat = Math.max(0, S.heat - 15 * car.cool * dt);
    S.overclock = overclock;
    if (S.slip > 0) S.slip -= dt;

    // ---- junctions: the lane you're in under the sign picks the next route ----
    if (S.z >= S.nextJunction && !S.finale) {
      const route = S.x > LANE_W * 0.5 ? 'backstreets' : 'expressway';
      S.routes.push({ z0: S.nextJunction, route });
      if (S.routes.length > 6) S.routes.shift();
      S.route = route;
      S.sector += 1;
      S.nextJunction += SECTOR;
      if (mode === 'play') emit({ type: 'junction', route, sector: S.sector });
    }

    // ---- finale: traffic clears, the car rolls to a stop at the lookout ----
    if (S.finale) {
      S.finaleT += dt;
      input.boost = false;
      S.cars = S.cars.filter((c) => Math.abs(c.z - S.z) > 60 || S.finaleT < 0.5);
      if (S.finaleT > 1.2) S.speed = Math.max(0, S.speed - 14 * dt);
      if (S.speed <= 0.5 && !S.done && S.finaleT > 2) {
        S.done = true;
        emit({ type: 'complete', won: S.raceWon, score: Math.round(S.score), files: S.files, dist: S.dist, top: S.topSpeed, nearMisses: S.nearMisses, shards: S.shards, sectors: S.sector });
      }
    }

    // ---- traffic ----
    extendTrack(S.z + 1300);
    if (S.invuln > 0) S.invuln -= dt;
    const diff = DIFFICULTY[cfg.difficulty] || DIFFICULTY.street;
    let draftCar = null;
    for (const c of S.cars) {
      // car-following: slow behind a slower car in the same lane
      let lead = null;
      for (const o of S.cars) {
        if (o === c) continue;
        const gap = o.z - c.z;
        if (gap > 0 && gap < 32 && Math.abs(o.x - c.x) < 2.2 && (!lead || gap < lead.z - c.z)) lead = o;
      }
      let want = c.cruise;
      if (lead) want = Math.min(c.cruise, lead.speed - 1.5);
      // never be the car that closes the last gap: if both other lanes are occupied just ahead/abreast, hang back
      let blockers = 0, slowest = 1e9;
      for (let l = 0; l < 3; l++) {
        if (l === c.lane) continue;
        const o = S.cars.find((o) => o !== c && o.lane === l && o.z - c.z > -3 && o.z - c.z < 18);
        if (o) { blockers++; slowest = Math.min(slowest, o.speed); }
      }
      if (blockers === 2) want = Math.min(want, slowest - 4);
      // traffic brakes for the player too (no cheap rear-endings from behind)
      const pg = S.z - c.z;
      if (pg > 0 && pg < 30 && Math.abs(S.x - c.x) < 2.3) want = Math.min(want, S.speed - 2);
      c.brake = want < c.speed - 0.5;
      c.speed += clamp(want - c.speed, -14 * dt, 6 * dt);

      // occasional lane change (signalled), never into the player's flank
      c.think -= dt;
      if (c.blink === 0 && c.think <= 0) {
        c.think = 1.5 + rnd() * 3;
        if (lead || rnd() < 0.18 * diff.density) {
          const opts = [c.lane - 1, c.lane + 1].filter((l) => l >= 0 && l <= 2 && laneFree(l, c.z, 20) && !wouldWall(l, c.z, c));
          const pick = opts.filter((l) => !(Math.abs(LANES[l] - S.x) < 2.2 && Math.abs(c.z - S.z) < 16));
          if (pick.length) { c.target = pick[(rnd() * pick.length) | 0]; c.blink = 1.1; }
        }
      }
      if (c.blink > 0) {
        c.blink -= dt;
        if (c.blink <= 0.45) c.lane = c.target;
        if (c.blink <= 0) c.blink = 0;
      }
      const tx = LANES[c.lane];
      c.x += clamp(tx - c.x, -2.4 * dt, 2.4 * dt);
      c.z += c.speed * dt;

      // interactions with the player
      // real footprints: per-kind length (trucks are long and sit 0.9 m back), and the bike's narrow track can split two lanes
      const dzRaw = c.z - S.z;
      const dz = c.kind === 'hauler' ? dzRaw - 0.9 : dzRaw;
      const dx = c.x - S.x;
      const hitW = car.bike ? 1.22 : CAR_W;
      const hitL = (c.kind === 'hauler' ? 4.4 : c.kind === 'hatch' ? 2.0 : 2.25) + (car.bike ? 1.1 : 2.2);
      // never draw two vehicles inside each other: the autopilot follows, and after a hit traffic is shoved clear
      if (Math.abs(dz) < hitL && Math.abs(dx) < hitW && (mode !== 'play' || S.invuln > 0 || !racing)) {
        if (dz >= 0) { c.z = S.z + hitL + 0.15 + (dzRaw - dz); c.speed = Math.max(c.speed, S.speed + 2); }
        else { c.z = S.z - hitL - 0.15 + (dzRaw - dz); c.speed = Math.min(c.speed, Math.max(0, S.speed - 2)); }
        c.prevDz = c.z - S.z;
        continue;
      }
      if (mode !== 'play' && dz > 0 && dz < 16 && Math.abs(dx) < hitW + 0.3) S.speed = Math.min(S.speed, Math.max(c.speed - 0.5, 0));
      if (racing && Math.abs(dz) < hitL && Math.abs(dx) < hitW) {
        if (mode === 'play' && S.invuln <= 0) {
          if (!cfg.zen) S.lives -= 1;
          S.invuln = 1.6;
          S.hitstop = 0.085;
          c.hit = 1;
          const side = dx > 0 ? -1 : 1;
          S.vx = side * 7;
          S.x += side * 0.5;
          if (dz > 0) { S.speed = Math.min(S.speed, c.speed * 0.6); c.speed += 5; }
          else S.speed *= 0.8;
          S.chain = 0;
          if (cfg.effects !== 'reduced') { S.shake = 0.45; S.flash = 0.35; }
          emit({ type: 'hit', lives: S.lives });
          if (mode === 'play' && cfg.police !== false && !cfg.zen) S.wanted = Math.min(3, S.wanted + 1); // crashes draw the police
          if (S.lives <= 0) {
            S.over = true;
            emit({
              type: 'over', score: Math.round(S.score), files: S.files, dist: S.dist,
              top: S.topSpeed, nearMisses: S.nearMisses, shards: S.shards,
            });
          }
        }
      } else if (racing && c.prevDz > 0 && dz <= 0 && Math.abs(dx) < 3.2 && !c.hit && mode === 'play') {
        const pts = 250 * (overclock ? 2 : 1);
        S.score += pts;
        S.nearMisses += 1;
        S.heat = Math.max(0, S.heat - 8);
        emit({ type: 'nearmiss', pts });
      }
      if (dz > 5 && dz < 38 && Math.abs(dx) < 1.3) draftCar = c;
      c.prevDz = dz;
    }
    S.cars = S.cars.filter((c) => c.z > S.z - 45 && c.z < S.z + 700);
    spawnTraffic();

    // slipstream: hang behind a car to charge a boost
    if (racing && draftCar && S.speed > MAX * 0.45) {
      S.draft += dt * 0.6;
      if (S.draft >= 1) {
        S.draft = 0;
        S.slip = 2.2;
        S.heat = Math.max(0, S.heat - 18);
        if (mode === 'play') emit({ type: 'slipstream' });
      }
    } else S.draft = Math.max(0, S.draft - dt * 0.9);

    // ---- the rival: one AI racer on the same road, through the same traffic, rubber-banded so it stays a race ----
    if (mode === 'play' && cfg.race !== false && (racing || S.finale || S.over)) { // keeps driving after the end so nothing coasts into it
      const R = S.rival;
      const gap = R.z - S.z; // + = rival ahead
      // pace follows the player (rubber band), with slow surges and fades so the lead changes hands
      const wave = 1.06 + 0.08 * Math.sin(S.time * 0.21) + 0.04 * Math.sin(S.time * 0.67 + 1.3); // quicker than you on average: you have to drive
      const ref = Math.max(MAX * 0.85, S.speed);
      const rash = cfg.rash && S.car.bike;
      let want = ref * wave * (diff.rival || 1) * (rash ? 1.04 : 1);
      if (gap < -30) want = Math.max(want, ref * 1.2); else if (gap > 220) want = Math.min(want, ref * 0.97);
      want = Math.min(want, MAX * 1.4);
      // the launch: KUROGANE starts a length behind and blasts past you off the line
      const launching = S.dist < 450 && gap < 45;
      if (launching) want = Math.max(want, S.speed * 1.4 + 10);
      if (S.finale) want = Math.max(0, R.speed - 14 * dt);
      const lead = S.cars.find((o) => o.z - R.z > 0 && o.z - R.z < 42 + Math.max(0, R.speed - 40) * 1.2 && Math.abs(o.x - R.x) < 2.2);
      R.think -= dt;
      if (lead && R.target === R.lane && R.think <= 0) {
        R.think = 0.4;
        for (const l of [R.lane - 1, R.lane + 1].filter((l) => l >= 0 && l < 3).sort(() => (S.time % 2 < 1 ? 1 : -1))) {
          const busy = S.cars.some((o) => Math.abs(o.x - LANES[l]) < 2.4 && o.z - R.z > -9 && o.z - R.z < 46);
          const player = Math.abs(S.x - LANES[l]) < 2.4 && Math.abs(S.z - R.z) < 9;
          if (!busy && !player) { R.target = l; break; }
        }
      }
      if (lead && R.target === R.lane) want = Math.min(want, lead.speed - 1);
      // rash: the rival comes looking for a fight, rides your flank for a few seconds, then breaks off
      if (racing && !S.finale) {
        R.fightCd -= dt;
        if (!R.fight && R.fightCd <= 0 && Math.abs(gap) < 180 && R.stun <= 0) { R.fight = true; R.fightT = 0; }
        if (R.fight) {
          R.fightT += dt;
          const pl = S.x < -LANE_W / 2 ? 0 : S.x > LANE_W / 2 ? 2 : 1;
          const flank = pl === 0 ? 1 : pl === 2 ? 1 : (R.x >= S.x ? 2 : 0);
          if (!S.cars.some((o) => Math.abs(o.x - LANES[flank]) < 2.4 && o.z - R.z > -6 && o.z - R.z < 20)) R.target = flank;
          want = clamp(S.speed - gap * 0.9, S.speed * 0.5, MAX * 1.45);
          if (R.fightT > 8 || R.stun > 0.8) { R.fight = false; R.fightCd = (rash ? 3 : 5) + rnd() * 3; }
        }
      }
      R.speed += clamp(want - R.speed, -16 * dt, (launching ? 30 : 11) * dt);
      if (R.stun > 0) { R.stun -= dt; want *= 0.8; }
      R.x += clamp(LANES[R.target] - R.x, -5.5 * dt, 5.5 * dt);
      // ---- shoulder checks: in any race he leans on you when he's alongside ----
      if (!rash && racing && !cfg.zen) {
        R.cd -= dt;
        const beside = Math.abs(R.z - S.z) < 3.6 && Math.abs(R.x - S.x) < 3.95;
        if (beside && R.cd <= 0 && R.stun <= 0 && S.invuln <= 0) {
          R.cd = 1.3 + rnd() * 1.0;
          const side = Math.sign(S.x - R.x) || 1;
          const clear = !S.cars.some((c) => Math.abs(c.z - S.z) < 7 && Math.abs(c.x - (S.x + side * 2)) < 2.4);
          if (clear) S.vx += side * 6.5; // never shoved into traffic
          S.speed *= 0.86; S.shake = 0.3;
          emit({ type: 'struck', x: (R.x + S.x) / 2 });
        }
      }
      // ---- your whip (X): works in every race. Lash KUROGANE and he spins wide; lash a cruiser and it drops back ----
      if (racing && !S.finale) {
        S.strikeCd -= dt; S.swing = Math.max(0, S.swing - dt);
        if (input.strike && S.strikeCd <= 0) {
          S.strikeCd = 0.6; S.swing = 0.25; input.strike = false;
          const reach = (o) => Math.abs(o.z - S.z) < 6 && Math.abs(o.x - S.x) < 4.4;
          const K = (S.cops || []).find(reach);
          if (reach(R)) {
            R.stun = 1.8; R.speed *= 0.62; R.hits++; R.fight = false; R.fightCd = 3;
            const side = Math.sign(R.x - S.x) || 1;
            R.x = clamp(R.x + side * 1.6, -RAIL + 1, RAIL - 1);
            R.target = clamp(R.lane + side, 0, 2);
            S.score += 400; S.shake = 0.2;
            emit({ type: 'strike', x: (R.x + S.x) / 2 });
            if (cfg.police !== false && !cfg.zen) S.wanted = Math.min(3, S.wanted + 0.3);
          } else if (K) {
            K.speed *= 0.5; K.z -= 8; S.bust = Math.max(0, (S.bust || 0) - 0.6); S.score += 300;
            emit({ type: 'strike', cop: true, x: (K.x + S.x) / 2 });
          } else emit({ type: 'whiff' });
        }
      }
      // ---- rash: KUROGANE swings back when side by side ----
      if (rash && racing) {
        R.cd -= dt;
        const beside = Math.abs(R.z - S.z) < 3.4 && Math.abs(R.x - S.x) < 3.95;
        if (beside && R.cd <= 0 && R.stun <= 0 && S.invuln <= 0) {
          R.cd = 0.7 + rnd() * 0.7;
          if (rnd() < 0.85) {
            const side = Math.sign(S.x - R.x) || 1;
            const clear = !S.cars.some((c) => Math.abs(c.z - S.z) < 7 && Math.abs(c.x - (S.x + side * 2)) < 2.4);
            S.speed *= 0.78; if (clear) S.vx += side * 7.5; S.shake = 0.35; S.heat = Math.min(100, S.heat + 8);
            emit({ type: 'struck', x: (R.x + S.x) / 2 });
          }
        }
      }
      if (Math.abs(LANES[R.target] - R.x) < 0.05) R.lane = R.target;
      R.z += R.speed * dt;
      R.z = clamp(R.z, S.z - 400, S.z + 400); // never out of the race, whatever happens to the player
      // never inside the player or a car: hold behind / ahead instead
      for (let pass = 0; pass < 3; pass++) {
        let moved = false;
        for (const o of S.cars) if (Math.abs(o.z - R.z) < CAR_LEN && Math.abs(o.x - R.x) < CAR_W) { R.z = o.z - CAR_LEN - 0.1; R.speed = Math.min(R.speed, o.speed); moved = true; }
        const dz = R.z - S.z;
        if (Math.abs(dz) < CAR_LEN && Math.abs(R.x - S.x) < CAR_W) { R.z = S.z - CAR_LEN - 0.1; R.speed = Math.min(R.speed, S.speed); moved = true; }
        if (!moved) break;
      }
      if (Math.abs(R.z - S.z) < CAR_LEN && Math.abs(R.x - S.x) < CAR_W) R.z = S.z - CAR_LEN - 0.1; // the player always wins the last word
      const pos = R.z > S.z ? 2 : 1;
      if (pos !== S.pos && !S.finale) {
        if (S.time - R.swapT > 1.2 && S.dist > 300) emit({ type: pos === 1 ? 'overtake' : 'overtaken' }); // no call-outs off the line
        R.swapT = S.time;
        S.pos = pos;
      }
    }

    // ---- police: speed and crashes build heat (up to 3 stars); each star brings a cruiser. They take your flanks
    // and your tail; boxed in for long enough and you're busted. Lose them all and you get away.
    if (S.swarmT > 0) {
      S.swarmT -= dt;
      for (const K of S.cops) { K.z = S.z + K.off; K.x = clamp(S.x + K.side * 3.6, -RAIL, RAIL); K.speed = S.speed; }
      S.speed = Math.max(0, S.speed - 30 * dt);
      if (S.swarmT <= 0) { S.cops = []; S.cop = null; }
    } else if (mode === 'play' && cfg.police !== false && !cfg.zen && racing && !S.finale) {
      if (S.speed > MAX * 0.95) S.wanted = Math.min(3, S.wanted + dt * 0.035 * (S.speed / MAX));
      const stars = Math.ceil(S.wanted - 0.001);
      S.cops = S.cops || [];
      while (S.cops.length < stars) {
        S.cops.push({ z: S.z - 150 - S.cops.length * 40, x: LANES[S.cops.length % 3], target: 1, speed: S.speed, slot: S.cops.length });
        emit({ type: 'police', stars });
      }
      const pl = S.x < -LANE_W / 2 ? 0 : S.x > LANE_W / 2 ? 2 : 1;
      let pressure = 0, nearest = 1e9;
      for (const K of S.cops) {
        const gap = S.z - K.z; // + = behind you
        nearest = Math.min(nearest, gap);
        // slot 0 tails you, slots 1 and 2 take the lanes either side
        const side = K.slot === 0 ? 0 : (K.slot === 1 ? -1 : 1);
        const lane = Math.max(0, Math.min(2, pl + side));
        K.target = gap < 30 ? lane : pl;
        const want = Math.min(MAX * (1.18 + 0.08 * stars), Math.max(S.speed * 1.1, MAX * 0.95));
        const hold = K.slot === 0 ? 7 : 0; // tail sits 7 m back; flankers come alongside
        const desired = gap > hold + 2 ? want : S.speed + (gap - hold) * 1.5;
        K.speed += clamp(desired - K.speed, -18 * dt, 14 * dt);
        K.x += clamp(LANES[K.target] - K.x, -6.5 * dt, 6.5 * dt);
        K.z += K.speed * dt;
        for (const o of S.cars) if (Math.abs(o.z - K.z) < CAR_LEN && Math.abs(o.x - K.x) < CAR_W) { K.z = o.z - CAR_LEN - 0.1; K.speed = Math.min(K.speed, o.speed); }
        for (const J of S.cops) if (J !== K && Math.abs(J.z - K.z) < CAR_LEN && Math.abs(J.x - K.x) < CAR_W) K.z = J.z - CAR_LEN - 0.1;
        if (Math.abs(K.z - S.z) < CAR_LEN && Math.abs(K.x - S.x) < CAR_W) K.z = S.z - CAR_LEN - 0.1;
        K.z = Math.max(K.z, S.z - 420);
        const alongside = Math.abs(K.z - S.z) < 4 && Math.abs(K.x - S.x) < 4.2;
        const tailing = gap > 0 && gap < 12 && Math.abs(K.x - S.x) < 2.6;
        if (alongside) pressure += 1; else if (tailing) pressure += 0.6;
      }
      S.bust = S.invuln > 0 ? 0 : Math.max(0, (S.bust || 0) + (pressure > 0 ? dt * pressure * 0.75 : -dt * 0.8));
      if (S.bust >= 1) {
        S.lives -= 1; S.busts += 1; S.invuln = 2.5; S.speed *= 0.4; S.wanted = 0; S.bust = 0; S.chain = 0;
        // the swarm: three cruisers box you in (tail and both flanks) for a beat, then let you go
        S.swarmT = 2.2;
        S.cops = [{ off: -6.5, side: 0 }, { off: 0.8, side: -1 }, { off: 0.8, side: 1 }].map((c, i) => ({ ...c, z: S.z + c.off, x: S.x + c.side * 3.6, speed: S.speed, slot: i, target: 1 }));
        emit({ type: 'busted', lives: S.lives });
        if (S.lives <= 0) { S.over = true; emit({ type: 'over', busted: true, score: Math.round(S.score), files: S.files, dist: S.dist, top: S.topSpeed, nearMisses: S.nearMisses, shards: S.shards }); }
      }
      // escape: every cruiser 240 m+ back for 4 s
      if (S.cops.length && nearest > 240) {
        S.lost = (S.lost || 0) + dt;
        if (S.lost > 4) { const pts = 1000 * stars; S.score += pts; S.cops = []; S.wanted = 0; S.lost = 0; emit({ type: 'escaped', pts }); }
      } else S.lost = 0;
      S.cop = S.cops[0] || null;
    } else if (S.cops && S.cops.length && (S.finale || cfg.zen || cfg.police === false)) { S.cops = []; S.cop = null; }

    // ---- power-ups: GHOST (5 s invulnerable, ride through traffic) and NITRO (instant slipstream, engine cooled) ----
    if (mode === 'play' && !S.finale) {
      while (S.nextPowerZ < S.z + 420) {
        S.powers.push({ id: S.uid++, z: S.nextPowerZ, x: LANES[(prnd() * 3) | 0], kind: prnd() < 0.5 ? 'ghost' : 'nitro', taken: false });
        S.nextPowerZ += 650 + prnd() * 550;
      }
      for (const p of S.powers) {
        if (p.taken || !racing) continue;
        if (Math.abs(p.z - S.z) < 2.6 && Math.abs(p.x - S.x) < 1.7) {
          p.taken = true;
          if (p.kind === 'ghost') { S.ghost = 5; S.invuln = Math.max(S.invuln, 5); }
          else { S.slip = 2.6; S.heat = 0; S.draft = 0; }
          emit({ type: 'power', kind: p.kind, x: p.x });
        }
      }
      S.powers = S.powers.filter((p) => !p.taken && p.z > S.z - 20);
    }
    if (S.ghost > 0) S.ghost -= dt;
    // wheelies (bike): E pulls one; held for 1.6 s, +150
    if (S.wheelie > 0) S.wheelie = Math.max(0, S.wheelie - dt);
    if (input.wheelie && S.car.bike && racing && S.wheelie <= 0 && S.speed > 12) { S.wheelie = 1.6; S.score += 150; emit({ type: 'wheelie' }); }
    input.wheelie = false;

    // ---- shards ----
    for (const s of S.shardList) {
      if (s.taken || s.missed) continue;
      if (s.z <= S.z + 1.6 && s.z >= prevZ - 1.6 && Math.abs(s.x - S.x) < 1.55) {
        s.taken = true;
        S.chain += 1;
        S.shards += 1;
        const mult = (1 + Math.min(4, Math.floor(S.chain / 6))) * (overclock ? 2 : 1);
        S.score += Math.round(100 * mult * (ROUTES[S.route] || ROUTES.expressway).shard);
        if (mode === 'play') {
          emit({ type: 'shard', mult, chain: S.chain, x: s.x });
          if (S.shards % SHARDS_PER_FILE === 0 && S.files < TOTAL_FILES) {
            S.files += 1;
            emit({ type: 'casefile', n: S.files });
            if (S.files === TOTAL_FILES && !S.finale) { S.finale = true; S.finaleT = 0; S.raceWon = S.pos === 1; emit({ type: 'finale', won: S.raceWon }); }
          }
        }
      } else if (s.z < S.z - 3) {
        s.missed = true;
        if (mode === 'play' && S.chain > 0) { S.chain = 0; emit({ type: 'chain-break' }); }
      }
    }
    S.shardList = S.shardList.filter((s) => s.z > S.z - 20);
    spawnShards();

    if (racing) S.score += S.speed * dt * 0.12 * (overclock ? 2 : 1);
    if (S.over) S.overT += dt;
  }

  reset(opts.seed);

  return {
    S,
    input,
    step,
    reset,
    curveAt,
    hillAt,
    routeAt,
    get mode() { return mode; },
    setMode(m) { mode = m; },
    configure(c) {
      const carChanged = c.car && c.car !== cfg.car;
      cfg = { ...cfg, ...c };
      if (carChanged) S.car = CARS[cfg.car] || CARS.wedge;
    },
    get config() { return cfg; },
  };
}
