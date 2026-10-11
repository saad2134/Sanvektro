/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export all core domain finance types
export * from './finance';

// Also export FlowFi/FAIE canonical type aliases for static architecture compliance
export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Subscriptions'
  | 'Savings'
  | 'Other';

export type RiskLevel = 'safe' | 'caution' | 'danger';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  isRecurring: boolean;
  tags: string[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  dailyRequired: number;
  percentComplete: number;
  onTrack: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDate: number;
  category: string;
  isActive: boolean;
  nextDue: Date;
}

export interface BudgetState {
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
}

export interface ProposedDecision {
  amount: number;
  category: ExpenseCategory;
  description: string;
  isRecurring?: boolean;
}

export interface GoalImpact {
  goalId: string;
  goalName: string;
  previousDailyRequired: number;
  newDailyRequired: number;
  daysDelayed: number;
  stillOnTrack?: boolean;
}

export interface SimulationResult {
  decision?: ProposedDecision;
  impact?: any;
  previousBalance: number;
  newBalance: number;
  previousDailyAllowance: number;
  newDailyAllowance: number;
  dailyAllowanceReduction: number;
  previousRiskLevel: RiskLevel;
  newRiskLevel: RiskLevel;
  safeToCommit: boolean;
  riskMessage: string;
  goalImpacts: GoalImpact[];
  runwayDaysLost: number;
  previousHealthScore: number;
  newHealthScore: number;
  healthScoreDelta: number;
}
