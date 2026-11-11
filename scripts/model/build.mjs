// The Brockmeier model. Reads scripts/model/inputs.json (public data, written by
// fetch.py), assumptions.json (hand-entered public numbers and the model's own
// parameters) and my-portfolio.json, and writes src/data/model2026-data.json, which the
// paper's figures and calculator read.
//
//   node scripts/model/build.mjs            # prints a summary of the headline numbers
//
// Everything is deterministic: the Monte Carlo uses a fixed seed. Sections, in order:
//   1  panel()        monthly real returns for eleven asset classes
//   2  risk()         covariance by window, Ledoit-Wolf shrinkage, stock-bond correlation
//   3  expected()     forward-looking real returns from today's yields and valuations
//   4  history()      long-run averages, for the contrast
//   5  allocate()     the constrained portfolio problem (total-wealth form)
//   6  merton()       the one-asset anchor and its sensitivity
//   7  frontier()     efficient frontiers under both sets of inputs
//   8  lifecycle()    human capital, the wealth path, glide paths, the group matrix
//   9  retirement()   TIPS ladder arithmetic, survival, retirees by funded ratio
//  10  liquidity()    the liquidity budget for an illiquid sleeve
//  11  simulate()     Monte Carlo of saving and spending
//  12  mine()         Charlie's own portfolio: current, target, transition
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  rng, normalSource, sum, mean, dot, matVec, quad, zeros, stdev, correlation, cholesky, ledoitWolf, toCorr, solveQP,
  parBondReturn, interp, discountFactors, percentile, excessKurtosis, tQuantileUnitVar, round,
} from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const load = async (f) => JSON.parse(await readFile(join(here, f), 'utf8'));
const I = await load('inputs.json');
const A = await load('assumptions.json');
const ME = await load('my-portfolio.json');

// Asset classes. `sim` is the eleven-asset set the returns are measured on; `model` is
// the nine-asset set the optimizer sees, with the three stock regions held at global
// market weights as one asset.
const SIM = ['tips', 'us', 'intl', 'em', 'reit', 'hy', 'ig', 'tsyInt', 'tsyLong', 'gold', 'cash'];
const MODEL = ['tips', 'eq', 'reit', 'hy', 'ig', 'tsyInt', 'tsyLong', 'gold', 'cash'];
const NAMES = {
  tips: 'TIPS', us: 'U.S. stocks', intl: 'International developed stocks', em: 'Emerging-market stocks', eq: 'Global stocks',
  reit: 'Listed real estate', hy: 'High-yield credit', ig: 'Investment-grade credit', tsyInt: 'Intermediate Treasuries',
  tsyLong: 'Long Treasuries', gold: 'Gold', cash: 'Cash',
};
const EQW = [A.equityWeights.us, A.equityWeights.intl, A.equityWeights.em];
// P maps eleven-asset weights or returns to the nine-asset set.
const P = MODEL.map((m) => SIM.map((s) => (m === 'eq' ? (['us', 'intl', 'em'].includes(s) ? EQW[['us', 'intl', 'em'].indexOf(s)] : 0) : m === s ? 1 : 0)));
/** Expand nine-asset weights to eleven (stocks split at market weights). */
const expand = (x) => SIM.map((s) => (['us', 'intl', 'em'].includes(s) ? x[1] * EQW[['us', 'intl', 'em'].indexOf(s)] : x[MODEL.indexOf(s)]));

// ================================================================ 1. monthly real returns
const addMonth = (m, k) => {
  const [y, mo] = m.split('-').map(Number);
  const t = y * 12 + (mo - 1) + k;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
};
const monthRange = (a, b) => {
  const out = [];
  for (let m = a; m <= b; m = addMonth(m, 1)) out.push(m);
  return out;
};

function cpiIndex() {
  // CPI-U, not seasonally adjusted: BLS from 2007, Shiller's copy of the same series before.
  const c = new Map();
  I.shiller.months.forEach((m, i) => I.shiller.cpi[i] && c.set(m, I.shiller.cpi[i]));
  I.cpi.months.forEach((m, i) => c.set(m, I.cpi.index[i]));
  // A month with no published index (the BLS skipped one in 2025) is filled on a constant growth path.
  const months = monthRange('1926-01', I.cpi.months.at(-1));
  const filled = [];
  for (let i = 0; i < months.length; i++) {
    if (c.has(months[i])) continue;
    let a = i - 1;
    let b = i + 1;
    while (!c.has(months[b])) b++;
    c.set(months[i], c.get(months[a]) * (c.get(months[b]) / c.get(months[a])) ** ((i - a) / (b - a)));
    filled.push(months[i]);
  }
  return { get: (m) => c.get(m), last: I.cpi.months.at(-1), filled };
}
const CPI = cpiIndex();
const inflation = (m) => CPI.get(m) / CPI.get(addMonth(m, -1)) - 1;

const SPLITS = [];
function panel() {
  const nominal = Object.fromEntries(SIM.map((k) => [k, new Map()]));
  const fr = I.french;
  fr.months.forEach((m, i) => {
    nominal.cash.set(m, fr.rf[i] / 100);
    nominal.us.set(m, (fr.usMktRf[i] + fr.rf[i]) / 100);
    if (fr.devExUsMktRf[i] !== null) nominal.intl.set(m, (fr.devExUsMktRf[i] + fr.rf[i]) / 100);
    if (fr.emMktRf[i] !== null) nominal.em.set(m, (fr.emMktRf[i] + fr.rf[i]) / 100);
  });
  I.nareit.months.forEach((m, i) => I.nareit.totalReturn[i] !== null && nominal.reit.set(m, I.nareit.totalReturn[i] / 100));
  for (const k of ['gold', 'hy', 'ig']) {
    const s = I.nav[k];
    for (let i = 1; i < s.months.length; i++) {
      if (addMonth(s.months[i - 1], 1) !== s.months[i]) continue;
      let ratio = s.nav[i] / s.nav[i - 1];
      // A share split or reverse split shows up as a jump in NAV per share; undo it.
      if (ratio > 1.8 || ratio < 0.55) {
        const f = [2, 3, 4, 5, 10].map((n) => [n, 1 / n]).flat().reduce((a, b) => (Math.abs(Math.log(ratio / b)) < Math.abs(Math.log(ratio / a)) ? b : a));
        SPLITS.push({ series: k, month: s.months[i], factor: f });
        ratio /= f;
      }
      nominal[k].set(s.months[i], ratio - 1);
    }
  }
  const nm = I.treasury.nominalMonthEnd;
  for (let i = 1; i < nm.months.length; i++) {
    if (nm['5 Yr'][i] !== null && nm['5 Yr'][i - 1] !== null) nominal.tsyInt.set(nm.months[i], parBondReturn(nm['5 Yr'][i - 1], nm['5 Yr'][i], 5));
    if (nm['20 Yr'][i] !== null && nm['20 Yr'][i - 1] !== null) nominal.tsyLong.set(nm.months[i], parBondReturn(nm['20 Yr'][i - 1], nm['20 Yr'][i], 20));
  }
  // TIPS: the return of a 10-year par bond on the real curve is already a real return.
  const real = Object.fromEntries(SIM.map((k) => [k, new Map()]));
  const rm = I.treasury.realMonthEnd;
  for (let i = 1; i < rm.months.length; i++) real.tips.set(rm.months[i], parBondReturn(rm['10 YR'][i - 1], rm['10 YR'][i], 10));
  for (const k of SIM) {
    if (k === 'tips') continue;
    for (const [m, r] of nominal[k]) if (m <= CPI.last && m >= '1926-02') real[k].set(m, (1 + r) / (1 + inflation(m)) - 1);
  }
  return { nominal, real };
}
const R = panel();

/** T x 11 matrix of real monthly returns over [a, b]; throws if a series has a gap. */
function window([a, b]) {
  const months = monthRange(a, b);
  const X = months.map((m) => SIM.map((k) => {
    const v = R.real[k].get(m);
    if (v === undefined) throw new Error(`No ${k} return for ${m}`);
    return v;
  }));
  return { months, X };
}

// ================================================================ 2. risk
function risk() {
  const out = {};
  for (const [name, w] of Object.entries(A.windows)) {
    const { months, X } = window(w);
    const lw = ledoitWolf(X);
    const ann = (S) => S.map((row) => row.map((v) => v * 12));
    out[name] = {
      months: months.length,
      from: w[0],
      to: w[1],
      delta: lw.delta,
      rbar: lw.rbar,
      sample: ann(lw.sample),
      shrunk: ann(lw.shrunk),
      meanReal: SIM.map((_, j) => mean(X.map((r) => r[j])) * 12),
      kurtosis: SIM.map((_, j) => excessKurtosis(X.map((r) => r[j]))),
    };
  }
  // Rolling 36-month correlation of U.S. stocks with long Treasuries, nominal returns.
  const months = monthRange('1993-11', A.windows.recent[1]);
  const s = months.map((m) => R.nominal.us.get(m));
  const b = months.map((m) => R.nominal.tsyLong.get(m));
  const roll = [];
  for (let i = 35; i < months.length; i++) roll.push([months[i], correlation(s.slice(i - 35, i + 1), b.slice(i - 35, i + 1))]);
  out.stockBond = roll;
  return out;
}
const RISK = risk();
const S11 = RISK.recent.shrunk;
const mapCov = (S) => P.map((pi) => P.map((pj) => dot(pi, matVec(S, pj))));
const S9 = mapCov(S11);
// The optimizer's covariance: TIPS matched to the investor's horizon carry no risk at that horizon.
const S9opt = S9.map((row, i) => row.map((v, j) => (i === 0 || j === 0 ? 0 : v)));

// ================================================================ 3. expected real returns
const T = I.treasury;
const realCurve = [[5, T.real['5 YR']], [7, T.real['7 YR']], [10, T.real['10 YR']], [20, T.real['20 YR']], [30, T.real['30 YR']]];
const nomCurve = [[1 / 12, T.nominal['1 Mo']], [0.25, T.nominal['3 Mo']], [0.5, T.nominal['6 Mo']], [1, T.nominal['1 Yr']], [2, T.nominal['2 Yr']], [3, T.nominal['3 Yr']], [5, T.nominal['5 Yr']], [7, T.nominal['7 Yr']], [10, T.nominal['10 Yr']], [20, T.nominal['20 Yr']], [30, T.nominal['30 Yr']]];
const breakeven = (m) => interp(nomCurve, m) - interp(realCurve, m);
const RF = T.real['10 YR'];

function expected() {
  // Long-run real growth in earnings per share: ten-year average real EPS at each end of Shiller's record.
  const sh = I.shiller;
  const realE = sh.months.map((m, i) => (sh.earnings[i] && sh.cpi[i] ? [m, sh.earnings[i] / sh.cpi[i]] : null)).filter(Boolean);
  const first = realE.slice(0, 120);
  const last = realE.slice(-120);
  const yrs = (Number(last[59][0].slice(0, 4)) + Number(last[59][0].slice(5)) / 12) - (Number(first[59][0].slice(0, 4)) + Number(first[59][0].slice(5)) / 12);
  const g = (Math.exp(Math.log(mean(last.map((r) => r[1])) / mean(first.map((r) => r[1]))) / yrs) - 1) * 100;
  const gSpan = [first[0][0], first.at(-1)[0], last[0][0], last.at(-1)[0]];

  const regions = {};
  for (const [id, key] of [['us', 'us'], ['intl', 'devExUs'], ['em', 'em']]) {
    const s = I.indexStats[key];
    const eyTrailing = 100 / s.pe;
    const eyForward = 100 / s.peFy1;
    const ey = (eyTrailing + eyForward) / 2;
    const ddm = s.indexDividendYield + g;
    regions[id] = { index: s.benchmark, asOf: s.asOf, pe: s.pe, peFy1: s.peFy1, dy: s.indexDividendYield, eyTrailing, eyForward, ey, ddm, mu: (ey + ddm) / 2 };
  }
  const eq = dot(EQW, [regions.us.mu, regions.intl.mu, regions.em.mu]);

  // Listed real estate: dividend yield plus the real growth of the price-only index since 1971.
  const n = I.nareit;
  const iEnd = n.months.indexOf(CPI.last);
  const years = (iEnd - 0) / 12;
  const nomG = (n.priceIndex[iEnd] / n.priceIndex[0]) ** (1 / years) - 1;
  const infl = (CPI.get(n.months[iEnd]) / CPI.get(n.months[0])) ** (1 / years) - 1;
  const reitG = ((1 + nomG) / (1 + infl) - 1) * 100;
  const reitDy = n.dividendYield.at(-1);

  const ig = I.indexStats.ig;
  const hy = I.indexStats.hy;
  const igBase = interp(realCurve, ig.oad);
  const igLoss = (ig.oas / 100) * A.credit.igLossShareOfSpread;
  const hyBase = interp(nomCurve, hy.oad) - breakeven(5);
  const hyLoss = A.credit.hyDefaultRate * A.credit.hyLossGivenDefault;
  const bill = T.bills['4 WEEKS COUPON EQUIVALENT'];

  const mu = {
    tips: RF,
    us: regions.us.mu,
    intl: regions.intl.mu,
    em: regions.em.mu,
    eq,
    reit: reitDy + reitG,
    hy: hyBase + hy.oas / 100 - hyLoss,
    ig: igBase + ig.oas / 100 - igLoss,
    tsyInt: T.real['5 YR'],
    tsyLong: T.real['20 YR'],
    gold: A.goldRealReturn,
    cash: bill - breakeven(5),
  };
  const d = I.damodaranErp;
  const cross = {
    cape: I.multpl.cape.value,
    capeDate: I.multpl.cape.date,
    capeYield: 100 / I.multpl.cape.value,
    excessCapeYield: 100 / I.multpl.cape.value - RF,
    trailingPe: I.multpl.pe.value,
    trailingEy: I.multpl.earningsYield.value,
    dividendYield: I.multpl.dividendYield.value,
    damodaranDate: d.date,
    damodaranErp: d.erpT12m * 100,
    damodaranTbond: d.tbond * 100,
    damodaranNominal: d.expectedReturn * 100,
    damodaranReal: d.expectedReturn * 100 - breakeven(10),
  };
  return { mu, regions, g, gSpan, reit: { dy: reitDy, g: reitG, nominalGrowth: nomG * 100, inflation: infl * 100, from: n.months[0], to: n.months[iEnd] }, ig: { base: igBase, oas: ig.oas, loss: igLoss, oad: ig.oad, ytw: ig.ytw, asOf: ig.asOf }, hy: { base: hyBase, oas: hy.oas, loss: hyLoss, oad: hy.oad, ytw: hy.ytw, asOf: hy.asOf }, bill, cross };
}
const E = expected();
const MU9 = MODEL.map((k) => E.mu[k] / 100);
const MU11 = SIM.map((k) => E.mu[k] / 100);

// ================================================================ 4. history
function history() {
  const h = I.damodaranHist;
  const stat = (key) => {
    const real = h[key].map((r, i) => (1 + r) / (1 + h.inflation[i]) - 1);
    return { arith: mean(real) * 100, geo: (Math.exp(mean(real.map((r) => Math.log(1 + r)))) - 1) * 100, vol: stdev(real) * 100 };
  };
  const annual = Object.fromEntries(['stocks', 'bonds', 'bills', 'baa', 'gold'].map((k) => [k, stat(k)]));
  const monthly = (key, from) => {
    const months = [...R.real[key].keys()].filter((m) => m >= from).sort();
    const r = months.map((m) => R.real[key].get(m));
    return { from: months[0], to: months.at(-1), arith: mean(r) * 12 * 100, geo: (Math.exp(mean(r.map((x) => Math.log(1 + x))) * 12) - 1) * 100, vol: stdev(r) * Math.sqrt(12) * 100 };
  };
  const series = { us: monthly('us', '1926-07'), intl: monthly('intl', '1990-07'), em: monthly('em', '1989-07'), reit: monthly('reit', '1972-01'), tips: monthly('tips', '2003-02'), tsyLong: monthly('tsyLong', '1993-11') };
  // The averages most allocation advice is built on, mapped to the model's asset classes.
  const mu = { tips: annual.bonds.arith, eq: annual.stocks.arith, reit: series.reit.arith, hy: annual.baa.arith, ig: annual.baa.arith, tsyInt: annual.bonds.arith, tsyLong: annual.bonds.arith, gold: annual.gold.arith, cash: annual.bills.arith };
  return { years: [h.years[0], h.years.at(-1)], annual, series, mu, safe: annual.bills.arith };
}
const H = history();

// ================================================================ 5. the portfolio problem
/**
 * Weights on financial wealth for an investor with risk aversion gamma whose financial
 * wealth is a share k of total wealth (the rest is human capital, of which a share beta
 * behaves like global stocks and the rest like the safe asset):
 *   maximize  mu'x - (gamma / 2) [ k x'Sx + 2 (1 - k) beta x'S e_eq ]   over  x >= 0, 1'x = 1.
 */
let ACTIVE = MODEL.map(() => true);
const EVERY = MODEL.map(() => true);
function allocate(gamma, k = 1, beta = 0, mu = MU9, S = S9opt, active = ACTIVE) {
  const idx = MODEL.map((_, i) => i).filter((i) => active[i]);
  const lin = idx.map((i) => gamma * (1 - k) * beta * S[i][1]);
  const x = solveQP({ mu: idx.map((i) => mu[i]), Sigma: idx.map((i) => idx.map((j) => S[i][j] * k)), gamma, lin });
  const out = new Array(MODEL.length).fill(0);
  idx.forEach((i, j) => (out[i] = x[j]));
  return out;
}

/**
 * Materiality: what each risky asset adds to the certainty-equivalent return of a
 * stand-alone investor (no human capital), at the risk aversion where it adds most.
 * An asset the optimizer holds for less than a basis point a year is noise, not a
 * finding, so the model leaves it out.
 */
function materiality() {
  const ce = (x, g) => dot(x, MU9) - (g / 2) * quad(S9opt, x);
  const rows = [];
  for (let i = 1; i < MODEL.length; i++) {
    let gain = 0;
    const weight = {};
    for (const g of A.gammaGrid) {
      const full = allocate(g, 1, 0, MU9, S9opt, EVERY);
      const without = allocate(g, 1, 0, MU9, S9opt, EVERY.map((_, j) => j !== i));
      gain = Math.max(gain, ce(full, g) - ce(without, g));
      weight[g] = full[i];
    }
    const betaToStocks = S9opt[i][1] / S9opt[1][1];
    rows.push({ id: MODEL[i], gainBp: gain * 1e4, weight2: weight[2] * 100, weight4: weight[4] * 100, beta: betaToStocks, alphaBp: i === 1 ? null : (MU9[i] - RF / 100 - betaToStocks * (MU9[1] - RF / 100)) * 1e4 });
  }
  return rows;
}
const MAT = materiality();
ACTIVE = MODEL.map((m, i) => i === 0 || MAT.find((r) => r.id === m).gainBp >= A.materialityBp);
const NU = A.monteCarlo.studentT;
const T01 = tQuantileUnitVar(0.01, NU);
const hist11 = window(A.windows.long);
function stats(x9) {
  const m = dot(x9, MU9);
  // Risk at the investor's horizon: TIPS held to maturity pay their real yield whatever their price does.
  const vol = Math.sqrt(quad(S9opt, x9));
  // Risk on the statement: the same portfolio with TIPS held as a constant ten-year fund.
  const volMtm = Math.sqrt(quad(S9, x9));
  const w = expand(x9);
  // Worst peak-to-trough real loss of this mix over the long window, rebalanced monthly.
  const worst = (ladder) => {
    let peak = 1;
    let v = 1;
    let dd = 0;
    for (const r of hist11.X) {
      let pr = 0;
      for (let j = 0; j < w.length; j++) pr += w[j] * (ladder && j === 0 ? RF / 1200 : r[j]);
      v *= 1 + pr;
      peak = Math.max(peak, v);
      dd = Math.min(dd, v / peak - 1);
    }
    return dd * 100;
  };
  return { mu: m * 100, vol: vol * 100, volMtm: volMtm * 100, loss1in100: (m + vol * T01) * 100, drawdown: worst(true), drawdownMtm: worst(false), risky: (1 - x9[0] - x9[8]) * 100 };
}

// ================================================================ 6. Merton anchor
function merton() {
  const premium = MU9[1] - RF / 100;
  const variance = S9[1][1];
  const hv = (H.annual.stocks.vol / 100) ** 2;
  const hp = (H.annual.stocks.arith - H.annual.bills.arith) / 100;
  const rows = A.gammaGrid.map((g) => ({ gamma: g, today: (premium / (g * variance)) * 100, historical: (hp / (g * hv)) * 100 }));
  const muGrid = [];
  for (let m = 2.5; m <= 9.001; m += 0.25) muGrid.push(round(m, 2));
  const sens = Object.fromEntries([2, 4, 8].map((g) => [g, muGrid.map((m) => Math.max(0, Math.min(100, ((m - RF) / 100 / (g * variance)) * 100)))]));
  // The risk aversion at which the classic inputs produce the classic portfolios.
  const implied = Object.fromEntries([100, 80, 60, 40, 20].map((s) => [s, hp / ((s / 100) * hv)]));
  return { premium: premium * 100, vol: Math.sqrt(variance) * 100, histPremium: hp * 100, histVol: Math.sqrt(hv) * 100, rows, muGrid, sens, implied };
}
const M = merton();

// ================================================================ 7. frontiers
function frontier() {
  const risky = [1, 2, 3, 4, 5, 6, 7, 8];
  const S = risky.map((i) => risky.map((j) => S9[i][j]));
  const trace = (muAll, safe) => {
    const mu = risky.map((i) => muAll[i]);
    const pts = [];
    for (const g of [400, 200, 120, 80, 60, 45, 35, 28, 22, 18, 15, 12, 10, 8, 6.5, 5, 4, 3, 2.2, 1.6, 1.1, 0.7, 0.4, 0.2, 0.05]) {
      const x = solveQP({ mu, Sigma: S, gamma: g });
      pts.push([Math.sqrt(quad(S, x)) * 100, dot(mu, x) * 100]);
    }
    // Tangency: the risky mix of an investor who also holds some of the safe asset.
    let best = null;
    for (const p of pts) if (!best || (p[1] - safe) / p[0] > (best[1] - safe) / best[0]) best = p;
    const fine = [];
    for (let g = 0.5; g <= 60; g *= 1.04) {
      const x = solveQP({ mu, Sigma: S, gamma: g });
      const p = [Math.sqrt(quad(S, x)) * 100, dot(mu, x) * 100, x];
      if (!fine.length || (p[1] - safe) / p[0] > (fine[0][1] - safe) / fine[0][0]) fine[0] = p;
    }
    best = fine[0];
    return { pts: pts.map((p) => p.map((v) => round(v, 3))), tangency: { vol: best[0], mu: best[1], sharpe: (best[1] - safe) / best[0], weights: Object.fromEntries(risky.map((i, j) => [MODEL[i], round(best[2][j], 4)])) }, safe };
  };
  const today = trace(MU9, RF);
  const hist = trace(MODEL.map((k) => H.mu[k] / 100), H.safe);
  const assets = risky.map((i) => ({ id: MODEL[i], vol: Math.sqrt(S9[i][i]) * 100, today: MU9[i] * 100, hist: H.mu[MODEL[i]] }));
  return { today, hist, assets };
}
const F = frontier();

// ================================================================ 8. lifecycle
const LC = A.lifecycle;
const SAVE = A.savingsRate.value;
const byAge = I.census.byAge;
const earnCurve = [[29.5, byAge['25-34'].median], [39.5, byAge['35-44'].median], [49.5, byAge['45-54'].median], [59.5, byAge['55-64'].median]];
const earnings = (age) => interp(earnCurve, age + 0.5);
// Unisex survival from the SSA period table: average of the male and female probabilities.
const qx = I.ssa.age.map((_, i) => (I.ssa.qMale[i] + I.ssa.qFemale[i]) / 2);
function survival(from, to, q = qx) {
  let s = 1;
  for (let a = from; a < to; a++) s *= 1 - q[Math.min(a, q.length - 1)];
  return s;
}
const ERP = MU9[1] - RF / 100;
/**
 * Human capital at `age`, for the retirement portfolio: the present value of the part
 * of future pay that will be saved (`share` of pay each year to retirement), weighted
 * by the chance of being alive to earn it and discounted on the real Treasury curve,
 * plus beta times the equity premium for the share of pay that behaves like stocks.
 * With a fixed saving rate this is exactly the wealth that is still to arrive in the
 * portfolio; share = 1 counts all pay, for an investor who would cut spending instead.
 */
function humanCapital(age, beta, retire = LC.retireAge, share = SAVE) {
  let h = 0;
  for (let t = age; t < retire; t++) {
    const horizon = t - age + 0.5;
    const rate = interp(realCurve, horizon) / 100 + beta * ERP;
    h += (share * earnings(t) * Math.sqrt(survival(age, t) * survival(age, t + 1))) / (1 + rate) ** horizon;
  }
  return h;
}

function lifecycle() {
  const ages = [];
  for (let a = LC.startAge; a <= LC.retireAge; a++) ages.push(a);
  const paths = {};
  for (const [income, beta] of Object.entries(A.incomeBeta)) {
    if (income.startsWith('_')) continue;
    paths[income] = {};
    for (const g of A.gammaGrid) {
      let f = 0;
      const rows = [];
      for (const a of ages) {
        const h = a < LC.retireAge ? humanCapital(a, beta) : 0;
        const k = f + h > 0 ? f / (f + h) : 1;
        const x = allocate(g, Math.max(k, 1e-6), a < LC.retireAge ? beta : 0);
        const st = stats(x);
        rows.push({ age: a, f, h, k, x, ...st });
        if (a < LC.retireAge) f = f * (1 + st.mu / 100) + SAVE * earnings(a);
      }
      paths[income][g] = rows;
    }
  }
  return { ages, paths };
}
const LIFE = lifecycle();

function reason(row, g, income) {
  const [tips, eq] = row.x;
  const beta = A.incomeBeta[income];
  const alone = M.premium / 100 / (g * S9[1][1]);
  const hcTimes = (1 - row.k) / Math.max(row.k, 1e-6);
  if (eq > 0.97) return `Future savings are worth ${round(hcTimes, 1)} times the portfolio${beta === 0 ? ' and act like a bond' : ''}. The no-leverage limit binds.`;
  // "More than" only when the portfolio really holds no stock; one decimal if the two would print the same.
  const used = beta * (1 - row.k) * 100;
  const dp = round(used, 0) === round(alone * 100, 0) ? 1 : 0;
  if (beta > 0 && eq < 0.0005) return `The paycheck already supplies ${round(used, dp)}% of retirement wealth in stock risk, more than the ${round(alone * 100, dp)}% this investor wants.`;
  if (row.k < 0.7 && beta === 0) return `Future savings are ${round((1 - row.k) * 100, 0)}% of retirement wealth, so the portfolio holds ${round(eq / alone, 1)} times the stand-alone ${round(alone * 100, 0)}% stock share.`;
  if (beta > 0 && (row.k < 0.7 || eq < 0.03)) return `The paycheck uses up ${round(used, dp)} points of the ${round(alone * 100, dp)}% stock budget; the portfolio holds the rest.`;
  if (tips > 0.6) return `Little human capital is left. At a ${round(M.premium, 1)}-point premium the stand-alone stock share is ${round(alone * 100, 0)}%.`;
  return `Savings dominate; the mix is close to the stand-alone optimum of ${round(alone * 100, 0)}% stocks.`;
}

function matrix() {
  const out = [];
  for (const [band, age] of [['25-34', 30], ['35-44', 40], ['45-54', 50], ['55-64', 60], ['At 65', 65]]) {
    for (const g of [2, 4, 8]) {
      for (const income of ['stable', 'cyclical', 'stockLike']) {
        const row = LIFE.paths[income][g].find((r) => r.age === age);
        out.push({ band, age, gamma: g, income, k: row.k, wealthYears: row.f / earnings(age), weights: Object.fromEntries(MODEL.map((m, i) => [m, round(row.x[i] * 100, 1)])), mu: row.mu, vol: row.vol, volMtm: row.volMtm, loss1in100: row.loss1in100, drawdown: row.drawdown, drawdownMtm: row.drawdownMtm, reason: reason(row, g, income) });
      }
    }
  }
  return out;
}
const MATRIX = matrix();

// ================================================================ 9. retirement
function ladderRate(curve, years, start = true) {
  const d = discountFactors(curve, years);
  let a = 0;
  for (let n = 1; n <= years; n++) a += d[n];
  return start ? 1 / (1 + a - d[years]) : 1 / a;
}
function retirement() {
  const d = discountFactors(realCurve, 45);
  const A_ = (n) => sum(d.slice(1, n + 1));
  const byYears = Object.fromEntries([20, 25, 30, 35, 40].map((n) => [n, { start: (1 / (1 + A_(n - 1))) * 100, end: (1 / A_(n)) * 100 }]));
  const flat = [];
  for (let y = -1; y <= 4.001; y += 0.25) flat.push([round(y, 2), ladderRate([[1, y], [30, y]], 30) * 100]);
  // What a 30-payment ladder paid at each month-end real curve since 2003.
  const rm = I.treasury.realMonthEnd;
  const hist = [];
  rm.months.forEach((m, i) => {
    const pts = [[5, rm['5 YR'][i]], [7, rm['7 YR'][i]], [10, rm['10 YR'][i]], [20, rm['20 YR'][i]], [30, rm['30 YR'][i]]].filter((p) => p[1] !== null && p[1] !== undefined);
    if (pts.length >= 4) hist.push([m, ladderRate(pts, 30) * 100, pts.find((p) => p[0] === 10)[1]]);
  });
  const alive = (from, to, q) => survival(from, to, q) * 100;
  const surv = {};
  for (const age of [85, 90, 95, 100]) {
    const m = alive(65, age, I.ssa.qMale);
    const f = alive(65, age, I.ssa.qFemale);
    surv[age] = { male: m, female: f, either: (1 - (1 - m / 100) * (1 - f / 100)) * 100 };
  }
  // Fair price of $1 a year of real income for life from 65 (first payment now), unisex.
  let annuity = 0;
  for (let t = 0; t <= 54; t++) annuity += survival(65, 65 + t) * d[Math.min(t, 45)] * (t <= 45 ? 1 : (d[45] / d[44]) ** (t - 45));
  // Retirees by funded ratio: the floor goes into the ladder, the surplus is invested like any other wealth.
  const retirees = [];
  for (const fr of [0.8, 1, 1.25, 1.5, 2, 3]) {
    for (const g of [2, 4, 8]) {
      const floor = Math.min(1, 1 / fr);
      const xs = allocate(g, 1, 0);
      const x = xs.map((v, i) => (1 - floor) * v + (i === 0 ? floor : 0));
      const st = stats(x);
      retirees.push({ fr, gamma: g, floor: floor * 100, weights: Object.fromEntries(MODEL.map((m, i) => [m, round(x[i] * 100, 1)])), ...st, spend: fr >= 1 ? null : fr * 100 });
    }
  }
  return { d: d.slice(0, 41).map((v) => round(v, 5)), byYears, flat, hist, surv, annuityFactor: annuity, annuityRate: (1 / annuity) * 100, retirees, first10Share: (1 + A_(9)) / (1 + A_(29)) };
}
const RET = retirement();

// ---------------------------------------------------------------- sensitivities
function sensitivities() {
  const zeroTips = (S) => S.map((row, i) => row.map((v, j) => (i === 0 || j === 0 ? 0 : v)));
  const named = (x) => Object.fromEntries(MODEL.map((m, i) => [m, round(x[i] * 100, 1)]));
  // Same expected returns, three estimation windows for risk (gamma 4, no human capital).
  const windows = {};
  for (const w of ['recent', 'long', 'before']) {
    const S = mapCov(RISK[w].shrunk);
    const x = allocate(4, 1, 0, MU9, zeroTips(S), EVERY);
    windows[w] = { weights: named(x), eqVol: Math.sqrt(S[1][1]) * 100, corrStockLongBond: S[1][6] / Math.sqrt(S[1][1] * S[6][6]), merton: (ERP / (4 * S[1][1])) * 100 };
  }
  // No shrinkage at all.
  const raw = mapCov(RISK.recent.sample);
  windows.recentUnshrunk = { weights: named(allocate(4, 1, 0, MU9, zeroTips(raw), EVERY)), eqVol: Math.sqrt(raw[1][1]) * 100, corrStockLongBond: raw[1][6] / Math.sqrt(raw[1][1] * raw[6][6]), merton: (ERP / (4 * raw[1][1])) * 100 };
  // Historical-average expected returns with today's risk: what the classic inputs prescribe.
  const histMu = MODEL.map((k) => (k === 'tips' ? H.safe : H.mu[k]) / 100);
  const classic = Object.fromEntries([2, 4, 8].map((g) => [g, named(allocate(g, 1, 0, histMu, S9opt, EVERY))]));
  // Regions as three separate assets, each at its own valuation-implied return.
  const S11opt = zeroTips(S11);
  const regional = {};
  for (const g of [2, 4, 8]) {
    const x = solveQP({ mu: MU11, Sigma: S11opt, gamma: g });
    regional[g] = Object.fromEntries(SIM.map((m, i) => [m, round(x[i] * 100, 1)]));
  }
  // Equity share at 30 and 45 as pay becomes more stock-like.
  const betas = [];
  for (let b = 0; b <= 0.6001; b += 0.05) betas.push(round(b, 2));
  const k30 = LIFE.paths.stable[4].find((r) => r.age === 30).k;
  const k45 = LIFE.paths.stable[4].find((r) => r.age === 45).k;
  const betaSweep = { betas, k30, k45, age30: Object.fromEntries([2, 4, 8].map((g) => [g, betas.map((b) => round(allocate(g, k30, b)[1] * 100, 1))])), age45: Object.fromEntries([2, 4, 8].map((g) => [g, betas.map((b) => round(allocate(g, k45, b)[1] * 100, 1))])) };
  // Two more glide paths for a balanced investor with stable pay.
  const glide = (alone, growth, share) => {
    let f = 0;
    const out = [];
    for (let a = LC.startAge; a <= LC.retireAge; a++) {
      const h = a < LC.retireAge ? humanCapital(a, 0, LC.retireAge, share) : 0;
      const k = f + h > 0 ? f / (f + h) : 1;
      const x = Math.max(0, Math.min(1, alone / Math.max(k, 1e-9)));
      out.push(round(x * 100, 1));
      f = f * (1 + growth(x)) + SAVE * earnings(a);
    }
    return out;
  };
  const aloneNow = (g) => ERP / (g * S9[1][1]);
  const hp = (H.annual.stocks.arith - H.annual.bills.arith) / 100;
  const aloneHist = (g) => hp / (g * (H.annual.stocks.vol / 100) ** 2);
  const allPay = Object.fromEntries([2, 4, 8].map((g) => [g, glide(aloneNow(g), (x) => RF / 100 + x * ERP, 1)]));
  const classicGlide = Object.fromEntries([2, 4, 8].map((g) => [g, glide(aloneHist(g), (x) => H.annual.bills.arith / 100 + x * hp, SAVE)]));
  return { windows, classic, regional, betaSweep, allPay, classicGlide };
}
const SENS = sensitivities();

// ================================================================ 10. liquidity budget
function liquidity() {
  // Worst real peak-to-trough loss of global stocks at market weights since July 1990.
  const months = monthRange('1990-07', A.windows.recent[1]);
  let v = 1;
  let peak = 1;
  let dd = 0;
  let trough = '';
  for (const m of months) {
    v *= 1 + dot(EQW, [R.real.us.get(m), R.real.intl.get(m), R.real.em.get(m)]);
    peak = Math.max(peak, v);
    if (v / peak - 1 < dd) {
      dd = v / peak - 1;
      trough = m;
    }
  }
  const D = -dd;
  const reserveMonths = { stable: 6, cyclical: 12, stockLike: 24 };
  const rows = [];
  for (const [income, months_] of Object.entries(reserveMonths)) {
    for (const age of [30, 45, 60]) {
      const row = LIFE.paths[income][4].find((r) => r.age === age);
      const spend = (1 - SAVE) * earnings(age);
      const reserve = (months_ / 12) * spend;
      const risky = 1 - row.x[0] - row.x[8];
      const budget = row.f > 0 ? Math.max(0, 1 - reserve / row.f / (1 - D * risky)) : 0;
      rows.push({ who: `Saver, age ${age}, ${A.incomeLabels[income].toLowerCase()}`, wealthYears: row.f / earnings(age), needShare: (reserve / row.f) * 100, risky: risky * 100, budget: budget * 100 });
    }
  }
  for (const fr of [1, 1.5, 2]) {
    const r = RET.retirees.find((x) => x.fr === fr && x.gamma === 4);
    const risky = r.risky / 100;
    const need = RET.first10Share / fr;
    rows.push({ who: `Retiree, funded ratio ${fr.toFixed(2)}`, wealthYears: null, needShare: need * 100, risky: risky * 100, budget: Math.max(0, 1 - need / (1 - D * risky)) * 100 });
  }
  return { drawdown: D * 100, trough, reserveMonths, rows };
}
const LIQ = liquidity();

// ================================================================ 11. Monte Carlo
// Target-date benchmark: issuer-reported holdings by vintage, mapped to the model's classes.
function tdfPath() {
  const exUs = [EQW[1] / (EQW[1] + EQW[2]), EQW[2] / (EQW[1] + EQW[2])];
  const pts = [];
  for (const [vintage, h] of Object.entries(I.targetDate.byVintage)) {
    const age = vintage === 'Income' ? 76 : 65 - (Number(vintage) - 2026);
    const w = Object.fromEntries(SIM.map((s) => [s, 0]));
    for (const [sym, , pct] of h.holdings) {
      const p = pct / 100;
      if (sym === 'VSMPX') w.us += p;
      else if (sym === 'VGTSX') {
        w.intl += p * exUs[0];
        w.em += p * exUs[1];
      } else if (sym === 'VTBIX' || sym === 'VTILX') w.tsyInt += p;
      else if (sym === 'VTAPX') w.tips += p;
      else w.cash += p;
    }
    const tot = sum(Object.values(w));
    pts.push({ vintage, age, asOf: h.asOf, equity: ((w.us + w.intl + w.em) / tot) * 100, w: SIM.map((s) => w[s] / tot) });
  }
  pts.sort((a, b) => a.age - b.age);
  const at = (age) => {
    if (age <= pts[0].age) return pts[0].w;
    if (age >= pts.at(-1).age) return pts.at(-1).w;
    const i = pts.findIndex((p) => p.age >= age);
    const t = (age - pts[i - 1].age) / (pts[i].age - pts[i - 1].age);
    return pts[i].w.map((v, j) => pts[i - 1].w[j] + t * (v - pts[i - 1].w[j]));
  };
  return { pts, at };
}
const TDF = tdfPath();
const fixed = (o) => SIM.map((s) => o[s] ?? 0);
const BENCH = {
  sixtyForty: { name: '60/40', at: () => fixed({ us: 0.6, tsyInt: 0.4 }) },
  tdf: { name: 'Target-date', at: (age) => TDF.at(age) },
  stocks: { name: '100% stocks', at: () => fixed({ us: 1 }) },
  ageInBonds: { name: 'Age in bonds', at: (age) => fixed({ us: Math.max(0, 1 - age / 100), tsyInt: Math.min(1, age / 100) }) },
};

function simulate() {
  const N = A.monteCarlo.paths;
  const u = rng(A.monteCarlo.seed);
  const z = normalSource(u);
  const Lc = cholesky(S11.map((row) => row.map((v) => v / 12)));
  const scale = Math.sqrt((NU - 2) / NU);
  const n = SIM.length;
  const draw = () => {
    // Multivariate Student-t with NU degrees of freedom, scaled to the target covariance.
    let chi = 0;
    for (let i = 0; i < NU; i++) chi += z() ** 2;
    const mix = scale / Math.sqrt(chi / NU);
    const e = new Array(n);
    for (let i = 0; i < n; i++) e[i] = z();
    const r = new Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j <= i; j++) s += Lc[i][j] * e[j];
      r[i] = Math.max(-0.9, MU11[i] / 12 + s * mix); // a month cannot lose more than everything
    }
    return r;
  };

  const gammas = [2, 4, 8];
  const incomes = ['stable', 'stockLike'];
  // Policy tables: model weights (eleven assets) on a grid of k = F / (F + H).
  const KN = 100;
  const policy = {};
  for (const inc of incomes) for (const g of gammas) policy[`${inc}|${g}`] = Array.from({ length: KN + 1 }, (_, i) => expand(allocate(g, Math.max(i / KN, 1e-6), A.incomeBeta[inc])));
  const retired = Object.fromEntries(gammas.map((g) => [g, allocate(g, 1, 0)]));
  const hBase = {};
  for (const inc of incomes) hBase[inc] = Array.from({ length: LC.retireAge - LC.startAge }, (_, i) => humanCapital(LC.startAge + i, A.incomeBeta[inc]));

  const dR = discountFactors(realCurve, 45);
  const ladderDue = 1 + sum(dR.slice(1, LC.ladderYears));
  const rf = RF / 100;
  const due = (years) => (1 - (1 + rf) ** -years) / (1 - 1 / (1 + rf)); // annuity-due factor at the 10-year real yield
  const surv = Array.from({ length: LC.ladderYears }, (_, t) => survival(LC.retireAge, LC.retireAge + t));
  const survSum = sum(surv);

  // Tracks: for each income type, the model at three risk aversions plus four benchmarks.
  const tracks = [];
  for (const inc of incomes) {
    for (const g of gammas) tracks.push({ inc, kind: 'model', g, name: 'Model' });
    for (const [id, b] of Object.entries(BENCH)) tracks.push({ inc, kind: id, name: b.name });
  }
  // Robustness: the model's weights, but its TIPS held as a constant 10-year fund while saving.
  tracks.push({ inc: 'stable', kind: 'modelFund', g: 4, name: 'Model, TIPS in a 10-year fund' });
  const isModel = (t) => t.kind === 'model' || t.kind === 'modelFund';
  const res = tracks.map(() => ({ w65: new Float64Array(N), avgSpend: new Float64Array(N), minSpend: new Float64Array(N), util: Object.fromEntries(gammas.map((g) => [g, new Float64Array(N)])) }));
  const tipsOnly = Object.fromEntries(incomes.map((inc) => [inc, new Float64Array(N)]));
  const fanAges = LC.retireAge - LC.startAge + 1;
  const fan = { model: Array.from({ length: fanAges }, () => new Float64Array(N)), tdf: Array.from({ length: fanAges }, () => new Float64Array(N)) };
  const fanModel = tracks.findIndex((t) => t.inc === 'stable' && t.kind === 'model' && t.g === 4);
  const fanTdf = tracks.findIndex((t) => t.inc === 'stable' && t.kind === 'tdf');
  const finalPay = earnings(LC.retireAge - 1);

  // Fixed-withdrawal test from 65: share of paths that run out before 30 payments.
  const rates = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
  const ruinStrats = { sixtyForty: BENCH.sixtyForty.at, tdf: BENCH.tdf.at, stocks: BENCH.stocks.at };
  const ruin = Object.fromEntries(Object.keys(ruinStrats).map((k) => [k, rates.map(() => 0)]));

  for (let p = 0; p < N; p++) {
    const wealth = tracks.map(() => 0);
    const zInc = { stable: 1, stockLike: 1 };
    const tipsW = { stable: 0, stockLike: 0 };
    // ---- saving years
    for (let a = LC.startAge; a < LC.retireAge; a++) {
      const yi = a - LC.startAge;
      if (fanModel >= 0) {
        fan.model[yi][p] = wealth[fanModel];
        fan.tdf[yi][p] = wealth[fanTdf];
      }
      const w = tracks.map((t, i) => {
        if (!isModel(t)) return BENCH[t.kind].at(a);
        const h = hBase[t.inc][yi] * zInc[t.inc];
        const k = wealth[i] + h > 0 ? wealth[i] / (wealth[i] + h) : 0;
        const pos = Math.min(KN, Math.max(0, k * KN));
        const lo = Math.floor(pos);
        const hi = Math.min(KN, lo + 1);
        const tab = policy[`${t.inc}|${t.g}`];
        return tab[lo].map((v, j) => v + (pos - lo) * (tab[hi][j] - v));
      });
      let eqYear = 1;
      for (let m = 0; m < 12; m++) {
        const r = draw();
        eqYear *= 1 + EQW[0] * r[1] + EQW[1] * r[2] + EQW[2] * r[3];
        for (let i = 0; i < tracks.length; i++) {
          // The model holds TIPS that mature when the money is needed: they earn their real
          // yield whatever their interim price. Benchmark bond funds are marked to market.
          let pr = tracks[i].kind === 'model' ? w[i][0] * (rf / 12) : w[i][0] * r[0];
          for (let j = 1; j < n; j++) pr += w[i][j] * r[j];
          wealth[i] = wealth[i] * (1 + pr) + (SAVE * earnings(a) * zInc[tracks[i].inc]) / 12;
        }
        for (const inc of incomes) tipsW[inc] = tipsW[inc] * (1 + rf / 12) + (SAVE * earnings(a) * zInc[inc]) / 12;
      }
      // Stock-like pay moves with the stock market: a permanent shock of beta times the surprise.
      zInc.stockLike = Math.max(0.2, zInc.stockLike * (1 + A.incomeBeta.stockLike * (eqYear - 1 - MU9[1])));
    }
    if (fanModel >= 0) {
      fan.model[fanAges - 1][p] = wealth[fanModel];
      fan.tdf[fanAges - 1][p] = wealth[fanTdf];
    }
    // ---- spending years: thirty annual payments, the first at 65
    const pot = tracks.map((t, i) => {
      res[i].w65[p] = wealth[i];
      if (!isModel(t)) return { risky: wealth[i], ladder: 0 };
      const x = retired[t.g];
      return { risky: wealth[i] * (1 - x[0]), ladder: (wealth[i] * x[0]) / ladderDue };
    });
    const riskyW = tracks.map((t) => {
      if (!isModel(t)) return null;
      const x = retired[t.g];
      const rest = 1 - x[0];
      return rest > 1e-9 ? expand(x.map((v, i) => (i === 0 ? 0 : v / rest))) : expand(x);
    });
    const spendSum = tracks.map(() => 0);
    const spendMin = tracks.map(() => Infinity);
    const utils = tracks.map(() => Object.fromEntries(gammas.map((g) => [g, 0])));
    const fixedW = Object.fromEntries(Object.keys(ruinStrats).map((k) => [k, rates.map(() => 1)]));
    const fixedDead = Object.fromEntries(Object.keys(ruinStrats).map((k) => [k, rates.map(() => false)]));
    for (let t = 0; t < LC.ladderYears; t++) {
      const age = LC.retireAge + t;
      const left = LC.ladderYears - t;
      const w = tracks.map((tr, i) => (isModel(tr) ? riskyW[i] : BENCH[tr.kind].at(age)));
      for (let i = 0; i < tracks.length; i++) {
        const c = pot[i].risky / due(left) + pot[i].ladder;
        pot[i].risky -= pot[i].risky / due(left);
        spendSum[i] += c;
        spendMin[i] = Math.min(spendMin[i], c);
        for (const g of gammas) utils[i][g] += surv[t] * c ** (1 - g);
      }
      for (const k of Object.keys(ruinStrats)) {
        rates.forEach((rate, ri) => {
          if (fixedDead[k][ri]) return;
          fixedW[k][ri] -= rate / 100;
          if (fixedW[k][ri] < 0) {
            fixedDead[k][ri] = true;
            ruin[k][ri]++;
          }
        });
      }
      const wf = { sixtyForty: BENCH.sixtyForty.at(age), tdf: BENCH.tdf.at(age), stocks: BENCH.stocks.at(age) };
      for (let m = 0; m < 12; m++) {
        const r = draw();
        for (let i = 0; i < tracks.length; i++) {
          let pr = 0;
          for (let j = 0; j < n; j++) pr += w[i][j] * r[j];
          pot[i].risky *= 1 + pr;
        }
        for (const k of Object.keys(ruinStrats)) {
          let pr = 0;
          for (let j = 0; j < n; j++) pr += wf[k][j] * r[j];
          for (let ri = 0; ri < rates.length; ri++) if (!fixedDead[k][ri]) fixedW[k][ri] *= 1 + pr;
        }
      }
    }
    for (let i = 0; i < tracks.length; i++) {
      res[i].avgSpend[p] = spendSum[i] / LC.ladderYears;
      res[i].minSpend[p] = spendMin[i];
      for (const g of gammas) res[i].util[g][p] = utils[i][g];
    }
    for (const inc of incomes) tipsOnly[inc][p] = tipsW[inc] / ladderDue;
  }

  const q = (arr, ps) => {
    const s = Array.from(arr).sort((a, b) => a - b);
    return ps.map((pp) => percentile(s, pp));
  };
  const groups = [];
  for (const inc of incomes) {
    for (const g of gammas) {
      const rows = [];
      for (const [i, t] of tracks.entries()) {
        if (t.inc !== inc || (isModel(t) && t.g !== g)) continue;
        const ce = (mean(Array.from(res[i].util[g])) / survSum) ** (1 / (1 - g));
        let short = 0;
        for (let p = 0; p < N; p++) if (res[i].avgSpend[p] < tipsOnly[inc][p]) short++;
        const w = q(res[i].w65, [0.05, 0.25, 0.5, 0.75, 0.95]).map((v) => v / finalPay);
        const s = q(res[i].avgSpend, [0.05, 0.5, 0.95]).map((v) => (v / finalPay) * 100);
        rows.push({ id: t.kind, name: t.name, w65: w, spend: s, worstYear: q(res[i].minSpend, [0.05])[0] / finalPay * 100, shortfall: (short / N) * 100, ce: (ce / finalPay) * 100 });
      }
      const model = rows.find((r) => r.id === 'model');
      for (const r of rows) r.ceGain = (model.ce / r.ce - 1) * 100;
      groups.push({ income: inc, gamma: g, tipsOnly: (mean(Array.from(tipsOnly[inc])) / finalPay) * 100, rows });
    }
  }
  const ages = Array.from({ length: fanAges }, (_, i) => LC.startAge + i);
  const band = (arrs) => [0.05, 0.25, 0.5, 0.75, 0.95].map((pp) => arrs.map((a) => q(a, [pp])[0] / finalPay));
  const ladder = RET.byYears[30].start;
  return {
    paths: N,
    nu: NU,
    groups,
    fan: { ages, model: band(fan.model), tdf: band(fan.tdf) },
    ruin: { rates, ...Object.fromEntries(Object.entries(ruin).map(([k, v]) => [k, v.map((c) => (c / N) * 100)])), ladder: rates.map((r) => (r <= ladder + 1e-9 ? 0 : 100)) },
    finalPay,
  };
}
const t0 = Date.now();
const MC = simulate();
const simSeconds = (Date.now() - t0) / 1000;

// ================================================================ 12. my own portfolio
function mine() {
  const CLS = ['us', 'intl', 'em', 'reit', 'bonds', 'gold', 'private', 'single', 'cash'];
  const exUs = { intl: EQW[1] / (EQW[1] + EQW[2]), em: EQW[2] / (EQW[1] + EQW[2]) };
  const look = (h) => {
    if (h.look === 'global') return { us: EQW[0], intl: EQW[1], em: EQW[2] };
    if (h.look === 'exUs') return exUs;
    if (h.look === 'schwab2065') {
      const o = { us: 0, intl: 0, em: 0, reit: 0, bonds: 0, cash: 0 };
      for (const [sym, , pct] of I.targetDate.schwab2065.holdings) {
        const key = { SCHX: 'us', SCHA: 'us', SCHF: 'intl', SCHE: 'em', SCHH: 'reit', SCHZ: 'bonds' }[sym] ?? 'cash';
        o[key] += pct / 100;
      }
      return o;
    }
    return h.look;
  };
  const total = sum(ME.holdings.map((h) => h.weight));
  const holdings = ME.holdings.map((h) => ({ ...h, weight: (h.weight / total) * 100, look: look(h) }));
  const classes = (hs, scale = 1) => {
    const o = Object.fromEntries(CLS.map((c) => [c, 0]));
    for (const h of hs) for (const [k, v] of Object.entries(h.look)) o[k] += h.weight * v * scale;
    return o;
  };
  const viewA = classes(holdings);
  const emp = ME.viewB.employerStockPct;
  const viewB = { ...classes(holdings, 1 - emp / 100), employer: emp };
  const tilt = holdings.filter((h) => h.tilt && ['leveraged single stock', 'sector', 'single stock', 'factor'].includes(h.tilt));
  const equityA = viewA.us + viewA.intl + viewA.em + viewA.reit + viewA.single + viewA.private;

  // Target: the model's portfolio for his group, on the investable portfolio (bank cash stays a reserve).
  const g = ME.profile.gamma;
  const beta = A.incomeBeta[ME.profile.income];
  const row = LIFE.paths[ME.profile.income][g].find((r) => r.age === ME.profile.modelAge);
  const reserve = ME.plan.bankCashIsReserve ? (holdings.find((h) => h.bankShare)?.bankShare / total) * 100 : 0;
  const x = row.x;
  const inv = 100 - reserve;
  const target = { us: x[1] * EQW[0] * inv, intl: x[1] * EQW[1] * inv, em: x[1] * EQW[2] * inv, reit: x[2] * inv, bonds: (x[0] + x[3] + x[4] + x[5] + x[6]) * inv, gold: x[7] * inv, private: 0, single: 0, cash: reserve + x[8] * inv };
  // The corner (all risky) holds while financial wealth is below this many years of pay.
  const mertonShare = M.premium / 100 / (g * S9[1][1]);
  let cornerK = 0;
  for (let k = 0.01; k <= 1; k += 0.005) if (allocate(g, k, beta)[1] > 0.995) cornerK = k;
  const h25 = humanCapital(ME.profile.modelAge, beta);
  const cornerYears = ((cornerK / (1 - cornerK)) * h25) / earnings(ME.profile.modelAge);

  // Risk of the listed tilts, measured on public prices over the recent window.
  const [wa, wb] = A.windows.recent;
  const pr = I.prices.series;
  const ret = (tk) => {
    const s = pr[tk];
    const m = new Map();
    for (let i = 1; i < s.months.length; i++) m.set(s.months[i], s.close[i] / s.close[i - 1] - 1);
    return m;
  };
  const priceStats = {};
  for (const tk of Object.keys(pr)) {
    const rr = ret(tk);
    const months = monthRange(wa, wb).filter((m) => rr.has(m));
    const r = months.map((m) => rr.get(m));
    const mk = months.map((m) => R.nominal.us.get(m));
    const big = r.filter((v) => Math.abs(v) > 0.45).length;
    const b = correlation(r, mk) * (stdev(r) / stdev(mk));
    const resid = r.map((v, i) => v - b * mk[i]);
    priceStats[tk] = { months: months.length, from: months[0], vol: stdev(r) * Math.sqrt(12) * 100, beta: b, corr: correlation(r, mk), idio: stdev(resid) * Math.sqrt(12) * 100, jumps: big };
  }
  const usVol = Math.sqrt(S11[1][1]) * 100;
  // A 2x daily fund compounds at twice the stock's rate less sigma^2 a year (L^2 - L) / 2 * sigma^2.
  const drag = (priceStats.GOOGL.vol / 100) ** 2 * 100;
  // Employer stock: a typical single stock, from Campbell, Lettau, Malkiel and Xu (2001), Table 3.
  const clmx = { mkt: 1.542, ind: 1.032, firm: 6.436 };
  const singleVol = Math.sqrt((clmx.mkt + clmx.ind + clmx.firm) / 100) * 100;
  const singleIdio = Math.sqrt((clmx.ind + clmx.firm) / 100) * 100;

  // Portfolio risk on a common scale: classes use the model's covariance; single names add their own risk.
  const idx = { us: 1, intl: 2, em: 3, reit: 4, bonds: 7, gold: 9, cash: 10 };
  const tiltW = tilt.filter((h) => h.look.single).map((h) => ({ tk: h.ticker, w: h.weight * h.look.single }));
  const tiltIdioVar = (scale) => sum(tiltW.map((t) => ((t.w * scale) / 100) ** 2 * (priceStats[t.tk === 'GGLL' ? 'GOOGL' : t.tk].idio / 100) ** 2)) +
    2 * ((tiltW.find((t) => t.tk === 'GGLL').w * scale) / 100) * ((tiltW.find((t) => t.tk === 'GOOGL').w * scale) / 100) * (priceStats.GOOGL.idio / 100) ** 2;
  const tiltBeta = (tk) => priceStats[tk === 'GGLL' ? 'GOOGL' : tk].beta;
  const vol = (cls, opts = {}) => {
    const w = new Array(11).fill(0);
    for (const [k, i] of Object.entries(idx)) w[i] += (cls[k] ?? 0) / 100;
    w[1] += (cls.private ?? 0) / 100; // listed private-company fund treated as U.S. stocks
    let extra = 0;
    if (opts.tilts) {
      for (const t of tiltW) w[1] += ((t.w * opts.tilts) / 100) * tiltBeta(t.tk);
      extra += tiltIdioVar(opts.tilts);
    } else w[1] += (cls.single ?? 0) / 100;
    if (cls.employer) {
      w[1] += cls.employer / 100;
      extra += (cls.employer / 100) ** 2 * (singleIdio / 100) ** 2;
    }
    return Math.sqrt(quad(S11, w) + extra) * 100;
  };
  const muOf = (cls) => (cls.us * E.mu.us + cls.intl * E.mu.intl + cls.em * E.mu.em + cls.reit * E.mu.reit + cls.bonds * E.mu.tsyInt + cls.gold * E.mu.gold + (cls.private ?? 0) * E.mu.us + (cls.single ?? 0) * E.mu.us + cls.cash * E.mu.cash + (cls.employer ?? 0) * E.mu.us) / 100;
  const risk = {
    viewA: { mu: muOf(viewA), vol: vol(viewA, { tilts: 1 }), volNoTilt: vol(viewA) },
    viewB: { mu: muOf(viewB), vol: vol(viewB, { tilts: 1 - emp / 100 }) },
    target: { mu: muOf(target), vol: vol(target) },
  };
  // Share of View B variance that comes from the employer stock's own (firm-specific) risk.
  risk.viewB.employerShareOfVariance = (((emp / 100) ** 2 * (singleIdio / 100) ** 2) / (risk.viewB.vol / 100) ** 2) * 100;

  // The extra return a position must earn to justify its own risk: alpha = gamma * k * w * sigma_idio^2,
  // where w is the position's share of financial wealth and k financial wealth's share of total wealth.
  const tiltExposure = sum(tiltW.map((t) => t.w));
  const tiltIdioVol = Math.sqrt(tiltIdioVar(1)) / (tiltExposure / 100) * 100;
  const hurdle = (w, idio, k) => g * k * (w / 100) * (idio / 100) ** 2 * 100;
  const hurdles = [0.1, 0.25, 0.5, 1].map((k) => ({ k, tilt: hurdle(tiltExposure, tiltIdioVol, k), employer: hurdle(emp, singleIdio, k) }));

  // ---- transition: quarterly steps
  const plan = ME.plan;
  const Q = plan.quarters;
  const gap0 = Object.fromEntries(CLS.map((c) => [c, target[c] - viewA[c]]));
  const taxFree = sum(ME.accounts.filter((a) => a.taxFree).map((a) => a.weight)) * (100 / total);
  const roth = (ME.accounts.find((a) => a.id === 'roth').weight / total) * 100;
  const cashHolding = holdings.find((h) => h.bankShare);
  const brokerageCash = cashHolding.weight - (cashHolding.bankShare / total) * 100;
  const ggll = holdings.find((h) => h.ticker === 'GGLL').weight;
  const needAbroad = gap0.intl + gap0.em;
  // International money comes first from sources that cost no tax: idle brokerage cash, the
  // proceeds of the leveraged fund (sold for its own reasons), then exchanges inside the Roth IRA.
  const fromRoth = Math.min(roth, Math.max(0, needAbroad - brokerageCash - ggll));
  // Break-even: selling the leveraged fund costs tax once; holding it costs the drag every year.
  const taxRate = plan.capitalGainsTaxRate;
  const breakEvenYears = [0.25, 0.5, 1].map((gain) => ({ gainShare: gain * 100, years: (taxRate * gain * 100) / drag }));
  const idioOf = (tk) => priceStats[tk === 'GGLL' ? 'GOOGL' : tk].idio / 100;
  /** Firm-specific variance of the single-name positions; GGLL and GOOGL are the same stock. */
  const idioVar = (pos, size) => {
    const goog = ((pos.GGLL ?? 0) + (pos.GOOGL ?? 0)) / size;
    return goog ** 2 * idioOf('GOOGL') ** 2 + ((pos.NOW ?? 0) / size) ** 2 * idioOf('NOW') ** 2 + ((pos.SMH ?? 0) / size) ** 2 * idioOf('SMH') ** 2;
  };

  const path = (contrib) => {
    // State by class, in percent of today's liquid portfolio (View A = 100). Employer stock rides on top.
    const cur = { ...viewA };
    const pos = Object.fromEntries(tiltW.map((t) => [t.tk, t.w])); // single-name exposure
    let size = 100;
    let employer = (emp / (100 - emp)) * 100;
    const rows = [];
    /** Target in percent of the liquid portfolio at its current size (the cash reserve is a fixed amount). */
    const targetAt = () => {
      const t = Object.fromEntries(CLS.map((c) => [c, c === 'cash' ? 0 : (target[c] / (100 - reserve)) * (100 - (reserve / size) * 100)]));
      t.cash = (reserve / size) * 100 + (x[8] * (size - reserve) * 100) / size;
      return t;
    };
    const snapshot = (qn, note) => {
      const tot = size + employer;
      const target = targetAt();
      const a = Object.fromEntries(CLS.map((c) => [c, (cur[c] / size) * 100]));
      // Tracking error against the target: class weights through the model's covariance, plus firm-specific risk.
      const w = new Array(11).fill(0);
      for (const [k, i] of Object.entries(idx)) w[i] += (a[k] - target[k]) / 100;
      w[1] += (a.private - target.private) / 100;
      for (const t of Object.keys(pos)) w[1] += (pos[t] / size) * tiltBeta(t);
      const te = Math.sqrt(Math.max(0, quad(S11, w)) + idioVar(pos, size)) * 100;
      const wB = w.map((v) => v * (size / tot));
      wB[1] += employer / tot;
      const teB = Math.sqrt(Math.max(0, quad(S11, wB)) + idioVar(pos, tot) + (employer / tot) ** 2 * (singleIdio / 100) ** 2) * 100;
      const offTarget = sum(CLS.map((c) => Math.abs(a[c] - target[c]))) / 2;
      rows.push({ q: qn, note, target: Object.fromEntries(CLS.map((c) => [c, round(target[c], 2)])), a: Object.fromEntries(CLS.map((c) => [c, round(a[c], 2)])), b: { ...Object.fromEntries(CLS.map((c) => [c, round((cur[c] / tot) * 100, 2)])), employer: round((employer / tot) * 100, 2) }, offTarget: round(offTarget, 2), te: round(te, 2), teB: round(teB, 2) });
    };
    snapshot(0, 'Today');
    /** Put up to `amount` into international and emerging stocks, in proportion to their shortfalls. */
    const moveAbroad = (amount) => {
      const t = targetAt();
      const si = Math.max(0, (t.intl * size) / 100 - cur.intl);
      const se = Math.max(0, (t.em * size) / 100 - cur.em);
      const m = Math.min(amount, si + se);
      if (m <= 1e-9) return 0;
      cur.intl += (m * si) / (si + se);
      cur.em += (m * se) / (si + se);
      return m;
    };
    for (let qn = 1; qn <= Q; qn++) {
      const notes = [];
      // 1. Exchange inside the Roth IRA: U.S. index fund into international index funds, an equal slice a quarter.
      const moved = moveAbroad(fromRoth / Q);
      cur.us -= moved;
      if (moved > 0.005) notes.push(`Roth exchange ${moved.toFixed(1)}`);
      if (qn <= 4) {
        // 2. Idle brokerage cash goes to work over the first year.
        const c = moveAbroad(brokerageCash / 4);
        cur.cash -= c;
        if (c > 0.005) notes.push(`cash ${c.toFixed(1)}`);
        // 3. The leveraged fund is sold over the first year; its proceeds buy the global index.
        const sold = ggll / 4;
        pos.GGLL -= sold * 2;
        cur.single -= sold * 2;
        cur.cash += sold; // the fund's embedded borrowing unwinds
        const m = moveAbroad(sold);
        cur.us += sold - m;
        notes.push(`sell leveraged fund ${sold.toFixed(1)}`);
      }
      // 4. New money, if any, goes to whatever is furthest below target.
      if (contrib) {
        size += contrib;
        const m = moveAbroad(contrib);
        cur.us += contrib - m;
        notes.push(`new money ${contrib.toFixed(1)}`);
      }
      // 5. Employer stock is sold when it can be. The proceeds go first to whatever is below
      //    target (international and emerging stocks) and the rest into U.S. index funds.
      if (qn === plan.employerSaleQuarter && employer > 0) {
        const proceeds = employer;
        employer = 0;
        size += proceeds;
        const m = moveAbroad(proceeds);
        cur.us += proceeds - m;
        notes.push('employer stock sold and reinvested');
      }
      snapshot(qn, notes.join('; '));
    }
    return rows;
  };
  const base = path(plan.contribPerQuarterPct);
  const whatIf = plan.contribWhatIf.map((c) => ({ contrib: c, rows: path(c) }));

  return {
    asOf: ME.asOf,
    profile: { ...ME.profile, beta, gammaLabel: A.gammaLabels[g], incomeLabel: A.incomeLabels[ME.profile.income] },
    holdings: holdings.map((h) => ({ ticker: h.ticker, label: h.label, account: ME.accounts.find((a) => a.id === h.account)?.label ?? h.account, weight: round(h.weight, 2), weightB: round(h.weight * (1 - emp / 100), 2), tilt: h.tilt ?? null })),
    accounts: ME.accounts.map((a) => ({ ...a, weight: round((a.weight / total) * 100, 1) })),
    classes: CLS,
    viewA: Object.fromEntries(Object.entries(viewA).map(([k, v]) => [k, round(v, 2)])),
    viewB: Object.fromEntries(Object.entries(viewB).map(([k, v]) => [k, round(v, 2)])),
    equityA: round(equityA, 1),
    usShareOfEquityA: round(((viewA.us + viewA.single + viewA.private) / equityA) * 100, 1),
    tiltWeight: round(sum(tilt.map((h) => h.weight)), 1),
    tiltExposure: round(tiltExposure, 1),
    tiltIdioVol: round(tiltIdioVol, 1),
    reserve: round(reserve, 1),
    target: Object.fromEntries(Object.entries(target).map(([k, v]) => [k, round(v, 2)])),
    gap: Object.fromEntries(Object.entries(gap0).map(([k, v]) => [k, round(v, 2)])),
    mertonShare: round(mertonShare * 100, 1),
    cornerK: round(cornerK, 3),
    cornerYears: round(cornerYears, 2),
    priceStats: Object.fromEntries(Object.entries(priceStats).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, typeof b === 'number' ? round(b, 3) : b]))])),
    usVol: round(usVol, 1),
    drag: round(drag, 1),
    single: { vol: round(singleVol, 1), idio: round(singleIdio, 1), marketShare: round((clmx.mkt / (clmx.mkt + clmx.ind + clmx.firm)) * 100, 0), firmShare: round((clmx.firm / (clmx.mkt + clmx.ind + clmx.firm)) * 100, 0) },
    risk: Object.fromEntries(Object.entries(risk).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, round(b, 2)]))])),
    hurdles: hurdles.map((h) => ({ k: h.k, tilt: round(h.tilt, 2), employer: round(h.employer, 2) })),
    plan: { quarters: Q, employerSaleQuarter: plan.employerSaleQuarter, taxFree: round(taxFree, 1), roth: round(roth, 1), needAbroad: round(needAbroad, 1), fromRoth: round(fromRoth, 1), perQuarter: round(fromRoth / Q, 2), brokerageCash: round(brokerageCash, 2), ggll: round(ggll, 2), employerVsLiquid: round((emp / (100 - emp)) * 100, 1), taxRate, breakEvenYears: breakEvenYears.map((b) => ({ gainShare: b.gainShare, years: round(b.years, 2) })), contrib: plan.contribPerQuarterPct, base, whatIf: whatIf.map((w) => ({ contrib: w.contrib, final: w.rows.at(-1), q4: w.rows[4], q8: w.rows[8] })) },
    rvii: I.quotes.RVII,
    fund2065: { asOf: I.targetDate.schwab2065.asOf, holdings: I.targetDate.schwab2065.holdings, look: Object.fromEntries(Object.entries(look({ look: 'schwab2065' })).map(([k, v]) => [k, round(v * 100, 2)])) },
  };
}
const MINE = mine();

// ================================================================ output
const r2 = (v) => round(v, 2);
const data = {
  meta: {
    asOf: A.asOf,
    generated: I.generated,
    realCurveDate: T.real.date,
    nominalCurveDate: T.nominal.date,
    returnsThrough: A.windows.recent[1],
    cpiFilled: CPI.filled,
    splits: SPLITS,
    windows: Object.fromEntries(Object.entries(A.windows).map(([k, w]) => [k, { from: w[0], to: w[1], months: RISK[k].months, delta: round(RISK[k].delta, 3), rbar: round(RISK[k].rbar, 3) }])),
    sim: SIM,
    model: MODEL,
    names: NAMES,
    equityWeights: A.equityWeights,
    gammaGrid: A.gammaGrid,
    gammaLabels: A.gammaLabels,
    incomeBeta: Object.fromEntries(Object.entries(A.incomeBeta).filter(([k]) => !k.startsWith('_'))),
    incomeLabels: A.incomeLabels,
    savingsRate: SAVE,
    lifecycle: LC,
    nu: NU,
    t01: r2(T01),
  },
  curves: {
    real: realCurve,
    nominal: nomCurve.map(([m, y]) => [round(m, 3), y]),
    breakeven: [5, 7, 10, 20, 30].map((m) => [m, r2(breakeven(m))]),
    bill: E.bill,
    realThen: (() => {
      const rm = I.treasury.realMonthEnd;
      const i = rm.months.indexOf('2021-12');
      return { date: rm.dates[i], curve: [5, 7, 10, 20, 30].map((m) => [m, rm[`${m} YR`][i]]) };
    })(),
  },
  expected: {
    mu: Object.fromEntries(Object.entries(E.mu).map(([k, v]) => [k, r2(v)])),
    muExact: Object.fromEntries(Object.entries(E.mu).map(([k, v]) => [k, round(v, 6)])),
    premium: Object.fromEntries(Object.entries(E.mu).map(([k, v]) => [k, r2(v - RF)])),
    regions: Object.fromEntries(Object.entries(E.regions).map(([k, v]) => [k, { ...v, eyTrailing: r2(v.eyTrailing), eyForward: r2(v.eyForward), ey: r2(v.ey), ddm: r2(v.ddm), mu: r2(v.mu) }])),
    g: r2(E.g),
    gSpan: E.gSpan,
    reit: Object.fromEntries(Object.entries(E.reit).map(([k, v]) => [k, typeof v === 'number' ? r2(v) : v])),
    ig: Object.fromEntries(Object.entries(E.ig).map(([k, v]) => [k, typeof v === 'number' ? r2(v) : v])),
    hy: Object.fromEntries(Object.entries(E.hy).map(([k, v]) => [k, typeof v === 'number' ? r2(v) : v])),
    cross: Object.fromEntries(Object.entries(E.cross).map(([k, v]) => [k, typeof v === 'number' ? r2(v) : v])),
    capeHistory: I.multpl.capeHistory.filter(([d]) => d >= '1990').map(([d, v]) => [d.slice(0, 7), v]).reverse(),
    erpHistory: I.damodaranErp.history.map(([d, e, t]) => [d.slice(0, 7), r2(e * 100), r2(t * 100)]),
  },
  history: {
    years: H.years,
    annual: Object.fromEntries(Object.entries(H.annual).map(([k, v]) => [k, { arith: r2(v.arith), geo: r2(v.geo), vol: r2(v.vol) }])),
    series: Object.fromEntries(Object.entries(H.series).map(([k, v]) => [k, { ...v, arith: r2(v.arith), geo: r2(v.geo), vol: r2(v.vol) }])),
    mu: Object.fromEntries(Object.entries(H.mu).map(([k, v]) => [k, r2(v)])),
    safe: r2(H.safe),
  },
  risk: {
    vol: Object.fromEntries(['recent', 'long', 'before'].map((w) => [w, Object.fromEntries(SIM.map((s, i) => [s, r2(Math.sqrt(RISK[w].sample[i][i]) * 100)]))])),
    volShrunk: Object.fromEntries(SIM.map((s, i) => [s, r2(Math.sqrt(S11[i][i]) * 100)])),
    corr: Object.fromEntries(['recent', 'long', 'before'].map((w) => [w, toCorr(RISK[w].sample).map((row) => row.map((v) => r2(v)))])),
    corrShrunk: toCorr(S11).map((row) => row.map((v) => r2(v))),
    cov9: S9.map((row) => row.map((v) => round(v, 6))),
    kurtosis: Object.fromEntries(SIM.map((s, i) => [s, r2(RISK.long.kurtosis[i])])),
    stockBond: RISK.stockBond.map(([m, c]) => [m, r2(c)]),
    eqVol: Object.fromEntries(['recent', 'long', 'before'].map((w) => [w, r2(Math.sqrt(quad(RISK[w].sample, P[1])) * 100)])),
  },
  materiality: { thresholdBp: A.materialityBp, active: MODEL.filter((_, i) => ACTIVE[i]), rows: MAT.map((r) => ({ id: r.id, gainBp: round(r.gainBp, 3), weight2: round(r.weight2, 1), weight4: round(r.weight4, 1), beta: round(r.beta, 3), alphaBp: r.alphaBp === null ? null : round(r.alphaBp, 1) })) },
  merton: { premium: r2(M.premium), vol: r2(M.vol), histPremium: r2(M.histPremium), histVol: r2(M.histVol), rows: M.rows.map((r) => ({ gamma: r.gamma, today: r2(r.today), historical: r2(r.historical) })), muGrid: M.muGrid, sens: Object.fromEntries(Object.entries(M.sens).map(([k, v]) => [k, v.map((x) => r2(x))])), implied: Object.fromEntries(Object.entries(M.implied).map(([k, v]) => [k, r2(v)])) },
  frontier: {
    today: { ...F.today, tangency: { ...F.today.tangency, vol: r2(F.today.tangency.vol), mu: r2(F.today.tangency.mu), sharpe: round(F.today.tangency.sharpe, 3) } },
    hist: { ...F.hist, safe: r2(F.hist.safe), tangency: { ...F.hist.tangency, vol: r2(F.hist.tangency.vol), mu: r2(F.hist.tangency.mu), sharpe: round(F.hist.tangency.sharpe, 3) } },
    assets: F.assets.map((a) => ({ id: a.id, vol: r2(a.vol), today: r2(a.today), hist: r2(a.hist) })),
  },
  lifecycle: {
    ages: LIFE.ages,
    earnings: LIFE.ages.map((a) => Math.round(earnings(a))),
    census: Object.fromEntries(Object.entries(byAge).map(([k, v]) => [k, { median: v.median, mean: v.mean }])),
    humanCapital: Object.fromEntries(Object.keys(LIFE.paths).map((inc) => [inc, LIFE.paths[inc][4].map((r) => Math.round(r.h))])),
    wealth: Object.fromEntries(Object.keys(LIFE.paths).map((inc) => [inc, Object.fromEntries(A.gammaGrid.map((g) => [g, LIFE.paths[inc][g].map((r) => Math.round(r.f))]))])),
    weights: Object.fromEntries(Object.keys(LIFE.paths).map((inc) => [inc, Object.fromEntries(A.gammaGrid.map((g) => [g, LIFE.paths[inc][g].map((r) => r.x.map((v) => round(v * 100, 1)))]))])),
    mu: Object.fromEntries(Object.keys(LIFE.paths).map((inc) => [inc, Object.fromEntries(A.gammaGrid.map((g) => [g, LIFE.paths[inc][g].map((r) => r2(r.mu))]))])),
    vol: Object.fromEntries(Object.keys(LIFE.paths).map((inc) => [inc, Object.fromEntries(A.gammaGrid.map((g) => [g, LIFE.paths[inc][g].map((r) => r2(r.vol))]))])),
    scf: I.scf,
  },
  matrix: MATRIX.map((m) => ({ ...m, k: round(m.k, 5), wealthYears: round(m.wealthYears, 2), mu: r2(m.mu), vol: r2(m.vol), volMtm: r2(m.volMtm), loss1in100: r2(m.loss1in100), drawdown: r2(m.drawdown), drawdownMtm: r2(m.drawdownMtm) })),
  retirement: {
    byYears: Object.fromEntries(Object.entries(RET.byYears).map(([k, v]) => [k, { start: r2(v.start), end: r2(v.end) }])),
    flat: RET.flat.map(([y, w]) => [y, r2(w)]),
    hist: RET.hist.map(([m, w, y]) => [m, r2(w), y]),
    surv: Object.fromEntries(Object.entries(RET.surv).map(([k, v]) => [k, { male: round(v.male, 1), female: round(v.female, 1), either: round(v.either, 1) }])),
    annuityRate: r2(RET.annuityRate),
    first10Share: round(RET.first10Share * 100, 1),
    retirees: RET.retirees.map((r) => ({ fr: r.fr, gamma: r.gamma, floor: round(r.floor, 1), weights: r.weights, mu: r2(r.mu), vol: r2(r.vol), volMtm: r2(r.volMtm), loss1in100: r2(r.loss1in100), drawdown: r2(r.drawdown), drawdownMtm: r2(r.drawdownMtm), spend: r.spend })),
    ssaYear: I.ssa.year,
  },
  sensitivity: { windows: Object.fromEntries(Object.entries(SENS.windows).map(([k, v]) => [k, { weights: v.weights, eqVol: r2(v.eqVol), corrStockLongBond: r2(v.corrStockLongBond), merton: r2(v.merton) }])), classic: SENS.classic, regional: SENS.regional, allPay: SENS.allPay, classicGlide: SENS.classicGlide, betaSweep: { ...SENS.betaSweep, k30: round(SENS.betaSweep.k30, 3), k45: round(SENS.betaSweep.k45, 3) } },
  liquidity: { drawdown: round(LIQ.drawdown, 1), trough: LIQ.trough, reserveMonths: LIQ.reserveMonths, rows: LIQ.rows.map((r) => ({ who: r.who, wealthYears: r.wealthYears === null ? null : round(r.wealthYears, 1), needShare: round(r.needShare, 1), risky: round(r.risky, 0), budget: round(r.budget, 0) })) },
  tdf: TDF.pts.map((p) => ({ vintage: p.vintage, age: p.age, asOf: p.asOf, equity: round(p.equity, 1), weights: Object.fromEntries(SIM.map((s, i) => [s, round(p.w[i] * 100, 1)])) })),
  mc: {
    paths: MC.paths,
    nu: MC.nu,
    finalPay: Math.round(MC.finalPay),
    groups: MC.groups.map((g) => ({ income: g.income, gamma: g.gamma, tipsOnly: round(g.tipsOnly, 1), rows: g.rows.map((r) => ({ id: r.id, name: r.name, w65: r.w65.map((v) => r2(v)), spend: r.spend.map((v) => round(v, 1)), worstYear: round(r.worstYear, 1), shortfall: round(r.shortfall, 1), ce: round(r.ce, 1), ceGain: round(r.ceGain, 1) })) })),
    fan: { ages: MC.fan.ages, model: MC.fan.model.map((b) => b.map((v) => r2(v))), tdf: MC.fan.tdf.map((b) => b.map((v) => r2(v))) },
    ruin: Object.fromEntries(Object.entries(MC.ruin).map(([k, v]) => [k, v.map((x) => round(x, 1))])),
  },
  calc: { q: qx.map((v) => round(v, 5)) },
  me: MINE,
};

await writeFile(join(here, '../../src/data/model2026-data.json'), JSON.stringify(data));

// ---------------------------------------------------------------- summary
const pct = (v, d = 2) => `${v.toFixed(d)}%`;
console.log(`As of ${A.asOf}. Real curve ${T.real.date}: 5y ${T.real['5 YR']}, 10y ${RF}, 30y ${T.real['30 YR']}. Breakevens 5y ${pct(breakeven(5))}, 10y ${pct(breakeven(10))}.`);
console.log(`CPI months filled: ${CPI.filled.join(', ') || 'none'}`);
console.log('Windows:', JSON.stringify(data.meta.windows));
console.log('Expected real returns:', JSON.stringify(data.expected.mu));
console.log('Equity regions:', JSON.stringify(data.expected.regions));
console.log(`g = ${pct(E.g)} over ${E.gSpan.join(' / ')}; REIT ${JSON.stringify(data.expected.reit)}`);
console.log('Credit:', JSON.stringify(data.expected.ig), JSON.stringify(data.expected.hy));
console.log('US cross-checks:', JSON.stringify(data.expected.cross));
console.log('History:', JSON.stringify(data.history.annual), JSON.stringify(data.history.series));
console.log('Vol recent:', JSON.stringify(data.risk.vol.recent));
console.log('Vol long:', JSON.stringify(data.risk.vol.long));
console.log('Corr recent (shrunk) us row:', JSON.stringify(data.risk.corrShrunk[1]));
console.log('Corr us-tsyLong / us-tips: recent', data.risk.corr.recent[1][8], data.risk.corr.recent[1][0], 'before', data.risk.corr.before[1][8], data.risk.corr.before[1][0], 'long', data.risk.corr.long[1][8], data.risk.corr.long[1][0]);
console.log('Kurtosis (long):', JSON.stringify(data.risk.kurtosis));
console.log('Materiality:', JSON.stringify(MAT.map((r) => ({ ...r, gainBp: round(r.gainBp, 3), alphaBp: r.alphaBp === null ? null : round(r.alphaBp, 1) }))), 'active', MODEL.filter((_, i) => ACTIVE[i]).join(','));
console.log('Merton:', JSON.stringify(data.merton.rows), 'premium', data.merton.premium, 'vol', data.merton.vol, 'hist', data.merton.histPremium, data.merton.histVol, 'implied gamma', JSON.stringify(data.merton.implied));
console.log('Tangency today:', JSON.stringify(data.frontier.today.tangency));
console.log('Tangency hist:', JSON.stringify(data.frontier.hist.tangency));
for (const g of [2, 4, 8]) console.log(`Stand-alone optimum gamma ${g}:`, JSON.stringify(Object.fromEntries(MODEL.map((m, i) => [m, round(allocate(g, 1, 0)[i] * 100, 1)]))), JSON.stringify(stats(allocate(g, 1, 0))));
console.log('Ladder:', JSON.stringify(data.retirement.byYears), 'annuity', data.retirement.annuityRate, 'survival', JSON.stringify(data.retirement.surv));
for (const m of data.matrix) console.log(`${m.band} g${m.gamma} ${m.income.padEnd(9)} k=${m.k} eq ${m.weights.eq} tips ${m.weights.tips} hy ${m.weights.hy} reit ${m.weights.reit} ig ${m.weights.ig} | mu ${m.mu} vol ${m.vol} 1/100 ${m.loss1in100} dd ${m.drawdown} | ${m.reason}`);
for (const r of data.retirement.retirees) console.log(`retiree FR ${r.fr} g${r.gamma}: tips ${r.weights.tips} eq ${r.weights.eq} hy ${r.weights.hy} reit ${r.weights.reit} | mu ${r.mu} vol ${r.vol} 1/100 ${r.loss1in100}`);
console.log('Liquidity:', JSON.stringify(data.liquidity));
console.log('Sensitivity:', JSON.stringify(data.sensitivity));
console.log('Splits undone:', JSON.stringify(SPLITS));
console.log('TDF:', data.tdf.map((p) => `${p.vintage}@${p.age}: ${p.equity}`).join(', '));
for (const g of data.mc.groups) {
  console.log(`MC ${g.income} gamma ${g.gamma} (TIPS-only spend ${g.tipsOnly}% of final pay)`);
  for (const r of g.rows) console.log(`   ${r.name.padEnd(13)} W65 x pay ${r.w65.join(' / ')} | spend %pay ${r.spend.join(' / ')} | worst yr ${r.worstYear} | short ${r.shortfall}% | CE ${r.ce} | model CE gain ${r.ceGain}%`);
}
console.log('Ruin:', JSON.stringify(data.mc.ruin));
console.log('Me:', JSON.stringify({ viewA: MINE.viewA, viewB: MINE.viewB, target: MINE.target, gap: MINE.gap, equityA: MINE.equityA, usShare: MINE.usShareOfEquityA, tilt: MINE.tiltWeight, tiltExposure: MINE.tiltExposure, tiltIdioVol: MINE.tiltIdioVol, cornerK: MINE.cornerK, cornerYears: MINE.cornerYears, risk: MINE.risk, hurdles: MINE.hurdles, drag: MINE.drag, single: MINE.single }));
console.log('Price stats:', JSON.stringify(MINE.priceStats));
console.log('Plan:', JSON.stringify({ ...MINE.plan, base: undefined, whatIf: undefined }));
for (const r of MINE.plan.base) console.log(`   Q${r.q}: US ${r.a.us} intl ${r.a.intl} em ${r.a.em} single ${r.a.single} cash ${r.a.cash} | off ${r.offTarget} TE ${r.te} | B: employer ${r.b.employer} US ${r.b.us} TE ${r.teB} | ${r.note}`);
console.log(`Monte Carlo: ${MC.paths} paths in ${simSeconds.toFixed(1)}s. Wrote src/data/model2026-data.json`);
