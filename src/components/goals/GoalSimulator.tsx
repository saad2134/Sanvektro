import React, { useState } from 'react';
import { Slider } from '../ui/Slider';
import { Sparkles } from 'lucide-react';

interface GoalSimulatorProps {
  availableBalance: number;
  daysRemaining: number;
  dailyAllowance: number;
}

export const GoalSimulator: React.FC<GoalSimulatorProps> = ({
  availableBalance,
  daysRemaining,
  dailyAllowance,
}) => {
  const [simulatedGoalLock, setSimulatedGoalLock] = useState<number>(500);

  const newBalance = Math.max(0, availableBalance - simulatedGoalLock);
  const newDaily = Math.round((newBalance / Math.max(daysRemaining, 1)) * 100) / 100;
  const delta = Math.round((newDaily - dailyAllowance) * 100) / 100;

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Savings Lock Ripple Simulator
        </h3>
      </div>
      <p className="text-xs text-slate-400">
        See how locking emergency savings or trip funds affects your daily runway.
      </p>

      <Slider
        min={0}
        max={Math.min(4000, availableBalance)}
        step={100}
        value={simulatedGoalLock}
        onChange={setSimulatedGoalLock}
        label="Amount to lock into savings"
      />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#0C0E17] border border-[#1C2036]">
          <span className="text-[11px] text-slate-400 block">Current Daily</span>
          <span className="text-sm font-mono font-bold text-slate-300">
            ₹{dailyAllowance}/day
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[#0C0E17] border border-[#1C2036]">
          <span className="text-[11px] text-slate-400 block">Simulated Daily</span>
          <span
            className={`text-sm font-mono font-bold ${
              newDaily >= 200 ? 'text-emerald-400' : newDaily >= 100 ? 'text-amber-400' : 'text-red-500'
            }`}
          >
            ₹{newDaily}/day
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">
            {delta}/day
          </span>
        </div>
      </div>
    </div>
  );
};
