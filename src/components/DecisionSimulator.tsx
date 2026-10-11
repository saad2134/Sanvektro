import React, { useState } from 'react';
import type { 
  SimulationDraft, 
  ExpenseCategory, 
  ConsequenceMetrics, 
  ConsequenceDiff 
} from '../types/finance';
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
  { title: 'Weekend Rooftop Cafe with Friends', amount: 750, category: 'Entertainment & Social' as ExpenseCategory },
  { title: 'Sneaker Drop Pre-order', amount: 2200, category: 'Shopping & Quick-Commerce' as ExpenseCategory },
  { title: 'Concert Entry Pass', amount: 1500, category: 'Entertainment & Social' as ExpenseCategory },
  { title: 'Blinkit Instant Grocery Run', amount: 320, category: 'Shopping & Quick-Commerce' as ExpenseCategory }
];

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  currentDay,
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
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {diff.impactVerdict}
            </span>
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

          {/* Gen Z Trade-off Translator */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Trade-off Reality Check: </span>
              {diff.tradeOffSummary}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleDiscard}
              id="btn-discard-simulation"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Discard Simulation
            </button>
            <button
              onClick={handleCommit}
              id="btn-commit-simulation"
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
