// Numerical pieces for the Brockmeier model: a seeded random generator, small matrix
// helpers, Ledoit-Wolf shrinkage, an exact long-only quadratic program, and bond math. Plain
// Node, no dependencies, so the model re-runs anywhere.

// ---------------------------------------------------------------- random numbers
/** Deterministic uniform generator (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal draws (Box-Muller) from a uniform generator. */
export function normalSource(u) {
  let spare = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let a = 0;
    while (a === 0) a = u();
    const r = Math.sqrt(-2 * Math.log(a));
    const th = 2 * Math.PI * u();
    spare = r * Math.sin(th);
    return r * Math.cos(th);
  };
}

// ---------------------------------------------------------------- vectors and matrices
export const sum = (a) => a.reduce((s, v) => s + v, 0);
export const mean = (a) => sum(a) / a.length;
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const matVec = (M, v) => M.map((row) => dot(row, v));
export const quad = (M, v) => dot(v, matVec(M, v));
export const zeros = (n, m) => Array.from({ length: n }, () => new Array(m).fill(0));

export function stdev(a) {
  const m = mean(a);
  return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1));
}

export function correlation(a, b) {
  const ma = mean(a);
  const mb = mean(b);
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < a.length; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return sab / Math.sqrt(saa * sbb);
}

/** Lower-triangular Cholesky factor of a symmetric positive-definite matrix. */
export function cholesky(A) {
  const n = A.length;
  const L = zeros(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (s <= 0) throw new Error(`Matrix is not positive definite at ${i}`);
        L[i][i] = Math.sqrt(s);
      } else L[i][j] = s / L[j][j];
    }
  }
  return L;
}

// ---------------------------------------------------------------- covariance
/**
 * Ledoit and Wolf (2004), "Honey, I shrunk the sample covariance matrix": shrink the
 * sample covariance toward a constant-correlation target with the intensity that
 * minimizes expected squared error. X is T rows by N columns of returns.
 */
export function ledoitWolf(X) {
  const T = X.length;
  const N = X[0].length;
  const mu = Array.from({ length: N }, (_, j) => mean(X.map((r) => r[j])));
  const Y = X.map((r) => r.map((v, j) => v - mu[j]));
  const S = zeros(N, N);
  for (const r of Y) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) S[i][j] += (r[i] * r[j]) / T;
  const sd = S.map((row, i) => Math.sqrt(row[i]));
  let rbar = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) rbar += S[i][j] / (sd[i] * sd[j]);
  rbar /= N * (N - 1);
  const F = S.map((row, i) => row.map((_, j) => (i === j ? S[i][i] : rbar * sd[i] * sd[j])));

  let pi = 0;
  let rho = 0;
  let gamma = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let pij = 0;
      let thii = 0;
      let thjj = 0;
      for (const r of Y) {
        const d = r[i] * r[j] - S[i][j];
        pij += d * d;
        thii += (r[i] * r[i] - S[i][i]) * d;
        thjj += (r[j] * r[j] - S[j][j]) * d;
      }
      pij /= T;
      thii /= T;
      thjj /= T;
      pi += pij;
      if (i === j) rho += pij;
      else rho += (rbar / 2) * ((sd[j] / sd[i]) * thii + (sd[i] / sd[j]) * thjj);
      gamma += (F[i][j] - S[i][j]) ** 2;
    }
  }
  const kappa = (pi - rho) / gamma;
  const delta = Math.max(0, Math.min(1, kappa / T));
  // Unbiased sample covariance (divide by T - 1) for the reported matrices.
  const adj = T / (T - 1);
  const sample = S.map((row) => row.map((v) => v * adj));
  const target = F.map((row) => row.map((v) => v * adj));
  const shrunk = sample.map((row, i) => row.map((v, j) => delta * target[i][j] + (1 - delta) * v));
  return { sample, target, shrunk, delta, rbar, T, N };
}

export const toCorr = (S) => S.map((row, i) => row.map((v, j) => v / Math.sqrt(S[i][i] * S[j][j])));

// ---------------------------------------------------------------- optimizer
/** Solve the square system K y = r by Gaussian elimination with partial pivoting; null if singular. */
export function linearSolve(K, r) {
  const n = r.length;
  const M = K.map((row, i) => [...row, r[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < 1e-14) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) {
      const f = M[i][c] / M[c][c];
      if (f !== 0) for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j];
    }
  }
  const y = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let v = M[i][n];
    for (let j = i + 1; j < n; j++) v -= M[i][j] * y[j];
    y[i] = v / M[i][i];
  }
  return y;
}

/**
 * Long-only, fully invested mean-variance problem:
 *   maximize  mu'x - (gamma / 2) x' Sigma x - lin'x   subject to  x >= 0, sum(x) = 1.
 * Solved exactly. For every subset of assets that could be the ones held, the
 * first-order conditions with the budget constraint are a linear system; the answer is
 * the feasible solution (no negative weight) with the highest objective. With nine
 * assets that is 511 small systems, so brute force is both exact and fast.
 */
export function solveQP({ mu, Sigma, gamma, lin }) {
  const n = mu.length;
  const b = lin ? mu.map((m, i) => m - lin[i]) : mu;
  let best = -Infinity;
  let bestX = null;
  for (let mask = 1; mask < 1 << n; mask++) {
    const idx = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) idx.push(i);
    const m = idx.length;
    let xs;
    if (m === 1) xs = [1];
    else {
      const K = zeros(m + 1, m + 1);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) K[i][j] = gamma * Sigma[idx[i]][idx[j]];
        K[i][m] = 1;
        K[m][i] = 1;
      }
      const y = linearSolve(K, [...idx.map((i) => b[i]), 1]);
      if (!y) continue;
      xs = y.slice(0, m);
      if (xs.some((v) => v < -1e-12)) continue;
    }
    let lin1 = 0;
    let q = 0;
    for (let i = 0; i < m; i++) {
      lin1 += b[idx[i]] * xs[i];
      for (let j = 0; j < m; j++) q += xs[i] * Sigma[idx[i]][idx[j]] * xs[j];
    }
    const val = lin1 - (gamma / 2) * q;
    if (val > best + 1e-15) {
      best = val;
      bestX = new Array(n).fill(0);
      idx.forEach((i, k) => (bestX[i] = Math.max(0, xs[k])));
    }
  }
  const tot = sum(bestX);
  return bestX.map((v) => (v / tot < 1e-9 ? 0 : v / tot));
}

// ---------------------------------------------------------------- bonds
/**
 * One-month total return of a par bond: bought at par with coupon y0 (percent, paid
 * twice a year) and maturity T years, repriced a month later at yield y1.
 */
export function parBondReturn(y0, y1, T) {
  const n = Math.round(2 * T);
  const c = y0 / 2;
  const d = 1 + y1 / 200;
  let p = 0;
  for (let k = 1; k <= n; k++) p += c / d ** (k - 1 / 6);
  p += 100 / d ** (n - 1 / 6);
  return p / 100 - 1;
}

/** Linear interpolation on a curve given as sorted [maturity, value] pairs; flat outside. */
export function interp(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    if (x <= curve[i][0]) {
      const [x0, y0] = curve[i - 1];
      const [x1, y1] = curve[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return curve[curve.length - 1][1];
}

/**
 * Annual discount factors d[1..N] bootstrapped from a par curve quoted on a
 * bond-equivalent (twice-yearly) basis. Par yields are converted to effective annual
 * rates and treated as annual-pay par rates.
 */
export function discountFactors(parCurve, N) {
  const d = [1];
  let acc = 0;
  for (let n = 1; n <= N; n++) {
    const y = interp(parCurve, n) / 100;
    const c = (1 + y / 2) ** 2 - 1;
    const dn = (1 - c * acc) / (1 + c);
    d.push(dn);
    acc += dn;
  }
  return d;
}

// ---------------------------------------------------------------- statistics
export function percentile(sorted, p) {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export function excessKurtosis(a) {
  const m = mean(a);
  const n = a.length;
  const m2 = sum(a.map((v) => (v - m) ** 2)) / n;
  const m4 = sum(a.map((v) => (v - m) ** 4)) / n;
  return m4 / (m2 * m2) - 3;
}

/** Quantile of a Student-t distribution scaled to unit variance (nu > 2), by bisection on the CDF. */
export function tQuantileUnitVar(p, nu) {
  // CDF by numerical integration of the density (Simpson), accurate enough for reporting.
  const lgamma = (z) => {
    const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
    let x = z;
    let y = z;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (const c of g) ser += c / ++y;
    return -tmp + Math.log((2.5066282746310005 * ser) / x);
  };
  const c = Math.exp(lgamma((nu + 1) / 2) - lgamma(nu / 2)) / Math.sqrt(nu * Math.PI);
  const pdf = (x) => c * (1 + (x * x) / nu) ** (-(nu + 1) / 2);
  const cdf = (x) => {
    const n = 4000;
    const a = -60;
    const h = (x - a) / n;
    let s = pdf(a) + pdf(x);
    for (let i = 1; i < n; i++) s += pdf(a + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  };
  let lo = -60;
  let hi = 60;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * Math.sqrt((nu - 2) / nu);
}

export const round = (v, d = 2) => (v === null || v === undefined || Number.isNaN(v) ? null : Math.round(v * 10 ** d) / 10 ** d);
