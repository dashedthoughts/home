// ITO audio: all WebAudio synthesis. Wind that rises with speed, the line's zip and creak, release whoosh, impacts,
// UI ticks, and an optional generative lo-fi loop with a city-pop lean (original chords, original melody fragments).
export function createAudio() {
  let ctx = null, master = null, sfxBus = null, musicBus = null, windGain = null, windFilter = null, creakGain = null, creakOsc = null, noiseBuf = null;
  let soundOn = true, musicOn = true, started = false, musicTimer = 0, nextBeat = 0, beat = 0;

  function init() {
    if (ctx) return true;
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return false;
    try { ctx = new AC(); } catch { return false; }
    master = ctx.createGain(); master.gain.value = soundOn ? 0.8 : 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(comp);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.32 : 0; musicBus.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // wind: looping noise through a bandpass whose frequency and gain follow speed
    const wn = ctx.createBufferSource(); wn.buffer = noiseBuf; wn.loop = true;
    windFilter = ctx.createBiquadFilter(); windFilter.type = 'bandpass'; windFilter.frequency.value = 400; windFilter.Q.value = 0.7;
    windGain = ctx.createGain(); windGain.gain.value = 0;
    wn.connect(windFilter); windFilter.connect(windGain); windGain.connect(sfxBus); wn.start();
    // line tension creak: a low detuned triangle, gated by tension
    creakOsc = ctx.createOscillator(); creakOsc.type = 'triangle'; creakOsc.frequency.value = 70;
    const cf = ctx.createBiquadFilter(); cf.type = 'lowpass'; cf.frequency.value = 500;
    creakGain = ctx.createGain(); creakGain.gain.value = 0;
    creakOsc.connect(cf); cf.connect(creakGain); creakGain.connect(sfxBus); creakOsc.start();
    return true;
  }
  function noise(dur, f0, f1, gain, type = 'bandpass', q = 1, t0 = 0) {
    const t = ctx.currentTime + t0;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.02, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function tone(type, f0, f1, dur, gain, bus = sfxBus, t0 = 0) {
    const t = ctx.currentTime + t0;
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }

  // ---- music: Fmaj7 - Em7 - Dm7 - G7sus4 / Bbmaj7 - Am7 - Gm7 - C7 (original progression), 84 bpm, swung hats ----
  const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [55, 60, 62, 65], [58, 62, 65, 69], [57, 60, 64, 67], [55, 58, 62, 65], [48, 52, 55, 58]];
  const BASS = [41, 40, 38, 43, 46, 45, 43, 36];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const BPM = 84, SPB = 60 / BPM;
  function keys(m, t, dur, g) {
    // electric-piano-ish: sine + quiet octave, soft attack
    for (const [mul, gg] of [[1, 1], [2, 0.18]]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(m) * mul;
      const v = ctx.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g * gg, t + 0.02); v.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(v); v.connect(musicBus); o.start(t); o.stop(t + dur + 0.05);
    }
  }
  function drum(kind, t) {
    if (kind === 'k') { const o = ctx.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18); const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.3); }
    else {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = kind === 's' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 's' ? 1800 : 7000;
      const g = ctx.createGain(); const a = kind === 's' ? 0.28 : 0.07, d = kind === 's' ? 0.16 : 0.04;
      g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      s.connect(f); f.connect(g); g.connect(musicBus); s.start(t, Math.random()); s.stop(t + d + 0.02);
    }
  }
  function scheduleMusic() {
    if (!ctx || !musicOn) return;
    const ahead = ctx.currentTime + 0.25;
    if (nextBeat < ctx.currentTime) nextBeat = ctx.currentTime + 0.05;
    while (nextBeat < ahead) {
      const bar = Math.floor(beat / 4) % 8, b = beat % 4, t = nextBeat;
      if (b === 0) { for (const m of CH[bar]) keys(m, t + Math.random() * 0.02, SPB * 3.6, 0.05); keys(BASS[bar] - 12, t, SPB * 1.8, 0.16); }
      if (b === 2) keys(BASS[bar] - 12 + 7, t, SPB * 1.2, 0.1);
      if (b === 0) drum('k', t);
      if (b === 2) drum('k', t + SPB * 0.5);
      if (b === 1 || b === 3) drum('s', t);
      drum('h', t); drum('h', t + SPB * 0.66);
      // a sparse melody fragment, seeded by the bar
      if ((bar * 7 + b * 3) % 5 === 0) keys(CH[bar][(b + bar) % 4] + 12, t + SPB * 0.5, SPB * 1.4, 0.035);
      nextBeat += SPB; beat++;
    }
  }

  return {
    // must be called from a user gesture
    start() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); started = true; },
    get started() { return started; },
    setSound(on) { soundOn = on; if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05); },
    setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.32 : 0, ctx.currentTime, 0.2); },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); },
    resume() { if (ctx && started && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    // per frame: speed (m/s), line tension 0..1, playing flag
    update(speed, tension, playing, dt) {
      if (!ctx || !started) return;
      const t = ctx.currentTime;
      const w = playing ? Math.min(1, Math.max(0, (speed - 6) / 50)) : 0;
      windGain.gain.setTargetAtTime(w * w * 0.5, t, 0.08);
      windFilter.frequency.setTargetAtTime(300 + w * 1700, t, 0.1);
      creakGain.gain.setTargetAtTime(playing ? Math.min(0.06, tension * 0.06) : 0, t, 0.05);
      creakOsc.frequency.setTargetAtTime(60 + tension * 40, t, 0.1);
      musicTimer -= dt;
      if (musicTimer <= 0) { musicTimer = 0.1; scheduleMusic(); }
    },
    sfx(kind, v = 1) {
      if (!ctx || !started || !soundOn) return;
      switch (kind) {
        case 'fire': noise(0.12, 5200, 1400, 0.22, 'bandpass', 3); tone('square', 1500, 600, 0.05, 0.03); break; // line goes out
        case 'catch': tone('sine', 180, 90, 0.12, 0.18); noise(0.06, 900, 400, 0.08); break; // line bites
        case 'release': noise(0.32, 700, 2600, 0.22 * v, 'bandpass', 0.8); break; // whoosh up
        case 'perfect': noise(0.35, 900, 3200, 0.25, 'bandpass', 0.8); tone('triangle', 880, 1760, 0.18, 0.06); tone('triangle', 1320, 2640, 0.2, 0.04, sfxBus, 0.06); break;
        case 'dash': noise(0.3, 3000, 300, 0.3, 'bandpass', 1.2); tone('sawtooth', 220, 80, 0.2, 0.04); break;
        case 'zip': noise(0.5, 400, 3000, 0.18, 'bandpass', 2); break;
        case 'land': tone('sine', 140, 50, 0.18, 0.35 * v); noise(0.1, 1200, 300, 0.15 * v, 'lowpass'); break;
        case 'bounce': tone('sine', 110, 40, 0.35, 0.5); noise(0.25, 600, 120, 0.3, 'lowpass'); tone('square', 220, 180, 0.08, 0.04); break; // ドン
        case 'wall': noise(0.18, 2500, 900, 0.12, 'bandpass', 2); break;
        case 'kick': tone('sine', 200, 80, 0.12, 0.2); noise(0.15, 1500, 3000, 0.1); break;
        case 'ring': tone('triangle', 988, 988, 0.12, 0.08); tone('triangle', 1319, 1319, 0.2, 0.07, sfxBus, 0.07); break;
        case 'finish': [659, 784, 988, 1319].forEach((f, i) => tone('triangle', f, f, 0.35, 0.07, sfxBus, i * 0.09)); break;
        case 'crane': tone('sine', 1568, 1568, 0.25, 0.07); tone('sine', 2093, 2093, 0.35, 0.05, sfxBus, 0.08); break;
        case 'close': noise(0.2, 1800, 600, 0.12, 'bandpass', 1.5); break;
        case 'ui': tone('square', 1200, 1200, 0.03, 0.03); break;
        case 'uiback': tone('square', 700, 700, 0.04, 0.03); break;
        case 'chain': tone('triangle', 660 + Math.min(12, v) * 40, 660 + Math.min(12, v) * 40, 0.08, 0.04); break;
        default:
      }
    },
    dispose() { try { ctx && ctx.close(); } catch { /* closed */ } ctx = null; },
  };
}
