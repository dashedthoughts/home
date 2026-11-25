// NEON KUMITE · design metrics. Renders each fighter alone through the real rig code in headless Chromium and checks
// the model-sheet spec: screen size, mass, head and face, line weight, distinct cast, pose change, contrast, expressions.
//   node src/games/kumite/tools/measure.cjs        (from the src folder; needs playwright, uses the local esbuild)
const path = require('path'); const fs = require('fs'); const os = require('os');
const { chromium, devices } = require('playwright');
const { buildSync } = require(path.join(__dirname, '../../../../node_modules/esbuild'));
(async () => {
  const js = buildSync({ entryPoints: [path.join(__dirname, 'measure.page.js')], bundle: true, write: false, format: 'iife', logLevel: 'error' }).outputFiles[0].text;
  // camera scale in a real fight comes from the renderer's own camera code, read through the game's test hook
  const cam = {};
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  let res;
  try {
    const p = await b.newPage({ viewport: { width: 960, height: 540 } });
    await p.setContent('<html><body style="margin:0"></body></html>');
    await p.addScriptTag({ content: js });
    await p.waitForFunction(() => window.ready);
    res = await p.evaluate(() => window.measure());
  } finally { await b.close(); }
  const T = {
    screenDesk: [0.45, 0.55], screenLand: [0.38, 1], forearmMin: [0.05, 1], shinMin: [0.05, 1], thighMin: [0.08, 1], upperArmMin: [0.08, 1],
    head: [1 / 7, 1 / 6], browPx: [9, 99], eyePx: [9, 99], mouthPx: [9, 99], outlinePx: [2.5, 4.5], innerPx: [1, 2],
  };
  let fails = 0; const rows = [];
  const pct = (v) => (v == null ? '  -  ' : (100 * v).toFixed(1) + '%');
  const chk = (v, [a, b2]) => v != null && v >= a - 1e-9 && v <= b2 + 1e-9;
  console.log('fighter  screen(desk) screen(land) forearm  shin   thigh  uparm  shoulder head   brow  eye  mouth  outline inner  lum   faces');
  for (const [id, r] of Object.entries(res.fighters)) {
    const sh = id === 'ganji' ? 0.32 : 0.24;
    const stMin = id === 'sayo' ? 0.88 : 0.92, kMax = id === 'sayo' ? 32 : 25;
    const checks = { ...Object.fromEntries(Object.entries(T).map(([k, t]) => [k, chk(r[k], t)])), shoulders: r.shoulders >= sh, faces: r.faces.length >= 5, stance: r.stanceRatio >= stMin, knees: Math.max(r.kneeN, r.kneeF) <= kMax && Math.min(r.kneeN, r.kneeF) >= 8 };
    const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    fails += bad.length;
    console.log(`${id.padEnd(8)} ${pct(r.screenDesk).padStart(8)}     ${pct(r.screenLand).padStart(8)}   ${pct(r.forearmMin).padStart(6)} ${pct(r.shinMin).padStart(6)} ${pct(r.thighMin).padStart(6)} ${pct(r.upperArmMin).padStart(6)} ${pct(r.shoulders).padStart(7)} ${pct(r.head).padStart(6)} ${r.browPx.toFixed(1).padStart(5)} ${r.eyePx.toFixed(1).padStart(4)} ${r.mouthPx.toFixed(1).padStart(5)}  ${r.outlinePx.toFixed(2).padStart(5)}  ${r.innerPx.toFixed(2).padStart(4)}  ${r.lum.toFixed(3)} ${r.faces.length}`);
    console.log(`         phone face scale: head ${(r.headPxLand).toFixed(0)} px tall in landscape, ${(r.headPxPort).toFixed(0)} px in portrait (bold face below 30 px)`);
    console.log(`         stance ${pct(r.stanceRatio)} of full height, knees ${r.kneeN.toFixed(0)} / ${r.kneeF.toFixed(0)} deg (near / far)`);
    if (bad.length) console.log('         FAIL ' + bad.join(', '));
    // poses
    for (const [k, d] of Object.entries(r.moves)) {
      const pf = [d.sIdle >= 0.18, d.aIdle >= 0.18 || d.as >= 0.18, d.as >= 0.18, d.fs == null || d.fs >= 0.18, d.tip == null || d.tip >= 0.25];
      const ok = pf.every(Boolean); if (!ok) fails++;
      rows.push(`  ${id} ${k.padEnd(3)} active/idle ${pct(d.sIdle)} startup/idle ${pct(d.aIdle)} startup/active ${pct(d.as)} recovery/active ${pct(d.fs)} tip ${d.limb || '-'} ${pct(d.tip)}${ok ? '' : '   FAIL'}`);
    }
  }
  console.log('\nposes (silhouette pixels that differ; striking limb tip travel as a share of standing height):');
  rows.forEach((r) => console.log(r));
  console.log('\ncast overlap (IoU of normalised idle silhouettes, must be < 0.60):');
  for (const [k, v] of Object.entries(res.cast)) { const ok = v < 0.6; if (!ok) fails++; console.log(`  ${k.padEnd(12)} ${v.toFixed(3)}${ok ? '' : '  FAIL'}`); }
  console.log('\ncontrast (relative luminance difference between fighter and the stage band behind it, must be >= 25%):');
  for (const [sid, sl] of Object.entries(res.stages)) {
    const line = Object.entries(res.fighters).map(([id, r]) => { const d = Math.abs(r.lum - sl) / Math.max(r.lum, sl); if (d < 0.25) fails++; return `${id} ${(100 * d).toFixed(0)}%${d < 0.25 ? ' FAIL' : ''}`; });
    console.log(`  ${sid.padEnd(8)} stage lum ${sl.toFixed(3)}  ` + line.join('  '));
  }
  console.log('\nexpressions: ' + Object.entries(res.fighters).map(([id, r]) => `${id} ${r.faces.join('/')}`).join('  |  '));
  console.log(`\n${fails ? fails + ' DESIGN CHECKS FAILED' : 'ALL DESIGN CHECKS PASSED'}`);
  process.exit(fails ? 1 : 0);
})();
