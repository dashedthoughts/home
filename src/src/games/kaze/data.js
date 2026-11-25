// KAZE data: chapters, foes, attacks, difficulty, haiku and narration. Shared by sim and renderer. No DOM.
export const DIFF = {
  // react: the minimum telegraph (seconds from glint to the hit frame) any attack may have on this difficulty.
  story: { id: 'story', name: 'Story', hp: 6, parry: 0.26, react: 0.55, wind: 1.3, standoff: 0.62, feint: 0.6, aggr: 0.7, dmg: 1, rec: 1.15, guard: 5, chip: 0 },
  blade: { id: 'blade', name: 'Blade', boss2: 2, heal: 1, rec: 0.85, guard: 3, chip: 1, hp: 4, parry: 0.17, react: 0.4, wind: 1, standoff: 0.42, feint: 1, aggr: 1.35, dmg: 1 },
  lethal: { id: 'lethal', name: 'Lethal', hp: 3, parry: 0.13, react: 0.3, wind: 0.82, standoff: 0.3, feint: 1.4, aggr: 1.3, dmg: 2, rec: 0.75, guard: 2, chip: 1, heal: 1 },
};

// wind: telegraph seconds (glint to hit), act: hit frames, rec: recovery, reach in px, red: unblockable (dodge or jump),
// low: a sweep you can jump, dash: lunge distance during the hit, next: combo follow-up (it gets its own telegraph).
export const ATK = {
  cut: { wind: 0.55, act: 0.12, rec: 0.6, reach: 96, dmg: 1 },
  combo: { wind: 0.55, act: 0.12, rec: 0.22, reach: 96, dmg: 1, next: 'cut2' },
  cut2: { wind: 0.44, act: 0.12, rec: 0.65, reach: 100, dmg: 1 },
  thrust: { wind: 0.6, act: 0.14, rec: 0.75, reach: 168, dmg: 1 },
  dthrust: { wind: 0.55, act: 0.12, rec: 0.25, reach: 168, dmg: 1, next: 'thrust' },
  lunge: { wind: 0.75, act: 0.22, rec: 1.0, reach: 120, dash: 140, dmg: 2, red: 1 },
  sweep: { wind: 0.7, act: 0.16, rec: 0.85, reach: 175, dmg: 1, red: 1, low: 1 },
  shoot: { wind: 0.85, act: 0.06, rec: 0.95, arrow: 540, dmg: 1 },
  overhead: { wind: 0.85, act: 0.14, rec: 0.95, reach: 118, dmg: 2 },
  bash: { wind: 0.65, act: 0.16, rec: 0.85, reach: 96, dmg: 1, red: 1, push: 170 },
  flurry: { wind: 0.5, act: 0.1, rec: 0.18, reach: 96, dmg: 1, next: 'flurry2' },
  flurry2: { wind: 0.44, act: 0.1, rec: 0.18, reach: 96, dmg: 1, next: 'flurry3' },
  flurry3: { wind: 0.46, act: 0.12, rec: 0.75, reach: 104, dmg: 1 },
  rthrust: { wind: 0.65, act: 0.16, rec: 0.85, reach: 110, dash: 80, dmg: 1, red: 1 },
};

// Foe archetypes. moves: weighted picks. block: chance to guard a quick slash. shield: front guard only a heavy breaks.
export const FOES = {
  bandit: { hp: 4, w: 30, speed: 105, range: 88, block: 0.22, moves: [['cut', 3], ['combo', 2]] },
  spear: { hp: 4, w: 30, speed: 85, range: 150, block: 0.1, moves: [['thrust', 3], ['lunge', 1]] },
  archer: { hp: 2, w: 28, speed: 95, range: 420, keep: [280, 470], block: 0, moves: [['shoot', 1]] },
  brute: { hp: 5, w: 42, speed: 64, range: 96, block: 0, shield: 1, armor: 1, moves: [['overhead', 3], ['bash', 2]] },
  duelist: { hp: 5, w: 30, speed: 125, range: 92, block: 0.4, feint: 0.3, moves: [['cut', 2], ['flurry', 2], ['rthrust', 1]] },
};

export const BOSSES = {
  gonroku: { jp: '竹割りの権六', name: 'Gonroku the Bamboo-Splitter', look: 'bandit', hp: 9, boss2: 1.5, w: 32, speed: 120, range: 92, block: 0.28,
    p1: [['cut', 5], ['combo', 1]], p2: [['combo', 2], ['flurry', 2], ['lunge', 2]], feint: [0, 0.12] },
  ono: { jp: '案山子の大野', name: 'Ōno the Scarecrow', look: 'spear', hp: 13, w: 32, speed: 95, range: 150, block: 0.15,
    p1: [['thrust', 3], ['sweep', 2]], p2: [['dthrust', 2], ['lunge', 2], ['sweep', 2], ['thrust', 1]], feint: [0.08, 0.2] },
  shizu: { jp: '門番の静', name: 'Shizu the Gatekeeper', look: 'duelist', hp: 14, w: 30, speed: 140, range: 92, block: 0.4,
    p1: [['cut', 2], ['flurry', 2], ['combo', 1]], p2: [['flurry', 2], ['rthrust', 2], ['combo', 2]], feint: [0.3, 0.5] },
  hyoe: { jp: '灯籠の兵衛', name: 'Hyōe of the Lanterns', look: 'brute', hp: 15, w: 44, speed: 70, range: 100, block: 0, armor: 1,
    p1: [['overhead', 3], ['bash', 1], ['sweep', 1]], p2: [['overhead', 2], ['bash', 2], ['combo', 2]], shieldP2: 1, feint: [0, 0.1] },
  sotetsu: { jp: '早瀬宗鉄', name: 'Hayase Sōtetsu', look: 'master', hp: 18, w: 30, speed: 135, range: 94, block: 0.42,
    p1: [['cut', 2], ['combo', 2], ['rthrust', 1], ['thrust', 1]], p2: [['flurry', 3], ['lunge', 2], ['sweep', 1], ['overhead', 1]], feint: [0.3, 0.55] },
};

// Ground profiles are [x, height] (height up, px). Events are triggered as the ronin reaches them.
export const CHAPTERS = [
  {
    id: 1, key: 'bamboo', jp: '竹の朝', en: 'Bamboo Morning', accent: '#8fae74', paper: '#efe8d5', ground: 'grass', len: 6600, wind: 0.45,
    groundPts: [[0, 0], [1500, 10], [2400, -10], [3300, 20], [4200, 46], [4750, 46], [5200, 20], [6600, 20]],
    ev: [
      { t: 'shrine', x: 300 }, { t: 'fight', x: 1250, foes: ['bandit'] }, { t: 'hidden', x: 2050, id: 'c1h' },
      { t: 'fight', x: 2750, foes: ['bandit', 'bandit'] }, { t: 'standoff', x: 3450, foes: ['bandit'], feints: [0, 0] },
      { t: 'shrine', x: 3950 }, { t: 'haiku', x: 4480 }, { t: 'fight', x: 5100, foes: ['bandit', 'archer'] },
      { t: 'shrine', x: 5700 }, { t: 'boss', x: 6150, boss: 'gonroku' },
    ],
  },
  {
    id: 2, key: 'terraces', jp: '黄金の棚田', en: 'Golden Terraces', accent: '#c8963a', paper: '#f0e3c6', ground: 'earth', len: 6900, wind: 0.35,
    groundPts: [[0, 0], [800, 0], [900, -22], [1700, -22], [1800, -44], [2600, -44], [2700, -22], [3600, -22], [3700, 0], [4800, 0], [4900, 22], [6900, 22]],
    ev: [
      { t: 'shrine', x: 260 }, { t: 'fight', x: 1150, foes: ['spear'] },
      { t: 'fox', x: 1950, path: [2280, 2620], id: 'fox1' },
      { t: 'fight', x: 3050, foes: ['bandit', 'spear'] }, { t: 'standoff', x: 3650, foes: ['bandit', 'bandit'], feints: [0, 1] },
      { t: 'shrine', x: 4150 }, { t: 'haiku', x: 4620 }, { t: 'fight', x: 5300, foes: ['spear', 'archer'] },
      { t: 'shrine', x: 5950 }, { t: 'boss', x: 6420, boss: 'ono' },
    ],
  },
  {
    id: 3, key: 'torii', jp: '千の鳥居', en: 'A Thousand Gates', accent: '#c4442b', paper: '#ece8de', ground: 'stone', len: 6900, wind: 0.3,
    groundPts: [[0, 0], [600, 0], [1400, 120], [1850, 120], [2600, 250], [3050, 250], [3800, 370], [4350, 370], [5100, 480], [6600, 480], [6900, 480]],
    ev: [
      { t: 'shrine', x: 250 }, { t: 'fight', x: 950, foes: ['archer', 'bandit'] }, { t: 'hidden', x: 1650, id: 'c3h' },
      { t: 'fight', x: 2250, foes: ['brute'] }, { t: 'standoff', x: 2850, foes: ['bandit', 'duelist'], feints: [1, 2] },
      { t: 'shrine', x: 3250 }, { t: 'haiku', x: 4100 }, { t: 'fight', x: 4800, foes: ['brute', 'archer'] },
      { t: 'shrine', x: 5450 }, { t: 'boss', x: 5980, boss: 'shizu' },
    ],
  },
  {
    id: 4, key: 'snow', jp: '雪の峠', en: 'The Snow Pass', accent: '#6d8fb4', paper: '#e7e6e1', ground: 'snow', len: 7000, wind: 0.75,
    groundPts: [[0, 0], [1000, 30], [2000, 10], [3000, 60], [4000, 40], [5000, 80], [6000, 60], [7000, 60]],
    ev: [
      { t: 'shrine', x: 250 }, { t: 'fight', x: 1000, foes: ['bandit', 'bandit'] },
      { t: 'fox', x: 1700, path: [2020, 2380], id: 'fox2' },
      { t: 'fight', x: 2800, foes: ['brute', 'bandit'] }, { t: 'standoff', x: 3450, foes: ['bandit', 'spear', 'duelist'], feints: [1, 2] },
      { t: 'shrine', x: 3950 }, { t: 'haiku', x: 4450 }, { t: 'fight', x: 5250, foes: ['duelist', 'archer'] },
      { t: 'shrine', x: 6000 }, { t: 'boss', x: 6500, boss: 'hyoe' },
    ],
  },
  {
    id: 5, key: 'castle', jp: '暁の城', en: 'Castle at Daybreak', accent: '#d48a9c', paper: '#f1e7e0', ground: 'wood', len: 6700, wind: 0.4,
    groundPts: [[0, 0], [1900, 0], [2300, 14], [4200, 30], [6200, 14], [6700, 14]],
    bridge: [2200, 6500],
    ev: [
      { t: 'shrine', x: 260 }, { t: 'fight', x: 950, foes: ['duelist', 'bandit'] }, { t: 'standoff', x: 1750, foes: ['duelist', 'duelist', 'duelist'], feints: [2, 3] },
      { t: 'shrine', x: 2350 }, { t: 'fight', x: 3100, foes: ['brute', 'archer'] }, { t: 'haiku', x: 3900 },
      { t: 'shrine', x: 4700 }, { t: 'boss', x: 5600, boss: 'sotetsu' },
    ],
  },
];

export function groundH(ch, x) {
  const P = CHAPTERS[ch].groundPts;
  if (x <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const a = P[i - 1], b = P[i], t = (x - a[0]) / (b[0] - a[0]), u = t * t * (3 - 2 * t); return a[1] + (b[1] - a[1]) * u; }
  return P[P.length - 1][1];
}

// The through-line: years ago you took the old master's sword and left. Tonight the wind turned and you walk home.
// The people on the road are old friends he asked to stand in your way; none of them wants to stop you. At the end the
// master never mentions the sword. He asks whether you have eaten.
export const PROLOGUE = [
  'You took the old man\'s sword the autumn the persimmons fell early.',
  'The wind has been at your back ever since.',
  'Tonight it turned. Go home.',
];
export const OPENINGS = [
  'The bamboo is taller than when you left. It did not wait for you.',
  'Someone has kept the paddies full. The frogs are louder than your footsteps.',
  'A thousand gates, and somebody sweeps every one. You used to help.',
  'Snow keeps every footprint until morning. Yours only go one way.',
  'The cherry by the well has flowered. Nobody told it to.',
];
// kept for the narration screen: prologue first, then the opening of the chapter you are walking into
export const NARRATION = [PROLOGUE.join(' '), ...OPENINGS.slice(1)];
export const ENDING = [
  'He never asked for the sword.',
  'He asked whether you had eaten.',
  'Outside, the wind went on north without you. You let it.',
];
export const DEATH_LINES = [
  'The grass is soft here. Get up when you\'re ready.',
  'The wind waited. It will wait again.',
  'Breathe. The road has not gone anywhere.',
];
export const SHRINE_LINE = 'Someone left rice here. Rest.';
// What each of them says before the duel, and as they fall.
export const BOSS_LINES = {
  gonroku: { before: ['You\'ve gone thin. Did no one in the city feed you?', 'The master asked me to stand in the road. So I am standing in it.'], fall: ['Ha. Still quick. Eat something before the pass.'] },
  ono: { before: ['Mind the seedlings. I only finished this row today.', 'Walk around me, boy. Or walk through.'], fall: ['Go on. I\'ll tell them the crows took the scarecrow.'] },
  shizu: { before: ['You left your sandals at this gate. I kept them out of the rain.', 'They won\'t fit you now.'], fall: ['Then go barefoot. The stones remember you.'] },
  hyoe: { before: ['I lit this lantern the night you ran.', 'I have trimmed the wick forty times since.'], fall: ['Take it. The dark up there is the honest kind.'] },
  sotetsu: { before: ['You\'re late. The tea went cold years ago.', 'Show me what the sword taught you. Then show me what it didn\'t.'], fall: ['There. Now your hands are empty.', 'Hold them out. It\'s starting to rain.'] },
};

// Haiku spots: three lines, three choices each (5, 7, 5 syllables). Title in Japanese.
export const HAIKU = [
  { jp: '竹の声', en: 'Voice of the bamboo', lines: [
    ['Bamboo creaks at dawn', 'Dew on my sandals', 'A broom somewhere near'],
    ['someone is sweeping the path', 'the old fence I mended once', 'a sparrow eats from my hand'],
    ['I know this place still', 'my feet remember', 'it did not wait up'] ] },
  { jp: '稲穂', en: 'Ears of rice', lines: [
    ['A frog on the dike', 'Wet sandals, cold feet', 'Rice up to my knees'],
    ['smoke from a kitchen downhill', 'the water keeps the last light', 'an old man calls in his ox'],
    ['someone\'s making soup', 'nobody looks up', 'I walk a bit slow'] ] },
  { jp: '霧', en: 'Mist', lines: [
    ['The sound of a broom', 'Red gates in the mist', 'Stone steps, worn in two'],
    ['a girl sweeps leaves off the stairs', 'an offering of two plums', 'my breath and the mist are one'],
    ['I used to do that', 'the fox statue grins', 'the gods are asleep'] ] },
  { jp: '雪明かり', en: 'Snow light', lines: [
    ['Snow on the lantern', 'Cold rice in my hands', 'A crow on the post'],
    ['someone trimmed the wick for me', 'my footprints fill as I go', 'a dog barks once and gives up'],
    ['the pass is quiet', 'my ears hurt with cold', 'I eat the rice cold'] ] },
  { jp: '朝焼け', en: 'Morning glow', lines: [
    ['Petals in the well', 'Rain on the old roof', 'Tea steam at sunrise'],
    ['two cups set out on the step', 'my hands smell of oil and rain', 'someone has swept the doorway'],
    ['I am home, I think', 'nothing in my hands', 'the wind goes on north'] ] },
];

export const CHARMS = {
  fox1: { name: 'Fox charm of the fields', jp: '狐の守り', effect: 'Parry window a little wider.' },
  fox2: { name: 'Fox charm of the snow', jp: '雪狐の守り', effect: 'Healing restores one more.' },
};
