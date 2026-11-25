// Time of day: hour (0..24) -> sky, fog and light settings. Pure.
const K = [
  // h, zenith, horizon, glow, fog, skyAmb, dirCol, blockGain, emGain, night, stars, exposure
  [0, '#02040a', '#0f0d20', '#341a34', '#0a0915', [0.032, 0.038, 0.068], [0.11, 0.13, 0.2], 1.4, 1.75, 1, 1, 1.08],
  [4.6, '#05081a', '#1b1a36', '#3a2440', '#11112a', [0.06, 0.07, 0.12], [0.14, 0.17, 0.26], 1.3, 1.65, 1, 0.9, 1.1],
  [5.6, '#273a6e', '#d08a7a', '#4a2a3a', '#4a4a6a', [0.25, 0.26, 0.34], [0.9, 0.55, 0.4], 1.0, 1.5, 0.45, 0.2, 1.05],
  [7, '#4a7fc8', '#cfd8e6', '#000000', '#a9b7cc', [0.5, 0.55, 0.65], [1.25, 1.12, 0.95], 0.4, 1.0, 0, 0, 1],
  [12, '#3d78cc', '#c6d8ec', '#000000', '#b3c4d8', [0.55, 0.6, 0.7], [1.4, 1.3, 1.15], 0.35, 1.0, 0, 0, 0.95],
  [16.5, '#4a72b8', '#e6cfae', '#000000', '#c0b6a8', [0.5, 0.5, 0.55], [1.35, 1.05, 0.75], 0.45, 1.0, 0.05, 0, 1],
  [17.8, '#3d4f8c', '#f09a62', '#5a2a20', '#8a6a6a', [0.36, 0.32, 0.36], [1.2, 0.62, 0.35], 0.8, 1.3, 0.3, 0, 1.05],
  [18.6, '#1d2a5e', '#8a6a9a', '#7a3a4a', '#3c3c62', [0.16, 0.17, 0.27], [0.35, 0.3, 0.45], 1.05, 1.45, 0.7, 0.3, 1.08],
  [19.4, '#0c1438', '#3a3260', '#5a2a48', '#1f1e3e', [0.09, 0.1, 0.17], [0.2, 0.22, 0.34], 1.25, 1.6, 0.9, 0.7, 1.1],
  [20.5, '#040714', '#15132a', '#42223a', '#0e0d20', [0.042, 0.05, 0.085], [0.13, 0.15, 0.23], 1.4, 1.75, 1, 1, 1.08],
  [24, '#02040a', '#0f0d20', '#341a34', '#0a0915', [0.032, 0.038, 0.068], [0.11, 0.13, 0.2], 1.4, 1.75, 1, 1, 1.08],
];
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); };
const KK = K.map((k) => [k[0], hex(k[1]), hex(k[2]), hex(k[3]), hex(k[4]), k[5], k[6], k[7], k[8], k[9], k[10], k[11]]);
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export function envAt(hour) {
  hour = ((hour % 24) + 24) % 24;
  let i = 0; while (i < KK.length - 2 && KK[i + 1][0] <= hour) i++;
  const a = KK[i], b = KK[i + 1];
  let t = (hour - a[0]) / (b[0] - a[0]); t = t * t * (3 - 2 * t);
  const out = {
    zenith: lerp3(a[1], b[1], t), horizon: lerp3(a[2], b[2], t), glow: lerp3(a[3], b[3], t), fog: lerp3(a[4], b[4], t),
    skyAmb: lerp3(a[5], b[5], t), dirCol: lerp3(a[6], b[6], t), blockGain: lerp(a[7], b[7], t), emGain: lerp(a[8], b[8], t),
    night: lerp(a[9], b[9], t), stars: lerp(a[10], b[10], t), exposure: lerp(a[11], b[11], t),
  };
  // sun path: rises east (+x) at 6, sets west at 18, leaning south (+z)
  const sa = (hour - 6) / 12 * Math.PI;
  const sun = [Math.cos(sa), Math.sin(sa), 0.45];
  const sl = Math.hypot(...sun); out.sunDir = sun.map((v) => v / sl);
  const moon = [-0.45, 0.62, 0.64]; const ml = Math.hypot(...moon); out.moonDir = moon.map((v) => v / ml);
  out.sunVis = Math.max(0, Math.min(1, out.sunDir[1] * 6 + 0.3));
  // the directional light follows the sun by day and the moon by night
  out.lightDir = out.sunDir[1] > 0.05 ? out.sunDir : out.moonDir;
  return out;
}
