/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BudgetState, RiskLevel } from '../types';

// Re-export Sanvektro native health audit utilities
export {
  getHealthLetterGrade,
  generateHealthScoreAudit,
  calculateMoneyPersonality
} from '../utils/calculations';

export interface HealthWeights {
  savingsRateWeight: number; // 30%
  spendingRateWeight: number; // 25%
  consistencyScoreWeight: number; // 20%
  goalsOnTrackWeight: number; // 15%
  riskScoreWeight: number; // 10%
}

export const DEFAULT_HEALTH_WEIGHTS: HealthWeights = {
  savingsRateWeight: 30,
  spendingRateWeight: 25,
  consistencyScoreWeight: 20,
  goalsOnTrackWeight: 15,
  riskScoreWeight: 10,
};

export function getRiskScore(riskLevel: RiskLevel): number {
  switch (riskLevel) {
    case 'safe':
      return 100;
    case 'caution':
      return 60;
    case 'danger':
      return 20;
    default:
      return 50;
  }
}

/**
 * Health score calculation per exact FAIE specification:
 * Returns pure primitive number (0-100).
 */
export function calculateHealthScore(
  state: Partial<BudgetState> & { goalsOnTrackPercent?: number; dailyVariancePercent?: number; goals?: any[] }
): number {
  const totalBudget = state.totalBudget ?? 10000;
  const spent = state.spent ?? 0;
  const savedToGoals = state.savedToGoals ?? 0;
  const daysPassed = Math.max(1, state.daysPassed ?? 1);
  const daysRemaining = state.daysRemaining ?? Math.max(0, 30 - daysPassed);

  // 1. Savings rate (0-100%): Target at least 15% of total budget saved
  const savingsRate = Math.min(100, Math.max(0, (savedToGoals / (totalBudget * 0.15)) * 100));

  // 2. Spending rate (0-100%): Expected burn vs actual burn
  const expectedBurn = (daysPassed / 30) * totalBudget;
  let spendingRate = 100;
  if (spent > expectedBurn) {
    const overspendRatio = (spent - expectedBurn) / (totalBudget - expectedBurn || 1);
    spendingRate = Math.max(0, Math.min(100, (1 - overspendRatio) * 100));
  } else {
    spendingRate = 100;
  }

  // 3. Consistency score (0-100%)
  const avgDailySpent = spent / daysPassed;
  const dailyAllowance =
    state.dailyAllowance ??
    Math.max(0, (totalBudget - spent - (state.committed ?? 0) - savedToGoals) / Math.max(daysRemaining, 1));
  let consistencyScore = 100;
  if (dailyAllowance > 0) {
    const ratio = avgDailySpent / dailyAllowance;
    if (ratio <= 1.1) {
      consistencyScore = 100;
    } else {
      consistencyScore = Math.max(10, Math.min(100, 100 - (ratio - 1) * 60));
    }
  } else {
    consistencyScore = 0;
  }

  // 4. Goals on track score (0-100%)
  const goalsOnTrack = state.goalsOnTrackPercent ?? (savedToGoals > 0 ? 85 : 50);

  // 5. Risk score (0-100%)
  const riskLevel =
    state.riskLevel ??
    (dailyAllowance < 100 ? 'danger' : dailyAllowance < 200 ? 'caution' : 'safe');
  const riskScore = getRiskScore(riskLevel);

  // Weighted calculation (total weight = 100)
  const weightedSum =
    (savingsRate * 30 +
      spendingRate * 25 +
      consistencyScore * 20 +
      goalsOnTrack * 15 +
      riskScore * 10) /
    100;

  return Math.max(0, Math.min(100, Math.round(weightedSum)));
}

export function getHealthLabel(score: number): string {
  if (score >= 80) return 'Peak Financial Flow';
  if (score >= 60) return 'Stable & In Control';
  if (score >= 40) return 'Tight Margins';
  return 'Critical Attention Required';
}

export function getHealthAdvice(score: number, dailyAllowance: number): string[] {
  const tips: string[] = [];

  if (dailyAllowance < 100) {
    tips.push('Warning: Your daily allowance is below ₹100. Freeze non-essential entertainment & dining.');
    tips.push('Tip: Review recurring subscriptions to pause unneeded memberships this cycle.');
  } else if (dailyAllowance < 200) {
    tips.push('Pacing alert: Cap discretionary weekend dining to maintain ₹200+/day breathing room.');
    tips.push('Keep savings goals locked to protect end-of-month buffer.');
  } else {
    tips.push('Great pacing! You have a comfortable daily allowance.');
    tips.push('Consider allocating an extra ₹200 to your top savings goal this week.');
  }

  if (score >= 75) {
    tips.push('Health score is strong: Your spending pace is well within sustainable limits.');
  }

  return tips;
}
