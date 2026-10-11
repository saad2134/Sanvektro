import React from 'react';
import { getHealthLabel } from '../../lib/health-calculator';
import { Activity } from 'lucide-react';

interface HealthScoreProps {
  score: number;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score }) => {
  const label = getHealthLabel(score);

  // SVG Gauge calculations (semi-circle arc)
  const radius = 65;
  const strokeWidth = 12;
  const arcLength = Math.PI * radius; // 180 degrees
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  const getColor = (val: number) => {
    if (val >= 80) return '#10B981'; // Emerald
    if (val >= 60) return '#6366F1'; // Indigo
    if (val >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const currentColor = getColor(clampedScore);

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Health Score</span>
        </span>
        <span className="font-mono text-slate-300">0 - 100</span>
      </div>

      <div
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Financial health score: ${clampedScore} out of 100`}
        aria-valuetext={`${clampedScore} — ${label}`}
        className="relative my-2"
        style={{ width: 160, height: 95 }}
      >
        <svg width="160" height="95" viewBox="0 0 160 95" className="overflow-visible">
          {/* Background Arc */}
          <path
            d="M 15 85 A 65 65 0 0 1 145 85"
            fill="none"
            stroke="#1C2036"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Arc */}
          <path
            d="M 15 85 A 65 65 0 0 1 145 85"
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs font-semibold text-slate-200">
        {label}
      </div>
      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-tight">
        Weighted on savings pace, burn rate, and consistency.
      </p>
    </div>
  );
};
