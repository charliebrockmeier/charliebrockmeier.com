// Print the resume and the paper to PDF from the built site, with same-site links
// pointing at https://charliebrockmeier.com. Writes to public/ (the source of truth)
// and dist/ (so the current build has them too).
//
//   npm run build && npm run pdf
//
// The 2025 paper's PDF (public/writing/illiquidity-premium.pdf) is frozen and not reprinted.
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { playwright, serve } from './serve.mjs';

const jobs = [
  ['/resume', 'charlie-brockmeier-resume.pdf'],
  ['/writing/illiquidity-premium', 'writing/illiquidity-premium-2026.pdf'],
];

const { chromium } = playwright();
const site = await serve('dist');
const browser = await chromium.launch();
try {
  for (const [route, file] of jobs) {
    const page = await browser.newPage();
    await page.goto(site.url + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      for (const a of document.querySelectorAll('a[href]')) {
        const u = new URL(a.getAttribute('href'), location.href);
        if (u.origin === location.origin) a.setAttribute('href', `https://charliebrockmeier.com${u.pathname}${u.hash}`);
      }
    });
    const out = `public/${file}`;
    await mkdir(dirname(out), { recursive: true });
    await page.pdf({ path: out, format: 'Letter', printBackground: false, preferCSSPageSize: true });
    await mkdir(dirname(`dist/${file}`), { recursive: true });
    await copyFile(out, `dist/${file}`);
    console.log(`${route} -> ${out}`);
    await page.close();
  }
} finally {
  await browser.close();
  site.close();
}
