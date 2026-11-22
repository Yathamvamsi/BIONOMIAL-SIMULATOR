import React from 'react';
import { ModuleType } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Calculator,
  BarChart3,
  LineChart,
  History,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeN: number;
  activeP: number;
  totalSaved: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  activeN,
  activeP,
  totalSaved,
}) => {
  const menuItems: { id: ModuleType; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      icon: LayoutDashboard,
      description: 'Overview, stats & quick launcher',
    },
    {
      id: 'theory',
      label: '2. Theory & Concepts',
      icon: BookOpen,
      description: 'Bernoulli trials, formulas & proofs',
    },
    {
      id: 'simulator',
      label: '3. Experiment Simulator',
      icon: FlaskConical,
      description: 'Interactive Bernoulli simulation',
    },
    {
      id: 'calculator',
      label: '4. Probability Calculator',
      icon: Calculator,
      description: 'Exact, cumulative & range solver',
    },
    {
      id: 'visualization',
      label: '5. Distribution Visualization',
      icon: BarChart3,
      description: 'Interactive PMF & CDF graphics',
    },
    {
      id: 'analysis',
      label: '6. Experiment Analysis',
      icon: LineChart,
      description: 'Empirical vs theoretical errors',
    },
    {
      id: 'history',
      label: '7. Experiment History',
      icon: History,
      description: 'Saved logs & localStorage runs',
    },
    {
      id: 'about',
      label: '8. About Project',
      icon: Info,
      description: 'Educational goals & references',
    },
  ];

  const handleSelect = (id: ModuleType) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Simulation Modules
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate text-sm">{item.label}</div>
                    <div className="text-[11px] text-slate-400 truncate font-normal">
                      {item.description}
                    </div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Current Active Workspace Parameters Box */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Active Parameters</span>
              <span className="text-[11px] text-slate-400 font-mono">B(n, p)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase">Trials (n)</div>
                <div className="font-bold text-slate-800 font-mono text-sm">{activeN}</div>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase">Prob (p)</div>
                <div className="font-bold text-blue-700 font-mono text-sm">{activeP.toFixed(2)}</div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Saved Runs:</span>
              <span className="font-semibold font-mono text-slate-800">{totalSaved}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
