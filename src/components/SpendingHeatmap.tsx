import React from 'react';
import type { DailyHeatmapPoint } from '../types/finance';
import { Calendar, Flame, Sparkles } from 'lucide-react';

interface SpendingHeatmapProps {
  points: DailyHeatmapPoint[];
  currentDay: number;
  onSelectDay: (day: number) => void;
}

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({
  points,
  currentDay,
  onSelectDay
}) => {
  const getCellClasses = (point: DailyHeatmapPoint) => {
    if (point.isToday) {
      return 'ring-2 ring-emerald-400 bg-emerald-500/25 border-emerald-400 text-white shadow-lg shadow-emerald-500/20';
    }
    if (point.isFuture) {
      return 'bg-slate-900/30 border-slate-800/40 text-slate-600 hover:border-slate-700/60 cursor-pointer';
    }
    if (point.amount === 0) {
      return 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:border-slate-700 cursor-pointer';
    }
    if (point.intensity === 'low') {
      return 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:border-emerald-600 cursor-pointer';
    }
    if (point.intensity === 'moderate') {
      return 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:border-amber-600 cursor-pointer';
    }
    return 'bg-rose-950/50 border-rose-800/60 text-rose-300 hover:border-rose-600 cursor-pointer';
  };

  const totalSpentInHeatmap = points
    .filter(p => !p.isFuture)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div 
      className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
      aria-label="30-Day Spending Intensity Matrix"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 aspect-square rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>30-Day Spending Intensity Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ₹{totalSpentInHeatmap.toLocaleString('en-IN')} Logged
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Daily burn density across the 30-day cycle ✦ Click any day to scrub timeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Day {currentDay} Active
          </span>
        </div>
      </div>

      {/* Grid of 30 days (10 cols on tablet/desktop, 6 on mobile) */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-2 mb-3.5">
        {points.map(point => {
          return (
            <button
              key={point.day}
              onClick={() => onSelectDay(point.day)}
              id={`heatmap-day-${point.day}`}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl text-xs border transition-all duration-200 select-none ${getCellClasses(
                point
              )}`}
              title={`Day ${point.day}: ${
                point.isFuture ? 'Future scheduled day' : `₹${point.amount.toLocaleString('en-IN')} (${point.transactionCount} tx)`
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">D{point.day}</span>
              <span className="font-mono font-bold text-[11px] mt-0.5 truncate w-full text-center">
                {point.isFuture ? '—' : point.amount > 0 ? `₹${point.amount}` : '₹0'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Burn Velocity Tiers</span>
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-slate-900/60 border border-slate-800" />
            <span>₹0 Zero</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-emerald-950/60 border border-emerald-800" />
            <span>&le;₹300 Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-amber-950/60 border border-amber-800" />
            <span>₹300-₹600 Mid</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-rose-950/60 border border-rose-800" />
            <span>&gt;₹600 Spike</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-emerald-500/40 ring-1 ring-emerald-400" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
