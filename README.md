# charliebrockmeier.com

Charlie Brockmeier's personal site: a video-game "player profile" with a one-page resume for anyone in a hurry.

- **Home (`/`)**: title screen, character sheet, stats, quest log, party (AI agents), inventory, achievements, side quests and a talk-to-Charlie dialogue box.
- **Resume (`/resume`)**: the same facts on one printable page. Press <kbd>R</kbd> from home. The download is `public/charlie-brockmeier-resume.pdf`.

Built with [Astro](https://astro.build), static output, about 2 KB of JavaScript.

## Run it locally

Requires Node 22 or later.

```sh
npm install
npm run dev        # http://localhost:4321
```

`npm run build` writes the static site to `dist/`; `npm run preview` serves that build.

## Where things live

| Path | What |
|---|---|
| `src/data/profile.ts` | Every fact and line of copy on the site |
| `src/data/pixels.ts` | Hand-drawn sprite and icons, as rows of palette keys |
| `scripts/art/` | The pixel scenes, drawn in code. `npm run art` regenerates `public/art/*.png` |
| `src/components/` | One component per section |
| `src/styles/tokens.css` | The "Dusk" palette, type scale and spacing |
| `PLAN.md` | The plan and what's next |

The previous version of the site (the waves splash page and Rocky the pet rock) is in this repo's history before the "Player profile" commit.
