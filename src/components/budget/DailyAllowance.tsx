import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RiskLevel } from '../../types';

interface DailyAllowanceProps {
  dailyAllowance: number;
  daysRemaining: number;
  riskLevel: RiskLevel;
}

export const DailyAllowance: React.FC<DailyAllowanceProps> = ({
  dailyAllowance,
  daysRemaining,
  riskLevel: _riskLevel,
}) => {

  const getPacingFeedback = () => {
    if (dailyAllowance >= 250) {
      return {
        text: 'Comfortable Daily Runway',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        desc: 'Spend up to this amount today without hurting any future plans.',
      };
    }
    if (dailyAllowance >= 150) {
      return {
        text: 'Balanced Runway',
        icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
        desc: 'Slightly below initial ₹333/day budget pace. Keep non-essentials moderate.',
      };
    }
    return {
      text: 'Tight Allowance Alert',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      desc: 'High caution: Avoid large discretionary purchases to make it through the cycle.',
    };
  };

  const feedback = getPacingFeedback();

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Daily Spending Pace
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          {feedback.icon}
          <span className="font-medium">{feedback.text}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
          ₹{dailyAllowance.toLocaleString('en-IN')}
          <span className="text-sm font-sans font-normal text-slate-400"> / day</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          {daysRemaining} days left
        </div>
      </div>

      {/* Runway capacity progress indicator */}
      <div className="w-full bg-[#1A1E30] h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            dailyAllowance >= 200
              ? 'bg-emerald-500'
              : dailyAllowance >= 100
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, (dailyAllowance / 400) * 100))}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {feedback.desc}
      </p>
    </div>
  );
};
