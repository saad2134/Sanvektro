import React from 'react';
import { CategorySummary } from '../../hooks/useBudget';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryPieProps {
  categories: CategorySummary[];
  totalSpent: number;
}

export const CategoryPie: React.FC<CategoryPieProps> = ({
  categories,
  totalSpent,
}) => {
  const active = categories.filter((c) => c.total > 0);
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = active.map((cat, index) => {
    const offset = active.slice(0, index).reduce((sum, c) => sum + c.percentage, 0);
    return {
      ...cat,
      offset,
    };
  });

  const accessibleSummary = active
    .map((c) => `${c.name} ₹${c.total} (${c.percentage}%)`)
    .join(', ');

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Spending Distribution
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          ₹{totalSpent.toLocaleString('en-IN')} total
        </span>
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2"
        role="img"
        aria-label={`Spending breakdown: ${accessibleSummary}`}
      >
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1A1E30"
              strokeWidth={strokeWidth}
            />
            {segments.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cat.offset / 100) * circumference);

              return (
                <circle
                  key={cat.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.accentHex}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Spent</span>
            <span className="text-lg font-bold font-mono text-white">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full">
          {active.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.accentHex }}
                  aria-hidden="true"
                />
                <span className="text-slate-200 font-medium">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span>{c.percentage}%</span>
                <span className="font-semibold text-white">₹{c.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
