/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import type { BudgetState } from '../../types';
import { simulateDecision } from '../simulator-engine';

describe('Simulator Engine ✦ Pre-Spend Sandbox Invariants', () => {
  const mockState: BudgetState = {
    totalBudget: 10000,
    startDate: new Date(),
    spent: 2000,
    committed: 1000,
    savedToGoals: 500,
    availableBalance: 6500,
    dailyAllowance: 325,
    daysRemaining: 20,
    daysPassed: 10,
    healthScore: 82,
    riskLevel: 'safe',
  };

  const tightState: BudgetState = {
    ...mockState,
    spent: 7000,
    availableBalance: 1500,
    dailyAllowance: 75,
  };

  it('shows correct balance after simulated expense', () => {
    const result = simulateDecision(mockState, { amount: 500, category: 'Food', description: 'Lunch' });
    expect(result.impact.balanceDelta).toBe(-500);
  });

  it('generates warning when simulation depletes below ₹100/day', () => {
    const result = simulateDecision(tightState, { amount: 3000, category: 'Shopping', description: 'Large buy' });
    expect(
      result.impact.warnings.some((w) => /run out|danger|risk/i.test(w))
    ).toBe(true);
  });

  it('marks safeToCommit false when balance would exceed available runway', () => {
    const result = simulateDecision(mockState, { amount: 999999, category: 'Shopping', description: 'Excess' });
    expect(result.safeToCommit).toBe(false);
  });

  it('simulation is a pure function and never mutates input state', () => {
    const stateBefore = JSON.stringify(mockState);
    simulateDecision(mockState, { amount: 500, category: 'Food', description: 'Meal' });
    expect(JSON.stringify(mockState)).toBe(stateBefore);
  });
});
