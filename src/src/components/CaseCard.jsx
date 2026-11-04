import { Link } from 'react-router-dom';
import { caseStudies, ROOT } from '../data/content.js';

// Each file gets its own colour field (a swatch, not a brand colour), like a record sleeve.
const SWATCH = {
  reelationships: '#ff5a36', 'makemytrip-maps': '#2f6bff', 'tathya-dpi': '#13a46e', 'netflix-remixed': '#b3122a',
  'spotify-remixed': '#1f9d55', 'nothing-frame': '#6b7280', 'zepto-teardown': '#7b2ff7', 'zerodha-teardown': '#ff7a1a',
  ferrari: '#e8b100', 'finance-chatbot': '#0aa5a0',
};

// project artwork that should front a tile instead of the deck's first page
const COVERS = { reelationships: 'cases/reelationships/cover.jpg' };

function inside(slug) {
  const body = caseStudies[slug] || [];
  const decks = body.filter((b) => b[0] === 'deck').map((b) => b[1]);
  const pages = decks.reduce((n, d) => n + d.pages, 0);
  const live = body.some((b) => b[0] === 'embed');
  const video = body.some((b) => b[0] === 'video');
  const d = decks[0];
  const own = COVERS[slug];
  const cover = own ? { src: ROOT + own, tall: false, full: true } : d ? { src: `${ROOT}${d.dir}/${d.files[0]}-800.jpg`, tall: d.ratio < 0.95 } : null;
  const parts = [pages ? `${pages}-page deck${decks.length > 1 ? 's' : ''}` : null, live ? 'live prototype' : null, video ? 'demo' : null].filter(Boolean);
  return { cover, label: parts.join(' · ') };
}

// Case card: a colour field, the deck's own cover set at an angle, and big editorial type.
export default function CaseCard({ p, fileNo }) {
  const { cover, label } = inside(p.slug);
  return (
    <Link to={`/p/${p.slug}`} className="tile reveal" style={{ '--c': SWATCH[p.slug] || '#ff5a36' }}>
      <span className="tile__field" aria-hidden="true">
        <span className="tile__no">{String(fileNo).padStart(2, '0')}</span>
        {cover && <img className={`tile__cover ${cover.tall ? 'is-tall' : ''} ${cover.full ? 'is-full' : ''}`} src={cover.src} alt="" loading="lazy" decoding="async" />}
        {(p.brand || p.brandUrl) && (
          <img className="tile__brand" src={p.brandUrl || `https://cdn.simpleicons.org/${p.brand}/ffffff`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
      </span>
      <span className="tile__body">
        <h3 className="tile__title">{p.title}</h3>
        <span className="tile__tagline">{p.tagline}</span>
        {label && <span className="tile__meta">{label}<i aria-hidden="true">→</i></span>}
      </span>
    </Link>
  );
}
