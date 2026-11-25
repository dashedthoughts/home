// KAZE ink effects: ink that lands, pools, drips, rises and dries on the paper.
// Everything here is pooled (fixed arrays, no per-frame allocation) and drawn with a few cached sprites.
// Under prefers-reduced-motion the moving parts are cut back to gentle fades.
import { rng, clamp, makeCanvas, rgba } from './brush.js';
import { CHAPTERS, groundH } from './data.js';

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
function edgeWash(W, H, seed) {
  // the low-health bloom: wet ink creeping in from the edges of the sheet (drawn small, scaled up = soft)
  const w = Math.max(8, Math.round(W / 6)), h = Math.max(8, Math.round(H / 6)), c = makeCanvas(w, h), g = c.getContext('2d'), R = rng(seed);
  const m = Math.min(w, h);
  for (let i = 0; i < 70; i++) {
    const side = i % 4; let x, y;
    if (side === 0) { x = R() * w; y = -m * 0.05; } else if (side === 1) { x = R() * w; y = h + m * 0.05; } else if (side === 2) { x = -m * 0.05; y = R() * h; } else { x = w + m * 0.05; y = R() * h; }
    const r = m * (0.12 + R() * 0.22), rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, rgba(INKW, 0.5)); rg.addColorStop(0.7, rgba(INKW, 0.22)); rg.addColorStop(1, rgba(INKW, 0));
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // corners pool deeper
  for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { const r = m * 0.5, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, rgba(INKW, 0.55)); rg.addColorStop(1, rgba(INKW, 0)); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
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
    this.bx = new Float64Array(10); this.nb = 0; // bodies the grass parts around
    this.blots = typeof document === 'undefined' ? [] : [0, 1, 2, 3].map((i) => blotSprite(71 + i * 13, 96, 34));
    this.blotsD = typeof document === 'undefined' ? [] : [0, 1, 2, 3].map((i) => blotSprite(131 + i * 17, 96, 34, false, true));
    this.foot = typeof document === 'undefined' ? null : blotSprite(5, 16, 7, true);
  }
  reset() { for (const a of [this.stains, this.drops, this.motes, this.pools, this.ink, this.splats]) for (const p of a) p.on = 0; this.seen.clear(); this.dead.clear(); this.inky = 0; this.dripQ = 0; }
  stain(x, y, r, life, foot, face) {
    this.si = (this.si + 1) % N_STAIN; const p = this.stains[this.si];
    p.on = 1; p.x = x; p.y = y; p.r = r; p.t = 0; p.life = life; p.foot = foot ? 1 : 0; p.face = face || 1; p.v = (Math.random() * 4) | 0; p.flip = Math.random() < 0.5 ? -1 : 1; return p;
  }
  pool(x, y, rise, big) { this.poi = (this.poi + 1) % N_POOL; const p = this.pools[this.poi]; p.on = 1; p.x = x; p.y = y; p.t = 0; p.rise = rise ? 1 : 0; p.big = big ? 1.5 : 1; p.seed = Math.random() * 9; p.life = rise ? 1.3 : 1.6; }
  // the strike: a wet blot at the contact point thrown along the cut, a few fat drops and a fan of fine ones, all landing as stains
  burst(x, y, dir, pw, red) {
    this.spi = (this.spi + 1) % N_SPLAT; const S = this.splats[this.spi];
    S.on = 1; S.x = x; S.y = y; S.dir = dir; S.t = 0; S.pw = pw; S.v = (Math.random() * 4) | 0; S.a = dir * (-0.25 + Math.random() * 0.35);
    const nFat = Math.round((red ? 2 : 3) * pw), nFine = Math.round((red ? 5 : 11) * pw);
    for (let i = 0; i < nFat + nFine; i++) {
      this.ii = (this.ii + 1) % N_INK; const d = this.ink[this.ii], fat = i < nFat;
      const an = (fat ? -0.35 : -0.55) + (Math.random() - 0.5) * (fat ? 0.6 : 1.3), sp = (fat ? 170 + Math.random() * 220 : 240 + Math.random() * 320) * (0.75 + pw * 0.25);
      d.on = 1; d.fat = fat ? 1 : 0; d.x = x + dir * Math.random() * 8; d.y = y + (Math.random() - 0.5) * 10; d.vx = dir * Math.cos(an) * sp; d.vy = Math.sin(an) * sp; d.r = fat ? 3.2 + Math.random() * 2.6 * pw : 0.9 + Math.random() * 1.1;
    }
  }


  // read the frame's cues and the foe list (called before the renderer consumes the cues)
  pre(s, r, dt) {
    const ch = r.ch; if (ch !== this.ch) { this.ch = ch; this.reset(); }
    const red = r.reduced;
    for (const c of s.cues) {
      switch (c.k) {
        // every connect throws ink: cut, riposte, kill, guard break, the standoff cut; and the ronin's own hurt, chip and death
        case 'cut': this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 62, s.p.face, c.dmg > 1 ? 1.3 : 1, red); break;
        case 'riposte': this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 64, s.p.face, 1.5, red); break;
        case 'guardbreak': this.burst(c.x - s.p.face * 10, -groundH(ch, c.x) - 58, s.p.face, 0.6, red); break;
        case 'socut': if (s.so) this.burst(s.so.oppX - 6, -groundH(ch, s.so.oppX) - 64, 1, 1.6, red); break;
        case 'hurt': this.burst(s.p.x + s.p.face * 4, -groundH(ch, s.p.x) - 60, -s.p.face, (c.dmg || 1) > 1 ? 1.1 : 0.85, red); break;
        case 'chip': this.burst(s.p.x + s.p.face * 4, -groundH(ch, s.p.x) - 60, -s.p.face, 0.45, red); break;
        case 'death': this.burst(s.p.x, -groundH(ch, s.p.x) - 56, -s.p.face, 1.3, red); this.stain(s.p.x, -groundH(ch, s.p.x), 26, 8); break;
        case 'kill': this.burst(c.x - s.p.face * 6, -groundH(ch, c.x) - 60, s.p.face, c.boss ? 2 : 1.7, red); if (s.p.drawn !== false) { this.dripQ = red ? 2 : 5; this.dripT = 0.25; } break;
        case 'parry': case 'reflect': { const C = this.crack; C.t = 0; C.x = c.x; C.y = -groundH(ch, c.x) - 66; C.a = -0.9 + Math.random() * 0.5; C.seed = (Math.random() * 1e4) | 0; break; }
        case 'step': {
          // walked through wet ink? leave a few prints
          let wet = false; for (const p of this.stains) if (p.on && !p.foot && p.t < p.life * 0.45 && Math.abs(p.x - c.x) < p.r * 1.2 + 6) { wet = true; break; }
          if (wet) this.inky = 4;
          if (this.inky > 0) { const pr = this.stain(c.x, -groundH(ch, c.x), 7, 5, true, s.p.face); pr.alpha = this.inky / 4; this.inky--; }
          break;
        }
        case 'chapter': case 'respawn': this.reset(); break;
      }
    }
    // foes rise out of a spreading pool when they arrive, and sink back into one when they fall
    for (const f of s.foes) {
      if (!this.seen.has(f.id)) { this.seen.add(f.id); if (Math.abs(f.x - r.v.camX) < 900) this.pool(f.x, -groundH(ch, f.x), true, !!f.boss); }
      if (f.st === 'dead' && !this.dead.has(f.id)) { this.dead.add(f.id); this.pool(f.x, -groundH(ch, f.x), false, !!f.boss); this.stain(f.x, -groundH(ch, f.x), f.boss ? 34 : 24, 9); }
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
  part(x, kind) {
    if (kind !== 'grass') return 0; // only soft growth bends; stones and trunks stay put
    const amp = 0.55; let a = 0;
    for (let i = 0; i < this.nb; i++) { const d = (x - this.bx[i]) / 34; if (d > -3 && d < 3) a += d * Math.exp(-d * d) * amp; }
    return a;
  }
  // ground layer, world space, drawn under the figures
  ground(g, s, dt, r) {
    const red = r.reduced, t = r.time;
    g.globalCompositeOperation = 'source-over';
    // stains and prints dry: dark and glossy while wet, then pale and gone
    for (const p of this.stains) {
      if (!p.on) continue; p.t += dt; if (p.t >= p.life) { p.on = 0; continue; }
      const k = p.t / p.life, wet = clamp(1 - p.t / 0.9, 0, 1), fade = 1 - clamp((k - 0.55) / 0.45, 0, 1);
      if (p.foot) { if (!this.foot) continue; g.globalAlpha = 0.5 * fade * (p.alpha || 1); g.drawImage(this.foot, p.x - 6, p.y - 2.2, 12, 4.4); continue; }
      const spread = red ? 1 : 0.55 + 0.45 * clamp(p.t / 0.25, 0, 1); // lands and spreads
      const w = p.r * 2 * spread, h = p.r * 0.5 * spread;
      g.globalAlpha = (0.42 + wet * 0.35) * fade; g.drawImage(this.blots[p.v], p.x - w / 2, p.y - h * 0.55, w, h);
    }
    // pools: rising foes pull up out of them, falling foes sink into them
    for (const p of this.pools) {
      if (!p.on) continue; p.t += dt; if (p.t >= p.life) { p.on = 0; continue; }
      const k = p.t / p.life, B = p.big;
      const open = p.rise ? Math.min(1, k * 3) * (1 - clamp((k - 0.7) / 0.3, 0, 1)) : clamp(k * 2.5, 0, 1) * (1 - clamp((k - 0.5) / 0.5, 0, 1));
      const rw = 34 * B * (p.rise ? 0.6 + k * 0.5 : 0.8 + k * 0.6);
      g.globalAlpha = 0.6 * open; g.drawImage(this.blots[(p.seed | 0) % 4], p.x - rw, p.y - rw * 0.15, rw * 2, rw * 0.3);
      // tendrils: on a rise they reach up and are drawn into the body; on a sink they slump back down
      if (red) continue;
      const n = p.rise ? 5 : 3, hk = p.rise ? Math.sin(Math.min(1, k * 1.4) * Math.PI) : (1 - k) * 0.6;
      g.strokeStyle = INKW; g.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const u = (i / (n - 1) - 0.5) * 2, bx = p.x + u * rw * 0.7, hh = (60 + 30 * Math.sin(p.seed + i * 2.1)) * B * hk;
        if (hh < 2) continue;
        const sw = Math.sin(t * 2.2 + i + p.seed) * 6, tx = p.x + u * rw * 0.15 + sw, ty = p.y - hh;
        g.globalAlpha = 0.5 * open;
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
      if (!S.on) continue; S.t += dt; const L = 0.42; if (S.t >= L) { S.on = 0; continue; }
      const u = S.t / L, gr = red ? 1 : 0.75 + 0.35 * Math.min(1, u * 4), w = 58 * S.pw * gr, h = 20 * S.pw * gr;
      g.save(); g.translate(S.x + S.dir * w * 0.25, S.y); g.rotate(S.a);
      g.globalAlpha = (u < 0.25 ? 0.95 : 0.95 * (1 - (u - 0.25) / 0.75)) * (red ? 0.7 : 1); g.drawImage(this.blotsD[S.v], -w / 2, -h / 2, w, h); g.drawImage(this.blotsD[(S.v + 1) % 4], -w * 0.3, -h * 0.35, w * 0.6, h * 0.7); g.restore();
    }
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
    for (const m of this.motes) {
      if (!m.on) continue; m.t += dt; if (m.t >= m.life) { m.on = 0; continue; }
      m.y += m.vy * dt; const k = m.t / m.life, x = m.x + Math.sin(m.ph + m.t * 0.9) * 10;
      g.globalAlpha = 0.42 * Math.min(1, k * 4) * (1 - k); g.beginPath(); g.ellipse(x, m.y, m.sz, m.sz * 0.7, m.ph, 0, 6.2832); g.fill();
    }
    // a perfect parry cracks a white hairline through the ink for a few frames
    const C = this.crack;
    if (C.t < 0.22) {
      C.t += dt; const a = red ? 0.5 * (1 - C.t / 0.22) : C.t < 0.12 ? 1 : 1 - (C.t - 0.12) / 0.1, paper = CHAPTERS[ch].paper;
      const L = 170, ca = Math.cos(C.a), sa = Math.sin(C.a);
      g.lineJoin = 'miter'; g.lineCap = 'butt';
      for (let pass = 0; pass < 2; pass++) {
        g.strokeStyle = pass ? paper : INKW; g.lineWidth = pass ? 1.8 : 3.6; g.globalAlpha = a * (pass ? 1 : 0.32);
        const R2 = rng(C.seed); g.beginPath(); let x = C.x - ca * L, y = C.y - sa * L; g.moveTo(x, y);
        for (let i = 1; i <= 12; i++) { const u = i / 12 * 2 - 1; x = C.x + ca * L * u + (R2() - 0.5) * 6 * -sa; y = C.y + sa * L * u + (R2() - 0.5) * 6 * ca; g.lineTo(x, y); }
        g.stroke();
      }
    }
    g.globalAlpha = 1; g.lineCap = 'round'; g.lineJoin = 'round';
  }

  // screen space: the low-health bloom at the edges of the sheet
  screen(g, s, dt, r) {
    if (this.low < 0.01) return;
    const { W, H } = r.v;
    if (!this.wash || this.washW !== W || this.washH !== H) { this.wash = edgeWash(W, H, 17); this.washW = W; this.washH = H; }
    const br = r.reduced ? 0 : Math.sin(r.time * 1.6) * 0.012; // a slow wet breath
    const sc = 1 + 0.06 * (1 - this.low) + br, w = W * sc, h = H * sc;
    // only the edge strips are drawn (the centre of the wash is empty): four cheap source-over blits, no full-screen blend
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = Math.min(0.6, this.low * 0.55);
    const iw = this.wash.width, ih = this.wash.height, x0 = (W - w) / 2, y0 = (H - h) / 2, fx = w / iw, fy = h / ih, ty = Math.round(ih * 0.3), lx = Math.round(iw * 0.22);
    g.drawImage(this.wash, 0, 0, iw, ty, x0, y0, w, ty * fy); g.drawImage(this.wash, 0, ih - ty, iw, ty, x0, y0 + h - ty * fy, w, ty * fy);
    g.drawImage(this.wash, 0, ty, lx, ih - ty * 2, x0, y0 + ty * fy, lx * fx, h - ty * fy * 2); g.drawImage(this.wash, iw - lx, ty, lx, ih - ty * 2, x0 + w - lx * fx, y0 + ty * fy, lx * fx, h - ty * fy * 2);
    g.globalAlpha = 1;
  }
}
