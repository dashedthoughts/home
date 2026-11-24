// NEON KUMITE · deterministic 60 Hz simulation. Pure, DOM-free.
// One call to step(S, in1, in2) advances one frame. Inputs are bitmasks (B below), the same for humans, CPU, replays and tests.
import { FIGHTERS, moveTotal } from './data.js';

export const B = { U: 1, D: 2, L: 4, R: 8, LP: 16, HP: 32, SP: 64 };
export const FPS = 60;
export const STAGE_L = 0, STAGE_R = 1100, MAX_SEP = 500;
const HOLD_SPREAD = 1.4, PUSH_PAD = 8; // PUSH_PAD keeps a visible gap between bodies, also in the corner
const BUF = 6, COMBO_WIN = 3, CW = 10, JUG_MAX = 3, JUG_G = 0.56, TECH_WIN = 10;
const INTRO_LEN = 110, INTRO_FIGHT = 76, ROUND_FRAMES = 60 * 60, KO_LEN = 190, TIMEOVER_LEN = 150;
const STAND_ST = new Set(['idle', 'walk', 'crouch', 'guard']);
const ACTIONABLE = new Set(['idle', 'walk', 'crouch', 'guard']);

export const charOf = (f) => FIGHTERS[f.id];
export const moveOf = (f) => (f.mv ? FIGHTERS[f.id].moves[f.mv] : null);

function mkFighter(id, side) {
  const c = FIGHTERS[id];
  return {
    id, side, x: 0, y: 0, vx: 0, vy: 0, face: side ? -1 : 1, hp: c.hp, maxhp: c.hp, meter: 0,
    st: 'idle', sf: 0, mv: null, mf: 0, hitN: 0, nextHit: 0, contact: 0, contactHit: 0, chain: 0, hs: 0, stun: 0,
    pv: 0, pdir: 0, pushFrom: -1, jug: 0, combo: { hits: 0, dmg: 0, spent: 0 }, tinv: 0, armor: 0, airUsed: 0,
    inp: 0, prev: 0, ba: { L: 99, H: 99, S: 99 }, ra: { L: 99, H: 99, S: 99 }, tapF: -99, tapB: -99, dashReq: null, dashReqT: 0, dashDir: 0,
    react: 'gut', crouchBlk: 0, grab: null, heldBy: -1, landRec: 0, counter: 0, blocks: 0, lastHitBy: null, idleT: 0, prevSt: 'idle', wins: 0, upgrade: 0,
  };
}

export function createMatch(o = {}) {
  const S = {
    frame: 0, phase: 'intro', pt: 0, round: 1, timer: ROUND_FRAMES, freeze: 0, freezeBy: -1, freezeKind: '',
    stage: o.stage || 'viaduct', f: [mkFighter(o.p1 || 'rin', 0), mkFighter(o.p2 || 'ganji', 1)], proj: [], events: [], pid: 0,
    training: !!o.training, refill: o.refill !== false, result: null, roundWinner: -1, perfect: 0, rounds: [], log: { maxCombo: [0, 0], maxComboSpent: [0, 0] },
  };
  resetRound(S);
  if (o.training) { S.phase = 'fight'; S.timer = -1; }
  return S;
}

function resetRound(S) {
  const [a, b] = S.f;
  for (const f of S.f) {
    const keep = { meter: f.meter, wins: f.wins };
    Object.assign(f, mkFighter(f.id, f.side), keep);
  }
  a.x = 550 - 130; b.x = 550 + 130; a.face = 1; b.face = -1;
  S.proj.length = 0; S.timer = S.training ? -1 : ROUND_FRAMES; S.phase = S.training ? 'fight' : 'intro'; S.pt = 0; S.freeze = 0; S.perfect = 0; S.roundWinner = -1;
}
export function resetPositions(S) { const r = S.round; resetRound(S); S.round = r; }

// ------------------------------------------------------------------ input
function readInput(f, bits, frozen) {
  f.prev = f.inp; f.inp = bits | 0;
  const pr = f.inp & ~f.prev;
  for (const [k, bit] of [['L', B.LP], ['H', B.HP], ['S', B.SP]]) {
    if (pr & bit) { f.ba[k] = 0; f.ra[k] = 0; if (k === 'S') f.sdir = f.inp & 15; }
    else if (!frozen) { if (f.ba[k] < 99) f.ba[k]++; if (f.ra[k] < 99) f.ra[k]++; }
  }
  if (frozen) return;
  if (f.dashReqT > 0) f.dashReqT--; else f.dashReq = null;
  const fwd = f.face > 0 ? B.R : B.L, back = f.face > 0 ? B.L : B.R;
  const vert = f.inp & (B.U | B.D);
  if ((pr & fwd) && !vert) { if (f.frameC - f.tapF <= 12) { f.dashReq = 'f'; f.dashReqT = 3; f.tapF = -99; } else f.tapF = f.frameC; }
  if ((pr & back) && !vert) { if (f.frameC - f.tapB <= 12) { f.dashReq = 'b'; f.dashReqT = 3; f.tapB = -99; } else f.tapB = f.frameC; }
  f.frameC = (f.frameC || 0) + 1;
}
const held = (f, bit) => (f.inp & bit) !== 0;
const fwdHeld = (f) => held(f, f.face > 0 ? B.R : B.L);
const backHeld = (f) => held(f, f.face > 0 ? B.L : B.R);
function holdsAway(f, fromX) {
  const s = fromX > f.x ? 1 : fromX < f.x ? -1 : f.face;
  return held(f, s > 0 ? B.L : B.R) && !held(f, s > 0 ? B.R : B.L);
}
const btn = (f, k) => f.ba[k] < BUF;
const pair = (f, a, b) => btn(f, a) && btn(f, b) && Math.abs(f.ba[a] - f.ba[b]) < COMBO_WIN;
const consume = (f, ...ks) => { for (const k of ks) f.ba[k] = 99; };

// What the player is asking for this frame (null = nothing).
function requested(f, air) {
  const mv = charOf(f).moves;
  const L = btn(f, 'L'), H = btn(f, 'H'), Sp = btn(f, 'S');
  if (!air) {
    if (L && H && Sp && pair(f, 'L', 'S') && pair(f, 'H', 'S') && f.meter >= 1000) return ['SU', 'L', 'H', 'S'];
    if (pair(f, 'S', 'H') && f.meter >= 500 && mv.EX) return ['EX', 'S', 'H'];
    if (pair(f, 'L', 'H')) return ['TH', 'L', 'H'];
    if (Sp) {
      // the direction held when Special was pressed decides the special (so a press buffered in hit-stop keeps its intent)
      const dirs = (f.sdir || 0) | (f.inp & 15), fwd = f.face > 0 ? B.R : B.L, bk = f.face > 0 ? B.L : B.R;
      let d = dirs & B.D ? 'dS' : (dirs & fwd) && !(dirs & bk) ? 'fS' : (dirs & bk) && !(dirs & fwd) ? 'bS' : 'S';
      if (f.sdir != null && (f.sdir & 15) === 0 && f.ba.S === 0) d = held(f, B.D) ? 'dS' : fwdHeld(f) ? 'fS' : backHeld(f) ? 'bS' : 'S';
      if (!mv[d]) d = 'S';
      return [d, 'S'];
    }
    if (H) return [held(f, B.D) ? 'H2' : 'H5', 'H'];
    if (L) return [held(f, B.D) ? 'L2' : 'L5', 'L'];
  } else {
    if (Sp && mv.jS) return ['jS', 'S'];
    if (H) return ['Hj', 'H'];
    if (L) return ['Lj', 'L'];
  }
  return null;
}

// ------------------------------------------------------------------ helpers
export function isAir(f) { return f.y > 0.01 || f.st === 'air' || f.st === 'juggle' || f.st === 'reset' || (f.st === 'atk' && moveOf(f) && moveOf(f).air); }
export function isActionable(f) { return ACTIONABLE.has(f.st) || (f.st === 'air' && !f.airUsed); }
function crouching(f) {
  if (f.st === 'crouch') return true;
  if ((f.st === 'block' || f.st === 'hit') && f.crouchBlk) return true;
  if (f.st === 'atk' && (f.mv === 'L2' || f.mv === 'H2')) return true;
  return false;
}
const wbox = (f, b, oy = 0) => (f.face > 0 ? [f.x + b[0], f.y + b[1] + oy, f.x + b[2], f.y + b[3] + oy] : [f.x - b[2], f.y + b[1] + oy, f.x - b[0], f.y + b[3] + oy]);
const ov = (p, q) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];

export function hurtboxes(f) {
  const c = charOf(f); const out = [];
  if (f.st === 'down' || f.st === 'dead' || f.st === 'held') return out;
  const m = moveOf(f);
  let top = c.hh;
  if (crouching(f)) top = c.ch;
  if (f.st === 'atk' && m && m.lp && f.mf >= m.lp[0] && f.mf <= m.lp[1]) top = m.lp[2];
  if (isAir(f) && f.st !== 'atk') out.push(wbox(f, [-c.hw + 2, 14, c.hw + 2, c.hh - 12]));
  else if (isAir(f)) out.push(wbox(f, [-c.hw + 2, 10, c.hw + 2, c.hh - 16]));
  else if (f.st === 'juggle' || f.st === 'ko') out.push(wbox(f, [-c.hw - 10, 0, c.hw + 10, 60]));
  else out.push(wbox(f, [-c.hw, 0, c.hw + 4, top]));
  if (f.st === 'atk' && m && m.hit && m.ac && f.mf >= m.st - 2 && f.mf < m.st + m.ac + 4 && !m.grab) {
    const h = m.hit; const inset = 8;
    if (h[2] - h[0] > 2 * inset && h[0] > 0) out.push(wbox(f, [h[0] + inset, h[1] + 2, Math.min(h[2] - inset, h[0] + 70), h[3] - 2]));
  }
  return out;
}
function pushTop(f) { const c = charOf(f); return crouching(f) ? c.ch * 0.7 : c.hh * 0.72; }

function invType(f) {
  // returns a set-like string of invulnerabilities right now
  if (['down', 'rise', 'held', 'grab', 'reset', 'tech', 'dead', 'win'].includes(f.st)) return 'a';
  if (f.st === 'juggle' && f.jug >= JUG_MAX) return 'juglim';
  if (f.st === 'dash' && f.dashDir < 0 && f.sf < 7) return 'a';
  const m = moveOf(f);
  if (f.st === 'atk' && m && m.inv) { let s = ''; for (const [a, b, t] of m.inv) if (f.mf >= a && f.mf <= b) s += t + ','; if (s) return s; }
  return '';
}
function vulnerable(d, a, m, isProj) {
  const inv = invType(d);
  if (inv === 'a' || inv.includes('a,')) return false;
  if (inv === 'juglim') return m.jug === 0;
  if (d.st === 'juggle' && m.jug && d.jug + m.jug > JUG_MAX) return false;
  if (inv.includes('s,')) return false;
  if (inv.includes('p,') && isProj) return false;
  if (inv.includes('air,') && !isProj && isAir(a)) return false;
  if (inv.includes('low,') && m.h === 'low') return false;
  if (d.tinv > 0 && m.h === 'throw' && !m.grab?.air) return false;
  return true;
}
function throwable(d, air) {
  if (air) return isAir(d) && (d.st === 'air' || d.st === 'atk' || d.st === 'jsq') && d.y > 18;
  if (isAir(d) || d.y > 0.01) return false;
  if (d.tinv > 0) return false;
  return ['idle', 'walk', 'crouch', 'guard', 'atk', 'land', 'jsq'].includes(d.st) || (d.st === 'dash' && d.dashDir > 0);
}
function canBlock(d, h, fromX) {
  if (h === 'throw') return false;
  if (isAir(d)) return false;
  if (!(ACTIONABLE.has(d.st) || d.st === 'block')) return false;
  if (!holdsAway(d, fromX)) return false;
  const down = held(d, B.D);
  if (h === 'low' && !down) return false;
  if (h === 'over' && down) return false;
  return true;
}
function comboScale(n, isSuper) { const s = n < 2 ? 1 : Math.max(0.3, 1 - 0.1 * (n)); return isSuper ? Math.max(0.5, s) : s; }

function ev(S, t, o) { S.events.push({ t, ...o }); }

// ------------------------------------------------------------------ moves
function startMove(S, f, id, cancel) {
  const c = charOf(f); const m = c.moves[id];
  if (!m) return false;
  if (m.cost) { if (f.meter < m.cost) return false; f.meter -= m.cost; f.spentAt = S.frame; }
  const prevTier = f.mv && f.st === 'atk' ? moveOf(f).tier : 0;
  f.chain = cancel && prevTier === 1 && m.tier === 1 ? f.chain + 1 : 0;
  f.st = 'atk'; f.mv = id; f.mf = 0; f.sf = 0; f.hitN = 0; f.nextHit = m.st; f.contact = 0; f.contactHit = 0; f.upgrade = cancel ? 0 : 1;
  f.armor = 0; f.grabBack = id === 'TH' && backHeld(f) ? 1 : 0;
  if (m.air) { if (!cancel) f.airUsed = 1; if (m.dive) { f.vx = 0; f.vy = 0; } }
  else if (!isAir(f)) { f.vx = 0; }
  if (m.armor) f.armor = m.armor[0][2];
  if (id === 'SU') { S.freeze = 60; S.freezeBy = f.side; S.freezeKind = 'super'; ev(S, 'super', { p: f.side, id: f.id }); }
  else if (id === 'EX') { S.freeze = 10; S.freezeBy = f.side; S.freezeKind = 'ex'; ev(S, 'ex', { p: f.side }); }
  else ev(S, 'whoosh', { p: f.side, tier: m.tier });
  f.meter = Math.min(1000, f.meter + (m.tier <= 2 ? 4 : 8) * charOf(f).meterRate);
  return true;
}

function tryActions(S, f, o) {
  const air = isAir(f);
  const r = requested(f, air);
  const inAtk = f.st === 'atk';
  if (inAtk && f.upgrade && f.mf <= 2 && !air) {
    // kara upgrade: a button pressed a frame or two after its partner turns the first move into the combination move
    const up = upgradeReq(f);
    if (up && rank(up) > rank(f.mv) && 'LHS'.includes(btnOfMove(f.mv)) && btnOfMove(f.mv) && startMove(S, f, up, false)) { consume(f, 'L', 'H', 'S'); return true; }
  }
  if (r) {
    const [id, ...ks] = r;
    const c = charOf(f); const nm = c.moves[id];
    if (!inAtk) {
      if (air && (f.st !== 'air' || f.airUsed)) return false;
      if (startMove(S, f, id, false)) { consume(f, ...ks); return true; }
    } else {
      const m = moveOf(f);
      // kara upgrade: a light/heavy/special pressed together with its partner a frame late becomes the combination move
      if (f.contact && nm && f.mf <= m.st + m.ac + CW && cancelOK(f, m, nm)) {
        if (startMove(S, f, id, true)) { consume(f, ...ks); ev(S, 'cancel', { p: f.side }); return true; }
      }
    }
  }
  return false;
}
function upgradeReq(f) {
  const r = f.ra, ok = (k) => r[k] < 4, p = (x, y) => ok(x) && ok(y) && Math.abs(r[x] - r[y]) < COMBO_WIN;
  const mv = charOf(f).moves;
  if (p('L', 'H') && p('H', 'S') && p('L', 'S') && f.meter >= 1000) return 'SU';
  if (p('S', 'H') && f.meter >= 500 && mv.EX) return 'EX';
  if (p('L', 'H')) return 'TH';
  return null;
}
const rank = (id) => (id === 'SU' ? 4 : id === 'EX' ? 3 : id === 'TH' ? 2 : 0);
const btnOfMove = (id) => (id === 'L5' || id === 'L2' ? 'L' : id === 'H5' || id === 'H2' ? 'H' : id && id.endsWith('S') ? 'S' : id === 'TH' ? 'H' : '');
function cancelOK(f, m, nm) {
  if (nm.tier === 0) return false;
  if (!!m.air !== !!nm.air) return false;
  if (m.tier === 3) return nm.tier === 4 && !!m.sc;
  if (!m.cancel) return false;
  if (m.tier === 1 && nm.tier === 1) return f.chain < 2;
  return nm.tier > m.tier;
}

function threatened(S, f, o) {
  const dist = Math.abs(o.x - f.x);
  if (o.st === 'atk') { const m = moveOf(o); if (m && (m.hit || m.proj) && o.mf < m.st + m.ac && dist < 260) return true; }
  for (const p of S.proj) if (p.owner !== f.side && Math.abs(p.x - f.x) < 220 && Math.sign(f.x - p.x) === Math.sign(p.vx || (f.x - p.x))) return true;
  return false;
}

// ------------------------------------------------------------------ per-fighter update
function updateFighter(S, f, o) {
  const c = charOf(f);
  f.sf++;
  if (f.tinv > 0) f.tinv--;
  switch (f.st) {
    case 'atk': {
      f.mf++;
      const m = moveOf(f);
      if (m.armor) { const a = m.armor[0]; if (f.mf > a[1]) f.armor = 0; }
      if (m.tp && f.mf === m.tp.at) { // teleport: reappear behind the opponent
        const nx = o.x + o.face * m.tp.dx; f.x = clampX(nx, c.hw); f.face = o.x >= f.x ? 1 : -1; ev(S, 'teleport', { p: f.side, x: f.x });
      }
      if (m.proj && f.mf === m.proj.at) spawnProj(S, f, m.proj);
      // velocities
      if (m.dive) {
        if (f.mf >= m.st) { f.vx = m.dive[0] * f.face; f.vy = m.dive[1]; }
      } else if (!m.air) {
        f.vx = 0;
        if (m.vel) for (const [a, b, v] of m.vel) if (f.mf >= a && f.mf <= b) f.vx = v * f.face;
        if (m.hop) { const [a, b, h] = m.hop; f.y = f.mf >= a && f.mf <= b ? Math.sin(((f.mf - a) / (b - a)) * Math.PI) * h : 0; }
      }
      if (m.air) airPhysics(S, f, c.grav);
      else f.x += f.vx;
      if (f.st !== 'atk') break; // landed during airPhysics
      if (f.mf >= moveTotal(m)) endMove(S, f);
      break;
    }
    case 'jsq':
      if (f.sf >= 4) {
        f.st = 'air'; f.sf = 0; f.airUsed = 0;
        const dir = held(f, B.R) ? 1 : held(f, B.L) ? -1 : 0;
        f.vx = dir * c.jumpX; f.vy = c.jumpV; f.y = 0.02; ev(S, 'jump', { p: f.side, x: f.x });
      }
      break;
    case 'air': airPhysics(S, f, c.grav); break;
    case 'land': if (f.sf >= f.landRec) toNeutral(f); break;
    case 'dash': {
      const [n, dist] = f.dashDir > 0 ? c.dashF : c.dashB;
      const t = f.sf;
      const v = t < n - 3 ? (2 * dist / (n - 3)) * (1 - t / (n - 3)) : 0;
      f.x += v * f.dashDir * f.face;
      if (f.dashDir < 0 && t < n - 6) f.y = Math.sin((t / (n - 6)) * Math.PI) * 14; else f.y = 0;
      if (t >= n) toNeutral(f);
      break;
    }
    case 'hit': case 'block':
      f.stun--;
      if (f.st === 'block') f.crouchBlk = held(f, B.D) ? 1 : 0;
      if (f.stun <= 0) { f.tinv = 6; toNeutral(f); }
      break;
    case 'juggle': case 'ko':
      f.x += f.vx; f.y += f.vy; f.vy -= JUG_G;
      if (f.y <= 0 && f.vy < 0) {
        f.y = 0; f.vy = 0; f.vx = 0;
        if (f.st === 'ko') { f.st = 'dead'; f.sf = 0; ev(S, 'land', { p: f.side, x: f.x, heavy: 1 }); }
        else { f.st = 'down'; f.sf = 0; ev(S, 'land', { p: f.side, x: f.x, heavy: 1 }); }
      }
      break;
    case 'reset':
      f.x += f.vx; f.y += f.vy; f.vy -= JUG_G;
      if (f.y <= 0 && f.vy < 0) { f.y = 0; f.vy = 0; f.vx = 0; f.st = 'land'; f.landRec = 4; f.sf = 0; f.jug = 0; }
      break;
    case 'down': if (f.sf >= 34) { f.st = 'rise'; f.sf = 0; } break;
    case 'rise': if (f.sf >= 18) { f.tinv = 4; toNeutral(f); } break;
    case 'tech': f.x += f.pv * f.pdir; f.pv *= 0.85; if (f.sf >= 16) toNeutral(f); break;
    case 'grab': updateGrab(S, f, o); break;
    case 'held': break; // positioned by the grabber
    case 'dead': case 'win': break;
  }
  // pushback
  if (f.pv > 0.15 && f.st !== 'tech' && f.st !== 'held' && f.st !== 'grab') {
    const before = f.x; f.x = clampX(f.x + f.pv * f.pdir, c.hw);
    const lost = Math.abs(f.x - before - f.pv * f.pdir);
    if (lost > 0.01 && f.pushFrom >= 0) { const a = S.f[f.pushFrom]; if (!isAir(a) && a.st !== 'grab') a.x = clampX(a.x - lost * f.pdir, charOf(a).hw); }
    f.pv *= 0.8;
  } else f.pv = 0;
}
function airPhysics(S, f, g) {
  f.x += f.vx; f.y += f.vy; f.vy -= g;
  if (f.y <= 0 && f.vy < 0) {
    f.y = 0; f.vy = 0; f.vx = 0;
    const m = moveOf(f);
    let rec = 2;
    if (f.st === 'atk' && m && m.air) rec = m.landRec != null ? (f.contact ? m.landRecHit : m.landRec) : 3;
    f.st = 'land'; f.landRec = rec; f.sf = 0; f.mv = null; f.airUsed = 0;
    ev(S, 'land', { p: f.side, x: f.x });
  }
}
function endMove(S, f) {
  const m = moveOf(f);
  if (m.air || f.y > 0.5) { f.st = 'air'; f.sf = 0; f.mv = null; return; }
  f.y = 0; toNeutral(f);
}
function toNeutral(f) {
  f.st = held(f, B.D) ? 'crouch' : 'idle'; f.sf = 0; f.mv = null; f.stun = 0; f.y = 0; f.vx = 0; f.vy = 0; f.chain = 0; f.armor = 0; f.crouchBlk = 0;
}
const clampX = (x, hw) => Math.max(STAGE_L + hw, Math.min(STAGE_R - hw, x));

function neutralControl(S, f, o) {
  const c = charOf(f);
  if (f.st === 'air' || !ACTIONABLE.has(f.st)) return;
  if (held(f, B.U)) { f.st = 'jsq'; f.sf = 0; f.vx = 0; return; }
  if (f.dashReq) { f.st = 'dash'; f.dashDir = f.dashReq === 'f' ? 1 : -1; f.sf = 0; f.dashReq = null; ev(S, 'dash', { p: f.side, x: f.x, dir: f.dashDir }); return; }
  if (held(f, B.D)) { if (f.st !== 'crouch') { f.st = 'crouch'; f.sf = 0; } f.vx = 0; return; }
  const fw = fwdHeld(f), bk = backHeld(f);
  if (bk && threatened(S, f, o)) { if (f.st !== 'guard') { f.st = 'guard'; f.sf = 0; } f.vx = 0; return; }
  if (fw || bk) {
    if (f.st !== 'walk') { f.st = 'walk'; f.sf = 0; }
    f.vx = (fw ? c.walkF : -c.walkB) * f.face; f.x += f.vx; return;
  }
  if (f.st !== 'idle') { f.st = 'idle'; f.sf = 0; }
  f.vx = 0;
}

// ------------------------------------------------------------------ grabs and cinematic sequences
function holdAt(path, t) {
  for (let i = path.length - 1; i >= 0; i--) {
    if (t >= path[i][0]) {
      const p = path[i], q = path[i + 1];
      if (!q) return [p[1], p[2]];
      const k = (t - p[0]) / (q[0] - p[0]); const e = k * k * (3 - 2 * k);
      return [p[1] + (q[1] - p[1]) * e, p[2] + (q[2] - p[2]) * e];
    }
  }
  return [path[0][1], path[0][2]];
}
const BACK_HOLD = [[0, 40, 0], [14, 0, 86], [28, -58, 12]];
function beginGrab(S, a, d, m, seq) {
  a.st = 'grab'; a.sf = 0; a.grab = { mv: a.mv, seq: !!seq, done: {} };
  d.st = 'held'; d.sf = 0; d.heldBy = a.side; d.mv = null; d.vx = d.vy = 0; d.pv = 0; d.hs = 0; a.hs = 0;
  ev(S, seq ? 'seq' : 'grab', { p: a.side, x: (a.x + d.x) / 2, y: 100 });
}
function updateGrab(S, a, d) {
  const m = charOf(a).moves[a.grab.mv]; const G = m.grab || m.seq;
  const t = a.sf;
  const path = a.grabBack ? BACK_HOLD : G.hold;
  const [dx, dy] = holdAt(path, t);
  // hold positions are spread out so the two bodies read as two people, not one blob
  if (d.st === 'held') { d.x = clampX(a.x + a.face * dx * HOLD_SPREAD, charOf(d).hw); d.y = dy; d.face = d.x > a.x ? -1 : 1; }
  // throw tech
  if (G.tech && d.st === 'held' && t <= TECH_WIN && d.ra.L <= t && d.ra.H <= t && Math.abs(d.ra.L - d.ra.H) < COMBO_WIN) {
    for (const [f, s] of [[a, -1], [d, 1]]) { f.st = 'tech'; f.sf = 0; f.pv = 7; f.pdir = s * Math.sign(d.x - a.x || a.face); f.y = 0; f.mv = null; }
    a.grab = null; d.heldBy = -1; d.tinv = 10; a.tinv = 10;
    ev(S, 'tech', { x: (a.x + d.x) / 2, y: 110 });
    return;
  }
  if (G.hits) for (const [ht, dmg] of G.hits) if (t === ht && !a.grab.done[ht]) { a.grab.done[ht] = 1; dealDamage(S, a, d, dmg, m); ev(S, 'hit', { x: d.x, y: d.y + 100, str: 2, p: a.side, dmg, seq: 1 }); }
  if (t === G.rel) {
    if (m.grab) dealDamage(S, a, d, m.dmg, m);
    const lv = G.lv || m.lv || [4, 6];
    const away = Math.sign(d.x - a.x) || a.face;
    d.st = d.hp <= 0 ? 'ko' : 'juggle'; d.sf = 0; d.vx = lv[0] * away; d.vy = lv[1]; d.y = Math.max(d.y, 1); d.jug = JUG_MAX; d.heldBy = -1;
    ev(S, 'hit', { x: d.x, y: d.y + 80, str: 3, p: a.side, dmg: m.dmg, big: 1 });
    a.hs = 10; d.hs = 10;
    if (d.hp <= 0) ko(S, d, a);
  }
  if (t >= G.dur) { a.grab = null; a.face = d.x >= a.x ? 1 : -1; toNeutral(a); }
}
function dealDamage(S, a, d, base, m) {
  if (d.combo.hits === 0) { d.combo.start = S.frame; d.combo.dmg = 0; d.combo.spent = 0; }
  if ((m && m.cost) || (a.spentAt != null && a.spentAt >= d.combo.start - 90)) d.combo.spent = 1;
  let dmg = Math.round(base * (charOf(a).power || 1) * comboScale(d.combo.hits, m && m.tier === 4));
  if (S.training) dmg = Math.min(dmg, Math.max(0, d.hp - 1));
  d.hp = Math.max(0, d.hp - dmg); d.combo.hits++; d.combo.dmg += dmg;
  const i = a.side;
  if (d.combo.spent) { if (d.combo.dmg > S.log.maxComboSpent[i]) S.log.maxComboSpent[i] = d.combo.dmg; }
  else if (d.combo.dmg > S.log.maxCombo[i]) { S.log.maxCombo[i] = d.combo.dmg; }
  return dmg;
}

// ------------------------------------------------------------------ projectiles
function spawnProj(S, f, P) {
  if (P.kind === 'bolt' || P.kind === 'volley') { if (S.proj.some((p) => p.owner === f.side && (p.kind === 'bolt' || p.kind === 'volley'))) return; }
  if (P.kind === 'mine') for (let i = S.proj.length - 1; i >= 0; i--) if (S.proj[i].owner === f.side && S.proj[i].kind === 'mine') S.proj.splice(i, 1);
  const p = { id: ++S.pid, cost: (moveOf(f) && moveOf(f).cost) || 0, owner: f.side, kind: P.kind, x: f.x + P.x * f.face, y: P.y, vx: P.vx * f.face, vy: P.vy, life: P.life, age: 0, r: P.r, hits: P.hits || 1, gap: P.gap || 0, next: 0, def: P, hp: P.hits || 1 };
  if (P.kind === 'mine') p.x = clampX(p.x, 12);
  S.proj.push(p); ev(S, 'proj', { p: f.side, kind: P.kind, x: p.x, y: p.y });
}
function updateProj(S) {
  for (let i = S.proj.length - 1; i >= 0; i--) {
    const p = S.proj[i];
    if (S.f[1 - p.owner].hs > 0 && p.hitThis) continue; // freeze with its victim during hit-stop
    p.age++; p.life--; p.x += p.vx; p.y += p.vy;
    if (p.life <= 0 || p.x < STAGE_L - 40 || p.x > STAGE_R + 40 || p.y > 420) { S.proj.splice(i, 1); ev(S, 'fizzle', { x: p.x, y: p.y, kind: p.kind }); }
  }
  // projectile clash
  for (let i = 0; i < S.proj.length; i++) for (let j = i + 1; j < S.proj.length; j++) {
    const p = S.proj[i], q = S.proj[j];
    if (p.owner === q.owner || p.kind === 'mine' || q.kind === 'mine') continue;
    if (Math.abs(p.x - q.x) < p.r + q.r && Math.abs(p.y - q.y) < p.r + q.r) { p.hp--; q.hp--; p.life = p.hp > 0 ? p.life : 0; q.life = q.hp > 0 ? q.life : 0; ev(S, 'clash', { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }); }
  }
}
function projHits(S) {
  for (let i = S.proj.length - 1; i >= 0; i--) {
    const p = S.proj[i]; const d = S.f[1 - p.owner]; const a = S.f[p.owner];
    if (p.life <= 0) continue;
    if (p.kind === 'mine' && p.age < p.def.arm) continue;
    if (p.next > p.age) continue;
    const box = p.kind === 'mine' ? [p.x - p.r, 0, p.x + p.r, 30] : [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r];
    if (!hurtboxes(d).some((h) => ov(box, h))) continue;
    if (!vulnerable(d, a, p.def, true)) continue;
    const P = p.def;
    const parried = isParrying(d);
    if (parried) { p.life = 0; S.proj.splice(i, 1); ev(S, 'parry', { p: d.side, x: d.x, y: d.y + 110 }); d.hs = 8; if (Math.abs(a.x - d.x) < 230) veil(S, d, a); continue; }
    p.hitThis = 1;
    applyHit(S, a, d, P, p);
    p.hits--; p.next = p.age + (p.gap || 99);
    if (p.hits <= 0 || p.kind === 'mine') { S.proj.splice(i, 1); }
  }
}

// ------------------------------------------------------------------ hits
function isParrying(d) { const m = moveOf(d); return d.st === 'atk' && m && m.parry && d.mf >= m.parry[0] && d.mf <= m.parry[1]; }
function veil(S, d, a) { // Mirror Veil counter: slip next to the attacker and strike
  startMove(S, d, charOf(d).moves.bS.follow || 'VS', true);
  d.x = clampX(a.x + a.face * (charOf(a).hw + charOf(d).hw + 2), charOf(d).hw); d.face = a.x >= d.x ? 1 : -1; d.y = 0;
  if (Math.abs(d.x - a.x) < charOf(a).hw + charOf(d).hw) d.x = clampX(a.x - a.face * (charOf(a).hw + charOf(d).hw + 2), charOf(d).hw); // attacker against the wall: slip in behind
  if (a.st !== 'grab' && a.st !== 'held') { a.st = 'hit'; a.stun = 26; a.sf = 0; a.react = 'gut'; a.mv = null; a.hs = 8; if (isAir(a)) { a.st = 'reset'; a.vy = 2; a.vx = 0; } }
}

function applyHit(S, a, d, m, proj) {
  const fromX = proj ? proj.x - proj.vx * 4 : a.x;
  const isSuper = m.tier === 4;
  const str = m.tier >= 4 ? 3 : m.dmg >= 90 ? 3 : m.dmg >= 60 ? 2 : m.dmg >= 35 ? 1 : 0;
  const ex = proj ? proj.x : (a.x + d.x) / 2 + (d.x > a.x ? 8 : -8);
  const ey = proj ? proj.y : Math.max(20, Math.min(d.y + charOf(d).hh - 20, a.y + (m.hit ? (m.hit[1] + m.hit[3]) / 2 : 100)));
  const away = Math.sign(d.x - fromX) || -d.face;
  if (!proj) { a.contact = 1; a.hitN++; a.nextHit = a.mf + (m.gap || 99); }
  if (canBlock(d, m.h, fromX)) {
    const chip = Math.round(m.dmg * (m.chip || 0));
    if (chip) { d.hp = Math.max(S.training ? 1 : 0, d.hp - chip); }
    d.st = 'block'; d.sf = 0; d.stun = m.bs; d.crouchBlk = held(d, B.D) ? 1 : 0; d.mv = null;
    d.pv = m.push; d.pdir = away; d.pushFrom = proj ? -1 : a.side;
    const hs = Math.round(5 + m.dmg / 30); d.hs = hs; if (!proj) a.hs = hs;
    a.meter = Math.min(1000, a.meter + (m.mg || 30) * 0.5 * charOf(a).meterRate); d.meter = Math.min(1000, d.meter + (m.mg || 30) * 0.3);
    a.blocks = (a.blocks || 0) + 1; d.blocked = (d.blocked || 0) + 1;
    ev(S, 'block', { x: ex, y: ey, str, p: a.side, chip, low: m.h === 'low' });
    if (d.hp <= 0) ko(S, d, a);
    return;
  }
  // armour absorbs one hit
  if (d.st === 'atk' && d.armor > 0 && m.h !== 'throw') {
    const dm = moveOf(d); const ar = dm.armor[0];
    if (d.mf >= ar[0] && d.mf <= ar[1]) {
      d.armor--; const dmg = Math.round(m.dmg * 0.5); d.hp = Math.max(S.training ? 1 : 0, d.hp - dmg);
      const hs = Math.round(7 + m.dmg / 18); d.hs = hs; if (!proj) a.hs = hs;
      ev(S, 'armor', { x: ex, y: ey, p: d.side, dmg });
      if (d.hp <= 0) ko(S, d, a);
      return;
    }
  }
  if (isParrying(d) && !proj) { ev(S, 'parry', { p: d.side, x: d.x, y: d.y + 110 }); a.hs = 0; veil(S, d, a); return; }
  const counter = d.st === 'atk' && moveOf(d) && d.mf < moveOf(d).st;
  const air = isAir(d);
  const dmg = dealDamage(S, a, d, m.dmg * (counter ? 1.2 : 1), proj ? { cost: proj.cost, tier: 3 } : m);
  a.meter = Math.min(1000, a.meter + (m.mg || 30) * charOf(a).meterRate); d.meter = Math.min(1000, d.meter + (m.mg || 30) * 0.4);
  if (!proj) a.contactHit = 1;
  const hs = Math.min(17, Math.round(7 + m.dmg / 14));
  d.hs = hs; if (!proj) a.hs = hs;
  d.mv = null; d.grab = null;
  if (!proj && m.seq && a.st === 'atk') { // cinematic super: lock the opponent into the sequence
    beginGrab(S, a, d, m, true); ev(S, 'hit', { x: ex, y: ey, str: 3, p: a.side, dmg, counter, big: 1 });
    if (d.hp <= 0) d.hp = 1; // sequence decides the KO at release
    return;
  }
  if (m.kd || air) {
    const lv = m.kd ? m.lv : [1.6, 4];
    if (!m.kd && air) { d.st = 'reset'; d.vx = away * 1.6; d.vy = 3.5; }
    else { d.st = 'juggle'; d.vx = away * lv[0]; d.vy = d.st === 'juggle' && air ? Math.max(lv[1] * 0.85, 4) : lv[1]; d.jug += air ? m.jug : 0; if (!air) d.jug = 0; }
    d.y = Math.max(d.y, 1); d.sf = 0; d.pv = 0;
  } else {
    const decay = Math.max(0, Math.floor((d.combo.hits - 4) / 1.5));
    d.st = 'hit'; d.sf = 0; d.stun = Math.max(4, m.hs + (counter ? 4 : 0) - decay); d.crouchBlk = crouching(d) || held(d, B.D) ? 1 : 0;
    const hy = m.hit ? (m.hit[1] + m.hit[3]) / 2 : proj ? proj.y : 100;
    d.react = m.h === 'low' ? 'low' : hy > charOf(d).hh * 0.62 ? 'head' : 'gut';
    d.pv = m.push; d.pdir = away; d.pushFrom = proj ? -1 : a.side;
  }
  ev(S, 'hit', { x: ex, y: ey, str, p: a.side, dmg, counter, low: m.h === 'low', combo: d.combo.hits });
  if (counter && d.combo.hits === 1) ev(S, 'counter', { p: a.side });
  if (d.hp <= 0) ko(S, d, a);
}

function ko(S, d, a) {
  if (S.training) { d.hp = 1; return; }
  if (S.phase !== 'fight' && S.phase !== 'ko') return;
  if (d.st === 'held') return; // released by the grab
  const away = Math.sign(d.x - a.x) || -d.face;
  d.st = 'ko'; d.sf = 0; d.vx = away * 3.4; d.vy = Math.max(d.vy, 8); d.y = Math.max(d.y, 1); d.mv = null;
  if (S.phase === 'fight') { S.phase = 'ko'; S.pt = 0; ev(S, 'ko', { p: d.side, x: d.x, y: d.y + 100 }); }
}

function strikes(S, a, d, pending) {
  if (a.st !== 'atk' || a.hs > 0) return;
  const m = moveOf(a);
  if (!m.hit || !m.ac || a.mf < a.nextHit || a.mf < m.st || a.mf >= m.st + m.ac) return;
  if (a.hitN >= (m.hits || 1)) return;
  const box = wbox(a, m.hit);
  if (!m.grab) for (let i = S.proj.length - 1; i >= 0; i--) { // strikes pop enemy mines
    const p = S.proj[i];
    if (p.owner !== a.side && p.kind === 'mine' && ov(box, [p.x - p.r, 0, p.x + p.r, 30])) { S.proj.splice(i, 1); ev(S, 'fizzle', { x: p.x, y: 14, kind: 'mine', pop: 1 }); }
  }
  if (m.grab) {
    if (d.st === 'held' || !throwable(d, !!m.grab.air)) return;
    const c = charOf(d);
    const body = [d.x - c.hw, d.y, d.x + c.hw, d.y + c.hh];
    if (!ov(box, body)) return;
    if (!vulnerable(d, a, m, false)) return;
    pending.push({ a, d, m, grab: 1 });
    return;
  }
  if (!hurtboxes(d).some((h) => ov(box, h))) return;
  if (!vulnerable(d, a, m, false)) return;
  pending.push({ a, d, m });
}

// ------------------------------------------------------------------ main step
export function step(S, in1 = 0, in2 = 0) {
  S.events.length = 0; S.frame++;
  const [a, b] = S.f;
  const frozen = S.freeze > 0;
  readInput(a, in1, frozen || a.hs > 0); readInput(b, in2, frozen || b.hs > 0);
  if (S.phase === 'match') return S;
  if (S.phase === 'intro') {
    S.pt++;
    if (S.pt === 1) ev(S, 'round', { n: S.round, final: S.f[0].wins === 1 && S.f[1].wins === 1 });
    if (S.pt === INTRO_FIGHT) ev(S, 'fight', {});
    for (const f of S.f) { if (f.st !== 'idle') toNeutral(f); f.st = 'idle'; f.sf = S.pt; }
    if (S.pt >= INTRO_LEN) { S.phase = 'fight'; S.pt = 0; for (const f of S.f) { f.ba = { L: 99, H: 99, S: 99 }; } }
    return S;
  }
  if (frozen) { S.freeze--; return S; }
  if (S.phase === 'ko' || S.phase === 'timeover') {
    S.pt++;
    const slow = S.phase === 'ko' && S.pt < 72 && S.pt % 3 !== 0;
    if (!slow) simFrame(S, true);
    endOfRound(S);
    return S;
  }
  simFrame(S, false);
  if (S.timer > 0 && a.hs <= 0 && b.hs <= 0) {
    S.timer--;
    if (S.timer === 0 && S.phase === 'fight') { S.phase = 'timeover'; S.pt = 0; ev(S, 'timeover', {}); }
  }
  if (S.training) trainingRefill(S);
  return S;
}

function simFrame(S, ending) {
  const [a, b] = S.f;
  // actions first (so a press on the actionable frame comes out this frame)
  for (const [f, o] of [[a, b], [b, a]]) {
    if (f.hs > 0) continue;
    if (ending) { if (ACTIONABLE.has(f.st)) { f.inp = 0; } }
    if (!ending && (isActionable(f) || f.st === 'atk')) {
      if (!tryActions(S, f, o) && ACTIONABLE.has(f.st)) neutralControl(S, f, o);
    } else if (ending && ACTIONABLE.has(f.st)) { if (f.st !== 'idle' && f.st !== 'win') { f.st = 'idle'; f.sf = 0; } }
  }
  for (const [f, o] of [[a, b], [b, a]]) {
    if (f.hs > 0) { f.hs--; continue; }
    if (f.st === 'atk' && f.mf === 0 && !f._began) { f._began = 1; f.sf = 0; tickNonMove(S, f, o); continue; }
    updateFighter(S, f, o);
  }
  for (const f of S.f) if (f.st !== 'atk' || f.mf > 0) f._began = 0;
  updateProj(S);
  // separation, walls, pushboxes
  for (const [f, o] of [[a, b], [b, a]]) {
    const c = charOf(f);
    if (f.st === 'held') continue;
    f.x = clampX(f.x, c.hw);
    if (Math.abs(f.x - o.x) > MAX_SEP && o.st !== 'held') f.x = o.x + Math.sign(f.x - o.x) * MAX_SEP;
  }
  pushboxes(a, b);
  // facing
  for (const [f, o] of [[a, b], [b, a]]) {
    if ((ACTIONABLE.has(f.st) || f.st === 'land' || f.st === 'jsq' || f.st === 'rise' || f.st === 'down') && Math.abs(o.x - f.x) > 0.5) {
      const nf = o.x > f.x ? 1 : -1;
      if (nf !== f.face) { f.face = nf; if (f.st === 'walk') f.vx = -f.vx; }
    }
  }
  // hits
  if (!ending) {
    const pending = [];
    strikes(S, a, b, pending); strikes(S, b, a, pending);
    const grabs = pending.filter((p) => p.grab), hitsP = pending.filter((p) => !p.grab);
    // a strike beats a grab on the same frame; two grabs: player 1 wins the tie deterministically by side order
    for (const p of hitsP) applyHit(S, p.a, p.d, p.m, null);
    for (const g of grabs) {
      if (hitsP.some((h) => h.d === g.a)) continue;
      if (g.a.st !== 'atk' || g.d.st === 'held' || g.d.st === 'grab') continue;
      if (g.m.grab && !g.m.grab.tech && g.d.st === 'block') continue;
      g.a.hitN = 1; g.a.contact = 1;
      beginGrab(S, g.a, g.d, g.m, false);
    }
    projHits(S);
  }
  // combos end when the defender is free again
  for (const f of S.f) {
    if (ACTIONABLE.has(f.st) || f.st === 'air' || f.st === 'land' || f.st === 'rise' || f.st === 'tech') {
      if (f.combo.hits) ev(S, 'comboEnd', { p: 1 - f.side, hits: f.combo.hits, dmg: f.combo.dmg });
      f.combo.hits = 0; f.combo.dmg = 0; f.combo.spent = 0; f.jug = 0;
    }
    if (f.st === 'down' || f.st === 'rise') f.jug = 0;
  }
}
function tickNonMove(S, f, o) {
  // first frame of a move: physics only (frame 0 counts toward startup)
  const m = moveOf(f);
  if (m.air) airPhysics(S, f, charOf(f).grav);
}

function pushboxes(a, b) {
  if (a.st === 'held' || b.st === 'held' || a.st === 'grab' || b.st === 'grab') return;
  if (a.st === 'dead' || b.st === 'dead') return;
  const ca = charOf(a), cb = charOf(b);
  const aBot = a.y + (isAir(a) ? 30 : 0), bBot = b.y + (isAir(b) ? 30 : 0);
  const aTop = a.y + pushTop(a), bTop = b.y + pushTop(b);
  if (!(aBot < bTop && bBot < aTop)) return;
  const need = ca.hw + cb.hw + PUSH_PAD; const dx = b.x - a.x;
  if (Math.abs(dx) >= need) return;
  let s = Math.sign(dx); if (!s) s = a.face;
  const over = need - Math.abs(dx);
  let pa = over / 2, pb = over / 2;
  if (isAir(a) && !isAir(b)) { pa = over; pb = 0; } else if (isAir(b) && !isAir(a)) { pb = over; pa = 0; }
  let nax = a.x - s * pa, nbx = b.x + s * pb;
  const ax = clampX(nax, ca.hw), bx = clampX(nbx, cb.hw);
  if (ax !== nax) nbx += (ax - nax); // wall: pass the push on to the other fighter
  if (bx !== nbx) nax += (bx - nbx);
  a.x = clampX(nax, ca.hw); b.x = clampX(clampX(nbx, cb.hw), cb.hw);
  if (Math.abs(b.x - a.x) < need - 0.5) { // both against the same wall: resolve by side
    if (a.x <= STAGE_L + ca.hw + 1 || b.x <= STAGE_L + cb.hw + 1) { if (s > 0) b.x = a.x + need; else a.x = b.x + need; }
    else { if (s > 0) a.x = b.x - need; else b.x = a.x - need; }
  }
}

function endOfRound(S) {
  const [a, b] = S.f;
  if (S.phase === 'ko') {
    const settled = S.f.every((f) => f.st !== 'ko' && f.st !== 'juggle' && f.st !== 'held' && f.st !== 'grab' && f.st !== 'reset' && f.y < 1);
    if (S.decided !== S.round && S.pt >= 96 && (settled || S.pt >= 240)) { decideRound(S); S.decidedPt = S.pt; }
    if (S.decided === S.round && S.pt >= Math.max(KO_LEN, S.decidedPt + 80)) finishRound(S);
  } else if (S.phase === 'timeover') {
    if (S.decided !== S.round && S.pt >= 40) { decideRound(S); S.decidedPt = S.pt; }
    if (S.decided === S.round && S.pt >= TIMEOVER_LEN) finishRound(S);
  }
  if (S.decided === S.round && S.roundWinner >= 0) { const w = S.f[S.roundWinner]; if (ACTIONABLE.has(w.st) || (w.st === 'land' && w.sf >= w.landRec)) { w.st = 'win'; w.sf = 0; } }
}
function decideRound(S) {
  if (S.decided === S.round) return; S.decided = S.round;
  const [a, b] = S.f;
  const ra = a.hp / a.maxhp, rb = b.hp / b.maxhp;
  let w = -1;
  if (a.hp <= 0 && b.hp <= 0) w = -1; else if (b.hp <= 0) w = 0; else if (a.hp <= 0) w = 1;
  else if (Math.abs(ra - rb) < 1e-9) w = -1; else w = ra > rb ? 0 : 1;
  S.roundWinner = w;
  if (w >= 0) {
    const f = S.f[w]; S.perfect = f.hp === f.maxhp ? 1 : 0;
    if (ACTIONABLE.has(f.st) || f.st === 'land') { f.st = 'win'; f.sf = 0; }
    const l = S.f[1 - w]; if (S.phase === 'timeover' && ACTIONABLE.has(l.st)) { l.st = 'lose'; l.sf = 0; }
  }
  ev(S, 'roundWin', { w, perfect: S.perfect, timeover: S.phase === 'timeover' });
}
function finishRound(S) {
  if (S.finished === S.round) return; S.finished = S.round;
  const w = S.roundWinner;
  S.rounds.push({ w, hp: S.f.map((f) => f.hp), perfect: S.perfect, frame: S.frame });
  if (w >= 0) S.f[w].wins++;
  const [a, b] = S.f;
  if (a.wins >= 2 || b.wins >= 2 || S.rounds.length >= 7) {
    S.phase = 'match'; S.pt = 0;
    S.result = { winner: a.wins > b.wins ? 0 : b.wins > a.wins ? 1 : -1, wins: [a.wins, b.wins], rounds: S.rounds.length };
    ev(S, 'matchEnd', { winner: S.result.winner });
    return;
  }
  S.round++;
  resetRound(S);
}

function trainingRefill(S) {
  for (const f of S.f) {
    if (ACTIONABLE.has(f.st) && f.combo.hits === 0) f.idleT++; else f.idleT = 0;
    if (S.refill && f.idleT === 50) { f.hp = f.maxhp; }
    if (S.meterRefill) f.meter = 1000;
  }
}

// Snapshot for tests and the test hook.
export function summary(S) {
  return {
    frame: S.frame, phase: S.phase, round: S.round, timer: S.timer < 0 ? -1 : Math.ceil(S.timer / 60), result: S.result,
    f: S.f.map((f) => ({ id: f.id, x: +f.x.toFixed(1), y: +f.y.toFixed(1), hp: f.hp, maxhp: f.maxhp, meter: Math.round(f.meter), st: f.st, mv: f.mv, mf: f.mf, face: f.face, wins: f.wins, combo: f.combo.hits })),
    proj: S.proj.length,
  };
}
