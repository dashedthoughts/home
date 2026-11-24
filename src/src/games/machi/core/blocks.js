// MACHI block palette. Pure data, no DOM. Ids are stable (saves store keys, not ids).
// shape: cube | slab | stairN/E/S/W | post | lantern | cross
// pass: how light/visibility passes: 'opaque' | 'clear' (air-like) | 'leaf' | 'water' | 'glass'
// pat: procedural pattern id read by the shader (see render/shaders.js PAT_*)
// emit: [r,g,b] block light 0..15 (coloured light), em: emissive surface strength for the shader
export const PAT = {
  plain: 0, tiles: 1, brick: 2, wood: 3, rooftile: 4, metal: 5, paving: 6, grass: 7, leaf: 8, glass: 9,
  neon: 10, screen: 11, cloth: 12, gravel: 13, asphalt: 14, lantern: 15, window: 16, placeholder: 17, water: 18,
  stone: 19, plaster: 20, shoji: 21, rail: 22, panel: 23, books: 24,
};

const B = [];
const add = (key, name, group, color, o = {}) => {
  const id = B.length;
  B.push({
    id, key, name, group, color,
    shape: o.shape || 'cube', pass: o.pass || 'opaque', pat: PAT[o.pat || 'plain'],
    emit: o.emit || null, em: o.em || 0, sound: o.sound || 'stone', solid: o.solid !== undefined ? o.solid : true,
    hidden: !!o.hidden, base: o.base || null, jp: o.jp || '',
  });
  return id;
};

add('air', 'Air', 'none', '#000000', { pass: 'clear', solid: false, hidden: true });
// ground and stone
add('asphalt', 'Asphalt', 'Ground', '#3a3c42', { pat: 'asphalt' });
add('paving', 'Paving', 'Ground', '#8d8a86', { pat: 'paving' });
add('concrete', 'Concrete', 'Build', '#9a9894', { pat: 'plain' });
add('stone', 'Stone', 'Ground', '#7b7a74', { pat: 'stone' });
add('gravel', 'Gravel', 'Ground', '#a49d90', { pat: 'gravel', sound: 'gravel' });
add('grass', 'Moss grass', 'Nature', '#56753b', { pat: 'grass', sound: 'grass' });
add('soil', 'Soil', 'Ground', '#4f3b2c', { pat: 'gravel', sound: 'grass' });
// walls
add('plaster', 'White plaster', 'Build', '#e6e0d2', { pat: 'plaster' });
add('cream', 'Cream render', 'Build', '#d6c39a', { pat: 'plaster' });
add('tile', 'Facade tile', 'Build', '#b9a58a', { pat: 'tiles' });
add('tileblue', 'Blue tile', 'Build', '#5d7f95', { pat: 'tiles' });
add('brick', 'Brick', 'Build', '#8e4a36', { pat: 'brick' });
add('darkwood', 'Dark wood', 'Build', '#4a3326', { pat: 'wood', sound: 'wood' });
add('wood', 'Cedar', 'Build', '#a07850', { pat: 'wood', sound: 'wood' });
add('rooftile', 'Roof tile', 'Build', '#3b3f47', { pat: 'rooftile' });
add('copper', 'Copper roof', 'Build', '#4f8f7a', { pat: 'rooftile', sound: 'metal' });
add('metal', 'Corrugated', 'Build', '#6d7a72', { pat: 'metal', sound: 'metal' });
add('steel', 'Dark steel', 'Build', '#2f3236', { pat: 'panel', sound: 'metal' });
add('vermilion', 'Vermilion', 'Build', '#c8381e', { pat: 'wood', sound: 'wood' });
add('black', 'Black', 'Build', '#1b1b1f', { pat: 'plain' });
add('shoji', 'Lit shoji', 'Light', '#f0dfb8', { pat: 'shoji', sound: 'wood', emit: [9, 7, 4], em: 0.7 });
add('books', 'Bookshelf', 'Build', '#7a4a32', { pat: 'books', sound: 'wood' });
// nature
add('sakura', 'Sakura blossom', 'Nature', '#f4b3cb', { pat: 'leaf', pass: 'leaf', sound: 'grass', em: 0.05 });
add('leaves', 'Green leaves', 'Nature', '#3f6a35', { pat: 'leaf', pass: 'leaf', sound: 'grass' });
add('bark', 'Bark', 'Nature', '#4b3a33', { pat: 'wood', sound: 'wood' });
add('water', 'Water', 'Nature', '#1d4f63', { pat: 'water', pass: 'water', solid: false, sound: 'water' });
// glass
add('glass', 'Glass', 'Light', '#a8d8e6', { pat: 'glass', pass: 'glass', sound: 'glass' });
add('darkglass', 'Dark window', 'Light', '#1d2a3a', { pat: 'window' });
// lights (coloured block light)
add('window', 'Lit window', 'Light', '#ffc985', { pat: 'window', emit: [12, 9, 5], em: 0.85 });
add('shoplight', 'Shop light', 'Light', '#ffe0b0', { pat: 'panel', emit: [15, 12, 8], em: 1 });
add('konbini', 'Light panel', 'Light', '#f4fbff', { pat: 'panel', emit: [13, 14, 15], em: 1.1 });
add('screen', 'Screen', 'Light', '#bfe6ff', { pat: 'screen', emit: [9, 12, 15], em: 1 });
add('lantern', 'Red lantern', 'Light', '#ff4a2a', { pat: 'lantern', shape: 'lantern', pass: 'clear', emit: [15, 6, 2], em: 1, solid: false });
add('paperlamp', 'Paper lantern', 'Light', '#ffe2b0', { pat: 'lantern', shape: 'lantern', pass: 'clear', emit: [14, 12, 9], em: 0.9, solid: false });
add('neonpink', 'Neon pink', 'Neon', '#ff1f9e', { pat: 'neon', emit: [15, 3, 11], em: 1.0 });
add('neoncyan', 'Neon cyan', 'Neon', '#12e6ff', { pat: 'neon', emit: [2, 14, 15], em: 0.9 });
add('neonred', 'Neon red', 'Neon', '#ff1a1a', { pat: 'neon', emit: [15, 2, 3], em: 1.1 });
add('neonamber', 'Neon amber', 'Neon', '#ffa514', { pat: 'neon', emit: [15, 11, 2], em: 0.85 });
add('neongreen', 'Neon green', 'Neon', '#7dff2a', { pat: 'neon', emit: [6, 15, 4], em: 0.85 });
add('neonblue', 'Neon violet', 'Neon', '#6a4dff', { pat: 'neon', emit: [6, 5, 15], em: 1.2 });
// cloth and fittings
add('norenblue', 'Indigo noren', 'Build', '#24345e', { pat: 'cloth', sound: 'cloth', solid: false, pass: 'clear', shape: 'curtain' });
add('norenred', 'Red noren', 'Build', '#9e2a2a', { pat: 'cloth', sound: 'cloth', solid: false, pass: 'clear', shape: 'curtain' });
add('signboard', 'Sign board', 'Build', '#16141c', { pat: 'panel', sound: 'metal' });
add('vendred', 'Vending red', 'Build', '#b8222c', { pat: 'panel', sound: 'metal' });
add('vendwhite', 'Vending white', 'Build', '#e4e6ea', { pat: 'panel', sound: 'metal' });
add('kei', 'Truck white', 'Build', '#e8ebe9', { pat: 'panel', sound: 'metal' });
add('tank', 'Tank blue', 'Build', '#7fa6b8', { pat: 'panel', sound: 'metal' });
add('rail', 'Rail bed', 'Build', '#4a4744', { pat: 'rail', sound: 'gravel' });
// shapes
add('pole', 'Concrete pole', 'Shapes', '#8b8984', { shape: 'post', pass: 'clear', pat: 'plain' });
add('woodpost', 'Wood post', 'Shapes', '#6b4c36', { shape: 'post', pass: 'clear', pat: 'wood', sound: 'wood' });
add('slabstone', 'Stone slab', 'Shapes', '#7b7a74', { shape: 'slab', pass: 'clear', pat: 'stone' });
add('slabwood', 'Wood slab', 'Shapes', '#a07850', { shape: 'slab', pass: 'clear', pat: 'wood', sound: 'wood' });
add('slabconc', 'Concrete slab', 'Shapes', '#9a9894', { shape: 'slab', pass: 'clear', pat: 'plain' });
add('slabroof', 'Roof slab', 'Shapes', '#3b3f47', { shape: 'slab', pass: 'clear', pat: 'rooftile' });
add('slabcopper', 'Copper slab', 'Shapes', '#4f8f7a', { shape: 'slab', pass: 'clear', pat: 'rooftile', sound: 'metal' });
for (const d of ['N', 'E', 'S', 'W']) add('stairstone' + d, 'Stone stairs', 'Shapes', '#7b7a74', { shape: 'stair' + d, pass: 'clear', pat: 'stone', hidden: d !== 'N', base: 'stairstone' });
for (const d of ['N', 'E', 'S', 'W']) add('stairwood' + d, 'Wood stairs', 'Shapes', '#a07850', { shape: 'stair' + d, pass: 'clear', pat: 'wood', sound: 'wood', hidden: d !== 'N', base: 'stairwood' });
add('flowers', 'Flowers', 'Nature', '#e86a8a', { shape: 'cross', pass: 'clear', pat: 'leaf', solid: false, sound: 'grass' });
add('fern', 'Fern', 'Nature', '#4d7a3a', { shape: 'cross', pass: 'clear', pat: 'leaf', solid: false, sound: 'grass' });
add('placeholder', 'Unknown block', 'none', '#ff00ff', { pat: 'placeholder', hidden: true });

export const BLOCKS = B;
export const N_BLOCKS = B.length;
export const ID = Object.fromEntries(B.map((b) => [b.key, b.id]));

// Fast lookup tables (Uint8Arrays indexed by id)
const T = (f) => { const a = new Uint8Array(256); for (const b of B) a[b.id] = f(b) ? 1 : 0; return a; };
export const OPAQUE = T((b) => b.pass === 'opaque' && b.shape === 'cube'); // occludes faces and light
export const SOLID = T((b) => b.solid && b.id !== 0);                     // collides
export const CUBE = T((b) => b.shape === 'cube');
export const TRANSPARENT = T((b) => b.pass === 'glass' || b.pass === 'water');
export const SHAPE = new Uint8Array(256); // 0 cube 1 slab 2..5 stairs NESW 6 post 7 lantern 8 cross 9 curtain
const SHAPES = { cube: 0, slab: 1, stairN: 2, stairE: 3, stairS: 4, stairW: 5, post: 6, lantern: 7, cross: 8, curtain: 9 };
for (const b of B) SHAPE[b.id] = SHAPES[b.shape];
// extra light attenuation when light enters the block (0 = air-like)
export const ATTEN = new Uint8Array(256).fill(255);
for (const b of B) ATTEN[b.id] = b.pass === 'opaque' ? 255 : b.pass === 'leaf' ? 1 : b.pass === 'water' ? 2 : 0;
// sky light passes straight down unattenuated
export const SKYCLEAR = T((b) => b.pass === 'clear' || b.pass === 'glass');
export const EMIT = new Uint16Array(256); // packed r | g<<4 | b<<8
for (const b of B) if (b.emit) EMIT[b.id] = b.emit[0] | (b.emit[1] << 4) | (b.emit[2] << 8);
export const STAIR_ROT = { N: 'E', E: 'S', S: 'W', W: 'N' };
// rotate a block id 90 degrees clockwise (stairs only; others unchanged)
export function rotateId(id) {
  const b = B[id];
  if (!b || !b.base) return id;
  const d = b.key.slice(-1);
  return ID[b.base + STAIR_ROT[d]];
}
export function mirrorId(id, axis) { // axis 'x' flips E/W, 'z' flips N/S
  const b = B[id];
  if (!b || !b.base) return id;
  const d = b.key.slice(-1);
  const m = axis === 'x' ? { E: 'W', W: 'E' } : { N: 'S', S: 'N' };
  return m[d] ? ID[b.base + m[d]] : id;
}
// stair id for a placement facing direction (camera yaw -> N/E/S/W)
export function stairFor(baseKey, dir) { return ID[baseKey + dir] ?? ID[baseKey + 'N']; }
// sRGB hex to linear [r,g,b]
export function hexLinear(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
}
export const PALETTE_ORDER = B.filter((b) => !b.hidden).map((b) => b.id);
