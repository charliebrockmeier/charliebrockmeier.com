# charliebrockmeier.com: notes for Claude

Charlie Brockmeier's personal site: a pixel-art "player profile" (Astro 7, fully static),
plus a resume page, a contact page, project pages and two long research papers. This file is
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
| `npm run check:model` | The same check for the Brockmeier model paper, plus every `{fig:id}` and `{tab:id}` exists |
| `npm run model` | Rebuilds `src/data/model2026-data.json` from `scripts/model/` (about 35 seconds, deterministic, no network) |
| `npm run model:data` | Re-downloads the model's public data into `scripts/model/inputs.json` (needs `pip install xlrd openpyxl`) |
| `npm run pdf` | After a build: reprints the resume and both paper PDFs into `public/` and `dist/` |
| `npm run art` | Redraws the pixel art in `public/art/` from `scripts/art/` |
| `npm run spotify -- "<export folder>"` | Rebuilds `src/data/spotify.json` from a Spotify data export |
| `npm run claude-stats` | Adds local Claude Code usage to `src/data/claude.json` |

`check` and `pdf` need Playwright: `npm i -D playwright && npx playwright install chromium` once.

**Before every commit:** `npm run build && npm run check`. If you touched a paper, also
`npm run check:paper` or `npm run check:model`. If you touched resume data or a paper,
`npm run pdf` and commit the PDFs. If you touched `scripts/art/`, `npm run art` and commit the PNGs.
Commit straight to `main` and push. No pull requests unless Charlie asks.

## Where things live

- `src/data/profile.ts`: most copy. Site text, `character`, `bio`, `chess` (streak), `quests` (the career chapters, with `moments` and `highlights`), `builds` (projects), `achievements`, `dialogue` (the Talk box), `resume`.
- `src/data/`: `skills.ts` (skill tree), `sidequests.ts` (trips), `travel.ts` (map routes and flights), `journey.ts` (the walk), `logos.ts` and `pixels.ts` (pixel logos, sprite and icons as rows of palette keys), `projects.ts` (project page copy), `spotify.json`, `claude.json`, `live.json` (generated), `paper2026.ts`, `paper2026-figures.ts` and `paper2026-data.json` (the illiquidity paper; the JSON is generated), `model2026.ts`, `model2026-figures.ts` and `model2026-data.json` (the Brockmeier model paper; the JSON is generated).
- `src/pages/`: `index` (the profile), `resume`, `contact` (`/recruiter` redirects here), `projects/[id]`, `writing/illiquidity-premium` (2026 paper), `writing/illiquidity-premium-2025` (the original, frozen), `writing/brockmeier-model` (the portfolio model paper), `404`, `sitemap.xml`.
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

  The paper's charts are in `components/charts/`: `BarChart`, `LineChart`, `ScatterChart`, `Table`, `Heatmap`, `RowChart` (ranked bars and waterfalls), `SeriesChart` (dense time series, log scale), all wrapped by `Figure`. The model paper has its own set in `components/charts/model/` (`Lines`, `Stack`, `StackBars`, `Heatmap`, `NotedTable`, `ModelCalculator` with `calc.ts`).
- `src/scripts/`: `achievements.ts` (unlock, toasts, stars, best run), `game/wipe.ts`, `chess/` (bot: chess.js + Stockfish in a worker, engine in `public/engine/`).
- `scripts/`: build-time and maintenance scripts (table above). `scripts/art/` draws every scene in Node. `scripts/model/` is the Brockmeier model: `fetch.py` and `fetch-browser.mjs` download, `build.mjs` and `lib.mjs` compute, `assumptions.json` and `my-portfolio.json` are the inputs to edit.

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

## The Brockmeier model paper ("The Brockmeier Model", Nov 2026)

At `/writing/brockmeier-model`. Companion to the illiquidity paper; each links to the other.

- **Position**: portfolios should be built from today's prices, not from 1928–2025 averages. On November 9, 2026 global stocks are priced to compound at about 4.61% real against 2.66% on ten-year TIPS: 1.95 points, against the 6.45 that U.S. stocks compounded over bills (3.09 against 8.21 as arithmetic means). So a "balanced" investor (γ = 4) holds about 34% in stocks once paychecks stop (45% if "60/40" is calibrated against bonds, γ = 3), the rest in TIPS matched to the spending date. Age and job matter through savings not yet made. Private assets get weight zero and a liquidity budget. Keep that stance, and keep the range honest.
- **Compound versus arithmetic**: returns read off prices (`expected.mu`) are compound rates. `build.mjs` adds half the variance (`MU9G` to `MU9`, `MU11`) before the Merton share, the optimizer and the simulation use them, and tables show compound rates. Don't feed a compound return into a formula, and compare like with like against history (`history.annual.*.geo` or `.arith`).
- **Content**:
  - Prose and the 40 numbered sources are in `src/data/model2026.ts`; charts and tables in `model2026-figures.ts`. `{fig:id}` and `{tab:id}` become "Figure n" and "Table n".
  - Almost every number in the prose is read from `model2026-data.json`, which `npm run model` writes. Don't type model numbers by hand; change `scripts/model/assumptions.json` and rerun.
  - The raw downloads live in `scripts/model/.cache/` (gitignored). `inputs.json` is the parsed result and is committed, so the model reruns offline. Dates are pinned (prices November 9, 2026; returns through September 2026). The Monte Carlo seed is 20261109.
  - The calculator is `components/charts/model/ModelCalculator.astro`; `calc.ts` is the same closed form as `lifecycle()` in `build.mjs`.
- **Rules**, on top of the paper rules above:
  - No series built on an MSCI index, including ETFs that track one (EFA, EEM, ACWI, IEFA, IEMG, VNQ and the like). Stocks are CRSP and Ken French series; valuations are S&P indexes; real estate is FTSE Nareit.
  - The "My own portfolio" section is fed by `scripts/model/my-portfolio.json`: **percentages only**. No dollar balances, account numbers, or bank or broker names. Fund tickers with weights are fine.
  - Employer stock appears only as "Employer stock (unvested RSUs)" at about 35%. No company name, ticker, price, price history or grant detail. Its risk uses a typical single stock from the literature, never the real one. The 401(k) fund is "Target-date 2065 index fund"; don't name the plan or its provider.
- **Checked 2026-11-10 and 11**: the headline numbers were recomputed twice from the raw downloads, the second time by an independent review (curves, expected returns, risk inputs, Merton shares, the optimizer tables, the ladder, the glide grid, matrix cells, the retiree table, ruin rates). That review found the compound-versus-arithmetic error above, which is fixed, and the three conventions that set the level (compound returns, γ labels off the premium over bills, ten-year TIPS as the safe rate at every age), which the paper now states with their ranges in the last section. The simulation's saving phase was checked by reading the code, not re-simulated.
- **Known limits, stated in the paper**: the simulation holds the real curve fixed, so future contributions earn today's yields; most of the model's edge over a target-date fund is that assumption.
- **Still to confirm with Charlie**: his risk level (γ = 2), his new-money rate per quarter (null now; the page shows a what-if for 1%, 2%, 3%), whether the 6.5% bank cash is a reserve outside the model, 12 quarters or 8, the 15% capital-gains rate, whether source 39 may name the public 2065 fund used for the 401(k) look-through, and whether "about quarter 8" for the employer-stock sale is fine to publish.

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
