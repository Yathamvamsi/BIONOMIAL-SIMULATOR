/**
 * Storage and Preset Scenarios Utility
 */

import { ExperimentRun, ExperimentScenario, ScenarioType } from '../types';
import { getBinomialMoments, simulateBernoulliTrials } from './mathStats';

export const PRESET_SCENARIOS: ExperimentScenario[] = [
  {
    id: 'coin',
    name: 'Fair Coin Toss',
    description: 'Tossing an unbiased coin repeated times. Success represents landing on Heads.',
    successDefinition: 'Landing on Heads (H)',
    defaultP: 0.5,
    defaultN: 20,
    iconName: 'Coins',
    badgeLabel: 'Symmetric (p = 0.5)',
  },
  {
    id: 'dice',
    name: 'Dice Parity Experiment',
    description: 'Rolling a standard 6-sided die. Success is defined as obtaining an even outcome (2, 4, or 6).',
    successDefinition: 'Even roll (2, 4, 6)',
    defaultP: 0.5,
    defaultN: 30,
    iconName: 'Dices',
    badgeLabel: 'Even / Odd (p = 0.5)',
  },
  {
    id: 'quality',
    name: 'Product Quality Control',
    description: 'Inspecting manufactured components from an automated assembly line with 5% defect rate.',
    successDefinition: 'Detecting a defective unit',
    defaultP: 0.05,
    defaultN: 50,
    iconName: 'ShieldAlert',
    badgeLabel: 'Low Probability (p = 0.05)',
  },
  {
    id: 'exam',
    name: 'Student Examination',
    description: 'Simulating a student sitting for a series of independent test items with a 70% proficiency probability.',
    successDefinition: 'Answering an item correctly',
    defaultP: 0.7,
    defaultN: 25,
    iconName: 'GraduationCap',
    badgeLabel: 'High Probability (p = 0.70)',
  },
  {
    id: 'custom',
    name: 'Custom Laboratory Experiment',
    description: 'Define custom parameters for arbitrary Bernoulli trials, user-defined success rules, and sample sizes.',
    successDefinition: 'Custom defined event',
    defaultP: 0.35,
    defaultN: 40,
    iconName: 'Sliders',
    badgeLabel: 'User Configured',
  },
];

const STORAGE_KEY = 'binomial_lab_experiments_v1';

export function getStoredExperiments(): ExperimentRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample experiments for immediate demonstration
      const initialSeed = generateInitialSeeds();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load experiments from localStorage', err);
    return [];
  }
}

export function saveExperiment(run: ExperimentRun): ExperimentRun[] {
  try {
    const current = getStoredExperiments();
    const updated = [run, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save experiment to localStorage', err);
    return [];
  }
}

export function deleteExperiment(id: string): ExperimentRun[] {
  try {
    const current = getStoredExperiments();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete experiment', err);
    return [];
  }
}

export function clearAllExperiments(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear experiments', err);
  }
}

function generateInitialSeeds(): ExperimentRun[] {
  const seedConfigs = [
    { scenario: 'coin' as ScenarioType, name: 'Coin Toss Calibration (n=20)', n: 20, p: 0.5 },
    { scenario: 'quality' as ScenarioType, name: 'Batch Inspection #401 (n=50)', n: 50, p: 0.05 },
    { scenario: 'exam' as ScenarioType, name: 'Engineering Midterm Simulation (n=25)', n: 25, p: 0.7 },
  ];

  const now = Date.now();

  return seedConfigs.map((config, index) => {
    const sim = simulateBernoulliTrials(config.n, config.p);
    const moments = getBinomialMoments(config.n, config.p);
    const absErr = Math.abs(sim.experimentalP - config.p);
    const pctErr = config.p > 0 ? (absErr / config.p) * 100 : 0;
    const dateObj = new Date(now - (index + 1) * 3600000 * 4);

    return {
      id: `seed_${index}_${now}`,
      name: config.name,
      scenario: config.scenario,
      scenarioName: PRESET_SCENARIOS.find((s) => s.id === config.scenario)?.name || 'Standard Experiment',
      timestamp: dateObj.getTime(),
      formattedDate: dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      n: config.n,
      p: config.p,
      q: Number((1 - config.p).toFixed(4)),
      replications: 1,
      totalTrials: config.n,
      successes: sim.successes,
      failures: sim.failures,
      experimentalP: Number(sim.experimentalP.toFixed(4)),
      theoreticalP: config.p,
      theoreticalMean: Number(moments.mean.toFixed(2)),
      experimentalMean: sim.successes,
      theoreticalVariance: Number(moments.variance.toFixed(3)),
      theoreticalStdDev: Number(moments.stdDev.toFixed(3)),
      absoluteError: Number(absErr.toFixed(4)),
      percentageError: Number(pctErr.toFixed(2)),
      trials: sim.trials,
      notes: 'Initial laboratory benchmark calibration run.',
    };
  });
}
