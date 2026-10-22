// Runs js-chess-engine off the main thread. In: a FEN and the bot's strength.
// Out: one move as lowercase from/to squares.
import { ai } from 'js-chess-engine';

type Request = { fen: string; level: number; randomness: number; slip: number };

self.onmessage = (event: MessageEvent<Request>) => {
  const { fen, level, randomness, slip } = event.data;
  try {
    const result = ai(fen, { level, play: false, analysis: true, randomness, ttSizeMB: 2 });
    let move = result.move;
    // A human-sized mistake now and then: the 2nd or 3rd choice instead of the 1st.
    const ranked = result.analysis ?? [];
    if (ranked.length > 1 && Math.random() < slip) move = ranked[1 + Math.floor(Math.random() * Math.min(2, ranked.length - 1))].move;
    const [from, to] = Object.entries(move)[0] as [string, string];
    self.postMessage({ from: from.toLowerCase(), to: to.toLowerCase() });
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
