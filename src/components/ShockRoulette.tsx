import React, { useState } from 'react';
import { UNEXPECTED_SHOCKS_POOL } from '../data/presets';
import { Dices, AlertOctagon, Zap } from 'lucide-react';
import type { ExpenseCategory } from '../types/finance';

interface ShockRouletteProps {
  emergencyBuffer: number;
  onApplyShock: (title: string, amount: number, category: ExpenseCategory) => void;
}

export const ShockRoulette: React.FC<ShockRouletteProps> = ({
  emergencyBuffer,
  onApplyShock
}) => {
  const [selectedShock, setSelectedShock] = useState(UNEXPECTED_SHOCKS_POOL[0]);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * UNEXPECTED_SHOCKS_POOL.length);
      setSelectedShock(UNEXPECTED_SHOCKS_POOL[randomIdx]);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  const handleInject = () => {
    onApplyShock(
      `[Shock] ${selectedShock.title}`,
      selectedShock.amount,
      selectedShock.category
    );
  };

  const isBufferAdequate = emergencyBuffer >= selectedShock.amount;

  return (
    <section 
      id="shock-roulette-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="Financial Shock Stress-Testing"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            Financial Shock & Resilience Stress-Test
          </h2>
          <p className="text-xs text-slate-400">
            Stress-test your runway against real-life Gen Z emergencies & unexpected expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRoll}
            disabled={isRolling}
            id="btn-roll-shock"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Dices className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Rolling...' : 'Random Shock'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{selectedShock.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {selectedShock.severity} SEVERITY
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-mono text-rose-400 font-bold">₹{selectedShock.amount}</span>
              <span>•</span>
              <span className={isBufferAdequate ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {isBufferAdequate ? 'Buffer can absorb' : 'Buffer breached! Discretionary burn impacted'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleInject}
          id="btn-inject-shock"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Zap className="w-3.5 h-3.5 fill-current" /> Inject Shock Event
        </button>
      </div>
    </section>
  );
};
