// NEON KUMITE · input: keyboard (remappable), gamepads (standard mapping) and touch, folded into the sim's bitmask.
import { B } from './sim.js';
export const ACTIONS = ['up', 'down', 'left', 'right', 'light', 'heavy', 'special'];
export const ACTION_LABEL = { up: 'Up / jump', down: 'Down / crouch', left: 'Left', right: 'Right', light: 'Light', heavy: 'Heavy', special: 'Special' };
const BIT = { up: B.U, down: B.D, left: B.L, right: B.R, light: B.LP, heavy: B.HP, special: B.SP };
export const DEFAULT_KEYS = [
  { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], light: ['KeyJ'], heavy: ['KeyK'], special: ['KeyL'] },
  { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], light: ['Numpad1', 'Comma'], heavy: ['Numpad2', 'Period'], special: ['Numpad3', 'Slash'] },
];
export function keyName(code) {
  if (!code) return '-';
  return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace('Arrow', '').replace('Comma', ',').replace('Period', '.').replace('Slash', '/').replace('Semicolon', ';');
}
export function createInput() {
  const down = new Set();
  const I = {
    keys: JSON.parse(JSON.stringify(DEFAULT_KEYS)), touch: 0, pads: [null, null], padBits: [0, 0], padPrev: [0, 0], override: [null, null], start: [false, false],
    onKey(e, isDown) { if (isDown) down.add(e.code); else down.delete(e.code); },
    clear() { down.clear(); I.touch = 0; },
    isDown: (c) => down.has(c),
    claims(code) { return I.keys.some((m) => ACTIONS.some((a) => m[a].includes(code))); },
    bits(p) {
      if (I.override[p] != null) return I.override[p];
      let b = 0; const m = I.keys[p];
      for (const a of ACTIONS) for (const c of m[a]) if (down.has(c)) b |= BIT[a];
      b |= I.padBits[p];
      if (p === 0) b |= I.touch;
      if ((b & B.L) && (b & B.R)) b &= ~(B.L | B.R); // SOCD: neutral on left+right
      if ((b & B.U) && (b & B.D)) b &= ~B.D;
      return b;
    },
    pollPads(humanSides) {
      // pads are handed to human players in order: first pad → first human side
      I.padBits = [0, 0]; I.start = [false, false];
      const gps = (navigator.getGamepads ? [...navigator.getGamepads()] : []).filter((g) => g && g.connected);
      humanSides.forEach((side, k) => {
        const g = gps[k]; if (!g) return;
        const bt = (i) => g.buttons[i] && g.buttons[i].pressed; const ax = (i) => g.axes[i] || 0;
        let b = 0;
        if (bt(12) || ax(1) < -0.5) b |= B.U; if (bt(13) || ax(1) > 0.5) b |= B.D; if (bt(14) || ax(0) < -0.5) b |= B.L; if (bt(15) || ax(0) > 0.5) b |= B.R;
        if (bt(2)) b |= B.LP; if (bt(3)) b |= B.HP; if (bt(1)) b |= B.SP;
        if (bt(0) || bt(4)) b |= B.LP | B.HP; if (bt(5)) b |= B.SP | B.HP; if (bt(7) || bt(6)) b |= B.LP | B.HP | B.SP;
        I.padBits[side] = b; I.start[side] = !!bt(9);
      });
      return gps.length;
    },
  };
  return I;
}
