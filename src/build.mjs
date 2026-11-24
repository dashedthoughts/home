// Builds the site: index.html (CSS inlined) + assets/app-*.js. Heavy things (the 3D engine, each arcade game) are
// split into their own chunks, so the page paints before any of them download.
//   npm run build                      → ../index.html + ../assets/
//   OUT_DIR=/some/dir npm run build    → a private preview build there (media folders are symlinked in)
//   SKIP_GAMES=1 npm run build         → leave the arcade games out (used while they are being worked on)
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync, existsSync, symlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = join(here, '..');
const ROOT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : SITE;
const OUT = join(ROOT, 'assets');
const gameCss = existsSync(join(here, 'src/styles/games')) ? readdirSync(join(here, 'src/styles/games')).filter((f) => f.endsWith('.css')).sort().map((f) => 'src/styles/games/' + f) : [];
const CSS = ['src/styles/tokens.css', 'src/styles/site.css', 'src/styles/play.css', 'src/styles/comic.css', 'src/styles/arcade.css', ...gameCss].filter((f) => existsSync(join(here, f)));

mkdirSync(ROOT, { recursive: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (ROOT !== SITE) for (const f of ['cases', 'photos', 'poster.jpg', 'site.json', 'resume.pdf', '404.html', 'media']) {
  if (existsSync(join(SITE, f)) && !existsSync(join(ROOT, f))) symlinkSync(join(SITE, f), join(ROOT, f));
}
const skipGames = {
  name: 'skip-games',
  setup(b) { b.onResolve({ filter: /games\/registry\.js$/ }, () => ({ path: join(here, 'src/games/registry.stub.js') })); },
};
const result = await build({
  entryPoints: { app: join(here, 'src/main.jsx') },
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: OUT,
  entryNames: '[name]-[hash]',
  chunkNames: 'chunk-[hash]',
  minify: true,
  jsx: 'automatic', // REQUIRED: classic transform → "React is not defined"
  define: { 'process.env.NODE_ENV': '"production"' },
  target: ['es2020'],
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning',
  loader: { '.json': 'json', '.glsl': 'text' },
  plugins: process.env.SKIP_GAMES ? [skipGames] : [],
});
const entry = Object.keys(result.metafile.outputs).find((f) => basename(f).startsWith('app-') && f.endsWith('.js'));
const css = CSS.map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
const tpl = readFileSync(join(here, 'template.html'), 'utf8');
if (!tpl.includes('/*__CSS__*/') || !tpl.includes('__ENTRY__')) throw new Error('template placeholders missing');
const html = tpl.split('/*__CSS__*/').join(css).split('__ENTRY__').join('./assets/' + basename(entry));
writeFileSync(join(ROOT, 'index.html'), html);
for (const [f, o] of Object.entries(result.metafile.outputs)) console.log(`${basename(f).padEnd(28)} ${(o.bytes / 1024).toFixed(0).padStart(5)} KB`);
console.log(`index.html ${(html.length / 1024).toFixed(0)} KB (CSS inlined) → ${ROOT}`);
