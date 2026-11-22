import React, { useState, useMemo } from 'react';
import { ExperimentRun } from '../../types';
import {
  generateDistributionData,
  getBinomialMoments,
  simulateBernoulliTrials,
} from '../../utils/mathStats';
import {
  BarChart3,
  Sliders,
  TrendingUp,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

interface VisualizationModuleProps {
  activeN: number;
  activeP: number;
  onUpdateParams: (n: number, p: number) => void;
  recentExperiment: ExperimentRun | null;
}

export const VisualizationModule: React.FC<VisualizationModuleProps> = ({
  activeN,
  activeP,
  onUpdateParams,
  recentExperiment,
}) => {
  const [n, setN] = useState<number>(activeN);
  const [p, setP] = useState<number>(activeP);
  const [selectedX, setSelectedX] = useState<number>(Math.round(activeN * activeP));
  const [showNormalApprox, setShowNormalApprox] = useState<boolean>(true);
  const [showCDF, setShowCDF] = useState<boolean>(false);
  const [showExperimentalOverlay, setShowExperimentalOverlay] = useState<boolean>(true);

  // Compute moments
  const moments = useMemo(() => getBinomialMoments(n, p), [n, p]);

  // If recent experiment matches current (n, p) or has trials, extract experimental counts
  const experimentalCounts = useMemo(() => {
    if (!recentExperiment || recentExperiment.trials.length === 0) return undefined;
    const counts: { [k: number]: number } = {};
    if (recentExperiment.replicationDistribution) {
      return recentExperiment.replicationDistribution;
    }
    // Single experiment: one empirical observation of successes
    counts[recentExperiment.successes] = 1;
    return counts;
  }, [recentExperiment]);

  const totalExp = experimentalCounts ? (recentExperiment?.replications || 1) : 0;

  const chartData = useMemo(() => {
    return generateDistributionData(
      n,
      p,
      showExperimentalOverlay ? experimentalCounts : undefined,
      totalExp
    );
  }, [n, p, showExperimentalOverlay, experimentalCounts, totalExp]);

  const handleNChange = (newN: number) => {
    const val = Math.max(1, Math.min(250, newN));
    setN(val);
    setSelectedX(Math.min(selectedX, val));
    onUpdateParams(val, p);
  };

  const handlePChange = (newP: number) => {
    const val = Math.max(0, Math.min(1, newP));
    setP(val);
    onUpdateParams(n, val);
  };

  const selectedPoint = chartData.find((d) => d.x === selectedX) || chartData[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <BarChart3 className="w-4 h-4" />
          <span>Interactive Visualization Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Probability Distribution Visualization
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Explore the Probability Mass Function (PMF), Cumulative Distribution (CDF),
          Gaussian Normal Approximation, and live empirical overlay in real time.
        </p>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Live Parameter Tuning: Binomial(n = {n}, p = {p.toFixed(2)})
            </h2>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showNormalApprox}
                onChange={(e) => setShowNormalApprox(e.target.checked)}
                className="w-4 h-4 rounded-sm text-blue-600 accent-blue-600"
              />
              <span className="font-medium text-slate-700">Normal Approx Curve</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCDF}
                onChange={(e) => setShowCDF(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600"
              />
              <span className="font-medium text-slate-700">Cumulative CDF Line</span>
            </label>

            {recentExperiment && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showExperimentalOverlay}
                  onChange={(e) => setShowExperimentalOverlay(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-emerald-600 accent-emerald-600"
                />
                <span className="font-medium text-slate-700">Experimental Result Overlay</span>
              </label>
            )}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider for n */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Trials (n): {n}</span>
              <span className="font-mono text-slate-400">1 to 250</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={n}
              onChange={(e) => handleNChange(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>n = 1</span>
              <span>n = 50</span>
              <span>n = 100</span>
              <span>n = 150</span>
            </div>
          </div>

          {/* Slider for p */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Success Probability (p): {p.toFixed(2)}</span>
              <span className="font-mono text-slate-400">q = {(1 - p).toFixed(2)}</span>
            </div>
            <input
              type="range"
              step="0.01"
              min="0"
              max="1"
              value={p}
              onChange={(e) => handlePChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.00 (Failure only)</span>
              <span>0.50 (Symmetric)</span>
              <span>1.00 (Success only)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Probability Mass Function P(X = x)
            </h2>
            <p className="text-xs text-slate-500">
              Hover over bars to inspect point probabilities or click a bar to inspect moments
            </p>
          </div>

          {selectedPoint && (
            <div className="flex items-center gap-3 text-xs bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-100 font-mono">
              <span className="text-blue-900 font-semibold">Selected x = {selectedPoint.x}:</span>
              <span className="text-blue-700 font-bold">
                P(X = {selectedPoint.x}) = {selectedPoint.pmf.toFixed(5)} ({selectedPoint.percentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onClick={(state) => {
                if (state && state.activeLabel !== undefined) {
                  setSelectedX(Number(state.activeLabel));
                }
              }}
              margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: 'Number of Successes (x)',
                  position: 'insideBottom',
                  offset: -8,
                  fontSize: 12,
                  fill: '#64748b',
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(v) => v.toFixed(2)}
                label={{
                  value: 'Probability',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  fontSize: 12,
                  fill: '#64748b',
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof chartData[0];
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 font-mono border border-slate-800">
                        <div className="text-cyan-400 font-bold border-b border-slate-700 pb-1">
                          Success Count: x = {label}
                        </div>
                        <div>Exact PMF P(X = {label}): {(data.pmf * 100).toFixed(4)}%</div>
                        <div>Cumulative CDF P(X ≤ {label}): {(data.cdf * 100).toFixed(4)}%</div>
                        {showNormalApprox && (
                          <div className="text-amber-300">
                            Normal Approx: {(data.normalApprox || 0).toFixed(5)}
                          </div>
                        )}
                        {data.experimentalFreq !== undefined && (
                          <div className="text-emerald-300">
                            Exp. Frequency: {data.experimentalFreq.toFixed(4)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

              {/* Discrete PMF Bars */}
              <Bar dataKey="pmf" name="Theoretical PMF P(X=x)" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.x}`}
                    fill={entry.x === selectedX ? '#1d4ed8' : '#3b82f6'}
                    opacity={entry.x === selectedX ? 1 : 0.85}
                  />
                ))}
              </Bar>

              {/* Normal Approximation Smooth Curve */}
              {showNormalApprox && moments.stdDev > 0 && (
                <Line
                  type="monotone"
                  dataKey="normalApprox"
                  name="Normal Approx Curve N(μ, σ²)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
              )}

              {/* Cumulative CDF Step Curve */}
              {showCDF && (
                <Line
                  type="stepAfter"
                  dataKey="cdf"
                  name="Cumulative CDF P(X ≤ x)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytical Moments Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mean */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Theoretical Mean (μ = np)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {moments.mean.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {recentExperiment ? (
              <span className="text-emerald-700 font-semibold">
                Exp. Mean: {recentExperiment.successes}
              </span>
            ) : (
              'Run simulation for empirical mean'
            )}
          </div>
        </div>

        {/* Variance */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Variance (σ² = npq)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {moments.variance.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            q = (1 - {p.toFixed(2)}) = {(1 - p).toFixed(2)}
          </div>
        </div>

        {/* Standard Deviation */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Standard Deviation (σ)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {moments.stdDev.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            68.2% within [{(moments.mean - moments.stdDev).toFixed(1)}, {(moments.mean + moments.stdDev).toFixed(1)}]
          </div>
        </div>

        {/* Skewness & Symmetry */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Skewness &amp; Shape
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {moments.skewness.toFixed(3)}
          </div>
          <div className="text-xs font-semibold mt-1">
            {p === 0.5 ? (
              <span className="text-blue-700">Perfect Symmetry</span>
            ) : p < 0.5 ? (
              <span className="text-amber-700">Right-skewed (Positive)</span>
            ) : (
              <span className="text-indigo-700">Left-skewed (Negative)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
