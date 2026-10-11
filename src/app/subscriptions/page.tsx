/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { SubscriptionsManager } from '../../components/SubscriptionsManager';
import { Tv, CheckCircle2, PauseCircle, ShieldAlert } from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const store = useBudgetStore();
  const {
    financialState,
    toggleSubscription
  } = store;

  const totalCommitted = financialState.subscriptions
    .filter((s) => s.isActive)
    .reduce((acc, s) => acc + s.amount, 0);

  const activeCount = financialState.subscriptions.filter((s) => s.isActive).length;
  const pausedCount = financialState.subscriptions.length - activeCount;

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" data-testid="subscriptions-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <Tv className="w-5 h-5 text-indigo-400" />
            <span>Recurring Subscriptions & Commitments Radar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Subscriptions automatically earmark portions of your 30-day runway. Toggle off unused
            services to instantly reclaim daily liquid cash flow.
          </p>
        </div>
      </div>

      {/* Hero Committed Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Committed Outflow This Cycle
          </span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
            ₹{totalCommitted.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400 font-sans"> / month</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{activeCount} Active</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">✦</span>
          <div className="flex items-center gap-1.5">
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>{pausedCount} Paused</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">✦</span>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Protected Auto-Debits</span>
          </div>
        </div>
      </div>

      <SubscriptionsManager
        subscriptions={financialState.subscriptions}
        onToggleSubscription={toggleSubscription}
        onAddSubscription={(newSub) => store.addSubscription(newSub as any)}
        currentDay={financialState.currentDay}
      />
    </div>
  );
};

export default SubscriptionsPage;
