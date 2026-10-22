// Talks UCI to Stockfish, which runs unmodified in its own worker from
// /engine/stockfish-19-lite-single.js (GPL-3.0; see public/engine/README.txt).
// Nothing from Stockfish is bundled into the site's code.
import type { Candidate } from './strength';

const ENGINE_URL = '/engine/stockfish-19-lite-single.js';
const MULTIPV = 5;

export class Engine {
  private worker: Worker;
  private listeners = new Set<(line: string) => void>();
  private queue: Promise<unknown> = Promise.resolve();
  readonly ready: Promise<void>;

  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.worker.onmessage = (e: MessageEvent<string>) => {
      for (const line of String(e.data).split('\n')) for (const fn of this.listeners) fn(line);
    };
    this.ready = this.until('uci', (l) => l === 'uciok').then(() => {
      this.post(`setoption name MultiPV value ${MULTIPV}`);
      this.post('setoption name Hash value 16');
      return this.until('isready', (l) => l === 'readyok').then(() => undefined);
    });
  }

  post(cmd: string) {
    this.worker.postMessage(cmd);
  }

  /** Send a command and collect output lines until `done` matches. */
  private until(cmd: string, done: (line: string) => boolean): Promise<string[]> {
    return new Promise((resolve) => {
      const lines: string[] = [];
      const fn = (line: string) => {
        lines.push(line);
        if (done(line)) {
          this.listeners.delete(fn);
          resolve(lines);
        }
      };
      this.listeners.add(fn);
      this.post(cmd);
    });
  }

  newGame() {
    this.post('ucinewgame');
  }

  /** The top candidate moves (UCI notation, e.g. "e7e5") with scores for the side to move.
   *  Searches run one at a time, so a stopped search can't leak into the next. */
  candidates(fen: string, depth: number): Promise<Candidate[]> {
    const run = this.queue.then(() => this.search(fen, depth));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async search(fen: string, depth: number): Promise<Candidate[]> {
    await this.ready;
    this.post(`position fen ${fen}`);
    const lines = await this.until(`go depth ${depth} movetime 1500`, (l) => l.startsWith('bestmove'));
    const byRank = new Map<number, Candidate & { depth: number }>();
    for (const line of lines) {
      if (!line.startsWith('info') || !line.includes(' pv ')) continue;
      const d = Number(line.match(/ depth (\d+)/)?.[1] ?? 0);
      const rank = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
      const cp = line.match(/ score cp (-?\d+)/);
      const mate = line.match(/ score mate (-?\d+)/);
      const move = line.match(/ pv (\S+)/)?.[1];
      if (!move) continue;
      const prev = byRank.get(rank);
      if (!prev || d >= prev.depth)
        byRank.set(rank, { move, depth: d, cp: cp ? Number(cp[1]) : null, mate: mate ? Number(mate[1]) : null });
    }
    const best = lines.find((l) => l.startsWith('bestmove'))?.split(' ')[1];
    const list = [...byRank.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => ({ move: c.move, cp: c.cp, mate: c.mate }));
    // In positions with fewer legal moves than MULTIPV, or if nothing parsed, fall back to bestmove.
    if (!list.length && best && best !== '(none)') list.push({ move: best, cp: 0, mate: null });
    return list;
  }

  stop() {
    this.post('stop');
  }

  terminate() {
    this.worker.terminate();
  }
}
