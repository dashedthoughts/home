// The courier: an original design. Hooded yellow jacket with a magenta lining, cyan visor, a magenta delivery pack
// with the 糸 mark, wrist launchers, indigo trousers, white trainers, and a long magenta scarf.
// A procedural rig of capsules (no skinning). The pose updates "on twos" (12 fps) from strong keyframes,
// while the body travels smoothly at the display rate.
import * as THREE from 'three';
import { heroMaterial, ghostMaterial, ID_HERO0 } from './materials.js';
import { packTexture } from './textures.js';
import { MODE } from '../sim/physics.js';

const C = { jacket: '#ffd21f', lining: '#ff2bd6', visor: '#18e7ff', mask: '#231541', pants: '#4b37b0', pad: '#18e7ff', shoe: '#f6f1e6', sole: '#ff2bd6', glove: '#1b1030', pack: '#ff2bd6', stripe: '#fff6e0', launcher: '#18e7ff' };

// joint rotations (euler x, y, z). Body faces +z, left side is +x, arms hang along -y.
const J = ['spine', 'chest', 'neck', 'shL', 'elL', 'shR', 'elR', 'hipL', 'knL', 'hipR', 'knR'];
const POSES = {
  idle: { spine: [0.08, 0, 0], chest: [0.05, 0, 0], neck: [-0.05, 0, 0], shL: [0.1, 0, 0.18], elL: [-0.3, 0, 0], shR: [0.1, 0, -0.18], elR: [-0.3, 0, 0], hipL: [-0.15, 0, 0.06], knL: [0.25, 0, 0], hipR: [-0.05, 0, -0.06], knR: [0.15, 0, 0] },
  runA: { spine: [0.3, 0, 0], chest: [0.1, 0.15, 0], neck: [-0.25, 0, 0], shL: [0.9, 0, 0.15], elL: [-1.2, 0, 0], shR: [-1.0, 0, -0.15], elR: [-1.4, 0, 0], hipL: [-1.1, 0, 0.05], knL: [0.6, 0, 0], hipR: [0.5, 0, -0.05], knR: [1.4, 0, 0] },
  runB: { spine: [0.3, 0, 0], chest: [0.1, -0.15, 0], neck: [-0.25, 0, 0], shL: [-1.0, 0, 0.15], elL: [-1.4, 0, 0], shR: [0.9, 0, -0.15], elR: [-1.2, 0, 0], hipL: [0.5, 0, 0.05], knL: [1.4, 0, 0], hipR: [-1.1, 0, -0.05], knR: [0.6, 0, 0] },
  // line in the RIGHT hand (mirrored for the left)
  swing: { spine: [-0.15, 0, 0], chest: [-0.1, 0, 0.1], neck: [-0.35, 0, 0], shR: [-2.95, 0, -0.12], elR: [-0.12, 0, 0], shL: [0.7, 0, 1.1], elL: [-0.9, 0, 0], hipL: [-1.0, 0, 0.12], knL: [1.5, 0, 0], hipR: [-0.35, 0, -0.08], knR: [0.5, 0, 0] },
  swingLow: { spine: [-0.3, 0, 0], chest: [-0.15, 0, 0.12], neck: [-0.45, 0, 0], shR: [-3.0, 0, -0.1], elR: [-0.05, 0, 0], shL: [1.1, 0, 0.6], elL: [-0.6, 0, 0], hipL: [-1.55, 0, 0.1], knL: [0.6, 0, 0], hipR: [-1.3, 0, -0.1], knR: [0.4, 0, 0] },
  tuck: { spine: [0.75, 0, 0], chest: [0.4, 0, 0], neck: [0.2, 0, 0], shL: [-0.9, 0, 0.35], elL: [-2.0, 0, 0], shR: [-0.9, 0, -0.35], elR: [-2.0, 0, 0], hipL: [-2.1, 0, 0.2], knL: [2.4, 0, 0], hipR: [-2.0, 0, -0.2], knR: [2.4, 0, 0] },
  soar: { spine: [-0.25, 0, 0], chest: [-0.15, 0, 0], neck: [-0.4, 0, 0], shL: [-2.6, 0, 0.5], elL: [-0.2, 0, 0], shR: [0.4, 0, -0.9], elR: [-0.5, 0, 0], hipL: [-0.9, 0, 0.1], knL: [1.6, 0, 0], hipR: [0.45, 0, -0.1], knR: [0.4, 0, 0] },
  fall: { spine: [0.05, 0, 0], chest: [0, 0, 0], neck: [-0.3, 0, 0], shL: [-0.4, 0, 2.0], elL: [-0.5, 0, 0], shR: [-0.4, 0, -2.0], elR: [-0.5, 0, 0], hipL: [-0.6, 0, 0.25], knL: [1.0, 0, 0], hipR: [-0.2, 0, -0.25], knR: [0.5, 0, 0] },
  dive: { spine: [-0.1, 0, 0], chest: [-0.1, 0, 0], neck: [-0.7, 0, 0], shL: [0.5, 0, 0.35], elL: [-0.15, 0, 0], shR: [0.5, 0, -0.35], elR: [-0.15, 0, 0], hipL: [0.1, 0, 0.08], knL: [0.25, 0, 0], hipR: [0.15, 0, -0.08], knR: [0.15, 0, 0] },
  wallA: { spine: [0.2, 0, 0], chest: [0.05, 0.2, 0], neck: [-0.3, 0, 0], shL: [1.1, 0, 0.3], elL: [-1.3, 0, 0], shR: [-1.2, 0, -0.3], elR: [-1.4, 0, 0], hipL: [-1.4, 0, 0.1], knL: [0.9, 0, 0], hipR: [0.4, 0, -0.1], knR: [1.6, 0, 0] },
  wallB: { spine: [0.2, 0, 0], chest: [0.05, -0.2, 0], neck: [-0.3, 0, 0], shL: [-1.2, 0, 0.3], elL: [-1.4, 0, 0], shR: [1.1, 0, -0.3], elR: [-1.3, 0, 0], hipL: [0.4, 0, 0.1], knL: [1.6, 0, 0], hipR: [-1.4, 0, -0.1], knR: [0.9, 0, 0] },
  dash: { spine: [0.55, 0, 0], chest: [0.2, 0, 0], neck: [-0.6, 0, 0], shL: [1.3, 0, 0.5], elL: [-0.3, 0, 0], shR: [1.3, 0, -0.5], elR: [-0.3, 0, 0], hipL: [-1.3, 0, 0.1], knL: [1.2, 0, 0], hipR: [0.6, 0, -0.1], knR: [0.5, 0, 0] },
  zip: { spine: [0.1, 0, 0], chest: [0, 0, 0.1], neck: [-0.3, 0, 0], shR: [-2.9, 0, -0.1], elR: [0, 0, 0], shL: [-2.6, 0, 0.4], elL: [-0.4, 0, 0], hipL: [0.2, 0, 0.1], knL: [0.6, 0, 0], hipR: [0.35, 0, -0.1], knR: [0.3, 0, 0] },
  land: { spine: [0.7, 0, 0], chest: [0.3, 0, 0], neck: [-0.4, 0, 0], shL: [-0.4, 0, 0.9], elL: [-0.6, 0, 0], shR: [0.5, 0, -0.5], elR: [-0.4, 0, 0], hipL: [-1.6, 0, 0.3], knL: [2.2, 0, 0], hipR: [-0.6, 0, -0.3], knR: [2.3, 0, 0] },
};
function mirror(p) {
  const m = {};
  for (const k of J) {
    let src = k;
    if (k.endsWith('L')) src = k.slice(0, -1) + 'R'; else if (k.endsWith('R')) src = k.slice(0, -1) + 'L';
    const v = p[src] || [0, 0, 0];
    m[k] = [v[0], -v[1], -v[2]];
  }
  return m;
}

function capsule(r, len, mat) {
  const g = new THREE.CapsuleGeometry(r, len, 3, 10);
  g.translate(0, -len / 2 - r * 0.4, 0); // hangs from its joint
  return new THREE.Mesh(g, mat);
}

export function createHero(scene, opts = {}) {
  const ghost = !!opts.ghost;
  const disposables = [];
  let id = ID_HERO0;
  const mat = (color, em = 0) => {
    const m = ghost ? ghostMat : heroMaterial(color, id++, em);
    if (!ghost) disposables.push(m);
    return m;
  };
  const ghostMat = ghost ? ghostMaterial() : null;
  if (ghostMat) disposables.push(ghostMat);
  const root = new THREE.Group(); // positioned at the body centre
  const body = new THREE.Group(); // rotated as a whole (on twos)
  root.add(body);
  const joints = {};
  const add = (parent, name, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); joints[name] = g; return g; };
  const mesh = (parent, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); parent.add(m); disposables.push(m.geometry); return m; };

  const hips = add(body, 'hips', 0, 0, 0);
  mesh(hips, new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), mat(C.pants)), 0, -0.02, 0).scale.set(1.15, 0.8, 0.85);
  // jacket skirt: a short flared hem over the hips breaks the robot silhouette
  const hem = mesh(hips, new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 0.2, 14, 1, true), mat(C.jacket)), 0, 0.02, -0.01);
  hem.scale.set(1.05, 1, 0.85);
  if (!ghost) hem.material.side = THREE.DoubleSide;
  const spine = add(hips, 'spine', 0, 0.06, 0);
  const torso = mesh(spine, capsule(0.165, 0.22, mat(C.jacket)), 0, 0.42, 0);
  torso.scale.set(1.12, 1, 0.82);
  const chest = add(spine, 'chest', 0, 0.3, 0);
  // jacket hem and zip line
  mesh(chest, new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.02), mat(C.glove)), 0, -0.08, 0.145);
  // the pack
  const pack = mesh(chest, new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.2), mat(C.pack)), 0, -0.02, -0.24);
  mesh(chest, new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.205), mat(C.stripe, 0.6)), 0, 0.02, -0.24);
  // the 糸 mark on the back of the pack (seen in every chase shot)
  if (!ghost) {
    const decalTex = packTexture();
    const dm = new THREE.ShaderMaterial({ uniforms: { uMap: { value: decalTex }, uId: { value: (id++) / 255 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'uniform sampler2D uMap; uniform float uId; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb, uId); }' });
    disposables.push(dm, decalTex);
    const decal = mesh(chest, new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), dm), 0, -0.01, -0.342);
    decal.rotation.y = Math.PI;
  }
  void pack;
  const neck = add(chest, 'neck', 0, 0.2, 0);
  mesh(neck, new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), mat(C.mask)), 0, 0.14, 0.01);
  // visor: a wraparound band
  const vis = mesh(neck, new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.03, 6, 16, Math.PI * 1.1), mat(C.visor, 1)), 0, 0.16, 0.012);
  vis.rotation.set(Math.PI / 2, 0, Math.PI * 0.45 - Math.PI * 0.55 + Math.PI);
  vis.scale.set(1, 1, 0.75);
  // hood: shell behind and over the head, magenta lining edge
  const hood = mesh(neck, new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.64), mat(C.jacket)), 0, 0.15, -0.045);
  hood.rotation.x = -0.6;
  hood.scale.set(1, 1.08, 1.12);
  // the hood's peak, folded back
  const peak = mesh(neck, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 8), mat(C.jacket)), 0, 0.24, -0.19);
  peak.rotation.x = -2.2;
  const rimG = new THREE.TorusGeometry(0.13, 0.022, 6, 18);
  const rim = mesh(neck, new THREE.Mesh(rimG, mat(C.lining)), 0, 0.17, 0.035);
  rim.rotation.x = -0.35;
  rim.scale.set(1, 1.15, 1);
  // arms
  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const sh = add(chest, 'sh' + L, 0.215 * s, 0.13, 0);
    mesh(sh, capsule(0.058, 0.2, mat(C.jacket)));
    const el = add(sh, 'el' + L, 0, -0.29, 0);
    mesh(el, capsule(0.052, 0.17, mat(C.jacket)));
    mesh(el, new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), mat(C.launcher, 1)), 0, -0.22, 0);
    const hand = add(el, 'hand' + L, 0, -0.31, 0);
    mesh(hand, new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), mat(C.glove)));
  }
  // legs
  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const hp = add(hips, 'hip' + L, 0.1 * s, -0.06, 0);
    mesh(hp, capsule(0.078, 0.3, mat(C.pants)));
    mesh(hp, new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.05), mat(C.jacket)), 0.075 * s, -0.2, 0);
    const kn = add(hp, 'kn' + L, 0, -0.42, 0);
    mesh(kn, capsule(0.066, 0.3, mat(C.pants)));
    mesh(kn, new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat(C.pad)), 0, -0.02, 0.03).scale.set(1, 1.1, 0.8);
    const ft = add(kn, 'ft' + L, 0, -0.42, 0);
    mesh(ft, new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.25), mat(C.shoe)), 0, -0.03, 0.06);
    mesh(ft, new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.035, 0.255), mat(C.sole)), 0, -0.085, 0.06);
  }
  // scarf: a ribbon trailing from the neck, simulated as a few points (updated on twos)
  const SN = 7;
  const scarfPos = new Float32Array((SN * 2) * 3);
  const scarfG = new THREE.BufferGeometry();
  scarfG.setAttribute('position', new THREE.BufferAttribute(scarfPos, 3));
  const sIdx = [];
  for (let k = 0; k < SN - 1; k++) { const a = k * 2; sIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  scarfG.setIndex(sIdx);
  const scarfNorm = new Float32Array(SN * 2 * 3); for (let k = 0; k < SN * 2; k++) scarfNorm[k * 3 + 2] = 1;
  scarfG.setAttribute('normal', new THREE.BufferAttribute(scarfNorm, 3));
  const scarfMat = ghost ? ghostMat : heroMaterial(C.lining, id++, 0.2);
  if (!ghost) { scarfMat.side = THREE.DoubleSide; disposables.push(scarfMat); }
  disposables.push(scarfG);
  const scarf = new THREE.Mesh(scarfG, scarfMat);
  scarf.frustumCulled = false;
  const scarfPts = Array.from({ length: SN }, () => new THREE.Vector3());
  let scarfInit = false;

  scene.add(root);
  if (!ghost) scene.add(scarf);

  // ---- pose state ----
  const cur = {}; for (const k of J) cur[k] = [0, 0, 0];
  const curQ = new THREE.Quaternion();
  const tmpQ = new THREE.Quaternion(), m4 = new THREE.Matrix4(), vUp = new THREE.Vector3(), vF = new THREE.Vector3(), vR = new THREE.Vector3();
  let tick = 0, frame = 0, poseName = 'idle', lift = 0;

  function choose(pl) {
    const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
    switch (pl.mode) {
      case MODE.SWING: {
        const low = (pl.y - pl.ay) / Math.max(pl.L, 1) < -0.85;
        const p = low ? POSES.swingLow : POSES.swing;
        return pl.hand > 0 ? p : mirror(p);
      }
      case MODE.WALL: return frame % 2 ? POSES.wallA : POSES.wallB;
      case MODE.ZIP: return POSES.zip;
      case MODE.GROUND:
        if (pl.rollT > 0) return POSES.tuck;
        if (pl.landT < 0.2) return POSES.land;
        if (Math.hypot(pl.vx, pl.vz) > 2) return frame % 2 ? POSES.runA : POSES.runB;
        return POSES.idle;
      default:
        if (pl.dashT < 0.25) return POSES.dash;
        if (pl.dive) return POSES.dive;
        if (pl.releaseT < 0.3 || pl.kickT < 0.25) return POSES.tuck;
        if (pl.vy > 2) return pl.side > 0 ? POSES.soar : mirror(POSES.soar);
        return POSES.fall;
    }
    void sp;
  }
  // root orientation target: body axis and facing
  function orient(pl, out) {
    const sp = Math.hypot(pl.vx, pl.vy, pl.vz) || 1;
    vF.set(pl.vx / sp, pl.vy / sp, pl.vz / sp);
    const hs = Math.hypot(pl.vx, pl.vz);
    switch (pl.mode) {
      case MODE.SWING: vUp.set(pl.ax - pl.x, pl.ay - pl.y, pl.az - pl.z).normalize(); break;
      case MODE.ZIP: vUp.set(pl.zx - pl.x, pl.zy - pl.y + 3, pl.zz - pl.z).normalize(); break;
      case MODE.WALL: vUp.set(pl.wnx * 0.35, 1, pl.wnz * 0.35).normalize(); if (pl.wallUp) { vUp.set(-pl.wnx, 0.25, -pl.wnz).normalize(); vF.set(0, 1, 0); } break;
      case MODE.GROUND: vUp.set(0, 1, 0); break;
      default:
        if (pl.dive) { vUp.copy(vF); vF.set(0, -1, 0); if (Math.abs(vUp.y) > 0.98) vF.set(Math.sin(pl.yaw), 0, Math.cos(pl.yaw)); }
        else vUp.set(pl.vx * 0.012, 1, pl.vz * 0.012).normalize();
    }
    if (hs < 0.5 && pl.mode !== MODE.WALL && !pl.dive) vF.set(Math.sin(pl.yaw), 0, Math.cos(pl.yaw));
    // forward = velocity with the up component removed
    vF.addScaledVector(vUp, -vF.dot(vUp));
    if (vF.lengthSq() < 1e-4) vF.set(Math.sin(pl.yaw), 0, Math.cos(pl.yaw)).addScaledVector(vUp, -Math.sin(pl.yaw) * vUp.x - Math.cos(pl.yaw) * vUp.z);
    vF.normalize();
    vR.crossVectors(vUp, vF).normalize();
    m4.makeBasis(vR, vUp, vF);
    out.setFromRotationMatrix(m4);
    // tumble in the roll
    if (pl.mode === MODE.GROUND && pl.rollT > 0) { tmpQ.setFromAxisAngle(vR.set(1, 0, 0), (1 - pl.rollT / 0.45) * Math.PI * 2); out.multiply(tmpQ); }
    return out;
  }

  const tq = new THREE.Quaternion();
  return {
    root, joints, scarf,
    // pose on twos: call every frame with display time; only every 1/12 s does the pose actually change
    update(pl, x, y, z, t, reduced) {
      // smooth travel, every frame
      const wantLift = pl.mode === MODE.GROUND ? (pl.rollT > 0 ? 0.05 : pl.landT < 0.2 ? 0.12 : 0.38) : 0;
      lift += (wantLift - lift) * 0.35;
      root.position.set(x, y + lift, z);
      const step = Math.floor(t * 12);
      if (step !== tick || reduced === 'force') {
        tick = step; frame++;
        const target = choose(pl);
        const k = 0.7;
        for (const j of J) { const a = cur[j], b = target[j] || [0, 0, 0]; a[0] += (b[0] - a[0]) * k; a[1] += (b[1] - a[1]) * k; a[2] += (b[2] - a[2]) * k; joints[j].rotation.set(a[0], a[1], a[2]); }
        orient(pl, tq);
        curQ.slerp(tq, 0.75);
        body.quaternion.copy(curQ);
        poseName = pl.mode;
        // scarf follows on twos as well
        root.updateMatrixWorld(true);
        const base = joints.neck.getWorldPosition(new THREE.Vector3());
        const sp = Math.hypot(pl.vx, pl.vy, pl.vz);
        const back = new THREE.Vector3(-pl.vx, -pl.vy, -pl.vz).multiplyScalar(1 / Math.max(sp, 1));
        if (sp < 3) back.set(-Math.sin(pl.yaw) * 0.35, -1, -Math.cos(pl.yaw) * 0.35).normalize();
        if (!scarfInit) { for (const p of scarfPts) p.copy(base); scarfInit = true; }
        scarfPts[0].copy(base);
        const segL = 0.09 + Math.min(sp, 40) * 0.0035;
        for (let s = 1; s < SN; s++) {
          const prev = scarfPts[s - 1];
          const wave = Math.sin(frame * 1.7 + s * 1.3) * 0.06 * Math.min(1, sp / 20);
          const want = new THREE.Vector3().copy(prev).addScaledVector(back, segL).add(new THREE.Vector3(0, -0.03 * (1 - Math.min(1, sp / 15)) + wave, wave));
          scarfPts[s].lerp(want, 0.8);
          const d = scarfPts[s].clone().sub(prev); if (d.length() > segL) scarfPts[s].copy(prev).addScaledVector(d.normalize(), segL);
        }
        const side = new THREE.Vector3().crossVectors(back, new THREE.Vector3(0, 1, 0));
        if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
        side.normalize().multiplyScalar(0.07);
        for (let s = 0; s < SN; s++) {
          const w = 1 - s / SN * 0.5;
          scarfPos[s * 6] = scarfPts[s].x - side.x * w; scarfPos[s * 6 + 1] = scarfPts[s].y - side.y * w; scarfPos[s * 6 + 2] = scarfPts[s].z - side.z * w;
          scarfPos[s * 6 + 3] = scarfPts[s].x + side.x * w; scarfPos[s * 6 + 4] = scarfPts[s].y + side.y * w; scarfPos[s * 6 + 5] = scarfPts[s].z + side.z * w;
        }
        scarfG.attributes.position.needsUpdate = true;
        scarfG.computeBoundingSphere();
      }
      // the scarf base rides along between pose ticks (it is attached to the body)
    },
    handWorld(side, out) { return joints[side > 0 ? 'handR' : 'handL'].getWorldPosition(out); },
    setVisible(v) { root.visible = v; scarf.visible = v && !ghost; },
    pose: () => poseName,
    dispose() { scene.remove(root); scene.remove(scarf); for (const d of disposables) d.dispose?.(); },
  };
}
