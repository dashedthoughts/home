// KAZE bot: a scripted player that reads the simulation state and plays fair-ish (it reacts to telegraphs,
// it does not peek at RNG). Used by the node test and by window.__game.bot(true).
import { ATK } from './data.js';
import { D, blankInput, DT } from './sim.js';

export function makeBot(o = {}) { return { k: 0, guardUntil: 0, sloppy: o.sloppy || 0, seed: o.seed || 1, secrets: o.secrets ?? false, haiku: o.haiku ?? true }; }

export function botInput(s, m) {
  const I = blankInput(), p = s.p; m.k++;
  const tap = (k) => { if (!s.prev[k]) I[k] = true; };
  switch (s.phase) {
    case 'narr': case 'ending': case 'credits': case 'dead': case 'fin': if (m.k % 24 === 0) I.confirm = true; return I;
    case 'haiku': {
      const hk = s.hk; if (!hk) return I;
      if (!hk.done) { if (m.k % 40 === 0) I.choose = 1 + ((hk.step + s.ch) % 3); } else if (m.k % 40 === 0) I.confirm = true;
      return I;
    }
    case 'standoff': {
      const so = s.so; if (!so) return I;
      if (so.st === 'ready' || so.st === 'hold') I.focus = true;
      else if (so.st === 'strike') I.focus = so.ts < Math.min(0.14, so.win * 0.5);
      return I;
    }
  }
  if (s.phase !== 'play') return I;
  const d = D(s), pw = d.parry;
  const foes = s.foes.filter((f) => f.st !== 'dead' && f.st !== 'enter');
  // most urgent incoming melee attack
  let th = null;
  for (const f of foes) {
    if (f.st !== 'wind' && !(f.st === 'act' && ATK[f.atk].dash)) continue;
    const A = ATK[f.atk]; if (A.arrow) continue;
    const dist = Math.abs(f.x - p.x); if (dist > A.reach + 60 + (A.dash || 0)) continue;
    const tl = f.st === 'act' ? 0 : f.windT - f.stt;
    if (!th || tl < th.tl) th = { f, A, tl, dist };
  }
  let arrow = null;
  for (const a of s.arrows) { if (a.ref) continue; const toward = (p.x - a.x) * a.vx > 0; if (!toward) continue; const ta = (Math.abs(a.x - p.x) - 18) / Math.abs(a.vx); if (!arrow || ta < arrow.ta) arrow = { a, ta }; }
  const busy = p.st === 'slash' || p.st === 'heavy' || p.st === 'counter' || p.st === 'heal' || p.st === 'bow' || p.st === 'dodge' || p.st === 'hit';
  // keep holding guard through the hit
  if (m.guardUntil > s.t) { I.parry = true; if (th && th.f.st === 'act') I.parry = true; return I; }
  if (th) {
    const face = th.f.x > p.x ? 1 : -1;
    if (th.A.red) {
      if (th.tl <= 0.09) { if (face > 0) I.left = true; else I.right = true; tap('dodge'); return I; }
    } else if (th.tl <= pw * 0.5 + 0.017) {
      if (p.face !== face && !busy) { if (face > 0) I.right = true; else I.left = true; }
      I.parry = !s.prev.parry; if (I.parry) m.guardUntil = s.t + 0.25; return I;
    }
  }
  if (arrow && arrow.ta <= pw * 0.45 + 0.017) { const face = arrow.a.vx < 0 ? 1 : -1; if (p.face !== face) { if (face > 0) I.right = true; else I.left = true; } I.parry = !s.prev.parry; if (I.parry) m.guardUntil = s.t + 0.15; return I; }
  if (arrow && arrow.ta < 0.5) { const face = arrow.a.vx < 0 ? 1 : -1; if (p.face !== face && !busy) { if (face > 0) I.right = true; else I.left = true; } return I; }
  const soon = th && th.tl < 0.42;
  if (foes.length) {
    // riposte anything we opened
    const open = foes.find((f) => f.st === 'opened' && Math.abs(f.x - p.x) < 120);
    let tgt = open || foes.slice().sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    const face = tgt.x > p.x ? 1 : -1, dist = Math.abs(tgt.x - p.x);
    if (p.hp <= Math.ceil(p.hpMax / 2) && p.res >= 1 && !th && !arrow && !busy && !open) { tap('heal'); return I; }
    if (dist > 95) { if (face > 0) I.right = true; else I.left = true; I.run = dist > 200; return I; }
    if (p.face !== face && !busy) { if (face > 0) I.right = true; else I.left = true; return I; }
    if (soon && !open) return I;
    if (tgt.shield && (tgt.x - p.x) * tgt.face < 0 && !open) { if (p.st === 'idle' || p.st === 'move') tap('heavy'); return I; }
    if (open || tgt.st === 'stun' || tgt.st === 'stagger' || tgt.st === 'rec' || tgt.st === 'ready' || tgt.st === 'approach' || tgt.st === 'shift') tap('slash');
    return I;
  }
  // exploring
  if (s.near && !busy) {
    const e = s.ev[s.near.ev];
    if (s.near.kind === 'bow' && (e.t === 'hidden' ? m.secrets : (p.hp < p.hpMax || !e.blessed))) { tap('interact'); return I; }
    if (s.near.kind === 'sit' && m.haiku) { tap('interact'); return I; }
    if (s.near.kind === 'take') { tap('interact'); return I; }
  }
  if (s.fox && m.secrets && s.fox.st !== 'gone' && Math.abs(s.fox.x - p.x) < 600) {
    const fx = s.fox.charm ? s.fox.x : s.fox.x + (s.fox.st === 'sit' ? 0 : 0);
    if (Math.abs(fx - p.x) > 20) { if (fx > p.x) I.right = true; else I.left = true; return I; }
  }
  if (m.k % 600 === 120) tap('wind');
  I.right = true; I.run = true;
  return I;
}

// ---------- human-like personas for playability checks ----------
// They see what a player sees (the glint when a windup starts, the arrow in flight), react after a delay, and make
// mistakes. masher: quick cut only. learner: 250 ms, guards late, parries one telegraph in three, heals when low.
// competent: 180 ms, parries most telegraphs, dodges the red ones.
export function makePersona(kind, seed = 1) {
  const P = { masher: { rt: 0.3, parry: 0, guard: 0, dodge: 0, heal: false, so: 'random', haiku: false, greed: 1 },
    learner: { rt: 0.25, jit: 0.3, miss: 0.15, parry: 0.34, guard: 0.85, dodge: 0.45, heal: true, so: 'late', haiku: true, greed: 0.25 },
    competent: { rt: 0.18, jit: 0.12, miss: 0.05, parry: 0.8, guard: 1, dodge: 0.85, heal: true, so: 'good', haiku: true, greed: 0.12 } }[kind];
  return Object.assign({ kind, r: (seed * 2654435761) >>> 0 || 7, k: 0, plans: new Map(), guardUntil: 0, nextCut: 0, soRel: null }, P);
}
function pr(m) { m.r = (Math.imul(m.r, 1664525) + 1013904223) >>> 0; return m.r / 4294967296; }
export function personaInput(s, m) {
  const I = blankInput(), p = s.p; m.k++;
  const tap = (k) => { if (!s.prev[k]) I[k] = true; };
  if (s.phase === 'narr' || s.phase === 'ending' || s.phase === 'credits' || s.phase === 'fin' || s.phase === 'dead') { if (m.k % 30 === 0) I.confirm = true; return I; }
  if (s.phase === 'haiku') { const hk = s.hk; if (hk && !hk.done) { if (m.k % 50 === 0) I.choose = 1 + ((pr(m) * 3) | 0); } else if (m.k % 50 === 0) I.confirm = true; return I; }
  if (s.phase === 'standoff') {
    const so = s.so; if (!so) return I;
    if (so.st === 'ready') { m.soRel = null; I.focus = true; return I; }
    if (so.st === 'hold' || so.st === 'strike') {
      if (m.soRel == null) m.soRel = m.so === 'random' ? 0.4 + pr(m) * 3 : -1;
      if (m.so === 'random') { I.focus = so.t < m.soRel && so.st !== 'strike' ? true : so.st === 'strike' ? so.ts < m.soRel - so.strikeAt : false; return I; }
      // feints catch the learner one time in four, the competent one time in ten
      const fooled = (m.so === 'late' ? 0.25 : 0.1);
      if (so.st === 'hold') { const ft = so.feints.find((x) => so.t >= x + m.rt && so.t < x + m.rt + DT * 1.5); if (ft != null && pr(m) < fooled) return I; I.focus = true; return I; }
      I.focus = so.ts < m.rt + (pr(m) - 0.5) * 0.08; return I;
    }
    return I;
  }
  if (s.phase !== 'play') return I;
  const foes = s.foes.filter((f) => f.st !== 'dead' && f.st !== 'enter');
  // perceive new telegraphs and plan a response that lands after the reaction time
  for (const f of foes) if (f.st === 'wind' && f.stt < DT * 1.5) {
    const A = ATK[f.atk]; const roll = pr(m); let act = 'none';
    if (pr(m) < (m.miss || 0) || pr(m) < m.greed) act = 'none'; // missed it, or greed: keeps cutting through the telegraph
    else if (A.red || A.low) act = roll < m.dodge ? 'dodge' : 'none';
    else if (roll < m.parry) act = 'parry'; else if (roll < m.parry + (1 - m.parry) * m.guard) act = 'guard';
    m.plans.set(f.id, { act, t0: s.t, windT: f.windT, jit: (pr(m) - 0.5) * 0.06 + pr(m) * pr(m) * (m.jit || 0) });
  }
  if (m.guardUntil > s.t) { I.parry = true; return I; }
  for (const f of foes) {
    const pl = m.plans.get(f.id); if (!pl || f.st !== 'wind') continue;
    const since = s.t - pl.t0, left = f.windT - f.stt, dist = Math.abs(f.x - p.x);
    if (since < m.rt + pl.jit || dist > ATK[f.atk].reach + 80 + (ATK[f.atk].dash || 0)) continue;
    if (pl.act === 'guard') { I.parry = !s.prev.parry; m.guardUntil = s.t + left + 0.3; pl.act = 'done'; return I; }
    if (pl.act === 'parry' && left <= 0.09 + pl.jit) { I.parry = !s.prev.parry; m.guardUntil = s.t + 0.25; pl.act = 'done'; return I; }
    if (pl.act === 'dodge' && left <= 0.1) { if (f.x > p.x) I.left = true; else I.right = true; tap('dodge'); pl.act = 'done'; return I; }
  }
  // arrows: the competent parry them back, others guard or eat them
  for (const a of s.arrows) { if (a.ref || (p.x - a.x) * a.vx <= 0) continue; const ta = (Math.abs(a.x - p.x) - 18) / Math.abs(a.vx); if (ta < 0.12 && m.guard > 0 && pr(m) < 0.5 + m.parry * 0.5) { const face = a.vx < 0 ? 1 : -1; if (p.face !== face) { if (face > 0) I.right = true; else I.left = true; } I.parry = !s.prev.parry; m.guardUntil = s.t + 0.2; return I; } }
  const busy = p.st !== 'idle' && p.st !== 'move' && p.st !== 'air';
  if (foes.length) {
    const tgt = foes.slice().sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0], face = tgt.x > p.x ? 1 : -1, dist = Math.abs(tgt.x - p.x);
    if (m.heal && p.hp <= 2 && p.res >= 1 && !busy && !foes.some((f) => f.st === 'wind')) { tap('heal'); return I; }
    if (dist > 100) { if (face > 0) I.right = true; else I.left = true; return I; }
    if (p.face !== face && !busy) { if (face > 0) I.right = true; else I.left = true; return I; }
    if (m.kind !== 'masher' && tgt.shield && (tgt.x - p.x) * tgt.face < 0 && !busy) { if (pr(m) < 0.05) tap('heavy'); return I; }
    if (s.t >= m.nextCut) { tap('slash'); m.nextCut = s.t + (m.kind === 'masher' ? 0.1 : 0.16 + pr(m) * 0.25); }
    return I;
  }
  if (s.near && !busy) {
    const e = s.ev[s.near.ev];
    if (s.near.kind === 'bow' && e.t === 'shrine' && m.heal && p.hp < p.hpMax) { tap('interact'); return I; }
    if (s.near.kind === 'sit' && m.haiku) { tap('interact'); return I; }
  }
  I.right = true; I.run = m.kind !== 'learner' || pr(m) < 0.6;
  return I;
}
