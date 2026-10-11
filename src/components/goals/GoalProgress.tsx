import React from 'react';
import { SavingsGoal } from '../../types';
import { PiggyBank } from 'lucide-react';

interface GoalProgressProps {
  goals: SavingsGoal[];
  totalSaved: number;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals, totalSaved }) => {
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercentage =
    totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Overall Savings Lockbox
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">
          ₹{totalSaved.toLocaleString('en-IN')} / ₹{totalTarget.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="w-full bg-[#1A1E30] h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${overallPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{goals.length} Active Targets</span>
        <span>{overallPercentage}% of total savings funded</span>
      </div>
    </div>
  );
};
