// REDLINE · the script. Every line a player reads during a run is in this one file, so it can be edited in one place.
//
// The story: you are a night courier for a one-person studio. The studio's ten case files (the portfolio projects) are
// loose as data on the ring road tonight, and you are collecting them before dawn. DISPATCH is the voice in your ear.
// KUROGANE is a rival courier who wants the same files. The lookout, the last exit, under the lattice tower, is where
// the night ends and the work is handed over.
//
// The road is the game's own (invented) city, not a real map: a junction every 1.5 km where the lane you hold picks
// the next stretch (left lanes: the EXPRESSWAY; right lane: the BACKSTREETS, tighter, slower traffic, shards pay
// half again), and a short tunnel right after each junction (dry road, solid lines, no lane changes). Lines speak
// only about those things; no real places.
//
// House rules for a line: plain, dry, under about nine words, no em-dashes.
// One plate shows at a time (Play.jsx): a must-see plate (impact, file, police) can replace a story plate, a story plate
// waits for a free moment and is never shown over a bend warning, and it is dropped if the moment has passed.
//
// Where a list is given, lines are used in order, one per occasion, and then the game goes quiet (it falls back to
// the short HUD call-out), so nothing repeats in a run. Add or remove lines freely. An empty string or a missing key
// means "no plate here".

export const SPEAKERS = { dispatch: 'DISPATCH', rival: 'KUROGANE' };

export const STORY = {
  // title screen, under the REDLINE logo
  title: 'Ten files, loose on the ring road. Home before dawn.',
  // countdown, above the rules line
  countdown: 'Ten files, one night. Bring the car back too.',

  // right after GO
  start: "You're live. KUROGANE heard about the files too.",

  // about 600 m before each junction, in order (sector 1's junction first)
  junctionAhead: [
    'Junction ahead. Right lane takes the backstreets.',
    'Another split. Your lane is your route.',
    'Backstreets pay more. They bite more, too.',
    'Junction coming. Pick a lane and mean it.',
  ],
  // the tunnel right after a junction: the first one gets this line...
  tunnel: 'Tunnel. Dry road, solid lines. Breathe.',
  // ...after that, a line for the route you just picked (in order, per route)
  routes: {
    expressway: ['Expressway. Open road, fast traffic.', 'Back on the expressway. Stretch its legs.', 'Expressway again. Thread them, collect.'],
    backstreets: ['Backstreets. Tight streets. Shards pay half again.', 'Backstreets again. Slow traffic, quick hands.', 'Signs everywhere. Eyes on the road.'],
  },

  // a case file opens: "FILE 03 · <project title>" with this under it ({left} = "Seven", "One"...)
  fileOpen: 'Recovered. {left} to go.',
  fileLast: "Recovered. That's all ten.",

  // a crash that costs integrity
  hit: ["That'll come out of your pay.", "The car's on loan. Remember that.", 'Paint costs money. So do you.', 'Still in one piece? Keep going.'],
  police: "Police on you. Don't lead them to the files.",
  busted: "I'll vouch for you. Once.",

  // KUROGANE
  rivalLaunch: "Evening. I'll take it from here.",
  rivalLean: ['Your lane. My lane now.', 'Mind the paint.'],
  rivalPassed: ['Fine. Keep them warm for me.', 'Enjoy the view. Briefly.'],   // you pass him
  rivalPasses: ['Thanks for the tow.'],                                        // he passes you (after the launch)
  rivalSprint: "Two left. You don't get both.",

  // endings: the plate as the run ends, and the same line on the results panel
  finaleWon: { line: "Last exit. Tower's still lit. So are you.", sub: 'Ten files, all home.' },
  finaleLost: { line: "KUROGANE's already parked. He saved you a coffee.", sub: 'Files are home anyway.' },
  finaleFree: { line: "Ten files, nobody chasing. That's the night.", sub: 'The road is yours.' },
  outOfIntegrity: "Tow's on the way. The files will wait.",
  bustedOut: "I'll vouch for you. Once. This was it.",
};

const NUMBERS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
/** "Recovered. Seven to go." for file n of total. */
export function fileLine(n, total = 10) {
  const left = total - n;
  return left <= 0 ? STORY.fileLast : STORY.fileOpen.replace('{left}', NUMBERS[left] || String(left));
}
