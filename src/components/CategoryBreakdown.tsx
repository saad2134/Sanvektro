import React, { useState } from 'react';
import type { CategoryOutflow } from '../types/finance';
import { Layers, AlertCircle, ShieldAlert } from 'lucide-react';

interface CategoryBreakdownProps {
  outflows: CategoryOutflow[];
  totalSpent: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  outflows,
  totalSpent
}) => {
  const [activeStrategy, setActiveStrategy] = useState<'balanced' | 'survival' | 'social'>('balanced');
  const totalBudgetCap = outflows.reduce((sum, o) => sum + o.budgetCap, 0);
  const totalPacingPct = totalBudgetCap > 0 ? Math.round((totalSpent / totalBudgetCap) * 100) : 0;

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 aspect-square rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>Category Budget Limits & Outflow</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ₹{totalSpent.toLocaleString('en-IN')} / ₹{totalBudgetCap.toLocaleString('en-IN')}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Pacing caps vs actual burn with 80% amber alerts and 100% cap breach warnings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            {totalPacingPct}% Total Utilization
          </span>
        </div>
      </div>

      {/* Budget Allocation Strategy Presets */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className="text-[10px] text-slate-500 font-mono uppercase">Strategy Preset:</span>
        <button
          onClick={() => setActiveStrategy('balanced')}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
            activeStrategy === 'balanced'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Balanced Pacing
        </button>
        <button
          onClick={() => setActiveStrategy('survival')}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
            activeStrategy === 'survival'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Strict Survival
        </button>
        <button
          onClick={() => setActiveStrategy('social')}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
            activeStrategy === 'social'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Campus Social
        </button>
      </div>

      {/* Strategy Guidance Line */}
      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[10px] text-slate-300 mb-3">
        <strong className="text-purple-300 font-semibold">{activeStrategy === 'balanced' ? 'Balanced Pacing' : activeStrategy === 'survival' ? 'Strict Survival' : 'Campus Social'} Strategy ✦ </strong>
        {activeStrategy === 'balanced' 
          ? 'Distributes ₹10,000 evenly across core living, food, and student reserves.' 
          : activeStrategy === 'survival'
          ? 'Prioritizes nutrition and bills, compressing discretionary entertainment and shopping.'
          : 'Optimizes for shared meals and transit while preserving emergency buffer.'}
      </div>

      {/* Multi-color category distribution strip */}
      {outflows.length > 0 ? (
        <>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800/80 mb-3.5 shadow-inner">
            {outflows.map((outflow, idx) => (
              <div
                key={idx}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                style={{
                  width: `${Math.max(2, outflow.percentage)}%`,
                  backgroundColor: outflow.color
                }}
                title={`${outflow.category}: ₹${outflow.amount.toLocaleString('en-IN')} (${outflow.percentage}%)`}
              />
            ))}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {outflows.map((outflow, idx) => {
              const capRatio = Math.min(100, outflow.utilizationPct);
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    outflow.isOverBudget
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : outflow.isNearBudget
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 aspect-square rounded-[4px] shrink-0"
                        style={{ backgroundColor: outflow.color }}
                      />
                      <div className="truncate flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{outflow.category}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({outflow.transactionCount} {outflow.transactionCount === 1 ? 'tx' : 'txs'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-bold text-slate-100">
                        ₹{outflow.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        / ₹{outflow.budgetCap.toLocaleString('en-IN')}
                      </span>
                      {outflow.isOverBudget ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          <ShieldAlert className="w-3 h-3" />
                          +₹{(outflow.amount - outflow.budgetCap).toLocaleString('en-IN')}
                        </span>
                      ) : outflow.isNearBudget ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          {outflow.utilizationPct}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {outflow.utilizationPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro progress bar towards category budget cap */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        outflow.isOverBudget
                          ? 'bg-rose-500'
                          : outflow.isNearBudget
                          ? 'bg-amber-400'
                          : 'bg-emerald-500/80'
                      }`}
                      style={{ width: `${capRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/40">
          Zero realized expenses in current period.
        </div>
      )}
    </div>
  );
};

