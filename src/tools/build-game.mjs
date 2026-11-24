// Standalone preview of ONE arcade game, without building the rest of the site:
//   node tools/build-game.mjs <id> <outdir>      → <outdir>/index.html (+ assets/)
// The page mounts src/games/<id>/index.jsx full-screen with the site tokens and that game's CSS.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, resolve } from 'node:path';
const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const [id, outArg] = process.argv.slice(2);
if (!id || !outArg) { console.error('usage: node tools/build-game.mjs <id> <outdir>'); process.exit(1); }
const ROOT = resolve(outArg), OUT = join(ROOT, 'assets');
mkdirSync(ROOT, { recursive: true }); rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const entrySrc = `import { createRoot } from 'react-dom/client';
import Game from ${JSON.stringify(join(here, 'src/games', id, 'index.jsx'))};
createRoot(document.getElementById('root')).render(<main className="gamehost gamehost--solo"><div className="gamehost__stage"><Game onExit={() => { window.__exited = true; }} /></div></main>);`;
const result = await build({
  stdin: { contents: entrySrc, resolveDir: join(here, 'src'), loader: 'jsx', sourcefile: 'solo-entry.jsx' },
  bundle: true, splitting: true, format: 'esm', outdir: OUT, entryNames: 'game-[hash]', chunkNames: 'chunk-[hash]', minify: false, sourcemap: 'inline',
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, target: ['es2020'], legalComments: 'none', metafile: true, logLevel: 'warning',
  loader: { '.json': 'json', '.glsl': 'text' },
});
const entry = Object.keys(result.metafile.outputs).find((f) => basename(f).startsWith('game-') && f.endsWith('.js'));
const css = ['src/styles/tokens.css', 'src/styles/arcade.css', `src/styles/games/${id}.css`].filter((f) => existsSync(join(here, f))).map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
const tpl = readFileSync(join(here, 'template.html'), 'utf8');
const head = tpl.slice(tpl.indexOf('<head>') + 6, tpl.indexOf('<style>'));
writeFileSync(join(ROOT, 'index.html'), `<!doctype html><html lang="en"><head>${head}<style>${css}\nhtml,body,#root{height:100%;margin:0;background:#0d0d0d}</style></head><body><div id="root"></div><script type="module" src="./assets/${basename(entry)}"></script></body></html>`);
console.log(`built ${id} → ${ROOT} (${Object.values(result.metafile.outputs).reduce((a, o) => a + o.bytes, 0) >> 10} KB unminified)`);
