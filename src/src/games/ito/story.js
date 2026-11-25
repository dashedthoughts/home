// ITO, the story. Told in a few lines on a radio plate so it never stops the swinging.
// You carry for Hana, who runs dispatch from a noodle stall under the tracks. Tonight: one small box, wrapped in
// paper and string, that keeps changing address. Three drops, one night.
export const STORY = {
  who: 'Dispatch · Hana',
  intro: 'You carry for Hana. She runs dispatch from a noodle stall under the tracks. Tonight there is one small box, and it keeps changing address.',
  runs: [
    {
      start: 'One box, the tower at the end of the avenue. Light as a letter. Don’t shake it, don’t open it.',
      end: 'Signed for. They asked who sent it. I said the kid with the string. Come back, there’s more.',
    },
    {
      start: 'Rush order. Same box, sent back. The new address keeps moving. Chase the rings, I’ll chase them.',
      end: 'Third address, nobody home. Keep the box. I know where it goes now.',
    },
    {
      start: 'Last train’s pulling in. The box was never theirs. Bring it to the shrine in the park.',
      end: 'That’s me by the torii. Open it. Paper cranes. Nine hundred and seventy. The other thirty are up on the roofs.',
    },
  ],
  medal: {
    gold: 'Early. I’ll have to find you harder work.',
    silver: 'On time. That’s the whole job.',
    bronze: 'Late, but it got there. It got there.',
    none: 'It arrived. We’ll call it the scenic route.',
  },
  // free roam: the cranes Hana's mother folded, left on the roofs where the good lines are
  cranes: {
    1: 'One. My mother left them where the good lines are. Go look.',
    10: 'Ten. She folded the first nine hundred and seventy. Keep going.',
    30: 'That’s all of them. A thousand. It’s the steam from the stall, I’m fine.',
  },
};
