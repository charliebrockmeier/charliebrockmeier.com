// Draws every pixel scene and writes it to public/art as a PNG.
// Run with `npm run art`; pass --preview <dir> to also write 4× previews.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { panorama } from './panorama.mjs';
import { msci, vantager, threebridge, raikes, tutorial, prologue } from './scenes.mjs';
import { usmap } from './usmap.mjs';
import { journeyNear, journeyFar, journeyWalker } from './journey.mjs';

const scenes = {
  panorama,
  msci,
  vantager,
  threebridge,
  raikes,
  tutorial,
  prologue,
  usmap,
  'journey-near': journeyNear,
  'journey-far': journeyFar,
  'journey-walker': journeyWalker,
};

const out = new URL('../../public/art/', import.meta.url).pathname;
const previewAt = process.argv.indexOf('--preview');
const previewDir = previewAt > -1 ? process.argv[previewAt + 1] : null;
mkdirSync(out, { recursive: true });
if (previewDir) mkdirSync(previewDir, { recursive: true });

// Anything a scene wants the page to animate (clouds, windows) lands here.
const meta = {};
for (const [name, draw] of Object.entries(scenes)) {
  const cv = draw();
  const png = cv.png();
  writeFileSync(join(out, `${name}.png`), png);
  if (cv.meta) meta[name] = cv.meta;
  if (previewDir) writeFileSync(join(previewDir, `${name}.png`), cv.png(4));
  console.log(`${name}.png  ${cv.width}×${cv.height}  ${(png.length / 1024).toFixed(1)} KB`);
}
writeFileSync(new URL('../../src/data/art-meta.json', import.meta.url), JSON.stringify(meta));
