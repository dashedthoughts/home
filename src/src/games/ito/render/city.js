// ITO city renderer: everything static is merged into a handful of draw calls.
import * as THREE from 'three';
import { K, makeRng, HALF } from '../sim/city.js';
import { buildingMaterial, signMaterial, screenMaterial, groundMaterial, flatMaterial, additive, shared, GLSL_COMMON } from './materials.js';
import { signAtlas, screenAtlas } from './textures.js';

// ---- merged box builder (building material attributes) ----
function boxBuilder() {
  const P = [], N = [], ID = [], TO = [], SE = [], LI = [], IX = [];
  let v = 0;
  function quad(a, b, c, d, n, id, tone, seed, lit) {
    for (const p of [a, b, c, d]) { P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); ID.push(id); TO.push(tone); SE.push(seed); LI.push(lit); }
    IX.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4;
  }
  // faces: 0 -x, 1 +x, 2 -z, 3 +z, 4 top
  function box(x0, y0, z0, x1, y1, z1, tone, seed, lit, idBase, bottom = false) {
    const fid = (f) => (1 + ((idBase * 7 + f * 3) % 229)) / 255;
    quad([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [-1, 0, 0], fid(0), tone, seed, lit);
    quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0], fid(1), tone, seed, lit);
    quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [0, 0, -1], fid(2), tone, seed, lit);
    quad([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1], [0, 0, 1], fid(3), tone, seed, lit);
    quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], fid(4), tone, seed, lit);
    if (bottom) quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], fid(5), tone, seed, lit);
  }
  function build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('aId', new THREE.Float32BufferAttribute(ID, 1));
    g.setAttribute('aTone', new THREE.Float32BufferAttribute(TO, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(SE, 1));
    g.setAttribute('aLit', new THREE.Float32BufferAttribute(LI, 1));
    g.setIndex(IX);
    g.computeBoundingSphere();
    return g;
  }
  return { box, quad, build, count: () => v };
}

export function createCityView(city, scene, opts = {}) {
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const rnd = makeRng(city.seed * 3 + 1);
  const group = new THREE.Group();
  scene.add(group);

  // ---------- buildings, props, viaduct, walkway, shrine ----------
  const bb = boxBuilder();
  const litOf = (b) => (b.kind === K.TOWER ? 0.35 + 0.45 * ((b.bid * 0.618) % 1) : b.kind === K.PODIUM ? 0.55 : 0);
  for (const b of city.boxes) {
    let tone = b.tone;
    if (b.kind === K.VIADUCT || b.kind === K.PILLAR || b.kind === K.WALKWAY) tone = 6;
    else if (b.kind === K.TORII) tone = 7;
    else if (b.kind === K.SHRINE) tone = 8;
    else if (b.kind === K.BOARD) tone = 8;
    else if (b.kind === K.CROWN) tone = (b.tone + 2) % 6;
    bb.box(b.x0, b.y0, b.z0, b.x1, b.y1, b.z1, tone, (b.bid + 1) * 0.137, litOf(b), b.i, b.kind === K.VIADUCT || b.kind === K.WALKWAY || b.kind === K.BOARD);
  }
  // rooftop clutter: plant rooms, tanks, a parapet lip
  for (const t of city.towers) {
    const top = city.boxes.filter((b) => b.bid === t.bid && Math.abs(b.y1 - t.top) < 0.01 && b.kind === K.TOWER)[0];
    if (!top) continue;
    const w = top.x1 - top.x0, d = top.z1 - top.z0;
    const n = 1 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const bw = 2 + rnd() * 5, bd = 2 + rnd() * 5, bh = 1.5 + rnd() * 2.5;
      const x = top.x0 + 2 + rnd() * Math.max(0.1, w - 4 - bw), z = top.z0 + 2 + rnd() * Math.max(0.1, d - 4 - bd);
      bb.box(x, top.y1, z, x + bw, top.y1 + bh, z + bd, 8, 0.5, 0, 900 + k + t.bid * 3);
    }
    // parapet: thin lip boxes along the edges
    const ph = 1.1, pt = 0.5;
    bb.box(top.x0, top.y1, top.z0, top.x1, top.y1 + ph, top.z0 + pt, top.tone, 0.2, 0, 1000 + t.bid);
    bb.box(top.x0, top.y1, top.z1 - pt, top.x1, top.y1 + ph, top.z1, top.tone, 0.2, 0, 1001 + t.bid);
    bb.box(top.x0, top.y1, top.z0, top.x0 + pt, top.y1 + ph, top.z1, top.tone, 0.2, 0, 1002 + t.bid);
    bb.box(top.x1 - pt, top.y1, top.z0, top.x1, top.y1 + ph, top.z1, top.tone, 0.2, 0, 1003 + t.bid);
  }
  // masts
  for (const m of city.masts) {
    bb.box(m.x - 0.35, m.y0, m.z - 0.35, m.x + 0.35, m.y1, m.z + 0.35, 8, 0.3, 0, 1200 + Math.floor(m.x));
    for (let y = m.y0 + 4; y < m.y1 - 2; y += 5) bb.box(m.x - 1.6, y, m.z - 0.12, m.x + 1.6, y + 0.25, m.z + 0.12, 8, 0.3, 0, 1300 + Math.floor(y));
  }
  // viaduct: rails, parapets
  const V = city.viaduct;
  bb.box(V.x - V.half, V.y1, V.z0, V.x - V.half + 0.6, V.y1 + 1.2, V.z1, 6, 0.4, 0, 1400);
  bb.box(V.x + V.half - 0.6, V.y1, V.z0, V.x + V.half, V.y1 + 1.2, V.z1, 6, 0.4, 0, 1401);
  for (const off of [-4.2, -2.6, 2.6, 4.2]) bb.box(V.x + off - 0.12, V.y1, V.z0, V.x + off + 0.12, V.y1 + 0.25, V.z1, 8, 0.4, 0, 1402);
  // walkway railings
  const Wk = city.walk;
  bb.box(Wk.x0, Wk.y1, Wk.z - Wk.half, Wk.x1, Wk.y1 + 1.1, Wk.z - Wk.half + 0.25, 6, 0.4, 0, 1410);
  bb.box(Wk.x0, Wk.y1, Wk.z + Wk.half - 0.25, Wk.x1, Wk.y1 + 1.1, Wk.z + Wk.half, 6, 0.4, 0, 1411);
  // shrine: a pitched roof made of two slabs, and torii crossbeam
  const pk = city.park;
  {
    const hx = pk.hall.x, hz = pk.hall.z;
    bb.box(hx - 10.5, 7, hz - 7.5, hx + 10.5, 8.2, hz + 7.5, 8, 0.6, 0, 1420);
    bb.box(hx - 8, 8.2, hz - 5, hx + 8, 10.4, hz + 5, 8, 0.6, 0, 1421);
    const T = pk.torii;
    bb.box(T.x - 6.2, 7.6, T.z - 0.35, T.x + 6.2, 8.2, T.z + 0.35, 7, 0.7, 0, 1422);
    bb.box(T.x - 8.2, 10.2, T.z - 0.8, T.x + 8.2, 10.8, T.z + 0.8, 8, 0.7, 0, 1423);
  }
  // the distant skyline beyond the play area
  for (let k = 0; k < 260; k++) {
    const a = rnd() * Math.PI * 2, r = 430 + rnd() * 600;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < HALF + 40 && Math.abs(z) < HALF + 40) continue;
    const w = 20 + rnd() * 40, d = 20 + rnd() * 40, h = 30 + rnd() * rnd() * 200;
    bb.box(x - w / 2, 0, z - d / 2, x + w / 2, h, z + d / 2, Math.floor(rnd() * 6), rnd(), 0.4, 2000 + k);
  }
  const bMat = keep(buildingMaterial());
  const bGeo = keep(bb.build());
  const buildings = new THREE.Mesh(bGeo, bMat);
  buildings.matrixAutoUpdate = false;
  group.add(buildings);

  // ---------- ground ----------
  const gGeo = keep(new THREE.PlaneGeometry(2600, 2600, 1, 1));
  gGeo.rotateX(-Math.PI / 2);
  const gMat = keep(groundMaterial(city));
  const ground = new THREE.Mesh(gGeo, gMat);
  ground.matrixAutoUpdate = false;
  group.add(ground);

  // ---------- vertical neon signs (blade signs) ----------
  const sTex = keep(signAtlas());
  {
    const P = [], UV = [], AUV = [], ID = [], SE = [], IX = [];
    let v = 0;
    city.signs.forEach((s, k) => {
      const out = 2.6, nx = s.nx, nz = s.nz;
      const x0 = s.x + nx * 0.3, z0 = s.z + nz * 0.3, x1 = s.x + nx * out, z1 = s.z + nz * out;
      const y0 = s.y0, y1 = s.y0 + s.h;
      P.push(x0, y0, z0, x1, y0, z1, x1, y1, z1, x0, y1, z0);
      UV.push(0, 0, 1, 0, 1, 1, 0, 1);
      const cell = s.kind % 16;
      const u0 = (cell % 8) / 8, v0 = 1 - (Math.floor(cell / 8) + 1) / 2;
      for (let q = 0; q < 4; q++) { AUV.push(u0 + 0.004, v0 + 0.004, 1 / 8 - 0.008, 1 / 2 - 0.008); ID.push((233 + (k % 3) * 0) / 255 * 0 + (1 + ((k * 11) % 229)) / 255); SE.push((k * 0.377) % 1); }
      IX.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4;
    });
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setAttribute('aUv', new THREE.Float32BufferAttribute(AUV, 4));
    g.setAttribute('aId', new THREE.Float32BufferAttribute(ID, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(SE, 1));
    g.setIndex(IX); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, keep(signMaterial(sTex)));
    m.matrixAutoUpdate = false;
    group.add(m);
  }

  // ---------- animated billboard screens (facades + rooftop boards) ----------
  const scTex = keep(screenAtlas());
  {
    const P = [], UV = [], ID = [], SE = [], IX = [];
    let v = 0;
    const quad = (pts, seed, k) => { P.push(...pts.flat()); UV.push(0, 0, 1, 0, 1, 1, 0, 1); for (let q = 0; q < 4; q++) { ID.push((1 + ((k * 13 + 5) % 229)) / 255); SE.push(seed); } IX.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4; };
    city.screens.forEach((s, k) => {
      const t = s.t, o = 0.35, y0 = s.y0, y1 = s.y0 + s.h;
      if (s.face === 0) { const c = t.cx, z = t.z0 - o; quad([[c + s.w / 2, y0, z], [c - s.w / 2, y0, z], [c - s.w / 2, y1, z], [c + s.w / 2, y1, z]], (s.seed % 1000) / 1000, k); }
      else if (s.face === 1) { const c = t.cx, z = t.z1 + o; quad([[c - s.w / 2, y0, z], [c + s.w / 2, y0, z], [c + s.w / 2, y1, z], [c - s.w / 2, y1, z]], (s.seed % 1000) / 1000, k); }
      else if (s.face === 2) { const c = t.cz, x = t.x0 - o; quad([[x, y0, c - s.w / 2], [x, y0, c + s.w / 2], [x, y1, c + s.w / 2], [x, y1, c - s.w / 2]], (s.seed % 1000) / 1000, k); }
      else { const c = t.cz, x = t.x1 + o; quad([[x, y0, c + s.w / 2], [x, y0, c - s.w / 2], [x, y1, c - s.w / 2], [x, y1, c + s.w / 2]], (s.seed % 1000) / 1000, k); }
    });
    // rooftop boards: both faces
    let k2 = 100;
    for (const b of city.boxes) {
      if (b.kind !== K.BOARD) continue;
      const s = ((b.i * 0.61) % 1);
      const alongX = b.x1 - b.x0 > b.z1 - b.z0, e = 0.05;
      if (alongX) {
        quad([[b.x1, b.y0, b.z0 - e], [b.x0, b.y0, b.z0 - e], [b.x0, b.y1, b.z0 - e], [b.x1, b.y1, b.z0 - e]], s, k2++);
        quad([[b.x0, b.y0, b.z1 + e], [b.x1, b.y0, b.z1 + e], [b.x1, b.y1, b.z1 + e], [b.x0, b.y1, b.z1 + e]], (s + 0.3) % 1, k2++);
      } else {
        quad([[b.x0 - e, b.y0, b.z0], [b.x0 - e, b.y0, b.z1], [b.x0 - e, b.y1, b.z1], [b.x0 - e, b.y1, b.z0]], s, k2++);
        quad([[b.x1 + e, b.y0, b.z1], [b.x1 + e, b.y0, b.z0], [b.x1 + e, b.y1, b.z0], [b.x1 + e, b.y1, b.z1]], (s + 0.3) % 1, k2++);
      }
      // legs
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setAttribute('aId', new THREE.Float32BufferAttribute(ID, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(SE, 1));
    g.setIndex(IX); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, keep(screenMaterial(scTex)));
    m.matrixAutoUpdate = false;
    group.add(m);
  }

  // ---------- traffic: instanced light pairs streaming along the streets (moved in the vertex shader) ----------
  const traffic = makeTraffic(city, rnd, keep, opts.trafficScale ?? 1);
  group.add(traffic);

  // ---------- park trees: two-lobe canopies on trunks (instanced, inked apart by instance ID) ----------
  {
    const geo = keep(new THREE.IcosahedronGeometry(1, 1));
    const mat = keep(flatMaterial('#1d7a5e', 180));
    const tgeo = keep(new THREE.CylinderGeometry(0.25, 0.35, 1, 6));
    tgeo.translate(0, 0.5, 0);
    const tmat = keep(flatMaterial('#3a2433', 179));
    const n = pk.trees.length;
    const im = new THREE.InstancedMesh(geo, mat, n * 2);
    const tr = new THREE.InstancedMesh(tgeo, tmat, n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), ax = new THREE.Vector3(0, 1, 0);
    pk.trees.forEach((t, k) => {
      q.setFromAxisAngle(ax, k);
      p.set(t.x, t.h * 0.66, t.z); s.set(t.r, t.h * 0.3, t.r); m4.compose(p, q, s); im.setMatrixAt(k * 2, m4);
      p.set(t.x + t.r * 0.45, t.h * 0.86, t.z - t.r * 0.3); s.set(t.r * 0.62, t.h * 0.2, t.r * 0.62); m4.compose(p, q, s); im.setMatrixAt(k * 2 + 1, m4);
      p.set(t.x, 0, t.z); s.set(1, t.h * 0.5, 1); m4.compose(p, q, s); tr.setMatrixAt(k, m4);
    });
    im.instanceMatrix.needsUpdate = true; tr.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere(); tr.computeBoundingSphere();
    group.add(im, tr);
  }

  // ---------- warm glows: shrine lanterns, mast aviation lights (blink), walkway lamps ----------
  const glows = makeGlows(city, keep);
  group.add(glows);

  // ---------- the train on the viaduct ----------
  const train = makeTrain(city, keep);
  group.add(train.group);

  return {
    group,
    update(t, dt) { train.update(t); void dt; },
    dispose() { for (const d of disposables) d.dispose?.(); scene.remove(group); },
    buildings,
  };
}

function makeTraffic(city, rnd, keep, scale) {
  const starts = [], dirs = [], lens = [], speeds = [], phases = [], cols = [];
  const lanes = (w) => (w >= 28 ? [3, 7.5] : [2.6, 6.2]);
  const add = (sx, sz, dx, dz, len, w) => {
    for (const lo of lanes(w)) {
      for (const sgn of [1, -1]) {
        const n = Math.floor((len / 26) * scale);
        const sp = 9 + rnd() * 6;
        for (let k = 0; k < n; k++) {
          const ph = rnd() * len;
          // two lights per car, 1.6 m apart, perpendicular to travel
          for (const side of [-0.8, 0.8]) {
            const ox = -dz * (lo * sgn + side), oz = dx * (lo * sgn + side);
            starts.push(sgn > 0 ? sx + ox : sx + ox + dx * len, 0.9, sgn > 0 ? sz + oz : sz + oz + dz * len);
            dirs.push(dx * sgn, 0, dz * sgn);
            lens.push(len); speeds.push(sp * (0.9 + rnd() * 0.2)); phases.push(ph);
            cols.push(sgn > 0 ? 1 : 0); // 1 = headlights toward +dir... colour chosen per stream
          }
        }
      }
    }
  };
  const L = 2 * HALF;
  for (let i = 0; i < city.sx.length; i++) { if (i === 5) continue; add(city.sx[i], -HALF, 0, 1, L, city.wx[i]); }
  for (let j = 0; j < city.sz.length; j++) add(-HALF, city.sz[j], 1, 0, L, city.wz[j]);
  const n = lens.length;
  const base = keep(new THREE.PlaneGeometry(1, 1));
  const g = keep(new THREE.InstancedBufferGeometry());
  g.index = base.index;
  g.setAttribute('position', base.getAttribute('position'));
  g.setAttribute('uv', base.getAttribute('uv'));
  g.setAttribute('aStart', new THREE.InstancedBufferAttribute(new Float32Array(starts), 3));
  g.setAttribute('aDir', new THREE.InstancedBufferAttribute(new Float32Array(dirs), 3));
  g.setAttribute('aLen', new THREE.InstancedBufferAttribute(new Float32Array(lens), 1));
  g.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(new Float32Array(speeds), 1));
  g.setAttribute('aPhase', new THREE.InstancedBufferAttribute(new Float32Array(phases), 1));
  g.setAttribute('aCol', new THREE.InstancedBufferAttribute(new Float32Array(cols), 1));
  g.instanceCount = n;
  const mat = keep(new THREE.ShaderMaterial({
    uniforms: { ...shared },
    ...additive(),
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec3 uCamPos;
      attribute vec3 aStart; attribute vec3 aDir; attribute float aLen; attribute float aSpeed; attribute float aPhase; attribute float aCol;
      varying vec2 vUv; varying float vCol; varying float vFade;
      void main() {
        float t = mod(aPhase + uTime * aSpeed, aLen);
        vec3 c = aStart + aDir * t;
        vec4 mv = viewMatrix * vec4(c, 1.0);
        float d = length(c - uCamPos);
        float s = 0.9 + d * 0.006; // keep far lights a pixel or two wide instead of vanishing (no shimmer)
        mv.xy += position.xy * s * vec2(1.0, 0.7);
        vUv = uv; vCol = aCol; vFade = smoothstep(900.0, 300.0, d) * smoothstep(8.0, 20.0, t) * smoothstep(8.0, 20.0, aLen - t);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; varying float vCol; varying float vFade;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = (1.0 - smoothstep(0.0, 1.0, r));
        a = a * a;
        vec3 c = vCol > 0.5 ? vec3(1.0, 0.92, 0.7) : vec3(1.0, 0.12, 0.2);
        gl_FragColor = vec4(c * 1.4, a * vFade);
      }`,
  }));
  const m = new THREE.Mesh(g, mat);
  m.frustumCulled = false;
  return m;
}

function makeGlows(city, keep) {
  const pts = [], cols = [], sizes = [], blink = [];
  const pk = city.park;
  for (let k = -3; k <= 3; k++) { if (k === 0) continue; pts.push(pk.hall.x + k * 2.6, 6.2, pk.hall.z + 6.6); cols.push(1, 0.55, 0.25); sizes.push(1.8); blink.push(0); }
  for (let k = 0; k < 8; k++) { pts.push(pk.torii.x + (k % 2 ? 7 : -7), 1.6, pk.torii.z + 6 + Math.floor(k / 2) * 9); cols.push(1, 0.6, 0.3); sizes.push(1.6); blink.push(0); }
  for (const m of city.masts) { pts.push(m.x, m.y1 + 0.4, m.z); cols.push(1, 0.1, 0.15); sizes.push(3.2); blink.push(1); }
  for (const t of city.towers) if (t.H > 150) { pts.push(t.x0, t.top + 0.5, t.z0, t.x1, t.top + 0.5, t.z1); cols.push(1, 0.1, 0.15, 1, 0.1, 0.15); sizes.push(2.6, 2.6); blink.push(1, 1); }
  const Wk = city.walk;
  for (let x = Wk.x0 + 6; x < Wk.x1; x += 12) { pts.push(x, Wk.y1 + 3, Wk.z); cols.push(0.75, 0.95, 1); sizes.push(1.4); blink.push(0); }
  const g = keep(new THREE.BufferGeometry());
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.setAttribute('aCol', new THREE.Float32BufferAttribute(cols, 3));
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  g.setAttribute('aBlink', new THREE.Float32BufferAttribute(blink, 1));
  const mat = keep(new THREE.ShaderMaterial({
    uniforms: { ...shared },
    ...additive(),
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec2 uRes; uniform float uFlicker;
      attribute vec3 aCol; attribute float aSize; attribute float aBlink;
      varying vec3 vCol;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float on = aBlink > 0.5 ? 0.35 + 0.65 * step(0.5, fract(uTime * 0.7 + position.x * 0.01)) : 1.0;
        vCol = aCol * on;
        gl_PointSize = clamp(aSize * uRes.y * 0.9 / -mv.z, 2.0, 48.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vCol;
      void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.1, 1.0, r); gl_FragColor = vec4(vCol * 1.3, a * a); }`,
  }));
  const pts3 = new THREE.Points(g, mat);
  pts3.frustumCulled = false;
  return pts3;
}

function makeTrain(city, keep) {
  const V = city.viaduct;
  const group = new THREE.Group();
  const cars = 8, len = 19, gap = 0.8;
  const body = keep(new THREE.BoxGeometry(3.0, 3.4, len));
  const win = keep(new THREE.BoxGeometry(3.06, 0.9, len - 2));
  const bodyMat = keep(flatMaterial('#c9c6d8', 214));
  const winMat = keep(flatMaterial('#ffe3a0', 215, { glow: 1 }));
  const stripe = keep(new THREE.BoxGeometry(3.08, 0.35, len - 0.4));
  const stripeMat = keep(flatMaterial('#18e7ff', 216, { glow: 0.6 }));
  const ims = [new THREE.InstancedMesh(body, bodyMat, cars), new THREE.InstancedMesh(win, winMat, cars), new THREE.InstancedMesh(stripe, stripeMat, cars)];
  for (const m of ims) { m.frustumCulled = false; group.add(m); }
  const m4 = new THREE.Matrix4();
  const offs = [0, 0.5, -0.65];
  return {
    group,
    update(t) {
      // one train each way, alternating every pass: 90 s loop
      const L = V.z1 - V.z0 + 400;
      const ph = (t * 22) % L;
      const dir = Math.floor((t * 22) / L) % 2 === 0 ? 1 : -1;
      const head = dir > 0 ? V.z0 - 200 + ph : V.z1 + 200 - ph;
      for (let k = 0; k < cars; k++) {
        const z = head - dir * k * (len + gap);
        for (let j = 0; j < 3; j++) { m4.makeTranslation(V.x + 2.6 * dir * -1 * 0 + (dir > 0 ? -2.6 : 2.6), V.y1 + 2.0 + offs[j], z); ims[j].setMatrixAt(k, m4); }
      }
      for (const m of ims) m.instanceMatrix.needsUpdate = true;
    },
  };
}
