// KAZE ambient life: crows, a frog, a watching fox, far birds, kitchen smoke,
// lantern flames, close blurred foreground silhouettes and slow light shifts within a chapter.
// Every creature is painted once with the house brush (brush.js stroke) into small cached sprites, one per pose or
// wing-beat frame, so what moves on screen is real brushwork and the per-frame cost is a few image blits.
import { rng, clamp, makeCanvas, rgba, mix, stroke, leaf, INK } from './brush.js';
import { CHAPTERS, groundH } from './data.js';
import { stoneLantern, pine } from './scenery.js';
import { drawFoxFig } from './figures.js';
import { bloomKit } from './bloom.js';

const INKW = '#2a231d';
const FLAP = 8;
const TONE_BASE = '#e9d6b0', TONE_DIM = '#cbbd9f';
const TONES = typeof document === 'undefined' ? [] : Array.from({ length: 11 }, (_, i) => mix(TONE_BASE, TONE_DIM, i / 10));

// a sprite painted in world units at `sc` pixels per unit; (ax, ay) is the anchor inside it. `flip` mirrors it.
function spr(w, h, ax, ay, sc, flip, fn) {
  const c = makeCanvas(w * sc, h * sc), g = c.getContext('2d');
  g.setTransform(flip ? -sc : sc, 0, 0, sc, flip ? (w - ax) * sc : ax * sc, ay * sc); fn(g);
  return { c, w, h, ax: flip ? w - ax : ax, ay };
}
const both = (w, h, ax, ay, sc, fn) => [spr(w, h, ax, ay, sc, false, fn), spr(w, h, ax, ay, sc, true, fn)];
const put = (g, S, x, y) => g.drawImage(S.c, x - S.ax, y - S.ay, S.w, S.h);

// ---- the creatures, facing +x, feet (or body centre in flight) at the origin ----
function crowSit(g, peck, sd) {
  const hy = peck ? 5 : 0;
  stroke(g, [[-16, -4, 0.3], [-9, -7, 0.9]], { w: 4.2, alpha: 0.95, dry: 0.45, seed: sd, taper: [0.05, 0.1], color: INKW }); // tail
  stroke(g, [[-10, -7, 0.6], [-4, -10, 1], [3, -10.5, 1], [7, -11 + hy * 0.4, 0.75]], { w: 8.5, alpha: 1, dry: 0.12, seed: sd + 1, edge: 0.7, color: INKW }); // body: one loaded blot
  stroke(g, [[6, -12 + hy, 0.8], [9.5, -13 + hy, 0.7]], { w: 5.6, alpha: 1, dry: 0.1, seed: sd + 2, color: INKW }); // head
  stroke(g, [[10.5, -13 + hy, 1], [15, -12 + hy * 1.2, 0.15]], { w: 1.7, alpha: 1, dry: 0.2, seed: sd + 3, taper: [0, 0.8], color: INKW }); // beak flick
  stroke(g, [[-7, -11, 0.5], [0, -11.5, 1], [5, -9.5, 0.4]], { w: 3.2, alpha: 0.9, dry: 0.7, seed: sd + 4, bristles: 6, color: '#120e0b' }); // folded wing, dry
  stroke(g, [[-1, -6, 1], [-2, 0, 0.5]], { w: 0.9, alpha: 0.9, dry: 0.3, seed: sd + 5, color: INKW, edge: 0 });
  stroke(g, [[2, -6, 1], [3, 0, 0.5]], { w: 0.9, alpha: 0.9, dry: 0.3, seed: sd + 6, color: INKW, edge: 0 });
}
function crowFly(g, u, sd) {
  const L = Math.cos(u * 6.2832), lag = Math.sin(u * 6.2832);
  const wing = (dx, a, s) => stroke(g, [[1 + dx, -2, 1], [-2 + dx + lag * 1.5, -2 - 8 * L * s + lag * 2, 0.9], [-7 + dx, -3 - 15 * L * s, 0.35]], { w: 5.2 * s, alpha: a, dry: 0.62, bristles: 7, seed: sd + dx, taper: [0.15, 0.55], color: INKW });
  wing(2.5, 0.55, 0.8); // far wing, behind
  stroke(g, [[-5, 0.5, 1], [-13, 2, 0.3]], { w: 3.6, alpha: 0.95, dry: 0.4, seed: sd + 1, taper: [0.05, 0.7], color: INKW }); // tail
  stroke(g, [[-6, 0, 0.6], [0, -1.2, 1], [6, -1.2, 0.8]], { w: 6.2, alpha: 1, dry: 0.12, seed: sd + 2, edge: 0.7, color: INKW }); // body blot
  stroke(g, [[6, -1.6, 0.8], [9, -2.2, 0.5]], { w: 4.4, alpha: 1, dry: 0.1, seed: sd + 3, color: INKW });
  stroke(g, [[9.5, -2.2, 1], [12.8, -1.6, 0.15]], { w: 1.3, alpha: 1, dry: 0.2, seed: sd + 4, taper: [0, 0.8], color: INKW });
  wing(0, 0.95, 1); // near wing
}
function frogSit(g, col, puff, sd) {
  // a crouched frog in profile: back as one loaded stroke rising to the head, a big folded thigh, an eye on top
  stroke(g, [[-7, -1.5, 0.6], [-4, -5.5, 1], [1.5, -6.8 - puff * 0.5, 0.95], [5.5, -5.2, 0.7], [8, -2.6, 0.3]], { w: 5.2 + puff * 0.6, alpha: 0.9, dry: 0.15, seed: sd, edge: 0.65, color: col });
  stroke(g, [[-1, -3.5, 0.9], [-6, -4.2, 1], [-8.5, -1.5, 0.8], [-3.5, -0.2, 0.4]], { w: 2.4, alpha: 0.95, dry: 0.3, seed: sd + 1, edge: 0.5, color: mix(col, INKW, 0.4) }); // thigh, folded
  stroke(g, [[-3.5, -0.2, 0.6], [1, 0, 0.2]], { w: 1.1, alpha: 0.85, dry: 0.3, seed: sd + 5, edge: 0, color: col }); // foot
  stroke(g, [[4.8, -3, 1], [5.6, 0, 0.4]], { w: 1.15, alpha: 0.95, dry: 0.3, seed: sd + 2, edge: 0, color: col }); // front leg
  stroke(g, [[3.6, -7.6, 1], [4.6, -7.7, 1]], { w: 2.2, alpha: 1, dry: 0, seed: sd + 3, edge: 0, color: INKW, taper: [0, 0] }); // eye
}
function frogHop(g, col, sd) {
  stroke(g, [[-7, 0, 0.6], [0, -3.5, 1], [6.5, -6, 0.7]], { w: 5.6, alpha: 0.92, dry: 0.18, seed: sd, edge: 0.6, color: col });
  stroke(g, [[-5, -0.5, 1], [-14, 4, 0.3]], { w: 1.7, alpha: 0.95, dry: 0.3, seed: sd + 1, color: col, taper: [0.05, 0.7] });
  stroke(g, [[-4, 0.5, 1], [-12, 6, 0.3]], { w: 1.4, alpha: 0.7, dry: 0.3, seed: sd + 2, color: col, taper: [0.05, 0.7] });
  stroke(g, [[5, -5, 1], [9.5, -2, 0.3]], { w: 1.1, alpha: 0.95, dry: 0.3, seed: sd + 3, edge: 0, color: col });
  stroke(g, [[4.4, -7.4, 1], [5.4, -7.6, 1]], { w: 1.9, alpha: 1, dry: 0, seed: sd + 4, edge: 0, color: INKW, taper: [0, 0] });
}
function mound(g, sd) {
  const R = rng(sd);
  stroke(g, [[-58, 0, 0.2], [-30, -11, 0.8], [0, -16, 1], [30, -11, 0.8], [58, 0, 0.2]], { w: 10, alpha: 0.32, dry: 0.5, seed: sd, edge: 0, color: INKW, taper: [0.3, 0.3] });
  for (let i = 0; i < 9; i++) { const x = -40 + R() * 80, y = -15 + Math.abs(x) * 0.22, h = 6 + R() * 9, a = -1.57 + (R() - 0.5) * 0.7; stroke(g, [[x, y, 1], [x + Math.cos(a) * h, y + Math.sin(a) * h, 0.15]], { w: 1.2, alpha: 0.6, dry: 0.5, seed: sd + i, edge: 0, color: INKW, taper: [0, 0.8] }); }
}
function tick(g, u, sd) { // a far bird: one check-mark stroke
  const L = Math.cos(u * 6.2832);
  stroke(g, [[-5, -2.2 * L, 0.35], [0, 0.6, 1], [5.5, -3 * L - 0.4, 0.25]], { w: 1.3, alpha: 1, dry: 0.15, seed: sd, edge: 0, color: INKW, taper: [0.3, 0.5], bristles: 3 });
}
function soft(w, h, col, a) { const c = makeCanvas(w, h), g = c.getContext('2d'), rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(0.5, rgba(col, a * 0.45)); rg.addColorStop(1, rgba(col, 0)); g.translate(0, 0); g.save(); g.scale(1, h / w); g.fillStyle = rg; g.fillRect(0, 0, w, w); g.restore(); return c; }

// a column of kitchen smoke: soft overlapping washes widening as they rise, a couple of thin dry wisps through it
function smokeCol(g, R, sd) {
  const H = 150, ph = R() * 6;
  for (let i = 0; i < 46; i++) { const u = i / 45, x = Math.sin(u * 3.2 + ph) * 9 * u + u * u * 14, y = -u * H, r = 2.5 + u * 16;
    const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, rgba('#5c544b', 0.07 * (1 - u * 0.6))); rg.addColorStop(1, rgba('#5c544b', 0)); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let k = 0; k < 2; k++) { const P = []; for (let i = 0; i <= 10; i++) { const u = i / 10; P.push([Math.sin(u * 3.2 + ph + k) * (9 + k * 4) * u + u * u * 14 + (k - 0.5) * 3, -u * H * (0.9 + k * 0.1), 1 - u * 0.8]); } stroke(g, P, { w: 1.4, alpha: 0.14, dry: 0.8, bristles: 4, seed: sd + k, edge: 0, color: '#4a433b' }); }
}
// close foreground silhouettes, painted in screen pixels and blurred (out of focus, near the lens)
function blurred(w, h, px, fn) {
  const t = makeCanvas(w, h), tg = t.getContext('2d'); fn(tg);
  const c = makeCanvas(w, h), g = c.getContext('2d');
  if ('filter' in g) { g.filter = `blur(${px}px)`; g.drawImage(t, 0, 0); g.filter = 'none'; } else { g.globalAlpha = 0.7; g.drawImage(t, 0, 0); }
  return c;
}
function fgReeds(H, sd, col) {
  const w = Math.round(H * 0.24), h = Math.round(H * 0.3), R = rng(sd);
  return { c: blurred(w, h, Math.max(2, H * 0.005), (g) => { for (let i = 0; i < 8; i++) { const x = w * (0.15 + R() * 0.7), L = h * (0.55 + R() * 0.45), bend = (R() - 0.4) * w * 0.35; stroke(g, [[x, h + 4, 1], [x + bend * 0.35, h - L * 0.5, 0.8], [x + bend, h - L, 0.1]], { w: H * (0.007 + R() * 0.006), alpha: 0.9, dry: 0.25, seed: sd + i, color: col, taper: [0, 0.7] }); } }), w, h, bottom: true };
}
function fgBranch(H, sd, kind, col, acc, paper) {
  const w = Math.round(H * 0.55), h = Math.round(H * 0.3), R = rng(sd);
  return { c: blurred(w, h, Math.max(2, H * 0.006), (g) => {
    stroke(g, [[-10, h * 0.05, 1], [w * 0.35, h * 0.22, 0.85], [w * 0.7, h * 0.36, 0.5], [w * 0.95, h * 0.5, 0.15]], { w: H * 0.022, alpha: 0.95, dry: 0.55, seed: sd, color: col, taper: [0, 0.6] });
    for (let k = 0; k < 6; k++) {
      const u = 0.15 + R() * 0.75, x0 = w * u, y0 = h * (0.05 + u * 0.45), x1 = x0 + w * (0.04 + R() * 0.08), y1 = y0 + h * (0.12 + R() * 0.2);
      stroke(g, [[x0, y0, 0.7], [x1, y1, 0.2]], { w: H * 0.007, alpha: 0.9, dry: 0.5, seed: sd + k, color: col });
      if (kind === 'bamboo') for (let m = 0; m < 3; m++) leaf(g, x1, y1, 1.2 + (R() - 0.5) * 1.2, H * (0.05 + R() * 0.03), H * 0.012, col, 0.9);
      else if (kind === 'pine') { for (let m = 0; m < 9; m++) { const a = R() * 6.28, l = H * (0.012 + R() * 0.018); stroke(g, [[x1, y1, 1], [x1 + Math.cos(a) * l, y1 + Math.sin(a) * l * 0.6, 0.2]], { w: H * 0.003, alpha: 0.85, dry: 0.4, seed: sd + k * 9 + m, edge: 0, color: col }); } g.globalAlpha = 0.9; g.fillStyle = paper; g.beginPath(); g.ellipse(x1, y1 - H * 0.006, H * 0.022, H * 0.006, 0, 0, 6.2832); g.fill(); }
      else if (kind === 'blossom') for (let m = 0; m < 7; m++) { g.globalAlpha = 0.55 + R() * 0.3; g.fillStyle = acc; g.beginPath(); g.arc(x1 + (R() - 0.5) * H * 0.05, y1 + (R() - 0.5) * H * 0.04, H * (0.006 + R() * 0.005), 0, 6.2832); g.fill(); }
      else for (let m = 0; m < 8; m++) { const a = 0.6 + R() * 1.8, l = H * (0.015 + R() * 0.02); stroke(g, [[x1, y1, 1], [x1 + Math.cos(a) * l, y1 + Math.sin(a) * l, 0.2]], { w: H * 0.004, alpha: 0.85, dry: 0.4, seed: sd + k * 7 + m, edge: 0, color: col }); } // cedar sprigs
      g.globalAlpha = 1;
    }
  }), w, h, bottom: false };
}
function fgLantern(H, sd, col) {
  const w = Math.round(H * 0.26), h = Math.round(H * 0.42);
  return { c: blurred(w, h, Math.max(2, H * 0.006), (g) => { stoneLantern(g, rng(sd), w * 0.5, h + H * 0.02, h * 1.05, { a: 0.95, ink: col }); }), w, h, bottom: true };
}

export class Life {
  constructor() {
    this.ch = -1;
    this.flock = null; this.flockT = 8; this.S = null; this.sc = 0; this.fg = null; this.fgH = 0; this.fgK = 0;
    this.sky = Array.from({ length: 2 }, (_, i) => ({ t: -4 - i * 9, life: 1 })); this.calmK = 1;
    this.dim = 0; this.bright = 0; this.toneA = 0.32; this.toneC = TONE_BASE;
  }
  gh(x) { return groundH(this.ch, x); }
  setChapter(r, s) {
    const ch = r.ch, C = CHAPTERS[ch], key = C.key, len = s.len || C.len, R = rng(ch * 31 + 7);
    this.ch = ch; this.key = key; this.S = null; this.fg = null; this.flock = null; this.flockT = 8;
    const away = (x, d) => s.ev.some((e) => (e.t === 'fight' || e.t === 'boss' || e.t === 'shrine' || e.t === 'standoff') && Math.abs(e.x - x) < d);
    // crows on the path (not by the paddies)
    this.perch = [];
    if (key !== 'terraces') for (let x = 800 + R() * 300; x < len - 500; x += 1300 + R() * 500) { if (away(x, 260)) continue; this.perch.push({ x, kind: 'crow', st: 0, t: 0, face: R() < 0.5 ? -1 : 1, ph: R() * 6, n: 1 + ((R() * 2.2) | 0) }); }
    // frogs at the path edge (bamboo, terraces)
    this.frogs = [];
    if (key === 'bamboo' || key === 'terraces') for (let x = 600 + R() * 300; x < len - 400; x += 1100 + R() * 600) { if (away(x, 200)) continue; this.frogs.push({ x, x0: x, y: 0, st: 0, t: 0, face: R() < 0.5 ? -1 : 1, ph: R() * 6 }); }
    // the fox that watches from a rise at the thousand gates (an Inari messenger)
    this.foxes = [];
    if (key === 'torii') for (const u of [0.3, 0.62]) { let x = len * u; for (let k = 0; k < 6 && away(x, 450); k++) x += 160; this.foxes.push({ x, mx: x, st: 0, t: 0, face: -1 }); }
    // lantern flames: the hanging lanterns of the snow pass and the stone lanterns along the gates
    this.lamps = [];
    if (r.props && r.props.ground) for (const pr of r.props.ground) if (pr.kind === 'lantern') this.lamps.push({ kind: 'hang', x: pr.x, seed: pr.seed });
    if (r.scene && r.scene.lights) for (const L of r.scene.lights) this.lamps.push({ kind: 'stone', x: L.x, base: L.base, h: L.h, seed: L.ph });
    // close foreground silhouettes, now and then (world x along the walk; they pass at 1.8x parallax)
    this.fgItems = [];
    // only hanging branches from the top edge (and a stone lantern at the gates): rising shapes from the bottom read as smudges
    const kinds = { bamboo: null, terraces: null, torii: ['cedar', 'lantern'], snow: ['pine', 'pine'], castle: null }[key];
    if (kinds) for (let x = 1100 + R() * 400, i = 0; x < len; x += 2300 + R() * 1000, i++) this.fgItems.push({ x, kind: kinds[i % 2], v: i % 2 });
    // the boss: the light lifts as you near it
    const b = s.ev.find((e) => e.t === 'boss'); this.bossX = b ? b.x : len;
  }
  build(sc, r) {
    const C = CHAPTERS[this.ch], paper = C.paper, key = this.key, sd = 40 + this.ch * 11;
    const S = { crowSit: [both(40, 24, 18, 20, sc, (g) => crowSit(g, 0, sd)), both(40, 24, 18, 20, sc, (g) => crowSit(g, 1, sd))], crowFly: [], frog: [], frogHop: null, mound: null, tick: [] };
    for (let i = 0; i < FLAP; i++) S.crowFly.push(both(36, 44, 18, 26, sc, (g) => crowFly(g, i / FLAP, sd + 3)));
    if (key === 'bamboo' || key === 'terraces') {
      const col = mix(INKW, key === 'bamboo' ? '#4f5c3c' : '#5d5a36', 0.4);
      S.frog = [both(22, 14, 10, 10, sc, (g) => frogSit(g, col, 0, sd + 13)), both(22, 14, 10, 10, sc, (g) => frogSit(g, col, 0.7, sd + 13))];
      S.frogHop = both(30, 20, 15, 12, sc, (g) => frogHop(g, col, sd + 17));
    }
    if (key === 'torii') S.mound = spr(130, 26, 65, 22, sc, false, (g) => mound(g, sd + 21));
    for (let i = 0; i < 3; i++) S.tick.push(spr(14, 10, 7, 5, 2, false, (g) => tick(g, i / 3, sd + 30 + i)));
    S.smoke = [spr(70, 170, 25, 160, sc, false, (g) => smokeCol(g, rng(sd + 51), sd + 51)), spr(70, 170, 25, 160, sc, false, (g) => smokeCol(g, rng(sd + 77), sd + 77))];
    S.glow = soft(64, 64, '#e8bf78', 0.55); S.pool = soft(64, 16, '#e3b56a', 0.6); S.flame = soft(16, 20, '#f3d08c', 0.95);
    this.S = S; this.sc = sc;
  }

  // ---------- screen space, between the far ranges: distant smoke, far birds; and the light of the chapter ----------
  far(g, s, dt, r) {
    if (r.ch !== this.ch) this.setChapter(r, s);
    const { W, H, k, camX } = r.v, key = this.key, red = r.reduced, night = key === 'snow';
    const sc = Math.min(4, Math.max(2, Math.round(k * 1.6 * 2) / 2)); if (!this.S || sc !== this.sc) this.build(sc, r);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // a kitchen chimney beyond the ridge: a smoke column leaning in the wind, two paintings of it slowly cross-fading (terraces, the snow pass)
    if (key === 'terraces' || key === 'snow') {
      const span = W * 2.4, bx = ((W * 0.66 - camX * 0.1 * k) % span + span) % span - W * 0.2, by = H * 0.6;
      if (bx > -W * 0.2 && bx < W * 1.2) {
        const wind = s.wind ? s.wind.w : 0.3, lean = 0.25 + wind * 0.5 + (red ? 0 : Math.sin(r.time * 0.23) * 0.1), z = k * 0.9, cyc = red ? 0.5 : 0.5 + 0.5 * Math.sin(r.time * 0.35);
        for (let i = 0; i < 2; i++) { const S2 = this.S.smoke[i]; g.setTransform(z, 0, -z * lean, z, bx, by); g.globalAlpha = (night ? 0.7 : 0.85) * (i ? cyc : 1 - cyc) * (1 - r.red); g.drawImage(S2.c, -S2.ax, -S2.ay, S2.w, S2.h); }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    if (r.fx && r.fx.petals) r.fx.petals.far(g, s, dt, r);
    const K = bloomKit(); this.kit = K;
    if (K) {
      // slow living blooms in the sky: ink drops into the wet sheet, spread, and dry (the rim outlasts the wash)
      const col = { bamboo: '#5f6356', terraces: '#b98b4a', torii: '#5e5a56', snow: '#9aa3b5', castle: '#c98a9a' }[key];
      const calm = s.arena || s.phase === 'standoff' ? 0 : 1; this.calmK += (calm - this.calmK) * Math.min(1, dt * 0.8);
      for (const B of this.sky) {
        B.t += dt; if (B.t < 0) continue;
        if (B.t >= B.life) { B.t = -(6 + Math.random() * 10); B.life = 16 + Math.random() * 10; B.x = 0.1 + Math.random() * 0.8; B.y = 0.1 + Math.random() * 0.22; B.r = 0.08 + Math.random() * 0.05; B.i = (Math.random() * 2) | 0; B.vx = (s.wind && s.wind.w < 0 ? -1 : 1) * (0.003 + Math.random() * 0.004); continue; }
        if (B.x === undefined) { B.t = B.life; continue; }
        if (this.calmK < 0.05) continue; // no sky blooms over a fight
        const u = B.t / B.life, grow = red ? 1 : 0.7 + 0.3 * (1 - Math.pow(1 - Math.min(1, u / 0.35), 3)); if (!red) B.x += B.vx * dt;
        const body = (night ? 0.07 : 0.085) * Math.min(1, u / 0.3) * (1 - clamp((u - 0.3) / 0.5, 0, 1)), rim = (night ? 0.12 : 0.16) * Math.min(1, u / 0.3) * (1 - clamp((u - 0.55) / 0.45, 0, 1));
        K.draw(g, B.i, col, B.x * W - camX * 0.02 * k, B.y * H, B.r * H * grow, body * (1 - r.red) * this.calmK, rim * (1 - r.red) * this.calmK);
      }
      // morning mist that breathes over the far ranges (strongest at dawn: bamboo morning, castle daybreak); thins in a fight
      const mk = ({ bamboo: 1, castle: 0.9, terraces: 0.55, torii: 0.7, snow: 0.45 }[key]) * this.calmK * (1 - r.red);
      if (mk > 0.05 && !r.lite) for (let i = 0; i < 1; i++) {
        const br = red ? 0.5 : 0.5 + 0.5 * Math.sin(r.time * (0.19 + i * 0.07) + i * 2.1), x = ((W * (0.3 + i * 0.45) - camX * 0.06 * k) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * 0.3;
        K.drawE(g, 2, night ? '#3d4049' : CHAPTERS[r.ch].paper, x, H * 0.6, W * (0.28 + br * 0.03), H * (0.06 + br * 0.015), (0.28 + br * 0.16) * mk, 0);
      }
    }
    if (r.fx) { g.setTransform(1, 0, 0, 1, 0, 0); r.fx.drawMoments(g, r, dt); }
    // far birds: a small loose group of check-marks crossing slowly, very faint (by day)
    if (!night && r.red < 0.2) {
      if (!this.flock) { this.flockT -= dt; if (this.flockT <= 0) { const n = 3 + ((Math.random() * 3) | 0); this.flock = { x: -0.05, y: 0.14 + Math.random() * 0.12, n, sp: 0.012 + Math.random() * 0.008, ph: Math.random() * 6, off: [0, 0.6, -0.8, 1.3, -1.6].map((v) => v + Math.random() * 0.5) }; } }
      else {
        const F = this.flock; F.x += F.sp * dt; if (F.x > 1.08) { this.flock = null; this.flockT = 35 + Math.random() * 25; }
        else for (let i = 0; i < F.n; i++) {
          const bx = F.x * W - i * 13 * k - F.off[i] * 4 * k, by = F.y * H + F.off[i] * 6 * k + Math.sin(r.time * 0.6 + i * 1.7) * 2 * k;
          const fr = red ? 1 : (((r.time * 2.2 + i * 0.37 + F.ph) % 1 + 1) % 1) * 3 | 0, T = this.S.tick[fr], z = 0.55 * k;
          g.globalAlpha = 0.32; g.drawImage(T.c, bx - T.ax * z, by - T.ay * z, T.w * z, T.h * z);
        }
      }
    }
    g.globalAlpha = 1;
    // light within a chapter: a slow cloud that dims the sheet now and then, and a lift as the boss arena nears
    const t = r.time, cl = clamp((Math.sin(t * 0.043 + this.ch) * 0.65 + Math.sin(t * 0.0171 + this.ch * 2.3) * 0.45 - 0.3) / 0.6, 0, 1);
    const dB = this.bossX - s.p.x, near = s.arena && s.arena.boss ? 0 : clamp(1 - (dB - 250) / 1500, 0, 1) * (dB > -200 ? 1 : 0);
    const k2 = 1 - Math.exp(-dt * 0.6); this.dim += (cl * (1 - near) - this.dim) * k2; this.bright += (near - this.bright) * k2;
    this.toneA = 0.32 + 0.12 * this.dim - 0.1 * this.bright; this.toneC = TONES[Math.round(this.dim * 10)] || TONE_BASE;
  }

  // ---------- world space, on the ground with the figures (behind them) ----------
  world(g, s, dt, r) {
    if (r.ch !== this.ch) this.setChapter(r, s);
    if (!this.S) return;
    const S = this.S, px = s.p.x, t = r.time, red = r.reduced, camX = r.v.camX, ch = r.ch, fight = !!s.arena;
    const vis = (x, m) => Math.abs(x - camX) < r.v.W / (2 * r.v.k) + m;
    // lantern flames breathe irregularly, gutter in gusts, and at night throw a warm pool on the snow
    if (this.lamps.length) {
      const wind = (s.wind ? s.wind.w : 0) * (1 + r.red * 0.9), night = this.key === 'snow';
      for (const L of this.lamps) {
        if (!vis(L.x, 120)) continue;
        const sd = L.seed * 6, gust = Math.min(0.65, Math.abs(r.gustAt ? r.gustAt(L.x) : 0) * 0.7);
        const n = (red ? 0.8 : 0.66 + 0.16 * Math.sin(t * 7.3 + sd) + 0.1 * Math.sin(t * 12.9 + sd * 2.1) + 0.08 * Math.sin(t * 23.1 + sd * 3.7)) * (1 - gust) * (1 - r.red * 0.6);
        if (L.kind === 'hang') {
          const gy = -groundH(ch, L.x), sw = Math.sin(t * 1.6 + L.seed * 6) * 0.12 + wind * 0.12, lx = L.x + 16 + Math.sin(sw) * 14, ly = gy - 94 + Math.cos(sw) * 14;
          if (night) { g.globalAlpha = 0.32 * n; g.drawImage(S.pool, lx - 70, gy - 8, 140, 18); }
          g.globalAlpha = 0.45 * n; g.drawImage(S.glow, lx - 46, ly - 46, 92, 92);
          g.globalAlpha = 0.85 * n; g.drawImage(S.flame, lx - 4, ly - 4, 8, 10);
        } else {
          const sc = L.h / 60, fx = L.x, fy = L.base - 40 * sc;
          g.globalAlpha = 0.5 * n; g.drawImage(S.flame, fx - 3.4 * sc, fy - 4.2 * sc, 6.8 * sc, 8.4 * sc);
          g.globalAlpha = 0.14 * n; g.drawImage(S.glow, fx - 18 * sc, fy - 18 * sc, 36 * sc, 36 * sc);
        }
      }
    }
    // the fox on its rise: it sits and watches the ronin come, then turns and slips away
    for (const F of this.foxes) {
      if (!vis(F.mx, 200) && F.st !== 1) continue;
      const gy = -groundH(ch, F.mx);
      g.globalAlpha = 1; put(g, S.mound, F.mx, gy + 2);
      if (F.st === 2) continue;
      if (F.st === 0) { F.face = px < F.mx ? -1 : 1; if ((Math.abs(px - F.mx) < 380 && !fight) || (fight && Math.abs(px - F.mx) < 700)) { F.st = 1; F.t = 0; F.face = px < F.mx ? 1 : -1; } }
      let x = F.mx, y = gy - 15;
      if (F.st === 1) { F.t += dt; x = F.mx + F.face * (F.t * 230 + F.t * F.t * 60); const off = Math.abs(x - F.mx); y = -groundH(ch, x) - 15 * clamp(1 - (off - 30) / 40, 0, 1); if (off > 1000) F.st = 2; }
      g.save(); g.translate(x, y); g.scale(0.82, 0.82); drawFoxFig(g, 0, 0, F.face, F.st === 1, t, 41, r.boilN || 0, red); g.restore();
    }
    // crows on the path take off when the ronin comes near or a fight starts
    for (const b of this.perch) {
      if (b.st === 2 || (!vis(b.x, 150) && b.st === 0)) continue;
      const gy = -groundH(ch, b.x);
      if (b.st === 0 && (Math.abs(px - b.x) < 180 || (fight && Math.abs(s.arena.x0 - b.x) < 600))) { b.st = 1; b.t = 0; b.face = px < b.x ? 1 : -1; }
      if (b.st === 1) { b.t += dt; if (b.t > 7) { b.st = 2; continue; } }
      g.globalAlpha = 1;
      for (let j = 0; j < b.n; j++) {
        const ox = j * 21 - (b.n - 1) * 10;
        if (b.st === 0) { const peck = Math.sin(t * 1.1 + j * 2.3 + b.ph) > 0.9 ? 1 : 0, f = (j % 2 ? -b.face : b.face) > 0 ? 0 : 1; put(g, S.crowSit[peck][f], b.x + ox, gy); }
        else { const u = b.t - j * 0.18; if (u < 0) { put(g, S.crowSit[0][b.face > 0 ? 0 : 1], b.x + ox, gy); continue; }
          const x = b.x + ox + b.face * (u * 95 + u * u * 26), y = gy - 12 - (u * 46 + u * u * 22) - j * 5, fr = red ? 2 : ((u * 6.5 + j * 0.3) % 1) * FLAP | 0;
          put(g, S.crowFly[fr][b.face > 0 ? 0 : 1], x, y); }
      }
    }
    // a frog at the path edge hops off into the grass when the ronin comes near
    for (const F of this.frogs) {
      if (F.st === 2 || (!vis(F.x, 60) && F.st === 0)) continue;
      const gy = -groundH(ch, F.x0);
      if (F.st === 0 && Math.abs(px - F.x0) < 120) { F.st = 1; F.t = 0; F.face = px < F.x0 ? 1 : -1; }
      if (F.st === 0) { g.globalAlpha = 0.95; put(g, S.frog[Math.sin(t * 3 + F.ph) > 0.3 ? 1 : 0][F.face > 0 ? 0 : 1], F.x0, gy); continue; }
      F.t += dt; const hop = 0.34, i = Math.floor(F.t / hop), u = (F.t % hop) / hop;
      if (i >= 3 || red) { F.st = 2; continue; }
      const x = F.x0 + F.face * (i * 26 + u * 26), y = -groundH(ch, x) - Math.sin(u * Math.PI) * 14, a = 0.95 * (1 - i / 3 - u / 3);
      g.globalAlpha = a; put(g, u > 0.12 && u < 0.88 ? S.frogHop[F.face > 0 ? 0 : 1] : S.frog[0][F.face > 0 ? 0 : 1], x, y);
    }
    g.globalAlpha = 1;
  }

  // ---------- screen space, nearest the lens: blurred silhouettes passing now and then; never over a fight ----------
  fore(g, s, dt, r) {
    if (!this.fgItems || !this.fgItems.length) return;
    const { W, H, k, camX } = r.v, C = CHAPTERS[r.ch];
    const calm = s.phase === 'play' && !s.arena && !s.so ? 1 : 0; this.fgK += (calm - this.fgK) * Math.min(1, dt * 1.5);
    const fade = this.fgK * (1 - r.lb) * (1 - r.red); if (fade < 0.02) return;
    if (!this.fg || this.fgH !== H) {
      const col = this.key === 'snow' ? '#14161b' : INKW;
      this.fg = { reeds: fgReeds(H, 61 + r.ch, col), bamboo: fgBranch(H, 71 + r.ch, 'bamboo', col, C.accent, C.paper), cedar: fgBranch(H, 81, 'cedar', col, C.accent, C.paper), pine: fgBranch(H, 91, 'pine', col, C.accent, '#e9e7e2'), blossom: fgBranch(H, 101, 'blossom', col, C.accent, C.paper), lantern: fgLantern(H, 111, col) };
      this.fgH = H;
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const it of this.fgItems) {
      const F = this.fg[it.kind], sx = W / 2 + (it.x - camX) * k * 1.8; if (sx < -F.w * 1.5 || sx > W + F.w * 1.5) continue;
      const cx = Math.abs(sx - W / 2) / (W / 2), a = 0.85 * fade * (0.3 + 0.7 * clamp(cx * 1.6 - 0.2, 0, 1));
      g.globalAlpha = a;
      if (F.bottom) g.drawImage(F.c, sx - F.w / 2, H - F.h + H * 0.015, F.w, F.h);
      else if (it.v) { g.save(); g.translate(sx + F.w / 2, -H * 0.02); g.scale(-1, 1); g.drawImage(F.c, 0, 0, F.w, F.h); g.restore(); } else g.drawImage(F.c, sx - F.w / 2, -H * 0.02, F.w, F.h);
    }
    g.globalAlpha = 1;
  }
}
