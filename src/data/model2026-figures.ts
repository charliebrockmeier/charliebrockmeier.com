// Charts and tables for "The Brockmeier Model". Every value comes from
// model2026-data.json, which scripts/model/build.mjs writes from public data; nothing
// here is typed in by hand except labels. Citations [n] point at the sources in
// model2026.ts.
import D from './model2026-data.json';
import { ASSET, CAT, STOCKS } from '../components/charts/model/palette';

export type ModelFigure = {
  kind: 'bar' | 'lines' | 'heat' | 'stack' | 'stackbars' | 'table' | 'noted';
  props: Record<string, unknown> & { title: string };
};

const f1 = (v: number) => v.toFixed(1).replace('-', '−');
const f2 = (v: number) => v.toFixed(2).replace('-', '−');
const pc = (v: number, d = 1) => `${v.toFixed(d)}%`.replace('-', '−');
const sg = (v: number, d = 2) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`;
const neg = (v: number, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
// Nasdaq prints its quote date with a short month ("Nov 9, 2026"); spell it out.
const spell = (d: string) => d.replace(/^[A-Z][a-z]{2}\b/, (m) => ({ Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' })[m] ?? m);
const longDate = (iso: string) => `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;
const yearOf = (m: string) => Number(m.slice(0, 4)) + (Number(m.slice(5, 7)) - 0.5) / 12;
const E = D.expected;
const mu = E.mu;
const G = D.meta.gammaLabels as Record<string, string>;
const INC = D.meta.incomeLabels as Record<string, string>;
const ages = D.lifecycle.ages;
const at = <T,>(arr: T[], age: number) => arr[ages.indexOf(age)];
const W = D.lifecycle.weights as Record<string, Record<string, number[][]>>;
const stock = (inc: string, g: number, age: number) => at(W[inc][String(g)], age)[1];
/** First age at which the stock share is below 99.5%. */
const leaves100 = (inc: string, g: number) => ages.find((a) => stock(inc, g, a) < 99.5) ?? 65;
const kUSD = (v: number) => `$${Math.round(v / 1000).toLocaleString('en-US')}k`;
const cross = ages.find((a, i) => D.lifecycle.wealth.stable['4'][i] > D.lifecycle.humanCapital.stable[i])!;

// ---- series built from the data file
const real = D.curves.real as [number, number][];
const nominal = (D.curves.nominal as [number, number][]).filter(([m]) => m >= 1);
const realThen = D.curves.realThen.curve as [number, number][];

const cape = new Map((E.capeHistory as [string, number][]).map(([m, v]) => [m, v]));
const yields = (D.retirement.hist as [string, number, number][]).filter(([m]) => cape.has(m));
const capeYield: [number, number][] = yields.map(([m]) => [yearOf(m), 100 / cape.get(m)!]);
const tipsYield: [number, number][] = yields.map(([m, , y]) => [yearOf(m), y]);

const corr: [number, number][] = (D.risk.stockBond as [string, number][]).map(([m, c]) => [yearOf(m), c]);
const ladder: [number, number][] = (D.retirement.hist as [string, number, number][]).map(([m, w]) => [yearOf(m), w]);
const ladderMin = (D.retirement.hist as [string, number, number][]).reduce((a, b) => (b[1] < a[1] ? b : a));
const ladderNow = D.retirement.byYears['30'].start;
const yearTicks = (from: number, to: number, step: number) => {
  const out = [];
  for (let y = from; y <= to; y += step) out.push({ v: y, label: String(y) });
  return out;
};

const ruin = D.mc.ruin;
const grp = (inc: string, g: number) => D.mc.groups.find((x) => x.income === inc && x.gamma === g)!;
const row = (inc: string, g: number, id: string) => grp(inc, g).rows.find((r) => r.id === id)!;

const me = D.me;
const plan = me.plan;
const other = (c: Record<string, number>) => c.reit + c.bonds + c.gold + c.private;
const meParts = [
  { name: 'U.S. stock index funds', color: STOCKS[0] },
  { name: 'International stocks', color: CAT[1] },
  { name: 'Single stocks, sector and leveraged funds', color: CAT[2] },
  { name: 'Other', color: CAT[3] },
  { name: 'Employer stock, unvested', color: CAT[4] },
  { name: 'Cash', color: ASSET.cash },
];
const meRow = (c: Record<string, number>) => [c.us, c.intl + c.em, c.single, other(c), c.employer ?? 0, c.cash];
const last = plan.base[plan.base.length - 1];

export const figures: Record<string, ModelFigure> = {
  // ------------------------------------------------------------------ prices
  curve: {
    kind: 'lines',
    props: {
      title: 'The safe asset pays again',
      subtitle: `Treasury par yields by maturity on ${longDate(D.meta.realCurveDate)}, with the real curve at the end of 2021 for comparison`,
      desc: `Real yields on TIPS run from ${real[0][1]}% at five years to ${real[4][1]}% at thirty. At the end of 2021 the same curve ran from ${realThen[0][1]}% to ${realThen[4][1]}%. Nominal yields are about 2.2 points above real yields at every maturity.`,
      series: [
        { name: 'Nominal Treasuries', short: 'Nominal', pts: nominal, color: 2 },
        { name: 'TIPS (real yield)', short: 'TIPS', pts: real, color: 1 },
        { name: 'TIPS, end of 2021', short: '2021', pts: realThen, color: '#8f8aa3', light: true },
      ],
      xTicks: [1, 5, 10, 20, 30].map((v) => ({ v, label: String(v) })),
      xLabel: 'Maturity, years',
      yLabel: 'Yield, %',
      yMin: -2,
      yMax: 6,
      format: { suffix: '%', decimals: 2 },
      refs: [{ v: 0 }],
      table: {
        head: ['Maturity', 'Nominal', 'TIPS (real)', 'Breakeven inflation', 'TIPS, end of 2021'],
        rows: real.map(([m, y], i) => [`${m} years`, pc(nominal.find((p) => p[0] === m)![1], 2), pc(y, 2), pc(D.curves.breakeven[i][1], 2), pc(realThen[i][1], 2)]),
      },
      note: 'Breakeven inflation is the nominal yield minus the real yield at the same maturity (my arithmetic).',
      source: 'U.S. Treasury, daily par real yield curve and par yield curve rates [1, 2].',
    },
  },

  implied: {
    kind: 'bar',
    props: {
      title: 'What prices imply now, against the averages most advice is built on',
      subtitle: 'Expected real return a year by asset class: implied by November 2026 prices, and the average of realized real returns',
      desc: `Stocks: ${mu.eq}% implied against ${D.history.annual.stocks.arith}% average. Listed real estate: ${mu.reit}% against ${D.history.series.reit.arith}%. Corporate bonds: ${mu.ig}% against ${D.history.annual.baa.arith}%. Treasury bonds: ${mu.tips}% against ${D.history.annual.bonds.arith}%. Cash: ${mu.cash}% against ${D.history.annual.bills.arith}%. Gold: ${mu.gold}% against ${D.history.annual.gold.arith}%.`,
      categories: ['Stocks', 'REITs', 'Corporates', 'Treasuries', 'Cash', 'Gold'],
      series: [
        { name: 'Implied by November 2026 prices', values: [mu.eq, mu.reit, mu.ig, mu.tips, mu.cash, mu.gold], color: 0 },
        { name: 'Average since 1928 (real estate since 1972)', values: [D.history.annual.stocks.arith, D.history.series.reit.arith, D.history.annual.baa.arith, D.history.annual.bonds.arith, D.history.annual.bills.arith, D.history.annual.gold.arith], color: 1 },
      ],
      yLabel: 'Real return a year, %',
      yMin: 0,
      yMax: 10,
      format: { suffix: '%', decimals: 1 },
      note: 'Implied: global stocks at market weights; listed real estate (FTSE Nareit All Equity REITs); investment-grade corporate bonds; Treasury bonds at the 10-year TIPS yield; a 4-week bill less breakeven inflation; gold at zero. Averages are arithmetic means of annual real returns, 1928–2025: S&P 500, Baa corporates, 10-year Treasuries, 3-month bills, gold; real estate is my calculation from monthly FTSE Nareit returns, 1972–2026. All derived values are my arithmetic from the cited data.',
      source: '{tab:inputs} for the implied values; Damodaran [12] and Nareit [13] for the averages.',
    },
  },

  ecy: {
    kind: 'lines',
    props: {
      title: 'Stocks used to out-yield TIPS by three to six points. Now they do not.',
      subtitle: 'S&P 500 earnings yield on ten-year average real earnings (1 ÷ CAPE) and the 10-year TIPS yield, monthly',
      desc: `In 2012 the earnings yield was near 5% and the TIPS yield below zero. On ${longDate(E.cross.capeDate)} the earnings yield was ${E.cross.capeYield}% and the 10-year TIPS yield ${mu.tips}%, a gap of ${E.cross.excessCapeYield} points.`,
      series: [
        { name: 'S&P 500 earnings yield, 1 ÷ CAPE', short: '1 ÷ CAPE', pts: capeYield, color: 0 },
        { name: '10-year TIPS yield', short: 'TIPS', pts: tipsYield, color: 1 },
      ],
      xTicks: yearTicks(2005, 2025, 5),
      xTicksN: yearTicks(2005, 2025, 10),
      yLabel: 'Real yield, %',
      yMin: -2,
      yMax: 8,
      format: { suffix: '%', decimals: 2 },
      refs: [{ v: 0 }],
      table: {
        head: ['Month', '1 ÷ CAPE', '10-year TIPS yield', 'Gap, points'],
        rows: yields.filter(([m]) => m.endsWith('-12') || m === yields[yields.length - 1][0]).map(([m, , y]) => [m, pc(100 / cape.get(m)!, 2), pc(y, 2), sg(100 / cape.get(m)! - y)]),
      },
      note: 'The gap is what Shiller calls the excess CAPE yield. CAPE is the first-of-month value; the TIPS yield is the last trading day of the month. The gap is my arithmetic.',
      source: 'Shiller CAPE as published by multpl.com [10], following Shiller [9]; U.S. Treasury real yield curve [1].',
    },
  },

  // ------------------------------------------------------------------ risk
  corr: {
    kind: 'lines',
    props: {
      title: 'The hedge that left: stocks and long Treasuries now fall together',
      subtitle: 'Rolling 36-month correlation of monthly returns, U.S. stocks and a 20-year Treasury bond',
      desc: `The correlation averaged about −0.3 from 2000 to 2020, turned positive in August 2022 and stood at ${corr[corr.length - 1][1]} in September 2026.`,
      series: [{ name: 'Correlation, U.S. stocks and 20-year Treasuries', short: 'Now', pts: corr, color: 0 }],
      xTicks: yearTicks(2000, 2025, 5),
      xTicksN: yearTicks(2000, 2020, 10),
      yLabel: 'Correlation',
      yMin: -1,
      yMax: 1,
      format: { decimals: 2 },
      refs: [{ v: 0 }],
      vrefs: [{ v: 2022, label: '2022' }],
      table: {
        head: ['36 months ending', 'Correlation'],
        rows: (D.risk.stockBond as [string, number][]).filter(([m]) => m.endsWith('-12') || m === '2026-09').map(([m, c]) => [m, f2(c)]),
      },
      note: 'Nominal monthly returns. The bond is a 20-year par bond repriced each month from the Treasury curve (my construction).',
      source: 'Ken French data library (CRSP) [18]; U.S. Treasury par yield curve [2].',
    },
  },

  // ------------------------------------------------------------------ one investor
  sens: {
    kind: 'lines',
    props: {
      title: 'The stock share is the premium divided by risk aversion times variance',
      subtitle: `Merton share of a stand-alone investor as the expected real return on stocks changes; TIPS at ${mu.tips}%, stock volatility ${D.merton.vol}%`,
      desc: `At the model's ${mu.eq}% expected return a balanced investor (γ = 4) holds ${f1(D.merton.rows[2].today)}% in stocks. At the CAPE yield of ${E.cross.capeYield}% the share is zero. At Damodaran's implied ${E.cross.damodaranReal}% it is ${f1(((E.cross.damodaranReal - mu.tips) / (4 * D.merton.vol ** 2)) * 100)}%. At the historical ${D.history.annual.stocks.arith}% it is ${f1(((D.history.annual.stocks.arith - mu.tips) / (4 * D.merton.vol ** 2)) * 100)}%.`,
      series: [2, 4, 8].map((g, i) => ({ name: `γ = ${g}, ${G[g].toLowerCase()}`, short: `γ ${g}`, pts: D.merton.muGrid.map((m, j) => [m, (D.merton.sens as Record<string, number[]>)[g][j]] as [number, number]), color: i })),
      marks: [
        { x: E.cross.capeYield, y: 0, label: `1 ÷ CAPE, ${E.cross.capeYield}%`, short: '1 ÷ CAPE', pos: 'below', color: '#4f4868', hollow: true },
        { x: mu.eq, y: D.merton.rows[2].today, label: `Model, ${mu.eq}%`, short: 'Model', bare: true, color: 1 },
        { x: E.cross.damodaranReal, y: Math.min(100, ((E.cross.damodaranReal - mu.tips) / (4 * D.merton.vol ** 2)) * 1e4), label: `Damodaran, ${E.cross.damodaranReal}%`, short: 'Damodaran', pos: 'br', color: '#4f4868', hollow: true },
        { x: D.history.annual.stocks.arith, y: Math.min(100, ((D.history.annual.stocks.arith - mu.tips) / (4 * D.merton.vol ** 2)) * 1e4), label: `1928–2025 average, ${D.history.annual.stocks.arith}%`, short: 'History', pos: 'al', color: '#4f4868', hollow: true },
      ],
      vrefs: [{ v: mu.eq, label: `Model, ${mu.eq}%` }],
      xTicks: [3, 4, 5, 6, 7, 8, 9].map((v) => ({ v, label: `${v}%` })),
      xLabel: 'Expected real return on stocks',
      yLabel: 'Share in stocks, %',
      yMin: -15,
      yMax: 100,
      refs: [{ v: 0 }],
      format: { suffix: '%', decimals: 0 },
      note: 'Shares are capped at 100% (no borrowing). The points sit on the γ = 4 line; the vertical line marks the stock return this paper uses. My arithmetic.',
      source: 'Merton (1969) [22]; inputs from {tab:inputs} and {tab:risk}.',
    },
  },

  frontier: {
    kind: 'lines',
    props: {
      title: 'Same risks, a quarter of the reward',
      subtitle: 'Efficient frontier of the eight risky asset classes, long-only, with November 2026 implied returns and with historical-average returns; risk is the 2022–2026 covariance in both',
      desc: `With today's inputs the best mix of risky assets earns ${D.frontier.today.tangency.mu}% for ${D.frontier.today.tangency.vol}% volatility, a slope of ${D.frontier.today.tangency.sharpe} over TIPS at ${mu.tips}%. With historical averages it earns ${D.frontier.hist.tangency.mu}% for ${D.frontier.hist.tangency.vol}%, a slope of ${D.frontier.hist.tangency.sharpe} over bills at ${D.history.safe}%.`,
      series: [
        { name: 'Frontier, historical-average returns', short: 'History', pts: D.frontier.hist.pts as [number, number][], color: 1 },
        { name: 'Frontier, November 2026 returns', short: 'Today', pts: D.frontier.today.pts as [number, number][], color: 0 },
      ],
      marks: [
        { x: 0, y: mu.tips, label: `TIPS ${mu.tips}%`, pos: 'above', color: 0 },
        { x: 0, y: D.history.safe, label: `Bills ${D.history.safe}%`, pos: 'above', color: 1 },
        { x: D.frontier.assets[1].vol, y: mu.reit, label: 'Real estate', short: 'REITs', pos: 'right', posN: 'below', color: '#4f4868', hollow: true },
        { x: D.frontier.assets[2].vol, y: mu.hy, label: 'High yield', short: 'HY', pos: 'br', color: '#4f4868', hollow: true },
        { x: D.frontier.assets[6].vol, y: mu.gold, label: 'Gold', pos: 'above', color: '#4f4868', hollow: true },
      ],
      xTicks: [0, 5, 10, 15, 20].map((v) => ({ v, label: `${v}%` })),
      xMin: -1,
      xMax: 20,
      xLabel: 'Volatility a year',
      yLabel: 'Expected real return, %',
      yMin: 0,
      yMax: 10,
      format: { suffix: '%', decimals: 1 },
      table: {
        head: ['Asset class', 'Volatility, 2022–2026', 'Implied return today', 'Historical average'],
        rows: D.frontier.assets.map((a) => [(D.meta.names as Record<string, string>)[a.id], pc(a.vol), pc(a.today, 2), pc(a.hist, 2)]),
      },
      note: `Each curve is the best expected return available at each level of risk from the eight risky asset classes. The filled points at zero volatility are the safe asset in each case; the slope from there to the best risky mix is ${D.frontier.hist.tangency.sharpe} with historical averages and ${D.frontier.today.tangency.sharpe} today. Hollow points are single asset classes at today’s implied returns. High yield has no long history, so its historical return uses Baa corporates. My calculation.`,
      source: '{tab:inputs} and {tab:risk}; historical averages from Damodaran [12] and Nareit [13].',
    },
  },

  // ------------------------------------------------------------------ human capital
  hc: {
    kind: 'lines',
    props: {
      title: 'For the first fifteen years, most of the retirement pot has not been earned yet',
      subtitle: `Savings so far and the present value of savings still to come, for a median full-time worker saving ${pc(D.meta.savingsRate * 100)} of pay from 25; thousands of 2025 dollars`,
      desc: `At 25 the savings still to come are worth ${kUSD(at(D.lifecycle.humanCapital.stable, 25))} and savings so far are zero. The lines cross at ${cross}. At 65 savings are ${kUSD(at(D.lifecycle.wealth.stable['4'], 65))}.`,
      series: [
        { name: 'Savings still to come, present value', short: 'To come', pts: ages.map((a, i) => [a, D.lifecycle.humanCapital.stable[i] / 1000] as [number, number]), color: 1 },
        { name: 'Savings so far, expected path (γ = 4)', short: 'So far', pts: ages.map((a, i) => [a, D.lifecycle.wealth.stable['4'][i] / 1000] as [number, number]), color: 0 },
      ],
      xTicks: [25, 35, 45, 55, 65].map((v) => ({ v, label: String(v) })),
      xLabel: 'Age',
      yLabel: '$ thousands',
      yMin: 0,
      format: { prefix: '$', suffix: 'k', decimals: 0 },
      table: {
        head: ['Age', 'Median pay', 'Savings to come, stable pay', 'Cyclical pay', 'Stock-like pay', 'Savings so far (γ = 4)', 'k: so far ÷ total'],
        rows: [25, 30, 35, 40, 45, 50, 55, 60, 65].map((a) => {
          const h = at(D.lifecycle.humanCapital.stable, a);
          const f = at(D.lifecycle.wealth.stable['4'], a);
          return [a, kUSD(at(D.lifecycle.earnings, a)), kUSD(h), kUSD(at(D.lifecycle.humanCapital.cyclical, a)), kUSD(at(D.lifecycle.humanCapital.stockLike, a)), kUSD(f), pc((f / (f + h)) * 100, 0)];
        }),
      },
      note: 'Pay is the 2025 median for full-time, year-round workers by age, held flat in real terms. Savings to come are weighted by survival and discounted on the real Treasury curve, plus β times the equity premium when pay is stock-like. Savings so far grow at the model portfolio’s expected return. My calculation.',
      source: 'Census Bureau CPS ASEC [28]; SSA life table [31]; Treasury real curve [1]; Vanguard savings rate [30].',
    },
  },

  glide: {
    kind: 'stack',
    props: {
      title: `The glide path the math produces: all stocks to ${leaves100('stable', 4) - 1}, then a fast walk to TIPS`,
      subtitle: 'Model portfolio by age for a balanced investor (γ = 4) with stable pay, percent of savings',
      desc: `Stocks are 100% of savings until age ${leaves100('stable', 4) - 1}, ${f1(stock('stable', 4, 35))}% at 35, ${f1(stock('stable', 4, 40))}% at 40, ${f1(stock('stable', 4, 50))}% at 50 and ${f1(stock('stable', 4, 65))}% at 65. The rest is TIPS.`,
      x: ages,
      layers: [
        { name: 'TIPS', values: ages.map((_, i) => W.stable['4'][i][0]), color: ASSET.tips },
        { name: 'Emerging-market stocks', short: 'Emerging', values: ages.map((_, i) => W.stable['4'][i][1] * D.meta.equityWeights.em), color: STOCKS[2] },
        { name: 'International developed stocks', short: 'International', values: ages.map((_, i) => W.stable['4'][i][1] * D.meta.equityWeights.intl), color: STOCKS[1] },
        { name: 'U.S. stocks', values: ages.map((_, i) => W.stable['4'][i][1] * D.meta.equityWeights.us), color: STOCKS[0] },
      ],
      xTicks: [25, 35, 45, 55, 65].map((v) => ({ v, label: String(v) })),
      tableAt: [25, 30, 35, 40, 45, 50, 55, 60, 65],
      xLabel: 'Age',
      yLabel: 'Share of savings',
      note: 'Stocks are held at global market weights. This is the expected path; after a fall in stocks, savings shrink relative to the savings still to come and the stock share goes up, not down. My calculation.',
      source: 'Model output; FTSE Global All Cap weights [17].',
    },
  },

  heat: {
    kind: 'heat',
    props: {
      title: 'Stock share by age, risk aversion and how stock-like the paycheck is',
      subtitle: 'Model stock share, percent of savings, along each group’s expected path; the rest is TIPS',
      desc: `With stable pay every group is 100% in stocks at 25 and between ${Math.round(stock('stable', 10, 65))}% and ${Math.round(stock('stable', 2, 65))}% at 65. With cyclical pay a cautious investor (γ = 8) holds ${Math.round(stock('cyclical', 8, 30))}% at 30 and ${Math.round(stock('cyclical', 8, 50))}% at 50. With stock-like pay a balanced investor holds ${Math.round(stock('stockLike', 4, 35))}% at 35 and ${Math.round(stock('stockLike', 4, 55))}% at 55.`,
      panels: ['stable', 'cyclical', 'stockLike'].map((inc) => ({
        name: `${INC[inc]} (β = ${(D.meta.incomeBeta as Record<string, number>)[inc]})`,
        values: D.meta.gammaGrid.map((g) => [25, 30, 35, 40, 45, 50, 55, 60, 65].map((a) => Math.round(at(W[inc][String(g)], a)[1]))),
      })),
      rows: D.meta.gammaGrid.map((g) => `γ ${g} ${G[g]}`),
      rowsN: D.meta.gammaGrid.map((g) => `γ ${g}`),
      cols: [25, 30, 35, 40, 45, 50, 55, 60, 65].map(String),
      rowTitle: 'risk aversion',
      colTitle: 'Age',
      min: 0,
      max: 100,
      format: { decimals: 0 },
      note: 'β is the share of future pay that behaves like stocks. Each row follows its own expected savings path, so cautious rows hold slightly less wealth at a given age. My calculation.',
      source: 'Model output.',
    },
  },

  tdf: {
    kind: 'lines',
    props: {
      title: 'A target-date fund is this model run on the old averages',
      subtitle: 'Stock share by age for a balanced investor (γ = 4, stable pay): the model at November 2026 prices, the same model fed 1928–2025 averages, and the largest target-date series',
      desc: `At 40 the model holds ${f1(stock('stable', 4, 40))}% in stocks at today's prices and ${f1(D.sensitivity.classicGlide['4'][15])}% with historical averages; the target-date series holds about ${D.tdf.find((p) => p.vintage === '2050')!.equity}%. At 65 the three are ${f1(stock('stable', 4, 65))}%, ${f1(D.sensitivity.classicGlide['4'][40])}% and about ${Math.round((D.tdf.find((p) => p.vintage === '2030')!.equity * 1 + D.tdf.find((p) => p.vintage === '2025')!.equity * 4) / 5)}%.`,
      series: [
        { name: 'Model, 1928–2025 averages', short: 'Averages', pts: ages.map((a, j) => [a, D.sensitivity.classicGlide['4'][j]] as [number, number]), color: 2 },
        { name: 'Target-date series, holdings', short: 'Target-date', pts: D.tdf.filter((p) => p.age >= 25).map((p) => [p.age, p.equity] as [number, number]), color: 1, dots: true },
        { name: 'Model, November 2026 prices', short: 'Model', pts: ages.map((a, j) => [a, W.stable['4'][j][1]] as [number, number]), color: 0 },
      ],
      xTicks: [25, 35, 45, 55, 65, 75].map((v) => ({ v, label: String(v) })),
      xLabel: 'Age',
      yLabel: 'Stocks, % of portfolio',
      yMin: 0,
      yMax: 100,
      format: { suffix: '%', decimals: 0 },
      table: {
        head: ['Age', 'Model, today', 'Model, averages', 'Model γ = 2, today', 'Model γ = 8, today', 'Target-date vintage', 'Target-date stocks'],
        rows: [26, 31, 36, 41, 46, 51, 56, 61, 65].map((a) => {
          const v = D.tdf.find((p) => p.age === a);
          const j = ages.indexOf(a);
          return [a, pc(W.stable['4'][j][1]), pc(D.sensitivity.classicGlide['4'][j]), pc(W.stable['2'][j][1]), pc(W.stable['8'][j][1]), v ? v.vintage : '–', v ? pc(v.equity) : '–'];
        }),
      },
      note: `Target-date points are issuer-reported fund holdings as of September 30, 2026, placed at the age of an investor retiring at 65 in the vintage year; the 2025 fund (age 66) holds ${D.tdf.find((p) => p.vintage === '2025')!.equity}% and the income fund ${D.tdf.find((p) => p.vintage === 'Income')!.equity}%. “Averages” uses the 1928–2025 premium of ${f2(D.merton.histPremium)} points over bills and ${f1(D.merton.histVol)}% volatility. The model lines stop at 65; in retirement the stock share depends on the funded ratio ({tab:retirees}).`,
      source: 'Vanguard Target Retirement fund holdings, as republished by StockAnalysis [32]; Damodaran [12]; model output.',
    },
  },

  beta: {
    kind: 'lines',
    props: {
      title: 'A stock-like paycheck uses up the stock budget',
      subtitle: 'Model stock share at age 45 as the share of future pay that behaves like stocks (β) rises, by risk aversion',
      desc: `At 45 a balanced investor holds ${f1(D.sensitivity.betaSweep.age45['4'][0])}% in stocks with β of zero, ${f1(D.sensitivity.betaSweep.age45['4'][3])}% at β of 0.15 and ${f1(D.sensitivity.betaSweep.age45['4'][8])}% at 0.4. An aggressive investor holds ${f1(D.sensitivity.betaSweep.age45['2'][0])}%, ${f1(D.sensitivity.betaSweep.age45['2'][3])}% and ${f1(D.sensitivity.betaSweep.age45['2'][8])}%.`,
      series: [2, 4, 8].map((g, i) => ({ name: `γ = ${g}, ${G[g].toLowerCase()}`, short: `γ ${g}`, pts: D.sensitivity.betaSweep.betas.map((b, j) => [b, (D.sensitivity.betaSweep.age45 as Record<string, number[]>)[g][j]] as [number, number]), color: i })),
      xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((v) => ({ v, label: v.toFixed(1) })),
      vrefs: [
        { v: D.meta.incomeBeta.cyclical, label: 'Cyclical' },
        { v: D.meta.incomeBeta.stockLike, label: 'Stock-like' },
      ],
      xLabel: 'β: share of future pay that behaves like stocks',
      yLabel: 'Stocks, % of savings',
      yMin: 0,
      yMax: 100,
      format: { suffix: '%', decimals: 0 },
      note: `Savings so far are ${pc(D.sensitivity.betaSweep.k45 * 100, 0)} of retirement wealth at 45 on the stable-pay path. At 30, where they are ${pc(D.sensitivity.betaSweep.k30 * 100, 0)}, the lines are five times steeper: a balanced investor goes from ${f1(D.sensitivity.betaSweep.age30['4'][1])}% in stocks at β of 0.05 to ${f1(D.sensitivity.betaSweep.age30['4'][5])}% at 0.25. My calculation.`,
      source: 'Model output.',
    },
  },

  // ------------------------------------------------------------------ retirement
  ladder: {
    kind: 'lines',
    props: {
      title: 'A TIPS ladder now pays more than the 4% rule, with nothing left to chance',
      subtitle: 'Real income for 30 years from a TIPS ladder bought at each month-end real curve, percent of purchase price a year',
      desc: `The ladder paid ${ladderMin[1]}% in ${ladderMin[0]}, an average of 3.61% from 2010 to 2021, and ${ladderNow}% on ${longDate(D.meta.realCurveDate)}.`,
      series: [{ name: '30-year TIPS ladder, payout a year', short: 'Ladder', pts: ladder, color: 1 }],
      xTicks: yearTicks(2005, 2025, 5),
      xTicksN: yearTicks(2005, 2025, 10),
      yLabel: 'Payout, % of cost',
      yMin: 2,
      yMax: 6,
      format: { suffix: '%', decimals: 2 },
      refs: [{ v: 4, label: 'The 4% rule' }],
      table: {
        head: ['Month', 'Ladder payout', '10-year TIPS yield'],
        rows: (D.retirement.hist as [string, number, number][]).filter(([m]) => m.endsWith('-12') || m === D.retirement.hist[D.retirement.hist.length - 1][0]).map(([m, w, y]) => [m, pc(w, 2), pc(y, 2)]),
      },
      note: 'Thirty equal real payments, the first on the purchase date. Discount factors are bootstrapped from the par real curve (5 to 30 years; flat inside five years; the 20-year point extended before 2010). My calculation.',
      source: 'U.S. Treasury par real yield curve [1].',
    },
  },

  ruin: {
    kind: 'lines',
    props: {
      title: `At today’s prices the 4% rule fails in ${Math.round(Math.min(ruin.sixtyForty[2], ruin.tdf[2], ruin.stocks[2]))}% to ${Math.round(Math.max(ruin.sixtyForty[2], ruin.tdf[2], ruin.stocks[2]))}% of retirements`,
      subtitle: 'Share of 10,000 simulated 30-year retirements in which a fixed real withdrawal runs out, by first-year withdrawal rate',
      desc: `At 4% a 60/40 portfolio runs out in ${ruin.sixtyForty[2]}% of paths, the target-date glide path in ${ruin.tdf[2]}% and an all-stock portfolio in ${ruin.stocks[2]}%. A TIPS ladder cannot run out up to ${ladderNow}%.`,
      series: [
        { name: '100% U.S. stocks', short: 'Stocks', pts: ruin.rates.map((r, i) => [r, ruin.stocks[i]] as [number, number]), color: 0, dots: true },
        { name: '60/40', pts: ruin.rates.map((r, i) => [r, ruin.sixtyForty[i]] as [number, number]), color: 2, dots: true },
        { name: 'Target-date glide path', short: 'Target-date', pts: ruin.rates.map((r, i) => [r, ruin.tdf[i]] as [number, number]), color: 3, dots: true },
      ],
      vrefs: [{ v: ladderNow, label: `TIPS ladder: ${ladderNow}%, never runs out` }],
      xTicks: ruin.rates.filter((_, i) => i % 2 === 0).map((v) => ({ v, label: `${v}%` })),
      xLabel: 'First-year withdrawal, % of savings',
      yLabel: 'Runs out within 30 years, % of paths',
      yMin: 0,
      yMax: 100,
      format: { suffix: '%', decimals: 0 },
      table: {
        head: ['Withdrawal', '60/40', 'Target-date', '100% U.S. stocks', 'TIPS ladder'],
        rows: ruin.rates.map((r, i) => [`${r}%`, pc(ruin.sixtyForty[i]), pc(ruin.tdf[i]), pc(ruin.stocks[i]), `${ruin.ladder[i]}%`]),
      },
      note: 'The withdrawal is set at 65 as a share of savings and then held constant in real terms. Monthly returns from a multivariate Student-t with five degrees of freedom, the November 2026 expected returns and the 2022–2026 covariance. 60/40 is U.S. stocks and intermediate Treasuries. The sampling error on each point is under half a point. My simulation.',
      source: 'Model output; inputs from {tab:inputs} and {tab:risk}.',
    },
  },

  // ------------------------------------------------------------------ Monte Carlo
  fan: {
    kind: 'lines',
    props: {
      title: 'Forty years of saving: the range matters more than the middle',
      subtitle: `Savings in years of final pay for a balanced saver (γ = 4, stable pay, ${pc(D.meta.savingsRate * 100)} of pay): model portfolio, 10,000 paths`,
      desc: `At 65 the model portfolio's savings are ${D.mc.fan.model[2][40]} years of final pay at the median, ${D.mc.fan.model[0][40]} at the 5th percentile and ${D.mc.fan.model[4][40]} at the 95th. The target-date glide path ends at ${D.mc.fan.tdf[2][40]}, ${D.mc.fan.tdf[0][40]} and ${D.mc.fan.tdf[4][40]}.`,
      bands: [
        { name: 'Model, 5th to 95th percentile', lo: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.model[0][i]] as [number, number]), hi: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.model[4][i]] as [number, number]), color: 0, opacity: 0.1 },
        { name: 'Model, 25th to 75th', lo: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.model[1][i]] as [number, number]), hi: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.model[3][i]] as [number, number]), color: 0, opacity: 0.18 },
      ],
      series: [
        { name: 'Model, median', short: 'Model', pts: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.model[2][i]] as [number, number]), color: 0 },
        { name: 'Target-date, median', short: 'Target-date', pts: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.tdf[2][i]] as [number, number]), color: 1 },
        { name: 'Target-date, 5th percentile', short: 'TDF 5th', pts: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.tdf[0][i]] as [number, number]), color: 1, light: true, dash: true, noLabel: true, noLegend: true },
        { name: 'Target-date, 95th percentile', short: 'TDF 95th', pts: D.mc.fan.ages.map((a, i) => [a, D.mc.fan.tdf[4][i]] as [number, number]), color: 1, light: true, dash: true, noLabel: true, noLegend: true },
      ],
      xTicks: [25, 35, 45, 55, 65].map((v) => ({ v, label: String(v) })),
      xLabel: 'Age',
      yLabel: 'Savings, years of final pay',
      yMin: 0,
      format: { suffix: '×', decimals: 1 },
      table: {
        head: ['Age', 'Model 5th', 'Model 25th', 'Model median', 'Model 75th', 'Model 95th', 'Target-date 5th', 'Target-date median', 'Target-date 95th'],
        rows: [30, 35, 40, 45, 50, 55, 60, 65].map((a) => {
          const i = D.mc.fan.ages.indexOf(a);
          return [a, ...D.mc.fan.model.map((b) => f2(b[i])), f2(D.mc.fan.tdf[0][i]), f2(D.mc.fan.tdf[2][i]), f2(D.mc.fan.tdf[4][i])];
        }),
      },
      note: 'Dashed lines are the target-date path’s 5th and 95th percentiles. Same simulation as {fig:ruin}. Final pay is the median at 64. The model’s TIPS are bought to mature when the money is needed, so they earn their real yield without price risk; the target-date fund’s bonds are marked to market each month. My simulation.',
      source: 'Model output.',
    },
  },

  ce: {
    kind: 'bar',
    props: {
      title: 'What the model is worth against the usual answers',
      subtitle: 'Gain in certainty-equivalent retirement income from following the model instead of each benchmark, percent',
      desc: `For a balanced investor with stable pay the model's certainty-equivalent income is ${row('stable', 4, 'tdf').ceGain}% above the target-date glide path, ${row('stable', 4, 'sixtyForty').ceGain}% above 60/40 and ${row('stable', 4, 'ageInBonds').ceGain}% above age-in-bonds.`,
      categories: ['Target-date', '60/40', 'Age in bonds'],
      series: [
        { name: 'Stable pay, γ = 2', values: ['tdf', 'sixtyForty', 'ageInBonds'].map((id) => row('stable', 2, id).ceGain), color: 0 },
        { name: 'Stable pay, γ = 4', values: ['tdf', 'sixtyForty', 'ageInBonds'].map((id) => row('stable', 4, id).ceGain), color: 1 },
        { name: 'Stock-like pay, γ = 2', values: ['tdf', 'sixtyForty', 'ageInBonds'].map((id) => row('stockLike', 2, id).ceGain), color: 2 },
        { name: 'Stock-like pay, γ = 4', values: ['tdf', 'sixtyForty', 'ageInBonds'].map((id) => row('stockLike', 4, id).ceGain), color: 3 },
      ],
      yLabel: 'Gain in certainty-equivalent income, %',
      yMin: 0,
      yMax: 120,
      format: { suffix: '%', decimals: 0 },
      note: 'Certainty-equivalent income is the constant real income a CRRA investor with that γ would accept in place of the simulated stream from 65 to 94, weighted by survival. Each strategy spends by amortizing what it holds over the years left; the model holds its TIPS as a ladder. My simulation.',
      source: 'Model output; SSA life table [31].',
    },
  },

  // ------------------------------------------------------------------ matrix
  matrixBars: {
    kind: 'stackbars',
    props: {
      title: 'The model portfolios for a balanced investor, by age and paycheck',
      subtitle: 'Percent of savings for γ = 4; expected real return and volatility a year at right',
      desc: `With stable pay the portfolio is ${Math.round(stock('stable', 4, 30))}% stocks at 30, ${Math.round(stock('stable', 4, 40))}% at 40, ${Math.round(stock('stable', 4, 50))}% at 50, ${Math.round(stock('stable', 4, 60))}% at 60 and ${Math.round(stock('stable', 4, 65))}% at 65. With cyclical pay it is ${Math.round(stock('cyclical', 4, 30))}% at 30 and ${Math.round(stock('cyclical', 4, 40))}% at 40. With stock-like pay it holds ${Math.round(stock('stockLike', 4, 40))}% at 40 and ${Math.round(stock('stockLike', 4, 60))}% at 60.`,
      parts: [
        { name: 'Global stocks', color: ASSET.stocks },
        { name: 'TIPS', color: ASSET.tips },
      ],
      rows: ['stable', 'cyclical', 'stockLike'].flatMap((inc) =>
        D.matrix
          .filter((m) => m.income === inc && m.gamma === 4)
          .map((m, i) => ({
            label: m.band === 'At 65' ? 'At 65' : `Age ${m.age}`,
            values: [m.weights.eq, m.weights.tips],
            note: `${f1(m.mu)}% / ${f1(m.vol)}%`,
            group: i === 0 ? `${INC[inc]} (β = ${(D.meta.incomeBeta as Record<string, number>)[inc]})` : undefined,
          })),
      ),
      noteLabel: 'Return / volatility',
      note: '{tab:matrix} has all 45 groups. Volatility counts TIPS as held to maturity.',
      source: 'Model output.',
    },
  },

  // ------------------------------------------------------------------ my own portfolio
  meBars: {
    kind: 'stackbars',
    props: {
      title: 'My portfolio against the model’s target for my group',
      subtitle: `Percent of the portfolio by exposure, at the ${longDate(me.asOf)} close; the target is measured against the liquid portfolio`,
      desc: `Today the liquid portfolio is ${f1(me.viewA.us)}% U.S. index funds, ${f1(me.viewA.intl + me.viewA.em)}% international stocks, ${f1(me.viewA.single)}% single names, sector and leveraged exposure, ${f1(other(me.viewA))}% other and ${f1(me.viewA.cash)}% net cash. The target is ${f1(me.target.us)}% U.S., ${f1(me.target.intl + me.target.em)}% international and a ${f1(me.target.cash)}% cash reserve. With unvested employer stock included, that stock is about ${me.viewB.employer}% of the total.`,
      parts: meParts,
      rows: [
        { label: 'Today', values: meRow(me.viewA), group: 'Liquid portfolio (View A)' },
        { label: 'Model target', values: meRow(me.target) },
        { label: 'Today', values: meRow(me.viewB), group: 'Including unvested employer stock (View B)' },
        { label: `Quarter ${plan.quarters} of the plan`, short: `Quarter ${plan.quarters}`, values: meRow(last.a) },
      ],
      note: `The 2x fund counts at twice its weight with the borrowing netted against cash, so today's bars show exposure, not market value. “Other” is listed real estate and bonds inside the target-date fund, silver, and a listed fund of private companies. The last bar is the plan's end state, after the employer stock is sold in about quarter ${plan.employerSaleQuarter}: it is not yet at target because the plan does not sell appreciated taxable positions.`,
      source: 'My own holdings; look-through of the target-date fund from its issuer-reported holdings [39]; global market weights [17].',
    },
  },

  mePath: {
    kind: 'stack',
    props: {
      title: 'The plan: twelve quarterly steps, with the employer-stock sale in the middle',
      subtitle: 'Portfolio including unvested employer stock (View B), percent of the total at each quarter',
      desc: `Employer stock stays near ${me.viewB.employer}% until it is sold in quarter ${plan.employerSaleQuarter}. U.S. index funds go from ${f1(plan.base[0].b.us)}% to ${f1(last.b.us)}%, international stocks from ${f1(plan.base[0].b.intl + plan.base[0].b.em)}% to ${f1(last.b.intl + last.b.em)}%, and single-name exposure from ${f1(plan.base[0].b.single)}% to ${f1(last.b.single)}%.`,
      x: plan.base.map((r) => r.q),
      layers: [
        { name: 'Cash', values: plan.base.map((r) => r.b.cash), color: ASSET.cash },
        { name: 'Other', values: plan.base.map((r) => other(r.b)), color: CAT[3] },
        { name: 'Employer stock, unvested', short: 'Employer stock', values: plan.base.map((r) => r.b.employer), color: CAT[4] },
        { name: 'Single stocks, sector and leveraged funds', short: 'Single names', values: plan.base.map((r) => r.b.single), color: CAT[2] },
        { name: 'International stocks', short: 'International', values: plan.base.map((r) => r.b.intl + r.b.em), color: CAT[1] },
        { name: 'U.S. stock index funds', short: 'U.S. index funds', values: plan.base.map((r) => r.b.us), color: STOCKS[0] },
      ],
      xTicks: plan.base.filter((r) => r.q % 2 === 0).map((r) => ({ v: r.q, label: r.q === 0 ? 'Today' : `Q${r.q}` })),
      xTicksN: plan.base.filter((r) => r.q % 4 === 0).map((r) => ({ v: r.q, label: r.q === 0 ? 'Today' : `Q${r.q}` })),
      tableAt: plan.base.map((r) => r.q),
      vrefs: [{ v: plan.employerSaleQuarter, label: 'Employer stock sold' }],
      xLabel: 'Quarter of the plan',
      yLabel: 'Share of total',
      note: 'No new contributions are included (I have not published a number); {tab:whatif} shows what they would add. Prices are held flat, so every change in the picture is a trade. My arithmetic.',
      source: 'My own holdings and the model target.',
    },
  },

  meTe: {
    kind: 'lines',
    props: {
      title: 'Distance from the target, quarter by quarter',
      subtitle: 'Tracking error against the model target, percent a year, for the liquid portfolio and with employer stock included',
      desc: `Tracking error on the liquid portfolio falls from ${plan.base[0].te}% to ${plan.base[4].te}% after four quarters and ${last.te}% at the end. With employer stock included it stays near ${plan.base[0].teB}% until the sale, then falls to ${last.teB}%.`,
      series: [
        { name: 'Including unvested employer stock (View B)', short: 'View B', pts: plan.base.map((r) => [r.q, r.teB] as [number, number]), color: 4, dots: true },
        { name: 'Liquid portfolio (View A)', short: 'View A', pts: plan.base.map((r) => [r.q, r.te] as [number, number]), color: 0, dots: true },
      ],
      xTicks: plan.base.filter((r) => r.q % 2 === 0).map((r) => ({ v: r.q, label: r.q === 0 ? 'Today' : `Q${r.q}` })),
      xTicksN: plan.base.filter((r) => r.q % 4 === 0).map((r) => ({ v: r.q, label: r.q === 0 ? 'Today' : `Q${r.q}` })),
      vrefs: [{ v: plan.employerSaleQuarter, label: 'Sale' }],
      xLabel: 'Quarter of the plan',
      yLabel: 'Tracking error, % a year',
      yMin: 0,
      format: { suffix: '%', decimals: 1 },
      table: {
        head: ['Quarter', 'Off target, View A', 'Tracking error, View A', 'Tracking error, View B', 'What happens'],
        rows: plan.base.map((r) => [r.q === 0 ? 'Today' : `Q${r.q}`, pc(r.offTarget), pc(r.te, 2), pc(r.teB, 2), r.note || '–']),
      },
      note: `Tracking error is the volatility of the difference between the portfolio and the target: class weights through the 2022–2026 covariance, plus the firm-specific risk of single names (from public prices [40]) and of a typical single stock for the employer shares (${me.single.idio}% a year [36]). “Off target” is half the sum of absolute weight differences. My calculation.`,
      source: 'Model output.',
    },
  },

  // ================================================================== tables
  inputs: {
    kind: 'table',
    props: {
      title: 'Expected real returns implied by prices on November 9, 2026',
      subtitle: 'Each row is a yield or a valuation read off a public source, turned into a real return by the rule in the text',
      columns: [{ label: 'Asset class' }, { label: 'What the price says' }, { label: 'Expected real return', align: 'right' }, { label: 'Over 10-year TIPS', align: 'right' }, { label: 'Realized average', align: 'right' }],
      rows: [
        ['TIPS, 10-year', `Real yield ${f2(mu.tips)}% [1]`, pc(mu.tips, 2), '0.00', 'none before 1997'],
        ['Global stocks', `U.S. ${pc(D.meta.equityWeights.us * 100)}, international ${pc(D.meta.equityWeights.intl * 100)}, emerging ${pc(D.meta.equityWeights.em * 100)} [17]`, pc(mu.eq, 2), sg(E.premium.eq), `${f2(D.history.annual.stocks.arith)}% (U.S., 1928–2025)`],
        ['— U.S. stocks', `P/E ${E.regions.us.pe} trailing, ${E.regions.us.peFy1} forward; dividend yield ${E.regions.us.dy}% [4]`, pc(mu.us, 2), sg(E.premium.us), `${f2(D.history.series.us.arith)}% (1926–2026)`],
        ['— International developed', `P/E ${E.regions.intl.pe}, ${E.regions.intl.peFy1}; yield ${E.regions.intl.dy}% [5]`, pc(mu.intl, 2), sg(E.premium.intl), `${f2(D.history.series.intl.arith)}% (1990–2026)`],
        ['— Emerging markets', `P/E ${E.regions.em.pe}, ${E.regions.em.peFy1}; yield ${E.regions.em.dy}% [6]`, pc(mu.em, 2), sg(E.premium.em), `${f2(D.history.series.em.arith)}% (1989–2026)`],
        ['Listed real estate', `Dividend yield ${E.reit.dy}%; real growth of the price index ${sg(E.reit.g)}% a year since 1971 [13]`, pc(mu.reit, 2), sg(E.premium.reit), `${f2(D.history.series.reit.arith)}% (1972–2026)`],
        ['High-yield credit', `Yield ${E.hy.ytw}%, spread ${Math.round(E.hy.oas)} bp, duration ${E.hy.oad} [8]; expected loss ${f2(E.hy.loss)}% [15]`, pc(mu.hy, 2), sg(E.premium.hy), 'no long history'],
        ['Investment-grade credit', `Yield ${E.ig.ytw}%, spread ${Math.round(E.ig.oas)} bp, duration ${E.ig.oad} [7]; expected loss ${f2(E.ig.loss)}% [14]`, pc(mu.ig, 2), sg(E.premium.ig), `${f2(D.history.annual.baa.arith)}% (Baa, 1928–2025)`],
        ['Long Treasuries', `20-year yield ${f2(D.curves.nominal.find((p) => p[0] === 20)![1])}% less breakeven ${f2(D.curves.breakeven[3][1])}% [1, 2]`, pc(mu.tsyLong, 2), sg(E.premium.tsyLong), `${f2(D.history.annual.bonds.arith)}% (10-year, 1928–2025)`],
        ['Intermediate Treasuries', `5-year yield ${f2(D.curves.nominal.find((p) => p[0] === 5)![1])}% less breakeven ${f2(D.curves.breakeven[0][1])}% [1, 2]`, pc(mu.tsyInt, 2), sg(E.premium.tsyInt), `${f2(D.history.annual.bonds.arith)}% (10-year, 1928–2025)`],
        ['Cash', `4-week bill ${f2(D.curves.bill)}% less 5-year breakeven ${f2(D.curves.breakeven[0][1])}% [1–3]`, pc(mu.cash, 2), sg(E.premium.cash), `${f2(D.history.annual.bills.arith)}% (bills, 1928–2025)`],
        ['Gold', 'No yield; the real price reverts toward its mean [16]', pc(mu.gold, 2), sg(E.premium.gold), `${f2(D.history.annual.gold.arith)}% (1928–2025)`],
      ],
      minWidth: 620,
      note: `Index statistics are as of ${longDate(E.regions.us.asOf)}; the Treasury curves as of ${longDate(D.meta.realCurveDate)}; the REIT yield is October 2026. Stocks: half the average of trailing and forward earnings yield, half dividend yield plus ${E.g}% real growth. Credit: Treasury real yield at the index's duration, plus spread, less expected loss. Realized averages are arithmetic means of real returns from Damodaran [12], French [18] and Nareit [13]. Every derived value is my arithmetic.`,
      source: 'As cited in each row.',
    },
  },

  risk: {
    kind: 'table',
    props: {
      title: 'Risk inputs: volatility and correlation with U.S. stocks, by window',
      subtitle: 'Annualized, from monthly real returns',
      columns: [{ label: 'Asset class' }, { label: 'Volatility, 2022–26', align: 'right' }, { label: '2011–26', align: 'right' }, { label: '2011–21', align: 'right' }, { label: 'Correlation with U.S. stocks, 2022–26', align: 'right' }, { label: '2011–21', align: 'right' }, { label: 'Excess kurtosis', align: 'right' }],
      rows: D.meta.sim.map((s, i) => [
        (D.meta.names as Record<string, string>)[s] + (s === 'tips' ? ', 10-year' : ''),
        pc((D.risk.vol.recent as Record<string, number>)[s]),
        pc((D.risk.vol.long as Record<string, number>)[s]),
        pc((D.risk.vol.before as Record<string, number>)[s]),
        s === 'us' ? '1.00' : sg(D.risk.corr.recent[1][i]),
        s === 'us' ? '1.00' : sg(D.risk.corr.before[1][i]),
        f1((D.risk.kurtosis as Record<string, number>)[s]),
      ]),
      minWidth: 620,
      note: `Windows: January 2022 to September 2026 (${D.meta.windows.recent.months} months), May 2011 to September 2026 (${D.meta.windows.long.months}), May 2011 to December 2021 (${D.meta.windows.before.months}). Unshrunk sample statistics; the model uses the 2022–26 matrix shrunk ${Math.round(D.meta.windows.recent.delta * 100)}% toward a common correlation of ${f2(D.meta.windows.recent.rbar)} [21]. TIPS and Treasuries are par bonds repriced monthly from the Treasury curves; credit is fund NAV without distributions; gold is the NAV of a bullion trust. All my calculation.`,
      source: 'French [18]; U.S. Treasury [1, 2]; Nareit [13]; fund NAV histories [19]; BLS CPI [20].',
    },
  },

  merton: {
    kind: 'table',
    props: {
      title: 'The Merton share, today and under the averages',
      subtitle: 'Stock share of a stand-alone investor with no future pay: π ÷ (γσ²)',
      columns: [{ label: 'Risk aversion γ' }, { label: 'Group' }, { label: 'Stocks, November 2026 inputs', align: 'right' }, { label: 'Stocks, 1928–2025 averages', align: 'right' }],
      rows: D.merton.rows.map((r) => [String(r.gamma), G[String(r.gamma)], pc(r.today), r.historical > 100 ? `${pc(r.historical, 0)} (borrows)` : pc(r.historical)]),
      minWidth: 440,
      note: `Today: premium ${f2(D.merton.premium)} points over 10-year TIPS, volatility ${f1(D.merton.vol)}%. Averages: premium ${f2(D.merton.histPremium)} points over bills, volatility ${f1(D.merton.histVol)}% (arithmetic real returns, S&P 500 and 3-month bills). My arithmetic.`,
      source: 'Merton (1969) [22]; {tab:inputs} and {tab:risk}; Damodaran [12].',
    },
  },

  menu: {
    kind: 'table',
    props: {
      title: 'What each asset class adds, once stocks and TIPS are on the menu',
      subtitle: 'Stand-alone investor, long-only optimum over all nine asset classes',
      columns: [{ label: 'Asset class' }, { label: 'Beta to global stocks', align: 'right' }, { label: 'Premium left after beta, bp', align: 'right' }, { label: 'Weight at γ = 2', align: 'right' }, { label: 'Gain in certainty-equivalent return, bp a year', align: 'right' }],
      rows: D.materiality.rows.map((r) => [(D.meta.names as Record<string, string>)[r.id], f2(r.beta), r.alphaBp === null ? '–' : sg(r.alphaBp, 0), pc(r.weight2), r.gainBp < 0.005 ? '0' : r.gainBp < 1 ? r.gainBp.toFixed(2) : f1(r.gainBp)]),
      minWidth: 560,
      note: `“Premium left after beta” is the asset's premium over TIPS minus its beta times the stock premium. The gain is the certainty-equivalent return with the asset available minus without it, at the γ on the grid where it is largest. The model keeps an asset only if it adds at least ${D.materiality.thresholdBp} basis point a year. My calculation.`,
      source: 'Model output; inputs from {tab:inputs} and {tab:risk}.',
    },
  },

  windows: {
    kind: 'table',
    props: {
      title: 'Same expected returns, different years of risk data',
      subtitle: 'Long-only optimum for a stand-alone balanced investor (γ = 4) under each covariance estimate',
      columns: [{ label: 'Risk estimated on' }, { label: 'Stock–long-bond correlation', align: 'right' }, { label: 'Stock volatility', align: 'right' }, { label: 'Stocks', align: 'right' }, { label: 'Long Treasuries', align: 'right' }, { label: 'High yield', align: 'right' }, { label: 'TIPS', align: 'right' }],
      rows: (
        [
          ['recent', '2022–2026, shrunk (the model)'],
          ['recentUnshrunk', '2022–2026, no shrinkage'],
          ['long', '2011–2026, shrunk'],
          ['before', '2011–2021, shrunk'],
        ] as const
      ).map(([k, label]) => {
        const w = (D.sensitivity.windows as Record<string, { weights: Record<string, number>; eqVol: number; corrStockLongBond: number }>)[k];
        return [label, sg(w.corrStockLongBond), pc(w.eqVol), pc(w.weights.eq), pc(w.weights.tsyLong), pc(w.weights.hy), pc(w.weights.tips)];
      }),
      minWidth: 600,
      note: 'All nine asset classes are available in these runs. The correlation is global stocks against 20-year Treasuries. My calculation.',
      source: 'Model output.',
    },
  },

  ladderT: {
    kind: 'table',
    props: {
      title: 'What the real curve funds, by length of retirement',
      subtitle: `Level real income from a TIPS ladder bought on ${longDate(D.meta.realCurveDate)}, first payment at purchase, for a buyer aged 65`,
      columns: [{ label: 'Payments' }, { label: 'Last payment at age', align: 'right' }, { label: 'Income, % of cost a year', align: 'right' }, { label: 'Chance a man is alive after the last payment', align: 'right' }, { label: 'A woman', align: 'right' }, { label: 'Either of a couple', align: 'right' }],
      rows: (['20', '25', '30', '35'] as const).map((n) => {
        const s = (D.retirement.surv as Record<string, { male: number; female: number; either: number }>)[String(65 + Number(n))];
        return [n, String(64 + Number(n)), pc(D.retirement.byYears[n].start, 2), pc(s.male), pc(s.female), pc(s.either)];
      }),
      minWidth: 560,
      note: `Survival is from age 65 to the birthday after the last payment, SSA ${D.retirement.ssaYear} period table; the couple column assumes independent lives. A fair real annuity for one 65-year-old would pay ${f2(D.retirement.annuityRate)}% (my arithmetic from the same table and curve, before any insurer's costs). My calculation.`,
      source: 'U.S. Treasury real yield curve [1]; SSA life table [31].',
    },
  },

  retirees: {
    kind: 'table',
    props: {
      title: 'Retirees by funded ratio',
      subtitle: 'Funded ratio is savings divided by the cost of a TIPS ladder that pays for essential spending not covered by Social Security',
      columns: [{ label: 'Funded ratio' }, { label: 'Ladder (the floor)', align: 'right' }, { label: 'Stocks, γ = 2', align: 'right' }, { label: 'γ = 4', align: 'right' }, { label: 'γ = 8', align: 'right' }, { label: 'Expected real return, γ = 4', align: 'right' }, { label: 'Bad year 1 in 100, γ = 2', align: 'right' }],
      rows: [0.8, 1, 1.25, 1.5, 2, 3].map((fr) => {
        const r = (g: number) => D.retirement.retirees.find((x) => x.fr === fr && x.gamma === g)!;
        return [fr.toFixed(2), fr < 1 ? `100% (funds ${Math.round(fr * 100)}% of the floor)` : pc(r(4).floor), pc(r(2).weights.eq), pc(r(4).weights.eq), pc(r(8).weights.eq), pc(r(4).mu, 2), neg(r(2).loss1in100)];
      }),
      minWidth: 620,
      note: 'The floor goes into the ladder first; the surplus is invested at the stand-alone Merton share and the rest of the surplus is also TIPS. Below a funded ratio of 1 the model holds no stocks: the choice is a smaller floor, a later retirement or more saving, not more risk. My calculation.',
      source: 'Model output.',
    },
  },

  mc: {
    kind: 'table',
    props: {
      title: 'Forty years of saving and thirty of spending, five strategies',
      subtitle: `10,000 simulated lives, balanced investor (γ = 4) with stable pay saving ${pc(D.meta.savingsRate * 100)} of median pay from 25`,
      columns: [{ label: 'Strategy' }, { label: 'Savings at 65, years of final pay: 5th / median / 95th', align: 'right' }, { label: 'Income, % of final pay: 5th / median', align: 'right' }, { label: 'Worst year, 5th pct.', align: 'right' }, { label: 'Below TIPS-only', align: 'right' }, { label: 'Certainty-equivalent income', align: 'right' }],
      rows: [
        ...grp('stable', 4).rows.map((r) => [r.name === 'Model' ? '<strong>Model</strong>' : r.name, `${f1(r.w65[0])} / ${f1(r.w65[2])} / ${f1(r.w65[4])}`, `${Math.round(r.spend[0])}% / ${Math.round(r.spend[1])}%`, pc(r.worstYear, 0), pc(r.shortfall, 0), pc(r.ce, 0)]),
        ['TIPS only', '–', `${Math.round(grp('stable', 4).tipsOnly)}% / ${Math.round(grp('stable', 4).tipsOnly)}%`, pc(grp('stable', 4).tipsOnly, 0), '–', pc(grp('stable', 4).tipsOnly, 0)],
      ],
      minWidth: 620,
      note: 'Income is the average real retirement income from 65 to 94 as a share of pay at 64; Social Security is on top and not modeled. “Worst year” is the 5th percentile across lives of the lowest single year of income. “Below TIPS-only” is the share of lives in which average income ends below the TIPS-only saver’s. “TIPS only” saves in TIPS at today’s 10-year real yield and buys a ladder at 65: a certain outcome. 60/40 and 100% stocks hold U.S. stocks; target-date follows {fig:tdf}; age-in-bonds holds its age in intermediate Treasuries. My simulation.',
      source: 'Model output; inputs from {tab:inputs} and {tab:risk}.',
    },
  },

  liq: {
    kind: 'table',
    props: {
      title: 'The liquidity budget: the most that could be locked up for ten years',
      subtitle: 'Share of savings an investor could lock without becoming a forced seller in a crash; an upper limit, not an allocation',
      columns: [{ label: 'Investor' }, { label: 'Savings, years of pay', align: 'right' }, { label: 'Cash needed over ten years, % of savings', align: 'right' }, { label: 'Stocks in the liquid part', align: 'right' }, { label: 'Liquidity budget', align: 'right' }, { label: 'Model weight in private assets', align: 'right' }],
      rows: D.liquidity.rows.map((r) => [r.who, r.wealthYears === null ? '–' : f1(r.wealthYears), pc(r.needShare, 0), pc(r.risky, 0), pc(r.budget, 0), '0%']),
      minWidth: 620,
      note: `Budget = 1 − need ÷ (1 − D × stock share), floored at zero, with D = ${D.liquidity.drawdown}%, the worst real fall in global stocks since 1990 (trough in ${longDate(D.liquidity.trough + '-01').replace(' 1,', '')}; my calculation from [18]). Need: for savers, a reserve of ${D.liquidity.reserveMonths.stable}, ${D.liquidity.reserveMonths.cyclical} or ${D.liquidity.reserveMonths.stockLike} months of spending for stable, cyclical and stock-like pay (my assumption); for retirees, the first ten rungs of the ladder, ${D.retirement.first10Share}% of its cost. Savers are balanced investors (γ = 4) on their expected path.`,
      source: 'Model output.',
    },
  },

  matrix: {
    kind: 'noted',
    props: {
      title: 'The matrix: model portfolios for 45 groups',
      subtitle: 'By age, risk aversion and kind of paycheck: percent of savings in global stocks and in TIPS, with expected real return and three measures of risk. The line under each row says why it differs from its neighbors',
      columns: [{ label: 'Risk' }, { label: 'Pay' }, { label: 'Savings, years of pay', align: 'right' }, { label: 'Stocks', align: 'right' }, { label: 'TIPS', align: 'right' }, { label: 'Expected real return', align: 'right' }, { label: 'Volatility', align: 'right' }, { label: 'Bad year, 1 in 100', align: 'right' }, { label: 'Worst fall 2011–26', align: 'right' }],
      rows: D.matrix.map((m, i) => ({
        group: i % 9 === 0 ? (m.band === 'At 65' ? 'At 65, the day the paychecks stop' : `Age ${m.band.replace('-', ' to ')}, shown at ${m.age}`) : undefined,
        cells: [`${G[String(m.gamma)]}, γ\u00a0${m.gamma}`, INC[m.income].replace(' pay', '').replace('-', '\u2011'), f1(m.wealthYears), pc(m.weights.eq, 0), pc(100 - Math.round(m.weights.eq), 0), pc(m.mu, 2), pc(m.vol), neg(m.loss1in100), neg(m.drawdown)],
        why: m.reason,
      })),
      minWidth: 600,
      note: 'Each group follows its own expected path from 25 with median pay and a 12.1% saving rate, so savings differ a little across rows. Volatility, the bad year and the worst fall count TIPS as held to maturity; marked to market as a 10-year TIPS fund, every row would show a fall of 26% to 30% since 2011, almost all of it in 2022. “Worst fall” is the largest real peak-to-trough loss of the mix from May 2011 to September 2026, rebalanced monthly. The bad year uses a Student-t with five degrees of freedom. My calculation.',
      source: 'Model output; inputs from {tab:inputs} and {tab:risk}.',
    },
  },

  holdings: {
    kind: 'table',
    props: {
      title: 'What I hold',
      subtitle: `Percent of the portfolio at the ${longDate(me.asOf)} close. View A is the liquid portfolio; View B adds unvested employer stock`,
      columns: [{ label: 'Holding' }, { label: 'What it is' }, { label: 'Account' }, { label: 'View A', align: 'right' }, { label: 'View B', align: 'right' }],
      rows: [
        ...me.holdings.map((h) => [h.ticker, h.label, h.ticker === 'Cash' ? `Bank ${me.reserve}%, brokerage ${f1(h.weight - me.reserve)}%` : h.account, pc(h.weight, h.weight < 1 ? 2 : 1), pc(h.weightB, h.weightB < 1 ? 2 : 1)]),
        ['Employer stock', 'Unvested restricted stock units', 'Not yet mine to sell', '–', `about ${me.viewB.employer}%`],
      ],
      minWidth: 620,
      note: `The tickers are facts about my portfolio, not recommendations. The target-date fund's mix on ${longDate(me.fund2065.asOf)}: U.S. stocks ${me.fund2065.look.us}%, international developed ${me.fund2065.look.intl}%, emerging ${me.fund2065.look.em}%, listed real estate ${me.fund2065.look.reit}%, bonds ${me.fund2065.look.bonds}%, cash ${me.fund2065.look.cash}% [39]. RVII last traded at ${me.rvii.last} on ${spell(me.rvii.date)} [40].`,
      source: 'My own records; fund holdings [39]; Nasdaq [40].',
    },
  },

  gap: {
    kind: 'table',
    props: {
      title: 'Today against the target, by exposure',
      subtitle: 'Liquid portfolio (View A), percent',
      columns: [{ label: 'Exposure' }, { label: 'Today', align: 'right' }, { label: 'Target', align: 'right' }, { label: 'Gap', align: 'right' }, { label: `After quarter ${plan.quarters}`, align: 'right' }],
      rows: (
        [
          ['U.S. stock index funds', 'us'],
          ['International developed stocks', 'intl'],
          ['Emerging-market stocks', 'em'],
          ['Single stocks, sector and leveraged funds', 'single'],
          ['Listed real estate (inside the target-date fund)', 'reit'],
          ['Bonds (inside the target-date fund)', 'bonds'],
          ['Silver', 'gold'],
          ['Listed fund of private companies', 'private'],
          ['Cash, net of the leveraged fund’s borrowing', 'cash'],
        ] as const
      ).map(([label, k]) => [label, pc((me.viewA as Record<string, number>)[k]), pc((me.target as Record<string, number>)[k]), sg((me.gap as Record<string, number>)[k], 1), pc((last.a as Record<string, number>)[k])]),
      minWidth: 560,
      note: `Stock exposure today is ${me.equityA}% of the liquid portfolio counting the 2x fund at twice its weight (${f1(me.equityA - plan.ggll)}% at market value), and ${me.usShareOfEquityA}% of it is U.S. The target keeps ${me.reserve}% bank cash as a reserve outside the model and puts the rest in global stocks at market weights. The last column is larger than 100% of today's portfolio by the employer-stock proceeds; its weights are shares of the larger portfolio. My arithmetic.`,
      source: 'My own holdings; model output.',
    },
  },

  hurdle: {
    kind: 'table',
    props: {
      title: 'The return a concentrated position has to earn to pay for its own risk',
      subtitle: `Extra expected return a year, over a diversified holding with the same market exposure, at which the position is the right size for γ = ${me.profile.gamma}`,
      columns: [{ label: 'Savings as a share of total wealth (k)' }, { label: `Single names and sector, ${me.tiltExposure}% of the liquid portfolio`, align: 'right' }, { label: `Employer stock, about ${me.viewB.employer}% of the total`, align: 'right' }],
      rows: me.hurdles.map((h) => [pc(h.k * 100, 0), `${f2(h.tilt)}%`, `${f2(h.employer)}%`]),
      minWidth: 520,
      note: `Hurdle = γ × k × w × σ², with w the position's weight and σ its firm-specific volatility: ${me.tiltIdioVol}% for the basket of single names (measured on 2022–2026 monthly prices [40]) and ${me.single.idio}% for a typical single stock [36]. k is not published here; a saver at 25 with one year of pay in the bank has a k of ${(1 / (1 + D.lifecycle.humanCapital.stable[0] / D.lifecycle.earnings[0])).toFixed(2)} at the default saving rate. The hurdle leaves out the link between an employer's stock and the paycheck from the same employer, which makes the true number higher. My arithmetic.`,
      source: 'Model output; Campbell, Lettau, Malkiel and Xu [36]; Nasdaq prices [40].',
    },
  },

  whatif: {
    kind: 'table',
    props: {
      title: 'What new money would do to the path',
      subtitle: 'A what-if, not my contribution rate: new money each quarter as a percent of today’s liquid portfolio, all of it sent to whatever is furthest below target',
      columns: [{ label: 'New money a quarter' }, { label: 'Off target after Q4', align: 'right' }, { label: 'After Q8', align: 'right' }, { label: `After Q${plan.quarters}`, align: 'right' }, { label: `Tracking error after Q4`, align: 'right' }, { label: `Single-name exposure at Q${plan.quarters}`, align: 'right' }],
      rows: [
        ['None (the base plan)', pc(plan.base[4].offTarget), pc(plan.base[8].offTarget), pc(last.offTarget), pc(plan.base[4].te, 2), pc(last.a.single)],
        ...plan.whatIf.map((w) => [`${w.contrib}%`, pc(w.q4.offTarget), pc(w.q8.offTarget), pc(w.final.offTarget), pc(w.q4.te, 2), pc(w.final.a.single)]),
      ],
      minWidth: 560,
      note: 'Each 1% of the portfolio added per quarter closes about 1 point of the gap per quarter until international stocks reach target, then dilutes the legacy positions. Off target is half the sum of absolute weight differences on the liquid portfolio. My arithmetic.',
      source: 'Model output.',
    },
  },
};
