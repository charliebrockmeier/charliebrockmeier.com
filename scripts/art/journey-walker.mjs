// The walker on "The road so far": Charlie, 18×28 per frame, on a transparent sheet.
//   0–7   the walk, facing right: contact, down, passing, up, then the same on the other leg
//   8–9   idle, breathing (the upper body lifts a pixel on 9)
//   10    facing out
//   11–12 waving
// Chibi proportions: the head is about a third of the height, a navy jacket with
// shoulders and sleeves whose hem overlaps charcoal trousers, legs three pixels wide
// that bend at the knee, and small shoes. Everything is drawn flat, then the whole
// silhouette gets a one-pixel outline, so the parts read as one figure.
//
// Also here: what the walker wears or carries along the way (src/components/Journey.astro
// draws it over the sprite), anchored to the same rows as the head and hands.
import { Layer } from './journey-kit.mjs';
import { journeyArt } from '../../src/data/journey.ts';

const { w: W, h: H } = journeyArt.walker;

export const WALKER_PAL = {
  K: '#0c0a18',
  // Hair: brown, a highlight, a shade at the back.
  H: '#5c3a2e',
  h: '#8a5a3c',
  d: '#3f271f',
  // Skin, its shade, the eye and the mouth.
  S: '#f2c4a2',
  s: '#d39a78',
  E: '#1b1b26',
  M: '#b25e4f',
  // Navy jacket: main, lit edge, shade, and the crease around the near sleeve.
  J: '#2f3f78',
  n: '#4a5fa4',
  j: '#1f2a52',
  c: '#141a38',
  // White shirt at the collar, and the tie.
  W: '#fdf6e3',
  T: '#b8405e',
  // Charcoal trousers: near leg, its shade, and the far leg (further back, darker).
  P: '#5d5b68',
  p: '#4a4855',
  q: '#3d3b46',
  // Shoes: brown leather on a dark sole.
  B: '#6a3c2c',
  b: '#2a1a1a',
};

/** One frame, drawn as palette keys and outlined before it goes on the sheet. */
class Cel {
  constructor() {
    this.g = Array.from({ length: H }, () => Array(W).fill('.'));
  }

  at(x, y) {
    return x >= 0 && x < W && y >= 0 && y < H ? this.g[y][x] : '.';
  }

  px(x, y, k) {
    x = Math.round(x);
    y = Math.round(y);
    if (k && k !== '.' && x >= 0 && x < W && y >= 0 && y < H) this.g[y][x] = k;
  }

  sprite(x, y, rows) {
    rows.forEach((r, j) => [...r].forEach((k, i) => this.px(x + i, y + j, k)));
  }

  /** Every empty pixel that touches the figure (not diagonally) becomes outline. */
  outline() {
    const add = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (this.g[y][x] !== '.') continue;
        const near = [this.at(x - 1, y), this.at(x + 1, y), this.at(x, y - 1), this.at(x, y + 1)];
        if (near.some((k) => k !== '.' && k !== 'K')) add.push([x, y]);
      }
    for (const [x, y] of add) this.g[y][x] = 'K';
  }

  draw(cv, ox) {
    this.g.forEach((row, y) => row.forEach((k, x) => k !== '.' && cv.px(ox + x, y, WALKER_PAL[k])));
  }
}

// ---------------------------------------------------------------------------
// Side view, facing right. The outline is added afterwards, so these are fills only.

/** Rows 1–9: the head, with the outline it gets that's 10 rows, a third of the frame. */
const HEAD = [
  '......HHHHH.......',
  '....HHhhhhHHH.....',
  '...HHHHHHHHHHH....',
  '...dHHHHHHHHHHS...',
  '...dHHHHHHHSSSS...',
  '...dHHHsSSSSSES...',
  '...ddHHsSSSSSSSS..',
  '....dHSSSSSSSMS...',
  '......sSSSSSS.....',
];
/** Rows 10–18: the jacket, shoulders to hem, with the shirt and tie in the open collar. */
const TORSO = [
  '.......jJWWW......',
  '....jJJJJWTWJ.....',
  '...jjJJJJJTJJ.....',
  '...jjJJJJJTJn.....',
  '...jjJJJJJJJn.....',
  '...jjJJJJJJJn.....',
  '...jjJJJJJJJn.....',
  '...jjJJJJJJJJn....',
  '....jjjjjjjjjj....',
];
const NECK = 10;
const HIP = 18; // the trousers start under the jacket's last row
const SOLE = H - 1;
const SHOULDER = [8, 11];

/**
 * A trouser leg three pixels wide, hip to knee to ankle, then a small shoe.
 * `foot` and `knee` are x offsets from the hip (a knee ahead of the line between
 * hip and foot is a bend), `lift` raises the foot, `toe` tips the shoe onto its toe.
 */
function leg(cel, [hx, hy], { foot, knee, lift, toe = 0 }, near) {
  const ax = hx + foot;
  const ay = SOLE - 2 - lift;
  const kx = hx + knee;
  const ky = hy + Math.round((ay - hy) * 0.5);
  const [main, back] = near ? ['P', 'p'] : ['q', 'q'];
  for (let y = hy; y <= ay; y++) {
    const t = y <= ky ? (y - hy) / Math.max(1, ky - hy) : (y - ky) / Math.max(1, ay - ky);
    const c = Math.round(y <= ky ? hx + (kx - hx) * t : kx + (ax - kx) * t);
    cel.px(c - 1, y, back);
    cel.px(c, y, main);
    cel.px(c + 1, y, main);
  }
  // The shoe: four wide, toe forward, on a sole; tipped onto its toe as it pushes off.
  if (toe) {
    for (let i = -1; i <= 1; i++) cel.px(ax + i, ay + 1, 'B');
    cel.px(ax + 1, ay + 2, 'B');
    cel.px(ax + 2, ay + 2, 'b');
  } else {
    for (let i = -1; i <= 2; i++) cel.px(ax + i, ay + 1, i === 2 ? 'b' : 'B');
    for (let i = -1; i <= 2; i++) cel.px(ax + i, ay + 2, 'b');
  }
}

/** A sleeve two pixels wide from the shoulder, a slight bend at the elbow, and a hand. */
function arm(cel, [sx, sy], swing, near) {
  const hx = sx + swing;
  const hy = sy + 7 - (Math.abs(swing) > 2 ? 1 : 0);
  const ex = sx + swing * 0.4;
  const ey = sy + 4;
  const pts = [];
  for (let y = sy; y <= hy; y++) {
    const t = y <= ey ? (y - sy) / (ey - sy) : (y - ey) / (hy - ey);
    pts.push([Math.round(y <= ey ? sx + (ex - sx) * t : ex + (hx - ex) * t), y]);
  }
  const [main, edge] = near ? ['J', 'n'] : ['j', 'j'];
  // The crease around the near sleeve, so it reads against the jacket behind it.
  if (near)
    for (const [x, y] of pts.slice(1))
      for (const dx of [-1, 2]) if ('Jjn'.includes(cel.at(x + dx, y))) cel.px(x + dx, y, 'c');
  for (const [x, y] of pts.slice(0, -1)) {
    cel.px(x, y, main);
    cel.px(x + 1, y, edge);
  }
  const [lx, ly] = pts[pts.length - 1];
  cel.px(lx, ly, near ? 'S' : 's');
  cel.px(lx + 1, ly, near ? 'S' : 's');
  cel.px(lx, ly + 1, 's');
}

// Per frame: each leg's pose, the body's bob (down is +1), and the near arm's swing
// (the far arm swings the other way). The walk is a contact, down, passing, up cycle.
const step = (foot, knee, lift, toe = 0) => ({ foot, knee, lift, toe });
const CONTACT = { front: step(3, 2, 0), back: step(-3, -1, 1, 1) };
const DOWN = { front: step(2, 2, 0), back: step(-3, 0, 2) };
const PASSING = { front: step(0, 0, 0), back: step(-1, 2, 3) };
const UP = { front: step(-2, -1, 0), back: step(2, 3, 1) };
const WALK = [
  { near: CONTACT.front, far: CONTACT.back, bob: 0, swing: -3 },
  { near: DOWN.front, far: DOWN.back, bob: 1, swing: -2 },
  { near: PASSING.front, far: PASSING.back, bob: 0, swing: 0 },
  { near: UP.front, far: UP.back, bob: -1, swing: 2 },
  { near: CONTACT.back, far: CONTACT.front, bob: 0, swing: 3 },
  { near: DOWN.back, far: DOWN.front, bob: 1, swing: 2 },
  { near: PASSING.back, far: PASSING.front, bob: 0, swing: 0 },
  { near: UP.back, far: UP.front, bob: -1, swing: -2 },
];
const IDLE = [
  { near: step(1, 1, 0), far: step(-1, -1, 0), bob: 0, swing: 0 },
  { near: step(1, 1, 0), far: step(-1, -1, 0), bob: -1, swing: 0 },
];
/** How far the head moves on each walk frame, for gear that rides on it. */
export const WALK_BOB = WALK.map((f) => f.bob);

function side(cv, ox, { near, far, bob, swing }) {
  const cel = new Cel();
  const hip = [8, HIP + bob];
  // Back to front: far arm, far leg, the body, near leg, near arm.
  arm(cel, [SHOULDER[0] - 1, SHOULDER[1] + bob], -swing, false);
  leg(cel, [hip[0] - 1, hip[1]], far, false);
  cel.sprite(0, 1 + bob, HEAD);
  cel.sprite(0, NECK + bob, TORSO);
  leg(cel, hip, near, true);
  // The jacket's hem goes back over the top of the trousers.
  cel.sprite(0, NECK + TORSO.length - 1 + bob, TORSO.slice(-1));
  arm(cel, [SHOULDER[0], SHOULDER[1] + bob], swing, true);
  cel.outline();
  cel.draw(cv, ox);
}

// ---------------------------------------------------------------------------
// Facing out: the same proportions, square on, arms at the sides.

const FRONT = [
  '..................',
  '......HHHHHH......',
  '....HHhhhhHHHH....',
  '...HHHHHHHHHHHH...',
  '...HHHHHHHHHHHH...',
  '...HHSSSSSSSSHH...',
  '...sSSESSSSESSs...',
  '...sSSSSSSSSSSs...',
  '....SSSSMMSSSS....',
  '.....sSSSSSSs.....',
  '......JWTTWJ......',
  '...nJJJWTTWJJJn...',
  '..nJcJJJTTJJJcJn..',
  '..nJcJJJTTJJJcJn..',
  '..nJcJJJJJJJJcJn..',
  '..nJcJJJJJJJJcJn..',
  '..nJcJJJJJJJJcJn..',
  '..SScJJJJJJJJcSS..',
  '..ssjjjjjjjjjjss..',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '.....pPP..PPp.....',
  '....BBBB..BBBB....',
  '....bbbb..bbbb....',
];
/** Waving: the arm on the right of the picture goes up, the hand in two positions. */
const WAVE = [
  ['...............SS.', '...............sS.', '...............Jn.', '...............Jn.', '...............Jn.', '...............Jn.', '..............nJn.', '..............JJn.'],
  ['..............SS..', '..............sS..', '...............Jn.', '...............Jn.', '...............Jn.', '...............Jn.', '...............Jn.', '..............JJn.', '..............JJn.'],
];

function front(cv, ox, wave) {
  const cel = new Cel();
  if (wave === undefined) cel.sprite(0, 0, FRONT);
  else {
    // The sleeve that was at the side becomes the jacket's edge, and the arm goes up.
    cel.sprite(0, 0, FRONT.map((r, y) => (y >= 12 && y <= 18 ? r.slice(0, 13) + (y === 18 ? 'jj' : 'Jn') + '...' : r)));
    const rows = WAVE[wave];
    cel.sprite(0, 12 - rows.length + 1, rows);
  }
  cel.outline();
  cel.draw(cv, ox);
}

export function journeyWalker() {
  const { frames } = journeyArt.walker;
  const cv = new Layer(W * frames, H);
  [...WALK, ...IDLE].forEach((pose, i) => side(cv, i * W, pose));
  front(cv, 10 * W);
  front(cv, 11 * W, 0);
  front(cv, 12 * W, 1);
  return cv;
}

// ---------------------------------------------------------------------------
// Gear, in walker pixels (y < 0 is above the frame): rows of palette keys, an offset,
// and a palette. Journey.astro draws these over the sprite and moves them with it.

export const walkerGear = {
  // A mortarboard on the crown of the head, tassel down the near side.
  cap: {
    x: 1,
    y: -1,
    rows: ['...TTTTTTTTTTT....', '..KKKKKKKKKKKKK...', '....KCCCCCCCK.....', '..Y.KCCCCCCCK.....', '..Y.KKKKKKKKK.....', '.YYY..............'],
    pal: { T: '#3d3858', K: '#0c0a18', C: '#1b1533', Y: '#ffcd75' },
  },
  // Shades over the eye, the arm of the frame back to the ear.
  shades: {
    x: 8,
    y: 5,
    rows: ['...KKKKK', 'KKKKKGKK', '....KKK.'],
    pal: { K: '#0c0a18', G: '#73eff7' },
  },
  // A moving box held out in front, hands on either side.
  box: {
    x: 7,
    y: 13,
    rows: ['.KKKKKKKK.', '.KTTTPTTK.', '.KCCCPCCK.', 'SKCCCCCCKS', 'SKCCCCCDKS', '.KCCCCCDK.', '.KKKKKKKK.'],
    pal: { K: '#5c3a2e', T: '#e9d0a8', P: '#f4e0b0', C: '#c9a26b', D: '#a8865e', S: '#f2c4a2' },
  },
  // A laptop open on the forearm.
  laptop: {
    x: 7,
    y: 12,
    rows: ['.KKKKKKKK.', '.KBBBBBBK.', '.KBWWBBBK.', '.KBBWWWBK.', 'SKBBBBBBKS', '.KKKKKKKK.', 'GGGGGGGGGG'],
    pal: { K: '#3d3858', B: '#73eff7', W: '#c6fff5', S: '#f2c4a2', G: '#94a0c2' },
  },
};
