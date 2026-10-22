// The world map: the lower 48 in an Albers projection, painted as a pixel-art
// terrain map (plains, farmland, forests, desert, the Rockies and Sierra), with
// rivers, state borders, Nebraska outlined in gold and a Hawaii inset.
//
// State outlines come from us-atlas (US Census cartographic boundaries),
// simplified into scripts/art/us-states.json. Anything that moves on the map is an
// SVG overlay in src/components/MapSection.astro, positioned with project().
import { readFileSync } from 'node:fs';
import { Canvas, rng } from './lib.mjs';

export const W = 400;
export const MARGIN = { x: 10, top: 12, bottom: 14 };

// Albers equal-area conic, the usual projection for US maps.
const RAD = Math.PI / 180;
const [P1, P2, LAT0, LON0] = [29.5 * RAD, 45.5 * RAD, 37.5 * RAD, -96 * RAD];
const N = (Math.sin(P1) + Math.sin(P2)) / 2;
const CC = Math.cos(P1) ** 2 + 2 * N * Math.sin(P1);
const RHO0 = Math.sqrt(CC - 2 * N * Math.sin(LAT0)) / N;
const albers = (lon, lat) => {
  const rho = Math.sqrt(CC - 2 * N * Math.sin(lat * RAD)) / N;
  const t = N * (lon * RAD - LON0);
  return [rho * Math.sin(t), RHO0 - rho * Math.cos(t)];
};
const albersInv = (x, y) => {
  const r = Math.sqrt(x * x + (RHO0 - y) ** 2);
  const t = Math.atan2(x, RHO0 - y);
  return [(LON0 + t / N) / RAD, Math.asin((CC - (r * N) ** 2) / (2 * N)) / RAD];
};

// Fit the extremes of the lower 48 into the canvas width.
const extremes = [
  [-124.73, 48.38], [-124.4, 42.0], [-124.2, 40.4], [-66.95, 44.81], [-67.0, 47.46], [-95.15, 49.38],
  [-123.0, 49.0], [-81.8, 24.55], [-97.4, 25.84], [-80.2, 25.2], [-117.1, 32.53], [-70.0, 41.6],
].map(([a, b]) => albers(a, b));
const minX = Math.min(...extremes.map((p) => p[0]));
const maxX = Math.max(...extremes.map((p) => p[0]));
const minY = Math.min(...extremes.map((p) => p[1]));
const maxY = Math.max(...extremes.map((p) => p[1]));
const S = (W - 2 * MARGIN.x) / (maxX - minX);
export const H = Math.ceil((maxY - minY) * S) + MARGIN.top + MARGIN.bottom;

/** Longitude/latitude to art pixels (also the SVG overlay's coordinates). */
export function project(lon, lat) {
  const [x, y] = albers(lon, lat);
  return { x: (x - minX) * S + MARGIN.x, y: (maxY - y) * S + MARGIN.top };
}
function unproject(px, py) {
  return albersInv((px - MARGIN.x) / S + minX, maxY - (py - MARGIN.top) / S);
}

// Hawaii gets an inset box in the empty Pacific, bottom left.
export const HAWAII_BOX = { x: 10, y: H - 58, w: 78, h: 44 };
export function projectHawaii(lon, lat) {
  const k = Math.cos(20.6 * RAD);
  const sx = Math.min((HAWAII_BOX.w - 10) / ((160.4 - 154.7) * k), (HAWAII_BOX.h - 10) / (22.35 - 18.85));
  const left = HAWAII_BOX.x + (HAWAII_BOX.w - (160.4 - 154.7) * k * sx) / 2;
  return { x: left + (lon + 160.4) * k * sx, y: HAWAII_BOX.y + 5 + (22.35 - lat) * sx };
}

// Dusk-tinted terrain palette.
const T = {
  ocean: '#1e2557',
  ocean2: '#222b62',
  wave: '#34428a',
  shallow: '#2b3a7c',
  foam: '#4c64ad',
  coast: '#120e26',
  river: '#4a78c8',
  plains: ['#c79a58', '#bb8d4f', '#d4a964'],
  farm: ['#6e9a4e', '#5f8a45', '#b8a14f', '#7ea656'],
  forest: ['#2f6b4f', '#285d45', '#367754'],
  south: ['#4d8a50', '#447d48', '#58955a'],
  desert: ['#cf9461', '#c48856', '#d9a670'],
  basin: ['#a99566', '#9c8a5e', '#b5a272'],
  redrock: ['#b5563f', '#9a463a', '#c96a48'],
  mountain: ['#77705a', '#6a634f', '#847b62'],
  coastGreen: ['#5f8f52', '#557f4a', '#6a9a5a'],
  snow: '#eeeaf6',
  peakDark: '#4e4466',
  peakLight: '#a497bb',
  tree: '#1c4636',
  treeLight: '#3f8a5c',
  cactus: '#3f7a4a',
  gold: '#ffcd75',
};

// Ridge lines for mountain ranges (lon, lat), with a half-width in degrees.
const RANGES = [
  { w: 1.5, pts: [[-114.2, 49], [-112.8, 47], [-111.2, 45.3], [-109.8, 44.2], [-107.6, 43.2], [-106.4, 41.2], [-106, 39.6], [-105.6, 38], [-105.4, 36.4], [-105.6, 35.4]] },
  { w: 0.9, pts: [[-116.5, 48.5], [-115.5, 46.5], [-114.8, 45], [-114.2, 44]] },
  { w: 0.6, pts: [[-111.9, 41.9], [-111.6, 40.4], [-111.6, 38.6], [-112.2, 37.6]] },
  { w: 0.65, pts: [[-121.6, 48.9], [-121.7, 46.8], [-121.8, 44.4], [-122.2, 42.2], [-121.7, 40.4]] },
  { w: 0.6, pts: [[-121, 40.2], [-119.8, 38.6], [-118.6, 36.6], [-118.2, 35.4]] },
  { w: 0.8, pts: [[-110.8, 44.6], [-109.8, 43.6]] },
  { w: 0.7, kind: 'hills', pts: [[-85.8, 34.4], [-83.8, 35.6], [-81.6, 36.6], [-79.8, 38.2], [-78.4, 39.6], [-77, 40.8], [-75.4, 41.8], [-74.4, 42.6]] },
  { w: 0.6, kind: 'hills', pts: [[-74.8, 44.1], [-74, 43.6]] },
  { w: 0.6, kind: 'hills', pts: [[-72.8, 44.6], [-71.4, 44.2], [-70.6, 45]] },
];

function distToPolyline(lon, lat, pts) {
  const k = Math.cos(lat * RAD);
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = (bx - ax) * k;
    const dy = by - ay;
    const px = (lon - ax) * k;
    const py = lat - ay;
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(px - t * dx, py - t * dy));
  }
  return best;
}

function mountainAt(lon, lat) {
  for (const r of RANGES) {
    const d = distToPolyline(lon, lat, r.pts);
    if (d < r.w) return { strength: 1 - d / r.w, hills: r.kind === 'hills' };
  }
  return null;
}

/** Which terrain a land pixel gets, from its state and position. */
function biome(state, lon, lat) {
  const desertStates = ['Arizona', 'New Mexico', 'Nevada', 'Utah'];
  if (Math.hypot((lon + 111.76) * 0.8, lat - 34.87) < 0.9 || Math.hypot((lon + 110.1) * 0.8, lat - 37.0) < 0.8) return 'redrock';
  if (Math.hypot((lon + 112.1) * 0.8, lat - 36.15) < 0.55) return 'redrock'; // Grand Canyon
  if (state === 'Nevada' || (state === 'Utah' && lat > 38.6 && lon < -112) || (state === 'Oregon' && lon > -120.5 && lat < 44.5) || (state === 'Idaho' && lat < 43.6 && lon < -113))
    return 'basin';
  if (desertStates.includes(state) || (state === 'California' && lon > -118.2 && lat < 36.4) || (state === 'Texas' && lon < -101.5))
    return 'desert';
  if ((state === 'Washington' || state === 'Oregon') && lon < -121.3) return 'forest';
  if (state === 'California') return lat > 39.5 && lon < -121.5 ? 'forest' : 'coastGreen';
  if (['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Connecticut', 'Rhode Island', 'New York', 'Pennsylvania', 'West Virginia', 'New Jersey'].includes(state)) return 'forest';
  if ((state === 'Michigan' || state === 'Wisconsin' || state === 'Minnesota') && lat > 45) return 'forest';
  if (state === 'Idaho' && lat > 45) return 'forest';
  const plainsStates = ['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma'];
  if (plainsStates.includes(state) || (state === 'Texas' && lon < -97.5) || (state === 'Colorado' && lon > -105) || (state === 'Wyoming' && lon > -106.5) || (state === 'Montana' && lon > -110.5) || (state === 'New Mexico' && lon > -104))
    return 'plains';
  if (['Iowa', 'Illinois', 'Indiana', 'Ohio', 'Missouri', 'Minnesota', 'Wisconsin', 'Michigan', 'Kentucky'].includes(state)) return 'farm';
  if (['Wyoming', 'Montana', 'Idaho', 'Colorado', 'Utah'].includes(state)) return 'basin';
  return 'south';
}

// River polylines (lon, lat).
const RIVERS = [
  [[-95.2, 47.3], [-94.4, 46.4], [-93.2, 45], [-91.9, 44.3], [-91.2, 43.1], [-90.7, 42.2], [-90.6, 41.5], [-91.3, 40.4], [-90.2, 38.7], [-89.5, 37.3], [-89.4, 36.4], [-90.1, 35.1], [-91.1, 33.6], [-91.2, 32.3], [-91.6, 31.1], [-91.2, 30.5], [-90.2, 29.95], [-89.4, 29.2]],
  [[-111.4, 47.5], [-109.5, 47.7], [-106.6, 48], [-104.1, 48], [-102.3, 47.6], [-100.8, 46.8], [-100.4, 45.6], [-100.4, 44.4], [-99.3, 43.8], [-98.4, 43.1], [-97.3, 42.8], [-96.4, 42.5], [-96, 41.4], [-95.6, 40.3], [-94.9, 39.4], [-94.4, 39.1], [-93.3, 38.9], [-92.2, 38.6], [-91.1, 38.7], [-90.2, 38.8]],
  [[-106.3, 41.6], [-105.2, 42.1], [-103.7, 41.9], [-102.4, 41.25], [-100.8, 41.12], [-99.9, 40.85], [-99.08, 40.68], [-98.3, 40.88], [-97.4, 41.38], [-96.6, 41.15], [-95.9, 41.02]],
  [[-105.9, 40.2], [-107.3, 39.6], [-108.6, 39.1], [-109.7, 38.4], [-110.6, 37.6], [-111.5, 37], [-112.1, 36.15], [-113, 36.1], [-114, 36.1], [-114.6, 35.1], [-114.6, 34], [-114.7, 33.1], [-114.8, 32.5]],
  [[-80, 40.45], [-80.9, 39.7], [-81.7, 39.2], [-82.6, 38.6], [-83.6, 38.6], [-84.5, 39.1], [-85.6, 38.5], [-86.5, 37.9], [-87.6, 37.9], [-88.6, 37.2], [-89.1, 37]],
  [[-106.6, 37.6], [-106.1, 36], [-106.7, 35.1], [-106.9, 33.5], [-106.6, 32.3], [-106.5, 31.8], [-104.5, 29.7], [-103.2, 29], [-101.4, 29.8], [-99.5, 27.6], [-97.3, 25.9]],
  [[-114.5, 49], [-117.3, 48], [-119.9, 46.8], [-119.3, 46.2], [-121, 45.6], [-122.8, 45.6], [-124, 46.25]],
  [[-82.9, 34.8], [-82.4, 33.9], [-81.4, 33]],
];

// Little sprites stamped onto the terrain.
const PEAK = ['..s..', '.sLs.', '.DLLL', 'DDLLL', 'DDDLL'];
const BIG_PEAK = ['...s...', '..sss..', '..DLs..', '.DDLLL.', '.DDLLLL', 'DDDDLLL', 'DDDDDLL'];
const HILL = ['.DL.', 'DDLL'];
const TREE = ['.ll.', 'lTTl', 'TTTT', '.tt.'];
const PINE = ['.T.', '.T.', 'TlT', 'TTT', '.t.'];
const CACTUS = ['.c..', 'cc.c', '.ccc', '.c..'];
const MESA = ['.RRRR.', 'RrrrrR', 'Rrrrrr'];

export function usmap() {
  const states = JSON.parse(readFileSync(new URL('./us-states.json', import.meta.url), 'utf8'));
  const cv = new Canvas(W, H, T.ocean);
  const rand = rng(1404);
  const names = Object.keys(states).filter((n) => n !== 'Hawaii');
  const owner = new Int16Array(W * H).fill(-1);

  // Rasterize each state (even-odd within the state's own rings).
  const fillRings = (rings, proj, mark) => {
    const polys = rings.map((r) => r.map(([lon, lat]) => proj(lon, lat)));
    const ys = polys.flat().map((p) => p.y);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(H - 1, Math.ceil(Math.max(...ys))); y++) {
      const cy = y + 0.5;
      const xs = [];
      for (const poly of polys)
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i];
          const b = poly[(i + 1) % poly.length];
          if (a.y <= cy !== b.y <= cy) xs.push(a.x + ((cy - a.y) / (b.y - a.y)) * (b.x - a.x));
        }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); x++) mark(x, y);
    }
  };
  names.forEach((name, i) => fillRings(states[name], project, (x, y) => (owner[y * W + x] = i)));
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : owner[y * W + x]);
  const isLand = (x, y) => at(x, y) >= 0;

  // Ocean: subtle bands, shallows along the coast, little wave marks.
  const nearLand = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dy) <= r && isLand(x + dx, y + dy)) return true;
    return false;
  };
  cv.fill(0, 0, W, H, (x, y) => {
    if (isLand(x, y)) return null;
    if (nearLand(x, y, 1)) return T.foam;
    if (nearLand(x, y, 3)) return (x + y) % 2 ? T.shallow : T.ocean2;
    return (Math.floor(y / 3) + Math.floor(x / 9)) % 5 === 0 ? T.ocean2 : T.ocean;
  });
  for (let gy = 4, row = 0; gy < H - 2; gy += 9, row++)
    for (let gx = 2 + (row % 2) * 6; gx < W - 4; gx += 13) {
      const x = gx + Math.floor(rand() * 5);
      const y = gy + Math.floor(rand() * 4);
      if (nearLand(x + 1, y, 5)) continue;
      cv.px(x, y, T.wave);
      cv.px(x + 1, y - 1, T.wave);
      cv.px(x + 2, y, T.wave);
      cv.px(x + 3, y - 1, T.wave);
    }

  // Terrain.
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const biomeAt = new Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const s = at(x, y);
      if (s < 0) continue;
      const [lon, lat] = unproject(x + 0.5, y + 0.5);
      const m = mountainAt(lon, lat);
      let b = biome(names[s], lon, lat);
      if (m && !m.hills && b !== 'redrock') b = 'mountain';
      biomeAt[y * W + x] = b;
      const pal = T[b];
      let c;
      if (b === 'plains') c = y % 3 === 0 ? pal[2] : hash(x, y) > 0.82 ? pal[1] : pal[0];
      else if (b === 'farm') {
        const row = Math.floor(y / 3);
        const h = hash(Math.floor((x + row * 2) / 5), row);
        c = h > 0.86 ? pal[2] : h > 0.55 ? pal[1] : h > 0.3 ? pal[3] : pal[0];
        if (y % 3 === 2 && hash(x, y) > 0.5) c = pal[1];
      } else if (b === 'desert') {
        const dune = Math.sin(x * 0.45 + Math.sin(y * 0.7) * 2 + y * 0.9);
        c = dune > 0.85 ? pal[2] : dune < -0.9 ? pal[1] : hash(x, y) > 0.9 ? pal[1] : pal[0];
      } else c = pal[hash(x, y) > 0.78 ? 1 : hash(x + 7, y) > 0.86 ? 2 : 0];
      if (m && m.hills && hash(x, y) > 0.55) c = T.forest[1];
      cv.px(x, y, c);
    }

  // Rivers, on land only.
  for (const river of RIVERS) {
    const pts = river.map(([lon, lat]) => project(lon, lat));
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2);
      for (let k = 0; k <= n; k++) {
        const x = Math.round(a.x + ((b.x - a.x) * k) / n);
        const y = Math.round(a.y + ((b.y - a.y) * k) / n);
        if (isLand(x, y)) cv.px(x, y, T.river);
      }
    }
  }

  // State borders (a darker pixel where states meet) and a dark coastline.
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const mix = (v, t) => Math.round(v + (t - v) * f);
    return '#' + [mix(n >> 16, 0x1b), mix((n >> 8) & 255, 0x15), mix(n & 255, 0x33)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const base = cv.data.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const s = at(x, y);
      if (s < 0) continue;
      const coastal = !isLand(x - 1, y) || !isLand(x + 1, y) || !isLand(x, y - 1) || !isLand(x, y + 1);
      if (coastal) {
        cv.px(x, y, T.coast);
        continue;
      }
      const border = (at(x + 1, y) >= 0 && at(x + 1, y) !== s) || (at(x, y + 1) >= 0 && at(x, y + 1) !== s);
      if (border && (x + y) % 2 === 0) cv.px(x, y, shade(base[y * W + x], 0.45));
    }

  // Sprites: peaks, hills, trees, cacti, mesas, on a jittered grid.
  const stamp = (x, y, rows, pal) => cv.sprite(x, y, rows, pal);
  const allLand = (x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!isLand(x + i, y + j)) return false;
    return true;
  };
  const peakPal = { s: T.snow, D: T.peakDark, L: T.peakLight };
  for (let gy = 2, row = 0; gy < H - 6; gy += 5, row++)
    for (let gx = 2 + (row % 2) * 3; gx < W - 6; gx += 6) {
      const x = gx + Math.floor(rand() * 3);
      const y = gy + Math.floor(rand() * 2);
      const b = biomeAt[(y + 4) * W + x + 2];
      if (!allLand(x - 1, y, 8, 8)) continue;
      const [lon, lat] = unproject(x + 2, y + 4);
      const m = mountainAt(lon, lat);
      if (b === 'mountain' && m) {
        if (m.strength > 0.6 && rand() > 0.55) stamp(x - 1, y - 2, BIG_PEAK, peakPal);
        else if (rand() > 0.5) stamp(x, y, PEAK, peakPal);
        else if (rand() > 0.6) stamp(x, y + 1, PINE, { l: T.treeLight, T: T.tree, t: '#3a2a2a' });
      } else if (m && m.hills && rand() > 0.35) stamp(x, y + 2, HILL, { D: T.tree, L: T.forest[2] });
      else if (b === 'forest' && rand() > 0.45) stamp(x, y, lon < -115 || lat > 44 ? PINE : TREE, { l: T.treeLight, T: T.tree, t: '#3a2a2a' });
      else if (b === 'south' && rand() > 0.82) stamp(x, y, TREE, { l: T.south[2], T: '#2f6b44', t: '#3a2a2a' });
      else if (b === 'plains' && rand() > 0.93) stamp(x, y + 3, ['.r.', 'rRr'], { r: '#8a5a3c', R: '#b8405e' });
      else if (b === 'desert' && rand() > 0.72) stamp(x, y, CACTUS, { c: T.cactus });
      else if (b === 'redrock' && rand() > 0.45) stamp(x - 1, y + 1, MESA, { R: '#d47a52', r: '#9a463a' });
      else if (b === 'basin' && rand() > 0.82) stamp(x, y + 2, ['.D.', 'DLL'], { D: '#7d6f58', L: '#c2ae80' });
    }

  // Nebraska, home: a gold outline just inside its border.
  const ne = names.indexOf('Nebraska');
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (at(x, y) === ne && (at(x - 1, y) !== ne || at(x + 1, y) !== ne || at(x, y - 1) !== ne || at(x, y + 1) !== ne)) cv.px(x, y, T.gold);

  // Hawaii inset.
  const hb = HAWAII_BOX;
  cv.rect(hb.x, hb.y, hb.w, hb.h, T.ocean);
  for (let i = 0; i < hb.w; i += 2) {
    cv.px(hb.x + i, hb.y, T.foam);
    cv.px(hb.x + i, hb.y + hb.h - 1, T.foam);
  }
  for (let j = 0; j < hb.h; j += 2) {
    cv.px(hb.x, hb.y + j, T.foam);
    cv.px(hb.x + hb.w - 1, hb.y + j, T.foam);
  }
  const hiOwner = new Uint8Array(W * H);
  fillRings(states.Hawaii, projectHawaii, (x, y) => (hiOwner[y * W + x] = 1));
  for (let y = hb.y; y < hb.y + hb.h; y++)
    for (let x = hb.x; x < hb.x + hb.w; x++) {
      if (!hiOwner[y * W + x]) continue;
      const edge = !hiOwner[y * W + x - 1] || !hiOwner[y * W + x + 1] || !hiOwner[(y - 1) * W + x] || !hiOwner[(y + 1) * W + x];
      cv.px(x, y, edge ? T.coast : hash(x, y) > 0.7 ? T.south[1] : T.south[0]);
    }
  for (let y = hb.y + 1; y < hb.y + hb.h - 1; y++)
    for (let x = hb.x + 1; x < hb.x + hb.w - 1; x++) {
      if (hiOwner[y * W + x]) continue;
      if (hiOwner[y * W + x - 1] || hiOwner[y * W + x + 1] || hiOwner[(y - 1) * W + x] || hiOwner[(y + 1) * W + x]) cv.px(x, y, T.foam);
    }

  // Compass in the Atlantic.
  const cx = W - 22;
  const cy = H - 30;
  const compass = ['...N...', '...g...', '..ggg..', 'g.gwg.g', '..ggg..', '...g...', '...g...'];
  cv.sprite(cx, cy, compass, { N: T.gold, g: '#8c80a0', w: T.snow });
  return cv;
}
