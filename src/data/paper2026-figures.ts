// Charts and tables for the 2026 rewrite. Each value is either a published figure from
// the cited source or, where marked "my arithmetic" or "implied", derived from one.
// Nothing here is estimated by eye or invented to fill a gap. Market data for the
// charts built from raw public series comes from paper2026-data.json, which
// scripts/paper-data.py regenerates (npm run paper:data).
import data from './paper2026-data.json';

type Fmt = { prefix?: string; suffix?: string; decimals?: number };

export type FigureSpec = {
  kind: 'bar' | 'line' | 'scatter' | 'table' | 'heat' | 'rows' | 'series';
  props: Record<string, unknown> & { title: string };
};

const pct: Fmt = { suffix: '%' };
const pct1: Fmt = { suffix: '%', decimals: 1 };
const r1 = (v: number) => Math.round(v * 10) / 10;

// Standard normal distribution function (Abramowitz and Stegun 7.1.26; error below 1e-7).
function N(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp((-x * x) / 2);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Longstaff (1995): upper bound on the cost of a T-year lockup at volatility s, as a fraction of value. */
function longstaff(T: number, s: number) {
  const v = s * s * T;
  return (2 + v / 2) * N(Math.sqrt(v) / 2) + Math.sqrt(v / (2 * Math.PI)) * Math.exp(-v / 8) - 1;
}

// Cambridge Associates horizon returns to December 31, 2025 [24], and average bill returns [93].
const ca = {
  pe: { 10: 15.2, 15: 15.0, 20: 13.2, 25: 12.4 } as Record<number, number>,
  sp: { 10: 15.1, 15: 14.3, 20: 11.3, 25: 10.0 } as Record<number, number>,
};
const bills = data.bills.horizonsToDec2025 as Record<string, number>;
/** Premium over a public portfolio with the same market beta, financed at the bill rate. */
const alpha = (years: number, beta: number) => r1(ca.pe[years] - ca.sp[years] - (beta - 1) * (ca.sp[years] - bills[String(years)]));
const horizons = [10, 15, 20, 25];

// The 25-year ledger: gross, fees, net, leverage, lockup.
const FEES = 3.5; // AQR's all-in fee estimate [26]
const LOCKUP = 1.6; // patient investor, ten years, 22% volatility (the hurdle table)
const net25 = r1(ca.pe[25] - ca.sp[25]);
const lev25 = r1(0.3 * (ca.sp[25] - bills['25']));
const matched25 = r1(net25 - lev25);

const mk = data.marking;
// Named here so no array index sits inside a text field, where the citation checker
// would read it as a source number.
const [ep07, ep20, ep22] = mk.episodes;
const win1 = mk.byWindow.find((w) => w.k === 1)!;
const win4 = mk.byWindow.find((w) => w.k === 4)!;
const win8 = mk.byWindow.find((w) => w.k === 8)!;
const markLabels = mk.series.labels as string[];
const yearTicks = markLabels
  .map((l, i) => ({ i, y: Number(l.slice(0, 4)) + 1, q4: l.endsWith('Q4') }))
  .filter((t) => t.q4 && t.y % 4 === 0)
  .map((t) => ({ i: t.i, label: String(t.y) }));
const f2 = (v: number) => v.toFixed(2);
const p1 = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`;

// Annual return a buyer earns from a discount alone: (1 / price)^(1 / years) − 1.
const secPrices = [54, 70, 78, 87, 91, 94];
const secYears = [2, 3, 4, 5, 6];

// Private share after public assets fall 25% and private marks fall 5%.
const drift = (w: number) => r1(((w * 0.95) / (w * 0.95 + (100 - w) * 0.75)) * 100);
const starts = [10, 20, 30, 40, 50];

const boundVols = [5, 10, 15, 22, 30, 40];
const boundYears = [1, 2, 3, 5, 7, 10, 12];

// Longstaff (1995) upper bound, shown as a discount to value: F / (1 + F).
const lockups = [0.5, 1, 2, 3, 5, 7, 10, 12, 15];

// Share of requested cash paid at a 5% quarterly cap: min(100%, 5% / requests).
const capCurve: [number, number][] = [];
for (let x = 4; x <= 24.001; x += 0.25) capCurve.push([x, Math.min(100, (5 / x) * 100)]);

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
      desc: 'Points fall on the curve 5% divided by requests. Apollo Debt Solutions paid about 45% of requests in Q1 (11.2% requested), about 30% in Q2 (16.8%) and 34% in Q3 (14.7%). Ares Strategic Income Fund paid 43.1%. BCRED paid all of a 7.9% request in Q1 by raising its cap, then about half of a 10% request in Q2. Partners Group funds paid about 51% and 83%. Blue Owl Credit Income paid about 23% of a 21.9% request in Q1 and 27% of an 18.8% request in Q2.',
      xLabel: 'Requests, % of shares or NAV',
      yLabel: 'Share of requests paid, %',
      xMin: 4,
      xMax: 24,
      yMin: 10,
      yMax: 100,
      xFormat: { suffix: '%', decimals: 1 },
      yFormat: { suffix: '%', decimals: 0 },
      height: 360,
      groups: ['Blackstone BCRED', 'Apollo Debt Solutions', 'Ares Strategic Income', 'Partners Group', 'Blue Owl Credit Income'],
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
        { x: 21.9, y: 22.8, label: 'OCIC Q1', pos: 'above', posN: 'above', group: 4 },
        { x: 18.8, y: 26.6, label: 'OCIC Q2', pos: 'below', posN: 'below', group: 4 },
      ],
      note: 'Shares paid are stated by the funds for BCRED Q1 (100%), ADS Q1 (about 45%), ADS Q3 (about 34%) and ASIF Q1 (43.1%). For the others I divide the 5% paid by the reported request. ASIF’s request (about 11.6%) is implied by 5% being 43.1% of requests. Partners Group requests are approximate (about 9.8% and 6%). Blue Owl Credit Income (OCIC) is 5% divided by its reported requests. Blue Owl’s technology fund, at 40.7% and 38.1%, is off the chart to the right.',
      source: 'Fund filings and notices [68–71]; Bloomberg via Swissinfo [72]; Reuters [97].',
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

  ledger: {
    kind: 'rows',
    props: {
      mode: 'waterfall',
      title: 'Where the premium went: buyouts over the best 25 years on record',
      subtitle: 'Cambridge Associates U.S. private equity index vs. the S&P 500 on the same cash flows, 2001–2025, points a year',
      desc: `Before fees the index led the S&P 500 by about ${r1(net25 + FEES)} points a year. Fees took ${FEES}, leaving the published ${net25}. Matching the leverage in buyouts takes ${lev25}, leaving ${matched25}. A patient investor needs ${LOCKUP} for the lockup, so the shortfall is ${r1(matched25 - LOCKUP)} points a year.`,
      rows: [
        { label: 'Return over the S&P 500, before fees', short: 'Over S&P 500, before fees', value: r1(net25 + FEES), kind: 'level' },
        { label: 'Fees and carry', value: -FEES, kind: 'change' },
        { label: 'What investors received', value: net25, kind: 'level' },
        { label: 'Extra market risk from leverage (beta 1.3)', short: 'Leverage (beta 1.3)', value: -lev25, kind: 'change' },
        { label: 'After matching the risk', value: matched25, kind: 'level' },
        { label: 'Owed for a ten-year lockup', short: 'Owed for the lockup', value: -LOCKUP, kind: 'change' },
        { label: 'Left for the investor', value: r1(matched25 - LOCKUP), kind: 'level' },
      ],
      xLabel: 'Percentage points a year',
      format: { decimals: 1 },
      note: `My arithmetic. Net premium: 12.4% less 10.0% [24]. Fees: AQR’s all-in estimate of 3.5 points a year, which it lowered from 4 this year [26]; my own fee model in Section 7 gives 4.0 to 4.8. Leverage: 0.3 times the S&P 500’s return over Treasury bills, 10.0% less ${bills['25']}% [91, 93]. Lockup: the patient-investor hurdle from {fig:hurdle}. Over the last ten years the same steps run 0.1, −3.9, −1.6 and end at −5.4.`,
      source: 'Cambridge Associates [24]; AQR [26]; Franzoni, Nowak and Phalippou [91]; Ken French data library [93]; Longstaff [4].',
    },
  },

  bound: {
    kind: 'heat',
    props: {
      title: 'The price of a lockup, per year',
      subtitle: 'Longstaff’s upper bound spread over the lockup: the most a perfectly timed seller would pay, % of value a year',
      desc: 'The bound per year falls as the lockup lengthens and rises with volatility. At 22% volatility it is 18.8% a year for one year, 12.8% for two, 7.8% for five and 5.4% for ten. At 10% volatility a ten-year lockup costs at most 2.5% a year; at 40%, 9.5%.',
      rows: ['5%', '10% (loan book)', '15%', '22% (buyout)', '30%', '40%'],
      rowsShort: ['5%', '10%', '15%', '22%', '30%', '40%'],
      cols: boundYears.map(String),
      values: boundVols.map((v) => boundYears.map((T) => r1(((1 + longstaff(T, v / 100)) ** (1 / T) - 1) * 100))),
      rowLabel: 'Volatility',
      colLabel: 'Lockup, years',
      format: pct1,
      marks: [[3, 5]],
      note: 'My calculation: (1 + F)<sup>1/T</sup> − 1, where F is Longstaff’s bound. The outlined cell is the standard case in this paper, a ten-year buyout fund at its desmoothed volatility. A real investor uses only part of the option, so {fig:hurdle} scales these down.',
      source: 'Longstaff (1995) [4]; 22% buyout volatility from Anson (2024) [17].',
    },
  },

  apw: {
    kind: 'bar',
    props: {
      title: 'How much of an illiquid asset to hold when it pays no premium',
      subtitle: 'Optimal share of the portfolio, and the wealth an investor would give up to trade freely, by average time between chances to trade',
      desc: 'The optimal holding falls from 59.3% of the portfolio for a liquid asset to 44.2% when it trades every six months on average, 37.3% at one year, 25.1% at two, 13.2% at four and 4.8% at ten. The wealth the investor would give up to make it liquid rises from 4.5% to 22.2%.',
      categories: ['Liquid', '6 months', '1 year', '2 years', '4 years', '10 years'],
      series: [
        { name: 'Optimal share of the portfolio', values: [59.3, 44.2, 37.3, 25.1, 13.2, 4.8], color: 0 },
        { name: 'Wealth given up to trade freely', values: [null, 4.5, 6.7, 10.3, 16.5, 22.2], color: 2 },
      ],
      xLabel: 'Average time between chances to trade',
      yLabel: '% of wealth',
      yMin: 0,
      yMax: 60,
      format: pct1,
      note: 'Baseline model: both risky assets have a 12% expected return and 15% volatility and are uncorrelated, the risk-free rate is 4% and risk aversion is 6. The illiquid asset earns no premium over the liquid one.',
      source: 'Ang, Papanikolaou and Westerfield (2014), Table 3 [99].',
    },
  },

  marking: {
    kind: 'series',
    props: {
      title: 'Same portfolio, two sets of books',
      subtitle: 'U.S. stock market levered 1.3 times, valued at market and as an average of the last four quarter-ends. End of 1999 = 100, log scale',
      desc: `Two lines that start and end close together. The market-valued line falls ${Math.abs(ep07.levered)}% in 2007–09, ${Math.abs(ep20.levered)}% in early 2020 and ${Math.abs(ep22.levered)}% in 2022. The appraised line falls ${Math.abs(ep07.appraised)}%, ${Math.abs(ep20.appraised)}% and ${Math.abs(ep22.appraised)}%, later and more slowly.`,
      labels: markLabels,
      xTicks: yearTicks,
      series: [
        { name: 'Valued at market', short: 'Market', values: mk.series.levered, color: 0 },
        { name: 'Appraised (4-quarter average)', short: 'Appraised', values: mk.series.appraised, color: 2 },
      ],
      yLabel: 'Value, end of 1999 = 100',
      log: true,
      yTicks: [50, 100, 200, 400, 800, 1600],
      yMin: 40,
      yMax: 1600,
      format: { decimals: 0 },
      bands: [
        { from: '2007Q3', to: '2009Q1', label: '2007–09' },
        { from: '2019Q4', to: '2020Q1', label: '2020' },
        { from: '2021Q4', to: '2022Q3', label: '2022' },
      ],
      height: 360,
      note: `My arithmetic. The portfolio earns 1.3 times the market’s return over Treasury bills, plus the bill return, each month, ${mk.from} to ${mk.to}. The appraised value at each quarter-end is the geometric average of the last four quarter-end market values. The data table shows every fourth quarter.`,
      source: 'Ken French data library, CRSP value-weighted U.S. market and one-month Treasury bills [93]; method from Getmansky, Lo and Makarov [16].',
    },
  },

  markstats: {
    kind: 'table',
    props: {
      title: 'What the allocator sees',
      subtitle: `Quarterly statistics for the same levered stock portfolio under the two valuations, ${mk.from} to ${mk.to}`,
      columns: [{ label: 'Statistic' }, { label: 'Valued at market', align: 'right' }, { label: 'Appraised (4-quarter average)', align: 'right' }],
      minWidth: 420,
      rows: [
        ['Annual volatility', p1(mk.levered.vol), p1(mk.appraised.vol)],
        ['Beta to the U.S. stock market', f2(mk.levered.beta), f2(mk.appraised.beta)],
        ['Correlation with the stock market', f2(mk.levered.corr), f2(mk.appraised.corr)],
        ['Sharpe ratio', f2(mk.levered.sharpe), f2(mk.appraised.sharpe)],
        ['Worst quarter', p1(mk.levered.worstQuarter), p1(mk.appraised.worstQuarter)],
        ['Largest drawdown', p1(mk.levered.maxDrawdown), p1(mk.appraised.maxDrawdown)],
        ['Serial correlation of quarterly returns', f2(mk.levered.autocorr), f2(mk.appraised.autocorr)],
        ['Annualized return', p1(mk.levered.annualReturn), p1(mk.appraised.annualReturn)],
      ],
      note: `My arithmetic on ${mk.quarters} quarterly returns. Volatility is the standard deviation of quarterly returns times two. Beta and correlation are against the unlevered market in the same quarter. The Sharpe ratio uses the return over Treasury bills. Drawdowns are measured on quarter-end values.`,
      source: 'Ken French data library [93].',
    },
  },

  window: {
    kind: 'line',
    props: {
      title: 'More averaging, less measured risk',
      subtitle: 'The same levered stock portfolio, by the number of quarter-ends averaged into each valuation',
      desc: `With no averaging the portfolio has a beta of ${f2(win1.beta)} and a Sharpe ratio of ${f2(win1.sharpe)}. With four quarters, ${f2(win4.beta)} and ${f2(win4.sharpe)}. With eight quarters, ${f2(win8.beta)} and ${f2(win8.sharpe)}. Measured volatility falls from ${f2(win1.vol / mk.market.vol)} times the market’s to ${f2(win8.vol / mk.market.vol)} times.`,
      x: mk.byWindow.map((w) => w.k),
      xLabel: 'Quarter-ends averaged into each valuation',
      yLabel: 'Measured statistic',
      yMin: 0,
      yMax: 1.4,
      format: { decimals: 2 },
      series: [
        { name: 'Sharpe ratio', short: 'Sharpe', values: mk.byWindow.map((w) => w.sharpe), color: 3 },
        { name: 'Volatility, multiple of the market’s', short: 'Vol ÷ market', values: mk.byWindow.map((w) => Math.round((w.vol / mk.market.vol) * 100) / 100), color: 1 },
        { name: 'Beta to the market', short: 'Beta', values: mk.byWindow.map((w) => w.beta), color: 0 },
      ],
      note: `My arithmetic, ${mk.from} to ${mk.to}. One quarter means valued at market. The unlevered market’s volatility over the period was ${mk.market.vol}% a year.`,
      source: 'Ken French data library [93].',
    },
  },

  betaadj: {
    kind: 'bar',
    props: {
      title: 'The buyout premium, before and after matching leverage',
      subtitle: 'Cambridge Associates U.S. private equity index less a public portfolio with the same market beta, points a year, periods ending December 31, 2025',
      desc: `Against the S&P 500 the index led by 0.1 points over ten years, 0.7 over 15, 1.9 over 20 and 2.4 over 25. Against the S&P 500 levered to a beta of 1.3 it trailed by ${Math.abs(alpha(10, 1.3))}, ${Math.abs(alpha(15, 1.3))}, ${Math.abs(alpha(20, 1.3))} and ${Math.abs(alpha(25, 1.3))}. At a beta of 1.79 it trailed by ${Math.abs(alpha(10, 1.79))}, ${Math.abs(alpha(15, 1.79))}, ${Math.abs(alpha(20, 1.79))} and ${Math.abs(alpha(25, 1.79))}.`,
      categories: horizons.map((y) => `${y} years`),
      series: [
        { name: 'vs. S&P 500, as published (beta 1.0)', values: horizons.map((y) => alpha(y, 1)), color: 0 },
        { name: 'vs. beta 1.3 (cash-flow estimate)', values: horizons.map((y) => alpha(y, 1.3)), color: 1 },
        { name: 'vs. beta 1.79 (secondary-price estimate)', values: horizons.map((y) => alpha(y, 1.79)), color: 2 },
      ],
      yLabel: 'Premium, points a year',
      yMin: -12,
      yMax: 4,
      format: { decimals: 1 },
      note: 'My arithmetic: premium = (PE − S&P 500 mPME) − (β − 1) × (S&P 500 mPME − Treasury bill return). An approximation, since it applies a one-period formula to annualized dollar-weighted returns.',
      source: 'Cambridge Associates [24]; betas from Franzoni, Nowak and Phalippou [91] and Boyer et al. [92]; Treasury bill returns from the Ken French data library [93].',
    },
  },

  forward: {
    kind: 'rows',
    props: {
      title: 'What you are expected to be paid',
      subtitle: 'Expected real return over the next five to ten years, % a year, with the real yield on a ten-year Treasury for scale',
      desc: 'AQR expects 4.2% a year after inflation and fees from U.S. buyouts, 3.9% from U.S. large-cap stocks, 3.1% from unlevered private real estate and 2.6% from private credit. The ten-year Treasury inflation-protected bond yielded 1.9% real at the end of 2025 and 2.7% on November 9, 2026.',
      rows: [
        { label: 'U.S. buyouts, after fees', value: 4.2, group: 0 },
        { label: 'U.S. large-cap stocks', value: 3.9, group: 1 },
        { label: 'U.S. private real estate, unlevered', short: 'Private real estate', value: 3.1, group: 0 },
        { label: '10-year TIPS, November 9, 2026', short: '10-yr TIPS, Nov 2026', value: data.realYields.latest['10y'], group: 2 },
        { label: 'U.S. private credit', value: 2.6, group: 0 },
        { label: '10-year TIPS, December 31, 2025', short: '10-yr TIPS, Dec 2025', value: data.realYields.end2025['10y'], group: 2 },
      ],
      groups: ['Private assets (AQR estimate)', 'Public stocks (AQR estimate)', 'Treasury real yield (market)'],
      xLabel: 'Expected real return, % a year',
      xMin: 0,
      xMax: 5,
      format: pct1,
      note: `AQR’s estimates are as of December 31, 2025 (buyouts and real estate, September 30, 2025). Treasury yields are par real yields: ${data.realYields.end2025['10y']}% on December 31, 2025 and ${data.realYields.latest['10y']}% on November 9, 2026. The yields are not forecasts; they are what the bond pays if held to maturity.`,
      source: 'AQR, 2026 Capital Market Assumptions [26]; U.S. Treasury [98].',
    },
  },

  implied: {
    kind: 'heat',
    props: {
      title: 'What a discount is worth to the buyer',
      subtitle: 'Extra annual return from buying a fund stake below NAV, by price paid and years until the fund pays out',
      desc: 'At 54% of NAV, the 2009 buyout price, the discount is worth 36.1% a year over two years and 16.7% over four. At 91%, the buyout price in the first half of 2026, it is worth 4.8% over two years, 2.4% over four and 1.6% over six.',
      rows: ['54% (buyout, 2009)', '70% (real estate, 2025)', '78% (venture, 2025)', '87% (all strategies, H1 2026)', '91% (buyout, H1 2026)', '94% (buyout, 2024)'],
      rowsShort: ['54%', '70%', '78%', '87%', '91%', '94%'],
      cols: secYears.map(String),
      values: secPrices.map((p) => secYears.map((T) => r1(((100 / p) ** (1 / T) - 1) * 100))),
      rowLabel: 'Price, % of NAV',
      colLabel: 'Years until the fund pays out',
      format: pct1,
      marks: [
        [0, 2],
        [4, 2],
      ],
      note: 'My arithmetic: (1 ÷ price)<sup>1/T</sup> − 1. It assumes the NAV is right and is received T years later, so it overstates the gain when marks are stale. Outlined: buyout stakes over four years, in 2009 and in the first half of 2026.',
      source: 'Prices from Jefferies [53–55] and Nadauld et al. [59].',
    },
  },

  prices: {
    kind: 'rows',
    props: {
      title: 'One kind of asset, many prices',
      subtitle: 'What $100 of reported NAV in a private fund sold for in 2025–26, by how it was sold',
      desc: 'Non-traded funds and most single-asset continuation vehicles transact at 100% of NAV. Buyout stakes sold at 91% in the first half of 2026 and all strategies at 87%. Public BDCs traded near 80%, venture stakes at 78%, tender offers for non-traded BDC shares at a midpoint of 78.5%, HgCapital Trust at 77.4%, CT Private Equity Trust at 71.1%, real estate stakes at 70% and Partners Group Private Equity at 63.6%.',
      rows: [
        { label: 'Non-traded BDC, bought from or redeemed by the fund', short: 'Non-traded BDC, at the fund', value: 100, group: 0 },
        { label: 'Single-asset continuation vehicle, typical', short: 'Continuation vehicle', value: 100, group: 0 },
        { label: 'LP stake in a buyout fund, H1 2026', short: 'Buyout LP stake', value: 91, group: 1 },
        { label: 'LP stakes, all strategies, H1 2026', short: 'LP stakes, all', value: 87, group: 1 },
        { label: 'Public BDCs, average, February 2026', short: 'Public BDCs, average', value: 80, group: 2 },
        { label: 'Tender offers for non-traded BDC shares', short: 'Tender offers, BDC shares', value: 78.5, group: 1 },
        { label: 'LP stake in a venture fund, 2025', short: 'Venture LP stake', value: 78, group: 1 },
        { label: 'HgCapital Trust, listed, September 2026', short: 'HgCapital Trust', value: 77.4, group: 2 },
        { label: 'CT Private Equity Trust, listed, June 2026', short: 'CT Private Equity Trust', value: 71.1, group: 2 },
        { label: 'LP stake in a real estate fund, 2025', short: 'Real estate LP stake', value: 70, group: 1 },
        { label: 'Partners Group Private Equity, listed, September 2026', short: 'Partners Group PE (listed)', value: 63.6, group: 2 },
      ],
      groups: ['Sold at NAV by design', 'Negotiated sale', 'Traded on an exchange'],
      xLabel: 'Price, % of NAV',
      xMin: 50,
      xMax: 100,
      format: { suffix: '%', decimals: 1 },
      note: 'Public BDCs: Raymond James’ average discount was “more than 20%,” so 80% is an upper limit. Tender offers: midpoint of offers 13% to 30% below NAV. Listed trusts are 100% less the reported discount (22.6%, 28.9% and 36.4%). Continuation vehicles: most single-asset deals priced at NAV, and about 14% above it.',
      source: 'Barron’s [94]; Evercore [58]; Jefferies [54, 55]; Cox Capital and Ares filings [74]; interactive investor [96]; Scottish Financial News [95].',
    },
  },

  denominator: {
    kind: 'bar',
    props: {
      title: 'The denominator effect',
      subtitle: 'Share of the portfolio in private assets before and after public assets fall 25% and private marks fall 5%',
      desc: `A portfolio that starts with 10% in private assets ends at ${drift(10)}%. One that starts at 20% ends at ${drift(20)}%, 30% at ${drift(30)}%, 40% at ${drift(40)}% and 50% at ${drift(50)}%.`,
      categories: starts.map((w) => `${w}%`),
      series: [
        { name: 'Before the shock', values: starts, color: 1 },
        { name: 'After the shock', values: starts.map(drift), color: 0 },
      ],
      xLabel: 'Private share before the shock',
      yLabel: 'Private share of the portfolio, %',
      yMin: 0,
      yMax: 60,
      format: pct1,
      height: 300,
      note: 'My arithmetic: w × 0.95 ÷ (w × 0.95 + (1 − w) × 0.75). No capital calls, distributions or spending, all of which push the share higher in a real drawdown.',
      source: 'My illustration; the shock is the one described in the text.',
    },
  },

  fees: {
    kind: 'bar',
    props: {
      title: 'What fees take',
      subtitle: 'Gross and net annual return in my stylized buyout fund, by gross return',
      desc: 'A fund earning 12% before fees returns 8.0% to the investor, a gap of 4.0 points. At 15% gross the investor gets 10.6%, a gap of 4.4. At 18% gross, 13.2%, a gap of 4.8.',
      categories: ['12% gross', '15% gross', '18% gross'],
      series: [
        { name: 'Net to the investor', values: [8.0, 10.6, 13.2], color: 0 },
        { name: 'Taken by fees and carry', values: [4.0, 4.4, 4.8], color: 2 },
      ],
      yLabel: 'Annual return, %',
      yMin: 0,
      yMax: 15,
      format: pct1,
      height: 300,
      note: 'My model, on the J-curve cash flows in {fig:jcurve}: a 2% fee on commitments for five years, 1.5% of NAV after that, and 20% carry over an 8% preferred return with full catch-up. AQR’s independent estimate of all-in fees is 3.5 points a year [26].',
      source: 'My calculation; fee terms as described. AQR [26].',
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
        ['Buyouts', 'Cambridge U.S. PE index vs. S&amp;P 500 mPME [24]', '+2.4 pts/yr over 25 years; +0.1 over 10', 'Negative once leverage is counted [91, 92]'],
        ['Venture', 'Top vs. bottom quartile IRR [30]; outcome skew [28, 29]', 'About 20 pts quartile spread', 'Access matters more than the asset class'],
        ['Direct lending', 'Cliffwater index vs. leveraged loans, 2025 [32, 34]; buyout loan spread vs. syndicated [35]', '3.4 pts total in 2025; about 1.5 pts like-for-like', 'Real in the contract; used up by fees and smoothing in AQR’s estimate [26]'],
        ['Core real estate', 'NPI vs. REITs, 2021–2025 ({fig:reits})', 'Five-year totals of about +21% vs. +27% (my arithmetic)', 'No visible premium, only a delay'],
        ['Infrastructure', 'Closed-end fund cash flows and returns [49]', 'Weak risk-adjusted performance', 'Unproven'],
        ['Secondaries', 'LP stake prices, 2025 [54]', 'Buyout 92%, venture 78%, real estate 70% of NAV', 'About 2%/yr for buyout, 5%/yr for venture (implied, Section 5). This is the side that gets paid'],
      ],
      source: 'As cited in each row; see Sections 2 through 5.',
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
