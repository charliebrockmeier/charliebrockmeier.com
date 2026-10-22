// New York: Union Square at blue hour (Washington on horseback, the Greenmarket,
// the Vantager office, the subway), the Flatiron and the Empire State Building,
// a hot dog cart and a Con Ed steam stack, the walk-up, then 7 World Trade.
import { C } from './lib.mjs';
import { LAWN, WALK, STREET, text, textWidth, bricks, windowGrid, tree } from './journey-kit.mjs';
import { vantagerMark } from '../../src/data/journey.ts';

export const WTC7 = { x: 3990, w: 100, top: 30 };
export const SUBWAY = { x0: 3060, x1: 4380, platform: [3330, 3476] };

export function newYork(cv, rand) {
  unionSquare(cv, rand);
  flatiron(cv, rand);
  empireState(cv, rand);
  streetLife(cv);
  walkUp(cv, rand);
  downtown(cv, rand);
}

function unionSquare(cv, rand) {
  // The park: trees, lamps and benches.
  for (const x of [3068, 3092, 3118, 3274, 3298]) tree(cv, x, LAWN, 9, ['#1c4a43', '#257156', '#38b764']);
  for (const x of [3080, 3176, 3290]) {
    cv.rect(x, 128, 1, 24, '#3d4a3a');
    cv.rect(x - 2, 125, 5, 3, '#2b3a2b');
    cv.rect(x - 1, 126, 3, 1, C.sun);
  }
  // George Washington on horseback, on a granite pedestal.
  const gx = 3140;
  cv.rect(gx - 12, 128, 26, 24, '#8a8a9a');
  cv.rect(gx - 14, 126, 30, 3, '#a8a8b8');
  cv.rect(gx - 14, 149, 30, 3, '#6e6e80');
  const statue = [
    '..........KK..........',
    '..........KK....K.....',
    '.........KKKK..K......',
    '.........KKKKKK.......',
    '..........KKK.........',
    '...KK....KKKKK........',
    '..KKKK..KKKKKKK.......',
    '.KKKKKKKKKKKKKKKKK....',
    'KK.KKKKKKKKKKKKKKKK...',
    '....KKKKKKKKKKKKKKK...',
    '....KKKKKKKKKKKKKKKK..',
    '....KK.KK.....KK..KK..',
    '....KK..KK...KK....KK.',
    '...KK....KK..KK....KK.',
    '...K......K..K......K.',
  ];
  cv.sprite(gx - 10, 111, statue, { K: '#4a8a7a' });
  cv.sprite(gx - 10, 111, statue.map((r) => r.replace(/K(?=\.|$)/g, 'L')), { L: '#6aaa98' });
  // Greenmarket stalls under striped awnings.
  const awnings = [
    ['#e43b44', '#f4ecdc'],
    ['#38b764', '#f4ecdc'],
    ['#3b5dc9', '#f4ecdc'],
  ];
  awnings.forEach(([a, b], i) => {
    const sx = 3186 + i * 28;
    for (let x = sx; x < sx + 26; x++) cv.rect(x, 128, 1, 5, Math.floor((x - sx) / 3) % 2 ? a : b);
    cv.rect(sx, 133, 26, 1, '#3d2f4a');
    cv.rect(sx + 1, 134, 1, 18, '#5c3a2e');
    cv.rect(sx + 24, 134, 1, 18, '#5c3a2e');
    cv.rect(sx + 2, 142, 22, 3, '#8a5a3c');
    cv.rect(sx + 3, 145, 1, 7, '#5c3a2e');
    cv.rect(sx + 22, 145, 1, 7, '#5c3a2e');
    const produce = [
      ['#e43b44', '#ff6b7f'],
      ['#f7a35c', '#ffcd75'],
      ['#a7f070', '#38b764'],
    ][i];
    for (let x = sx + 3; x < sx + 23; x += 3) {
      cv.rect(x, 139, 3, 3, '#a8704a');
      cv.px(x + 1, 138, produce[(x / 3) % 2 | 0]);
      cv.px(x, 139, produce[0]);
    }
    cv.rect(sx + 9, 146, 8, 5, '#141026');
    cv.px(sx + 11, 148, C.cream);
    cv.px(sx + 14, 148, C.cream);
  });
  // The Vantager office: big lit windows and the sign.
  const ox = 3276;
  cv.rect(ox, 60, 92, LAWN - 60, '#3a3858');
  cv.rect(ox, 60, 2, LAWN - 60, '#5a5878');
  cv.rect(ox - 2, 57, 96, 3, '#2b2a48');
  windowGrid(cv, ox + 5, 66, 84, 52, rand, { dx: 9, dy: 10, ww: 7, wh: 7, lit: 0.7, on: ['#ffe9a8', '#ffcd75', '#c6fff5'], off: '#1b1a33' });
  // The sign: Vantager's gem on Insight Sky Blue, then the name. Swap via vantagerMark.
  const gem = vantagerMark.mark;
  const signW = 4 + gem[0].length + 4 + textWidth(vantagerMark.word) + 5;
  const sx = ox + Math.round((92 - signW) / 2);
  cv.rect(sx, 118, signW, 17, vantagerMark.sign);
  cv.rect(sx, 118, signW, 1, '#ffffff');
  cv.rect(sx, 134, signW, 1, vantagerMark.accent);
  cv.sprite(sx + 4, 121, gem, { '#': vantagerMark.ink });
  text(cv, sx + 4 + gem[0].length + 4, 124, vantagerMark.word, vantagerMark.ink);
  // Glass lobby.
  cv.rect(ox + 4, 136, 84, LAWN - 136, '#c6e6f2');
  for (let x = ox + 4; x < ox + 88; x += 12) cv.rect(x, 136, 1, LAWN - 136, '#566c86');
  cv.rect(ox + 38, 140, 16, 12, '#ffe9a8');
  // Union Square subway entrance: green rails and the globes.
  const ex = 3388;
  cv.rect(ex, 140, 26, 12, '#141026');
  cv.rect(ex, 138, 26, 2, '#2f6a4a');
  for (let y = 142; y < LAWN; y += 2) cv.rect(ex + 3, y, 20, 1, '#2b2150');
  for (const gx2 of [ex, ex + 25]) {
    cv.rect(gx2, 126, 1, 12, '#2f6a4a');
    cv.disc(gx2, 124, 2, C.lime);
  }
  cv.rect(ex, 130, 26, 7, '#1b1533');
  text(cv, ex + 2, 131, 'SUBWAY', C.cream);
}

function flatiron(cv, rand) {
  // The Flatiron seen from its prow: two limestone faces meeting at a narrow rounded
  // edge, the lit face wide and the far face foreshortened, under a heavy cornice.
  const x0 = 3432;
  const prow = x0 + 22;
  const x1 = x0 + 40;
  const top = 50;
  const lit = () => (rand() > 0.45 ? '#ffcd75' : '#4a3a5a');
  cv.rect(x0, top, prow - x0, LAWN - top, '#d8c3a5');
  cv.rect(prow, top - 2, 4, LAWN - top + 2, '#f2e2c6');
  cv.rect(prow + 4, top, x1 - prow - 4, LAWN - top, '#a8937a');
  for (let y = top + 6; y < LAWN - 12; y += 5) {
    for (let x = x0 + 2; x < prow - 1; x += 4) cv.rect(x, y, 2, 3, lit());
    cv.rect(prow + 1, y, 2, 3, lit());
    for (let x = prow + 6; x < x1 - 1; x += 3) cv.rect(x, y, 1, 3, lit());
  }
  // Rusticated bands at the base and the crown.
  for (const y of [top + 4, LAWN - 30, LAWN - 14]) {
    cv.rect(x0, y, prow - x0, 1, '#b8a385');
    cv.rect(prow + 4, y, x1 - prow - 4, 1, '#8a7a6a');
  }
  cv.rect(x0 - 2, top - 3, prow - x0 + 2, 3, '#b8a385');
  cv.rect(prow + 4, top - 3, x1 - prow - 2, 3, '#8a7a6a');
  cv.rect(prow - 1, top - 5, 6, 3, '#ead8bc');
  cv.rect(x0 - 1, top - 5, prow - x0, 2, '#ead8bc');
  cv.rect(prow + 5, top - 5, x1 - prow - 4, 2, '#b8a385');
  // Shops along the street, and the one-story "cowcatcher" at the tip.
  cv.rect(x0, LAWN - 12, x1 - x0, 12, '#8a7a6a');
  cv.rect(x0 + 2, LAWN - 9, prow - x0 - 4, 6, '#ffe9a8');
  cv.rect(prow + 6, LAWN - 9, x1 - prow - 8, 6, '#e0c080');
  cv.rect(prow - 2, LAWN - 16, 8, 16, '#c8b090');
  cv.rect(prow - 1, LAWN - 12, 6, 7, '#ffe9a8');
}

function empireState(cv, rand) {
  const e = 3520;
  const body = '#3a3070';
  const light = '#4a4088';
  cv.rect(e - 22, 84, 45, LAWN - 84, body);
  cv.rect(e - 17, 60, 35, 24, body);
  cv.rect(e - 12, 40, 25, 20, body);
  cv.rect(e - 7, 22, 15, 18, body);
  cv.rect(e - 4, 12, 9, 10, C.gold);
  cv.rect(e - 2, 6, 5, 6, C.sun);
  cv.rect(e, 0, 1, 6, C.steel);
  for (const [x, y, h] of [
    [e - 22, 84, LAWN - 84],
    [e - 17, 60, 24],
    [e - 12, 40, 20],
    [e - 7, 22, 18],
  ])
    cv.rect(x, y, 2, h, light);
  for (let y = 24; y < LAWN - 4; y += 3)
    for (let x = e - 20; x < e + 22; x += 3) {
      const w = y >= 84 ? 21 : y >= 60 ? 16 : y >= 40 ? 11 : 6;
      if (Math.abs(x - e) <= w && rand() > 0.5) cv.px(x, y, rand() > 0.7 ? C.sun : C.gold);
    }
}

function streetLife(cv) {
  // A hot dog cart under a striped umbrella.
  const hx = 3566;
  cv.rect(hx, 140, 20, 9, '#c9cfe0');
  cv.rect(hx, 140, 20, 2, '#e9edf7');
  cv.rect(hx + 2, 143, 7, 4, '#ffcd75');
  cv.rect(hx + 11, 143, 7, 4, '#e43b44');
  cv.disc(hx + 4, 150, 2, '#141026');
  cv.disc(hx + 16, 150, 2, '#141026');
  cv.rect(hx + 9, 126, 1, 14, '#94a0c2');
  for (let x = hx - 2; x < hx + 22; x++) cv.rect(x, 124 + Math.round(Math.abs(x - hx - 10) / 4), 1, 2, Math.floor((x - hx) / 3) % 2 ? '#3b5dc9' : '#ffcd75');
  // An orange-and-white Con Ed steam stack in the street (steam in the overlay).
  const sx = 3604;
  for (let y = STREET - 12; y < STREET + 9; y++) cv.rect(sx, y, 5, 1, Math.floor((y - STREET) / 3) % 2 ? '#f7a35c' : '#f4ecdc');
  cv.rect(sx - 1, STREET - 13, 7, 1, '#f4ecdc');
}

function walkUp(cv, rand) {
  const lit = [C.gold, C.orange, C.sun];
  const row = (x, w, top, wall, line, cornice = '#2b2150') => {
    if (line) bricks(cv, x, top, w, LAWN - top, wall, line);
    else cv.rect(x, top, w, LAWN - top, wall);
    cv.rect(x - 1, top - 2, w + 2, 2, cornice);
    for (let y = top + 5; y < LAWN - 12; y += 9)
      for (let wx = x + 3; wx < x + w - 5; wx += 7) {
        cv.rect(wx, y, 4, 6, rand() > 0.35 ? lit[Math.floor(rand() * 3)] : '#1b1533');
        cv.rect(wx, y + 6, 4, 1, '#bdb3a0');
      }
  };
  row(3612, 40, 106, '#5c3a2e', '#4a2e26');
  // The walk-up: four floors of brick, a fire escape, a stoop.
  const x0 = 3652;
  const x1 = 3732;
  const top = 98;
  bricks(cv, x0, top, x1 - x0, LAWN - top, '#8a3e3a', '#6e2f2e');
  cv.rect(x0 - 2, top - 5, x1 - x0 + 4, 5, '#3d2030');
  for (let x = x0 - 1; x < x1 + 1; x += 3) cv.px(x, top - 1, '#8a4a44');
  for (const fy of [102, 114, 126, 138])
    for (let wx = x0 + 6; wx < x1 - 6; wx += 14) {
      if (fy === 138 && wx > 3680 && wx < 3704) continue;
      cv.rect(wx - 1, fy - 1, 9, 10, '#d6ccb8');
      cv.rect(wx, fy, 7, 8, rand() > 0.3 ? lit[Math.floor(rand() * 3)] : '#1b1533');
      cv.rect(wx + 3, fy, 1, 8, '#d6ccb8');
    }
  for (const fy of [111, 123, 135]) {
    cv.rect(x0 + 32, fy, 30, 1, '#0c0a18');
    for (let x = x0 + 32; x < x0 + 62; x += 2) cv.px(x, fy - 3, '#0c0a18');
    cv.rect(x0 + 32, fy - 4, 30, 1, '#0c0a18');
    cv.line(x0 + 36, fy, x0 + 56, fy - 12, '#0c0a18');
  }
  cv.rect(3684, 134, 16, 18, '#5a2e30');
  cv.rect(3687, 136, 10, 16, '#257156');
  cv.rect(3691, 136, 2, 16, '#1c4a43');
  cv.rect(3688, 133, 8, 2, C.sun);
  for (let i = 0; i < 4; i++) cv.rect(3680 - i * 2, 152 + i * 2, 24 + i * 4, 2, i % 2 ? '#8a7f96' : '#9d93aa');
  row(3732, 50, 90, '#566c86', null, '#3d4a62');
  // Bodega with an awning; its neon blinks in the overlay.
  row(3782, 60, 104, '#4a3a5a', null);
  cv.rect(3782, 134, 60, 18, '#241c42');
  cv.rect(3786, 138, 24, 14, '#f7a35c');
  cv.rect(3814, 138, 9, 14, '#3d2f66');
  for (let x = 3782; x < 3842; x += 6) cv.rect(x, 130, 3, 4, '#e43b44');
  for (let x = 3785; x < 3842; x += 6) cv.rect(x, 130, 3, 4, C.cream);
  tree(cv, 3752, LAWN, 7, ['#1c4a43', '#257156', '#38b764']);
  cv.rect(3644, 154, 4, 6, C.red);
  cv.rect(3643, 153, 6, 2, '#a82a34');
  row(3842, 40, 112, '#33275a', null);
  row(3882, 50, 96, '#3d2f66', null);
  row(3932, 44, 110, '#2b2150', null);
}

function downtown(cv, rand) {
  // One World Trade Center behind: a tapering prism with its spire.
  const ox = 4142;
  for (let y = 18; y < LAWN; y++) {
    const half = y > 126 ? 22 : Math.round(13 + ((y - 18) / (126 - 18)) * 9);
    const mid = Math.round(((y - 18) / (LAWN - 18)) * half);
    cv.rect(ox - half, y, half * 2 + 1, 1, '#2b2150');
    cv.rect(ox - half, y, Math.max(1, half - mid), 1, '#3a3070');
    if (y % 3 === 0) for (let x = ox - half + 2; x < ox + half - 1; x += 3) if (rand() > 0.62) cv.px(x, y, rand() > 0.6 ? C.cyan : C.steel);
  }
  cv.rect(ox, 0, 1, 18, C.steel);
  cv.rect(ox - 1, 12, 3, 2, C.steel);

  // 7 World Trade Center: blue glass, a chamfered top, a glowing lobby.
  const { x: sx, w: sw, top: stop } = WTC7;
  cv.fill(sx, stop, sw, LAWN - stop, (x, y) => {
    if ((x - sx) % 5 === 0) return '#1b2a5a';
    const sheen = ((x - sx) * 0.9 + (y - stop) * 0.55) % 46;
    if (sheen < 3) return '#73eff7';
    if (sheen < 9) return '#41a6f6';
    return (y + x) % 7 === 0 ? '#3b5dc9' : '#29366f';
  });
  cv.poly(
    [
      [sx, stop],
      [sx + 10, stop - 7],
      [sx + sw, stop - 7],
      [sx + sw, stop],
    ],
    '#3b5dc9',
  );
  cv.line(sx, stop, sx + 10, stop - 7, '#73eff7');
  cv.line(sx + 10, stop - 7, sx + sw - 1, stop - 7, '#c6fff5');
  cv.rect(sx, 136, sw, LAWN - 136, '#c6fff5');
  for (let x = sx; x < sx + sw; x += 8) cv.rect(x, 136, 1, LAWN - 136, '#73eff7');
  cv.rect(sx - 2, 134, sw + 4, 2, '#94a0c2');
  text(cv, sx + 4, 128, '7 WTC', '#c6fff5');
  for (const tx of [3976, 4104]) tree(cv, tx, LAWN, 6, ['#1c4a43', '#257156', '#38b764']);

  // The Oculus: a white spine with ribs rising like wings.
  const cx = 4232;
  cv.poly(
    [
      [cx - 46, LAWN],
      [cx - 40, 134],
      [cx + 40, 134],
      [cx + 46, LAWN],
    ],
    '#e9edf7',
  );
  for (let k = 0; k < 9; k++) {
    const dx = 6 + k * 5;
    cv.line(cx - dx + 4, 134, cx - dx - 6, 102 + k * 2, '#f4f4f4');
    cv.line(cx + dx - 4, 134, cx + dx + 6, 102 + k * 2, '#f4f4f4');
  }
  cv.rect(cx - 2, 104, 4, 30, '#f4f4f4');
  cv.rect(cx - 30, 140, 60, 8, '#ffe9a8');
  for (let x = cx - 30; x < cx + 30; x += 5) cv.rect(x, 140, 1, 8, '#c9cfe0');
  for (const [x, w, top, col] of [
    [4290, 36, 92, '#33275a'],
    [4326, 40, 74, '#2b2150'],
    [4366, 34, 100, '#3d2f66'],
  ]) {
    cv.rect(x, top, w, LAWN - top, col);
    windowGrid(cv, x + 3, top + 4, w - 5, LAWN - top - 10, rand, { dx: 6, dy: 7, ww: 3, wh: 4, lit: 0.4 });
  }
  // Street lamps along the block.
  for (let x = 3600; x < 4400; x += 46) {
    cv.rect(x, 126, 1, WALK - 126, '#566c86');
    cv.rect(x - 2, 124, 5, 2, '#3d4a62');
    cv.rect(x - 1, 126, 3, 1, C.sun);
  }
}
