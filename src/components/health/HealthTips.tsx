import React from 'react';
import { Lightbulb } from 'lucide-react';

interface HealthTipsProps {
  tips: string[];
}

export const HealthTips: React.FC<HealthTipsProps> = ({ tips }) => {
  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Personalized Runway Intelligence
        </h3>
      </div>

      <div className="space-y-2">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0C0E17] border border-[#1C2036] text-xs text-slate-300 leading-relaxed"
          >
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
