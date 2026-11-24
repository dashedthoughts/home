import { Link } from 'react-router-dom';
import { GAMES } from '../games/registry.js';

// One cabinet per game. The screen shows a real capture of the game (media/arcade/<id>.jpg);
// if that file is missing the kanji tile underneath is the whole screen.
export default function Cabinets({ compact = false }) {
  return (
    <div className={`cabs${compact ? ' cabs--row' : ''}`}>
      {GAMES.map((g, i) => (
        <Link key={g.id} to={g.route || `/arcade/${g.id}`} className={`cab${i === 0 && !compact ? ' cab--lead' : ''} reveal`} style={{ '--accent': g.accent, '--i': i }}>
          <span className="cab__screen" aria-hidden="true">
            <i>{g.jp}</i>
            <img src={`media/arcade/${g.id}.jpg`} alt="" loading="lazy" decoding="async" onError={(e) => e.currentTarget.remove()} />
            <span className="cab__no">{String(i + 1).padStart(2, '0')}</span>
          </span>
          <span className="cab__body">
            <span className="cab__genre">{g.genre}<em>{g.jp}</em></span>
            <b className="cab__title">{g.title}</b>
            <span className="cab__tag">{g.tagline}</span>
            <span className="cab__foot"><span>{g.meta}</span><span className="cab__go">PLAY ▸</span></span>
          </span>
        </Link>
      ))}
    </div>
  );
}
