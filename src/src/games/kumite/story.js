// NEON KUMITE · Arcade story. One night, one neighbourhood under the Shimbashi viaduct, one sealed box.
// Rin carries it, Ganji is owed what is inside it, Suzu's stolen part is inside it, Sayo wants to open it first.
export const STORY = {
  intro: {
    rin: ['Rin Hayase, bike courier. One sealed box, one address under the tracks, due at 2:00.', 'Nobody is taking this delivery off her bike.'],
    ganji: ['Ganji Oshima, the door at the bar under the tracks. Three months unpaid.', 'The boss says the money arrives in a box tonight. He will be at the door when it does.'],
    suzu: ['Suzu Mizushiro, drone tech. Last week someone stole her drone’s flight core.', 'Her tracker says it is in a courier’s bag, heading for Shimbashi.'],
    sayo: ['Sayo Kurose, stunt double between jobs. The alley says a box is coming that someone will fight to open.', 'She wants to open it first. Just to know.'],
  },
  // one exchange before each fight: [what the player's fighter says, what the opponent says]
  banter: {
    'rin>ganji': ['Delivery for the bar. Sign here.', 'Box first. Then we talk about signing.'],
    'rin>suzu': ['Package is sealed. Not yours.', 'My tracker disagrees. It keeps receipts.'],
    'rin>sayo': ['You have been on my tail for six blocks.', 'Seven. You missed one.'],
    'ganji>rin': ['That box is my back pay.', 'Then sign for it after I deliver it.'],
    'ganji>suzu': ['No drones past the door.', 'It is not past the door. It is above it.'],
    'ganji>sayo': ['You are not on the list.', 'I am never on the list. I am usually already inside.'],
    'suzu>rin': ['You are carrying stolen hardware.', 'I am carrying a box. Take it up with the sender.'],
    'suzu>ganji': ['The box is going to your bar. Step aside.', 'Everything going to my bar goes through me.'],
    'suzu>sayo': ['Stop flickering on my sensors.', 'Then stop looking for me.'],
    'sayo>rin': ['What is in the box?', 'Not my business. Not yours either.'],
    'sayo>ganji': ['I hear the box pays your wages.', 'You hear a lot for someone nobody invited.'],
    'sayo>suzu': ['Your drone keeps taking my picture.', 'It photographs trespassers. You keep qualifying.'],
    'rin>rin': ['Wrong dispatch. Wrong colour.', 'Same box. Faster bike.'],
    'ganji>ganji': ['One door. One doorman.', 'Then we see who is still standing at two.'],
    'suzu>suzu': ['That visor is my design.', 'Was. Prove it.'],
    'sayo>sayo': ['You took my fall on that roof.', 'You were too slow to take it yourself.'],
  },
  // the rival beat before the final: why this mirror is the one that matters
  rival: {
    rin: 'A courier in orange took the same job from a rival dispatch. Only one signature counts at 2:00.',
    ganji: 'The bar hired a second doorman in a white coat. He says the door, and the pay, are his now.',
    suzu: 'Whoever stole the core copied her rig down to the visor. They are waiting on the roof.',
    sayo: 'The double who replaced her on the rooftop shoot heard the same rumour. Same moves, better billing.',
  },
  ending: {
    rin: ['1:58. Signed for, on time, the seal never broken.', 'The doorman paid the tip in yakitori. She ate it on the bike, going home the long way.'],
    ganji: ['The box held the bar’s takings and three months of his pay.', 'He locked the door at two, sat on the step and let the last train go over.'],
    suzu: ['The box held her flight core. The drone flew again before the last train.', 'She sent the courier an invoice for the delay. Then marked it paid.'],
    sayo: ['She opened it first, on the roof, under Tokyo Tower.', 'A flight core, a bar’s takings and a note in a courier’s hand: FRAGILE.', 'She closed the lid and left it on the doorstep. Knowing was enough.'],
  },
};
export const bant = (a, b) => STORY.banter[a + '>' + b] || null;
