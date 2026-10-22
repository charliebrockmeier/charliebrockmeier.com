// Charlie's bot plays Black, and it always answers 1.e4 with the Caro-Kann.
// Each line is a full SAN sequence; every prefix that ends on a White move maps to
// Black's reply in that line. Where lines disagree, the bot picks one at random.

const lines = [
  // Classical
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bd2 Ngf6 O-O-O Be7',
  'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bd2 Ngf6',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7 h4 h6 h5 Bh7 Bd3 Bxd3 Qxd3 e6',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Nc5 e6 Nxb7 Qc7',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 Qxd4',
  // Advance, with 3...Bf5
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 Nd7 O-O Ne7',
  'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5',
  'e4 c6 d4 d5 e5 Bf5 h4 h5 c4 e6',
  'e4 c6 d4 d5 e5 Bf5 c3 e6 Be2 c5',
  'e4 c6 d4 d5 e5 Bf5 Be3 e6 Nd2 Nd7',
  'e4 c6 d4 d5 e5 Bf5 Bd3 Bxd3 Qxd3 e6',
  // Exchange and Panov
  'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7',
  'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bg4',
  'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5',
  // Fantasy, Two Knights and sidelines
  'e4 c6 d4 d5 f3 e6 Nc3 Nd7 Be3 Ngf6',
  'e4 c6 Nc3 d5 Nf3 Bg4 h3 Bxf3 Qxf3 e6',
  'e4 c6 Nf3 d5 Nc3 Bg4 h3 Bxf3 Qxf3 e6',
  'e4 c6 Nf3 d5 exd5 cxd5 d4 Nc6',
  'e4 c6 d3 d5 Nd2 e5 Ngf3 Bd6',
  'e4 c6 c4 d5 exd5 cxd5 cxd5 Nf6',
  'e4 c6 Bc4 d5 exd5 cxd5 Bb3 Nf6',
  // 1.d4: the Slav, the same idea with the c-pawn
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5',
  'd4 d5 c4 c6 Nc3 Nf6 Nf3 dxc4',
  'd4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6',
  'd4 d5 Nf3 Nf6 c4 c6',
  'd4 d5 Bf4 Bf5 e3 e6',
  'd4 d5 e3 Nf6 Nf3 Bf5',
  // Everything else: get a pawn to the center and go from there
  'c4 c6 Nc3 d5',
  'Nf3 d5 d4 Nf6',
  'Nc3 d5',
  'g3 d5',
  'b3 d5',
  'f4 d5',
  'e3 d5',
  'd3 d5',
];

const book = new Map<string, string[]>();
for (const line of lines) {
  const moves = line.split(' ');
  for (let i = 0; i < moves.length; i += 2) {
    const key = moves.slice(0, i + 1).join(' ');
    const reply = moves[i + 1];
    if (!reply) break;
    const list = book.get(key) ?? [];
    if (!list.includes(reply)) list.push(reply);
    book.set(key, list);
  }
}

/** Black's book reply after these moves, or null once the game leaves the book. */
export function bookMove(history: string[]): string | null {
  const options = book.get(history.join(' '));
  return options ? options[Math.floor(Math.random() * options.length)] : null;
}
