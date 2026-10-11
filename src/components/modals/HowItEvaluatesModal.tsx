import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Award, Zap, Code, ExternalLink, BookOpen, Layers, TrendingUp, Scissors, HeartHandshake } from 'lucide-react';

interface HowItEvaluatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItEvaluatesModal: React.FC<HowItEvaluatesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'lessons'>('architecture');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="System Architecture & Financial Literacy Guide"
    >
      <div className="bg-[#0d121e] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          id="btn-close-modal"
          className="absolute top-4 right-4 w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 aspect-square rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
              Sanvektro Architecture & Financial Literacy Guide
            </h2>
            <p className="text-xs text-slate-400">
              How Sanvektro models 9 dimensions and empowers Gen Z financial decision-making
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Engine Architecture (9 Dimensions)
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Gen Z Financial Micro-Lessons
          </button>
        </div>

        {activeTab === 'architecture' ? (
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
        ) : (
          <div className="space-y-4 text-xs text-slate-300">

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> 1. Safe Daily Burn Math vs Naive Division
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Dividing a ₹7,000 bank balance on Day 10 by the remaining 20 days gives a deceptive ₹350/day. But if ₹3,000 is owed for upcoming rent/bills and ₹1,000 is reserved in savings, your uncommitted buffer is only ₹3,000. Your true Safe Daily Burn is ₹150/day. Sanvektro prevents you from spending money that is secretly spoken for.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
                <Scissors className="w-3.5 h-3.5" /> 2. Stealth Subscription Drain & Annual Run-Rate
              </h3>
              <p className="text-slate-400 leading-relaxed">
                A one-time ₹149 coffee only impacts today. An active ₹149 monthly subscription commits ₹1,788 every year. In a ₹10,000 monthly budget, carrying 4 active subscriptions totaling ₹600 locks 6% of your monthly funds before buying food. Pausing optional subscriptions instantly recovers daily runway.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                <HeartHandshake className="w-3.5 h-3.5" /> 3. The ₹2,000 Emergency Buffer Rule
              </h3>
              <p className="text-slate-400 leading-relaxed">
                For college students and young professionals in India, urgent clinic fees, phone screen cracks, or last-minute train tickets typically cost between ₹1,000 and ₹2,000. Maintaining a dedicated ₹2,000 emergency vault transforms sudden shocks into minor inconveniences instead of debt crises.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5" /> 4. Pre-Spend Simulation vs Rearview Tracking
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Traditional expense trackers show you where your money went yesterday. By the time you notice the shortfall, the cash is already gone. Sanvektro acts as your pre-flight simulator: test prospective purchases first, observe live runway and goal ripples, and commit only when confident.
              </p>
            </div>

          </div>
        )}

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
