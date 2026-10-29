// sitemap.xml for search engines: every page on the site, built from the same data.
import type { APIRoute } from 'astro';
import { builds } from '../data/profile';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', '/resume', '/contact', '/writing/illiquidity-premium', ...builds.map((b) => `/projects/${b.id}`)];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
