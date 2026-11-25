// KAZE flora: grass, susuki (pampas) and rice painted the way an ink painter would, as clumps rather than stamps.
// Each clump is painted once with the house brush into a cached sprite; along the path they are scattered in
// clusters with bare gaps, and they bend at the tips (a shear, root fixed) with the wind, gusts and passing bodies.
import { rng, fbm, makeCanvas, mix, stroke, INK } from './brush.js';
import { CHAPTERS } from './data.js';

const INKW = '#2a231d';

function sprite(w, h, ax, ay, sc, fn) { const c = makeCanvas(w * sc, h * sc), g = c.getContext('2d'); g.setTransform(sc, 0, 0, sc, ax * sc, ay * sc); fn(g); return { c, w, h, ax, ay }; }

// a clump: 3 to 9 blades of different lengths, curves and lean, thick at the root and tapering to a hair; one or two darker
function clump(g, R, h, col, sd) {
  const n = 3 + Math.floor(R() * 7), dark = 1 + Math.floor(R() * 2);
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) - 0.5 : 0, bx = u * (3 + n * 0.9) + (R() - 0.5) * 2, L = h * (0.4 + R() * 0.6);
    const lean = u * 0.9 + (R() - 0.5) * 0.5, curl = lean * (0.35 + R() * 0.5);
    const mx = bx + Math.sin(lean) * L * 0.5, my = -Math.cos(lean) * L * 0.5, ex = bx + Math.sin(lean + curl) * L, ey = -Math.cos(lean + curl) * L * 0.95;
    const acc = i % Math.max(2, Math.floor(n / dark)) === 0;
    stroke(g, [[bx, 0.5, 1], [mx, my, 0.75], [ex, ey, 0.08]], { w: (acc ? 1.9 : 1.25) + R() * 0.7, alpha: acc ? 0.95 : 0.62 + R() * 0.25, dry: 0.22, seed: sd + i, edge: 0.3, taper: [0, 0.9], tip: 0.04, color: acc ? INKW : col });
  }
}
// susuki: long soft blades arcing over and drooping, feathery heads of a few dry dabs hanging from the stems
function susuki(g, R, h, col, head, sd) {
  const n = 4 + Math.floor(R() * 4), dir = R() < 0.5 ? -1 : 1;
  for (let i = 0; i < n; i++) {
    const bx = (R() - 0.5) * 8, L = h * (0.55 + R() * 0.45), lean = dir * (0.25 + R() * 0.55) + (R() - 0.5) * 0.4;
    const p1 = [bx + Math.sin(lean) * L * 0.45, -L * 0.62], p2 = [bx + Math.sin(lean) * L * 0.95, -L * 0.82], p3 = [bx + Math.sin(lean) * L * 1.3, -L * 0.62];
    stroke(g, [[bx, 0.5, 1], [p1[0], p1[1], 0.7], [p2[0], p2[1], 0.35], [p3[0], p3[1], 0.04]], { w: 1.1 + R() * 0.6, alpha: 0.5 + R() * 0.3, dry: 0.3, seed: sd + i, edge: 0.2, taper: [0, 0.9], tip: 0.04, color: col });
  }
  const nh = 2 + Math.floor(R() * 3);
  for (let i = 0; i < nh; i++) {
    const bx = (R() - 0.5) * 6, L = h * (0.85 + R() * 0.3), lean = dir * (0.1 + R() * 0.3);
    const tx = bx + Math.sin(lean) * L, ty = -L;
    stroke(g, [[bx, 0.5, 0.8], [bx + Math.sin(lean) * L * 0.6, -L * 0.62, 0.5], [tx, ty, 0.2]], { w: 0.75, alpha: 0.55, dry: 0.35, seed: sd + 40 + i, edge: 0, taper: [0, 0.6], color: col });
    // the plume: a few dry, feathery drags hanging off the stem tip, drooping with the stem
    for (let k = 0; k < 4; k++) { const a = Math.PI / 2 + dir * (0.5 + k * 0.28) + (R() - 0.5) * 0.3, l = 6 + R() * 6; stroke(g, [[tx, ty, 0.9], [tx + Math.cos(a) * l * 0.5 + dir * 1.5, ty + Math.sin(a) * l * 0.5, 0.6], [tx + Math.cos(a) * l, ty + Math.sin(a) * l, 0.1]], { w: 2.6, alpha: 0.32, dry: 0.88, bristles: 6, seed: sd + 60 + i * 9 + k, edge: 0, taper: [0.1, 0.6], color: head }); }
  }
}

const cache = new Map();
export function floraFor(ch, k) {
  const sc = Math.min(4, Math.max(1.5, Math.round(k * 2 * 2) / 2)), key = ch + ':' + sc;
  let F = cache.get(key); if (F) return F;
  const C = CHAPTERS[ch], R = rng(4400 + ch * 17), col = mix(INKW, C.key === 'bamboo' ? '#56633f' : C.key === 'terraces' ? '#6a5a32' : '#5a4e40', 0.3);
  F = { clump: [], tall: [] };
  for (let i = 0; i < 12; i++) { const h = 9 + R() * 12, sd = 100 + i * 37; F.clump.push(sprite(48, h * 1.25 + 4, 24, h * 1.25, sc, (g) => clump(g, rng(sd + ch), h, col, sd))); }
  if (C.key === 'terraces') { const head = mix('#9a7440', INKW, 0.25); for (let i = 0; i < 5; i++) { const h = 30 + R() * 16, sd = 900 + i * 53; F.tall.push(sprite(110, h + 16, 55, h + 8, sc, (g) => susuki(g, rng(sd), h, col, head, sd))); } }
  else for (let i = 0; i < 5; i++) { const h = 18 + R() * 10, sd = 700 + i * 41; F.tall.push(sprite(60, h * 1.25 + 4, 30, h * 1.25, sc, (g) => clump(g, rng(sd + ch), h, col, sd))); }
  cache.clear(); cache.set(key, F); return F;
}

// the props: clusters along the path with bare gaps and denser patches, smaller and paler further back
export function floraProps(ch, grass, back) {
  const C = CHAPTERS[ch], key = C.key, L = C.len, R = rng(7100 + ch * 13);
  if (!(key === 'bamboo' || key === 'terraces' || key === 'castle')) return;
  const xEnd = key === 'castle' ? C.bridge[0] : L;
  for (let x = 0; x < xEnd;) {
    const d = fbm(x * 0.004, 31 + ch, 3);
    if (d < 0.42) { x += 40 + R() * 80; continue; } // a bare stretch
    const dense = (d - 0.42) / 0.3;
    grass.push({ kind: 'grass', x, f: 1, v: Math.floor(R() * 12), sc: 0.75 + R() * 0.5 + dense * 0.15, a: 0.8 + R() * 0.2, seed: R(), flex: 0.08, dy: 2 });
    x += (12 + R() * 34) / (0.6 + dense);
  }
  for (let x = 0; x < xEnd;) {
    const d = fbm(x * 0.003 + 9, 47 + ch, 3);
    if (d < 0.46) { x += 60 + R() * 120; continue; }
    back.push({ kind: 'grass', x, f: 0.97, tall: 1, v: Math.floor(R() * 5), sc: 0.7 + R() * 0.45, a: 0.5 + R() * 0.2, seed: R(), flex: 0.1, dy: key === 'terraces' ? -12 : -6 });
    x += 40 + R() * 110;
  }
}

// draw one clump: the root stays put and the blades bend at the tips (a horizontal shear)
export function drawGrass(g, pr, K, sx, sy, sway, F) {
  const S = (pr.tall ? F.tall : F.clump)[pr.v % (pr.tall ? F.tall.length : F.clump.length)]; if (!S) return;
  const A = K * (pr.sc || 1), bend = Math.max(-0.9, Math.min(0.9, sway * 1.6));
  g.setTransform(A, 0, -A * bend, A, sx, sy); g.globalAlpha = pr.a;
  g.drawImage(S.c, -S.ax, -S.ay, S.w, S.h);
}
