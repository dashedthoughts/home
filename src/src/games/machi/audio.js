// MACHI sound: all WebAudio synthesis. Pops on a pentatonic streak, footsteps by material, rain,
// a distant train, city hum and a slow generative pad. Starts on the first user gesture.
const PENTA = [0, 2, 4, 7, 9];
export class Audio {
  constructor() { this.ctx = null; this.on = true; this.music = false; this.streak = 0; this.lastPop = -9; this.rainGain = null; }
  ensure() {
    if (this.ctx || typeof window === 'undefined') return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { this.ctx = new AC(); } catch { return null; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(c.destination);
    this.comp = c.createDynamicsCompressor(); this.comp.connect(this.master);
    // a short reverb made from decaying noise
    const len = c.sampleRate * 1.6, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    this.verb = c.createConvolver(); this.verb.buffer = ir; this.verbGain = c.createGain(); this.verbGain.gain.value = 0.25; this.verb.connect(this.verbGain); this.verbGain.connect(this.comp);
    // noise source shared by footsteps, rain, hum
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), nd = nb.getChannelData(0);
    let b = 0; for (let i = 0; i < nd.length; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; nd[i] = w * 0.5 + b * 2; }
    this.noiseBuf = nb;
    // city hum: brown-ish noise through a low pass
    this.hum = this._loopNoise(180, 0.05);
    // rain bed
    this.rainGain = this._loopNoise(2600, 0, 'bandpass', 0.6);
    // train rumble
    this.trainGain = this._loopNoise(110, 0);
    this.trainClack = 0;
    this._padTimer = 0; this._padStep = 0;
    return c;
  }
  _loopNoise(freq, gain, type = 'lowpass', q = 0.7) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(this.comp); s.start();
    return g;
  }
  resume() { const c = this.ensure(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  setOn(on) { this.on = on; if (this.master) this.master.gain.setTargetAtTime(on ? 0.8 : 0, this.ctx.currentTime, 0.05); }
  _tone(freq, dur, { type = 'sine', gain = 0.2, attack = 0.004, slide = 0, verb = 0.3, when = 0 } = {}) {
    const c = this.ctx; if (!c || !this.on) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.comp); if (verb) { const v = c.createGain(); v.gain.value = verb; g.connect(v); v.connect(this.verb); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  _noise(dur, freq, gain, type = 'bandpass', q = 1.2) {
    const c = this.ctx; if (!c || !this.on) return;
    const t = c.currentTime, s = c.createBufferSource(); s.buffer = this.noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(this.comp); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  // soft pitched pop; a streak of placements walks up a pentatonic scale
  pop(now) {
    if (!this.ctx) return;
    this.streak = now - this.lastPop < 1.2 ? this.streak + 1 : 0; this.lastPop = now;
    const k = this.streak % 15, semi = PENTA[k % 5] + 12 * Math.floor(k / 5);
    const f = 392 * Math.pow(2, semi / 12);
    this._tone(f, 0.16, { type: 'sine', gain: 0.16, slide: 1.02, verb: 0.35 });
    this._tone(f * 2, 0.06, { type: 'triangle', gain: 0.04, verb: 0 });
  }
  chime() { [0, 4, 7, 12].forEach((s, i) => this._tone(523.25 * Math.pow(2, s / 12), 1.2, { type: 'sine', gain: 0.09, attack: 0.01, verb: 0.6, when: i * 0.09 })); }
  thud() { this._tone(150, 0.12, { type: 'sine', gain: 0.18, slide: 0.5, verb: 0.1 }); this._noise(0.08, 900, 0.08); }
  click() { this._tone(1200, 0.03, { type: 'square', gain: 0.025, verb: 0 }); }
  step(material) {
    const m = { stone: [1400, 0.07, 0.12], wood: [520, 0.09, 0.14], grass: [2600, 0.06, 0.05], gravel: [3200, 0.08, 0.09], metal: [2100, 0.07, 0.08], water: [800, 0.18, 0.1], glass: [2400, 0.05, 0.07], cloth: [1800, 0.05, 0.04] }[material] || [1400, 0.07, 0.1];
    this._noise(m[1], m[0], m[2], 'bandpass', 1.8);
    if (material === 'wood') this._tone(140, 0.07, { gain: 0.05, verb: 0 });
    if (material === 'metal') this._tone(900, 0.05, { type: 'triangle', gain: 0.02, verb: 0.1 });
  }
  // per-frame: rain level, train distance (0..1 loudness), pad
  update(dt, { rain = 0, train = 0, night = 1 } = {}) {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const t = c.currentTime;
    this.rainGain.gain.setTargetAtTime(rain * 0.22, t, 0.4);
    this.trainGain.gain.setTargetAtTime(train * 0.35, t, 0.2);
    this.hum.gain.setTargetAtTime(0.035 + 0.02 * night, t, 0.5);
    if (train > 0.05) { this.trainClack -= dt; if (this.trainClack <= 0) { this.trainClack = 0.42; this._noise(0.05, 700, train * 0.12, 'lowpass'); setTimeout(() => this._noise(0.05, 650, train * 0.1, 'lowpass'), 110); } }
    this._musicTick();
    // generative pad: a slow pentatonic chord every few seconds, very quiet (rests while the music plays)
    this._padTimer -= dt;
    if (this._padTimer <= 0 && this.on && !this.music) {
      this._padTimer = 6 + Math.random() * 4;
      const roots = [146.8, 164.8, 130.8, 110];
      const root = roots[this._padStep++ % roots.length];
      for (const s of [0, 7, 12 + PENTA[1 + Math.floor(Math.random() * 4)]]) this._tone(root * Math.pow(2, s / 12), 7, { type: 'sine', gain: 0.018, attack: 2.5, verb: 0.8 });
    }
  }
  // ---------------- lo-fi music: soft keys, bass, a slow swung beat and a vinyl bed ----------------
  setMusic(on) {
    this.music = !!on;
    if (this.mGain && this.ctx) this.mGain.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.8);
  }
  _mBus() {
    if (this.mBus || !this.ctx) return this.mBus;
    const c = this.ctx;
    this.mGain = c.createGain(); this.mGain.gain.value = 0; this.mGain.connect(this.comp);
    this.mBus = c.createBiquadFilter(); this.mBus.type = 'lowpass'; this.mBus.frequency.value = 4200; this.mBus.Q.value = 0.4; this.mBus.connect(this.mGain);
    // vinyl bed: quiet band-limited hiss
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.35;
    const g = c.createGain(); g.gain.value = 0.018; s.connect(f); f.connect(g); g.connect(this.mBus); s.start();
    this.mNext = c.currentTime + 0.2; this.mStep = 0; this.mCrackle = 0;
    this.mGain.gain.setTargetAtTime(this.music ? 0.55 : 0, c.currentTime, 0.8);
    return this.mBus;
  }
  _mOsc(t, freq, dur, type, gain, detune = 0, cutoff = 2200) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = type; o.frequency.value = freq; o.detune.value = detune; f.type = 'lowpass'; f.frequency.value = cutoff;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(f); f.connect(g); g.connect(this.mBus); o.start(t); o.stop(t + dur + 0.05);
  }
  _mNoise(t, dur, freq, gain, type = 'highpass') {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; const g = c.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    s.connect(f); f.connect(g); g.connect(this.mBus); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  _musicTick() {
    const c = this.ctx; if (!c || !this.music || !this.on || c.state !== 'running') return;
    this._mBus();
    const eighth = 60 / 72 / 2;
    if (this.mNext < c.currentTime - 0.1) this.mNext = c.currentTime + 0.05; // resumed after a pause
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    // Fmaj9, Em7, Dm9, Cmaj7: four bars, eight swung eighths each
    const bars = [[53, [65, 69, 72, 76, 79]], [52, [64, 67, 71, 74]], [50, [62, 65, 69, 72, 76]], [48, [60, 64, 67, 71]]];
    while (this.mNext < c.currentTime + 0.25) {
      const st = this.mStep, bar = bars[Math.floor(st / 8) % 4], e = st % 8;
      const t = this.mNext + (e % 2 ? eighth * 0.16 : 0) + (Math.random() - 0.5) * 0.012;
      const wow = Math.sin(c.currentTime * 0.6) * 7;
      if (e === 0 || e === 3) bar[1].forEach((m, i) => { if (e === 3 && i > 2) return; const v = 0.022 + Math.random() * 0.01; this._mOsc(t + i * 0.012, midi(m), e === 0 ? 2.4 : 1.4, 'sine', v, wow); this._mOsc(t + i * 0.012, midi(m) * 2, 0.6, 'triangle', v * 0.18, wow, 1400); });
      if (e === 0) this._mOsc(t, midi(bar[0] - 12), 1.6, 'sine', 0.09, 0, 400);
      if (e === 5 && Math.random() < 0.5) this._mOsc(t, midi(bar[0]), 0.5, 'sine', 0.05, 0, 400);
      if (e === 0 || e === 4 || (e === 7 && Math.random() < 0.3)) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.3); o.connect(g); g.connect(this.mBus); o.start(t); o.stop(t + 0.35); }
      if (e === 2 || e === 6) this._mNoise(t, 0.14, 1700, 0.05, 'bandpass');
      this._mNoise(t, 0.035, 7500, e % 2 ? 0.012 : 0.02);
      this.mNext += eighth; this.mStep = (st + 1) % 32;
    }
    if (c.currentTime > this.mCrackle) { this.mCrackle = c.currentTime + 0.15 + Math.random() * 0.8; this._mNoise(c.currentTime + 0.05, 0.006, 2500, 0.05 + Math.random() * 0.05, 'bandpass'); }
  }
  dispose() { try { this.ctx && this.ctx.close(); } catch { /* closed */ } this.ctx = null; }
}
