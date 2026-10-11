import React from 'react';
import { BudgetState, RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, Flame, Calendar, Sparkles } from 'lucide-react';

interface BalanceCardProps {
  state?: Partial<BudgetState>;
  onOpenSimulate?: () => void;
  onOpenAddExpense?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  state,
  onOpenSimulate,
  onOpenAddExpense,
}) => {
  const totalBudget = state?.totalBudget ?? 10000;
  const spent = state?.spent ?? 2000;
  const committed = state?.committed ?? 1000;
  const savedToGoals = state?.savedToGoals ?? 500;
  const daysRemaining = state?.daysRemaining ?? 20;
  const daysPassed = state?.daysPassed ?? 10;
  const availableBalance =
    state?.availableBalance ?? Math.max(0, totalBudget - spent - committed - savedToGoals);
  const dailyAllowance =
    state?.dailyAllowance ?? Math.round((availableBalance / Math.max(daysRemaining, 1)) * 100) / 100;
  const healthScore = state?.healthScore ?? 82;
  const riskLevel: RiskLevel =
    state?.riskLevel ?? (dailyAllowance < 100 ? 'danger' : dailyAllowance < 200 ? 'caution' : 'safe');

  const riskIcons = {
    safe: <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />,
    caution: <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />,
    danger: <Flame className="w-4 h-4 text-red-500" aria-hidden="true" />,
  };

  const riskTextClasses = {
    safe: 'text-emerald-400',
    caution: 'text-amber-400',
    danger: 'text-red-500',
  };

  const riskLabels = {
    safe: 'Safe Pacing',
    caution: 'Caution Band',
    danger: 'Danger Zone',
  };

  const riskDescriptions = {
    safe: 'You are spending within a healthy range.',
    caution: 'Your daily budget is getting tight. Consider reducing spending.',
    danger: 'Warning: At this rate you will run out of money before the month ends.',
  };

  return (
    <div
      role="region"
      aria-label="Budget overview"
      aria-describedby="balance-desc"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121526] via-[#101220] to-[#0D0F1A] border border-[#20253E] p-6 shadow-xl"
    >
      {/* Screen reader full context */}
      <p id="balance-desc" className="sr-only">
        You have spent ₹{spent} of your ₹{totalBudget} budget. ₹{availableBalance} remaining over {daysRemaining} days, giving you ₹{dailyAllowance} per day. Financial health score: {healthScore} out of 100. Risk level: {riskLevel}.
      </p>

      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Day {daysPassed} of 30</span>
          <span aria-hidden="true">·</span>
          <span>{daysRemaining} Days Remaining</span>
        </div>

        {/* Risk meter status */}
        <div
          role="status"
          aria-live="polite"
          aria-label={`Financial risk: ${riskLevel}. ${riskDescriptions[riskLevel]}`}
          data-testid="risk-indicator"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181C30] border border-[#242A4A] text-xs font-semibold ${riskTextClasses[riskLevel]}`}
        >
          <span aria-hidden="true">{riskIcons[riskLevel]}</span>
          <span className="sr-only">{riskLevel} risk — </span>
          <span>{riskLabels[riskLevel]}</span>
        </div>
      </div>

      {/* Main Available Balance */}
      <div className="mb-6">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          Available Runway Balance
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-white tracking-tight">
            ₹{availableBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500">/ ₹{totalBudget.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#1E233B]">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Daily Allowance</div>
          <div className="text-lg font-bold font-mono tabular-nums text-indigo-300 mt-0.5">
            ₹{dailyAllowance.toLocaleString('en-IN')}
            <span className="text-xs font-sans text-slate-400 font-normal"> / day</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium">Spent So Far</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-200 mt-0.5">
            ₹{spent.toLocaleString('en-IN')}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium">Committed Subs</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-200 mt-0.5">
            ₹{committed.toLocaleString('en-IN')}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium">Locked in Goals</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
            ₹{savedToGoals.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {onOpenAddExpense && (
          <button
            onClick={onOpenAddExpense}
            className="flex-1 min-w-[140px] min-h-[44px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>+ Log Expense</span>
          </button>
        )}
        {onOpenSimulate && (
          <button
            onClick={onOpenSimulate}
            className="flex-1 min-w-[140px] min-h-[44px] px-4 py-2.5 bg-[#191D32] hover:bg-[#232947] text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Simulate Ripple</span>
          </button>
        )}
      </div>
    </div>
  );
};
