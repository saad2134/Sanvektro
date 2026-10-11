/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import type { ProposedDecision, SimulationResult } from '../types';
import { simulateDecision } from '../lib/simulator-engine';

export function useSimulator() {
  const store = useBudgetStore();
  const [decision, setDecision] = useState<ProposedDecision>({
    amount: 1500,
    category: 'Entertainment',
    description: 'Weekend Concert & Dining',
  });

  const budgetSnapshot = useMemo(() => ({
    totalBudget: store.totalBudget,
    startDate: store.startDate,
    daysPassed: store.daysPassed,
    daysRemaining: store.daysRemaining,
    spent: store.spent,
    committed: store.committed,
    savedToGoals: store.savedToGoals,
    availableBalance: store.availableBalance,
    dailyAllowance: store.dailyAllowance,
    healthScore: store.healthScore,
    riskLevel: store.riskLevel,
  }), [
    store.totalBudget,
    store.startDate,
    store.spent,
    store.committed,
    store.savedToGoals,
    store.daysPassed,
    store.daysRemaining,
    store.availableBalance,
    store.dailyAllowance,
    store.healthScore,
    store.riskLevel,
  ]);

  const simulationResult = useMemo<SimulationResult>(() => {
    return simulateDecision(budgetSnapshot, decision, store.goals);
  }, [budgetSnapshot, decision, store.goals]);

  const setAmount = useCallback((amount: number) => {
    setDecision((prev) => ({ ...prev, amount: Math.max(0, Math.min(10000, amount)) }));
  }, []);

  const setCategory = useCallback((category: ProposedDecision['category']) => {
    setDecision((prev) => ({ ...prev, category }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setDecision((prev) => ({ ...prev, description }));
  }, []);

  const applyPreset = useCallback((preset: { amount: number; category: ProposedDecision['category']; title: string }) => {
    setDecision({
      amount: preset.amount,
      category: preset.category,
      description: preset.title,
    });
  }, []);

  const commitSimulation = useCallback(async () => {
    if (!simulationResult.safeToCommit || decision.amount <= 0) return false;
    await store.addExpense({
      amount: decision.amount,
      category: decision.category,
      description: decision.description || 'Simulated Expense',
      date: new Date(),
      isRecurring: false,
      tags: ['simulated-decision'],
    });
    return true;
  }, [simulationResult.safeToCommit, decision, store]);

  return {
    decision,
    simulationResult,
    setAmount,
    setCategory,
    setDescription,
    applyPreset,
    commitSimulation,
    currentBalance: budgetSnapshot.availableBalance,
    currentDailyAllowance: budgetSnapshot.dailyAllowance,
    currentHealthScore: budgetSnapshot.healthScore,
    currentRisk: budgetSnapshot.riskLevel,
  };
}
