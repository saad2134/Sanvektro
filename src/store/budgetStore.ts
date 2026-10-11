/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import type {
  FinancialState,
  SimulationDraft,
  Transaction,
  ExpenseCategory as NativeExpenseCategory,
  ConsequenceMetrics
} from '../types/finance';
import type {
  Expense,
  SavingsGoal,
  Subscription,
  BudgetState,
  RiskLevel
} from '../types';
import {
  DEFAULT_HOSTEL_HUSTLER,
  TECH_INTERN_PRESET,
  FREELANCE_CREATIVE_PRESET
} from '../data/presets';
import {
  calculateMetrics,
  CATEGORY_BUDGET_CAPS,
  safeAdd,
  safeSub
} from '../utils/calculations';

export type AppTab = 'dashboard' | 'simulate' | 'goals' | 'subscriptions' | 'forecast';

export interface BudgetStoreState {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;

  // Sanvektro Cockpit State
  financialState: FinancialState;
  simulationDraft: SimulationDraft | null;
  activePersona: 'hostel-hustler' | 'tech-intern' | 'freelance-creative';
  categoryCaps: Record<NativeExpenseCategory, number>;
  baselineMetrics: ConsequenceMetrics;
  simulatedMetrics: ConsequenceMetrics;

  // FlowFi & FAIE Contract State
  totalBudget: number;
  startDate: Date;
  daysPassed: number;
  daysRemaining: number;
  spent: number;
  committed: number;
  savedToGoals: number;
  availableBalance: number;
  dailyAllowance: number;
  healthScore: number;
  riskLevel: RiskLevel;
  expenses: Expense[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];

  // Actions
  setCurrentDay: (day: number) => void;
  setSimulationDraft: (draft: SimulationDraft | null) => void;
  commitSimulationDraft: () => void;
  discardSimulationDraft: () => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  toggleCommitment: (id: string) => void;
  toggleSubscription: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => boolean;
  withdrawFromGoal: (id: string, amount: number) => boolean;
  setCategoryCap: (category: NativeExpenseCategory, amount: number) => void;
  applyPersonaPreset: (presetId: 'hostel-hustler' | 'tech-intern' | 'freelance-creative') => void;
  resetToInitialState: () => void;

  // FlowFi Actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  deleteExpense: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'dailyRequired' | 'percentComplete' | 'onTrack'>) => void;
  deleteGoal: (goalId: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id' | 'nextDue'>) => void;
  deleteSubscription: (id: string) => void;
  setDaysPassed: (days: number) => void;
  resetToInitialDemo: () => void;
  resetCleanSlate: () => void;
  getBudgetSnapshot: () => BudgetState;
}

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    amount: 450,
    category: 'Food',
    description: 'Boba tea & gourmet burger',
    date: new Date(Date.now() - 7 * 86400000),
    isRecurring: false,
    tags: ['dining', 'weekend'],
  },
  {
    id: 'exp-2',
    amount: 280,
    category: 'Transport',
    description: 'Uber ride across town',
    date: new Date(Date.now() - 5 * 86400000),
    isRecurring: false,
    tags: ['commute'],
  },
  {
    id: 'exp-3',
    amount: 620,
    category: 'Entertainment',
    description: 'IMAX 3D cinema tickets',
    date: new Date(Date.now() - 3 * 86400000),
    isRecurring: false,
    tags: ['hangout'],
  },
  {
    id: 'exp-4',
    amount: 350,
    category: 'Food',
    description: 'Artisan roast coffee & bakery',
    date: new Date(Date.now() - 2 * 86400000),
    isRecurring: false,
    tags: ['cafe'],
  },
  {
    id: 'exp-5',
    amount: 300,
    category: 'Shopping',
    description: 'Tech accessories & cables',
    date: new Date(Date.now() - 1 * 86400000),
    isRecurring: false,
    tags: ['supplies'],
  },
];

const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Goa Trip with Squad',
    targetAmount: 3000,
    savedAmount: 500,
    deadline: new Date(Date.now() + 25 * 86400000),
    dailyRequired: 125,
    percentComplete: 16.7,
    onTrack: true,
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Spotify Premium Student',
    amount: 119,
    billingDate: 15,
    category: 'Subscriptions',
    isActive: true,
    nextDue: new Date(Date.now() + 5 * 86400000),
  },
  {
    id: 'sub-2',
    name: 'GitHub Copilot Individual',
    amount: 881,
    billingDate: 22,
    category: 'Subscriptions',
    isActive: true,
    nextDue: new Date(Date.now() + 12 * 86400000),
  },
];

const computeMetricsPair = (state: FinancialState, draft: SimulationDraft | null) => {
  const baseline = calculateMetrics(state, null);
  const simulated = draft ? calculateMetrics(state, draft) : baseline;
  return { baselineMetrics: baseline, simulatedMetrics: simulated };
};

export const useBudgetStore = create<BudgetStoreState>((set, get) => {
  const initialFinancialState = DEFAULT_HOSTEL_HUSTLER;
  const initialMetrics = computeMetricsPair(initialFinancialState, null);

  const calculateDerived = (
    expenses: Expense[],
    goals: SavingsGoal[],
    subs: Subscription[],
    daysPassed: number
  ) => {
    const totalBudget = 10000;
    const spent = expenses.reduce((acc, e) => acc + e.amount, 0);
    const committed = subs.filter((s) => s.isActive).reduce((acc, s) => acc + s.amount, 0);
    const savedToGoals = goals.reduce((acc, g) => acc + g.savedAmount, 0);
    const availableBalance = Math.max(0, totalBudget - spent - committed - savedToGoals);
    const daysRemaining = Math.max(1, 30 - daysPassed);
    const dailyAllowance = Math.round((availableBalance / daysRemaining) * 100) / 100;
    const riskLevel: RiskLevel = dailyAllowance < 100 ? 'danger' : dailyAllowance < 200 ? 'caution' : 'safe';
    const healthScore = Math.min(100, Math.max(20, Math.round(85 - (spent / totalBudget) * 30)));

    return {
      totalBudget,
      daysPassed,
      daysRemaining,
      spent,
      committed,
      savedToGoals,
      availableBalance,
      dailyAllowance,
      healthScore,
      riskLevel,
    };
  };

  const initialDerived = calculateDerived(INITIAL_EXPENSES, INITIAL_GOALS, INITIAL_SUBSCRIPTIONS, 10);

  return {
    currentTab: 'dashboard',
    setCurrentTab: (tab) => set({ currentTab: tab }),

    financialState: initialFinancialState,
    simulationDraft: null,
    activePersona: 'hostel-hustler',
    categoryCaps: { ...CATEGORY_BUDGET_CAPS },
    baselineMetrics: initialMetrics.baselineMetrics,
    simulatedMetrics: initialMetrics.simulatedMetrics,

    // FlowFi State
    startDate: new Date(),
    ...initialDerived,
    expenses: INITIAL_EXPENSES,
    goals: INITIAL_GOALS,
    subscriptions: INITIAL_SUBSCRIPTIONS,

    setCurrentDay: (day) => {
      const state = get().financialState;
      const nextState = { ...state, currentDay: day };
      set({
        financialState: nextState,
        daysPassed: day,
        daysRemaining: Math.max(1, 30 - day),
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    setSimulationDraft: (draft) => {
      set({
        simulationDraft: draft,
        ...computeMetricsPair(get().financialState, draft)
      });
    },

    commitSimulationDraft: () => {
      const draft = get().simulationDraft;
      if (!draft) return;

      const state = get().financialState;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: draft.title,
        amount: draft.amount,
        day: draft.day,
        category: draft.category
      };

      const nextState: FinancialState = {
        ...state,
        transactions: [...state.transactions, newTx]
      };

      set({
        financialState: nextState,
        simulationDraft: null,
        ...computeMetricsPair(nextState, null)
      });
    },

    discardSimulationDraft: () => {
      set({
        simulationDraft: null,
        ...computeMetricsPair(get().financialState, null)
      });
    },

    addTransaction: (tx) => {
      const state = get().financialState;
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}`
      };
      const nextState: FinancialState = {
        ...state,
        transactions: [newTx, ...state.transactions]
      };
      set({
        financialState: nextState,
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    deleteTransaction: (id) => {
      const state = get().financialState;
      const nextState: FinancialState = {
        ...state,
        transactions: state.transactions.filter(t => t.id !== id)
      };
      set({
        financialState: nextState,
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    editTransaction: (id, updates) => {
      const state = get().financialState;
      const nextState: FinancialState = {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        )
      };
      set({
        financialState: nextState,
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    toggleCommitment: (id) => {
      const state = get().financialState;
      const nextState: FinancialState = {
        ...state,
        commitments: state.commitments.map(c =>
          c.id === id ? { ...c, isPaid: !c.isPaid } : c
        )
      };
      set({
        financialState: nextState,
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    toggleSubscription: (id) => {
      const state = get().financialState;
      const nextState: FinancialState = {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === id ? { ...s, isActive: !s.isActive } : s
        )
      };
      const updatedSubs = get().subscriptions.map(s =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      );
      set({
        financialState: nextState,
        subscriptions: updatedSubs,
        ...calculateDerived(get().expenses, get().goals, updatedSubs, get().daysPassed),
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
    },

    contributeToGoal: (id, amount) => {
      const state = get().financialState;
      const goal = state.savingsGoals.find(g => g.id === id);
      if (!goal || amount <= 0 || state.startingBudget < amount) return false;

      const nextState: FinancialState = {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === id ? { ...g, currentAmount: safeAdd(g.currentAmount, amount) } : g
        ),
        startingBudget: safeSub(state.startingBudget, amount)
      };

      const updatedGoals = get().goals.map(g =>
        g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g
      );

      set({
        financialState: nextState,
        goals: updatedGoals,
        ...calculateDerived(get().expenses, updatedGoals, get().subscriptions, get().daysPassed),
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
      return true;
    },

    withdrawFromGoal: (id, amount) => {
      const state = get().financialState;
      const goal = state.savingsGoals.find(g => g.id === id);
      if (!goal || amount <= 0 || goal.currentAmount < amount) return false;

      const nextState: FinancialState = {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === id ? { ...g, currentAmount: safeSub(g.currentAmount, amount) } : g
        ),
        startingBudget: safeAdd(state.startingBudget, amount)
      };

      set({
        financialState: nextState,
        ...computeMetricsPair(nextState, get().simulationDraft)
      });
      return true;
    },

    setCategoryCap: (category, amount) => {
      set(prev => ({
        categoryCaps: {
          ...prev.categoryCaps,
          [category]: Math.max(0, amount)
        }
      }));
    },

    applyPersonaPreset: (presetId) => {
      const map = {
        'hostel-hustler': DEFAULT_HOSTEL_HUSTLER,
        'tech-intern': TECH_INTERN_PRESET,
        'freelance-creative': FREELANCE_CREATIVE_PRESET
      };
      const presetState = map[presetId] || DEFAULT_HOSTEL_HUSTLER;
      set({
        financialState: presetState,
        activePersona: presetId,
        simulationDraft: null,
        ...computeMetricsPair(presetState, null)
      });
    },

    resetToInitialState: () => {
      const state = DEFAULT_HOSTEL_HUSTLER;
      set({
        financialState: state,
        simulationDraft: null,
        activePersona: 'hostel-hustler',
        categoryCaps: { ...CATEGORY_BUDGET_CAPS },
        ...computeMetricsPair(state, null)
      });
    },

    // FlowFi Actions
    addExpense: async (expenseData) => {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...expenseData,
      };
      const updated = [newExpense, ...get().expenses];
      set({
        expenses: updated,
        ...calculateDerived(updated, get().goals, get().subscriptions, get().daysPassed),
      });
      return newExpense;
    },

    deleteExpense: (id) => {
      const updated = get().expenses.filter((e) => e.id !== id);
      set({
        expenses: updated,
        ...calculateDerived(updated, get().goals, get().subscriptions, get().daysPassed),
      });
    },

    addGoal: (goalData) => {
      const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        ...goalData,
        dailyRequired: Math.round(goalData.targetAmount / 30),
        percentComplete: Math.round((goalData.savedAmount / goalData.targetAmount) * 100),
        onTrack: true,
      };
      const updated = [...get().goals, newGoal];
      set({
        goals: updated,
        ...calculateDerived(get().expenses, updated, get().subscriptions, get().daysPassed),
      });
    },

    deleteGoal: (goalId) => {
      const updated = get().goals.filter((g) => g.id !== goalId);
      set({
        goals: updated,
        ...calculateDerived(get().expenses, updated, get().subscriptions, get().daysPassed),
      });
    },

    addSubscription: (subData) => {
      const newSub: Subscription = {
        id: `sub-${Date.now()}`,
        ...subData,
        nextDue: new Date(Date.now() + 10 * 86400000),
      };
      const updated = [...get().subscriptions, newSub];
      set({
        subscriptions: updated,
        ...calculateDerived(get().expenses, get().goals, updated, get().daysPassed),
      });
    },

    deleteSubscription: (id) => {
      const updated = get().subscriptions.filter((s) => s.id !== id);
      set({
        subscriptions: updated,
        ...calculateDerived(get().expenses, get().goals, updated, get().daysPassed),
      });
    },

    setDaysPassed: (days) => {
      const clamped = Math.max(0, Math.min(30, days));
      set({
        ...calculateDerived(get().expenses, get().goals, get().subscriptions, clamped),
      });
    },

    resetToInitialDemo: () => {
      const derived = calculateDerived(INITIAL_EXPENSES, INITIAL_GOALS, INITIAL_SUBSCRIPTIONS, 10);
      set({
        expenses: INITIAL_EXPENSES,
        goals: INITIAL_GOALS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        financialState: DEFAULT_HOSTEL_HUSTLER,
        activePersona: 'hostel-hustler',
        simulationDraft: null,
        ...derived,
      });
    },

    resetCleanSlate: () => {
      const derived = calculateDerived([], [], [], 0);
      set({
        expenses: [],
        goals: [],
        subscriptions: [],
        ...derived,
      });
    },

    getBudgetSnapshot: () => {
      const s = get();
      return {
        totalBudget: s.totalBudget,
        startDate: s.startDate,
        daysPassed: s.daysPassed,
        daysRemaining: s.daysRemaining,
        spent: s.spent,
        committed: s.committed,
        savedToGoals: s.savedToGoals,
        availableBalance: s.availableBalance,
        dailyAllowance: s.dailyAllowance,
        healthScore: s.healthScore,
        riskLevel: s.riskLevel,
      };
    },
  };
});
