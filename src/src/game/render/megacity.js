// Megacity layer: the 80s cel-anime city details. Light trails, searchlights, blade signs, the elevated expressway.
// Everything is original geometry and generic signage words; no film assets, logos or places.
import * as THREE from 'three';
import { U, BEND_GLSL, std, basic, glowMaterial, latticeMaterial, blinkGlowMaterial } from './materials.js';
import { skylineMaterial } from './facade.js';
import * as C1 from '../track/c1.js';

const HDR = (c, k) => new THREE.Color(c).multiplyScalar(k);

// ---------------------------------------------------------------- tail-light trails (player)
// [look] A long-exposure streak per tail light, as a camera would record it: nothing at cruising speed, a thin streak
// behind each lamp from ~180 km/h, a longer one only while boosting. It is drawn from the car's recent lateral history
// (a swerve bends it), is never taller than the lamp and fades to nothing. Length is capped at 1.3 m on purpose: the chase
// camera sits only ~4 m behind the lamps, so anything longer runs off the bottom of the frame as a giant ribbon.
export function createPlayerTrails(scene) {
  const N = 56;
  const ribbons = [-1, 1].map(() => {
    const pos = new Float32Array(N * 2 * 3);
    const fade = new Float32Array(N * 2);
    const idx = [];
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aFade', new THREE.BufferAttribute(fade, 1));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: HDR('#ff1a2c', 2.2) } },
      vertexShader: 'attribute float aFade; varying float vF; void main(){ vF = aFade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uColor; varying float vF; void main(){ gl_FragColor = vec4(uColor * vF * vF, 1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    m.frustumCulled = false;
    scene.add(m);
    return { m, pos, fade, g };
  });

  // ring buffer of recent positions (no per-frame allocation)
  const hx = new Float32Array(N), hz = new Float64Array(N), ht = new Float64Array(N), hr = new Float32Array(N);
  let head = 0, count = 0, boostK = 0;
  return {
    // roll: the vehicle's lean, so the trail leaves the tail light where it really is (bikes lean hard)
    update(S, rearZ, halfW, y, life = 0.38, roll = 0) {
      // a restart or a jump along the road: forget the history (it used to draw stray ribbons across the frame)
      if (count && (Math.abs(S.z - hz[head]) > 12 || S.time < ht[head])) count = 0;
      const dtT = count ? Math.min(0.1, Math.max(0, S.time - ht[head])) : 0;
      head = (head + N - 1) % N;
      hx[head] = S.x; hz[head] = S.z; ht[head] = S.time; hr[head] = roll;
      count = Math.min(N, count + 1);
      // 0 below ~175 km/h, full by ~205 km/h; boosting (overclock or slipstream) eases in over a quarter second
      const fastT = Math.min(1, Math.max(0, (S.speed - 48.5) / 8.5)), fast = fastT * fastT * (3 - 2 * fastT);
      boostK += ((S.overclock || S.slip > 0 ? 1 : 0) - boostK) * Math.min(1, dtT * 4);
      const on = life > 0 ? Math.max(fast, boostK) : 0;
      const len = 0.55 + 0.25 * fast + 0.5 * boostK; // metres: 0.55 to 1.3
      const w = 0.022;
      for (let ri = 0; ri < 2; ri++) {
        const r = ribbons[ri], side = ri ? 1 : -1, pos = r.pos, fade = r.fade;
        let px = 0, pr = 0, pd = 0, done = false, ex = 0, er = 0;
        for (let i = 0; i < N; i++) {
          const k = (head + Math.min(i, count - 1)) % N;
          let hxk = hx[k], rr = hr[k], dz = S.z - hz[k];
          // cut the streak at exactly `len` (interpolating the last segment), whatever the frame rate; the rest collapses there
          if (done) { hxk = ex; rr = er; dz = len; }
          else if (dz >= len) { const t = i ? (len - pd) / Math.max(1e-4, dz - pd) : 0; hxk = i ? px + (hxk - px) * t : hxk; rr = i ? pr + (rr - pr) * t : rr; dz = len; done = true; ex = hxk; er = rr; }
          px = hxk; pr = rr; pd = dz;
          const f = Math.max(0, 1 - dz / len) * on;
          const cr = Math.cos(rr), sr = Math.sin(rr);
          const x = hxk + side * halfW * cr - y * sr, yy = y * cr + side * halfW * sr, z = rearZ + 0.12 + dz, o = i * 6;
          pos[o] = x; pos[o + 1] = yy + w; pos[o + 2] = z;
          pos[o + 3] = x; pos[o + 4] = yy - w; pos[o + 5] = z;
          fade[i * 2] = fade[i * 2 + 1] = f;
        }
        r.g.attributes.position.needsUpdate = true;
        r.g.attributes.aFade.needsUpdate = true;
      }
    },
    setColor(c) { ribbons.forEach((r) => r.m.material.uniforms.uColor.value.copy(c)); },
  };
}

// ---------------------------------------------------------------- trails for traffic (instanced, bent)
export function createTrafficTrails(scene, max = 64) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...U, uColor: { value: HDR('#ff1a2c', 1.5) } }, // [look] thin and dim: a streak, not a ribbon
    vertexShader: `${BEND_GLSL}
      varying vec2 vUv; varying float vD;
      void main(){ vUv = uv; vec4 wp = bendW(modelMatrix * instanceMatrix * vec4(position, 1.0)); vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    // fades out with distance: far away the streak is thinner than a pixel and would only shimmer
    fragmentShader: `uniform vec3 uColor; varying vec2 vUv; varying float vD;
      void main(){ float x = (vUv.x - 0.5) * 2.0; float a = exp(-x * x * 5.0) * pow(vUv.y, 1.6) * (1.0 - smoothstep(45.0, 120.0, vD)); gl_FragColor = vec4(uColor * a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  // plane lying flat, uv.y = 1 at the lamp, 0 at the tail end
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
  const mesh = new THREE.InstancedMesh(geo, mat, max);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  let n = 0;
  return {
    begin() { n = 0; },
    add(x, y, z, len) {
      if (n >= max) return;
      mesh.setMatrixAt(n++, m.compose(p.set(x, y, z), q, s.set(0.07, 1, len * 0.6)));
    },
    end() { mesh.count = n; mesh.instanceMatrix.needsUpdate = true; },
  };
}

// ---------------------------------------------------------------- searchlights
export function createSearchlights(parent) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: HDR('#fff1d6', 0.22) } },
    vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ vH = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ float core = pow(abs(dot(vN, vV)), 3.0); float a = core * pow(vH, 1.6) * (1.0 - smoothstep(0.97, 1.0, vH)); gl_FragColor = vec4(uColor * a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  });
  // tip at the base, opening upward
  const geo = new THREE.ConeGeometry(42, 900, 24, 1, true).rotateX(Math.PI).translate(0, 450, 0);
  const beams = [];
  const spots = [[-420, -1100], [260, -1250], [-120, -1400], [520, -900]];
  for (const [x, z] of spots) {
    const b = new THREE.Mesh(geo, mat);
    b.position.set(x, -20, z);
    parent.add(b);
    beams.push({ b, phase: Math.random() * 10, speed: 0.12 + Math.random() * 0.15 });
  }
  return {
    set visible(v) { beams.forEach((x) => (x.b.visible = v)); },
    update(t) {
      for (const x of beams) {
        x.b.rotation.z = Math.sin(t * x.speed + x.phase) * 0.45;
        x.b.rotation.x = Math.cos(t * x.speed * 0.7 + x.phase) * 0.2 - 0.1;
      }
    },
  };
}

// ---------------------------------------------------------------- blade signs (vertical neon lettering)
const SIGN_WORDS = ['高速', '出口', '電気', '夜行', '未来', '珈琲', '薬局', '酒場', 'ホテル', '駐車場', '自由', '中央', '整備', '情報'];
const SIGN_COLORS = ['#ff2a3a', '#ffd9a0', '#00f0ff', '#ff8a2a', '#ff2bd6', '#fff4e0', '#b8ff2e'];
const CJK_FONT = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", "Noto Sans CJK JP", sans-serif';

export function signTextures() {
  const list = SIGN_WORDS.map((word, i) => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 448;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const draw = () => {
      const g = c.getContext('2d');
      const col = SIGN_COLORS[i % SIGN_COLORS.length];
      g.fillStyle = '#0a0709';
      g.fillRect(0, 0, 128, 448);
      g.strokeStyle = col;
      g.lineWidth = 6;
      g.strokeRect(6, 6, 116, 436);
      g.fillStyle = col;
      const chars = [...word];
      const step = Math.min(118, 400 / chars.length);
      g.font = `900 ${Math.round(step * 0.82)}px ${CJK_FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      chars.forEach((ch, k) => g.fillText(ch, 64, 24 + step * (k + 0.5) + (400 - step * chars.length) / 2));
      // little latin sub-label like real signage
      g.font = '400 14px "Share Tech Mono", monospace';
      g.globalAlpha = 0.7;
      g.fillText(String(100 + i * 7), 64, 432);
      g.globalAlpha = 1;
      tex.needsUpdate = true;
    };
    draw();
    return { tex, draw };
  });
  if (document.fonts?.ready) Promise.all([document.fonts.load('900 40px "Noto Sans JP"', '高速'), document.fonts.load('700 40px Rajdhani'), document.fonts.load('400 20px "Share Tech Mono"')]).catch(() => {}).then(() => list.forEach((t) => t.draw()));
  return list.map((t) => t.tex);
}

// ---------------------------------------------------------------- elevated expressway (right side, overhead)
export function createViaduct(scene, roadLen, near) {
  const X = 15.5, Y = 13, W = 8.5;
  const group = new THREE.Group();
  scene.add(group);
  const strip = (w, h, d) => new THREE.BoxGeometry(w, h, d, 1, 1, 380).translate(0, 0, near - d / 2);
  const concrete = std({ color: '#17141c', roughness: 0.85, metalness: 0.1 });
  const deck = new THREE.Mesh(strip(W, 1.4, roadLen), concrete);
  deck.position.set(X, Y, 0);
  const parapetL = new THREE.Mesh(strip(0.3, 1.1, roadLen), concrete);
  parapetL.position.set(X - W / 2 + 0.15, Y + 1.25, 0);
  const parapetR = parapetL.clone();
  parapetR.position.x = X + W / 2 - 0.15;
  const sodium = basic({ color: HDR('#ff8a2a', 3.2) });
  const tubeL = new THREE.Mesh(strip(0.1, 0.1, roadLen), sodium);
  tubeL.position.set(X - W / 2 - 0.02, Y - 0.5, 0);
  const tubeT = new THREE.Mesh(strip(0.08, 0.08, roadLen), basic({ color: HDR('#ff2a3a', 2.4) }));
  tubeT.position.set(X - W / 2 + 0.15, Y + 1.85, 0);
  scene.add(deck, parapetL, parapetR, tubeL, tubeT);

  // periodic: pillars + under-deck sodium lamps (shifted by z mod period, like the street lamps)
  const GAP = 32;
  const n = Math.ceil(roadLen / GAP) + 1;
  const pillars = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, Y, 1.8).translate(0, Y / 2, 0), concrete, n);
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(W + 1, 1.2, 2.4), concrete, n);
  const under = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMaterial({ gain: 1.0 }), n * 2);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const z = near - k * GAP;
    pillars.setMatrixAt(k, m.makeTranslation(X + 1.5, 0, z));
    caps.setMatrixAt(k, m.makeTranslation(X, Y - 1.1, z));
    under.setMatrixAt(k * 2, m.compose(p.set(X - 2, Y - 0.9, z - GAP / 2), q, s.set(4, 4, 4)));
    under.setMatrixAt(k * 2 + 1, m.compose(p.set(X + 2.5, Y - 0.9, z - GAP / 2), q, s.set(4, 4, 4)));
    under.setColorAt(k * 2, new THREE.Color('#ff8a2a'));
    under.setColorAt(k * 2 + 1, new THREE.Color('#ff8a2a'));
  }
  for (const im of [pillars, caps, under]) { im.frustumCulled = false; group.add(im); }

  // traffic on the deck: pairs of lights flowing both ways
  const FLOW = 40;
  const flow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMaterial({ gain: 1.6 }), FLOW * 2);
  flow.frustumCulled = false;
  scene.add(flow);
  const cars = Array.from({ length: FLOW }, (_, i) => ({
    dir: i % 2 ? 1 : -1, lane: i % 2 ? X + 2 : X - 2, off: Math.random() * roadLen, v: 25 + Math.random() * 20,
  }));
  cars.forEach((c, i) => {
    const col = c.dir > 0 ? new THREE.Color('#fff4e0') : new THREE.Color('#ff1a2c');
    flow.setColorAt(i * 2, col);
    flow.setColorAt(i * 2 + 1, col);
  });

  const all = [group, flow, deck, parapetL, parapetR, tubeL, tubeT];
  return {
    setVisible(v) { all.forEach((o) => (o.visible = v)); },
    update(S, t) {
      group.position.z = S.z % GAP;
      for (let i = 0; i < FLOW; i++) {
        const c = cars[i];
        // world z of each deck car: its own motion minus ours, wrapped into the visible strip
        let z = ((c.off - t * c.v * c.dir + S.z) % roadLen + roadLen) % roadLen;
        z = near - z;
        for (const sx of [-0.6, 0.6]) {
          flow.setMatrixAt(i * 2 + (sx > 0 ? 1 : 0), m.compose(p.set(c.lane + sx, Y + 1.15, z), q, s.set(1.6, 1.6, 1.6)));
        }
      }
      flow.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- the tower (original lattice design)
// Four tapered legs, ring frames, X-bracing, two decks and a mast, drawn as glowing lines in red/white bands.
export function createTower(parent) {
  const g = new THREE.Group();
  const H = 330, B = 46, T = 5;
  const pts = [], cols = [];
  const red = HDR('#ff3b1f', 3.2), white = HDR('#fff1e0', 2.6);
  const half = (y) => B + (T - B) * Math.pow(y / H, 0.75);
  const corner = (y, k) => { const h = half(y); return [[-h, y, -h], [h, y, -h], [h, y, h], [-h, y, h]][k]; };
  const seg = (a, b, c) => { pts.push(...a, ...b); cols.push(c.r, c.g, c.b, c.r, c.g, c.b); };
  const RINGS = 22;
  for (let i = 0; i < RINGS; i++) {
    const y0 = (i / RINGS) * H * 0.86, y1 = ((i + 1) / RINGS) * H * 0.86;
    const c = Math.floor(i / 2) % 2 ? white : red;
    for (let k = 0; k < 4; k++) {
      seg(corner(y0, k), corner(y1, k), c);                          // leg
      seg(corner(y1, k), corner(y1, (k + 1) % 4), c);                 // ring
      seg(corner(y0, k), corner(y1, (k + 1) % 4), c);                 // brace
      seg(corner(y0, (k + 1) % 4), corner(y1, k), c);                 // brace
    }
  }
  // mast
  seg([0, H * 0.86, 0], [0, H, 0], white);
  seg([-2, H * 0.86, 0], [0, H, 0], red);
  seg([2, H * 0.86, 0], [0, H, 0], red);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, fog: false })));
  // observation decks: lit window bands
  const deckMat = new THREE.MeshBasicMaterial({ color: HDR('#ffb070', 0.9), fog: false });
  for (const [y, s] of [[H * 0.36, 1.05], [H * 0.66, 1.1]]) {
    const w = half(y) * 2 * s;
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, 4, w), deckMat);
    d.position.y = y;
    g.add(d);
  }
  // beacons
  const glow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMaterial({ gain: 3, fog: false, bent: false }), 6);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  [[0, H, 0, 30], [-half(H * 0.66) - 4, H * 0.66, 0, 18], [half(H * 0.66) + 4, H * 0.66, 0, 18], [0, H * 0.86, 0, 22], [-B, 4, -B, 16], [B, 4, B, 16]].forEach(([x, y, z, s], i) => {
    glow.setMatrixAt(i, m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s)));
    glow.setColorAt(i, new THREE.Color(i < 4 ? '#ff2a1a' : '#ffb27a'));
  });
  glow.frustumCulled = false;
  g.add(glow);
  g.position.set(-330, -30, -1180);
  g.scale.setScalar(1.3);
  parent.add(g);
  return g;
}

// ---------------------------------------------------------------- the city carpet below the elevated road
// Seen from the lookout: sodium street grid and scattered windows to the horizon.
export function createCityCarpet(parent) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uA: { value: HDR('#ff8a2a', 1.6) }, uB: { value: HDR('#eef4ff', 1.2) }, uC: { value: HDR('#ff2a3a', 1.4) } },
    vertexShader: 'varying vec2 vP; varying float vD; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xz; vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: `
      uniform vec3 uA, uB, uC; uniform float uTime; varying vec2 vP; varying float vD;
      float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        // blocks of uneven size: streets every ~40 m, avenues every ~200 m
        vec2 cell = vP / 40.0; vec2 id = floor(cell); vec2 f = fract(cell);
        vec2 av = vP / 200.0; vec2 af = abs(fract(av) - 0.5);
        float street = max(smoothstep(0.06, 0.02, abs(f.x - 0.5) * (0.9 + 0.3 * h(id.yy))), smoothstep(0.06, 0.02, abs(f.y - 0.5) * (0.9 + 0.3 * h(id.xx))));
        float avenue = max(smoothstep(0.022, 0.006, af.x), smoothstep(0.022, 0.006, af.y));
        // rooftops: dark slabs with a faint tone per building, lit windows scattered across them
        vec2 bid = floor(vP / vec2(13.0, 17.0));
        vec3 roof = vec3(0.025, 0.028, 0.045) * (0.6 + 0.8 * h(bid));
        vec2 w = vP / 2.6; vec2 wid = floor(w);
        float win = step(0.86, h(wid + bid)) * step(0.25, fract(w.x)) * step(0.3, fract(w.y));
        vec3 col = roof + mix(vec3(1.0, 0.82, 0.55), vec3(0.75, 0.9, 1.0), h(wid * 1.7)) * win * 0.55;
        // neon on some roofs (billboards): a coloured glow patch
        float sign = step(0.93, h(bid * 0.71)) * smoothstep(0.5, 0.15, length(fract(vP / vec2(13.0, 17.0)) - 0.5));
        col += mix(vec3(1.0, 0.2, 0.6), vec3(0.2, 0.9, 1.0), h(bid * 3.3)) * sign * 1.6;
        // streets: warm sodium glow; avenues brighter, with moving car lights (white one way, red the other)
        col = mix(col, uA * 0.45, street * 0.85);
        float lane = fract(av.x) < 0.5 ? 1.0 : -1.0;
        float flowX = step(0.94, h(vec2(floor(vP.x / 9.0 - uTime * 3.0), floor(vP.y / 3.0))));
        float flowZ = step(0.94, h(vec2(floor(vP.y / 9.0 + uTime * 3.0), floor(vP.x / 3.0))));
        vec3 cars = mix(uB, uC, step(0.5, fract(vP.x / 6.0))) * max(flowX * smoothstep(0.012, 0.0, af.y), flowZ * smoothstep(0.012, 0.0, af.x));
        col = mix(col, uA * 0.9, avenue * 0.8) + cars * 2.2;
        // the big crossings glow
        col += uB * 0.5 * smoothstep(0.05, 0.0, max(af.x, af.y));
        float fade = smoothstep(2600.0, 600.0, vD) * smoothstep(60.0, 220.0, vD);
        gl_FragColor = vec4(col * fade, 1.0);
      }`,
    fog: false, depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), mat);
  plane.position.y = -45;
  plane.renderOrder = -5;
  parent.add(plane);
  return plane;
}

// ---------------------------------------------------------------- tunnel (after each junction)
export function createTunnel(scene, length) {
  const g = new THREE.Group();
  const segs = Math.round(length / 2);
  const wallGeo = new THREE.BoxGeometry(0.8, 10.4, length, 1, 1, segs).translate(0, 5.2, -length / 2);
  const roofGeo = new THREE.BoxGeometry(17.6, 0.8, length, 1, 1, segs).translate(0, 10.4, -length / 2);
  const concrete = std({ color: '#100e14', roughness: 0.9, metalness: 0.05 });
  const lw = new THREE.Mesh(wallGeo, concrete); lw.position.x = -8.4;
  const rw = new THREE.Mesh(wallGeo, concrete); rw.position.x = 8.4;
  const roof = new THREE.Mesh(roofGeo, concrete);
  g.add(lw, rw, roof);
  // portal face with a sign band
  const portal = new THREE.Mesh(new THREE.BoxGeometry(20, 4.5, 1.2).translate(0, 12.6, 0), concrete);
  g.add(portal);
  const band = new THREE.Mesh(new THREE.BoxGeometry(20, 0.18, 0.1).translate(0, 10.9, 0.65), basic({ color: HDR('#ff8a2a', 4) }));
  g.add(band);
  // strobing ceiling lights: the rhythm you feel at speed
  const n = Math.floor(length / 6);
  const lights = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), basic({ color: HDR('#ffb35a', 5) }), n * 2);
  const wallStrip = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.18, 3.4), basic({ color: HDR('#00f0ff', 2.6) }), n * 2);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    for (const sx of [-1, 1]) {
      lights.setMatrixAt(i * 2 + (sx > 0 ? 1 : 0), m.makeTranslation(sx * 4.2, 9.9, -3 - i * 6));
      wallStrip.setMatrixAt(i * 2 + (sx > 0 ? 1 : 0), m.makeTranslation(sx * 7.95, 1.2, -3 - i * 6));
    }
  }
  for (const im of [lights, wallStrip]) { im.frustumCulled = false; g.add(im); }
  g.traverse((o) => (o.frustumCulled = false));
  scene.add(g);
  return g;
}

// =====================================================================================================================
// Real Tokyo beyond the road: landmarks at their true positions, a skyline that knows where the land and water are,
// elevated trains, aircraft on the Haneda approach. All of it lives in a "north frame" (x = east, −z = north, origin at the
// car) inside a group that world.js rotates by the real heading (track/c1.js headingAt), so everything swings round as
// the road turns. Far things are pulled in to DMAX and scaled down to keep their true angular size (the sky dome is 2200 m).
// =====================================================================================================================
const DMAX = 1900;
const _car = { x: 0, y: 0 };
const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

// a tapered square lattice envelope: 4 faces, uv.x across a face (legs at 0 and 1), uv.y = height in metres
function latticeEnvelope(halfAt, H, rows, sides = 4) {
  const pos = [], uv = [], idx = [];
  for (let f = 0; f < sides; f++) {
    const a0 = (f / sides) * Math.PI * 2 + Math.PI / sides, a1 = ((f + 1) / sides) * Math.PI * 2 + Math.PI / sides;
    const v0 = pos.length / 3;
    for (let r = 0; r <= rows; r++) {
      const y = (r / rows) * H, h = halfAt(y) / Math.cos(Math.PI / sides);
      pos.push(Math.cos(a0) * h, y, Math.sin(a0) * h, Math.cos(a1) * h, y, Math.sin(a1) * h);
      uv.push(0, y, 1, y);
      if (r < rows) { const a = v0 + r * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
const glowSprites = (n, gain = 2.4) => {
  const geo = new THREE.PlaneGeometry(1, 1), blink = new Float32Array(n * 4);
  geo.setAttribute('aBlink', new THREE.InstancedBufferAttribute(blink, 4));
  const m = new THREE.InstancedMesh(geo, blinkGlowMaterial({ gain, fog: false, bent: false }), n);
  m.frustumCulled = false;
  for (let i = 0; i < n; i++) { m.setColorAt(i, new THREE.Color('#ffffff')); m.setMatrixAt(i, _m.makeScale(0, 0, 0)); }
  return { m, blink, n: 0, add(x, y, z, size, color, rate = 0, phase = 0, duty = 1, floor = 1) {
    const i = this.n++; m.setMatrixAt(i, _m.compose(_p.set(x, y, z), _q.identity(), _s.set(size, size, size))); m.setColorAt(i, new THREE.Color(color));
    blink.set([rate, phase, duty, floor], i * 4);
  } };
};

// Tokyo Tower (1958, 333 m): orange-white lattice under its "landmark light" floods, the main deck at 150 m, the top deck at 250 m.
function buildTokyoTower() {
  const g = new THREE.Group();
  const H = 333, half = (y) => y < 296 ? 2.4 + 41.6 * Math.pow(1 - y / 300, 2.25) : 1.2;
  g.add(new THREE.Mesh(latticeEnvelope(half, 296, 60), latticeMaterial({ color: '#ff7a2a', color2: '#ffe2b8', gain: 2.1, rings: 9, panels: 3, bands: 0 })));
  const mast = new THREE.Mesh(latticeEnvelope(() => 1.1, 37, 6).translate(0, 296, 0), latticeMaterial({ color: '#ffd6a8', gain: 2.2, rings: 4, panels: 1 }));
  g.add(mast);
  const deckMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe0b0').multiplyScalar(1.6), fog: false });
  const dark = new THREE.MeshBasicMaterial({ color: '#1a0e0a', fog: false });
  for (const [y, h, w] of [[145, 10, half(150) * 2 + 7], [247, 5, half(250) * 2 + 4]]) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), dark); d.position.y = y + h / 2; g.add(d);
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, h * 0.42, w + 0.3), deckMat); band.position.y = y + h * 0.55; g.add(band);
  }
  const lights = glowSprites(12, 2.6);
  lights.add(0, H, 0, 7, '#ff2a1a', 0.5, 0, 0.5, 0.05);
  for (const [y, k] of [[156, 1], [253, 1]]) for (const sx of [-1, 1]) lights.add(sx * (half(y) + 4) * k, y, 0, 5, '#ff2a1a', 0.5, 0.02, 0.5, 0.05);
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) lights.add(x * 40, 3, z * 40, 16, '#ffb070', 0, 0, 1, 1);   // floods at the feet
  g.add(lights.m);
  return g;
}
// Tokyo Skytree (2012, 634 m): pale blue lattice ("iki"), two observation decks, the antenna on top.
function buildSkytree() {
  const g = new THREE.Group();
  const half = (y) => 2.5 + 31 * Math.pow(1 - y / 690, 1.15);
  g.add(new THREE.Mesh(latticeEnvelope(half, 497, 50, 6), latticeMaterial({ color: '#8fdcff', color2: '#ffffff', gain: 2.0, rings: 14, panels: 2 })));
  g.add(new THREE.Mesh(latticeEnvelope(() => 2.2, 137, 8, 6).translate(0, 497, 0), latticeMaterial({ color: '#cfefff', gain: 1.8, rings: 8, panels: 1 })));
  const deckMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f6ff').multiplyScalar(1.8), fog: false });
  for (const [y, h, r] of [[340, 14, half(347) + 9], [445, 6, half(448) + 5]]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, h, 24), deckMat); d.position.y = y + h / 2; g.add(d); }
  const lights = glowSprites(4, 2.4);
  lights.add(0, 634, 0, 14, '#ff2a1a', 0.5, 0.3, 0.5, 0.05); lights.add(0, 497, 0, 10, '#ff2a1a', 0.5, 0.3, 0.5, 0.05);
  g.add(lights.m);
  return g;
}
// Rainbow Bridge (1993): two white towers 126 m, the deck at ~50 m, the cable "necklace" lights. Built along +x.
function buildRainbowBridge() {
  const g = new THREE.Group();
  const white = new THREE.MeshBasicMaterial({ color: new THREE.Color('#dfe6f2').multiplyScalar(0.9), fog: false });
  const deck = new THREE.MeshBasicMaterial({ color: '#1a1c22', fog: false });
  for (const tx of [-285, 285]) {
    for (const tz of [-13, 13]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(6, 126, 5).translate(0, 63, 0), white); leg.position.set(tx, 0, tz); g.add(leg); }
    for (const y of [70, 104, 124]) { const b = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 30), white); b.position.set(tx, y, 0); g.add(b); }
  }
  const d = new THREE.Mesh(new THREE.BoxGeometry(920, 7, 30).translate(0, 49, 0), deck); g.add(d);
  const lamps = new THREE.Mesh(new THREE.BoxGeometry(920, 0.8, 30.4).translate(0, 52.6, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(1.2), fog: false }));
  g.add(lamps);
  const necklace = glowSprites(190, 2.0);
  const cable = (x) => { const ax = Math.abs(x); if (ax <= 285) return 58 + 68 * Math.pow(ax / 285, 2); return 126 - 72 * Math.pow((ax - 285) / 175, 1.4); };
  for (const tz of [-13, 13]) for (let x = -455; x <= 455; x += 10) necklace.add(x, cable(x), tz, 4.5, '#f4f7ff', 0, 0, 1, 1);
  for (const tx of [-285, 285]) for (const tz of [-13, 13]) necklace.add(tx, 127, tz, 8, '#ff2a1a', 0.5, 0.1, 0.5, 0.05);
  g.add(necklace.m);
  return g;
}
// Tokyo Station, Marunouchi building (1914, restored 2012): a long low brick front with two domes, warm floodlit.
function buildStation() {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#6a2a1c'; x.fillRect(0, 0, 512, 64);
  x.fillStyle = '#e8e0d0'; for (const y of [20, 40]) x.fillRect(0, y, 512, 2);
  for (let i = 0; i < 128; i++) for (const y of [6, 26, 46]) { x.fillStyle = i % 5 === 0 ? '#ffe9b8' : '#ffcf80'; x.fillRect(i * 4 + 1, y, 2, 10); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const facade = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color('#ffffff').multiplyScalar(1.1), fog: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(335, 24, 22).translate(0, 12, 0), facade); g.add(body);
  const roof = new THREE.MeshBasicMaterial({ color: '#2a3a36', fog: false });
  for (const dx of [-150, 150]) {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 8, 8).translate(0, 28, 0), facade); drum.position.x = dx; g.add(drum);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(11.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 32, 0), roof); dome.position.x = dx; g.add(dome);
  }
  const mid = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 24).translate(0, 15, 0), facade); g.add(mid);
  return g;
}
// box towers for the named skyline: Roppongi Hills Mori Tower, Toranomon Hills, the Shiodome towers, the Tocho twin towers
function namedTowers() {
  const T = [];
  const lm = (id) => C1.LANDMARKS.find((l) => l.id === id);
  const at = (id, dx, dy, w, h, d, crown) => { const l = lm(id); T.push({ x: l.x + dx, y: l.y + dy, w, h, d, crown }); };
  at('roppongi-hills', 0, 0, 62, 238, 52, '#bfe9ff');
  at('toranomon-hills', 0, 0, 50, 222, 50, '#ffe0a8'); at('toranomon-hills', 0, 0, 36, 256, 36, '#ffe0a8');
  at('shiodome', 0, 0, 44, 213, 30, '#e8f2ff'); at('shiodome', 120, 160, 40, 200, 40, null); at('shiodome', -110, 220, 36, 170, 36, null); at('shiodome', 40, -180, 46, 190, 34, '#bfe9ff');
  at('tocho', -90, 0, 52, 243, 40, '#ffffff'); at('tocho', 90, 0, 52, 243, 40, '#ffffff'); at('tocho', -400, -700, 50, 223, 50, null); at('tocho', 500, -300, 46, 210, 46, null); at('tocho', 250, 520, 44, 200, 44, null);
  return T;
}

// land and water around the loop, in track metres (approximate, labelled): what the far skyline may stand on
const ELL = [[-571, 760, 700, 820], [-650, 1560, 330, 360], [-130, -380, 190, 200], [542, -1909, 240, 220], [-777, -2186, 230, 210], [-2567, 377, 520, 480], [-3164, -1220, 300, 300]];
function landAt(x, y) {
  if (y < -2950 && x > -300) return 0;                                   // Tokyo Bay off Shibaura
  if (x > 1500 && y < -2300) return 0;                                   // the bay off Tsukiji and Kachidoki
  { const ax = 2350, ay = 1600, bx = 1750, by = -2350, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    if (Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) < 140) return 0; }          // the Sumida river
  for (const [cx, cy, rx, ry] of ELL) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) return 0; // palace, parks, gardens
  return 1;
}
// how tall the city is here: the business districts tower, the rest is mid-rise
function heightAt(x, y, r) {
  const cbd = (x > 250 && x < 1450 && y > -350 && y < 1350) || (x > 200 && x < 850 && y > -2250 && y < -1250) || (x > -1200 && x < -250 && y > -1350 && y < -250) || (x > -2900 && x < -1700 && y > -2300 && y < -1300);
  return cbd ? 70 + Math.pow(r, 0.9) * 110 : 20 + Math.pow(r, 2.4) * 80;
}

export function createTokyoFar(far, scene) {
  // ---------------- landmarks
  const lmGroup = new THREE.Group();
  far.add(lmGroup);
  const L = (id) => C1.LANDMARKS.find((l) => l.id === id);
  const items = [];
  const place = (obj, lm, rotY = 0, y = -12) => { obj.rotation.y = rotY; lmGroup.add(obj); items.push({ obj, x: lm.x, y: lm.y, base: y }); return obj; };
  const tower = place(buildTokyoTower(), L('tokyo-tower'));
  place(buildSkytree(), L('skytree'));
  place(buildRainbowBridge(), L('rainbow-bridge'), Math.PI / 2 - (126 * Math.PI) / 180, -14);
  place(buildStation(), L('tokyo-station'), Math.PI / 2 - (12 * Math.PI) / 180, -6);
  // named towers: one instanced box mesh (window-grid shader), their crowns and aviation lights
  const NT = namedTowers();
  const ntGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const ntSeed = new Float32Array(NT.length).map((_, i) => (i * 0.137 + 0.21) % 1);
  ntGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(ntSeed, 1));
  const ntMat = skylineMaterial();
  const nt = new THREE.InstancedMesh(ntGeo, ntMat, NT.length);
  nt.frustumCulled = false;
  lmGroup.add(nt);
  const ntLights = glowSprites(NT.length * 3, 2.4);
  NT.forEach((o) => { ntLights.add(0, 0, 0, 0, '#ff1a24', 0.75, 0.01, 0.4, 0.06); ntLights.add(0, 0, 0, 0, '#ff1a24', 0.75, 0.03, 0.4, 0.06); ntLights.add(0, 0, 0, 0, o.crown || '#ffffff', 0, 0, 1, 0.5); });
  lmGroup.add(ntLights.m);

  // ---------------- skyline: world-anchored sites on a 170 m grid, kept where there is land, 450–1850 m from the car
  const CELL = 170, SMAX = 340;
  const farGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const farSeed = new Float32Array(SMAX);
  farGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(farSeed, 1));
  const farMat = skylineMaterial();
  const sky = new THREE.InstancedMesh(farGeo, farMat, SMAX);
  sky.frustumCulled = false;
  far.add(sky);
  const skyB = glowSprites(90, 2.2);
  for (let i = 0; i < 90; i++) skyB.add(0, 0, 0, 0, '#ff1a24', i % 3 ? 0 : 0.75, (i % 7) * 0.006, 0.4, 0.3);
  far.add(skyB.m);
  const h2 = (i, j, k) => { let h = (i * 374761393 + j * 668265263 + k * 1442695041) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  let lastX = 1e9, lastY = 1e9, baseY = -30;
  function rebuildSkyline() {
    let n = 0, nb = 0;
    const i0 = Math.floor((_car.x - 1850) / CELL), i1 = Math.floor((_car.x + 1850) / CELL), j0 = Math.floor((_car.y - 1850) / CELL), j1 = Math.floor((_car.y + 1850) / CELL);
    for (let i = i0; i <= i1 && n < SMAX; i++) for (let j = j0; j <= j1 && n < SMAX; j++) {
      const wx = (i + 0.2 + 0.6 * h2(i, j, 1)) * CELL, wy = (j + 0.2 + 0.6 * h2(i, j, 2)) * CELL;
      const dx = wx - _car.x, dy = wy - _car.y, D = Math.hypot(dx, dy);
      if (D < 520 || D > 1850 || !landAt(wx, wy)) continue;
      const h = heightAt(wx, wy, h2(i, j, 3)), w = 34 + 50 * h2(i, j, 4), d = 30 + 46 * h2(i, j, 5);
      sky.setMatrixAt(n, _m.compose(_p.set(dx, baseY, -dy), _q.identity(), _s.set(w, h, d)));
      farSeed[n] = h2(i, j, 6);
      if (h > 100 && nb < 90) skyB.m.setMatrixAt(nb++, _m.compose(_p.set(dx, baseY + h + 4, -dy), _q.identity(), _s.set(9, 9, 9)));
      n++;
    }
    sky.count = n;
    for (let k = nb; k < 90; k++) skyB.m.setMatrixAt(k, _m.makeScale(0, 0, 0));
    sky.instanceMatrix.needsUpdate = true; farGeo.attributes.aSeed.needsUpdate = true; skyB.m.instanceMatrix.needsUpdate = true;
    lastX = _car.x; lastY = _car.y;
  }

  // ---------------- aircraft on the approach to Haneda (the southbound route over western Tokyo): lights only
  const PLANES = 3;
  const air = glowSprites(PLANES * 3, 2.2);
  for (let k = 0; k < PLANES; k++) { air.add(0, 0, 0, 0, '#ffffff', 0, 0, 1, 1); air.add(0, 0, 0, 0, '#ff2a2a', 1.1, k * 0.3, 0.25, 0); air.add(0, 0, 0, 0, '#eaf4ff', 0.9, k * 0.17, 0.12, 0); }
  far.add(air.m);
  const A0 = { x: -5200, y: 9000, z: 1100 }, A1 = { x: 2080, y: -14200, z: 0 };

  function update(s, t) {
    C1.posAt(s, _car);
    if (Math.hypot(_car.x - lastX, _car.y - lastY) > 40) rebuildSkyline();
    for (const it of items) {
      const dx = it.x - _car.x, dy = it.y - _car.y, D = Math.hypot(dx, dy) || 1, k = D > DMAX ? DMAX / D : 1;
      it.obj.position.set(dx * k, it.base * k + baseY * (1 - k), -dy * k);
      it.obj.scale.setScalar(k);
    }
    for (let i = 0; i < NT.length; i++) {
      const o = NT[i];
      const dx = o.x - _car.x, dy = o.y - _car.y, D = Math.hypot(dx, dy) || 1, k = D > DMAX ? DMAX / D : 1;
      const x = dx * k, z = -dy * k, y = baseY * k + baseY * (1 - k);
      nt.setMatrixAt(i, _m.compose(_p.set(x, y, z), _q.identity(), _s.set(o.w * k, o.h * k, o.d * k)));
      const top = y + o.h * k, size = 9 * k;
      ntLights.m.setMatrixAt(i * 3, _m.compose(_p.set(x - o.w * 0.4 * k, top + 2 * k, z), _q.identity(), _s.set(size, size, size)));
      ntLights.m.setMatrixAt(i * 3 + 1, _m.compose(_p.set(x + o.w * 0.4 * k, top + 2 * k, z), _q.identity(), _s.set(size, size, size)));
      ntLights.m.setMatrixAt(i * 3 + 2, o.crown ? _m.compose(_p.set(x, top - 4 * k, z), _q.identity(), _s.set(o.w * 0.32 * k, o.w * 0.32 * k, 1)) : _m.makeScale(0, 0, 0));
    }
    nt.instanceMatrix.needsUpdate = ntLights.m.instanceMatrix.needsUpdate = true;
    for (let k = 0; k < PLANES; k++) {
      const u = ((t * 0.006 + k / PLANES) % 1);
      const wx = A0.x + (A1.x - A0.x) * u, wy = A0.y + (A1.y - A0.y) * u, wz = A0.z + (A1.z - A0.z) * u;
      const dx = wx - _car.x, dy = wy - _car.y, D = Math.hypot(dx, dy, wz), q = D > DMAX ? DMAX / D : 1;
      const vis = wz > 150 ? 1 : 0;
      for (let j = 0; j < 3; j++) air.m.setMatrixAt(k * 3 + j, _m.compose(_p.set(dx * q + (j === 2 ? 1.5 : 0), wz * q + baseY + (j === 1 ? 1.2 : 0), -dy * q), _q.identity(), _s.setScalar(vis * (j === 0 ? 7 : 5))));
    }
    air.m.instanceMatrix.needsUpdate = true;
  }
  return { update, tower, materials: [farMat, ntMat], set visible(v) { lmGroup.visible = sky.visible = skyB.m.visible = air.m.visible = v; } };
}

// ---------------------------------------------------------------- elevated railways beside the road (bent with the world)
// JR lines beside Shimbashi–Yurakucho and Kanda, the monorail at Hamazakibashi. Stretches are approximate (labelled).
export function createTrains(scene) {
  const spans = [
    { from: 13150, len: 1340, x: -34, y: 9, kind: 'jr' },
    { from: 4300, len: 600, x: 34, y: 8, kind: 'jr' },
    { from: 12880, len: 520, x: 30, y: 12, kind: 'mono' },
  ];
  const deckMat = std({ color: '#3a3a40', roughness: 0.9, metalness: 0.1 });
  const trainMat = new THREE.ShaderMaterial({
    uniforms: { ...U, uMono: { value: 0 } },
    vertexShader: `${BEND_GLSL}
      varying vec2 vUv; varying vec3 vN; varying float vDepth;
      void main(){ vUv = uv; vN = normal; vec4 wp = bendW(modelMatrix * vec4(position, 1.0)); vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uMono; uniform vec3 uFogColor; uniform float uFogDensity; varying vec2 vUv; varying vec3 vN; varying float vDepth;
      void main(){
        vec3 body = mix(vec3(0.16, 0.17, 0.19), vec3(0.2, 0.22, 0.27), uMono);
        if (abs(vN.x) > 0.5) {
          float L = 200.0, u = vUv.x * L, v = vUv.y;
          float car = fract(u / 20.0), gap = step(car, 0.025);
          float win = step(0.48, v) * step(v, 0.78) * step(0.16, fract(u / 1.6)) * step(fract(u / 1.6), 0.86) * (1.0 - gap);
          float door = step(0.2, v) * step(v, 0.8) * step(abs(fract(u / 5.0) - 0.5), 0.07);
          float stripe = step(0.38, v) * step(v, 0.44);
          body = mix(body, mix(vec3(0.05, 0.32, 0.3), vec3(0.12, 0.25, 0.6), uMono), stripe);
          body = mix(body, vec3(0.05), max(gap, door * 0.6));
          body += vec3(0.85, 0.93, 1.0) * 2.0 * win;
        }
        float k = uFogDensity * vDepth; float fog = 1.0 - exp(-k * k);
        gl_FragColor = vec4(mix(body, uFogColor, fog), 1.0);
      }`,
  });
  const monoMat = trainMat.clone(); monoMat.uniforms = { ...U, uMono: { value: 1 } };
  const items = spans.map((sp) => {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(sp.kind === 'mono' ? 1.6 : 9, 1.4, sp.len, 1, 1, Math.ceil(sp.len / 8)).translate(0, -0.7, -sp.len / 2), deckMat);
    const train = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 200, 1, 1, 50).translate(0, sp.kind === 'mono' ? 0.6 : 1.9, 0), sp.kind === 'mono' ? monoMat : trainMat);
    g.add(deck, train);
    g.visible = false;
    g.traverse((o) => (o.frustumCulled = false));
    scene.add(g);
    return { ...sp, g, train };
  });
  return {
    update(S, deckAt, t, on) {
      for (const it of items) {
        const past = C1.ahead(it.from, S.s);                   // how far along the span the car is
        const d = past < it.len + 20 ? -past : C1.ahead(S.s, it.from);   // the span's start, metres ahead (negative once we are on it)
        const vis = on && d < 700 && d > -it.len - 20;
        it.g.visible = vis;
        if (!vis) continue;
        it.g.position.set(it.x, Math.max(-deckAt(it.from + it.len / 2) + it.y, -0.5), -d);   // never sunk out of sight below the deck
        // a train is always somewhere 60–520 m ahead, running the same way more slowly, so you overtake it; it stays on its span
        const zw = -520 + ((t * 38 + it.from) % 460);
        it.train.position.z = zw + d;
        it.train.visible = zw + d < 0 && zw + d > -it.len;
      }
    },
  };
}
