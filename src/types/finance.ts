export type RiskLevel = 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';

export type ExpenseCategory = 
  | 'Food & Dining' 
  | 'Transit & Commute' 
  | 'Shopping & Quick-Commerce' 
  | 'Entertainment & Social' 
  | 'Academic & Tech' 
  | 'Health & Emergency'
  | 'Commitments'
  | 'Other';

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  isPaid: boolean;
  essential: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  category: string;
  isActive: boolean;
  iconName?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay: number;
  emoji: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  day: number;
  category: ExpenseCategory;
  isSimulated?: boolean;
  isUnexpected?: boolean;
}

export interface Inflow {
  id: string;
  title: string;
  amount: number;
  day: number;
}

export interface SimulationDraft {
  title: string;
  amount: number;
  category: ExpenseCategory;
  day: number;
}

export interface FinancialState {
  currentDay: number;
  startingBudget: number; // ₹10,000 baseline
  inflows: Inflow[];
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  emergencyBuffer: number;
}

export interface ConsequenceMetrics {
  balance: number;
  dailyAllowance: number;
  healthScore: number;
  riskLevel: RiskLevel;
  runwayDepletionDay: number | null; // null if lasts through Day 30
  projectedDay30Balance: number;
  goalsAchievableCount: number;
  totalGoalsCount: number;
  shockResilienceScore: number; // 0-100
}

export interface ConsequenceDiff {
  balanceDelta: number;
  allowanceDelta: number;
  healthScoreDelta: number;
  riskChanged: boolean;
  priorRisk: RiskLevel;
  newRisk: RiskLevel;
  runwayDeltaDays: number;
  impactVerdict: string;
  tradeOffSummary: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  state: FinancialState;
}
