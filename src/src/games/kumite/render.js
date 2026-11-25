// NEON KUMITE · renderer. Reads the sim state, never writes it. FX are stepped per sim frame so test-hook advances are deterministic.
import { FIGHTERS } from './data.js';
import { STAGE_L, STAGE_R, moveOf, hurtboxes, isAir } from './sim.js';
import { drawFighter, drawSilhouette, chain, stepChain, LOOKS, FACES, GAME_LW } from './rig.js';
import { poseFor } from './anim.js';
import { createStage, drawBack, drawFloor, drawFront, STAGES } from './stages.js';
import { drawHud } from './hud.js';

const JP = '"Noto Sans JP", sans-serif';
const ONO = { heavy: ['ドン', 'バキッ', 'ズドン', 'ドカッ'], block: ['ガッ', 'ガキン'], ko: ['ドオン'] };

// Camera zoom (CSS px per world unit). Fighters stand about half the screen tall on desktop; in touch landscape they fit
// between the HUD and the thumb band. Exported so tools/measure.cjs checks the real formula.
export const CAM_TALL = 172;
export function cameraScale(W, H, portrait, touchL, sep = 260) {
  const baseGy = portrait ? H * 0.6 : H * (touchL ? 0.6 : 0.86);
  const vw = portrait ? Math.max(400, Math.min(740, sep + 190)) : Math.max(500, Math.min(880, sep + 250));
  return portrait ? Math.min(W / vw, baseGy / 310) : Math.min(W / vw, touchL ? (baseGy - 58) / CAM_TALL : (0.5 * H) / CAM_TALL);
}
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const R = {
    canvas, ctx, W: 960, H: 540, dpr: 1, stage: null, stageId: '', t: 0, frame: 0,
    cam: { x: 550, scale: 1, zoom: 1, shake: 0, sx: 0, sy: 0, gy: 400, W: 960, H: 540, t: 0, vw: 660 },
    fr: [mkFR(), mkFR()], fx: [], texts: [], ann: null, flash: 0, combo: [null, null], reduced: false, lowFx: false, hitboxes: false, portrait: false,
    superT: 0, superBy: -1, superId: '', koT: 0, training: null, seed: 1, drone: { x: 0, y: 0, a: 0, cast: 0 },
  };
  function mkFR() { return { walk: 0, flash: 0, chains: {}, ghosts: [], lastX: 0, hpShown: 1, hpTrail: 1, trailHold: 0, meterShown: 0, init: false, face: { ...FACES.idle } }; }
  const rnd = () => { R.seed = (R.seed * 16807) % 2147483647; return R.seed / 2147483647; };

  R.resize = (w, h, dpr) => {
    R.W = w; R.H = h; R.dpr = dpr; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    R.portrait = h > w * 1.05;
    R.stage = null; // rebuild layers at the new resolution
  };
  R.setStage = (id) => { if (R.stageId !== id) { R.stageId = id; R.stage = null; } };
  R.reset = () => { R.fr = [mkFR(), mkFR()]; R.fx.length = 0; R.texts.length = 0; R.ann = null; R.flash = 0; R.combo = [null, null]; R.superT = 0; R.koT = 0; R.cam.shake = 0; R.cam.zoom = 1; };

  // ---------------------------------------------------------- events → effects (called once per sim frame)
  R.onEvents = (S, events, audio) => {
    for (const e of events) {
      const big = e.str >= 3;
      switch (e.t) {
        case 'hit': {
          // the spark sits where the blow lands: on the defender's near edge, not between the two bodies (keeps faces clear)
          const def = S.f[1 - e.p], att = S.f[e.p];
          if (!S.proj.length || Math.abs(e.x - (att.x + def.x) / 2) < 30) { const side = Math.sign(def.x - att.x) || 1; e.x = def.x - side * FIGHTERS[def.id].hw * 0.9; }
          spark(e.x, e.y, e.str, e.counter ? '#ffe14d' : '#ffd23a', e.seq);
          const vf = R.fr[1 - e.p]; vf.flash = 2;
          if (!R.reduced) R.cam.shake = Math.max(R.cam.shake, [1.5, 3, 5, 9][e.str] * (e.seq ? 0.6 : 1));
          if (big && !e.seq) R.cam.zoom = Math.max(R.cam.zoom, 1.05);
          if ((big || e.counter) && !e.seq && rnd() < 0.7) text(e.x + (rnd() - 0.5) * 30, e.y + 50, ONO.heavy[Math.floor(rnd() * 4)], e.counter ? '#ffe14d' : '#fff', 46, 'jp');
          if (e.dmg && R.training) text(e.x, e.y + 20, String(e.dmg), '#fff', 18, 'dmg');
          audio && audio.hit(e.str, e.counter);
          break;
        }
        case 'block': blockSpark(e.x, e.y, e.str); if (!R.reduced) R.cam.shake = Math.max(R.cam.shake, 1 + e.str * 0.6); audio && audio.block(e.str); break;
        case 'whoosh': audio && audio.whoosh(e.tier); break;
        case 'jump': dust(e.x, 0, 4, 0.6); audio && audio.step(0.5); break;
        case 'land': dust(e.x, 0, e.heavy ? 10 : 5, e.heavy ? 1.4 : 0.8); if (e.heavy && !R.reduced) R.cam.shake = Math.max(R.cam.shake, 3); audio && audio.step(e.heavy ? 1.4 : 0.6); break;
        case 'dash': dust(e.x, 0, 6, 1, -e.dir * S.f[e.p].face); audio && audio.dash(); break;
        case 'proj': R.drone.cast = 14; ring(e.x, e.y, '#00f0ff', 26); audio && audio.zap(e.kind); break;
        case 'fizzle': spark(e.x, e.y, 0, '#7fefff'); if (e.pop) { spark(e.x, e.y, 2, '#ff8c42'); audio && audio.boom(0.5); } break;
        case 'clash': spark(e.x, e.y, 3, '#bff8ff'); ring(e.x, e.y, '#ffffff', 60); audio && audio.hit(2); break;
        case 'grab': case 'seq': ring(e.x, e.y, '#ffffff', 40); audio && audio.grab(); break;
        case 'tech': spark(e.x, e.y, 1, '#bff8ff'); text(e.x, e.y + 40, 'TECH', '#00f0ff', 26, 'en'); audio && audio.block(1); break;
        case 'parry': ring(e.x, e.y, '#ff2bd6', 70); text(e.x, e.y + 50, '見切り', '#ff2bd6', 36, 'jp'); audio && audio.parry(); break;
        case 'teleport': smoke(e.x, 90, '#ff2bd6'); audio && audio.teleport(); break;
        case 'armor': ring(e.x, e.y, '#ff7a1f', 50); text(e.x, e.y + 44, 'ARMOR', '#ff7a1f', 22, 'en'); audio && audio.armor(); break;
        case 'counter': R.texts.push({ kind: 'side', p: e.p, s: 'COUNTER', t: 0, life: 50 }); break;
        case 'super': R.superT = 60; R.superBy = e.p; R.superId = e.id; audio && audio.superStart(); break;
        case 'ex': ring(S.f[e.p].x, 100, FIGHTERS[S.f[e.p].id].color, 80); audio && audio.ex(); break;
        case 'cancel': break;
        case 'ko': R.koT = 1; if (!R.reduced) R.flash = 1; R.cam.zoom = 1.12; audio && audio.ko(); break;
        case 'round': announce(e.final ? 'FINAL ROUND' : 'ROUND ' + e.n, '', 70); audio && audio.ann('round'); break;
        case 'fight': announce('FIGHT', '', 40); audio && audio.ann('fight'); break;
        case 'timeover': announce('TIME', '', 90); audio && audio.ann('time'); break;
        case 'roundWin': if (e.w < 0) announce('DRAW', '', 110); else if (e.perfect) { announce('PERFECT', '', 110); audio && audio.ann('perfect'); } break;
        case 'comboEnd': if (e.hits >= 2) R.combo[e.p] = { hits: e.hits, dmg: e.dmg, t: 0, done: 1 }; break;
      }
    }
    // live combo counter
    for (let i = 0; i < 2; i++) { const d = S.f[1 - i]; if (d.combo.hits >= 2) R.combo[i] = { hits: d.combo.hits, dmg: d.combo.dmg, t: 0, done: 0 }; }
  };
  function announce(s, sub, life) { R.ann = { s, sub, t: 0, life }; }
  function spark(x, y, str, col, small) {
    const n = small ? 5 : [5, 7, 10, 16][str];
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2; const v = (2.5 + rnd() * 5) * (1 + str * 0.35); R.fx.push({ k: 'ray', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 10 + str * 2, t: 0, col, w: 2 + str * 0.7 }); }
    R.fx.push({ k: 'burst', x, y, life: 8 + str * 2, t: 0, r: 11 + str * 8, col, str });
    if (str >= 2) R.fx.push({ k: 'ring', x, y, life: 14, t: 0, r: 30 + str * 20, col: '#ffffff' });
  }
  function blockSpark(x, y, str) {
    R.fx.push({ k: 'shield', x, y, life: 12, t: 0, r: 22 + str * 6 });
    for (let i = 0; i < 4 + str * 2; i++) { const a = (rnd() - 0.5) * 1.6 + (rnd() < 0.5 ? 0 : Math.PI); const v = 2 + rnd() * 4; R.fx.push({ k: 'ray', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 1, life: 9, t: 0, col: '#9fe8ff', w: 1.6 }); }
  }
  function ring(x, y, col, r) { R.fx.push({ k: 'ring', x, y, life: 16, t: 0, r, col }); }
  function dust(x, y, n, s, dir = 0) { for (let i = 0; i < n; i++) R.fx.push({ k: 'dust', x: x + (rnd() - 0.5) * 30, y: y + 4, vx: (rnd() - 0.5) * 2.4 * s + dir * 2, vy: rnd() * 1.4 * s, life: 22 + rnd() * 12, t: 0, r: (6 + rnd() * 8) * s }); }
  function smoke(x, y, col) { for (let i = 0; i < 12; i++) R.fx.push({ k: 'smoke', x: x + (rnd() - 0.5) * 40, y: y + (rnd() - 0.5) * 120, vx: (rnd() - 0.5) * 1.5, vy: rnd() * 1.2, life: 26, t: 0, r: 10 + rnd() * 12, col }); }
  function text(x, y, s, col, size, kind) { R.texts.push({ x, y, s, col, size, kind, t: 0, life: kind === 'dmg' ? 34 : 40, rot: (rnd() - 0.5) * 0.3 }); }

  // advance render-only state one sim frame (deterministic with the sim)
  R.tick = (S) => {
    R.frame++;
    for (let i = R.fx.length - 1; i >= 0; i--) { const p = R.fx[i]; p.t++; if (p.vx != null) { p.x += p.vx; p.y += p.vy; if (p.k === 'ray') { p.vx *= 0.86; p.vy *= 0.86; } if (p.k === 'dust') { p.vx *= 0.92; p.vy *= 0.95; } } if (p.t >= p.life) R.fx.splice(i, 1); }
    for (let i = R.texts.length - 1; i >= 0; i--) { const p = R.texts[i]; p.t++; if (p.t >= p.life) R.texts.splice(i, 1); }
    if (R.ann) { R.ann.t++; if (R.ann.t > R.ann.life) R.ann = null; }
    for (let i = 0; i < 2; i++) if (R.combo[i]) { R.combo[i].t++; if (R.combo[i].done && R.combo[i].t > 70) R.combo[i] = null; }
    R.cam.shake *= 0.84; if (R.cam.shake < 0.2) R.cam.shake = 0;
    R.cam.zoom += (1 - R.cam.zoom) * 0.08;
    if (R.flash > 0) R.flash = Math.max(0, R.flash - 0.08);
    if (R.superT > 0) R.superT--;
    if (R.koT > 0) R.koT++;
    S.f.forEach((f, i) => {
      const fr = R.fr[i];
      if (fr.flash > 0) fr.flash--;
      if (f.st === 'walk') fr.walk += Math.abs(f.x - fr.lastX) / 64;
      fr.lastX = f.x;
      // after-images for dashes, teleports and supers
      const ghosty = (f.st === 'dash' && f.dashDir > 0) || (f.st === 'atk' && (f.mv === 'SU' || f.mv === 'EX' || (f.mv === 'S' && f.id !== 'suzu' && f.id !== 'ganji'))) || (f.st === 'grab' && f.grab && f.grab.seq);
      if (ghosty && R.frame % 3 === 0) fr.ghosts.push({ x: f.x, y: f.y, face: f.face, pose: poseFor(f, S, { t: R.t, walk: fr.walk }), t: 0 });
      for (let k = fr.ghosts.length - 1; k >= 0; k--) { fr.ghosts[k].t++; if (fr.ghosts[k].t > 12) fr.ghosts.splice(k, 1); }
      // health trail
      const hp = f.hp / f.maxhp; fr.hpShown = hp;
      if (hp < fr.hpTrail) { if (f.combo.hits > 0 || f.st === 'hit' || f.st === 'juggle' || f.st === 'held') fr.trailHold = 30; if (fr.trailHold > 0) fr.trailHold--; else fr.hpTrail = Math.max(hp, fr.hpTrail - 0.006); } else fr.hpTrail = hp;
      fr.meterShown += (f.meter - fr.meterShown) * 0.25;
      // faces act, they never snap: ease toward the expression the state calls for, blink now and then
      const m = moveOf(f);
      const key = f.st === 'atk' ? (m && f.mf < m.st + Math.max(1, m.ac) + 4 ? 'atk' : 'idle') : f.st === 'grab' ? 'atk' : f.st === 'hit' || f.st === 'juggle' || f.st === 'reset' ? 'hit' : f.st === 'block' || f.st === 'guard' ? 'block' : f.st === 'win' ? 'win' : f.st === 'lose' ? 'lose' : f.st === 'ko' || f.st === 'dead' || f.st === 'down' ? 'ko' : f.st === 'held' ? 'held' : 'idle';
      const T = FACES[key]; const k = key === 'hit' || key === 'held' ? 0.6 : 0.3;
      for (const q of ['brow', 'eye', 'mouth', 'curve']) fr.face[q] += (T[q] - fr.face[q]) * k;
      fr.face.teeth = T.teeth;
      if (key === 'idle' && (R.frame + i * 97) % 173 < 4) fr.face.eye = 0.05;
    });
  };

  // ---------------------------------------------------------- frame
  R.draw = (S, dt, opts = {}) => {
    dt = Math.max(0, dt || 0); R.t += dt;
    const { W, H } = R; const cam = R.cam;
    ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    if (!R.stage || R.stage.id !== (S ? S.stage : R.stageId)) { R.stage = createStage(S ? S.stage : R.stageId || 'viaduct', R.lowFx ? 0.7 : 1); }
    const st = R.stage;
    // camera
    const [a, b] = S.f;
    const sep = Math.abs(a.x - b.x);
    // with touch controls in landscape, the floor line sits above the thumb band so the fighters stay clear of the buttons
    const touchL = !R.portrait && R.touch && H < 560;
    const baseGy = R.portrait ? H * 0.6 : H * (touchL ? 0.6 : 0.86);
    let scale = cameraScale(W, H, R.portrait, touchL, sep) * cam.zoom;
    // the camera rises with a jump so heads never go under the HUD
    const topW = Math.max(...S.f.map((f) => f.y + FIGHTERS[f.id].hh * FIGHTERS[f.id].scale * 1.06));
    const gyT = Math.max(baseGy, H * (R.portrait ? 0.15 : 0.13) + topW * scale);
    cam.gyOff = (cam.gyOff || 0) + (gyT - baseGy - (cam.gyOff || 0)) * (opts.snap ? 1 : 0.2);
    const gy = Math.round(baseGy + cam.gyOff);
    const half = W / scale / 2;
    let cx = (a.x + b.x) / 2;
    cx = Math.max(STAGE_L + Math.min(half, (STAGE_R - STAGE_L) / 2), Math.min(STAGE_R - Math.min(half, (STAGE_R - STAGE_L) / 2), cx));
    cam.x += (cx - cam.x) * (opts.snap ? 1 : 0.25); cam.scale = scale; cam.gy = gy; cam.W = W; cam.H = H; cam.t = R.t; cam.lowFx = R.lowFx;
    const shx = cam.shake ? (rnd() - 0.5) * 2 * cam.shake : 0, shy = cam.shake ? (rnd() - 0.5) * 2 * cam.shake : 0;
    R.shx = shx; R.shy = shy;
    ctx.save(); ctx.translate(shx, shy);
    drawBack(ctx, st, cam);
    drawFloor(ctx, st, cam);
    const toS = (x, y) => [(x - cam.x) * scale + W / 2, gy - y * scale];
    // super freeze darkens the world behind the fighters
    const sup = R.superT > 0;
    if (sup) { ctx.fillStyle = `rgba(6,4,12,${Math.min(0.75, (60 - R.superT) / 8 * 0.75)})`; ctx.fillRect(-20, -20, W + 40, H + 40); if (!R.reduced) speedLines(ctx, W, H, R.superBy, R.t); }
    // reflections (floor), shadows
    // the attacker is drawn on top, except during a hold, when the victim comes to the front so the throw reads
    const order = S.f[0].st === 'held' ? [1, 0] : S.f[1].st === 'held' ? [0, 1] : S.f[0].st === 'atk' || S.f[0].st === 'grab' ? [1, 0] : [0, 1];
    if (st.reflect > 0 && !R.lowFx) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, gy, W, H - gy); ctx.clip();
      for (const i of order) drawOne(S, i, toS, scale, st, true, order);
      drawProjectiles(S, toS, scale, true);
      ctx.restore();
      const fade = ctx.createLinearGradient(0, gy, 0, H); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.6, 'rgba(0,0,0,0.35)'); fade.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = fade; ctx.fillRect(0, gy, W, H - gy);
    }
    for (const f of S.f) { const [sx] = toS(f.x, 0); const h = Math.max(0.3, 1 - f.y / 200); ctx.fillStyle = `rgba(0,0,0,${0.45 * h})`; ctx.beginPath(); ctx.ellipse(sx, gy + 2, 34 * scale * h * FIGHTERS[f.id].scale, 7 * scale * h, 0, 0, 7); ctx.fill(); }
    drawMines(S, toS, scale);
    for (const i of order) drawOne(S, i, toS, scale, st, false, order);
    drawProjectiles(S, toS, scale, false);
    drawBeam(S, toS, scale);
    drawFx(toS, scale);
    if (R.hitboxes) drawBoxes(S, toS, scale);
    ctx.restore();
    drawFront(ctx, st, cam, dt);
    drawTexts(toS, scale);
    if (sup) superSplash(ctx, S, W, H);
    // KO flash panel
    if (R.flash > 0 && !R.reduced) { ctx.fillStyle = `rgba(255,255,255,${R.flash * 0.85})`; ctx.fillRect(0, 0, W, H); }
    drawHud(ctx, S, R, opts);
  };

  function drawOne(S, i, toS, scale, st, reflect, order = [0, 1]) {
    const f = S.f[i]; const fr = R.fr[i]; const ch = FIGHTERS[f.id];
    const rs = { t: R.t + i * 1.3, walk: fr.walk };
    if (f.st === 'held') { const g = S.f[1 - i]; rs.heldRot = g.grab ? -Math.min(1, (g.sf || 0) / 20) * (g.grab.mv === 'SU' || g.grab.mv === 'S' || g.grab.mv === 'EX' || g.grab.mv === 'bS' ? 160 : 60) : 0; }
    const p = poseFor(f, S, rs);
    const s = scale * ch.scale;
    let [sx, sy] = toS(f.x, f.y);
    { const o = S.f[1 - i]; const need = FIGHTERS[f.id].hw + FIGHTERS[o.id].hw + 26; const gap = Math.abs(f.x - o.x);
      const behind = (order[0] === i); if (behind && gap < need && f.st !== 'held' && o.st !== 'held') sx += Math.sign(f.x - o.x || -f.face) * Math.min(10, (need - gap) * 0.45) * scale; }
    if ((f.hs > 0) && (f.st === 'hit' || f.st === 'block' || f.st === 'juggle' || f.st === 'ko' || f.st === 'atk')) { const jit = (f.st === 'atk' ? 0.6 : 1.6) * scale; sx += (R.frame % 2 ? jit : -jit); }
    const light = [st.key[0] * f.face, st.key[1]];
    const rimDir = (st.rimSide || 1) * f.face * -1;
    const lw = GAME_LW;
    const alt = i === 1 && S.f[0].id === f.id;
    const opts = { lw, light, tint: st.haze, rim: i === 0 ? st.rim : st.rim2, rimDir, state: f.st, win: f.st === 'win', chains: chainsFor(f, fr, p, s, reflect), t: R.t, alt, face: fr.face, vx: f.vx * f.face };
    const alpha = p.alpha == null ? 1 : p.alpha;
    if (reflect) {
      ctx.save(); ctx.globalAlpha = st.reflect * alpha; ctx.setTransform(R.dpr * s * f.face, 0, 0, R.dpr * s, R.dpr * (sx + R.cam.sx), R.dpr * (R.cam.gy + (R.cam.gy - sy)));
      drawFighter(ctx, f.id, p, { ...opts, rimA: 0, flat: true }); ctx.restore();
      return;
    }
    // after-images
    for (const g of fr.ghosts) {
      const [gx, gyy] = toS(g.x, g.y);
      ctx.save(); ctx.globalAlpha = 0.32 * (1 - g.t / 12); ctx.setTransform(R.dpr * s * g.face, 0, 0, -R.dpr * s, R.dpr * (gx + shakeX()), R.dpr * (gyy + shakeY()));
      drawSilhouette(ctx, f.id, g.pose, ch.color); ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.setTransform(R.dpr * s * f.face, 0, 0, -R.dpr * s, R.dpr * (sx + shakeX()), R.dpr * (sy + shakeY()));
    // smear trail behind a fast limb
    if (p.smear && p.smear.k > 0 && !R.lowFx) smear(ctx, f, p, ch);
    drawFighter(ctx, f.id, p, opts);
    ctx.restore();
    if (fr.flash > 0 && !R.reduced) { // white hit flash: a flat silhouette pass over the fighter
      ctx.save(); ctx.globalAlpha = 0.2 * (fr.flash / 2); ctx.setTransform(R.dpr * s * f.face, 0, 0, -R.dpr * s, R.dpr * (sx + shakeX()), R.dpr * (sy + shakeY()));
      drawSilhouette(ctx, f.id, p, '#ffffff', opts.chains); ctx.restore();
    }
    // moves with an aura: Lariat armour glow, Mirror Veil shimmer, Arc Field ring, super glow
    const m = moveOf(f);
    if (f.st === 'atk' && m) {
      if (f.mv === 'fS' && f.id === 'ganji' && f.armor > 0) aura(sx, sy - 100 * s, 90 * s, '#ff7a1f', 0.35);
      if (f.mv === 'bS' && f.id === 'sayo' && f.mf >= m.parry[0] && f.mf <= m.parry[1]) mirror(sx, sy, s, f.face);
      if (f.mv === 'bS' && f.id === 'suzu' && f.mf >= m.st && f.mf < m.st + m.ac) arcField(sx, sy - 85 * s, 95 * s);
      if (f.mv === 'SU' || f.mv === 'EX') aura(sx, sy - 90 * s, 110 * s, ch.color, 0.25);
      if (f.mv === 'dS' && f.id === 'ganji' && f.mf >= m.st && f.mf < m.st + 2) { for (let k = 0; k < 2; k++) R.fx.push({ k: 'quake', x: f.x + f.face * 80, y: 0, life: 18, t: 0, dir: f.face }); }
    }
    if (f.id === 'suzu') drawDrone(f, sx, sy, s);
  }
  const shakeX = () => R.shx || 0, shakeY = () => R.shy || 0;
  function chainsFor(f, fr, p, s, reflect) {
    if (reflect) return fr.chains.cache || {};
    const id = f.id; const C = fr.chains;
    const face = f.face;
    const ax = (lx) => lx; // chains live in local space
    const wind = (R.stage && R.stage.id === 'roof' ? -0.5 : -0.15) * 1;
    const dx = -(f.x - (fr.cx || f.x)) * face * 0.8; fr.cx = f.x;
    const cache = {};
    const hipY = p.hip[1];
    if (id === 'sayo') {
      if (!C.scarf) { C.scarf = chain(7, 9); C.tail = chain(6, 8); }
      const nx = p.hip[0] + Math.sin((p.lean || 0) * Math.PI / 180) * 46, ny = hipY + 46;
      stepLocal(C.scarf, nx - 4, ny, dx, wind); cache.scarf = C.scarf.p.map((q) => [q[0], q[1]]);
      stepLocal(C.tail, nx - 6, ny + 30, dx, wind * 0.8); cache.tail = C.tail.p.map((q) => [q[0], q[1]]);
    } else if (id === 'suzu') {
      if (!C.coat) C.coat = chain(5, 11);
      stepLocal(C.coat, p.hip[0] - 6, hipY + 6, dx, wind * 0.6, 0.55); cache.coat = C.coat.p.map((q) => [q[0], q[1]]);
    } else if (id === 'ganji') {
      if (!C.coat) C.coat = chain(4, 10);
      stepLocal(C.coat, p.hip[0] - 10, hipY + 10, dx, wind * 0.4, 0.6); cache.coat = C.coat.p.map((q) => [q[0], q[1]]);
    } else if (id === 'rin') {
      if (!C.tail) C.tail = chain(5, 6);
      const nx = p.hip[0] + Math.sin((p.lean || 0) * Math.PI / 180) * 50; stepLocal(C.tail, nx - 10, hipY + 70, dx, wind, 0.7); cache.tail = C.tail.p.map((q) => [q[0], q[1]]);
    }
    fr.chains.cache = cache;
    return cache;
  }
  function stepLocal(c, ax, ay, push, wind, g = 0.7) { stepChain(c, ax, ay, 1, -g, wind + push * 0.08, 1 / 60); }
  function smear(ctx, f, p, ch) {
    const from = p.smear.from, to = p[p.smear.limb];
    if (!from || !to) return;
    ctx.save();
    ctx.globalAlpha = 0.5 * p.smear.k; ctx.fillStyle = '#ffffff';
    const mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2 + 14;
    ctx.beginPath(); ctx.moveTo(from[0], from[1] - 4); ctx.quadraticCurveTo(mx, my + 8, to[0], to[1] + 8); ctx.lineTo(to[0], to[1] - 8); ctx.quadraticCurveTo(mx, my - 8, from[0], from[1] + 2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.6 * p.smear.k; ctx.strokeStyle = ch.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function aura(x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, col + '00'); g.addColorStop(0.6, hexA(col, a)); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
  function mirror(x, y, s, face) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,43,214,0.8)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(x + face * 34 * s, y - 90 * s, (14 + k * 6) * s, (70 + k * 6) * s, 0, 0, 7); ctx.globalAlpha = 0.6 - k * 0.18 + 0.2 * Math.sin(R.t * 20 + k); ctx.stroke(); } ctx.restore(); }
  function arcField(x, y, r) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 2; const rr = r * (0.9 + 0.12 * Math.sin(k * 7 + R.t * 40)); k ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.stroke(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#00f0ff'; ctx.fill(); ctx.restore(); }
  function drawDrone(f, sx, sy, s) {
    const m = moveOf(f); const d = R.drone;
    const casting = f.st === 'atk' && m && (m.proj || f.mv === 'SU');
    const tx = sx + f.face * (casting ? 54 : -30) * s, ty = sy - (casting ? 132 : 172) * s + Math.sin(R.t * 3) * 5 * s;
    if (!d.init || Math.abs(d.x - tx) > 400) { d.x = tx; d.y = ty; d.init = 1; }
    d.x += (tx - d.x) * 0.25; d.y += (ty - d.y) * 0.25;
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(s * f.face, s);
    ctx.fillStyle = '#0d1520'; ctx.strokeStyle = '#05080c'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-7, -7); ctx.lineTo(9, -7); ctx.lineTo(15, 0); ctx.lineTo(9, 6); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(8, 0, 3.2, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(200,240,255,0.7)'; ctx.lineWidth = 1.4; const r = R.t * 60;
    for (const ox of [-12, 12]) { ctx.beginPath(); ctx.ellipse(ox, -10, 9 * Math.abs(Math.cos(r)), 2, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, -7); ctx.lineTo(ox, -10); ctx.stroke(); }
    if (R.drone.cast > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(0,240,255,${R.drone.cast / 14})`; ctx.beginPath(); ctx.arc(14, 0, 10 + (14 - R.drone.cast), 0, 7); ctx.fill(); R.drone.cast--; }
    ctx.restore();
  }
  function drawMines(S, toS, scale) {
    for (const p of S.proj) {
      if (p.kind !== 'mine') continue;
      const [x, y] = toS(p.x, 0);
      const armed = p.age >= p.def.arm; const blink = armed ? Math.sin(R.t * 18) > 0 : Math.sin(R.t * 6) > 0.6;
      ctx.save(); ctx.fillStyle = '#121822'; ctx.strokeStyle = '#05080c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y - 3 * scale, 14 * scale, 5 * scale, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = blink ? (armed ? '#ff3b5c' : '#00f0ff') : '#2a3340'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = blink ? 12 : 0;
      ctx.beginPath(); ctx.arc(x, y - 6 * scale, 3 * scale, 0, 7); ctx.fill();
      if (armed) { ctx.globalAlpha = 0.25; ctx.strokeStyle = '#ff3b5c'; ctx.beginPath(); ctx.ellipse(x, y - 2 * scale, 22 * scale, 6 * scale, 0, 0, 7); ctx.stroke(); }
      ctx.restore();
    }
  }
  function drawProjectiles(S, toS, scale, reflect) {
    for (const p of S.proj) {
      if (p.kind === 'mine') continue;
      let [x, y] = toS(p.x, p.y);
      if (reflect) y = R.cam.gy + (R.cam.gy - y);
      const r = p.r * scale; const dir = Math.sign(p.vx) || 1;
      ctx.save(); ctx.globalAlpha = reflect ? 0.3 : 1; ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 1, x, y, r * 2.6); g.addColorStop(0, 'rgba(220,255,255,0.95)'); g.addColorStop(0.35, 'rgba(0,240,255,0.7)'); g.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 7); ctx.fill();
      // moth wings: two flickering triangles, plus a trail
      const fl = 0.6 + 0.4 * Math.sin(R.t * 50 + p.id);
      ctx.fillStyle = 'rgba(160,250,255,0.75)';
      for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * r * 1.6, y + sgn * r * 1.8 * fl); ctx.lineTo(x - dir * r * 2.4, y + sgn * r * 0.4); ctx.closePath(); ctx.fill(); }
      const tl = ctx.createLinearGradient(x, y, x - dir * r * 7, y - (p.vy ? -p.vy * r : 0)); tl.addColorStop(0, 'rgba(0,240,255,0.5)'); tl.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.strokeStyle = tl; ctx.lineWidth = r * 0.9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx / 6.4 * r * 6, y + p.vy / 6.4 * r * 6); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
  function drawBeam(S, toS, scale) {
    for (const f of S.f) {
      if (f.st !== 'atk' || f.mv !== 'SU' || f.id !== 'suzu') continue;
      const m = moveOf(f); if (f.mf < m.st || f.mf >= m.st + m.ac) continue;
      const [x0, y0] = toS(f.x + f.face * m.hit[0], f.y + (m.hit[1] + m.hit[3]) / 2); const [x1] = toS(f.x + f.face * m.hit[2], 0);
      const h = (m.hit[3] - m.hit[1]) * scale * (0.85 + 0.15 * Math.sin(R.t * 60));
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, y0 - h, 0, y0 + h); g.addColorStop(0, 'rgba(0,240,255,0)'); g.addColorStop(0.35, 'rgba(0,240,255,0.55)'); g.addColorStop(0.5, 'rgba(240,255,255,0.95)'); g.addColorStop(0.65, 'rgba(0,240,255,0.55)'); g.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = g; ctx.fillRect(Math.min(x0, x1), y0 - h, Math.abs(x1 - x0), h * 2);
      for (let k = 0; k < 10; k++) { const t = (R.t * 3 + k / 10) % 1; const xx = x0 + (x1 - x0) * t; ctx.fillStyle = 'rgba(200,255,255,0.8)'; ctx.fillRect(xx, y0 + Math.sin(k * 3 + R.t * 30) * h * 0.4, 10 * scale, 2); }
      ctx.restore();
    }
  }
  function drawFx(toS, scale) {
    ctx.save();
    for (const p of R.fx) {
      const [x, y] = toS(p.x, p.y); const k = p.t / p.life;
      if (p.k === 'ray') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = p.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = p.w * scale * (1 - k * 0.5); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * scale * 3, y + p.vy * scale * 3); ctx.stroke(); }
      else if (p.k === 'burst') { // a jagged comic impact star
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - k * k; const r = p.r * scale * (0.6 + k * 0.6);
        ctx.fillStyle = p.t < 1 ? '#ffffff' : p.col; ctx.strokeStyle = '#0b0b10'; ctx.lineWidth = 2; // one frame of white, then colour
        ctx.beginPath(); const n = 10 + p.str * 2; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + p.x; const rr = i % 2 ? r * 0.42 : r * (0.85 + ((i * 37) % 7) / 20); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (p.str >= 2 && p.t >= 1) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r * 0.28, 0, 7); ctx.fill(); }
      }
      else if (p.k === 'ring') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = p.col; ctx.lineWidth = 3 * (1 - k) + 1; ctx.beginPath(); ctx.arc(x, y, p.r * scale * (0.3 + k), 0, 7); ctx.stroke(); }
      else if (p.k === 'shield') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; const r = p.r * scale * (0.8 + k * 0.4); ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke(); ctx.fillStyle = 'rgba(120,220,255,0.18)'; ctx.fill(); }
      else if (p.k === 'dust') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = '#c9c0d8'; ctx.beginPath(); ctx.arc(x, y, p.r * scale * (0.6 + k), 0, 7); ctx.fill(); }
      else if (p.k === 'smoke') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.45 * (1 - k); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(x, y, p.r * scale * (0.5 + k), 0, 7); ctx.fill(); }
      else if (p.k === 'quake') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffb36a'; ctx.lineWidth = 3; const len = 160 * scale * k; ctx.beginPath(); ctx.ellipse(x, y, Math.max(1, len), 8 * scale * (1 - k) + 1, 0, 0, 7); ctx.stroke(); }
    }
    ctx.restore();
  }
  function drawTexts(toS, scale) {
    for (const p of R.texts) {
      if (p.kind === 'side') continue;
      const [x, y] = toS(p.x, p.y); const k = p.t / p.life;
      const sz = p.size * Math.min(1.6, scale * 1.1) * (p.t < 5 ? 0.6 + p.t / 5 * 0.5 : 1.1 - k * 0.1);
      ctx.save(); ctx.translate(x, y - k * 18 * scale); ctx.rotate(p.rot || 0);
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.font = p.kind === 'jp' ? `900 ${sz}px ${JP}` : p.kind === 'dmg' ? `700 ${sz}px Rajdhani, sans-serif` : `400 ${sz}px Bangers, Rajdhani, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = sz * 0.16; ctx.strokeStyle = '#0b0b10'; ctx.strokeText(p.s, 0, 0);
      ctx.fillStyle = p.col; ctx.fillText(p.s, 0, 0);
      ctx.restore();
    }
  }
  function drawBoxes(S, toS, scale) {
    ctx.save(); ctx.lineWidth = 1.5;
    for (const f of S.f) {
      const c = FIGHTERS[f.id];
      ctx.strokeStyle = 'rgba(80,160,255,0.9)'; ctx.fillStyle = 'rgba(80,160,255,0.15)';
      for (const h of hurtboxes(f)) { const [x0, y0] = toS(h[0], h[3]); const [x1, y1] = toS(h[2], h[1]); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); }
      const m = moveOf(f);
      if (f.st === 'atk' && m && m.hit && m.ac && f.mf >= m.st && f.mf < m.st + m.ac) {
        const h = m.hit; const b = f.face > 0 ? [f.x + h[0], f.y + h[1], f.x + h[2], f.y + h[3]] : [f.x - h[2], f.y + h[1], f.x - h[0], f.y + h[3]];
        const [x0, y0] = toS(b[0], b[3]); const [x1, y1] = toS(b[2], b[1]);
        ctx.strokeStyle = m.grab ? 'rgba(255,220,60,1)' : 'rgba(255,60,90,1)'; ctx.fillStyle = m.grab ? 'rgba(255,220,60,0.25)' : 'rgba(255,60,90,0.3)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      }
      // pushbox
      const [px0, py0] = toS(f.x - c.hw, f.y + 20); const [px1] = toS(f.x + c.hw, 0); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([4, 3]); ctx.strokeRect(px0, py0, px1 - px0, 4); ctx.setLineDash([]);
    }
    for (const p of S.proj) { const [x, y] = toS(p.x, p.kind === 'mine' ? 15 : p.y); ctx.strokeStyle = 'rgba(255,60,90,1)'; ctx.strokeRect(x - p.r * scale, y - p.r * scale, p.r * 2 * scale, p.r * 2 * scale); }
    ctx.restore();
  }
  function speedLines(ctx, W, H, by, t) {
    // halftone burst + radial speed lines behind the fighters during a super freeze
    ctx.save(); const cx = W * (by === 0 ? 0.35 : 0.65), cy = H * 0.45;
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (let i = 0; i < 80; i++) { const a = i / 80 * Math.PI * 2 + (i % 3) * 0.01; const r0 = 80 + ((i * 53) % 60), r1 = Math.max(W, H); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 0; y < H; y += 10) for (let x = (y / 10) % 2 * 5; x < W; x += 10) { const d = Math.hypot(x - cx, y - cy) / Math.max(W, H); ctx.beginPath(); ctx.arc(x, y, 2.4 * (1 - d), 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function superSplash(ctx, S, W, H) {
    // comic panel: a slanted band across the screen with the fighter's colour, name and the super's name
    const k = 60 - R.superT; const f = S.f[R.superBy]; if (!f) return; const ch = FIGHTERS[f.id]; const mv = ch.moves.SU;
    const inT = Math.min(1, k / 8), outT = R.superT < 10 ? R.superT / 10 : 1; const a = inT * outT;
    const left = R.superBy === 0;
    ctx.save(); ctx.globalAlpha = a;
    const bh = Math.min(H * 0.26, 150), y = H * 0.18;
    const slide = (1 - inT) * W * (left ? -1 : 1);
    ctx.translate(slide, 0);
    ctx.fillStyle = '#0b0b10'; ctx.beginPath(); ctx.moveTo(0, y + 14); ctx.lineTo(W, y - 14); ctx.lineTo(W, y + bh + 14); ctx.lineTo(0, y + bh + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ch.color; ctx.beginPath(); ctx.moveTo(0, y + 20); ctx.lineTo(W, y - 8); ctx.lineTo(W, y + bh + 8); ctx.lineTo(0, y + bh + 34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 40; i++) ctx.fillRect(((i * 97 + k * 18) % (W + 200)) - 100, y + (i * 31) % bh, 120, 3);
    const sz = Math.min(bh * 0.42, W * 0.075);
    ctx.textAlign = left ? 'left' : 'right'; ctx.textBaseline = 'middle';
    const tx = left ? W * 0.06 : W * 0.94;
    ctx.font = `400 ${sz}px Bangers, Rajdhani, sans-serif`; ctx.lineJoin = 'round'; ctx.lineWidth = sz * 0.14; ctx.strokeStyle = '#0b0b10'; ctx.strokeText(mv.name.toUpperCase(), tx, y + bh * 0.42); ctx.fillStyle = '#fff'; ctx.fillText(mv.name.toUpperCase(), tx, y + bh * 0.42);
    ctx.font = `700 ${sz * 0.42}px Rajdhani, sans-serif`; ctx.fillStyle = '#0b0b10'; ctx.fillText(ch.name + ' · ' + ch.jp, tx, y + bh * 0.78);
    ctx.restore();
  }
  return R;
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
