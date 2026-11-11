// The Brockmeier model for one investor, shared by the page (to render the calculator's
// first answer at build time) and the browser (to update it). After the materiality
// test in scripts/model/build.mjs only two assets are left, TIPS and global stocks, so
// the constrained problem has a closed form:
//
//   stock share of savings = clip( [ premium / (gamma * variance) - beta * (1 - k) ] / k , 0, 1 )
//
// where k is savings as a share of savings plus the present value of future savings.

export type ModelInputs = {
  /** Real yield on 10-year TIPS, decimal. */
  rf: number;
  /** Arithmetic mean real return on global stocks (compound return plus half the variance), decimal. */
  muEq: number;
  /** Annual variance of global stocks' real return. */
  varEq: number;
  /** Real par curve, [maturity, percent]. */
  curve: [number, number][];
  /** Median earnings by age, [age, dollars]. */
  earn: [number, number][];
  /** One-year death probabilities by age, starting at age 0. */
  q: number[];
  eqW: [number, number, number];
  /** 1st percentile of a unit-variance Student-t. */
  t01: number;
  /** A 30-payment TIPS ladder pays this percent of its cost each year. */
  ladder: number;
};

export type Answers = {
  age: number;
  retire: number;
  gamma: number;
  beta: number;
  /** Share of pay saved. */
  save: number;
  /** Savings so far, in years of pay. */
  years: number;
  /** Retirees: wealth over the cost of the spending floor. */
  funded: number;
};

function interp(curve: [number, number][], x: number) {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    if (x <= curve[i][0]) return curve[i - 1][1] + ((curve[i][1] - curve[i - 1][1]) * (x - curve[i - 1][0])) / (curve[i][0] - curve[i - 1][0]);
  }
  return curve[curve.length - 1][1];
}

const phi = (z: number) => {
  // Standard normal distribution function (Abramowitz and Stegun 26.2.17).
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

const clip = (v: number) => Math.max(0, Math.min(1, v));

export function solveModel(m: ModelInputs, a: Answers) {
  const earn = (age: number) => interp(m.earn, age + 0.5);
  const premium = m.muEq - m.rf;
  const alone = premium / (a.gamma * m.varEq);
  /** Present value of the savings still to come from `age` to retirement (the paper's human-capital equation). */
  const human = (age: number) => {
    let h = 0;
    let alive = 1;
    for (let t = age; t < a.retire; t++) {
      const next = alive * (1 - m.q[Math.min(t, m.q.length - 1)]);
      const horizon = t - age + 0.5;
      h += (a.save * earn(t) * Math.sqrt(alive * next)) / (1 + interp(m.curve, horizon) / 100 + a.beta * premium) ** horizon;
      alive = next;
    }
    return h;
  };
  const shareAt = (f: number, h: number) => {
    const k = f + h > 0 ? Math.max(f / (f + h), 1e-9) : 1e-9;
    return { k, share: clip((alone - a.beta * (1 - k)) / k) };
  };

  const retired = a.age >= a.retire;
  const pay = earn(Math.min(a.age, a.retire - 1));
  const f0 = a.years * pay;
  const h0 = retired ? 0 : human(a.age);
  let { k, share } = shareAt(f0, h0);
  let floor = 0;
  if (retired) {
    k = 1;
    floor = Math.min(1, 1 / Math.max(a.funded, 0.01));
    share = (1 - floor) * clip(alone);
  }
  const mu = m.rf + share * premium;
  const vol = share * Math.sqrt(m.varEq);
  const horizon = retired ? 10 : Math.max(1, a.retire - a.age);
  const trail = share > 0.005 ? phi((-(premium - m.varEq / 2) * Math.sqrt(horizon)) / Math.sqrt(m.varEq)) * 100 : null;

  // Expected path to retirement: each year the mix is re-solved and earns its expected return.
  let f = f0;
  if (!retired) {
    for (let t = a.age; t < a.retire; t++) {
      const s = shareAt(f, human(t)).share;
      f = f * (1 + m.rf + s * premium - (s * s * m.varEq) / 2) + a.save * earn(t);
    }
  }
  const finalPay = earn(a.retire - 1);

  return {
    retired,
    k,
    hYears: h0 / pay,
    floor: floor * 100,
    stocks: share * 100,
    us: share * 100 * m.eqW[0],
    intl: share * 100 * m.eqW[1],
    em: share * 100 * m.eqW[2],
    tips: (1 - share) * 100,
    // Shown as a compound rate: the arithmetic mean less half the variance of the mix.
    mu: (mu - (vol * vol) / 2) * 100,
    vol: vol * 100,
    loss: (mu + vol * m.t01) * 100,
    trail,
    horizon,
    alone: clip(alone) * 100,
    endYears: f / finalPay,
    income: ((f * m.ladder) / 100 / finalPay) * 100,
  };
}

export const groupName = (g: number) => (g <= 2.25 ? 'Aggressive' : g <= 3.25 ? 'Growth' : g <= 4.75 ? 'Balanced' : g <= 6.75 ? 'Moderate' : g <= 8.75 ? 'Cautious' : 'Very cautious');
