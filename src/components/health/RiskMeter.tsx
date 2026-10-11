import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

interface RiskMeterProps {
  riskLevel: RiskLevel;
  dailyAllowance: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ riskLevel, dailyAllowance }) => {
  const riskDescriptions = {
    safe: 'You are spending within a healthy range.',
    caution: 'Your daily budget is getting tight. Consider reducing spending.',
    danger: 'Warning: At this rate you will run out of money before the month ends.',
  };

  const riskLabels = {
    safe: 'Safe (< ₹200+/day)',
    caution: 'Caution (₹100 - ₹200/day)',
    danger: 'Danger (< ₹100/day)',
  };

  const riskIcons = {
    safe: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    caution: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    danger: <Flame className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Risk Velocity Meter
        </span>
        <div
          role="status"
          aria-live="polite"
          aria-label={`Financial risk: ${riskLevel}. ${riskDescriptions[riskLevel]}`}
          data-testid="risk-indicator"
          className={`flex items-center gap-1.5 text-xs font-bold ${
            riskLevel === 'safe'
              ? 'text-emerald-400'
              : riskLevel === 'caution'
              ? 'text-amber-400'
              : 'text-red-500'
          }`}
        >
          <span aria-hidden="true">{riskIcons[riskLevel]}</span>
          <span className="sr-only">{riskLevel} risk — </span>
          <span>{riskLabels[riskLevel]}</span>
        </div>
      </div>

      {/* 3-stage segmented status bar */}
      <div className="grid grid-cols-3 gap-1.5 my-3">
        {/* Danger zone segment */}
        <div
          className={`h-2.5 rounded-l-md transition-all ${
            riskLevel === 'danger'
              ? 'bg-rose-500 ring-2 ring-rose-500/50'
              : 'bg-[#1D2036] opacity-60'
          }`}
          title="Danger (< ₹100/day)"
        />
        {/* Caution zone segment */}
        <div
          className={`h-2.5 transition-all ${
            riskLevel === 'caution'
              ? 'bg-amber-500 ring-2 ring-amber-500/50'
              : 'bg-[#1D2036] opacity-60'
          }`}
          title="Caution (₹100-₹200/day)"
        />
        {/* Safe zone segment */}
        <div
          className={`h-2.5 rounded-r-md transition-all ${
            riskLevel === 'safe'
              ? 'bg-emerald-500 ring-2 ring-emerald-500/50'
              : 'bg-[#1D2036] opacity-60'
          }`}
          title="Safe (₹200+/day)"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>0</span>
        <span>₹100</span>
        <span>₹200</span>
        <span>₹350+</span>
      </div>

      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
        {riskDescriptions[riskLevel]} Current runway pace:{' '}
        <strong className="text-white font-mono">₹{dailyAllowance}/day</strong>.
      </p>
    </div>
  );
};
