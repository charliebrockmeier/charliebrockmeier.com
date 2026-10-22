// "The road so far": a side-scrolling walk through Charlie's life, west to east.
// All x values are art pixels on the near layer drawn by scripts/art/journey.mjs,
// which imports this file, so the art and the captions can't drift apart.

export const journeyArt = {
  nearWidth: 2240,
  farWidth: 1440,
  height: 180,
  /** Parallax speed of the far layer relative to the near layer. */
  farSpeed: 0.5,
  /** The far layer is drawn so it lines up with the near layer on a viewport this wide (art px). */
  farAlignView: 360,
  /** Bottom edge of the walker's shoes, in art px. */
  feet: 165,
  walker: { w: 16, h: 24, frames: 5 },
};

/** The walker always stands at the camera; it walks from start to end. */
export const camera = { start: 330, end: 1890 };

/** Time of day along the walk: 0 morning, 1 day, 2 sunset, 3 night. Pairs of [x, time]. */
export const timeKeys: [number, number][] = [
  [0, 0],
  [620, 0],
  [860, 1],
  [1000, 1],
  [1240, 2],
  [1420, 2],
  [1580, 3],
  [2240, 3],
];

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
    x: 400,
    chapter: 'Prologue',
    place: 'Kearney, Nebraska',
    when: 'Spawn point',
    role: 'Home',
    line: 'Grew up on the edge of the prairie, building things out of whatever was lying around.',
  },
  {
    id: 'khs',
    x: 575,
    chapter: 'Prologue',
    place: 'Kearney High School',
    when: 'Class of 2021',
    role: 'Student council president',
    line: 'Student council president, state tennis medalist, Boys State delegate. Then east on I-80.',
  },
  {
    id: 'i80',
    x: 740,
    chapter: 'Chapter 1',
    place: 'Summers on I-80',
    when: '2021 – 2023',
    role: 'Cash-Wa · Buckle · Covisum',
    line: 'Three internships, three stacks: IT in Kearney, e-commerce code in Kearney, fintech in Omaha.',
  },
  {
    id: 'lincoln',
    x: 960,
    chapter: 'Chapter 2',
    place: 'Lincoln, Nebraska',
    when: '2021 – 2025',
    role: 'Raikes School · Finance & Accounting',
    line: 'Finance and accounting with a computer science minor. Saturdays in the sea of red.',
  },
  {
    id: 'remote',
    x: 1240,
    chapter: 'Chapter 3',
    place: 'San Francisco (remote)',
    when: '2024 – 2025',
    role: 'Three Bridge · Financial analyst',
    line: 'Private-investment diligence for a Bay Area multi-family office, from a laptop in Lincoln.',
  },
  {
    id: 'walkup',
    x: 1640,
    chapter: 'Chapter 4',
    place: 'New York, New York',
    when: '2025 – 2026',
    role: 'Vantager · Product & growth',
    line: 'Moved into a four-story walk-up and joined Vantager, an AI diligence startup.',
  },
  {
    id: 'wtc',
    x: 1870,
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
