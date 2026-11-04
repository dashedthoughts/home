import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { getMood } from './lib/store.js';
import { SITE } from './data/content.js';

document.documentElement.dataset.mood = getMood();

// site.json (repo root) overrides links, résumé and the photo folder; never block the page on it for more than a moment
const ready = Promise.race([
  fetch('site.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : {})).then((j) => Object.assign(SITE, j)).catch(() => {}),
  new Promise((r) => setTimeout(r, 1200)),
]);

ready.then(() => createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
));
