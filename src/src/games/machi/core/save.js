// Save format: run-length + palette compression, base64 text. Pure, defensive on import.
import { BLOCKS, ID } from './blocks.js';
import { World } from './world.js';

export const FORMAT = 'machi';
export const VERSION = 1;
export const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
export const MAX_DIM = [128, 64, 128];

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function b64encode(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 3) {
    const a = u8[i], b = u8[i + 1], c = u8[i + 2];
    const n = (a << 16) | ((b || 0) << 8) | (c || 0);
    s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < u8.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < u8.length ? B64[n & 63] : '=');
  }
  return s;
}
const REV = new Int16Array(128).fill(-1); for (let i = 0; i < 64; i++) REV[B64.charCodeAt(i)] = i;
export function b64decode(s) {
  if (typeof s !== 'string' || s.length % 4 !== 0) throw new Error('bad data');
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  const out = new Uint8Array((s.length / 4) * 3 - pad);
  let o = 0;
  for (let i = 0; i < s.length; i += 4) {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const ch = s.charCodeAt(i + k);
      let v;
      if (ch === 61 && i + k >= s.length - pad) v = 0; else { v = ch < 128 ? REV[ch] : -1; if (v < 0) throw new Error('bad data'); }
      n = (n << 6) | v;
    }
    if (o < out.length) out[o++] = (n >> 16) & 255; if (o < out.length) out[o++] = (n >> 8) & 255; if (o < out.length) out[o++] = n & 255;
  }
  return out;
}
function pushVar(arr, v) { while (v >= 128) { arr.push((v & 127) | 128); v = Math.floor(v / 128); } arr.push(v); }

export function encodeWorld(world, extra = {}) {
  const pal = [], map = new Map();
  const bytes = [];
  const b = world.blocks;
  let i = 0;
  while (i < b.length) {
    const v = b[i]; let j = i + 1;
    while (j < b.length && b[j] === v) j++;
    let p = map.get(v);
    if (p === undefined) { p = pal.length; map.set(v, p); pal.push(BLOCKS[v] ? BLOCKS[v].key : 'placeholder'); }
    pushVar(bytes, p); pushVar(bytes, j - i);
    i = j;
  }
  return { format: FORMAT, v: VERSION, dims: [world.W, world.H, world.D], palette: pal, rle: b64encode(Uint8Array.from(bytes)), meta: cleanMeta(world.meta), ...extra };
}

// Validate and decode. Throws Error with a short plain message on anything malformed.
export function decodeWorld(obj, target = null) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Not a MACHI save');
  if (obj.format !== FORMAT) throw new Error('Not a MACHI save');
  if (typeof obj.v !== 'number' || obj.v > VERSION || obj.v < 1) throw new Error('Unsupported save version');
  const dims = obj.dims;
  if (!Array.isArray(dims) || dims.length !== 3 || !dims.every((d, k) => Number.isInteger(d) && d >= 1 && d <= MAX_DIM[k])) throw new Error('Bad world size');
  const pal = obj.palette;
  if (!Array.isArray(pal) || pal.length < 1 || pal.length > 256 || !pal.every((k) => typeof k === 'string' && k.length <= 40)) throw new Error('Bad block list');
  if (typeof obj.rle !== 'string' || obj.rle.length > MAX_IMPORT_BYTES * 1.4) throw new Error('Save too large');
  const ids = pal.map((k) => (Object.prototype.hasOwnProperty.call(ID, k) ? ID[k] : ID.placeholder));
  const bytes = b64decode(obj.rle);
  const [w, h, d] = dims;
  const N = w * h * d;
  const out = new Uint8Array(N);
  let o = 0, i = 0;
  const readVar = () => { let v = 0, mul = 1, n = 0; for (;;) { if (i >= bytes.length || n > 4) throw new Error('Corrupt data'); const c = bytes[i++]; v += (c & 127) * mul; n++; if (c < 128) break; mul *= 128; } return v; };
  while (i < bytes.length) {
    const p = readVar(), run = readVar();
    if (p >= ids.length || run < 1 || o + run > N) throw new Error('Corrupt data');
    out.fill(ids[p], o, o + run); o += run;
  }
  if (o !== N) throw new Error('Corrupt data');
  const world = target && target.W === w && target.H === h && target.D === d ? target : new World(w, h, d);
  world.blocks.set(out);
  world.meta = cleanMeta(obj.meta);
  world.relight();
  return world;
}
// keep only well-formed numeric metadata (wires, props, cat, train, petals, spawn)
export function cleanMeta(m) {
  const out = { wires: [], props: [], petals: [], train: null, cat: null, spawn: null, landmarks: {} };
  if (!m || typeof m !== 'object') return out;
  const nums = (a, n) => Array.isArray(a) && a.length === n && a.every((v) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e4);
  if (Array.isArray(m.wires)) out.wires = m.wires.filter((x) => nums(x, 7)).slice(0, 400);
  if (Array.isArray(m.petals)) out.petals = m.petals.filter((x) => nums(x, 4)).slice(0, 64);
  if (Array.isArray(m.props)) out.props = m.props.filter((p) => p && p.t === 'bike' && ['x', 'y', 'z', 'r'].every((k) => typeof p[k] === 'number' && Number.isFinite(p[k]))).slice(0, 64).map((p) => ({ t: 'bike', x: p.x, y: p.y, z: p.z, r: p.r }));
  if (m.train && ['x', 'y'].every((k) => typeof m.train[k] === 'number' && Number.isFinite(m.train[k]))) out.train = { x: m.train.x, y: m.train.y, axis: 'z' };
  if (m.cat && typeof m.cat.x === 'number' && typeof m.cat.z === 'number' && Number.isFinite(m.cat.x + m.cat.z)) out.cat = { x: m.cat.x, z: m.cat.z };
  if (m.spawn && typeof m.spawn.x === 'number' && typeof m.spawn.z === 'number' && Number.isFinite(m.spawn.x + m.spawn.z)) out.spawn = { x: m.spawn.x, z: m.spawn.z, yaw: Number.isFinite(m.spawn.yaw) ? m.spawn.yaw : 0 };
  if (m.landmarks && typeof m.landmarks === 'object') for (const [k, v] of Object.entries(m.landmarks)) if (typeof k === 'string' && k.length < 20 && nums(v, 6)) out.landmarks[k] = v;
  return out;
}
export function parseImport(text) {
  if (typeof text !== 'string') throw new Error('Not a MACHI save');
  if (text.length > MAX_IMPORT_BYTES) throw new Error('File too large (4 MB max)');
  let obj;
  try { obj = JSON.parse(text); } catch { throw new Error('Not valid JSON'); }
  return obj;
}
