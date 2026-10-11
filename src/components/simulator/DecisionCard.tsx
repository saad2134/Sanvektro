import React from 'react';
import { ProposedDecision, ExpenseCategory } from '../../types';
import { GEN_Z_PRESETS, CATEGORIES } from '../../constants/categories';
import { Slider } from '../ui/Slider';
import { Sparkles } from 'lucide-react';

interface DecisionCardProps {
  decision: ProposedDecision;
  onAmountChange: (amount: number) => void;
  onCategoryChange: (category: ExpenseCategory) => void;
  onDescriptionChange: (description: string) => void;
  onApplyPreset: (preset: { amount: number; category: ExpenseCategory; title: string }) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onAmountChange,
  onCategoryChange,
  onDescriptionChange,
  onApplyPreset,
}) => {
  const categoriesList = Object.keys(CATEGORIES) as ExpenseCategory[];

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Simulate a Financial Decision</span>
          </h2>
          <p className="text-sm sm:text-xs text-slate-400 mt-1">
            Test what happens to your runway BEFORE spending a single rupee.
          </p>
        </div>
      </div>

      {/* Quick Presets with 48px+ touch targets */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          One-Tap Gen Z Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {GEN_Z_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onApplyPreset({
                  amount: preset.amount,
                  category: preset.category,
                  title: preset.title,
                })
              }
              className={`p-3 rounded-lg border text-left transition-all active:scale-[0.98] min-h-[54px] flex flex-col justify-center ${
                decision.amount === preset.amount && decision.description === preset.title
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-[#151829] border-[#222740] hover:bg-[#1B2036] text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-lg">{preset.emoji}</span>
                <span className="font-mono font-bold text-indigo-300">
                  ₹{preset.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="font-medium text-xs sm:text-xs text-slate-200 truncate">
                {preset.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input Scratchpad */}
      <div className="pt-4 border-t border-[#1C2036] space-y-5">
        {/* Amount field with exact label for testing */}
        <div>
          <label htmlFor="sim-amount" className="block text-sm sm:text-xs font-semibold text-slate-300 mb-2">
            Proposed Amount (₹) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-base font-mono">
              ₹
            </span>
            <input
              id="sim-amount"
              type="number"
              inputMode="decimal"
              min="0"
              max="10000"
              step="50"
              value={decision.amount === 0 ? '' : decision.amount}
              onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
              aria-label="Amount"
              placeholder="e.g. 1500"
              className="w-full min-h-[48px] pl-9 pr-4 py-3 bg-[#0C0E17] border border-[#232840] rounded-lg text-white font-mono text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="mt-3">
            <Slider
              min={0}
              max={5000}
              step={50}
              value={Math.min(5000, decision.amount)}
              onChange={onAmountChange}
              label="Quick Slider Scrub"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="sim-desc" className="block text-sm sm:text-xs font-semibold text-slate-300 mb-2">
            Description / Item Name
          </label>
          <div className="relative">
            <input
              id="sim-desc"
              type="text"
              value={decision.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="e.g. Vintage Leather Jacket, Weekend Rave"
              maxLength={60}
              className="w-full min-h-[46px] px-3.5 py-2.5 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Selector with minimum 44px touch targets */}
        <div>
          <label className="block text-sm sm:text-xs font-semibold text-slate-300 mb-2">
            Spending Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoriesList.map((cat) => {
              const meta = CATEGORIES[cat];
              const isSelected = decision.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#151829] text-slate-300 hover:text-white hover:bg-[#1B2036] border border-[#20253D]'
                  }`}
                >
                  <span className="truncate">{meta.name.split('&')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
