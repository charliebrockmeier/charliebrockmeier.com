// "The road so far": a side-scrolling walk through Charlie's life, west to east.
// All x values are art pixels on the near layer drawn by scripts/art/journey.mjs,
// which imports this file, so the art and the captions can't drift apart.

export const journeyArt = {
  nearWidth: 4400,
  farWidth: 2460,
  /** 194 rows above the road's bottom edge, plus a 16-row cutaway below the street (the subway). */
  height: 210,
  ground: 194,
  /** Parallax speed of the far layer relative to the near layer. */
  farSpeed: 0.5,
  /** The far layer is drawn so it lines up with the near layer on a viewport this wide (art px). */
  farAlignView: 360,
  /** Bottom edge of the walker's shoes, in art px. */
  feet: 165,
  walker: { w: 18, h: 28, frames: 13 },
  /**
   * The two lanes, as the bottom edge of the wheels. Cars heading east use the far
   * lane and stay no taller than `farMax`, so they always pass below the walker's shoes.
   */
  lanes: { far: 184, near: 193, farMax: 19 },
  /** The sea's horizon on both layers, so the coast lines up at any parallax offset. */
  horizon: 114,
};

/**
 * The walker always stands at the camera; it walks from start to end.
 * `pace` is scroll pixels per screen pixel of travel (higher is slower), and
 * `dwell` is the share of the scroll spent arrived at the end, for the finale.
 */
export const camera = { start: 210, end: 4040, pace: 1.35, dwell: 0.1 };

/** Time of day along the walk: 0 morning, 1 day, 2 golden hour, 3 night. Pairs of [x, time]. */
export const timeKeys: [number, number][] = [
  [0, 0],
  [780, 0],
  [1080, 1],
  [1620, 1.3],
  [1900, 2],
  [2880, 2.25],
  [3060, 3],
  [4400, 3],
];

/** Which vehicles drive where (see the vehicle sheet in scripts/art/journey.mjs). */
export const regions: { from: number; vehicles: string[] }[] = [
  { from: 0, vehicles: ['pickup', 'sedan', 'pickup', 'tractor'] },
  { from: 1000, vehicles: ['sedan', 'pickup', 'bus', 'sedan'] },
  { from: 1860, vehicles: ['sedan', 'convertible', 'muni', 'sedan'] },
  { from: 3040, vehicles: ['taxi', 'taxi', 'bus', 'sedan', 'taxi'] },
];

/** Vehicle sprites: x offset in the sheet, size, and driving speed in art px per second. */
export const vehicles: Record<string, { x: number; w: number; h: number; speed: number }> = {
  pickup: { x: 0, w: 58, h: 19, speed: 44 },
  sedan: { x: 58, w: 52, h: 17, speed: 50 },
  tractor: { x: 110, w: 44, h: 26, speed: 16 },
  bus: { x: 154, w: 104, h: 28, speed: 34 },
  convertible: { x: 258, w: 52, h: 18, speed: 54 },
  muni: { x: 310, w: 96, h: 28, speed: 30 },
  taxi: { x: 406, w: 52, h: 19, speed: 56 },
  // Only for life moments (never picked at random): Cash-Wa's delivery truck and a car packed for college.
  cashwa: { x: 458, w: 56, h: 19, speed: 40 },
  packed: { x: 514, w: 52, h: 19, speed: 64 },
};
export const vehicleSheet = { w: 566, h: 28 };

/** The Vantager icon (the cut gem with its sparkle), drawn on the office sign. Swap here if it changes. */
export const vantagerMark = {
  word: 'VANTAGER',
  // From Vantager's 16px icon; '#' is the gem (Core Black), '.' the sign (Insight Sky Blue).
  mark: [
    '...##########...',
    '...####..####...',
    '..####....####..',
    '.###........###.',
    '##............##',
    '.####......####.',
    '..####....####..',
    '...####..####...',
    '....###..###....',
    '.....##..##.....',
    '......#..#......',
    '......####......',
  ],
  ink: '#232323',
  sign: '#ddebef',
  accent: '#1f64b7',
};

export type Stop = {
  id: string;
  /** Where the camera is when this stop is centered. */
  x: number;
  chapter: string;
  place: string;
  when: string;
  role: string;
  line: string;
};

export const stops: Stop[] = [
  {
    id: 'home',
    x: 390,
    chapter: 'Prologue',
    place: 'Kearney, Nebraska',
    when: 'Spawn point',
    role: 'Home',
    line: 'Grew up on the edge of the prairie, where the sandhill cranes stop on the Platte every spring.',
  },
  {
    id: 'khs',
    x: 590,
    chapter: 'Prologue',
    place: 'Kearney High School',
    when: 'Class of 2021',
    role: 'State tennis medalist · Boys State',
    line: 'Varsity tennis with a medal at state, a Boys State delegate and an Eagle Scout.',
  },
  {
    id: 'cashwa',
    x: 760,
    chapter: 'Prologue',
    place: 'Kearney, Nebraska',
    when: 'Summer 2021',
    role: 'Cash-Wa Distributing · IT',
    line: 'The summer before college: Python macros, and building the IT department’s PCs.',
  },
  {
    id: 'buckle',
    x: 900,
    chapter: 'Chapter 1 · College summers',
    place: 'Buckle, Kearney',
    when: 'Summer 2022',
    role: 'Summer internship during college',
    line: 'Home from Lincoln for the summer, shipping the e-commerce site’s favorites page to production. Then east again under the Archway on I-80.',
  },
  {
    id: 'lincoln',
    x: 1270,
    chapter: 'Chapter 1',
    place: 'University of Nebraska–Lincoln',
    when: '2021 – 2025',
    role: 'Raikes School honors program · Finance & Accounting',
    line: 'Four years at Nebraska: finance and accounting with computer science and math minors, game days in the sea of red, and graduation in May 2025 with High Distinction.',
  },
  {
    id: 'omaha',
    x: 1630,
    chapter: 'Chapter 1 · College summers',
    place: 'Covisum, Omaha',
    when: 'Summer 2023',
    role: 'Summer internship during college',
    line: 'Developer intern: built financial-advisory tools and a client intake form with the CEO.',
  },
  {
    id: 'sf',
    x: 2080,
    chapter: 'Chapter 2',
    place: 'San Francisco',
    when: 'Summer 2024',
    role: 'Three Bridge Wealth Advisors · Financial analyst',
    line: 'In person for the summer: lived in the South Bay and worked on investment diligence in the city.',
  },
  {
    id: 'weekends',
    x: 2640,
    chapter: 'Chapter 2',
    place: 'Weekends out west',
    when: 'May – July 2024',
    role: 'Pier 39 · the Presidio · Black Mountain · Pebble Beach',
    line: 'Dinner at Pier 39, pickleball at the Presidio, a Black Mountain hike with a Bay Area meetup, and 17-Mile Drive to the Lone Cypress.',
  },
  {
    id: 'vantager',
    x: 3250,
    chapter: 'Chapter 3',
    place: 'Union Square, New York',
    when: '2025 – 2026',
    role: 'Vantager · Growth & Product Analyst',
    line: 'Joined Vantager, an AI diligence startup, working out of Tribeca and an office near Union Square.',
  },
  {
    id: 'walkup',
    x: 3720,
    chapter: 'Chapter 3',
    place: 'New York, New York',
    when: '2025',
    role: 'Home',
    line: 'A four-story walk-up, the subway, and a hot dog when it counts.',
  },
  {
    id: 'wtc',
    x: 4040,
    chapter: 'Chapter 4 · You are here',
    place: '7 World Trade Center',
    when: 'Now',
    role: 'MSCI · New York',
    line: 'Vantager was acquired by MSCI in March 2026, and this is where I am today. That’s the road so far; more chapters to come.',
  },
];

/**
 * Life moments: small scenes that play as the walker reaches `x`, each with a dated
 * caption (a toast on the walk, a line on its stop's card in the static strip).
 * Listed west to east. `finale` moments are told by the checkpoint banner instead of a toast.
 */
export type Moment = { id: string; x: number; stop: string; when: string; what: string; finale?: boolean };

export const moments: Moment[] = [
  { id: 'home', x: 392, stop: 'home', when: 'Home', what: 'Grew up in Kearney' },
  { id: 'khs', x: 566, stop: 'khs', when: 'May 2021', what: 'Graduated from Kearney High' },
  { id: 'cashwa', x: 752, stop: 'cashwa', when: 'Summer 2021', what: 'IT job at Cash-Wa' },
  { id: 'college', x: 824, stop: 'lincoln', when: 'Aug 2021', what: 'Off to Lincoln' },
  { id: 'buckle', x: 886, stop: 'buckle', when: 'Summer 2022', what: 'Internship at Buckle' },
  { id: 'unl', x: 1406, stop: 'lincoln', when: 'May 2025', what: 'Graduated from UNL, with High Distinction' },
  { id: 'covisum', x: 1776, stop: 'omaha', when: 'Summer 2023', what: 'Internship at Covisum' },
  { id: 'sf', x: 1898, stop: 'sf', when: 'Summer 2024', what: 'A summer in San Francisco' },
  { id: 'nyc', x: 3014, stop: 'walkup', when: 'Summer 2025', what: 'Moved to New York' },
  { id: 'vantager', x: 3288, stop: 'vantager', when: '2025', what: 'Joined Vantager' },
  { id: 'msci', x: 3352, stop: 'vantager', when: 'Mar 2026', what: 'Vantager acquired by MSCI' },
  { id: 'now', x: 4040, stop: 'wtc', when: 'Now', what: 'MSCI, New York', finale: true },
];

/**
 * What the walker carries or wears, over stretches of the walk [from, to): a box on the way
 * to college, a laptop at the internships, the cap after graduating (it flies off over the
 * Missouri), shades for the summer in San Francisco, and a box again on moving day.
 */
export const walkerProps: { prop: 'box' | 'laptop' | 'cap' | 'cap-fly' | 'shades'; from: number; to: number }[] = [
  { prop: 'box', from: 824, to: 872 },
  { prop: 'laptop', from: 886, to: 936 },
  { prop: 'cap', from: 1406, to: 1592 },
  { prop: 'cap-fly', from: 1592, to: 1760 },
  { prop: 'laptop', from: 1776, to: 1822 },
  { prop: 'shades', from: 1898, to: 2200 },
  { prop: 'box', from: 3014, to: 3074 },
];

/** Time of day (0–3) at a given x, interpolated from timeKeys. */
export function timeAt(x: number): number {
  for (let i = 1; i < timeKeys.length; i++) {
    const [x0, t0] = timeKeys[i - 1];
    const [x1, t1] = timeKeys[i];
    if (x <= x1) return t0 + ((t1 - t0) * Math.max(0, x - x0)) / (x1 - x0);
  }
  return timeKeys[timeKeys.length - 1][1];
}

/** Far-layer x for something that should sit behind near-layer x. */
export const farX = (x: number) => x * journeyArt.farSpeed + (journeyArt.farAlignView / 2) * (1 - journeyArt.farSpeed);
