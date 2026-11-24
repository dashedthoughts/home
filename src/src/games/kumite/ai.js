// NEON KUMITE · CPU opponent. It plays through the same input bitmask as a human.
// It sees the opponent only through a delayed snapshot (its reaction time), never the opponent's inputs.
import { B, isAir, isActionable, moveOf, charOf } from './sim.js';
import { FIGHTERS } from './data.js';

const F = 256, BK = 512; // relative directions, resolved against our facing at output time
export const LEVELS = {
  // guard: chance to hold block in range when the player could attack. read: chance to act on a repeated pattern.
  // whiff: chance to punish a missed attack. EASY never punishes and thinks slowly.
  1: { name: 'EASY', react: [28, 40], block: 0.22, guess: 0.2, guard: 0.1, read: 0, whiff: 0, aa: 0.12, punish: 0, tech: 0.03, confirm: 0, think: [20, 34], reversal: 0.03, throwBias: 0.04, special: 0.55, combo: 0.35 },
  2: { name: 'NORMAL', react: [13, 19], block: 0.72, guess: 0.55, guard: 0.6, read: 0.75, whiff: 0.55, aa: 0.55, punish: 0.7, tech: 0.18, confirm: 0.55, think: [8, 15], reversal: 0.14, throwBias: 0.12, special: 0.85, combo: 0.75 },
  3: { name: 'HARD', react: [9, 13], block: 0.87, guess: 0.64, guard: 0.72, read: 0.9, whiff: 0.78, aa: 0.78, punish: 0.9, tech: 0.34, confirm: 0.88, think: [5, 11], reversal: 0.22, throwBias: 0.16, special: 1, combo: 0.9 },
  4: { name: 'RIVAL', react: [6, 9], block: 0.94, guess: 0.72, guard: 0.84, read: 1, whiff: 0.9, aa: 0.9, punish: 1, tech: 0.6, confirm: 0.97, think: [4, 8], reversal: 0.3, throwBias: 0.22, special: 1, combo: 1 },
};
const INPUT = { L5: B.LP, H5: B.HP, L2: B.D | B.LP, H2: B.D | B.HP, S: B.SP, fS: F | B.SP, bS: BK | B.SP, dS: B.D | B.SP, jS: B.SP, Lj: B.LP, Hj: B.HP, EX: B.SP | B.HP, SU: B.LP | B.HP | B.SP, TH: B.LP | B.HP };

// Character game plans: preferred range, anti-air, wake-up reversal, combos, neutral options per range band.
const PLAN = {
  rin: { pref: [70, 130], aa: ['bS', 'H5'], rev: 'bS', revEX: 'EX', punish: [['L5', 'H5', 'S'], ['H5', 'S']], farP: 'S',
    combos: [['L2', 'H5', 'S'], ['L5', 'L5', 'H5', 'S'], ['L5', 'H5', 'S']], superAfter: 'S', exEnder: 'EX',
    close: { combo: 4, throw: 1.4, fS: 1.2, back: 0.6, wait: 0.8, L5: 1 }, mid: { walk: 3, H5: 1.6, jump: 1.6, dash: 0.6, fS: 0.6, L2: 0.6, wait: 0.6 }, far: { walk: 3, dash: 1.2, jump: 0.8, wait: 0.4 } },
  ganji: { pref: [40, 90], aa: ['bS', 'H2'], rev: 'EX', revEX: 'EX', punish: [['H5', 'fS'], ['L5', 'H5', 'fS']], farP: 'fS',
    combos: [['L5', 'H5', 'fS'], ['L2', 'H5', 'fS'], ['L2', 'L2', 'H5', 'dS']], superAfter: null, exEnder: null,
    close: { S: 3.2, combo: 2.4, throw: 1.4, L5: 1, wait: 0.6, SU: 2 }, mid: { walk: 4, H5: 1.2, fS: 1, dS: 0.6, jump: 0.8, dash: 0.8, wait: 0.6 }, far: { walk: 5, dash: 1.2, jump: 0.5, wait: 0.8 } },
  suzu: { pref: [240, 420], aa: ['fS', 'bS'], rev: 'bS', revEX: 'bS', punish: [['L5', 'H5', 'S'], ['H5', 'S']], farP: 'S',
    combos: [['L5', 'H5', 'S'], ['L2', 'H5', 'S'], ['L5', 'L5', 'H5', 'S']], superAfter: 'S', exEnder: null,
    close: { combo: 2.4, bS: 0.5, backdash: 1.6, throw: 1, L5: 0.8, H5: 0.8 }, mid: { H5: 0.6, S: 1.8, back: 1.6, backdash: 0.6, H2: 0.6, dS: 0.4, EXb: 0.4, wait: 0.6 }, far: { S: 3, dS: 1, wait: 1, back: 0.6, EXb: 0.5, walk: 0.3 } },
  sayo: { pref: [70, 150], aa: ['H5', 'bS'], rev: 'S', revEX: 'EX', punish: [['L5', 'H5', 'dS'], ['H5', 'dS']], farP: 'dS',
    combos: [['L2', 'H5', 'dS'], ['L5', 'L5', 'H5', 'dS'], ['L5', 'H5', 'dS']], superAfter: 'dS', exEnder: null,
    close: { combo: 3.4, throw: 1.4, fS: 1, S: 0.7, wait: 0.7, L5: 1 }, mid: { walk: 2.4, dS: 1, fS: 0.8, H5: 1.2, jump: 1.2, dash: 1.4, S: 0.4, wait: 0.6 }, far: { walk: 3, dash: 2, S: 0.6, jump: 0.6, wait: 0.4 } },
};

function rngOf(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pick(rng, w) { let t = 0; for (const k in w) t += w[k]; let r = rng() * t; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return Object.keys(w)[0]; }

export function createAI(level = 2, seed = 1) {
  return { L: LEVELS[level] || LEVELS[2], lvl: level, rng: rngOf(seed * 9973 + level), hist: new Array(64), hi: 0, delay: 18, plan: [], pi: 0, pt: 0, hold: 0, holdT: 0, think: 0, wake: null, techT: -1, lastHeld: 0, punishArmed: 0, guarding: 0 };
}

function observe(o) { const m = moveOf(o); return { x: o.x, y: o.y, vx: o.vx, vy: o.vy, st: o.st, mv: o.mv, mf: o.mf, m, air: isAir(o), face: o.face, hp: o.hp }; }

export function aiInput(ai, S, side) {
  const me = S.f[side], op = S.f[1 - side];
  const L = ai.L, rng = ai.rng;
  ai.hist[ai.hi++ & 63] = observe(op);
  if ((S.frame & 31) === 0) ai.delay = Math.round(L.react[0] + rng() * (L.react[1] - L.react[0]));
  const o = ai.hist[(ai.hi - 1 - Math.min(ai.delay, Math.max(0, ai.hi - 1))) & 63] || ai.hist[(ai.hi - 1) & 63];
  if (S.phase !== 'fight') { ai.plan = []; return 0; }
  trackPattern(ai, S, o);
  const P = PLAN[me.id];
  const dist = Math.abs(o.x - me.x);
  const out = (bits) => resolve(bits, me);

  // being thrown: maybe tech, a few frames in
  if (me.st === 'held') {
    if (ai.lastHeld !== me.sf - 1 && me.sf <= 1) ai.techT = rng() < L.tech ? 3 + Math.floor(rng() * 5) : -1;
    ai.lastHeld = me.sf; ai.plan = [];
    return me.sf === ai.techT || me.sf === ai.techT + 1 ? B.LP | B.HP : 0;
  }
  // knocked down: choose a wake-up once
  if (me.st === 'down' || me.st === 'rise') {
    ai.plan = [];
    if (!ai.wake) {
      const r = rng(); const close = dist < 150;
      ai.wake = close && r < L.reversal ? (me.meter >= 500 && rng() < 0.5 ? P.revEX : P.rev) : r < 0.5 + L.block * 0.4 ? 'block' : 'none';
    }
    if (me.st === 'rise' && me.sf >= 14 && ai.wake !== 'block' && ai.wake !== 'none') return out(INPUT[ai.wake]);
    if (ai.wake === 'block') return out(BK | B.D);
    return 0;
  }
  ai.wake = null;

  // an armoured attack is starting: drop whatever we queued and block it
  if (ai.plan.length && L.read > 0 && o.st === 'atk' && o.m && o.m.armor && o.mf < o.m.st && isActionable(me)) ai.plan = [];
  // running plan
  if (ai.plan.length) {
    const r = runPlan(ai, S, me, op, o);
    if (r !== null) return out(r);
  }
  // blockstun / hitstun: keep guarding and arm a punish
  if (me.st === 'block' || me.st === 'hit') {
    if (me.st === 'block' && o.st === 'atk' && o.m && !ai.punishArmed && !o.m.proj) {
      const key = 'b' + o.mv + '@' + (S.frame - ai.delay - o.mf);
      if (ai.bkey !== key) {
        ai.bkey = key;
        const left = o.m.st + o.m.ac + o.m.rc - (o.mf + ai.delay); // frames the player still has to recover
        const fast = FIGHTERS[me.id].moves.L5.st + 1;
        if (left - me.stun >= fast + 1 && rng() < L.punish) ai.punishArmed = 1;
        else if (ai.rep && ai.rep.mv === o.mv && rng() < L.read) ai.punishArmed = 2; // they keep doing this: hit them as soon as we are free
      }
    }
    const h = o.m ? o.m.h : 'mid';
    return out(BK | (h === 'over' ? 0 : B.D));
  }
  if (ai.punishArmed && isActionable(me)) {
    const kind = ai.punishArmed; ai.punishArmed = 0;
    if (kind === 2) { // they keep doing the same thing: hit them with the fastest move that reaches, or step out of range
      const pk = bestPoke(me, op, Math.abs(op.x - me.x), Math.min(13, (FIGHTERS[op.id].moves[ai.rep ? ai.rep.mv : 'L5'] || { st: 13 }).st + 4));
      if (pk) { startCombo(ai, me, pk === 'L5' || pk === 'L2' ? [pk, 'H5', P.punish[0][2] || 'S'] : [pk, P.punish[1][1] || 'S'], L.confirm); return out(runPlan(ai, S, me, op, o) || 0); }
      setPlan(ai, [press(BK, 1), wait(1), press(BK, 1)]); return out(runPlan(ai, S, me, op, o) || 0);
    }
    if (o.st === 'atk' && dist < 150) { startCombo(ai, me, dist < 80 ? P.punish[0] : P.punish[1], 1); return out(runPlan(ai, S, me, op, o) || 0); }
    if (o.st === 'atk' && dist < 300 && P.farP) { setPlan(ai, [press(INPUT[P.farP])]); return out(runPlan(ai, S, me, op, o) || 0); }
  }
  if (me.st === 'air') return out(airPlay(ai, me, o, dist, P));
  if (!isActionable(me)) return out(ai.hold);

  // ---- reactions (on the delayed snapshot). One roll per opponent move, so reaction odds mean what they say.
  const oAtk = o.st === 'atk' && o.m && (o.m.hit || o.m.proj) && o.mf < o.m.st + o.m.ac;
  if (oAtk) {
    const key = o.mv + '@' + (S.frame - ai.delay - o.mf);
    if (ai.rkey !== key) { ai.rkey = key; ai.rval = rng(); ai.rval2 = rng(); }
    const reach = o.m.hit ? o.m.hit[2] + 40 : 0;
    if (o.m.proj && o.mf <= o.m.proj.at + 2 && dist > 90) { // a projectile is coming out
      if (ai.rval < L.block * 0.9) {
        if (me.id === 'sayo' && ai.rval2 > 0.88 && dist < 330) { setPlan(ai, [press(B.SP), { k: 'free', max: 40 }]); startFollow(ai, me); return out(runPlan(ai, S, me, op, o)); }
        return out(BK | B.D);
      }
    }
    if (!o.m.proj && dist < reach + 30) {
      if (me.id === 'sayo' && o.m.h !== 'throw' && o.mf + 6 < o.m.st && ai.rval2 < L.block * 0.25) { setPlan(ai, [press(BK | B.SP)]); return out(runPlan(ai, S, me, op, o)); }
      if (o.m.h === 'throw') { if (ai.rval < L.block * 0.4) { setPlan(ai, [press(B.U), wait(30)]); return out(runPlan(ai, S, me, op, o)); } }
      else if (ai.rval < L.block || (o.m.armor && L.read > 0)) return out(BK | (o.m.h === 'over' ? 0 : o.m.h === 'low' ? B.D : (ai.hold & B.D))); // never poke into armour
    }
  }
  // Suzu reads Sayo's vanish: Arc Field covers both sides just as she reappears
  if (me.id === 'suzu' && o.st === 'atk' && o.m && o.m.tp && o.mf <= 3) {
    const key = 'tr' + (S.frame - ai.delay - o.mf);
    if (ai.trkey !== key) { ai.trkey = key; if (rng() < L.read * 0.7) { setPlan(ai, [press(BK | B.SP)]); return out(runPlan(ai, S, me, op, o) || 0); } }
  }
  // a teleport just landed next to us: punish its recovery (once per teleport)
  if (o.st === 'atk' && o.m && o.m.tp && o.mf >= o.m.tp.at && o.mf < o.m.st + o.m.rc && dist < 110) {
    const key = 'tp' + (S.frame - ai.delay - o.mf);
    if (ai.tkey !== key) { ai.tkey = key; if (rng() < L.punish * 0.8) { startCombo(ai, me, me.id === 'suzu' && rng() < 0.5 ? ['bS'] : P.punish[0], 0); return out(runPlan(ai, S, me, op, o) || 0); } }
  }
  // spacing read: they keep walking in to throw the same attack, so stick a poke out as they arrive
  if (ai.rep && ai.rep.mv !== 'J' && (o.st === 'walk' || o.st === 'dash') && Math.sign(o.vx) === Math.sign(me.x - o.x)) {
    const rm = FIGHTERS[op.id].moves[ai.rep.mv];
    if (rm && rm.hit && !rm.grab && dist < rm.hit[2] + FIGHTERS[me.id].hw + 50 && dist > 40) {
      const key = 'sp' + Math.floor(S.frame / 20);
      if (ai.spkey !== key) {
        ai.spkey = key;
        if (rng() < L.read * 0.8) {
          const pk = bestPoke(me, op, dist, rm.st - 1); // only something that beats their move to the punch
          if (pk) { startCombo(ai, me, pk === 'L5' || pk === 'L2' ? [pk, 'H5', P.punish[0][2] || 'S'] : [pk, P.punish[1][1] || 'S'], L.confirm); return out(runPlan(ai, S, me, op, o) || 0); }
          ai.hold = BK | (guardLow(ai, rng) ? B.D : 0); ai.think = 10; return out(ai.hold); // nothing faster: let them come and block it
        }
      }
    }
  }
  // whiff punish: the player's attack is recovering in front of us without having touched us
  if (o.st === 'atk' && o.m && !o.m.proj && o.m.ac && o.mf >= o.m.st + o.m.ac && dist < 150) {
    const key = 'w' + o.mv + '@' + (S.frame - ai.delay - o.mf);
    if (ai.wkey !== key) {
      ai.wkey = key;
      const left = o.m.st + o.m.ac + o.m.rc - (o.mf + ai.delay);
      const p = L.whiff * (ai.rep && ai.rep.mv === o.mv ? 1.3 : 1);
      if (left >= 7 && rng() < p) { startCombo(ai, me, dist < 85 ? P.punish[0] : P.punish[1], L.confirm); return out(runPlan(ai, S, me, op, o) || 0); }
    }
  }
  // anti-air: one decision per jump
  if (o.air && o.st !== 'juggle' && o.st !== 'reset' && o.st !== 'ko' && dist < 200 && o.y > 20 && (Math.sign(o.vx) === Math.sign(me.x - o.x) || dist < 70)) {
    if (!ai.aaRoll || S.frame - ai.aaRoll > 50) { ai.aaRoll = S.frame; ai.aaGo = rng() < Math.max(L.aa, ai.rep && ai.rep.mv === 'J' ? L.read : 0); ai.aaMv = rng() < 0.7 ? P.aa[0] : P.aa[1]; }
    if (ai.aaGo && dist < 125 && o.y < 140 && o.vy < 3) { setPlan(ai, [press(INPUT[ai.aaMv])]); ai.aaGo = 0; return out(runPlan(ai, S, me, op, o)); }
    if (!ai.aaGo && dist < 140) return out(BK);
  }
  // incoming projectiles: one decision per projectile
  for (const p of S.proj) {
    if (p.owner === side || p.age < ai.delay || p.kind === 'mine') continue;
    const pd = Math.abs(p.x - me.x);
    if (Math.sign(p.vx) !== Math.sign(me.x - p.x) || pd > 230) continue;
    if (ai.pkey !== p.id) {
      ai.pkey = p.id; const r = rng();
      ai.pact = r < L.special * 0.45 ? 'jump' : r < L.special * 0.62 ? 'special' : 'block';
      if (p.vy > 0) ai.pact = 'block';
    }
    if (ai.pact === 'special') {
      const sp = { suzu: B.SP, sayo: rng() < 0.5 ? B.D | B.SP : B.SP, ganji: F | B.SP, rin: F | B.SP }[me.id];
      if (sp && pd < (me.id === 'ganji' ? 150 : me.id === 'suzu' ? 260 : me.id === 'rin' ? 110 : 160) && pd > (me.id === 'rin' ? 70 : 60)) { ai.pact = 'block'; setPlan(ai, [press(sp)]); return out(runPlan(ai, S, me, op, o)); }
      if (!sp) ai.pact = 'jump';
    }
    const jw = me.id === 'ganji' ? [128, 168] : [122, 190];
    if (ai.pact === 'jump' && pd < jw[1] && pd > jw[0]) { ai.pact = 'block'; setPlan(ai, [press(B.U | F, 2), wait(24)]); return out(runPlan(ai, S, me, op, o)); }
    if (pd < 150) return out(BK | B.D);
    break;
  }
  // a live enemy mine in front: pop it with a low kick, or hop it
  for (const p of S.proj) {
    if (p.owner === side || p.kind !== 'mine' || p.age < ai.delay) continue;
    const md = (p.x - me.x) * me.face;
    if (md > 0 && md < 130 && Math.abs(o.x - me.x) > md) {
      if (ai.mkey !== p.id) { ai.mkey = p.id; ai.mact = rng() < L.special * 0.85 ? (rng() < 0.6 ? 'pop' : 'hop') : 'walk'; }
      if (ai.mact === 'pop' && md < 92 && md > 40) { setPlan(ai, [press(B.D | B.LP)]); return out(runPlan(ai, S, me, op, o)); }
      if (ai.mact === 'hop' && md < 95) { setPlan(ai, [press(B.U | F, 2), wait(20)]); return out(runPlan(ai, S, me, op, o)); }
      if (ai.mact !== 'walk' && md < 95) return out(B.D);
    }
  }
  // ---- neutral decision
  if (ai.think > 0) { ai.think--; return out(ai.hold); }
  ai.think = Math.round(L.think[0] + rng() * (L.think[1] - L.think[0]));
  const band = dist < 95 ? 'close' : dist < 210 ? 'mid' : 'far';
  const w = { ...P[band] };
  if (band === 'mid' && ai.atkT && ai.atkT.filter((t) => S.frame - t < 150).length >= 4 && rng() < L.read) { w.walk = (w.walk || 0) * 0.3; w.dash = 0; w.wait = (w.wait || 0) + 2; }
  if (band === 'close' && ai.atkT && ai.atkT.filter((t) => S.frame - t < 150).length >= 4 && rng() < L.read) { w.combo = (w.combo || 0) * 0.4; w.L5 = (w.L5 || 0) + 1; }
  if (band === 'close') w.throw = (w.throw || 0) + Math.min(3, (me.blocks || 0) * L.throwBias * 2);
  if (o.st === 'down' || o.st === 'rise') { ai.hold = dist > P.pref[1] ? F : 0; return out(ai.hold); }
  if (me.meter >= 1000 && w.SU == null && P.superAfter) w.combo = (w.combo || 0) + 1;
  if (me.id === 'suzu' && S.proj.some((p) => p.owner === side && p.kind === 'bolt')) { w.S = 0; w.EXb = 0; }
  if (me.id === 'suzu' && S.proj.some((p) => p.owner === side && p.kind === 'mine')) w.dS = 0;
  if (me.meter < 500) w.EXb = 0;
  if (me.meter < 1000) w.SU = 0;
  if (op.id === 'suzu' && band === 'far') { w.walk = (w.walk || 0) + 2; w.dash = (w.dash || 0) + 1; if (me.id === 'sayo') w.S = (w.S || 0) + 0.5; }
  if (S.proj.some((p) => p.owner !== side && p.kind === 'mine' && (p.x - me.x) * me.face > 0 && (p.x - me.x) * me.face < 160)) { w.dash = 0; }
  const act = pick(rng, w);
  ai.hold = 0;
  if (band === 'close' && op.st !== 'down' && rng() < L.guess * (op.id === 'ganji' ? 0.7 : 0.35)) { // respect the throw: jab, back off or jump
    const r = rng();
    if (r < 0.4) setPlan(ai, [press(B.LP)]); else if (r < 0.65) setPlan(ai, [press(BK, 1), wait(1), press(BK, 1)]); else if (r < 0.8) setPlan(ai, [press(B.U | BK, 2)]); else { ai.hold = BK | B.D; return out(ai.hold); }
    return out(runPlan(ai, S, me, op, o) || 0);
  }
  const reachO = FIGHTERS[op.id].moves.H5.hit[2] + FIGHTERS[me.id].hw + 36;
  if (dist < reachO && (o.st === 'idle' || o.st === 'walk' || o.st === 'crouch' || o.st === 'dash' || o.st === 'atk') && op.st !== 'down') {
    const busy = ai.atkT && ai.atkT.filter((t) => S.frame - t < 150).length >= 4; // the player is pressing a lot: guard and punish
    let g = L.guard + (ai.rep && ai.rep.mv !== 'J' ? L.read * 0.35 : 0) + (busy ? L.read * 0.45 : 0);
    if (dist > P.pref[1] && !busy) g *= 0.35; // we want to be closer than this: keep pressing in rather than sitting in block
    if (ai.rep && ai.rep.h === 'throw' && dist < 120 && rng() < L.read) { // they keep grabbing: do not sit in block, poke or step out
      if (rng() < 0.55) setPlan(ai, [press(B.LP)]); else setPlan(ai, [press(BK, 1), wait(1), press(BK, 1)]);
      return out(runPlan(ai, S, me, op, o) || 0);
    }
    if (rng() < g) { ai.hold = BK | (guardLow(ai, rng) ? B.D : 0); return out(ai.hold); }
  }
  switch (act) {
    case 'walk': ai.hold = F; break;
    case 'back': ai.hold = BK; break;
    case 'wait': ai.hold = rng() < 0.4 + L.guard * 0.5 ? BK | (guardLow(ai, rng) ? B.D : 0) : 0; break;
    case 'dash': setPlan(ai, [press(F, 1), wait(1), press(F, 1)]); break;
    case 'backdash': setPlan(ai, [press(BK, 1), wait(1), press(BK, 1)]); break;
    case 'jump': setPlan(ai, [press(B.U | F, 2)]); break;
    case 'throw': if (dist < 72) setPlan(ai, [press(B.LP | B.HP)]); else setPlan(ai, [press(F, 6), press(B.LP | B.HP)]); break;
    case 'combo': if (dist > 85) ai.hold = F; else startCombo(ai, me, P.combos[Math.floor(rng() * P.combos.length)], L.confirm); break;
    case 'EXb': setPlan(ai, [press(B.SP | B.HP)]); break;
    default: if (INPUT[act] != null) setPlan(ai, [press(INPUT[act])]); if (me.id === 'sayo' && act === 'S') { ai.plan.push({ k: 'free', max: 40 }); startFollow(ai, me); } break;
  }
  if (ai.plan.length) return out(runPlan(ai, S, me, op, o) || 0);
  return out(ai.hold);
}

// Crouch or stand guard: follow the heights the player has actually been using (a read, not an input peek).
function guardLow(ai, rng) {
  if (ai.rep && ai.rep.h === 'over') return false;
  if (ai.rep && ai.rep.h === 'low') return true;
  const h = ai.hts || []; const over = h.filter((x) => x === 'over').length, low = h.filter((x) => x === 'low').length;
  if (ai.L.read > 0 && over > low) return rng() < 0.25;
  if (ai.L.read > 0 && low > over) return rng() < 0.9;
  return rng() < 0.65;
}
// The fastest grounded normal or special whose hitbox reaches the opponent from here.
function bestPoke(me, op, dist, maxSt) {
  const mv = FIGHTERS[me.id].moves, reach = FIGHTERS[op.id].hw;
  let best = null;
  for (const k of ['L5', 'L2', 'H5', 'H2', 'S', 'fS', 'dS']) {
    const m = mv[k]; if (!m || !m.hit || m.grab || m.tp || m.cost || m.st + 1 > maxSt) continue;
    const travel = m.vel ? m.vel.reduce((a, v) => a + Math.max(0, Math.min(m.st, v[1]) - v[0]) * v[2], 0) : 0;
    if (m.hit[2] + reach + travel - 4 < dist) continue;
    if (!best || m.st < mv[best].st) best = k;
  }
  return best;
}
// Remember the player's last six actions; a move used three or more times becomes a read.
function trackPattern(ai, S, o) {
  let act = null, key = null;
  if (o.st === 'atk' && o.mv && o.mf <= 2) { key = o.mv + '@' + (S.frame - ai.delay - o.mf); act = o.mv; }
  else if (o.st === 'jsq') { key = 'J@' + Math.floor((S.frame - ai.delay) / 20); act = 'J'; }
  if (!act || key === ai.lastAct) return;
  ai.lastAct = key;
  if (act !== 'J' && !(o.m && o.m.proj)) { ai.atkT = (ai.atkT || []).filter((t) => S.frame - t < 150); ai.atkT.push(S.frame); } // zoning is not button-mashing
  ai.recent = (ai.recent || []).concat(act).slice(-6);
  if (act !== 'J' && o.m) ai.hts = (ai.hts || []).concat(o.m.h).slice(-8); // heights the player has been using
  const cnt = {}; let best = null;
  for (const a of ai.recent) { cnt[a] = (cnt[a] || 0) + 1; if (cnt[a] >= 3 && (!best || cnt[a] > cnt[best])) best = a; }
  ai.rep = best ? { mv: best, h: best === 'J' ? 'over' : o.m && o.mv === best ? o.m.h : (ai.rep && ai.rep.mv === best ? ai.rep.h : 'mid') } : null;
}
function airPlay(ai, me, o, dist, P) {
  // one air attack per jump, timed on the way down
  if (me.airUsed) return 0;
  const L = ai.L;
  if (me.id === 'rin' && me.vy < 2 && me.y > 50 && dist < 150 && dist > 40 && ai.rng() < 0.25 * L.special) return B.SP;
  if (me.vy < 0 && me.y < 110 && dist < 110) return ai.rng() < 0.6 ? B.HP : B.LP;
  return 0;
}

function press(b, n = 2, mv = null) { return { k: 'press', b, n, mv }; }
function wait(n) { return { k: 'wait', n }; }
function setPlan(ai, steps) { ai.plan = steps; ai.pi = 0; ai.pt = 0; }
function startCombo(ai, me, seq, confirm) {
  const steps = [];
  const L = ai.L;
  if (ai.rng() > L.combo) seq = seq.slice(0, 1 + Math.floor(ai.rng() * (seq.length - 1)));
  seq.forEach((id, i) => {
    let mv = id;
    if (i === seq.length - 1 && i > 0) {
      const P = PLAN[me.id];
      if (P.exEnder && me.meter >= 500 && ai.rng() < 0.4) mv = P.exEnder;
    }
    steps.push(press(INPUT[mv], 2, mv));
    if (i < seq.length - 1) {
      const nextSpecial = /S|EX/.test(seq[i + 1]);
      steps.push({ k: 'contact', mv, max: 30, confirm: nextSpecial && ai.rng() < confirm });
    }
  });
  const P = PLAN[me.id];
  if (P.superAfter && seq[seq.length - 1] === P.superAfter && me.meter >= 1000) { steps.push({ k: 'contact', mv: P.superAfter, max: 30, confirm: true }); steps.push(press(INPUT.SU, 2, 'SU')); }
  setPlan(ai, steps);
}
function startFollow(ai, me) { // after a teleport: an immediate mix-up
  const r = ai.rng(); const seq = r < 0.45 ? ['L2', 'H5', 'dS'] : r < 0.75 ? ['L5', 'H5', 'dS'] : ['TH'];
  const keep = ai.plan; startCombo(ai, me, seq, ai.L.confirm); ai.plan = keep.concat(ai.plan); ai.pi = 0; ai.pt = 0;
}
function runPlan(ai, S, me, op, o) {
  while (ai.pi < ai.plan.length) {
    const s = ai.plan[ai.pi];
    if (s.k === 'press') {
      if (ai.pt < s.n) { ai.pt++; return s.b; }
      // keep the direction held until the move comes out (presses buffered during hit-stop)
      if (s.mv && ai.pt < s.n + 12 && !(me.st === 'atk' && me.mv === s.mv)) { ai.pt++; return s.b & ~(B.LP | B.HP | B.SP); }
      if (!s.rel) { s.rel = 1; return 0; } // release frame
      s.rel = 0; ai.pi++; ai.pt = 0; continue;
    }
    if (s.k === 'wait') { if (ai.pt < s.n) { ai.pt++; return ai.hold & ~(B.LP | B.HP | B.SP); } ai.pi++; ai.pt = 0; continue; }
    if (s.k === 'free') { ai.pt++; if (isActionable(me) || ai.pt > s.max) { ai.pi++; ai.pt = 0; continue; } return 0; }
    if (s.k === 'contact') {
      ai.pt++;
      if (me.st === 'atk' && me.contact && (!s.mv || me.mv === s.mv)) {
        if (s.confirm && !me.contactHit) { ai.plan = []; return null; }
        ai.pi++; ai.pt = 0; continue;
      }
      if ((me.st !== 'atk' && me.st !== 'grab') || ai.pt > s.max) { ai.plan = []; return null; }
      return 0;
    }
    ai.pi++;
  }
  ai.plan = []; ai.pi = 0; ai.pt = 0;
  return null;
}
function resolve(bits, me) {
  let b = bits & 0xff;
  if (bits & F) b |= me.face > 0 ? B.R : B.L;
  if (bits & BK) b |= me.face > 0 ? B.L : B.R;
  return b;
}
export { PLAN, INPUT };
