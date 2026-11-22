import React, { useState, useEffect, useRef } from 'react';
import { ExperimentRun, ScenarioType, SingleTrialResult } from '../../types';
import { PRESET_SCENARIOS } from '../../utils/storage';
import {
  simulateBernoulliTrials,
  getBinomialMoments,
  simulateReplications,
} from '../../utils/mathStats';
import {
  Play,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Search,
  ChevronLeft,
  ChevronRight,
  Sliders,
  FileText,
  BarChart2,
  RefreshCw,
  Coins,
  Dices,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';

interface SimulatorModuleProps {
  activeN: number;
  activeP: number;
  onUpdateParams: (n: number, p: number) => void;
  onSaveExperiment: (run: ExperimentRun) => void;
  onViewAnalysis: (run: ExperimentRun) => void;
  onOpenReport: () => void;
  selectedScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
}

export const SimulatorModule: React.FC<SimulatorModuleProps> = ({
  activeN,
  activeP,
  onUpdateParams,
  onSaveExperiment,
  onViewAnalysis,
  onOpenReport,
  selectedScenario,
  onSelectScenario,
}) => {
  const [trialsCount, setTrialsCount] = useState<number>(activeN);
  const [successProb, setSuccessProb] = useState<number>(activeP);
  const [replications, setReplications] = useState<number>(1);
  const [customName, setCustomName] = useState<string>('');
  const [customSuccessLabel, setCustomSuccessLabel] = useState<string>('Custom Success');

  // Simulation run state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [simulatedRun, setSimulatedRun] = useState<ExperimentRun | null>(null);
  const [liveTrials, setLiveTrials] = useState<SingleTrialResult[]>([]);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<boolean>(false);

  // Table pagination & filter
  const [tableFilter, setTableFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const animationRef = useRef<number | null>(null);

  // Sync with active parameters if changed externally
  useEffect(() => {
    setTrialsCount(activeN);
    setSuccessProb(activeP);
  }, [activeN, activeP]);

  // Handle scenario change
  const handleScenarioChange = (scenarioId: ScenarioType) => {
    onSelectScenario(scenarioId);
    const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setSuccessProb(scenario.defaultP);
      setTrialsCount(scenario.defaultN);
      onUpdateParams(scenario.defaultN, scenario.defaultP);
    }
  };

  // Run full simulation
  const handleStartSimulation = (animated: boolean = true) => {
    if (isRunning) return;
    setSavedSuccessMessage(false);

    const n = Math.max(1, Math.min(1000, trialsCount));
    const p = Math.max(0, Math.min(1, successProb));

    if (animated && n <= 100) {
      // Step-by-step smooth visual animation for small/medium trial counts
      setIsRunning(true);
      setProgress(0);
      setCurrentTrialIndex(0);
      setLiveTrials([]);

      const fullResult = simulateBernoulliTrials(n, p);
      let step = 0;

      const interval = setInterval(() => {
        step++;
        setCurrentTrialIndex(step);
        setProgress((step / n) * 100);
        setLiveTrials(fullResult.trials.slice(0, step));

        if (step >= n) {
          clearInterval(interval);
          finishRun(n, p, fullResult.trials, fullResult.successes, fullResult.failures);
          setIsRunning(false);
        }
      }, Math.max(15, 800 / n));
    } else {
      // Fast instantaneous execution for larger counts
      setIsRunning(true);
      const fullResult = simulateBernoulliTrials(n, p);
      setLiveTrials(fullResult.trials);
      setProgress(100);
      setCurrentTrialIndex(n);
      finishRun(n, p, fullResult.trials, fullResult.successes, fullResult.failures);
      setIsRunning(false);
    }
  };

  const finishRun = (
    n: number,
    p: number,
    trials: SingleTrialResult[],
    successes: number,
    failures: number
  ) => {
    const experimentalP = n > 0 ? successes / n : 0;
    const moments = getBinomialMoments(n, p);
    const absErr = Math.abs(experimentalP - p);
    const pctErr = p > 0 ? (absErr / p) * 100 : 0;
    const now = Date.now();

    const scenarioObj = PRESET_SCENARIOS.find((s) => s.id === selectedScenario);
    const defaultExpName = scenarioObj
      ? `${scenarioObj.name} (n=${n})`
      : `Experiment B(${n}, ${p})`;

    const run: ExperimentRun = {
      id: `exp_${now}_${Math.random().toString(36).substring(2, 7)}`,
      name: customName.trim() || defaultExpName,
      scenario: selectedScenario,
      scenarioName: scenarioObj?.name || 'Custom Scenario',
      timestamp: now,
      formattedDate: new Date(now).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      n,
      p,
      q: Number((1 - p).toFixed(4)),
      replications,
      totalTrials: n,
      successes,
      failures,
      experimentalP: Number(experimentalP.toFixed(5)),
      theoreticalP: p,
      theoreticalMean: Number(moments.mean.toFixed(2)),
      experimentalMean: successes,
      theoreticalVariance: Number(moments.variance.toFixed(3)),
      theoreticalStdDev: Number(moments.stdDev.toFixed(3)),
      absoluteError: Number(absErr.toFixed(5)),
      percentageError: Number(pctErr.toFixed(2)),
      trials,
    };

    setSimulatedRun(run);
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    setProgress(0);
    setCurrentTrialIndex(0);
    setLiveTrials([]);
    setSimulatedRun(null);
    setSavedSuccessMessage(false);
    setCurrentPage(1);
  };

  const handleSaveToHistory = () => {
    if (!simulatedRun) return;
    onSaveExperiment(simulatedRun);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  // Filtered trials for the table
  const filteredTrials = liveTrials.filter((t) => {
    if (tableFilter === 'success' && !t.isSuccess) return false;
    if (tableFilter === 'failure' && t.isSuccess) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchIndex = t.trialIndex.toString().includes(q);
      const matchVal = t.randomValue.toString().includes(q);
      return matchIndex || matchVal;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTrials.length / pageSize) || 1;
  const paginatedTrials = filteredTrials.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'coin':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'dice':
        return <Dices className="w-4 h-4 text-blue-500" />;
      case 'quality':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'exam':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sliders className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <span>Module 3</span>
          <span>·</span>
          <span>Stochastic Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Interactive Experiment Simulator
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Configure Bernoulli trial parameters, generate independent uniform random numbers,
          observe animated trial outcomes, and examine statistical error convergence.
        </p>
      </div>

      {/* Top Grid: Configuration Panel + Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Experiment Configuration</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              B(n={trialsCount}, p={successProb.toFixed(2)})
            </span>
          </div>

          {/* Scenario Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Experiment Scenario
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleScenarioChange(s.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    selectedScenario === s.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="shrink-0">{getScenarioIcon(s.id)}</div>
                  <div className="truncate">
                    <div className="font-semibold truncate">{s.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-mono">p = {s.defaultP}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters Sliders and Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Number of Trials (n) */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Number of Trials (n)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={trialsCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const clamped = Math.max(1, Math.min(1000, val));
                    setTrialsCount(clamped);
                    onUpdateParams(clamped, successProb);
                  }}
                  className="w-20 px-2 py-1 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={Math.min(trialsCount, 200)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTrialsCount(val);
                  onUpdateParams(val, successProb);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 trial</span>
                <span>50</span>
                <span>100</span>
                <span>200+</span>
              </div>
            </div>

            {/* Probability of Success (p) */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Probability of Success (p)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={successProb}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const clamped = isNaN(val) ? 0 : Math.max(0, Math.min(1, val));
                    setSuccessProb(clamped);
                    onUpdateParams(trialsCount, clamped);
                  }}
                  className="w-20 px-2 py-1 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="range"
                step="0.01"
                min="0"
                max="1"
                value={successProb}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSuccessProb(val);
                  onUpdateParams(trialsCount, val);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.00 (Never)</span>
                <span>0.50 (Fair)</span>
                <span>1.00 (Sure)</span>
              </div>
            </div>
          </div>

          {/* Optional Custom Run Name */}
          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Experiment Run Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lab Session 4 - Trial Calibration"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleStartSimulation(true)}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunning ? 'Simulating...' : 'Start Experiment'}</span>
            </button>

            <button
              onClick={() => handleStartSimulation(false)}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Fast Simulation (No Delay)</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Status and Visual Outcome (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Live Simulation Status</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isRunning
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : liveTrials.length > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isRunning
                  ? 'Running Trials...'
                  : liveTrials.length > 0
                  ? 'Simulation Complete'
                  : 'Ready for Launch'}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="my-5">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Progress: {currentTrialIndex} of {trialsCount} trials</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-75 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Real-time KPI Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Successes (S)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                  {liveTrials.filter((t) => t.isSuccess).length}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">
                  Criteria: U &lt; {successProb.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <div className="text-[11px] font-semibold text-rose-800 uppercase flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Failures (F)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-rose-900 mt-1">
                  {liveTrials.filter((t) => !t.isSuccess).length}
                </div>
                <div className="text-[10px] text-rose-700 mt-0.5">
                  Criteria: U ≥ {successProb.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Empirical Probability vs Theoretical Target */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Experimental Frequency (p̂):</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {liveTrials.length > 0
                    ? (liveTrials.filter((t) => t.isSuccess).length / liveTrials.length).toFixed(4)
                    : '0.0000'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Theoretical Probability (p):</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {successProb.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200/60">
                <span className="text-slate-600">Absolute Deviation |p̂ - p|:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {liveTrials.length > 0
                    ? Math.abs(
                        liveTrials.filter((t) => t.isSuccess).length / liveTrials.length - successProb
                      ).toFixed(4)
                    : '0.0000'}
                </span>
              </div>
            </div>
          </div>

          {/* Save & Direct Navigation Actions */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToHistory}
                disabled={!simulatedRun || isRunning}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Run</span>
              </button>

              {simulatedRun && (
                <button
                  onClick={() => onViewAnalysis(simulatedRun)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Analyze Run</span>
                </button>
              )}
            </div>

            {savedSuccessMessage && (
              <span className="text-xs font-semibold text-emerald-700 animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved to History</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trial Outcome Visual Strip (Small Cards / Tokens for immediate visual feedback) */}
      {liveTrials.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bernoulli Trial Outcome Stream (First {Math.min(liveTrials.length, 60)} Trials)
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Success (S)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                Failure (F)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/70">
            {liveTrials.slice(0, 100).map((trial) => (
              <div
                key={trial.trialIndex}
                title={`Trial #${trial.trialIndex} | U = ${trial.randomValue} (${trial.isSuccess ? 'Success' : 'Failure'})`}
                className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-[11px] font-bold cursor-help transition-transform hover:scale-110 ${
                  trial.isSuccess
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {trial.isSuccess ? 'S' : 'F'}
              </div>
            ))}
            {liveTrials.length > 100 && (
              <div className="flex items-center px-2 text-xs text-slate-400 font-mono">
                +{liveTrials.length - 100} more trials recorded in table below
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Trial Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Detailed Trial Results Table
            </h2>
            <p className="text-xs text-slate-500">
              Complete record of uniform random variables U ~ Uniform(0,1) and empirical running frequencies
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => {
                  setTableFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  tableFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                All ({liveTrials.length})
              </button>
              <button
                onClick={() => {
                  setTableFilter('success');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  tableFilter === 'success' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Successes ({liveTrials.filter((t) => t.isSuccess).length})
              </button>
              <button
                onClick={() => {
                  setTableFilter('failure');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  tableFilter === 'failure' ? 'bg-white text-rose-800 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Failures ({liveTrials.filter((t) => !t.isSuccess).length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search trial #..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
              />
            </div>
          </div>
        </div>

        {liveTrials.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Simulation has not been executed yet. Click &quot;Start Experiment&quot; above to generate Bernoulli trials.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4 font-mono">Trial #</th>
                    <th className="py-2.5 px-4 font-mono">Random Float U ~ U(0,1)</th>
                    <th className="py-2.5 px-4 font-mono">Threshold Test (U &lt; p)</th>
                    <th className="py-2.5 px-4">Outcome</th>
                    <th className="py-2.5 px-4 font-mono">Running Successes</th>
                    <th className="py-2.5 px-4 font-mono">Running Frequency (p̂)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTrials.map((trial) => (
                    <tr key={trial.trialIndex} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500 font-medium">
                        #{trial.trialIndex}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-900 font-semibold">
                        {trial.randomValue.toFixed(5)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {trial.randomValue.toFixed(5)} {trial.isSuccess ? '<' : '≥'} {successProb.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                            trial.isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {trial.isSuccess ? 'Success (1)' : 'Failure (0)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {trial.runningSuccesses}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">
                        {trial.runningFrequency.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredTrials.length)} of {filteredTrials.length} trials
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
