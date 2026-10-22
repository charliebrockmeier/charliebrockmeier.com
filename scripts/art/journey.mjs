// "The road so far" side-scroller art, drawn in code on transparent layers:
//   journey-near   2240×180  the places themselves, walked past at full speed
//   journey-far    1440×180  hills and skylines that drift past at half speed
//   journey-walker   80×24   Charlie, five frames (four walking, one standing)
// The sky is CSS, so everything above the skyline here is transparent. Positions
// and time of day come from src/data/journey.ts. Moving details (windmill,
// flags, stadium lights, fog, windows, beacons) are SVG in Journey.astro.
//
// Run directly to write the PNGs: node scripts/art/journey.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Canvas, C, SKY, ramp, rng, windows } from './lib.mjs';
import { journeyArt, timeAt, farX } from '../../src/data/journey.ts';

const { nearWidth: NW, farWidth: FW, height: H } = journeyArt;
const NONE = 'none';

// Ground bands on the near layer.
const LAWN = 152; // lawn or plaza in front of buildings
const WALK = 160; // sidewalk the walker walks on
const CURB = 166;
const STREET = 167;

// Golden Gate span.
const GG = { x0: 1204, x1: 1446, t1: 1262, t2: 1388, top: 34, deck: 158 };

/** A canvas whose background is transparent. */
class Layer extends Canvas {
  constructor(w, h) {
    super(w, h, NONE);
  }

  png(scale = 1) {
    return encode(this, scale);
  }
}

// A per-x palette by time of day (morning, day, sunset, night), dithered across
// the hand-offs so the ground changes with the sky.
const tod = (colors, x, y) => ramp(colors, timeAt(x) / 3, x, y);

// Tiny 3×5 font for signs.
const FONT = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  E: ['111', '100', '110', '100', '111'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  K: ['101', '110', '100', '110', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  W: ['101', '101', '101', '111', '101'],
  Y: ['101', '101', '010', '010', '010'],
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['110', '001', '010', '100', '111'],
  3: ['110', '001', '010', '001', '110'],
  9: ['111', '101', '111', '001', '111'],
  ',': ['000', '000', '000', '010', '100'],
  '-': ['000', '000', '111', '000', '000'],
  ' ': ['000', '000', '000', '000', '000'],
};

function text(cv, x, y, str, color) {
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    g.forEach((row, j) => [...row].forEach((b, i) => b === '1' && cv.px(x + i, y + j, color)));
    x += 4;
  }
  return x;
}

const textWidth = (str) => str.length * 4 - 1;

// ---------------------------------------------------------------------------
// Near layer

export function journeyNear() {
  const cv = new Layer(NW, H);
  const rand = rng(2003);

  ground(cv, rand);
  prairie(cv, rand);
  home(cv);
  kearneyHigh(cv, rand);
  cornfield(cv, 628, 838);
  archway(cv);
  highwaySign(cv);
  capitol(cv, rand);
  stadium(cv, rand);
  remoteDesk(cv, rand);
  goldenGate(cv, rand);
  crossCountry(cv);
  newYork(cv, rand);
  return cv;
}

function ground(cv, rand) {
  for (let x = 0; x < NW; x++) {
    const onBridge = x >= GG.x0 && x < GG.x1;
    // Lawn or plaza strip.
    for (let y = LAWN; y < WALK; y++) {
      if (onBridge) continue;
      const lawn = y === LAWN ? ['#a7f070', '#a7f070', '#5a8a4a', '#1f3a3a'] : ['#38b764', '#38b764', '#2f6a4a', '#18302f'];
      const plaza = y === LAWN ? ['#c9bfd9', '#c9bfd9', '#8a6a7a', '#33275a'] : ['#a99fc4', '#a99fc4', '#6e4f66', '#2b2150'];
      cv.px(x, y, tod(x > 1480 ? plaza : lawn, x, y));
    }
    if (onBridge) continue;
    // Sidewalk slabs with joints.
    for (let y = WALK; y < CURB; y++) {
      const joint = x % 12 === 0;
      const top = y === WALK;
      const slab = top ? ['#e9e0f0', '#f4f4f4', '#f7a35c', '#4f3d7d'] : ['#bdb3db', '#c9c3e0', '#b8705e', '#3d2f66'];
      cv.px(x, y, joint ? tod(['#94a0c2', '#94a0c2', '#85336b', '#2b2150'], x, y) : tod(slab, x, y));
    }
    cv.px(x, CURB, tod(['#6e6480', '#6e6480', '#5a2a63', '#1b1533'], x, CURB));
    // Street with a dashed center line.
    for (let y = STREET; y < H; y++) {
      let c = tod(['#4a4466', '#4a4466', '#3d2850', '#1f1838'], x, y);
      if (y === 174 && x % 14 < 7) c = C.gold;
      if ((x * 7 + y * 13) % 41 === 0) c = tod(['#5a5478', '#5a5478', '#4a3058', '#2b2150'], x, y);
      cv.px(x, y, c);
    }
  }
  void rand;
}

function prairie(cv, rand) {
  // Tall grass and wheat behind the fence, x 0–330.
  for (let x = 0; x < 340; x++) {
    const h = 8 + Math.round(3 * Math.sin(x / 7) + 2 * Math.sin(x / 2.3));
    for (let y = LAWN - h; y < LAWN; y++) {
      const tip = y === LAWN - h;
      cv.px(x, y, tip ? (x % 3 ? C.gold : C.orange) : (x + y) % 3 ? '#c9a26b' : '#a8865e');
    }
  }
  // Round hay bales.
  for (const bx of [36, 92, 268]) {
    cv.disc(bx, LAWN - 7, 7, '#c9a26b');
    cv.disc(bx, LAWN - 7, 5, '#d8b98a');
    cv.disc(bx, LAWN - 7, 2, '#a8865e');
    cv.rect(bx - 7, LAWN - 1, 15, 1, '#8a6a4a');
  }
  // Split-rail fence.
  for (let x = 0; x < 334; x += 16) {
    cv.rect(x, LAWN - 14, 2, 14, C.bark);
    cv.px(x, LAWN - 15, C.brown);
  }
  cv.rect(0, LAWN - 12, 334, 1, C.brown);
  cv.rect(0, LAWN - 7, 334, 1, C.brown);
  // A meadowlark on a post.
  cv.sprite(160, LAWN - 19, ['.KK', 'KYY', '.YK'], { K: C.bark, Y: C.gold });
  // Windmill tower; the blades turn in the overlay at (200, 92).
  const wx = 200;
  const wy = 92;
  cv.line(wx - 1, wy + 3, wx - 8, LAWN - 1, '#566c86');
  cv.line(wx + 1, wy + 3, wx + 8, LAWN - 1, '#566c86');
  for (let y = wy + 10; y < LAWN; y += 10) {
    const half = 1 + Math.round(((y - wy) / (LAWN - wy)) * 7);
    cv.line(wx - half, y, wx + half, y, '#566c86');
    cv.line(wx - half, y, wx + half, Math.min(y + 9, LAWN - 1), '#94a0c2');
  }
  cv.rect(wx + 2, wy - 1, 9, 2, '#566c86');
  cv.rect(wx + 9, wy - 4, 3, 8, '#94a0c2');
  void rand;
}

function home(cv) {
  // A 2000s ranch: three-car garage, front gable over the porch, stone wainscot.
  const x0 = 350;
  const x1 = 462;
  const eave = 120;
  const siding = '#d2b48a';
  const sidingLine = '#b8966a';
  const trim = '#f4ecdc';
  // Walls.
  cv.rect(x0, eave, x1 - x0, LAWN - eave, siding);
  for (let y = eave + 2; y < LAWN; y += 3) cv.rect(x0, y, x1 - x0, 1, sidingLine);
  cv.rect(x0, eave, x1 - x0, 2, '#8a6a4a'); // shadow under the eaves
  // Garage: three doors, a hoop above the middle one.
  for (let i = 0; i < 3; i++) {
    const dx = x0 + 3 + i * 15;
    cv.rect(dx, 128, 13, LAWN - 128, trim);
    for (let y = 131; y < LAWN; y += 4) cv.rect(dx, y, 13, 1, '#d6ccb8');
    cv.rect(dx + 1, 130, 11, 2, '#94a0c2');
  }
  cv.rect(x0 + 19, 112, 12, 8, trim);
  cv.rect(x0 + 22, 115, 6, 4, C.red);
  cv.rect(x0 + 23, 116, 4, 2, trim);
  cv.rect(x0 + 21, 120, 8, 1, C.orange);
  for (let x = x0 + 22; x < x0 + 29; x += 2) cv.px(x, 121, trim);
  // Main house: windows, stone wainscot, porch with a front gable.
  const mx = x0 + 49;
  cv.rect(mx, 140, x1 - mx, LAWN - 140, '#8a7f96');
  for (let y = 140; y < LAWN; y += 3)
    for (let x = mx + ((y / 3) % 2 ? 0 : 2); x < x1; x += 5) cv.rect(x, y, 4, 2, (x + y) % 3 ? '#9d93aa' : '#7a7088');
  for (const wx of [mx + 4, x1 - 16]) {
    cv.rect(wx - 1, 126, 14, 13, trim);
    cv.fill(wx, 127, 12, 11, (x, y) => (x - wx + (y - 127) < 6 ? '#c6e6f2' : '#94b0c2'));
    cv.rect(wx + 6, 127, 1, 11, trim);
    cv.rect(wx, 132, 12, 1, trim);
  }
  const px = mx + 21;
  cv.poly(
    [
      [px - 4, 124],
      [px + 9, 112],
      [px + 22, 124],
    ],
    '#5a4a6e',
  );
  cv.line(px - 4, 124, px + 9, 112, '#7a6a8e');
  cv.rect(px - 1, 124, 21, 3, trim);
  cv.rect(px, 127, 2, LAWN - 127, trim);
  cv.rect(px + 16, 127, 2, LAWN - 127, trim);
  cv.rect(px + 6, 131, 7, LAWN - 131, '#7a3a3a');
  cv.rect(px + 7, 132, 5, 6, '#8a4a44');
  cv.px(px + 11, 141, C.gold);
  cv.rect(px + 4, 128, 1, 2, C.sun);
  // Hip roof with shingle rows.
  cv.poly(
    [
      [x0 - 4, eave],
      [x0 + 16, 102],
      [x1 - 16, 102],
      [x1 + 4, eave],
    ],
    '#4a3a5a',
  );
  for (let y = 105; y < eave; y += 3) cv.line(x0 - 4 + (eave - y) * 1.1, y, x1 + 4 - (eave - y) * 1.1, y, '#3d2f4a');
  cv.line(x0 + 16, 102, x1 - 16, 102, '#7a6a8e');
  cv.line(x0 - 4, eave, x0 + 16, 102, '#6b5b7a');
  cv.rect(x0 - 4, eave, x1 - x0 + 8, 1, '#2f2552');
  // Driveway to the street.
  cv.fill(x0 + 1, LAWN, 46, CURB - LAWN, (x, y) => ((x + y) % 9 === 0 ? '#c9c3d6' : '#ddd6e6'));
  // Shrubs and a maple.
  for (const [sx, r] of [
    [mx + 2, 4],
    [mx + 15, 3],
    [x1 - 6, 4],
  ]) {
    cv.disc(sx, LAWN - 3, r, '#257156');
    cv.disc(sx - 1, LAWN - 4, r - 2, '#38b764');
  }
  cv.rect(480, 120, 4, LAWN - 120, C.bark);
  cv.disc(482, 112, 15, '#257156');
  cv.disc(478, 108, 11, '#38b764');
  cv.disc(474, 104, 5, '#a7f070');
  // Mailbox (no number).
  cv.rect(343, 144, 1, 10, C.bark);
  cv.rect(340, 140, 7, 4, '#2b2150');
  cv.px(347, 139, C.red);
}

function kearneyHigh(cv, rand) {
  // Two-story brick school with a flagpole and a marquee for the Bearcats.
  const x0 = 512;
  const x1 = 640;
  const top = 110;
  cv.rect(x0, top, x1 - x0, LAWN - top, '#9a4a3e');
  for (let y = top + 2; y < LAWN; y += 3) {
    cv.rect(x0, y, x1 - x0, 1, '#7a3a32');
    for (let x = x0 + ((y / 3) % 2 ? 2 : 5); x < x1; x += 6) cv.px(x, y + 1, '#7a3a32');
  }
  cv.rect(x0 - 2, top - 3, x1 - x0 + 4, 3, '#5c2e2e');
  cv.rect(x0 - 2, top - 3, x1 - x0 + 4, 1, '#8a4a44');
  for (const wy of [116, 132]) {
    for (let x = x0 + 5; x < x1 - 10; x += 12) {
      if (x > 562 && x < 586) continue;
      cv.rect(x, wy, 9, 10, '#f4ecdc');
      cv.rect(x + 1, wy + 1, 7, 8, rand() > 0.5 ? '#94b0c2' : '#c6e6f2');
      cv.rect(x + 4, wy + 1, 1, 8, '#f4ecdc');
    }
  }
  // Entrance, canopy and letters.
  cv.rect(564, 120, 24, LAWN - 120, '#7a3a32');
  cv.rect(566, 136, 20, LAWN - 136, '#c6e6f2');
  cv.rect(575, 136, 2, LAWN - 136, '#566c86');
  cv.rect(562, 133, 28, 3, '#3d2f4a');
  text(cv, 570, 124, 'KHS', C.cream);
  // Flagpole; the flag waves in the overlay at (612, 72).
  cv.rect(612, 72, 1, LAWN - 72, C.steel);
  cv.px(612, 71, C.gold);
  // Marquee sign.
  cv.rect(520, 134, 34, 14, '#2b2150');
  cv.rect(521, 135, 32, 12, '#141026');
  text(cv, 524, 138, 'GO CATS', C.gold);
  cv.rect(526, 148, 2, 4, '#566c86');
  cv.rect(546, 148, 2, 4, '#566c86');
  // A tennis racket and ball by the flagpole (state medal, varsity tennis).
  cv.sprite(616, 138, ['.KKK.', 'KWKWK', 'KKWKK', 'KWKWK', '.KKK.', '..B..', '..B..', '..B..', '..B..'], { K: C.cream, W: '#566c86', B: C.bark });
  cv.disc(624, 149, 1, C.lime);
  // Bushes along the front.
  for (let x = x0 + 2; x < x1; x += 9) {
    if (x > 560 && x < 590) continue;
    cv.disc(x, LAWN - 2, 3, '#257156');
    cv.px(x - 1, LAWN - 4, '#38b764');
  }
}

function cornfield(cv, xa, xb) {
  for (let x = xa; x < xb; x++) {
    if (x > 676 && x < 766) continue;
    const h = 12 + Math.round(2 * Math.sin(x / 3));
    for (let y = LAWN - h; y < LAWN; y++) {
      const k = (x + Math.floor(y / 4)) % 4;
      let c = k === 0 ? '#38b764' : k === 2 ? '#257156' : null;
      if (y < LAWN - h + 2) c = x % 4 === 0 ? C.gold : c;
      if (c) cv.px(x, y, tod(c === C.gold ? [C.gold, C.gold, C.orange, '#566c86'] : [c, c, '#3a5a3a', '#1c3a3a'], x, y));
    }
  }
}

function archway(cv) {
  // The Great Platte River Road Archway, straddling I-80. The walker passes under.
  const x0 = 682;
  const x1 = 758;
  const top = 106;
  const bottom = 128;
  const base = H;
  for (const tx of [x0, x1 - 9]) {
    cv.rect(tx, top - 8, 9, base - top + 8, '#4a3352');
    cv.rect(tx, top - 8, 1, base - top + 8, '#7a5a6a');
    for (let y = top - 4; y < base; y += 5) cv.rect(tx + 1, y, 7, 1, '#3a2648');
    cv.poly(
      [
        [tx - 1, top - 8],
        [tx + 4.5, top - 15],
        [tx + 10, top - 8],
      ],
      '#3d2530',
    );
    cv.rect(tx + 3, top - 4, 3, 3, C.gold);
  }
  cv.rect(x0 + 9, top, x1 - x0 - 18, bottom - top, C.bark);
  for (let x = x0 + 10; x < x1 - 9; x += 3) cv.rect(x, top + 1, 1, bottom - top - 2, '#6e4632');
  cv.rect(x0 + 9, top, x1 - x0 - 18, 1, C.tan);
  cv.rect(x0 + 9, bottom - 2, x1 - x0 - 18, 2, '#3a2430');
  for (let x = x0 + 13; x < x1 - 12; x += 6) cv.rect(x, top + 8, 3, 2, C.gold);
  cv.poly(
    [
      [x0 + 8, top],
      [x0 + 20, top - 8],
      [x1 - 20, top - 8],
      [x1 - 8, top],
    ],
    '#3d2530',
  );
  cv.line(x0 + 20, top - 8, x1 - 20, top - 8, C.tan);
}

function highwaySign(cv) {
  // Green guide sign: Lincoln 130, plus an I-80 shield.
  const x = 776;
  cv.rect(x + 6, 124, 2, LAWN - 124, C.steel);
  cv.rect(x + 30, 124, 2, LAWN - 124, C.steel);
  cv.rect(x, 108, 38, 18, '#257156');
  cv.rect(x + 1, 109, 36, 16, '#2f8a5a');
  cv.rect(x + 1, 109, 36, 1, C.cream);
  text(cv, x + 4, 112, 'LINCOLN', C.cream);
  text(cv, x + 13, 119, '130', C.cream);
  const shield = ['.BBBBB.', 'BRRRRRB', 'BBBBBBB', 'BWBWBWB', 'BBBBBBB', '.BBBBB.', '..BBB..'];
  cv.sprite(x + 40, 112, shield, { B: C.navy, R: C.red, W: C.cream });
  cv.rect(x + 43, 119, 1, LAWN - 119, C.steel);
}

function capitol(cv, rand) {
  // The Nebraska State Capitol: a long base, the tower, the gold dome and the Sower.
  const cx = 872;
  const lime = '#e2c89a';
  const limeS = '#bfa070';
  const limeD = '#8a6a5a';
  cv.rect(cx - 44, 126, 89, LAWN - 126, lime);
  cv.rect(cx - 44, 126, 89, 2, limeS);
  for (let x = cx - 40; x < cx + 42; x += 6) cv.rect(x, 131, 3, 14, rand() > 0.7 ? C.gold : '#7a6a8a');
  cv.rect(cx + 43, 126, 2, LAWN - 126, limeD);
  cv.rect(cx - 18, 112, 37, 14, lime);
  cv.rect(cx + 17, 112, 2, 14, limeS);
  cv.rect(cx - 12, 52, 25, 60, lime);
  cv.rect(cx - 12, 52, 2, 60, '#f0dcb4');
  cv.rect(cx + 11, 52, 2, 60, limeS);
  for (let x = cx - 7; x <= cx + 7; x += 4) cv.rect(x, 56, 2, 52, '#6e5a7a');
  for (let x = cx - 7; x <= cx + 7; x += 4) cv.px(x, 80, C.gold);
  cv.rect(cx - 10, 48, 21, 4, limeS);
  for (let y = 0; y < 8; y++) {
    const half = Math.round(Math.sqrt(64 - y * y) * 1.15);
    cv.rect(cx - half, 47 - y, half * 2 + 1, 1, y === 3 ? C.teal : y > 5 ? C.sun : C.gold);
  }
  cv.rect(cx, 30, 1, 10, '#3d2f4a');
  cv.rect(cx - 1, 32, 3, 4, '#3d2f4a');
  cv.px(cx + 2, 33, '#3d2f4a');
  cv.px(cx - 2, 34, '#3d2f4a');
  // Lawn trees.
  for (const [tx, r] of [
    [cx - 52, 6],
    [cx + 52, 7],
  ]) {
    cv.rect(tx, LAWN - r, 2, r, C.bark);
    cv.disc(tx, LAWN - r - 3, r, '#257156');
    cv.disc(tx - 2, LAWN - r - 5, r - 3, '#38b764');
  }
}

function stadium(cv, rand) {
  // Memorial Stadium on a game night: brick arches, a red upper deck, light towers.
  const x0 = 934;
  const x1 = 1096;
  const brick = '#9a4a3e';
  // Upper deck: stands rising behind the facade, packed in red.
  cv.poly(
    [
      [x0 + 6, 104],
      [x0 + 20, 86],
      [x1 - 20, 86],
      [x1 - 6, 104],
    ],
    '#b8303a',
  );
  for (let y = 88; y < 104; y += 2)
    for (let x = x0 + 8; x < x1 - 8; x++) {
      const inside = x > x0 + 6 + (104 - y) * 0.78 && x < x1 - 6 - (104 - y) * 0.78;
      if (!inside) continue;
      const r = rand();
      cv.px(x, y, r > 0.86 ? C.cream : r > 0.6 ? '#e43b44' : '#a82a34');
    }
  // Press box.
  cv.rect(990, 76, 52, 10, '#d6ccb8');
  cv.rect(992, 78, 48, 5, '#29366f');
  for (let x = 994; x < 1040; x += 4) cv.rect(x, 79, 2, 3, '#73eff7');
  // Brick facade with arches.
  cv.rect(x0, 104, x1 - x0, LAWN - 104, brick);
  for (let y = 106; y < LAWN; y += 3) cv.rect(x0, y, x1 - x0, 1, '#843e34');
  cv.rect(x0, 104, x1 - x0, 2, '#c45a4a');
  for (let x = x0 + 6; x < x1 - 8; x += 14) {
    cv.rect(x, 116, 8, LAWN - 116, '#3d2030');
    cv.rect(x + 1, 114, 6, 2, '#3d2030');
    cv.rect(x + 2, 113, 4, 1, '#3d2030');
    cv.fill(x, 118, 8, LAWN - 118, (px, py) => ((px + py) % 5 === 0 ? '#e43b44' : null));
  }
  // A banner: GBR.
  cv.rect(1000, 107, 32, 8, '#e43b44');
  cv.rect(1000, 115, 32, 1, '#a82a34');
  text(cv, 1010, 109, 'GBR', C.cream);
  // Light towers (the lamps glow in the overlay).
  for (const lx of [x0 + 2, x1 - 4]) {
    cv.rect(lx, 58, 2, 46, '#566c86');
    cv.rect(lx - 5, 52, 12, 7, '#3d2f4a');
  }
  // A big red N on a flag out front (an original block N).
  cv.rect(1106, 96, 1, LAWN - 96, C.steel);
  cv.rect(1107, 97, 16, 12, '#e43b44');
  cv.sprite(1111, 99, ['KK..K', 'KKK.K', 'K.KKK', 'K..KK', 'K...K', 'K...K', 'K...K', 'K...K'], { K: C.cream });
}

function remoteDesk(cv, rand) {
  // An apartment window in Lincoln: a laptop on a video call with San Francisco.
  const x0 = 1124;
  const x1 = 1196;
  cv.rect(x0, 98, x1 - x0, LAWN - 98, '#6e3a3a');
  for (let y = 100; y < LAWN; y += 3) {
    cv.rect(x0, y, x1 - x0, 1, '#5a2e30');
    for (let x = x0 + ((y / 3) % 2 ? 1 : 4); x < x1; x += 6) cv.px(x, y + 1, '#5a2e30');
  }
  cv.rect(x0 - 1, 96, x1 - x0 + 2, 3, '#3d2030');
  // Window with a warm room inside.
  const wx = 1134;
  const wy = 108;
  cv.rect(wx - 2, wy - 2, 56, 40, '#d6ccb8');
  cv.rect(wx, wy, 52, 36, '#f7a35c');
  cv.fill(wx, wy, 52, 36, (x, y) => ((x * 3 + y * 7) % 11 === 0 ? '#ffcd75' : null));
  // Desk, laptop, call grid, lamp, mug.
  cv.rect(wx, wy + 26, 52, 3, '#5c3a2e');
  cv.rect(wx + 4, wy + 29, 2, 7, '#5c3a2e');
  cv.rect(wx + 46, wy + 29, 2, 7, '#5c3a2e');
  cv.rect(wx + 14, wy + 8, 24, 17, '#1b1533');
  cv.rect(wx + 15, wy + 9, 22, 15, '#141026');
  const faces = ['#f2c4a2', '#d39a78', '#e0b090', '#a8705a'];
  for (let i = 0; i < 4; i++) {
    const fx = wx + 16 + (i % 2) * 11;
    const fy = wy + 10 + Math.floor(i / 2) * 7;
    cv.rect(fx, fy, 10, 6, i === 0 ? '#29366f' : '#2b2150');
    cv.rect(fx + 4, fy + 1, 3, 3, faces[i]);
    cv.rect(fx + 3, fy + 4, 5, 2, ['#e43b44', '#41a6f6', '#38b764', '#ffcd75'][i]);
  }
  cv.rect(wx + 12, wy + 25, 28, 1, '#94a0c2');
  cv.line(wx + 44, wy + 25, wx + 47, wy + 16, C.steel);
  cv.rect(wx + 44, wy + 14, 6, 3, C.steel);
  cv.rect(wx + 6, wy + 21, 4, 5, C.cream);
  // Mullions and sill.
  cv.rect(wx + 25, wy, 2, 36, '#d6ccb8');
  cv.rect(wx - 3, wy + 36, 58, 2, '#bdb3a0');
  void rand;
}

function goldenGate(cv, rand) {
  const { x0, x1, t1, t2, top, deck } = GG;
  const gg = '#d9452f';
  const ggD = '#9a2f2a';
  // Water under the bridge, sunset reflections.
  for (let y = deck + 6; y < H; y++)
    for (let x = x0; x < x1; x++) {
      const t = 0.62 - (y - deck) * 0.02 + (Math.sin(x * 0.35 + y * 1.7) > 0.7 ? 0.12 : 0);
      cv.px(x, y, ramp(SKY, y % 2 ? t : t - 0.12, x, y));
    }
  // Main cables and suspenders.
  const cableY = (x) => {
    if (x < t1) return top + 2 + ((t1 - x) / (t1 - x0)) * (deck - 10 - top);
    if (x > t2) return top + 2 + ((x - t2) / (x1 - t2)) * (deck - 10 - top);
    const u = (x - t1) / (t2 - t1);
    return top + 2 + (1 - Math.pow(2 * u - 1, 2)) * (deck - 14 - top);
  };
  for (let x = x0; x < x1; x++) {
    const y = Math.round(cableY(x));
    cv.px(x, y, gg);
    cv.px(x, y + 1, ggD);
    if (x % 3 === 0) cv.rect(x, y + 2, 1, Math.max(0, deck - 6 - y - 2), '#b8403a');
  }
  // Deck, railing, lamps.
  cv.rect(x0, deck - 6, x1 - x0, 1, gg);
  for (let x = x0; x < x1; x += 3) cv.rect(x, deck - 6, 1, 6, gg);
  cv.rect(x0, deck, x1 - x0, 8, gg);
  cv.rect(x0, deck, x1 - x0, 1, '#ff8e5e');
  cv.rect(x0, deck + 5, x1 - x0, 3, ggD);
  for (let x = x0 + 10; x < x1; x += 30) {
    cv.rect(x, deck - 14, 1, 8, ggD);
    cv.rect(x - 1, deck - 15, 3, 1, C.sun);
  }
  // Towers: two legs, stepped Art Deco tops, portal struts.
  for (const tx of [t1, t2]) {
    for (const lx of [tx - 6, tx + 3]) {
      cv.rect(lx, top, 4, H - top, gg);
      cv.rect(lx + 3, top, 1, H - top, ggD);
      cv.rect(lx + 1, top - 4, 2, 4, gg);
    }
    for (const sy of [top + 4, top + 22, top + 42, top + 64, deck + 8]) {
      cv.rect(tx - 2, sy, 5, 3, gg);
      cv.rect(tx - 2, sy + 3, 5, 1, ggD);
    }
  }
  // Shore on both ends.
  cv.rect(x0 - 2, deck, 4, H - deck, '#5a2a63');
  cv.rect(x1 - 2, deck, 4, H - deck, '#5a2a63');
  void rand;
}

function crossCountry(cv) {
  // A mileage sign between the coasts, then a subway entrance.
  const x = 1470;
  cv.rect(x + 14, 124, 2, LAWN - 124, C.steel);
  cv.rect(x, 110, 46, 15, '#257156');
  cv.rect(x + 1, 111, 44, 13, '#2f8a5a');
  cv.rect(x + 1, 111, 44, 1, C.cream);
  text(cv, x + 7, 113, 'NEW YORK', C.cream);
  text(cv, x + 7, 119, '2,900 MI', C.cream);
  // Subway entrance.
  const sx = 1532;
  cv.rect(sx, 142, 22, 10, '#1b1533');
  cv.rect(sx, 140, 22, 2, '#3a7a3a');
  for (const gx of [sx, sx + 21]) {
    cv.rect(gx, 128, 1, 12, '#3a7a3a');
    cv.disc(gx, 126, 2, C.lime);
  }
  for (let y = 144; y < 152; y += 2) cv.rect(sx + 3, y, 16, 1, '#2b2150');
}

function newYork(cv, rand) {
  const lit = [C.gold, C.orange, C.sun];
  // A row of attached buildings along the street, each with lit windows.
  const row = (x, w, top, wall, line, opts = {}) => {
    cv.rect(x, top, w, LAWN - top, wall);
    if (line) for (let y = top + 3; y < LAWN; y += 3) cv.rect(x, y, w, 1, line);
    cv.rect(x - 1, top - 2, w + 2, 2, opts.cornice ?? '#2b2150');
    for (let y = top + 5; y < LAWN - 12; y += 9)
      for (let wx = x + 3; wx < x + w - 5; wx += 7) {
        const on = rand() > 0.35;
        cv.rect(wx, y, 4, 6, on ? lit[Math.floor(rand() * 3)] : '#1b1533');
        cv.rect(wx, y + 6, 4, 1, opts.sill ?? '#bdb3a0');
      }
  };
  row(1560, 40, 108, '#5c3a2e', '#4a2e26');
  // The walk-up: four stories of brick, a fire escape and a stoop.
  const x0 = 1600;
  const x1 = 1680;
  const top = 100;
  cv.rect(x0, top, x1 - x0, LAWN - top, '#8a3e3a');
  for (let y = top + 2; y < LAWN; y += 3) {
    cv.rect(x0, y, x1 - x0, 1, '#6e2f2e');
    for (let x = x0 + ((y / 3) % 2 ? 2 : 5); x < x1; x += 6) cv.px(x, y + 1, '#6e2f2e');
  }
  cv.rect(x0 - 2, top - 5, x1 - x0 + 4, 5, '#3d2030');
  for (let x = x0 - 1; x < x1 + 1; x += 3) cv.px(x, top - 1, '#8a4a44');
  const floors = [104, 116, 128, 140];
  for (const fy of floors)
    for (let wx = x0 + 6; wx < x1 - 6; wx += 14) {
      if (fy === 140 && wx > 1628 && wx < 1652) continue;
      const on = rand() > 0.3;
      cv.rect(wx - 1, fy - 1, 9, 10, '#d6ccb8');
      cv.rect(wx, fy, 7, 8, on ? lit[Math.floor(rand() * 3)] : '#1b1533');
      cv.rect(wx + 3, fy, 1, 8, '#d6ccb8');
    }
  // Fire escape: platforms with railings and zigzag stairs.
  for (const fy of [113, 125, 137]) {
    cv.rect(x0 + 32, fy, 30, 1, '#0c0a18');
    for (let x = x0 + 32; x < x0 + 62; x += 2) cv.px(x, fy - 3, '#0c0a18');
    cv.rect(x0 + 32, fy - 4, 30, 1, '#0c0a18');
    cv.line(x0 + 36, fy, x0 + 56, fy - 12, '#0c0a18');
  }
  // Stoop and door.
  cv.rect(1632, 136, 16, 16, '#5a2e30');
  cv.rect(1635, 138, 10, 14, '#257156');
  cv.rect(1639, 138, 2, 14, '#1c4a43');
  cv.rect(1636, 135, 8, 2, C.sun);
  for (let i = 0; i < 4; i++) cv.rect(1628 - i * 2, 152 + i * 2, 24 + i * 4, 2, i % 2 ? '#8a7f96' : '#9d93aa');
  cv.line(1628, 152, 1622, 159, '#0c0a18');
  cv.line(1652, 152, 1658, 159, '#0c0a18');
  row(1680, 54, 92, '#566c86', '#4a5a72', { cornice: '#3d4a62' });
  // Bodega with an awning (the neon blinks in the overlay at 1745, 128).
  row(1734, 60, 104, '#4a3a5a', null);
  cv.rect(1734, 134, 60, 18, '#241c42');
  cv.rect(1738, 138, 24, 14, '#f7a35c');
  cv.rect(1766, 138, 9, 14, '#3d2f66');
  for (let x = 1734; x < 1794; x += 6) cv.rect(x, 130, 3, 4, '#e43b44');
  for (let x = 1737; x < 1794; x += 6) cv.rect(x, 130, 3, 4, C.cream);
  // A street tree and a hydrant.
  cv.rect(1700, 132, 3, 20, C.bark);
  cv.disc(1701, 126, 8, '#1c4a43');
  cv.disc(1699, 124, 5, '#257156');
  cv.rect(1590, 154, 4, 6, C.red);
  cv.rect(1589, 153, 6, 2, '#a82a34');

  // One World Trade Center behind: a tapering prism and its spire.
  const ox = 1950;
  for (let y = 18; y < LAWN; y++) {
    const half = y > 128 ? 20 : Math.round(12 + ((y - 18) / (128 - 18)) * 8);
    const mid = Math.round(((y - 18) / (LAWN - 18)) * half);
    cv.rect(ox - half, y, half * 2 + 1, 1, '#2b2150');
    cv.rect(ox - half, y, Math.max(1, half - mid), 1, '#3a3070');
    if (y % 3 === 0)
      for (let x = ox - half + 2; x < ox + half - 1; x += 3) if (rand() > 0.62) cv.px(x, y, rand() > 0.6 ? C.cyan : C.steel);
  }
  cv.rect(ox, 0, 1, 18, C.steel);
  cv.rect(ox - 1, 12, 3, 2, C.steel);

  // 7 World Trade Center: blue glass, a little chamfer on top, a glowing lobby.
  const sx = 1828;
  const sw = 80;
  const stop = 40;
  cv.fill(sx, stop, sw, LAWN - stop, (x, y) => {
    const col = (x - sx) % 5;
    if (col === 0) return '#1b2a5a';
    const sheen = ((x - sx) * 0.9 + (y - stop) * 0.55) % 46;
    if (sheen < 3) return '#73eff7';
    if (sheen < 9) return '#41a6f6';
    return (y + x) % 7 === 0 ? '#3b5dc9' : '#29366f';
  });
  cv.poly(
    [
      [sx, stop],
      [sx + 8, stop - 6],
      [sx + sw, stop - 6],
      [sx + sw, stop],
    ],
    '#3b5dc9',
  );
  cv.line(sx, stop, sx + 8, stop - 6, '#73eff7');
  cv.line(sx + 8, stop - 6, sx + sw - 1, stop - 6, '#c6fff5');
  for (let y = stop + 4; y < 136; y += 3)
    for (let x = sx + 2; x < sx + sw - 1; x += 5) if (rand() > 0.55) cv.rect(x, y, 3, 1, rand() > 0.5 ? '#c6fff5' : C.cyan);
  cv.rect(sx, 138, sw, LAWN - 138, '#c6fff5');
  for (let x = sx; x < sx + sw; x += 8) cv.rect(x, 138, 1, LAWN - 138, '#73eff7');
  cv.rect(sx - 2, 136, sw + 4, 2, '#94a0c2');
  // Plaza trees by the fountain.
  for (const tx of [1814, 1922]) {
    cv.rect(tx, 140, 2, 12, C.bark);
    cv.disc(tx, 136, 6, '#1c4a43');
    cv.disc(tx - 1, 134, 3, '#257156');
  }

  // Lower Manhattan beyond.
  row(1990, 44, 96, '#33275a', null, { sill: '#4f3d7d' });
  row(2034, 36, 114, '#3d2f66', null, { sill: '#4f3d7d' });
  row(2070, 52, 84, '#2b2150', null, { sill: '#4f3d7d' });
  row(2122, 40, 106, '#4a3a5a', null, { sill: '#4f3d7d' });
  row(2162, 78, 92, '#33275a', null, { sill: '#4f3d7d' });
  windows(cv, 2162, 92, 78, 50, rand, { lit: 0.3 });

  // Street lamps along the block.
  for (let x = 1586; x < NW; x += 46) {
    cv.rect(x, 126, 1, WALK - 126, '#566c86');
    cv.rect(x - 2, 124, 5, 2, '#3d4a62');
    cv.rect(x - 1, 126, 3, 1, C.sun);
  }
}

// ---------------------------------------------------------------------------
// Far layer: moves at half speed. Things sit behind their near-layer places.

export function journeyFar() {
  const cv = new Layer(FW, H);
  const rand = rng(1971);
  const base = 156;
  const at = (x) => farX(x);
  // Rolling hills across the plains, colored by time of day.
  for (let x = 0; x < FW; x++) {
    const nearX = (x - at(0)) / journeyArt.farSpeed;
    const h1 = 30 + 6 * Math.sin(x / 41) + 4 * Math.sin(x / 13);
    const h2 = 18 + 4 * Math.sin(x / 23 + 2) + 2 * Math.sin(x / 7);
    for (let y = Math.round(base - h1); y < base; y++)
      cv.px(x, y, tod(['#94a8c8', '#8fb0d0', '#8a4a7a', '#241c42'], nearX, y));
    for (let y = Math.round(base - h2); y < base; y++)
      cv.px(x, y, tod(['#6b8a8a', '#5a8a7a', '#6e3060', '#1b1533'], nearX, y));
  }
  // Kearney: a grain elevator and the water tower.
  const ge = Math.round(at(250));
  for (const dx of [0, 6, 12, 18]) {
    cv.rect(ge + dx, 112, 6, base - 112, '#8494b4');
    cv.rect(ge + dx + 1, 111, 4, 1, '#8494b4');
    cv.rect(ge + dx + 5, 112, 1, base - 112, '#9aaac6');
  }
  cv.rect(ge + 6, 96, 10, 16, '#7a8aa8');
  cv.rect(ge + 7, 94, 8, 2, '#7a8aa8');
  cv.rect(ge + 15, 96, 1, 16, '#9aaac6');
  cv.line(ge + 16, 98, ge + 30, 126, '#7a8aa8');
  const wt = Math.round(at(500));
  cv.line(wt - 5, 132, wt - 8, base, '#7a8aa8');
  cv.line(wt + 5, 132, wt + 8, base, '#7a8aa8');
  cv.rect(wt - 8, 118, 17, 14, '#8a9ab8');
  cv.rect(wt - 6, 116, 13, 2, '#8a9ab8');
  cv.rect(wt - 8, 124, 17, 1, '#a8b8d0');
  // Lincoln's downtown in the haze.
  for (const [x, w, h] of [
    [at(800), 6, 28],
    [at(812), 8, 40],
    [at(826), 5, 22],
    [at(1050), 7, 30],
    [at(1062), 6, 36],
  ]) {
    const xx = Math.round(x);
    cv.rect(xx, base - h - 20, w, h, '#7a90b8');
    for (let y = base - h - 18; y < base - 22; y += 3) for (let i = xx + 1; i < xx + w - 1; i += 2) cv.px(i, y, '#9ab0d0');
  }
  // Snowy mountains on the way west.
  const mx = Math.round(at(1150));
  for (let i = 0; i < 4; i++) {
    const px = mx + i * 14;
    const ph = 34 + (i % 2) * 10;
    cv.poly(
      [
        [px - 14, base - 14],
        [px, base - 14 - ph],
        [px + 14, base - 14],
      ],
      '#5a4a7a',
    );
    cv.poly(
      [
        [px - 4, base - 14 - ph + 9],
        [px, base - 14 - ph],
        [px + 4, base - 14 - ph + 9],
      ],
      C.cream,
    );
  }
  // Marin headlands and Sutro Tower.
  for (let x = Math.round(at(1190)); x < Math.round(at(1460)); x++) {
    const h = 44 + 10 * Math.sin(x / 9) + 4 * Math.sin(x / 3.1);
    for (let y = Math.round(base - h); y < base; y++) cv.px(x, y, y < base - h + 2 ? '#b8405e' : '#5a2a63');
  }
  const st = Math.round(at(1430));
  cv.rect(st, 82, 1, 40, '#2a1a3c');
  cv.line(st - 6, 100, st, 82, '#2a1a3c');
  cv.line(st + 6, 100, st, 82, '#2a1a3c');
  cv.rect(st - 6, 76, 1, 24, '#2a1a3c');
  cv.rect(st + 6, 76, 1, 24, '#2a1a3c');
  cv.px(st - 6, 75, C.red);
  cv.px(st + 6, 75, C.red);
  cv.px(st, 81, C.red);
  // Manhattan at night: Midtown and the Empire State Building.
  let x = Math.round(at(1560));
  while (x < FW) {
    const w = 6 + Math.floor(rand() * 10);
    const h = 30 + Math.floor(rand() * 46);
    cv.rect(x, base - h, w, h, rand() > 0.5 ? '#2b2150' : '#33275a');
    for (let y = base - h + 2; y < base - 2; y += 3)
      for (let i = x + 1; i < x + w - 1; i += 2) if (rand() > 0.72) cv.px(i, y, rand() > 0.6 ? C.gold : C.berry);
    x += w + (rand() > 0.8 ? 1 : 0);
  }
  const e = Math.round(at(1760));
  cv.rect(e - 8, 80, 17, base - 80, '#2b2150');
  cv.rect(e - 6, 66, 13, 14, '#2b2150');
  cv.rect(e - 4, 54, 9, 12, '#2b2150');
  cv.rect(e - 2, 46, 5, 8, C.gold);
  cv.rect(e - 1, 40, 3, 6, C.sun);
  cv.rect(e, 28, 1, 12, C.steel);
  for (let y = 56; y < base - 2; y += 2)
    for (let i = e - 7; i < e + 8; i += 2) if (Math.abs(i - e) <= (y >= 80 ? 7 : y >= 66 ? 5 : 3) && rand() > 0.5) cv.px(i, y, C.gold);
  return cv;
}

// ---------------------------------------------------------------------------
// Walker: 16×24, facing right. Frames 0–3 walk, frame 4 stands.

const HEAD = [
  '......KKKK......',
  '....KKHHHHKK....',
  '...KHHHHHHHHK...',
  '...KHHhhhHHHHK..',
  '...KHHHHHHHSSK..',
  '...KHHHHHSSSSK..',
  '...KHHHHSSKSSK..',
  '....KHHSSSSSSSK.',
  '....KHsSSSSSSK..',
  '.....KsSSSSK....',
  '......KsSK......',
];
const TORSO = {
  neutral: [
    '.....KJJJWWK....',
    '....KJJJJWWJK...',
    '....KJjJJWJJK...',
    '....KJjJJJJJK...',
    '....KJjJJJJJK...',
    '....KJjJJJJJK...',
    '....KJSJJJJJK...',
  ],
  forward: [
    '.....KJJJWWK....',
    '....KJJJJWWJK...',
    '....KJJjJWJJK...',
    '....KJJJjJJJK...',
    '....KJJJJjJJK...',
    '....KJJJJJjJK...',
    '....KJJJJJJJSK..',
  ],
  back: [
    '.....KJJJWWK....',
    '....KJJJJWWJK...',
    '....KjJJJWJJK...',
    '...KjJJJJJJJK...',
    '..KjKJJJJJJJK...',
    '..KSKJJJJJJJK...',
    '....KJJJJJJJK...',
  ],
};
const LEGS = {
  together: ['.....KLLLLK.....', '.....KLLlLK.....', '.....KLLlLK.....', '.....KLLlLK.....', '.....KBBBBBK....', '.....KKKKKKK....'],
  strideA: ['.....KLLLLLK....', '....KllK.KLLK...', '...KllK...KLLK..', '...KllK....KLLK.', '..KbbbK....KBBBK', '..KKKK.....KKKKK'],
  strideB: ['.....KLLLLLK....', '....KLLK.KllK...', '...KLLK...KllK..', '...KLLK....KllK.', '..KBBBK....KbbbK', '..KKKK.....KKKKK'],
};
const BLANK = '................';

export function journeyWalker() {
  const frames = [
    { torso: 'back', legs: 'strideA', dy: 0 },
    { torso: 'neutral', legs: 'together', dy: -1 },
    { torso: 'forward', legs: 'strideB', dy: 0 },
    { torso: 'neutral', legs: 'together', dy: -1 },
    { torso: 'neutral', legs: 'together', dy: 0 },
  ];
  const palette = {
    K: '#0c0a18',
    H: '#5c3a2e',
    h: '#8a5a3c',
    S: '#f2c4a2',
    s: '#d39a78',
    W: '#fdf6e3',
    J: '#2b3a6e',
    j: '#1b2448',
    L: '#2b3a6e',
    l: '#1b2448',
    B: '#3a2430',
    b: '#241820',
  };
  const cv = new Layer(16 * frames.length, 24);
  frames.forEach((f, i) => {
    const rows = [...HEAD, ...TORSO[f.torso], ...LEGS[f.legs]];
    if (rows.length !== 24 || rows.some((r) => r.length !== 16)) throw new Error(`walker frame ${i} is not 16×24`);
    const shifted = f.dy < 0 ? [...rows.slice(-f.dy), ...Array(-f.dy).fill(BLANK)] : rows;
    cv.sprite(i * 16, 0, shifted, palette);
  });
  return cv;
}

// ---------------------------------------------------------------------------
// PNG with transparency (lib.mjs writes opaque PNGs).

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

function encode(cv, scale) {
  const colors = [NONE, ...new Set(cv.data.filter((c) => c !== NONE))];
  if (colors.length > 256) throw new Error(`too many colors: ${colors.length}`);
  const index = new Map(colors.map((c, i) => [c, i]));
  const w = cv.width * scale;
  const h = cv.height * scale;
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = index.get(cv.data[Math.floor(y / scale) * cv.width + Math.floor(x / scale)]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 3, 0, 0, 0], 8);
  const plte = Buffer.from(colors.flatMap((c) => (c === NONE ? [0, 0, 0] : [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)))));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('tRNS', Buffer.from([0])),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Run directly: write the PNGs (and optional 3× previews with --preview <dir>).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = new URL('../../public/art/', import.meta.url).pathname;
  const at = process.argv.indexOf('--preview');
  const preview = at > -1 ? process.argv[at + 1] : null;
  mkdirSync(out, { recursive: true });
  if (preview) mkdirSync(preview, { recursive: true });
  for (const [name, draw] of Object.entries({ 'journey-near': journeyNear, 'journey-far': journeyFar, 'journey-walker': journeyWalker })) {
    const cv = draw();
    const png = cv.png();
    writeFileSync(out + name + '.png', png);
    if (preview) writeFileSync(`${preview}/${name}.png`, cv.png(3));
    console.log(`${name}.png  ${cv.width}×${cv.height}  ${(png.length / 1024).toFixed(1)} KB`);
  }
}
