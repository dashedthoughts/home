// MACHI core tests: node src/games/machi/test.mjs
import { World } from './core/world.js';
import { ID, OPAQUE, BLOCKS, SHAPE, PALETTE_ORDER } from './core/blocks.js';
import { meshRegion, meshChunk, FACES } from './core/mesher.js';
import { tokyo, flatPark, emptyLot, randomDistrict, rng, GY } from './core/gen.js';
import { GLYPHS } from './core/glyphs.js';
import { encodeWorld, decodeWorld, parseImport } from './core/save.js';
import { Editor } from './core/editor.js';
import { buildStamps, letterStamp } from './core/stamps.js';
import { Walker, overlapsSolid } from './core/walker.js';

let fails = 0, passes = 0;
const ok = (c, msg) => { if (c) passes++; else { fails++; console.log('  FAIL', msg); } };
const section = (s) => console.log('\n' + s);
const eqArr = (a, b) => { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };
const hash = (a) => { let h = 2166136261; for (let i = 0; i < a.length; i++) { h ^= a[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
const count = (w, box, ids) => { const [x0, y0, z0, x1, y1, z1] = box; const set = new Set([].concat(ids).map((k) => ID[k])); let n = 0; for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (set.has(w.get(x, y, z))) n++; return n; };

// ---------------------------------------------------------------
section('1. Default world: deterministic, with its landmarks');
const t0 = performance.now();
const A = tokyo(1977), B = tokyo(1977), C = tokyo(42);
console.log(`  tokyo() built and lit in ${((performance.now() - t0) / 3).toFixed(0)} ms (avg), hash ${hash(A.blocks).toString(16)}`);
ok(eqArr(A.blocks, B.blocks) && eqArr(A.light, B.light), 'same seed gives identical voxels and light');
ok(!eqArr(A.blocks, C.blocks), 'different seed gives a different world');
const LM = A.meta.landmarks;
for (const k of ['shotengai', 'canal', 'bridge', 'shrine', 'honden', 'torii', 'ramen', 'konbini', 'rooftop', 'snack', 'karaoke', 'sento', 'bookshop', 'izakaya', 'vending', 'kissa', 'oldhouse', 'viaduct', 'lanterns', 'kei']) ok(Array.isArray(LM[k]), `landmark ${k} recorded`);
ok(count(A, LM.torii, 'vermilion') >= 25 && count(A, LM.torii, 'black') >= 12, `torii is vermilion and black (${count(A, LM.torii, 'vermilion')} vermilion)`);
ok(count(A, LM.shrine, 'sakura') >= 800, `big sakura in the shrine (${count(A, LM.shrine, 'sakura')} blossom voxels)`);
ok(count(A, LM.shrine, 'paperlamp') >= 4, 'stone lanterns are lit');
ok(count(A, LM.canal, 'water') === 96 * 8, `canal holds a full layer of water (${count(A, LM.canal, 'water')})`);
ok(count(A, LM.bridge, 'vermilion') >= 16 && count(A, LM.bridge, 'wood') >= 60, 'arched bridge with vermilion parapets and a wooden deck');
ok(count(A, LM.viaduct, 'rail') >= 96 * 8 && A.meta.train && A.meta.train.axis === 'z', 'viaduct carries a rail bed and a train line');
ok(count(A, LM.viaduct, 'brick') > 2000, 'brick arches under the viaduct');
ok(count(A, LM.vending, 'screen') === 6, 'three vending machines with glowing screens');
ok(count(A, LM.lanterns, ['lantern', 'paperlamp']) >= 27, 'lantern strings across the shotengai');
ok(count(A, LM.rooftop, 'tank') >= 48 && count(A, LM.rooftop, 'grass') >= 10, 'rooftop garden with a water tank');
ok(count(A, LM.kei, 'kei') >= 20, 'parked kei truck');
ok(count(A, [14, 44, 60, 15, 45, 61], 'brick') === 8 && A.get(15, 46, 60) === ID.neonred, 'sento chimney with its warning light');
ok(count(A, LM.konbini, 'konbini') >= 20, 'konbini glows');
for (const k of ['neonpink', 'neoncyan', 'neonred', 'neonamber', 'neongreen', 'neonblue']) ok(count(A, [0, 0, 0, 95, 47, 95], k) > 0, `neon colour ${k} is used`);
ok(A.meta.wires.length >= 20, `power lines and lantern wires (${A.meta.wires.length})`);
// signs: the glyph voxels must be exactly the authored glyphs
const checkGlyph = (ch, at, neon) => { const g = GLYPHS[ch]; for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) { const [x, y, z] = at(c, r); const on = A.get(x, y, z) === ID[neon]; if (on !== (g[r][c] === '#')) return false; } return true; };
// ラーメン: plate top-left x=34, y=45, z=40, one-voxel frame; glyphs 7 wide stacked with 1 gap
const ramenTop = A.meta.landmarks.ramen[4] - 3; // plate top is roof-2, glyphs start one below
ok(checkGlyph('ラ', (c, r) => [35 + c, ramenTop - r, 40], 'neonred'), 'ラ on the ramen sign is legible voxel for voxel');
ok(checkGlyph('｜', (c, r) => [35 + c, ramenTop - 8 - r, 40], 'neonred'), 'vertical long-vowel mark (tategaki)');
ok(checkGlyph('メ', (c, r) => [35 + c, ramenTop - 16 - r, 40], 'neonred'), 'メ');
ok(checkGlyph('ン', (c, r) => [35 + c, ramenTop - 24 - r, 40], 'neonred'), 'ン');
// 湯 on the sento: south row lot faces -z, so columns run toward -x
const sentoTop = GY + 19;
ok(checkGlyph('湯', (c, r) => [17 - 3 - c, sentoTop - 2 - r, 51], 'neoncyan'), '湯 on the public bath');
for (const [n, f] of [['park', flatPark], ['district', () => randomDistrict(5)], ['empty', emptyLot]]) { const w = f(); let s = 0; for (const b of w.blocks) if (b) s++; ok(s > 96 * 96 * 4, `template ${n} builds (${s} voxels)`); }

// ---------------------------------------------------------------
section('2. Mesher: hidden-face culling and vertex AO');
const quads = (m) => m.ni / 6;
{
  const w = new World(16, 16, 16); w.setRaw(5, 5, 5, ID.stone); w.relight();
  const m = meshRegion(w, 0, 0, 0, 16, 16, 16).opaque;
  ok(quads(m) === 6 && m.nv === 24, 'lone cube: 6 faces');
  ok([...m.dat].filter((_, i) => i % 4 === 2).every((a) => a === 3), 'lone cube: no occlusion');
  w.setRaw(6, 5, 5, ID.stone); w.relight();
  ok(quads(meshRegion(w, 0, 0, 0, 16, 16, 16).opaque) === 10, 'two cubes share a hidden face: 10 faces');
}
{
  const w = new World(16, 16, 16); w.fill(4, 4, 4, 6, 6, 6, ID.stone); w.relight();
  ok(quads(meshRegion(w, 0, 0, 0, 16, 16, 16).opaque) === 54, '3x3x3 solid: only the 54 outer faces');
}
{
  // AO on the top face of floor cell (1,0,1) with a wall at (2,1,1): the two vertices on that edge get ao 2
  const w = new World(16, 16, 16); w.fill(0, 0, 0, 2, 0, 2, ID.stone); w.setRaw(2, 1, 1, ID.stone); w.relight();
  const m = meshRegion(w, 1, 0, 1, 2, 1, 2).opaque;
  let top = -1; for (let q = 0; q < quads(m); q++) if (m.dat[q * 16 + 1] === 2) top = q;
  const ao = [0, 1, 2, 3].map((c) => m.dat[(top * 4 + c) * 4 + 2]);
  const xs = [0, 1, 2, 3].map((c) => m.pos[(top * 4 + c) * 3]);
  ok(top >= 0 && ao.every((a, c) => a === (xs[c] === 2 ? 2 : 3)), `AO next to one wall: [${ao}] at x [${xs}]`);
  w.setRaw(1, 1, 2, ID.stone); w.relight();
  const m2 = meshRegion(w, 1, 0, 1, 2, 1, 2).opaque;
  let t2 = -1; for (let q = 0; q < quads(m2); q++) if (m2.dat[q * 16 + 1] === 2) t2 = q;
  const ao2 = [0, 1, 2, 3].map((c) => m2.dat[(t2 * 4 + c) * 4 + 2]);
  const p2 = [0, 1, 2, 3].map((c) => [m2.pos[(t2 * 4 + c) * 3], m2.pos[(t2 * 4 + c) * 3 + 2]]);
  const corner = p2.findIndex(([x, z]) => x === 2 && z === 2);
  ok(ao2[corner] === 0, `AO in an inside corner (two walls) is 0: [${ao2}]`);
  ok(ao2.filter((a) => a === 2).length === 2 && ao2.filter((a) => a === 3).length === 1, 'AO: corner neighbours 2, far vertex 3');
}
{
  // whole default world: every emitted cube face borders a non-opaque cell, and the face count is exact
  let emitted = 0, hidden = 0, expected = 0;
  const w = A;
  for (let i = 0; i < w.nChunks; i++) {
    const m = meshChunk(w, i).opaque;
    for (let q = 0; q < m.ni / 6; q++) {
      const v = q * 4, id = m.dat[v * 4], f = m.dat[v * 4 + 1];
      if (SHAPE[id] !== 0) continue;
      emitted++;
      const F = FACES[f];
      let cx = 0, cy = 0, cz = 0; for (let c = 0; c < 4; c++) { cx += m.pos[(v + c) * 3]; cy += m.pos[(v + c) * 3 + 1]; cz += m.pos[(v + c) * 3 + 2]; }
      cx = Math.floor(cx / 4 - F.n[0] * 0.5); cy = Math.floor(cy / 4 - F.n[1] * 0.5); cz = Math.floor(cz / 4 - F.n[2] * 0.5);
      const nx = cx + F.n[0], ny = cy + F.n[1], nz = cz + F.n[2];
      const nb = ny < 0 ? 255 : w.get(nx, ny, nz);
      if (nb === 255 || OPAQUE[nb]) hidden++;
    }
  }
  for (let y = 0; y < w.H; y++) for (let z = 0; z < w.D; z++) for (let x = 0; x < w.W; x++) {
    const b = w.get(x, y, z); if (!b || SHAPE[b] !== 0 || b === ID.water || b === ID.glass) continue;
    for (const F of FACES) { const ny = y + F.n[1]; if (ny < 0) continue; const nb = w.get(x + F.n[0], ny, z + F.n[2]); if (!OPAQUE[nb]) expected++; }
  }
  ok(hidden === 0, `no hidden faces in the default world (${emitted} cube faces checked)`);
  ok(emitted === expected, `face count matches brute force (${emitted} vs ${expected})`);
}

// ---------------------------------------------------------------
section('3. Light: incremental updates equal a full recompute');
const palette = ['stone', 'air', 'air', 'neonpink', 'neoncyan', 'lantern', 'glass', 'sakura', 'water', 'plaster', 'konbini', 'air', 'slabstone', 'window'];
{
  const R = rng(9);
  const w = new World(40, 32, 40);
  w.fill(0, 0, 0, 39, 3, 39, ID.concrete);
  for (let i = 0; i < 60; i++) { const x = (R() * 36) | 0, z = (R() * 36) | 0, h = 4 + ((R() * 20) | 0); w.fill(x, 4, z, x + 3, h, z + 3, ID[palette[(R() * palette.length) | 0]]); }
  w.relight();
  let bad = 0, firstBad = -1;
  for (let e = 0; e < 200; e++) {
    const x = (R() * 40) | 0, y = 3 + ((R() * 26) | 0), z = (R() * 40) | 0;
    w.set(x, y, z, ID[palette[(R() * palette.length) | 0]]);
    const ref = w.clone(); ref.relight();
    if (!eqArr(ref.light, w.light)) { bad++; if (firstBad < 0) firstBad = e; }
  }
  ok(bad === 0, `200 random edits, compared after every edit: ${bad} mismatches${firstBad >= 0 ? ' (first at ' + firstBad + ')' : ''}`);
}
{
  const R = rng(12);
  const w = A.clone();
  let bad = 0;
  for (let e = 0; e < 200; e++) {
    const x = (R() * 96) | 0, z = (R() * 96) | 0; const top = w.topY(x, z);
    const y = Math.max(0, Math.min(47, top + ((R() * 4) | 0) - 1));
    w.set(x, y, z, ID[palette[(R() * palette.length) | 0]]);
    if (e % 20 === 19) { const ref = w.clone(); ref.relight(); if (!eqArr(ref.light, w.light)) bad++; }
  }
  ok(bad === 0, `200 random edits in the Tokyo corner, compared every 20: ${bad} mismatches`);
  // removing a neon sign voxel darkens; putting it back restores exactly
  const w2 = A.clone(); const before = w2.light.slice();
  const ramenX = 35, ramenY = ramenTop, ramenZ = 40;
  const id0 = w2.get(ramenX, ramenY, ramenZ);
  w2.set(ramenX, ramenY, ramenZ, 0); w2.set(ramenX, ramenY, ramenZ, id0);
  ok(eqArr(before, w2.light), 'remove and re-add a neon voxel restores the light exactly');
  const s = A.light[A.idx(40, GY + 2, 46)];
  ok(((s >> 4) & 15) + ((s >> 8) & 15) + ((s >> 12) & 15) > 6, 'the shotengai is lit by coloured block light');
}

// ---------------------------------------------------------------
section('4. Save and load');
{
  const w = A.clone(); w.meta = A.meta;
  const ed = new Editor(w); ed.box([10, 4, 44], [14, 8, 46], ID.neonpink);
  const enc = encodeWorld(w);
  const txt = JSON.stringify(enc);
  console.log(`  save size: ${(txt.length / 1024).toFixed(1)} KB for ${w.N} voxels (${enc.palette.length} block types)`);
  const back = decodeWorld(parseImport(txt));
  ok(eqArr(back.blocks, w.blocks), 'save -> load round-trips every voxel');
  ok(eqArr(back.light, w.light), 'light after load equals light before save');
  ok(back.meta.wires.length === A.meta.wires.length && back.meta.train && back.meta.cat, 'metadata (wires, train, cat) survives');
  const e2 = encodeWorld(new World(96, 48, 96));
  ok(JSON.stringify(e2).length < 200, 'an empty world compresses to a few bytes');
}
{
  const good = encodeWorld(new World(8, 8, 8));
  const bad = (mut, label) => { let threw = false; try { const o = JSON.parse(JSON.stringify(good)); mut(o); decodeWorld(o); } catch (e) { threw = typeof e.message === 'string' && e.message.length > 0; } ok(threw, 'import rejects ' + label); };
  let threw = false; try { parseImport('{ nope'); } catch { threw = true; } ok(threw, 'import rejects non-JSON');
  threw = false; try { parseImport('x'.repeat(5 * 1024 * 1024)); } catch { threw = true; } ok(threw, 'import rejects files over 4 MB');
  bad((o) => { o.format = 'minecraft'; }, 'a foreign format');
  bad((o) => { o.v = 99; }, 'a future version');
  bad((o) => { o.dims = [8, 8]; }, 'missing dimensions');
  bad((o) => { o.dims = [4096, 8, 8]; }, 'oversized dimensions');
  bad((o) => { o.dims = [8.5, 8, 8]; }, 'fractional dimensions');
  bad((o) => { o.palette = 'stone'; }, 'a palette that is not a list');
  bad((o) => { o.palette = Array(300).fill('stone'); }, 'a palette over 256 entries');
  bad((o) => { o.rle = o.rle.slice(0, -4); }, 'truncated voxel data');
  bad((o) => { o.rle = '!!!!'; }, 'non-base64 data');
  bad((o) => { o.rle = 'AQ=='; }, 'a run that does not fill the world');
  bad((o) => { o.rle = 'AP//Aw=='; }, 'a run that overflows the world');
  bad((o) => { o.rle = 'BQE='; }, 'a palette index out of range');
  let loaded = null; try { loaded = decodeWorld(JSON.parse(JSON.stringify(good))); } catch {} ok(!!loaded, 'a valid file loads');
  const unk = JSON.parse(JSON.stringify(good)); unk.palette = ['dragonstone']; let wu = null; try { wu = decodeWorld(unk); } catch {}
  ok(wu && wu.blocks.every((b) => b === ID.placeholder), 'unknown blocks map to the placeholder block');
  const junk = JSON.parse(JSON.stringify(good)); junk.meta = { wires: [[1, 2, 'x']], props: [{ t: '<script>', x: 1 }], cat: { x: 'NaN' } }; let wj = null; try { wj = decodeWorld(junk); } catch {}
  ok(wj && wj.meta.wires.length === 0 && wj.meta.props.length === 0 && wj.meta.cat === null, 'junk metadata is dropped');
}

// ---------------------------------------------------------------
section('5. Undo / redo across 500 random operations');
{
  const R = rng(77);
  const w = new World(48, 24, 48); w.fill(0, 0, 0, 47, 3, 47, ID.concrete); w.relight();
  const ed = new Editor(w);
  const stamps = buildStamps(); stamps.push(letterStamp('ラ', 'neonred', 'signboard'), letterStamp('A', 'neoncyan'));
  const ids = PALETTE_ORDER;
  // model: the list of committed states, and a cursor
  let states = [w.blocks.slice()], cur = 0, bad = 0, ops = { edit: 0, undo: 0, redo: 0 };
  const ri = (n) => (R() * n) | 0;
  for (let k = 0; k < 500; k++) {
    const r = R();
    if (r < 0.2 && ed.canUndo) { ed.undo(); cur--; ops.undo++; }
    else if (r < 0.32 && ed.canRedo) { ed.redo(); cur++; ops.redo++; }
    else {
      ed.mirrorX = R() < 0.25; ed.mirrorZ = R() < 0.25;
      const a = [ri(48), 3 + ri(14), ri(48)], b = [a[0] + ri(9) - 4, a[1] + ri(5), a[2] + ri(9) - 4], id = R() < 0.25 ? 0 : ids[ri(ids.length)];
      const kind = ri(6);
      let n = 0;
      if (kind === 0) n = ed.place(...a, id); else if (kind === 1) n = ed.remove(...a);
      else if (kind === 2) n = ed.box(a, b, id); else if (kind === 3) n = ed.line(a, b, id, 1 + ri(4));
      else if (kind === 4) n = ed.stamp(stamps[ri(stamps.length)], a[0], a[1], a[2], ri(4));
      else n = ed.box([0, 3, 0], [47, 9, 47], id); // big bulk edit
      if (n > 0) { states = states.slice(0, cur + 1); states.push(w.blocks.slice()); cur++; if (states.length > 201) { states.shift(); cur--; } }
      ops.edit++;
    }
    if (!eqArr(w.blocks, states[cur])) bad++;
  }
  ok(bad === 0, `exact state after every step (${ops.edit} edits, ${ops.undo} undos, ${ops.redo} redos): ${bad} mismatches`);
  let steps = 0; while (ed.undo()) steps++; cur -= steps;
  ok(cur === 0 && eqArr(w.blocks, states[0]), `undo all the way (${steps} steps, capped at 200) reaches the oldest kept state`);
  while (ed.redo()) cur++;
  ok(eqArr(w.blocks, states[states.length - 1]), 'redo all the way returns to the latest state');
  const ref = w.clone(); ref.relight(); ok(eqArr(ref.light, w.light), 'light is consistent after undo/redo');
}

// ---------------------------------------------------------------
section('6. Walker collision');
{
  const R = rng(5);
  const w = A.clone(); w.meta = A.meta;
  const wk = new Walker(w);
  wk.spawn(22, 45);
  let inside = 0, moved = 0, airborne = 0, flips = 0;
  const start = wk.pos.slice();
  for (let i = 0; i < 10000; i++) {
    const input = { fwd: R() * 2 - 1, strafe: R() * 2 - 1, jump: R() < 0.1, jumpPressed: R() < 0.02, sprint: R() < 0.3, down: R() < 0.1 };
    if (i % 400 === 0) wk.yaw = R() * Math.PI * 2;
    wk.step(1 / 60 + R() * 0.03, input);
    if (wk.fly) flips++;
    if (i % 1500 === 1499) wk.spawn((R() * 90) | 0, (R() * 90) | 0); // teleport somewhere else
    if (i % 50 === 0) { // the world changes around the walker (never inside it)
      const x = Math.floor(wk.pos[0]) + ((R() * 7) | 0) - 3, y = Math.floor(wk.pos[1]) + ((R() * 5) | 0) - 1, z = Math.floor(wk.pos[2]) + ((R() * 7) | 0) - 3;
      const b = wk.box(); const hit = x + 1 > b[0] && x < b[3] && y + 1 > b[1] && y < b[4] && z + 1 > b[2] && z < b[5];
      if (!hit) w.set(x, y, z, R() < 0.5 ? 0 : ID.stone);
    }
    if (wk.blocked(wk.pos)) inside++;
    if (!wk.onGround) airborne++;
    moved = Math.max(moved, Math.hypot(wk.pos[0] - start[0], wk.pos[2] - start[2]));
  }
  ok(inside === 0, `10,000 random moves: walker never inside a solid voxel (${inside} overlaps)`);
  ok(moved > 10, `the walker actually travels (${moved.toFixed(1)} voxels from spawn)`);
  // step-up onto a slab and a block, blocked by a 2-high wall
  const f = new World(16, 16, 16); f.fill(0, 0, 0, 15, 3, 15, ID.concrete); f.setRaw(8, 4, 5, ID.slabstone); f.fill(10, 4, 0, 10, 4, 15, ID.stone); f.fill(14, 4, 0, 14, 5, 15, ID.stone); f.relight();
  const s = new Walker(f); s.spawn(5.5, 5.5); s.yaw = -Math.PI / 2; // facing +x
  for (let i = 0; i < 240; i++) s.step(1 / 60, { fwd: 1, strafe: 0, jump: false });
  ok(Math.abs(s.pos[0] - 13.45) < 0.02 && Math.abs(s.pos[1] - 4) < 0.02, `steps up a block, stops at a 2-high wall (x ${s.pos[0].toFixed(2)}, y ${s.pos[1].toFixed(2)})`);
}

console.log(`\n${fails ? 'SOME CHECKS FAILED' : 'ALL MACHI CHECKS PASSED'}: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
