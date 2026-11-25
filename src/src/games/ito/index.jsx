// ITO 糸: a night courier on two grapple lines, across a printed-comic Shinjuku skyline.
import { useCallback, useEffect, useRef, useState } from 'react';
import { MEDALS } from './sim/index.js';
import { STORY } from './story.js';

const KEY = 'nc2:ito';
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
const DEFAULT_SETTINGS = { quality: 'auto', sens: 1, invertY: false, assist: true, sound: true, music: true };
const RUNS = [{ name: 'FIRST DROP', jp: '初便', line: 'Down the avenue, then the corner.' }, { name: 'RUSH ORDER', jp: '急便', line: 'Low over the walkway, up into the towers.' }, { name: 'LAST TRAIN', jp: '終電', line: 'The tracks, the tallest roofs, the shrine.' }];
const fmt = (t) => { if (t == null || !isFinite(t)) return '--:--.--'; const m = Math.floor(t / 60), s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`; };
const medalOf = (n, t) => (t == null ? null : t <= MEDALS[n].gold ? 'gold' : t <= MEDALS[n].silver ? 'silver' : t <= MEDALS[n].bronze ? 'bronze' : null);
const MEDAL_JP = { gold: '金', silver: '銀', bronze: '銅' };
const touchDevice = () => typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Ito({ onExit }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const hudRef = useRef(null);
  const [screen, setScreen] = useState('loading'); // loading | title | runs | tutorial | play | results | nogl
  const [paused, setPaused] = useState(false);
  const [panel, setPanel] = useState(null); // null | 'settings'
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load(KEY, {}).settings }));
  const [best, setBest] = useState(() => load(KEY, {}).best || [null, null, null]);
  const [result, setResult] = useState(null);
  const [tutStep, setTutStep] = useState(0);
  const [mode, setMode] = useState(null); // {kind:'run', n} | {kind:'free'} | {kind:'tutorial'}
  const [touch] = useState(touchDevice);
  const [lostGl, setLostGl] = useState(false);
  const [toast, setToast] = useState(null);
  const [radio, setRadio] = useState(null); // dispatcher line on a small plate: { text, key }
  const say = useCallback((text) => { setRadio({ text, key: Math.random() }); engineRef.current?.sfx('radio'); }, []);
  const modeRef = useRef(mode); modeRef.current = mode;
  const screenRef = useRef(screen); screenRef.current = screen;
  const pausedRef = useRef(paused); pausedRef.current = paused;

  const persist = useCallback((patch) => { const cur = load(KEY, {}); save(KEY, { ...cur, ...patch }); }, []);

  // ---------- engine lifecycle ----------
  useEffect(() => {
    let disposed = false, eng = null;
    (async () => {
      const [{ createIto, webglOk }, { loadFonts }] = await Promise.all([import('./engine.js'), import('./render/textures.js')]);
      if (disposed) return;
      if (!webglOk()) { setScreen('nogl'); return; }
      await loadFonts();
      if (disposed || !canvasRef.current) return;
      const ghosts = [0, 1, 2].map((n) => load(`${KEY}:g${n}`, null));
      const saved = load(KEY, {});
      try {
        eng = createIto(canvasRef.current, { reduced: reducedMotion(), settings: { ...DEFAULT_SETTINGS, ...saved.settings }, ghosts, onEvent: (e) => onEventRef.current(e), onHud: (d) => hudRef.current && hudRef.current(d) });
      } catch (err) { console.warn('ITO: WebGL setup failed', err); setScreen('nogl'); return; }
      if (saved.cranes) { const c = eng.S.cranes; saved.cranes.split('').forEach((b, i) => { if (b === '1' && i < c.length) c[i] = 1; }); eng.S.craneCount = [...c].filter(Boolean).length; }
      engineRef.current = eng;
      setScreen('title');
      // test hook
      window.__game = {
        id: 'ito', engine: eng,
        get input() { return eng.sim.input; },
        state: () => ({ ...eng.state(), screen: screenRef.current, ui: { paused: pausedRef.current } }),
        advance: (sec) => eng.advance(sec),
        reset: () => { eng.begin('title'); setScreen('title'); setPaused(false); },
        startRun: (n) => startRun(n),
        startFree: () => startFree(),
        startTutorial: () => startTutorial(),
        bot: (on) => eng.bot(on),
        look: (y, p) => eng.look(y, p),
        pause: (on = true) => doPause(on),
        stats: () => eng.stats(),
        sim: eng.sim,
      };
    })();
    return () => {
      disposed = true;
      if (eng) eng.dispose();
      engineRef.current = null;
      if (window.__game && window.__game.id === 'ito') delete window.__game;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- flows ----------
  const startRun = useCallback((n) => {
    const e = engineRef.current; if (!e) return;
    e.setGhosts([0, 1, 2].map((k) => load(`${KEY}:g${k}`, null)));
    e.begin('run', n); setMode({ kind: 'run', n }); setScreen('play'); setPaused(false); setPanel(null); setResult(null);
    e.audioStart();
    setTimeout(() => say(STORY.runs[n].start), 350);
  }, [say]);
  const startFree = useCallback(() => {
    const e = engineRef.current; if (!e) return;
    e.begin('free'); setMode({ kind: 'free' }); setScreen('play'); setPaused(false); setPanel(null); setResult(null);
    e.audioStart();
  }, []);
  const startTutorial = useCallback(() => {
    const e = engineRef.current; if (!e) return;
    e.begin('tutorial'); setMode({ kind: 'tutorial' }); setTutStep(0); setScreen('tutorial'); setPaused(false); setPanel(null);
    e.audioStart();
  }, []);
  const toTitle = useCallback(() => { const e = engineRef.current; if (!e) return; e.begin('title'); setMode(null); setScreen('title'); setPaused(false); setPanel(null); setRadio(null); }, []);
  const doPause = useCallback((on) => {
    const e = engineRef.current; if (!e) return;
    if (screenRef.current !== 'play' && screenRef.current !== 'tutorial') return;
    e.pause(on); setPaused(on); if (!on) setPanel(null);
    e.sfx(on ? 'uiback' : 'ui');
  }, []);
  const play = useCallback(() => {
    if (!load(KEY, {}).tut) startTutorial(); else setScreen('runs');
    engineRef.current?.audioStart();
    engineRef.current?.sfx('ui');
  }, [startTutorial]);

  const finishTutorial = useCallback(() => { persist({ tut: true }); setScreen('runs'); const e = engineRef.current; e && e.begin('title'); setMode(null); }, [persist]);

  // ---------- engine events ----------
  const onEventRef = useRef(() => {});
  onEventRef.current = (ev) => {
    const e = engineRef.current;
    switch (ev.type) {
      case 'escape':
        if (panel) { setPanel(null); break; }
        if (screenRef.current === 'play' || screenRef.current === 'tutorial') doPause(!pausedRef.current || !!ev.hidden);
        else if (screenRef.current === 'runs') setScreen('title');
        break;
      case 'tut':
        setTutStep(ev.step);
        if (ev.step >= 4) setTimeout(() => { if (screenRef.current === 'tutorial') finishTutorial(); }, 1400);
        break;
      case 'finish': {
        const n = ev.idx, t = ev.t;
        const prev = best[n];
        const isBest = prev == null || t < prev;
        if (isBest) {
          const nb = best.slice(); nb[n] = t; setBest(nb); persist({ best: nb });
          save(`${KEY}:g${n}`, e.S.ghostRec.slice());
        }
        setResult({ n, t, top: ev.top, chain: ev.chain, isBest, prev, medal: medalOf(n, t) });
        setRadio(null);
        if (document.pointerLockElement) document.exitPointerLock?.();
        setTimeout(() => setScreen('results'), 700);
        break;
      }
      case 'crane': {
        const bits = Array.from(e.S.cranes).join('');
        persist({ cranes: bits });
        setToast(`折り鶴 ${ev.count} / ${ev.total}`);
        if (STORY.cranes[ev.count] || ev.count === ev.total) say(STORY.cranes[ev.count] || STORY.cranes[30]);
        clearTimeout(onEventRef.toastT); onEventRef.toastT = setTimeout(() => setToast(null), 1600);
        break;
      }
      case 'contextlost': setLostGl(true); break;
      default:
    }
  };

  // lose pointer lock mid-run (Esc in the browser) = pause
  useEffect(() => {
    const onLock = () => { if (!document.pointerLockElement && (screenRef.current === 'play' || screenRef.current === 'tutorial') && !pausedRef.current) doPause(true); };
    document.addEventListener('pointerlockchange', onLock);
    return () => document.removeEventListener('pointerlockchange', onLock);
  }, [doPause]);

  const updateSettings = (patch) => {
    const s = { ...settings, ...patch };
    setSettings(s); persist({ settings: s });
    engineRef.current?.setSettings(patch);
    engineRef.current?.sfx('ui');
  };

  const playing = screen === 'play' || screen === 'tutorial';
  return (
    <div className={`ito ${playing ? 'ito--playing' : ''} ${touch ? 'ito--touch' : ''}`}>
      <canvas ref={canvasRef} className="ito__canvas" aria-label="ITO game view" tabIndex={0} />
      {screen === 'loading' && <div className="ito__loading"><b>糸</b><span>stringing the city…</span></div>}
      {screen === 'nogl' && (
        <div className="ito__center"><div className="ito-panel"><h2>WebGL 2 is off</h2><p>ITO needs WebGL 2. Try another browser, or turn hardware acceleration on.</p><button type="button" className="ito-btn" onClick={onExit}>Back to the arcade</button></div></div>
      )}
      {lostGl && (
        <div className="ito__center"><div className="ito-panel"><h2>Graphics reset</h2><p>The GPU dropped the scene. Reload to carry on.</p><button type="button" className="ito-btn ito-btn--go" onClick={() => window.location.reload()}>Reload</button><button type="button" className="ito-btn" onClick={onExit}>Arcade</button></div></div>
      )}
      {screen === 'title' && <Title onPlay={play} onFree={startFree} onSettings={() => setPanel('settings')} onExit={onExit} tutorialDone={!!load(KEY, {}).tut} onTutorial={startTutorial} />}
      {screen === 'runs' && <RunSelect best={best} onRun={startRun} onBack={() => setScreen('title')} onTutorial={startTutorial} />}
      {playing && <Hud register={(fn) => { hudRef.current = fn; }} mode={mode} touch={touch} total={mode && mode.kind === 'run' && engineRef.current ? engineRef.current.sim.runs[mode.n].rings.length : 0} />}
      {screen === 'tutorial' && !paused && <Tutorial step={tutStep} touch={touch} onSkip={finishTutorial} />}
      {playing && touch && !paused && <TouchControls engine={engineRef} onPause={() => doPause(true)} />}
      {playing && !touch && !paused && <button type="button" className="ito-pausebtn" onClick={() => doPause(true)} aria-label="Pause">II</button>}
      {toast && <div className="ito-toast" role="status">{toast}</div>}
      {radio && playing && !paused && <Dispatch key={radio.key} text={radio.text} onClose={() => setRadio(null)} />}
      {paused && !panel && (
        <div className="ito__center ito__scrim">
          <div className="ito-panel ito-panel--menu" role="dialog" aria-label="Paused">
            <h2>一時停止 <small>PAUSED</small></h2>
            <button type="button" className="ito-btn ito-btn--go" autoFocus onClick={() => doPause(false)}>Resume</button>
            {screen === 'play' && <button type="button" className="ito-btn" onClick={() => { engineRef.current?.restart(); doPause(false); }}>Restart <kbd>R</kbd></button>}
            <button type="button" className="ito-btn" onClick={() => setPanel('settings')}>Settings</button>
            <button type="button" className="ito-btn" onClick={() => { toTitle(); }}>Title screen</button>
            <button type="button" className="ito-btn ito-btn--quiet" onClick={onExit}>Exit to arcade</button>
          </div>
        </div>
      )}
      {panel === 'settings' && <Settings settings={settings} onChange={updateSettings} onClose={() => setPanel(null)} />}
      {screen === 'results' && result && (
        <Results r={result} onNext={() => startRun((result.n + 1) % 3)} onRetry={() => startRun(result.n)} onMenu={() => { toTitle(); setScreen('runs'); }} />
      )}
    </div>
  );
}

// the dispatcher on the radio: a small plate at the top, never over the courier; fades by itself, tap to dismiss
function Dispatch({ text, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, Math.max(4500, text.length * 70)); return () => clearTimeout(t); }, [text, onClose]);
  return (
    <div className="ito-radio" role="status" aria-live="polite">
      <b>{STORY.who}</b>
      <span>{text}</span>
      <button type="button" className="ito-radio__x" onClick={onClose} aria-label="Dismiss message">✕</button>
    </div>
  );
}

function Logo({ small }) {
  return (
    <div className={`ito-logo ${small ? 'ito-logo--small' : ''}`} aria-label="ITO">
      <span className="ito-logo__kanji" aria-hidden="true">糸</span>
      <span className="ito-logo__latin">ITO</span>
    </div>
  );
}

function Title({ onPlay, onFree, onSettings, onExit, onTutorial, tutorialDone }) {
  return (
    <div className="ito-title">
      <div className="ito-title__card">
        <Logo />
        <p className="ito-title__premise">A night courier, two grapple lines, and the whole Nishi-Shinjuku skyline between you and the drop.</p>
        <nav className="ito-title__menu">
          <button type="button" className="ito-btn ito-btn--go" autoFocus onClick={onPlay}>Play</button>
          <button type="button" className="ito-btn" onClick={onFree}>Free roam <small>折り鶴 x30</small></button>
          {tutorialDone && <button type="button" className="ito-btn" onClick={onTutorial}>Tutorial</button>}
          <button type="button" className="ito-btn" onClick={onSettings}>Settings</button>
          <button type="button" className="ito-btn ito-btn--quiet" onClick={onExit}>Back to arcade</button>
        </nav>
      </div>
      <p className="ito-title__fine">Fictional district inspired by west Shinjuku. Shop names are invented.</p>
    </div>
  );
}

function RunSelect({ best, onRun, onBack, onTutorial }) {
  return (
    <div className="ito__center ito__scrim">
      <div className="ito-panel ito-panel--runs" role="dialog" aria-label="Choose a delivery">
        <h2>配達 <small>DELIVERIES</small></h2>
        <p className="ito-runs__intro">{STORY.intro}</p>
        <div className="ito-runs">
          {RUNS.map((r, n) => {
            const m = medalOf(n, best[n]);
            return (
              <button type="button" key={n} className="ito-run" onClick={() => onRun(n)} autoFocus={n === 0}>
                <span className="ito-run__no">0{n + 1}</span>
                <span className="ito-run__jp">{r.jp}</span>
                <span className="ito-run__name">{r.name}</span>
                <span className="ito-run__line">{r.line}</span>
                <span className="ito-run__best">{best[n] != null ? fmt(best[n]) : 'not run yet'}{m && <i className={`ito-medal ito-medal--${m}`}>{MEDAL_JP[m]}</i>}</span>
                <span className="ito-run__targets">金 {fmt(MEDALS[n].gold)} · 銀 {fmt(MEDALS[n].silver)} · 銅 {fmt(MEDALS[n].bronze)}</span>
              </button>
            );
          })}
        </div>
        <div className="ito-row"><button type="button" className="ito-btn ito-btn--quiet" onClick={onBack}>Back</button><button type="button" className="ito-btn ito-btn--quiet" onClick={onTutorial}>Tutorial</button></div>
      </div>
    </div>
  );
}

function Hud({ register, mode, touch, total }) {
  const r = { speed: useRef(null), time: useRef(null), ring: useRef(null), mark: useRef(null), markD: useRef(null), dash: useRef(null), chain: useRef(null), cranes: useRef(null), hint: useRef(null), noline: useRef(null) };
  const [hint, setHint] = useState(true);
  useEffect(() => { const t = setTimeout(() => setHint(false), 9000); return () => clearTimeout(t); }, [mode]);
  useEffect(() => {
    register((d) => {
      if (r.speed.current) r.speed.current.textContent = String(Math.round(d.speed * 3.6));
      if (r.time.current) r.time.current.textContent = d.t != null ? fmt(d.t) : '';
      if (r.ring.current && d.rings) r.ring.current.textContent = `${d.ring} / ${d.rings}`;
      if (r.dash.current) { const k = r.dash.current.children; for (let i = 0; i < k.length; i++) k[i].style.setProperty('--f', String(Math.max(0, Math.min(1, d.dash - i)))); }
      if (r.chain.current) { r.chain.current.textContent = d.chain >= 2 ? `x${d.chain}` : ''; r.chain.current.parentElement.dataset.on = d.chain >= 2 ? '1' : '0'; }
      if (r.cranes.current) r.cranes.current.textContent = `${d.cranes} / ${d.totalCranes}`;
      if (r.noline.current) r.noline.current.dataset.on = d.noLine ? '1' : '0';
      const m = r.mark.current;
      if (m) {
        if (d.dist == null) { m.style.display = 'none'; }
        else {
          m.style.display = '';
          // screen position in px; off-screen targets ride the edge of a safe box that keeps clear of the HUD panels,
          // the hint bar and (on touch) the stick and buttons, with the label always inside the screen
          const host = m.parentElement, W = host.clientWidth, H = host.clientHeight;
          const L = 46, R = W - 46, T = touch && W < 560 ? 162 : 128, B = H - (touch ? 250 : 64);
          let X = (d.sx * 0.5 + 0.5) * W, Y = (-d.sy * 0.5 + 0.5) * H;
          if (d.on) Y -= Math.min(0.3 * H, (d.rr || 0) * 0.5 * H) + 22; // the distance tag sits just above a visible ring (the courier is usually below it)
          if (!d.on || X < L || X > R || Y < T || Y > B) {
            const cx = W / 2, cy = (T + B) / 2;
            let ux = X - cx, uy = Y - cy;
            if (!d.on) { ux = Math.cos(d.ang); uy = -Math.sin(d.ang); }
            const kx = ux > 0 ? (R - cx) / ux : ux < 0 ? (L - cx) / ux : 1e9, ky = uy > 0 ? (B - cy) / uy : uy < 0 ? (T - cy) / uy : 1e9;
            const k = Math.min(kx, ky);
            if (!d.on || k < 1) { X = cx + ux * k; Y = cy + uy * k; }
          }
          m.style.transform = `translate(${X.toFixed(1)}px, ${Y.toFixed(1)}px)`;
          m.dataset.off = d.on ? '0' : '1';
          m.dataset.side = X > W / 2 ? 'l' : 'r';
          m.style.setProperty('--a', `${-d.ang}rad`);
          r.markD.current.textContent = `${Math.round(d.dist)} m`;
        }
      }
    });
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const run = mode && mode.kind === 'run';
  const free = mode && mode.kind === 'free';
  return (
    <div className="ito-hud" aria-hidden="true">
      {run && (
        <div className="ito-hud__tl">
          <div className="ito-hud__run">{RUNS[mode.n].jp} <span>{RUNS[mode.n].name}</span></div>
          <div className="ito-hud__time" ref={r.time}>00:00.00</div>
          <div className="ito-hud__rings">RINGS <b ref={r.ring}>0 / {total}</b></div>
        </div>
      )}
      {free && (
        <div className="ito-hud__tl">
          <div className="ito-hud__run">自由 <span>FREE ROAM</span></div>
          <div className="ito-hud__cranes">折り鶴 <b ref={r.cranes} /></div>
        </div>
      )}
      <div className="ito-hud__tr">
        <div className="ito-hud__speed"><b ref={r.speed}>0</b><span>km/h</span></div>
        <div className="ito-hud__dash" ref={r.dash} title="Dash"><i /><i /><i /></div>
      </div>
      <div className="ito-hud__chain" data-on="0"><b ref={r.chain} /><span>CHAIN</span></div>
      {run && <div className="ito-hud__mark" ref={r.mark}><i /><span ref={r.markD} /></div>}
      <div className="ito-hud__noline" ref={r.noline} data-on="0"><i />NO LINE IN REACH</div>
      {hint && !touch && <div className="ito-hud__hint" ref={r.hint}><kbd>WASD</kbd> steer · <kbd>Space</kbd>/<kbd>Click</kbd> hold to swing · <kbd>Shift</kbd> dash · <kbd>E</kbd> zip · <kbd>C</kbd> dive · <kbd>R</kbd> restart</div>}
    </div>
  );
}

const TUT = [
  { jp: 'スイング', verb: 'HOLD TO SWING', key: ['Space', 'or hold click'], touch: 'Hold SWING' },
  { jp: 'はなす', verb: 'LET GO ON THE WAY UP', key: ['let go of Space'], touch: 'Lift your thumb' },
  { jp: 'ダッシュ', verb: 'DASH', key: ['Shift'], touch: 'Tap DASH' },
  { jp: 'ジップ', verb: 'ZIP TO THE ◆', key: ['E'], touch: 'Tap ZIP' },
];
function Tutorial({ step, touch, onSkip }) {
  const s = TUT[Math.min(step, 3)];
  const done = step >= 4;
  return (
    <div className="ito-tut" role="status" aria-live="polite">
      <div className={`ito-tut__card ${done ? 'is-done' : ''}`} key={step}>
        {done ? (<><b className="ito-tut__jp">完了</b><span className="ito-tut__verb">YOU'RE A COURIER</span></>) : (
          <>
            <b className="ito-tut__jp">{s.jp}</b>
            <span className="ito-tut__verb">{s.verb}</span>
            <span className="ito-tut__keys">{touch ? <kbd>{s.touch}</kbd> : s.key.map((k) => <kbd key={k}>{k}</kbd>)}</span>
          </>
        )}
        <span className="ito-tut__pips">{TUT.map((_, i) => <i key={i} data-on={i < step ? '1' : '0'} />)}</span>
      </div>
      {!done && <button type="button" className="ito-btn ito-btn--quiet ito-tut__skip" onClick={onSkip}>Skip</button>}
    </div>
  );
}

function Settings({ settings, onChange, onClose }) {
  const Tog = ({ k, label }) => (
    <label className="ito-set__row"><span>{label}</span><button type="button" role="switch" aria-checked={!!settings[k]} className="ito-switch" onClick={() => onChange({ [k]: !settings[k] })}><i /></button></label>
  );
  return (
    <div className="ito__center ito__scrim">
      <div className="ito-panel ito-panel--settings" role="dialog" aria-label="Settings">
        <h2>設定 <small>SETTINGS</small></h2>
        <div className="ito-set__row"><span>Quality</span>
          <div className="ito-seg">{['auto', 'low', 'balanced', 'high'].map((q) => <button type="button" key={q} aria-pressed={settings.quality === q} onClick={() => onChange({ quality: q })}>{q}</button>)}</div>
        </div>
        <label className="ito-set__row"><span>Look sensitivity</span><input type="range" min="0.3" max="2.5" step="0.1" value={settings.sens} onChange={(e) => onChange({ sens: +e.target.value })} /></label>
        <Tog k="invertY" label="Invert look Y" />
        <Tog k="assist" label="Camera assist" />
        <Tog k="sound" label="Sound" />
        <Tog k="music" label="Music" />
        <button type="button" className="ito-btn ito-btn--go" autoFocus onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function Results({ r, onNext, onRetry, onMenu }) {
  const m = r.medal;
  return (
    <div className="ito__center ito__scrim">
      <div className="ito-panel ito-panel--results" role="dialog" aria-label="Delivery complete">
        <h2>配達完了 <small>DELIVERED · {RUNS[r.n].name}</small></h2>
        <div className="ito-res__time">{fmt(r.t)}</div>
        <div className="ito-res__medal">{m ? <i className={`ito-medal ito-medal--${m} ito-medal--big`}>{MEDAL_JP[m]}</i> : <i className="ito-medal ito-medal--none">—</i>}<span>{m ? `${m.toUpperCase()}` : `Bronze is ${fmt(MEDALS[r.n].bronze)}`}</span>{r.isBest && <em>NEW BEST</em>}</div>
        <blockquote className="ito-res__radio"><b>{STORY.who}</b>{STORY.runs[r.n].end} {STORY.medal[m || 'none']}</blockquote>
        <dl className="ito-res__stats">
          <div><dt>Top speed</dt><dd>{Math.round(r.top * 3.6)} km/h</dd></div>
          <div><dt>Longest air chain</dt><dd>x{r.chain}</dd></div>
          <div><dt>Best</dt><dd>{fmt(r.isBest ? r.t : r.prev)}</dd></div>
        </dl>
        <div className="ito-row">
          <button type="button" className="ito-btn ito-btn--go" autoFocus onClick={onNext}>Next run</button>
          <button type="button" className="ito-btn" onClick={onRetry}>Retry <kbd>R</kbd></button>
          <button type="button" className="ito-btn ito-btn--quiet" onClick={onMenu}>Deliveries</button>
        </div>
      </div>
    </div>
  );
}

function TouchControls({ engine, onPause }) {
  const stick = useRef(null), knob = useRef(null);
  const st = useRef({ id: null, x: 0, y: 0, lookId: null, lx: 0, ly: 0 });
  const E = () => engine.current;
  const onStickDown = (e) => {
    const s = st.current; if (s.id !== null) return;
    s.id = e.pointerId; s.x = e.clientX; s.y = e.clientY;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    if (knob.current) { knob.current.style.left = `${e.clientX - stick.current.getBoundingClientRect().left}px`; knob.current.style.top = `${e.clientY - stick.current.getBoundingClientRect().top}px`; knob.current.dataset.on = '1'; }
  };
  const onStickMove = (e) => {
    const s = st.current; if (e.pointerId !== s.id) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y, R = 52;
    const l = Math.hypot(dx, dy), k = l > R ? R / l : 1;
    E()?.touch.stick((dx * k) / R, (-dy * k) / R);
    if (knob.current) knob.current.style.setProperty('--kx', `${dx * k}px`), knob.current.style.setProperty('--ky', `${dy * k}px`);
  };
  const onStickUp = (e) => { const s = st.current; if (e.pointerId !== s.id) return; s.id = null; E()?.touch.stick(0, 0); if (knob.current) { knob.current.dataset.on = '0'; knob.current.style.setProperty('--kx', '0px'); knob.current.style.setProperty('--ky', '0px'); } };
  const onLookDown = (e) => { const s = st.current; if (s.lookId !== null) return; s.lookId = e.pointerId; s.lx = e.clientX; s.ly = e.clientY; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } };
  const onLookMove = (e) => { const s = st.current; if (e.pointerId !== s.lookId) return; E()?.touch.look(e.clientX - s.lx, e.clientY - s.ly); s.lx = e.clientX; s.ly = e.clientY; };
  const onLookUp = (e) => { const s = st.current; if (e.pointerId === s.lookId) s.lookId = null; };
  const btn = (name) => ({
    onPointerDown: (e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } e.currentTarget.dataset.on = '1'; E()?.touch.button(name, true); },
    onPointerUp: (e) => { e.currentTarget.dataset.on = '0'; E()?.touch.button(name, false); },
    onPointerCancel: (e) => { e.currentTarget.dataset.on = '0'; E()?.touch.button(name, false); },
    onContextMenu: (e) => e.preventDefault(),
  });
  return (
    <div className="ito-touch">
      <div className="ito-touch__look" onPointerDown={onLookDown} onPointerMove={onLookMove} onPointerUp={onLookUp} onPointerCancel={onLookUp} />
      <div className="ito-touch__stick" ref={stick} onPointerDown={onStickDown} onPointerMove={onStickMove} onPointerUp={onStickUp} onPointerCancel={onStickUp}>
        <i className="ito-touch__knob" ref={knob} data-on="0" />
      </div>
      <button type="button" className="ito-tbtn ito-tbtn--swing" aria-label="Swing" {...btn('swing')}>SWING<small>スイング</small></button>
      <button type="button" className="ito-tbtn ito-tbtn--dash" aria-label="Dash" {...btn('dash')}>DASH</button>
      <button type="button" className="ito-tbtn ito-tbtn--zip" aria-label="Zip" {...btn('zip')}>ZIP</button>
      <button type="button" className="ito-tbtn ito-tbtn--dive" aria-label="Dive" {...btn('dive')}>DIVE</button>
      <button type="button" className="ito-pausebtn" onClick={onPause} aria-label="Pause">II</button>
    </div>
  );
}
