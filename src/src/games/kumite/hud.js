// NEON KUMITE · HUD, drawn on the canvas in screen space so it stays in lock-step with the sim.
import { FIGHTERS } from './data.js';
const JP = '"Noto Sans JP", sans-serif';

function bar(ctx, x, y, w, h, frac, trail, col, flip) {
  // slanted bar: outer edge anchored, damage eats from the centre side
  const sl = h * 0.6;
  const path = (x0, x1) => { ctx.beginPath(); if (!flip) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 - sl, y + h); ctx.lineTo(x0, y + h); } else { ctx.moveTo(x1, y); ctx.lineTo(x0, y); ctx.lineTo(x0 + sl, y + h); ctx.lineTo(x1, y + h); } ctx.closePath(); };
  path(x, x + w); ctx.fillStyle = 'rgba(10,8,16,0.85)'; ctx.fill();
  const seg = (f) => (flip ? [x + w * (1 - f), x + w] : [x, x + w * f]);
  ctx.save(); path(x, x + w); ctx.clip();
  if (trail > frac) { const [a, b] = seg(trail); ctx.fillStyle = '#ff2a4f'; ctx.fillRect(a, y, b - a, h); }
  const [a, b] = seg(frac);
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, frac < 0.25 ? '#ff5a5a' : '#fff6a8'); g.addColorStop(0.5, frac < 0.25 ? '#ff2a2a' : '#fcee0a'); g.addColorStop(1, frac < 0.25 ? '#b3122a' : '#d8a800');
  ctx.fillStyle = g; ctx.fillRect(a, y, b - a, h);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(a, y + 2, b - a, Math.max(1, h * 0.18));
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 1; k < 10; k++) ctx.fillRect(x + (w * k) / 10, y, 1, h);
  ctx.restore();
  path(x, x + w); ctx.strokeStyle = '#0b0b10'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
}
function meter(ctx, x, y, w, h, v, col, flip, t) {
  const frac = Math.max(0, Math.min(1, v / 1000));
  ctx.save();
  ctx.fillStyle = 'rgba(10,8,16,0.85)'; ctx.fillRect(x, y, w, h);
  const fx = flip ? x + w * (1 - frac) : x;
  const full = frac >= 0.999, half = frac >= 0.5;
  ctx.fillStyle = full ? (Math.sin(t * 10) > 0 ? '#ffffff' : col) : col; ctx.globalAlpha = full ? 1 : 0.85; ctx.fillRect(fx, y, w * frac, h); ctx.globalAlpha = 1;
  ctx.fillStyle = '#0b0b10'; ctx.fillRect(x + w / 2 - 1, y, 2, h);
  ctx.strokeStyle = '#0b0b10'; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  const fs = Math.max(12, h * 1.3);
  ctx.font = `700 ${fs}px Rajdhani, sans-serif`; ctx.textBaseline = 'bottom'; ctx.textAlign = flip ? 'right' : 'left';
  const label = full ? 'SUPER  L+H+S' : half ? 'EX  S+H' : 'METER';
  ctx.lineWidth = 3; ctx.strokeStyle = '#0b0b10'; ctx.strokeText(label, flip ? x + w : x, y - 2); ctx.fillStyle = full ? '#fcee0a' : half ? '#ffffff' : '#a29fb8'; ctx.fillText(label, flip ? x + w : x, y - 2);
  ctx.restore();
}

export function drawHud(ctx, S, R, opts) {
  const W = R.W, H = R.H; const t = R.t;
  if (opts.noHud) return;
  const narrow = W < 560;
  const pad = narrow ? 10 : Math.max(14, W * 0.025);
  const bh = narrow ? 13 : Math.max(14, Math.min(22, H * 0.034));
  const tw = narrow ? 44 : Math.max(52, W * 0.06);
  const bw = (W - pad * 2 - tw - 12) / 2;
  const by = narrow ? 10 : Math.max(12, H * 0.035);
  S.f.forEach((f, i) => {
    const ch = FIGHTERS[f.id]; const fr = R.fr[i]; const flip = i === 1;
    const x = flip ? W - pad - bw : pad;
    bar(ctx, x, by, bw, bh, Math.max(0, fr.hpShown), fr.hpTrail, ch.color, flip);
    // name plate
    const ns = narrow ? 13 : Math.max(14, bh * 0.95);
    ctx.save(); ctx.textBaseline = 'top'; ctx.textAlign = flip ? 'right' : 'left'; ctx.lineJoin = 'round';
    const nx = flip ? x + bw : x;
    ctx.font = `700 ${ns}px Rajdhani, sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = '#0b0b10';
    const label = (opts.tags && opts.tags[i] ? opts.tags[i] + '  ' : '') + ch.name;
    ctx.strokeText(label, nx, by + bh + 4); ctx.fillStyle = '#f5f2ea'; ctx.fillText(label, nx, by + bh + 4);
    const lw = ctx.measureText(label).width;
    ctx.font = `700 ${ns * 0.78}px ${JP}`; ctx.fillStyle = ch.color; ctx.strokeText(ch.jp, flip ? nx - lw - 8 : nx + lw + 8, by + bh + 6); ctx.fillText(ch.jp, flip ? nx - lw - 8 : nx + lw + 8, by + bh + 6);
    // round pips
    if (!S.training) for (let k = 0; k < 2; k++) {
      const px = flip ? x + bw * 0.08 + k * (bh + 4) : x + bw * 0.92 - k * (bh + 4); const py = by + bh + 6 + ns * 0.5;
      ctx.beginPath(); ctx.moveTo(px, py - bh * 0.42); ctx.lineTo(px + bh * 0.42, py); ctx.lineTo(px, py + bh * 0.42); ctx.lineTo(px - bh * 0.42, py); ctx.closePath();
      ctx.fillStyle = f.wins > k ? ch.color : 'rgba(10,8,16,0.8)'; ctx.fill(); ctx.strokeStyle = '#0b0b10'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
    // super meter: bottom corners in landscape, under the name in portrait
    const mw = narrow ? bw * 0.8 : Math.min(bw * 0.55, 240); const mh = narrow ? 7 : Math.max(8, bh * 0.5);
    const top = R.portrait || (R.touch && H < 560); // with touch controls the bottom corners belong to the thumbs
    const my = top ? by + bh + ns + 26 : H - pad - mh - 2;
    meter(ctx, flip ? W - pad - mw : pad, my, mw, mh, fr.meterShown, ch.color, flip, t);
  });
  // timer
  ctx.save();
  const cx = W / 2, cy = by + bh * 0.9;
  ctx.beginPath(); const r = tw * 0.52; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.86); } ctx.closePath();
  ctx.fillStyle = 'rgba(10,8,16,0.9)'; ctx.fill(); ctx.strokeStyle = '#0b0b10'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = 'rgba(0,240,255,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  const secs = S.timer < 0 ? '∞' : String(Math.max(0, Math.ceil(S.timer / 60)));
  ctx.font = `700 ${tw * 0.58}px Rajdhani, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = S.timer >= 0 && S.timer < 600 && Math.sin(t * 8) > 0 ? '#ff4d6d' : '#f5f2ea'; ctx.fillText(secs, cx, cy + 1);
  ctx.restore();
  // combo counters
  for (let i = 0; i < 2; i++) {
    const c = R.combo[i]; if (!c || S.phase === 'match') continue;
    const left = i === 0; const k = c.t;
    const x = left ? pad + 4 : W - pad - 4; const y = H * (R.portrait ? 0.24 : 0.3);
    const sz = Math.min(H * 0.09, narrow ? 34 : 56) * (k < 4 ? 1.25 - k * 0.06 : 1);
    ctx.save(); ctx.globalAlpha = c.done && k > 50 ? Math.max(0, 1 - (k - 50) / 20) : 1;
    ctx.textAlign = left ? 'left' : 'right'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.font = `400 ${sz}px Bangers, Rajdhani, sans-serif`; ctx.lineWidth = sz * 0.14; ctx.strokeStyle = '#0b0b10';
    const s1 = c.hits + ' HITS'; ctx.strokeText(s1, x, y); ctx.fillStyle = '#fcee0a'; ctx.fillText(s1, x, y);
    ctx.font = `700 ${sz * 0.36}px Rajdhani, sans-serif`; ctx.lineWidth = 3; const s2 = c.dmg + ' DAMAGE'; ctx.strokeText(s2, x, y + sz * 0.42); ctx.fillStyle = '#f5f2ea'; ctx.fillText(s2, x, y + sz * 0.42);
    ctx.restore();
  }
  // side callouts (COUNTER)
  for (const p of R.texts) {
    if (p.kind !== 'side') continue; const left = p.p === 0; const k = p.t / p.life;
    ctx.save(); ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; const sz = Math.min(H * 0.05, 30);
    ctx.font = `400 ${sz}px Bangers, Rajdhani, sans-serif`; ctx.textAlign = left ? 'left' : 'right'; ctx.lineWidth = sz * 0.16; ctx.strokeStyle = '#0b0b10'; ctx.lineJoin = 'round';
    const x = left ? pad + 4 : W - pad - 4, y = H * (R.portrait ? 0.2 : 0.22); ctx.strokeText(p.s, x, y); ctx.fillStyle = '#ff3b5c'; ctx.fillText(p.s, x, y); ctx.restore();
  }
  // announcer
  if (R.ann) {
    const a = R.ann; const k = a.t; const sz = Math.min(W * (narrow ? 0.14 : 0.11), H * 0.2);
    const pop = k < 6 ? 1.6 - (k / 6) * 0.6 : 1; const alpha = k > a.life - 10 ? (a.life - k) / 10 : 1;
    ctx.save(); ctx.translate(W / 2, H * (R.portrait ? 0.34 : 0.42)); ctx.scale(pop, pop); ctx.globalAlpha = Math.max(0, alpha);
    if (!R.reduced) ctx.rotate(-0.06);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const font = /^[A-Z0-9 .]+$/.test(a.s) ? `400 ${sz}px NEMESYS, Bangers, Rajdhani, sans-serif` : `400 ${sz}px Bangers, Rajdhani, sans-serif`;
    ctx.font = font;
    const tw2 = ctx.measureText(a.s).width;
    ctx.fillStyle = 'rgba(11,11,16,0.75)'; ctx.beginPath(); ctx.moveTo(-tw2 / 2 - sz * 0.5, -sz * 0.55); ctx.lineTo(tw2 / 2 + sz * 0.7, -sz * 0.7); ctx.lineTo(tw2 / 2 + sz * 0.5, sz * 0.6); ctx.lineTo(-tw2 / 2 - sz * 0.7, sz * 0.7); ctx.closePath(); ctx.fill();
    ctx.lineWidth = sz * 0.12; ctx.strokeStyle = '#0b0b10'; ctx.strokeText(a.s, 0, 0);
    ctx.fillStyle = a.s === 'FIGHT' ? '#fcee0a' : a.s.includes('K.O') ? '#ff3b5c' : a.s === 'PERFECT' ? '#00f0ff' : '#f5f2ea';
    ctx.fillText(a.s, 0, 0);
    ctx.restore();
  }
  // K.O. splash (stays through the slow-motion)
  if (R.koT > 0 && R.koT < 120) {
    const k = R.koT; const sz = Math.min(W * 0.2, H * 0.3) * (k < 8 ? 2 - k / 8 : 1);
    ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.rotate(R.reduced ? 0 : -0.08); ctx.globalAlpha = k > 100 ? (120 - k) / 20 : 1;
    ctx.font = `400 ${sz}px Bangers, Rajdhani, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = sz * 0.16; ctx.strokeStyle = '#0b0b10'; ctx.strokeText('K.O.', 0, 0); ctx.fillStyle = '#ff3b5c'; ctx.fillText('K.O.', 0, 0);
    ctx.lineWidth = sz * 0.035; ctx.strokeStyle = '#fcee0a'; ctx.strokeText('K.O.', 0, 0);
    ctx.restore();
  }
  // training readout
  if (R.training) {
    const T = R.training; const lines = [`DAMAGE  ${T.dmg}`, `COMBO  ${T.combo} HITS  ${T.comboDmg}`, `ADVANTAGE  ${T.adv == null ? '-' : (T.adv > 0 ? '+' : '') + T.adv}`, `STARTUP  ${T.startup == null ? '-' : T.startup}`, `DUMMY  ${T.dummy}`];
    const fs = narrow ? 11 : 13; const x = pad, y = R.portrait ? by + bh + 70 : by + bh + 46;
    ctx.save(); ctx.fillStyle = 'rgba(10,8,16,0.78)'; ctx.fillRect(x - 4, y - 4, fs * 13, lines.length * (fs + 5) + 8);
    ctx.font = `400 ${fs}px "Share Tech Mono", monospace`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    lines.forEach((l, k) => { ctx.fillStyle = k === 2 ? (T.adv > 0 ? '#b8ff2e' : T.adv < 0 ? '#ff4d6d' : '#f5f2ea') : '#f5f2ea'; ctx.fillText(l, x + 4, y + k * (fs + 5)); });
    ctx.restore();
  }
}
