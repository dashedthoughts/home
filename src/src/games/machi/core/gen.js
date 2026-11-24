// MACHI world generators. Pure and seeded: the same seed always builds the same voxels.
// Scale: 1 voxel = 0.5 m. The default world is a corner of an invented Tokyo neighbourhood
// (shop names and layout are invented; the building types are real Tokyo types).
import { World } from './world.js';
import { ID } from './blocks.js';
import { GLYPHS } from './glyphs.js';

export const W = 96, H = 48, D = 96, GY = 4; // GY = first air layer above the street
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const id = (b) => (typeof b === 'string' ? ID[b] : b);

class Gen {
  constructor(w, seed) { this.w = w; this.r = rng(seed); this.meta = { wires: [], props: [], train: null, cat: null, petals: [], landmarks: {}, spawn: null }; }
  rand(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  chance(p) { return this.r() < p; }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  set(x, y, z, b) { this.w.setRaw(x, y, z, id(b)); }
  get(x, y, z) { return this.w.get(x, y, z); }
  box(x0, y0, z0, x1, y1, z1, b) { this.w.fill(x0, y0, z0, x1, y1, z1, id(b)); }
  mark(name, x0, y0, z0, x1, y1, z1) { this.meta.landmarks[name] = [x0, y0, z0, x1, y1, z1]; }
  wire(a, b, sag = 1.2) { this.meta.wires.push([...a, ...b, sag]); }
}

// Lot: building-local coordinates. u runs left to right as seen from the street, d runs from the
// front face (d = 0) into the building; d < 0 is out over the street. face +1 = front faces +z.
class Lot {
  constructor(g, x0, x1, z0, z1, face) { Object.assign(this, { g, x0, x1, z0, z1, face }); this.w = x1 - x0 + 1; this.dep = z1 - z0 + 1; }
  P(u, d) { return this.face > 0 ? [this.x0 + u, this.z1 - d] : [this.x1 - u, this.z0 + d]; }
  set(u, y, d, b) { const [x, z] = this.P(u, d); this.g.set(x, y, z, b); }
  get(u, y, d) { const [x, z] = this.P(u, d); return this.g.get(x, y, z); }
  box(u0, y0, d0, u1, y1, d1, b) { const [xa, za] = this.P(u0, d0), [xb, zb] = this.P(u1, d1); this.g.box(xa, y0, za, xb, y1, zb, b); }
  world(u, y, d) { const [x, z] = this.P(u, d); return [x, y, z]; }
}

// ---------- text ----------
// paint a string; at(c, r) maps glyph-space (column, row from top) to world [x,y,z]
function paintText(g, str, at, b, { vertical = true, gap = 1, colW = 7 } = {}) {
  let ox = 0, oy = 0;
  for (const ch of str) {
    const gl = GLYPHS[ch];
    if (!gl) { if (vertical) oy += 4; else ox += 4; continue; }
    const gh = gl.length, gw = gl[0].length;
    const cx = vertical ? Math.floor((colW - gw) / 2) : 0;
    for (let r = 0; r < gh; r++) for (let c = 0; c < gw; c++) if (gl[r][c] === '#') { const [x, y, z] = at(ox + cx + c, oy + r); g.set(x, y, z, b); }
    if (vertical) oy += gh + gap; else ox += gw + gap;
  }
  return vertical ? oy - gap : ox - gap;
}
export function textSize(str, vertical = true, gap = 1) {
  let w = 0, h = 0;
  for (const ch of str) {
    const gl = GLYPHS[ch];
    const gh = gl ? gl.length : 3, gw = gl ? gl[0].length : 3;
    if (vertical) { h += gh + gap; w = Math.max(w, gw); } else { w += gw + gap; h = Math.max(h, gh); }
  }
  return vertical ? [w, h - gap] : [w - gap, h];
}
// a flush sign plate on a lot facade: top-left at (u0, yTop), protruding at depth d (default -1)
function facadeSign(L, str, u0, yTop, neon, { back = 'signboard', border = null, d = -1, vertical = true, pad = 1 } = {}) {
  const [tw, th] = textSize(str, vertical);
  const pw = tw + pad * 2, ph = th + pad * 2;
  for (let r = 0; r < ph; r++) for (let c = 0; c < pw; c++) {
    const edge = r === 0 || c === 0 || r === ph - 1 || c === pw - 1;
    L.set(u0 + c, yTop - r, d, edge && border ? border : back);
  }
  paintText(L.g, str, (c, r) => L.world(u0 + pad + c, yTop - pad - r, d), neon, { vertical, colW: tw });
  return [pw, ph];
}
// two-sided sign sticking out from the facade (perpendicular); readable from both directions along the street
function bladeSign(L, str, us, yTop, neon, { back = 'signboard', border = null, vertical = true } = {}) {
  const [tw, th] = textSize(str, vertical);
  const pw = tw + 2, ph = th + 2;
  for (const layer of [0, 1]) {
    for (let r = 0; r < ph; r++) for (let c = 0; c < pw; c++) {
      const edge = r === 0 || c === 0 || r === ph - 1 || c === pw - 1;
      L.set(us + layer, yTop - r, -1 - c, edge && border ? border : back);
    }
    // layer us+1 reads with columns running toward the facade; layer us away from it
    paintText(L.g, str, (c, r) => L.world(us + layer, yTop - 1 - r, layer ? -pw + 1 + c : -2 - c), neon, { vertical, colW: tw });
  }
  return [pw, ph];
}

// ---------- reusable pieces ----------
// gabled roof over a footprint, ridge along `axis`. Eaves flare (half steps) then steepen, like a kawara roof.
function gable(g, x0, x1, z0, z1, y, mat = 'rooftile', slab = 'slabroof', axis = 'x', ridge = 'darkwood') {
  const span = axis === 'x' ? z1 - z0 : x1 - x0;
  let top = y;
  for (let i = 0; i <= span; i++) {
    const d = Math.min(i, span - i);
    const h = d < 2 ? d * 0.5 + 0.5 : 1.5 + (d - 2);
    const full = Math.floor(h), half = h - full >= 0.5;
    for (let a = axis === 'x' ? x0 : z0; a <= (axis === 'x' ? x1 : z1); a++) {
      const X = axis === 'x' ? a : x0 + i, Z = axis === 'x' ? z0 + i : a;
      for (let k = 0; k < full; k++) g.set(X, y + k, Z, mat);
      if (half) g.set(X, y + full, Z, slab);
      top = Math.max(top, y + full);
    }
  }
  if (ridge) {
    const c = Math.floor(span / 2), c2 = Math.ceil(span / 2);
    for (let a = axis === 'x' ? x0 : z0; a <= (axis === 'x' ? x1 : z1); a++) for (const i of new Set([c, c2])) {
      const X = axis === 'x' ? a : x0 + i, Z = axis === 'x' ? z0 + i : a;
      let yy = y; while (g.get(X, yy, Z)) yy++; g.set(X, yy, Z, ridge);
    }
  }
  return top;
}
// windows and clutter on the back of a building (d = dep-1), facing the lane or the canal
function backSide(L, y0, y1, step = 6, litP = 0.4) {
  const g = L.g, d = L.dep - 1;
  for (let y = y0; y + 3 <= y1; y += step) for (let u = 1; u + 1 < L.w - 1; u += 4) {
    const lit = g.chance(litP), m = lit ? (g.chance(0.3) ? 'shoji' : 'window') : 'darkglass';
    for (let wy = y + 1; wy <= y + 3; wy++) { L.set(u, wy, d, m); L.set(u + 1, wy, d, m); }
    if (g.chance(0.4)) L.set(u + 2, y + 1, d + 1, 'vendwhite');
    if (g.chance(0.2)) L.set(u, y, d + 1, 'slabconc');
  }
  if (L.w > 4) for (let y = GY; y <= y1; y++) L.set(L.w - 2, y, d + 1, 'pole'); // drain pipe
}
function ground(g, top = 'asphalt') { g.box(0, 0, 0, W - 1, 1, D - 1, 'soil'); g.box(0, 2, 0, W - 1, 2, D - 1, 'concrete'); g.box(0, 3, 0, W - 1, 3, D - 1, top); }

function shell(L, { top, wall, band = null, groundH = 7, floorH = 6, litP = 0.55, winMat = 'window', sideWin = [false, false], ac = 0.3, from = 0, back = true }) {
  const g = L.g;
  L.box(0, GY, 0, L.w - 1, top, L.dep - 1, wall);
  if (back) backSide(L, GY + groundH, top - 1, floorH, litP * 0.7);
  L.box(0, top, 0, L.w - 1, top, L.dep - 1, 'concrete');
  // parapet
  for (let u = 0; u < L.w; u++) { L.set(u, top + 1, 0, 'concrete'); L.set(u, top + 1, L.dep - 1, 'concrete'); }
  for (let d = 0; d < L.dep; d++) { L.set(0, top + 1, d, 'concrete'); L.set(L.w - 1, top + 1, d, 'concrete'); }
  for (let y = GY + groundH; y + 4 <= top; y += floorH) {
    if (band) for (let u = 0; u < L.w; u++) L.set(u, y, 0, band);
    // front windows: pairs of 2 with 1 pier
    for (let u = 1 + from; u + 1 < L.w; u += 3) {
      const lit = g.chance(litP);
      const mat = lit ? winMat : 'darkglass';
      for (let wy = y + 2; wy <= y + 4; wy++) { L.set(u, wy, 0, mat); if (u + 1 < L.w - 1) L.set(u + 1, wy, 0, mat); }
      if (g.chance(ac)) L.set(u, y + 1, -1, 'vendwhite'); // air-con unit under the window
    }
    for (const side of [0, 1]) if (sideWin[side]) {
      const u = side ? L.w - 1 : 0;
      for (let d = 2; d + 1 < L.dep - 1; d += 4) {
        const lit = g.chance(litP * 0.7);
        for (let wy = y + 2; wy <= y + 4; wy++) { L.set(u, wy, d, lit ? 'window' : 'darkglass'); L.set(u, wy, d + 1, lit ? 'window' : 'darkglass'); }
      }
    }
  }
}
// ground-floor shop cavity with a lit ceiling
function shopCavity(L, u0, u1, depth, openH, floor = 'wood', light = 'shoplight', step = 3) {
  L.box(u0, GY, 0, u1, GY + openH - 1, depth - 1, 'air');
  L.box(u0, 3, 0, u1, 3, depth - 1, floor);
  for (let u = u0 + 1; u <= u1 - 1; u += step) for (let d = 1; d < depth - 1; d += step) L.set(u, GY + openH, d, light);
}
function lanternAt(g, x, y, z, b = 'lantern') { g.set(x, y, z, b); }
function stoneLantern(g, x, z, y = GY) {
  g.set(x, y, z, 'stone'); g.set(x, y + 1, z, 'pole'); g.set(x, y + 2, z, 'stone'); g.set(x, y + 3, z, 'paperlamp'); g.set(x, y + 4, z, 'slabstone');
}
function sakuraTree(g, x, z, { r = 6, h = 9, y = GY, seed = 1, leaf = 'sakura' } = {}) {
  const rr = rng(seed);
  for (let t = 0; t < h; t++) g.set(x, y + t, z, 'bark');
  g.set(x + 1, y, z, 'bark'); g.set(x - 1, y, z, 'bark'); g.set(x, y, z + 1, 'bark');
  // a few branches
  const cy = y + h + 1;
  const branches = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
  for (const [bx, bz] of branches) for (let s = 1; s <= Math.floor(r * 0.6); s++) g.set(x + bx * s, y + h - 2 + Math.floor(s / 2), z + bz * s, 'bark');
  // canopy: union of noisy blobs, flatter at the bottom like a real sakura crown
  const blobs = [[0, 0, 0, r]];
  for (let i = 0; i < 6; i++) { const a = rr() * Math.PI * 2; blobs.push([Math.cos(a) * r * 0.6, -1 + rr() * 2.5, Math.sin(a) * r * 0.6, r * (0.5 + rr() * 0.25)]); }
  for (let dy = -r; dy <= r; dy++) for (let dz = -r - 3; dz <= r + 3; dz++) for (let dx = -r - 3; dx <= r + 3; dx++) {
    let inside = false;
    for (const [bx, by, bz, br] of blobs) { const ex = dx - bx, ey = (dy - by) * 1.45, ez = dz - bz; if (ex * ex + ey * ey + ez * ez < br * br) { inside = true; break; } }
    if (!inside) continue;
    const n = Math.sin(dx * 1.7 + dy * 2.3) * Math.cos(dz * 1.9 - dy) ;
    if (n > 0.82 && rr() < 0.5) continue; // gaps in the crown
    const X = x + dx, Y = cy + dy, Z = z + dz;
    if (Y <= y + 2) continue;
    if (g.get(X, Y, Z) === 0) g.set(X, Y, Z, leaf);
  }
  g.meta.petals.push([x, cy, z, r]);
}
function powerPole(g, x, z, top = GY + 17, arm = 'z') {
  for (let y = GY; y <= top; y++) g.set(x, y, z, 'pole');
  for (let k = -1; k <= 1; k++) { if (arm === 'z') g.set(x, top - 1, z + k, 'steel'); else g.set(x + k, top - 1, z, 'steel'); }
  return top;
}
function vendingMachine(g, x, z, face, body = 'vendred') {
  // face: [dx,dz] direction the front looks; 2 wide, 1 deep, 4 tall
  const [fx, fz] = face;
  const rx = fz !== 0 ? 1 : 0, rz = fx !== 0 ? 1 : 0; // along the width
  for (let k = 0; k < 2; k++) {
    const X = x + rx * k, Z = z + rz * k;
    g.set(X, GY, Z, 'black'); g.set(X, GY + 1, Z, body); g.set(X, GY + 2, Z, 'screen'); g.set(X, GY + 3, Z, 'konbini');
  }
}

// ---------- the Tokyo corner ----------
export function tokyo(seed = 1977) {
  const w = new World(W, H, D);
  const g = new Gen(w, seed);
  ground(g, 'asphalt');
  streets(g);
  canal(g);
  shrine(g);
  alley(g);
  ramenBuilding(g);
  konbiniBuilding(g);
  emptyPlot(g);
  karaokeBuilding(g);
  sento(g);
  bookshop(g);
  izakaya(g);
  southAlley(g);
  kissa(g);
  oldHouse(g);
  southBank(g);
  viaduct(g);
  eastStrip(g);
  bridge(g);
  lanternStrings(g);
  powerLines(g);
  keiTruck(g, 18, 65);
  g.meta.props.push({ t: 'bike', x: 64.5, y: GY, z: 50.6, r: 0.1 }, { t: 'bike', x: 66.2, y: GY, z: 50.7, r: -0.05 }, { t: 'bike', x: 68, y: GY, z: 50.5, r: 0.12 },
    { t: 'bike', x: 27, y: GY, z: 64.8, r: 1.5 }, { t: 'bike', x: 50.5, y: GY, z: 68.6, r: 0.02 });
  g.meta.cat = { x: 16, z: 33 };
  g.meta.spawn = { x: 21, z: 46, yaw: -Math.PI / 2 }; // on the shotengai, looking east down the street
  w.meta = g.meta;
  w.relight();
  return w;
}

function streets(g) {
  // shotengai: tiled paving with stone gutters
  g.box(0, 3, 40, W - 1, 3, 51, 'paving');
  g.box(0, 3, 40, W - 1, 3, 40, 'stone'); g.box(0, 3, 51, W - 1, 3, 51, 'stone');
  g.mark('shotengai', 0, 3, 40, W - 1, 3, 51);
  // back lane with white edge paint
  g.box(0, 3, 64, W - 1, 3, 69, 'asphalt');
  for (let x = 0; x < W; x += 1) { g.set(x, 3, 64, (x % 6) < 4 ? 'plaster' : 'asphalt'); }
  // back service strip behind the north row
  g.box(30, 3, 0, 77, 3, 7, 'concrete');
}

function canal(g) {
  // stone embankments at z 70 and 79, water one layer deep, a step down from the street
  g.box(0, 0, 70, W - 1, 3, 79, 'stone');
  g.box(0, 1, 71, W - 1, 3, 78, 'air');
  g.box(0, 0, 71, W - 1, 0, 78, 'soil');
  g.box(0, 1, 71, W - 1, 1, 78, 'water');
  // mossy edges
  for (let x = 0; x < W; x++) { if (g.chance(0.3)) g.set(x, 2, 70, 'grass'); if (g.chance(0.3)) g.set(x, 2, 79, 'grass'); } // moss in the wall joints
  // stone curb along both banks
  for (let x = 0; x < W; x++) { if (x >= 40 && x <= 47) continue; g.set(x, GY, 70, 'slabstone'); g.set(x, GY, 79, 'slabstone'); }
  g.mark('canal', 0, 1, 71, W - 1, 1, 78);
}

function bridge(g) {
  // little arched footbridge, stone deck, vermilion parapets, x 40..47 over z 69..80
  const prof = { 69: 0, 70: 1, 71: 1, 72: 2, 73: 2, 74: 2, 75: 2, 76: 2, 77: 2, 78: 1, 79: 1, 80: 0 };
  const under = { 71: 2, 72: 2, 73: 3, 74: 3, 75: 3, 76: 3, 77: 2, 78: 2 };
  for (let z = 69; z <= 80; z++) {
    const top = 3 + prof[z];
    const bot = under[z] !== undefined ? under[z] : 0;
    for (let x = 40; x <= 47; x++) {
      for (let y = Math.max(bot, 1); y <= top; y++) g.set(x, y, z, 'stone');
      g.set(x, top, z, (z === 69 || z === 80) ? 'paving' : 'wood');
    }
    if (z >= 70 && z <= 79) { g.set(40, top + 1, z, 'vermilion'); g.set(47, top + 1, z, 'vermilion'); }
  }
  for (const z of [70, 79]) for (const x of [40, 47]) { const t = 3 + prof[z]; g.set(x, t + 2, z, 'woodpost'); }
  g.mark('bridge', 40, 1, 69, 47, 7, 80);
}

function shrine(g) {
  const x0 = 0, x1 = 29, z0 = 0, z1 = 39;
  g.box(x0, 3, z0, x1, 3, z1, 'gravel');
  // low precinct wall
  for (let x = x0; x <= x1; x++) if (x < 12 || x > 18) { g.set(x, GY, 39, 'stone'); g.set(x, GY + 1, 39, 'slabstone'); }
  for (let z = z0; z <= z1; z++) { g.set(29, GY, z, 'stone'); g.set(29, GY + 1, z, 'slabstone'); }
  // hedge behind the wall
  for (let x = 1; x <= 10; x++) if (g.chance(0.8)) g.set(x, GY, 38, 'leaves');
  for (let x = 20; x <= 27; x++) if (g.chance(0.8)) g.set(x, GY, 38, 'leaves');
  // stone approach
  g.box(13, 3, 15, 17, 3, 39, 'stone');
  for (let z = 16; z <= 39; z += 2) { g.set(13, 3, z, 'paving'); g.set(17, 3, z + 1, 'paving'); }
  honden(g);
  torii(g, 15, 37);
  stoneLantern(g, 10, 30); stoneLantern(g, 20, 30); stoneLantern(g, 10, 22); stoneLantern(g, 20, 22);
  // komainu: guardian lions, stylised as small stone figures on plinths
  for (const x of [11, 19]) { g.set(x, GY, 34, 'stone'); g.set(x, GY + 1, 34, 'stone'); g.set(x, GY + 2, 34, 'slabstone'); g.set(x, GY + 1, 33, 'slabstone'); }
  // chozuya: roofed water basin
  g.box(23, GY, 29, 26, GY, 30, 'stone'); g.box(24, GY, 29, 25, GY, 30, 'water');
  for (const [x, z] of [[22, 28], [27, 28], [22, 31], [27, 31]]) { g.set(x, GY, z, 'woodpost'); g.set(x, GY + 1, z, 'woodpost'); g.set(x, GY + 2, z, 'woodpost'); g.set(x, GY + 3, z, 'woodpost'); }
  g.box(21, GY + 4, 27, 28, GY + 4, 32, 'slabroof');
  g.box(22, GY + 4, 28, 27, GY + 4, 31, 'rooftile');
  // the big sakura, left of the approach, leaning over the path
  sakuraTree(g, 6, 26, { r: 7, h: 9, seed: 7 });
  // an old green tree behind the hall
  sakuraTree(g, 25, 8, { r: 5, h: 8, seed: 11, leaf: 'leaves' });
  // ferns and flowers along the approach
  for (let z = 17; z <= 35; z++) { if (g.chance(0.25)) g.set(12, GY, z, 'fern'); if (g.chance(0.25)) g.set(18, GY, z, g.chance(0.4) ? 'flowers' : 'fern'); }
  g.mark('shrine', x0, 3, z0, x1, 24, z1);
}
function honden(g) {
  // stone platform, steps, timber hall with lit shoji, layered tile roof with ridge ornaments
  g.box(8, GY, 3, 22, GY, 14, 'stone');
  for (let x = 13; x <= 17; x++) g.set(x, GY, 15, 'stairstoneN');
  g.box(9, GY + 1, 4, 21, GY + 6, 13, 'darkwood');
  g.box(10, GY + 1, 5, 20, GY + 6, 12, 'air');
  for (let x = 10; x <= 20; x++) for (let y = GY + 2; y <= GY + 5; y++) g.set(x, y, 13, 'shoji');
  for (const x of [9, 12, 15, 18, 21]) for (let y = GY + 1; y <= GY + 6; y++) g.set(x, y, 13, 'vermilion');
  g.set(15, GY + 1, 13, 'air'); g.set(15, GY + 2, 13, 'air'); g.set(15, GY + 1, 14, 'darkwood'); // offering box
  g.set(15, GY + 3, 8, 'paperlamp'); g.set(12, GY + 3, 8, 'paperlamp'); g.set(18, GY + 3, 8, 'paperlamp');
  g.box(10, GY + 1, 5, 20, GY + 1, 12, 'wood');
  // copper gable roof with flared eaves, chigi at the gable ends and katsuogi logs on the ridge
  const y = GY + 7;
  const top = gable(g, 6, 24, 1, 17, y, 'copper', 'slabcopper', 'x', 'darkwood');
  for (const x of [6, 24]) { g.set(x, top + 1, 8, 'darkwood'); g.set(x, top + 1, 10, 'darkwood'); g.set(x, top + 2, 7, 'darkwood'); g.set(x, top + 2, 11, 'darkwood'); }
  for (const x of [10, 13, 17, 20]) g.set(x, top + 2, 9, 'wood');
  g.box(9, y, 4, 21, y, 13, 'darkwood');
  // bell rope hanging over the box
  g.set(15, GY + 5, 14, 'cream');
  g.mark('honden', 6, GY, 1, 24, top + 2, 17);
}
function torii(g, cx, z) {
  const y0 = GY;
  for (const x of [cx - 3, cx + 3]) { g.set(x, y0, z, 'black'); for (let y = y0 + 1; y <= y0 + 9; y++) g.set(x, y, z, 'vermilion'); }
  for (let x = cx - 4; x <= cx + 4; x++) g.set(x, y0 + 7, z, 'vermilion'); // nuki
  g.set(cx, y0 + 8, z, 'signboard'); // gakuzuka plaque
  for (let x = cx - 4; x <= cx + 4; x++) g.set(x, y0 + 9, z, 'vermilion'); // shimaki
  for (let x = cx - 6; x <= cx + 6; x++) g.set(x, y0 + 10, z, 'black'); // kasagi
  g.set(cx - 6, y0 + 11, z, 'black'); g.set(cx + 6, y0 + 11, z, 'black'); g.set(cx - 7, y0 + 11, z, 'slabwood'); g.set(cx + 7, y0 + 11, z, 'slabwood');
  // shimenawa rope with paper streamers
  for (let x = cx - 2; x <= cx + 2; x++) g.set(x, y0 + 6, z, 'cream');
  g.set(cx - 1, y0 + 5, z, 'plaster'); g.set(cx + 1, y0 + 5, z, 'plaster');
  g.mark('torii', cx - 7, y0, z, cx + 7, y0 + 11, z);
}
function alley(g) {
  g.box(30, 3, 0, 33, 3, 39, 'asphalt');
  for (let z = 0; z <= 39; z++) if (z % 5 < 3) g.set(30, 3, z, 'plaster');
}

// north row: fronts at z = 39 facing the shotengai
function ramenBuilding(g) {
  const L = new Lot(g, 34, 45, 8, 39, 1);
  const top = GY + 7 + 6 * 6 - 1;
  shell(L, { top, wall: 'tile', band: 'concrete', sideWin: [true, false], litP: 0.5, from: 9 });
  shopCavity(L, 1, 10, 8, 5, 'wood');
  // counter and kitchen
  L.box(1, GY, 4, 10, GY + 1, 4, 'darkwood'); L.box(1, GY, 6, 10, GY + 1, 7, 'steel'); L.box(2, GY, 2, 9, GY, 2, 'slabwood');
  L.set(3, GY + 2, 4, 'konbini'); L.set(8, GY + 2, 7, 'paperlamp');
  // fascia, noren and red lanterns
  L.box(0, GY + 5, 0, 11, GY + 6, 0, 'darkwood');
  for (let u = 2; u <= 9; u++) L.set(u, GY + 4, 0, 'norenblue');
  L.set(0, GY + 4, -1, 'lantern'); L.set(11, GY + 4, -1, 'lantern');
  // the tall sign: ラーメン in red neon with an amber frame
  facadeSign(L, 'ラ｜メン', 0, top - 1, 'neonred', { border: 'neonamber' });
  g.mark('ramen', 34, GY, 8, 45, top + 1, 40);
}
function konbiniBuilding(g) {
  const L = new Lot(g, 46, 59, 8, 39, 1);
  const top = GY + 7 + 6 * 3 - 1;
  shell(L, { top, wall: 'plaster', band: 'tileblue', litP: 0.6 });
  shopCavity(L, 1, 12, 14, 5, 'paving', 'konbini', 2);
  // glass front with a sliding door
  for (let u = 1; u <= 12; u++) for (let y = GY; y <= GY + 4; y++) if (!(u >= 6 && u <= 7 && y <= GY + 3)) L.set(u, y, 0, 'glass');
  // shelves and a till
  for (const d of [4, 7, 10]) { L.box(2, GY, d, 9, GY + 1, d, d === 7 ? 'tileblue' : 'cream'); L.box(2, GY + 2, d, 9, GY + 2, d, 'vendwhite'); }
  L.box(10, GY, 2, 11, GY + 1, 4, 'vendwhite'); L.set(11, GY + 2, 3, 'screen');
  L.box(1, GY, 12, 12, GY + 3, 12, 'glass'); L.box(1, GY + 4, 12, 12, GY + 4, 12, 'konbini');
  // glowing fascia with two stripes (an invented chain)
  L.box(0, GY + 5, -1, 13, GY + 6, -1, 'konbini');
  L.box(0, GY + 5, -1, 13, GY + 5, -1, 'neonblue');
  L.box(0, GY + 6, -1, 13, GY + 6, -1, 'konbini');
  for (let u = 0; u <= 13; u += 13) L.set(u, GY + 6, -1, 'neongreen');
  // balconies with rails on the upper floors
  for (let y = GY + 7 + 6; y < top; y += 6) for (let u = 1; u <= 12; u++) { L.set(u, y, -1, 'slabconc'); if (u % 2) L.set(u, y + 1, -1, 'pole'); }
  // rooftop garden and water tank
  const r = top + 1;
  L.box(1, r, 1, 12, r, 3, 'wood'); L.box(2, r, 2, 11, r, 2, 'grass');
  for (let u = 2; u <= 11; u++) L.set(u, r + 1, 2, g.chance(0.5) ? 'flowers' : 'fern');
  L.box(1, r, 9, 3, r, 11, 'wood'); L.box(2, r + 1, 10, 2, r + 4, 10, 'bark');
  for (let dy = 4; dy <= 6; dy++) for (let du = -1; du <= 1; du++) for (let dd = -1; dd <= 1; dd++) if (Math.abs(du) + Math.abs(dd) + (dy === 6 ? 1 : 0) < 3) L.set(2 + du, r + dy, 10 + dd, 'leaves');
  L.box(5, r, 6, 7, r, 6, 'slabwood');
  for (const [u, d] of [[8, 14], [11, 14], [8, 17], [11, 17]]) { L.set(u, r, d, 'pole'); L.set(u, r + 1, d, 'pole'); }
  L.box(8, r + 2, 14, 11, r + 5, 17, 'tank'); L.box(9, r + 6, 15, 10, r + 6, 16, 'slabconc');
  L.box(1, r, 20, 2, r + 1, 21, 'vendwhite'); L.box(4, r, 20, 5, r + 1, 21, 'vendwhite');
  g.mark('konbini', 46, GY, 8, 59, top + 7, 40);
  g.mark('rooftop', 46, r, 8, 59, r + 6, 39);
}
function emptyPlot(g) {
  // a vacant lot (akichi) between the konbini and the karaoke bar, left free for the visitor
  g.box(60, 3, 8, 67, 3, 39, 'gravel');
  for (let x = 60; x <= 67; x++) { g.set(x, 3, 20, 'plaster'); g.set(x, 3, 39, (x % 2) ? 'plaster' : 'gravel'); }
  for (let z = 20; z <= 39; z++) { g.set(60, 3, z, 'plaster'); g.set(67, 3, z, 'plaster'); }
  for (const [x, z] of [[60, 39], [67, 39], [60, 20], [67, 20]]) { g.set(x, GY, z, 'woodpost'); g.set(x, GY + 1, z, 'woodpost'); g.set(x, GY + 2, z, 'paperlamp'); }
  for (let z = 8; z < 20; z++) for (const x of [60, 67]) g.set(x, GY, z, 'concrete');
  g.set(63, GY, 21, 'fern'); g.set(65, GY, 24, 'flowers');
  g.mark('plot', 60, GY, 20, 67, GY, 39);
}
function karaokeBuilding(g) {
  const L = new Lot(g, 68, 77, 8, 39, 1);
  const top = GY + 7 + 6 * 6 - 1;
  shell(L, { top, wall: 'tileblue', band: 'concrete', litP: 0.7, winMat: 'window' });
  shopCavity(L, 1, 8, 6, 5, 'paving', 'neonblue', 3);
  L.box(1, GY, 0, 8, GY + 4, 0, 'glass'); L.box(4, GY, 0, 5, GY + 3, 0, 'air');
  L.box(0, GY + 5, -1, 9, GY + 6, -1, 'signboard');
  for (let u = 0; u <= 9; u++) L.set(u, GY + 6, -1, u % 2 ? 'neonpink' : 'neoncyan');
  facadeSign(L, 'カラオケ', 1, top - 1, 'neoncyan', { border: 'neonpink' });
  g.mark('karaoke', 68, GY, 8, 77, top + 1, 40);
}

// south row: fronts at z = 52 facing north onto the shotengai
function sento(g) {
  const L = new Lot(g, 0, 17, 52, 63, -1);
  const top = GY + 19; // tall bath hall
  L.box(0, GY, 0, 17, top, 11, 'plaster');
  for (const u of [0, 4, 8, 9, 13, 17]) L.box(u, GY, 0, u, top, 0, 'darkwood');
  L.box(0, GY + 5, 0, 17, GY + 5, 0, 'darkwood');
  // two entrances: indigo noren (men) and red noren (women)
  L.box(5, GY, 0, 7, GY + 3, 2, 'air'); L.box(10, GY, 0, 12, GY + 3, 2, 'air');
  L.box(5, 3, 0, 12, 3, 2, 'wood');
  for (let u = 5; u <= 7; u++) L.set(u, GY + 3, 0, 'norenblue');
  for (let u = 10; u <= 12; u++) L.set(u, GY + 3, 0, 'norenred');
  L.set(6, GY + 4, 2, 'shoplight'); L.set(11, GY + 4, 2, 'shoplight');
  L.box(5, GY, 3, 12, GY + 3, 3, 'shoji');
  // big sign over the doors
  facadeSign(L, '湯', 2, top - 1, 'neoncyan', { border: 'neonblue', d: -1 });
  // tiled gable roof, gable end to the street, with a small cusped porch roof over the doors
  gable(g, -1 + 0, 18, 51, 64, top + 1, 'rooftile', 'slabroof', 'z', 'darkwood');
  g.box(4, GY + 5, 50, 13, GY + 5, 51, 'slabroof'); g.box(6, GY + 6, 50, 11, GY + 6, 51, 'rooftile'); g.box(7, GY + 7, 50, 10, GY + 7, 50, 'slabroof');
  backSide(L, GY, top, 6, 0.5);
  // brick chimney with a white band and a warning light
  for (let y = GY; y <= 45; y++) for (const [u, d] of [[2, 8], [3, 8], [2, 9], [3, 9]]) L.set(u, y, d, y >= 38 && y <= 39 ? 'plaster' : 'brick');
  L.set(2, 46, 8, 'neonred');
  // lanterns either side
  L.set(4, GY + 4, -1, 'paperlamp'); L.set(13, GY + 4, -1, 'paperlamp');
  g.mark('sento', 0, GY, 52, 17, 46, 63);
}
function bookshop(g) {
  const L = new Lot(g, 18, 27, 52, 63, -1);
  const top = GY + 13;
  L.box(0, GY, 0, 9, top, 11, 'wood');
  shopCavity(L, 1, 8, 8, 5, 'wood', 'shoplight', 3);
  // shelves of books on the side and back walls, a table of books in the middle
  for (let y = GY; y <= GY + 3; y++) { L.box(1, y, 7, 8, y, 7, 'books'); L.box(1, y, 1, 1, y, 6, 'books'); L.box(8, y, 1, 8, y, 6, 'books'); }
  L.box(3, GY, 3, 6, GY, 4, 'darkwood'); L.box(3, GY + 1, 3, 6, GY + 1, 4, 'books');
  L.box(0, GY + 5, 0, 9, GY + 5, 0, 'darkwood');
  // upstairs: shoji windows and a sign
  L.box(0, GY + 6, 0, 9, top, 0, 'darkwood');
  for (let u = 1; u <= 8; u++) for (let y = GY + 8; y <= GY + 10; y++) L.set(u, y, 0, 'shoji');
  facadeSign(L, '本', 1, top + 0, 'neonamber', { border: null, d: -1, back: 'darkwood' });
  gable(g, 17, 28, 51, 64, top + 1, 'rooftile', 'slabroof', 'x', 'darkwood');
  backSide(L, GY, top, 6, 0.5);
  L.set(0, GY + 4, -1, 'paperlamp');
  g.mark('bookshop', 18, GY, 52, 27, top + 8, 63);
}
function izakaya(g) {
  const L = new Lot(g, 28, 39, 52, 63, -1);
  const top = GY + 7 + 6 * 2 - 1;
  shell(L, { top, wall: 'darkwood', band: 'wood', litP: 0.9, winMat: 'shoji', sideWin: [false, true] });
  shopCavity(L, 1, 10, 7, 5, 'wood', 'paperlamp');
  L.box(1, GY, 4, 10, GY + 1, 4, 'wood'); L.box(1, GY, 6, 10, GY + 3, 6, 'books');
  L.box(1, GY, 0, 10, GY + 4, 0, 'shoji'); L.box(4, GY, 0, 6, GY + 3, 0, 'air');
  for (let u = 4; u <= 6; u++) L.set(u, GY + 3, 0, 'norenred');
  // red lanterns (akachochin) either side of the door
  L.set(2, GY + 3, -1, 'lantern'); L.set(8, GY + 3, -1, 'lantern'); L.set(2, GY + 2, -1, 'lantern'); L.set(8, GY + 2, -1, 'lantern');
  facadeSign(L, '酒', 1, top - 1, 'neonred', { border: 'neonamber' });
  g.mark('izakaya', 28, GY, 52, 39, top + 1, 63);
}
function southAlley(g) {
  g.box(40, 3, 52, 47, 3, 63, 'paving');
  // a row of vending machines against the izakaya's side wall, facing the alley
  vendingMachine(g, 40, 54, [1, 0], 'vendred');
  vendingMachine(g, 40, 56, [1, 0], 'vendwhite');
  vendingMachine(g, 40, 58, [1, 0], 'vendred');
  g.set(40, GY, 60, 'tileblue'); // recycling bin
  g.mark('vending', 40, GY, 54, 40, GY + 3, 59);
}
function kissa(g) {
  const L = new Lot(g, 48, 61, 52, 63, -1);
  const top = GY + 7 + 6 * 3 - 1;
  shell(L, { top, wall: 'brick', band: 'cream', litP: 0.55 });
  shopCavity(L, 1, 12, 8, 5, 'darkwood', 'shoplight', 3);
  for (let u = 1; u <= 12; u++) for (let y = GY; y <= GY + 4; y++) if (!(u >= 2 && u <= 3 && y <= GY + 3)) L.set(u, y, 0, 'glass');
  for (const u of [5, 9]) { L.set(u, GY, 3, 'darkwood'); L.set(u, GY, 5, 'darkwood'); L.set(u + 1, GY, 4, 'slabwood'); }
  // green awning
  L.box(0, GY + 5, -1, 13, GY + 5, -2, 'slabroof');
  L.box(0, GY + 5, -1, 13, GY + 5, -1, 'leaves');
  for (const u of [0, 13]) { L.set(u, GY, -1, 'wood'); L.set(u, GY + 1, -1, g.chance(0.5) ? 'flowers' : 'fern'); }
  // blade sign for the bar upstairs
  bladeSign(L, 'BAR', 11, top - 2, 'neonamber', { border: 'neonpink' });
  g.mark('kissa', 48, GY, 52, 61, top + 1, 63);
}
function oldHouse(g) {
  const L = new Lot(g, 62, 77, 52, 63, -1);
  const top = GY + 11;
  L.box(0, GY, 1, 15, top, 11, 'plaster');
  L.box(0, GY, 1, 15, GY + 5, 1, 'darkwood');
  for (const u of [0, 5, 10, 15]) L.box(u, GY, 1, u, top, 1, 'darkwood');
  L.box(6, GY, 1, 9, GY + 3, 1, 'shoji');
  for (let u = 1; u <= 14; u++) if (u % 5) for (let y = GY + 7; y <= GY + 9; y++) L.set(u, y, 1, u > 10 ? 'window' : 'shoji');
  // eaves and roof
  L.box(-1, GY + 6, -1, 16, GY + 6, 0, 'slabroof');
  gable(g, 61, 78, 52, 64, top + 1, 'rooftile', 'slabroof', 'x', 'darkwood');
  backSide(L, GY, top, 6, 0.5);
  // potted plants by the door
  for (const u of [1, 2, 3, 12, 13]) { L.set(u, GY, 0, 'wood'); L.set(u, GY + 1, 0, g.chance(0.5) ? 'flowers' : 'fern'); }
  L.set(11, GY + 5, 0, 'paperlamp');
  g.mark('oldhouse', 62, GY, 52, 77, top + 8, 63);
}
function southBank(g) {
  g.box(0, 3, 80, W - 1, 3, 84, 'paving');
  g.box(0, 3, 85, W - 1, 3, D - 1, 'grass');
  // lamps along the promenade
  for (let x = 6; x < 78; x += 12) { if (x >= 38 && x <= 49) continue; for (let y = GY; y <= GY + 5; y++) g.set(x, y, 80, 'pole'); g.set(x, GY + 6, 80, 'paperlamp'); }
  // a second sakura by the bridge and a few green trees
  sakuraTree(g, 54, 86, { r: 5, h: 7, seed: 23 });
  sakuraTree(g, 30, 87, { r: 4, h: 6, seed: 31, leaf: 'leaves' });
  // low houses with lit windows (their light falls on the water)
  const houses = [[0, 13], [16, 27], [62, 75]];
  for (const [a, b] of houses) {
    const L = new Lot(g, a, b, 86, 95, -1);
    const top = GY + 10;
    L.box(0, GY, 1, L.w - 1, top, L.dep - 1, g.pick(['plaster', 'cream', 'wood']));
    for (let u = 1; u < L.w - 1; u += 3) { const lit = g.chance(0.6); for (let y = GY + 6; y <= GY + 8; y++) { L.set(u, y, 1, lit ? 'window' : 'darkglass'); L.set(u + 1, y, 1, lit ? 'window' : 'darkglass'); } }
    L.box(2, GY, 1, 3, GY + 3, 1, 'darkwood');
    gable(g, a - 1, b + 1, 86, 96, top + 1, 'rooftile', 'slabroof', 'x', 'darkwood');
    for (let u = 0; u < L.w; u++) if (u < 2 || u > 4) if (g.chance(0.7)) L.set(u, GY, 0, 'leaves');
  }
  for (let x = 40; x <= 47; x++) g.set(x, 3, 84, 'paving');
  g.mark('southbank', 0, 3, 80, W - 1, 20, D - 1);
}
function viaduct(g) {
  const x0 = 78, x1 = 87, deck = 16; // deck slab y 16..17, ballast on 18, train runs on top of 18
  const spans = [[40, 51], [64, 79]]; // steel girder spans over the street, lane and canal
  const isSpan = (z) => spans.some(([a, b]) => z >= a && z <= b);
  for (let z = 0; z < D; z++) {
    if (isSpan(z)) {
      g.box(x0, deck - 1, z, x1, deck + 1, z, 'steel');
      g.set(x0, deck - 2, z, 'steel'); g.set(x1, deck - 2, z, 'steel');
      if (z % 3 === 0) for (let x = x0 + 1; x < x1; x++) g.set(x, deck - 2, z, 'steel');
    } else {
      g.box(x0, GY, z, x1, deck + 1, z, 'brick');
    }
    g.box(x0 + 1, deck + 2, z, x1 - 1, deck + 2, z, 'rail');
    g.set(x0, deck + 2, z, 'concrete'); g.set(x1, deck + 2, z, 'concrete'); g.set(x0, deck + 3, z, 'concrete'); g.set(x1, deck + 3, z, 'concrete');
  }
  // brick arches: bays opening west (x0) with shops and lanterns inside (gado-shita)
  const bays = [];
  for (let z = 2; z + 5 < 40; z += 8) bays.push(z);
  for (const z of [53, 57]) bays.push(z);
  for (let z = 81; z + 5 < D; z += 8) bays.push(z);
  for (const bz of bays) {
    const bw = Math.min(5, (bz < 52 || bz > 80) ? 5 : 3);
    for (let z = bz; z <= bz + bw; z++) for (let y = GY; y <= GY + 9; y++) {
      const t = Math.abs(z - (bz + bw / 2)) / (bw / 2 + 0.5);
      const ah = GY + 7 + Math.round(2 * Math.sqrt(Math.max(0, 1 - t * t)));
      if (y <= ah) for (let x = x0; x <= x1 - 1; x++) g.set(x, y, z, 'air');
    }
    for (let z = bz; z <= bz + bw; z++) g.set(x0, 3, z, 'paving');
    // inside: a warm bar or bicycle parking
    if (bz < 40) {
      for (let z = bz; z <= bz + bw; z++) { g.set(x1 - 2, GY, z, 'darkwood'); g.set(x1 - 2, GY + 1, z, 'wood'); g.set(x1 - 1, GY + 5, z, 'shoplight'); }
      g.set(x0, GY + 6, bz + 1, 'lantern'); g.set(x0, GY + 6, bz + bw - 1, 'lantern');
      g.box(x0, GY + 5, bz + 2, x0, GY + 5, bz + bw - 2, 'norenred');
    } else {
      g.set(x0, GY + 6, bz + 1, 'paperlamp');
    }
  }
  // lamps hung under the street girders
  for (const z of [43, 48]) for (const x of [80, 85]) g.set(x, deck - 3, z, 'paperlamp');
  for (const z of [66]) for (const x of [80, 85]) g.set(x, deck - 3, z, 'konbini');
  g.meta.train = { x: (x0 + x1 + 1) / 2, y: deck + 3, axis: 'z' };
  g.mark('viaduct', x0, GY, 0, x1, deck + 3, D - 1);
}
function eastStrip(g) {
  const L = new Lot(g, 88, 95, 8, 39, 1);
  const top = GY + 7 + 6 * 5 - 1;
  shell(L, { top, wall: 'concrete', band: 'tile', litP: 0.6, sideWin: [false, false] });
  shopCavity(L, 1, 6, 5, 5, 'paving', 'shoplight');
  L.box(1, GY, 0, 6, GY + 4, 0, 'glass'); L.box(3, GY, 0, 4, GY + 3, 0, 'air');
  facadeSign(L, 'ホテル', 0, top - 2, 'neonpink', { border: 'neonblue' });
  const S = new Lot(g, 88, 95, 52, 63, -1);
  S.box(0, GY, 0, 7, GY + 9, 11, 'metal');
  S.box(1, GY, 0, 6, GY + 6, 0, 'air'); S.box(1, GY, 1, 6, GY + 6, 8, 'air');
  S.set(3, GY + 7, 2, 'shoplight');
  vendingMachine(g, 94, 51, [0, -1], 'vendwhite');
  g.mark('east', 88, GY, 8, 95, top + 1, 63);
}

function lanternStrings(g) {
  // strings of red and paper lanterns across the shotengai, hung from the facades just above head height
  for (let x = 3; x < 78; x += 6) {
    const y = GY + 6;
    g.wire([x + 0.5, y + 1.25, 39.6], [x + 0.5, y + 1.25, 52.4], 0.9);
    const red = (x / 6) % 2 < 1;
    for (const z of [42, 45, 48]) g.set(x, y, z, red ? (z === 45 ? 'paperlamp' : 'lantern') : (z === 45 ? 'lantern' : 'paperlamp'));
  }
  g.mark('lanterns', 3, GY + 6, 42, 77, GY + 6, 48);
}
function powerLines(g) {
  // back lane poles with three sagging wires each
  const ps = [6, 22, 38, 55, 71];
  for (const x of ps) { powerPole(g, x, 64); g.set(x, GY + 11, 65, 'konbini'); }
  g.set(55, GY + 14, 65, 'metal'); g.set(55, GY + 14, 63, 'metal'); // transformer drums
  for (let i = 0; i + 1 < ps.length; i++) for (const dz of [-1, 0, 1]) g.wire([ps[i] + 0.5, GY + 16.6, 64.5 + dz], [ps[i + 1] + 0.5, GY + 16.6, 64.5 + dz], 1.6);
  // shrine alley poles
  const pz = [4, 20, 36];
  for (const z of pz) powerPole(g, 33, z, GY + 17, 'x');
  for (let i = 0; i + 1 < pz.length; i++) for (const dx of [-1, 0, 1]) g.wire([33.5 + dx, GY + 16.6, pz[i] + 0.5], [33.5 + dx, GY + 16.6, pz[i + 1] + 0.5], 1.6);
  // service drops to the buildings
  g.wire([22.5, GY + 16.6, 64.5], [22.5, GY + 12, 63.2], 0.5);
  g.wire([55.5, GY + 16.6, 64.5], [55.5, GY + 13, 63.2], 0.5);
  g.wire([33.5, GY + 16.6, 36.5], [45.5, GY + 30, 39.2], 1.5);
}
function keiTruck(g, x, z) {
  // small white flatbed truck parked along the lane, nose pointing +x. 7 long, 3 wide.
  for (const dx of [1, 5]) for (const dz of [0, 2]) g.set(x + dx, GY, z + dz, 'black');
  g.box(x, GY + 1, z, x + 6, GY + 1, z + 2, 'kei');
  g.box(x + 5, GY + 2, z, x + 6, GY + 3, z + 2, 'kei');
  g.box(x + 6, GY + 3, z, x + 6, GY + 3, z + 2, 'glass'); g.box(x + 5, GY + 3, z, x + 5, GY + 3, z + 2, 'glass');
  g.set(x + 6, GY + 2, z, 'neonamber'); g.set(x + 6, GY + 2, z + 2, 'neonamber');
  for (let dx = 0; dx <= 4; dx++) { g.set(x + dx, GY + 2, z, 'slabconc'); g.set(x + dx, GY + 2, z + 2, 'slabconc'); }
  g.set(x, GY + 2, z + 1, 'slabconc');
  g.set(x + 2, GY + 2, z + 1, 'wood'); g.set(x + 3, GY + 2, z + 1, 'cream');
  g.mark('kei', x, GY, z, x + 6, GY + 3, z + 2);
}

// ---------- other templates ----------
export function emptyLot(seed = 1) {
  const w = new World(W, H, D); const g = new Gen(w, seed);
  ground(g, 'asphalt');
  g.box(4, 3, 4, W - 5, 3, D - 5, 'concrete');
  for (let x = 8; x < W - 8; x += 6) for (let z = 10; z < 20; z++) g.set(x, 3, z, 'plaster');
  for (const [x, z] of [[4, 4], [W - 5, 4], [4, D - 5], [W - 5, D - 5]]) { for (let y = GY; y <= GY + 7; y++) g.set(x, y, z, 'pole'); g.set(x, GY + 8, z, 'paperlamp'); }
  w.meta = { ...g.meta, spawn: { x: 48, z: 48, yaw: 0 } };
  w.relight(); return w;
}
export function flatPark(seed = 2) {
  const w = new World(W, H, D); const g = new Gen(w, seed);
  ground(g, 'grass');
  // gravel loop path, a pond with a bridge, trees, lanterns and benches
  for (let a = 0; a < 720; a++) { const t = a / 720 * Math.PI * 2; const x = Math.round(48 + Math.cos(t) * 32), z = Math.round(48 + Math.sin(t) * 26); g.box(x - 1, 3, z - 1, x + 1, 3, z + 1, 'gravel'); }
  for (let z = 30; z <= 66; z++) for (let x = 30; x <= 66; x++) { const e = ((x - 48) / 14) ** 2 + ((z - 48) / 10) ** 2; if (e < 1) { g.set(x, 3, z, 'water'); g.set(x, 2, z, 'water'); } else if (e < 1.25) g.set(x, 3, z, 'stone'); }
  g.box(46, 3, 37, 50, 3, 59, 'wood');
  for (let z = 37; z <= 59; z++) { g.set(46, GY, z, 'vermilion'); g.set(50, GY, z, 'vermilion'); }
  const rr = g.r;
  for (let i = 0; i < 14; i++) { const t = i / 14 * Math.PI * 2 + 0.2; sakuraTree(g, Math.round(48 + Math.cos(t) * 40), Math.round(48 + Math.sin(t) * 36), { r: 4 + Math.floor(rr() * 3), h: 6 + Math.floor(rr() * 3), seed: 50 + i, leaf: i % 3 ? 'sakura' : 'leaves' }); }
  for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2; stoneLantern(g, Math.round(48 + Math.cos(t) * 28), Math.round(48 + Math.sin(t) * 22)); }
  torii(g, 48, 14);
  for (let i = 0; i < 300; i++) { const x = g.rand(0, W - 1), z = g.rand(0, D - 1); if (w.get(x, 3, z) === ID.grass && w.get(x, GY, z) === 0) g.set(x, GY, z, g.chance(0.4) ? 'flowers' : 'fern'); }
  w.meta = { ...g.meta, cat: { x: 30, z: 48 }, spawn: { x: 48, z: 90, yaw: 0 } };
  w.relight(); return w;
}
export function randomDistrict(seed = 3) {
  const w = new World(W, H, D); const g = new Gen(w, seed);
  ground(g, 'asphalt');
  const words = ['ラ｜メン', 'カラオケ', 'スナック', 'ホテル', 'サウナ', 'シネマ', 'ネオン', 'マチ', 'BAR', 'ヤキトリ'];
  const neons = ['neonpink', 'neoncyan', 'neonred', 'neonamber', 'neongreen', 'neonblue'];
  const walls = ['tile', 'tileblue', 'plaster', 'cream', 'concrete', 'brick', 'metal'];
  // streets every 32 along x and z, lots of 8..14 between
  for (const s of [0, 32, 64]) { g.box(0, 3, s + 26, W - 1, 3, s + 31, 'paving'); }
  for (let bz = 0; bz < D; bz += 32) {
    for (const face of [1, -1]) {
      const z0 = face > 0 ? bz + 13 : bz, z1 = face > 0 ? bz + 25 : bz + 11;
      if (face < 0 && bz === 0) continue;
      let x = 0;
      while (x < W - 6) {
        const wdt = Math.min(W - x, g.rand(8, 14));
        const L = new Lot(g, x, x + wdt - 1, face > 0 ? z0 : z0 - 0, face > 0 ? z1 : z1, face > 0 ? 1 : -1);
        const floors = g.rand(1, 5);
        const top = GY + 7 + 6 * floors - 1;
        shell(L, { top, wall: g.pick(walls), band: g.pick(['concrete', 'tile', null]), litP: 0.6 });
        shopCavity(L, 1, wdt - 2, 5, 5, 'paving', g.chance(0.3) ? 'konbini' : 'shoplight');
        for (let u = 1; u <= wdt - 2; u++) for (let y = GY; y <= GY + 4; y++) if (g.chance(0.4) && y > GY) L.set(u, y, 0, 'glass');
        L.box(0, GY + 5, -1, wdt - 1, GY + 5, -1, g.pick(neons));
        if (floors >= 4 && wdt >= 9) facadeSign(L, g.pick(words.slice(0, 7)), 0, top - 1, g.pick(neons), { border: g.pick(neons) });
        else if (floors >= 2 && g.chance(0.5)) L.set(1, GY + 4, -1, g.chance(0.5) ? 'lantern' : 'paperlamp');
        x += wdt;
      }
    }
    for (let x = 4; x < W; x += 10) { const y = GY + 9; const sz = bz + 26; if (sz + 5 >= D) continue; for (const z of [sz + 1, sz + 3, sz + 5]) g.set(x, y, Math.min(D - 1, z), z === sz + 3 ? 'paperlamp' : 'lantern'); }
  }
  w.meta = { ...g.meta, cat: { x: 20, z: 28 }, spawn: { x: 10, z: 28, yaw: -Math.PI / 2 } };
  w.relight(); return w;
}
export const TEMPLATES = {
  tokyo: { name: 'Tokyo corner', make: tokyo },
  empty: { name: 'Empty lot', make: emptyLot },
  park: { name: 'Flat park', make: flatPark },
  district: { name: 'Random district', make: (s) => randomDistrict(s ?? (Date.now() % 100000)) },
};
