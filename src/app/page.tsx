/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { DeficitAlertBanner } from '../components/DeficitAlertBanner';
import { MetricCards } from '../components/MetricCards';
import { CapitalAllocationBar } from '../components/CapitalAllocationBar';
import { TimelineScrubber } from '../components/TimelineScrubber';
import { DecisionSimulator } from '../components/DecisionSimulator';
import { TrajectoryChart } from '../components/TrajectoryChart';
import { SpendingHeatmap } from '../components/SpendingHeatmap';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { TransactionLedger } from '../components/TransactionLedger';
import { OptimizationInsights } from '../components/OptimizationInsights';
import { SubscriptionsManager } from '../components/SubscriptionsManager';
import { SavingsGoals } from '../components/SavingsGoals';
import { ShockRoulette } from '../components/ShockRoulette';
import {
  calculateCapitalAllocation,
  calculateCategoryOutflow,
  generateOptimizationTips,
  generateTrajectoryPoints,
  calculateDailySpendHeatmap,
  calculateConsequenceDiff
} from '../utils/calculations';
import type { ExpenseCategory } from '../types/finance';

interface DashboardPageProps {
  onNavigateToSimulate?: () => void;
  onOpenAddExpense?: () => void;
  onOpenHealthAudit?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToSimulate,
  onOpenAddExpense: _onOpenAddExpense,
  onOpenHealthAudit
}) => {
  const store = useBudgetStore();
  const {
    financialState,
    simulationDraft,
    baselineMetrics,
    simulatedMetrics,
    setSimulationDraft,
    commitSimulationDraft,
    setCurrentDay,
    deleteTransaction,
    addTransaction,
    toggleSubscription,
    contributeToGoal,
    withdrawFromGoal
  } = store;

  const diff = simulationDraft
    ? calculateConsequenceDiff(baselineMetrics, simulatedMetrics, simulationDraft.amount, financialState)
    : null;

  const activeMetrics = simulationDraft ? simulatedMetrics : baselineMetrics;

  const capitalAllocation = calculateCapitalAllocation(financialState);
  const categoryOutflows = calculateCategoryOutflow(financialState);
  const totalRealizedSpend = financialState.transactions.reduce((acc, t) => acc + t.amount, 0);
  const optimizationTips = generateOptimizationTips(financialState, activeMetrics);
  const trajectoryPoints = generateTrajectoryPoints(financialState, simulationDraft);
  const heatmapPoints = calculateDailySpendHeatmap(financialState);

  const handleApplyShock = (title: string, amount: number, category: ExpenseCategory) => {
    addTransaction({
      title,
      amount,
      day: financialState.currentDay,
      category
    });
  };

  const handleDayChange = (action: number | ((prev: number) => number)) => {
    if (typeof action === 'function') {
      setCurrentDay(action(financialState.currentDay));
    } else {
      setCurrentDay(action);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" data-testid="dashboard-page">
      {/* 0. Dynamic Deficit Alert Banner */}
      <DeficitAlertBanner
        metrics={activeMetrics}
        state={financialState}
        onSolveInSimulator={onNavigateToSimulate || (() => {})}
      />

      {/* 1. Hero 4-Pillar Metric Cockpit */}
      <MetricCards
        metrics={activeMetrics}
        diff={diff}
        currentDay={financialState.currentDay}
        startingBudget={financialState.startingBudget}
        onOpenHealthAudit={onOpenHealthAudit}
      />

      {/* 2. 30-Day Capital Allocation Bar */}
      <CapitalAllocationBar
        allocation={capitalAllocation}
      />

      {/* 3. 30-Day Timeline Calendar Scrubber */}
      <TimelineScrubber
        currentDay={financialState.currentDay}
        onDayChange={handleDayChange}
        commitments={financialState.commitments}
        subscriptions={financialState.subscriptions}
        inflows={financialState.inflows}
      />

      {/* 4. Central 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Simulator, Curves & Ledger */}
        <div className="lg:col-span-7 space-y-6">
          <DecisionSimulator
            currentDay={financialState.currentDay}
            financialState={financialState}
            baselineMetrics={baselineMetrics}
            simulatedMetrics={simulatedMetrics}
            diff={diff}
            simulationDraft={simulationDraft}
            onUpdateDraft={setSimulationDraft}
            onCommitDraft={commitSimulationDraft}
          />

          <TrajectoryChart
            points={trajectoryPoints}
            currentDay={financialState.currentDay}
            isSimulating={simulationDraft !== null && simulationDraft.amount > 0}
          />

          <SpendingHeatmap
            points={heatmapPoints}
            currentDay={financialState.currentDay}
            onSelectDay={setCurrentDay}
          />

          <CategoryBreakdown
            outflows={categoryOutflows}
            totalSpent={totalRealizedSpend}
          />

          <TransactionLedger
            transactions={financialState.transactions}
            currentDay={financialState.currentDay}
            onDeleteTransaction={deleteTransaction}
            onAddManualTransaction={(t) => addTransaction({
              title: t.title,
              amount: t.amount,
              day: t.day,
              category: t.category
            })}
          />
        </div>

        {/* Right Column (5 cols): AI Optimization, Subscriptions, Goals & Shocks */}
        <div className="lg:col-span-5 space-y-6">
          <OptimizationInsights tips={optimizationTips} />

          <SubscriptionsManager
            subscriptions={financialState.subscriptions}
            onToggleSubscription={toggleSubscription}
            onAddSubscription={(newSub) => store.addSubscription(newSub as any)}
            currentDay={financialState.currentDay}
          />

          <SavingsGoals
            goals={financialState.savingsGoals}
            projectedSurplus={activeMetrics.projectedDay30Balance}
            financialState={financialState}
            onContributeGoal={contributeToGoal}
            onWithdrawGoal={withdrawFromGoal}
          />

          <ShockRoulette
            emergencyBuffer={financialState.emergencyBuffer}
            onApplyShock={handleApplyShock}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
