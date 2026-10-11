import React from 'react';
import { SimulationResult, Subscription } from '../../types';
import { Target, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';

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
  const { impact } = simulationResult;
  const activeSubs = subscriptions.filter((s) => s.isActive);
  const totalUpcomingSubs = activeSubs.reduce((sum, s) => sum + s.amount, 0);
  const remainingAfterSubs = impact.newBalance - totalUpcomingSubs;

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-4">
      <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
        <span>Detailed Ripple Chains</span>
        <span className="text-xs text-slate-400 font-normal">Multi-system effects</span>
      </h3>

      <div className="space-y-3">
        {/* Goal Ripple */}
        <div className="p-3.5 rounded-lg bg-[#0C0E17] border border-[#1C2036] text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Savings Goals Ripple</span>
          </div>
          {impact.goalImpact.length === 0 ? (
            <p className="text-slate-400">No active savings goals affected.</p>
          ) : (
            <div className="space-y-1">
              {impact.goalImpact.map((g: any) => (
                <div key={g.goalId} className="flex items-center justify-between text-slate-300">
                  <span>{g.goalName}</span>
                  <span
                    className={`font-mono ${
                      g.stillOnTrack ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {g.stillOnTrack
                      ? '✓ On Track'
                      : `Needs +₹${(g.newDailyRequired - g.previousDailyRequired).toFixed(0)}/d`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Protection Ripple */}
        <div className="p-3.5 rounded-lg bg-[#0C0E17] border border-[#1C2036] text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Upcoming Recurring Bills Buffer</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Committed Recurring Total</span>
            <span className="font-mono text-white">₹{totalUpcomingSubs.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Buffer After All Subscriptions</span>
            <span
              className={`font-mono font-bold ${
                remainingAfterSubs >= 0 ? 'text-emerald-400' : 'text-red-500'
              }`}
            >
              ₹{Math.max(0, remainingAfterSubs).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Daily Runway Chain */}
        <div className="p-3.5 rounded-lg bg-[#0C0E17] border border-[#1C2036] text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            {impact.newDailyAllowance >= 200 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>Remaining Runway Trajectory</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            With ₹{impact.newBalance.toLocaleString('en-IN')} left over {daysRemaining} days, you can
            spend up to <strong className="text-white font-mono">₹{impact.newDailyAllowance}</strong>{' '}
            every single day without incurring debt or overdraft.
          </p>
        </div>
      </div>
    </div>
  );
};
