// "The Brockmeier Model": a lifecycle portfolio model priced off November 2026 yields
// and valuations. Prose lives here as small blocks; charts and tables live in
// model2026-figures.ts; every model number is read from model2026-data.json, which
// scripts/model/build.mjs writes, so the text cannot drift from the model. Inline [n]
// marks cite the numbered sources at the end. {fig:id} and {tab:id} become "Figure N"
// and "Table N" on the page. Every number is from a cited public source or is labeled
// as Charlie's own arithmetic.
import D from './model2026-data.json';
import { paper2026 } from './paper2026';

export type Block =
  | { p: string }
  | { h3: string }
  | { eq: string; caption?: string }
  | { list: string[]; ordered?: boolean }
  | { fig: string }
  | { calc: true };

export type Section = { id: string; heading: string; blocks: Block[] };

// ---- numbers used in the prose, all from the model's data file
// A true minus sign for negative numbers.
const f1 = (v: number) => v.toFixed(1).replace('-', '−');
const f2 = (v: number) => v.toFixed(2).replace('-', '−');
const r0 = (v: number) => String(Math.round(v));
const mu = D.expected.mu;
const X = D.expected.cross;
const M = D.merton;
const H = D.history.annual;
const ages = D.lifecycle.ages;
const W = D.lifecycle.weights as Record<string, Record<string, number[][]>>;
const stock = (inc: string, g: number, age: number) => W[inc][String(g)][ages.indexOf(age)][1];
const leaves = (inc: string, g: number) => (ages.find((a) => stock(inc, g, a) < 99.5) ?? 65) - 1;
const merton = (g: number) => M.rows.find((r) => r.gamma === g)!;
const phi = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989423 * Math.exp((-z * z) / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};
/** Chance that an asset with premium pi and volatility s (percent) trails TIPS over T years, lognormal. */
const trail = (pi: number, s: number, T: number) => phi((-(pi / 100 - (s / 100) ** 2 / 2) * Math.sqrt(T)) / (s / 100)) * 100;
/** Certainty-equivalent gain a year from holding the Merton share instead of none: pi^2 / (2 gamma sigma^2), in basis points. */
const ceBp = (pi: number, s: number, g: number) => ((pi / 100) ** 2 / (2 * g * (s / 100) ** 2)) * 1e4;
const usVol = D.risk.volShrunk.us;
const ret = D.retirement;
const ladder = ret.byYears['30'].start;
const hist = ret.hist as [string, number, number][];
const ladderMin = hist.reduce((a, b) => (b[1] < a[1] ? b : a));
const ruin = D.mc.ruin;
const grp = (inc: string, g: number) => D.mc.groups.find((x) => x.income === inc && x.gamma === g)!;
const row = (inc: string, g: number, id: string) => grp(inc, g).rows.find((r) => r.id === id)!;
const me = D.me;
const plan = me.plan;
const end = plan.base[plan.base.length - 1];
const menu = (id: string) => D.materiality.rows.find((r) => r.id === id)!;
const win = D.sensitivity.windows;
const sb = D.risk.stockBond as [string, number][];
const sbAvg = (() => {
  const s = sb.filter(([m]) => m >= '2000-01' && m <= '2020-12');
  return s.reduce((a, b) => a + b[1], 0) / s.length;
})();
const tdfAt = (v: string) => D.tdf.find((p) => p.vintage === v)!;
const scf = D.lifecycle.scf;
const fund = me.fund2065.look;
// Nasdaq prints its quote date with a short month ("Nov 9, 2026"); spell it out.
const spell = (d: string) => d.replace(/^[A-Z][a-z]{2}\b/, (m) => ({ Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' })[m] ?? m);
const longDate = (iso: string) => `${month(iso)}`.replace(' ', ` ${Number(iso.slice(8, 10))}, `);
const month = (m: string) => `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;

export const model2026 = {
  title: 'The Brockmeier Model',
  subtitle: 'How much risk to take at each age when stocks pay two points more than TIPS, not eight',
  slug: 'brockmeier-model',
  published: 'November 2026',
  pdf: '/writing/brockmeier-model.pdf',
  companion: '/writing/illiquidity-premium',
  companionTitle: paper2026.title,
  description:
    'A lifecycle portfolio model priced off November 2026 yields instead of historical averages: what TIPS, stocks, credit, real estate and gold are priced to return, how much risk each age, risk tolerance and kind of paycheck should hold, what a TIPS ladder pays in retirement, and where my own portfolio sits against it.',
  disclaimer:
    'Views are my own and not those of my employer. Nothing here is investment advice. Every figure comes from a public source cited at the end, or is labeled as my own arithmetic; none comes from my employer’s data or products, or from any client.',

  keyPoints: [
    `<strong>The reward for risk is about a quarter of what the textbooks use.</strong> On November 9, 2026 ten-year TIPS yielded ${f2(mu.tips)}% after inflation and thirty-year TIPS ${f2(D.curves.real[4][1])}% [1]. Global stocks are priced to return about ${f2(mu.eq)}% (my arithmetic from index earnings and dividend yields [4–6, 9]). That is a premium of ${f2(M.premium)} points. From 1928 to 2025 U.S. stocks beat Treasury bills by ${f2(M.histPremium)} points a year [12].`,
    `<strong>So the “60/40 investor” should hold about ${r0(merton(4).today)}% in stocks once the paychecks stop.</strong> The Merton share is the premium divided by risk aversion times variance [22]. The risk aversion that gives ${r0(merton(4).historical)}% in stocks on the historical averages gives ${f1(merton(4).today)}% on today’s prices. The rest belongs in TIPS, not in nominal bonds.`,
    `<strong>Age matters because of the savings you have not made yet.</strong> Future savings are an asset, and for stable pay they behave like a bond. The model has a balanced saver all in stocks until ${leaves('stable', 4)}, at ${r0(stock('stable', 4, 40))}% by 40 and ${r0(stock('stable', 4, 65))}% at 65. The largest target-date series holds ${r0(tdfAt('2050').equity)}% at 41 and about half at 65 [32]. Run on the 1928–2025 averages, the same model gives ${r0(D.sensitivity.classicGlide['4'][15])}% at 40 and ${r0(D.sensitivity.classicGlide['4'][40])}% at 65: a target-date fund is this model with stale inputs.`,
    `<strong>A stock-like paycheck can take the whole stock budget.</strong> If ${r0(D.meta.incomeBeta.stockLike * 100)}% of your future pay moves with the market, a balanced saver should hold ${r0(stock('stockLike', 4, 35))}% in stocks at 35 and ${r0(stock('stockLike', 4, 55))}% at 55. The glide path runs upward, not downward.`,
    `<strong>The 4% rule is obsolete in both directions.</strong> A 30-year TIPS ladder bought today pays ${f2(ladder)}% of its cost a year, after inflation, with no chance of running out (my arithmetic from the Treasury real curve [1]). Taking 4% from a 60/40 portfolio runs out within 30 years in ${r0(ruin.sixtyForty[2])}% of simulated paths at today’s prices.`,
    `<strong>Eleven asset classes go in and two come out.</strong> After TIPS and global stocks, nothing else on the menu adds even a basis point of certainty-equivalent return. Nominal Treasuries lost their job when their correlation with stocks went from ${f2(D.risk.corr.before[1][8])} to +${f2(D.risk.corr.recent[1][8])}. Private assets get a weight of zero and a liquidity budget.`,
  ],

  take: `My take: at these prices the question is not which risky assets to own. It is how much of your wealth is still future savings, and whether that future pay is safe. Hold global stocks at market weights for the risk you want, hold TIPS that mature when you need the money for everything else, and move from the first to the second faster than a target-date fund does. My own portfolio fails that test on one count: it is ${r0(me.usShareOfEquityA)}% U.S. inside its stocks. The last section is the plan to fix it.`,

  sections: [
    {
      id: 'question',
      heading: 'The question',
      blocks: [
        {
          p: 'What is the right portfolio? Most answers are a rule of thumb: 60/40, your age in bonds, a target-date fund, 4% a year in retirement. Each rule was fitted to a century of U.S. returns in which stocks earned about 8% a year more than cash. Nobody can buy that century. What you can buy is today’s prices, and today’s prices are published.',
        },
        {
          p: 'So this paper builds the answer from prices, in five steps. First, read expected real returns off the Treasury curve and off index valuations as of November 2026. Second, measure risk on the years since 2022, when real yields reset and stocks and bonds began falling together. Third, solve the portfolio problem for one investor with a stated risk aversion. Fourth, add the asset most models leave out, the savings a person has not made yet, which is what makes the answer depend on age and on the kind of job. Fifth, price retirement off the same curve. Then I simulate the whole path, sort the answers into a matrix of 45 groups, and hold my own portfolio up against it.',
        },
        {
          p: 'I take positions where the numbers support them. Where a result rests on an assumption I chose, I say so and show what happens if it is wrong.',
        },
      ],
    },

    {
      id: 'prices',
      heading: 'What prices say in November 2026',
      blocks: [
        { h3: 'The safe asset' },
        {
          p: `Treasury Inflation-Protected Securities pay a fixed yield on top of inflation. On November 9, 2026 the Treasury’s par real curve stood at ${f2(D.curves.real[0][1])}% for five years, ${f2(mu.tips)}% for ten and ${f2(D.curves.real[4][1])}% for thirty [1]. At the end of 2021 the ten-year real yield was ${f2(D.curves.realThen.curve[2][1])}% [1]. {fig:curve} shows both curves. An investor who needs purchasing power at a known date can now lock in close to 3% a year above inflation, with no credit risk and no forecast. Every other asset in this paper is measured against that.`,
        },
        { fig: 'curve' },
        {
          p: `Nominal Treasuries yield ${f2(D.curves.nominal.find((p) => p[0] === 10)![1])}% at ten years [2]. The gap to TIPS, ${f2(D.curves.breakeven[2][1])} points, is the inflation rate at which the two break even (my arithmetic). I use that breakeven as expected inflation, which makes the expected real return on a nominal Treasury equal to the TIPS yield at the same maturity. A nominal bond then offers the same expected return as TIPS plus inflation risk. That matters later.`,
        },
        { h3: 'Stocks' },
        {
          p: 'A stock index is a claim on earnings. Two standard ways to turn its price into an expected real return are the earnings yield, which assumes retained earnings earn their cost, and the dividend yield plus growth. I average them:',
        },
        {
          eq: 'E[r<sub>stocks</sub>] = ½ · ½ (E/P<sub>trailing</sub> + E/P<sub>forward</sub>) + ½ · (D/P + g)',
          caption: `E/P: earnings yield of the index on trailing and on forecast earnings. D/P: dividend yield. g: long-run real growth in earnings per share, ${f2(D.expected.g)}% a year, the growth between the 1871–1880 average and the ${D.expected.gSpan[2].slice(0, 4)}–${D.expected.gSpan[3].slice(0, 4)} average of real S&P earnings in Shiller’s data [9] (my arithmetic).`,
        },
        {
          p: `For the S&P Composite 1500 on November 6, 2026 the price was ${D.expected.regions.us.pe} times trailing earnings and ${D.expected.regions.us.peFy1} times forecast earnings, with a dividend yield of ${D.expected.regions.us.dy}% [4]. The rule gives ${f2(mu.us)}% a year after inflation. Developed markets outside the U.S. trade at ${D.expected.regions.intl.pe} and ${D.expected.regions.intl.peFy1} times with a ${D.expected.regions.intl.dy}% yield, which gives ${f2(mu.intl)}% [5]. Emerging markets give ${f2(mu.em)}% [6]. At global market weights, ${f1(D.meta.equityWeights.us * 100)}% U.S., ${f1(D.meta.equityWeights.intl * 100)}% other developed and ${f1(D.meta.equityWeights.em * 100)}% emerging [17], global stocks are priced to return ${f2(mu.eq)}%. All of these are my arithmetic from the cited index statistics.`,
        },
        {
          p: `No single method deserves much trust, so here are two others for the U.S. number. Shiller’s cyclically adjusted P/E was ${X.cape} on November 9 [10], an earnings yield of ${f2(X.capeYield)}%, which is ${f2(Math.abs(X.excessCapeYield))} points ${X.excessCapeYield < 0 ? 'below' : 'above'} the ten-year TIPS yield. Damodaran’s implied equity risk premium on November 1 was ${f2(X.damodaranErp)}% over a ${f2(X.damodaranTbond)}% Treasury bond, an expected nominal return of ${f2(X.damodaranNominal)}% [11], or ${f2(X.damodaranReal)}% after breakeven inflation (my arithmetic). My ${f2(mu.us)}% sits between the two. {fig:ecy} shows why the low end deserves respect: for most of the last twenty years stocks out-yielded TIPS by three to six points. They no longer do.`,
        },
        { fig: 'ecy' },
        { h3: 'Everything else' },
        {
          p: `Credit pays the Treasury yield plus a spread, less what defaults take back. Investment-grade corporate bonds yield ${D.expected.ig.ytw}% with a spread of ${r0(D.expected.ig.oas)} basis points [7]. Over 150 years spreads have run about twice default losses [14], so I keep half the spread: ${f2(mu.ig)}% real. High-yield bonds yield ${D.expected.hy.ytw}% with a spread of ${r0(D.expected.hy.oas)} basis points [8]. The long-run default rate on high-yield bonds is 3.61% a year [15]; with 40% recovered, which is my assumption, the expected loss is ${f2(D.expected.hy.loss)}% and the expected real return ${f2(mu.hy)}%.`,
        },
        {
          p: `Listed real estate yields ${D.expected.reit.dy}% in dividends [13]. Since 1971 the price-only index of equity REITs has grown ${f2(D.expected.reit.nominalGrowth)}% a year against inflation of ${f2(D.expected.reit.inflation)}%, so real growth is ${f2(D.expected.reit.g)}% [13, 20] and the expected real return is ${f2(mu.reit)}% (my arithmetic). Gold has no yield, and its real price has tended to fall back after running above its average [16]; I give it zero, which is generous at a record price. Cash is a four-week bill at ${f2(D.curves.bill)}% [3] less breakeven inflation: ${f2(mu.cash)}%.`,
        },
        { fig: 'inputs' },
        {
          p: `{fig:implied} puts these next to the averages that most allocation advice still runs on. From 1928 to 2025 the S&P 500 returned ${f2(H.stocks.arith)}% a year after inflation as an arithmetic average (${f2(H.stocks.geo)}% compounded), ten-year Treasuries ${f2(H.bonds.arith)}% and bills ${f2(H.bills.arith)}% (my arithmetic from Damodaran’s annual series [12]). Stocks are priced to return a little more than half their average. Safe assets are priced to return more than theirs. The premium between them has gone from ${f2(M.histPremium)} points to ${f2(M.premium)}.`,
        },
        { fig: 'implied' },
      ],
    },

    {
      id: 'risk',
      heading: 'Risk: the years since 2022',
      blocks: [
        {
          p: `Expected returns come from prices. Risk has to come from data, and the choice of years is a choice of regime. I use monthly real returns from January 2022 to September 2026, ${D.meta.windows.recent.months} months. That window starts when real yields began to rise from below zero and covers the period in which stocks and Treasuries have moved together. It is short, so I shrink it and I show the longer windows beside it.`,
        },
        {
          p: `The series are public and none is built on an index from my employer. U.S. stocks are the CRSP market return and international stocks are French’s developed ex-U.S. and emerging series [18]. Treasuries and TIPS are par bonds repriced each month from the Treasury curves [1, 2]. Real estate is the FTSE Nareit All Equity REITs index [13]. Credit and gold are fund net asset values [19]. Everything is deflated by the CPI [20]; the BLS published no index for ${D.meta.cpiFilled.map(month).join(' or ')}, and I fill that month on a constant growth path.`,
        },
        {
          eq: 'Σ̂ = δ·F + (1 − δ)·S',
          caption: `S: sample covariance of monthly real returns, annualized. F: the same variances with every correlation set to the average correlation. δ: the shrinkage intensity that minimizes expected squared error (Ledoit and Wolf [21]). On the 2022–2026 window δ is ${r0(D.meta.windows.recent.delta * 100)}% and the average correlation is ${f2(D.meta.windows.recent.rbar)}.`,
        },
        { fig: 'risk' },
        {
          p: `Two things in {fig:risk} drive the results. First, volatility is higher than in the calm decade before: global stocks at market weights have run at ${f1(D.risk.eqVol.recent)}% a year since 2022 against ${f1(D.risk.eqVol.before)}% from 2011 to 2021, and a ten-year TIPS bond at ${f1(D.risk.vol.recent.tips)}% against ${f1(D.risk.vol.before.tips)}%. Second, the sign of the stock-bond correlation flipped. From May 2011 to December 2021 the correlation between U.S. stocks and a 20-year Treasury was ${f2(D.risk.corr.before[1][8])}. Since January 2022 it has been +${f2(D.risk.corr.recent[1][8])}.`,
        },
        { fig: 'corr' },
        {
          p: `{fig:corr} shows the rolling version back to the 1990s. The 36-month correlation averaged ${f2(sbAvg)} from 2000 to 2020, turned positive in ${month(sb.find(([m, c]) => m > '2015' && c > 0)![0])} and was ${f2(sb[sb.length - 1][1])} in September 2026. For twenty years a long Treasury was insurance that paid a yield. In this regime it is a second risky asset with the expected return of the safe one.`,
        },
        {
          p: `Monthly returns also have fatter tails than a normal distribution: excess kurtosis from 2011 to 2026 is about ${f1(D.risk.kurtosis.us)} for stocks, ${f1(D.risk.kurtosis.tips)} for TIPS and ${f1(D.risk.kurtosis.hy)} for high yield. The simulations below draw from a Student-t distribution with ${D.meta.nu} degrees of freedom, not a normal one.`,
        },
      ],
    },

    {
      id: 'one',
      heading: 'One investor, no paycheck',
      blocks: [
        {
          p: 'Start with someone who lives off a portfolio and nothing else. I give investors constant relative risk aversion, the standard assumption: losing a given percentage hurts the same at any level of wealth, and a single number γ says how much.',
        },
        {
          eq: 'U(W) = W<sup>1−γ</sup> / (1 − γ)',
          caption: 'W: real wealth. γ: relative risk aversion. Higher γ means a bigger premium is needed to accept the same risk.',
        },
        {
          p: 'With one risky asset, one safe asset and continuous rebalancing, Merton and Samuelson showed in 1969 that such an investor holds a constant share in the risky asset, whatever the horizon [22, 23]:',
        },
        {
          eq: 'α* = (μ − r) / (γσ²)',
          caption: 'α*: share of wealth in the risky asset. μ − r: its expected return over the safe asset. σ²: its variance.',
        },
        {
          p: `The safe asset is the one that is safe at the investor’s horizon. For someone funding spending years away, that is an inflation-indexed bond maturing when the money is needed, not cash [25]. So r is the TIPS yield, and TIPS held to maturity carry no risk in the model even though their price moves in between. That is the one place I depart from a textbook mean-variance setup, and it matters: marked to market, a ten-year TIPS fund lost about ${r0(-D.retirement.retirees[0].drawdownMtm)}% after inflation between late 2021 and late 2023 (my calculation from the Treasury real curve), while a TIPS bond held to maturity paid exactly what it promised.`,
        },
        {
          p: `Risk aversion needs a scale people recognize. I use the old averages for that. With the 1928–2025 premium of ${f2(M.histPremium)} points over bills and volatility of ${f1(M.histVol)}%, a γ of ${f1(M.implied['60'])} gives the classic 60% in stocks and a γ of ${f1(M.implied['100'])} gives 100%. So I call γ = 2 aggressive, 3 growth, 4 balanced, 6 moderate, 8 cautious and 10 very cautious. {fig:merton} gives the share each holds on the old averages and on today’s prices.`,
        },
        { fig: 'merton' },
        {
          p: `The balanced investor who held ${r0(merton(4).historical)}% in stocks on the averages holds ${f1(merton(4).today)}% on today’s prices. The aggressive one goes from more than everything to ${f1(merton(2).today)}%. Nothing about these people changed. The premium fell by three quarters and the formula is linear in it.`,
        },
        { fig: 'sens' },
        {
          p: `{fig:sens} shows how much rides on the stock return, the least certain input. At the CAPE yield the balanced investor owns no stocks. At Damodaran’s number she owns ${r0(((X.damodaranReal - mu.tips) / (4 * M.vol ** 2)) * 1e4)}%. No estimate on that range gets her back to 60%. It also shows how little is at stake. Holding the Merton share instead of no stocks at all is worth ${r0(ceBp(M.premium, M.vol, 4))} basis points a year in certainty-equivalent return to the balanced investor today, against ${f1(ceBp(M.histPremium, M.histVol, 4) / 100)} points on the old averages (π² ÷ 2γσ², my arithmetic). When the safe asset pays ${f2(mu.tips)}%, getting the stock share exactly right matters a tenth as much as it did when the premium was eight points.`,
        },
        {
          p: `One more number puts the premium in terms a saver feels. With a premium of ${f2(M.premium)} points and volatility of ${f1(M.vol)}%, global stocks have about a ${r0(trail(M.premium, M.vol, 10))}% chance of ending behind TIPS over ten years and ${r0(trail(M.premium, M.vol, 40))}% over forty. For U.S. stocks alone, with a premium of ${f2(D.expected.premium.us)} points and volatility of ${f1(usVol)}%, it is about ${r0(trail(D.expected.premium.us, usVol, 40))}% at any horizon (lognormal approximation, my arithmetic).`,
        },
      ],
    },

    {
      id: 'menu',
      heading: 'Eleven asset classes go in, two come out',
      blocks: [
        {
          p: 'The menu has eleven asset classes: TIPS; U.S., international developed and emerging-market stocks; listed real estate; investment-grade and high-yield credit; intermediate and long Treasuries; gold; and cash. A private-asset sleeve is handled separately below. I hold the three stock regions at global market weights as one asset, for a reason I come back to. That leaves nine. The investor’s problem, with no borrowing and no shorting, is',
        },
        {
          eq: 'max<sub>x</sub>  μ′x − (γ/2) x′Σx   subject to   x ≥ 0,  1′x = 1',
          caption: 'x: portfolio weights. μ: expected real returns from {tab:inputs}. Σ: the shrunk 2022–2026 covariance, with the TIPS row and column set to zero.',
        },
        {
          p: 'This is a quadratic program. With nine assets it can be solved exactly by brute force: for each of the 511 possible sets of assets held, the first-order conditions and the budget constraint are a small linear system; the answer is the solution with no negative weight and the highest objective. I checked the weights with a second implementation in another language on a covariance matrix rebuilt from the raw downloads.',
        },
        { fig: 'frontier' },
        {
          p: `{fig:frontier} shows what the optimizer is choosing among. With today’s returns the best mix of risky assets has a slope of ${f2(D.frontier.today.tangency.sharpe)} over TIPS. With historical-average returns and the same risks it is ${f2(D.frontier.hist.tangency.sharpe)} over bills. The line an investor can travel along has gone nearly flat.`,
        },
        { fig: 'menu' },
        {
          p: `{fig:menu} asks what each asset adds once TIPS and stocks are available. The test is its premium over TIPS after subtracting its beta times the stock premium. Listed real estate has a beta of ${f2(menu('reit').beta)} and a premium ${r0(-menu('reit').alphaBp!)} basis points too small for it. Investment-grade credit is ${r0(-menu('ig').alphaBp!)} short, long Treasuries ${r0(-menu('tsyLong').alphaBp!)}, gold ${r0(-menu('gold').alphaBp!)}. High yield is the only one above zero, by ${f1(menu('hy').alphaBp!)} basis points. The optimizer gives it ${f1(menu('hy').weight2)}% for an aggressive investor, and the gain in certainty-equivalent return is ${f2(menu('hy').gainBp)} of a basis point a year. A ${f1(menu('hy').alphaBp!)} basis point edge is far inside the error of my default-loss estimate. The model keeps an asset only if it adds at least one basis point a year, so high yield is out. Two assets are left: TIPS and global stocks.`,
        },
        {
          p: `That is a statement about November 2026 prices, not about these asset classes. {fig:windows} reruns the problem with risk measured on other years. On the 2011–2021 covariance, when long Treasuries hedged stocks, the same expected returns give long Treasuries ${f1(win.before.weights.tsyLong)}% of the portfolio and let the balanced investor hold ${f1(win.before.weights.eq)}% in stocks instead of ${f1(win.recent.weights.eq)}%. The hedge was worth about ten points of stock exposure. It is gone, and the model does not pay for insurance that stopped paying.`,
        },
        { fig: 'windows' },
        { h3: 'Why the regions are not optimized' },
        {
          p: `If I let the optimizer choose among the three stock regions at their own implied returns, it puts nothing in the U.S.: a balanced investor gets ${f1(D.sensitivity.regional['4'].intl)}% international developed, ${f1(D.sensitivity.regional['4'].em)}% emerging and no U.S. stocks at all. That is what a ${f1(mu.intl - mu.us)}-point gap in expected return does when two assets have a correlation of ${f2(D.risk.corr.recent[1][2])}. I do not believe my regional estimates that much. The gap rests on earnings multiples, the same gap has been open for a decade while U.S. stocks won, and a corner solution turns any error in it into the whole answer. So the model lets prices set the regional mix, at market weights, and lets valuations set only how much stock to own. The practical reading is narrower and I am confident in it: a portfolio that is all U.S. stocks is betting against the half of the valuation evidence that is clearest.`,
        },
      ],
    },

    {
      id: 'pay',
      heading: 'The asset nobody puts on the statement',
      blocks: [
        {
          p: `A 30-year-old with one year of pay saved does not have a small portfolio. She has a small portfolio plus thirty-five years of contributions that have not happened yet. If her job is secure, those contributions are close to a bond: they arrive on schedule whatever the stock market does. Bodie, Merton and Samuelson made the point in 1992 [24], and Cocco, Gomes and Maenhout put it in one line: labor income substitutes for riskless asset holdings, so the optimal stock share falls with age [26].`,
        },
        {
          p: 'I count only the part of future pay that will be saved. The rest pays for life before retirement and is not available to absorb a market loss unless the saver is willing to cut spending. With a fixed saving rate, the present value of future contributions is exactly the wealth that has yet to arrive in the portfolio:',
        },
        {
          eq: 'H<sub>a</sub> = Σ<sub>t = a</sub><sup>R−1</sup>  s · Y<sub>t</sub> · S<sub>a,t</sub> / (1 + z<sub>t−a</sub> + β·π)<sup>t − a + ½</sup>',
          caption: `H<sub>a</sub>: human capital at age a. s: share of pay saved, ${f1(D.meta.savingsRate * 100)}% including the employer’s contribution [30]. Y<sub>t</sub>: median pay at age t for full-time, year-round workers [28], held flat in real terms. S<sub>a,t</sub>: probability of surviving from a to t [31]. z: the real Treasury yield at that horizon [1]. β: the share of future pay that behaves like stocks. π: the stock premium. R: retirement age, 65.`,
        },
        { fig: 'hc' },
        {
          p: `Total retirement wealth is savings so far, F, plus H. Write k = F / (F + H). The investor wants the Merton share of total wealth in stocks, and a share β of H already behaves like stocks. The portfolio problem on total wealth is the same quadratic program with two changes:`,
        },
        {
          eq: 'max<sub>x</sub>  μ′x − (γ/2) [ k · x′Σx + 2(1 − k) · β · x′Σe<sub>stocks</sub> ]   subject to   x ≥ 0,  1′x = 1',
          caption: 'x: weights on savings. e<sub>stocks</sub>: the vector that picks out global stocks. The first term in brackets scales risk down because savings are only a share k of wealth. The second charges the portfolio for risk the paycheck already carries.',
        },
        {
          p: 'With two assets left on the menu the solution has a closed form, and it is the whole model in one line:',
        },
        {
          eq: 'stock share of savings = clip( [ π / (γσ²) − β(1 − k) ] / k ,  0,  1 )',
          caption: `π: stock premium over TIPS, ${f2(M.premium)} points. σ: stock volatility, ${f1(M.vol)}%. clip keeps the share between 0 and 100%: no borrowing, no shorting.`,
        },
        {
          p: `Read it from the inside out. π / (γσ²) is the Merton share, the stock budget as a fraction of total wealth. β(1 − k) is how much of that budget the paycheck has already spent. Dividing by k turns a share of total wealth into a share of savings, which is why a young saver with little in the bank can be 100% in stocks while holding only a few percent of total wealth in them.`,
        },
        { fig: 'glide' },
        {
          p: `{fig:glide} is the result for a balanced saver with stable pay: all stocks until ${leaves('stable', 4)}, ${f1(stock('stable', 4, 35))}% at 35, ${f1(stock('stable', 4, 40))}% at 40, ${f1(stock('stable', 4, 50))}% at 50 and ${f1(stock('stable', 4, 65))}% at 65. I did not choose that shape. It is the formula evaluated along the path of a median earner who saves ${f1(D.meta.savingsRate * 100)}% of pay. An aggressive saver stays all in stocks until ${leaves('stable', 2)} and ends at ${f1(stock('stable', 2, 65))}%. A cautious one is at ${f1(stock('stable', 8, 30))}% by 30 and ends at ${f1(stock('stable', 8, 65))}%.`,
        },
        { h3: 'This is where target-date funds come from' },
        {
          p: `Target-date funds hold 93% in stocks at the median for savers 45 years from retirement [33]. The largest series, with 38% of target-date assets [35], holds ${f1(tdfAt('2055').equity)}% for a 36-year-old, ${f1(tdfAt('2040').equity)}% at 51, ${f1(tdfAt('2030').equity)}% at 61 and ${f1(tdfAt('2025').equity)}% at 66, going by its funds’ reported holdings [32]. Feed my model the 1928–2025 averages instead of today’s prices and it produces ${f1(D.sensitivity.classicGlide['4'][15])}% at 40, ${f1(D.sensitivity.classicGlide['4'][25])}% at 50 and ${f1(D.sensitivity.classicGlide['4'][40])}% at 65. That is a target-date fund. {fig:tdf} draws the three together.`,
        },
        { fig: 'tdf' },
        {
          p: `So the industry’s glide path is not wrong in its logic. It is right for a premium of ${f2(M.histPremium)} points. At ${f2(M.premium)} points the same logic says a balanced saver should be at ${f1(stock('stable', 4, 40))}% in stocks at 40, not ${r0(tdfAt('2050').equity)}%, and at ${f1(stock('stable', 4, 65))}% at 65, not about half. For an aggressive saver the gap is smaller: ${f1(stock('stable', 2, 40))}% at 40 and ${f1(stock('stable', 2, 65))}% at 65.`,
        },
        { h3: 'When the paycheck is the risky asset' },
        {
          p: `Not everyone’s pay is a bond. Benzoni, Collin-Dufresne and Goldstein show that when wages and dividends move together over long horizons, a young worker’s human capital is stock-like and the right stock share is hump-shaped over life, not falling [27]. I use three groups: stable pay with β of ${D.meta.incomeBeta.stable}, cyclical pay with β of ${D.meta.incomeBeta.cyclical} (bonus-heavy or cyclical industries), and stock-like pay with β of ${D.meta.incomeBeta.stockLike} (commission, founders, pay that is largely equity). These β values are my assumptions, chosen to span that literature, not estimates.`,
        },
        { fig: 'heat' },
        {
          p: `{fig:heat} is the full grid. With cyclical pay a balanced saver holds ${r0(stock('cyclical', 4, 30))}% in stocks at 30, not 100%. With stock-like pay she holds ${r0(stock('stockLike', 4, 35))}% at 35, ${r0(stock('stockLike', 4, 45))}% at 45 and ${r0(stock('stockLike', 4, 60))}% at 60: the glide path runs up. Her paycheck is the stock position, and it shrinks as she ages, so the portfolio takes over. Only an aggressive saver with stock-like pay holds much stock when young, ${r0(stock('stockLike', 2, 30))}% at 30.`,
        },
        { fig: 'beta' },
        {
          p: `{fig:beta} shows how sharp this is. At 45, each tenth added to β takes about ${r0((D.sensitivity.betaSweep.age45['4'][0] - D.sensitivity.betaSweep.age45['4'][2]))} points off a balanced saver’s stock share. At 30 it takes about ${r0((D.sensitivity.betaSweep.age30['4'][1] - D.sensitivity.betaSweep.age30['4'][3]))}. For a young saver the most important input in this paper is not the stock return. It is an honest answer to the question of what happens to her income in a bad market.`,
        },
        {
          p: `One alternative deserves a line. If a saver would truly cut spending or work longer after a crash, all future pay counts, not only the saved part. Then H is about eight times larger and the balanced saver with stable pay stays all in stocks until ${ages.find((a, i) => D.sensitivity.allPay['4'][i] < 99.5)! - 1}, with ${f1(D.sensitivity.allPay['4'][25])}% at 50 and the same ${f1(D.sensitivity.allPay['4'][40])}% at 65. I use the savings-only version because it is the one the saver controls, and because the simulation below holds the saving rate fixed.`,
        },
      ],
    },

    {
      id: 'retire',
      heading: 'Retirement: buy the floor, then decide',
      blocks: [
        {
          p: 'At retirement the paychecks stop and the question changes from how much to accumulate to how much can be spent. The real curve answers it by arithmetic. A TIPS ladder is a set of bonds that mature one per year, each sized to pay for that year. Its price comes from discount factors bootstrapped off the par real curve:',
        },
        {
          eq: 'd<sub>n</sub> = (1 − c<sub>n</sub> · Σ<sub>j&lt;n</sub> d<sub>j</sub>) / (1 + c<sub>n</sub>),      w<sub>N</sub> = 1 / (1 + Σ<sub>n=1</sub><sup>N−1</sup> d<sub>n</sub>)',
          caption: 'c<sub>n</sub>: par real yield at n years, as an annual rate. d<sub>n</sub>: price today of one real dollar in n years. w<sub>N</sub>: the level real income, as a share of the purchase price, from N annual payments starting now.',
        },
        { fig: 'ladderT' },
        {
          p: `On the November 9 curve a ladder of thirty payments pays ${f2(ladder)}% of its cost a year, rising with inflation, from 65 through 94 (my arithmetic [1]). There is no simulation in that number and no probability of failure. {fig:ladder} shows what the same ladder paid at each month-end curve since 2004. In ${month(ladderMin[0])} it paid ${f2(ladderMin[1])}%. The 4% rule made sense when the safe alternative paid three.`,
        },
        { fig: 'ladder' },
        {
          p: `The 4% rule itself comes from Bengen’s 1994 study of U.S. returns since 1926: take 4% of the portfolio in the first year, raise it with inflation, and a stock-and-bond portfolio lasted 30 years in every historical window [34]. At today’s prices that is no longer true in expectation. {fig:ruin} runs the test forward with November 2026 expected returns: at a 4% withdrawal a 60/40 portfolio runs out within 30 years in ${f1(ruin.sixtyForty[2])}% of paths, the target-date glide path in ${f1(ruin.tdf[2])}% and an all-stock portfolio in ${f1(ruin.stocks[2])}%. The rule asks a risky portfolio to do, with a one-in-five to one-in-three chance of failure, what a ladder now does with certainty at a higher rate.`,
        },
        { fig: 'ruin' },
        { h3: 'The floor and the surplus' },
        {
          p: `A ladder has one weakness. It ends. A 65-year-old man has an ${r0(ret.surv['95'].male)}% chance of being alive at 95, a woman ${r0(ret.surv['95'].female)}%, and at least one of a couple ${r0(ret.surv['95'].either)}% [31]. So the model splits retirement wealth in two. The floor is essential spending not covered by Social Security, funded by a ladder long enough for the household. The surplus is everything else. The funded ratio is wealth divided by the cost of the floor. If utility is defined over spending above the floor, the Merton result applies to the surplus alone:`,
        },
        {
          eq: 'stock share of wealth = [ π / (γσ²) ] · (1 − 1 / FR)   for FR ≥ 1,   and 0 below',
          caption: 'FR: funded ratio. 1 / FR of wealth buys the floor. The Merton share of what is left goes to stocks; the rest of the surplus is also TIPS.',
        },
        { fig: 'retirees' },
        {
          p: `{fig:retirees} is the retiree half of the matrix. A balanced retiree with one and a half times the floor holds ${f1(ret.retirees.find((r) => r.fr === 1.5 && r.gamma === 4)!.weights.eq)}% in stocks. An aggressive retiree with three times the floor holds ${f1(ret.retirees.find((r) => r.fr === 3 && r.gamma === 2)!.weights.eq)}%. Nobody in the table holds the ${r0(tdfAt('2025').equity)}% that a target-date fund holds at 66 [32]. Below a funded ratio of one the model holds no stocks at all, and that is the result I expect people to like least. The usual instinct is that someone short of their goal needs growth. The math says that someone who cannot fund the floor cannot afford to make it smaller, and at a premium of ${f2(M.premium)} points stocks will not close the gap: the choices are a smaller floor, more saving or a later date.`,
        },
        {
          p: `Many households are nearer that position than the model saver’s. The median family headed by someone 55 to 64 had a net worth of $${r0(scf.netWorth['55–64'].median)},000 in the 2025 Survey of Consumer Finances, ${f1(scf.netWorth['55–64'].median / scf.income['55–64'].median)} times that group’s median income [29]. The model saver who put away ${f1(D.meta.savingsRate * 100)}% from 25 has ${f1(D.matrix.find((m) => m.band === '55-64' && m.gamma === 4 && m.income === 'stable')!.wealthYears)} years of pay at 60.`,
        },
      ],
    },

    {
      id: 'sim',
      heading: 'Forty years, ten thousand times',
      blocks: [
        {
          p: `The formulas above are instantaneous. To see what they do over a life I simulate it: ${D.mc.paths.toLocaleString('en-US')} paths, monthly, from 25 to 94. Each month’s real returns for all eleven asset classes are drawn together:`,
        },
        {
          eq: 'r<sub>t</sub> = μ/12 + L z<sub>t</sub> · √((ν − 2)/ν) / √(χ²<sub>ν,t</sub> / ν)',
          caption: `μ: expected real returns from {tab:inputs}. L: Cholesky factor of the shrunk 2022–2026 covariance, divided by 12. z: independent standard normals. χ²<sub>ν</sub>: a chi-square draw shared by all assets in the month, which makes the result a multivariate Student-t with ν = ${D.meta.nu} degrees of freedom and the right covariance. Bad months are worse and more common than under a normal distribution, and they hit every asset at once.`,
        },
        {
          p: `The saver earns the median pay for her age and saves ${f1(D.meta.savingsRate * 100)}% of it each month. With stock-like pay, her income moves each year by β times the surprise in stock returns, permanently. Five strategies face the same draws. The model re-solves its formula each year on actual savings and the present value of contributions still to come, holds TIPS that mature when the money is needed, buys a ladder with its TIPS at 65 and amortizes its stocks over the years left. Four benchmarks invest the same contributions: 60/40 in U.S. stocks and intermediate Treasuries; the target-date glide path of {fig:tdf}; 100% U.S. stocks; and age in bonds. Each benchmark spends in retirement by amortizing what it holds over the years left.`,
        },
        { fig: 'fan' },
        {
          p: `{fig:fan} shows the saving years for a balanced saver. The model’s median is a little lower than the target-date fund’s at 65, ${f1(D.mc.fan.model[2][40])} years of final pay against ${f1(D.mc.fan.tdf[2][40])}, and its range is much narrower: ${f1(D.mc.fan.model[0][40])} to ${f1(D.mc.fan.model[4][40])} between the 5th and 95th percentiles, against ${f1(D.mc.fan.tdf[0][40])} to ${f1(D.mc.fan.tdf[4][40])}. That is what the model is for. It gives up ${r0((1 - D.mc.fan.model[2][40] / D.mc.fan.tdf[2][40]) * 100)}% of median wealth and its 5th-percentile outcome is ${r0((D.mc.fan.model[0][40] / D.mc.fan.tdf[0][40] - 1) * 100)}% better.`,
        },
        { fig: 'mc' },
        {
          p: `{fig:mc} carries the same lives through retirement. A saver who bought nothing but TIPS for forty years and a ladder at 65 would replace ${r0(grp('stable', 4).tipsOnly)}% of final pay for thirty years, for certain, before Social Security. That is the bar. The target-date path beats it at the median, ${r0(row('stable', 4, 'tdf').spend[1])}%, and falls short of it in ${r0(row('stable', 4, 'tdf').shortfall)}% of lives. 60/40 and all-stocks fall short almost half the time, because they hold only U.S. stocks at a ${f2(D.expected.premium.us)}-point premium. The model falls short in ${r0(row('stable', 4, 'model').shortfall)}%.`,
        },
        {
          eq: 'CE = [ Σ<sub>t</sub> S<sub>t</sub> · E(c<sub>t</sub><sup>1−γ</sup>) / Σ<sub>t</sub> S<sub>t</sub> ]<sup>1/(1−γ)</sup>',
          caption: 'CE: certainty-equivalent income, the constant real income the investor would accept in place of the risky stream. c<sub>t</sub>: real spending at age t, 65 to 94. S<sub>t</sub>: probability of being alive [31]. The expectation is over simulated paths.',
        },
        { fig: 'ce' },
        {
          p: `Scored by certainty-equivalent income, the model is worth ${r0(row('stable', 4, 'tdf').ceGain)}% more than the target-date path to a balanced saver and ${r0(row('stable', 2, 'tdf').ceGain)}% more to an aggressive one ({fig:ce}). Three things produce that, and I would rather name them than let the number stand alone. The first is matching: the model’s TIPS mature when the money is needed, so they carry no price risk, while the benchmarks hold bond funds. If the model held its TIPS in a ten-year fund instead, its edge over the target-date path for the balanced saver would shrink to ${r0((row('stable', 4, 'modelFund').ce / row('stable', 4, 'tdf').ce - 1) * 100)}%. The second is the stock mix: global at ${f2(mu.eq)}% against U.S.-heavy. The third is simply less stock after 35, which a CRRA investor with fat-tailed returns values a great deal. The gains over 60/40 are larger because 60/40 gets none of the three right.`,
        },
      ],
    },

    {
      id: 'private',
      heading: 'Private assets: a budget, not a weight',
      blocks: [
        {
          p: `Private equity, private credit and private real estate are the twelfth asset class, and the model gives them a default weight of zero. The reason is in the companion paper, <a href="/writing/illiquidity-premium">${paper2026.title}</a> [38]: after fees and an honest adjustment for leverage and smoothed prices, the average buyer of private funds has not been paid a premium for the lockup, and what premium exists goes to whoever supplies liquidity when others need it. In this model’s terms, an asset with the expected return of public stocks, more volatility once its marks are unsmoothed, and a ten-year lock fails the test in {tab:menu} before the lock is even counted.`,
        },
        {
          p: 'What the model does provide is the limit. An investor can supply liquidity only with money that will not be needed, even in a crash. The liquidity budget is the largest share of wealth that can be locked for ten years without forcing a sale of the rest at the bottom:',
        },
        {
          eq: 'L = max( 0,  1 − N / [ W · (1 − D · s) ] )',
          caption: `N: cash the investor must be able to raise over ten years (a reserve for savers; the first ten rungs of the ladder for retirees). W: wealth. s: share of the liquid portfolio in stocks. D: the fall in stocks to plan for, ${f1(D.liquidity.drawdown)}%, the worst real peak-to-trough loss in global stocks since 1990 (my calculation from [18]).`,
        },
        { fig: 'liq' },
        {
          p: `{fig:liq} shows who has a budget. A 30-year-old does not: the reserve is most of what she owns. A 45-year-old saver with stable pay could lock up to ${r0(D.liquidity.rows[1].budget)}% and a 60-year-old ${r0(D.liquidity.rows[2].budget)}%, because they are adding money, not drawing it. A retiree who has just funded the floor could lock ${r0(D.liquidity.rows[9].budget)}% by this arithmetic, but all of it is committed to the ladder, so the usable budget is the surplus. The people with room to supply liquidity are mid-career savers with secure pay, which is not who private funds are mostly sold to. The budget is a ceiling. The weight stays at zero until a specific fund clears the hurdle in the companion paper’s calculator.`,
        },
      ],
    },

    {
      id: 'matrix',
      heading: 'The matrix',
      blocks: [
        {
          p: 'Here is the model sorted into groups: five ages, three levels of risk aversion and three kinds of paycheck, each on its own expected path. {fig:matrixBars} shows the balanced investor; {tab:matrix} has all 45 with expected real return, volatility, a bad year and the reason each differs from its neighbors. Retirees are in {tab:retirees}, by funded ratio.',
        },
        { fig: 'matrixBars' },
        { fig: 'matrix' },
        {
          p: 'Four patterns are worth saying in words.',
        },
        {
          list: [
            `<strong>Down the ages, stable pay:</strong> the stock share falls because k rises. A balanced saver goes from 100% at 30 to ${r0(stock('stable', 4, 40))}% at 40 and ${r0(stock('stable', 4, 65))}% at 65. Expected real return falls from ${f2(mu.eq)}% to ${f2(D.matrix.find((m) => m.band === 'At 65' && m.gamma === 4 && m.income === 'stable')!.mu)}%, which is what it costs to stop being able to lose a third in a year.`,
            `<strong>Across risk aversion:</strong> at any age past the early thirties the stock share is close to proportional to 1/γ. Doubling γ halves it.`,
            `<strong>Across paychecks:</strong> the same person at 40 holds ${r0(stock('stable', 4, 40))}% in stocks with stable pay, ${r0(stock('cyclical', 4, 40))}% with cyclical pay and ${r0(stock('stockLike', 4, 40))}% with stock-like pay. By 65 the three are identical, because the paycheck is gone.`,
            `<strong>At the corners:</strong> young savers with stable pay want more stock than they are allowed without borrowing, so they all hold 100% whatever their γ. Cautious savers with stock-like pay want less than zero, so they all hold none.`,
          ],
        },
        {
          p: 'The calculator applies the same formula to any age, saving rate and amount saved.',
        },
        { calc: true },
      ],
    },

    {
      id: 'mine',
      heading: 'My own portfolio',
      blocks: [
        {
          p: `A model that its author does not hold himself against is a lecture. So here is my portfolio at the ${longDate(me.asOf)} close, in percentages only. View A is the liquid portfolio: a Roth IRA (${f1(me.accounts[0].weight)}%), a 401(k) (${f1(me.accounts[1].weight)}%), a taxable brokerage account (${f1(me.accounts[2].weight)}%) and bank cash (${f1(me.accounts[3].weight)}%). View B adds unvested restricted stock units in my employer’s stock, which are about ${me.viewB.employer}% of the total when included. I do not own those shares yet and cannot sell them, so the model target is measured against View A, and View B is how I look at risk.`,
        },
        { fig: 'holdings' },
        { h3: 'Where I sit in the model' },
        {
          p: `I am in the first years of my career, which puts me in the youngest age band. My salary is stable, so β is ${me.profile.beta} for View A. For risk aversion I asked myself what I would do if the portfolio fell 40% in a year, and the honest answer was buy more. That puts me at γ = ${me.profile.gamma}, the most aggressive group on the grid. I do not go lower, because a γ of ${me.profile.gamma} already means ${r0(merton(2).historical)}% in stocks on the historical averages: below it the model describes someone who would have borrowed to buy stocks, not a saver.`,
        },
        {
          p: `For that group the formula sits at its corner. The stock budget is ${f1(me.mertonShare)}% of retirement wealth, and while savings so far are less than ${r0(me.cornerK * 100)}% of that wealth the portfolio is 100% global stocks. At the default saving rate that holds until savings pass about ${f1(me.cornerYears)} years of pay; I treat my liquid portfolio as inside that range. I keep the bank cash as a reserve outside the model. The target for View A is therefore ${f1(me.target.us)}% U.S. stocks, ${f1(me.target.intl)}% international developed, ${f1(me.target.em)}% emerging and ${f1(me.target.cash)}% cash.`,
        },
        { fig: 'meBars' },
        { fig: 'gap' },
        { h3: 'What the numbers say' },
        {
          list: [
            `<strong>The amount of risk is right. The mix is not.</strong> My stock exposure is ${f1(me.equityA)}% of the liquid portfolio counting the leveraged fund at twice its weight, close to the model’s 100% of the invested part. But ${f1(me.usShareOfEquityA)}% of it is U.S., against a global weight of ${f1(D.meta.equityWeights.us * 100)}% [17]. The target moves ${f1(plan.needAbroad)}% of the portfolio abroad. On the model’s inputs that raises expected real return from ${f2(me.risk.viewA.mu)}% to ${f2(me.risk.target.mu)}% and lowers volatility from ${f1(me.risk.viewA.vol)}% to ${f1(me.risk.target.vol)}% (my arithmetic).`,
            `<strong>About ${r0(me.tiltWeight)}% of the portfolio is a deliberate bet.</strong> A 2x daily leveraged fund on one stock (${f1(plan.ggll)}%), two single stocks, a semiconductor fund and a small-cap value fund add up to ${f1(me.tiltWeight)}% by weight and ${f1(me.tiltExposure)}% in single-name and sector exposure. Their firm-specific risk, measured on 2022–2026 monthly prices [40], adds ${f1(me.risk.viewA.vol - me.risk.viewA.volNoTilt)} points to the portfolio’s volatility. The model gives that risk no expected return, since it holds the market.`,
            `<strong>The leveraged fund has a cost that is not a matter of opinion.</strong> A fund that resets to twice a stock’s return every day compounds at twice the stock’s rate less (L² − L)/2 · σ² a year, which for L = 2 is σ². The stock’s volatility since 2022 has been ${f1(me.priceStats.GOOGL.vol)}% [40], so the drag is about ${f1(me.drag)}% a year (my arithmetic), before the fund’s fees and financing.`,
            `<strong>Once it is counted, the employer stock is the main risk.</strong> In View B the portfolio’s volatility is ${f1(me.risk.viewB.vol)}%, and ${r0(me.risk.viewB.employerShareOfVariance)}% of its variance is the firm-specific risk of one company. I do not use my employer’s price history. That figure uses a typical single stock: ${r0(me.single.vol)}% volatility, ${r0(me.single.firmShare)}% of it specific to the firm [36]. Most individual stocks have returned less than Treasury bills over their lives, and 4% of them account for all of the market’s gain [37]. And this stock is tied to the same company as my paycheck, which makes my human capital more stock-like until the shares are sold.`,
            `<strong>Two small positions the model would not hold.</strong> Silver has no yield. The listed fund of private companies is the illiquid sleeve of the previous section in an exchange-traded wrapper; it last traded at ${me.rvii.last} on ${spell(me.rvii.date)} [40], and I have found no published net asset value since its listing to compare that with. Together they are ${f1(me.viewA.gold + me.viewA.private)}%.`,
          ],
        },
        { h3: 'Pricing the concentration' },
        {
          p: 'How much extra return does a concentrated position need to earn its place? For an investor at the optimum, the last dollar in a position with firm-specific volatility σ must earn',
        },
        {
          eq: 'required extra return = γ · k · w · σ²',
          caption: 'w: the position’s share of the portfolio. k: savings as a share of total retirement wealth. γ: risk aversion. The more of your wealth is still future savings, the less a concentrated position in the portfolio matters.',
        },
        { fig: 'hurdle' },
        {
          p: `{fig:hurdle} gives the hurdle for both. Early in a career k is small, so the single-name basket needs only a fraction of a percent a year to justify itself: ${f2(me.hurdles[1].tilt)}% at k of one quarter. I am not going to pretend the model condemns it. The employer stock is different in size. At k of one quarter it needs ${f2(me.hurdles[1].employer)}% a year over the market and at one half ${f2(me.hurdles[2].employer)}%, and that leaves out its link to my salary. The model’s verdict is to sell it when it can be sold. That is a statement about concentration, not about the company.`,
        },
        { h3: `The plan: ${plan.quarters} quarters` },
        {
          p: `I am not going to move in one day. The plan runs ${plan.quarters} quarterly steps, about three years, in the order that costs least in tax.`,
        },
        {
          list: [
            `<strong>Exchanges inside the Roth IRA, every quarter.</strong> The Roth holds one U.S. index fund. Moving part of it into international index funds realizes no tax. The international gap is ${f1(plan.needAbroad)}% of the portfolio; cash and the leveraged fund’s proceeds cover ${f1(plan.brokerageCash + plan.ggll)}%, so the Roth has to supply ${f1(plan.fromRoth)}%, or ${f2(plan.perQuarter)}% of the portfolio per quarter. At that pace the liquid portfolio reaches its international weight in quarter ${plan.quarters} even if the employer stock is never sold.`,
            `<strong>The 401(k) stays where it is.</strong> Its target-date fund is ${f1(fund.us + fund.intl + fund.em + fund.reit)}% stocks, ${f1(fund.intl + fund.em)} points of that international [39]. For my group that is already close to the target.`,
            `<strong>Idle brokerage cash and the leveraged fund, over the first four quarters.</strong> Selling the leveraged fund is taxable, but the tax is paid once and the drag is paid every year. At a ${r0(plan.taxRate * 100)}% rate on gains, even if the whole position were gain the tax equals ${f1(plan.breakEvenYears[2].years)} years of drag; if half were gain, ${f1(plan.breakEvenYears[1].years)} years (my arithmetic). The proceeds buy the global index.`,
            `<strong>New contributions go to whatever is furthest below target.</strong> I have not published my contribution rate, so the base plan leaves them out and {tab:whatif} shows what they would add.`,
            `<strong>Employer stock, when it vests and can be sold, in about quarter ${plan.employerSaleQuarter}.</strong> It is the largest single source of new money, about ${r0(plan.employerVsLiquid)}% of today’s liquid portfolio. Any sale happens only when the shares are mine and my employer’s trading rules allow it. The proceeds go first to whatever is below target and the rest into U.S. index funds. That finishes the move abroad ${plan.quarters - plan.employerSaleQuarter} quarters early, so the Roth exchanges stop at ${f1((plan.fromRoth / plan.quarters) * plan.employerSaleQuarter)}% moved instead of ${f1(plan.fromRoth)}%.`,
            `<strong>Other taxable positions are left alone.</strong> The single stocks, the sector fund, the small-cap value fund, silver and the private-company fund fail the model’s test, but by {tab:hurdle} the cost of holding them is small at my k, and selling means paying tax now. They shrink as a share of a growing portfolio and are sold when there is a loss to harvest.`,
          ],
        },
        { fig: 'mePath' },
        {
          p: `{fig:mePath} is the path with employer stock included. {fig:meTe} measures the distance to target each quarter. On the liquid portfolio the share that is off target falls from ${f1(plan.base[0].offTarget)}% to ${f1(plan.base[4].offTarget)}% in the first year, about ${f1((plan.base[0].offTarget - plan.base[4].offTarget) / 4)} points a quarter, then ${f2(plan.perQuarter)} points a quarter, and to ${f1(end.offTarget)}% once the employer stock is sold and reinvested. Tracking error on View A goes from ${f1(plan.base[0].te)}% a year to ${f1(plan.base[4].te)}% and then ${f1(end.te)}%. On View B it barely moves until the sale, from ${f1(plan.base[0].teB)}% to ${f1(plan.base[plan.employerSaleQuarter - 1].teB)}%, and then drops to ${f1(end.teB)}%. Most of my distance from the model is one position I cannot trade yet.`,
        },
        {
          eq: 'TE = √( d′Σd + Σ<sub>i</sub> w<sub>i</sub>² σ<sub>i</sub>² )',
          caption: 'TE: tracking error against the target. d: portfolio weights minus target weights, by asset class. Σ: the model’s covariance. w<sub>i</sub>, σ<sub>i</sub>: weight and firm-specific volatility of each single-name position.',
        },
        { fig: 'meTe' },
        { fig: 'whatif' },
        {
          p: `What is left at the end is ${f1(end.offTarget)}% off target: the legacy single names at ${f1(end.a.single)}% and the small positions inside the target-date fund. I can live with that. The plan does not depend on a forecast. If U.S. stocks keep winning for three more years I will have sold some of them too early, and I will still own ${r0(end.a.us)}% of the portfolio in them.`,
        },
      ],
    },

    {
      id: 'limits',
      heading: 'What would change my mind',
      blocks: [
        {
          p: 'The model is simple on purpose, and it is wrong in ways I can list.',
        },
        {
          list: [
            `<strong>The stock return.</strong> Everything scales with the premium. At Damodaran’s ${f2(X.damodaranReal)}% the balanced retiree holds ${r0(((X.damodaranReal - mu.tips) / (4 * M.vol ** 2)) * 1e4)}% in stocks, not ${r0(merton(4).today)}%. If real yields fell back to 1% with stock valuations unchanged, the premium would be ${f2(mu.eq - 1)} points and the share ${r0(((mu.eq - 1) / (4 * M.vol ** 2)) * 1e4)}%. The model should be re-run when prices move; the scripts are in the repository for that reason.`,
            `<strong>Returns are treated as independent from year to year.</strong> If stocks mean-revert, they are less risky over long horizons than this model says and the young should hold more. If my return estimates are wrong in a persistent way, they are more risky and everyone should hold less. I have not modeled either.`,
            `<strong>β and γ are choices.</strong> The three paycheck types and the six risk groups are labels I picked. The calculator lets a reader set their own.`,
            `<strong>What is left out.</strong> Taxes, Social Security as an asset, housing, annuities, and investors outside the U.S. Social Security alone would raise most retirees’ funded ratios and with them the stock share in {tab:retirees}.`,
            `<strong>The window is ${D.meta.windows.recent.months} months.</strong> {tab:windows} shows the answer on longer data. If stocks and bonds go back to hedging each other, long Treasuries come back into the portfolio.`,
          ],
        },
        {
          p: `None of that changes the main result, which rests on two published numbers: a ten-year TIPS yield of ${f2(mu.tips)}% and stock valuations that imply about ${f2(mu.eq)}%. While those hold, the portfolio that most advice calls balanced is taking nearly three times the risk its owner would choose with the prices in front of them.`,
        },
      ],
    },
  ] as Section[],

  sources: [
    { n: 1, text: 'U.S. Department of the Treasury. Daily Treasury par real yield curve rates. Values for November 9, 2026 and month-end history since 2003.', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_real_yield_curve&field_tdr_date_value=2026' },
    { n: 2, text: 'U.S. Department of the Treasury. Daily Treasury par yield curve rates. Values for November 9, 2026 and month-end history since 1990.', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026' },
    { n: 3, text: 'U.S. Department of the Treasury. Daily Treasury bill rates. 4-week coupon-equivalent yield, November 9, 2026.', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value=2026' },
    { n: 4, text: 'State Street Investment Management. Index characteristics of the S&P Composite 1500 Index (price/earnings, forward price/earnings, index dividend yield), as of November 6, 2026, from the page of the fund that tracks it.', url: 'https://www.ssga.com/us/en/intermediary/etfs/spdr-portfolio-sp-1500-composite-stock-market-etf-sptm' },
    { n: 5, text: 'State Street Investment Management. Index characteristics of the S&P Developed Ex-U.S. BMI Index, as of November 6, 2026, from the page of the fund that tracks it.', url: 'https://www.ssga.com/us/en/intermediary/etfs/spdr-portfolio-developed-world-ex-us-etf-spdw' },
    { n: 6, text: 'State Street Investment Management. Index characteristics of the S&P Emerging BMI Index, as of November 6, 2026, from the page of the fund that tracks it.', url: 'https://www.ssga.com/us/en/intermediary/etfs/spdr-portfolio-emerging-markets-etf-spem' },
    { n: 7, text: 'State Street Investment Management. Characteristics of the Bloomberg U.S. Corporate Bond Index (yield to worst, option-adjusted spread and duration), as of November 6, 2026, from the page of the fund that tracks it.', url: 'https://www.ssga.com/us/en/intermediary/etfs/spdr-portfolio-corporate-bond-etf-spbo' },
    { n: 8, text: 'State Street Investment Management. Characteristics of the ICE BofA US High Yield Index (yield to worst, option-adjusted spread and duration), as of November 6, 2026, from the page of the fund that tracks it.', url: 'https://www.ssga.com/us/en/intermediary/etfs/spdr-portfolio-high-yield-bond-etf-sphy' },
    { n: 9, text: 'Shiller, R. J. Online data: U.S. stock prices, dividends, earnings and CPI since 1871, with the cyclically adjusted price-earnings ratio and the excess CAPE yield. Monthly earnings through June 2024 in the file used.', url: 'https://shillerdata.com' },
    { n: 10, text: 'multpl.com. Shiller PE ratio (CAPE) by month, value for November 9, 2026, with the S&P 500 trailing P/E, earnings yield and dividend yield.', url: 'https://www.multpl.com/shiller-pe' },
    { n: 11, text: 'Damodaran, A. Implied equity risk premiums by month. Value for November 1, 2026.', url: 'https://pages.stern.nyu.edu/~adamodar/pc/implprem/ERPbymonth.xlsx' },
    { n: 12, text: 'Damodaran, A. Historical returns on stocks, bonds and bills, 1928–2025: annual returns on the S&P 500, 3-month Treasury bills, 10-year Treasury bonds, Baa corporate bonds and gold, with inflation.', url: 'https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls' },
    { n: 13, text: 'Nareit. FTSE Nareit U.S. Real Estate Index Series, monthly index values and returns, December 1971 to October 2026. All Equity REITs: total return, price index and dividend yield.', url: 'https://www.reit.com/data-research/reit-indexes/monthly-index-values-returns' },
    { n: 14, text: 'Giesecke, K., Longstaff, F. A., Schaefer, S., & Strebulaev, I. (2011). Corporate bond default risk: A 150-year perspective. Journal of Financial Economics, 102(2), 233–250. NBER Working Paper 15848.', url: 'https://www.nber.org/papers/w15848' },
    { n: 15, text: 'Altman, E. I., & Kuehne, B. J. (2014). Defaults and returns in the high-yield bond and distressed debt market: Review and outlook. In Contemporary Challenges in Risk Management, 203–253. Palgrave Macmillan. Weighted-average annual default rate 3.61%, 1971–2013.', url: 'https://econpapers.repec.org/RePEc:pal:palchp:978-1-137-44762-3_9' },
    { n: 16, text: 'Erb, C. B., & Harvey, C. R. (2013). The golden dilemma. Financial Analysts Journal, 69(4), 10–42. NBER Working Paper 18706.', url: 'https://www.nber.org/papers/w18706' },
    { n: 17, text: 'FTSE Russell. FTSE Global All Cap Index factsheet, data as at October 30, 2026: country breakdown. U.S. 62.89%; the emerging share is my sum of the markets FTSE classifies as emerging.', url: 'https://research.ftserussell.com/Analytics/FactSheets/Home/DownloadSingleIssue?issueName=GEISLMS&IsManual=false' },
    { n: 18, text: 'French, K. R. Data library: Fama/French research factors (U.S., from CRSP) and Fama/French developed ex U.S. and emerging markets factors (from Bloomberg), monthly through September 2026.', url: 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html' },
    { n: 19, text: 'State Street Investment Management. Daily net asset value histories of three funds, used as return proxies: a gold bullion trust (LBMA Gold Price), a high-yield bond fund (Bloomberg High Yield Very Liquid Index) and a corporate bond fund (Bloomberg U.S. Corporate Bond Index). Price returns, without distributions.', url: 'https://www.ssga.com/us/en/intermediary/etfs' },
    { n: 20, text: 'U.S. Bureau of Labor Statistics. Consumer Price Index for All Urban Consumers, all items, not seasonally adjusted (series CUUR0000SA0), through September 2026, via the BLS public data API.', url: 'https://www.bls.gov/cpi/' },
    { n: 21, text: 'Ledoit, O., & Wolf, M. (2004). Honey, I shrunk the sample covariance matrix. Journal of Portfolio Management, 30(4), 110–119.', url: 'https://doi.org/10.3905/jpm.2004.110' },
    { n: 22, text: 'Merton, R. C. (1969). Lifetime portfolio selection under uncertainty: The continuous-time case. Review of Economics and Statistics, 51(3), 247–257.', url: 'https://doi.org/10.2307/1926560' },
    { n: 23, text: 'Samuelson, P. A. (1969). Lifetime portfolio selection by dynamic stochastic programming. Review of Economics and Statistics, 51(3), 239–246.', url: 'https://doi.org/10.2307/1926559' },
    { n: 24, text: 'Bodie, Z., Merton, R. C., & Samuelson, W. F. (1992). Labor supply flexibility and portfolio choice in a life cycle model. Journal of Economic Dynamics and Control, 16(3–4), 427–449. NBER Working Paper 3954.', url: 'https://www.nber.org/papers/w3954' },
    { n: 25, text: 'Campbell, J. Y., & Viceira, L. M. (2001). Who should buy long-term bonds? American Economic Review, 91(1), 99–127. NBER Working Paper 6801.', url: 'https://www.nber.org/papers/w6801' },
    { n: 26, text: 'Cocco, J. F., Gomes, F. J., & Maenhout, P. J. (2005). Consumption and portfolio choice over the life cycle. Review of Financial Studies, 18(2), 491–533.', url: 'https://ideas.repec.org/a/oup/rfinst/v18y2005i2p491-533.html' },
    { n: 27, text: 'Benzoni, L., Collin-Dufresne, P., & Goldstein, R. S. (2007). Portfolio choice over the life-cycle when the stock and labor markets are cointegrated. Journal of Finance, 62(5), 2123–2167.', url: 'https://ideas.repec.org/a/bla/jfinan/v62y2007i5p2123-2167.html' },
    { n: 28, text: 'U.S. Census Bureau. Current Population Survey, 2026 Annual Social and Economic Supplement, table PINC-03: median earnings in 2025 of full-time, year-round workers by age.', url: 'https://www.census.gov/data/tables/time-series/demo/income-poverty/cps-pinc/pinc-03.html' },
    { n: 29, text: 'Board of Governors of the Federal Reserve System. 2025 Survey of Consumer Finances, historic tables: family net worth and before-tax income by age of reference person, in 2025 dollars.', url: 'https://www.federalreserve.gov/econres/scfindex.htm' },
    { n: 30, text: 'Vanguard (2026). How America Saves 2026. Average total contribution rate, participant and employer, 12.1% in 2025.', url: 'https://workplace.vanguard.com/content/dam/inst/iig-transformation/insights/pdf/has/how-america-saves-2026.pdf' },
    { n: 31, text: 'Social Security Administration, Office of the Chief Actuary. Actuarial life table: period life table, 2023.', url: 'https://www.ssa.gov/oact/STATS/table4c6.html' },
    { n: 32, text: 'Vanguard Target Retirement Funds, 2020 through 2070 and Income: issuer-reported holdings as of September 30, 2026 (June 30 for the 2070 fund), as republished by StockAnalysis. Stock shares by vintage are my arithmetic from those holdings.', url: 'https://stockanalysis.com/quote/mutf/VFIFX/holdings/' },
    { n: 33, text: 'Morningstar Manager Research (2026). 2026 Target-Date Fund Landscape. Median equity exposure 45 years from retirement 93% at the end of 2025.', url: 'https://www.morningstar.com/lp/tdf-landscape' },
    { n: 34, text: 'Bengen, W. P. (1994). Determining withdrawal rates using historical data. Journal of Financial Planning, October 1994, 14–24. Summarized in “Trinity study,” Wikipedia.', url: 'https://en.wikipedia.org/wiki/Trinity_study' },
    { n: 35, text: 'Vanguard. Our approach to target-date funds. Firm share of target-date assets under management, 38%.', url: 'https://workplace.vanguard.com/investment/strategies/target-date-funds-approach.html' },
    { n: 36, text: 'Campbell, J. Y., Lettau, M., Malkiel, B. G., & Xu, Y. (2001). Have individual stocks become more volatile? An empirical exploration of idiosyncratic risk. Journal of Finance, 56(1), 1–43. NBER Working Paper 7590, Table 3: annualized variance of a typical stock, July 1962 to December 1997, split into market, industry and firm components.', url: 'https://www.nber.org/papers/w7590' },
    { n: 37, text: 'Bessembinder, H. (2018). Do stocks outperform Treasury bills? Journal of Financial Economics, 129(3), 440–457.', url: 'https://econpapers.repec.org/RePEc:eee:jfinec:v:129:y:2018:i:3:p:440-457' },
    { n: 38, text: `Brockmeier, C. (2026). ${paper2026.title}. Companion paper on this site.`, url: 'https://charliebrockmeier.com/writing/illiquidity-premium' },
    { n: 39, text: 'Schwab Target 2065 Index Fund: issuer-reported holdings as of September 30, 2026, as republished by StockAnalysis (the fund sponsor’s own site could not be reached when this was built). Used for the look-through of the target-date 2065 index fund I hold, which follows the same glide path.', url: 'https://stockanalysis.com/quote/mutf/SWYOX/holdings/' },
    { n: 40, text: 'Nasdaq. Historical quotes: month-end closing prices, November 2016 to November 2026, for the listed securities named in the “My own portfolio” section, and last sale of RVII on November 9, 2026. Prices are not adjusted for dividends.', url: 'https://www.nasdaq.com/market-activity/quotes/historical' },
  ],
};
