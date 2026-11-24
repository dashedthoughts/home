// KAZE persistence. Every key starts with nc2: and every access is wrapped: storage can be missing or full.
const K = { prog: 'nc2:kaze:progress', haiku: 'nc2:kaze:haiku', set: 'nc2:kaze:settings' };
export const DEFAULT_KEYS = { left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], run: ['ShiftLeft', 'ShiftRight'], dodge: ['Space'], slash: ['KeyJ'], heavy: ['KeyK'], parry: ['KeyL'], focus: ['KeyF'], interact: ['KeyE'], wind: ['KeyQ'], heal: ['KeyR'] };
export const DEFAULT_SETTINGS = { difficulty: 'blade', volume: 0.7, music: 0.8, sfx: 0.9, muted: false, reduced: null, keys: null };
export const DEFAULT_PROGRESS = { chapter: 0, checkpoint: 0, maxChapter: 0, resMax: 3, charms: [], hidden: [], finished: false, lethal: false, difficulty: 'blade' };
function read(st, k, def) { try { const v = st && st.getItem(k); if (!v) return clone(def); const o = JSON.parse(v); return Array.isArray(def) ? (Array.isArray(o) ? o : clone(def)) : Object.assign(clone(def), o); } catch (e) { return clone(def); } }
function write(st, k, v) { try { st && st.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const clone = (o) => JSON.parse(JSON.stringify(o));
const store = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; } };
export function makeStore(st = store()) {
  return {
    progress: () => read(st, K.prog, DEFAULT_PROGRESS), saveProgress: (p) => write(st, K.prog, p),
    haiku: () => read(st, K.haiku, []), saveHaiku: (list) => write(st, K.haiku, list.slice(-60)),
    settings: () => read(st, K.set, DEFAULT_SETTINGS), saveSettings: (s) => write(st, K.set, s),
    clearProgress: () => { try { st && st.removeItem(K.prog); } catch (e) { /* ignore */ } },
  };
}
