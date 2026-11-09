// The 2026 rewrite of Charlie's illiquidity premium paper. Prose lives here as small
// blocks; charts and tables live in paper2026-figures.ts. Inline [n] marks cite the
// numbered sources at the end. Every number in the text comes from a cited public
// source or is labeled as Charlie's own arithmetic.

export type Block =
  | { p: string }
  | { h3: string }
  | { eq: string; caption?: string }
  | { list: string[]; ordered?: boolean }
  | { fig: string }
  | { calc: true };

export type Section = { id: string; heading: string; blocks: Block[] };

export const paper2026 = {
  title: 'The Illiquidity Premium, Revisited',
  subtitle: 'What working in private markets taught me about getting paid to wait',
  slug: 'illiquidity-premium',
  firstVersion: 'May 2025',
  rewritten: 'November 2026',
  original: '/writing/illiquidity-premium-2025',
  pdf: '/writing/illiquidity-premium-2026.pdf',
  description:
    'A numbers-first rewrite of my 2025 capstone paper on the illiquidity premium: what theory says it should be, what public and private markets actually pay, what the secondary market charges for liquidity, what happened when liquidity disappeared in 2009, 2022 and 2026, and how I would underwrite it now.',
  disclaimer:
    'Views are my own and not those of my employer. Nothing here is investment advice. Every figure comes from a public source cited at the end, or is labeled as my own arithmetic; none comes from my employer’s data or products, or from any client.',

  keyPoints: [
    '<strong>In public markets the premium is small and mostly a crisis premium.</strong> Equally safe Treasury bonds differ in yield by only 10 to 16 basis points for liquidity in normal times [8], and the premium for holding illiquid U.S. stocks fell from about 1.8% a year in the 1960s to roughly zero outside the smallest stocks [7]. What still pays is liquidity <em>risk</em>: owning assets that crash when liquidity dries up, worth 7.5% a year in the original estimate [5, 6].',
    '<strong>Buyouts beat the S&amp;P 500 by 2.4 points a year over 25 years, and by 0.1 point over the last 10.</strong> Cambridge Associates’ U.S. private equity index returned 12.4% a year against 10.0% for the same cash flows invested in the S&amp;P 500, but 15.2% against 15.1% over the decade to 2025 [24]. Adjust for leverage, size and value and most of the long-run gap goes too [20, 21].',
    '<strong>The secondary market quotes the price of liquidity, and for buyouts it is cheap.</strong> LP stakes in buyout funds sold for 92% of NAV in 2025, venture for 78% and real estate for 70% [54]. In 2009 buyout stakes traded near 54% [59]. Secondary volume reached a record $240 billion in 2025 [54].',
    '<strong>Liquidity disappears when you need it.</strong> Buyout distributions have run below 15% of NAV for four straight years, against 29% in 2014–2017 [62, 63]. In 2026, redemption requests at large semi-liquid credit and private equity funds ran at up to three times their 5% quarterly caps [68–72].',
    '<strong>Private credit has the most visible premium, and the easiest one to overpay for.</strong> The Cliffwater Direct Lending Index earned 9.3% in 2025 against 5.9% for leveraged loans [32, 34], with realized losses near 1% a year over two decades [32, 33]. Like-for-like, the spread over syndicated loans is closer to 1.5 points [35], and defaults among Fitch’s privately rated borrowers hit a record 9.2% in 2025 [36].',
  ],

  take:
    'My take: the illiquidity premium is real, but for most investors in most recent vintages it has been smaller than the fees charged to deliver it, and it is not the main reason private markets did well. What investors get paid for is bearing liquidity risk at the worst moment, plus whatever skill their managers have. The investors who earn it are the ones who can supply liquidity when others can’t: they commit steadily, keep a liquidity budget they never raid, buy in the secondary market when sellers are forced, and refuse to pay extra for smoothed marks that hide risk. A semi-liquid fund that promises both a premium and liquidity can deliver one of the two.',

  sections: [
    {
      id: 'theory',
      heading: 'What the premium is',
      blocks: [
        {
          p: 'The 2025 version of this paper defined the illiquidity premium as the extra return an investor should demand for holding an asset that cannot be sold quickly at fair value. That definition holds, but it hides two different things. The first is the cost of illiquidity in normal times: trading costs, the time it takes to sell, the lockup itself. The second is liquidity risk, the chance that an asset becomes hard to sell exactly when its owner most needs cash. Theory says both should be priced. The evidence says the second matters more.',
        },
        { p: 'Four models carry most of the weight. Each answers a different question, and private funds sit in the space between them.' },
        { h3: 'Trading costs and clienteles (Amihud and Mendelson, 1986)' },
        {
          p: 'If an asset costs S to trade round trip and its holder trades it every 1/μ years, the holder loses about μ·S a year to trading. In equilibrium the asset’s expected return has to cover that loss for its marginal holder [1]:',
        },
        {
          eq: 'E[r<sub>j</sub>] − r<sub>f</sub> ≈ μ<sub>i</sub> · S<sub>j</sub>',
          caption: 'S<sub>j</sub>: proportional round-trip trading cost of asset j. μ<sub>i</sub>: how often its marginal holder trades, one over the expected holding period.',
        },
        {
          p: 'The useful part is the clientele effect. Long-horizon investors end up holding the expensive-to-trade assets because they spread the cost over many years, so the premium rises with the spread but at a falling rate. On NYSE stocks from 1961 to 1980, a stock with a 1.5% spread earned 0.45 percentage points a month more than one with a 0.5% spread, while a 5% spread stock earned only 0.09 points a month more than a 4% one [2]. That concavity is the theoretical case for endowments. An investor who rarely trades can collect a premium priced for someone who trades more often.',
        },
        { h3: 'Liquidity as a risk (Acharya and Pedersen, 2005)' },
        { p: 'The liquidity-adjusted CAPM nets trading costs c out of returns and asks which covariances investors care about [3]:' },
        {
          eq: 'E[r<sub>i</sub> − r<sub>f</sub>] = E[c<sub>i</sub>] + λ (β<sub>1i</sub> + β<sub>2i</sub> − β<sub>3i</sub> − β<sub>4i</sub>)',
          caption:
            'Each β divides a covariance by var(r<sub>M</sub> − c<sub>M</sub>). β<sub>1</sub>: cov(r<sub>i</sub>, r<sub>M</sub>), ordinary market risk. β<sub>2</sub>: cov(c<sub>i</sub>, c<sub>M</sub>), the asset gets illiquid when the market does. β<sub>3</sub>: cov(r<sub>i</sub>, c<sub>M</sub>), the asset’s return when market liquidity dries up. β<sub>4</sub>: cov(c<sub>i</sub>, r<sub>M</sub>), the asset’s liquidity when the market falls.',
        },
        {
          p: 'The three extra betas all charge for the same bad state: prices fall and nothing trades. An asset that becomes illiquid when the market falls, or falls when market liquidity dries up, needs a higher expected return. Acharya and Pedersen estimate that liquidity risk adds about 1.1 percentage points a year to the return gap between illiquid and liquid U.S. stocks, on top of the level effect [3].',
        },
        {
          p: 'For private markets this is the right lens. A buyout fund’s lockup is not the problem in itself. The problem is that the lockup binds in exactly the state the model charges for, when public portfolios are down, distributions stop and capital calls keep coming.',
        },
        { h3: 'The option to sell (Longstaff, 1995)' },
        {
          p: 'Longstaff asked how much the freedom to sell could possibly be worth. Picture an investor with perfect timing who could sell at the best price during a lockup of T years. A lockup costs that investor at most the value of a lookback option on the asset, which has a closed form [4]:',
        },
        {
          eq: 'F(T, σ) = (2 + σ²T/2) · N(√(σ²T) / 2) + √(σ²T / 2π) · e<sup>−σ²T/8</sup> − 1',
          caption: 'F: upper bound on the cost of a T-year lockup, as a fraction of the asset’s value. σ: annual volatility of the asset. N: the standard normal distribution function.',
        },
        {
          p: 'Two things make this formula useful in diligence. It needs only two inputs, and it is an upper bound, so it tells you where a claimed premium stops being plausible. Figure 1 plots it as a discount to value. A two-year lockup on an asset with 22% volatility, about what a leveraged buyout shows once smoothing is stripped out [17], is worth at most a 21% discount. Ten years is worth at most 41%. Volatility matters as much as time: ten years on a loan book with 10% volatility caps out at 22%.',
        },
        { fig: 'longstaff' },
        {
          p: 'Spread over the lockup, the bound falls per year as the lockup gets longer, because it grows roughly with the square root of time. For a ten-year fund at 22% volatility it works out to 5.4% a year. That is close to the 3% to 5% that LPs have traditionally asked of private equity over public equity, which makes a useful check: the traditional hurdle is roughly what a perfectly timed seller would need. No one is perfectly timed, so a rational investor needs less. Section 7 turns this into an underwriting rule.',
        },
        { h3: 'Liquidity risk as a factor (Pástor and Stambaugh, 2003)' },
        {
          p: 'Pástor and Stambaugh measured market-wide liquidity from return reversals. When liquidity is poor, order flow pushes prices further and they bounce back harder the next day. For each stock in each month they estimate [5]:',
        },
        {
          eq: 'r<sup>e</sup><sub>i,d+1</sub> = θ<sub>i</sub> + φ<sub>i</sub> r<sub>i,d</sub> + γ<sub>i</sub> · sign(r<sup>e</sup><sub>i,d</sub>) · v<sub>i,d</sub> + ε<sub>i,d+1</sub>',
          caption:
            'r<sup>e</sup>: daily return in excess of the market. v: dollar volume. γ: the reversal per dollar of signed volume, more negative when the stock is less liquid. Averaging γ across stocks gives aggregate liquidity, and a stock’s liquidity beta is its exposure to shocks in that aggregate.',
        },
        {
          p: 'Stocks with high liquidity betas earned 7.5% a year more than stocks with low ones from 1966 to 1999, after adjusting for market, size, value and momentum [5]. Twenty years later two independent replications reproduced the measure, and both found the premium larger after 1999 than before [6]. Few anomalies have held up that well out of sample.',
        },
        {
          p: 'Put together, the four models say one thing. The level of illiquidity earns a modest premium that shrinks as markets get cheaper to trade. Exposure to liquidity crashes earns a larger and more durable one. Private funds carry both, plus a feature none of these models covers: the investor cannot see the price.',
        },
      ],
    },
    {
      id: 'measurement',
      heading: 'Measuring it is the hard part',
      blocks: [
        {
          p: 'In public markets the premium is a regression. In private markets it is an argument about measurement, and most of the disagreement in the literature is really about which yardstick to use. Four problems matter: the return metric, stale prices, leverage and factor exposure, and fees. Fees get their own section later.',
        },
        { h3: 'IRR, TVPI, PME and direct alpha' },
        {
          p: 'Funds report two numbers. The internal rate of return (IRR) is the discount rate that sets the fund’s cash flows to zero. Total value to paid-in (TVPI) is distributions plus remaining NAV, divided by capital called. Neither says whether the investor beat what a public portfolio would have earned on the same cash flows. Kaplan and Schoar’s public market equivalent (PME) does, by growing every cash flow at the realized return of a public index [13]:',
        },
        {
          eq: 'PME = Σ<sub>t</sub> D<sub>t</sub> · (I<sub>T</sub> / I<sub>t</sub>) ÷ Σ<sub>t</sub> C<sub>t</sub> · (I<sub>T</sub> / I<sub>t</sub>)',
          caption: 'D<sub>t</sub>: distributions, with ending NAV counted as a final distribution. C<sub>t</sub>: capital calls. I<sub>t</sub>: level of the public index. A PME above 1.0 means the fund beat the index.',
        },
        {
          p: 'Direct alpha takes the same index-compounded cash flows and solves for their IRR, which turns the ratio into an annual excess return [14]. A PME above one and a positive direct alpha say the same thing. I use direct alpha when I want a number in percent a year to compare with a hurdle, and PME when I want to know how many dollars ahead an LP ended up.',
        },
        { h3: 'Why IRR misleads' },
        {
          p: 'IRR rewards timing, not wealth. Take a fund that calls $100 and returns $200 five years later: a 14.9% IRR and a 2.0x multiple. Now let it bridge the first year with a subscription credit line at 6%, so the LP wires the money a year later and the fund pays $6 of interest. The LP now gets $194, four years after paying in. The multiple falls to 1.94x and the IRR rises to 18.0%. The investor is poorer and the headline number is better. (The example is my own arithmetic.)',
        },
        {
          p: 'Across real funds the effect is smaller but runs one way. Schillinger, Braun and Cornel simulated subscription-line use across 6,353 buyout deals in 700 funds and found that drawing a line for six months or less raised the median net IRR by 0.20 points and the mean by 0.47 points, with multiples barely changed [15]. When I diligenced funds I asked for IRR with and without the facility. A manager who would not show both was telling me something.',
        },
        { h3: 'Stale prices and smoothed returns' },
        {
          p: 'Private assets are marked by appraisal, usually quarterly, and appraisers anchor on the last mark. Getmansky, Lo and Makarov model a reported return as a weighted average of current and past true returns [16]:',
        },
        {
          eq: 'R°<sub>t</sub> = θ<sub>0</sub>R<sub>t</sub> + θ<sub>1</sub>R<sub>t−1</sub> + … + θ<sub>k</sub>R<sub>t−k</sub>, with Σθ<sub>j</sub> = 1, so σ°² = (Σθ<sub>j</sub>²) · σ²',
          caption: 'R°: reported return. R: true economic return. Because Σθ<sub>j</sub>² is below one whenever the weights are spread over several quarters, reported volatility understates true volatility and reported Sharpe ratios overstate risk-adjusted performance.',
        },
        {
          p: 'Desmoothing inverts the filter. Regressing private returns on several lags of public returns, rather than only the current quarter, recovers most of the hidden beta. Anson did this for private capital from 1998 to 2022. Unsmoothed volatility doubled for small buyouts and tripled for early-stage venture, while private credit barely moved [17]. Figure 2 shows the gap.',
        },
        { fig: 'vol' },
        {
          p: 'Cliff Asness calls this volatility laundering [18]. His argument is that investors pay for the smoothing. An institution that reports a private portfolio with 10% volatility gets to hold more of it, rebalance less and explain fewer drawdowns to its board. If investors value that, they will accept a lower return for it, and the illiquidity premium can turn negative without anyone noticing.',
        },
        {
          p: 'I think he is right about the mechanism and that its size depends on the investor. A pension whose board reads quarterly marks gets real value from smoothing. An individual who will need the cash in year four gets none, and is the one most likely to sell at a stale price that someone else profits from.',
        },
        { h3: 'Leverage, size and value' },
        {
          p: 'The last adjustment is risk. A buyout fund buys companies smaller than those in the S&amp;P 500, often cheaper on earnings multiples, and adds debt. Compare it with the S&amp;P 500 and you credit the manager with the premia for size, value and leverage.',
        },
        {
          p: 'Phalippou and Gottschalg, correcting for stale NAVs and sample bias, found that the average fund trailed the S&amp;P 500 by 3% a year net of fees, and by 6% a year after adjusting for risk [19]. L’Her and coauthors built a bottom-up benchmark that levers a size- and sector-matched public index to each fund’s portfolio, and found no significant outperformance on a dollar-weighted basis [20].',
        },
        {
          p: 'Stafford’s replication is the most striking result [21]. A passive portfolio of small, low-EBITDA-multiple public stocks with modest leverage, valued at hold-to-maturity accounting instead of market prices, produced a return distribution very close to the pre-fee private equity index. The accounting alone changes the risk numbers: the same portfolio that shows a beta near 2 when marked to market shows a beta statistically indistinguishable from zero when marked like a private fund. The low risk lives in the bookkeeping.',
        },
      ],
    },
    {
      id: 'evidence',
      heading: 'The evidence, market by market',
      blocks: [
        { p: 'Table 1 summarizes what each market appears to pay for illiquidity, on the best public evidence I could find. The subsections show the work.' },
        { fig: 'scoreboard' },
        { h3: 'Public bonds and equities' },
        {
          p: 'The cleanest test of a pure liquidity premium is two bonds with the same cash flows and the same credit that differ only in how easily they trade. Longstaff compared Treasuries with bonds issued by Refcorp, which carry the same full government guarantee, and found Refcorp yields 10 to 16 basis points higher from 1991 to 2001. The liquidity premium was worth more than 15% of the value of some Treasury bonds, and it widened when investors fled to safety [8]. Krishnamurthy showed the newest 30-year Treasury yielding 12 basis points less than the previous issue, a bond with almost the same cash flows, on a single day in February 2001 [9].',
        },
        {
          p: 'That is a small premium in normal times and a large one in a panic. March 2020 made the point at scale. Dealers could not absorb the selling, bid-ask spreads in the deepest market in the world blew out, and the Federal Reserve bought nearly $2 trillion of Treasury notes and bonds in 2020 to restore it [12].',
        },
        {
          p: 'In corporate bonds, Longstaff, Mithal and Neis used credit default swaps to split spreads into default and everything else. Default explained 51% of the spread on AAA and AA bonds, 56% on A, 71% on BBB and 83% on BB [10]. The non-default part, which moves with bond-level and market-wide illiquidity, is about half the spread on the safest bonds. Chen, Lesmond and Wei found that liquidity explains up to half of the cross-sectional variation in spread levels [11]. An investor who wants a liquidity premium with daily marks and no lockup can collect one in high-grade corporate bonds.',
        },
        {
          p: 'In stocks, the premium for illiquidity as a characteristic has faded. Ben-Rephael, Kadan and Wohl found it fell from about 1.8% a year in the 1960s and early 1970s to an amount indistinguishable from zero, except among the smallest stocks [7]. The premium for liquidity risk has not faded [6]. Public markets are telling you which kind of illiquidity gets paid: the kind that hurts in a crash.',
        },
        { h3: 'Buyouts' },
        {
          p: 'The best academic evidence on buyouts is more favorable than the replication work above, which is why the debate has lasted. Harris, Jenkinson and Kaplan, using cash flows reported by institutional investors, found that buyout funds beat the S&amp;P 500 by 20% to 27% over a fund’s life, or more than 3% a year [22]. A later study by the same authors with Stucke put the average buyout PME at 1.20, falling to 1.11 for vintages after 2005 [23]. Kaplan and Schoar’s earlier sample found average net returns about equal to the S&amp;P 500 [13].',
        },
        {
          p: 'The most current public benchmark tells the same story through time. Cambridge Associates’ U.S. private equity index, which covers 1,769 buyout and growth equity funds, returned 12.4% a year over the 25 years to December 2025, against 10.0% for the same cash flows invested in the S&amp;P 500. Over the last ten years the gap was 0.1 points, and public markets won most horizons shorter than ten years [24]. Figure 3 shows each horizon.',
        },
        { fig: 'ca' },
        {
          p: 'Three forces explain the shrinking gap. Purchase prices rose as capital crowded into the strategy. Debt got more expensive after 2022, which removed the cheapest source of buyout returns. And exits slowed, which leaves more of recent performance as unrealized marks [62, 63]. Cambridge also notes that private equity beat the Russell 2000 more often than it beat the S&amp;P 500 [24], which is what you would expect if much of the historical edge came from owning smaller companies with debt.',
        },
        {
          p: 'Forward-looking estimates point the same way. AQR’s 2026 capital market assumptions, as summarized in public coverage, put expected real returns on U.S. buyouts at roughly 4.2% a year against roughly 3.9% for U.S. large-cap stocks [26]: a gap of about 0.3 points before accounting for the extra leverage in buyouts. Ilmanen, Chandra and McQuinn concluded that private equity no longer offers the net-of-fee edge it did 15 to 20 years ago, looking either backward or forward [25].',
        },
        { h3: 'Venture capital' },
        {
          p: 'Venture is where averages mislead most. Correlation Ventures looked at more than 21,000 financings from 2004 to 2013 and found that 65% returned less than the capital invested and 4% returned ten times or more [28]. Horsley Bridge’s data on about 7,000 investments by funds it backed from 1985 to 2014 showed that the 6% of deals returning at least ten times produced 60% of all returns [29]. With payoffs that skewed, the asset-class average tells you little about what any one LP earns.',
        },
        {
          p: 'Fund-level data agree. Harris, Jenkinson and Kaplan found that venture funds beat public equities in the 1990s and trailed them in the 2000s [22]. PitchBook puts the gap between top- and bottom-quartile venture funds at close to 20 percentage points of IRR [30]. Venture had a strong 2025, when the Cambridge U.S. venture index returned 21.1% [24], but PitchBook notes that the AI boom drove it, with gains concentrated in the largest funds and a few blockbuster IPOs [31].',
        },
        {
          p: 'Venture is also where performance persistence has held up. For buyouts, Harris, Jenkinson, Kaplan and Stucke find little persistence after 2000 using only what an investor knows at fundraising. For venture it persists, though more weakly than before [23]. In venture, access is the premium. A venture allocation without the top managers is a bet on the median of a power law, and the median of a power law is poor.',
        },
        { h3: 'Private credit' },
        {
          p: 'Private credit gives the most measurable premium because loans pay contractual coupons. The Cliffwater Direct Lending Index returned 9.3% in 2025, 10.4% of it from interest income [32]. The Morningstar LSTA U.S. Leveraged Loan Index, which holds broadly syndicated loans to larger companies, returned 5.90% [34]. Over twenty years the direct lending index has averaged roughly 9.5% a year, with realized credit losses of about 1% a year [32, 33].',
        },
        {
          p: 'Not all of the 3.4-point gap in 2025 is an illiquidity premium. Direct loans go to smaller companies, often with more leverage, and the spread pays for both. On comparable buyout loans, Morgan Stanley Investment Management cites an average spread of 153 basis points over the syndicated market [35]. That is my best estimate of the pure illiquidity premium in senior corporate lending: about 1.5 points a year before fees, which is attractive precisely because loan funds charge less than equity funds.',
        },
        {
          p: 'The credit cycle is now testing it. Fitch’s default rate for the private credit borrowers it rates privately reached a record 9.2% in 2025, up from 8.1% in 2024 [36]. The IMF had already flagged a market of about $2 trillion for fragile borrowers, layered leverage, semi-liquid vehicles and stale valuations [37]. The BIS has examined how much of BDC lending goes to software companies exposed to AI disruption [38], and J.P. Morgan Asset Management puts that exposure at about 20% of BDC portfolios [39]. After the failures of Tricolor and First Brands in the fall of 2025, Jamie Dimon warned that “when you see one cockroach, there are probably more” [40].',
        },
        {
          p: 'None of this says the premium is gone. It says that private credit’s low reported volatility, 8% reported and 9% desmoothed in Anson’s data [17], describes the last cycle and says nothing about a default cycle.',
        },
        { h3: 'Private real estate' },
        {
          p: 'Real estate is the best natural experiment on smoothing, because similar buildings trade in two wrappers. REITs trade every second. Private core funds and the NCREIF Property Index (NPI) are appraised. Figure 4 shows calendar-year returns for both from 2021 to 2025.',
        },
        { fig: 'reits' },
        {
          p: 'In 2022 REITs lost 25% while the NPI gained about 5.5%. The NPI did not post a losing quarter until the fourth, at −3.5% [41, 42, 48]. In 2023 the order reversed: REITs gained 11.4% while appraisals finally caught down and the NPI lost 7.9% [43, 48]. Over the five years the two compound to similar places, about +21% for the unlevered NPI and about +27% for REITs, by my arithmetic from the annual figures.',
        },
        {
          p: 'The private wrapper did not avoid the 2022 repricing. It booked it a year late. Anyone who redeemed from a private real estate fund at 2022 appraisals was paid out at stale, high values, at the expense of the investors who stayed. I find no premium for illiquidity in core real estate over this cycle, only a delay.',
        },
        { h3: 'Infrastructure' },
        {
          p: 'Infrastructure is sold on stable, inflation-linked cash yields. Fund data do not show that. Andonov, Kräussl and Rauh found that the cash flows of closed-end infrastructure funds are about as volatile and cyclical as those of other private equity, that returns depend on quick exits in the same way, and that risk-adjusted performance is weak [49]. Public pension funds, the biggest buyers, did worse than private investors, and the authors attribute 25% to 40% of their higher allocations and about 30% of their underperformance to ESG preferences and regulation [49].',
        },
        {
          p: 'The illiquidity in infrastructure is real. I have not seen public evidence of a premium for it beyond what listed infrastructure plus leverage would provide.',
        },
      ],
    },
    {
      id: 'secondaries',
      heading: 'Secondaries: the market price of illiquidity',
      blocks: [
        {
          p: 'Everything above infers the premium from returns. The secondary market prices it directly. When an LP sells a fund stake, the buyer’s price is quoted as a percentage of the latest NAV. The discount is what the seller gives up for cash today, plus any disagreement about whether the NAV is right. No other number in private markets is closer to a quote for illiquidity.',
        },
        { fig: 'secpricing' },
        {
          p: 'Figure 5 shows Jefferies’ average prices for LP portfolios. Buyout stakes have sold within a few points of NAV in every year since 2023: 91% in 2023, 94% in 2024, 92% in 2025 and 91% in the first half of 2026 [52–55]. Venture has been far cheaper, at 68% in 2023, 75% in 2024 and 78% in 2025 [52–54]. Real estate fell to 70% in 2025 [54]. The 2022 line shows how fast pricing moves when public markets fall: the average across strategies dropped 11 points in a year [51].',
        },
        {
          p: 'These discounts convert into an implied premium. If a buyout stake with about four years of remaining life sells at 92% of a fair NAV, the buyer earns (1/0.92)<sup>1/4</sup> − 1, about 2.1% a year, on top of the fund’s own return. The same arithmetic gives about 5.1% a year for venture at 78% over five years. These are rough, because they assume the NAV is right and the remaining life is what I guessed. But they land close to the theory. The market charges about 2 points a year to take buyout illiquidity off a seller’s hands, and more than twice that for venture, where NAVs are trusted less and remaining lives are longer.',
        },
        {
          p: 'In a crisis the quote collapses. Nadauld, Sensoy, Vorkink and Weisbach studied secondary transactions from 2006 to 2014 and found an average discount of 13.8% of NAV, closer to 9% for the typical four- to nine-year-old fund, and larger discounts when the economy was weak [59]. In their data buyout stakes changed hands at about 54% of NAV in 2009. Over four years that discount is worth roughly 17% a year to the buyer on top of the fund’s return. That is the liquidity premium in its purest form, paid by forced sellers to whoever has cash.',
        },
        { fig: 'secvolume' },
        {
          p: 'The market has grown into a real source of liquidity. Jefferies counted $132 billion of volume in 2021, $108 billion in 2022, about $112 billion in 2023 and $162 billion in 2024 [51–53, 56], then a record $240 billion in 2025 [54]. Lazard’s independent estimate for 2025 is $233 billion, split almost evenly between LP-led and GP-led deals [57]. The first half of 2026 set another record, $118 billion by Jefferies’ count, with GP-led deals at $62 billion or 53% of the total [55]. Dedicated secondary capital reached a record $327 billion in 2025 [54].',
        },
        {
          p: 'Most of the growth is GP-led. In a continuation vehicle the manager moves one or more companies from an old fund into a new vehicle it also manages, and existing LPs choose to cash out or roll. Continuation vehicles made up 89% of GP-led volume in the first half of 2026 [55]. Evercore found that most single-asset deals priced at NAV and about 14% priced above it [58].',
        },
        {
          p: 'A price at or above NAV on an asset the GP chose to keep is not evidence of a small liquidity discount. It is evidence that the GP picked its best asset. The LP deciding whether to roll should know that the person setting the price is on both sides of the trade.',
        },
        {
          p: 'Even the most patient investors now use this market. In 2025 Yale was reported to be close to selling about $2.5 billion of private equity and venture stakes at a discount of less than 10% to NAV [60]. A decade ago a sale like that would have read as distress. Today it is portfolio management, and the price shows how little buyers ask for taking quality buyout exposure off a seller’s hands in a calm market.',
        },
      ],
    },
    {
      id: 'stress',
      heading: 'When liquidity disappears',
      blocks: [
        {
          p: 'Liquidity is not a fixed property of an asset. It is a property of an asset in a particular market, and it disappears in the states of the world where investors need it. Every private-markets stress episode has the same three parts: public portfolios fall, distributions stop, and capital calls keep coming.',
        },
        { h3: '2008–09: the denominator effect' },
        {
          p: 'Harvard’s endowment lost 27.3% in fiscal 2009, falling from $36.9 billion to $26.0 billion, and Yale’s lost 24.6% [61]. Harvard, which also carried large uncalled commitments, cut them by about $3 billion [61], in a secondary market where buyout stakes traded at about half of NAV [59].',
        },
        {
          p: 'The mechanism is arithmetic. Take a portfolio that is 70% public and 30% private. Public equities fall 25%. Private marks, which lag, fall 5%. The private share rises from 30% to 35% without the investor doing anything, and with capital calls still arriving it keeps rising. The investor is now overweight the asset it cannot sell and has to sell what it can, near the bottom. (This example is mine.)',
        },
        { h3: '2022–25: distributions dry up' },
        {
          p: '2022 repeated the denominator effect on a smaller scale, and the aftermath has lasted longer. Exits slowed as rates rose, and buyout funds stopped returning cash. Bain reports that distributions averaged 29% of NAV from 2014 to 2017 and fell to 11% in 2024, the lowest in more than a decade [62]. They recovered only to about 14% in 2025, the fourth straight year below 15%, an industry record [63]. Bain’s mid-2026 update puts the implied capital cycle at about seven years [64].',
        },
        { fig: 'dist' },
        {
          p: 'For an LP whose pacing model assumed distribution yields of 25% to 30%, this is the liquidity crisis, even without a market crash. Commitments made in 2021 against expected distributions are being funded from other assets. That is why secondary volume set records in 2024 and 2025 while private equity returns were ordinary: sellers were buying liquidity, not escaping losses.',
        },
        { h3: 'Semi-liquid funds and their gates' },
        {
          p: 'Evergreen and semi-liquid funds promise periodic liquidity, usually up to 5% of NAV a quarter, while holding assets that cannot meet a run. Their gates are not a malfunction. They are how the product works under stress, and the stress has now arrived twice.',
        },
        {
          p: 'The first test was BREIT. In November 2022 redemption requests exceeded its limits of 2% of NAV a month and 5% a quarter, and it paid 43% of each request [65]. Requests peaked at $5.3 billion in January 2023 [66]. The fund prorated for 15 months, returned more than $15 billion over that stretch, and paid all requests again in February 2024 [66]. In between, the University of California invested $4 billion, with Blackstone pledging $1 billion of its own BREIT shares to backstop an 11.25% annualized net return for UC over six years [67]. An investor willing to supply liquidity to a gated fund was paid well for it, on terms only an institution could negotiate.',
        },
        {
          p: 'The second test is this year, and it is in private credit. Figure 6 plots quarterly redemption requests at large semi-liquid funds in 2026 against the share of requested money investors actually received.',
        },
        { fig: 'gates' },
        {
          p: 'Requests at Apollo Debt Solutions reached 11.2% of shares in the first quarter, 16.8% in the second and 14.7% in the third, and the fund paid 5% each time [68, 69]. Ares Strategic Income Fund paid 5% of shares in the first quarter, which was 43.1% of what holders asked for [70]. Blackstone’s BCRED met all of a 7.9% request in the first quarter by raising its cap to 7% while Blackstone and its employees bought shares, then paid 5% against requests of about 10% in the second [71]. Partners Group capped its Luxembourg evergreen fund at 5% when requests approached 10% of NAV, and its U.S. private equity master fund when they reached about 6% [72]. Fitch expects requests to stay above 5% through 2026, and judges that its rated BDCs can keep paying 5% a quarter for a year without new money coming in [73].',
        },
        {
          p: 'Every point in Figure 6 sits on or near the curve 5% divided by requests. That curve is the whole product. A quarterly liquidity promise is a promise of 5% of NAV, shared among everyone who asks. When one shareholder in eight asks, each gets about 40 cents on the dollar, and the rest waits in a queue that lengthens as unfilled requests are resubmitted.',
        },
        {
          p: 'The price of skipping the queue is now quoted too. Cox Capital has made tender offers for shares of several non-traded BDCs at 13% to 30% below their reported NAVs [74]. Ares told shareholders that none of its Class I holders took an earlier offer [74]. Both facts are informative. Most holders would rather wait than pay 15% for cash today, and the ones who can’t wait now have a price.',
        },
        { h3: 'NAV loans and continuation vehicles' },
        {
          p: 'Managers have built tools to manufacture liquidity without selling. NAV loans borrow against a fund’s portfolio, often to pay distributions. Oaktree, majority owner of the NAV lender 17Capital, sized that market at about $44 billion in 2023 and more than $70 billion in 2025 [75]. Continuation vehicles extend holding periods while offering LPs an exit [55, 58].',
        },
        {
          p: 'Both can help an LP who needs cash. Both also turn an illiquidity problem into something else: leverage on the LP’s own equity in the case of NAV loans, and a conflicted price in the case of continuation vehicles. A distribution funded by a NAV loan is not DPI in any sense that matters. It is a loan against the investor’s own assets, with interest.',
        },
      ],
    },
    {
      id: 'owners',
      heading: 'Who should own illiquidity, and how much',
      blocks: [
        {
          p: 'Theory is clear about who should hold illiquid assets: investors whose horizon is longer than the lockup and whose need for cash is low and predictable. That describes a perpetual endowment better than a pension, and a pension better than an individual. The industry’s growth is running in the other direction.',
        },
        { h3: 'Endowments and pensions' },
        {
          p: 'U.S. college endowments held about 54% of their assets in private and alternative strategies in fiscal 2025, including real assets, and returned 10.9% on average [76, 78]. Allocations scale with size: institutions under $50 million held 12.5% in alternatives, while those over $5 billion held 62.5% [77]. The large endowments are the investors Amihud and Mendelson’s clientele argument describes.',
        },
        {
          p: 'They also show its limits. Yale, the model’s originator, returned 11.1% in fiscal 2025 and trailed public indexes, with its CIO pointing to buyouts and real estate [79], and it was reported to be selling about $2.5 billion of fund stakes [60]. George Suttles of the Commonfund Institute noted that endowments with more public equity have outperformed those heavy in alternatives in recent years [78].',
        },
        {
          p: 'Pensions are moving the other way. In March 2024 CalPERS raised its private equity target from 13% to 17% and private debt from 5% to 8%, taking private assets from 33% to 40% of the fund [80]. A defined-benefit pension has long liabilities and predictable outflows, so it is a reasonable holder of illiquidity. It also has a board that sees quarterly marks, which makes it the investor Asness expects to pay for smoothing [18].',
        },
        { h3: 'The retail push' },
        {
          p: 'The newest buyers have the least capacity to wait. An August 2025 executive order directed the Labor Department to clarify how 401(k) plans may offer private assets, and the department proposed a rule in March 2026 [81]. Semi-liquid vehicles are the delivery mechanism. Morningstar counts about $607 billion in 567 evergreen funds as of March 2026 [82]. XA Investments counts 308 interval and tender-offer funds with about $233 billion of net assets at the end of 2025 [83]. Hamilton Lane expects evergreen funds to grow from about 5% of private markets to at least 20% within a decade [84].',
        },
        {
          p: 'I am not against individuals owning private assets. I am against selling them a premium that requires patience in a wrapper that promises liquidity. The 2026 gates are what that mismatch looks like. An individual who needs cash in year three is the forced seller in Longstaff’s model, and the investor most likely to redeem at the worst time is the one these products are built for.',
        },
        { h3: 'Pacing and the J-curve' },
        {
          p: 'Owning illiquid assets is a cash-flow problem before it is a return problem. Figure 7 runs the Takahashi–Alexander model, which Yale built to forecast fund cash flows [85], for $100 committed to a 12-year fund. I assume capital is called at 25%, 33% and then 50% of the remaining commitment each year, assets grow 12% a year, and distributions follow the model’s bow factor of 2.5. These are my assumptions, chosen to look like a typical buyout fund.',
        },
        { fig: 'jcurve' },
        {
          p: 'The investor is $79 out of pocket at the bottom of the J in year 4, breaks even in year 8, and ends with $179 back on $100 paid in, a 12% IRR. Two pacing rules follow from the same model. To hold private NAV steady at a target, annual commitments have to be about 15% of that target, because each vintage’s NAV peaks near $104 per $100 committed and vintages overlap. And the investor carries unfunded commitments of about 1.75 times a year’s commitments at all times.',
        },
        {
          p: 'For a $100 million portfolio holding 20% in private funds, that means committing about $3 million a year and keeping about $5 million ready for calls, before any stress. If distributions slow, as they have since 2022, the bottom of the J gets deeper and later, and the reserve needs to be larger. None of this is a forecast. The point is the shape: you fund the strategy for about four years before it funds you.',
        },
        { h3: 'Fees' },
        {
          p: 'Fees are where the premium most often disappears. Metrick and Yasuda estimated that about two-thirds of a typical private equity manager’s expected revenue comes from fixed fees that do not depend on performance [86]. Phalippou estimates that private equity funds have returned about 11% a year since 2006, roughly what public equity indexes returned, while paying about $230 billion of carried interest [27]. When CalPERS first disclosed carry in 2015, it reported $3.4 billion paid since 1990, against $24.2 billion of realized net gains [87].',
        },
        {
          p: 'My own stylized model shows the size of the drag. On the same J-curve cash flows, with a 2% fee on commitments for five years, 1.5% of NAV after that, and 20% carry over an 8% preferred return with full catch-up, a fund that earns 15% gross delivers 10.6% net, a gap of 4.4 points a year. At 12% gross the gap is 4.0 points and at 18% it is 4.8. Put another way, if public equities earn 10%, the fund has to earn about 14.4% gross just to tie them after fees. Fees consume most of a plausible premium before the investor sees any of it.',
        },
        { h3: 'Manager selection' },
        {
          p: 'Dispersion is the other side of the fee problem. In venture the gap between top- and bottom-quartile funds is close to 20 points of IRR [30]. Picking the top quartile is how most LPs justify their programs, but in buyouts persistence has weakened to the point that past top-quartile results say little about the next fund, while weak past results still predict weak future ones [23]. If you cannot reliably pick the top quartile, the quartile spread is risk, not opportunity.',
        },
      ],
    },
    {
      id: 'take',
      heading: 'What it means for investors',
      blocks: [
        { h3: 'When the premium is worth it' },
        {
          p: 'Working in private markets, I came to think about illiquidity in three questions. First, is there a premium, measured against a public portfolio with the same leverage and factor exposures? Second, is it larger than the fees? Third, am I the right holder, meaning I will not be a forced seller in the state where everyone else is selling too?',
        },
        {
          p: 'The premium is worth it when the answer to all three is yes. In practice that means senior direct lending to companies you would also lend to in the syndicated market, where one to two points of spread are real and fees are lower. It means secondaries bought from forced sellers, where the discount is the premium. It means small and mid-market buyouts with managers who have a demonstrable operating edge. And it means venture only with access to managers whose persistence you can document.',
        },
        {
          p: 'It is not worth it in large-cap buyouts priced off public comparables, in semi-liquid vehicles that charge private fees for a liquidity promise they cannot keep, or in any strategy whose case rests on low reported volatility.',
        },
        { h3: 'How to underwrite it' },
        { p: 'I now underwrite every illiquid commitment against an explicit hurdle, built in four steps.' },
        {
          ordered: true,
          list: [
            '<strong>Pick the right public benchmark.</strong> For buyouts, a small-cap value index levered to the fund’s debt. For direct lending, the leveraged loan index. For core real estate, REITs delevered to the fund’s loan-to-value. The premium is measured against this, not against the S&amp;P 500.',
            '<strong>Use true volatility.</strong> Desmooth the track record or borrow a public proxy. Anson’s numbers are a starting point: about 22% for buyouts, much more for early-stage venture, about 9% for direct lending [17].',
            '<strong>Price the lockup.</strong> Longstaff’s bound gives the most a perfectly timed seller could lose [4]. Scale it by your liquidity need, the share of that option you would realistically use. A perpetual endowment that never sells is near zero. An investor who may need the money is near one.',
            '<strong>Add the fees.</strong> The gross hurdle a manager has to clear is the net premium plus the gross-to-net spread, which in my model runs 4 to 5 points for a standard buyout fund.',
          ],
        },
        { fig: 'hurdle' },
        {
          p: 'Table 2 runs the arithmetic. A patient investor, with a liquidity need of 25%, in a ten-year buyout fund needs about 1.6 points a year over a levered small-cap index, net of fees. A stretched investor at 75% needs 4.2 points. Add a 4.4-point fee drag and the gross hurdles become 6.0 and 8.6 points over the public equivalent. Few buyout managers have cleared the second number after adjusting for leverage and size, and the evidence in the earlier sections says the average manager has not cleared the first. The calculator below applies the same method to your own inputs.',
        },
        { calc: true },
        { h3: 'Red flags in diligence' },
        { p: 'These are general patterns I learned to look for, not observations about any manager, fund or client.' },
        {
          list: [
            'An IRR without a multiple, or a multiple without a PME. A strong IRR on a weak multiple usually means a credit line or early partial exits.',
            'No IRR shown without the subscription facility.',
            'Reported volatility below the volatility of the public companies the fund resembles. Ask for a lagged-beta estimate.',
            'Marks that barely fell in 2022, when public comparables fell 20% or more.',
            'DPI that comes from NAV loans, dividend recapitalizations or continuation vehicles rather than sales to outside buyers.',
            'A continuation vehicle priced at NAV, with the GP rolling its carry. Ask who set the price and whether a second bidder saw the asset.',
            'In semi-liquid funds: redemption terms that say “up to 5%” without saying what happens when requests exceed it, incentive fees on unrealized gains, and distributions funded by new subscriptions or borrowing.',
            'A benchmark chosen after the fact, especially the S&amp;P 500 for a fund that owns small, levered companies.',
            'Attribution that cannot separate multiple expansion and leverage from operating improvement.',
          ],
        },
        { h3: 'What changed my mind' },
        { p: 'Three things changed how I think about this since I wrote the first version.' },
        {
          p: '<strong>The premium belongs to the holder, not the asset.</strong> The same buyout fund is a good investment for an endowment that will never sell and a bad one for a family that may need the money in year four. Diligence that ignores the investor’s liquidity budget is incomplete.',
        },
        {
          p: '<strong>Much of reported performance is measurement.</strong> In school I read about smoothing as a caveat. In practice it shapes allocations. It is why investors hold more private assets than an honest optimizer would give them, and why the 2022 marks took a year to arrive.',
        },
        {
          p: '<strong>Private returns are less unique than they look.</strong> Stafford’s replication [21], L’Her’s benchmark [20] and the last ten years of the Cambridge data [24] say the same thing. Most of what private equity delivered can be bought in public markets with leverage and a value tilt. What cannot be bought publicly is real operating skill, which is rare, and the ability to supply liquidity when others need it, which is open to anyone patient enough to hold cash for it.',
        },
      ],
    },
    {
      id: 'reflection',
      heading: 'What I got wrong (and right) in 2025',
      blocks: [
        { p: 'The first version of this paper was a literature review for a finance course. Rereading it, some of it holds up and some does not.' },
        {
          p: '<strong>What held up.</strong> The core claim, that illiquid assets must offer higher expected returns and that the premium has compressed where capital crowded in, is still right. So is the emphasis on Acharya and Pedersen’s point that liquidity risk, not just illiquidity, is priced. The warning that naive optimizers over-allocate to smoothed assets, which I took from Dimitrov [90], looks better after 2022 than it did when I wrote it.',
        },
        {
          p: '<strong>What I got wrong.</strong> I presented the traditional 3% to 5% private equity premium as an expectation. It is a hurdle, and the last decade did not clear it [24]. I cited a valuation rule of thumb that a two-year restriction implies a 25% to 35% discount [88]. Longstaff’s upper bound for a typical buyout volatility is about 21%, and the secondary market priced buyout stakes at single-digit discounts in 2024 and 2025 [53, 54]. Discounts that large appear only in crises or in assets whose NAVs buyers do not trust.',
        },
        {
          p: 'I repeated State Street’s finding that illiquidity improved pension outcomes by preventing bad timing [89] without the other side: the same lockup forces bad timing on investors who are overcommitted, as 2009 and 2022 showed. And I treated smoothed returns as a behavioral quirk, when they work more like a product feature that investors pay for [18].',
        },
        {
          p: '<strong>What I missed.</strong> I gave the secondary market one clause, and it is now the best data we have on the price of illiquidity. I did not discuss fees at all, and they are the largest single reason the premium fails to reach investors. And I wrote about retail access to private markets as a policy debate. It is now a product category, with gates.',
        },
      ],
    },
  ] satisfies Section[],

  sources: [
    { n: 1, text: 'Amihud, Y., & Mendelson, H. (1986). Asset pricing and the bid-ask spread. Journal of Financial Economics, 17(2), 223–249.', url: 'https://doi.org/10.1016/0304-405X(86)90065-6' },
    { n: 2, text: 'Amihud, Y., & Mendelson, H. (1986). Liquidity and stock returns. Financial Analysts Journal, 42(3), 43–48.', url: 'https://rpc.cfainstitute.org/research/financial-analysts-journal/1986/liquidity-and-stock-returns' },
    { n: 3, text: 'Acharya, V. V., & Pedersen, L. H. (2005). Asset pricing with liquidity risk. Journal of Financial Economics, 77(2), 375–410.', url: 'https://doi.org/10.1016/j.jfineco.2004.06.007' },
    { n: 4, text: 'Longstaff, F. A. (1995). How much can marketability affect security values? Journal of Finance, 50(5), 1767–1774.', url: 'https://doi.org/10.1111/j.1540-6261.1995.tb05197.x' },
    { n: 5, text: 'Pástor, Ľ., & Stambaugh, R. F. (2003). Liquidity risk and expected stock returns. Journal of Political Economy, 111(3), 642–685.', url: 'https://econpapers.repec.org/RePEc:ucp:jpolec:v:111:y:2003:i:3:p:642-685' },
    { n: 6, text: 'Pástor, Ľ., & Stambaugh, R. F. (2019). Liquidity risk after 20 years. Critical Finance Review, 8, 277–299. NBER Working Paper 25774.', url: 'https://www.nber.org/papers/w25774' },
    { n: 7, text: 'Ben-Rephael, A., Kadan, O., & Wohl, A. (2015). The diminishing liquidity premium. Journal of Financial and Quantitative Analysis, 50(1–2), 197–229.', url: 'https://ideas.repec.org/a/cup/jfinqa/v50y2015i1-2p197-229_00.html' },
    { n: 8, text: 'Longstaff, F. A. (2004). The flight-to-liquidity premium in U.S. Treasury bond prices. Journal of Business, 77(3), 511–526. NBER Working Paper 9312.', url: 'https://www.nber.org/papers/w9312' },
    { n: 9, text: 'Krishnamurthy, A. (2002). The bond/old-bond spread. Journal of Financial Economics, 66(2–3), 463–506.', url: 'https://static1.squarespace.com/static/5e6033a4ea02d801f37e15bb/t/5f624561a8d03f77b87e868f/1600275809874/krishnamurthy_bond_spread_jfe.pdf' },
    { n: 10, text: 'Longstaff, F. A., Mithal, S., & Neis, E. (2005). Corporate yield spreads: Default risk or liquidity? New evidence from the credit default swap market. Journal of Finance, 60(5), 2213–2253.', url: 'https://econpapers.repec.org/RePEc:bla:jfinan:v:60:y:2005:i:5:p:2213-2253' },
    { n: 11, text: 'Chen, L., Lesmond, D. A., & Wei, J. (2007). Corporate yield spreads and bond liquidity. Journal of Finance, 62(1), 119–149. Summary: CFA Institute Digest (2007).', url: 'https://rpc.cfainstitute.org/research/cfa-digest/2007/08/corporate-yield-spreads-and-bond-liquidity-digest-summary' },
    { n: 12, text: 'Federal Reserve Bank of New York (2025, July). The Fed’s Treasury purchase prices during the pandemic. Liberty Street Economics.', url: 'https://libertystreeteconomics.newyorkfed.org/2025/07/the-feds-treasury-purchase-prices-during-the-pandemic' },
    { n: 13, text: 'Kaplan, S. N., & Schoar, A. (2005). Private equity performance: Returns, persistence, and capital flows. Journal of Finance, 60(4), 1791–1823.', url: 'https://web.mit.edu/aschoar/www/KaplanSchoar2005.pdf' },
    { n: 14, text: 'Gredil, O., Griffiths, B., & Stucke, R. (2023). Benchmarking private equity: The direct alpha method. Journal of Corporate Finance, 81, 102360.', url: 'https://doi.org/10.1016/j.jcorpfin.2023.102360' },
    { n: 15, text: 'Schillinger, P., Braun, R., & Cornel, J. (2019). Distortion or cash flow management? Understanding credit facilities in private equity funds. Working paper, Technical University of Munich.' },
    { n: 16, text: 'Getmansky, M., Lo, A. W., & Makarov, I. (2004). An econometric model of serial correlation and illiquidity in hedge fund returns. Journal of Financial Economics, 74(3), 529–609. NBER Working Paper 9571.', url: 'https://www.nber.org/papers/w9571' },
    { n: 17, text: 'Anson, M. (2024). Amortizing volatility across private capital investments. Journal of Portfolio Management, 50(7), 23–35. Figures as summarized by Alpha Architect, “The impact of amortizing volatility across private investments.”', url: 'https://www.pm-research.com/content/iijpormgmt/50/7/23' },
    { n: 18, text: 'Asness, C. (2023, January 6). Volatility laundering. AQR Cliff’s Perspectives.', url: 'https://www.aqr.com/Insights/Perspectives/Volatility-Laundering' },
    { n: 19, text: 'Phalippou, L., & Gottschalg, O. (2009). The performance of private equity funds. Review of Financial Studies, 22(4), 1747–1776.', url: 'https://econpapers.repec.org/RePEc:oup:rfinst:v:22:y:2009:i:4:p:1747-1776' },
    { n: 20, text: 'L’Her, J.-F., Stoyanova, R., Shaw, K., Scott, W., & Lai, C. (2016). A bottom-up approach to the risk-adjusted performance of the buyout fund market. Financial Analysts Journal, 72(4), 36–48.', url: 'https://ideas.repec.org/a/taf/ufajxx/v72y2016i4p36-48.html' },
    { n: 21, text: 'Stafford, E. (2022). Replicating private equity with value investing, homemade leverage, and hold-to-maturity accounting. Review of Financial Studies, 35(1), 299–342.', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2720479' },
    { n: 22, text: 'Harris, R. S., Jenkinson, T., & Kaplan, S. N. (2014). Private equity performance: What do we know? Journal of Finance, 69(5), 1851–1882. NBER Working Paper 17874.', url: 'https://www.nber.org/papers/w17874' },
    { n: 23, text: 'Harris, R. S., Jenkinson, T., Kaplan, S. N., & Stucke, R. (2023). Has persistence persisted in private equity? Evidence from buyout and venture capital funds. Journal of Corporate Finance, 81, 102361. NBER Working Paper 28109.', url: 'https://www.nber.org/papers/w28109' },
    { n: 24, text: 'Cambridge Associates (2026). US PE/VC benchmark commentary: Calendar year 2025.', url: 'https://www.cambridgeassociates.com/insight/us-pe-vc-benchmark-commentary-calendar-year-2025/' },
    { n: 25, text: 'Ilmanen, A., Chandra, S., & McQuinn, N. (2020). Demystifying illiquid assets: Expected returns for private equity. Journal of Alternative Investments, 22(3), 8–30.', url: 'https://www.aqr.com/insights/research/journal-article/demystifying-illiquid-assets-expected-returns-for-private-equity' },
    { n: 26, text: 'AQR Capital Management (2026, January 14). 2026 capital market assumptions for major asset classes. Approximate buyout and large-cap figures as summarized by P. Dubach, “Is private equity just beta with a lockup?” (2026).', url: 'https://www.aqr.com/Insights/Research/Alternative-Thinking/2026-Capital-Market-Assumptions-for-Major-Asset-Classes' },
    { n: 27, text: 'Phalippou, L. (2020). An inconvenient fact: Private equity returns and the billionaire factory. SSRN Working Paper 3623820.', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3623820' },
    { n: 28, text: 'Levine, S. (2014, August). Venture outcomes are even more skewed than you think (Correlation Ventures data).', url: 'https://sethlevine.com/archives/2014/08/venture-outcomes-are-even-more-skewed-than-you-think.html' },
    { n: 29, text: 'Evans, B. (2016). In praise of failure (Horsley Bridge data, 1985–2014). Reproduced at Climateer Investing.', url: 'https://climateerinvest.blogspot.com/2016/08/power-law-return-characteristics-of.html' },
    { n: 30, text: 'PitchBook (2023). 2023 Global fund performance report, as of Q4 2022.', url: 'https://files.pitchbook.com/website/files/pdf/2023_Global_Fund_Performance_Report_as_of_Q4_2022_with_preliminary_Q1_2023_data.pdf' },
    { n: 31, text: 'PitchBook (2026). Q4 2025 Global fund performance report.', url: 'https://pitchbook.com/news/reports/q4-2025-global-fund-performance-report-with-preliminary-q1-2026-data' },
    { n: 32, text: 'Cliffwater (2026, March 31). Cliffwater Direct Lending Index data supports strength of private credit (2025 results).', url: 'https://www.cliffwater.com/files/docs/CliffwaterPressRelease_CDLI_2025_Results.pdf' },
    { n: 33, text: 'Cliffwater (2023). 2023 Q2 report on U.S. direct lending.', url: 'https://www.bdcs.com/docs/Cliffwater2023Q2ReportonUSDirectLending.pdf' },
    { n: 34, text: 'Loomis Sayles (2026). Loomis on Loans: 2025 Morningstar LSTA U.S. Leveraged Loan Index return.', url: 'https://www.loomissayles.com/?p=36470' },
    { n: 35, text: 'Morgan Stanley Investment Management. The evolution of direct lending (citing PitchBook LCD).', url: 'https://www.morganstanley.com/im/publication/insights/articles/article_evolutionofdirectlending.pdf' },
    { n: 36, text: 'Reuters (2026, March 9). US private credit defaults hit record 9.2% in 2025, Fitch says.', url: 'https://www.marketscreener.com/news/us-private-credit-defaults-hit-record-9-2-in-2025-fitch-says-ce7e5fd8df8fff2d' },
    { n: 37, text: 'International Monetary Fund (2024, April). Global Financial Stability Report, Chapter 2: The rise and risks of private credit.', url: 'https://www.imf.org/en/Publications/GFSR/Issues/2024/04/16/global-financial-stability-report-april-2024' },
    { n: 38, text: 'Bank for International Settlements (2026). AI disruption in private credit: Exposure to software firms in BDCs. BIS Bulletin 128.', url: 'https://www.bis.org/publ/bisbull128.htm' },
    { n: 39, text: 'J.P. Morgan Asset Management (2026). Tech, software and BDCs: Navigating volatility and AI disruption in investment grade credit.', url: 'https://am.jpmorgan.com/us/en/asset-management/institutional/insights/portfolio-insights/fixed-income/fixed-income-perspectives/tech-software-and-bdcs-navigating-volatility-and-ai-disruption-in-investment-grade-credit' },
    { n: 40, text: 'Fortune (2025, October 15). Jamie Dimon issues private credit warning: “When you see one cockroach, there are probably more.”', url: 'https://fortune.com/2025/10/15/jamie-dimon-issues-private-credit-warning-when-you-see-one-cockroach-there-are-probably-more' },
    { n: 41, text: 'Institutional Real Estate, Inc. (2022). NCREIF: Strong performance continues for institutional real estate (NPI Q1 2022 5.33%, Q2 2022 3.23%).', url: 'https://irei.com/news/ncreif-strong-performance-continues-institutional-real-estate-3/' },
    { n: 42, text: 'LaSalle Investment Management (2023, April). Q4 2022 U.S. private real estate returns review (NPI Q3 2022 0.6%, Q4 2022 −3.5%).', url: 'https://www.lasalle.com/wp-content/uploads/2023/04/2022-q4-us-private-real-estate-returns-review.pdf' },
    { n: 43, text: 'NCREIF (2024). NPI snapshot report, 4th quarter 2023.', url: 'https://ncreif.org/__static/3d5760159a31b3731a6869303995366a/npi-snapshot-report-4q2023.pdf' },
    { n: 44, text: 'NCREIF (2025). Expanded NPI snapshot, 4th quarter 2024.', url: 'https://ncreif.org/__static/5c02e027491f1e8c4c29d6378aa5f68d/Expanded-NPI-Snapshot-4Q2024.pdf' },
    { n: 45, text: 'RCLCO (2026, February). Q4 2025 NCREIF results summary.', url: 'https://www.rclco.com/wp-content/uploads/2026/02/Q4-2025-NCREIF-Results-Summary.pdf' },
    { n: 46, text: 'Capital Economics (2022). NCREIF Property Index (Q4 2021).', url: 'https://www.capitaleconomics.com/clients/publications/us-commercial-property/us-commercial-property-data-response/ncreif-property-index-q4-2' },
    { n: 47, text: 'Nareit (2022). REITs post second strongest year on record in 2021.', url: 'https://reit.com/news/blog/market-commentary/reits-post-second-strongest-year-record-2021' },
    { n: 48, text: 'Nareit. REIT industry fact sheets, December 2024 and December 2025 (FTSE Nareit All Equity REITs annual returns).', url: 'https://www.reit.com/sites/default/files/2026-01/MediaFactSheet_Dec-2025.pdf' },
    { n: 49, text: 'Andonov, A., Kräussl, R., & Rauh, J. (2021). Institutional investors and infrastructure investing. Review of Financial Studies, 34(8), 3880–3934.', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3816820' },
    { n: 50, text: 'Jefferies (2022, July). Global secondary market review, 1H 2022.', url: 'https://www.jefferies.com/wp-content/uploads/files/IBBlast/1H2022-Jefferies-Global-Secondary-Market-Review.pdf' },
    { n: 51, text: 'Jefferies (2023, January). Global secondary market review.', url: 'https://www.jefferies.com/wp-content/uploads/files/IBBlast/Jefferies-Global_Secondary_Market_Review-January_2023.pdf' },
    { n: 52, text: 'Jefferies (2024, January). Global secondary market review.', url: 'https://www.jefferies.com/wp-content/uploads/sites/4/2024/01/Jefferies-Global-Secondary-Market-Review-January-2024.pdf' },
    { n: 53, text: 'Jefferies (2025, January). Global secondary market review.', url: 'https://www.jefferies.com/wp-content/uploads/sites/4/2025/02/Jefferies-Global-Secondary-Market-Review-January-2025.pdf' },
    { n: 54, text: 'Jefferies (2026, January). 2025 global secondary market review: Another record-breaking year.', url: 'https://www.jefferies.com/insights/the-big-picture/2025-global-secondary-market-review-another-record-breaking-year/' },
    { n: 55, text: 'Jefferies (2026, July). Global secondary market review, H1 2026.', url: 'https://www.jefferies.com/wp-content/uploads/sites/4/2026/07/Jefferies-Global-Secondary-Market-Review-July-2026.pdf' },
    { n: 56, text: 'Secondaries Investor (2024). GP-led deals surged through second half with secondaries set for big year: Jefferies.', url: 'https://www.secondariesinvestor.com/gp-led-deals-surged-through-second-half-with-secondaries-set-for-big-year-jefferies/' },
    { n: 57, text: 'Lazard (2026). 2025 secondary market report; interim 2026 secondary market report.', url: 'https://www.lazard.com/research-insights/lazard-2025-secondary-market-report' },
    { n: 58, text: 'Evercore (2026, July). H1 2026 secondary market review.', url: 'https://www.evercore.com/wp-content/uploads/2026/07/Evercore-H1-2026-Secondary-Market-Review.pdf' },
    { n: 59, text: 'Nadauld, T. D., Sensoy, B. A., Vorkink, K., & Weisbach, M. S. (2019). The liquidity cost of private equity investments: Evidence from secondary market transactions. Journal of Financial Economics, 132(3), 158–181. NBER Working Paper 22404.', url: 'https://www.nber.org/papers/w22404' },
    { n: 60, text: 'Private Equity Wire (2025). Yale nears $2.5bn secondary sale of PE and VC stakes (citing Bloomberg).', url: 'https://www.privateequitywire.co.uk/yale-nears-2-5bn-secondary-sale-of-pe-and-vc-stakes/' },
    { n: 61, text: 'Harvard Magazine (2009, September and November). Harvard endowment falls from $36.9 billion to $26 billion; $11 billion less.', url: 'https://www.harvardmagazine.com/2009/09/sharp-endowment-decline-reported' },
    { n: 62, text: 'Bain & Company (2025). Global private equity report 2025.', url: 'https://www.bain.com/insights/outlook-is-a-recovery-starting-to-take-shape-global-private-equity-report-2025/' },
    { n: 63, text: 'Bain & Company (2026). Global private equity report 2026 and press release.', url: 'https://www.bain.com/insights/outlook-gaining-traction-global-private-equity-report-2026/' },
    { n: 64, text: 'Bain & Company (2026). Private equity midyear report 2026.', url: 'https://www.bain.com/insights/private-equity-midyear-report-2026/' },
    { n: 65, text: 'AltsWire (2022, December). Blackstone REIT limits redemptions.', url: 'https://altswire.com/blackstone-reit-limits-redemptions/' },
    { n: 66, text: 'Blackstone Real Estate Income Trust (2024, March). Notice to stockholders; Commercial Observer (2024, March 1), BREIT fulfills 100 percent of redemption requests for first time since late 2022.', url: 'https://www.breit.com/notice-to-stockholders-march-2024/' },
    { n: 67, text: 'InvestmentNews (2023, January). Blackstone’s BREIT gets $4 billion boost from University of California.', url: 'https://investmentnews.com/alternatives/blackstones-breit-gets-4-billion-boost-from-university-of-california/232318' },
    { n: 68, text: 'Apollo Debt Solutions BDC (2026, March). Form 8-K, first-quarter repurchase offer.', url: 'https://www.sec.gov/Archives/edgar/data/1837532/000119312526119949/d94402d8k.htm' },
    { n: 69, text: 'Apollo Debt Solutions BDC (2026, September). Form 8-K, third-quarter repurchase offer; Reuters via DealStreetAsia, Apollo private credit fund redemption requests ease in third quarter.', url: 'https://www.sec.gov/Archives/edgar/data/0001837532/000119312526398001/d142892d8k.htm' },
    { n: 70, text: 'Ares Strategic Income Fund (2026). Form 424B3 prospectus supplement, share repurchase history.', url: 'https://www.sec.gov/Archives/edgar/data/0001918712/000162828026054928/asifq2-202610qsupplement.htm' },
    { n: 71, text: 'Blackstone Private Credit Fund (2026, June 4). Notice to shareholders; InvestmentNews, Blackstone BDC redemption surge signals a warning for other funds.', url: 'https://www.bcred.com/bcred-notice-to-shareholders-6-4-2026/' },
    { n: 72, text: 'Bloomberg via Swissinfo (2026, June). Partners Group ready to cap more funds as withdrawals mount.', url: 'https://www.swissinfo.ch/eng/partners-group-ready-to-cap-more-funds-as-withdrawals-mount/91525795' },
    { n: 73, text: 'Alternative Credit Investor (2026, June 1). Fitch says non-traded BDCs can withstand redemptions surge.', url: 'https://alternativecreditinvestor.com/2026/06/01/fitch-says-non-traded-bdcs-can-withstand-redemptions-surge/' },
    { n: 74, text: 'Cox Capital (2026, July 28). Press release on recurring liquidity program (Business Wire); Ares Strategic Income Fund (2026, October 2), Form 8-K on mini-tender offer.', url: 'https://www.sec.gov/Archives/edgar/data/0001918712/000162828026064530/asif-20261002.htm' },
    { n: 75, text: 'Preqin (2024). HSBC enters booming NAV finance market with debut fund (citing Oaktree’s market estimate).', url: 'https://www.preqin.com/news/hsbc-enters-booming-nav-finance-market-with-debut-fund' },
    { n: 76, text: 'NACUBO (2026). U.S. higher education endowments report stable returns, increase spending to $33.4 billion in FY25.', url: 'https://www.nacubo.org/Press-Releases/2026/US-Higher-Education-Endowments-Report-Stable-Returns-Increase-Spending-to-33-4-Billion-in-FY25' },
    { n: 77, text: 'First Citizens Wealth (2026). Benchmark your university endowment (2025 NACUBO-Commonfund Study summary).', url: 'https://www.firstcitizens.com/wealth/insights/business-planning/nacubo-endowment-study-benchmarks' },
    { n: 78, text: 'ai-CIO (2026). In “turbulent year,” university endowments report average 10.9% return.', url: 'https://www.ai-cio.com/news/turbulent-year-university-endowments-report-average-return/' },
    { n: 79, text: 'Yale University (2025, October 24). Yale reports investment return for fiscal 2025; ai-CIO coverage.', url: 'https://news.yale.edu/2025/10/24/yale-reports-investment-return-fiscal-2025' },
    { n: 80, text: 'CalPERS (2024, March). CalPERS will increase private markets investments.', url: 'https://www.calpers.ca.gov/newsroom/calpers-news/2024/calpers-will-increase-private-markets-investments' },
    { n: 81, text: 'U.S. Department of Labor (2026, March 30). Proposed rule on fiduciary duties in selecting designated investment alternatives, following Executive Order 14330 (August 7, 2025).', url: 'https://www.dol.gov/newsroom/releases/ebsa/ebsa20260330' },
    { n: 82, text: 'Dakota (2026). Top 10 evergreen funds in private markets, Q2 2026 (citing Morningstar).', url: 'https://www.dakota.com/resources/blog/top-10-evergreen-funds-in-private-markets-q2-2026' },
    { n: 83, text: 'XA Investments (2026). Fourth quarter 2025 market update on non-listed closed-end funds.', url: 'https://finviz.com/news/277862/xa-investments-reports-record-growth-in-2025-in-its-fourth-quarter-2025-market-update' },
    { n: 84, text: 'InvestmentNews (2025). Private markets face some “recalibration” but evergreen funds set to lead growth (Hamilton Lane 2025 Market Overview).', url: 'https://www.investmentnews.com/industry-news/private-markets-face-some-recalibration-but-evergreen-funds-set-to-lead-growth/259666' },
    { n: 85, text: 'Takahashi, D., & Alexander, S. (2002). Illiquid alternative asset fund modeling. Journal of Portfolio Management, 28(2), 90–100.' },
    { n: 86, text: 'Metrick, A., & Yasuda, A. (2010). The economics of private equity funds. Review of Financial Studies, 23(6), 2303–2341.', url: 'https://rodneywhitecenter.wharton.upenn.edu/wp-content/uploads/2014/04/0717.pdf' },
    { n: 87, text: 'Fortune (2015, November 24). CalPERS finally details its private equity manager profits.', url: 'https://fortune.com/2015/11/24/calpers-finally-details-its-private-equity-manager-profits' },
    { n: 88, text: 'Barick, G. (2024). Pricing the illiquidity premium for private market assets. International Journal for Multidisciplinary Research, 6(1), 1–12. (Cited in the 2025 version.)', url: 'https://ijfmr.com' },
    { n: 89, text: 'Fink, A. M. (2019). In praise of illiquidity. Fiduciary Insights, State Street Global Advisors. (Cited in the 2025 version.)', url: 'https://www.ssga.com' },
    { n: 90, text: 'Dimitrov, D. (2025). Untangling illiquidity: Optimal asset allocation with private asset classes. DNB Working Paper No. 827, De Nederlandsche Bank. (Cited in the 2025 version.)', url: 'https://www.dnb.nl' },
  ],
};
