// KAZE (風): an ink-wash samurai journey. Host component: loop, menus, touch controls and the test hook.
import { useEffect, useRef, useState, useCallback } from 'react';
import { createSim, step, DT, blankInput } from './sim.js';
import { botInput, makeBot } from './bot.js';
import { Renderer, JP } from './render.js';
import { checkGarment } from './cloth.js';
import { Input, keyName, ACTIONS } from './input.js';
import { makeStore, DEFAULT_KEYS } from './save.js';
import { Audio } from './audio.js';
import { groundH } from './data.js';
import { CHAPTERS, NARRATION, ENDING, HAIKU, DIFF, CHARMS, PROLOGUE, OPENINGS } from './data.js';

const ACTION_LABEL = { left: 'Move left', right: 'Move right', up: 'Jump', down: 'Crouch', run: 'Walk (hold)', dodge: 'Dodge roll', slash: 'Quick cut', heavy: 'Heavy cut', parry: 'Parry / guard', focus: 'Focus (standoff)', interact: 'Bow, sit, take', wind: 'Call the wind', heal: 'Heal (uses resolve)' };

class Engine {
  constructor(cv, onUi, onExit) {
    this.cv = cv; this.onUi = onUi; this.onExit = onExit;
    this.store = makeStore(); this.settings = this.store.settings(); this.progress = this.store.progress(); this.haiku = this.store.haiku();
    this.input = new Input(); this.input.setMap(this.settings.keys);
    this.r = new Renderer(cv); this.audio = new Audio();
    this.screen = 'title'; this.manual = false; this.botOn = false; this.bot = makeBot({ secrets: true });
    this.I = blankInput(); this.acc = 0; this.last = 0; this.sig = '';
    this.mq = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.titleSim = createSim({ seed: 7, chapter: Math.min(this.progress.chapter || 0, 4) }); this.s = this.titleSim;
    this.input.onEsc = () => this.togglePause();
  }
  reduced() { return this.settings.reduced == null ? !!(this.mq && this.mq.matches) : !!this.settings.reduced; }
  newRun(o = {}) {
    const P = this.progress, diff = o.difficulty || this.settings.difficulty || 'blade';
    const ch = o.chapter ?? 0, cp = o.checkpoint ?? 0;
    this.s = createSim({ seed: (o.seed ?? (Date.now() & 0xffff)) | 0, difficulty: diff, chapter: ch, checkpoint: cp, resMax: o.fresh ? 3 : P.resMax, charms: o.fresh ? [] : P.charms, hidden: o.fresh ? [] : P.hidden, prologue: ch === 0 && cp === 0 && !o.noPrologue });
    this.acc = 0; this.r.cam.init = false; this.screen = 'play'; this.lastSaved = ''; this.saveProgress();
    this.audio.start(); this.emit(true);
  }
  saveProgress() {
    const s = this.s; if (s === this.titleSim) return;
    const P = this.progress; const key = s.ch + ':' + s.cp + ':' + s.resMax + ':' + s.charms.join() + s.hidden.join();
    if (key === this.lastSaved) return; this.lastSaved = key;
    Object.assign(P, { chapter: s.ch, checkpoint: s.cp, maxChapter: Math.max(P.maxChapter || 0, s.ch), resMax: s.resMax, charms: s.charms.slice(), hidden: s.hidden.slice(), difficulty: s.diff });
    this.store.saveProgress(P);
  }
  togglePause() {
    if (this.screen === 'play') { this.screen = 'pause'; this.audio.suspend(); }
    else if (this.screen === 'pause') { this.screen = 'play'; this.audio.resume(); }
    else if (['settings', 'controls'].includes(this.screen) && this.prevScreen) this.screen = this.prevScreen;
    this.emit(true);
  }
  go(screen) { if (['settings', 'controls', 'scroll', 'chapters'].includes(screen)) this.prevScreen = this.screen; this.screen = screen; this.emit(true); }
  tick(now) {
    const dt = Math.min(0.1, this.last ? (now - this.last) / 1000 : 0.016); this.last = now;
    if (this.frozen) return;
    // quality governor: if frames stay slow for 3 s, render fewer pixels (DPR 2 -> 1.5 -> 1)
    this.ema = this.ema ? this.ema * 0.95 + dt * 0.05 : dt;
    if (this.ema > 0.026 && this.dprCap > 1 && !this.manual) { this.slowT = (this.slowT || 0) + dt; if (this.slowT > 3) { this.dprCap = Math.max(1, this.dprCap - 0.5); this.slowT = 0; this.ema = 0.016; this.fit && this.fit(); } } else this.slowT = 0;
    const s = this.s;
    if (this.screen === 'title' || this.screen === 'chapters' || this.screen === 'scroll' || (this.screen === 'settings' && this.prevScreen === 'title') || (this.screen === 'controls' && this.prevScreen === 'title')) {
      this.acc += dt; while (this.acc >= DT) { step(this.titleSim, blankInput()); this.acc -= DT; } this.titleSim.cues.length = 0;
      this.s = this.titleSim; this.draw(dt, 'title'); return;
    }
    if (this.screen === 'play' && !this.manual) {
      const slow = this.slowF > 0 && !this.reduced(); if (this.slowF > 0) this.slowF--;
      this.acc += dt * (slow ? 0.25 : 1); let n = 0;
      while (this.acc >= DT && n < 6) { this.stepOnce(); this.acc -= DT; n++; }
      if (n === 6) this.acc = 0;
    }
    this.draw(dt, 'play');
  }
  stepOnce() {
    const s = this.s; const I = this.botOn ? botInput(s, this.bot) : this.input.snapshot(this.I);
    if (!this.botOn && this.input.mode === 'touch' && this.touchCtx) this.applyTouchContext(I);
    // any fresh press may dismiss a story plate once it has been readable
    if (!this.botOn) { const pv = s.prev; for (const k in I) if (I[k] && !pv[k] && k !== 'choose') { this.r.plateInput = true; break; } }
    step(s, I);
    this.handleCues(s);
  }
  applyTouchContext(I) {
    const s = this.s; if (!this.input.touch.ctx) return;
    if (s.phase === 'standoff') I.focus = true; else if (s.near) I.interact = true; else I.wind = true;
  }
  handleCues(s) {
    for (const c of s.cues) {
      this.audio.cue(c, s);
      if (c.k === 'parry' || c.k === 'reflect') this.slowF = 5;
      if (c.k === 'kill' && !s.foes.some((f) => f.st !== 'dead')) this.slowF = 5;
      if (c.k === 'haiku') { this.haiku.push({ ch: c.ch, jp: HAIKU[c.ch].jp, lines: c.lines, when: Date.now() }); this.store.saveHaiku(this.haiku); }
      if (c.k === 'checkpoint' || c.k === 'chapter' || c.k === 'secret' || c.k === 'charm') this.saveProgress();
    }
    if (s.phase === 'fin' && !this.finSaved) { this.finSaved = true; Object.assign(this.progress, { finished: true, lethal: true, chapter: 0, checkpoint: 0 }); this.store.saveProgress(this.progress); }
  }
  draw(dt, mode) {
    const s = this.s; this.audio.extGust = this.r.gustLevel || 0; this.audio.update(s, dt, this.screen);
    this.r.frame(s, this.manual ? 1 : Math.min(1, this.acc / DT), dt, { mode, reduced: this.reduced(), labels: this.input.labels(), touch: this.input.mode === 'touch' });
    this.emit();
  }
  emit(force) {
    const s = this.s, hk = s.hk;
    const sig = [this.screen, s.phase, hk ? hk.step + ':' + hk.done : '', s.near ? s.near.kind : '', s.so ? s.so.st : '', this.input.mode, s.ch, s.p.res, s.p.hp < s.p.hpMax, (s.phase === 'standoff' || (s.arena && s.arena.boss)) ? 'lb' : ''].join('|'); // [inkfx] duel letterbox flag for the touch layout
    if (sig !== this.sig || force) { this.sig = sig; this.onUi({ screen: this.screen, lb: s.phase === 'standoff' || !!(s.arena && s.arena.boss), phase: s.phase, hk: hk ? { step: hk.step, done: hk.done, picks: hk.picks.slice(), ch: hk.ch } : null, near: s.near ? s.near.kind : null, so: s.so ? s.so.st : null, mode: this.input.mode, ch: s.ch, res: s.p.res, canHeal: s.p.res > 0 && s.p.hp < s.p.hpMax, t: Date.now() }); }
  }
  setSettings(patch) { Object.assign(this.settings, patch); this.store.saveSettings(this.settings); this.input.setMap(this.settings.keys); this.audio.setVolume(this.settings); this.emit(true); }
}

export default function Game({ onExit }) {
  const stage = useRef(null), cvRef = useRef(null), eng = useRef(null);
  const [ui, setUi] = useState({ screen: 'title', phase: 'play' });
  const [, force] = useState(0);
  useEffect(() => {
    const cv = cvRef.current, el = stage.current;
    const E = new Engine(cv, setUi, onExit); eng.current = E;
    E.input.attach(window);
    E.dprCap = 2;
    const fit = () => { const r = el.getBoundingClientRect(); E.r.resize(r.width, r.height, Math.min(E.dprCap, window.devicePixelRatio || 1)); }; E.fit = fit;
    fit(); const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null; ro && ro.observe(el); window.addEventListener('resize', fit);
    let raf = 0; const loop = (t) => { raf = requestAnimationFrame(loop); try { E.tick(t); } catch (err) { if (!E.err) { E.err = err; console.warn('kaze frame error', err); } } };
    if (!(typeof location !== 'undefined' && /noloop/.test(location.search))) raf = requestAnimationFrame(loop);
    const vis = () => { if (document.hidden && E.screen === 'play') E.togglePause(); };
    document.addEventListener('visibilitychange', vis);
    const onTouch = () => { E.input.mode = 'touch'; E.emit(true); };
    window.addEventListener('touchstart', onTouch, { passive: true });
    // fonts used on the canvas (title cards, boss names, seal)
    try { document.fonts && document.fonts.load('700 40px "Noto Sans JP"', '竹の朝黄金棚田千鳥居雪峠暁城風割権六案山子大野門番静灯籠兵衛早瀬宗鉄'); } catch (e) { /* ignore */ }
    window.__game = {
      id: 'kaze', state: () => E.s, input: E.input.script, engine: E,
      advance: (sec, o = {}) => { E.manual = true; const n = Math.round(sec / DT); for (let i = 0; i < n; i++) { E.stepOnce(); if (o.render) E.draw(DT, 'play'); } if (!o.render) E.draw(DT, E.screen === 'play' ? 'play' : 'title'); return E.s.phase; },
      freeze: (on) => { E.frozen = !!on; },
      reset: () => { E.manual = false; E.newRun({ chapter: 0, checkpoint: 0, fresh: true }); },
      goto: (chapter, checkpoint = 0, o = {}) => { E.newRun(Object.assign({ chapter, checkpoint, noPrologue: true, seed: 1 }, o)); return E.s.phase; },
      bot: (on) => { E.botOn = !!on; E.bot = makeBot({ secrets: true }); },
      start: (o) => E.newRun(o || {}), pause: () => { if (E.screen === 'play') E.togglePause(); }, resume: () => { E.manual = false; if (E.screen === 'pause') E.togglePause(); },
      screen: () => E.screen, go: (sc) => E.go(sc), render: () => E.draw(0.016, E.screen === 'play' ? 'play' : 'title'),
      // the cloth rules, asserted on every figure the renderer last drew
      clothCheck: () => { const out = [], r = E.r; const figs = [['ronin', r.pfig], ...[...(r.figs || new Map())].map(([id, f]) => ['foe' + id, f])];
        for (const [n, f] of figs) if (f && f.garment && f.garment.legs) for (const b of checkGarment(f.garment)) out.push(n + '(' + f.garment.look + ') ' + b); return out; },
    };
    return () => { cancelAnimationFrame(raf); ro && ro.disconnect(); window.removeEventListener('resize', fit); document.removeEventListener('visibilitychange', vis); window.removeEventListener('touchstart', onTouch); E.input.detach(); E.audio.dispose(); if (window.__game && window.__game.engine === E) delete window.__game; };
  }, []);
  const E = eng.current;
  const act = useCallback((fn) => (e) => { e && e.preventDefault && e.preventDefault(); if (eng.current) { eng.current.audio.start(); fn(eng.current); force((x) => x + 1); } }, []);
  const S = ui.screen;
  return (
    <div className={`kz kz--${S}`} ref={stage}>
      <canvas className="kz__cv" ref={cvRef} aria-label="KAZE, an ink-wash samurai journey" />
      {E && S === 'title' && <Title E={E} act={act} onExit={onExit} />}
      {E && S === 'chapters' && <Chapters E={E} act={act} />}
      {E && S === 'scroll' && <ScrollView E={E} act={act} />}
      {E && S === 'pause' && <Pause E={E} act={act} onExit={onExit} />}
      {E && S === 'settings' && <Settings E={E} act={act} />}
      {E && S === 'controls' && <Controls E={E} act={act} />}
      {E && S === 'play' && <PlayLayer E={E} ui={ui} act={act} onExit={onExit} />}
    </div>
  );
}

function Btn({ children, onClick, primary, autoFocus, ...rest }) { return <button type="button" className={`kz-btn${primary ? ' kz-btn--p' : ''}`} onClick={onClick} autoFocus={autoFocus} {...rest}>{children}</button>; }
function Panel({ children, wide, title, jp }) { return <div className={`kz-panel${wide ? ' kz-panel--wide' : ''}`} role="dialog" aria-label={title}>{(title || jp) && <h2 className="kz-h"><span lang="ja">{jp}</span>{title}</h2>}{children}</div>; }

// A menu is a column of italic words; one short ink dash slides to the word under the pointer or the focus.
function Menu({ children, label, className = '' }) {
  const ref = useRef(null), dash = useRef(null);
  const place = (el) => { const r = ref.current, d = dash.current; if (!r || !d || !el || !el.closest) return; const b = el.closest('button'); if (!b || b.disabled || !r.contains(b)) return; d.style.transform = `translateY(${b.offsetTop + b.offsetHeight / 2}px)`; d.style.opacity = '0.88'; };
  useEffect(() => { const r = ref.current; if (!r) return; const a = document.activeElement; place(a && r.contains(a) ? a : r.querySelector('button:not([disabled])')); });
  const key = (e) => { if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return; const bs = [...ref.current.querySelectorAll('button:not([disabled])')]; if (!bs.length) return; const i = bs.indexOf(document.activeElement); const n = bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1) + (i < 0 ? 1 : 0)) % bs.length]; e.preventDefault(); n.focus(); };
  const back = () => { const r = ref.current, a = document.activeElement; if (r && a && r.contains(a)) place(a); };
  return <nav ref={ref} className={`kz-menu ${className}`} aria-label={label} onFocus={(e) => place(e.target)} onMouseOver={(e) => place(e.target)} onMouseLeave={back} onKeyDown={key}><span className="kz-dash" ref={dash} aria-hidden="true" />{children}</nav>;
}
// ink rings drawn around the ronin's feet on the title, placed from the renderer's camera
function Rings({ E }) {
  const ref = useRef(null);
  useEffect(() => { let raf = 0; const tick = () => { raf = requestAnimationFrame(tick); const el = ref.current, r = E.r, s = E.titleSim; if (!el || !r || !r.v || !s) return; const d = r.dpr || 1, x = r.worldToScreenX(s.p.x) / d, y = r.worldToScreenY(-groundH(s.ch, s.p.x)) / d, k = (r.v.k || 1) * (r.v.zoom || 1) / d;
    el.style.left = `${x - 90 * k}px`; el.style.top = `${y - 18 * k}px`; el.style.width = `${180 * k}px`; el.style.height = `${36 * k}px`; }; tick(); return () => cancelAnimationFrame(raf); }, [E]);
  return <svg className="kz-rings" ref={ref} viewBox="0 0 180 36" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="90" cy="18" rx="42" ry="7" strokeWidth="2" opacity="0.62" strokeDasharray="70 9 30 6 120 14" /><ellipse cx="90" cy="18" rx="64" ry="11" strokeWidth="1.4" opacity="0.42" strokeDasharray="110 16 60 10 140 20" /><ellipse cx="90" cy="18" rx="86" ry="16" strokeWidth="1" opacity="0.26" strokeDasharray="90 30 150 24 80 40" /></svg>;
}
function Title({ E, act, onExit }) {
  const P = E.progress, cont = P.chapter > 0 || P.checkpoint > 0;
  return (<>
    <Rings E={E} />
    <div className="kz-title">
      <div className="kz-title__brand"><h1 className="kz-title__name" aria-label="Kaze">KAZE<span className="kz-seal" lang="ja" aria-hidden="true">風</span></h1><p className="kz-title__tag">A ronin, the wind, and five duels on the road north.</p></div>
      <Menu label="KAZE menu">
        {cont ? <Btn primary autoFocus onClick={act((e) => e.newRun({ chapter: P.chapter, checkpoint: P.checkpoint }))} aria-label={`Continue: ${CHAPTERS[P.chapter].en}`}>Continue<small>{CHAPTERS[P.chapter].en}</small></Btn> : null}
        <Btn primary={!cont} autoFocus={!cont} onClick={act((e) => e.newRun({ chapter: 0, checkpoint: 0, fresh: !P.finished && !cont ? true : false }))}>{cont ? 'Begin again' : 'Begin'}</Btn>
        {(P.maxChapter > 0 || P.finished) && <Btn onClick={act((e) => e.go('chapters'))}>Chapters</Btn>}
        <Btn onClick={act((e) => e.go('scroll'))} aria-label={`Scroll of haiku${E.haiku.length ? `, ${E.haiku.length} kept` : ''}`}>Haiku{E.haiku.length ? <small>{E.haiku.length}</small> : null}</Btn>
        <Btn onClick={act((e) => e.go('settings'))} aria-label={`Settings, difficulty ${DIFF[E.settings.difficulty].name}`}>Settings</Btn>
        <Btn onClick={act((e) => e.go('controls'))}>Controls</Btn>
        <Btn onClick={() => onExit && onExit()} aria-label="Return to the city">Leave</Btn>
      </Menu>
      <p className="kz-rotate">Best played in landscape.</p>
    </div>
  </>);
}
function Chapters({ E, act }) {
  const max = E.progress.finished ? 4 : E.progress.maxChapter;
  return (<div className="kz-veil"><Panel title="Chapters" jp="章"><Menu label="Chapters">{CHAPTERS.map((c, i) => <Btn key={c.key} autoFocus={i === 0} disabled={i > max} onClick={act((e) => e.newRun({ chapter: i, checkpoint: 0, noPrologue: i > 0 }))}><span className="kz-chj" lang="ja">{c.jp}</span>{c.en}</Btn>)}<Btn onClick={act((e) => e.go('title'))}>Back</Btn></Menu></Panel></div>);
}
function ScrollView({ E, act }) {
  const list = E.haiku.slice().reverse();
  return (<div className="kz-veil"><Panel wide title="Scroll of haiku" jp="句">
    {list.length ? <div className="kz-scroll">{list.map((h, i) => <figure key={i} className="kz-poem"><figcaption lang="ja">{h.jp}</figcaption>{h.lines.map((l, j) => <p key={j}>{l}</p>)}<small>{CHAPTERS[h.ch].en}</small></figure>)}</div> : <p className="kz-muted">Empty for now. There is one place to sit in every chapter; the wind knows where.</p>}
    {E.progress.charms.length > 0 && <p className="kz-muted">Charms: {E.progress.charms.map((c) => CHARMS[c].name).join(', ')}.</p>}
    <Menu label="Scroll"><Btn autoFocus onClick={act((e) => e.go('title'))}>Back</Btn></Menu></Panel></div>);
}
function Pause({ E, act, onExit }) {
  return (<div className="kz-veil"><Panel title="Paused" jp="休">
    <Menu label="Paused"><Btn primary autoFocus onClick={act((e) => e.togglePause())}>Resume</Btn>
      <Btn onClick={act((e) => e.go('controls'))}>Controls</Btn><Btn onClick={act((e) => e.go('settings'))}>Settings</Btn>
      <Btn onClick={act((e) => { const s = e.s; e.newRun({ chapter: s.ch, checkpoint: s.cp, noPrologue: true, difficulty: s.diff }); })}>Return to the last shrine</Btn>
      <Btn onClick={act((e) => { e.screen = 'title'; e.titleSim = createSim({ seed: 7, chapter: e.s.ch }); e.r.cam.init = false; e.emit(true); })}>Title screen</Btn>
      <Btn onClick={() => onExit && onExit()}>Exit to the arcade</Btn></Menu></Panel></div>);
}
function Settings({ E, act }) {
  const st = E.settings, P = E.progress; const diffs = ['story', 'blade'].concat(P.lethal ? ['lethal'] : []);
  const slider = (k, label) => <label className="kz-row"><span>{label}</span><input type="range" min="0" max="1" step="0.05" value={st[k]} onChange={(e) => { E.setSettings({ [k]: +e.target.value }); }} /></label>;
  return (<div className="kz-veil"><Panel title="Settings" jp="設定">
    <div className="kz-row"><span>Difficulty</span><div className="kz-seg">{diffs.map((d) => <button type="button" key={d} className={st.difficulty === d ? 'is-on' : ''} aria-pressed={st.difficulty === d} onClick={act((e) => e.setSettings({ difficulty: d }))}>{DIFF[d].name}</button>)}</div></div>
    <p className="kz-muted">{E.screen === 'settings' && E.prevScreen === 'pause' ? 'A new difficulty applies from the next chapter or shrine.' : 'Story widens every window. Lethal unlocks after the ending.'}</p>
    {slider('volume', 'Volume')}{slider('music', 'Music')}{slider('sfx', 'Effects')}
    <label className="kz-row"><span>Sound</span><input type="checkbox" checked={!st.muted} onChange={(e) => E.setSettings({ muted: !e.target.checked })} /></label>
    <label className="kz-row"><span>Reduced effects</span><input type="checkbox" checked={E.reduced()} onChange={(e) => E.setSettings({ reduced: e.target.checked })} /></label>
    <Menu label="Settings"><Btn autoFocus onClick={act((e) => e.go(e.prevScreen || 'title'))}>Back</Btn></Menu></Panel></div>);
}
function Controls({ E, act }) {
  const [wait, setWait] = useState(null);
  const map = E.input.map;
  useEffect(() => () => { E.input.capture = null; }, []);
  const remap = (a) => { setWait(a); E.input.capture = (code) => { E.input.capture = null; setWait(null); if (code !== 'Escape') { const keys = Object.assign({}, E.settings.keys || {}, { [a]: [code, ...(DEFAULT_KEYS[a].slice(1))] }); E.setSettings({ keys }); } }; };
  const rows = ACTIONS.filter((a) => a !== 'down');
  return (<div className="kz-veil"><Panel wide title="Controls" jp="操作">
    <div className="kz-ctl">{rows.map((a) => <div className="kz-ctl__r" key={a}><span>{ACTION_LABEL[a]}</span><button type="button" className={`kz-key${wait === a ? ' is-wait' : ''}`} onClick={() => remap(a)} aria-label={`Change key for ${ACTION_LABEL[a]}`}>{wait === a ? 'Press a key' : keyName(map[a][0])}</button></div>)}</div>
    <p className="kz-muted">Parry also on right mouse. Heavy while guarding spends one resolve for a counter that cannot fail. Pad: X cut, Y heavy, RB parry, B dodge, A jump and interact, LT focus, LB wind, Down heal. Touch: stick on the left, four buttons on the right, ◎ for the context action.</p>
    <Menu label="Controls" className="kz-menu--row"><Btn autoFocus onClick={act((e) => e.go(e.prevScreen || 'title'))}>Back</Btn><Btn onClick={act((e) => e.setSettings({ keys: null }))}>Reset keys</Btn></Menu></Panel></div>);
}

function PlayLayer({ E, ui, act, onExit }) {
  const s = E.s;
  return (<>
    <button type="button" className="kz-pausebtn" onClick={act((e) => e.togglePause())} aria-label="Pause">II</button>
    {ui.phase === 'haiku' && ui.hk && <HaikuPanel E={E} hk={ui.hk} act={act} />}
    {ui.phase === 'narr' && <Narration lines={s.prologue ? PROLOGUE : [OPENINGS[Math.min(OPENINGS.length - 1, s.ch + 1)]]} key={s.ch + (s.prologue ? 'p' : '')} />}
    {ui.phase === 'ending' && <div className="kz-narr kz-narr--end">{ENDING.map((l, i) => <p key={i} style={{ animationDelay: `${1.2 + i * 2.6}s` }}>{l}</p>)}</div>}
    {ui.phase === 'credits' && <Credits E={E} />}
    {ui.phase === 'fin' && <Fin E={E} act={act} onExit={onExit} />}
    {ui.mode === 'touch' && ['play', 'standoff', 'dead'].includes(ui.phase) && <Touch E={E} ui={ui} />}
  </>);
}
function Narration({ lines }) { return <div className="kz-narr">{lines.map((l, i) => <p key={i} style={{ animationDelay: `${0.4 + i * 1.1}s` }}>{l}</p>)}<small>Press Enter to go on</small></div>; }
function HaikuPanel({ E, hk, act }) {
  const H = HAIKU[hk.ch];
  const choose = (i) => act((e) => { e.input.script.choose = i + 1; setTimeout(() => { e.input.script.choose = 0; }, 120); });
  return (<div className="kz-haiku" role="dialog" aria-label="Compose a haiku">
    <h2 className="kz-h"><span lang="ja">{H.jp}</span>{H.en}</h2>
    <div className="kz-haiku__poem">{hk.picks.map((k, i) => <p key={i}>{H.lines[i][k]}</p>)}{!hk.done && <p className="kz-haiku__blank">…</p>}</div>
    {!hk.done ? <div className="kz-haiku__opts">{H.lines[hk.step].map((l, i) => <button type="button" key={i} className="kz-opt" onClick={choose(i)} autoFocus={i === 0}><b>{i + 1}</b>{l}</button>)}</div>
      : <div className="kz-stack"><p className="kz-muted">Kept in your scroll.</p><Menu label="Rise"><Btn primary autoFocus onClick={act((e) => { e.input.script.confirm = true; setTimeout(() => { e.input.script.confirm = false; }, 120); })}>Rise</Btn></Menu></div>}
    {!hk.done && <p className="kz-muted">Choose with 1, 2, 3. Dodge to stand up.</p>}
  </div>);
}
function Credits({ E }) {
  const mine = E.haiku.slice(-5);
  return (<div className="kz-credits"><div className="kz-credits__roll">
    <h2><span lang="ja">風</span> KAZE</h2><p>A journey in ink, for the arcade of the city you just left.</p>
    <p>Every brushstroke, every note and every gust was made by code, live, in your browser.</p>
    {mine.length > 0 && <><h3>Your haiku</h3>{mine.map((h, i) => <figure key={i} className="kz-poem"><figcaption lang="ja">{h.jp}</figcaption>{h.lines.map((l, j) => <p key={j}>{l}</p>)}</figure>)}</>}
    <h3>Thank you for walking</h3><p>The wind will be here when you come back.</p>
  </div></div>);
}
function Fin({ E, act, onExit }) {
  return (<div className="kz-veil"><Panel title="The road ends here" jp="終">
    <p className="kz-muted">Lethal is now open: tighter windows, two cuts and you fall.</p>
    <Menu label="The road ends"><Btn primary autoFocus onClick={() => onExit && onExit()}>Return to the city</Btn>
      <Btn onClick={act((e) => { e.setSettings({ difficulty: 'lethal' }); e.newRun({ chapter: 0, checkpoint: 0, difficulty: 'lethal', fresh: true }); })}>Walk it again on Lethal</Btn>
      <Btn onClick={act((e) => { e.screen = 'title'; e.titleSim = createSim({ seed: 7, chapter: 4 }); e.r.cam.init = false; e.emit(true); })}>Title screen</Btn></Menu></Panel></div>);
}

// Touch: a stick on the left, four buttons on the right, a context button above them.
function Touch({ E, ui }) {
  const stick = useRef(null), knob = useRef(null), pid = useRef(null);
  const T = E.input.touch;
  const move = (e) => {
    const r = stick.current.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2), m = Math.min(1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
    const x = Math.cos(a) * m, y = Math.sin(a) * m;
    T.left = x < -0.3; T.right = x > 0.3; T.run = Math.abs(x) > 0.85; T.up = y < -0.7;
    if (knob.current) knob.current.style.transform = `translate(${x * 34}px, ${y * 34}px)`;
  };
  const end = () => { pid.current = null; T.left = T.right = T.run = T.up = false; if (knob.current) knob.current.style.transform = ''; };
  const hold = (k) => ({ onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); T[k] = true; E.input.mode = 'touch'; E.audio.start(); if (k === 'ctx') E.touchCtx = true; }, onPointerUp: () => { T[k] = false; }, onPointerCancel: () => { T[k] = false; }, onPointerLeave: () => { T[k] = false; } });
  const ctxLabel = ui.phase === 'standoff' ? 'Focus' : ui.near === 'bow' ? 'Bow' : ui.near === 'sit' ? 'Sit' : ui.near === 'take' ? 'Take' : 'Wind';
  return (<div className={`kz-touch${ui.lb ? ' kz-touch--lb' : ''}`}> {/* [inkfx] buttons lift clear of the duel letterbox */}
    <div className="kz-stick" ref={stick} onPointerDown={(e) => { e.preventDefault(); pid.current = e.pointerId; e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={(e) => { if (pid.current === e.pointerId) move(e); }} onPointerUp={end} onPointerCancel={end}><div className="kz-stick__knob" ref={knob} /></div>
    {ui.canHeal && <button type="button" className="kz-heal" {...hold('heal')} aria-label="Heal">Heal</button>}
    <div className="kz-pad">
      <button type="button" className="kz-tb kz-tb--ctx" {...hold('ctx')}>{ctxLabel}</button>
      <button type="button" className="kz-tb kz-tb--heavy" {...hold('heavy')}>Heavy</button>
      <button type="button" className="kz-tb kz-tb--slash" {...hold('slash')}>Cut</button>
      <button type="button" className="kz-tb kz-tb--parry" {...hold('parry')}>Parry</button>
      <button type="button" className="kz-tb kz-tb--dodge" {...hold('dodge')}>Dodge</button>
    </div>
  </div>);
}
