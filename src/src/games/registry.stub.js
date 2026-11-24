// Used by SKIP_GAMES=1 builds: the arcade shell without any game code.
export const GAMES = [{ id: 'redline', route: '/play', title: 'REDLINE', jp: '首都高', genre: 'Night racing', meta: 'The real C1 loop · 13.8 km', tagline: 'One lap of Tokyo\'s inner ring at 3 a.m.', accent: '#fcee0a' }];
export const gameById = (id) => GAMES.find((g) => g.id === id);
