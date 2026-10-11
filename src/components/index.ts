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
export { Header } from './Header';
export { MetricCards } from './MetricCards';
export { CapitalAllocationBar } from './CapitalAllocationBar';
export { DeficitAlertBanner } from './DeficitAlertBanner';
export { TimelineScrubber } from './TimelineScrubber';
export { DecisionSimulator } from './DecisionSimulator';
export { TrajectoryChart } from './TrajectoryChart';
export { CategoryBreakdown } from './CategoryBreakdown';
export { CommitmentsList } from './CommitmentsList';
export { SubscriptionsManager } from './SubscriptionsManager';
export { SavingsGoals } from './SavingsGoals';
export { ShockRoulette } from './ShockRoulette';
export { OptimizationInsights } from './OptimizationInsights';
export { TransactionLedger } from './TransactionLedger';
export { TheLens } from './TheLens';

// Specialized Dialogs & Diagnostic Modals
export { ErrorBoundary } from './ErrorBoundary';
export { HealthAuditModal } from './HealthAuditModal';
export { MonthEndReportCardModal } from './MonthEndReportCardModal';
export { OnboardingTourModal } from './OnboardingTourModal';
export { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
export { SanvektroCoachModal } from './SanvektroCoachModal';
export { CommandPalette } from './CommandPalette';
export { HowItEvaluatesModal } from './HowItEvaluatesModal';
