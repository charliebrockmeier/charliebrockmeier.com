// Check the Brockmeier model paper's citations: every [n] in the prose, figure notes and
// tables points to a numbered source, every source is cited, and sources are numbered
// 1..N with no gaps or repeats. Also checks that every {fig:id} / {tab:id} reference
// and every { fig: 'id' } block names a figure that exists. Run after editing
// src/data/model2026*.ts or the model's chart components:
//
//   node scripts/check-model.mjs
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const paper = await readFile('src/data/model2026.ts', 'utf8');
const figures = await readFile('src/data/model2026-figures.ts', 'utf8');
const split = paper.search(/\n\s*sources:\s*\[/);
if (split < 0) throw new Error('No sources list found in src/data/model2026.ts');
const body = paper.slice(0, split);
const refs = paper.slice(split);

/**
 * The text of every string and template literal in a TypeScript file, with ${...}
 * expressions and comments left out. The data files hold arrays like [2, 4, 8] in code,
 * so only literal text may count as a citation.
 */
function literals(src) {
  const out = [];
  const stack = []; // 'tpl' while inside a template literal's ${ } expression
  let i = 0;
  let depth = 0;
  const readTemplate = () => {
    let text = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') {
        text += src[i + 1];
        i += 2;
      } else if (c === '`') {
        i++;
        out.push(text);
        return;
      } else if (c === '$' && src[i + 1] === '{') {
        i += 2;
        out.push(text);
        stack.push(depth);
        depth = 0;
        return; // back to code; the closing brace resumes this template
      } else {
        text += c;
        i++;
      }
    }
  };
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i) + 2;
    } else if (c === "'" || c === '"') {
      let text = '';
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === '\\') {
          text += src[i + 1];
          i += 2;
        } else text += src[i++];
      }
      i++;
      out.push(text);
    } else if (c === '`') {
      i++;
      readTemplate();
    } else if (c === '{') {
      depth++;
      i++;
    } else if (c === '}') {
      if (depth === 0 && stack.length) {
        depth = stack.pop();
        i++;
        readTemplate();
      } else {
        depth--;
        i++;
      }
    } else i++;
  }
  return out;
}

const dir = 'src/components/charts/model';
const components = await Promise.all((await readdir(dir)).filter((f) => f.endsWith('.astro')).map((f) => readFile(join(dir, f), 'utf8')));
const prose = [...literals(body), ...literals(figures)].join('\n');

const cited = new Set();
for (const [, list] of prose.matchAll(/\[(\d[\d\s,–-]*)\]/g)) {
  for (const part of list.split(',').map((s) => s.trim()).filter(Boolean)) {
    const [a, b] = part.split(/\s*[–-]\s*/).map(Number);
    for (let n = a; n <= (b || a); n++) cited.add(n);
  }
}
// Components link to sources directly, e.g. href="#src-28".
for (const c of components) for (const [, n] of c.matchAll(/#src-(\d+)/g)) cited.add(Number(n));

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

// Figure ids: defined at two-space indent in the figures file; used as { fig: 'id' } and {fig:id} / {tab:id}.
const defined = new Set([...figures.matchAll(/^ {2}(\w+): \{\n\s+kind:/gm)].map((m) => m[1]));
const placed = [...body.matchAll(/\{\s*fig:\s*'(\w+)'\s*\}/g)].map((m) => m[1]);
const mentioned = [...prose.matchAll(/\{(?:fig|tab):(\w+)\}/g)].map((m) => m[1]);
const unknown = [...new Set([...placed, ...mentioned])].filter((id) => !defined.has(id));
const unplaced = [...defined].filter((id) => !placed.includes(id));
const twice = placed.filter((id, i) => placed.indexOf(id) !== i);
if (unknown.length) problems.push(`Figures referenced but not defined: ${unknown.join(', ')}`);
if (unplaced.length) problems.push(`Figures defined but never placed: ${unplaced.join(', ')}`);
if (twice.length) problems.push(`Figures placed twice: ${twice.join(', ')}`);

console.log(`${sources.length} sources, ${cited.size} cited; ${defined.size} figures and tables, ${placed.length} placed.`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Every citation resolves, every source is cited, and every figure reference exists.');
