import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  User, 
  FileText, 
  Download, 
  Printer, 
  HelpCircle, 
  Compass, 
  SlidersHorizontal, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  TrendingUp,
  Target,
  Scissors,
  Zap,
  Activity,
  Bot
} from 'lucide-react';
import type { SimulationDraft, ExpenseCategory } from '../../types/finance';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Personas' | 'Simulations' | 'Actions' | 'Navigation';
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
  onStageSimulation: (draft: SimulationDraft) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onPrint: () => void;
  onOpenReportCard: () => void;
  onOpenHealthAudit: () => void;
  onOpenOnboarding: () => void;
  onOpenShortcuts: () => void;
  onToggleLens: () => void;
  onToggleMute: () => void;
  onOpenCoach?: () => void;
  isMuted: boolean;
  isLensActive: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onStageSimulation,
  onExportCSV,
  onExportJSON,
  onPrint,
  onOpenReportCard,
  onOpenHealthAudit,
  onOpenOnboarding,
  onOpenShortcuts,
  onToggleLens,
  onToggleMute,
  onOpenCoach,
  isMuted,
  isLensActive
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const commands: CommandItem[] = [
    // Personas
    {
      id: 'persona-hostel',
      title: 'Persona ✦ College Hosteler',
      subtitle: '₹10,000 stipend baseline with tight discretionary margins',
      category: 'Personas',
      icon: User,
      keywords: ['hostel', 'college', 'student', 'persona', 'preset'],
      action: () => onSelectPreset('hostel-hustler')
    },
    {
      id: 'persona-intern',
      title: 'Persona ✦ First-Month Intern',
      subtitle: '₹15,000 corporate stipend with elevated fixed commitments',
      category: 'Personas',
      icon: User,
      keywords: ['intern', 'job', 'corporate', 'persona', 'preset'],
      action: () => onSelectPreset('first-month-intern')
    },
    {
      id: 'persona-creator',
      title: 'Persona ✦ Freelance Creator',
      subtitle: 'Variable freelance inflows and irregular project gigs',
      category: 'Personas',
      icon: User,
      keywords: ['creator', 'freelance', 'variable', 'persona', 'preset'],
      action: () => onSelectPreset('freelance-creator')
    },

    // Simulations
    {
      id: 'sim-swiggy',
      title: 'Simulate ✦ Swiggy Midnight Pizza (₹480)',
      subtitle: 'Preview daily safe burn reduction across remaining cycle',
      category: 'Simulations',
      icon: Sparkles,
      keywords: ['swiggy', 'pizza', 'food', 'simulate', 'impulse'],
      action: () => onStageSimulation({
        title: 'Swiggy Midnight Pizza Feast',
        amount: 480,
        category: 'Food & Dining' as ExpenseCategory,
        day: 10
      })
    },
    {
      id: 'sim-sneakers',
      title: 'Simulate ✦ Sneaker Drop Pre-order (₹2,200)',
      subtitle: 'Test heavy shopping impulse against 3-way strategic alternative',
      category: 'Simulations',
      icon: Sparkles,
      keywords: ['sneakers', 'shoes', 'shopping', 'simulate', 'drop'],
      action: () => onStageSimulation({
        title: 'Sneaker Drop Pre-order',
        amount: 2200,
        category: 'Shopping & Quick-Commerce' as ExpenseCategory,
        day: 10
      })
    },
    {
      id: 'sim-cafe',
      title: 'Simulate ✦ Weekend Rooftop Cafe (₹750)',
      subtitle: 'Evaluate social dining ripple on safe daily living cushion',
      category: 'Simulations',
      icon: Sparkles,
      keywords: ['cafe', 'coffee', 'dining', 'weekend', 'simulate'],
      action: () => onStageSimulation({
        title: 'Weekend Rooftop Cafe',
        amount: 750,
        category: 'Entertainment & Social' as ExpenseCategory,
        day: 10
      })
    },
    {
      id: 'sim-headphones',
      title: 'Simulate ✦ ANC Wireless Headphones (₹1,500)',
      subtitle: 'Model student tech investment impact on month-end surplus',
      category: 'Simulations',
      icon: Sparkles,
      keywords: ['tech', 'headphones', 'audio', 'simulate', 'academic'],
      action: () => onStageSimulation({
        title: 'ANC Wireless Headphones',
        amount: 1500,
        category: 'Academic & Tech' as ExpenseCategory,
        day: 10
      })
    },

    // Actions & Tools
    {
      id: 'action-coach',
      title: 'Decision Coach ✦ AI Dilemma Advisor (C)',
      subtitle: 'Ask natural purchase dilemmas against live ₹10k invariants',
      category: 'Actions',
      icon: Bot,
      keywords: ['coach', 'ai', 'dilemma', 'afford', 'advice', 'ask'],
      action: () => onOpenCoach?.()
    },
    {
      id: 'action-lens',
      title: `The Lens ✦ Formula Inspector (${isLensActive ? 'Active' : 'Off'})`,
      subtitle: 'Inspect exact mathematical invariants by hovering any card',
      category: 'Actions',
      icon: Search,
      keywords: ['lens', 'formula', 'inspect', 'math', 'invariant'],
      action: onToggleLens
    },
    {
      id: 'action-report-card',
      title: 'Executive Month-End Report Card',
      subtitle: 'Open formal solvency appraisal with academic letter grade',
      category: 'Actions',
      icon: FileText,
      keywords: ['report', 'card', 'grade', 'summary', 'solvency'],
      action: onOpenReportCard
    },
    {
      id: 'action-health-audit',
      title: 'Health Diagnostics & Radial Gauge',
      subtitle: 'Inspect transparent 4-pillar points score and audit evidence',
      category: 'Actions',
      icon: Activity,
      keywords: ['health', 'audit', 'score', 'radial', 'gauge', 'diagnostic'],
      action: onOpenHealthAudit
    },
    {
      id: 'action-tour',
      title: 'Guided Onboarding Tour',
      subtitle: '3-stage guided orientation introducing the ₹10k decision paradigm',
      category: 'Actions',
      icon: Compass,
      keywords: ['tour', 'guide', 'onboarding', 'tutorial', 'intro'],
      action: onOpenOnboarding
    },
    {
      id: 'action-export-csv',
      title: 'Export Tabular Ledger CSV',
      subtitle: 'Download complete 30-day transaction ledger in standard CSV',
      category: 'Actions',
      icon: Download,
      keywords: ['csv', 'export', 'download', 'table', 'spreadsheet'],
      action: onExportCSV
    },
    {
      id: 'action-export-json',
      title: 'Export Structured State JSON',
      subtitle: 'Save complete session state, KPI metrics, and audit log',
      category: 'Actions',
      icon: Download,
      keywords: ['json', 'export', 'backup', 'state', 'archive'],
      action: onExportJSON
    },
    {
      id: 'action-print',
      title: 'Print Monthly Budget Statement',
      subtitle: 'Generate clean physical statement formatted for print',
      category: 'Actions',
      icon: Printer,
      keywords: ['print', 'statement', 'pdf', 'paper'],
      action: onPrint
    },
    {
      id: 'action-mute',
      title: isMuted ? 'Unmute Acoustic Synthesizer' : 'Mute Acoustic Synthesizer',
      subtitle: 'Toggle tactile Web Audio feedback clicks and chimes',
      category: 'Actions',
      icon: isMuted ? VolumeX : Volume2,
      keywords: ['audio', 'sound', 'mute', 'synthesizer', 'chime'],
      action: onToggleMute
    },
    {
      id: 'action-shortcuts',
      title: 'Keyboard Shortcuts Guide',
      subtitle: 'View complete hands-free keyboard shortcuts map',
      category: 'Actions',
      icon: HelpCircle,
      keywords: ['hotkeys', 'shortcuts', 'keyboard', 'help'],
      action: onOpenShortcuts
    },

    // Navigation
    {
      id: 'nav-simulator',
      title: 'Jump to Decision Simulator',
      subtitle: 'Scroll to Pre-Spend Sandbox and impulse testing',
      category: 'Navigation',
      icon: SlidersHorizontal,
      keywords: ['simulator', 'what-if', 'sandbox', 'jump'],
      action: () => scrollToSection('decision-simulator-section')
    },
    {
      id: 'nav-trajectory',
      title: 'Jump to Trajectory Forecast',
      subtitle: 'Scroll to 30-day multi-cone forecast curves and safe corridor',
      category: 'Navigation',
      icon: TrendingUp,
      keywords: ['trajectory', 'chart', 'forecast', 'cones', 'jump'],
      action: () => scrollToSection('trajectory-chart-section')
    },
    {
      id: 'nav-goals',
      title: 'Jump to Savings Goals & Lockbox',
      subtitle: 'Scroll to goal feasibility horizons and lockbox ripple test',
      category: 'Navigation',
      icon: Target,
      keywords: ['goals', 'savings', 'lockbox', 'jump'],
      action: () => scrollToSection('savings-goals-section')
    },
    {
      id: 'nav-subs',
      title: 'Jump to Subscription Guillotine',
      subtitle: 'Scroll to recurring bill management and runway recovery',
      category: 'Navigation',
      icon: Scissors,
      keywords: ['subscriptions', 'guillotine', 'recurring', 'jump'],
      action: () => scrollToSection('subscriptions-section')
    },
    {
      id: 'nav-shock',
      title: 'Jump to Shock Roulette',
      subtitle: 'Scroll to emergency budget stress-testing',
      category: 'Navigation',
      icon: Zap,
      keywords: ['shock', 'roulette', 'stress', 'emergency', 'jump'],
      action: () => scrollToSection('shock-roulette-section')
    }
  ];

  const filteredCommands = commands.filter(cmd => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const subMatch = cmd.subtitle.toLowerCase().includes(q);
    const keyMatch = cmd.keywords.some(k => k.toLowerCase().includes(q));
    return titleMatch || subMatch || keyMatch;
  });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Sanvektro Command Palette"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#090d16] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-autocomplete="list"
            placeholder="Type a command, simulate expense, switch persona, or jump to section..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            aria-label="Close Command Palette"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-listbox"
          role="listbox"
          className="overflow-y-auto p-2 divide-y divide-slate-800/40"
        >
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              No actions found matching "{query}". Try "swiggy", "lens", "export", or "intern".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  id={`command-option-${cmd.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 aspect-square rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {cmd.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {cmd.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-0.5 text-emerald-400 opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-1">
              Esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};
