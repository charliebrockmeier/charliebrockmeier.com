// Shared pieces for the journey art: transparent layers, the ground bands, a
// time-of-day palette picker and a tiny sign font.
import { deflateSync } from 'node:zlib';
import { Canvas, ramp } from './lib.mjs';
import { journeyArt, timeAt } from '../../src/data/journey.ts';

export const { nearWidth: NW, farWidth: FW, height: H, ground: GROUND, horizon: HORIZON, lanes: LANES } = journeyArt;
export const NONE = 'none';

// Ground bands on the near layer.
export const LAWN = 152; // lawn or plaza in front of buildings
export const WALK = 160; // sidewalk the walker walks on
export const CURB = 166;
export const STREET = 167; // two lanes of street down to GROUND, then the cutaway below

/** A canvas whose background is transparent; png() keeps the transparency. */
export class Layer extends Canvas {
  constructor(w, h) {
    super(w, h, NONE);
  }

  png(scale = 1) {
    return encode(this, scale);
  }
}

/** Pick from [morning, day, golden hour, night] by where x is on the walk, dithered across hand-offs. */
export const tod = (colors, x, y) => ramp(colors, timeAt(x) / 3, x, y);

/**
 * The sea, one flat color per row below the horizon, so the near and far layers
 * agree wherever they meet. Golden hour, dusk and night; `night` (0–1) picks, dithered.
 */
const SEA = [
  ['#ffe9a8', '#ffcd75', '#f7a35c', '#ef7d57', '#e08a6a', '#b8607a', '#a86a8a', '#7a6aa8', '#6a6ab0', '#5a6ab8', '#4a64b8', '#3b5dc9', '#3b54b0'],
  ['#f7a35c', '#ef7d57', '#d8706a', '#a8506a', '#9a5a7a', '#6a4a7a', '#62507e', '#4f4a86', '#48488a', '#3d4686', '#384080', '#33407a', '#2f3a72'],
  ['#4f3d7d', '#3d2f66', '#33275a', '#2f2552', '#2b2150', '#241c42', '#241c42', '#1f1a3e', '#1b1533', '#1b1533', '#18132e', '#141026', '#141026'],
];
export function sea(x, y, night = 0) {
  const r = y - HORIZON;
  if (r < 0) return null;
  const band = r === 0 ? 0 : r < 3 ? 1 + (r & 1) : r < 7 ? 3 + (r & 1) : r < 13 ? 5 + (r & 1) : r < 21 ? 7 + (r & 1) : r < 31 ? 9 + (r & 1) : 11 + (r & 1);
  return ramp(SEA.map((p) => p[band]), night, x, y);
}

export const FONT = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  K: ['101', '110', '100', '110', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'],
  Q: ['010', '101', '101', '110', '011'],
  P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '101', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['110', '001', '010', '100', '111'],
  3: ['110', '001', '010', '001', '110'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '110', '001', '110'],
  6: ['011', '100', '110', '101', '010'],
  7: ['111', '001', '010', '010', '010'],
  8: ['010', '101', '010', '101', '010'],
  9: ['111', '101', '111', '001', '111'],
  ',': ['000', '000', '000', '010', '100'],
  '.': ['000', '000', '000', '000', '010'],
  '-': ['000', '000', '111', '000', '000'],
  '>': ['100', '010', '001', '010', '100'],
  '?': ['110', '001', '010', '000', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

/** Draw a string in the 3×5 font; returns the x after the last glyph. */
export function text(cv, x, y, str, color) {
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    g.forEach((row, j) => [...row].forEach((b, i) => b === '1' && cv.px(x + i, y + j, color)));
    x += 4;
  }
  return x;
}

export const textWidth = (str) => str.length * 4 - 1;

/** Brick wall with mortar lines. */
export function bricks(cv, x, y, w, h, brick, mortar) {
  cv.rect(x, y, w, h, brick);
  for (let j = y + 2; j < y + h; j += 3) {
    cv.rect(x, j, w, 1, mortar);
    for (let i = x + (Math.floor((j - y) / 3) % 2 ? 2 : 5); i < x + w; i += 6) cv.px(i, j + 1, mortar);
  }
}

/** A grid of windows; `lit` is the chance a window is lit. */
export function windowGrid(cv, x, y, w, h, rand, { dx = 7, dy = 9, ww = 4, wh = 6, lit = 0.6, on = ['#ffcd75', '#f7a35c', '#ffe9a8'], off = '#1b1533', sill } = {}) {
  for (let j = y; j + wh <= y + h; j += dy)
    for (let i = x; i + ww <= x + w; i += dx) {
      cv.rect(i, j, ww, wh, rand() < lit ? on[Math.floor(rand() * on.length)] : off);
      if (sill) cv.rect(i, j + wh, ww, 1, sill);
    }
}

/** A round tree: trunk plus layered canopy. */
export function tree(cv, x, base, r, colors = ['#257156', '#38b764', '#a7f070'], trunk = '#5c3a2e') {
  cv.rect(x - 1, base - r - 4, 3, r + 4, trunk);
  cv.disc(x, base - r - 6, r, colors[0]);
  cv.disc(x - 2, base - r - 8, Math.max(1, r - 3), colors[1]);
  if (r > 5) cv.disc(x - 4, base - r - 10, Math.max(1, r - 7), colors[2]);
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
