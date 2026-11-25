# V3 resume notes (written at the planned pause, 02:30 UTC 25 Nov)

Owner's standing instruction: pause when the 5-hour usage window is about 75 percent used (he needs 25 percent for other work), resume at the reset.
The meter is not readable from inside the session: estimate by agent-minutes (the 20:40 window went 0 to 100 percent in about 185 agent-minutes plus the
integrator's own turns), so budget about 120 agent-minutes per window, then stop the agents, commit, and wait for the next reset.
Never more than 3 agents at once, one Chromium each, always closed (the container restarted twice from browser load).

## State (07:27 UTC 25 Nov, second planned pause)
- Live: REDLINE v3 + difficulty retune (config.js DIFFICULTY: STREET density 0.5, trafficSpeed 1.15, lives 5), ITO r2 complete, KUMITE r3,
  KAZE r4, MACHI r2, arcade hub with new captures. Release worktree: scratchpad/rel (kept in step with HEAD per game).
- All suites green at HEAD. Nothing half-done is uncommitted.
- Owner priorities, newest first: playability and story matter most; no 3D rebuild now; character design quality in KAZE and KUMITE;
  realistic Cyberpunk Tokyo in REDLINE.

## Next round, in order (max 3 agents, one Chromium each)
1. REDLINE fix round from the independent playtest (full report: scratchpad/crit-redline.txt; driver study scripts in scratchpad/w-crit-redline/,
   reuse drivers.mjs / tune2.mjs as the yardstick). Done already: the STREET retune (clumsy driver now finishes 6 of 8, was 0 of 8). Still to do, ranked:
   a. story layer (the critic's script: title line, dispatch plates per district/junction, KUROGANE lines, finale lines) using the existing pop slot
      and the district/junction events; name each case file as it opens (it is a portfolio project) and list opened files as links on both results panels;
   b. traffic ramp: spawnTraffic `esc` starts ~0.5 in sector 1; no car in the player's lane before S.dist > 600;
   c. bends that matter + a bend sign that warns in time (corner speed vC, look-ahead speed*2.8 s, hold 1.5 s, target speed on the sign); only with (b);
   d. Free Run = no lives, no police, light traffic, one full lap; Zen lighter with steering assist; the finale currently ends at Tanimachi so
      Shibakoen / Tokyo Tower is never driven before the lookout: move the finale or let the lap complete;
   e. landscape-phone pause/results panel opens scrolled (focus with preventScroll), two-column results;
   f. radio player out of the race HUD (title and pause only; a one-line chip in the race);
   g. pickups/boost glow toned down further, shard instances follow the road bend; facade ambient near zero at night, the grey road smear ahead-left
      of the car, repeating neon hoarding, whiter tunnel lamps;
   h. the lost `over` event when pausing on a slow frame (let over/complete through in any phase; update phaseRef in togglePause/start).
2. KUMITE: idle stances still low in the knees; rim light reads as trouser piping; per-move pose pass.
3. KAZE: ronin kinagashi + haori option, archer raises the bow before the draw, Shizu's naginata bolder at game scale, phone portrait check; a human play.
4. MACHI: desktop polish (issue 8), lo-fi music toggle, light pools under shotengai lanterns.
5. Final report for the owner (what shipped, evidence, what is not verified: audio, real GPU frame rate, human play; rollback: commit 1ad129b).

## RONIN REFERENCE (integrator's notes; verify and extend with a research pass at resume)
One period print was retrieved before the image host rate-limited us: Utagawa Kuniyoshi, "Seichu gishi den" (the loyal retainers series, c. 1847,
public domain; scratchpad/ref-ronin/00.jpg). What it and the wider record show, for the figures:
- Dress: kimono (kosode) crossed left over right, tied with an obi; over it either a hakama (wide pleated trousers tied at the waist with long
  cords, a stiff board at the small of the back) or, typical of a masterless man, no hakama at all (kinagashi: the kimono worn loose to the ankle).
  A haori (hip-length jacket) for travel. Ronin clothes are plain, dark, faded, patched; no crisp crests.
- Hair: a serving samurai shaved the crown and wore a topknot; a ronin's crown has grown out, so the hair is full, tied back or in a rough topknot,
  often with stubble on the face. This single detail is what says "ronin" rather than "samurai".
- Swords: two, the long katana and the short wakizashi, thrust through the obi on the LEFT hip, cutting edge UP, hilts forward at about 45 degrees,
  scabbards angled back and down behind the left hip. Drawn with the right hand. The left hand rests on the scabbard mouth. In a fight the long
  sleeves are tied back with a cord crossing the back (tasuki) and a headband is common.
- Hats and feet: the deep woven "basket" hat that hides the face is the classic wandering-ronin hat; also a wide shallow cone of sedge. Straw
  sandals (waraji) tied round the ankle with split-toe socks, or bare feet; a straw rain cape in bad weather.
- Stance and movement (kenjutsu): feet shoulder-width, right foot forward, hips square and low, back straight; guards are middle (tip at the
  opponent's throat), high (sword overhead), low, side (blade hidden behind the hip) and shoulder (sword vertical by the right ear). Cuts come from
  the hips with both hands on a long hilt, hands a fist apart. The draw-cut starts from a low crouch with the left thumb pushing the guard.
- How prints and ink painters draw them: big clear costume shapes with strong pattern or solid black, a low wide stance, calligraphic outline that
  swells and thins, small precise hands and feet, the face a few sharp lines, hair as a solid black mass with a ragged edge, and the two scabbards
  always breaking the silhouette behind the hip.
What to check in KAZE's cast against this: two swords at the left hip on the ronin and the duelist, hair that reads as grown-out, no hakama on at
least some figures (the ronin himself may read better kinagashi with a travel haori), sleeves tied back in fights, straw sandals, and the
scabbards visible in the silhouette. Keep every design original.

## Owner feedback at ~15:00 UTC 25 Nov (usage limit hit; resume at 16:40 UTC / 22:10 IST)
KAZE is live at 308afbb. The owner played it and says (two screenshots: chapter 2 standoff, /tmp/claude-0/-home-user/a62bd8c0-dc8d-569b-8ca1-4d8ae268e991/images/33.webp and 34.webp):
- "The heads are still an issue": the ronin's face reads as a pale blank mask under the hat; the opponent's face is a flat profile.
- "Running still sucks."
- "The head dies while sliding" (the head breaks/vanishes or folds during the dodge slide).
- "The bosses look like clowns while coming" (boss approach poses/gaits).
- "Swoops aren't smooth" (cut strokes and sword arcs not smooth: interpolation and trail).
- "Animation needs significant work."
- "The scarecrow is unbeatable" (Ono, chapter 2 boss: rebalance; check with personas AND a scripted human-like play; parry windows vs his spear).
- "Parry isn't working great" (check parry input window, feedback, and that a correct parry always works and is shown).
- "Our dude isn't doing somersaults or in-air acrobatics": significant expansion of acrobatics (flips, aerial cuts, wall/foe vaults) and the ragdoll and animation library.
- Integrator's own note from the screenshots: the standoff crouch reads as SITTING ON AN INVISIBLE STOOL (front thigh horizontal, shin vertical, torso upright) and the ronin's hakama flares as two huge bell-bottoms; both need fixing.
Resume plan: SendMessage the figure engineer (a96e8e6fec773fc6e) with all of the figure/animation items (heads, run, slide head, boss approach, swoops, standoff crouch, hakama width, acrobatics, library, ragdoll), the ink-and-life engineer (a9a56e8aa04e3e86b) with the cherry duel beats, and the combat engineer (ab6a66f35652040fc) with "scarecrow unbeatable" and "parry isn't working great" (both measured, both fixed, both proven in a real-key browser play).
