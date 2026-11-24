# V3 brief: Cyberpunk Tokyo, for real

Owner: Anuraag Dash. Live site: https://dashedthoughts.github.io/home/ (GitHub Pages, static, served under /home/).
This file is the shared brief for everyone working on v3. Read it fully before touching code.

## The ask, in the owner's words (condensed)
"Right now a lot of it feels very arcade. The lighting is not great, the edges are not great. Tokyo has not been charted well.
It needs to feel like Cyberpunk Tokyo: fantastic, real, production-grade. Not AAA, but fantastic. It must run on mid-grade laptops.
Add three or four more games so a visitor has fun before they leave: PSP-era fun, not quizzes. The caliber to aim for is a
polished, fully working browser game that someone would share: really fun, the physics works, the design looks fabulous."

## Method (how we work)
1. **Power, craft, beauty** (Katie Dill, Stripe): the thing must first work flawlessly, then every detail is considered, then it is beautiful.
   A broken or janky feature is worse than a missing one. Cut scope before you cut quality.
2. **Evidence, not vibes.** Every claim of "done" needs: a passing scripted test, and screenshots you looked at yourself.
   Look at your own output critically, as the owner would: he has rejected work for looking "arcade", "blobby", "lousy", for glare,
   for unreadable text, for clutter on phones. Iterate until you would put your name on it.
3. **Real references.** Tokyo is a real place. Use real geography, real road names, real signage conventions. Label anything invented.
4. **Performance is a feature.** 60 fps on a mid laptop's integrated GPU; playable on a phone. Budgets below.

## Hard rules
- **Original work only.** No characters, names, logos, music, levels or look lifted from any existing game, film, comic or brand.
  Genres and mechanics are free to use; specific IP is not. Real place names and real road names are facts and are fine.
  Real brand logos: never (invent shop names). No real people.
- **No external assets or new dependencies.** Everything is code: procedural geometry, canvas drawing, shaders, WebAudio synthesis.
  Dependencies available: react 18, react-router-dom 6, three r169 (incl. three/examples/jsm). Do not `npm install` anything.
- **Fonts already loaded by the page:** 'NEMESYS' (display, caps only), 'Rajdhani', 'Chakra Petch', 'Share Tech Mono', 'Bangers',
  'Permanent Marker', 'Noto Sans JP' (500/700/900, any glyph; for canvas text call `document.fonts.load('900 40px "Noto Sans JP"', text)` first).
- **Copy:** plain, short, no em-dashes in UI copy, no lorem ipsum. Japanese text must be real, correct Japanese.
- **Accessibility:** keyboard playable; touch controls on phones (pointer events, `touch-action: none` on the play surface);
  honour `prefers-reduced-motion` (no shake/flash); pause when the tab is hidden; visible focus rings; nothing below 11px.
- **State:** localStorage keys must start with `nc2:` and every read/write is wrapped in try/catch.
- **No console errors, no unhandled rejections, no layout overflow at 390x664 (phone) or 1440x900.**
- Design tokens live in `src/styles/tokens.css` (colours, fonts, spacing, cut-corner shapes). Use them in DOM UI.
- Do not touch git. Do not deploy. Do not edit files you do not own (ownership is in your task). The integrator commits and ships.

## Repo
`/home/user/home-site/` is the site. Source is in `/home/user/home-site/src/` (React + esbuild):
- `src/main.jsx`, `src/App.jsx` (HashRouter routes), `src/pages/*`, `src/components/*`, `src/styles/*.css` (inlined into index.html at build)
- `src/game/` = REDLINE, the 3D racing game: `sim.js` (pure simulation, fixed 120 Hz step, no DOM), `engine.js` (renderer, loop, quality governor),
  `render/world.js` (scene), `render/megacity.js`, `render/materials.js`, `render/textures.js`, `render/post.js`, `render/vehicles.js`, `render/cars.js`,
  `audio.js` (WebAudio synth), `config.js`, `track/c1.json` (real road data, see below). UI: `src/pages/Play.jsx`, `src/styles/play.css`.
- `src/games/<id>/index.jsx` = arcade games (ito, kumite, kaze, machi), each a lazy chunk. Registry: `src/games/registry.js`. Host: `src/pages/GameHost.jsx`
  (route `#/arcade/<id>`), hub: `src/pages/Arcade.jsx`. Per-game CSS: `src/styles/games/<id>.css`.
- Tests: `node test/sim.test.mjs` (REDLINE simulation; must print ALL SIM CHECKS PASSED).

## Building and previewing WITHOUT disturbing others (several people build at once)
Never run a bare `npm run build` (it writes the shared site root). Use a private output folder and your own port:
- Whole site, without arcade games (for REDLINE work):  `cd /home/user/home-site/src && SKIP_GAMES=1 OUT_DIR=<your preview dir> npm run build`
- Whole site with games (integration checks only):       `cd /home/user/home-site/src && OUT_DIR=<your preview dir> npm run build`
- One arcade game alone (for game work):                 `cd /home/user/home-site/src && node tools/build-game.mjs <id> <your preview dir>`
- Serve: `cd <your preview dir> && (nohup python3 -m http.server <your port> >/dev/null 2>&1 &)`
If a build fails on a file you do not own, someone else is mid-edit: wait 30 seconds and retry (up to 5 times) before worrying.

## Looking at your work (required)
Playwright is installed: `const { chromium } = require('playwright')` works from any directory (write `.cjs` scripts in your own scratch dir).
There is no GPU here: launch with `chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })` for WebGL. It is slow
(3D at ~5-15 fps), so drive time deterministically through the game's test hook instead of waiting on real time.
Screenshot at 960x540 (and a phone: `devices['iPhone 13']`), then open the PNG with the Read tool and actually look. Build contact sheets with PIL
(python3) when you have many frames. Budget: look at no more than ~25 images in total; make each one count.
Every game exposes a test hook on `window` so scripts can step the simulation deterministically:
- REDLINE: `window.__redline` = { pause(), resume(), advance(sec), state(), configure(cfg), cycleCam(), orbit(angle|null), scene, input, quality(), stats() }.
  Example scripts to learn from (read-only): /tmp/claude-0/-home-user/a62bd8c0-dc8d-569b-8ca1-4d8ae268e991/scratchpad/{rt.cjs,v2.cjs,bay.cjs,smoke.cjs,comp.mjs,stress.mjs,persona.mjs,glare.py}
- Arcade games: `window.__game` = { id, state(), advance(sec), input, reset(), ... } (you define the rest; `advance` must step the sim with no real-time dependency).

## Performance budgets
- 3D (three.js): draw calls < 250, triangles < 400k in view, no per-frame allocations in hot loops, instancing for repeated things, one shared
  renderer per game, dispose everything on unmount, handle `webglcontextlost`. Pixel budget tiers like REDLINE (`config.js` QUALITY): never render more
  than ~1.3 MP by default; scale down automatically if frame time stays above 22 ms.
- 2D (canvas): devicePixelRatio capped at 2, no layout thrash, fixed-step simulation (60 or 120 Hz) with interpolation, object pools for particles.
- JS per game chunk: aim under 150 KB minified (three.js is shared with REDLINE's chunk where the bundler can; that is fine).

## Real Tokyo data (already fetched)
`src/game/track/c1.json`: the Shuto Expressway Inner Circular Route (C1), inner loop (counter-clockwise), from OpenStreetMap relation 4256008.
13.79 km, resampled every 10 m: `x`,`y` metres east/north of (35.6770 N, 139.7570 E), `curv` (1e-5 rad/m, + = bending right), `tunnel`/`bridge` flags
(strings of 0/1), `layer`, `lanes`, and `junctions` (named motorway junction/exit nodes with distance `s` along the loop). s = 0 is at Shiodome;
the loop then runs Ginza, Kyobashi, Edobashi JCT, Kandabashi, Takebashi JCT, Kitanomaru, the Chiyoda tunnel beside the Imperial Palace, Miyakezaka JCT,
Kasumigaseki, Tanimachi JCT, Iikura, Ichinohashi JCT, Shibakoen (Tokyo Tower), Hamazakibashi JCT, and back to Shiodome.
Tightest real radius 54 m; 2.76 km in tunnels; 8.5 km on bridges/viaducts. Rebuild with `python3 -I tools/build-c1.py <relation-full.json> src/game/track/c1.json`
(raw download: /tmp/claude-0/-home-user/a62bd8c0-dc8d-569b-8ca1-4d8ae268e991/scratchpad/osm/c1.json).
Network: `www.openstreetmap.org/api/0.6/...` and `nominatim.openstreetmap.org` are reachable (send a User-Agent; be gentle, cache to disk). Overpass is NOT reachable.
Attribution is mandatory wherever this data is shown: "Map data © OpenStreetMap contributors".

## What the owner has already rejected (do not repeat)
- Glare: any light close to the road surface or low in front of the camera mirrors off the glossy road into a white blob. Check for blown-out patches.
- Cars/bikes that look blobby or toy-like; the Vanta GT car body must not be replaced (a NEW extra car is allowed if it is clearly better).
- Clutter: overlapping HUD elements, too many call-outs, text over busy backgrounds without a plate, anything unreadable.
- Phone layouts that overlap or overflow.
- "Cheap" graphics: flat untextured boxes, obvious repetition, aliasing (stair-stepped edges and shimmering thin lines).

## Reporting back
End with a short plain report: what you built, the evidence (test output, which screenshots you inspected and what you saw), every known issue or
shortcut, and the files you changed. Do not claim something works unless you ran it.
