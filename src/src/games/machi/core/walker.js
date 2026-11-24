// First-person walker: gravity, jump, fly, AABB-vs-voxel collision with step-up. Pure; units are voxels (0.5 m).
import { SHAPE, SOLID, ID } from './blocks.js';

export const HALF_W = 0.55, HEIGHT = 3.3, EYE = 3.0;
const BOXES = [
  [[0, 0, 0, 1, 1, 1]],
  [[0, 0, 0, 1, 0.5, 1]],
  [[0, 0, 0, 1, 0.5, 1], [0, 0.5, 0, 1, 1, 0.5]],
  [[0, 0, 0, 1, 0.5, 1], [0.5, 0.5, 0, 1, 1, 1]],
  [[0, 0, 0, 1, 0.5, 1], [0, 0.5, 0.5, 1, 1, 1]],
  [[0, 0, 0, 1, 0.5, 1], [0, 0.5, 0, 0.5, 1, 1]],
  [[0.34, 0, 0.34, 0.66, 1, 0.66]],
];
const FULL = BOXES[0];
// collision boxes for the cell (world space); outside the lot counts as a wall, below 0 as floor
function cellBoxes(world, x, y, z) {
  if (y < 0) return FULL;
  if (x < 0 || z < 0 || x >= world.W || z >= world.D) return FULL;
  if (y >= world.H) return null;
  const b = world.blocks[x + world.W * (z + world.D * y)];
  if (!b || !SOLID[b]) return null;
  const s = SHAPE[b];
  return s <= 6 ? BOXES[s] : null;
}
export function overlapsSolid(world, x0, y0, z0, x1, y1, z1) {
  const e = 1e-6;
  for (let y = Math.floor(y0 + e); y <= Math.floor(y1 - e); y++)
    for (let z = Math.floor(z0 + e); z <= Math.floor(z1 - e); z++)
      for (let x = Math.floor(x0 + e); x <= Math.floor(x1 - e); x++) {
        const bs = cellBoxes(world, x, y, z);
        if (!bs) continue;
        for (const b of bs) if (x + b[3] > x0 + e && x + b[0] < x1 - e && y + b[4] > y0 + e && y + b[1] < y1 - e && z + b[5] > z0 + e && z + b[2] < z1 - e) return true;
      }
  return false;
}

export class Walker {
  constructor(world) { this.world = world; this.pos = [0, 0, 0]; this.vel = [0, 0, 0]; this.yaw = 0; this.pitch = 0; this.onGround = false; this.fly = false; this.stepAcc = 0; this.eyeLag = 0; this.lastJump = -9; this.time = 0; this.inWater = false; }
  box(p = this.pos) { return [p[0] - HALF_W, p[1], p[2] - HALF_W, p[0] + HALF_W, p[1] + HEIGHT, p[2] + HALF_W]; }
  blocked(p) { const b = this.box(p); return overlapsSolid(this.world, ...b); }
  // find a free standing spot at or above (x, z)
  spawn(x, z, yaw = 0) {
    const w = this.world;
    x = Math.max(1, Math.min(w.W - 2, x)); z = Math.max(1, Math.min(w.D - 2, z));
    for (let y = 0; y < w.H; y++) { const p = [x, y, z]; if (!this.blocked(p) && this.blocked([x, y - 0.05, z])) { this.pos = p; break; } this.pos = [x, w.H, z]; }
    this.vel = [0, 0, 0]; this.yaw = yaw; this.pitch = 0; this.fly = false;
  }
  // input: { fwd, strafe (-1..1), jump (held), jumpPressed, sprint, down }. yaw 0 looks toward -z.
  step(dt, input) {
    this.time += dt;
    const w = this.world;
    const feet = w.get(Math.floor(this.pos[0]), Math.floor(this.pos[1] + 0.2), Math.floor(this.pos[2]));
    this.inWater = feet === ID.water;
    if (input.jumpPressed) {
      if (this.time - this.lastJump < 0.3) { this.fly = !this.fly; this.vel[1] = 0; this.lastJump = -9; }
      else this.lastJump = this.time;
    }
    const speed = (this.fly ? 18 : input.sprint ? 13 : 8) * (this.inWater ? 0.55 : 1);
    const s = Math.sin(this.yaw), c = Math.cos(this.yaw);
    const fw = input.fwd || 0, st = input.strafe || 0;
    let mx = -s * fw + c * st, mz = -c * fw - s * st;
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    const accel = this.onGround || this.fly ? 14 : 4;
    const k = 1 - Math.exp(-accel * dt);
    this.vel[0] += (mx * speed - this.vel[0]) * k;
    this.vel[2] += (mz * speed - this.vel[2]) * k;
    if (this.fly) {
      const vy = (input.jump ? 1 : 0) - (input.down ? 1 : 0);
      this.vel[1] += (vy * speed * 0.8 - this.vel[1]) * k;
    } else {
      if (this.inWater) { this.vel[1] -= 12 * dt; this.vel[1] = Math.max(this.vel[1], -5); if (input.jump) this.vel[1] = 5; }
      else { this.vel[1] -= 40 * dt; this.vel[1] = Math.max(this.vel[1], -60); }
      if (input.jump && this.onGround) { this.vel[1] = 14.2; this.onGround = false; }
    }
    this.move(dt);
  }
  move(dt) {
    const p = this.pos;
    const wasGround = this.onGround;
    this.onGround = false;
    for (let a of [1, 0, 2]) {
      let d = this.vel[a] * dt;
      const n = Math.max(1, Math.ceil(Math.abs(d) / 0.2));
      const sd = d / n;
      for (let i = 0; i < n; i++) {
        const q = [p[0], p[1], p[2]]; q[a] += sd;
        if (!this.blocked(q)) { p[a] = q[a]; continue; }
        // step up onto slabs and single blocks when walking
        if (a !== 1 && (wasGround || this.onGround) && !this.fly) {
          let stepped = false;
          for (const up of [0.5, 1.0]) {
            const r = [q[0], q[1] + up + 0.01, q[2]];
            if (!this.blocked(r) && !this.blocked([p[0], p[1] + up + 0.01, p[2]])) { p[0] = r[0]; p[1] = r[1]; p[2] = r[2]; this.eyeLag -= up + 0.01; stepped = true; break; }
          }
          if (stepped) continue;
        }
        // slide to contact with a binary search, then stop on this axis
        let lo = 0, hi = sd;
        for (let it = 0; it < 8; it++) { const m = (lo + hi) / 2; const r = [p[0], p[1], p[2]]; r[a] += m; if (this.blocked(r)) hi = m; else lo = m; }
        p[a] += lo;
        if (a === 1 && this.vel[1] < 0) this.onGround = true;
        this.vel[a] = 0;
        break;
      }
    }
    if (!this.onGround && this.vel[1] <= 0 && this.blocked([p[0], p[1] - 0.04, p[2]])) this.onGround = true;
    if (this.pos[1] < -20) this.spawn(this.world.W / 2, this.world.D / 2);
    this.eyeLag *= Math.exp(-dt * 14);
    if (this.onGround && Math.hypot(this.vel[0], this.vel[2]) > 1) this.stepAcc += Math.hypot(this.vel[0], this.vel[2]) * dt; else if (!this.onGround) this.stepAcc = 0;
  }
  eye() { return [this.pos[0], this.pos[1] + EYE + this.eyeLag, this.pos[2]]; }
}
