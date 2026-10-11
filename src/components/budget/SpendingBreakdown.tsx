import React from 'react';
import { CategorySummary } from '../../hooks/useBudget';
import { Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, GraduationCap, Tv, PiggyBank, Layers } from 'lucide-react';

interface SpendingBreakdownProps {
  categories: CategorySummary[];
  totalSpent: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Food: <Utensils className="w-3.5 h-3.5" />,
  Transport: <Car className="w-3.5 h-3.5" />,
  Entertainment: <Gamepad2 className="w-3.5 h-3.5" />,
  Shopping: <ShoppingBag className="w-3.5 h-3.5" />,
  Health: <HeartPulse className="w-3.5 h-3.5" />,
  Education: <GraduationCap className="w-3.5 h-3.5" />,
  Subscriptions: <Tv className="w-3.5 h-3.5" />,
  Savings: <PiggyBank className="w-3.5 h-3.5" />,
  Other: <Layers className="w-3.5 h-3.5" />,
};

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  categories,
  totalSpent,
}) => {
  const activeCategories = categories.filter((c) => c.total > 0);

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-4 sm:p-5 w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Category Spending Breakdown
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Total ₹{totalSpent.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Screen reader table */}
      <table className="sr-only">
        <caption>Spending by category</caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {activeCategories.map((c) => (
            <tr key={c.category}>
              <td>{c.name}</td>
              <td>₹{c.total}</td>
              <td>{c.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeCategories.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          No expenses recorded in this cycle yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activeCategories.map((c) => (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`${c.color}`} aria-hidden="true">
                    {ICON_MAP[c.category] || <Layers className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-medium text-slate-200">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">{c.percentage}%</span>
                  <span className="font-mono tabular-nums font-semibold text-white">
                    ₹{c.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#1A1E30] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, c.percentage)}%`,
                    backgroundColor: c.accentHex,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
