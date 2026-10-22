// San Francisco, the summer of 2024, in golden-hour light: the Painted Ladies,
// a cable-car hill, the Transamerica Pyramid and Coit Tower, the Golden Gate,
// a hike in the Marin Headlands, and Pebble Beach.
import { C, SKY, ramp } from './lib.mjs';
import { LAWN, WALK, STREET, GROUND, text, windowGrid, tree } from './journey-kit.mjs';

export const GG = { x0: 2266, x1: 2512, t1: 2326, t2: 2452, top: 34, deck: 158 };
export const CABLE_HILL = { x0: 1996, y0: 150, x1: 2120, y1: 98 };

export function sanFrancisco(cv, rand) {
  paintedLadies(cv, rand);
  cableHill(cv, rand);
  downtown(cv, rand);
  coitTower(cv);
  pier39(cv);
  goldenGate(cv);
  presidio(cv);
  blackMountain(cv, rand);
  pebbleBeach(cv, rand);
}

function paintedLadies(cv, rand) {
  // Alamo Square's hill behind, then four Victorians in a row.
  cv.poly(
    [
      [1880, LAWN],
      [1900, 112],
      [1950, 100],
      [1992, 110],
      [1996, LAWN],
    ],
    '#4a7a4a',
  );
  tree(cv, 1912, 112, 6, ['#2f6a4a', '#4a8a4a', '#a7f070']);
  tree(cv, 1964, 104, 5, ['#2f6a4a', '#4a8a4a', '#a7f070']);
  const colors = [
    ['#73c6c6', '#4a9a9a'],
    ['#f2a0b8', '#c87090'],
    ['#ffd88a', '#d8a858'],
    ['#9ab8f0', '#6a88c8'],
  ];
  colors.forEach(([wall, shade], i) => {
    const x = 1886 + i * 26;
    const top = 116 + (i % 2) * 2;
    cv.rect(x, top, 24, LAWN - top, wall);
    cv.rect(x + 22, top, 2, LAWN - top, shade);
    cv.poly(
      [
        [x - 1, top],
        [x + 12, top - 12],
        [x + 25, top],
      ],
      '#3d2f4a',
    );
    cv.line(x - 1, top, x + 12, top - 12, '#f4ecdc');
    cv.line(x + 12, top - 12, x + 25, top, '#f4ecdc');
    cv.rect(x + 9, top - 7, 6, 4, '#ffe9a8');
    // Bay window, door, trim.
    cv.rect(x + 2, top + 6, 11, 14, '#f4ecdc');
    cv.rect(x + 3, top + 7, 9, 5, rand() > 0.4 ? '#ffcd75' : '#c6e6f2');
    cv.rect(x + 3, top + 13, 9, 6, '#c6e6f2');
    cv.rect(x + 15, top + 18, 6, LAWN - top - 18, shade);
    cv.rect(x + 16, top + 19, 4, LAWN - top - 19, '#7a3a3a');
    cv.rect(x + 15, top + 6, 6, 8, '#f4ecdc');
    cv.rect(x + 16, top + 7, 4, 6, '#c6e6f2');
    cv.rect(x, top + 1, 24, 1, '#f4ecdc');
  });
}

function cableHill(cv, rand) {
  // A steep street climbing to the right, houses stepping up beside it. The
  // cable car rides the rails in the overlay.
  const { x0, y0, x1, y1 } = CABLE_HILL;
  cv.poly(
    [
      [x0, LAWN],
      [x0, y0],
      [x1, y1],
      [x1 + 8, y1],
      [x1 + 8, LAWN],
    ],
    '#7a6a7a',
  );
  // Row houses stepping up the hill.
  for (let i = 0; i < 7; i++) {
    const hx = x0 + 4 + i * 17;
    const groundY = Math.round(y0 + ((hx + 8 - x0) / (x1 - x0)) * (y1 - y0));
    const hTop = groundY - 22;
    const wall = ['#e9d0a8', '#c9d8e8', '#f0c8a8', '#d8e8c8', '#e8d8f0', '#f4ecdc', '#c8b8a8'][i];
    cv.rect(hx, hTop, 16, LAWN - hTop, wall);
    cv.rect(hx, hTop - 2, 16, 2, '#5a4a5a');
    windowGrid(cv, hx + 2, hTop + 3, 13, 16, rand, { dx: 6, dy: 8, ww: 4, wh: 5, lit: 0.45, off: '#94b0c2' });
  }
  // The street up the hill, with rails.
  for (let x = x0; x <= x1; x++) {
    const y = Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
    cv.rect(x, y, 1, 4, '#4a4466');
    cv.px(x, y + 1, '#94a0c2');
    cv.px(x, y + 3, '#94a0c2');
    cv.rect(x, y + 4, 1, 2, '#3d3552');
  }
}

function downtown(cv, rand) {
  // The Financial District: office towers and the Transamerica Pyramid.
  for (const [x, w, top, col] of [
    [2126, 16, 70, '#8a7a9a'],
    [2176, 22, 60, '#9a8aa8'],
    [2196, 14, 84, '#7a6a8a'],
  ]) {
    cv.rect(x, top, w, LAWN - top, col);
    cv.rect(x, top, 1, LAWN - top, '#ffcd75');
    windowGrid(cv, x + 2, top + 3, w - 3, LAWN - top - 6, rand, { dx: 4, dy: 4, ww: 2, wh: 2, lit: 0.5, on: ['#ffcd75', '#f7a35c'], off: '#5a4a6e' });
  }
  // Transamerica Pyramid: a tall white pyramid with side wings and a spire.
  const px = 2158;
  for (let y = 26; y < LAWN; y++) {
    const half = Math.round(2 + ((y - 26) / (LAWN - 26)) * 14);
    cv.rect(px - half, y, half * 2 + 1, 1, '#f4ecdc');
    cv.px(px - half, y, '#ffe9a8');
    cv.rect(px + 1, y, half, 1, '#d6ccb8');
    if (y % 3 === 0) for (let x = px - half + 2; x < px + half - 1; x += 2) cv.px(x, y, '#c9bfd9');
  }
  cv.rect(px - 9, 50, 3, 30, '#f4ecdc');
  cv.rect(px + 7, 50, 3, 30, '#d6ccb8');
  cv.rect(px, 14, 1, 12, '#d6ccb8');
}

function coitTower(cv) {
  // Telegraph Hill and Coit Tower's fluted column.
  cv.poly(
    [
      [2208, LAWN],
      [2220, 120],
      [2236, 112],
      [2254, 120],
      [2264, LAWN],
    ],
    '#4a7a4a',
  );
  tree(cv, 2216, 124, 4, ['#2f6a4a', '#4a8a4a', '#a7f070']);
  tree(cv, 2256, 126, 4, ['#2f6a4a', '#4a8a4a', '#a7f070']);
  cv.rect(2230, 76, 12, 38, '#f4ecdc');
  for (let x = 2231; x < 2241; x += 2) cv.rect(x, 80, 1, 32, '#d6ccb8');
  cv.rect(2228, 74, 16, 3, '#e9e0d0');
  cv.rect(2232, 70, 8, 4, '#f4ecdc');
  for (let x = 2232; x < 2240; x += 2) cv.rect(x, 71, 1, 2, '#3d2f4a');
  cv.rect(2226, 112, 20, 4, '#d6ccb8');
}

function goldenGate(cv) {
  const { x0, x1, t1, t2, top, deck } = GG;
  const gg = '#d9452f';
  const ggD = '#9a2f2a';
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
  cv.rect(x0, deck - 6, x1 - x0, 1, gg);
  for (let x = x0; x < x1; x += 3) cv.rect(x, deck - 6, 1, 6, gg);
  for (let x = x0 + 10; x < x1; x += 30) {
    cv.rect(x, deck - 14, 1, 8, ggD);
    cv.rect(x - 1, deck - 15, 3, 1, C.sun);
  }
  for (const tx of [t1, t2]) {
    for (const lx of [tx - 6, tx + 3]) {
      cv.rect(lx, top, 4, GROUND + 16 - top, gg);
      cv.rect(lx + 3, top, 1, GROUND + 16 - top, ggD);
      cv.rect(lx + 1, top - 4, 2, 4, gg);
    }
    for (const sy of [top + 4, top + 22, top + 42, top + 64]) {
      cv.rect(tx - 2, sy, 5, 3, gg);
      cv.rect(tx - 2, sy + 3, 5, 1, ggD);
    }
  }
}

function pier39(cv) {
  // The Pier 39 entrance sign, with a sea lion lounging in front.
  const x = 2212;
  cv.rect(x, 130, 3, 22, '#8a5a3c');
  cv.rect(x + 34, 130, 3, 22, '#8a5a3c');
  cv.rect(x - 2, 124, 41, 9, '#5c3a2e');
  cv.rect(x - 1, 125, 39, 7, '#a8704a');
  text(cv, x + 5, 126, 'PIER 39', '#f4ecdc');
  cv.sprite(x + 12, 146, ['..KK....', '.KKKK...', 'KKKKKKK.', '.KKKKKKK', '....KK.K'], { K: '#5c4a4a' });
}

function presidio(cv) {
  // Pickleball at the Presidio: a court, a net and a pair of paddles (the ball is in the overlay).
  const x = 2516;
  cv.rect(x, 140, 40, 12, '#2f8a7a');
  cv.rect(x + 2, 141, 36, 10, '#3a7ab0');
  cv.rect(x + 2, 141, 36, 1, '#f4ecdc');
  cv.rect(x + 2, 150, 36, 1, '#f4ecdc');
  cv.rect(x + 2, 145, 36, 1, '#f4ecdc');
  cv.rect(x + 19, 134, 2, 17, '#141026');
  for (let y = 135; y < 145; y += 2) cv.rect(x + 18, y, 4, 1, '#c9cfe0');
  for (const px of [x + 6, x + 32]) {
    cv.rect(px, 127, 3, 3, '#f2c4a2');
    cv.rect(px - 1, 130, 5, 6, px < x + 20 ? '#e43b44' : '#ffcd75');
    cv.rect(px, 136, 1, 4, '#24305a');
    cv.rect(px + 2, 136, 1, 4, '#24305a');
    cv.rect(px + (px < x + 20 ? 4 : -3), 128, 2, 3, '#3d2f4a');
  }
}

function blackMountain(cv, rand) {
  // Black Mountain above Los Altos Hills: golden grass, oaks, the radio towers
  // on top, and the Rhus Ridge trail (the hiker climbs it in the overlay).
  cv.poly(
    [
      [2558, LAWN],
      [2580, 112],
      [2612, 92],
      [2640, 104],
      [2670, LAWN],
    ],
    '#c9a26b',
  );
  cv.poly(
    [
      [2590, LAWN],
      [2626, 118],
      [2660, 126],
      [2672, LAWN],
    ],
    '#a8865e',
  );
  for (let x = 2560; x < 2670; x++) for (let y = 92; y < LAWN; y++) if (cv.get(x, y) === '#c9a26b' && (x * 3 + y * 7) % 13 === 0) cv.px(x, y, '#e0c088');
  for (const tx of [2608, 2616]) {
    cv.rect(tx, 72, 1, 20, '#566c86');
    for (let y = 74; y < 92; y += 4) cv.rect(tx - 1, y, 3, 1, '#566c86');
    cv.px(tx, 71, C.red);
  }
  const trail = [
    [2562, 150],
    [2590, 134],
    [2578, 124],
    [2600, 110],
    [2612, 96],
  ];
  for (let i = 0; i < trail.length - 1; i++) {
    const [ax, ay] = trail[i];
    const [bx, by] = trail[i + 1];
    for (let k = 0; k <= 30; k++) if (k % 3 !== 2) cv.px(ax + ((bx - ax) * k) / 30, ay + ((by - ay) * k) / 30, '#f4ecdc');
  }
  // Coast live oaks dotted on the slope.
  for (const [x, y, r] of [
    [2572, 140, 5],
    [2632, 124, 6],
    [2650, 140, 7],
    [2596, 124, 4],
  ]) {
    cv.rect(x - 1, y, 2, 6, '#5c3a2e');
    cv.disc(x, y - 1, r, '#2f5a3a');
    cv.disc(x - 1, y - 2, Math.max(1, r - 2), '#4a7a4a');
  }
  rand();
}

function pebbleBeach(cv, rand) {
  // The Pacific behind the 17-Mile Drive, the Lone Cypress on its rock, and a
  // cliff-top green with a flag.
  for (let y = 98; y < LAWN; y++)
    for (let x = 2672; x < 2916; x++) {
      const t = 0.66 - (y - 98) * 0.007 + (Math.sin(x * 0.25 + y * 1.9) > 0.7 ? 0.1 : 0);
      cv.px(x, y, ramp(SKY, y % 2 ? t - 0.12 : t - 0.2, x, y));
    }
  cv.rect(2672, 98, 244, 1, '#ffe9a8');
  // The rock, with surf around its foot.
  cv.poly(
    [
      [2740, LAWN],
      [2746, 128],
      [2756, 120],
      [2772, 122],
      [2780, 132],
      [2786, LAWN],
    ],
    '#5c4a5a',
  );
  cv.line(2746, 128, 2756, 120, '#8a7a8a');
  for (let x = 2736; x < 2792; x += 3) cv.rect(x, 146 + (x % 2), 2, 1, '#f4ecdc');
  // The Lone Cypress: a leaning trunk and a flat, wind-swept crown.
  cv.line(2764, 121, 2760, 108, '#3d2a2a');
  cv.line(2765, 121, 2761, 108, '#5c3a2e');
  cv.line(2761, 110, 2752, 104, '#3d2a2a');
  for (const [x, y, w] of [
    [2742, 100, 22],
    [2748, 97, 22],
    [2756, 102, 18],
    [2738, 104, 14],
  ]) {
    cv.rect(x, y, w, 3, '#1c4a43');
    cv.rect(x + 2, y, w - 6, 1, '#2f6a4a');
  }
  // The green, the pin and a bunker on the cliff top.
  cv.poly(
    [
      [2820, LAWN],
      [2830, 140],
      [2900, 138],
      [2914, LAWN],
    ],
    '#38b764',
  );
  cv.fill(2830, 139, 70, 13, (x, y) => ((x + y) % 4 === 0 ? '#4ac874' : null));
  cv.poly(
    [
      [2880, LAWN],
      [2886, 146],
      [2900, 146],
      [2904, LAWN],
    ],
    '#e9d0a8',
  );
  cv.rect(2862, 120, 1, 20, '#f4ecdc');
  cv.rect(2861, 139, 3, 1, '#0c0a18');
  // A wooden sign.
  cv.rect(2688, 132, 46, 10, '#8a5a3c');
  cv.rect(2689, 133, 44, 8, '#a8704a');
  text(cv, 2692, 135, 'PEBBLE BCH', '#f4ecdc');
  cv.rect(2698, 142, 2, 10, '#5c3a2e');
  cv.rect(2720, 142, 2, 10, '#5c3a2e');
  rand();
}

export { WALK, STREET };
