// Pixel chess pieces, 12×12, as rows of palette keys ('.' is transparent).
// 'K' outline, '1' main, '2' shade, '3' highlight. Colors come from the side's palette.
// Edit the rows directly to change a piece.

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Side = 'w' | 'b';

export const pieceRows: Record<PieceType, string[]> = {
  p: [
    '............',
    '............',
    '.....KK.....',
    '....K31K....',
    '....K12K....',
    '.....KK.....',
    '....K12K....',
    '....K12K....',
    '...K3112K...',
    '..K311122K..',
    '..KKKKKKKK..',
    '............',
  ],
  r: [
    '............',
    '..KK.KK.KK..',
    '..K311112K..',
    '..KKKKKKKK..',
    '...K3112K...',
    '...K3112K...',
    '...K3112K...',
    '...K3112K...',
    '..KKKKKKKK..',
    '..K311122K..',
    '..KKKKKKKK..',
    '............',
  ],
  n: [
    '............',
    '......KK....',
    '.....K31K...',
    '....K3112K..',
    '...K31K12K..',
    '..K311112K..',
    '..K1KK112K..',
    '..KK.K112K..',
    '.....K112K..',
    '...K311122K.',
    '...KKKKKKKK.',
    '............',
  ],
  b: [
    '............',
    '.....KK.....',
    '....K31K....',
    '...K31K2K...',
    '...K3K12K...',
    '...K3112K...',
    '....K12K....',
    '.....KK.....',
    '....K12K....',
    '...K3112K...',
    '..KKKKKKKK..',
    '............',
  ],
  q: [
    '..K..KK..K..',
    '..KK.KK.KK..',
    '..K3K11K2K..',
    '..K311112K..',
    '...K3112K...',
    '....K12K....',
    '....K12K....',
    '....K12K....',
    '...K3112K...',
    '..K311122K..',
    '..KKKKKKKK..',
    '............',
  ],
  k: [
    '.....KK.....',
    '....KKKK....',
    '.....KK.....',
    '...KK11KK...',
    '..K311112K..',
    '..K311112K..',
    '...K3112K...',
    '....K12K....',
    '...K3112K...',
    '..K311122K..',
    '..KKKKKKKK..',
    '............',
  ],
};

export const sidePalette: Record<Side, Record<string, string>> = {
  w: { K: '#2b2350', '1': '#fdf6e3', '2': '#cdbf9f', '3': '#ffffff' },
  b: { K: '#0c0a18', '1': '#33285c', '2': '#1b1533', '3': '#7a62b3' },
};

export const pieceNames: Record<PieceType, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

/** A piece as a crisp SVG string, horizontal runs merged into single rects. */
export function pieceSvg(type: PieceType, side: Side): string {
  const pal = sidePalette[side];
  const rects: string[] = [];
  pieceRows[type].forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const k = row[x];
      let w = 1;
      while (row[x + w] === k) w++;
      if (k !== '.') rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${pal[k]}"/>`);
      x += w;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
