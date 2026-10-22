// Nebraska, west to east: the Platte at sunrise, home, Kearney High, the Archway
// over I-80, Lincoln on game day, and the Omaha riverfront. Then fast travel west.
import { C, SKY, ramp } from './lib.mjs';
import { LAWN, WALK, text, textWidth, bricks, windowGrid, tree, tod } from './journey-kit.mjs';

export function nebraska(cv, rand) {
  platte(cv, rand);
  prairie(cv, rand);
  home(cv);
  kearneyHigh(cv, rand);
  cornfield(cv, 652, 784);
  cornfield(cv, 992, 1076);
  archway(cv);
  guideSign(cv, 1000, ['LINCOLN', '130']);
  capitol(cv, rand);
  haymarket(cv, rand);
  stadium(cv, rand);
  guideSign(cv, 1478, ['OMAHA', '57']);
  omaha(cv, rand);
  fastTravel(cv, 1772, ['SAN', 'FRANCISCO'], 'SUMMER 2024');
}

// --- Kearney -----------------------------------------------------------------

function platte(cv, rand) {
  // A concrete grain elevator on the far bank, then the river at sunrise.
  const ex = 38;
  for (let i = 0; i < 4; i++) {
    const sx = ex + i * 9;
    cv.rect(sx, 92, 9, 48, '#c9bfd9');
    cv.rect(sx + 7, 92, 2, 48, '#a99fc4');
    cv.rect(sx + 1, 90, 7, 2, '#c9bfd9');
    cv.rect(sx, 92, 1, 48, '#ffe9a8');
  }
  cv.rect(ex + 10, 66, 16, 26, '#bdb3db');
  cv.rect(ex + 10, 66, 1, 26, '#ffe9a8');
  cv.rect(ex + 24, 66, 2, 26, '#94a0c2');
  cv.rect(ex + 8, 63, 20, 3, '#94a0c2');
  cv.rect(ex + 14, 58, 8, 5, '#bdb3db');
  cv.rect(ex + 15, 70, 3, 3, '#5a4a6e');
  cv.line(ex + 26, 70, ex + 52, 112, '#94a0c2');
  cv.line(ex + 26, 71, ex + 52, 113, '#94a0c2');
  // Cottonwoods along the far bank.
  for (const [x, r] of [
    [6, 9],
    [92, 8],
    [120, 10],
    [150, 7],
  ])
    tree(cv, x, 140, r, ['#2f6a4a', '#38b764', '#a7f070']);
  // The river: braided channels and sandbars, catching the sunrise.
  const water = ['#94b0c2', '#b8d4e0', '#ffe9a8', '#ffcd75'];
  for (let y = 138; y < LAWN; y++)
    for (let x = 0; x < 172; x++) {
      const t = 0.85 - Math.abs(x - 70) / 200 - (y - 138) * 0.03 + (Math.sin(x * 0.45 + y * 1.3) > 0.75 ? 0.1 : 0);
      cv.px(x, y, ramp(water, y % 2 ? t : t - 0.15, x, y));
    }
  cv.rect(0, 137, 172, 1, '#4a7a5a');
  for (const [x, w, y] of [
    [8, 30, 144],
    [60, 36, 147],
    [116, 26, 143],
  ]) {
    cv.rect(x, y, w, 2, '#d8b98a');
    cv.rect(x + 2, y - 1, w - 4, 1, '#e9d0a8');
  }
  // Sandhill cranes standing in the shallows (more fly over in the overlay).
  const crane = ['.R.', 'KK.', '.K.', '.K.', 'KKK', 'KKKK', '.KK.', '.K.K', '.K.K'];
  for (const [x, y] of [
    [12, 134],
    [20, 135],
    [30, 134],
    [64, 138],
    [74, 137],
    [86, 138],
    [120, 133],
    [130, 134],
  ])
    cv.sprite(x, y, crane, { K: '#4a5a72', R: C.red });
  rand();
}

function prairie(cv, rand) {
  // Tall grass, round hay bales, a split-rail fence and a windmill.
  for (let x = 172; x < 344; x++) {
    const h = 9 + Math.round(3 * Math.sin(x / 7) + 2 * Math.sin(x / 2.3));
    for (let y = LAWN - h; y < LAWN; y++) {
      const tip = y === LAWN - h;
      cv.px(x, y, tip ? (x % 3 ? C.gold : C.orange) : (x + y) % 3 ? '#c9a26b' : '#a8865e');
    }
  }
  for (const bx of [196, 300]) {
    cv.disc(bx, LAWN - 7, 7, '#c9a26b');
    cv.disc(bx, LAWN - 7, 5, '#d8b98a');
    cv.disc(bx, LAWN - 7, 2, '#a8865e');
  }
  for (let x = 176; x < 344; x += 16) {
    cv.rect(x, LAWN - 14, 2, 14, C.bark);
    cv.px(x, LAWN - 15, C.brown);
  }
  cv.rect(176, LAWN - 12, 168, 1, C.brown);
  cv.rect(176, LAWN - 7, 168, 1, C.brown);
  cv.sprite(240, LAWN - 19, ['.KK', 'KYY', '.YK'], { K: C.bark, Y: C.gold });
  const wx = 256;
  const wy = 86;
  cv.line(wx - 1, wy + 3, wx - 9, LAWN - 1, '#566c86');
  cv.line(wx + 1, wy + 3, wx + 9, LAWN - 1, '#566c86');
  for (let y = wy + 10; y < LAWN; y += 10) {
    const half = 1 + Math.round(((y - wy) / (LAWN - wy)) * 8);
    cv.line(wx - half, y, wx + half, y, '#566c86');
    cv.line(wx - half, y, wx + half, Math.min(y + 9, LAWN - 1), '#94a0c2');
  }
  cv.rect(wx + 2, wy - 1, 10, 2, '#566c86');
  cv.rect(wx + 10, wy - 4, 3, 8, '#94a0c2');
  rand();
}

function home(cv) {
  // A 2000s ranch: three-car garage with a hoop, a porch gable, stone wainscot.
  const x0 = 344;
  const x1 = 456;
  const eave = 120;
  const trim = '#f4ecdc';
  cv.rect(x0, eave, x1 - x0, LAWN - eave, '#d2b48a');
  for (let y = eave + 2; y < LAWN; y += 3) cv.rect(x0, y, x1 - x0, 1, '#b8966a');
  cv.rect(x0, eave, x1 - x0, 2, '#8a6a4a');
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
  cv.fill(x0 + 1, LAWN, 46, 14, (x, y) => ((x + y) % 9 === 0 ? '#c9c3d6' : '#ddd6e6'));
  for (const [sx, r] of [
    [mx + 2, 4],
    [mx + 15, 3],
    [x1 - 6, 4],
  ]) {
    cv.disc(sx, LAWN - 3, r, '#257156');
    cv.disc(sx - 1, LAWN - 4, r - 2, '#38b764');
  }
  tree(cv, 476, LAWN, 14);
  cv.rect(337, 144, 1, 10, C.bark);
  cv.rect(334, 140, 7, 4, '#2b2150');
  cv.px(341, 139, C.red);
}

function kearneyHigh(cv, rand) {
  const x0 = 516;
  const x1 = 648;
  const top = 108;
  bricks(cv, x0, top, x1 - x0, LAWN - top, '#9a4a3e', '#7a3a32');
  cv.rect(x0 - 2, top - 3, x1 - x0 + 4, 3, '#5c2e2e');
  cv.rect(x0 - 2, top - 3, x1 - x0 + 4, 1, '#8a4a44');
  for (const wy of [114, 130]) {
    for (let x = x0 + 5; x < x1 - 10; x += 12) {
      if (x > 566 && x < 592) continue;
      cv.rect(x, wy, 9, 10, '#f4ecdc');
      cv.rect(x + 1, wy + 1, 7, 8, rand() > 0.5 ? '#94b0c2' : '#c6e6f2');
      cv.rect(x + 4, wy + 1, 1, 8, '#f4ecdc');
    }
  }
  cv.rect(568, 118, 24, LAWN - 118, '#7a3a32');
  cv.rect(570, 134, 20, LAWN - 134, '#c6e6f2');
  cv.rect(579, 134, 2, LAWN - 134, '#566c86');
  cv.rect(566, 131, 28, 3, '#3d2f4a');
  text(cv, 574, 122, 'KHS', C.cream);
  cv.rect(622, 70, 1, LAWN - 70, C.steel);
  cv.px(622, 69, C.gold);
  cv.rect(524, 134, 34, 14, '#2b2150');
  cv.rect(525, 135, 32, 12, '#141026');
  text(cv, 528, 138, 'GO CATS', C.gold);
  cv.rect(530, 148, 2, 4, '#566c86');
  cv.rect(550, 148, 2, 4, '#566c86');
  // A tennis racket and ball by the flagpole: state medal, varsity tennis.
  cv.sprite(626, 136, ['.KKK.', 'KWKWK', 'KKWKK', 'KWKWK', '.KKK.', '..B..', '..B..', '..B..', '..B..'], { K: C.cream, W: '#566c86', B: C.bark });
  cv.disc(634, 149, 1, C.lime);
  for (let x = x0 + 2; x < x1; x += 9) {
    if (x > 564 && x < 594) continue;
    cv.disc(x, LAWN - 2, 3, '#257156');
    cv.px(x - 1, LAWN - 4, '#38b764');
  }
}

function cornfield(cv, xa, xb) {
  for (let x = xa; x < xb; x++) {
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
  // The Great Platte River Road Archway: two eight-story towers on either side
  // of I-80, joined by a span built to look like a covered bridge at sunset:
  // weathered-steel trusses over sunset-colored cladding, a trellis along the
  // roof, and wing ornaments crowning both towers.
  const towers = [786, 964];
  const tw = 24;
  const top = 46;
  const steel = '#7a4a36';
  const steelD = '#5c3424';
  const steelL = '#a8643e';
  for (const tx of towers) {
    cv.rect(tx, top, tw, 180 - top, steel);
    cv.rect(tx, top, 2, 180 - top, steelL);
    cv.rect(tx + tw - 2, top, 2, 180 - top, steelD);
    for (let y = top + 6; y < 180; y += 16) {
      cv.rect(tx, y, tw, 2, steelD);
      cv.line(tx + 2, y + 2, tx + tw - 3, y + 15, steelD);
      cv.line(tx + tw - 3, y + 2, tx + 2, y + 15, steelD);
      cv.rect(tx + 9, y + 6, 6, 4, '#ffcd75');
    }
    // Wings: aluminum ornaments sweeping up and out from the tower top.
    const cx = tx + tw / 2;
    for (const d of [-1, 1]) {
      cv.poly(
        [
          [cx, top - 2],
          [cx + d * 6, top - 2],
          [cx + d * 22, top - 30],
          [cx + d * 17, top - 28],
          [cx + d * 12, top - 18],
          [cx + d * 2, top - 10],
        ],
        '#c9cfe0',
      );
      for (let k = 1; k <= 4; k++) cv.line(cx + d * 2, top - 3, cx + d * (6 + k * 4), top - 8 - k * 5, '#94a0c2');
      cv.line(cx + d * 6, top - 2, cx + d * 22, top - 30, '#f4f4f4');
    }
    cv.rect(cx - 2, top - 10, 4, 10, '#94a0c2');
    cv.rect(tx - 2, top - 2, tw + 4, 2, steelD);
  }
  // The covered-bridge span: an arched roof over sunset bands, steel truss on top.
  const x0 = towers[0] + tw;
  const x1 = towers[1];
  const bottom = 112;
  const roofY = (x) => Math.round(78 - Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 18);
  for (let x = x0; x < x1; x++) {
    const ry = roofY(x);
    for (let y = ry; y < bottom; y++) {
      const t = (y - ry) / (bottom - ry);
      cv.px(x, y, t < 0.3 ? '#ffcd75' : t < 0.55 ? '#f7a35c' : t < 0.8 ? '#ef7d57' : '#b8405e');
    }
    cv.px(x, ry - 1, '#4a2c2a');
    cv.px(x, ry - 2, (x - x0) % 4 === 0 ? '#c9cfe0' : null);
  }
  // Pratt truss in weathered steel across the sunset.
  for (let x = x0; x <= x1; x += 14) {
    cv.line(x, roofY(Math.min(x, x1 - 1)), x, bottom, '#4a2c2a');
    if (x + 14 <= x1) cv.line(x, bottom - 1, x + 14, roofY(Math.min(x + 14, x1 - 1)), '#4a2c2a');
  }
  cv.rect(x0, bottom - 3, x1 - x0, 3, '#4a2c2a');
  cv.rect(x0, bottom, x1 - x0, 2, steelD);
  // The trellis along the roofline.
  for (let x = x0 + 2; x < x1; x += 4) cv.line(x, roofY(x) - 2, x + 2, roofY(x) - 5, '#c9cfe0');
}

function guideSign(cv, x, lines) {
  const w = Math.max(...lines.map(textWidth)) + 8;
  cv.rect(x + 6, 124, 2, LAWN - 124, C.steel);
  cv.rect(x + w - 8, 124, 2, LAWN - 124, C.steel);
  cv.rect(x, 108, w, 7 * lines.length + 4, '#257156');
  cv.rect(x + 1, 109, w - 2, 7 * lines.length + 2, '#2f8a5a');
  cv.rect(x + 1, 109, w - 2, 1, C.cream);
  lines.forEach((l, i) => text(cv, x + Math.round((w - textWidth(l)) / 2), 112 + i * 7, l, C.cream));
  const shield = ['.BBBBB.', 'BRRRRRB', 'BBBBBBB', 'BWBWBWB', 'BBBBBBB', '.BBBBB.', '..BBB..'];
  cv.sprite(x + w + 3, 112, shield, { B: C.navy, R: C.red, W: C.cream });
  cv.rect(x + w + 6, 119, 1, LAWN - 119, C.steel);
}

// --- Lincoln -----------------------------------------------------------------

function capitol(cv, rand) {
  const cx = 1132;
  const lime = '#e2c89a';
  const limeS = '#bfa070';
  cv.rect(cx - 44, 126, 89, LAWN - 126, lime);
  cv.rect(cx - 44, 126, 89, 2, limeS);
  for (let x = cx - 40; x < cx + 42; x += 6) cv.rect(x, 131, 3, 14, rand() > 0.7 ? C.gold : '#7a6a8a');
  cv.rect(cx + 43, 126, 2, LAWN - 126, '#8a6a5a');
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
  tree(cv, cx - 52, LAWN, 6);
  tree(cv, cx + 54, LAWN, 7);
}

function haymarket(cv, rand) {
  // Brick warehouses in the Haymarket, a painted sign and string lights (overlay).
  bricks(cv, 1194, 104, 38, LAWN - 104, '#8a4a3a', '#6e3a30');
  bricks(cv, 1232, 114, 32, LAWN - 114, '#7a3e34', '#5c2e28');
  cv.rect(1192, 101, 42, 3, '#4a2a2a');
  cv.rect(1230, 111, 36, 3, '#4a2a2a');
  for (const [x, y, w, h] of [
    [1198, 124, 30, 22],
    [1236, 128, 24, 18],
  ])
    for (let i = x; i < x + w; i += 8) {
      cv.rect(i, y, 5, h - 6, rand() > 0.4 ? C.gold : '#2b2150');
      cv.rect(i, y - 2, 5, 2, '#d6ccb8');
    }
  cv.rect(1195, 108, 37, 9, '#5c2e28');
  text(cv, 1196, 110, 'HAYMARKET', C.cream);
  cv.rect(1196, 140, 34, 12, '#2b2150');
  cv.rect(1236, 142, 24, 10, '#2f6a4a');
}

function stadium(cv, rand) {
  // Memorial Stadium on game day: brick arches, a red upper deck, light towers.
  const x0 = 1284;
  const x1 = 1460;
  cv.poly(
    [
      [x0 + 6, 104],
      [x0 + 22, 84],
      [x1 - 22, 84],
      [x1 - 6, 104],
    ],
    '#b8303a',
  );
  for (let y = 86; y < 104; y += 2)
    for (let x = x0 + 8; x < x1 - 8; x++) {
      const inside = x > x0 + 6 + (104 - y) * 0.8 && x < x1 - 6 - (104 - y) * 0.8;
      if (!inside) continue;
      const r = rand();
      cv.px(x, y, r > 0.86 ? C.cream : r > 0.6 ? '#e43b44' : '#a82a34');
    }
  cv.rect(1346, 74, 54, 10, '#d6ccb8');
  cv.rect(1348, 76, 50, 5, '#29366f');
  for (let x = 1350; x < 1396; x += 4) cv.rect(x, 77, 2, 3, '#73eff7');
  bricks(cv, x0, 104, x1 - x0, LAWN - 104, '#9a4a3e', '#843e34');
  cv.rect(x0, 104, x1 - x0, 2, '#c45a4a');
  for (let x = x0 + 6; x < x1 - 8; x += 14) {
    cv.rect(x, 116, 8, LAWN - 116, '#3d2030');
    cv.rect(x + 1, 114, 6, 2, '#3d2030');
    cv.rect(x + 2, 113, 4, 1, '#3d2030');
    cv.fill(x, 118, 8, LAWN - 118, (px, py) => ((px + py) % 5 === 0 ? '#e43b44' : null));
  }
  cv.rect(1356, 107, 32, 8, '#e43b44');
  cv.rect(1356, 115, 32, 1, '#a82a34');
  text(cv, 1366, 109, 'GBR', C.cream);
  for (const lx of [x0 + 2, x1 - 4]) {
    cv.rect(lx, 56, 2, 48, '#566c86');
    cv.rect(lx - 5, 50, 12, 7, '#3d2f4a');
  }
  cv.rect(1468, 96, 1, LAWN - 96, C.steel);
  cv.rect(1469, 97, 16, 12, '#e43b44');
  cv.sprite(1473, 99, ['KK..K', 'KKK.K', 'K.KKK', 'K..KK', 'K...K', 'K...K', 'K...K', 'K...K'], { K: C.cream });
}

// --- Omaha -------------------------------------------------------------------

function omaha(cv, rand) {
  // The Missouri River behind a riverfront lawn, crossed by the Bob Kerrey
  // pedestrian bridge: a white deck on two pylons with fans of cables.
  const river = ['#29366f', '#3b5dc9', '#41a6f6', '#94b0c2'];
  for (let y = 124; y < LAWN; y++)
    for (let x = 1508; x < 1764; x++) {
      const t = 0.7 - (y - 124) * 0.02 + (Math.sin(x * 0.3 + y) > 0.8 ? 0.15 : 0);
      cv.px(x, y, ramp(river, y % 2 ? t : t - 0.12, x, y));
    }
  cv.rect(1508, 123, 256, 1, '#5a8a7a');
  const deck = (x) => Math.round(118 + Math.sin((x - 1520) / 40) * 2);
  for (const px of [1590, 1690]) {
    cv.rect(px - 2, 46, 4, LAWN - 46, '#f4ecdc');
    cv.rect(px + 1, 46, 1, LAWN - 46, '#c9c3d6');
    cv.rect(px - 3, 44, 6, 3, '#f4ecdc');
    for (let k = 1; k <= 6; k++) {
      cv.line(px, 50 + k * 3, px - k * 9, deck(px - k * 9), '#d6dbe8');
      cv.line(px, 50 + k * 3, px + k * 9, deck(px + k * 9), '#d6dbe8');
    }
  }
  for (let x = 1520; x < 1756; x++) {
    const y = deck(x);
    cv.rect(x, y, 1, 3, '#f4ecdc');
    cv.px(x, y + 3, '#94a0c2');
    if (x % 3 === 0) cv.px(x, y - 1, '#c9c3d6');
  }
  // Riverfront park: lamps, benches and trees in front.
  for (const x of [1530, 1612, 1714]) tree(cv, x, LAWN, 6, ['#2f6a4a', '#38b764', '#a7f070']);
  for (const x of [1566, 1652, 1736]) {
    cv.rect(x, 136, 1, 16, '#566c86');
    cv.rect(x - 1, 134, 3, 2, C.sun);
  }
  cv.rect(1640, 146, 12, 2, C.bark);
  cv.rect(1641, 148, 1, 4, C.bark);
  cv.rect(1650, 148, 1, 4, C.bark);
  rand();
}

export function fastTravel(cv, x, lines, sub) {
  // A game-style fast-travel signpost: the walk jumps across the country here.
  cv.rect(x + 18, 112, 3, LAWN - 112, C.bark);
  cv.rect(x, 92, 58, 22, '#2b2150');
  cv.rect(x + 1, 93, 56, 20, '#141026');
  cv.rect(x + 1, 93, 56, 1, '#73eff7');
  text(cv, x + 4, 95, 'FAST TRAVEL', '#73eff7');
  lines.forEach((l, i) => text(cv, x + 4, 102 + i * 6, `> ${l}`, C.cream));
  cv.rect(x + 4, 116, 50, 9, C.gold);
  text(cv, x + 6, 118, sub, '#141026');
  // Runway lights along the lawn.
  for (let i = x - 20; i < x + 100; i += 10) cv.rect(i, LAWN - 2, 2, 2, '#73eff7');
}
