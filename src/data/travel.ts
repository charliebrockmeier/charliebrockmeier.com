// Where Charlie has lived, worked and road-tripped, for the world map.
// Coordinates are longitude/latitude; project() turns them into the map's pixel grid
// (the same Albers projection that draws public/art/usmap.png).
// Trips are city, park or region level only, never addresses.
import { project, projectHawaii, W, H, HAWAII_BOX } from '../../scripts/art/usmap.mjs';

export type Kind = 'home' | 'school' | 'work' | 'remote' | 'trip';

export type Place = {
  id: string;
  name: string;
  lon: number;
  lat: number;
  kind: Kind;
  when: string;
  note: string;
  /** Which side of the pin the map label sits on. */
  label: 'n' | 's' | 'e' | 'w';
  inset?: boolean;
  /** Husker away games get their own color. */
  husker?: boolean;
  /** Flew instead of drove. */
  flight?: boolean;
};

export const map = { width: W as number, height: H as number, hawaii: HAWAII_BOX as { x: number; y: number; w: number; h: number } };

// The main quest, in order.
export const career: Place[] = [
  { id: 'kearney', name: 'Kearney, NE', lon: -99.08, lat: 40.7, kind: 'home', when: 'Until 2021', note: 'Spawn point. Kearney High class of 2021 and student council president, Eagle Scout, then internships at Cash-Wa and Buckle.', label: 'w' },
  { id: 'lincoln', name: 'Lincoln, NE', lon: -96.7, lat: 40.81, kind: 'school', when: '2021–2025', note: 'University of Nebraska–Lincoln, Raikes School.', label: 's' },
  { id: 'omaha', name: 'Omaha, NE', lon: -95.94, lat: 41.26, kind: 'work', when: 'Summer 2023', note: 'Covisum internship.', label: 'n' },
  { id: 'sf', name: 'San Francisco, CA', lon: -122.42, lat: 37.77, kind: 'remote', when: '2024–2025', note: 'Three Bridge, remote from Nebraska, plus one visit to the Bay.', label: 'e' },
  { id: 'nyc', name: 'New York, NY', lon: -74.01, lat: 40.71, kind: 'work', when: '2025–now', note: 'Vantager, then MSCI at 7 World Trade Center. Current save.', label: 's' },
];

// Side quests: road trips (and one flight).
export const trips: Place[] = [
  { id: 'blackhills', name: 'Black Hills, SD', lon: -103.7, lat: 44.2, kind: 'trip', when: 'Aug 2023', note: 'The northern Black Hills.', label: 'n' },
  { id: 'sedona', name: 'Sedona, AZ', lon: -111.76, lat: 34.87, kind: 'trip', when: '2021–2024', note: 'Red rocks, a ski day at Arizona Snowbowl (Jan 2024), and a few Phoenix trips before that.', label: 's' },
  { id: 'summit', name: 'Breckenridge, CO', lon: -106.04, lat: 39.48, kind: 'trip', when: '2025', note: 'Three ski trips to Summit County: Breckenridge, Dillon, Frisco.', label: 'w' },
  { id: 'montana', name: 'Montana', lon: -110.4, lat: 46.2, kind: 'trip', when: 'Road trip', note: 'All the way up.', label: 'n' },
  { id: 'columbus', name: 'Columbus, OH', lon: -82.99, lat: 39.96, kind: 'trip', when: 'Oct 2024', note: 'Away game: Nebraska at Ohio State.', label: 's', husker: true },
  { id: 'la', name: 'Los Angeles, CA', lon: -118.29, lat: 34.02, kind: 'trip', when: 'Nov 2024', note: 'Away game: Nebraska at USC, in the Coliseum.', label: 's', husker: true, flight: true },
  { id: 'maui', name: 'Maui, HI', lon: -156.33, lat: 20.8, kind: 'trip', when: 'Jun 2025', note: 'Family trip. Flew this one.', label: 'n', inset: true, flight: true },
];

// Routes as lon/lat waypoints. The move east follows I-80, which also passes Kearney,
// Lincoln and Omaha, and ends at the George Washington Bridge.
const I80_EAST: [number, number][] = [
  [-95.94, 41.26], [-93.62, 41.59], [-91.53, 41.66], [-90.58, 41.52], [-89.4, 41.5], [-87.9, 41.5], [-86.25, 41.68],
  [-83.55, 41.65], [-81.7, 41.3], [-80.65, 41.1], [-78.0, 41.1], [-75.67, 41.0], [-74.5, 40.95], [-74.01, 40.71],
];

export const mainRoute: [number, number][] = [
  [-99.08, 40.7], [-98.34, 40.92], [-97.6, 40.87], [-96.7, 40.81], [-96.3, 41.02], [-95.94, 41.26], ...I80_EAST.slice(1),
];

const KEARNEY_WEST: [number, number][] = [[-99.08, 40.7], [-100.77, 41.12], [-102.6, 41.0]];
const LINCOLN_WEST: [number, number][] = [[-96.7, 40.81], [-98.34, 40.92], ...KEARNEY_WEST];

export const tripRoutes: { id: string; pts: [number, number][] }[] = [
  { id: 'blackhills', pts: [[-99.08, 40.7], [-100.77, 41.12], [-101.9, 41.9], [-103.0, 42.8], [-103.5, 43.45], [-103.7, 44.2]] },
  { id: 'sedona', pts: [...LINCOLN_WEST, [-104.99, 39.74], [-104.6, 38.27], [-105.9, 35.69], [-106.65, 35.08], [-108.74, 35.53], [-111.65, 35.2], [-111.76, 34.87]] },
  { id: 'summit', pts: [...LINCOLN_WEST, [-103.8, 40.25], [-104.99, 39.74], [-105.6, 39.65], [-106.04, 39.48]] },
  { id: 'columbus', pts: [[-96.7, 40.81], [-96.3, 41.02], [-95.94, 41.26], [-93.62, 41.59], [-91.53, 41.66], [-90.58, 41.52], [-89.4, 41.5], [-87.9, 41.5], [-86.15, 39.77], [-84.5, 39.85], [-82.99, 39.96]] },
  { id: 'montana', pts: [...KEARNEY_WEST, [-104.82, 41.14], [-106.33, 42.85], [-106.7, 44.35], [-107.0, 44.8], [-108.5, 45.78], [-110.4, 46.2]] },
];

const pt = (lon: number, lat: number) => project(lon, lat) as { x: number; y: number };
export const point = pt;
export const xy = (p: Place) => (p.inset ? (projectHawaii(p.lon, p.lat) as { x: number; y: number }) : pt(p.lon, p.lat));

/** SVG path data for a list of waypoints. */
export const pathOf = (pts: [number, number][]) =>
  pts.map(([lon, lat], i) => {
    const p = pt(lon, lat);
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' ');

/** A curved "signal" from Lincoln to San Francisco for the remote job. */
export function remoteArc() {
  const a = pt(-96.7, 40.81);
  const b = pt(-122.42, 37.77);
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 46 };
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/** Flights: Denver to the Hawaii inset, and Lincoln to Los Angeles for USC. */
export const flights: { id: string; d: string }[] = [
  { id: 'maui', from: pt(-104.67, 39.86), to: projectHawaii(-156.33, 20.8) as { x: number; y: number }, bend: 22 },
  { id: 'la', from: pt(-96.7, 40.81), to: pt(-118.29, 34.02), bend: -30 },
].map(({ id, from: a, to: b, bend }) => {
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + bend };
  return { id, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}` };
});
