// "The road so far" side-scroller art, drawn in code on transparent layers:
//   journey-near      4400×196  the places themselves, walked past at full speed
//   journey-far       2460×196  hills and skylines that drift past at half speed
//   journey-walker     208×24   Charlie: 8 walk frames, 2 idle, 3 facing out (wave)
//   journey-vehicles   260×16   pickups, a tractor, buses, a convertible, cabs
//   journey-clouds     480×240  three cloud bands, in day and dusk colors
// The sky is CSS. Positions and time of day come from src/data/journey.ts. The
// places themselves live in journey-west, journey-coast and journey-city.
//
// Run directly to write the PNGs: node scripts/art/journey.mjs [--preview dir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { C, SKY, ramp, rng } from './lib.mjs';
import { farX, journeyArt, vehicles, vehicleSheet } from '../../src/data/journey.ts';
import { CURB, FW, GROUND, H, LAWN, Layer, NW, STREET, WALK, text, tod } from './journey-kit.mjs';
import { nebraska, fastTravel } from './journey-west.mjs';
import { GG, sanFrancisco } from './journey-coast.mjs';
import { SUBWAY, newYork } from './journey-city.mjs';

const PEBBLE = [2672, 2916];

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
  for (let x = 0; x < NW; x++) {
    const onBridge = x >= GG.x0 && x < GG.x1;
    if (!onBridge)
      for (let y = LAWN; y < WALK; y++) {
        const lawn = y === LAWN ? ['#a7f070', '#a7f070', '#c8a050', '#2b2150'] : ['#38b764', '#38b764', '#8a8a3a', '#241c42'];
        const plaza = y === LAWN ? ['#c9bfd9', '#c9bfd9', '#8a6a7a', '#3d2f66'] : ['#a99fc4', '#a99fc4', '#6e4f66', '#2b2150'];
        cv.px(x, y, tod(x > 3040 ? plaza : lawn, x, y));
      }
    for (let y = WALK; y < CURB; y++) {
      const joint = x % 12 === 0;
      const slab = y === WALK ? ['#e9e0f0', '#f4f4f4', '#f7c08a', '#4f3d7d'] : ['#bdb3db', '#c9c3e0', '#c88a6a', '#3d2f66'];
      let c = joint ? tod(['#94a0c2', '#94a0c2', '#a8605e', '#2b2150'], x, y) : tod(slab, x, y);
      if (onBridge) c = y === WALK ? '#ff8e5e' : (x + y) % 5 ? '#b8605a' : '#a8504a';
      cv.px(x, y, c);
    }
    cv.px(x, CURB, onBridge ? '#d9452f' : tod(['#6e6480', '#6e6480', '#7a3a5a', '#1b1533'], x, CURB));
    for (let y = STREET; y < GROUND; y++) {
      let c = tod(['#4a4466', '#4a4466', '#4a3058', '#1f1838'], x, y);
      if (y === 173 && x % 14 < 7) c = C.gold;
      if ((x * 7 + y * 13) % 41 === 0) c = tod(['#5a5478', '#5a5478', '#5a3a62', '#2b2150'], x, y);
      cv.px(x, y, c);
    }
  }
}

function underground(cv, rand) {
  for (let x = 0; x < NW; x++) {
    const onBridge = x >= GG.x0 && x < GG.x1;
    const pebble = x >= PEBBLE[0] && x < PEBBLE[1];
    for (let y = GROUND; y < H; y++) {
      let c;
      if (onBridge) {
        // Truss under the roadway, then the bay.
        if (y < GROUND + 4) c = (x + y) % 4 === 0 || y === GROUND ? '#9a2f2a' : '#d9452f';
        else {
          const t = 0.6 - (y - GROUND) * 0.015 + (Math.sin(x * 0.3 + y * 1.7) > 0.7 ? 0.1 : 0);
          c = ramp(SKY, y % 2 ? t : t - 0.12, x, y);
        }
      } else if (pebble) {
        // Cliff rock above the surf.
        if (y < GROUND + 9) c = (x * 3 + y * 5) % 7 === 0 ? '#7a6a7a' : y === GROUND ? '#3d2f3a' : '#5c4a5a';
        else c = (x + y * 3) % 9 < 2 ? '#f4ecdc' : y % 2 ? '#3b5dc9' : '#29366f';
      } else if (x >= SUBWAY.x0 && x < SUBWAY.x1) {
        c = tunnel(x, y);
      } else {
        // Soil with stones.
        c = y === GROUND ? '#2a1c24' : (x * 7 + y * 13) % 23 === 0 ? '#6e5a5a' : (x + y) % 3 ? '#4a3430' : '#3d2a28';
      }
      cv.px(x, y, c);
    }
  }
  // A fossil under the prairie: Nebraska is famous for them.
  const fossil = ['..BBB..........', '.BKBBB.........', 'BBBBBBBBBBBBB..', '.B.B.B.B.B.B.BB', '...B...B...B..B'];
  cv.sprite(694, 186, fossil, { B: '#e9d0a8', K: '#3d2a28' });
  // Union Square station: platform, the wall sign, stairs from the street.
  const [p0, p1] = SUBWAY.platform;
  cv.rect(p0, 189, p1 - p0, H - 189, '#bdb3a0');
  cv.rect(p0, 189, p1 - p0, 1, C.gold);
  for (let x = p0; x < p1; x += 6) cv.rect(x, 191, 1, H - 191, '#a89f8c');
  cv.rect(p0 + 30, 182, 50, 6, '#7a2a3a');
  cv.rect(p0 + 30, 182, 50, 1, '#d6ccb8');
  cv.rect(p0 + 30, 187, 50, 1, '#d6ccb8');
  text(cv, p0 + 35, 183, 'UNION SQ', C.cream);
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
  for (let x = at(2270); x < at(2700); x++) {
    const h = 46 + 10 * Math.sin(x / 9) + 4 * Math.sin(x / 3.1);
    for (let y = Math.round(base - h); y < base; y++) cv.px(x, y, y < base - h + 2 ? '#d8706a' : '#7a3a6a');
  }
  for (let x = at(2700); x < at(2930); x++) {
    const h = 30 + 6 * Math.sin(x / 6);
    for (let y = Math.round(base - h); y < base; y++) cv.px(x, y, y < base - h + 2 ? '#e88a6a' : '#6a3a5a');
  }
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
// Walker: 16×24 facing right. Frames 0–7 walk, 8–9 idle (breathing),
// 10 faces out, 11–12 wave.

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
const TORSO = ['.....KJJJWWK....', '....KJJJJWWJK...', '....KJJJJWJJK...', '....KJJJJJJJK...', '....KJJJJJJJK...', '....KJJJJJJJK...', '....KJJJJJJJK...'];
const FRONT = [
  '.....KKKKKK.....',
  '....KHHHHHHK....',
  '...KHHhhHHHHK...',
  '...KHHHHHHHHK...',
  '...KHSSSSSSHK...',
  '...KSSSSSSSSK...',
  '...KSKSSSSKSK...',
  '...KSSSSSSSSK...',
  '....KSSMMSSK....',
  '.....KSSSSK.....',
  '......KssK......',
  '....KJJWWJJK....',
  '...KJJJWWJJJK...',
  '...KJJJWWJJJK...',
  '..KjJJJWWJJJjK..',
  '..KjJJJJJJJJjK..',
  '..KSJJJJJJJJSK..',
  '...KJJJJJJJJK...',
  '....KLLKKLLK....',
  '....KLLKKLLK....',
  '....KLLKKLLK....',
  '....KLLKKLLK....',
  '...KBBBKKBBBK...',
  '...KKKKKKKKKK...',
];
// [near foot dx, near lift, far foot dx, far lift, bob, near hand dx]
const WALK_FRAMES = [
  [3, 0, -3, 0, 0, -4],
  [2, 0, -2, 1, 1, -2],
  [0, 0, 1, 2, 0, 0],
  [-2, 0, 3, 1, -1, 2],
  [-3, 0, 3, 0, 0, 4],
  [-2, 1, 2, 0, 1, 2],
  [1, 2, 0, 0, 0, 0],
  [3, 1, -2, 0, -1, -2],
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
  const cv = new Layer(16 * 13, 24);
  WALK_FRAMES.forEach(([nd, nl, fd, fl, bob, swing], i) => {
    const ox = i * 16;
    const hip = 17 + bob;
    const leg = (dx, lift, color, shoe) => {
      const fx = 8 + dx;
      const fy = 23 - lift;
      const kx = Math.round((8 + fx) / 2 + (lift > 0 ? 1 : 0));
      const ky = Math.round((hip + fy) / 2);
      for (const [ax, ay, bx, by] of [
        [8, hip, kx, ky],
        [kx, ky, fx, fy - 1],
      ]) {
        cv.line(ox + ax, ay, ox + bx, by, color);
        cv.line(ox + ax - 1, ay, ox + bx - 1, by, color);
      }
      cv.rect(ox + fx - 2, fy, 4, 1, shoe);
      cv.px(ox + fx + 2, fy, PAL.K);
    };
    // Far arm and leg behind the body, then the body, then the near leg and arm.
    const limb = (dx, color, hand) => {
      cv.line(ox + 8, 12 + bob, ox + 8 + Math.round(dx / 2), 14 + bob, color);
      cv.line(ox + 8 + Math.round(dx / 2), 14 + bob, ox + 8 + dx, 16 + bob, color);
      cv.px(ox + 8 + dx, 17 + bob, hand);
    };
    limb(-swing, PAL.a, PAL.s);
    leg(fd, fl, PAL.l, PAL.b);
    cv.sprite(ox, bob, HEAD, PAL);
    cv.sprite(ox, 11 + bob, TORSO, PAL);
    leg(nd, nl, PAL.L, PAL.B);
    limb(swing, PAL.j, PAL.S);
    cv.line(ox + 8, 12 + bob, ox + 8 + Math.round(swing / 2) + 1, 14 + bob, PAL.j);
  });
  // Facing out, then waving with the raised arm in two positions.
  cv.sprite(160, 0, FRONT, PAL);
  for (const [i, hand] of [
    [11, [1, 4]],
    [12, [0, 7]],
  ]) {
    const ox = i * 16;
    cv.sprite(ox, 0, FRONT.map((r, y) => (y >= 14 && y <= 16 ? r.slice(0, 2) + '.' + r.slice(3) : r)), PAL);
    cv.rect(ox + 2, 14, 2, 3, PAL.J);
    cv.line(ox + 3, 12, ox + hand[0] + 1, hand[1] + 1, PAL.J);
    cv.line(ox + 4, 12, ox + hand[0] + 2, hand[1] + 1, PAL.j);
    cv.rect(ox + hand[0], hand[1] - 1, 2, 2, PAL.S);
  }
  return cv;
}

// ---------------------------------------------------------------------------
// Vehicles, facing right, wheels on the bottom row.

export function journeyVehicles() {
  const cv = new Layer(vehicleSheet.w, vehicleSheet.h);
  const wheel = (x, r = 2) => {
    cv.disc(x, 15 - r, r, '#141026');
    cv.px(x, 15 - r, '#94a0c2');
  };
  const v = vehicles;
  // Pickup: cab, bed, a red Nebraska truck.
  let x = v.pickup.x;
  cv.rect(x + 1, 8, 32, 5, '#e43b44');
  cv.rect(x + 18, 4, 11, 5, '#e43b44');
  cv.rect(x + 20, 5, 7, 3, '#c6e6f2');
  cv.rect(x + 1, 7, 16, 1, '#a82a34');
  cv.rect(x + 1, 12, 32, 1, '#a82a34');
  cv.px(x + 32, 9, '#ffe9a8');
  cv.px(x + 1, 9, '#ff6b7f');
  wheel(x + 7);
  wheel(x + 27);
  // Sedan.
  x = v.sedan.x;
  cv.rect(x + 1, 10, 28, 4, '#3b5dc9');
  cv.rect(x + 8, 6, 14, 4, '#3b5dc9');
  cv.rect(x + 9, 7, 5, 3, '#c6e6f2');
  cv.rect(x + 15, 7, 6, 3, '#c6e6f2');
  cv.rect(x + 1, 13, 28, 1, '#29366f');
  cv.px(x + 28, 11, '#ffe9a8');
  cv.px(x + 1, 11, '#ff6b7f');
  wheel(x + 7);
  wheel(x + 23);
  // Tractor: big rear wheel, little front one, an exhaust stack.
  x = v.tractor.x;
  cv.rect(x + 6, 5, 16, 6, '#38b764');
  cv.rect(x + 4, 2, 7, 1, '#141026');
  cv.rect(x + 4, 2, 1, 8, '#141026');
  cv.rect(x + 10, 2, 1, 8, '#141026');
  cv.rect(x + 18, 1, 1, 5, '#566c86');
  cv.disc(x + 7, 10, 5, '#141026');
  cv.disc(x + 7, 10, 2, '#ffcd75');
  cv.disc(x + 20, 12, 3, '#141026');
  cv.px(x + 20, 12, '#ffcd75');
  // City bus.
  x = v.bus.x;
  cv.rect(x + 1, 1, 56, 13, '#e9edf7');
  cv.rect(x + 1, 9, 56, 2, '#3b5dc9');
  for (let i = x + 4; i < x + 50; i += 7) cv.rect(i, 3, 5, 4, '#29366f');
  cv.rect(x + 51, 3, 5, 9, '#c6e6f2');
  cv.rect(x + 1, 13, 56, 1, '#94a0c2');
  cv.px(x + 56, 11, '#ffe9a8');
  wheel(x + 10, 2);
  wheel(x + 46, 2);
  // Convertible with a surfboard.
  x = v.convertible.x;
  cv.rect(x + 1, 9, 28, 5, '#2fa8b5');
  cv.rect(x + 1, 9, 28, 1, '#73eff7');
  cv.rect(x + 17, 6, 1, 3, '#c6e6f2');
  cv.rect(x + 10, 5, 3, 4, '#5c3a2e');
  cv.rect(x + 10, 7, 3, 2, '#f2c4a2');
  cv.rect(x + 3, 6, 22, 2, '#ffcd75');
  cv.rect(x + 3, 6, 22, 1, '#ffe9a8');
  cv.px(x + 28, 11, '#ffe9a8');
  wheel(x + 7);
  wheel(x + 23);
  // A historic Muni streetcar, green and cream, with its trolley pole.
  x = v.muni.x;
  cv.rect(x + 1, 3, 52, 11, '#3a7a5a');
  cv.rect(x + 1, 3, 52, 2, '#f4ecdc');
  for (let i = x + 4; i < x + 50; i += 6) cv.rect(i, 6, 4, 4, '#ffe9a8');
  cv.rect(x + 1, 12, 52, 1, '#f4ecdc');
  cv.line(x + 26, 3, x + 40, 0, '#141026');
  wheel(x + 10, 2);
  wheel(x + 44, 2);
  // Taxi.
  x = v.taxi.x;
  cv.rect(x + 1, 9, 28, 5, '#ffcd75');
  cv.rect(x + 8, 5, 14, 4, '#ffcd75');
  cv.rect(x + 9, 6, 5, 3, '#c6e6f2');
  cv.rect(x + 15, 6, 6, 3, '#c6e6f2');
  for (let i = x + 2; i < x + 28; i += 2) cv.px(i, 11, (i / 2) % 2 ? '#141026' : '#ffcd75');
  cv.rect(x + 13, 3, 4, 2, '#f4ecdc');
  cv.rect(x + 1, 13, 28, 1, '#d8a040');
  cv.px(x + 28, 10, '#ffe9a8');
  wheel(x + 7);
  wheel(x + 23);
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
