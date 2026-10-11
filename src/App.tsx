import { useState, useMemo } from 'react';
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
  generateTrajectoryPoints 
} from './utils/calculations';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TimelineScrubber } from './components/TimelineScrubber';
import { DecisionSimulator } from './components/DecisionSimulator';
import { TrajectoryChart } from './components/TrajectoryChart';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { CommitmentsList } from './components/CommitmentsList';
import { SavingsGoals } from './components/SavingsGoals';
import { ShockRoulette } from './components/ShockRoulette';
import { TransactionLedger } from './components/TransactionLedger';
import { HowItEvaluatesModal } from './components/HowItEvaluatesModal';

import confetti from 'canvas-confetti';

export function App() {
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
    return calculateConsequenceDiff(baselineMetrics, simulatedMetrics, simulationDraft.amount);
  }, [baselineMetrics, simulatedMetrics, simulationDraft]);

  const trajectoryPoints = useMemo(() => {
    return generateTrajectoryPoints(financialState, simulationDraft);
  }, [financialState, simulationDraft]);

  // Handlers
  const handleSelectPreset = (presetId: string) => {
    const preset = PERSONA_PRESETS.find(p => p.id === presetId);
    if (preset) {
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
  };

  const handleReset = () => {
    const preset = PERSONA_PRESETS.find(p => p.id === selectedPresetId) ?? PERSONA_PRESETS[0];
    setFinancialState(JSON.parse(JSON.stringify(preset.state)));
    setSimulationDraft(null);
  };

  const handleDayChange = (day: number | ((prev: number) => number)) => {
    setFinancialState(prev => {
      const nextDay = typeof day === 'function' ? day(prev.currentDay) : day;
      return {
        ...prev,
        currentDay: Math.min(30, Math.max(1, nextDay))
      };
    });
  };

  const handleToggleSubscription = (subId: string) => {
    setFinancialState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s =>
        s.id === subId ? { ...s, isActive: !s.isActive } : s
      )
    }));
  };

  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const sub: Subscription = {
      ...newSub,
      id: `sub-custom-${Date.now()}`
    };
    setFinancialState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, sub]
    }));
  };

  const handleToggleCommitmentPaid = (comId: string) => {
    setFinancialState(prev => ({
      ...prev,
      commitments: prev.commitments.map(c =>
        c.id === comId ? { ...c, isPaid: !c.isPaid } : c
      )
    }));
  };

  const handleContributeGoal = (goalId: string, amount: number) => {
    setFinancialState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    }));
  };

  const handleApplyShock = (title: string, amount: number, category: ExpenseCategory) => {
    const newTx: Transaction = {
      id: `tx-shock-${Date.now()}`,
      title,
      amount,
      category,
      day: financialState.currentDay,
      isUnexpected: true
    };
    setFinancialState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
  };

  const handleDeleteTransaction = (txId: string) => {
    setFinancialState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== txId)
    }));
  };

  const handleAddManualTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-man-${Date.now()}`
    };
    setFinancialState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
  };

  const handleCommitDraft = (draft: SimulationDraft) => {
    const newTx: Transaction = {
      id: `tx-sim-commit-${Date.now()}`,
      title: draft.title,
      amount: draft.amount,
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
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Sticky Header with Presets & Navigation */}
      <Header
        currentDay={financialState.currentDay}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onResetToBaseline={handleReset}
        onOpenHowItWorks={() => setIsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 1. Hero 4-Pillar Metric Cockpit */}
        <MetricCards
          metrics={simulatedMetrics ?? baselineMetrics}
          diff={diff}
          currentDay={financialState.currentDay}
          startingBudget={financialState.startingBudget}
        />

        {/* 2. 30-Day Timeline Calendar Scrubber */}
        <TimelineScrubber
          currentDay={financialState.currentDay}
          onDayChange={handleDayChange}
          commitments={financialState.commitments}
          subscriptions={financialState.subscriptions}
          inflows={financialState.inflows}
        />

        {/* 3. Central Grid: Decision Simulator & Interactive Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): The Decision Engine & Forecast */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Core Feature: "What-If" Decision Simulator Sandbox */}
            <DecisionSimulator
              currentDay={financialState.currentDay}
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
              onContributeGoal={handleContributeGoal}
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

      {/* Evaluation Criteria Modal */}
      <HowItEvaluatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-emerald-400 font-bold">Sanvektro</span>
            <span>•</span>
            <span>FAIE Evaluator Ready</span>
            <span>•</span>
            <span>Gen Z ₹10k 30-Day Cockpit</span>
          </div>
          <div>
            Built with React 19 + TypeScript + Tailwind CSS v4
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
