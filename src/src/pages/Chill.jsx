import { useCallback, useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav.jsx';
import GameCanvas from '../components/GameCanvas.jsx';

// NIGHT SHIFT · an ambient desk: the car on autopilot at sunset, local weather, a pomodoro with a runner,
// a plain timer, a notes pad and a song. Everything stays in this browser.

const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
const mmss = (s) => `${pad(s / 60)}:${pad(s % 60)}`;
const load = (k, f) => { try { const v = localStorage.getItem('nc2:' + k); return v == null ? f : JSON.parse(v); } catch { return f; } };
const save = (k, v) => { try { localStorage.setItem('nc2:' + k, JSON.stringify(v)); } catch { /* private mode */ } };

// ---------------------------------------------------------------- sound: a soft two-note chime, no files
let ac = null;
function chime() {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((t, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.value = i ? 1046 : 784;
      g.gain.setValueAtTime(0.0001, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.9);
      o.connect(g); g.connect(ac.destination);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 1);
    });
  } catch { /* no audio */ }
}

// ---------------------------------------------------------------- weather (Open-Meteo, no key)
const WMO = [
  [[0], 'CLEAR', '☀', '☾'], [[1, 2], 'PARTLY CLOUDY', '⛅', '☁'], [[3], 'OVERCAST', '☁', '☁'], [[45, 48], 'FOG', '≋', '≋'],
  [[51, 53, 55, 56, 57], 'DRIZZLE', '☂', '☂'], [[61, 63, 65, 66, 67, 80, 81, 82], 'RAIN', '☔', '☔'],
  [[71, 73, 75, 77, 85, 86], 'SNOW', '❄', '❄'], [[95, 96, 99], 'THUNDER', '⚡', '⚡'],
];
const describe = (code, day) => { const w = WMO.find(([c]) => c.includes(code)) || WMO[0]; return { label: w[1], glyph: day ? w[2] : w[3], wet: code >= 51 && code < 70 || code >= 80 }; };

function useWeather(onWet) {
  const [w, setW] = useState({ place: 'TOKYO', note: 'Default city · share your location for yours', loading: true });
  const get = useCallback(async (lat, lon, place) => {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&timezone=auto`);
      const j = await r.json();
      const c = j.current;
      const d = describe(c.weather_code, c.is_day);
      setW({ place, temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), wind: Math.round(c.wind_speed_10m), hum: c.relative_humidity_2m, ...d, tz: j.timezone });
      onWet?.(d.wet);
    } catch {
      setW((x) => ({ ...x, loading: false, note: 'Weather is offline right now' }));
    }
  }, [onWet]);
  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    setW((x) => ({ ...x, note: 'Finding you…' }));
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: la, longitude: lo } }) => {
      let place = 'YOUR SKY';
      try {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${la}&longitude=${lo}&localityLanguage=en`);
        const j = await r.json();
        place = (j.city || j.locality || j.principalSubdivision || place).toUpperCase();
      } catch { /* name is optional */ }
      save('wx', { la, lo, place });
      get(la, lo, place);
    }, () => setW((x) => ({ ...x, note: 'Location blocked · showing Tokyo' })), { maximumAge: 6e5, timeout: 10000 });
  }, [get]);
  useEffect(() => {
    const last = load('wx', null);
    if (last) get(last.la, last.lo, last.place);
    else get(35.6762, 139.6503, 'TOKYO');
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') locate(); }).catch(() => {});
    const t = setInterval(() => { const l = load('wx', null); if (l) get(l.la, l.lo, l.place); }, 15 * 60e3);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [w, locate];
}

// ---------------------------------------------------------------- the runner: an original pixel courier (12×16 grid, two frames)
function Runner({ mode }) {
  const px = (rows, fill) => rows.flatMap((r, y) => [...r].map((ch, x) => (ch === '#' ? <rect key={`${fill}${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} /> : null)));
  const HAIR = ['....####....', '...######...', '..##.####...'];
  const FACE = ['', '', '', '...######...', '...#....#...', '...######...'];
  const VISOR = ['', '', '', '', '...######...'];
  const JACKET = ['', '', '', '', '', '', '..########..', '.##########.', '.##.####.##.', '.##.####.##.', '....####....'];
  const SCARF = ['', '', '', '', '', '', '#######.....', '.#....#.....'];
  const LEGS_A = ['', '', '', '', '', '', '', '', '', '', '', '....#..#....', '...##...#...', '..##.....#..', '.##......##.', '.#.........#'];
  const LEGS_B = ['', '', '', '', '', '', '', '', '', '', '', '....#..#....', '....#..#....', '....##.#....', '....#..##...', '...##...#...'];
  const SIT = ['', '', '', '', '', '', '', '', '', '', '', '....######..', '....#....#..', '....#....#..', '', ''];
  return (
    <svg className={`runner runner--${mode}`} viewBox="0 0 12 16" width="48" height="64" aria-hidden="true" shapeRendering="crispEdges">
      <g fill="none">{px(HAIR, '#1b1830')}{px(FACE, '#f2c9a0')}{px(VISOR, '#00e5ff')}{px(JACKET, '#13b5a6')}{px(SCARF, '#ff2bd6')}</g>
      {mode === 'run' ? (<><g className="f1">{px(LEGS_A, '#2a2440')}</g><g className="f2">{px(LEGS_B, '#2a2440')}</g></>) : <g>{px(SIT, '#2a2440')}</g>}
    </svg>
  );
}

// ---------------------------------------------------------------- pomodoro + timer
const MODES = { focus: { label: 'FOCUS', min: 25 }, break: { label: 'BREAK', min: 5 }, long: { label: 'LONG BREAK', min: 15 }, timer: { label: 'TIMER', min: 10 } };

function Clockwork() {
  const [mode, setMode] = useState('focus');
  const [mins, setMins] = useState(load('timerMin', 10));
  const total = (mode === 'timer' ? mins : MODES[mode].min) * 60;
  const [left, setLeft] = useState(total);
  const [on, setOn] = useState(false);
  const [rounds, setRounds] = useState(load('rounds', 0));
  const end = useRef(0);

  useEffect(() => { setOn(false); setLeft(total); }, [mode, total]);
  useEffect(() => {
    if (!on) return undefined;
    end.current = Date.now() + left * 1000;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((end.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(t);
        setOn(false);
        chime();
        if (mode === 'focus') { const r = rounds + 1; setRounds(r); save('rounds', r); setMode(r % 4 === 0 ? 'long' : 'break'); }
        else if (mode !== 'timer') setMode('focus');
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  useEffect(() => {
    const base = 'NIGHT SHIFT · Anuraag Dash';
    document.title = on ? `${mmss(left)} · ${MODES[mode].label}` : base;
    return () => { document.title = 'ANURAAG DASH · home'; };
  }, [left, on, mode]);

  const [face, setFace] = useState(load('timerFace', 'digital'));
  const p = 1 - left / total;
  return (
    <section className="ch-card ch-pomo" aria-label="Pomodoro and timer">
      <div className="ch-seg" role="tablist">
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{m.label}</button>
        ))}
      </div>
      <div className="ch-face" role="group" aria-label="Timer face">
        {['digital', 'analog'].map((k) => <button key={k} type="button" aria-pressed={face === k} className={face === k ? 'on' : ''} onClick={() => { setFace(k); save('timerFace', k); }}>{k}</button>)}
      </div>
      {face === 'analog' ? (
        <div className="ch-dial">
          <svg viewBox="0 0 220 220" aria-hidden="true">
            {Array.from({ length: 60 }, (_, i) => <line key={i} x1="110" y1={i % 5 ? 8 : 4} x2="110" y2={i % 5 ? 13 : 16} transform={`rotate(${i * 6} 110 110)`} className={i / 60 <= p ? 'tick on' : 'tick'} />)}
            <circle cx="110" cy="110" r="92" className="ch-dial__base" />
            <circle cx="110" cy="110" r="92" className="ch-dial__arc" strokeDasharray={578} strokeDashoffset={578 * (1 - p)} transform="rotate(-90 110 110)" />
            <line x1="110" y1="110" x2="110" y2="34" className="ch-dial__hand" transform={`rotate(${p * 360} 110 110)`} />
            <circle cx="110" cy="110" r="4" className="ch-dial__hub" />
          </svg>
          <span className="ch-dial__runner" style={{ transform: `rotate(${p * 360}deg)` }}>
            <span style={{ transform: `rotate(${-p * 360}deg)` }}><Runner mode={on && (mode === 'focus' || mode === 'timer') ? 'run' : 'sit'} /></span>
          </span>
          <div className="ch-dial__read"><b className="ch-time">{mmss(left)}</b><span className="ch-k">{on ? MODES[mode].label : left < total ? 'PAUSED' : 'READY'}</span></div>
        </div>
      ) : (<>
      <div className="ch-digital">
        <b className="ch-time">{mmss(left)}</b>
        <span className="ch-k">{on ? MODES[mode].label : left < total ? 'PAUSED' : `${MODES[mode].label} · READY`}</span>
      </div>
      <div className="ch-track" style={{ '--p': p }}>
        <span className="ch-track__fill" />
        <span className="ch-track__runner"><Runner mode={on && (mode === 'focus' || mode === 'timer') ? 'run' : 'sit'} /></span>
      </div>
      </>)}
      <div className="ch-row">
        <button type="button" className="ch-btn ch-btn--go" onClick={() => setOn((o) => !o)}>{on ? 'PAUSE' : left < total ? 'RESUME' : 'START'}</button>
        <button type="button" className="ch-btn" onClick={() => { setOn(false); setLeft(total); }}>RESET</button>
        {mode === 'timer' ? (
          <label className="ch-min">
            <input type="number" min="1" max="180" value={mins} onChange={(e) => { const v = Math.max(1, Math.min(180, +e.target.value || 1)); setMins(v); save('timerMin', v); }} aria-label="Timer minutes" /> MIN
          </label>
        ) : (
          <span className="ch-rounds" title="Focus rounds finished">{'●'.repeat(rounds % 4)}{'○'.repeat(4 - (rounds % 4))} · {rounds} done</span>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- analog wall clock
function Analog({ t }) {
  const h = (t.getHours() % 12) * 30 + t.getMinutes() * 0.5, m = t.getMinutes() * 6 + t.getSeconds() * 0.1, sec = t.getSeconds() * 6;
  return (
    <svg className="ch-analog" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="face" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1="60" y1="8" x2="60" y2={i % 3 ? 14 : 19} transform={`rotate(${i * 30} 60 60)`} className={i % 3 ? 'tk' : 'tk tk--q'} />)}
      <line x1="60" y1="64" x2="60" y2="32" className="h" transform={`rotate(${h} 60 60)`} />
      <line x1="60" y1="66" x2="60" y2="16" className="m" transform={`rotate(${m} 60 60)`} />
      <line x1="60" y1="70" x2="60" y2="12" className="s" transform={`rotate(${sec} 60 60)`} />
      <circle cx="60" cy="60" r="3" className="hub" />
    </svg>
  );
}

// ---------------------------------------------------------------- drive controls: scene + speed
const SCENES = [['outrun', 'Outrun'], ['tokyo', 'Midnight Tokyo'], ['dusk', 'Dusk'], ['midnight', 'Neon Blue'], ['dawn', 'Dawn']];
function Drive({ engine, dim, setDim, vibe, setVibe }) {
  const [scene, setScene] = useState(load('chillScene', 'outrun'));
  const [speed, setSpeed] = useState(load('chillSpeed', 0.8));
  useEffect(() => { engine()?.configure({ time: scene }); save('chillScene', scene); }, [scene, engine]);
  useEffect(() => { engine()?.configure({ cruise: speed }); save('chillSpeed', speed); }, [speed, engine]);
  const [ride, setRide] = useState(load('chillRide', 'wedge'));
  useEffect(() => { engine()?.configure({ car: ride }); save('chillRide', ride); }, [ride, engine]);
  return (
    <div className="ch-drive" role="group" aria-label="Drive">
      <div className="ch-drive__scenes">
        {[['wedge', 'Car'], ['bike', 'Bike · skills']].map(([k, n]) => <button key={k} type="button" aria-pressed={ride === k} className={`ride ${ride === k ? 'on' : ''}`} onClick={() => setRide(k)}>{n}</button>)}
        <i className="ch-drive__sep" aria-hidden="true" />
        {SCENES.map(([k, n]) => <button key={k} type="button" aria-pressed={scene === k} className={scene === k ? 'on' : ''} onClick={() => setScene(k)}>{n}</button>)}
      </div>
      <label className="ch-drive__speed">
        <span>Cruise</span>
        <input type="range" min="0.25" max="1.3" step="0.05" value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-label="Cruising speed" />
        <b>{Math.round(speed * 252)} km/h</b>
      </label>
      <label className="ch-drive__speed">
        <span>Dim</span>
        <input type="range" min="0" max="0.75" step="0.05" value={dim} onChange={(e) => { setDim(+e.target.value); save('chillDim', +e.target.value); }} aria-label="Dim the screen" />
        <button type="button" className="ch-vibe" aria-pressed={vibe} onClick={() => setVibe((v) => !v)}>{vibe ? 'SHOW UI' : 'VIBE'} <kbd>H</kbd></button>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------- notes
function Notes() {
  const [text, setText] = useState(load('notes', ''));
  useEffect(() => { const t = setTimeout(() => save('notes', text), 300); return () => clearTimeout(t); }, [text]);
  return (
    <section className="ch-card ch-notes" aria-label="Notes">
      <span className="ch-k">NOTES <i>saved in this browser</i></span>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What are we making tonight?" spellCheck="true" />
      <span className="ch-k ch-k--end">{text.trim() ? text.trim().split(/\s+/).length : 0} WORDS</span>
    </section>
  );
}

// ---------------------------------------------------------------- music: any YouTube link; Nightcall by default (official upload)
const DEFAULT_SONG = { v: 'MV_3Dpw-BRY', list: 'RDMV_3Dpw-BRY', title: 'Nightcall Mix', by: 'YouTube Mix · Kavinsky' };
const parseYT = (str) => {
  const list = String(str).match(/[?&]list=([\w-]+)/);
  const v = String(str).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(str).match(/^([\w-]{11})$/);
  return list ? { list: list[1], v: v ? v[1] : undefined } : v ? { v: v[1] } : null;
};
const ytSrc = (s) => (s.list
  ? `https://www.youtube-nocookie.com/embed/${s.v ? `${s.v}?list=${s.list}&` : `videoseries?list=${s.list}&`}autoplay=1&rel=0`
  : `https://www.youtube-nocookie.com/embed/${s.v}?autoplay=1&loop=1&playlist=${s.v}&rel=0`);

function Music() {
  const [song, setSong] = useState(() => { const x = load('song2', null); return x && (x.v || x.list) ? x : DEFAULT_SONG; });
  const [draft, setDraft] = useState('');
  const pick = (e) => {
    e.preventDefault();
    const r = parseYT(draft.trim());
    if (!r) return;
    const next = { ...r, title: r.list ? 'Your mix' : 'Your track', by: 'YouTube' };
    setSong(next); save('song2', next); setDraft('');
    if (r.v) fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${r.v}&format=json`).then((x) => x.json()).then((j) => { const n = { ...next, title: j.title, by: j.author_name }; setSong(n); save('song2', n); }).catch(() => {});
  };
  return (
    <section className="ch-card ch-music" aria-label="Music">
      <span className="ch-k">NOW PLAYING <i>{song.title}</i></span>
      <iframe className="ch-yt" src={ytSrc(song)} title={`${song.title} · ${song.by}`} allow="autoplay; encrypted-media" />
      <form className="ch-pick" onSubmit={pick}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste a YouTube video, playlist or Mix" aria-label="YouTube link" />
        <button type="submit" className="ch-btn">LOAD</button>
        {song.list !== DEFAULT_SONG.list && <button type="button" className="ch-btn" onClick={() => { setSong(DEFAULT_SONG); save('song2', DEFAULT_SONG); }}>NIGHTCALL</button>}
      </form>
    </section>
  );
}

// ---------------------------------------------------------------- street lines: original, rotating
const LINES = [
  'The city never sleeps. It just dims the lights and waits for you.',
  'Every neon sign is somebody else\'s dream, rented by the hour.',
  'Drive like the rent is due and the road is free.',
  'Chrome fades. Good work ships.',
  'At 3 a.m. the highway is the only honest thing in town.',
  'Keep your engine warm and your plans warmer.',
  'Somewhere up there a sign is spelling your name wrong. Make it right.',
  'Rain on the windshield, a deadline in the rear-view. Keep going.',
  'Find a way, or make one. Then make it look good.',
  'The skyline is just the city showing off. Show off back.',
];
function StreetLine() {
  const [i, setI] = useState(() => Math.floor(Math.random() * LINES.length));
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % LINES.length), 18000); return () => clearInterval(t); }, []);
  return <p className="ch-line" key={i} aria-live="off">“{LINES[i]}”</p>;
}

// ---------------------------------------------------------------- page
export default function Chill() {
  const canvas = useRef(null);
  const [now, setNow] = useState(new Date());
  const [rain, setRain] = useState(false);
  const [dim, setDim] = useState(load('chillDim', 0.2));
  const [vibe, setVibe] = useState(false);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const k = (e) => { if (e.key.toLowerCase() === 'h' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setVibe((v) => !v); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const onWet = useCallback((wet) => setRain(wet), []);
  const engine = useCallback(() => canvas.current?.engine, []);
  const [w, locate] = useWeather(onWet);
  useEffect(() => { canvas.current?.engine?.configure({ weather: rain ? 'rain' : 'clear' }); }, [rain]);

  return (
    <main className={`chill ${vibe ? 'chill--vibe' : ''}`}>
      <Nav />
      <GameCanvas
        ref={canvas}
        mode="attract"
        lockTime
        autoPause
        className="chill__bg"
        config={{ time: load('chillScene', 'outrun'), cruise: load('chillSpeed', 0.8), weather: rain ? 'rain' : 'clear', difficulty: 'chill', effects: 'full', signs: 'tokyo', car: load('chillRide', 'wedge') }}
        label="Ambient backdrop: a car on autopilot down a sunset highway"
      />
      <div className="chill__shade" aria-hidden="true" />
      <div className="chill__dim" aria-hidden="true" style={{ opacity: dim }} />
      {/* ambient readout: no card, just light type over the drive */}
      <div className="ch-ambient" aria-label="Time and weather">
        <Analog t={now} />
        <div>
          <b className="ch-clock">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
          <span className="ch-amb__wx">
            {w.temp != null ? <>{w.glyph} {w.temp}° {w.label.toLowerCase()} · {w.place.toLowerCase()}</> : w.note}
            {' '}<button type="button" className="ch-link" onClick={locate}>◎</button>
          </span>
        </div>
      </div>

      {/* one panel at a time, opened from the dock; music stays mounted so it keeps playing */}
      <div className={`ch-pop ${open ? 'is-open' : ''}`}>
        <div hidden={open !== 'timer'}><Clockwork /></div>
        <div className={open === 'music' ? '' : 'ch-keep'}><Music /></div>
        <div hidden={open !== 'notes'}><Notes /></div>
        <div hidden={open !== 'search'}>
          <form className="ch-card ch-search" action="https://www.google.com/search" method="get" target="_blank">
            <span className="ch-k">SEARCH THE NET</span>
            <div className="ch-pick"><input name="q" placeholder="Search Google" aria-label="Search Google" autoComplete="off" /><button type="submit" className="ch-btn">GO ↗</button></div>
          </form>
        </div>
        <div hidden={open !== 'drive'}><Drive engine={engine} dim={dim} setDim={setDim} vibe={vibe} setVibe={setVibe} /></div>
      </div>

      <div className="ch-bottom">
        <StreetLine />
        <nav className="ch-dock" aria-label="Night Shift tools">
          {[['timer', '◷', 'Timer'], ['music', '♪', 'Music'], ['notes', '✎', 'Notes'], ['search', '⌕', 'Search'], ['drive', '⚙', 'Drive']].map(([k, g, n]) => (
            <button key={k} type="button" aria-pressed={open === k} className={open === k ? 'on' : ''} onClick={() => setOpen((o) => (o === k ? null : k))} title={n}>
              <span aria-hidden="true">{g}</span><i>{n}</i>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
