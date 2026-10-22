// Where Charlie has lived, worked and traveled, for the world map.
// Coordinates are longitude/latitude; project() turns them into the map's pixel grid
// (the same Albers projection that draws public/art/usmap.png).
// Places are city, park or region level only, never addresses. The trips themselves
// (dates, categories, notes) live in sidequests.ts and point here through `pin`.
import { project, projectHawaii, W, H, HAWAII_BOX } from '../../scripts/art/usmap.mjs';
import { trips, type Cat } from './sidequests';

type LonLat = [number, number];
type Label = 'n' | 's' | 'e' | 'w';

export type Stop = {
  id: string;
  name: string;
  lon: number;
  lat: number;
  kind: 'home' | 'school' | 'work';
  when: string;
  note: string;
  /** Which side of the pin the map label sits on. */
  label: Label;
};

export const map = { width: W as number, height: H as number, hawaii: HAWAII_BOX as { x: number; y: number; w: number; h: number } };

// The main quest, in order.
export const career: Stop[] = [
  { id: 'kearney', name: 'Kearney, NE', lon: -99.08, lat: 40.7, kind: 'home', when: 'Until 2021', note: 'Spawn point. Kearney High, class of 2021. Came home for summer jobs: IT at Cash-Wa before college, then Buckle’s e-commerce team in 2022.', label: 'w' },
  { id: 'lincoln', name: 'Lincoln, NE', lon: -96.7, lat: 40.81, kind: 'school', when: '2021–2025', note: 'University of Nebraska–Lincoln: finance and accounting, the Raikes School honors program, and Saturdays in the Sea of Red.', label: 's' },
  { id: 'omaha', name: 'Omaha, NE', lon: -95.94, lat: 41.26, kind: 'work', when: 'Summer 2023', note: 'Covisum internship, the summer before junior year.', label: 'n' },
  { id: 'sf', name: 'San Francisco, CA', lon: -122.42, lat: 37.77, kind: 'work', when: 'Summer 2024', note: 'Flew out from Nebraska for a summer in person at Three Bridge Wealth Advisors: lived in the South Bay, worked in the city.', label: 'e' },
  { id: 'nyc', name: 'New York, NY', lon: -74.01, lat: 40.71, kind: 'work', when: 'Summer 2025–now', note: 'Moved east for Vantager, then MSCI at 7 World Trade Center. Current save.', label: 's' },
];

// Trip pins. A pin can hold several trips; its color comes from their categories.
type PinDef = { id: string; name: string; short?: string; lon: number; lat: number; label: Label; inset?: boolean };
const pinDefs: PinDef[] = [
  { id: 'phoenix', name: 'Phoenix, AZ', lon: -112.07, lat: 33.45, label: 's' },
  { id: 'sedona', name: 'Sedona, AZ', lon: -111.76, lat: 34.87, label: 'e' },
  { id: 'monterey', name: 'Monterey Bay, CA', short: 'Monterey', lon: -121.89, lat: 36.6, label: 'e' },
  { id: 'socal', name: 'Southern California', short: 'L.A.', lon: -118.29, lat: 34.02, label: 's' },
  { id: 'kc', name: 'Kansas City, MO', lon: -94.58, lat: 39.1, label: 's' },
  { id: 'pella', name: 'Pella, IA', lon: -92.92, lat: 41.41, label: 's' },
  { id: 'blackhills', name: 'Black Hills, SD', lon: -103.7, lat: 44.2, label: 'n' },
  { id: 'summit', name: 'Summit County, CO', short: 'Summit Co.', lon: -106.04, lat: 39.48, label: 's' },
  { id: 'montana', name: 'Montana', lon: -110.4, lat: 46.2, label: 'n' },
  { id: 'columbus', name: 'Columbus, OH', lon: -82.99, lat: 39.96, label: 's' },
  { id: 'dallas', name: 'Dallas, TX', lon: -96.8, lat: 32.78, label: 'e' },
  { id: 'boston', name: 'Boston, MA', lon: -71.06, lat: 42.36, label: 'e' },
  { id: 'vegas', name: 'Las Vegas, NV', short: 'Vegas', lon: -115.14, lat: 36.17, label: 'n' },
  { id: 'orlando', name: 'Orlando, FL', lon: -81.38, lat: 28.54, label: 'e' },
  { id: 'rutgers', name: 'New Brunswick, NJ', short: 'Rutgers', lon: -74.45, lat: 40.5, label: 's' },
  { id: 'maui', name: 'Maui, HI', lon: -156.33, lat: 20.8, label: 'n', inset: true },
];

const catsAt = (id: string) => [...new Set(trips.filter((t) => t.pin === id).map((t) => t.cat))] as Cat[];
export const tripPins = pinDefs.map((p) => ({ ...p, cats: catsAt(p.id), count: trips.filter((t) => t.pin === p.id).length }));

// Routes as lon/lat waypoints. The move east follows I-80, which also passes Kearney,
// Lincoln and Omaha, and ends at the George Washington Bridge.
const I80_EAST: LonLat[] = [
  [-95.94, 41.26], [-93.62, 41.59], [-91.53, 41.66], [-90.58, 41.52], [-89.4, 41.5], [-87.9, 41.5], [-86.25, 41.68],
  [-83.55, 41.65], [-81.7, 41.3], [-80.65, 41.1], [-78.0, 41.1], [-75.67, 41.0], [-74.5, 40.95], [-74.01, 40.71],
];

export const mainRoute: LonLat[] = [
  [-99.08, 40.7], [-98.34, 40.92], [-97.6, 40.87], [-96.7, 40.81], [-96.3, 41.02], [-95.94, 41.26], ...I80_EAST.slice(1),
];

const KEARNEY_WEST: LonLat[] = [[-99.08, 40.7], [-100.77, 41.12], [-101.72, 41.13]];
const LINCOLN_WEST: LonLat[] = [[-96.7, 40.81], [-98.34, 40.92], ...KEARNEY_WEST];
const TO_DENVER: LonLat[] = [...LINCOLN_WEST, [-103.21, 40.63], [-104.99, 39.74]];

/** Drives. Each gets a car on the map, colored routes by category. */
export const roads: { id: string; cat: Cat; pts: LonLat[] }[] = [
  { id: 'kc', cat: 'road', pts: [[-96.7, 40.81], [-95.86, 40.68], [-94.85, 39.77], [-94.58, 39.1]] },
  { id: 'blackhills', cat: 'road', pts: [[-99.08, 40.7], [-100.77, 41.12], [-101.9, 41.9], [-103.0, 42.8], [-103.5, 43.45], [-103.7, 44.2]] },
  // Winter break 2024: west on I-70 through Grand Junction, south past Moab and Monument Valley.
  { id: 'sedona', cat: 'road', pts: [...TO_DENVER, [-106.37, 39.64], [-107.32, 39.55], [-108.55, 39.06], [-109.83, 38.95], [-109.55, 38.57], [-109.34, 37.87], [-109.55, 37.28], [-110.25, 36.73], [-111.24, 36.13], [-111.65, 35.2], [-111.76, 34.87]] },
  { id: 'pella', cat: 'road', pts: [[-96.7, 40.81], [-96.3, 41.02], [-95.94, 41.26], [-93.62, 41.59], [-92.92, 41.41]] },
  { id: 'monterey', cat: 'road', pts: [[-122.42, 37.77], [-122.43, 37.46], [-122.03, 36.97], [-121.89, 36.6], [-121.95, 36.57]] },
  { id: 'montana', cat: 'road', pts: [...KEARNEY_WEST, [-104.82, 41.14], [-106.33, 42.85], [-106.7, 44.35], [-107.0, 44.8], [-108.5, 45.78], [-110.4, 46.2]] },
  { id: 'summit', cat: 'ski', pts: [...TO_DENVER, [-105.6, 39.65], [-106.04, 39.48]] },
  { id: 'columbus', cat: 'husker', pts: [[-96.7, 40.81], [-96.3, 41.02], [-95.94, 41.26], [-93.62, 41.59], [-91.53, 41.66], [-90.58, 41.52], [-89.4, 41.5], [-87.9, 41.5], [-86.15, 39.77], [-84.5, 39.85], [-82.99, 39.96]] },
];

const pt = (lon: number, lat: number) => project(lon, lat) as { x: number; y: number };
export const point = pt;
export const xy = (p: { lon: number; lat: number; inset?: boolean }) => (p.inset ? (projectHawaii(p.lon, p.lat) as { x: number; y: number }) : pt(p.lon, p.lat));

/** SVG path data for a list of waypoints. */
export const pathOf = (pts: LonLat[]) =>
  pts.map(([lon, lat], i) => {
    const p = pt(lon, lat);
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' ');

/** Length of a waypoint route in map pixels. */
export const lengthOf = (pts: LonLat[]) =>
  pts.slice(1).reduce((sum, [lon, lat], i) => {
    const a = pt(...pts[i]);
    const b = pt(lon, lat);
    return sum + Math.hypot(b.x - a.x, b.y - a.y);
  }, 0);

/** Flights as quadratic arcs. `main` is the main quest's flight to San Francisco. */
const LNK: LonLat = [-96.7, 40.81];
const NYC: LonLat = [-74.01, 40.71];
const flightDefs: { id: string; cat: Cat | 'main'; from: LonLat; to: LonLat | 'maui'; bend: number }[] = [
  { id: 'sf', cat: 'main', from: LNK, to: [-122.42, 37.77], bend: -34 },
  { id: 'phoenix', cat: 'vacation', from: [-98.34, 40.92], to: [-112.07, 33.45], bend: 14 },
  { id: 'la', cat: 'husker', from: [-95.94, 41.26], to: [-118.29, 34.02], bend: 26 },
  { id: 'maui', cat: 'vacation', from: [-104.67, 39.86], to: 'maui', bend: 22 },
  { id: 'denver', cat: 'ski', from: NYC, to: [-104.67, 39.86], bend: -26 },
  { id: 'socal', cat: 'work', from: NYC, to: [-118.0, 33.66], bend: -58 },
  { id: 'dallas', cat: 'work', from: NYC, to: [-96.8, 32.78], bend: 22 },
  { id: 'vegas', cat: 'vacation', from: [-95.94, 41.26], to: [-115.14, 36.17], bend: -18 },
  { id: 'orlando', cat: 'vacation', from: [-95.94, 41.26], to: [-81.38, 28.54], bend: 20 },
];

export const flights = flightDefs.map(({ id, cat, from, to, bend }) => {
  const a = pt(...from);
  const b = to === 'maui' ? (projectHawaii(-156.33, 20.8) as { x: number; y: number }) : pt(...to);
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + bend };
  // Arc length, sampled.
  let len = 0;
  let prev = a;
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const q = { x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y };
    len += Math.hypot(q.x - prev.x, q.y - prev.y);
    prev = q;
  }
  return { id, cat, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, len, west: b.x < a.x };
});
