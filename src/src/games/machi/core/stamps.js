// Ready-made stamps. Built in a scratch world with the same generator pieces, then cut out.
import { World } from './world.js';
import { ID } from './blocks.js';
import { GLYPHS } from './glyphs.js';

function cut(w, name) {
  // trim to the occupied bounds
  let x0 = w.W, y0 = w.H, z0 = w.D, x1 = -1, y1 = -1, z1 = -1;
  for (let y = 0; y < w.H; y++) for (let z = 0; z < w.D; z++) for (let x = 0; x < w.W; x++) if (w.get(x, y, z)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); z0 = Math.min(z0, z); x1 = Math.max(x1, x); y1 = Math.max(y1, y); z1 = Math.max(z1, z); }
  const sw = x1 - x0 + 1, sh = y1 - y0 + 1, sd = z1 - z0 + 1;
  const data = new Uint8Array(sw * sh * sd);
  for (let y = 0; y < sh; y++) for (let z = 0; z < sd; z++) for (let x = 0; x < sw; x++) data[x + sw * (z + sd * y)] = w.get(x0 + x, y0 + y, z0 + z);
  return { name, w: sw, h: sh, d: sd, data };
}
function make(name, sx, sy, sz, fn) { const w = new World(sx, sy, sz); fn((x, y, z, k) => w.setRaw(x, y, z, ID[k])); return cut(w, name); }

export function buildStamps() {
  const S = [];
  S.push(make('Torii', 17, 13, 1, (s) => {
    for (const x of [5, 11]) { s(x, 0, 0, 'black'); for (let y = 1; y <= 9; y++) s(x, y, 0, 'vermilion'); }
    for (let x = 4; x <= 12; x++) { s(x, 7, 0, 'vermilion'); s(x, 9, 0, 'vermilion'); }
    s(8, 8, 0, 'signboard');
    for (let x = 2; x <= 14; x++) s(x, 10, 0, 'black');
    s(2, 11, 0, 'black'); s(14, 11, 0, 'black'); s(1, 11, 0, 'slabwood'); s(15, 11, 0, 'slabwood');
  }));
  S.push(make('Stone lantern', 1, 5, 1, (s) => { s(0, 0, 0, 'stone'); s(0, 1, 0, 'pole'); s(0, 2, 0, 'stone'); s(0, 3, 0, 'paperlamp'); s(0, 4, 0, 'slabstone'); }));
  S.push(make('Vending machine', 2, 4, 1, (s) => { for (const x of [0, 1]) { s(x, 0, 0, 'black'); s(x, 1, 0, 'vendred'); s(x, 2, 0, 'screen'); s(x, 3, 0, 'konbini'); } }));
  S.push(make('Sakura tree', 11, 12, 11, (s) => {
    for (let y = 0; y < 6; y++) s(5, y, 5, 'bark');
    for (let y = -3; y <= 3; y++) for (let z = -5; z <= 5; z++) for (let x = -5; x <= 5; x++) { const e = x * x + (y * 1.5) ** 2 + z * z; if (e < 22 && ((x * 7 + y * 13 + z * 5) & 7) !== 0) s(5 + x, 8 + y, 5 + z, 'sakura'); }
  }));
  S.push(make('Lantern string', 1, 1, 9, (s) => { for (let z = 0; z < 9; z += 2) s(0, 0, z, z % 4 ? 'paperlamp' : 'lantern'); }));
  S.push(make('Power pole', 3, 18, 1, (s) => { for (let y = 0; y < 18; y++) s(1, y, 0, 'pole'); s(0, 16, 0, 'steel'); s(1, 16, 0, 'steel'); s(2, 16, 0, 'steel'); s(1, 10, 0, 'konbini'); }));
  S.push(make('Planter', 3, 2, 1, (s) => { for (let x = 0; x < 3; x++) { s(x, 0, 0, 'wood'); s(x, 1, 0, x === 1 ? 'flowers' : 'fern'); } }));
  return S;
}
// a sign letter as a flat stamp in the XY plane (reads correctly from +z)
export function letterStamp(ch, neonKey = 'neonpink', backKey = null) {
  const gl = GLYPHS[ch];
  if (!gl) return null;
  const h = gl.length, w = gl[0].length;
  const pad = backKey ? 1 : 0;
  const W = w + pad * 2, H = h + pad * 2;
  const data = new Uint8Array(W * H);
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const gr = r - pad, gc = c - pad;
    const on = gr >= 0 && gc >= 0 && gr < h && gc < w && gl[gr][gc] === '#';
    data[c + W * (H - 1 - r)] = on ? ID[neonKey] : backKey ? ID[backKey] : 0;
  }
  return { name: ch, w: W, h: H, d: 1, data };
}
