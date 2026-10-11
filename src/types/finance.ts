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
  dailyRequired?: number;
  projectedCompletionDay?: number | null;
  onTrack?: boolean;
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

export type HealthGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ConsequenceMetrics {
  balance: number;
  dailyAllowance: number;
  healthScore: number;
  letterGrade: HealthGrade;
  gradeDescriptor: string;
  weightedBurnVelocity: number;
  riskLevel: RiskLevel;
  runwayDepletionDay: number | null; // null if lasts through Day 30
  projectedDay30Balance: number;
  goalsAchievableCount: number;
  totalGoalsCount: number;
  shockResilienceScore: number; // 0-100
  isOverdraft: boolean;
  overdraftAmount: number;
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
  severity: 'NEGLIGIBLE' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  committedBillsBuffer: number;
  affectedGoals: {
    goalId: string;
    goalName: string;
    delayDays: number;
    stillOnTrack: boolean;
  }[];
}

export interface PersonaPreset {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  state: FinancialState;
}

export interface CapitalAllocation {
  totalCapital: number;
  spentToDate: number;
  lockedInGoals: number;
  reservedObligations: number;
  freeDiscretionary: number;
  spentPct: number;
  lockedPct: number;
  reservedPct: number;
  freePct: number;
}

export interface CategoryOutflow {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
  budgetCap: number;
  utilizationPct: number;
  isOverBudget: boolean;
  isNearBudget: boolean;
}

export interface ScenarioComparison {
  id: 'buy_now' | 'delay_14d' | 'smart_alt';
  title: string;
  tagline: string;
  description: string;
  amount: number;
  day: number;
  metrics: ConsequenceMetrics;
  diff: ConsequenceDiff;
  isRecommended?: boolean;
}

export interface PillarScore {
  name: string;
  score: number;
  maxScore: number;
  weightPct: number;
  status: string;
  description: string;
}

export interface HealthScoreAudit {
  overallScore: number;
  riskLevel: RiskLevel;
  pillars: {
    runway: PillarScore;
    commitments: PillarScore;
    allowance: PillarScore;
    resilience: PillarScore;
  };
  positiveHighlights: string[];
  riskWarnings: string[];
}

export interface OptimizationTip {
  id: string;
  title: string;
  type: 'SAVINGS' | 'SUBSCRIPTION' | 'DISCRETIONARY';
  impact: string;
  actionableText: string;
  evidence?: string;
  badge: string;
}

export interface DailyHeatmapPoint {
  day: number;
  amount: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  intensity: 'none' | 'low' | 'moderate' | 'high';
  transactionCount: number;
}

export interface SavingsLockboxRipple {
  currentDailyAllowance: number;
  simulatedDailyAllowance: number;
  allowanceDelta: number;
  remainingDays: number;
  lockedAmount: number;
  isSustainable: boolean;
}

