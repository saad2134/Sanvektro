import React from 'react';
import type { ConsequenceMetrics, ConsequenceDiff } from '../types/finance';
import { 
  Wallet, 
  Flame, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface MetricCardsProps {
  metrics: ConsequenceMetrics;
  diff: ConsequenceDiff | null;
  currentDay: number;
  startingBudget: number;
  onOpenHealthAudit?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  diff,
  currentDay,
  startingBudget,
  onOpenHealthAudit
}) => {
  const remainingDays = Math.max(1, 30 - currentDay + 1);

  // Risk styling
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'OPTIMAL':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Optimal Buffer'
        };
      case 'MODERATE':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
          label: 'Moderate Pacing'
        };
      case 'ELEVATED':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Elevated Risk'
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
          dot: 'bg-rose-500',
          label: 'Ruin Hazard (<0 Balance)'
        };
    }
  };

  const riskBadge = getRiskBadge(metrics.riskLevel);

  // Health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 60) return 'text-cyan-400 stroke-cyan-400';
    if (score >= 40) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Financial Health Cockpit">
      
      {/* 1. Liquid Balance Card */}
      <div 
        id="metric-balance-card" 
        data-testid="metric-balance-card"
        className="relative overflow-hidden rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all hover:border-slate-700/80 group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Liquid Balance</span>
          <div className="w-9 h-9 aspect-square rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span 
            id="metric-balance" 
            data-testid="metric-balance"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono"
          >
            ₹{metrics.balance.toLocaleString('en-IN')}
          </span>
          {diff && diff.balanceDelta !== 0 && (
            <span 
              id="diff-balance-delta"
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                diff.balanceDelta < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {diff.balanceDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {diff.balanceDelta < 0 ? `-₹${Math.abs(diff.balanceDelta)}` : `+₹${diff.balanceDelta}`}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
          <span>Baseline: ₹{startingBudget.toLocaleString('en-IN')}</span>
          <span className="font-mono text-slate-300">
            {Math.round((metrics.balance / startingBudget) * 100)}% left
          </span>
        </div>
      </div>

      {/* 2. Daily Safe-to-Spend Burn Allowance */}
      <div 
        id="metric-daily-allowance-card" 
        data-testid="metric-daily-allowance-card"
        className="relative overflow-hidden rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all hover:border-slate-700/80 group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Safe Daily Burn</span>
          <div className="w-9 h-9 aspect-square rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span 
            id="metric-daily-allowance" 
            data-testid="metric-daily-allowance"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono"
          >
            ₹{metrics.dailyAllowance.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-slate-400">/day</span>
          </span>
          {diff && diff.allowanceDelta !== 0 && (
            <span 
              id="diff-allowance-delta"
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                diff.allowanceDelta < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {diff.allowanceDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {diff.allowanceDelta < 0 ? `-₹${Math.abs(diff.allowanceDelta)}/d` : `+₹${diff.allowanceDelta}/d`}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> {remainingDays} days remaining
          </span>
          <span className={`font-medium ${metrics.dailyAllowance > 180 ? 'text-emerald-400' : metrics.dailyAllowance > 100 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.dailyAllowance > 180 ? 'Comfortable' : metrics.dailyAllowance > 100 ? 'Tight Pace' : 'Survival Mode'}
          </span>
        </div>
      </div>

      {/* 3. Composite Financial Health Score */}
      <div 
        id="metric-health-score-card" 
        data-testid="metric-health-score-card"
        className="relative overflow-hidden rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all hover:border-slate-700/80 group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Health Index</span>
          <div className="w-9 h-9 aspect-square rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span 
            id="metric-health-score" 
            data-testid="metric-health-score"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono"
          >
            {metrics.healthScore}
            <span className="text-sm font-normal text-slate-500">/100</span>
          </span>
          {diff && diff.healthScoreDelta !== 0 && (
            <span 
              id="diff-health-delta"
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                diff.healthScoreDelta < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {diff.healthScoreDelta < 0 ? `${diff.healthScoreDelta} pts` : `+${diff.healthScoreDelta} pts`}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
          <span>Resilience: {metrics.shockResilienceScore}%</span>
          {onOpenHealthAudit ? (
            <button
              onClick={onOpenHealthAudit}
              id="btn-audit-health-math"
              className="text-purple-400 hover:text-purple-300 font-semibold underline text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="Audit transparent 4-pillar math"
            >
              <span>Audit Math</span>
              <span>✦</span>
            </button>
          ) : (
            <span className={`font-semibold ${getHealthColor(metrics.healthScore)}`}>
              {metrics.healthScore >= 80 ? 'Elite Control' : metrics.healthScore >= 60 ? 'Stable Runway' : metrics.healthScore >= 40 ? 'Vulnerable' : 'High Friction'}
            </span>
          )}
        </div>
      </div>

      {/* 4. Financial Risk Gauge */}
      <div 
        id="metric-risk-card" 
        data-testid="metric-risk-card"
        className="relative overflow-hidden rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all hover:border-slate-700/80 group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Financial Risk</span>
          <div className="w-9 h-9 aspect-square rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            {metrics.riskLevel === 'OPTIMAL' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div 
            id="metric-risk-level"
            data-testid="metric-risk-level"
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-sm font-bold border ${riskBadge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`} />
            {metrics.riskLevel}
          </div>
          {diff && diff.riskChanged && (
            <span className="text-[10px] font-semibold uppercase text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
              Shifted!
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
          <span>30-Day Solvency:</span>
          <span className={`font-semibold font-mono ${metrics.runwayDepletionDay ? 'text-rose-400' : 'text-emerald-400'}`}>
            {metrics.runwayDepletionDay ? `Exhausts Day ${metrics.runwayDepletionDay}` : 'Full 30-Day Runway'}
          </span>
        </div>
      </div>

    </section>
  );
};
