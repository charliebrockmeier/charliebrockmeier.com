// A tiny pixel-art toolkit: an indexed canvas, drawing helpers, ordered dithering
// and a dependency-free PNG encoder. Scenes are drawn in code so they stay editable.
import { deflateSync } from 'node:zlib';

// The site palette ("Dusk"). UI tokens in src/styles/tokens.css use the same values.
export const C = {
  ink: '#0c0a18',
  night: '#141026',
  night2: '#1b1533',
  night3: '#241c42',
  dusk: '#2f2552',
  dusk2: '#3d2f66',
  dusk3: '#4f3d7d',
  haze: '#6b4f96',
  plum: '#5a2a63',
  berry: '#85336b',
  rose: '#b8405e',
  coral: '#ef7d57',
  orange: '#f7a35c',
  gold: '#ffcd75',
  sun: '#ffe9a8',
  cream: '#fdf6e3',
  cyan: '#73eff7',
  teal: '#2fa8b5',
  blue: '#41a6f6',
  navy: '#29366f',
  lime: '#a7f070',
  green: '#38b764',
  pine: '#257156',
  forest: '#1c4a43',
  brown: '#8a5a3c',
  bark: '#5c3a2e',
  tan: '#c9a26b',
  steel: '#94a0c2',
  slate: '#566c86',
  red: '#e43b44',
  white: '#ffffff',
};

// Sky ramp from deep night to the sun's core.
export const SKY = [
  '#141026',
  '#1b1533',
  '#251c45',
  '#352458',
  '#4a2a63',
  '#682f68',
  '#8c3668',
  '#b4415f',
  '#d85a5a',
  '#ef7d57',
  '#f7a35c',
  '#ffcd75',
  '#ffe9a8',
];

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Pick a color from a ramp at t (0–1), with 4×4 ordered dithering between steps. */
export function ramp(colors, t, x, y) {
  const v = Math.min(Math.max(t, 0), 1) * (colors.length - 1);
  const i = Math.floor(v);
  const f = v - i;
  const threshold = (BAYER[y & 3][x & 3] + 0.5) / 16;
  return colors[Math.min(f > threshold ? i + 1 : i, colors.length - 1)];
}

/** Deterministic randomness (mulberry32), so every build draws the same art. */
export function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Canvas {
  constructor(width, height, fill = C.night) {
    this.width = width;
    this.height = height;
    this.data = new Array(width * height).fill(fill);
  }

  px(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (!c || x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.data[y * this.width + x] = c;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.data[y * this.width + x];
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }

  /** Fill a rectangle with a function of (x, y) that returns a color or null. */
  fill(x, y, w, h, fn) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, fn(i, j));
  }

  /** 50% checkerboard of two colors. */
  checker(x, y, w, h, a, b) {
    this.fill(x, y, w, h, (i, j) => ((i + j) & 1 ? b : a));
  }

  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  disc(cx, cy, r, c) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) this.px(cx + x, cy + y, c);
  }

  /** Fill a polygon given as [[x, y], ...] (even-odd rule, sampled at pixel centers). */
  poly(points, c) {
    const ys = points.map((p) => p[1]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y++) {
      const cy = y + 0.5;
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[(i + 1) % points.length];
        if (y0 <= cy !== y1 <= cy) xs.push(x0 + ((cy - y0) / (y1 - y0)) * (x1 - x0));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.px(x, y, c);
    }
  }

  /** Draw rows of palette keys at (x, y); '.' is transparent. */
  sprite(x, y, rows, palette) {
    rows.forEach((row, j) => [...row].forEach((k, i) => k !== '.' && this.px(x + i, y + j, palette[k])));
  }

  /** Encode as an indexed PNG, optionally scaled up (nearest neighbor) for previews. */
  png(scale = 1) {
    const colors = [...new Set(this.data)];
    if (colors.length > 256) throw new Error(`too many colors: ${colors.length}`);
    const index = new Map(colors.map((c, i) => [c, i]));
    const w = this.width * scale;
    const h = this.height * scale;
    const raw = Buffer.alloc((w + 1) * h);
    for (let y = 0; y < h; y++) {
      raw[y * (w + 1)] = 0;
      for (let x = 0; x < w; x++)
        raw[y * (w + 1) + 1 + x] = index.get(this.data[Math.floor(y / scale) * this.width + Math.floor(x / scale)]);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr.set([8, 3, 0, 0, 0], 8);
    const plte = Buffer.from(colors.flatMap((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))));
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('PLTE', plte),
      chunk('IDAT', deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

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

// ---------------------------------------------------------------------------
// Shared scene pieces

/** Lit windows on a building face: a grid of 1px windows, some warm, some dark. */
export function windows(cv, x, y, w, h, rand, { lit = 0.35, step = [2, 3], colors = [C.gold, C.orange, C.sun], off = null } = {}) {
  for (let j = y + 1; j < y + h - 1; j += step[1])
    for (let i = x + 1; i < x + w - 1; i += step[0]) {
      const r = rand();
      if (r < lit) cv.px(i, j, colors[Math.floor(rand() * colors.length)]);
      else if (off) cv.px(i, j, off);
    }
}

/** Stars over dark sky only. */
export function stars(cv, count, rand, maxY, isDark) {
  for (let n = 0; n < count; n++) {
    const x = Math.floor(rand() * cv.width);
    const y = Math.floor(rand() * maxY);
    if (!isDark(x, y)) continue;
    const big = rand() > 0.93;
    const c = rand() > 0.7 ? C.gold : C.cream;
    cv.px(x, y, c);
    if (big) {
      cv.px(x - 1, y, C.haze);
      cv.px(x + 1, y, C.haze);
      cv.px(x, y - 1, C.haze);
      cv.px(x, y + 1, C.haze);
    }
  }
}

/** Mirror the rows above a waterline into the water, darkened and broken into ripples. */
export function reflect(cv, x0, x1, waterY, depth, rand, { tint = (c) => c, gap = 0.3 } = {}) {
  for (let j = 0; j < depth; j++) {
    const shift = Math.round(Math.sin(j * 1.7) * 1.2);
    for (let i = x0; i < x1; i++) {
      const src = cv.get(i + shift, waterY - 1 - j * 1);
      const c = src && rand() > gap * (j / depth + 0.3) ? tint(src) : null;
      cv.px(i, waterY + j, c);
    }
  }
}
