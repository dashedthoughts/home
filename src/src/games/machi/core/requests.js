// Neighbourhood requests: small goals checked by counting blocks in a box of the Tokyo corner. Pure.
import { ID } from './blocks.js';

const LIGHTS = ['lantern', 'paperlamp', 'shoplight', 'konbini', 'window', 'neonpink', 'neoncyan', 'neonred', 'neonamber', 'neongreen', 'neonblue', 'screen'];
const PLANTS = ['grass', 'flowers', 'fern', 'leaves', 'sakura'];
export const REQUESTS = [
  { id: 'ramen', who: 'Ramen bar', title: 'The ramen bar wants more lanterns', text: 'Hang 4 more lanterns or neon blocks on the ramen bar front, left of the konbini.', box: [32, 4, 38, 46, 16, 43], ids: LIGHTS, need: 4, reward: { stamp: 'Lantern string' }, look: { target: [40, 8, 42], yaw: 0.25, pitch: 0.3, dist: 30 } },
  { id: 'plot', who: 'Landlord', title: 'Build on the empty plot', text: 'The lot between the konbini and the karaoke bar is free. Put 40 blocks on it.', box: [60, 4, 18, 67, 40, 39], ids: null, need: 40, reward: { neon: ['neongreen', 'neonblue'] }, look: { target: [64, 8, 32], yaw: 0.3, pitch: 0.55, dist: 40 } },
  { id: 'canal', who: 'Night walkers', title: 'Light the canal path', text: 'Add 4 lights along the promenade on the far side of the canal.', box: [0, 4, 79, 95, 14, 85], ids: LIGHTS, need: 4, reward: { stamp: 'Street lamp' }, look: { target: [40, 5, 80], yaw: 0.2, pitch: 0.35, dist: 42 } },
  { id: 'cat', who: 'The cat', title: 'A rooftop garden for the cat', text: 'Plant 6 grass, flower or fern blocks on the izakaya roof (the one with 酒).', box: [28, 23, 52, 39, 34, 63], ids: PLANTS, need: 6, reward: { stamp: 'Planter', cat: [34, 57] }, look: { target: [34, 22, 57], yaw: -2.6, pitch: 0.6, dist: 34 } },
  { id: 'train', who: 'Rail fan', title: 'Photograph the train at blue hour', text: 'In photo mode, between 18:30 and 19:30, save a picture while the train is passing. It comes every 48 seconds.', photo: true, reward: { stamp: 'Water tank' }, look: { target: [83, 18, 60], yaw: -1.9, pitch: 0.18, dist: 46 } },
];
export const LOCKED_STAMPS = ['Lantern string', 'Street lamp', 'Planter', 'Water tank'];
export const LOCKED_NEON = ['neongreen', 'neonblue'];

export function countIn(world, box, ids) {
  const [x0, y0, z0, x1, y1, z1] = box;
  const set = ids ? new Set(ids.map((k) => ID[k])) : null;
  let n = 0;
  for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const b = world.get(x, y, z); if (set ? set.has(b) : b !== 0) n++; }
  return n;
}
// progress = how many more blocks than the untouched Tokyo corner has in that box
export function progress(req, world, baseWorld) {
  if (req.photo) return 0;
  return Math.max(0, countIn(world, req.box, req.ids) - countIn(baseWorld, req.box, req.ids));
}
export function nextRequest(state) { return REQUESTS.find((r) => !state.done.includes(r.id)) || null; }
