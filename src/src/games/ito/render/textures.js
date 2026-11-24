// Canvas-drawn textures: vertical neon signs (invented shop names, real Japanese), animated billboard panels,
// onomatopoeia stickers. Everything is drawn at runtime; nothing is downloaded but the page's fonts.
import * as THREE from 'three';

// Invented shop names. Each is a real Japanese word or name pattern; none is a real chain.
export const SHOPS = [
  ['居酒屋', 'とりまる'], ['ラーメン', '星屋'], ['カラオケ', '月夜'], ['喫茶', 'ひなた'],
  ['焼肉', '炎丸'], ['薬局', 'あおば'], ['書店', '青空堂'], ['寿司', '波千鳥'],
  ['ホテル', '銀河'], ['うどん', '麦の音'], ['眼鏡', '光学堂'], ['餃子', '二代目'],
  ['ゲーム', '夜光'], ['整体', 'ほぐし庵'], ['酒', '月見屋'], ['古着', '風見鶏'],
];
const NEON = ['#ff2bd6', '#18e7ff', '#ffe14a', '#ff5a3c', '#b8ff2e', '#ffffff'];

export async function loadFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  const all = SHOPS.flat().join('') + 'シュッドンビュンズザッスタッヒュオ!折り鶴夜を駆けろ眠らない街新発売深夜便受付中急げネオン祭限定百円雨のち晴れ配達中ソーダ';
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`900 64px "Noto Sans JP"`, all), document.fonts.load(`700 64px "Noto Sans JP"`, all), document.fonts.load(`64px "Bangers"`, 'PERFECT CHAIN')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch { /* fall back to whatever is there */ }
}

const JP = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';
// vertical text: the long-vowel mark turns 90 degrees, as on real tategaki signs
function vchar(g, ch, x, y) {
  if (ch === 'ー' || ch === '〜') { g.save(); g.translate(x, y); g.rotate(Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); }
  else g.fillText(ch, x, y);
}

// 8 x 2 atlas of 128 x 512 vertical signs
export function signAtlas() {
  const W = 1024, H = 1024, cw = 128, ch = 512;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#0b0716'; g.fillRect(0, 0, W, H);
  SHOPS.forEach(([kind, name], k) => {
    const x = (k % 8) * cw, y = Math.floor(k / 8) * ch;
    const neon = NEON[k % NEON.length], neon2 = NEON[(k * 3 + 1) % NEON.length];
    const dark = k % 3 === 0;
    // panel
    g.fillStyle = dark ? '#160c2c' : neon;
    g.fillRect(x + 6, y + 6, cw - 12, ch - 12);
    g.lineWidth = 6; g.strokeStyle = dark ? neon : '#160c2c';
    g.strokeRect(x + 9, y + 9, cw - 18, ch - 18);
    // top: the kind of shop, small band
    g.fillStyle = dark ? neon2 : '#160c2c';
    g.fillRect(x + 16, y + 18, cw - 32, 92);
    g.fillStyle = dark ? '#160c2c' : neon;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const kchars = [...kind];
    const ks = Math.min(40, 84 / kchars.length + 12);
    if (kchars.length <= 2) { g.font = `900 ${ks + 8}px ${JP}`; kchars.forEach((ch2, i) => vchar(g, ch2, x + cw / 2, y + 64 - (kchars.length - 1) * 20 + i * 40)); }
    else { g.font = `900 ${Math.min(30, 100 / kchars.length + 4)}px ${JP}`; const step = 84 / kchars.length; kchars.forEach((ch2, i) => vchar(g, ch2, x + cw / 2, y + 26 + step / 2 + i * step)); }
    // name, vertical, big
    const chars = [...name];
    const avail = ch - 150, size = Math.min(92, avail / chars.length - 6);
    g.font = `900 ${size}px ${JP}`;
    g.fillStyle = dark ? neon : '#160c2c';
    if (dark) { g.shadowColor = neon; g.shadowBlur = 14; }
    chars.forEach((ch2, i) => vchar(g, ch2, x + cw / 2, y + 130 + (i + 0.5) * (avail / chars.length)));
    g.shadowBlur = 0;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// 4 x 2 billboard panels, 256 x 160 each
export function screenAtlas() {
  const W = 1024, H = 320, cw = 256, ch = 160;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const panels = [
    { bg: '#ffe14a', fg: '#160c2c', big: '夜を駆けろ', small: 'NIGHT RUN' },
    { bg: '#18e7ff', fg: '#160c2c', big: '眠らない街', small: 'SHINJUKU NISHI' },
    { bg: '#ff2bd6', fg: '#fff6e0', big: '新発売', small: 'ソーダ 限定' },
    { bg: '#160c2c', fg: '#ffe14a', big: '深夜便', small: '受付中 24h' },
    { bg: '#ff5a3c', fg: '#fff6e0', big: '急げ!', small: '配達中' },
    { bg: '#b8ff2e', fg: '#160c2c', big: 'ネオン祭', small: '11.24 SAT' },
    { bg: '#3b1d78', fg: '#18e7ff', big: '雨のち晴れ', small: 'TOKYO 3AM' },
    { bg: '#fff6e0', fg: '#ff2bd6', big: '百円', small: 'ソーダ 冷えてます' },
  ];
  panels.forEach((p, k) => {
    const x = (k % 4) * cw, y = Math.floor(k / 4) * ch;
    g.fillStyle = p.bg; g.fillRect(x, y, cw, ch);
    // printed dots in one corner
    g.fillStyle = p.fg; g.globalAlpha = 0.22;
    for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) { g.beginPath(); g.arc(x + 150 + i * 9, y + 8 + j * 9, (i + j) * 0.22, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = p.fg; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const n = [...p.big].length;
    g.font = `900 ${Math.min(78, 210 / n)}px ${JP}`;
    g.fillText(p.big, x + 14, y + 104);
    g.font = `700 20px ${JP}`;
    g.fillText(p.small, x + 16, y + 140);
    g.fillRect(x + 14, y + 114, cw - 28, 4);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// onomatopoeia stickers: thick ink outline, offset print shadow
export function stickerTexture(text, fill = '#ffe14a', shadow = '#ff2bd6', latin = false) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const size = latin ? 120 : Math.min(150, 420 / Math.max(2, [...text].length) + 40);
  g.font = latin ? `${size}px "Bangers", "Rajdhani", sans-serif` : `900 ${size}px ${JP}`;
  g.translate(256, 132); g.rotate(-0.08);
  g.lineJoin = 'round';
  g.lineWidth = 26; g.strokeStyle = shadow; g.strokeText(text, 10, 10);
  g.fillStyle = shadow; g.fillText(text, 10, 10);
  g.lineWidth = 22; g.strokeStyle = '#140a2a'; g.strokeText(text, 0, 0);
  g.fillStyle = fill; g.fillText(text, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

// the courier's pack decal: an invented knot mark and 糸
export function packTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#ff2bd6'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#fff6e0'; g.fillRect(0, 50, 128, 14);
  g.fillStyle = '#140a2a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 64px ${JP}`; g.fillText('糸', 64, 60);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}
