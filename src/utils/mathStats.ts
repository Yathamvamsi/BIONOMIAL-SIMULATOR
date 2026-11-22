/**
 * Mathematical & Statistical Utilities for Binomial Lab
 * Implements high-precision, numerically stable calculations for
 * Factorials, Combinations, Binomial PMF/CDF, Moments, and Bernoulli Trials.
 */

import { CalculationResult, DistributionPoint, SingleTrialResult } from '../types';

// Natural logarithm of Gamma function via Lanczos approximation (g=7, N=9)
export function lnGamma(z: number): number {
  if (z <= 0) return 0;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    // Reflection formula: Gamma(1-z)*Gamma(z) = pi / sin(pi*z)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }

  z -= 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) {
    x += p[i] / (z + i);
  }

  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Logarithm of factorial: ln(n!) = lnGamma(n + 1)
export function lnFactorial(n: number): number {
  if (n < 0) return 0;
  if (n <= 1) return 0;
  return lnGamma(n + 1);
}

// Direct factorial for small n (exact up to 20!)
export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n <= 1) return 1;
  if (n > 170) return Infinity; // IEEE-754 limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Combination nCr = n! / (r! * (n - r)!)
export function combination(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r; // symmetry

  // For small numbers, compute iteratively without overflow
  if (n <= 40) {
    let result = 1;
    for (let i = 1; i <= r; i++) {
      result = (result * (n - r + i)) / i;
    }
    return Math.round(result);
  }

  // For large numbers, use log gamma to maintain stability
  const logComb = lnFactorial(n) - lnFactorial(r) - lnFactorial(n - r);
  return Math.exp(logComb);
}

/**
 * Binomial Probability Mass Function: P(X = x) = nCx * p^x * (1 - p)^(n - x)
 */
export function binomialPMF(n: number, p: number, x: number): number {
  if (x < 0 || x > n) return 0;
  if (p < 0 || p > 1) return 0;

  // Boundary probability conditions
  if (p === 0) return x === 0 ? 1 : 0;
  if (p === 1) return x === n ? 1 : 0;
  if (x === 0) return Math.pow(1 - p, n);
  if (x === n) return Math.pow(p, n);

  // Use log space to prevent underflow/overflow for large n
  const logP = lnFactorial(n) - lnFactorial(x) - lnFactorial(n - x) + x * Math.log(p) + (n - x) * Math.log(1 - p);
  const prob = Math.exp(logP);
  return Math.min(1, Math.max(0, prob));
}

/**
 * Binomial Cumulative Distribution Function: P(X <= x) = sum_{k=0}^x P(X = k)
 */
export function binomialCDF(n: number, p: number, x: number): number {
  if (x < 0) return 0;
  if (x >= n) return 1;
  if (p === 0) return 1;
  if (p === 1) return x >= n ? 1 : 0;

  let sum = 0;
  for (let k = 0; k <= x; k++) {
    sum += binomialPMF(n, p, k);
  }
  return Math.min(1, Math.max(0, sum));
}

/**
 * Range Probability: P(a <= X <= b)
 */
export function binomialRange(n: number, p: number, a: number, b: number): number {
  const lower = Math.max(0, Math.min(a, b));
  const upper = Math.min(n, Math.max(a, b));
  if (lower > upper) return 0;

  let sum = 0;
  for (let k = lower; k <= upper; k++) {
    sum += binomialPMF(n, p, k);
  }
  return Math.min(1, Math.max(0, sum));
}

/**
 * Normal PDF Approximation for Binomial Distribution
 */
export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Statistical Moments for Binomial(n, p)
 */
export function getBinomialMoments(n: number, p: number) {
  const q = 1 - p;
  const mean = n * p;
  const variance = n * p * q;
  const stdDev = Math.sqrt(variance);
  const skewness = stdDev === 0 ? 0 : (1 - 2 * p) / stdDev;
  const kurtosis = stdDev === 0 ? 0 : (1 - 6 * p * q) / (n * p * q);
  
  // Mode: integer(s) k such that (n+1)p - 1 <= k <= (n+1)p
  const modeVal = Math.floor((n + 1) * p);
  const mode = (n + 1) * p === modeVal && modeVal > 0 ? `${modeVal - 1} and ${modeVal}` : `${modeVal}`;

  return {
    mean,
    variance,
    stdDev,
    skewness,
    kurtosis,
    mode,
  };
}

/**
 * Generates full distribution dataset for graphing with PMF, CDF, and Normal curve
 */
export function generateDistributionData(
  n: number,
  p: number,
  experimentalCounts?: { [k: number]: number },
  totalExperiments?: number
): DistributionPoint[] {
  const points: DistributionPoint[] = [];
  const moments = getBinomialMoments(n, p);

  // Adaptive step if n is huge (e.g. > 150), otherwise step=1
  const step = n > 200 ? Math.ceil(n / 100) : 1;

  let cumulative = 0;
  for (let x = 0; x <= n; x += step) {
    const pmf = binomialPMF(n, p, x);
    cumulative = x === 0 ? pmf : binomialCDF(n, p, x);
    const percentage = pmf * 100;
    
    // Normal approximation value
    const norm = moments.stdDev > 0 ? normalPDF(x, moments.mean, moments.stdDev) : 0;
    
    // Experimental relative frequency if available
    let expFreq: number | undefined = undefined;
    if (experimentalCounts && totalExperiments && totalExperiments > 0) {
      const count = experimentalCounts[x] || 0;
      expFreq = count / totalExperiments;
    }

    points.push({
      x,
      pmf: Number(pmf.toFixed(6)),
      cdf: Number(cumulative.toFixed(6)),
      percentage: Number(percentage.toFixed(4)),
      normalApprox: Number(norm.toFixed(6)),
      experimentalFreq: expFreq !== undefined ? Number(expFreq.toFixed(6)) : undefined,
    });
  }

  return points;
}

/**
 * Run a sequence of n independent Bernoulli trials
 */
export function simulateBernoulliTrials(
  n: number,
  p: number
): {
  trials: SingleTrialResult[];
  successes: number;
  failures: number;
  experimentalP: number;
} {
  const trials: SingleTrialResult[] = [];
  let currentSuccesses = 0;

  for (let i = 1; i <= n; i++) {
    const u = Math.random();
    const isSuccess = u < p;
    if (isSuccess) currentSuccesses++;

    trials.push({
      trialIndex: i,
      randomValue: Number(u.toFixed(5)),
      isSuccess,
      runningSuccesses: currentSuccesses,
      runningFrequency: Number((currentSuccesses / i).toFixed(5)),
    });
  }

  const successes = currentSuccesses;
  const failures = n - successes;
  const experimentalP = n > 0 ? successes / n : 0;

  return {
    trials,
    successes,
    failures,
    experimentalP,
  };
}

/**
 * Run multi-experiment replications (e.g., repeating the n-trial experiment N times)
 */
export function simulateReplications(
  n: number,
  p: number,
  replications: number
): {
  successCounts: number[];
  frequencyMap: { [k: number]: number };
  sampleMean: number;
  sampleVariance: number;
  sampleStdDev: number;
} {
  const successCounts: number[] = [];
  const frequencyMap: { [k: number]: number } = {};
  let totalSuccessesAllRuns = 0;

  for (let rep = 0; rep < replications; rep++) {
    let runSuccesses = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) {
        runSuccesses++;
      }
    }
    successCounts.push(runSuccesses);
    frequencyMap[runSuccesses] = (frequencyMap[runSuccesses] || 0) + 1;
    totalSuccessesAllRuns += runSuccesses;
  }

  const sampleMean = replications > 0 ? totalSuccessesAllRuns / replications : 0;

  // Sample variance
  let sumSqDiff = 0;
  for (const count of successCounts) {
    sumSqDiff += Math.pow(count - sampleMean, 2);
  }
  const sampleVariance = replications > 1 ? sumSqDiff / (replications - 1) : 0;
  const sampleStdDev = Math.sqrt(sampleVariance);

  return {
    successCounts,
    frequencyMap,
    sampleMean,
    sampleVariance,
    sampleStdDev,
  };
}

/**
 * Comprehensive calculator breakdown with step-by-step mathematical reasoning
 */
export function calculateProbabilitySteps(
  n: number,
  p: number,
  x: number,
  rangeA?: number,
  rangeB?: number
): CalculationResult {
  const q = 1 - p;
  const nCrVal = combination(n, x);
  const pPowXVal = Math.pow(p, x);
  const qPowNMinusXVal = Math.pow(q, n - x);
  const pExact = binomialPMF(n, p, x);
  const pAtMost = binomialCDF(n, p, x);
  const pLessThan = x > 0 ? binomialCDF(n, p, x - 1) : 0;
  const pAtLeast = 1 - pLessThan;
  const pGreaterThan = 1 - pAtMost;

  let pRangeVal: number | undefined = undefined;
  if (rangeA !== undefined && rangeB !== undefined) {
    pRangeVal = binomialRange(n, p, rangeA, rangeB);
  }

  // Build step-by-step mathematical derivation
  const steps = [
    {
      title: 'Step 1: Identify Parameters and Formula',
      formula: 'P(X = x) = \\binom{n}{x} \\times p^x \\times (1 - p)^{n - x}',
      substitution: `Given: n = ${n} trials, p = ${p} (probability of success), q = (1 - p) = ${q.toFixed(4)}, target x = ${x} successes.`,
      result: `We evaluate the probability of achieving exactly ${x} successes in ${n} independent Bernoulli trials.`,
    },
    {
      title: 'Step 2: Calculate Combination nCr (Number of Ways)',
      formula: '\\binom{n}{x} = \\frac{n!}{x!(n - x)!}',
      substitution: `\\binom{${n}}{${x}} = \\frac{${n}!}{${x}!(${n} - ${x})!} = \\frac{${n}!}{${x}! \\times ${n - x}!}`,
      result: `\\binom{${n}}{${x}} = ${nCrVal.toLocaleString()}`,
    },
    {
      title: 'Step 3: Calculate Success Probability Component (p^x)',
      formula: 'p^x',
      substitution: `(${p})^{${x}}`,
      result: `= ${pPowXVal < 0.000001 && pPowXVal > 0 ? pPowXVal.toExponential(4) : pPowXVal.toFixed(6)}`,
    },
    {
      title: 'Step 4: Calculate Failure Probability Component (q^(n - x))',
      formula: '(1 - p)^{n - x} = q^{n - x}',
      substitution: `(${q.toFixed(4)})^{${n} - ${x}} = (${q.toFixed(4)})^{${n - x}}`,
      result: `= ${qPowNMinusXVal < 0.000001 && qPowNMinusXVal > 0 ? qPowNMinusXVal.toExponential(4) : qPowNMinusXVal.toFixed(6)}`,
    },
    {
      title: 'Step 5: Multiply Terms for Final Probability P(X = x)',
      formula: 'P(X = x) = \\binom{n}{x} \\times p^x \\times q^{n - x}',
      substitution: `${nCrVal.toLocaleString()} \\times ${pPowXVal < 0.000001 ? pPowXVal.toExponential(3) : pPowXVal.toFixed(6)} \\times ${qPowNMinusXVal < 0.000001 ? qPowNMinusXVal.toExponential(3) : qPowNMinusXVal.toFixed(6)}`,
      result: `P(X = ${x}) = ${pExact.toFixed(6)} (${(pExact * 100).toFixed(4)}%)`,
    },
  ];

  return {
    n,
    p,
    q,
    x,
    rangeA,
    rangeB,
    pExact,
    pAtMost,
    pAtLeast,
    pLessThan,
    pGreaterThan,
    pRange: pRangeVal,
    nCr: nCrVal,
    pPowX: pPowXVal,
    qPowNMinusX: qPowNMinusXVal,
    steps,
  };
}
