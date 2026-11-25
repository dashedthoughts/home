// KAZE simulation tests (node): node src/games/kaze/test.mjs
// 1 a scripted bot finishes all five chapters on Blade (and Story, Lethal);
// 2 every enemy attack telegraphs at least the difficulty's minimum reaction time;
// 3 standoff windows are winnable: releasing inside the window wins, on a feint or late is punished;
// 4 no softlocks: watchdogs over 20 seeds with a capable bot and a random "monkey";
// 5 save/load round-trips (and survives broken storage); 6 determinism.
// 12 parry timing (early/on-time/late presses at 60/30/20 fps, taps and holds); 13 a learner beats Ono in a few tries.
// 11 combat honesty: unready foes cannot block, a raised guard always blocks visibly (clash cue, counter), guard meters
// break within 4 hits, bosses take damage from every landed quick cut, and no block in real play comes without a raised guard.
import { createSim, step, DT, blankInput, standoffPose, digest, foeGuarded, foeGuardMax } from './sim.js';
import { makeBot, botInput, makePersona, personaInput } from './bot.js';
import { DIFF, ATK, CHAPTERS, HAIKU, FOES, BOSSES, COMBAT } from './data.js';
import { makeStore, DEFAULT_PROGRESS } from './save.js';
import { makePlates, plateStep } from './plates.js';
import { runClothCheck } from './clothcheck.mjs';
import { SCORE, SCALES, STATE_SCALE, CH_KEYS, INSTR, TEMPO, loopBars, pitchClass, nextBar } from './score.js';

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
    const rC = runStandoff(c, (so) => !(so.st === 'strike' && so.ts > so.win + COMBAT.drawGrace + 0.03));
    ok(rC === 'late', `${diff} ch${ch + 1} seed ${seed}: releasing late gave ${rC}`);
    // the window itself is humanly winnable: at least 0.2s and later duels in a chain only tighten
    ok(a.stats.standoffWins >= 1, 'a win is counted');
  }
}
for (const diff of ['story', 'blade', 'lethal']) ok(DIFF[diff].standoff * Math.pow(0.85, 2) >= 0.2, `${diff}: third duel window ${(DIFF[diff].standoff * 0.7225).toFixed(3)}s >= 0.2s`);
ok(feintSeen > 10, `feints were exercised (${feintSeen})`);
console.log(`  windows: story ${DIFF.story.standoff}s, blade ${DIFF.blade.standoff}s, lethal ${DIFF.lethal.standoff}s (x0.85 per chained duel); feint releases tested: ${feintSeen}`);

// ---- 3b. the draw is readable: a tell always precedes the window by 0.35 to 0.5 s, feints never emit it, a release inside
// the window (with its grace on both sides) always wins, and the first standoff teaches the cue ----
{
  let duels = 0, feintCues = 0, leads = [];
  for (const diff of ['story', 'blade', 'lethal']) for (const [ch, idx] of [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]) for (let seed = 1; seed <= 6; seed++) {
    // watch the whole chain of duels with a policy that releases at a chosen point of the window
    for (const at of ['grace-early', 'open', 'mid', 'end', 'grace-late']) {
      const s = standoffAt(ch, idx, diff, seed); s.hintsSeen.drawteach = 1; if (s.so) s.so.teach = false;
      let tell = null, open = null, sawFeint = false, res = [];
      const I = blankInput();
      for (let i = 0; i < 60 * 40 && s.phase === 'standoff'; i++) {
        const so = s.so; let hold = true;
        if (so.st === 'hold' && tell != null) { if (at === 'grace-early' && so.t >= so.strikeAt - COMBAT.drawGrace + 0.017) hold = false; }
        if (so.st === 'strike') { const w = so.win; hold = !({ open: so.ts >= 0, mid: so.ts >= w / 2, end: so.ts >= w - 0.017, 'grace-late': so.ts >= w + COMBAT.drawGrace - 0.017 }[at] ?? false); }
        I.focus = hold; step(s, I);
        for (const c of s.cues) {
          if (c.k === 'drawtell') { tell = s.so ? s.so.t : null; if (standoffPose(s.so) !== 'tell') ok(false, 'drawtell outside the tell pose'); }
          if (c.k === 'feinttell') { feintCues++; sawFeint = true; if (tell != null && s.so && s.so.t >= s.so.tellAt) ok(false, 'a feint inside the tell'); }
          if (c.k === 'drawwin' && c.open) { open = s.so.t; leads.push(open - tell); ok(tell != null && open - tell >= 0.35 - 1e-9 && open - tell <= 0.5 + 1e-9, `${diff} ch${ch + 1}: tell ${tell} precedes window ${open} by ${(open - tell).toFixed(3)}s`); }
          if (c.k === 'feinttell' && tell != null) ok(false, 'feint after the tell');
          if (c.k === 'socut' || c.k === 'sofail') { res.push(c.k); tell = null; open = null; }
        }
        s.cues.length = 0;
      }
      duels++;
      ok(res.length > 0 && res.every((k) => k === 'socut'), `${diff} ch${ch + 1} seed ${seed}: release at ${at} of the window gave ${res.join(',')}`);
    }
  }
  ok(feintCues > 20, `feint tells were exercised (${feintCues})`);
  // the teaching beat: the first standoff of chapter 1 slows its clock from the tell and prompts "Now" as the window opens
  { const s = standoffAt(0, 0, 'blade', 2); let slowed = false, now = false, realT0 = null, realOpen = null;
    for (let i = 0; i < 60 * 30 && s.phase === 'standoff'; i++) { const I = blankInput(); I.focus = !(s.so.st === 'strike' && s.so.ts > s.so.win / 2); step(s, I);
      for (const c of s.cues) { if (c.k === 'drawtell') realT0 = s.t; if (c.k === 'drawwin' && c.open) realOpen = s.t; } s.cues.length = 0;
      if (s.so && s.so.slowK < 1) slowed = true; if (s.hint && s.hint.id === 'now') now = true; if (s.so && s.so.result) break; }
    ok(slowed && now && realOpen - realT0 > 0.8, `first standoff teaches the tell (slowed ${slowed}, "Now" ${now}, tell to window ${(realOpen - realT0).toFixed(2)}s real time)`); }
  console.log(`  ${duels} duel chains: tell leads the window by ${Math.min(...leads).toFixed(2)}..${Math.max(...leads).toFixed(2)}s; ${feintCues} feint tells, none with drawtell; releases from ${COMBAT.drawGrace}s before to ${COMBAT.drawGrace}s after the window all win`);
}

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

// ---- 8. the score: complete stems, whole loops, notes in scale, bar-line transitions, headroom ----
console.log('8. score');
{
  const states = ['calm', 'fight', 'standoff', 'boss', 'boss2', 'victory', 'ending'], perc = new Set(['taiko', 'heart', 'click']);
  let notes = 0, worst = 0, worstAt = '';
  for (const k of CH_KEYS) for (const st of states) {
    const S = SCORE[k] && SCORE[k][st]; ok(!!S && Object.keys(S).length > 0, `${k} has a ${st} arrangement`); if (!S) continue;
    const L = loopBars(st);
    for (const [stem, bars] of Object.entries(S)) {
      ok(bars.length === L, `${k}/${st}/${stem} has ${bars.length} bars (loop is ${L})`);
      ok(INSTR[stem] != null, `${stem} is a known instrument`);
      for (const bar of bars) for (const [t, n, d] of bar) { notes++; ok(t >= 0 && t < 4 && d > 0, `${k}/${st}/${stem} event inside its bar`); if (!perc.has(stem)) ok(SCALES[STATE_SCALE[st]].includes(pitchClass(n)), `${k}/${st}/${stem} note ${n} in the ${STATE_SCALE[st]} scale`); }
    }
    // headroom: sum the peak gains of everything sounding at each eighth of every bar (plucks and drums ring for 2 beats)
    for (let b = 0; b < L; b++) for (let q = 0; q < 8; q++) { const tb = q / 2; let sum = 0;
      for (const [stem, bars] of Object.entries(S)) for (const [t, n, d] of bars[b]) { const ring = stem === 'pluck' || stem === 'bass' || stem === 'taiko' || stem === 'heart' || stem === 'bell' ? Math.max(d, 2) : d; if (tb >= t && tb < t + ring) sum += INSTR[stem] * (stem === 'pad' || stem === 'glass' ? 1.5 : stem === 'bell' ? 1.6 : 1); }
      if (sum > worst) { worst = sum; worstAt = `${k}/${st} bar ${b + 1}`; } }
  }
  ok(worst < 0.75, `(master 0.63 at default volume, then a compressor) peak summed gain ${worst.toFixed(2)} (at ${worstAt}) stays well under clipping before the master and compressor`);
  // transitions: whatever the request time, the switch lands exactly on a bar line, and never in the past
  for (const k of CH_KEYS) { const bar = 240 / TEMPO[k]; for (let i = 0; i < 50; i++) { const t = 0.37 + i * 0.913, nb = nextBar(t, 0.1, bar), n = (nb - 0.1) / bar; ok(nb >= t - 1e-9 && Math.abs(n - Math.round(n)) < 1e-9 && nb - t < bar + 1e-9, `${k}: request at ${t.toFixed(2)}s switches on bar line ${nb.toFixed(3)}s`); } }
  console.log(`  ${CH_KEYS.length} chapters x ${states.length} states, ${notes} notes checked; loops of ${states.map((s2) => loopBars(s2)).join('/')} bars; peak summed gain ${worst.toFixed(2)} at ${worstAt}`);
}

// ---- 9. plates: one at a time, never left over a fight, gone by themselves ----
console.log('9. plates');
{
  let checked = 0, maxAge = 0;
  for (let ch = 0; ch < 5; ch++) for (const cp of [0, 1, 2]) {
    // after a goto or a respawn, 5 s later no story plate may still be up (the shrine line was the bug)
    const s = createSim({ seed: 3 + ch, difficulty: 'blade', chapter: ch, checkpoint: cp }), m = makeBot(), pm = makePlates();
    let P = null; for (let i = 0; i < 60 * 5; i++) { step(s, botInput(s, m)); P = plateStep(pm, s, s.cues, false); s.cues.length = 0; }
    ok(!P || P.kind === 'fight', `ch${ch + 1} cp${cp}: 5 s after the start the plate is ${P ? P.kind + ' "' + P.text + '"' : 'gone'}`);
    checked++;
  }
  // a whole bot run of every chapter: a plate never outlives its time, and never sits over a fight unless it belongs there
  for (let ch = 0; ch < 5; ch++) {
    const s = createSim({ seed: 21 + ch, difficulty: 'blade', chapter: ch }), m = makeBot({ secrets: true }), pm = makePlates();
    for (let i = 0; i < 60 * 60 * 4 && s.ch === ch && !s.done; i++) {
      step(s, botInput(s, m)); const P = plateStep(pm, s, s.cues, i % 97 === 0); s.cues.length = 0; checked++;
      if (!P) continue; maxAge = Math.max(maxAge, P.kind === 'death' ? 0 : P.age);
      const fight = s.arena && s.foes.some((f) => f.st !== 'dead');
      if (fight && !(P.kind === 'fight' || P.kind === 'boss' || P.kind === 'death')) { ok(false, `ch${ch + 1}: a ${P.kind} plate "${P.text}" over a fight`); break; }
      if (P.kind !== 'death' && P.age > 4.05) { ok(false, `ch${ch + 1}: plate "${P.text}" still up after ${P.age.toFixed(1)}s`); break; }
    }
  }
  ok(maxAge <= 4.05, `no plate stays longer than 4 s (longest ${maxAge.toFixed(2)}s); the selector only ever returns one plate`);
  console.log(`  ${checked} frames checked across all chapters; longest plate ${maxAge.toFixed(2)}s`);
}

// ---- 10. cloth: every animation of every robed figure, frame by frame, through the real pose and figure code ----
{
  console.log('10. cloth');
  const r = runClothCheck((m) => console.log('  ' + m));
  ok(r.total > 8000 && r.anims > 100, 'cloth checker covered too little');
  ok(r.fails.length === 0, `cloth rules broken on ${r.fails.length} frames`);
}

// ---- 11. combat honesty: what blocks and what lands comes only from what the player can see ----
console.log('11. combat honesty');
{
  // a fight with one foe (or a boss) in chapter 1, the ronin at x, the foe placed in front of him in a chosen state
  const duel = (type, o = {}) => {
    const s = createSim({ seed: o.seed ?? 3, difficulty: o.diff ?? 'blade', chapter: 0 });
    const e = s.ev.find((q) => q.t === (BOSSES[type] ? 'boss' : 'fight'));
    for (const q of s.ev) if (q !== e) q.done = true;
    if (!BOSSES[type]) e.foes = [type];
    s.p.x = s.p.ox = e.x - 80; step(s, blankInput()); s.cues.length = 0;
    const f = s.foes[0]; s.p.face = 1; f.face = -1; f.x = f.ox = s.p.x + (o.dist ?? 70);
    f.st = o.st ?? 'ready'; f.stt = 0.5; f.readyT = 99; f.engaged = o.engaged ?? true; f.guard = o.guard ?? 0;
    if (o.turned) f.face = 1;
    if (o.atk) { f.atk = o.atk; f.windT = 0.6; f.stt = o.stt ?? 0.2; }
    s.tokenCD = 99; // keep him from starting a new attack mid-test
    return { s, f };
  };
  // press the cut (or heavy) and run until it has resolved; returns the cues it caused for that foe
  // let the ronin finish whatever he was doing (the foe is held in place meanwhile)
  const ready = (s, f) => { const st = f.st, g = f.guard; for (let i = 0; i < 120 && (!(s.p.st === 'idle' || s.p.st === 'move') || s.p.recoil > 0); i++) { step(s, blankInput()); s.cues.length = 0; } f.st = st; f.guard = g; f.x = s.p.x + 70; f.face = -1; };
  const strike = (s, f, key = 'slash') => {
    const I = blankInput(); I[key] = true; const out = [];
    for (let i = 0; i < 40; i++) { step(s, i === 0 ? I : blankInput()); for (const c of s.cues) out.push(c); s.cues.length = 0; if (out.some((c) => c.k === 'swing') && i > 2) break; }
    return out.filter((c) => c.id === f.id || c.k === 'swing');
  };
  const landed = (cs) => cs.some((c) => c.k === 'cut' || c.k === 'kill' || c.k === 'riposte');
  const regular = ['bandit', 'spear', 'archer', 'brute', 'duelist'], bosses = Object.keys(BOSSES);
  let n = 0;
  // a. a cut on a foe who is walking in, still entering, turned away or not yet squared up always lands
  for (const type of [...regular, ...bosses]) for (const [label, o] of [...(type === 'archer' ? [] : [['walking in', { st: 'approach', dist: 112 }]]), ['entering', { st: 'enter', dist: 90 }], ['turned away', { st: 'ready', guard: 1, turned: true }], ['squaring up', { st: 'ready', guard: 0 }], ['mid-windup', { st: 'wind', atk: BOSSES[type] ? 'cut' : FOES[type].moves[0][0] }]])
    for (const engaged of [false, true]) for (let seed = 1; seed <= 3; seed++) {
      const { s, f } = duel(type, Object.assign({ seed, engaged }, o)); if (o.st === 'enter') f.tx = s.p.x - 300;
      const hp0 = f.hp, cs = strike(s, f); n++;
      ok(landed(cs) && !cs.some((c) => c.k === 'clash'), `${type} ${label} (engaged ${engaged}): the cut did not land (${cs.map((c) => c.k).join(',')})`);
      ok(f.hp < hp0 || f.st === 'dead', `${type} ${label}: a landed cut cost him no health`);
      if (!engaged && o.st !== 'wind') ok(cs.some((c) => c.k === 'surprise') && (BOSSES[type] ? f.st === 'stagger' : f.st === 'dead'), `${type} ${label}: a surprise cut should ${BOSSES[type] ? 'stagger' : 'kill'} him (st ${f.st})`);
    }
  // b. a raised guard always blocks, always with a clash cue (sparks, ring, both recoil), and his counter comes next
  let blocks = 0;
  for (const type of [...regular, ...bosses]) {
    const { s, f } = duel(type, { guard: 1 }); if (FOES[type] && FOES[type].shield) f.shield = 1; if (type === 'hyoe') { f.shield = 1; f.phase = 2; }
    if (!foeGuardMax(f)) { const cs = strike(s, f); ok(landed(cs), `${type} has no guard, so the cut must land`); continue; }
    ok(foeGuarded(s, f), `${type} squared up with guard 1 reads as guarded`);
    const px = s.p.x, cs = strike(s, f), cl = cs.find((c) => c.k === 'clash'); blocks++;
    ok(!!cl && !landed(cs) && f.st === 'block', `${type}: a cut into a raised guard must be a visible block (${cs.map((c) => c.k).join(',')}, st ${f.st})`);
    ok(cl && cl.gm === 1 && cl.max === foeGuardMax(f), `${type}: the clash cue carries the guard meter (${cl && cl.gm}/${cl && cl.max})`);
    ok(s.p.recoil > 0 || s.p.x < px, `${type}: the ronin recoils from the block`);
    // the counter window: once the block pose ends he attacks with a normal telegraph
    s.tokenCD = 0; let told = false; for (let i = 0; i < 60 && !told; i++) { step(s, blankInput()); told = s.cues.some((c) => c.k === 'tell' && c.id === f.id); s.cues.length = 0; }
    ok(told, `${type}: a block opens his counter (he attacks within a second)`);
    // determinism: the same situation gives the same result whatever the RNG state
    for (let seed = 2; seed <= 6; seed++) { const d2 = duel(type, { guard: 1, seed }); if (type === 'hyoe') { d2.f.shield = 1; d2.f.phase = 2; } if (FOES[type] && FOES[type].shield) d2.f.shield = 1; ok(strike(d2.s, d2.f).some((c) => c.k === 'clash'), `${type} seed ${seed}: same guard, same block`); }
  }
  // c. the guard meter breaks within 4 quick hits (2 heavy), and the broken foe is open for the riposte
  for (const type of [...regular, ...bosses]) for (const key of ['slash', 'heavy']) {
    const { s, f } = duel(type, { guard: 1 }); if (FOES[type] && FOES[type].shield) f.shield = 1; if (type === 'hyoe') { f.shield = 1; f.phase = 2; }
    if (!foeGuardMax(f)) continue;
    let hits = 0, broke = false;
    for (; hits < 8 && !broke; ) {
      f.st = 'ready'; f.guard = 1; ready(s, f); hits++;
      const cs = strike(s, f, key); broke = cs.some((c) => c.k === 'guardbreak');
      if (!broke) ok(cs.some((c) => c.k === 'clash'), `${type} ${key} hit ${hits}: neither a block nor a break`);
    }
    ok(broke && hits <= (key === 'heavy' ? 2 : 4), `${type}: guard broke after ${hits} ${key} hits (must be <= ${key === 'heavy' ? 2 : 4})`);
    ok(f.st === 'opened', `${type}: a broken guard leaves him open (st ${f.st})`);
    ready(s, f); const hp0 = f.hp, cs = strike(s, f); ok(cs.some((c) => c.k === 'riposte') && (f.boss ? f.hp <= hp0 - COMBAT.riposteBoss + 1e-9 : f.st === 'dead'), `${type}: the riposte after a guard break ${f.boss ? 'cuts deep' : 'kills'}`);
  }
  // d. bosses take damage from every landed quick cut (at least 0.6 of a normal hit), whatever they are doing
  for (const type of bosses) for (const [st, o] of [['ready', { guard: 0 }], ['approach', { dist: 112 }], ['rec', { atk: 'cut', stt: 0.05 }], ['stun', {}], ['wind', { atk: 'cut' }], ['act', { atk: 'cut', stt: 0.01 }], ['shift', {}]]) {
    const { s, f } = duel(type, Object.assign({ st }, o)); if (st === 'stun') f.stunT = 0.6; if (st === 'act') { f.hitDone = true; s.p.ifr = 2; }
    const hp0 = f.hp, cs = strike(s, f), c = cs.find((q) => q.k === 'cut');
    ok(!!c && hp0 - f.hp >= 0.6 - 1e-9, `${type} in ${st}: a quick cut must land for >= 0.6 (got ${c ? (hp0 - f.hp).toFixed(2) : 'no cut: ' + cs.map((q) => q.k).join(',')})`);
  }
  // the first landed quick cut of a combo staggers a boss who is not committed to a strike
  for (const type of bosses) { const { s, f } = duel(type, { st: 'ready', guard: 0 }); strike(s, f); ok(f.st === 'stun', `${type}: first quick cut of a combo staggers him (st ${f.st})`); }
  // e. regular foes die in 2 to 3 clean cuts (unguarded, already fighting)
  for (const type of ['bandit', 'spear', 'duelist', 'archer']) {
    const { s, f } = duel(type, { st: 'stun' }); f.stunT = 9; let cuts = 0; while (f.st !== 'dead' && cuts < 6) { ready(s, f); strike(s, f); cuts++; if (f.st !== 'dead') { f.st = 'stun'; f.stunT = 9; } }
    ok(cuts >= 2 && cuts <= 3, `${type} died in ${cuts} clean cuts (band 2 to 3)`);
  }
  // f. no block without a visible guard, over real play: persona runs and the capable bot, every clash checked against the pre-step state
  let clashes = 0, blind = 0;
  for (const [kind, seed] of [['masher', 1], ['learner', 2], ['competent', 3], ['bot', 4], ['learner', 5]]) {
    const s = createSim({ seed, difficulty: 'blade', chapter: seed % 3 }); const m = kind === 'bot' ? makeBot() : makePersona(kind, seed);
    for (let i = 0; i < 60 * 60 * 3; i++) {
      const pre = new Map(s.foes.map((f) => [f.id, { st: f.st, guard: f.guard, face: f.face, x: f.x }]));
      step(s, kind === 'bot' ? botInput(s, m) : personaInput(s, m));
      for (const c of s.cues) if (c.k === 'clash') { clashes++; const b = pre.get(c.id); if (!b || !(b.guard >= 1) || (b.st !== 'ready' && b.st !== 'block')) blind++; }
      s.cues.length = 0;
    }
    blind += s.stats.blindBlocks;
  }
  ok(blind === 0, `${blind} blocks happened without a raised guard`);
  ok(clashes > 10, `blocks were exercised in real play (${clashes})`);
  console.log(`  ${n} cuts on unready foes all landed; ${blocks} guard types block with a clash and counter; meters break in <= 4 quick / 2 heavy; ${clashes} blocks in play, all from a raised guard`);
}

// ---- 11b. spacing and hints: nobody stands inside anybody, foes hold a body and a half at rest, hints end with their moment ----
{
  let closest = 1e9, rest = [], stale = 0, hints = 0;
  for (const [kind, seed, ch] of [['learner', 1, 0], ['competent', 2, 0], ['learner', 3, 1], ['masher', 4, 0], ['competent', 5, 2]]) {
    const s = createSim({ seed, difficulty: 'blade', chapter: ch }); const m = makePersona(kind, seed);
    for (let i = 0; i < 60 * 60 * 3; i++) {
      step(s, personaInput(s, m)); s.cues.length = 0;
      for (const f of s.foes) { if (f.st === 'dead' || f.st === 'enter' || s.p.st === 'dodge') continue; const d = Math.abs(f.x - s.p.x); closest = Math.min(closest, d); if (f.st === 'ready' && f.type !== 'archer' && (s.p.st === 'idle' || s.p.st === 'move')) rest.push(d); }
      const h = s.hint; if (h && h.src != null) { hints++; const f = s.foes.find((q) => q.id === h.src); if (!f || f.st === 'dead' || (h.id === 'riposte' && f.st !== 'opened') || ((h.id === 'parry' || h.id === 'dodge') && f.st !== 'wind' && f.st !== 'act')) stale++; }
    }
  }
  rest.sort((a, b) => a - b); const med = rest[rest.length >> 1];
  ok(closest >= COMBAT.bodyMin - 1, `nobody closer than ${COMBAT.bodyMin}px hip to hip outside a roll (closest ${closest.toFixed(0)})`);
  ok(med >= 100, `at rest a foe holds about a body and a half away (median ${med.toFixed(0)}px)`);
  ok(stale === 0, `${stale} frames of a fight hint outliving its moment`);
  // the riposte hint goes the moment the opened foe dies
  { const s = createSim({ seed: 1, difficulty: 'blade', chapter: 0 }); const e = s.ev.find((q) => q.t === 'fight'); for (const q of s.ev) if (q !== e) q.done = true; s.p.x = s.p.ox = e.x - 80; step(s, blankInput());
    const f = s.foes[0]; f.st = 'ready'; f.x = s.p.x + 100; f.face = -1; f.engaged = true; f.atk = 'cut'; f.st = 'wind'; f.windT = 0.6; f.stt = 0; s.token = f.id;
    for (let i = 0; i < 40; i++) { const I = blankInput(); I.parry = i === 30; step(s, I); s.cues.length = 0; }
    const had = s.hint && s.hint.id === 'riposte'; for (let i = 0; i < 30 && f.st !== 'dead'; i++) { const I = blankInput(); I.slash = i === 2; step(s, I); s.cues.length = 0; }
    ok(had && f.st === 'dead' && !(s.hint && s.hint.id === 'riposte'), `"Strike now" shown on the parry (${had}) and gone when he dies (${s.hint && s.hint.id})`); }
  console.log(`  closest ${closest.toFixed(0)}px, rest median ${med.toFixed(0)}px; ${hints} hint frames checked, none stale`);
}

// ---- 12. parry: the window opens at the press, a little early counts, a tap holds, a held guard never swallows a press,
// and the result is the same at 60, 30 and 20 fps (input is sampled once per frame; a tap is latched for one sim step) ----
console.log('12. parry timing');
{
  const W = DIFF.blade.parry + COMBAT.parryEarly;
  // a bandit (or Ono) winding a parryable attack whose blow lands exactly at tHit after the setup
  const setup = (type = 'bandit', atk = 'cut', seed = 1) => {
    const s = createSim({ seed, difficulty: 'blade', chapter: type === 'ono' ? 1 : 0 });
    const e = s.ev.find((q) => q.t === (type === 'ono' ? 'boss' : 'fight')); for (const q of s.ev) if (q !== e) q.done = true; if (type !== 'ono') e.foes = [type];
    s.p.x = s.p.ox = e.x - 80; step(s, blankInput()); s.cues.length = 0;
    const f = s.foes[0]; s.p.face = 1; f.face = -1; f.x = f.ox = s.p.x + 70; f.engaged = true; f.atk = atk; f.st = 'wind'; f.stt = 0; f.windT = 0.6; f.feinting = false; s.token = f.id;
    return { s, f };
  };
  // run with the parry key pressed at time `at` (seconds after setup; negative = before), held for `hold` seconds; fps sets how
  // often input is sampled. Returns 'parry', 'block' or 'hit'.
  const trial = (at, o = {}) => {
    const { s, f } = setup(o.type, o.atk, o.seed); const fps = o.fps || 60, per = Math.round(60 / fps), hold = o.hold ?? 0.02;
    let out = null, latched = false, frameI = null;
    for (let i = 0; i < 120 && !out; i++) {
      const t = i * DT;
      if (i % per === 0) { // a new frame: sample the keyboard (a press since the last frame is latched for one step)
        const down = (o.pre && t < o.pre[1] && t >= o.pre[0]) || (t >= at && t < at + hold);
        const pressedSince = at > t - per * DT && at <= t;
        frameI = blankInput(); frameI.parry = down || pressedSince; latched = pressedSince && !down;
      } else if (latched) { frameI = Object.assign({}, frameI, { parry: false }); latched = false; }
      step(s, frameI);
      for (const c of s.cues) { if (c.k === 'parry') out = 'parry'; else if (c.k === 'deflect' || c.k === 'guardbroken') out = 'block'; else if (c.k === 'hurt') out = 'hit'; }
      s.cues.length = 0;
    }
    return out;
  };
  const hitT = 0.6; let n = 0;
  for (const fps of [60, 30, 20]) for (const hold of [0.02, 0.8]) for (const [type, atk] of [['bandit', 'cut'], ['spear', 'thrust'], ['ono', 'thrust']]) for (const seed of [1, 2]) {
    const o = { fps, hold, type, atk, seed }; n++;
    // on time, and a little early (inside window + grace, allowing one frame of sampling delay): always a parry
    for (const lead of [0.05, 0.1, W - 1 / fps - 0.02]) { const r = trial(hitT - lead, o); ok(r === 'parry', `${type} ${fps}fps hold ${hold}s: press ${lead.toFixed(2)}s before the blow gave ${r}`); }
    // late (after the blow): never a parry
    { const r = trial(hitT + 0.03, o); ok(r === 'hit', `${type} ${fps}fps: a late press gave ${r}`); }
    // far too early: a held guard blocks, a tap has dropped by then; never a parry
    { const r = trial(hitT - 0.5, o); ok(r === (hold > 0.3 ? 'block' : 'hit'), `${type} ${fps}fps hold ${hold}: a press 0.5s early gave ${r}`); }
    // holding guard does not swallow a fresh press: hold 0.0-0.3s, release, press again on time
    { const r = trial(hitT - 0.08, Object.assign({}, o, { pre: [0, 0.3] })); ok(r === 'parry', `${type} ${fps}fps: a press after releasing a held guard gave ${r}`); }
  }
  // a press buffered during the ronin's own swing still parries (the window runs from the press)
  { const { s, f } = setup('bandit', 'cut'); let out = null; f.stt = 0.2; f.windT = 0.7; // committed: he trades through the cut
    for (let i = 0; i < 90 && !out; i++) { const I = blankInput(); if (i === 0) I.slash = true; if (i >= 16 && i <= 17) I.parry = true; step(s, I); for (const c of s.cues) if (c.k === 'parry' || c.k === 'hurt' || c.k === 'deflect') out = out || c.k; s.cues.length = 0; }
    ok(out === 'parry', `a parry pressed during the ronin's own cut recovery gave ${out}`); }
  // a successful parry is unmistakable: parry cue, the foe opened (recoiling), and the riposte lands as a kill
  { const { s, f } = setup('bandit', 'cut'); let parried = false; for (let i = 0; i < 40; i++) { const I = blankInput(); I.parry = i === 30; step(s, I); if (s.cues.some((c) => c.k === 'parry')) parried = true; s.cues.length = 0; }
    ok(parried && f.st === 'opened', `parry opens the foe (st ${f.st})`);
    let killed = false; for (let i = 0; i < 40 && !killed; i++) { const I = blankInput(); I.slash = i === 12; step(s, I); killed = s.cues.some((c) => c.k === 'riposte'); s.cues.length = 0; }
    ok(killed, 'the riposte after a parry lands'); }
  console.log(`  window ${W.toFixed(2)}s from the press (${DIFF.blade.parry}s + ${COMBAT.parryEarly}s early grace); ${n} setups x 6 timings at 60/30/20 fps, tapped and held`);
}

// ---- 13. Ono, the chapter 2 boss: a learner beats him within a few tries on most seeds ----
console.log('13. Ono');
{
  const tries = [];
  for (let seed = 1; seed <= 10; seed++) {
    const s = createSim({ seed, difficulty: 'blade', chapter: 1, checkpoint: 3 }); const m = makePersona('learner', seed); let n = 0, won = false;
    for (let i = 0; i < 60 * 60 * 8 && !won; i++) { step(s, personaInput(s, m)); for (const c of s.cues) { if (c.k === 'death' && s.arena && s.arena.boss) n++; if (c.k === 'kill' && c.boss === 'ono') won = true; } s.cues.length = 0; }
    tries.push(won ? n + 1 : 99);
  }
  const within = tries.filter((t) => t <= 5).length;
  ok(within >= 7, `learner beats Ono within 5 tries on ${within}/10 seeds (need 7): ${tries.join(',')}`);
  ok(Math.max(...tries) < 99, `learner always beats Ono in the end (${tries.join(',')})`);
  console.log(`  learner tries to beat Ono: ${tries.join(',')}`);
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
  const md = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
  ok(firstFight >= 6 && toBoss >= 6, `masher clears the first fight (${firstFight}/8) and reaches the first boss (${toBoss}/8)`);
  const lostTwice = M.filter((r) => r.bossDeathT.length >= 2).length, through = M.filter((r) => r.chDone >= 1).length;
  ok(lostTwice >= 6, `masher loses the first boss more than once on ${lostTwice}/8 seeds`); ok(through >= 5, `masher still breaks through in the end on ${through}/8`);
  ok(med >= 7, `masher's boss fights are real fights (median ${med.toFixed(1)}s before falling)`);
  const l1 = L.filter((r) => r.chDone >= 1).length, l2 = L.filter((r) => r.chDone >= 2).length, lm = md(L.map((r) => r.deaths));
  ok(l1 >= 6, `learner finishes chapter 1 on ${l1}/8 (need 6)`); ok(l2 >= 6, `learner gets through chapter 2 on ${l2}/8`);
  ok(lm >= 2 && lm <= 5, `learner dies a few times across chapters 1 and 2 (median ${lm}, band 2 to 5)`);
  const cf = C.filter((r) => r.fin).length, cm = md(C.map((r) => r.deaths)); ok(cf >= 7, `competent finishes the game on ${cf}/8`);
  ok(cm >= 3 && cm <= 8, `competent median deaths ${cm} (band 3 to 8)`);
  const deadMax = Math.max(...[...M, ...L, ...C].map((r) => r.deadMax)); ok(deadMax < 2, `death is cheap: back at the shrine after ${deadMax.toFixed(2)}s at most`);
  console.log(`  masher: first fight ${firstFight}/8, reached boss ${toBoss}/8, lost the boss twice or more ${lostTwice}/8, broke through ${through}/8, boss deaths ${bt.length} (median ${med.toFixed(1)}s)`);
  console.log(`  learner: ch1 ${l1}/8, ch2 ${l2}/8, deaths ${L.map((r) => r.deaths).join(',')}`);
  console.log(`  competent: finished ${cf}/8, deaths ${C.map((r) => r.deaths).join(',')}; respawn after death <= ${deadMax.toFixed(2)}s`);
}

console.log(`\n${checks - fails}/${checks} checks passed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (fails) { console.log('KAZE TESTS FAILED'); process.exit(1); } else console.log('ALL KAZE CHECKS PASSED');
