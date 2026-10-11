import React from 'react';
import type { SavingsGoal } from '../types/finance';
import { Target, Plus, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  projectedSurplus: number;
  onContributeGoal: (id: string, amount: number) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  projectedSurplus,
  onContributeGoal
}) => {
  const handleContribute = (goal: SavingsGoal) => {
    const boost = 250;
    onContributeGoal(goal.id, boost);
    if (goal.currentAmount + boost >= goal.targetAmount) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <section 
      id="savings-goals-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="Savings Goals & Pacing"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Savings Goals & Pacing Corridor
          </h2>
          <p className="text-xs text-slate-400">
            Pacing indicators showing if current spending trajectory enables your targets
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-slate-400">Month-End Surplus: </span>
          <span className={`font-bold ${projectedSurplus > 1000 ? 'text-emerald-400' : 'text-amber-400'}`}>
            ₹{projectedSurplus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {goals.map(goal => {
          const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = goal.currentAmount >= goal.targetAmount;
          const isAtRisk = projectedSurplus < (goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              id={`goal-card-${goal.id}`}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xl">{goal.emoji}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isComplete
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isAtRisk
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {isComplete ? 'Funded' : isAtRisk ? 'Pacing Risk' : 'On Track'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {goal.name}
                </h3>

                <div className="flex items-baseline justify-between text-xs font-mono text-slate-300 mb-2">
                  <span>₹{goal.currentAmount}</span>
                  <span className="text-slate-500">/ ₹{goal.targetAmount}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-400' : isAtRisk ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-mono">
                  {progressPercent}%
                </span>
                <button
                  onClick={() => handleContribute(goal)}
                  disabled={isComplete}
                  id={`btn-contribute-${goal.id}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 font-semibold transition-colors flex items-center gap-1"
                >
                  {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  <span>{isComplete ? 'Done' : '+₹250'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
