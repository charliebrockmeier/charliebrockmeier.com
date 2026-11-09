// Achievements you can unlock on the site: unlock(id) saves it, shows a pixel toast
// ("Achievement unlocked · Speedrunner") and lights up the matching card in the
// Achievements section, which carries data-achievement hooks. It also keeps the
// stars collected on the walk.
//
// Import it from any page, just for side effects (`import '../scripts/achievements'`),
// and unlock without touching internals:
//   document.dispatchEvent(new CustomEvent('achievement', { detail: 'copy-email' }))
// The chess bot already saves its own key and fires `achievement` on window with
// { id: 'beat-chess-bot' } and its own toast; both forms are understood here.
//
// Everything that changes fires `game:progress` on window (never `achievement`, which the
// chess bot's card listens to for its own unlock).

const KEY = 'charliebrockmeier:achievements';
const STARS_KEY = 'charliebrockmeier:stars';
const EXPLORED_KEY = 'charliebrockmeier:explored';
const BEST_KEY = 'charliebrockmeier:best-run';
/** Written by the chess bot (src/scripts/chess/play.ts) when you beat it. */
const CHESS_KEY = 'charliebrockmeier:beat-chess-bot';

/** Names for the toast, matching the cards in src/data/profile.ts. */
const NAMES: Record<string, string> = {
  speedrunner: 'Speedrunner',
  completionist: 'Completionist',
  tourist: 'Tourist',
  explorer: 'Explorer',
  'copy-email': 'Pen pal',
  'command-palette': 'Power user',
  'beat-chess-bot': 'Bot slayer',
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const saved: Record<string, string> = read(KEY, {});
const got = new Set<string>(Object.keys(saved));
const starSet = new Set<string>(read<string[]>(STARS_KEY, []));
try {
  if (localStorage.getItem(CHESS_KEY)) got.add('beat-chess-bot');
} catch {}

export const isUnlocked = (id: string) => got.has(id);

/** Unlocked and total, counted from the cards (only the home page has them). */
export function progress() {
  const cards = [...document.querySelectorAll('[data-ach-card]')];
  return {
    done: cards.filter((c) => !c.classList.contains('locked')).length,
    total: cards.length,
    stars: starSet.size,
  };
}

const changed = () => dispatchEvent(new CustomEvent('game:progress', { detail: progress() }));

/** Turn a locked card into its unlocked self, from the <template> it carries. */
function light(id: string, fresh: boolean) {
  for (const card of document.querySelectorAll<HTMLElement>(`[data-ach-card][data-achievement="${id}"]`)) {
    if (!card.classList.contains('locked')) continue;
    card.classList.remove('locked');
    const tpl = card.querySelector<HTMLTemplateElement>('template[data-unlocked]');
    if (tpl) {
      const next = tpl.content.cloneNode(true) as DocumentFragment;
      const icon = next.querySelector('svg');
      const name = next.querySelector('h3');
      if (icon) card.querySelector('svg')?.replaceWith(icon);
      if (name) card.querySelector('h3')?.replaceWith(name);
    }
    if (fresh) card.classList.add('fresh');
  }
}

// --- Toast ------------------------------------------------------------------------

let toast: HTMLElement | null = null;
const queue: string[] = [];
let busy = false;

const css = `
.ach-toast{position:fixed;left:50%;bottom:16px;z-index:60;display:flex;align-items:center;gap:.7rem;max-width:calc(100vw - 32px);padding:.6rem .95rem .6rem .7rem;background:var(--panel-2,#2b2350);color:var(--ink,#fdf6e3);box-shadow:inset 0 0 0 3px var(--gold,#ffcd75),5px 5px 0 0 var(--shadow,#0a0815);font-family:var(--font-sans,system-ui);font-size:.875rem;line-height:1.25;transform:translate(-50%,180%);visibility:hidden;pointer-events:none}
.playing .ach-toast{bottom:96px}
.ach-toast.show{visibility:visible;transform:translate(-50%,0)}
.ach-toast svg{flex:none;width:30px;height:30px}
.ach-toast .t{color:var(--gold,#ffcd75);font-family:var(--font-pixel,monospace);font-size:1.05rem;line-height:1;letter-spacing:.04em;text-transform:uppercase;font-size-adjust:cap-height .7}
.ach-toast .n{font-weight:700}
@media (prefers-reduced-motion:no-preference){.ach-toast.show{animation:game-ach-toast 2.8s steps(5) both}}
@keyframes game-ach-toast{0%{transform:translate(-50%,180%)}9%,90%{transform:translate(-50%,0)}100%{transform:translate(-50%,180%)}}
`;
// A 12×12 trophy in the badge colors.
const trophy = [
  '..KKKKKKKK..',
  'KK13111112KK',
  'K.K1311112K.',
  'K.K1311112.K',
  '.KK1111112KK',
  '...K11112K..',
  '....K112K...',
  '.....K2K....',
  '.....K2K....',
  '....K122K...',
  '...K111122K.',
  '...KKKKKKKK.',
];
const pal: Record<string, string> = { '1': '#ffcd75', '2': '#e0884a', '3': '#fff3c4', K: '#0c0a18' };
const trophySvg = `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${trophy
  .flatMap((r, y) => [...r].map((k, x) => (pal[k] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[k]}"/>` : '')))
  .join('')}</svg>`;

function ensureToast() {
  if (toast) return toast;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  toast = document.createElement('div');
  toast.className = 'ach-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${trophySvg}<div><p class="t">Achievement unlocked</p><p class="n"></p></div>`;
  document.body.append(toast);
  return toast;
}

function next() {
  const id = queue.shift();
  if (!id) return void (busy = false);
  busy = true;
  const el = ensureToast();
  el.querySelector('.n')!.textContent = NAMES[id] ?? id;
  el.setAttribute('aria-label', `Achievement unlocked: ${NAMES[id] ?? id}`);
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(next, 250);
  }, 2800);
}

// --- Unlocking ----------------------------------------------------------------------

/**
 * Unlock an achievement: save it, toast it and light its card. Returns false if it was
 * already unlocked. `quiet` skips the toast (the chess bot shows its own).
 */
export function unlock(id: string, { quiet = false } = {}) {
  if (!id || got.has(id)) return false;
  got.add(id);
  saved[id] = new Date().toISOString();
  write(KEY, saved);
  light(id, true);
  if (!quiet) {
    queue.push(id);
    if (!busy) next();
  }
  changed();
  return true;
}

// --- Stars and runs -------------------------------------------------------------------

export const starCount = () => starSet.size;
export const hasStar = (id: string) => starSet.has(id);

/** Save a star from the walk; returns how many have ever been collected. */
export function collectStar(id: string) {
  if (!starSet.has(id)) {
    starSet.add(id);
    write(STARS_KEY, [...starSet]);
    changed();
  }
  return starSet.size;
}

/** The best run time in seconds, and a way to record a new one (returns true if it's a best). */
export const bestRun = () => read<number>(BEST_KEY, 0);
export function recordRun(seconds: number) {
  const best = bestRun();
  if (best && best <= seconds) return false;
  write(BEST_KEY, Math.round(seconds * 10) / 10);
  return true;
}

// --- Start up ----------------------------------------------------------------------

const fromEvent = (e: Event) => {
  const d = (e as CustomEvent).detail;
  const id = typeof d === 'string' ? d : d?.id;
  if (typeof id === 'string') unlock(id, { quiet: id === 'beat-chess-bot' });
};
document.addEventListener('achievement', fromEvent);
addEventListener('achievement', fromEvent);

for (const id of got) light(id, false);

// Explorer: every section of the home page has passed through the middle of the screen
// (the last one counts once the page is scrolled to the bottom).
const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
if (document.getElementById('journey') && sections.length > 4 && !got.has('explorer') && 'IntersectionObserver' in window) {
  const seen = new Set<string>(read<string[]>(EXPLORED_KEY, []));
  const check = () => {
    write(EXPLORED_KEY, [...seen]);
    if (!sections.every((s) => seen.has(s.id))) return;
    io.disconnect();
    removeEventListener('scrollend', bottom);
    unlock('explorer');
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) seen.add(e.target.id), io.unobserve(e.target);
      check();
    },
    { rootMargin: '-35% 0px -35% 0px' },
  );
  const bottom = () => {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
    const last = sections[sections.length - 1];
    if (last.getBoundingClientRect().top < innerHeight) seen.add(last.id), check();
  };
  sections.forEach((s) => !seen.has(s.id) && io.observe(s));
  addEventListener('scrollend', bottom, { passive: true });
}
