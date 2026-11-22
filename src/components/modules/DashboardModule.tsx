import React from 'react';
import { ExperimentRun, ModuleType, ScenarioType } from '../../types';
import { PRESET_SCENARIOS } from '../../utils/storage';
import { generateDistributionData, getBinomialMoments } from '../../utils/mathStats';
import {
  FlaskConical,
  BarChart3,
  Calculator,
  History,
  TrendingUp,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Coins,
  Dices,
  ShieldAlert,
  GraduationCap,
  Sliders,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardModuleProps {
  experiments: ExperimentRun[];
  activeN: number;
  activeP: number;
  onNavigate: (module: ModuleType) => void;
  onSelectScenario: (scenarioId: ScenarioType) => void;
  onLoadExperiment: (run: ExperimentRun) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  experiments,
  activeN,
  activeP,
  onNavigate,
  onSelectScenario,
  onLoadExperiment,
}) => {
  const totalExperiments = experiments.length;
  const totalTrials = experiments.reduce((acc, exp) => acc + (exp.totalTrials || exp.n), 0);
  const lastExperiment = experiments[0];

  const moments = getBinomialMoments(activeN, activeP);
  const previewData = React.useMemo(() => {
    return generateDistributionData(activeN, activeP);
  }, [activeN, activeP]);

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'coin':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'dice':
        return <Dices className="w-5 h-5 text-blue-500" />;
      case 'quality':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'exam':
        return <GraduationCap className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sliders className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-2">
            <span>University Statistical Laboratory</span>
            <span>·</span>
            <span>Engineering Mathematics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 text-balance">
            BINOMIAL LAB : Binomial Distribution Experiment Simulator
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            An interactive educational laboratory for engineering and mathematics students.
            Simulate independent Bernoulli trials, evaluate theoretical probability mass functions,
            study the Law of Large Numbers, and inspect empirical error convergence in real time.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <FlaskConical className="w-4 h-4 text-cyan-300" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('theory')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/15 transition-all"
            >
              <span>Explore Theory & Proofs</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Subtle decorative formula watermark */}
        <div className="absolute right-4 bottom-2 text-slate-800/40 select-none pointer-events-none hidden lg:block font-mono text-7xl font-black">
          P(X=x)
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Experiments */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Experiments Run
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalExperiments}</div>
            <div className="text-xs text-slate-500 mt-1">Saved in local session</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Total Trials */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Bernoulli Trials
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalTrials.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Individual random tests</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Last Experiment */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Last Experiment
            </div>
            <div className="text-base font-bold text-slate-900 truncate">
              {lastExperiment ? lastExperiment.name : 'None yet'}
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">
              {lastExperiment ? `p̂ = ${lastExperiment.experimentalP} (n=${lastExperiment.n})` : 'Ready to start'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Active Configuration Moments */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Active μ and σ
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              μ = {moments.mean.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              σ = {moments.stdDev.toFixed(2)} | n={activeN}, p={activeP}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Experiment Launcher + Probability Distribution Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Experiment Launcher (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Quick Experiment Launcher</h2>
                <p className="text-xs text-slate-500">
                  Select a classic scenario or load custom trial parameters
                </p>
              </div>
              <FlaskConical className="w-5 h-5 text-blue-600" />
            </div>

            <div className="space-y-2.5">
              {PRESET_SCENARIOS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectScenario(preset.id)}
                  className="group p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                      {getScenarioIcon(preset.id)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-900">
                        {preset.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {preset.badgeLabel} · n = {preset.defaultN}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Need exact analytical calculations?</span>
            <button
              onClick={() => onNavigate('calculator')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              Open Calculator
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Distribution Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Theoretical PMF Preview: B({activeN}, {activeP})
                </h2>
                <p className="text-xs text-slate-500">
                  Probability Mass Function P(X = x) across all possible outcome counts
                </p>
              </div>
              <button
                onClick={() => onNavigate('visualization')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                Full Visualization
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recharts Bar Preview */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={previewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="x"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${(Number(value) * 100).toFixed(2)}%`, 'Probability P(X=x)']}
                    labelFormatter={(label) => `Number of Successes (x = ${label})`}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="pmf" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Mean (np)</span>
              <span className="font-bold text-slate-800 font-mono">{moments.mean.toFixed(2)}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Variance (npq)</span>
              <span className="font-bold text-slate-800 font-mono">{moments.variance.toFixed(2)}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Std Dev (σ)</span>
              <span className="font-bold text-slate-800 font-mono">{moments.stdDev.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Experiment History Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Experiment Runs</h2>
            <p className="text-xs text-slate-500">
              Review empirical trials and compare experimental frequency vs theoretical probability
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            View All ({experiments.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {experiments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No experiments recorded yet. Use the simulator to run your first trial!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-2.5 px-3">Experiment Name</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 font-mono">Trials (n)</th>
                  <th className="py-2.5 px-3 font-mono">Theoretical (p)</th>
                  <th className="py-2.5 px-3 font-mono">Successes (x)</th>
                  <th className="py-2.5 px-3 font-mono">Experimental (p̂)</th>
                  <th className="py-2.5 px-3 font-mono">Rel. Error (%)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {experiments.slice(0, 5).map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{exp.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          · {exp.scenarioName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{exp.formattedDate}</td>
                    <td className="py-3 px-3 font-mono font-medium">{exp.n}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{exp.p}</td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                      {exp.successes}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-blue-700">
                      {exp.experimentalP.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`font-semibold ${
                          exp.percentageError < 5
                            ? 'text-emerald-600'
                            : exp.percentageError < 15
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {exp.percentageError.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onLoadExperiment(exp);
                          onNavigate('analysis');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
