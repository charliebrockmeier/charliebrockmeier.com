// Shared pieces for the paper's SVG charts: palette, scales, tick picking, number
// formatting and citation links. Charts render twice (a wide and a narrow layout) so
// labels stay readable on a phone without shrinking on a laptop; CSS shows one.

/** Categorical slots, validated for the white paper surface (dataviz validate_palette.js). */
export const SERIES = ['#7a3460', '#2a78d6', '#c27a00', '#1b9e77', '#5a6472'] as const;

export const INK = '#1b1533';
export const INK_SOFT = '#4f4868';
export const GRID = '#ece6d8';
export const AXIS = '#b8af9c';
export const SURFACE = '#ffffff';

export type Layout = { W: number; H: number; f: number; narrow: boolean };

export const WIDE: Layout = { W: 640, H: 320, f: 12, narrow: false };
export const NARROW: Layout = { W: 340, H: 300, f: 11, narrow: true };

/** Round step for an axis: 1, 2, 2.5 or 5 times a power of ten. */
function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return nice * pow;
}

/** Ticks covering [min, max]; the domain expands to the outer ticks. */
export function ticks(min: number, max: number, count = 5) {
  const step = niceStep(max - min, count);
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

export function scale(d0: number, d1: number, r0: number, r1: number) {
  return (v: number) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
}

export type Fmt = { prefix?: string; suffix?: string; decimals?: number };

export function fmt(v: number, f: Fmt = {}) {
  const d = f.decimals ?? (Number.isInteger(v) ? 0 : 1);
  const n = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${v < 0 ? '−' : ''}${f.prefix ?? ''}${n}${f.suffix ?? ''}`;
}

/** Rough text width in viewBox units, for fit checks. */
export const textWidth = (s: string, f: number) => s.length * f * 0.6;

/** A bar with a 4px rounded data end and a square baseline. */
export function barPath(x: number, w: number, yBase: number, yEnd: number) {
  const h = Math.abs(yEnd - yBase);
  const r = Math.min(4, w / 2, h);
  if (h < 0.5) return `M${x},${yBase}h${w}`;
  if (yEnd < yBase) {
    return `M${x},${yBase}V${yEnd + r}Q${x},${yEnd} ${x + r},${yEnd}H${x + w - r}Q${x + w},${yEnd} ${x + w},${yEnd + r}V${yBase}Z`;
  }
  return `M${x},${yBase}V${yEnd - r}Q${x},${yEnd} ${x + r},${yEnd}H${x + w - r}Q${x + w},${yEnd} ${x + w},${yEnd - r}V${yBase}Z`;
}

/** Split a label into at most two lines near the middle space. */
export function wrap2(s: string, maxChars: number): string[] {
  if (s.length <= maxChars || !s.includes(' ')) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [s.slice(0, best), s.slice(best + 1)];
}

/** Turn "[3]", "[3, 7]" and "[3–5]" into links to the numbered sources. */
export function cite(text: string) {
  return text.replace(/\[(\d+(?:\s*[,–-]\s*\d+)*)\]/g, (_m, inner: string) => {
    const parts = inner.split(/\s*,\s*/).map((p) => {
      const [a, b] = p.split(/\s*[–-]\s*/);
      const link = (n: string) => `<a href="#src-${n}">${n}</a>`;
      return b ? `${link(a)}–${link(b)}` : link(a);
    });
    return `<span class="cite">[${parts.join(', ')}]</span>`;
  });
}
