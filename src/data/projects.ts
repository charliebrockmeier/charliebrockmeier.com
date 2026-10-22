// Long-form copy for each project page (/projects/<id>). The short facts (name, line,
// status, stack, stats, repo, links) stay on the build in profile.ts; this file adds
// what a page has room for. Every project here is a personal project: no clients, no
// real holdings, no account data. Numbers in the visuals are synthetic unless they
// also appear in a build's stats or in `numbers` below.
import type { Build } from './profile';

export type Step = { title: string; text: string };

export type Project = {
  /** Two or three short paragraphs: what it is and what it does. */
  what: string[];
  /** How it works, in order. Expands the build's `detail`. */
  how: Step[];
  /** Headline numbers beyond the card's stats. */
  numbers?: { value: string; label: string }[];
  /** Design principles, shown as a row of callouts. */
  principles?: { title: string; text: string; color: string }[];
  /** Performance wins: `bar` is the share left after the change, for a before/after bar. */
  performance?: { value: string; label: string; bar: number }[];
  /** A plain-language status note under the status chip. */
  statusNote: string;
};

export const projects: Record<Build['id'], Project> = {
  locus: {
    what: [
      'Locus is a personal OS. Bank, card, brokerage and retirement accounts sit next to the calendar, documents, tasks, notes and habits, in one app instead of a dozen.',
      'An AI assistant sits on top of all of it. Press ⌘K, ask a question in plain English, and it answers from everything Locus knows.',
      'It is read-only by design. There is no way for Locus to move money, every action the assistant proposes waits in an approval ledger, and row-level security scopes every table to its owner.',
    ],
    how: [
      { title: 'Connect', text: 'Bank, card, brokerage and retirement accounts sync through Plaid, read-only.' },
      { title: 'See it all', text: 'Finance turns the raw transactions into net worth, cash flow, a forecast, portfolio, tax, debt and statements views.' },
      { title: 'Run the week', text: 'Calendar, documents, tasks, notes, habits, people and automations live in the same app, starting from Today.' },
      { title: 'Ask', text: '⌘K opens the assistant, which works across every module with 36 tools.' },
      { title: 'Approve', text: 'Anything the assistant wants to change lands in an approval ledger first. Nothing happens until it is approved.' },
      { title: 'Ship safely', text: 'Next.js on Vercel and Supabase with row-level security on every table. 4,349 Vitest tests run in GitHub Actions.' },
    ],
    numbers: [
      { value: '50+', label: 'pages' },
      { value: '143', label: 'API handlers' },
      { value: '36', label: 'AI tools' },
      { value: '4,349', label: 'tests passing' },
    ],
    performance: [
      { value: '1,427×', label: 'faster: one return calculation, after a round of performance work', bar: 1 / 1427 },
      { value: '−56%', label: 'JavaScript shipped to the browser', bar: 0.44 },
    ],
    principles: [
      { title: 'Read-only', text: 'Locus can read balances and transactions. It has no way to move money.', color: 'var(--teal)' },
      { title: 'Approval ledger', text: 'Every AI action is written to a ledger and waits for a yes before it runs.', color: 'var(--gold)' },
      { title: 'Row-level security', text: 'Every table enforces ownership in the database, not only in the app.', color: 'var(--violet)' },
    ],
    statusNote: 'Live and invite only. It will move to its own subdomain.',
  },

  faceless: {
    what: [
      'An engine that runs three short-video pages from official public data, with no face on camera. Each page has its own voice.',
      'It finds a story in a data series, writes the hook, checks every number against the source rows, narrates it and renders a vertical video. A quality gate decides what ships.',
    ],
    how: [
      { title: 'Mine', text: 'Pull from 226 official data series (FRED, BLS, NYC Open Data, World Bank, Our World in Data) and look for a story.' },
      { title: 'Write', text: 'Draft the hook and the script in the page’s voice: Money Math, NYC Numbers or Scale Compare.' },
      { title: 'Fact-check', text: 'Check every number in the script against the source rows it came from.' },
      { title: 'Render', text: 'Narrate it and render a 9:16 video in Remotion from one of 8 templates.' },
      { title: 'Gate', text: 'A quality gate decides what ships. No face required.' },
    ],
    numbers: [
      { value: '3', label: 'pages' },
      { value: '226', label: 'official data series' },
      { value: '2,005', label: 'tests passing' },
      { value: '8', label: 'video templates' },
    ],
    statusNote: 'In rehearsal: the pipeline renders full videos, and nothing is posted yet.',
  },

  obituary: {
    what: [
      'A personal project that checks 10 local funeral-home sites every week against a list of names, so nothing important gets missed.',
      'It runs itself every Monday, builds a workbook and drafts a digest email. I review it before anything goes out.',
    ],
    how: [
      { title: 'Adapters, not scrapers', text: 'One adapter per website platform instead of one scraper per site: a JSON API for one, a sitemap crawl for another, a headless browser for a third. Adding a site usually means zero new code.' },
      { title: 'Run weekly', text: 'GitHub Actions starts the run every Monday.' },
      { title: 'Cross-check', text: 'Every name it reads is checked against the list.' },
      { title: 'Report', text: 'It builds a workbook and drafts the digest email.' },
      { title: 'Fail safe', text: 'If a site changes its layout, sanity checks stop the run instead of sending a wrong answer.' },
    ],
    statusNote: 'Live. It runs every Monday.',
  },

  portfolio: {
    what: [
      'A personal project that grades every portfolio in a book A to F against a target model, says why, and turns a monthly review into a ranked to-do list.',
      'Every portfolio shown on this site is synthetic.',
    ],
    how: [
      { title: 'Map', text: 'Map each portfolio’s positions to a target model.' },
      { title: 'Measure drift', text: 'Measure drift on the equity/bond split and across the style box.' },
      { title: 'Run 27 rules', text: 'Flag duplicate share classes, redundant index overlap, concentration, asset location, cash drag and tax-loss harvesting.' },
      { title: 'Grade and rank', text: 'Grade each portfolio A to F and rank the fixes, worst first.' },
      { title: 'Decide', text: 'It flags; I decide.' },
    ],
    statusNote: 'Runs monthly.',
  },

  phyt: {
    what: ['A fitness app for iPhone, designed and built end to end. Logo included.', 'From the logo to the last screen, mine. More soon at phytapp.org.'],
    how: [
      { title: 'Design', text: 'The brand, the logo and every screen.' },
      { title: 'Build', text: 'An app for iPhone, built end to end.' },
      { title: 'Launch', text: 'In development. The site is up at phytapp.org.' },
    ],
    statusNote: 'In development.',
  },

  site: {
    what: [
      'This site: a player profile with a talking NPC, a chess bot and live chess stats.',
      'The source is public on GitHub.',
    ],
    how: [
      { title: 'Static pages', text: 'Built with Astro. Every page is static HTML that crawlers can read.' },
      { title: 'Pixels in code', text: 'The sprite and icons are data rendered as crisp SVG; the scenes are drawn by scripts into small indexed PNGs.' },
      { title: 'Live numbers', text: 'Chess.com games and public GitHub repos are fetched on every build. If a source is down, the last numbers stay.' },
      { title: 'A chess bot', text: 'Stockfish in the browser, tuned to play about as well as I do. Caro-Kann, every time.' },
    ],
    statusNote: 'You are here.',
  },
};

// Locus modules, as the app's own navigation lists them.
export const locusModules: { code: string; name: string; color: string; items?: string[] }[] = [
  { code: 'TD', name: 'Today', color: 'var(--gold)' },
  { code: 'FN', name: 'Finance', color: 'var(--teal)', items: ['Net worth', 'Cash flow', 'Forecast', 'Portfolio', 'Tax', 'Debt', 'Statements'] },
  { code: 'CA', name: 'Calendar', color: 'var(--blue)' },
  { code: 'DC', name: 'Documents', color: 'var(--violet)' },
  { code: 'TK', name: 'Tasks', color: 'var(--coral)' },
  { code: 'NT', name: 'Notes', color: 'var(--green)' },
  { code: 'HB', name: 'Habits', color: 'var(--red)' },
  { code: 'PP', name: 'People', color: 'var(--gold)' },
  { code: 'AU', name: 'Automations', color: 'var(--gray)' },
];

// The faceless engine's three pages. Also drawn in its mock screen.
export const facelessPages = [
  { name: 'Money Math', tag: 'Money, measured.', color: 'var(--gold)', bars: [12, 18, 15, 24, 22, 30, 34, 40] },
  { name: 'NYC Numbers', tag: 'The city, measured.', color: 'var(--teal)', bars: [40, 33, 27, 22, 16, 11] },
  { name: 'Scale Compare', tag: 'The world, to scale.', color: 'var(--coral)', bars: [6, 40] },
];

export const facelessSources = ['FRED', 'BLS', 'NYC Open Data', 'World Bank', 'Our World in Data'];
