# charliebrockmeier.com: notes for Claude

Charlie Brockmeier's personal site: a pixel-art "player profile" (Astro 7, fully static),
plus a resume page, a contact page, project pages and a long research paper. This file is
the project memory. Read it instead of re-exploring the repo, and keep it current when
something here changes.

The repo is **public** (github.com/charliebrockmeier/charliebrockmeier.com, branch `main`).
Charlie runs it locally with `npm run dev`. It is not deployed yet (see README, Deploy).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Fetches live chess/GitHub numbers (keeps the last ones if offline), then builds `dist/` |
| `npm run check` | After a build: every page at 360/390/768/1280/1440px; fails on horizontal overflow or console errors |
| `npm run check:paper` | Every `[n]` in the paper resolves to a source and every source is cited |
| `npm run paper:data` | Rebuilds `src/data/paper2026-data.json` (Ken French and Treasury data behind the paper's own-arithmetic charts) |
| `npm run pdf` | After a build: reprints the resume and paper PDFs into `public/` and `dist/` |
| `npm run art` | Redraws the pixel art in `public/art/` from `scripts/art/` |
| `npm run spotify -- "<export folder>"` | Rebuilds `src/data/spotify.json` from a Spotify data export |
| `npm run claude-stats` | Adds local Claude Code usage to `src/data/claude.json` |

`check` and `pdf` need Playwright: `npm i -D playwright && npx playwright install chromium` once.

**Before every commit:** `npm run build && npm run check`. If you touched the paper, also
`npm run check:paper`. If you touched resume data or the paper, `npm run pdf` and commit
the PDFs. If you touched `scripts/art/`, `npm run art` and commit the PNGs.
Commit straight to `main` and push. No pull requests unless Charlie asks.

## Where things live

- `src/data/profile.ts`: most copy. Site text, `character`, `bio`, `chess` (streak), `quests` (the career chapters, with `moments` and `highlights`), `builds` (projects), `achievements`, `dialogue` (the Talk box), `resume`.
- `src/data/`: `skills.ts` (skill tree), `sidequests.ts` (trips), `travel.ts` (map routes and flights), `journey.ts` (the walk), `logos.ts` and `pixels.ts` (pixel logos, sprite and icons as rows of palette keys), `projects.ts` (project page copy), `spotify.json`, `claude.json`, `live.json` (generated), `paper2026.ts`, `paper2026-figures.ts` and `paper2026-data.json` (the paper; the JSON is generated).
- `src/pages/`: `index` (the profile), `resume`, `contact` (`/recruiter` redirects here), `projects/[id]`, `writing/illiquidity-premium` (2026 paper), `writing/illiquidity-premium-2025` (the original, frozen), `404`, `sitemap.xml`.
- `src/components/`. The home page, top to bottom:
  - `Hud`
  - `Hero` (player card, PRESS START)
  - `CharacterSheet` and `SkillTree`
  - `Journey` (the walk and play mode)
  - `QuestLog`
  - `MapSection`
  - `Stats` (`Chess`, `ChessBot`, `ClaudeStats`, `SpotifyStats`)
  - `Builds`
  - `Achievements`
  - `SideQuests`
  - `Talk`
  - `Footer`

  On every page:
  - `Reveal` handles the scroll-in, the streak updater, and pausing off-screen sections.
  - `CommandPalette` is ⌘K or / search.

  The paper's charts are in `components/charts/`: `BarChart`, `LineChart`, `ScatterChart`, `Table`, `Heatmap`, `RowChart` (ranked bars and waterfalls), `SeriesChart` (dense time series, log scale), all wrapped by `Figure`.
- `src/scripts/`: `achievements.ts` (unlock, toasts, stars, best run), `game/wipe.ts`, `chess/` (bot: chess.js + Stockfish in a worker, engine in `public/engine/`).
- `scripts/`: build-time and maintenance scripts (table above). `scripts/art/` draws every scene in Node.

## How things work

- **Animations**: Astro does not scope `@keyframes`, so prefix them with the component (`hero-`, `road-`, `quest-`, `map-`, `ach-`, `game-`, `contact-`, `claude-`, …).
  - Every animation honors `prefers-reduced-motion`.
  - Sections off screen get `.offscreen`, which pauses CSS animations. JS loops and SVG animations must pause themselves when off screen.
  - Avoid infinite animations where finite ones do. The target is 60fps.
- **Pixel art** is generated, not hand-edited. PNGs are indexed (at most 256 colors). The walk's near layer is about 238 colors, so watch the palette.
- **Streak**: `chess.streakDays` and `chess.streakAsOf` in `profile.ts`. The site adds one per day on its own (`streakOn()` at build time, a client updater in `Reveal`). Only edit it if the streak resets.
- **Achievements**: unlock from anywhere with `document.dispatchEvent(new CustomEvent('achievement', { detail: 'id' }))`. A new one needs three things:
  - a locked card with that `id` in `profile.ts` `achievements`;
  - its unlocked look in the `reveal` map in `Achievements.astro`;
  - its toast name in `NAMES` in `achievements.ts`.
- **Play mode**: PRESS START (or `dispatchEvent(new CustomEvent('game:start'))` on window) starts it. The 11 stars come from the `journey.ts` moments.
- **Search** (`CommandPalette.astro`) indexes sections, pages, actions, story moments, skills, trips, achievements and paper sections from the data files. Add new pages to its `pages` list.
- **Fonts**: `--font-sans` (Schibsted Grotesk), `--font-pixel` (Jersey 10), `--font-serif` (Newsreader, paper only).

## Writing style

Plain, short, specific. No corporate language and no pitching. Charlie asked for "less
words" and "not a pitch of me as a person". Facts and numbers over adjectives. Use the
past companies' details freely; keep the current employer minimal (below).

## Hard rules

- **Employer (MSCI)**: Charlie joined MSCI (Private Assets, New York, 7 World Trade Center) through MSCI's March 2026 acquisition of Vantager.
  - Say that plainly ("Now: MSCI, New York"). The logo is fine.
  - No internal details, no products, clients or projects, and no promoting.
  - Never use MSCI or Burgiss data anywhere, including the paper. The paper says the views are his own.
  - Never write as if his job is making investment commitments.
- **Privacy**:
  - no phone number;
  - no home address, including his childhood home (the pixel house stays unlabeled);
  - no names of advisory firms, clients or people from his side work. All side projects are "personal projects".
- Link only the accounts already in `profile.ts` `links`; don't add other profiles or blogs. The Talk box is canned dialogue; never say it is "answered by Claude".
- **Spotify export**: read only `StreamingHistory_music_*.json` and `Wrapped*.json`. The other files are personal, so never open or commit them. Exports and screenshots are gitignored.
- Email and Drive, if connected, are read-only.
- The repo is public: no secrets, tokens or personal exports, ever.

## The paper ("The Illiquidity Premium Changed Hands", Nov 2026)

- **Position**: Charlie asked for a hard-sided paper, not a survey. The thesis: after fees and leverage the average private fund has paid nothing for its lockup for at least a decade; investors accept that because smooth marks are worth something to them; the premium now goes to whoever supplies liquidity. Section 1 states it and lists five things that would prove it wrong. Keep that stance when editing; don't soften it back into "it depends".
- **Content**:
  - Prose blocks, the key points, "My take" and the 101 numbered sources are in `src/data/paper2026.ts`.
  - The charts and tables are in `paper2026-figures.ts`. In any text, `{fig:id}` becomes "Figure n" or "Table n" on the page, so never type a figure number.
  - `paper2026-data.json` is generated by `scripts/paper-data.py` (`npm run paper:data`): the marking experiment (the U.S. stock market levered 1.3 times, valued at market and as a four-quarter average), average Treasury bill returns by horizon, and TIPS yields. The sample end (2026Q3) and the Treasury date (2026-11-09) are pinned in the script so a rerun reproduces the numbers in the prose. If you move them, update every number the prose quotes from the experiment.
  - The calculator is `components/charts/PremiumCalculator.astro` (Longstaff bound; the first box shows F/(1+F)).
- **Rules**:
  - Every number is cited `[n]` to a public source, or labeled as Charlie's own arithmetic.
  - Implied or estimated points are marked as such.
  - Keep source numbers 1..N with no gaps (`npm run check:paper`). Don't put an array index like `x[0]` inside a figure's text field; the checker reads it as a citation.
  - After editing: build, `check:paper`, `check`, `pdf`.
- **Verified 2026-11-10**: all labeled arithmetic recomputes exactly (Longstaff bounds, hurdle table, IRR example, secondary implied returns, J-curve and pacing, fee drag, NPI vs REIT, the beta-adjusted premium, the 25-year ledger, the denominator effect). New sources 91–101 were read at the source (NBER and Netspar PDFs, AQR's PDF, Bain, Cambridge, Treasury CSV, the news pages).
- **Still to confirm with Charlie**: the 2026 semi-liquid redemption figures, sources 68–74 and 97.

## Backlog

- Showcase ideas, in Charlie's likely order:
  1. Speedrun high-score board. Needs a backend; ask first.
  2. A bigger private-markets simulator on the paper page.
  3. A stronger chess bot that uses his own chess.com openings.
  4. A pixel-art lab with a sprite editor.
  5. Pixel page transitions and a CRT mode.
  6. Secret achievements.
- Logos for Three Bridge, Cash-Wa, Covisum and Kearney High are text wordmarks; their sites were unreachable from the cloud. Use real art if Charlie provides it.
- `levelUps` in `profile.ts` quests is no longer rendered and can be removed.
- Deploy: Vercel (see README). Move Locus off `charliebrockmeier.com` first.

## Keeping sessions cheap

Start a fresh session per task; this file is the context. Read the specific files a task
needs rather than exploring. Run `npm run check` instead of taking screenshots unless the
change is visual. Use `/clear` between unrelated tasks.
