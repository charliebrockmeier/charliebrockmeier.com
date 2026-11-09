// A pixel screen wipe, like a game changing scenes: big pixels sweep in diagonally
// from the left until the screen is covered, `midway` runs (jump somewhere), then
// they sweep away to the right. One tiny canvas scaled up, so it's a handful of
// fillRects a frame. Resolves when the screen is clear again.

const IN = 360;
const HOLD = 90;
const OUT = 380;

export function wipe(midway: () => void): Promise<void> {
  return new Promise((done) => {
    const block = innerWidth < 640 ? 28 : 40;
    const cols = Math.ceil(innerWidth / block) + 1;
    const rows = Math.ceil(innerHeight / block) + 1;
    const cv = document.createElement('canvas');
    cv.width = cols;
    cv.height = rows;
    cv.className = 'game-wipe';
    cv.setAttribute('aria-hidden', 'true');
    Object.assign(cv.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: `${cols * block}px`,
      height: `${rows * block}px`,
      zIndex: '90',
      imageRendering: 'pixelated',
      pointerEvents: 'none',
    });
    document.body.append(cv);
    const g = cv.getContext('2d')!;
    // Each block's turn along the diagonal, with a little jitter so the edge is ragged.
    const span = cols + rows * 0.6;
    const order = (x: number, y: number) => (x + y * 0.6 + (((x * 7 + y * 13) % 5) - 2) * 0.35) / span;
    let t0 = 0;
    let swapped = false;
    const frame = (now: number) => {
      t0 ||= now;
      const t = now - t0;
      g.clearRect(0, 0, cols, rows);
      // 0 → 1 covers the screen; 1 → 2 clears it.
      const k = t < IN ? t / IN : t < IN + HOLD ? 1 : 1 + Math.min(1, (t - IN - HOLD) / OUT);
      if (k >= 1 && !swapped) {
        swapped = true;
        midway();
      }
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const o = order(x, y) * 0.86;
          const on = k < 1 ? o < k * 1.16 - 0.1 : o >= (k - 1) * 1.16 - 0.1;
          if (!on) continue;
          // The leading edge glows gold; the rest is the night sky.
          const edge = k < 1 ? k * 1.16 - 0.1 - o < 0.06 : o - ((k - 1) * 1.16 - 0.1) < 0.06;
          g.fillStyle = edge ? '#ffcd75' : (x + y) % 2 ? '#141026' : '#1b1533';
          g.fillRect(x, y, 1, 1);
        }
      if (k < 2) requestAnimationFrame(frame);
      else {
        cv.remove();
        done();
      }
    };
    requestAnimationFrame(frame);
  });
}
