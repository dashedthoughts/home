import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas.jsx';
import { projects, rankFor } from '../data/content.js';
import { CARS, LIVERIES, GLOWS, TIMES, WEATHER, DIFFICULTY, QUALITY, resolveQuality } from '../game/config.js';
import { addDecrypted, getRaceConfig, setRaceConfig, getBestBy, setBestBy } from '../lib/store.js';
import { STORY, SPEAKERS, fileLine } from '../game/story.js';

const CAMS = { chase: 'CHASE', far: 'WIDE', bumper: 'BUMPER' };

const KEYS = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'boost', KeyW: 'boost', Space: 'boost', ShiftLeft: 'boost',
  ArrowDown: 'brake', KeyS: 'brake',
  KeyX: 'strike', KeyF: 'strike',
  KeyE: 'wheelie',
};
const STAT_MAX = { top: 1.1, accel: 1.3, grip: 1.3, cool: 1.35 };
const pad2 = (n) => String(n).padStart(2, '0');

// radio: the built-in synth, two picks, or any YouTube video / playlist link
// YouTube Mixes (list=RD + video id): an endless radio seeded by the track
const STATIONS = { nightcall: { v: 'MV_3Dpw-BRY', list: 'RDMV_3Dpw-BRY', name: 'Nightcall Mix' }, dracula: { v: 'xnP7qKxwzjg', list: 'RDxnP7qKxwzjg', name: 'Dracula Mix' } };
const parseYT = (s) => {
  const list = String(s).match(/[?&]list=([\w-]+)/);
  const v = String(s).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(s).match(/^([\w-]{11})$/);
  return list ? { list: list[1], v: v ? v[1] : undefined } : v ? { v: v[1] } : null; // a Mix needs its seed video to embed
};
const ytSrc = (r) => (r.list
  ? `https://www.youtube-nocookie.com/embed/${r.v ? `${r.v}?list=${r.list}&` : `videoseries?list=${r.list}&`}autoplay=1&rel=0`
  : `https://www.youtube-nocookie.com/embed/${r.v}?autoplay=1&loop=1&playlist=${r.v}&rel=0`);
function radioOf(cfg) {
  if (cfg.radio === 'synth') return null;
  if (!cfg.radio) return { ...STATIONS.dracula };
  if (STATIONS[cfg.radio]) return { ...STATIONS[cfg.radio] };
  return cfg.radioLink ? { ...parseYT(cfg.radioLink), name: 'Your pick' } : null;
}

function Seg({ label, value, options, onChange }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      <span className="seg__label">{label}</span>
      <div className="seg__opts">
        {options.map(([v, text]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__ui" aria-hidden="true" />
      <span className="toggle__text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function StatBar({ k, v }) {
  return (
    <div className="statbar">
      <span>{k}</span>
      <i>
        <b style={{ width: `${Math.round((v / STAT_MAX[k.toLowerCase()] || v) * 100)}%` }} />
      </i>
    </div>
  );
}

export default function Play() {
  const game = useRef(null);
  const [phase, setPhase] = useState('title'); // title | run | paused | over
  const [tab, setTab] = useState('run');
  const [cfg, setCfg] = useState(getRaceConfig);
  const [hud, setHud] = useState({ score: 0, kmh: 0, heat: 0, lives: 3, maxLives: 3, files: 0, chain: 0, mult: 1, draft: 0, count: 0 });
  const [pops, setPops] = useState([]);
  const [runFiles, setRunFiles] = useState([]);
  const [final, setFinal] = useState(null);
  const [radioOn, setRadioOn] = useState(false); // starts on the first JACK IN (a user gesture) and keeps playing
  const [best, setBestState] = useState(() => getBestBy(getRaceConfig().difficulty));
  const [newBest, setNewBest] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const runId = useRef(0);         // bumps on every start / garage: a results timer from an older run does nothing
  const told = useRef({});         // story lines already used this run (nothing repeats)
  const ending = useRef(false);    // the finale is rolling: no more story plates
  const pauseBtn = useRef(null), overBtn = useRef(null), panelRef = useRef(null), slotRef = useRef(null);
  const [slot, setSlot] = useState(null); // where the radio player sits on the title and pause screens
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const hudRef = useRef(hud);
  hudRef.current = hud;
  const eng = () => game.current?.engine;

  // ---------- config ----------
  const update = useCallback((patch) => {
    setCfg((c) => {
      const next = { ...c, ...patch };
      setRaceConfig(next);
      eng()?.configure(next);
      return next;
    });
    eng()?.uiSound('ui');
  }, []);
  // Outrun mood drives at sunset unless a time was picked by hand
  useEffect(() => {
    if (document.documentElement.dataset.mood === 'outrun' && cfgRef.current.time === 'tokyo') update({ time: 'outrun' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => setBestState(getBestBy(cfg.difficulty)), [cfg.difficulty]);

  // ---------- call-outs: ONE plate at a time ----------
  // prio 0  a passing note (near miss, chain lost): dropped if anything else is up
  // prio 1  story (DISPATCH / KUROGANE, lines in game/story.js): waits for a free moment, is never shown while a bend
  //         warning is up, and is dropped once the moment has passed
  // prio 2  must-see (impact, file, police, the ending): shown at once, replaces whatever is up
  const popNow = useRef(null), storyQ = useRef([]), storyFree = useRef(0), popSeq = useRef(0), bendRef = useRef(0);
  const showPop = useCallback((item) => {
    const id = ++popSeq.current, now = performance.now();
    popNow.current = { id, prio: item.prio, at: now, until: now + item.ms, item };
    if (item.prio === 1) storyFree.current = now + item.ms + 1200; // a breath between story plates
    setPops([{ id, ...item }]);
    setTimeout(() => { setPops((q) => q.filter((x) => x.id !== id)); if (popNow.current && popNow.current.id === id) popNow.current = null; }, item.ms);
  }, []);
  const pop = useCallback((text, tone = 'data', sub = '', o = {}) => {
    if (!text) return;
    const item = { text, tone, sub, who: o.who || '', prio: o.prio ?? 0, ms: o.ms ?? (o.who ? 2900 : 1300) };
    const now = performance.now(), cur = popNow.current && popNow.current.until > now ? popNow.current : null;
    if (item.prio === 1) {
      if (cur || bendRef.current || now < storyFree.current) { if (storyQ.current.length < 3) storyQ.current.push({ item, expires: now + (o.wait ?? 10000) }); return; }
    } else if (cur && item.prio < cur.prio) return;
    else if (cur && cur.prio === 1 && now - cur.at < 1400 && storyQ.current.length < 3) storyQ.current.unshift({ item: cur.item, expires: now + 7000 }); // cut short: it gets another go
    showPop(item);
  }, [showPop]);
  const clearPops = useCallback(() => { storyQ.current = []; popNow.current = null; setPops([]); }, []);
  // every HUD tick: remember the bend sign, and show a waiting story plate if the moment is free
  const onTick = useCallback((h) => {
    bendRef.current = h.bend || 0;
    setHud(h);
    const q = storyQ.current;
    if (!q.length) return;
    const now = performance.now();
    while (q.length && q[0].expires < now) q.shift();
    if (!q.length || bendRef.current || now < storyFree.current || (popNow.current && popNow.current.until + 250 > now)) return;
    showPop(q.shift().item);
  }, [showPop]);
  // the next unused line for a key of STORY (a string is used once; a list is used in order, then goes quiet)
  const line = (key, sub) => {
    const v = sub ? STORY[key] && STORY[key][sub] : STORY[key], k = sub ? `${key}.${sub}` : key;
    if (!v) return '';
    const i = told.current[k] || 0;
    if (typeof v === 'string') { if (i) return ''; told.current[k] = 1; return v; }
    if (i >= v.length) return '';
    told.current[k] = i + 1;
    return v[i];
  };
  const dispatch = (text, sub = '', o = {}) => pop(text, o.tone || 'signal', sub, { who: SPEAKERS.dispatch, prio: 1, ...o });
  const rival = (text, sub = '', o = {}) => pop(text, 'rival', sub, { who: SPEAKERS.rival, prio: 1, ...o });

  // the run is over (crashed out, busted out, or parked at the lookout): record it and open the results.
  // Runs whatever the phase is, so a pause on a slow frame can never swallow the ending.
  const finish = useCallback((e) => {
    const d = cfgRef.current.difficulty, prev = getBestBy(d), id = runId.current;
    setNewBest(e.score > prev);
    if (e.score > prev) setBestBy(d, e.score);
    setBestState(Math.max(prev, e.score));
    setFinal(e.type === 'complete' ? { ...e, complete: true } : e);
    setTimeout(() => {
      if (runId.current !== id) return; // restarted or back in the garage meanwhile
      clearPops();
      phaseRef.current = 'over';
      setPhase('over');
    }, e.type === 'complete' ? 5200 : 1900);
  }, [clearPops]);

  const onEvent = useCallback(
    (e) => {
      if (e.type === 'quality-auto') { pop('GRAPHICS → LOW', 'data', 'AUTO KEPT THE FRAME RATE UP'); return; }
      if (e.type === 'context-lost') {
        setPhase('title');
        setTab('run');
        pop('GRAPHICS RESET', 'data', 'THE CITY IS REBUILDING. JACK IN AGAIN.');
        return;
      }
      if (e.type === 'pad-start') {
        if (phaseRef.current === 'title' || phaseRef.current === 'over') start();
        else togglePause();
        return;
      }
      if (e.type === 'over' || e.type === 'complete') {
        if (e.type === 'over') { ending.current = true; storyQ.current = []; pop(e.busted ? STORY.bustedOut : STORY.outOfIntegrity, 'alert', e.busted ? 'BUSTED · OUT OF INTEGRITY' : 'OUT OF INTEGRITY', { who: SPEAKERS.dispatch, prio: 2, ms: 1850 }); }
        finish(e);
        return;
      }
      if (phaseRef.current !== 'run') return;
      const zc = cfgRef.current, noDamage = !!zc.zen || zc.race === false;
      switch (e.type) {
        case 'go': pop('GO', 'signal', '', { prio: 2, ms: 900 }); dispatch(line('start')); break;
        case 'launched': rival(line('rivalLaunch')); break;
        case 'nearmiss': pop(e.chain > 1 ? `CLOSE CALL ×${e.chain}` : 'NEAR MISS', e.chain > 2 ? 'signal' : 'data', `+${e.pts.toLocaleString('en-IN')}`); break;
        case 'slipstream': pop('SLIPSTREAM', 'data', 'BOOST · HEAT VENTED'); break;
        case 'chain-break': pop('CHAIN LOST', 'dim'); break;
        case 'glitch': pop('SIGNAL GLITCH', 'alert', 'STEERING INVERTED', { prio: 2 }); break;
        case 'glitch-end': pop('SIGNAL RESTORED', 'data'); break;
        case 'hit': {
          const what = e.swipe ? 'SIDE SWIPE' : e.sev > 0.7 ? 'HEAVY IMPACT' : 'IMPACT';
          if (e.lives <= 0 && !noDamage) break; // the last one: the ending plate follows
          const said = noDamage ? '' : line('hit');
          if (said) pop(said, 'alert', `${what} · INTEGRITY ${Math.max(0, e.lives)} OF ${hudRef.current.maxLives || e.lives}`, { who: SPEAKERS.dispatch, prio: 2, ms: 2400 });
          else pop(what, 'alert', noDamage ? 'NO DAMAGE · SPEED LOST' : `INTEGRITY ${Math.max(0, e.lives)}`, { prio: 2 });
          break;
        }
        case 'slam': pop('RAIL SLAM', 'alert', 'SPEED LOST', { prio: 2 }); break;
        case 'bump': pop('TRADING PAINT', 'data', 'SWITCH LANES TO PASS'); break;
        case 'blocked': pop('KUROGANE BLOCKS', 'alert', 'FAKE HIM OUT'); break;
        case 'parried': pop('PARRIED', 'dim', 'HE SAW IT COMING'); break;
        case 'sprint': { const said = line('rivalSprint'); if (said) rival(said, '2 FILES LEFT · BE IN FRONT AT THE LAST ONE', { prio: 2 }); else pop('FINAL STRETCH', 'signal', '2 FILES LEFT · BE IN FRONT AT THE LAST ONE', { prio: 2 }); break; }
        // the junction: the lane you held under the sign picked the next stretch (a must-see), then DISPATCH in the tunnel
        case 'junction':
          pop(e.route === 'backstreets' ? 'BACKSTREETS' : 'EXPRESSWAY', e.route === 'backstreets' ? 'route' : 'routex', e.route === 'backstreets' ? 'SHARDS ×1.5 · TIGHTER STREETS · SLOWER TRAFFIC' : 'OPEN ROAD · FAST TRAFFIC', { prio: 2 });
          break;
        case 'junction-ahead': if (!ending.current) dispatch(line('junctionAhead'), `SECTOR ${pad2(e.sector)} · JUNCTION ${e.dist} M · RIGHT LANE BACKSTREETS`, { wait: 6000 }); break;
        case 'tunnel': if (!ending.current) { const said = e.n === 1 ? line('tunnel') : line('routes', e.route); if (said) dispatch(said, `SECTOR ${pad2(e.sector)} · ${e.route === 'backstreets' ? 'BACKSTREETS' : 'EXPRESSWAY'}`, { wait: 6000 }); } break;
        case 'finale': {
          ending.current = true; storyQ.current = [];
          const end = e.free ? STORY.finaleFree : e.won === false ? STORY.finaleLost : STORY.finaleWon;
          pop(end.line, e.won === false ? 'alert' : 'ok', `${e.free ? 'ALL TEN FILES' : e.won === false ? 'KUROGANE WINS' : 'YOU WIN'} · LAST EXIT: THE LOOKOUT`, { who: SPEAKERS.dispatch, prio: 2, ms: 4600 });
          break;
        }
        case 'strike': pop('LASHED', 'ok', e.cop ? 'CRUISER DROPS BACK' : 'KUROGANE SPINS WIDE'); break;
        case 'struck': { const said = line('rivalLean'), sub = cfgRef.current.rash ? 'HE SWINGS · SPEED LOST' : 'HE LEANS ON YOU · SPEED LOST'; if (said) rival(said, sub, { prio: 2, ms: 2200 }); else pop('HIT', 'alert', sub.replace('HE ', 'KUROGANE ')); break; }
        case 'power': pop(e.kind === 'ghost' ? 'GHOST' : 'NITRO', e.kind === 'ghost' ? 'data' : 'signal', e.kind === 'ghost' ? '5 SECONDS · RIDE THROUGH ANYTHING' : 'INSTANT SLIPSTREAM · ENGINE COOLED', { prio: 2 }); break;
        case 'wheelie': pop('WHEELIE', 'signal', '+150'); break;
        case 'police': { const said = line('police'), sub = `POLICE · WANTED ${'★'.repeat(e.stars)} · OUTRUN THEM`; if (said) pop(said, 'alert', sub, { who: SPEAKERS.dispatch, prio: 2 }); else pop('POLICE', 'alert', sub.slice(9), { prio: 2 }); break; }
        case 'busted': {
          if (e.lives <= 0) break; // the ending plate follows
          const said = line('busted'), sub = `${e.lost ? `−${e.lost} SHARD · ` : ''}INTEGRITY −1 · ${e.lives} LEFT`;
          if (said) pop(said, 'alert', `BUSTED · ${sub}`, { who: SPEAKERS.dispatch, prio: 2 }); else pop('BUSTED', 'alert', sub, { prio: 2 });
          break;
        }
        case 'escaped': pop(e.outlasted ? 'THEY GAVE UP' : 'LOST THEM', 'ok', `+${e.pts.toLocaleString('en-IN')}`, { prio: 2 }); break;
        case 'overtake': { const said = line('rivalPassed'); if (said) rival(said, 'OVERTAKE · P1', { prio: 2, ms: 2200 }); else pop('OVERTAKE', 'ok', 'P1 · HOLD IT TO THE LOOKOUT'); break; }
        case 'overtaken': { const said = line(told.current.rivalLaunch ? 'rivalPasses' : 'rivalLaunch'); if (said) rival(said, 'P2 · TAKE IT BACK', { prio: 2, ms: 2200 }); else pop('KUROGANE PASSES', 'alert', 'P2 · TAKE IT BACK'); break; }
        case 'casefile': {
          const p = projects[(e.n - 1) % projects.length];
          addDecrypted(p.slug);
          setRunFiles((f) => (f.some((x) => x.slug === p.slug) ? f : [...f, p]));
          // the file is one of the portfolio's projects: name it
          pop(p.title, 'ok', `${fileLine(e.n, projects.length)}${e.repaired ? ' · INTEGRITY +1' : ''}`, { who: `FILE ${pad2(e.n)}`, prio: 2, ms: 3000 });
          break;
        }
        default:
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pop, finish],
  );

  // ---------- flow ----------
  const start = useCallback(() => {
    setRadioOn(true);
    const g = eng();
    if (!g) return;
    runId.current += 1;
    told.current = {};
    ending.current = false;
    storyFree.current = 0;
    setRunFiles([]);
    setFinal(null);
    clearPops();
    g.configure(cfgRef.current);
    g.setView('chase');
    g.setMode('play');
    g.restart();
    phaseRef.current = 'run'; // at once, not on the next render: an event in between must see the right phase
    setPhase('run');
  }, [clearPops]);

  const toGarage = useCallback(() => {
    const g = eng();
    if (!g) return;
    runId.current += 1;
    clearPops();
    g.setMode('attract');
    g.restart();
    g.setView('showroom');
    g.resume();
    phaseRef.current = 'title';
    setPhase('title');
    setTab('garage');
  }, [clearPops]);

  const togglePause = useCallback(() => {
    const g = eng();
    if (!g) return;
    if (phaseRef.current === 'run') { g.pause(); phaseRef.current = 'paused'; setPhase('paused'); }
    else if (phaseRef.current === 'paused') { g.resume(); phaseRef.current = 'run'; setPhase('run'); }
  }, []);

  // modes: ZEN turns steering assist on (unless it was switched by hand), and gives it back when you leave
  const setMode = useCallback((v) => {
    const c = cfgRef.current;
    const patch = { race: v !== 'free', rash: v === 'rash', zen: v === 'zen' };
    if (v === 'zen' && !c.zen && !c.assist) { patch.assist = true; patch.assistAuto = true; }
    if (v !== 'zen' && c.zen && c.assistAuto) { patch.assist = false; patch.assistAuto = false; }
    update(patch);
  }, [update]);
  const modeOf = (c) => (c.zen ? 'zen' : c.race === false ? 'free' : c.rash && c.car === 'bike' ? 'rash' : 'race');

  // panels open at their top with the main button focused (no scroll jump on short screens)
  useEffect(() => {
    if (phase !== 'paused' && phase !== 'over') return;
    const btn = phase === 'paused' ? pauseBtn.current : overBtn.current;
    btn?.focus({ preventScroll: true });
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [phase, final]);

  // ---------- keyboard ----------
  useEffect(() => {
    const down = (e) => {
      const g = eng();
      if (!g) return;
      const ph = phaseRef.current;
      if (e.code === 'Enter' && (ph === 'title' || ph === 'over') && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        start();
        return;
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && (ph === 'run' || ph === 'paused')) { e.preventDefault(); togglePause(); return; }
      if (e.code === 'KeyC' && ph === 'run') { e.preventDefault(); g.cycleCam(); return; }
      const k = KEYS[e.code];
      if (k && ph === 'run') { e.preventDefault(); g.input[k] = true; }
    };
    const up = (e) => {
      const k = KEYS[e.code];
      if (k && k !== 'strike' && k !== 'wheelie' && eng()) eng().input[k] = false; // X and E are one-shot presses: the game clears them
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [start, togglePause]);

  useEffect(() => {
    const onVis = () => document.hidden && phaseRef.current === 'run' && togglePause();
    const onBlur = () => phaseRef.current === 'run' && togglePause();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', onBlur); };
  }, [togglePause]);

  const hold = (k) => ({
    onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); if (eng()) eng().input[k] = true; },
    onPointerUp: () => { if (eng()) eng().input[k] = false; },
    onPointerCancel: () => { if (eng()) eng().input[k] = false; },
    onContextMenu: (e) => e.preventDefault(),
  });

  // the radio player lives in one persistent element (re-parenting an iframe would restart the music). On the title and
  // pause screens it sits over a slot in the panel; in a race it is a one-line chip and the player is parked off screen.
  const station = radioOn ? radioOf(cfg) : null;
  const playing = !!(station && (station.v || station.list));
  useEffect(() => {
    if (!playing || (phase !== 'title' && phase !== 'paused')) { setSlot(null); return undefined; }
    let raf = 0, last = null;
    const tick = (again) => {
      if (again !== false) raf = requestAnimationFrame(tick);
      const el = slotRef.current;
      let key = '', next = null;
      if (el) {
        const r = el.getBoundingClientRect(), host = el.closest('.garage__body, .panel')?.getBoundingClientRect();
        if (r.width > 40 && (!host || (r.top >= host.top - 2 && r.bottom <= host.bottom + 2))) { next = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; key = `${next.x},${next.y},${next.w}`; }
      }
      if (key !== last) { last = key; setSlot(next); }
    };
    tick(false); // once right away, so the player is in place on the first frame of the panel
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, playing]);

  const car = CARS[cfg.car];
  const noDamage = !!cfg.zen || cfg.race === false;
  const counting = phase === 'run' && hud.count > 0;
  const status = hud.glitch ? ['GLITCH', 'alert'] : hud.aqua ? ['AQUAPLANING', 'alert'] : hud.slip ? ['SLIPSTREAM', 'data'] : hud.overclock ? ['OVERCLOCK', 'signal'] : hud.heat > 70 ? ['RUNNING HOT', 'signal'] : hud.tunnel ? ['TUNNEL · DRY ROAD', 'dim'] : hud.wet ? ['WET ROAD', 'data'] : ['CRUISE', 'dim'];

  return (
    <main className={`play play--${phase} ${phase === 'run' && hud.bend ? 'play--bend' : ''}`}>
      <GameCanvas
        ref={game}
        mode="attract"
        view="showroom"
        config={cfg}
        autoPause={false}
        onTick={onTick}
        onEvent={onEvent}
        className="play__canvas"
        label="REDLINE: a neon night highway seen from behind a courier car"
      />
      <div className="play__fx" aria-hidden="true" />

      {/* ------------------------------------------------ HUD */}
      {(phase === 'run' || phase === 'paused') && !counting && !hud.finale && (
        <div className="hud2" aria-hidden="true">
          <div className="hud2__score">
            <span className="hud-k">SCORE</span>
            <b>{hud.score.toLocaleString('en-IN')}</b>
            <span className={`mult ${hud.mult > 1 ? 'on' : ''}`}>×{hud.mult * (hud.overclock ? 2 : 1)}</span>
            <span className="chain">
              {Array.from({ length: 6 }, (_, i) => (
                <i key={i} className={i < hud.chain % 6 || (hud.chain > 0 && hud.chain % 6 === 0) ? 'on' : ''} />
              ))}
            </span>
          </div>
          <div className="hud2__right">
            <div>
              <span className="hud-k">CASE FILES</span>
              <b>
                {pad2(hud.files)}
                <small>/{projects.length}</small>
              </b>
              <span className="shardmeter" title="Five shards open the next file">
                {Array.from({ length: 5 }, (_, i) => <i key={i} className={i < hud.shards % 5 ? 'on' : ''} />)}
              </span>
            </div>
            {!noDamage && (
              <div>
                <span className="hud-k">INTEGRITY</span>
                <span className={`pips ${hud.maxLives > 5 ? 'many' : ''}`}>
                  {Array.from({ length: hud.maxLives }, (_, i) => (
                    <i key={i} className={i < hud.lives ? 'on' : ''} />
                  ))}
                </span>
              </div>
            )}
            <button type="button" className="hud2__cam" onClick={() => eng()?.cycleCam()} aria-label="Change camera">{CAMS[hud.cam] || 'CHASE'}</button>
            <button type="button" className="hud2__pause" onClick={togglePause} aria-label="Pause">❚❚</button>
          </div>
          {hud.swarm && <div className="siren-full" aria-hidden="true" />}
          {hud.copGap != null && (
            <>
              <div className={`siren ${hud.copGap <= 20 ? 'near' : ''}`} />
              <div className="hud2__cop"><b>{'★'.repeat(hud.wanted)}<i>{'★'.repeat(Math.max(0, 3 - hud.wanted))}</i></b><span>{hud.cops > 1 ? `${hud.cops} CRUISERS` : 'POLICE'} {hud.copGap > 0 ? `${hud.copGap} M BEHIND` : 'ON YOU'}</span>{hud.bust > 0.05 && <em className="bustbar"><i style={{ width: `${Math.round(hud.bust * 100)}%` }} />BUSTING</em>}</div>
            </>
          )}
          {hud.copGap == null && hud.heatOnYou > 0.2 && !hud.zen && (
            <div className="hud2__cop hud2__cop--build"><span>POLICE ATTENTION</span><em className="bustbar"><i style={{ width: `${Math.round(hud.heatOnYou * 100)}%` }} />{hud.heatOnYou > 0.75 ? 'EASE OFF' : 'BUILDING'}</em></div>
          )}
          {hud.beside && <div className="strike-ready">WHIP <kbd>X</kbd></div>}
          {hud.ghost > 0 && <div className="ghost-chip">GHOST {hud.ghost}</div>}
          {hud.race && (
            <div className={`hud2__race ${hud.pos === 1 ? 'lead' : 'trail'} ${hud.sprint ? 'sprint' : ''}`}>
              <b>P{hud.pos || 1}<small>/2</small></b>
              <span>{hud.sprint && <em className="race-pre">FINAL STRETCH · </em>}KUROGANE {hud.rivalGap > 0 ? '+' : ''}{hud.rivalGap} M</span>
            </div>
          )}
          <div className="hud2__route">
            <span className="hud-k">SECTOR {pad2(hud.sector || 1)}</span>
            <b className={hud.route === 'backstreets' ? 'tone-signal' : 'tone-data'}>{hud.route === 'backstreets' ? 'BACKSTREETS' : 'EXPRESSWAY'}</b>
            {!hud.finale && hud.toJunction > 0 && hud.toJunction < 450 && (
              <span className="junction-hint">JUNCTION IN {hud.toJunction} M<span className="jh-more"> · LEFT LANES EXPRESSWAY</span> · RIGHT LANE BACKSTREETS</span>
            )}
          </div>
          {hud.bend !== 0 && hud.bend !== undefined && (
            <div className={`bendsign ${hud.bend > 0 ? 'r' : 'l'}`}>
              <b>{(hud.bend > 0 ? '›' : '‹').repeat(Math.abs(hud.bend))}</b>
              <span>{Math.abs(hud.bend) > 2 ? 'HARD ' : ''}{hud.bend > 0 ? 'RIGHT' : 'LEFT'}</span>
            </div>
          )}
          <div className="hud2__dash">
            <span className={`dash-status tone-${status[1]}`}>{status[0]}</span>
            <b className="dash-speed">{hud.kmh}</b>
            <span className="hud-k">KM/H</span>
            <div className="dash-bars">
              <label className={hud.heat < 3 ? 'is-idle' : ''}>
                <span>HEAT</span>
                <span className={`heatbar ${hud.heat > 70 ? 'hot' : ''}`}><i style={{ width: `${hud.heat}%` }} /></span>
              </label>
              <label className={(hud.draft || 0) * 100 < 3 ? 'is-idle' : ''}>
                <span>DRAFT</span>
                <span className="draftbar"><i style={{ width: `${Math.round((hud.draft || 0) * 100)}%` }} /></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {counting && (
        <div className="countdown" aria-live="assertive">
          <b key={Math.ceil(hud.count)}>{Math.ceil(hud.count)}</b>
          <p className="countdown__brief">
            <span className="cd-story"><i>{SPEAKERS.dispatch}</i>{STORY.countdown}</span>
            <span className="cd-rules">{cfg.race === false
              ? <>NO DAMAGE · NO POLICE · <em>5 SHARDS</em> = 1 FILE · <em>10 FILES</em> = THE LOOKOUT</>
              : <><em>5 SHARDS</em> = 1 FILE · <em>10 FILES</em> = THE LOOKOUT{noDamage ? '' : <> · <em>{hud.maxLives} HITS</em> = OUT</>}</>}</span>
            <small>C · CHANGE CAMERA{cfg.rash && cfg.car === 'bike' && cfg.race !== false ? ' · X · STRIKE' : ''}</small>
          </p>
        </div>
      )}

      {playing && (
        <div className={`rdo ${slot ? 'rdo--docked' : 'rdo--chip'}`} style={slot ? { left: slot.x, top: slot.y, width: slot.w, height: slot.h } : undefined}>
          <span>♪ {station.name}</span>
          <iframe src={ytSrc(station)} title={station.name} allow="autoplay; encrypted-media" />
        </div>
      )}
      {(cfg.dim || 0) > 0 && <div className="play-dim" aria-hidden="true" style={{ opacity: cfg.dim }} />}
      <div className="pops" aria-live="polite">
        {pops.map((p) => (
          <p key={p.id} className={`pop pop--${p.tone} ${p.who ? 'pop--plate' : ''}`} style={p.who ? { '--ms': `${p.ms}ms` } : undefined}>
            {p.who && <i className="pop__who">{p.who}</i>}
            <b>{p.text}</b>
            {p.sub && <span>{p.sub}</span>}
          </p>
        ))}
      </div>

      {phase === 'run' && !counting && (
        <div className="pad" aria-hidden="true">
          <div className="pad__steer">
            <button type="button" {...hold('left')}>◀</button>
            <button type="button" {...hold('right')}>▶</button>
          </div>
          <div className="pad__act">
            <button type="button" className="pad__brake" {...hold('brake')}>BRAKE</button>
            <button type="button" className="pad__oc" {...hold('boost')}>OVERCLOCK</button>
            {cfg.race !== false && <button type="button" className={`pad__strike ${hud.beside ? 'is-ready' : ''}`} {...hold('strike')}>WHIP</button>}
            {cfg.car === 'bike' && <button type="button" className="pad__strike pad__wheelie" {...hold('wheelie')}>WHEELIE</button>}
          </div>
        </div>
      )}

      {/* ------------------------------------------------ TITLE / GARAGE */}
      {phase === 'title' && (
        <section className="garage" aria-labelledby="rl-title">
          <header className="garage__head">
            <p className="hud-label">// SIDE JOB · NIGHT COURIER</p>
            <h1 id="rl-title" className="rl-logo">REDLINE</h1>
            <p className="rl-tag">{STORY.title}</p>
          </header>

          <div className="garage__body garage__body--one">
            <div className="pick2" role="radiogroup" aria-label="Vehicle">
              {Object.entries(CARS).map(([k, c]) => (
                <button key={k} type="button" role="radio" aria-checked={cfg.car === k} className={`pick2__v ${cfg.car === k ? 'on' : ''}`} onClick={() => update({ car: k, ...(k !== 'bike' && cfg.rash ? { rash: false } : {}) })}>
                  <b>{c.name}</b><span>{k === 'bike' ? 'Superbike · quick, twitchy, can brawl' : 'Wedge coupé · planted, fast, honest'}</span>
                </button>
              ))}
            </div>
            <Seg
              label="MODE"
              value={modeOf(cfg)}
              options={[['race', 'RACE'], ...(cfg.car === 'bike' ? [['rash', 'ROAD BRAWL']] : []), ['zen', 'ZEN RACE'], ['free', 'FREE RUN']]}
              onChange={setMode}
            />
            <p className="garage__note">{cfg.zen ? 'Race KUROGANE with no damage, no police and lighter traffic. Steering assist keeps you in lane.' : cfg.race === false ? 'Just you, the traffic and the road. No rival, no damage, no police, lighter traffic.' : cfg.rash && cfg.car === 'bike' ? 'Ride up beside KUROGANE and crack the whip (X) to knock him wide. He hits back.' : 'KUROGANE wants the files too. Be in front at the tenth. Crashes cost integrity; every file you open repairs one.'}</p>
            <Seg label="RADIO" value={cfg.radio || 'dracula'} options={[['dracula', 'DRACULA MIX'], ['nightcall', 'NIGHTCALL MIX'], ['synth', 'SYNTH LOOP'], ['link', 'YOUR MIX']]} onChange={(v) => update({ radio: v })} />
            {cfg.radio === 'link' && (
              <input className="radio-link" defaultValue={cfg.radioLink || ''} placeholder="Paste a YouTube video, playlist or Mix link" aria-label="YouTube link"
                onChange={(e) => { if (parseYT(e.target.value.trim())) update({ radioLink: e.target.value.trim() }); }} />
            )}
            {playing && <div className="rdo-slot" ref={slotRef} aria-hidden="true" />}
            <div className="swatches-row swatches-row--inline" role="radiogroup" aria-label="Livery">
              <span className="seg__label">PAINT</span>
              <div>
                {LIVERIES.map((l, i) => (
                  <button key={l.name} type="button" role="radio" aria-checked={cfg.livery === i} aria-label={l.name} className={`liv ${cfg.livery === i ? 'on' : ''}`} onClick={() => update({ livery: i })} style={{ '--a': l.body, '--b': l.stripe }} />
                ))}
              </div>
              <span className="seg__label">GLOW</span>
              <div>
                {GLOWS.map((g, i) => (
                  <button key={g.name} type="button" role="radio" aria-checked={cfg.glow === i} aria-label={g.name} className={`glw ${cfg.glow === i ? 'on' : ''} ${g.color ? '' : 'off'}`} onClick={() => update({ glow: i })} style={{ '--a': g.color || 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="only-phone">
              <Seg label="TIME" value={cfg.time} options={Object.entries(TIMES).map(([k, t]) => [k, t.name])} onChange={(v) => update({ time: v })} />
              <Seg label="WEATHER" value={cfg.weather} options={Object.entries(WEATHER).map(([k, t]) => [k, t.name])} onChange={(v) => update({ weather: v })} />
            </div>
            <details className="more">
              <summary>MORE · traffic, police, world, graphics, sound</summary>
              <Seg label="TRAFFIC" value={cfg.difficulty} options={Object.entries(DIFFICULTY).map(([k, d]) => [k, d.name])} onChange={(v) => update({ difficulty: v })} />
              <p className="garage__note">{DIFFICULTY[cfg.difficulty].blurb} Best: <b>{best.toLocaleString('en-IN')}</b></p>
              {!cfg.zen && <Seg label="POLICE" value={cfg.police === false ? 'off' : 'on'} options={[['on', 'ON'], ['off', 'OFF']]} onChange={(v) => update({ police: v === 'on' })} />}
              <Seg label="GRAPHICS" value={cfg.quality} options={Object.entries(QUALITY).map(([k, t]) => [k, t.name])} onChange={(v) => update({ quality: v })} />
              <Toggle label="Steering assist" checked={!!cfg.assist} onChange={(v) => update({ assist: v, assistAuto: false })} />
              <Toggle label="Reduced effects" checked={cfg.effects === 'reduced'} onChange={(v) => update({ effects: v ? 'reduced' : 'full' })} />
              <Toggle label="Sound effects" checked={cfg.sound} onChange={(v) => update({ sound: v })} />
              <label className="slider"><span className="seg__label">DIM</span><input type="range" min="0" max="0.7" step="0.05" value={cfg.dim || 0} onChange={(e) => update({ dim: +e.target.value })} aria-label="Dim the screen" /></label>
              <label className="slider"><span className="seg__label">VOLUME</span><input type="range" min="0" max="1" step="0.05" value={cfg.volume} onChange={(e) => update({ volume: +e.target.value })} /></label>
            </details>
            <p className="controls-line">◀ ▶ steer · ▲ overclock · ▼ brake · X whip{cfg.car === 'bike' ? ' · E wheelie' : ''} · C camera · ESC pause</p>
          </div>

          <footer className="garage__foot">
            <button type="button" className="btn btn--signal" onClick={start} autoFocus>
              JACK IN <span className="btn__k">ENTER</span>
            </button>
            <Link to="/" className="btn btn--ghost">PORTFOLIO</Link>
          </footer>
        </section>
      )}

      {phase === 'title' && (
        <>
        <nav className="timepick" aria-label="Time of day">
          <span className="hud-label">TIME</span>
          {Object.entries(TIMES).map(([k, t]) => <button key={k} type="button" aria-pressed={cfg.time === k} className={`${cfg.time === k ? 'on' : ''} ${k === 'outrun' ? 'tp-outrun' : ''}`} onClick={() => update({ time: k })}>{k === 'outrun' && <i className="tp-sun" aria-hidden="true" />}{t.name}{k === 'outrun' && <em>SUNSET RUN</em>}</button>)}
          <span className="hud-label tp-gap">WEATHER</span>
          <span className="tp-row" role="group" aria-label="Weather">
            {Object.entries(WEATHER).map(([k, t]) => <button key={k} type="button" aria-pressed={cfg.weather === k} className={`${cfg.weather === k ? 'on' : ''} tp-wx tp-wx--${k}`} onClick={() => update({ weather: k })}><i aria-hidden="true">{k === 'rain' ? '☔' : '☾'}</i>{t.name}</button>)}
          </span>
          <span className="tp-note">{cfg.weather === 'rain' ? 'Less grip · longer braking · tunnels stay dry' : 'Dry road · full grip'}</span>
        </nav>
        <aside className="showroom-tag" aria-hidden="true">
          <span className="hud-label">IN THE BAY</span>
          <b>{car.name}</b>
          <span>{LIVERIES[cfg.livery].name} · {GLOWS[cfg.glow].name} GLOW · {TIMES[cfg.time].name} · {WEATHER[cfg.weather].name}</span>
        </aside>
        </>
      )}

      {/* ------------------------------------------------ PAUSE */}
      {phase === 'paused' && (
        <section className="panel panel--pause" aria-label="Paused" ref={panelRef}>
          <div className="pause__a">
            <div className="pause__head">
              <div>
                <p className="hud-label">// LINK HELD</p>
                <h2 className="panel__h">PAUSED</h2>
              </div>
              {playing && <div className="rdo-row"><div className="rdo-slot" ref={slotRef} aria-hidden="true" /><span className="hud-k">♪ {station.name}</span></div>}
            </div>
            <div className="pause-toggles">
              <Toggle label="Sound effects" checked={cfg.sound} onChange={(v) => update({ sound: v })} />
              <Toggle label="Music" checked={cfg.music} onChange={(v) => update({ music: v })} />
              <Toggle label="Reduced effects" checked={cfg.effects === 'reduced'} onChange={(v) => update({ effects: v ? 'reduced' : 'full' })} />
              <Toggle label="Steering assist" checked={!!cfg.assist} onChange={(v) => update({ assist: v, assistAuto: false })} />
              <label className="slider"><span className="seg__label">DIM</span><input type="range" min="0" max="0.7" step="0.05" value={cfg.dim || 0} onChange={(e) => update({ dim: +e.target.value })} aria-label="Dim the screen" /></label>
            </div>
          </div>
          <div className="pause__b">
            <Seg
              label="MODE"
              value={modeOf(cfg)}
              options={[['race', 'RACE'], ...(cfg.car === 'bike' ? [['rash', 'ROAD BRAWL']] : []), ['zen', 'ZEN RACE'], ['free', 'FREE RUN']]}
              onChange={setMode}
            />
            <Seg label="WEATHER" value={cfg.weather} options={Object.entries(WEATHER).map(([k, t]) => [k, t.name])} onChange={(v) => update({ weather: v })} />
            <Seg label="BACKDROP" value={cfg.time} options={Object.entries(TIMES).map(([k, t]) => [k, t.name])} onChange={(v) => update({ time: v })} />
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--signal" onClick={togglePause} ref={pauseBtn}>
              RESUME <span className="btn__k">ESC</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={start}>RESTART</button>
            <button type="button" className="btn btn--ghost" onClick={toGarage}>GARAGE</button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ RESULTS */}
      {phase === 'over' && final && (
        <section className="panel panel--over" aria-labelledby="rl-over" ref={panelRef}>
          <div className="over__main">
            {final.complete ? (
              <>
                <p className="hud-label">// LAST EXIT · THE LOOKOUT · {final.free ? 'FREE RUN' : DIFFICULTY[cfg.difficulty].name}</p>
                <h2 id="rl-over" className="panel__h panel__h--win">THE CITY IS YOURS</h2>
                <p className="over__line"><i>{SPEAKERS.dispatch}</i>{(final.free ? STORY.finaleFree : final.won === false ? STORY.finaleLost : STORY.finaleWon).line} <span>{(final.free ? STORY.finaleFree : final.won === false ? STORY.finaleLost : STORY.finaleWon).sub}</span></p>
              </>
            ) : (
              <>
                <p className="hud-label">// CONNECTION LOST · {DIFFICULTY[cfg.difficulty].name}</p>
                <h2 id="rl-over" className="panel__h glitch-once" data-text="FLATLINED">FLATLINED</h2>
                <p className="over__line"><i>{SPEAKERS.dispatch}</i>{final.busted ? STORY.bustedOut : STORY.outOfIntegrity}</p>
              </>
            )}
            <div className="result-hero">
              <span className="hud-k">FINAL SCORE</span>
              <b>{final.score.toLocaleString('en-IN')}</b>
              {newBest ? <span className="badge">NEW BEST</span> : <span className="hud-k">BEST {best.toLocaleString('en-IN')}</span>}
            </div>
            <div className="result">
              <div><span>RANK</span><b>{rankFor(final.files)}</b></div>
              <div><span>DISTANCE</span><b>{(final.dist / 1000).toFixed(2)} KM</b></div>
              <div><span>TOP SPEED</span><b>{Math.round(final.top * 3.6)} KM/H</b></div>
              <div><span>NEAR MISSES</span><b>{final.nearMisses}</b></div>
              <div><span>SHARDS</span><b>{final.shards}</b></div>
              {final.won !== undefined && final.won !== null
                ? <div><span>RACE</span><b style={{ color: final.won ? 'var(--success)' : 'var(--alert-text)' }}>{final.won ? 'WON' : 'LOST'}</b></div>
                : <div><span>SECTORS</span><b>{final.sectors || 1}</b></div>}
            </div>
          </div>
          {/* the ten files are the portfolio's ten projects: the ones recovered on this run open their case pages */}
          <div className="over__files">
            <p className="hud-k">CASE FILES · {final.files} OF {projects.length} RECOVERED</p>
            <ol className="files">
              {projects.map((p, i) => (i < final.files ? (
                <li key={p.slug}><Link to={`/p/${p.slug}`} title={`Open the case file: ${p.title}`}><i>{pad2(i + 1)}</i><span>{p.title}</span></Link></li>
              ) : (
                <li key={p.slug} className="locked"><i>{pad2(i + 1)}</i><span>{p.title}</span><em>STILL OUT THERE</em></li>
              )))}
            </ol>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--signal" onClick={start} ref={overBtn}>
              RUN IT BACK <span className="btn__k">ENTER</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={toGarage}>GARAGE</button>
            {!final.complete && !cfg.zen && final.files < 4 && <button type="button" className="btn btn--ghost" onClick={() => { update({ zen: true, race: true, rash: false, ...(cfg.assist ? {} : { assist: true, assistAuto: true }) }); setTimeout(start, 60); }}>TRY ZEN · NO DAMAGE</button>}
            <Link to="/chill" className="btn btn--ghost" onClick={() => { const r = radioOf(cfg); if (r && (r.v || r.list)) { try { localStorage.setItem('nc2:song2', JSON.stringify({ v: r.v, list: r.list, title: r.name, by: 'Carried over from the race' })); } catch { /* ignore */ } } }}>NIGHT SHIFT ☾</Link>
          </div>
        </section>
      )}
    </main>
  );
}
