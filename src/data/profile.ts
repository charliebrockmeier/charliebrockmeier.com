// Everything the site says about Charlie lives here. Facts come from his resume,
// public sources and his own writing; TODO markers are open questions for him.
import type { IconName } from './pixels';
import type { LogoName } from './logos';

export const site = {
  url: 'https://charliebrockmeier.com',
  name: 'Charlie Brockmeier',
  title: 'Charlie Brockmeier | AI products for private markets',
  tagline: 'I work on private markets at MSCI and build software with AI.',
  positioning:
    'Charlie Brockmeier works on private markets at MSCI in New York and builds software with AI. Previously at Vantager, which MSCI acquired in 2026.',
};

export const email = 'charliebrockmeier@gmail.com';

export const resumePdf = '/charlie-brockmeier-resume.pdf';

export const links: { label: string; handle: string; url: string; icon: IconName; color: string }[] = [
  { label: 'LinkedIn', handle: 'in/charliebrockmeier', url: 'https://www.linkedin.com/in/charliebrockmeier/', icon: 'linkedin', color: 'blue' },
  { label: 'Instagram', handle: '@charliebrockmeier', url: 'https://www.instagram.com/charliebrockmeier/', icon: 'instagram', color: 'coral' },
  { label: 'X', handle: '@Rockmeier1', url: 'https://x.com/Rockmeier1', icon: 'x', color: 'ink' },
  { label: 'GitHub', handle: 'charliebrockmeier', url: 'https://github.com/charliebrockmeier', icon: 'github', color: 'violet' },
  { label: 'Email', handle: email, url: `mailto:${email}`, icon: 'mail', color: 'gold' },
];

export const character = {
  className: 'Finance',
  subclass: 'AI builder',
  title: 'Senior Associate',
  guild: 'MSCI Private Assets',
  base: 'New York, NY',
  origin: 'Kearney, Nebraska',
  school: 'University of Nebraska–Lincoln',
  bio: [
    "I'm Charlie. I work on private markets at MSCI in New York, and I build software, mostly with AI.",
    'I grew up in Kearney, Nebraska, and studied finance and accounting at the University of Nebraska–Lincoln, with computer science through the Raikes School. I spent a summer in San Francisco doing investment diligence by hand, then joined Vantager, a small startup that used AI to do a lot of that work. MSCI bought Vantager in 2026, and I came with it.',
    'Outside work: golf, a game of chess every day, piano, and Husker football.',
  ],
};

// Attribute bars. Values are for fun; the notes are true.
export const stats: { name: string; value: number; icon: IconName; color: string; note: string }[] = [
  { name: 'Finance', value: 92, icon: 'coins', color: 'gold', note: 'Finance and accounting degree. Private-markets work since 2024.' },
  { name: 'AI', value: 88, icon: 'chip', color: 'teal', note: 'Building with LLMs since 2023.' },
  { name: 'Private markets', value: 86, icon: 'chart', color: 'violet', note: 'Did fund diligence by hand, then helped build software that does it.' },
  { name: 'Leadership', value: 84, icon: 'podium', color: 'coral', note: 'Fraternity treasurer, TA, mentor, capstone PM.' },
  { name: 'Code', value: 80, icon: 'bolt', color: 'blue', note: 'Python and TypeScript, mostly.' },
];

// "Stats you don't care about" was on Charlie's own brainstorm list. Every number
// comes from an app's own recap email or from Charlie; sources are shown on the site.
export type StatBlock = {
  id: string;
  title: string;
  icon: IconName;
  color: string;
  source: string;
  big: { value: string; label: string };
  rows: [string, string][];
  bars?: { label: string; value: number; display: string }[];
  quip?: string;
};

// Charlie's chess streak as of the date below (he told us). The build-time fetch
// (scripts/fetch-stats.mjs) replaces it with live numbers when chess.com is reachable.
export const chess = { games: 275, wins: 139, month: 'September 2026', streak: '567', streakDays: 567, streakAsOf: '2026-10-22' };

export const statBlocks: StatBlock[] = [
  {
    id: 'chess',
    title: 'Chess',
    icon: 'knight',
    color: 'gold',
    source: 'September 2026 recap',
    big: { value: '567', label: 'day streak' },
    rows: [
      ['Games in September', '275'],
      ['Wins', '139'],
      ['Win rate', '50.5%'],
      ['Games a day', '9.2'],
      ['Brilliant moves', '3'],
      ['On chess.com since', 'April 2021'],
    ],
    quip: 'Username: CharlieCaro. Opening as Black: the Caro-Kann, every time.',
  },];

// The career, oldest first. `levels` is where each track stands after the chapter
// (0–10); `levelUps` are the specific things that grew, and `carries` names the later
// chapter where that skill paid off. Finance leads, code follows, AI arrives in 2023
// and the two tracks meet at Vantager.
export type Track = 'finance' | 'code' | 'ai' | 'lead';

export type Quest = {
  chapter: string;
  title: string;
  when: string;
  where: string;
  role: string;
  status: 'active' | 'complete';
  emblems: LogoName[];
  summary: string;
  objectives: string[];
  reward: string;
  unlocked: string;
  levels: Record<Track, number>;
  levelUps: { skill: string; track: Track; up: number | 'new'; carries?: string }[];
  /** A page worth opening from this chapter, e.g. a paper. */
  link?: { label: string; url: string };
  /** College gets a longer list of everything else that happened. */
  extras?: { name: string; note: string }[];
  scene: { src: string; place: string; alt: string };
};

export const quests: Quest[] = [
  {
    chapter: 'Prologue',
    title: 'Kearney, Nebraska',
    when: 'Through 2021',
    where: 'Kearney, NE',
    role: 'Kearney High, class of 2021',
    status: 'complete',
    emblems: ['khs', 'cashwa'],
    summary: 'Grew up here. State tennis medalist, Eagle Scout, and an IT job the summer before college.',
    objectives: ['Medal at state in tennis', 'Eagle Scout', 'Cash-Wa Distributing, summer 2021: Python macros, and built the IT department’s PCs'],
    reward: 'A ticket to Lincoln',
    unlocked: 'Code',
    levels: { finance: 0, code: 1, ai: 0, lead: 2 },
    levelUps: [
      { skill: 'Python', track: 'code', up: 'new', carries: 'automation at Three Bridge' },
      { skill: 'Leadership', track: 'lead', up: 2, carries: 'Treasurer, $850K budget' },
    ],
    scene: { src: '/art/prologue.png', place: 'The Platte River', alt: 'Pixel art: a campfire by the Platte at night, a tent and sandhill cranes.' },
  },
  {
    chapter: 'Chapter 1',
    title: 'University of Nebraska–Lincoln',
    when: '2021 – 2025',
    where: 'Lincoln, NE',
    role: 'B.S.B.A. Finance & Accounting · minors in CS and Math · Raikes School honors program',
    status: 'complete',
    emblems: ['unl', 'buckle', 'covisum'],
    summary:
      'Finance and accounting in the College of Business, and computer science through the Raikes School honors program. Summers writing production code; first AI project in 2023.',
    objectives: [
      "Buckle, summer 2022: shipped the e-commerce site's favorites page to production",
      'Covisum, summer 2023: built financial-advisory tools and a client intake form with the CEO',
      'Junior capstone developer: a GPT-3.5 support assistant for DMSi, trained on 250,000 tickets',
      "Senior capstone PM: machine learning for Conagra Brands' $500M capital-expenditure decisions",
      'Wrote The Illiquidity Premium, a paper on private-markets returns',
    ],
    reward: 'Graduated with High Distinction',
    link: { label: 'Read The Illiquidity Premium', url: '/writing/illiquidity-premium' },
    unlocked: 'AI',
    levels: { finance: 5, code: 5, ai: 2, lead: 7 },
    levelUps: [
      { skill: 'Accounting and valuation', track: 'finance', up: 3, carries: 'diligence at Three Bridge' },
      { skill: 'Fintech', track: 'finance', up: 'new', carries: 'Vantager' },
      { skill: 'LLMs', track: 'ai', up: 'new', carries: 'Vantager' },
      { skill: 'Machine learning', track: 'ai', up: 1 },
      { skill: 'JavaScript, C# and SQL', track: 'code', up: 3, carries: 'Locus' },
      { skill: 'Shipping to production', track: 'code', up: 1, carries: 'every chapter since' },
      { skill: 'Budgets and boards', track: 'lead', up: 2 },
      { skill: 'Teaching and mentoring', track: 'lead', up: 3 },
    ],
    extras: [
      { name: 'FarmHouse treasurer', note: 'Two terms. An $850K annual budget for 110 members' },
      { name: 'Teaching assistant', note: 'Honors Computer Science I and II' },
      { name: 'NHRI mentoring', note: 'Mentor, then staff advisor; UCARE research on the program' },
      { name: 'Mortar Board', note: 'Senior honor society, social chair' },
      { name: 'Raikes Student Advisory Board', note: 'Student voice to the program, through senior year' },
      { name: 'Regents Scholar', note: 'UNL’s top academic scholarship; 6× Dean’s List' },
      { name: 'University Honors Program', note: 'Graduated from it, May 2025' },
      { name: 'Tenaska case challenges', note: 'Energy-trading business cases, 2023 and 2024' },
      { name: 'Dance Marathon', note: 'Fundraising for Nebraska’s children’s hospital' },
    ],
    scene: { src: '/art/raikes.png', place: 'Lincoln, Nebraska', alt: 'Pixel art: the Nebraska State Capitol at dusk.' },
  },
  {
    chapter: 'Chapter 2',
    title: 'Three Bridge Wealth Advisors',
    when: '2024 – 2025',
    where: 'San Francisco, CA',
    role: 'Financial Analyst, Investment Committee',
    status: 'complete',
    emblems: ['threebridge'],
    summary: 'Investment diligence for a multi-family office, in person in San Francisco for the summer of 2024 and part-time after. Learned the job by hand, then automated the repetitive parts.',
    objectives: ['Intro calls, investment memos and committee overviews', 'Kept the private-investments database up to date', 'Automated research and reporting with Python and AI'],
    reward: 'How diligence actually works',
    unlocked: 'Private markets',
    levels: { finance: 7, code: 5, ai: 3, lead: 7 },
    levelUps: [
      { skill: 'Private-investment diligence', track: 'finance', up: 'new', carries: 'Vantager' },
      { skill: 'Investment memos', track: 'finance', up: 2 },
      { skill: 'Python automation', track: 'code', up: 1, carries: 'personal projects' },
      { skill: 'AI for research', track: 'ai', up: 1, carries: 'Vantager' },
    ],
    scene: { src: '/art/threebridge.png', place: 'San Francisco', alt: 'Pixel art: the Golden Gate Bridge at sunset in fog.' },
  },
  {
    chapter: 'Chapter 3',
    title: 'Vantager',
    when: '2025 – 2026',
    where: 'New York, NY',
    role: 'Growth & Product Analyst',
    status: 'complete',
    emblems: ['vantager'],
    summary: 'Joined a small startup early. Its software read the documents fund managers share with investors and drafted diligence reports from them: the job I had done by hand, done with AI.',
    objectives: ['Diligence templates, data quality and customer feedback', 'Acquired by MSCI in March 2026'],
    reward: 'Acquired',
    unlocked: 'Finance × AI',
    levels: { finance: 8, code: 6, ai: 7, lead: 8 },
    levelUps: [
      { skill: 'AI diligence', track: 'ai', up: 'new', carries: 'MSCI' },
      { skill: 'Product', track: 'lead', up: 'new' },
      { skill: 'Growth', track: 'lead', up: 1 },
      { skill: 'Fund documents', track: 'finance', up: 1 },
      { skill: 'Shipping fast', track: 'code', up: 1 },
    ],
    scene: { src: '/art/vantager.png', place: 'Brooklyn Bridge, New York', alt: 'Pixel art: the Brooklyn Bridge at dusk with Manhattan behind it.' },
  },
  {
    chapter: 'Chapter 4',
    title: 'MSCI Private Assets',
    when: '2026 – now',
    where: 'New York, NY · 7 World Trade Center',
    role: 'Senior Associate',
    status: 'active',
    emblems: ['msci'],
    summary: 'Same work as at Vantager, now inside MSCI: software that helps investors evaluate private funds before they put money in.',
    objectives: ['Joined through the Vantager acquisition', 'Make fund diligence faster'],
    reward: 'In progress',
    unlocked: 'MSCI',
    levels: { finance: 9, code: 6, ai: 8, lead: 8 },
    levelUps: [
      { skill: 'Private-markets data', track: 'finance', up: 1 },
      { skill: 'AI inside a large company', track: 'ai', up: 1 },
    ],
    scene: { src: '/art/msci.png', place: 'Lower Manhattan', alt: 'Pixel art: an office desk at night with a chart on the monitor and towers through the window.' },
  },
];




// Crafted items. `id` picks the illustrated screen (BuildScreen.astro) and the page at
// /projects/<id>; the long-form copy for that page lives in src/data/projects.ts.
// Every number in a mock is synthetic except the stats listed here.
export type Build = {
  id: 'obituary' | 'portfolio' | 'locus' | 'phyt' | 'faceless' | 'site';
  name: string;
  status: string;
  repo: { name: string; visibility: 'public' | 'private' } | null;
  stack: string[];
  line: string;
  detail: string;
  stats?: [string, string][];
  /** Live sites and public pages. Empty for invite-only apps. */
  links?: { label: string; url: string }[];
};

export const builds: Build[] = [
  {
    id: 'obituary',
    name: 'Obituary monitor',
    status: 'Live, every Monday',
    repo: { name: 'FuneralChecker', visibility: 'private' },
    stack: ['Python', 'GitHub Actions', 'one adapter per site platform'],
    line: 'Checks 10 local funeral-home sites every week against a list of names, so nothing important gets missed.',
    detail:
      'Instead of one scraper per site, there is one adapter per website platform: a JSON API for one, a sitemap crawl for another, a headless browser for a third. Adding a site usually means zero new code. It runs itself every week, builds a workbook and drafts the digest email. If a site changes its layout, sanity checks stop the run instead of sending a wrong answer.',
    stats: [
      ['Obituaries read', '450+'],
      ['Names cross-checked', '6,000+'],
      ['Weekly runs', '8'],
      ['Sites', '10'],
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio surveillance engine',
    status: 'Monthly',
    repo: null,
    stack: ['Python', 'Excel', 'a 27-rule issue library'],
    line: 'Grades every portfolio in a book A to F, says why, and turns a monthly review into a ranked to-do list.',
    detail:
      'It maps each portfolio to a target model, measures drift on the equity/bond split and the style box, then flags duplicate share classes, redundant index overlap, concentration, asset location, cash drag and tax-loss harvesting.',
    stats: [
      ['Issue rules', '27'],
      ['Grades', 'A–F'],
    ],
  },
  {
    id: 'locus',
    name: 'Locus',
    status: 'Live, invite only',
    repo: { name: 'brockmeier-finances', visibility: 'private' },
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Plaid', 'Vercel', 'Vitest', 'GitHub Actions'],
    line: 'A personal OS: every account, the calendar and documents in one place, with an AI assistant on top.',
    detail:
      'Net worth, cash flow, forecasts, portfolio and tax views across bank, card, brokerage and retirement accounts, plus tasks, notes and habits. Read-only by design: there is no way for it to move money. Every AI action lands in an approval ledger, and every table has row-level security.',
    stats: [
      ['Tests passing', '4,349'],
      ['API handlers', '143'],
      ['AI tools', '36'],
      ['Pages', '50+'],
    ],
    // Invite only for now; it moves to its own subdomain later.
    links: [],
  },
  {
    id: 'phyt',
    name: 'Phyt',
    status: 'In development',
    repo: { name: 'PHYT', visibility: 'private' },
    stack: ['iOS', 'product design'],
    line: 'A fitness app for iPhone, designed and built end to end. Logo included.',
    detail: 'From the logo to the last screen, mine. More soon at phytapp.org.',
    links: [{ label: 'phytapp.org', url: 'https://phytapp.org/' }],
  },
  {
    id: 'faceless',
    name: 'Faceless engine',
    status: 'In rehearsal',
    repo: { name: 'faceless-engine', visibility: 'private' },
    stack: ['TypeScript', 'Remotion', 'Supabase', 'Claude', 'FRED · BLS · NYC Open Data'],
    line: 'Runs three short-video pages from official public data: Money Math, NYC Numbers and Scale Compare.',
    detail:
      'It mines a data series for a story, writes the hook in each page’s voice, checks every number against the source rows, narrates it and renders a 9:16 video. A quality gate decides what ships. No face required.',
    stats: [
      ['Data series', '226'],
      ['Tests passing', '2,005'],
      ['Video templates', '8'],
    ],
  },
  {
    id: 'site',
    name: 'This site',
    status: 'You are here',
    repo: { name: 'charliebrockmeier.com', visibility: 'public' },
    stack: ['Astro', 'pixel art drawn in code', 'a chess bot'],
    line: 'A player profile with a talking NPC, a chess bot and live chess stats.',
    detail: 'Every pixel is drawn in code. The chess and GitHub numbers refresh on every build.',
    links: [{ label: 'Source on GitHub', url: 'https://github.com/charliebrockmeier/charliebrockmeier.com' }],
  },
];

export type Achievement = { icon: IconName; color: string; name: string; note: string; locked?: boolean; id?: string };

export const achievements: Achievement[] = [
  { icon: 'trophy', color: 'gold', name: 'Acquired', note: 'Vantager was bought by MSCI in 2026. I was on the team.' },
  { icon: 'chip', color: 'teal', name: 'Early adopter', note: 'First LLM product in 2023, trained on 250,000 support tickets.' },
  { icon: 'cap', color: 'blue', name: 'High Distinction', note: 'University of Nebraska–Lincoln, 2025.' },
  { icon: 'coins', color: 'violet', name: 'Treasurer', note: 'Ran an $850K annual budget for 110 members.' },
  { icon: 'fire', color: 'coral', name: 'Unbroken', note: '567 days of chess in a row, and counting.' },
  { icon: 'chart', color: 'teal', name: 'Top 7%', note: 'Rapid 1209 on chess.com.' },
  { icon: 'medal', color: 'gold', name: 'State medalist', note: 'Nebraska state tennis.' },
  { icon: 'fleur', color: 'gold', name: 'Eagle Scout', note: 'Earned in 2019.' },
  { icon: 'husker', color: 'red', name: 'Road trip', note: 'Followed the Huskers to Ohio State and USC.' },
  { icon: 'crown', color: 'gray', name: 'Silver crown', note: 'UNL Homecoming Royalty nominee, 2024. Call it second place.' },
  { icon: 'lock', color: 'gray', name: '???', note: "Beat Charlie's chess bot.", locked: true, id: 'beat-chess-bot' },
  { icon: 'lock', color: 'gray', name: '???', note: 'Huskers win the Big Ten.', locked: true },
];


// The dialogue tree for "Talk to Charlie". Answers only use facts from this file.
export const dialogue = {
  greeting: "Hey, I'm Charlie. What do you want to know?",
  options: [
    {
      q: 'What do you do at MSCI?',
      a: "I'm a Senior Associate in MSCI Private Assets, at 7 World Trade. I work on software that helps investors evaluate private funds before they invest. I joined when MSCI acquired Vantager in 2026.",
    },
    {
      q: 'How did you get here?',
      a: 'Finance and accounting at the University of Nebraska–Lincoln, with code internships in the summers. Then fund diligence by hand at a multi-family office in San Francisco, and an AI startup, Vantager, that MSCI bought.',
    },
    {
      q: 'What have you built?',
      a: 'My first LLM product in 2023, a support assistant trained on 250,000 tickets. Since then, personal projects: Locus, an app that runs my own finances; a short-video engine built on public data; an obituary monitor; and an iPhone app called Phyt.',
    },
    {
      q: 'What do you do for fun?',
      a: 'Golf, chess every day (you can play my bot above), piano, and Husker football.',
    },
    {
      q: 'Where are you from?',
      a: 'Kearney, Nebraska. Then Lincoln for college, a summer in San Francisco, and now New York.',
    },
    {
      q: 'How do I reach you?',
      a: `LinkedIn or email, ${email}. Press R for the resume.`,
    },
  ],
};

// The resume page (/resume): the same facts on one printable page.
export const resume = {
  summary:
    'Finance-first builder in private markets. Senior Associate at MSCI Private Assets, working on AI-powered pre-investment diligence for private-fund investors, after joining through MSCI’s acquisition of Vantager, where I was on the early team. Finance and accounting at the University of Nebraska–Lincoln, with minors in computer science and math; shipping LLM products since 2023.',
  experience: [
    {
      org: 'MSCI',
      role: 'Senior Associate, Private Assets',
      where: 'New York, NY',
      when: 'Mar 2026 – present',
      points: [
        'Work on MSCI’s AI-powered pre-investment diligence for private markets: tools that help pensions, endowments, foundations, family offices and wealth managers size up private funds before they commit capital.',
        'Joined through MSCI’s March 2026 acquisition of Vantager, an AI-native pre-investment diligence platform.',
      ],
    },
    {
      org: 'Vantager (acquired by MSCI)',
      role: 'Growth & Product Analyst',
      where: 'New York, NY',
      when: 'Mar 2025 – Mar 2026',
      points: [
        'Early team member at an AI-native pre-investment diligence platform that turns GP data-room documents into diligence reports; part-time from March 2025, full-time in New York from June 2025, through the acquisition.',
        'Built out the platform’s library of diligence templates and made them easier for customers to find and use.',
        'Ran data-quality checks and platform QA on AI-generated diligence reports, focused on accuracy and user experience.',
        'Built golden datasets to evaluate and improve the AI system, and financial models for the business.',
        'Turned customer feedback into product work: built a system that rolled meeting notes and feedback into product tasks, ran product demos, and worked with the CEO on go-to-market and sales strategy.',
      ],
    },
    {
      org: 'Three Bridge Wealth Advisors',
      role: 'Financial Analyst, Investment Committee',
      where: 'San Francisco, CA',
      when: 'Jan 2024 – Feb 2025',
      points: [
        'Ran private-investment due diligence for a multi-family office: intro calls, investment memos and committee overviews; in person in San Francisco for summer 2024.',
        "Maintained the firm's investment database, with a focus on private investments.",
        'Automated research and reporting work with Python scripts and AI.',
      ],
    },
  ],
  internships: [
    { org: 'Covisum', role: 'Agile Developer Intern', where: 'Omaha, NE', when: 'Summer 2023', line: 'Built financial-advisory tools and a client intake form with the CEO.' },
    { org: 'Buckle', role: 'Software Developer Intern, E-Commerce', where: 'Kearney, NE', when: 'Summer 2022', line: 'Shipped production features, including the favorites page.' },
    { org: 'Cash-Wa Distributing', role: 'IT Intern', where: 'Kearney, NE', when: 'Summer 2021', line: 'Python macros; built and audited the IT department’s hardware.' },
  ],
  projects: [
    {
      name: 'Locus',
      line: 'Personal OS for money, calendar and documents with an AI assistant (Next.js, Supabase, Plaid); read-only by design, 4,349 tests.',
    },
    {
      name: 'Faceless engine',
      line: 'Turns 226 official data series into fact-checked, narrated short videos for three pages (TypeScript, Remotion, Claude).',
    },
    {
      name: 'Obituary monitor',
      line: 'Weekly agent that checks 10 funeral-home sites against a list of names, with one adapter per site platform.',
    },
    {
      name: 'Phyt',
      line: 'A fitness app for iPhone, designed and built end to end, logo included.',
    },
  ],
  research: {
    title: 'The Illiquidity Premium and Its Impact on Asset Pricing and Returns',
    line: 'Paper for Strategic Finance Management (FINA 475H), May 2025: what sets the premium and how it shows up across public markets, PE/VC, real estate and private credit.',
    url: '/writing/illiquidity-premium',
  },
  education: {
    school: 'University of Nebraska–Lincoln',
    degree: 'B.S.B.A., Finance and Accounting · Minors in Computer Science and Mathematics',
    program: 'Raikes School of Computer Science and Management · University Honors Program',
    when: 'May 2025',
    honors: 'Graduated with High Distinction · Regents Scholar',
    points: [
      "Senior capstone, product manager: machine learning for Conagra Brands' $500M capital-expenditure decisions.",
      'Junior capstone, developer: GPT-3.5 support assistant for DMSi, trained on 250,000 support tickets.',
      'Teaching assistant, Honors Computer Science I and II.',
    ],
  },
  leadership: [
    'FarmHouse Fraternity, Treasurer (two terms): $850K annual budget, 110 members',
    'Mortar Board Honor Society, Social Chair',
    'NHRI Mentoring: Staff Advisor, Tri-Chair, UCARE researcher',
    'Raikes Student Advisory Board; Dance Marathon',
  ],
  skills: [
    'Private-markets diligence',
    'Financial modeling',
    'Accounting',
    'Python',
    'TypeScript',
    'SQL',
    'Next.js',
    'Supabase',
    'Excel and VBA',
    'LLM apps, agents and evals',
  ],
  awards: ['Regents Scholar', '6× Dean’s List', 'Mortar Board', 'Eagle Scout', 'UNL Homecoming Royalty Nominee'],
};
