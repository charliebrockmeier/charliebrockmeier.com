// Colors for the Brockmeier model's charts. Categorical slots are the paper's four
// plus one, in an order that passes the dataviz validator on the white paper surface
// for adjacent marks (validate_palette.js, light mode). Stock regions use an ordinal
// ramp of the first hue, so "stocks" reads as one family split three ways.
import { SERIES } from '../lib';

/** Categorical: plum, blue, ochre, green, violet. */
export const CAT = [SERIES[0], SERIES[1], SERIES[2], SERIES[3], '#6250d6'] as const;

/** Asset classes in the allocation charts. Stack order blue, ochre, plum, green also validates. */
export const ASSET = {
  tips: SERIES[1],
  credit: SERIES[2],
  stocks: SERIES[0],
  other: SERIES[3],
  employer: '#6250d6',
  cash: '#a39d90', // neutral: the reserve sits outside the model
} as const;

/** Ordinal ramp for U.S., international developed and emerging stocks (dark to light). */
export const STOCKS = ['#7a3460', '#a9628d', '#d7a8c6'] as const;

/** Sequential ramp for heatmaps, light to dark, one hue. */
const RAMP = ['#faf3f7', '#edd5e2', '#dcb0cb', '#c688ae', '#aa5f8e', '#8a3f6e', '#6a2b54', '#4a1c3a'];

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/** Color for t in [0, 1] on the sequential ramp. */
export function ramp(t: number) {
  const x = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  const a = hex(RAMP[i]);
  const b = hex(RAMP[i + 1]);
  const f = x - i;
  return `#${a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, '0')).join('')}`;
}

/** White or ink text, whichever reads better on the fill. */
export function inkOn(fill: string) {
  const [r, g, b] = hex(fill).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.32 ? '#1b1533' : '#ffffff';
}
