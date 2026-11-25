// KAZE renderer: composes the ink painting each frame from cached layers plus live strokes.
// Order: paper+sky, parallax bands, back props, ground band, figures and ink effects, front props, weather,
// paper grain (multiply), letterbox, calligraphy cards, HUD.
import { INK, rng, clamp, lerp, makeCanvas, rgba, mix, makePaper, makeGrain, ribbon, leaf, drop, stroke } from './brush.js';
import { buildScene, paintSky, bamboo, torii, pine, rock, TW, REDP, paintRedSky } from './scenery.js';
import { CHAPTERS, groundH, ATK, BOSSES, HAIKU } from './data.js';
import { poseFor, drawFigure, newFig, stepScarf, LOOKS, POSE, lerpPose, BOSSLOOK, drawFoxFig, walkLegs, brushLine } from './figures.js';
import { P as PT, standoffPose } from './sim.js';

export const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,"Times New Roman",serif';
export const JP = '"Yu Mincho","YuMincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Noto Serif JP","Noto Serif CJK JP","Source Han Serif JP","MS Mincho","Noto Sans JP",serif';
const RED = '#b8321e';
const N_PART = 900;
// a soft round ink dab, drawn once and reused for motes
const SOFT = (() => { if (typeof document === 'undefined') return null; const c = makeCanvas(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(23,19,15,0.9)'); gr.addColorStop(0.45, 'rgba(23,19,15,0.45)'); gr.addColorStop(1, 'rgba(23,19,15,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c; })();
// particle kinds
const LEAF = 1, PETAL = 2, DROP = 3, MOTE = 4, SNOW = 5, MIST = 6, SPARK = 7, GOLD = 8, GUST = 9, SMOKE = 10;

export class Renderer {
  constructor(cv) {
    this.cv = cv; this.g = cv.getContext('2d', { alpha: false });
    this.cam = { x: 0, y: 0, zoom: 1, vx: 0, init: false }; this.ch = -1; this.time = 0; this.reduced = false; this.lb = 0; this.shake = 0; this.flash = 0;
    this.parts = Array.from({ length: N_PART }, () => ({ on: 0 })); this.pi = 0; this.decals = []; this.arcs = []; this.figs = new Map();
    this.pfig = newFig(true, 7); this.ofig = newFig(false, 311); this.foxFig = { t: 0 }; this.expr = { k: 'calm', t: 0 };
    this.v = { W: 0, H: 0, k: 1, gy: 0, cy: 0, camX: 0, camY: 0, zoom: 1, vx: 0 };
    this.weatherAcc = 0; this.red = 0; this.red2 = 0; this.cool = 0; this.redPulse = 0; this.inkFrame = 0; this.redSkyC = null; this.lastFigs = []; this.bossCard = null; this.cutFx = null; this.lastSo = null; this.hurtT = 0; this.gust = null; this.titleDrift = 0;
  }
  resize(w, h, dpr) {
    const W = Math.max(2, Math.round(w * dpr)), H = Math.max(2, Math.round(h * dpr));
    if (W === this.v.W && H === this.v.H) return;
    this.cv.width = W; this.cv.height = H; this.v.W = W; this.v.H = H; this.dpr = dpr;
    const portrait = W / H < 1.2;
    this.v.k = portrait ? W / 470 : Math.min(H / 480, W / 600);
    this.v.gy = portrait ? H * 0.6 : H * 0.8; this.v.cy = this.v.gy - 100 * this.v.k;
    this.portrait = portrait;
    if (this.ch >= 0) this.rebuild();
  }
  setChapter(ch) { if (ch === this.ch && this.scene) return; this.ch = ch; this.scene = buildScene(ch); this.figs.clear(); this.decals.length = 0; this.arcs.length = 0; for (const p of this.parts) p.on = 0; this.props = buildProps(ch); this.rebuild(); }
  rebuild() {
    const { W, H, k } = this.v, C = CHAPTERS[this.ch];
    this.bg = makePaper(W, H, C.paper, 3 + this.ch);
    paintSky(this.bg.getContext('2d'), W, H, k, this.ch, C.paper);
    this.grain = makeGrain(W, H, 5 + this.ch, this.scene.night ? 0.3 : 0.24);
    const cap = Math.min(2, k);
    for (const b of this.scene.bands) b.setScale(Math.min(cap, k * b.res));
    this.sprites = buildSprites(this.ch, Math.min(2, k));
  }

  // ---------- camera ----------
  updateCamera(s, dt, mode) {
    const v = this.v, c = this.cam, p = s.p, px = lerp(p.ox, p.x, this.alpha);
    let tx = px + p.face * 90 + clamp(p.vx, -260, 260) * 0.3, zoom = 1;
    if (mode === 'title') { this.titleDrift += dt; tx = px - (this.portrait ? 0 : 150) + Math.sin(this.titleDrift * 0.08) * 40; zoom = 1; }
    else if (s.phase === 'standoff' && s.so) { const so = s.so; tx = (px + lerp(so.oppOX, so.oppX, this.alpha)) / 2; zoom = so.st === 'hold' || so.st === 'strike' ? 1.3 + Math.min(0.08, so.t * 0.01) : so.st === 'ready' ? 1.22 : 1.1; }
    else if (s.phase === 'haiku') { tx = px + 210; zoom = 0.84; }
    else if (s.arena) {
      // frame the fight: centre on the duellists and ease in until they stand about a third of the screen tall
      let lo = px, hi = px; for (const f of s.foes) if (f.st !== 'dead' && (f.st !== 'enter' || Math.abs(f.x - px) < 500)) { lo = Math.min(lo, f.x); hi = Math.max(hi, f.x); }
      tx = (lo + hi) / 2 * 0.8 + px * 0.2; const need = hi - lo + 300, fit = v.W / (v.k * need);
      zoom = clamp(fit, 1, s.arena.boss ? 1.28 : 1.24) + (s.arena.boss ? this.red2 * 0.06 : 0);
    }
    else if (s.phase === 'ending') { tx = px + 60; zoom = 0.92; }
    if (this.reduced && zoom > 1) zoom = 1 + (zoom - 1) * 0.5;
    if (!c.init) { c.x = tx; c.y = -groundH(this.ch, px); c.zoom = zoom; c.init = true; }
    const kk = 1 - Math.exp(-dt * (s.phase === 'standoff' ? 1.6 : 3.2));
    const ox = c.x; c.x += (tx - c.x) * kk; c.vx = (c.x - ox) / Math.max(dt, 1e-3);
    const ty = -(groundH(this.ch, px) * 0.6 + groundH(this.ch, tx) * 0.4);
    c.y += (ty - c.y) * (1 - Math.exp(-dt * 2.5));
    c.zoom += (zoom - c.zoom) * (1 - Math.exp(-dt * 2.2));
    v.camX = c.x; v.camY = c.y; v.zoom = c.zoom; v.vx = c.vx;
  }
  worldTransform(g, f = 1) {
    const v = this.v, K = v.k * (1 + (v.zoom - 1) * f);
    let sx = 0, sy = 0; if (this.shake > 0 && !this.reduced) { sx = (Math.random() - 0.5) * this.shake * v.k * 6; sy = (Math.random() - 0.5) * this.shake * v.k * 4; }
    g.setTransform(K, 0, 0, K, v.W / 2 - v.camX * f * K + sx, v.cy + (100 - v.camY * f) * K + sy);
    return K;
  }

  // ---------- frame ----------
  frame(s, alpha, dt, ui) {
    this.alpha = alpha; this.time += dt; this.reduced = !!ui.reduced; this.boilN = this.reduced ? 0 : Math.floor(this.time * 12);
    if (s.ch !== this.ch) this.setChapter(s.ch);
    const g = this.g, v = this.v, W = v.W, H = v.H, C = CHAPTERS[this.ch];
    const mode = ui.mode || 'play';
    this.updateCamera(s, dt, mode);
    this.consume(s, ui);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3); if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 4);
    this.updateMood(s, dt, mode);
    const wind = s.wind.w * (1 + this.red * 0.9);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(this.bg, 0, 0);
    if (this.red > 0.01) this.drawDuelSky(g, s);
    v.red = this.red; v.pal = REDP[this.scene.key];
    const budget = { n: 2, r: this.red > 0.01 ? 3 : 0 };
    const bands = this.scene.bands;
    for (let i = 0; i < bands.length - 1; i++) { g.setTransform(1, 0, 0, 1, 0, 0); bands[i].draw(g, v, budget); }
    // back props (between the mid-ground and the path)
    this.drawProps(g, this.props.back, wind, 'back');
    g.setTransform(1, 0, 0, 1, 0, 0); bands[bands.length - 1].draw(g, v, budget);
    // moonlight: the snow is paper, but at night it should read blue-grey
    if (this.scene.night) { g.setTransform(1, 0, 0, 1, 0, 0); const ng = g.createLinearGradient(0, H * 0.25, 0, H); ng.addColorStop(0, 'rgba(70,84,110,0)'); ng.addColorStop(0.6, 'rgba(70,84,110,0.38)'); ng.addColorStop(1, 'rgba(70,84,110,0.5)'); g.globalCompositeOperation = 'multiply'; g.fillStyle = ng; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
    this.drawProps(g, this.props.ground, wind, 'ground');
    // world space
    this.worldTransform(g, 1);
    this.drawDecals(g, dt);
    this.drawInteractables(g, s, mode);
    this.drawEntities(g, s, dt, mode);
    this.drawArcs(g, dt);
    this.stepParticles(g, s, dt, wind, mode);
    this.drawProps(g, this.props.grass, wind, 'grass');
    this.drawProps(g, this.props.front, wind, 'front');
    // paper grain over everything: the ink sits in the paper
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.drawImage(this.grain, 0, 0); g.globalCompositeOperation = 'source-over';
    if (this.flash > 0 && !this.reduced) { g.globalAlpha = this.flash * 0.35; g.fillStyle = C.paper; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    // standoff: a cooler, desaturated held breath; the cut floods it red for an instant
    if (this.cool > 0.01) { g.globalAlpha = this.cool * 0.55; g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'multiply'; g.globalAlpha = this.cool * 0.22; g.fillStyle = '#6f84a0'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    if (this.redPulse > 0.01) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = this.redPulse * 0.7; g.fillStyle = '#c8321f'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    // the ink frame: one frame of bare paper and black ink on a perfect parry or the killing stroke
    if (this.inkFrame > 0) { this.inkFrame--; this.drawInkFrame(g); }
    if (this.hurtT > 0) { this.hurtT -= dt; this.drawHurt(g, this.hurtT); }
    // letterbox for duels and standoffs
    const lbT = mode === 'play' && (s.phase === 'standoff' || (s.arena && s.arena.boss) || s.phase === 'ending') ? 1 : 0;
    this.lb += (lbT - this.lb) * (1 - Math.exp(-dt * 3));
    if (this.lb > 0.01) this.drawLetterbox(g, this.lb);
    if (mode === 'play') {
      if (s.card) this.drawCard(g, s.card);
      this.drawHUD(g, s, ui);
    }
    if (s.phase === 'dead') { g.globalAlpha = clamp(s.pt / 1.2, 0, 0.7); g.fillStyle = INK; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  }

  // ---------- the duel mood ----------
  updateMood(s, dt, mode) {
    const boss = s.arena && s.arena.boss ? s.foes.find((f) => f.boss) : null;
    const live = mode === 'play' && boss && boss.st !== 'dead' && boss.st !== 'enter' || (boss && boss.st === 'enter' && boss.stt > 0.4);
    const tgt = live ? 1 : 0, rate = live ? 1 / 1.5 : 1 / 2.6;
    this.red = clamp(this.red + Math.sign(tgt - this.red) * dt * rate, 0, 1); if (Math.abs(tgt - this.red) < dt * rate) this.red = tgt;
    const t2 = live && boss.phase === 2 ? 1 : 0; this.red2 += (t2 - this.red2) * Math.min(1, dt * 1.2); if (!live && !boss) this.red2 *= 0.95;
    const so = s.phase === 'standoff' && s.so && (s.so.st === 'ready' || s.so.st === 'hold' || s.so.st === 'strike');
    this.cool += ((so ? 1 : 0) - this.cool) * Math.min(1, dt * (so ? 1.5 : 4));
    if (this.redPulse > 0) this.redPulse = Math.max(0, this.redPulse - dt * 1.2);
    this.bossX = boss ? boss.x : this.bossX;
  }
  drawDuelSky(g, s) {
    const { W, H, k } = this.v, P = REDP[this.scene.key], r = this.red, e = r * r * (3 - 2 * r);
    if (!this.redSkyC || this.redSkyC.width !== W || this.redSkyC.height !== H || this.redSkyC.key !== this.scene.key) { this.redSkyC = paintRedSky(W, H, k, this.scene.key); this.redSkyC.key = this.scene.key; }
    // the wash bleeds up from the horizon: reveal it bottom-first as it floods in
    const top = H * (1 - Math.min(1, e * 1.25));
    g.globalAlpha = Math.min(1, e * 1.1); g.drawImage(this.redSkyC, 0, top, W, H - top, 0, top, W, H - top);
    g.globalAlpha = e * 0.85; g.drawImage(this.redSkyC, 0, 0); g.globalAlpha = 1;
    if (this.red2 > 0.01) { g.globalAlpha = this.red2 * 0.4 * e; g.fillStyle = P.top; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    // the pale disc behind the duel, larger in the second phase, ringed with the chapter's own colour
    const cx = clamp(this.worldToScreenX(this.bossX || this.v.camX) - 60 * k, W * 0.3, W * 0.7), cy = H * 0.36, rad = k * 70 * (1 + 0.3 * this.red2) * (0.85 + 0.15 * e);
    g.save(); g.globalAlpha = e * 0.5; const ring = g.createRadialGradient(cx, cy, rad * 0.9, cx, cy, rad * 1.7); ring.addColorStop(0, rgba(P.ring, 0.6)); ring.addColorStop(1, rgba(P.ring, 0)); g.fillStyle = ring; g.fillRect(cx - rad * 2, cy - rad * 2, rad * 4, rad * 4);
    g.globalAlpha = e * 0.95; g.fillStyle = P.disc; g.shadowColor = P.disc; g.shadowBlur = 10 * k; g.beginPath(); g.arc(cx, cy, rad, 0, 6.2832); g.fill(); g.restore();
    this.discX = cx; this.discY = cy;
  }
  drawInkFrame(g) {
    const { W, H } = this.v, C = CHAPTERS[this.ch];
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    this.worldTransform(g, 1);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); for (let x = this.v.camX - 900; x < this.v.camX + 900; x += 20) { const y = -groundH(this.ch, x); x === this.v.camX - 900 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    for (const F of this.lastFigs) drawFigure(g, F[0], F[1], F[2], F[3], F[4], Object.assign({}, F[5], { flat: INK, dt: 0, alpha: 1 }));
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  // draw a figure: in the duel, a black silhouette with a thin rim of red light on the side facing the disc
  fig(g, x, y, look, pose, fig, o) {
    if (this.red > 0.05) {
      const P = REDP[this.scene.key], dir = this.discX != null && this.worldToScreenX(x) > this.discX ? -1 : 1;
      g.save(); g.translate(dir * 1.8, -0.9); drawFigure(g, x, y, look, pose, fig, Object.assign({}, o, { flat: mix(P.hor, '#ffe8d0', 0.35), dt: 0, alpha: (o.alpha ?? 1) * this.red })); g.restore();
      o.shade = this.red * 0.6;
    }
    this.lastFigs.push([x, y, look, pose, fig, o]);
    return drawFigure(g, x, y, look, pose, fig, o);
  }
  // ---------- cues → effects ----------
  consume(s, ui) {
    const C = CHAPTERS[this.ch], acc = C.accent;
    for (const c of s.cues) {
      const gy = (x) => -groundH(this.ch, x);
      switch (c.k) {
        case 'swing': break;
        case 'cut': { const fg = this.figs.get(c.id); if (fg) fg.sqv = 5; }
          this.splash(c.x, gy(c.x) - 60, c.dmg > 1 ? 26 : 14, acc, s.p.face); this.shake = Math.max(this.shake, c.dmg > 1 ? 0.6 : 0.3); break;
        case 'riposte': if (s.arena && s.arena.boss && !this.reduced) this.inkFrame = 2; this.splash(c.x, gy(c.x) - 62, 34, acc, s.p.face); this.shake = 0.8; this.flash = 0.6; break;
        case 'kill': { if (c.boss && !this.reduced) this.inkFrame = 3; const fig = this.figs.get(c.id); if (fig) fig.dieT = this.time; this.dissolveAt(c.x, gy(c.x), acc, c.boss ? 70 : 34); if (c.boss) { this.flash = 1; this.shake = 1; } break; }
        case 'parry': case 'reflect': this.expr = { k: 'wide', t: 0.7 }; if (this.red > 0.5 && !this.reduced) this.inkFrame = 1; this.sparks(c.x, gy(c.x) - 66, 14); this.ring(c.x, gy(c.x) - 66); this.flash = Math.max(this.flash, 0.5); break;
        case 'deflect': case 'clash': this.sparks(c.x, gy(c.x) - 62, 7); this.shake = Math.max(this.shake, 0.25); break;
        case 'guardbreak': this.sparks(c.x, gy(c.x) - 60, 16); this.splash(c.x, gy(c.x) - 50, 10, INK, s.p.face); this.shake = 0.7; break;
        case 'hurt': this.pfig.sqv = -5; this.splash(c.x, gy(c.x) - 60, 18, acc, s.p.x < c.x ? 1 : -1); this.hurtT = 0.6; this.shake = 0.7; break;
        case 'tell': { const fig = this.figs.get(c.id); if (fig) fig.tell = { t0: this.time, red: c.red }; break; }
        case 'feint': { const fig = this.figs.get(c.id); if (fig) fig.tell = null; break; }
        case 'gust': this.gust = { t: 0, x: c.x, tx: c.tx }; break;
        case 'socut': this.cutFx = { t: 0 }; this.flash = this.reduced ? 0 : 0.9; this.redPulse = this.reduced ? 0.4 : 1; this.expr = { k: 'win', t: 1.6 }; break;
        case 'clear': if (c.boss) this.expr = { k: 'win', t: 2.5 }; break;
        case 'jump': this.pfig.sqv = -3; break;
        case 'sodraw': this.ofig.tell = { t0: this.time, red: false }; break;
        case 'sofeint': this.ofig.flick = this.time; break;
        case 'blessing': case 'secret': case 'charm': for (let i = 0; i < 26; i++) this.spawn(SMOKE, s.p.x + (Math.random() - 0.5) * 30, gy(s.p.x) - 30 - Math.random() * 30, (Math.random() - 0.5) * 10, -20 - Math.random() * 20, 2 + Math.random() * 2, 4 + Math.random() * 4, INK); if (c.k !== 'blessing') this.dissolveAt(s.p.x, gy(s.p.x), acc, 30, true); break;
        case 'death': this.splash(c.x, gy(c.x) - 50, 40, acc, 1); break;
        case 'phase2': this.ring(c.x, gy(c.x) - 60, 3); this.dissolveAt(c.x, gy(c.x), INK, 24); this.shake = 0.6; break;
        case 'boss': this.bossCard = { t0: this.time, boss: c.boss }; break;
        case 'step': if (C.key === 'snow') for (let i = 0; i < 3; i++) this.spawn(SNOW, c.x + (Math.random() - 0.5) * 10, gy(c.x) - 2, (Math.random() - 0.5) * 40, -30 - Math.random() * 30, 0.6, 1.5, C.paper); else if (c.run) this.spawn(MOTE, c.x, gy(c.x) - 2, -s.p.face * 10, -6, 0.6, 3, INK); break;
        case 'land': this.pfig.sqv = 4.5; for (let i = 0; i < 4; i++) this.spawn(MOTE, c.x + (Math.random() - 0.5) * 16, gy(c.x) - 2, (Math.random() - 0.5) * 30, -8, 0.6, 3, INK); break;
        case 'chapter': case 'respawn': this.cam.init = false; this.arcs.length = 0; break;
      }
    }
    s.cues.length = 0;
  }
  spawn(kind, x, y, vx, vy, life, size, col, rot = 0) {
    for (let n = 0; n < N_PART; n++) {
      this.pi = (this.pi + 1) % N_PART; const p = this.parts[this.pi];
      if (!p.on || n === N_PART - 1) { p.on = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = 0; p.life = life; p.size = size; p.col = col; p.rot = rot || Math.random() * 6.28; p.vr = (Math.random() - 0.5) * 6; p.seed = Math.random(); return p; }
    }
  }
  splash(x, y, n, acc, dir) {
    if (this.reduced) n = Math.ceil(n * 0.6);
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4 + dir * 0.6, sp = 80 + Math.random() * 260; this.spawn(DROP, x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 16, Math.cos(a) * sp * (dir || 1) * (Math.random() < 0.3 ? -0.4 : 1), Math.sin(a) * sp, 1.4, 1.2 + Math.random() * 3.2, Math.random() < 0.42 ? acc : INK); }
  }
  sparks(x, y, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 120 + Math.random() * 220; this.spawn(SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, 0.22 + Math.random() * 0.12, 6 + Math.random() * 6, INK, a); } }
  ring(x, y, big = 1) { this.arcs.push({ ring: 1, x, y, r: 16 * big, t: 0, life: 0.45 * big, col: INK, w: 4 }); }
  dissolveAt(x, y, acc, n, up) {
    for (let i = 0; i < n; i++) {
      const hy = y - Math.random() * 100;
      if (Math.random() < 0.45) this.spawn(PETAL, x + (Math.random() - 0.5) * 30, hy, (Math.random() - 0.2) * 60, -20 - Math.random() * 40, 2.5 + Math.random() * 2, 2.4 + Math.random() * 2, acc);
      else this.spawn(MOTE, x + (Math.random() - 0.5) * 34, hy, (Math.random() - 0.3) * 40, -12 - Math.random() * (up ? 50 : 30), 1.6 + Math.random() * 1.6, 2 + Math.random() * 3.5, INK);
    }
  }

  // ---------- props ----------
  drawProps(g, list, wind, layer) {
    if (!list || !list.length) return;
    const v = this.v, t = this.time, spr = this.sprites;
    for (const pr of list) {
      const f = pr.f, K = v.k * (1 + (v.zoom - 1) * f);
      const sx = v.W / 2 + (pr.x - v.camX * f) * K; if (sx < -260 * K || sx > v.W + 260 * K) continue;
      const wx = f === 1 ? pr.x : v.camX + (pr.x - v.camX * f) * K / (v.k * v.zoom);
      const by = pr.base != null ? pr.base : -groundH(this.ch, wx) * (f === 1 ? 1 : 1) + (pr.dy || 0) + (f === 1 ? 0 : -v.camY * (1 - f));
      const sy = v.cy + (by - v.camY * f + 100) * K;
      const sway = (wind * (pr.flex || 0.04) + Math.sin(t * (0.9 + pr.seed) + pr.x * 0.01) * 0.012 * (0.5 + Math.abs(wind))) * (this.reduced ? 0.6 : 1);
      if (pr.kind === 'spr') {
        const S = spr[pr.set][pr.i % spr[pr.set].length]; let a = pr.a;
        if (layer === 'front') { const cx = Math.abs(sx - v.W / 2) / (v.W / 2); a *= clamp(cx * 2.4 - 0.45, 0, 1) * (1 - this.lb); if (a <= 0.01) continue; }
        const c = Math.cos(sway), sn = Math.sin(sway), sc = pr.sc || 1;
        g.setTransform(K * c * sc, K * sn * sc, -K * sn * sc, K * c * sc, sx, sy); g.globalAlpha = a;
        g.drawImage(S.c, -S.ax, -S.ay, S.w, S.h);
      } else if (pr.kind === 'grass') {
        g.setTransform(K, 0, 0, K, sx, sy); g.strokeStyle = pr.col || INK; g.lineCap = 'round';
        const n = pr.n, h = pr.h;
        for (let i = 0; i < n; i++) {
          const bx = (i - n / 2) * 2.2, l = h * (0.6 + ((i * 7919 + pr.seed * 100) % 10) / 22), lean = (i - n / 2) * 0.09 + sway * 9 + wind * 0.25;
          const ex = bx + Math.sin(lean) * l, ey = -Math.cos(lean) * l;
          g.globalAlpha = pr.a * (0.6 + (i % 3) * 0.18); g.lineWidth = 1 + (i % 2) * 0.6;
          g.beginPath(); g.moveTo(bx, 0); g.quadraticCurveTo(bx + (ex - bx) * 0.15, ey * 0.55, ex, ey); g.stroke();
          if (pr.head && i % 2 === 0) { g.globalAlpha = pr.a * 0.7; g.fillStyle = pr.head; g.beginPath(); g.ellipse(ex, ey + 2, 1.6, 4.5, lean, 0, 6.3); g.fill(); }
        }
      } else if (pr.kind === 'lantern') {
        g.setTransform(K, 0, 0, K, sx, sy);
        g.globalAlpha = 0.9; g.strokeStyle = '#121317'; g.lineCap = 'round'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 4); g.lineTo(1, -98); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(-1, -96); g.lineTo(18, -100); g.stroke();
        const sw = Math.sin(t * 1.6 + pr.seed * 6) * 0.12 + wind * 0.12, lx = Math.sin(sw) * 14, ly = -96 + 2 + Math.cos(sw) * 14;
        const gr = g.createRadialGradient(16 + lx, ly, 2, 16 + lx, ly, 70); gr.addColorStop(0, rgba('#f6efdc', 0.5)); gr.addColorStop(1, rgba('#f6efdc', 0));
        g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(16 + lx - 70, ly - 70, 140, 140);
        g.strokeStyle = INK; g.lineWidth = 0.8; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(16, -98); g.lineTo(16 + lx, ly - 7); g.stroke();
        g.fillStyle = '#f7f0de'; g.globalAlpha = 0.95; g.beginPath(); g.ellipse(16 + lx, ly, 5.5, 8, sw, 0, 6.3); g.fill();
        g.strokeStyle = INK; g.globalAlpha = 0.7; g.lineWidth = 1; g.stroke();
      }
    }
    g.globalAlpha = 1;
  }

  // ---------- world objects ----------
  drawInteractables(g, s, mode) {
    const C = CHAPTERS[this.ch], t = this.time;
    for (const e of s.ev) {
      if (e.t === 'hidden' && !e.done) {
        const gy = -groundH(this.ch, e.x), vis = e.revealed ? 0.9 : 0.28;
        g.globalAlpha = vis; const S = this.sprites.hidden[0]; g.drawImage(S.c, e.x - S.ax, gy - S.ay, S.w, S.h); g.globalAlpha = 1;
      }
      if (e.t === 'shrine' && e.blessed) { if (Math.random() < 0.08) this.spawn(SMOKE, e.x + 2, -groundH(this.ch, e.x) - 26, 4, -14, 2.5, 3, INK); }
    }
    const fx = s.fox; if (fx && fx.st !== 'gone') this.drawFox(g, fx, C);
    if (fx && fx.charm && fx.st !== 'gone') { const e = s.ev[fx.ev], x = e.path[e.path.length - 1] + 10, y = -groundH(this.ch, x); g.globalAlpha = 0.85 + Math.sin(t * 3) * 0.1; g.fillStyle = C.accent; g.beginPath(); g.ellipse(x, y - 26, 4, 6, 0, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1; }
  }
  drawFox(g, fx, C) {
    const x = lerp(fx.ox ?? fx.x, fx.x, this.alpha), y = -groundH(this.ch, x);
    this.foxFig.t += 1 / 60; drawFoxFig(g, x, y, fx.face || 1, fx.st === 'run', this.time, 23, this.boilN, this.reduced);
  }
  figFor(id, scarf) { let f = this.figs.get(id); if (!f) { f = newFig(scarf, id * 97 + 13); this.figs.set(id, f); } return f; }
  drawEntities(g, s, dt, mode) {
    this.lastFigs.length = 0;
    const C = CHAPTERS[this.ch], acc = C.accent, wind = s.wind.w, a = this.alpha, t = this.time;
    const p = s.p, px = lerp(p.ox, p.x, a), py = -groundH(this.ch, px) - lerp(p.oy, p.y, a);
    // shadows: soft wash ellipses on the ground
    const shadow = (x, w) => { const y = -groundH(this.ch, x) + 1; g.globalAlpha = 0.16; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, w, 3.5, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; };
    // foes
    for (const f of s.foes) {
      const fig = this.figFor(f.id); fig.t += dt;
      const fx = lerp(f.ox, f.x, a), fy = -groundH(this.ch, fx);
      let al = 1; if (f.st === 'dead') { al = clamp(1 - (f.stt - 0.5) / 1.3, 0, 1); if (al > 0 && Math.random() < 0.35) this.spawn(MOTE, fx + (Math.random() - 0.5) * 26, fy - 10 - Math.random() * 80, wind * 30 + (Math.random() - 0.5) * 16, -18 - Math.random() * 14, 1.6, 2 + Math.random() * 3, INK); if (al <= 0) continue; }
      if (f.st === 'enter' && Math.abs(f.vx) > 1) fig.walk = (fig.walk || 0) + Math.abs(f.vx) * dt;
      else if (Math.abs(f.vx) > 1) fig.walk = (fig.walk || 0) + Math.abs(f.vx) * dt;
      const look = f.boss ? BOSSLOOK[f.boss] : f.type; const pose = poseFor(fig, f, look, t, false, { dt });
      walkLegs(pose, fig.walk || 0, Math.abs(f.vx), f.st);
      shadow(fx, 20 * (LOOKS[look] ? LOOKS[look].sc : 1));
      const o = { face: f.face, alpha: al, wind, vx: f.vx, dt, boilN: this.boilN, reduced: this.reduced, sash: f.boss ? acc : null, shield: !!f.shield, draw: look === 'archer' && f.st === 'wind' ? clamp(f.stt / f.windT, 0, 1) : 0, shieldOut: f.st === 'act' && f.atk === 'bash', walkPh: (fig.walk || 0) / 19, still: look === 'master' };
      if (f.st === 'opened') o.alpha = al * (0.85 + Math.sin(t * 30) * 0.1);
      const geo = this.fig(g, fx, fy, look, pose, fig, o);
      // telegraph: brush flick over the head, glint on the weapon (red = unblockable)
      this.trail(g, fig, o._tip, f.st === 'act' || (f.st === 'rec' && f.stt < 0.06), 6, dt);
      if (look === 'hyoe' && this.red > 0.2 && Math.random() < 0.35) this.spawn(GOLD, geo.N[0] - f.face * 14, geo.N[1] - 40, 0, -30, 2.5, 1 + Math.random() * 1.4, '#ffb46a');
      if (fig.tell && (f.st === 'wind' || f.st === 'act')) this.drawTell(g, fig.tell, o._tip || geo.G, geo.Hd, f.face);
      if (f.st === 'opened') this.drawOpened(g, geo.Hd, f.stt);
    }
    // standoff opponent
    if (s.so) this.drawStandoffOpp(g, s, dt);
    if (!s.so && this.lastSo) this.lastSo = null;
    // arrows
    g.strokeStyle = INK; g.lineCap = 'round';
    for (const ar of s.arrows) { const x = lerp(ar.ox ?? ar.x, ar.x, a), y = -groundH(this.ch, x) - ar.y, d = Math.sign(ar.vx); g.globalAlpha = 0.95; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - d * 22, y); g.lineTo(x, y); g.stroke(); g.lineWidth = 1; g.beginPath(); g.moveTo(x - d * 22, y); g.lineTo(x - d * 27, y - 3); g.moveTo(x - d * 22, y); g.lineTo(x - d * 27, y + 3); g.stroke(); g.globalAlpha = 0.25; g.lineWidth = 2; g.beginPath(); g.moveTo(x - d * 60, y); g.lineTo(x - d * 22, y); g.stroke(); g.globalAlpha = 1; if (ar.ref) { g.fillStyle = acc; g.beginPath(); g.arc(x, y, 2.5, 0, 6.3); g.fill(); } }
    // the ronin
    const fig = this.pfig; fig.t += dt;
    const pst = { st: p.st, stt: p.stt, combo: p.combo, drawn: p.drawn };
    if (mode === 'title') { pst.st = 'idle'; pst.drawn = false; }
    if (s.phase === 'ending') { pst.st = s.pt > 2.5 ? 'kneel' : 'idle'; pst.stt = s.pt - 2.5; pst.drawn = s.pt > 1.2; }
    const pose = poseFor(fig, pst, 'ronin', t, true, { dt, slash: PT.slash, heavy: PT.heavy, counter: PT.counter });
    const moving = p.st === 'move' || (s.phase === 'standoff' && Math.abs(p.vx) > 1) || (mode === 'title');
    if (moving) fig.walk = (fig.walk || 0) + (mode === 'title' ? 0 : Math.abs(p.vx)) * dt;
    if (mode !== 'title') walkLegs(pose, fig.walk || 0, moving ? Math.abs(p.vx) : 0, p.st);
    let roll = 0; if (p.st === 'dodge') roll = clamp(p.stt / PT.dodgeT, 0, 1) * Math.PI * 2 * (p.dodgeDir === p.face ? 1 : -1);
    const dead = p.st === 'dead';
    shadow(px, 22);
    const scarfCol = mix(acc, INK, 0.3);
    const ex = this.expr; ex.t -= dt; let expr = ex.t > 0 ? ex.k : 'calm'; if (p.st === 'hit' || p.st === 'dead') expr = 'hurt'; if (s.phase === 'ending' || p.st === 'iai') expr = 'win';
    const o = { face: p.face, alpha: 1, wind, vx: p.vx, roll, scarf: scarfCol, dt, boilN: this.boilN, reduced: this.reduced, expr, walkPh: (fig.walk || 0) / 19 };
    // scarf anchor follows the neck of the previous pose (close enough at 60 fps)
    const geo = this.fig(g, px, py, 'ronin', pose, fig, o);
    stepScarf(fig, geo.N[0] - p.face * 2, geo.N[1] + 2, p.face, wind, p.vx, dt, !fig.scarf.inited);
    const A0 = p.st === 'slash' ? PT.slash[p.combo || 0] : p.st === 'heavy' ? PT.heavy : p.st === 'counter' ? PT.counter : null;
    this.trail(g, fig, o._tip, !!A0 && p.stt > A0.wind * 0.6 && p.stt < A0.wind + A0.act + 0.07, p.st === 'slash' ? 9 : 13, dt);
    if (p.st === 'guard' && p.stt < 0.2) { g.globalAlpha = (0.2 - p.stt) * 3; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(px + p.face * 22, py - 70, 10 + p.stt * 60, 0, 6.3); g.stroke(); g.globalAlpha = 1; }
    if (dead) { /* body lies; the dissolve happens in the dead overlay */ }
  }
  trail(g, fig, tip, live, w, dt) {
    const T = fig.trailPts || (fig.trailPts = []); fig.trailAge = (fig.trailAge || 0) + dt;
    if (live && tip) { if (!T.length || fig.trailAge > 0.4) { T.length = 0; } T.push([tip[0], tip[1]]); fig.trailAge = 0; if (T.length > 14) T.shift(); }
    if (T.length < 3 || fig.trailAge > 0.38) return;
    const a = 0.92 * (1 - fig.trailAge / 0.38);
    // a single loaded stroke: thin where the cut began, full at the blade, drying from the tail
    brushLine(g, T, w * (1 - fig.trailAge * 1.2), INK, a, 7, { t0: 0.7, swell: 0.6 });
  }
  drawTell(g, tell, tip, head, face) {
    const age = this.time - tell.t0; if (age > 0.5) return;
    const k = clamp(age / 0.12, 0, 1), fade = clamp(1 - (age - 0.18) / 0.32, 0, 1);
    // brush flick: a quick dark stroke above the head
    if (age < 0.4) { g.globalAlpha = fade; g.strokeStyle = tell.red ? RED : INK; g.lineCap = 'round'; ribbon(g, [head[0] - face * 4, head[1] - 22, head[0] + face * 2, head[1] - 30, head[0] + face * 10, head[1] - 34], (u) => 3.4 * (1 - u) + 0.3, tell.red ? RED : INK, fade * 0.9, 0); }
    // glint: four-point star
    const r = (tell.red ? 18 : 13) * (0.4 + k * 0.6) * (0.5 + fade * 0.5), x = tip[0], y = tip[1];
    g.save(); g.translate(x, y); g.rotate(age * 2);
    const hot = tell.red && this.red > 0.3; // against the red sky the unblockable glint burns white with a dark core
    g.globalAlpha = fade; g.fillStyle = hot ? '#fff6e6' : tell.red ? RED : '#fffaf0';
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.18 : r, an = (i / 8) * Math.PI * 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill();
    g.strokeStyle = tell.red ? mix(RED, INK, 0.4) : INK; g.lineWidth = 0.9; g.stroke();
    if (!tell.red) { g.globalAlpha = fade * 0.5; g.beginPath(); g.arc(0, 0, r * 0.6, 0, 6.3); g.stroke(); }
    else if (hot) { g.globalAlpha = fade; g.fillStyle = INK; g.beginPath(); g.arc(0, 0, r * 0.22, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r * 1.1, 0, 6.3); g.stroke(); }
    else { g.globalAlpha = fade * 0.35; g.fillStyle = RED; g.beginPath(); g.arc(0, 0, r * 1.4, 0, 6.3); g.fill(); }
    g.restore(); g.globalAlpha = 1;
  }
  drawOpened(g, head, tt) {
    // a broken circle over an off-balance foe: strike now
    g.globalAlpha = clamp(1 - tt / 1.2, 0, 1) * 0.85; g.strokeStyle = INK; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.arc(head[0], head[1] - 26, 7 + tt * 4, 0.3, Math.PI * 1.75); g.stroke(); g.globalAlpha = 1;
  }
  drawStandoffOpp(g, s, dt) {
    const so = s.so, fig = this.ofig, t = this.time; fig.t += dt;
    if (this.lastSo !== so.idx + ':' + so.ev) { this.lastSo = so.idx + ':' + so.ev; fig.snap = true; fig.dieT = 0; }
    const x = lerp(so.oppOX, so.oppX, this.alpha), y = -groundH(this.ch, x), look = so.type, face = -1;
    const pose = standoffPose(so); let P;
    const gp = look === 'spear' ? POSE.thw : POSE.focus;
    const tgt = fig.target;
    if (pose === 'walk' || pose === 'next') { lerpPose(look === 'spear' ? POSE.thw : POSE.stand, POSE.stand, 0, tgt); }
    else if (pose === 'feint') { lerpPose(gp, look === 'spear' ? POSE.tha : POSE.s1w, 0.28, tgt); }
    else if (pose === 'strike') lerpPose(gp, look === 'spear' ? POSE.tha : POSE.s1a, clamp(so.ts / 0.25, 0, 1) * 0.6, tgt);
    else if (pose === 'cut') { if (so.t < 0.6) lerpPose(POSE.s1a, POSE.stun, so.t / 0.6, tgt); else lerpPose(POSE.stun, POSE.dead, clamp((so.t - 0.6) / 0.4, 0, 1), tgt); }
    else if (pose === 'fail') lerpPose(POSE.s1w, POSE.s1a, clamp(so.t / 0.12, 0, 1), tgt);
    else lerpPose(gp, gp, 0, tgt);
    if (!fig.pose.ff || fig.snap) { lerpPose(tgt, tgt, 0, fig.pose); fig.snap = false; }
    lerpPose(fig.pose, tgt, Math.min(1, dt * (pose === 'feint' ? 30 : 14)), fig.pose);
    P = fig.pose;
    let al = 1; if (pose === 'cut' && so.t > 0.9) { al = clamp(1 - (so.t - 0.9) / 0.6, 0, 1); if (Math.random() < 0.7) this.spawn(MOTE, x + (Math.random() - 0.5) * 30, y - Math.random() * 80, s.wind.w * 20 + 5, -12, 1.4, 3 + Math.random() * 4, INK); if (!fig.dis) { fig.dis = 1; this.dissolveAt(x, y, CHAPTERS[this.ch].accent, 30); } } else fig.dis = 0;
    if (pose === 'walk' || pose === 'next') { fig.walk = (fig.walk || 0) + 150 * dt; walkLegs(P, fig.walk, 150, 'move'); }
    g.globalAlpha = 0.16; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y + 1, 18, 3.5, 0, 0, 6.3); g.fill(); g.globalAlpha = 1;
    const o = { face, alpha: al, wind: s.wind.w, vx: 0, dt, boilN: this.boilN, reduced: this.reduced };
    const geo = this.fig(g, x, y, look, P, fig, o);
    if (pose === 'feint' && fig.flick && t - fig.flick < 0.3) { const age = t - fig.flick; ribbon(g, [geo.Hd[0] + 4, geo.Hd[1] - 22, geo.Hd[0] - 2, geo.Hd[1] - 30, geo.Hd[0] - 10, geo.Hd[1] - 34], (u) => 3.2 * (1 - u) + 0.3, INK, clamp(1 - age / 0.3, 0, 1) * 0.8, 0); }
    if (pose === 'strike' && fig.tell) this.drawTell(g, fig.tell, o._tip || geo.G, geo.Hd, face);
    // the cut: one long horizontal stroke across the frame
    if (this.cutFx) { const c = this.cutFx; c.t += dt; const k = clamp(c.t / 0.12, 0, 1), fade = clamp(1 - (c.t - 0.3) / 0.9, 0, 1); if (fade <= 0) this.cutFx = null; else { const yy = y - 64, x0 = x - 260, x1 = x0 + 520 * k; ribbon(g, [x0, yy + 6, (x0 + x1) / 2, yy - 2, x1, yy - 6], (u) => Math.sin(u * Math.PI) * 9 * fade + 0.5, INK, 0.9 * fade, 0.3); } }
  }
  drawArcs(g, dt) {
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const A = this.arcs[i]; A.t += dt; const u = A.t / A.life; if (u >= 1) { this.arcs.splice(i, 1); continue; }
      if (A.ring) { g.globalAlpha = (1 - u) * 0.8; g.strokeStyle = A.col; g.lineWidth = A.w * (1 - u); g.beginPath(); g.arc(A.x, A.y, A.r + u * 40, 0, 6.3); g.stroke(); g.globalAlpha = 1; continue; }
      // the stroke appears fast, then dries from its tail: it thins and pales
      const grow = clamp(A.t / 0.06, 0, 1), dry = Math.pow(u, 1.4);
      const a0 = A.a0, a1 = lerp(A.a0, A.a1, grow), from = lerp(a0, a1, dry * 0.85), n = 16, pts = [];
      for (let j = 0; j <= n; j++) { const an = lerp(from, a1, j / n); pts.push(A.x + Math.cos(an) * A.r * A.face, A.y + Math.sin(an) * A.r * 0.9); }
      ribbon(g, pts, (q) => Math.sin(clamp(q, 0, 1) * Math.PI * 0.95 + 0.1) * A.w * (1 - dry * 0.8), A.col, 0.85 * (1 - u * 0.7), 0.5);
      // bristle streaks along the outer edge
      g.strokeStyle = A.col; g.lineWidth = 0.9; g.globalAlpha = 0.5 * (1 - u); g.setLineDash([10, 4, 3, 6]);
      g.beginPath(); for (let j = 0; j <= n; j++) { const an = lerp(from, a1, j / n), rr = A.r + A.w * 0.4; j ? g.lineTo(A.x + Math.cos(an) * rr * A.face, A.y + Math.sin(an) * rr * 0.9) : g.moveTo(A.x + Math.cos(an) * rr * A.face, A.y + Math.sin(an) * rr * 0.9); } g.stroke();
      g.setLineDash([]); g.globalAlpha = 1;
    }
  }
  drawDecals(g, dt) {
    for (let i = this.decals.length - 1; i >= 0; i--) { const d = this.decals[i]; d.t += dt; const a = clamp(1 - (d.t - 5) / 3, 0, 1) * d.a; if (a <= 0) { this.decals.splice(i, 1); continue; } g.globalAlpha = a; g.fillStyle = d.col; g.beginPath(); g.ellipse(d.x, d.y, d.r * 1.8, d.r * 0.55, 0, 0, 6.3); g.fill(); }
    g.globalAlpha = 1;
  }
  stepParticles(g, s, dt, wind, mode) {
    const v = this.v, C = CHAPTERS[this.ch], key = C.key, acc = C.accent, t = this.time;
    // weather spawns across the visible world
    const halfW = v.W / 2 / (v.k * v.zoom), top = v.camY - 100 - (v.cy / (v.k * v.zoom)), bot = v.camY + (v.H - v.cy) / (v.k * v.zoom) - 100;
    const rate = { bamboo: 2.2, terraces: 5, torii: 1.2, snow: this.reduced ? 26 : 70, castle: 6 }[key] * (s.phase === 'standoff' ? 0.15 : 1);
    this.weatherAcc += dt * rate * (1 + this.red * 1.5);
    while (this.weatherAcc > 1) {
      this.weatherAcc -= 1;
      const x = v.camX + (Math.random() * 2.2 - 1.1) * halfW - wind * 120, y = top + Math.random() * (bot - top) * 0.5 - 20;
      if (this.red > 0.3 && Math.random() < 0.5) { const pc = REDP[key].part; const q = this.spawn(key === 'snow' ? SNOW : key === 'castle' ? PETAL : LEAF, x, top + Math.random() * (bot - top) * 0.6, 0, 20, 6, key === 'snow' ? 1.6 : 5, pc); continue; }
      if (key === 'snow') this.spawn(SNOW, x, top - 10 + Math.random() * 40, 0, 30 + Math.random() * 30, 9, 0.7 + Math.random() * 1.6, '#f4f1ea');
      else if (key === 'castle') this.spawn(PETAL, x, y, 0, 10, 8, 2 + Math.random() * 1.8, acc);
      else if (key === 'terraces') { if (Math.random() < 0.7) this.spawn(GOLD, x, top + (bot - top) * (0.35 + Math.random() * 0.5), 0, -4, 6, 0.8 + Math.random() * 1.2, acc); else this.spawn(LEAF, x, y, 0, 10, 8, 5 + Math.random() * 3, INK); }
      else if (key === 'torii') { if (Math.random() < 0.6) this.spawn(MIST, x, top + (bot - top) * (0.4 + Math.random() * 0.5), 0, 0, 9, 40 + Math.random() * 60, C.paper); else this.spawn(LEAF, x, y, 0, 10, 8, 5, INK); }
      else this.spawn(LEAF, x, y, 0, 12, 8, 6 + Math.random() * 4, Math.random() < 0.5 ? acc : INK);
    }
    // wind gust: leaves stream from the ronin toward what the wind wants you to find
    if (this.gust) {
      const G = this.gust; G.t += dt; if (G.t > 2.6) this.gust = null;
      else if (G.t < 2.0) for (let i = 0; i < (this.reduced ? 1 : 3); i++) { const sx = s.p.x - Math.sign(G.tx - s.p.x) * 60 + (Math.random() - 0.5) * 80, gy = -groundH(this.ch, s.p.x); const p = this.spawn(GUST, sx, gy - 20 - Math.random() * 110, 0, 0, 2.6, 5 + Math.random() * 3, Math.random() < 0.6 ? acc : INK); if (p) { p.tx = G.tx; p.ty = -groundH(this.ch, G.tx) - 40 - Math.random() * 30; } }
    }
    g.lineCap = 'round';
    for (const p of this.parts) {
      if (!p.on) continue;
      p.t += dt; if (p.t > p.life) { p.on = 0; continue; }
      const u = p.t / p.life, fade = Math.min(1, u * 6) * (1 - Math.pow(u, 3));
      switch (p.on) {
        case LEAF: case PETAL: {
          const wx = wind * (p.on === PETAL ? 120 : 90) + Math.sin(t * 1.7 + p.seed * 9) * 22;
          p.vx += (wx - p.vx) * dt * 1.5; p.vy += ((p.on === PETAL ? 18 : 26) + Math.sin(t * 2.3 + p.seed * 7) * 18 - p.vy) * dt * 2; p.rot += p.vr * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.on === LEAF) { leaf(g, p.x, p.y, p.rot, p.size, p.size * 0.22, p.col, 0.75 * fade, 0.1); }
          else { g.globalAlpha = 0.8 * fade; g.fillStyle = p.col; g.beginPath(); g.ellipse(p.x, p.y, p.size, p.size * 0.55 * Math.abs(Math.cos(p.rot)) + 0.3, p.rot * 0.3, 0, 6.3); g.fill(); }
          break;
        }
        case DROP: {
          p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; const gy = -groundH(this.ch, p.x);
          if (p.y >= gy) { p.on = 0; if (this.decals.length < 90) this.decals.push({ x: p.x, y: gy + 1 + Math.random() * 3, r: p.size * (0.8 + Math.random()), a: 0.6, col: p.col, t: 0 }); break; }
          drop(g, p.x, p.y, p.size, p.col, 0.9);
          break;
        }
        case MOTE: {
          // soft ink dispersing in water: a blurred dab that spreads, stretches with the wind and pales
          p.vx += (wind * 40 - p.vx) * dt; p.x += p.vx * dt; p.y += p.vy * dt; const r = p.size * (0.7 + u * 2.2);
          g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx || 0.001)); g.globalAlpha = 0.26 * (1 - u) * (p.col === INK ? 1 : 1.4); g.drawImage(SOFT, -r * 1.6, -r * 0.8, r * 3.2, r * 1.6); g.restore(); break;
        }
        case SMOKE: { p.vx += (wind * 18 - p.vx) * dt; p.x += p.vx * dt + Math.sin(t * 2 + p.seed * 9) * 0.3; p.y += p.vy * dt; g.globalAlpha = 0.14 * (1 - u); g.strokeStyle = INK; g.lineWidth = p.size * (1 + u); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + Math.sin(t * 3 + p.seed * 5) * 3, p.y - 6); g.stroke(); break; }
        case SNOW: { const wx = wind * 140 + Math.sin(t * 1.3 + p.seed * 11) * 16; p.vx += (wx - p.vx) * dt * 2; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > -groundH(this.ch, p.x) + 30) { p.on = 0; break; } g.globalAlpha = 0.85 * fade; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.size, 0, 6.3); g.fill(); break; }
        case GOLD: { p.x += (wind * 20 + Math.sin(t + p.seed * 8) * 8) * dt; p.y += (p.vy + Math.sin(t * 1.4 + p.seed * 6) * 6) * dt; g.globalAlpha = (0.3 + 0.5 * Math.abs(Math.sin(t * 3 + p.seed * 20))) * fade; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.size, 0, 6.3); g.fill(); break; }
        case MIST: { p.x += wind * 30 * dt; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); gr.addColorStop(0, rgba(p.col, 0.4 * fade)); gr.addColorStop(1, rgba(p.col, 0)); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2); break; }
        case SPARK: { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.9; p.vy *= 0.9; const l = p.size * (1 - u); g.globalAlpha = 1 - u; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - Math.cos(p.rot) * l, p.y - Math.sin(p.rot) * l); g.stroke(); g.strokeStyle = '#fffaf0'; g.lineWidth = 1.2; g.stroke(); break; }
        case GUST: {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 1;
          const sp = 420 + p.seed * 160; p.vx += ((dx / d) * sp - p.vx) * dt * 2.4; p.vy += ((dy / d) * sp * 0.6 + Math.sin(t * 6 + p.seed * 9) * 60 - p.vy) * dt * 2.4;
          p.x += p.vx * dt; p.y += p.vy * dt; p.rot += 8 * dt; if (d < 40) p.t = Math.max(p.t, p.life - 0.3);
          leaf(g, p.x, p.y, Math.atan2(p.vy, p.vx), p.size, p.size * 0.22, p.col, 0.85 * fade, 0.1);
          break;
        }
      }
    }
    g.globalAlpha = 1;
  }

  // ---------- overlays ----------
  drawHurt(g, t) {
    const { W, H } = this.v, a = clamp(t / 0.6, 0, 1) * (this.reduced ? 0.35 : 0.6);
    const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    gr.addColorStop(0, rgba(INK, 0)); gr.addColorStop(1, rgba(INK, a)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  drawLetterbox(g, a) {
    const { W, H } = this.v, h = H * 0.1 * a;
    g.fillStyle = '#16130f'; g.globalAlpha = 1; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h);
    // a thin worn edge, like the mounting silk of a scroll
    g.globalAlpha = 0.5 * a; g.fillStyle = CHAPTERS[this.ch].paper; g.fillRect(0, h - 1.5 * this.dpr, W, 1 * this.dpr); g.fillRect(0, H - h + 0.5 * this.dpr, W, 1 * this.dpr); g.globalAlpha = 1;
  }
  drawCard(g, card) {
    const { W, H } = this.v, C = CHAPTERS[card.ch], t = card.t;
    const a = clamp((t - 0.5) / 0.9, 0, 1) * clamp((5 - t) / 0.9, 0, 1); if (a <= 0) return;
    const size = Math.round(Math.min(H * 0.085, W * 0.09)), x = this.portrait ? W * 0.82 : W * 0.86, y0 = H * 0.17;
    // a pale wash banner behind the title
    g.save(); g.globalAlpha = a * 0.5;
    const gr = g.createLinearGradient(x - size, 0, x + size, 0); gr.addColorStop(0, rgba(C.paper, 0)); gr.addColorStop(0.5, rgba(C.paper, 0.9)); gr.addColorStop(1, rgba(C.paper, 0)); g.fillStyle = gr; g.fillRect(x - size, y0 - size * 0.6, size * 2, size * (C.jp.length + 2.4)); g.restore();
    g.save(); g.globalAlpha = a; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${size}px ${JP}`; g.shadowColor = rgba(INK, 0.6); g.shadowBlur = size * 0.06;
    const chars = [...C.jp]; chars.forEach((c, i) => g.fillText(c, x, y0 + i * size * 1.08));
    g.shadowBlur = 0;
    // the seal under the title
    const sy = y0 + chars.length * size * 1.08 + size * 0.25; drawSeal(g, x, sy, size * 0.62, C.paper);
    g.font = `italic ${Math.max(12 * this.dpr, Math.round(size * 0.24))}px ${SERIF}`; g.fillStyle = INK; g.globalAlpha = a * 0.85;
    g.fillText(`${['One', 'Two', 'Three', 'Four', 'Five'][card.ch]} · ${C.en}`, x, sy + size * 0.95);
    g.restore();
  }
  drawHUD(g, s, ui) {
    const { W, H } = this.v, d = this.dpr, p = s.p, C = CHAPTERS[this.ch], acc = C.accent;
    if (s.phase === 'narr' || s.phase === 'ending' || s.phase === 'credits' || s.phase === 'fin' || s.phase === 'haiku') return;
    const top = this.lb > 0.1 ? H * 0.1 * this.lb + 10 * d : 0;
    const x0 = 22 * d, y0 = top + 20 * d, u = 1.05 * d * (this.portrait ? 1.1 : 1);
    if (this.red > 0.05) { g.globalAlpha = 0.88 * this.red; g.fillStyle = C.paper; g.fillRect(x0 - 10 * d, y0 - 8 * d, Math.max(p.hpMax * 11, s.resMax * 20) * u + 14 * d, 58 * u); g.globalAlpha = 1; }
    // health: short upright brush strokes
    for (let i = 0; i < p.hpMax; i++) {
      const x = x0 + i * 11 * u, on = i < p.hp;
      g.globalAlpha = on ? 0.9 : 0.22; ribbon(g, [x, y0 + 18 * u, x + 1 * u, y0 + 8 * u, x - 0.5 * u, y0], (q) => (on ? 4.4 : 3) * u * (1 - q * 0.6), INK, on ? 0.92 : 0.3, 0);
    }
    // resolve: ensō rings, filled with the accent when ready
    for (let i = 0; i < s.resMax; i++) {
      const cx = x0 + 6 * u + i * 20 * u, cy = y0 + 36 * u, on = i < p.res, r = 7 * u;
      if (on) { g.globalAlpha = 0.55; g.fillStyle = acc; g.beginPath(); g.arc(cx, cy, r * 0.75, 0, 6.3); g.fill(); }
      g.globalAlpha = on ? 0.9 : 0.3; g.strokeStyle = INK; g.lineWidth = (on ? 2.2 : 1.4) * u; g.lineCap = 'round';
      g.beginPath(); g.arc(cx, cy, r, -1.2 + i, -1.2 + i + 5.6); g.stroke();
    }
    if (p.resF > 0 && p.res < s.resMax) { const cx = x0 + 6 * u + p.res * 20 * u, cy = y0 + 36 * u; g.globalAlpha = 0.6; g.strokeStyle = acc; g.lineWidth = 2.4 * u; g.beginPath(); g.arc(cx, cy, 7 * u, -Math.PI / 2, -Math.PI / 2 + p.resF * 6.28); g.stroke(); }
    g.globalAlpha = 1;
    // boss: name card then a long brush bar
    const boss = s.foes.find((f) => f.boss && f.st !== 'dead') || (s.arena && s.arena.boss ? s.foes.find((f) => f.boss) : null);
    if (boss && s.arena && s.arena.boss) {
      const B = BOSSES[boss.boss], bw = Math.min(W * 0.5, 460 * d), bx = (W - bw) / 2, by = top + 30 * d;
      const intro = this.bossCard ? this.time - this.bossCard.t0 : 9;
      if (intro < 3.6) { const a = clamp(intro / 0.6, 0, 1) * clamp((3.6 - intro) / 0.6, 0, 1); g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.fillStyle = INK; g.font = `700 ${Math.round(H * 0.07)}px ${JP}`; g.shadowColor = rgba(C.paper, 0.9); g.shadowBlur = 12 * d; g.fillText(B.jp, W / 2, H * 0.36); g.font = `italic ${Math.round(Math.max(13 * d, H * 0.026))}px ${SERIF}`; g.fillText(B.name, W / 2, H * 0.36 + H * 0.06); g.restore(); }
      g.save(); g.globalAlpha = 0.25; ribbon(g, [bx, by, bx + bw / 2, by - 1 * d, bx + bw, by], () => 5 * d, INK, 0.25, 0);
      const fr = clamp(boss.hp / boss.hpMax, 0, 1); g.globalAlpha = 1;
      if (fr > 0) ribbon(g, [bx, by, bx + bw * fr * 0.5, by - 1 * d, bx + bw * fr, by + 0.5 * d], (q) => (6 - q * 1.5) * d, INK, 0.88, 0.3);
      g.textAlign = 'center'; g.fillStyle = INK; g.globalAlpha = 0.9; g.font = `700 ${Math.round(13 * d)}px ${JP}`; g.fillText(B.jp, W / 2, by - 10 * d);
      g.restore();
    }
    // context prompt and teaching hints: ink on a paper plate, never over a busy patch without one
    const lab = ui.labels || {};
    if (s.near && s.phase === 'play') {
      const e = s.ev[s.near.ev], ex = e.t === 'fox' ? e.path[e.path.length - 1] : e.x;
      const sx = this.worldToScreenX(ex), sy = this.worldToScreenY(-groundH(this.ch, ex) - 92);
      const verb = { bow: 'Bow', sit: 'Sit', take: 'Take the charm' }[s.near.kind];
      this.plate(g, sx, sy, (lab.interact || 'E'), verb);
    }
    if (s.hint && s.phase !== 'dead') {
      const H2 = HINT[s.hint.id]; if (H2) { const a = clamp(s.hint.t / 0.3, 0, 1) * clamp((4.5 - s.hint.t) / 0.6, 0, 1); g.globalAlpha = a; this.plate(g, W / 2, (this.lb > 0.1 ? H * 0.1 * this.lb : 0) + H * 0.2, H2.keys.map((k) => lab[k] || k).join(' / '), H2.text); g.globalAlpha = 1; }
    }
    if (s.phase === 'standoff' && s.so) {
      const so = s.so; let txt = null;
      if (so.st === 'ready') txt = ['focus', 'Hold to face him'];
      else if (so.st === 'hold' || so.st === 'strike') txt = ['focus', 'Release when he draws'];
      if (txt && s.ch < 2 && !(s.hint && s.hint.t < 4.5)) { g.globalAlpha = 0.85; this.plate(g, W / 2, H - H * 0.1 * this.lb - 34 * d, lab[txt[0]] || 'F', txt[1]); g.globalAlpha = 1; }
    }
  }
  worldToScreenX(x) { const v = this.v; return v.W / 2 + (x - v.camX) * v.k * v.zoom; }
  worldToScreenY(y) { const v = this.v; return v.cy + (y - v.camY + 100) * v.k * v.zoom; }
  plate(g, x, y, key, text) {
    const d = this.dpr, fs = Math.round(15 * d), C = CHAPTERS[this.ch];
    g.save(); g.font = `${fs}px ${SERIF}`; const tw = g.measureText(text).width; g.font = `700 ${Math.round(12 * d)}px ${SERIF}`; const kw = Math.max(g.measureText(key).width + 12 * d, 22 * d);
    const w = tw + kw + 26 * d, h = 30 * d, x0 = Math.round(clamp(x - w / 2, 8 * d, this.v.W - w - 8 * d)), y0 = Math.round(y - h / 2);
    const ga = g.globalAlpha;
    g.globalAlpha = ga * 0.92; g.fillStyle = C.paper; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, w, h, 3 * d) : g.rect(x0, y0, w, h); g.fill();
    g.globalAlpha = ga * 0.6; g.strokeStyle = INK; g.lineWidth = 1 * d; g.stroke();
    g.globalAlpha = ga; g.fillStyle = INK; g.fillRect(x0 + 7 * d, y0 + 6 * d, kw, h - 12 * d);
    g.fillStyle = C.paper; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(key, x0 + 7 * d + kw / 2, y0 + h / 2 + 0.5 * d);
    g.fillStyle = INK; g.font = `${fs}px ${SERIF}`; g.textAlign = 'left'; g.fillText(text, x0 + kw + 15 * d, y0 + h / 2 + 0.5 * d);
    g.restore();
  }
}

const HINT = {
  parry: { keys: ['parry'], text: 'Parry on the glint' }, dodge: { keys: ['dodge'], text: 'Red glint: dodge, it cannot be blocked' },
  riposte: { keys: ['slash'], text: 'He is open. Strike now' }, heavy: { keys: ['heavy'], text: 'A heavy cut breaks a guard' },
  focus: { keys: ['focus'], text: 'Hold to face him. Release when he draws' }, wind: { keys: ['wind'], text: 'Ask the wind the way' },
  bow: { keys: ['interact'], text: 'Bow at the shrine to rest' }, jump: { keys: ['up'], text: 'Jump a low sweep' },
};

export function drawSeal(g, x, y, s, paper) {
  g.save(); g.translate(x, y); g.rotate(-0.04);
  g.fillStyle = RED; g.globalAlpha = 0.9 * (g.globalAlpha || 1);
  g.beginPath(); g.rect(-s / 2, 0, s, s); g.fill();
  // worn edges and uneven pressure
  g.fillStyle = paper; for (let i = 0; i < 18; i++) { const a = (i * 2.399) % 6.28, r = s * 0.5; g.globalAlpha = 0.5; g.beginPath(); g.arc(Math.cos(a) * r * 0.98, s / 2 + Math.sin(a) * r * 0.98, s * 0.03 + (i % 3) * s * 0.012, 0, 6.3); g.fill(); }
  g.globalAlpha = 0.95; g.font = `700 ${Math.round(s * 0.78)}px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = paper; g.fillText('風', 0, s * 0.53);
  g.restore();
}

// ---------- sprites and props ----------
function buildSprites(ch, scale) {
  const C = CHAPTERS[ch], key = C.key, acc = C.accent, R = rng(500 + ch);
  const mkS = (w, h, ax, ay, fn) => { const c = makeCanvas(w * scale, h * scale), g = c.getContext('2d'); g.setTransform(scale, 0, 0, scale, ax * scale, ay * scale); fn(g); return { c, w, h, ax, ay }; };
  const S = { bamboo: [], bambooF: [], torii: [], hidden: [], branch: [] };
  if (key === 'bamboo') {
    for (let i = 0; i < 6; i++) { const h = 420 + R() * 120, w = 6 + R() * 3, sd = Math.floor(R() * 1e9); S.bamboo.push(mkS(200, h + 40, 100, h + 20, (g) => bamboo(g, rng(sd), 0, 0, h, w, { a: 0.85, wash: acc, leaves: 1.2 }))); }
    for (let i = 0; i < 3; i++) { const h = 760, w = 16 + R() * 6, sd = Math.floor(R() * 1e9); S.bambooF.push(mkS(300, h + 40, 150, h + 20, (g) => bamboo(g, rng(sd), 0, 0, h, w, { a: 0.95, wash: acc, leaves: 1.4, leafScale: 1.3 }))); }
  }
  if (key === 'torii') { for (let i = 0; i < 3; i++) { const sd = Math.floor(R() * 1e9); S.torii.push(mkS(150, 190, 75, 180, (g) => torii(g, rng(sd), 0, 0, 170, 120, { red: acc, a: 0.92 }))); } for (let i = 0; i < 2; i++) { const sd = Math.floor(R() * 1e9); S.bambooF.push(mkS(140, 760, 70, 740, (g) => { const r = rng(sd); stroke(g, [[0, 0, 1], [3, -360, 0.95], [0, -720, 0.9]], { w: 26, alpha: 0.9, dry: 0.5, seed: sd, taper: [0, 0], tip: 1 }); for (let k = 0; k < 8; k++) stroke(g, [[-10 + r() * 20, -r() * 700, 0.5], [-8 + r() * 16, -r() * 700, 0.3]], { w: 2, alpha: 0.4, dry: 0.8, seed: sd + k }); })); } }
  if (key === 'snow') for (let i = 0; i < 2; i++) { const sd = Math.floor(R() * 1e9); S.bambooF.push(mkS(260, 600, 130, 580, (g) => { const r = rng(sd); pine(g, r, 0, 0, 560, { a: 0.92, ink: '#121317' }); })); }
  if (key === 'castle' || key === 'terraces') for (let i = 0; i < 2; i++) { const sd = Math.floor(R() * 1e9); S.branch.push(mkS(520, 260, 0, 0, (g) => {
    const r = rng(sd); stroke(g, [[0, 30, 1], [160, 60, 0.8], [330, 110, 0.5], [480, 190, 0.2]], { w: 14, alpha: 0.92, dry: 0.55, seed: sd, taper: [0, 0.6] });
    for (let k = 0; k < 7; k++) { const x0 = 60 + r() * 380, y0 = 40 + (x0 / 480) * 140; stroke(g, [[x0, y0, 0.6], [x0 + 30 + r() * 40, y0 + 30 + r() * 40, 0.2]], { w: 4, alpha: 0.85, dry: 0.6, seed: sd + k });
      if (key === 'castle') for (let m = 0; m < 12; m++) drop(g, x0 + 30 + r() * 50 - 10, y0 + 20 + r() * 50 - 10, 2 + r() * 4, acc, 0.45 + r() * 0.3); else for (let m = 0; m < 6; m++) leaf(g, x0 + 30, y0 + 30, 0.5 + r() * 2, 16 + r() * 10, 3, INK, 0.8); }
  })); }
  S.hidden.push(mkS(80, 80, 40, 70, (g) => { const r = rng(77 + ch); rock(g, r, 0, 2, 40, 34, { a: 0.85 }); g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-18, -22); g.quadraticCurveTo(0, -15, 18, -22); g.stroke(); for (const sx of [-8, 0, 8]) { g.lineWidth = 0.9; g.beginPath(); g.moveTo(sx, -19); g.lineTo(sx + 2, -13); g.lineTo(sx - 1, -10); g.lineTo(sx + 2, -6); g.stroke(); } g.globalAlpha = 0.55; g.fillStyle = acc; g.beginPath(); g.arc(0, -40, 4, 0, 6.3); g.fill(); }));
  return S;
}
function buildProps(ch) {
  const C = CHAPTERS[ch], key = C.key, L = C.len, R = rng(900 + ch), acc = C.accent;
  const back = [], front = [], grass = [], ground = [];
  const sp = (set, x, f, a, o = {}) => Object.assign({ kind: 'spr', set, i: Math.floor(R() * 99), x, f, a, seed: R(), flex: 0.05 }, o);
  if (key === 'bamboo') {
    // groves of two to five stalks with open paper between them
    for (let x = -200; x < L + 400; x += 380 + R() * 520) { const n = 2 + Math.floor(R() * 4); for (let i = 0; i < n; i++) back.push(sp('bamboo', x + i * (22 + R() * 30), 0.9, 0.55 + R() * 0.4, { dy: 6, flex: 0.06 })); }
    for (let x = 300; x < L + 400; x += 600 + R() * 700) front.push(sp('bambooF', x * 1.28, 1.28, 0.95, { dy: 120, flex: 0.03 }));
  }
  if (key === 'torii') {
    // the thousand gates: long runs of torii right behind the path
    for (let x = 300; x < L; x += 0) { const run = 300 + R() * 500; for (let xx = x; xx < Math.min(L, x + run); xx += 46 + R() * 22) back.push(sp('torii', xx, 1, 0.8 + R() * 0.15, { dy: 3, flex: 0, sc: 0.9 + R() * 0.15 })); x += run + 260 + R() * 420; }
  }
  if (key === 'snow') { for (let x = 300; x < L; x += 0) { ground.push({ kind: 'lantern', x, f: 1, seed: R() }); x += 380 + R() * 160; } for (let x = 600; x < L + 400; x += 900 + R() * 700) front.push(sp('bambooF', x * 1.3, 1.3, 0.9, { dy: 160, flex: 0.02 })); }
  // lanterns must match the static posts in the ground band: same RNG sequence there, so place by the same rule
  if (key === 'castle' || key === 'terraces') for (let x = 400; x < L + 400; x += 900 + R() * 800) front.push(sp('branch', x * 1.25, 1.25, 0.92, { base: -560, flex: 0.02 }));
  // grass and rice in front of the feet (short) and behind (taller)
  if (key === 'bamboo' || key === 'terraces') for (let x = 0; x < L; x += 26 + R() * 40) {
    const isRice = key === 'terraces';
    grass.push({ kind: 'grass', x, f: 1, n: 5 + Math.floor(R() * 4), h: isRice ? 9 + R() * 7 : 7 + R() * 9, a: 0.75, seed: R(), flex: 0.08, dy: 2 });
    if (isRice && R() < 0.8) back.push({ kind: 'grass', x: x + 10, f: 0.97, n: 8, h: 26 + R() * 14, a: 0.55, seed: R(), flex: 0.12, dy: -14, head: acc });
  }
  if (key === 'castle') for (let x = 0; x < C.bridge[0]; x += 40 + R() * 50) grass.push({ kind: 'grass', x, f: 1, n: 5, h: 8 + R() * 8, a: 0.7, seed: R(), flex: 0.08, dy: 2 });
  return { back, front, grass, ground };
}
