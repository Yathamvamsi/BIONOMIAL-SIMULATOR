import React, { useState, useMemo } from 'react';
import {
  calculateProbabilitySteps,
  generateDistributionData,
  getBinomialMoments,
} from '../../utils/mathStats';
import {
  Calculator,
  Equal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

export const CalculatorModule: React.FC<{
  activeN: number;
  activeP: number;
  onUpdateParams: (n: number, p: number) => void;
}> = ({ activeN, activeP, onUpdateParams }) => {
  const [nInput, setNInput] = useState<number>(activeN);
  const [pInput, setPInput] = useState<number>(activeP);
  const [xInput, setXInput] = useState<number>(Math.round(activeN * activeP));
  const [rangeA, setRangeA] = useState<number>(Math.max(0, Math.round(activeN * activeP) - 2));
  const [rangeB, setRangeB] = useState<number>(Math.min(activeN, Math.round(activeN * activeP) + 2));
  const [selectedQueryType, setSelectedQueryType] = useState<
    'exact' | 'atMost' | 'atLeast' | 'lessThan' | 'greaterThan' | 'range'
  >('exact');

  // Input validation & safety clamping
  const safeN = Math.max(1, Math.min(500, nInput || 1));
  const safeP = Math.max(0, Math.min(1, isNaN(pInput) ? 0.5 : pInput));
  const safeX = Math.max(0, Math.min(safeN, xInput || 0));
  const safeA = Math.max(0, Math.min(safeN, rangeA || 0));
  const safeB = Math.max(safeA, Math.min(safeN, rangeB || safeN));

  const calculation = useMemo(() => {
    return calculateProbabilitySteps(safeN, safeP, safeX, safeA, safeB);
  }, [safeN, safeP, safeX, safeA, safeB]);

  const moments = useMemo(() => {
    return getBinomialMoments(safeN, safeP);
  }, [safeN, safeP]);

  const chartData = useMemo(() => {
    return generateDistributionData(safeN, safeP);
  }, [safeN, safeP]);

  // Synchronize with external active params
  const handleApplyParams = () => {
    onUpdateParams(safeN, safeP);
  };

  // Determine which bars in the chart should be highlighted based on the selected calculation mode
  const isHighlighted = (xVal: number) => {
    switch (selectedQueryType) {
      case 'exact':
        return xVal === safeX;
      case 'atMost':
        return xVal <= safeX;
      case 'atLeast':
        return xVal >= safeX;
      case 'lessThan':
        return xVal < safeX;
      case 'greaterThan':
        return xVal > safeX;
      case 'range':
        return xVal >= safeA && xVal <= safeB;
      default:
        return false;
    }
  };

  const getQueryProbability = () => {
    switch (selectedQueryType) {
      case 'exact':
        return { label: `P(X = ${safeX})`, val: calculation.pExact };
      case 'atMost':
        return { label: `P(X ≤ ${safeX})`, val: calculation.pAtMost };
      case 'atLeast':
        return { label: `P(X ≥ ${safeX})`, val: calculation.pAtLeast };
      case 'lessThan':
        return { label: `P(X < ${safeX})`, val: calculation.pLessThan };
      case 'greaterThan':
        return { label: `P(X > ${safeX})`, val: calculation.pGreaterThan };
      case 'range':
        return { label: `P(${safeA} ≤ X ≤ ${safeB})`, val: calculation.pRange || 0 };
    }
  };

  const currentResult = getQueryProbability();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <Calculator className="w-4 h-4" />
          <span>Analytical Precision Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Binomial Probability Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Compute exact, cumulative, and range binomial probabilities with full step-by-step
          combinatorial proofs and interactive mass function highlighting.
        </p>
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Input Parameters</span>
            <span className="text-xs font-mono text-slate-400">B(n, p)</span>
          </h2>

          {/* Trials n */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Number of Trials (n)</span>
              <span className="text-blue-700 font-mono">{safeN}</span>
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={nInput}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setNInput(val);
                if (xInput > val) setXInput(val);
              }}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Constraint: 1 ≤ n ≤ 500</p>
          </div>

          {/* Probability p */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Probability of Success (p)</span>
              <span className="text-blue-700 font-mono">{safeP.toFixed(4)}</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={pInput}
              onChange={(e) => setPInput(parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">q = (1 - p) = {(1 - safeP).toFixed(4)}</p>
          </div>

          {/* Number of Successes x */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Target Success Count (x)</span>
              <span className="text-emerald-700 font-mono">{safeX}</span>
            </label>
            <input
              type="number"
              min="0"
              max={safeN}
              value={xInput}
              onChange={(e) => setXInput(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Constraint: 0 ≤ x ≤ n ({safeN})</p>
          </div>

          {/* Range bounds a and b */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Range Interval Bounds: P(a ≤ X ≤ b)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Lower Bound (a)</span>
                <input
                  type="number"
                  min="0"
                  max={safeN}
                  value={rangeA}
                  onChange={(e) => setRangeA(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md mt-1"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Upper Bound (b)</span>
                <input
                  type="number"
                  min="0"
                  max={safeN}
                  value={rangeB}
                  onChange={(e) => setRangeB(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md mt-1"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyParams}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Sync (n={safeN}, p={safeP.toFixed(2)}) to Simulator &amp; Graph
          </button>
        </div>

        {/* Right Output: Results Matrix & Visual Highlight (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Calculation Summary
            </h2>
            <span className="text-xs text-slate-500">
              Select a probability metric to highlight
            </span>
          </div>

          {/* Probability Tabs / Query Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setSelectedQueryType('exact')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'exact'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">Exactly x successes</div>
              <div className="font-mono font-bold text-sm mt-0.5">P(X = {safeX})</div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {calculation.pExact.toFixed(6)}
              </div>
            </button>

            <button
              onClick={() => setSelectedQueryType('atMost')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'atMost'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">At most x successes</div>
              <div className="font-mono font-bold text-sm mt-0.5">P(X ≤ {safeX})</div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {calculation.pAtMost.toFixed(6)}
              </div>
            </button>

            <button
              onClick={() => setSelectedQueryType('atLeast')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'atLeast'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">At least x successes</div>
              <div className="font-mono font-bold text-sm mt-0.5">P(X ≥ {safeX})</div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {calculation.pAtLeast.toFixed(6)}
              </div>
            </button>

            <button
              onClick={() => setSelectedQueryType('lessThan')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'lessThan'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">Fewer than x</div>
              <div className="font-mono font-bold text-sm mt-0.5">P(X &lt; {safeX})</div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {calculation.pLessThan.toFixed(6)}
              </div>
            </button>

            <button
              onClick={() => setSelectedQueryType('greaterThan')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'greaterThan'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">More than x</div>
              <div className="font-mono font-bold text-sm mt-0.5">P(X &gt; {safeX})</div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {calculation.pGreaterThan.toFixed(6)}
              </div>
            </button>

            <button
              onClick={() => setSelectedQueryType('range')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQueryType === 'range'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-[11px] text-slate-500 font-medium">Within range [a, b]</div>
              <div className="font-mono font-bold text-sm mt-0.5">
                P({safeA} ≤ X ≤ {safeB})
              </div>
              <div className="font-mono text-xs text-blue-700 mt-1 font-semibold">
                {(calculation.pRange || 0).toFixed(6)}
              </div>
            </button>
          </div>

          {/* Active Result Hero Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-cyan-300 font-medium uppercase tracking-wider">
                Computed Probability
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono mt-0.5">
                {currentResult.label} = {currentResult.val.toFixed(6)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-300 uppercase">Percentage</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
                {(currentResult.val * 100).toFixed(4)}%
              </div>
            </div>
          </div>

          {/* Interactive PMF Highlight Visualizer */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-semibold">Distribution Highlighting</span>
              <span className="text-[11px] text-slate-400">
                Blue bar(s) represent selected event subset
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${(Number(val) * 100).toFixed(3)}%`, 'P(X = x)']}
                    labelFormatter={(l) => `x = ${l} successes`}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                  />
                  <Bar dataKey="pmf">
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.x}`}
                        fill={isHighlighted(entry.x) ? '#2563eb' : '#cbd5e1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Mathematical Derivation Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">
            Step-by-Step Mathematical Calculation: P(X = {safeX})
          </h2>
        </div>

        <div className="space-y-4">
          {calculation.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">{step.title}</span>
                <span className="text-[11px] font-mono text-slate-400">Step {idx + 1} of 5</span>
              </div>
              <div className="font-mono text-xs text-blue-700 bg-white p-2 rounded-lg border border-slate-200/80 my-2">
                {step.substitution}
              </div>
              <div className="text-xs font-medium text-slate-700 font-mono">{step.result}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
