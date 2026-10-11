import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  TrendingDown, 
  Keyboard, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { playTick, playChime } from '../../services/audioService';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSandbox?: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onStartSandbox
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleNext = () => {
    playTick();
    if (step < 3) {
      setStep(step + 1);
    } else {
      playChime();
      onClose();
      onStartSandbox?.();
    }
  };

  const handleBack = () => {
    playTick();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    playTick();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Onboarding Guided Tour"
    >
      <div className="bg-[#090d16] border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative custom-scrollbar">
        
        {/* Dismiss Button */}
        <button
          onClick={handleSkip}
          id="btn-close-onboarding-tour"
          className="absolute top-5 right-5 w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          title="Dismiss Tour (Esc)"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-emerald-400'
                  : s < step
                  ? 'w-4 bg-emerald-500/40'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-slate-400 font-mono ml-2">
            Step {step} of 3
          </span>
        </div>

        {/* STEP 1: The ₹10,000 / 30-Day Budget Reality */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 aspect-square rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full aspect-square bg-[#07090e] rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
                  Welcome to Sanvektro
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ₹10k Cockpit
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Most budgeting tools act like rear-view mirrors: they tell you what you spent <em>yesterday</em> when the money is already gone. Sanvektro is a <strong>predictive flight simulator</strong>: every swipe is pre-simulated to guarantee you never crash before Day 30.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Pre-Loaded Authentic Gen Z Presets</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px] m-0">
                You can toggle between 3 realistic seed personas: <strong>College Hosteler</strong> (Day 11, rent split, mess dues), <strong>First-Month Intern</strong> (Day 8, metro pass, stipend inflow), and <strong>Freelance Creator</strong> (Day 14, client milestone, gear drop).
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: The 3 Capital Buckets */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 aspect-square rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
                  The 3 Critical Capital Buckets
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Ringfenced Defense
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                To prevent accidental end-of-month default, capital is dynamically partitioned into 3 isolated reservoirs:
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                <div className="w-7 h-7 aspect-square rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-white">Spent to Date</div>
                  <div className="text-slate-400 text-[11px]">
                    Realized UPI expenses, food, dining, and settled dues up to the current day.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                <div className="w-7 h-7 aspect-square rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 font-bold">
                  2
                </div>
                <div>
                  <div className="font-bold text-white">Ringfenced Obligations</div>
                  <div className="text-slate-400 text-[11px]">
                    Non-negotiable fixed commitments (rent share, Wi-Fi) and active subscriptions that cannot be spent on impulse purchases.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-emerald-500/30 flex items-start gap-3 bg-emerald-500/5">
                <div className="w-7 h-7 aspect-square rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 font-bold">
                  3
                </div>
                <div>
                  <div className="font-bold text-emerald-300">Safe Discretionary Allowance</div>
                  <div className="text-slate-300 text-[11px]">
                    True uncommitted liquidity divided by remaining days. Spend up to this amount daily and your budget is mathematically guaranteed to survive through Day 30.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interactive Decision Cockpit */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 aspect-square rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
                  Interactive Decision Sandbox
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Proactive Control
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Powerful real-time levers built for hands-off rapid experimentation:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-7 h-7 aspect-square rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">3-Way Decision Matrix ✦ Press <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono text-[10px]">S</kbd></div>
                  <div className="text-slate-400 text-[11px]">
                    Compare Scenario A (Buy Now) vs B (Delay 14d) vs C (Smart Alternative -55%) side by side.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-7 h-7 aspect-square rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Multi-Cone Trajectory ✦ Best/Expected/Worst</div>
                  <div className="text-slate-400 text-[11px]">
                    Inspect the 3-scenario fanning forecast cones on the SVG timeline chart.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-7 h-7 aspect-square rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Hands-Free Hotkeys ✦ Press <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono text-[10px]">?</kbd></div>
                  <div className="text-slate-400 text-[11px]">
                    <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> scrub timeline ✦ <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">1-3</kbd> switch personas ✦ <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">R</kbd> report card.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Navigation Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-6">
          {step > 1 ? (
            <button
              onClick={handleBack}
              id="btn-onboarding-back"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleSkip}
              id="btn-onboarding-skip"
              className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Skip Intro
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              id="btn-onboarding-next"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{step === 3 ? 'Launch Cockpit' : 'Next'}</span>
              {step === 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
