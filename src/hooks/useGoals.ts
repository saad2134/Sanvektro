/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useBudgetStore } from '../store/budgetStore';

export function useGoals() {
  const goals = useBudgetStore((state) => state.goals);
  const savedToGoals = useBudgetStore((state) => state.savedToGoals);
  const availableBalance = useBudgetStore((state) => state.availableBalance);
  const addGoal = useBudgetStore((state) => state.addGoal);
  const contributeToGoal = useBudgetStore((state) => state.contributeToGoal);
  const deleteGoal = useBudgetStore((state) => state.deleteGoal);

  return {
    goals,
    savedToGoals,
    availableBalance,
    addGoal,
    contributeToGoal,
    deleteGoal,
  };
}
