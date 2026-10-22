// "The road so far" side-scroller art, drawn in code on transparent layers:
//   journey-near      4400×210  the places themselves, walked past at full speed
//   journey-far       2460×210  hills, the sea and skylines that drift past at half speed
//   journey-walker     234×28   Charlie: 8 walk frames, 2 idle, 3 facing out (wave)
//   journey-vehicles   458×28   pickups, a tractor, buses, a convertible, a streetcar, cabs
//   journey-clouds     480×240  three cloud bands, in day and dusk colors
// The sky is CSS. Positions and time of day come from src/data/journey.ts. The
// places themselves live in journey-west, journey-coast and journey-city.
//
// Run directly to write the PNGs: node scripts/art/journey.mjs [--preview dir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { C, SKY, ramp, rng } from './lib.mjs';
import { farX, journeyArt, vehicles, vehicleSheet } from '../../src/data/journey.ts';
import { CURB, FW, GROUND, H, HORIZON, LANES, LAWN, Layer, NW, STREET, WALK, sea, text, tod } from './journey-kit.mjs';
import { nebraska, fastTravel } from './journey-west.mjs';
import { COAST, GG, sanFrancisco } from './journey-coast.mjs';
import { SUBWAY, newYork } from './journey-city.mjs';

const clamp = (v) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------------------
// Near layer

export function journeyNear() {
  const cv = new Layer(NW, H);
  const rand = rng(2003);
  ground(cv, rand);
  underground(cv, rand);
  nebraska(cv, rand);
  sanFrancisco(cv, rand);
  fastTravel(cv, 2930, ['NEW YORK'], 'SUMMER 2025');
  newYork(cv, rand);
  return cv;
}

function ground(cv) {
  const mid = Math.round((LANES.far + LANES.near) / 2);
  for (let x = 0; x < NW; x++) {
    const onBridge = x >= GG.x0 && x < GG.x1;
    // The verge: lawn, then sand along the coast, then plaza in New York, dithered across each change.
    const toSand = clamp((x - COAST.x0 + 8) / 20) * clamp((COAST.x1 + 12 - x) / 20);
    const toPlaza = clamp((x - 3022) / 30);
    if (!onBridge)
      for (let y = LAWN; y < WALK; y++) {
        const top = y === LAWN;
        const lawn = top ? ['#a7f070', '#a7f070', '#c8a050', '#2b2150'] : ['#38b764', '#38b764', '#8a8a3a', '#241c42'];
        const sand = top ? ['#f4e0b0', '#f4e0b0', '#f0c890', '#4f3d7d'] : ['#e9d0a8', '#e9d0a8', '#d8a878', '#3d2f66'];
        const plaza = top ? ['#c9bfd9', '#c9bfd9', '#8a6a7a', '#3d2f66'] : ['#a99fc4', '#a99fc4', '#6e4f66', '#2b2150'];
        let c = tod(lawn, x, y);
        if (ramp([0, 1], toSand, x, y)) c = (x * 5 + y * 3) % 11 === 0 ? '#a8865e' : tod(sand, x, y);
        if (ramp([0, 1], toPlaza, x, y)) c = tod(plaza, x, y);
        cv.px(x, y, c);
      }
    for (let y = WALK; y < CURB; y++) {
      const joint = x % 12 === 0;
      const slab = y === WALK ? ['#e9e0f0', '#f4f4f4', '#f7c08a', '#4f3d7d'] : ['#bdb3db', '#c9c3e0', '#c88a6a', '#3d2f66'];
      let c = joint ? tod(['#94a0c2', '#94a0c2', '#a8605e', '#2b2150'], x, y) : tod(slab, x, y);
      if (onBridge) c = y === WALK ? '#ff8e5e' : (x + y) % 5 ? '#b8605a' : '#a8504a';
      cv.px(x, y, c);
    }
    cv.px(x, CURB, onBridge ? '#d9452f' : tod(['#6e6480', '#6e6480', '#7a3a5a', '#1b1533'], x, CURB));
    // Two lanes: a dashed center line, a worn strip where the wheels run, a gutter at the bottom.
    for (let y = STREET; y < GROUND; y++) {
      let c = tod(['#4a4466', '#4a4466', '#4a3058', '#1f1838'], x, y);
      if (y === STREET) c = tod(['#3d3858', '#3d3858', '#3d2848', '#18122c'], x, y);
      if ((y === LANES.far - 2 || y === LANES.near - 2) && (x * 3) % 7 === 0) c = tod(['#433e5e', '#433e5e', '#432c52', '#1b1532'], x, y);
      if (y === mid && x % 16 < 8) c = C.gold;
      if ((x * 7 + y * 13) % 41 === 0) c = tod(['#5a5478', '#5a5478', '#5a3a62', '#2b2150'], x, y);
      if (y === GROUND - 1) c = tod(['#3d3858', '#3d3858', '#3d2848', '#18122c'], x, y);
      cv.px(x, y, c);
    }
  }
}

function underground(cv, rand) {
  const bayMid = (GG.x0 + GG.x1) / 2;
  for (let x = 0; x < NW; x++) {
    const onBridge = x >= GG.x0 && x < GG.x1;
    // Along the coast the soil turns to rock, dithered at both ends.
    const rocky = clamp((x - GG.x0 + 24) / 30) * clamp((COAST.x1 + 30 - x) / 30);
    for (let y = GROUND; y < H; y++) {
      const d = y - GROUND;
      let c;
      if (x >= SUBWAY.x0 && x < SUBWAY.x1) c = tunnel(x, y);
      else if (ramp([0, 1], rocky, x, y)) c = y === GROUND ? '#3d2f3a' : (x * 3 + y * 5) % 7 === 0 ? '#7a6a7a' : (x + 2 * y) % 13 === 0 ? '#3d2f3a' : '#5c4a5a';
      else c = y === GROUND ? '#2a1c24' : (x * 7 + y * 13) % 23 === 0 ? '#6e5a5a' : (x + y) % 3 ? '#4a3430' : '#3d2a28';
      if (onBridge) {
        // The truss under the roadway, then the bay in a channel between rocky banks.
        const half = 112 - Math.pow(d - 4, 2) * 0.4;
        if (d < 4) c = (x + y) % 4 === 0 || d === 0 ? '#9a2f2a' : '#d9452f';
        else if (Math.abs(x - bayMid) < half) {
          const t = 0.6 - d * 0.015 + (Math.sin(x * 0.3 + y * 1.7) > 0.7 ? 0.1 : 0);
          c = ramp(SKY, y % 2 ? t : t - 0.12, x, y);
        }
      }
      cv.px(x, y, c);
    }
  }
  // A sea cave under the coast road: dark air, then the surge.
  const { cave } = COAST;
  for (let x = cave.x - cave.rx; x <= cave.x + cave.rx; x++)
    for (let y = GROUND + 2; y < H; y++) {
      const u = (x - cave.x) / cave.rx;
      const v = (y - H - 1) / cave.ry;
      if (u * u + v * v > 1) continue;
      if (y < cave.water) cv.px(x, y, (x + y) % 5 ? '#241c42' : '#2b2150');
      else if (y === cave.water) cv.px(x, y, (x * 7) % 5 < 2 ? '#f4ecdc' : '#73c6f7');
      else cv.px(x, y, (x + y * 3) % 11 < 2 ? '#94b0e0' : y % 2 ? '#3b5dc9' : '#29366f');
    }
  // A fossil under the prairie: Nebraska is famous for them.
  const fossil = ['..BBB..........', '.BKBBB.........', 'BBBBBBBBBBBBB..', '.B.B.B.B.B.B.BB', '...B...B...B..B'];
  cv.sprite(694, GROUND + 6, fossil, { B: '#e9d0a8', K: '#3d2a28' });
  // Union Square station: platform, the wall sign, stairs from the street.
  const [p0, p1] = SUBWAY.platform;
  cv.rect(p0, GROUND + 9, p1 - p0, H - GROUND - 9, '#bdb3a0');
  cv.rect(p0, GROUND + 9, p1 - p0, 1, C.gold);
  for (let x = p0; x < p1; x += 6) cv.rect(x, GROUND + 11, 1, H - GROUND - 11, '#a89f8c');
  cv.rect(p0 + 30, GROUND + 2, 50, 6, '#7a2a3a');
  cv.rect(p0 + 30, GROUND + 2, 50, 1, '#d6ccb8');
  cv.rect(p0 + 30, GROUND + 7, 50, 1, '#d6ccb8');
  text(cv, p0 + 35, GROUND + 3, 'UNION SQ', C.cream);
  for (let i = 0; i < 8; i++) cv.rect(3410 - i * 2, GROUND + 1 + i, 3, 1, '#94a0c2');
  rand();
}

function tunnel(x, y) {
  if (y === GROUND) return '#2b2150';
  if (y === GROUND + 1) return x % 24 < 2 ? '#ffe9a8' : '#1b1533';
  if (y < GROUND + 6) return (x + y) % 4 ? '#2b2150' : '#33275a';
  if (y === H - 2) return '#94a0c2';
  if (y === H - 1) return x % 3 ? '#3d2f4a' : '#1b1533';
  return '#141026';
}

// ---------------------------------------------------------------------------
// Far layer: moves at half speed; things sit behind their near-layer places.

export function journeyFar() {
  const cv = new Layer(FW, H);
  const rand = rng(1971);
  const base = 156;
  const at = (x) => Math.round(farX(x));
  // Rolling hills the whole way, colored by time of day.
  for (let x = 0; x < FW; x++) {
    const nearX = (x - farX(0)) / journeyArt.farSpeed;
    const h1 = 30 + 6 * Math.sin(x / 41) + 4 * Math.sin(x / 13);
    const h2 = 18 + 4 * Math.sin(x / 23 + 2) + 2 * Math.sin(x / 7);
    for (let y = Math.round(base - h1); y < base; y++) cv.px(x, y, tod(['#94a8c8', '#8fb0d0', '#a8607a', '#241c42'], nearX, y));
    for (let y = Math.round(base - h2); y < base; y++) cv.px(x, y, tod(['#6b8a8a', '#5a8a7a', '#7a4060', '#1b1533'], nearX, y));
  }
  // Kearney: farm silos and the water tower.
  for (const [x, h] of [
    [at(120), 26],
    [at(140), 20],
  ]) {
    cv.rect(x, base - 20 - h, 6, h, '#8494b4');
    cv.rect(x + 1, base - 21 - h, 4, 1, '#8494b4');
  }
  const wt = at(560);
  cv.line(wt - 5, 132, wt - 8, base, '#7a8aa8');
  cv.line(wt + 5, 132, wt + 8, base, '#7a8aa8');
  cv.rect(wt - 8, 118, 17, 14, '#8a9ab8');
  cv.rect(wt - 6, 116, 13, 2, '#8a9ab8');
  // Lincoln: downtown towers and Pinnacle Bank Arena's swooping roof.
  for (const [x, w, h] of [
    [at(1180), 6, 28],
    [at(1192), 8, 40],
    [at(1206), 5, 22],
  ]) {
    cv.rect(x, base - h - 20, w, h, '#7a90b8');
    for (let y = base - h - 18; y < base - 22; y += 3) for (let i = x + 1; i < x + w - 1; i += 2) cv.px(i, y, '#9ab0d0');
  }
  const ar = at(1250);
  for (let x = ar - 14; x < ar + 14; x++) {
    const top = Math.round(base - 34 + Math.abs(x - ar) * 0.4 - Math.sin((x - ar) / 5) * 2);
    cv.rect(x, top, 1, base - 20 - top, '#8aa0c0');
  }
  // Omaha: the First National Bank tower and friends.
  for (const [x, w, h, col] of [
    [at(1600), 7, 36, '#8a8ab0'],
    [at(1612), 9, 52, '#9a9ac0'],
    [at(1624), 6, 30, '#8080a8'],
    [at(1660), 8, 40, '#8a8ab0'],
  ]) {
    cv.rect(x, base - h - 20, w, h, col);
    for (let y = base - h - 18; y < base - 22; y += 3) for (let i = x + 1; i < x + w - 1; i += 2) cv.px(i, y, '#b0b0d0');
  }
  cv.rect(at(1612) + 2, base - 80, 5, 8, '#9a9ac0');
  // San Francisco: the Bay Bridge, Sutro Tower, the headlands, the Monterey coast.
  const bb = [at(1900), at(2080)];
  for (let x = bb[0]; x < bb[1]; x++) {
    cv.px(x, 118, '#c9bfd9');
    const u = ((x - bb[0]) % 45) / 45;
    cv.px(x, Math.round(102 + Math.pow(2 * u - 1, 2) * 14), '#d6ccec');
  }
  for (let x = bb[0]; x < bb[1]; x += 45) cv.rect(x, 98, 2, 22, '#d6ccec');
  const st = at(1960);
  cv.rect(st, 72, 1, 46, '#5a3a6a');
  cv.line(st - 6, 92, st, 72, '#5a3a6a');
  cv.line(st + 6, 92, st, 72, '#5a3a6a');
  cv.rect(st - 6, 66, 1, 26, '#5a3a6a');
  cv.rect(st + 6, 66, 1, 26, '#5a3a6a');
  cv.px(st - 6, 65, C.red);
  cv.px(st + 6, 65, C.red);
  // The sea: the Pacific off Monterey, which past fast travel becomes the East River.
  // One flat color per row (see sea() in the kit), so the near layer's coast lines up.
  const sea0 = 1386;
  const sea1 = 1716;
  for (let x = sea0 - 40; x < sea1; x++) {
    const night = clamp(((x - farX(0)) / journeyArt.farSpeed - 2880) / 360);
    for (let y = HORIZON; y < base; y++) cv.px(x, y, sea(x, y, night));
  }
  // The Marin Headlands behind the Golden Gate, sloping down into the sea; below the
  // tip the shore runs diagonally toward the viewer, with a line of surf.
  const tipY = HORIZON + 10;
  for (let x = at(2270); x < sea0 + 60; x++) {
    const h = 46 + 10 * Math.sin(x / 9) + 4 * Math.sin(x / 3.1);
    const fall = clamp((x - (sea0 - 60)) / 60);
    const top = x < sea0 ? Math.round((base - h) * (1 - fall) + tipY * fall) : tipY + Math.round((x - sea0) / 1.4);
    for (let y = top; y < base; y++) cv.px(x, y, y < top + 2 ? '#d8706a' : '#7a3a6a');
    if (x >= sea0) cv.px(x + 1, top + (x % 3 ? 0 : 1), '#f4ecdc');
  }
  // Point Lobos, low on the horizon past Carmel Bay.
  for (let x = 1468; x < 1514; x++) {
    const u = (x - 1468) / 46;
    const top = Math.round(HORIZON - 6 * Math.pow(Math.sin(Math.PI * u), 0.6) * (u < 0.4 ? 1 : 0.7));
    for (let y = top; y <= HORIZON; y++) cv.px(x, y, y === top ? '#d8706a' : '#b8607a');
  }
  // Manhattan's seawall where the river ends.
  cv.rect(sea1 - 4, HORIZON + 2, 4, base - HORIZON - 2, '#241c42');
  // New York: the Brooklyn Bridge, then Midtown with the Chrysler crown.
  const bk = at(3060);
  for (const tx of [bk, bk + 44]) {
    cv.rect(tx, 108, 6, 40, '#3d3058');
    cv.rect(tx + 1, 113, 1, 9, '#141026');
    cv.rect(tx + 4, 113, 1, 9, '#141026');
  }
  for (let x = bk - 20; x < bk + 70; x++) {
    const u = x < bk ? (bk - x) / 20 : x > bk + 44 ? (x - bk - 44) / 26 : Math.abs((x - bk - 22) / 22);
    cv.px(x, Math.round(110 + (x < bk || x > bk + 44 ? u * 18 : (1 - u * u) * 12)), '#5a4a7a');
    cv.px(x, 126, '#3d3058');
    if (x % 6 === 0) cv.px(x, 127, C.gold);
    // The deck's lights, broken up in the river below.
    if (x % 6 === 0) for (let y = 134; y < 150; y += 3) if ((x + y) % 4) cv.px(x + ((y >> 2) & 1), y, '#8a6a5a');
  }
  let x = at(3260);
  while (x < FW) {
    const w = 6 + Math.floor(rand() * 10);
    const h = 30 + Math.floor(rand() * 50);
    cv.rect(x, base - h, w, h, rand() > 0.5 ? '#2b2150' : '#33275a');
    for (let y = base - h + 2; y < base - 2; y += 3)
      for (let i = x + 1; i < x + w - 1; i += 2) if (rand() > 0.72) cv.px(i, y, rand() > 0.6 ? C.gold : C.berry);
    x += w + (rand() > 0.8 ? 1 : 0);
  }
  const ch = at(3620);
  cv.rect(ch - 5, 86, 11, base - 86, '#2b2150');
  for (let k = 0; k < 5; k++) cv.rect(ch - (4 - k), 86 - (k + 1) * 3, (4 - k) * 2 + 1, 3, C.steel);
  for (let k = 0; k < 5; k++) for (let i = ch - (3 - k); i <= ch + (3 - k); i += 2) cv.px(i, 85 - k * 3, C.sun);
  cv.rect(ch, 62, 1, 10, C.steel);
  return cv;
}

// ---------------------------------------------------------------------------
// Walker: 18×28 facing right. Frames 0–7 walk, 8–9 idle (breathing),
// 10 faces out, 11–12 wave.

const HEAD = [
  '.......KKKKK......',
  '.....KKHHHHHKK....',
  '....KHHHHHHHHHK...',
  '...KHHHhhhhhHHHK..',
  '...KHHHHHHHHHHHK..',
  '...KHHHHHHHHHSSK..',
  '...KHHHHHHHSSSSSK.',
  '...KHHHHHsSSSKSSK.',
  '...KHHHHsSSSSSSSSK',
  '....KHHHsSSSSSSSK.',
  '.....KHHSSSSSMMK..',
  '......KKsSSSSSK...',
  '.......KsSSKK.....',
];
const TORSO = [
  '......KJJJWWWK....',
  '.....KJJJJWWWJK...',
  '.....KJJJJJWJJK...',
  '.....KJJJJJWJJK...',
  '.....KJJJJJJJJK...',
  '.....KJJJJJJJJK...',
  '.....KjjjjjjjjK...',
];
const FRONT = [
  '......KKKKKK......',
  '....KKHHHHHHKK....',
  '...KHHHHHHHHHHK...',
  '...KHHhhhhHHHHK...',
  '..KHHHHHHHHHHHHK..',
  '..KHHSSSSSSSSHHK..',
  '..KHSSSSSSSSSSHK..',
  '..KSSKKSSSSKKSSK..',
  '..KSSSSSSSSSSSSK..',
  '..KsSSSSSSSSSSsK..',
  '...KSSSMMMMSSSK...',
  '....KSSSSSSSSK....',
  '.....KKsSSsKK.....',
  '......KsSSsK......',
  '....KJJJWWJJJK....',
  '...KJJJJWWJJJJK...',
  '...KJJJJWWJJJJK...',
  '..KjJJJJWWJJJJjK..',
  '..KjJJJJJJJJJJjK..',
  '..KjJJJJJJJJJJjK..',
  '..KSJJJJJJJJJJSK..',
  '...KjjjjjjjjjjK...',
  '....KLLLKKLLLK....',
  '....KLLLKKLLLK....',
  '....KLLLKKLLLK....',
  '....KLLLKKLLLK....',
  '...KBBBBKKBBBBK...',
  '...KKKKKKKKKKKK...',
];
// [near foot dx, near lift, far foot dx, far lift, bob, near hand dx]
const WALK_FRAMES = [
  [4, 0, -4, 0, 0, -5],
  [2, 0, -3, 1, 1, -3],
  [0, 0, 1, 2, 0, 0],
  [-3, 0, 4, 1, -1, 3],
  [-4, 0, 4, 0, 0, 5],
  [-3, 1, 2, 0, 1, 3],
  [1, 2, 0, 0, 0, 0],
  [4, 1, -3, 0, -1, -3],
  [1, 0, -1, 0, 0, 0],
  [1, 0, -1, 0, -1, 0],
];
const PAL = {
  K: '#0c0a18',
  H: '#5c3a2e',
  h: '#8a5a3c',
  S: '#f2c4a2',
  s: '#d39a78',
  M: '#a8504a',
  W: '#fdf6e3',
  J: '#2b3a6e',
  j: '#1b2448',
  a: '#141a36',
  L: '#24305a',
  l: '#161e3c',
  B: '#3a2430',
  b: '#241820',
};

export function journeyWalker() {
  const { w: WW, h: WH, frames } = journeyArt.walker;
  const cv = new Layer(WW * frames, WH);
  const cx = 9;
  WALK_FRAMES.forEach(([nd, nl, fd, fl, bob, swing], i) => {
    const ox = i * WW;
    const hip = 20 + bob;
    const leg = (dx, lift, color, shoe) => {
      const fx = cx + dx;
      const fy = WH - 1 - lift;
      const kx = Math.round((cx + fx) / 2 + (lift > 0 ? 1 : 0));
      const ky = Math.round((hip + fy) / 2);
      for (const [ax, ay, bx, by] of [
        [cx, hip, kx, ky],
        [kx, ky, fx, fy - 1],
      ]) {
        cv.line(ox + ax, ay, ox + bx, by, color);
        cv.line(ox + ax - 1, ay, ox + bx - 1, by, color);
      }
      cv.rect(ox + fx - 2, fy, 5, 1, shoe);
      cv.rect(ox + fx - 2, fy - 1, 3, 1, shoe);
      cv.px(ox + fx + 3, fy, PAL.K);
    };
    // Far arm and leg behind the body, then the body, then the near leg and arm.
    const limb = (dx, color, hand) => {
      cv.line(ox + cx, 14 + bob, ox + cx + Math.round(dx / 2), 16 + bob, color);
      cv.line(ox + cx + Math.round(dx / 2), 16 + bob, ox + cx + dx, 18 + bob, color);
      cv.line(ox + cx + 1, 14 + bob, ox + cx + 1 + Math.round(dx / 2), 16 + bob, color);
      cv.rect(ox + cx + dx, 19 + bob, 2, 2, hand);
    };
    limb(-swing, PAL.a, PAL.s);
    leg(fd, fl, PAL.l, PAL.b);
    cv.sprite(ox, bob, HEAD, PAL);
    cv.sprite(ox, 13 + bob, TORSO, PAL);
    leg(nd, nl, PAL.L, PAL.B);
    limb(swing, PAL.j, PAL.S);
  });
  // Facing out, then waving with the raised arm in two positions.
  cv.sprite(10 * WW, 0, FRONT, PAL);
  for (const [i, hand] of [
    [11, [0, 6]],
    [12, [1, 2]],
  ]) {
    const ox = i * WW;
    cv.sprite(ox, 0, FRONT.map((r, y) => (y >= 17 && y <= 20 ? r.slice(0, 2) + '.' + r.slice(3) : r)), PAL);
    cv.rect(ox + 2, 17, 2, 4, PAL.J);
    cv.line(ox + 3, 15, ox + hand[0] + 1, hand[1] + 2, PAL.J);
    cv.line(ox + 4, 15, ox + hand[0] + 2, hand[1] + 2, PAL.j);
    cv.rect(ox + hand[0], hand[1] - 1, 3, 3, PAL.S);
  }
  return cv;
}

// ---------------------------------------------------------------------------
// Vehicles, facing right, wheels on the bottom row of the sheet.

export function journeyVehicles() {
  const SH = vehicleSheet.h;
  const B = SH - 1; // bottom row
  const cv = new Layer(vehicleSheet.w, SH);
  const glass = '#c6e6f2';
  const glassD = '#94b0c2';
  const wheel = (x, r = 3) => {
    cv.disc(x, B - r, r + 1, '#0c0a18');
    cv.disc(x, B - r, r, '#2b2150');
    cv.disc(x, B - r, Math.max(1, r - 2), '#94a0c2');
    cv.px(x, B - r, '#566c86');
  };
  // Dark wheel wells cut into the body, drawn before the wheels.
  const well = (x, r = 3) => cv.disc(x, B - r, r + 2, '#141026');
  const v = vehicles;

  // Pickup: a red Nebraska farm truck with a cab, a long bed and a hay bale.
  let x = v.pickup.x;
  cv.rect(x + 1, B - 11, 54, 7, '#e43b44');
  cv.rect(x + 1, B - 11, 54, 1, '#ff6b7f');
  cv.rect(x + 1, B - 5, 55, 2, '#a82a34');
  cv.rect(x + 1, B - 13, 30, 2, '#a82a34');
  cv.rect(x + 2, B - 15, 12, 4, '#e9d0a8');
  cv.rect(x + 2, B - 15, 12, 1, '#f4e0b0');
  for (let i = x + 3; i < x + 14; i += 3) cv.px(i, B - 13, '#c9a26b');
  cv.poly([[x + 32, B - 11], [x + 33, B - 18], [x + 44, B - 18], [x + 48, B - 11]], '#e43b44');
  cv.poly([[x + 35, B - 12], [x + 35, B - 17], [x + 43, B - 17], [x + 46, B - 12]], glass);
  cv.line(x + 38, B - 16, x + 41, B - 13, '#ffffff');
  cv.rect(x + 31, B - 11, 1, 6, '#a82a34');
  cv.rect(x + 45, B - 9, 2, 1, '#a82a34');
  cv.rect(x + 54, B - 9, 2, 2, '#ffe9a8');
  cv.rect(x + 1, B - 10, 1, 2, '#ff6b7f');
  cv.rect(x + 50, B - 5, 6, 2, '#c9cfe0');
  for (const wx of [x + 12, x + 45]) {
    well(wx);
    wheel(wx);
  }

  // Sedan.
  x = v.sedan.x;
  cv.poly([[x + 1, B - 3], [x + 1, B - 9], [x + 12, B - 10], [x + 18, B - 16], [x + 34, B - 16], [x + 40, B - 10], [x + 50, B - 9], [x + 51, B - 3]], '#3b5dc9');
  cv.rect(x + 2, B - 9, 48, 1, '#5a7ae0');
  cv.poly([[x + 15, B - 10], [x + 19, B - 15], [x + 25, B - 15], [x + 25, B - 10]], glass);
  cv.poly([[x + 27, B - 10], [x + 27, B - 15], [x + 33, B - 15], [x + 38, B - 10]], glass);
  cv.line(x + 20, B - 14, x + 23, B - 11, '#ffffff');
  cv.rect(x + 26, B - 15, 1, 11, '#29366f');
  cv.rect(x + 29, B - 8, 3, 1, '#29366f');
  cv.rect(x + 1, B - 4, 51, 2, '#29366f');
  cv.rect(x + 49, B - 8, 2, 2, '#ffe9a8');
  cv.rect(x + 1, B - 8, 2, 2, '#ff6b7f');
  for (const wx of [x + 11, x + 41]) {
    well(wx);
    wheel(wx);
  }

  // Tractor: a green farm tractor, big rear wheel, little front one, an exhaust stack, a farmer.
  x = v.tractor.x;
  cv.rect(x + 14, B - 15, 26, 8, '#38b764');
  cv.rect(x + 14, B - 15, 26, 1, '#a7f070');
  cv.rect(x + 22, B - 13, 14, 1, '#257156');
  cv.rect(x + 38, B - 13, 3, 4, '#c9cfe0');
  cv.rect(x + 34, B - 22, 2, 7, '#566c86');
  cv.rect(x + 34, B - 23, 2, 1, '#141026');
  cv.rect(x + 6, B - 25, 16, 2, '#ffcd75');
  cv.rect(x + 7, B - 23, 1, 9, '#141026');
  cv.rect(x + 20, B - 23, 1, 9, '#141026');
  cv.rect(x + 11, B - 22, 4, 3, '#f2c4a2');
  cv.rect(x + 10, B - 23, 6, 1, '#c9a26b');
  cv.rect(x + 11, B - 19, 5, 4, '#3b5dc9');
  cv.disc(x + 12, B - 8, 8, '#141026');
  cv.disc(x + 12, B - 8, 6, '#2b2150');
  for (let a = 0; a < 8; a++) cv.px(x + 12 + Math.round(Math.cos(a * 0.785) * 7), B - 8 + Math.round(Math.sin(a * 0.785) * 7), '#3d2f4a');
  cv.disc(x + 12, B - 8, 3, '#ffcd75');
  cv.px(x + 12, B - 8, '#c9a26b');
  cv.disc(x + 34, B - 4, 4, '#141026');
  cv.disc(x + 34, B - 4, 2, '#ffcd75');

  // City bus: white with a blue stripe, big windows, a lit destination sign.
  x = v.bus.x;
  cv.rect(x + 1, B - 25, 102, 22, '#e9edf7');
  cv.rect(x + 2, B - 26, 100, 1, '#e9edf7');
  cv.rect(x + 1, B - 25, 102, 1, '#ffffff');
  cv.rect(x + 1, B - 8, 102, 3, '#3b5dc9');
  cv.rect(x + 1, B - 5, 102, 2, '#94a0c2');
  for (let i = x + 6; i < x + 80; i += 12) {
    cv.rect(i, B - 22, 10, 9, '#29366f');
    cv.rect(i + 1, B - 21, 3, 3, '#3b5dc9');
  }
  cv.rect(x + 84, B - 22, 8, 17, '#29366f');
  cv.rect(x + 87, B - 22, 1, 17, '#94a0c2');
  cv.rect(x + 94, B - 23, 8, 12, glass);
  cv.line(x + 95, B - 22, x + 99, B - 15, '#ffffff');
  cv.rect(x + 92, B - 25, 10, 2, '#141026');
  for (let i = x + 93; i < x + 101; i += 2) cv.px(i, B - 24, '#ffcd75');
  cv.rect(x + 101, B - 9, 2, 2, '#ffe9a8');
  cv.rect(x + 1, B - 10, 2, 2, '#ff6b7f');
  for (const wx of [x + 18, x + 82]) {
    well(wx, 4);
    wheel(wx, 4);
  }

  // Convertible with a surfboard and the driver's arm out.
  x = v.convertible.x;
  cv.poly([[x + 1, B - 3], [x + 1, B - 10], [x + 50, B - 10], [x + 51, B - 3]], '#2fa8b5');
  cv.rect(x + 1, B - 10, 50, 1, '#73eff7');
  cv.rect(x + 1, B - 4, 51, 2, '#1f6a74');
  cv.line(x + 31, B - 11, x + 34, B - 15, glass);
  cv.line(x + 32, B - 11, x + 35, B - 15, glass);
  cv.rect(x + 20, B - 15, 5, 5, '#5c3a2e');
  cv.rect(x + 21, B - 14, 4, 3, '#f2c4a2');
  cv.rect(x + 23, B - 13, 2, 1, '#141026');
  cv.rect(x + 18, B - 12, 8, 2, '#ffcd75');
  cv.rect(x + 3, B - 17, 40, 3, '#ffcd75');
  cv.rect(x + 3, B - 17, 40, 1, '#ffe9a8');
  cv.rect(x + 3, B - 16, 2, 2, '#ef7d57');
  cv.rect(x + 22, B - 16, 1, 2, '#ef7d57');
  cv.rect(x + 49, B - 8, 2, 2, '#ffe9a8');
  for (const wx of [x + 11, x + 41]) {
    well(wx);
    wheel(wx);
  }

  // A historic Muni streetcar, green and cream, with its trolley pole up to the wire.
  x = v.muni.x;
  cv.rect(x + 2, B - 22, 92, 18, '#3a7a5a');
  cv.rect(x + 4, B - 24, 88, 2, '#2f6a4a');
  cv.rect(x + 2, B - 22, 92, 3, '#f4ecdc');
  cv.rect(x + 2, B - 8, 92, 2, '#f4ecdc');
  cv.rect(x + 2, B - 6, 92, 2, '#2f5a44');
  for (let i = x + 6; i < x + 90; i += 8) cv.rect(i, B - 18, 6, 6, (i / 8) % 3 ? '#ffe9a8' : '#ffcd75');
  cv.rect(x + 45, B - 18, 6, 12, '#2f5a44');
  cv.line(x + 30, B - 25, x + 56, B - 27, '#141026');
  cv.rect(x + 54, B - 27, 3, 1, '#566c86');
  cv.rect(x + 2, B - 21, 2, 2, '#ffe9a8');
  for (const wx of [x + 14, x + 24, x + 72, x + 82]) {
    cv.disc(wx, B - 2, 2, '#141026');
    cv.px(wx, B - 2, '#94a0c2');
  }
  cv.rect(x + 10, B - 3, 18, 1, '#141026');
  cv.rect(x + 68, B - 3, 18, 1, '#141026');

  // Taxi, with the roof light and the checker stripe.
  x = v.taxi.x;
  cv.poly([[x + 1, B - 3], [x + 1, B - 9], [x + 12, B - 10], [x + 18, B - 16], [x + 34, B - 16], [x + 40, B - 10], [x + 50, B - 9], [x + 51, B - 3]], '#ffcd75');
  cv.rect(x + 2, B - 9, 48, 1, '#ffe9a8');
  cv.poly([[x + 15, B - 10], [x + 19, B - 15], [x + 25, B - 15], [x + 25, B - 10]], glass);
  cv.poly([[x + 27, B - 10], [x + 27, B - 15], [x + 33, B - 15], [x + 38, B - 10]], glass);
  cv.line(x + 20, B - 14, x + 23, B - 11, '#ffffff');
  cv.rect(x + 26, B - 15, 1, 11, '#d8a040');
  for (let i = x + 3; i < x + 50; i += 2) {
    cv.px(i, B - 7, (i - x) % 4 < 2 ? '#141026' : '#ffcd75');
    cv.px(i + 1, B - 6, (i - x) % 4 < 2 ? '#ffcd75' : '#141026');
  }
  cv.rect(x + 22, B - 18, 8, 2, '#f4ecdc');
  cv.rect(x + 23, B - 18, 6, 1, '#ffffff');
  cv.rect(x + 1, B - 4, 51, 2, '#a87830');
  cv.rect(x + 49, B - 9, 2, 2, '#ffe9a8');
  cv.rect(x + 1, B - 9, 2, 2, '#ff6b7f');
  for (const wx of [x + 11, x + 41]) {
    well(wx);
    wheel(wx);
  }
  return cv;
}

// ---------------------------------------------------------------------------
// Clouds: three 40-row bands (far, mid, near), each in day and dusk colors.
// Each band tiles horizontally, so nothing may cross its left or right edge.

export function journeyClouds() {
  const cv = new Layer(480, 240);
  const rand = rng(77);
  const puff = (cx, base, w, h, [lit, mid, shade], band) => {
    const y0 = band * 40;
    const bumps = Math.max(3, Math.round(w / 8));
    for (let i = 0; i < bumps; i++) {
      const bx = Math.round(cx - w / 2 + (w * (i + 0.5)) / bumps);
      const r = Math.max(2, Math.round(h * (0.45 + 0.55 * Math.sin(((i + 0.5) / bumps) * Math.PI)) * (0.85 + rand() * 0.3)));
      cv.disc(bx, y0 + base - r, r, mid);
      cv.disc(bx - 1, y0 + base - r - 1, Math.max(1, r - 2), lit);
    }
    cv.rect(Math.round(cx - w / 2), y0 + base - 1, Math.round(w), 2, mid);
    cv.rect(Math.round(cx - w / 2) + 3, y0 + base + 1, Math.round(w) - 6, 1, shade);
  };
  const layouts = [
    // Far: small and many.
    [
      [30, 30, 26, 4],
      [96, 22, 34, 5],
      [170, 32, 22, 4],
      [236, 18, 30, 5],
      [310, 28, 40, 5],
      [384, 20, 24, 4],
      [444, 32, 28, 4],
    ],
    // Mid: medium puffs.
    [
      [60, 32, 56, 9],
      [180, 28, 70, 10],
      [300, 34, 48, 8],
      [410, 30, 62, 9],
    ],
    // Near: big and chunky.
    [
      [100, 36, 110, 14],
      [330, 34, 130, 15],
    ],
  ];
  const day = ['#ffffff', '#f4ecdc', '#c9bfd9'];
  const dusk = ['#ffd8b8', '#f7a35c', '#b8405e'];
  layouts.forEach((list, band) =>
    list.forEach(([x, y, w, h]) => {
      puff(x, y, w, h, day, band);
      puff(x, y, w, h, dusk, band + 3);
    }),
  );
  return cv;
}

// Run directly: write the PNGs (and optional 3× previews with --preview <dir>).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = new URL('../../public/art/', import.meta.url).pathname;
  const at = process.argv.indexOf('--preview');
  const preview = at > -1 ? process.argv[at + 1] : null;
  mkdirSync(out, { recursive: true });
  if (preview) mkdirSync(preview, { recursive: true });
  const layers = {
    'journey-near': journeyNear,
    'journey-far': journeyFar,
    'journey-walker': journeyWalker,
    'journey-vehicles': journeyVehicles,
    'journey-clouds': journeyClouds,
  };
  for (const [name, draw] of Object.entries(layers)) {
    const cv = draw();
    const png = cv.png();
    writeFileSync(out + name + '.png', png);
    if (preview) writeFileSync(`${preview}/${name}.png`, cv.png(name === 'journey-near' || name === 'journey-far' ? 1 : 4));
    console.log(`${name}.png  ${cv.width}×${cv.height}  ${(png.length / 1024).toFixed(1)} KB`);
  }
}
