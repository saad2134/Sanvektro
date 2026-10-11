/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BudgetState, Expense, SavingsGoal, Subscription } from '../types';
import { BudgetStateSchema } from './validators';

export const STORAGE_VERSION = '1.0';
export const STORAGE_KEY = 'sanvektro_data';
export const FULL_STORAGE_KEY = 'sanvektro_full_store_v1';

export interface StoragePayload<T> {
  version: string;
  timestamp: number;
  data: T;
}

export interface FullAppPersistedState {
  budgetState: BudgetState;
  expenses: Expense[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
}

export function saveToStorage(data: BudgetState): void {
  try {
    const payload: StoragePayload<BudgetState> = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Storage failed ✦ data not persisted:', e);
  }
}

export function loadFromStorage(): BudgetState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const parsed = BudgetStateSchema.parse(payload.data);
    return {
      ...parsed,
      startDate: new Date(parsed.startDate),
    } as BudgetState;
  } catch {
    return null;
  }
}

export function saveFullAppState(state: FullAppPersistedState): void {
  try {
    const payload: StoragePayload<FullAppPersistedState> = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: state,
    };
    localStorage.setItem(FULL_STORAGE_KEY, JSON.stringify(payload));
    saveToStorage(state.budgetState);
  } catch (e) {
    console.warn('Full storage persistence failed:', e);
  }
}

export function loadFullAppState(): FullAppPersistedState | null {
  try {
    const raw = localStorage.getItem(FULL_STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.version !== STORAGE_VERSION) {
      localStorage.removeItem(FULL_STORAGE_KEY);
      return null;
    }
    const data = payload.data as FullAppPersistedState;
    return {
      budgetState: {
        ...data.budgetState,
        startDate: new Date(data.budgetState.startDate),
      },
      expenses: data.expenses.map((e) => ({ ...e, date: new Date(e.date) })),
      goals: data.goals.map((g) => ({ ...g, deadline: new Date(g.deadline) })),
      subscriptions: data.subscriptions.map((s) => ({ ...s, nextDue: new Date(s.nextDue) })),
    };
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FULL_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
}
