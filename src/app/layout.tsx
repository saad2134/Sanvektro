import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Tv,
  TrendingUp,
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
  Search,
  Bot
} from 'lucide-react';
import { PERSONA_PRESETS } from '../data/presets';
import type { AppTab } from '../store/budgetStore';

interface LayoutProps {
  currentTab: AppTab;
  onNavigate: (tab: AppTab) => void;
  currentDay: number;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
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
  onOpenCoach?: () => void;
  onOpenHowItWorks?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onNavigate,
  currentDay,
  selectedPresetId,
  onSelectPreset,
  isMuted,
  onToggleMute,
  onOpenShortcuts,
  onExportCSV,
  onExportJSON,
  onPrintStatement,
  onOpenReportCard,
  letterGrade = 'B',
  onOpenTour,
  onOpenCommandPalette,
  onOpenCoach,
  onOpenHowItWorks,
  children
}) => {
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const exportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'simulate', label: 'Simulator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subs', icon: <Tv className="w-4 h-4" /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const monthProgress = Math.min(100, Math.round((currentDay / 30) * 100));

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 1. Skip Navigation for Screen Readers & Keyboard Users (WCAG AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-500 focus:text-slate-950 focus:rounded-xl focus:outline-none shadow-xl font-bold text-sm min-h-[44px] flex items-center"
      >
        Skip to main content
      </a>

      {/* 2. Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Zone 1: Brand & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                aria-label="Sanvektro Home"
                className="w-10 h-10 aspect-square rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0 hover:scale-105 transition-transform"
              >
                <div className="w-full h-full aspect-square bg-[#07090e] rounded-[14px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                </div>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] m-0">
                    Sanvektro
                  </h1>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    30-Day Decision Cockpit
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Simulate before you swipe ✦ Dynamic daily burn & forward trajectory
                </p>
              </div>
            </div>

            {/* Zone 2: Action Controls & Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Presets Selector */}
              <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                {PERSONA_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    id={`preset-btn-${preset.id}`}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`px-2 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      selectedPresetId === preset.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={preset.description}
                  >
                    <span>{preset.avatar}</span>
                    <span className="hidden md:inline">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Day Badge */}
              <div
                className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono"
                title={`Day ${currentDay} of 30 ✦ ${monthProgress}% of monthly cycle`}
              >
                <span className="text-slate-400">Day:</span>
                <span className="text-emerald-400 font-bold">{currentDay}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">30</span>
              </div>

              {/* Command Palette */}
              {onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  title="Global Command Palette (K)"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <kbd className="hidden lg:inline text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+K</kbd>
                </button>
              )}

              {/* Decision Coach */}
              {onOpenCoach && (
                <button
                  onClick={onOpenCoach}
                  className="p-2 aspect-square rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                  title="Decision Coach (C)"
                  aria-label="Open Decision Coach"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* Report Card */}
              {onOpenReportCard && (
                <button
                  onClick={onOpenReportCard}
                  className="px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                  title="Month-End Solvency Report Card (R)"
                  aria-label="Open Month-End Report Card"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-400 font-mono hidden sm:inline">{letterGrade}</span>
                </button>
              )}

              {/* Audio Toggle */}
              <button
                onClick={onToggleMute}
                className="p-2 aspect-square rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
                aria-label={isMuted ? 'Unmute Web Audio' : 'Mute Web Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Export Menu */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                  aria-label="Export Financial Data"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#090d16] border border-slate-800 shadow-2xl p-1 z-50 animate-fadeIn">
                    <button
                      onClick={() => { onExportCSV(); setIsExportOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tabular CSV (.csv)</span>
                    </button>
                    <button
                      onClick={() => { onExportJSON(); setIsExportOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>JSON State Archive</span>
                    </button>
                    <button
                      onClick={() => { onPrintStatement(); setIsExportOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Print Statement (PDF)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone 3: Navigation Tabs (Dashboard, Simulator, Goals, Subs, Forecast) */}
          <nav
            role="tablist"
            aria-label="Application Sections"
            className="flex items-center gap-1 overflow-x-auto pb-1 border-t border-slate-800/60 pt-2"
          >
            {navItems.map(item => (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={currentTab === item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === item.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              {onOpenTour && (
                <button
                  onClick={onOpenTour}
                  className="hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
                  title="Tour (T)"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Tour</span>
                </button>
              )}
              {onOpenHowItWorks && (
                <button
                  onClick={onOpenHowItWorks}
                  className="hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
                  title="How It Evaluates (H)"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Guide</span>
                </button>
              )}
              {onOpenShortcuts && (
                <button
                  onClick={onOpenShortcuts}
                  className="hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
                  title="Keyboard Shortcuts (?)"
                >
                  <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Hotkeys</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* 3. Main Content View Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 bg-[#07090e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Sanvektro ✦ Developed by Saaduddin Mohammed (@saad2134)</p>
          <p className="font-mono text-[11px] text-slate-500">100% Client-Side Private ✦ Zero External APIs ✦ WCAG AA</p>
        </div>
      </footer>
    </div>
  );
};
