// Everything the site says about Charlie lives here. Facts come from his resume,
// public sources and his own writing; TODO markers are open questions for him.
import type { IconName } from './pixels';
import type { LogoName } from './logos';

export const site = {
  url: 'https://charliebrockmeier.com',
  name: 'Charlie Brockmeier',
  title: 'Charlie Brockmeier | AI products for private markets',
  tagline: 'Finance at the core. I build AI products for private markets.',
  positioning:
    'I build AI products for private markets and wealth management. Currently at MSCI Private Assets; previously Vantager, acquired by MSCI.',
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
  bio: [
    "I'm a finance guy at the core who builds with code and AI. I grew up in Kearney, Nebraska, was student council president at Kearney High, and shipped my first production code at summer internships before I could explain a capital call.",
    "Every step since has moved me closer to where finance meets AI. Finance and accounting at UNL's Raikes School, with minors in computer science and math, and my first LLM product in 2023. Private-investment diligence by hand for a multi-family office, including a summer in San Francisco. Then Vantager, an AI-native diligence startup, through its acquisition by MSCI. Now I'm a Senior Associate at MSCI Private Assets, building the tools investors use to size up private funds.",
    'Off the clock I build personal projects nobody asked for: an obituary monitor that has read 450+ obituaries, a portfolio engine that grades A to F, Locus for my own money, and Phyt. Plus a 567-day chess streak, ten-plus years of piano, and the Huskers, always.',
  ],
};

// Attribute bars. Values are for fun; the notes are true. Finance leads on purpose.
export const stats: { name: string; value: number; icon: IconName; color: string; note: string }[] = [
  { name: 'Finance', value: 92, icon: 'coins', color: 'gold', note: 'Finance and accounting degree. Diligence for a living.' },
  { name: 'AI', value: 88, icon: 'chip', color: 'teal', note: 'Shipping LLM products since GPT-3.5, in 2023.' },
  { name: 'Private markets', value: 86, icon: 'chart', color: 'violet', note: 'Did diligence by hand, then helped build the AI that does it.' },
  { name: 'Leadership', value: 84, icon: 'podium', color: 'coral', note: 'Student council president. Treasurer of a $850K budget. TA.' },
  { name: 'Code', value: 80, icon: 'bolt', color: 'blue', note: 'Python, TypeScript, SQL. Raikes School trained.' },
  { name: 'Chess', value: 62, icon: 'knight', color: 'green', note: 'Rapid 1209, top 7%. 60.5% wins over the last 90 days.' },
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
      ['Games against bots', '2'],
      ['Puzzles solved', '0'],
      ['On chess.com since', 'April 2021'],
    ],
    quip: 'Username: CharlieCaro. Defense: the Caro-Kann, every time. Puzzles solved in all of 2023: three.',
  },
  {
    id: 'huskers',
    title: 'Huskers',
    icon: 'husker',
    color: 'red',
    source: 'Go Big Red',
    big: { value: 'GBR', label: 'Husker fan for life. I travel for it.' },
    rows: [
      ['Road game, 2024', 'Ohio State, Columbus'],
      ['Road game, 2024', 'USC, Los Angeles'],
      ['Seats bought for Columbus', '9'],
      ['Student years in the Sea of Red', '2021–25'],
    ],
  },
  {
    id: 'music',
    title: 'Music',
    icon: 'note',
    color: 'teal',
    source: 'Spotify Wrapped',
    big: { value: '53,153', label: 'minutes of music in 2020. That is 36.9 days.' },
    bars: [
      { label: '2017', value: 1160, display: '1,160 min' },
      { label: '2020', value: 53153, display: '53,153 min' },
    ],
    rows: [
      ['Piano', '10+ years'],
      ['Listening CAGR, 2017–20', '258%'],
      ['Different songs, 2019', '4,423'],
      ['Top fan, 2023', 'Post Malone'],
      ['Top-listener badges', '9 artists'],
    ],
    quip: 'Yes, I computed the CAGR.',
  },
  {
    id: 'builder',
    title: 'Builder',
    icon: 'chip',
    color: 'violet',
    source: 'My own projects',
    big: { value: '6,000+', label: 'names my obituary monitor has cross-checked since August' },
    rows: [
      ['Obituaries read', '450+'],
      ['Funeral-home sites, every week', '10'],
      ['Weekly runs so far', '8'],
      ['Tickets behind my first LLM product', '250,000'],
      ['Issue rules in my portfolio engine', '27'],
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    icon: 'book',
    color: 'green',
    source: 'Yousician, Duolingo, Quizlet',
    big: { value: '10+', label: 'years of piano' },
    rows: [
      ['Guitar, self-taught since', '2022'],
      ['Duolingo since', '2024'],
      ['Quizlet sets studied', '100+'],
      ['Longest Quizlet streak', '5+ weeks'],
    ],
  },
  {
    id: 'gaming',
    title: 'Gaming',
    icon: 'gamepad',
    color: 'blue',
    source: 'Steam, Godot',
    big: { value: '1', label: 'game in progress, built in Godot' },
    rows: [
      ['Steam name', 'Chicken'],
      ['Main game', 'Counter-Strike'],
      ['Currently', 'Marvel Rivals'],
      ['Games shipped', '0, so far'],
    ],
  },
  {
    id: 'life',
    title: 'Life',
    icon: 'crown',
    color: 'gold',
    source: 'Real life',
    big: { value: '$850K', label: 'annual budget I ran as fraternity treasurer' },
    rows: [
      ['Kearney High, class of', '2021'],
      ['Student council', 'President'],
      ['State tennis', 'Medalist'],
      ['Homecoming royalty', '2nd place'],
      ['Strava activities, year one', '38'],
      ['Highway that links my map', 'I-80'],
    ],
    quip: 'I-80 runs from San Francisco to the edge of New York City, through Kearney, Lincoln and Omaha on the way.',
  },
];

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
    emblems: ['khs'],
    summary: 'Student council president, state tennis medalist, Eagle Scout. Starting stats: low. Potential: high.',
    objectives: ['Student council president, 2020–21', 'Medal at state in tennis', 'Boys State delegate, 2020'],
    reward: 'A ticket to Lincoln',
    unlocked: 'Leadership',
    levels: { finance: 0, code: 0, ai: 0, lead: 3 },
    levelUps: [
      { skill: 'Leadership', track: 'lead', up: 2, carries: 'Treasurer, $850K budget' },
      { skill: 'Public speaking', track: 'lead', up: 1 },
      { skill: 'Grit', track: 'lead', up: 'new', carries: 'every chapter' },
    ],
    scene: { src: '/art/prologue.png', place: 'The Platte River', alt: 'Pixel art: a campfire by the Platte at night, a tent and sandhill cranes.' },
  },
  {
    chapter: 'Chapter 1',
    title: 'Tutorial levels',
    when: '2021 – 2023',
    where: 'Kearney and Omaha, NE',
    role: 'Three internships',
    status: 'complete',
    emblems: ['cashwa', 'buckle', 'covisum'],
    summary: 'Three summers, three stacks, all real code. The last one was financial software for advisors: my first taste of finance plus tech.',
    objectives: [
      'Cash-Wa Distributing: Python macros, and built the IT department’s PCs',
      "Buckle: shipped the e-commerce site's favorites page to production",
      'Covisum: built advisor tools and a client intake form with the CEO',
    ],
    reward: 'Production code',
    unlocked: 'Code',
    levels: { finance: 1, code: 3, ai: 0, lead: 3 },
    levelUps: [
      { skill: 'Python', track: 'code', up: 'new', carries: 'automation at Three Bridge' },
      { skill: 'JavaScript and Java', track: 'code', up: 'new' },
      { skill: 'Shipping to production', track: 'code', up: 1, carries: 'Locus' },
      { skill: 'Fintech', track: 'finance', up: 'new', carries: 'Vantager' },
    ],
    scene: { src: '/art/tutorial.png', place: 'Kearney and Omaha', alt: 'Pixel art: a workbench with code on a monitor and an open PC tower.' },
  },
  {
    chapter: 'Chapter 2',
    title: 'The Raikes School',
    when: '2021 – 2025',
    where: 'Lincoln, NE',
    role: 'B.S.B.A. Finance & Accounting · minors in CS and Math',
    status: 'complete',
    emblems: ['unl'],
    summary: 'An honors program of about 35 students a year, built where code meets business. Finance became the core; AI showed up in 2023.',
    objectives: [
      'Junior capstone developer: a GPT-3.5 support assistant for DMSi, trained on 250,000 tickets',
      "Senior capstone PM: machine learning for Conagra Brands' $500M capital-expenditure decisions",
      'Treasurer of a $850K budget; TA for Honors Computer Science I and II',
    ],
    reward: 'Graduated with High Distinction',
    unlocked: 'AI',
    levels: { finance: 5, code: 5, ai: 2, lead: 7 },
    levelUps: [
      { skill: 'Accounting and valuation', track: 'finance', up: 3, carries: 'diligence at Three Bridge' },
      { skill: 'LLMs', track: 'ai', up: 'new', carries: 'Vantager' },
      { skill: 'Machine learning', track: 'ai', up: 1 },
      { skill: 'C#, SQL, software teams', track: 'code', up: 2 },
      { skill: 'Budgets and boards', track: 'lead', up: 2 },
      { skill: 'Teaching', track: 'lead', up: 1 },
    ],
    extras: [
      { name: 'FarmHouse Treasurer', note: '$850K annual budget, 110 members' },
      { name: 'FarmHouse Scholarship Chair', note: 'Kept the chapter on track academically' },
      { name: 'Mortar Board', note: 'Senior honor society; social chair' },
      { name: 'NHRI Mentoring', note: 'Staff advisor, tri-chair, researcher, Stuart Award committee' },
      { name: 'Dance Marathon', note: 'Morale and corporate sponsorship' },
      { name: 'Teaching assistant', note: 'Honors Computer Science I and II' },
      { name: 'Raikes Student Advisory Board', note: 'A voice for the program' },
      { name: 'Judiciary Board', note: 'Chapter accountability' },
      { name: 'Homecoming Royalty', note: '2024 finalist. Finished 2nd. Probably.' },
      { name: 'Regents Scholar', note: 'Plus 6× College of Business Dean’s Scholar' },
      { name: 'The Illiquidity Premium', note: 'A paper on private-markets returns, May 2025' },
      { name: 'Pickleball Club', note: 'Competitive about it' },
    ],
    scene: { src: '/art/raikes.png', place: 'Lincoln, Nebraska', alt: 'Pixel art: the Nebraska State Capitol at dusk.' },
  },
  {
    chapter: 'Chapter 3',
    title: 'Three Bridge Wealth Advisors',
    when: '2024 – 2025',
    where: 'San Francisco, CA',
    role: 'Financial Analyst, Investment Committee',
    status: 'complete',
    emblems: ['threebridge'],
    summary: 'A summer in San Francisco doing private-investment diligence for a multi-family office: intro calls, memos and committee overviews by day, hikes and Pebble Beach on weekends. Learned the job by hand, then automated the boring parts.',
    objectives: ['Intro calls, investment memos and committee overviews', 'Kept the private-investments database honest', 'Automated research and reporting with Python and AI'],
    reward: 'Diligence, the manual way',
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
    chapter: 'Chapter 4',
    title: 'Vantager',
    when: '2025 – 2026',
    where: 'New York, NY',
    role: 'Product & Growth Analyst',
    status: 'complete',
    emblems: ['vantager'],
    summary: 'Joined an AI-native diligence startup early. Its platform read the documents GPs put in data rooms and turned them into diligence reports: the manual job I knew, rebuilt with AI.',
    objectives: ['Shape product and growth strategy', 'Boss fight: acquired by MSCI, a Fortune 1000 company, in 2026'],
    reward: 'Acquired',
    unlocked: 'Finance × AI',
    levels: { finance: 8, code: 6, ai: 7, lead: 8 },
    levelUps: [
      { skill: 'AI diligence', track: 'ai', up: 'new', carries: 'MSCI' },
      { skill: 'Product', track: 'lead', up: 'new' },
      { skill: 'Growth', track: 'lead', up: 1 },
      { skill: 'Data rooms at scale', track: 'finance', up: 1 },
      { skill: 'Startup speed', track: 'code', up: 1 },
    ],
    scene: { src: '/art/vantager.png', place: 'Brooklyn Bridge, New York', alt: 'Pixel art: the Brooklyn Bridge at dusk with Manhattan behind it.' },
  },
  {
    chapter: 'Chapter 5',
    title: 'MSCI Private Assets',
    when: '2026 – now',
    where: 'New York, NY · 7 World Trade Center',
    role: 'Senior Associate',
    status: 'active',
    emblems: ['msci'],
    summary: 'Building pre-investment diligence and evaluation tools for private-asset investors, now at the scale of a global index and analytics company.',
    objectives: ['Arrive through the Vantager acquisition', 'Make private-markets diligence take hours, not weeks'],
    reward: 'In progress',
    unlocked: 'Scale',
    levels: { finance: 9, code: 6, ai: 8, lead: 8 },
    levelUps: [
      { skill: 'Private assets at index scale', track: 'finance', up: 1 },
      { skill: 'Enterprise AI', track: 'ai', up: 1 },
    ],
    scene: { src: '/art/msci.png', place: 'Lower Manhattan', alt: 'Pixel art: an office desk at night with a chart on the monitor and towers through the window.' },
  },
];

// AI agents Charlie actually runs, cast as a party.
export const party = [
  {
    name: 'The Scout',
    cls: 'Ranger',
    job: 'Obituary monitor',
    cadence: 'Weekly',
    does: 'Checks 10 funeral-home sites every week, cross-checks the names and drafts a summary email.',
    human: 'I review it before anything goes out.',
  },
  {
    name: 'The Warden',
    cls: 'Paladin',
    job: 'Portfolio surveillance',
    cadence: 'Monthly',
    does: 'Grades every portfolio in a book A to F against a target model and runs 27 issue rules.',
    human: 'It flags; I decide.',
  },
  {
    name: 'The Herald',
    cls: 'Bard',
    job: 'Morning brief',
    cadence: 'Weekdays',
    does: 'Pulls the day together into a one-page brief before I wake up.',
    human: 'Read-only.',
  },
  {
    name: 'The Smith',
    cls: 'Artificer',
    job: 'Coding agent',
    cadence: 'Daily',
    does: 'Builds alongside me, including this site.',
    human: 'I review every change.',
  },
];

export type Tier = 'legendary' | 'epic' | 'rare' | 'common';

export const inventory: { equipped: Item[]; bag: Item[] } = {
  equipped: [
    { code: 'FIN', name: 'Finance', tier: 'legendary', note: 'Valuation, accounting, diligence. The core.' },
    { code: 'PY', name: 'Python', tier: 'legendary', note: 'First language. Still the main weapon.' },
    { code: 'AI', name: 'LLMs and agents', tier: 'legendary', note: 'Daily driver, and the brains of my party.' },
    { code: 'TS', name: 'TypeScript', tier: 'epic', note: 'Next.js, Astro and Supabase. Locus and this site.' },
    { code: 'SQL', name: 'SQL', tier: 'epic', note: 'Where the answers actually live.' },
    { code: 'XL', name: 'Excel + VBA', tier: 'epic', note: "Every finance kid's first spellbook." },
  ],
  bag: [
    { code: 'R', name: 'R', tier: 'rare', note: 'Stats class survivor.' },
    { code: 'JV', name: 'Java', tier: 'rare', note: 'Shipped to production at Buckle.' },
    { code: 'C#', name: 'C#', tier: 'rare', note: 'Raikes School staple, with Blazor.' },
    { code: 'JS', name: 'JavaScript', tier: 'rare', note: 'The e-commerce favorites page.' },
    { code: 'RE', name: 'React', tier: 'rare', note: 'Front ends for most of my builds.' },
    { code: 'SB', name: 'Supabase', tier: 'rare', note: 'Auth and row-level security for Locus.' },
    { code: 'GD', name: 'Godot', tier: 'common', note: 'For the game. Still learning.' },
    { code: 'GA', name: 'GitHub Actions', tier: 'common', note: 'Runs the obituary monitor every week.' },
  ],
};

export type Item = { code: string; name: string; tier: Tier; note: string };

// Crafted items. `mock` picks the illustrated screen shown for each one; every
// number in a mock is synthetic except the stats listed here.
export type Build = {
  id: 'obituary' | 'portfolio' | 'locus' | 'phyt' | 'faceless' | 'site';
  name: string;
  status: string;
  repo: { name: string; visibility: 'public' | 'private' } | null;
  stack: string[];
  line: string;
  detail: string;
  stats?: [string, string][];
};

export const builds: Build[] = [
  {
    id: 'obituary',
    name: 'Obituary monitor',
    status: 'Live, every Monday',
    repo: { name: 'FuneralChecker', visibility: 'private' },
    stack: ['Python', 'GitHub Actions', 'one adapter per site platform'],
    line: 'Reads 10 funeral-home sites every week and flags names on a watchlist in days, not months.',
    detail:
      'Instead of one scraper per site, there is one adapter per website platform: a JSON API for one, a sitemap crawl for another, a headless browser for a third. Adding a site usually means zero new code. It runs itself every week and emails a digest.',
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
    status: 'Runs my own money',
    repo: { name: 'brockmeier-finances', visibility: 'private' },
    stack: ['Next.js', 'Supabase', 'Plaid', 'brokerage API'],
    line: 'A personal finance and trading app with bank and brokerage links.',
    detail: 'Built to production security standards: row-level security, secrets management, auth on every route and authorization checks on the trade-execution path.',
  },
  {
    id: 'phyt',
    name: 'Phyt',
    status: 'In development',
    repo: null,
    stack: ['iOS', 'product design'],
    line: 'A fitness app for iPhone, designed and built end to end. Logo included.',
    detail: 'From the logo to the last screen, mine. More soon.',
  },
  {
    id: 'faceless',
    name: 'Faceless engine',
    status: 'Experiment',
    repo: { name: 'faceless-engine', visibility: 'private' },
    stack: ['FRED', 'BLS', 'NYC Open Data', 'Our World in Data', 'AI narration'],
    line: 'Turns public economic data into narrated short videos, start to finish.',
    detail: 'Pulls a series, finds the story in it, writes the script, narrates it and renders the chart animation. No face required.',
  },
  {
    id: 'site',
    name: 'This site',
    status: 'You are here',
    repo: { name: 'charliebrockmeier.com', visibility: 'public' },
    stack: ['Astro', 'pixel art drawn in code', 'a chess bot'],
    line: 'A player profile with a talking NPC, a chess bot and live chess stats.',
    detail: 'Every pixel is drawn in code. The chess and GitHub numbers refresh on every build.',
  },
];

export type Achievement = { icon: IconName; color: string; name: string; note: string; locked?: boolean; id?: string };

export const achievements: Achievement[] = [
  { icon: 'trophy', color: 'gold', name: 'Acquired', note: 'Vantager, bought by MSCI, a Fortune 1000 company. I was on the team.' },
  { icon: 'chip', color: 'teal', name: 'Early adopter', note: 'First LLM product in 2023, on 250,000 support tickets.' },
  { icon: 'podium', color: 'violet', name: 'Mr. President', note: 'Kearney High student council, 2020–21.' },
  { icon: 'medal', color: 'gold', name: 'State medalist', note: 'Nebraska state tennis.' },
  { icon: 'crown', color: 'gray', name: 'Silver crown', note: 'UNL Homecoming Royalty, 2024. Finished 2nd. Probably.' },
  { icon: 'coins', color: 'violet', name: 'Treasurer', note: '$850K annual budget, 110 members.' },
  { icon: 'cap', color: 'blue', name: 'High Distinction', note: 'UNL, 2025. Finance and accounting, minors in CS and math.' },
  { icon: 'bolt', color: 'teal', name: 'West coast arc', note: 'A summer in San Francisco: diligence by day, hikes and Pebble Beach on weekends.' },
  { icon: 'fire', color: 'coral', name: 'Unbroken', note: '567 days of chess in a row. And counting.' },
  { icon: 'knight', color: 'blue', name: 'Grinder', note: '4,603 games on chess.com. 275 in September alone.' },
  { icon: 'chart', color: 'teal', name: 'Top 7%', note: 'Rapid 1209: better than 93% of rapid players on chess.com.' },
  { icon: 'husker', color: 'red', name: 'Road warrior', note: 'Followed the Huskers to Columbus and Los Angeles.' },
  { icon: 'book', color: 'red', name: 'Teaching assistant', note: 'Honors Computer Science I and II.' },
  { icon: 'fleur', color: 'gold', name: 'Eagle Scout', note: '2019.' },
  { icon: 'lock', color: 'gray', name: '???', note: "Beat Charlie's chess bot.", locked: true, id: 'beat-chess-bot' },
  { icon: 'lock', color: 'gray', name: '???', note: 'Ship the Godot game.', locked: true },
  { icon: 'lock', color: 'gray', name: '???', note: 'Huskers win the Big Ten.', locked: true },
];

export const sideQuests: { icon: IconName; color: string; name: string; note: string }[] = [
  { icon: 'knight', color: 'gold', name: 'Chess', note: '567-day streak. Caro-Kann, always.' },
  { icon: 'husker', color: 'red', name: 'Huskers', note: 'Home games, road games, every game.' },
  { icon: 'note', color: 'teal', name: 'Piano', note: '10+ years at the keys.' },
  { icon: 'gamepad', color: 'blue', name: 'Game dev', note: 'Building a game in Godot.' },
  { icon: 'note', color: 'violet', name: 'Guitar', note: 'Self-taught, in progress.' },
  { icon: 'spade', color: 'gray', name: 'Poker', note: 'Pot odds and people.' },
  { icon: 'bolt', color: 'coral', name: 'Training', note: 'Logged on Strava.' },
  { icon: 'book', color: 'gold', name: 'Writing', note: 'Short stories and essays.' },
];

export const codex = [
  {
    title: 'Scale delays disruption. It never cancels it.',
    where: 'Essay on Apple, Google and who owns the AI layer',
    when: 'Drafting',
    status: 'Drafting',
  },
  {
    title: 'The Illiquidity Premium',
    where: 'Paper on private-markets returns',
    when: 'May 2025',
    status: 'Archive',
  },
];

// The dialogue tree for "Talk to Charlie". Answers only use facts from this file.
export const dialogue = {
  greeting: "Hey, I'm Charlie. Finance at the core, building with AI. What do you want to know?",
  options: [
    {
      q: 'What do you do at MSCI?',
      a: "I'm a Senior Associate at MSCI Private Assets, at 7 World Trade. I work on pre-investment diligence and evaluation tools, the software investors use to size up a private fund before they commit capital. I got here when MSCI acquired Vantager in 2026.",
    },
    {
      q: 'How did you end up here?',
      a: 'One step at a time, each closer to finance plus AI. Code internships in Nebraska, finance and accounting at the Raikes School, my first LLM product in 2023, private-investment diligence by hand at a multi-family office, then an AI diligence startup that MSCI bought.',
    },
    {
      q: 'What AI have you actually built?',
      a: 'A GPT-3.5 support assistant on 250,000 tickets in 2023. Since then, personal projects: an obituary monitor that has read 450+ obituaries, a portfolio engine that grades A to F, Locus, Phyt, an engine that turns public data into narrated videos, and a few agents that run on schedules.',
    },
    {
      q: 'What do you do for fun?',
      a: 'Chess every single day: 567 days and counting, rapid 1209, Caro-Kann always. Huskers football wherever they play, piano for ten-plus years, a game in Godot, poker and guitar. You can play my chess bot above.',
    },
    {
      q: 'Where are you from?',
      a: 'Kearney, Nebraska. Kearney High class of 2021, student council president. Then Lincoln for school, a summer working in San Francisco, and New York.',
    },
    {
      q: 'How do I reach you?',
      a: `LinkedIn is fastest, or email ${email}. In a hurry? Press R for the one-page resume, or grab the PDF.`,
    },
  ],
};

// The resume page (/resume): the same facts on one printable page.
export const resume = {
  summary:
    'Senior Associate at MSCI Private Assets, building pre-investment diligence and evaluation tools. Previously on the early team at Vantager, an AI-native diligence platform acquired by MSCI in 2026. Engineer-trained finance analyst from the Raikes School who has shipped LLM products since 2023.',
  experience: [
    {
      org: 'MSCI',
      role: 'Senior Associate, Private Assets',
      where: 'New York, NY',
      when: 'Mar 2026 – present',
      points: [
        'Pre-investment diligence and evaluation tools for private-asset investors.',
        "Joined through MSCI's acquisition of Vantager in March 2026.",
      ],
    },
    {
      org: 'Vantager (acquired by MSCI)',
      role: 'Product & Growth Analyst',
      where: 'New York, NY',
      when: 'Mar 2025 – Mar 2026',
      points: [
        'Shaped product and growth strategy for an AI-native platform that turns GP data-room documents into investment, operational and legal diligence reports.',
        'Early team member: part-time from March 2025, full-time from June 2025, through the acquisition.',
      ],
    },
    {
      org: 'Three Bridge Wealth Advisors',
      role: 'Financial Analyst, Investment Committee',
      where: 'San Francisco, CA',
      when: 'Jan 2024 – Feb 2025',
      points: [
        'Ran investment due diligence for a multi-family office: intro calls, investment memos and committee overviews.',
        "Maintained the firm's investment database, with a focus on private investments.",
        'Automated research and reporting work with Python scripts and AI.',
      ],
    },
    {
      org: 'Covisum',
      role: 'Agile Developer Intern',
      where: 'Omaha, NE',
      when: 'May – Aug 2023',
      points: ['Built financial-advisory tools end to end, including a client intake form, with requirements from the CEO.'],
    },
    {
      org: 'Buckle',
      role: 'Software Developer Intern, E-Commerce',
      where: 'Kearney, NE',
      when: 'May – Aug 2022',
      points: ['Shipped production features, including the favorites page, on a ten-person team (JavaScript, HTML, Java).'],
    },
    {
      org: 'Cash-Wa Distributing',
      role: 'IT Intern',
      where: 'Kearney, NE',
      when: 'May – Aug 2021',
      points: ['Automated processes with Python macros; built and audited hardware for the IT department.'],
    },
  ],
  projects: [
    {
      name: 'Obituary monitor',
      line: 'Watches public obituary sites for names on a watchlist, with one adapter per funeral-home website platform instead of one scraper per site.',
    },
    {
      name: 'Portfolio surveillance engine',
      line: 'Portfolio drift against a target model, A–F grades and a 27-rule issue library that turns a monthly review into a ranked to-do list.',
    },
    {
      name: 'Locus',
      line: 'Personal finance and trading app (Next.js, Supabase, brokerage API) with row-level security and authorization on the trade path.',
    },
    {
      name: 'Phyt',
      line: 'A fitness app for iPhone, designed and built end to end, logo included.',
    },
  ],
  education: {
    school: 'University of Nebraska–Lincoln',
    degree: 'B.S.B.A., Finance and Accounting · Minors in Computer Science and Mathematics',
    program: 'Jeffrey S. Raikes School of Computer Science and Management',
    when: 'May 2025',
    honors: 'Graduated with High Distinction',
    points: [
      "Senior capstone, product manager: machine learning for Conagra Brands' $500M capital-expenditure decisions.",
      'Junior capstone, developer: GPT-3.5 support assistant for DMSi, trained on 250,000 support tickets.',
      'Teaching assistant, Honors Computer Science I and II.',
    ],
  },
  leadership: [
    'FarmHouse Fraternity, Treasurer: $850K annual budget, 110 members',
    'Mortar Board Honor Society, Social Chair',
    'NHRI Mentoring: Staff Advisor, Tri-Chair, Researcher',
    'Dance Marathon: Morale and Corporate Sponsorship',
  ],
  skills: [
    'Python',
    'TypeScript',
    'SQL',
    'R',
    'Java',
    'C#',
    'React',
    'Next.js',
    'Supabase',
    'Excel and VBA',
    'LLM apps and agents (Claude)',
  ],
  awards: ['Eagle Scout', 'Regents Scholar', '6× College of Business Dean’s Scholar', 'Mortar Board', 'UNL Homecoming Royalty Nominee'],
};
