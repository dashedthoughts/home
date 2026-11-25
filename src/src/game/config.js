// REDLINE · everything the garage can change. Pure data, shared by sim, renderer and UI.
// All names, cars and liveries are original.

export const CARS = {
  wedge: {
    name: 'VANTA GT',
    blurb: 'Wide, low wedge with a louvred tail. Honest grip, no surprises.',
    top: 1.0, accel: 1.0, grip: 1.0, cool: 1.0,
  },
  bike: {
    name: 'TSUBAME',
    blurb: 'Naked superbike, long and low. The quickest thing in the garage off the line; leans hard and slips through gaps a car can\'t.',
    top: 1.04, accel: 1.18, grip: 1.08, cool: 0.95, bike: true,
  },
};

// body = paint, stripe = livery stripe, trim = wing / rims / accents
export const LIVERIES = [
  { name: 'BONE', body: '#e9e4d8', stripe: '#ff003c', trim: '#15121d' },
  { name: 'SIGNAL', body: '#fcee0a', stripe: '#0d0d0d', trim: '#0d0d0d' },
  { name: 'MIDNIGHT', body: '#1b1830', stripe: '#00f0ff', trim: '#ff2bd6' },
  { name: 'ROSSO', body: '#c8102e', stripe: '#f5f2ea', trim: '#111111' },
  { name: 'AKAI', body: '#e0141e', stripe: '#ffe7c2', trim: '#1a0d0f' },
  { name: 'GHOST', body: '#8e95a8', stripe: '#b8ff2e', trim: '#1b1b22' },
  { name: 'ORCHID', body: '#ff2bd6', stripe: '#16121f', trim: '#00f0ff' },
];

export const GLOWS = [
  { name: 'CYAN', color: '#00f0ff' },
  { name: 'MAGENTA', color: '#ff2bd6' },
  { name: 'ACID', color: '#b8ff2e' },
  { name: 'AMBER', color: '#ffb000' },
  { name: 'OFF', color: null },
];

// Time of day sets the sky, fog, light and the colour of the city.
export const TIMES = {
  // The default look: the real Shuto at 3 a.m., as a night photograph would show it. A near-black blue-grey sky with a dirty
  // sodium glow low on the horizon (light pollution), a few low clouds lit from below, almost no stars. Colour comes from
  // the city, not the sky: cool-white LED and amber sodium lamps, lit windows, signs, brake lights.
  // Extra knobs only this mood sets (all optional, read by render/materials.js applySkyMood and engine.js):
  //   clouds 0..1 cloud cover · cloudLit how brightly the city lights the cloud bellies · glowVar how much the horizon glow
  //   varies with direction (brighter toward dense districts) · envA/envB the two lamp rows in the reflection map ·
  //   real: 1 = photographic grade (district haze tints pulled toward sodium grey)
  tokyo: {
    name: 'TOKYO',
    zenith: '#05080d', horizon: '#131821', glow: '#70482a', fog: '#131210',
    body: { kind: 'moon', color: '#e9e6dc', size: 44, y: 300 },
    hemi: ['#8d95a6', '#17120c', 0.42], key: ['#b9c4dc', 0.2],
    // lit windows and lamps: cool-white office LED, warm white, sodium amber, the blue of a TV
    windows: ['#eef2f8', '#ffd6a6', '#ffb060', '#bcd8ff'], stars: 0.012, fogDensity: 0.003,
    clouds: 0.5, cloudLit: 0.4, glowVar: 0.45, envA: '#ffb060', envB: '#dfe8ff', real: 1,
    searchlights: false,
  },
  dusk: {
    name: 'DUSK',
    zenith: '#0a0726', horizon: '#ff5a4e', glow: '#ffb347', fog: '#2b1140',
    body: { kind: 'moon', color: '#ffe9d6', size: 120, y: 190 },
    hemi: ['#ff9a6a', '#0b0720', 0.65], key: ['#ffc58a', 0.5],
    windows: ['#00e5ff', '#ffb347', '#ffe36b', '#7ff3ff'], stars: 0.8, fogDensity: 0.0024,
  },
  midnight: {
    name: 'NEON BLUE',
    zenith: '#02030c', horizon: '#1f2f7a', glow: '#3a5bff', fog: '#0b1030',
    body: { kind: 'moon', color: '#dfe9ff', size: 70, y: 260 },
    hemi: ['#4a62ff', '#05060f', 0.45], key: ['#9fb4ff', 0.3],
    windows: ['#00f0ff', '#ff2bd6', '#b8ff2e', '#e6ecff'], stars: 1.0, fogDensity: 0.0036,
  },
  dawn: {
    name: 'DAWN',
    zenith: '#1a1440', horizon: '#ffb36b', glow: '#ffd36b', fog: '#7a3a5c',
    body: { kind: 'sun', color: '#ffd84a', size: 150, y: 110 },
    hemi: ['#ffb07a', '#1a1022', 0.7], key: ['#ffcf8a', 0.5],
    windows: ['#fcee0a', '#ff8a3d', '#ff2bd6', '#ffe2b0'], stars: 0, fogDensity: 0.0038,
  },
  outrun: {
    name: 'OUTRUN',
    zenith: '#120828', horizon: '#ff3f8e', glow: '#ff7a59', fog: '#5a1650',
    body: { kind: 'sun', color: '#ffe36b', size: 270, y: 150 },
    hemi: ['#ff5aa0', '#120a1e', 0.55], key: ['#ff9a7a', 0.35],
    windows: ['#fcee0a', '#00f0ff', '#ff2bd6', '#ffb36b'], stars: 0.15, fogDensity: 0.0042,
  },
};

export const WEATHER = {
  clear: { name: 'CLEAR', grip: 1.0, rain: 0, wet: 0.55 },
  // rain: less grip, longer braking, slower traffic, a cooler engine. Tunnels stay dry.
  rain: { name: 'RAIN', grip: 0.82, brake: 0.8, cool: 1.2, traffic: 0.93, rain: 1, wet: 1.0 },
};

export const DIFFICULTY = {
  chill: { name: 'CHILL', density: 0.6, trafficSpeed: 0.9, lives: 5, blurb: 'Light traffic, five hits.' },
  street: { name: 'STREET', density: 1.0, trafficSpeed: 1.0, lives: 4, blurb: 'The intended ride. Four hits; every file repairs one.' },
  redline: { name: 'REDLINE', density: 1.45, trafficSpeed: 1.12, lives: 2, blurb: 'Rush hour. Two hits.' },
};

// Render budgets are in pixels, not device ratios: a 4K laptop and a phone both get a frame they can hold at 60.
// AUTO (default) resolves to BALANCED on desktops and LOW on phones, and steps down to LOW by itself if a machine can't hold the frame rate.
// What each tier turns on (render/post.js):
// Every tier: linear-HDR chain, Neutral tone map, soft-knee bloom, GPU eye adaptation, height haze in the district's colour,
// anisotropic filtering on every mipmapped texture (engine.js), very low grain.
//   LOW       0.6 MP · FXAA · no screen-space reflections (the road keeps its env-map sheen + the streak decals) · no streak
//   BALANCED  1.3 MP · SMAA · wet-road screen-space reflections (decals off) · anamorphic streak on the hottest lights
//   HIGH      2.1 MP · 4× MSAA + SMAA · everything in BALANCED · stronger bloom · buildings drawn to 540 m
// The dynamic-resolution governor (engine.js) scales any tier down to 70% of its budget before AUTO drops to LOW.
export const QUALITY = {
  auto: { name: 'AUTO' },
  low: { name: 'LOW', pixels: 0.6e6, samples: 0, aa: 'fxaa', reflect: 0, streak: false, bloom: 0.3, buildings: 0.6, extras: false, cull: 260 },
  balanced: { name: 'BALANCED', pixels: 1.3e6, samples: 0, aa: 'smaa', reflect: 1, streak: true, bloom: 0.4, buildings: 1, extras: true, cull: 380 },
  high: { name: 'HIGH', pixels: 2.1e6, samples: 4, aa: 'smaa', reflect: 1, streak: true, bloom: 0.5, buildings: 1, extras: true, cull: 540 },
};
export const isPhone = () => typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 820);
export const resolveQuality = (q) => (q === 'auto' || !QUALITY[q] ? (isPhone() ? 'low' : 'balanced') : q);

export const DEFAULT_CONFIG = {
  race: true,
  rash: false,
  car: 'wedge',
  livery: 0,
  glow: 4, // underglow is OFF by default in the TOKYO look (still a garage option)
  time: 'tokyo',
  weather: 'clear',
  difficulty: 'street',
  assist: false,
  effects: 'full', // 'full' | 'reduced' (no shake, no flashes, no tearing)
  quality: 'auto',
  sound: true,
  music: true,
  volume: 0.7,
};

export const SLOGANS = [
  'AUT VIAM INVENIAM', 'SAID ≠ MEANT', 'BRAND IS A MEMORY', 'MEMELORE', 'FIND A WAY',
  'USER JOURNEYS', 'NO FREE LUNCH', 'SHIP IT', 'STAY CURIOUS', 'MAKE ONE', 'MATH-HEAD', 'KEEP DRIVING',
];

// The city's signage (render/tokyo.js). Every shop, bar and company name here is INVENTED (no real brand); the words are real,
// correct Japanese. Rooftop LED boards show SLOGANS (the site's own lines) beside Japanese ads.
export const TOKYO_SIGNS = {
  // vertical blade signs (袖看板): one string, drawn top to bottom
  blades: ['ラーメン', '居酒屋', 'カラオケ', '焼肉', '鮨 汐音', '薬', '喫茶 銀灯', '焼鳥', '餃子', 'バー 蒼', '麻雀', '質',
    'ホテル', '整体', '歯科', '占い', 'そば', '天ぷら', 'おでん', '立呑み', '酒処 朧月', 'パチンコ', '二十四時間', '電脳', '義体', '湯屋', '麺屋 夜鷹', 'スナック'],
  // tenant directory stacks on pencil buildings, one board per floor
  floors: ['スナック 紫苑', '歯科', '雀荘 東風', 'BAR 蒼', 'ネイル', '整体', '占い', '立呑み', '英会話', '鍼灸', 'ラウンジ', 'カラオケ', '居酒屋', '美容室',
    '不動産', 'クラブ 夜光', '中華', 'ダーツ', '漫画喫茶', '義体調整'],
  // horizontal facade boards: [name, small line]
  boards: [['ラーメン 夜鷹', '深夜三時まで'], ['カラオケ', '24時間営業'], ['ドラッグストア', '薬 化粧品'], ['カプセルホテル', '一泊 ¥4,800'],
    ['パチンコ 銀河', 'NEW OPEN'], ['焼肉 炎', '個室あり'], ['牛丼', '24H'], ['まんが喫茶', 'シャワー完備'], ['回転寿司', '汐音'],
    ['両替', 'EXCHANGE'], ['電脳カフェ', 'NET 24H'], ['義体クリニック', '診療中'], ['ホロ占い', '予約不要'], ['ドローン便', '受付 終日'],
    ['居酒屋 灯', '飲み放題'], ['立呑み', '一杯 ¥300']],
  // lit company names on office crowns (invented)
  crowns: [['天穹重工', 'TENKYU'], ['朱鷺生命', 'TOKI LIFE'], ['鏡月製薬', 'KYOGETSU'], ['雲雀電脳', 'HIBARI'], ['青桐システムズ', 'AOGIRI'], ['朧化学', 'OBORO']],
  // rooftop LED boards (Japanese ads; SLOGANS fill the rest)
  roofs: [['夜を走れ', 'RUN THE NIGHT'], ['東京は眠らない', 'TOKYO NEVER SLEEPS'], ['未来は今夜', 'TONIGHT IS THE FUTURE'], ['新型義体 発売中', 'NEW BODY 2066'],
    ['雨の日も24時間', 'OPEN IN THE RAIN']],
  // big translucent holograms (sparingly)
  holos: ['未来', '夜', '東京'],
};
