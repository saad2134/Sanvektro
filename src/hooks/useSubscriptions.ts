/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useBudgetStore } from '../store/budgetStore';

export function useSubscriptions() {
  const subscriptions = useBudgetStore((state) => state.subscriptions);
  const committed = useBudgetStore((state) => state.committed);
  const addSubscription = useBudgetStore((state) => state.addSubscription);
  const toggleSubscription = useBudgetStore((state) => state.toggleSubscription);
  const deleteSubscription = useBudgetStore((state) => state.deleteSubscription);

  return {
    subscriptions,
    committed,
    addSubscription,
    toggleSubscription,
    deleteSubscription,
  };
}
