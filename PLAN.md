# charliebrockmeier.com — Plan v3: "Player profile"

Earlier drafts (a "tear sheet" design) were rejected as too corporate for a personal site. The parts of them that still apply are folded in below: the AI layer (§6), privacy rules (§7), SEO (§8) and deploy (§9).

## 1. Concept

The site is Charlie's **character screen**, as in a video game. Everything comes from who he actually is:
- a gamer (Steam) building a game in Godot;
- a chess grinder (a 500+ day streak, 275 games in September 2026);
- an Eagle Scout who wanted to be MacGyver (his Common App essay);
- a brainstorm list that includes "Stats you don't care about".

The game frame carries the serious content (MSCI, Vantager, AI work) without feeling like a resume. **The resume** (`/resume`, the R key; `/recruiter` redirects) gives the plain one-page version for anyone in a hurry, and `/charlie-brockmeier-resume.pdf` is the downloadable PDF. The public PDF has no phone number.

## 2. Page map

| Section | What it shows |
|---|---|
| Title screen | 32×32 sprite, Class: Finance / Subclass: AI builder, live chess streak. Animated pixel panorama from a Kearney sunset to Manhattan at night: walker, clouds, windows, glints, plane, traffic |
| 01 Character | Bio (finance at the core, building with AI), photo, attributes with radar chart |
| 02 The road so far | Scroll-driven side-scroller: Kearney home and Kearney High → Lincoln (Capitol, Memorial Stadium) → SF summer (in person) → NYC walk-up → 7 World Trade (`Journey.astro`, `scripts/art/journey.mjs`) |
| 03 Quest log | Career oldest-first with pixel emblems (`src/data/logos.ts`) and Finance/Code/AI levels per chapter |
| 04 World map | Pixel terrain US map, career route on I-80, road trips and Husker away games, animated (`MapSection.astro`, `scripts/art/usmap.mjs`) |
| 05 Stats | Chess panel (full year from chess.com at build, fallback snapshot), Charlie's Caro-Kann bot, cards for Huskers, music, builder, learning, gaming, life |
| 06 Crafted items | Each project with an illustrated screen; GitHub summary |
| 07–11 | Party (agents), Inventory, Achievements, Side quests, Talk to Charlie |

**Live data:** `npm run build` runs `scripts/fetch-stats.mjs` first. That pulls chess.com and public GitHub repos into `src/data/live.json`; if the fetch fails, the committed numbers stay.

## 3. Visual system

- "Dusk" palette shared by the UI tokens and every piece of art (`scripts/art/lib.mjs`): violet-night surfaces, sunset gold, coral, rose, neon cyan, sky blue, violet.
- Type: **Jersey 10** for pixel display and labels (its cap height is normalized with `font-size-adjust`), and Schibsted Grotesk for reading.
- Art: the sprite and the icons (badges and social) are data in `src/data/pixels.ts`, rendered as crisp SVG. The scenes are drawn in code by `scripts/art/` (`npm run art`) into small indexed PNGs in `public/art/`:
  - the title panorama: Kearney at sunset, with the grain elevator, windmill, the Platte and its cranes, and the Archway over I-80; then the Palisades, the GWB, and Manhattan at night over the Hudson;
  - six quest scenes.

  Moving parts are SVG overlays.
- Motion:
  - the walker, windmill, twinkling stars, a blinking "press start" and a sprite idle bob;
  - attribute bars that fill on scroll;
  - the typewriter text.

  All of it is off under `prefers-reduced-motion`.
- JS: about 2 KB (dialogue box and shortcuts). The pages are static HTML and readable by crawlers.

## 4. Milestones

| # | Milestone | Status |
|---|---|---|
| 1 | Scaffold | ✅ |
| 2 | Player profile, resume page | ✅ Built; v4 adds the dusk palette, pixel scenes, Stats, socials and the updated resume. Awaiting Charlie's review |
| 2b | Case-study pages for the crafted items; Godot and side-quest media if Charlie sends any | Next |
| 3 | SEO: Person schema, OG cards (pixel style), sitemap, robots, 404 ("Game over"), Lighthouse | |
| 4 | AI layer: Claude Haiku 5.5 behind the dialogue box, evals, $1/month cap; llms.txt, JSON, MCP ("Multiplayer") | |
| 5 | Deploy: repo, Vercel, Locus to `locus.`, domain cutover | |
| 6 | Indexing and backlinks | |

## 5. Open questions for Charlie

Settled:
- Substack is not linked.
- Dojo is removed.
- The GPA is dropped for "Graduated with High Distinction".
- The title is "Private Assets".
- Instagram is linked.
- Contact email is his Gmail.

Still open:
1. **Locus logo:** done; the cicada mark is redrawn in pixels in `src/data/logos.ts` (`marks.locus`).
2. **Childhood home:** drawn as a generic early-2000s ranch; a photo would make it exact.
3. **Spotify Wrapped:** screenshots of recent years would refresh the music card.
4. **Phyt:** confirm the one-liner ("a fitness app for iPhone").
5. **Montana trip:** where exactly?

## 6. AI layer (milestone 4)

### Ask
- **Corpus:** this site's own content only, about 10K tokens. It is built at deploy time as one `document` block per section, titled with the section's page anchor.
- **Model:** `claude-haiku-5-5` via `@anthropic-ai/sdk`.
  - Effort stays low because questions are short and grounded.
  - If evals show weak answers, the fallback is a larger model.
- **No vector database:** the corpus fits in context, so sending it all with prompt caching is simpler and more accurate than retrieval.
- **Citations:** document citations (`citations: {enabled: true}`). The widget maps each cited span to its page anchor and highlights it.
- **Voice:** answers in the dialogue box, grounded only in the site. They never speak for MSCI. Out-of-scope questions get "That isn't on this site. Email Charlie."
- **Guardrails:**
  - questions up to 300 characters, capped `max_tokens`;
  - a per-IP rate limit (Vercel firewall) and a kill-switch env var;
  - a **$1/month spend cap** in the Anthropic console;
  - logs keep questions only, with no IPs.
- **Evals** (`npm run eval`, must pass before every deploy), about 40 cases:
  - factual;
  - out of scope;
  - confidentiality traps, e.g. "Who did you build this for?" or "What are MSCI's unreleased plans?";
  - prompt injection.

### Readable by agents
- `llms.txt` (summary plus links to `.md` twins), `llms-full.txt` (the whole corpus), and `charlie.json` (the same facts as the JSON-LD).
- **MCP server at `/mcp`:** stateless, read-only tools such as `get_profile`, `list_quests` and `list_builds`.
  - It makes no model calls; the visitor's own client does the reasoning.
  - It uses the same corpus as Ask, so the two can't drift apart.

## 7. Privacy rules (non-negotiable)

- Personal projects are described only as **personal projects**. Never name, describe or imply any firm, client or person they were built for. The internal names of Charlie's Claude skills never appear.
- No real holdings, client lists, obituary subjects or account data anywhere: pages, images, alt text, OG cards, the Ask corpus and MCP output. Demos use synthetic data.
- **Vantager and MSCI: public facts only.** Nothing internal: metrics, customers, screenshots, product internals or drafts.
- Locus screenshots come from a demo account only.
- No phone number, home address or finances on the site. The public resume PDF has no phone number.
- Ask and MCP draw only on the public corpus, and the evals include a trap for every rule above.
- Check MSCI's outside-activities policy before launch, especially for the Ask feature.

## 8. SEO (milestone 3)

- **Titles:**
  - Home: `Charlie Brockmeier | AI products for private markets`.
  - Inner pages: `{Page} | Charlie Brockmeier`.
  - One H1 per page.
- **Canonical** on every page, on the apex `https://charliebrockmeier.com`; `www` redirects to the apex with a 308.
- **JSON-LD:**
  - `Person` on home, with:
    - `jobTitle` "Senior Associate";
    - `worksFor` MSCI;
    - `alumniOf` University of Nebraska–Lincoln;
    - `knowsAbout`;
    - `sameAs` for LinkedIn, GitHub, X, Instagram and the MSCI contributor page.
  - `WebSite` on home.
- **Open Graph and Twitter cards:** 1200×630 images in the pixel style.
- **Crawling:** `@astrojs/sitemap`, a `robots.txt` pointing at it, and the 404 page ("Game over").
- **Image:** `charlie-brockmeier.jpg` with alt "Charlie Brockmeier".
- **After cutover:**
  - remove any indexed Locus URLs in Search Console and mark Locus `noindex`;
  - put the site URL on LinkedIn, GitHub, X and Instagram for backlinks.

## 9. Domain migration and deploy (milestone 5)

| Domain | Project today |
|---|---|
| `charliebrockmeier.com` | `brockmeier-finances` (Locus), redirects to `www` |
| `www.charliebrockmeier.com` | `brockmeier-finances` (Locus), production |
| `dev.charliebrockmeier.com` | `brockmeier-finances` (Locus), `dev` branch |

Each step waits for Charlie's go-ahead:
1. **Move Locus first.** Add `locus.charliebrockmeier.com` to `brockmeier-finances`, then update:
   - the Supabase Auth site URL and redirect allow-list;
   - the bank and brokerage redirect URIs;
   - email link bases and `SITE_URL` env vars.

   Verify login, password reset and bank reconnect, and add `noindex`.
2. **Ship this site** to a new Vercel project from the `charliebrockmeier.com` GitHub repo, reviewed on a preview URL.
3. **Cut over.** Move the apex and `www` to the new project, with `www` redirecting to the apex (308). Keep `dev.` on Locus.
4. Turn on Analytics. Set up Search Console and Bing, and submit the sitemap.
