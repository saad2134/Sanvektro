/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { calculateHealthScore } from '../lib/health-calculator';

export function useHealthScore() {
  const store = useBudgetStore();

  const score = useMemo(() => {
    return calculateHealthScore({
      totalBudget: store.totalBudget,
      spent: store.spent,
      availableBalance: store.availableBalance,
      savedToGoals: store.savedToGoals,
      committed: store.committed,
      daysPassed: store.daysPassed,
      daysRemaining: store.daysRemaining,
      dailyAllowance: store.dailyAllowance,
      goals: store.goals,
    });
  }, [
    store.totalBudget,
    store.spent,
    store.availableBalance,
    store.savedToGoals,
    store.committed,
    store.daysPassed,
    store.daysRemaining,
    store.dailyAllowance,
    store.goals,
  ]);

  const grade = score >= 85 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

  return {
    score,
    grade,
    riskLevel: store.riskLevel,
  };
}
