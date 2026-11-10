// Smoke-test the built site: every page at phone, tablet and desktop widths, failing on
// horizontal overflow or console errors. Run after a build:
//
//   npm run build && npm run check
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { playwright, serve } from './serve.mjs';

const WIDTHS = [360, 390, 768, 1280, 1440];

// Every page in dist/ (each route is a folder with an index.html), plus the 404 page.
async function routes(dir = 'dist') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory() && !['_astro', 'art', 'brand', 'engine'].includes(entry.name)) out.push(...(await routes(p)));
    else if (entry.name === 'index.html') out.push('/' + relative('dist', dir).replaceAll('\\', '/'));
  }
  return out.map((r) => r.replace(/\/$/, '') || '/');
}

const { chromium } = playwright();
const site = await serve('dist');
const browser = await chromium.launch();
const pages = [...(await routes()), '/404'].filter((r) => r !== '/recruiter');
const problems = [];
try {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    let route = '';
    page.on('pageerror', (e) => problems.push(`${width}px ${route}: ${e.message}`));
    page.on('console', (m) => {
      // The 404 page is supposed to return a 404.
      if (m.type() === 'error' && !(route === '/404' && m.text().includes('404'))) problems.push(`${width}px ${route}: ${m.text()}`);
    });
    for (route of pages) {
      await page.goto(site.url + route, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) problems.push(`${width}px ${route}: ${overflow}px horizontal overflow`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  site.close();
}

console.log(`Checked ${pages.length} pages at ${WIDTHS.join(', ')}px.`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('No overflow, no console errors.');
