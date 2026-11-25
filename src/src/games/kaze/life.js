// KAZE ambient life: birds, crows, an egret, seeds, fireflies, distant chimney smoke, and a sea of mist between the ranges.
// Everything is pooled and deterministic per chapter; the creatures are a few brush marks each, never sprites.
import { rng, clamp, makeCanvas, rgba } from './brush.js';
import { CHAPTERS, groundH } from './data.js';

const INKW = '#2a231d';
const N_FLOAT = 26, N_SMOKE = 18;

function mistSheet(w, h, paper, seed) {
  // a long, tileable band of mist: soft paper lobes with a slightly denser lower edge
  const c = makeCanvas(w, h), g = c.getContext('2d'), R = rng(seed);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 46; i++) {
    const x = R() * w, y = h * (0.35 + R() * 0.45), rx = w * (0.05 + R() * 0.09), ry = h * (0.16 + R() * 0.2);
    for (const ox of [x - w, x, x + w]) { // wrap so the sheet tiles
      const rg = g.createRadialGradient(ox, y, 0, ox, y, rx); rg.addColorStop(0, rgba(paper, 0.5)); rg.addColorStop(1, rgba(paper, 0));
      g.save(); g.translate(ox, y); g.scale(1, ry / rx); g.translate(-ox, -y); g.fillStyle = rg; g.fillRect(ox - rx, y - rx, rx * 2, rx * 2); g.restore();
    }
  }
  const lg = g.createLinearGradient(0, h * 0.45, 0, h); lg.addColorStop(0, rgba(paper, 0)); lg.addColorStop(1, rgba(paper, 0.55)); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  return c;
}
function puff() {
  const c = makeCanvas(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(60,54,48,0.5)'); gr.addColorStop(0.5, 'rgba(60,54,48,0.25)'); gr.addColorStop(1, 'rgba(60,54,48,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c;
}
// a bird in flight: two brush arcs, flap 0..1
function wings(g, x, y, s, flap) {
  const up = (flap - 0.5) * 2; g.beginPath();
  g.moveTo(x - 6 * s, y - 2 * s * up); g.quadraticCurveTo(x - 3 * s, y - 3 * s * up - 1 * s, x, y);
  g.quadraticCurveTo(x + 3 * s, y - 3 * s * up - 1 * s, x + 6 * s, y - 2 * s * up); g.stroke();
}

export class Life {
  constructor() { this.ch = -1; this.floats = Array.from({ length: N_FLOAT }, () => ({ on: 0 })); this.smoke = Array.from({ length: N_SMOKE }, () => ({ on: 0 })); this.si = 0; this.puff = typeof document === 'undefined' ? null : puff(); this.flock = null; this.flockT = 6; this.smokeAcc = 0; }
  setChapter(ch, len) {
    this.ch = ch; const C = CHAPTERS[ch], R = rng(ch * 31 + 7), key = C.key;
    // perched crows (or egrets in the paddies), placed along the path away from the shrines
    this.perch = [];
    const step = key === 'terraces' ? 1500 : 1250;
    for (let x = 700 + R() * 300; x < len - 500; x += step * (0.8 + R() * 0.4)) this.perch.push({ x, kind: key === 'terraces' ? 'egret' : 'crow', st: 0, t: 0, fx: 0, fy: 0, vx: 0, vy: 0, face: R() < 0.5 ? -1 : 1, ph: R() * 6, n: key === 'terraces' ? 1 : 1 + ((R() * 3) | 0) });
    for (const f of this.floats) f.on = 0; for (const p of this.smoke) p.on = 0; this.flock = null; this.flockT = 4;
    this.mist = null;
  }
  // screen space, between the far ranges: the sea of mist, chimney smoke, a far V of birds
  far(g, s, dt, r) {
    const { W, H, k, camX } = r.v, C = CHAPTERS[r.ch], key = C.key, red = r.reduced, night = key === 'snow';
    if (r.ch !== this.ch) this.setChapter(r.ch, s.len || 7000);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // the mist sea: two slow sheets at different parallax, thinning as the duel sky floods in
    if (!this.mist || this.mistW !== W || this.mistH !== H) { this.mistW = W; this.mistH = H; this.mist = mistSheet(Math.round(W * 1.5), Math.round(H * 0.3), night ? '#3a3e47' : C.paper, 11 + r.ch); }
    const ma = (night ? 0.45 : 0.8) * (1 - r.red * 0.6);
    // one moving sheet between the far ranges and the near ones (a full-width blend is the costliest thing here)
    if (ma > 0.02) for (let i = 1; i <= 1; i++) {
      const mw = this.mist.width, par = i ? 0.12 : 0.07, drift = red ? 0 : r.time * (i ? 6 : 3) * k;
      let ox = -(((camX * par * k + drift) % mw) + mw) % mw; const y = H * (i ? 0.52 : 0.44);
      g.globalAlpha = ma * (i ? 0.75 : 0.6);
      for (; ox < W; ox += mw) g.drawImage(this.mist, ox, y);
    }
    // distant kitchen smoke rising beyond the ridge and leaning in the wind (terraces, the snow pass)
    if ((key === 'terraces' || key === 'snow') && this.puff) {
      const sx = (W * 0.62 - camX * 0.1 * k) % (W * 2.2), bx = sx < -W * 0.3 ? sx + W * 2.2 : sx, by = H * 0.6;
      this.smokeAcc += dt * (red ? 1 : 2.2);
      while (this.smokeAcc >= 1) { this.smokeAcc -= 1; this.si = (this.si + 1) % N_SMOKE; const p = this.smoke[this.si]; p.on = 1; p.t = 0; p.life = 7 + Math.random() * 2; p.ox = (Math.random() - 0.5) * 3; }
      const wind = s.wind ? s.wind.w : 0.3;
      for (const p of this.smoke) {
        if (!p.on) continue; p.t += dt; if (p.t >= p.life) { p.on = 0; continue; }
        const u = p.t / p.life, rise = u * 150 * k, lean = (u * u) * (60 + wind * 120) * k, sz = (6 + u * 34) * k;
        g.globalAlpha = (night ? 0.22 : 0.3) * Math.min(1, u * 5) * (1 - u); g.drawImage(this.puff, bx + p.ox * k + lean - sz, by - rise - sz, sz * 2, sz * 2);
      }
    }
    // a slow V of far birds now and then (by day)
    if (!night && r.red < 0.3) {
      if (!this.flock) { this.flockT -= dt; if (this.flockT <= 0) this.flock = { x: -0.1, y: 0.12 + Math.random() * 0.14, n: 5 + ((Math.random() * 3) | 0), sp: 0.018 + Math.random() * 0.01, ph: Math.random() * 6 }; }
      else {
        const F = this.flock; F.x += F.sp * dt; if (F.x > 1.15) { this.flock = null; this.flockT = 22 + Math.random() * 20; }
        else {
          g.strokeStyle = INKW; g.lineWidth = Math.max(1, 1.1 * k); g.lineCap = 'round'; g.globalAlpha = 0.5;
          for (let i = 0; i < F.n; i++) {
            const row = Math.ceil(i / 2), side = i % 2 ? -1 : 1, bx = (F.x * W) - row * 16 * k, by = F.y * H + side * row * 9 * k + Math.sin(r.time * 0.7 + i) * 2 * k;
            wings(g, bx, by, 0.75 * k, red ? 0.5 : 0.5 + 0.5 * Math.sin(r.time * 5 + i * 0.9 + F.ph));
          }
        }
      }
    }
    g.globalAlpha = 1;
  }
  // world space, on the ground with the figures: crows that flap off, an egret in the paddies, seeds and fireflies
  world(g, s, dt, r) {
    if (r.ch !== this.ch) this.setChapter(r.ch, s.len || 7000);
    const key = CHAPTERS[r.ch].key, px = s.p.x, t = r.time, red = r.reduced, camX = r.v.camX;
    g.strokeStyle = INKW; g.fillStyle = INKW; g.lineCap = 'round';
    for (const b of this.perch) {
      if (Math.abs(b.x - camX) > 1100 && b.st !== 1) continue;
      const gy = -groundH(r.ch, b.x);
      if (b.st === 0 && (Math.abs(px - b.x) < (b.kind === 'egret' ? 230 : 170) || (s.arena && Math.abs(s.arena.x0 - b.x) < 500))) { b.st = 1; b.t = 0; b.face = px < b.x ? 1 : -1; }
      if (b.st === 2) continue;
      if (b.kind === 'crow') for (let j = 0; j < b.n; j++) this.crow(g, b, j, gy, t, red, dt);
      else this.egret(g, b, gy, t, red, dt);
      if (b.st === 1) { b.t += dt; if (b.t > 6) b.st = 2; }
    }
    // drifting seeds by day, fireflies at the gates and by the castle moat at dawn: few, slow, small
    const kind = r.lite ? null : key === 'torii' ? 'fly' : key === 'snow' ? null : 'seed'; // reduced tier: no floaters
    if (kind) {
      for (const f of this.floats) {
        if (!f.on) { if (Math.random() < dt * (red ? 0.2 : 0.6)) { f.on = 1; f.x = camX + (Math.random() - 0.3) * 1200; f.y = -groundH(r.ch, f.x) - 20 - Math.random() * 160; f.t = 0; f.life = 8 + Math.random() * 6; f.ph = Math.random() * 6; } continue; }
        f.t += dt; if (f.t > f.life) { f.on = 0; continue; }
        const w = s.wind ? s.wind.w : 0.3, u = f.t / f.life, env = Math.min(1, u * 4) * Math.min(1, (1 - u) * 4);
        if (kind === 'seed') { f.x += (14 + w * 30) * dt; f.y += Math.sin(t * 0.8 + f.ph) * 8 * dt - 2 * dt; g.globalAlpha = 0.45 * env; g.lineWidth = 0.6;
          g.beginPath(); for (let a = 0; a < 3; a++) { const an = a * 2.1 + f.ph; g.moveTo(f.x, f.y); g.lineTo(f.x + Math.cos(an) * 2.6, f.y + Math.sin(an) * 2.6); } g.stroke(); }
        else { f.x += Math.sin(t * 0.5 + f.ph) * 10 * dt; f.y += Math.cos(t * 0.7 + f.ph) * 7 * dt; const pulse = 0.5 + 0.5 * Math.sin(t * 1.7 + f.ph * 3);
          g.globalAlpha = 0.18 * env * pulse; g.fillStyle = '#e9d29a'; g.beginPath(); g.arc(f.x, f.y, 4, 0, 6.2832); g.fill(); g.globalAlpha = 0.55 * env * pulse; g.beginPath(); g.arc(f.x, f.y, 1.2, 0, 6.2832); g.fill(); g.fillStyle = INKW; }
      }
    }
    g.globalAlpha = 1;
  }
  crow(g, b, j, gy, t, red, dt) {
    const ox = (j - (b.n - 1) / 2) * 20 + j * 3;
    if (b.st === 0) {
      const peck = Math.max(0, Math.sin(t * 1.3 + j * 2.1 + b.ph)) > 0.92 ? 3 : 0, x = b.x + ox, f = (j % 2 ? -1 : 1) * b.face;
      g.globalAlpha = 0.85; g.beginPath(); g.ellipse(x, gy - 7, 7, 4.2, f * 0.25, 0, 6.2832); g.fill(); // body
      g.beginPath(); g.arc(x + f * 6, gy - 10 + peck, 2.8, 0, 6.2832); g.fill(); // head
      g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + f * 8, gy - 10 + peck); g.lineTo(x + f * 12, gy - 9 + peck * 1.3); g.stroke(); // beak
      g.lineWidth = 2; g.beginPath(); g.moveTo(x - f * 6, gy - 8); g.lineTo(x - f * 12, gy - 5); g.stroke(); // tail
      g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - 1, gy - 4); g.lineTo(x - 2, gy); g.moveTo(x + 2, gy - 4); g.lineTo(x + 1, gy); g.stroke(); // legs
    } else {
      const u = b.t + j * 0.15, x = b.x + ox + b.face * (u * 90 + u * u * 30), y = gy - 8 - (u * 50 + u * u * 26) - j * 6;
      g.globalAlpha = 0.85 * clamp(1 - (u - 4) / 1.5, 0, 1); g.lineWidth = 2.2;
      wings(g, x, y, 1.6, red ? 0.5 : 0.5 + 0.5 * Math.sin(u * 16 + j));
      g.beginPath(); g.ellipse(x, y + 1, 4, 2.2, 0, 0, 6.2832); g.fill();
    }
  }
  egret(g, b, gy, t, red, dt) {
    const paper = '#f4efe2', f = b.face;
    if (b.st === 0) {
      const x = b.x, bob = Math.sin(t * 0.6 + b.ph) * 1.2, by = gy - 30;
      g.globalAlpha = 0.9; g.fillStyle = paper; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, by, 11, 6, -f * 0.25, 0, 6.2832); g.fill(); g.stroke(); // body
      g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + f * 8, by - 3); g.bezierCurveTo(x + f * 16, by - 10, x + f * 4, by - 18 + bob, x + f * 11, by - 24 + bob); g.stroke(); // S neck
      g.beginPath(); g.arc(x + f * 12, by - 25 + bob, 2.6, 0, 6.2832); g.fill(); g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(x + f * 14, by - 25 + bob); g.lineTo(x + f * 22, by - 23 + bob); g.stroke(); // bill
      g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - 1, by + 5); g.lineTo(x - 2, gy); g.moveTo(x + 2, by + 5); g.lineTo(x + 4, gy); g.stroke(); // legs in the water
      g.globalAlpha = 0.25; g.beginPath(); g.moveTo(x - 8, gy + 1); g.lineTo(x + 10, gy + 1); g.stroke(); // ripple line
      g.fillStyle = INKW;
    } else {
      // big slow wing beats, away from the ronin, legs trailing
      const u = b.t, x = b.x + f * (u * 70 + u * u * 10), y = gy - 30 - u * 34 - u * u * 6, fl = red ? 0.5 : 0.5 + 0.5 * Math.sin(u * 5);
      g.globalAlpha = 0.9 * clamp(1 - (u - 4.5) / 1.5, 0, 1); g.fillStyle = paper; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(x, y, 10, 4.5, 0, 0, 6.2832); g.fill(); g.stroke();
      g.lineWidth = 1.6; wings(g, x, y - 1, 3.2, fl);
      g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - f * 9, y + 1); g.lineTo(x - f * 22, y + 3); g.moveTo(x + f * 9, y - 1); g.quadraticCurveTo(x + f * 14, y - 4, x + f * 17, y - 3); g.stroke();
      g.fillStyle = INKW;
    }
  }
}
