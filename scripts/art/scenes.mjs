// Location art for the quest log, one 192×64 scene per chapter.
import { Canvas, C, SKY, ramp, rng, stars, windows } from './lib.mjs';

export const SCENE_W = 192;
export const SCENE_H = 64;

/** Vertical sky from t0 at the top to t1 at the horizon line. */
function sky(cv, horizon, t0, t1, glowX = null, glow = 0) {
  cv.fill(0, 0, cv.width, horizon, (x, y) => {
    let t = t0 + (t1 - t0) * Math.pow(y / horizon, 1.4);
    if (glowX !== null) t += Math.max(0, 1 - Math.abs(x - glowX) / 90) * glow * (y / horizon);
    return ramp(SKY, t, x, y);
  });
}

/** A row of generic towers with lit windows. */
function skyline(cv, rand, { x0, x1, base, min, max, color, lit = 0.3, litColors } = {}) {
  let x = x0;
  while (x < x1) {
    const w = 4 + Math.floor(rand() * 7);
    const h = min + Math.floor(rand() * (max - min));
    cv.rect(x, base - h, w, h, color);
    windows(cv, x, base - h, w, h, rand, { lit, colors: litColors ?? [C.gold, C.orange, C.sun] });
    x += w + (rand() > 0.75 ? 1 : 0);
  }
}

// Chapter 5: a Midtown office window at night, chart on the screen.
export function msci() {
  const cv = new Canvas(SCENE_W, SCENE_H, '#1b1533');
  const rand = rng(5);
  const win = { x: 6, y: 4, w: 180, h: 40 };
  cv.fill(win.x, win.y, win.w, win.h, (x, y) => ramp(SKY, 0.02 + ((y - win.y) / win.h) * 0.38, x, y));
  stars(cv, 40, rand, 22, (x, y) => x > win.x && x < win.x + win.w && y > win.y);
  skyline(cv, rand, { x0: win.x, x1: win.x + win.w, base: win.y + win.h, min: 8, max: 22, color: '#33275a', lit: 0.18, litColors: [C.berry, C.haze] });
  // Empire State Building, lit gold, just off center.
  const e = 132;
  cv.rect(e - 6, 22, 13, 22, '#2b2150');
  cv.rect(e - 4, 15, 9, 7, '#2b2150');
  cv.rect(e - 2, 10, 5, 5, '#2b2150');
  cv.rect(e - 1, 7, 3, 3, C.gold);
  cv.rect(e, 4, 1, 3, C.steel);
  windows(cv, e - 6, 22, 13, 22, rand, { lit: 0.5, step: [2, 2] });
  windows(cv, e - 4, 15, 9, 7, rand, { lit: 0.5, step: [2, 2] });
  cv.px(e, 4, C.red);
  // Chrysler crown, further back.
  for (let k = 0; k < 4; k++) cv.rect(160 - (3 - k), 20 - k * 2, (3 - k) * 2 + 1, 2, C.steel);
  cv.rect(160, 11, 1, 3, C.steel);
  cv.rect(157, 22, 7, 22, '#2b2150');
  windows(cv, 157, 22, 7, 22, rand, { lit: 0.4 });
  skyline(cv, rand, { x0: win.x, x1: win.x + win.w, base: win.y + win.h, min: 4, max: 13, color: '#1f1838', lit: 0.4 });
  // Window frame and mullions.
  cv.rect(win.x - 2, win.y - 2, win.w + 4, 2, '#0c0a18');
  for (const mx of [win.x - 2, 66, 126, win.x + win.w]) cv.rect(mx, win.y - 2, 2, win.h + 2, '#0c0a18');
  cv.rect(win.x, win.y + 26, win.w, 1, '#120d22');
  // Desk, monitor with a chart, a mug, a plant.
  cv.rect(0, 44, SCENE_W, 20, '#2f2552');
  cv.rect(0, 44, SCENE_W, 1, C.haze);
  cv.fill(52, 45, 88, 19, (x, y) => ((x + y) % 2 && Math.abs(x - 96) < 34 - (y - 45) ? '#3d2f66' : null));
  cv.rect(72, 20, 48, 26, '#0c0a18');
  cv.rect(74, 22, 44, 21, '#141026');
  const bars = [6, 9, 7, 12, 10, 15, 13, 17];
  bars.forEach((h, i) => cv.rect(78 + i * 5, 41 - h, 3, h, i === bars.length - 1 ? C.gold : C.teal));
  cv.line(78, 33, 117, 23, C.cyan);
  cv.rect(76, 24, 10, 1, C.steel);
  cv.rect(94, 46, 4, 3, '#0c0a18');
  cv.rect(86, 49, 20, 1, '#0c0a18');
  cv.rect(78, 52, 36, 4, '#1b1533');
  for (let i = 80; i < 112; i += 3) cv.rect(i, 53, 2, 1, C.dusk3);
  cv.rect(132, 47, 7, 8, C.cream);
  cv.rect(139, 49, 2, 4, C.cream);
  cv.rect(133, 48, 5, 1, C.bark);
  cv.px(134, 44, C.steel);
  cv.px(135, 42, C.steel);
  cv.px(134, 40, C.steel);
  cv.rect(18, 48, 9, 8, C.bark);
  for (const [lx, ly] of [
    [16, 44],
    [20, 41],
    [24, 43],
    [27, 39],
    [19, 46],
    [28, 45],
  ])
    cv.rect(lx, ly, 3, 4, ly < 43 ? C.lime : C.green);
  // Lanyard-free badge: a notebook.
  cv.rect(150, 51, 18, 6, C.navy);
  cv.rect(150, 51, 18, 1, C.blue);
  return cv;
}

// Chapter 4: the Brooklyn Bridge at dusk, Manhattan behind it.
export function vantager() {
  const cv = new Canvas(SCENE_W, SCENE_H);
  const rand = rng(4);
  const horizon = 44;
  sky(cv, horizon, 0.12, 0.62, 150, 0.2);
  stars(cv, 25, rand, 16, () => true);
  skyline(cv, rand, { x0: 86, x1: SCENE_W, base: horizon, min: 8, max: 30, color: '#3d2f66', lit: 0.2, litColors: [C.gold, C.berry] });
  // One WTC in the haze.
  for (let y = 8; y < horizon; y++) {
    const half = y > 22 ? 4 : 1 + Math.round(((y - 8) / 14) * 3);
    cv.rect(170 - half, y, half * 2 + 1, 1, '#4a3a7a');
  }
  cv.rect(170, 2, 1, 6, C.steel);
  // East River.
  cv.fill(0, horizon, SCENE_W, SCENE_H - horizon, (x, y) => {
    const t = 0.5 - (y - horizon) * 0.018 + (Math.sin(x * 0.7 + y * 2) > 0.6 ? 0.08 : 0);
    return y % 2 ? ramp(SKY, t, x, y) : ramp(SKY, t - 0.08, x, y);
  });
  // Deck with lamps.
  cv.rect(0, 38, SCENE_W, 3, '#2a1f3a');
  cv.rect(0, 38, SCENE_W, 1, '#4a3352');
  for (let x = 3; x < SCENE_W; x += 8) cv.px(x, 37, C.gold);
  // Cables: main catenaries and the bridge's signature diagonal stays.
  const tx = 52;
  const ttop = 6;
  for (let x = 0; x < SCENE_W; x++) {
    const u = Math.abs(x - tx) / (x < tx ? tx : SCENE_W - tx);
    const y = Math.round(ttop + 2 + Math.pow(u, 1.6) * 0 + (x < tx ? u * 30 : u * 18 + Math.sin(u * Math.PI) * 10));
    if (y < 38) cv.px(x, y, C.steel);
    if (x % 3 === 0) for (let j = y + 1; j < 38; j++) cv.px(x, j, '#4f3d7d');
  }
  for (let k = 1; k < 9; k++) {
    cv.line(tx - 4, ttop + 6, tx - 4 - k * 6, 38, '#6b5b9a');
    cv.line(tx + 4, ttop + 6, tx + 4 + k * 7, 38, '#6b5b9a');
  }
  // The gothic stone tower with twin pointed arches.
  const stone = '#6e4a52';
  const stoneLit = '#a8706a';
  cv.rect(tx - 12, ttop, 25, 50, stone);
  cv.rect(tx - 12, ttop, 2, 50, stoneLit);
  cv.rect(tx - 13, ttop - 2, 27, 3, '#5c3a46');
  cv.rect(tx - 13, ttop - 2, 27, 1, stoneLit);
  for (const ax of [tx - 8, tx + 3]) {
    const through = (x, y) => ramp(SKY, 0.3 + (y - ttop) * 0.009, x, y);
    cv.fill(ax, ttop + 10, 6, 28, through);
    cv.fill(ax + 1, ttop + 7, 4, 3, through);
    cv.fill(ax + 2, ttop + 5, 2, 2, through);
    cv.rect(ax, 38, 6, 3, '#2a1f3a');
    cv.rect(ax, ttop + 10, 1, 28, '#5c3a46');
  }
  cv.rect(tx - 12, 56, 25, 8, '#4a3040');
  for (let y = ttop + 4; y < 56; y += 4) cv.rect(tx - 10, y, 1, 1, '#5c3a46');
  return cv;
}

// Chapter 3: the Golden Gate at sunset, fog rolling under the deck.
export function threebridge() {
  const cv = new Canvas(SCENE_W, SCENE_H);
  const rand = rng(3);
  const horizon = 46;
  const gg = '#d9452f';
  const ggD = '#9a2f2a';
  sky(cv, horizon, 0.3, 0.95, 40, 0.15);
  // Marin headlands.
  cv.fill(0, 20, SCENE_W, horizon - 20, (x, y) => {
    const ridge = 30 + Math.sin(x / 17) * 5 + Math.sin(x / 6.1) * 1.5 + (x > 120 ? (x - 120) * 0.12 : 0);
    return y > ridge ? (y < ridge + 2 ? C.berry : '#4a2a63') : null;
  });
  // Water.
  cv.fill(0, horizon, SCENE_W, SCENE_H - horizon, (x, y) => {
    const t = 0.7 - (y - horizon) * 0.03;
    if (Math.abs(x - 40) < 8 - (y - horizon) * 0.3 && (x + y) % 2) return C.gold;
    return y % 2 ? ramp(SKY, t - 0.2, x, y) : ramp(SKY, t - 0.35, x, y);
  });
  // Main cable and suspenders, then the deck.
  const tx = 118;
  const ttop = 4;
  const deck = 40;
  for (let x = 0; x < SCENE_W; x++) {
    const u = x < tx ? (tx - x) / tx : (x - tx) / (SCENE_W - tx);
    const y = Math.round(x < tx ? ttop + 2 + (deck - 6 - ttop) * Math.sin(u * Math.PI * 0.5) : ttop + 2 + u * 20);
    cv.px(x, y, gg);
    if (x % 3 === 0) cv.rect(x, y + 1, 1, Math.max(0, deck - y - 1), ggD);
  }
  cv.rect(0, deck, SCENE_W, 3, gg);
  cv.rect(0, deck + 3, SCENE_W, 1, ggD);
  // The Art Deco tower: two legs, stepped tops, portal struts.
  for (const lx of [tx - 7, tx + 4]) {
    cv.rect(lx, ttop, 4, SCENE_H - ttop, gg);
    cv.rect(lx + 3, ttop, 1, SCENE_H - ttop, ggD);
    cv.rect(lx + 1, ttop - 3, 2, 3, gg);
  }
  for (const sy of [ttop + 4, ttop + 14, ttop + 24, deck + 6]) {
    cv.rect(tx - 3, sy, 7, 2, gg);
    cv.rect(tx - 3, sy + 2, 7, 1, ggD);
  }
  cv.px(tx - 5, ttop - 4, C.red);
  cv.px(tx + 6, ttop - 4, C.red);
  // Fog: a soft bank swallowing the deck and the legs.
  cv.fill(0, 34, SCENE_W, 30, (x, y) => {
    const edge = 39 + Math.sin(x / 9) * 3 + Math.sin(x / 3.7) * 1.2 - (x > 150 ? (x - 150) * 0.06 : 0);
    const bottom = 50 + Math.sin(x / 13 + 2) * 3;
    if (y < edge) return null;
    const d = y - edge;
    if (d < 1) return (x + y) % 2 ? '#e9dcef' : null;
    if (y > bottom + 4) return null;
    if (y > bottom) return (x + y) % 2 && (x * 3 + y) % 5 ? '#b8a6d0' : null;
    if (d < 3) return (x + y) % 2 ? '#d6c4e2' : '#e9dcef';
    return d < 6 ? '#d6c4e2' : '#c4b2da';
  });
  for (const [fx, fy, len] of [
    [8, 30, 26],
    [150, 33, 30],
    [60, 26, 18],
  ])
    for (let i = 0; i < len; i++) if ((i + fy) % 3) cv.px(fx + i, fy + (i > len / 2 ? 1 : 0), '#d6c4e2');
  void rand;
  return cv;
}

// Chapter 2: the Nebraska State Capitol at dusk, the Sower on top.
export function raikes() {
  const cv = new Canvas(SCENE_W, SCENE_H);
  const rand = rng(2);
  const ground = 54;
  sky(cv, ground, 0.08, 0.55, 40, 0.15);
  stars(cv, 30, rand, 18, (x, y) => y < 18);
  const lime = '#d8b98a';
  const limeD = '#a8865e';
  const limeS = '#7a5e48';
  // Base building: long, low wings around a central block, like the Capitol's cross plan.
  cv.rect(22, 44, 148, ground - 44, lime);
  cv.rect(22, 44, 148, 1, limeD);
  for (let x = 26; x < 168; x += 5) if (Math.abs(x - 96) > 18) cv.rect(x, 47, 2, 5, rand() > 0.55 ? C.gold : '#4a3a5a');
  cv.rect(22, 44, 2, ground - 44, limeS);
  cv.rect(168, 44, 2, ground - 44, limeS);
  // Corner pavilions.
  for (const x of [22, 160]) {
    cv.rect(x, 40, 10, 4, lime);
    cv.rect(x, 40, 10, 1, limeD);
  }
  // Central block and entrance steps.
  const tx = 96;
  cv.rect(tx - 20, 38, 41, ground - 38, lime);
  cv.rect(tx - 20, 38, 41, 1, limeD);
  cv.rect(tx - 20, 38, 2, ground - 38, limeD);
  cv.rect(tx + 19, 38, 2, ground - 38, limeS);
  for (let x = tx - 14; x <= tx + 14; x += 4) cv.rect(x, 42, 2, 9, '#3a2f55');
  for (let y = 0; y < 3; y++) cv.rect(tx - 8 - y * 2, ground - 3 + y, 17 + y * 4, 1, y % 2 ? limeD : lime);
  // The 400-foot tower: two setbacks, tall window bays lit gold.
  cv.rect(tx - 8, 18, 17, 20, lime);
  cv.rect(tx - 8, 18, 2, 20, limeD);
  cv.rect(tx + 7, 18, 2, 20, limeS);
  for (let x = tx - 5; x <= tx + 5; x += 3) {
    cv.rect(x, 20, 1, 16, '#3a2f55');
    if (rand() > 0.4) cv.px(x, 22 + Math.floor(rand() * 10), C.gold);
  }
  cv.rect(tx - 9, 17, 19, 1, limeD);
  cv.rect(tx - 6, 13, 13, 4, lime);
  cv.rect(tx - 6, 13, 1, 4, limeD);
  cv.rect(tx + 6, 13, 1, 4, limeS);
  for (let x = tx - 4; x <= tx + 4; x += 2) cv.px(x, 14, '#3a2f55');
  // Octagonal drum, gold-tiled dome with its blue-green band, and the Sower.
  cv.rect(tx - 4, 10, 9, 3, limeD);
  for (let y = 0; y < 5; y++) {
    const half = [4, 4, 3, 2, 1][y];
    cv.rect(tx - half, 9 - y, half * 2 + 1, 1, y === 1 ? C.teal : y > 2 ? C.sun : C.gold);
  }
  cv.rect(tx, 3, 1, 2, C.gold);
  cv.rect(tx, 0, 1, 3, '#2a1f3a');
  cv.px(tx - 1, 1, '#2a1f3a');
  cv.px(tx + 1, 0, '#2a1f3a');
  // Trees and lawn.
  cv.rect(0, ground, SCENE_W, SCENE_H - ground, '#1c3a3a');
  cv.fill(0, ground, SCENE_W, SCENE_H - ground, (x, y) => ((x + y * 2) % 5 === 0 ? C.pine : null));
  for (const [x, r] of [
    [10, 8],
    [22, 6],
    [172, 8],
    [184, 7],
    [50, 5],
    [142, 5],
  ]) {
    cv.disc(x, ground - r + 2, r, '#1a2f3a');
    cv.disc(x - 1, ground - r + 1, r - 2, '#22424a');
  }
  // Floodlight glow on the walk.
  cv.fill(70, ground, 52, 4, (x, y) => ((x + y) % 2 && Math.abs(x - tx) < 26 - (y - ground) * 3 ? C.tan : null));
  return cv;
}

// Chapter 1: an intern's workbench. Code on the screen, a PC with the side off.
export function tutorial() {
  const cv = new Canvas(SCENE_W, SCENE_H, '#241c42');
  const rand = rng(1);
  // Wall texture and a window with a prairie sunset.
  cv.fill(0, 0, SCENE_W, 44, (x, y) => ((x * 3 + y * 5) % 11 === 0 ? '#2b2150' : null));
  const wx = 136;
  cv.fill(wx, 6, 44, 26, (x, y) => ramp(SKY, 0.35 + ((y - 6) / 26) * 0.55, x, y));
  cv.disc(wx + 30, 27, 4, C.sun);
  cv.rect(wx, 27, 44, 5, '#3a2440');
  cv.rect(wx, 27, 44, 1, C.coral);
  cv.rect(wx + 8, 20, 4, 7, '#3b2a58');
  cv.rect(wx + 9, 18, 2, 2, '#3b2a58');
  cv.rect(wx - 2, 4, 48, 2, '#0c0a18');
  cv.rect(wx - 2, 32, 48, 2, '#0c0a18');
  cv.rect(wx - 2, 4, 2, 30, '#0c0a18');
  cv.rect(wx + 44, 4, 2, 30, '#0c0a18');
  cv.rect(wx + 21, 6, 2, 26, '#0c0a18');
  // Sticky notes.
  for (const [x, y, c] of [
    [8, 8, C.gold],
    [18, 12, C.coral],
    [10, 20, C.lime],
  ]) {
    cv.rect(x, y, 7, 7, c);
    cv.rect(x + 1, y + 2, 5, 1, C.dusk);
    cv.rect(x + 1, y + 4, 3, 1, C.dusk);
  }
  // Desk.
  cv.rect(0, 44, SCENE_W, 20, '#5c3a2e');
  cv.rect(0, 44, SCENE_W, 1, C.brown);
  cv.fill(0, 46, SCENE_W, 18, (x, y) => ((x + y * 7) % 13 === 0 ? '#6e4632' : null));
  // Monitor with code.
  cv.rect(36, 14, 52, 32, '#0c0a18');
  cv.rect(38, 16, 48, 27, '#101a2a');
  const colors = [C.cyan, C.gold, C.coral, C.lime, C.steel, C.violet ?? C.haze];
  for (let row = 0; row < 8; row++) {
    let x = 41 + (row % 3 === 1 ? 4 : row % 3 === 2 ? 8 : 0);
    const y = 18 + row * 3;
    while (x < 82 && rand() > 0.12) {
      const len = 2 + Math.floor(rand() * 7);
      cv.rect(x, y, Math.min(len, 83 - x), 1, colors[Math.floor(rand() * 5)]);
      x += len + 2;
    }
  }
  cv.rect(41, 42 - 2, 3, 1, C.cream);
  cv.rect(58, 46, 8, 2, '#0c0a18');
  cv.rect(52, 48, 20, 1, '#0c0a18');
  // Keyboard and mouse.
  cv.rect(36, 52, 40, 5, '#1b1533');
  for (let i = 38; i < 74; i += 3) {
    cv.rect(i, 53, 2, 1, C.dusk3);
    cv.rect(i + 1, 55, 2, 1, C.dusk3);
  }
  cv.rect(82, 53, 4, 5, C.steel);
  // PC tower with the side panel off: board, RAM, a glowing fan.
  cv.rect(98, 16, 28, 36, '#1b1533');
  cv.rect(100, 18, 24, 32, '#123a30');
  cv.rect(103, 21, 8, 8, C.slate);
  cv.rect(104, 22, 6, 6, '#2a3a4a');
  cv.rect(113, 21, 2, 12, C.lime);
  cv.rect(116, 21, 2, 12, C.lime);
  cv.disc(108, 40, 5, C.teal);
  cv.disc(108, 40, 3, '#123a30');
  cv.disc(108, 40, 1, C.cyan);
  cv.rect(114, 38, 8, 3, C.coral);
  cv.rect(98, 16, 28, 1, C.dusk3);
  // Desk lamp and its light.
  cv.line(150, 44, 156, 36, C.steel);
  cv.line(156, 36, 150, 30, C.steel);
  cv.rect(146, 28, 8, 3, C.steel);
  cv.fill(140, 31, 24, 13, (x, y) => ((x + y) % 2 && Math.abs(x - 150) < (y - 31) * 0.9 + 3 ? C.gold : null));
  cv.rect(170, 46, 6, 7, C.cream);
  cv.rect(176, 48, 2, 3, C.cream);
  return cv;
}

// Prologue: a Scout campfire on the Platte. An egg cooks in an orange peel.
export function prologue() {
  const cv = new Canvas(SCENE_W, SCENE_H);
  const rand = rng(7);
  const ground = 44;
  sky(cv, ground, 0, 0.32);
  // Milky Way: a lighter, dithered band.
  cv.fill(0, 0, SCENE_W, ground, (x, y) => {
    const d = Math.abs(y - (44 - x * 0.24) + Math.sin(x / 9) * 2);
    const r = rand();
    if (d < 2.5 && r < 0.18) return C.haze;
    if (d < 7 && r < 0.4 - d * 0.04) return C.dusk3;
    return null;
  });
  stars(cv, 140, rand, ground - 4, () => true);
  // Far bank.
  for (let x = 0; x < SCENE_W; x++) {
    const h = 3 + Math.round(Math.sin(x / 4) * 1.5 + Math.sin(x / 11) * 2);
    cv.rect(x, ground - h, 1, h, '#1b1533');
  }
  // The Platte, with the moon in it and cranes on a sandbar.
  cv.fill(110, ground, SCENE_W - 110, SCENE_H - ground, (x, y) => (y % 2 ? '#1f1838' : '#241c42'));
  for (let y = ground + 1; y < SCENE_H; y += 2) cv.rect(150 + Math.round(Math.sin(y) * 2), y, 3 + (y % 3), 1, C.steel);
  cv.rect(160, ground + 6, 26, 2, '#3a3050');
  const crane = ['.R', 'K.', 'K.', 'KK', 'KKK', '.K.', '.K.'];
  for (const cx of [164, 170, 178]) cv.sprite(cx, ground, crane, { K: C.slate, R: C.red });
  // Ground, lit warm near the fire.
  const fx = 70;
  cv.fill(0, ground, 112, SCENE_H - ground, (x, y) => {
    const d = Math.hypot((x - fx) / 1.8, (y - 54) * 1.2);
    if (d < 14) return (x + y) % 2 ? '#7a4a3a' : '#5c3a2e';
    if (d < 22) return (x + y) % 2 ? '#5c3a2e' : '#2f2230';
    return (x * 3 + y) % 7 === 0 ? '#2f2230' : '#221a2c';
  });
  cv.line(110, ground, 116, SCENE_H, '#2f2552');
  // Cottonwood on the left.
  cv.rect(10, 18, 4, 30, '#1b1426');
  cv.disc(12, 14, 11, '#1b1426');
  cv.disc(20, 20, 8, '#1b1426');
  cv.disc(14, 12, 6, '#241a34');
  // Tent, lit on the fire side.
  cv.poly(
    [
      [28, 54],
      [42, 34],
      [56, 54],
    ],
    '#8a3e3a',
  );
  cv.poly(
    [
      [42, 34],
      [56, 54],
      [48, 54],
    ],
    C.coral,
  );
  cv.poly(
    [
      [38, 54],
      [42, 44],
      [46, 54],
    ],
    '#2a1a28',
  );
  cv.line(42, 32, 42, 34, C.tan);
  // Fire: logs, coals, flames, and the orange-peel egg.
  cv.line(fx - 9, 58, fx + 9, 54, C.bark);
  cv.line(fx - 9, 54, fx + 9, 58, '#4a2e26');
  cv.rect(fx - 6, 55, 13, 2, C.red);
  const flame = [
    '....3....',
    '...323...',
    '..32123..',
    '..21012..',
    '.3210123.',
    '.2101012.',
    '321000123',
  ];
  cv.sprite(fx - 4, 47, flame, { 0: C.sun, 1: C.gold, 2: C.orange, 3: C.red });
  // The egg, in its peel, at the edge of the coals.
  cv.rect(fx + 10, 55, 7, 3, C.orange);
  cv.rect(fx + 11, 58, 5, 1, C.coral);
  cv.rect(fx + 11, 55, 5, 2, C.cream);
  cv.rect(fx + 13, 55, 2, 1, C.gold);
  // Sparks.
  for (const [sx, sy] of [
    [fx - 2, 42],
    [fx + 3, 39],
    [fx + 1, 35],
  ])
    cv.px(sx, sy, C.gold);
  return cv;
}
