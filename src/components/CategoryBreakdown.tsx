import React from 'react';
import type { CategoryOutflow } from '../types/finance';
import { Layers } from 'lucide-react';

interface CategoryBreakdownProps {
  outflows: CategoryOutflow[];
  totalSpent: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  outflows,
  totalSpent
}) => {
  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 aspect-square rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>Outflow by Category</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ₹{totalSpent.toLocaleString('en-IN')} Total
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Aggregated distribution across realized expenditure channels
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {outflows.length} active categories
        </span>
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

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {outflows.map((outflow, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 aspect-square rounded-[4px] shrink-0"
                    style={{ backgroundColor: outflow.color }}
                  />
                  <div className="truncate">
                    <span className="font-medium text-slate-200">{outflow.category}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                      ({outflow.transactionCount} {outflow.transactionCount === 1 ? 'tx' : 'txs'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 font-mono">
                  <span className="font-bold text-slate-100">
                    ₹{outflow.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 w-8 text-right font-medium">
                    {outflow.percentage}%
                  </span>
                </div>
              </div>
            ))}
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
