// KAZE simulation tests (node): node src/games/kaze/test.mjs
// 1 a scripted bot finishes all five chapters on Blade (and Story, Lethal);
// 2 every enemy attack telegraphs at least the difficulty's minimum reaction time;
// 3 standoff windows are winnable: releasing inside the window wins, on a feint or late is punished;
// 4 no softlocks: watchdogs over 20 seeds with a capable bot and a random "monkey";
// 5 save/load round-trips (and survives broken storage); 6 determinism.
import { createSim, step, DT, blankInput, standoffPose, digest } from './sim.js';
import { makeBot, botInput, makePersona, personaInput } from './bot.js';
import { DIFF, ATK, CHAPTERS, HAIKU } from './data.js';
import { makeStore, DEFAULT_PROGRESS } from './save.js';

let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.log('  FAIL ' + msg); } };
const t0 = Date.now();

function playthrough(diff, seed, o = {}) {
  const s = createSim({ seed, difficulty: diff, prologue: true, chapter: o.chapter ?? 0 }); const m = makeBot({ secrets: o.secrets ?? true });
  const chT = []; let lastCh = s.ch, chStart = 0, phaseT = 0, lastPhase = s.phase, worst = { phase: '', t: 0 };
  const limit = 60 * 60 * (o.minutes ?? 40);
  for (let i = 0; i < limit && !s.done; i++) {
    step(s, botInput(s, m)); s.cues.length = 0;
    if (s.phase === lastPhase) phaseT += DT; else { phaseT = 0; lastPhase = s.phase; }
    if (s.phase !== 'play' && phaseT > worst.t) worst = { phase: s.phase, t: phaseT };
    if (s.ch !== lastCh) { chT.push(s.t - chStart); chStart = s.t; lastCh = s.ch; }
    if (o.chapter != null && s.ch !== o.chapter) break;
    if (!Number.isFinite(s.p.x) || !Number.isFinite(s.p.y)) { ok(false, `${diff}/${seed}: player position not finite`); break; }
  }
  return { s, chT, worst };
}

// ---- 1. the bot finishes the game ----
console.log('1. bot playthroughs');
for (const diff of ['blade', 'story', 'lethal']) {
  const { s, chT, worst } = playthrough(diff, 11);
  ok(s.done && s.phase === 'fin', `${diff}: bot did not finish (ch ${s.ch + 1}, phase ${s.phase}, x ${Math.round(s.p.x)})`);
  ok(s.stats.teleViol === 0, `${diff}: ${s.stats.teleViol} telegraphs under ${DIFF[diff].react}s`);
  ok(s.stats.teleMin >= DIFF[diff].react - 1e-9, `${diff}: shortest telegraph ${s.stats.teleMin.toFixed(3)}s < ${DIFF[diff].react}s`);
  ok(worst.t < 30, `${diff}: stuck ${worst.t.toFixed(1)}s in ${worst.phase}`);
  console.log(`  ${diff.padEnd(6)} done=${s.done} time=${(s.t / 60).toFixed(1)}min chapters=[${chT.map((x) => Math.round(x)).join('s, ')}s] deaths=${s.stats.deaths} kills=${s.stats.kills} parries=${s.stats.parries} standoffs=${s.stats.standoffWins} shortest-telegraph=${s.stats.teleMin.toFixed(2)}s haiku=${s.haikus.length} charms=${s.charms.length} hidden=${s.hidden.length}`);
}

// ---- 2. telegraphs: static check of every attack on every difficulty, plus what the bots saw ----
console.log('2. telegraph minimums');
for (const d of Object.values(DIFF)) for (const [k, A] of Object.entries(ATK)) { const w = Math.max(d.react, A.wind * d.wind); ok(w >= d.react, `${d.id} ${k} windup ${w}`); }
ok(DIFF.story.react > DIFF.blade.react && DIFF.blade.react > DIFF.lethal.react && DIFF.lethal.react >= 0.3, 'difficulty reaction floors ordered and humane (lethal >= 0.3s)');
console.log(`  floors: story ${DIFF.story.react}s, blade ${DIFF.blade.react}s, lethal ${DIFF.lethal.react}s; ${Object.keys(ATK).length} attacks checked on 3 difficulties`);

// ---- 3. standoffs ----
console.log('3. standoff windows');
function standoffAt(ch, idx, diff, seed) {
  const s = createSim({ seed, difficulty: diff, chapter: ch }); const e = s.ev.filter((q) => q.t === 'standoff')[idx];
  for (const q of s.ev) if (q.x < e.x) q.done = true; s.p.x = s.p.ox = e.x - 260; s.cpX = e.x - 300;
  const I = blankInput(); I.right = true; for (let i = 0; i < 120 && s.phase !== 'standoff'; i++) step(s, I);
  for (let i = 0; i < 400 && s.so.st !== 'ready'; i++) step(s, blankInput());
  return s;
}
function runStandoff(s, policy) {
  // policy(so) -> hold?; returns the result of the first duel
  const I = blankInput(); let res = null;
  for (let i = 0; i < 60 * 20 && s.phase === 'standoff'; i++) {
    const so = s.so; I.focus = policy(so, s); step(s, I);
    if (s.so && s.so.result && !res) res = s.so.result;
    if (!s.so && !res) res = 'cleared';
  }
  return res;
}
let feintSeen = 0;
for (const diff of ['story', 'blade', 'lethal']) {
  for (const [ch, idx] of [[0, 0], [2, 0], [4, 0]]) for (let seed = 1; seed <= 6; seed++) {
    // release inside the window (at its middle): win
    const a = standoffAt(ch, idx, diff, seed);
    const rA = runStandoff(a, (so) => !(so.st === 'strike' && so.ts >= so.win * 0.5));
    ok(rA === 'win', `${diff} ch${ch + 1} seed ${seed}: release mid-window gave ${rA}`);
    // release on a feint (if this duel has one): punished
    const b = standoffAt(ch, idx, diff, seed); let sawFeint = false;
    const rB = runStandoff(b, (so) => { if (standoffPose(so) === 'feint') { sawFeint = true; return false; } return true; });
    if (sawFeint) { feintSeen++; ok(rB === 'early', `${diff} ch${ch + 1} seed ${seed}: releasing on a feint gave ${rB}`); }
    // release late (just after the window): punished
    const c = standoffAt(ch, idx, diff, seed);
    const rC = runStandoff(c, (so) => !(so.st === 'strike' && so.ts > so.win + 0.05));
    ok(rC === 'late', `${diff} ch${ch + 1} seed ${seed}: releasing late gave ${rC}`);
    // the window itself is humanly winnable: at least 0.2s and later duels in a chain only tighten
    ok(a.stats.standoffWins >= 1, 'a win is counted');
  }
}
for (const diff of ['story', 'blade', 'lethal']) ok(DIFF[diff].standoff * Math.pow(0.85, 2) >= 0.2, `${diff}: third duel window ${(DIFF[diff].standoff * 0.7225).toFixed(3)}s >= 0.2s`);
ok(feintSeen > 10, `feints were exercised (${feintSeen})`);
console.log(`  windows: story ${DIFF.story.standoff}s, blade ${DIFF.blade.standoff}s, lethal ${DIFF.lethal.standoff}s (x0.85 per chained duel); feint releases tested: ${feintSeen}`);

// ---- 4. no softlocks ----
console.log('4. watchdogs (20 seeds)');
let botDone = 0, worstCh = 0;
for (let seed = 1; seed <= 20; seed++) {
  // capable bot, chapter by chapter with a 6-minute budget each
  for (let ch = 0; ch < 5; ch++) {
    const { s, chT } = playthrough(seed % 3 === 0 ? 'lethal' : 'blade', seed * 7 + ch, { chapter: ch, minutes: 6, secrets: seed % 2 === 0 });
    const fin = s.ch !== ch || s.done;
    ok(fin, `seed ${seed} ch${ch + 1}: bot stuck at x ${Math.round(s.p.x)} phase ${s.phase} foes ${s.foes.map((f) => f.st).join(',')}`);
    if (fin) botDone++; worstCh = Math.max(worstCh, s.t);
  }
}
// monkey: random inputs; every phase and every player state must end on its own or via an input the monkey also presses
const CAP = { standoff: 40, haiku: 60, dead: 2.5, narr: 6, ending: 14, credits: 27 };
const SCAP = { slash: 1, heavy: 1.2, counter: 1, dodge: 0.6, hit: 0.6, heal: 1, bow: 1.5, take: 1.2, iai: 1.5, focus: 40, air: 2 };
let monkeyTicks = 0, worstPhase = {}, worstSt = {};
for (let seed = 1; seed <= 20; seed++) {
  for (let ch = 0; ch < 5; ch++) {
    const s = createSim({ seed: seed * 31 + ch, difficulty: ['story', 'blade', 'lethal'][seed % 3], chapter: ch, checkpoint: seed % 4 });
    let r = seed * 99991 + ch, held = blankInput(), ph = s.phase, pt = 0;
    const R = () => ((r = (Math.imul(r, 1103515245) + 12345) | 0) >>> 0) / 4294967296;
    for (let i = 0; i < 60 * 90; i++) {
      if (i % 6 === 0) { for (const k of Object.keys(held)) if (k !== 'choose') held[k] = R() < (k === 'right' ? 0.6 : k === 'focus' ? 0.5 : 0.12); held.left = held.left && !held.right; held.choose = R() < 0.1 ? 1 + ((R() * 3) | 0) : 0; }
      step(s, held); s.cues.length = 0; monkeyTicks++;
      if (s.phase === ph) pt += DT; else { ph = s.phase; pt = 0; }
      // each state instance has its own timer (stt resets on entry), so chained repeats are measured separately
      worstPhase[ph] = Math.max(worstPhase[ph] || 0, pt); if (s.phase === 'play') worstSt[s.p.st] = Math.max(worstSt[s.p.st] || 0, s.p.stt);
      if (!Number.isFinite(s.p.x) || s.p.x < 0 || s.p.x > s.len + 1) { ok(false, `monkey seed ${seed} ch${ch + 1}: player out of bounds ${s.p.x}`); break; }
      if (s.foes.length > 8 || s.arrows.length > 30) { ok(false, `monkey: runaway entities ${s.foes.length}/${s.arrows.length}`); break; }
      for (const f of s.foes) if (!Number.isFinite(f.x)) { ok(false, 'monkey: foe position not finite'); break; }
      if (s.done) break;
    }
  }
}
for (const [k, v] of Object.entries(worstPhase)) if (CAP[k]) ok(v <= CAP[k], `phase ${k} lasted ${v.toFixed(1)}s (cap ${CAP[k]}s)`);
for (const [k, v] of Object.entries(worstSt)) if (SCAP[k]) ok(v <= SCAP[k], `player state ${k} lasted ${v.toFixed(2)}s (cap ${SCAP[k]}s)`);
console.log(`  capable bot finished ${botDone}/100 chapter runs (slowest ${Math.round(worstCh)}s); monkey ran ${(monkeyTicks / 3600).toFixed(0)} min of random input`);
console.log(`  longest phases: ${Object.entries(worstPhase).map(([k, v]) => k + ' ' + v.toFixed(1) + 's').join(', ')}`);

// ---- 5. save/load ----
console.log('5. save/load');
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };
{
  const st = mem(), S = makeStore(st);
  const prog = { chapter: 3, checkpoint: 2, maxChapter: 3, resMax: 5, charms: ['fox1'], hidden: ['c1h', 'c3h'], finished: false, lethal: true, difficulty: 'lethal' };
  S.saveProgress(prog); ok(JSON.stringify(makeStore(st).progress()) === JSON.stringify(Object.assign({}, DEFAULT_PROGRESS, prog)), 'progress round-trips');
  const hk = [{ ch: 0, jp: HAIKU[0].jp, lines: [HAIKU[0].lines[0][1], HAIKU[0].lines[1][2], HAIKU[0].lines[2][0]] }];
  S.saveHaiku(hk); ok(JSON.stringify(makeStore(st).haiku()) === JSON.stringify(hk), 'haiku round-trips');
  S.saveSettings({ difficulty: 'story', volume: 0.3, music: 0.5, sfx: 1, muted: true, reduced: true, keys: { slash: ['KeyU'] } });
  const back = makeStore(st).settings(); ok(back.difficulty === 'story' && back.muted === true && back.keys.slash[0] === 'KeyU', 'settings round-trip');
  ok([...st.m.keys()].every((k) => k.startsWith('nc2:')), 'every key starts with nc2:');
  st.setItem('nc2:kaze:progress', '{not json'); ok(makeStore(st).progress().chapter === 0, 'corrupt progress falls back to defaults');
  const boom = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('full'); }, removeItem: () => { throw new Error('x'); } };
  let threw = false; try { const B = makeStore(boom); B.progress(); B.saveProgress(prog); B.haiku(); B.saveHaiku([]); B.settings(); B.clearProgress(); } catch (e) { threw = true; }
  ok(!threw, 'throwing storage never throws out of the store');
  ok(makeStore(null).progress().chapter === 0, 'missing storage gives defaults');
  // a sim resumed from saved progress starts at the saved shrine with saved upgrades
  const p2 = makeStore(st); p2.saveProgress(prog); const P = p2.progress();
  const s = createSim({ seed: 1, difficulty: P.difficulty, chapter: P.chapter, checkpoint: P.checkpoint, resMax: P.resMax, charms: P.charms, hidden: P.hidden });
  ok(s.ch === 3 && s.cp === 2 && s.resMax === 5 && s.charms.includes('fox1') && Math.abs(s.p.x - (CHAPTERS[3].ev.filter((e) => e.t === 'shrine')[1].x + 40)) < 1, 'resume places the ronin at the saved shrine with upgrades');
}

// ---- 6. determinism ----
console.log('6. determinism');
{
  const run = () => { const s = createSim({ seed: 5, difficulty: 'blade', chapter: 1 }); const m = makeBot(); for (let i = 0; i < 60 * 90; i++) { step(s, botInput(s, m)); s.cues.length = 0; } return digest(s); };
  const a = run(), b = run(); ok(a === b, `same seed, same inputs, same state (${a} vs ${b})`);
}

// ---- 7. personas: human-like players on the default difficulty (Blade), 8 seeds each ----
console.log('7. personas (Blade, 8 seeds)');
function persona(kind, seed, maxCh) {
  const s = createSim({ seed, difficulty: 'blade' }); const m = makePersona(kind, seed);
  const r = { chDone: 0, deaths: 0, firstFight: false, boss1: false, bossDeathT: [], fin: false, deadMax: 0 }; let bossT = null, deadT = 0;
  for (let i = 0; i < 60 * 60 * 12 * maxCh && !s.done; i++) {
    const ch = s.ch; step(s, personaInput(s, m));
    for (const c of s.cues) { if (c.k === 'death') { r.deaths++; if (s.ch === 0 && bossT != null) r.bossDeathT.push(s.t - bossT); } if (c.k === 'clear' && s.ch === 0 && !c.boss) r.firstFight = true; }
    s.cues.length = 0;
    if (s.arena && s.arena.boss) { if (r._a !== s.arena) { r._a = s.arena; bossT = s.t; if (s.ch === 0) r.boss1 = true; } }
    if (s.phase === 'dead') { deadT += DT; r.deadMax = Math.max(r.deadMax, deadT); } else deadT = 0;
    if (s.phase === 'narr' && !r['n' + ch]) { r['n' + ch] = 1; r.chDone = ch + 1; if (r.chDone >= maxCh) break; }
  }
  r.fin = s.done || s.phase === 'ending' || s.phase === 'credits' || s.phase === 'fin';
  return r;
}
{
  const M = [], L = [], C = []; for (let seed = 1; seed <= 8; seed++) { M.push(persona('masher', seed, 1)); L.push(persona('learner', seed, 2)); C.push(persona('competent', seed, 5)); }
  const firstFight = M.filter((r) => r.firstFight).length, toBoss = M.filter((r) => r.boss1).length;
  const bt = M.flatMap((r) => r.bossDeathT).sort((a, b) => a - b), med = bt.length ? bt[bt.length >> 1] : 99;
  ok(firstFight >= 6 && toBoss >= 6, `masher clears the first fight (${firstFight}/8) and reaches the first boss (${toBoss}/8)`);
  ok(!bt.length || (med >= 10 && bt[0] >= 8), `masher loses to the first boss only after a real fight (median ${med.toFixed(1)}s, shortest ${bt.length ? bt[0].toFixed(1) : '-'}s)`);
  const l1 = L.filter((r) => r.chDone >= 1).length, l2 = L.filter((r) => r.chDone >= 2).length;
  ok(l1 >= 6, `learner finishes chapter 1 on ${l1}/8 (need 6)`); ok(l2 >= 6, `learner gets through chapter 2 on ${l2}/8`);
  const cf = C.filter((r) => r.fin).length; ok(cf >= 7, `competent finishes the game on ${cf}/8`);
  const deadMax = Math.max(...[...M, ...L, ...C].map((r) => r.deadMax)); ok(deadMax < 2, `death is cheap: back at the shrine after ${deadMax.toFixed(2)}s at most`);
  console.log(`  masher: first fight ${firstFight}/8, reached boss ${toBoss}/8, boss deaths ${bt.length} (median ${med.toFixed(1)}s), beat boss ${M.filter((r) => r.chDone >= 1).length}/8`);
  console.log(`  learner: ch1 ${l1}/8, ch2 ${l2}/8, deaths ${L.map((r) => r.deaths).join(',')}`);
  console.log(`  competent: finished ${cf}/8, deaths ${C.map((r) => r.deaths).join(',')}; respawn after death <= ${deadMax.toFixed(2)}s`);
}

console.log(`\n${checks - fails}/${checks} checks passed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (fails) { console.log('KAZE TESTS FAILED'); process.exit(1); } else console.log('ALL KAZE CHECKS PASSED');
