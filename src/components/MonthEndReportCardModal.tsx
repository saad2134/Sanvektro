import React, { useState } from 'react';
import type { FinancialState, ConsequenceMetrics } from '../types/finance';
import { 
  X, 
  Award, 
  Copy, 
  Check, 
  Printer, 
  TrendingUp, 
  ShieldCheck, 
  Flame,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { playTick, playChime } from '../services/audioService';

interface MonthEndReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  metrics: ConsequenceMetrics;
  presetName: string;
  onPrintStatement: () => void;
}

export const MonthEndReportCardModal: React.FC<MonthEndReportCardModalProps> = ({
  isOpen,
  onClose,
  state,
  metrics,
  presetName,
  onPrintStatement
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Grade color scheme
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return {
          badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20',
          glow: 'from-emerald-500/20 to-teal-500/5',
          border: 'border-emerald-500/40',
          accent: 'text-emerald-400'
        };
      case 'B':
        return {
          badge: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-cyan-500/20',
          glow: 'from-cyan-500/20 to-blue-500/5',
          border: 'border-cyan-500/40',
          accent: 'text-cyan-400'
        };
      case 'C':
        return {
          badge: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-500/20',
          glow: 'from-amber-500/20 to-orange-500/5',
          border: 'border-amber-500/40',
          accent: 'text-amber-400'
        };
      case 'D':
      case 'F':
      default:
        return {
          badge: 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/20',
          glow: 'from-rose-500/20 to-pink-500/5',
          border: 'border-rose-500/40',
          accent: 'text-rose-400'
        };
    }
  };

  const style = getGradeStyle(metrics.letterGrade);

  // Gen Z Survival Archetype
  const getArchetype = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return {
          title: 'Prudent Mastermind',
          subtitle: 'Flawless Solvency & Reserve Discipline',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'B':
        return {
          title: 'Budget Sensei',
          subtitle: 'Balanced Pacing & Moderate Discretionary Burn',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'C':
        return {
          title: 'Instant Noodle Survivor',
          subtitle: 'Narrow Runway & Living on the Margin',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'D':
      case 'F':
      default:
        return {
          title: 'Broke Legend',
          subtitle: 'Heroic Deficit & Cash Exhaustion Hazard',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
    }
  };

  const archetype = getArchetype(metrics.letterGrade);

  // Top 3 highest expenses to date
  const topExpenses = [...state.transactions]
    .filter(t => t.day <= state.currentDay)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Total spent to date
  const totalSpent = state.transactions
    .filter(t => t.day <= state.currentDay)
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate formatted Markdown Report
  const handleCopyReport = async () => {
    playTick();
    const reportText = [
      `# ✦ SANVEKTRO ✦ 30-Day Executive Month-End Report Card`,
      `**Persona**: ${presetName} | **Current Day**: Day ${state.currentDay} / 30`,
      `**Academic Grade**: ${metrics.letterGrade} (${metrics.healthScore}/100)`,
      `**Gen Z Archetype**: ${archetype.title} ✦ ${archetype.subtitle}`,
      `**Verdict**: ${metrics.gradeDescriptor}`,
      ``,
      `## ✦ Executive Summary Metrics`,
      `- **Liquid Balance**: ₹${metrics.balance.toLocaleString('en-IN')}`,
      `- **Safe Daily Allowance**: ₹${metrics.dailyAllowance}/day`,
      `- **Recency-Weighted Burn Velocity**: ₹${metrics.weightedBurnVelocity}/day`,
      `- **Projected Day 30 Balance**: ₹${metrics.projectedDay30Balance.toLocaleString('en-IN')}`,
      `- **Solvency Runway**: ${metrics.runwayDepletionDay ? `Exhausts Day ${metrics.runwayDepletionDay}` : 'Sustained through Day 30'}`,
      `- **Savings Goals Secured**: ${metrics.goalsAchievableCount} of ${metrics.totalGoalsCount}`,
      `- **Emergency Shock Resilience**: ${metrics.shockResilienceScore}%`,
      ``,
      `## ✦ Behavioral Recap & Key Lessons`,
      `- **Pacing Discipline**: ${metrics.dailyAllowance >= 160 ? 'Healthy discretionary buffer preserved for remaining cycle.' : 'Discretionary spending requires immediate rationalization.'}`,
      `- **Obligation Containment**: Total of ${state.commitments.length} commitments and ${state.subscriptions.filter(s => s.isActive).length} active subscriptions mapped.`,
      `- **Buffer Protection**: Emergency reserve benchmark set at ₹${state.emergencyBuffer.toLocaleString('en-IN')}.`,
      ``,
      `Generated by Sanvektro Financial Decision Engine ✦ https://sanvektro.vercel.app`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(reportText);
      playChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="30-Day Executive Month-End Report Card"
    >
      <div className="bg-[#090d16] border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-report-card-modal"
          className="absolute top-5 right-5 w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          title="Dismiss Report Card (Esc)"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 aspect-square rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/10 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
                30-Day Executive Month-End Report Card
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Day {state.currentDay} Recap
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive solvency appraisal, pacing evaluation & behavioral recap for {presetName}
            </p>
          </div>
        </div>

        {/* Big Letter Grade Hero Stamp */}
        <div className={`p-5 rounded-2xl bg-gradient-to-b ${style.glow} bg-slate-900/60 border ${style.border} mb-6 relative overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Grade Stamp Box */}
            <div className="flex items-center gap-4">
              <div 
                id="report-card-grade-stamp"
                className={`w-20 h-20 aspect-square rounded-2xl flex flex-col items-center justify-center border-2 font-mono font-extrabold text-4xl shadow-xl ${style.badge}`}
              >
                <span>{metrics.letterGrade}</span>
                <span className="text-[9px] font-sans font-bold tracking-widest uppercase -mt-1 opacity-80">Grade</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Solvency Appraisal
                  </span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 ${style.accent}`}>
                    {metrics.healthScore}/100 Health Index
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${archetype.badge}`}>
                    {archetype.title}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  {metrics.gradeDescriptor}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {metrics.letterGrade === 'A+' || metrics.letterGrade === 'A'
                    ? 'Exceptional financial discipline. Your projected surplus comfortably shields your savings targets.'
                    : metrics.letterGrade === 'B'
                    ? 'Solid monthly pacing. Minor discretionary friction, but essential commitments remain fully solvent.'
                    : metrics.letterGrade === 'C'
                    ? 'Moderate liquidity tension. Daily burn rate is outpacing discretionary targets.'
                    : 'Critical solvency danger. Uncontained velocity threatens complete cash depletion before Day 30.'}
                </p>
              </div>
            </div>

          </div>

          {/* Health Index Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-400 font-sans">Multi-Pillar Composite Index</span>
              <span className="text-white font-bold">{metrics.healthScore}% Solvency Rating</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-400`}
                style={{ width: `${Math.min(100, Math.max(5, metrics.healthScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Executive Metric Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Day 30 Balance</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white font-mono">
              ₹{metrics.projectedDay30Balance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {metrics.projectedDay30Balance >= 1500 ? 'Comfortable Surplus' : 'Tight Cushion'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Burn Velocity</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white font-mono">
              ₹{metrics.weightedBurnVelocity}/d
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Recency-Weighted Pace
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Allowance</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white font-mono">
              ₹{metrics.dailyAllowance}/d
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Discretionary Quota
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>Goals Secured</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white font-mono">
              {metrics.goalsAchievableCount}/{metrics.totalGoalsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Lockbox Targets
            </div>
          </div>
        </div>

        {/* Behavioral Recap & Key Lessons */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Executive Behavioral Recap ✦ Key Insights
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="w-5 h-5 aspect-square rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white">Discretionary Pacing ✦ </span>
                <span className="text-slate-300">
                  Total realized outflow to date sits at ₹{totalSpent.toLocaleString('en-IN')}. With ₹{metrics.dailyAllowance}/day safe allowance remaining, discretionary spending is {metrics.dailyAllowance > 180 ? 'well within optimal parameters.' : 'under slight compression.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="w-5 h-5 aspect-square rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white">Obligation Defense ✦ </span>
                <span className="text-slate-300">
                  {state.commitments.filter(c => c.dueDay > state.currentDay && !c.isPaid).length} pending commitments remain scheduled for the cycle. Liquid cash is currently adequate to clear all fixed deadlines without emergency borrowing.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="w-5 h-5 aspect-square rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white">Emergency Shock Shield ✦ </span>
                <span className="text-slate-300">
                  Shock resilience is rated at {metrics.shockResilienceScore}%. An unforeseen ₹1,000 emergency would consume {metrics.balance > 1000 ? 'a manageable fraction of liquid reserves.' : 'critical capital and trigger liquidity distress.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Expenses Spotlight (if any) */}
        {topExpenses.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Top Outflows Realized</span>
              <span className="text-[10px] text-slate-500">Day 1 to {state.currentDay}</span>
            </h4>
            <div className="space-y-1.5">
              {topExpenses.map(tx => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">D{tx.day}</span>
                    <span className="text-slate-200 font-medium">{tx.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{tx.category}</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">
                    -₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Hands-free keyboard shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[11px]">R</kbd>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyReport}
              id="btn-copy-report-card"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Copy markdown executive summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onPrintStatement();
              }}
              id="btn-print-from-report-card"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print formal statement"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              id="btn-close-report-card-footer"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
