// MACHI (街): a voxel world-builder sandbox. A block of Tokyo at night, yours to walk and rebuild.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Game, TOOLS } from './game.js';
import { BLOCKS, PALETTE_ORDER } from './core/blocks.js';
import { KANA } from './core/glyphs.js';
import { TEMPLATES } from './core/gen.js';

// ---------- block swatches: tiny isometric cubes drawn once on a canvas ----------
const swatchCache = new Map();
function swatch(id) {
  if (swatchCache.has(id)) return swatchCache.get(id);
  const b = BLOCKS[id]; if (!b || typeof document === 'undefined') return '';
  const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d');
  const n = parseInt(b.color.slice(1), 16), R = (n >> 16) & 255, G = (n >> 8) & 255, B = n & 255;
  const sh = (k) => `rgb(${Math.min(255, R * k) | 0},${Math.min(255, G * k) | 0},${Math.min(255, B * k) | 0})`;
  const glow = b.em > 0;
  if (glow) { x.shadowColor = b.color; x.shadowBlur = 12; }
  const half = b.shape === 'slab' ? 0.5 : 1, thin = b.shape === 'post' ? 0.35 : b.shape === 'lantern' ? 0.7 : 1;
  const cx = 24, top = 8 + (1 - half) * 14, s = 15 * thin, h = 20 * half;
  if (b.shape === 'cross') {
    x.strokeStyle = sh(1); x.lineWidth = 3; x.beginPath(); for (let i = 0; i < 5; i++) { x.moveTo(24, 40); x.lineTo(12 + i * 6, 12 + (i % 2) * 6); } x.stroke();
    x.fillStyle = sh(1.2); for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(12 + i * 6, 12 + (i % 2) * 6, 3, 0, 7); x.fill(); }
  } else if (b.shape === 'curtain') {
    x.fillStyle = sh(1); for (let i = 0; i < 3; i++) x.fillRect(10 + i * 10, 10, 8, 26); x.fillStyle = sh(0.6); x.fillRect(8, 8, 32, 4);
  } else {
    x.globalAlpha = b.pass === 'glass' || b.pass === 'water' ? 0.7 : 1;
    x.fillStyle = glow ? sh(1.15) : sh(1.12); x.beginPath(); x.moveTo(cx, top); x.lineTo(cx + s * 1.15, top + s * 0.6); x.lineTo(cx, top + s * 1.2); x.lineTo(cx - s * 1.15, top + s * 0.6); x.closePath(); x.fill();
    x.shadowBlur = 0;
    x.fillStyle = glow ? sh(0.95) : sh(0.82); x.beginPath(); x.moveTo(cx - s * 1.15, top + s * 0.6); x.lineTo(cx, top + s * 1.2); x.lineTo(cx, top + s * 1.2 + h); x.lineTo(cx - s * 1.15, top + s * 0.6 + h); x.closePath(); x.fill();
    x.fillStyle = glow ? sh(0.8) : sh(0.62); x.beginPath(); x.moveTo(cx + s * 1.15, top + s * 0.6); x.lineTo(cx, top + s * 1.2); x.lineTo(cx, top + s * 1.2 + h); x.lineTo(cx + s * 1.15, top + s * 0.6 + h); x.closePath(); x.fill();
    if (b.shape.startsWith('stair')) { x.fillStyle = sh(1.12); x.fillRect(cx - 4, top - 6, 8, 6); }
  }
  const url = c.toDataURL(); swatchCache.set(id, url); return url;
}

// ---------- icons ----------
const P = {
  place: 'M12 4v16M4 12h16', remove: 'M5 12h14', paint: 'M4 20l6-6M14 4l6 6-8 8-6-6z', pick: 'M15 4l5 5-9 9H6v-5z M13 6l5 5',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8', line: 'M5 19L19 5', select: 'M4 4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 8V4', stamp: 'M8 4h8v6l3 3v3H5v-3l3-3z M5 20h14',
  undo: 'M9 7L4 12l5 5 M4 12h11a5 5 0 010 10h-3', redo: 'M15 7l5 5-5 5 M20 12H9a5 5 0 000 10h3', mx: 'M12 3v18 M8 7l-4 5 4 5 M16 7l4 5-4 5', mz: 'M3 12h18 M7 8l5-4 5 4 M7 16l5 4 5-4',
  grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z', moon: 'M20 14A8 8 0 1110 4a6 6 0 0010 10z', rain: 'M7 15a5 5 0 115-8 4 4 0 116 5H7z M8 19l-1 2 M12 19l-1 2 M16 19l-1 2',
  photo: 'M4 7h4l2-3h4l2 3h4v12H4z M12 10a3.5 3.5 0 100 7 3.5 3.5 0 000-7z', help: 'M9 9a3 3 0 116 0c0 2-3 2-3 5 M12 18v.5', menu: 'M4 7h16M4 12h16M4 17h16', close: 'M6 6l12 12M18 6L6 18',
  walk: 'M13 4a2 2 0 100 4 2 2 0 000-4z M11 21l2-6-3-3 1-4 4 3h3 M8 13l-2 8', build: 'M4 20h16 M6 20V10l6-5 6 5v10 M10 20v-5h4v5', save: 'M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6',
};
const Icon = ({ n, s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>;
const TOOL_META = { place: ['Place', 'P'], remove: ['Remove', 'X'], paint: ['Paint', 'C'], pick: ['Pick', 'I'], box: ['Box', 'B'], line: ['Line', 'L'], select: ['Select', 'M'], stamp: ['Stamp', 'T'] };
const NEONS = [['neonpink', 'Pink'], ['neoncyan', 'Cyan'], ['neonred', 'Red'], ['neonamber', 'Amber'], ['neongreen', 'Green'], ['neonblue', 'Violet']];
const fmtHour = (h) => { const H = Math.floor(h), M = Math.floor((h - H) * 60); return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`; };

export default function Machi({ onExit }) {
  const stage = useRef(null), canvas = useRef(null), gref = useRef(null);
  const [, force] = useReducer((n) => n + 1, 0);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let g;
    try { g = new Game(canvas.current, stage.current, { onExit }); } catch (e) { setErr(e && e.message ? e.message : 'WebGL is not available'); return undefined; }
    gref.current = g;
    const un = g.subscribe(force);
    force();
    return () => { un(); g.dispose(); gref.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const g = gref.current;
  const ui = g ? g.ui : null;
  return (
    <div className={`machi ${ui ? `is-${ui.mode}` : ''} ${ui && ui.photo ? 'is-photo' : ''} ${g && g.touch ? 'is-touch' : ''}`} ref={stage}>
      <canvas className="machi__gl" ref={canvas} aria-label="MACHI voxel town. Build mode: click to place, right-click to remove, drag to orbit." tabIndex={0} />
      {err && <div className="m-error"><b>MACHI needs WebGL</b><p>{err}</p><button type="button" className="m-btn" onClick={onExit}>Back to the arcade</button></div>}
      {g && <Hud g={g} ui={ui} onExit={onExit} />}
    </div>
  );
}

function Hud({ g, ui, onExit }) {
  const walk = ui.mode === 'walk';
  if (ui.photo) return <PhotoPanel g={g} ui={ui} />;
  return (
    <>
      <header className="m-top">
        <div className="m-brand"><b>MACHI</b><span lang="ja">街</span></div>
        <div className="m-seg" role="group" aria-label="Mode">
          <button type="button" className={!walk ? 'on' : ''} aria-pressed={!walk} aria-label="Build" onClick={() => g.setMode('build')}><Icon n="build" s={16} /><span>Build</span></button>
          <button type="button" className={walk ? 'on' : ''} aria-pressed={walk} aria-label="Walk" onClick={() => g.setMode('walk')}><Icon n="walk" s={16} /><span>Walk</span></button>
        </div>
      </header>
      <nav className="m-actions" aria-label="Scene">
        <button type="button" className={`m-icon ${ui.panel === 'time' ? 'on' : ''}`} title="Time and weather" aria-label="Time and weather" onClick={() => g.set({ panel: ui.panel === 'time' ? null : 'time' })}><Icon n="moon" /><span className="m-icon__txt">{fmtHour(ui.hour)}</span></button>
        <button type="button" className="m-icon" title="Photo mode (O)" aria-label="Photo mode" onClick={() => g.set({ photo: true, panel: null })}><Icon n="photo" /></button>
        <button type="button" className={`m-icon ${ui.panel === 'help' ? 'on' : ''}`} title="Controls (?)" aria-label="Controls" onClick={() => g.set({ panel: ui.panel === 'help' ? null : 'help' })}><Icon n="help" /></button>
        <button type="button" className={`m-icon ${ui.panel === 'menu' ? 'on' : ''}`} title="Menu (Esc)" aria-label="Menu" onClick={() => g.set({ panel: ui.panel === 'menu' ? null : 'menu' })}><Icon n="menu" /></button>
      </nav>
      {!walk && <ToolRail g={g} ui={ui} />}
      {!walk && <ContextBar g={g} ui={ui} />}
      {(!walk || !g.touch) && <Hotbar g={g} ui={ui} />}
      {walk && <WalkHud g={g} ui={ui} />}
      <Coach g={g} ui={ui} />
      {!ui.panel && (ui.coach | 0) >= 3 && <RequestCard g={g} ui={ui} />}
      {ui.toast && <div className="m-toast" role="status">{ui.toast}</div>}
      {ui.panel === 'palette' && <Palette g={g} ui={ui} />}
      {ui.panel === 'help' && <Help g={g} />}
      {ui.panel === 'menu' && <Menu g={g} ui={ui} onExit={onExit} />}
      {ui.panel === 'time' && <TimePanel g={g} ui={ui} />}
    </>
  );
}

function ToolRail({ g, ui }) {
  const [more, setMore] = useState(false);
  const mirror = (k) => { const v = !ui[k]; g.editor[k] = v; g.set({ [k]: v }); };
  return (
    <aside className="m-tools" aria-label="Tools">
      <div className="m-tools__main">
        {TOOLS.map((t) => (
          <button key={t} type="button" className={`m-tool ${ui.tool === t ? 'on' : ''}`} aria-pressed={ui.tool === t} title={`${TOOL_META[t][0]} (${TOOL_META[t][1]})`} aria-label={TOOL_META[t][0]} onClick={() => g.setTool(t)}>
            <Icon n={t} /><span className="m-tool__lbl">{TOOL_META[t][0]}</span>
          </button>
        ))}
      </div>
      <div className="m-tools__util">
        <button type="button" className="m-tool" disabled={!ui.canUndo} title="Undo (Ctrl+Z)" aria-label="Undo" onClick={() => g.undo()}><Icon n="undo" /><span className="m-tool__lbl">Undo</span></button>
        <button type="button" className="m-tool" disabled={!ui.canRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo" onClick={() => g.redo()}><Icon n="redo" /><span className="m-tool__lbl">Redo</span></button>
        <button type="button" className={`m-tool m-desk ${ui.mirrorX ? 'on' : ''}`} aria-pressed={ui.mirrorX} title="Mirror X (Shift+X)" aria-label="Mirror X" onClick={() => mirror('mirrorX')}><Icon n="mx" /><span className="m-tool__lbl">Mirror X</span></button>
        <button type="button" className={`m-tool m-desk ${ui.mirrorZ ? 'on' : ''}`} aria-pressed={ui.mirrorZ} title="Mirror Z (Shift+Z)" aria-label="Mirror Z" onClick={() => mirror('mirrorZ')}><Icon n="mz" /><span className="m-tool__lbl">Mirror Z</span></button>
        <button type="button" className={`m-tool m-tool--pal ${ui.panel === 'palette' ? 'on' : ''}`} title="All blocks (E)" aria-label="All blocks" onClick={() => g.set({ panel: ui.panel === 'palette' ? null : 'palette' })}><Icon n="grid" /><span className="m-tool__lbl">Blocks</span></button>
        <button type="button" className={`m-tool m-phone ${more || ui.mirrorX || ui.mirrorZ ? 'on' : ''}`} aria-expanded={more} aria-label="More tools" onClick={() => setMore(!more)}><span className="m-tool__more">···</span></button>
      </div>
      {more && (
        <div className="m-more" role="group" aria-label="More tools">
          <button type="button" className={`m-btn m-btn--sm ${ui.mirrorX ? 'm-btn--signal' : ''}`} aria-pressed={ui.mirrorX} onClick={() => mirror('mirrorX')}><Icon n="mx" s={16} /> Mirror X</button>
          <button type="button" className={`m-btn m-btn--sm ${ui.mirrorZ ? 'm-btn--signal' : ''}`} aria-pressed={ui.mirrorZ} onClick={() => mirror('mirrorZ')}><Icon n="mz" s={16} /> Mirror Z</button>
        </div>
      )}
    </aside>
  );
}

function RequestCard({ g, ui }) {
  if (ui.mode === 'walk' && g.touch) return null;
  if (ui.reqDone) return (
    <section className="m-req m-req--done" role="status" aria-live="polite">
      <span className="m-req__seal" lang="ja" aria-hidden="true">済</span>
      <div><small>Request done</small><b>{ui.reqDone.title}</b><p>{ui.reqDone.reward}</p></div>
      <button type="button" className="m-btn m-btn--sm m-btn--signal" onClick={() => g.requestAction('next')}>Nice</button>
    </section>
  );
  const r = g.request; if (!r) return null;
  const p = Math.min(r.need || 1, ui.reqProgress || 0);
  if (!g.req.open) return <button type="button" className="m-req m-req--chip" onClick={() => g.requestAction('open')} aria-label={`Request: ${r.title}`}><i aria-hidden="true">!</i><span>{r.title}</span>{!r.photo && <b>{p}/{r.need}</b>}</button>;
  return (
    <section className="m-req" aria-label="Neighbourhood request">
      <small>Request · {r.who}</small>
      <b>{r.title}</b>
      <p>{r.text}</p>
      {!r.photo && <div className="m-req__bar" role="progressbar" aria-valuemin={0} aria-valuemax={r.need} aria-valuenow={p}><i style={{ width: `${(p / r.need) * 100}%` }} /><span>{p}/{r.need}</span></div>}
      <div className="m-req__btns">
        <button type="button" className="m-btn m-btn--sm" onClick={() => g.requestAction('show')}>Show me</button>
        <button type="button" className="m-btn m-btn--sm m-btn--ghost" onClick={() => g.requestAction('later')}>Later</button>
      </div>
    </section>
  );
}

function ContextBar({ g, ui }) {
  const t = ui.tool;
  if (['box', 'line'].includes(t)) return (
    <div className="m-ctx" role="toolbar" aria-label={`${t} options`}>
      <div className="m-seg m-seg--sm">
        <button type="button" className={ui.boxMode === 'fill' ? 'on' : ''} onClick={() => g.set({ boxMode: 'fill' })}>Fill</button>
        <button type="button" className={ui.boxMode === 'clear' ? 'on' : ''} onClick={() => g.set({ boxMode: 'clear' })}>Clear</button>
      </div>
      <span className="m-ctx__lbl">{t === 'line' ? 'Wall height' : 'Extra height'}</span>
      <button type="button" className="m-mini" aria-label="Lower" onClick={() => g.set({ boxH: Math.max(t === 'line' ? 0 : -30, ui.boxH - 1) })}>-</button>
      <b className="m-ctx__val">{t === 'line' ? ui.boxH + 1 : ui.boxH}</b>
      <button type="button" className="m-mini" aria-label="Raise" onClick={() => g.set({ boxH: Math.min(40, ui.boxH + 1) })}>+</button>
      <span className="m-ctx__hint">{g.touch ? (g.pendingCorner ? 'Tap the second corner' : 'Tap two corners') : 'Drag on the scene. Wheel while dragging sets height'}</span>
    </div>
  );
  if (t === 'select') return (
    <div className="m-ctx" role="toolbar" aria-label="Selection">
      {ui.selection ? (<>
        <button type="button" className="m-btn m-btn--sm" onClick={() => g.copySelection()}>Copy as stamp</button>
        <button type="button" className="m-btn m-btn--sm" onClick={() => g.fillSelection()}>Fill</button>
        <button type="button" className="m-btn m-btn--sm" onClick={() => g.clearSelection()}>Clear</button>
        <button type="button" className="m-btn m-btn--sm m-btn--ghost" onClick={() => { g.set({ selection: null }); g.renderer.setGhost(null); }}>Cancel</button>
      </>) : <span className="m-ctx__hint">{g.touch ? 'Tap two corners to select' : 'Drag across the scene to select a region'}</span>}
    </div>
  );
  if (t === 'stamp') return <StampBar g={g} ui={ui} />;
  return null;
}

function StampBar({ g, ui }) {
  const [tab, setTab] = useState(ui.stamp && ui.stamp.letter ? (/[A-Z0-9]/.test(ui.stamp.name) ? 'latin' : 'kana') : 'objects');
  const [txt, setTxt] = useState('');
  const [neon, setNeon] = useState('neonpink');
  const neons = NEONS.filter(([k]) => !(g.lockedNeon || []).includes(k));
  const pickLetter = (ch, col = neon) => { setTxt(ch); g.letter(ch, col); };
  return (
    <div className="m-ctx m-ctx--stamp" role="toolbar" aria-label="Stamps">
      <div className="m-tabs" role="tablist">
        {[['objects', 'Objects'], ['kana', 'Kana'], ['latin', 'Latin']].map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{n}</button>)}
        <button type="button" className="m-mini" aria-label="Rotate stamp (R)" title="Rotate (R)" onClick={() => g.set({ stampRot: (ui.stampRot + 1) % 4 })}>⟳</button>
      </div>
      {tab === 'objects' && (
        <div className="m-chips">
          {g.stamps.map((s) => <button key={s.name} type="button" className={`m-chip ${ui.stamp === s ? 'on' : ''}`} onClick={() => g.setStamp(s)}>{s.name}</button>)}
          {g.clipboard && <button type="button" className={`m-chip ${ui.stamp === g.clipboard ? 'on' : ''}`} onClick={() => g.setStamp(g.clipboard)}>Clipboard</button>}
        </div>
      )}
      {tab !== 'objects' && (
        <div className="m-letters">
          {tab === 'latin' && <input id="m-letter" className="m-input" value={txt} maxLength={2} placeholder="Type a letter or digit" aria-label="Sign letter" onChange={(e) => { const ch = e.target.value.slice(-1).toUpperCase(); if (/[A-Z0-9!]/.test(ch)) pickLetter(ch); else setTxt(''); }} />}
          <select className="m-input" aria-label="Neon colour" value={neon} onChange={(e) => { setNeon(e.target.value); if (txt) g.letter(txt, e.target.value); }}>{neons.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          {tab === 'kana' && <div className="m-kana" aria-label="Katakana">{KANA.map((k) => <button key={k} type="button" lang="ja" className={`m-kana__k ${txt === k ? 'on' : ''}`} onClick={() => pickLetter(k)}>{k}</button>)}</div>}
          {g.lockedNeon && g.lockedNeon.length > 0 && <span className="m-ctx__hint">More neon colours unlock with requests</span>}
        </div>
      )}
    </div>
  );
}

function Hotbar({ g, ui }) {
  return (
    <div className="m-hotbar" role="toolbar" aria-label="Hotbar">
      {ui.hotbar.map((id, i) => (
        <button key={i} type="button" className={`m-slot ${ui.slot === i ? 'on' : ''}`} aria-pressed={ui.slot === i} title={`${BLOCKS[id].name} (${i + 1})`} aria-label={`${BLOCKS[id].name}, slot ${i + 1}`}
          onClick={() => { if (ui.slot === i && !g.touch) g.set({ panel: 'palette' }); else g.set({ slot: i }); }}>
          <img src={swatch(id)} alt="" draggable="false" /><i>{i + 1}</i>
        </button>
      ))}
      <span className="m-hotbar__name">{BLOCKS[ui.hotbar[ui.slot]].name}</span>
    </div>
  );
}

function Palette({ g, ui }) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const out = new Map();
    for (const id of PALETTE_ORDER) { const b = BLOCKS[id]; if (q && !(`${b.name} ${b.group} ${b.key}`.toLowerCase().includes(q.toLowerCase()))) continue; if (!out.has(b.group)) out.set(b.group, []); out.get(b.group).push(b); }
    return [...out.entries()];
  }, [q]);
  const choose = (id) => { const hb = ui.hotbar.slice(); const ex = hb.indexOf(id); if (ex >= 0) g.set({ slot: ex }); else { hb[ui.slot] = id; try { localStorage.setItem('nc2:machi:hotbar', JSON.stringify(hb)); } catch { /* storage blocked */ } g.set({ hotbar: hb }); } if (g.touch) g.set({ panel: null }); };
  return (
    <section className="m-panel m-palette" aria-label="All blocks">
      <div className="m-panel__head">
        <input className="m-input m-search" autoFocus={!g.touch} placeholder="Search blocks" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search blocks"
          onKeyDown={(e) => { if (e.key === 'Escape' || ((e.key === 'e' || e.key === 'E') && !q)) { e.preventDefault(); e.stopPropagation(); g.closePanel(); } }} />
        <span className="m-panel__note">Picks go into slot {ui.slot + 1}</span>
        <button type="button" className="m-icon" aria-label="Close" onClick={() => g.closePanel()}><Icon n="close" /></button>
      </div>
      <div className="m-palette__body">
        {groups.map(([grp, bs]) => (
          <div key={grp} className="m-palette__grp"><h3>{grp}</h3>
            <div className="m-palette__grid">{bs.map((b) => <button key={b.id} type="button" className={`m-pal ${ui.hotbar[ui.slot] === b.id ? 'on' : ''}`} onClick={() => choose(b.id)} title={b.name}><img src={swatch(b.id)} alt="" /><span>{b.name}</span></button>)}</div>
          </div>
        ))}
        {!groups.length && <p className="m-panel__note">No block matches that.</p>}
      </div>
    </section>
  );
}

function TimePanel({ g, ui }) {
  return (
    <section className="m-panel m-pop" aria-label="Time and weather">
      <label className="m-row"><span>Time <b>{fmtHour(ui.hour)}</b></span>
        <input type="range" min="0" max="23.99" step="0.05" value={ui.hour} onChange={(e) => g.set({ hour: +e.target.value, drift: false, cycle: false })} aria-label="Time of day" /></label>
      <div className="m-row m-row--btns">
        {[['Dawn', 5.6], ['Noon', 12.5], ['Dusk', 18.4], ['Blue hour', 19.0], ['Night', 22]].map(([n, h]) => <button key={n} type="button" className="m-chip" onClick={() => g.set({ hour: h, drift: false, cycle: false })}>{n}</button>)}
      </div>
      <label className="m-check"><input type="checkbox" checked={ui.cycle} onChange={(e) => g.set({ cycle: e.target.checked, drift: false })} /> Day and night cycle</label>
      <label className="m-check"><input type="checkbox" checked={ui.rain} onChange={(e) => g.set({ rain: e.target.checked })} /> Rain</label>
    </section>
  );
}

function Help({ g }) {
  const rows = g.touch ? [
    ['Tap a face', 'Use the tool (place by default)'], ['Long-press', 'Remove a block'], ['One-finger drag', 'Orbit'], ['Two fingers', 'Pan and pinch to zoom'],
    ['Box, Line, Select', 'Tap two corners'], ['Walk', 'Left stick moves, drag right side to look'], ['Jump twice', 'Fly on or off'],
  ] : [
    ['Click', 'Use the tool (place by default)'], ['Right-click', 'Remove a block'], ['Middle-click', 'Pick the block under the cursor'], ['Left-drag', 'Orbit'], ['Right or Shift-drag', 'Pan'], ['Wheel', 'Zoom'],
    ['WASD / arrows', 'Move and turn the camera'], ['1 to 9, Alt+wheel', 'Choose a block'], ['E', 'All blocks'], ['P X C I B L M T', 'Place, Remove, Paint, Pick, Box, Line, Select, Stamp'],
    ['Wheel while dragging', 'Box or wall height'], ['F', 'Box: fill or clear'], ['R', 'Rotate stamp'], ['Shift+X / Shift+Z', 'Mirror'], ['Ctrl+Z, Ctrl+Shift+Z', 'Undo, redo'], ['Ctrl+C, Ctrl+V, Delete', 'Copy, paste, clear a selection'],
    ['Tab', 'Walk or build'], ['Walk: WASD, Space, Shift', 'Move, jump, sprint. Jump twice to fly, C to go down'], ['Walk: left / right click', 'Place / remove at the crosshair'], ['O', 'Photo mode'], ['Esc', 'Menu'],
  ];
  return (
    <section className="m-panel m-help" role="dialog" aria-label="Controls">
      <div className="m-panel__head"><h2>Controls</h2><button type="button" className="m-icon" aria-label="Close" onClick={() => g.closePanel()}><Icon n="close" /></button></div>
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <p className="m-panel__note">Your town saves itself in this browser. Signs, shops and street names here are invented.</p>
    </section>
  );
}

function Menu({ g, ui, onExit }) {
  const [names, setNames] = useState({});
  const s = g.settings;
  const fileRef = useRef(null);
  const exportFile = () => { const blob = new Blob([g.exportJSON()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'machi-town.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const importFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 4 * 1024 * 1024) { g.toast('File too large (4 MB max)'); return; } const r = new FileReader(); r.onload = () => { g.importJSON(String(r.result)); g.set({ panel: null }); }; r.readAsText(f); e.target.value = ''; };
  return (
    <section className="m-panel m-menu" role="dialog" aria-label="Menu">
      <div className="m-panel__head"><h2>Menu</h2><button type="button" className="m-icon" aria-label="Close" onClick={() => g.closePanel()}><Icon n="close" /></button></div>
      <h3>Saves</h3>
      <ul className="m-slots">
        {g.slots().map((sl) => (
          <li key={sl.i}>
            <input className="m-input" aria-label={`Name for slot ${sl.i}`} placeholder={`Slot ${sl.i}`} value={names[sl.i] ?? (sl.empty ? '' : sl.name)} onChange={(e) => setNames({ ...names, [sl.i]: e.target.value })} />
            <button type="button" className="m-btn m-btn--sm" onClick={() => g.saveSlot(sl.i, names[sl.i] || (sl.empty ? `Slot ${sl.i}` : sl.name))}>Save</button>
            <button type="button" className="m-btn m-btn--sm" disabled={sl.empty} onClick={() => { g.loadSlot(sl.i); g.set({ panel: null }); }}>Load</button>
          </li>
        ))}
      </ul>
      <div className="m-row m-row--btns">
        <button type="button" className="m-btn m-btn--sm" onClick={exportFile}>Export file</button>
        <button type="button" className="m-btn m-btn--sm" onClick={() => fileRef.current && fileRef.current.click()}>Import file</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importFile} />
      </div>
      <h3>New world</h3>
      <div className="m-row m-row--btns">
        {Object.entries(TEMPLATES).map(([k, t]) => <button key={k} type="button" className={`m-btn m-btn--sm ${k === 'tokyo' ? 'm-btn--signal' : ''}`} onClick={() => { if (window.confirm(k === 'tokyo' ? 'Reset to the Tokyo corner? Unsaved changes are lost (save to a slot first).' : `Start a new ${t.name.toLowerCase()}? Unsaved changes are lost.`)) { g.newWorld(k); g.set({ panel: null }); } }}>{k === 'tokyo' ? 'Reset to Tokyo' : t.name}</button>)}
      </div>
      <h3>Settings</h3>
      <div className="m-row"><span>Quality</span>
        <div className="m-seg m-seg--sm">{['auto', 'low', 'balanced', 'high'].map((q) => <button key={q} type="button" className={s.quality === q ? 'on' : ''} onClick={() => g.saveSettings({ quality: q })}>{q === 'auto' ? `Auto (${ui.quality})` : q[0].toUpperCase() + q.slice(1)}</button>)}</div>
      </div>
      <label className="m-check"><input type="checkbox" checked={!g.req.off} onChange={(e) => g.requestAction(e.target.checked ? 'on' : 'off')} /> Neighbourhood requests ({g.req.done.length}/5 done)</label>
      <label className="m-check"><input type="checkbox" checked={s.sound} onChange={(e) => g.saveSettings({ sound: e.target.checked })} /> Sound</label>
      <label className="m-check"><input type="checkbox" checked={s.invertY} onChange={(e) => g.saveSettings({ invertY: e.target.checked })} /> Invert look</label>
      <label className="m-check"><input type="checkbox" checked={s.tilt} onChange={(e) => g.saveSettings({ tilt: e.target.checked })} /> Miniature focus in build view</label>
      <label className="m-row"><span>Look sensitivity</span><input type="range" min="0.3" max="2.5" step="0.05" value={s.sens} onChange={(e) => g.saveSettings({ sens: +e.target.value })} aria-label="Look sensitivity" /></label>
      <button type="button" className="m-btn m-btn--exit" onClick={() => { g.autosave(); onExit && onExit(); }}>Exit to arcade</button>
    </section>
  );
}

function Coach({ g, ui }) {
  const step = ui.coach | 0;
  if (step >= 3 || ui.panel || (ui.mode === 'build' && !['place', 'remove'].includes(ui.tool))) return null;
  const T = g.touch, W = ui.mode === 'walk';
  const msg = W
    ? [T ? 'Tap + to place a block' : 'Left-click to place a block', T ? 'Tap − to remove a block' : 'Right-click to remove a block', ''][step]
    : [T ? 'Tap any face to place a block' : 'Click any face to place a block', T ? 'Long-press a block to remove it' : 'Right-click a block to remove it', T ? 'Now tap Walk and stroll the street' : 'Press Tab to walk the street'][step];
  if (!msg) return null;
  return (
    <div className="m-coach" role="status">
      <span className="m-coach__n">{step + 1}/3</span><span>{msg}</span>
      <button type="button" className="m-coach__skip" onClick={() => g.skipCoach()}>Skip</button>
    </div>
  );
}

function WalkHud({ g, ui }) {
  const stickRef = useRef(null);
  const [knob, setKnob] = useState([0, 0]);
  const stickDown = (e) => {
    const el = stickRef.current; if (!el) return; el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
    const mv = (ev) => { let x = (ev.clientX - cx) / R, y = (ev.clientY - cy) / R; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } g.stick = { x, y }; setKnob([x * R * 0.6, y * R * 0.6]); };
    const up = () => { g.stick = null; setKnob([0, 0]); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); mv(e);
  };
  const lookDown = (e) => { g.lookId = e.pointerId; g._touchDown(e, e.clientX, e.clientY); };
  const hb = ui.hotbar, id = hb[ui.slot];
  return (
    <>
      <div className="m-cross" aria-hidden="true" />
      {!g.touch && !ui.locked && !ui.panel && <button type="button" className="m-lockhint" onClick={() => g.requestLock()}>Click to look around<small>WASD to move · Space to jump · Tab to build</small></button>}
      {g.touch && (<>
        <div className="m-look" onPointerDown={lookDown} />
        <div className="m-stick" ref={stickRef} onPointerDown={stickDown} aria-label="Move"><i style={{ transform: `translate(${knob[0]}px, ${knob[1]}px)` }} /></div>
        <div className="m-wbtns">
          <button type="button" className="m-wbtn" aria-label="Remove block" onPointerDown={(e) => { e.preventDefault(); g.applyTool('remove', g.pick()); }}><Icon n="remove" /></button>
          <button type="button" className="m-wbtn m-wbtn--place" aria-label="Place block" onPointerDown={(e) => { e.preventDefault(); g.applyTool('place', g.pick()); }}><Icon n="place" /></button>
          <button type="button" className="m-wbtn m-wbtn--jump" aria-label="Jump (twice to fly)" onPointerDown={(e) => { e.preventDefault(); g._jumpPressed = true; g.touchJump = true; }} onPointerUp={() => { g.touchJump = false; }} onPointerCancel={() => { g.touchJump = false; }}>Jump</button>
        </div>
        <button type="button" className="m-wblock" aria-label={`Block: ${BLOCKS[id].name}. Tap for next`} onClick={() => g.set({ slot: (ui.slot + 1) % hb.length })}><img src={swatch(id)} alt="" /><span>{BLOCKS[id].name}</span></button>
      </>)}
    </>
  );
}

function PhotoPanel({ g, ui }) {
  const save = () => { const url = g.renderer.screenshot({ tilt: ui.tilt, focus: 0.55, bloom: 0.8, vignette: 0.4 }); const a = document.createElement('a'); a.href = url; a.download = `machi-${fmtHour(ui.hour).replace(':', '')}.png`; a.click(); g.onPhoto(); };
  return (
    <section className="m-photo" aria-label="Photo mode">
      <label className="m-row"><span>Time <b>{fmtHour(ui.hour)}</b></span><input type="range" min="0" max="23.99" step="0.05" value={ui.hour} onChange={(e) => g.set({ hour: +e.target.value, drift: false, cycle: false })} aria-label="Time of day" /></label>
      <label className="m-row"><span>Lens <b>{ui.fov}°</b></span><input type="range" min="20" max="100" step="1" value={ui.fov} onChange={(e) => g.set({ fov: +e.target.value })} aria-label="Field of view" /></label>
      <label className="m-row"><span>Miniature</span><input type="range" min="0" max="1" step="0.05" value={ui.tilt} onChange={(e) => g.set({ tilt: +e.target.value })} aria-label="Tilt-shift strength" /></label>
      <div className="m-row m-row--btns">
        <button type="button" className="m-btn m-btn--signal" onClick={save}><Icon n="save" s={16} /> Save PNG</button>
        <button type="button" className="m-btn" onClick={() => g.set({ photo: false })}>Done</button>
      </div>
    </section>
  );
}
