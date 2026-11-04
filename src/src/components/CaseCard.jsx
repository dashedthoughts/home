import { Link } from 'react-router-dom';
import { caseStudies, ROOT } from '../data/content.js';

// What's inside a case file, from its imported body.
function inside(slug) {
  const body = caseStudies[slug] || [];
  const decks = body.filter((b) => b[0] === 'deck').map((b) => b[1]);
  const pages = decks.reduce((n, d) => n + d.pages, 0);
  const live = body.some((b) => b[0] === 'embed');
  const video = body.some((b) => b[0] === 'video');
  const thumbs = [];
  for (const d of decks) for (const f of d.files) if (thumbs.length < 8) thumbs.push({ src: `${ROOT}${d.dir}/${f}-800.jpg`, ratio: d.ratio });
  const parts = [pages ? `${pages}-page deck${decks.length > 1 ? 's' : ''}` : null, live ? 'live prototype' : null, video ? 'demo' : null].filter(Boolean);
  return { thumbs, label: parts.join(' · ') };
}

// Case-file card: cut corners, HUD header row, a filmstrip of the actual deck, price-tag tags.
export default function CaseCard({ p, fileNo, decrypted }) {
  const { thumbs, label } = inside(p.slug);
  const loop = thumbs.length ? [...thumbs, ...thumbs] : [];
  return (
    <Link to={`/p/${p.slug}`} className={`case reveal ${decrypted ? 'is-decrypted' : ''}`} style={{ '--i': fileNo % 4 }}>
      <span className="case__frame">
        <span className="case__hud">
          <span>FILE {String(fileNo).padStart(2, '0')}</span>
          <span>{p.sticker}</span>
          <span className={decrypted ? 'case__state ok' : 'case__state'}>{decrypted ? '● DECRYPTED' : '○ SEALED'}</span>
        </span>
        {(p.brand || p.brandUrl) && (
          <img
            className="case__brand"
            src={p.brandUrl || `https://cdn.simpleicons.org/${p.brand}`}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h3 className="case__title">{p.title}</h3>
        <p className="case__tagline">{p.tagline}</p>
        {loop.length > 0 && (
          <span className="case__strip" aria-hidden="true">
            <span className="case__strip-track" style={{ '--n': thumbs.length }}>
              {loop.map((t, i) => (
                <img key={i} src={t.src} alt="" loading="lazy" decoding="async" style={{ aspectRatio: String(Math.max(0.7, t.ratio)) }} />
              ))}
            </span>
          </span>
        )}
        {label && <span className="case__inside">INSIDE · {label}</span>}
        <span className="tags">
          {p.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </span>
        <span className="case__open" aria-hidden="true">OPEN ›</span>
      </span>
    </Link>
  );
}
