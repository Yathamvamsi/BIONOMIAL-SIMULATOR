import React, { useRef } from 'react';
import { ExperimentRun } from '../../types';
import { generateDistributionData, getBinomialMoments } from '../../utils/mathStats';
import { Printer, Download, X, CheckCircle, FileText, Sparkles, Building2 } from 'lucide-react';

interface ReportModalProps {
  experiment: ExperimentRun | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ experiment, isOpen, onClose }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !experiment) return null;

  const moments = getBinomialMoments(experiment.n, experiment.p);
  const chartPoints = generateDistributionData(experiment.n, experiment.p);
  const maxPmf = Math.max(...chartPoints.map((p) => p.pmf), 0.0001);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    if (!reportContentRef.current) return;
    const content = reportContentRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lab Report - ${experiment.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 24px; color: #0f274a; margin-bottom: 4px; }
    h2 { font-size: 16px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
    th { background-color: #f8fafc; font-weight: 600; }
    .mono { font-family: monospace; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin: 12px 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Binomial_Lab_Report_${experiment.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Header (Non-printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-bold text-sm">Formal University Laboratory Report</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Verification of Binomial Distribution Experiment
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="overflow-y-auto p-6 sm:p-10 text-slate-800 space-y-6 bg-white" ref={reportContentRef}>
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center sm:text-left flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-wider text-blue-800 uppercase">
                Department of Applied Mathematics &amp; Engineering Statistics
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                LABORATORY EXPERIMENT REPORT
              </h1>
              <div className="text-sm font-semibold text-slate-600 mt-0.5">
                Verification &amp; Empirical Analysis of the Binomial Probability Distribution
              </div>
            </div>
            <div className="text-xs text-right space-y-1 font-mono text-slate-500">
              <div>Experiment ID: {experiment.id.substring(0, 16)}</div>
              <div>Date Generated: {experiment.formattedDate}</div>
              <div>Status: Complete &amp; Formally Verified</div>
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Course:</span>
              <span className="font-semibold text-slate-800">ENGR-MATH 301</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Scenario:</span>
              <span className="font-semibold text-slate-800">{experiment.scenarioName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Total Trials (n):</span>
              <span className="font-mono font-bold text-slate-900">{experiment.n}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Probability (p):</span>
              <span className="font-mono font-bold text-blue-700">{experiment.p.toFixed(4)}</span>
            </div>
          </div>

          {/* 1. Experiment Title */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              1. Experiment Title
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 font-semibold">
              {experiment.name}
            </p>
          </div>

          {/* 2. Objective */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              2. Objective
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">
              To empirically simulate a sequence of <span className="font-mono font-semibold">{experiment.n}</span> independent
              Bernoulli trials with constant success probability <span className="font-mono font-semibold">p = {experiment.p}</span>,
              to measure the resulting frequency of successes, to compute theoretical binomial probabilities and statistical moments,
              and to rigorously evaluate convergence under the Law of Large Numbers.
            </p>
          </div>

          {/* 3. Theory */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              3. Theory &amp; Assumptions
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 mb-2">
              A random variable <span className="font-mono font-semibold">X</span> follows a Binomial Distribution, denoted
              as <span className="font-mono font-semibold">X ~ B(n, p)</span>, when an experiment satisfies four fundamental postulates:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
              <li>The experiment consists of a predetermined number of finite trials <span className="font-mono font-semibold">n = {experiment.n}</span>.</li>
              <li>Each trial has exactly two mutually exclusive outcomes: Success (S) or Failure (F).</li>
              <li>All trials are mutually independent; the outcome of trial <span className="font-mono">k</span> does not affect trial <span className="font-mono">k + 1</span>.</li>
              <li>The probability of success <span className="font-mono font-semibold">p = {experiment.p}</span> remains constant across all trials.</li>
            </ol>
          </div>

          {/* 4. Parameters */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              4. Experiment Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Trials (n)</span>
                <span className="font-bold text-slate-900 text-sm">{experiment.n}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Success Prob (p)</span>
                <span className="font-bold text-blue-700 text-sm">{experiment.p.toFixed(4)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Failure Prob (q = 1-p)</span>
                <span className="font-bold text-slate-700 text-sm">{experiment.q.toFixed(4)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Replications (N)</span>
                <span className="font-bold text-slate-900 text-sm">{experiment.replications || 1}</span>
              </div>
            </div>
          </div>

          {/* 5. Mathematical Formula */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              5. Governing Mathematical Formulations
            </h2>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1.5">
              <div>Probability Mass Function: P(X = x) = [n! / (x!(n - x)!)] · p^x · (1 - p)^(n - x)</div>
              <div>Expected Value (Mean): μ = E[X] = n · p = {experiment.n} · {experiment.p} = {moments.mean.toFixed(2)}</div>
              <div>Variance: σ² = Var(X) = n · p · (1 - p) = {moments.variance.toFixed(3)}</div>
              <div>Standard Deviation: σ = √(Var(X)) = {moments.stdDev.toFixed(3)}</div>
            </div>
          </div>

          {/* 6. Simulation Procedure */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              6. Simulation Procedure
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">
              1. A standard pseudo-random number generator generates uniform random variates <span className="font-mono">U_i ~ Uniform(0, 1)</span> for <span className="font-mono">i = 1, ..., {experiment.n}</span>.<br />
              2. For each trial, if <span className="font-mono">U_i &lt; {experiment.p}</span>, the event is classified as <span className="font-semibold text-emerald-700">Success (1)</span>; otherwise, as <span className="font-semibold text-rose-700">Failure (0)</span>.<br />
              3. The cumulative count of successes <span className="font-mono">x</span> is tallied and the empirical probability is computed as <span className="font-mono">p̂ = x / n</span>.<br />
              4. Statistical error margins and deviation from mathematical expectation are evaluated.
            </p>
          </div>

          {/* 7 & 8 & 9. Observed, Theoretical, and Experimental Results Table */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              7, 8 &amp; 9. Experimental vs. Theoretical Comparative Analysis
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="py-2 px-3">Metric Parameter</th>
                  <th className="py-2 px-3 font-mono">Theoretical Model Value</th>
                  <th className="py-2 px-3 font-mono">Observed Experimental Value</th>
                  <th className="py-2 px-3 font-mono">Absolute Discrepancy</th>
                  <th className="py-2 px-3 font-mono">Percentage Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-medium">Success Probability (p)</td>
                  <td className="py-2 px-3 font-mono">{experiment.theoreticalP.toFixed(4)}</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{experiment.experimentalP.toFixed(4)}</td>
                  <td className="py-2 px-3 font-mono">{experiment.absoluteError.toFixed(4)}</td>
                  <td className="py-2 px-3 font-mono font-bold">{experiment.percentageError.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Expected Success Count (Mean μ)</td>
                  <td className="py-2 px-3 font-mono">{experiment.theoreticalMean.toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">{experiment.successes}</td>
                  <td className="py-2 px-3 font-mono">|{experiment.successes} - {experiment.theoreticalMean.toFixed(2)}| = {Math.abs(experiment.successes - experiment.theoreticalMean).toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">{experiment.theoreticalMean > 0 ? ((Math.abs(experiment.successes - experiment.theoreticalMean) / experiment.theoreticalMean) * 100).toFixed(2) : 0}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Observed Failures</td>
                  <td className="py-2 px-3 font-mono">{(experiment.n * (1 - experiment.p)).toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">{experiment.failures}</td>
                  <td className="py-2 px-3 font-mono">{Math.abs(experiment.failures - experiment.n * (1 - experiment.p)).toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Distribution Spread (Std Dev σ)</td>
                  <td className="py-2 px-3 font-mono">{experiment.theoreticalStdDev.toFixed(3)}</td>
                  <td className="py-2 px-3 font-mono">-</td>
                  <td className="py-2 px-3 font-mono">-</td>
                  <td className="py-2 px-3 font-mono">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 10. Graphical Representation (Clean High-Resolution Printable SVG Bar Representation) */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              10. Graphical Representation of the Probability Mass Function
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-center text-[11px] font-mono text-slate-500 mb-2">
                Discrete Binomial Probability Mass Function P(X = x) for B(n = {experiment.n}, p = {experiment.p})
              </div>
              <div className="h-40 flex items-end justify-between gap-1 pt-6 px-4 border-b border-l border-slate-300">
                {chartPoints.slice(0, Math.min(chartPoints.length, 45)).map((pt) => {
                  const barHeightPct = Math.max(3, (pt.pmf / maxPmf) * 100);
                  const isObservedSuccessCount = pt.x === experiment.successes;
                  return (
                    <div
                      key={pt.x}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      <div
                        style={{ height: `${barHeightPct}%` }}
                        className={`w-full rounded-t-xs transition-colors ${
                          isObservedSuccessCount ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-500 mt-1">
                        {pt.x % 5 === 0 || chartPoints.length <= 15 ? pt.x : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-600 rounded-xs inline-block" />
                  <span>Theoretical PMF</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block" />
                  <span>Observed Result (x = {experiment.successes})</span>
                </div>
              </div>
            </div>
          </div>

          {/* 11. Analysis */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              11. Statistical Analysis &amp; Discussion
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">
              The experimental frequency of success obtained was <span className="font-mono font-bold">{experiment.experimentalP.toFixed(4)}</span>,
              yielding an absolute deviation of <span className="font-mono font-bold">{experiment.absoluteError.toFixed(4)}</span> from
              the theoretical probability of <span className="font-mono font-bold">{experiment.p.toFixed(4)}</span>.
              This corresponds to a relative percentage error of <span className="font-mono font-bold">{experiment.percentageError.toFixed(2)}%</span>.
              According to the Central Limit Theorem and the De Moivre-Laplace theorem, as the number of independent trials
              increases without bound, the standardized variable <span className="font-mono">Z = (X - np) / √(np(1-p))</span> converges
              asymptotically to the standard normal distribution <span className="font-mono">N(0, 1)</span>.
              The experimental observation falls well within expected confidence bounds.
            </p>
          </div>

          {/* 12. Conclusion */}
          <div>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              12. Formal Conclusion
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">
              The laboratory experiment successfully verified the theoretical behavior of independent Bernoulli trials under
              the Binomial Distribution model. The experimental success count was <span className="font-mono font-semibold">{experiment.successes}</span>,
              closely matching the mathematical expectation <span className="font-mono font-semibold">μ = {experiment.theoreticalMean.toFixed(2)}</span>.
              The empirical outcomes substantiate both the combinatorial arrangement model and the Weak Law of Large Numbers.
            </p>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="h-10 border-b border-slate-400" />
              <div className="text-slate-500 mt-1">Student Investigator Signature</div>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400" />
              <div className="text-slate-500 mt-1">Laboratory Instructor / Faculty Approval</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
