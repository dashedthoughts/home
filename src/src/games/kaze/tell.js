// KAZE the standoff tell, in black ink. When to release must be impossible to miss and beautiful:
//  tell     : the world drains toward monochrome, a black drop falls from the top of the frame onto the opponent's hilt,
//             thin black tendrils creep along the ground from the frame edges toward the two duellists;
//  window   : the drop SPLASHES, a hard black ring snaps outward across the ground from him, the tendrils recoil and
//             one beat of bare paper flashes behind the duellists (not over them);
//  missed   : if the window closes untaken the ink floods back in from the edges;
//  feint    : a smaller grey drop falls, wobbles on the hilt and evaporates without a splash;
//  waiting  : a slow heartbeat of ink at the frame edges.
// Reads the sim's `drawtell` / `drawwin` / `feinttell` cues when present; otherwise derives the same beats from the
// standoff state (strikeAt, `sofeint`, `sodraw`, `sofail`). Reduced motion keeps the drop and the ring, no flash or drain.
import { clamp, makeCanvas, rgba } from './brush.js';
import { CHAPTERS, groundH } from './data.js';

const INKW = '#1d1813';
function dropSprite(grey) {
  const c = makeCanvas(24, 40), g = c.getContext('2d'), col = grey ? '#6c6760' : INKW;
  const rg = g.createRadialGradient(12, 27, 1, 12, 27, 11); rg.addColorStop(0, rgba(col, 1)); rg.addColorStop(0.8, rgba(col, 0.95)); rg.addColorStop(1, rgba(col, 0));
  g.fillStyle = rg; g.beginPath(); g.moveTo(12, 2); g.bezierCurveTo(14, 12, 22, 20, 21, 28); g.bezierCurveTo(20, 35, 4, 35, 3, 28); g.bezierCurveTo(2, 20, 10, 12, 12, 2); g.fill();
  g.globalAlpha = 0.35; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(9, 25, 2, 3.5, -0.3, 0, 6.2832); g.fill(); // a wet glint
  return c;
}

export class Tell {
  constructor() { this.st = 'idle'; this.t = 0; this.usingCues = false; this.ring = { t: 9 }; this.flash = 0; this.flood = 0; this.ten = 0; this.drain = 0; this.beat = 0; this.D = null; this.G = null; this.lastFeint = -9; }
  pre(s, r, fx) {
    const so = s.so, ch = r.ch;
    const opp = () => so ? [so.oppX - 14, -groundH(ch, so.oppX) - 66] : [s.p.x, -groundH(ch, s.p.x) - 66];
    const taken = s.cues.some((c) => c.k === 'socut');
    for (const c of s.cues) {
      const k = c.k;
      if (k === 'drawtell' || k === 'drawwin' || k === 'feinttell') this.usingCues = true;
      if (k === 'drawtell') this.begin('tell', opp(), c.lead || 0.42);
      else if (k === 'feinttell' || (!this.usingCues && k === 'sofeint')) this.begin('feint', opp(), 0.7);
      else if ((k === 'drawwin' && c.open) || (!this.usingCues && k === 'sodraw')) this.open(opp(), r, fx);
      else if ((k === 'drawwin' && !c.open && !taken) || (!this.usingCues && k === 'sofail' && c.late)) { this.st = 'flood'; this.t = 0; this.flood = 1; }
      else if (k === 'socut' || k === 'chapter' || k === 'respawn' || (k === 'sofail' && !c.late)) { if (this.st !== 'flood') this.st = 'idle'; }
    }
    // without the sim's own tell cue, the tell is the last 0.42 s before the strike
    if (!this.usingCues && so && so.st === 'hold' && so.strikeAt && this.st !== 'tell' && so.strikeAt - so.t < 0.42 && so.strikeAt - so.t > 0.05 && this.tellFor !== so.strikeAt) { this.tellFor = so.strikeAt; this.begin('tell', opp(), so.strikeAt - so.t); }
    this.active = !!so && (so.st === 'ready' || so.st === 'hold' || so.st === 'strike');
  }
  begin(kind, at, dur) { this.st = kind; this.t = 0; this.dur = Math.max(0.2, dur); this.at = at; }
  open(at, r, fx) {
    this.st = 'win'; this.t = 0; this.at = at; this.ring = { t: 0, x: at[0] + 14, y: at[1] + 66 };
    this.flash = r.reduced ? 0 : 2; // frames of bare paper behind the duellists
    if (fx) fx.burst(at[0], at[1] + 4, -1, 0.9, r.reduced); // the drop splashes on the hilt
  }
  // behind the figures (world transform set): the paper flash and the ring across the ground
  ground(g, s, dt, r) {
    if (this.flash > 0) { this.flash--; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.94; g.fillStyle = CHAPTERS[r.ch].paper; g.fillRect(0, 0, r.v.W, r.v.H); g.restore(); }
    const R = this.ring;
    if (R.t < 0.5) {
      R.t += dt; const u = Math.min(1, R.t / 0.5), e = 1 - Math.pow(1 - u, 3), rad = 18 + e * 430;
      g.strokeStyle = INKW; g.globalAlpha = 0.95 * (1 - u); g.lineWidth = 4.5 * (1 - u) + 0.8;
      g.beginPath(); g.ellipse(R.x, R.y, rad, rad * 0.16, 0, 0, 6.2832); g.stroke();
      g.globalAlpha = 0.35 * (1 - u); g.lineWidth = 1.2; g.beginPath(); g.ellipse(R.x, R.y, rad * 0.82, rad * 0.13, 0, 0, 6.2832); g.stroke();
      g.globalAlpha = 1;
    }
  }
  // over the figures: the falling drop (it lands on the hilt, so it never crosses a face)
  air(g, s, dt, r) {
    if (this.st !== 'tell' && this.st !== 'feint') return;
    if (!this.D) { this.D = dropSprite(false); this.G = dropSprite(true); }
    this.t += dt; const grey = this.st === 'feint';
    const fall = grey ? 0.42 : this.dur, u = Math.min(1, this.t / fall), [hx, hy] = this.at;
    const top = r.v.camY - 100 - r.v.cy / (r.v.k * r.v.zoom) - 20; // the top of the frame, in world units
    let x = hx, y = top + (hy - top) * u * u, sc = grey ? 0.7 : 1, a = 1;
    if (u >= 1) {
      if (grey) { const w = this.t - fall; y = hy; sc = 0.7 * (1 + Math.sin(w * 26) * 0.12 * Math.max(0, 1 - w * 3)) * Math.max(0, 1 - w / 0.3); a = Math.max(0, 1 - w / 0.3); if (w > 0.3) { this.st = 'idle'; return; } } // wobble and evaporate
      else { y = hy - 2; sc = 1 + Math.min(0.25, (this.t - fall) * 0.8); } // a drop welling on the hilt, waiting
    }
    const S = grey ? this.G : this.D, w = 15 * sc, h = 25 * sc * (u < 1 ? 1.3 : 1);
    if (u < 1 && u > 0.05) { g.strokeStyle = grey ? '#6c6760' : INKW; g.lineCap = 'round'; g.globalAlpha = 0.35 * a; g.lineWidth = 2.2 * sc; g.beginPath(); g.moveTo(x, y - h * 0.8); g.lineTo(x, y - h * 0.8 - 46 * u); g.stroke(); } // the streak of its fall
    g.globalAlpha = a; g.drawImage(S, x - w / 2, y - h * 0.82, w, h); g.globalAlpha = 1;
  }
  // the frame: drain, tendrils along the ground, the heartbeat and the flood
  screen(g, s, dt, r, wash) {
    const { W, H } = r.v, red = r.reduced, so = s.so;
    const tgtTen = this.st === 'tell' ? clamp(this.t / (this.dur || 0.42), 0, 1) : this.st === 'flood' ? 1.5 : 0;
    this.ten += (tgtTen - this.ten) * Math.min(1, dt * (tgtTen > this.ten ? 7 : 14)); // recoil fast
    const dT = this.st === 'tell' && !red ? 1 : 0; this.drain += (dT - this.drain) * Math.min(1, dt * (dT ? 6 : 3));
    if (this.st === 'win') { this.t += dt; if (this.t > 0.6) this.st = 'idle'; }
    if (this.st === 'flood') { this.t += dt; this.flood = Math.max(0, 1 - this.t / 1.6); if (this.t > 1.6) this.st = 'idle'; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (this.drain > 0.01) { g.globalCompositeOperation = 'saturation'; g.globalAlpha = this.drain * 0.75; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    // heartbeat while he waits to draw: two soft beats of ink at the edges, then a rest
    if (wash && this.active && !red) {
      this.beat += dt; const ph = this.beat % 1.15, b = Math.exp(-Math.pow((ph - 0.08) / 0.06, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.3) / 0.07, 2));
      const a = (0.1 + 0.12 * b) * (1 + this.drain * 0.6);
      g.globalAlpha = a; const sc = 1.04 - b * 0.02, w = W * sc, h = H * sc; g.drawImage(wash, (W - w) / 2, (H - h) / 2, w, h); g.globalAlpha = 1;
    }
    if (this.st === 'flood' && wash && !red) { g.globalAlpha = 0.55 * this.flood; g.drawImage(wash, 0, 0, W, H); g.globalAlpha = 1; }
    // tendrils creeping along the ground from both edges toward the duellists
    if (this.ten > 0.02 && so && !red) {
      const gyS = r.worldToScreenY(-groundH(r.ch, so.oppX)), L = W * 0.36 * Math.min(1.4, this.ten), t = r.time;
      g.strokeStyle = INKW; g.lineCap = 'round';
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x0 = side < 0 ? -10 : W + 10, y0 = gyS - (8 + i * 17) * r.v.k, len = L * (1 - i * 0.2), seg = 9;
        let px = x0, py = y0;
        for (let k = 1; k <= seg; k++) {
          const u = k / seg, x = x0 - side * len * u, y = y0 + Math.sin(u * 5 + t * 3 + i * 2) * 5 * r.v.k * u - u * u * 10 * r.v.k;
          g.globalAlpha = 0.92 * Math.min(1, this.ten); g.lineWidth = Math.max(0.7, (6.5 - i * 1.6) * (1 - u * 0.88) * r.v.k);
          g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); px = x; py = y;
        }
      }
      g.globalAlpha = 1;
    }
  }
}
