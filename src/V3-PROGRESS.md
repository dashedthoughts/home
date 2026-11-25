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

## 22:00 UTC — container restart, relaunch with a concurrency cap
- The container restarted at ~21:56 (six agents each running headless Chromium; second restart of the session). Files survived; all tests pass; WIP committed (`1296dcd`) and the source snapshot pushed to the home branch as a backup.
- RULE from now on: at most 3 agents at once, one Chromium each, always closed.
- Integrator looked at the city pass (`w-city/r9-sheet.png`): geography right, picture still arcade (giant red trail ribbons, magenta sky, flat box buildings, green pickup fog). Wrote `scratchpad/ART-DIRECTION-2.md`: a realistic default TOKYO look. Light agent resumed as LOOK engineer, City agent resumed on facades first (both via SendMessage, context intact: ids a6d9e860ad1086c51, aa59423e14b1e4e96).
- KUMITE round-2 fixer resumed (ad57f81de1bb8825d). Queue: MACHI fixer (a6bc7d6e2636e629e, critic report scratchpad/crit-machi.txt), then critics for ITO and KAZE (prompt: scratchpad/critic-prompt.txt), then REDLINE review.

## 22:12 UTC
- KUMITE round 2 committed (`161e1dc`) and DEPLOYED (built in scratchpad/early: games from HEAD except machi at 67e4a21, REDLINE at checkpoint). Live verified by hash.
- Running (3): LOOK (a6d9e860ad1086c51), CITY (aa59423e14b1e4e96), MACHI fixer (a6bc7d6e2636e629e). Queue: ITO critic, KAZE critic, REDLINE review, final integration + deploy of REDLINE v3, README, final report.

## 01:45 UTC (25 Nov) — second usage limit, restart
- Limit hit ~22:12, reset 01:40. Owner is back ("Go go go"). WIP committed (`462b17a`): sim tests pass, machi 103 checks pass, site builds.
- Resumed via SendMessage: LOOK (a6d9e860ad1086c51), CITY (aa59423e14b1e4e96), MACHI fixer (a6bc7d6e2636e629e).
- Live: arcade + four games (KUMITE at round 2, MACHI at round 1), REDLINE at the pre-v3 checkpoint.
- Still queued: ITO and KAZE critics, REDLINE review, REDLINE v3 integration + deploy, README (REDLINE section, OSM credit), final report.

## 02:12 UTC — REDLINE v3 live
- LOOK and CITY reports in; integrator checks passed (sim + 4 game suites, site build, desktop + phone REDLINE flow; one HUD overlap fixed: radio vs map/place plate, ghost chip). Release built from a clean worktree at `eec8162` (scratchpad/rel) and DEPLOYED with MACHI round 2 and the README (REDLINE section rewritten, OSM credit). Live verified by hash.
- Owner feedback (02:00): KAZE and KUMITE character design is bad ("stick figures", "sucks big time"), atmosphere fine. References given: /home/user/johnheibel/claudeanimationbase (ANIMATION_GUIDE.md), /home/user/ref/claude-code-anime-mj (masters list); a Reddit post that cannot be fetched from here.
- Running: KAZE character redesign (a96e8e6fec773fc6e), KUMITE character redesign (ad57f81de1bb8825d), ITO critic (a198d9b860dde659a).
- Next: review both model sheets myself before accepting; ITO fixes from its critic; REDLINE independent review if budget allows; new cabinet captures (redline.jpg and machi.jpg already replaced, uncommitted until next deploy); final report.

## 02:30 UTC — planned pause (owner: stop at ~75% of the usage window, keep 25% for him)
- Stopped KAZE, KUMITE and ITO builders mid-round; all suites pass and the site builds with their WIP; committed `c4970eb`.
- Everything needed to resume is in `src/RESUME-NOTES.md`. Next reset is about 06:40 UTC; check-in 7 fires at 06:45.
