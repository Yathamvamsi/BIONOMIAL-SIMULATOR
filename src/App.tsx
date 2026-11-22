/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExperimentRun, ModuleType, ScenarioType } from './types';
import {
  getStoredExperiments,
  saveExperiment,
  deleteExperiment,
  clearAllExperiments,
  PRESET_SCENARIOS,
} from './utils/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardModule } from './components/modules/DashboardModule';
import { TheoryModule } from './components/modules/TheoryModule';
import { SimulatorModule } from './components/modules/SimulatorModule';
import { CalculatorModule } from './components/modules/CalculatorModule';
import { VisualizationModule } from './components/modules/VisualizationModule';
import { AnalysisModule } from './components/modules/AnalysisModule';
import { HistoryModule } from './components/modules/HistoryModule';
import { AboutModule } from './components/modules/AboutModule';
import { ReportModal } from './components/modules/ReportModal';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [activeN, setActiveN] = useState<number>(20);
  const [activeP, setActiveP] = useState<number>(0.5);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('coin');
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentRun | null>(null);

  // Lab Report Modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportTargetExperiment, setReportTargetExperiment] = useState<ExperimentRun | null>(null);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Load experiments from storage on mount
  useEffect(() => {
    const loaded = getStoredExperiments();
    setExperiments(loaded);
    if (loaded.length > 0) {
      setCurrentExperiment(loaded[0]);
      setActiveN(loaded[0].n);
      setActiveP(loaded[0].p);
    }
  }, []);

  // Update active parameters globally
  const handleUpdateParams = (n: number, p: number) => {
    setActiveN(n);
    setActiveP(p);
  };

  // Scenario selection
  const handleSelectScenario = (scenarioId: ScenarioType) => {
    setSelectedScenario(scenarioId);
    const s = PRESET_SCENARIOS.find((item) => item.id === scenarioId);
    if (s) {
      setActiveN(s.defaultN);
      setActiveP(s.defaultP);
    }
    setCurrentModule('simulator');
  };

  // Save experiment run
  const handleSaveExperiment = (run: ExperimentRun) => {
    const updated = saveExperiment(run);
    setExperiments(updated);
    setCurrentExperiment(run);
  };

  // Delete experiment
  const handleDeleteExperiment = (id: string) => {
    const updated = deleteExperiment(id);
    setExperiments(updated);
    if (currentExperiment?.id === id) {
      setCurrentExperiment(updated[0] || null);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    clearAllExperiments();
    setExperiments([]);
    setCurrentExperiment(null);
  };

  // Open formal report
  const handleOpenReport = (run?: ExperimentRun) => {
    const target = run || currentExperiment || experiments[0] || null;
    setReportTargetExperiment(target);
    setIsReportOpen(true);
  };

  // Load experiment into simulator / analysis
  const handleLoadExperiment = (run: ExperimentRun) => {
    setCurrentExperiment(run);
    setActiveN(run.n);
    setActiveP(run.p);
    setSelectedScenario(run.scenario);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Navbar
        currentModule={currentModule}
        onNavigate={setCurrentModule}
        onOpenReport={() => handleOpenReport()}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        totalExperiments={experiments.length}
      />

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <Sidebar
          currentModule={currentModule}
          onNavigate={setCurrentModule}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          activeN={activeN}
          activeP={activeP}
          totalSaved={experiments.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentModule === 'dashboard' && (
            <DashboardModule
              experiments={experiments}
              activeN={activeN}
              activeP={activeP}
              onNavigate={setCurrentModule}
              onSelectScenario={handleSelectScenario}
              onLoadExperiment={handleLoadExperiment}
            />
          )}

          {currentModule === 'theory' && (
            <TheoryModule
              onLaunchExperiment={() => setCurrentModule('simulator')}
            />
          )}

          {currentModule === 'simulator' && (
            <SimulatorModule
              activeN={activeN}
              activeP={activeP}
              onUpdateParams={handleUpdateParams}
              onSaveExperiment={handleSaveExperiment}
              onViewAnalysis={(run) => {
                setCurrentExperiment(run);
                setCurrentModule('analysis');
              }}
              onOpenReport={() => handleOpenReport(currentExperiment || undefined)}
              selectedScenario={selectedScenario}
              onSelectScenario={setSelectedScenario}
            />
          )}

          {currentModule === 'calculator' && (
            <CalculatorModule
              activeN={activeN}
              activeP={activeP}
              onUpdateParams={handleUpdateParams}
            />
          )}

          {currentModule === 'visualization' && (
            <VisualizationModule
              activeN={activeN}
              activeP={activeP}
              onUpdateParams={handleUpdateParams}
              recentExperiment={currentExperiment}
            />
          )}

          {currentModule === 'analysis' && (
            <AnalysisModule
              currentExperiment={currentExperiment}
              onRunNewExperimentWithN={(n) => {
                setActiveN(n);
                setCurrentModule('simulator');
              }}
              onOpenReport={() => handleOpenReport(currentExperiment || undefined)}
            />
          )}

          {currentModule === 'history' && (
            <HistoryModule
              experiments={experiments}
              onDeleteExperiment={handleDeleteExperiment}
              onClearHistory={handleClearHistory}
              onSelectExperimentForAnalysis={(run) => {
                setCurrentExperiment(run);
                setCurrentModule('analysis');
              }}
              onSelectExperimentForReport={(run) => {
                handleOpenReport(run);
              }}
            />
          )}

          {currentModule === 'about' && <AboutModule />}
        </main>
      </div>

      {/* University Laboratory Report Modal */}
      <ReportModal
        experiment={reportTargetExperiment || currentExperiment || experiments[0] || null}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
