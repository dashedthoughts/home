// KAZE bot: a scripted player that reads the simulation state and plays fair-ish (it reacts to telegraphs,
// it does not peek at RNG). Used by the node test and by window.__game.bot(true).
import { ATK } from './data.js';
import { D, blankInput } from './sim.js';

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
