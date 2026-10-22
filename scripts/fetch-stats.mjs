// Pulls live numbers for the site at build time: chess.com games and public GitHub repos.
// Writes src/data/live.json. If a source can't be reached, its previous numbers stay,
// so a build never fails because chess.com or GitHub is down.
//
//   npm run stats          refresh live.json on its own
//   npm run build          runs this first, then astro build
import { readFileSync, writeFileSync } from 'node:fs';

const CHESS_USER = 'charliecaro';
const GITHUB_USER = 'charliebrockmeier';
const TZ = 'America/New_York';
const UA = 'charliebrockmeier.com build (charliebrockmeier@gmail.com)';
const OUT = new URL('../src/data/live.json', import.meta.url);

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
})();

async function get(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// YYYY-MM-DD and hour in New York time for a unix timestamp.
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const hourFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' });
const dayOf = (ts) => dayFmt.format(new Date(ts * 1000));
const hourOf = (ts) => Number(hourFmt.format(new Date(ts * 1000)));
const addDays = (day, n) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const DRAWS = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient']);

// "https://www.chess.com/openings/Sicilian-Defense-Open-2...Nc6" -> "Sicilian Defense"
function openingName(game) {
  const url = game.eco || game.pgn?.match(/\[ECOUrl "([^"]+)"\]/)?.[1];
  if (!url) return null;
  const words = decodeURIComponent(url.split('/').pop()).split('-');
  const name = [];
  for (const w of words) {
    if (/\d/.test(w) || w.includes('.')) break;
    name.push(w);
  }
  // Keep the family: "Sicilian Defense", "Queens Pawn Opening", "Italian Game".
  const end = name.findIndex((w) => /^(Defense|Opening|Game|Gambit|Attack|System)$/.test(w));
  const plain = (end > -1 ? name.slice(0, end + 1) : name.slice(0, 3)).join(' ');
  // URL slugs drop punctuation; put back the common ones.
  return (
    plain
      .replace('Caro Kann', 'Caro-Kann')
      .replace(/\b(King|Queen)s\b/g, "$1's")
      .replace('Ruy Lopez', 'Ruy López') || null
  );
}

// Seconds between the PGN's start and end clock times (live games only).
function duration(pgn = '') {
  const h = (k) => pgn.match(new RegExp(`\\[${k} "([^"]+)"\\]`))?.[1];
  const [sd, st, ed, et] = [h('UTCDate') ?? h('Date'), h('StartTime'), h('EndDate'), h('EndTime')];
  if (!sd || !st || !ed || !et) return 0;
  const s = Date.parse(`${sd.replaceAll('.', '-')}T${st}Z`);
  const e = Date.parse(`${ed.replaceAll('.', '-')}T${et}Z`);
  const secs = (e - s) / 1000;
  return secs > 0 && secs < 4 * 3600 ? secs : 0;
}

async function chess() {
  const today = dayFmt.format(new Date());
  const year = Number(today.slice(0, 4));
  const { archives } = await get(`https://api.chess.com/pub/player/${CHESS_USER}/games/archives`);
  // This year and last year: enough for the year's numbers and a long streak.
  const wanted = archives.filter((u) => Number(u.split('/').at(-2)) >= year - 1);
  const games = [];
  for (const url of wanted) games.push(...(await get(url)).games);
  const stats = await get(`https://api.chess.com/pub/player/${CHESS_USER}/stats`);

  const played = new Map(); // day -> games, across both years
  // Rapid over the last 90 days: record, rating change and opponent strength.
  const cutoff = Date.now() / 1000 - 90 * 86400;
  const r90 = { games: 0, wins: 0, draws: 0, losses: 0, first: null, last: null, opp: 0 };
  const y = {
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    months: Array.from({ length: 12 }, () => ({ games: 0, wins: 0 })),
    hours: Array(24).fill(0),
    weekdays: Array(7).fill(0),
    timeClasses: {},
    colors: { white: { games: 0, wins: 0 }, black: { games: 0, wins: 0 } },
    openings: {},
    seconds: 0,
    accuracy: [],
    bestWin: null,
    longestWinStreak: 0,
    days: {},
  };
  let run = 0;
  games.sort((a, b) => a.end_time - b.end_time);
  for (const g of games) {
    if (g.rules !== 'chess') continue;
    const day = dayOf(g.end_time);
    played.set(day, (played.get(day) ?? 0) + 1);

    const side = g.white.username.toLowerCase() === CHESS_USER ? 'white' : 'black';
    const me = g[side];
    const opp = g[side === 'white' ? 'black' : 'white'];
    const result = me.result === 'win' ? 'win' : DRAWS.has(me.result) ? 'draw' : 'loss';
    if (g.time_class === 'rapid' && g.rated && g.end_time >= cutoff) {
      r90.games++;
      r90[result === 'win' ? 'wins' : result === 'draw' ? 'draws' : 'losses']++;
      r90.first ??= me.rating;
      r90.last = me.rating;
      r90.opp += opp.rating;
    }
    if (Number(day.slice(0, 4)) !== year) continue;
    const month = Number(day.slice(5, 7)) - 1;

    y.games++;
    y[result === 'win' ? 'wins' : result === 'draw' ? 'draws' : 'losses']++;
    y.months[month].games++;
    if (result === 'win') y.months[month].wins++;
    y.hours[hourOf(g.end_time)]++;
    y.weekdays[new Date(`${day}T12:00:00Z`).getUTCDay()]++;
    y.timeClasses[g.time_class] = (y.timeClasses[g.time_class] ?? 0) + 1;
    y.colors[side].games++;
    if (result === 'win') y.colors[side].wins++;
    y.days[day] = (y.days[day] ?? 0) + 1;
    if (g.time_class !== 'daily') y.seconds += duration(g.pgn);
    if (g.accuracies?.[side]) y.accuracy.push(g.accuracies[side]);

    const name = openingName(g);
    if (name) {
      y.openings[name] ??= { games: 0, wins: 0 };
      y.openings[name].games++;
      if (result === 'win') y.openings[name].wins++;
    }
    if (result === 'win' && (!y.bestWin || opp.rating > y.bestWin.rating))
      y.bestWin = { rating: opp.rating, timeClass: g.time_class, date: day };
    run = result === 'win' ? run + 1 : 0;
    y.longestWinStreak = Math.max(y.longestWinStreak, run);
  }

  // Current streak: consecutive days with a game, ending today or yesterday.
  let streak = 0;
  let day = played.has(today) ? today : addDays(today, -1);
  while (played.has(day)) {
    streak++;
    day = addDays(day, -1);
  }

  const busiest = Object.entries(y.days).sort((a, b) => b[1] - a[1])[0];
  // Percentiles aren't in the public API; keep the last known ones.
  const rating = (k) =>
    stats[k] && {
      current: stats[k].last?.rating,
      best: stats[k].best?.rating,
      record: stats[k].record,
      percentile: previous.chess?.ratings?.[k.replace('chess_', '')]?.percentile,
    };
  const record = ['chess_bullet', 'chess_blitz', 'chess_rapid', 'chess_daily'].reduce(
    (t, k) => {
      const r = stats[k]?.record;
      return r ? { wins: t.wins + r.win, draws: t.draws + r.draw, losses: t.losses + r.loss } : t;
    },
    { wins: 0, draws: 0, losses: 0 },
  );
  const allTime = record.wins + record.draws + record.losses;

  return {
    asOf: today,
    year,
    streak,
    games: y.games,
    wins: y.wins,
    losses: y.losses,
    draws: y.draws,
    months: y.months,
    hours: y.hours,
    weekdays: y.weekdays,
    timeClasses: y.timeClasses,
    colors: y.colors,
    openings: Object.entries(y.openings)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 5),
    hoursPlayed: Math.round(y.seconds / 3600),
    accuracy: y.accuracy.length ? Math.round((y.accuracy.reduce((a, b) => a + b, 0) / y.accuracy.length) * 10) / 10 : null,
    bestWin: y.bestWin,
    longestWinStreak: y.longestWinStreak,
    busiestDay: busiest ? { date: busiest[0], games: busiest[1] } : null,
    daysPlayed: Object.keys(y.days).length,
    days: y.days,
    ratings: {
      bullet: rating('chess_bullet'),
      blitz: rating('chess_blitz'),
      rapid: rating('chess_rapid'),
      daily: rating('chess_daily'),
      puzzles: stats.tactics?.highest?.rating ?? null,
    },
    allTimeGames: allTime,
    allTime: { ...previous.chess?.allTime, ...record },
    rapid90: r90.games
      ? {
          games: r90.games,
          wins: r90.wins,
          draws: r90.draws,
          losses: r90.losses,
          change: r90.last - r90.first,
          avgOpponent: Math.round(r90.opp / r90.games),
        }
      : previous.chess?.rapid90,
  };
}

async function github() {
  const auth = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const user = await get(`https://api.github.com/users/${GITHUB_USER}`, auth);
  const repos = await get(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, auth);
  const list = repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      homepage: r.homepage || null,
      pushed: r.pushed_at.slice(0, 10),
      created: r.created_at.slice(0, 10),
      topics: r.topics ?? [],
    }));
  const languages = {};
  for (const r of list) if (r.language) languages[r.language] = (languages[r.language] ?? 0) + 1;
  return { asOf: new Date().toISOString().slice(0, 10), publicRepos: user.public_repos, since: user.created_at.slice(0, 4), languages, repos: list };
}

const live = { ...previous };
for (const [key, fn] of Object.entries({ chess, github })) {
  try {
    live[key] = { ...previous[key], ...(await fn()), source: 'live' };
    console.log(`stats: ${key} updated`);
  } catch (err) {
    console.warn(`stats: ${key} unavailable (${err.message}); keeping the previous numbers`);
  }
}
writeFileSync(OUT, JSON.stringify(live, null, 2) + '\n');
