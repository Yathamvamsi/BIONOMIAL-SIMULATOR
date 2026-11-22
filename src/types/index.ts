export type ModuleType =
  | 'dashboard'
  | 'theory'
  | 'simulator'
  | 'calculator'
  | 'visualization'
  | 'analysis'
  | 'history'
  | 'about';

export type ScenarioType =
  | 'coin'
  | 'dice'
  | 'quality'
  | 'exam'
  | 'custom';

export interface ExperimentScenario {
  id: ScenarioType;
  name: string;
  description: string;
  successDefinition: string;
  defaultP: number;
  defaultN: number;
  iconName: string;
  badgeLabel: string;
}

export interface SingleTrialResult {
  trialIndex: number;
  randomValue: number; // U ~ Uniform(0, 1)
  isSuccess: boolean;
  runningSuccesses: number;
  runningFrequency: number; // runningSuccesses / trialIndex
}

export interface ExperimentRun {
  id: string;
  name: string;
  scenario: ScenarioType;
  scenarioName: string;
  timestamp: number;
  formattedDate: string;
  n: number; // Trials per experiment
  p: number; // Success probability
  q: number; // 1 - p
  replications: number; // Number of simulation experiments performed (usually 1 for detailed trial table, or N for multi-experiment distribution)
  
  // Aggregate results for the primary run
  totalTrials: number;
  successes: number;
  failures: number;
  experimentalP: number;
  
  // Theoretical counterparts
  theoreticalP: number;
  theoreticalMean: number;
  experimentalMean: number;
  theoreticalVariance: number;
  theoreticalStdDev: number;
  experimentalStdDev?: number;
  
  // Errors
  absoluteError: number;
  percentageError: number;
  
  // Detailed trials (stored for single or recent run)
  trials: SingleTrialResult[];
  
  // Replications distribution if N > 1 (success count frequency)
  replicationDistribution?: { [successCount: number]: number };
  
  notes?: string;
}

export interface DistributionPoint {
  x: number;
  pmf: number; // P(X = x)
  cdf: number; // P(X <= x)
  percentage: number;
  normalApprox?: number; // Gaussian approximation
  experimentalFreq?: number; // Normalized experimental frequency if run
}

export interface CalculationResult {
  n: number;
  p: number;
  q: number;
  x: number;
  rangeA?: number;
  rangeB?: number;
  
  pExact: number; // P(X = x)
  pAtMost: number; // P(X <= x)
  pAtLeast: number; // P(X >= x)
  pLessThan: number; // P(X < x)
  pGreaterThan: number; // P(X > x)
  pRange?: number; // P(a <= X <= b)
  
  // Step-by-step components
  nCr: number;
  pPowX: number;
  qPowNMinusX: number;
  
  // Mathematical textual explanation
  steps: {
    title: string;
    formula: string;
    substitution: string;
    result: string;
  }[];
}
