// KAZE score, written as data. One theme, re-orchestrated per chapter, played as stems on one bar clock.
// Notes are names (D4, Eb4...), durations in beats, 4 beats to the bar. No DOM, no audio here: audio.js plays it,
// test.mjs checks it (stems complete, loops whole, notes in scale, gain under clipping).
export const SCALES = {
  in: ['D', 'Eb', 'G', 'A', 'Bb'],      // in-sen (miyako-bushi) on D: the calm theme
  iwato: ['D', 'Eb', 'G', 'Ab', 'C'],   // the darker mode for boss duels
};
const SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
export function freq(n) { const m = /^([A-G][b#]?)(\d)$/.exec(n); const midi = 12 * (+m[2] + 1) + SEMI[m[1]]; return 440 * Math.pow(2, (midi - 69) / 12); }
export const pitchClass = (n) => /^([A-G][b#]?)/.exec(n)[1];

// The theme: 16 bars, A A' B A''. [note | null for rest, beats]
export const THEME = [
  ['A4', 2], ['Bb4', 1], ['A4', 1], ['G4', 3], [null, 1], ['Eb4', 1], ['G4', 1], ['A4', 2], ['D4', 4],
  ['A4', 2], ['Bb4', 1], ['D5', 1], ['Eb5', 3], ['D5', 1], ['Bb4', 1], ['A4', 1], ['G4', 2], ['A4', 4],
  ['D5', 2], ['Eb5', 2], ['D5', 1], ['Bb4', 1], ['A4', 2], ['G4', 2], ['A4', 1], ['Bb4', 1], ['A4', 3], [null, 1],
  ['A4', 2], ['Bb4', 1], ['A4', 1], ['G4', 2], ['Eb4', 2], ['G4', 1], ['A4', 1], ['G4', 1], ['Eb4', 1], ['D4', 4],
];
// map a note from the in scale to the same degree of another scale (for the darker boss statement)
export function remap(n, scale) { if (!n) return n; const pc = pitchClass(n), i = SCALES.in.indexOf(pc), o = n.slice(pc.length); return SCALES[scale][i] + o; }
const oct = (n, d) => (n ? n.replace(/\d$/, (o) => String(+o + d)) : n);
// split a note list into bars of 4 beats: [[beat, note, dur], ...] per bar
function toBars(seq, bars) {
  const out = Array.from({ length: bars }, () => []); let t = 0;
  for (const [n, d] of seq) { const b = Math.floor(t / 4); if (n && b < bars) out[b].push([t - b * 4, n, d]); t += d; }
  return out;
}
const rep = (bar, n) => Array.from({ length: n }, () => bar.map((e) => e.slice()));
const BAR_ROOTS = ['D', 'G', 'D', 'D', 'D', 'Eb', 'G', 'A', 'D', 'G', 'A', 'A', 'D', 'G', 'Eb', 'D'];
const triad = { D: ['D3', 'A3', 'D4', 'G4'], G: ['G2', 'D3', 'G3', 'Bb3'], Eb: ['Eb3', 'Bb3', 'Eb4', 'G4'], A: ['A2', 'Eb3', 'A3', 'D4'] };
function arps(density, octave = 0) { return BAR_ROOTS.map((r) => { const t = triad[r]; const ev = density === 2 ? [[0, t[0], 1], [1, t[1], 1], [2, t[2], 1], [3, t[3], 1]] : density === 1 ? [[0, t[0], 2], [2, t[2], 2]] : [[0, t[0], 4]]; return ev.map(([b, n, d]) => [b, oct(n, octave), d]); }); }
function bass() { return BAR_ROOTS.map((r) => [[0, triad[r][0].replace(/\d/, '2'), 1], [1, 'A2', 1], [2, triad[r][1].replace(/\d/, '2'), 1], [3, 'A2', 1]]); }

// Instruments and their peak gains (used by the clipping check and by audio.js)
export const INSTR = { flute: 0.06, pluck: 0.065, bass: 0.07, drone: 0.045, pad: 0.03, glass: 0.025, taiko: 0.11, click: 0.04, bell: 0.04, heart: 0.1 };

// Chapter orchestrations of the calm state; every stem is 16 bars
function calm(key) {
  const mel = toBars(THEME, 16);
  const S = {
    bamboo: { flute: mel.map((b) => b.map(([t, n, d]) => [t, oct(n, 1), d])), pluck: arps(1, 1), click: rep([[1, 'D5', 0.25], [3, 'D5', 0.25]], 16), drone: rep([[0, 'D3', 4]], 16) },
    terraces: { flute: mel, pluck: arps(2), bass: bass(), drone: rep([[0, 'D2', 4]], 16), pad: rep([[0, 'A3', 4]], 16) },
    torii: { flute: mel.map((b, i) => (i % 4 === 3 ? [] : b)), drone: rep([[0, 'D2', 4]], 16), bell: BAR_ROOTS.map((r, i) => (i % 2 === 0 ? [[0, oct(triad[r][2], 1), 4]] : [])), pluck: arps(0) },
    snow: { flute: mel.map((b, i) => (Math.floor(i / 4) % 2 === 1 ? [] : b.map(([t, n, d]) => [t, oct(n, 1), d]))), glass: rep([[0, 'D6', 4]], 16), drone: rep([[0, 'D3', 4]], 16) },
    castle: { flute: mel, pluck: arps(2), bass: bass(), drone: rep([[0, 'D2', 4]], 16), pad: rep([[0, 'A3', 4]], 16), bell: BAR_ROOTS.map((r, i) => (i % 4 === 0 ? [[0, triad[r][2], 4]] : [])), click: rep([[2, 'D5', 0.25]], 16) },
  };
  return S[key];
}
// Fight: taiko and a driving ostinato, the melody reduced to fragments (4-bar loop)
function fight() {
  const frag = toBars(THEME.slice(0, 3), 4);
  return { taiko: rep([[0, 'D2', 1], [1.5, 'D2', 0.5], [2, 'D2', 1], [3, 'D2', 0.5], [3.5, 'D2', 0.5]], 4), pluck: rep([[0, 'D3', 0.5], [0.5, 'A3', 0.5], [1, 'D4', 0.5], [1.5, 'A3', 0.5], [2, 'D3', 0.5], [2.5, 'A3', 0.5], [3, 'Eb4', 0.5], [3.5, 'A3', 0.5]], 4), flute: [frag[0], [], [], []], drone: rep([[0, 'D2', 4]], 4) };
}
// Standoff: wind, a heartbeat, one held note (2-bar loop)
function standoff() { return { heart: rep([[0, 'D2', 0.5], [0.6, 'D2', 0.5]], 2), flute: [[[0, 'A4', 8]], []] }; }
// Boss: the theme in the darker mode, low, with heavy taiko (16 bars); phase 2 doubles the drums
function boss(phase2) {
  const mel = toBars(THEME.map(([n, d]) => [n ? oct(remap(n, 'iwato'), -1) : null, d]), 16);
  const tk = phase2 ? [[0, 'D2', 1], [0.5, 'D2', 0.5], [1, 'D2', 1], [2, 'D2', 1], [2.5, 'D2', 0.5], [3, 'D2', 0.5], [3.5, 'D2', 0.5]] : [[0, 'D2', 1], [2, 'D2', 1], [3, 'D2', 0.5]];
  return { flute: mel, taiko: rep(tk, 16), drone: rep([[0, 'D2', 4]], 16), pluck: rep([[0, 'D3', 1], [1, 'Ab3', 1], [2, 'D3', 1], [3, 'C4', 1]], 16) };
}
// Victory: the phrase resolves (2 bars, then back to calm); ending: the full theme once, simply
function victory() { return { flute: [[[0, 'A4', 1], [1, 'G4', 1], [2, 'Eb4', 2]], [[0, 'D4', 4]]], pluck: [[[0, 'D4', 4]], [[0, 'D3', 4]]] }; }
function ending() { return { flute: toBars(THEME, 16), drone: rep([[0, 'D3', 4]], 16), pluck: arps(0) }; }

export const CH_KEYS = ['bamboo', 'terraces', 'torii', 'snow', 'castle'];
export const TEMPO = { bamboo: 76, terraces: 72, torii: 60, snow: 66, castle: 72 };
export const SCORE = {};
for (const k of CH_KEYS) SCORE[k] = { calm: calm(k), fight: fight(), standoff: standoff(), boss: boss(false), boss2: boss(true), victory: victory(), ending: ending() };
export const STATE_SCALE = { calm: 'in', fight: 'in', standoff: 'in', victory: 'in', ending: 'in', boss: 'iwato', boss2: 'iwato' };
export const loopBars = (state) => Object.values(SCORE.bamboo[state])[0].length;
// the bar clock: the time of the next bar line at or after t
export function nextBar(t, t0, barDur) { const n = Math.ceil((t - t0) / barDur - 1e-9); return t0 + n * barDur; }
