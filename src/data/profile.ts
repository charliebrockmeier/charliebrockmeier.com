// Everything the site says about Charlie lives here. Facts come from his resume,
// public sources and his own writing; TODO markers are open questions for him.
import type { IconName } from './pixels';

export const site = {
  url: 'https://charliebrockmeier.com',
  name: 'Charlie Brockmeier',
  title: 'Charlie Brockmeier | AI products for private markets',
  tagline: 'I build AI products for private markets and wealth management.',
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
  className: 'Builder / Analyst',
  title: 'Senior Associate',
  guild: 'MSCI Private Assets',
  base: 'New York, NY',
  origin: 'Kearney, Nebraska',
  bio: [
    "I grew up in Kearney, Nebraska, wanting to be MacGyver. At a Boy Scout survival campout I rode blindfolded in the back of a truck, followed a compass to a campsite on the Platte River, and cooked eggs in an orange peel. I've been building things out of whatever's lying around ever since.",
    "These days the things are AI products. I studied finance and accounting, with minors in computer science and math, in the Raikes School at the University of Nebraska–Lincoln. I did private-markets diligence by hand at a multi-family office, then joined Vantager, an AI diligence startup, and stayed through its acquisition by MSCI. Now I'm a Senior Associate at MSCI Private Assets.",
    'Off the clock I build personal projects nobody asked me to: an obituary watcher, a portfolio engine that grades portfolios A to F, a finance app that runs my own money, and an app called Phyt. Also: way too much chess.',
  ],
};

// Attribute bars. Values are for fun; the notes are true.
export const stats = [
  { name: 'AI', value: 90, note: 'Shipping LLM products since GPT-3.5.' },
  { name: 'Private markets', value: 86, note: 'Did diligence by hand, then helped build the AI that does it.' },
  { name: 'Code', value: 82, note: 'Python, TypeScript, SQL. Raikes School trained.' },
  { name: 'Finance', value: 85, note: 'Finance and accounting major. Ran an $850K budget in college.' },
  { name: 'Grit', value: 95, note: 'Eagle Scout. Solo night at Wilderness Survival.' },
  { name: 'Chess', value: 51, note: 'Win rate, 139 of 275. The streak is 500+ days.' },
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

// Charlie's chess streak: 500+ days as of the date below. The site draws one square per day.
export const chess = { games: 275, wins: 139, month: 'September 2026', streak: '500+', streakDays: 500, streakAsOf: '2026-10-22' };

export const statBlocks: StatBlock[] = [
  {
    id: 'chess',
    title: 'Chess',
    icon: 'knight',
    color: 'gold',
    source: 'chess.com · September 2026',
    big: { value: '500+', label: 'day streak, and counting' },
    rows: [
      ['Games in September', '275'],
      ['Wins', '139'],
      ['Win rate', '50.5%'],
      ['Games a day', '9.2'],
      ['Brilliant moves', '3'],
      ['Games against bots', '2'],
      ['Puzzles solved in September', '0'],
      ['On chess.com since', 'April 2021'],
    ],
    quip: 'Puzzles solved in all of 2023: three. The hardest was rated 259.',
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
      ['Growth, 2017 to 2020', '46×'],
      ['Listening CAGR', '258%'],
      ['Different songs, 2019', '4,423'],
      ['Top fan, 2023', 'Post Malone'],
      ['Also a top fan of', 'Luke Combs'],
      ['On Spotify since', '2016'],
    ],
    quip: 'Yes, I computed the CAGR.',
  },
  {
    id: 'training',
    title: 'Training',
    icon: 'bolt',
    color: 'red',
    source: 'Strava · first year',
    big: { value: '38', label: 'activities logged in my first year on Strava' },
    rows: [
      ['Miles', '35'],
      ['Active hours', '24'],
      ['Average session', '38 min'],
      ['Joined', 'September 2025'],
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
    id: 'builder',
    title: 'Builder',
    icon: 'chip',
    color: 'violet',
    source: 'My own projects',
    big: { value: '250,000', label: 'support tickets behind my first LLM product, in 2023' },
    rows: [
      ['Issue rules in my portfolio engine', '27'],
      ['Funeral-home sites watched weekly', '10'],
      ['AI agents in my party', '4'],
      ['Personal projects', '5'],
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    icon: 'book',
    color: 'green',
    source: 'Yousician, Duolingo, Quizlet',
    big: { value: '4', label: 'years teaching myself guitar' },
    rows: [
      ['Guitar since', 'September 2022'],
      ['Duolingo since', 'October 2024'],
      ['Quizlet sets studied', '100+'],
      ['Longest Quizlet streak', '5+ weeks'],
    ],
  },
  {
    id: 'life',
    title: 'Life',
    icon: 'fleur',
    color: 'gold',
    source: 'Real life',
    big: { value: '$850K', label: 'annual budget I ran as fraternity treasurer' },
    rows: [
      ['Members it covered', '110'],
      ['Years in Scouts', '7'],
      ['Eggs cooked in an orange peel', '1'],
      ['Homecoming crowns', '1'],
      ['Cities on my map', '5'],
      ['Highway that links all five', 'I-80'],
    ],
    quip: 'I-80 runs from San Francisco to the edge of New York City, through Kearney, Lincoln and Omaha on the way.',
  },
];

export type Quest = {
  chapter: string;
  title: string;
  when: string;
  where: string;
  role: string;
  status: 'active' | 'complete';
  summary: string;
  objectives: string[];
  reward: string;
  /** Location art from scripts/art/scenes.mjs, plus a caption for the place. */
  scene: { src: string; place: string; alt: string };
};

export const quests: Quest[] = [
  {
    chapter: 'Chapter 5',
    title: 'MSCI Private Assets',
    scene: { src: '/art/msci.png', place: 'Midtown, New York', alt: 'Pixel art: an office desk at night, a chart on the monitor, Midtown towers and the Empire State Building through the window.' },
    when: '2026 – now',
    where: 'New York, NY',
    role: 'Senior Associate', // TODO confirm title wording with MSCI Comms
    status: 'active',
    summary: 'Building pre-investment diligence and evaluation tools for private-asset investors.',
    objectives: ['Arrive through the Vantager acquisition', 'Make private-markets diligence take hours, not weeks'],
    reward: 'In progress',
  },
  {
    chapter: 'Chapter 4',
    title: 'Vantager',
    scene: { src: '/art/vantager.png', place: 'Brooklyn Bridge, New York', alt: 'Pixel art: the Brooklyn Bridge at dusk with the Manhattan skyline behind it.' },
    when: '2025 – 2026',
    where: 'New York, NY',
    role: 'Product & Growth Analyst',
    status: 'complete',
    summary:
      'Joined an AI-native diligence startup early. Its platform read the documents GPs put in data rooms and turned them into diligence reports for institutional investors.',
    objectives: ['Shape product and growth strategy', 'Boss fight: acquisition by MSCI, March 2026'],
    reward: 'Acquired by MSCI',
  },
  {
    chapter: 'Chapter 3',
    title: 'Three Bridge Wealth Advisors',
    scene: { src: '/art/threebridge.png', place: 'San Francisco (remote)', alt: 'Pixel art: the Golden Gate Bridge at sunset with fog rolling under the deck.' },
    when: '2024 – 2025',
    where: 'San Francisco, CA (remote)',
    role: 'Financial Analyst, Investment Committee',
    status: 'complete',
    summary: 'Private-investment diligence for a multi-family office.',
    objectives: [
      'Intro calls, investment memos and committee overviews',
      'Kept the private-investments database honest',
      'Automated the boring parts with Python and AI',
    ],
    reward: 'Diligence, the manual way',
  },
  {
    chapter: 'Chapter 2',
    title: 'The Raikes School',
    scene: { src: '/art/raikes.png', place: 'Lincoln, Nebraska', alt: 'Pixel art: the Nebraska State Capitol at dusk, the Sower on its gold dome.' },
    when: '2021 – 2025',
    where: 'Lincoln, NE',
    role: 'B.S.B.A. Finance & Accounting · minors in CS and Math',
    status: 'complete',
    summary: 'An honors program of about 35 students a year, built where code meets business.',
    objectives: [
      "Senior capstone PM: machine learning for Conagra Brands' $500M capital-expenditure decisions",
      'Junior capstone developer: a GPT-3.5 support assistant for DMSi, trained on 250,000 tickets',
      'Teaching assistant for Honors Computer Science I and II',
    ],
    reward: 'Graduated with High Distinction',
  },
  {
    chapter: 'Chapter 1',
    title: 'Tutorial levels',
    scene: { src: '/art/tutorial.png', place: 'Kearney and Omaha', alt: 'Pixel art: a workbench with code on a monitor, an open PC tower and a prairie sunset in the window.' },
    when: '2021 – 2023',
    where: 'Kearney and Omaha, NE',
    role: 'Three internships',
    status: 'complete',
    summary: 'Three summers, three stacks.',
    objectives: [
      'Cash-Wa Distributing: Python macros, and built the IT department’s PCs',
      "Buckle: shipped the e-commerce site's favorites page to production",
      'Covisum: built advisor tools and a client intake form with the CEO',
    ],
    reward: 'Production code',
  },
  {
    chapter: 'Prologue',
    title: 'Kearney, Nebraska',
    scene: { src: '/art/prologue.png', place: 'The Platte River', alt: 'Pixel art: a Scout campfire by the Platte at night, a tent, sandhill cranes and an egg cooking in an orange peel.' },
    when: 'Before 2021',
    where: 'Kearney, NE',
    role: 'Boy Scout',
    status: 'complete',
    summary: 'Seven years of scouting, one night alone in the woods, and a lifelong MacGyver habit.',
    objectives: ['Earn the whittling chip', 'Survive Wilderness Survival, solo', 'Make Eagle Scout'],
    reward: 'Eagle Scout',
  },
];

// AI agents Charlie actually runs, cast as a party.
export const party = [
  {
    name: 'The Scout',
    cls: 'Ranger',
    job: 'Obituary monitor',
    cadence: 'Weekly',
    does: 'Checks 10 funeral-home sites every week and drafts a summary email.',
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
    job: 'Claude Code',
    cadence: 'Daily',
    does: 'Builds alongside me, including this site.',
    human: 'I review every change.',
  },
];

export type Tier = 'legendary' | 'epic' | 'rare' | 'common';

export const inventory: { equipped: Item[]; bag: Item[] } = {
  equipped: [
    { code: 'PY', name: 'Python', tier: 'legendary', note: 'First language. Still the main weapon.' },
    { code: 'AI', name: 'Claude', tier: 'legendary', note: 'Daily driver, and the brains of my party.' },
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
    { code: 'HT', name: 'HTML/CSS', tier: 'common', note: 'Like this.' },
  ],
};

export type Item = { code: string; name: string; tier: Tier; note: string };

export const builds = [
  {
    name: 'Obituary monitor',
    status: 'Personal project',
    line: 'Watches public obituary sites and flags names from a watchlist in days, not months.',
    recipe: ['Python', 'one adapter per funeral-home platform', 'email or SFTP delivery'],
    detail:
      'Instead of one scraper per site, there is one adapter per website platform: a JSON API for one, a sitemap crawl for another, a headless browser for a third. Adding a new site usually means zero new code.',
  },
  {
    name: 'Portfolio surveillance engine',
    status: 'Personal project',
    line: 'Grades every portfolio in a book from A to F, and says why.',
    recipe: ['positions export', 'a target model', 'a 27-rule issue library'],
    detail:
      'It maps each portfolio to a target model, measures drift on the equity/bond split and the style box, then flags duplicate share classes, redundant index overlap, concentration, asset location, cash drag and tax-loss harvesting. A monthly manual review becomes a ranked to-do list.',
  },
  {
    name: 'Locus',
    status: 'Personal project',
    line: 'A personal finance and trading app with bank and brokerage integrations. It runs my own money.',
    recipe: ['Next.js', 'Supabase', 'bank and brokerage APIs'],
    detail:
      'Built to production security standards: row-level security, secrets management, auth on every route and authorization checks on the trade-execution path.',
  },
  {
    name: 'Phyt', // TODO one line from Charlie on what Phyt does
    status: 'Personal project',
    line: 'An app I designed and built end to end, logo included.',
    recipe: ['product design', 'code', 'a logo I was proud of'],
    detail: 'More on Phyt soon.',
  },
  {
    name: 'This site',
    status: 'Personal project',
    line: 'A player profile with a talking NPC.',
    recipe: ['Astro', 'hand-drawn pixel art', 'Claude (soon)'],
    detail: 'The pixel art is drawn in code. Soon the dialogue box will answer free-form questions with Claude, grounded only in what this site says.',
  },
];

export type Achievement = { icon: IconName; color: string; name: string; note: string; locked?: boolean };

export const achievements: Achievement[] = [
  { icon: 'trophy', color: 'gold', name: 'Acquired', note: 'Vantager, by MSCI, 2026.' },
  { icon: 'chip', color: 'teal', name: 'Early adopter', note: 'First LLM product, 2023. 250,000 tickets.' },
  { icon: 'fleur', color: 'gold', name: 'Eagle Scout', note: 'Seven years. Worth it.' },
  { icon: 'fire', color: 'red', name: 'Wilderness Survival', note: 'One night alone on the Platte River.' },
  { icon: 'crown', color: 'gold', name: 'Homecoming Royalty', note: 'University of Nebraska–Lincoln.' },
  { icon: 'coins', color: 'violet', name: 'Treasurer', note: '$850K budget, 110 members.' },
  { icon: 'cap', color: 'blue', name: 'High Distinction', note: 'Graduated with it. Regents Scholar, 6× Dean’s Scholar.' },
  { icon: 'book', color: 'red', name: 'Teaching assistant', note: 'Honors Computer Science I and II.' },
  { icon: 'knight', color: 'blue', name: 'Grinder', note: '500+ day chess streak. 275 games in one month.' },
  { icon: 'lock', color: 'gray', name: '???', note: 'Ship the Godot game.', locked: true },
];

export const sideQuests: { icon: IconName; color: string; name: string; note: string }[] = [
  { icon: 'gamepad', color: 'blue', name: 'Game dev', note: 'Building a game in Godot.' },
  { icon: 'knight', color: 'teal', name: 'Chess', note: '500+ day streak. Puzzles optional.' },
  { icon: 'spade', color: 'violet', name: 'Poker', note: 'Pot odds and people.' },
  { icon: 'note', color: 'gold', name: 'Guitar', note: 'Self-taught, in progress.' },
  { icon: 'bolt', color: 'red', name: 'Training', note: 'Logged on Strava.' },
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
  greeting: "Hey, I'm Charlie. I build AI products for private markets and wealth management. What do you want to know?",
  options: [
    {
      q: 'What do you do at MSCI?',
      a: "I'm a Senior Associate at MSCI Private Assets. I work on pre-investment diligence and evaluation tools, the software investors use to size up a private fund before they commit capital. I got here when MSCI acquired Vantager in March 2026.",
    },
    {
      q: 'What was Vantager?',
      a: 'An AI-native diligence startup in New York. It read the documents GPs put in data rooms and turned them into diligence reports. I worked on product and growth strategy, and MSCI acquired us in 2026.',
    },
    {
      q: 'What AI have you actually built?',
      a: 'My first LLM product was a GPT-3.5 support assistant for DMSi, trained on 250,000 tickets, back in 2023. Since then, personal projects: an obituary monitor, a portfolio engine that grades portfolios A to F, Locus, Phyt, and a few agents that run on schedules. Next up, this dialogue box gets Claude.',
    },
    {
      q: 'What do you do for fun?',
      a: 'Chess, every single day: the streak is past 500 days, and I played 275 games in September. Also a game I am building in Godot, poker, guitar, training and writing.',
    },
    {
      q: 'Where are you from?',
      a: 'Kearney, Nebraska. Eagle Scout. I wanted to be MacGyver, and at a survival campout I cooked eggs in an orange peel. Then Lincoln for school, and New York for Vantager.',
    },
    {
      q: 'How do I reach you?',
      a: `LinkedIn is fastest, or email ${email}. In a hurry? Press R for the one-page resume, or grab the PDF.`,
    },
  ],
};

// Places for the world map (longitude, latitude).
export const places = [
  { name: 'Kearney', note: 'Spawn point', lon: -99.08, lat: 40.7 },
  { name: 'Lincoln', note: 'Raikes School', lon: -96.7, lat: 40.81 },
  { name: 'Omaha', note: 'Covisum', lon: -95.94, lat: 41.26 },
  { name: 'San Francisco', note: 'Three Bridge (remote)', lon: -122.42, lat: 37.77 },
  { name: 'New York', note: 'Current save', lon: -74.0, lat: 40.71 },
];

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
      where: 'San Francisco, CA (remote)',
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
      line: 'An app designed and built end to end.', // TODO one line from Charlie
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
  awards: ['Eagle Scout', 'Regents Scholar', '6× College of Business Dean’s Scholar', 'Mortar Board', 'UNL Homecoming Royalty'],
};
