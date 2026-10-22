// Charlie's paper, rendered on the site from his final draft (May 2025). Six typos
// were fixed for the web; the argument and wording are otherwise his.
export const paper = {
  "title": "The Illiquidity Premium and Its Impact on Asset Pricing and Returns",
  "slug": "illiquidity-premium",
  "course": "FINA 475H: Strategic Finance Management, University of Nebraska–Lincoln",
  "date": "May 5, 2025",
  "summary": "Illiquid assets have to pay more than liquid ones: investors give up flexibility and take the risk that liquidity vanishes in a crisis. This paper looks at what sets the size of that premium (lock-up length, the asset and the issuer, market-wide liquidity, and the investor’s own horizon) and follows the evidence through public stocks and bonds, private equity and venture capital, real estate and private credit. The premium is real, but it has shrunk where capital crowds in, like large buyouts. Illiquidity can still help investors by enforcing discipline, as long as liquidity is planned for.",
  "keyNumbers": [
    [
      "25–35%",
      "discount to fair value implied by a two-year sale restriction, against 15–25% for one year"
    ],
    [
      "3–5%",
      "a year that investors have traditionally expected private equity to beat public equities by"
    ],
    [
      "<1%",
      "buyout outperformance over the S&P 500 (1986–2017) once leverage, size and value are adjusted for, down from about 2.3–3.4%"
    ],
    [
      "20–50%",
      "of institutional portfolios held in illiquid alternatives, against under 20% for retail"
    ]
  ],
  "sections": [
    {
      "heading": "Introduction",
      "paragraphs": [
        "Illiquid assets, those that cannot be easily sold or converted into cash without suffering a significant loss in value, offer higher expected returns than equivalent liquid assets. The illiquidity premium is the excess return that investors receive in exchange for taking on liquidity risk. Asset pricing and portfolio construction are greatly influenced by the premium, particularly for institutional investors with long holding periods, such as endowments and pension funds. During my internship at Three Bridge Wealth Advisors, we continually assessed whether a multi-year lock up of capital was warranted by private fund’s return targets or whether we should utilize more liquid investment strategies. This paper investigates the characteristics of the illiquidity premium, the variables that affect its size, and the ways in which it affects returns, market pricing, and investor behavior across asset classes."
      ]
    },
    {
      "heading": "Defining the Illiquidity Premium",
      "paragraphs": [
        "The illiquidity premium is the additional return that an investor should demand for holding assets that can not be easily sold through secondary or primary markets at the fair market value. Investors value liquidity for its flexibility and optionality. Taking away this flexibility requires some form of compensation. As a result, illiquid assets, whether small-cap stocks, corporate bonds, or private equity stakes, must offer higher yields or lower entry prices to attract capital their way. Without this extra return, there would be no incentive to invest in private equity or illiquid assets.",
        "Illiquidity risk includes an asset’s baseline inability to trade and the risk that its liquidity deteriorates under adverse market conditions. Acharya and Pedersen (2005) clarified this in their liquidity-adjusted asset pricing model (LCAPM), which predicts higher returns for assets whose liquidity worsens in market downturns. The illiquidity premium, therefore, reflects compensation for time-invariant trading constraints and liquidity shocks that may coincide with periods of high financial stress."
      ]
    },
    {
      "heading": "Determinants of the Illiquidity Premium",
      "paragraphs": [
        "The lock up period or trading frequency of an asset is influenced by the required premium. Investors will typically demand greater compensation or return for tying up their capital for longer periods. Studies in business valuation have suggested that just a two year restriction might make it necessary for a 25-35% discount to fair value, whereas a one year restriction might only require 15-25% (Barick, 2024). The opportunity cost of waiting is what meaningfully contributes to the illiquidity premium.",
        "Also, the characteristics of the asset or the issuing firm affect the liquidity and required return. Damodaran (2005) observed that the liquidity of a company’s asset, size, cash flow profile, and its likelihood of a liquidity exit event all influence how investors perceive liquidity risk. A large cash generating firm is more attractive and commands a smaller discount than a highly specialized, thinly capitalized company with very uncertain liquidity options. Investors will generally assign larger discounts to small firms due to the limited pool of potential buyers. Market wide liquidity conditions are another major factor in pricing. In very calm liquid markets, illiquidity may carry a modest premium. However, in times of large systemic stress, investors become more risk averse and liquidity evaporates. This dynamic was very evident during the 2007-2009 financial crisis when even high quality assets became difficult to sell and illiquidity premiums spiked. Conversely, during the 2010s, a flood of capital into private equity reduced the expected returns and compressed the illiquidity premium as investors competed for scarce deals (Ilmanen et al., 2020).",
        "To each investor’s own preferences, wealth, and constraints play a large role in determining how much compensation is required for accepting illiquidity. Risk-averse investors or those that have the inability to stay liquid for long are generally unwilling to lock up funds without significant compensation. Higher net worth individuals or institutions have higher appeal to lock up capital because the capital is most likely not needed in the short term. They can afford lower illiquidity premiums because their investment horizons allow them to maintain through periods of illiquidity without forced sales. In equilibrium, the marginal buyer of highly illiquid assets tends to be someone with low current liquidity needs and a high tolerance for interim uncertainty. Another large determinant is the correlation of the illiquid asset’s performance with broader markets or the investor’s entire portfolio. If an illiquid asset holds its value during market downturns, it provides a large diversification benefit, and investors may accept a smaller premium. On the other hand, high market correlated assets that lose value during recessions, require larger risk-adjusted returns. Acharya and Pedersen’s (2005) model highlights this dynamic, which emphasizes that assets with a negative liquidity beta, those that become harder to sell in down markets, demand a higher expected return."
      ]
    },
    {
      "heading": "Illiquidity in Asset Pricing Theory",
      "paragraphs": [
        "Liquidity risk has been incorporated much more often into modern asset pricing theory. Amihud and Mendelson (1986) showed that stocks with a larger bid-ask spread, deliver higher average returns. Pástor and Stambaugh (2003) found that stocks with returns that are more sensitive to changes in aggregate market liquidity would command higher expected returns. Acharya and Pedersen (2005) advanced this idea further with their LCAPM model, which includes multiple liquidity related risks which helped to explain observed return differentials across different asset classes.",
        "These findings show that liquidity is not merely a trading feature but it is a priced dimension of risk. Illiquidity premiums can appear as persistent average return differences and as time varying return shifts during market stress. For example, micro cap equities have historically higher average returns than large cap equities, mostly due to their lower liquidity. In contrast, during a liquidity crisis, even highly liquid assets may temporarily carry illiquidity premiums if investors can not sell at normal prices."
      ]
    },
    {
      "heading": "Public Market Evidence: Stocks and Bonds",
      "paragraphs": [
        "In public equity markets, empirical studies confirm that less liquid stocks earn higher expected returns, even after adjusting for known factors such as size and value. Liquidity has also been shown to explain portions of the returns associated with momentum investing, particularly because momentum strategies perform poorly in liquidity crises.",
        "In the bond market, illiquidity effects are clearly observed. The yield spread between on-the-run and off-the-run U.S. Treasurys serves as a classic example. Both have identical cash flows and credit risk, but the more liquid, recently issued bonds trade at lower yields. Corporate bond spreads reflect liquidity effects as well. Going beyond just default risk, investors require compensation for holding bonds with a wider bid-ask spread or limited secondary market trading (aka lower liquidity). Research that was done by Chen, Lesmond, and Wei (2007) showed that liquidity explains a significant portion of corporate yield spreads, especially for lower rated issues."
      ]
    },
    {
      "heading": "Private Markets: Private Equity and Venture Capital",
      "paragraphs": [
        "Private equity represents the most widely recognized domain where the liquidity premium is a vital role to pricing. Traditional investor expectations have always centered around 3-5 percent annual return over public equities in order to compensate for illiquidity and other risks. However, this assumption has come under a great deal of scrutiny in recent times. AQR’s study of buyout fund returns from 1986-2017 found that private equity outperformed the S&P 500 by around 2.3 to 3.4 percent annually. This is a large difference. Yet, after adjusting for factors like leverage and exposure to small-cap and value stocks, the outperformance declined to under 1 percent which suggests a modest or even negligible premium in recent decades.",
        "As more capital has flowed into the private markets, purchase prices have risen and return dispersion has declined. The illiquidity premium has compressed as a result, especially in mature segments like large cap buyouts. However, institutional investors have continued to allocate heavily to private equity, mostly due to the perceived stability of returns. Private equity valuations are reported quarterly and based on appraisals rather than market prices, their volatility appears lower than the typical public markets. This return smoothing appeals to investors regardless if it is even factual. These returns are not comparable and yet they receive more appeal from the public.",
        "Venture capital, a very illiquid asset class, generally carries a larger illiquidity premium due to a longer duration and extremely high failure rate. Funds often target 20 percent or more in annualized returns to make up for the risk and high lock up periods. Barclays (2022) estimated a 3-5 percent illiquidity premium for early stage venture funds which is slightly higher than for buyouts. In my own experience in evaluating VC opportunities we required strong return potential, track record, and intention of investments prior to us even considering investing. High risk, high reward but not great when trying to act in the best interests of our clients."
      ]
    },
    {
      "heading": "Real Estate and Other Illiquid Alternatives",
      "paragraphs": [
        "Private real estate also carries an illiquidity premium, though it varies by strategy. Core real estate funds invest in stabilized income-producing properties and often target returns a few percent above public REIT benchmarks. Transactions in real estate are slow and expensive, and valuations are typically appraisal-based. This leads to smoothed returns and perceived lower volatility.",
        "Interestingly, studies have shown that illiquidity can improve investor outcomes by discouraging poor market timing. State Street Global Advisors found that from 2001 to 2017, U.S. pension plans achieved better performance from their actual private real estate allocations than from hypothetical rebalanced portfolios. Illiquidity prevented reactionary selling during downturns. The same study found that private equity allocations delivered roughly 2.8 percent higher annual returns than constant-allocation benchmarks, partly due to forced long-term discipline. Other alternatives, such as private credit and infrastructure, also exhibit illiquidity premia. Due to limited liquidity, direct lending strategies often yield more than publicly traded bonds. Infrastructure projects like toll roads or energy assets offer stable cash flows over long horizons but are challenging to sell, requiring an upfront premium to justify the investment."
      ]
    },
    {
      "heading": "Influence on Investor Behavior and Portfolio Construction",
      "paragraphs": [
        "The existence of an illiquidity premium affects not only expected returns but also the behaviors of investors and the design of the portfolio. Liquidity preferences vary drastically. Individuals saving for emergencies should avoid illiquid investments, whereas institutional investors with long term obligations can allocate more heavily. You see this with endowments or pensions with huge investment horizons they typically have large allocations to venture or long term private equity. This behavior underpins the model like the Yale Endowment strategy, which maximizes their exposure to illiquid assets based on the endowment’s perpetual horizon.",
        "Behavioral factors further shape allocation to asset classes. The smoother reported returns of illiquid assets is able to lead investors to perceive them as less risky, despite comparable economic volatility across the board. For institutional decision makers, return smoothing can reduce career risk by minimizing drawdown periods in reported performance. Such preferences however can lead to overvaluation of illiquid assets and a diminished illiquidity premium over time.",
        "From a standpoint of constructing a portfolio, incorporating illiquid assets requires very careful planning. Naive optimization that ignores liquidity as a constraint can lead to excessive allocations and poor outcomes during times of rebalancing. Dimitrov (2025) demonstrated that investors treating illiquid assets as if they are liquid will suffer welfare losses in times of market dislocation. This is especially seen in private wealth management for clients with medium sized portfolios when times of liquidity are needed. Practical solutions include liquidity reserves, stress testing liquidity scenarios, and limiting private market allocations to levels that can be maintained through extreme times.",
        "Institutional investors commonly hold 20-50 percent in illiquid alternatives, while retail portfolios typically maintain less than 20 percent. Regulatory restrictions have historically limited individual access to private markets. Recent debate focuses on whether more investors should be allowed exposure to illiquid alternatives, assuming they understand and can bear the associated risks."
      ]
    },
    {
      "heading": "Conclusion",
      "paragraphs": [
        "The illiquidity premium is a foundational concept in asset pricing and portfolio theory. It gives compensation to investors for the costs and risks of holding assets that are not able to be easily traded. Its magnitude is entirely dependent on lock up periods, asset characteristics, market conditions, investor preferences, and the asset’s behavior during stress. Illiquidity is priced in private and public markets and the effects of it go beyond financial compensation or return. By limiting trading and reducing volatility in reported returns, illiquidity can enhance the behavior outcomes and enforce discipline to investors.",
        "Although the premium has diminished in certain markets due to the rising demand and valuation compression it is still extremely relevant. Estimating it accurately and allocating your investments accordingly is essential for creating robust, long term portfolios. A thoughtful approach that is able to combine quantitative modeling, and practical experience is necessary to manage liquidity risks and harness the benefits of patient capital. As secondary markets develop and the access to private investments broadens, the form of illiquidity premium may evolve but the fundamental principle will persist. Investors must be compensated for surrendering liquidity and those who can forgo flexibility may reap meaningful long term rewards."
      ]
    }
  ],
  "cites": [
    "Acharya, V. V., & Pedersen, L. H. (2005). Asset pricing with liquidity risk. Journal of Financial Economics, 77(2), 375–410. https://doi.org/10.1016/j.jfineco.2004.06.007",
    "Barick, G. (2024). Pricing the illiquidity premium for private market assets. International Journal for Multidisciplinary Research, 6 (1), 1–12. Retrieved from https://ijfmr.com",
    "Dimitrov, D. (2025). Untangling illiquidity: Optimal asset allocation with private asset classes (DNB Working Paper No. 827). De Nederlandsche Bank. Retrieved from https://www.dnb.nl",
    "Ilmanen, A., Chandra, S., & McQuinn, N. (2020). Demystifying illiquid assets: Expected returns for private equity. Journal of Alternative Investments, 22(3), 8–30. Also issued as AQR Capital Management Whitepaper, 1Q19. Retrieved from https://alphaarchitect.com",
    "Ricciardelli, A., & Parhizkari, P. (2024, August 7). Is illiquidity a blessing in disguise for some investors? CFA Institute Enterprising Investor Blog. Retrieved from https://blogs.cfainstitute.org",
    "Fink, A. M. (2019). In praise of illiquidity. Fiduciary Insights – Alternative Investments. State Street Global Advisors. Retrieved from https://www.ssga.com"
  ]
} as const;
