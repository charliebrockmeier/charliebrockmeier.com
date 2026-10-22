// Charlie's GitHub, for the repo wall under Crafted items. The curated list knows
// about private repos, which the public API can't see. When the build-time fetch
// (scripts/fetch-stats.mjs) reached GitHub, its public repos win: they keep the
// curated description and project link but take the live push date, language and URL,
// and any new public repo shows up on its own.
import live from './live.json';
import type { Build } from './profile';

export const githubUser = 'charliebrockmeier';
export const githubUrl = `https://github.com/${githubUser}`;

export type Repo = {
  name: string;
  visibility: 'public' | 'private';
  /** One line. Private repos stay generic: what it is, never who it's for. */
  description: string;
  /** Main languages, by GitHub's count. */
  languages: string[];
  /** Frameworks and platforms worth naming next to the languages. */
  stack?: string[];
  /** Last push, YYYY-MM or YYYY-MM-DD. */
  pushed: string;
  /** Public repos only. */
  url?: string;
  /** The project page this repo belongs to. */
  project?: Build['id'];
};

// As of October 2026. Descriptions of the three older public repos come from their
// own READMEs and code.
const curated: Repo[] = [
  {
    name: 'charliebrockmeier.com',
    visibility: 'public',
    description: 'This site: a player profile in pixel art, with a chess bot and live stats.',
    languages: ['Astro', 'TypeScript'],
    pushed: '2026-10',
    project: 'site',
  },
  {
    name: 'FuneralChecker',
    visibility: 'private',
    description: 'The obituary monitor: reads 10 funeral-home sites every week.',
    languages: ['Python'],
    stack: ['GitHub Actions'],
    pushed: '2026-10',
    project: 'obituary',
  },
  {
    name: 'faceless-engine',
    visibility: 'private',
    description: 'Turns official public data into narrated, fact-checked short videos.',
    languages: ['TypeScript'],
    stack: ['Remotion'],
    pushed: '2026-10',
    project: 'faceless',
  },
  {
    name: 'brockmeier-finances',
    visibility: 'private',
    description: 'Locus: a personal OS for money, calendar and documents, with an AI assistant.',
    languages: ['TypeScript'],
    stack: ['Next.js'],
    pushed: '2026-10',
    project: 'locus',
  },
  {
    name: 'PHYT',
    visibility: 'private',
    description: 'Phyt: a fitness app for iPhone, designed and built end to end.',
    languages: [],
    stack: ['iOS'],
    pushed: '2025-11',
    project: 'phyt',
  },
  {
    name: 'AzureDevelopment',
    visibility: 'public',
    description: 'An Express app with a GitHub Actions pipeline that deploys it to Azure.',
    languages: ['JavaScript'],
    stack: ['Express'],
    pushed: '2024-04',
  },
  {
    name: 'ROTHtober',
    visibility: 'public',
    description: 'An early React app, started in 2023.',
    languages: ['JavaScript'],
    stack: ['React'],
    pushed: '2023-06',
  },
  {
    name: 'GitLab2023',
    visibility: 'public',
    description: 'A Raikes School lab for learning Git: branches, merges and conflicts.',
    languages: ['Java'],
    pushed: '2023-02',
  },
];

type LiveRepo = { name: string; description: string | null; language: string | null; url: string; pushed: string };
const gh = (live as { github?: { source?: string; repos?: LiveRepo[] } }).github;
const liveRepos = gh?.source === 'live' ? (gh.repos ?? []) : null;

function merge(): Repo[] {
  if (!liveRepos) return curated.map((r) => (r.visibility === 'public' ? { ...r, url: r.url ?? `${githubUrl}/${r.name}` } : r));
  const byName = new Map(curated.map((r) => [r.name.toLowerCase(), r]));
  const publics: Repo[] = liveRepos.map((l) => {
    const c = byName.get(l.name.toLowerCase());
    return {
      name: l.name,
      visibility: 'public',
      description: c?.description ?? l.description ?? 'A public repo.',
      languages: c?.languages.length ? c.languages : l.language ? [l.language] : [],
      stack: c?.stack,
      pushed: l.pushed,
      url: l.url,
      project: c?.project,
    };
  });
  const publicNames = new Set(publics.map((r) => r.name.toLowerCase()));
  // A curated repo the API now lists as public is shown once, as public.
  const privates = curated.filter((r) => r.visibility === 'private' && !publicNames.has(r.name.toLowerCase()));
  return [...publics, ...privates];
}

export const repos: Repo[] = merge().sort((a, b) => b.pushed.localeCompare(a.pushed) || a.name.localeCompare(b.name));

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-10" or "2026-10-22" -> "Oct 2026" */
export const pushedMonth = (pushed: string) => `${months[Number(pushed.slice(5, 7)) - 1]} ${pushed.slice(0, 4)}`;

const latest = repos[0]?.pushed.slice(0, 7) ?? '';
const languageCount = new Map<string, number>();
for (const r of repos) for (const l of r.languages) languageCount.set(l, (languageCount.get(l) ?? 0) + 1);

export const githubTotals = {
  repos: repos.length,
  public: repos.filter((r) => r.visibility === 'public').length,
  private: repos.filter((r) => r.visibility === 'private').length,
  /** Languages, most-used first. */
  languages: [...languageCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([l]) => l),
  /** Repos pushed in the most recent month with a push. */
  activeMonth: latest ? pushedMonth(latest) : '',
  active: repos.filter((r) => r.pushed.startsWith(latest)).length,
};
