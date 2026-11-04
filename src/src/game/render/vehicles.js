// High-detail original vehicles for the player: the VANTA GT (car) and the TSUBAME (naked superbike).
// Built from extruded profiles with real wheel arches, lathe-turned wheels/discs and tube frames.
// Static parts are merged per material, so the detail costs a handful of draw calls.
// Convention: origin on the ground at the vehicle's centre, nose toward −z.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { plateTexture } from './textures.js';

const HDR = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const UP = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------- helpers
function profile(draw, L, width, bevel = 0.07, curveSegments = 16) {
  const s = new THREE.Shape();
  draw(s);
  const depth = Math.max(0.01, width - bevel * 2);
  let g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: 4, curveSegments, steps: 1 });
  g.translate(-L / 2, 0, -depth / 2);
  g.rotateY(Math.PI / 2); // +x (nose) → −z
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  return g;
}

// A parts bin: geometries grouped by material key, merged into one mesh per material at the end.
function Bin() {
  const parts = {};
  const api = {
    add(key, geo, pos, rot, scale) {
      const g = geo.index ? geo : mergeVertices(geo);
      if (g.attributes.uv) g.deleteAttribute('uv');
      if (g.attributes.uv1) g.deleteAttribute('uv1');
      const m = new THREE.Matrix4().compose(
        pos ? new THREE.Vector3(...pos) : new THREE.Vector3(),
        rot ? (rot.isQuaternion ? rot : new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot))) : new THREE.Quaternion(),
        scale ? new THREE.Vector3(...scale) : new THREE.Vector3(1, 1, 1),
      );
      (parts[key] ||= []).push(g.clone().applyMatrix4(m));
      return api;
    },
    // a cylinder from a to b
    rod(key, a, b, r, seg = 10) {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
      const len = A.distanceTo(B);
      const g = new THREE.CylinderGeometry(r, r, len, seg, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(UP, B.clone().sub(A).normalize());
      const mid = A.clone().add(B).multiplyScalar(0.5);
      return api.add(key, g, [mid.x, mid.y, mid.z], q);
    },
    tube(key, pts, r, seg = 40) {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return api.add(key, new THREE.TubeGeometry(curve, seg, r, 10, false));
    },
    build(group, mats) {
      for (const [key, list] of Object.entries(parts)) {
        const mesh = new THREE.Mesh(mergeGeometries(list, false), mats[key]);
        mesh.name = key;
        group.add(mesh);
      }
    },
  };
  return api;
}

// lathe-turned wheel: tyre with rounded sidewalls, dished rim, spokes, hub, optional disc
function buildWheel({ R, width, rimR, spokes, spokeStyle = 'straight', mats, disc = null, glowRing = false }) {
  const g = new THREE.Group();
  const tyre = [];
  const hw = width / 2, wall = R - rimR;
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    tyre.push(new THREE.Vector2(rimR + wall * (0.15 + 0.85 * Math.sin(a)), -hw + width * (i / 12)));
  }
  const tyreGeo = new THREE.LatheGeometry(tyre, 40).rotateZ(Math.PI / 2);
  g.add(new THREE.Mesh(tyreGeo, mats.tyre));
  // rim barrel + lip
  const rim = [new THREE.Vector2(rimR * 0.98, -hw * 0.9), new THREE.Vector2(rimR, -hw * 0.95), new THREE.Vector2(rimR * 1.02, -hw * 0.8), new THREE.Vector2(rimR * 0.96, hw * 0.6), new THREE.Vector2(rimR * 1.02, hw * 0.85), new THREE.Vector2(rimR, hw * 0.95)];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(rim, 36).rotateZ(Math.PI / 2), mats.rim));
  // spokes
  const bin = Bin();
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    if (spokeStyle === 'y') {
      for (const off of [-0.16, 0.16]) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(a + off * 0.5, 0, 0));
        const v = new THREE.Vector3(0, rimR * 0.52, 0).applyQuaternion(q);
        bin.add('rim', new THREE.BoxGeometry(width * 0.35, rimR * 0.62, 0.028), [hw * 0.25, v.y, v.z], q);
      }
    } else {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(a, 0, 0));
      const v = new THREE.Vector3(0, rimR * 0.52, 0).applyQuaternion(q);
      bin.add('rim', new THREE.BoxGeometry(width * 0.28, rimR * 0.95, 0.03), [hw * 0.3, v.y, v.z], q);
    }
  }
  bin.add('rim', new THREE.CylinderGeometry(rimR * 0.2, rimR * 0.2, width * 0.5, 20).rotateZ(Math.PI / 2), [hw * 0.25, 0, 0]);
  bin.add('metal', new THREE.CylinderGeometry(rimR * 0.08, rimR * 0.08, width * 0.55, 12).rotateZ(Math.PI / 2), [hw * 0.3, 0, 0]);
  if (disc) {
    for (const x of disc.xs) {
      bin.add('disc', new THREE.CylinderGeometry(disc.r, disc.r, 0.012, 40).rotateZ(Math.PI / 2), [x, 0, 0]);
      bin.add('metal', new THREE.CylinderGeometry(disc.r * 0.55, disc.r * 0.55, 0.016, 24).rotateZ(Math.PI / 2), [x, 0, 0]);
      // drilled holes read as dark dots on the braking ring
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * Math.PI * 2;
        bin.add('tyre', new THREE.CylinderGeometry(0.009, 0.009, 0.016, 6).rotateZ(Math.PI / 2), [x + 0.002, Math.cos(a) * disc.r * 0.78, Math.sin(a) * disc.r * 0.78]);
      }
    }
  }
  bin.build(g, mats);
  if (glowRing) {
    for (const sx of [-hw * 0.92, hw * 0.92]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rimR * 1.01, 0.008, 6, 48).rotateY(Math.PI / 2), mats.glow);
      ring.position.x = sx;
      g.add(ring);
    }
  }
  return g;
}

function materials(livery, glowHex) {
  return {
    paint: new THREE.MeshPhysicalMaterial({ color: livery.body, emissive: livery.body, emissiveIntensity: 0.08, metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.0 }),
    stripe: new THREE.MeshPhysicalMaterial({ color: livery.stripe, metalness: 0.2, roughness: 0.4, clearcoat: 1, polygonOffset: true, polygonOffsetFactor: -1 }),
    trim: new THREE.MeshStandardMaterial({ color: livery.trim, metalness: 0.6, roughness: 0.35 }),
    carbon: new THREE.MeshStandardMaterial({ color: '#141418', metalness: 0.5, roughness: 0.45 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#06060c', metalness: 0.9, roughness: 0.04, envMapIntensity: 2.2 }),
    tyre: new THREE.MeshStandardMaterial({ color: '#0c0c0f', roughness: 0.82 }),
    rim: new THREE.MeshStandardMaterial({ color: '#2a2a32', metalness: 0.85, roughness: 0.28 }),
    metal: new THREE.MeshStandardMaterial({ color: '#9aa0ad', metalness: 1, roughness: 0.25 }),
    disc: new THREE.MeshStandardMaterial({ color: '#7d828c', metalness: 1, roughness: 0.42 }),
    caliper: new THREE.MeshStandardMaterial({ color: '#d5161f', emissive: '#d5161f', emissiveIntensity: 0.15, metalness: 0.3, roughness: 0.35 }),
    gold: new THREE.MeshStandardMaterial({ color: '#c9a03a', metalness: 1, roughness: 0.3 }),
    frame: new THREE.MeshStandardMaterial({ color: '#c8102e', emissive: '#c8102e', emissiveIntensity: 0.12, metalness: 0.4, roughness: 0.32 }),
    engine: new THREE.MeshStandardMaterial({ color: '#2b2c33', metalness: 0.85, roughness: 0.38 }),
    pipe: new THREE.MeshStandardMaterial({ color: '#8e7f74', metalness: 1, roughness: 0.3, emissive: '#2a1a40', emissiveIntensity: 0.25 }),
    suit: new THREE.MeshStandardMaterial({ color: '#232029', roughness: 0.5, metalness: 0.3 }),
    suitAccent: new THREE.MeshStandardMaterial({ color: livery.stripe, emissive: livery.stripe, emissiveIntensity: 0.12, roughness: 0.4 }),
    helmet: new THREE.MeshPhysicalMaterial({ color: livery.body, emissive: livery.body, emissiveIntensity: 0.12, metalness: 0.3, roughness: 0.15, clearcoat: 1 }),
    tail: new THREE.MeshBasicMaterial({ color: HDR('#ff1a3c', 6) }),
    tailDim: new THREE.MeshBasicMaterial({ color: HDR('#ff1a3c', 1.6) }),
    head: new THREE.MeshBasicMaterial({ color: HDR('#e8f4ff', 5) }),
    amber: new THREE.MeshBasicMaterial({ color: HDR('#ffa000', 2.5) }),
    glow: new THREE.MeshBasicMaterial({ color: HDR(glowHex || livery.stripe, 2.4) }),
    exGlow: new THREE.MeshBasicMaterial({ color: HDR('#ff6a00', 0.9) }),
  };
}

function flamesAt(points, size = 1) {
  const mat = new THREE.MeshBasicMaterial({ color: HDR('#4fd8ff', 3), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  return points.map(([x, y, z]) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.055 * size, 0.45 * size, 12, 1, true), mat);
    f.rotation.x = Math.PI / 2;
    f.position.set(x, y, z);
    f.visible = false;
    return f;
  });
}

function lights(g, glowHex, rearZ, under = 26) {
  let glowLight = null;
  if (glowHex) {
    glowLight = new THREE.PointLight(new THREE.Color(glowHex), under, 9, 1.6);
    glowLight.position.set(0, 0.3, 0);
    g.add(glowLight);
  }
  const tailLight = new THREE.PointLight(new THREE.Color('#ff1a3c'), 1.2, 6, 2);
  tailLight.position.set(0, 0.25, rearZ + 1.8);
  tailLight.intensity = 0; // not added: a point light this low mirrors as a red dot on the wet road
  return { glowLight, tailLight };
}

// ---------------------------------------------------------------- VANTA GT
export function buildVantaGT(livery, glowHex) {
  // proportions after the classic early-90s mid-engine coupé: 4.4 m long, 1.82 m wide, 1.17 m tall, 2.53 m wheelbase,
  // short front overhang, cab-forward canopy, long flat rear deck
  const L = 4.4, W = 1.82, R = 0.38; // bigger wheels
  const g = new THREE.Group();
  const M = materials(livery, glowHex);
  const FX = 3.53, RX = 1.0; // wheel centres along the profile (x from the rear)
  const ARCH = 0.46, AY = 0.38;
  const ZF = L / 2 - FX, ZR = L / 2 - RX; // axle z
  const arch = (s, cx) => {
    const a0 = -Math.asin((AY - 0.22) / ARCH);
    s.lineTo(cx + Math.cos(a0) * ARCH, 0.22);
    s.absarc(cx, AY, ARCH, a0, Math.PI - a0, false);
  };
  const body = (s) => {
    s.moveTo(0.05, 0.3);
    s.lineTo(0.0, 0.64);
    s.quadraticCurveTo(0.02, 0.84, 0.3, 0.86);
    s.lineTo(1.5, 0.89);                     // long flat rear deck
    s.quadraticCurveTo(2.6, 0.92, 3.25, 0.8); // shoulder to the cowl
    // sharp wedge: one straight hood line down to a knife-edge nose
    s.lineTo(4.36, 0.5);
    s.lineTo(4.44, 0.43);
    s.lineTo(4.36, 0.27);
    s.lineTo(4.05, 0.22);
    arch(s, FX);
    s.lineTo(1.3, 0.22);
    arch(s, RX);
    s.lineTo(0.14, 0.22);
    s.quadraticCurveTo(0.05, 0.22, 0.05, 0.3);
  };
  const bin = Bin();
  // plan-view taper: the nose narrows to a point past the front arches, so the front reads as a wedge, not a slab
  const taper = (geo) => {
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const z = pa.getZ(i), t = Math.min(1, Math.max(0, (-z - 1.55) / 0.7));
      pa.setX(i, pa.getX(i) * (1 - 0.2 * t * t));
    }
    pa.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  };
  bin.add('paint', taper(profile(body, L, W, 0.085, 20)));
  const bodyBox = new THREE.Box3().setFromBufferAttribute(new THREE.Mesh(profile(body, L, W, 0.085)).geometry.attributes.position);
  const RZ = bodyBox.max.z;
  // livery stripe over the spine
  const stripe = taper(profile(body, L, 0.34, 0));
  bin.add('stripe', stripe, [0, 0, 0], null, [1, 1.008, 1.006]);
  // greenhouse
  bin.add('glass', profile((s) => { s.moveTo(1.45, 0.88); s.quadraticCurveTo(1.85, 1.15, 2.4, 1.17); s.lineTo(2.75, 1.16); s.quadraticCurveTo(3.05, 1.1, 3.32, 0.79); s.lineTo(1.45, 0.88); }, L, 1.36, 0.06));
  // side skirts + intakes + door seams
  for (const sx of [-1, 1]) {
    bin.add('carbon', new THREE.BoxGeometry(0.06, 0.09, 2.02), [sx * (W / 2 + 0.005), 0.25, 0.0]);
    bin.add('carbon', new THREE.BoxGeometry(0.05, 0.18, 0.62), [sx * (W / 2 + 0.01), 0.52, 0.62], [0.12 * sx, 0, 0]);
    for (let k = 0; k < 4; k++) bin.add('trim', new THREE.BoxGeometry(0.052, 0.012, 0.56), [sx * (W / 2 + 0.02), 0.45 + k * 0.045, 0.62]);
    bin.add('carbon', new THREE.BoxGeometry(0.02, 0.5, 0.012), [sx * (W / 2 + 0.003), 0.62, -0.38]);
    bin.add('carbon', new THREE.BoxGeometry(0.02, 0.012, 1.1), [sx * (W / 2 + 0.003), 0.86, -0.05]);
    // mirrors on stalks
    bin.rod('carbon', [sx * 0.66, 0.88, -0.9], [sx * 0.92, 0.94, -0.93], 0.015);
    bin.add('paint', new RoundedBoxGeometry(0.18, 0.08, 0.12, 2, 0.03), [sx * 0.97, 0.95, -0.93]);
  }
  // rear deck louvres
  for (let k = 0; k < 6; k++) bin.add('carbon', new THREE.BoxGeometry(1.2, 0.02, 0.06), [0, 0.9 - k * 0.004, 0.95 + k * 0.15], [-0.04, 0, 0]);
  // swan-neck wing
  bin.add('carbon', new THREE.BoxGeometry(W * 0.98, 0.04, 0.36), [0, 1.06, RZ - 0.4], [-0.07, 0, 0]);
  bin.add('carbon', new THREE.BoxGeometry(W * 0.98, 0.012, 0.12), [0, 1.09, RZ - 0.23], [-0.5, 0, 0]);
  for (const sx of [-1, 1]) {
    bin.rod('carbon', [sx * 0.5, 0.92, RZ - 0.28], [sx * 0.46, 1.18, RZ - 0.5], 0.025);
    bin.add('carbon', new THREE.BoxGeometry(0.025, 0.2, 0.42), [sx * W * 0.49, 1.15, RZ - 0.42]);
  }
  // diffuser + fins + tow hook
  bin.add('carbon', new THREE.BoxGeometry(W * 0.86, 0.12, 0.5), [0, 0.23, RZ - 0.25], [0.2, 0, 0]);
  for (let i = -3; i <= 3; i++) bin.add('carbon', new THREE.BoxGeometry(0.018, 0.17, 0.42), [i * 0.2, 0.27, RZ - 0.14]);
  // front splitter
  bin.add('carbon', new THREE.BoxGeometry(W * 0.96, 0.025, 0.42), [0, 0.2, -L / 2 - 0.02]);
  for (const sx of [-1, 1]) bin.add('carbon', new THREE.BoxGeometry(0.02, 0.12, 0.4), [sx * W * 0.47, 0.26, -L / 2 - 0.02]); // splitter end plates
  // quad exhausts
  for (const x of [-0.42, -0.28, 0.28, 0.42]) {
    bin.add('metal', new THREE.CylinderGeometry(0.052, 0.052, 0.16, 18, 1, true).rotateX(Math.PI / 2), [x, 0.33, RZ - 0.06]);
    bin.add('exGlow', new THREE.CircleGeometry(0.04, 16), [x, 0.33, RZ + 0.015]);
  }
  // segmented light blade + fangs + third brake light
  // full-width louvred tail: a continuous light panel behind six black horizontal slats, framed top and bottom
  bin.add('tail', new THREE.BoxGeometry(W * 0.86, 0.2, 0.03), [0, 0.73, RZ - 0.03]);
  for (let i = 0; i < 6; i++) bin.add('carbon', new THREE.BoxGeometry(W * 0.89, 0.016, 0.05), [0, 0.645 + i * 0.034, RZ - 0.0]);
  bin.add('trim', new THREE.BoxGeometry(W * 0.91, 0.03, 0.06), [0, 0.845, RZ - 0.01]);
  bin.add('trim', new THREE.BoxGeometry(W * 0.91, 0.03, 0.06), [0, 0.615, RZ - 0.01]);
  for (const sx of [-1, 1]) bin.add('tail', new THREE.BoxGeometry(0.06, 0.2, 0.04), [sx * W * 0.44, 0.64, RZ - 0.03]);
  bin.add('tail', new THREE.BoxGeometry(0.36, 0.025, 0.03), [0, 0.93, RZ - 0.35]);
  bin.add('glass', new THREE.PlaneGeometry(W * 0.74, 0.25), [0, 0.47, RZ + 0.005]);
  // headlights
  // widebody: bolted arch flares, a scoop behind the door, red accent lips; slim swept lamps at the nose corners
  for (const sx of [-1, 1]) {
    // 80s side strakes: five horizontal fins running from the door back to the rear arch
    for (let k = 0; k < 5; k++) bin.add('paint', new THREE.BoxGeometry(0.045, 0.022, 1.05 - k * 0.05), [sx * (W / 2 + 0.02), 0.44 + k * 0.065, 0.2 + k * 0.025]);
    bin.add('carbon', new THREE.BoxGeometry(0.02, 0.33, 1.05), [sx * (W / 2 - 0.005), 0.57, 0.22]); // dark intake behind the fins
    bin.add('stripe', new THREE.BoxGeometry(0.03, 0.035, 2.3), [sx * (W / 2 + 0.035), 0.2, -0.05]); // accent skirt
    bin.add('head', new THREE.BoxGeometry(0.34, 0.03, 0.04), [sx * W * 0.32, 0.53, -L / 2 + 0.14], [Math.atan2(0.3, 1.11), sx * 0.35, sx * 0.12]);
  }
  bin.add('stripe', new THREE.BoxGeometry(W * 0.96, 0.02, 0.05), [0, 0.19, -L / 2 - 0.21]); // splitter lip
  // a slim full-width light blade in a dark visor along the nose, plus a lower intake slot
  const HOOD = Math.atan2(0.3, 1.11);
  bin.add('carbon', new THREE.BoxGeometry(W * 0.86, 0.075, 0.05), [0, 0.505, -L / 2 + 0.01], [HOOD, 0, 0]);
  bin.add('head', new THREE.BoxGeometry(W * 0.8, 0.022, 0.03), [0, 0.512, -L / 2 - 0.005], [HOOD, 0, 0]);
  for (const sx of [-1, 1]) bin.add('head', new THREE.BoxGeometry(0.05, 0.05, 0.03), [sx * W * 0.41, 0.5, -L / 2 + 0.0], [HOOD, 0, 0]);
  bin.add('carbon', new THREE.BoxGeometry(W * 0.56, 0.06, 0.06), [0, 0.33, -L / 2 - 0.03]);
  // nose face: a black band carrying one bright full-width light bar, flanked by angled corner intakes
  // full-width black visor band across the nose with a single white light bar
  // lamp bar on the nose face, below the knife edge: a black band with a bright white light strip and amber ends
  bin.add('carbon', new THREE.BoxGeometry(W * 0.72, 0.12, 0.05), [0, 0.355, -L / 2 - 0.03]);
  bin.add('head', new THREE.BoxGeometry(W * 0.66, 0.04, 0.03), [0, 0.365, -L / 2 - 0.06]);
  for (const sx of [-1, 1]) bin.add('amber', new THREE.BoxGeometry(0.08, 0.04, 0.03), [sx * W * 0.35, 0.365, -L / 2 - 0.055]);
  for (const sx of [-1, 1]) bin.add('carbon', new THREE.BoxGeometry(0.22, 0.09, 0.04), [sx * W * 0.33, 0.3, -L / 2 + 0.02], [0, sx * 0.5, 0]);
  // brake calipers (static, behind the spokes)
  for (const [z, sx] of [[ZF, -1], [ZF, 1], [ZR, -1], [ZR, 1]]) bin.add('caliper', new RoundedBoxGeometry(0.06, 0.16, 0.1, 2, 0.02), [sx * (W / 2 - 0.17), 0.48, z - 0.06]);
  bin.build(g, M);

  // plate
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), new THREE.MeshBasicMaterial({ map: plateTexture(), color: HDR('#ffffff', 0.9) }));
  plate.position.set(0, 0.47, RZ + 0.012);
  g.add(plate);

  // wheels: front pair first (steering)
  const wheels = [];
  for (const z of [ZF, ZR]) for (const sx of [-1, 1]) {
    const w = buildWheel({ R, width: 0.29, rimR: 0.29, spokes: 10, mats: M, disc: { r: 0.18, xs: [-0.06 * sx] }, glowRing: !!glowHex });
    if (sx < 0) w.rotation.y = Math.PI;
    const holder = new THREE.Group();
    holder.add(w);
    holder.userData = { spin: w, sign: sx < 0 ? -1 : 1 };
    holder.position.set(sx * (W / 2 - 0.12), R, z);
    g.add(holder);
    wheels.push(holder);
  }
  const flames = flamesAt([[-0.35, 0.33, RZ + 0.3], [0.35, 0.33, RZ + 0.3]]);
  flames.forEach((f) => g.add(f));
  const { glowLight, tailLight } = lights(g, glowHex, RZ);
  return { group: g, wheels, flames, M, glowLight, tailLight, length: L, width: W, wheelR: R, rearZ: RZ, tailY: 0.74, tailHalfW: W * 0.42 };
}

// ---------------------------------------------------------------- TSUBAME (naked superbike)
// style 'monster': muscular naked streetfighter (red trellis, bulky tank, single round lamp, side-stacked pipes)
// style 'roadster': naked roadster (silver frame, long flat tank, twin round lamps, under-tail pipes)
export function buildTsubame(livery, glowHex, style = 'monster') {
  const roadster = style === 'roadster';
  const FR = roadster ? 'metal' : 'frame';
  const g = new THREE.Group();
  const M = materials(livery, glowHex);
  const R = 0.31, FZ = -0.74, RZw = 0.72; // wheel radius, front/rear axle z
  const bin = Bin();

  // trellis frame: steering head → swingarm pivot, triangulated, both sides
  const N = (x, y, z) => [x, y, z];
  for (const sx of [-1, 1]) {
    const h1 = N(sx * 0.07, 0.94, -0.5), h2 = N(sx * 0.07, 0.76, -0.45);
    const t = N(sx * 0.13, 0.9, 0.08), m = N(sx * 0.15, 0.66, -0.2), p = N(sx * 0.15, 0.48, 0.1), u = N(sx * 0.13, 0.78, -0.08);
    for (const [a, b] of [[h1, u], [u, t], [h2, m], [m, p], [h1, m], [m, u], [u, p], [t, p], [h2, h1]]) bin.rod(FR, a, b, 0.016);
    // subframe up to the tail
    bin.rod(FR, t, [sx * 0.09, 0.98, 0.62], 0.013);
    bin.rod(FR, p, [sx * 0.09, 0.9, 0.55], 0.012);
  }
  bin.rod(FR, [-0.13, 0.9, 0.08], [0.13, 0.9, 0.08], 0.014);
  bin.rod(FR, [-0.15, 0.48, 0.1], [0.15, 0.48, 0.1], 0.02);
  bin.add(FR, new THREE.CylinderGeometry(0.045, 0.045, 0.22, 16), [0, 0.86, -0.49], [-0.42, 0, 0]); // steering head

  // V-twin engine: crankcase, finned cylinders, heads, clutch cover, radiator
  bin.add('engine', new RoundedBoxGeometry(0.3, 0.26, 0.44, 3, 0.06), [0, 0.38, -0.06]);
  const cyl = (base, tilt) => {
    const dir = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
    for (let k = 0; k < 9; k++) {
      const c = new THREE.Vector3(...base).addScaledVector(dir, 0.02 + k * 0.026);
      bin.add('engine', new THREE.CylinderGeometry(0.11, 0.11, 0.008, 20), [c.x, c.y, c.z], new THREE.Quaternion().setFromUnitVectors(UP, dir));
    }
    const head = new THREE.Vector3(...base).addScaledVector(dir, 0.27);
    bin.add('engine', new RoundedBoxGeometry(0.2, 0.08, 0.17, 2, 0.03), [head.x, head.y, head.z], new THREE.Quaternion().setFromUnitVectors(UP, dir));
    bin.add('metal', new THREE.CylinderGeometry(0.08, 0.08, 0.24, 16), [head.x * 0.5 + base[0] * 0.5, (head.y + base[1]) / 2, (head.z + base[2]) / 2], new THREE.Quaternion().setFromUnitVectors(UP, dir));
    return head;
  };
  const frontHead = cyl([0, 0.45, -0.22], 1.0);
  const rearHead = cyl([0, 0.5, 0.0], -0.25);
  bin.add('engine', new THREE.CylinderGeometry(0.12, 0.12, 0.05, 28).rotateZ(Math.PI / 2), [0.17, 0.38, -0.02]); // clutch cover
  bin.add('metal', new THREE.CylinderGeometry(0.07, 0.07, 0.055, 20).rotateZ(Math.PI / 2), [0.19, 0.38, -0.02]);
  bin.add('carbon', new THREE.BoxGeometry(0.36, 0.3, 0.05), [0, 0.6, -0.56], [0.25, 0, 0]); // radiator
  for (let k = 0; k < 9; k++) bin.add('metal', new THREE.BoxGeometry(0.34, 0.006, 0.055), [0, 0.47 + k * 0.03, -0.56 - k * 0.0077], [0.25, 0, 0]);

  // exhaust: headers sweep under the engine to stacked mufflers under the tail
  bin.tube('pipe', [[frontHead.x, frontHead.y - 0.04, frontHead.z - 0.04], [0.02, 0.32, -0.48], [0.04, 0.17, -0.25], [0.05, 0.18, 0.12], [0.06, 0.4, 0.42], [0.04, 0.7, 0.6]], 0.026);
  bin.tube('pipe', [[rearHead.x, rearHead.y, rearHead.z + 0.06], [0.08, 0.56, 0.22], [0.07, 0.52, 0.4], [0.04, 0.72, 0.58]], 0.024);
  const pipeEnds = roadster ? [[0, 0.74, 0.932], [0, 0.86, 0.932]] : [[0.21, 0.5, 0.86], [0.21, 0.63, 0.83]];
  if (roadster) {
    for (const [y, r] of [[0.74, 0.05], [0.86, 0.045]]) {
      bin.add('pipe', new THREE.CylinderGeometry(r, r * 1.08, 0.38, 20).rotateX(Math.PI / 2), [0, y, 0.74]);
      bin.add('exGlow', new THREE.CircleGeometry(r * 0.7, 16), [0, y, 0.932]);
    }
  } else {
    // two short stacked silencers up the right flank, kicked up toward the tail
    for (const [y, z] of [[0.5, 0.66], [0.63, 0.63]]) {
      bin.add('pipe', new THREE.CylinderGeometry(0.05, 0.056, 0.42, 20).rotateX(Math.PI / 2 - 0.22), [0.21, y, z]);
      bin.add('carbon', new THREE.CylinderGeometry(0.058, 0.058, 0.05, 20).rotateX(Math.PI / 2 - 0.22), [0.21, y + 0.045, z + 0.2]);
      bin.add('exGlow', new THREE.CircleGeometry(0.036, 16).rotateX(-0.22), [0.21, y + 0.05, z + 0.23]);
    }
    bin.tube('pipe', [[0.06, 0.4, 0.42], [0.18, 0.44, 0.5], [0.21, 0.47, 0.5]], 0.024);
  }

  // tank, seat, tail
  const tank = roadster
    ? (s) => { s.moveTo(0.0, 0.0); s.quadraticCurveTo(0.06, 0.16, 0.36, 0.19); s.quadraticCurveTo(0.62, 0.19, 0.72, 0.08); s.lineTo(0.7, -0.04); s.quadraticCurveTo(0.34, -0.06, 0.0, 0.0); }
    : (s) => { s.moveTo(0.0, 0.0); s.quadraticCurveTo(0.06, 0.15, 0.3, 0.19); s.quadraticCurveTo(0.56, 0.2, 0.68, 0.1); s.lineTo(0.66, -0.04); s.quadraticCurveTo(0.33, -0.07, 0.0, 0.0); };
  const TW = roadster ? 0.4 : 0.46;
  // teardrop in plan: full width at the front (knee cut-outs), tapering hard into the seat
  const tear = (geo) => {
    geo.computeBoundingBox();
    const bb = geo.boundingBox, pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const t = (pa.getZ(i) - bb.min.z) / (bb.max.z - bb.min.z || 1); // 0 = one end, 1 = the other
      const k = Math.min(1, Math.max(0, t));
      pa.setX(i, pa.getX(i) * (0.42 + 0.58 * Math.sin(Math.min(1, (1 - k) * 1.25 + 0.05) * Math.PI / 2)));
    }
    pa.needsUpdate = true; geo.computeVertexNormals();
    return geo;
  };
  bin.add('paint', tear(profile(tank, 0.66, TW, 0.08)), [0, 0.86, -0.2], null, [1, 0.72, 1]); // low, lean tank
  bin.add('stripe', tear(profile(tank, 0.66, roadster ? 0.06 : 0.1, 0)), [0, 0.862, -0.2], null, [1, 0.74, 1.0]);
  if (!roadster) for (const sx of [-1, 1]) bin.add('carbon', new RoundedBoxGeometry(0.025, 0.09, 0.2, 2, 0.01), [sx * (TW / 2 - 0.02), 0.89, -0.1]); // tank shrouds
  const seat = (s) => { s.moveTo(0, 0); s.lineTo(0.38, 0.02); s.quadraticCurveTo(0.46, 0.06, 0.48, 0.1); s.lineTo(0.02, 0.07); s.lineTo(0, 0); };
  bin.add('carbon', profile(seat, 0.48, 0.3, 0.03), [0, 0.92, 0.3]);
  const tail = (s) => { s.moveTo(0, 0); s.lineTo(0.5, 0.02); s.quadraticCurveTo(0.6, 0.06, 0.62, 0.16); s.lineTo(0.08, 0.1); s.quadraticCurveTo(0.0, 0.06, 0, 0); };
  bin.add('paint', profile(tail, 0.62, 0.26, 0.04), [0, 0.9, 0.62]);
  const TZ = 0.93;
  // a large, sharp, central tail lamp: a swept arrowhead set into the tail tip
  {
    const a = new THREE.Shape(); a.moveTo(-0.14, 0.0); a.lineTo(0, 0.07); a.lineTo(0.14, 0.0); a.lineTo(0.1, -0.02); a.lineTo(0, 0.03); a.lineTo(-0.1, -0.02); a.closePath();
    bin.add('tail', new THREE.ExtrudeGeometry(a, { depth: 0.02, bevelEnabled: false }), [0, 1.02, TZ + 0.005]);
  }
  bin.add('tailDim', new THREE.BoxGeometry(0.12, 0.012, 0.02), [0, 1.0, TZ - 0.01]);
  bin.rod('carbon', [0, 0.92, 0.88], [0, 0.62, 1.02], 0.012); // plate hanger
  for (const sx of [-1, 1]) bin.add('amber', new THREE.BoxGeometry(0.04, 0.02, 0.02), [sx * 0.1, 0.66, 1.02]);

  // front end: upside-down forks, triple clamps, fender, twin discs + radial calipers, nose light, bars
  const rake = 0.42, forkTop = [0, 0.98, -0.53];
  const axle = [0, R, FZ];
  for (const sx of [-1, 1]) {
    const top = [sx * 0.085, forkTop[1], forkTop[2]], bottom = [sx * 0.085, axle[1], axle[2]];
    const mid = [sx * 0.085, (top[1] + bottom[1]) * 0.5 + 0.06, (top[2] + bottom[2]) * 0.5 - 0.02];
    bin.rod('carbon', top, mid, 0.03, 14);
    bin.rod('gold', mid, [sx * 0.085, axle[1] + 0.05, axle[2] + 0.01], 0.026, 14);
    bin.add('caliper', new RoundedBoxGeometry(0.04, 0.16, 0.07, 2, 0.015), [sx * 0.105, axle[1] + 0.13, axle[2] + 0.12], [rake, 0, 0]);
  }
  bin.add('engine', new THREE.BoxGeometry(0.24, 0.035, 0.1), [0, 0.98, -0.53], [rake, 0, 0]);
  bin.add('engine', new THREE.BoxGeometry(0.24, 0.03, 0.09), [0, 0.86, -0.58], [rake, 0, 0]);
  bin.add('paint', profile((s) => { s.moveTo(0, 0); s.quadraticCurveTo(0.2, 0.12, 0.42, 0.04); s.lineTo(0.4, 0.0); s.quadraticCurveTo(0.2, 0.08, 0.02, -0.03); s.lineTo(0, 0); }, 0.42, 0.14, 0.01), [0, 0.6, FZ - 0.02]);
  // round headlamps: one big lamp (monster) or a twin pair (roadster)
  const lampQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.15, 0, 0));
  for (const [x, r] of roadster ? [[-0.075, 0.068], [0.075, 0.068]] : [[0, 0.1]]) {
    bin.add('carbon', new THREE.CylinderGeometry(r + 0.014, r * 0.75, 0.11, 24), [x, 0.88, -0.66], lampQ);
    bin.add('metal', new THREE.TorusGeometry(r + 0.004, 0.009, 8, 28), [x, 0.886, -0.718], [-0.15, 0, 0]);
    bin.add('head', new THREE.CircleGeometry(r, 24), [x, 0.886, -0.72], [Math.PI - 0.15, 0, 0]);
  }
  // wide, upright bars on risers, mirrors on stalks
  for (const sx of [-1, 1]) {
    bin.rod('carbon', [sx * 0.05, 1.0, -0.5], [sx * 0.06, 1.07, -0.48], 0.016);
    bin.rod('metal', [sx * 0.06, 1.07, -0.48], [sx * 0.37, 1.09, -0.42], 0.013);
    bin.rod('carbon', [sx * 0.3, 1.09, -0.43], [sx * 0.39, 1.09, -0.41], 0.019);
    bin.rod('carbon', [sx * 0.24, 1.09, -0.45], [sx * 0.3, 1.27, -0.47], 0.007);
    bin.add('carbon', new RoundedBoxGeometry(0.1, 0.055, 0.02, 2, 0.01), [sx * 0.31, 1.29, -0.47]);
  }

  // single-sided swingarm (left), chain (right), rear caliper
  bin.add('engine', new RoundedBoxGeometry(0.07, 0.11, 0.66, 2, 0.025), [-0.13, 0.4, 0.42], [0.12, 0, 0]);
  bin.add('metal', new THREE.CylinderGeometry(0.07, 0.07, 0.07, 20).rotateZ(Math.PI / 2), [-0.12, R, RZw]);
  const chain = [];
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    chain.push([0.12, 0.38 + Math.sin(a) * 0.07, 0.36 + Math.cos(a) * 0.36]);
  }
  bin.tube('carbon', chain, 0.008, 60);
  bin.add('caliper', new RoundedBoxGeometry(0.04, 0.09, 0.08, 2, 0.015), [-0.1, R + 0.17, RZw + 0.04]);

  // rider: leathers, hump, helmet with visor, gloves, boots
  const limb = (a, b, r, key) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    bin.add(key, new THREE.CapsuleGeometry(r, Math.max(0.01, len - r * 2), 6, 12), [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2], new THREE.Quaternion().setFromUnitVectors(UP, B.clone().sub(A).normalize()));
  };
  limb([0, 1.06, 0.34], [0, 1.4, -0.04], 0.16, 'suit'); // upright naked-bike posture
  for (const sx of [-1, 1]) {
    limb([sx * 0.19, 1.36, -0.02], [sx * 0.3, 1.2, -0.3], 0.055, 'suit');
    limb([sx * 0.3, 1.2, -0.3], [sx * 0.35, 1.1, -0.42], 0.04, 'carbon');
    limb([sx * 0.14, 1.04, 0.3], [sx * 0.24, 0.9, -0.08], 0.075, 'suit');
    limb([sx * 0.24, 0.9, -0.08], [sx * 0.2, 0.58, 0.24], 0.06, 'suit');
    limb([sx * 0.2, 0.58, 0.24], [sx * 0.2, 0.55, 0.33], 0.045, 'carbon');
    bin.add('carbon', new THREE.SphereGeometry(0.06, 10, 8), [sx * 0.2, 1.38, -0.02]); // dark shoulder armour (no pale blobs under the helmet)
  }
  // full-face race helmet: shell, chin bar, wrap-around glowing visor, centre stripe, side vents, rear spoiler
  const HZ = -0.14, HY = 1.56;
  // shell is built after the bin: faceted, gloss black (see below)
  // light-line accents: a chevron over the crown, a stripe down each cheek
  bin.add('glow', new THREE.BoxGeometry(0.012, 0.012, 0.2), [0.045, HY + 0.14, HZ - 0.02], [0.35, 0.3, 0]);
  bin.add('glow', new THREE.BoxGeometry(0.012, 0.012, 0.16), [0.075, HY + 0.11, HZ + 0.09], [-0.4, -0.25, 0]);
  for (const sx of [-1, 1]) bin.add('glow', new THREE.BoxGeometry(0.012, 0.15, 0.012), [sx * 0.148, HY - 0.06, HZ - 0.08], [0.5, 0, 0]);
  bin.add('glow', new THREE.CylinderGeometry(0.158, 0.158, 0.03, 32, 1, true, Math.PI * 0.6, Math.PI * 0.8), [0, HY + 0.005, HZ], null, [1, 1, 1.16]); // thin visor light line
  bin.add('stripe', new THREE.BoxGeometry(0.035, 0.012, 0.32), [0, HY + 0.148, HZ + 0.01], [0.08, 0, 0]);
  for (const sx of [-1, 1]) bin.add('carbon', new RoundedBoxGeometry(0.02, 0.05, 0.08, 2, 0.008), [sx * 0.145, HY + 0.01, HZ + 0.03]); // side vents

  bin.build(g, M);

  // sharp full-face helmet: faceted gloss shell, pointed chin, dark wrap visor, tall rear fin
  {
    const gloss = new THREE.MeshPhysicalMaterial({ color: '#07070c', metalness: 0.4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, flatShading: true });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.152, 1), gloss);
    shell.position.set(0, HY, HZ); shell.scale.set(1.12, 1.06, 1.3); g.add(shell);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 12), gloss); neck.position.set(0, HY - 0.15, HZ + 0.03); g.add(neck);
    const chin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), gloss);
    chin.position.set(0, HY - 0.085, HZ - 0.12); chin.rotation.set(-Math.PI / 2 - 0.45, Math.PI / 4, 0); chin.scale.set(1.25, 1, 0.65); g.add(chin);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.157, 0.157, 0.075, 24, 1, true, Math.PI * 0.64, Math.PI * 0.72), new THREE.MeshPhysicalMaterial({ color: '#020205', metalness: 0.95, roughness: 0.04, side: THREE.DoubleSide }));
    visor.position.set(0, HY + 0.04, HZ); visor.scale.set(1, 1, 1.18); g.add(visor);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.16), gloss);
    fin.position.set(0, HY + 0.13, HZ + 0.12); fin.rotation.x = -0.5; g.add(fin);
    for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 0.11), gloss); w.position.set(sx * 0.07, HY + 0.1, HZ + 0.15); w.rotation.set(-0.45, sx * 0.25, 0); g.add(w); }
  }


  // plate
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.06), new THREE.MeshBasicMaterial({ map: plateTexture(), color: HDR('#ffffff', 0.9) }));
  plate.position.set(0, 0.62, 1.035);
  g.add(plate);

  // wheels: front first (steering)
  const wheels = [];
  for (const [z, width, disc] of [[FZ, 0.12, { r: 0.16, xs: [-0.075, 0.075] }], [RZw, 0.18, { r: 0.12, xs: [-0.09] }]]) {
    const w = buildWheel({ R, width, rimR: 0.22, spokes: 3, spokeStyle: 'y', mats: M, disc, glowRing: !!glowHex });
    const holder = new THREE.Group();
    holder.add(w);
    holder.userData = { spin: w, sign: 1 };
    const big = z > 0 ? 1.24 : 1.16; // bigger wheels, the rear a touch more
    holder.scale.setScalar(big);
    holder.position.set(0, R * big, z);
    g.add(holder);
    wheels.push(holder);
  }
  const flames = flamesAt(pipeEnds.map(([x, y, z]) => [x, y, z + 0.16]), 0.9);
  flames.forEach((f) => g.add(f));
  const { glowLight, tailLight } = lights(g, null, TZ); // rims and pool carry the glow; a point light this low mirrors as a hot spot on the wet road
  return { group: g, wheels, flames, M, glowLight, tailLight, length: 2.2, width: 0.75, wheelR: R * 1.2, rearZ: TZ, tailY: 1.04, tailHalfW: 0.08, bike: true };
}
