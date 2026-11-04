import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import GlitchText from '../components/GlitchText.jsx';
import { Caption, Scribble, Strip, SFX, Halftone } from '../components/Comic.jsx';
import { projects, caseStudies, ROOT } from '../data/content.js';
import { getDecrypted } from '../lib/store.js';

const pad = (n) => String(n).padStart(2, '0');
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

function Rich({ segs }) {
  return segs.map((s, i) => {
    const node = s.b ? <b>{s.t}</b> : s.t;
    return s.a ? <a key={i} href={s.a} target="_blank" rel="noreferrer">{node}</a> : <span key={i}>{node}</span>;
  });
}

// Split the imported body into the file column (text) and the stage (decks, prototypes, video).
function shape(body) {
  const notes = [], items = [];
  let pending = null;
  for (const b of body) {
    if (b[0] === 'h') pending = b[1];
    else if (b[0] === 'p') notes.push(b[1]);
    else {
      const label = pending || (b[0] === 'deck' ? b[1].label : b[0] === 'embed' ? 'Live prototype' : 'Demo video');
      items.push({ kind: b[0], data: b[1], label });
      pending = null;
    }
  }
  return { notes, items };
}

function DeckStage({ d }) {
  const [i, setI] = useState(0);
  const stage = useRef(null);
  const strip = useRef(null);
  const start = useRef(null);
  const n = d.files.length;
  const src = (k, w) => `${ROOT}${d.dir}/${d.files[k]}${w === 800 ? '-800' : ''}.jpg`;
  const go = useCallback((k) => setI((cur) => Math.max(0, Math.min(n - 1, typeof k === 'function' ? k(cur) : k))), [n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go((c) => c + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go((c) => c - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);
  useEffect(() => {
    // keep the active thumbnail in view, preload the neighbours
    strip.current?.children[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    [i + 1, i - 1].filter((k) => k >= 0 && k < n).forEach((k) => { const im = new Image(); im.src = src(k, 1600); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const full = () => {
    const el = stage.current;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="deckstage" ref={stage}>
      <div
        className={`deckstage__view ${d.ratio < 0.95 ? 'is-tall' : ''}`}
        style={{ '--ratio': d.ratio }}
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current == null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go((c) => c + (dx < 0 ? 1 : -1));
        }}
      >
        <img
          key={i}
          src={src(i, 800)}
          srcSet={`${src(i, 800)} 800w, ${src(i, 1600)} 1600w`}
          sizes="(max-width: 1000px) 100vw, 62vw"
          alt={`${d.label}, page ${i + 1} of ${n}`}
          draggable="false"
        />
      </div>
      <button type="button" className="deckstage__nav deckstage__nav--prev" onClick={() => go((c) => c - 1)} disabled={i === 0} aria-label="Previous page">‹</button>
      <button type="button" className="deckstage__nav deckstage__nav--next" onClick={() => go((c) => c + 1)} disabled={i === n - 1} aria-label="Next page">›</button>
      <div className="deckstage__bar">
        <span className="deckstage__count" aria-live="polite">{pad(i + 1)} <i>/ {pad(n)}</i></span>
        <ol className="deckstage__thumbs" ref={strip}>
          {d.files.map((f, k) => (
            <li key={f}>
              <button type="button" className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={`Page ${k + 1}`} aria-current={k === i ? 'true' : undefined}>
                <img src={src(k, 800)} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ol>
        <span className="deckstage__tools">
          <button type="button" onClick={full} aria-label="Full screen">⤢</button>
          <a href={ROOT + d.pdf} download aria-label={`Download PDF, ${d.mb} MB`}>PDF ↓</a>
        </span>
      </div>
    </div>
  );
}

function EmbedStage({ url, title }) {
  return (
    <div className="embedstage">
      <span className="embedstage__chrome" aria-hidden="true"><i /><i /><i /><em>{host(url)}</em></span>
      <iframe src={url} title={`${title}: live prototype`} loading="lazy" allow="fullscreen" />
      <a className="embedstage__open" href={url} target="_blank" rel="noreferrer">OPEN IN A NEW TAB ↗</a>
    </div>
  );
}

function VideoStage({ v }) {
  return (
    <div className="videostage">
      <video src={ROOT + v.src} poster={ROOT + v.poster} controls playsInline preload="none" />
    </div>
  );
}

export default function Project() {
  const { slug } = useParams();
  const idx = projects.findIndex((p) => p.slug === slug);
  const p = projects[idx];
  const { notes, items } = useMemo(() => shape(caseStudies[slug] || []), [slug]);
  const [tab, setTab] = useState(0);
  useEffect(() => setTab(0), [slug]);

  if (!p)
    return (
      <main className="project">
        <Nav />
        <p className="hud-label">// ERROR 404</p>
        <GlitchText as="h1" text="NO FILE HERE" className="project__title" />
        <Link className="btn btn--signal" to="/">← GO HOME</Link>
      </main>
    );

  const decrypted = getDecrypted().has(slug);
  const next = projects[(idx + 1) % projects.length];
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const item = items[tab];

  return (
    <main className="cf" key={slug}>
      <Nav />
      <div className="cf__grid">
        <aside className="cf__file">
          <div className="cf__panel">
            <Halftone corner="br" cols={22} rows={14} />
            <Strip tone="signal" className="strip--cap" />
            <SFX word={`${p.sticker}!`} />
            <Link className="cf__back" to="/#work">← ALL CASE FILES</Link>
            <Caption>FILE {pad(idx + 1)} · {p.category}</Caption>
            <h1 className="cf__title plates">{p.title}</h1>
            <p className="cf__tagline">{p.tagline}</p>
            {p.collaborators.length > 0 && <p className="cf__collab">Built with {p.collaborators.join(', ')}</p>}
            {notes.map((n, i) => <p className="cf__note" key={i}><Rich segs={n} /></p>)}
            <Scribble>
              <span className="tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</span>
            </Scribble>
            <p className="cf__status">{decrypted ? '● Decrypted in REDLINE' : '○ Sealed in REDLINE, open to read'}</p>
          </div>
          <nav className="cf__pager" aria-label="More case files">
            <Link to={`/p/${prev.slug}`}><span>‹ PREV</span><b>{prev.title}</b></Link>
            <Link to={`/p/${next.slug}`}><span>NEXT ›</span><b>{next.title}</b></Link>
          </nav>
        </aside>

        <section className="cf__stage" aria-label="The work">
          {items.length > 1 && (
            <div className="cf__tabs" role="tablist">
              {items.map((it, i) => (
                <button key={i} role="tab" type="button" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>
                  <i>{it.kind === 'deck' ? `${it.data.pages}P DECK` : it.kind === 'embed' ? 'LIVE' : 'VIDEO'}</i>
                  {it.label}
                </button>
              ))}
            </div>
          )}
          {items.length === 1 && <p className="cf__single"><i>{item.kind === 'deck' ? `${item.data.pages}-PAGE DECK` : 'LIVE'}</i> {item.label}</p>}
          <div className="cf__screen" role="tabpanel">
            {item?.kind === 'deck' && <DeckStage d={item.data} key={`${slug}-${tab}`} />}
            {item?.kind === 'embed' && <EmbedStage url={item.data} title={p.title} key={`${slug}-${tab}`} />}
            {item?.kind === 'video' && <VideoStage v={item.data} key={`${slug}-${tab}`} />}
          </div>
        </section>
      </div>
    </main>
  );
}
