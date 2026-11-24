// ITO city: a fictional slice of a west-Shinjuku-style tower district, built from a seed.
// Pure data, no DOM, no three.js: the simulation and the renderer both read it.
// Axes: x east, y up, z south (three.js convention). Street level is y = 0. Play area is ~700 x 700 m.

export const HALF = 350;

export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box kinds. Solid boxes collide; the renderer styles them per kind.
export const K = { TOWER: 0, PODIUM: 1, CROWN: 2, BOARD: 3, VIADUCT: 4, PILLAR: 5, WALKWAY: 6, SHRINE: 7, TORII: 8 };

// ---------- uniform grid over xz for boxes and points ----------
function makeGrid(cell) {
  const off = HALF + 3 * cell;
  const n = Math.ceil((2 * off) / cell);
  const cells = new Array(n * n);
  for (let i = 0; i < cells.length; i++) cells[i] = [];
  const ci = (v) => Math.max(0, Math.min(n - 1, Math.floor((v + off) / cell)));
  return { cell, n, cells, ci, at: (x, z) => cells[ci(x) * n + ci(z)] };
}

export function buildCity(seed = 1729) {
  const rnd = makeRng(seed);
  const R = (a, b) => a + (b - a) * rnd();
  const boxes = []; // {x0,y0,z0,x1,y1,z1,kind,bid,tone}
  const add = (x0, y0, z0, x1, y1, z1, kind, bid, tone = 0) => {
    const b = { x0: Math.min(x0, x1), y0, z0: Math.min(z0, z1), x1: Math.max(x0, x1), y1, z1: Math.max(z0, z1), kind, bid, tone, i: boxes.length };
    boxes.push(b);
    return b;
  };

  // ---- street grid: 6 x 6 superblocks, avenues wider ----
  const NB = 6;
  const sx = [], sz = [], wx = [], wz = [];
  for (let i = 0; i <= NB; i++) {
    const base = -HALF + 14 + (i * (2 * HALF - 28)) / NB;
    const jit = i === 0 || i === NB ? 0 : R(-9, 9);
    sx.push(base + jit); sz.push(base + R(-9, 9) * (i === 0 || i === NB ? 0 : 1));
    wx.push(i === 2 || i === 4 ? 30 : i === 0 || i === NB ? 24 : 22);
    wz.push(i === 1 || i === 3 ? 30 : i === 0 || i === NB ? 24 : 22);
  }
  const PARK = { i: 1, j: 4 };
  const VIADUCT_COL = 5; // along street x = sx[5], north-south
  const WALK_ROW = 2; // elevated walkway along street z = sz[2], from sx[1] to sx[4]
  const core = { x: -40, z: -30 }; // tallest towers cluster here

  const towers = [];
  let bid = 0;
  for (let i = 0; i < NB; i++) {
    for (let j = 0; j < NB; j++) {
      const bx0 = sx[i] + wx[i] / 2, bx1 = sx[i + 1] - wx[i + 1] / 2;
      const bz0 = sz[j] + wz[j] / 2, bz1 = sz[j + 1] - wz[j + 1] / 2;
      if (i === PARK.i && j === PARK.j) continue;
      // lots: 1, 2 or 4
      const r = rnd();
      const lots = [];
      if (r < 0.22) lots.push([bx0, bz0, bx1, bz1]);
      else if (r < 0.62) {
        if (rnd() < 0.5) { const m = R(0.4, 0.6) * (bx1 - bx0) + bx0; lots.push([bx0, bz0, m, bz1], [m, bz0, bx1, bz1]); }
        else { const m = R(0.4, 0.6) * (bz1 - bz0) + bz0; lots.push([bx0, bz0, bx1, m], [bx0, m, bx1, bz1]); }
      } else {
        const mx = R(0.42, 0.58) * (bx1 - bx0) + bx0, mz = R(0.42, 0.58) * (bz1 - bz0) + bz0;
        lots.push([bx0, bz0, mx, mz], [mx, bz0, bx1, mz], [bx0, mz, mx, bz1], [mx, mz, bx1, bz1]);
      }
      for (const [lx0, lz0, lx1, lz1] of lots) {
        const cx = (lx0 + lx1) / 2, cz = (lz0 + lz1) / 2;
        const dist = Math.hypot(cx - core.x, cz - core.z);
        const f = Math.max(0, 1 - dist / 420);
        const big = lots.length === 1;
        let H = 40 + 200 * Math.pow(f, 1.25) * R(0.55, 1.0) + (big ? 20 : 0);
        if (rnd() < 0.18) H *= 0.6; // the odd low block keeps the skyline ragged
        H = Math.max(40, Math.min(240, H));
        const tone = Math.floor(rnd() * 6);
        const b = bid++;
        const podium = rnd() < 0.55 && H > 70;
        const inset = R(4, 9);
        if (podium) {
          const ph = R(10, 22);
          add(lx0 + 2, 0, lz0 + 2, lx1 - 2, ph, lz1 - 2, K.PODIUM, b, tone);
        }
        // shaft footprint
        let fx0 = lx0 + inset, fx1 = lx1 - inset, fz0 = lz0 + inset, fz1 = lz1 - inset;
        const w = fx1 - fx0, d = fz1 - fz0;
        // slender towers: shrink the long side sometimes
        if (w > 46 && rnd() < 0.5) { const c = (fx0 + fx1) / 2, hw = R(16, 23); fx0 = c - hw; fx1 = c + hw; }
        if (d > 46 && rnd() < 0.5) { const c = (fz0 + fz1) / 2, hd = R(16, 23); fz0 = c - hd; fz1 = c + hd; }
        if (fx1 - fx0 < 18 || fz1 - fz0 < 18) continue;
        const twin = big && rnd() < 0.45 && fx1 - fx0 > 50;
        const shafts = twin ? [[fx0, fz0, fx0 + (fx1 - fx0) * 0.42, fz1], [fx0 + (fx1 - fx0) * 0.58, fz0, fx1, fz1]] : [[fx0, fz0, fx1, fz1]];
        for (let s = 0; s < shafts.length; s++) {
          let [x0, z0, x1, z1] = shafts[s];
          const Hs = twin && s === 1 ? H * R(0.75, 0.95) : H;
          const tiers = rnd() < 0.6 ? (Hs > 120 && rnd() < 0.5 ? 3 : 2) : 1;
          let y = 0;
          const tierTops = [];
          for (let t = 0; t < tiers; t++) {
            const top = t === tiers - 1 ? Hs : y + (Hs - y) * R(0.5, 0.72);
            tierTops.push(top);
            add(x0, y, z0, x1, top, z1, K.TOWER, b, tone);
            y = top;
            const sh = R(3.5, 7);
            if (x1 - x0 - 2 * sh > 14 && z1 - z0 - 2 * sh > 14) { x0 += sh; x1 -= sh; z0 += sh; z1 -= sh; }
          }
          // crown / mechanical penthouse
          if (rnd() < 0.5) {
            const cw = (x1 - x0) * R(0.35, 0.6), cd = (z1 - z0) * R(0.35, 0.6);
            const ccx = (x0 + x1) / 2 + R(-0.15, 0.15) * (x1 - x0), ccz = (z0 + z1) / 2 + R(-0.15, 0.15) * (z1 - z0);
            add(ccx - cw / 2, y, ccz - cd / 2, ccx + cw / 2, y + R(6, 13), ccz + cd / 2, K.CROWN, b, tone);
          }
          towers.push({ bid: b, x0, z0, x1, z1, top: y, H: Hs, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, tone, lot: [lx0, lz0, lx1, lz1] });
        }
      }
    }
  }

  // ---- rooftop billboards on mid-height towers (solid, swingable from their top edge) ----
  for (const t of towers) {
    if (t.H > 110 || rnd() > 0.45) continue;
    const alongX = rnd() < 0.5;
    const len = Math.min(alongX ? t.x1 - t.x0 : t.z1 - t.z0, R(14, 22)) - 2;
    if (len < 10) continue;
    const h = R(6, 9);
    const roofY = t.top;
    // sits back on the roof, legs implied by the frame (renderer draws a truss)
    if (alongX) { const z = t.z0 + 3; add(t.cx - len / 2, roofY + 2, z, t.cx + len / 2, roofY + 2 + h, z + 0.8, K.BOARD, t.bid, t.tone); }
    else { const x = t.x0 + 3; add(x, roofY + 2, t.cz - len / 2, x + 0.8, roofY + 2 + h, t.cz + len / 2, K.BOARD, t.bid, t.tone); }
    t.board = boxes[boxes.length - 1];
  }

  // ---- rail viaduct, north-south over street sx[5] ----
  const vx = sx[VIADUCT_COL], vHalf = 7;
  const viaduct = { x: vx, half: vHalf, y0: 11, y1: 14, z0: -HALF - 40, z1: HALF + 40 };
  add(vx - vHalf, 11, viaduct.z0, vx + vHalf, 14, viaduct.z1, K.VIADUCT, bid++, 0);
  for (let z = -HALF + 6; z < HALF; z += 30) add(vx - 2.2, 0, z - 1.6, vx + 2.2, 11, z + 1.6, K.PILLAR, -1, 0);

  // ---- elevated pedestrian walkway along street sz[2] ----
  const wzc = sz[WALK_ROW], wHalf = 4;
  const walk = { z: wzc, half: wHalf, x0: sx[1] - 10, x1: sx[4] + 10, y0: 8, y1: 9.2 };
  add(walk.x0, 8, wzc - wHalf, walk.x1, 9.2, wzc + wHalf, K.WALKWAY, bid++, 0);
  for (let x = walk.x0 + 8; x < walk.x1; x += 26) add(x - 1, 0, wzc - 1, x + 1, 8, wzc + 1, K.PILLAR, -1, 0);

  // ---- park + shrine clearing ----
  const px0 = sx[PARK.i] + wx[PARK.i] / 2, px1 = sx[PARK.i + 1] - wx[PARK.i + 1] / 2;
  const pz0 = sz[PARK.j] + wz[PARK.j] / 2, pz1 = sz[PARK.j + 1] - wz[PARK.j + 1] / 2;
  const park = { x0: px0, x1: px1, z0: pz0, z1: pz1, cx: (px0 + px1) / 2, cz: (pz0 + pz1) / 2 };
  // shrine hall at the north end, torii facing south
  const hx = park.cx, hz = park.z0 + 18;
  add(hx - 9, 0, hz - 6, hx + 9, 7, hz + 6, K.SHRINE, bid++, 0);
  const tz = park.cz + 14;
  park.torii = { x: hx, z: tz, w: 11, h: 10 };
  add(hx - 5.6, 0, tz - 0.5, hx - 4.6, 9, tz + 0.5, K.TORII, -1, 0);
  add(hx + 4.6, 0, tz - 0.5, hx + 5.6, 9, tz + 0.5, K.TORII, -1, 0);
  add(hx - 7.5, 9, tz - 0.7, hx + 7.5, 10.2, tz + 0.7, K.TORII, -1, 0);
  park.hall = { x: hx, z: hz };
  park.trees = [];
  for (let k = 0; k < 70; k++) {
    const x = R(px0 + 4, px1 - 4), z = R(pz0 + 4, pz1 - 4);
    if (Math.abs(x - hx) < 14 && z < tz + 6) continue; // keep the approach to the shrine clear
    park.trees.push({ x, z, r: R(3, 5.5), h: R(8, 15) });
  }

  // ---- spatial grid of boxes (bounds grown by 4 m so point queries need one cell) ----
  const PAD = 4;
  const bgrid = makeGrid(24);
  for (const b of boxes) {
    const i0 = bgrid.ci(b.x0 - PAD), i1 = bgrid.ci(b.x1 + PAD), j0 = bgrid.ci(b.z0 - PAD), j1 = bgrid.ci(b.z1 + PAD);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) bgrid.cells[i * bgrid.n + j].push(b.i);
  }

  // ---- anchors: points just outside top edges (and the underside of the walkway/viaduct) ----
  const anchors = []; // flat [x,y,z, box] * n
  const SP = 11;
  const edgePoints = (b, y, out, dy) => {
    const o = 0.6;
    const xs = [b.x0 - o, b.x1 + o], zs = [b.z0 - o, b.z1 + o];
    for (const x of xs) for (const z of zs) anchors.push(x, y + dy, z, b.i);
    const nx = Math.max(0, Math.floor((b.x1 - b.x0) / SP) - 1), nz = Math.max(0, Math.floor((b.z1 - b.z0) / SP) - 1);
    for (let k = 1; k <= nx; k++) { const x = b.x0 + ((b.x1 - b.x0) * k) / (nx + 1); anchors.push(x, y + dy, b.z0 - o, b.i, x, y + dy, b.z1 + o, b.i); }
    for (let k = 1; k <= nz; k++) { const z = b.z0 + ((b.z1 - b.z0) * k) / (nz + 1); anchors.push(b.x0 - o, y + dy, z, b.i, b.x1 + o, y + dy, z, b.i); }
  };
  for (const b of boxes) {
    if (b.kind === K.TOWER || b.kind === K.CROWN || b.kind === K.BOARD || (b.kind === K.PODIUM && b.y1 > 16)) edgePoints(b, b.y1, anchors, 0.3);
  }
  // tower corners: every 15 m up each vertical corner edge (so there is a line to throw at any altitude)
  for (const b of boxes) {
    if (b.kind !== K.TOWER || b.y1 - b.y0 < 20) continue;
    const o = 0.6;
    for (let y = b.y0 + 18; y < b.y1 - 6; y += 15) {
      anchors.push(b.x0 - o, y, b.z0 - o, b.i, b.x1 + o, y, b.z0 - o, b.i, b.x0 - o, y, b.z1 + o, b.i, b.x1 + o, y, b.z1 + o, b.i);
    }
  }
  // viaduct and walkway underside edges (for low runs), every 15 m along their length
  for (let z = -HALF + 10; z < HALF - 10; z += 15) anchors.push(vx - vHalf - 0.6, 10.7, z, -1, vx + vHalf + 0.6, 10.7, z, -1);
  for (let x = walk.x0 + 6; x < walk.x1 - 6; x += 15) anchors.push(x, 7.7, wzc - wHalf - 0.6, -1, x, 7.7, wzc + wHalf + 0.6, -1);
  // antenna masts on tall roofs: their tips are anchors too
  const masts = [];
  for (const t of towers) {
    if (t.H < 120 || rnd() > 0.6) continue;
    const mx = t.x0 + 3 + rnd() * (t.x1 - t.x0 - 6), mz = t.z0 + 3 + rnd() * (t.z1 - t.z0 - 6);
    const mh = R(12, 26);
    // stand on the highest box under the mast
    let base = t.top;
    for (const b of boxes) if (b.bid === t.bid && mx > b.x0 && mx < b.x1 && mz > b.z0 && mz < b.z1) base = Math.max(base, b.y1);
    masts.push({ x: mx, z: mz, y0: base, y1: base + mh });
    anchors.push(mx, base + mh, mz, -2);
  }
  const A = new Float32Array(anchors);
  const nA = A.length / 4;
  const agrid = makeGrid(40);
  for (let k = 0; k < nA; k++) agrid.at(A[k * 4], A[k * 4 + 2]).push(k);

  // ---- perches (zip targets): roof corners of top tiers, walkway, viaduct deck ----
  const perch = [];
  const isTopOf = (b) => !boxes.some((c) => c !== b && c.kind !== K.BOARD && c.y0 >= b.y1 - 0.01 && c.x0 < b.x1 && c.x1 > b.x0 && c.z0 < b.z1 && c.z1 > b.z0 && c.y0 < b.y1 + 0.01);
  for (const b of boxes) {
    if (!(b.kind === K.TOWER || b.kind === K.PODIUM || b.kind === K.CROWN)) continue;
    const ins = 1.6;
    const pts = [[b.x0 + ins, b.z0 + ins], [b.x1 - ins, b.z0 + ins], [b.x0 + ins, b.z1 - ins], [b.x1 - ins, b.z1 - ins]];
    // only corners that are not covered by an upper tier
    for (const [x, z] of pts) {
      if (boxes.some((c) => c !== b && c.y0 >= b.y1 - 0.01 && c.y0 < b.y1 + 0.01 && x > c.x0 - 1 && x < c.x1 + 1 && z > c.z0 - 1 && z < c.z1 + 1)) continue;
      perch.push(x, b.y1, z, b.i);
    }
    void isTopOf;
  }
  for (let x = walk.x0 + 10; x < walk.x1 - 10; x += 40) perch.push(x, walk.y1, wzc, boxes.findIndex((b) => b.kind === K.WALKWAY));
  const viIdx = boxes.findIndex((b) => b.kind === K.VIADUCT);
  for (let z = -HALF + 20; z < HALF - 20; z += 45) perch.push(vx, 14, z, viIdx);
  const PR = new Float32Array(perch);
  const nP = PR.length / 4;
  const pgrid = makeGrid(40);
  for (let k = 0; k < nP; k++) pgrid.at(PR[k * 4], PR[k * 4 + 2]).push(k);

  // ---- vertical neon signs (visual only), on street-facing faces of towers and podiums ----
  const signs = [];
  for (const b of boxes) {
    if (!(b.kind === K.PODIUM || (b.kind === K.TOWER && b.y0 === 0))) continue;
    const n = b.kind === K.PODIUM ? 2 : rnd() < 0.6 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      const face = Math.floor(rnd() * 4);
      const h = Math.min(b.y1 - 3, R(9, 18));
      if (h < 7) continue;
      const y0 = R(3, Math.max(3.5, Math.min(b.y1 - h - 1, 22)));
      const u = R(0.15, 0.85);
      let x, z, nx = 0, nz = 0;
      if (face === 0) { x = b.x0 + (b.x1 - b.x0) * u; z = b.z0; nz = -1; }
      else if (face === 1) { x = b.x0 + (b.x1 - b.x0) * u; z = b.z1; nz = 1; }
      else if (face === 2) { x = b.x0; z = b.z0 + (b.z1 - b.z0) * u; nx = -1; }
      else { x = b.x1; z = b.z0 + (b.z1 - b.z0) * u; nx = 1; }
      signs.push({ x, z, nx, nz, y0, h, kind: Math.floor(rnd() * 1e6) });
    }
  }
  // animated billboards: big flat screens on tower faces at mid height
  const screens = [];
  for (const t of towers) {
    if (rnd() > 0.32 || t.H < 60) continue;
    const face = Math.floor(rnd() * 4);
    const w = Math.min(face < 2 ? t.x1 - t.x0 : t.z1 - t.z0, R(16, 26)) - 4;
    if (w < 10) continue;
    const h = w * R(0.5, 0.7);
    const y0 = R(18, Math.min(60, t.H * 0.5));
    screens.push({ face, t, w, h, y0, seed: Math.floor(rnd() * 1e6) });
  }

  const city = {
    seed, boxes, towers, sx, sz, wx, wz, NB, viaduct, walk, park, masts, signs, screens,
    anchors: A, nAnchors: nA, agrid, perches: PR, nPerches: nP, pgrid, bgrid, rnd,
  };
  return city;
}

// ---------- queries (allocation-free; results go into caller arrays) ----------
let stamp = 1;
const seen = new Uint32Array(4096);
export function boxesAt(city, x, z) { return city.bgrid.at(x, z); }

// boxes whose padded bounds overlap the xz rectangle; dedup via stamp
export function boxesInRect(city, x0, z0, x1, z1, out) {
  const g = city.bgrid;
  const i0 = g.ci(x0), i1 = g.ci(x1), j0 = g.ci(z0), j1 = g.ci(z1);
  stamp++;
  let n = 0;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const c = g.cells[i * g.n + j];
    for (let k = 0; k < c.length; k++) { const b = c[k]; if (seen[b] !== stamp) { seen[b] = stamp; out[n++] = b; } }
  }
  return n;
}

// segment vs box (slab test), box grown by r. Returns true on hit within (t0, t1).
export function segHitsBox(b, x, y, z, dx, dy, dz, r, t0 = 0, t1 = 1) {
  let tmin = t0, tmax = t1;
  const lo = [b.x0 - r, b.y0 - r, b.z0 - r], hi = [b.x1 + r, b.y1 + r, b.z1 + r];
  const o = [x, y, z], d = [dx, dy, dz];
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-9) { if (o[a] < lo[a] || o[a] > hi[a]) return false; continue; }
    let ta = (lo[a] - o[a]) / d[a], tb = (hi[a] - o[a]) / d[a];
    if (ta > tb) { const s = ta; ta = tb; tb = s; }
    if (ta > tmin) tmin = ta;
    if (tb < tmax) tmax = tb;
    if (tmin > tmax) return false;
  }
  return true;
}
const segBuf = new Int32Array(512);
export function segmentClear(city, x, y, z, x2, y2, z2, r, ignore = -1) {
  const n = boxesInRect(city, Math.min(x, x2) - r, Math.min(z, z2) - r, Math.max(x, x2) + r, Math.max(z, z2) + r, segBuf);
  const dx = x2 - x, dy = y2 - y, dz = z2 - z;
  for (let k = 0; k < n; k++) {
    const b = city.boxes[segBuf[k]];
    if (b.i === ignore) continue;
    if (segHitsBox(b, x, y, z, dx, dy, dz, r)) return false;
  }
  return true;
}
// distance from a point to the nearest solid surface (boxes in this cell + street), capped
export function clearance(city, x, y, z, cap = 8) {
  const c = city.bgrid.at(x, z);
  let best = Math.min(cap, y);
  for (let k = 0; k < c.length; k++) {
    const b = city.boxes[c[k]];
    const qx = x < b.x0 ? b.x0 : x > b.x1 ? b.x1 : x;
    const qy = y < b.y0 ? b.y0 : y > b.y1 ? b.y1 : y;
    const qz = z < b.z0 ? b.z0 : z > b.z1 ? b.z1 : z;
    const d = Math.hypot(x - qx, y - qy, z - qz);
    if (d < best) best = d;
  }
  return best;
}
export function insideAny(city, x, y, z, r = 0) {
  const c = city.bgrid.at(x, z);
  for (let k = 0; k < c.length; k++) {
    const b = city.boxes[c[k]];
    if (x > b.x0 - r && x < b.x1 + r && y > b.y0 - r && y < b.y1 + r && z > b.z0 - r && z < b.z1 + r) return true;
  }
  return false;
}
// highest roof under (x, z) at or below y (for shadows / landing), 0 = street
export function roofBelow(city, x, z, y) {
  const c = city.bgrid.at(x, z);
  let best = 0;
  for (let k = 0; k < c.length; k++) {
    const b = city.boxes[c[k]];
    if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.y1 <= y + 0.01 && b.y1 > best) best = b.y1;
  }
  return best;
}
