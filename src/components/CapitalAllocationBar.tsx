import React from 'react';
import type { CapitalAllocation } from '../types/finance';
import { PieChart, Info } from 'lucide-react';

interface CapitalAllocationBarProps {
  allocation: CapitalAllocation;
}

export const CapitalAllocationBar: React.FC<CapitalAllocationBarProps> = ({ allocation }) => {
  const {
    totalCapital,
    spentToDate,
    lockedInGoals,
    reservedObligations,
    freeDiscretionary,
    spentPct,
    lockedPct,
    reservedPct,
    freePct
  } = allocation;

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 aspect-square rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>30-Day Capital Allocation Corridor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ₹{totalCapital.toLocaleString('en-IN')} Total Pool
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Macro distribution of monthly capital across realization, goals, and obligations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono hidden md:flex">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Updates dynamically as you step the 30-day timeline</span>
        </div>
      </div>

      {/* The Multi-Segment Stacked Progress Bar */}
      <div className="w-full h-3 sm:h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800/80 shadow-inner">
        {spentPct > 0 && (
          <div
            className="h-full bg-rose-500 rounded-l-full transition-all duration-500"
            style={{ width: `${spentPct}%` }}
            title={`Spent to Date: ₹${spentToDate.toLocaleString('en-IN')} (${spentPct}%)`}
          />
        )}
        {lockedPct > 0 && (
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${lockedPct}%` }}
            title={`Locked in Goals: ₹${lockedInGoals.toLocaleString('en-IN')} (${lockedPct}%)`}
          />
        )}
        {reservedPct > 0 && (
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${reservedPct}%` }}
            title={`Reserved for Obligations: ₹${reservedObligations.toLocaleString('en-IN')} (${reservedPct}%)`}
          />
        )}
        {freePct > 0 && (
          <div
            className="h-full bg-emerald-400 rounded-r-full transition-all duration-500"
            style={{ width: `${freePct}%` }}
            title={`Free Discretionary Cushion: ₹${freeDiscretionary.toLocaleString('en-IN')} (${freePct}%)`}
          />
        )}
      </div>

      {/* Segment Legend Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-slate-800/60 text-xs">
        {/* Spent to date */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
          <div className="w-2.5 h-2.5 aspect-square rounded-[4px] bg-rose-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Spent to Date</div>
            <div className="font-mono font-bold text-slate-200">
              ₹{spentToDate.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-rose-400 font-normal">({spentPct}%)</span>
            </div>
          </div>
        </div>

        {/* Locked in goals */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
          <div className="w-2.5 h-2.5 aspect-square rounded-[4px] bg-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Locked in Goals</div>
            <div className="font-mono font-bold text-slate-200">
              ₹{lockedInGoals.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-amber-400 font-normal">({lockedPct}%)</span>
            </div>
          </div>
        </div>

        {/* Reserved obligations */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
          <div className="w-2.5 h-2.5 aspect-square rounded-[4px] bg-purple-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Reserved for Bills</div>
            <div className="font-mono font-bold text-slate-200">
              ₹{reservedObligations.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-purple-400 font-normal">({reservedPct}%)</span>
            </div>
          </div>
        </div>

        {/* Free Discretionary */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
          <div className="w-2.5 h-2.5 aspect-square rounded-[4px] bg-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Safe Discretionary</div>
            <div className="font-mono font-bold text-slate-200">
              ₹{freeDiscretionary.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-emerald-400 font-normal">({freePct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
