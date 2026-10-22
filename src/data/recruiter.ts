// The recruiter page (/recruiter): only what profile.ts doesn't already say. The
// summary, roles, education, skills, links and resume all come from profile.ts.
import type { Build } from './profile';

export const recruiter = {
  kicker: 'For recruiters and collaborators',
  intro: 'Everything in one screen: who I am, what I’ve built, and the fastest ways to reach me.',

  // Headline numbers. Each one already appears elsewhere on the site.
  facts: [
    { value: 'Acquired', label: 'Vantager, the AI diligence startup I joined early, was acquired by MSCI in 2026.' },
    { value: '250,000', label: 'support tickets behind my first LLM product, in 2023.' },
    { value: '4,349', label: 'tests passing in Locus, my personal OS: 143 API handlers, 36 AI tools.' },
    { value: '$850K', label: 'annual budget I ran as fraternity treasurer, for 110 members.' },
  ],

  // Finance and AI skills; the code list is the resume's own.
  skills: {
    finance: ['Private-markets diligence', 'Investment memos', 'Valuation and accounting', 'Portfolio drift and grading'],
    ai: ['AI diligence products', 'Assistants with tools and an approval ledger', 'Fact-checked data pipelines'],
  },

  /** Projects to feature, in order. */
  projects: ['locus', 'faceless', 'obituary', 'portfolio'] satisfies Build['id'][],

  /** One line on the previous role, for readers who don't know the name. */
  previous: 'An AI-native private-markets diligence startup, acquired by MSCI in 2026.',

  education: { program: 'Raikes School honors program' },

  // The draft-an-email form. The subject is `subject`, plus `join` and the company
  // when one is given: "A role at Acme".
  topics: [
    { label: 'A role', subject: 'A role', join: 'at' },
    { label: 'A project or collaboration', subject: 'A project', join: 'with' },
    { label: 'Something else', subject: 'Hello from charliebrockmeier.com', join: '' },
  ],
};
