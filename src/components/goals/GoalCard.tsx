import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { Target, Clock, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface GoalCardProps {
  goal: SavingsGoal;
  availableBalance: number;
  onContribute: (goalId: string, amount: number) => boolean;
  onDelete: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  availableBalance,
  onContribute,
  onDelete,
}) => {
  const [fundAmount, setFundAmount] = useState<number>(200);
  const [showFundInput, setShowFundInput] = useState(false);

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isCompleted = remaining === 0;

  const handleFund = () => {
    if (fundAmount > 0 && fundAmount <= availableBalance) {
      onContribute(goal.id, fundAmount);
      setShowFundInput(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-4 sm:p-5 space-y-4 hover:border-[#272D4A] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{goal.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
            <span aria-hidden="true">·</span>
            <span className={goal.onTrack ? 'text-emerald-400' : 'text-amber-400'}>
              {goal.onTrack ? 'On Track' : 'Needs Pacing'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(goal.id)}
          aria-label={`Delete goal ${goal.name}`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-rose-400 p-2.5 rounded-lg hover:bg-[#1B2036] transition-colors -mr-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Amounts */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold text-sm">
            ₹{goal.savedAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-400">
            of ₹{goal.targetAmount.toLocaleString('en-IN')} ({goal.percentComplete}%)
          </span>
        </div>
        <div className="w-full bg-[#1A1E30] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${goal.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-[#1C2036]">
        <div>
          <span className="text-xs text-slate-400 block">Required Daily Save</span>
          <span className="font-mono font-semibold text-slate-200 text-sm">
            ₹{goal.dailyRequired}/day
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Remaining to Target</span>
          <span className="font-mono font-semibold text-slate-200 text-sm">
            ₹{remaining.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Quick Fund Action */}
      {!isCompleted && (
        <div>
          {showFundInput ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max={Math.min(availableBalance, remaining)}
                  step="50"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] pl-7 pr-3 py-2 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleFund}
                  disabled={fundAmount <= 0 || fundAmount > availableBalance}
                  className="flex-1 sm:flex-initial"
                >
                  Deposit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFundInput(false)}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-sm font-semibold"
              onClick={() => setShowFundInput(true)}
              disabled={availableBalance < 50}
            >
              <Plus className="w-4 h-4 text-indigo-400 mr-1" />
              Lock ₹ from Available Balance
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
