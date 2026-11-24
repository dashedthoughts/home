// NEON KUMITE · fighter definitions and frame data. Pure data, no DOM.
// Conventions (all in world units, y up, x forward = the way the fighter faces):
//   st = startup frames BEFORE the first active frame (the hitbox appears on frame st+1 counting the press frame as 1)
//   ac = active frames, rc = recovery frames. Total frames = st + ac + rc (checked by test.mjs).
//   hit/hurt boxes are [x0, y0, x1, y1] relative to the fighter's feet.
//   h: 'high' | 'mid' (block either way), 'low' (crouch-block), 'over' (stand-block), 'throw' (cannot be blocked)
//   tier: 1 light, 2 heavy, 3 special/EX, 4 super. Cancels go up a tier on contact (lights may chain twice).
//   kd: 0 no knockdown, 1 knockdown, 2 launch (juggle). lv = [back speed, up speed] for launches.
export const TIER = { L: 1, H: 2, S: 3, U: 4, T: 0 };
const D = { tier: 1, st: 4, ac: 2, rc: 8, dmg: 30, hs: 12, bs: 8, h: 'high', push: 6, kd: 0, jug: 1, mg: 22, chip: 0, cancel: true };
function M(o) {
  const m = { ...D, ...o };
  if (m.tier >= 3 && o.chip === undefined) m.chip = m.tier === 4 ? 0.25 : 0.14;
  if (m.tier >= 3 && o.cancel === undefined) m.cancel = false;
  if (m.kd && !m.lv) m.lv = m.kd === 2 ? [2.5, 8.5] : [3.2, 5.5];
  return m;
}
const throwMove = (name, dmg, extra = {}) => M({ name, tier: 0, st: 3, ac: 2, rc: 22, dmg, h: 'throw', kd: 1, lv: [4, 6], cancel: false, mg: 60, hit: [10, 20, 52, 150], grab: { tech: true, dur: 34, rel: 26, hold: [[0, 40, 0], [26, 40, 30]] }, ...extra });

export const FIGHTERS = {
  rin: {
    id: 'rin', name: 'RIN', full: 'Rin Hayase', jp: '早瀬 凛', color: '#b8ff2e', ink: '#101208',
    style: 'Rushdown', bio: 'Shimbashi bike courier. Never late, never second. Kicks first, signs for it later.',
    quote: ['Signed, sealed, delivered. You owe me a tip.', 'Too slow. My bike has more fight in it.', 'Next drop is across town. Keep up.'],
    hp: 960, power: 1.15, walkF: 4.3, walkB: 3.4, jumpV: 12.4, jumpX: 4.7, grav: 0.62, dashF: [16, 118], dashB: [18, 92], hw: 25, hh: 158, ch: 102, scale: 0.96, meterRate: 1.1,
    moves: {
      L5: M({ name: 'Flick Jab', st: 3, ac: 2, rc: 7, dmg: 28, hs: 12, bs: 8, hit: [26, 108, 72, 136], push: 6 }),
      H5: M({ name: 'Courier Roundhouse', tier: 2, st: 8, ac: 3, rc: 16, dmg: 76, hs: 19, bs: 13, h: 'high', hit: [24, 92, 94, 132], push: 10, mg: 40 }),
      L2: M({ name: 'Curb Tap', st: 4, ac: 2, rc: 8, dmg: 24, hs: 12, bs: 8, h: 'low', hit: [24, 0, 80, 28], push: 6 }),
      H2: M({ name: 'Pedal Sweep', tier: 2, st: 7, ac: 3, rc: 20, dmg: 70, bs: 12, h: 'low', kd: 1, hit: [20, 0, 98, 24], push: 9, mg: 40, cancel: false }),
      Lj: M({ name: 'Air Knee', st: 4, ac: 7, rc: 6, dmg: 40, hs: 14, bs: 10, h: 'over', air: 1, hit: [6, 36, 44, 82], push: 5 }),
      Hj: M({ name: 'Drop Heel', tier: 2, st: 7, ac: 5, rc: 8, dmg: 72, hs: 17, bs: 12, h: 'over', air: 1, hit: [8, -6, 62, 50], push: 7, mg: 40 }),
      S: M({ name: 'Relay Knee', tier: 3, st: 10, ac: 4, rc: 21, dmg: 86, hs: 20, bs: 15, h: 'mid', kd: 2, lv: [2.8, 8.5], hit: [8, 68, 60, 124], push: 12, mg: 60, vel: [[3, 12, 7.5]], sc: 1 }),
      fS: M({ name: 'Spoke Drop', tier: 3, st: 18, ac: 4, rc: 14, dmg: 80, hs: 18, bs: 10, h: 'over', hit: [10, 36, 72, 104], push: 9, mg: 60, vel: [[2, 20, 4.2]], hop: [3, 21, 46], inv: [[3, 21, 'p']] }),
      bS: M({ name: 'Kickstand', tier: 3, st: 4, ac: 6, rc: 25, dmg: 100, hs: 22, bs: 18, h: 'mid', kd: 2, lv: [1.6, 10.5], hit: [4, 84, 52, 182], push: 6, mg: 60, inv: [[0, 7, 's']], hop: [4, 24, 60], sc: 1 }),
      jS: M({ name: 'Drop Off', tier: 3, st: 5, ac: 34, rc: 0, dmg: 62, hs: 16, bs: 9, h: 'over', air: 1, dive: [7.2, -8.5], landRec: 10, landRecHit: 5, hit: [6, -8, 48, 30], push: 7, mg: 50, chip: 0 }),
      EX: M({ name: 'Express Knee', tier: 3, st: 6, ac: 10, rc: 22, dmg: 56, hs: 20, bs: 14, h: 'mid', kd: 2, lv: [2.2, 11], jug: 0, hits: 2, gap: 6, hit: [8, 60, 64, 140], push: 4, mg: 0, cost: 500, vel: [[2, 16, 9]], inv: [[0, 9, 's']] }),
      SU: M({ name: 'Last Mile', tier: 4, st: 6, ac: 10, rc: 30, dmg: 60, hs: 30, bs: 18, h: 'mid', kd: 2, jug: 0, hit: [0, 40, 70, 150], push: 4, mg: 0, cost: 1000, vel: [[2, 16, 11]], inv: [[0, 12, 'a']],
        seq: { dur: 70, hits: [[8, 40], [16, 40], [24, 44], [32, 44], [42, 50], [56, 90]], hold: [[0, 52, 0], [40, 60, 0], [56, 56, 50]], rel: 56, lv: [3.5, 11] } }),
      TH: throwMove('Return to Sender', 110),
    },
  },
  ganji: {
    id: 'ganji', name: 'GANJI', full: 'Ganji Oshima', jp: '大島 岩治', color: '#ff5a1f', ink: '#140806',
    style: 'Grappler', bio: 'Twenty years on a Kabukicho door. One hydraulic arm, zero patience for queue-jumpers.',
    quote: ['Not on the list. Not tonight.', 'Doors close at two. You closed early.', 'Walk it off. Somewhere else.'],
    hp: 1220, power: 1.02, walkF: 2.9, walkB: 2.1, jumpV: 11.6, jumpX: 3.5, grav: 0.66, dashF: [22, 92], dashB: [24, 72], hw: 34, hh: 184, ch: 120, scale: 1.12, meterRate: 1.0,
    moves: {
      L5: M({ name: 'Palm Shove', st: 5, ac: 3, rc: 9, dmg: 40, hs: 14, bs: 9, h: 'high', hit: [28, 104, 86, 140], push: 8 }),
      H5: M({ name: 'Hammer Fist', tier: 2, st: 12, ac: 4, rc: 18, dmg: 108, hs: 21, bs: 14, h: 'mid', hit: [30, 84, 108, 160], push: 12, mg: 45 }),
      L2: M({ name: 'Shin Check', st: 6, ac: 3, rc: 10, dmg: 36, hs: 13, bs: 9, h: 'low', hit: [24, 0, 88, 30], push: 7 }),
      H2: M({ name: 'Rising Elbow', tier: 2, st: 8, ac: 4, rc: 21, dmg: 96, hs: 20, bs: 12, h: 'mid', kd: 2, lv: [1.4, 9], hit: [8, 96, 66, 214], push: 8, mg: 45, inv: [[3, 13, 'air']] }),
      Lj: M({ name: 'Air Elbow', st: 5, ac: 6, rc: 8, dmg: 50, hs: 15, bs: 10, h: 'over', air: 1, hit: [10, 40, 52, 92], push: 6 }),
      Hj: M({ name: 'Body Drop', tier: 2, st: 9, ac: 6, rc: 8, dmg: 96, hs: 18, bs: 13, h: 'over', air: 1, hit: [-12, -12, 64, 50], push: 8, mg: 45 }),
      S: M({ name: 'Last Call', tier: 3, st: 7, ac: 2, rc: 34, dmg: 170, h: 'throw', kd: 1, lv: [3.5, 7], hit: [16, 30, 86, 150], mg: 80,
        grab: { tech: false, dur: 50, rel: 40, hold: [[0, 46, 0], [18, 30, 130], [34, 40, 150], [40, 60, 0]] } }),
      fS: M({ name: 'Doorway Lariat', tier: 3, st: 15, ac: 6, rc: 20, dmg: 112, hs: 22, bs: 14, h: 'mid', kd: 1, hit: [10, 100, 96, 156], push: 14, mg: 60, vel: [[4, 20, 5.2]], armor: [[3, 20, 1]] }),
      bS: M({ name: 'Velvet Rope', tier: 3, st: 5, ac: 7, rc: 26, dmg: 150, h: 'throw', kd: 1, lv: [3, 6], hit: [0, 96, 86, 236], mg: 70, inv: [[0, 11, 'air']],
        grab: { tech: false, air: true, dur: 40, rel: 30, hold: [[0, 44, 120], [16, 40, 170], [30, 56, 0]] } }),
      dS: M({ name: 'Closing Stomp', tier: 3, st: 14, ac: 3, rc: 18, dmg: 72, bs: 14, h: 'low', kd: 1, hit: [0, 0, 158, 22], push: 10, mg: 60 }),
      EX: M({ name: 'Closing Time', tier: 3, st: 2, ac: 3, rc: 30, dmg: 270, h: 'throw', kd: 1, lv: [4, 8], hit: [8, 24, 112, 160], mg: 0, cost: 500, inv: [[0, 5, 's']],
        grab: { tech: false, dur: 56, rel: 46, hold: [[0, 46, 0], [20, 20, 150], [38, 46, 170], [46, 62, 0]] } }),
      SU: M({ name: 'Lights Out', tier: 4, st: 3, ac: 4, rc: 40, dmg: 390, h: 'throw', kd: 1, lv: [5, 9], hit: [0, 0, 126, 176], mg: 0, cost: 1000, inv: [[0, 8, 'a']],
        grab: { tech: false, dur: 84, rel: 72, hits: [[14, 60], [30, 70], [48, 80]], hold: [[0, 50, 0], [14, 50, 60], [30, 40, 180], [52, 20, 230], [72, 70, 0]] } }),
      TH: throwMove('Bouncer Toss', 130, { grab: { tech: true, dur: 40, rel: 30, hold: [[0, 40, 0], [16, 20, 80], [30, -60, 20]], back: 1 } }),
    },
  },
  suzu: {
    id: 'suzu', name: 'SUZU', full: 'Suzu Mizushiro', jp: '水城 鈴', color: '#00f0ff', ink: '#05111a',
    style: 'Zoner', bio: 'Freelance drone tech from Akihabara. Fights from across the street and bills by the hour.',
    quote: ['Invoice is in your inbox. Late fees apply.', 'You never got within ten metres. Noted.', 'Patch notes: you lose.'],
    hp: 900, power: 0.74, walkF: 3.0, walkB: 3.0, jumpV: 11.8, jumpX: 3.8, grav: 0.55, dashF: [18, 96], dashB: [20, 96], hw: 25, hh: 162, ch: 104, scale: 0.98, meterRate: 1.0,
    moves: {
      L5: M({ name: 'Wrist Taser', st: 4, ac: 2, rc: 8, dmg: 28, hs: 12, bs: 8, hit: [28, 108, 74, 136], push: 7 }),
      H5: M({ name: 'Coat Kick', tier: 2, st: 9, ac: 4, rc: 20, dmg: 64, hs: 18, bs: 12, h: 'mid', hit: [24, 58, 100, 108], push: 16, mg: 40 }),
      L2: M({ name: 'Ankle Zap', st: 5, ac: 2, rc: 9, dmg: 26, hs: 12, bs: 8, h: 'low', hit: [24, 0, 80, 26], push: 7 }),
      H2: M({ name: 'Long Sweep', tier: 2, st: 9, ac: 4, rc: 20, dmg: 66, bs: 12, h: 'low', kd: 1, hit: [24, 0, 114, 22], push: 10, mg: 40, cancel: false }),
      Lj: M({ name: 'Air Chop', st: 4, ac: 6, rc: 6, dmg: 38, hs: 14, bs: 10, h: 'over', air: 1, hit: [8, 50, 50, 92], push: 5 }),
      Hj: M({ name: 'Air Stamp', tier: 2, st: 8, ac: 5, rc: 8, dmg: 68, hs: 17, bs: 12, h: 'over', air: 1, hit: [0, -8, 52, 40], push: 7, mg: 40 }),
      S: M({ name: 'Moth Bolt', tier: 3, st: 13, ac: 1, rc: 30, dmg: 52, hs: 18, bs: 12, h: 'mid', push: 10, mg: 50, sc: 1,
        proj: { at: 13, x: 46, y: 72, vx: 6.4, vy: 0, life: 150, r: 13, kind: 'bolt', dmg: 52, hs: 18, bs: 12, h: 'mid', kd: 0, push: 10, chip: 0.1 } }),
      fS: M({ name: 'Skyline Lance', tier: 3, st: 10, ac: 1, rc: 24, dmg: 76, h: 'mid', mg: 50,
        proj: { at: 10, x: 30, y: 140, vx: 5.2, vy: 5.2, life: 70, r: 15, kind: 'lance', dmg: 76, hs: 20, bs: 10, h: 'mid', kd: 2, lv: [2, 8], push: 6, chip: 0.14 } }),
      dS: M({ name: 'Static Mine', tier: 3, st: 12, ac: 1, rc: 18, dmg: 84, h: 'low', mg: 40,
        proj: { at: 12, x: 96, y: 0, vx: 0, vy: 0, life: 260, r: 16, kind: 'mine', arm: 36, dmg: 74, hs: 20, bs: 14, h: 'low', kd: 2, lv: [1.5, 9], push: 6, chip: 0.14 } }),
      bS: M({ name: 'Arc Field', tier: 3, st: 5, ac: 6, rc: 27, dmg: 92, hs: 20, bs: 16, h: 'mid', kd: 2, lv: [3.2, 8], hit: [-56, 0, 66, 176], push: 10, mg: 60, inv: [[0, 6, 's']] }),
      EX: M({ name: 'Moth Volley', tier: 3, st: 9, ac: 1, rc: 22, dmg: 60, h: 'mid', mg: 0, cost: 500,
        proj: { at: 9, x: 46, y: 82, vx: 9.5, vy: 0, life: 110, r: 18, kind: 'volley', dmg: 60, hits: 2, gap: 5, hs: 22, bs: 14, h: 'mid', kd: 2, lv: [3, 8], push: 8, chip: 0.14, jug: 0 } }),
      SU: M({ name: 'Swarm Protocol', tier: 4, st: 10, ac: 34, rc: 26, dmg: 40, hs: 14, bs: 10, h: 'mid', kd: 2, lv: [3, 10], jug: 0, hits: 8, gap: 4, hit: [40, 82, 720, 140], push: 1.6, mg: 0, cost: 1000, inv: [[0, 12, 'a']] }),
      TH: throwMove('Overclock', 112),
    },
  },
  sayo: {
    id: 'sayo', name: 'SAYO', full: 'Sayo Kurose', jp: '黒瀬 小夜', color: '#ff2bd6', ink: '#14051a',
    style: 'Trickster', bio: 'Nobody sees Sayo arrive. Former stunt double who learned to fall through her own shadow.',
    quote: ['You were watching the wrong side.', 'Blink and it is over. You blinked.', 'The lanterns saw nothing. Neither did you.'],
    hp: 950, power: 1.08, walkF: 3.6, walkB: 3.2, jumpV: 13.0, jumpX: 4.8, grav: 0.62, dashF: [14, 112], dashB: [20, 104], hw: 24, hh: 162, ch: 98, scale: 1.0, meterRate: 1.05,
    moves: {
      L5: M({ name: 'Fan Hand', st: 4, ac: 2, rc: 7, dmg: 30, hs: 12, bs: 8, hit: [28, 106, 72, 134], push: 6 }),
      H5: M({ name: 'Crescent Kick', tier: 2, st: 9, ac: 4, rc: 15, dmg: 80, hs: 18, bs: 12, h: 'mid', hit: [14, 96, 92, 166], push: 10, mg: 40 }),
      L2: M({ name: 'Low Palm', st: 4, ac: 2, rc: 8, dmg: 24, hs: 12, bs: 8, h: 'low', hit: [28, 0, 78, 30], push: 6 }),
      H2: M({ name: 'Shadow Sweep', tier: 2, st: 8, ac: 3, rc: 20, dmg: 66, bs: 12, h: 'low', kd: 1, hit: [18, 0, 106, 24], push: 9, mg: 40, cancel: false }),
      Lj: M({ name: 'Flip Kick', st: 4, ac: 7, rc: 6, dmg: 38, hs: 14, bs: 10, h: 'over', air: 1, hit: [-24, 8, 42, 62], push: 5 }),
      Hj: M({ name: 'Axe Drop', tier: 2, st: 8, ac: 5, rc: 8, dmg: 72, hs: 17, bs: 12, h: 'over', air: 1, hit: [0, -10, 56, 46], push: 7, mg: 40 }),
      S: M({ name: 'Shade Step', tier: 3, st: 14, ac: 0, rc: 16, dmg: 0, mg: 20, inv: [[2, 16, 'a']], tp: { at: 12, dx: -72 } }),
      fS: M({ name: 'Moon Arc', tier: 3, st: 15, ac: 5, rc: 12, dmg: 84, hs: 18, bs: 10, h: 'over', hit: [0, 40, 74, 112], push: 8, mg: 60, vel: [[2, 20, 6]], hop: [2, 22, 70], inv: [[4, 18, 'low']] }),
      dS: M({ name: 'Low Shade', tier: 3, st: 8, ac: 10, rc: 14, dmg: 80, bs: 12, h: 'low', kd: 1, hit: [10, 0, 72, 30], push: 9, mg: 60, vel: [[4, 18, 8]], lp: [3, 20, 44], sc: 1 }),
      bS: M({ name: 'Mirror Veil', tier: 3, st: 2, ac: 0, rc: 22, dmg: 0, mg: 20, parry: [2, 24], follow: 'VS' }),
      VS: M({ name: 'Veil Strike', tier: 3, st: 5, ac: 4, rc: 16, dmg: 120, hs: 24, bs: 14, h: 'mid', kd: 2, lv: [3, 9], hit: [0, 20, 76, 170], push: 8, mg: 60, inv: [[0, 9, 'a']], hidden: 1 }),
      EX: M({ name: 'Shade Strike', tier: 3, st: 14, ac: 4, rc: 18, dmg: 120, hs: 24, bs: 14, h: 'mid', kd: 2, lv: [2.5, 10], jug: 0, hit: [4, 40, 74, 160], push: 8, mg: 0, cost: 500, inv: [[0, 14, 'a']], tp: { at: 10, dx: -64 } }),
      SU: M({ name: 'Black Lantern', tier: 4, st: 6, ac: 10, rc: 30, dmg: 60, hs: 30, bs: 18, h: 'mid', kd: 2, jug: 0, hit: [0, 30, 120, 170], push: 4, mg: 0, cost: 1000, vel: [[2, 16, 12]], inv: [[0, 14, 'a']],
        seq: { dur: 78, hits: [[10, 44], [20, 44], [30, 48], [40, 48], [50, 50], [66, 96]], hold: [[0, 56, 0], [50, 50, 20], [64, 40, 60]], rel: 66, lv: [4, 11], flick: 1 } }),
      TH: throwMove('Night Fold', 116, { grab: { tech: true, dur: 36, rel: 28, hold: [[0, 40, 0], [14, 0, 90], [28, -56, 10]], back: 1 } }),
    },
  },
};
export const ROSTER = ['rin', 'ganji', 'suzu', 'sayo'];

// Documented inputs for each move (used by the move list and test.mjs).
export const INPUT_OF = { L5: 'L', H5: 'H', L2: 'd+L', H2: 'd+H', Lj: 'air L', Hj: 'air H', S: 'S', fS: 'f+S', bS: 'b+S', dS: 'd+S', jS: 'air S', EX: 'S+H', SU: 'L+H+S', TH: 'L+H' };
export const MOVE_ORDER = ['L5', 'H5', 'L2', 'H2', 'Lj', 'Hj', 'TH', 'S', 'fS', 'dS', 'bS', 'jS', 'EX', 'SU'];

export function moveTotal(m) { return m.st + m.ac + m.rc; }
// Static frame advantage on block / hit, assuming contact on the first active frame.
export function advantage(m, onHit) {
  if (m.proj || m.grab || !m.ac) return null;
  const left = (m.ac - 1) + m.rc;
  if (onHit && m.kd) return null;
  return (onHit ? m.hs : m.bs) - left;
}
