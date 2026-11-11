// Fetch the one page that refuses plain HTTP clients (the SSA actuarial life table)
// with headless Chromium, into scripts/model/.cache/. Run before fetch.py on a fresh
// machine:
//
//   node scripts/model/fetch-browser.mjs
//
// Needs Playwright (see scripts/serve.mjs). Honors HTTPS_PROXY if it is set.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../serve.mjs';

const cache = join(dirname(fileURLToPath(import.meta.url)), '.cache');
const pages = [['ssa_table4c6.html', 'https://www.ssa.gov/oact/STATS/table4c6.html']];

await mkdir(cache, { recursive: true });
const { chromium } = playwright();
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
try {
  for (const [file, url] of pages) {
    const page = await browser.newPage();
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!res || res.status() !== 200) throw new Error(`${url}: HTTP ${res?.status()}`);
    await writeFile(join(cache, file), await page.content());
    console.log(`${url} -> scripts/model/.cache/${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
