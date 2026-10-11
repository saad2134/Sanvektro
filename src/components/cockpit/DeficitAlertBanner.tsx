import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { ConsequenceMetrics, FinancialState } from '../../types/finance';

interface DeficitAlertBannerProps {
  metrics: ConsequenceMetrics;
  state: FinancialState;
  onSolveInSimulator: () => void;
}

export const DeficitAlertBanner: React.FC<DeficitAlertBannerProps> = ({
  metrics,
  state,
  onSolveInSimulator
}) => {
  const { commitments, subscriptions, currentDay } = state;

  const pendingBills = commitments
    .filter(c => c.dueDay > currentDay && !c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingSubs = subscriptions
    .filter(s => s.isActive && s.billingDay > currentDay)
    .reduce((sum, s) => sum + s.amount, 0);

  const obligationsTotal = pendingBills + pendingSubs;
  const isShortfall = metrics.balance < obligationsTotal;
  const isDepleting = metrics.runwayDepletionDay !== null && metrics.runwayDepletionDay <= 28;
  const isAllowanceCrisis = metrics.dailyAllowance < 50;

  if (!isShortfall && !isDepleting && !isAllowanceCrisis) {
    return null;
  }

  const shortfallAmount = isShortfall ? obligationsTotal - metrics.balance : 0;

  return (
    <div
      className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-[#180e18] to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20 animate-in fade-in slide-in-from-top-1 duration-200"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 aspect-square rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-300 font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
            <span>Critical Solvency Warning</span>
            {isShortfall && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ₹{shortfallAmount.toLocaleString('en-IN')} Shortfall
              </span>
            )}
            {isDepleting && !isShortfall && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Depletes Day {metrics.runwayDepletionDay}
              </span>
            )}
          </h4>
          <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
            {isShortfall
              ? `Your liquid balance (₹${metrics.balance.toLocaleString('en-IN')}) cannot cover ₹${obligationsTotal.toLocaleString('en-IN')} in pending mandatory obligations. Action required to avoid default.`
              : isDepleting
              ? `Current burn rate causes complete capital depletion on Day ${metrics.runwayDepletionDay}. Safe daily burn must be recalibrated immediately.`
              : `Safe daily allowance is critically squeezed to ₹${metrics.dailyAllowance}/day, beneath the living baseline.`}
          </p>
        </div>
      </div>

      <button
        onClick={onSolveInSimulator}
        id="btn-solve-deficit"
        className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-rose-500/20"
      >
        <span>Test Fix in Sandbox</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
