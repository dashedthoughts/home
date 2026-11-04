import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas.jsx';
import { projects, rankFor } from '../data/content.js';
import { CARS, LIVERIES, GLOWS, TIMES, WEATHER, DIFFICULTY, QUALITY, resolveQuality } from '../game/config.js';
import { addDecrypted, getRaceConfig, setRaceConfig, getBestBy, setBestBy } from '../lib/store.js';

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
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
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

  // ---------- callouts ----------
  const pop = useCallback((text, tone = 'data', sub = '') => {
    const id = Math.random();
    setPops([{ id, text, tone, sub }]); // one call-out at a time: the newest wins, nothing stacks
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1300);
  }, []);

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
      if (phaseRef.current !== 'run') return;
      switch (e.type) {
        case 'go': pop('GO', 'signal'); break;
        case 'nearmiss': pop('NEAR MISS', 'data', `+${e.pts}`); break;
        case 'slipstream': pop('SLIPSTREAM', 'data', 'BOOST · HEAT VENTED'); break;
        case 'chain-break': pop('CHAIN LOST', 'dim'); break;
        case 'glitch': pop('SIGNAL GLITCH', 'alert', 'STEERING INVERTED'); break;
        case 'glitch-end': pop('SIGNAL RESTORED', 'data'); break;
        case 'hit': pop('IMPACT', 'alert', `INTEGRITY ${Math.max(0, e.lives)}`); break;
        case 'junction':
          pop(e.route === 'backstreets' ? 'BACKSTREETS' : 'EXPRESSWAY', e.route === 'backstreets' ? 'route' : 'routex', e.route === 'backstreets' ? 'SHARDS ×1.5 · TIGHTER STREETS · SLOWER TRAFFIC' : 'OPEN ROAD · FAST TRAFFIC');
          break;
        case 'finale': pop(e.won === null ? 'ALL TEN FILES' : e.won ? 'YOU WIN' : 'KUROGANE WINS', e.won === false ? 'alert' : 'ok', 'LAST EXIT: THE LOOKOUT'); break;
        case 'strike': pop('LASHED', 'ok', e.cop ? 'CRUISER DROPS BACK' : 'KUROGANE SPINS WIDE'); break;
        case 'struck': pop('HIT', 'alert', cfgRef.current.rash ? 'KUROGANE SWINGS' : 'KUROGANE LEANS ON YOU'); break;
        case 'power': pop(e.kind === 'ghost' ? 'GHOST' : 'NITRO', e.kind === 'ghost' ? 'data' : 'signal', e.kind === 'ghost' ? '5 SECONDS · RIDE THROUGH ANYTHING' : 'INSTANT SLIPSTREAM · ENGINE COOLED'); break;
        case 'wheelie': pop('WHEELIE', 'signal', '+150'); break;
        case 'police': pop('POLICE', 'alert', `WANTED ${'★'.repeat(e.stars)} · OUTRUN THEM`); break;
        case 'busted': pop('BUSTED', 'alert', `${e.lost ? `−${e.lost} SHARDS · ` : ''}${e.lives > 0 ? `INTEGRITY −1 · ${e.lives} LEFT` : 'END OF THE LINE'}`); break;
        case 'escaped': pop('LOST THEM', 'ok', `+${e.pts.toLocaleString('en-IN')}`); break;
        case 'overtake': pop('OVERTAKE', 'ok', 'P1 · HOLD IT TO THE LOOKOUT'); break;
        case 'overtaken': pop('KUROGANE PASSES', 'alert', 'P2 · TAKE IT BACK'); break;
        case 'complete': {
          const d = cfgRef.current.difficulty;
          const prev = getBestBy(d);
          setNewBest(e.score > prev);
          if (e.score > prev) setBestBy(d, e.score);
          setBestState(Math.max(prev, e.score));
          setFinal({ ...e, complete: true });
          setTimeout(() => setPhase('over'), 5200);
          break;
        }
        case 'casefile': {
          const p = projects[(e.n - 1) % projects.length];
          addDecrypted(p.slug);
          setRunFiles((f) => (f.some((x) => x.slug === p.slug) ? f : [...f, p]));
          pop(`FILE ${pad2(e.n)} OPEN`, 'ok', `${10 - e.n} TO THE LOOKOUT`);
          break;
        }
        case 'over': {
          const d = cfgRef.current.difficulty;
          const prev = getBestBy(d);
          setNewBest(e.score > prev);
          if (e.score > prev) setBestBy(d, e.score);
          setBestState(Math.max(prev, e.score));
          setFinal(e);
          setTimeout(() => setPhase('over'), 1400);
          break;
        }
        default:
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pop],
  );

  // ---------- flow ----------
  const start = useCallback(() => {
    setRadioOn(true);
    const g = eng();
    if (!g) return;
    setRunFiles([]);
    setFinal(null);
    setPops([]);
    g.configure(cfgRef.current);
    g.setView('chase');
    g.setMode('play');
    g.restart();
    setPhase('run');
  }, []);

  const toGarage = useCallback(() => {
    const g = eng();
    if (!g) return;
    g.setMode('attract');
    g.restart();
    g.setView('showroom');
    g.resume();
    setPhase('title');
    setTab('garage');
  }, []);

  const togglePause = useCallback(() => {
    const g = eng();
    if (!g) return;
    if (phaseRef.current === 'run') { g.pause(); setPhase('paused'); }
    else if (phaseRef.current === 'paused') { g.resume(); setPhase('run'); }
  }, []);

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

  const car = CARS[cfg.car];
  const counting = phase === 'run' && hud.count > 0;
  const status = hud.glitch ? ['GLITCH', 'alert'] : hud.slip ? ['SLIPSTREAM', 'data'] : hud.overclock ? ['OVERCLOCK', 'signal'] : hud.heat > 70 ? ['RUNNING HOT', 'signal'] : ['CRUISE', 'dim'];

  return (
    <main className={`play play--${phase}`}>
      <GameCanvas
        ref={game}
        mode="attract"
        view="showroom"
        config={cfg}
        autoPause={false}
        onTick={setHud}
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
            <div>
              <span className="hud-k">INTEGRITY</span>
              <span className="pips">
                {Array.from({ length: hud.maxLives }, (_, i) => (
                  <i key={i} className={i < hud.lives ? 'on' : ''} />
                ))}
              </span>
            </div>
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
          {hud.beside && <div className="strike-ready">WHIP <kbd>X</kbd></div>}
          {hud.ghost > 0 && <div className="ghost-chip">GHOST {hud.ghost}</div>}
          {hud.race && (
            <div className={`hud2__race ${hud.pos === 1 ? 'lead' : 'trail'}`}>
              <b>P{hud.pos || 1}<small>/2</small></b>
              <span>KUROGANE {hud.rivalGap > 0 ? '+' : ''}{hud.rivalGap} M</span>
            </div>
          )}
          <div className="hud2__route">
            <span className="hud-k">SECTOR {pad2(hud.sector || 1)}</span>
            <b className={hud.route === 'backstreets' ? 'tone-signal' : 'tone-data'}>{hud.route === 'backstreets' ? 'BACKSTREETS' : 'EXPRESSWAY'}</b>
            {!hud.finale && hud.toJunction > 0 && hud.toJunction < 450 && (
              <span className="junction-hint">JUNCTION IN {hud.toJunction} M · LEFT LANES EXPRESSWAY · RIGHT LANE BACKSTREETS</span>
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
              <label>
                <span>HEAT</span>
                <span className={`heatbar ${hud.heat > 70 ? 'hot' : ''}`}><i style={{ width: `${hud.heat}%` }} /></span>
              </label>
              <label>
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
          <p className="countdown__brief">GRAB <em>5 SHARDS</em> TO OPEN A CASE FILE · OPEN <em>10</em> TO REACH THE LOOKOUT<br /><small>C · CHANGE CAMERA{cfg.rash && cfg.car === 'bike' && cfg.race !== false ? ' · X · STRIKE' : ''}</small></p>
        </div>
      )}

      {radioOn && radioOf(cfg) && (radioOf(cfg).v || radioOf(cfg).list) && (
        <div className={`radio ${phase === 'title' ? 'radio--away' : ''}`}>
          <span>♪ {radioOf(cfg).name}</span>
          <iframe src={ytSrc(radioOf(cfg))} title={radioOf(cfg).name} allow="autoplay; encrypted-media" />
        </div>
      )}
      {(cfg.dim || 0) > 0 && <div className="play-dim" aria-hidden="true" style={{ opacity: cfg.dim }} />}
      <div className="pops" aria-live="polite">
        {pops.map((p) => (
          <p key={p.id} className={`pop pop--${p.tone}`}>
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
            {cfg.race !== false && <button type="button" className="pad__strike" {...hold('strike')}>WHIP</button>}
            {cfg.car === 'bike' && <button type="button" className="pad__strike" {...hold('wheelie')}>WHEELIE</button>}
          </div>
        </div>
      )}

      {/* ------------------------------------------------ TITLE / GARAGE */}
      {phase === 'title' && (
        <section className="garage" aria-labelledby="rl-title">
          <header className="garage__head">
            <p className="hud-label">// SIDE JOB · NIGHT COURIER</p>
            <h1 id="rl-title" className="rl-logo">REDLINE</h1>
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
              value={cfg.zen ? 'zen' : cfg.race === false ? 'free' : cfg.rash && cfg.car === 'bike' ? 'rash' : 'race'}
              options={[['race', 'RACE'], ...(cfg.car === 'bike' ? [['rash', 'ROAD BRAWL']] : []), ['zen', 'ZEN RACE'], ['free', 'FREE RUN']]}
              onChange={(v) => update({ race: v !== 'free', rash: v === 'rash', zen: v === 'zen' })}
            />
            <p className="garage__note">{cfg.zen ? 'Race KUROGANE with no damage and no police. Crashes only cost speed.' : cfg.race === false ? 'Just you, the traffic and the road.' : cfg.rash && cfg.car === 'bike' ? 'Ride up beside KUROGANE and crack the whip (X) to knock him wide. He hits back.' : 'First to the lookout wins. Crashes cost integrity and draw the police.'}</p>
            <Seg label="RADIO" value={cfg.radio || 'dracula'} options={[['dracula', 'DRACULA MIX'], ['nightcall', 'NIGHTCALL MIX'], ['synth', 'SYNTH LOOP'], ['link', 'YOUR MIX']]} onChange={(v) => update({ radio: v })} />
            {cfg.radio === 'link' && (
              <input className="radio-link" defaultValue={cfg.radioLink || ''} placeholder="Paste a YouTube video, playlist or Mix link" aria-label="YouTube link"
                onChange={(e) => { if (parseYT(e.target.value.trim())) update({ radioLink: e.target.value.trim() }); }} />
            )}
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
            <details className="more">
              <summary>MORE · traffic, police, world, graphics, sound</summary>
              <Seg label="TRAFFIC" value={cfg.difficulty} options={Object.entries(DIFFICULTY).map(([k, d]) => [k, d.name])} onChange={(v) => update({ difficulty: v })} />
              <p className="garage__note">{DIFFICULTY[cfg.difficulty].blurb} Best: <b>{best.toLocaleString('en-IN')}</b></p>
              {!cfg.zen && <Seg label="POLICE" value={cfg.police === false ? 'off' : 'on'} options={[['on', 'ON'], ['off', 'OFF']]} onChange={(v) => update({ police: v === 'on' })} />}
              <Seg label="WEATHER" value={cfg.weather} options={Object.entries(WEATHER).map(([k, t]) => [k, t.name])} onChange={(v) => update({ weather: v })} />
              <Seg label="GRAPHICS" value={cfg.quality} options={Object.entries(QUALITY).map(([k, t]) => [k, t.name])} onChange={(v) => update({ quality: v })} />
              <Toggle label="Steering assist" checked={cfg.assist} onChange={(v) => update({ assist: v })} />
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
        <section className="panel panel--pause" aria-label="Paused">
          <p className="hud-label">// LINK HELD</p>
          <h2 className="panel__h">PAUSED</h2>
          <div className="pause-toggles">
            <Toggle label="Sound effects" checked={cfg.sound} onChange={(v) => update({ sound: v })} />
            <Toggle label="Music" checked={cfg.music} onChange={(v) => update({ music: v })} />
            <Toggle label="Reduced effects" checked={cfg.effects === 'reduced'} onChange={(v) => update({ effects: v ? 'reduced' : 'full' })} />
            <Toggle label="Steering assist" checked={cfg.assist} onChange={(v) => update({ assist: v })} />
            <label className="slider"><span className="seg__label">DIM</span><input type="range" min="0" max="0.7" step="0.05" value={cfg.dim || 0} onChange={(e) => update({ dim: +e.target.value })} aria-label="Dim the screen" /></label>
          </div>
          <Seg
            label="MODE"
            value={cfg.zen ? 'zen' : cfg.race === false ? 'free' : cfg.rash && cfg.car === 'bike' ? 'rash' : 'race'}
            options={[['race', 'RACE'], ...(cfg.car === 'bike' ? [['rash', 'ROAD BRAWL']] : []), ['zen', 'ZEN RACE'], ['free', 'FREE RUN']]}
            onChange={(v) => update({ race: v !== 'free', rash: v === 'rash', zen: v === 'zen' })}
          />
          <Seg label="BACKDROP" value={cfg.time} options={Object.entries(TIMES).map(([k, t]) => [k, t.name])} onChange={(v) => update({ time: v })} />
          <div className="btn-row">
            <button type="button" className="btn btn--signal" onClick={togglePause} autoFocus>
              RESUME <span className="btn__k">ESC</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={start}>RESTART</button>
            <button type="button" className="btn btn--ghost" onClick={toGarage}>GARAGE</button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ RESULTS */}
      {phase === 'over' && final && (
        <section className="panel panel--over" aria-labelledby="rl-over">
          {final.complete ? (
            <>
              <p className="hud-label">// LAST EXIT · THE LOOKOUT · {DIFFICULTY[cfg.difficulty].name}</p>
              <h2 id="rl-over" className="panel__h panel__h--win">THE CITY IS YOURS</h2>
              <p className="garage__lede">Ten files, one lookout. Thanks for the drive.</p>
            </>
          ) : (
            <>
              <p className="hud-label">// CONNECTION LOST · {DIFFICULTY[cfg.difficulty].name}</p>
              <h2 id="rl-over" className="panel__h glitch-once" data-text="FLATLINED">FLATLINED</h2>
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
            <div><span>FILES</span><b>{final.files}/{projects.length}</b></div>
            {final.won !== undefined && final.won !== null && <div><span>RACE</span><b style={{ color: final.won ? 'var(--success)' : 'var(--alert-text)' }}>{final.won ? 'WON' : 'LOST'}</b></div>}
            {final.sectors && <div><span>SECTORS</span><b>{final.sectors}</b></div>}
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--signal" onClick={start} autoFocus>
              RUN IT BACK <span className="btn__k">ENTER</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={toGarage}>GARAGE</button>
            <Link to="/chill" className="btn btn--ghost" onClick={() => { const r = radioOf(cfg); if (r && (r.v || r.list)) { try { localStorage.setItem('nc2:song2', JSON.stringify({ v: r.v, list: r.list, title: r.name, by: 'Carried over from the race' })); } catch { /* ignore */ } } }}>NIGHT SHIFT ☾</Link>
          </div>
        </section>
      )}
    </main>
  );
}
