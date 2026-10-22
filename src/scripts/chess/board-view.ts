// Draws the pixel board's pieces and highlights. No chess rules in here: the demo
// feeds it a hardcoded line, and play mode feeds it moves checked by chess.js.
import { FILES, type Position } from './line';

const NAMES: Record<string, string> = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' };

export class BoardView {
  flipped = false;
  private board: HTMLElement;
  private layer: HTMLElement;
  private squares = new Map<string, HTMLButtonElement>();
  private pieces = new Map<string, HTMLElement>(); // square -> piece element

  constructor(root: HTMLElement) {
    this.board = root;
    this.layer = root.querySelector('[data-pieces]')!;
    root.querySelectorAll<HTMLButtonElement>('[data-sq]').forEach((b) => this.squares.set(b.dataset.sq!, b));
    // Adopt server-rendered pieces.
    this.layer.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => this.pieces.set(el.dataset.at!, el));
  }

  /** Board coordinates for a square: [column, row] from the top-left as drawn. */
  xy(square: string): [number, number] {
    const f = FILES.indexOf(square[0]);
    const r = Number(square[1]);
    return this.flipped ? [7 - f, r - 1] : [f, 8 - r];
  }

  /** The square under a point on screen, or null when it's off the board. */
  squareAt(clientX: number, clientY: number): string | null {
    const box = this.board.getBoundingClientRect();
    const x = Math.floor(((clientX - box.left) / box.width) * 8);
    const y = Math.floor(((clientY - box.top) / box.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    return this.flipped ? `${FILES[7 - x]}${y + 1}` : `${FILES[x]}${8 - y}`;
  }

  /** Turn the board so the given side is at the bottom. */
  orient(side: 'w' | 'b') {
    this.flipped = side === 'b';
    this.board.classList.toggle('flipped', this.flipped);
    for (const [sq, b] of this.squares) {
      const [x, y] = this.xy(sq);
      b.style.gridColumn = String(x + 1);
      b.style.gridRow = String(y + 1);
    }
    for (const [sq, el] of this.pieces) this.position(el, sq);
  }

  /** Replace every piece without animation. */
  set(pos: Position) {
    this.layer.replaceChildren();
    this.pieces.clear();
    for (const [sq, code] of Object.entries(pos)) this.place(sq, code);
    this.label();
  }

  /** Slide a piece; removes whatever it lands on (or `capture`, for en passant). */
  move(from: string, to: string, opts: { capture?: string; promote?: string } = {}) {
    const el = this.pieces.get(from);
    if (!el) return;
    const victimSq = opts.capture ?? to;
    const victim = this.pieces.get(victimSq);
    if (victim && victim !== el) {
      victim.remove();
      this.pieces.delete(victimSq);
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
    this.board.classList.toggle('live', on);
  }

  pieceAt(sq: string) {
    return this.pieces.get(sq)?.dataset.code;
  }

  // Dragging: the piece follows the pointer, then snaps to a square or back home.
  lift(sq: string) {
    const el = this.pieces.get(sq);
    el?.classList.add('dragging');
    return el ?? null;
  }

  drag(el: HTMLElement, clientX: number, clientY: number) {
    const box = this.board.getBoundingClientRect();
    const size = box.width / 8;
    el.style.transform = `translate(${clientX - box.left - size / 2}px, ${clientY - box.top - size / 2}px)`;
  }

  /** Let go of a dragged piece. `snap` lands it at once (it's already there). */
  drop(el: HTMLElement, snap = false) {
    el.classList.remove('dragging');
    if (snap) el.classList.add('no-anim');
    el.style.removeProperty('transform');
    if (snap) {
      void el.offsetWidth;
      requestAnimationFrame(() => el.classList.remove('no-anim'));
    }
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
    const [x, y] = this.xy(sq);
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
