// KAZE audio: WebAudio synthesis only. A wind bed that follows the wind field, a breathy flute (sine + filtered
// breath noise with pitch bends) playing sparse phrases on the in scale, Karplus-Strong koto plucks, taiko,
// inharmonic sword rings, footsteps per ground. Quiet by design; near silence in standoffs.
import { CHAPTERS } from './data.js';
const SCALE = [293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25, 783.99]; // D Eb G A Bb D Eb G (in scale)
export class Audio {
  constructor() { this.ctx = null; this.on = false; this.vol = { volume: 0.7, music: 0.8, sfx: 0.9, muted: false }; this.nextPhrase = 4; this.drumT = 0; this.ks = new Map(); this.duck = 1; this.t = 0; }
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended' && !this.paused) this.ctx.resume().catch(() => {}); return; }
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext); if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -18; this.comp.ratio.value = 3;
    this.master.connect(this.comp); this.comp.connect(c.destination);
    this.music = c.createGain(); this.sfx = c.createGain(); this.amb = c.createGain(); this.music.connect(this.master); this.sfx.connect(this.master); this.amb.connect(this.master);
    // a little room: a feedback delay with damping stands in for reverb
    this.verb = c.createDelay(1); this.verb.delayTime.value = 0.23; const fb = c.createGain(); fb.gain.value = 0.38; const damp = c.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 1800;
    this.verb.connect(damp); damp.connect(fb); fb.connect(this.verb); this.verbOut = c.createGain(); this.verbOut.gain.value = 0.5; damp.connect(this.verbOut); this.verbOut.connect(this.master);
    this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // wind bed: two filtered noise layers
    const mk = (type, f, q) => { const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const gn = c.createGain(); gn.gain.value = 0; s.connect(b); b.connect(gn); gn.connect(this.amb); s.start(); return { s, b, gn }; };
    this.w1 = mk('bandpass', 420, 0.7); this.w2 = mk('bandpass', 1900, 6);
    this.on = true; this.setVolume(this.vol);
  }
  setVolume(v) { Object.assign(this.vol, { volume: v.volume, music: v.music, sfx: v.sfx, muted: v.muted }); if (!this.ctx) return; const t = this.ctx.currentTime; this.master.gain.setTargetAtTime(this.vol.muted ? 0 : this.vol.volume * 0.9, t, 0.05); this.music.gain.setTargetAtTime(this.vol.music * 0.8, t, 0.05); this.sfx.gain.setTargetAtTime(this.vol.sfx, t, 0.05); this.amb.gain.setTargetAtTime(this.vol.sfx * 0.9, t, 0.05); }
  suspend() { this.paused = true; if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { this.paused = false; if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  dispose() { if (this.ctx) { try { this.ctx.close(); } catch (e) { /* ignore */ } } this.ctx = null; this.on = false; }
  env(g, t, a, peak, dur, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  // breathy end-blown flute
  flute(freq, when, dur, amp = 0.05) {
    const c = this.ctx, t = when;
    const o = c.createOscillator(); o.type = 'sine'; const o2 = c.createOscillator(); o2.type = 'triangle';
    o.frequency.setValueAtTime(freq * 0.94, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.22); o2.frequency.setValueAtTime(freq * 2 * 0.94, t); o2.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.22);
    const lfo = c.createOscillator(); lfo.frequency.value = 5.2; const lg = c.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.012, t + dur * 0.8); lfo.connect(lg); lg.connect(o.frequency);
    if (dur > 1.4) { o.frequency.setValueAtTime(freq, t + dur - 0.35); o.frequency.exponentialRampToValueAtTime(freq * 0.97, t + dur); }
    const g = c.createGain(), g2 = c.createGain(); g2.gain.value = 0.12; this.env(g, t, 0.18, amp, dur, 0.35);
    const n = c.createBufferSource(); n.buffer = this.noise; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq * 2.2; bp.Q.value = 1.4; const ng = c.createGain(); this.env(ng, t, 0.06, amp * 0.55, dur, 0.4);
    n.connect(bp); bp.connect(ng); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.music); ng.connect(this.music); g.connect(this.verb); ng.connect(this.verb);
    o.start(t); o2.start(t); lfo.start(t); n.start(t, Math.random()); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05); n.stop(t + dur + 0.05);
  }
  // Karplus-Strong koto pluck (buffers cached per pitch)
  pluck(freq, when, amp = 0.16, bus) {
    const c = this.ctx, key = Math.round(freq);
    let buf = this.ks.get(key);
    if (!buf) {
      const sr = c.sampleRate, len = Math.floor(sr * 2.2), N = Math.max(2, Math.round(sr / freq)); buf = c.createBuffer(1, len, sr); const d = buf.getChannelData(0), ring = new Float32Array(N);
      for (let i = 0; i < N; i++) ring[i] = (Math.random() * 2 - 1) * (i < N * 0.5 ? 1 : 0.6);
      let idx = 0; for (let i = 0; i < len; i++) { const a = ring[idx], b = ring[(idx + 1) % N]; const v = 0.4985 * (a + b); ring[idx] = v; d[i] = a; idx = (idx + 1) % N; }
      this.ks.set(key, buf);
    }
    const s = c.createBufferSource(); s.buffer = buf; const g = c.createGain(); g.gain.value = amp; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3200;
    s.connect(f); f.connect(g); g.connect(bus || this.music); g.connect(this.verb); s.start(when);
  }
  taiko(when, amp = 0.5, low = 1) {
    const c = this.ctx, t = when;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(95 * low, t); o.frequency.exponentialRampToValueAtTime(46 * low, t + 0.35);
    const g = c.createGain(); this.env(g, t, 0.006, amp, 0.7, 0.6); o.connect(g); g.connect(this.sfx); g.connect(this.verb); o.start(t); o.stop(t + 0.75);
    const n = c.createBufferSource(); n.buffer = this.noise; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; const ng = c.createGain(); this.env(ng, t, 0.002, amp * 0.5, 0.12, 0.1);
    n.connect(lp); lp.connect(ng); ng.connect(this.sfx); n.start(t, Math.random()); n.stop(t + 0.15);
  }
  ring(when, base, amp = 0.07, long = 1) {
    const c = this.ctx, t = when;
    for (const [r, d, a] of [[1, 1.4, 1], [2.76, 0.9, 0.55], [5.4, 0.55, 0.35], [8.93, 0.3, 0.2]]) {
      const o = c.createOscillator(); o.frequency.value = base * r * (1 + (Math.random() - 0.5) * 0.004); const g = c.createGain(); g.gain.setValueAtTime(amp * a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d * long);
      o.connect(g); g.connect(this.sfx); g.connect(this.verb); o.start(t); o.stop(t + d * long + 0.02);
    }
    this.noiseHit(t, 4000, 0.03, amp * 1.6, 'highpass');
  }
  noiseHit(t, f, dur, amp, type = 'bandpass', q = 1, sweep) {
    const c = this.ctx, n = c.createBufferSource(); n.buffer = this.noise; const b = c.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, t); b.Q.value = q; if (sweep) b.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    const g = c.createGain(); this.env(g, t, Math.min(0.01, dur * 0.3), amp, dur, dur * 0.7); n.connect(b); b.connect(g); g.connect(this.sfx); n.start(t, Math.random() * 1.5); n.stop(t + dur + 0.02);
  }
  step(t, ground, run) {
    const a = run ? 0.06 : 0.04;
    if (ground === 'snow') { for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.012, 1400 + Math.random() * 600, 0.03, a * 0.8, 'bandpass', 1.5); }
    else if (ground === 'stone') { this.noiseHit(t, 2600, 0.025, a * 0.9, 'bandpass', 3); this.noiseHit(t, 400, 0.04, a * 0.6, 'lowpass'); }
    else if (ground === 'wood') { this.noiseHit(t, 520, 0.07, a * 1.2, 'bandpass', 7); }
    else if (ground === 'earth') { this.noiseHit(t, 320, 0.06, a, 'bandpass', 1.2); }
    else { this.noiseHit(t, 700, 0.05, a * 0.9, 'lowpass'); this.noiseHit(t, 3000, 0.03, a * 0.3, 'highpass'); }
  }
  cue(c, s) {
    if (!this.on || !this.ctx || this.paused) return;
    const t = this.ctx.currentTime + 0.01, C = CHAPTERS[s.ch];
    switch (c.k) {
      case 'swing': this.noiseHit(t, c.kind === 'slash' ? 900 : 600, c.kind === 'slash' ? 0.16 : 0.26, 0.09, 'bandpass', 1.2, c.kind === 'slash' ? 3000 : 2400); break;
      case 'cut': this.noiseHit(t, 1100, 0.12, 0.14, 'bandpass', 0.8, 300); this.taiko(t, 0.12, 1.4); break;
      case 'riposte': this.ring(t, 1500, 0.06, 1.2); this.noiseHit(t + 0.02, 900, 0.2, 0.2, 'bandpass', 0.7, 200); this.taiko(t, 0.35); break;
      case 'parry': case 'reflect': this.ring(t, 1240 + Math.random() * 120, 0.09, 1.6); break;
      case 'deflect': case 'clash': this.ring(t, 900 + Math.random() * 200, 0.05, 0.6); break;
      case 'guardbreak': this.taiko(t, 0.4, 0.8); this.noiseHit(t, 300, 0.25, 0.2, 'lowpass'); break;
      case 'hurt': this.taiko(t, 0.3, 0.7); this.noiseHit(t, 600, 0.15, 0.12, 'bandpass', 1, 200); break;
      case 'tell': if (c.red) this.ring(t, 2100, 0.035, 0.4); else this.noiseHit(t, 5000, 0.05, 0.03, 'highpass'); break;
      case 'kill': if (c.boss) { this.taiko(t, 0.6, 0.8); this.taiko(t + 0.5, 0.4, 0.7); this.pluck(SCALE[0], t + 1.2, 0.15); this.pluck(SCALE[2], t + 1.45, 0.12); this.pluck(SCALE[3], t + 1.7, 0.12); } else this.pluck(SCALE[(Math.random() * 3) | 0] / 2, t + 0.2, 0.1); break;
      case 'step': this.step(t, C.key === 'snow' ? 'snow' : C.key === 'torii' ? 'stone' : C.key === 'castle' && s.p.x > C.bridge[0] ? 'wood' : C.key === 'terraces' ? 'earth' : 'grass', c.run); break;
      case 'land': this.step(t, 'earth', true); break;
      case 'dodge': this.noiseHit(t, 500, 0.25, 0.06, 'bandpass', 0.8, 1400); break;
      case 'gust': this.noiseHit(t, 300, 2.2, 0.06, 'bandpass', 0.6, 1600); for (let i = 0; i < 3; i++) this.pluck(SCALE[4 + i] || SCALE[5], t + 0.3 + i * 0.22, 0.07); break;
      case 'bowstart': this.pluck(SCALE[2], t, 0.1); break;
      case 'blessing': this.pluck(SCALE[0], t, 0.12); this.pluck(SCALE[3], t + 0.3, 0.1); break;
      case 'secret': case 'charm': case 'foxcharm': [0, 2, 3, 5].forEach((k, i) => this.pluck(SCALE[k], t + i * 0.18, 0.1)); break;
      case 'checkpoint': this.pluck(SCALE[5], t, 0.06); break;
      case 'pluck': this.pluck(SCALE[[0, 3, 5][(c.step - 1) % 3]], t, 0.14); break;
      case 'haiku': [5, 3, 2, 0].forEach((k, i) => this.pluck(SCALE[k], t + 0.4 + i * 0.3, 0.12)); break;
      case 'boss': this.taiko(t, 0.5); this.taiko(t + 0.6, 0.35); this.taiko(t + 1.0, 0.55, 0.85); this.drumT = 2.4; break;
      case 'phase2': this.taiko(t, 0.6, 0.75); this.ring(t + 0.1, 700, 0.05, 1.5); break;
      case 'standoff': this.taiko(t, 0.3, 0.8); break;
      case 'sodraw': this.ring(t, 1800, 0.06, 0.8); break;
      case 'socut': this.ring(t, 1350, 0.12, 2.2); this.noiseHit(t, 2000, 0.3, 0.12, 'bandpass', 0.6, 300); break;
      case 'sofail': this.taiko(t, 0.35, 0.7); break;
      case 'sowon': this.pluck(SCALE[0], t + 0.4, 0.12); this.pluck(SCALE[2], t + 0.6, 0.1); break;
      case 'death': this.taiko(t, 0.5, 0.6); this.pluck(SCALE[1], t + 0.3, 0.12); this.pluck(SCALE[0] / 2, t + 0.5, 0.12); break;
      case 'chapter': this.nextPhrase = 2.5; break;
      case 'shoot': this.noiseHit(t, 2400, 0.08, 0.05, 'bandpass', 2, 800); break;
      case 'heal': this.pluck(SCALE[3], t, 0.09); this.pluck(SCALE[5], t + 0.15, 0.08); break;
      case 'counter': this.ring(t, 1700, 0.07, 1.0); break;
    }
  }
  update(s, dt, screen) {
    if (!this.on || !this.ctx || this.paused) return;
    const c = this.ctx, t = c.currentTime; this.t += dt;
    const standoff = s.phase === 'standoff' && s.so && s.so.st !== 'walk';
    const quiet = standoff ? 0.08 : s.phase === 'haiku' ? 0.6 : s.phase === 'dead' ? 0.3 : 1;
    this.duck += (quiet - this.duck) * Math.min(1, dt * (standoff ? 3 : 1));
    const w = Math.abs(s.wind.w), gust = s.wind.gust || 0;
    this.w1.gn.gain.setTargetAtTime((0.025 + w * 0.06 + gust * 0.05) * this.duck, t, 0.3); this.w1.b.frequency.setTargetAtTime(320 + w * 500 + gust * 400, t, 0.4);
    this.w2.gn.gain.setTargetAtTime((0.004 + gust * 0.018 + Math.max(0, w - 0.6) * 0.012) * this.duck, t, 0.3); this.w2.b.frequency.setTargetAtTime(1500 + w * 900 + Math.sin(this.t * 0.7) * 200, t, 0.5);
    this.music.gain.setTargetAtTime(this.vol.music * 0.8 * (standoff ? 0.05 : 1), t, standoff ? 0.15 : 0.8);
    // sparse flute phrases on the in scale
    this.nextPhrase -= dt;
    if (this.nextPhrase <= 0 && !standoff && s.phase !== 'dead') {
      const n = 2 + ((Math.random() * 3) | 0); let when = t + 0.1, k = 2 + ((Math.random() * 3) | 0);
      for (let i = 0; i < n; i++) { const dur = 0.7 + Math.random() * 1.6; this.flute(SCALE[k], when, dur, 0.04); when += dur + 0.1 + Math.random() * 0.4; k = Math.max(0, Math.min(SCALE.length - 1, k + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0])); }
      if (Math.random() < 0.5) this.pluck(SCALE[0] / 2, t + 0.05, 0.08);
      this.nextPhrase = 9 + Math.random() * 12 + (when - t);
    }
    // duel drums under boss fights; a slow heartbeat while holding a standoff
    if (s.arena && s.arena.boss && s.phase === 'play') { this.drumT -= dt; if (this.drumT <= 0) { this.taiko(t + 0.02, 0.16, 0.9); this.taiko(t + 0.42, 0.1, 0.9); this.drumT = 1.7; } }
    if (standoff && s.so.st === 'hold') { this.beat = (this.beat || 0) - dt; if (this.beat <= 0) { this.taiko(t, 0.08, 0.55); this.taiko(t + 0.22, 0.05, 0.55); this.beat = 1.15; } }
  }
}
