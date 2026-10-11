/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// UI Primitives
export * from './ui';

// Domain Packages (FlowFi Architecture)
export { BalanceCard } from './budget/BalanceCard';
export { BudgetRing } from './budget/BudgetRing';
export { DailyAllowance } from './budget/DailyAllowance';
export { SpendingBreakdown } from './budget/SpendingBreakdown';
export { AddExpenseModal } from './budget/AddExpenseModal';

export { CategoryPie } from './charts/CategoryPie';
export { ForecastLine } from './charts/ForecastLine';
export { SpendingHeatmap } from './charts/SpendingHeatmap';

export { AddGoalModal } from './goals/AddGoalModal';
export { GoalCard } from './goals/GoalCard';
export { GoalProgress } from './goals/GoalProgress';
export { GoalSimulator } from './goals/GoalSimulator';

export { HealthScore } from './health/HealthScore';
export { HealthTips } from './health/HealthTips';
export { RiskMeter } from './health/RiskMeter';

export { ConsequenceList } from './simulator/ConsequenceList';
export { DecisionCard } from './simulator/DecisionCard';
export { ImpactPreview } from './simulator/ImpactPreview';
export { Simulator } from './simulator/Simulator';

export { AddSubscriptionModal } from './subscriptions/AddSubscriptionModal';

// Sanvektro Cockpit Suite
export { Header } from './cockpit/Header';
export { MetricCards } from './cockpit/MetricCards';
export { CapitalAllocationBar } from './cockpit/CapitalAllocationBar';
export { DeficitAlertBanner } from './cockpit/DeficitAlertBanner';
export { TimelineScrubber } from './cockpit/TimelineScrubber';
export { DecisionSimulator } from './cockpit/DecisionSimulator';
export { TrajectoryChart } from './cockpit/TrajectoryChart';
export { CategoryBreakdown } from './cockpit/CategoryBreakdown';
export { CommitmentsList } from './cockpit/CommitmentsList';
export { SubscriptionsManager } from './cockpit/SubscriptionsManager';
export { SavingsGoals } from './cockpit/SavingsGoals';
export { ShockRoulette } from './cockpit/ShockRoulette';
export { OptimizationInsights } from './cockpit/OptimizationInsights';
export { TransactionLedger } from './cockpit/TransactionLedger';
export { ErrorBoundary } from './cockpit/ErrorBoundary';

// Specialized Dialogs & Diagnostic Modals
export { TheLens } from './modals/TheLens';
export { HealthAuditModal } from './modals/HealthAuditModal';
export { MonthEndReportCardModal } from './modals/MonthEndReportCardModal';
export { OnboardingTourModal } from './modals/OnboardingTourModal';
export { KeyboardShortcutsModal } from './modals/KeyboardShortcutsModal';
export { SanvektroCoachModal } from './modals/SanvektroCoachModal';
export { CommandPalette } from './modals/CommandPalette';
export { HowItEvaluatesModal } from './modals/HowItEvaluatesModal';
