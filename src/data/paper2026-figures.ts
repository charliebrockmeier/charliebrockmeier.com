// Charts and tables for the 2026 rewrite. Each value is either a published figure from
// the cited source or, where marked "my arithmetic" or "implied", derived from one.
// Nothing here is estimated by eye or invented to fill a gap.

type Fmt = { prefix?: string; suffix?: string; decimals?: number };

export type FigureSpec =
  | { kind: 'bar'; props: Record<string, unknown> & { title: string } }
  | { kind: 'line'; props: Record<string, unknown> & { title: string } }
  | { kind: 'scatter'; props: Record<string, unknown> & { title: string } }
  | { kind: 'table'; props: Record<string, unknown> & { title: string } };

const pct: Fmt = { suffix: '%' };
const pct1: Fmt = { suffix: '%', decimals: 1 };

// Longstaff (1995) upper bound, shown as a discount to value: F / (1 + F).
const lockups = [0.5, 1, 2, 3, 5, 7, 10, 12, 15];

// Share of requested cash paid at a 5% quarterly cap: min(100%, 5% / requests).
const capCurve: [number, number][] = [];
for (let x = 4; x <= 18.001; x += 0.25) capCurve.push([x, Math.min(100, (5 / x) * 100)]);

export const figures: Record<string, FigureSpec> = {
  longstaff: {
    kind: 'line',
    props: {
      title: 'The most a lockup can cost: Longstaff’s upper bound',
      subtitle: 'Maximum discount to value for a perfectly timed seller, by lockup length and asset volatility',
      desc: 'Three rising curves. At 22% volatility the bound is 16% for one year, 21% for two, 41% for ten and 47% for fifteen. At 10% volatility it reaches 22% at ten years; at 35% volatility, 55%.',
      x: lockups,
      xTicks: [1, 2, 3, 5, 7, 10, 12, 15].map((v) => ({ v, label: String(v) })),
      xLabel: 'Lockup, years',
      yLabel: 'Maximum discount, % of value',
      yMin: 0,
      yMax: 70,
      format: { suffix: '%', decimals: 0 },
      series: [
        { name: 'σ = 35%', short: '35%', values: [17.6, 23.7, 31.5, 36.8, 44.2, 49.5, 55.2, 58.2, 61.9], color: 2 },
        { name: 'σ = 22% (buyout, desmoothed)', short: '22%', values: [11.5, 15.8, 21.5, 25.5, 31.4, 35.7, 40.7, 43.4, 46.9], color: 0 },
        { name: 'σ = 10% (loan book)', short: '10%', values: [5.5, 7.6, 10.5, 12.7, 16.1, 18.6, 21.8, 23.5, 25.8], color: 1 },
      ],
      note: 'My calculation from Longstaff’s closed-form bound F, converted to a discount as F / (1 + F). It assumes the seller would have sold at the best price during the lockup, so real costs are lower.',
      source: 'Longstaff (1995) [4]; 22% buyout volatility from Anson (2024) [17].',
    },
  },

  vol: {
    kind: 'bar',
    props: {
      title: 'Reported volatility understates risk, except in credit',
      subtitle: 'Annual volatility of private capital returns, 1998–2022, as reported and after unsmoothing with lagged betas',
      desc: 'Small buyout volatility doubles from 11% to 22% after unsmoothing. Early-stage venture rises from 29% to 87%. Private credit moves only from 8% to 9%.',
      categories: ['Small buyout', 'Early-stage venture', 'Private credit'],
      series: [
        { name: 'Reported', values: [11, 29, 8], color: 1 },
        { name: 'Unsmoothed', values: [22, 87, 9], color: 0 },
      ],
      yLabel: 'Annual volatility, %',
      yMin: 0,
      yMax: 100,
      format: pct,
      source: 'Anson (2024), as summarized by Alpha Architect and others [17].',
    },
  },

  ca: {
    kind: 'bar',
    props: {
      title: 'The buyout edge is a long-horizon number',
      subtitle: 'Cambridge Associates U.S. private equity index vs. the same cash flows in the S&P 500 (mPME), annualized, periods ending December 31, 2025',
      desc: 'Private equity leads by 2.4 points over 25 years (12.4% vs 10.0%) and 1.9 over 20, but only 0.7 over 15 and 0.1 over 10. Over one year the S&P 500 equivalent returned 17.9% against 8.7%.',
      categories: ['1 year', '10 years', '15 years', '20 years', '25 years'],
      series: [
        { name: 'U.S. private equity index', values: [8.7, 15.2, 15.0, 13.2, 12.4], color: 0 },
        { name: 'S&P 500 mPME', values: [17.9, 15.1, 14.3, 11.3, 10.0], color: 1 },
      ],
      yLabel: 'Annualized net return, %',
      yMin: 0,
      yMax: 20,
      format: pct1,
      note: 'Index returns are pooled horizon IRRs net of fees, expenses and carry. The mPME invests and withdraws the same cash flows in the S&P 500.',
      source: 'Cambridge Associates, US PE/VC Benchmark Commentary: Calendar Year 2025 [24].',
    },
  },

  reits: {
    kind: 'bar',
    props: {
      title: 'Same buildings, different marks: appraised vs. traded real estate',
      subtitle: 'Calendar-year total returns, NCREIF Property Index vs. FTSE Nareit All Equity REITs',
      desc: 'In 2022 REITs fell 25% while the appraisal-based NPI rose about 5.5%. In 2023 the NPI fell 7.9% while REITs rose 11.4%. Other years: 2021, 17.7% vs 41.3%; 2024, 0.6% vs 4.9%; 2025, 4.9% vs 2.3%.',
      categories: ['2021', '2022', '2023', '2024', '2025'],
      series: [
        { name: 'NCREIF Property Index (appraised, unlevered)', values: [17.7, 5.5, -7.9, 0.6, 4.9], color: 0 },
        { name: 'All Equity REITs (traded daily)', values: [41.3, -25.0, 11.4, 4.9, 2.3], color: 1 },
      ],
      yLabel: 'Total return, %',
      yMin: -30,
      yMax: 45,
      format: pct1,
      note: 'NPI 2022 is my compounding of NCREIF’s quarterly returns (5.33%, 3.23%, 0.6%, −3.5%). NPI 2024 is the Expanded NPI; NPI 2025 is the trailing four quarters. REIT 2022 return was −24.95%; 2025 is Nareit’s year-to-date figure at December 31.',
      source: 'NCREIF releases and coverage [41–46]; Nareit [47, 48].',
    },
  },

  secpricing: {
    kind: 'line',
    props: {
      title: 'The price of liquidity: what buyers pay for LP fund stakes',
      subtitle: 'Average LP portfolio pricing in the secondary market, % of NAV',
      desc: 'Buyout stakes priced at 91% to 94% of NAV from 2023 to mid-2026. Venture recovered from 68% in 2022 and 2023 to 78% in 2025. The all-strategy average fell from about 92% in 2021 to 81% in 2022 and has held near 87% since 2025.',
      x: [2021, 2022, 2023, 2024, 2025, 2026],
      xTicks: [
        { v: 2021, label: '2021' },
        { v: 2022, label: '2022' },
        { v: 2023, label: '2023' },
        { v: 2024, label: '2024' },
        { v: 2025, label: '2025' },
        { v: 2026, label: 'H1 2026' },
      ],
      yLabel: 'Price, % of NAV',
      yMin: 60,
      yMax: 100,
      format: pct,
      refs: [{ v: 100, label: 'Par: 100% of NAV' }],
      series: [
        { name: 'Buyout', values: [97, 87, 91, 94, 92, 91], implied: [true, true, false, false, false, false], color: 0 },
        { name: 'All strategies', short: 'All', values: [92, 81, 85, 89, 87, 87], implied: [true, false, false, false, false, false], color: 1 },
        { name: 'Venture', values: [88, 68, 68, 75, 78, null], implied: [true, true, false, false, false, false], color: 2 },
      ],
      note: 'Hollow markers are implied from changes Jefferies reports rather than stated levels: 2021 from the declines to mid-2022 and to full-year 2022 [50, 51]; 2022 buyout from the 400 bp rise to 91% in 2023; 2022 venture from the statement that 2023 pricing matched the prior year [52]. H1 2026 all-strategy pricing is “approximately 87%.” Venture for H1 2026 is not shown.',
      source: 'Jefferies Global Secondary Market Reviews, 2022–2026 [50–55].',
    },
  },

  secvolume: {
    kind: 'bar',
    props: {
      title: 'A real market for liquidity',
      subtitle: 'Global secondary transaction volume, LP-led and GP-led combined, $ billions',
      desc: 'Volume was $132 billion in 2021, $108 billion in 2022, about $112 billion in 2023, $162 billion in 2024 and a record $240 billion in 2025.',
      categories: ['2021', '2022', '2023', '2024', '2025'],
      series: [{ name: 'Secondary volume', values: [132, 108, 112, 162, 240], color: 0 }],
      yLabel: 'Volume, $ billions',
      yMin: 0,
      yMax: 250,
      format: { prefix: '$', suffix: 'bn', decimals: 0 },
      note: '2023 is Jefferies’ approximate figure (“around $112 billion”). The first half of 2026 alone was $118 billion [55]. Lazard’s estimate for 2025 is $233 billion [57].',
      source: 'Jefferies [51–54, 56].',
    },
  },

  dist: {
    kind: 'bar',
    props: {
      title: 'Distributions dried up',
      subtitle: 'Global buyout fund distributions as a share of NAV',
      desc: 'Distributions averaged 29% of NAV from 2014 to 2017, fell to 11% in 2024 and recovered only to about 14% in 2025.',
      categories: ['2014–2017 average', '2024', '2025'],
      series: [{ name: 'Distributions, % of NAV', values: [29, 11, 14], color: 0 }],
      yLabel: 'Distributions, % of NAV',
      yMin: 0,
      yMax: 30,
      format: pct,
      height: 280,
      note: '2025 is Bain’s approximate figure (“about 14%”), the fourth straight year below 15%.',
      source: 'Bain & Company, Global Private Equity Report 2025 and 2026 [62, 63].',
    },
  },

  gates: {
    kind: 'scatter',
    props: {
      title: 'A 5% gate in practice: semi-liquid funds in 2026',
      subtitle: 'Quarterly redemption requests vs. the share of requested money paid out',
      desc: 'Points fall on the curve 5% divided by requests. Apollo Debt Solutions paid about 45% of requests in Q1 (11.2% requested), about 30% in Q2 (16.8%) and 34% in Q3 (14.7%). Ares Strategic Income Fund paid 43.1%. BCRED paid all of a 7.9% request in Q1 by raising its cap, then about half of a 10% request in Q2. Partners Group funds paid about 51% and 83%.',
      xLabel: 'Requests, % of shares or NAV',
      yLabel: 'Share of requests paid, %',
      xMin: 4,
      xMax: 18,
      yMin: 20,
      yMax: 100,
      xFormat: { suffix: '%', decimals: 1 },
      yFormat: { suffix: '%', decimals: 0 },
      height: 360,
      groups: ['Blackstone BCRED', 'Apollo Debt Solutions', 'Ares Strategic Income', 'Partners Group'],
      curve: { pts: capCurve, label: 'Paid if the fund pays exactly 5%: 5% ÷ requests' },
      points: [
        { x: 7.9, y: 100, label: 'BCRED Q1', pos: 'right', group: 0 },
        { x: 10, y: 50, label: 'BCRED Q2', pos: 'right', posN: 'right', group: 0 },
        { x: 11.2, y: 45, label: 'ADS Q1', pos: 'left', posN: 'left', group: 1 },
        { x: 16.8, y: 30, label: 'ADS Q2', pos: 'above', posN: 'above', group: 1 },
        { x: 14.7, y: 34, label: 'ADS Q3', pos: 'below', posN: 'below', group: 1 },
        { x: 11.6, y: 43.1, label: 'ASIF Q1', pos: 'below', posN: 'below', group: 2 },
        { x: 9.8, y: 51, label: 'PG SICAV Q2', pos: 'left', posN: 'left', group: 3 },
        { x: 6, y: 83, label: 'PG U.S. PE Q2', pos: 'right', group: 3 },
      ],
      note: 'Shares paid are stated by the funds for BCRED Q1 (100%), ADS Q1 (about 45%), ADS Q3 (about 34%) and ASIF Q1 (43.1%). For the others I divide the 5% paid by the reported request. ASIF’s request (about 11.6%) is implied by 5% being 43.1% of requests. Partners Group requests are approximate (about 9.8% and 6%).',
      source: 'Fund filings and notices [68–71]; Bloomberg via Swissinfo [72].',
    },
  },

  jcurve: {
    kind: 'line',
    props: {
      title: 'The J-curve: you fund it for four years before it funds you',
      subtitle: 'Illustrative $100 commitment to a 12-year fund, Takahashi–Alexander model, no fees',
      desc: 'Cumulative net cash flow falls to −$79 in year 4, crosses zero in year 8 and ends at +$79 in year 12. NAV peaks near $104 in year 5.',
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      xLabel: 'Fund year',
      yLabel: '$ per $100 committed',
      yMin: -100,
      yMax: 120,
      format: { prefix: '$', decimals: 0 },
      refs: [{ v: 0 }],
      series: [
        { name: 'Net asset value', short: 'NAV', values: [25.0, 52.7, 82.2, 98.6, 104.3, 99.3, 83.9, 60.6, 35.2, 14.6, 3.3, 0.0], color: 1 },
        { name: 'Cumulative net cash flow', short: 'Net cash', values: [-25.0, -49.7, -72.8, -79.4, -73.3, -55.8, -28.4, 4.9, 37.6, 62.4, 75.5, 79.1], color: 0 },
      ],
      note: 'My illustration. Contributions: 25%, 33% and then 50% of the unfunded commitment each year. Growth: 12% a year. Distribution bow: 2.5. Life: 12 years. Result: $179 distributed on $100 paid in, a 12% IRR.',
      source: 'Model from Takahashi and Alexander (2002) [85]; parameters and calculation mine.',
    },
  },

  scoreboard: {
    kind: 'table',
    props: {
      title: 'What each market pays for illiquidity',
      subtitle: 'Best public evidence, with my reading of it',
      columns: [{ label: 'Market' }, { label: 'Evidence' }, { label: 'Premium' }, { label: 'My read' }],
      minWidth: 640,
      rows: [
        ['Treasuries', 'Refcorp vs. Treasury yields, 1991–2001 [8]; on-the-run vs. off-the-run 30-year bond [9]', '10–16 bp; 12 bp on one day in 2001', 'Tiny in normal times, large in a flight to safety'],
        ['Corporate bonds', 'Non-default share of the spread, CDS-implied [10]', '49% of the spread (AAA/AA) to 17% (BB)', 'Collectible daily, with no lockup'],
        ['U.S. stocks: illiquidity level', 'Characteristic premium [7]', 'About 1.8%/yr in the 1960s, near zero since outside microcaps', 'Mostly gone'],
        ['U.S. stocks: liquidity risk', 'High minus low liquidity beta, 1966–1999 [5]; replications [6]', '7.5%/yr; larger since 1999', 'The premium that lasts'],
        ['Buyouts', 'Cambridge U.S. PE index vs. S&amp;P 500 mPME [24]', '+2.4 pts/yr over 25 years; +0.1 over 10', 'Thin after fees; near zero after leverage and size [20, 21]'],
        ['Venture', 'Top vs. bottom quartile IRR [30]; outcome skew [28, 29]', 'About 20 pts quartile spread', 'Access matters more than the asset class'],
        ['Direct lending', 'Cliffwater index vs. leveraged loans, 2025 [32, 34]; buyout loan spread vs. syndicated [35]', '3.4 pts total in 2025; about 1.5 pts like-for-like', 'The clearest premium, before fees and defaults'],
        ['Core real estate', 'NPI vs. REITs, 2021–2025 (Figure 4)', 'Five-year totals of about +21% vs. +27% (my arithmetic)', 'No visible premium, only a delay'],
        ['Infrastructure', 'Closed-end fund cash flows and returns [49]', 'Weak risk-adjusted performance', 'Unproven'],
        ['Secondaries', 'LP stake prices, 2025 [54]', 'Buyout 92%, venture 78%, real estate 70% of NAV', 'About 2%/yr for buyout, 5%/yr for venture (implied, Section 4)'],
      ],
      source: 'As cited in each row; see Sections 1 through 4.',
    },
  },

  hurdle: {
    kind: 'table',
    props: {
      title: 'Required net premium by lockup length',
      subtitle: '% a year over a public portfolio with matched risk, after fees. Liquidity need λ is the share of Longstaff’s timing option the investor would use.',
      columns: [
        { label: 'Lockup (years)' },
        { label: 'Upper bound, σ = 10%', align: 'right' },
        { label: 'Upper bound, σ = 22%', align: 'right' },
        { label: 'Upper bound, σ = 35%', align: 'right' },
        { label: 'Patient investor (λ = 25%, σ = 22%)', align: 'right' },
        { label: 'Stretched investor (λ = 75%, σ = 22%)', align: 'right' },
      ],
      minWidth: 540,
      rows: [
        ['2', '5.7%', '12.8%', '20.8%', '3.4%', '9.8%'],
        ['3', '4.6%', '10.3%', '16.5%', '2.8%', '7.9%'],
        ['5', '3.6%', '7.8%', '12.4%', '2.2%', '6.1%'],
        ['7', '3.0%', '6.5%', '10.2%', '1.9%', '5.1%'],
        ['10', '2.5%', '5.4%', '8.4%', '1.6%', '4.2%'],
        ['12', '2.3%', '4.9%', '7.5%', '1.5%', '3.9%'],
      ],
      note: 'My calculation: required premium = (1 + λF)<sup>1/T</sup> − 1, where F is Longstaff’s bound for lockup T and volatility σ. Upper-bound columns set λ = 100%. Add 4 to 5 points of fee drag for the gross hurdle. An illustration, not a forecast or advice.',
      source: 'Longstaff (1995) [4]; volatility levels from Anson (2024) [17].',
    },
  },
};
