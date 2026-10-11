import React from 'react';
import { PERSONA_PRESETS } from '../data/presets';
import { Sparkles, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  currentDay: number;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onResetToBaseline: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  selectedPresetId,
  onSelectPreset,
  onResetToBaseline,
  onOpenHowItWorks
}) => {
  const monthProgress = Math.round((currentDay / 30) * 100);

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 aspect-square rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full aspect-square bg-[#07090e] rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] m-0">
                  Sanvektro
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  30-Day Decision Cockpit
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Guide your 30-day cash vector ✦ Gen Z ₹10,000 Budget Simulation Engine
              </p>
            </div>
          </div>

          {/* Center / Right: Persona Presets & Evaluation Helpers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-medium flex items-center gap-1.5 hidden sm:inline-flex">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
              </span>
              {PERSONA_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    selectedPresetId === preset.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={preset.description}
                >
                  <span>{preset.avatar}</span>
                  <span className="hidden md:inline">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Timeline Progress Pill */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Day:</span>
              <span className="text-emerald-400 font-bold">{currentDay}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">30</span>
              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block ml-1">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetToBaseline}
              id="btn-reset-state"
              className="w-9 h-9 aspect-square rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center justify-center shrink-0"
              title="Reset current persona state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Guide Button */}
            <button
              onClick={onOpenHowItWorks}
              id="btn-how-it-works"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>System Architecture</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
