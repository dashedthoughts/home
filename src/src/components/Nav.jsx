import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RESUME, LINKEDIN } from '../data/content.js';
import { getMood, setMood } from '../lib/store.js';
import Logo from './Logo.jsx';

const LINKS = [
  { href: '#work', label: 'CASE FILES' },
  { href: '#memes', label: 'MEMES' },
  { href: '#photos', label: 'PHOTOS' },
  { href: '#contact', label: 'CONTACT' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  const [mood, setM] = useState(getMood());

  const jump = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const toggleMood = () => {
    const next = mood === 'street' ? 'outrun' : 'street';
    document.documentElement.dataset.mood = next;
    setMood(next);
    setM(next);
    window.dispatchEvent(new CustomEvent('nc2:mood', { detail: next }));
  };

  return (
    <nav className="nav" aria-label="Main">
      <Link to="/" className="nav__brand" aria-label="Anuraag Dash, home">
        <Logo size={38} />
        <span className="nav__word">
          <b>ANURAAG DASH</b>
          <i>● ONLINE · NIGHT BUILD</i>
        </span>
      </Link>
      <div className="nav__links">
        {home ? (
          LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => jump(e, l.href)}>
              {l.label}
            </a>
          ))
        ) : (
          <Link to="/">← HOME</Link>
        )}
        <Link to="/play" className="nav__play">
          REDLINE ▸
        </Link>
        <a href={RESUME} target="_blank" rel="noreferrer" className="nav__ext">
          RESUME
        </a>
        <a href={LINKEDIN} target="_blank" rel="noreferrer" className="nav__ext">
          LINKEDIN
        </a>
      </div>
      <button
          type="button"
          className="nav__mood"
          onClick={toggleMood}
          aria-pressed={mood === 'outrun'}
          title="Switch mood: Street (Midnight Tokyo) or Outrun (sunset synthwave)"
        >
          MOOD: {mood.toUpperCase()}
        </button>
    </nav>
  );
}
