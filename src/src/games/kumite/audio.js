// NEON KUMITE · WebAudio synthesis only: no samples, no speech. Created on the first user gesture.
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = [
  { bpm: 128, root: 45, scale: [0, 3, 5, 7, 10], bass: [0, 0, 12, 0, 0, 10, 0, 7, 0, 0, 12, 0, 3, 0, 5, 7], chords: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 10, 14]] },
  { bpm: 118, root: 50, scale: [0, 1, 5, 7, 8], bass: [0, 0, 0, 12, 0, 0, 8, 0, 0, 0, 0, 12, 7, 0, 5, 1], chords: [[0, 3, 7], [1, 5, 8], [-4, 0, 3], [-2, 1, 5]] },
  { bpm: 136, root: 52, scale: [0, 2, 3, 7, 10], bass: [0, 12, 0, 0, 10, 0, 12, 0, 0, 12, 0, 7, 0, 3, 5, 7], chords: [[0, 3, 7], [-2, 2, 5], [3, 7, 10], [5, 8, 12]] },
];
export function createAudio() {
  let ac = null, master, sfx, mus, comp, noise, rev;
  const cfg = { sfx: 0.8, music: true, musicVol: 0.5 };
  let track = 0, playing = false, nextT = 0, step = 0, timer = null, bar = 0, seed = 7, calm = false;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { ac = new AC(); } catch (e) { return false; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.15; comp.connect(master);
    sfx = ac.createGain(); sfx.gain.value = cfg.sfx; sfx.connect(comp);
    mus = ac.createGain(); mus.gain.value = cfg.music ? cfg.musicVol * 0.5 : 0; mus.connect(comp);
    // a short feedback delay as a cheap room
    rev = ac.createDelay(0.4); rev.delayTime.value = 0.11; const fb = ac.createGain(); fb.gain.value = 0.32; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const send = ac.createGain(); send.gain.value = 0.22; sfx.connect(send); send.connect(rev); rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(comp);
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  const now = () => ac.currentTime;
  function env(g, t, a, peak, dec, end = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + dec); }
  function osc(type, f0, f1, t, dur, vol, dest = sfx, a = 0.002) {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ac.createGain(); env(g, t, a, vol, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dur + 0.05);
    return o;
  }
  function nz(type, f0, f1, q, t, dur, vol, dest = sfx, a = 0.002) {
    const s = ac.createBufferSource(); s.buffer = noise; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ac.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ac.createGain(); env(g, t, a, vol, dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + a + dur + 0.05);
  }
  const A = {
    unlock: () => init(),
    get ready() { return !!ac && ac.state === 'running'; },
    set(o) { Object.assign(cfg, o); if (ac) { sfx.gain.value = cfg.sfx; mus.gain.setTargetAtTime(cfg.music ? cfg.musicVol * (calm ? 0.3 : 0.5) : 0, now(), 0.1); } if (!cfg.music) stopMusic(); },
    hit(str = 1, counter) {
      if (!ac) return; const t = now(); const k = [0.5, 0.75, 1, 1.25][str] || 1;
      nz('bandpass', 3200 - str * 500, 900, 1.2, t, 0.05 + str * 0.03, 0.6 * k);
      osc('sine', 170 - str * 20, 42, t, 0.09 + str * 0.06, 0.9 * k);
      osc('square', 1200, 300, t, 0.012, 0.25 * k);
      if (str >= 2) nz('lowpass', 900, 120, 0.7, t + 0.01, 0.22 + str * 0.05, 0.5 * k);
      if (counter) osc('triangle', 1760, 1760, t, 0.18, 0.18);
    },
    block(str = 1) { if (!ac) return; const t = now(); osc('square', 1180, 1100, t, 0.06, 0.12); osc('triangle', 1710, 1600, t, 0.09, 0.14); nz('highpass', 3000, 2000, 0.8, t, 0.05, 0.3 + str * 0.06); },
    whoosh(tier = 1) { if (!ac) return; const t = now(); const d = tier >= 2 ? 0.16 : 0.09; nz('bandpass', tier >= 2 ? 300 : 700, tier >= 2 ? 1500 : 2600, 2.5, t, d, 0.22 + tier * 0.05, sfx, d * 0.6); },
    step(k = 1) { if (!ac) return; const t = now(); nz('lowpass', 260, 90, 0.8, t, 0.08 * k, 0.35 * k); },
    dash() { if (!ac) return; const t = now(); nz('bandpass', 500, 1800, 1.5, t, 0.14, 0.25, sfx, 0.03); },
    zap(kind) { if (!ac) return; const t = now(); osc('sawtooth', kind === 'mine' ? 420 : 980, kind === 'mine' ? 840 : 180, t, 0.18, 0.14); osc('square', 2200, 600, t, 0.08, 0.06); nz('bandpass', 4000, 1500, 3, t, 0.12, 0.15); },
    boom(k = 1) { if (!ac) return; const t = now(); nz('lowpass', 900, 80, 0.7, t, 0.5 * k, 0.8 * k); osc('sine', 80, 30, t, 0.5 * k, 0.9 * k); },
    grab() { if (!ac) return; const t = now(); osc('sine', 140, 60, t, 0.12, 0.7); nz('bandpass', 900, 500, 1, t, 0.1, 0.3); },
    parry() { if (!ac) return; const t = now(); osc('triangle', 2093, 2093, t, 0.4, 0.2); osc('triangle', 3136, 3136, t + 0.02, 0.35, 0.12); nz('highpass', 6000, 4000, 1, t, 0.1, 0.2); },
    teleport() { if (!ac) return; const t = now(); osc('sine', 300, 1800, t, 0.14, 0.18); nz('bandpass', 1200, 5000, 4, t, 0.16, 0.18, sfx, 0.05); },
    armor() { if (!ac) return; const t = now(); osc('square', 220, 200, t, 0.12, 0.2); osc('square', 330, 300, t, 0.12, 0.12); },
    ex() { if (!ac) return; const t = now(); osc('sawtooth', 300, 1200, t, 0.12, 0.15); osc('triangle', 1320, 1320, t + 0.06, 0.2, 0.15); },
    superStart() {
      if (!ac) return; const t = now();
      osc('sawtooth', 110, 1760, t, 0.6, 0.18, sfx, 0.02); nz('bandpass', 400, 6000, 2, t, 0.6, 0.25, sfx, 0.4);
      [57, 60, 64, 67].forEach((m, i) => { osc('sawtooth', N(m), N(m), t + 0.62, 0.5, 0.08); osc('square', N(m + 12), N(m + 12), t + 0.62 + i * 0.02, 0.3, 0.03); });
      nz('lowpass', 1200, 100, 0.6, t + 0.62, 0.5, 0.7);
    },
    ko() {
      if (!ac) return; const t = now();
      A.boom(1.6); [64, 60, 55, 48].forEach((m, i) => osc('sawtooth', N(m), N(m - 1), t + 0.15 + i * 0.12, 0.35, 0.09));
      osc('sine', 55, 40, t + 0.6, 1.2, 0.5);
    },
    ann(kind) {
      if (!ac) return; const t = now();
      const seq = kind === 'round' ? [[57, 0], [64, 0.14]] : kind === 'fight' ? [[57, 0], [60, 0.07], [64, 0.14], [69, 0.21]] : kind === 'time' ? [[64, 0], [57, 0.2]] : [[69, 0], [73, 0.08], [76, 0.16], [81, 0.24]];
      seq.forEach(([m, d]) => { osc('sawtooth', N(m), N(m), t + d, 0.26, 0.11); osc('square', N(m + 12), N(m + 12), t + d, 0.18, 0.04); });
      if (kind === 'fight') nz('highpass', 3000, 1500, 0.8, t + 0.21, 0.3, 0.25);
    },
    ui(kind = 'move') { if (!ac) return; const t = now(); if (kind === 'ok') { osc('square', 880, 880, t, 0.05, 0.08); osc('square', 1320, 1320, t + 0.05, 0.08, 0.08); } else if (kind === 'back') osc('square', 440, 330, t, 0.08, 0.07); else osc('square', 660, 660, t, 0.03, 0.05); },
    music(i, quiet) { track = i % TRACKS.length; calm = !!quiet; if (!ac || !cfg.music) return; mus.gain.setTargetAtTime(cfg.musicVol * (calm ? 0.3 : 0.5), now(), 0.2); if (!playing) startMusic(); },
    stopMusic,
    suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); },
    resume() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); },
    close() { stopMusic(); if (ac) { try { ac.close(); } catch (e) { /* closed already */ } ac = null; } },
  };
  function startMusic() { if (playing) return; playing = true; nextT = now() + 0.08; step = 0; timer = setInterval(sched, 30); }
  function stopMusic() { playing = false; if (timer) clearInterval(timer); timer = null; }
  function sched() {
    if (!ac || !playing) return;
    const T = TRACKS[track]; const sp = 60 / T.bpm / 4;
    while (nextT < now() + 0.14) { note(T, step, nextT, sp); nextT += sp; step = (step + 1) % 64; if (step === 0) bar++; }
  }
  function note(T, s, t, sp) {
    const b16 = s % 16; const chord = T.chords[Math.floor(s / 16) % 4];
    if (!calm) {
      if (b16 % 4 === 0) { const g = ac.createGain(); const o = ac.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.002, 0.9, 0.2); o.connect(g); g.connect(mus); o.start(t); o.stop(t + 0.25); }
      if (b16 === 4 || b16 === 12) nz('bandpass', 1800, 1200, 0.9, t, 0.12, 0.35, mus);
      if (b16 % 2 === 1) nz('highpass', 8000, 7000, 0.6, t, 0.03, b16 % 4 === 3 ? 0.18 : 0.1, mus);
    }
    const bn = T.bass[b16]; if (bn != null && (b16 % 2 === 0 || !calm)) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = N(T.root - 12 + chord[0] + bn); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + sp * 1.6); f.Q.value = 6; const g = ac.createGain(); env(g, t, 0.004, calm ? 0.18 : 0.32, sp * 1.7); o.connect(f); f.connect(g); g.connect(mus); o.start(t); o.stop(t + sp * 2); }
    if (b16 === 0) chord.forEach((c) => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = N(T.root + 12 + c); const g = ac.createGain(); env(g, t, 0.08, 0.06, sp * 15); o.connect(g); g.connect(mus); o.start(t); o.stop(t + sp * 16); });
    if (!calm && (b16 % 2 === 0) && rnd() < 0.55) { const deg = T.scale[Math.floor(rnd() * T.scale.length)]; osc('square', N(T.root + 24 + deg + (rnd() < 0.25 ? 12 : 0)), N(T.root + 24 + deg), t, sp * 0.9, 0.045, mus, 0.003); }
  }
  return A;
}
