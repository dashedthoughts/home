// REDLINE engine: binds the simulation, the WebGL world, post-processing, audio and input.
//   createRedline(canvas, { mode: 'attract' | 'play', config, lite, reducedMotion, onTick, onEvent })
import * as THREE from 'three';
import { createSim, MAX } from './sim.js';
import { createWorld } from './render/world.js';
import { createPost } from './render/post.js';
import { createAudio } from './audio.js';
import { DEFAULT_CONFIG, QUALITY, resolveQuality } from './config.js';

let audioSingleton = null;
export const getAudio = () => (audioSingleton ||= createAudio());

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

const STEP = 1 / 120;

export function createRedline(canvas, opts = {}) {
  const onTick = opts.onTick || (() => {});
  const onEvent = opts.onEvent || (() => {});
  const lite = !!opts.lite; // hero backdrop: cheaper settings
  const reduced = !!opts.reducedMotion;
  let cfg = { ...DEFAULT_CONFIG, ...(opts.config || {}) };
  if (reduced) cfg.effects = 'reduced';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false, depth: true });
  // if the GPU driver resets, don't leave a dead black canvas: tell the shell so it can rebuild
  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; onEvent({ type: 'context-lost' }); });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const exposure = () => 0.88 * (cfg.weather === 'rain' ? 0.8 : 1); // rain is bright: take it down to 80%
  renderer.toneMappingExposure = exposure();
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const audio = lite ? null : getAudio();
  const sim = createSim({ mode: opts.mode || 'attract', config: cfg, onEvent: handle });
  const world = createWorld(renderer, cfg);

  // ---- resolution: device ratio capped by quality, then adapted to hold frame rate ----
  let effective = resolveQuality(cfg.quality);
  const q = () => QUALITY[effective];
  let scale = 1; // dynamic resolution multiplier (0.7..1), changed rarely and smoothly
  const pixelRatio = () => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    const budget = lite ? 0.4e6 : q().pixels;
    const fit = Math.sqrt(budget / (w * h));
    return Math.max(0.45, Math.min(window.devicePixelRatio || 1, fit)) * scale;
  };
  renderer.setPixelRatio(pixelRatio());
  let post = createPost(renderer, world.scene, world.camera, { samples: lite ? 0 : q().samples, bloom: lite ? 0.3 : q().bloom });

  function resize() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, false);
    post.setSize(w, h);
    world.resize(w, h);
  }
  world.applyQuality(lite ? { ...QUALITY.low, extras: false } : q());
  // compile every shader up front (including things that appear later: tunnel, finale), so nothing hitches mid-run
  try { world.precompile(renderer); } catch { /* best effort */ }
  function rebuildPost() {
    post.dispose();
    renderer.setPixelRatio(pixelRatio());
    post = createPost(renderer, world.scene, world.camera, { samples: lite ? 0 : q().samples, bloom: lite ? 0.3 : q().bloom });
    world.applyQuality(lite ? { ...QUALITY.low, extras: false } : q());
    resize();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- events: game feel lives here (sound + particles), then forwarded to the UI ----
  function handle(e) {
    const S = sim.S;
    switch (e.type) {
      case 'shard': world.burst('shard', e.x); audio?.sfx('shard', e.chain); break;
      case 'casefile': world.burst('file', S.x); audio?.sfx('file'); break;
      case 'nearmiss': audio?.sfx('nearmiss'); break;
      case 'slipstream': world.burst('slip', S.x); audio?.sfx('slip'); break;
      case 'hit': world.burst('crash', e.x, e); audio?.sfx('crash', e.sev); break;
      case 'slam': world.burst('slam', e.x); audio?.sfx('crash', 0.4); break;
      case 'bump': world.burst('bump', e.x); audio?.sfx('scrape'); break;
      case 'parried': audio?.sfx('ui'); break;
      case 'blocked': audio?.sfx('count'); break;
      case 'sprint': audio?.sfx('go'); break;
      case 'scrape': audio?.sfx('scrape'); break;
      case 'strike': world.burst('strike', e.x); audio?.sfx('hit'); break;
      case 'struck': world.burst('strike', e.x); audio?.sfx('scrape'); break;
      case 'whiff': audio?.sfx('ui'); break;
      case 'police': audio?.sfx('glitch'); break;
      case 'power': world.burst(e.kind, e.x); audio?.sfx(e.kind === 'nitro' ? 'slip' : 'file'); break;
      case 'busted': world.burst('hit', S.x); audio?.sfx('hit'); break;
      case 'escaped': audio?.sfx('file'); break;
      case 'glitch': audio?.sfx('glitch'); break;
      case 'count': audio?.sfx('count'); break;
      case 'go': audio?.sfx('go'); break;
      case 'over': audio?.sfx('over'); break; // the music plays on through the results
      case 'junction': audio?.sfx('slip'); break;
      case 'finale': audio?.sfx('file'); break;
      case 'complete': audio?.engine(false, 0, false); break;
      default:
    }
    onEvent(e);
  }

  // ---- gamepad ----
  let padStart = false;
  function pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : null;
    let p = null;
    if (pads) for (let k = 0; k < pads.length; k++) if (pads[k] && pads[k].connected) { p = pads[k]; break; }
    if (!p) return null;
    const ax = Math.abs(p.axes[0]) > 0.15 ? p.axes[0] : 0;
    const b = (i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.3));
    const start = b(9);
    if (start && !padStart) onEvent({ type: 'pad-start' });
    padStart = start;
    return { axis: ax + (b(15) ? 1 : 0) - (b(14) ? 1 : 0), boost: b(0) || b(7) || b(5), brake: b(1) || b(6) || b(4) };
  }

  // ---- loop ----
  let raf = 0, running = false, paused = false, last = 0, acc = 0, tick = 0;
  let frameAvg = 16, slowFor = 0, fastFor = 0, lastScaleChange = 0;
  const fx = { full: cfg.effects !== 'reduced', view: opts.view || 'chase', cam: 'chase' };
  const keyInput = { left: false, right: false, boost: false, brake: false, strike: false, wheelie: false };

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dtRaw = Math.min(0.1, (now - last) / 1000 || 0.016);
    last = now;
    if (paused || lost) return;

    // input merge (keys + touch + pad); attract mode drives itself
    if (sim.mode === 'play') {
      const pad = pollPad();
      sim.input.left = keyInput.left;
      sim.input.right = keyInput.right;
      sim.input.boost = keyInput.boost || !!pad?.boost;
      sim.input.brake = keyInput.brake || !!pad?.brake;
      // one-shot actions: a press fires once
      if (keyInput.strike) { sim.input.strike = true; keyInput.strike = false; }
      if (keyInput.wheelie) { sim.input.wheelie = true; keyInput.wheelie = false; }
      sim.input.axis = pad ? pad.axis : 0;
    }

    acc += Math.min(dtRaw, 0.05);
    if (fx.view === 'showroom') acc = 0; // parked: the world holds still, only the camera moves
    while (acc >= STEP) { sim.step(STEP); acc -= STEP; }
    const dt = Math.min(dtRaw, 0.05);
    const S = sim.S;
    fx.full = cfg.effects !== 'reduced';
    world.update(sim, dt, fx);

    const L = post.lens;
    const sp = S.speed / MAX;
    L.uTime.value += dt;
    // effects stay in the background: lighter speed blur, softer glitch and flash
    L.uSpeed.value = fx.full ? sp * 0.6 : 0;
    L.uGlitch.value = S.glitch > 0 ? (fx.full ? 0.3 + 0.2 * Math.random() : 0) : 0;
    L.uFlash.value = fx.full && S.flash > 0 ? S.flash * 0.9 : 0;
    L.uBoost.value = S.slip > 0 ? Math.min(1, S.slip) : 0;
    const linesT = !lite && fx.full && fx.view !== 'showroom' && (S.overclock || S.slip > 0) ? Math.min(1, (sp - 0.7) * 2.5) : 0;
    if (S.inTunnel && fx.full) L.uSpeed.value *= 1.35; // walls close in: the tunnel reads faster
    if (lite) L.uSpeed.value *= 0.55;
    L.uLines.value += (Math.max(0, linesT) - L.uLines.value) * Math.min(1, dt * 6);
    if (fx.view === 'showroom') L.uSpeed.value = 0;
    // the hero backdrop only needs 30fps: render every other frame, keep the sim at full rate
    if (!lite || tick % 2 === 0) post.render(dt);

    if (audio && sim.mode === 'play') { audio.engine(S.count <= 0 && !S.over, sp, S.overclock); audio.tunnel(!!S.inTunnel && !S.over); }

    // dynamic resolution: keep ~60fps, recover when there's headroom
    frameAvg += (dtRaw * 1000 - frameAvg) * 0.03;
    if (frameAvg > 21) { slowFor += dtRaw; fastFor = 0; } else if (frameAvg < 15) { fastFor += dtRaw; slowFor = 0; } else { slowFor = fastFor = 0; }
    if (now - lastScaleChange > 5000) {
      if (slowFor > 2.5 && scale > 0.7) { scale = Math.max(0.7, scale - 0.1); slowFor = 0; lastScaleChange = now; resize(); }
      else if (slowFor > 3 && cfg.quality === 'auto' && effective !== 'low' && !lite) {
        // AUTO governor: still slow at the lowest resolution step, so drop to LOW for this device
        effective = 'low'; scale = 1; slowFor = 0; lastScaleChange = now;
        rebuildPost();
        onEvent({ type: 'quality-auto', to: 'low' });
      }
      else if (fastFor > 8 && scale < 1) { scale = Math.min(1, scale + 0.1); fastFor = 0; lastScaleChange = now; resize(); }
    }

    if (++tick % 6 === 0) emitTick();
  }

  function emitTick() {
    const S = sim.S;
    onTick({
      score: Math.round(S.score),
      kmh: Math.round(S.speed * 3.6),
      heat: Math.round(S.heat),
      glitch: S.glitch > 0,
      overclock: !!S.overclock,
      slip: S.slip > 0,
      draft: S.draft,
      lives: S.lives,
      maxLives: S.maxLives,
      shards: S.shards,
      files: S.files,
      chain: S.chain,
      mult: 1 + Math.min(4, Math.floor(S.chain / 6)),
      nearMisses: S.nearMisses,
      count: S.count,
      over: S.over,
      km: (S.dist / 1000).toFixed(1),
      route: S.route,
      sector: S.sector,
      toJunction: Math.max(0, Math.round(S.nextJunction - S.z)),
      finale: S.finale,
      // a turn is coming when the road ahead bends hard and differently from where we are now
      bend: (() => { if (S.finale) return 0; const ahead = sim.curveAt(S.z + 170), now = sim.curveAt(S.z); return Math.abs(ahead) > 0.3 && Math.abs(ahead - now) > 0.3 ? Math.sign(ahead) * Math.min(3, Math.ceil(Math.abs(ahead) * 3)) : 0; })(),
      cam: fx.cam,
      race: cfg.race !== false,
      wanted: Math.floor((S.wanted || 0) + 1e-6),
      heatOnYou: Math.min(1, (S.wanted || 0) % 1 || (S.wanted >= 3 ? 1 : 0)),
      wet: !!S.wet, aqua: S.aqua > 0.5, tunnel: !!S.inTunnel, sprint: !!S.sprint, zen: !!cfg.zen,
      ghost: S.ghost > 0 ? Math.ceil(S.ghost) : 0,
      beside: !!(cfg.race !== false && S.rival && ((Math.abs(S.rival.z - S.z) < 6 && Math.abs(S.rival.x - S.x) < 4.4) || (S.cops || []).some((k) => Math.abs(k.z - S.z) < 6 && Math.abs(k.x - S.x) < 4.4)) && S.strikeCd <= 0),
      copGap: S.cops && S.cops.length ? Math.round(Math.min(...S.cops.map((k) => S.z - k.z))) : null,
      cops: S.cops ? S.cops.length : 0,
      bust: Math.min(1, S.bust || 0),
      swarm: (S.swarmT || 0) > 0,
      pos: S.pos,
      rivalGap: Math.round(S.rival ? S.rival.z - S.z : 0),
    });
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // reduced motion on the hero: render one still frame and stop
  if (reduced && sim.mode === 'attract') {
    for (let i = 0; i < 30; i++) sim.step(STEP);
    world.update(sim, 0.016, { full: false });
    post.render(0.016);
  }

  const api = {
    input: keyInput,
    start() {
      if (reduced && sim.mode === 'attract') return;
      start();
    },
    pause() { paused = true; audio?.engine(false, 0, false); },
    resume() { if (!running) start(); paused = false; last = performance.now(); },
    isPaused: () => paused,
    restart() {
      Object.keys(keyInput).forEach((k) => (keyInput[k] = false));
      sim.reset();
      paused = false;
      if (!running) start();
      emitTick();
    },
    cycleCam() {
      const order = ['chase', 'far', 'bumper'];
      fx.cam = order[(order.indexOf(fx.cam) + 1) % order.length];
      emitTick();
      return fx.cam;
    },
    orbit(a) { fx.orbit = a; },
    get scene() { return world.scene; }, // test hook // test hook: freeze the showroom camera at an angle (null = orbit)
    setView(v) {
      fx.view = v;
      if (v === 'showroom') {
        sim.S.speed = 0;
        sim.S.x = 0;
        sim.S.vx = 0;
        sim.S.overclock = false;
        sim.S.slip = 0;
        sim.S.cars.length = 0;
        sim.S.shardList.length = 0;
      }
    },
    setMode(m) {
      sim.setMode(m);
      if (m === 'play' && audio) {
        audio.unlock();
        audio.configure({ sound: cfg.sound, music: (cfg.music && cfg.radio === 'synth'), volume: cfg.volume });
        if ((cfg.music && cfg.radio === 'synth')) audio.musicStart();
      }
      if (m !== 'play') audio?.engine(false, 0, false); // engine note off; music keeps going in the menus
    },
    configure(next) {
      const prevQ = cfg.quality;
      cfg = { ...cfg, ...next };
      if (reduced) cfg.effects = 'reduced';
      renderer.toneMappingExposure = exposure();
      sim.configure(cfg);
      world.applyConfig(cfg);
      if (audio) {
        audio.configure({ sound: cfg.sound, music: (cfg.music && cfg.radio === 'synth'), volume: cfg.volume });
        if (sim.mode === 'play' && !sim.S.over) (cfg.music && cfg.radio === 'synth') ? audio.musicStart() : audio.musicStop();
      }
      if (prevQ !== cfg.quality) {
        effective = resolveQuality(cfg.quality);
        scale = 1;
        rebuildPost();
      }
      if (!running || paused) { world.update(sim, 0, fx); post.render(0); }
    },
    // test hook: advance the simulation by `sec` seconds, then draw one frame
    advance(sec) {
      if (fx.view === 'showroom') sec = 0;
      Object.assign(sim.input, { left: keyInput.left, right: keyInput.right, boost: keyInput.boost, brake: keyInput.brake });
      if (keyInput.strike) { sim.input.strike = true; keyInput.strike = false; }
      if (keyInput.wheelie) { sim.input.wheelie = true; keyInput.wheelie = false; }
      const n = Math.round(sec / STEP);
      for (let i = 0; i < n; i++) {
        sim.step(STEP);
        if (i % 12 === 0) world.update(sim, STEP * 12, fx);
      }
      world.update(sim, 0.016, fx);
      post.render(0.016);
      emitTick();
    },
    uiSound(name) { audio?.unlock(); audio?.sfx(name); },
    state: () => sim.S,
    drawList: () => {
      const rows = {};
      world.scene.traverseVisible((o) => {
        if (!(o.isMesh || o.isLine || o.isPoints)) return;
        const k = (o.material?.type || '?') + (o.isInstancedMesh ? ' (instanced)' : '');
        rows[k] = rows[k] || { n: 0, tris: 0 };
        rows[k].n++;
        const g = o.geometry, idx = g.index ? g.index.count : g.attributes.position.count;
        rows[k].tris += Math.round((idx / 3) * (o.isInstancedMesh ? o.count : 1));
      });
      return rows;
    },
    quality: () => effective,
    stats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, programs: renderer.info.programs?.length, pixelRatio: +renderer.getPixelRatio().toFixed(2), size: [canvas.width, canvas.height] }),
    get lens() { return post.lens; },
    get mode() { return sim.mode; },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      audio?.engine(false, 0, false);
      audio?.musicStop();
      post.dispose();
      world.dispose();
      renderer.dispose();
    },
  };
  if (fx.view === 'showroom') api.setView('showroom');
  return api;
}
