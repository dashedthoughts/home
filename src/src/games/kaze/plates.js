// KAZE plates: every line of text that appears over the painting goes through here, so there is only ever ONE.
// Pure (no DOM): the renderer draws what plateStep returns; test.mjs runs the same selector headlessly.
// Each plate lives in sim time (2.5 to 4 s by length), fades by itself, can be dismissed by any input once it has been
// readable for 1 s (except fight prompts), and never sits over a fight unless it is a fight prompt or a boss's line.
import { BOSSES } from './data.js';
import { BOSS_LINES, DEATH_LINES, SHRINE_LINE, OPENINGS } from './data.js';
export const HINT = {
  parry: { keys: ['parry'], text: 'Parry on the glint' }, dodge: { keys: ['dodge'], text: 'Red glint: dodge, it cannot be blocked' },
  riposte: { keys: ['slash'], text: 'He is open. Strike now' }, heavy: { keys: ['heavy'], text: 'A heavy cut breaks a guard' },
  focus: { keys: ['focus'], text: 'Hold to face him. Release when he draws' }, wind: { keys: ['wind'], text: 'Ask the wind the way' },
  now: { keys: ['focus'], text: 'Now' }, // [combat] the first standoff's teaching beat: shown as the release window opens
  bow: { keys: ['interact'], text: 'Bow at the shrine to rest' }, jump: { keys: ['up'], text: 'Jump a low sweep' },
};
const PRI = { fight: 5, death: 4, boss: 3, story: 2, prompt: 1 };
export const plateDur = (text) => Math.min(4, Math.max(2.5, 2.5 + text.length / 30));
export function makePlates() { return { act: null, done: new Set(), boss: null, fall: null, shrine: null, sim: null, arena: null, nearVisit: 0, lastNear: null }; }

export function plateStep(m, s, cues, input) {
  if (m.sim !== s) { Object.assign(m, makePlates()); m.sim = s; }
  for (const c of cues || []) {
    if (c.k === 'respawn' || c.k === 'chapter') { m.act = null; m.boss = null; m.fall = null; m.shrine = null; }
    if (c.k === 'blessing') m.shrine = { t0: c.t ?? s.t, n: (m.shrine ? m.shrine.n + 1 : 1) };
    if (c.k === 'kill' && c.boss) m.fall = { t0: c.t ?? s.t, id: c.boss };
  }
  if (s.arena && s.arena.boss && m.arena !== s.arena) { const b = s.foes.find((f) => f.boss); m.boss = b ? { t0: s.t, id: b.boss } : null; }
  m.arena = s.arena;
  const nearKey = s.near && s.phase === 'play' && !s.arena ? s.near.kind + ':' + s.near.ev : null;
  if (nearKey !== m.lastNear) { m.lastNear = nearKey; if (nearKey) m.nearVisit++; }
  // candidates, highest priority first
  const C = [];
  const fight = !!s.arena && s.foes.some((f) => f.st !== 'dead');
  if (s.hint && s.phase !== 'dead' && HINT[s.hint.id]) C.push({ key: 'hint:' + s.hint.id + ':' + Math.round(s.t - s.hint.t), kind: 'fight', keys: HINT[s.hint.id].keys, text: HINT[s.hint.id].text, pos: 'high' });
  if (s.phase === 'standoff' && s.so && s.ch === 0 && s.so.ev === s.ev.findIndex((q) => q.t === 'standoff') /* [combat] only the first standoff carries the prompt */ && !(s.hint && s.hint.id === 'now') /* [combat] the teaching "Now" takes over */ && (s.so.st === 'ready' || s.so.st === 'hold' || s.so.st === 'strike')) C.push({ key: 'so:' + s.so.ev + ':' + s.so.idx + ':' + (s.so.st === 'ready' ? 'r' : 'h'), kind: 'fight', keys: ['focus'], text: s.so.st === 'ready' ? 'Hold to face him' : 'Release when he draws', pos: 'low' });
  if (s.phase === 'dead') C.push({ key: 'death:' + s.stats.deaths, kind: 'death', label: '風', text: DEATH_LINES[(s.stats.deaths + 2) % DEATH_LINES.length], pos: 'mid', dur: 9 });
  if (m.boss && s.arena && s.arena.boss) { const L = BOSS_LINES[m.boss.id].before; for (let k = 0; k < L.length; k++) if (s.t >= m.boss.t0 + 1.2) C.push({ key: 'boss:' + m.boss.id + ':' + m.boss.t0.toFixed(2) + ':' + k, kind: 'boss', label: BOSSES[m.boss.id].jp.slice(-2), text: L[k], pos: 'low', order: k }); }
  if (m.fall && s.t - m.fall.t0 < 4) { const F = BOSS_LINES[m.fall.id].fall; for (let k = 0; k < F.length; k++) C.push({ key: 'fall:' + m.fall.id + ':' + k, kind: 'boss', label: BOSSES[m.fall.id].jp.slice(-2), text: F[k], pos: 'low', dur: F.length > 1 ? 1.4 : 2.6 }); }
  if (m.shrine && s.t - m.shrine.t0 < 4) C.push({ key: 'shrine:' + m.shrine.n + ':' + m.shrine.t0.toFixed(2), kind: 'story', label: '社', text: SHRINE_LINE, pos: 'low' });
  if (s.card && s.card.ch === 0 && s.card.t > 0.9 && s.card.t < 4.3) C.push({ key: 'open0', kind: 'story', label: '竹', text: OPENINGS[0], pos: 'low', dur: 3.4 });
  if (nearKey) C.push({ key: 'near:' + nearKey + ':' + m.nearVisit, kind: 'prompt', near: s.near, keys: ['interact'], text: { bow: 'Bow', sit: 'Sit', take: 'Take the charm' }[s.near.kind], pos: 'near' });
  // a fight is no place for anything but fight prompts and the boss's own lines
  const ok = (c) => !m.done.has(c.key) && (!fight || c.kind === 'fight' || c.kind === 'boss' || c.kind === 'death');
  const best = C.filter(ok).sort((a, b) => PRI[b.kind] - PRI[a.kind] || (a.order || 0) - (b.order || 0))[0] || null;
  // the active plate ends by time, by input once readable, or when something more important arrives
  const a = m.act;
  if (a) {
    const age = s.t - a.t0, still = C.some((c) => c.key === a.key);
    const ended = age > a.dur || !still || (input && age > 1 && a.kind !== 'fight') || (fight && !(a.kind === 'fight' || a.kind === 'boss' || a.kind === 'death'));
    if (ended || (best && best.key !== a.key && PRI[best.kind] > PRI[a.kind])) { m.done.add(a.key); m.act = null; }
  }
  if (!m.act && best && ok(best)) { const born = best.kind === 'story' && best.key.startsWith('shrine') ? m.shrine.t0 : best.kind === 'boss' && best.key.startsWith('fall') ? m.fall.t0 : s.t; const dur = best.dur || plateDur(best.text); if (s.t - born < dur) m.act = Object.assign({}, best, { t0: born, dur }); else m.done.add(best.key); }
  if (!m.act) return null;
  const age = s.t - m.act.t0, alpha = Math.min(1, age / 0.25) * Math.min(1, Math.max(0, (m.act.dur - age) / 0.35));
  return Object.assign({}, m.act, { age, alpha });
}
