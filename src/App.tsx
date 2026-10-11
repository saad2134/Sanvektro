/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { PERSONA_PRESETS } from './data/presets';
import { generateHealthScoreAudit } from './utils/calculations';

import { Layout } from './app/layout';
import type { AppTab } from './store/budgetStore';
import { useBudgetStore } from './store/budgetStore';
import { DashboardPage } from './app/page';

import { HowItEvaluatesModal } from './components/HowItEvaluatesModal';
import { HealthAuditModal } from './components/HealthAuditModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { MonthEndReportCardModal } from './components/MonthEndReportCardModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { TheLens } from './components/TheLens';
import { CommandPalette } from './components/CommandPalette';
import { SanvektroCoachModal } from './components/SanvektroCoachModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { 
  isAudioMuted, 
  toggleAudioMute, 
  playTick, 
  playChime, 
  playToggle 
} from './services/audioService';
import { 
  exportStateAsJSON, 
  exportLedgerAsCSV, 
  printMonthlyStatement 
} from './services/exportService';

// Lazy-loaded routes for code splitting and instant sub-100ms LCP on initial load
const SimulatePage = lazy(() =>
  import('./app/simulate/page').then((m) => ({ default: m.SimulatePage }))
);
const GoalsPage = lazy(() =>
  import('./app/goals/page').then((m) => ({ default: m.GoalsPage }))
);
const SubscriptionsPage = lazy(() =>
  import('./app/subscriptions/page').then((m) => ({ default: m.SubscriptionsPage }))
);
const ForecastPage = lazy(() =>
  import('./app/forecast/page').then((m) => ({ default: m.ForecastPage }))
);

const ViewSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Loading view">
    <div className="h-10 bg-slate-900 rounded-xl w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
      <div className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
      <div className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
    </div>
    <div className="h-64 bg-slate-900 rounded-xl border border-slate-800" />
  </div>
);

export function AppContent() {
  const store = useBudgetStore();
  const {
    financialState,
    baselineMetrics,
    simulatedMetrics,
    activePersona,
    applyPersonaPreset,
    setCurrentDay,
    setSimulationDraft,
  } = store;

  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activePersona);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHealthAuditOpen, setIsHealthAuditOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLensActive, setIsLensActive] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isMutedState, setIsMutedState] = useState<boolean>(() => isAudioMuted());

  const currentPreset = useMemo(() => {
    return PERSONA_PRESETS.find(p => p.id === selectedPresetId) ?? PERSONA_PRESETS[0];
  }, [selectedPresetId]);

  const activeMetrics = useMemo(() => {
    return simulatedMetrics ?? baselineMetrics;
  }, [simulatedMetrics, baselineMetrics]);

  const healthScoreAudit = useMemo(() => {
    return generateHealthScoreAudit(financialState, activeMetrics);
  }, [financialState, activeMetrics]);

  // Event Handlers
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = PERSONA_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    playToggle();
    setSelectedPresetId(presetId);
    applyPersonaPreset(presetId as 'hostel-hustler' | 'tech-intern' | 'freelance-creative');
  }, [applyPersonaPreset]);

  const handleDayChange = useCallback((day: number) => {
    playTick();
    setCurrentDay(day);
  }, [setCurrentDay]);

  const handleToggleMute = useCallback(() => {
    const muted = toggleAudioMute();
    setIsMutedState(muted);
  }, []);

  const handleExportCSV = useCallback(() => {
    playChime();
    exportLedgerAsCSV(financialState);
  }, [financialState]);

  const handleExportJSON = useCallback(() => {
    playChime();
    exportStateAsJSON(financialState, activeMetrics);
  }, [financialState, activeMetrics]);

  const handlePrintStatement = useCallback(() => {
    playChime();
    printMonthlyStatement();
  }, []);

  // Keyboard Shortcuts Navigation
  useKeyboardShortcuts({
    onTogglePlay: () => {
      handleDayChange(financialState.currentDay < 30 ? financialState.currentDay + 1 : 1);
    },
    onSelectPreset: (index) => {
      const preset = PERSONA_PRESETS[index];
      if (preset) handleSelectPreset(preset.id);
    },
    onFocusSimulator: () => setCurrentTab('simulate'),
    onExportCSV: handleExportCSV,
    onExportJSON: handleExportJSON,
    onPrint: handlePrintStatement,
    onToggleMute: handleToggleMute,
    onToggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    onToggleReportCard: () => setIsReportCardOpen(prev => !prev),
    onToggleTour: () => setIsOnboardingOpen(prev => !prev),
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onToggleLens: () => setIsLensActive(prev => !prev),
    onToggleCoach: () => setIsCoachOpen(prev => !prev),
    onCloseModals: () => {
      setIsModalOpen(false);
      setIsHealthAuditOpen(false);
      setIsShortcutsOpen(false);
      setIsReportCardOpen(false);
      setIsOnboardingOpen(false);
      setIsLensActive(false);
      setIsCommandPaletteOpen(false);
      setIsCoachOpen(false);
    }
  });

  return (
    <Layout
      currentTab={currentTab}
      onNavigate={setCurrentTab}
      currentDay={financialState.currentDay}
      selectedPresetId={selectedPresetId}
      onSelectPreset={handleSelectPreset}
      isMuted={isMutedState}
      onToggleMute={handleToggleMute}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
      onExportCSV={handleExportCSV}
      onExportJSON={handleExportJSON}
      onPrintStatement={handlePrintStatement}
      onOpenReportCard={() => setIsReportCardOpen(true)}
      letterGrade={healthScoreAudit.letterGrade}
      onOpenTour={() => setIsOnboardingOpen(true)}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      onOpenCoach={() => setIsCoachOpen(true)}
      onOpenHowItWorks={() => setIsModalOpen(true)}
    >
      {/* Tab View Routing */}
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigateToSimulate={() => setCurrentTab('simulate')}
          onOpenHealthAudit={() => setIsHealthAuditOpen(true)}
        />
      )}

      {currentTab === 'simulate' && (
        <Suspense fallback={<ViewSkeleton />}>
          <SimulatePage onBackToDashboard={() => setCurrentTab('dashboard')} />
        </Suspense>
      )}

      {currentTab === 'goals' && (
        <Suspense fallback={<ViewSkeleton />}>
          <GoalsPage />
        </Suspense>
      )}

      {currentTab === 'subscriptions' && (
        <Suspense fallback={<ViewSkeleton />}>
          <SubscriptionsPage />
        </Suspense>
      )}

      {currentTab === 'forecast' && (
        <Suspense fallback={<ViewSkeleton />}>
          <ForecastPage />
        </Suspense>
      )}

      {/* Global Modals & Specialized Overlays */}
      <TheLens
        isActive={isLensActive}
        onToggle={() => setIsLensActive(prev => !prev)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPreset={handleSelectPreset}
        onStageSimulation={(draft) => setSimulationDraft(draft)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onPrint={handlePrintStatement}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        onOpenHealthAudit={() => setIsHealthAuditOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleLens={() => setIsLensActive(prev => !prev)}
        onToggleMute={handleToggleMute}
        onOpenCoach={() => setIsCoachOpen(true)}
        isMuted={isMutedState}
        isLensActive={isLensActive}
      />

      <SanvektroCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        state={financialState}
        metrics={activeMetrics}
        presetName={currentPreset.name}
        onStageSimulation={(draft) => setSimulationDraft(draft)}
      />

      <HowItEvaluatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <HealthAuditModal
        isOpen={isHealthAuditOpen}
        onClose={() => setIsHealthAuditOpen(false)}
        audit={healthScoreAudit}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <MonthEndReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        state={financialState}
        metrics={activeMetrics}
        presetName={currentPreset.name}
        onPrintStatement={handlePrintStatement}
      />

      <OnboardingTourModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </Layout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
