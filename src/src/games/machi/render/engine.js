// MACHI renderer: chunk meshes, sky, entities, particles, overlays and a light post pass. One per game.
import * as THREE from 'three';
import { BLOCKS, hexLinear, ID } from '../core/blocks.js';
import { meshChunk, meshWorld } from '../core/mesher.js';
import { CS } from '../core/world.js';
import { trainCar, cat as catModel, bike as bikeModel } from '../core/models.js';
import { VOXEL_VERT, VOXEL_FRAG, TRANS_FRAG, SKY_VERT, SKY_FRAG, POST_VERT, BRIGHT_FRAG, DOWN_FRAG, UP_FRAG, COMP_FRAG, COMMON } from './shaders.js';

export const QUALITY = {
  low: { name: 'Low', pixels: 0.5e6, post: false, petals: 140, rain: 700, bloom: 0, msaa: 0, fog: 1.25 },
  balanced: { name: 'Balanced', pixels: 0.85e6, post: true, petals: 320, rain: 1400, bloom: 0.85, msaa: 4, fog: 1 },
  high: { name: 'High', pixels: 1.3e6, post: true, petals: 600, rain: 2200, bloom: 1, msaa: 4, fog: 1 },
};
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

function geomFrom(m) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.pos, 3));
  g.setAttribute('aDat', new THREE.BufferAttribute(m.dat, 4));
  g.setAttribute('aLit', new THREE.BufferAttribute(m.lit, 4, true));
  g.setIndex(new THREE.BufferAttribute(m.idx, 1));
  g.computeBoundingSphere();
  return g;
}
// growable plain buffers for hand-built voxel-format geometry (skirts)
class VBuf {
  constructor() { this.p = []; this.d = []; this.l = []; this.i = []; }
  quad(pts, id, face, sky = 255) {
    const v0 = this.p.length / 3;
    for (const q of pts) { this.p.push(q[0], q[1], q[2]); this.d.push(id, face, 3, 0); this.l.push(sky, 0, 0, 0); }
    this.i.push(v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3);
  }
  geom() { return this.i.length ? geomFrom({ pos: Float32Array.from(this.p), dat: Uint8Array.from(this.d), lit: Uint8Array.from(this.l), idx: Uint32Array.from(this.i) }) : null; }
}

export class Renderer {
  constructor(canvas, { quality = 'balanced', reduced = false } = {}) {
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false, preserveDrawingBuffer: false });
    this.gl.outputColorSpace = THREE.LinearSRGBColorSpace; // shaders output display-ready colour
    this.gl.toneMapping = THREE.NoToneMapping;
    this.gl.setClearColor(0x05060c, 1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.08, 2400);
    this.reduced = reduced;
    this.size = [1, 1];
    this.lost = false;
    this.stats = { draws: 0, tris: 0, meshMs: 0, chunks: 0 };
    // shared uniforms (all voxel materials reference the same objects)
    const pal = [], em = [];
    for (let i = 0; i < 96; i++) {
      const b = BLOCKS[i];
      if (b) { const c = hexLinear(b.color); pal.push(new THREE.Vector4(c[0], c[1], c[2], b.pat)); em.push(b.em || 0); } else { pal.push(new THREE.Vector4(1, 0, 1, 17)); em.push(0); }
    }
    this.U = {
      uPal: { value: pal }, uEm: { value: em }, uTime: { value: 0 }, uNight: { value: 1 }, uBlockGain: { value: 1.5 }, uEmGain: { value: 2.2 },
      uWet: { value: 0 }, uFogDensity: { value: 0.0035 }, uExposure: { value: 1.1 }, uFlicker: { value: reduced ? 0 : 1 },
      uSkyAmb: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Vector3() }, uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uFogCol: { value: new THREE.Vector3() }, uZenith: { value: new THREE.Vector3() }, uHorizon: { value: new THREE.Vector3() },
      uTrainA: { value: new THREE.Vector3(82.5, 0, 0) }, uTrainB: { value: new THREE.Vector3(82.5, 0, 1) }, uTrainCol: { value: new THREE.Vector3() },
      uWorldC: { value: new THREE.Vector2(48, 48) }, uFade: { value: new THREE.Vector2(74, 150) },
      tRefl: { value: null }, uReflOn: { value: 0 }, uScreen: { value: new THREE.Vector2(1, 1) },
    };
    this.reflCam = new THREE.PerspectiveCamera();
    this.waterY = 1.82;
    this.matOpaque = new THREE.ShaderMaterial({ vertexShader: VOXEL_VERT, fragmentShader: VOXEL_FRAG, uniforms: this.U });
    this.matTrans = new THREE.ShaderMaterial({ vertexShader: VOXEL_VERT, fragmentShader: TRANS_FRAG, uniforms: this.U, transparent: true, depthWrite: false });
    this.entityMat = () => new THREE.ShaderMaterial({ vertexShader: VOXEL_VERT, fragmentShader: VOXEL_FRAG, defines: { ENTITY: 1 }, uniforms: { ...this.U, uEntLit: { value: new THREE.Vector4(1, 0, 0, 0) } } });
    this.matGhost = new THREE.ShaderMaterial({ vertexShader: VOXEL_VERT, fragmentShader: VOXEL_FRAG, defines: { ENTITY: 1, GHOST: 1 }, uniforms: { ...this.U, uEntLit: { value: new THREE.Vector4(1, 0.6, 0.6, 0.6) } }, transparent: true, depthWrite: false });
    this.worldGroup = new THREE.Group(); this.scene.add(this.worldGroup);
    this.chunks = [];
    this._buildSky();
    this._buildOverlays();
    this._buildParticles();
    this.post = null;
    this.setQuality(quality);
    this._onLost = (e) => { e.preventDefault(); this.lost = true; };
    this._onRestored = () => { this.lost = false; this.rebuildAll(); this.setQuality(this.qualityName, true); };
    canvas.addEventListener('webglcontextlost', this._onLost);
    canvas.addEventListener('webglcontextrestored', this._onRestored);
  }

  // ---------------- world ----------------
  setWorld(world) {
    this.world = world;
    for (const c of this.chunks) this._dropChunk(c);
    this.chunks = new Array(world.nChunks).fill(null).map(() => ({ op: null, tr: null }));
    world.markAll();
    this.U.uWorldC.value.set(world.W / 2, world.D / 2);
    const R = Math.hypot(world.W, world.D) / 2;
    this.U.uFade.value.set(R + 6, R + 86);
    this._buildSkirt();
    this._buildEntities();
    this.wiresVersion = -1;
    // the reflection plane sits on the most common water surface
    const hist = new Map();
    for (let i = 0; i < world.N; i++) if (world.blocks[i] === ID.water) { const y = (i / world.WD) | 0; if (world.blocks[i + world.WD] !== ID.water) hist.set(y, (hist.get(y) || 0) + 1); }
    let best = -1, bn = 0; for (const [y, n] of hist) if (n > bn) { bn = n; best = y; }
    this.waterY = best >= 0 ? best + 0.82 : null;
  }
  _dropChunk(c) { if (!c) return; for (const k of ['op', 'tr']) if (c[k]) { this.worldGroup.remove(c[k]); c[k].geometry.dispose(); c[k] = null; } }
  remesh(ci) {
    const m = meshChunk(this.world, ci);
    const c = this.chunks[ci];
    for (const [k, buf, mat] of [['op', m.opaque, this.matOpaque], ['tr', m.trans, this.matTrans]]) {
      if (c[k]) { this.worldGroup.remove(c[k]); c[k].geometry.dispose(); c[k] = null; }
      if (buf.ni) { const mesh = new THREE.Mesh(geomFrom(buf), mat); mesh.matrixAutoUpdate = false; mesh.frustumCulled = true; this.worldGroup.add(mesh); c[k] = mesh; }
    }
    this.world.dirty[ci] = 0;
  }
  // remesh dirty chunks, nearest to `focus` first, within a time budget (ms). Returns how many remain.
  processDirty(budget = 4, focus = null) {
    const w = this.world; if (!w) return 0;
    const list = [];
    for (let i = 0; i < w.nChunks; i++) if (w.dirty[i]) list.push(i);
    if (!list.length) return 0;
    if (focus) {
      const d = (i) => { const cx = (i % w.cx) * CS + 8, cz = (((i / w.cx) | 0) % w.cz) * CS + 8, cy = ((i / (w.cx * w.cz)) | 0) * CS + 8; return (cx - focus[0]) ** 2 + (cy - focus[1]) ** 2 + (cz - focus[2]) ** 2; };
      list.sort((a, b) => d(a) - d(b));
    }
    const t0 = performance.now();
    let n = 0;
    for (const ci of list) { this.remesh(ci); n++; if (performance.now() - t0 > budget) break; }
    this.stats.meshMs = performance.now() - t0;
    if (n === list.length) this.wiresDirty = true;
    return list.length - n;
  }
  flush() { this.processDirty(1e9); this._buildWires(); }
  rebuildAll() { if (this.world) { this.world.markAll(); this._buildSkirt(); this._buildEntities(); } }

  // the city continues beyond the lot: extrude the ground profile (and the viaduct) outward, fading into haze
  _buildSkirt() {
    if (this.skirt) for (const m of this.skirt) { this.scene.remove(m); m.geometry.dispose(); }
    this.skirt = [];
    const w = this.world, L = 90;
    const op = new VBuf(), tr = new VBuf();
    const topAt = (x, z) => { for (let y = Math.min(3, w.H - 1); y >= 0; y--) { const b = w.get(x, y, z); if (b) return [y, b]; } return [-1, ID.asphalt]; };
    const edge = (n, get, emit) => { // n cells along an edge
      const prof = []; for (let i = 0; i < n; i++) prof.push(topAt(...get(i)));
      for (let i = 0; i < n; i++) {
        const [y, b] = prof[i];
        const h = b === ID.water ? y + 0.82 : y + 1;
        emit(i, h, b, prof[i + 1] ? (prof[i + 1][1] === ID.water ? prof[i + 1][0] + 0.82 : prof[i + 1][0] + 1) : null, prof[i + 1] ? prof[i + 1][1] : null);
      }
    };
    const put = (b) => (b === ID.water ? tr : op);
    // west (x < 0) and east (x > W)
    for (const side of [-1, 1]) {
      const xe = side < 0 ? 0 : w.W - 1, xa = side < 0 ? -L : w.W, xb = side < 0 ? 0 : w.W + L;
      edge(w.D, (i) => [xe, i], (z, h, b, hn, bn) => {
        put(b).quad([[xa, h, z], [xa, h, z + 1], [xb, h, z + 1], [xb, h, z]], b, 2);
        if (b === ID.water) op.quad([[xa, h - 0.82, z], [xa, h - 0.82, z + 1], [xb, h - 0.82, z + 1], [xb, h - 0.82, z]], ID.soil, 2);
        if (hn !== null && hn !== h) { const lo = Math.min(h, hn), hi = Math.max(h, hn); const lb = (hn < h ? b : bn) === ID.water ? ID.stone : ID.stone; if (hn < h) op.quad([[xa, lo - 1, z + 1], [xa, hi, z + 1], [xb, hi, z + 1], [xb, lo - 1, z + 1]].reverse(), lb, 4); else op.quad([[xa, lo - 1, z + 1], [xa, hi, z + 1], [xb, hi, z + 1], [xb, lo - 1, z + 1]], lb, 5); }
      });
    }
    for (const side of [-1, 1]) {
      const ze = side < 0 ? 0 : w.D - 1, za = side < 0 ? -L : w.D, zb = side < 0 ? 0 : w.D + L;
      edge(w.W, (i) => [i, ze], (x, h, b) => { put(b).quad([[x, h, za], [x + 1, h, za], [x + 1, h, zb], [x, h, zb]].reverse(), b, 2); });
    }
    for (const [xa, xb, za, zb] of [[-L, 0, -L, 0], [w.W, w.W + L, -L, 0], [-L, 0, w.D, w.D + L], [w.W, w.W + L, w.D, w.D + L]]) op.quad([[xa, 4, za], [xa, 4, zb], [xb, 4, zb], [xb, 4, za]], ID.asphalt, 2);
    // viaduct continuation: extrude the edge slices around the train line
    const t = w.meta && w.meta.train;
    if (t) {
      const x0 = Math.max(0, Math.floor(t.x - 6)), x1 = Math.min(w.W - 1, Math.ceil(t.x + 6));
      for (const side of [-1, 1]) {
        const ze = side < 0 ? 0 : w.D - 1, za = side < 0 ? -L * 1.6 : w.D, zb = side < 0 ? 0 : w.D + L * 1.6;
        for (let x = x0; x <= x1; x++) for (let y = 4; y < Math.min(w.H, 24); y++) {
          const b = w.get(x, y, ze); if (!b) continue;
          if (!w.get(x, y + 1, ze)) op.quad([[x, y + 1, za], [x, y + 1, zb], [x + 1, y + 1, zb], [x + 1, y + 1, za]], b, 2);
          if (!w.get(x - 1, y, ze)) op.quad([[x, y, za], [x, y, zb], [x, y + 1, zb], [x, y + 1, za]], b, 1);
          if (!w.get(x + 1, y, ze)) op.quad([[x + 1, y, za], [x + 1, y + 1, za], [x + 1, y + 1, zb], [x + 1, y, zb]], b, 0);
          if (y > 4 && !w.get(x, y - 1, ze)) op.quad([[x, y, za], [x + 1, y, za], [x + 1, y, zb], [x, y, zb]], b, 3);
        }
      }
    }
    // far ground ring below everything (hidden by the skirts near the lot, pure haze beyond)
    const far = new VBuf(), F = 1800;
    // a ring with a hole over the lot and its skirts (which carry the sunken canal)
    const a0 = -L, a1 = w.W + L, b0 = -L, b1 = w.D + L;
    for (const [xa, xb, za, zb] of [[-F, F, -F, b0], [-F, F, b1, F], [-F, a0, b0, b1], [a1, F, b0, b1]]) far.quad([[xa, 3.9, za], [xa, 3.9, zb], [xb, 3.9, zb], [xb, 3.9, za]], ID.asphalt, 2);
    for (const [vb, mat] of [[op, this.matOpaque], [tr, this.matTrans], [far, this.matOpaque]]) {
      const g = vb.geom(); if (!g) continue;
      const m = new THREE.Mesh(g, mat);
      if (vb === far) { m.position.y = -0.2; m.renderOrder = -1; }
      this.scene.add(m); this.skirt.push(m);
    }
  }

  // ---------------- sky ----------------
  _buildSky() {
    this.skyU = {
      uZenith: this.U.uZenith, uHorizon: this.U.uHorizon, uGlow: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonDir: this.U.uMoonDir,
      uSunCol: this.U.uSunCol, uStars: { value: 1 }, uNight: this.U.uNight, uExposure: this.U.uExposure, uTime: this.U.uTime, uFogCol: this.U.uFogCol, uSunVis: { value: 0 },
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false }));
    sky.renderOrder = -10; sky.frustumCulled = false;
    this.sky = sky; this.scene.add(sky);
  }
  setEnv(e) {
    const U = this.U;
    U.uZenith.value.set(...e.zenith); U.uHorizon.value.set(...e.horizon); U.uFogCol.value.set(...e.fog);
    U.uSkyAmb.value.set(...e.skyAmb); U.uSunCol.value.set(...e.dirCol); U.uSunDir.value.set(...e.lightDir); U.uMoonDir.value.set(...e.moonDir);
    U.uBlockGain.value = e.blockGain; U.uEmGain.value = e.emGain; U.uNight.value = e.night; U.uExposure.value = e.exposure;
    this.skyU.uGlow.value.set(...e.glow); this.skyU.uSunDir.value.set(...e.sunDir); this.skyU.uStars.value = e.stars; this.skyU.uSunVis.value = e.sunVis;
    this.env = e;
  }

  // ---------------- entities: train, cat, bikes ----------------
  _buildEntities() {
    if (this.ents) for (const o of this.ents) { this.scene.remove(o); o.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } }); }
    this.ents = [];
    const mk = (model, mat) => { const m = meshWorld(model.world, true); const g = geomFrom(m.opaque); const mesh = new THREE.Mesh(g, mat); mesh.scale.setScalar(model.scale); return mesh; };
    const meta = this.world.meta || {};
    // train: three cars sharing one geometry
    this.train = null;
    if (meta.train) {
      const model = trainCar(); const mat = this.entityMat();
      const grp = new THREE.Group(); const g0 = mk(model, mat);
      const len = model.world.D * model.scale;
      for (let k = 0; k < 3; k++) { const m = k ? new THREE.Mesh(g0.geometry, mat) : g0; m.scale.setScalar(model.scale); m.position.set(-model.world.W * model.scale / 2, 0, -k * (len + 0.6) - len); grp.add(m); }
      grp.visible = false; this.scene.add(grp); this.ents.push(grp);
      this.train = { grp, mat, len: 3 * (len + 0.6) };
    }
    // cat: standing and sitting meshes under one pivot
    this.cat = null;
    if (meta.cat) {
      const mat = this.entityMat(); const grp = new THREE.Group();
      const ms = catModel(false), mt = catModel(true);
      const a = mk(ms, mat), b = mk(mt, mat);
      for (const [m, md] of [[a, ms], [b, mt]]) { m.position.set(-md.world.W * md.scale / 2, 0, -md.world.D * md.scale / 2); grp.add(m); }
      b.visible = false; this.scene.add(grp); this.ents.push(grp);
      this.cat = { grp, stand: a, sit: b, mat };
    }
    // bikes
    this.bikes = [];
    const frames = [ID.tileblue, ID.vermilion, ID.cream];
    (meta.props || []).forEach((p, i) => {
      if (p.t !== 'bike') return;
      const md = bikeModel(frames[i % 3]); const mat = this.entityMat();
      const grp = new THREE.Group(); const m = mk(md, mat);
      m.position.set(-md.world.W * md.scale / 2, 0, -md.world.D * md.scale / 2); grp.add(m);
      grp.position.set(p.x, p.y, p.z); grp.rotation.y = p.r + Math.PI / 2;
      this.scene.add(grp); this.ents.push(grp); this.bikes.push({ grp, mat, p });
    });
    this._refreshEntityLight();
  }
  litAt(x, y, z) {
    const l = this.world.sampleLight(x, y, z);
    return [(l & 15) / 15, ((l >> 4) & 15) / 15, ((l >> 8) & 15) / 15, (l >> 12) / 15];
  }
  _refreshEntityLight() {
    for (const b of this.bikes) {
      const { x, y, z } = b.p;
      const supported = this.world.get(Math.floor(x), Math.floor(y) - 1, Math.floor(z)) !== 0 && this.world.get(Math.floor(x), Math.floor(y), Math.floor(z)) === 0;
      b.grp.visible = supported;
      b.mat.uniforms.uEntLit.value.set(...this.litAt(x, y + 0.5, z));
    }
  }
  setTrain(t) { // t: { on, z, dir, x, y }
    const T = this.train; if (!T) return;
    T.grp.visible = !!t.on;
    if (!t.on) { this.U.uTrainCol.value.set(0, 0, 0); return; }
    T.grp.position.set(t.x, t.y, t.z); T.grp.rotation.y = t.dir > 0 ? 0 : Math.PI;
    const tail = t.z - t.dir * T.len;
    this.U.uTrainA.value.set(t.x, t.y + 4, Math.min(t.z, tail)); this.U.uTrainB.value.set(t.x, t.y + 4, Math.max(t.z, tail));
    const n = this.env ? this.env.night : 1;
    this.U.uTrainCol.value.set(1.0, 0.9, 0.72).multiplyScalar(0.35 + 0.9 * n);
    T.mat.uniforms.uEntLit.value.set(...this.litAt(t.x, t.y + 3, Math.max(1, Math.min(this.world.D - 2, t.z))));
  }
  setCat(c) {
    const C = this.cat; if (!C) return;
    C.grp.position.set(c.x, c.y + (c.bob || 0), c.z); C.grp.rotation.y = c.yaw;
    C.stand.visible = !c.sit; C.sit.visible = !!c.sit;
    C.mat.uniforms.uEntLit.value.set(...this.litAt(c.x, c.y + 0.5, c.z));
  }

  // ---------------- wires ----------------
  _buildWires() {
    if (this.wires) { this.scene.remove(this.wires); this.wires.geometry.dispose(); }
    this.wires = null;
    const meta = this.world.meta; if (!meta || !meta.wires || !meta.wires.length) return;
    const att = (x, y, z) => { for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (this.world.get(Math.floor(x) + dx, Math.floor(y) + dy, Math.floor(z) + dz)) return true; return false; };
    const pts = [];
    for (const [ax, ay, az, bx, by, bz, sag] of meta.wires) {
      if (!att(ax, ay, az) || !att(bx, by, bz)) continue;
      const N = 14;
      for (let i = 0; i < N; i++) for (const t of [i / N, (i + 1) / N]) pts.push(ax + (bx - ax) * t, ay + (by - ay) * t - sag * 4 * t * (1 - t), az + (bz - az) * t);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.wires = new THREE.LineSegments(g, this.wireMat || (this.wireMat = new THREE.LineBasicMaterial({ color: 0x07070a, transparent: true, opacity: 0.9 })));
    this.scene.add(this.wires);
    this.wiresDirty = false;
  }

  // ---------------- overlays ----------------
  _buildOverlays() {
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    this.hover = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: true }));
    this.hover.visible = false; this.hover.renderOrder = 5; this.scene.add(this.hover);
    this.face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xfcee0a, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    this.face.visible = false; this.face.renderOrder = 6; this.scene.add(this.face);
    this.ghostBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.16, depthWrite: false }));
    this.ghostEdges = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    this.ghostBox.visible = this.ghostEdges.visible = false; this.scene.add(this.ghostBox); this.scene.add(this.ghostEdges);
    this.ghostStamp = null;
  }
  setHover(h, tool) {
    if (!h) { this.hover.visible = this.face.visible = false; return; }
    this.hover.visible = true; this.face.visible = true;
    const s = 1.012;
    this.hover.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5); this.hover.scale.setScalar(s);
    const col = tool === 'remove' ? 0xff4d6d : tool === 'paint' ? 0xff2bd6 : tool === 'pick' ? 0x00f0ff : 0xfcee0a;
    this.face.material.color.setHex(col);
    this.face.material.opacity = this.subtle ? 0.07 : 0.2;
    this.hover.material.opacity = this.subtle ? 0.55 : 0.9;
    this.hover.material.color.setHex(tool === 'remove' ? 0xff4d6d : 0xffffff);
    this.face.position.set(h.x + 0.5 + h.nx * 0.508, h.y + 0.5 + h.ny * 0.508, h.z + 0.5 + h.nz * 0.508);
    this.face.rotation.set(h.ny ? -Math.PI / 2 * h.ny : 0, h.nx ? Math.PI / 2 * h.nx : h.nz < 0 ? Math.PI : 0, 0);
  }
  setGhost(box, mode) { // box: [x0,y0,z0,x1,y1,z1] inclusive
    if (!box) { this.ghostBox.visible = this.ghostEdges.visible = false; return; }
    const [x0, y0, z0, x1, y1, z1] = box;
    const sx = x1 - x0 + 1, sy = y1 - y0 + 1, sz = z1 - z0 + 1;
    for (const o of [this.ghostBox, this.ghostEdges]) { o.visible = true; o.position.set(x0 + sx / 2, y0 + sy / 2, z0 + sz / 2); o.scale.set(sx + 0.03, sy + 0.03, sz + 0.03); }
    const c = mode === 'clear' ? 0xff4d6d : mode === 'select' ? 0xfcee0a : 0x00f0ff;
    this.ghostBox.material.color.setHex(c); this.ghostEdges.material.color.setHex(c);
  }
  setStampGhost(stamp, pos) {
    if (this.ghostStampSrc !== stamp) {
      if (this.ghostStamp) { this.scene.remove(this.ghostStamp); this.ghostStamp.geometry.dispose(); this.ghostStamp = null; }
      this.ghostStampSrc = stamp;
      if (stamp) {
        const w = { W: stamp.w, H: stamp.h, D: stamp.d, blocks: stamp.data, light: new Uint16Array(stamp.data.length), get(x, y, z) { return x < 0 || y < 0 || z < 0 || x >= this.W || y >= this.H || z >= this.D ? 0 : this.blocks[x + this.W * (z + this.D * y)]; } };
        const m = meshWorld(w, true);
        if (m.opaque.ni) { this.ghostStamp = new THREE.Mesh(geomFrom(m.opaque), this.matGhost); this.ghostStamp.renderOrder = 7; this.scene.add(this.ghostStamp); }
      }
    }
    if (this.ghostStamp) { this.ghostStamp.visible = !!pos; if (pos) this.ghostStamp.position.set(pos[0], pos[1], pos[2]); }
  }

  // ---------------- particles: petals and rain ----------------
  _buildParticles() {
    const MAXP = 600;
    this.petalPos = new Float32Array(MAXP * 3);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(this.petalPos, 3).setUsage(THREE.DynamicDrawUsage));
    const seeds = new Float32Array(MAXP); for (let i = 0; i < MAXP; i++) seeds[i] = Math.random();
    pg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    pg.setDrawRange(0, 0);
    this.petals = new THREE.Points(pg, new THREE.ShaderMaterial({
      uniforms: { uTime: this.U.uTime, uScale: { value: 400 }, uSkyAmb: this.U.uSkyAmb, uFogCol: this.U.uFogCol, uFogDensity: this.U.uFogDensity, uExposure: this.U.uExposure, uNight: this.U.uNight },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uScale; varying float vSeed; varying float vDist;
        void main(){ vSeed = aSeed; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = -mv.z; gl_PointSize = clamp(uScale * 0.14 / max(vDist, 0.5), 1.5, 14.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uSkyAmb; uniform vec3 uFogCol; uniform float uFogDensity; uniform float uExposure; uniform float uNight; varying float vSeed; varying float vDist;
        ${COMMON}
        void main(){ vec2 p = gl_PointCoord - 0.5; float a = uTime * (1.0 + vSeed * 2.0) + vSeed * 20.0; float c = cos(a), s = sin(a);
          p = mat2(c, -s, s, c) * p; p.y *= 1.0 / (0.35 + 0.65 * abs(sin(a * 0.7)));
          if (dot(p * vec2(1.0, 1.6), p) > 0.2) discard;
          vec3 col = vec3(1.0, 0.62, 0.75) * (uSkyAmb * 2.2 + vec3(0.35, 0.22, 0.25) * uNight);
          float fd = vDist * uFogDensity; col = mix(col, uFogCol, 1.0 - exp(-fd * fd));
          gl_FragColor = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), 1.0); }`,
    }));
    this.petals.frustumCulled = false; this.scene.add(this.petals);
    // rain: streaks wrapped in a box around the camera, animated entirely on the GPU
    const RN = 2200;
    const rp = new Float32Array(RN * 2 * 3), re = new Float32Array(RN * 2);
    for (let i = 0; i < RN; i++) { const x = Math.random() * 80, y = Math.random() * 50, z = Math.random() * 80; for (let k = 0; k < 2; k++) { rp.set([x, y, z], (i * 2 + k) * 3); re[i * 2 + k] = k; } }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('aEnd', new THREE.BufferAttribute(re, 1));
    this.rain = new THREE.LineSegments(rg, new THREE.ShaderMaterial({
      uniforms: { uTime: this.U.uTime, uCam: { value: new THREE.Vector3() }, uFogCol: this.U.uFogCol, uSkyAmb: this.U.uSkyAmb },
      vertexShader: `attribute float aEnd; uniform float uTime; uniform vec3 uCam; varying float vA;
        void main(){ vec3 box = vec3(80.0, 50.0, 80.0); vec3 p = position; p.y -= uTime * 46.0; p.x -= uTime * 4.0;
          p = mod(p - uCam + box * 0.5, box) - box * 0.5 + uCam; p.y += aEnd * 1.6; p.x += aEnd * 0.14; vA = 1.0 - aEnd * 0.7;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `uniform vec3 uFogCol; uniform vec3 uSkyAmb; varying float vA; void main(){ gl_FragColor = vec4(mix(vec3(0.55, 0.6, 0.72), uFogCol, 0.3) + uSkyAmb, 0.32 * vA); }`,
      transparent: true, depthWrite: false,
    }));
    this.rain.frustumCulled = false; this.rain.visible = false; this.scene.add(this.rain);
  }
  setPetals(arr, n) { this.petalPos.set(arr.subarray(0, n * 3)); const g = this.petals.geometry; g.attributes.position.needsUpdate = true; g.setDrawRange(0, n); }
  setRain(on, amount = 1) { this.rain.visible = on; this.rain.geometry.setDrawRange(0, Math.floor(this.Q.rain * amount) * 2); }

  // ---------------- quality + post ----------------
  setQuality(name, force = false) {
    if (!QUALITY[name]) name = 'balanced';
    if (name === this.qualityName && !force) return;
    this.qualityName = name; this.Q = QUALITY[name];
    this._disposePost();
    if (this.Q.post) this._makePost();
    this.resize(this.size[0], this.size[1], true);
  }
  resize(w, h, force = false) {
    w = Math.max(1, Math.floor(w)); h = Math.max(1, Math.floor(h));
    if (!force && w === this.size[0] && h === this.size[1] && this._pr) return;
    this.size = [w, h];
    const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const pr = Math.min(dpr, Math.sqrt((this.Q.pixels * (this.pixelScale || 1)) / (w * h)));
    this._pr = pr;
    this.gl.setPixelRatio(pr); this.gl.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.petals.material.uniforms.uScale.value = h * pr;
    if (this.post) this._sizePost(Math.floor(w * pr), Math.floor(h * pr));
  }
  _makePost() {
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const mat = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: POST_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const P = {
      cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad: new THREE.Mesh(tri), scene: new THREE.Scene(),
      bright: mat(BRIGHT_FRAG, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 0.72 } }),
      down: mat(DOWN_FRAG, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      up: mat(UP_FRAG, { tSrc: { value: null }, tAdd: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      comp: mat(COMP_FRAG, { tScene: { value: null }, tBloom: { value: null }, tBlur: { value: null }, uBloom: { value: 0.8 }, uTilt: { value: 0 }, uFocus: { value: 0.5 }, uVignette: { value: 0.35 }, uTexel: { value: new THREE.Vector2() } }),
      rts: [],
    };
    P.quad.frustumCulled = false; P.scene.add(P.quad);
    this.post = P;
  }
  _sizePost(w, h) {
    const P = this.post;
    for (const r of P.rts) r.dispose();
    const opt = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false };
    P.scene_rt = new THREE.WebGLRenderTarget(w, h, { ...opt, depthBuffer: true, samples: this.Q.msaa });
    P.half = new THREE.WebGLRenderTarget(Math.max(1, w >> 1), Math.max(1, h >> 1), opt);
    P.blur = new THREE.WebGLRenderTarget(Math.max(1, w >> 1), Math.max(1, h >> 1), opt);
    P.d = [2, 3, 4, 5].map((s) => new THREE.WebGLRenderTarget(Math.max(1, w >> s), Math.max(1, h >> s), opt));
    P.u = [2, 3, 4].map((s) => new THREE.WebGLRenderTarget(Math.max(1, w >> s), Math.max(1, h >> s), opt));
    P.refl = new THREE.WebGLRenderTarget(Math.max(1, w >> 1), Math.max(1, h >> 1), { ...opt, depthBuffer: true });
    P.rts = [P.scene_rt, P.half, P.blur, P.refl, ...P.d, ...P.u];
    P.w = w; P.h = h;
  }
  _disposePost() {
    if (!this.post) return;
    for (const r of this.post.rts) r.dispose();
    for (const k of ['bright', 'down', 'up', 'comp']) this.post[k].dispose();
    this.post.quad.geometry.dispose();
    this.post = null;
  }
  _pass(mat, target) { const P = this.post; P.quad.material = mat; this.gl.setRenderTarget(target); this.gl.render(P.scene, P.cam); }

  // planar reflection of the scene in the water plane (oblique near-plane clip, as in three's Reflector)
  _renderReflection(cam) {
    const P = this.post, wy = this.waterY;
    this.U.uReflOn.value = 0;
    if (!P || !P.refl || wy === null || cam.position.y < wy + 0.05) return;
    const N = new THREE.Vector3(0, 1, 0), M = new THREE.Vector3(cam.position.x, wy, cam.position.z);
    const rot = new THREE.Matrix4().extractRotation(cam.matrixWorld);
    const view = M.clone().sub(cam.position).reflect(N).negate().add(M);
    const look = new THREE.Vector3(0, 0, -1).applyMatrix4(rot).add(cam.position);
    const target = M.clone().sub(look).reflect(N).negate().add(M);
    const rc = this.reflCam;
    rc.position.copy(view); rc.up.set(0, 1, 0).applyMatrix4(rot).reflect(N); rc.lookAt(target);
    rc.near = cam.near; rc.far = cam.far; rc.fov = cam.fov; rc.aspect = cam.aspect;
    rc.updateMatrixWorld(); rc.projectionMatrix.copy(cam.projectionMatrix);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(N, M); plane.applyMatrix4(rc.matrixWorldInverse);
    const cp = new THREE.Vector4(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
    const pm = rc.projectionMatrix.elements, q = new THREE.Vector4((Math.sign(cp.x) + pm[8]) / pm[0], (Math.sign(cp.y) + pm[9]) / pm[5], -1, (1 + pm[10]) / pm[14]);
    cp.multiplyScalar(2 / cp.dot(q));
    pm[2] = cp.x; pm[6] = cp.y; pm[10] = cp.z + 1 - 0.003; pm[14] = cp.w;
    rc.projectionMatrixInverse.copy(rc.projectionMatrix).invert();
    // hide what should not reflect: water itself, overlays, rain
    const hidden = [];
    for (const c of this.chunks) if (c && c.tr && c.tr.visible) { c.tr.visible = false; hidden.push(c.tr); }
    for (const o of [this.hover, this.face, this.ghostBox, this.ghostEdges, this.rain, this.ghostStamp, ...(this.skirt || []).filter((m) => m.material === this.matTrans)]) if (o && o.visible) { o.visible = false; hidden.push(o); }
    this.sky.position.copy(rc.position);
    this.gl.setRenderTarget(P.refl); this.gl.render(this.scene, rc);
    for (const o of hidden) o.visible = true;
    this.sky.position.copy(cam.position);
    this.U.tRefl.value = P.refl.texture; this.U.uReflOn.value = 1;
  }

  render(opts = {}) {
    if (this.lost || !this.world) return;
    const cam = this.camera;
    this.gl.info.autoReset = false; this.gl.info.reset();
    this.sky.position.copy(cam.position);
    this.rain.material.uniforms.uCam.value.copy(cam.position);
    this.U.uFogDensity.value = (opts.fog ?? 0.0032) * this.Q.fog;
    const gl = this.gl;
    if (!this.post) { this.U.uReflOn.value = 0; gl.setRenderTarget(null); gl.render(this.scene, cam); }
    else {
      const P = this.post;
      cam.updateMatrixWorld();
      this._renderReflection(cam);
      this.U.uScreen.value.set(P.w, P.h);
      gl.setRenderTarget(P.scene_rt); gl.render(this.scene, cam);
      const tx = (rt) => P.bright.uniforms.uTexel.value.set(1 / rt.width, 1 / rt.height);
      P.bright.uniforms.tSrc.value = P.scene_rt.texture; tx(P.scene_rt); this._pass(P.bright, P.half);
      let src = P.half;
      for (const d of P.d) { P.down.uniforms.tSrc.value = src.texture; P.down.uniforms.uTexel.value.set(1 / src.width, 1 / src.height); this._pass(P.down, d); src = d; }
      // upsample and accumulate: d3 -> u2 (+d2), u2 -> u1 (+d1), u1 -> u0 (+d0)
      let cur = P.d[3];
      for (let k = 2; k >= 0; k--) { P.up.uniforms.tSrc.value = cur.texture; P.up.uniforms.tAdd.value = P.d[k].texture; P.up.uniforms.uTexel.value.set(1 / cur.width, 1 / cur.height); this._pass(P.up, P.u[k]); cur = P.u[k]; }
      const tilt = opts.tilt || 0;
      if (tilt > 0) { P.down.uniforms.tSrc.value = P.scene_rt.texture; P.down.uniforms.uTexel.value.set(1 / P.w, 1 / P.h); this._pass(P.down, P.blur); }
      const C = P.comp.uniforms;
      C.tScene.value = P.scene_rt.texture; C.tBloom.value = P.u[0].texture; C.tBlur.value = P.blur.texture;
      C.uBloom.value = this.Q.bloom * (opts.bloom ?? 0.75); C.uTilt.value = tilt; C.uFocus.value = opts.focus ?? 0.5; C.uVignette.value = opts.vignette ?? 0.3;
      C.uTexel.value.set(1 / (P.w >> 1), 1 / (P.h >> 1));
      this._pass(P.comp, null);
    }
    const info = gl.info.render;
    this.stats.draws = info.calls; this.stats.tris = info.triangles;
  }
  screenshot(opts) { this.render(opts); return this.canvas.toDataURL('image/png'); }
  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this._onLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onRestored);
    for (const c of this.chunks) this._dropChunk(c);
    if (this.skirt) for (const m of this.skirt) m.geometry.dispose();
    if (this.ents) for (const o of this.ents) o.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } });
    if (this.wires) this.wires.geometry.dispose();
    if (this.ghostStamp) this.ghostStamp.geometry.dispose();
    this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    this.matOpaque.dispose(); this.matTrans.dispose(); this.matGhost.dispose();
    this._disposePost();
    this.gl.dispose();
    try { this.gl.forceContextLoss(); } catch { /* already gone */ }
  }
}
