# V3 resume notes (written at the planned pause, 02:30 UTC 25 Nov)

Owner's standing instruction: pause when the 5-hour usage window is about 75 percent used (he needs 25 percent for other work), resume at the reset.
The meter is not readable from inside the session: estimate by agent-minutes (the 20:40 window went 0 to 100 percent in about 185 agent-minutes plus the
integrator's own turns), so budget about 120 agent-minutes per window, then stop the agents, commit, and wait for the next reset.
Never more than 3 agents at once, one Chromium each, always closed (the container restarted twice from browser load).

## State
- Live: REDLINE v3 (real C1 loop, TOKYO look), arcade hub, ITO r1, KUMITE r2, KAZE r1, MACHI r2. Release worktree: scratchpad/rel (commit eec8162).
- Committed WIP (c4970eb, all suites pass, site builds): KAZE figures redrawn r2 + boss backdrop half done; KUMITE fighters redrawn r3 + art fixes
  half done; ITO playability r2 nearly done (tests green, visual check pending) + story.js started.
- Owner priorities, newest first: playability and story matter most; no 3D rebuild now; KAZE and KUMITE character design was "borderline shit" /
  "sucks big time" (atmosphere fine); KAZE boss fights get a red backdrop with real cinematic weight; "a few character designs are still a bit off" in
  KAZE: study what ronin really looked like and how ronin are drawn, then correct.

## Resume each builder with SendMessage (context intact) and point it at the list below
- KAZE a96e8e6fec773fc6e: (1) art director notes: lean 7.5-head figures, obi, long pleated hakama, near sleeve separated from torso, sword as the star,
  pushed key poses, camera eases in for fights, tucked dodge roll; (2) RONIN REFERENCE pass (below); (3) red boss backdrop (was mid-way: lantern sparks,
  then the five-boss contact sheet); (4) measuring table (solidity, limb weight, proportion, screen size, line, distinct cast, frames, contrast);
  (5) playability personas (masher / learner / competent) and default difficulty tuning, self-teaching first fight and standoff, cheap death;
  (6) story through-line, full script in the report.
- KUMITE ad57f81de1bb8825d: (1) art director notes: heroic 7 to 7.5 heads, real stances not chair squats, hard-edged cel shadows and highlights,
  3/4 faces with sharper jaws and lids, costume detail, full attack-pose redo with smears, close-range readability, sparks off faces (was finishing:
  Ganji and Suzu values, Suzu air-chop recovery); (2) measuring table; (3) re-run masher numbers after the art; first-fight prompt; NORMAL default;
  (4) arcade story for four fighters (intro card, per-matchup banter, rival beat, ending card), full script in the report.
- ITO a3862812e6f0a0f5f: finish the playability round (persona numbers before/after; desktop + phone portrait + landscape check of run start and
  mid-run), then the small delivery story (story.js exists), full script in the report.
- Then: integrator looks at every model sheet and in-game frame BEFORE accepting; deploy per game as each passes (build from a clean worktree at a commit);
  new cabinet captures for kaze/kumite/ito; REDLINE independent review if budget remains; final report.

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
