import React from 'react';
import { X, ShieldCheck, CheckCircle2, Award, Zap, Code, ExternalLink } from 'lucide-react';

interface HowItEvaluatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItEvaluatesModal: React.FC<HowItEvaluatesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="System Architecture Guide"
    >
      <div className="bg-[#0d121e] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          id="btn-close-modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
              Sanvektro Architecture ✦ Decision & Trajectory Engine
            </h2>
            <p className="text-xs text-slate-400">
              How Sanvektro models and connects all 9 personal finance dimensions in real time
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Interconnected State Engine (9 Dimensions)
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Every variable (Income, Liquid Balance, Daily Safe Burn, Commitments, Subscriptions, Savings Goals, Shocks, Risk, Health Score) is mathematically linked through a unified reactive model. Staging an expense dynamically recalibrates daily allowance and goal pacing across the remaining 30-day timeline.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5" /> 2. Pre-Spend Decision Simulation Sandbox
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Users simulate transactions before committing. The system displays an instantaneous side-by-side diff: balance delta, daily allowance burn reduction, financial health score shift, and a Gen Z trade-off reality check.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 3. 30-Day Calendar & Scrubber
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Move between Day 1 and Day 30 to observe actual vs projected burn corridors, scheduled subscription billings, and commitment settlements in real time.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Code className="w-3.5 h-3.5" /> 4. Author & Engineering Attribution
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Engineered and architected by <strong className="text-slate-200">Saaduddin Mohammed</strong> (<a href="https://github.com/saad2134" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5">github.com/saad2134 <ExternalLink className="w-3 h-3" /></a>) ✦ Built with React 19, TypeScript, and Tailwind CSS.
            </p>
          </div>

        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
