// Cyberpunk Tokyo around the real road. Everything here is driven by the C1 loop position (track/c1.js):
// each district has its own buildings, facades, light and signage; the road is a structure (viaduct parapets, sound
// barriers, the Ginza open cut, real-length tunnels with portals, piers down to the street). Real places and real road
// names; every shop and company name is invented (config.js TOKYO_SIGNS).
//
// Budget (default tier): ~14 draw calls for this layer. Everything is instanced or merged and recycled along the loop
// with a floating origin (like the props in world.js); update() allocates nothing.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as C1 from '../track/c1.js';
import { U, std, cityMaterial, blinkGlowMaterial, atlasMaterial, groundMaterial, structureMaterial, CITY, PROF } from './materials.js';
import { createAtlas, JP, fitText, roundRect, routeShield, SHUTO_GREEN } from './textures.js';
import { TOKYO_SIGNS, SLOGANS } from '../config.js';
import { mulberry } from '../sim.js';

const L = C1.LENGTH, STEP = C1.STEP, NS = Math.round(L / STEP);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const BEHIND = 30;      // recycle a building once it is this far behind the car (m)
const AHEAD = 680;      // fill the street walls this far ahead

// ---------------------------------------------------------------- district styles
// Facade kinds (materials.js cityMaterial): 0 glass curtain wall · 1 punched office · 2 pencil building · 3 tiled mid-rise ·
// 4 government stone · 5 residential · 6 brick. rows: frontage (the street wall the viaduct threads through), second row,
// skyline. R(x0 facade distance from the road centre, x jitter, depth, length along the road, gap, height, height power, kinds).
// left/right: 'palace' = moat, stone wall and trees (no buildings at all); 'park' = trees in the two near rows.
const R = (x0, xj, dep, len, gap, h, pow, kinds) => ({ x0, xj, dep, len, gap, h, pow, kinds });
export const STYLES = {
  towers: { rows: [R(12, 6, [18, 30], [26, 50], [4, 12], [22, 70], 1.2, { 0: 3, 1: 2 }), R(46, 20, [24, 40], [30, 60], [8, 20], [90, 205], 0.9, { 0: 4, 1: 1 }), R(110, 70, [30, 50], [40, 80], [20, 70], [120, 215], 1, { 0: 1 })],
    lit: 0.13, warm: 0.15, shop: 0.5, signs: 0.3, lamp: 'led', barrier: 0 },
  neon: { rows: [R(9.2, 1.5, [10, 18], [6, 13], [0, 1.5], [16, 46], 1.3, { 2: 6, 3: 2, 1: 1 }), R(27, 8, [14, 24], [12, 28], [1, 5], [24, 56], 1.2, { 1: 2, 3: 1, 0: 1, 2: 1 }), R(70, 40, [20, 40], [20, 50], [10, 40], [50, 140], 1, { 0: 1, 1: 2 })],
    lit: 0.42, warm: 0.6, shop: 1.2, signs: 1.0, lamp: 'sodium', barrier: 0 },
  office: { rows: [R(11, 5, [16, 28], [22, 46], [3, 10], [28, 95], 1.1, { 1: 3, 0: 2, 3: 1 }), R(45, 15, [22, 36], [28, 56], [6, 16], [70, 190], 1, { 0: 3, 1: 2 }), R(110, 60, [30, 50], [40, 70], [20, 60], [110, 200], 1, { 0: 2, 1: 1 })],
    lit: 0.16, warm: 0.2, shop: 0.35, signs: 0.25, lamp: 'led', barrier: 0 },
  river: { rows: [R(26, 4, [12, 22], [10, 24], [1, 5], [18, 52], 1.2, { 3: 3, 1: 2, 2: 1 }), R(55, 15, [18, 30], [20, 45], [4, 12], [30, 120], 1.1, { 1: 2, 0: 1, 3: 1 }), R(110, 60, [30, 50], [40, 70], [20, 60], [90, 190], 1, { 0: 1, 1: 1 })],
    lit: 0.26, warm: 0.45, shop: 0.6, signs: 0.55, lamp: 'sodium', barrier: 0, river: 1 },
  park: { rows: [R(14, 6, [16, 26], [24, 46], [4, 12], [25, 62], 1.1, { 1: 2, 0: 1 }), R(50, 20, [22, 34], [30, 56], [8, 20], [40, 110], 1, { 1: 2, 0: 1 }), R(120, 60, [30, 50], [40, 70], [20, 60], [60, 150], 1, { 0: 1, 1: 1 })],
    left: 'palace', lit: 0.15, warm: 0.25, shop: 0.2, signs: 0.1, lamp: 'led', barrier: 0, river: 1 },
  moat: { rows: [R(16, 6, [14, 24], [18, 36], [3, 10], [14, 44], 1.2, { 1: 2, 5: 1, 3: 1 }), R(55, 20, [18, 30], [24, 46], [6, 16], [28, 80], 1, { 1: 2, 5: 2 }), R(120, 60, [24, 40], [30, 60], [20, 60], [50, 120], 1, { 1: 1, 5: 1 })],
    left: 'palace', lit: 0.22, warm: 0.5, shop: 0.15, signs: 0.05, lamp: 'sodium', barrier: 0 },
  gov: { rows: [R(14, 6, [20, 34], [30, 60], [6, 14], [20, 46], 1.2, { 4: 4, 1: 1 }), R(50, 20, [24, 40], [30, 60], [8, 20], [30, 100], 1, { 4: 2, 1: 2, 0: 1 }), R(120, 60, [30, 50], [40, 70], [20, 60], [80, 180], 1, { 0: 2, 1: 1 })],
    lit: 0.42, warm: 0.08, shop: 0.1, signs: 0.05, lamp: 'led', barrier: 0 },
  hills: { rows: [R(12, 6, [14, 26], [18, 40], [3, 10], [18, 60], 1.2, { 1: 2, 5: 1, 0: 1 }), R(45, 20, [22, 36], [26, 50], [6, 18], [50, 165], 1, { 0: 2, 1: 1, 5: 1 }), R(110, 60, [30, 50], [40, 70], [20, 60], [120, 230], 1, { 0: 2, 5: 1 })],
    lit: 0.22, warm: 0.4, shop: 0.4, signs: 0.35, lamp: 'led', barrier: 2.2 },
  resid: { rows: [R(12, 5, [12, 22], [14, 30], [2, 8], [12, 42], 1.3, { 5: 3, 3: 2 }), R(40, 15, [16, 30], [20, 40], [4, 14], [30, 120], 1.1, { 5: 3, 1: 1 }), R(100, 60, [24, 40], [30, 60], [20, 60], [60, 160], 1, { 5: 2, 0: 1 })],
    lit: 0.3, warm: 0.85, shop: 0.25, signs: 0.12, lamp: 'led', barrier: 3.6 },
  tower: { rows: [R(22, 5, [14, 26], [18, 40], [3, 10], [20, 62], 1.2, { 1: 2, 5: 1, 3: 1 }), R(52, 20, [20, 34], [26, 50], [6, 18], [40, 130], 1, { 1: 2, 0: 1, 5: 1 }), R(120, 60, [30, 50], [40, 70], [20, 60], [80, 180], 1, { 0: 1, 1: 1 })],
    left: 'park', lit: 0.2, warm: 0.4, shop: 0.35, signs: 0.3, lamp: 'sodium', barrier: 0, river: 1 },
  bay: { rows: [R(24, 6, [16, 30], [20, 44], [4, 14], [14, 40], 1.2, { 3: 2, 1: 1 }), R(60, 25, [22, 36], [28, 56], [8, 20], [40, 150], 1, { 0: 2, 1: 1 }), R(130, 70, [30, 50], [40, 70], [30, 80], [80, 200], 1, { 0: 1 })],
    lit: 0.15, warm: 0.3, shop: 0.3, signs: 0.3, lamp: 'led', barrier: 0, river: 1, bayRight: 1 },
};
// per-district tweaks on top of the style. The Nihonbashi river runs under the C1 from Edobashi to Takebashi.
// leftCap keeps the low-rise around Shiba Park low on the left, so Tokyo Tower stands clear the way it does from the road.
const OVERRIDE = { miyakezaka: { left: 'palace' }, iikura: { river: 0, leftCap: 24 }, otemachi: { river: 1 }, shibakoen: { leftCap: 30 } };
const styleOf = (d) => { const st = STYLES[d.style] || STYLES.office; const o = OVERRIDE[d.id]; return o ? { ...st, ...o } : st; };
const DSTYLE = C1.DISTRICTS.map(styleOf);
export const lampKindAt = (s) => DSTYLE[C1.districtAt(s).index].lamp;

// Shuto branch routes at each JCT (route number, destination). From general knowledge of the network, not from the OSM data.
export const BRANCH = {
  '江戸橋JCT': [['1', '上野', 'Ueno'], ['6', '向島', 'Mukojima']], '竹橋JCT': [['5', '池袋', 'Ikebukuro']], '三宅坂JCT': [['4', '新宿', 'Shinjuku']],
  '谷町JCT': [['3', '渋谷', 'Shibuya']], '一ノ橋JCT': [['2', '目黒', 'Meguro']], '浜崎橋JCT': [['1', '羽田', 'Haneda'], ['11', '台場', 'Daiba']],
};
// the special ward each district lies in, for the boundary plates
const WARD = { shiodome: ['港区', 'Minato City'], ginza: ['中央区', 'Chuo City'], kyobashi: ['中央区', 'Chuo City'], nihonbashi: ['中央区', 'Chuo City'], otemachi: ['千代田区', 'Chiyoda City'],
  takebashi: ['千代田区', 'Chiyoda City'], kitanomaru: ['千代田区', 'Chiyoda City'], miyakezaka: ['千代田区', 'Chiyoda City'], kasumigaseki: ['千代田区', 'Chiyoda City'],
  tanimachi: ['港区', 'Minato City'], iikura: ['港区', 'Minato City'], shibakoen: ['港区', 'Minato City'], hamazakibashi: ['港区', 'Minato City'] };

// ---------------------------------------------------------------- per-10 m tables along the loop (built once)
const T_DECK = new Float32Array(NS), T_TUN = new Float32Array(NS), T_BAR = new Float32Array(NS), T_RIV = new Float32Array(NS);
const T_PAL = new Float32Array(NS), T_PARKR = new Float32Array(NS), T_RAIL = new Float32Array(NS), T_BAY = new Float32Array(NS), T_DIST = new Uint8Array(NS);
{
  // distance to the nearest tunnel (0 inside): within 90 m of a portal the road dips into a cut so the street can cover the tube
  const near = new Float32Array(NS).fill(1e9);
  for (const t of C1.tunnelSpans) for (let i = 0; i < NS; i++) {
    const s = i * STEP;
    const d = s >= t.from && s < t.to ? 0 : Math.min(C1.ahead(s, t.from), C1.ahead(t.to, s));
    if (d < near[i]) near[i] = d;
  }
  const r = mulberry(91);
  const blockBar = Array.from({ length: Math.ceil(NS / 30) + 1 }, () => r());
  for (let i = 0; i < NS; i++) {
    const s = i * STEP, d = C1.districtAt(s), st = DSTYLE[d.index];
    T_DIST[i] = d.index;
    const tf = smooth(Math.max(0, 1 - near[i] / 90));
    const e = C1.elevationAt(s), target = Math.min(e, -7.5);
    T_DECK[i] = e + (target - e) * tf;
    T_TUN[i] = C1.tunnelAt(s) ? 1 : 0;
    const onBridge = C1.bridgeAt(s) && !T_TUN[i] && tf === 0;
    T_BAR[i] = onBridge && st.barrier ? st.barrier * (blockBar[Math.floor(i / 30)] < (st.barrier > 3 ? 0.8 : 0.5) ? 1 : 0) : 0;
    T_RIV[i] = st.river && T_DECK[i] > 4 && !T_TUN[i] ? 1 : 0;
    T_PAL[i] = st.left === 'palace' ? 1 : 0;
    T_PARKR[i] = 0;
    T_BAY[i] = st.bayRight ? 1 : 0;
    // elevated railways beside the road (approximate stretches): JR lines at Shimbashi–Yurakucho, Kanda; the monorail at Hamazakibashi
    // the value is the side the line runs on (−1 left, +1 right); megacity.js createTrains uses the same stretches
    T_RAIL[i] = (s > 13150 || s < 700) ? -1 : (s > 4300 && s < 4900) || (s > 12880 && s < 13400) ? 1 : 0;
  }
  // soften the switches so the street, the water and the barriers never step inside a 4 m profile texel
  const blur = (T, rad) => { const c = Float32Array.from(T); for (let i = 0; i < NS; i++) { let a = 0; for (let k = -rad; k <= rad; k++) a += c[(i + k + NS) % NS]; T[i] = a / (2 * rad + 1); } };
  blur(T_DECK, 2); blur(T_RIV, 1); blur(T_PAL, 1); blur(T_BAY, 2);
}
const tab = (T, s) => { const f = C1.wrap(s) / STEP; const i = Math.floor(f) % NS, t = f - Math.floor(f); return T[i] + (T[(i + 1) % NS] - T[i]) * t; };
export const deckAt = (s) => tab(T_DECK, s);
const distAt = (s) => C1.DISTRICTS[T_DIST[Math.floor(C1.wrap(s) / STEP) % NS]];

// ---------------------------------------------------------------- sign atlases
const BLADE = [64, 256], STACK = [96, 384], BOARD = [240, 60], CROWN = [360, 72], ROOF = [288, 108], HOLO = [128, 384];
const NEON = ['#ff2a3a', '#ffd23a', '#2af0ff', '#ff3fd0', '#9dff3a', '#ff8a1a', '#ffffff', '#7a6bff'];
function cityAtlasEntries() {
  const E = [];
  const S = TOKYO_SIGNS;
  // blade signs (袖看板): five house styles (white + red, red + white, black + neon outline, yellow + black, blue + white)
  S.blades.forEach((word, i) => E.push({ id: 'blade' + i, w: BLADE[0], h: BLADE[1], draw(g, w, h) {
    const st = i % 5, ch = [...word.replace(/ /g, '')];
    const bg = ['#f4f0e6', '#c8141e', '#08070a', '#ffd400', '#1640a8'][st], fg = ['#c8141e', '#ffffff', NEON[i % NEON.length], '#111111', '#ffffff'][st];
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = st === 2 ? fg : 'rgba(0,0,0,.35)'; g.lineWidth = st === 2 ? 4 : 3; g.strokeRect(4, 4, w - 8, h - 8);
    const step = Math.min(w * 0.86, (h - 20) / ch.length);
    g.font = `${i % 3 === 0 ? 700 : 900} ${Math.round(step * 0.84)}px ${JP}`;
    g.fillStyle = fg;
    if (st === 2) { g.shadowColor = fg; g.shadowBlur = 8; }
    ch.forEach((c, k) => g.fillText(c, w / 2, 10 + step * (k + 0.5) + (h - 20 - step * ch.length) / 2));
    g.shadowBlur = 0;
  } }));
  // tenant directory stacks: one board per floor, mixed styles
  for (let v = 0; v < 8; v++) E.push({ id: 'stack' + v, w: STACK[0], h: STACK[1], draw(g, w, h) {
    g.fillStyle = '#16141a'; g.fillRect(0, 0, w, h);
    const n = 8, bh = h / n;
    for (let k = 0; k < n; k++) {
      const name = S.floors[(v * 5 + k * 3) % S.floors.length], fl = k === n - 1 ? 'B1' : `${n - k}F`;
      const st = (v + k * 2) % 4;
      g.fillStyle = ['#f8f4ea', NEON[(v + k) % NEON.length], '#0c0b10', '#ffe9a8'][st]; g.fillRect(3, k * bh + 3, w - 6, bh - 6);
      g.fillStyle = st === 2 ? NEON[(v * 3 + k) % NEON.length] : '#14121a';
      g.font = `700 ${Math.round(bh * 0.24)}px Rajdhani, sans-serif`; g.textAlign = 'left'; g.fillText(fl, 7, k * bh + bh * 0.28);
      g.textAlign = 'center'; fitText(g, name, w / 2 + 6, k * bh + bh * 0.6, w - 20, Math.round(bh * 0.42), 900);
    }
  } });
  // facade boards
  S.boards.forEach(([name, sub], i) => E.push({ id: 'board' + i, w: BOARD[0], h: BOARD[1], draw(g, w, h) {
    const st = i % 4;
    const bg = ['#0b0a10', '#f6f2e8', '#c8141e', '#103a8a'][st], fg = [NEON[i % NEON.length], '#d0101e', '#ffffff', '#ffe36b'][st];
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; if (st === 0) { g.shadowColor = fg; g.shadowBlur = 6; }
    fitText(g, name, w * 0.5, h * 0.42, w - 20, Math.round(h * 0.56), 900);
    g.shadowBlur = 0;
    g.globalAlpha = 0.85; g.font = `500 ${Math.round(h * 0.2)}px ${JP}`; g.fillText(sub, w * 0.5, h * 0.83); g.globalAlpha = 1;
  } }));
  // lit company names on office crowns (invented)
  S.crowns.forEach(([jp, en], i) => E.push({ id: 'crown' + i, w: CROWN[0], h: CROWN[1], draw(g, w, h) {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.fillStyle = ['#e8f2ff', '#ffffff', '#bfe9ff'][i % 3];
    fitText(g, jp, w * 0.36, h * 0.52, w * 0.62, Math.round(h * 0.72), 700);
    g.font = `700 ${Math.round(h * 0.42)}px Rajdhani, sans-serif`; g.fillText(en, w * 0.83, h * 0.54);
  } }));
  const roofs = [...SLOGANS.map((t) => [t, null]), ...S.roofs];
  roofs.forEach(([a, b], i) => E.push({ id: 'roof' + i, w: ROOF[0], h: ROOF[1], draw(g, w, h) {
    const c = NEON[(i * 3) % NEON.length];
    g.fillStyle = '#050407'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.035)'; for (let y = 2; y < h; y += 5) for (let x = 2; x < w; x += 5) g.fillRect(x, y, 2, 2);  // LED pitch
    g.strokeStyle = c; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 5;
    if (b) { fitText(g, a, w / 2, h * 0.42, w - 32, 50, 900); g.shadowBlur = 0; g.font = '600 18px Rajdhani, sans-serif'; g.globalAlpha = 0.8; g.fillText(b, w / 2, h * 0.78); g.globalAlpha = 1; }
    else fitText(g, a, w / 2, h * 0.52, w - 32, 56, 700, i % 2 ? 'Rajdhani, sans-serif' : '"Chakra Petch", Rajdhani, sans-serif');
    g.shadowBlur = 0;
  } }));
  S.holos.forEach((t, i) => E.push({ id: 'holo' + i, w: HOLO[0], h: HOLO[1], draw(g, w, h) {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const ch = [...t];
    g.fillStyle = '#ffffff'; g.shadowColor = '#bff'; g.shadowBlur = 12;
    const step = Math.min(w * 0.9, (h - 20) / ch.length);
    g.font = `900 ${Math.round(step * 0.86)}px ${JP}`;
    ch.forEach((c, k) => g.fillText(c, w / 2, 10 + step * (k + 0.5) + (h - 20 - step * ch.length) / 2));
    g.shadowBlur = 0; g.globalAlpha = 0.6; g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); g.globalAlpha = 1;
  } }));
  return { E, nRoof: roofs.length };
}
function roadAtlasEntries() {
  const E = [];
  // kilometre posts (キロポスト): small green plates every 100 m, the distance from the start of the route
  for (let k = 0; k <= Math.floor(L / 100); k++) E.push({ id: 'kp' + k, w: 40, h: 24, draw(g, w, h) {
    g.fillStyle = SHUTO_GREEN; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4);
    g.fillStyle = '#fff'; g.font = '700 17px Rajdhani, sans-serif'; g.fillText((k / 10).toFixed(1), w / 2, h / 2 + 1);
  } });
  const exits = new Map();
  for (const j of C1.JUNCTIONS) if (j.kind === 'exit') exits.set(j.jp + j.ref, j);
  for (const [key, j] of exits) E.push({ id: 'exit:' + key, w: 176, h: 92, draw(g, w, h) {
    g.fillStyle = SHUTO_GREEN; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 3; roundRect(g, 4, 4, w - 8, h - 8, 6); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(10, 10, 50, 27); g.fillStyle = SHUTO_GREEN; g.font = `900 19px ${JP}`; g.fillText('出口', 35, 24);
    g.fillStyle = '#fff'; g.font = '700 14px Rajdhani, sans-serif'; g.fillText('EXIT', 35, 48);
    if (j.ref) { g.font = '700 17px Rajdhani, sans-serif'; g.fillText(j.ref, 35, 70); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(21, 59, 28, 22); }
    g.textAlign = 'left'; fitText(g, j.jp, 70, 35, w - 78, 38, 900);
    g.font = '600 18px Rajdhani, sans-serif'; g.fillText(j.name, 71, 71);
  } });
  E.push({ id: 'speed', w: 80, h: 80, draw(g, w, h) {
    g.clearRect(0, 0, w, h); g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fillStyle = '#d8101c'; g.fill();
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
    g.fillStyle = '#1340a0'; g.font = '700 40px Rajdhani, "Chakra Petch", sans-serif'; g.fillText('50', w / 2, h / 2 + 3);
  } });
  E.push({ id: 'c1', w: 176, h: 88, draw(g, w, h) {
    g.fillStyle = SHUTO_GREEN; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 3; roundRect(g, 4, 4, w - 8, h - 8, 6); g.stroke();
    routeShield(g, 11, 14, 42, 'C1', true);
    g.fillStyle = '#fff'; g.textAlign = 'left'; fitText(g, '都心環状線', 70, 36, 96, 28, 900);
    g.font = '600 15px Rajdhani, sans-serif'; g.fillText('Inner Circular Rt', 70, 68);
  } });
  for (const [jp, en] of new Map(Object.values(WARD).map((v) => [v[0], v]))) E.push({ id: 'ward:' + jp, w: 176, h: 66, draw(g, w, h) {
    g.fillStyle = '#1846a8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#fff'; fitText(g, jp, w / 2, h * 0.4, w - 24, 30, 900); g.font = '600 15px Rajdhani, sans-serif'; g.fillText(en[1], w / 2, h * 0.8);
  } });
  for (const dir of [1, -1]) E.push({ id: dir > 0 ? 'chev-r' : 'chev-l', w: 48, h: 60, draw(g, w, h) {
    g.fillStyle = '#ffd200'; g.fillRect(0, 0, w, h); g.fillStyle = '#111';
    g.save(); g.translate(w / 2, h / 2); g.scale(dir * 0.72, 0.72);
    for (const o of [-14, 10]) { g.beginPath(); g.moveTo(o - 10, -26); g.lineTo(o + 10, 0); g.lineTo(o - 10, 26); g.lineTo(o - 22, 26); g.lineTo(o - 2, 0); g.lineTo(o - 22, -26); g.closePath(); g.fill(); }
    g.restore();
  } });
  for (const t of C1.tunnelSpans) if (t.name) E.push({ id: 'tun:' + t.name, w: 320, h: 84, draw(g, w, h) {
    g.fillStyle = '#e9e5da'; g.fillRect(0, 0, w, h); g.strokeStyle = '#333'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#16151a'; fitText(g, t.jp, w / 2, h * 0.4, w - 30, 44, 900);
    g.font = '700 18px Rajdhani, sans-serif'; g.fillText(`${t.name.toUpperCase()}   ${t.length.toLocaleString('en')} m`, w / 2, h * 0.8);
  } });
  // emergency telephone sign (非常電話) for the tunnel walls
  E.push({ id: 'sos', w: 64, h: 40, draw(g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d0101c'; g.fillRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#fff'; fitText(g, '非常電話', w / 2, h * 0.42, w - 10, 15, 900); g.font = '700 10px Rajdhani, sans-serif'; g.fillText('SOS', w / 2, h * 0.8);
  } });
  return E;
}

// road furniture along the loop (computed once): { s, id, x, y, w, h, post, gain, mode }
function roadFurniture() {
  const F = [];
  const add = (s, id, x, y, w, h, post = false, gain = 1, mode = 0) => F.push({ s: C1.wrap(s), id, x, y, w, h, post, gain, mode });
  // kilometre posts on the left parapet top (on the wall inside tunnels)
  for (let k = 0; k <= Math.floor(L / 100); k++) { const s = k * 100; C1.tunnelAt(s) ? add(s, 'kp' + k, -7.0, 1.5, 0.66, 0.4) : add(s, 'kp' + k, -6.5, 1.36, 0.66, 0.4); }
  // exits: an advance sign 400 m before and one at the gore, on the left (exits leave to the left in Japan)
  for (const j of C1.JUNCTIONS) if (j.kind === 'exit') for (const d of [400, 40]) {
    const s = j.s - d, key = 'exit:' + j.jp + j.ref;
    if (C1.tunnelAt(s)) add(s, key, -4.6, 5.0, 3.4, 1.78); else add(s, key, -7.6, 4.6, 3.8, 1.98, true);
  }
  // speed limit every ~1.5 km, the C1 route marker after every JCT, ward boundary plates
  for (let s = 600; s < L; s += 1500) if (!C1.tunnelAt(s)) add(s, 'speed', -7.4, 3.2, 1.0, 1.0, true);
  for (const e of C1.JCT_EVENTS) { const s = e.nodes[e.nodes.length - 1] + 420; if (!C1.tunnelAt(s)) add(s, 'c1', -7.6, 3.4, 2.4, 1.2, true); }
  for (let i = 0; i < C1.DISTRICTS.length; i++) {
    const a = C1.DISTRICTS[i], b = C1.DISTRICTS[(i + 1) % C1.DISTRICTS.length];
    if (WARD[a.id][0] !== WARD[b.id][0] && !C1.tunnelAt(b.from)) add(b.from, 'ward:' + WARD[b.id][0], -7.5, 3.0, 2.2, 0.82, true);
  }
  // chevrons on the outside of the tight bends (radius under 140 m), every 14 m
  for (let s = 0; s < L; s += 14) {
    const k = C1.realCurvAt(s);
    if (Math.abs(k) > 1 / 140 && !C1.tunnelAt(s)) add(s, k > 0 ? 'chev-r' : 'chev-l', k > 0 ? -6.58 : 6.58, 1.5, 0.62, 0.78, false, 1.1);
  }
  // emergency phones every 200 m in the tunnels
  for (const t of C1.tunnelSpans) for (let s = t.from + 100; s < t.to - 20; s += 200) add(s, 'sos', -7.1, 2.6, 0.8, 0.5, false, 1.2);
  // the tunnel name plate over each named portal
  for (const t of C1.tunnelSpans) if (t.name) add(t.from - 6.2, 'tun:' + t.name, 0, 8.25, 5.4, 1.42, false, 0.9);
  F.sort((a, b) => a.s - b.s);
  return F;
}

// ---------------------------------------------------------------- geometry helpers
function tieredBox() {
  const parts = [0, 1, 2].map((t) => {
    const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    g.setAttribute('aTid', new THREE.Float32BufferAttribute(new Array(g.attributes.position.count).fill(t), 1));
    return g;
  });
  return mergeGeometries(parts, false);
}
// The road structure as one strip mesh from z = +NEAR to the end of the profile. Cross-section segments per side:
// [x0, y0, x1, y1, part, modeA, modeB, mirror]. Modes: 0 fixed · 1 barrier top · 2 trench top · 3 street-relative.
function structureGeometry() {
  const SEG = [
    [6.1, 0.004, 6.4, 0.004, 0, 0, 0, 1],          // shoulder
    [6.4, 0, 6.4, 1.05, 1, 0, 0, 1],               // parapet, road face
    [6.4, 1.05, 6.75, 1.05, 2, 0, 0, 1],           // parapet top
    [6.75, 1.05, 6.75, -2.0, 3, 0, 0, 1],          // deck edge (girder face)
    [6.75, -2.0, 0, -2.0, 3, 0, 0, 1],             // deck underside
    [6.6, 1.05, 6.6, 1.05, 5, 0, 1, 1],            // sound barrier (top rises with the profile)
    [7.2, 0, 7.2, 0, 6, 0, 2, 1],                  // retaining wall of the cut (top rises to street level)
    [6.75, 0.004, 7.2, 0.004, 7, 0, 0, 1],         // floor of the cut beyond the parapet
    [7.2, 0.03, 8.3, 0.03, 7, 2, 2, 1],            // coping at the top of the cut
    [7.2, 0, 7.2, 7.0, 8, 0, 0, 1],                // tunnel wall
    [7.14, 5.7, 7.14, 6.1, 9, 0, 0, 1],            // tunnel lamp row
    [-7.2, 7.0, 7.2, 7.0, 10, 0, 0, 0],            // tunnel ceiling
    [-34.5, -2.5, -34.5, 8.0, 11, 3, 3, 0],        // Edo castle stone wall above the moat (left, palace side)
  ];
  const n = PROF.N, z0 = PROF.NEAR, dz = PROF.STEP;
  const pos = [], nor = [], part = [], mode = [], idx = [];
  for (const [x0, y0, x1, y1, p, ma, mb, mir] of SEG) for (const side of mir ? [1, -1] : [1]) {
    const ax = x0 * side, bx = x1 * side;
    let nx = -(y1 - y0), ny = (x1 - x0) * side; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const v0 = pos.length / 3;
    for (let i = 0; i <= n; i++) {
      const z = z0 - i * dz;
      pos.push(ax, y0, z, bx, y1, z); nor.push(nx, ny, 0, nx, ny, 0); part.push(p, p); mode.push(ma, mb);
      if (i < n) { const a = v0 + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(part, 1));
  g.setAttribute('aMode', new THREE.Float32BufferAttribute(mode, 1));
  g.setIndex(idx);
  return g;
}
// street level: a strip with columns at every edge the shader moves (cut, river walls, moat, castle bank, bay)
function groundGeometry() {
  const xs = [-340, -150, -70, -36, -34.6, -34.4, -24.6, -24.2, -14.2, -13.8, -8.3, -7.25, -7.15, 7.15, 7.25, 8.3, 13.8, 14.2, 24.2, 24.6, 34.4, 34.6, 60, 60.4, 150, 340];
  const n = PROF.N, z0 = PROF.NEAR, dz = PROF.STEP;
  const pos = [], idx = [], W = xs.length;
  for (let i = 0; i <= n; i++) for (const x of xs) pos.push(x, 0, z0 - i * dz);
  for (let i = 0; i < n; i++) for (let k = 0; k < W - 1; k++) { const a = i * W + k, b = a + W; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// ---------------------------------------------------------------- the city
export function createTokyo(scene, { seed = 2066 } = {}) {
  const rnd = mulberry(seed);
  const group = new THREE.Group();          // recycled props (floating origin)
  scene.add(group);
  let base = 0, lastZ = -1e9, startS = -1, dirtyAll = true;

  // profile texture: what lies under and around every 4 m of road ahead (see materials.js PROF)
  const prof = new Uint8Array(PROF.N * 2 * 4);
  const profTex = new THREE.DataTexture(prof, PROF.N, 2, THREE.RGBAFormat);
  profTex.magFilter = profTex.minFilter = THREE.LinearFilter;
  profTex.needsUpdate = true;
  CITY.uProf.value = profTex;
  const b8 = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  function writeProf(s0) {
    for (let i = 0; i < PROF.N; i++) {
      const s = s0 - PROF.NEAR + (i + 0.5) * PROF.STEP, o = i * 4, o1 = (PROF.N + i) * 4;
      prof[o] = b8((tab(T_DECK, s) + 24) / 64); prof[o + 1] = b8(tab(T_TUN, s)); prof[o + 2] = b8(tab(T_BAR, s) / 8); prof[o + 3] = b8(tab(T_RIV, s));
      prof[o1] = b8(tab(T_PAL, s)); prof[o1 + 1] = b8(tab(T_PARKR, s)); prof[o1 + 2] = b8(Math.abs(tab(T_RAIL, s))); prof[o1 + 3] = b8(tab(T_BAY, s));
    }
    profTex.needsUpdate = true;
  }

  // ground and structure (static strips; the profile scrolls through them)
  const ground = new THREE.Mesh(groundGeometry(), groundMaterial());
  ground.frustumCulled = false;
  ground.renderOrder = -1;
  const structMat = structureMaterial();
  structMat.side = THREE.DoubleSide;
  const structure = new THREE.Mesh(structureGeometry(), structMat);
  structure.frustumCulled = false;
  scene.add(ground, structure);

  // piers under the viaduct, every 30 m (periodic like the lamps; scaled to the deck height at each)
  const PIER_GAP = 30, pierN = Math.ceil(AHEAD / PIER_GAP) + 2;
  const pierMat = std({ color: '#5c5a58', roughness: 0.9, metalness: 0.05 });
  const piers = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 1, 2.2).translate(0, 0.5, 0), pierMat, pierN);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(12.2, 1.4, 2.6).translate(0, -0.7, 0), pierMat, pierN);  // crosshead under the deck
  piers.frustumCulled = heads.frustumCulled = false;
  scene.add(piers, heads);

  // portals: a concrete headwall over each end of the current/next tunnel
  const portalMat = std({ color: '#6a6660', roughness: 0.9, metalness: 0.05 });
  const portalGeo = mergeGeometries([new THREE.BoxGeometry(24, 3.6, 2.2).translate(0, 8.8, 0), new THREE.BoxGeometry(5, 7.2, 2.2).translate(-9.7, 3.6, 0), new THREE.BoxGeometry(5, 7.2, 2.2).translate(9.7, 3.6, 0)], false);
  const portals = [0, 1].map(() => { const m = new THREE.Mesh(portalGeo, portalMat); m.frustumCulled = false; m.visible = false; scene.add(m); return m; });

  // buildings: pools per side × row, each a ring in road order
  const ROWS = [64, 26, 12];
  const NB = 2 * ROWS.reduce((a, b) => a + b, 0);
  const bGeo = tieredBox();
  const aSeed = new Float32Array(NB), aTier = new Float32Array(NB * 4), aKind = new Float32Array(NB * 4);
  bGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
  bGeo.setAttribute('aTier', new THREE.InstancedBufferAttribute(aTier, 4));
  bGeo.setAttribute('aKind', new THREE.InstancedBufferAttribute(aKind, 4));
  const bMat = cityMaterial();
  const bMesh = new THREE.InstancedMesh(bGeo, bMat, NB);
  bMesh.frustumCulled = false;
  group.add(bMesh);
  const B = [], pools = [];
  for (const side of [-1, 1]) ROWS.forEach((n, row) => {
    const pool = { side, row, idx: [], head: 0, cursor: 0 };
    for (let k = 0; k < n; k++) { pool.idx.push(B.length); B.push({ thin: row === 1 && k % 2 === 1, side, row, z: 0, len: 10, gap: 0, x: 0, dep: 10, h: 0, base: 0, kind: 1, seed: 0, tier: [1, 1, 0, 0], sign: [-1, -1, -1], holo: -1, helipad: false }); }
    pools.push(pool);
  });

  // signs on buildings (one atlas, three slots per building), holograms (one slot), rooftop plant (three), aviation lights (two)
  const { E: cityE, nRoof } = cityAtlasEntries();
  const atlas = createAtlas(cityE, 2048);
  const signGeo = new THREE.PlaneGeometry(1, 1);
  const mkAtlasMesh = (geo, mat, n) => {
    const g = geo.clone();
    const r = new Float32Array(n * 4), a = new Float32Array(n * 4);
    g.setAttribute('aRect', new THREE.InstancedBufferAttribute(r, 4));
    g.setAttribute('aAnim', new THREE.InstancedBufferAttribute(a, 4));
    const m = new THREE.InstancedMesh(g, mat, n);
    m.frustumCulled = false;
    for (let i = 0; i < n; i++) m.setMatrixAt(i, ZERO);
    return { m, r, a };
  };
  const signs = mkAtlasMesh(signGeo, atlasMaterial(atlas.texture), NB * 3);
  const holos = mkAtlasMesh(signGeo, atlasMaterial(atlas.texture, { holo: true }), NB);
  group.add(signs.m, holos.m);
  const plant = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), std({ color: '#2a2a30', roughness: 0.8, metalness: 0.3 }), NB * 3);
  plant.frustumCulled = false;
  group.add(plant);
  const beaconGeo = new THREE.PlaneGeometry(1, 1);
  const aBlink = new Float32Array(NB * 2 * 4);
  beaconGeo.setAttribute('aBlink', new THREE.InstancedBufferAttribute(aBlink, 4));
  const beacons = new THREE.InstancedMesh(beaconGeo, blinkGlowMaterial({ gain: 2.2, fog: true, bent: true }), NB * 2);
  beacons.frustumCulled = false;
  for (let i = 0; i < NB * 2; i++) { beacons.setColorAt(i, new THREE.Color('#ff1a24')); beacons.setMatrixAt(i, ZERO); }
  group.add(beacons);

  // trees: palace grounds, parks
  const TREE_N = 90;
  const treeGeo = new THREE.IcosahedronGeometry(1, 1);
  const trees = new THREE.InstancedMesh(treeGeo, std({ color: '#0e1a12', roughness: 1, metalness: 0, emissive: '#06100a', emissiveIntensity: 0.6 }), TREE_N * 2);
  trees.frustumCulled = false;
  group.add(trees);
  const TR = [], treePools = [];
  for (const side of [-1, 1]) {
    const pool = { side, idx: [], head: 0, cursor: 0 };
    for (let k = 0; k < TREE_N; k++) { pool.idx.push(TR.length); TR.push({ side, z: 0, step: 8, x: 0, y: 0, r: 0 }); }
    treePools.push(pool);
  }

  // road furniture (kilometre posts, exit signs, chevrons, speed limits, ward plates, tunnel plates) from a second atlas
  const roadAtlas = createAtlas(roadAtlasEntries(), 1024);
  const FURN = roadFurniture();
  const FMAX = 72;
  const furn = mkAtlasMesh(signGeo, atlasMaterial(roadAtlas.texture), FMAX);
  for (const f of FURN) f.rect = roadAtlas.rect(f.id);
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 1, 0.2).translate(0, 0.5, 0), std({ color: '#3a3c40', roughness: 0.5, metalness: 0.6 }), FMAX);
  posts.frustumCulled = false;
  scene.add(furn.m, posts);

  if (document.fonts?.ready) Promise.all([document.fonts.load('900 40px "Noto Sans JP"', '高速出口都心環状線'), document.fonts.load('700 40px Rajdhani'), document.fonts.load('700 40px "Chakra Petch"')])
    .catch(() => {}).then(() => { atlas.redraw(); roadAtlas.redraw(); });

  // ---------------------------------------------------------------- placement
  const M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), Sc = new THREE.Vector3(), Q0 = new THREE.Quaternion();
  const QY = [new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)];
  const QR = [new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.55), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.55)];
  let quality = { buildings: 1, extras: true };
  let sOfZ = (z) => z;
  const pickKind = (w) => { let t = 0; for (const k in w) t += w[k]; let r = rnd() * t; for (const k in w) { r -= w[k]; if (r <= 0) return +k; } return 1; };

  function rollB(b, z) {
    const s = sOfZ(z), d = distAt(s), st = DSTYLE[d.index], Rw = st.rows[b.row], side = b.side;
    b.z = z;
    b.sign[0] = b.sign[1] = b.sign[2] = -1; b.holo = -1;
    const repl = side < 0 ? st.left : st.right;
    if (repl === 'palace' || (repl === 'park' && b.row < 2) || (side > 0 && st.bayRight && b.row > 0) || (b.thin && quality.buildings < 1)) { b.h = 0; b.len = 16 + rnd() * 10; b.gap = 0; return; }
    b.len = lerp(Rw.len[0], Rw.len[1], rnd());
    b.gap = lerp(Rw.gap[0], Rw.gap[1], rnd());
    b.dep = lerp(Rw.dep[0], Rw.dep[1], rnd());
    b.h = lerp(Rw.h[0], Rw.h[1], Math.pow(rnd(), Rw.pow));
    if (side < 0 && st.leftCap) b.h = Math.min(b.h, st.leftCap + rnd() * 6);
    const sm = s + b.len / 2, deck = tab(T_DECK, sm);
    let x0 = Rw.x0 + rnd() * Rw.xj;
    if (b.row === 0 && tab(T_RIV, sm) > 0.1) x0 = Math.max(x0, 25.2);           // the river runs under the road: set back past its walls
    if (b.row === 0 && deck < -0.3) x0 = Math.max(x0, 8.6);                    // the edge of the cut
    if (b.row === 0 && tab(T_BAY, sm) > 0.1 && side > 0) x0 = Math.max(x0, 26);
    // an elevated railway runs beside the road here: keep its corridor clear so the trains can be seen
    if (T_RAIL[Math.floor(C1.wrap(sm) / STEP) % NS] === side) x0 = Math.max(x0, b.row === 0 ? 50 : 70);
    b.x = side * (x0 + b.dep / 2);
    b.base = -deck;
    b.kind = pickKind(Rw.kinds);
    b.seed = rnd();
    // tiers: towers get a podium, a shaft and a set-back crown; low buildings are plain boxes
    const tall = b.h > 55 && (b.kind < 2 || b.kind === 4 || b.kind === 5);
    if (tall) b.tier = [Math.min(0.4, (10 + rnd() * 14) / b.h), 1 - (0.04 + rnd() * 0.07), 0.06 + rnd() * 0.14, 0.22 + rnd() * 0.2];
    else if (b.h > 24 && rnd() < 0.3) b.tier = [1 - (0.12 + rnd() * 0.1), 1, 0.16 + rnd() * 0.12, 0];      // a set-back top floor
    else b.tier = [1, 1, 0, 0];
    const sn = Math.floor(b.seed * 997 + 0.5) / 997;
    b.helipad = b.h > 110 && (sn * 13.7) % 1 > 0.45 && b.kind < 2;
    b.lit = Math.min(0.9, st.lit * (b.kind === 4 ? 1.2 : 1) * (0.7 + rnd() * 0.6));
    b.warm = st.warm; b.shop = st.shop * (b.row === 0 ? 1 : 0.35);
    // signs, by district density
    const dens = st.signs;
    if (b.row < 2) {
      if (rnd() < dens * (b.kind === 2 ? 1 : 0.55) && b.h > 9) b.sign[0] = rnd() < 0.3 && b.kind === 2 ? 100 + ((rnd() * 8) | 0) : (rnd() * TOKYO_SIGNS.blades.length) | 0;
      if (rnd() < dens * 0.7) b.sign[1] = 200 + ((rnd() * TOKYO_SIGNS.boards.length) | 0);
    }
    if (b.h > 60 && (b.kind < 2 || b.kind === 4) && rnd() < (st.lamp === 'led' ? 0.45 : 0.25)) b.sign[1] = 300 + ((rnd() * TOKYO_SIGNS.crowns.length) | 0);
    if (b.h < 48 && b.h > 12 && !b.helipad && rnd() < dens * 0.32) b.sign[2] = 400 + ((rnd() * nRoof) | 0);
    if (b.h > 40 && rnd() < dens * 0.07) b.holo = (rnd() * TOKYO_SIGNS.holos.length) | 0;
  }
  const atlasId = (code) => code >= 400 ? 'roof' + (code - 400) : code >= 300 ? 'crown' + (code - 300) : code >= 200 ? 'board' + (code - 200) : code >= 100 ? 'stack' + (code - 100) : 'blade' + code;
  function setSlot(A, i, id, mode, speed, phase, gain) {
    const r = atlas.rect(id);
    A.r[i * 4] = r[0]; A.r[i * 4 + 1] = r[1]; A.r[i * 4 + 2] = r[2]; A.r[i * 4 + 3] = r[3];
    A.a[i * 4] = mode; A.a[i * 4 + 1] = speed; A.a[i * 4 + 2] = phase; A.a[i * 4 + 3] = gain;
  }
  function writeB(i) {
    const b = B[i];
    const zc = -(b.z + b.len / 2 - base);
    for (let k = 0; k < 3; k++) { signs.m.setMatrixAt(i * 3 + k, ZERO); plant.setMatrixAt(i * 3 + k, ZERO); }
    holos.m.setMatrixAt(i, ZERO); beacons.setMatrixAt(i * 2, ZERO); beacons.setMatrixAt(i * 2 + 1, ZERO);
    if (b.h <= 0) { bMesh.setMatrixAt(i, ZERO); return; }
    bMesh.setMatrixAt(i, M.compose(P.set(b.x, b.base, zc), Q0, Sc.set(b.dep, b.h, b.len)));
    aSeed[i] = b.seed;
    aTier.set(b.tier, i * 4);
    aKind[i * 4] = b.kind; aKind[i * 4 + 1] = b.lit; aKind[i * 4 + 2] = b.warm; aKind[i * 4 + 3] = b.shop;
    const side = b.side, xf = b.x - side * b.dep / 2, top = b.base + b.h, ph = b.seed * 7.3;
    const qFace = QY[side > 0 ? 1 : 0];
    // [0] blade / tenant stack, sticking out of the facade toward the road, facing the traffic
    if (b.sign[0] >= 0) {
      const stack = b.sign[0] >= 100, w = stack ? 1.7 : 1.2 + b.seed * 0.7, hh = w * 4;
      const y = b.base + Math.min(b.h - hh - 1, 4 + b.seed * Math.max(0, b.h * 0.5 - hh)) + hh / 2;
      if (y - hh / 2 > b.base + 2.5) {
        signs.m.setMatrixAt(i * 3, M.compose(P.set(xf - side * (w / 2 + 0.25), y, zc + b.len / 2 - 0.8), Q0, Sc.set(w, hh, 1)));
        const pale = !stack && (b.sign[0] % 5 === 0 || b.sign[0] % 5 === 3);   // white or yellow boxes: lit, not blown out
        setSlot(signs, i * 3, atlasId(b.sign[0]), stack ? 0 : 1, 0, ph, stack ? 1.1 : pale ? 0.85 : 1.5);
      }
    }
    // [1] facade board over the shopfronts, or a company name high on an office tower
    if (b.sign[1] >= 300) {
      const ins = b.tier[2], hy = b.tier[1] < 1 ? b.tier[1] : 1, w = Math.min(b.len * (1 - ins) * 0.82, 26), hh = w * CROWN[1] / CROWN[0];
      signs.m.setMatrixAt(i * 3 + 1, M.compose(P.set(b.x - side * (b.dep * (1 - ins) / 2 + 0.06), b.base + b.h * hy - hh * 0.9, zc), qFace, Sc.set(w, hh, 1)));
      setSlot(signs, i * 3 + 1, atlasId(b.sign[1]), 0, 0, ph, 1.05);
    } else if (b.sign[1] >= 200) {
      const w = Math.min(b.len * 0.8, 6 + b.seed * 4), hh = w / 4;
      signs.m.setMatrixAt(i * 3 + 1, M.compose(P.set(xf - side * 0.06, b.base + 4.4 + hh / 2 + (b.seed > 0.6 ? 3.2 : 0), zc), qFace, Sc.set(w, hh, 1)));
      setSlot(signs, i * 3 + 1, atlasId(b.sign[1]), b.seed > 0.7 ? 4 : 1, 0.8, ph, (b.sign[1] - 200) % 4 === 1 ? 0.85 : 1.15);
    }
    // [2] rooftop LED board, angled toward the oncoming traffic
    if (b.sign[2] >= 400) {
      const w = Math.min(b.len * 0.9, 7 + b.seed * 5), hh = w * ROOF[1] / ROOF[0];
      signs.m.setMatrixAt(i * 3 + 2, M.compose(P.set(b.x - side * b.dep * 0.18, top + 1.2 + hh / 2, zc + b.len * 0.2), QR[side > 0 ? 0 : 1], Sc.set(w, hh, 1)));
      setSlot(signs, i * 3 + 2, atlasId(b.sign[2]), b.seed > 0.5 ? 3 : 1, 0.04 + b.seed * 0.05, ph, 1.35);
    }
    if (quality.extras && b.holo >= 0) {
      const hh = 26 + b.seed * 20, w = hh / 3;
      holos.m.setMatrixAt(i, M.compose(P.set(xf - side * (w * 0.5 + 3), b.base + b.h * 0.35 + hh / 2, zc), Q0, Sc.set(w, hh, 1)));
      setSlot(holos, i, 'holo' + b.holo, 5, 0, ph, 0.9);
    }
    // roof plant: a water tank, an AC block, a mast on tall roofs (not on helipads)
    const cIns = b.tier[1] < 1 ? b.tier[3] : (b.tier[0] < 1 ? b.tier[2] : 0);
    const hw = b.dep * (1 - cIns) / 2, hl = b.len * (1 - cIns) / 2;
    if (quality.extras && !b.helipad && b.h > 8) {
      const r1 = (b.seed * 31.7) % 1, r2 = (b.seed * 57.3) % 1;
      plant.setMatrixAt(i * 3, M.compose(P.set(b.x + (r1 - 0.5) * hw, top, zc + (r2 - 0.5) * hl), Q0, Sc.set(Math.min(3, hw), 2.6, Math.min(3, hl))));
      plant.setMatrixAt(i * 3 + 1, M.compose(P.set(b.x - (r2 - 0.5) * hw, top, zc - (r1 - 0.5) * hl), Q0, Sc.set(hw * 0.7, 1.3, hl * 0.4)));
      if (b.h > 35) plant.setMatrixAt(i * 3 + 2, M.compose(P.set(b.x + hw * 0.6 * (r1 > 0.5 ? 1 : -1), top, zc + hl * 0.5), Q0, Sc.set(0.35, 7 + r2 * 8, 0.35)));
    }
    // red aviation obstacle lights on anything tall, blinking in near-sync like the real ones
    if (b.h > 45) {
      for (let k = 0; k < 2; k++) {
        const sx = k ? 1 : -1;
        beacons.setMatrixAt(i * 2 + k, M.compose(P.set(b.x + sx * hw * 0.92, top + 0.6, zc + sx * hl * 0.92), Q0, Sc.set(2.2, 2.2, 2.2)));
        const o = (i * 2 + k) * 4; aBlink[o] = 0.75; aBlink[o + 1] = b.seed * 0.08; aBlink[o + 2] = 0.4; aBlink[o + 3] = 0.06;
      }
    }
  }
  function rollTree(t, z) {
    const s = sOfZ(z), st = DSTYLE[distAt(s).index], deck = tab(T_DECK, s);
    t.z = z;
    const repl = t.side < 0 ? st.left : st.right;
    if (repl === 'palace' && deck > -3) { t.step = 4 + rnd() * 4; t.r = 4 + rnd() * 5; t.x = t.side * (37 + t.r + rnd() * 70); t.y = -deck + 8 + t.r * 0.3; }
    else if (repl === 'park' && deck > -3) { t.step = 4 + rnd() * 5; t.r = 3.5 + rnd() * 4; t.x = t.side * (20 + t.r + rnd() * 55); t.y = -deck + t.r * 0.6; }
    else { t.step = 20; t.r = 0; }
  }
  function writeTree(i) {
    const t = TR[i];
    if (t.r <= 0) { trees.setMatrixAt(i, ZERO); return; }
    trees.setMatrixAt(i, M.compose(P.set(t.x, t.y, -(t.z - base)), Q0, Sc.set(t.r, t.r * 0.8, t.r)));
  }
  function refill(z) {
    for (const pool of pools) {
      pool.head = 0; pool.cursor = z - BEHIND + (pool.row ? -40 : 0);
      for (const i of pool.idx) { const b = B[i]; rollB(b, pool.cursor); pool.cursor = b.z + b.len + b.gap; }
    }
    for (const pool of treePools) {
      pool.head = 0; pool.cursor = z - BEHIND;
      for (const i of pool.idx) { const t = TR[i]; rollTree(t, pool.cursor); pool.cursor = t.z + t.step; }
    }
  }
  function writeAll() {
    for (let i = 0; i < NB; i++) writeB(i);
    for (let i = 0; i < TR.length; i++) writeTree(i);
    flagAll();
  }
  function flagAll() {
    for (const m of [bMesh, signs.m, holos.m, plant, beacons, trees]) m.instanceMatrix.needsUpdate = true;
    for (const g of [bGeo]) { g.attributes.aSeed.needsUpdate = g.attributes.aTier.needsUpdate = g.attributes.aKind.needsUpdate = true; }
    for (const A of [signs, holos]) { A.m.geometry.attributes.aRect.needsUpdate = A.m.geometry.attributes.aAnim.needsUpdate = true; }
    beaconGeo.attributes.aBlink.needsUpdate = true;
  }

  // ---------------------------------------------------------------- per frame
  let simRef = null;
  function update(S, sim, tunnel) {
    if (simRef !== sim) { simRef = sim; sOfZ = (z) => sim.trackS(z); }
    const z = S.z;
    if (Math.abs(z - lastZ) > 150 || S.startS !== startS) { startS = S.startS; base = Math.floor(z / 1000) * 1000; refill(z); dirtyAll = true; }
    lastZ = z;
    if (z - base > 4000) { base += 4000; dirtyAll = true; }
    group.position.z = z - base;
    let dirty = false;
    for (const pool of pools) {
      for (let guard = 0; guard < 8; guard++) {
        const i = pool.idx[pool.head], b = B[i];
        if (b.z + b.len > z - BEHIND) break;
        rollB(b, pool.cursor); pool.cursor = b.z + b.len + b.gap;
        if (!dirtyAll) writeB(i);
        pool.head = (pool.head + 1) % pool.idx.length; dirty = true;
      }
    }
    for (const pool of treePools) {
      for (let guard = 0; guard < 8; guard++) {
        const i = pool.idx[pool.head], t = TR[i];
        if (t.z > z - BEHIND) break;
        rollTree(t, pool.cursor); pool.cursor = t.z + t.step;
        if (!dirtyAll) writeTree(i);
        pool.head = (pool.head + 1) % pool.idx.length; dirty = true;
      }
    }
    if (dirtyAll) { writeAll(); dirtyAll = false; } else if (dirty) flagAll();

    // profile and the shader-side road position
    const s = S.s;
    writeProf(s);
    CITY.uS.value = S.startS + z;
    // piers: one every 30 m where the deck stands clear of the street
    piers.position.z = z % PIER_GAP;
    for (let k = 0; k < pierN; k++) {
      const lz = PROF.NEAR - k * PIER_GAP, wz = lz + piers.position.z, deck = tab(T_DECK, s - wz);
      if (deck < 3.5 || tab(T_TUN, s - wz) > 0) { piers.setMatrixAt(k, ZERO); heads.setMatrixAt(k, ZERO); continue; }
      piers.setMatrixAt(k, M.compose(P.set(0, -deck, lz), Q0, Sc.set(1, deck - 3.3, 1)));
      heads.setMatrixAt(k, M.makeTranslation(0, -2.0, lz));
    }
    heads.position.z = piers.position.z;
    piers.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
    // portals of the current/next tunnel (sim.tunnelNear: z0/z1 in odometer metres)
    if (tunnel && tunnel.index >= 0) {
      const zIn = tunnel.z0 - 5 - z, zOut = tunnel.z1 - 5 - z;
      portals[0].visible = zIn > -40 && zIn < AHEAD; portals[0].position.set(0, 0, -zIn);
      portals[1].visible = zOut > -40 && zOut < AHEAD && zIn < 0; portals[1].position.set(0, 0, -zOut);
    } else portals[0].visible = portals[1].visible = false;
    // road furniture in view
    let n = 0;
    for (let k = 0; k < FURN.length && n < FMAX; k++) {
      const f = FURN[k];
      const d = C1.ahead(s - 20, f.s) - 20;
      if (d > 640) continue;
      furn.m.setMatrixAt(n, M.compose(P.set(f.x, f.y, -d), Q0, Sc.set(f.w, f.h, 1)));
      furn.r[n * 4] = f.rect[0]; furn.r[n * 4 + 1] = f.rect[1]; furn.r[n * 4 + 2] = f.rect[2]; furn.r[n * 4 + 3] = f.rect[3];
      furn.a[n * 4] = f.mode; furn.a[n * 4 + 1] = 0; furn.a[n * 4 + 2] = k * 0.37; furn.a[n * 4 + 3] = f.gain;
      if (f.post) posts.setMatrixAt(n, M.compose(P.set(-6.58, 1.05, -d - 0.12), Q0, Sc.set(1, f.y - 1.05, 1)));
      else posts.setMatrixAt(n, ZERO);
      n++;
    }
    furn.m.count = posts.count = n;
    furn.m.instanceMatrix.needsUpdate = posts.instanceMatrix.needsUpdate = true;
    furn.m.geometry.attributes.aRect.needsUpdate = furn.m.geometry.attributes.aAnim.needsUpdate = true;
  }

  // ---------------------------------------------------------------- time of day, quality
  const tmpC = new THREE.Color();
  function applyTime(T) {
    bMat.uniforms.uWin.value.forEach((c, i) => c.set(T.windows[i]));
    CITY.uSky.value.set(T.horizon).multiplyScalar(0.9);
    CITY.uAmb.value.set(T.hemi[0]).multiplyScalar(0.05 + 0.08 * T.hemi[2]);
    CITY.uUp.value.set(T.windows[1]).lerp(tmpC.set('#ff9a50'), 0.5).multiplyScalar(0.42);
    CITY.uLampCol.value.set(T.windows[1]).lerp(tmpC.set('#ffffff'), 0.35);
  }
  function setLamp(col) { CITY.uLampCol.value.copy(col); }
  function applyQuality(q) {
    quality = { ...quality, ...q };
    CITY.uDetail.value = quality.extras ? 1 : 0;
    plant.visible = holos.m.visible = !!quality.extras;
    // LOW keeps the frontage and the skyline rows but thins the second row (from the next refill)
    lastZ = -1e9;
  }
  function setVisible(v) { for (const o of [group, ground, structure, piers, heads, furn.m, posts]) o.visible = v; if (!v) portals[0].visible = portals[1].visible = false; }

  return { update, applyTime, applyQuality, setLamp, setVisible, deckAt, tunnelAt: (s) => tab(T_TUN, s) > 0.5, meshes: { ground, structure, buildings: bMesh } };
}
