// The demo: the Caro-Kann, Classical main line, hardcoded so the board can play it
// with no chess library. Each ply is [from, to, SAN]; castling also moves a rook.

export type Ply = { from: string; to: string; san: string; rook?: [string, string] };

export const caroKann: Ply[] = [
  { from: 'e2', to: 'e4', san: 'e4' },
  { from: 'c7', to: 'c6', san: 'c6' },
  { from: 'd2', to: 'd4', san: 'd4' },
  { from: 'd7', to: 'd5', san: 'd5' },
  { from: 'b1', to: 'c3', san: 'Nc3' },
  { from: 'd5', to: 'e4', san: 'dxe4' },
  { from: 'c3', to: 'e4', san: 'Nxe4' },
  { from: 'c8', to: 'f5', san: 'Bf5' },
  { from: 'e4', to: 'g3', san: 'Ng3' },
  { from: 'f5', to: 'g6', san: 'Bg6' },
  { from: 'h2', to: 'h4', san: 'h4' },
  { from: 'h7', to: 'h6', san: 'h6' },
  { from: 'g1', to: 'f3', san: 'Nf3' },
  { from: 'b8', to: 'd7', san: 'Nd7' },
  { from: 'h4', to: 'h5', san: 'h5' },
  { from: 'g6', to: 'h7', san: 'Bh7' },
  { from: 'f1', to: 'd3', san: 'Bd3' },
  { from: 'h7', to: 'd3', san: 'Bxd3' },
  { from: 'd1', to: 'd3', san: 'Qxd3' },
  { from: 'e7', to: 'e6', san: 'e6' },
  { from: 'c1', to: 'd2', san: 'Bd2' },
  { from: 'g8', to: 'f6', san: 'Ngf6' },
  { from: 'e1', to: 'c1', san: 'O-O-O', rook: ['a1', 'd1'] },
  { from: 'f8', to: 'e7', san: 'Be7' },
];

/** Square -> piece code like "wP" / "bN". */
export type Position = Record<string, string>;

export const FILES = 'abcdefgh';

export function startPosition(): Position {
  const pos: Position = {};
  const back = 'RNBQKBNR';
  for (let i = 0; i < 8; i++) {
    const f = FILES[i];
    pos[`${f}1`] = `w${back[i]}`;
    pos[`${f}2`] = 'wP';
    pos[`${f}7`] = 'bP';
    pos[`${f}8`] = `b${back[i]}`;
  }
  return pos;
}

/** Apply a ply in place; returns the captured piece code, if any. */
export function applyPly(pos: Position, ply: Ply): string | undefined {
  const captured = pos[ply.to];
  pos[ply.to] = pos[ply.from];
  delete pos[ply.from];
  if (ply.rook) {
    pos[ply.rook[1]] = pos[ply.rook[0]];
    delete pos[ply.rook[0]];
  }
  return captured;
}

/** Position after the first n plies of the demo line. */
export function positionAfter(n: number): Position {
  const pos = startPosition();
  caroKann.slice(0, n).forEach((p) => applyPly(pos, p));
  return pos;
}

/** "e4" -> [x, y] with a8 at [0, 0] and White at the bottom. */
export function coords(square: string): [number, number] {
  return [FILES.indexOf(square[0]), 8 - Number(square[1])];
}
