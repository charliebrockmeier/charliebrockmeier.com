// Side quests: every trip in the travel log and the hobbies Charlie keeps leveling.
// Trips are city, park or region level with a month and year, never addresses.
// The world map (travel.ts) pins the same trips through each trip's `pin`.
import type { IconName, PixelArt } from './pixels';
import live from './live.json';
import { codex } from './profile';

export type Cat = 'road' | 'vacation' | 'work' | 'husker' | 'ski';

// Main, shade and highlight per category, from the same badge ramps Icon.astro uses.
export const cats: Record<Cat, { label: string; plural: string; color: [string, string, string]; icon: StampIcon }> = {
  road: { label: 'Road trip', plural: 'Road trips', color: ['#73eff7', '#2fa8b5', '#d8fdff'], icon: 'car' },
  vacation: { label: 'Vacation', plural: 'Vacations', color: ['#a7f070', '#38b764', '#e4ffc8'], icon: 'palm' },
  work: { label: 'Work trip', plural: 'Work trips', color: ['#b99cff', '#6b4f96', '#ece2ff'], icon: 'briefcase' },
  husker: { label: 'Husker game', plural: 'Husker games', color: ['#ff6b7f', '#a8304e', '#ffc2cb'], icon: 'football' },
  ski: { label: 'Ski trip', plural: 'Ski trips', color: ['#5cb8ff', '#3b5dc9', '#d0ecff'], icon: 'ski' },
};
export const catOrder: Cat[] = ['road', 'vacation', 'work', 'husker', 'ski'];

export type Trip = {
  id: string;
  place: string;
  /** Two-letter state. */
  state: string;
  year: number | null;
  /** 1–12, or null when only the season is known. */
  month: number | null;
  /** Shown instead of the month, e.g. "Summer". */
  season?: string;
  cat: Cat;
  by?: 'car' | 'plane';
  /** Map pin id in travel.ts (a career stop or a trip pin). */
  pin: string;
  /** Overrides the category's stamp icon. */
  icon?: StampIcon;
  note: string;
};

export const trips: Trip[] = [
  { id: 'phx-21', place: 'Phoenix', state: 'AZ', year: 2021, month: 10, cat: 'vacation', by: 'plane', pin: 'phoenix', icon: 'cactus', note: 'Flew out of Grand Island for a long desert weekend.' },
  { id: 'phx-21b', place: 'Phoenix', state: 'AZ', year: 2021, month: 12, cat: 'vacation', by: 'plane', pin: 'phoenix', icon: 'palm', note: 'Closed out 2021 in the sun.' },
  { id: 'mesa-22', place: 'Mesa', state: 'AZ', year: 2022, month: 4, cat: 'vacation', by: 'plane', pin: 'phoenix', icon: 'cactus', note: 'Third trip to the Valley of the Sun in six months.' },
  { id: 'monterey-23', place: 'Monterey', state: 'CA', year: 2023, month: 1, cat: 'vacation', pin: 'monterey', icon: 'palm', note: 'Winter on the Monterey coast.' },
  { id: 'kc-23', place: 'Kansas City', state: 'MO', year: 2023, month: 2, cat: 'road', by: 'car', pin: 'kc', note: 'Formal weekend with the chapter.' },
  { id: 'brk-23', place: 'Omaha', state: 'NE', year: 2023, month: 5, cat: 'road', by: 'car', pin: 'omaha', icon: 'briefcase', note: 'The Berkshire Hathaway annual meeting, in person.' },
  { id: 'bh-23', place: 'Black Hills', state: 'SD', year: 2023, month: 8, cat: 'road', by: 'car', pin: 'blackhills', icon: 'mountain', note: 'The northern Black Hills National Forest.' },
  { id: 'copper-23', place: 'Copper Mountain', state: 'CO', year: 2023, month: 12, season: 'Winter', cat: 'ski', pin: 'summit', note: 'Season pass for 2023–24.' },
  { id: 'sedona-24', place: 'Sedona', state: 'AZ', year: 2024, month: 1, cat: 'road', by: 'car', pin: 'sedona', icon: 'cactus', note: 'Winter break by way of Grand Junction: red rocks and a ski day at Snowbowl.' },
  { id: 'blackmtn-24', place: 'Black Mountain', state: 'CA', year: 2024, month: 5, cat: 'road', pin: 'sf', icon: 'mountain', note: 'Up Rhus Ridge in Los Altos Hills, first weeks of the SF summer.' },
  { id: 'pella-24', place: 'Pella', state: 'IA', year: 2024, month: 6, cat: 'road', by: 'car', pin: 'pella', note: "A June weekend in Iowa's Dutch town." },
  { id: 'presidio-24', place: 'San Francisco', state: 'CA', year: 2024, month: 6, cat: 'vacation', pin: 'sf', icon: 'bridge', note: 'Pickleball in the Presidio and a family weekend at Pier 39.' },
  { id: 'pebble-24', place: 'Pebble Beach', state: 'CA', year: 2024, month: null, season: 'Summer', cat: 'road', by: 'car', pin: 'monterey', note: '17-Mile Drive along the Monterey coast.' },
  { id: 'osu-24', place: 'Columbus', state: 'OH', year: 2024, month: 10, cat: 'husker', by: 'car', pin: 'columbus', note: 'Nebraska at No. 4 Ohio State. Lost 21–17 in the Shoe.' },
  { id: 'usc-24', place: 'Los Angeles', state: 'CA', year: 2024, month: 11, cat: 'husker', by: 'plane', pin: 'socal', note: 'Nebraska at USC in the Coliseum.' },
  { id: 'sf-24', place: 'San Francisco', state: 'CA', year: 2024, month: 12, cat: 'work', by: 'plane', pin: 'sf', note: 'Back to the Bay for work, the week of my senior capstone.' },
  { id: 'breck-25', place: 'Breckenridge', state: 'CO', year: 2025, month: 1, cat: 'ski', by: 'car', pin: 'summit', note: 'Planned the Mortar Board ski trip for about 21 members: the doc and the budget.' },
  { id: 'dillon-25', place: 'Dillon', state: 'CO', year: 2025, month: 3, cat: 'ski', pin: 'summit', note: 'Spring skiing in Summit County.' },
  { id: 'maui-25', place: 'Maui', state: 'HI', year: 2025, month: 6, cat: 'vacation', by: 'plane', pin: 'maui', note: 'Family trip to the islands.' },
  { id: 'boston-25', place: 'Boston', state: 'MA', year: 2025, month: 11, cat: 'work', pin: 'boston', note: 'Family Office & Foundations Forum.' },
  { id: 'frisco-25', place: 'Frisco', state: 'CO', year: 2025, month: 12, cat: 'ski', by: 'plane', pin: 'summit', note: 'Newark to Denver, then up I-70 to the slopes.' },
  { id: 'fp-26', place: 'Huntington Beach', state: 'CA', year: 2026, month: 9, cat: 'work', by: 'plane', pin: 'socal', note: 'Future Proof, the wealth-tech festival on the sand.' },
  { id: 'boston-26', place: 'Boston', state: 'MA', year: 2026, month: 9, cat: 'vacation', pin: 'boston', icon: 'baseball', note: 'Family weekend with a Red Sox game.' },
  { id: 'dallas-26', place: 'Dallas', state: 'TX', year: 2026, month: 10, cat: 'work', by: 'plane', pin: 'dallas', note: 'Two days at a conference.' },
  { id: 'montana', place: 'Montana', state: 'MT', year: null, month: null, cat: 'road', by: 'car', pin: 'montana', icon: 'mountain', note: 'All the way up to Big Sky Country.' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const when = (t: Trip) => (t.year == null ? 'Undated' : `${t.season ?? MONTHS[(t.month ?? 1) - 1]} ${t.year}`);
/** Short form for the round postmark: three letters and the year. */
export const postmark = (t: Trip) => (t.year == null ? '????' : `${(t.season ?? MONTHS[(t.month ?? 1) - 1]).slice(0, 3)} ${t.year}`);

/** Trips grouped by year, oldest first; undated trips last. */
export const tripsByYear = (() => {
  const sorted = [...trips].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || (a.month ?? 7) - (b.month ?? 7));
  const groups: { year: string; trips: Trip[] }[] = [];
  for (const t of sorted) {
    const y = t.year == null ? 'Undated' : String(t.year);
    if (groups.at(-1)?.year !== y) groups.push({ year: y, trips: [] });
    groups.at(-1)!.trips.push(t);
  }
  return groups;
})();

// Home and work states count too: Nebraska and New York.
const states = new Set(['NE', 'NY', ...trips.map((t) => t.state)]);
export const tally = {
  trips: trips.length,
  states: states.size,
  byCat: Object.fromEntries(catOrder.map((c) => [c, trips.filter((t) => t.cat === c).length])) as Record<Cat, number>,
  flights: trips.filter((t) => t.by === 'plane').length,
};

// Stamp icons, 12 or 14 wide. '1' main, '2' shade, '3' highlight and 'K' outline take the
// category's colors; the other keys are fixed.
const fixed = { W: '#bdeeff', Y: '#ffcd75', G: '#9aa3c7', B: '#8a5a3c', D: '#38b764', L: '#a7f070', O: '#ff8e5e', w: '#3b5dc9', S: '#fdf6e3', R: '#e43b44' };
export const stampIcons = {
  car: [
    '..............',
    '..............',
    '..............',
    '....KKKKKKK...',
    '...KWWKWWWWK..',
    '..KWWWKWWWWWK.',
    '.K33333333333K',
    'K111111111111K',
    'K11111111111YK',
    'K2KKK2222KKK2K',
    '.KGGGK..KGGGK.',
    '..KKK....KKK..',
  ],
  plane: [
    '.....KK.....',
    '.....K1K....',
    '.....K11K...',
    'KK...K111K..',
    'K1K..K1111K.',
    'K11KK111111K',
    'K3333333333K',
    'K11KK111111K',
    'K1K..K1111K.',
    'KK...K111K..',
    '.....K11K...',
    '.....KKK....',
  ],
  ski: [
    'K..........K',
    'KK........KK',
    '.K3K....K3K.',
    '..K3K..K3K..',
    '...K3KK3K...',
    '....K33K....',
    '....K33K....',
    '...K3KK3K...',
    '..K1K..K1K..',
    '.K1K....K1K.',
    'K12K....K12K',
    'KKK......KKK',
  ],
  football: [
    '............',
    '............',
    '............',
    '...KKKKKK...',
    '.KK133331KK.',
    'K21S1S1S1S1K',
    'K21SSSSSSS1K',
    'K2211111112K',
    '.KK222222KK.',
    '...KKKKKK...',
    '............',
    '............',
  ],
  mountain: [
    '............',
    '.....KK.....',
    '....KSSK....',
    '...KSS3SK...',
    '...K3S31K..K',
    '..K33111K.K3',
    '..K3111112K3',
    '.K31111K12K1',
    '.K3111K1122K',
    'K311111111K2',
    'K22222222222',
    'KKKKKKKKKKKK',
  ],
  palm: [
    '..KKK..KKK..',
    '.KLLDKKDLLK.',
    'KLDDDLLDDDLK',
    'KDK.KLDK.KDK',
    'K...KBK...KK',
    '.....KBK....',
    '.....KBK....',
    '....KBK.....',
    '....KBK.....',
    '...KBBK.....',
    '.KK1111KKK..',
    'K1111111111K',
  ],
  briefcase: [
    '............',
    '....KKKK....',
    '...K2KK2K...',
    '.KKKKKKKKKK.',
    'K3333333333K',
    'K1111111111K',
    'K1111KK1111K',
    'KKKKK33KKKKK',
    'K1111KK1111K',
    'K1111111111K',
    'K2222222222K',
    '.KKKKKKKKKK.',
  ],
  cactus: [
    '.....KK.....',
    '....K31K....',
    '....K31K.KK.',
    '.KK.K31KK31K',
    'K31KK31KK12K',
    'K31KK31111K.',
    'K311131122K.',
    '.K2111112K..',
    '..KK3112K...',
    '....K31K....',
    '...KK31KK...',
    '.KKBBBBBBKK.',
  ],
  baseball: [
    '............',
    '....KKKK....',
    '..KKSSSSKK..',
    '.KSRSSSSRSK.',
    '.KRSSSSSSRK.',
    'KSRSSSSSSRSK',
    'KSRSSSSSSRSK',
    '.KRSSSSSSRK.',
    '.KSRSSSSRGK.',
    '..KKSSSGKK..',
    '....KKKK....',
    '............',
  ],
  bridge: [
    '............',
    '..K......K..',
    '.KOK....KOK.',
    '.KOKK..KKOK.',
    '.KOK.KK.KOK.',
    'KKOKKKKKKOKK',
    'KOOOOOOOOOOK',
    'KKOKKKKKKOKK',
    '.KOK....KOK.',
    'wwwwwwwwwwww',
    'ww33wwwww33w',
    'wwwwwwwwwwww',
  ],
} satisfies Record<string, string[]>;
export type StampIcon = keyof typeof stampIcons;

export const stampArt = (icon: StampIcon, cat: Cat): PixelArt => {
  const [main, shade, light] = cats[cat].color;
  return { rows: stampIcons[icon], palette: { '1': main, '2': shade, '3': light, K: '#0c0a18', ...fixed } };
};

// Hobby quests. Numbers are real; the bars measure them against a stated milestone.
const year = new Date().getFullYear();
const chess = live.chess as { streak?: number; ratings?: Record<string, { current?: number } | number | null> };
const rapidLive = chess.ratings?.rapid;
const rapid = (typeof rapidLive === 'number' ? rapidLive : rapidLive?.current) ?? 1209;
const streak = chess.streak ?? 567;
const guitarYears = year - 2022;
const stravaMonths = Math.max(1, (year - 2025) * 12 + new Date().getMonth() - 8);

export type Hobby = {
  icon: IconName;
  color: string;
  name: string;
  level: string;
  stat?: string;
  unit?: string;
  /** Progress toward a milestone; `value: null` draws an in-progress bar. */
  xp?: { value: number | null; max: number; label: string };
  note: string;
};

export const hobbies: Hobby[] = [
  {
    icon: 'knight', color: 'gold', name: 'Chess', level: `Rapid ${rapid}`, stat: String(streak), unit: 'day streak',
    xp: { value: Math.min(streak, 730), max: 730, label: streak >= 730 ? 'Two-year streak' : `${730 - streak} days to a two-year streak` },
    note: 'A game every single day. Caro-Kann, always.',
  },
  { icon: 'husker', color: 'red', name: 'Huskers', level: 'GBR', stat: '2', unit: 'away games', note: 'Columbus and Los Angeles in 2024, plus Saturdays in the sea of red.' },
  { icon: 'note', color: 'teal', name: 'Piano', level: 'Lv 10', stat: '10+', unit: 'years', xp: { value: 10, max: 10, label: 'Maxed out' }, note: 'More than a decade at the keys.' },
  {
    icon: 'note', color: 'violet', name: 'Guitar', level: 'Since 2022', stat: String(guitarYears), unit: guitarYears === 1 ? 'year' : 'years',
    xp: { value: Math.min(guitarYears, 10), max: 10, label: guitarYears >= 10 ? 'Caught up to piano' : `${10 - guitarYears} years to catch piano` },
    note: 'Self-taught, still leveling.',
  },
  { icon: 'spade', color: 'gray', name: 'Poker', level: 'Active', note: 'Pot odds and people.' },
  { icon: 'gamepad', color: 'blue', name: 'Game dev', level: 'Godot', stat: 'WIP', unit: 'first game', xp: { value: null, max: 1, label: 'In development' }, note: 'Building a game in Godot.' },
  { icon: 'bolt', color: 'coral', name: 'Training', level: 'Strava', stat: String(stravaMonths), unit: stravaMonths === 1 ? 'month logged' : 'months logged', note: 'Training logged on Strava since Sep 2025.' },
  { icon: 'book', color: 'gold', name: 'Writing', level: 'Codex', stat: String(codex.length), unit: codex.length === 1 ? 'piece' : 'pieces', note: 'An essay on AI and a paper on private markets, listed below.' },
];
