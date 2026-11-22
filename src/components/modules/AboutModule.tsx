import React from 'react';
import { Info, BookOpen, Cpu, ShieldCheck, GraduationCap, CheckCircle2, Award } from 'lucide-react';

export const AboutModule: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <Info className="w-4 h-4" />
          <span>Academic Project Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          About BINOMIAL LAB
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Interactive Web-Based Statistical Experiment Simulator for Engineering Mathematics
          and Probability Education.
        </p>
      </div>

      {/* Project Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">1. Project Objective &amp; Educational Vision</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          The <span className="font-semibold text-slate-900">BINOMIAL LAB</span> platform was engineered to bridge
          the gap between abstract probabilistic formulas and concrete empirical reality. In traditional undergraduate
          engineering curriculums, students encounter the Binomial Distribution as static algebraic symbols without
          gaining experiential intuition for how Bernoulli trials actually unfold or how the Law of Large Numbers
          drives empirical frequency convergence.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          This laboratory allows engineering and physical science students to configure parameterized experiments,
          generate independent pseudo-random variables, observe trial-by-trial state transitions, calculate exact
          combinatorial probabilities with full mathematical proofs, and generate comprehensive academic lab reports.
        </p>
      </div>

      {/* Mathematical Rigor & Numerical Stability */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg font-bold text-slate-900">2. Mathematical Rigor &amp; Numerical Stability</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Standard naive implementations of combinations <span className="font-mono">nCr = n! / (r!(n-r)!)</span> fail
          catastrophically for <span className="font-mono">n &gt; 170</span> due to 64-bit IEEE-754 floating point overflow
          (<span className="font-mono">Infinity / Infinity = NaN</span>).
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
          <div className="font-bold text-blue-900">High-Precision Log-Gamma Formulation:</div>
          <div>ln P(X = x) = ln Γ(n + 1) - ln Γ(x + 1) - ln Γ(n - x + 1) + x · ln(p) + (n - x) · ln(1 - p)</div>
          <div>P(X = x) = exp( ln P(X = x) )</div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          By utilizing Lanczos log-gamma approximations, BINOMIAL LAB computes numerically stable binomial probabilities
          with high precision even for large sample sizes, completely eliminating underflow and overflow errors.
        </p>
      </div>

      {/* Technology Architecture */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-700" />
          <h2 className="text-lg font-bold text-slate-900">3. Modern Technology Stack</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">React 19 &amp; Vite 8</div>
            <p className="text-slate-600">Reactive user interface with instantaneous state synchronization and hot module rendering.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">TypeScript Strict Mode</div>
            <p className="text-slate-600">Full compile-time type safety for experiment parameters, calculation engines, and trial streams.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">Tailwind CSS v4</div>
            <p className="text-slate-600">Clean, zero-pill academic design system following university mathematics lab guidelines.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">Recharts Engine</div>
            <p className="text-slate-600">Interactive SVG data visualization for discrete PMFs, CDF steps, and LLN path convergence.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">Client-Side Computation</div>
            <p className="text-slate-600">100% browser-based execution with zero server latency, zero telemetry, and zero paid API keys.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">LocalStorage Persistence</div>
            <p className="text-slate-600">Automatic local retention of laboratory sessions, enabling CSV and JSON experimental data export.</p>
          </div>
        </div>
      </div>

      {/* Academic References */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">4. Classical Literature &amp; Mathematical References</h2>
        </div>
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900 shrink-0 font-mono">[1]</span>
            <span>
              <strong>Feller, William (1968)</strong>. <em>An Introduction to Probability Theory and Its Applications</em> (Vol. 1, 3rd ed.). John Wiley &amp; Sons.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900 shrink-0 font-mono">[2]</span>
            <span>
              <strong>Papoulis, Athanasios &amp; Pillai, S. Unnikrishna (2002)</strong>. <em>Probability, Random Variables, and Stochastic Processes</em> (4th ed.). McGraw-Hill.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900 shrink-0 font-mono">[3]</span>
            <span>
              <strong>Ross, Sheldon M. (2014)</strong>. <em>Introduction to Probability Models</em> (11th ed.). Academic Press.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900 shrink-0 font-mono">[4]</span>
            <span>
              <strong>Press, Teukolsky, Vetterling, &amp; Flannery (2007)</strong>. <em>Numerical Recipes: The Art of Scientific Computing</em> (3rd ed.). Cambridge University Press.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
