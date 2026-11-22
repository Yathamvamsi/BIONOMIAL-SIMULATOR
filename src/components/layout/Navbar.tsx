import React from 'react';
import { ModuleType } from '../../types';
import { FlaskConical, FileText, Menu, X, BookOpen, Calculator, BarChart3 } from 'lucide-react';

interface NavbarProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  onOpenReport: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  totalExperiments: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onNavigate,
  onOpenReport,
  mobileMenuOpen,
  onToggleMobileMenu,
  totalExperiments,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single-element Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-lg bg-navy-900 bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <span className="text-cyan-400 font-mono text-sm">B(n,p)</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
                BINOMIAL LAB
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                currentModule === 'dashboard' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('theory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                currentModule === 'theory' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Theory
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                currentModule === 'simulator' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Simulator
            </button>
            <button
              onClick={() => onNavigate('calculator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                currentModule === 'calculator' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => onNavigate('visualization')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                currentModule === 'visualization' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Distribution
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Generate comprehensive university lab report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Lab Report</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />
              <span>Launch Experiment</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
