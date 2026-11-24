# home: Dash's Playground

Anuraag Dash, the night build.

Live: https://dashedthoughts.github.io/home/ · The classic site stays at https://dashedthoughts.github.io/portfolio/

## Swap things without touching code
Everything below goes live about a minute after you commit it (GitHub web: open the file → ✏️ edit, or **Add file → Upload files**).

| To change | Do this |
|---|---|
| **Photos** (home page strip) | Upload, replace or delete images in [`photos/`](photos). Any JPG, PNG or WebP; shown in name order. |
| **Résumé** | Replace [`resume.pdf`](resume.pdf) with a file of the same name (or point `resume` in `site.json` at a new file name). |
| **Email, LinkedIn, Reddit, classic-site link** | Edit [`site.json`](site.json). |

```json
{
  "email": "anur.dash@gmail.com",
  "linkedin": "https://www.linkedin.com/in/adash14/",
  "reddit": "https://www.reddit.com/user/dashedthoughts",
  "classic": "https://dashedthoughts.github.io/portfolio/",
  "resume": "resume.pdf",
  "photosRepo": "dashedthoughts/home",
  "photosFolder": "photos"
}
```

## What's here
| Path | What |
|---|---|
| `index.html`, `assets/` | the built site (do not edit by hand) |
| `cases/` | case-study media: deck pages, PDFs, demo video |
| `photos/` | the photo strip |
| `media/arcade/` | one capture per game for the arcade cabinets (`<game>.jpg`, 16:9) |
| `resume.pdf`, `site.json` | résumé and links (see above) |

Routes: `#/` home · `#/p/<slug>` case study · `#/arcade` the arcade · `#/arcade/<game>` one game · `#/play` REDLINE · `#/chill` Night Shift · `#/system` design system.

## The arcade
`#/arcade` is a floor of original games. Each one is its own lazy chunk, so nothing downloads until someone opens it; all of them run on keyboard, touch and gamepad, and keep their saves in the browser.

| Game | What it is |
|---|---|
| **REDLINE** `#/play` | the night race (below) |
| **ITO 糸** `#/arcade/ito` | 3D swing traversal in a comic-book city: three timed delivery runs with medals and a ghost, plus free roam |
| **NEON KUMITE 組手** `#/arcade/kumite` | a versus fighter: four fighters, three stages, arcade ladder, 1P vs CPU or 2P on one keyboard, training and move list |
| **KAZE 風** `#/arcade/kaze` | ink-wash duels: five chapters, standoffs, parries, five bosses |
| **MACHI 街** `#/arcade/machi` | a voxel block of Tokyo to rebuild: eight tools, walk mode, photo mode, three save slots |

To take a game off the floor, set `hidden: true` on its entry in `src/src/games/registry.js` and rebuild. The cabinet pictures are `media/arcade/<game>.jpg`.

## REDLINE
A night drive through an original Midnight-Tokyo-style megacity. Five data shards open one case file; ten files end the run at the lookout, and whoever is in front at that moment wins.

- **Modes:** Race (against KUROGANE), Road Brawl (bike), Zen Race (no damage, no police), Free Run.
- **The rival:** launches past you off the line, makes attack runs, blocks your lane, sprints over the last two files. Whip him with X; he parries for a few seconds after a hit.
- **Crashes:** severity follows closing speed; a truck barely moves. Four hits on STREET, and every file you open repairs one. The last hit is a spin-out.
- **Police:** sustained top speed and crashes build a wanted level; each full star brings a cruiser. Outrun them, outlast them or whip them back.
- **Road:** junctions every 1.5 km (Expressway or Backstreets), a tunnel after each, and traffic that thickens every sector.
- **Rain:** less grip, longer braking, aquaplaning flat out. Tunnels are dry.
- **Garage:** the Vanta GT and the Tsubame bike, liveries, underglow, five times of day, weather, three difficulties, radio (YouTube Mix or the built-in synth). Keyboard, touch and gamepad.

Art direction borrows the language of 80s cel-anime cities and light-cycle films; no vehicles, logos, characters or places from any film or game are used.

Graphics: AUTO by default (Balanced on desktop, Low on phones, steps down by itself if frames drop); High adds 2.1 MP and 4× MSAA.
