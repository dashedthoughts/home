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

  const p = 1 - left / total;
  const R = 92, C = 2 * Math.PI * R;
  const ang = p * 360;
  return (
    <section className="ch-card ch-pomo" aria-label="Pomodoro and timer">
      <div className="ch-seg" role="tablist">
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{m.label}</button>
        ))}
      </div>
      <div className="ch-dial">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <linearGradient id="chArc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00e5ff" /><stop offset="0.55" stopColor="#ff2bd6" /><stop offset="1" stopColor="#ffb347" /></linearGradient>
          </defs>
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="110" y1={i % 5 ? 8 : 4} x2="110" y2={i % 5 ? 13 : 16} transform={`rotate(${i * 6} 110 110)`} className={i / 60 <= p ? 'tick on' : 'tick'} />
          ))}
          <circle cx="110" cy="110" r={R} className="ch-dial__base" />
          <circle cx="110" cy="110" r={R} className="ch-dial__arc" stroke="url(#chArc)" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 110 110)" />
          <line x1="110" y1="110" x2="110" y2="34" className="ch-dial__hand" transform={`rotate(${ang} 110 110)`} />
          <circle cx="110" cy="110" r="4" className="ch-dial__hub" />
        </svg>
        <span className="ch-dial__runner" style={{ transform: `rotate(${ang}deg)` }}>
          <span style={{ transform: `rotate(${-ang}deg)` }}><Runner mode={on && (mode === 'focus' || mode === 'timer') ? 'run' : 'sit'} /></span>
        </span>
        <div className="ch-dial__read">
          <b className="ch-time">{mmss(left)}</b>
          <span className="ch-k">{MODES[mode].label}</span>
        </div>
      </div>
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

// ---------------------------------------------------------------- drive controls: scene + speed
const SCENES = [['outrun', 'Outrun'], ['tokyo', 'Midnight Tokyo'], ['dusk', 'Dusk'], ['midnight', 'Neon Blue'], ['dawn', 'Dawn']];
function Drive({ engine }) {
  const [scene, setScene] = useState(load('chillScene', 'outrun'));
  const [speed, setSpeed] = useState(load('chillSpeed', 0.8));
  useEffect(() => { engine()?.configure({ time: scene }); save('chillScene', scene); }, [scene, engine]);
  useEffect(() => { engine()?.configure({ cruise: speed }); save('chillSpeed', speed); }, [speed, engine]);
  return (
    <div className="ch-drive" role="group" aria-label="Drive">
      <div className="ch-drive__scenes">
        {SCENES.map(([k, n]) => <button key={k} type="button" aria-pressed={scene === k} className={scene === k ? 'on' : ''} onClick={() => setScene(k)}>{n}</button>)}
      </div>
      <label className="ch-drive__speed">
        <span>Cruise</span>
        <input type="range" min="0.25" max="1.3" step="0.05" value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-label="Cruising speed" />
        <b>{Math.round(speed * 252)} km/h</b>
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
const DEFAULT_SONG = { id: 'MV_3Dpw-BRY', title: 'Nightcall', by: 'Kavinsky' };
const ytId = (s) => { const m = String(s).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(s).match(/^([\w-]{11})$/); return m ? m[1] : null; };

function Music() {
  const [song, setSong] = useState(load('song', DEFAULT_SONG));
  const [live, setLive] = useState(false);
  const [draft, setDraft] = useState('');
  const pick = (e) => {
    e.preventDefault();
    const id = ytId(draft.trim());
    if (!id) return;
    const next = { id, title: 'Your track', by: 'YouTube' };
    setSong(next); save('song', next); setDraft(''); setLive(true);
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`).then((r) => r.json()).then((j) => { const n = { id, title: j.title, by: j.author_name }; setSong(n); save('song', n); }).catch(() => {});
  };
  return (
    <section className="ch-card ch-music" aria-label="Music">
      <span className="ch-k">NOW PLAYING</span>
      {live ? (
        <iframe className="ch-yt" src={`https://www.youtube-nocookie.com/embed/${song.id}?autoplay=1&loop=1&playlist=${song.id}&modestbranding=1&rel=0`} title={`${song.title} · ${song.by}`} allow="autoplay; encrypted-media" />
      ) : (
        <button type="button" className="ch-cover" onClick={() => setLive(true)} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${song.id}/hqdefault.jpg)` }}>
          <span className="ch-cover__play" aria-hidden="true">▶</span>
          <span className="ch-cover__t"><b>{song.title}</b><i>{song.by}</i></span>
          <span className="sr-only">Play {song.title}</span>
        </button>
      )}
      <form className="ch-pick" onSubmit={pick}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste a YouTube link" aria-label="YouTube link" />
        <button type="submit" className="ch-btn">LOAD</button>
        {song.id !== DEFAULT_SONG.id && <button type="button" className="ch-btn" onClick={() => { setSong(DEFAULT_SONG); save('song', DEFAULT_SONG); }}>NIGHTCALL</button>}
      </form>
    </section>
  );
}

// ---------------------------------------------------------------- page
export default function Chill() {
  const canvas = useRef(null);
  const [now, setNow] = useState(new Date());
  const [rain, setRain] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000 * 15); return () => clearInterval(t); }, []);
  const onWet = useCallback((wet) => setRain(wet), []);
  const engine = useCallback(() => canvas.current?.engine, []);
  // this page's type: a wide display face for numerals, a quiet grotesk for text (loaded here only)
  useEffect(() => {
    if (document.getElementById('ch-fonts')) return;
    const l = document.createElement('link');
    l.id = 'ch-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@300;500;700&family=Manrope:wght@400;500;700&display=swap';
    document.head.appendChild(l);
  }, []);
  const [w, locate] = useWeather(onWet);
  useEffect(() => { canvas.current?.engine?.configure({ weather: rain ? 'rain' : 'clear' }); }, [rain]);

  return (
    <main className="chill">
      <Nav />
      <GameCanvas
        ref={canvas}
        mode="attract"
        lite
        lockTime
        className="chill__bg"
        config={{ time: load('chillScene', 'outrun'), cruise: load('chillSpeed', 0.8), weather: rain ? 'rain' : 'clear' }}
        label="Ambient backdrop: a car on autopilot down a sunset highway"
      />
      <div className="chill__shade" aria-hidden="true" />
      <div className="chill__grid">
        <div className="chill__left">
          <section className="ch-card ch-now" aria-label="Time and weather">
            <span className="ch-k">Night shift · {w.place.toLowerCase()}</span>
            <b className="ch-clock">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
            <span className="ch-date">{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            {w.temp != null ? (
              <div className="ch-wx">
                <span className="ch-wx__g" aria-hidden="true">{w.glyph}</span>
                <span><b>{w.temp}°</b> {w.label.toLowerCase()}<br /><i>feels {w.feels}° · wind {w.wind} km/h · {w.hum}% humid</i></span>
              </div>
            ) : <span className="ch-date">{w.note}</span>}
            <button type="button" className="ch-link" onClick={locate}>{w.place === 'TOKYO' ? '◎ Use my weather' : '◎ Refresh'}</button>
          </section>
          <Clockwork />
        </div>
        <Drive engine={engine} />
        <div className="chill__side">
          <Music />
          <Notes />
        </div>
      </div>
    </main>
  );
}
