// "The road so far": a side-scrolling walk through Charlie's life, west to east.
// All x values are art pixels on the near layer drawn by scripts/art/journey.mjs,
// which imports this file, so the art and the captions can't drift apart.

export const journeyArt = {
  nearWidth: 4400,
  farWidth: 2460,
  /** 180 rows above ground level, plus a 16-row cutaway below the street (the subway). */
  height: 196,
  ground: 180,
  /** Parallax speed of the far layer relative to the near layer. */
  farSpeed: 0.5,
  /** The far layer is drawn so it lines up with the near layer on a viewport this wide (art px). */
  farAlignView: 360,
  /** Bottom edge of the walker's shoes, in art px. */
  feet: 165,
  walker: { w: 16, h: 24, frames: 13 },
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
  pickup: { x: 0, w: 34, h: 12, speed: 34 },
  sedan: { x: 34, w: 30, h: 10, speed: 40 },
  tractor: { x: 64, w: 24, h: 14, speed: 12 },
  bus: { x: 88, w: 58, h: 16, speed: 26 },
  convertible: { x: 146, w: 30, h: 10, speed: 44 },
  muni: { x: 176, w: 54, h: 16, speed: 24 },
  taxi: { x: 230, w: 30, h: 11, speed: 46 },
};
export const vehicleSheet = { w: 260, h: 16 };

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
    role: 'Student council president',
    line: 'Student council president, state tennis medalist, Boys State delegate.',
  },
  {
    id: 'archway',
    x: 880,
    chapter: 'Chapter 1',
    place: 'Summers in Kearney',
    when: '2021 – 2022',
    role: 'Cash-Wa · Buckle',
    line: 'IT at Cash-Wa, then production e-commerce code at Buckle. Then east under the Archway on I-80.',
  },
  {
    id: 'lincoln',
    x: 1300,
    chapter: 'Chapter 2',
    place: 'Lincoln, Nebraska',
    when: '2021 – 2025',
    role: 'Raikes School · Finance & Accounting',
    line: 'Finance and accounting with a computer science minor. Game days in the sea of red.',
  },
  {
    id: 'omaha',
    x: 1630,
    chapter: 'Chapter 2',
    place: 'Omaha, Nebraska',
    when: 'Summer 2023',
    role: 'Covisum · Developer intern',
    line: 'Built financial-advisory tools and a client intake form with the CEO.',
  },
  {
    id: 'sf',
    x: 2080,
    chapter: 'Chapter 3',
    place: 'San Francisco',
    when: 'Summer 2024',
    role: 'Three Bridge Wealth Advisors · Financial analyst',
    line: 'In person for the summer: lived in the South Bay, worked in the city, coffees with founders and investors in the Financial District.',
  },
  {
    id: 'weekends',
    x: 2640,
    chapter: 'Chapter 3',
    place: 'Weekends out west',
    when: 'May – July 2024',
    role: 'Pier 39 · the Presidio · Black Mountain · Pebble Beach',
    line: 'Dinner at Pier 39, pickleball at the Presidio, a Black Mountain hike with a Bay Area meetup, and 17-Mile Drive to the Lone Cypress.',
  },
  {
    id: 'vantager',
    x: 3250,
    chapter: 'Chapter 4',
    place: 'Union Square, New York',
    when: '2025 – 2026',
    role: 'Vantager · Product & growth',
    line: 'Joined Vantager, an AI diligence startup, working out of Tribeca and an office near Union Square.',
  },
  {
    id: 'walkup',
    x: 3720,
    chapter: 'Chapter 4',
    place: 'New York, New York',
    when: '2025',
    role: 'Home',
    line: 'A four-story walk-up, the subway, and a hot dog when it counts.',
  },
  {
    id: 'wtc',
    x: 4040,
    chapter: 'Chapter 5 · Current save',
    place: '7 World Trade Center',
    when: '2026 – now',
    role: 'MSCI Private Assets · Senior Associate',
    line: 'Vantager was acquired by MSCI. Now building private-markets diligence tools downtown.',
  },
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
