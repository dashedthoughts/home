// Editing with grouped undo/redo, mirror symmetry, cuboid/line tools and stamps. Pure.
import { mirrorId, rotateId, SOLID } from './blocks.js';

export const MAX_UNDO = 200;
const BULK = 1500; // above this many voxels in one stroke, write raw and relight once

export class Editor {
  constructor(world) { this.world = world; this.undoStack = []; this.redoStack = []; this.group = null; this.mirrorX = false; this.mirrorZ = false; this.onChange = null; this.bulk = false; }
  setWorld(w) { this.world = w; this.undoStack = []; this.redoStack = []; this.group = null; }
  begin() { if (!this.group) this.group = []; }
  // write one voxel inside the current stroke (records old -> new)
  _write(x, y, z, id) {
    const w = this.world;
    if (!w.inside(x, y, z)) return false;
    const i = w.idx(x, y, z), old = w.blocks[i];
    if (old === id) return false;
    this.group.push(i, old, id);
    if (this.bulk) w.blocks[i] = id; else w.set(x, y, z, id);
    return true;
  }
  // apply with mirrors
  put(x, y, z, id) {
    const w = this.world;
    let n = 0;
    const pts = [[x, z, id]];
    if (this.mirrorX) pts.push([w.W - 1 - x, z, mirrorId(id, 'x')]);
    if (this.mirrorZ) pts.push([x, w.D - 1 - z, mirrorId(id, 'z')]);
    if (this.mirrorX && this.mirrorZ) pts.push([w.W - 1 - x, w.D - 1 - z, mirrorId(mirrorId(id, 'x'), 'z')]);
    for (const [px, pz, pid] of pts) if (this._write(px, y, pz, pid)) n++;
    return n;
  }
  end() {
    const g = this.group; this.group = null;
    if (this.bulk) { this.bulk = false; this.world.relight(); }
    if (!g || !g.length) return 0;
    this.undoStack.push(Int32Array.from(g));
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack.length = 0;
    this.onChange && this.onChange();
    return g.length / 3;
  }
  _replay(g, forward) {
    const w = this.world, n = g.length / 3;
    const bulk = n > BULK;
    const W = w.W, D = w.D, WD = W * D;
    const step = (k) => {
      const i = g[k * 3], v = forward ? g[k * 3 + 2] : g[k * 3 + 1];
      if (bulk) w.blocks[i] = v; else w.set(i % W, (i / WD) | 0, ((i / W) | 0) % D, v);
    };
    if (forward) for (let k = 0; k < n; k++) step(k); else for (let k = n - 1; k >= 0; k--) step(k);
    if (bulk) w.relight();
  }
  undo() { const g = this.undoStack.pop(); if (!g) return false; this._replay(g, false); this.redoStack.push(g); this.onChange && this.onChange(); return true; }
  redo() { const g = this.redoStack.pop(); if (!g) return false; this._replay(g, true); this.undoStack.push(g); this.onChange && this.onChange(); return true; }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }

  // ---- strokes ----
  place(x, y, z, id) { this.begin(); this.put(x, y, z, id); return this.end(); }
  remove(x, y, z) { this.begin(); this.put(x, y, z, 0); return this.end(); }
  box(a, b, id) {
    const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])], [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])], [z0, z1] = [Math.min(a[2], b[2]), Math.max(a[2], b[2])];
    const vol = (x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1) * (1 + this.mirrorX + this.mirrorZ + (this.mirrorX && this.mirrorZ));
    this.begin(); this.bulk = vol > BULK;
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.put(x, y, z, id);
    return this.end();
  }
  // straight line between two cells (3D DDA), extruded upward by `height` cells: a wall
  line(a, b, id, height = 1) {
    const pts = linePoints(a, b);
    this.begin(); this.bulk = pts.length * height > BULK;
    for (const [x, y, z] of pts) for (let k = 0; k < height; k++) this.put(x, y + k, z, id);
    return this.end();
  }
  // stamp: { w, h, d, data } placed with its bottom-centre at (x, y, z)
  stamp(st, x, y, z, rot = 0) {
    const s = rotateStamp(st, rot);
    const ox = x - Math.floor(s.w / 2), oz = z - Math.floor(s.d / 2);
    this.begin(); this.bulk = s.w * s.h * s.d > BULK * 4;
    for (let yy = 0; yy < s.h; yy++) for (let zz = 0; zz < s.d; zz++) for (let xx = 0; xx < s.w; xx++) {
      const b = s.data[xx + s.w * (zz + s.d * yy)];
      if (b) this.put(ox + xx, y + yy, oz + zz, b);
    }
    return this.end();
  }
  copy(a, b, name = 'Copy') {
    const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])], [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])], [z0, z1] = [Math.min(a[2], b[2]), Math.max(a[2], b[2])];
    const w = x1 - x0 + 1, h = y1 - y0 + 1, d = z1 - z0 + 1;
    const data = new Uint8Array(w * h * d);
    for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) data[x + w * (z + d * y)] = this.world.get(x0 + x, y0 + y, z0 + z);
    return { name, w, h, d, data };
  }
}
export function linePoints(a, b) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const n = Math.max(Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2]));
  const out = [];
  for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; out.push([Math.round(a[0] + d[0] * t), Math.round(a[1] + d[1] * t), Math.round(a[2] + d[2] * t)]); }
  return out;
}
// rotate a stamp `rot` quarter turns about y (clockwise seen from above)
export function rotateStamp(st, rot) {
  rot = ((rot % 4) + 4) % 4;
  let s = st;
  for (let r = 0; r < rot; r++) {
    const { w, h, d, data } = s;
    const nw = d, nd = w, out = new Uint8Array(data.length);
    for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
      const nx = d - 1 - z, nz = x;
      out[nx + nw * (nz + nd * y)] = rotateId(data[x + w * (z + d * y)]);
    }
    s = { ...s, w: nw, d: nd, data: out };
  }
  return s;
}
// can a voxel be placed without overlapping a box (e.g. the walker)?
export function overlapsBox(x, y, z, box) {
  return x + 1 > box[0] && x < box[3] && y + 1 > box[1] && y < box[4] && z + 1 > box[2] && z < box[5];
}
export { SOLID };
