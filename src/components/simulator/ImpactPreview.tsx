import React, { useState } from 'react';
import { SimulationResult, RiskLevel } from '../../types';
import { ArrowRight, AlertTriangle, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImpactPreviewProps {
  currentBalance: number;
  currentDailyAllowance: number;
  currentHealthScore: number;
  currentRisk: RiskLevel;
  simulationResult: SimulationResult;
  onCommit: () => Promise<boolean>;
}

export const ImpactPreview: React.FC<ImpactPreviewProps> = ({
  currentBalance,
  currentDailyAllowance,
  currentHealthScore,
  currentRisk,
  simulationResult,
  onCommit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedSuccess, setCommittedSuccess] = useState(false);

  const { decision, impact, safeToCommit } = simulationResult;
  const newBalance = impact.newBalance;
  const newDailyAllowance = impact.newDailyAllowance;
  const newHealthScore = impact.newHealthScore;
  const newRisk = impact.riskDelta;

  const handleCommit = async () => {
    if (isSubmitting || !safeToCommit) return;
    setIsSubmitting(true);
    try {
      const ok = await onCommit();
      if (ok) {
        setCommittedSuccess(true);
        setTimeout(() => setCommittedSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'safe':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'caution':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'danger':
        return 'text-red-500 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 md:p-6 space-y-6">
      {/* Live announcement for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="sim-result">
        {`If you spend ₹${decision?.amount ?? 0}, your balance drops to ₹${newBalance}, daily allowance becomes ₹${newDailyAllowance}, health score ${
          impact.healthScoreDelta >= 0 ? 'improves' : 'drops'
        } by ${Math.abs(impact.healthScoreDelta)} points. ${impact.warnings.join('. ')}`}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Ripple Effect Preview</span>
          {safeToCommit ? (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Affordable
            </span>
          ) : (
            <span className="text-xs font-medium text-red-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Over-budget
            </span>
          )}
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          -₹{(decision?.amount ?? 0).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Warnings / Alerts */}
      {impact.warnings.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300 space-y-1"
        >
          <div className="flex items-center gap-2 font-semibold text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Financial Ripple Warnings</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
            {impact.warnings.map((warn: string, idx: number) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Before / After Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Available Balance Card */}
        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Available Balance</div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-sm font-mono text-slate-400 line-through">
              ₹{currentBalance.toLocaleString('en-IN')}
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div
              data-testid="impact-balance"
              className={`text-lg font-mono font-bold tabular-nums ${
                newBalance >= 2000 ? 'text-white' : newBalance > 0 ? 'text-amber-400' : 'text-red-500'
              }`}
            >
              ₹{newBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 text-right">
            {impact.balanceDelta <= 0 ? '' : '+'}
            ₹{impact.balanceDelta.toLocaleString('en-IN')} delta
          </div>
        </div>

        {/* Daily Allowance Card */}
        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Daily Allowance</div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-sm font-mono text-slate-400 line-through">
              ₹{currentDailyAllowance.toLocaleString('en-IN')}/d
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div
              className={`text-lg font-mono font-bold tabular-nums ${
                newDailyAllowance >= 200
                  ? 'text-emerald-400'
                  : newDailyAllowance >= 100
                  ? 'text-amber-400'
                  : 'text-red-500'
              }`}
            >
              ₹{newDailyAllowance.toLocaleString('en-IN')}/d
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 text-right">
            {impact.dailyAllowanceDelta >= 0 ? '+' : ''}
            ₹{impact.dailyAllowanceDelta.toLocaleString('en-IN')}/day delta
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Health Score</div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-sm font-mono text-slate-400 line-through">
              {currentHealthScore}/100
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div
              className={`text-lg font-mono font-bold tabular-nums ${
                newHealthScore >= 75
                  ? 'text-emerald-400'
                  : newHealthScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {newHealthScore}/100
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 text-right">
            {impact.healthScoreDelta >= 0 ? '+' : ''}
            {impact.healthScoreDelta} pts
          </div>
        </div>

        {/* Risk Level Card */}
        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Risk Assessment</div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400">
              {currentRisk}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getRiskColor(
                newRisk
              )}`}
            >
              {newRisk}
            </span>
          </div>
        </div>
      </div>

      {/* AI Context Recommendation */}
      <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>FlowFi Smart Recommendation</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {impact.recommendation}
        </p>
      </div>

      {/* Confirmation & Commit Action */}
      <div className="pt-2">
        <Button
          onClick={handleCommit}
          disabled={!safeToCommit || (decision?.amount ?? 0) <= 0 || isSubmitting}
          isLoading={isSubmitting}
          className="w-full text-sm font-semibold h-11"
          variant={safeToCommit ? 'primary' : 'secondary'}
        >
          {committedSuccess
            ? '✓ Expense Logged to Ledger!'
            : safeToCommit
            ? `Confirm & Deduct ₹${(decision?.amount ?? 0).toLocaleString('en-IN')}`
            : 'Insufficient Funds ✦ Cannot Confirm'}
        </Button>
        <p className="text-[11px] text-slate-500 text-center mt-2">
          Clicking confirm deducts this amount from your live ₹10,000 monthly cycle.
        </p>
      </div>
    </div>
  );
};
