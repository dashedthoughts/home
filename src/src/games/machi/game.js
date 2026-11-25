// MACHI controller: owns the world, editor, walker, renderer, sim (train, cat, petals, time) and input.
import * as THREE from 'three';
import { Renderer, QUALITY } from './render/engine.js';
import { envAt } from './render/env.js';
import { BLOCKS, ID, SOLID, SHAPE, PALETTE_ORDER, stairFor } from './core/blocks.js';
import { tokyo, TEMPLATES, GY } from './core/gen.js';
import { Editor, rotateStamp, overlapsBox } from './core/editor.js';
import { Walker } from './core/walker.js';
import { encodeWorld, decodeWorld, parseImport } from './core/save.js';
import { buildStamps, letterStamp } from './core/stamps.js';
import { Audio } from './audio.js';
import { REQUESTS, LOCKED_STAMPS, LOCKED_NEON, progress, nextRequest } from './core/requests.js';

const LS = 'nc2:machi:';
export const lsGet = (k, d = null) => { try { const v = localStorage.getItem(LS + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
export const lsSet = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); return true; } catch { return false; } };
const lsDel = (k) => { try { localStorage.removeItem(LS + k); } catch { /* blocked */ } };
const isTouchDevice = () => typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window) && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const TOOLS = ['place', 'remove', 'paint', 'pick', 'box', 'line', 'select', 'stamp'];
export const DEFAULT_HOTBAR = ['plaster', 'tile', 'wood', 'rooftile', 'glass', 'lantern', 'neonpink', 'neoncyan', 'sakura'].map((k) => ID[k]);
const DH = 18.6; // default: blue hour, drifting to night
const PRESETS = {
  opening: { target: [40, 6, 54], yaw: -1.42, pitch: 0.8, dist: 118 }, // from the west: shrine, torii, sakura, canal and bridge leading into the neon
  south: { target: [48, 12, 48], yaw: 0, pitch: 0.42, dist: 100 },
  north: { target: [48, 12, 48], yaw: Math.PI, pitch: 0.42, dist: 100 },
  east: { target: [48, 12, 48], yaw: Math.PI / 2, pitch: 0.42, dist: 100 },
  west: { target: [48, 12, 48], yaw: -Math.PI / 2, pitch: 0.42, dist: 100 },
  top: { target: [48, 4, 48], yaw: 0, pitch: 1.45, dist: 130 },
  shotengai: { target: [44, 6, 46], yaw: -Math.PI / 2, pitch: 0.36, dist: 50 },
  // walk presets: stand at (x, z), look at (tx, ty, tz)
  street: { walk: [7, 46, 60, 12, 45] },
  shrine: { walk: [14, 31, 9, 13, 11] },
  bridge: { walk: [31, 67.5, 44, 4.5, 75] },
  viaduct: { walk: [44, 74.5, 84, 17, 73] },
  konbini: { walk: [53, 49, 53, 7, 39] },
  canal: { walk: [43.5, 74.5, 4, 0, 74.5] },
};

export class Game {
  constructor(canvas, stage, { onExit } = {}) {
    this.canvas = canvas; this.stage = stage; this.onExit = onExit;
    this.listeners = new Set();
    this.reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.touch = isTouchDevice();
    this.settings = { quality: 'auto', sound: true, invertY: false, sens: 1, tilt: true, ...(lsGet('settings') || {}) };
    this.renderer = new Renderer(canvas, { quality: this.resolveQuality(), reduced: this.reduced });
    this.audio = new Audio(); this.audio.on = this.settings.sound;
    this.allStamps = buildStamps();
    this.req = { done: [], off: false, open: true, ...(lsGet('req') || {}) };
    if (!Array.isArray(this.req.done)) this.req.done = [];
    this._refreshUnlocks();
    this.ui = {
      mode: 'build', tool: 'place', slot: 0, hotbar: (lsGet('hotbar') || DEFAULT_HOTBAR).slice(0, 9), mirrorX: false, mirrorZ: false,
      canUndo: false, canRedo: false, hour: DH, drift: true, cycle: false, rain: false, boxMode: 'fill', boxH: 0, selection: null,
      stamp: null, stampRot: 0, locked: false, coach: lsGet('coach', 0), toast: null, photo: false, fov: 60, tilt: 0.25, panel: null,
      hoverName: '', quality: this.renderer.qualityName, saving: false, template: 'tokyo',
    };
    while (this.ui.hotbar.length < 9) this.ui.hotbar.push(DEFAULT_HOTBAR[this.ui.hotbar.length]);
    this.ui.hotbar = this.ui.hotbar.map((id, i) => (BLOCKS[id] && !BLOCKS[id].hidden ? id : DEFAULT_HOTBAR[i]));
    // world: autosave if present, else the Tokyo corner
    let w = null;
    const auto = lsGet('auto');
    if (auto) { try { w = decodeWorld(auto); this.ui.template = auto.template || 'tokyo'; } catch { w = null; } }
    if (!w) w = tokyo();
    this.world = w;
    this.editor = new Editor(w); this.editor.onChange = () => this._edited();
    this.walker = new Walker(w);
    this.renderer.setWorld(w);
    this.renderer.flush();
    this.orbit = { target: [...PRESETS.opening.target], yaw: PRESETS.opening.yaw, pitch: PRESETS.opening.pitch, dist: PRESETS.opening.dist * this._aspectK() };
    this.orbitGoal = { ...this.orbit, target: [...this.orbit.target] };
    this.sim = { t: 0, trainT: 22, cat: null, petals: new Float32Array(700 * 3), petalV: new Float32Array(600 * 4), nPetals: 0, wet: 0, stepT: 0, puffs: [] };
    this._initCat(); this._initPetals();
    this.keys = new Set();
    this.pointer = { x: -1, y: -1, inside: false };
    this.drag = null; this.touches = new Map();
    this.hit = null;
    this.paused = false; this.hidden = false;
    this.frameT = 0; this.ft = 16; this.slowT = 0; this.fastT = 0;
    this.raycaster = new THREE.Raycaster();
    this._bind();
    this._applyEnv();
    this._last = performance.now();
    this.running = true;
    this._raf = requestAnimationFrame((t) => this._frame(t));
    this._exposeHook();
  }
  // ---------------- neighbourhood requests ----------------
  _refreshUnlocks() {
    const got = new Set(); const neon = new Set();
    for (const r of REQUESTS) if (this.req.done.includes(r.id)) { if (r.reward.stamp) got.add(r.reward.stamp); (r.reward.neon || []).forEach((n) => neon.add(n)); }
    this.stamps = this.allStamps.filter((st) => !LOCKED_STAMPS.includes(st.name) || got.has(st.name));
    this.lockedNeon = LOCKED_NEON.filter((n) => !neon.has(n));
  }
  get request() { return this.ui.template === 'tokyo' && !this.req.off ? nextRequest(this.req) : null; }
  requestProgress() {
    const r = this.request; if (!r || r.photo) return 0;
    if (!this._base) this._base = tokyo();
    return progress(r, this.world, this._base);
  }
  _checkRequest() {
    const r = this.request; if (!r || r.photo) return;
    const p = this.requestProgress();
    if (p !== this.ui.reqProgress) { this.ui.reqProgress = p; this.emit(); }
    if (p >= r.need) this.completeRequest(r);
  }
  completeRequest(r) {
    if (this.req.done.includes(r.id)) return;
    this.req.done.push(r.id); this.req.open = true; lsSet('req', this.req);
    this._refreshUnlocks();
    if (r.reward.cat && this.sim.cat) { const [x, z] = r.reward.cat; const c = this.sim.cat; c.home = [x, z]; c.x = x + 0.5; c.z = z + 0.5; c.y = this._standY(x + 0.5, z + 0.5, this.world.H - 1); c.state = 'sit'; c.t = 30; this.puff(x, c.y - 1, z, 16); }
    this.audio.chime();
    const what = r.reward.stamp ? `${r.reward.stamp} stamp unlocked` : 'Green and violet neon letters unlocked';
    this.ui.reqDone = { title: r.title, reward: what + (r.reward.cat ? '. The cat moved in.' : '') };
    this.emit();
  }
  requestAction(a) {
    if (a === 'later') { this.req.open = false; lsSet('req', this.req); }
    else if (a === 'open') { this.req.open = true; lsSet('req', this.req); }
    else if (a === 'next') { this.ui.reqDone = null; }
    else if (a === 'off') { this.req.off = true; lsSet('req', this.req); }
    else if (a === 'on') { this.req.off = false; this.req.open = true; lsSet('req', this.req); }
    else if (a === 'show') { const r = this.request; if (r && r.look) { if (this.ui.mode === 'walk') this.setMode('build'); this._userActed = true; const k = this._aspectK(); this.orbitGoal = { ...r.look, target: [...r.look.target], dist: r.look.dist * k }; if (r.photo) this.ui.hour = 18.9, this.ui.drift = false; } }
    this.emit();
  }
  onPhoto() {
    const r = this.request; if (!r || !r.photo) return;
    const t = this._trainState(), h = this.ui.hour;
    if (!t.on) { this.toast('No train in the picture yet. It passes every 48 seconds.', 2600); return; }
    if (h < 18.5 || h > 19.5) { this.toast('The rail fan wants blue hour: set the time between 18:30 and 19:30.', 3000); return; }
    this.completeRequest(r);
  }
  resolveQuality() { const q = this.settings.quality; return QUALITY[q] ? q : this.touch ? 'low' : 'balanced'; }
  emit() { if (this._emitQueued) return; this._emitQueued = true; queueMicrotask(() => { this._emitQueued = false; for (const f of this.listeners) f(); }); }
  subscribe(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  set(patch) { if ('panel' in patch && patch.panel !== this.ui.panel) this.keys.clear(); Object.assign(this.ui, patch); this.emit(); }
  closePanel() { this.set({ panel: null }); try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); this.canvas.focus({ preventScroll: true }); } catch { /* fine */ } }
  toast(msg, ms = 2200) { this.ui.toast = msg; this.emit(); clearTimeout(this._toastT); this._toastT = setTimeout(() => { this.ui.toast = null; this.emit(); }, ms); }

  // ---------------- simulation ----------------
  _initCat() {
    const m = this.world.meta && this.world.meta.cat;
    if (!m) { this.sim.cat = null; return; }
    const y = this._standY(m.x, m.z, GY + 2);
    this.sim.cat = { home: [m.x, m.z], x: m.x + 0.5, y, z: m.z + 0.5, yaw: 0, state: 'sit', t: 3, tx: m.x, tz: m.z, ty: y, hop: 0, from: null, bob: 0, phase: 0 };
  }
  // y the cat would stand at for column (x,z), scanning down from `from`
  _standY(x, z, from) {
    const w = this.world; x = Math.floor(x); z = Math.floor(z);
    for (let y = Math.min(w.H - 1, Math.floor(from) + 1); y >= 0; y--) { const b = w.get(x, y, z); if (b && SOLID[b]) { return y + (SHAPE[b] === 1 || (SHAPE[b] >= 2 && SHAPE[b] <= 5) ? 0.5 : 1); } }
    return 0;
  }
  _catStep(h) {
    const c = this.sim.cat; if (!c) return;
    const w = this.world;
    c.t -= h;
    // ground under the cat changed (block removed): fall
    const ground = this._standY(c.x, c.z, c.y + 0.4);
    if (c.state !== 'hop' && ground < c.y - 0.05) { c.y = Math.max(ground, c.y - 10 * h); }
    if (c.state !== 'hop' && ground > c.y + 0.05 && ground - c.y < 1.1) c.y = ground;
    if (c.state === 'sit' && c.t <= 0) {
      // pick somewhere nearby to wander
      for (let k = 0; k < 12; k++) {
        const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 8;
        const tx = clamp(c.home[0] + Math.cos(a) * r, 1, w.W - 2), tz = clamp(c.home[1] + Math.sin(a) * r, 1, w.D - 2);
        const ty = this._standY(tx, tz, c.y + 2);
        if (Math.abs(ty - c.y) <= 2 && w.get(Math.floor(tx), Math.floor(ty), Math.floor(tz)) !== ID.water && !w.get(Math.floor(tx), Math.floor(ty) + 1, Math.floor(tz))) { Object.assign(c, { state: 'walk', tx, tz, ty, t: 8 }); break; }
      }
      if (c.state === 'sit') c.t = 2;
    } else if (c.state === 'walk') {
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
      const want = Math.atan2(dx, dz);
      let dy = want - c.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
      c.yaw += dy * Math.min(1, h * 6);
      if (d < 0.2 || c.t <= 0) { Object.assign(c, { state: 'sit', t: 4 + Math.random() * 7 }); }
      else {
        const sp = 2.2 * h, nx = c.x + dx / d * sp, nz = c.z + dz / d * sp;
        const ny = this._standY(nx, nz, c.y + 1.2);
        const blocked = ny - c.y > 0.6 || w.get(Math.floor(nx), Math.floor(ny) + 0, Math.floor(nz)) && SOLID[w.get(Math.floor(nx), Math.floor(ny), Math.floor(nz))];
        if (ny - c.y > 0.6 && ny - c.y <= 2.2) { Object.assign(c, { state: 'hop', from: [c.x, c.y, c.z], to: [nx + dx / d * 0.4, ny, nz + dz / d * 0.4], hop: 0, next: 'walk' }); }
        else if (blocked || c.y - ny > 3) { Object.assign(c, { state: 'sit', t: 2 + Math.random() * 3 }); }
        else { c.x = nx; c.z = nz; c.phase += h * 10; c.bob = Math.abs(Math.sin(c.phase)) * 0.06; }
      }
    } else if (c.state === 'hop') {
      c.hop += h / 0.45;
      const k = Math.min(1, c.hop), [ax, ay, az] = c.from, [bx, by, bz] = c.to;
      c.x = ax + (bx - ax) * k; c.z = az + (bz - az) * k; c.y = ay + (by - ay) * k + Math.sin(k * Math.PI) * (1 + Math.max(0, by - ay) * 0.4);
      c.yaw = Math.atan2(bx - ax, bz - az);
      if (k >= 1) { c.y = by; if (c.next === 'sit') Object.assign(c, { state: 'sit', t: 9 + Math.random() * 6 }); else Object.assign(c, { state: 'walk', t: Math.max(c.t, 2) }); }
    }
    c.sit = c.state === 'sit';
  }
  // something was built near the cat: it goes and sits on top of it
  _catNotice(x, y, z) {
    const c = this.sim.cat; if (!c || c.state === 'hop') return;
    if (Math.hypot(x + 0.5 - c.x, z + 0.5 - c.z) > 9) return;
    const ty = this._standY(x + 0.5, z + 0.5, this.world.H - 1);
    if (ty - c.y > 8 || this.world.get(x, Math.floor(ty), z)) return;
    Object.assign(c, { state: 'hop', from: [c.x, c.y, c.z], to: [x + 0.5, ty, z + 0.5], hop: -0.6, next: 'sit' });
    c.hop = -0.6; // a small pause before the jump
  }
  _initPetals() {
    const meta = this.world.meta || {};
    this.emitters = (meta.petals || []).filter((e) => this.world.get(e[0], e[1], e[2]) === ID.sakura || true);
    const n = this.emitters.length ? Math.floor(QUALITY[this.renderer.qualityName].petals * (this.reduced ? 0.4 : 1)) : 0;
    this.sim.nPetals = n;
    for (let i = 0; i < n; i++) this._spawnPetal(i, true);
  }
  _spawnPetal(i, anywhere = false) {
    const e = this.emitters[(Math.random() * this.emitters.length) | 0];
    const P = this.sim.petals, V = this.sim.petalV;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * e[3];
    P[i * 3] = e[0] + 0.5 + Math.cos(a) * r; P[i * 3 + 2] = e[2] + 0.5 + Math.sin(a) * r;
    P[i * 3 + 1] = anywhere ? GY + Math.random() * (e[1] - GY) : e[1] - e[3] * 0.3 + Math.random() * 2;
    V[i * 4] = Math.random() * 6.28; V[i * 4 + 1] = 0.5 + Math.random() * 0.6; V[i * 4 + 2] = 0; V[i * 4 + 3] = 0;
  }
  puff(x, y, z, n = 12) {
    if (this.reduced) return;
    const P = this.sim.puffs;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = 1.5 + Math.random() * 2.5; P.push({ p: [x + 0.5, y + 0.6, z + 0.5], v: [Math.cos(a) * sp, 2 + Math.random() * 2.5, Math.sin(a) * sp], life: 0.45 + Math.random() * 0.25 }); }
    if (P.length > 90) P.splice(0, P.length - 90);
  }
  _petalStep(h) {
    const F = this.sim.puffs;
    for (let i = F.length - 1; i >= 0; i--) { const q = F[i]; q.life -= h; if (q.life <= 0) { F.splice(i, 1); continue; } q.v[1] -= 9 * h; for (let k = 0; k < 3; k++) { q.v[k] *= 1 - 2.5 * h; q.p[k] += q.v[k] * h; } }
    const P = this.sim.petals, V = this.sim.petalV, w = this.world, t = this.sim.t;
    const sp = this.reduced ? 0.5 : 1;
    for (let i = 0; i < this.sim.nPetals; i++) {
      if (V[i * 4 + 3] > 0) { V[i * 4 + 3] -= h; if (V[i * 4 + 3] <= 0) this._spawnPetal(i); continue; }
      const ph = V[i * 4] + t * V[i * 4 + 1] * 2;
      P[i * 3] += (Math.sin(ph) * 0.9 + 0.5) * h * sp; P[i * 3 + 2] += Math.cos(ph * 0.7) * 0.7 * h * sp; P[i * 3 + 1] -= (0.9 + 0.4 * Math.sin(ph * 1.3)) * h * sp;
      const x = Math.floor(P[i * 3]), y = Math.floor(P[i * 3 + 1] - 0.02), z = Math.floor(P[i * 3 + 2]);
      const b = w.get(x, y, z);
      if (y < 0 || (b && b !== ID.sakura && b !== ID.leaves && SOLID[b])) V[i * 4 + 3] = 2 + Math.random() * 3;
      else if (b === ID.water) V[i * 4 + 3] = 1 + Math.random();
    }
  }
  _trainState() {
    const meta = this.world.meta; if (!meta || !meta.train || !this.renderer.train) return { on: false };
    const period = 48, run = 16, k = (this.sim.trainT % (period * 2));
    const leg = k < period ? 0 : 1, tt = k % period;
    if (tt > run) return { on: false };
    const len = this.renderer.train.len, span = this.world.D + 2 * 150 + len;
    const dir = leg ? -1 : 1;
    const s = tt / run * span;
    const z = dir > 0 ? -150 + s : this.world.D + 150 - s;
    return { on: true, x: meta.train.x, y: meta.train.y, z, dir };
  }
  simTick(h) {
    const S = this.sim;
    S.t += h; S.trainT += h;
    const ui = this.ui;
    if (ui.cycle) ui.hour = (ui.hour + h / 30) % 24;
    else if (ui.drift && ui.hour < 21) ui.hour = Math.min(21, ui.hour + h / 50);
    S.wet += ((ui.rain ? 1 : 0) - S.wet) * Math.min(1, h * 0.5);
    this._catStep(h);
    this._petalStep(h);
    if (ui.mode === 'walk') this._walkStep(h);
    this._cameraStep(h);
  }

  // ---------------- walking ----------------
  _walkStep(h) {
    const k = this.keys, wk = this.walker;
    let fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let strafe = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    if (this.stick) { fwd += -this.stick.y; strafe += this.stick.x; }
    const jumpPressed = this._jumpPressed; this._jumpPressed = false;
    wk.step(h, { fwd, strafe, jump: k.has('Space') || !!this.touchJump, jumpPressed, sprint: k.has('ShiftLeft') || k.has('ShiftRight') || (this.stick && Math.hypot(this.stick.x, this.stick.y) > 0.95), down: k.has('KeyC') || k.has('ControlLeft') });
    if (wk.stepAcc > 2.6) {
      wk.stepAcc = 0;
      const b = this.world.get(Math.floor(wk.pos[0]), Math.floor(wk.pos[1] - 0.1), Math.floor(wk.pos[2]));
      this.audio.step(wk.inWater ? 'water' : b ? BLOCKS[b].sound : 'stone');
    }
  }
  setMode(m) {
    if (m === this.ui.mode) return;
    if (m === 'walk') {
      const sp = (this.world.meta && this.world.meta.spawn) || { x: this.world.W / 2, z: this.world.D / 2, yaw: 0 };
      // start where the orbit camera is looking, if that spot is open; otherwise at the spawn point
      // first walk of a visit: start on the shotengai looking down the street; later, where the camera is looking
      const [tx, , tz] = this.orbit.target;
      if (!this._walked) { this.walker.spawn(sp.x, sp.z, sp.yaw); this.walker.yaw = sp.yaw; }
      else { this.walker.spawn(tx, tz, this.orbit.yaw); this.walker.yaw = this.orbit.yaw; if (this.walker.pos[1] > GY + 6) { this.walker.spawn(sp.x, sp.z, sp.yaw); this.walker.yaw = sp.yaw; } }
      this._walked = true;
      this.walker.pitch = 0.02;
      this.ui.mode = 'walk';
      if (this.ui.coach === 2) this._coachNext();
      if (!['place', 'remove'].includes(this.ui.tool)) this.ui.tool = 'place';
      this.renderer.setGhost(null); this.renderer.setStampGhost(null);
      if (!this.touch) this.requestLock();
    } else {
      this.ui.mode = 'build';
      if (document.pointerLockElement) try { document.exitPointerLock(); } catch { /* fine */ }
      const e = this.walker.eye();
      this.orbitGoal.target = [e[0], Math.max(GY, e[1] - 2), e[2]]; this.orbitGoal.yaw = this.walker.yaw; this.orbitGoal.dist = Math.max(40, this.orbitGoal.dist); this.orbitGoal.pitch = Math.max(0.35, this.orbitGoal.pitch);
    }
    this.camera(null);
    this.emit();
  }
  requestLock() { try { const p = this.canvas.requestPointerLock && this.canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch { /* not allowed now */ } }

  // ---------------- camera ----------------
  _cameraStep(h) {
    const cam = this.renderer.camera;
    if (this.ui.mode === 'walk') {
      const e = this.walker.eye();
      cam.position.set(e[0], e[1], e[2]);
      cam.rotation.order = 'YXZ'; cam.rotation.set(this.walker.pitch, this.walker.yaw, 0);
      const fov = this.ui.photo ? this.ui.fov : 72;
      if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
      return;
    }
    // keyboard pan / rotate in build mode
    const k = this.keys, g = this.orbitGoal;
    const pan = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0), strafe = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0);
    if (pan || strafe) { const s = Math.sin(g.yaw), c = Math.cos(g.yaw), v = h * (20 + g.dist * 0.4); g.target[0] += (-s * pan + c * strafe) * v; g.target[2] += (-c * pan - s * strafe) * v; }
    if (k.has('ArrowLeft')) g.yaw -= h * 1.4; if (k.has('ArrowRight')) g.yaw += h * 1.4;
    if (k.has('ArrowUp')) g.pitch += h; if (k.has('ArrowDown')) g.pitch -= h;
    if (k.has('Equal') || k.has('NumpadAdd')) g.dist *= 1 - h * 1.5; if (k.has('Minus') || k.has('NumpadSubtract')) g.dist *= 1 + h * 1.5;
    g.pitch = clamp(g.pitch, 0.06, 1.48); g.dist = clamp(g.dist, 10, 240);
    g.target[0] = clamp(g.target[0], -16, this.world.W + 16); g.target[2] = clamp(g.target[2], -16, this.world.D + 16); g.target[1] = clamp(g.target[1], 0, this.world.H);
    // a slow drift on the opening view until the visitor touches anything
    if (!this._userActed && !this.reduced && !this.frozen && this.ui.template === 'tokyo') { this._drift = (this._drift || 0) + h; g.yaw = PRESETS.opening.yaw + Math.sin(this._drift * 0.035) * 0.12; }
    const o = this.orbit, a = this.reduced ? 1 : 1 - Math.exp(-h * 12);
    o.yaw += (g.yaw - o.yaw) * a; o.pitch += (g.pitch - o.pitch) * a; o.dist += (g.dist - o.dist) * a;
    for (let i = 0; i < 3; i++) o.target[i] += (g.target[i] - o.target[i]) * a;
    const cp = Math.cos(o.pitch);
    const dx = Math.sin(o.yaw) * cp, dy = Math.sin(o.pitch), dz = Math.cos(o.yaw) * cp;
    // keep the camera out of buildings: if the eye would sit inside a solid block, slide it toward the target until it is in the open
    let dist = o.dist;
    const solidAt = (d) => { const x = o.target[0] + dx * d, y = o.target[1] + dy * d, z = o.target[2] + dz * d; for (const [ox, oy, oz] of [[0, 0, 0], [0.35, 0, 0], [-0.35, 0, 0], [0, 0.35, 0], [0, -0.35, 0], [0, 0, 0.35], [0, 0, -0.35]]) { const b = this.world.get(Math.floor(x + ox), Math.floor(y + oy), Math.floor(z + oz)); if (b && SOLID[b]) return true; } return false; };
    if (solidAt(dist)) { let d = dist; while (d > 2 && solidAt(d)) d -= 0.5; dist = Math.max(2, d); }
    this._camD = this._camD === undefined || this.reduced ? dist : (dist < this._camD ? dist : this._camD + (dist - this._camD) * Math.min(1, h * 4));
    dist = this._camD;
    cam.position.set(o.target[0] + dx * dist, o.target[1] + dy * dist, o.target[2] + dz * dist);
    cam.lookAt(o.target[0], o.target[1], o.target[2]);
    const fov = this.ui.photo ? this.ui.fov : 45;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
  }
  // portrait screens need the orbit camera further out to fit the block
  _aspectK() { const r = this.stage.getBoundingClientRect(); const a = r.width / Math.max(1, r.height); return clamp(1.45 / a, 1, 2.1); }
  camera(preset) {
    if (preset && PRESETS[preset]) {
      if (preset !== 'opening') this._userActed = true;
      const p = PRESETS[preset];
      if (p.walk) {
        if (this.ui.mode !== 'walk') { this.ui.mode = 'walk'; this.renderer.setGhost(null); }
        const [x, z, tx, ty, tz] = p.walk;
        this.walker.spawn(x, z, 0);
        const e = this.walker.eye();
        this.walker.yaw = Math.atan2(-(tx - x), -(tz - z)); this.walker.pitch = Math.atan2(ty - e[1], Math.hypot(tx - x, tz - z));
      } else {
        if (this.ui.mode !== 'build') { this.ui.mode = 'build'; }
        const dist = p.dist * this._aspectK();
        this.orbitGoal = { target: [...p.target], yaw: p.yaw, pitch: p.pitch, dist };
        this.orbit = { target: [...p.target], yaw: p.yaw, pitch: p.pitch, dist };
      }
      this._cameraStep(0);
      this.emit();
    }
    const c = this.renderer.camera;
    return { mode: this.ui.mode, pos: c.position.toArray(), yaw: this.ui.mode === 'walk' ? this.walker.yaw : this.orbit.yaw };
  }

  // ---------------- picking + tools ----------------
  _ray(px, py) {
    const r = this.stage.getBoundingClientRect();
    const ndc = new THREE.Vector2((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.renderer.camera);
    return this.raycaster.ray;
  }
  pick(px, py) {
    const walk = this.ui.mode === 'walk';
    const ray = walk ? { origin: this.renderer.camera.position, direction: this.renderer.camera.getWorldDirection(new THREE.Vector3()) } : this._ray(px, py);
    const o = ray.origin, d = ray.direction;
    return this.world.raycast(o.x, o.y, o.z, d.x, d.y, d.z, walk ? 11 : 400);
  }
  // the cell a placement would fill for this hit
  _placeCell(h) { return h.ground ? [h.x, 0, h.z] : [h.x + h.nx, h.y + h.ny, h.z + h.nz]; }
  _selectedId() {
    let id = this.ui.hotbar[this.ui.slot];
    const b = BLOCKS[id];
    if (b && b.base) { // stairs face away from the viewer
      const yaw = this.ui.mode === 'walk' ? this.walker.yaw : this.orbit.yaw;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      const dir = Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 'E' : 'W') : (fz > 0 ? 'S' : 'N');
      id = stairFor(b.base, dir);
    }
    return id;
  }
  _canPlaceAt(x, y, z) {
    if (!this.world.inside(x, y, z)) return false;
    if (this.ui.mode === 'walk' && SOLID[this._selectedId()] && overlapsBox(x, y, z, this.walker.box())) return false;
    return true;
  }
  applyTool(tool, h, opts = {}) {
    if (!h) return false;
    const ed = this.editor, now = this.sim.t;
    if (tool === 'place') {
      const [x, y, z] = this._placeCell(h);
      if (!this._canPlaceAt(x, y, z)) return false;
      const id = this._selectedId();
      if (ed.place(x, y, z, id)) { this.audio.pop(now); this.renderer.pop(x, y, z, id); this.puff(x, y, z); this._catNotice(x, y, z); if (this.ui.coach === 0) this._coachNext(); this._placed(); return true; }
    } else if (tool === 'remove') {
      if (h.ground) return false;
      if (ed.remove(h.x, h.y, h.z)) { this.audio.thud(); this.puff(h.x, h.y - 0.3, h.z, 6); if (this.ui.coach === 1) this._coachNext(); return true; }
    } else if (tool === 'paint') {
      if (h.ground) return false;
      if (ed.place(h.x, h.y, h.z, this._selectedId())) { this.audio.pop(now); this.renderer.pop(h.x, h.y, h.z, this._selectedId()); this._placed(); return true; }
    } else if (tool === 'pick') {
      if (h.ground || !h.id) return false;
      let id = h.id; const b = BLOCKS[id]; if (b.base) id = ID[b.base + 'N']; if (b.hidden && !b.base) return false;
      const hb = this.ui.hotbar.slice(); const ex = hb.indexOf(id);
      if (ex >= 0) this.ui.slot = ex; else hb[this.ui.slot] = id;
      this.ui.hotbar = hb; lsSet('hotbar', hb); this.audio.click();
      if (!opts.keepTool) this.ui.tool = 'place';
      this.toast(BLOCKS[id].name, 1200); this.emit(); return true;
    } else if (tool === 'stamp') {
      const s = this._stampFor(h); if (!s) return false;
      const [x, y, z] = this._placeCell(h);
      if (ed.stamp(s.st, x, y, z, s.rot)) { this.audio.pop(now); this.puff(x, y, z, 18); this._catNotice(x, y, z); this._placed(); return true; }
    }
    return false;
  }
  _stampFor(h) {
    const st = this.ui.stamp; if (!st) return null;
    let rot = this.ui.stampRot;
    if (st.d === 1 && st.letter && h && !h.ground && h.ny === 0) rot = h.nz > 0 ? 0 : h.nx < 0 ? 1 : h.nz < 0 ? 2 : 3;
    return { st, rot };
  }
  _shapeCells(a, b) {
    const H = this.ui.boxH;
    const box = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
    if (H > 0) box[4] += H; else if (H < 0) box[1] += H;
    return box;
  }
  _commitShape(tool, a, b) {
    const ed = this.editor; const box = this._shapeCells(a, b);
    let n = 0;
    if (tool === 'box') n = ed.box([box[0], box[1], box[2]], [box[3], box[4], box[5]], this.ui.boxMode === 'clear' ? 0 : this._selectedId());
    else if (tool === 'line') n = ed.line(a, b, this.ui.boxMode === 'clear' ? 0 : this._selectedId(), 1 + Math.max(0, this.ui.boxH));
    else if (tool === 'select') { this.ui.selection = box; this.emit(); return; }
    if (n) { if (this.ui.boxMode === 'clear') this.audio.thud(); else { this.audio.pop(this.sim.t); this.puff(b[0], b[1], b[2], 16); this._catNotice(b[0], b[1], b[2]); this._placed(); } this.toast(`${n} ${n === 1 ? 'block' : 'blocks'}`, 1000); }
  }
  shapeAnchor(h, tool) { if (!h) return null; return (this.ui.boxMode === 'clear' && tool !== 'select') || (tool === 'select' && !h.ground) ? [h.x, Math.max(0, h.y), h.z] : this._placeCell(h); }
  copySelection() { const s = this.ui.selection; if (!s) return; const st = this.editor.copy([s[0], s[1], s[2]], [s[3], s[4], s[5]], 'Clipboard'); this.clipboard = st; this.set({ stamp: st, stampRot: 0, tool: 'stamp', selection: null }); this.renderer.setGhost(null); this.toast('Copied. Click to paste, R to rotate', 2600); }
  clearSelection() { const s = this.ui.selection; if (!s) return; this.editor.box([s[0], s[1], s[2]], [s[3], s[4], s[5]], 0); this.audio.thud(); this.set({ selection: null }); this.renderer.setGhost(null); }
  fillSelection() { const s = this.ui.selection; if (!s) return; this.editor.box([s[0], s[1], s[2]], [s[3], s[4], s[5]], this._selectedId()); this.audio.pop(this.sim.t); this.set({ selection: null }); this.renderer.setGhost(null); }
  setTool(t) { if (!TOOLS.includes(t)) return; if (t === 'stamp' && !this.ui.stamp) this.ui.stamp = this.stamps[0]; this.ui.tool = t; this.drag = null; if (t !== 'select') this.ui.selection = null; this.renderer.setGhost(null); this.renderer.setStampGhost(null); this.audio.click(); this.emit(); }
  setStamp(st) { this.ui.stamp = st; this.ui.stampRot = 0; this.ui.tool = 'stamp'; this.emit(); }
  letter(ch, neon) { const s = letterStamp(ch, neon, null); if (s) { s.letter = true; this.setStamp(s); } }
  undo() { if (this.editor.undo()) { this.audio.click(); this.toast('Undo', 700); } }
  redo() { if (this.editor.redo()) { this.audio.click(); this.toast('Redo', 700); } }
  _placed() { this._userActed = true; }
  _edited() { this.ui.canUndo = this.editor.canUndo; this.ui.canRedo = this.editor.canRedo; this._dirtySave = true; this._saveT = performance.now(); clearTimeout(this._autoT); this._autoT = setTimeout(() => { if (this._dirtySave && this.running) this.autosave(); }, 2000); this.emit(); }

  // ---------------- saves ----------------
  autosave() {
    const data = encodeWorld(this.world, { template: this.ui.template, saved: Date.now() });
    if (!lsSet('auto', data)) { this.toast('Browser storage is full. Use Export to keep your build.', 4000); return false; }
    this._dirtySave = false; return true;
  }
  slots() { return [1, 2, 3].map((i) => { const s = lsGet('slot' + i); return s ? { i, name: s.name || `Slot ${i}`, saved: s.saved || 0 } : { i, empty: true }; }); }
  saveSlot(i, name) {
    const data = encodeWorld(this.world, { template: this.ui.template, saved: Date.now(), name: (name || `Slot ${i}`).slice(0, 32) });
    if (lsSet('slot' + i, data)) this.toast(`Saved to ${data.name}`); else this.toast('Browser storage is full. Use Export instead.', 4000);
    this.emit();
  }
  loadSlot(i) { const s = lsGet('slot' + i); if (!s) return; try { this._load(decodeWorld(s)); this.ui.template = s.template || 'tokyo'; this.toast(`Loaded ${s.name || 'slot ' + i}`); } catch (e) { this.toast('That save could not be read'); } }
  deleteSlot(i) { lsDel('slot' + i); this.emit(); }
  exportJSON() { return JSON.stringify(encodeWorld(this.world, { template: this.ui.template, saved: Date.now(), name: 'MACHI export' })); }
  importJSON(text) {
    try { const w = decodeWorld(parseImport(text)); if (w.W !== this.world.W || w.H !== this.world.H || w.D !== this.world.D) { const big = new (this.world.constructor)(this.world.W, this.world.H, this.world.D); for (let y = 0; y < Math.min(w.H, big.H); y++) for (let z = 0; z < Math.min(w.D, big.D); z++) for (let x = 0; x < Math.min(w.W, big.W); x++) big.setRaw(x, y, z, w.get(x, y, z)); big.meta = w.meta; big.relight(); this._load(big); } else this._load(w); this.toast('Imported'); return true; }
    catch (e) { this.toast(`Import failed: ${e.message}`, 3500); return false; }
  }
  newWorld(template) {
    const T = TEMPLATES[template]; if (!T) return;
    this.ui.reqProgress = 0;
    this._load(T.make()); this.ui.template = template;
    if (template === 'tokyo') { this.camera('opening'); this.ui.hour = DH; this.ui.drift = true; }
    this.toast(template === 'tokyo' ? 'Back to the Tokyo corner' : T.name);
    this.autosave();
  }
  _load(w) {
    this.world = w;
    this.editor.setWorld(w); this.walker.world = w; this.walker = Object.assign(new Walker(w), {});
    this.renderer.setWorld(w); this.renderer.flush();
    this._initCat(); this._initPetals();
    this.ui.selection = null; this.ui.canUndo = false; this.ui.canRedo = false;
    if (this.ui.mode === 'walk') { const sp = (w.meta && w.meta.spawn) || { x: 48, z: 48, yaw: 0 }; this.walker.spawn(sp.x, sp.z, sp.yaw); }
    this.emit();
  }
  saveSettings(patch) {
    Object.assign(this.settings, patch); lsSet('settings', this.settings);
    if ('sound' in patch) this.audio.setOn(patch.sound);
    if ('quality' in patch) { this.renderer.setQuality(this.resolveQuality()); this.ui.quality = this.renderer.qualityName; this._initPetals(); }
    this.emit();
  }
  _coachNext() { this.ui.coach = Math.min(3, (this.ui.coach | 0) + 1); lsSet('coach', this.ui.coach); this.emit(); }
  skipCoach() { this.ui.coach = 3; lsSet('coach', 3); this.emit(); }

  // ---------------- frame loop ----------------
  _applyEnv() {
    const e = envAt(this.ui.hour);
    this.renderer.setEnv(e);
    this.renderer.U.uWet.value = this.sim.wet;
    this.renderer.U.uTime.value = this.sim.t;
    this.env = e;
  }
  _frame(now) {
    if (!this.running) return;
    this._raf = requestAnimationFrame((t) => this._frame(t));
    const dt = Math.min(0.1, (now - this._last) / 1000); this._last = now;
    if (this.hidden || this.paused || this.frozen) return;
    this.frameT += dt;
    const H = 1 / 60;
    let acc = (this._acc || 0) + dt, n = 0;
    while (acc >= H && n < 6) { this.simTick(H); acc -= H; n++; }
    this._acc = acc;
    this.draw(dt);
    this._govern(dt);
    if (this._dirtySave && performance.now() - this._saveT > 2000) this.autosave();
    if (now - (this._reqT || 0) > 1000) { this._reqT = now; if (this.ui.coach >= 3) this._checkRequest(); }
  }
  draw(dt = 1 / 60, full = false) {
    const R = this.renderer;
    this._applyEnv();
    const focus = this.hit ? [this.hit.x, this.hit.y, this.hit.z] : this.ui.mode === 'walk' ? this.walker.pos : this.orbit.target;
    R.processDirty(full ? 1e9 : 5, focus);
    if (R.wiresDirty || this.world.version !== this._wv) { if (!R.world.dirty.some((d) => d)) { R._buildWires(); R._refreshEntityLight(); this._wv = this.world.version; } }
    R.setTrain(this._trainState());
    if (this.sim.cat) R.setCat(this.sim.cat);
    let np = this.sim.nPetals; const PP = this.sim.petals;
    for (const q of this.sim.puffs) { if (np >= 700) break; PP[np * 3] = q.p[0]; PP[np * 3 + 1] = q.p[1]; PP[np * 3 + 2] = q.p[2]; np++; }
    R.setPetals(PP, np);
    R.setRain(this.sim.wet > 0.05, Math.min(1, this.sim.wet * 1.2));
    this._updateHover();
    const t = this._trainState();
    let trainLoud = 0;
    if (t.on) { const c = R.camera.position; const dz = Math.max(0, Math.abs(c.z - (t.z - t.dir * R.train.len / 2)) - R.train.len / 2); trainLoud = clamp(1 - Math.hypot(c.x - t.x, c.y - t.y, dz) / 160, 0, 1); }
    this.audio.update(dt, { rain: this.sim.wet, train: trainLoud, night: this.env.night });
    const ui = this.ui;
    const tilt = this.settings.tilt && ui.mode === 'build' && !this.touch ? (ui.photo ? ui.tilt : 0.45) : ui.photo ? ui.tilt : 0;
    R.render({ tilt, focus: 0.55, bloom: 0.8, vignette: ui.photo ? 0.4 : 0.28, fog: ui.mode === 'walk' ? 0.0042 : 0.0026 });
  }
  _govern(dt) {
    if (this.settings.quality !== 'auto') return;
    this.ft = this.ft * 0.95 + dt * 1000 * 0.05;
    if (this.ft > 24) this.slowT += dt; else this.slowT = Math.max(0, this.slowT - dt);
    if (this.slowT > 2.5) {
      this.slowT = 0;
      const R = this.renderer;
      if ((R.pixelScale || 1) > 0.55) { R.pixelScale = (R.pixelScale || 1) * 0.8; R.resize(R.size[0], R.size[1], true); }
      else if (R.qualityName === 'high') R.setQuality('balanced');
      else if (R.qualityName === 'balanced') { R.setQuality('low'); this._initPetals(); }
      this.ui.quality = R.qualityName; this.emit();
    }
  }
  _updateHover() {
    const ui = this.ui, R = this.renderer;
    if (ui.photo) { R.setHover(null); R.setStampGhost(null); R.setPlaceGhost(0); this.hit = null; return; }
    let h = null;
    if (ui.mode === 'walk') h = this.pick();
    else if (this.pointer.inside && !this.touch && !(this.drag && this.drag.kind !== 'shape')) h = this.pick(this.pointer.x, this.pointer.y);
    else if (this.touch && this.drag && this.drag.kind === 'shape') h = this.drag.lastHit;
    this.hit = h;
    const name = h && !h.ground ? BLOCKS[h.id].name : '';
    if (name !== ui.hoverName) { ui.hoverName = name; this.emit(); }
    const tool = ui.mode === 'walk' ? 'place' : ui.tool;
    R.subtle = ui.mode === 'walk';
    // stamp ghost
    if (tool !== 'place') R.setPlaceGhost(0);
    if (tool === 'stamp' && h && ui.stamp) {
      const s = this._stampFor(h); const rs = this._rotCache && this._rotCache.src === s.st && this._rotCache.rot === s.rot ? this._rotCache.out : (this._rotCache = { src: s.st, rot: s.rot, out: rotateStamp(s.st, s.rot) }).out;
      const [x, y, z] = this._placeCell(h);
      R.setStampGhost(rs, [x - Math.floor(rs.w / 2), y, z - Math.floor(rs.d / 2)]);
      R.setHover(h, 'place');
      return;
    }
    R.setStampGhost(null);
    // shape preview
    if (this.drag && this.drag.kind === 'shape') {
      const b = this.shapeAnchor(h, ui.tool) || this.drag.b;
      if (b) this.drag.b = b;
      if (ui.tool === 'line') {
        const a = this.drag.a, bb = this.drag.b;
        R.setGhost([Math.min(a[0], bb[0]), Math.min(a[1], bb[1]), Math.min(a[2], bb[2]), Math.max(a[0], bb[0]), Math.max(a[1], bb[1]) + Math.max(0, ui.boxH), Math.max(a[2], bb[2])], ui.boxMode);
      } else R.setGhost(this._shapeCells(this.drag.a, this.drag.b), ui.tool === 'select' ? 'select' : ui.boxMode);
    } else if (ui.selection) R.setGhost(ui.selection, 'select');
    else R.setGhost(null);
    if (!h) { R.setHover(null); return; }
    if (tool === 'place' && !this.drag) { const [x, y, z] = this._placeCell(h); R.setPlaceGhost(this._canPlaceAt(x, y, z) ? this._selectedId() : 0, [x, y, z]); } else R.setPlaceGhost(0);
    if (tool === 'place' || (['box', 'line'].includes(tool) && ui.boxMode === 'fill')) { const [x, y, z] = this._placeCell(h); R.setHover(h.ground ? { ...h, y: -1 } : h, 'place'); R.hover.position.set(x + 0.5, y + 0.5, z + 0.5); }
    else R.setHover(h, tool === 'box' || tool === 'line' ? 'remove' : tool);
  }

  // ---------------- input ----------------
  _bind() {
    const c = this.canvas, s = this.stage;
    const on = (el, ev, f, o) => { el.addEventListener(ev, f, o); (this._unbind || (this._unbind = [])).push(() => el.removeEventListener(ev, f, o)); };
    on(c, 'pointerdown', (e) => this._down(e));
    on(window, 'pointermove', (e) => this._move(e));
    on(window, 'pointerup', (e) => this._up(e));
    on(window, 'pointercancel', (e) => this._up(e, true));
    on(c, 'pointerleave', () => { this.pointer.inside = false; });
    on(c, 'wheel', (e) => this._wheel(e), { passive: false });
    on(c, 'contextmenu', (e) => e.preventDefault());
    on(window, 'keydown', (e) => this._key(e, true));
    on(window, 'keyup', (e) => this._key(e, false));
    on(window, 'blur', () => this.keys.clear());
    on(document, 'visibilitychange', () => { this.hidden = document.hidden; if (this.hidden) { this.audio.suspend(); if (this._dirtySave) this.autosave(); } else { this._last = performance.now(); this.audio.resume(); } });
    on(window, 'pagehide', () => { if (this._dirtySave) this.autosave(); });
    on(document, 'pointerlockchange', () => { this.ui.locked = document.pointerLockElement === c; this.emit(); });
    this._ro = new ResizeObserver(() => { const r = s.getBoundingClientRect(); this.renderer.resize(r.width, r.height); });
    this._ro.observe(s);
    const r = s.getBoundingClientRect(); this.renderer.resize(r.width, r.height);
  }
  _local(e) { const r = this.stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  _down(e) {
    this.audio.resume(); this._userActed = true;
    if (this.ui.photo) { /* photo mode still lets you orbit */ }
    const [x, y] = this._local(e);
    this.pointer = { x, y, inside: true };
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* fine */ }
    if (e.pointerType === 'touch') return this._touchDown(e, x, y);
    if (this.ui.mode === 'walk') {
      if (!this.ui.locked) { this.requestLock(); return; }
      const h = this.pick();
      if (e.button === 0) this.applyTool('place', h); else if (e.button === 2) this.applyTool('remove', h); else if (e.button === 1) this.applyTool('pick', h, { keepTool: true });
      return;
    }
    const tool = this.ui.tool;
    if (e.button === 0 && ['box', 'line', 'select'].includes(tool) && !e.altKey && !this.ui.photo) {
      const h = this.pick(x, y);
      if (h) { const a = this.shapeAnchor(h, tool); this.drag = { kind: 'shape', a, b: a, x, y, id: e.pointerId }; return; }
      this.drag = { kind: 'none', id: e.pointerId }; this.toast('Start the shape on the lot. Right-drag or Alt-drag to move the camera', 2200); return;
    }
    this.drag = { kind: e.button === 0 && !e.shiftKey ? 'orbit' : 'pan', x, y, sx: x, sy: y, moved: false, button: e.button, id: e.pointerId, t: performance.now() };
  }
  _move(e) {
    const [x, y] = this._local(e);
    if (e.pointerType === 'touch') return this._touchMove(e, x, y);
    if (this.ui.mode === 'walk') {
      if (this.ui.locked) { const s = 0.0024 * this.settings.sens; this.walker.yaw -= e.movementX * s; this.walker.pitch = clamp(this.walker.pitch - e.movementY * s * (this.settings.invertY ? -1 : 1), -1.5, 1.5); }
      return;
    }
    const r = this.stage.getBoundingClientRect();
    this.pointer = { x, y, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
    const d = this.drag; if (!d || d.kind === 'shape' || d.kind === 'none') return;
    this._userActed = true;
    const dx = x - d.x, dy = y - d.y; d.x = x; d.y = y;
    if (Math.hypot(x - d.sx, y - d.sy) > 5) d.moved = true;
    if (!d.moved) return;
    this._orbitDrag(d.kind, dx, dy);
  }
  _orbitDrag(kind, dx, dy) {
    const g = this.orbitGoal, s = this.settings.sens;
    if (kind === 'orbit') { g.yaw -= dx * 0.0058 * s; g.pitch = clamp(g.pitch + dy * 0.0046 * s * (this.settings.invertY ? -1 : 1), 0.06, 1.48); }
    else { const k = g.dist * 0.0016, sn = Math.sin(g.yaw), cs = Math.cos(g.yaw); g.target[0] += (-cs * dx - sn * dy) * k; g.target[2] += (sn * dx - cs * dy) * k; }
  }
  _up(e, cancel = false) {
    const [x, y] = this._local(e);
    if (e.pointerType === 'touch') return this._touchUp(e, x, y, cancel);
    const d = this.drag; this.drag = null;
    if (!d || cancel || this.ui.mode === 'walk') return;
    if (d.kind === 'none') return;
    if (d.kind === 'shape') { if (d.a && d.b) this._commitShape(this.ui.tool, d.a, d.b); return; }
    if (!d.moved && !this.ui.photo) {
      const h = this.pick(x, y);
      if (d.button === 0) this.applyTool(this.ui.tool, h);
      else if (d.button === 2) this.applyTool('remove', h);
      else if (d.button === 1) this.applyTool('pick', h);
    }
  }
  _wheel(e) {
    e.preventDefault(); this._userActed = true;
    if (e.altKey || this.ui.mode === 'walk') { const n = this.ui.hotbar.length; this.ui.slot = (this.ui.slot + (e.deltaY > 0 ? 1 : n - 1)) % n; this.emit(); return; }
    if (this.drag && this.drag.kind === 'shape') { this.ui.boxH = clamp(this.ui.boxH + (e.deltaY < 0 ? 1 : -1), -30, 40); this.emit(); return; }
    const g = this.orbitGoal; g.dist = clamp(g.dist * Math.exp(e.deltaY * 0.0012), 10, 240);
  }
  _key(e, down) {
    const code = e.code;
    if (!down) { this.keys.delete(code); return; } // always release, even when focus is in a field
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
      if (code === 'Escape' && this.ui.panel) { e.preventDefault(); this.closePanel(); }
      return;
    }
    this.audio.resume(); this._userActed = true;
    if (code === 'Space' && !e.repeat) this._jumpPressed = true;
    this.keys.add(code);
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && code === 'KeyZ') { e.preventDefault(); if (e.shiftKey) this.redo(); else this.undo(); return; }
    if (ctrl && code === 'KeyY') { e.preventDefault(); this.redo(); return; }
    if (ctrl && code === 'KeyC') { if (this.ui.selection) { e.preventDefault(); this.copySelection(); } return; }
    if (ctrl && code === 'KeyV') { if (this.clipboard) { e.preventDefault(); this.setStamp(this.clipboard); } return; }
    if (ctrl) return;
    if (code === 'Tab') { e.preventDefault(); this.setMode(this.ui.mode === 'walk' ? 'build' : 'walk'); return; }
    if (code === 'Escape') { if (this.ui.panel) this.closePanel(); else if (this.ui.photo) this.set({ photo: false }); else if (this.ui.selection) { this.set({ selection: null }); this.renderer.setGhost(null); } else if (this.ui.mode !== 'walk' || !this.ui.locked) this.set({ panel: 'menu' }); return; }
    if (e.repeat) return;
    const digit = /^Digit([1-9])$/.exec(code);
    if (digit) { this.ui.slot = +digit[1] - 1; this.emit(); return; }
    if (code === 'KeyE') { e.preventDefault(); this.keys.clear(); this.set({ panel: this.ui.panel === 'palette' ? null : 'palette' }); if (document.pointerLockElement) document.exitPointerLock(); return; }
    if (code === 'Slash' || code === 'KeyH') { this.set({ panel: this.ui.panel === 'help' ? null : 'help' }); return; }
    if (code === 'KeyO') { this.set({ photo: !this.ui.photo, panel: null }); return; }
    if (this.ui.mode !== 'build') return;
    if (e.shiftKey && code === 'KeyX') { this.editor.mirrorX = !this.editor.mirrorX; this.set({ mirrorX: this.editor.mirrorX }); return; }
    if (e.shiftKey && code === 'KeyZ') { this.editor.mirrorZ = !this.editor.mirrorZ; this.set({ mirrorZ: this.editor.mirrorZ }); return; }
    const map = { KeyP: 'place', KeyX: 'remove', KeyC: 'paint', KeyI: 'pick', KeyB: 'box', KeyL: 'line', KeyM: 'select', KeyT: 'stamp' };
    if (map[code]) { this.setTool(map[code]); return; }
    if (code === 'KeyR') { this.set({ stampRot: (this.ui.stampRot + 1) % 4 }); return; }
    if (code === 'KeyF') { this.set({ boxMode: this.ui.boxMode === 'fill' ? 'clear' : 'fill' }); return; }
    if (code === 'Delete' || code === 'Backspace') { if (this.ui.selection) this.clearSelection(); return; }
  }
  // ---- touch ----
  _touchDown(e, x, y) {
    this.touches.set(e.pointerId, { x, y, sx: x, sy: y, t: performance.now() });
    if (this.ui.mode === 'walk') return; // walk mode uses the on-screen controls (handled in the UI layer) + look drag
    if (this.touches.size === 1) {
      const tool = this.ui.tool;
      this.drag = { kind: 'touch', id: e.pointerId, moved: false, t: performance.now(), sx: x, sy: y, x, y };
      clearTimeout(this._lp);
      if (!this.ui.photo) this._lp = setTimeout(() => { const d = this.drag; if (d && d.kind === 'touch' && !d.moved) { d.done = true; const h = this.pick(d.sx, d.sy); if (['box', 'line', 'select'].includes(tool)) { this.shapeTap(h, true); } else if (this.applyTool('remove', h)) { try { navigator.vibrate && navigator.vibrate(12); } catch { /* fine */ } } } }, 480);
    } else { clearTimeout(this._lp); if (this.drag) this.drag.moved = true; this._pinch = null; }
  }
  _touchMove(e, x, y) {
    const t = this.touches.get(e.pointerId); if (!t) return;
    const dx = x - t.x, dy = y - t.y; t.x = x; t.y = y;
    if (this.ui.mode === 'walk') { if (this.lookId === e.pointerId) { const s = 0.005 * this.settings.sens; this.walker.yaw -= dx * s; this.walker.pitch = clamp(this.walker.pitch - dy * s * (this.settings.invertY ? -1 : 1), -1.4, 1.4); } return; }
    if (this.touches.size === 1) {
      const d = this.drag; if (!d) return;
      if (Math.hypot(x - d.sx, y - d.sy) > 9) { d.moved = true; clearTimeout(this._lp); }
      if (d.moved) this._orbitDrag('orbit', dx * 1.2, dy * 1.2);
    } else if (this.touches.size === 2) {
      const [a, b] = [...this.touches.values()];
      const mid = [(a.x + b.x) / 2, (a.y + b.y) / 2], dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (this._pinch) { this._orbitDrag('pan', mid[0] - this._pinch.mid[0], mid[1] - this._pinch.mid[1]); const g = this.orbitGoal; g.dist = clamp(g.dist * this._pinch.dist / Math.max(20, dist), 10, 240); }
      this._pinch = { mid, dist };
    }
  }
  _touchUp(e, x, y, cancel) {
    const t = this.touches.get(e.pointerId); this.touches.delete(e.pointerId);
    if (this.lookId === e.pointerId) this.lookId = null;
    if (this.touches.size < 2) this._pinch = null;
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    clearTimeout(this._lp); this.drag = null;
    if (cancel || d.moved || d.done || this.ui.mode === 'walk' || this.ui.photo) return;
    const h = this.pick(x, y);
    if (['box', 'line', 'select'].includes(this.ui.tool)) this.shapeTap(h);
    else this.applyTool(this.ui.tool, h);
  }
  // touch: shapes are made with two taps (first corner, second corner)
  shapeTap(h) {
    if (!h) return;
    const tool = this.ui.tool, a = this.shapeAnchor(h, tool);
    if (!this._shapeA) { this._shapeA = a; this.renderer.setGhost([...a, ...a], tool === 'select' ? 'select' : this.ui.boxMode); this.toast('Now tap the opposite corner', 1600); }
    else { const A = this._shapeA; this._shapeA = null; this._commitShape(tool, A, a); this.renderer.setGhost(null); }
  }
  get pendingCorner() { return !!this._shapeA; }

  // ---------------- test hook ----------------
  _exposeHook() {
    const g = this;
    window.__game = {
      id: 'machi',
      state: () => ({ mode: g.ui.mode, tool: g.ui.tool, hour: +g.ui.hour.toFixed(2), slot: g.ui.slot, hotbar: g.ui.hotbar.map((i) => BLOCKS[i].key), walker: { pos: g.walker.pos.map((v) => +v.toFixed(3)), onGround: g.walker.onGround, fly: g.walker.fly }, cat: g.sim.cat && { x: +g.sim.cat.x.toFixed(2), y: +g.sim.cat.y.toFixed(2), z: +g.sim.cat.z.toFixed(2), state: g.sim.cat.state }, train: g._trainState(), undo: g.editor.undoStack.length, redo: g.editor.redoStack.length, quality: g.renderer.qualityName, stats: { ...g.renderer.stats }, dirty: g.world.dirty.reduce((a, b) => a + b, 0), coach: g.ui.coach, rain: g.ui.rain, petals: g.sim.nPetals }),
      advance(sec) { const H = 1 / 60; const n = Math.round(sec / H); for (let i = 0; i < n; i++) g.simTick(H); g.draw(H, true); return this.state(); },
      pause() { g.frozen = true; }, resume() { g.frozen = false; g._last = performance.now(); },
      input: { key: (code, down = true) => g._key({ code, target: document.activeElement, preventDefault() {}, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false }, down), keys: g.keys, stick: (x, y) => { g.stick = x === null ? null : { x, y }; } },
      reset() { g.newWorld('tokyo'); return this.state(); },
      template: (t) => g.newWorld(t),
      setMode: (m) => { g.setMode(m); if (m === 'walk') { try { document.exitPointerLock(); } catch { /* fine */ } } return g.ui.mode; },
      place: (x, y, z, id) => { const b = typeof id === 'string' ? ID[id] : id; return g.editor.place(x, y, z, b); },
      remove: (x, y, z) => g.editor.remove(x, y, z),
      box: (a, b, id) => g.editor.box(a, b, typeof id === 'string' ? ID[id] : id),
      get: (x, y, z) => BLOCKS[g.world.get(x, y, z)].key,
      camera: (p) => g.camera(p),
      orbit: (yaw, pitch, dist, target) => { g._userActed = true; const o = { yaw, pitch, dist, target: target || g.orbitGoal.target }; g.orbit = { ...o, target: [...o.target] }; g.orbitGoal = { ...o, target: [...o.target] }; g._cameraStep(0); },
      look: (yaw, pitch) => { g.walker.yaw = yaw; g.walker.pitch = pitch; },
      walkTo: (x, z, yaw = g.walker.yaw, pitch = 0) => { g.setMode('walk'); g.walker.spawn(x, z, yaw); g.walker.pitch = pitch; },
      setTime: (h, drift = false) => { g.ui.hour = h; g.ui.drift = drift; g.ui.cycle = false; g.emit(); },
      setRain: (on) => { g.ui.rain = on; g.sim.wet = on ? 1 : 0; g.emit(); },
      setTool: (t) => g.setTool(t), setSlot: (i) => { g.ui.slot = i; g.emit(); },
      ui: (patch) => { if (patch) g.set(patch); return { ...g.ui }; },
      pickAt: (x, y) => g.pick(x, y),
      hover: (x, y) => { g.pointer = { x, y, inside: true }; g._updateHover(); return g.hit; },
      shape: (a, b) => { g.drag = { kind: 'shape', a, b }; g._updateHover(); },
      endShape: (commit = true) => { const d = g.drag; g.drag = null; if (commit && d) g._commitShape(g.ui.tool, d.a, d.b); g.renderer.setGhost(null); },
      trainAt: (sec) => { g.sim.trainT = sec; },
      catTo: (x, z) => { if (g.sim.cat) { g.sim.cat.x = x; g.sim.cat.z = z; g.sim.cat.y = g._standY(x, z, 40); } },
      quality: (q) => { if (q) g.saveSettings({ quality: q }); return g.renderer.qualityName; },
      stats: () => ({ ...g.renderer.stats }),
      screenshot: () => g.renderer.screenshot(),
      world: () => g.world,
      renderer: () => g.renderer,
    };
  }
  dispose() {
    this.running = false; cancelAnimationFrame(this._raf);
    if (this._dirtySave) this.autosave();
    clearTimeout(this._toastT); clearTimeout(this._lp); clearTimeout(this._autoT);
    if (this._unbind) this._unbind.forEach((f) => f());
    if (this._ro) this._ro.disconnect();
    if (document.pointerLockElement === this.canvas) try { document.exitPointerLock(); } catch { /* fine */ }
    this.audio.dispose();
    this.renderer.dispose();
    if (window.__game && window.__game.id === 'machi') delete window.__game;
  }
}
