/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { SimulationResult, RiskLevel } from '../../types';
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
  currentRisk: _currentRisk,
  simulationResult,
  onCommit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedSuccess, setCommittedSuccess] = useState(false);

  const decision = simulationResult.decision || { amount: 0, category: 'Food' as const, description: '' };
  const impact = simulationResult.impact || {};
  const safeToCommit = simulationResult.safeToCommit;

  const newBalance = impact.newBalance ?? simulationResult.newBalance ?? 0;
  const newDailyAllowance = impact.newDailyAllowance ?? simulationResult.newDailyAllowance ?? 0;
  const newHealthScore = impact.newHealthScore ?? simulationResult.newHealthScore ?? 0;
  const newRisk = impact.riskDelta ?? simulationResult.newRiskLevel ?? 'safe';
  const warnings: string[] = impact.warnings || (simulationResult.riskMessage ? [simulationResult.riskMessage] : []);

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
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="sim-result">
        {`If you spend ₹${decision.amount}, your balance drops to ₹${newBalance}, daily allowance becomes ₹${newDailyAllowance}, health score ${
          (impact.healthScoreDelta ?? 0) >= 0 ? 'improves' : 'drops'
        } by ${Math.abs(impact.healthScoreDelta ?? 0)} points. ${warnings.join('. ')}`}
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
          -₹{decision.amount.toLocaleString('en-IN')}
        </span>
      </div>

      {warnings.length > 0 && (
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
            {warnings.map((warn: string, idx: number) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            {(impact.balanceDelta ?? 0) <= 0 ? '' : '+'}
            ₹{(impact.balanceDelta ?? -decision.amount).toLocaleString('en-IN')} delta
          </div>
        </div>

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
            {(impact.dailyAllowanceDelta ?? 0) <= 0 ? '' : '+'}
            ₹{(impact.dailyAllowanceDelta ?? 0).toLocaleString('en-IN')}/d
          </div>
        </div>

        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Health Score</div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-sm font-mono text-slate-400 line-through">
              {currentHealthScore}/100
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {newHealthScore}/100
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 text-right">
            {(impact.healthScoreDelta ?? 0) >= 0 ? '+' : ''}
            {impact.healthScoreDelta ?? 0} pts
          </div>
        </div>

        <div className="bg-[#0C0E17] border border-[#1F243B] rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400">Simulated Velocity Risk</div>
          <div className="mt-2">
            <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getRiskColor(newRisk)}`}>
              {newRisk}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          onClick={handleCommit}
          disabled={!safeToCommit || isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{committedSuccess ? 'Decision Committed!' : 'Commit Simulated Expense'}</span>
        </Button>
      </div>
    </div>
  );
};
