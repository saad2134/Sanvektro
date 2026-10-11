/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import type { BudgetState } from '../../types';
import {
  getAvailableBalance,
  getDailyAllowance,
  getRiskLevel,
  calculateHealthScore,
} from '../budget-engine';

describe('Budget Engine ✦ Pure Deterministic Math', () => {
  const base: BudgetState = {
    totalBudget: 10000,
    startDate: new Date(),
    spent: 2000,
    committed: 1000,
    savedToGoals: 500,
    daysRemaining: 20,
    daysPassed: 10,
    availableBalance: 6500,
    dailyAllowance: 325,
    healthScore: 82,
    riskLevel: 'safe',
  };

  it('calculates available balance correctly', () => {
    expect(getAvailableBalance(base)).toBe(6500); // 10000 - 2000 - 1000 - 500
  });

  it('calculates daily allowance correctly', () => {
    expect(getDailyAllowance(base)).toBe(325); // 6500 / 20
  });

  it('marks risk as danger when daily allowance < ₹100', () => {
    const broke = { ...base, spent: 9500, daysRemaining: 20 };
    expect(getRiskLevel(broke)).toBe('danger');
  });

  it('marks risk as caution between ₹100 and ₹200/day', () => {
    const tight = { ...base, spent: 7000, daysRemaining: 20 };
    expect(getRiskLevel(tight)).toBe('caution');
  });

  it('never returns negative balance floor', () => {
    const overspent = { ...base, spent: 15000 };
    expect(getAvailableBalance(overspent)).toBeGreaterThanOrEqual(0);
  });

  it('health score is always bounded 0-100', () => {
    const score = calculateHealthScore(base);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
