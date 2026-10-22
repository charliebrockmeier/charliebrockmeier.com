// Nebraska, west to east: the Platte at sunrise, home, Kearney High, Cash-Wa's
// warehouse, a Buckle store under the Archway over I-80, Lincoln on game day, and
// the Omaha riverfront with Covisum's office. Then fast travel west.
import { C, SKY, ramp } from './lib.mjs';
import { GROUND, LAWN, Layer, WALK, text, textWidth, bricks, windowGrid, tree, tod } from './journey-kit.mjs';

export function nebraska(cv, rand) {
  platte(cv, rand);
  prairie(cv, rand);
  home(cv);
  kearneyHigh(cv, rand);
  cornfield(cv, 652, 692);
  cashWa(cv);
  cornfield(cv, 992, 1076);
  archway(cv);
  buckle(cv);
  // Green guide signs on I-80 east, in miles to each city's downtown: the Archway is at
  // about mile 275 and Lincoln's I-180 exit is 401, a few miles short of downtown; from
  // downtown Lincoln it's about 4 miles back to I-80, then 51 to Omaha's I-480 exit.
  guideSign(cv, 1000, ['LINCOLN', '130']);
  capitol(cv, rand);
  haymarket(cv, rand);
  stadium(cv, rand);
  guideSign(cv, 1478, ['OMAHA', '57']);
  omaha(cv, rand);
  covisum(cv);
  fastTravel(cv, FAST_TRAVEL_SF, ['SAN', 'FRANCISCO'], 'SUMMER 2024', [-10, 60]);
}

/** The fast-travel signpost to San Francisco, past Covisum's office (the overlay's runway lights follow it). */
export const FAST_TRAVEL_SF = 1816;

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
  cv.rect(0, 137, 160, 1, '#4a7a5a');
  // The east bank: prairie grass sloping down to the water.
  for (let y = 136; y < LAWN; y++)
    for (let x = 150; x < 174; x++) if (x > 172 - (y - 136) * 0.15 - (LAWN - y) * 1.3) cv.px(x, y, (x + y) % 3 ? '#c9a26b' : '#a8865e');
  for (let x = 150; x < 174; x += 2) {
    let y = 136;
    while (y < LAWN && cv.get(x, y) !== '#c9a26b' && cv.get(x, y) !== '#a8865e') y++;
    cv.px(x, y - 1, C.gold);
  }
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
  // The school's letters in Bearcat blue and gold.
  cv.rect(571, 120, 18, 9, '#3b54b0');
  cv.rect(571, 120, 18, 1, '#3b5dc9');
  text(cv, 574, 122, 'KHS', '#ffcd75');
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

/** A centered sign line: draws `str` so it's centered on x. */
const centerText = (cv, x, y, str, color) => text(cv, Math.round(x - textWidth(str) / 2), y, str, color);

function cashWa(cv) {
  // Cash-Wa Distributing's warehouse: corrugated metal, the name over the office door,
  // and three loading docks. (The company's own logo couldn't be confirmed, so the
  // sign is just the name.)
  const x0 = 694;
  const x1 = 782;
  const top = 112;
  cv.rect(x0, top, x1 - x0, LAWN - top, '#d6ccb8');
  for (let x = x0 + 1; x < x1; x += 2) cv.rect(x, top + 3, 1, LAWN - top - 3, '#c9bfb0');
  cv.rect(x0 - 1, top - 2, x1 - x0 + 2, 3, '#8a7f80');
  cv.rect(x0 - 1, top - 2, x1 - x0 + 2, 1, '#a89f8c');
  cv.rect(x1 - 2, top + 1, 2, LAWN - top - 1, '#bdb3a0');
  // The sign: the name in red over DISTRIBUTING, on a white panel.
  const sx = x0 + 4;
  cv.rect(sx, top + 4, 53, 16, '#7a2030');
  cv.rect(sx + 1, top + 5, 51, 14, '#f4f4f4');
  centerText(cv, sx + 26.5, top + 7, 'CASH-WA', '#a82a34');
  centerText(cv, sx + 26.5, top + 13, 'DISTRIBUTING', '#3d2f4a');
  // The office door and windows under the sign.
  cv.rect(x0 + 6, 136, 22, 10, '#94b0c2');
  cv.rect(x0 + 6, 136, 22, 1, '#566c86');
  for (let x = x0 + 13; x < x0 + 28; x += 7) cv.rect(x, 136, 1, 10, '#566c86');
  cv.rect(x0 + 34, 134, 9, LAWN - 134, '#566c86');
  cv.rect(x0 + 35, 135, 7, LAWN - 135, '#94b0c2');
  cv.rect(x0 + 38, 135, 1, LAWN - 135, '#566c86');
  // Three roll-up dock doors over a concrete dock, with black bumpers.
  for (let i = 0; i < 3; i++) {
    const dx = x0 + 50 + i * 12;
    cv.rect(dx, 134, 10, 12, '#6e6e80');
    for (let y = 135; y < 146; y += 2) cv.rect(dx, y, 10, 1, '#5a5878');
    cv.rect(dx - 1, 133, 12, 1, '#4a3a5a');
    cv.rect(dx - 1, 140, 1, 4, '#141026');
    cv.rect(dx + 10, 140, 1, 4, '#141026');
  }
  cv.rect(x0 + 47, 146, x1 - x0 - 47, LAWN - 146, '#a99fc4');
  cv.rect(x0 + 47, 146, x1 - x0 - 47, 1, '#c9bfd9');
}

function buckle(cv) {
  // A Buckle store under the Archway (Buckle started in Kearney in 1948 and is still
  // headquartered there): the rounded B monogram and the name on a stone band, then
  // display windows full of denim.
  const cx = 898;
  const x0 = cx - 42;
  const x1 = cx + 42;
  const top = 120;
  cv.rect(x0, top, x1 - x0, LAWN - top, '#e9e0d0');
  cv.rect(x0 - 1, top - 2, x1 - x0 + 2, 2, '#232323');
  cv.rect(x0, top, x1 - x0, 1, '#f4f4f4');
  cv.rect(x1 - 2, top, 2, LAWN - top, '#c9bfb0');
  // The sign: the B monogram in maroon, then BUCKLE in black.
  const B = ['.#########.', '##.....####', '##.....####', '###########', '##.....####', '##.....####', '.#########.'];
  const word = 'BUCKLE';
  const sw = B[0].length + 4 + textWidth(word);
  const sx = Math.round(cx - sw / 2);
  cv.sprite(sx, top + 3, B, { '#': '#821b33' });
  text(cv, sx + B[0].length + 4, top + 4, word, '#141026');
  // Storefront: dark frame, two display windows with folded jeans and tees, a door.
  cv.rect(x0 + 3, 132, x1 - x0 - 6, LAWN - 132, '#232323');
  for (const wx of [x0 + 5, cx + 8]) {
    cv.rect(wx, 134, 29, 14, '#c6e6f2');
    cv.fill(wx, 134, 29, 14, (x, y) => (x - wx + (y - 134) < 9 ? '#ddebef' : null));
    for (let i = 0; i < 4; i++) {
      const px = wx + 2 + i * 7;
      cv.rect(px, 141, 5, 2, i % 2 ? '#3b5dc9' : '#29366f');
      cv.rect(px, 143, 5, 2, i % 2 ? '#29366f' : '#3b5dc9');
      cv.rect(px + 1, 137, 3, 3, ['#f4ecdc', '#e43b44', '#94a0c2', '#141026'][i]);
    }
    cv.rect(wx, 146, 29, 2, '#8a7f80');
  }
  cv.rect(cx - 5, 134, 10, LAWN - 134, '#94b0c2');
  cv.rect(cx, 134, 1, LAWN - 134, '#232323');
  cv.px(cx - 2, 143, '#d6ccb8');
  cv.px(cx + 2, 143, '#d6ccb8');
}

function archway(cv) {
  // The Great Platte River Road Archway: two eight-story towers on either side
  // of I-80, joined by a span built to look like a covered bridge at sunset:
  // weathered-steel trusses over sunset-colored cladding, a trellis along the
  // roof, and Kent Bloomer's aluminum ornaments crowning the towers.
  const towers = [786, 964];
  const tw = 24;
  const top = 46;
  const steel = '#7a4a36';
  const steelD = '#5c3424';
  const steelL = '#a8643e';
  for (const tx of towers) {
    cv.rect(tx, top, tw, GROUND - top, steel);
    cv.rect(tx, top, 2, GROUND - top, steelL);
    cv.rect(tx + tw - 2, top, 2, GROUND - top, steelD);
    for (let y = top + 6; y < GROUND; y += 16) {
      cv.rect(tx, y, tw, 2, steelD);
      cv.line(tx + 2, y + 2, tx + tw - 3, y + 15, steelD);
      cv.line(tx + tw - 3, y + 2, tx + 2, y + 15, steelD);
      cv.rect(tx + 9, y + 6, 6, 4, '#ffcd75');
    }
    cv.rect(tx - 2, top - 2, tw + 4, 2, steelD);
  }
  // Kent Bloomer's aluminum ornaments: a pair of 25-foot wings on each tower, and on
  // the north tower a horse leaping out of them, westward, for the Pony Express.
  for (const tx of towers) wings(cv, tx + tw / 2, top - 3);
  horse(cv, towers[0] + tw / 2 - 19, top - 39);
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

/** Stamp a shape drawn by `draw` (on a scratch layer) onto cv with a one-pixel outline. */
function outlined(cv, w, h, ox, oy, outline, draw) {
  const tmp = new Layer(w, h);
  draw(tmp);
  const on = (x, y) => (tmp.get(x, y) ?? 'none') !== 'none';
  for (let y = -1; y <= h; y++)
    for (let x = -1; x <= w; x++) {
      if (on(x, y)) cv.px(ox + x, oy + y, tmp.get(x, y));
      else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) cv.px(ox + x, oy + y, outline);
    }
}

/** A pair of upswept aluminum wings: a curved leading edge and long feathers behind it. */
function wings(cv, cx, hub) {
  const lit = '#f4f4f4';
  const mid = '#c9cfe0';
  const shade = '#94a0c2';
  outlined(cv, 60, 34, cx - 30, hub - 32, '#6a7494', (t) => {
    const c = 30;
    const b = 32;
    for (const d of [-1, 1]) {
      const X = (dx) => c + d * dx;
      t.poly(
        [
          [X(1), b],
          [X(6), b - 8],
          [X(10), b - 20],
          [X(13), b - 30],
          [X(17), b - 25],
          [X(21), b - 22],
          [X(24), b - 16],
          [X(26), b - 10],
          [X(23), b - 8],
          [X(18), b - 4],
          [X(10), b - 1],
        ],
        mid,
      );
      // Feathers fan back from the leading edge; the edge itself catches the light.
      for (const [ax, ay, ex, ey] of [
        [9, b - 19, 18, b - 24],
        [8, b - 14, 22, b - 19],
        [7, b - 10, 25, b - 12],
        [5, b - 6, 22, b - 7],
        [3, b - 3, 16, b - 3],
      ])
        t.line(X(ax), ay, X(ex), ey, shade);
      t.line(X(1), b, X(6), b - 8, lit);
      t.line(X(6), b - 8, X(10), b - 20, lit);
      t.line(X(10), b - 20, X(13), b - 30, lit);
    }
    t.rect(c - 2, b - 4, 5, 5, mid);
  });
}

/** The horse leaping out of the north tower's wings, westward, in aluminum. */
const HORSE = [
  '.....OO...........................',
  '....OLLO..........................',
  '...OLMMLO.........................',
  '..OLMEMMLO........................',
  '.OLMMMMMMLO.......................',
  'OLMMMOOMMMLO......................',
  'OMMMO..OMMMLOOOOOOOOOO.......OO...',
  '.OOO....OMMMLLLLLLLLLLLOO...OSSO..',
  '........OMMMMMMMMMMMMMMMMOOOSSO...',
  '.......OMMMMMMMMMMMMMMMMMMMLSSO...',
  '.......OMMMMMMMMMMMMMMMMMMMOOO....',
  '......OMMOMMMMMMMMMMMMMMMMMO......',
  '..OOOOMMO.OSSSSSSSSSSSOMMMMO......',
  '.OMMMMMO..OSO.OOOOOOOOOMMMMMO.....',
  'OMMOOOO..OSO.........OOOOSMMMO....',
  'OSO......OO...............OSMMO...',
  '.O.........................OSMMO..',
  '............................OSSO..',
  '.............................OO...',
];

function horse(cv, ox, oy) {
  cv.sprite(ox, oy, HORSE, { O: '#2b2f48', M: '#b8c0d4', L: '#f4f4f4', S: '#8a94b4', E: '#141026' });
}

function guideSign(cv, x, lines) {
  const w = Math.max(...lines.map(textWidth)) + 8;
  cv.rect(x + 6, 124, 2, LAWN - 124, C.steel);
  cv.rect(x + w - 8, 124, 2, LAWN - 124, C.steel);
  cv.rect(x, 108, w, 7 * lines.length + 4, '#257156');
  cv.rect(x + 1, 109, w - 2, 7 * lines.length + 2, '#2f8a5a');
  cv.rect(x + 1, 109, w - 2, 1, C.cream);
  lines.forEach((l, i) => text(cv, x + Math.round((w - textWidth(l)) / 2), 112 + i * 7, l, C.cream));
  // The I-80 shield: a red crown over a blue body, with the number.
  const shield = ['.RRR.RRR.', 'RRRRRRRRR', 'BBBBBBBBB', 'BBBBBBBBB', 'BBBBBBBBB', 'BBBBBBBBB', 'BBBBBBBBB', 'BBBBBBBBB', '.BBBBBBB.', '..BBBBB..'];
  cv.sprite(x + w + 2, 109, shield, { B: '#3b54b0', R: C.red });
  text(cv, x + w + 3, 111, '80', C.cream);
  cv.rect(x + w + 6, 119, 1, LAWN - 119, C.steel);
}

// --- Lincoln -----------------------------------------------------------------

function capitol(cv, rand) {
  // The Nebraska State Capitol: a 400-foot limestone tower over a low, wide base
  // (a cross inside a square). The tower steps back, runs tall window bays up its
  // faces, then carries an octagonal drum, the gold-tiled dome and the Sower.
  const cx = 1132;
  const lime = '#e2c89a';
  const limeL = '#f2e0b8';
  const limeS = '#c4a676';
  const limeD = '#a8885c';
  const bay = '#5a4a6e';
  const bayL = '#7a6a8e';
  // The base: wings out to corner pavilions, a taller center pavilion with the portal.
  const b0 = cx - 58;
  const b1 = cx + 58;
  cv.rect(b0, 124, b1 - b0, LAWN - 124, lime);
  cv.rect(b0, 124, b1 - b0, 1, limeL);
  cv.rect(b0, 127, b1 - b0, 1, limeS);
  for (let x = b0 + 4; x < b1 - 4; x += 5) {
    if (Math.abs(x - cx) < 22) continue;
    cv.rect(x, 131, 2, 15, (x * 7) % 3 ? bay : bayL);
    cv.px(x, 130, limeS);
  }
  cv.rect(b0, 146, b1 - b0, 1, limeS);
  for (const px of [b0, b1 - 12]) {
    cv.rect(px, 120, 12, LAWN - 120, lime);
    cv.rect(px, 120, 12, 1, limeL);
    cv.rect(px + 3, 124, 2, 18, bay);
    cv.rect(px + 7, 124, 2, 18, bay);
    cv.rect(px + 11, 120, 1, LAWN - 120, limeS);
  }
  cv.rect(b1 - 1, 124, 1, LAWN - 124, limeD);
  // Center pavilion: a deep portal of three tall bays, and the steps.
  cv.rect(cx - 22, 112, 45, LAWN - 112, lime);
  cv.rect(cx - 22, 112, 45, 1, limeL);
  cv.rect(cx + 21, 112, 2, LAWN - 112, limeS);
  for (const dx of [-12, -1, 10]) {
    cv.rect(cx + dx, 120, 4, 24, '#4a3a5e');
    cv.rect(cx + dx, 120, 4, 1, limeD);
    cv.px(cx + dx + 1, 119, limeS);
    cv.px(cx + dx + 2, 119, limeS);
  }
  for (let i = 0; i < 4; i++) cv.rect(cx - 16 - i * 2, 144 + i * 2, 33 + i * 4, 2, i % 2 ? limeS : limeL);
  // Tower foot: a broad block that steps back twice.
  cv.rect(cx - 19, 100, 39, 12, lime);
  cv.rect(cx - 19, 100, 39, 1, limeL);
  cv.rect(cx + 18, 100, 2, 12, limeS);
  cv.rect(cx - 16, 94, 33, 6, lime);
  cv.rect(cx - 16, 94, 33, 1, limeL);
  cv.rect(cx + 15, 94, 2, 6, limeS);
  for (const dx of [-13, -7, 6, 12]) cv.rect(cx + dx, 102, 2, 8, bay);
  // The shaft: lit face, shaded side, and four tall window bays between piers.
  const t0 = 36;
  cv.rect(cx - 13, t0, 27, 94 - t0, lime);
  cv.rect(cx - 13, t0, 2, 94 - t0, limeL);
  cv.rect(cx + 10, t0, 4, 94 - t0, limeS);
  cv.rect(cx + 13, t0, 1, 94 - t0, limeD);
  for (const dx of [-9, -4, 1, 6]) {
    cv.rect(cx + dx, t0 + 8, 3, 94 - t0 - 12, bay);
    cv.rect(cx + dx, t0 + 8, 1, 94 - t0 - 12, bayL);
    for (let y = t0 + 14; y < 90; y += 9) cv.rect(cx + dx, y, 3, 1, limeS);
  }
  // Corner piers rise past the parapet as buttresses around the drum.
  cv.rect(cx - 13, t0 - 4, 27, 4, lime);
  cv.rect(cx - 13, t0 - 4, 27, 1, limeL);
  for (const dx of [-13, 10]) {
    cv.rect(cx + dx, t0 - 9, 4, 5, dx < 0 ? limeL : limeS);
    cv.px(cx + dx + 1, t0 - 10, dx < 0 ? limeL : limeS);
    cv.px(cx + dx + 2, t0 - 10, dx < 0 ? limeL : limeS);
  }
  // The octagonal drum with its thunderbird frieze, then the dome and the lantern.
  const d0 = t0 - 12;
  cv.rect(cx - 9, d0, 19, 9, lime);
  cv.rect(cx - 9, d0, 2, 9, limeL);
  cv.rect(cx + 7, d0, 3, 9, limeS);
  for (const dx of [-6, -2, 2, 5]) cv.rect(cx + dx, d0 + 3, 2, 5, bay);
  cv.rect(cx - 9, d0 + 1, 19, 1, C.teal);
  for (let x = cx - 8; x < cx + 10; x += 3) cv.px(x, d0 + 1, C.red);
  cv.rect(cx - 10, d0 - 1, 21, 1, limeS);
  for (let y = 0; y < 9; y++) {
    const half = Math.round(Math.sqrt(81 - (y - 0.5) * (y - 0.5)) * 1.05);
    const yy = d0 - 2 - y;
    cv.rect(cx - half, yy, half * 2 + 1, 1, C.gold);
    cv.rect(cx - half, yy, Math.max(1, Math.round(half * 0.6)), 1, C.sun);
    cv.rect(cx + half - Math.round(half * 0.4), yy, Math.round(half * 0.4) + 1, 1, C.orange);
    for (let x = cx - half + ((y & 1) ? 1 : 0); x <= cx + half; x += 3) cv.px(x, yy, y > 2 ? '#e0a040' : C.gold);
  }
  cv.rect(cx - 1, d0 - 12, 3, 2, C.gold);
  cv.rect(cx - 2, d0 - 13, 5, 1, C.orange);
  // The Sower, in bronze, striding west and casting seed.
  cv.sprite(cx - 3, d0 - 22, ['...KK.', '...KK.', '..KKK.', '.KKKKK', 'K.KKK.', '..KKK.', '..KKK.', '..K.K.', '.K..K.'], { K: '#4a3a3a' });
  cv.px(cx - 4, d0 - 18, '#4a3a3a');
  // Elms on the grounds.
  tree(cv, b0 - 8, LAWN, 7);
  rand();
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
  // Memorial Stadium on game day. The 1923 stadium's red brick and limestone, tall
  // arched windows between pilasters, MEMORIAL STADIUM across the frieze and an
  // inscription over the gate; over the wall, the sea of red in the stands, the
  // north end zone's video board, and the tall West Stadium with its suites and
  // press box. Light banks and the balloons are in the overlay.
  const x0 = 1284;
  const x1 = 1460;
  const stone = '#e8dcc0';
  const stoneS = '#bfae8e';
  // The far stands: rows of red, rising from the wall to the rim.
  cv.poly([[x0 + 4, 106], [x0 + 18, 80], [x1 - 60, 80], [x1 - 60, 106]], '#a82a34');
  for (let y = 82; y < 106; y++)
    for (let x = x0 + 4; x < x1 - 60; x++) {
      if (cv.get(x, y) !== '#a82a34') continue;
      const r = rand();
      cv.px(x, y, y % 3 === 0 ? '#7a2030' : r > 0.9 ? C.cream : r > 0.55 ? '#e43b44' : r > 0.25 ? '#c83040' : '#a82a34');
    }
  cv.rect(x0 + 18, 78, x1 - 78 - x0, 2, '#d6ccb8');
  cv.rect(x0 + 18, 77, x1 - 78 - x0, 1, '#f4ecdc');
  // The north end zone video board on its legs (the overlay plays the replays).
  const vb = x0 + 12;
  cv.rect(vb + 8, 70, 2, 9, '#3d2f4a');
  cv.rect(vb + 36, 70, 2, 9, '#3d2f4a');
  cv.rect(vb, 46, 46, 24, '#141026');
  cv.rect(vb + 2, 48, 42, 15, '#1b2448');
  text(cv, vb + 4, 53, 'GO BIG RED', C.cream);
  cv.rect(vb + 2, 64, 42, 5, '#e43b44');
  text(cv, vb + 9, 64, 'HUSKERS', C.cream);
  // The West Stadium: suites and the press box stacked high over the old wall.
  const wx = x1 - 64;
  cv.rect(wx, 56, 64, 50, '#c9bfb0');
  cv.rect(wx, 56, 64, 1, '#f4ecdc');
  cv.rect(wx + 62, 56, 2, 50, '#8a7f80');
  cv.rect(wx + 2, 60, 60, 8, '#29366f');
  for (let x = wx + 3; x < wx + 61; x += 3) cv.rect(x, 61, 2, 6, (x * 3) % 7 < 2 ? '#ffe9a8' : '#73c6f7');
  cv.rect(wx, 69, 64, 2, '#e43b44');
  text(cv, wx + 16, 72, 'NEBRASKA', '#7a2030');
  for (const sy of [80, 90]) {
    cv.rect(wx + 2, sy, 60, 6, '#3b4a7a');
    for (let x = wx + 3; x < wx + 61; x += 4) cv.rect(x, sy + 1, 3, 4, (x + sy) % 3 ? '#94b0e0' : '#ffe9a8');
    cv.rect(wx + 2, sy + 6, 60, 1, '#8a7f80');
  }
  for (let x = wx + 2; x < wx + 62; x += 10) cv.rect(x, 78, 2, 26, '#d6ccb8');
  // Light banks on the roof and a light standard over the north stands.
  for (const lx of [wx + 8, wx + 30, wx + 52]) {
    cv.rect(lx, 48, 1, 8, '#566c86');
    cv.rect(lx - 4, 44, 9, 5, '#3d2f4a');
    for (let i = 0; i < 4; i++) cv.px(lx - 3 + i * 2, 46, '#c9cfe0');
  }
  cv.rect(x0 + 2, 50, 2, 56, '#566c86');
  cv.rect(x0 - 3, 44, 12, 7, '#3d2f4a');
  for (let i = 0; i < 5; i++) cv.px(x0 - 2 + i * 2, 47, '#c9cfe0');
  // The 1923 wall: brick between a limestone frieze and a limestone base.
  bricks(cv, x0, 106, x1 - x0, LAWN - 106, '#a8483e', '#843a32');
  cv.rect(x0 - 2, 104, x1 - x0 + 4, 2, stoneS);
  cv.rect(x0 - 2, 103, x1 - x0 + 4, 1, stone);
  cv.rect(x0, 106, x1 - x0, 9, stone);
  cv.rect(x0, 114, x1 - x0, 1, stoneS);
  const title = 'MEMORIAL STADIUM';
  text(cv, Math.round((x0 + x1 - textWidth(title)) / 2), 108, title, '#7a2030');
  cv.rect(x0, LAWN - 4, x1 - x0, 4, stone);
  cv.rect(x0, LAWN - 4, x1 - x0, 1, '#f4ecdc');
  // Tall arched windows between pilasters, a grand gate in the middle.
  const gate = Math.round((x0 + x1) / 2);
  for (let x = x0 + 4; x < x1 - 8; x += 12) {
    if (Math.abs(x + 4 - gate) < 14) continue;
    cv.rect(x - 2, 115, 2, LAWN - 119, stone);
    cv.rect(x - 3, 115, 4, 1, stoneS);
    cv.rect(x + 1, 121, 7, 25, '#3d2030');
    cv.rect(x + 2, 119, 5, 2, '#3d2030');
    cv.rect(x + 3, 118, 3, 1, '#3d2030');
    cv.rect(x + 1, 120, 1, 1, stone);
    cv.rect(x + 7, 120, 1, 1, stone);
    cv.rect(x + 2, 118, 1, 1, stone);
    cv.rect(x + 6, 118, 1, 1, stone);
    cv.rect(x + 3, 117, 3, 1, stone);
    cv.rect(x + 4, 121, 1, 25, '#5c3040');
    cv.rect(x + 1, 132, 7, 1, '#5c3040');
    cv.fill(x + 1, 121, 7, 25, (px, py) => ((px * 13 + py * 7) % 17 === 0 ? '#e43b44' : (px * 5 + py * 11) % 23 === 0 ? '#ffcd75' : null));
    cv.rect(x + 1, 146, 7, 1, stone);
  }
  // The gate: a limestone surround, the inscription panel above, iron gates.
  cv.rect(gate - 12, 115, 24, LAWN - 119, stone);
  cv.rect(gate - 12, 115, 24, 1, '#f4ecdc');
  cv.rect(gate - 10, 116, 20, 7, '#d6c8a8');
  for (const [y, w] of [
    [117, 16],
    [119, 18],
    [121, 12],
  ])
    for (let x = gate - w / 2; x < gate + w / 2; x += 2) cv.px(x, y, '#8a7a6a');
  cv.rect(gate - 8, 128, 16, LAWN - 132, '#2b1828');
  cv.rect(gate - 6, 126, 12, 2, '#2b1828');
  cv.rect(gate - 4, 125, 8, 1, '#2b1828');
  for (let x = gate - 7; x < gate + 8; x += 2) cv.rect(x, 128, 1, LAWN - 132, '#566c86');
  cv.rect(gate - 8, 134, 16, 1, '#566c86');
  // The big red N flying out front.
  cv.rect(1468, 96, 1, LAWN - 96, C.steel);
  cv.px(1468, 95, C.gold);
}

// --- Omaha -------------------------------------------------------------------

function omaha(cv, rand) {
  // The Missouri River behind a riverfront lawn, crossed by the Bob Kerrey
  // pedestrian bridge: a white deck on two pylons with fans of cables.
  const river = ['#29366f', '#3b5dc9', '#41a6f6', '#94b0c2'];
  // Grassy banks slope down to the water at both ends, so the river bends away.
  const bank = (x, y) => x < 1508 + (LAWN - y) * 0.9 || x > 1764 - (LAWN - y) * 0.9;
  for (let y = 124; y < LAWN; y++)
    for (let x = 1508; x < 1764; x++) {
      if (bank(x, y)) {
        const edge = !bank(x + 1, y) || !bank(x - 1, y) || !bank(x, y - 1);
        cv.px(x, y, edge ? '#a7f070' : (x + y) % 4 ? '#38b764' : '#257156');
        continue;
      }
      const t = 0.7 - (y - 124) * 0.02 + (Math.sin(x * 0.3 + y) > 0.8 ? 0.15 : 0);
      cv.px(x, y, ramp(river, y % 2 ? t : t - 0.12, x, y));
    }
  cv.rect(1534, 123, 205, 1, '#5a8a7a');
  for (const [x, w] of [
    [1514, 10],
    [1744, 12],
  ]) {
    cv.disc(x + w / 2, LAWN - 6, 6, '#257156');
    cv.disc(x + w / 2 - 2, LAWN - 8, 3, '#38b764');
  }
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
  for (const x of [1528, 1612, 1736]) tree(cv, x, LAWN, 6, ['#2f6a4a', '#38b764', '#a7f070']);
  for (const x of [1520, 1756]) {
    cv.rect(x - 2, 121, 5, LAWN - 121, '#c9c3d6');
    cv.rect(x - 2, 121, 5, 1, '#f4ecdc');
  }
  for (const x of [1566, 1652, 1736]) {
    cv.rect(x, 136, 1, 16, '#566c86');
    cv.rect(x - 1, 134, 3, 2, C.sun);
  }
  cv.rect(1640, 146, 12, 2, C.bark);
  cv.rect(1641, 148, 1, 4, C.bark);
  cv.rect(1650, 148, 1, 4, C.bark);
  rand();
}

function covisum(cv) {
  // Covisum's office on the riverfront: a glass box with the name on top. (The company's
  // own logo couldn't be confirmed, so the sign is just the name.)
  const x0 = 1762;
  const x1 = 1804;
  const top = 108;
  cv.rect(x0, top, x1 - x0, LAWN - top, '#8a94b4');
  cv.rect(x0, top, 2, LAWN - top, '#b8c0d4');
  cv.rect(x1 - 2, top, 2, LAWN - top, '#6a7494');
  cv.rect(x0 - 1, top - 2, x1 - x0 + 2, 2, '#4a5a72');
  for (let y = top + 14; y < LAWN - 12; y += 7) {
    cv.rect(x0 + 3, y, x1 - x0 - 6, 5, '#c6e6f2');
    cv.fill(x0 + 3, y, x1 - x0 - 6, 5, (x, yy) => ((x + yy) % 9 < 2 ? '#e9edf7' : null));
    for (let x = x0 + 9; x < x1 - 3; x += 6) cv.rect(x, y, 1, 5, '#566c86');
  }
  // The sign: COVISUM in white on teal.
  cv.rect(x0 + 4, top + 3, x1 - x0 - 8, 9, '#1c4a43');
  cv.rect(x0 + 4, top + 3, x1 - x0 - 8, 1, '#257156');
  centerText(cv, (x0 + x1) / 2, top + 5, 'COVISUM', '#ffffff');
  // The lobby doors.
  cv.rect(x0 + 15, LAWN - 10, 12, 10, '#ffe9a8');
  cv.rect(x0 + 21, LAWN - 10, 1, 10, '#566c86');
  cv.rect(x0 + 13, LAWN - 12, 16, 2, '#4a5a72');
}

export function fastTravel(cv, x, lines, sub, [r0, r1] = [-20, 100]) {
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
  for (let i = x + r0; i < x + r1; i += 10) cv.rect(i, LAWN - 2, 2, 2, '#73eff7');
}
