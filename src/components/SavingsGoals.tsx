import React, { useState } from 'react';
import type { SavingsGoal, FinancialState } from '../types/finance';
import { calculateSavingsLockboxRipple, calculateGoalFeasibility } from '../utils/calculations';
import { Target, Plus, CheckCircle2, Lock, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  projectedSurplus: number;
  financialState?: FinancialState;
  onContributeGoal: (id: string, amount: number) => void;
  onWithdrawGoal?: (id: string, amount: number) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  projectedSurplus,
  financialState,
  onContributeGoal,
  onWithdrawGoal
}) => {
  const [lockboxAmount, setLockboxAmount] = useState<number>(500);
  const [isLockboxOpen, setIsLockboxOpen] = useState<boolean>(false);

  const lockboxRipple = financialState
    ? calculateSavingsLockboxRipple(financialState, lockboxAmount)
    : null;

  const currentDailyAllowance = lockboxRipple?.currentDailyAllowance ?? 250;
  const currentDay = financialState?.currentDay ?? 1;

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

  const handleWithdraw = (goal: SavingsGoal) => {
    if (!onWithdrawGoal || goal.currentAmount <= 0) return;
    const withdrawAmount = Math.min(250, goal.currentAmount);
    onWithdrawGoal(goal.id, withdrawAmount);
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
          const feasibility = calculateGoalFeasibility(goal, currentDay, projectedSurplus, currentDailyAllowance);

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
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-400' : isAtRisk ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Feasibility horizon & pacing details */}
                <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-2.5 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Required Burn</span>
                    <span className="text-slate-300 font-semibold">
                      {isComplete ? 'Target Met' : `₹${feasibility.dailyRequired}/day`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      Projected Finish
                    </span>
                    <span className={feasibility.projectedCompletionDay ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {isComplete ? 'Achieved' : feasibility.projectedCompletionDay ? `Day ${feasibility.projectedCompletionDay}` : 'Next Cycle'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-mono">
                  {progressPercent}%
                </span>
                <div className="flex items-center gap-1.5">
                  {onWithdrawGoal && goal.currentAmount > 0 && (
                    <button
                      onClick={() => handleWithdraw(goal)}
                      id={`btn-withdraw-${goal.id}`}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-rose-400 font-medium transition-colors"
                      title="Unlock funds back to liquid wallet"
                    >
                      -₹{Math.min(250, goal.currentAmount)}
                    </button>
                  )}
                  <button
                    onClick={() => handleContribute(goal)}
                    disabled={isComplete}
                    id={`btn-contribute-${goal.id}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 font-semibold transition-colors flex items-center gap-1"
                  >
                    {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{isComplete ? 'Funded' : '+₹250'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Savings Lockbox Ripple Simulator */}
      {financialState && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsLockboxOpen(!isLockboxOpen)}
              id="btn-toggle-lockbox-simulator"
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <div className="w-5 h-5 aspect-square rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-3 h-3" />
              </div>
              <span>Savings Lockbox Ripple Simulator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                {isLockboxOpen ? 'Hide Simulator' : 'Test Lock Impact'}
              </span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Safe Daily Burn Trade-Off
            </span>
          </div>

          {isLockboxOpen && lockboxRipple && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mt-2 space-y-3 animate-fadeIn">
              <p className="text-[11px] text-slate-400">
                See how locking extra emergency capital or trip funds impacts your remaining {lockboxRipple.remainingDays}-day safe daily burn allowance:
              </p>

              {/* Quick Chip Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Test Lock Amount:</span>
                {[250, 500, 1000, 1500, 2000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setLockboxAmount(amt)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                      lockboxAmount === amt
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Impact Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Current Safe Burn</span>
                  <span className="text-sm font-bold text-slate-200">
                    ₹{lockboxRipple.currentDailyAllowance}/day
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Simulated Safe Burn</span>
                  <span className={`text-sm font-bold ${
                    lockboxRipple.simulatedDailyAllowance >= 160
                      ? 'text-emerald-400'
                      : lockboxRipple.simulatedDailyAllowance >= 100
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    ₹{lockboxRipple.simulatedDailyAllowance}/day
                  </span>
                  <span className="text-[10px] text-rose-400 block">
                    {lockboxRipple.allowanceDelta}/day
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 block font-sans">Pacing Assessment</span>
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs mt-0.5">
                    {lockboxRipple.isSustainable ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Sustainable Cushion</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300">Liquidity Squeeze</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
