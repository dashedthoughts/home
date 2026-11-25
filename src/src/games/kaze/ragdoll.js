// Ragdoll: an articulated verlet body for falls, deaths and knockdowns. Particles: pelvis, chest (the neck base), head,
// back knee, back ankle, front knee, front ankle, the hand. Bones keep their length; the joints keep human limits: the head
// turns at most about 30 degrees on the neck, knees bend one way only, a thigh never folds up through the chest. The body
// settles on the ground line with friction and a small bounce. Deterministic: a fixed 1/120 s step.
export const RAG_STEP = 1 / 120;
const PEL = 0, CHE = 1, HEAD = 2, KB = 3, AB = 4, KF = 5, AF = 6, HAND = 7;
const MASS = [3, 3, 1.4, 1, 0.8, 1, 0.8, 0.5];
export const HEAD_LIMIT = 0.52, HIP_DOT = 0.82;

// from a drawn figure's geometry (drawFigure's return): start where the animated body was, with an impulse
export function makeRag(geo, f, sc, imp = [0, 0]) {
  const L = geo.legs, p = [geo.H, geo.N, geo.Hd, [L[0][0], L[0][1]], [L[0][2], L[0][3]], [L[1][0], L[1][1]], [L[1][2], L[1][3]], geo.G].map((q) => [q[0], q[1]]);
  const h = RAG_STEP, prev = p.map((q, i) => { const k = i === HEAD || i === CHE ? 1.25 : i === PEL ? 0.8 : 0.6; return [q[0] - imp[0] * k * h, q[1] - imp[1] * k * h]; });
  const d = (a, b) => Math.hypot(p[a][0] - p[b][0], p[a][1] - p[b][1]);
  const bones = [[PEL, CHE, d(PEL, CHE)], [CHE, HEAD, d(CHE, HEAD)], [PEL, KB, d(PEL, KB)], [KB, AB, d(KB, AB)], [PEL, KF, d(PEL, KF)], [KF, AF, d(KF, AF)]];
  return { p, prev, bones, f, sc, acc: 0, rest: 0, settled: false, t: 0, touched: false, handMax: 36 * sc, handMin: 8 * sc, rad: [6, 6, 9.5, 3, 1, 3, 1, 1.5].map((v) => v * sc) };
}

const rot = (o, q, a) => { const c = Math.cos(a), s = Math.sin(a), x = q[0] - o[0], y = q[1] - o[1]; q[0] = o[0] + x * c - y * s; q[1] = o[1] + x * s + y * c; };
function limits(r) {
  const p = r.p, q = r.prev, f = r.f;
  // a limit moves a point and its previous position together, so it corrects the shape without launching the body
  const rot2 = (o, i, a) => { const ox = o[0], oy = o[1]; rot([ox, oy], p[i], a); rot([ox, oy], q[i], a); };
  // the head on the neck
  { const tx = p[CHE][0] - p[PEL][0], ty = p[CHE][1] - p[PEL][1], nx = p[HEAD][0] - p[CHE][0], ny = p[HEAD][1] - p[CHE][1];
    let a = Math.atan2(ny, nx) - Math.atan2(ty, tx); while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
    if (Math.abs(a) > HEAD_LIMIT) rot2(p[CHE], HEAD, (Math.sign(a) * HEAD_LIMIT) - a); }
  for (const [K, A] of [[KB, AB], [KF, AF]]) {
    // the hip: the thigh never folds into the chest
    const ux = p[CHE][0] - p[PEL][0], uy = p[CHE][1] - p[PEL][1], ul = Math.hypot(ux, uy) || 1, dx = p[K][0] - p[PEL][0], dy = p[K][1] - p[PEL][1], dl = Math.hypot(dx, dy) || 1;
    const dot = (ux * dx + uy * dy) / (ul * dl); if (dot > HIP_DOT) { const cur = Math.acos(Math.min(1, dot)), want = Math.acos(HIP_DOT), s = Math.sign(ux * dy - uy * dx) || f; rot2(p[PEL], K, s * (want - cur)); rot2(p[PEL], A, s * (want - cur)); }
    // the knee bends one way only: reflect it across the hip-ankle line if it has flipped
    const tx = p[K][0] - p[PEL][0], ty = p[K][1] - p[PEL][1], sx = p[A][0] - p[K][0], sy = p[A][1] - p[K][1];
    if ((tx * sy - ty * sx) * f < 0) { const ax = p[A][0] - p[PEL][0], ay = p[A][1] - p[PEL][1], al2 = ax * ax + ay * ay || 1, t = (tx * ax + ty * ay) / al2, mx = p[PEL][0] + ax * t, my = p[PEL][1] + ay * t;
      const nx = 2 * mx - p[K][0], ny = 2 * my - p[K][1]; q[K][0] += nx - p[K][0]; q[K][1] += ny - p[K][1]; p[K][0] = nx; p[K][1] = ny; }
  }
}
function bones(r) {
  const p = r.p;
  const gw = (i) => (r.gy && p[i][1] >= r.gy(p[i][0]) - r.rad[i] - 0.05 ? 0.15 : 1); // a point on the ground is hard to move
  for (const [a, b, L] of r.bones) { const dx = p[b][0] - p[a][0], dy = p[b][1] - p[a][1], d = Math.hypot(dx, dy) || 1e-3, k = (d - L) / d, wa = gw(a) / MASS[a], wb = gw(b) / MASS[b], s = wa + wb;
    p[a][0] += dx * k * wa / s; p[a][1] += dy * k * wa / s; p[b][0] -= dx * k * wb / s; p[b][1] -= dy * k * wb / s; }
  // the hand hangs from the chest within arm's reach
  { const dx = p[HAND][0] - p[CHE][0], dy = p[HAND][1] - p[CHE][1], d = Math.hypot(dx, dy) || 1e-3, c = Math.max(r.handMin, Math.min(r.handMax, d)); p[HAND][0] = p[CHE][0] + dx / d * c; p[HAND][1] = p[CHE][1] + dy / d * c; }
}
function ground(r, gy, vy0, first) {
  const p = r.p, q = r.prev;
  for (let i = 0; i < p.length; i++) { const g = gy(p[i][0]) - r.rad[i]; if (p[i][1] > g) { p[i][1] = g; if (first) { const vx = p[i][0] - q[i][0]; q[i][0] = p[i][0] - vx * (i === AB || i === AF || i === KB || i === KF ? 0.85 : 0.35); } q[i][1] = Math.min(q[i][1], p[i][1] + Math.max(0, vy0[i]) * 0.22); /* a small bounce, never a launch */ if (i === PEL || i === CHE) r.touched = true; } }
}
export function stepRag(r, dt, gy) {
  r.gy = gy; r.acc += Math.min(dt, 0.1); r.t += Math.min(dt, 0.1); const h = RAG_STEP, G = 1400 * h * h; let n = 0;
  while (r.acc >= h && n < 14) { r.acc -= h; n++;
    const p = r.p, q = r.prev, vy0 = [];
    const dmp = r.touched ? 0.94 : 0.995, vmax = 8 * r.sc; // once down the body loses energy fast; no particle ever outruns a fall
    for (let i = 0; i < p.length; i++) { let vx = (p[i][0] - q[i][0]) * dmp, vy = (p[i][1] - q[i][1]) * dmp; const vm = Math.hypot(vx, vy); if (vm > vmax) { vx *= vmax / vm; vy *= vmax / vm; } vy0.push(vy); q[i][0] = p[i][0]; q[i][1] = p[i][1]; p[i][0] += vx; p[i][1] += vy + G; }
    // a limp leg falls straight: the ankle eases toward the line of the thigh (muscles let go)
    if (r.touched) for (const [K, A] of [[KB, AB], [KF, AF]]) { const tx = p[K][0] - p[PEL][0], ty = p[K][1] - p[PEL][1], tl = Math.hypot(tx, ty) || 1, sl = Math.hypot(p[A][0] - p[K][0], p[A][1] - p[K][1]); const wx = p[K][0] + tx / tl * sl, wy = p[K][1] + ty / tl * sl; p[A][0] += (wx - p[A][0]) * 0.012; p[A][1] = Math.min(p[A][1] + (wy - p[A][1]) * 0.012, gy(p[A][0]) - r.rad[A]); }
    for (let it = 0; it < 40; it++) { ground(r, gy, vy0, it === 0); limits(r); bones(r); }
    limits(r);
    // no pops: a substep never moves the body's core further than a fast fall would
    { const cm = 3.2 * r.sc; for (const i of [PEL, CHE, HEAD]) { const dx = p[i][0] - q[i][0], dy = p[i][1] - q[i][1], d = Math.hypot(dx, dy); if (d > cm) { p[i][0] = q[i][0] + dx / d * cm; p[i][1] = q[i][1] + dy / d * cm; } } }
    for (let k = 0; k < 4; k++) { ground(r, gy, vy0, false); bones(r); bones(r); limits(r); }
    let ke = 0; for (const i of [PEL, CHE, HEAD]) ke += Math.abs(p[i][0] - q[i][0]) + Math.abs(p[i][1] - q[i][1]);
    r.rest = ke < 0.03 * r.sc ? r.rest + h : 0; if (r.rest > 0.25) r.settled = true;
  }
  if (n === 14) r.acc = 0;
  return r;
}
// the ragdoll as a pose drawFigure can paint (rag = 1: the hips and hands are placed exactly where the body is)
export function ragPose(r, x, y, base, lerpPose) {
  const p = r.p, f = r.f, sc = r.sc, P = lerpPose(base, base, 0, {});
  P.rag = 1; P.kneel = 0; P.gait = 0;
  P.hx = (p[PEL][0] - x) * f / sc; P.hy = (p[PEL][1] - y) / sc;
  P.lean = Math.atan2((p[CHE][0] - p[PEL][0]) * f, -(p[CHE][1] - p[PEL][1]));
  const na = Math.atan2((p[HEAD][0] - p[CHE][0]) * f, -(p[HEAD][1] - p[CHE][1])); let dh = na - P.lean; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI; P.head = Math.max(-0.33, Math.min(0.33, dh * 2));
  P.fb = [(p[AB][0] - x) * f / sc, (p[AB][1] - y) / sc]; P.ff = [(p[AF][0] - x) * f / sc, (p[AF][1] - y) / sc];
  P.grip = [(p[HAND][0] - p[PEL][0]) * f / sc, (p[HAND][1] - p[PEL][1]) / sc];
  P.rk = 0;
  return P;
}
// the checks for ragdoll frames: bone lengths within 2 percent, the joint limits, nothing below the ground
export function checkRag(r, gy) {
  const bad = [], p = r.p, f = r.f;
  for (const [a, b, L] of r.bones) { const d = Math.hypot(p[b][0] - p[a][0], p[b][1] - p[a][1]); if (Math.abs(d - L) > 0.02 * L + 0.05) bad.push(`bone ${a}-${b} ${d.toFixed(1)} vs ${L.toFixed(1)}`); }
  { const tx = p[CHE][0] - p[PEL][0], ty = p[CHE][1] - p[PEL][1], nx = p[HEAD][0] - p[CHE][0], ny = p[HEAD][1] - p[CHE][1]; let a = Math.atan2(ny, nx) - Math.atan2(ty, tx); while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; if (Math.abs(a) > HEAD_LIMIT + 0.03) bad.push(`head ${(a * 57.3).toFixed(0)} deg on the neck`); }
  for (const [K, A] of [[KB, AB], [KF, AF]]) { const tx = p[K][0] - p[PEL][0], ty = p[K][1] - p[PEL][1], sx = p[A][0] - p[K][0], sy = p[A][1] - p[K][1]; if ((tx * sy - ty * sx) * f < -0.5 * r.sc * r.sc) bad.push('knee bent the wrong way');
    const ux = p[CHE][0] - p[PEL][0], uy = p[CHE][1] - p[PEL][1], dot = (ux * tx + uy * ty) / ((Math.hypot(ux, uy) * Math.hypot(tx, ty)) || 1); if (dot > HIP_DOT + 0.03) bad.push('thigh through the chest'); }
  for (let i = 0; i < p.length; i++) if (p[i][1] > gy(p[i][0]) + 0.5) bad.push(`particle ${i} below the ground`);
  return bad;
}
