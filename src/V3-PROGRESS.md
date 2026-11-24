# V3 progress log (integrator's notes; read this first after any restart)

Owner is away ~7 h from 2026-11-24 ~17:00 UTC and asked: run autonomously, restart yourself if a usage limit pauses things, go all out.
Checkpoint to return to: local git tag `checkpoint-pre-v3` in /home/user/home-site; deployed state = dashedthoughts/home branch
claude/vibrant-curie-0x7eb2 @ 1ad129b (main was published from it). Tag pushes are refused by the proxy, so the checkpoint is those commits.

## Plan
1. DONE scaffold: arcade shell (#/arcade, #/arcade/<id>), per-game private builds (tools/build-game.mjs), SKIP_GAMES/OUT_DIR in build.mjs,
   real C1 road data (src/game/track/c1.json via tools/build-c1.py), shared brief (V3-BRIEF.md).
2. RUNNING round 1 builders (all model opus, effort high):
   - Workflow redline-v3-tokyo (run wf_20308cf2-3ea; script in ~/.claude/projects/-home-user/<session>/workflows/scripts/): lane A = Track → City → Review;
     lane B = Light (AA, reflections, tone) → Car (new extra car, hidden unless clearly better).
   - Agent tool, background: ITO (swing game), NEON KUMITE (fighter), KAZE (ink-wash duels), MACHI (voxel builder). Each owns src/games/<id>/ + src/styles/games/<id>.css.
3. NEXT round 2: for each finished piece, an independent playtest/critic agent + fix pass (Workflow, 2 at a time), especially fun/feel and phone layouts.
4. Integration (me): full build, home page arcade section, README/DESIGN credits (OpenStreetMap attribution!), regression suite
   (scratchpad smoke.cjs, hud.cjs, a11y.cjs, node test/sim.test.mjs, each game's test.mjs), bundle sizes, phone screenshots of every screen.
5. Deploy: commit home-site; sync to /home/user/home (tar, exclude .git, node_modules, README.md); commit; push branch; publish main via worktree without src/ and DESIGN.md
   (see earlier deploy commands in the conversation); verify live. Only deploy what passes; hide unfinished games from the registry rather than ship them broken.
6. Final report to the owner: what shipped, evidence, what is not good enough yet, how to roll back.

## Status notes (append below)

## 20:50 UTC — restart after the usage limit
- Limit hit ~18:20, reset 20:40. Round-1 state committed as `bbc134f` (track done and tested; light partial; four games in progress).
- Relaunched: REDLINE pipeline Light (finish) → City → Review, sequential; four game builders resumed with a "finish, verify, report" order.
- Integrator next: arcade teaser on the home page, README credit, regression, deploy what passes; hide anything unfinished in `games/registry.js`.

## 21:20 UTC — first increment live
- All four games reported complete with passing tests: ITO, NEON KUMITE (frame-data tests fixed truthfully + one real pushbox bug), KAZE (379 checks), MACHI (91 checks).
- Arcade hub rebuilt as a bento of cabinets with real captures (`media/arcade/<id>.jpg`); arcade section on the home page.
- DEPLOYED (branch a6aed6a, main published): arcade + four games, with REDLINE still at the pre-v3 checkpoint (built from a worktree: games from HEAD, `src/src/game` + Play from tag `checkpoint-pre-v3`). Live check: hub shows 5 cabinets with images, kaze/kumite mount, no errors.
- REDLINE: track stage's report embedded in a new workflow script (`redline-v3b.js`); Light and City running in parallel, Review after.
- Round 2 started: independent playtest critics for KUMITE and MACHI (then ITO, KAZE); findings go back to the builders.
- Integrator notes for round 2: KAZE has a faint vertical paler band (tile seam) in the sky in two chapters.
