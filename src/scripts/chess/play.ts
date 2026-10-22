// Play mode, loaded only when a visitor clicks "Play Charlie's bot".
// chess.js keeps the rules; js-chess-engine (in a worker) picks Black's moves after
// the opening book runs out.
import { Chess, type Move, type Square } from 'chess.js';
import { BoardView } from './board-view';
import { bookMove } from './book';
import { startPosition } from './line';
import type { Strength } from './strength';

type Hooks = { status: (text: string) => void; moves: (sans: string[]) => void; over: (over: boolean) => void };

export function startGame(root: HTMLElement, strength: Strength, hooks: Hooks) {
  const view = new BoardView(root);
  const game = new Chess();
  const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  let selected = '';
  let thinking = false;
  let resigned = false;
  let token = 0; // ignores stale engine replies after New game

  view.set(startPosition());
  view.enable(true);
  view.mark();

  const kingInCheck = () => {
    if (!game.inCheck()) return '';
    const color = game.turn();
    for (const row of game.board()) for (const p of row) if (p?.type === 'k' && p.color === color) return p.square;
    return '';
  };

  function refresh(last: string[] = []) {
    view.mark({ last, selected, targets: selected ? game.moves({ square: selected as Square, verbose: true }).map((m) => m.to) : [], check: kingInCheck() });
    hooks.moves(game.history());
    if (resigned) return finish('You resigned. Charlie’s bot takes it.');
    if (game.isCheckmate()) return finish(game.turn() === 'w' ? 'Checkmate. Charlie’s bot wins.' : 'Checkmate. You beat Charlie’s bot!');
    if (game.isStalemate()) return finish('Stalemate. A draw.');
    if (game.isThreefoldRepetition()) return finish('Draw by repetition.');
    if (game.isInsufficientMaterial()) return finish('Draw: not enough material to mate.');
    if (game.isDraw()) return finish('Draw by the 50-move rule.');
    hooks.over(false);
    hooks.status(thinking ? 'Charlie is thinking…' : game.inCheck() ? 'Check! Your move.' : 'Your move. You have White.');
  }

  function finish(text: string) {
    view.enable(false);
    hooks.over(true);
    hooks.status(text);
  }

  // Animate a chess.js move on the board, including castling, en passant and promotion.
  function show(m: Move) {
    const capture = m.isEnPassant() ? m.to[0] + m.from[1] : undefined;
    view.move(m.from, m.to, { capture, promote: m.isPromotion() ? m.promotion : undefined });
    if (m.isKingsideCastle()) view.move(`h${m.from[1]}`, `f${m.from[1]}`);
    if (m.isQueensideCastle()) view.move(`a${m.from[1]}`, `d${m.from[1]}`);
  }

  function play(from: string, to: string) {
    const piece = game.get(from as Square);
    const promotion = piece?.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined;
    try {
      const m = game.move({ from, to, promotion });
      show(m);
      return m;
    } catch {
      return null;
    }
  }

  function botTurn() {
    if (game.isGameOver() || resigned) return;
    thinking = true;
    refresh();
    const mine = ++token;
    const started = performance.now();
    const reply = (from: string, to: string) => {
      // A short pause so it feels like a person, not a vending machine.
      const wait = Math.max(0, 450 - (performance.now() - started));
      setTimeout(() => {
        if (mine !== token) return;
        thinking = false;
        const m = play(from, to);
        refresh(m ? [m.from, m.to] : []);
      }, wait);
    };
    const book = bookMove(game.history());
    if (book) {
      const m = new Chess(game.fen()).move(book);
      return reply(m.from, m.to);
    }
    worker.onmessage = (e: MessageEvent<{ from?: string; to?: string; error?: string }>) => {
      if (e.data.from && e.data.to) return reply(e.data.from, e.data.to);
      // If the engine ever fails, fall back to any legal move rather than hanging.
      const any = game.moves({ verbose: true })[0];
      if (any) reply(any.from, any.to);
    };
    worker.postMessage({ fen: game.fen(), level: strength.level, randomness: strength.randomness, slip: strength.slip });
  }

  function onSquare(e: Event) {
    const sq = (e.target as HTMLElement).closest<HTMLElement>('[data-sq]')?.dataset.sq;
    if (!sq || thinking || game.isGameOver() || resigned || game.turn() !== 'w') return;
    const piece = game.get(sq as Square);
    if (selected && sq !== selected) {
      const target = game.moves({ square: selected as Square, verbose: true }).find((m) => m.to === sq);
      if (target) {
        selected = '';
        const m = play(target.from, target.to);
        if (m) {
          refresh([m.from, m.to]);
          botTurn();
        }
        return;
      }
    }
    selected = piece?.color === 'w' && sq !== selected ? sq : '';
    refresh(lastMove());
  }

  const lastMove = () => {
    const h = game.history({ verbose: true }).at(-1);
    return h ? [h.from, h.to] : [];
  };

  root.addEventListener('click', onSquare);
  refresh();

  return {
    reset() {
      token++;
      thinking = false;
      resigned = false;
      selected = '';
      game.reset();
      view.set(startPosition());
      view.enable(true);
      refresh();
    },
    resign() {
      if (game.isGameOver()) return;
      token++;
      thinking = false;
      resigned = true;
      refresh(lastMove());
    },
    stop() {
      token++;
      root.removeEventListener('click', onSquare);
      worker.terminate();
      view.enable(false);
      view.mark();
    },
  };
}
