// MACHI world model: blocks + coloured flood-fill light. Pure, DOM-free (runs in Node for tests).
// Index order: i = x + W * (z + D * y). Light is packed per voxel: sky | r<<4 | g<<8 | b<<12 (4 bits each, 0..15).
import { OPAQUE, ATTEN, SKYCLEAR, EMIT, N_BLOCKS } from './blocks.js';

export const CS = 16; // chunk size (cube)

export class World {
  constructor(W = 96, H = 48, D = 96) {
    this.W = W; this.H = H; this.D = D;
    this.WD = W * D;
    this.N = W * H * D;
    this.blocks = new Uint8Array(this.N);
    this.light = new Uint16Array(this.N);
    this.cx = Math.ceil(W / CS); this.cy = Math.ceil(H / CS); this.cz = Math.ceil(D / CS);
    this.nChunks = this.cx * this.cy * this.cz;
    this.dirty = new Uint8Array(this.nChunks);
    this.version = 0;
    this._q = new Int32Array(1 << 20); // shared BFS queue (ring)
    this._ql = new Uint8Array(1 << 20);
    this.lightOps = 0;
  }
  idx(x, y, z) { return x + this.W * (z + this.D * y); }
  inside(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.W && y < this.H && z < this.D; }
  get(x, y, z) { return this.inside(x, y, z) ? this.blocks[x + this.W * (z + this.D * y)] : 0; }
  // raw write, no lighting (used by generators; call relight() after)
  setRaw(x, y, z, id) { if (this.inside(x, y, z)) this.blocks[x + this.W * (z + this.D * y)] = id; }
  fill(x0, y0, z0, x1, y1, z1, id) {
    const ax = Math.max(0, Math.min(x0, x1)), bx = Math.min(this.W - 1, Math.max(x0, x1));
    const ay = Math.max(0, Math.min(y0, y1)), by = Math.min(this.H - 1, Math.max(y0, y1));
    const az = Math.max(0, Math.min(z0, z1)), bz = Math.min(this.D - 1, Math.max(z0, z1));
    for (let y = ay; y <= by; y++) for (let z = az; z <= bz; z++) {
      const o = this.W * (z + this.D * y);
      this.blocks.fill(id, o + ax, o + bx + 1);
    }
  }
  clone() {
    const w = new World(this.W, this.H, this.D);
    w.blocks.set(this.blocks); w.light.set(this.light); return w;
  }
  copyFrom(other) { this.blocks.set(other.blocks); this.light.set(other.light); this.markAll(); }
  markAll() { this.dirty.fill(1); this.version++; }
  chunkIndex(cx, cy, cz) { return cx + this.cx * (cz + this.cz * cy); }
  // mark the chunk(s) whose meshes sample voxel (x,y,z): its own and neighbours when on a border
  markVoxel(x, y, z) {
    const c = CS;
    const x0 = ((x - 1) / c) | 0, x1 = ((x + 1) / c) | 0, y0 = ((y - 1) / c) | 0, y1 = ((y + 1) / c) | 0, z0 = ((z - 1) / c) | 0, z1 = ((z + 1) / c) | 0;
    for (let cy = Math.max(0, y0); cy <= Math.min(this.cy - 1, y1); cy++)
      for (let cz = Math.max(0, z0); cz <= Math.min(this.cz - 1, z1); cz++)
        for (let cx = Math.max(0, x0); cx <= Math.min(this.cx - 1, x1); cx++) this.dirty[cx + this.cx * (cz + this.cz * cy)] = 1;
  }
  topY(x, z) { // highest solid-ish (non-air, non-water) y, or -1
    for (let y = this.H - 1; y >= 0; y--) { const b = this.get(x, y, z); if (b && b !== WATER_ID) return y; }
    return -1;
  }

  // ---------- light: full recompute ----------
  relight() {
    const { W, H, D, WD, blocks, light } = this;
    light.fill(0);
    const q = this._q, M = q.length - 1;
    let head = 0, tail = 0;
    // sky: straight columns from the top, then BFS
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      let i = x + W * (z + D * (H - 1));
      const b = blocks[i];
      if (OPAQUE[b]) continue;
      light[i] = SKYCLEAR[b] ? 15 : Math.max(0, 14 - ATTEN[b]);
      q[tail++ & M] = i;
    }
    tail = this._bfsAdd(0, head, tail);
    // block light: seed emitters, joint RGB per channel BFS
    for (let c = 1; c <= 3; c++) {
      const sh = c * 4;
      head = 0; tail = 0;
      for (let i = 0; i < this.N; i++) {
        const e = EMIT[blocks[i]];
        if (e) { const v = (e >> (sh - 4)) & 15; if (v) { light[i] = (light[i] & ~(15 << sh)) | (v << sh); q[tail++ & M] = i; } }
      }
      this._bfsAdd(c, head, tail);
    }
    this.markAll();
  }

  // BFS add for channel c (0 sky, 1 r, 2 g, 3 b) over queue q[head..tail)
  _bfsAdd(c, head, tail) {
    const { W, H, D, WD, blocks, light } = this;
    const q = this._q, M = q.length - 1, sh = c * 4;
    const sky = c === 0;
    let ops = 0;
    while (head !== tail) {
      const i = q[head++ & M];
      const lv = (light[i] >> sh) & 15;
      if (lv <= 1 && !(sky && lv === 15)) continue;
      const x = i % W, z = ((i / W) | 0) % D, y = (i / WD) | 0;
      for (let k = 0; k < 6; k++) {
        let n;
        if (k === 0) { if (x === W - 1) continue; n = i + 1; }
        else if (k === 1) { if (x === 0) continue; n = i - 1; }
        else if (k === 2) { if (z === D - 1) continue; n = i + W; }
        else if (k === 3) { if (z === 0) continue; n = i - W; }
        else if (k === 4) { if (y === H - 1) continue; n = i + WD; }
        else { if (y === 0) continue; n = i - WD; }
        const b = blocks[n];
        if (OPAQUE[b]) continue;
        let cand = (sky && k === 5 && lv === 15 && SKYCLEAR[b]) ? 15 : lv - 1 - ATTEN[b];
        if (cand <= 0) continue;
        const nl = (light[n] >> sh) & 15;
        if (cand > nl) {
          light[n] = (light[n] & ~(15 << sh)) | (cand << sh);
          q[tail++ & M] = n;
          this._markIdx(n);
        }
        ops++;
      }
    }
    this.lightOps += ops;
    return tail;
  }
  _markIdx(i) {
    if (!this._marking) return;
    const W = this.W, x = i % W, z = ((i / W) | 0) % this.D, y = (i / this.WD) | 0;
    this.markVoxel(x, y, z);
  }

  // Remove channel c light seeded at cell p (level lv), collecting re-add frontier into the add queue
  _bfsRemove(c, p, addQ) {
    const { W, H, D, WD, blocks, light } = this;
    const q = this._q, ql = this._ql, M = q.length - 1, sh = c * 4, sky = c === 0;
    let head = 0, tail = 0;
    const lv0 = (light[p] >> sh) & 15;
    light[p] &= ~(15 << sh);
    this._markIdx(p);
    if (lv0 === 0) return;
    q[tail & M] = p; ql[tail & M] = lv0; tail++;
    while (head !== tail) {
      const i = q[head & M], lv = ql[head & M]; head++;
      const x = i % W, z = ((i / W) | 0) % D, y = (i / WD) | 0;
      for (let k = 0; k < 6; k++) {
        let n;
        if (k === 0) { if (x === W - 1) continue; n = i + 1; }
        else if (k === 1) { if (x === 0) continue; n = i - 1; }
        else if (k === 2) { if (z === D - 1) continue; n = i + W; }
        else if (k === 3) { if (z === 0) continue; n = i - W; }
        else if (k === 4) { if (y === H - 1) continue; n = i + WD; }
        else { if (y === 0) continue; n = i - WD; }
        const nl = (light[n] >> sh) & 15;
        if (nl === 0) continue;
        if (nl < lv || (sky && k === 5 && lv === 15 && nl === 15)) {
          light[n] &= ~(15 << sh);
          this._markIdx(n);
          q[tail & M] = n; ql[tail & M] = nl; tail++;
          if (!sky) { const e = (EMIT[blocks[n]] >> (sh - 4)) & 15; if (e) { light[n] |= e << sh; addQ.push(n); } }
          else if (n >= WD * (H - 1)) addQ.push(n); // top layer re-seeds itself
        } else addQ.push(n);
      }
    }
  }

  // ---------- edit with incremental light ----------
  set(x, y, z, id) {
    if (!this.inside(x, y, z)) return false;
    const i = x + this.W * (z + this.D * y);
    const old = this.blocks[i];
    if (old === id) return false;
    this._marking = true;
    const addQ = [];
    for (let c = 0; c < 4; c++) this._bfsRemove(c, i, addQ[c] = []);
    this.blocks[i] = id;
    this.markVoxel(x, y, z);
    this._relightAround(i, x, y, z, addQ);
    this._marking = false;
    this.version++;
    return true;
  }
  _relightAround(i, x, y, z, addQ) {
    const { W, H, D, WD, light, blocks } = this;
    const q = this._q, M = q.length - 1;
    const id = blocks[i];
    const nbs = [];
    if (x < W - 1) nbs.push(i + 1); if (x > 0) nbs.push(i - 1);
    if (z < D - 1) nbs.push(i + W); if (z > 0) nbs.push(i - W);
    if (y < H - 1) nbs.push(i + WD); if (y > 0) nbs.push(i - WD);
    for (let c = 0; c < 4; c++) {
      const sh = c * 4;
      let tail = 0;
      if (c === 0) {
        if (y === H - 1 && !OPAQUE[id]) { const v = SKYCLEAR[id] ? 15 : Math.max(0, 14 - ATTEN[id]); light[i] = (light[i] & ~15) | v; q[tail++ & M] = i; }
      } else {
        const e = (EMIT[id] >> (sh - 4)) & 15;
        if (e) { light[i] = (light[i] & ~(15 << sh)) | (e << sh); q[tail++ & M] = i; }
      }
      // re-seed top layer cells cleared by sky removal
      for (const n of addQ[c]) {
        if (c === 0 && n >= WD * (H - 1) && ((light[n] & 15) === 0)) { const b = blocks[n]; if (!OPAQUE[b]) light[n] = (light[n] & ~15) | (SKYCLEAR[b] ? 15 : Math.max(0, 14 - ATTEN[b])); }
        q[tail++ & M] = n;
      }
      for (const n of nbs) q[tail++ & M] = n;
      this._bfsAdd(c, 0, tail);
    }
  }
  // dirty chunk bookkeeping for bulk edits
  takeDirty() { const out = []; for (let i = 0; i < this.nChunks; i++) if (this.dirty[i]) out.push(i); return out; }

  // ---------- picking ----------
  // DDA raycast in voxel units. Returns { x,y,z, nx,ny,nz, id, dist } of the first non-air voxel or null.
  raycast(ox, oy, oz, dx, dy, dz, maxDist = 200, pred = null) {
    const len = Math.hypot(dx, dy, dz) || 1; dx /= len; dy /= len; dz /= len;
    let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const tdx = Math.abs(1 / dx), tdy = Math.abs(1 / dy), tdz = Math.abs(1 / dz);
    let tx = dx === 0 ? Infinity : (dx > 0 ? x + 1 - ox : ox - x) * tdx;
    let ty = dy === 0 ? Infinity : (dy > 0 ? y + 1 - oy : oy - y) * tdy;
    let tz = dz === 0 ? Infinity : (dz > 0 ? z + 1 - oz : oz - z) * tdz;
    let nx = 0, ny = 0, nz = 0, t = 0;
    // fast-forward into the world box if outside
    for (let step = 0; step < 1024 && t <= maxDist; step++) {
      if (this.inside(x, y, z)) {
        const b = this.blocks[x + this.W * (z + this.D * y)];
        if (b && (!pred || pred(b))) return { x, y, z, nx, ny, nz, id: b, dist: t };
      } else if ((x < 0 && sx < 0) || (y < 0 && sy < 0) || (z < 0 && sz < 0) || (x >= this.W && sx > 0) || (y >= this.H && sy > 0) || (z >= this.D && sz > 0)) {
        break;
      }
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; nx = -sx; ny = 0; nz = 0; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; nx = 0; ny = -sy; nz = 0; }
      else { z += sz; t = tz; tz += tdz; nx = 0; ny = 0; nz = -sz; }
    }
    // ground plane at y=0 outside or below (lets you place onto an empty lot)
    if (dy < 0) {
      const tg = -oy / dy;
      if (tg > 0 && tg <= maxDist) {
        const gx = Math.floor(ox + dx * tg), gz = Math.floor(oz + dz * tg);
        if (gx >= 0 && gz >= 0 && gx < this.W && gz < this.D) return { x: gx, y: -1, z: gz, nx: 0, ny: 1, nz: 0, id: 0, dist: tg, ground: true };
      }
    }
    return null;
  }
  sampleLight(x, y, z) { // packed light at a voxel (sky 15 outside the top)
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    if (y >= this.H) return 15;
    if (!this.inside(x, y, z)) return 15 * (y >= 0 ? 1 : 0);
    return this.light[x + this.W * (z + this.D * y)];
  }
}
import { ID } from './blocks.js';
const WATER_ID = ID.water;
export { N_BLOCKS };
