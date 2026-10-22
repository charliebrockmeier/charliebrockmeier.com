// Pixel emblems for the places Charlie has worked and studied: 20×14 badges, each
// redrawn from the organization's real mark where it could be confirmed, and a plain
// wordmark where it couldn't (no made-up symbols). Edit the rows directly.
import type { PixelArt } from './pixels';

/** `label` is the full, correct name (the badge's accessible name); `short` is for captions. */
type Emblem = PixelArt & { label: string; short: string };

export const logos = {
  // MSCI: the globe from the current logo (the wordmark sits to its left in the full lockup),
  // a circle of meridians and parallels crossed by a diamond, with nodes at the crossings.
  // Too fine to draw at 1:1, so the lines are a lighter blue and the nodes the brand blue.
  // It's 13 px across, so it sits on the frame's bottom edge.
  msci: {
    label: 'MSCI',
    short: 'MSCI',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KWWWWWWGGGGGWWWWWWWK',
      'KWWWWGDWGGGWDGWWWWWK',
      'KWWWGDGGWGWGGWGWWWWK',
      'KWWWDGDGGGGGGGDWWWWK',
      'KWWGWGGWWGWWGGWGWWWK',
      'KWWGGWGWWDWWGWGGWWWK',
      'KWWGGGGGDDDGDGGDWWWK',
      'KWWGGWGWWDWWGWGGWWWK',
      'KWWGWGGWWGWWGGWGWWWK',
      'KWWWDGDGGDGGGGGWWWWK',
      'KWWWGWGGWGWGGWGWWWWK',
      'KWWWWGGWGGGWDGWWWWWK',
      '.KKKKKKGGDGGKKKKKKK.',
    ],
    palette: { K: '#0c0a18', W: '#ffffff', G: '#5a72c4', D: '#213a8f' },
  },
  // Kearney High School: the school's own mark couldn't be confirmed, so a KHS wordmark
  // in the Bearcats' blue and gold.
  khs: {
    label: 'Kearney High School',
    short: 'Kearney High',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KbbbbbbbbbbbbbbbbbbK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KB11BB1B11B11BB111BK',
      'KB11B11B11B11B11BBBK',
      'KB1111BB11B11B11BBBK',
      'KB111BBB11111BB11BBK',
      'KB1111BB11B11BBB11BK',
      'KB11B11B11B11BBB11BK',
      'KB11BB1B11B11B111BBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KB1111111111111111BK',
      'KddddddddddddddddddK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', B: '#1f3f8f', b: '#2e56b0', d: '#162d66', 1: '#ffc72c' },
  },
  // University of Nebraska–Lincoln: the Nebraska N, scarlet on cream, from UNL's own icon
  // (github.com/unl/wdntemplates, includes/global/favicon/icon.svg).
  unl: {
    label: 'University of Nebraska–Lincoln',
    short: 'UNL',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KCCCRRRRRCCRRRRRCCCK',
      'KCCCRRRRRCCRRRRRCCCK',
      'KCCCRRRRRRCRRRRRCCCK',
      'KCCCRRRRRRCRRRRRCCCK',
      'KCCCCRRRRRRCRRRCCCCK',
      'KCCCCRRRRRRRRRRCCCCK',
      'KCCCCRRRRRRRRRRCCCCK',
      'KCCCCRRRCRRRRRRCCCCK',
      'KCCCRRRRRCRRRRRRCCCK',
      'KCCCRRRRRCRRRRRRCCCK',
      'KCCCRRRRRCCRRRRRCCCK',
      'KCCCRRRRRCCRRRRRCCCK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', C: '#f5f1e7', R: '#d00000' },
  },
  // Three Bridge Wealth Advisors: the firm's mark couldn't be confirmed, so initials.
  threebridge: {
    label: 'Three Bridge Wealth Advisors',
    short: 'Three Bridge',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KbbbbbbbbbbbbbbbbbbK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'K111B11BB1BBB1BB1BBK',
      'KB1BB1B1B1BBB1B1B1BK',
      'KB1BB11BB1B1B1B111BK',
      'KB1BB1B1B1B1B1B1B1BK',
      'KB1BB11BBB1B1BB1B1BK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KddddddddddddddddddK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', B: '#1b2b4a', b: '#2c4370', d: '#132036', 1: '#e8eef8' },
  },
  vantager: {
    label: 'Vantager',
    short: 'Vantager',
    // The real mark: a cut gem with a four-point sparkle cut out of it, on Insight Sky Blue.
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KBBBBBGGGBBGGGBBBBBK',
      'KBBBBGGGGBBGGGGBBBBK',
      'KBBBGGGGBBBBGGGGBBBK',
      'KBBGGGBBBBBBBBGGGBBK',
      'KBGBBBBBBBBBBBBBBGBK',
      'KBBGGGBBBBBBBBGGGBBK',
      'KBBBGGGGBBBBGGGGBBBK',
      'KBBBBGGGGBBGGGGBBBBK',
      'KBBBBBGGGBBGGGBBBBBK',
      'KBBBBBBGGBBGGBBBBBBK',
      'KBBBBBBBGBBGBBBBBBBK',
      'KBBBBBBBBGGBBBBBBBBK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', B: '#ddebef', G: '#232323' },
  },
  // Covisum: the company's mark couldn't be confirmed, so the name, stacked.
  covisum: {
    label: 'Covisum',
    short: 'Covisum',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KBB11BB1BB1B1B111BBK',
      'KB1BBB1B1B1B1BB1BBBK',
      'KB1BBB1B1B1B1BB1BBBK',
      'KB1BBB1B1B1B1BB1BBBK',
      'KBB11BB1BBB1BB111BBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KBBBB11B1B1B1B1BBBBK',
      'KBBB1BBB1B1B111BBBBK',
      'KBBBB1BB1B1B111BBBBK',
      'KBBBBB1B1B1B1B1BBBBK',
      'KBBB11BB111B1B1BBBBK',
      'KddddddddddddddddddK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', B: '#14524f', b: '#1f6f6a', d: '#0d3a38', 1: '#ffffff' },
  },
  // Buckle: the rounded B monogram, shaped like a buckle, with two identical counters,
  // in Buckle maroon.
  buckle: {
    label: 'Buckle',
    short: 'Buckle',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KWWWMMMMMMMMMMMMWWWK',
      'KWWMMMMMMMMMMMMMMWWK',
      'KWMMWWWWWWMMMMMMMMWK',
      'KWMMWWWWWWWMMMMMMMWK',
      'KWMMWWWWWWMMMMMMMMWK',
      'KWMMMMMMMMMMMMMMMMWK',
      'KWMMWWWWWWMMMMMMMMWK',
      'KWMMWWWWWWWMMMMMMMWK',
      'KWMMWWWWWWMMMMMMMMWK',
      'KWWMMMMMMMMMMMMMMWWK',
      'KWWWMMMMMMMMMMMMWWWK',
      'KWWWWWWWWWWWWWWWWWWK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', W: '#ffffff', M: '#821b33' },
  },
  // Cash-Wa Distributing: the company's mark couldn't be confirmed, so the name, stacked.
  cashwa: {
    label: 'Cash-Wa Distributing',
    short: 'Cash-Wa',
    rows: [
      '.KKKKKKKKKKKKKKKKKK.',
      'KBB11BB1BBB11B1B1BBK',
      'KB1BBB1B1B1BBB1B1BBK',
      'KB1BBB111BB1BB111BBK',
      'KB1BBB1B1BBB1B1B1BBK',
      'KBB11B1B1B11BB1B1BBK',
      'KBBBBBBBBBBBBBBBBBBK',
      'KBBBBBB1BBB1BB1BBBBK',
      'KBBBBBB1BBB1B1B1BBBK',
      'KBB111B1B1B1B111BBBK',
      'KBBBBBB1B1B1B1B1BBBK',
      'KBBBBBBB1B1BB1B1BBBK',
      'KddddddddddddddddddK',
      '.KKKKKKKKKKKKKKKKKK.',
    ],
    palette: { K: '#0c0a18', B: '#a8202a', b: '#c93a42', d: '#7d1820', 1: '#ffffff' },
  },
} satisfies Record<string, Emblem>;

export type LogoName = keyof typeof logos;

/** The emblems a free-text source such as "Vantager · MSCI" or "UNL · Buckle" names, in order. */
export const logosIn = (text: string): LogoName[] =>
  text
    .split('·')
    .map((part) => part.trim().toLowerCase())
    .map((part) => (Object.keys(logos) as LogoName[]).find((k) => logos[k].short.toLowerCase() === part || logos[k].label.toLowerCase() === part))
    .filter((k): k is LogoName => k !== undefined);

// Marks for personal projects, redrawn from each project's own logo.
export const marks = {
  // Locus: the cicada. Crossed antennae run down into the wings around a round head.
  locus: {
    label: 'Locus',
    rows: [
      '...TT......TT...',
      '.....TT..TT.....',
      '.......TT.......',
      '.....TTTTTT.....',
      '....TT....TT....',
      '....TT....TT....',
      '...T.T....T.T...',
      '...T.TTTTTT.T...',
      '..T..T....T..T..',
      '..T..T....T..T..',
      '..T..T....T..T..',
      '..T..T....T..T..',
      '..T.T......T.T..',
      '..T.T......T.T..',
      '..TT........TT..',
      '..T..........T..',
    ],
    palette: { T: '#1fb3a0' },
  },
} satisfies Record<string, PixelArt & { label: string }>;
