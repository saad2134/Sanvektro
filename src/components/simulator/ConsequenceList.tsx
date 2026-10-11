/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { SimulationResult, Subscription } from '../../types';
import { Target, Tv, Compass } from 'lucide-react';

interface ConsequenceListProps {
  simulationResult: SimulationResult;
  subscriptions: Subscription[];
  daysRemaining: number;
}

export const ConsequenceList: React.FC<ConsequenceListProps> = ({
  simulationResult,
  subscriptions,
  daysRemaining,
}) => {
  const impact = simulationResult.impact || {};

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-5">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Compass className="w-4 h-4 text-indigo-400" />
        <span>Contextual Decision Guidance</span>
      </h3>

      {impact.recommendation && (
        <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
          {impact.recommendation}
        </div>
      )}

      {impact.goalImpact && impact.goalImpact.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Savings Goals Ripple</span>
          </div>
          <div className="space-y-1.5">
            {impact.goalImpact.map((goal: any) => (
              <div
                key={goal.goalId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0C0E17] border border-[#1F243B] text-xs"
              >
                <span className="text-slate-300 font-medium">{goal.goalName}</span>
                <span className={goal.stillOnTrack ? 'text-emerald-400' : 'text-amber-400'}>
                  {goal.stillOnTrack ? 'On Track' : `Delayed by ~${goal.delayDays} days`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subscriptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upcoming Recurring Commitments ({daysRemaining}d left)</span>
          </div>
          <div className="space-y-1.5">
            {subscriptions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0C0E17] border border-[#1F243B] text-xs"
              >
                <span className="text-slate-300 font-medium">{sub.name}</span>
                <span className="text-slate-400 font-mono">₹{sub.amount}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
