// KAZE ink effects: ink that lands, pools, drips, rises and dries on the paper.
// Everything here is pooled (fixed arrays, no per-frame allocation) and drawn with a few cached sprites.
// Under prefers-reduced-motion the moving parts are cut back to gentle fades.
import { rng, clamp, makeCanvas, rgba, mix, stroke } from './brush.js';
import { CHAPTERS, groundH } from './data.js';
import { bloomKit } from './bloom.js';
import { Petals } from './petals.js';
import { Tell } from './tell.js';

const INKW = '#2a231d'; // warm charcoal, never pure black
const N_STAIN = 96, N_DROP = 20, N_MOTE = 36, N_POOL = 10, N_INK = 80, N_SPLAT = 8;

function blotSprite(seed, w, h, foot, dense) {
  const A = dense ? 1.7 : 1;
  const c = makeCanvas(w, h), g = c.getContext('2d'), R = rng(seed);
  g.fillStyle = INKW;
  if (foot) { // a straw-sandal print: an elongated sole with a smudged heel
    g.globalAlpha = 0.75; g.beginPath(); g.ellipse(w * 0.52, h * 0.5, w * 0.38, h * 0.32, 0, 0, 6.2832); g.fill();
    g.globalAlpha = 0.35; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(w * (0.2 + i * 0.15), h * 0.5, w * 0.05, h * 0.3, 0, 0, 6.2832); g.fill(); }
    return c;
  }
  // a wet blot: overlapping soft lobes, a darker pooled rim where the pigment dried, flung satellite dots
  for (let i = 0; i < 7; i++) {
    const x = w * (0.32 + R() * 0.36), y = h * (0.35 + R() * 0.3), rx = w * (0.12 + R() * 0.16), ry = h * (0.18 + R() * 0.16);
    const rg = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); rg.addColorStop(0, rgba(INKW, 0.5 * A)); rg.addColorStop(0.75, rgba(INKW, 0.42 * A)); rg.addColorStop(0.92, rgba(INKW, Math.min(1, 0.62 * A))); rg.addColorStop(1, rgba(INKW, 0));
    g.fillStyle = rg; g.save(); g.translate(x, y); g.scale(1, ry / rx); g.beginPath(); g.arc(0, 0, rx, 0, 6.2832); g.restore(); g.fill();
  }
  g.fillStyle = INKW;
  for (let i = 0; i < 9; i++) { const a = R() * 6.2832, d = 0.36 + R() * 0.12; g.globalAlpha = 0.4 + R() * 0.4; g.beginPath(); g.ellipse(w * 0.5 + Math.cos(a) * w * d, h * 0.5 + Math.sin(a) * h * d * 0.9, 0.6 + R() * 1.6, 0.4 + R() * 0.8, 0, 0, 6.2832); g.fill(); }
  return c;
}
// a long tapered streak of thrown ink, painted horizontally (root at the left), drawn rotated along the cut
function streakSprite(seed) {
  const sc = 3, w = 120, h = 12, c = makeCanvas(w * sc, h * sc), g = c.getContext('2d'), R = rng(seed);
  g.setTransform(sc, 0, 0, sc, 0, 0);
  stroke(g, [[2, h / 2, 1], [40, h / 2 + (R() - 0.5) * 2, 0.7], [85, h / 2 + (R() - 0.5) * 3, 0.35], [118, h / 2 + (R() - 0.5) * 2, 0.05]], { w: 5.5, alpha: 0.95, dry: 0.3, seed, edge: 0.6, taper: [0.02, 0.85], tip: 0.03, color: INKW });
  return { c, w, h };
}
// a parry: a short dry-brush burst fanning one way from the blade crossing (never a circle, never symmetrical)
function parrySprite(seed) {
  const sc = 3, w = 70, h = 70, c = makeCanvas(w * sc, h * sc), g = c.getContext('2d'), R = rng(seed);
  g.setTransform(sc, 0, 0, sc, 10 * sc, 35 * sc);
  const n = 4 + Math.floor(R() * 2);
  for (let i = 0; i < n; i++) { const a = -0.7 + (i / (n - 1)) * 1.3 + (R() - 0.5) * 0.25, L = 22 + R() * 30, x1 = Math.cos(a) * L, y1 = Math.sin(a) * L;
    stroke(g, [[2, 0, 1], [x1 * 0.55, y1 * 0.55 + (R() - 0.5) * 3, 0.7], [x1, y1, 0.1]], { w: 3.4 + R() * 2.4, alpha: 0.9, dry: 0.82, bristles: 7, seed: seed + i, edge: 0, taper: [0.05, 0.8], color: INKW }); }
  return { c, w, h, ax: 10, ay: 35 };
}
function edgeWash(W, H, seed) {
  // the low-health bloom: wet ink creeping in from the edges of the sheet (drawn small, scaled up = soft)
  const w = Math.max(8, Math.round(W / 6)), h = Math.max(8, Math.round(H / 6)), c = makeCanvas(w, h), g = c.getContext('2d'), R = rng(seed);
  const m = Math.min(w, h);
  for (let i = 0; i < 70; i++) {
    const side = i % 4; let x, y;
    if (side === 0) { x = R() * w; y = -m * 0.05; } else if (side === 1) { x = R() * w; y = h + m * 0.05; } else if (side === 2) { x = -m * 0.05; y = R() * h; } else { x = w + m * 0.05; y = R() * h; }
    const r = m * (0.06 + R() * 0.12), rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, rgba(INKW, 0.5)); rg.addColorStop(0.7, rgba(INKW, 0.22)); rg.addColorStop(1, rgba(INKW, 0));
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // corners pool deeper
  for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { const r = m * 0.28, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, rgba(INKW, 0.55)); rg.addColorStop(1, rgba(INKW, 0)); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  return c;
}

export class InkFx {
  constructor() {
    this.stains = Array.from({ length: N_STAIN }, () => ({ on: 0 })); this.si = 0;
    this.drops = Array.from({ length: N_DROP }, () => ({ on: 0 })); this.di = 0;
    this.motes = Array.from({ length: N_MOTE }, () => ({ on: 0 })); this.mi = 0;
    this.pools = Array.from({ length: N_POOL }, () => ({ on: 0 })); this.poi = 0;
    this.seen = new Set(); this.dead = new Set(); this.inky = 0; this.inkySide = 1; this.dripQ = 0; this.dripT = 0;
    this.low = 0; this.crack = { t: 9, x: 0, y: 0, a: 0, seed: 1 }; this.moteAcc = 0; this.wash = null; this.ch = -1;
    this.ink = Array.from({ length: N_INK }, () => ({ on: 0 })); this.ii = 0; this.splats = Array.from({ length: N_SPLAT }, () => ({ on: 0 })); this.spi = 0;
    this.kb = Array.from({ length: 6 }, () => ({ on: 0 })); this.kbi = 0; // ink blooms behind a kill
    this.moments = Array.from({ length: 4 }, () => ({ on: 0 })); this.moi = 0; this.open = { t: 9, life: 1, close: 0 }; this.mask = null; this.lastPhase = '';
    this.petals = new Petals(); this.tell = new Tell();
    this.bx = new Float64Array(10); this.nb = 0; // bodies the grass parts around
    this.blots = typeof document === 'undefined' ? [] : [0, 1, 2, 3].map((i) => blotSprite(71 + i * 13, 96, 34));
    this.blotsD = typeof document === 'undefined' ? [] : [0, 1, 2, 3].map((i) => blotSprite(131 + i * 17, 96, 34, false, true));
    this.streakS = typeof document === 'undefined' ? [] : [0, 1, 2].map((i) => streakSprite(301 + i * 7)); this.parryS = typeof document === 'undefined' ? [] : [0, 1, 2].map((i) => parrySprite(401 + i * 11));
    this.streaks = Array.from({ length: 12 }, () => ({ on: 0 })); this.sti = 0; this.strands = Array.from({ length: 6 }, () => ({ on: 0 })); this.sri = 0; this.parries = Array.from({ length: 3 }, () => ({ on: 0 })); this.pai = 0; this.sparks = Array.from({ length: 9 }, () => ({ on: 0 })); this.spk = 0;
    this.foot = typeof document === 'undefined' ? null : blotSprite(5, 16, 7, true);
  }
  reset() { for (const a of [this.stains, this.drops, this.motes, this.pools, this.ink, this.splats, this.streaks, this.strands, this.parries, this.sparks]) for (const p of a) p.on = 0; this.seen.clear(); this.dead.clear(); this.inky = 0; this.dripQ = 0; }
  stain(x, y, r, life, foot, face) {
    this.si = (this.si + 1) % (this.capS || N_STAIN); const p = this.stains[this.si];
    p.on = 1; p.x = x; p.y = y; p.r = r; p.t = 0; p.life = life; p.sp = 0.25; p.foot = foot ? 1 : 0; p.face = face || 1; p.v = (Math.random() * 4) | 0; p.flip = Math.random() < 0.5 ? -1 : 1; return p;
  }
  pool(x, y, rise, big) { this.poi = (this.poi + 1) % N_POOL; const p = this.pools[this.poi]; p.on = 1; p.x = x; p.y = y; p.t = 0; p.rise = rise ? 1 : 0; p.big = big ? 1.5 : 1; p.seed = Math.random() * 9; p.life = rise ? 1.6 : 2.8; p.fid = -1; return p; }
  // moments bloom in the paper behind the action (called from Life.far, behind the near ranges and every figure):
  // the chapter's own pigment at low strength at the side edges of the sky, never over figures, the HUD or the plates
  drawMoments(g, r, dt) {
    const K = bloomKit(); if (!K) return; const { W, H } = r.v;
    const sides = [[[-0.04, 0.3], [1.04, 0.24]], [[1.05, 0.34], [-0.05, 0.22]], [[-0.05, 0.4], [1.05, 0.4]], [[1.04, 0.28], [-0.04, 0.3]]];
    for (const M of this.moments) {
      if (!M.on) continue; M.t += dt; if (M.t >= M.life) { M.on = 0; continue; }
      const u = M.t / M.life, grow = r.reduced ? 1 : 0.6 + 0.4 * (1 - Math.pow(1 - Math.min(1, M.t / 1.6), 3)), env = Math.min(1, M.t / 0.6) * (1 - u * u) * (1 - r.red * 0.6);
      const [cx, cy] = sides[M.corner][0]; K.draw(g, M.i % 2, M.col, cx * W, cy * H, H * 0.24 * grow, M.a * env, M.a * 1.1 * env * (1 - u * 0.6)); // one side only: it is pigment in the paper, not a frame
    }
  }
  moment(col, a, life, corner) { life = Math.min(life, 2.8); this.moi = (this.moi + 1) % this.moments.length; const M = this.moments[this.moi]; M.on = 1; M.t = 0; M.col = col; M.a = a; M.life = life; M.corner = corner; M.i = (Math.random() * 4) | 0; }
  killBloom(x, y, boss) { this.kbi = (this.kbi + 1) % this.kb.length; const B = this.kb[this.kbi]; B.on = 1; B.x = x; B.y = y - 40; B.t = 0; B.r = boss ? 120 : 80; B.i = (Math.random() * 4) | 0; B.rot = Math.random() * 6.28; }
  // the strike: a wet blot at the contact point thrown along the cut, a few fat drops and a fan of fine ones, all landing as stains
  // the grade's ink lift: warm umber normally, a dark red-brown as the duel sky floods in (cached strings, no per-frame allocation)
  liftColor(red) { if (!this.lifts) this.lifts = Array.from({ length: 11 }, (_, i) => mix('#2e2924', '#3d1914', i / 10)); return this.lifts[Math.round(clamp(red, 0, 1) * 10)]; }
  // the duel disc: a pale bloom with a pooled rim soaking into the red wash, not a hard disc
  discBloom(g, cx, cy, rad, col, e) {
    // a round wet disc: dense core, a soft bleed past the edge, a faint pooled rim on the lower side where the pigment settled
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (!this.discC || this.discCol !== col) { const S = 128, c = makeCanvas(S * 2, S * 2), q = c.getContext('2d'); const rg = q.createRadialGradient(S, S, 0, S, S, S); rg.addColorStop(0, rgba(col, 1)); rg.addColorStop(0.62, rgba(col, 0.96)); rg.addColorStop(0.7, rgba(col, 0.8)); rg.addColorStop(0.78, rgba(col, 0.3)); rg.addColorStop(1, rgba(col, 0)); q.fillStyle = rg; q.fillRect(0, 0, S * 2, S * 2);
      q.strokeStyle = rgba(mix(col, '#3a0d08', 0.45), 0.35); q.lineWidth = 3; q.beginPath(); q.arc(S, S, S * 0.69, 0.35, 2.75); q.stroke(); this.discC = c; this.discCol = col; }
    const w = rad * 2.85; g.globalAlpha = 0.95 * e; g.drawImage(this.discC, cx - w / 2, cy - w / 2, w, w); g.globalAlpha = 1;
  }
  // the strike: one dominant wet mass at the contact, a few long tapered streaks thrown along the cut, and droplets of
  // widely varied size (one or two heavy, many fine), all landing as stains. `splash`: a drop hitting the ground (no streaks).
  burst(x, y, dir, pw, red, splash, life) {
    this.spi = (this.spi + 1) % N_SPLAT; const S = this.splats[this.spi];
    S.on = 1; S.x = x; S.y = y; S.dir = dir; S.t = 0; S.pw = splash ? pw * 0.6 : pw; S.v = (Math.random() * 4) | 0; S.a = dir * (-0.25 + Math.random() * 0.35); S.life = life || 0.42;
    if (!splash) { const ns = red ? 1 : pw > 1.2 ? 4 : 3; for (let k = 0; k < ns; k++) { this.sti = (this.sti + 1) % this.streaks.length; const T = this.streaks[this.sti];
      T.on = 1; T.x = x + dir * 4; T.y = y + (Math.random() - 0.5) * 12; T.a = (dir > 0 ? 0 : Math.PI) + dir * (-0.32 + Math.random() * 0.5); T.len = (45 + Math.random() * 75) * (0.7 + pw * 0.3) * (k ? 0.75 : 1); T.w = 0.8 + Math.random() * 0.7; T.t = 0; T.v = k % 3; } }
    const n = Math.round((red ? 5 : this.lite ? 7 : 12) * pw);
    for (let i = 0; i < n; i++) {
      this.ii = (this.ii + 1) % N_INK; const d = this.ink[this.ii], q = Math.random();
      const r = i === 0 ? 4.2 + Math.random() * 2.2 * pw : i < 3 ? 2 + Math.random() * 2 : 0.45 + 2.2 * q * q * q; // a power law: few heavy, many fine
      const an = splash ? -0.35 - Math.random() * 1.15 : -0.45 + (Math.random() - 0.5) * 1.1, sp = (splash ? 90 + Math.random() * 220 : 150 + Math.random() * 480) * (1 - Math.min(0.55, r / 10)) * (0.75 + pw * 0.25);
      d.on = 1; d.fat = r > 2 ? 1 : 0; d.x = x + dir * Math.random() * 10; d.y = y + (Math.random() - 0.5) * 12; d.vx = dir * Math.cos(an) * sp; d.vy = Math.sin(an) * sp; d.r = r;
    }
  }
  // after a kill, thin strands of ink hang from the wet mass, sag, and let fall a drip or two
  // flecks behind the figures: a few drops that fall to the ground and soak in fast (never left on a body)
  flecks(x, y, dir, n) { this.fk = this.fk || Array.from({ length: 12 }, () => ({ on: 0 })); for (let i = 0; i < n; i++) { this.fki = ((this.fki || 0) + 1) % 12; const d = this.fk[this.fki]; const an = -0.4 - Math.random() * 1.1; const sp = 120 + Math.random() * 200; d.on = 1; d.x = x; d.y = y + (Math.random() - 0.5) * 10; d.vx = dir * Math.cos(an) * sp; d.vy = Math.sin(an) * sp; d.r = 0.8 + Math.random() * 1.8; } }
  strandsAt(x, y) { for (let k = 0; k < 3; k++) { this.sri = (this.sri + 1) % this.strands.length; const T = this.strands[this.sri]; T.on = 1; T.x = x + (k - 1) * (6 + Math.random() * 8); T.y = y + 4 + Math.random() * 6; T.L = 16 + Math.random() * 26; T.t = 0; T.ph = Math.random() * 6; T.dripped = 0; } }
  parryAt(x, y, dir) {
    this.pai = (this.pai + 1) % this.parries.length; const P = this.parries[this.pai]; P.on = 1; P.x = x; P.y = y; P.t = 0; P.a = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.6 - 0.3; P.v = (Math.random() * 3) | 0; P.dir = dir;
    const n = 2 + (Math.random() < 0.5 ? 1 : 0); for (let k = 0; k < n; k++) { this.spk = (this.spk + 1) % this.sparks.length; const Q = this.sparks[this.spk]; const a = P.a + (Math.random() - 0.5) * 1.4; Q.on = 1; Q.x = x; Q.y = y; Q.vx = Math.cos(a) * (380 + Math.random() * 260); Q.vy = Math.sin(a) * (380 + Math.random() * 260) - 60; Q.t = 0; Q.life = 0.16 + Math.random() * 0.08; }
  }

  // read the frame's cues and the foe list (called before the renderer consumes the cues)
  pre(s, r, dt) {
    const ch = r.ch; if (ch !== this.ch) { this.ch = ch; this.reset(); } this.dt = Math.min(0.05, dt);
    this.lite = !!r.lite; this.capS = r.lite ? 48 : N_STAIN;
    // chapter openings bloom in from a few points; the close after a boss closes the same way
    if (s.card && s.card.t < 0.05 && s.cp === 0 && this.open.t > 0.5) { this.open.t = 0; this.open.life = 2.8; this.open.close = 0; }
    if (s.phase === 'narr' && !s.prologue && this.lastPhase === 'play') { this.open.t = 0; this.open.life = 2.2; this.open.close = 1; }
    if (s.phase === 'credits' && this.lastPhase === 'ending') { this.open.t = 0; this.open.life = 2.4; this.open.close = 1; } // the last page closes over the ending
    this.lastPhase = s.phase;
    this.tell.pre(s, r, this); this.petals.pre(s, r);
    const red = r.reduced;
    for (const c of s.cues) {
      switch (c.k) {
        // every connect throws ink: cut, riposte, kill, guard break, the standoff cut; and the ronin's own hurt, chip and death
        case 'cut': this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 62, s.p.face, c.dmg > 1 ? 1.3 : 1, red); break;
        case 'riposte': this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 64, s.p.face, 1.5, red); break;
        case 'guardbreak': this.burst(c.x - s.p.face * 10, -groundH(ch, c.x) - 58, s.p.face, 0.6, red); break;
        case 'socut': if (s.so) this.burst(s.so.oppX - 6, -groundH(ch, s.so.oppX) - 64, 1, 1.6, red); this.moment(CHAPTERS[ch].accent, 0.16, 2.4, 0); break; // the release: the plate's accent wash in the paper, not a film over the scene
        case 'hurt': this.burst(s.p.x + s.p.face * 4, -groundH(ch, s.p.x) - 60, -s.p.face, (c.dmg || 1) > 1 ? 1.1 : 0.85, red); break;
        case 'chip': this.burst(s.p.x + s.p.face * 4, -groundH(ch, s.p.x) - 60, -s.p.face, 0.45, red); break;
        case 'death': this.burst(s.p.x, -groundH(ch, s.p.x) - 56, -s.p.face, 1.3, red); this.stain(s.p.x, -groundH(ch, s.p.x), 26, 8); break;
        case 'kill': if (c.boss) this.moment(CHAPTERS[ch].accent, 0.16, 3.6, 1); this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 60, s.p.face, c.boss ? 2 : 1.7, red, false, 1.3); if (!red) this.strandsAt(c.x - s.p.face * 6 + s.p.face * 14, -groundH(ch, c.x) - 60); if (s.p.drawn !== false) { this.dripQ = red ? 2 : 5; this.dripT = 0.25; } break;
        case 'parry': case 'reflect': { this.parryPend = { x: c.x, y: -groundH(ch, c.x) - 92, dir: Math.sign(c.x - s.p.x) || s.p.face }; const C = this.crack; C.t = 9; /* placed after the figures are drawn, on the blades' crossing */ C.seed = (Math.random() * 1e4) | 0; break; }
        case 'step': {
          // walked through wet ink? leave a few prints
          let wet = false; for (const p of this.stains) if (p.on && !p.foot && p.t < p.life * 0.45 && Math.abs(p.x - c.x) < p.r * 1.2 + 6) { wet = true; break; }
          if (wet) this.inky = 4;
          if (this.inky > 0) { const pr = this.stain(c.x, -groundH(ch, c.x), 7, 5, true, s.p.face); pr.alpha = this.inky / 4; this.inky--; }
          break;
        }
        case 'chapter': this.reset(); break;
        case 'respawn': this.reset(); this.open.t = 0; this.open.life = 1.1; this.open.close = 0; break;
        // important moments bloom a soft wash in from the edges of the sheet
        case 'boss': this.moment(CHAPTERS[ch].accent, 0.2, 3.6, 0); break;
        case 'standoff': this.moment(mix(CHAPTERS[ch].accent, INKW, 0.5), 0.14, 3.2, 1); break;
        case 'blessing': this.moment(CHAPTERS[ch].accent, 0.14, 3.4, 2); break;
        case 'sit': this.moment(CHAPTERS[ch].accent, 0.12, 4.5, 3); break;
      }
    }
    // foes rise out of a spreading pool when they arrive, and sink back into one when they fall
    for (const f of s.foes) {
      if (!this.seen.has(f.id)) { this.seen.add(f.id); const P = this.pool(f.x, -groundH(ch, f.x), true, !!f.boss); P.fid = f.id; }
      else if (f.st === 'enter') for (const P of this.pools) if (P.on && P.rise && P.fid === f.id) { P.x = f.x; P.y = -groundH(ch, f.x); P.t = Math.min(P.t, 0.5); } // the pool travels with him while he walks up out of it
      if (f.st === 'dead' && !this.dead.has(f.id)) { this.dead.add(f.id); this.pool(f.x, -groundH(ch, f.x), false, !!f.boss); const st = this.stain(f.x, -groundH(ch, f.x), f.boss ? 36 : 26, 10); st.sp = 2.4; }
    }
    if (this.seen.size > 200) { this.seen.clear(); this.dead.clear(); for (const f of s.foes) { this.seen.add(f.id); if (f.st === 'dead') this.dead.add(f.id); } }
    this.nb = 0; this.bx[this.nb++] = s.p.x; for (const f of s.foes) if (f.st !== 'dead' && this.nb < 10) this.bx[this.nb++] = f.x;
    // the blade drips after a kill
    if (this.dripQ > 0) { this.dripT -= dt; if (this.dripT <= 0) { this.dripT = 0.18 + Math.random() * 0.3; this.dripQ--; this.di = (this.di + 1) % N_DROP; const d = this.drops[this.di]; d.on = 1; d.x = s.p.x + s.p.face * (40 + Math.random() * 8); d.y = -groundH(ch, s.p.x) - 46 - Math.random() * 6; d.vy = 0; d.t = 0; } }
    // low health: wet ink blooms in from the edges, recedes when healed
    const hpR = s.p.hpMax ? s.p.hp / s.p.hpMax : 1, tgt = s.phase === 'dead' ? 0 : s.p.hp <= 1 ? 1 : hpR <= 0.5 ? 0.5 : 0;
    this.low += (tgt - this.low) * Math.min(1, dt * (tgt > this.low ? 1.4 : 0.8));
    // rising ash-ink motes in boss arenas and by shrines
    let rate = 0; const boss = s.arena && s.arena.boss;
    if (boss) rate = 3.2; else for (const e of s.ev) if (e.t === 'shrine' && Math.abs(e.x - s.p.x) < 420) { rate = 1.2; break; }
    if (red) rate *= 0.3; if (r.lite) rate *= 0.5;
    this.moteAcc += rate * dt;
    while (this.moteAcc >= 1) {
      this.moteAcc -= 1; this.mi = (this.mi + 1) % N_MOTE; const m = this.motes[this.mi];
      const x = r.v.camX + (Math.random() - 0.5) * 1000; m.on = 1; m.x = x; m.y = -groundH(ch, x) - Math.random() * 30; m.vy = -(14 + Math.random() * 18); m.t = 0; m.life = 4 + Math.random() * 3; m.sz = 1 + Math.random() * 1.8; m.ph = Math.random() * 6.28;
    }
  }

  // grass, reeds and bamboo lean out of the way of a body passing through them and spring back behind it
  // each prop carries a little spring (pa, pv) so it overshoots and settles once the body has gone by
  part(x, pr) {
    const amp = pr.kind === 'grass' ? 0.5 : pr.set === 'bamboo' ? 0.05 : 0; // only soft growth bends; stones, gates and trunks stay put
    if (!amp) return 0;
    let tgt = 0;
    for (let i = 0; i < this.nb; i++) { const d = (x - this.bx[i]) / 34; if (d > -3 && d < 3) tgt += d * Math.exp(-d * d) * amp; }
    const dt = this.dt || 0.016; if (pr.pa === undefined) { pr.pa = 0; pr.pv = 0; }
    pr.pv += ((tgt - pr.pa) * 150 - pr.pv * 9) * dt; pr.pa += pr.pv * dt;
    if (pr.pa > 0.9) pr.pa = 0.9; else if (pr.pa < -0.9) pr.pa = -0.9;
    return pr.pa;
  }
  // ground layer, world space, drawn under the figures
  ground(g, s, dt, r) {
    if (this.fk) { g.fillStyle = INKW; for (const d of this.fk) { if (!d.on) continue; d.vy += 1100 * dt; d.x += d.vx * dt; d.y += d.vy * dt; const gy = -groundH(r.ch, d.x); if (d.y >= gy) { d.on = 0; this.stain(d.x, gy, 2 + d.r * 1.4, 0.4); continue; } g.globalAlpha = 0.85; g.beginPath(); g.ellipse(d.x, d.y, d.r * 1.4, d.r * 0.8, Math.atan2(d.vy, d.vx), 0, 6.2832); g.fill(); } g.globalAlpha = 1; } // dash flecks, behind the figures
    this.tell.ground(g, s, dt, r);
    const red = r.reduced, t = r.time;
    g.globalCompositeOperation = 'source-over';
    // stains and prints dry: dark and glossy while wet, then pale and gone
    const cx0 = r.v.camX - r.v.W / (2 * r.v.k * r.v.zoom) - 40, cx1 = r.v.camX + r.v.W / (2 * r.v.k * r.v.zoom) + 40; // cull to the view
    for (const p of this.stains) {
      if (!p.on) continue; p.t += dt; if (p.t >= p.life) { p.on = 0; continue; }
      if (p.x < cx0 || p.x > cx1) continue;
      const k = p.t / p.life, wet = clamp(1 - p.t / 0.9, 0, 1), fade = 1 - clamp((k - 0.55) / 0.45, 0, 1); if (fade < 0.04) continue;
      if (p.foot) { if (!this.foot) continue; g.globalAlpha = 0.5 * fade * (p.alpha || 1); g.drawImage(this.foot, p.x - 6, p.y - 2.2, 12, 4.4); continue; }
      const spread = red ? 1 : (p.sp > 0.5 ? 0.25 + 0.75 * (1 - Math.pow(1 - clamp(p.t / p.sp, 0, 1), 2)) : 0.55 + 0.45 * clamp(p.t / p.sp, 0, 1)); // lands and spreads (a body's pool, slowly)
      const w = p.r * 2 * spread, h = p.r * 0.5 * spread;
      g.globalAlpha = (0.42 + wet * 0.35) * fade; g.drawImage(this.blots[p.v], p.x - w / 2, p.y - h * 0.55, w, h);
    }
    this.petals.ground(g, s, dt, r);
    // pools: rising foes pull up out of them, falling foes sink into them
    for (const p of this.pools) {
      if (!p.on) continue; p.t += dt; if (p.t >= p.life) { p.on = 0; continue; }
      const k = p.t / p.life, B = p.big;
      const open = p.rise ? Math.min(1, k * 3) * (1 - clamp((k - 0.7) / 0.3, 0, 1)) : clamp(k * 1.6, 0, 1) * (1 - clamp((k - 0.6) / 0.4, 0, 1)); // a body's pool seeps out slowly
      const rw = 44 * B * (p.rise ? 0.75 + k * 0.4 : 0.35 + 0.9 * (1 - Math.pow(1 - k, 2)));
      g.globalAlpha = 0.9 * open; g.drawImage(this.blotsD[(p.seed | 0) % 4], p.x - rw, p.y - rw * 0.16, rw * 2, rw * 0.32);
      g.globalAlpha = 0.35 * open; g.drawImage(this.blots[((p.seed | 0) + 1) % 4], p.x - rw * 1.35, p.y - rw * 0.2, rw * 2.7, rw * 0.4);
      // tendrils: on a rise they reach up and are drawn into the body; on a sink they slump back down
      if (red) continue;
      const n = p.rise ? 5 : 3, hk = p.rise ? Math.sin(Math.min(1, k * 1.4) * Math.PI) : (1 - k) * 0.6;
      g.strokeStyle = INKW; g.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const u = (i / (n - 1) - 0.5) * 2, bx = p.x + u * rw * 0.7, hh = (60 + 30 * Math.sin(p.seed + i * 2.1)) * B * hk;
        if (hh < 2) continue;
        const sw = Math.sin(t * 2.2 + i + p.seed) * 6, tx = p.x + u * rw * 0.15 + sw, ty = p.y - hh;
        g.globalAlpha = 0.75 * open;
        for (let j = 0; j < 3; j++) { // three tapering passes
          const a0 = j / 3, a1 = (j + 1) / 3;
          g.lineWidth = (5 - j * 1.5) * B; g.beginPath();
          g.moveTo(bx + (tx - bx) * a0 * a0 + Math.sin(a0 * 3 + i) * 4, p.y + (ty - p.y) * a0);
          g.quadraticCurveTo(bx + (tx - bx) * ((a0 + a1) / 2) + sw * 0.5, p.y + (ty - p.y) * ((a0 + a1) / 2), bx + (tx - bx) * a1 * a1 + Math.sin(a1 * 3 + i) * 4, p.y + (ty - p.y) * a1);
          g.stroke();
        }
      }
    }
    // danger: thin tendrils reach up at the arena edge and before an ambush, curling toward the ronin
    if (!red) {
      const px = s.p.x;
      if (s.arena && !s.arena.clearT) { this.tendrils(g, s.arena.x0 + 20, px, t, r.ch, s.arena.boss ? 4 : 2, 1); this.tendrils(g, s.arena.x1 - 20, px, t, r.ch, s.arena.boss ? 4 : 2, 1); }
      else if (!s.arena) for (const e of s.ev) if (e.t === 'fight' && !e.done && e.x > px && e.x - px < 520) { this.tendrils(g, e.x - 60, px, t, r.ch, 3, clamp((520 - (e.x - px)) / 260, 0, 1)); break; }
    }
    g.globalAlpha = 1;
  }
  tendrils(g, x0, px, t, ch, n, a) {
    const gy = -groundH(ch, x0), dir = Math.sign(px - x0) || 1;
    g.strokeStyle = INKW; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const bx = x0 + (i - (n - 1) / 2) * 16, ph = t * 0.6 + i * 1.7 + x0 * 0.01, h = (42 + 22 * Math.sin(i * 2.3 + x0)) * (0.85 + 0.15 * Math.sin(ph * 0.7));
      const lean = dir * (14 + 8 * Math.sin(ph)), cx = bx + lean * 0.3 + Math.sin(ph * 1.3) * 5, cy = gy - h * 0.55, tx = bx + lean, ty = gy - h;
      g.globalAlpha = 0.3 * a; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, gy); g.quadraticCurveTo(cx, cy, tx, ty); g.stroke();
      // the tip curls over toward the ronin
      g.globalAlpha = 0.38 * a; g.lineWidth = 1.4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + dir * 9, ty - 6, tx + dir * 8 + Math.sin(ph * 2) * 2, ty + 3); g.stroke();
    }
  }

  // air layer, world space, over the figures: drips, rising motes, the parry crack
  air(g, s, dt, r) {
    const ch = r.ch, red = r.reduced;
    // strike blots: a wet stamp at the contact, spreading for a breath and then lifting off
    for (const S of this.splats) {
      if (!S.on) continue; S.t += dt; const L = S.life || 0.42; if (S.t >= L) { S.on = 0; continue; }
      const u = S.t / L, gr = red ? 1 : 0.75 + 0.35 * Math.min(1, u * 4), w = 58 * S.pw * gr, h = 20 * S.pw * gr;
      g.save(); g.translate(S.x + S.dir * w * 0.25, S.y); g.rotate(S.a);
      g.globalAlpha = (u < 0.25 ? 0.95 : 0.95 * (1 - (u - 0.25) / 0.75)) * (red ? 0.7 : 1); g.drawImage(this.blotsD[S.v], -w / 2, -h / 2, w, h); g.drawImage(this.blotsD[(S.v + 1) % 4], -w * 0.3, -h * 0.35, w * 0.6, h * 0.7); g.restore();
    }
    // streaks: thrown out along the cut in a few frames, then they fade
    for (const T of this.streaks) {
      if (!T.on) continue; T.t += dt; if (T.t >= 0.5) { T.on = 0; continue; }
      const S = this.streakS[T.v]; if (!S) continue; const e = Math.min(1, T.t / 0.07), a = T.t < 0.16 ? 0.95 : 0.95 * (1 - (T.t - 0.16) / 0.34), L = T.len * e, hh = 12 * T.w;
      g.save(); g.translate(T.x, T.y); g.rotate(T.a); g.globalAlpha = a * (red ? 0.7 : 1); g.drawImage(S.c, 0, 0, S.c.width * e, S.c.height, 0, -hh / 2, L, hh); g.restore();
    }
    // strands hang from the wet mass, sag, swing a little, and drip
    g.strokeStyle = INKW; g.lineCap = 'round';
    for (const T of this.strands) {
      if (!T.on) continue; T.t += dt; if (T.t >= 1.3) { T.on = 0; continue; }
      const grow = Math.min(1, T.t / 0.5), fade = 1 - clamp((T.t - 0.9) / 0.4, 0, 1), L = T.L * grow, sw = Math.sin(T.t * 3 + T.ph) * 4 * grow, tx = T.x + sw, ty = T.y + L;
      g.globalAlpha = 0.9 * fade; g.lineWidth = 1.6; g.beginPath(); g.moveTo(T.x, T.y); g.quadraticCurveTo(T.x + sw * 0.2, T.y + L * 0.6, tx, ty); g.stroke();
      const bulb = 1.2 + grow * 1.6; g.fillStyle = INKW; g.beginPath(); g.ellipse(tx, ty + bulb * 0.4, bulb * 0.8, bulb, 0, 0, 6.2832); g.fill();
      if (!T.dripped && T.t > 0.7 + T.ph * 0.04) { T.dripped = 1; this.di = (this.di + 1) % N_DROP; const d = this.drops[this.di]; d.on = 1; d.x = tx; d.y = ty + bulb; d.vy = 20; d.t = 0; }
    }
    // a parry: a short dry-brush burst at the blade crossing and two or three white sparks
    for (const P of this.parries) {
      if (!P.on) continue; P.t += dt; if (P.t >= 0.34) { P.on = 0; continue; }
      const S = this.parryS[P.v]; if (!S) continue; const z = red ? 1 : 0.7 + 0.3 * Math.min(1, P.t / 0.06), a = P.t < 0.1 ? 0.95 : 0.95 * (1 - (P.t - 0.1) / 0.24);
      g.save(); g.translate(P.x, P.y); g.rotate(P.a); g.scale(z * (P.dir > 0 ? 1 : 1), z); g.globalAlpha = a; g.drawImage(S.c, -S.ax, -S.ay, S.w, S.h); g.restore();
    }
    { const paper = CHAPTERS[ch].paper; g.lineCap = 'round';
      for (const Q of this.sparks) {
        if (!Q.on) continue; Q.t += dt; if (Q.t >= Q.life) { Q.on = 0; continue; }
        const x0 = Q.x, y0 = Q.y; Q.x += Q.vx * dt; Q.y += Q.vy * dt; Q.vy += 500 * dt; const a = 1 - Q.t / Q.life, tx = Q.x - Q.vx * 0.03, ty = Q.y - Q.vy * 0.03;
        g.globalAlpha = 0.5 * a; g.strokeStyle = INKW; g.lineWidth = 2.6; g.beginPath(); g.moveTo(tx + 0.8, ty + 0.8); g.lineTo(Q.x + 0.8, Q.y + 0.8); g.stroke(); // its ink edge
        g.globalAlpha = a; g.strokeStyle = paper; g.lineWidth = 1.5; g.beginPath(); g.moveTo(tx, ty); g.lineTo(Q.x, Q.y); g.stroke();
      } }
    g.fillStyle = INKW;
    for (const d of this.ink) {
      if (!d.on) continue; d.vy += 1100 * dt; d.vx *= 1 - dt * 1.5; d.x += d.vx * dt; d.y += d.vy * dt; const gy = -groundH(ch, d.x);
      if (d.y >= gy) { d.on = 0; this.stain(d.x, gy, d.fat ? 7 + d.r * 1.6 : 2.5 + d.r * 1.5, 4 + Math.random() * 2.5); continue; }
      const sp = Math.hypot(d.vx, d.vy), st = 1 + Math.min(1.5, sp / 320);
      g.globalAlpha = d.fat ? 0.95 : 0.8; g.beginPath(); g.ellipse(d.x, d.y, d.r * st, d.r * 0.8, Math.atan2(d.vy, d.vx), 0, 6.2832); g.fill();
    }
    for (const d of this.drops) {
      if (!d.on) continue; d.t += dt; d.vy += 900 * dt; d.y += d.vy * dt; const gy = -groundH(ch, d.x);
      if (d.y >= gy) { d.on = 0; this.stain(d.x, gy, 4 + Math.random() * 3, 5); continue; }
      const st = clamp(d.vy / 300, 0.6, 2.4); g.globalAlpha = 0.85; g.beginPath(); g.ellipse(d.x, d.y, 1.4, 1.6 * st, 0, 0, 6.2832); g.fill();
    }
    if (this.parryPend) { // the blades' crossing point, as the figure code exposes it this frame (head height otherwise)
      const P = this.parryPend, X = r.crossPt || (r.pfig && (r.pfig.crossPt || r.pfig.cross)); this.parryPend = null;
      if (X && isFinite(X[0]) && Math.abs(X[0] - P.x) < 160) this.parryAt(X[0], X[1], P.dir); else this.parryAt(P.x, P.y, P.dir);
    }
    this.petals.air(g, s, dt, r); this.tell.air(g, s, dt, r);
    for (const m of this.motes) {
      if (!m.on) continue; m.t += dt; if (m.t >= m.life) { m.on = 0; continue; }
      m.y += m.vy * dt; const k = m.t / m.life, x = m.x + Math.sin(m.ph + m.t * 0.9) * 10;
      g.globalAlpha = 0.42 * Math.min(1, k * 4) * (1 - k); g.beginPath(); g.ellipse(x, m.y, m.sz, m.sz * 0.7, m.ph, 0, 6.2832); g.fill();
    }
    // a perfect parry cracks a white hairline through the ink for a few frames
    const C = this.crack;
    if (C.t < 0.22) {
      C.t += dt; const a = red ? 0.5 * (1 - C.t / 0.22) : C.t < 0.12 ? 1 : 1 - (C.t - 0.12) / 0.1, paper = CHAPTERS[ch].paper;
      const L = 64, ca = Math.cos(C.a), sa = Math.sin(C.a); // short: a crack at the clash, not a line across the frame
      g.lineJoin = 'miter'; g.lineCap = 'butt';
      // a thin ink shadow along one side so the white line reads over bare paper too, then the paper-white hairline
      for (let pass = 0; pass < 2; pass++) {
        const ox = pass ? 0 : -sa * 1.7, oy = pass ? 0 : ca * 1.7;
        g.strokeStyle = pass ? paper : INKW; g.lineWidth = pass ? 1.8 : 1.3; g.globalAlpha = a * (pass ? 1 : 0.7);
        const R2 = rng(C.seed); g.beginPath(); let x = C.x - ca * L + ox, y = C.y - sa * L + oy; g.moveTo(x, y);
        for (let i = 1; i <= 12; i++) { const u = i / 12 * 2 - 1; x = C.x + ca * L * u + (R2() - 0.5) * 6 * -sa + ox; y = C.y + sa * L * u + (R2() - 0.5) * 6 * ca + oy; g.lineTo(x, y); }
        g.stroke();
      }
    }
    g.globalAlpha = 1; g.lineCap = 'round'; g.lineJoin = 'round';
  }

  // screen space: the low-health bloom at the edges of the sheet
  screen(g, s, dt, r) {
    const { W, H } = r.v, K = bloomKit(), C = CHAPTERS[r.ch];
    this.petals.screen(g, s, dt, r);
    if (s.so || this.tell.st !== 'idle') { if (!this.wash || this.washW !== W || this.washH !== H) { this.wash = edgeWash(W, H, 17); this.washW = W; this.washH = H; } this.tell.screen(g, s, dt, r, this.wash); }
    if (K) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      // openings and closings: the scene blooms out of the bare sheet (or the sheet closes over it)
      const O = this.open;
      if (O.t < O.life) {
        O.t += dt; let p = Math.min(1, O.t / O.life); if (O.close) p = 1 - p;
        if (r.reduced) { g.globalAlpha = 1 - p; g.fillStyle = C.paper; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
        else if (p < 1) {
          const md = r.lite ? 2 : 1; if (!this.mask || this.mask.width !== Math.ceil(W / md) || this.mask.height !== Math.ceil(H / md)) { this.mask = makeCanvas(Math.ceil(W / md), Math.ceil(H / md)); }
          const j = r.ch * 0.07; this.pts = this.pts || [{ x: 0.5, y: 0.6, s: 0.72, d: 0, i: 0 }, { x: 0.18, y: 0.32, s: 0.5, d: 0.12, i: 1 }, { x: 0.84, y: 0.38, s: 0.52, d: 0.22, i: 2 }, { x: 0.62, y: 0.9, s: 0.48, d: 0.3, i: 3 }];
          this.pts[0].x = 0.46 + j * 0.3; this.pts[1].y = 0.3 + j * 0.2;
          K.reveal(g, this.mask, W, H, C.paper, INKW, p, this.pts);
        }
      } else if (O.close && (s.phase === 'narr' || s.phase === 'credits' || s.phase === 'fin')) { g.fillStyle = C.paper; g.fillRect(0, 0, W, H); } // closed: hold the bare sheet under the narration
    }
    if (this.low < 0.01) return;
    if (!this.wash || this.washW !== W || this.washH !== H) { this.wash = edgeWash(W, H, 17); this.washW = W; this.washH = H; }
    // the wash is pre-scaled once to the frame (washF), so each frame is four unscaled edge blits; the breath is in the alpha
    if (!this.washF || this.washF.width !== W || this.washF.height !== H) { this.washF = makeCanvas(W, H); this.washF.getContext('2d').drawImage(this.wash, 0, 0, W, H); }
    const br = r.reduced ? 0 : Math.sin(r.time * 1.6) * 0.05, F = this.washF, ty = Math.round(H * 0.12), lx = Math.round(W * 0.08); // the extreme edges only
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = Math.min(0.6, this.low * (0.55 + br));
    g.drawImage(F, 0, 0, W, ty, 0, 0, W, ty); g.drawImage(F, 0, H - ty, W, ty, 0, H - ty, W, ty);
    g.drawImage(F, 0, ty, lx, H - 2 * ty, 0, ty, lx, H - 2 * ty); g.drawImage(F, W - lx, ty, lx, H - 2 * ty, W - lx, ty, lx, H - 2 * ty);
    g.globalAlpha = 1;
  }
}
