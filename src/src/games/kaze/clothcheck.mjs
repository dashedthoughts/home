// Cloth checker (node): steps every ronin animation and every robed foe and boss animation frame by frame through
// the real pose code and the real figure drawing (on a recording no-op canvas), and asserts the garment rules on
// every frame. Usage: node clothcheck.mjs   (also run from test.mjs)
import { poseFor, drawFigure, newFig, walkLegs, POSE, lerpPose } from './figures.js';
import { checkGarment } from './cloth.js';
import { P as PT } from './sim.js';
import { ATK, BOSSES, FOES } from './data.js';

const noop = () => {};
const grad = { addColorStop: noop };
export const mockCtx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k.startsWith('create') ? () => grad : noop), set: (t, k, v) => { t[k] = v; return true; } });

const DT = 1 / 60;
function run(name, look, isPlayer, frames, fails, counts) {
  // frames: generator of { e, x, y, groundY, vx, face, dt, rest, walk }
  const fig = newFig(false, 7); let walk = 0, n = 0;
  for (const fr of frames) {
    const ex = { dt: DT, slash: PT.slash, heavy: PT.heavy, counter: PT.counter, hitDmg: fr.hitDmg || 1, rec: 1 };
    let pose = poseFor(fig, fr.e, look === 'ronin' ? 'ronin' : fr.kind || look, fr.t || 0, isPlayer, ex);
    pose = lerpPose(pose, pose, 0, {});
    if (fr.speed) { walk += fr.speed * DT; walkLegs(pose, walk, fr.speed, fr.e.st, fr.gait || look); }
    if (fr.mod) fr.mod(pose);
    fig.t = (fig.t || 0) + DT;
    drawFigure(mockCtx, fr.x, fr.y, look, pose, fig, { face: fr.face ?? 1, dt: DT, vx: fr.vx || 0, wind: fr.wind || 0, groundY: fr.groundY ?? fr.y, boilN: 0, reduced: !!fr.reduced });
    const b = checkGarment(fig.garment, { rest: fr.rest });
    n++; if (b.length) fails.push(`${name} f${n}: ${b[0]}${b.length > 1 ? ` (+${b.length - 1})` : ''}`);
  }
  counts.push([name, n]);
}
function* seq(st, dur, o = {}) { for (let t = 0; t < dur; t += DT) yield Object.assign({ e: Object.assign({ st, stt: t, face: 1, drawn: true }, o.e || {}), x: 0, y: 0 }, typeof o.f === 'function' ? o.f(t) : o); }
function* chain(...gs) { for (const g of gs) yield* g; }

export function runClothCheck(log = console.log) {
  const fails = [], counts = [];
  // ---- the ronin ----
  const R = (name, frames) => run(name, 'ronin', true, frames, fails, counts);
  R('idle', seq('idle', 2, { e: { drawn: false }, rest: true }));
  R('idle-drawn', seq('idle', 1.5));
  R('walk', (function* () { let x = 0; for (let t = 0; t < 2; t += DT) { x += 110 * DT; yield { e: { st: 'move', stt: t, face: 1, drawn: false }, x, y: 0, vx: 110, speed: 110 }; } })());
  R('run', (function* () { let x = 0; for (let t = 0; t < 2; t += DT) { x += 300 * DT; yield { e: { st: 'move', stt: t, face: 1, drawn: false }, x, y: 0, vx: 300, speed: 300 }; } })());
  R('run-start', (function* () { let x = 0, v = 0; for (let t = 0; t < 1; t += DT) { v += (300 - v) * Math.min(1, DT * 14); x += v * DT; yield { e: { st: v > 8 ? 'move' : 'idle', stt: t, face: 1, drawn: false }, x, y: 0, vx: v, speed: v > 8 ? Math.max(v, 210) : 0, mod: (p) => { const k = Math.max(0, 1 - t / 0.4); p.lean += 0.16 * k; p.hy += 4 * k; } }; } })());
  R('run-stop', (function* () { let x = 0, v = 300; for (let t = 0; t < 1.2; t += DT) { v += (0 - v) * Math.min(1, DT * 14); x += v * DT; const sk = t < 0.3 ? 1 - t / 0.3 : 0; yield { e: { st: v > 8 ? 'move' : 'idle', stt: t, face: 1, drawn: false }, x, y: 0, vx: v, speed: v > 8 ? v : 0, mod: (p) => { if (sk > 0) { p.ff = [p.ff[0] + (30 - p.ff[0]) * sk, p.ff[1] * (1 - sk)]; p.fb = [p.fb[0] + (-18 - p.fb[0]) * sk, p.fb[1]]; p.hy += 5 * sk; p.lean -= 0.12 * sk; } } }; } })());
  R('turn', (function* () { let x = 0, v = 200; for (let t = 0; t < 1.2; t += DT) { const face = t < 0.3 ? 1 : -1; v += (face * 200 - v) * Math.min(1, DT * 14); x += v * DT; yield { e: { st: 'move', stt: t, face, drawn: false }, x, y: 0, vx: v, face, speed: Math.abs(v) > 8 ? Math.abs(v) : 0 }; } })());
  R('jump-land', (function* () { let y = 0, vy = PT.jumpV || 560, x = 0; for (let t = 0; t < 1.4; t += DT) { const air = t > 0.05 && (y > 0 || t < 0.1); if (air) { vy -= (PT.grav || 1500) * DT; y = Math.max(0, y + vy * DT); } x += 150 * DT; yield { e: { st: y > 0 ? 'air' : 'idle', stt: t, face: 1 }, x, y: -y, groundY: 0, vx: 150 }; } })());
  R('jump-attack', (function* () { let y = 0, vy = PT.jumpV || 560; for (let t = 0; t < 1.2; t += DT) { vy -= (PT.grav || 1500) * DT; y = Math.max(0, y + vy * DT); yield { e: { st: t > 0.15 && t < 0.15 + 0.5 ? 'slash' : y > 0 ? 'air' : 'idle', stt: Math.max(0, t - 0.15), combo: 0, face: 1 }, x: 0, y: -y, groundY: 0, vx: 180 }; } })());
  R('dodge-fwd', seq('dodge', 0.6, { f: (t) => ({ vx: 600 * Math.max(0.15, (1 - t / 0.42) ** 2 + 0.1), x: t * 300 }), e: { dodgeDir: 1 } }));
  R('dodge-run', seq('dodge', 0.6, { f: (t) => ({ vx: 650 * Math.max(0.15, (1 - t / 0.42) ** 2 + 0.1), x: t * 330 }), e: { dodgeDir: 1, fromRun: true } }));
  R('dodge-back', seq('dodge', 0.6, { f: (t) => ({ vx: -600 * Math.max(0.15, (1 - t / 0.42) ** 2 + 0.1), x: -t * 300 }), e: { dodgeDir: -1 } }));
  R('guard', seq('guard', 0.8));
  R('parry', chain(seq('guard', 0.12), seq('idle', 0.4)));
  for (let c = 0; c < 3; c++) R('cut' + (c + 1), seq('slash', 0.9, { e: { combo: c }, f: (t) => ({ vx: t < 0.25 ? 70 : 0 }) }));
  R('heavy', seq('heavy', 1.3, { f: (t) => ({ vx: t > 0.3 && t < 0.6 ? 150 : 0 }) }));
  R('counter', seq('counter', 1.1, { f: (t) => ({ vx: t > 0.2 && t < 0.45 ? 520 : 0 }) }));
  R('hit-light', seq('hit', 0.5, { hitDmg: 1, f: (t) => ({ vx: -190 * Math.exp(-t * 6) }) }));
  R('hit-heavy', seq('hit', 0.5, { hitDmg: 2, f: (t) => ({ vx: -260 * Math.exp(-t * 6) }) }));
  R('death', seq('dead', 1.6));
  R('heal-kneel', chain(seq('heal', 1.0), seq('kneel', 1.6)));
  R('standoff-focus', seq('focus', 1.2));
  R('standoff-draw', seq('iai', 1.4, { f: (t) => ({ vx: t < 0.25 ? 900 : 0, x: Math.min(t, 0.25) * 900 }) }));
  R('bow-sit', chain(seq('bow', 1.3, { e: { drawn: false } }), seq('sit', 1.0, { e: { drawn: false } })));
  R('sheathe', (function* () { const K = [[0, POSE.guard], [0.16, POSE.flick], [0.36, POSE.flick], [1.0, POSE.sheathing], [1.2, POSE.stand]]; for (let k = 0; k < 1.3; k += DT) { yield { e: { st: 'idle', stt: k, face: 1 }, x: 0, y: 0, mod: (p) => { let j = 1; while (j < K.length - 1 && k > K[j][0]) j++; lerpPose(K[j - 1][1], K[j][1], Math.min(1, Math.max(0, (k - K[j - 1][0]) / (K[j][0] - K[j - 1][0]))), p); } }; } })());
  R('reduced-run', (function* () { let x = 0; for (let t = 0; t < 1; t += DT) { x += 300 * DT; yield { e: { st: 'move', stt: t, face: 1, drawn: false }, x, y: 0, vx: 300, speed: 300, reduced: true }; } })());
  R('gust', seq('idle', 1.5, { e: { drawn: false }, f: (t) => ({ wind: 3 * Math.sin(t * 3) }) }));
  // ---- foes and bosses: every move of every robed or hakama figure ----
  const cast = [['duelist', 'duelist', FOES.duelist.moves], ['bandit', 'bandit', FOES.bandit.moves], ['spear', 'spear', FOES.spear.moves], ['archer', 'archer', FOES.archer.moves], ['brute', 'brute', FOES.brute.moves]];
  for (const [id, b] of Object.entries(BOSSES)) { const look = { gonroku: 'gonroku', ono: 'ono', shizu: 'shizu', hyoe: 'hyoe', sotetsu: 'master' }[id]; cast.push([look, b.look === 'bandit' ? 'gonroku' : look, [...(b.p1 || []), ...(b.p2 || [])], id]); }
  for (const [look, kind, moves, boss] of cast) {
    const F = (name, frames) => run(look + ':' + name, look, false, frames, fails, counts);
    const K = { kind, boss };
    F('approach', (function* () { let x = 0; for (let t = 0; t < 1.5; t += DT) { x -= 100 * DT; yield { e: { st: 'approach', stt: t, ...K }, x, y: 0, vx: -100, face: -1, speed: 100, kind }; } })());
    F('ready', seq('ready', 0.8, { e: K, kind, face: -1 }));
    const seen = new Set();
    for (const [atk] of moves) { let a = atk; while (a && !seen.has(a)) { seen.add(a); const A = ATK[a], W = A.wind;
      F(a, chain(seq('wind', W, { e: { ...K, atk: a, windT: W }, kind, face: -1 }), seq('act', A.act, { e: { ...K, atk: a, windT: W }, kind, face: -1, f: () => ({ vx: A.dash ? -A.dash * 3 : 0 }) }), seq('rec', A.rec, { e: { ...K, atk: a, windT: W }, kind, face: -1 })));
      a = A.next; } }
    F('block', seq('block', 0.5, { e: K, kind, face: -1 }));
    F('stun', seq('stun', 0.5, { e: { ...K, stunT: 0.4 }, kind, face: -1 }));
    F('knockdown-getup', seq('stagger', 1.3, { e: { ...K, stunT: 1.25 }, kind, face: -1 }));
    F('opened', seq('opened', 1.3, { e: K, kind, face: -1 }));
    F('dead', seq('dead', 1.4, { e: K, kind, face: -1 }));
  }
  const total = counts.reduce((a, c) => a + c[1], 0);
  log(`cloth: ${counts.length} animations, ${total} frames checked, ${fails.length} failing frames`);
  if (fails.length) { const by = new Map(); for (const f of fails) { const k = f.split(' f')[0]; by.set(k, (by.get(k) || 0) + 1); } log('  failing: ' + [...by].map(([k, v]) => `${k}×${v}`).join(', ')); for (const f of fails.slice(0, 25)) log('  ' + f); }
  return { fails, total, anims: counts.length };
}
if (import.meta.url === `file://${process.argv[1]}`) { const r = runClothCheck(); process.exit(r.fails.length ? 1 : 0); }
