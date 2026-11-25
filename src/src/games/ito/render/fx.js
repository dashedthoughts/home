// ITO effects: the grapple line (a bright ribbon with a whip), anchor and zip reticles, checkpoint rings and beacon,
// paper cranes, onomatopoeia stickers, speed streaks, the blob shadow.
import * as THREE from 'three';
import { flatMaterial, additive, overlay, shared, GLSL_COMMON, hex } from './materials.js';
import { stickerTexture } from './textures.js';
import { RING_R } from '../sim/index.js';

export function createFx(scene, sim, opts = {}) {
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const group = new THREE.Group();
  scene.add(group);
  const reduced = !!opts.reduced;

  // ---------- grapple line: camera-facing ribbon, N segments, updated per frame ----------
  const N = 24;
  const lPos = new Float32Array(N * 2 * 3), lUv = new Float32Array(N * 2 * 2);
  const lIdx = [];
  for (let k = 0; k < N - 1; k++) { const a = k * 2; lIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  for (let k = 0; k < N; k++) { lUv[k * 4] = k / (N - 1); lUv[k * 4 + 1] = 0; lUv[k * 4 + 2] = k / (N - 1); lUv[k * 4 + 3] = 1; }
  const lGeo = keep(new THREE.BufferGeometry());
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute('uv', new THREE.BufferAttribute(lUv, 2));
  lGeo.setIndex(lIdx);
  const lMat = keep(new THREE.ShaderMaterial({
    uniforms: { ...shared, uA: { value: 1 }, uCue: { value: 0 } },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uA; uniform float uCue; varying vec2 vUv;
      void main() {
        float core = 1.0 - smoothstep(0.18, 0.42, abs(vUv.y - 0.5));
        // in the perfect-release window the line burns yellow: let go now
        vec3 edge = mix(vec3(0.05, 0.85, 1.0), vec3(1.0, 0.88, 0.15), uCue);
        vec3 c = mix(edge, vec3(1.0), core);
        gl_FragColor = vec4(c, 251.0 / 255.0);
      }`,
  }));
  const line = new THREE.Mesh(lGeo, lMat);
  line.frustumCulled = false; line.visible = false;
  group.add(line);
  const lineState = { t: 0, on: false, ax: 0, ay: 0, az: 0, fade: 0, hx: 0, hy: 0, hz: 0, zip: false };
  const camRight = new THREE.Vector3(), tmp = new THREE.Vector3(), hand = new THREE.Vector3(), dir = new THREE.Vector3(), perp = new THREE.Vector3(), view = new THREE.Vector3();

  function updateLine(camera, handPos, dt) {
    const on = lineState.on;
    if (!on && lineState.fade <= 0) { line.visible = false; return; }
    line.visible = true;
    lineState.t += dt;
    if (!on) lineState.fade -= dt * 7;
    const ax = lineState.ax, ay = lineState.ay, az = lineState.az;
    hand.copy(handPos);
    dir.set(ax - hand.x, ay - hand.y, az - hand.z);
    const len = dir.length();
    dir.multiplyScalar(1 / Math.max(len, 1e-4));
    // whip: the tip flies out in ~0.12 s with a wave that dies away
    const ext = Math.min(1, lineState.t / 0.12);
    const tipLen = len * (on ? 1 - Math.pow(1 - ext, 3) : Math.max(0, lineState.fade));
    const waveAmp = (on ? Math.max(0, 1 - lineState.t / 0.35) : 0.6) * Math.min(2.2, len * 0.05);
    view.copy(camera.position).sub(hand).normalize();
    perp.crossVectors(dir, view).normalize();
    const w0 = 0.03 + len * 0.0005;
    for (let k = 0; k < N; k++) {
      const u = k / (N - 1);
      const s = u * tipLen;
      const wave = Math.sin(u * 9 - lineState.t * 40) * waveAmp * Math.sin(u * Math.PI);
      // a little sag while it flies out
      const sag = (1 - ext) * Math.sin(u * Math.PI) * len * 0.08;
      tmp.copy(hand).addScaledVector(dir, s).addScaledVector(perp, wave);
      tmp.y -= sag;
      const dist = tmp.distanceTo(camera.position);
      const w = Math.max(w0, dist * 0.0019) * (1.0 - 0.3 * u);
      lPos[k * 6] = tmp.x - perp.x * w; lPos[k * 6 + 1] = tmp.y - perp.y * w; lPos[k * 6 + 2] = tmp.z - perp.z * w;
      lPos[k * 6 + 3] = tmp.x + perp.x * w; lPos[k * 6 + 4] = tmp.y + perp.y * w; lPos[k * 6 + 5] = tmp.z + perp.z * w;
    }
    lGeo.attributes.position.needsUpdate = true;
    void camRight;
  }

  // ---------- reticles: anchor (cyan ring) and zip perch (yellow diamond), constant screen size ----------
  const retTex = keep(makeReticleTex());
  const mkSprite = (map, color, size) => {
    const m = keep(new THREE.SpriteMaterial({ map, color, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true }));
    m.blending = THREE.CustomBlending; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor;
    const s = new THREE.Sprite(m); s.scale.set(size, size, 1); s.renderOrder = 10; s.visible = false; group.add(s); return s;
  };
  const anchorRet = mkSprite(retTex.ring, 0xffffff, 0.045);
  const zipRet = mkSprite(retTex.diamond, 0xffffff, 0.05);

  // ---------- rings + beacon ----------
  const ringGeo = keep(new THREE.TorusGeometry(RING_R, 0.75, 8, 48));
  const ringMat = keep(flatMaterial('#ffe14a', 228, { glow: 0.35 }));
  const ringMat2 = keep(flatMaterial('#18e7ff', 229, { glow: 0.2 }));
  const ring = new THREE.Mesh(ringGeo, ringMat), ring2 = new THREE.Mesh(ringGeo, ringMat2);
  ring.visible = ring2.visible = false;
  group.add(ring, ring2);
  // inner rim stripes: the "target" read
  const innerGeo = keep(new THREE.TorusGeometry(RING_R - 1.6, 0.25, 6, 48));
  const inner = new THREE.Mesh(innerGeo, keep(flatMaterial('#ff2bd6', 227, { glow: 0.5 })));
  ring.add(inner);
  const beaconGeo = keep(new THREE.CylinderGeometry(1.6, 1.6, 1, 16, 1, true));
  beaconGeo.translate(0, 0.5, 0);
  const beaconMat = keep(new THREE.ShaderMaterial({
    uniforms: { ...shared },
    ...additive({ side: THREE.DoubleSide }),
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; varying vec2 vUv;
      void main() {
        float a = (1.0 - vUv.y) * 0.55 + 0.1;
        float bands = 0.75 + 0.25 * step(0.5, fract(vUv.y * 40.0 - uTime * 1.5));
        gl_FragColor = vec4(vec3(1.0, 0.88, 0.3) * bands, a * 0.6);
      }`,
  }));
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.visible = false;
  group.add(beacon);

  // ---------- paper cranes (instanced) ----------
  const craneGeo = keep(makeCraneGeometry());
  const craneMat = keep(flatMaterial('#fff6e0', 160, { side: THREE.DoubleSide, glow: 0.15 }));
  const cranes = new THREE.InstancedMesh(craneGeo, craneMat, sim.cranes.length);
  cranes.frustumCulled = false;
  group.add(cranes);
  const craneGlowGeo = keep(new THREE.BufferGeometry());
  craneGlowGeo.setAttribute('position', new THREE.Float32BufferAttribute(sim.cranes.flatMap((c) => [c.x, c.y, c.z]), 3));
  const craneGlow = new THREE.Points(craneGlowGeo, keep(new THREE.ShaderMaterial({
    uniforms: { ...shared, uHide: { value: new Float32Array(32) } },
    ...additive(),
    vertexShader: /* glsl */ `uniform vec2 uRes; uniform float uTime; varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vA = 0.6 + 0.4 * sin(uTime * 3.0 + position.x); gl_PointSize = clamp(9.0 * uRes.y * 0.5 / -mv.z, 3.0, 90.0); }`,
    fragmentShader: /* glsl */ `varying float vA; void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, r); gl_FragColor = vec4(vec3(1.0, 0.85, 0.4), a * a * vA * 0.5); }`,
  })));
  craneGlow.frustumCulled = false;
  group.add(craneGlow);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

  // ---------- onomatopoeia stickers (pooled sprites) ----------
  const WORDS = {
    shu: ['シュッ', '#ffe14a', '#ff2bd6'], don: ['ドン!', '#fff6e0', '#ff3355'], byun: ['ビュン', '#18e7ff', '#ff2bd6'],
    zaza: ['ズザッ', '#ffe14a', '#18e7ff'], suta: ['スタッ', '#fff6e0', '#18e7ff'], hyu: ['ヒュオッ', '#18e7ff', '#3b1d78'],
    perfect: ['PERFECT', '#ffe14a', '#ff2bd6', true], crane: ['折り鶴', '#fff6e0', '#ff2bd6'],
  };
  const texCache = {};
  const tex = (k) => texCache[k] || (texCache[k] = keep(stickerTexture(...WORDS[k].slice(0, 3), !!WORDS[k][3])));
  const pool = [];
  for (let k = 0; k < 6; k++) {
    const m = keep(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false }));
    m.blending = THREE.CustomBlending; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor;
    const s = new THREE.Sprite(m); s.visible = false; s.renderOrder = 20; group.add(s);
    pool.push({ s, t: 0, life: 0, base: 1, rot: 0 });
  }
  let pi = 0;
  let side = 1;
  function sticker(word, x, y, z, size = 1) {
    const p = pool[pi++ % pool.length];
    p.s.material.map = tex(word); p.s.material.needsUpdate = true;
    side = -side;
    p.x = x; p.y = y; p.z = z; p.side = side;
    p.t = 0; p.life = 0.7; p.base = size; p.s.visible = true;
    p.rot = side * (0.08 + Math.random() * 0.12); p.s.material.rotation = p.rot;
  }
  const camR = new THREE.Vector3(), camU = new THREE.Vector3();

  // ---------- speed streaks: thin quads around the hero along velocity ----------
  const SK = 36;
  const skGeo = keep(new THREE.BufferGeometry());
  const skPos = new Float32Array(SK * 4 * 3), skA = new Float32Array(SK * 4);
  const skIdx = [];
  for (let k = 0; k < SK; k++) { const a = k * 4; skIdx.push(a, a + 1, a + 2, a, a + 2, a + 3); }
  skGeo.setAttribute('position', new THREE.BufferAttribute(skPos, 3));
  skGeo.setAttribute('aA', new THREE.BufferAttribute(skA, 1));
  skGeo.setIndex(skIdx);
  const skMat = keep(new THREE.ShaderMaterial({
    ...overlay({ side: THREE.DoubleSide }),
    vertexShader: /* glsl */ `attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `varying float vA; void main() { gl_FragColor = vec4(1.0, 0.98, 0.92, vA); }`,
  }));
  const streaks = new THREE.Mesh(skGeo, skMat);
  streaks.frustumCulled = false;
  group.add(streaks);
  const sk = Array.from({ length: SK }, () => ({ x: 0, y: 0, z: 0, life: 0, len: 0 }));
  let skI = 0, skAcc = 0;

  // ---------- blob shadow ----------
  const shGeo = keep(new THREE.CircleGeometry(0.8, 20));
  shGeo.rotateX(-Math.PI / 2);
  const shMat = keep(new THREE.ShaderMaterial({ ...overlay(), uniforms: { uA: { value: 0.5 } }, vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`, fragmentShader: `uniform float uA; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(0.05, 0.02, 0.1, (1.0 - smoothstep(0.5, 1.0, r)) * uA); }` }));
  const shadow = new THREE.Mesh(shGeo, shMat);
  group.add(shadow);

  return {
    group, line,
    attach(x, y, z) { lineState.on = true; lineState.t = 0; lineState.ax = x; lineState.ay = y; lineState.az = z; lineState.fade = 1; },
    detach() { if (lineState.on) { lineState.on = false; lineState.fade = 1; } },
    sticker,
    update(o) {
      const { camera, dt, t, pl, handPos, aimPos, zipPos, rings, cranesHidden, roofY, speed } = o;
      if (lineState.on && o.lineAnchor) { lineState.ax = o.lineAnchor.x; lineState.ay = o.lineAnchor.y; lineState.az = o.lineAnchor.z; }
      lMat.uniforms.uCue.value = o.cue ? (0.75 + 0.25 * Math.sin(t * 40)) : o.cueStatic ? 1 : 0;
      updateLine(camera, handPos, dt);
      // reticles
      if (aimPos) { anchorRet.visible = true; anchorRet.position.copy(aimPos); anchorRet.material.rotation = t * 0.8; } else anchorRet.visible = false;
      if (zipPos) { zipRet.visible = true; zipRet.position.copy(zipPos); const s = 0.05 + Math.sin(t * 6) * 0.004; zipRet.scale.set(s, s, 1); } else zipRet.visible = false;
      // rings
      if (rings && rings.next) {
        const r = rings.next;
        ring.visible = true; ring.position.set(r.x, r.y, r.z);
        ring.lookAt(r.x + r.fx, r.y, r.z + r.fz);
        const pulse = reduced ? 1 : 1 + Math.sin(t * 5) * 0.03;
        ring.scale.setScalar(pulse);
        beacon.visible = true; beacon.position.set(r.x, 0, r.z); beacon.scale.set(1, Math.max(1, r.y - RING_R), 1);
      } else { ring.visible = false; beacon.visible = false; }
      if (rings && rings.after) { const r = rings.after; ring2.visible = true; ring2.position.set(r.x, r.y, r.z); ring2.lookAt(r.x + r.fx, r.y, r.z + r.fz); ring2.scale.setScalar(0.7); } else ring2.visible = false;
      // cranes: spin and bob; hidden when collected or outside free roam
      for (let k = 0; k < sim.cranes.length; k++) {
        const c = sim.cranes[k];
        const hide = cranesHidden === true || (cranesHidden && cranesHidden[k]);
        q.setFromAxisAngle(up, t * 1.3 + k);
        pv.set(c.x, c.y + Math.sin(t * 2 + k) * 0.3, c.z);
        sc.setScalar(hide ? 0 : 1.4);
        m4.compose(pv, q, sc); cranes.setMatrixAt(k, m4);
      }
      cranes.instanceMatrix.needsUpdate = true;
      craneGlow.visible = cranesHidden !== true;
      // stickers: pop, hold, fade
      // stickers sit beside the courier (never on top of them), sized to the screen, pop, hold, fade
      camR.setFromMatrixColumn(camera.matrixWorld, 0); camU.setFromMatrixColumn(camera.matrixWorld, 1);
      for (const p of pool) {
        if (!p.s.visible) continue;
        p.t += dt;
        const k = p.t / p.life;
        if (k >= 1) { p.s.visible = false; continue; }
        const pop = reduced ? 1 : k < 0.12 ? 0.4 + (k / 0.12) * 0.8 : k < 0.2 ? 1.2 - ((k - 0.12) / 0.08) * 0.2 : 1;
        tmp.set(p.x, p.y, p.z);
        const dist = Math.max(3, tmp.distanceTo(camera.position));
        const h = dist * 0.085 * p.base * pop;
        p.s.position.copy(tmp).addScaledVector(camR, p.side * (h * 1.25 + dist * 0.04)).addScaledVector(camU, h * 0.55 + (reduced ? 0 : k * dist * 0.02));
        p.s.scale.set(h * 2, h, 1);
        p.s.material.opacity = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      }
      // speed streaks
      const sp = speed || 0;
      skAcc += dt * Math.max(0, sp - 26) * 1.6;
      const vx = pl.vx, vy = pl.vy, vz = pl.vz, vl = Math.hypot(vx, vy, vz) || 1;
      while (skAcc > 1 && !reduced) {
        skAcc -= 1;
        const s = sk[skI++ % SK];
        const a = Math.random() * Math.PI * 2, r = 1.4 + Math.random() * 3.5;
        // a random point on a ring around the travel axis, a little ahead
        perp.set(-vz, 0, vx).normalize(); if (perp.lengthSq() < 0.5) perp.set(1, 0, 0);
        view.crossVectors(perp, tmp.set(vx / vl, vy / vl, vz / vl)).normalize();
        s.x = o.hx + (perp.x * Math.cos(a) + view.x * Math.sin(a)) * r + (vx / vl) * 6;
        s.y = o.hy + (perp.y * Math.cos(a) + view.y * Math.sin(a)) * r + (vy / vl) * 6;
        s.z = o.hz + (perp.z * Math.cos(a) + view.z * Math.sin(a)) * r + (vz / vl) * 6;
        s.life = 0.28; s.len = 2 + sp * 0.06;
      }
      view.copy(camera.position);
      for (let k = 0; k < SK; k++) {
        const s = sk[k];
        s.life -= dt;
        const a = s.life > 0 ? Math.min(1, s.life / 0.12) * 0.55 : 0;
        const ex = s.x - (vx / vl) * s.len, ey = s.y - (vy / vl) * s.len, ez = s.z - (vz / vl) * s.len;
        tmp.set(s.x - view.x, s.y - view.y, s.z - view.z);
        perp.set(vx / vl, vy / vl, vz / vl).cross(tmp).normalize().multiplyScalar(0.025 + tmp.length() * 0.0012);
        const b = k * 12;
        skPos[b] = s.x - perp.x; skPos[b + 1] = s.y - perp.y; skPos[b + 2] = s.z - perp.z;
        skPos[b + 3] = s.x + perp.x; skPos[b + 4] = s.y + perp.y; skPos[b + 5] = s.z + perp.z;
        skPos[b + 6] = ex + perp.x; skPos[b + 7] = ey + perp.y; skPos[b + 8] = ez + perp.z;
        skPos[b + 9] = ex - perp.x; skPos[b + 10] = ey - perp.y; skPos[b + 11] = ez - perp.z;
        skA[k * 4] = skA[k * 4 + 1] = a; skA[k * 4 + 2] = skA[k * 4 + 3] = 0;
      }
      skGeo.attributes.position.needsUpdate = true; skGeo.attributes.aA.needsUpdate = true;
      // shadow on whatever is below
      const h = Math.max(0, o.hy - roofY);
      shadow.position.set(o.hx, roofY + 0.06, o.hz);
      const ss = 1 + h * 0.03;
      shadow.scale.set(ss, 1, ss);
      shMat.uniforms.uA.value = Math.max(0, 0.55 - h * 0.012);
    },
    dispose() { scene.remove(group); for (const d of disposables) d.dispose?.(); },
  };
}

function makeReticleTex() {
  const ring = document.createElement('canvas'); ring.width = ring.height = 128;
  let g = ring.getContext('2d');
  g.lineWidth = 12; g.strokeStyle = '#140a2a'; g.beginPath(); g.arc(64, 64, 44, 0, 7); g.stroke();
  g.lineWidth = 6; g.strokeStyle = '#18e7ff';
  for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(64, 64, 44, k * Math.PI / 2 + 0.25, k * Math.PI / 2 + Math.PI / 2 - 0.25); g.stroke(); }
  g.fillStyle = '#140a2a'; g.beginPath(); g.arc(64, 64, 11, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 6, 0, 7); g.fill();
  const diamond = document.createElement('canvas'); diamond.width = diamond.height = 128;
  g = diamond.getContext('2d');
  g.translate(64, 64); g.rotate(Math.PI / 4);
  g.lineWidth = 14; g.strokeStyle = '#140a2a'; g.strokeRect(-34, -34, 68, 68);
  g.lineWidth = 7; g.strokeStyle = '#ffe14a'; g.strokeRect(-34, -34, 68, 68);
  g.fillStyle = '#ffe14a'; g.fillRect(-10, -10, 20, 20);
  const a = new THREE.CanvasTexture(ring), b = new THREE.CanvasTexture(diamond);
  a.colorSpace = b.colorSpace = THREE.NoColorSpace;
  return { ring: a, diamond: b, dispose() { a.dispose(); b.dispose(); } };
}

// an origami crane from flat triangles: body, two wings, neck, tail, head
function makeCraneGeometry() {
  const tris = [
    // body (diamond, two halves folded)
    [0, 0, 0.8, 0.25, 0.2, 0, 0, 0, -0.8], [0, 0, 0.8, -0.25, 0.2, 0, 0, 0, -0.8],
    // wings, raised in a V
    [0.15, 0.15, 0.35, 1.5, 0.8, -0.1, 0.15, 0.15, -0.35], [-0.15, 0.15, 0.35, -1.5, 0.8, -0.1, -0.15, 0.15, -0.35],
    // neck and head
    [0, 0, 0.6, 0.08, 0.1, 0.65, 0, 0.9, 1.2], [0, 0.9, 1.2, 0, 0.75, 1.5, 0.05, 0.85, 1.25],
    // tail
    [0, 0, -0.6, 0.08, 0.1, -0.65, 0, 0.95, -1.2],
  ];
  const P = [];
  for (const t of tris) P.push(...t);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.computeVertexNormals();
  g.scale(1.3, 1.3, 1.3);
  return g;
}
void hex; void GLSL_COMMON;
