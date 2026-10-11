import React from 'react';
import { X, CheckCircle2, AlertTriangle, Scale, Activity } from 'lucide-react';
import type { HealthScoreAudit } from '../../types/finance';

interface HealthAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: HealthScoreAudit;
}

export const HealthAuditModal: React.FC<HealthAuditModalProps> = ({
  isOpen,
  onClose,
  audit
}) => {
  if (!isOpen) return null;

  const { overallScore, riskLevel, pillars, positiveHighlights, riskWarnings } = audit;

  const riskBadgeStyles: Record<string, string> = {
    OPTIMAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    ELEVATED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Financial Health Audit & Scoring Diagnostics"
    >
      <div className="bg-[#0d121e] border border-slate-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-health-audit"
          className="absolute top-4 right-4 w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
          title="Close Audit"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 aspect-square rounded-2xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] m-0 flex items-center gap-2">
              <span>Financial Health Engine ✦ Diagnostic Audit</span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic 0-100 composite index derived from 4 liquidity and runway pillars
            </p>
          </div>
        </div>

        {/* Score Hero Banner with Radial Progress Gauge */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1422] to-[#111726] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            {/* SVG Radial Gauge */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 select-none" viewBox="0 0 80 80">
                {/* Background track circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-slate-800/80"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={
                    riskLevel === 'OPTIMAL'
                      ? '#10b981'
                      : riskLevel === 'MODERATE'
                      ? '#06b6d4'
                      : riskLevel === 'ELEVATED'
                      ? '#f59e0b'
                      : '#f43f5e'
                  }
                  strokeWidth="6"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (Math.min(100, Math.max(0, overallScore)) / 100) * 213.6}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-extrabold text-white leading-none">{overallScore}</span>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold">Index</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                  {overallScore >= 80 ? 'Optimal Liquidity' : overallScore >= 60 ? 'Stable Solvency' : overallScore >= 45 ? 'Elevated Pacing' : 'Critical Depletion'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeStyles[riskLevel] || ''}`}>
                  {riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Deterministic 4-pillar index: Runway cushion, commitment coverage, allowance pacing, and emergency shock resilience.
              </p>
            </div>
          </div>
        </div>

        {/* The 4 Weighted Pillars */}
        <div className="space-y-3.5 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>4 Weighted Algorithmic Pillars</span>
          </div>

          {/* Pillar 1: Runway */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{pillars.runway.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({pillars.runway.weightPct}% Weight)</span>
                <div className="text-[11px] text-emerald-400 font-medium">{pillars.runway.status}</div>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">
                {pillars.runway.score} / {pillars.runway.maxScore} pts
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(pillars.runway.score / pillars.runway.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              {pillars.runway.description}
            </p>
          </div>

          {/* Pillar 2: Commitments */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{pillars.commitments.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({pillars.commitments.weightPct}% Weight)</span>
                <div className="text-[11px] text-cyan-400 font-medium">{pillars.commitments.status}</div>
              </div>
              <div className="font-mono font-bold text-cyan-400 text-sm">
                {pillars.commitments.score} / {pillars.commitments.maxScore} pts
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(pillars.commitments.score / pillars.commitments.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              {pillars.commitments.description}
            </p>
          </div>

          {/* Pillar 3: Daily Allowance Cushion */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{pillars.allowance.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({pillars.allowance.weightPct}% Weight)</span>
                <div className="text-[11px] text-purple-400 font-medium">{pillars.allowance.status}</div>
              </div>
              <div className="font-mono font-bold text-purple-400 text-sm">
                {pillars.allowance.score} / {pillars.allowance.maxScore} pts
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(pillars.allowance.score / pillars.allowance.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              {pillars.allowance.description}
            </p>
          </div>

          {/* Pillar 4: Resilience & Goals */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{pillars.resilience.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({pillars.resilience.weightPct}% Weight)</span>
                <div className="text-[11px] text-amber-400 font-medium">{pillars.resilience.status}</div>
              </div>
              <div className="font-mono font-bold text-amber-400 text-sm">
                {pillars.resilience.score} / {pillars.resilience.maxScore} pts
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(pillars.resilience.score / pillars.resilience.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              {pillars.resilience.description}
            </p>
          </div>
        </div>

        {/* Diagnostic Flags */}
        <div className="space-y-3 mb-5">
          {positiveHighlights.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Positive Health Attributes
              </div>
              {positiveHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          )}

          {riskWarnings.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Active Diagnostic Risk Warnings
              </div>
              {riskWarnings.map((warn, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Pure client-side mathematical evaluation
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
