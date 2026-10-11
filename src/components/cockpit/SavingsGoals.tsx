import React, { useState } from 'react';
import type { SavingsGoal, FinancialState } from '../../types/finance';
import { calculateSavingsLockboxRipple, calculateGoalFeasibility } from '../../utils/calculations';
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
  const [isCoinDropping, setIsCoinDropping] = useState<boolean>(false);

  const lockboxRipple = financialState
    ? calculateSavingsLockboxRipple(financialState, lockboxAmount)
    : null;

  const currentDailyAllowance = lockboxRipple?.currentDailyAllowance ?? 250;
  const currentDay = financialState?.currentDay ?? 1;

  const totalLocked = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const vaultProgressPct = totalTarget > 0 ? Math.min(100, Math.round((totalLocked / totalTarget) * 100)) : 0;

  const handleContribute = (goal: SavingsGoal, boost: number = 250) => {
    setIsCoinDropping(true);
    setTimeout(() => setIsCoinDropping(false), 700);
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

      {/* Dimensional Glass Money Vault ✦ Tactile Money Jar */}
      <div 
        data-testid="interactive-money-vault"
        className="mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {/* Dimensional Glass Jar with Slot & Liquid/Coin Fill */}
          <div className="relative w-14 h-16 aspect-square rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border-2 border-emerald-500/40 p-1 flex flex-col justify-end overflow-hidden shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_12px_rgba(16,185,129,0.15)] shrink-0">
            {/* Metallic Coin Slot Lid */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-slate-700 border border-emerald-400/50 shadow-inner" />
            
            {/* Dropping Coin Animation */}
            {isCoinDropping && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-300 shadow-lg animate-bounce flex items-center justify-center text-[7px] font-black text-slate-950 z-20">
                ₹
              </div>
            )}

            {/* Glowing Liquid/Coin Fill */}
            <div 
              className="w-full bg-gradient-to-t from-emerald-500/50 to-teal-400/30 rounded-xl transition-all duration-700 relative overflow-hidden"
              style={{ height: `${Math.max(12, vaultProgressPct)}%` }}
            >
              <div className="absolute inset-0 bg-emerald-400/20 animate-pulse" />
            </div>

            {/* Glass Specular Reflection Highlight */}
            <div className="absolute top-2 left-1.5 w-1 h-8 rounded-full bg-white/20 blur-[0.5px] pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Tactile Capital Vault ✦ Money Jar
              </span>
              <span 
                data-testid="vault-progress-pct"
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              >
                {vaultProgressPct}% Locked
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Accumulated ₹{totalLocked.toLocaleString('en-IN')} of ₹{totalTarget.toLocaleString('en-IN')} student target reserve.
            </p>
          </div>
        </div>

        {/* Quick Top-Up Actions */}
        {goals.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">Quick Deposit:</span>
            <button
              onClick={() => handleContribute(goals[0], 100)}
              disabled={goals[0].currentAmount >= goals[0].targetAmount}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 text-xs font-semibold border border-slate-700/80 transition-all shadow-[0_2px_0px_#064e3b] active:shadow-none active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
            >
              <span>+₹100</span>
            </button>
            <button
              onClick={() => handleContribute(goals[0], 250)}
              disabled={goals[0].currentAmount >= goals[0].targetAmount}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-[0_2px_0px_#064e3b] active:shadow-none active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit ₹250</span>
            </button>
          </div>
        )}
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
