import Nav from '../components/Nav.jsx';
import Cabinets from '../components/Cabinets.jsx';
import useReveal from '../lib/useReveal.js';
import { GAMES } from '../games/registry.js';

const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

// The arcade floor: one cabinet per game.
export default function Arcade() {
  useReveal();
  return (
    <main className="arcade">
      <Nav />
      <header className="arcade__head">
        <p className="hud-label">// BASEMENT LEVEL · ゲームセンター</p>
        <h1 className="arcade__title">ARCADE</h1>
        <p className="arcade__lede">
          {COUNT[GAMES.length] || GAMES.length} games, all original, all built for this site. They run in the browser
          with nothing to install: keyboard on a laptop, touch on a phone. Each one downloads only when you open it.
        </p>
      </header>
      <Cabinets />
      <p className="arcade__note">REDLINE runs on the real Shuto Expressway C1 loop. Map data © OpenStreetMap contributors.</p>
    </main>
  );
}
