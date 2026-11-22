import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, Layers, Lightbulb, Compass, ArrowRight } from 'lucide-react';

export const TheoryModule: React.FC<{ onLaunchExperiment: () => void }> = ({ onLaunchExperiment }) => {
  const [activeFormulaPart, setActiveFormulaPart] = useState<string>('all');

  const formulaParts = {
    all: {
      title: 'Full Binomial Probability Mass Function',
      formula: 'P(X = x) = \\binom{n}{x} \\times p^x \\times (1 - p)^{n - x}',
      explanation:
        'The formula calculates the probability of obtaining exactly x successes across n independent Bernoulli trials, where each trial has a constant success probability p.',
    },
    px: {
      title: 'P(X = x) — The Target Probability',
      formula: 'P(X = x)',
      explanation:
        'X is the discrete random binomial variable denoting the total number of successes. x is the specific count of successes we are interested in (0 ≤ x ≤ n).',
    },
    ncr: {
      title: 'nCx — The Binomial Coefficient (Combinations)',
      formula: '\\binom{n}{x} = \\frac{n!}{x!(n - x)!}',
      explanation:
        'The number of distinct ways to choose x successes out of n trials, irrespective of the order in which successes occur. Computed using factorials.',
    },
    px_term: {
      title: 'p^x — Success Probability Component',
      formula: 'p^x',
      explanation:
        'The probability that the x trials designated as successes all turn out to be successes. By the multiplication rule for independent events: p × p × ... × p (x times).',
    },
    q_term: {
      title: '(1 - p)^(n - x) — Failure Probability Component',
      formula: '(1 - p)^{n - x} = q^{n - x}',
      explanation:
        'The probability that the remaining (n - x) trials all turn out to be failures. Here q = 1 - p represents the single-trial failure probability.',
    },
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Foundational Statistical Theory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Theory & Mathematical Foundations of the Binomial Distribution
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Master the principles governing discrete probability, Bernoulli trials, combinatorial arrangements,
          and theoretical moments essential for engineering mathematics.
        </p>
      </div>

      {/* Core Conceptual Pillars (Grid of 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
            1
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">What is Probability?</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Probability measures the likelihood that a particular random event will occur, represented as
            a real number in the closed interval <span className="font-mono font-semibold text-slate-800">[0, 1]</span> (or 0% to 100%).
            An impossible event has probability 0, while a certain event has probability 1.
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
            P(E) = Number of favorable outcomes / Total possible outcomes
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg mb-4">
            2
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">The Bernoulli Trial</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            A single random experiment that results in exactly one of two mutually exclusive outcomes:
            traditionally labeled <span className="font-semibold text-emerald-600">Success (1)</span> with probability{' '}
            <span className="font-mono font-semibold">p</span>, and{' '}
            <span className="font-semibold text-rose-600">Failure (0)</span> with probability{' '}
            <span className="font-mono font-semibold">q = 1 - p</span>.
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
            p + q = 1.0000 · p ∈ [0, 1]
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg mb-4">
            3
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">The Binomial Distribution</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The discrete probability distribution of the total number of successes <span className="font-mono font-semibold">X</span> in a
            sequence of <span className="font-mono font-semibold">n</span> independent Bernoulli trials.
            Denoted concisely as <span className="font-mono font-semibold text-blue-700">X ~ B(n, p)</span>.
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
            Support: X ∈ &#123;0, 1, 2, ..., n&#125;
          </div>
        </div>
      </div>

      {/* The 4 Crucial Conditions / Assumptions */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">
            The Four Strict Conditions for a Binomial Experiment
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          An experiment qualifies as a binomial experiment if and only if all four conditions below are satisfied simultaneously:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 text-sm mb-1">
              1. Fixed Number of Trials (n)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The experiment consists of a predetermined, finite number of trials <span className="font-mono font-semibold">n</span>.
              The experiment cannot stop conditionally upon reaching a certain number of successes (which would be negative binomial or geometric).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 text-sm mb-1">
              2. Two Mutually Exclusive Outcomes
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every trial outcome must be classified into one of two categories: Success (S) or Failure (F).
              Even if a variable has multiple outcomes (e.g. rolling 1-6), they must be dichotomized (e.g. Even vs Odd).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 text-sm mb-1">
              3. Independent Trials
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The outcome of any individual trial has zero impact on the outcome of any other trial.
              Mathematically: <span className="font-mono">P(A ∩ B) = P(A) × P(B)</span>. Sampling must be conducted with replacement.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 text-sm mb-1">
              4. Constant Probability of Success (p)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The probability of success <span className="font-mono font-semibold">p</span> remains strictly constant across all <span className="font-mono font-semibold">n</span> trials.
              Consequently, the probability of failure <span className="font-mono font-semibold">q = 1 - p</span> is also constant.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Formula Explorer */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              Interactive Mathematical Formula Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any term below to inspect its role</span>
        </div>

        {/* Clickable Math Formula Bar */}
        <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xl sm:text-2xl font-mono text-center my-6 select-none">
          <button
            onClick={() => setActiveFormulaPart('px')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormulaPart === 'px' ? 'bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-400' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            P(X = x)
          </button>
          <span className="text-slate-500">=</span>
          <button
            onClick={() => setActiveFormulaPart('ncr')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormulaPart === 'ncr' ? 'bg-blue-500/20 text-blue-300 ring-2 ring-blue-400' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            nCx
          </button>
          <span className="text-slate-500">×</span>
          <button
            onClick={() => setActiveFormulaPart('px_term')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormulaPart === 'px_term' ? 'bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            p<sup>x</sup>
          </button>
          <span className="text-slate-500">×</span>
          <button
            onClick={() => setActiveFormulaPart('q_term')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormulaPart === 'q_term' ? 'bg-purple-500/20 text-purple-300 ring-2 ring-purple-400' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            (1 - p)<sup>n - x</sup>
          </button>
        </div>

        {/* Selected Part Explanation */}
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {formulaParts[activeFormulaPart as keyof typeof formulaParts]?.title}
          </div>
          <div className="font-mono text-sm text-slate-100 mb-2">
            Formula:{' '}
            <span className="text-amber-300">
              {formulaParts[activeFormulaPart as keyof typeof formulaParts]?.formula}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {formulaParts[activeFormulaPart as keyof typeof formulaParts]?.explanation}
          </p>
        </div>

        {/* Variable Reference Table */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-400">n (Trials)</div>
            <div className="text-slate-200 mt-0.5">Total experiment count</div>
          </div>
          <div>
            <div className="text-slate-400">p (Success)</div>
            <div className="text-slate-200 mt-0.5">Prob of success per trial</div>
          </div>
          <div>
            <div className="text-slate-400">q = 1 - p (Failure)</div>
            <div className="text-slate-200 mt-0.5">Prob of failure per trial</div>
          </div>
          <div>
            <div className="text-slate-400">x (Success count)</div>
            <div className="text-slate-200 mt-0.5">Number of successes sought</div>
          </div>
        </div>
      </div>

      {/* Statistical Moments: Mean, Variance & Standard Deviation */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Theoretical Moments of the Binomial Distribution
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          The mean, variance, and standard deviation describe the central tendency and spread of the distribution analytically:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-blue-50/30">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              Expected Value (Mean)
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 my-2">
              μ = E[X] = np
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The average or expected number of successes if the n trials are repeated a large number of times.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-100 text-xs font-mono text-slate-500">
              e.g. n=100, p=0.5 → μ = 50
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-indigo-50/30">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              Variance
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 my-2">
              σ² = Var(X) = np(1 - p)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A measure of the squared dispersion of the number of successes around the theoretical mean.
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-100 text-xs font-mono text-slate-500">
              e.g. n=100, p=0.5 → σ² = 25
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-purple-50/30">
            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
              Standard Deviation
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 my-2">
              σ = √(np(1 - p))
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The standard amount by which actual success counts will typically deviate from the expected mean.
            </p>
            <div className="mt-3 pt-3 border-t border-purple-100 text-xs font-mono text-slate-500">
              e.g. n=100, p=0.5 → σ = 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Engineering & Applied Mathematics Examples */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Real-World Applications in Engineering & Science
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Real engineering systems modeled with the Binomial Distribution:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
              <span>Example A: Quality Assurance in Semiconductor Fabrication</span>
              <span className="text-xs font-mono text-blue-700">p = 0.02, n = 200</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A wafer fab produces silicon microchips with a historical defect rate of 2% (p = 0.02). In a batch of 200 chips (n = 200),
              the expected number of defective chips is μ = 200 × 0.02 = 4 chips. The engineer uses the binomial formula to calculate
              the probability of finding fewer than 2 defectives to ensure process acceptance.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
              <span>Example B: Packet Transmission in Computer Networks</span>
              <span className="text-xs font-mono text-emerald-700">p = 0.99, n = 1000</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Over a noisy wireless link, data packets are transmitted independently with a 99% arrival success rate (p = 0.99).
              Network protocol engineers model a 1,000-packet buffer to calculate the packet loss threshold before error correction retransmission triggers.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
              <span>Example C: Medical Diagnostic Test Efficacy</span>
              <span className="text-xs font-mono text-purple-700">p = 0.85, n = 50</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A rapid diagnostic kit identifies a specific viral antibody with 85% sensitivity. When testing 50 confirmed positive samples,
              clinicians compute the probability that at least 45 tests correctly report positive.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Ready to test these formulas with actual random simulations?
          </div>
          <button
            onClick={onLaunchExperiment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span>Open Experiment Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
