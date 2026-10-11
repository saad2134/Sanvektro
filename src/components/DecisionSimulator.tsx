import React, { useState } from 'react';
import type { 
  SimulationDraft, 
  ExpenseCategory, 
  ConsequenceMetrics, 
  ConsequenceDiff,
  FinancialState
} from '../types/finance';
import { generateComparisonScenarios } from '../utils/calculations';
import { 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  Info
} from 'lucide-react';

interface DecisionSimulatorProps {
  currentDay: number;
  financialState?: FinancialState;
  baselineMetrics: ConsequenceMetrics;
  simulatedMetrics: ConsequenceMetrics | null;
  diff: ConsequenceDiff | null;
  simulationDraft: SimulationDraft | null;
  onUpdateDraft: (draft: SimulationDraft | null) => void;
  onCommitDraft: (draft: SimulationDraft) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Entertainment & Social',
  'Shopping & Quick-Commerce',
  'Transit & Commute',
  'Academic & Tech',
  'Health & Emergency'
];

const QUICK_SIMULATIONS = [
  { title: 'Swiggy Midnight Pizza Feast', amount: 480, category: 'Food & Dining' as ExpenseCategory },
  { title: 'Weekend Rooftop Cafe', amount: 750, category: 'Entertainment & Social' as ExpenseCategory },
  { title: 'Sneaker Drop Pre-order', amount: 2200, category: 'Shopping & Quick-Commerce' as ExpenseCategory },
  { title: 'ANC Wireless Headphones', amount: 1500, category: 'Academic & Tech' as ExpenseCategory },
  { title: 'Blinkit Instant Grocery Run', amount: 320, category: 'Shopping & Quick-Commerce' as ExpenseCategory },
  { title: 'OTT & Music Annual Pass', amount: 1199, category: 'Entertainment & Social' as ExpenseCategory },
  { title: 'Screen Repair Emergency', amount: 1000, category: 'Health & Emergency' as ExpenseCategory },
  { title: 'Concert VIP Pass', amount: 1800, category: 'Entertainment & Social' as ExpenseCategory },
  { title: 'Late-Night Cab Surge', amount: 380, category: 'Transit & Commute' as ExpenseCategory },
  { title: 'Freelance Design Stipend', amount: 1500, category: 'Academic & Tech' as ExpenseCategory }
];

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  currentDay,
  financialState,
  baselineMetrics,
  simulatedMetrics,
  diff,
  simulationDraft,
  onUpdateDraft,
  onCommitDraft
}) => {
  const [title, setTitle] = useState(simulationDraft?.title ?? 'Weekend Outing & Dinner');
  const [amount, setAmount] = useState<number>(simulationDraft?.amount ?? 500);
  const [category, setCategory] = useState<ExpenseCategory>(simulationDraft?.category ?? 'Food & Dining');
  const [day, setDay] = useState<number>(simulationDraft?.day ?? currentDay);

  // Synchronize draft on parameter change
  const triggerSimulation = (newTitle: string, newAmount: number, newCat: ExpenseCategory, newDay: number) => {
    setTitle(newTitle);
    setAmount(newAmount);
    setCategory(newCat);
    setDay(newDay);

    if (newAmount > 0) {
      onUpdateDraft({
        title: newTitle,
        amount: newAmount,
        category: newCat,
        day: newDay
      });
    } else {
      onUpdateDraft(null);
    }
  };

  const handleQuickSelect = (item: typeof QUICK_SIMULATIONS[0]) => {
    triggerSimulation(item.title, item.amount, item.category, currentDay);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Number(e.target.value));
    triggerSimulation(title, val, category, day);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerSimulation(e.target.value, amount, category, day);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    triggerSimulation(title, amount, e.target.value as ExpenseCategory, day);
  };

  const handleCommit = () => {
    if (simulationDraft && simulationDraft.amount > 0) {
      onCommitDraft(simulationDraft);
    }
  };

  const handleDiscard = () => {
    onUpdateDraft(null);
    setAmount(0);
  };

  const isSimulating = simulationDraft !== null && simulationDraft.amount > 0 && simulatedMetrics !== null;
  const comparisonScenarios = isSimulating && financialState && simulationDraft
    ? generateComparisonScenarios(financialState, simulationDraft)
    : [];

  return (
    <section 
      id="decision-simulator-section"
      className="rounded-2xl bg-[#0d121e] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden"
      aria-label="What-If Decision Simulator"
    >
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 aspect-square rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full aspect-square bg-[#07090e] rounded-[14px] flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-['Plus_Jakarta_Sans'] m-0">
                "What-If" Decision Simulator
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Pre-Spend Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Stage transactions before spending to preview butterfly-effect consequences across 30 days
            </p>
          </div>
        </div>

        {isSimulating && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold animate-pulse self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" /> Simulation Staged: Previewing Delta
          </div>
        )}
      </div>

      {/* Quick impulse scenario presets */}
      <div className="mb-5 relative z-10">
        <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Gen Z Impulse Tests:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_SIMULATIONS.map((item, idx) => (
            <button
              key={idx}
              id={`quick-sim-btn-${idx}`}
              data-testid="stage-simulation-button"
              onClick={() => handleQuickSelect(item)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-slate-800/90 transition-all font-medium flex items-center gap-1.5"
            >
              <span>{item.title}</span>
              <span className="font-mono text-emerald-400 font-semibold">₹{item.amount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 relative z-10 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        
        {/* Title */}
        <div className="sm:col-span-5">
          <label htmlFor="simulator-title" className="block text-xs font-medium text-slate-400 mb-1.5">
            Expense Title / Description
          </label>
          <input
            id="simulator-title"
            data-testid="simulator-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Swiggy treat, Zara hoodie, concert pass..."
            className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="sm:col-span-4">
          <label htmlFor="simulator-amount" className="block text-xs font-medium text-slate-400 mb-1.5">
            Simulated Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₹</span>
            <input
              id="simulator-amount"
              data-testid="simulator-amount"
              data-simulator-input="decision-simulator-input"
              type="number"
              min="0"
              step="50"
              value={amount === 0 ? '' : amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-[#07090e] border border-slate-700 rounded-xl pl-8 pr-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Category */}
        <div className="sm:col-span-3">
          <label htmlFor="simulator-category" className="block text-xs font-medium text-slate-400 mb-1.5">
            Category
          </label>
          <select
            id="simulator-category"
            data-testid="simulator-category"
            value={category}
            onChange={handleCategoryChange}
            className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consequence Preview Comparison Diff (If Simulating) */}
      {isSimulating && simulatedMetrics && diff && (
        <div 
          id="consequence-preview-diff"
          data-testid="consequence-preview-diff"
          className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/40 p-5 mb-6 relative z-10 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Interconnected Consequence Analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                diff.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : diff.severity === 'SEVERE'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  : diff.severity === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                Severity: {diff.severity}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {diff.impactVerdict}
              </span>
            </div>
          </div>

          {/* Side-by-side metric shift grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            
            {/* 1. Balance Shift */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Liquid Balance</span>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="text-slate-400">₹{baselineMetrics.balance}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-white font-bold">₹{simulatedMetrics.balance}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-rose-400 mt-1 block">
                -₹{amount}
              </span>
            </div>

            {/* 2. Daily Allowance Shift */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Daily Safe Allowance</span>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="text-slate-400">₹{baselineMetrics.dailyAllowance}/d</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-white font-bold">₹{simulatedMetrics.dailyAllowance}/d</span>
              </div>
              <span className="text-xs font-mono font-semibold text-rose-400 mt-1 block">
                {diff.allowanceDelta} /day
              </span>
            </div>

            {/* 3. Health Score Shift */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Health Index</span>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="text-slate-400">{baselineMetrics.healthScore}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-white font-bold">{simulatedMetrics.healthScore}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-rose-400 mt-1 block">
                {diff.healthScoreDelta} pts
              </span>
            </div>

            {/* 4. Risk Level Transition */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Risk Classification</span>
              <div className="flex items-center gap-1 text-xs font-bold">
                <span className="text-slate-400">{baselineMetrics.riskLevel}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className={simulatedMetrics.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}>
                  {simulatedMetrics.riskLevel}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {simulatedMetrics.runwayDepletionDay ? `Exhausts on Day ${simulatedMetrics.runwayDepletionDay}` : 'Survives 30 Days'}
              </span>
            </div>

          </div>

          {/* Multi-System Chain: Bills Buffer & Goals Ripple */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Committed Bills Buffer */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Committed Bills Shield</span>
                <span className={`font-mono font-bold ${diff.committedBillsBuffer > 500 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ₹{diff.committedBillsBuffer.toLocaleString('en-IN')} buffer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed m-0">
                Net liquid margin remaining after all pending monthly rent, Wi-Fi, and active recurring subscriptions are settled.
              </p>
            </div>

            {/* Savings Goals Ripple */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Savings Goals Ripple</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {diff.affectedGoals ? diff.affectedGoals.filter(g => g.stillOnTrack).length : 0} of {diff.affectedGoals?.length ?? 0} On Track
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {diff.affectedGoals && diff.affectedGoals.length > 0 ? (
                  diff.affectedGoals.map(g => (
                    <span 
                      key={g.goalId} 
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        g.stillOnTrack
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {g.goalName}: {g.stillOnTrack ? 'On Track' : `+${g.delayDays}d delay`}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">No active goals affected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Gen Z Trade-off Translator */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Trade-off Reality Check: </span>
              {diff.tradeOffSummary}
            </div>
          </div>

          {/* 3 Isolated Strategic Scenarios Comparison */}
          {comparisonScenarios.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 m-0">
                    3-Way Strategic Decision Comparison
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Side-by-side consequence preview of alternative paths
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {comparisonScenarios.map(sc => (
                  <div
                    key={sc.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      sc.isRecommended
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white truncate">{sc.title}</span>
                        {sc.isRecommended && (
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {sc.description}
                      </p>

                      <div className="space-y-1.5 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 mb-3 text-xs font-mono">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-[10px] text-slate-400">Execution Day:</span>
                          <span className="font-bold text-white">Day {sc.day}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-[10px] text-slate-400">Cost:</span>
                          <span className="font-bold text-slate-100">₹{sc.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-[10px] text-slate-400">Daily Allowance:</span>
                          <span className="text-emerald-400 font-bold">₹{sc.metrics.dailyAllowance}/day</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-[10px] text-slate-400">Month-End Finish:</span>
                          <span className="text-cyan-400 font-bold">₹{sc.metrics.projectedDay30Balance}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerSimulation(sc.title, sc.amount, category, sc.day)}
                      id={`btn-stage-scenario-${sc.id}`}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        sc.isRecommended
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>Stage This Path</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleDiscard}
              id="btn-discard-simulation"
              data-testid="discard-simulation-button"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Discard Simulation
            </button>
            <button
              onClick={handleCommit}
              id="btn-commit-simulation"
              data-testid="commit-simulation-button"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Commit to Active Ledger
            </button>
          </div>
        </div>
      )}

      {/* Helper text when not simulating */}
      {!isSimulating && (
        <div className="text-center py-3 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          Enter an amount or click one of the quick impulse tests above to preview its ripple effect on your runway.
        </div>
      )}
    </section>
  );
};
