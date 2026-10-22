// Draws the pixel board's pieces and highlights. No chess rules in here: the demo
// feeds it a hardcoded line, and play mode feeds it moves checked by chess.js.
import { coords, type Position } from './line';

const NAMES: Record<string, string> = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' };

export class BoardView {
  private layer: HTMLElement;
  private squares = new Map<string, HTMLButtonElement>();
  private pieces = new Map<string, HTMLElement>(); // square -> piece element

  constructor(private root: HTMLElement) {
    this.layer = root.querySelector('[data-pieces]')!;
    root.querySelectorAll<HTMLButtonElement>('[data-sq]').forEach((b) => this.squares.set(b.dataset.sq!, b));
    // Adopt server-rendered pieces.
    this.layer.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => this.pieces.set(el.dataset.at!, el));
  }

  /** Replace every piece without animation. */
  set(pos: Position) {
    this.layer.replaceChildren();
    this.pieces.clear();
    for (const [sq, code] of Object.entries(pos)) this.place(sq, code);
    this.label();
  }

  /** Slide a piece; removes whatever it lands on. */
  move(from: string, to: string, opts: { capture?: string; promote?: string } = {}) {
    const el = this.pieces.get(from);
    if (!el) return;
    const victim = this.pieces.get(opts.capture ?? to);
    if (victim && victim !== el) {
      victim.remove();
      this.pieces.delete(opts.capture ?? to);
    }
    this.pieces.delete(from);
    this.pieces.set(to, el);
    el.dataset.at = to;
    this.position(el, to);
    if (opts.promote) {
      const code = el.dataset.code!;
      const next = code[0] + opts.promote.toUpperCase();
      el.classList.replace(code, next);
      el.dataset.code = next;
    }
    this.label();
  }

  /** Mark the last move, the selected square, legal targets and a king in check. */
  mark({ last = [] as string[], selected = '', targets = [] as string[], check = '' } = {}) {
    for (const [sq, b] of this.squares) {
      b.classList.toggle('last', last.includes(sq));
      b.classList.toggle('selected', sq === selected);
      b.classList.toggle('target', targets.includes(sq));
      b.classList.toggle('capture', targets.includes(sq) && this.pieces.has(sq));
      b.classList.toggle('check', sq === check);
    }
  }

  enable(on: boolean) {
    for (const b of this.squares.values()) b.disabled = !on;
  }

  pieceAt(sq: string) {
    return this.pieces.get(sq)?.dataset.code;
  }

  private place(sq: string, code: string) {
    const el = document.createElement('i');
    el.className = `pc ${code}`;
    el.dataset.at = sq;
    el.dataset.code = code;
    this.position(el, sq);
    this.layer.append(el);
    this.pieces.set(sq, el);
  }

  private position(el: HTMLElement, sq: string) {
    const [x, y] = coords(sq);
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
  }

  /** Keep every square's accessible name in sync with what's on it. */
  private label() {
    for (const [sq, b] of this.squares) {
      const code = this.pieces.get(sq)?.dataset.code;
      b.setAttribute('aria-label', code ? `${sq}, ${code[0] === 'w' ? 'white' : 'black'} ${NAMES[code[1]]}` : sq);
    }
  }
}
