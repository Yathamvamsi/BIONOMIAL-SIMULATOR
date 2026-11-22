import React, { useState } from 'react';
import { ExperimentRun } from '../../types';
import {
  History,
  Trash2,
  FileText,
  BarChart2,
  Download,
  AlertTriangle,
  RotateCcw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HistoryModuleProps {
  experiments: ExperimentRun[];
  onDeleteExperiment: (id: string) => void;
  onClearHistory: () => void;
  onSelectExperimentForAnalysis: (run: ExperimentRun) => void;
  onSelectExperimentForReport: (run: ExperimentRun) => void;
}

export const HistoryModule: React.FC<HistoryModuleProps> = ({
  experiments,
  onDeleteExperiment,
  onClearHistory,
  onSelectExperimentForAnalysis,
  onSelectExperimentForReport,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);

  const filtered = experiments.filter((e) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.scenarioName.toLowerCase().includes(q) ||
      e.formattedDate.toLowerCase().includes(q)
    );
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `binomial_lab_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = [
      'Experiment ID',
      'Experiment Name',
      'Scenario',
      'Date',
      'Trials (n)',
      'Theoretical (p)',
      'Successes (x)',
      'Failures (n-x)',
      'Experimental (p_hat)',
      'Absolute Error',
      'Percentage Error',
    ];

    const rows = experiments.map((e) => [
      e.id,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.scenarioName}"`,
      `"${e.formattedDate}"`,
      e.n,
      e.p,
      e.successes,
      e.failures,
      e.experimentalP,
      e.absoluteError,
      `${e.percentageError}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `binomial_lab_trials_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <History className="w-4 h-4" />
          <span>Local Experiment Logs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Experiment History &amp; Records
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Manage saved simulation records, review empirical trial logs stored in browser LocalStorage,
          and export research datasets as CSV or JSON.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search experiments by name, scenario, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Export and Clear Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            disabled={experiments.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            disabled={experiments.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            disabled={experiments.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Confirm Clear Modal Dialog */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Clear All Experiment Logs?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will delete all saved runs from your browser localStorage. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setConfirmClearOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            {searchTerm ? 'No experiments match your search criteria.' : 'No saved experiments in storage.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Experiment Title</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 font-mono">Trials (n)</th>
                  <th className="py-3 px-4 font-mono">Target (p)</th>
                  <th className="py-3 px-4 font-mono">Observed (x)</th>
                  <th className="py-3 px-4 font-mono">Empirical (p̂)</th>
                  <th className="py-3 px-4 font-mono">Error (%)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.scenarioName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.formattedDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{item.n}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.p.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                      {item.successes}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {item.experimentalP.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-semibold ${
                          item.percentageError < 5
                            ? 'text-emerald-600'
                            : item.percentageError < 15
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {item.percentageError.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectExperimentForAnalysis(item)}
                          title="Open in Experiment Analysis"
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectExperimentForReport(item)}
                          title="View Official University Lab Report"
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteExperiment(item.id)}
                          title="Delete Experiment Record"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
