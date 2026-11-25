// Cloth: garment geometry and a tiny deterministic solver for hems and sleeves.
// Every garment panel is a CONVEX envelope around the limb inside it (a hull of waist, knee and hem points), so an
// outline can never cross itself, pinch at a joint or detach. The hem and the sleeve bags are short chains of points
// on damped springs toward where gravity would hang them, stepped at a fixed 1/120 s, then constrained so they can
// never invert or pass through the ground.

export const CLOTH_STEP = 1 / 120;
const W = 14, Z = 0.42; // spring: about one overshoot, settled within half a second

// monotone-chain convex hull; consistent orientation; near-duplicate points merged
export function hull(P) {
  const pts = []; for (const p of P) if (p && isFinite(p[0]) && isFinite(p[1])) pts.push([p[0], p[1]]);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  up.pop(); lo.pop(); const H = lo.concat(up), out = [];
  for (const p of H) { const q = out[out.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1.2) out.push(p); }
  while (out.length > 3 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1.2) out.pop();
  return out;
}
// corner rounding that stays inside the polygon and keeps it convex: each corner is cut a fixed small distance along
// its two edges (never more than 30% of an edge) with one point on the curve between, so long edges stay straight
export function soften(P, r = 3) {
  const n = P.length, out = []; if (n < 3) return P.slice();
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], v = P[i], b = P[(i + 1) % n], la = Math.hypot(a[0] - v[0], a[1] - v[1]) || 1, lb = Math.hypot(b[0] - v[0], b[1] - v[1]) || 1;
    const ka = Math.min(r / la, 0.3), kb = Math.min(r / lb, 0.3), p1 = [v[0] + (a[0] - v[0]) * ka, v[1] + (a[1] - v[1]) * ka], p2 = [v[0] + (b[0] - v[0]) * kb, v[1] + (b[1] - v[1]) * kb];
    out.push(p1, [p1[0] * 0.25 + v[0] * 0.5 + p2[0] * 0.25, p1[1] * 0.25 + v[1] * 0.5 + p2[1] * 0.25], p2);
  }
  return out;
}
// is q inside convex polygon P (any orientation), with a margin that shrinks P
export function insideConvex(P, q, margin = 0) {
  let sgn = 0; const n = P.length; if (n < 3) return false;
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1;
    const c = (ex * (q[1] - a[1]) - ey * (q[0] - a[0])) / l;
    if (Math.abs(c) < margin) return false;
    const s = c > 0 ? 1 : -1; if (!sgn) sgn = s; else if (s !== sgn) return false;
  }
  return true;
}

// ---------- the solver ----------
// st: { p: [[x,y]...], v: [[vx,vy]...], acc }. T: targets. C: constraint list per point { K, dmin, dmax, dev, T }.
export function stepChain(st, T, cons, o) {
  const n = T.length, far = o.far || 90;
  let reset = !st.p || st.p.length !== n || o.reset;
  if (!reset) for (let i = 0; i < n; i++) if (Math.hypot(st.p[i][0] - T[i][0], st.p[i][1] - T[i][1]) > far) reset = true;
  if (reset || o.reduced) { st.p = T.map((q) => [q[0], q[1]]); st.v = T.map(() => [0, 0]); st.acc = 0; if (o.reduced) { constrain(st, T, cons, o); return st; } }
  st.acc = (st.acc || 0) + Math.min(o.dt || 0, 0.1);
  let steps = 0; const h = CLOTH_STEP, wx = (o.wind || 0) * 260, w = o.w || W, z = o.z || Z;
  while (st.acc >= h && steps < 12) {
    st.acc -= h; steps++;
    for (let i = 0; i < n; i++) { const p = st.p[i], v = st.v[i], t = T[i];
      v[0] += (w * w * (t[0] - p[0]) - 2 * z * w * v[0] + wx) * h; v[1] += (w * w * (t[1] - p[1]) - 2 * z * w * v[1]) * h;
      p[0] += v[0] * h; p[1] += v[1] * h; }
    constrain(st, T, cons, o);
  }
  if (steps === 12) st.acc = 0;
  constrain(st, T, cons, o);
  return st;
}
function constrain(st, T, cons, o) {
  const n = T.length;
  for (let it = 0; it < 4; it++) {
    // order along the facing axis is kept: the rear end of the hem stays behind the front end
    if (o.f) for (let i = 1; i < n; i++) { const gap = Math.max(((T[i][0] - T[i - 1][0]) * o.f) * 0.35, (o.minSpan || 0) / (n - 1)), s = (st.p[i][0] - st.p[i - 1][0]) * o.f; if (s < gap) { const fix = (gap - s) / 2 * o.f; st.p[i][0] += fix; st.p[i - 1][0] -= fix; } }
    for (let i = 0; i < n; i++) {
      const p = st.p[i], c = cons[i], t = T[i];
      // never too far from where it would hang
      let dx = p[0] - t[0], dy = p[1] - t[1], d = Math.hypot(dx, dy); if (d > c.dev) { p[0] = t[0] + dx / d * c.dev; p[1] = t[1] + dy / d * c.dev; }
      // a fixed band of distance from the anchor (knee or elbow): it can swing, never fold back through it
      dx = p[0] - c.K[0]; dy = p[1] - c.K[1]; d = Math.hypot(dx, dy) || 0.001;
      if (d < c.dmin) { p[0] = c.K[0] + dx / d * c.dmin; p[1] = c.K[1] + dy / d * c.dmin; }
      else if (d > c.dmax) { p[0] = c.K[0] + dx / d * c.dmax; p[1] = c.K[1] + dy / d * c.dmax; }
      // the floor: lifted to it, and slid along it if that brings it too close to the anchor
      if (o.floor != null && p[1] > o.floor - 1) { p[1] = o.floor - 1; if (st.v[i][1] > 0) st.v[i][1] = 0;
        const vy = p[1] - c.K[1], dd = Math.hypot(p[0] - c.K[0], vy); if (dd < c.dmin && Math.abs(vy) < c.dmin) { const r = Math.sqrt(c.dmin * c.dmin - vy * vy); let side = Math.sign((p[0] - c.K[0]) || (t[0] - c.K[0]) || 1);
          if (Math.hypot(c.K[0] + side * r - t[0], p[1] - t[1]) > c.dev) side = Math.sign((t[0] - c.K[0]) || 1); p[0] = c.K[0] + side * r; } }
    }
  }
  // if the constraints still disagree (a pose that folds the knee onto the floor), the point goes to where it
  // would hang, which satisfies all of them, and loses its speed
  for (let i = 0; i < n; i++) { const p = st.p[i], c = cons[i], t = T[i], d = Math.hypot(p[0] - c.K[0], p[1] - c.K[1]);
    if (d < c.dmin - 0.3 || d > c.dmax + 0.3 || Math.hypot(p[0] - t[0], p[1] - t[1]) > c.dev + 0.3 || (o.floor != null && p[1] > o.floor - 0.7)) { p[0] = t[0]; p[1] = Math.min(t[1], o.floor != null ? o.floor - 1 : t[1]); st.v[i][0] *= 0.3; st.v[i][1] = 0; } }
}

// ---------- hakama ----------
// One garment: a waist with its back board; per leg a convex envelope from the waist through a ring around the knee to
// a hem chain; a gusset that fills between the thighs above the split. Returns targets; the caller steps the chains.
export function hakamaTargets(q) {
  const { H, legs, f, nf, dn, sc, bulk, hl, groundY } = q;
  let st = q.stride || 0, Bh = 110 * sc, wW = 15 * sc * bulk, wk = 19 * sc * Math.sqrt(bulk), hemW0 = Math.max((hl >= 0.8 ? 0.17 : 0.11) * Bh, 26 * sc * Math.sqrt(bulk) * Math.min(1, hl + 0.35)), hemW = hemW0 + ((hl >= 0.8 ? 0.168 : 0.11) * Bh - hemW0) * st;
  const Wb = [H[0] - nf[0] * wW / 2 - dn[0] * 2 * sc, H[1] - nf[1] * wW / 2 - dn[1] * 2 * sc], Wf = [H[0] + nf[0] * wW / 2 - dn[0] * 2 * sc, H[1] + nf[1] * wW / 2 - dn[1] * 2 * sc];
  // the hips flare out below the cinched waist
  const Hb = [H[0] - nf[0] * (wW / 2 + 3.2 * sc) + dn[0] * 8 * sc, H[1] - nf[1] * (wW / 2 + 3.2 * sc) + dn[1] * 8 * sc], Hf = [H[0] + nf[0] * (wW / 2 + 3.2 * sc) + dn[0] * 8 * sc, H[1] + nf[1] * (wW / 2 + 3.2 * sc) + dn[1] * 8 * sc];
  const S = (p) => (p[0] - H[0]) * f; // position along the facing axis
  // when the legs spread (lunge, crouch, standoff, stride) the hakama splits: each leg's panel follows its own leg
  const legLen = 62 * sc, dA = Math.hypot(legs[0].fx - legs[1].fx, legs[0].fy - legs[1].fy), spread = q.kneel ? 0 : Math.min(1, Math.max(0, (dA / legLen - 0.4) / 0.15));
  // split legs are trousers, not bell-bottoms: about 1.6 legs wide at the knee, gently flared to about 1.4x that at the hem
  // the split eases in and out over about 0.15 s, so a garment never pops between a skirt and two trouser legs
  let spl = q.rag || (q.kneel && q.fk) ? 1 : Math.max(st, spread); if (q.prevSplit != null && !q.reduced) spl = q.prevSplit + Math.max(-q.dt * 7, Math.min(q.dt * 7, spl - q.prevSplit)); wk += (15 * sc * Math.max(1, Math.sqrt(bulk)) - wk) * spl; hemW += (Math.min(hemW, (hl >= 0.8 ? 0.165 : 0.11) * Bh) - hemW) * spl;
  const out = { Bh, wW, wk, hemW, Wb, Wf, Hb, Hf, legs: [], r: 2.5 * sc, stride: st, split: spl, legLen, dA };
  for (const l of legs) {
    const K = [l.kx, l.ky], A = [l.fx, l.fy], J = [l.hx, l.hy];
    let tx = K[0] - J[0], ty = K[1] - J[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const ring = [[K[0] - ty * wk / 2, K[1] + tx * wk / 2], [K[0] + ty * wk / 2, K[1] - tx * wk / 2], [K[0] + tx * wk * 0.32, K[1] + ty * wk * 0.32]];
    const upKnee = q.kneel && q.fk && !l.back; // one knee up (the archer): this shin rises out of the cloth
    const lift = q.rag || upKnee ? 1 : q.kneel ? 0 : Math.max(0, Math.min(1, (groundY - A[1] - 2 * sc) / (10 * sc))); // a fallen body: each leg's cloth wraps its own shin
    const hlF = Math.min(1, hl);
    const hemYg = K[1] + (groundY - 5.5 * sc - K[1]) * hlF, hemYl = Math.min(K[1] + 27 * sc * hlF, groundY - 4 * sc);
    // the floor of the hem: a grounded full-length leg keeps its hem above the foot so the sandal shows
    const floor = lift < 0.5 && hl >= 0.8 && !q.kneel ? Math.min(groundY, A[1]) - 3.9 * sc : groundY;
    // running, a lifted leg's cloth wraps the shin and its hem rises with the foot instead of hanging to the ground
    const hemYr = upKnee ? Math.min(K[1] + (A[1] - K[1]) * 0.45, groundY - 4 * sc) : hemYl + (Math.min(hemYl, A[1] - 1 * sc) - hemYl) * Math.max(st, out.split);
    let hemY = hemYg + (hemYr - hemYg) * lift; hemY = Math.min(Math.max(hemY, K[1] + 6 * sc), floor - 1.2);
    // on a stride each hem swings to its own side: the robe parts in a V
    const out1 = l.back ? -1 : 1, cg = S(A) + out1 * (2.5 + 6 * st) * sc, kick = 0, cl = S(K) + kick, c = upKnee ? S(K) + (S(A) - S(K)) * 0.45 : cg + (cl - cg) * lift * (1 - 0.6 * st) * (1 - out.split), hw = hemW / 2 * (upKnee ? 0.62 : 1);
    let kf = -1e9; for (const r of ring) kf = Math.max(kf, S(r));
    let rearS = c - hw; if (lift > 0) rearS = Math.min(rearS, rearS + (S(Hb) - rearS) * lift * (1 - Math.max(st, out.split)));
    let frontS = Math.max(c + hw, kf + 1 * sc - (kf + 1 * sc - c - hw) * out.split); // a split leg is its own tube: its hem is not held in front of the knee if (frontS - rearS > 64 * sc) { const m = (frontS + rearS) / 2; rearS = m - 32 * sc; frontS = m + 32 * sc; }
    const T = []; for (let i = 0; i < 4; i++) { const s = rearS + (frontS - rearS) * i / 3; T.push([H[0] + f * s, hemY]); }
    // running, a lifted leg's cloth is a tapered wrap: the hem leaves the ankle and trails back and up along a diagonal,
    // so the leg reads as a narrow wedge from hip to ankle, never a block
    const wr = st * lift; if (wr > 0) { const an = 1.05, L = Math.max(hemW, 0.2 * Bh); for (let i = 0; i < 4; i++) { const u = 1 - i / 3, tx = A[0] + f * 3 * sc - f * Math.cos(an) * L * u, ty = Math.min(A[1] - 1.5 * sc - Math.sin(an) * L * u, floor - 1.2); T[i][0] += (tx - T[i][0]) * wr; T[i][1] += (ty - T[i][1]) * wr; } }
    const cons = T.map((t) => { const dT = Math.hypot(t[0] - K[0], t[1] - K[1]); return { K, dmin: dT * 0.55, dmax: dT * 1.2 + 2 * sc, dev: Math.max(6 * sc, dT * (0.9 - 0.65 * out.split)) }; });
    // a full-length hakama always wraps the shin down to the ankle: the foot can never float free of the cloth
    // the cloth wraps the shin to the ankle, never thinner than the leg inside it
    const sx = A[0] - K[0], sy = A[1] - K[1], sl = Math.hypot(sx, sy) || 1, nx = -sy / sl, ny = sx / sl, cy = (v) => Math.min(v, groundY - 1);
    const ank = q.full ? [[A[0] - 3.5 * sc, A[1] - 6.5 * sc], [A[0] + 3.5 * sc, A[1] - 6.5 * sc], [A[0], A[1] - 3.2 * sc], [A[0] - sx / sl * 4 * sc + nx * 5.5 * sc, cy(A[1] - sy / sl * 4 * sc + ny * 5.5 * sc)], [A[0] - sx / sl * 4 * sc - nx * 5.5 * sc, cy(A[1] - sy / sl * 4 * sc - ny * 5.5 * sc)]] : [];
    out.legs.push({ K, A, J, ring, ank, T, cons, lift, back: l.back, hemY, floor, wrap: st * lift });
  }
  return out;
}
// polygons from targets plus the solved hem chains
export function hakamaPolys(G, chains) {
  const legs = G.legs.map((l, i) => {
    // on a running stride each leg's panel takes its own half of the waist, so the two legs part and read as legs
    const st = G.split || 0, L2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const waist = st > 0 ? (l.back ? [G.Wb, G.Hb, L2(G.Wb, G.Wf, 1 - 0.45 * st), L2(G.Hb, G.Hf, 1 - 0.45 * st)] : [L2(G.Wb, G.Wf, 0.45 * st), L2(G.Hb, G.Hf, 0.45 * st), G.Wf, G.Hf]) : [G.Wb, G.Wf, G.Hb, G.Hf];
    // the thigh: this leg's half of the waist to the knee; the shin: the knee down to the hem (reaching up to the waist
    // when the legs are together, so a standing hakama stays one hanging garment)
    const hem = chains[i], top = [...waist.map((w) => L2(w, l.K, st * 0.92)), ...l.ring, ...l.ank], thigh = soften(hull([...waist, ...l.ring]), G.r);
    // the hem is never narrower than the cloth above it: if the chain has swung so that the envelope would narrow
    // toward the hem, its two ends are carried outward along the hem line (the cloth hangs from the knee, it does
    // not pinch under it)
    let e0 = hem[0], e3 = hem[3]; const W = [(G.Wb[0] + G.Wf[0]) / 2, (G.Wb[1] + G.Wf[1]) / 2];
    for (let it = 0; it < (l.wrap > 0.3 || st > 0.5 ? 0 : 5); it++) { // a split leg or a running wrap is a tube on its own axis // a running wrap is a tapered wedge by design
      const P = hull([...top, e0, hem[1], hem[2], e3]), hc = [(e0[0] + e3[0]) / 2, (e0[1] + e3[1]) / 2];
      const dx = e3[0] - e0[0], dy = e3[1] - e0[1], dl = Math.hypot(dx, dy) || 1, d = [dx / dl, dy / dl];
      // a split leg is a tube along its own axis (knee to hem), measured across that axis
      const ws = legWidths(P, st > 0.5 ? l.K : W, hc, 10, d); let mx = 0; for (const v of ws) mx = Math.max(mx, v);
      const def = mx - ws[ws.length - 1] + G.r * 0.8; if (def < 0.4) break; // a margin for the rounded corners
      const k = def * 0.6 + 0.5; // a split leg widens only on its outer side, never into the gap between the legs
      if (st > 0.5) { if (l.back) e0 = [e0[0] - d[0] * k * 2, e0[1] - d[1] * k * 2]; else e3 = [e3[0] + d[0] * k * 2, e3[1] + d[1] * k * 2]; } else { e0 = [e0[0] - d[0] * k, e0[1] - d[1] * k]; e3 = [e3[0] + d[0] * k, e3[1] + d[1] * k]; }
    }
    return { hull: soften(hull([...top, e0, hem[1], hem[2], e3]), G.r), thigh, hem, ends: [e0, e3], l };
  });
  // the gusset fills between the thighs; on a running stride it reaches only part way down, so the robe opens up the front
  const [B, F] = G.legs, gk = 1 - 0.8 * (G.split || 0), kB = [B.J[0] + (B.K[0] - B.J[0]) * gk, B.J[1] + (B.K[1] - B.J[1]) * gk], kF = [F.J[0] + (F.K[0] - F.J[0]) * gk, F.J[1] + (F.K[1] - F.J[1]) * gk];
  const mid = [(kB[0] + kF[0]) / 2, (kB[1] + kF[1]) / 2 + 2];
  const gusset = soften(hull([G.Wb, G.Wf, G.Hb, G.Hf, kB, kF, mid]), G.r);
  return { legs, gusset };
}

// ---------- checks (used by test.mjs and the in-browser checker) ----------
function segX(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
}
export function selfIntersects(P) {
  const n = P.length;
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (segX(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return true; }
  return false;
}
// chord of a polygon along the line through p with direction d (both sides), length
export function chord(P, p, d) {
  let lo = Infinity, hi = -Infinity; const n = P.length;
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n];
    // intersect segment ab with line p + t d
    const ex = b[0] - a[0], ey = b[1] - a[1], den = d[0] * ey - d[1] * ex; if (Math.abs(den) < 1e-9) continue;
    const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den, u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
    if (u >= -1e-6 && u <= 1 + 1e-6) { lo = Math.min(lo, t); hi = Math.max(hi, t); } }
  return hi > lo ? hi - lo : 0;
}
// envelope widths of one leg, sampled from the waist to the hem perpendicular to the leg's cloth axis
export function legWidths(poly, top, bot, n = 8, across) {
  const ax = bot[0] - top[0], ay = bot[1] - top[1], l = Math.hypot(ax, ay) || 1, d = across || [-ay / l, ax / l], out = [];
  for (let i = 0; i <= n; i++) { const u = 0.06 + 0.84 * i / n; out.push(chord(poly, [top[0] + ax * u, top[1] + ay * u], d)); }
  return out;
}

// Assert the garment rules on one drawn frame. G is fig.garment. Returns a list of failures (empty when good).
export function checkGarment(G, o = {}) {
  const bad = [], sc = G.sc || 1, Bh = G.Bh, fin = (P) => P.every((q) => isFinite(q[0]) && isFinite(q[1]));
  const polys = [['gusset', G.gusset], ...G.legs.map((l, i) => ['leg' + i, l.poly]), ...G.legs.filter((l) => l.thigh).map((l, i) => ['thigh' + i, l.thigh]), ...G.sleeves.map((s) => ['sleeve' + s.k, s.poly])];
  for (const [n, P] of polys) { if (!P || P.length < 3 || !fin(P)) { bad.push(n + ': degenerate'); continue; } if (selfIntersects(P)) bad.push(n + ': self-intersection'); }
  const W = [(G.HG.Wb[0] + G.HG.Wf[0]) / 2, (G.HG.Wb[1] + G.HG.Wf[1]) / 2];
  // legs apart: the hakama is split, so the paper between the two shins is open (no sheet stretched between the legs).
  // Tested midway between the two shins whenever they are more than two trouser-legs apart.
  if (!G.kneel && G.HG && G.HG.dA > 0.6 * G.HG.legLen && G.HG.split > 0.9) { const [a, b] = G.legs, ma = [(a.K[0] + a.A[0]) / 2, (a.K[1] + a.A[1]) / 2], mb = [(b.K[0] + b.A[0]) / 2, (b.K[1] + b.A[1]) / 2];
    const segD = (p, a2, b2) => { const vx = b2[0] - a2[0], vy = b2[1] - a2[1], t = Math.max(0, Math.min(1, ((p[0] - a2[0]) * vx + (p[1] - a2[1]) * vy) / (vx * vx + vy * vy || 1))); return Math.hypot(p[0] - a2[0] - vx * t, p[1] - a2[1] - vy * t); };
    const p = [(ma[0] + mb[0]) / 2, (ma[1] + mb[1]) / 2], clear = G.legs.every((l) => segD(p, l.J, l.K) > 13 * sc && segD(p, l.K, l.A) > 13 * sc);
    if (clear && Math.hypot(ma[0] - mb[0], ma[1] - mb[1]) > 24 * sc) {
      const hit = [['gusset', G.gusset], ...G.legs.map((l, i) => ['shin' + i, l.poly]), ...G.legs.map((l, i) => ['thigh' + i, l.thigh])].find(([, P]) => P && insideConvex(P, p, 0)); if (hit) bad.push(`cloth stretched between the legs (a tent: ${hit[0]})`); } }
  G.legs.forEach((l, i) => {
    const hc = [(l.hem[0][0] + l.hem[3][0]) / 2, (l.hem[0][1] + l.hem[3][1]) / 2];
    const hx = l.hem[3][0] - l.hem[0][0], hy = l.hem[3][1] - l.hem[0][1], hl2 = Math.hypot(hx, hy) || 1, sp = G.HG && G.HG.split > 0.5 && !G.kneel, ws = sp ? legWidths(l.poly, l.K, [l.K[0] + (hc[0] - l.K[0]) * 0.75, l.K[1] + (hc[1] - l.K[1]) * 0.75], 8) : legWidths(l.poly, W, hc, 8, [hx / hl2, hy / hl2]), tol = 1.5 * sc;
    // a hanging leg widens monotonically to the hem; a split leg is a tube on its own axis and must not pinch
    if (sp && G.full) { let mx = 0; for (let j = 0; j < ws.length; j++) { if (ws[j] < 0.85 * mx - tol) { bad.push(`leg${i}: split leg pinches (${ws.map((v) => v.toFixed(1)).join(' ')})`); break; } mx = Math.max(mx, ws[j]); } }
    else if (!sp && !(l.wrap > 0.3)) for (let j = 1; j < ws.length; j++) if (ws[j] < ws[j - 1] - tol) { bad.push(`leg${i}: width shrinks toward the hem (${ws.map((v) => v.toFixed(1)).join(' ')})`); break; }
    const ax = hc[0] - W[0], ay = hc[1] - W[1], al = Math.hypot(ax, ay) || 1; let kw = chord(l.poly, l.K, [-ay / al, ax / al]);
    if ((sp || G.kneel) && l.J) { const tx = l.K[0] - l.J[0], ty = l.K[1] - l.J[1], tl = Math.hypot(tx, ty) || 1, d2 = [-ty / tl, tx / tl]; kw = Math.max(chord(l.poly, l.K, d2), l.thigh ? chord(l.thigh, l.K, d2) : 0); }
    if (kw < 1.6 * 8 * sc) bad.push(`leg${i}: knee envelope ${kw.toFixed(1)} < 1.6x leg`);
    const hw = Math.hypot(l.hem[3][0] - l.hem[0][0], l.hem[3][1] - l.hem[0][1]);
    if (G.hl >= 0.8 && hw < 0.16 * Bh - 0.5) bad.push(`leg${i}: hem ${hw.toFixed(1)} < 0.16 body`);
    l.hem.forEach((p, j) => { const c = l.cons[j], d = Math.hypot(p[0] - c.K[0], p[1] - c.K[1]), e = Math.hypot(p[0] - l.T[j][0], p[1] - l.T[j][1]);
      if (d < c.dmin - 0.6 || d > c.dmax + 0.6 || e > c.dev + 0.6) bad.push(`leg${i}: hem point ${j} outside its constraints (d ${d.toFixed(1)} in [${c.dmin.toFixed(1)}, ${c.dmax.toFixed(1)}], off ${e.toFixed(1)} <= ${c.dev.toFixed(1)}, y ${p[1].toFixed(1)} ground ${G.groundY})`);
      if (p[1] > G.groundY + 0.01) bad.push(`leg${i}: hem below the ground`); });
    if (G.full && !insideConvex(l.poly, [l.A[0], l.A[1] - 5 * sc])) bad.push(`leg${i}: the ankle is outside the cloth (a detached foot)`);
    const foot = G.feet[i === 0 ? 0 : 1];
    if (foot && foot.grounded && !G.kneel && G.hl >= 0.8 && l.lift < 0.5) { let my = -1e9; for (const p of l.hem) my = Math.max(my, p[1]); if (my > foot.bot - 3.5 * sc) bad.push(`leg${i}: hem covers the grounded foot`); }
  });
  if (o.rest) for (const s of G.sleeves) if (!s.tied) { const fy = Math.max(s.E[1], s.cuff[1]); for (const b of s.bag) if (b[1] < Math.min(s.E[1], s.cuff[1]) + 0.1 * Bh) bad.push(`sleeve${s.k}: bag not hanging below the forearm at rest`); }
  return bad;
}
