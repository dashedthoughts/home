// Camera assist, shared by the engine and the headless persona tests so both behave the same.
// When nobody is steering the camera it eases behind the travel direction; during a delivery run it also leans
// toward the next ring, so "hold forward" means "toward the course" for a first-timer.
import { MODE } from './physics.js';

const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

// cam: { yaw, pitch } (camera convention: forward = (-sin yaw, -cos yaw)); ring: {x,y,z} or null
export function assistCamera(cam, pl, dt, ring) {
  const hs = Math.hypot(pl.vx, pl.vz);
  if (pl.mode === MODE.WALL) return;
  let target = null, rate = 0;
  if (hs > 6) { target = Math.atan2(-pl.vx, -pl.vz); rate = 0.5 + hs * 0.035; }
  if (ring) {
    const dx = ring.x - pl.x, dz = ring.z - pl.z, hd = Math.hypot(dx, dz);
    const ry = Math.atan2(-dx, -dz);
    if (target === null) { target = ry; rate = 1.2; }
    else if (hd > 8) {
      const diff = wrap(ry - target);
      // lean most of the way to the ring when it is roughly ahead; start turning when it is behind
      target += Math.abs(diff) < 2.0 ? diff * 0.65 : Math.sign(diff) * 1.0;
    }
  }
  if (target !== null) cam.yaw += wrap(target - cam.yaw) * Math.min(1, dt * rate);
  // pitch: a little above level, following climb and fall; frame the ring as it gets close
  let wantP = -0.14 - Math.max(-0.3, Math.min(0.3, pl.vy * 0.006));
  if (ring) {
    const hd = Math.hypot(ring.x - pl.x, ring.z - pl.z);
    if (hd < 90) wantP = wantP * 0.5 + 0.5 * Math.max(-0.5, Math.min(0.25, Math.atan2(ring.y - pl.y - 1, Math.max(hd, 1))));
  }
  if (hs > 6 || ring) cam.pitch += (wantP - cam.pitch) * Math.min(1, dt * 1.2);
}
