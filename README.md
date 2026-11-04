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
| `resume.pdf`, `site.json` | résumé and links (see above) |

Routes: `#/` home · `#/p/<slug>` case study · `#/play` REDLINE · `#/chill` Night Shift · `#/system` design system.

## REDLINE
A night drive through an original Midnight-Tokyo-style megacity. Five data shards decrypt one case file; ten files end the run at the lookout above the city. Junctions every 1.5 km let you hold a lane to pick Expressway or Backstreets (tighter, shards ×1.5); a tunnel follows each one. Garage: the Vanta GT (louvred tail, plate 2FAST4U) and the Tsubame bike (lean, power-slide on hard braking), liveries, underglow, four times of day, rain, three difficulties, steering assist, reduced effects, synthesized sound and music. Keyboard, touch and gamepad.

Art direction borrows the language of 80s cel-anime cities and light-cycle films; no vehicles, logos, characters or places from any film or game are used.

Graphics: AUTO by default (Balanced on desktop, Low on phones, steps down by itself if frames drop); High adds 2.1 MP and 4× MSAA.

`window.__redline` exposes `pause()`, `advance(sec)`, `state()` for screenshots and debugging.

