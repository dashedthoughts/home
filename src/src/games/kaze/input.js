// KAZE input: keyboard (remappable), gamepad (standard mapping) and touch, merged into one held-state snapshot.
import { DEFAULT_KEYS } from './save.js';
const ACTIONS = Object.keys(DEFAULT_KEYS);
export class Input {
  constructor() { this.latch = {}; this.keys = {}; this.map = JSON.parse(JSON.stringify(DEFAULT_KEYS)); this.touch = {}; this.script = {}; this.mode = 'kb'; this.pad = {}; this.choose = 0; this.onEsc = null; this.capture = null; this.ui = { up: 0, down: 0, confirm: 0 }; }
  setMap(m) { this.map = Object.assign(JSON.parse(JSON.stringify(DEFAULT_KEYS)), m || {}); }
  attach(target) {
    this.kd = (e) => {
      if (this.capture) { e.preventDefault(); this.capture(e.code); return; }
      const c = e.code; this.mode = 'kb';
      if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); this.onEsc && this.onEsc(); return; }
      if (c === 'Digit1' || c === 'Digit2' || c === 'Digit3') this.choose = +c.slice(5);
      if (c === 'Enter' || c === 'NumpadEnter') this.keys.Enter = true;
      if (this.isGameKey(c)) e.preventDefault();
      this.keys[c] = true;
      // [combat] latch the press: a tap that starts and ends between two frames (a slow frame) still reaches the sim once
      for (const a of ACTIONS) if (this.map[a].includes(c)) this.latch[a] = true;
    };
    this.ku = (e) => { this.keys[e.code] = false; if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') this.choose = 0; if (e.code === 'Enter' || e.code === 'NumpadEnter') this.keys.Enter = false; };
    this.blur = () => { this.keys = {}; for (const k in this.touch) this.touch[k] = false; this.mouseParry = false; };
    // right mouse button parries; the context menu is suppressed on the play surface
    this.md = (e) => { if (e.button === 2) { this.mouseParry = true; this.mode = 'kb'; } };
    this.mu = (e) => { if (e.button === 2) this.mouseParry = false; };
    this.cm = (e) => { if (e.target && e.target.tagName === 'CANVAS') e.preventDefault(); };
    target.addEventListener('keydown', this.kd); target.addEventListener('keyup', this.ku); window.addEventListener('blur', this.blur);
    window.addEventListener('mousedown', this.md); window.addEventListener('mouseup', this.mu); window.addEventListener('contextmenu', this.cm);
    this.target = target;
  }
  detach() { if (!this.target) return; this.target.removeEventListener('keydown', this.kd); this.target.removeEventListener('keyup', this.ku); window.removeEventListener('blur', this.blur); window.removeEventListener('mousedown', this.md); window.removeEventListener('mouseup', this.mu); window.removeEventListener('contextmenu', this.cm); }
  isGameKey(c) { if (c === 'Space' || c.startsWith('Arrow')) return true; for (const a of ACTIONS) if (this.map[a].includes(c)) return true; return false; }
  pollPad() {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : []; const p = pads && [...pads].find((x) => x && x.connected);
    const o = this.pad; for (const k in o) o[k] = false; if (!p) return;
    const b = (i) => !!(p.buttons[i] && p.buttons[i].pressed), ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    o.left = ax < -0.35 || b(14); o.right = ax > 0.35 || b(15); o.down = ay > 0.6 || b(13); o.run = Math.abs(ax) > 0.85 || b(10); o.walk = Math.abs(ax) > 0.35 && Math.abs(ax) <= 0.85; // [combat] a light push walks (running is the default)
    o.up = b(0) || b(12); o.dodge = b(1); o.slash = b(2); o.heavy = b(3); o.parry = b(5) || b(7); o.focus = b(6); o.wind = b(4); o.interact = b(0) || b(12); o.heal = b(13) && !(ay > 0.6); o.confirm = b(0);
    o.start = b(9);
    if (p.buttons.some((x) => x && x.pressed) || Math.abs(ax) > 0.4) this.mode = 'pad';
    if (o.start && !this.padStart) this.onEsc && this.onEsc(); this.padStart = o.start;
  }
  snapshot(out) {
    this.pollPad();
    for (const a of ACTIONS) { let v = false; for (const c of this.map[a]) if (this.keys[c]) { v = true; break; } out[a] = v || !!this.pad[a] || !!this.touch[a] || !!this.script[a] || (a === 'parry' && !!this.mouseParry) || !!this.latch[a]; this.latch[a] = false; }
    // [combat] running is the default; the run key (Shift) or a light stick push walks outside a fight
    out.walk = !!(out.run && !this.pad.run) || !!this.pad.walk || !!this.script.walk;
    out.confirm = !!(this.keys.Enter || this.pad.confirm || this.touch.confirm || this.script.confirm);
    out.cancel = !!this.script.cancel;
    out.choose = this.choose || this.script.choose || 0;
    // the shared interact key also works to sit/bow on a pad (A)
    return out;
  }
  labels() {
    if (this.mode === 'pad') return { left: 'LS', right: 'LS', up: 'A', dodge: 'B', slash: 'X', heavy: 'Y', parry: 'RB', focus: 'LT', interact: 'A', wind: 'LB', heal: 'Down' };
    if (this.mode === 'touch') return { up: 'Swipe up', dodge: 'Dodge', slash: 'Cut', heavy: 'Heavy', parry: 'Parry', focus: 'Focus', interact: 'Tap ◎', wind: 'Wind', heal: 'Tap rings' };
    const o = {}; for (const a of ACTIONS) o[a] = keyName(this.map[a][0]); return o;
  }
}
export function keyName(c) {
  if (!c) return '?'; if (c.startsWith('Key')) return c.slice(3); if (c.startsWith('Digit')) return c.slice(5);
  return { Space: 'Space', ShiftLeft: 'Shift', ShiftRight: 'Shift', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ControlLeft: 'Ctrl', AltLeft: 'Alt', Enter: 'Enter', Tab: 'Tab' }[c] || c;
}
export { ACTIONS };
