/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { SavingsGoals } from '../../components';
import { Target, ShieldCheck, PiggyBank } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const store = useBudgetStore();
  const {
    financialState,
    baselineMetrics,
    contributeToGoal,
    withdrawFromGoal
  } = store;

  const totalVaultedRupees = financialState.savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetRupees = financialState.savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercent = totalTargetRupees > 0 ? Math.round((totalVaultedRupees / totalTargetRupees) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" data-testid="goals-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Savings Goals & Tactile Capital Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Committed capital is protected in shielded lockboxes. Depositing into a goal immediately
            updates your liquid daily burn allowance.
          </p>
        </div>
      </div>

      {/* Aggregate Vault Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <span>Total Vaulted Capital</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
            ₹{totalVaultedRupees.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">Shielded from impulsive swipes</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Combined Target</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">
            ₹{totalTargetRupees.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">{financialState.savingsGoals.length} Active milestone goals</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Milestone Progress</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2">
            {overallPercent}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
      </div>

      <SavingsGoals
        goals={financialState.savingsGoals}
        projectedSurplus={baselineMetrics.projectedDay30Balance}
        financialState={financialState}
        onContributeGoal={contributeToGoal}
        onWithdrawGoal={withdrawFromGoal}
      />
    </div>
  );
};

export default GoalsPage;
