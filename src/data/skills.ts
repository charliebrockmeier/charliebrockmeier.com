// The skill tree on the character sheet. Five branches, five tiers each: tier I is
// where a skill started, tier V is the capstone it's building toward. `level` is out
// of 5; `from` is where it was earned; `needs` names skills in other branches that
// had to come first, which is how the branches connect.
import type { IconName } from './pixels';

export type Skill = { name: string; level: number; from: string; note: string; needs?: string[] };
export type Branch = { id: string; name: string; icon: IconName; color: string; tagline: string; skills: Skill[] };

export const MAX_LEVEL = 5;
export const tiers = ['Fundamentals', 'Applied', 'Professional', 'Advanced', 'Capstone'];

export const branches: Branch[] = [
  {
    id: 'finance',
    name: 'Finance',
    icon: 'coins',
    color: 'gold',
    tagline: 'The core build',
    skills: [
      { name: 'Accounting', level: 5, from: 'UNL', note: 'B.S.B.A. in finance and accounting, High Distinction.' },
      { name: 'Valuation and modeling', level: 4, from: 'UNL', note: 'Case competitions, capstones and a paper on the illiquidity premium.' },
      { name: 'Private-markets diligence', level: 4, from: 'Three Bridge', note: 'Intro calls, investment memos and committee overviews, by hand.' },
      { name: 'Private-fund analysis', level: 4, from: 'Vantager · MSCI', note: 'Sizing up private funds before investors commit capital.' },
      { name: 'Private markets × AI', level: 3, from: 'MSCI', note: 'Where finance and AI meet. Still leveling.', needs: ['AI diligence products'] },
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'chip',
    color: 'teal',
    tagline: 'Arrived in 2023, never left',
    skills: [
      { name: 'LLM products', level: 4, from: 'UNL', note: 'A GPT-3.5 support assistant trained on 250,000 tickets, in 2023.' },
      { name: 'Machine learning', level: 3, from: 'UNL', note: 'Senior capstone: ML for $500M of capital-expenditure decisions.' },
      { name: 'Agents and automation', level: 4, from: 'Personal projects', note: 'Scheduled agents that scrape, check and email on their own.', needs: ['Python'] },
      { name: 'AI diligence products', level: 4, from: 'Vantager', note: 'Turning data-room documents into diligence reports.', needs: ['Private-markets diligence'] },
      { name: 'Evaluation and trust', level: 3, from: 'Personal projects', note: 'Every number fact-checked against its source; every AI action logged for approval.' },
    ],
  },
  {
    id: 'code',
    name: 'Code',
    icon: 'bolt',
    color: 'blue',
    tagline: 'Production since 2021',
    skills: [
      { name: 'Python', level: 4, from: 'Cash-Wa', note: 'Macros first, then scrapers, pipelines and workbooks.' },
      { name: 'JavaScript, C# and SQL', level: 4, from: 'UNL · Buckle', note: 'Raikes School software teams and an e-commerce site.' },
      { name: 'Shipping to production', level: 4, from: 'Buckle · Covisum', note: 'Real users on my code before graduation.' },
      { name: 'TypeScript and Next.js', level: 4, from: 'Locus', note: 'Locus, the faceless engine and this site.' },
      { name: 'Testing at scale', level: 3, from: 'Locus', note: '4,349 tests on one personal project.' },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    icon: 'chart',
    color: 'violet',
    tagline: 'Users first',
    skills: [
      { name: 'Customer conversations', level: 4, from: 'Covisum', note: 'Built a client intake form side by side with the CEO.' },
      { name: 'Product management', level: 4, from: 'UNL', note: 'PM of the senior capstone for Conagra Brands.' },
      { name: 'Data quality and QA', level: 4, from: 'Vantager', note: 'Kept the platform and its data honest.' },
      { name: 'Growth', level: 3, from: 'Vantager', note: 'Growth and product analyst at an early-stage startup.', needs: ['Customer conversations'] },
      { name: 'Design', level: 3, from: 'Personal projects', note: 'Phyt from logo to last screen, and every pixel here.' },
    ],
  },
  {
    id: 'lead',
    name: 'Leadership',
    icon: 'podium',
    color: 'coral',
    tagline: 'Budgets, people, rooms',
    skills: [
      { name: 'Budgets', level: 5, from: 'FarmHouse', note: 'Treasurer for two terms: an $850K budget for 110 members.' },
      { name: 'Teaching', level: 4, from: 'UNL', note: 'TA for Honors Computer Science I and II.' },
      { name: 'Mentoring', level: 4, from: 'NHRI', note: 'Mentor, tri-chair and staff advisor; researched 75 years of it.' },
      { name: 'Running teams', level: 3, from: 'UNL', note: 'Capstone teams, Mortar Board and a ski trip for 21.' },
      { name: 'Committee presence', level: 3, from: 'Three Bridge', note: 'Presenting deals to an investment committee.', needs: ['Private-markets diligence'] },
    ],
  },
];

// Off the clock: the side-skill row under the tree.
export const hobbies: { name: string; icon: IconName; color: string; value: string; label: string }[] = [
  { name: 'Golf', icon: 'golf', color: 'green', value: '10', label: 'peak handicap' },
  { name: 'Chess', icon: 'knight', color: 'gold', value: '1209', label: 'rapid, top 7%' },
  { name: 'Piano', icon: 'note', color: 'teal', value: '10+', label: 'years at the keys' },
  { name: 'Huskers', icon: 'husker', color: 'red', value: 'GBR', label: 'road games and all' },
];
