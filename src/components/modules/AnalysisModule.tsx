import React, { useState, useMemo } from 'react';
import { ExperimentRun } from '../../types';
import {
  simulateBernoulliTrials,
  getBinomialMoments,
} from '../../utils/mathStats';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Play,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';

interface AnalysisModuleProps {
  currentExperiment: ExperimentRun | null;
  onRunNewExperimentWithN: (n: number) => void;
  onOpenReport: () => void;
}

export const AnalysisModule: React.FC<AnalysisModuleProps> = ({
  currentExperiment,
  onRunNewExperimentWithN,
  onOpenReport,
}) => {
  // Sample Size Multi-Test state
  const [sampleSizeResults, setSampleSizeResults] = useState<{
    n: number;
    successes: number;
    expP: number;
    absError: number;
    pctError: number;
    theoreticalSE: number;
  }[]>([]);
  const [isRunningSampleSizeTests, setIsRunningSampleSizeTests] = useState<boolean>(false);

  // Fallback default experiment if user navigated here before running any simulation
  const exp = useMemo(() => {
    if (currentExperiment) return currentExperiment;
    // Generate a default 50-trial coin experiment for instant analysis preview
    const sim = simulateBernoulliTrials(50, 0.5);
    const moments = getBinomialMoments(50, 0.5);
    const absErr = Math.abs(sim.experimentalP - 0.5);
    return {
      id: 'default_analysis_exp',
      name: 'Calibration Benchmark Run (n=50, p=0.5)',
      scenario: 'coin' as const,
      scenarioName: 'Coin Toss Calibration',
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleDateString(),
      n: 50,
      p: 0.5,
      q: 0.5,
      replications: 1,
      totalTrials: 50,
      successes: sim.successes,
      failures: sim.failures,
      experimentalP: sim.experimentalP,
      theoreticalP: 0.5,
      theoreticalMean: moments.mean,
      experimentalMean: sim.successes,
      theoreticalVariance: moments.variance,
      theoreticalStdDev: moments.stdDev,
      absoluteError: absErr,
      percentageError: (absErr / 0.5) * 100,
      trials: sim.trials,
    };
  }, [currentExperiment]);

  // Law of Large Numbers Convergence data
  const convergenceData = useMemo(() => {
    if (!exp.trials || exp.trials.length === 0) return [];
    // Downsample if trial count is very large (> 200) for rendering speed
    const step = exp.trials.length > 300 ? Math.ceil(exp.trials.length / 150) : 1;
    const pts = [];
    for (let i = 0; i < exp.trials.length; i += step) {
      const t = exp.trials[i];
      pts.push({
        trial: t.trialIndex,
        runningFreq: t.runningFrequency,
        theoreticalP: exp.p,
      });
    }
    return pts;
  }, [exp]);

  // Standard Error of proportion: SE = sqrt(p(1-p)/n)
  const standardError = Math.sqrt((exp.p * exp.q) / exp.n);
  const zScore = standardError > 0 ? (exp.experimentalP - exp.p) / standardError : 0;

  // Run comparative sample size experiments (n = 10, 50, 100, 500, 1000)
  const handleRunSampleSizeExperiment = () => {
    setIsRunningSampleSizeTests(true);
    const sampleSizes = [10, 50, 100, 500, 1000];
    const results = sampleSizes.map((testN) => {
      const sim = simulateBernoulliTrials(testN, exp.p);
      const absErr = Math.abs(sim.experimentalP - exp.p);
      const pctErr = exp.p > 0 ? (absErr / exp.p) * 100 : 0;
      const se = Math.sqrt((exp.p * exp.q) / testN);
      return {
        n: testN,
        successes: sim.successes,
        expP: Number(sim.experimentalP.toFixed(4)),
        absError: Number(absErr.toFixed(4)),
        pctError: Number(pctErr.toFixed(2)),
        theoreticalSE: Number(se.toFixed(4)),
      };
    });
    setSampleSizeResults(results);
    setIsRunningSampleSizeTests(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <LineChart className="w-4 h-4" />
          <span>Statistical Analysis & Validation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Experiment Error Analysis & LLN Convergence
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Rigorous comparison of simulated Bernoulli frequencies against theoretical expectations,
          Law of Large Numbers (LLN) path convergence, and sample size sensitivity analysis.
        </p>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Run: {exp.name}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Parameters: n = {exp.n} trials · Target p = {exp.p} · Executed: {exp.formattedDate}
            </p>
          </div>
          <button
            onClick={onOpenReport}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            Export to Formal Lab Report
          </button>
        </div>

        {/* Side-by-side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theoretical Profile */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Theoretical Expectations (Mathematical Model)
              </span>
              <span className="text-[11px] font-mono text-blue-600">Model B(n,p)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-blue-100">
                <span className="text-slate-600">Theoretical Probability (p):</span>
                <span className="font-mono font-bold text-slate-900">{exp.p.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-100">
                <span className="text-slate-600">Expected Success Count (μ = np):</span>
                <span className="font-mono font-bold text-slate-900">{exp.theoreticalMean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-100">
                <span className="text-slate-600">Theoretical Variance (σ² = npq):</span>
                <span className="font-mono font-bold text-slate-900">{exp.theoreticalVariance.toFixed(3)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-100">
                <span className="text-slate-600">Theoretical Std Dev (σ):</span>
                <span className="font-mono font-bold text-slate-900">{exp.theoreticalStdDev.toFixed(3)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Standard Error of Proportion:</span>
                <span className="font-mono font-bold text-slate-900">{standardError.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Experimental Profile */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Simulated Experimental Results (Empirical Data)
              </span>
              <span className="text-[11px] font-mono text-emerald-600">Observed</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Experimental Frequency (p̂ = x / n):</span>
                <span className="font-mono font-bold text-emerald-900">{exp.experimentalP.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Observed Successes (x):</span>
                <span className="font-mono font-bold text-emerald-900">
                  {exp.successes} of {exp.n}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Observed Failures (n - x):</span>
                <span className="font-mono font-bold text-slate-900">{exp.failures}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Absolute Error |p̂ - p|:</span>
                <span className="font-mono font-bold text-slate-900">{exp.absoluteError.toFixed(5)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Relative Percentage Error:</span>
                <span className="font-mono font-bold text-slate-900">{exp.percentageError.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Scientific Deductions */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Automated Scientific Deductions &amp; Statistical Significance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The empirical probability observed is <span className="font-mono font-semibold">{exp.experimentalP.toFixed(4)}</span>,
            deviating from the true theoretical value <span className="font-mono font-semibold">{exp.p.toFixed(4)}</span> by an absolute margin of{' '}
            <span className="font-mono font-semibold">{exp.absoluteError.toFixed(4)}</span> ({exp.percentageError.toFixed(2)}% relative error).
          </p>
          <div className="text-xs text-slate-700 font-mono pt-1">
            Standard score (Z-statistic):{' '}
            <span className="font-bold text-blue-700">Z = {zScore.toFixed(3)}</span>.
            {Math.abs(zScore) <= 1 ? (
              <span className="text-emerald-700 font-sans ml-2">
                Within 1 standard deviation (68.2% empirical confidence zone). Excellent theoretical agreement.
              </span>
            ) : Math.abs(zScore) <= 2 ? (
              <span className="text-blue-700 font-sans ml-2">
                Within 2 standard deviations (95.4% empirical confidence zone). Normal stochastic variation.
              </span>
            ) : (
              <span className="text-amber-700 font-sans ml-2">
                Outside 2 standard deviations. Typical of rare random fluctuation or smaller sample size.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Law of Large Numbers Convergence Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Law of Large Numbers (LLN) Convergence Path
          </h2>
          <p className="text-xs text-slate-500">
            Plotting the running empirical success proportion p̂ₘ = xₘ / m against trial sequence index m.
            Notice how the fluctuations stabilize and converge toward the constant theoretical line p = {exp.p}.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={convergenceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="trial"
                tick={{ fontSize: 11 }}
                label={{ value: 'Trial Sequence Index (m)', position: 'insideBottom', offset: -5, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.toFixed(2)}
                label={{ value: 'Empirical Frequency p̂', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => [Number(val).toFixed(4), 'Value']}
                labelFormatter={(l) => `Trial #${l}`}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              {/* Theoretical Constant Line */}
              <ReferenceLine y={exp.p} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Target p = ${exp.p}`, fill: '#dc2626', fontSize: 11, position: 'right' }} />
              <Line
                type="monotone"
                dataKey="runningFreq"
                name="Running Empirical Frequency p̂(m)"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sample Size Sensitivity Comparison Tool */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sample Size Sensitivity Test: Effect of Increasing Sample Size (n)
            </h2>
            <p className="text-xs text-slate-500">
              Simulate experiments at n = 10, 50, 100, 500, and 1,000 to observe empirical variance contraction
            </p>
          </div>
          <button
            onClick={handleRunSampleSizeExperiment}
            disabled={isRunningSampleSizeTests}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Multi-Sample Size Experiment</span>
          </button>
        </div>

        {sampleSizeResults.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Click &quot;Run Multi-Sample Size Experiment&quot; to test how increasing n shrinks the standard error SE = √(p(1-p)/n).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th className="py-2.5 px-3 font-mono">Sample Size (n)</th>
                  <th className="py-2.5 px-3 font-mono">Successes (x)</th>
                  <th className="py-2.5 px-3 font-mono">Experimental (p̂)</th>
                  <th className="py-2.5 px-3 font-mono">Theoretical (p)</th>
                  <th className="py-2.5 px-3 font-mono">Absolute Error</th>
                  <th className="py-2.5 px-3 font-mono">Rel. Error (%)</th>
                  <th className="py-2.5 px-3 font-mono">Theoretical SE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleSizeResults.map((row) => (
                  <tr key={row.n} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                      n = {row.n.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{row.successes}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                      {row.expP.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{exp.p.toFixed(4)}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{row.absError.toFixed(4)}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`font-semibold ${
                          row.pctError < 5
                            ? 'text-emerald-600'
                            : row.pctError < 15
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {row.pctError.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      ±{row.theoreticalSE.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
          <span className="font-bold">Key Theorem:</span> As the sample size n increases, the standard error decreases proportional to 1/√n.
          Consequently, the experimental frequency converges in probability to the true parameter p (Khinchin&apos;s Weak Law of Large Numbers).
        </div>
      </div>
    </div>
  );
};
