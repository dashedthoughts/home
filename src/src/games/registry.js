// The arcade. Each game is its own lazy chunk: nothing here downloads until someone opens it.
// A game module default-exports a React component: ({ onExit }) => JSX, filling its parent (.gamehost__stage).
// To take a cabinet off the floor without deleting it, set hidden: true.
const ALL = [
  { id: 'redline', route: '/play', title: 'REDLINE', jp: '首都高', genre: 'Night racing', meta: 'Race · Road Rash · Zen · Free run', tagline: 'Midnight expressway, ten case files to open, a rival, the police, and the rain.', accent: '#fcee0a' },
  { id: 'ito', title: 'ITO', jp: '糸', genre: 'Swing traversal', meta: '3D · one player', tagline: 'A courier, two grapple lines, and the whole Shinjuku skyline to cross.', accent: '#ff2bd6', load: () => import('./ito/index.jsx') },
  { id: 'kumite', title: 'NEON KUMITE', jp: '組手', genre: 'Versus fighter', meta: '1P vs CPU · 2P on one keyboard', tagline: 'Four fighters, one alley under the expressway. First to two rounds.', accent: '#00f0ff', load: () => import('./kumite/index.jsx') },
  { id: 'kaze', title: 'KAZE', jp: '風', genre: 'Ink-wash duels', meta: 'Side-on · one player', tagline: 'Leave the neon behind. A ronin, the wind, and five duels on the road north.', accent: '#e9e4d8', load: () => import('./kaze/index.jsx') },
  { id: 'machi', title: 'MACHI', jp: '街', genre: 'World builder', meta: 'Sandbox · saves in your browser', tagline: 'A block of Tokyo in voxels. Build on it, light it, save it.', accent: '#b8ff2e', load: () => import('./machi/index.jsx') },
];
export const GAMES = ALL.filter((g) => !g.hidden);
export const gameById = (id) => GAMES.find((g) => g.id === id);
