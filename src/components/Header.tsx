import React, { useState, useRef, useEffect } from 'react';
import { PERSONA_PRESETS } from '../data/presets';
import { 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Printer,
  ChevronDown,
  Award,
  Compass,
  Search
} from 'lucide-react';

interface HeaderProps {
  currentDay: number;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onResetToBaseline: () => void;
  onOpenHowItWorks: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenShortcuts: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onPrintStatement: () => void;
  onOpenReportCard?: () => void;
  letterGrade?: string;
  onOpenTour?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  selectedPresetId,
  onSelectPreset,
  onResetToBaseline,
  onOpenHowItWorks,
  isMuted,
  onToggleMute,
  onOpenShortcuts,
  onExportCSV,
  onExportJSON,
  onPrintStatement,
  onOpenReportCard,
  letterGrade,
  onOpenTour,
  onOpenCommandPalette
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const monthProgress = Math.round((currentDay / 30) * 100);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
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

          {/* Center / Right: Presets & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Persona Presets */}
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

            {/* Audio Toggle Button */}
            <button
              onClick={onToggleMute}
              id="btn-toggle-audio"
              className={`w-9 h-9 aspect-square rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                isMuted
                  ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title={isMuted ? 'Unmute Audio Haptics (M)' : 'Mute Audio Haptics (M)'}
              aria-label="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={onOpenShortcuts}
              id="btn-shortcuts"
              className="w-9 h-9 aspect-square rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center justify-center shrink-0"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Export Menu Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                id="btn-export-dropdown"
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
                title="Export Ledger or Budget Statement"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1422] border border-slate-700/80 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      onExportCSV();
                      setIsExportOpen(false);
                    }}
                    id="btn-export-csv"
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export Ledger (CSV)</div>
                      <div className="text-[10px] text-slate-400">All 30-day transactions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportJSON();
                      setIsExportOpen(false);
                    }}
                    id="btn-export-json"
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center gap-2.5 transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export State (JSON)</div>
                      <div className="text-[10px] text-slate-400">Full audit log & metrics</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      onPrintStatement();
                      setIsExportOpen(false);
                    }}
                    id="btn-print-statement"
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-purple-500/10 hover:text-purple-300 flex items-center gap-2.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Print Statement</div>
                      <div className="text-[10px] text-slate-400">Clean physical copy</div>
                    </div>
                  </button>
                </div>
              )}
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

            {/* Month-End Report Card Button */}
            {onOpenReportCard && (
              <button
                onClick={onOpenReportCard}
                id="btn-open-report-card"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-emerald-500/15 hover:from-amber-500/25 hover:to-emerald-500/25 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="View 30-Day Executive Month-End Report Card (R)"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Report Card</span>
                {letterGrade && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-200 font-mono font-bold text-[10px] border border-amber-500/30">
                    {letterGrade}
                  </span>
                )}
              </button>
            )}

            {/* Guided Tour Button */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                id="btn-open-tour"
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Guided Onboarding Tour (T)"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Tour</span>
              </button>
            )}

            {/* Command Palette Button */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                id="btn-open-command-palette"
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Command Palette & Quick Actions (Ctrl+K or K)"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* System Architecture Guide Button */}
            <button
              onClick={onOpenHowItWorks}
              id="btn-how-it-works"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Architecture</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

