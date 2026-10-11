import React from 'react';
import type { OptimizationTip } from '../types/finance';
import { Sparkles, TrendingUp, Scissors, ShieldAlert, Info } from 'lucide-react';

interface OptimizationInsightsProps {
  tips: OptimizationTip[];
}

export const OptimizationInsights: React.FC<OptimizationInsightsProps> = ({ tips }) => {
  if (tips.length === 0) return null;

  const tipIcons = {
    DISCRETIONARY: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    SUBSCRIPTION: <Scissors className="w-4 h-4 text-cyan-400" />,
    SAVINGS: <ShieldAlert className="w-4 h-4 text-amber-400" />
  };

  const tipBadgeStyles = {
    DISCRETIONARY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    SUBSCRIPTION: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    SAVINGS: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 aspect-square rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>Actionable Optimization Recommendations</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Insights
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Context-aware financial levers with empirical audit evidence
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tips.map(tip => (
          <div
            key={tip.id}
            className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 aspect-square rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  {tipIcons[tip.type]}
                </div>
                <span className="font-semibold text-slate-200">{tip.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${tipBadgeStyles[tip.type]}`}>
                  {tip.impact}
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  {tip.badge}
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] m-0 pl-8">
              {tip.actionableText}
            </p>
            {tip.evidence && (
              <div className="ml-8 mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono">
                <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300 font-sans">Evidence:</strong> {tip.evidence}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
