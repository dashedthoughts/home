// NEON KUMITE (組手) · a 1-on-1 versus fighter. Four original fighters, three Tokyo stages, CPU or two players on one keyboard.
import { useEffect, useRef, useState, useCallback } from 'react';
import { B } from './sim.js';
import { FIGHTERS, ROSTER, MOVE_ORDER, INPUT_OF, advantage } from './data.js';
import { LEVELS } from './ai.js';
import { STAGES, STAGE_IDS, createStage, drawBack, drawFloor } from './stages.js';
import { createAudio } from './audio.js';
import { createInput, DEFAULT_KEYS, ACTIONS, ACTION_LABEL, keyName } from './input.js';
import { drawFighter } from './rig.js';
import { BASE } from './anim.js';
import { createEngine } from './engine.js';

const LS = 'nc2:kumite:';
function load(k, d) { try { const v = localStorage.getItem(LS + k); return v ? { ...d, ...JSON.parse(v) } : d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
const DEF_SETTINGS = { level: 2, music: true, sfx: 0.8, fx: 'full', shake: true, touch: 'auto' };
const MOVE_NOTE = {
  L5: 'Fast poke. Chains into Heavy.', H5: 'Big normal. Cancels into specials.', L2: 'Low. Crouch-block it.', H2: 'Crouching heavy.', Lj: 'Jump-in. Stand-block it.', Hj: 'Jump-in. Stand-block it.',
  TH: 'Beats block. Tech it with L+H. Hold back to throw backwards.', EX: 'Costs half the meter.', SU: 'Costs a full meter. Invincible start.',
};
const totalDmg = (m) => { const G = m.seq || m.grab; const extra = G && G.hits ? G.hits.reduce((a, h) => a + h[1], 0) : 0; const n = m.proj ? m.proj.hits || 1 : m.seq ? 1 : m.hits || 1; return Math.round((m.proj ? m.proj.dmg : m.dmg) * n + extra); };
const HEIGHT = { high: 'High', mid: 'Mid', low: 'Low', over: 'Overhead', throw: 'Throw' };

// ---------------------------------------------------------------- portraits drawn with the actual rig
function Portrait({ id, pose = 'win', size = 160, flip = false, dim = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = size * dpr; c.height = size * 1.25 * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ch = FIGHTERS[id];
    const bg = g.createLinearGradient(0, 0, 0, size * 1.25); bg.addColorStop(0, '#16121f'); bg.addColorStop(1, '#0b0910'); g.fillStyle = bg; g.fillRect(0, 0, size, size * 1.25);
    g.fillStyle = ch.color; g.globalAlpha = 0.22; for (let y = 0; y < size * 1.25; y += 7) for (let x = (y / 7) % 2 * 3.5; x < size; x += 7) { g.beginPath(); g.arc(x, y, 2.2 * (y / (size * 1.25)), 0, 7); g.fill(); } g.globalAlpha = 1;
    g.fillStyle = ch.color; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(0, size * 0.95); g.lineTo(size, size * 0.7); g.lineTo(size, size * 0.82); g.lineTo(0, size * 1.07); g.fill(); g.globalAlpha = 1;
    const s = (size / 105) * (id === 'ganji' ? 0.92 : 1.05);
    g.save(); g.setTransform(dpr * s * (flip ? -1 : 1), 0, 0, -dpr * s, dpr * (size / 2 + (flip ? 8 : -8)), dpr * size * 1.95);
    try { drawFighter(g, id, BASE[id][pose] || BASE[id].stance, { lw: 2.4, light: [0.5 * (flip ? -1 : 1), 0.85], rim: ch.color, rimDir: -1, win: pose === 'win' }); } catch (e) { /* draw failure leaves the background */ }
    g.restore();
    if (dim) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, 0, size, size * 1.25); }
  }, [id, pose, size, flip, dim]);
  return <canvas ref={ref} className="nk-portrait" style={{ width: size, height: size * 1.25 }} aria-hidden="true" />;
}
function StageThumb({ id }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return; const w = 220, h = 124; const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    try { const st = createStage(id, 0.5); const cam = { x: 550, scale: 0.36, W: w, H: h, gy: h * 0.84, t: 3 }; drawBack(g, st, cam); drawFloor(g, st, cam); } catch (e) { g.fillStyle = '#222'; g.fillRect(0, 0, w, h); }
  }, [id]);
  return <canvas ref={ref} className="nk-stagethumb" aria-hidden="true" />;
}

// ---------------------------------------------------------------- touch controls
function TouchPad({ input, onPause, portrait }) {
  const dpad = useRef(null); const btns = useRef({});
  const [dirShown, setDirShown] = useState(0);
  const [held, setHeld] = useState({});
  useEffect(() => () => { input.touch = 0; }, [input]);
  const dirFrom = (e) => {
    const r = dpad.current.getBoundingClientRect(); const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y); if (d < r.width * 0.14) return 0;
    const a = Math.atan2(y, x); const oct = Math.round(a / (Math.PI / 4)); // -4..4
    const map = { 0: B.R, 1: B.R | B.D, 2: B.D, 3: B.D | B.L, 4: B.L, '-4': B.L, '-3': B.U | B.L, '-2': B.U, '-1': B.U | B.R };
    return map[oct] || 0;
  };
  const setDir = (b) => { input.touch = (input.touch & ~15) | b; setDirShown(b); };
  const onD = (e) => { e.preventDefault(); dpad.current.setPointerCapture(e.pointerId); setDir(dirFrom(e)); };
  const onM = (e) => { if (e.buttons || e.pointerType === 'touch') setDir(dirFrom(e)); };
  const onU = () => setDir(0);
  const press = (bits, k) => (e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); input.touch |= bits; setHeld((h) => ({ ...h, [k]: 1 })); };
  const release = (bits, k) => () => { input.touch &= ~bits; setHeld((h) => ({ ...h, [k]: 0 })); };
  const B3 = [['L', B.LP, 'LIGHT'], ['H', B.HP, 'HEAVY'], ['S', B.SP, 'SPECIAL']];
  const small = [['THROW', B.LP | B.HP], ['EX', B.SP | B.HP], ['SUPER', B.LP | B.HP | B.SP]];
  return (
    <div className={'nk-touch' + (portrait ? ' is-portrait' : '')}>
      <div ref={dpad} className="nk-dpad" onPointerDown={onD} onPointerMove={onM} onPointerUp={onU} onPointerCancel={onU} role="group" aria-label="Movement pad">
        <span className={'nk-dpad__knob' + (dirShown ? ' is-on' : '')} style={{ transform: `translate(${dirShown & B.R ? 60 : dirShown & B.L ? -60 : 0}%, ${dirShown & B.D ? 60 : dirShown & B.U ? -60 : 0}%)` }} />
        <i className="nk-dpad__u" /><i className="nk-dpad__d" /><i className="nk-dpad__l" /><i className="nk-dpad__r" />
      </div>
      <div className="nk-btns">
        <div className="nk-btns__small">{small.map(([k, b]) => <button key={k} type="button" className={'nk-tb nk-tb--s' + (held[k] ? ' is-on' : '')} onPointerDown={press(b, k)} onPointerUp={release(b, k)} onPointerCancel={release(b, k)}>{k}</button>)}</div>
        <div className="nk-btns__big">{B3.map(([k, b, l]) => <button key={k} type="button" aria-label={l} className={'nk-tb nk-tb--' + k + (held[k] ? ' is-on' : '')} onPointerDown={press(b, k)} onPointerUp={release(b, k)} onPointerCancel={release(b, k)}>{k}</button>)}</div>
      </div>
      <button type="button" className="nk-touch__pause" onClick={onPause} aria-label="Pause">II</button>
    </div>
  );
}

// ---------------------------------------------------------------- move list
function MoveList({ id, onClose, onPick }) {
  const ch = FIGHTERS[id];
  return (
    <div className="nk-panel nk-moves" role="dialog" aria-label={`${ch.name} move list`}>
      <header className="nk-panel__head">
        <div><b style={{ color: ch.color }}>{ch.name}</b> <span className="nk-jp">{ch.jp}</span> <em>{ch.style}</em></div>
        <div className="nk-tabs">{ROSTER.map((r) => <button key={r} type="button" className={r === id ? 'is-on' : ''} onClick={() => onPick(r)} autoFocus={r === id}>{FIGHTERS[r].name}</button>)}<button type="button" onClick={onClose} data-back>Back</button></div>
      </header>
      <p className="nk-help">f = toward the opponent, b = away, d = down. L / H / S are Light, Heavy, Special. Light chains into Heavy, Heavy cancels into a special on contact, a special can cancel into the super.</p>
      <div className="nk-movetable" role="table">
        <div className="nk-mrow nk-mrow--h" role="row"><span>Move</span><span>Input</span><span>Dmg</span><span>Frames</span><span>Hits</span><span>On block</span></div>
        {MOVE_ORDER.filter((k) => ch.moves[k]).map((k) => {
          const m = ch.moves[k]; const adv = advantage(m, false);
          const props = [m.inv && m.inv.some((v) => v[2] === 'a' || v[2] === 's') ? 'invincible start' : null, m.inv && m.inv.some((v) => v[2] === 'air') ? 'anti-air' : null, m.inv && m.inv.some((v) => v[2] === 'p') ? 'passes projectiles' : null, m.armor ? 'armour' : null, m.proj ? 'projectile' : null, m.grab && !m.grab.tech ? 'command grab' : null, m.kd === 2 ? 'launches' : m.kd === 1 ? 'knockdown' : null, m.parry ? 'counter stance' : null, m.tp ? 'teleport' : null, m.hits > 1 ? `${m.hits} hits` : null].filter(Boolean);
          return (
            <div className="nk-mrow" role="row" key={k}>
              <span><b>{m.name}</b><small>{MOVE_NOTE[k] || props.join(', ')}</small></span>
              <span className="nk-kbd">{INPUT_OF[k]}</span>
              <span>{totalDmg(m) || '-'}</span>
              <span className="nk-mono">{m.ac ? `${m.st + 1} / ${m.ac} / ${m.rc}` : `${m.st} / - / ${m.rc}`}</span>
              <span>{m.ac || m.proj || m.grab ? HEIGHT[m.proj ? m.proj.h : m.h] : '-'}</span>
              <span className="nk-mono">{adv == null ? '-' : (adv > 0 ? '+' : '') + adv}</span>
            </div>
          );
        })}
      </div>
      <p className="nk-help">Frames: startup (the hit frame) / active / recovery.</p>
      <div className="nk-row"><button type="button" className="nk-btn" onClick={onClose}>Back</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- settings
function Settings({ settings, setSettings, keys, setKeys, onClose, input }) {
  const [wait, setWait] = useState(null);
  useEffect(() => {
    if (!wait) return undefined;
    const h = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.code !== 'Escape') {
        const k = JSON.parse(JSON.stringify(keys));
        for (const p of [0, 1]) for (const a of ACTIONS) k[p][a] = k[p][a].filter((c) => c !== e.code); // a key does one job
        k[wait.p][wait.a] = [e.code, ...k[wait.p][wait.a].slice(0, 1)];
        setKeys(k);
      }
      setWait(null);
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [wait, keys, setKeys]);
  const set = (o) => setSettings({ ...settings, ...o });
  return (
    <div className="nk-panel nk-settings" role="dialog" aria-label="Settings">
      <header className="nk-panel__head"><b>SETTINGS</b></header>
      <div className="nk-set">
        <label>CPU level<span className="nk-seg">{[1, 2, 3].map((l) => <button key={l} type="button" className={settings.level === l ? 'is-on' : ''} onClick={() => set({ level: l })}>{LEVELS[l].name}</button>)}</span></label>
        <label>Music<span className="nk-seg">{[true, false].map((v) => <button key={String(v)} type="button" className={settings.music === v ? 'is-on' : ''} onClick={() => set({ music: v })}>{v ? 'ON' : 'OFF'}</button>)}</span></label>
        <label>Sound<span className="nk-seg">{[0, 0.4, 0.8, 1].map((v) => <button key={v} type="button" className={settings.sfx === v ? 'is-on' : ''} onClick={() => set({ sfx: v })}>{v === 0 ? 'OFF' : Math.round(v * 100) + '%'}</button>)}</span></label>
        <label>Effects<span className="nk-seg">{['full', 'lite'].map((v) => <button key={v} type="button" className={settings.fx === v ? 'is-on' : ''} onClick={() => set({ fx: v })}>{v.toUpperCase()}</button>)}</span></label>
        <label>Shake and flashes<span className="nk-seg">{[true, false].map((v) => <button key={String(v)} type="button" className={settings.shake === v ? 'is-on' : ''} onClick={() => set({ shake: v })}>{v ? 'ON' : 'OFF'}</button>)}</span></label>
        <label>Touch controls<span className="nk-seg">{['auto', 'on', 'off'].map((v) => <button key={v} type="button" className={settings.touch === v ? 'is-on' : ''} onClick={() => set({ touch: v })}>{v.toUpperCase()}</button>)}</span></label>
      </div>
      <div className="nk-keys">
        {[0, 1].map((p) => (
          <div key={p} className="nk-keys__col">
            <b>{p ? 'PLAYER 2' : 'PLAYER 1'} KEYS</b>
            {ACTIONS.map((a) => (
              <div className="nk-keyrow" key={a}>
                <span>{ACTION_LABEL[a]}</span>
                <button type="button" className={'nk-key' + (wait && wait.p === p && wait.a === a ? ' is-wait' : '')} onClick={() => setWait({ p, a })}>
                  {wait && wait.p === p && wait.a === a ? 'press a key' : keys[p][a].map(keyName).join(' / ')}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="nk-help">Gamepads use the standard layout: X light, Y heavy, B special, A or LB throw, RB EX, triggers super, Start pauses.</p>
      <div className="nk-row"><button type="button" className="nk-btn nk-btn--ghost" onClick={() => setKeys(JSON.parse(JSON.stringify(DEFAULT_KEYS)))}>Reset keys</button><button type="button" className="nk-btn" onClick={onClose} autoFocus>Done</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- the game
export default function NeonKumite({ onExit }) {
  const rootRef = useRef(null), canvasRef = useRef(null);
  const eng = useRef(null), audio = useRef(null), input = useRef(null);
  const [screen, setScreen] = useState('title');
  const [overlay, setOverlay] = useState(null); // 'settings' | 'moves' | null
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState('arcade');
  const [pick, setPick] = useState({ step: 0, p1: 'rin', p2: 'ganji', cursor: 0, level: 2, stage: 'random' });
  const [result, setResult] = useState(null);
  const [arcade, setArcade] = useState(null);
  const [settings, setSettingsS] = useState(() => load('settings', DEF_SETTINGS));
  const [keys, setKeysS] = useState(() => { try { const v = JSON.parse(localStorage.getItem(LS + 'keys') || 'null'); return v && v.length === 2 ? v : JSON.parse(JSON.stringify(DEFAULT_KEYS)); } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_KEYS)); } });
  const [progress, setProgress] = useState(() => load('arcade', { cleared: {}, best: 0 }));
  const [movesId, setMovesId] = useState('rin');
  const [portrait, setPortrait] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [trainOpt, setTrainOpt] = useState({ dummy: 'stand', refill: true, meter: true, boxes: false });
  const [vs, setVs] = useState(null);
  useEffect(() => { if (screen !== 'fight' || hintGone) return undefined; const t = setTimeout(() => setHintGone(true), 4500); return () => clearTimeout(t); }, [screen, hintGone]);
  const ui = useRef({}); ui.current = { ...ui.current, screen, overlay, paused, mode, pick, arcade, settings, progress };

  const setSettings = (s) => { setSettingsS(s); save('settings', s); };
  const setKeys = (k) => { setKeysS(k); try { localStorage.setItem(LS + 'keys', JSON.stringify(k)); } catch (e) { /* blocked */ } };
  useEffect(() => { if (input.current) input.current.keys = keys; }, [keys]);
  useEffect(() => {
    const E = eng.current; if (!E) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    E.R.reduced = reduced || !settings.shake; E.R.lowFx = settings.fx === 'lite'; E.R.stage = null;
    if (audio.current) audio.current.set({ sfx: settings.sfx, music: settings.music });
  }, [settings]);

  // ---------- mount: canvas, engine, loop, listeners
  useEffect(() => {
    const canvas = canvasRef.current, root = rootRef.current;
    audio.current = createAudio(); input.current = createInput(); input.current.keys = keys;
    const E = createEngine(canvas, audio.current, input.current, { onMatchEnd: (res, S) => matchEnd(res, S) });
    eng.current = E;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    E.R.reduced = reduced || !settings.shake; E.R.lowFx = settings.fx === 'lite';
    setCoarse(window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false);
    const resize = () => { const r = root.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); E.R.resize(Math.max(1, r.width), Math.max(1, r.height), dpr); setPortrait(r.height > r.width * 1.05); E.draw(0, true); };
    const ro = new ResizeObserver(resize); ro.observe(root); resize();
    attract();
    // fonts: rebuild the stage layers once the display fonts are in
    if (document.fonts && document.fonts.load) Promise.all(['900 40px "Noto Sans JP"', '400 40px Bangers', '700 20px Rajdhani', '400 20px NEMESYS'].map((f) => document.fonts.load(f, 'やきとり居酒屋新橋高架下雨の横丁屋上組手 K.O. FIGHT 0123456789').catch(() => null))).then(() => { if (eng.current) eng.current.R.stage = null; }).catch(() => {});
    let raf = 0, last = performance.now(), live = true;
    const loop = (t) => {
      if (!live) return;
      const dt = Math.max(0, Math.min(0.1, (t - last) / 1000)); last = t;
      const u = ui.current;
      const humans = !E.cfg ? [0] : E.cfg.mode === 'training' ? [0] : [0, 1].filter((i) => !E.cfg.cpu[i]);
      input.current.pollPads(humans.length ? humans : [0]);
      if (input.current.start.some(Boolean) && !E.startHeld && u.screen === 'fight') togglePause();
      E.startHeld = input.current.start.some(Boolean);
      padMenus(u);
      raf = requestAnimationFrame(loop);
      try { E.frame(dt); } catch (err) { if (!E.errLogged) { E.errLogged = 1; console.warn('kumite frame', err); } }
    };
    raf = requestAnimationFrame(loop);
    const kd = (e) => {
      const u = ui.current;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (!audio.current.ready) audio.current.unlock();
      if (u.screen === 'fight' && !u.overlay && !u.paused && (input.current.claims(e.code) || e.code === 'Space')) e.preventDefault();
      if (e.code === 'Escape' || e.code === 'KeyP') { if (u.overlay) { setOverlay(null); return; } if (u.screen === 'fight') { togglePause(); return; } }
      if (!e.repeat) input.current.onKey(e, true);
      if (u.screen !== 'fight' || u.paused || u.overlay) menuKeys(e, u);
    };
    const ku = (e) => input.current.onKey(e, false);
    const blur = () => input.current.clear();
    const vis = () => { if (document.hidden) { input.current.clear(); if (ui.current.screen === 'fight' && !ui.current.paused) togglePause(true); audio.current.suspend(); } else audio.current.resume(); };
    const gesture = () => { audio.current.unlock(); };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', vis);
    root.addEventListener('pointerdown', gesture);
    // test hook
    window.__game = {
      id: 'kumite',
      state: () => ({ screen: ui.current.screen, paused: ui.current.paused, overlay: ui.current.overlay, mode: E.cfg ? E.cfg.mode : null, ...(E.summary() || {}), training: E.cfg && E.cfg.mode === 'training' ? { ...E.training, track: undefined } : null, lowFx: E.R.lowFx }),
      advance: (sec) => E.advance(sec),
      realtime: () => { E.manual = false; },
      input: { set: (p, bits) => { input.current.override[p] = bits; }, clear: () => { input.current.override = [null, null]; }, B },
      reset: () => E.reset(),
      startMatch: (o = {}) => {
        const cfg = { p1: o.p1 || 'rin', p2: o.p2 || 'ganji', cpu: [!!o.cpu1, o.cpu2 !== false], level: o.level || 2, stage: o.stage || 'viaduct', mode: o.mode || 'versus', rival: !!o.rival };
        setOverlay(null); setPaused(false); setMode(cfg.mode); setScreen('fight'); E.start(cfg); if (o.manual !== false) E.manual = true; return true;
      },
      pause: () => { if (!ui.current.paused) togglePause(); }, resume: () => { if (ui.current.paused) togglePause(); },
      setScreen: (s) => setScreen(s), overlay: (o) => setOverlay(o),
      training: (o) => { Object.assign(E.training, o); setTrainOpt((t) => ({ ...t, ...o })); if (o.boxes != null) E.R.hitboxes = o.boxes; },
      sim: () => E.S, renderer: E.R,
    };
    return () => {
      live = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', vis);
      root.removeEventListener('pointerdown', gesture);
      audio.current.close();
      if (window.__game && window.__game.id === 'kumite') delete window.__game;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- flows
  function attract() {
    const E = eng.current; const a = ROSTER[Math.floor(Math.random() * 4)]; let b = ROSTER[Math.floor(Math.random() * 4)]; if (b === a) b = ROSTER[(ROSTER.indexOf(a) + 1) % 4];
    E.start({ p1: a, p2: b, cpu: [true, true], level: 3, stage: STAGE_IDS[Math.floor(Math.random() * 3)], mode: 'attract' });
    if (audio.current) audio.current.music(0, true);
  }
  const togglePause = useCallback((force) => {
    const E = eng.current; if (!E) return;
    const p = force === true ? true : !ui.current.paused;
    E.paused = p; setPaused(p); setOverlay(null); input.current.clear();
    if (audio.current) audio.current.ui(p ? 'back' : 'ok');
  }, []);
  function matchEnd(res, S) {
    const u = ui.current; const E = eng.current;
    if (E.cfg.mode === 'attract') { setTimeout(() => { if (ui.current.screen !== 'fight') attract(); }, 1500); return; }
    setTimeout(() => {
      const w = res.winner; const human0 = !E.cfg.cpu[0];
      const r = { winner: w, ids: [S.f[0].id, S.f[1].id], wins: res.wins, mode: E.cfg.mode, quote: w >= 0 ? FIGHTERS[S.f[w].id].quote[S.frame % 3] : 'Nobody walks away from this one.' };
      if (u.mode === 'arcade' && u.arcade) {
        if (w === 0) {
          const a = { ...u.arcade, idx: u.arcade.idx + 1 };
          if (a.idx >= a.ladder.length) {
            const pg = ui.current.progress; const pr = { ...pg, cleared: { ...pg.cleared, [a.p1]: Math.max(pg.cleared[a.p1] || 0, a.level) }, best: Math.max(pg.best || 0, a.level) };
            setProgress(pr); save('arcade', pr); setArcade(a); setResult({ ...r, clear: true }); setScreen('ending'); return;
          }
          setArcade(a); setResult({ ...r, next: true }); setScreen('result'); return;
        }
        setResult({ ...r, lost: true }); setScreen('result'); return;
      }
      setResult(r); setScreen('result');
    }, 1400);
    if (audio.current && E.cfg.mode !== 'attract') audio.current.music(0, true);
  }
  function startFight(cfg) {
    const E = eng.current;
    setVs({ p1: cfg.p1, p2: cfg.p2, rival: cfg.rival, stage: cfg.stage, round: cfg.round });
    setScreen('vs'); E.manual = false;
    if (audio.current) audio.current.ui('ok');
    clearTimeout(ui.current.vsT);
    const go = () => { setScreen('fight'); setPaused(false); E.start(cfg); };
    ui.current.vsT = setTimeout(go, cfg.mode === 'training' ? 10 : 1700);
  }
  function arcadeFight(a) {
    const opp = a.ladder[a.idx]; const rival = a.idx === a.ladder.length - 1;
    startFight({ p1: a.p1, p2: opp, cpu: [false, true], level: rival ? 4 : a.level, stage: rival ? 'roof' : STAGE_IDS[a.idx % 3], mode: 'arcade', rival, round: `STAGE ${a.idx + 1} / ${a.ladder.length}` });
  }
  function choose(id) {
    const p = ui.current.pick; const m = ui.current.mode;
    if (audio.current) audio.current.ui('ok');
    if (m === 'arcade') {
      const others = ROSTER.filter((r) => r !== id); for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
      const a = { p1: id, ladder: [...others, id], idx: 0, level: p.level };
      setArcade(a); arcadeFight(a); return;
    }
    if (p.step === 0) { setPick({ ...p, p1: id, step: 1 }); return; }
    setPick({ ...p, p2: id, step: 2 }); setScreen('stage');
  }
  function goStage(stage) {
    const p = ui.current.pick; const m = ui.current.mode;
    const cfg = { p1: p.p1, p2: p.p2, stage, level: p.level, mode: m === 'versus2' ? 'versus' : m, cpu: [false, m === 'versus'] };
    if (m === 'training') { cfg.cpu = [false, false]; Object.assign(eng.current.training, trainOpt); }
    startFight(cfg);
  }
  function openMode(m) {
    if (audio.current) { audio.current.unlock(); audio.current.ui('ok'); }
    setMode(m); setPick({ step: 0, p1: ui.current.pick.p1, p2: ui.current.pick.p2, level: settings.level, stage: 'random' }); setScreen('select');
  }
  function backToTitle() { setOverlay(null); setPaused(false); setResult(null); setScreen('title'); attract(); }
  function rematch() { const E = eng.current; const c = { ...E.cfg }; if (ui.current.mode === 'arcade' && ui.current.arcade) { arcadeFight(ui.current.arcade); return; } startFight(c); }

  // ---------- keyboard and pad menu navigation
  function menuKeys(e, u) {
    const nav = { ArrowUp: -1, KeyW: -1, ArrowLeft: -1, KeyA: -1, ArrowDown: 1, KeyS: 1, ArrowRight: 1, KeyD: 1 };
    const scope = rootRef.current && (rootRef.current.querySelector('[data-menu].is-top') || rootRef.current.querySelector('[data-menu]'));
    if (!scope) return;
    const items = [...scope.querySelectorAll('button:not([disabled])')];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    if (nav[e.code] != null) { e.preventDefault(); const n = items[(i + nav[e.code] + items.length) % items.length] || items[0]; n.focus(); if (audio.current) audio.current.ui('move'); }
    else if (e.code === 'KeyJ' || e.code === 'Enter' || e.code === 'Space') { if (i >= 0 && e.code === 'KeyJ') { e.preventDefault(); items[i].click(); } else if (i < 0) { e.preventDefault(); items[0].focus(); } }
    else if (e.code === 'KeyK' || e.code === 'Backspace') { const back = scope.querySelector('[data-back]'); if (back) { e.preventDefault(); back.click(); } }
  }
  function padMenus(u) {
    const I = input.current; const b = I.padBits[0] | I.padBits[1]; const prev = I.padMenuPrev || 0; I.padMenuPrev = b;
    if (u.screen === 'fight' && !u.paused && !u.overlay) return;
    const pr = b & ~prev; if (!pr) return;
    const fake = (code) => menuKeys({ code, preventDefault() {} }, u);
    if (pr & (B.U | B.L)) fake('ArrowUp'); if (pr & (B.D | B.R)) fake('ArrowDown');
    if (pr & B.LP) { const a = document.activeElement; if (a && a.tagName === 'BUTTON') a.click(); else fake('Enter'); }
    if (pr & B.SP) fake('KeyK');
  }

  // ---------- render
  const showTouch = screen === 'fight' && !paused && !overlay && (settings.touch === 'on' || (settings.touch === 'auto' && coarse)) && mode !== 'attract';
  const E = eng.current;
  const ladder = arcade ? arcade.ladder : [];
  const p1ch = FIGHTERS[pick.p1];
  const cur = FIGHTERS[(screen === 'select' && pick.step === 1 ? pick.p2 : pick.p1)] || p1ch;
  return (
    <div ref={rootRef} className={'nk' + (portrait ? ' nk--portrait' : '') + (screen === 'fight' ? ' nk--fight' : '')}>
      <canvas ref={canvasRef} className="nk-canvas" aria-label="NEON KUMITE play field" />
      {screen !== 'fight' && <div className={'nk-dim' + (screen === 'title' ? ' nk-dim--light' : '')} />}

      {screen === 'title' && !overlay && (
        <div className="nk-title is-top" data-menu>
          <div className="nk-logo"><span className="nk-logo__jp">組手</span><h1>NEON KUMITE</h1><p>Four fighters. Three Tokyo nights. First to two rounds.</p></div>
          <nav className="nk-menu" aria-label="Main menu">
            <button type="button" className="nk-btn nk-btn--big" onClick={() => openMode('arcade')} autoFocus>Arcade</button>
            <button type="button" className="nk-btn" onClick={() => openMode('versus')}>Versus CPU</button>
            <button type="button" className="nk-btn" onClick={() => openMode('versus2')}>Versus 2P</button>
            <button type="button" className="nk-btn" onClick={() => openMode('training')}>Training</button>
            <button type="button" className="nk-btn nk-btn--ghost" onClick={() => { setMovesId(pick.p1); setOverlay('moves'); }}>Move list</button>
            <button type="button" className="nk-btn nk-btn--ghost" onClick={() => setOverlay('settings')}>Settings</button>
            <button type="button" className="nk-btn nk-btn--ghost" onClick={onExit} data-back>Exit to arcade</button>
          </nav>
          <p className="nk-keyhint">P1: WASD move · J light · K heavy · L special · J+K throw · K+L EX · J+K+L super · Esc pause</p>
        </div>
      )}

      {screen === 'select' && !overlay && (
        <div className="nk-select is-top" data-menu>
          <header className="nk-select__head">
            <button type="button" className="nk-btn nk-btn--ghost nk-btn--sm" data-back onClick={() => (pick.step === 1 ? setPick({ ...pick, step: 0 }) : backToTitle())}>Back</button>
            <h2>{mode === 'arcade' ? 'ARCADE · CHOOSE YOUR FIGHTER' : pick.step === 0 ? (mode === 'versus2' ? 'PLAYER 1 · CHOOSE' : 'CHOOSE YOUR FIGHTER') : mode === 'versus2' ? 'PLAYER 2 · CHOOSE' : mode === 'training' ? 'CHOOSE THE DUMMY' : 'CHOOSE THE CPU OPPONENT'}</h2>
            {(mode === 'arcade' || mode === 'versus') && <span className="nk-seg">{[1, 2, 3].map((l) => <button key={l} type="button" className={pick.level === l ? 'is-on' : ''} onClick={() => setPick({ ...pick, level: l })}>{LEVELS[l].name}</button>)}</span>}
          </header>
          <div className="nk-cards">
            {ROSTER.map((id) => {
              const c = FIGHTERS[id]; const chosen = pick.step === 1 && pick.p1 === id;
              return (
                <button key={id} type="button" className={'nk-card' + (chosen ? ' is-p1' : '')} style={{ '--c': c.color }} onClick={() => choose(id)} onFocus={() => setPick((p) => ({ ...p, [p.step === 1 ? 'p2' : 'p1']: id }))} autoFocus={id === (pick.step === 1 ? pick.p2 : pick.p1)}>
                  <Portrait id={id} size={150} />
                  <span className="nk-card__name">{c.name}</span>
                  <span className="nk-card__jp">{c.jp}</span>
                  <span className="nk-card__style">{c.style}{progress.cleared[id] ? ' · CLEARED' : ''}</span>
                  {chosen && <span className="nk-card__tag">P1</span>}
                </button>
              );
            })}
          </div>
          <div className="nk-bio" style={{ '--c': cur.color }}>
            <b>{cur.full}</b> <span className="nk-jp">{cur.jp}</span>
            <p>{cur.bio}</p>
            <dl><dt>Health</dt><dd>{cur.hp}</dd><dt>Speed</dt><dd>{cur.walkF.toFixed(1)}</dd><dt>Jump</dt><dd>{cur.jumpV.toFixed(1)}</dd></dl>
          </div>
        </div>
      )}

      {screen === 'stage' && !overlay && (
        <div className="nk-select is-top" data-menu>
          <header className="nk-select__head">
            <button type="button" className="nk-btn nk-btn--ghost nk-btn--sm" data-back onClick={() => { setPick({ ...pick, step: 1 }); setScreen('select'); }}>Back</button>
            <h2>CHOOSE A STAGE</h2>
          </header>
          <div className="nk-stages">
            {STAGE_IDS.map((id, i) => (
              <button key={id} type="button" className="nk-stage" onClick={() => goStage(id)} autoFocus={i === 0}>
                <StageThumb id={id} /><b>{STAGES[id].name}</b><span className="nk-jp">{STAGES[id].jp}</span>
              </button>
            ))}
            <button type="button" className="nk-stage nk-stage--rand" onClick={() => goStage('random')}><span className="nk-rand">?</span><b>RANDOM</b><span className="nk-jp">ランダム</span></button>
          </div>
          {mode === 'training' && (
            <p className="nk-help">Training: infinite time, health refills when a combo ends. Pause for dummy modes, hitboxes and meter.</p>
          )}
        </div>
      )}

      {screen === 'vs' && vs && (
        <div className="nk-vs" aria-live="polite">
          <div className="nk-vs__side nk-vs__l" style={{ '--c': FIGHTERS[vs.p1].color }}><Portrait id={vs.p1} size={portrait ? 120 : 210} /><b>{FIGHTERS[vs.p1].name}</b><span className="nk-jp">{FIGHTERS[vs.p1].jp}</span></div>
          <div className="nk-vs__mid"><span>VS</span>{vs.round && <small>{vs.round}</small>}{vs.rival && <em>RIVAL</em>}<small>{STAGES[vs.stage] ? STAGES[vs.stage].jp : ''}</small></div>
          <div className="nk-vs__side nk-vs__r" style={{ '--c': FIGHTERS[vs.p2].color }}><Portrait id={vs.p2} size={portrait ? 120 : 210} flip /><b>{FIGHTERS[vs.p2].name}</b><span className="nk-jp">{FIGHTERS[vs.p2].jp}</span></div>
        </div>
      )}

      {(screen === 'result' || screen === 'ending') && result && !overlay && (
        <div className="nk-result is-top" data-menu>
          <div className="nk-result__card" style={{ '--c': result.winner >= 0 ? FIGHTERS[result.ids[result.winner]].color : '#a29fb8' }}>
            {result.winner >= 0 && <Portrait id={result.ids[result.winner]} size={portrait ? 130 : 180} />}
            <div>
              <h2>{screen === 'ending' ? 'ARCADE CLEAR' : result.winner >= 0 ? `${FIGHTERS[result.ids[result.winner]].name} WINS` : 'DRAW'}</h2>
              <p className="nk-quote">“{result.quote}”</p>
              <p className="nk-score">{result.wins[0]} : {result.wins[1]}{result.mode === 'arcade' && arcade ? ` · stage ${Math.min(arcade.idx + (result.next ? 0 : 1), ladder.length)} of ${ladder.length}` : ''}</p>
            </div>
          </div>
          <nav className="nk-menu nk-menu--row">
            {result.next && <button type="button" className="nk-btn nk-btn--big" autoFocus onClick={() => arcadeFight(arcade)}>Next fight</button>}
            {result.lost && <button type="button" className="nk-btn nk-btn--big" autoFocus onClick={() => arcadeFight(arcade)}>Continue</button>}
            {!result.next && !result.lost && screen !== 'ending' && <button type="button" className="nk-btn nk-btn--big" autoFocus onClick={rematch}>Rematch</button>}
            {screen === 'ending' && <button type="button" className="nk-btn nk-btn--big" autoFocus onClick={() => openMode('arcade')}>Play again</button>}
            <button type="button" className="nk-btn" onClick={() => openMode(mode)}>Character select</button>
            <button type="button" className="nk-btn nk-btn--ghost" data-back onClick={backToTitle}>Main menu</button>
          </nav>
        </div>
      )}

      {screen === 'fight' && paused && !overlay && (
        <div className="nk-pause is-top" data-menu role="dialog" aria-label="Paused">
          <h2>PAUSED</h2>
          <nav className="nk-menu">
            <button type="button" className="nk-btn nk-btn--big" autoFocus onClick={() => togglePause()} data-back>Resume</button>
            <button type="button" className="nk-btn" onClick={() => { setMovesId(E && E.S ? E.S.f[0].id : 'rin'); setOverlay('moves'); }}>Move list</button>
            {mode === 'training' && <button type="button" className="nk-btn" onClick={() => setOverlay('train')}>Training options</button>}
            <button type="button" className="nk-btn" onClick={() => setOverlay('settings')}>Settings</button>
            <button type="button" className="nk-btn" onClick={() => { E.paused = false; setPaused(false); rematch(); }}>Restart</button>
            <button type="button" className="nk-btn nk-btn--ghost" onClick={() => openMode(mode === 'versus' && E && E.cfg && !E.cfg.cpu[1] ? 'versus2' : mode)}>Character select</button>
            <button type="button" className="nk-btn nk-btn--ghost" onClick={onExit}>Exit to arcade</button>
          </nav>
        </div>
      )}

      {overlay === 'train' && (
        <div className="nk-panel nk-train is-top" data-menu role="dialog" aria-label="Training options">
          <header className="nk-panel__head"><b>TRAINING</b></header>
          <div className="nk-set">
            <label>Dummy<span className="nk-seg">{[['stand', 'STAND'], ['crouch', 'CROUCH'], ['jump', 'JUMP'], ['block', 'BLOCK AFTER 1ST HIT'], ['cpu', 'CPU']].map(([v, l]) => <button key={v} type="button" className={trainOpt.dummy === v ? 'is-on' : ''} onClick={() => { const o = { ...trainOpt, dummy: v }; setTrainOpt(o); Object.assign(E.training, o); }}>{l}</button>)}</span></label>
            <label>Hitboxes<span className="nk-seg">{[true, false].map((v) => <button key={String(v)} type="button" className={trainOpt.boxes === v ? 'is-on' : ''} onClick={() => { const o = { ...trainOpt, boxes: v }; setTrainOpt(o); E.training.boxes = v; E.R.hitboxes = v; }}>{v ? 'SHOW' : 'HIDE'}</button>)}</span></label>
            <label>Meter refill<span className="nk-seg">{[true, false].map((v) => <button key={String(v)} type="button" className={trainOpt.meter === v ? 'is-on' : ''} onClick={() => { const o = { ...trainOpt, meter: v }; setTrainOpt(o); E.training.meter = v; }}>{v ? 'ON' : 'OFF'}</button>)}</span></label>
            <label>Health refill<span className="nk-seg">{[true, false].map((v) => <button key={String(v)} type="button" className={trainOpt.refill === v ? 'is-on' : ''} onClick={() => { const o = { ...trainOpt, refill: v }; setTrainOpt(o); E.training.refill = v; }}>{v ? 'ON' : 'OFF'}</button>)}</span></label>
          </div>
          <div className="nk-row"><button type="button" className="nk-btn nk-btn--ghost" onClick={() => E.resetPositions()}>Reset positions</button><button type="button" className="nk-btn" autoFocus data-back onClick={() => setOverlay(null)}>Done</button></div>
        </div>
      )}
      {overlay === 'moves' && <div className="nk-ovl is-top" data-menu><MoveList id={movesId} onPick={setMovesId} onClose={() => setOverlay(null)} /></div>}
      {overlay === 'settings' && <div className="nk-ovl is-top" data-menu><Settings settings={settings} setSettings={setSettings} keys={keys} setKeys={setKeys} input={input.current} onClose={() => setOverlay(null)} /></div>}

      {showTouch && <TouchPad input={input.current} portrait={portrait} onPause={() => togglePause()} />}
      {screen === 'fight' && !paused && !showTouch && <button type="button" className="nk-pausebtn" onClick={() => togglePause()} aria-label="Pause">II</button>}
      {portrait && !hintGone && (screen === 'title' || (screen === 'fight' && !paused && !overlay)) && <button type="button" className="nk-rotate" onClick={() => setHintGone(true)}>Rotate your phone for a better view ✕</button>}
    </div>
  );
}
