// Check the paper's citations: every [n] in the prose, figure notes and tables points
// to a numbered source, every source is cited, and sources are numbered 1..N with no
// gaps or repeats. Run after editing src/data/paper2026*.ts:
//
//   npm run check:paper
import { readFile } from 'node:fs/promises';

const paper = await readFile('src/data/paper2026.ts', 'utf8');
const figures = await readFile('src/data/paper2026-figures.ts', 'utf8');
const [body, refs = ''] = paper.split(/\n\s*sources:/);

// Figures hold data arrays like [97, 87, 91], so only their text fields count.
const figureText = [...figures.matchAll(/(?:note|source|caption|subtitle|title|desc):\s*(['"`])((?:(?!\1)[^\\]|\\.)*)\1/g)].map((m) => m[2]);
const tableText = [...figures.matchAll(/'[^'\n]*\[\d[\d\s,–-]*\][^'\n]*'/g)].map((m) => m[0]);
const prose = [body, ...figureText, ...tableText].join('\n');

const cited = new Set();
for (const [, list] of prose.matchAll(/\[(\d[\d\s,–-]*)\]/g)) {
  for (const part of list.split(',').map((s) => s.trim()).filter(Boolean)) {
    const [a, b] = part.split(/\s*[–-]\s*/).map(Number);
    for (let n = a; n <= (b || a); n++) cited.add(n);
  }
}
const sources = [...refs.matchAll(/\{\s*n:\s*(\d+)/g)].map((m) => Number(m[1]));
const numbered = new Set(sources);

const problems = [];
const missing = [...cited].filter((n) => !numbered.has(n)).sort((a, b) => a - b);
const unused = sources.filter((n) => !cited.has(n));
const repeats = sources.filter((n, i) => sources.indexOf(n) !== i);
const gaps = sources.length ? Array.from({ length: Math.max(...sources) }, (_, i) => i + 1).filter((n) => !numbered.has(n)) : [];
if (missing.length) problems.push(`Cited but not in sources: ${missing.join(', ')}`);
if (unused.length) problems.push(`Sources never cited: ${unused.join(', ')}`);
if (repeats.length) problems.push(`Source numbers used twice: ${repeats.join(', ')}`);
if (gaps.length) problems.push(`Gaps in source numbering: ${gaps.join(', ')}`);

console.log(`${sources.length} sources, ${cited.size} cited.`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Every citation resolves and every source is cited.');
