// ITO physics: a courier on two grapple lines. Pure and deterministic (fixed step, no DOM, no allocation in the hot path).
// The swing is a true pendulum: the line is a distance constraint to an anchor; when taut it is integrated on the sphere
// (half kick / geodesic drift / half kick), which keeps energy bounded without any fudge.
import { boxesInRect, segmentClear, clearance, roofBelow, HALF } from './city.js';

export const P = {
  G: 24, // gravity, m/s2 (a bit heavier than Earth: snappier arcs)
  R: 0.55, // body radius
  DRAG: 0.0014, // quadratic air drag
  VMAX: 62,
  LMIN: 9,
  REEL: 1.4, // line shortens this fast while held (m/s): propulsive
  RESCUE: 34, // low-altitude rescue reel speed
  CLEAR: 4.5, // lowest point of a swing stays this far above the street
  PUMP: 6.5, // forward input at the bottom of the arc adds this much tangential accel
  BRAKE: 3,
  STEER: 13,
  AIR: 7,
  DIVE_G: 2.2,
  DASH: 10, // speed added on top of max(current, DASH_MIN)
  DASH_MIN: 24,
  DASH_N: 3,
  DASH_RE: 2.6, // s per charge
  CRUISE: 40, // above this, extra drag (DRAG2 per m/s over) keeps top speed for dives and dashes
  DRAG2: 0.22,
  ZIP_V: 46,
  WALL_T: 1.5,
  BOUNCE_H: 24, // street bounce height
  RUN: 15,
  JUMP: 9.5,
  AMIN: 16, AMAX: 72, AIDEAL: 40, // anchor distance window
};

export const MODE = { AIR: 0, SWING: 1, WALL: 2, GROUND: 3, ZIP: 4 };

export function newPlayer() {
  return {
    x: 0, y: 60, z: 0, vx: 0, vy: 0, vz: 0, px: 0, py: 60, pz: 0,
    mode: MODE.AIR, ax: 0, ay: 0, az: 0, lx: 0, ly: 0, lz: 0, aimDx: 0, aimDz: -1, aIdx: -1, L: 0, lineT: 0, side: 1, hand: 1,
    dash: P.DASH_N, wnx: 0, wnz: 0, wallT: 0, wallBox: -1, wallUp: false, roof: -1, rollT: 0, landT: 0,
    zx: 0, zy: 0, zz: 0, zT: 0, zBox: -1, dive: false, diveT: 0, airT: 0, groundT: 0,
    aim: -1, zipAim: -1, aimT: 0, prevSwing: false, prevDash: false, prevZip: false, prevJumpLock: 0,
    dashT: 9, kickT: 9, releaseT: 9, perfectT: 9, bounceT: 9, closeT: 0, swingCount: 0, wantAttach: false,
    yaw: 0, // facing (renderer)
  };
}

// ---------------- swing core (shared by the game and the predictor) ----------------
// s has x,y,z,vx,vy,vz,ax,ay,az,L. ex/ey/ez = extra acceleration (world), applied tangentially.
// reel: shorten the line (angular momentum kept). Returns 1 if the line was taut this step, 0 if slack.
export function swingCore(s, dt, ex, ey, ez, reel, P_) {
  const G = P_.G;
  let dx = s.x - s.ax, dy = s.y - s.ay, dz = s.z - s.az;
  let d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
  // low-altitude rescue: never let the bottom of the arc reach the street
  const Lsafe = s.ay - (s.fl || 0) - P_.CLEAR;
  let newL = s.L;
  if (dy < 0 && newL > Lsafe) newL = Math.max(Lsafe, newL - P_.RESCUE * dt, P_.LMIN * 0.6);
  let scaleV = 1;
  if (reel && newL > P_.LMIN) { const r = Math.max(P_.LMIN, newL - P_.REEL * dt); if (newL >= s.L - 1e-9) scaleV = s.L / r; newL = r; }
  s.L = newL;
  let nx = dx / d, ny = dy / d, nz = dz / d;
  if (d > s.L) { // pull in (reel / rescue): position onto the sphere
    s.x = s.ax + nx * s.L; s.y = s.ay + ny * s.L; s.z = s.az + nz * s.L; d = s.L;
  }
  const vr = s.vx * nx + s.vy * ny + s.vz * nz;
  let tx = s.vx - vr * nx, ty = s.vy - vr * ny, tz = s.vz - vr * nz;
  const vt2 = tx * tx + ty * ty + tz * tz;
  const tension = vt2 / s.L - G * ny;
  const taut = d >= s.L - 1e-3 && (tension > 0 || vr > 0);
  if (!taut) {
    // slack: free flight inside the sphere, catch when it reaches L
    s.vx += ex * dt; s.vy += (ey - G) * dt; s.vz += ez * dt;
    s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
    dx = s.x - s.ax; dy = s.y - s.ay; dz = s.z - s.az;
    d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d > s.L) {
      nx = dx / d; ny = dy / d; nz = dz / d;
      s.x = s.ax + nx * s.L; s.y = s.ay + ny * s.L; s.z = s.az + nz * s.L;
      const r2 = s.vx * nx + s.vy * ny + s.vz * nz;
      if (r2 > 0) { s.vx -= r2 * nx; s.vy -= r2 * ny; s.vz -= r2 * nz; }
    }
    return 0;
  }
  // taut: tangential velocity, scaled by reel (conservation of angular momentum)
  if (scaleV !== 1) { tx *= scaleV; ty *= scaleV; tz *= scaleV; }
  // half kick
  let ax = ex, ay = ey - G, az = ez;
  let an = ax * nx + ay * ny + az * nz;
  tx += (ax - an * nx) * dt * 0.5; ty += (ay - an * ny) * dt * 0.5; tz += (az - an * nz) * dt * 0.5;
  // geodesic drift: rotate n toward t by angle |t| dt / L (t stays tangent: parallel transport)
  const sp = Math.sqrt(tx * tx + ty * ty + tz * tz);
  if (sp > 1e-6) {
    const ang = (sp * dt) / s.L, c = Math.cos(ang), sn = Math.sin(ang);
    const ux = tx / sp, uy = ty / sp, uz = tz / sp;
    const nnx = nx * c + ux * sn, nny = ny * c + uy * sn, nnz = nz * c + uz * sn;
    const tux = ux * c - nx * sn, tuy = uy * c - ny * sn, tuz = uz * c - nz * sn;
    nx = nnx; ny = nny; nz = nnz;
    tx = tux * sp; ty = tuy * sp; tz = tuz * sp;
  }
  s.x = s.ax + nx * s.L; s.y = s.ay + ny * s.L; s.z = s.az + nz * s.L;
  an = ax * nx + ay * ny + az * nz;
  tx += (ax - an * nx) * dt * 0.5; ty += (ay - an * ny) * dt * 0.5; tz += (az - an * nz) * dt * 0.5;
  // remove any drift off the tangent plane
  const rr = tx * nx + ty * ny + tz * nz;
  s.vx = tx - rr * nx; s.vy = ty - rr * ny; s.vz = tz - rr * nz;
  return 1;
}

// velocity redirect when a line attaches: keep the speed, lose most of the outward radial part,
// and bend the horizontal heading toward the intended direction (dx, dz) by up to TURN radians: the swing reads intent.
export const TURN = 0.9;
export function attachRedirect(s, dx = 0, dz = 0) {
  if (dx || dz) {
    const hs = Math.hypot(s.vx, s.vz);
    if (hs > 1) {
      const cur = Math.atan2(s.vx, s.vz), want = Math.atan2(dx, dz);
      let d = want - cur;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      const a = cur + Math.max(-TURN, Math.min(TURN, d));
      s.vx = Math.sin(a) * hs; s.vz = Math.cos(a) * hs;
    }
  }
  let nx = s.x - s.ax, ny = s.y - s.ay, nz = s.z - s.az;
  const d = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1e-6;
  nx /= d; ny /= d; nz /= d;
  s.L = d;
  const vr = s.vx * nx + s.vy * ny + s.vz * nz;
  if (vr > 0) {
    const tx = s.vx - vr * nx, ty = s.vy - vr * ny, tz = s.vz - vr * nz;
    const ts = Math.sqrt(tx * tx + ty * ty + tz * tz);
    const keep = ts > 0.5 ? Math.sqrt(ts * ts + 0.55 * vr * vr) / ts : 1;
    s.vx = tx * keep; s.vy = ty * keep; s.vz = tz * keep;
  }
}

// ---------------- prediction: is a swing on this anchor safe for `horizon` seconds? ----------------
const probe = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, ax: 0, ay: 0, az: 0, L: 0, fl: 0 };
const qbuf = new Int32Array(256);
export function sphereHits(city, x, y, z, r, ignore = -1) {
  if (y - r < 0) return true;
  const c = city.bgrid.at(x, z);
  for (let k = 0; k < c.length; k++) {
    const b = city.boxes[c[k]];
    if (b.i === ignore) continue;
    const qx = x < b.x0 ? b.x0 : x > b.x1 ? b.x1 : x;
    const qy = y < b.y0 ? b.y0 : y > b.y1 ? b.y1 : y;
    const qz = z < b.z0 ? b.z0 : z > b.z1 ? b.z1 : z;
    const ddx = x - qx, ddy = y - qy, ddz = z - qz;
    if (ddx * ddx + ddy * ddy + ddz * ddz < r * r) return true;
  }
  return false;
}
export const pred = { minD: 1e9 };
export function predictSafe(city, pl, ax, ay, az, horizon, dt, inflate, P_ = P, dx = 0, dz = 0, tg = null) {
  pred.minD = 1e9;
  probe.x = pl.x; probe.y = pl.y; probe.z = pl.z; probe.vx = pl.vx; probe.vy = pl.vy; probe.vz = pl.vz;
  probe.ax = ax; probe.ay = ay; probe.az = az; probe.fl = roofBelow(city, ax, az, ay - 1);
  attachRedirect(probe, dx, dz);
  const r = P_.R + inflate;
  const n = Math.ceil(horizon / dt);
  for (let k = 0; k < n; k++) {
    swingCore(probe, dt, 0, 0, 0, true, P_);
    if (probe.y < P_.R + 1.5) return false;
    if (sphereHits(city, probe.x, probe.y, probe.z, r)) return false;
    if (tg) { const d = Math.hypot(probe.x - tg.x, probe.y - tg.y, probe.z - tg.z); if (d < pred.minD) pred.minD = d; }
  }
  return true;
}

// ---------------- anchor choice: read the player's intent ----------------
// desired direction = camera forward, nudged by velocity. Ahead, above, at a useful distance, alternating sides.
// The line is drawn to the real anchor on the building edge; the pendulum pivots on a point pulled part of the way
// toward the line of travel (LAT_K), so a swing carries you down the street instead of into the facade.
// pivot lateral offset = min(|lat|, LAT_A + LAT_B |lat|): the line still reads as going to the building, the arc stays on the street
export const LAT_A = 2.5, LAT_B = 0.1;
export function pivotFor(A, a, x, z, dx, dz, out) {
  const ox = A[a * 4] - x, oz = A[a * 4 + 2] - z;
  const lat = dx * oz - dz * ox; // lateral offset along (-dz, dx)
  const al = Math.abs(lat);
  const keep = Math.min(al, LAT_A + LAT_B * al);
  const cut = (al - keep) * Math.sign(lat);
  out.x = A[a * 4] + dz * cut; out.z = A[a * 4 + 2] - dx * cut; out.y = A[a * 4 + 1];
  return out;
}
const cand = new Int32Array(1024), candS = new Float32Array(1024);
const pv = { x: 0, y: 0, z: 0 };
// guide (during a delivery run): {x, y, z, k} = the next ring and how hard to lean toward it. The desired direction
// bends toward the ring, and when the ring is near, the anchor whose predicted swing passes closest to it wins.
export function chooseAnchor(city, pl, fx, fz, P_ = P, maxChecks = 7, guide = null) {
  const A = city.anchors, g = city.agrid;
  const x = pl.x, y = pl.y, z = pl.z;
  const sp = Math.hypot(pl.vx, pl.vz);
  let dx = fx, dz = fz;
  if (sp > 4) { const w = Math.min(0.5, sp / 70); dx = dx * (1 - w) + (pl.vx / sp) * w; dz = dz * (1 - w) + (pl.vz / sp) * w; }
  let gd = 1e9;
  if (guide && guide.k > 0) {
    const gx = (guide.ax ?? guide.x) - x, gz = (guide.az ?? guide.z) - z;
    gd = Math.hypot(gx, gz);
    // lean toward the ring; much less once it is behind you (no U-turn spirals after a near miss)
    const ahead = sp > 4 ? (gx * pl.vx + gz * pl.vz) / (gd * sp) : 1;
    const k = ahead < -0.2 ? guide.k * 0.35 : guide.k;
    if (gd > 6) { const dl0 = Math.hypot(dx, dz) || 1; dx = dx / dl0 + (gx / gd) * k; dz = dz / dl0 + (gz / gd) * k; }
  }
  const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
  const near = guide && guide.k > 0 && gd < 110;
  let best = -1, bestS = -1e9, valid = 0;
  pl.aimDx = dx; pl.aimDz = dz;
  const R = P_.AMAX;
  const i0 = g.ci(x - R), i1 = g.ci(x + R), j0 = g.ci(z - R), j1 = g.ci(z + R);
  let n = 0;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const c = g.cells[i * g.n + j];
    for (let k = 0; k < c.length; k++) {
      const a = c[k];
      const ox = A[a * 4] - x, oy = A[a * 4 + 1] - y, oz = A[a * 4 + 2] - z;
      if (oy < 7) continue;
      const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
      if (r < P_.AMIN || r > P_.AMAX) continue;
      const fwd = ox * dx + oz * dz; // metres ahead
      if (fwd < 4) continue;
      const lat = dx * oz - dz * ox;
      const alat = Math.abs(lat);
      if (alat > fwd * 1.6 + 10) continue;
      // pivot geometry
      const plat = Math.min(alat, LAT_A + LAT_B * alat);
      const pr = Math.sqrt(fwd * fwd + plat * plat + oy * oy);
      const elev = oy / pr;
      if (elev < 0.35 || elev > 0.95) continue;
      let s = (1 - Math.abs(fwd - 28) / 30) * 1.2 + (1 - Math.abs(oy - 30) / 30) + (1 - Math.abs(pr - P_.AIDEAL) / 40) * 0.5;
      const side = lat > 0 ? 1 : -1;
      if (side === -pl.side) s += 0.3;
      if (alat < 3) s -= 0.3;
      if (alat > 30) s -= (alat - 30) / 30;
      if (A[a * 4 + 1] - P_.CLEAR < pr * 0.6) s -= 0.6; // rescue would cut this line very short
      if (n < 1024) { cand[n] = a; candS[n] = s; n++; }
    }
  }
  for (let check = 0; check < maxChecks && n > 0; check++) {
    let bi = 0;
    for (let k = 1; k < n; k++) if (candS[k] > candS[bi]) bi = k;
    const a = cand[bi];
    cand[bi] = cand[n - 1]; candS[bi] = candS[n - 1]; n--;
    if (!segmentClear(city, x, y, z, A[a * 4], A[a * 4 + 1], A[a * 4 + 2], 0.15)) continue;
    pivotFor(A, a, x, z, dx, dz, pv);
    if (!segmentClear(city, x, y, z, pv.x, pv.y, pv.z, 0.15)) continue;
    if (!predictSafe(city, pl, pv.x, pv.y, pv.z, 1.4, 1 / 60, 0.8, P_, dx, dz, near ? guide : null)) continue;
    if (!near) return a;
    const total = -pred.minD / 8 + (valid === 0 ? 0.25 : 0);
    if (total > bestS) { bestS = total; best = a; }
    if (++valid >= 4) break;
  }
  return best;
}

// zip target: the perch nearest the centre of the view (3D camera direction), within 15..110 m, line of sight clear
export function chooseZip(city, pl, cx, cy, cz, cone = 0.9) {
  const PR = city.perches, g = city.pgrid;
  const x = pl.x, y = pl.y + 0.5, z = pl.z;
  const RR = 110;
  const i0 = g.ci(x - RR), i1 = g.ci(x + RR), j0 = g.ci(z - RR), j1 = g.ci(z + RR);
  let best = -1, bestS = -1e9;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const c = g.cells[i * g.n + j];
    for (let k = 0; k < c.length; k++) {
      const p = c[k];
      const ox = PR[p * 4] - x, oy = PR[p * 4 + 1] + 1.2 - y, oz = PR[p * 4 + 2] - z;
      const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
      if (r < 15 || r > RR) continue;
      const cos = (ox * cx + oy * cy + oz * cz) / r;
      if (cos < cone) continue; // ~25 degree cone by default
      const s = cos * 4 - r / 120 + (oy > 0 ? 0.15 : 0);
      if (s > bestS) { bestS = s; best = p; }
    }
  }
  if (best < 0) return -1;
  // line of sight, ignoring the perch's own roof box
  if (!segmentClear(city, x, y, z, PR[best * 4], PR[best * 4 + 1] + 1.2, PR[best * 4 + 2], 0.2, PR[best * 4 + 3])) return -1;
  return best;
}

// ---------------- collisions ----------------
// resolves the body against boxes; returns contact info in `hit` (face normal of the strongest contact)
const hit = { n: 0, nx: 0, ny: 0, nz: 0, box: -1 };
export function resolve(city, pl) {
  hit.n = 0; hit.box = -1;
  const R = P.R;
  const c = city.bgrid.at(pl.x, pl.z);
  for (let k = 0; k < c.length; k++) {
    const b = city.boxes[c[k]];
    const x = pl.x, y = pl.y, z = pl.z;
    if (x < b.x0 - R || x > b.x1 + R || y < b.y0 - R || y > b.y1 + R || z < b.z0 - R || z > b.z1 + R) continue;
    const qx = x < b.x0 ? b.x0 : x > b.x1 ? b.x1 : x;
    const qy = y < b.y0 ? b.y0 : y > b.y1 ? b.y1 : y;
    const qz = z < b.z0 ? b.z0 : z > b.z1 ? b.z1 : z;
    let dx = x - qx, dy = y - qy, dz = z - qz;
    let d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    let nx, ny, nz, pen;
    if (d < 1e-6) {
      // centre inside the box: push out along the axis of least penetration (biased up)
      const px0 = x - b.x0, px1 = b.x1 - x, py1 = b.y1 - y, pz0 = z - b.z0, pz1 = b.z1 - z;
      let m = py1 * 0.8; nx = 0; ny = 1; nz = 0;
      if (px0 < m) { m = px0; nx = -1; ny = 0; nz = 0; }
      if (px1 < m) { m = px1; nx = 1; ny = 0; nz = 0; }
      if (pz0 < m) { m = pz0; nx = 0; ny = 0; nz = -1; }
      if (pz1 < m) { m = pz1; nx = 0; ny = 0; nz = 1; }
      pen = m + R;
    } else {
      if (d >= R) continue;
      nx = dx / d; ny = dy / d; nz = dz / d; pen = R - d;
    }
    pl.x += nx * pen; pl.y += ny * pen; pl.z += nz * pen;
    const vn = pl.vx * nx + pl.vy * ny + pl.vz * nz;
    // classify by dominant axis
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    let fx = 0, fy = 0, fz = 0;
    if (ay >= ax && ay >= az) fy = Math.sign(ny); else if (ax >= az) fx = Math.sign(nx); else fz = Math.sign(nz);
    if (hit.n === 0 || fy > 0 || (hit.ny <= 0 && fy === 0)) { hit.nx = fx; hit.ny = fy; hit.nz = fz; hit.box = b.i; }
    hit.n++;
    hit.vn = vn;
    if (vn < 0) { pl.vx -= vn * nx; pl.vy -= vn * ny; pl.vz -= vn * nz; }
  }
  return hit;
}

// quadratic drag, plus a stronger term above cruise speed (returns accel per unit velocity)
export function drag(v) { return P.DRAG * v + (v > P.CRUISE ? (P.DRAG2 * (v - P.CRUISE)) / v : 0); }

// ring magnet (delivery runs): an acceleration that closes the miss vector of a flight heading roughly at the ring.
// In free flight it bends the path; on a line it goes in as a tangential extra force, so the pendulum stays a pendulum.
const gacc = { x: 0, y: 0, z: 0 };
export function guideAccel(pl, g, R, swinging) {
  gacc.x = gacc.y = gacc.z = 0;
  const rx = g.x - pl.x, ry = g.y - pl.y, rz = g.z - pl.z;
  const d = Math.sqrt(rx * rx + ry * ry + rz * rz);
  if (d > R || d < 1) return gacc;
  const v = Math.sqrt(pl.vx * pl.vx + pl.vy * pl.vy + pl.vz * pl.vz);
  if (v < 8) return gacc;
  const ux = pl.vx / v, uy = pl.vy / v, uz = pl.vz / v;
  const along = rx * ux + ry * uy + rz * uz;
  if (along < d * (swinging ? 0.35 : 0.5)) return gacc;
  const ex = rx - ux * along, ey = ry - uy * along, ez = rz - uz * along;
  const tt = along / v;
  const k = Math.min(26, 2 / Math.max(tt * tt, 0.04));
  let ax = ex * k, ay = ey * k, az = ez * k;
  const al = Math.hypot(ax, ay, az), cap = swinging ? 16 : 26;
  if (al > cap) { ax *= cap / al; ay *= cap / al; az *= cap / al; }
  gacc.x = ax; gacc.y = ay; gacc.z = az;
  return gacc;
}

// ---------------- the step ----------------
// input: { mx, my (-1..1, camera space), swing, dash, zip, dive (held booleans), yaw, pitch }
const tmp = { x: 0, y: 0, z: 0 };
export function stepPlayer(city, pl, input, dt, ev, t) {
  pl.px = pl.x; pl.py = pl.y; pl.pz = pl.z;
  const G = P.G;
  // camera frame
  const sy = Math.sin(input.yaw), cy = Math.cos(input.yaw);
  const fx = -sy, fz = -cy; // camera forward (horizontal)
  const rx = cy, rz = -sy; // camera right
  let wx = fx * input.my + rx * input.mx, wz = fz * input.my + rz * input.mx;
  const wl = Math.hypot(wx, wz);
  if (wl > 1) { wx /= wl; wz /= wl; }
  const cp = Math.cos(input.pitch || 0), spi = Math.sin(input.pitch || 0);
  const cdx = fx * cp, cdy = spi, cdz = fz * cp; // camera look direction (3D)

  const swingDown = input.swing && !pl.prevSwing, swingUp = !input.swing && pl.prevSwing;
  const dashDown = input.dash && !pl.prevDash, zipDown = input.zip && !pl.prevZip;
  pl.prevSwing = input.swing; pl.prevDash = input.dash; pl.prevZip = input.zip;
  pl.dash = Math.min(P.DASH_N, pl.dash + dt / P.DASH_RE);
  pl.dashT += dt; pl.kickT += dt; pl.releaseT += dt; pl.perfectT += dt; pl.bounceT += dt; pl.landT += dt;
  if (pl.closeT > 0) pl.closeT -= dt;

  // aim refresh at 30 Hz (anchor prediction is the expensive bit)
  pl.aimT -= dt;
  if (pl.aimT <= 0) {
    pl.aimT = 1 / 30;
    pl.aim = pl.mode === MODE.SWING || pl.mode === MODE.ZIP ? -1 : chooseAnchor(city, pl, fx, fz, P, 7, input.guide || null);
    // boxed in (a podium pocket, facing a wall): during a run, look for a line toward the next ring instead
    if (pl.aim < 0 && input.guide && pl.mode !== MODE.SWING && pl.mode !== MODE.ZIP) {
      const g = input.guide, gx = g.x - pl.x, gz = g.z - pl.z, gl = Math.hypot(gx, gz);
      if (gl > 10) {
        const svx = pl.vx, svz = pl.vz;
        pl.vx = 0; pl.vz = 0; // judge the fallback by direction alone
        const a = chooseAnchor(city, pl, gx / gl, gz / gl, P, 9, null);
        pl.vx = svx; pl.vz = svz;
        if (a >= 0) { pl.aimDx = gx / gl; pl.aimDz = gz / gl; pl.aim = a; }
      }
    }
    pl.zipAim = pl.mode === MODE.ZIP ? -1 : chooseZip(city, pl, cdx, cdy, cdz, input.zipCone || 0.9);
  }

  // ---- zip ----
  if (zipDown && pl.zipAim >= 0 && pl.mode !== MODE.ZIP) {
    const PR = city.perches, k = pl.zipAim;
    pl.zx = PR[k * 4]; pl.zy = PR[k * 4 + 1] + P.R + 0.05; pl.zz = PR[k * 4 + 2]; pl.zBox = PR[k * 4 + 3];
    pl.mode = MODE.ZIP; pl.zT = 0; pl.aIdx = -1;
    ev.push({ type: 'zip' });
  }
  // ---- dash ----
  if (dashDown && pl.dash >= 1 && pl.mode !== MODE.ZIP) {
    pl.dash -= 1; pl.dashT = 0;
    let dx = cdx, dy = Math.max(-0.25, Math.min(0.45, cdy)) + 0.12, dz = cdz;
    if (wl > 0.2) { dx = dx * 0.5 + wx * 0.5; dz = dz * 0.5 + wz * 0.5; }
    const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
    const sp0 = Math.hypot(pl.vx, pl.vy, pl.vz);
    const ns = Math.max(sp0, P.DASH_MIN) + P.DASH;
    // a burst along the look direction: momentum is re-aimed, not stacked
    pl.vx = dx * ns; pl.vy = dy * ns; pl.vz = dz * ns;
    if (pl.mode === MODE.SWING || pl.mode === MODE.WALL || pl.mode === MODE.GROUND) { pl.mode = MODE.AIR; pl.aIdx = -1; }
    ev.push({ type: 'dash' });
  }

  // ---- swing input ----
  if (swingDown) pl.wantAttach = true;
  if (!input.swing) pl.wantAttach = false;
  if (pl.mode === MODE.SWING && swingUp) release(pl, ev);

  const dive = !!input.dive && (pl.mode === MODE.AIR);
  if (dive) pl.diveT += dt; else if (pl.mode !== MODE.AIR) pl.diveT = 0;
  pl.dive = dive;

  switch (pl.mode) {
    case MODE.GROUND: stepGround(city, pl, dt, wx, wz, wl, swingDown, ev); break;
    case MODE.WALL: stepWall(city, pl, dt, swingDown, ev); break;
    case MODE.ZIP: stepZip(city, pl, dt, ev); break;
    case MODE.SWING: {
      pl.lineT += dt;
      // extra forces: pump/brake along velocity (strong at the bottom), steer across it
      const vs = Math.hypot(pl.vx, pl.vy, pl.vz) || 1e-6;
      const ux = pl.vx / vs, uy = pl.vy / vs, uz = pl.vz / vs;
      const ny = (pl.y - pl.ay) / Math.max(pl.L, 1);
      const bottom = Math.max(0, -ny);
      const along = wx * ux + wz * uz;
      let ex = 0, ey = 0, ez = 0;
      if (along > 0) { const a = P.PUMP * along * bottom * bottom; ex += ux * a; ey += uy * a; ez += uz * a; }
      else if (along < 0) { const a = P.BRAKE * along; ex += ux * a; ey += uy * a; ez += uz * a; }
      const px = wx - ux * along, pz = wz - uz * along;
      ex += px * P.STEER; ez += pz * P.STEER;
      const dr = drag(vs);
      ex -= pl.vx * dr; ey -= pl.vy * dr; ez -= pl.vz * dr;
      if (input.guide && input.guide.mag) { const ga = guideAccel(pl, input.guide, input.guide.mag, true); ex += ga.x; ey += ga.y; ez += ga.z; }
      swingCore(pl, dt, ex, ey, ez, true, P);
      collide(city, pl, ev);
      // holding through the top of the arc lets go by itself (with the release throw): nobody dangles forever
      if (pl.mode === MODE.SWING) {
        if (pl.lineT > 0.45 && pl.vy > 3) pl.rose = true;
        if ((pl.rose && pl.vy < 1.2) || pl.lineT > 3.2) release(pl, ev, true);
      }
      break;
    }
    default: { // AIR
      pl.airT += dt;
      const gm = dive ? P.DIVE_G : 1;
      const vs = Math.hypot(pl.vx, pl.vy, pl.vz);
      const dr = drag(vs) * (dive ? 0.5 : 1);
      pl.vx += (wx * P.AIR - pl.vx * dr) * dt;
      pl.vz += (wz * P.AIR - pl.vz * dr) * dt;
      pl.vy += (-G * gm - pl.vy * dr) * dt;
      if (dive) { // dive: tuck forward, convert height into speed later
        const hs = Math.hypot(pl.vx, pl.vz);
        if (hs > 1) { pl.vx += (pl.vx / hs) * 4 * dt; pl.vz += (pl.vz / hs) * 4 * dt; }
      }
      if (input.guide && input.guide.mag) { const ga = guideAccel(pl, input.guide, input.guide.mag, false); pl.vx += ga.x * dt; pl.vy += ga.y * dt; pl.vz += ga.z * dt; }
      pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.z += pl.vz * dt;
      collide(city, pl, ev);
      // holding swing in the air: attach as soon as a good anchor exists (forgiving)
      if (pl.mode === MODE.AIR && input.swing && pl.aim >= 0 && (pl.wantAttach || (pl.vy < 4 && pl.releaseT > 0.3)) && pl.kickT > 0.12) attach(city, pl, pl.aim, ev);
    }
  }

  // ---- street: never a death. Bounce off an awning or car roof. ----
  if (pl.y < P.R + 0.2) {
    pl.y = P.R + 0.2;
    const hs = Math.hypot(pl.vx, pl.vz);
    pl.vy = Math.sqrt(2 * G * P.BOUNCE_H);
    const keep = Math.max(0.85, Math.min(1, 12 / Math.max(hs, 1)));
    pl.vx *= keep; pl.vz *= keep;
    if (hs < 8) { // nearly stopped: nudge forward so the bounce goes somewhere
      pl.vx += fx * 8; pl.vz += fz * 8;
    }
    pl.mode = MODE.AIR; pl.aIdx = -1; pl.bounceT = 0;
    ev.push({ type: 'bounce', x: pl.x, z: pl.z });
  }
  // ---- soft city limits ----
  const lim = HALF - 25;
  if (pl.x > lim) pl.vx -= (pl.x - lim) * 3 * dt; else if (pl.x < -lim) pl.vx += (-lim - pl.x) * 3 * dt;
  if (pl.z > lim) pl.vz -= (pl.z - lim) * 3 * dt; else if (pl.z < -lim) pl.vz += (-lim - pl.z) * 3 * dt;
  if (pl.y > 330) pl.vy = Math.min(pl.vy, 0);
  // ---- speed cap ----
  const v2 = pl.vx * pl.vx + pl.vy * pl.vy + pl.vz * pl.vz;
  if (v2 > P.VMAX * P.VMAX) { const k = P.VMAX / Math.sqrt(v2); pl.vx *= k; pl.vy *= k; pl.vz *= k; }
  // ---- close calls: fast and within a couple of metres of a wall without touching ----
  if ((pl.mode === MODE.AIR || pl.mode === MODE.SWING) && pl.closeT <= 0 && v2 > 26 * 26) {
    const cl = clearance(city, pl.x, pl.y, pl.z, 4);
    if (cl < P.R + 2.2 && cl > P.R + 0.25 && pl.y > 3) { pl.closeT = 1.2; ev.push({ type: 'close' }); }
  }
  // facing
  const hs = Math.hypot(pl.vx, pl.vz);
  if (pl.mode === MODE.WALL) pl.yaw = Math.atan2(-pl.wnx, -pl.wnz) + Math.PI;
  else if (hs > 1.5) pl.yaw = Math.atan2(pl.vx, pl.vz);
  void tmp; void t;
}

export function attach(city, pl, a, ev) {
  const A = city.anchors;
  pl.lx = A[a * 4]; pl.ly = A[a * 4 + 1]; pl.lz = A[a * 4 + 2];
  pivotFor(A, a, pl.x, pl.z, pl.aimDx, pl.aimDz, pv);
  pl.ax = pv.x; pl.ay = pv.y; pl.az = pv.z; pl.fl = roofBelow(city, pv.x, pv.z, pv.y - 1);
  pl.aIdx = a;
  attachRedirect(pl, pl.aimDx, pl.aimDz);
  pl.mode = MODE.SWING; pl.lineT = 0; pl.wantAttach = false; pl.rose = false;
  const side = pl.aimDx * (pl.lz - pl.z) - pl.aimDz * (pl.lx - pl.x) > 0 ? 1 : -1;
  pl.side = side; pl.hand = side;
  pl.swingCount++;
  pl.aim = -1; pl.aimT = 0;
  ev.push({ type: 'attach', x: pl.lx, y: pl.ly, z: pl.lz });
}

// the "perfect" window: on the way up, climbing 9-58 degrees, past the bottom, with some speed (the HUD cues it)
export function perfectWindow(pl) {
  if (pl.mode !== MODE.SWING || pl.lineT <= 0.35 || pl.vy <= 1) return false;
  const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
  const climb = pl.vy / Math.max(sp, 1e-6);
  const ny = (pl.y - pl.ay) / Math.max(pl.L, 1);
  return climb > 0.15 && climb < 0.85 && ny > -0.9 && sp > 14;
}
function release(pl, ev, auto = false) {
  const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
  // a release on the way up throws you forward and up; the sweet spot is "perfect"
  const rising = (pl.vy > 1 && pl.lineT > 0.35) || auto;
  const perfect = !auto && perfectWindow(pl);
  if (rising) {
    const hs = Math.hypot(pl.vx, pl.vz) || 1;
    const b = perfect ? 3.6 : 2.2;
    pl.vx += (pl.vx / hs) * b; pl.vz += (pl.vz / hs) * b; pl.vy += perfect ? 4.2 : 2.5;
    if (perfect) { pl.vx *= 1.03; pl.vz *= 1.03; }
  }
  pl.mode = MODE.AIR; pl.aIdx = -1; pl.releaseT = 0; pl.airT = 0; pl.aimT = 0;
  if (perfect) pl.perfectT = 0;
  ev.push({ type: 'release', perfect, rising, auto, lineT: pl.lineT, speed: sp });
}

function land(city, pl, box, ev) {
  const b = city.boxes[box];
  const fall = -pl.vy;
  pl.y = b.y1 + P.R; pl.vy = 0;
  pl.mode = MODE.GROUND; pl.roof = box; pl.aIdx = -1; pl.groundT = 0;
  const hs = Math.hypot(pl.vx, pl.vz);
  pl.rollT = fall > 9 || hs > 13 ? 0.45 : 0;
  pl.landT = 0;
  ev.push({ type: 'land', hard: fall > 14, roll: pl.rollT > 0, x: pl.x, y: b.y1, z: pl.z, fall });
}

function collide(city, pl, ev) {
  const h = resolve(city, pl);
  if (!h.n) return;
  const b = city.boxes[h.box];
  if (h.ny > 0) { // top face: land (rooftop keeps momentum)
    if (pl.vy <= 2.5 && pl.mode !== MODE.ZIP) land(city, pl, h.box, ev);
    return;
  }
  if (h.ny < 0) { pl.vy = Math.min(pl.vy, -1); return; }
  // wall: becomes a wall-run if moving with intent
  const hs = Math.hypot(pl.vx, pl.vz);
  const sp = Math.hypot(hs, pl.vy);
  if ((pl.mode === MODE.AIR || pl.mode === MODE.SWING || pl.mode === MODE.GROUND) && (sp > 6 || pl.mode === MODE.SWING) && b.y1 - pl.y > 1.2) {
    startWall(pl, h.nx, h.nz, h.box, sp, ev);
  }
}

function startWall(pl, nx, nz, box, entry, ev) {
  pl.mode = MODE.WALL; pl.aIdx = -1; pl.wnx = nx; pl.wnz = nz; pl.wallBox = box; pl.wallT = 0;
  // velocity along the wall
  const vn = pl.vx * nx + pl.vz * nz;
  pl.vx -= vn * nx; pl.vz -= vn * nz;
  const along = Math.hypot(pl.vx, pl.vz);
  // head-on: run up the wall with the speed you brought; glancing: run along it
  pl.wallUp = along < 8;
  if (pl.wallUp) { pl.vy = Math.max(pl.vy, Math.min(entry * 0.85, 30), 10); pl.vx *= 0.5; pl.vz *= 0.5; }
  else { pl.vy = Math.max(pl.vy * 0.4, 2.5); const k = Math.max(1, (entry * 0.9) / along); pl.vx *= k; pl.vz *= k; }
  ev.push({ type: 'wall', up: pl.wallUp });
}

function wallKick(pl, ev, strong) {
  const nx = pl.wnx, nz = pl.wnz;
  const out = pl.wallUp ? 9 : 10;
  pl.vx += nx * out; pl.vz += nz * out;
  pl.vy = Math.max(pl.vy, 0) * 0.5 + (strong ? 11 : 9);
  pl.mode = MODE.AIR; pl.kickT = 0; pl.airT = 0; pl.aimT = 0;
  pl.x += nx * 0.05; pl.z += nz * 0.05;
  ev.push({ type: 'kick' });
}

function stepWall(city, pl, dt, swingDown, ev) {
  const b = city.boxes[pl.wallBox];
  pl.wallT += dt;
  const G = P.G;
  if (pl.wallUp) pl.vy -= G * 0.42 * dt; else { pl.vy -= G * 0.22 * dt; pl.vy *= Math.exp(-1.2 * dt); }
  pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.z += pl.vz * dt;
  // stick to the face
  const R = P.R;
  if (pl.wnx > 0) pl.x = b.x1 + R; else if (pl.wnx < 0) pl.x = b.x0 - R;
  if (pl.wnz > 0) pl.z = b.z1 + R; else if (pl.wnz < 0) pl.z = b.z0 - R;
  // topped out: hop over onto the roof
  if (pl.y > b.y1 - 0.2) {
    pl.vy = 7.5; pl.vx -= pl.wnx * 5; pl.vz -= pl.wnz * 5; pl.y = b.y1 + 0.1;
    pl.mode = MODE.AIR; pl.kickT = 0; pl.airT = 0;
    ev.push({ type: 'vault' });
    return;
  }
  // ran off the end of the face
  const off = pl.wnx !== 0 ? pl.z < b.z0 - 0.2 || pl.z > b.z1 + 0.2 : pl.x < b.x0 - 0.2 || pl.x > b.x1 + 0.2;
  if (off || pl.y < b.y0 + 0.5) { pl.mode = MODE.AIR; pl.vx += pl.wnx * 2; pl.vz += pl.wnz * 2; pl.kickT = 0; return; }
  if (swingDown || pl.wallT > P.WALL_T || (pl.wallUp && pl.vy < -2)) wallKick(pl, ev, swingDown);
  // other boxes (a setback above, a neighbour)
  const h = resolve(city, pl);
  if (h.n && h.ny > 0) land(city, pl, h.box, ev);
}

function stepGround(city, pl, dt, wx, wz, wl, swingDown, ev) {
  const b = city.boxes[pl.roof];
  pl.groundT += dt;
  if (pl.rollT > 0) pl.rollT -= dt;
  const hs = Math.hypot(pl.vx, pl.vz);
  if (wl > 0.1) {
    const tx = wx * P.RUN, tz = wz * P.RUN;
    if (hs > P.RUN) { // carry momentum, steer it
      const k = Math.max(P.RUN, hs - 5 * dt) / hs;
      const dirx = pl.vx / hs * 0.9 + wx * 0.1 * (hs / P.RUN), dirz = pl.vz / hs * 0.9 + wz * 0.1 * (hs / P.RUN);
      const dl = Math.hypot(dirx, dirz) || 1;
      pl.vx = (dirx / dl) * hs * k; pl.vz = (dirz / dl) * hs * k;
    } else {
      const ax = tx - pl.vx, az = tz - pl.vz, al = Math.hypot(ax, az), m = 45 * dt;
      if (al > m) { pl.vx += (ax / al) * m; pl.vz += (az / al) * m; } else { pl.vx = tx; pl.vz = tz; }
    }
  } else {
    const dec = (hs > P.RUN ? 8 : 30) * dt;
    if (hs > dec) { pl.vx -= (pl.vx / hs) * dec; pl.vz -= (pl.vz / hs) * dec; } else { pl.vx = 0; pl.vz = 0; }
  }
  pl.vy = 0;
  pl.x += pl.vx * dt; pl.z += pl.vz * dt;
  pl.y = b.y1 + P.R;
  if (swingDown) {
    pl.vy = P.JUMP; pl.mode = MODE.AIR; pl.airT = 0; pl.y += 0.05;
    pl.wantAttach = true;
    ev.push({ type: 'jump' });
    return;
  }
  // walked off the edge
  if (pl.x < b.x0 - 0.1 || pl.x > b.x1 + 0.1 || pl.z < b.z0 - 0.1 || pl.z > b.z1 + 0.1) {
    pl.mode = MODE.AIR; pl.airT = 0; pl.vy = Math.min(2.5, hs * 0.1); return;
  }
  const h = resolve(city, pl);
  if (h.n && h.ny === 0) {
    const sp = Math.hypot(pl.vx, pl.vz);
    if (sp > 6 && city.boxes[h.box].y1 - pl.y > 1.2) startWall(pl, h.nx, h.nz, h.box, sp + 4, ev);
  }
}

function stepZip(city, pl, dt, ev) {
  pl.zT += dt;
  const dx = pl.zx - pl.x, dy = pl.zy - pl.y, dz = pl.zz - pl.z;
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const v = Math.min(P.ZIP_V, 12 + pl.zT * 140);
  if (d < v * dt + 0.6 || pl.zT > 3.5) {
    pl.x = pl.zx; pl.y = pl.zy; pl.z = pl.zz;
    const hx = dx / Math.max(d, 1e-6), hz = dz / Math.max(d, 1e-6);
    const hl = Math.hypot(hx, hz) || 1;
    pl.vx = (hx / hl) * 9; pl.vz = (hz / hl) * 9; pl.vy = 0;
    if (pl.zBox >= 0) { land(city, pl, pl.zBox, ev); pl.rollT = 0.3; } else { pl.mode = MODE.AIR; }
    ev.push({ type: 'perch' });
    return;
  }
  pl.vx = (dx / d) * v; pl.vy = (dy / d) * v; pl.vz = (dz / d) * v;
  pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.z += pl.vz * dt;
  const h = resolve(city, pl);
  if (h.n && h.box !== pl.zBox && h.ny === 0) { startWall(pl, h.nx, h.nz, h.box, 30, ev); pl.wallUp = true; }
}

void boxesInRect; void qbuf;
