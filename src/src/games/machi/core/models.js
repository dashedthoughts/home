// Small voxel models for things that move or are too fine for 0.5 m voxels.
// Each is a tiny World meshed with the same mesher; `scale` is model voxels -> world voxels.
import { World } from './world.js';
import { ID } from './blocks.js';

function line(w, y0, z0, y1, z1, x0, x1, b) {
  const n = Math.max(Math.abs(y1 - y0), Math.abs(z1 - z0)) * 2 + 1;
  for (let i = 0; i <= n; i++) { const t = i / n; const y = Math.round(y0 + (y1 - y0) * t), z = Math.round(z0 + (z1 - z0) * t); for (let x = x0; x <= x1; x++) w.setRaw(x, y, z, b); }
}
// commuter train car, 14 m long. Runs along z. Original livery.
export function trainCar() {
  const w = new World(11, 15, 56);
  w.fill(1, 0, 6, 9, 1, 12, ID.black); w.fill(1, 0, 43, 9, 1, 49, ID.black);
  w.fill(1, 2, 0, 9, 2, 55, ID.steel);
  w.fill(0, 3, 0, 10, 12, 55, ID.vendwhite);
  w.fill(1, 13, 1, 9, 13, 54, ID.metal);
  for (const z of [8, 30, 48]) w.fill(3, 14, z, 7, 14, z + 4, ID.vendwhite); // roof air-con
  for (const x of [0, 10]) {
    w.fill(x, 5, 0, x, 5, 55, ID.tileblue); w.fill(x, 4, 0, x, 4, 55, ID.vermilion);
    for (let z = 2; z < 54; z++) {
      const door = (z >= 9 && z <= 12) || (z >= 26 && z <= 29) || (z >= 43 && z <= 46);
      if (door) { for (let y = 3; y <= 11; y++) w.setRaw(x, y, z, ID.steel); for (let y = 7; y <= 9; y++) w.setRaw(x, y, z, ID.konbini); }
      else if ((z % 6) < 4) for (let y = 7; y <= 10; y++) w.setRaw(x, y, z, ID.konbini);
    }
  }
  for (const z of [0, 55]) {
    w.fill(2, 7, z, 8, 10, z, ID.darkglass);
    w.setRaw(2, 5, z, ID.konbini); w.setRaw(8, 5, z, ID.konbini);
    w.fill(3, 11, z, 7, 11, z, ID.neonamber);
  }
  return { world: w, scale: 0.5 };
}
// calico cat: standing and sitting. Faces +z.
export function cat(sit = false) {
  const w = new World(5, 9, 11);
  const B = ID.plaster, O = ID.wood, K = ID.black, E = ID.neonamber;
  if (!sit) {
    for (const [x, z] of [[1, 2], [3, 2], [1, 7], [3, 7]]) { w.setRaw(x, 0, z, B); w.setRaw(x, 1, z, B); }
    w.fill(1, 2, 1, 3, 3, 8, B);
    w.fill(1, 3, 2, 3, 3, 4, O); w.fill(1, 2, 6, 2, 3, 7, K);
    w.fill(1, 3, 8, 3, 5, 10, B);
    w.fill(1, 5, 8, 2, 5, 9, O); w.setRaw(3, 5, 9, K);
    w.setRaw(1, 6, 9, O); w.setRaw(3, 6, 9, K);
    w.setRaw(1, 4, 10, E); w.setRaw(3, 4, 10, E);
    w.setRaw(2, 3, 0, O); w.setRaw(2, 4, 0, O); w.setRaw(2, 5, 0, K); w.setRaw(2, 6, 1, K);
  } else {
    w.fill(1, 0, 2, 3, 3, 6, B); w.fill(1, 1, 2, 3, 3, 3, O);
    for (const x of [1, 3]) for (let y = 0; y <= 2; y++) w.setRaw(x, y, 7, B);
    w.fill(1, 4, 5, 3, 6, 7, B); w.fill(1, 6, 5, 2, 6, 6, O);
    w.setRaw(1, 7, 6, O); w.setRaw(3, 7, 6, K);
    w.setRaw(1, 5, 8, E); w.setRaw(3, 5, 8, E); w.setRaw(1, 5, 7, B); w.setRaw(3, 5, 7, B);
    w.setRaw(0, 0, 3, O); w.setRaw(0, 0, 4, O); w.setRaw(0, 0, 5, K); w.setRaw(0, 0, 6, K);
  }
  return { world: w, scale: 0.125 };
}
// city bicycle with a front basket. Runs along z.
export function bike(frame = ID.tileblue) {
  const w = new World(3, 18, 28);
  const wheel = (cy, cz) => { for (let y = 0; y < 18; y++) for (let z = 0; z < 28; z++) { const d = Math.hypot(y - cy, z - cz); if (Math.abs(d - 5) < 0.75) w.setRaw(1, y, z, ID.black); } w.setRaw(1, cy, cz, ID.steel); };
  wheel(6, 6); wheel(6, 21);
  line(w, 6, 6, 12, 10, 1, 1, frame); line(w, 13, 9, 6, 11, 1, 1, frame); line(w, 7, 11, 13, 18, 1, 1, frame);
  line(w, 6, 21, 15, 18, 1, 1, ID.steel); line(w, 6, 6, 8, 11, 1, 1, frame);
  w.fill(0, 14, 8, 2, 14, 10, ID.black);
  w.fill(0, 16, 17, 2, 16, 18, ID.steel);
  for (let y = 12; y <= 14; y++) for (let z = 20; z <= 24; z++) for (let x = 0; x <= 2; x++) if (y === 12 || z === 20 || z === 24 || x !== 1) w.setRaw(x, y, z, ID.steel);
  w.fill(0, 12, 3, 2, 12, 7, ID.steel);
  return { world: w, scale: 0.125 };
}
