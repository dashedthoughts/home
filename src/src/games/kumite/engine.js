// NEON KUMITE · engine glue: owns the sim, the CPUs, the renderer, audio and input. No React in here.
import { createMatch, step, summary, B, isActionable, resetPositions, moveOf } from './sim.js';
import { FIGHTERS, ROSTER } from './data.js';
import { createAI, aiInput } from './ai.js';
import { createRenderer } from './render.js';
import { STAGE_IDS } from './stages.js';

const DT = 1 / 60;
export function createEngine(canvas, audio, input, hooks = {}) {
  const R = createRenderer(canvas);
  const E = {
    R, S: null, cfg: null, ais: [null, null], acc: 0, paused: false, manual: false, running: false, frames: 0, ft: 16, slowT: 0,
    training: { dummy: 'stand', refill: true, meter: true, boxes: false, dmg: 0, combo: 0, comboDmg: 0, adv: null, startup: null, track: null, hitT: -999 },
    seed: 1,
  };
  E.start = (cfg) => {
    E.cfg = { level: 2, stage: 'viaduct', cpu: [false, true], mode: 'versus', ...cfg };
    const c = E.cfg;
    if (c.stage === 'random') c.stage = STAGE_IDS[Math.floor(Math.random() * STAGE_IDS.length)];
    E.S = createMatch({ p1: c.p1, p2: c.p2, stage: c.stage, training: c.mode === 'training' });
    if (c.mode === 'training') { E.S.refill = E.training.refill; E.S.meterRefill = E.training.meter; }
    E.seed = (E.seed * 31 + 7) % 100000;
    E.ais = [c.cpu[0] ? createAI(c.levels ? c.levels[0] : c.level, E.seed + 1) : null, c.cpu[1] || c.mode === 'training' ? createAI(c.levels ? c.levels[1] : c.level, E.seed + 2) : null];
    R.reset(); R.setStage(c.stage); R.training = c.mode === 'training' ? E.training : null; R.hitboxes = c.mode === 'training' && E.training.boxes;
    E.acc = 0; E.paused = false; E.running = true; E.done = false;
    if (audio && c.mode !== 'attract') audio.music(['viaduct', 'alley', 'roof'].indexOf(c.stage), false);
    E.draw(0, true);
  };
  E.stepOnce = () => {
    const S = E.S; if (!S) return;
    const c = E.cfg;
    const ins = [0, 0];
    for (let i = 0; i < 2; i++) {
      if (E.ais[i] && (i === 0 ? c.cpu[0] : c.cpu[1])) ins[i] = aiInput(E.ais[i], S, i);
      else if (i === 0 || (c.mode !== 'training' && !c.cpu[1])) ins[i] = input.bits(i);
    }
    if (c.mode === 'training') ins[1] = dummyInput(S);
    step(S, ins[0], ins[1]);
    R.onEvents(S, S.events, c.mode === 'attract' ? null : audio);
    R.tick(S);
    if (c.mode === 'training') trackTraining(S);
    E.frames++;
    if (S.phase === 'match' && !E.done) { E.done = true; hooks.onMatchEnd && hooks.onMatchEnd(S.result, S); }
  };
  function dummyInput(S) {
    const d = S.f[1], a = S.f[0], T = E.training;
    switch (T.dummy) {
      case 'crouch': return B.D;
      case 'jump': return B.U;
      case 'cpu': return aiInput(E.ais[1], S, 1);
      case 'block': {
        if (S.frame - T.hitT > 50) return 0;
        const back = a.x > d.x ? B.L : B.R; const m = moveOf(a);
        if (m && m.h === 'over') return back;
        if (m && m.h === 'low') return back | B.D;
        return back | (d.crouchBlk ? B.D : 0);
      }
      default: return 0;
    }
  }
  function trackTraining(S) {
    const T = E.training; const [a, d] = S.f;
    for (const e of S.events) {
      if ((e.t === 'hit' || e.t === 'block') && e.p === 0) { T.track = { a: null, d: null }; T.hitT = S.frame; if (e.t === 'hit') T.dmg = e.dmg; }
    }
    if (a.st === 'atk' && a.mf === 0) { const m = moveOf(a); T.startup = m && m.ac ? m.st + 1 : null; }
    if (d.combo.hits) { T.combo = d.combo.hits; T.comboDmg = d.combo.dmg; }
    if (T.track) {
      if (T.track.a == null && (isActionable(a) || a.st === 'land' && a.sf >= a.landRec)) T.track.a = S.frame;
      if (T.track.d == null && isActionable(d)) T.track.d = S.frame;
      if (T.track.a != null && T.track.d != null) { T.adv = T.track.d - T.track.a; T.track = null; }
      else if (S.frame - T.hitT > 240) T.track = null;
    }
    S.refill = T.refill; S.meterRefill = T.meter;
  }
  E.frame = (dt) => {
    if (!E.S) return;
    const t0 = performance.now();
    if (E.running && !E.paused && !E.manual) {
      E.acc += Math.min(dt, 0.1);
      let n = 0;
      while (E.acc >= DT && n < 6) { E.stepOnce(); E.acc -= DT; n++; }
    }
    E.draw(dt);
    // quality governor: if frames stay slow, drop reflections and particles
    const ms = performance.now() - t0; E.ft = E.ft * 0.95 + ms * 0.05;
    if (E.ft > 22 && !R.lowFx) { E.slowT += dt; if (E.slowT > 2) { R.lowFx = true; R.stage = null; } } else E.slowT = 0;
  };
  E.draw = (dt, snap) => {
    if (!E.S) return;
    const c = E.cfg;
    const tags = c.mode === 'training' ? ['P1', 'DUMMY'] : [c.cpu[0] ? 'CPU' : 'P1', c.cpu[1] ? (c.rival ? 'RIVAL' : 'CPU') : 'P2'];
    R.draw(E.S, dt, { noHud: c.mode === 'attract', tags, snap });
  };
  E.advance = (sec) => {
    E.manual = true; const n = Math.round(sec * 60);
    for (let i = 0; i < n; i++) E.stepOnce();
    E.draw(n / 60);
  };
  E.reset = () => { if (E.cfg) E.start(E.cfg); };
  E.resetPositions = () => { if (E.S) { resetPositions(E.S); R.reset(); } };
  E.summary = () => (E.S ? summary(E.S) : null);
  return E;
}
