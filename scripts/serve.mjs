// A tiny static server for dist/, used by the PDF and check scripts. Routes follow
// Astro's build: /resume serves dist/resume/index.html; unknown paths get 404.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

const exists = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

/** Serve `root` on a free local port. Returns { url, close }. */
export async function serve(root = 'dist') {
  if (!(await stat(join(root, 'index.html')).catch(() => null))) {
    throw new Error(`No build in ${root}/. Run npm run build first.`);
  }
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const tries = [join(root, path), join(root, path, 'index.html'), join(root, `${path}.html`)];
    for (const file of tries) {
      if (await exists(file)) {
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/** Playwright, from the project or a global install, with a clear message if missing. */
export function playwright() {
  try {
    return createRequire(import.meta.url)('playwright');
  } catch {
    console.error('This script needs Playwright. Install it once with:\n  npm i -D playwright && npx playwright install chromium');
    process.exit(1);
  }
}
