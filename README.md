# charliebrockmeier.com

Charlie Brockmeier's personal site: a pixel-art player profile, with a one-page resume for anyone in a hurry.

- `/`: the profile. The walk from Kearney to New York, the quest log, skill tree, map, chess (with a bot you can play), projects and travel.
- `/resume`: the same facts on one printable page (press <kbd>R</kbd> on the home page). The PDF is `public/charlie-brockmeier-resume.pdf`.
- `/contact`: email, links and the resume.
- `/projects/<id>`: a page per project.
- `/writing/illiquidity-premium`: *The Illiquidity Premium, Revisited* (2026), a rewrite of a college paper with charts, a calculator and 90 sources. The 2025 original is at `/writing/illiquidity-premium-2025`.

Press <kbd>⌘K</kbd> or <kbd>/</kbd> on any page to search the site.

Built with [Astro](https://astro.build) as a static site.

## Run it locally

Requires Node 22 or later.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # writes dist/; fetches live chess and GitHub numbers first
npm run preview    # serves dist/
npm run check      # after a build: every page at phone to desktop widths, no overflow or console errors
npm run check:paper  # every citation in the paper points to a source
npm run pdf        # after a build: reprint the resume and paper PDFs
```

`check` and `pdf` use Playwright: `npm i -D playwright && npx playwright install chromium` once.

Working on this with Claude Code? `CLAUDE.md` has the project notes and rules.

## Where things live

| Path | What |
|---|---|
| `src/data/profile.ts` | Most of the copy: bio, chapters, projects, achievements, resume |
| `src/data/skills.ts`, `sidequests.ts`, `travel.ts`, `journey.ts` | Skill tree, trips, map and the walk |
| `src/data/logos.ts`, `pixels.ts` | Pixel logos, the sprite and icons, as rows of palette keys |
| `scripts/art/` | The pixel scenes, drawn in code. `npm run art` regenerates `public/art/*.png` |
| `scripts/fetch-stats.mjs` | Pulls chess.com games and public GitHub repos into `src/data/live.json` before each build. Keeps the last numbers if a source is down |
| `src/data/paper2026.ts`, `paper2026-figures.ts` | The paper's text, sources, charts and tables |
| `scripts/spotify-stats.py` | Rebuilds the Spotify card from a Spotify data export: `npm run spotify -- "<export folder>"`. Reads only the listening history and Wrapped files |
| `scripts/claude-stats.mjs` | Adds Claude Code usage from your own computer to `src/data/claude.json` (totals only). Run `npm run claude-stats`, then commit |
| `src/scripts/chess/` | The chess bot: chess.js for rules and Stockfish (GPL-3.0, in `public/engine/`) in a web worker |

## Deploy

Vercel, from this repo: framework preset Astro, build command `npm run build`, output `dist`. `charliebrockmeier.com` currently serves Locus, so move Locus to its own subdomain before pointing the domain here.
