// KAZE simulation: pure, deterministic, fixed 60 Hz. No DOM, no Math.random, no wall clock.
// State is a plain object. step(s, input) advances one tick and pushes render/audio cues into s.cues.
import { DIFF, ATK, FOES, BOSSES, CHAPTERS, groundH, HAIKU, COMBAT } from './data.js';
export const DT = 1 / 60;
const KEYS = ['left', 'right', 'up', 'down', 'run', 'dodge', 'slash', 'heavy', 'parry', 'focus', 'interact', 'wind', 'heal', 'confirm', 'cancel'];
export const blankInput = () => { const o = { choose: 0 }; for (const k of KEYS) o[k] = false; return o; };

function rnd(s) { let a = (s.r = (s.r + 0x6D2B79F5) | 0); let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const pick = (s, list) => { let tot = 0; for (const m of list) tot += m[1]; let r = rnd(s) * tot; for (const m of list) { r -= m[1]; if (r <= 0) return m[0]; } return list[0][0]; };
const cue = (s, k, o) => { if (s.cues.length < 200) s.cues.push(Object.assign({ k, t: s.t }, o)); };

// P = player tuning
export const P = {
  walk: 150, run: 255, guardWalk: 45, jumpV: 430, grav: 1500, dodgeV: 520, dodgeT: 0.42, dodgeIfr: 0.3,
  slash: [{ wind: 0.07, act: 0.08, rec: 0.24, reach: 104 }, { wind: 0.07, act: 0.08, rec: 0.26, reach: 104 }, { wind: 0.12, act: 0.1, rec: 0.42, reach: 112 }],
  heavy: { wind: 0.36, act: 0.1, rec: 0.46, reach: 122 }, counter: { wind: 0.08, act: 0.12, rec: 0.34, reach: 150 },
  hitT: 0.36, ifrHit: 1.0, healT: 0.75, bowT: 1.25, buffer: 0.18,
};

export function createSim(o = {}) {
  const diff = DIFF[o.difficulty] ? o.difficulty : 'blade';
  const s = {
    v: 1, seed: o.seed ?? 1, r: (o.seed ?? 1) * 2654435761 | 0, diff, tick: 0, t: 0, phase: 'play', pt: 0,
    ch: 0, len: 0, ev: [], foes: [], arrows: [], arena: null, cp: 0, cpX: 120, so: null, hk: null, fox: null,
    wind: { w: 0, gust: 0, gt: 0, cd: 0, tx: 0, dir: 1 }, card: null, hint: null, hintsSeen: {}, near: null,
    resMax: Math.min(5, Math.max(3, o.resMax ?? 3)), charms: (o.charms || []).slice(), hidden: (o.hidden || []).slice(), haikus: [],
    nid: 1, token: 0, tokenCD: 0, slow: 0, cues: [], prev: blankInput(), stats: { tele: {}, teleMin: 9, teleViol: 0, kills: 0, deaths: 0, parries: 0, standoffWins: 0, hits: 0, blocks: 0, blindBlocks: 0, guardBreaks: 0, surprise: 0, nothing: 0 },
    done: false, endT: 0, lethalUnlocked: false, idle: 0,
  };
  s.p = { x: 120, y: 0, vx: 0, vy: 0, face: 1, hp: 4, hpMax: 4, res: 1, resF: 0, st: 'idle', stt: 0, combo: 0, buf: null, bufT: 0, parryT: 9, parryOk: false, lastRel: -9, ifr: 0, hitDone: false, ox: 120, oy: 0, drawn: false, recoil: 0, cid: 0 };
  loadChapter(s, o.chapter ?? 0, o.checkpoint ?? 0);
  if (o.prologue) { s.prologue = true; s.phase = 'narr'; s.card = null; }
  return s;
}

export function D(s) { return DIFF[s.diff]; }
export function ground(s, x) { return groundH(s.ch, x); }

export function loadChapter(s, ch, cp = 0) {
  const C = CHAPTERS[ch]; s.ch = ch; s.len = C.len;
  s.ev = C.ev.map((e, i) => Object.assign({ i, done: false, found: false, revealed: false }, e));
  // checkpoint 0 is the chapter start; checkpoint n is the n-th shrine.
  const shrines = s.ev.filter((e) => e.t === 'shrine');
  let x = 120; if (cp > 0 && shrines[cp - 1]) x = shrines[cp - 1].x + 40;
  for (const e of s.ev) if (e.x < x - 40 && e.t !== 'hidden' && e.t !== 'fox') e.done = true;
  for (const e of s.ev) if ((e.t === 'hidden' && s.hidden.includes(e.id)) || (e.t === 'fox' && s.charms.includes(e.id))) e.done = e.found = true;
  s.cp = cp; s.cpX = x; s.foes = []; s.arrows = []; s.arena = null; s.so = null; s.hk = null; s.token = 0;
  const fe = s.ev.find((e) => e.t === 'fox' && !e.done);
  s.fox = fe ? { ev: fe.i, x: fe.x, st: 'sit', wp: 0, face: -1, t: 0, charm: false } : null;
  const d = D(s); s.p.hpMax = d.hp; s.p.hp = d.hp; s.p.res = Math.max(s.p.res, 1);
  placePlayer(s, x); s.phase = 'play'; s.pt = 0; s.card = { ch, t: cp === 0 ? 0 : 3.2 };
  s.wind.w = C.wind; s.wind.gust = 0;
}
function placePlayer(s, x) { const p = s.p; p.x = p.ox = x; p.y = p.oy = 0; p.vx = p.vy = 0; p.st = 'idle'; p.stt = 0; p.face = 1; p.ifr = 0; p.buf = null; p.recoil = 0; }

// ---------- input helpers ----------
const pressed = (s, I, k) => I[k] && !s.prev[k];
const released = (s, I, k) => !I[k] && s.prev[k];

// ---------- main step ----------
export function step(s, I) {
  s.tick++; s.t += DT; s.pt += DT;
  const p = s.p; p.ox = p.x; p.oy = p.y; for (const f of s.foes) { f.ox = f.x; f.oy = f.y; }
  if (s.card) { s.card.t += DT; if (s.card.t > 5) s.card = null; }
  if (s.hint) { s.hint.t += DT; if (s.hint.t > 4.5) s.hint = null; }
  if (s.slow > 0) s.slow -= DT;
  updateWind(s, I);
  switch (s.phase) {
    case 'play': stepPlay(s, I); break;
    case 'standoff': stepStandoff(s, I); break;
    case 'haiku': stepHaiku(s, I); break;
    case 'dead': if (s.pt > 1.3 || (s.pt > 0.4 && (pressed(s, I, 'confirm') || pressed(s, I, 'slash')))) respawn(s); break; // cheap death: back at the shrine in under 2 s
    case 'narr': if (s.pt > 5.5 || (s.pt > 1.2 && (pressed(s, I, 'confirm') || pressed(s, I, 'slash') || pressed(s, I, 'interact')))) { if (s.prologue) { s.prologue = false; s.phase = 'play'; s.pt = 0; s.card = { ch: s.ch, t: 0 }; } else nextChapter(s); } break;
    case 'ending': stepEnding(s); if (s.pt > 13 || (s.pt > 3 && pressed(s, I, 'confirm'))) { s.phase = 'credits'; s.pt = 0; } break;
    case 'credits': if (s.pt > 26 || (s.pt > 1.5 && pressed(s, I, 'confirm'))) { s.phase = 'fin'; s.pt = 0; s.done = true; s.lethalUnlocked = true; } break;
    case 'fin': break;
  }
  // a fight hint about a foe who is gone (dead, or the fight reset by a death) goes with him
  if (s.hint && s.hint.src != null && !s.foes.some((f) => f.id === s.hint.src && f.st !== 'dead')) s.hint = null;
  updateParticlesLogic(s);
  Object.assign(s.prev, I);
}

function hint(s, id, src) { if (s.hintsSeen[id]) return; s.hintsSeen[id] = 1; s.hint = { id, t: 0, src: src ?? null }; }
// a fight hint is about one foe's moment: it goes when that moment does (his attack resolves, his opening closes, he dies)
const HINT_ENDS = { parry: (st) => st !== 'wind' && st !== 'act', dodge: (st) => st !== 'wind' && st !== 'act', jump: (st) => st !== 'wind' && st !== 'act', riposte: (st) => st !== 'opened', heavy: (st) => st === 'dead' };
function hintFoeState(s, f, st) { const h = s.hint; if (h && h.src === f.id && HINT_ENDS[h.id] && HINT_ENDS[h.id](st)) s.hint = null; }

function updateWind(s, I) {
  const W = s.wind, C = CHAPTERS[s.ch];
  W.cd -= DT; W.gt -= DT;
  if (s.phase === 'play' && pressed(s, I, 'wind') && W.cd <= 0) {
    const tgt = windTarget(s); W.tx = tgt.x; W.dir = tgt.x >= s.p.x ? 1 : -1; W.gt = 2.8; W.cd = 3.2; W.kind = tgt.kind;
    const e = tgt.ev; if (e && e.t === 'hidden') e.revealed = true;
    cue(s, 'gust', { x: s.p.x, tx: tgt.x, kind: tgt.kind });
  }
  W.gust += ((W.gt > 0 ? 1 : 0) - W.gust) * Math.min(1, DT * (W.gt > 0 ? 3 : 1.2));
  const still = s.phase === 'standoff' && s.so && s.so.st !== 'walk' ? 0.02 : 1;
  const base = C.wind * (0.75 + 0.25 * Math.sin(s.t * 0.31) + 0.15 * Math.sin(s.t * 1.13 + 1));
  const target = (base + W.gust * 1.1 * W.dir) * still;
  W.w += (target - W.w) * Math.min(1, DT * (still < 1 ? 2.5 : 1.5));
}
export function windTarget(s) {
  const x = s.p.x;
  // secrets within reach first (they are what the wind is for), then the road.
  let best = null;
  for (const e of s.ev) {
    if (e.done) continue;
    if ((e.t === 'hidden' || e.t === 'haiku' || e.t === 'fox') && Math.abs(e.x - x) < 1500) {
      const tx = e.t === 'fox' && s.fox ? s.fox.x : e.x, d = Math.abs(tx - x) + (tx < x ? 300 : 0);
      if (!best || d < best.d) best = { d, x: tx, kind: e.t, ev: e };
    }
  }
  if (best) return best;
  const nxt = s.ev.find((e) => !e.done && e.x > x && (e.t === 'fight' || e.t === 'standoff' || e.t === 'boss' || e.t === 'shrine'));
  return nxt ? { x: nxt.x, kind: nxt.t, ev: nxt } : { x: s.len, kind: 'road' };
}

// ---------- play ----------
function stepPlay(s, I) {
  const p = s.p, d = D(s);
  if (p.gp > 0) p.gp = Math.max(0, p.gp - DT * 0.2); // guard pressure ebbs
  triggers(s);
  if (s.phase !== 'play') return;
  updatePlayer(s, I);
  // the boss's words: the two stand apart (introGap) until he has spoken, then the duel begins and he closes in
  if (s.bossIntro > 0) {
    const b = s.foes.find((f) => f.boss && f.st !== 'dead');
    if (!b) s.bossIntro = 0;
    else {
      const side = p.x <= b.x ? -1 : 1, lim = b.x + side * COMBAT.introGap; if (side < 0 ? p.x > lim : p.x < lim) { p.x = lim; p.vx = 0; }
      s.bossIntro -= DT; if (s.bossIntro <= 0) { s.bossIntro = 0; b.engaged = true; if (b.st === 'enter') setF(s, b, 'ready'); b.readyT = 0.5 + rnd(s) * 0.4; cue(s, 'duel', { boss: b.boss }); }
    }
  }
  for (const f of s.foes) updateFoe(s, f);
  s.foes = s.foes.filter((f) => !(f.st === 'dead' && f.stt > 2.2));
  updateArrows(s);
  updateFox(s);
  if (s.tokenCD > 0) s.tokenCD -= DT;
  // arena cleared?
  if (s.arena && s.foes.every((f) => f.st === 'dead')) {
    const ev = s.ev[s.arena.ev];
    if (!s.arena.clearT) s.arena.clearT = s.t;
    if (s.t - s.arena.clearT > (s.arena.boss ? 2.6 : 0.8)) {
      ev.done = true; const boss = s.arena.boss; s.arena = null; s.foes = []; s.arrows = [];
      cue(s, 'clear', { boss });
      if (boss) { p.res = s.resMax; s.phase = 'narr'; s.pt = 0; if (s.ch === CHAPTERS.length - 1) { s.phase = 'ending'; s.pt = 0; } }
    }
  }
  // near interactables
  s.near = null;
  if (!s.arena) for (const e of s.ev) {
    const ex = e.t === 'fox' ? (s.fox && s.fox.charm ? e.path[e.path.length - 1] : null) : e.x;
    if (ex == null || Math.abs(ex - p.x) > 56) continue;
    if (e.t === 'shrine') s.near = { kind: 'bow', ev: e.i };
    else if (e.t === 'hidden' && !e.done) s.near = { kind: 'bow', ev: e.i };
    else if (e.t === 'haiku' && !e.done) s.near = { kind: 'sit', ev: e.i };
    else if (e.t === 'fox' && !e.done && s.fox && s.fox.charm) s.near = { kind: 'take', ev: e.i };
  }
  if (s.near && s.near.kind === 'bow' && s.ch === 0) hint(s, 'bow');
  if (s.ch === 0 && s.t > 9 && !s.arena) hint(s, 'wind');
  if (p.hp <= 0 && p.st !== 'dead') die(s);
}

function triggers(s) {
  const p = s.p;
  for (const e of s.ev) {
    if (e.done) continue;
    if (e.t === 'shrine' && p.x >= e.x - 10 && s.cpX < e.x) { s.cpX = e.x + 40; s.cp = s.ev.filter((q) => q.t === 'shrine' && q.x <= e.x).length; cue(s, 'checkpoint', { x: e.x }); }
    if (s.arena) continue;
    if ((e.t === 'fight' || e.t === 'boss') && p.x >= e.x - 90) startFight(s, e);
    else if (e.t === 'standoff' && p.x >= e.x - 200) startStandoff(s, e);
  }
}

function makeFoe(s, type, x, boss) {
  const B = boss ? BOSSES[boss] : null, F = B ? null : FOES[type];
  const hpM = B ? B.hp : F.hp;
  const f = { id: s.nid++, type: B ? B.look : type, boss: boss || null, x, ox: x, y: 0, oy: 0, face: -1, hp: hpM, hpMax: hpM, st: 'enter', stt: 0, atk: null, hitDone: false,
    readyT: 0.6 + rnd(s) * 0.6, phase: 1, shield: B ? 0 : (F.shield ? 1 : 0), w: B ? B.w : F.w, feinting: false, tx: x, vx: 0, retreat: 0, fearT: 0,
    // guard: 0..1, how far his guard is raised (only a fully raised guard blocks); gm: his guard meter (blocked hits so far);
    // engaged: he has fought (swung, blocked or been cut); until then a clean cut is a surprise. kb: knockback velocity.
    guard: 0, gm: 0, gmT: 9, engaged: false, turnT: 0, kb: 0, lastCid: -1 };
  return f;
}
function startFight(s, e) {
  const boss = e.t === 'boss';
  const x0 = e.x - (boss ? 420 : 380), x1 = e.x + (boss ? 400 : 440);
  s.arena = { ev: e.i, x0, x1, boss, clearT: 0 };
  if (boss) { const f = makeFoe(s, null, e.x + 330, e.boss); f.tx = e.x + 160; s.foes.push(f); cue(s, 'boss', { boss: e.boss }); s.bossIntro = COMBAT.bossIntro; }
  else e.foes.forEach((type, i) => {
    const left = i === 2 || (i === 1 && e.foes.length === 2 && type !== 'archer' && s.ch >= 2);
    const fx = left ? x0 - 40 : x1 + 40 + i * 60;
    const f = makeFoe(s, type, fx, null); f.tx = left ? e.x - 260 : e.x + 160 + i * 70; if (type === 'archer') f.tx = x1 - 60; s.foes.push(f);
  });
  if (!boss) cue(s, 'fight', {});
}

// ---------- player ----------
function wantAction(s, I) {
  const p = s.p;
  for (const k of ['dodge', 'parry', 'heavy', 'slash', 'up', 'heal', 'interact']) if (pressed(s, I, k)) { p.buf = k; p.bufT = P.buffer; }
  // the parry window runs from the moment of the press, even if the ronin is still busy and the guard comes up a beat later
  if (pressed(s, I, 'parry')) { p.prevPress = p.pressAt ?? -9; p.pressAt = s.t; }
  if (p.bufT > 0) p.bufT -= DT; else p.buf = null;
}
function canAct(p) { return p.st === 'idle' || p.st === 'move' || p.st === 'air'; }

function updatePlayer(s, I) {
  const p = s.p, d = D(s);
  p.stt += DT; if (p.ifr > 0) p.ifr -= DT; p.parryT += DT; if (p.recoil > 0) p.recoil -= DT;
  wantAction(s, I);
  // after a block the ronin is thrown back: no new cut until the recoil passes (a buffered cut waits for it)
  if (p.recoil > 0 && (p.buf === 'slash' || p.buf === 'heavy')) p.bufT = Math.max(p.bufT, DT * 2);
  const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
  const inFight = !!s.arena; p.drawn = inFight || s.phase === 'standoff';
  // resolve counter: heavy while guarding, spends a pip.
  if (p.st === 'guard' && p.buf === 'heavy' && p.res >= 1) { p.res -= 1; p.buf = null; p.cid++; setP(p, 'counter'); p.ifr = 0.5; cue(s, 'counter', { x: p.x }); }
  switch (p.st) {
    case 'idle': case 'move': case 'air': {
      const sp = I.run ? P.run : P.walk;
      const tv = dir * sp; p.vx += (tv - p.vx) * Math.min(1, DT * (p.y > 0 ? 5 : 14));
      if (dir) p.face = dir;
      if (p.y <= 0) p.st = Math.abs(p.vx) > 8 ? 'move' : 'idle';
      if (p.buf === 'dodge') { p.buf = null; startDodge(s, dir || p.face); break; }
      if (p.buf === 'parry' || (I.parry && p.y <= 0 && p.st !== 'air' && p.buf === null && !s.prev.parry)) { p.buf = null; startGuard(s); break; }
      if (I.parry && p.y <= 0 && s.prev.parry && p.stt > 0.05) { startGuard(s, true); break; }
      if (p.buf === 'heavy' && p.recoil <= 0) { p.buf = null; p.cid++; setP(p, 'heavy'); break; }
      if (p.buf === 'slash' && p.recoil <= 0) { p.buf = null; p.combo = 0; p.cid++; setP(p, 'slash'); break; }
      if (p.buf === 'up' && p.y <= 0) { p.buf = null; p.vy = P.jumpV; p.y = 0.01; p.st = 'air'; p.stt = 0; cue(s, 'jump', { x: p.x }); }
      if (p.buf === 'heal' && p.res >= 1 && p.hp < p.hpMax && p.y <= 0) { p.buf = null; p.res -= 1; setP(p, 'heal'); break; }
      if (p.buf === 'interact' && s.near && p.y <= 0) { p.buf = null; interact(s); break; }
      break;
    }
    case 'guard': {
      p.vx += (dir * P.guardWalk - p.vx) * Math.min(1, DT * 10);
      // a tapped parry still holds the guard long enough to catch the blow it was meant for
      if (!I.parry && s.t - (p.parryAt ?? -9) >= COMBAT.parryHold) { p.lastRel = s.t; setP(p, 'idle'); }
      else if (p.buf === 'dodge') { p.buf = null; startDodge(s, dir || p.face); }
      break;
    }
    case 'dodge': {
      const V = p.vault;
      if (V) { // the forward flip over a foe: an eased arc from take-off to landing, high enough to clear him
        const u = Math.min(1, p.stt / P.dodgeT), e = u * u * (3 - 2 * u), nx = V.from + (V.to - V.from) * e;
        p.vx = (nx - p.x) / DT; p.x = nx; p.y = COMBAT.vaultH * Math.sin(Math.PI * u); p.vy = 0;
        if (p.stt >= P.dodgeT) { p.y = 0; p.vx = 0; p.face = -p.dodgeDir; p.vault = null; setP(p, 'idle'); cue(s, 'land', { x: p.x }); }
        break;
      }
      const k = 1 - p.stt / P.dodgeT; p.vx = p.dodgeDir * P.dodgeV * Math.max(0.15, k * k + 0.1);
      // no room to land beyond him (his back to the wall): the roll stops short of his hip instead of sliding into him
      if (p.dodgeStop != null && (p.x - p.dodgeStop) * p.dodgeDir >= 0) { p.x = p.dodgeStop; p.vx = 0; }
      if (p.stt >= P.dodgeT) { setP(p, 'idle'); p.vx *= 0.3; p.dodgeStop = null; }
      break;
    }
    case 'slash': {
      const A = P.slash[p.combo];
      p.vx += ((p.stt < A.wind + A.act ? p.face * 70 : 0) - p.vx) * Math.min(1, DT * 12);
      if (!p.hitDone && p.stt >= A.wind) { p.hitDone = true; playerHit(s, 'slash', A.reach, p.combo); }
      if (p.stt >= A.wind + A.act) {
        if (p.buf === 'slash' && p.combo < 2 && p.recoil <= 0) { p.buf = null; p.combo++; setP(p, 'slash', true); break; }
        if (p.buf === 'dodge' || p.buf === 'parry') { setP(p, 'idle'); break; }
      }
      if (p.stt >= A.wind + A.act + A.rec) setP(p, 'idle');
      break;
    }
    case 'heavy': case 'counter': {
      const A = p.st === 'heavy' ? P.heavy : P.counter;
      p.vx += ((p.stt > A.wind * 0.6 && p.stt < A.wind + A.act ? p.face * (p.st === 'counter' ? 520 : 150) : 0) - p.vx) * Math.min(1, DT * 14);
      if (!p.hitDone && p.stt >= A.wind) { p.hitDone = true; playerHit(s, p.st, A.reach, 0); }
      if (p.stt >= A.wind + A.act + A.rec) setP(p, 'idle');
      if (p.st === 'heavy' && p.stt >= A.wind + A.act && (p.buf === 'dodge' || p.buf === 'parry')) setP(p, 'idle');
      break;
    }
    case 'hit': p.vx *= 0.9; if (p.stt >= P.hitT) setP(p, 'idle'); break;
    case 'heal': p.vx *= 0.8; if (!p.hitDone && p.stt > 0.45) { p.hitDone = true; p.hp = Math.min(p.hpMax, p.hp + (D(s).heal ?? 2) + (s.charms.includes('fox2') ? 1 : 0)); cue(s, 'heal', { x: p.x }); } if (p.stt >= P.healT) setP(p, 'idle'); break;
    case 'bow': p.vx = 0; if (!p.hitDone && p.stt > 0.6) { p.hitDone = true; bowEffect(s); } if (p.stt >= P.bowT) setP(p, 'idle'); break;
    case 'take': p.vx = 0; if (p.stt >= 1.0) setP(p, 'idle'); break;
    case 'sit': p.vx = 0; break;
    case 'dead': p.vx *= 0.9; break;
  }
  // physics
  if (!p.vault && (p.y > 0 || p.vy > 0)) { p.vy -= P.grav * DT; p.y += p.vy * DT; if (p.y <= 0) { p.y = 0; p.vy = 0; if (p.st === 'air') p.st = 'idle'; cue(s, 'land', { x: p.x }); } }
  const lo = s.arena ? s.arena.x0 : 30, hi = s.arena ? s.arena.x1 : s.len - 20;
  p.x = Math.max(lo, Math.min(hi, p.x + p.vx * DT));
  // foes are solid: no walking through bodies (dodging through is allowed: the roll goes under)
  if (p.st !== 'dodge') for (const f of s.foes) {
    if (f.st === 'dead' || f.st === 'enter') continue;
    // walking up to a foe who is squared up, the ronin stops at the measure (a body and a half); only a strike, or a foe
    // who is reeling or open, lets him close to bodyMin
    const measure = (p.st === 'idle' || p.st === 'move') && (f.st === 'ready' || f.st === 'approach' || f.st === 'block' || f.st === 'wind') && f.type !== 'archer';
    const m = measure ? COMBAT.space - 8 : COMBAT.bodyMin, dx = p.x - f.x;
    // out of a roll that ended inside him, he is eased out rather than snapped
    if (Math.abs(dx) < m) { const to = f.x + (dx >= 0 ? m : -m); p.x += Math.sign(to - p.x) * Math.min(Math.abs(to - p.x), 8); p.x = Math.max(lo, Math.min(hi, p.x)); }
  }
  if ((p.st === 'move') && Math.abs(p.vx) > 40) { p.stepAcc = (p.stepAcc || 0) + Math.abs(p.vx) * DT; if (p.stepAcc > 58) { p.stepAcc = 0; cue(s, 'step', { x: p.x, run: Math.abs(p.vx) > 200 }); } }
  if (p.st === 'idle' && !s.arena) s.idle += DT; else s.idle = 0;
}
// A dodge whose path would cross a live foe becomes a forward flip over him, landing past him facing back (cue 'vault';
// the figure engineer plays the somersault). It keeps the dodge's invulnerability. With no room to land, it stops short.
function startDodge(s, dir) {
  const p = s.p; setP(p, 'dodge'); p.dodgeDir = dir; p.ifr = Math.max(p.ifr, P.dodgeIfr); p.vault = null; p.dodgeStop = null;
  const lo = s.arena ? s.arena.x0 : 30, hi = s.arena ? s.arena.x1 : s.len - 20;
  let over = null;
  for (const f of s.foes) { if (f.st === 'dead' || f.st === 'enter') continue; const d = (f.x - p.x) * dir; if (d > 0 && d < COMBAT.vaultReach && (!over || d < (over.x - p.x) * dir)) over = f; }
  if (over) {
    const to = over.x + dir * COMBAT.vaultPast;
    if (to >= lo && to <= hi && !s.foes.some((g) => g !== over && g.st !== 'dead' && g.st !== 'enter' && Math.abs(g.x - to) < COMBAT.bodyMin)) {
      p.vault = { from: p.x, to, over: over.id }; cue(s, 'vault', { x: p.x, to, id: over.id, dir }); return;
    }
    p.dodgeStop = over.x - dir * COMBAT.bodyMin;
  }
  cue(s, 'dodge', { x: p.x });
}
function setP(p, st, keepCombo) { p.st = st; p.stt = 0; p.hitDone = false; if (!keepCombo && st !== 'slash') p.combo = 0; }
function startGuard(s, held) {
  const p = s.p; setP(p, 'guard'); p.parryT = 0;
  // the parry window needs a fresh press (not a held button) and opens at the press itself (a buffered early press counts);
  // spamming does not stack windows: a press within parrySpam of the previous one opens none
  const at = p.pressAt ?? s.t; p.parryAt = at;
  p.parryOk = !held && s.t - at <= P.buffer + 1e-9 && at - (p.prevPress ?? -9) >= COMBAT.parrySpam; cue(s, 'guard', { x: p.x });
}

function interact(s) {
  const p = s.p, n = s.near, e = s.ev[n.ev]; if (!e || Math.abs((e.t === 'fox' ? e.path[e.path.length - 1] : e.x) - p.x) > 60) return;
  if (n.kind === 'bow') { setP(p, 'bow'); p.bowEv = n.ev; cue(s, 'bowstart', { x: e.x }); }
  else if (n.kind === 'sit') { if (e.done) return; setP(p, 'sit'); p.x = e.x; s.near = null; s.phase = 'haiku'; s.pt = 0; s.hk = { ev: n.ev, ch: s.ch, step: 0, picks: [], done: false, t: 0 }; cue(s, 'sit', {}); }
  else if (n.kind === 'take') { setP(p, 'take'); e.done = e.found = true; if (!s.charms.includes(e.id)) s.charms.push(e.id); if (s.fox) s.fox.st = 'gone'; cue(s, 'charm', { id: e.id }); }
}
function bowEffect(s) {
  const p = s.p, e = s.ev[p.bowEv]; if (!e) return;
  if (e.t === 'shrine') { p.hp = p.hpMax; if (!e.blessed) { e.blessed = true; p.res = Math.min(s.resMax, p.res + 1); } s.cpX = Math.max(s.cpX, e.x + 40); cue(s, 'blessing', { x: e.x }); }
  else if (e.t === 'hidden') { e.done = e.found = true; if (!s.hidden.includes(e.id)) { s.hidden.push(e.id); s.resMax = Math.min(5, s.resMax + 1); } p.res = s.resMax; p.hp = p.hpMax; cue(s, 'secret', { x: e.x, id: e.id }); }
}

function parryWin(s) { return D(s).parry * (s.charms.includes('fox1') ? 1.2 : 1) + COMBAT.parryEarly; }
// a blow landing now is parried if the guard came from a fresh press no longer ago than the window
export function parryLive(s) { const p = s.p; return p.st === 'guard' && p.parryOk && s.t - p.parryAt <= parryWin(s) + 1e-9; }

function playerHit(s, kind, reach, combo) {
  const p = s.p; let any = false;
  cue(s, 'swing', { kind, combo, x: p.x, face: p.face });
  for (const f of s.foes) {
    if (f.st === 'dead') continue; // a foe still walking in, or a boss between phases, can be cut like anyone else
    const dx = (f.x - p.x) * p.face; if (dx < -12 || dx > reach + f.w / 2) continue;
    any = true; hurtFoe(s, f, kind);
  }
  if (!any && s.foes.some((f) => f.st !== 'dead' && Math.abs(f.x - p.x) < reach + 40)) s.stats.nothing++; // a near miss: nobody in the blade's arc
  return any;
}

// ---------- combat rules: what blocks, what lands ----------
// No hidden rolls: whether a cut is blocked depends only on what the player can see (his stance, which way he faces, his
// guard meter), so the same situation always gives the same result.
export function foeGuardMax(f) {
  const F = foeDef(f); if (!F.guard) return 0;
  return F.shield || F.shieldP2 ? (f.shield ? F.guard : 0) : F.guard; // a shield-bearer's guard is the shield
}
// He can block only from a raised guard: squared up and standing (not walking in), facing the ronin, guard fully up.
export function foeGuarded(s, f) {
  return foeGuardMax(f) > 0 && f.guard >= 1 && (f.st === 'ready' || f.st === 'block') && (s.p.x - f.x) * f.face > 0;
}
// committed: deep in his own windup or mid-strike; he trades through a quick cut instead of flinching
function committed(f) { return f.st === 'act' || (f.st === 'wind' && (f.boss || f.stt > 0.12)); }

function hurtFoe(s, f, kind) {
  const p = s.p, F = foeDef(f), C = COMBAT, away = f.x >= p.x ? 1 : -1, mid = (f.x + p.x) / 2;
  const blade = kind === 'slash' || kind === 'heavy' || kind === 'counter';
  // 1. an opened foe (parried, or his guard broken): the riposte. Regular foes die; a boss takes a deep cut.
  if (f.st === 'opened' && kind !== 'arrow') {
    f.engaged = true; f.hp -= f.boss ? C.riposteBoss : 99; s.stats.hits++; cue(s, 'riposte', { x: f.x, id: f.id }); s.slow = 0.35;
    if (f.hp <= 0) return killFoe(s, f, 'riposte');
    setF(s, f, 'stagger'); f.stunT = 0.8; f.kb = away * 160; return;
  }
  // 2. a surprise: he has not fought yet and his guard is not up (walking in, turned away, still squaring up)
  if (!f.engaged && blade && !foeGuarded(s, f)) {
    f.engaged = true; s.stats.hits++; s.stats.surprise++; cue(s, 'surprise', { x: f.x, id: f.id, boss: f.boss });
    if (!f.boss) { const hp = f.hp; f.hp = 0; cue(s, 'cut', { x: f.x, id: f.id, kind, dmg: Math.max(2, hp), surprise: 1 }); return killFoe(s, f, 'surprise'); }
    const dmg = kind === 'slash' ? C.slash : kind === 'heavy' ? C.heavy : C.counter;
    f.hp -= dmg; cue(s, 'cut', { x: f.x, id: f.id, kind, dmg, surprise: 1 });
    if (f.hp <= 0) return killFoe(s, f, kind);
    setF(s, f, 'stagger'); f.stunT = C.surpriseBossStun; f.kb = away * 200; f.lastCid = p.cid; return;
  }
  f.engaged = true;
  // 3. a raised guard blocks. Each block fills his guard meter; the hit that fills it breaks the guard and opens him.
  if ((kind === 'slash' || kind === 'heavy') && foeGuarded(s, f)) {
    const max = foeGuardMax(f);
    f.gm += kind === 'heavy' ? (f.shield ? max : 2) : 1; f.gmT = 0;
    if (f.gm >= max - 1e-6) {
      f.gm = 0; f.guard = 0; f.shield = 0; s.stats.guardBreaks++;
      cue(s, 'guardbreak', { x: f.x, id: f.id, boss: f.boss });
      setF(s, f, 'opened'); f.openT = f.boss ? C.openBrokenBoss : C.openBroken; f.kb = away * 120; hint(s, 'riposte', f.id);
      return;
    }
    s.stats.blocks++; if (!(f.guard >= 1)) s.stats.blindBlocks++;
    cue(s, 'clash', { x: mid, id: f.id, gm: f.gm, max, heavy: kind === 'heavy' ? 1 : 0, shield: f.shield ? 1 : 0 });
    setF(s, f, 'block'); f.guard = 1; f.kb = away * 90;
    // both recoil: the ronin is thrown back and cannot cut again at once; the foe answers (his counter is telegraphed as usual)
    p.recoil = C.recoil; p.vx = -p.face * 170; p.buf = null;
    if (f.shield || F.shield) hint(s, 'heavy', f.id);
    return;
  }
  // 4. it lands. Every landed hit costs him health, shows the cut, and moves him.
  const base = kind === 'slash' ? C.slash : kind === 'arrow' ? C.arrow : kind === 'heavy' ? C.heavy : C.counter;
  const dmg = base * (f.boss && kind === 'slash' ? C.bossQuick : 1);
  f.hp -= dmg; s.stats.hits++; cue(s, 'cut', { x: f.x, id: f.id, kind, dmg });
  if (f.hp <= 0) return killFoe(s, f, kind);
  f.kb = away * (kind === 'slash' ? (f.boss ? 50 : 110) : 190);
  if (f.st === 'shift') return; // the boss is already reeling back into his second stance
  if (f.boss && f.phase === 1 && f.hp <= f.hpMax / 2) { setF(s, f, 'shift'); f.phase = 2; cue(s, 'phase2', { x: f.x, boss: f.boss }); if (BOSSES[f.boss].shieldP2) f.shield = 1; return; }
  if (f.boss) {
    // posture: landed hits push him back and fill his guard meter; when it is full the guard breaks and he is open
    const max = foeGuardMax(f) || 4; f.gm += C.posture[kind] || 0; f.gmT = 0;
    if (f.gm >= max - 1e-6) { f.gm = 0; f.guard = 0; s.stats.guardBreaks++; cue(s, 'guardbreak', { x: f.x, id: f.id, boss: f.boss, posture: 1 }); setF(s, f, 'opened'); f.openT = C.openBrokenBoss; return; }
    if (committed(f) || f.st === 'opened') return; // he trades through it: the cut shows, his blow still comes
    if (kind !== 'slash') { setF(s, f, 'stagger'); f.stunT = 0.6; f.lastCid = p.cid; return; }
    // the first landed quick cut of a combo staggers him briefly (once per exchange); the rest cut and push him, and a
    // boss pressed like that answers with his next attack at once
    if (f.lastCid !== p.cid && s.t >= (f.flinchAt || -9)) { f.lastCid = p.cid; f.flinchAt = s.t + C.bossPoise; setF(s, f, 'stun'); f.stunT = C.bossFlinch; return; }
    f.lastCid = p.cid; if (f.st === 'ready' || f.st === 'approach') f.readyT = Math.min(f.readyT, bossAnswer(s));
    return;
  }
  // regular foes: committed to a strike, an armored foe (or anyone against a quick cut) trades through; otherwise he reels
  if ((F.armor || kind === 'slash') && committed(f)) return;
  if (f.st !== 'act') { setF(s, f, kind === 'slash' ? 'stun' : 'stagger'); f.stunT = kind === 'slash' ? C.stun : C.stagger; }
}
function killFoe(s, f, how) {
  if (s.token === f.id) s.token = 0;
  setF(s, f, 'dead'); f.hp = 0; s.stats.kills++; cue(s, 'kill', { x: f.x, id: f.id, how, boss: f.boss });
  if (f.boss) s.slow = 1.2;
}
function setF(s, f, st) {
  if (s.token === f.id && st !== 'act' && st !== 'wind') { s.token = 0; s.tokenCD = 0.35 / D(s).aggr; }
  hintFoeState(s, f, st);
  f.st = st; f.stt = 0; f.hitDone = false; f.openT = 0; if (st !== 'wind' && st !== 'act' && st !== 'rec') f.feinting = false;
}

// ---------- foes ----------
function foeDef(f) { return f.boss ? BOSSES[f.boss] : FOES[f.type]; }
function windupOf(s, name) { const d = D(s); return Math.max(d.react, ATK[name].wind * d.wind); }

// how soon a boss back on his feet strikes again: quick, but not to the frame (his AI varies; his blocks never do)
function bossAnswer(s) { const [a, b] = COMBAT.bossAnswer; return a + rnd(s) * (b - a); }
function recoverGuard(s, f) { if (foeGuardMax(f) > 0 && (s.p.x - f.x) * f.face > 0) { f.guard = 1; cue(s, 'guardup', { x: f.x, id: f.id }); } }
function updateFoe(s, f) {
  const p = s.p, d = D(s), F = foeDef(f), A = f.atk ? ATK[f.atk] : null;
  f.stt += DT; f.gmT += DT;
  if (f.gmT > COMBAT.postureRest && f.gm > 0) f.gm = Math.max(0, f.gm - DT * COMBAT.postureEbb); // the guard meter ebbs once he is left alone
  const dx = p.x - f.x, dist = Math.abs(dx);
  const lo = s.arena ? s.arena.x0 - 60 : -1e9, hi = s.arena ? s.arena.x1 + 60 : 1e9;
  let mv = 0;
  switch (f.st) {
    case 'enter': {
      const to = f.tx - f.x; mv = Math.sign(to) * Math.min(Math.abs(to) / DT, F.speed * 1.3); f.face = Math.sign(to) || f.face;
      // walking in he stops when he meets the ronin instead of walking through him
      if (Math.abs(to) < 4 || f.stt > 4 || (dist < (f.boss && s.bossIntro > 0 ? COMBAT.introGap + 4 : (f.w + 26) / 2 + 24) && Math.sign(to) === Math.sign(dx))) { setF(s, f, 'ready'); f.readyT = f.boss ? 1.6 + rnd(s) * 0.4 : 0.5 + rnd(s) * 0.5; } // a boss holds his stance before the first cut
      break;
    }
    case 'ready': case 'approach': {
      // he turns to face the ronin, but not instantly: a foe the ronin rolled past is turned away for a moment
      const toP = dx >= 0 ? 1 : -1;
      if (toP !== f.face) { f.turnT += DT; if (f.turnT >= 0.2 || dist > 160) { f.face = toP; f.turnT = 0; f.guard = 0; } } else f.turnT = 0;
      const keep = F.keep, hold = Math.max(COMBAT.space, F.range * 0.7);
      let want = 0;
      if (keep) { if (dist < keep[0]) want = -1; else if (dist > keep[1]) want = 1; }
      // he holds a body and a half away (COMBAT.space) and steps back if crowded; his strikes cover the gap
      else if (dist > hold + 8) want = 1; else if (dist < hold - 14) want = -0.6;
      // in a group, the ones without the token hang back a little
      if (s.token && s.token !== f.id && !keep && dist < F.range * 1.5) want = -0.4;
      // inside his own striking distance he closes with a short guarded shuffle; from further out he walks in, guard down
      const shuffle = want > 0 && !keep && dist <= hold + 40;
      mv = want * F.speed * f.face * (keep && want < 0 ? 1.1 : shuffle ? 0.45 : 1);
      // walking in he is 'approach' (no guard); standing, shuffling or giving ground he is 'ready' and his guard comes up
      f.st = want > 0 && !shuffle ? 'approach' : 'ready';
      if (f.st === 'ready' && f.turnT === 0 && foeGuardMax(f) > 0) { const was = f.guard; f.guard = Math.min(1, f.guard + DT / (F.settle || 0.3)); if (was < 1 && f.guard >= 1) cue(s, 'guardup', { x: f.x, id: f.id }); }
      else f.guard = 0;
      if (f.boss && s.bossIntro > 0) { mv = 0; f.st = 'ready'; break; } // he stands and speaks
      f.readyT -= DT * d.aggr;
      const inRange = keep ? dist < 640 : dist <= Math.max(F.range, hold) + COMBAT.reachIn; // he steps in during the windup to close the rest
      if (f.readyT <= 0 && inRange && !s.token && s.tokenCD <= 0 && p.st !== 'dead' && s.phase === 'play') {
        const list = f.boss ? (f.phase === 2 ? F.p2 : F.p1) : F.moves;
        f.atk = pick(s, f.boss && (p.turtle || 0) >= 2 ? list.map((m) => [m[0], m[1] * (ATK[m[0]].red ? 4 : 1)]) : list);
        if (f.boss && ATK[f.atk].red) p.turtle = 0;
        const fe = f.boss ? F.feint[f.phase - 1] : (F.feint || 0);
        f.feinting = rnd(s) < fe * d.feint; f.feintT = 0.18 + rnd(s) * 0.14;
        s.token = f.id; setF(s, f, 'wind'); f.windT = windupOf(s, f.atk); f.engaged = true; f.guard = 0;
        cue(s, 'tell', { x: f.x, id: f.id, red: !!ATK[f.atk].red, feint: f.feinting });
        if (s.ch === 0) hint(s, ATK[f.atk].red ? 'dodge' : 'parry', f.id); else if (ATK[f.atk].red) hint(s, 'dodge', f.id);
        if (ATK[f.atk].low) hint(s, 'jump', f.id);
      }
      break;
    }
    case 'wind': {
      f.face = dx >= 0 ? 1 : -1;
      if (f.feinting && f.stt >= f.feintT) { f.feinting = false; cue(s, 'feint', { x: f.x, id: f.id }); setF(s, f, 'ready'); f.readyT = 0.25 + rnd(s) * 0.3; if (s.token === f.id) { s.token = 0; s.tokenCD = 0.1; } break; }
      // close a little while winding, if far
      // he steps in through the windup to bring the blow into reach (a lunge to cover the gap he keeps at rest)
      if (!A.arrow && dist > A.reach * 0.85) mv = f.face * Math.max(F.speed * 0.5, (dist - A.reach * 0.8) / Math.max(0.12, f.windT - f.stt));
      if (f.stt >= f.windT) {
        const tele = f.stt; const k = f.atk; s.stats.tele[k] = Math.min(s.stats.tele[k] ?? 9, tele); s.stats.teleMin = Math.min(s.stats.teleMin, tele);
        if (tele < d.react - 1e-6) s.stats.teleViol++;
        setF(s, f, 'act');
      }
      break;
    }
    case 'act': {
      if (A.dash) mv = f.face * (A.dash / A.act);
      if (!f.hitDone) {
        f.hitDone = true;
        if (A.arrow) { s.arrows.push({ x: f.x + f.face * 30, y: 62, vx: f.face * A.arrow, owner: f.id, ref: false, t: 0, ox: f.x }); cue(s, 'shoot', { x: f.x }); }
        else strikePlayer(s, f, A);
      } else if (A.dash && !f.hit2) { /* a dashing hit keeps checking during its frames */ strikePlayer(s, f, A, true); }
      if (f.stt >= A.act) { f.hit2 = false; setF(s, f, 'rec'); if (s.token === f.id && !A.next) { s.token = 0; s.tokenCD = 0.35 / d.aggr; } }
      break;
    }
    case 'rec': {
      // a long-reach boss (the spear) is left overextended after a long attack: that is the opening to walk in and cut
      const overreach = f.boss && F.recLong && (A.reach >= 150 || A.red) ? F.recLong : 1;
      if (f.stt >= A.rec * (d.rec || 1) * overreach * (f.boss ? COMBAT.bossRec[f.phase - 1] : COMBAT.foeRec)) {
        if (A.next) { f.atk = A.next; s.token = f.id; setF(s, f, 'wind'); f.windT = windupOf(s, f.atk); cue(s, 'tell', { x: f.x, id: f.id, red: !!ATK[f.atk].red }); }
        else { if (s.token === f.id) s.token = 0; setF(s, f, 'ready'); f.readyT = (0.4 + rnd(s) * 0.9) * (f.boss ? COMBAT.bossReady[f.phase - 1] : COMBAT.foeReady); f.atk = null; }
      }
      break;
    }
    case 'stun': case 'stagger': {
      mv = -f.face * 40 * Math.max(0, 1 - f.stt * 2);
      // he recovers into his guard stance (the flinch animation ends in it), and a boss answers quickly
      if (f.stt >= f.stunT) { setF(s, f, 'ready'); f.readyT = f.boss ? bossAnswer(s) : 0.3 + rnd(s) * 0.4; recoverGuard(s, f); }
      break;
    }
    case 'block': {
      // he holds the parry pose, then answers at once: the block opens his counter window (a normal, telegraphed attack)
      if (f.stt >= COMBAT.block) { setF(s, f, 'ready'); f.readyT = 0; }
      break;
    }
    case 'opened': if (f.stt >= (f.openT || (f.boss ? 0.95 : 1.25))) { setF(s, f, 'ready'); f.readyT = f.boss ? bossAnswer(s) : 0.4; recoverGuard(s, f); } break;
    // he leaps back out of reach into his second stance
    case 'shift': mv = -f.face * 520 * Math.max(0, 1 - f.stt * 2); if (f.stt >= 1.5) { setF(s, f, 'ready'); f.readyT = 0.3; } break;
    case 'dead': break;
  }
  if (f.st !== 'ready' && f.st !== 'approach' && f.st !== 'block') f.guard = 0; // only a squared-up foe holds a guard
  if (f.kb) { mv += f.kb; f.kb *= Math.exp(-DT * 9); if (Math.abs(f.kb) < 4) f.kb = 0; } // knocked back by a hit or a clash
  f.vx = mv;
  f.x = Math.max(lo, Math.min(hi, f.x + mv * DT));
  // foes do not overlap one another
  if (f.st !== 'dead' && f.st !== 'enter') for (const g of s.foes) {
    if (g === f || g.st === 'dead' || g.st === 'enter') continue; const m = (f.w + g.w) / 2 - 4, ddx = f.x - g.x;
    if (Math.abs(ddx) < m) f.x = g.x + (ddx >= 0 ? m : -m);
  }
  // a striking or lunging foe stops short of the ronin's hip (bodyMin), never through him
  if (f.st !== 'dead' && f.st !== 'enter') { const m = COMBAT.bodyMin; if (Math.abs(f.x - p.x) < m && p.st !== 'dodge') f.x = p.x + (f.x >= p.x ? m : -m); }
}

function strikePlayer(s, f, A, cont) {
  const p = s.p, d = D(s);
  const dx = (p.x - f.x) * f.face; const reach = A.reach + 14;
  if (dx < -10 || dx > reach) return;
  if (cont) f.hit2 = true;
  if (p.st === 'dead') return;
  if (A.low && p.y > 16) { cue(s, 'evade', { x: p.x }); return; }
  if (p.ifr > 0) { cue(s, 'evade', { x: p.x }); return; }
  const guarding = p.st === 'guard' && (f.x - p.x) * p.face > -6;
  if (guarding && !A.red) {
    if (parryLive(s)) {
      p.parryOk = false; p.turtle = 0; s.stats.parries++; setF(s, f, 'opened'); cue(s, 'parry', { x: (p.x + f.x) / 2, id: f.id }); s.slow = 0.18;
      p.resF += 0.5; if (p.resF >= 1) { p.resF -= 1; p.res = Math.min(s.resMax, p.res + 1); }
      hint(s, 'riposte', f.id); if (s.token === f.id) { s.token = 0; s.tokenCD = 0.6; }
      return;
    }
    p.parryOk = false; p.gp = (p.gp || 0) + (f.boss ? 1.5 : 1); p.turtle = (p.turtle || 0) + 1;
    if (p.gp >= (d.guard || 3)) { p.gp = 0; cue(s, 'guardbroken', { x: p.x }); hurtPlayer(s, A.dmg * d.dmg, f.x, A.push); return; }
    cue(s, 'deflect', { x: (p.x + f.x) / 2 }); p.vx = -p.face * (A.dmg > 1 ? 260 : 150); p.stt = 0;
    if (A.dmg > 1 && d.chip) { p.hp -= d.chip; cue(s, 'chip', { x: p.x }); if (p.hp <= 0) die(s); }
    return;
  }
  // a boss's blow that catches the ronin mid-swing (he cut into the glint instead of answering it) is a counter-hit
  const caught = f.boss && (p.st === 'slash' || p.st === 'heavy') ? COMBAT.counterHit : 1;
  if (caught > 1) cue(s, 'counterhit', { x: p.x, id: f.id });
  hurtPlayer(s, A.dmg * d.dmg * caught * (f.boss && f.phase === 2 ? Math.min(d.boss2 || 1, BOSSES[f.boss].boss2 || 9) : 1), f.x, A.push);
}
function hurtPlayer(s, dmg, fromX, push) {
  const p = s.p; p.hp -= dmg; p.ifr = P.ifrHit; setP(p, 'hit'); p.vy = 0; const dir = p.x >= fromX ? 1 : -1; p.vx = dir * (push || 190);
  cue(s, 'hurt', { x: p.x, dmg }); if (p.hp <= 0) die(s);
}
function die(s) {
  const p = s.p; if (s.phase === 'dead') return; p.hp = 0; setP(p, 'dead'); s.phase = 'dead'; s.pt = 0; s.stats.deaths++; cue(s, 'death', { x: p.x });
}
function respawn(s) {
  const p = s.p;
  // un-finish the fight we died in; finished events stay finished
  s.foes = []; s.arrows = []; s.arena = null; s.so = null; s.token = 0; s.tokenCD = 0;
  for (const e of s.ev) if (!e.done && e.x > s.cpX - 60 && e.t === 'standoff') e.started = false;
  placePlayer(s, s.cpX); p.hp = p.hpMax; p.res = Math.max(1, p.res); s.phase = 'play'; s.pt = 0; cue(s, 'respawn', {});
}

function updateArrows(s) {
  const p = s.p;
  for (const a of s.arrows) {
    a.t += DT; a.ox = a.x; a.x += a.vx * DT;
    if (a.dead) continue;
    if (!a.ref) {
      if (Math.abs(a.x - p.x) < 18 && p.st !== 'dead') {
        if (p.ifr > 0 || p.y > 50) continue;
        if (p.st === 'guard' && (a.vx < 0) === (p.face > 0)) {
          if (p.parryOk && s.t - p.parryAt <= parryWin(s) + 0.04) { p.parryOk = false; a.ref = true; a.vx = -a.vx * 1.15; s.stats.parries++; cue(s, 'reflect', { x: a.x }); p.resF += 0.5; if (p.resF >= 1) { p.resF -= 1; p.res = Math.min(s.resMax, p.res + 1); } }
          else { a.dead = true; cue(s, 'deflect', { x: a.x, arrow: 1 }); }
        } else { a.dead = true; hurtPlayer(s, D(s).dmg, a.x - a.vx, 120); }
      }
    } else {
      for (const f of s.foes) if (f.st !== 'dead' && f.st !== 'enter' && Math.abs(f.x - a.x) < f.w / 2 + 6) { a.dead = true; hurtFoe(s, f, 'arrow'); break; }
    }
  }
  const lo = s.arena ? s.arena.x0 - 400 : p.x - 1500, hi = s.arena ? s.arena.x1 + 400 : p.x + 1500;
  s.arrows = s.arrows.filter((a) => !a.dead && a.t < 3 && a.x > lo && a.x < hi);
}

function updateFox(s) {
  const fx = s.fox; if (!fx || fx.st === 'gone') return;
  const e = s.ev[fx.ev], path = CHAPTERS[s.ch].ev[fx.ev].path, p = s.p; fx.t += DT; fx.ox = fx.x;
  const d = p.x - fx.x;
  if (fx.st === 'sit' || fx.st === 'wait') {
    fx.face = d < 0 ? -1 : 1;
    if (Math.abs(d) < (fx.st === 'sit' ? 240 : 200) && fx.wp < path.length) { fx.st = 'run'; cue(s, 'fox', { x: fx.x }); }
  } else if (fx.st === 'run') {
    const to = path[fx.wp] - fx.x; fx.face = Math.sign(to); fx.x += Math.sign(to) * Math.min(Math.abs(to), 330 * DT);
    if (Math.abs(to) < 2) { fx.wp++; fx.st = 'wait'; if (fx.wp >= path.length) { fx.charm = true; fx.st = 'rest'; cue(s, 'foxcharm', { x: fx.x }); } }
  }
  if (e.done) fx.st = 'gone';
}

// ---------- standoff ----------
function startStandoff(s, e) {
  e.started = true;
  s.phase = 'standoff'; s.pt = 0;
  s.so = { ev: e.i, idx: 0, n: e.foes.length, type: e.foes[0], st: 'walk', t: 0, x: e.x, ox: e.x + 520, oppX: e.x + 520, oppOX: e.x + 520, strikeAt: 0, feints: [], win: 0, released: false, result: null };
  cue(s, 'standoff', {}); hint(s, 'focus');
}
function scheduleStandoff(s) {
  const so = s.so, e = s.ev[so.ev], d = D(s);
  const [fa, fb] = e.feints; const nf = Math.round((fa + (fb - fa) * rnd(s)) * d.feint + (so.idx > 0 ? 0.4 : 0));
  const delay = 1.3 + rnd(s) * 2.0 + nf * 0.65;
  so.feints = []; let t = 0.6 + rnd(s) * 0.4;
  for (let i = 0; i < nf; i++) { if (t > delay - 0.55) break; so.feints.push(t); t += 0.6 + rnd(s) * 0.5; }
  // every real draw is preceded by the same tell (hand closes on the hilt, weight drops: cue 'drawtell') drawTell seconds
  // before the window opens; feints (a shoulder twitch, cue 'feinttell') always finish well before that tell starts
  const lastFeint = so.feints.length ? so.feints[so.feints.length - 1] : -9;
  so.strikeAt = Math.max(delay, lastFeint + 0.32 + 0.15 + COMBAT.drawTell); so.tellAt = so.strikeAt - COMBAT.drawTell;
  so.win = d.standoff * Math.pow(0.85, so.idx); so.t = 0; so.told = false; so.closed = false; so.slowK = 1;
  // the very first standoff of chapter 1 teaches the cue: time slows from the tell and a "Now" prompt marks the window
  so.teach = s.ch === 0 && so.idx === 0 && !s.hintsSeen.drawteach && s.ev[so.ev] === s.ev.find((q) => q.t === 'standoff');
}
function standoffWin(s) {
  const so = s.so; if (!so.closed) { so.closed = true; cue(s, 'drawwin', { open: 0 }); }
  so.st = 'cut'; so.t = 0; so.slowK = 1; so.result = 'win'; s.stats.standoffWins++; cue(s, 'socut', {}); s.slow = 0.6;
}
// the pass, for the figure engineer (extreme pose, then sheathe) and the ink engineer (the long arc from .from to .to)
export function standoffPass(so) {
  if (!so || so.st !== 'cut' || !so.pass) return null; const C = COMBAT, t = so.t;
  if (t < C.passDash) return { phase: 'dash', k: t / C.passDash, from: so.pass.from, to: so.pass.to };
  if (t < C.passDash + C.passHold) return { phase: 'hold', k: (t - C.passDash) / C.passHold, from: so.pass.from, to: so.pass.to };
  return { phase: 'sheathe', k: Math.min(1, (t - C.passDash - C.passHold) / C.passSheathe), from: so.pass.from, to: so.pass.to };
}
export function standoffPose(so) {
  if (!so) return 'none';
  if (so.st === 'hold') { for (const ft of so.feints) if (so.t >= ft && so.t < ft + 0.32) return 'feint'; return so.tellAt != null && so.t >= so.tellAt ? 'tell' : 'wait'; }
  return so.st;
}
function stepStandoff(s, I) {
  const so = s.so, p = s.p, d = D(s); so.t += DT * (so.slowK || 1); p.drawn = true;
  so.oppOX = so.oppX;
  const markP = so.x - 150, markO = so.x + 150;
  switch (so.st) {
    case 'walk': {
      p.face = 1; const to = markP - p.x; p.vx = Math.sign(to) * Math.min(Math.abs(to) / DT, P.walk); p.x += p.vx * DT; p.st = Math.abs(to) > 2 ? 'move' : 'idle';
      const tO = markO - so.oppX; so.oppX += Math.sign(tO) * Math.min(Math.abs(tO), 150 * DT);
      if (so.t > 1.8 && Math.abs(to) < 3 && Math.abs(tO) < 3) { so.st = 'ready'; so.t = 0; p.st = 'idle'; p.vx = 0; }
      break;
    }
    case 'ready':
      p.st = I.focus ? 'focus' : 'idle';
      if (I.focus) { so.st = 'hold'; scheduleStandoff(s); cue(s, 'hold', {}); }
      else if (so.t > 9) { so.st = 'fail'; so.t = 0; so.result = 'timeout'; cue(s, 'sofail', {}); }
      break;
    case 'hold': {
      p.st = 'focus';
      const pose = standoffPose(so);
      if (pose === 'feint' && !so.fcue) { so.fcue = true; cue(s, 'sofeint', {}); cue(s, 'feinttell', { x: so.oppX }); } else if (pose !== 'feint') so.fcue = false;
      if (pose === 'tell' && !so.told) { so.told = true; cue(s, 'drawtell', { x: so.oppX, lead: COMBAT.drawTell }); if (so.teach) { so.slowK = COMBAT.drawTeachSlow; s.hintsSeen.drawteach = 1; } }
      // a release a hair before the window (drawGrace) still counts; earlier than that is too early (a feint, or a guess)
      if (!I.focus) { if (so.told && so.t >= so.strikeAt - COMBAT.drawGrace) { standoffWin(s); break; } so.st = 'fail'; so.t = 0; so.slowK = 1; so.result = 'early'; cue(s, 'sofail', { early: 1, feint: pose === 'feint' ? 1 : 0 }); break; }
      if (so.t >= so.strikeAt) { so.st = 'strike'; so.ts = 0; cue(s, 'sodraw', {}); cue(s, 'drawwin', { open: 1, win: so.win }); if (so.teach) { s.hint = null; delete s.hintsSeen.now; hint(s, 'now'); } } // the window is the draw: "Now" on that frame
      break;
    }
    case 'strike': {
      so.ts += DT * (so.slowK || 1);
      if (!I.focus) { standoffWin(s); break; }
      if (so.ts >= so.win && !so.closed) { so.closed = true; cue(s, 'drawwin', { open: 0 }); }
      if (so.ts > so.win + COMBAT.drawGrace) { so.st = 'fail'; so.t = 0; so.slowK = 1; so.result = 'late'; cue(s, 'sofail', { late: 1 }); }
      break;
    }
    case 'cut': {
      // the ronin crosses past the opponent in one stroke
      // the one-stroke pass: a dash to well past him (sopass), the extreme held, then a slow sheathe while he falls
      if (!so.pass) { so.pass = { from: p.x, to: so.oppX + COMBAT.passPast }; cue(s, 'sopass', { from: so.pass.from, to: so.pass.to, x: so.oppX }); }
      { const P2 = standoffPass(so); p.st = 'iai'; p.face = 1; p.x = so.pass.from + (so.pass.to - so.pass.from) * (P2.phase === 'dash' ? 1 - Math.pow(1 - P2.k, 3) : 1); p.passPhase = P2.phase; }
      if (so.t > 1.5) {
        so.idx++;
        if (so.idx >= so.n) { const e = s.ev[so.ev]; e.done = true; s.phase = 'play'; s.pt = 0; s.so = null; p.st = 'idle'; p.res = Math.min(s.resMax, p.res + 1); cue(s, 'sowon', {}); return; }
        so.pass = null; p.passPhase = null;
        so.type = s.ev[so.ev].foes[so.idx]; so.st = 'next'; so.t = 0; so.oppX = p.x + 700; so.oppOX = so.oppX; so.x = p.x + 150;
      }
      break;
    }
    case 'next': {
      p.face = 1; p.st = 'idle';
      const tO = so.x + 150 - so.oppX; so.oppX += Math.sign(tO) * Math.min(Math.abs(tO), 220 * DT);
      if (so.t > 1.6 && Math.abs(tO) < 3) { so.st = 'ready'; so.t = 0; }
      break;
    }
    case 'fail': {
      if (so.t < 0.05 && !so.hurt) { so.hurt = true; if (so.result !== 'timeout') hurtPlayer(s, D(s).dmg, so.oppX, 170); }
      if (so.t > 0.9 || s.phase === 'dead') {
        if (s.phase === 'dead') return;
        // the rest of them come at you for real
        const e = s.ev[so.ev]; const rest = e.foes.slice(so.idx);
        s.phase = 'play'; s.pt = 0; s.arena = { ev: e.i, x0: p.x - 300, x1: p.x + 520, boss: false, clearT: 0, fromStandoff: true };
        rest.forEach((type, i) => { const f = makeFoe(s, type, i === 0 ? so.oppX : p.x + 600 + i * 60, null); f.tx = p.x + 180 + i * 80; if (i === 0) { f.st = 'ready'; f.readyT = 0.8; } s.foes.push(f); });
        s.so = null; if (p.st !== 'hit') p.st = 'idle';
      }
      break;
    }
  }
}

// ---------- haiku ----------
function stepHaiku(s, I) {
  const hk = s.hk; hk.t += DT; const p = s.p; p.st = 'sit'; p.stt += DT;
  if (!hk.done) {
    if (I.choose && !s.prev.choose && hk.t > 0.8) { hk.picks.push(I.choose - 1); hk.step++; hk.t = 0.4; cue(s, 'pluck', { step: hk.step }); if (hk.step >= 3) { hk.done = true; hk.t = 0; const H = HAIKU[hk.ch]; const lines = hk.picks.map((k, i) => H.lines[i][k]); s.haikus.push({ ch: hk.ch, jp: H.jp, lines }); cue(s, 'haiku', { ch: hk.ch, lines }); } }
    if (pressed(s, I, 'cancel') || pressed(s, I, 'dodge')) { s.phase = 'play'; s.hk = null; setP(p, 'idle'); return; }
  } else if (hk.t > 7 || (hk.t > 1.5 && (pressed(s, I, 'confirm') || pressed(s, I, 'slash') || pressed(s, I, 'interact') || pressed(s, I, 'cancel')))) {
    s.ev[hk.ev].done = true; s.phase = 'play'; s.hk = null; setP(p, 'idle');
  }
}

// ---------- chapters ----------
function nextChapter(s) {
  if (s.ch + 1 >= CHAPTERS.length) { s.phase = 'ending'; s.pt = 0; return; }
  const p = s.p; p.res = Math.max(p.res, 1);
  loadChapter(s, s.ch + 1, 0); cue(s, 'chapter', { ch: s.ch });
}
function stepEnding(s) { const p = s.p; p.st = s.pt < 2.5 ? 'idle' : 'kneel'; p.vx = 0; }
function updateParticlesLogic() {}

// A compact digest for tests (determinism) and save hooks.
export function digest(s) { return [s.tick, s.ch, s.phase, Math.round(s.p.x), s.p.hp, s.foes.length, s.stats.kills, s.stats.parries].join(':'); }
