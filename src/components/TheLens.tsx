import React, { useEffect, useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

export interface LensTargetData {
  title: string;
  formula: string;
  explanation: string;
  currentValue?: string;
}

interface TheLensProps {
  isActive: boolean;
  onToggle: () => void;
}

export const TheLens: React.FC<TheLensProps> = ({ isActive, onToggle }) => {
  const [mousePos, setMousePos] = useState({ x: -300, y: -300 });
  const [lensData, setLensData] = useState<LensTargetData | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setLensData(null);
      setIsHovering(false);
      return;
    }

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });

        const target = (e.target as HTMLElement)?.closest?.('[data-lens-title]');
        if (target) {
          const title = target.getAttribute('data-lens-title') || '';
          const formula = target.getAttribute('data-lens-formula') || '';
          const explanation = target.getAttribute('data-lens-explanation') || '';
          const currentValue = target.getAttribute('data-lens-value') || '';

          setLensData({ title, formula, explanation, currentValue });
          setIsHovering(true);
        } else {
          setIsHovering(false);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive]);

  return (
    <>
      {/* Floating Magnifying Inspection Loupe Tooltip */}
      {isActive && isHovering && lensData && (
        <div
          id="the-lens-inspector"
          role="tooltip"
          aria-live="polite"
          className="fixed pointer-events-none z-50 max-w-sm rounded-2xl p-4 shadow-2xl backdrop-blur-xl bg-[#090d16]/95 border-2 border-amber-500/60 text-slate-200 transition-transform duration-75"
          style={{
            left: `${Math.min(window.innerWidth - 380, Math.max(16, mousePos.x + 20))}px`,
            top: `${Math.min(window.innerHeight - 220, Math.max(16, mousePos.y - 40))}px`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 24px rgba(245, 158, 11, 0.25)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 aspect-square rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide font-['Plus_Jakarta_Sans']">
                {lensData.title}
              </span>
            </div>
            {lensData.currentValue && (
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {lensData.currentValue}
              </span>
            )}
          </div>

          {/* Exact Math Formula */}
          {lensData.formula && (
            <div className="mb-2 bg-[#07090e] p-2.5 rounded-xl border border-amber-500/20 font-mono text-[11px] text-amber-200/90 break-words leading-relaxed">
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                Mathematical Invariant:
              </span>
              {lensData.formula}
            </div>
          )}

          {/* Plain-language explanation */}
          <p className="text-[11px] text-slate-300 leading-relaxed m-0 font-sans">
            {lensData.explanation}
          </p>
        </div>
      )}

      {/* Persistent Floating Toggle Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={onToggle}
          id="btn-toggle-the-lens"
          aria-label={isActive ? 'Deactivate The Lens inspector' : 'Activate The Lens inspector'}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xl transition-all ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 scale-105 ring-2 ring-amber-400/50'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-500/50'
          }`}
          title="Press 'L' to toggle The Lens formula inspector"
        >
          {isActive ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-slate-950" />
              <span>The Lens: Active</span>
              <X className="w-3.5 h-3.5 ml-0.5 opacity-70 hover:opacity-100" />
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>The Lens</span>
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                L
              </kbd>
            </>
          )}
        </button>
      </div>
    </>
  );
};
