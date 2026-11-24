// NEON KUMITE · simulation tests. Run: node src/games/kumite/test.mjs [matches=400] [level=4]
// 1) CPU vs CPU matches across all pairings at the hardest AI level: no exceptions, NaNs, stuck states or infinite combos
// 2) win rates per character inside 35-65% (matrix printed)
// 3) per-frame invariants: in bounds, no pushbox overlap, health never rises mid-round
// 4) frame data sums, every move runs for exactly its frame count, every special comes out from its documented input
// plus mechanics checks: blocking by height, throws beat block, throw tech, juggle limit, meter costs.
import { createMatch, step, B, STAGE_L, STAGE_R, isAir, moveOf } from './sim.js';
import { FIGHTERS, ROSTER, INPUT_OF, moveTotal } from './data.js';
import { createAI, aiInput } from './ai.js';

const MATCHES = +(process.argv[2] || 400), LEVEL = +(process.argv[3] || 4);
let fails = 0; const fail = (m) => { fails++; console.log('  FAIL ' + m); };
const ok = (c, m) => { if (!c) fail(m); };
const t0 = Date.now();

// ---------------------------------------------------------------- 4) frame data
console.log('[4] frame data and inputs');
for (const id of ROSTER) {
  const ch = FIGHTERS[id];
  for (const [k, m] of Object.entries(ch.moves)) {
    for (const f of ['st', 'ac', 'rc', 'dmg']) ok(Number.isInteger(m[f]) && m[f] >= 0, `${id}.${k}.${f} = ${m[f]}`);
    ok(moveTotal(m) === m.st + m.ac + m.rc && moveTotal(m) > 0, `${id}.${k} total`);
    if (m.hits > 1) ok(m.gap && (m.hits - 1) * m.gap < m.ac, `${id}.${k} hits fit in active (${m.hits}x${m.gap} vs ${m.ac})`);
    if (m.proj) ok(m.proj.at <= m.st + m.ac && m.proj.at >= 1, `${id}.${k} projectile spawns inside the move`);
    for (const w of [...(m.inv || []), ...(m.armor || [])]) ok(w[0] <= w[1] && w[1] <= moveTotal(m), `${id}.${k} window ${w} inside move`);
    if (m.hit) ok(m.hit[0] < m.hit[2] && m.hit[1] < m.hit[3], `${id}.${k} hitbox well formed`);
    if (m.grab) ok(m.grab.rel < m.grab.dur, `${id}.${k} grab releases before it ends`);
    if (m.tier >= 3 && k !== 'VS') ok(INPUT_OF[k], `${id}.${k} has a documented input`);
  }
  // each documented move comes out from its input, and ground moves last exactly st+ac+rc frames on whiff
  for (const k of Object.keys(INPUT_OF)) {
    const m = ch.moves[k]; if (!m) continue;
    const S = createMatch({ p1: id, p2: 'rin', training: true });
    const f = S.f[0]; f.x = 200; S.f[1].x = 900; f.meter = m.cost || 0;
    const fwd = B.R, back = B.L;
    const inp = INPUT_OF[k];
    let bits = 0;
    if (inp.includes('L')) bits |= B.LP; if (inp.includes('H')) bits |= B.HP; if (inp.includes('S')) bits |= B.SP;
    if (inp.startsWith('f+')) bits |= fwd; if (inp.startsWith('b+')) bits |= back; if (inp.startsWith('d+')) bits |= B.D;
    if (inp.startsWith('air')) { step(S, B.U, 0); for (let i = 0; i < 9; i++) step(S, 0, 0); }
    if (k === 'L2' || k === 'H2' || k === 'dS') { step(S, B.D, 0); }
    step(S, bits, 0);
    ok(f.st === 'atk' && f.mv === k, `${id} ${k}: input "${inp}" gave ${f.st}:${f.mv}`);
    if (!m.air && f.st === 'atk' && f.mv === k && !m.tp) {
      // count the frames the move is on screen and running; super/EX freeze and hit-stop frames do not advance a move
      let n = 0, first = -1, guard = 0;
      while (f.st === 'atk' && f.mv === k && guard++ < 600) {
        const frozen = S.freeze > 0 || f.hs > 0;
        if (!frozen) { n++; if (first < 0 && m.ac && f.mf === m.st) first = n; }
        step(S, k === 'L2' || k === 'H2' ? B.D : 0, 0);
      }
      ok(n === moveTotal(m), `${id} ${k}: ran ${n} frames, data says ${moveTotal(m)}`);
      if (m.ac && !m.grab) ok(first === m.st + 1, `${id} ${k}: first active frame ${first}, expected ${m.st + 1}`);
    }
  }
}

// ---------------------------------------------------------------- mechanics
console.log('[+] mechanics');
function duel(p1, p2, gap = 60) { const S = createMatch({ p1, p2, training: true }); S.f[0].x = 500; S.f[1].x = 500 + gap; S.refill = false; return S; }
function run(S, a, b, n) { for (let i = 0; i < n; i++) step(S, typeof a === 'function' ? a(i) : a, typeof b === 'function' ? b(i) : b); }
function evs(S, a, b, n) { const out = []; for (let i = 0; i < n; i++) { step(S, typeof a === 'function' ? a(i) : a, typeof b === 'function' ? b(i) : b); out.push(...S.events.map((e) => e.t)); } return out; }
{ // low must be crouch-blocked; overhead must be stand-blocked
  let S = duel('rin', 'ganji', 70); let e = evs(S, (i) => (i === 0 ? B.D | B.LP : B.D), B.R, 20); ok(e.includes('hit'), 'low hits a standing blocker');
  S = duel('rin', 'ganji', 70); e = evs(S, (i) => (i === 0 ? B.D | B.LP : B.D), B.R | B.D, 20); ok(e.includes('block') && !e.includes('hit'), 'low is blocked crouching');
  S = duel('rin', 'ganji', 70); e = evs(S, (i) => (i === 0 ? B.R | B.SP : 0), B.R | B.D, 40); ok(e.includes('hit'), 'overhead (Spoke Drop) beats crouch block');
  S = duel('rin', 'ganji', 80); e = evs(S, (i) => (i === 0 ? B.R | B.SP : 0), B.R, 40); ok(e.includes('block'), 'overhead is stand-blocked');
  S = duel('rin', 'ganji', 60); e = evs(S, (i) => (i === 0 ? B.LP | B.HP : 0), B.R | B.D, 50); ok(e.includes('grab') && S.f[1].hp < S.f[1].maxhp, 'throw beats block');
  S = duel('rin', 'ganji', 60); e = evs(S, (i) => (i === 0 ? B.LP | B.HP : 0), (i) => (i === 4 ? B.LP | B.HP : 0), 50); ok(e.includes('tech') && S.f[1].hp === S.f[1].maxhp, 'throw tech');
  S = duel('ganji', 'rin', 60); e = evs(S, (i) => (i === 0 ? B.SP : 0), (i) => (i === 4 ? B.LP | B.HP : B.L), 70); ok(e.includes('grab') && !e.includes('tech') && S.f[1].hp < S.f[1].maxhp, 'command grab cannot be teched');
  S = duel('rin', 'ganji', 60); S.f[0].meter = 400; e = evs(S, (i) => (i === 0 ? B.SP | B.HP : 0), 0, 3); ok(S.f[0].mv !== 'EX', 'EX needs half a meter');
  S = duel('rin', 'ganji', 60); S.f[0].meter = 1000; run(S, (i) => (i === 0 ? B.LP | B.HP | B.SP : 0), 0, 1); ok(S.f[0].mv === 'SU' && S.f[0].meter < 100 && S.freeze > 50, 'super spends the meter and freezes the screen');
  // kara upgrade: Light then Heavy one frame later becomes a throw
  S = duel('rin', 'ganji', 60); run(S, (i) => (i === 0 ? B.LP : i === 1 ? B.LP | B.HP : 0), 0, 2); ok(S.f[0].mv === 'TH', 'L then H a frame later upgrades to a throw');
  // juggle limit: launcher, then keep hitting the falling opponent with launchers: it must stop counting after the limit
  S = duel('ganji', 'rin', 50); let maxJ = 0; for (let i = 0; i < 160; i++) { step(S, i % 8 === 0 ? B.D | B.HP : 0, 0); maxJ = Math.max(maxJ, S.f[1].jug); } ok(maxJ <= 3, 'juggle points never pass the limit');
  // counter hit adds damage
  S = duel('rin', 'ganji', 70); e = evs(S, (i) => (i === 3 ? B.LP : 0), (i) => (i === 0 ? B.HP : 0), 30); ok(e.includes('counter'), 'a jab during a heavy\'s startup is a counter hit');
  { const A = duel('rin', 'ganji', 70); run(A, (i) => (i === 3 ? B.LP : 0), 0, 30); const C = duel('rin', 'ganji', 70); run(C, (i) => (i === 3 ? B.LP : 0), (i) => (i === 0 ? B.HP : 0), 30);
    ok(C.f[1].maxhp - C.f[1].hp > A.f[1].maxhp - A.f[1].hp, 'counter hits deal more damage'); }
  // corner pushback: defender in the corner, attacker gets pushed out
  S = duel('rin', 'ganji', 60); S.f[1].x = STAGE_R - 34; S.f[0].x = STAGE_R - 34 - 62; const ax0 = S.f[0].x; run(S, (i) => (i === 0 ? B.HP : 0), B.R, 30); ok(S.f[0].x < ax0 - 5, 'corner pushback moves the attacker');
}

// ---------------------------------------------------------------- 1-3) CPU matches
console.log(`[1-3] ${MATCHES} CPU vs CPU matches at level ${LEVEL}`);
const pairs = []; for (const a of ROSTER) for (const b of ROSTER) pairs.push([a, b]);
const wins = {}, games = {}, mat = {}; for (const a of ROSTER) { wins[a] = 0; games[a] = 0; for (const b of ROSTER) mat[a + b] = [0, 0]; }
let frames = 0, maxCombo = 0, maxComboMeter = 0, timeouts = 0, rounds = 0, perfects = 0, draws = 0;
const NUM = ['x', 'y', 'vx', 'vy', 'hp', 'meter', 'mf', 'sf', 'pv'];
for (let n = 0; n < MATCHES; n++) {
  const [p1, p2] = pairs[n % pairs.length];
  const S = createMatch({ p1, p2, stage: ['viaduct', 'alley', 'roof'][n % 3] });
  const a = createAI(LEVEL, 1000 + n * 2), b = createAI(LEVEL, 1001 + n * 2);
  const hpPrev = [S.f[0].hp, S.f[1].hp]; let round = S.round; const stuck = [{ st: '', n: 0 }, { st: '', n: 0 }];
  let k = 0;
  try {
    while (S.phase !== 'match') {
      step(S, aiInput(a, S, 0), aiInput(b, S, 1)); k++;
      if (S.round !== round) { round = S.round; hpPrev[0] = S.f[0].hp; hpPrev[1] = S.f[1].hp; }
      for (let i = 0; i < 2; i++) {
        const f = S.f[i], c = FIGHTERS[f.id];
        for (const key of NUM) if (!Number.isFinite(f[key])) { fail(`match ${n} frame ${k}: ${f.id}.${key} = ${f[key]}`); throw new Error('nan'); }
        if (f.x < STAGE_L + c.hw - 0.01 || f.x > STAGE_R - c.hw + 0.01) { fail(`match ${n} frame ${k}: ${f.id} out of bounds x=${f.x}`); throw new Error('bounds'); }
        if (f.y < -0.01) { fail(`match ${n}: ${f.id} below the floor`); throw new Error('floor'); }
        if (f.hp > hpPrev[i]) { fail(`match ${n} frame ${k}: ${f.id} health rose ${hpPrev[i]} -> ${f.hp}`); throw new Error('hp'); }
        hpPrev[i] = f.hp;
        const st = f.st + (f.mv || ''); if (st === stuck[i].st && !['idle', 'walk', 'crouch', 'guard', 'dead', 'win', 'lose'].includes(f.st)) stuck[i].n++; else { stuck[i].st = st; stuck[i].n = 0; }
        if (stuck[i].n > 600) { fail(`match ${n}: ${f.id} stuck in ${st}`); throw new Error('stuck'); }
      }
      const [f0, f1] = S.f;
      const skip = ['held', 'grab', 'dead', 'ko', 'juggle', 'down'].includes(f0.st) || ['held', 'grab', 'dead', 'ko', 'juggle', 'down'].includes(f1.st);
      if (!skip && !isAir(f0) && !isAir(f1) && f0.y === 0 && f1.y === 0) {
        const need = FIGHTERS[f0.id].hw + FIGHTERS[f1.id].hw;
        if (Math.abs(f0.x - f1.x) < need - 0.5) { fail(`match ${n} frame ${k}: pushboxes overlap (${Math.abs(f0.x - f1.x).toFixed(1)} < ${need})`); throw new Error('overlap'); }
      }
      if (k > 40000) { fail(`match ${n}: never ended`); throw new Error('long'); }
    }
  } catch (e) { if (!['nan', 'bounds', 'floor', 'hp', 'stuck', 'overlap', 'long'].includes(e.message)) { fail(`match ${n} threw: ${e.stack}`); } continue; }
  frames += k; rounds += S.rounds.length; perfects += S.rounds.filter((r) => r.perfect).length; timeouts += S.rounds.filter((r) => r.hp[0] > 0 && r.hp[1] > 0).length;
  for (let i = 0; i < 2; i++) {
    const def = S.f[1 - i];
    maxCombo = Math.max(maxCombo, S.log.maxCombo[i] / def.maxhp); maxComboMeter = Math.max(maxComboMeter, S.log.maxComboSpent[i] / def.maxhp);
    if (S.log.maxCombo[i] >= 0.6 * def.maxhp) fail(`match ${n}: ${S.f[i].id} did a meterless combo of ${S.log.maxCombo[i]} on ${def.id}`);
  }
  const w = S.result.winner;
  if (w < 0) draws++;
  if (p1 !== p2) { games[p1]++; games[p2]++; if (w === 0) { wins[p1]++; mat[p1 + p2][0]++; } else if (w === 1) { wins[p2]++; mat[p2 + p1][0]++; } mat[p1 + p2][1]++; mat[p2 + p1][1]++; }
}
console.log(`    ${MATCHES} matches, ${rounds} rounds, ${(frames / 60 / 60).toFixed(0)} sim-minutes, ${timeouts} time-outs, ${perfects} perfects, ${draws} drawn matches`);
console.log(`    biggest meterless combo ${(maxCombo * 100).toFixed(1)}% of health, biggest with meter ${(maxComboMeter * 100).toFixed(1)}%`);
console.log('    win rate (row beats column, mirrors excluded):');
console.log('            ' + ROSTER.map((r) => r.padStart(7)).join('') + '   overall');
for (const a of ROSTER) {
  const row = ROSTER.map((b) => (a === b ? '     --' : String(Math.round((100 * mat[a + b][0]) / Math.max(1, mat[a + b][1]))).padStart(6) + '%')).join('');
  const r = wins[a] / Math.max(1, games[a]);
  console.log('    ' + a.padEnd(8) + row + '   ' + (100 * r).toFixed(1) + '%');
  ok(r >= 0.35 && r <= 0.65, `${a} overall win rate ${(100 * r).toFixed(1)}% outside 35-65%`);
}
console.log(`\n${fails ? fails + ' CHECKS FAILED' : 'ALL KUMITE CHECKS PASSED'} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(fails ? 1 : 0);
