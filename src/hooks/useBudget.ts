/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import type { ExpenseCategory } from '../types';
import { CATEGORIES } from '../constants/categories';

export interface CategorySummary {
  category: ExpenseCategory;
  name: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
}

export function useBudget() {
  const store = useBudgetStore();

  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, { total: number; count: number }>();

    for (const exp of store.expenses) {
      const existing = map.get(exp.category) || { total: 0, count: 0 };
      map.set(exp.category, {
        total: existing.total + exp.amount,
        count: existing.count + 1,
      });
    }

    const totalSpent = store.spent || 1;
    const summaries: CategorySummary[] = [];

    for (const [catKey, meta] of Object.entries(CATEGORIES) as [ExpenseCategory, typeof CATEGORIES[ExpenseCategory]][]) {
      const data = map.get(catKey) || { total: 0, count: 0 };
      const percentage = Math.round((data.total / totalSpent) * 1000) / 10;
      summaries.push({
        category: catKey,
        name: meta.name,
        total: data.total,
        count: data.count,
        percentage,
        color: meta.color,
        bgColor: meta.bgColor,
        borderColor: meta.borderColor,
        accentHex: meta.accentHex,
      });
    }

    return summaries.sort((a, b) => b.total - a.total);
  }, [store.expenses, store.spent]);

  const activeCategoryBreakdown = useMemo(() => {
    return categoryBreakdown.filter((c) => c.total > 0);
  }, [categoryBreakdown]);

  return {
    totalBudget: store.totalBudget,
    daysPassed: store.daysPassed,
    daysRemaining: store.daysRemaining,
    spent: store.spent,
    committed: store.committed,
    savedToGoals: store.savedToGoals,
    availableBalance: store.availableBalance,
    dailyAllowance: store.dailyAllowance,
    healthScore: store.healthScore,
    riskLevel: store.riskLevel,
    expenses: store.expenses,
    categoryBreakdown,
    activeCategoryBreakdown,
    addExpense: store.addExpense,
    deleteExpense: store.deleteExpense,
    setDaysPassed: store.setDaysPassed,
    resetToInitialDemo: store.resetToInitialDemo,
    resetCleanSlate: store.resetCleanSlate,
    getBudgetSnapshot: store.getBudgetSnapshot,
  };
}
