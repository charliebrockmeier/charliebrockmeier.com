// Adds Claude Code usage from this computer to src/data/claude.json, for the Claude
// card in Stats. Claude Code keeps a JSONL transcript per session under
// ~/.claude/projects; every assistant message carries its token usage. Only totals
// are written: no prompts, file names or project names leave your machine.
//
//   npm run claude-stats            then commit src/data/claude.json
//
// The web sessions' totals in claude.json are refreshed separately.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ROOT = process.env.CLAUDE_CONFIG_DIR ? join(process.env.CLAUDE_CONFIG_DIR, 'projects') : join(homedir(), '.claude', 'projects');
const OUT = new URL('../src/data/claude.json', import.meta.url);

function* jsonl(dir) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* jsonl(path);
    else if (name.endsWith('.jsonl')) yield path;
  }
}

const seen = new Set();
const sessions = new Set();
const t = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
for (const file of jsonl(ROOT)) {
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.includes('"usage"')) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    const u = row.message?.usage;
    if (row.type !== 'assistant' || !u) continue;
    // Streaming writes one message several times; count each message once.
    const key = `${row.message.id}:${row.requestId ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (row.sessionId) sessions.add(row.sessionId);
    t.input += u.input_tokens ?? 0;
    t.output += u.output_tokens ?? 0;
    t.cacheRead += u.cache_read_input_tokens ?? 0;
    t.cacheWrite += u.cache_creation_input_tokens ?? 0;
  }
}

const data = JSON.parse(readFileSync(OUT, 'utf8'));
const total = t.input + t.output + t.cacheRead + t.cacheWrite;
data.local = total ? { ...t, total, sessions: sessions.size, asOf: new Date().toISOString().slice(0, 10) } : null;
writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`claude-stats: ${sessions.size} local sessions, ${total.toLocaleString()} tokens (${t.output.toLocaleString()} written)`);
