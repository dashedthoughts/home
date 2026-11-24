import { Suspense, lazy, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { gameById } from '../games/registry.js';

// Full-screen host for one arcade game. The game owns everything inside .gamehost__stage.
export default function GameHost() {
  const { id } = useParams();
  const nav = useNavigate();
  const g = gameById(id);
  const Game = useMemo(() => (g && g.load ? lazy(g.load) : null), [g]);
  useEffect(() => {
    document.documentElement.classList.add('is-gaming');
    const t = document.title;
    if (g) document.title = `${g.title} · Arcade · Anuraag Dash`;
    return () => { document.documentElement.classList.remove('is-gaming'); document.title = t; };
  }, [g]);
  if (!g || !Game) return (
    <main className="gamehost"><div className="gamehost__missing"><p className="hud-label">// NO SUCH CABINET</p><Link className="btn btn--signal" to="/arcade">← ARCADE</Link></div></main>
  );
  return (
    <main className="gamehost" style={{ '--accent': g.accent }}>
      <div className="gamehost__stage">
        <Suspense fallback={<div className="gamehost__loading"><b>{g.title}</b><span>{g.jp} · loading</span></div>}>
          <Game onExit={() => nav('/arcade')} />
        </Suspense>
      </div>
    </main>
  );
}
