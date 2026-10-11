/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RiskLevel } from '../types';

export { calculateHealthScore } from './health-calculator';

// Export Sanvektro native calculation utilities
export {
  rupeesToPaise,
  paiseToRupees,
  calculateMetrics,
  calculateCapitalAllocation,
  calculateCategoryOutflow,
  CATEGORY_BUDGET_CAPS,
} from '../utils/calculations';

/**
 * Floating-point safe addition rounded to 2 decimal places.
 */
export function safeAdd(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}

/**
 * Floating-point safe subtraction rounded to 2 decimal places, never dropping below 0.
 */
export function safeSub(a: number, b: number): number {
  return Math.max(0, Math.round((a - b) * 100) / 100);
}

/**
 * Calculates available balance:
 * availableBalance = totalBudget - spent - committed - savedToGoals
 * Always floored at 0.
 */
export function getAvailableBalance(state: {
  totalBudget?: number;
  spent: number;
  committed?: number;
  savedToGoals?: number;
}): number {
  const total = state.totalBudget ?? 10000;
  const spent = state.spent ?? 0;
  const committed = state.committed ?? 0;
  const savedToGoals = state.savedToGoals ?? 0;

  const totalDeductions = safeAdd(spent, safeAdd(committed, savedToGoals));
  return safeSub(total, totalDeductions);
}

/**
 * Calculates daily allowance:
 * dailyAllowance = availableBalance / Math.max(daysRemaining, 1)
 */
export function getDailyAllowance(state: {
  availableBalance?: number;
  totalBudget?: number;
  spent?: number;
  committed?: number;
  savedToGoals?: number;
  daysRemaining: number;
}): number {
  const balance =
    state.availableBalance !== undefined
      ? state.availableBalance
      : getAvailableBalance({
          totalBudget: state.totalBudget,
          spent: state.spent ?? 0,
          committed: state.committed ?? 0,
          savedToGoals: state.savedToGoals ?? 0,
        });

  const days = Math.max(state.daysRemaining, 1);
  return Math.round((balance / days) * 100) / 100;
}

/**
 * Calculates risk level based on daily allowance:
 * riskLevel = dailyAllowance < 100 ? 'danger' : dailyAllowance < 200 ? 'caution' : 'safe'
 * Supports either a direct numeric daily allowance or a budget state object.
 */
export function getRiskLevel(
  input:
    | number
    | {
        dailyAllowance?: number;
        availableBalance?: number;
        totalBudget?: number;
        spent?: number;
        committed?: number;
        savedToGoals?: number;
        daysRemaining?: number;
      }
): RiskLevel {
  let allowance: number;
  if (typeof input === 'number') {
    allowance = input;
  } else if (input.spent !== undefined) {
    const total = input.totalBudget ?? 10000;
    const remainingUnspent = total - input.spent;
    const days = Math.max(input.daysRemaining ?? 1, 1);
    allowance = remainingUnspent / days;
  } else if (input.dailyAllowance !== undefined) {
    allowance = input.dailyAllowance;
  } else {
    allowance = getDailyAllowance({
      availableBalance: input.availableBalance,
      totalBudget: input.totalBudget,
      spent: input.spent ?? 0,
      committed: input.committed ?? 0,
      savedToGoals: input.savedToGoals ?? 0,
      daysRemaining: input.daysRemaining ?? 1,
    });
  }

  if (allowance < 100) return 'danger';
  if (allowance < 200) return 'caution';
  return 'safe';
}
