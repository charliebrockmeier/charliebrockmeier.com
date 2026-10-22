// San Francisco, the summer of 2024, in golden-hour light: the Painted Ladies,
// a cable-car hill, the Transamerica Pyramid and Coit Tower, the Golden Gate,
// a hike in the Marin Headlands, and Pebble Beach.
import { C, SKY, ramp } from './lib.mjs';
import { LAWN, WALK, STREET, GROUND, H, HORIZON, sea, text, windowGrid, tree } from './journey-kit.mjs';

export const GG = { x0: 2266, x1: 2512, t1: 2326, t2: 2452, top: 34, deck: 158 };
export const CABLE_HILL = { x0: 1996, y0: 150, x1: 2120, y1: 98 };
/** Pebble Beach: where the verge turns to sand, and the sea cave under the road. */
export const COAST = { x0: 2656, x1: 2936, sea: [2678, 2924], cave: { x: 2800, rx: 108, ry: 14, water: H - 6 } };

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

/** A Monterey cypress: a leaning trunk and flat, wind-swept pads of foliage, blown east. */
function cypress(cv, x, base, h, lean = 1) {
  const top = base - h;
  cv.line(x, base, x + lean * 3, top + 8, '#3d2a2a');
  cv.line(x + 1, base, x + 1 + lean * 3, top + 8, '#5c3a2e');
  cv.line(x + lean * 2, top + 14, x - lean * 6, top + 6, '#3d2a2a');
  cv.line(x + lean * 3, top + 10, x + lean * 10, top + 4, '#3d2a2a');
  for (const [dx, dy, w] of [
    [-12, 6, 14],
    [-4, 2, 18],
    [4, 0, 16],
    [8, 6, 14],
    [-8, -2, 12],
    [2, -4, 12],
  ]) {
    const px = x + dx * lean - (lean < 0 ? w : 0);
    cv.rect(px, top + dy, w, 3, '#1c4a43');
    cv.rect(px + 1, top + dy - 1, w - 2, 1, '#1c4a43');
    cv.rect(px + 2, top + dy - 1, w - 6, 1, '#2f6a4a');
    cv.rect(px + 3, top + dy - 2, Math.max(2, w - 9), 1, '#4a7a4a');
  }
}

/** A granite headland at golden hour: dry grass on top, a sunlit edge, strata and cracks, surf at its foot. */
function rock(cv, points, { grass = true } = {}) {
  const body = '#7a5a62';
  cv.poly(points, body);
  const xs = points.map((p) => p[0]);
  const [xa, xb] = [Math.min(...xs), Math.max(...xs)];
  for (let x = xa; x <= xb; x++) {
    let top = 0;
    while (top < LAWN && cv.get(x, top) !== body) top++;
    if (top >= LAWN) continue;
    for (let y = top; y < LAWN; y++) {
      if (cv.get(x, y) !== body) continue;
      const d = y - top;
      let c = body;
      if (d === 0) c = grass ? '#c8a050' : '#e8a878';
      else if (d === 1) c = grass ? '#8a8a3a' : '#c88a6a';
      else if (d === 2 && x % 3) c = '#c88a6a';
      else if (d > 3 && (y + Math.round(3 * Math.sin(x / 7))) % 7 === 0 && (x * 13) % 5) c = '#5c4050';
      else if ((x * 7 + y * 3) % 19 === 0 || ((x * 3 + y) % 23 === 0 && d > 3)) c = '#4a3040';
      else if (d > 3 && (x * 11 + y * 5) % 29 === 0) c = '#a87a72';
      else if (y > LAWN - 5) c = (x + y) % 2 ? '#5c4050' : body;
      cv.px(x, y, c);
    }
    if (top < LAWN - 3 && (x * 5) % 7 < 3) cv.px(x, LAWN - 1 - (x % 2), '#f4ecdc');
  }
}

function pebbleBeach(cv, rand) {
  // Carmel Bay off the 17-Mile Drive at golden hour. The sea is drawn one flat color
  // per row from the shared horizon, the same as the far layer's, so the two meet
  // without a seam; rocky points with cypresses close the bay at both ends.
  const [s0, s1] = COAST.sea;
  for (let x = s0; x < s1; x++) for (let y = HORIZON; y < LAWN; y++) cv.px(x, y, sea(x, y, 0));
  // Swells: long, faint lines that grow toward the shore.
  for (let y = HORIZON + 4; y < LAWN - 4; y += 3 + Math.floor((y - HORIZON) / 9))
    for (let x = s0; x < s1; x++) if (Math.sin(x / (5 + (y - HORIZON) / 4) + y * 1.3) > 0.82) cv.px(x, y, (y - HORIZON) < 12 ? '#ffcd75' : '#d8909a');
  // The beach on the left, sloping into the water with a line of foam.
  cv.poly([[2696, LAWN], [2700, 142], [2724, 140], [2752, 143], [2760, LAWN]], '#e9c898');
  for (let x = 2700; x < 2756; x++) {
    let y = 0;
    while (y < LAWN && cv.get(x, y) !== '#e9c898') y++;
    cv.px(x, y, '#f4e0b0');
    if (x % 5 < 3) cv.px(x, y - 1, '#f4ecdc');
    if ((x * 3) % 7 === 0) cv.px(x, y + 3, '#d8b080');
  }
  // The Lone Cypress on its granite rock, with a little stone wall at its foot.
  rock(cv, [[2746, LAWN], [2749, 140], [2753, 131], [2758, 127], [2763, 122], [2770, 120], [2779, 120], [2785, 125], [2789, 133], [2795, 141], [2800, LAWN]], { grass: false });
  cv.rect(2758, 146, 34, 6, '#8a7a7a');
  for (let x = 2758; x < 2792; x += 4) cv.rect(x, 146 + ((x >> 2) & 1) * 3, 1, 3, '#5c4a5a');
  cv.rect(2758, 146, 34, 1, '#a89a9a');
  for (let x = 2744; x < 2802; x += 3) cv.rect(x, 140 + (x % 2), 2, 1, '#f4ecdc');
  cv.line(2776, 120, 2771, 104, '#3d2a2a');
  cv.line(2777, 120, 2772, 104, '#5c3a2e');
  cv.line(2772, 107, 2762, 101, '#3d2a2a');
  cv.line(2773, 106, 2781, 102, '#3d2a2a');
  for (const [x, y, w] of [
    [2752, 98, 22],
    [2758, 95, 24],
    [2766, 100, 20],
    [2748, 102, 14],
    [2776, 97, 12],
  ]) {
    cv.rect(x, y, w, 3, '#1c4a43');
    cv.rect(x + 1, y - 1, w - 2, 1, '#1c4a43');
    cv.rect(x + 2, y - 1, w - 6, 1, '#2f6a4a');
    cv.rect(x + 3, y - 2, w - 9, 1, '#4a7a4a');
  }
  cv.line(2777, 108, 2790, 121, '#94a0c2');
  // The 18th green on its bluff above a stone seawall, a bunker, and the pin.
  cv.rect(2814, 134, 92, LAWN - 134, '#8a7a7a');
  for (let y = 136; y < LAWN; y += 4)
    for (let x = 2814 + ((y >> 2) % 2) * 4; x < 2906; x += 8) {
      cv.rect(x, y, 7, 3, (x + y) % 3 ? '#9a8a8a' : '#7a6a6e');
      cv.rect(x, y + 3, 8, 1, '#5c4a5a');
    }
  cv.rect(2814, 134, 92, 1, '#c9bfb0');
  cv.poly([[2816, 135], [2826, 128], [2898, 126], [2908, 135]], '#38b764');
  cv.fill(2822, 126, 84, 9, (x, y) => (cv.get(x, y) === '#38b764' && (x + y) % 4 === 0 ? '#4ac874' : null));
  cv.poly([[2826, 128], [2840, 125], [2898, 124], [2898, 126]], '#a7f070');
  cv.poly([[2876, 134], [2880, 130], [2894, 130], [2898, 134]], '#e9d0a8');
  cv.rect(2862, 106, 1, 21, '#f4ecdc');
  cv.rect(2861, 126, 3, 1, '#0c0a18');
  for (let x = 2812; x < 2908; x += 3) cv.rect(x, LAWN - 2 + (x % 2), 2, 1, '#f4ecdc');
  // Rocky points close the bay at both ends, each with its cypresses.
  rock(cv, [[2648, LAWN], [2652, 128], [2658, 121], [2668, 118], [2680, 115], [2692, 116], [2699, 120], [2701, 128], [2705, 134], [2707, 143], [2712, LAWN]]);
  cypress(cv, 2666, 119, 26, 1);
  cypress(cv, 2686, 116, 20, 1);
  rock(cv, [[2898, LAWN], [2901, 140], [2904, 130], [2908, 121], [2912, 115], [2922, 112], [2932, 114], [2938, 122], [2942, 134], [2946, LAWN]]);
  cypress(cv, 2920, 113, 24, 1);
  // Riprap where the sea meets the road.
  for (let x = s0; x < s1; x += 5) {
    const y = LAWN - 3 - ((x * 7) % 3);
    if (cv.get(x, y) && cv.get(x, y) !== '#e9c898') {
      cv.rect(x, y, 4, LAWN - y, '#6a5060');
      cv.rect(x, y, 4, 1, '#a8909a');
    }
  }
  // A wooden sign at the foot of the point, clear of the beach.
  cv.rect(2654, 132, 46, 10, '#8a5a3c');
  cv.rect(2655, 133, 44, 8, '#a8704a');
  text(cv, 2658, 135, 'PEBBLE BCH', '#f4ecdc');
  cv.rect(2664, 142, 2, 10, '#5c3a2e');
  cv.rect(2686, 142, 2, 10, '#5c3a2e');
  rand();
}

export { WALK, STREET };
