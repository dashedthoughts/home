// MACHI chunk mesher: hidden-face culling, classic 4-level vertex AO, smooth coloured light, simple shapes.
// Pure: returns typed arrays. Vertex = pos (3 f32) + dat (4 u8: id, face, ao, flags) + lit (4 u8: sky, r, g, b scaled 0..255).
import { OPAQUE, SHAPE, TRANSPARENT, ID } from './blocks.js';
import { CS } from './world.js';

// face: 0 +X, 1 -X, 2 +Y, 3 -Y, 4 +Z, 5 -Z  => normal, origin offset, u, v (u x v = normal)
export const FACES = [
  { n: [1, 0, 0], o: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  { n: [-1, 0, 0], o: [0, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], o: [0, 1, 0], u: [0, 0, 1], v: [1, 0, 0] },
  { n: [0, -1, 0], o: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], o: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], o: [0, 0, 0], u: [0, 1, 0], v: [1, 0, 0] },
];
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const WATER = ID.water, GLASS = ID.glass, CROSS = 8, CURTAIN = 9;

class Buf {
  constructor(maxV) { this.pos = new Float32Array(maxV * 3); this.dat = new Uint8Array(maxV * 4); this.lit = new Uint8Array(maxV * 4); this.idx = new Uint32Array(maxV * 1.5); this.nv = 0; this.ni = 0; this.max = maxV; }
  reset() { this.nv = 0; this.ni = 0; }
  grow() {
    const n = this.max * 2, o = this;
    const p = new Float32Array(n * 3); p.set(o.pos); const d = new Uint8Array(n * 4); d.set(o.dat); const l = new Uint8Array(n * 4); l.set(o.lit); const ix = new Uint32Array(n * 1.5); ix.set(o.idx);
    this.pos = p; this.dat = d; this.lit = l; this.idx = ix; this.max = n;
  }
  out() {
    return { pos: this.pos.slice(0, this.nv * 3), dat: this.dat.slice(0, this.nv * 4), lit: this.lit.slice(0, this.nv * 4), idx: this.idx.slice(0, this.ni), nv: this.nv, ni: this.ni };
  }
}
const OP = new Buf(1 << 15), TR = new Buf(1 << 13);

export function meshChunk(world, ci) {
  const cx = ci % world.cx, cz = ((ci / world.cx) | 0) % world.cz, cy = (ci / (world.cx * world.cz)) | 0;
  return meshRegion(world, cx * CS, cy * CS, cz * CS, Math.min(world.W, cx * CS + CS), Math.min(world.H, cy * CS + CS), Math.min(world.D, cz * CS + CS));
}

export function meshRegion(world, x0, y0, z0, x1, y1, z1, opts = {}) {
  const { W, H, D, blocks, light } = world;
  const WD = W * D;
  const flat = !!opts.flat; // models: no world light, full sky
  OP.reset(); TR.reset();
  const blk = (x, y, z) => (x < 0 || z < 0 || x >= W || z >= D || y >= H ? 0 : y < 0 ? 255 : blocks[x + W * (z + D * y)]);
  const lit = (x, y, z) => (flat ? 15 : y >= H ? 15 : (x < 0 || z < 0 || x >= W || z >= D) ? 15 : y < 0 ? 0 : light[x + W * (z + D * y)]);
  const opq = (b) => b === 255 || OPAQUE[b] === 1;
  const ao4 = new Int32Array(4), L = new Float32Array(16);

  const quad = (buf, x, y, z, f, id, aoArr, litArr, flags, dy0, dy1) => {
    if (buf.nv + 4 > buf.max) buf.grow();
    const F = FACES[f], v0 = buf.nv;
    for (let c = 0; c < 4; c++) {
      const [su, sv] = CORNERS[c];
      const cu = su > 0 ? 1 : 0, cv = sv > 0 ? 1 : 0;
      let px = x + F.o[0] + F.u[0] * cu + F.v[0] * cv;
      let py = y + F.o[1] + F.u[1] * cu + F.v[1] * cv;
      const pz = z + F.o[2] + F.u[2] * cu + F.v[2] * cv;
      if (dy1 !== 1 && py > y + 0.5) py = y + dy1; // lowered top (water surface)
      const k = (v0 + c);
      buf.pos[k * 3] = px; buf.pos[k * 3 + 1] = py; buf.pos[k * 3 + 2] = pz;
      buf.dat[k * 4] = id; buf.dat[k * 4 + 1] = f; buf.dat[k * 4 + 2] = aoArr[c]; buf.dat[k * 4 + 3] = flags;
      buf.lit[k * 4] = litArr[c * 4]; buf.lit[k * 4 + 1] = litArr[c * 4 + 1]; buf.lit[k * 4 + 2] = litArr[c * 4 + 2]; buf.lit[k * 4 + 3] = litArr[c * 4 + 3];
    }
    const i = buf.ni;
    // flip the diagonal so AO/light interpolates without the anisotropy artefact
    const b0 = aoArr[0] * 16 + litArr[0], b1 = aoArr[1] * 16 + litArr[4], b2 = aoArr[2] * 16 + litArr[8], b3 = aoArr[3] * 16 + litArr[12];
    if (b0 + b2 < b1 + b3) { buf.idx[i] = v0 + 1; buf.idx[i + 1] = v0 + 2; buf.idx[i + 2] = v0 + 3; buf.idx[i + 3] = v0 + 1; buf.idx[i + 4] = v0 + 3; buf.idx[i + 5] = v0; }
    else { buf.idx[i] = v0; buf.idx[i + 1] = v0 + 1; buf.idx[i + 2] = v0 + 2; buf.idx[i + 3] = v0; buf.idx[i + 4] = v0 + 2; buf.idx[i + 5] = v0 + 3; }
    buf.nv += 4; buf.ni += 6;
  };
  const litB = new Uint8Array(16), aoB = new Uint8Array(4);
  // full-voxel face with AO + smooth light sampled in the neighbour layer
  const cubeFace = (buf, x, y, z, f, id, dy1) => {
    const F = FACES[f];
    const nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2];
    for (let c = 0; c < 4; c++) {
      const [su, sv] = CORNERS[c];
      const ax = nx + F.u[0] * su, ay = ny + F.u[1] * su, az = nz + F.u[2] * su;
      const bx = nx + F.v[0] * sv, by = ny + F.v[1] * sv, bz = nz + F.v[2] * sv;
      const qx = ax + F.v[0] * sv, qy = ay + F.v[1] * sv, qz = az + F.v[2] * sv;
      const s1 = opq(blk(ax, ay, az)) ? 1 : 0, s2 = opq(blk(bx, by, bz)) ? 1 : 0, cc = opq(blk(qx, qy, qz)) ? 1 : 0;
      aoB[c] = s1 && s2 ? 0 : 3 - (s1 + s2 + cc);
      // smooth light: average the non-opaque cells around this vertex
      let n = 1, l = lit(nx, ny, nz);
      let s = l & 15, r = (l >> 4) & 15, g = (l >> 8) & 15, b = l >> 12;
      if (!s1) { l = lit(ax, ay, az); s += l & 15; r += (l >> 4) & 15; g += (l >> 8) & 15; b += l >> 12; n++; }
      if (!s2) { l = lit(bx, by, bz); s += l & 15; r += (l >> 4) & 15; g += (l >> 8) & 15; b += l >> 12; n++; }
      if (!cc && !(s1 && s2)) { l = lit(qx, qy, qz); s += l & 15; r += (l >> 4) & 15; g += (l >> 8) & 15; b += l >> 12; n++; }
      const k = 17 / n;
      litB[c * 4] = Math.round(s * k); litB[c * 4 + 1] = Math.round(r * k); litB[c * 4 + 2] = Math.round(g * k); litB[c * 4 + 3] = Math.round(b * k);
    }
    quad(buf, x, y, z, f, id, aoB, litB, 0, 0, dy1);
  };
  // box faces for shapes: flat light from the cell itself, no AO
  const flatLit = new Uint8Array(16), flatAo = new Uint8Array([3, 3, 3, 3]);
  const boxFaces = (buf, x, y, z, id, bx0, by0, bz0, bx1, by1, bz1, flags) => {
    const l = lit(x, y, z);
    for (let c = 0; c < 4; c++) { flatLit[c * 4] = (l & 15) * 17; flatLit[c * 4 + 1] = ((l >> 4) & 15) * 17; flatLit[c * 4 + 2] = ((l >> 8) & 15) * 17; flatLit[c * 4 + 3] = (l >> 12) * 17; }
    const lo = [bx0, by0, bz0], hi = [bx1, by1, bz1];
    for (let f = 0; f < 6; f++) {
      const F = FACES[f];
      const ax = F.n[0] !== 0 ? 0 : F.n[1] !== 0 ? 1 : 2;
      const pos = F.n[ax] > 0;
      const atEdge = pos ? hi[ax] === 1 : lo[ax] === 0;
      if (atEdge && opq(blk(x + F.n[0], y + F.n[1], z + F.n[2]))) continue;
      if (buf.nv + 4 > buf.max) buf.grow();
      const v0 = buf.nv;
      for (let c = 0; c < 4; c++) {
        const [su, sv] = CORNERS[c];
        const p = [0, 0, 0];
        for (let a = 0; a < 3; a++) {
          if (a === ax) p[a] = pos ? hi[a] : lo[a];
          else {
            const t = (F.u[a] !== 0 ? (su > 0) : (sv > 0));
            p[a] = t ? hi[a] : lo[a];
          }
        }
        const k = v0 + c;
        buf.pos[k * 3] = x + p[0]; buf.pos[k * 3 + 1] = y + p[1]; buf.pos[k * 3 + 2] = z + p[2];
        buf.dat[k * 4] = id; buf.dat[k * 4 + 1] = f; buf.dat[k * 4 + 2] = 3; buf.dat[k * 4 + 3] = flags;
        buf.lit.set(flatLit.subarray(c * 4, c * 4 + 4), k * 4);
      }
      const i = buf.ni;
      buf.idx[i] = v0; buf.idx[i + 1] = v0 + 1; buf.idx[i + 2] = v0 + 2; buf.idx[i + 3] = v0; buf.idx[i + 4] = v0 + 2; buf.idx[i + 5] = v0 + 3;
      buf.nv += 4; buf.ni += 6;
    }
  };
  const crossQuads = (buf, x, y, z, id) => {
    const l = lit(x, y, z);
    const P = [[0.15, 0.15, 0.85, 0.85], [0.85, 0.15, 0.15, 0.85]];
    for (const [ax, az, bx, bz] of P) {
      for (let side = 0; side < 2; side++) {
        if (buf.nv + 4 > buf.max) buf.grow();
        const v0 = buf.nv;
        const pts = [[ax, 0, az], [bx, 0, bz], [bx, 0.9, bz], [ax, 0.9, az]];
        for (let c = 0; c < 4; c++) {
          const k = v0 + c, p = pts[c];
          buf.pos[k * 3] = x + p[0]; buf.pos[k * 3 + 1] = y + p[1]; buf.pos[k * 3 + 2] = z + p[2];
          buf.dat[k * 4] = id; buf.dat[k * 4 + 1] = 2; buf.dat[k * 4 + 2] = 3; buf.dat[k * 4 + 3] = 1;
          buf.lit[k * 4] = (l & 15) * 17; buf.lit[k * 4 + 1] = ((l >> 4) & 15) * 17; buf.lit[k * 4 + 2] = ((l >> 8) & 15) * 17; buf.lit[k * 4 + 3] = (l >> 12) * 17;
        }
        const i = buf.ni;
        if (side === 0) { buf.idx[i] = v0; buf.idx[i + 1] = v0 + 1; buf.idx[i + 2] = v0 + 2; buf.idx[i + 3] = v0; buf.idx[i + 4] = v0 + 2; buf.idx[i + 5] = v0 + 3; }
        else { buf.idx[i] = v0; buf.idx[i + 1] = v0 + 2; buf.idx[i + 2] = v0 + 1; buf.idx[i + 3] = v0; buf.idx[i + 4] = v0 + 3; buf.idx[i + 5] = v0 + 2; }
        buf.nv += 4; buf.ni += 6;
      }
    }
  };

  for (let y = y0; y < y1; y++) for (let z = z0; z < z1; z++) {
    let i = x0 + W * (z + D * y);
    for (let x = x0; x < x1; x++, i++) {
      const id = blocks[i];
      if (id === 0) continue;
      const sh = SHAPE[id];
      if (sh === 0) {
        const tr = TRANSPARENT[id] === 1;
        const buf = tr ? TR : OP;
        let top = 1;
        if (id === WATER && blk(x, y + 1, z) !== WATER) top = 0.82;
        for (let f = 0; f < 6; f++) {
          const F = FACES[f];
          const nb = blk(x + F.n[0], y + F.n[1], z + F.n[2]);
          if (opq(nb)) continue;
          if (tr && nb === id) continue;
          if (id === WATER && f !== 2 && nb === GLASS) continue;
          cubeFace(buf, x, y, z, f, id, top);
        }
      } else if (sh === 1) boxFaces(OP, x, y, z, id, 0, 0, 0, 1, 0.5, 1, 0);
      else if (sh >= 2 && sh <= 5) {
        boxFaces(OP, x, y, z, id, 0, 0, 0, 1, 0.5, 1, 0);
        if (sh === 2) boxFaces(OP, x, y, z, id, 0, 0.5, 0, 1, 1, 0.5, 0);
        else if (sh === 3) boxFaces(OP, x, y, z, id, 0.5, 0.5, 0, 1, 1, 1, 0);
        else if (sh === 4) boxFaces(OP, x, y, z, id, 0, 0.5, 0.5, 1, 1, 1, 0);
        else boxFaces(OP, x, y, z, id, 0, 0.5, 0, 0.5, 1, 1, 0);
      } else if (sh === 6) boxFaces(OP, x, y, z, id, 0.34, 0, 0.34, 0.66, 1, 0.66, 0);
      else if (sh === 7) boxFaces(OP, x, y, z, id, 0.18, 0.08, 0.18, 0.82, 0.92, 0.82, 0);
      else if (sh === CROSS) crossQuads(OP, x, y, z, id);
      else if (sh === CURTAIN) {
        // hang along whichever axis has neighbours (doorway frame); default along x
        const alongZ = !(OPAQUE[blk(x - 1, y, z)] || OPAQUE[blk(x + 1, y, z)] || SHAPE[blk(x - 1, y, z)] === CURTAIN || SHAPE[blk(x + 1, y, z)] === CURTAIN)
          && (OPAQUE[blk(x, y, z - 1)] || OPAQUE[blk(x, y, z + 1)] || SHAPE[blk(x, y, z - 1)] === CURTAIN || SHAPE[blk(x, y, z + 1)] === CURTAIN);
        if (alongZ) boxFaces(OP, x, y, z, id, 0.46, 0.3, 0, 0.54, 1, 1, 2);
        else boxFaces(OP, x, y, z, id, 0, 0.3, 0.46, 1, 1, 0.54, 2);
      }
    }
  }
  return { opaque: OP.out(), trans: TR.out() };
}

// mesh a whole (small) world, e.g. a model, into one buffer set
export function meshWorld(world, flat = true) {
  return meshRegion(world, 0, 0, 0, world.W, world.H, world.D, { flat });
}
