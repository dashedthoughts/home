// ITO engine: binds the pure simulation to WebGL, the camera, input, audio and the comic post pass.
//   createIto(canvas, { reduced, settings, onEvent, onHud, ghosts }) -> engine
import * as THREE from 'three';
import { createSim, STEP, MODE, RING_R } from './sim/index.js';
import { createBot, botStep } from './sim/bot.js';
import { perfectWindow } from './sim/physics.js';
import { assistCamera } from './sim/assist.js';
import { roofBelow, boxesInRect, segHitsBox } from './sim/city.js';
import { createCityView } from './render/city.js';
import { createHero } from './render/hero.js';
import { createFx } from './render/fx.js';
import { createPost } from './render/post.js';
import { skyMaterial, shared } from './render/materials.js';
import { createAudio } from './audio.js';

export const QUALITY = {
  low: { name: 'LOW', pixels: 0.42e6, dot: 5, hatch: 0, traffic: 0.5 },
  balanced: { name: 'BALANCED', pixels: 0.85e6, dot: 6, hatch: 1, traffic: 1 },
  high: { name: 'HIGH', pixels: 1.3e6, dot: 6.5, hatch: 1, traffic: 1 },
};
export const isPhone = () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 820;
export const resolveQuality = (q) => (QUALITY[q] ? q : isPhone() ? 'low' : 'balanced');

const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const cbuf = new Int32Array(256);

export function webglOk() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch { return false; }
}

export function createIto(canvas, opts = {}) {
  const onEvent = opts.onEvent || (() => {});
  const onHud = opts.onHud || (() => {});
  const reduced = !!opts.reduced;
  let settings = { quality: 'auto', sens: 1, invertY: false, assist: true, sound: true, music: true, ...(opts.settings || {}) };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.info.autoReset = false;
  renderer.autoClear = true;
  let lost = false;
  const onLost = (e) => { e.preventDefault(); lost = true; onEvent({ type: 'contextlost' }); };
  canvas.addEventListener('webglcontextlost', onLost);

  const sim = createSim();
  const S = sim.S;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(66, 1, 0.3, 3000);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), skyMaterial());
  sky.frustumCulled = false; sky.renderOrder = -1;
  scene.add(sky);
  let qName = resolveQuality(settings.quality);
  const cityView = createCityView(sim.city, scene, { trafficScale: QUALITY[qName].traffic });
  const hero = createHero(scene);
  const ghost = createHero(scene, { ghost: true });
  ghost.setVisible(false);
  const fx = createFx(scene, sim, { reduced });
  const post = createPost(renderer);
  if (reduced) { post.uniforms.uMis.value = 0; post.uniforms.uBoil.value = 0; shared.uFlicker.value = 0; }
  const audio = createAudio();
  audio.setSound(settings.sound); audio.setMusic(settings.music);

  // ---------- resolution + governor ----------
  let scale = 1, slowT = 0, fastT = 0, ema = 16;
  function pixelRatio() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    const fit = Math.sqrt(QUALITY[qName].pixels / (w * h));
    return Math.max(0.4, Math.min(window.devicePixelRatio || 1, 2, fit)) * scale;
  }
  function resize() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    const pr = pixelRatio();
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    const W = Math.floor(w * pr), H = Math.floor(h * pr);
    post.setSize(W, H);
    shared.uRes.value.set(W, H);
    shared.uDot.value = Math.max(3.5, (QUALITY[qName].dot * H) / 900);
    post.uniforms.uHatch.value = QUALITY[qName].hatch;
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---------- input ----------
  const keys = new Set();
  const latch = { swing: false, dash: false, zip: false }; // a tap shorter than one step still counts
  const inp = { mouseL: false, lockLook: false, dragLook: false, lastLook: -9, stickX: 0, stickY: 0, touch: { swing: false, dash: false, zip: false, dive: false } };
  const cam = { yaw: 0, pitch: -0.12, roll: 0, fov: 66, tx: 0, ty: 0, tz: 0, init: false, shake: 0 };
  const look = (dx, dy, k = 0.0024) => {
    cam.yaw -= dx * k * settings.sens;
    cam.pitch -= dy * k * settings.sens * (settings.invertY ? -1 : 1);
    cam.pitch = Math.max(-1.25, Math.min(0.95, cam.pitch));
    inp.lastLook = clock;
  };
  const KEYMAP = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, Space: 1, ShiftLeft: 1, ShiftRight: 1, KeyE: 1, KeyC: 1, ControlLeft: 1, ControlRight: 1, KeyQ: 1 };
  function onKey(e) {
    if (e.repeat && KEYMAP[e.code]) { e.preventDefault(); return; }
    if (e.type === 'keydown') {
      if (KEYMAP[e.code]) { keys.add(e.code); e.preventDefault(); audioKick(); if (e.code === 'Space') latch.swing = true; if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') latch.dash = true; if (e.code === 'KeyE' || e.code === 'KeyQ') latch.zip = true; }
      if (e.code === 'KeyR' && (phase === 'run' || phase === 'free')) { restart(); e.preventDefault(); }
      if (e.code === 'Escape' || e.code === 'KeyP') onEvent({ type: 'escape' });
    } else keys.delete(e.code);
  }
  function onMouseDown(e) {
    if (phase === 'title' || paused) return;
    audioKick();
    if (e.button === 0) { inp.mouseL = true; latch.swing = true; }
    if (e.button === 2) { inp.dragLook = true; e.preventDefault(); }
    if (e.button === 0 && !isPhone() && document.pointerLockElement !== canvas && canvas.requestPointerLock && opts.pointerLock !== false) {
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch { /* not allowed */ }
    }
  }
  function onMouseUp(e) { if (e.button === 0) inp.mouseL = false; if (e.button === 2) inp.dragLook = false; }
  function onMouseMove(e) {
    if (paused || phase === 'title') return;
    if (document.pointerLockElement === canvas) look(e.movementX, e.movementY);
    else if (inp.dragLook) look(e.movementX, e.movementY, 0.004);
  }
  const onCtx = (e) => e.preventDefault();
  function onBlur() { keys.clear(); inp.mouseL = false; inp.dragLook = false; }
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('contextmenu', onCtx);
  window.addEventListener('blur', onBlur);
  function audioKick() { if (!audio.started) audio.start(); }

  const pad = { swing: false, dash: false, zip: false, dive: false, mx: 0, my: 0, start: false, back: false };
  function pollPad(dt) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : null;
    let p = null;
    if (pads) for (let k = 0; k < pads.length; k++) if (pads[k] && pads[k].connected) { p = pads[k]; break; }
    if (!p) { pad.swing = pad.dash = pad.zip = pad.dive = false; pad.mx = pad.my = 0; return; }
    const dz = (v) => (Math.abs(v) > 0.15 ? v : 0);
    pad.mx = dz(p.axes[0] || 0); pad.my = -dz(p.axes[1] || 0);
    const rx = dz(p.axes[2] || 0), ry = dz(p.axes[3] || 0);
    if (rx || ry) look(rx * 900 * dt, ry * 700 * dt);
    const b = (i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.4));
    pad.swing = b(0) || b(7) || b(5);
    pad.dash = b(2) || b(4);
    pad.zip = b(3);
    pad.dive = b(1) || b(6);
    const start = b(9), back = b(8);
    if (start && !pad.start) onEvent({ type: 'escape' });
    if (back && !pad.back && (phase === 'run' || phase === 'free')) restart();
    pad.start = start; pad.back = back;
    if (pad.swing || pad.dash) audioKick();
  }

  function composeInput() {
    const I = sim.input;
    let mx = 0, my = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) my += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) my -= 1;
    mx += pad.mx + inp.stickX; my += pad.my + inp.stickY;
    I.mx = Math.max(-1, Math.min(1, mx)); I.my = Math.max(-1, Math.min(1, my));
    I.swing = keys.has('Space') || inp.mouseL || pad.swing || inp.touch.swing || latch.swing;
    I.dash = keys.has('ShiftLeft') || keys.has('ShiftRight') || pad.dash || inp.touch.dash || latch.dash;
    I.zip = keys.has('KeyE') || keys.has('KeyQ') || pad.zip || inp.touch.zip || latch.zip;
    latch.swing = latch.dash = latch.zip = false;
    I.dive = keys.has('KeyC') || keys.has('ControlLeft') || keys.has('ControlRight') || pad.dive || inp.touch.dive;
    I.yaw = cam.yaw; I.pitch = cam.pitch + 0.12;
    I.zipCone = phase === 'tutorial' && tut.step === 3 ? 0.72 : 0.9;
  }

  // ---------- phases ----------
  let phase = 'title'; // title | tutorial | run | free | results
  let paused = false, botOn = false, attract = false, freezeT = 0, clock = 0, acc = 0;
  const bot = createBot();
  let ghostFrames = null;
  const tut = { step: 0, done: false, t: 0 };
  let runIdx = 0;

  function snapCamera() {
    const pl = S.pl;
    cam.yaw = Math.atan2(-Math.sin(pl.yaw), -Math.cos(pl.yaw)) + 0; // behind the courier's facing
    cam.yaw = wrap(pl.yaw + Math.PI);
    cam.pitch = -0.12; cam.init = false;
    sim.input.yaw = cam.yaw;
  }
  function begin(p, n) {
    phase = p; paused = false; freezeT = 0; acc = 0;
    keys.clear(); inp.mouseL = false;
    fx.detach();
    if (p === 'run') { runIdx = n; sim.startRun(n); ghostFrames = (opts.ghosts && opts.ghosts[n]) || null; }
    else if (p === 'free') { sim.startFree(); ghostFrames = null; }
    else if (p === 'tutorial') { sim.startFree(); tut.step = 0; tut.done = false; tut.t = 0; ghostFrames = null; }
    else if (p === 'title') { sim.startRun(0); ghostFrames = null; }
    // runs, free roam and the tutorial start on the run-1 roof edge (free roam from the same view)
    const pl = S.pl;
    cam.yaw = wrap(pl.yaw + Math.PI); cam.pitch = p === 'run' || p === 'title' ? sim.runs[S.run.idx].start.pitch : -0.12; cam.init = false;
    inp.lastLook = clock; // hold that framing for a moment before the assist takes over
    sim.input.yaw = cam.yaw;
    Object.assign(bot, createBot());
    attract = p === 'title';
    botOn = attract;
    S.events.length = 0;
    void snapCamera;
  }
  function restart() {
    if (phase === 'run') begin('run', runIdx); else if (phase === 'free') begin('free'); else if (phase === 'tutorial') begin('tutorial');
    onEvent({ type: 'restart' });
  }

  // ---------- events -> feel ----------
  const hp = new THREE.Vector3();
  function handle(e) {
    const pl = S.pl;
    switch (e.type) {
      case 'attach': audio.sfx('fire'); setTimeout(() => audio.sfx('catch'), 90); fx.attach(pl.lx, pl.ly, pl.lz); break;
      case 'release':
        fx.detach();
        if (e.rising) fx.sticker(e.perfect ? 'perfect' : 'shu', pl.x, pl.y + 1.6, pl.z, e.perfect ? 1.1 : 1);
        audio.sfx(e.perfect ? 'perfect' : 'release', Math.min(1, e.speed / 40));
        if (e.perfect && !reduced && !botOn) freezeT = 0.12;
        if (phase === 'tutorial' && tut.step === 1 && e.lineT > 0.35) tutNext();
        break;
      case 'dash': fx.detach(); fx.sticker('byun', pl.x, pl.y + 1.2, pl.z, 1.0); audio.sfx('dash'); if (phase === 'tutorial' && tut.step === 2) tutNext(); break;
      case 'zip': fx.attach(pl.zx, pl.zy, pl.zz); audio.sfx('zip'); break;
      case 'perch': fx.detach(); fx.sticker('suta', pl.x, pl.y + 1.5, pl.z, 0.92); if (phase === 'tutorial' && tut.step === 3) tutNext(); break;
      case 'land': if (e.hard) { fx.sticker('don', pl.x, pl.y + 1.2, pl.z, 1.08); cam.shake = reduced ? 0 : 0.25; } audio.sfx('land', e.hard ? 1 : 0.5); fx.detach(); break;
      case 'bounce': fx.detach(); fx.sticker('don', pl.x, pl.y + 2, pl.z, 1.33); audio.sfx('bounce'); cam.shake = reduced ? 0 : 0.45; break;
      case 'wall': fx.detach(); fx.sticker('zaza', pl.x, pl.y + 1.2, pl.z, 0.83); audio.sfx('wall'); break;
      case 'kick': audio.sfx('kick'); break;
      case 'vault': audio.sfx('kick'); break;
      case 'close': audio.sfx('close'); break;
      case 'ring': audio.sfx(e.last ? 'finish' : 'ring'); break;
      case 'crane': audio.sfx('crane'); fx.sticker('crane', pl.x, pl.y + 1.8, pl.z, 0.92); break;
      case 'style': if (e.chain >= 3) audio.sfx('chain', e.chain); break;
      case 'finish': phase = 'results'; break;
      default:
    }
    if (e.type === 'attach' && phase === 'tutorial' && tut.step === 0) tut.wait = true;
    onEvent(e);
    void hp;
  }
  function tutNext() {
    tut.step++;
    onEvent({ type: 'tut', step: tut.step });
    if (tut.step >= 4) { tut.done = true; }
  }

  // ---------- camera ----------
  // fraction (0..1) of the way from the courier to a camera `dist` away along -f before it touches a building
  function castCam(fx, fy, fz, dist) {
    const dx = -fx * dist, dy = -fy * dist + 0.9, dz = -fz * dist;
    const px = cam.tx + dx, pz = cam.tz + dz;
    const n = boxesInRect(sim.city, Math.min(cam.tx, px) - 1, Math.min(cam.tz, pz) - 1, Math.max(cam.tx, px) + 1, Math.max(cam.tz, pz) + 1, cbuf);
    let tHit = 1;
    for (let k = 0; k < n; k++) {
      const b = sim.city.boxes[cbuf[k]];
      if (!segHitsBox(b, cam.tx, cam.ty, cam.tz, dx, dy, dz, 0.45, 0, tHit)) continue;
      let lo = 0, hi = tHit;
      for (let it = 0; it < 12; it++) { const m = (lo + hi) / 2; if (segHitsBox(b, cam.tx, cam.ty, cam.tz, dx, dy, dz, 0.45, 0, m)) hi = m; else lo = m; }
      tHit = Math.max(0.05, lo * 0.96);
    }
    if (cam.ty + dy * tHit < 1.2) tHit = Math.min(tHit, Math.max(0.05, (cam.ty - 1.2) / Math.max(1e-3, -dy)));
    return tHit;
  }
  const tmpV = new THREE.Vector3(), fwd = new THREE.Vector3(), lookAt = new THREE.Vector3();
  function updateCamera(dt, hx, hy, hz) {
    const pl = S.pl;
    const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
    // follow the courier with a little lag; the swing stays inside the frame
    if (!cam.init) { cam.tx = hx; cam.ty = hy + 1; cam.tz = hz; cam.init = true; }
    const lag = 1 - Math.exp(-dt * (phase === 'results' ? 2 : 16));
    cam.tx += (hx - cam.tx) * lag; cam.ty += (hy + 1.0 - cam.ty) * lag; cam.tz += (hz - cam.tz) * lag;
    // auto-follow: when nobody is steering the camera, ease it behind the travel direction
    const manualRecent = clock - inp.lastLook < 1.1;
    const heading = Math.atan2(-pl.vx, -pl.vz);
    const hs = Math.hypot(pl.vx, pl.vz);
    if (botOn) cam.yaw += wrap(sim.input.yaw - cam.yaw) * Math.min(1, dt * 5);
    else if (settings.assist && !manualRecent && phase !== 'results') {
      const ring = S.run && !S.run.done && phase === 'run' ? sim.runs[S.run.idx].rings[S.run.next] : null;
      if (hs > 6 || (ring && pl.mode !== MODE.GROUND)) assistCamera(cam, pl, dt, ring);
    }
    if (phase === 'results') cam.yaw += dt * 0.15;
    const dist = 4.9 + Math.min(sp, 60) * 0.03 + (pl.mode === MODE.GROUND ? -0.4 : 0) + (camera.aspect < 1 ? 2.2 * (1 - camera.aspect) : 0);
    // never clip into buildings: cast from the courier to the camera and pull in; if that leaves the camera
    // inside the courier's shoulders, try a higher and a sideways angle instead
    let best = null;
    for (let c = 0; c < 6; c++) {
      const yaw = cam.yaw + (c === 2 ? 0.55 : c === 3 ? -0.55 : c === 4 ? 1.1 : 0) - (c === 5 ? 0 : 0);
      const pitch = c === 0 ? cam.pitch : c === 5 ? -1.3 : Math.min(cam.pitch, -0.75);
      const cp = Math.cos(pitch), spi = Math.sin(pitch);
      const fx = -Math.sin(yaw) * cp, fy = spi, fz = -Math.cos(yaw) * cp;
      const tHit = castCam(fx, fy, fz, dist);
      if (!best || tHit * dist > best.d + 0.3) best = { d: tHit * dist, t: tHit, fx, fy, fz, c };
      if (tHit * dist > 2.8) break;
    }
    fwd.set(best.fx, best.fy, best.fz);
    const tHit = best.t;
    const dx = -fwd.x * dist, dy = -fwd.y * dist + 0.9, dz = -fwd.z * dist;
    // pull in at once when a wall demands it, ease back out slowly (no snap from 1 m to 4 m)
    const want = tHit;
    cam.t = cam.t === undefined ? want : want < cam.t ? want : cam.t + (want - cam.t) * Math.min(1, dt * 2.5);
    let px = cam.tx + dx * cam.t, py = Math.max(1.0, cam.ty + dy * cam.t), pz = cam.tz + dz * cam.t;
    // switching between fallback angles is smoothed too
    if (best.c !== cam.lastC && cam.px !== undefined) cam.blend = 1;
    cam.blend = Math.max(0, (cam.blend || 0) - dt * 3.5);
    if (cam.blend > 0) { const k = cam.blend * cam.blend; px += (cam.px - px) * k; py += (cam.py - py) * k; pz += (cam.pz - pz) * k; }
    cam.lastC = best.c;
    cam.px = px; cam.py = py; cam.pz = pz;
    if (cam.shake > 0) { cam.shake -= dt; const a = cam.shake * 0.6; px += (Math.random() - 0.5) * a; py += (Math.random() - 0.5) * a; }
    camera.position.set(px, py, pz);
    // portrait screens: frame the courier higher, above the thumbs
    const lift = camera.aspect < 1 ? -1.1 * (1 - camera.aspect) - 0.2 : 0.3;
    lookAt.set(cam.tx + fwd.x * 6, cam.ty + fwd.y * 6 + lift, cam.tz + fwd.z * 6);
    camera.lookAt(lookAt);
    // dutch angle on hard arcs: lean with the line
    let roll = 0;
    if (!reduced && pl.mode === MODE.SWING) {
      tmpV.set(pl.ax - pl.x, 0, pl.az - pl.z);
      const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
      const lat = (tmpV.x * rx + tmpV.z * rz) / Math.max(pl.L, 1);
      roll = Math.max(-0.12, Math.min(0.12, -lat * 0.25 * Math.min(1, sp / 30)));
    }
    cam.roll += (roll - cam.roll) * Math.min(1, dt * 3);
    camera.rotateZ(cam.roll);
    const wantFov = 62 + Math.max(0, Math.min(1, (sp - 14) / 44)) * (reduced ? 8 : 12);
    cam.fov += (wantFov - cam.fov) * Math.min(1, dt * 2.5);
    if (Math.abs(camera.fov - cam.fov) > 0.05) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
  }

  // ---------- one fixed step ----------
  function simStep() {
    if (botOn) {
      if (!S.run || S.run.done) { if (attract) { sim.startRun((S.run ? S.run.idx + 1 : 0) % 3); Object.assign(bot, createBot()); } }
      botStep(bot, sim, sim.input, STEP);
    } else composeInput();
    sim.step();
    for (let k = 0; k < S.events.length; k++) handle(S.events[k]);
    S.events.length = 0;
    if (phase === 'tutorial') {
      tut.t += STEP;
      if (tut.step === 0 && S.pl.mode === MODE.SWING && S.pl.lineT > 0.5) tutNext();
    }
  }

  // ---------- render one frame ----------
  const handPos = new THREE.Vector3(), aimPos = new THREE.Vector3(), zipPos = new THREE.Vector3(), lineAnchor = new THREE.Vector3();
  let hudT = 0;
  function draw(dt, alpha, camDone = false) {
    const pl = S.pl;
    const x = pl.px + (pl.x - pl.px) * alpha, y = pl.py + (pl.y - pl.py) * alpha, z = pl.pz + (pl.z - pl.pz) * alpha;
    const t = S.t;
    shared.uTime.value = t;
    if (!camDone) updateCamera(dt, x, y, z);
    shared.uCamPos.value.copy(camera.position);
    hero.update(pl, x, y, z, t);
    hero.root.updateMatrixWorld(true);
    hero.handWorld(pl.mode === MODE.ZIP ? 1 : pl.hand, handPos);
    // ghost of the best run
    if (ghostFrames && phase === 'run' && S.run && S.run.started) {
      const f = S.run.t * 10, i = Math.floor(f), k = f - i, G = ghostFrames, m = G.length / 5;
      if (i + 1 < m) {
        const a = i * 5, b = a + 5;
        const gx = (G[a] + (G[b] - G[a]) * k) / 10, gy = (G[a + 1] + (G[b + 1] - G[a + 1]) * k) / 10, gz = (G[a + 2] + (G[b + 2] - G[a + 2]) * k) / 10;
        const gp = { mode: G[a + 4], vx: (G[b] - G[a]), vy: (G[b + 1] - G[a + 1]), vz: (G[b + 2] - G[a + 2]), yaw: G[a + 3] / 100, ax: gx, ay: gy + 30, az: gz, L: 30, x: gx, y: gy, z: gz, hand: 1, side: 1, rollT: 0, landT: 9, dashT: 9, releaseT: 9, kickT: 9, dive: false, wnx: 0, wnz: 1, zx: gx, zy: gy, zz: gz };
        ghost.setVisible(true);
        ghost.update(gp, gx, gy, gz, t);
      } else ghost.setVisible(false);
    } else ghost.setVisible(false);
    // reticles (only while you could use them)
    const playing = phase === 'run' || phase === 'free' || phase === 'tutorial';
    const A = sim.city.anchors;
    const showAim = playing && pl.aim >= 0 && pl.mode !== MODE.SWING && pl.mode !== MODE.ZIP;
    if (showAim) aimPos.set(A[pl.aim * 4], A[pl.aim * 4 + 1], A[pl.aim * 4 + 2]);
    const PR = sim.city.perches;
    const showZip = playing && pl.zipAim >= 0 && pl.mode !== MODE.ZIP;
    if (showZip) zipPos.set(PR[pl.zipAim * 4], PR[pl.zipAim * 4 + 1] + 1.2, PR[pl.zipAim * 4 + 2]);
    if (pl.mode === MODE.SWING) lineAnchor.set(pl.lx, pl.ly, pl.lz); else if (pl.mode === MODE.ZIP) lineAnchor.set(pl.zx, pl.zy, pl.zz);
    let rings = null;
    if (S.run && !S.run.done && (phase === 'run' || phase === 'title')) { const R = sim.runs[S.run.idx].rings; rings = { next: R[S.run.next], after: R[S.run.next + 1] }; }
    const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
    fx.update({ cue: playing && !reduced ? perfectWindow(pl) : false, cueStatic: playing && reduced && perfectWindow(pl), camera, dt, t, pl, handPos, aimPos: showAim ? aimPos : null, zipPos: showZip ? zipPos : null, rings, cranesHidden: phase === 'free' ? S.cranes : true, roofY: roofBelow(sim.city, x, z, y), speed: sp, hx: x, hy: y, hz: z, lineAnchor: pl.mode === MODE.SWING || pl.mode === MODE.ZIP ? lineAnchor : null });
    cityView.update(t, dt);
    // post uniforms
    post.uniforms.uTime.value = t;
    post.uniforms.uFrame.value = Math.floor(t * 12);
    post.uniforms.uSpeed.value = reduced ? 0 : Math.max(0, Math.min(1, (sp - 34) / 26));
    post.uniforms.uPanel.value = freezeT > 0 ? 1 : 0;
    renderer.info.reset();
    post.render(scene, camera);
    // HUD at ~30 Hz
    hudT -= dt;
    if (hudT <= 0) { hudT = 1 / 30; onHud(hudData(sp)); }
  }
  const proj = new THREE.Vector3();
  function hudData(sp) {
    const pl = S.pl;
    const d = { phase, speed: sp, dash: pl.dash, mode: pl.mode, chain: S.style.chain, score: S.style.score, cranes: S.craneCount, totalCranes: sim.cranes.length, tut: tut.step, canZip: pl.zipAim >= 0, canSwing: pl.aim >= 0 || pl.mode === MODE.SWING, noLine: (phase === 'run' || phase === 'free' || phase === 'tutorial') && pl.mode === MODE.AIR && pl.aim < 0 && pl.zipAim < 0 };
    if (S.run) {
      d.t = S.run.t; d.ring = S.run.next; d.rings = sim.runs[S.run.idx].rings.length; d.run = S.run.idx; d.started = S.run.started;
      const q = sim.runs[S.run.idx].rings[S.run.next];
      if (q && !S.run.done) {
        d.dist = Math.hypot(q.x - pl.x, q.y - pl.y, q.z - pl.z);
        proj.set(q.x, q.y, q.z).project(camera);
        const behind = proj.z > 1;
        let sx = proj.x, sy = proj.y;
        if (behind) { sx = -sx; sy = -sy; }
        d.on = !behind && Math.abs(sx) < 0.92 && Math.abs(sy) < 0.88;
        d.sx = sx; d.sy = sy;
        d.rr = RING_R / Math.max(1, d.dist * Math.tan((camera.fov * Math.PI) / 360));
        d.ang = Math.atan2(sy, sx);
      }
    }
    return d;
  }

  // ---------- loop ----------
  let raf = 0, last = 0, running = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (lost) return;
    const real = Math.min(0.1, Math.max(0, (now - last) / 1000 || 0));
    last = now;
    clock += real;
    // governor: watch the real frame time, scale resolution in steps
    ema += (real * 1000 - ema) * 0.05;
    if (settings.quality === 'auto') {
      if (ema > 22) { slowT += real; fastT = 0; } else if (ema < 14) { fastT += real; slowT = 0; } else { slowT = Math.max(0, slowT - real); fastT = Math.max(0, fastT - real); }
      if (slowT > 2 && scale > 0.55) { scale = Math.max(0.55, scale * 0.85); slowT = 0; resize(); }
      if (fastT > 6 && scale < 1) { scale = Math.min(1, scale * 1.1); fastT = 0; resize(); }
    }
    pollPad(real);
    if (!paused && phase !== 'results') {
      if (freezeT > 0) freezeT -= real;
      else {
        acc += real;
        let n = 0;
        while (acc >= STEP && n < 12) { simStep(); acc -= STEP; n++; }
        if (n === 12) acc = 0;
      }
    }
    audio.update(Math.hypot(S.pl.vx, S.pl.vy, S.pl.vz), S.pl.mode === MODE.SWING ? Math.min(1, Math.hypot(S.pl.vx, S.pl.vy, S.pl.vz) / 45) : 0, !paused && phase !== 'title', real);
    draw(real, Math.min(1, acc / STEP));
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function onVis() { if (document.hidden) { if (phase !== 'title' && phase !== 'results' && !paused) onEvent({ type: 'escape', hidden: true }); audio.suspend(); } else audio.resume(); }
  document.addEventListener('visibilitychange', onVis);

  begin('title');
  start();

  const engine = {
    sim, S, camera, renderer, scene,
    get phase() { return phase; },
    get paused() { return paused; },
    begin, restart,
    pause(on) {
      paused = on;
      keys.clear(); inp.mouseL = false;
      if (on && document.pointerLockElement === canvas) document.exitPointerLock?.();
    },
    setSettings(s) {
      const q0 = qName;
      settings = { ...settings, ...s };
      audio.setSound(settings.sound); audio.setMusic(settings.music);
      qName = resolveQuality(settings.quality);
      if (q0 !== qName || s.quality) { scale = 1; resize(); }
    },
    get settings() { return settings; },
    audioStart: audioKick,
    sfx: (k) => audio.sfx(k),
    touch: {
      stick(x, y) { inp.stickX = x; inp.stickY = y; },
      look(dx, dy) { look(dx, dy, 0.005); },
      button(name, down) { inp.touch[name] = down; if (down) { audioKick(); if (name in latch) latch[name] = true; } },
    },
    tutorial: tut,
    setGhosts(g) { opts.ghosts = g; },
    // ---- test hook ----
    advance(sec) {
      const n = Math.round(sec / STEP);
      for (let k = 0; k < n; k++) {
        if (freezeT > 0) freezeT -= STEP;
        else if (phase !== 'results' && !paused) simStep();
        clock += STEP;
        const pl = S.pl;
        updateCamera(STEP, pl.x, pl.y, pl.z);
      }
      acc = 0;
      draw(Math.max(STEP, sec), 1, true);
      return engine.state();
    },
    freeze(t) { freezeT = t; draw(0, 1);
    },
    bot(on) { botOn = !!on; Object.assign(bot, createBot()); },
    look: (yaw, pitch) => { cam.yaw = yaw; if (pitch !== undefined) cam.pitch = pitch; inp.lastLook = clock; },
    state() {
      const pl = S.pl;
      return { phase, paused, t: S.t, mode: ['air', 'swing', 'wall', 'ground', 'zip'][pl.mode], pos: [pl.x, pl.y, pl.z], vel: [pl.vx, pl.vy, pl.vz], speed: Math.hypot(pl.vx, pl.vy, pl.vz), aim: pl.aim, zipAim: pl.zipAim, dash: pl.dash, run: S.run ? { idx: S.run.idx, t: S.run.t, next: S.run.next, done: S.run.done, rings: sim.runs[S.run.idx].rings.length } : null, chain: S.style.chain, cranes: S.craneCount, tut: tut.step, quality: qName, scale, fps: Math.round(1000 / ema) };
    },
    stats() { return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, pixels: Math.round(post.rt.width * post.rt.height) }; },
    dispose() {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('mousedown', onMouseDown); window.removeEventListener('mouseup', onMouseUp); window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('contextmenu', onCtx); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (document.pointerLockElement === canvas) document.exitPointerLock?.();
      fx.dispose(); hero.dispose(); ghost.dispose(); cityView.dispose(); post.dispose();
      sky.geometry.dispose(); sky.material.dispose();
      audio.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
  return engine;
}
