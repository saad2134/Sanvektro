import { useState, useMemo, useCallback } from 'react';
import type { 
  FinancialState, 
  SimulationDraft, 
  Subscription, 
  Transaction, 
  ExpenseCategory 
} from './types/finance';
import { PERSONA_PRESETS } from './data/presets';
import { 
  calculateMetrics, 
  calculateConsequenceDiff, 
  generateTrajectoryPoints,
  calculateCapitalAllocation,
  calculateCategoryOutflow,
  generateHealthScoreAudit,
  generateOptimizationTips,
  calculateDailySpendHeatmap
} from './utils/calculations';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { CapitalAllocationBar } from './components/CapitalAllocationBar';
import { DeficitAlertBanner } from './components/DeficitAlertBanner';
import { TimelineScrubber } from './components/TimelineScrubber';
import { DecisionSimulator } from './components/DecisionSimulator';
import { TrajectoryChart } from './components/TrajectoryChart';
import { SpendingHeatmap } from './components/SpendingHeatmap';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { OptimizationInsights } from './components/OptimizationInsights';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { CommitmentsList } from './components/CommitmentsList';
import { SavingsGoals } from './components/SavingsGoals';
import { ShockRoulette } from './components/ShockRoulette';
import { TransactionLedger } from './components/TransactionLedger';
import { HowItEvaluatesModal } from './components/HowItEvaluatesModal';
import { HealthAuditModal } from './components/HealthAuditModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { MonthEndReportCardModal } from './components/MonthEndReportCardModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { TheLens } from './components/TheLens';
import { CommandPalette } from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { 
  isAudioMuted, 
  toggleAudioMute, 
  playTick, 
  playChime, 
  playWarning, 
  playToggle 
} from './services/audioService';
import { 
  exportStateAsJSON, 
  exportLedgerAsCSV, 
  printMonthlyStatement 
} from './services/exportService';
import { sanitizeText, sanitizeAmount } from './services/security';

import confetti from 'canvas-confetti';

export function AppContent() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hostel-hustler');
  const [financialState, setFinancialState] = useState<FinancialState>(() => {
    const preset = PERSONA_PRESETS.find(p => p.id === 'hostel-hustler') ?? PERSONA_PRESETS[0];
    return JSON.parse(JSON.stringify(preset.state));
  });

  const [simulationDraft, setSimulationDraft] = useState<SimulationDraft | null>({
    title: 'Weekend Outing & Dinner Treat',
    amount: 500,
    category: 'Food & Dining',
    day: financialState.currentDay
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHealthAuditOpen, setIsHealthAuditOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLensActive, setIsLensActive] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMutedState, setIsMutedState] = useState<boolean>(() => isAudioMuted());

  const currentPreset = useMemo(() => {
    return PERSONA_PRESETS.find(p => p.id === selectedPresetId) ?? PERSONA_PRESETS[0];
  }, [selectedPresetId]);

  // Synchronous Reactive Calculations
  const baselineMetrics = useMemo(() => {
    return calculateMetrics(financialState);
  }, [financialState]);

  const simulatedMetrics = useMemo(() => {
    if (!simulationDraft || simulationDraft.amount <= 0) return null;
    return calculateMetrics(financialState, simulationDraft);
  }, [financialState, simulationDraft]);

  const diff = useMemo(() => {
    if (!simulationDraft || !simulatedMetrics) return null;
    return calculateConsequenceDiff(baselineMetrics, simulatedMetrics, simulationDraft.amount, financialState);
  }, [baselineMetrics, simulatedMetrics, simulationDraft, financialState]);

  const trajectoryPoints = useMemo(() => {
    return generateTrajectoryPoints(financialState, simulationDraft);
  }, [financialState, simulationDraft]);

  // Capital Allocation & Advanced Analytics
  const activeMetrics = simulatedMetrics ?? baselineMetrics;

  const capitalAllocation = useMemo(() => {
    return calculateCapitalAllocation(financialState, simulationDraft);
  }, [financialState, simulationDraft]);

  const categoryOutflows = useMemo(() => {
    return calculateCategoryOutflow(financialState);
  }, [financialState]);

  const healthScoreAudit = useMemo(() => {
    return generateHealthScoreAudit(financialState, activeMetrics);
  }, [financialState, activeMetrics]);

  const optimizationTips = useMemo(() => {
    return generateOptimizationTips(financialState, activeMetrics);
  }, [financialState, activeMetrics]);

  const totalRealizedSpend = useMemo(() => {
    return financialState.transactions
      .filter(t => t.day <= financialState.currentDay)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [financialState.transactions, financialState.currentDay]);

  const heatmapPoints = useMemo(() => {
    return calculateDailySpendHeatmap(financialState);
  }, [financialState]);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = toggleAudioMute();
    setIsMutedState(nextMuted);
    if (!nextMuted) {
      playTick();
    }
  }, []);

  // Handlers
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = PERSONA_PRESETS.find(p => p.id === presetId);
    if (preset) {
      playToggle();
      setSelectedPresetId(presetId);
      const cloned = JSON.parse(JSON.stringify(preset.state));
      setFinancialState(cloned);
      setSimulationDraft({
        title: 'Swiggy Dinner Treat',
        amount: 450,
        category: 'Food & Dining',
        day: cloned.currentDay
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    playToggle();
    const preset = PERSONA_PRESETS.find(p => p.id === selectedPresetId) ?? PERSONA_PRESETS[0];
    setFinancialState(JSON.parse(JSON.stringify(preset.state)));
    setSimulationDraft(null);
  }, [selectedPresetId]);

  const handleDayChange = useCallback((day: number | ((prev: number) => number)) => {
    playTick();
    setFinancialState(prev => {
      const nextDay = typeof day === 'function' ? day(prev.currentDay) : day;
      return {
        ...prev,
        currentDay: Math.min(30, Math.max(1, nextDay))
      };
    });
  }, []);

  const handleToggleSubscription = useCallback((subId: string) => {
    playToggle();
    setFinancialState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s =>
        s.id === subId ? { ...s, isActive: !s.isActive } : s
      )
    }));
  }, []);

  const handleAddSubscription = useCallback((newSub: Omit<Subscription, 'id'>) => {
    playToggle();
    const sub: Subscription = {
      ...newSub,
      name: sanitizeText(newSub.name, 40),
      amount: sanitizeAmount(newSub.amount, 10, 5000),
      id: `sub-custom-${Date.now()}`
    };
    setFinancialState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, sub]
    }));
  }, []);

  const handleToggleCommitmentPaid = useCallback((comId: string) => {
    playToggle();
    setFinancialState(prev => ({
      ...prev,
      commitments: prev.commitments.map(c =>
        c.id === comId ? { ...c, isPaid: !c.isPaid } : c
      )
    }));
  }, []);

  const handleContributeGoal = useCallback((goalId: string, amount: number) => {
    playChime();
    setFinancialState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    }));
  }, []);

  const handleWithdrawGoal = useCallback((goalId: string, amount: number) => {
    playToggle();
    setFinancialState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g
      )
    }));
  }, []);

  const handleApplyShock = useCallback((title: string, amount: number, category: ExpenseCategory) => {
    playWarning();
    const newTx: Transaction = {
      id: `tx-shock-${Date.now()}`,
      title: sanitizeText(title, 50),
      amount: sanitizeAmount(amount, 10, 10000),
      category,
      day: financialState.currentDay,
      isUnexpected: true
    };
    setFinancialState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
  }, [financialState.currentDay]);

  const handleDeleteTransaction = useCallback((txId: string) => {
    playToggle();
    setFinancialState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== txId)
    }));
  }, []);

  const handleAddManualTransaction = useCallback((txData: Omit<Transaction, 'id'>) => {
    playChime();
    const newTx: Transaction = {
      ...txData,
      title: sanitizeText(txData.title, 50),
      amount: sanitizeAmount(txData.amount, 1, 20000),
      id: `tx-man-${Date.now()}`
    };
    setFinancialState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
  }, []);

  const handleCommitDraft = useCallback((draft: SimulationDraft) => {
    playChime();
    const newTx: Transaction = {
      id: `tx-sim-commit-${Date.now()}`,
      title: sanitizeText(draft.title, 50),
      amount: sanitizeAmount(draft.amount, 1, 20000),
      category: draft.category,
      day: draft.day
    };
    setFinancialState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
    setSimulationDraft(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleFocusSimulator = useCallback(() => {
    const simInput = document.getElementById('sim-amount-input') || document.getElementById('decision-simulator-section');
    simInput?.scrollIntoView({ behavior: 'smooth' });
    simInput?.focus();
  }, []);

  // Keyboard Shortcuts Hook
  const shortcutActions = useMemo(() => ({
    onTogglePlay: () => {
      handleDayChange(prev => (prev >= 30 ? 1 : prev + 1));
    },
    onSelectPreset: (index: number) => {
      const preset = PERSONA_PRESETS[index];
      if (preset) handleSelectPreset(preset.id);
    },
    onFocusSimulator: handleFocusSimulator,
    onExportCSV: () => {
      exportLedgerAsCSV(financialState);
    },
    onExportJSON: () => {
      exportStateAsJSON(financialState, simulatedMetrics ?? baselineMetrics);
    },
    onPrint: () => {
      printMonthlyStatement();
    },
    onToggleMute: handleToggleMute,
    onToggleShortcutsModal: () => {
      setIsShortcutsOpen(prev => !prev);
    },
    onToggleReportCard: () => {
      setIsReportCardOpen(prev => !prev);
    },
    onToggleTour: () => {
      setIsOnboardingOpen(prev => !prev);
    },
    onToggleCommandPalette: () => {
      setIsCommandPaletteOpen(prev => !prev);
    },
    onToggleLens: () => {
      playToggle();
      setIsLensActive(prev => !prev);
    },
    onCloseModals: () => {
      setIsModalOpen(false);
      setIsHealthAuditOpen(false);
      setIsShortcutsOpen(false);
      setIsReportCardOpen(false);
      setIsOnboardingOpen(false);
      setIsCommandPaletteOpen(false);
    }
  }), [financialState, simulatedMetrics, baselineMetrics, handleDayChange, handleSelectPreset, handleToggleMute, handleFocusSimulator, playToggle]);

  useKeyboardShortcuts(shortcutActions);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Sticky Header with Presets & Navigation */}
      <Header
        currentDay={financialState.currentDay}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onResetToBaseline={handleReset}
        onOpenHowItWorks={() => setIsModalOpen(true)}
        isMuted={isMutedState}
        onToggleMute={handleToggleMute}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onExportCSV={() => exportLedgerAsCSV(financialState)}
        onExportJSON={() => exportStateAsJSON(financialState, simulatedMetrics ?? baselineMetrics)}
        onPrintStatement={printMonthlyStatement}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        letterGrade={activeMetrics.letterGrade}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dynamic Deficit & Solvency Alert Banner */}
        <DeficitAlertBanner
          metrics={activeMetrics}
          state={financialState}
          onSolveInSimulator={handleFocusSimulator}
        />

        {/* 1. Hero 4-Pillar Metric Cockpit */}
        <MetricCards
          metrics={activeMetrics}
          diff={diff}
          currentDay={financialState.currentDay}
          startingBudget={financialState.startingBudget}
          onOpenHealthAudit={() => setIsHealthAuditOpen(true)}
        />

        {/* 2. 30-Day Stacked Capital Allocation Bar */}
        <CapitalAllocationBar
          allocation={capitalAllocation}
        />

        {/* 3. 30-Day Timeline Calendar Scrubber */}
        <TimelineScrubber
          currentDay={financialState.currentDay}
          onDayChange={handleDayChange}
          commitments={financialState.commitments}
          subscriptions={financialState.subscriptions}
          inflows={financialState.inflows}
        />

        {/* 4. Central Grid: Decision Simulator & Interactive Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): The Decision Engine & Forecast */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Core Feature: "What-If" Decision Simulator Sandbox */}
            <DecisionSimulator
              currentDay={financialState.currentDay}
              financialState={financialState}
              baselineMetrics={baselineMetrics}
              simulatedMetrics={simulatedMetrics}
              diff={diff}
              simulationDraft={simulationDraft}
              onUpdateDraft={setSimulationDraft}
              onCommitDraft={handleCommitDraft}
            />

            {/* Interactive 30-Day Trajectory Curve */}
            <TrajectoryChart
              points={trajectoryPoints}
              currentDay={financialState.currentDay}
              isSimulating={simulationDraft !== null && simulationDraft.amount > 0}
            />

            {/* 30-Day Spending Intensity Matrix */}
            <SpendingHeatmap
              points={heatmapPoints}
              currentDay={financialState.currentDay}
              onSelectDay={handleDayChange}
            />

            {/* Outflow by Category Breakdown */}
            <CategoryBreakdown
              outflows={categoryOutflows}
              totalSpent={totalRealizedSpend}
            />

            {/* Transaction Ledger */}
            <TransactionLedger
              transactions={financialState.transactions}
              currentDay={financialState.currentDay}
              onDeleteTransaction={handleDeleteTransaction}
              onAddManualTransaction={handleAddManualTransaction}
            />

          </div>

          {/* Right Column (5 cols): Guardrails, Subscriptions & Shocks */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Actionable AI Optimization Insights */}
            <OptimizationInsights
              tips={optimizationTips}
            />

            {/* Subscription Guillotine */}
            <SubscriptionsManager
              subscriptions={financialState.subscriptions}
              currentDay={financialState.currentDay}
              onToggleSubscription={handleToggleSubscription}
              onAddSubscription={handleAddSubscription}
            />

            {/* Savings Goals Pacing */}
            <SavingsGoals
              goals={financialState.savingsGoals}
              projectedSurplus={baselineMetrics.projectedDay30Balance}
              financialState={financialState}
              onContributeGoal={handleContributeGoal}
              onWithdrawGoal={handleWithdrawGoal}
            />

            {/* Fixed Commitments */}
            <CommitmentsList
              commitments={financialState.commitments}
              currentDay={financialState.currentDay}
              onToggleCommitmentPaid={handleToggleCommitmentPaid}
            />

            {/* Shock Roulette & Emergency Stress-Test */}
            <ShockRoulette
              emergencyBuffer={financialState.emergencyBuffer}
              onApplyShock={handleApplyShock}
            />

          </div>

        </div>

      </main>

      {/* System Architecture Modal */}
      <HowItEvaluatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Health Audit Diagnostics Modal */}
      <HealthAuditModal
        isOpen={isHealthAuditOpen}
        onClose={() => setIsHealthAuditOpen(false)}
        audit={healthScoreAudit}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 30-Day Executive Month-End Report Card Modal */}
      <MonthEndReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        state={financialState}
        metrics={activeMetrics}
        presetName={currentPreset.name}
        onPrintStatement={printMonthlyStatement}
      />

      {/* Interactive Onboarding Guided Tour Modal */}
      <OnboardingTourModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartSandbox={handleFocusSimulator}
      />

      {/* The Lens ✦ Interactive Mathematical Inspector */}
      <TheLens
        isActive={isLensActive}
        onToggle={() => {
          playToggle();
          setIsLensActive(prev => !prev);
        }}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPreset={handleSelectPreset}
        onStageSimulation={(draft) => {
          setSimulationDraft(draft);
          handleFocusSimulator();
        }}
        onExportCSV={() => exportLedgerAsCSV(financialState)}
        onExportJSON={() => exportStateAsJSON(financialState, simulatedMetrics ?? baselineMetrics)}
        onPrint={printMonthlyStatement}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        onOpenHealthAudit={() => setIsHealthAuditOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleLens={() => {
          playToggle();
          setIsLensActive(p => !p);
        }}
        onToggleMute={handleToggleMute}
        isMuted={isMutedState}
        isLensActive={isLensActive}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-emerald-400 font-bold">Sanvektro</span>
            <span>✦</span>
            <span>Created by <a href="https://github.com/saad2134" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-emerald-400 underline transition-colors">Saaduddin Mohammed</a> (github.com/saad2134)</span>
            <span>✦</span>
            <span>Gen Z ₹10k 30-Day Decision Cockpit</span>
          </div>
          <div>
            React 19 + TypeScript + Tailwind CSS v4
          </div>
        </div>
      </footer>

    </div>
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


