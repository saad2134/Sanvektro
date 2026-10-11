import React from 'react';
import { Expense } from '../../types';
import { Calendar } from 'lucide-react';

interface SpendingHeatmapProps {
  expenses: Expense[];
  daysPassed: number;
  totalDays?: number;
}

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({
  expenses,
  daysPassed,
  totalDays = 30,
}) => {
  // Map expenses to days (1-30)
  const daySpendMap = new Map<number, number>();
  for (const exp of expenses) {
    const day = (Math.abs(exp.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10) + 1;
    daySpendMap.set(day, (daySpendMap.get(day) || 0) + exp.amount);
  }

  // Pre-fill realistic historical distributed values for demo days 1 to daysPassed
  const getDayAmount = (d: number) => {
    if (d > daysPassed) return 0;
    if (d === 3) return 450;
    if (d === 5) return 280;
    if (d === 7) return 620;
    if (d === 8) return 350;
    if (d === 9) return 300;
    return daySpendMap.get(d) || (d <= daysPassed ? 0 : 0);
  };

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getIntensityClass = (amount: number, isFuture: boolean, isToday: boolean) => {
    if (isToday) return 'border-2 border-indigo-400 bg-indigo-500/30 text-white';
    if (isFuture) return 'bg-[#121524]/60 border border-[#1A1E30] text-slate-600';
    if (amount === 0) return 'bg-[#15192B] border border-[#1E233B] text-slate-400';
    if (amount < 300) return 'bg-indigo-950/60 border border-indigo-900/60 text-indigo-300';
    if (amount < 600) return 'bg-indigo-700/60 border border-indigo-500/60 text-white';
    return 'bg-amber-600/70 border border-amber-400/70 text-white';
  };

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-4 sm:p-5 space-y-4 w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            30-Day Spending Matrix
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Day {daysPassed} Active
        </span>
      </div>

      {/* Grid of 30 days: responsive across 375px (6 cols) and desktop (10 cols) */}
      <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-10 gap-1.5 sm:gap-2 w-full">
        {daysArray.map((day) => {
          const isToday = day === daysPassed;
          const isFuture = day > daysPassed;
          const amount = getDayAmount(day);

          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg text-xs transition-transform hover:scale-105 select-none min-h-[44px] ${getIntensityClass(
                amount,
                isFuture,
                isToday
              )}`}
              title={`Day ${day}: ${isFuture ? 'Future' : `₹${amount.toLocaleString('en-IN')}`}`}
            >
              <span className="font-mono text-[10px] opacity-75">D{day}</span>
              <span className="font-mono font-bold text-[11px] sm:text-xs mt-0.5">
                {isFuture ? '-' : amount > 0 ? `₹${amount}` : '₹0'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-[#1C2036]">
        <span>Darker = higher daily spend</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-[#15192B] border border-[#1E233B]" title="₹0" />
          <span>₹0</span>
          <span className="w-2.5 h-2.5 rounded bg-indigo-950/60 border border-indigo-900/60" title="<₹300" />
          <span>&lt;300</span>
          <span className="w-2.5 h-2.5 rounded bg-indigo-700/60" title="₹300-₹600" />
          <span>300-600</span>
          <span className="w-2.5 h-2.5 rounded bg-amber-600/70" title=">₹600" />
          <span>&gt;600</span>
        </div>
      </div>
    </div>
  );
};
