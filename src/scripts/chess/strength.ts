// How strong Charlie's bot plays, from his chess.com rating.
//
// js-chess-engine's levels are search depths, not ratings, so these bands are a
// rough fit:
//   level 1: 1 ply, sees only its next move (beginner)
//   level 2: 2 ply + check extension (club novice)
//   level 3: 2 ply + extensions + quiescence, up to 5 ply (improving club player)
//   level 4: 3 ply + extensions, up to 8 ply (strong club player)
// Two knobs make it play like a human at that rating rather than a cold engine:
//   randomness: picks among moves within this many centipawns of the best
//   slip: the chance it plays its 2nd or 3rd choice instead (a human mistake);
//         lower ratings slip more often
export type Strength = { rating: number; level: 1 | 2 | 3 | 4; randomness: number; slip: number };

export function strengthFor(rating: number): Strength {
  if (rating < 700) return { rating, level: 1, randomness: 120, slip: 0.3 };
  if (rating < 1000) return { rating, level: 2, randomness: 90, slip: 0.2 };
  if (rating < 1300) return { rating, level: 2, randomness: 50, slip: 0.12 };
  if (rating < 1600) return { rating, level: 3, randomness: 40, slip: 0.08 };
  if (rating < 1900) return { rating, level: 3, randomness: 15, slip: 0.05 };
  return { rating, level: 4, randomness: 10, slip: 0.02 };
}

/** Default when the build couldn't reach chess.com. */
export const DEFAULT_RATING = 1100;
