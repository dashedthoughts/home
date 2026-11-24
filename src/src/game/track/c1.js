// The real road: Shuto Expressway Inner Circular Route (C1), inner loop (counter-clockwise), one lap = LENGTH metres.
// Source: c1.json, built from OpenStreetMap relation 4256008 by tools/build-c1.py (positions resampled every 10 m).
// Map data © OpenStreetMap contributors (ODbL 1.0). Show CREDIT wherever this road or map is shown.
//
// Coordinates: x = metres east, y = metres north of (35.6770 N, 139.7570 E), the same projection as c1.json.
// s = distance along the loop in metres, 0 at Shiodome, increasing in the direction of travel (Ginza next).
// Every function takes any s (negative or past LENGTH) and wraps it. Nothing here allocates after module load.
//
// Game concessions (labelled, deliberate):
// - curveAt() is the real curvature, smoothed over ~60 m and squashed with tanh so a 150 m radius bend reads as a strong
//   bend (~0.7) and the 54 m hairpins sit at the limit (~0.95). The real geometry stays available as realCurvAt()/headingAt().
// - elevationAt() is inferred from the OSM layer/bridge/tunnel tags (no surveyed heights in the data): viaducts up,
//   tunnels and the Ginza/Kyobashi open cut down. hillAt() is its vertical curvature, scaled to the renderer's -1..1.
// - The real C1 is mostly two lanes (lanesAt gives the tagged count). The game always plays three lanes.
import DATA from './c1.json' with { type: 'json' };

export const CREDIT = 'Map data © OpenStreetMap contributors';
export const SOURCE = DATA.source;
export const STEP = DATA.step;                 // 10 m between samples
const N = DATA.x.length;
export const LENGTH = N * STEP;                // 13 790 m
export const ORIGIN = DATA.origin;             // { lat: 35.677, lon: 139.757 }
const KX = 111320 * Math.cos((ORIGIN.lat * Math.PI) / 180), KY = 110940;
/** lon/lat → metres in the track projection (writes out.x, out.y). */
export function project(lat, lon, out) { out.x = (lon - ORIGIN.lon) * KX; out.y = (lat - ORIGIN.lat) * KY; return out; }

export const wrap = (s) => ((s % LENGTH) + LENGTH) % LENGTH;
/** distance from a to b going forward along the loop (0..LENGTH). */
export const ahead = (a, b) => wrap(b - a);

// ---------------------------------------------------------------- per-sample tables (built once)
const X = Float64Array.from(DATA.x), Y = Float64Array.from(DATA.y);
const K = new Float32Array(N);                  // real curvature, rad/m, + = bending right
for (let i = 0; i < N; i++) K[i] = DATA.curv[i] * 1e-5;
const LANES_T = Uint8Array.from(DATA.lanes);
const RAW_TUN = new Uint8Array(N), BRIDGE = new Uint8Array(N);
for (let i = 0; i < N; i++) { RAW_TUN[i] = DATA.tunnel.charCodeAt(i) === 49 ? 1 : 0; BRIDGE[i] = DATA.bridge.charCodeAt(i) === 49 ? 1 : 0; }

function boxSmooth(src, radius, passes) {
  let a = Float32Array.from(src), b = new Float32Array(N);
  for (let p = 0; p < passes; p++) {
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let q = -radius; q <= radius; q++) sum += a[(i + q + N) % N];
      b[i] = sum / (2 * radius + 1);
    }
    const t = a; a = b; b = t;
  }
  return a;
}

// heading: 0 = north, clockwise positive, unwrapped along the lap (ends ~ -2π: the inner loop turns left once)
const HEAD = new Float64Array(N);
{
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N, b = (i + 1) % N;
    let h = Math.atan2(X[b] - X[a], Y[b] - Y[a]);
    if (i > 0) { while (h - prev > Math.PI) h -= 2 * Math.PI; while (h - prev < -Math.PI) h += 2 * Math.PI; }
    HEAD[i] = h; prev = h;
  }
}
/** total heading change over one lap in radians (≈ -2π) */
export const TOTAL_TURN = (() => { let t = 0; for (let i = 0; i < N; i++) { let d = HEAD[(i + 1) % N] - HEAD[i]; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; t += d; } return t; })();

// game curvature: smooth the real curvature (box 70 m, twice), then squash
const R_REF = 130;                               // metres: tanh(R_REF / r) → 150 m ≈ 0.7, 54 m ≈ 0.98
const KS = boxSmooth(K, 3, 2);
const GC = new Float32Array(N);
for (let i = 0; i < N; i++) GC[i] = Math.tanh(Math.abs(KS[i]) * R_REF) * Math.sign(KS[i]);

// tunnels: real flags, gaps of 50 m or less merged (the Ginza cut-and-cover boxes read as one tunnel), wrap-aware
const TUN = new Uint8Array(N);
export const tunnelSpans = [];                   // [{ from, to, length, name, jp }] in s, ordered, from < to
{
  const raw = [];
  for (let i = 0; i < N; i++) if (RAW_TUN[i] && !RAW_TUN[(i - 1 + N) % N]) {
    let j = i; while (RAW_TUN[j % N] && j - i < N) j++;
    raw.push([i * STEP, j * STEP]);
  }
  for (const [a, b] of raw) {
    const last = tunnelSpans[tunnelSpans.length - 1];
    if (last && a - last.to <= 50) last.to = b; else tunnelSpans.push({ from: a, to: b });
  }
  // names of the two long ones are their real names (千代田トンネル, 霞が関トンネル); the short Ginza boxes are unnamed
  for (const t of tunnelSpans) {
    t.length = t.to - t.from;
    const mid = (t.from + t.to) / 2;
    t.name = mid > 6500 && mid < 7800 ? 'Chiyoda Tunnel' : mid > 7900 && mid < 9000 ? 'Kasumigaseki Tunnel' : '';
    t.jp = t.name === 'Chiyoda Tunnel' ? '千代田トンネル' : t.name ? '霞が関トンネル' : '';
    for (let s = t.from; s < t.to; s += STEP) TUN[Math.round(s / STEP) % N] = 1;
  }
}

// elevation (metres, inferred from tags): bridge 6 + 4 per layer, tunnel -8 / -14, the Ginza-Kyobashi open cut -6, else 5 per layer
const E0 = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const s = i * STEP, L = DATA.layer[i];
  if (BRIDGE[i]) E0[i] = 6 + 4 * Math.max(1, L);
  else if (RAW_TUN[i]) E0[i] = L <= -2 ? -14 : -8;
  else if (s > 640 && s < 2960) E0[i] = -6;
  else E0[i] = L * 5;
}
const ELEV = boxSmooth(E0, 12, 3);
const HILL = new Float32Array(N);
{
  const d2 = new Float32Array(N);
  const h = 6; // ±60 m
  for (let i = 0; i < N; i++) d2[i] = (ELEV[(i + h) % N] - 2 * ELEV[i] + ELEV[(i - h + N) % N]) / ((h * STEP) ** 2);
  const sorted = Array.from(d2, Math.abs).sort((a, b) => a - b);
  const ref = Math.max(1e-6, sorted[Math.floor(N * 0.97)]);
  for (let i = 0; i < N; i++) HILL[i] = Math.max(-1, Math.min(1, d2[i] / ref));
}

// ---------------------------------------------------------------- sampling (linear, wrap-aware, allocation-free)
let _i = 0, _t = 0;
function at(s) { const f = wrap(s) / STEP; _i = Math.floor(f); _t = f - _i; if (_i >= N) { _i = N - 1; _t = 1; } }
const lerpT = (T) => { const a = T[_i], b = T[(_i + 1) % N]; return a + (b - a) * _t; };

/** game curvature at s, -1..1 (+ = right). This is what the simulation steers against. */
export function curveAt(s) { at(s); return lerpT(GC); }
/** real curvature at s in rad/m (+ = right), lightly smoothed by the build (radius = 1/|k|). */
export function realCurvAt(s) { at(s); return lerpT(K); }
/** heading at s in radians, 0 = north, clockwise positive, in (-π, π]. */
export function headingAt(s) {
  at(s);
  const a = HEAD[_i], b = _i + 1 < N ? HEAD[_i + 1] : HEAD[0] + TOTAL_TURN;
  let h = a + (b - a) * _t;
  h = h % (2 * Math.PI); if (h > Math.PI) h -= 2 * Math.PI; else if (h <= -Math.PI) h += 2 * Math.PI;
  return h;
}
/** position at s in metres (writes out.x, out.y; returns out). */
export function posAt(s, out) {
  at(s);
  const j = (_i + 1) % N;
  out.x = X[_i] + (X[j] - X[_i]) * _t; out.y = Y[_i] + (Y[j] - Y[_i]) * _t;
  return out;
}
/** inside a tunnel (merged spans)? */
export function tunnelAt(s) { return TUN[Math.round(wrap(s) / STEP) % N] === 1; }
/** index into tunnelSpans of the span containing s, else -1. */
export function tunnelIndexAt(s) { const w = wrap(s); for (let k = 0; k < tunnelSpans.length; k++) if (w >= tunnelSpans[k].from && w < tunnelSpans[k].to) return k; return -1; }
/** on a bridge/viaduct (raw OSM flag)? */
export function bridgeAt(s) { return BRIDGE[Math.round(wrap(s) / STEP) % N] === 1; }
/** smoothed elevation in metres (inferred, see header). */
export function elevationAt(s) { at(s); return lerpT(ELEV); }
/** vertical curvature for the renderer's curved-world bend, -1..1 (+ = road ahead rises). */
export function hillAt(s) { at(s); return lerpT(HILL); }
/** tagged lane count of the real road (1-3). The game always plays 3. */
export function lanesAt(s) { return LANES_T[Math.round(wrap(s) / STEP) % N]; }

// ---------------------------------------------------------------- districts the road passes (ordered from s = 0)
// from/to in s; a district with from > to wraps through s = 0 (Shiodome). Together they cover the loop with no gaps.
// style is a hint for the city renderer:
//   towers   glass high-rises (Shiodome)          neon     shopping street signs (Ginza)
//   office   office blocks, station (Yaesu/Otemachi)   river    the expressway over the old river (Nihonbashi)
//   park     palace gardens, trees, moat edge     moat     walls, moat water, palace greenery
//   gov      ministries, low stone blocks         hills    hilly towers (Roppongi)
//   resid    low-rise residential, shrines        tower    Tokyo Tower's park, temple roofs
//   bay      waterfront, warehouses, the bay
export const DISTRICTS = [
  { id: 'shiodome', name: 'Shiodome', jp: '汐留', from: 13350, to: 450, style: 'towers' },
  { id: 'ginza', name: 'Ginza', jp: '銀座', from: 450, to: 1800, style: 'neon' },
  { id: 'kyobashi', name: 'Kyobashi · Yaesu', jp: '京橋・八重洲', from: 1800, to: 2850, style: 'office' },
  { id: 'nihonbashi', name: 'Nihonbashi · Edobashi', jp: '日本橋・江戸橋', from: 2850, to: 3700, style: 'river' },
  { id: 'otemachi', name: 'Otemachi · Kandabashi', jp: '大手町・神田橋', from: 3700, to: 5050, style: 'office' },
  { id: 'takebashi', name: 'Takebashi', jp: '竹橋', from: 5050, to: 5600, style: 'park' },
  { id: 'kitanomaru', name: 'Kitanomaru · Chiyoda Tunnel', jp: '北の丸・千代田トンネル', from: 5600, to: 7050, style: 'moat' },
  { id: 'miyakezaka', name: 'Miyakezaka', jp: '三宅坂', from: 7050, to: 7950, style: 'gov' },
  { id: 'kasumigaseki', name: 'Kasumigaseki', jp: '霞が関', from: 7950, to: 9250, style: 'gov' },
  { id: 'tanimachi', name: 'Tanimachi · Roppongi', jp: '谷町・六本木', from: 9250, to: 10150, style: 'hills' },
  { id: 'iikura', name: 'Iikura · Azabu', jp: '飯倉・麻布', from: 10150, to: 11250, style: 'resid' },
  { id: 'shibakoen', name: 'Shibakoen', jp: '芝公園', from: 11250, to: 12550, style: 'tower' },
  { id: 'hamazakibashi', name: 'Hamazakibashi', jp: '浜崎橋', from: 12550, to: 13350, style: 'bay' },
];
const DIST_T = new Uint8Array(N);
DISTRICTS.forEach((d, k) => { d.index = k; for (let i = 0; i < N; i++) { const s = i * STEP; if (d.from < d.to ? s >= d.from && s < d.to : s >= d.from || s < d.to) DIST_T[i] = k; } });
/** the district at s (an entry of DISTRICTS). */
export function districtAt(s) { return DISTRICTS[DIST_T[Math.floor(wrap(s) / STEP) % N]]; }

// ---------------------------------------------------------------- junctions and exits (real OSM motorway_junction nodes)
// kind 'jct' = expressway-to-expressway junction, 'exit' = off-ramp. Duplicates (same node twice, same exit's
// sibling nodes within 500 m) are removed; names OSM leaves blank in English are filled in. An unnamed node at s≈9800
// (between Tanimachi and Iikura) is left out because it could not be identified.
const EN = {
  '浜崎橋JCT': 'Hamazakibashi JCT', '一ノ橋JCT': 'Ichinohashi JCT', '谷町JCT': 'Tanimachi JCT', '三宅坂JCT': 'Miyakezaka JCT',
  '江戸橋JCT': 'Edobashi JCT', '竹橋JCT': 'Takebashi JCT', '霞が関': 'Kasumigaseki',
};
export const JUNCTIONS = [];
for (const j of DATA.junctions) {
  if (!j.name || /入口$/.test(j.name)) continue;            // unnamed, or an on-ramp node
  const jp = j.name.replace('ジャンクション', 'JCT').replace(/出口$/, '');
  const kind = /JCT$/.test(jp) ? 'jct' : 'exit';
  const name = EN[jp] || (kind === 'jct' ? (j.en || '').replace(/ ?junction$/i, '') + ' JCT' : j.en || jp);
  const dup = JUNCTIONS.find((o) => o.jp === jp && Math.abs(o.s - j.s) < (kind === 'jct' ? 100 : 500));
  if (dup) continue;
  JUNCTIONS.push({ s: j.s, name, jp, kind, ref: j.ref || '' });
}
JUNCTIONS.sort((a, b) => a.s - b.s);
// a JCT's nodes (split and merge) grouped into one named event, at its first node: what the game calls out
export const JCT_EVENTS = [];
for (const j of JUNCTIONS) {
  if (j.kind !== 'jct') continue;
  const last = JCT_EVENTS[JCT_EVENTS.length - 1];
  if (last && last.jp === j.jp && j.s - last.nodes[last.nodes.length - 1] < 1000) last.nodes.push(j.s);
  else JCT_EVENTS.push({ s: j.s, name: j.name, jp: j.jp, nodes: [j.s] });
}
// merge zones: the 350 m after every JCT node, where other routes' traffic joins
export const MERGE_LEN = 350;
const MERGE_T = new Uint8Array(N);
for (const e of JCT_EVENTS) for (const s0 of e.nodes) for (let s = s0; s < s0 + MERGE_LEN; s += STEP) MERGE_T[Math.round(wrap(s) / STEP) % N] = 1;
/** inside a JCT merge zone? */
export function mergeAt(s) { return MERGE_T[Math.round(wrap(s) / STEP) % N] === 1; }
/** the next JCT event at or ahead of s (an entry of JCT_EVENTS); distance with ahead(s, e.s). */
export function nextJctEvent(s) {
  const w = wrap(s);
  for (let k = 0; k < JCT_EVENTS.length; k++) if (JCT_EVENTS[k].s >= w) return JCT_EVENTS[k];
  return JCT_EVENTS[0];
}
/** the next junction or exit of `kind` ('jct' | 'exit' | undefined for either) strictly ahead of s. */
export function nextJunction(s, kind) {
  const w = wrap(s);
  let first = null;
  for (let k = 0; k < JUNCTIONS.length; k++) {
    const j = JUNCTIONS[k];
    if (kind && j.kind !== kind) continue;
    if (!first) first = j;
    if (j.s > w) return j;
  }
  return first;
}

// ---------------------------------------------------------------- landmarks (real positions, same projection)
// Coordinates from OpenStreetMap via Nominatim (search API, looked up 2026-11-24; OSM object in `osm`; the raw answers
// are cached in landmarks.nominatim.json). Heights are the published structural heights, rounded (m).
// Note: Tokyo Tower is INSIDE the loop, ~410 m north of the road at Shibakoen (s ≈ 11 540): the C1 follows the Furukawa
// river south of Shiba Park. Imperial Palace, Tokyo Station, Toranomon Hills and the Shiodome towers are inside too;
// Roppongi Hills, Budokan, Skytree, the Tocho and Rainbow Bridge are outside.
const LM = [
  ['tokyo-tower', 'Tokyo Tower', '東京タワー', 35.6584491, 139.7455360, 333, 'relation/4247312'],
  ['skytree', 'Tokyo Skytree', '東京スカイツリー', 35.7100543, 139.8107141, 634, 'way/288269147'],
  ['roppongi-hills', 'Roppongi Hills Mori Tower', '六本木ヒルズ森タワー', 35.6604561, 139.7292768, 238, 'way/153924771'],
  ['toranomon-hills', 'Toranomon Hills', '虎ノ門ヒルズ森タワー', 35.6668445, 139.7491506, 256, 'way/390949465'],
  ['tokyo-station', 'Tokyo Station', '東京駅丸の内駅舎', 35.6811505, 139.7659765, 35, 'relation/4856156'],
  ['rainbow-bridge', 'Rainbow Bridge', 'レインボーブリッジ', 35.6363770, 139.7639279, 126, 'way/316305908'],
  ['imperial-palace', 'Imperial Palace', '皇居', 35.6838467, 139.7506859, 20, 'way/534754971'],
  ['budokan', 'Nippon Budokan', '日本武道館', 35.6933554, 139.7498704, 42, 'way/43896730'],
  ['tocho', 'Tokyo Metropolitan Government Building', '東京都庁', 35.6897391, 139.6929973, 243, 'relation/11045959'],
  ['shiodome', 'Shiodome towers', '汐留', 35.6649380, 139.7625073, 213, 'way/384505658'],
  ['nihonbashi', 'Nihonbashi bridge', '日本橋', 35.6840677, 139.7745029, 10, 'way/550689172'],
];
export const LANDMARKS = LM.map(([id, name, jp, lat, lon, height, osm]) => {
  const p = project(lat, lon, {});
  return { id, name, jp, x: Math.round(p.x), y: Math.round(p.y), height, lat, lon, osm };
});
const _p = { x: 0, y: 0 };
/** angle of a landmark relative to the direction of travel at s, radians in (-π, π]: 0 dead ahead, + to the right. */
export function bearingTo(s, lm) {
  posAt(s, _p);
  let a = Math.atan2(lm.x - _p.x, lm.y - _p.y) - headingAt(s);
  while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI;
  return a;
}
/** straight-line distance in metres from the road at s to a landmark. */
export function distanceTo(s, lm) { posAt(s, _p); return Math.hypot(lm.x - _p.x, lm.y - _p.y); }

// ---------------------------------------------------------------- map helpers (allocate; call once)
/** bounding box of the loop in metres. */
export const BOUNDS = (() => { let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; for (let i = 0; i < N; i++) { a = Math.min(a, X[i]); b = Math.max(b, X[i]); c = Math.min(c, Y[i]); d = Math.max(d, Y[i]); } return { minX: a, maxX: b, minY: c, maxY: d }; })();
/** SVG path data for the loop (or the part from s0 to s1), north up: svg x = x, svg y = -y, in metres. */
export function svgPath(s0 = 0, s1 = LENGTH, step = 40) {
  const p = { x: 0, y: 0 };
  let d = '';
  for (let s = s0; s <= s1 + 1e-6; s += step) { posAt(Math.min(s, s1), p); d += (d ? 'L' : 'M') + p.x.toFixed(0) + ' ' + (-p.y).toFixed(0); }
  return s0 === 0 && s1 === LENGTH ? d + 'Z' : d;
}

/** is s within `before` metres before, or `after` metres past, any JCT node? (keeps pickups out from under the signs) */
export function nearJct(s, before, after) {
  const w = wrap(s);
  for (let k = 0; k < JUNCTIONS.length; k++) {
    const j = JUNCTIONS[k];
    if (j.kind === 'jct' && (ahead(w, j.s) < before || ahead(j.s, w) < after)) return true;
  }
  return false;
}
