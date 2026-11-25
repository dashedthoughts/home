// KAZE cherry blossom: the grove before the castle and the final duel with Sotetsu.
// Petals are tiny pale-pink brush dabs with a darker notch (some only a pink wash), painted once into sprites.
// Approach: a steady drift in three depths (blurred big petals near the lens, crisp small ones in the play layer,
// a pink haze far off) and petals kicked up from the carpet by the ronin's feet. Duel: the wind rises and the petals
// circle the two duellists in a slow vortex that tightens and thickens as the duel goes on; blade strokes cut a few in
// half; the second phase tears a storm across the screen; the killing stroke holds every petal still for a beat, then
// they fall straight down in silence. Reduced motion: a gentle slow fall only. Pooled and capped.
import { rng, makeCanvas, rgba, mix, INK } from './brush.js';
import { CHAPTERS, groundH } from './data.js';
import { bloomKit } from './bloom.js';

const N = 130, N_NEAR = 7;
const PINK = '#f1cdd5', PINK2 = '#e6a9b8';

function petalSprite(sc, notch, half, seed) {
  const w = 7, h = 5, c = makeCanvas(w * sc, h * sc), g = c.getContext('2d'), R = rng(seed);
  g.setTransform(sc, 0, 0, sc, (w / 2) * sc, (h / 2) * sc);
  if (half) { g.beginPath(); g.rect(-w, -h, w, h * 2); g.clip(); }
  const rg = g.createRadialGradient(-0.6, 0, 0, 0, 0, 3.2); rg.addColorStop(0, rgba(PINK, notch ? 0.95 : 0.7)); rg.addColorStop(0.7, rgba(PINK2, notch ? 0.85 : 0.55)); rg.addColorStop(1, rgba(PINK2, 0));
  g.fillStyle = rg; g.beginPath(); g.moveTo(-3.2, 0); g.bezierCurveTo(-2.4, -2.3 - R() * 0.3, 1.6, -2.2, 3, -0.5); g.lineTo(2.3, 0); g.lineTo(3, 0.5); g.bezierCurveTo(1.6, 2.2, -2.4, 2.3, -3.2, 0); g.fill();
  if (notch) { g.strokeStyle = rgba(mix('#b45a72', INK, 0.35), 0.55); g.lineWidth = 0.45; g.beginPath(); g.moveTo(2.9, -0.55); g.lineTo(2.2, 0); g.lineTo(2.9, 0.55); g.stroke(); g.globalAlpha = 0.25; g.beginPath(); g.moveTo(-2.6, 0); g.lineTo(1.2, 0); g.stroke(); }
  return { c, w, h };
}
function nearSprite(px, seed) {
  const t = makeCanvas(px * 2, px * 1.4), q = t.getContext('2d'), R = rng(seed);
  q.translate(px, px * 0.7); q.rotate((R() - 0.5) * 0.6);
  const rg = q.createRadialGradient(0, 0, 0, 0, 0, px * 0.8); rg.addColorStop(0, rgba(PINK, 0.85)); rg.addColorStop(1, rgba(PINK2, 0));
  q.fillStyle = rg; q.beginPath(); q.ellipse(0, 0, px * 0.8, px * 0.5, 0, 0, 6.2832); q.fill();
  const c = makeCanvas(px * 2, px * 1.4), g = c.getContext('2d'); if ('filter' in g) g.filter = `blur(${Math.max(2, px * 0.12)}px)`; g.drawImage(t, 0, 0); return c;
}

export class Petals {
  constructor() {
    this.p = Array.from({ length: N }, () => ({ on: 0 })); this.i = 0; this.near = Array.from({ length: N_NEAR }, () => ({ on: 0 }));
    this.S = null; this.sc = 0; this.acc = 0; this.inten = 0; this.freeze = 0; this.fallAll = false; this.storm = 0; this.stormDir = 1; this.ch = -1; this.duel = false; this.duelT = 0;
  }
  active(r, s) {
    const C = CHAPTERS[r.ch]; if (C.key !== 'castle') return 0;
    const b = s.ev.find((e) => e.t === 'boss'); if (!b) return 0;
    this.bossX = b.x; const x = s.p.x;
    if (s.arena && s.arena.boss) return 2;
    return x > b.x - 1500 && x < b.x + 900 ? 1 : 0; // the grove: from the last shrine to the castle yard
  }
  spawn(x, y, vx, vy, mode) {
    let P = null; for (let k = 0; k < N; k++) { this.i = (this.i + 1) % N; if (!this.p[this.i].on) { P = this.p[this.i]; break; } }
    if (!P) return null; // capped: never recycle a petal that is on screen
    P.on = 1; P.x = x; P.y = y; P.vx = vx; P.vy = vy; P.mode = mode; P.rot = Math.random() * 6.28; P.vr = (Math.random() - 0.5) * 5; P.v = (Math.random() * 3) | 0; P.sz = 0.8 + Math.random() * 0.7; P.ph = Math.random() * 6.28; P.t = 0; P.ground = 0;
    P.th = Math.random() * 6.2832; P.rf = 0.75 + Math.random() * 0.5; P.yo = (Math.random() - 0.5) * 110; P.w = 0.8 + Math.random() * 0.5; return P;
  }
  build(sc) {
    this.S = { full: [petalSprite(sc, 1, 0, 3), petalSprite(sc, 1, 0, 7), petalSprite(sc, 0, 0, 11)], half: petalSprite(sc, 1, 1, 5), near: [nearSprite(26, 1), nearSprite(34, 2), nearSprite(22, 3)] };
    this.sc = sc;
  }
  // per frame, before drawing (from ground()): cues and motion
  step(s, dt, r) {
    if (r.ch !== this.ch) { this.ch = r.ch; for (const P of this.p) P.on = 0; for (const n of this.near) n.on = 0; this.inten = 0; this.freeze = 0; this.fallAll = false; this.duelT = 0; }
    const A = this.active(r, s), red = r.reduced; this.A = A;
    if (!A && !this.p.some((P) => P.on)) return;
    const sc = Math.min(5, Math.max(2, Math.round(r.v.k * 2.2))); if (!this.S || sc !== this.sc) this.build(sc);
    const boss = A === 2 ? s.foes.find((f) => f.boss) : null;
    for (const c of s.cues) {
      if (c.k === 'kill' && c.boss && this.A === 2) { this.freeze = red ? 0 : 0.9; this.fallAll = true; }
      if (c.k === 'phase2' && A === 2 && !red) { this.storm = 2.6; this.stormDir = (s.wind && s.wind.w < 0) ? -1 : 1; }
      if ((c.k === 'swing' || c.k === 'cut') && A === 2 && !red) this.cutNear(s, r);
      if (c.k === 'step' && A >= 1 && !red) for (let k = 0; k < 2; k++) this.spawn(c.x + (Math.random() - 0.5) * 14, -groundH(r.ch, c.x) - 2, -s.p.face * (10 + Math.random() * 40) + (Math.random() - 0.5) * 30, -50 - Math.random() * 70, 2); // kicked up from the carpet
      if (c.k === 'chapter' || c.k === 'respawn') { for (const P of this.p) P.on = 0; this.fallAll = false; this.inten = 0; this.duelT = 0; }
    }
    if (this.freeze > 0) { this.freeze -= dt; return; } // the held beat: nothing moves
    const wind = s.wind ? s.wind.w : 0.4, ch = r.ch, camX = r.v.camX, half = r.v.W / (2 * r.v.k * r.v.zoom);
    // the duel: the vortex grows with time, more in the second phase
    if (A === 2 && boss && boss.st !== 'dead' && !this.fallAll) { this.duelT += dt; this.inten = Math.min(1, this.duelT / 45 + (boss.phase === 2 ? 0.35 : 0)); } else if (!this.fallAll) this.inten = Math.max(0, this.inten - dt * 0.3);
    const vortex = A === 2 && !red && !this.fallAll && boss;
    const cx = vortex ? (s.p.x + boss.x) / 2 : 0, cy = vortex ? -groundH(ch, cx) - 70 : 0, rx = vortex ? Math.max(240, Math.abs(s.p.x - boss.x) / 2 + 170) : 0, ry = 64;
    // spawning
    if (!this.fallAll && A) {
      const rate = red ? 2.5 : A === 2 ? 8 + this.inten * 16 : 6;
      this.acc += rate * dt;
      while (this.acc >= 1) {
        this.acc -= 1; const up = wind >= 0 ? -1 : 1;
        const P = this.spawn(camX + up * (half + 40) + (Math.random() - 0.5) * 80, -groundH(ch, camX) - 30 - Math.random() * 380, red ? wind * 10 : (20 + wind * 70) * -up, red ? 14 : 12 + Math.random() * 18, 0);
        if (P && vortex && (this.nv || 0) < 36 + 60 * this.inten && Math.random() < 0.75) { P.mode = 1; P.x = cx + Math.cos(P.th) * rx * P.rf; P.y = cy + Math.sin(P.th) * ry * P.rf + P.yo; }
      }
      if (this.storm > 0) { this.storm -= dt; for (let k = 0; k < 3; k++) { const P = this.spawn(camX - this.stormDir * (half + 60), -groundH(ch, camX) - Math.random() * 420, this.stormDir * (650 + Math.random() * 450), (Math.random() - 0.5) * 90, 4); if (P) P.vr = (Math.random() - 0.5) * 18; } }
    }
    // motion
    let nv = 0;
    for (const P of this.p) {
      if (!P.on) continue; P.t += dt; if (P.mode === 1) nv++;
      if (this.fallAll && P.mode !== 5) { P.mode = 5; P.vx = 0; P.vy = 26 + Math.random() * 24; P.vr *= 0.25; }
      const gy = -groundH(ch, P.x);
      if (P.mode === 1) {
        if (!vortex) { P.mode = 0; P.vx = -Math.sin(P.th) * rx * 0.4; P.vy = 10; continue; }
        const w = (0.45 + this.inten * 0.85) * P.w; P.th += w * dt; const tx = cx + Math.cos(P.th) * rx * P.rf, ty = cy + Math.sin(P.th) * ry * P.rf + P.yo + Math.sin(P.t * 0.9 + P.ph) * 8;
        P.x += (tx - P.x) * Math.min(1, dt * 3); P.y += (ty - P.y) * Math.min(1, dt * 3); P.rot += P.vr * dt * 1.6;
        if (P.t > 14 + P.ph) { P.mode = 0; P.vy = 18; }
        continue;
      }
      if (P.ground) { P.ground += dt; if (P.ground > 2.2) P.on = 0; continue; }
      if (P.mode === 5) { P.y += P.vy * dt; P.rot += P.vr * dt; } // straight down, in silence
      else {
        const g2 = P.mode === 2 || P.mode === 3 ? 140 : P.mode === 4 ? 10 : 0;
        P.vy += g2 * dt; if (P.mode === 2 || P.mode === 3) P.vy = Math.min(P.vy, 60);
        const flut = P.mode === 4 ? 0 : Math.sin(P.t * 2.4 + P.ph) * 18;
        P.x += (P.vx + flut + (P.mode === 0 ? wind * 20 : 0)) * dt; P.y += (P.vy + Math.cos(P.t * 1.9 + P.ph) * 6) * dt; P.rot += P.vr * dt;
        if (P.mode === 4) { P.vx *= 1 - dt * 0.4; if (Math.abs(P.vx) < 120) P.mode = 0; }
        if (P.mode === 2 && P.vy > 0 && P.t > 0.8) P.mode = 0;
      }
      if (P.y >= gy) { P.y = gy - 0.5; P.ground = 0.001; }
      if (Math.abs(P.x - camX) > half + 400) P.on = 0;
    }
    this.nv = nv;
    // near the lens: a few big blurred petals (approach and duel), not while everything falls
    if (A && !red) for (const n of this.near) {
      if (!n.on) { if (!this.fallAll && Math.random() < dt * 0.25) { n.on = 1; n.x = wind >= 0 ? -0.1 : 1.1; n.y = 0.1 + Math.random() * 0.7; n.vx = (wind >= 0 ? 1 : -1) * (0.05 + Math.random() * 0.05); n.vy = 0.015 + Math.random() * 0.02; n.v = (Math.random() * 3) | 0; n.rot = Math.random() * 6; n.t = 0; } continue; }
      n.t += dt; n.x += n.vx * dt; n.y += n.vy * dt + Math.sin(n.t * 1.3) * 0.01 * dt; n.rot += dt * 0.6; if (n.x < -0.2 || n.x > 1.2 || n.y > 1.2) n.on = 0;
    }
  }
  drawSet(g, r, front) {
    if (!this.S) return;
    const M = g.getTransform(), a = M.a, d = M.d, e = M.e, f = M.f;
    for (const P of this.p) {
      if (!P.on) continue;
      if (P.mode === 1) { const isFront = Math.sin(P.th) > 0; if (isFront !== front) continue; } else if (!front) continue;
      const S = P.mode === 3 ? this.S.half : this.S.full[P.v], z = P.sz * (P.mode === 1 ? 0.85 + 0.3 * Math.sin(P.th) : 1), cs = Math.cos(P.rot) * z, sn = Math.sin(P.rot) * z * (0.55 + 0.45 * Math.abs(Math.sin(P.t * 2.1 + P.ph))); // the flutter flattens the dab
      g.setTransform(a * cs, d * sn, -a * sn, d * cs, a * P.x + e, d * P.y + f);
      g.globalAlpha = P.ground ? 0.9 * (1 - P.ground / 2.2) : 0.92;
      g.drawImage(S.c, -S.w / 2, -S.h / 2, S.w, S.h);
    }
    g.setTransform(a, M.b, M.c, d, e, f); g.globalAlpha = 1;
  }
  cutNear(s, r) {
    const bx = s.p.x + s.p.face * 55, by = -groundH(r.ch, s.p.x) - 70; let n = 0;
    for (const P of this.p) { if (!P.on || P.mode !== 1 || n >= 3) continue; if (Math.abs(P.x - bx) < 60 && Math.abs(P.y - by) < 60) { n++; P.mode = 3; P.vx = s.p.face * (30 + Math.random() * 40); P.vy = -30; P.vr = (Math.random() - 0.5) * 16; P.t = 0; const Q = this.spawn(P.x, P.y, -P.vx * 0.6, -10, 3); if (Q) { Q.rot = P.rot + 3.1; Q.vr = -P.vr; } } }
  }
  ground(g, s, dt, r) { this.step(s, dt, r); if (this.A === 2 || this.p.some((P) => P.on && P.mode === 1)) this.drawSet(g, r, false); }
  air(g, s, dt, r) { this.drawSet(g, r, true); }
  // far haze (from Life.far): a soft pink bloom low over the grove
  far(g, s, dt, r) {
    if (!this.A) return; const K = bloomKit(); if (!K) return;
    const { W, H } = r.v, a = (this.A === 2 ? 0.1 : 0.14) * (1 - r.red * 0.7);
    K.draw(g, 2, '#e7b5c2', W * 0.3, H * 0.62, H * 0.55, a, a * 0.5); K.draw(g, 3, '#e7b5c2', W * 0.78, H * 0.6, H * 0.5, a * 0.9, a * 0.45);
  }
  screen(g, s, dt, r) {
    if (!this.S || !this.A) return; const { W, H } = r.v;
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const n of this.near) { if (!n.on) continue; const c = this.S.near[n.v], z = H / 540; g.globalAlpha = 0.55 * Math.min(1, n.t * 2) * (1 - r.lb * 0.5); g.drawImage(c, n.x * W - c.width * z / 2, n.y * H - c.height * z / 2, c.width * z, c.height * z); }
    g.globalAlpha = 1;
  }
}
