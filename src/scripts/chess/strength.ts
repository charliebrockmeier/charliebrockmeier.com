// How Charlie's bot chooses moves, tuned to his chess.com rapid rating.
//
// Stockfish finds the candidates; this file decides which one a ~1200 rapid player
// would actually play. Why not Stockfish's own UCI_LimitStrength? Its floor is
// UCI_Elo 1320, above Charlie's rating, and its weakening picks moves at random
// from a shallow search, so it plays strangely and still hangs pieces now and then.
// This policy is explicit instead:
//
//   1. Search to a modest depth with MultiPV 5 (humans at this level calculate a
//      few moves deep, not twenty).
//   2. Always play a forced mate, and play "obvious" moves: when the best move is
//      far ahead of every alternative (a free queen, the only defense), a 1200
//      player usually finds it.
//   3. Otherwise drop anything more than `guard` centipawns worse than the best
//      (no hanging pieces), then pick from the rest with weight exp(-loss / temperature).
//      Higher temperature means more small inaccuracies, like a club player.
//
// For Charlie's 1209 rapid: depth 9, temperature 78cp, guard 172cp, obvious 219cp.
export type Strength = {
  rating: number;
  depth: number;
  temperature: number;
  guard: number;
  obvious: number;
};

export const DEFAULT_RATING = 1209; // Charlie's chess.com rapid rating, Oct 2026

export function strengthFor(rating: number): Strength {
  const r = Math.min(Math.max(rating, 600), 2400);
  // Scale smoothly: stronger players search deeper and wander less.
  const t = (r - 600) / 1800; // 0 at 600, 1 at 2400
  return {
    rating: Math.round(r),
    depth: Math.round(6 + t * 8), // 6..14
    temperature: Math.round(110 - t * 95), // 110..15 cp
    guard: Math.round(240 - t * 200), // 240..40 cp
    obvious: Math.round(260 - t * 120), // 260..140 cp
  };
}

export type Candidate = { move: string; cp: number | null; mate: number | null };

/** A candidate's value in centipawns for the side to move; mates dominate. */
export function value(c: Candidate): number {
  if (c.mate !== null) return c.mate > 0 ? 100_000 - c.mate * 100 : -100_000 - c.mate * 100;
  return c.cp ?? 0;
}

/** Pick a move the way a player of this strength would. Candidates are best first. */
export function pickMove(candidates: Candidate[], s: Strength, random = Math.random): string {
  const list = [...candidates].sort((a, b) => value(b) - value(a));
  const best = value(list[0]);
  if (list.length === 1 || (list[0].mate !== null && list[0].mate > 0)) return list[0].move;
  if (best - value(list[1]) >= s.obvious) return list[0].move;
  const pool = list.filter((c) => best - value(c) <= s.guard);
  const weights = pool.map((c) => Math.exp(-(best - value(c)) / s.temperature));
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].move;
  }
  return pool[0].move;
}
