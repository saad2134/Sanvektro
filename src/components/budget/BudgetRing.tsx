import React from 'react';

interface BudgetRingProps {
  totalBudget: number;
  availableBalance: number;
  spent: number;
  committed: number;
  savedToGoals: number;
  size?: number;
}

export const BudgetRing: React.FC<BudgetRingProps> = ({
  totalBudget,
  availableBalance,
  spent,
  committed,
  savedToGoals,
  size = 200,
}) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = Math.max(1, totalBudget);
  const spentPct = Math.min(100, (spent / total) * 100);
  const committedPct = Math.min(100, (committed / total) * 100);
  const goalsPct = Math.min(100, (savedToGoals / total) * 100);
  const availablePct = Math.max(0, 100 - (spentPct + committedPct + goalsPct));

  const spentStroke = (spentPct / 100) * circumference;
  const committedStroke = (committedPct / 100) * circumference;
  const goalsStroke = (goalsPct / 100) * circumference;
  const availableStroke = (availablePct / 100) * circumference;

  let offset = 0;
  const availableOffset = offset;
  offset += availableStroke;
  const spentOffset = offset;
  offset += spentStroke;
  const committedOffset = offset;
  offset += committedStroke;
  const goalsOffset = offset;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          role="img"
          aria-label={`Budget allocation ring: ₹${availableBalance} available (${Math.round(availablePct)}%), ₹${spent} spent (${Math.round(spentPct)}%), ₹${committed} committed subscriptions (${Math.round(committedPct)}%), ₹${savedToGoals} in goals (${Math.round(goalsPct)}%)`}
        >
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#161928"
            strokeWidth={strokeWidth}
          />
          {/* Available Segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#6366F1"
            strokeWidth={strokeWidth}
            strokeDasharray={`${availableStroke} ${circumference}`}
            strokeDashoffset={-availableOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          {/* Spent Segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${spentStroke} ${circumference}`}
            strokeDashoffset={-spentOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          {/* Committed Segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#06B6D4"
            strokeWidth={strokeWidth}
            strokeDasharray={`${committedStroke} ${circumference}`}
            strokeDashoffset={-committedOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          {/* Goals Segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${goalsStroke} ${circumference}`}
            strokeDashoffset={-goalsOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            Available
          </span>
          <span className="text-xl md:text-2xl font-bold font-mono tabular-nums text-white">
            ₹{availableBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">
            {Math.round(availablePct)}% left
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />
          <span>Available: ₹{availableBalance.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" aria-hidden="true" />
          <span>Committed: ₹{committed.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
          <span>Goals: ₹{savedToGoals.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
