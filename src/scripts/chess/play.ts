// Play mode, loaded only when a visitor clicks Play. chess.js keeps the rules;
// Stockfish (its own worker, see engine.ts) suggests candidates; strength.ts picks
// the move a ~1200 rapid player would make. The opening book comes first.
import { Chess, type Move, type Square } from 'chess.js';
import { BoardView } from './board-view';
import { bookMove } from './book';
import { Engine } from './engine';
import type { Position } from './line';
import { pickMove, type Strength } from './strength';

type Side = 'w' | 'b';
const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const ACHIEVEMENT_KEY = 'charliebrockmeier:beat-chess-bot';

export function startGame(root: HTMLElement, strength: Strength) {
  const board = root.querySelector<HTMLElement>('[data-board]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const list = root.querySelector<HTMLElement>('[data-moves]')!;
  const banner = root.querySelector<HTMLElement>('[data-banner]')!;
  const trays = { top: root.querySelector<HTMLElement>('[data-tray="top"]')!, bottom: root.querySelector<HTMLElement>('[data-tray="bottom"]')! };
  const takeback = root.querySelector<HTMLButtonElement>('[data-takeback]')!;

  const view = new BoardView(board);
  const game = new Chess();
  const engine = new Engine();
  let you: Side = 'w';
  let selected = '';
  let thinking = false;
  let resigned = false;
  let token = 0; // bumps on takeback / new game so stale replies are dropped
  let drag: { el: HTMLElement; from: string; x: number; y: number; moved: boolean } | null = null;
  let pressedAt = 0; // last pointer press, so its synthetic click isn't handled twice

  const bot = (): Side => (you === 'w' ? 'b' : 'w');
  const over = () => resigned || game.isGameOver();
  const yourTurn = () => !thinking && !over() && game.turn() === you;
  const targets = (sq: string) => game.moves({ square: sq as Square, verbose: true }).map((m) => m.to);
  const lastMove = () => {
    const h = game.history({ verbose: true }).at(-1);
    return h ? [h.from, h.to] : [];
  };

  function position(): Position {
    const pos: Position = {};
    for (const row of game.board()) for (const p of row) if (p) pos[p.square] = p.color + p.type.toUpperCase();
    return pos;
  }

  function kingInCheck() {
    if (!game.inCheck()) return '';
    for (const row of game.board()) for (const p of row) if (p?.type === 'k' && p.color === game.turn()) return p.square;
    return '';
  }

  // Captured pieces, each side's tray next to its player, with the material lead.
  function renderTrays() {
    const taken: Record<Side, string[]> = { w: [], b: [] };
    for (const m of game.history({ verbose: true })) if (m.captured) taken[m.color].push(m.captured);
    const score = (s: Side) => taken[s].reduce((n, p) => n + VALUE[p], 0);
    const lead = score('w') - score('b');
    const fill = (el: HTMLElement, side: Side) => {
      const theirs = side === 'w' ? 'b' : 'w';
      const order = 'qrbnp';
      const pieces = [...taken[side]].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const diff = side === 'w' ? lead : -lead;
      el.innerHTML =
        pieces.map((p) => `<i class="cap ${theirs}${p.toUpperCase()}"></i>`).join('') + (diff > 0 ? `<span class="lead">+${diff}</span>` : '');
    };
    fill(trays.bottom, you);
    fill(trays.top, bot());
  }

  function renderMoves() {
    const sans = game.history();
    list.replaceChildren(
      ...Array.from({ length: Math.ceil(sans.length / 2) }, (_, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="n">${i + 1}.</span><span>${sans[2 * i]}</span>${sans[2 * i + 1] ? `<span>${sans[2 * i + 1]}</span>` : ''}`;
        return li;
      }),
    );
    list.lastElementChild?.lastElementChild?.classList.add('now');
    list.scrollTop = list.scrollHeight;
  }

  function refresh() {
    view.mark({ last: lastMove(), selected, targets: selected ? targets(selected) : [], check: kingInCheck() });
    renderMoves();
    renderTrays();
    takeback.disabled = game.history().length < (you === 'b' ? 2 : 1);
    root.classList.toggle('thinking', thinking);
    if (over()) return finish();
    banner.hidden = true;
    root.classList.remove('over');
    view.enable(true);
    status.textContent = thinking ? 'Charlie is thinking' : game.inCheck() ? 'Check! Your move.' : `Your move. You have ${you === 'w' ? 'White' : 'Black'}.`;
  }

  function finish() {
    let result: 'win' | 'loss' | 'draw' = 'draw';
    let title = 'Draw';
    let line = 'A draw.';
    if (resigned) {
      result = 'loss';
      title = 'Resigned';
      line = 'Charlie’s bot takes it.';
    } else if (game.isCheckmate()) {
      result = game.turn() === you ? 'loss' : 'win';
      title = result === 'win' ? 'Checkmate!' : 'Checkmate';
      line = result === 'win' ? 'You beat Charlie’s bot.' : 'Charlie’s bot wins. Rematch?';
    } else if (game.isStalemate()) line = 'Stalemate.';
    else if (game.isThreefoldRepetition()) line = 'Draw by repetition.';
    else if (game.isInsufficientMaterial()) line = 'Not enough material to mate.';
    else line = 'Draw by the 50-move rule.';
    status.textContent = `${title}${/[.!?]$/.test(title) ? '' : '.'} ${line}`;
    banner.dataset.result = result;
    banner.querySelector('[data-banner-title]')!.textContent = title;
    banner.querySelector('[data-banner-line]')!.textContent = line;
    banner.hidden = false;
    root.classList.add('over');
    view.enable(false);
    if (result === 'win') unlock();
  }

  function unlock() {
    let first = true;
    try {
      first = !localStorage.getItem(ACHIEVEMENT_KEY);
      localStorage.setItem(ACHIEVEMENT_KEY, new Date().toISOString());
    } catch {}
    window.dispatchEvent(new CustomEvent('achievement', { detail: { id: 'beat-chess-bot' } }));
    const toast = document.querySelector<HTMLElement>('[data-chess-toast]')!;
    toast.querySelector('[data-toast-line]')!.textContent = first ? 'Beat Charlie’s chess bot' : 'Beat Charlie’s chess bot (again)';
    toast.hidden = false;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => (toast.hidden = true), 6000);
  }

  // Play a move on the board. `snap`: the piece was dragged there, so don't slide it.
  function apply(from: string, to: string, promotion?: string, snap?: HTMLElement) {
    const piece = game.get(from as Square);
    const promo = promotion ?? (piece?.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined);
    let m: Move;
    try {
      m = game.move({ from, to, promotion: promo });
    } catch {
      return null;
    }
    const capture = m.isEnPassant() ? m.to[0] + m.from[1] : undefined;
    view.move(m.from, m.to, { capture, promote: m.isPromotion() ? m.promotion : undefined });
    if (snap) view.drop(snap, true);
    if (m.isKingsideCastle()) view.move(`h${m.from[1]}`, `f${m.from[1]}`);
    if (m.isQueensideCastle()) view.move(`a${m.from[1]}`, `d${m.from[1]}`);
    return m;
  }

  async function botTurn() {
    if (over() || game.turn() !== bot()) return;
    thinking = true;
    refresh();
    const mine = ++token;
    const started = performance.now();
    // A person takes a moment; harder positions take a little longer.
    const pause = 400 + Math.random() * 500 + Math.min(300, game.moves().length * 6);
    let uci = '';
    const book = bookMove(game.history(), bot());
    if (book) {
      const m = new Chess(game.fen()).move(book);
      uci = m.from + m.to;
    } else {
      const candidates = await engine.candidates(game.fen(), strength.depth);
      if (mine !== token) return;
      uci = candidates.length ? pickMove(candidates, strength) : '';
      if (!uci) {
        const any = game.moves({ verbose: true })[0];
        uci = any ? any.from + any.to : '';
      }
    }
    const wait = Math.max(0, Math.min(1200, pause) - (performance.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (mine !== token || !uci) return;
    thinking = false;
    apply(uci.slice(0, 2), uci.slice(2, 4), uci[4]);
    refresh();
  }

  function yours(sq: string) {
    return game.get(sq as Square)?.color === you;
  }

  function tryMove(from: string, to: string, snap?: HTMLElement) {
    selected = '';
    const m = apply(from, to, undefined, snap);
    if (snap && !m) view.drop(snap);
    refresh();
    if (m) botTurn();
  }

  // Pointer input: press a piece and drag it, or click a piece and then a square.
  function onDown(e: PointerEvent) {
    pressedAt = performance.now();
    if (!yourTurn() || e.button > 0) return;
    const sq = view.squareAt(e.clientX, e.clientY);
    if (!sq) return;
    if (selected && sq !== selected && targets(selected).includes(sq)) {
      e.preventDefault();
      return tryMove(selected, sq);
    }
    if (!yours(sq)) {
      selected = '';
      return refresh();
    }
    e.preventDefault();
    selected = sq;
    refresh();
    const el = view.lift(sq);
    if (el) {
      drag = { el, from: sq, x: e.clientX, y: e.clientY, moved: false };
      board.setPointerCapture(e.pointerId);
    }
  }

  function onMove(e: PointerEvent) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
    drag.moved = true;
    view.drag(drag.el, e.clientX, e.clientY);
  }

  function onUp(e: PointerEvent) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) return view.drop(d.el);
    const to = view.squareAt(e.clientX, e.clientY);
    if (to && to !== d.from && targets(d.from).includes(to)) return tryMove(d.from, to, d.el);
    view.drop(d.el); // slides back home
    refresh();
  }

  function onCancel() {
    if (drag) view.drop(drag.el);
    drag = null;
  }

  // Keyboard: squares are buttons; Enter or Space selects, then moves. Clicks that
  // follow a pointer press (mouse, tap) were already handled by the pointer handlers.
  function onClick(e: MouseEvent) {
    if (performance.now() - pressedAt < 1000) return;
    const sq = (e.target as HTMLElement).closest<HTMLElement>('[data-sq]')?.dataset.sq;
    if (!sq || !yourTurn()) return;
    if (selected && targets(selected).includes(sq)) return tryMove(selected, sq);
    selected = yours(sq) && sq !== selected ? sq : '';
    refresh();
  }

  board.addEventListener('pointerdown', onDown);
  board.addEventListener('pointermove', onMove);
  board.addEventListener('pointerup', onUp);
  board.addEventListener('pointercancel', onCancel);
  board.addEventListener('click', onClick);

  function newGame(side: Side) {
    token++;
    engine.stop();
    engine.newGame();
    you = side;
    thinking = false;
    resigned = false;
    selected = '';
    game.reset();
    view.orient(side);
    view.set(position());
    refresh();
    if (side === 'b') botTurn();
  }

  return {
    newGame,
    /** Undo your last move (and the bot's reply), or cancel a bot that's thinking. */
    takeback() {
      token++;
      engine.stop();
      thinking = false;
      resigned = false;
      selected = '';
      if (game.turn() !== you) game.undo();
      else if (game.history().length >= 2) {
        game.undo();
        game.undo();
      }
      view.set(position());
      refresh();
    },
    resign() {
      if (over()) return;
      token++;
      engine.stop();
      thinking = false;
      resigned = true;
      refresh();
    },
    stop() {
      token++;
      engine.terminate();
      board.removeEventListener('pointerdown', onDown);
      board.removeEventListener('pointermove', onMove);
      board.removeEventListener('pointerup', onUp);
      board.removeEventListener('pointercancel', onCancel);
      board.removeEventListener('click', onClick);
      banner.hidden = true;
      root.classList.remove('over', 'thinking');
      view.orient('w');
      view.enable(false);
      view.mark();
    },
    /** Start from a position (tests and puzzles). */
    load(fen: string) {
      token++;
      engine.stop();
      thinking = false;
      resigned = false;
      selected = '';
      game.load(fen);
      view.set(position());
      refresh();
      if (game.turn() === bot()) botTurn();
    },
    /** What the bot would play here, with Stockfish's candidates (tests). */
    async suggest(fen: string) {
      const c = await engine.candidates(fen, strength.depth);
      return { pick: pickMove(c, strength), candidates: c };
    },
  };
}
