// The title-screen panorama, 480×180. West to east, which is also left to right
// and first to last: a Kearney sunset (grain elevator, windmill, the Platte River
// with sandhill cranes, the Archway over I-80), the Palisades and the George
// Washington Bridge, then Manhattan at night over the Hudson.
//
// Anything that moves (walker, windmill blades, cranes, beacons, boat) is drawn
// as an SVG overlay in src/components/Panorama.astro at these same coordinates.
import { Canvas, C, SKY, ramp, rng, stars } from './lib.mjs';

export const W = 480;
export const H = 180;
export const HORIZON = 142;
export const ROAD = 166; // top of I-80
export const SUN = { x: 84, y: 134, r: 13 };
export const MOON = { x: 318, y: 64 };
export const RIVER = { kearney: [150, 157], hudson: [HORIZON, ROAD - 2] };

// Landmark anchors the overlay needs.
export const anchors = {
  windmill: { x: 118, y: 111 },
  esb: { x: 380, y: 34 },
  wtc: { x: 459, y: 26 },
  park: { x: 336, y: 55 },
  gwb: { x: 297, y: 96 },
};

const SIL = '#2a1a3c'; // backlit silhouettes in the west
const SIL2 = '#3a2350';

export function panorama() {
  const cv = new Canvas(W, H);
  const rand = rng(1980);

  // Sky: a sunset in the west that cools to night over Manhattan.
  const skyT = (x, y) => {
    const v = Math.pow(y / HORIZON, 1.8) * 0.3;
    const dx = (x - SUN.x) / 260;
    const dy = (y - SUN.y) / 125;
    const glow = Math.pow(Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)), 1.45) * 0.82;
    const city = x > 300 ? Math.max(0, 1 - (HORIZON - y) / 46) * 0.14 * Math.min(1, (x - 300) / 40) : 0;
    return v + glow + city;
  };
  cv.fill(0, 0, W, HORIZON, (x, y) => ramp(SKY, skyT(x, y), x, y));
  stars(cv, 260, rand, 110, (x, y) => skyT(x, y) < 0.09);

  // A few long clouds catching the last light: lit tops, shaded bellies.
  for (const [cx, cy, len] of [
    [30, 60, 58],
    [150, 46, 74],
    [104, 88, 44],
    [214, 70, 52],
  ]) {
    const t = skyT(cx + len / 2, cy);
    const lit = t > 0.42 ? C.sun : t > 0.3 ? C.gold : C.coral;
    const mid = t > 0.42 ? C.gold : t > 0.3 ? C.coral : C.rose;
    const shade = t > 0.42 ? C.coral : t > 0.3 ? C.rose : C.berry;
    cv.rect(cx + Math.round(len * 0.2), cy - 1, Math.round(len * 0.45), 1, lit);
    cv.rect(cx, cy, len, 1, mid);
    cv.rect(cx + 6, cy + 1, len - 4, 1, shade);
    cv.rect(cx + Math.round(len * 0.55), cy + 2, Math.round(len * 0.35), 1, shade);
    cv.px(cx - 1, cy + 1, shade);
  }

  // Moon over the city.
  for (let y = -8; y <= 8; y++)
    for (let x = -8; x <= 8; x++) {
      const inMoon = x * x + y * y <= 52;
      const bite = (x + 4) * (x + 4) + (y - 2) * (y - 2) <= 40;
      if (inMoon && !bite) cv.px(MOON.x + x, MOON.y + y, x > 3 || y < -5 ? C.sun : C.cream);
    }

  // The sun, half set.
  for (let y = -SUN.r; y <= SUN.r; y++)
    for (let x = -SUN.r; x <= SUN.r; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d <= SUN.r) cv.px(SUN.x + x, SUN.y + y, d > SUN.r - 1.2 ? C.sun : C.cream);
      else if (d <= SUN.r + 2 && (x + y) % 2 === 0) cv.px(SUN.x + x, SUN.y + y, C.sun);
    }

  drawKearney(cv, rand);
  drawHudson(cv, rand);
  drawRoad(cv, rand);
  drawArchway(cv);
  return cv;
}

function drawKearney(cv, rand) {
  // Tree line along the Platte, against the glow.
  for (let x = 0; x < 268; x++) {
    const h = 3 + Math.round(2 * Math.sin(x / 5.3) + 1.6 * Math.sin(x / 2.1 + 1) + (rand() > 0.85 ? 1 : 0));
    cv.rect(x, HORIZON - h, 1, h, x % 23 < 2 ? SIL2 : SIL);
  }

  // Grain elevator: four silos and a headhouse, rim-lit from the sun on their right.
  const silo = '#3b2a58';
  for (const bx of [16, 24, 32, 40]) {
    cv.rect(bx, 96, 8, HORIZON - 96, silo);
    cv.rect(bx + 6, 96, 1, HORIZON - 96, C.dusk3);
    cv.rect(bx + 7, 96, 1, HORIZON - 96, SIL);
    cv.rect(bx + 1, 95, 6, 1, silo);
  }
  cv.rect(46, 97, 2, HORIZON - 97, C.rose);
  cv.rect(26, 72, 14, 24, silo);
  cv.rect(39, 72, 1, 24, C.rose);
  cv.rect(25, 70, 16, 2, SIL);
  cv.rect(30, 66, 6, 4, silo);
  cv.rect(35, 66, 1, 4, C.rose);
  cv.rect(29, 77, 2, 2, C.gold);
  cv.rect(33, 85, 2, 2, C.dusk3);
  cv.line(40, 74, 58, 112, SIL); // grain spout
  cv.line(41, 74, 59, 112, SIL);

  // Windmill tower (the blades spin in the overlay).
  const { x: wx, y: wy } = anchors.windmill;
  cv.line(wx - 1, wy + 2, wx - 6, HORIZON - 1, SIL);
  cv.line(wx + 1, wy + 2, wx + 6, HORIZON - 1, SIL);
  for (let y = wy + 8; y < HORIZON; y += 8) {
    const half = 1 + Math.round(((y - wy) / (HORIZON - wy)) * 5);
    cv.line(wx - half, y, wx + half, y, SIL);
    cv.line(wx - half, y, wx + half, y + 7 > HORIZON ? HORIZON - 1 : y + 7, SIL2);
  }
  cv.rect(wx + 2, wy - 1, 7, 2, SIL); // tail vane
  cv.rect(wx + 7, wy - 3, 2, 6, SIL);

  // Red barn and farmhouse.
  const barn = '#7a2f4a';
  cv.poly(
    [
      [206, 124],
      [216, 118],
      [226, 118],
      [236, 124],
      [236, HORIZON],
      [206, HORIZON],
    ],
    barn,
  );
  cv.line(206, 124, 216, 118, C.rose);
  cv.line(216, 118, 226, 118, C.rose);
  cv.rect(207, 125, 28, 1, '#5a2340');
  cv.rect(217, 130, 8, 12, '#4a1d38');
  cv.line(217, 130, 224, 141, C.tan);
  cv.line(224, 130, 217, 141, C.tan);
  cv.rect(219, 121, 4, 3, C.gold);
  cv.poly(
    [
      [240, 132],
      [247, 126],
      [254, 132],
      [254, HORIZON],
      [240, HORIZON],
    ],
    '#3b2a58',
  );
  cv.rect(243, 134, 3, 3, C.gold);
  cv.rect(249, 134, 3, 3, C.orange);
  // Cottonwoods.
  for (const [tx, ty, r] of [
    [196, 128, 7],
    [262, 130, 6],
    [72, 132, 5],
    [146, 130, 6],
  ]) {
    cv.disc(tx, ty, r, SIL);
    cv.disc(tx - 2, ty - 2, r - 3, SIL2);
    cv.rect(tx, ty + r - 1, 2, HORIZON - ty - r + 1, SIL);
  }

  // Far field, then the Platte with sandbars and cranes, then the near field.
  const [r0, r1] = RIVER.kearney;
  cv.fill(0, HORIZON, 268, r0 - HORIZON, (x, y) => {
    const near = Math.max(0, 1 - Math.abs(x - SUN.x) / 90);
    if (y === HORIZON && rand() < near) return C.coral;
    if ((x * 7 + y * 13) % 29 === 0 && rand() < near) return C.rose;
    return y % 2 ? '#3a2440' : '#45294a';
  });
  cv.fill(0, r0, 268, r1 - r0, (x, y) => {
    const t = 0.78 - Math.abs(x - SUN.x) / 260 - (y - r0) * 0.03;
    if (Math.abs(x - SUN.x) < 6 - (y - r0) * 0.4 && (x + y) % 3) return C.sun;
    if (y % 2 === 1 && rand() > 0.55) return ramp(SKY, t - 0.15, x, y);
    return ramp(SKY, t, x, y);
  });
  cv.rect(0, r0, 268, 1, '#2a1a3c');
  for (const [sx, sw] of [
    [14, 22],
    [96, 30],
    [168, 18],
    [222, 26],
  ]) {
    cv.rect(sx, r0 + 3, sw, 2, '#6a4652');
    cv.rect(sx + 2, r0 + 2, sw - 4, 1, '#8a5a52');
  }
  // Sandhill cranes, standing (they fly in the overlay).
  const crane = ['.R', 'K.', 'K.', 'KK', 'KKK', '.K.', '.K.'];
  for (const [cx, cy] of [
    [20, r0 - 4],
    [27, r0 - 4],
    [104, r0 - 4],
    [110, r0 - 3],
    [118, r0 - 4],
    [228, r0 - 4],
  ])
    cv.sprite(cx, cy, crane, { K: SIL, R: C.red });
  cv.fill(0, r1, 268, ROAD - r1, (x, y) => {
    const sway = (x + Math.floor(y / 3)) % 4;
    if (sway === 0) return y === r1 ? (Math.abs(x - SUN.x) < 110 ? C.gold : C.orange) : y < r1 + 3 ? C.pine : C.forest;
    if (sway === 2 && y > r1 + 2) return '#173a37';
    return '#241a34';
  });
}

function drawHudson(cv, rand) {
  // The Palisades: a dark cliff on the New Jersey side.
  cv.poly(
    [
      [262, HORIZON],
      [268, 126],
      [300, 122],
      [312, 128],
      [318, ROAD],
      [262, ROAD],
    ],
    '#22183a',
  );
  for (let x = 270; x < 312; x += 3) cv.line(x, 126, x + 2, ROAD - 6, '#2c2048');
  for (let x = 266; x < 304; x += 4) cv.disc(x, 122 + Math.round(Math.sin(x) * 1.5), 3, '#1f1634');
  for (const [fx, fw, fh] of [
    [272, 6, 22],
    [280, 5, 16],
  ]) {
    cv.rect(fx, 124 - fh, fw, fh, '#2a1f48');
    for (let j = 126 - fh; j < 122; j += 3) for (let i = fx + 1; i < fx + fw - 1; i += 2) if (rand() > 0.5) cv.px(i, j, C.orange);
  }
  cv.rect(262, ROAD - 3, 56, 3, '#1a1230');

  // Manhattan, far layer first.
  const far = '#33275a';
  let x = 318;
  while (x < W) {
    const w = 5 + Math.floor(rand() * 8);
    const h = 26 + Math.floor(rand() * 34);
    cv.rect(x, HORIZON - h, w, h, far);
    for (let j = HORIZON - h + 2; j < HORIZON - 1; j += 3)
      for (let i = x + 1; i < x + w - 1; i += 2) if (rand() > 0.84) cv.px(i, j, rand() > 0.5 ? C.berry : C.haze);
    x += w;
  }

  drawLandmarks(cv, rand);

  // Near layer with lit windows and the odd rooftop water tower.
  const nearColors = ['#1f1838', '#241c42', '#1b1533'];
  x = 314;
  while (x < W) {
    const w = 6 + Math.floor(rand() * 10);
    const h = 10 + Math.floor(rand() * 24);
    const top = HORIZON - h;
    const skip = (x > 368 && x < 392) || (x > 444 && x < 470);
    const hh = skip ? Math.min(h, 10) : h;
    cv.rect(x, HORIZON - hh, w, hh, nearColors[Math.floor(rand() * 3)]);
    for (let j = HORIZON - hh + 2; j < HORIZON - 1; j += 3)
      for (let i = x + 1; i < x + w - 1; i += 2) {
        const r = rand();
        if (r > 0.62) cv.px(i, j, r > 0.93 ? C.sun : r > 0.8 ? C.gold : C.orange);
      }
    if (!skip && w > 8 && rand() > 0.55) {
      const tx = x + 2 + Math.floor(rand() * (w - 6));
      cv.rect(tx, top - 5, 4, 3, C.bark);
      cv.rect(tx + 1, top - 6, 2, 1, C.bark);
      cv.px(tx, top - 2, C.bark);
      cv.px(tx + 3, top - 2, C.bark);
    }
    x += w + (rand() > 0.8 ? 1 : 0);
  }

  drawBridge(cv);

  // The Hudson: night water with the city mirrored in broken ripples.
  const [w0, w1] = RIVER.hudson;
  const LIT = new Set([C.gold, C.sun, C.orange, C.cyan, C.cream]);
  for (let j = w0; j < w1; j++) {
    const d = j - w0;
    for (let i = 316; i < W; i++) {
      let c = (j >> 1) % 2 ? '#1a132f' : '#161028';
      if ((i * 3 + j * 7) % 23 === 0) c = '#2b2150';
      const src = cv.get(i + Math.round(Math.sin(j * 2.3 + i * 0.05) * 1.5), HORIZON - 1 - d);
      if (i > 318 && LIT.has(src) && rand() > 0.25 + d * 0.025) c = src === C.cyan ? C.teal : src === C.orange ? C.coral : C.orange;
      cv.px(i, j, c);
    }
  }
  // Long streaks under the bright landmarks, and the moon's path.
  for (const [lx, color] of [
    [anchors.esb.x, C.gold],
    [409, C.sun],
    [anchors.wtc.x, C.cyan],
  ])
    for (let j = w0 + 1; j < w1; j += 2) {
      const len = 1 + Math.floor(rand() * 3);
      if (rand() > 0.15) cv.rect(lx - Math.floor(len / 2) + Math.round(Math.sin(j) * 1.5), j, len, 1, color);
    }
  for (let j = w0 + 1; j < w1; j += 2) {
    const len = 2 + Math.floor(rand() * 4) + Math.floor((j - w0) / 6);
    if (rand() > 0.2) cv.rect(MOON.x + 4 - Math.floor(len / 2) + Math.round(Math.sin(j * 1.3) * 2), j, len, 1, j - w0 < 10 ? C.cream : C.steel);
  }
  cv.rect(316, w0, W - 316, 1, '#120d22');
}

function drawLandmarks(cv, rand) {
  const lm = '#2b2150';
  const lmLight = '#3d2f66';

  // 432 Park Avenue: a thin, tall grid.
  cv.rect(334, 56, 5, HORIZON - 56, lm);
  for (let j = 58; j < HORIZON - 2; j += 3) for (let i = 335; i < 338; i += 2) if (rand() > 0.45) cv.px(i, j, C.gold);
  cv.px(336, 55, lm);

  // Empire State Building: setbacks, a lit crown, the mast.
  const e = anchors.esb.x;
  cv.rect(e - 9, 98, 19, HORIZON - 98, lm);
  cv.rect(e - 7, 84, 15, 14, lm);
  cv.rect(e - 5, 72, 11, 12, lm);
  cv.rect(e - 3, 60, 7, 12, lm);
  cv.rect(e - 2, 54, 5, 6, C.gold);
  cv.rect(e - 1, 49, 3, 5, C.sun);
  cv.rect(e, 38, 1, 11, C.steel);
  cv.rect(e - 9, 98, 1, HORIZON - 98, lmLight);
  cv.rect(e - 7, 84, 1, 14, lmLight);
  cv.rect(e - 5, 72, 1, 12, lmLight);
  for (let j = 62; j < HORIZON - 2; j += 2)
    for (let i = e - 8; i < e + 9; i += 2) {
      const inside = (j >= 98 || Math.abs(i - e) <= (j >= 84 ? 6 : j >= 72 ? 4 : 2)) && rand() > 0.5;
      if (inside) cv.px(i, j, rand() > 0.75 ? C.sun : C.gold);
    }
  for (let j = 60; j < 72; j += 2) cv.px(e, j, C.gold);

  // Chrysler Building: the terraced crown with its triangular windows.
  const c = 409;
  cv.rect(c - 5, 74, 11, HORIZON - 74, lm);
  for (let k = 0; k < 6; k++) {
    const half = 5 - k;
    const y = 74 - k * 3;
    cv.rect(c - half, y - 3, half * 2 + 1, 3, C.steel);
    cv.px(c - half, y - 3, C.slate);
    cv.px(c + half, y - 3, C.slate);
    for (let i = -half + 1; i <= half - 1; i += 2) cv.px(c + i, y - 2, C.sun);
  }
  cv.rect(c, 46, 1, 10, C.steel);
  for (let j = 76; j < HORIZON - 2; j += 3) for (let i = c - 4; i < c + 5; i += 2) if (rand() > 0.55) cv.px(i, j, C.gold);

  // One World Trade Center: a tapering, chamfered prism and its spire.
  const w = anchors.wtc.x;
  for (let y = 46; y < HORIZON; y++) {
    const half = y > 104 ? 8 : Math.round(2 + ((y - 46) / 58) * 6);
    cv.rect(w - half, y, half * 2 + 1, 1, lm);
    const mid = Math.round(((y - 46) / (HORIZON - 46)) * half);
    cv.rect(w - half, y, Math.max(1, half - mid), 1, '#3a3070');
    if (y % 2 === 0) for (let i = w - half + 1; i < w + half; i += 2) if (rand() > 0.6) cv.px(i, y, rand() > 0.7 ? C.cyan : C.steel);
  }
  cv.rect(w, 28, 1, 18, C.steel);
}

function drawBridge(cv) {
  // George Washington Bridge: a steel tower on the Jersey side and the cables
  // sweeping toward Manhattan. I-80 ends right at it.
  const t = anchors.gwb.x;
  const top = anchors.gwb.y;
  const deck = 128;
  const steel = '#4a4f78';
  const steelD = '#353a5e';
  cv.rect(t - 4, top, 2, deck - top + 12, steel);
  cv.rect(t + 3, top, 2, deck - top + 12, steel);
  for (let y = top + 2; y < deck + 10; y += 4) {
    cv.line(t - 2, y, t + 2, y + 3, steelD);
    cv.line(t + 2, y, t - 2, y + 3, steelD);
  }
  cv.rect(t - 4, top, 9, 2, steel);
  cv.rect(t - 4, top + 16, 9, 1, steel);
  // Deck from the Palisades into the city.
  cv.rect(268, deck, 100, 2, steelD);
  cv.rect(268, deck + 2, 100, 1, '#241c42');
  for (let x = 270; x < 368; x += 4) cv.px(x, deck - 1, x % 8 ? C.gold : C.red);
  // Main cables: back span toward the cliff, main span toward the city.
  for (let x = 268; x <= t - 4; x++) {
    const u = (x - 268) / (t - 4 - 268);
    const y = Math.round(deck - 2 - u * (deck - 2 - top - 1) + Math.sin(u * Math.PI) * 4);
    cv.px(x, y, C.steel);
    if (x % 3 === 0) cv.rect(x, y + 1, 1, Math.max(0, deck - y - 1), steelD);
  }
  for (let x = t + 5; x < 368; x++) {
    const u = (x - (t + 5)) / (368 - (t + 5));
    const y = Math.round(top + 1 + (deck - 3 - top) * Math.pow(u, 0.55) - Math.sin(u * Math.PI) * 6 + 3 * u);
    cv.px(x, Math.min(y, deck - 1), C.steel);
    if (x % 3 === 0 && y < deck - 1) cv.rect(x, y + 1, 1, deck - y - 1, steelD);
  }
}

function drawRoad(cv, rand) {
  // I-80, coast to coast. Shoulder, lanes, dashes.
  cv.rect(0, ROAD, W, 10, '#1f1838');
  cv.rect(0, ROAD, W, 1, C.dusk3);
  cv.rect(0, ROAD + 9, W, 1, C.dusk2);
  for (let x = 2; x < W; x += 10) cv.rect(x, ROAD + 5, 5, 1, C.gold);
  cv.fill(0, ROAD + 10, W, H - ROAD - 10, (x, y) => ((x + y) % 4 === 0 ? '#1b2a2e' : '#141026'));
  // Riverside railing and lamps on the Manhattan side.
  for (let x = 300; x < W; x++) if (x % 2 === 0) cv.px(x, ROAD - 2, C.dusk2);
  cv.rect(300, ROAD - 1, W - 300, 1, C.dusk2);
  for (let x = 312; x < W; x += 26) {
    cv.rect(x, ROAD - 9, 1, 8, C.slate);
    cv.rect(x - 1, ROAD - 10, 3, 1, C.sun);
    cv.px(x - 1, ROAD - 9, C.gold);
    cv.px(x + 1, ROAD - 9, C.gold);
    cv.px(x, ROAD + 1, C.gold);
    cv.px(x - 1, ROAD + 2, C.orange);
    cv.px(x + 1, ROAD + 2, C.orange);
  }
  // Mile marker and an I-80 shield.
  cv.rect(132, ROAD - 9, 1, 8, C.steel);
  const shield = ['.BBBBB.', 'BRRRRRB', 'BBBBBBB', 'BWBWBWB', 'BBBBBBB', '.BBBBB.', '..BBB..'];
  cv.sprite(129, ROAD - 16, shield, { B: C.navy, R: C.red, W: C.cream });
  void rand;
}

function drawArchway(cv) {
  // The Great Platte River Road Archway, spanning I-80 east of Kearney:
  // a timber "covered bridge" between two towers.
  const x0 = 142;
  const x1 = 212;
  const top = 124;
  const bottom = 146;
  const base = ROAD + 9;
  const timber = C.bark;
  for (const tx of [x0, x1 - 9]) {
    cv.rect(tx, top - 8, 9, base - top + 8, '#3a2648');
    cv.rect(tx, top - 8, 1, base - top + 8, C.coral);
    cv.rect(tx + 8, top - 8, 1, base - top + 8, SIL);
    for (let y = top - 4; y < base; y += 5) cv.rect(tx + 1, y, 7, 1, '#2f1f3e');
    cv.poly(
      [
        [tx - 1, top - 8],
        [tx + 4.5, top - 14],
        [tx + 10, top - 8],
      ],
      '#3d2530',
    );
    cv.line(tx - 1, top - 8, tx + 4, top - 13, C.orange);
    cv.rect(tx + 3, top - 4, 3, 3, C.gold);
  }
  cv.rect(x0 + 9, top, x1 - x0 - 18, bottom - top, timber);
  for (let x = x0 + 10; x < x1 - 9; x += 3) cv.rect(x, top + 1, 1, bottom - top - 2, '#6e4632');
  cv.rect(x0 + 9, top, x1 - x0 - 18, 1, C.orange);
  cv.rect(x0 + 9, bottom - 2, x1 - x0 - 18, 2, '#3a2430');
  for (let x = x0 + 13; x < x1 - 12; x += 6) cv.rect(x, top + 8, 3, 2, C.gold);
  cv.rect(x0 + 9, top + 14, x1 - x0 - 18, 1, '#4a2e2a');
  cv.poly(
    [
      [x0 + 8, top],
      [x0 + 20, top - 7],
      [x1 - 20, top - 7],
      [x1 - 8, top],
    ],
    '#3d2530',
  );
  cv.line(x0 + 8, top, x0 + 20, top - 7, C.coral);
  cv.line(x0 + 20, top - 7, x1 - 20, top - 7, C.orange);
}
