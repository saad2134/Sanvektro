import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', label: 'Play / Pause 30-Day Timeline Scrubber' },
  { key: '1', label: 'Switch to College Hosteler Persona' },
  { key: '2', label: 'Switch to First-Month Intern Persona' },
  { key: '3', label: 'Switch to Freelance Creator Persona' },
  { key: 'S', label: 'Focus "What-If" Decision Simulator' },
  { key: 'C', label: 'Open Sanvektro Financial Decision Coach' },
  { key: 'K / ⌘K', label: 'Open Command Palette & Quick Search' },
  { key: 'L', label: 'Toggle The Lens (Mathematical Loupe Inspector)' },
  { key: 'R', label: 'Open 30-Day Executive Month-End Report Card' },
  { key: 'T', label: 'Open Interactive Onboarding Guided Tour' },
  { key: 'E', label: 'Export 30-Day Ledger as CSV' },
  { key: 'J', label: 'Export State & Audit Log as JSON' },
  { key: 'P', label: 'Print Monthly Financial Statement' },
  { key: 'M', label: 'Toggle Audio Synthesizer Mute' },
  { key: '?', label: 'Open Keyboard Shortcuts Guide' },
  { key: 'Esc', label: 'Dismiss Active Modal / Overlay' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts Guide"
    >
      <div className="bg-[#0d121e] border border-slate-700/80 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          id="btn-close-shortcuts-modal"
          className="absolute top-4 right-4 w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 aspect-square rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
              Keyboard Shortcuts ✦ Rapid Navigation
            </h2>
            <p className="text-xs text-slate-400">
              High-efficiency hands-off controls for the Sanvektro Cockpit
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
            >
              <span className="text-slate-300 font-medium">{item.label}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] font-bold text-emerald-400 shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
