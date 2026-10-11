/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { TrajectoryChart, TransactionLedger, ShockRoulette } from '../../components';
import { SpendingHeatmap } from '../../components/cockpit/SpendingHeatmap';
import { TrendingUp, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  generateTrajectoryPoints,
  calculateDailySpendHeatmap
} from '../../utils/calculations';
import type { ExpenseCategory } from '../../types/finance';

export const ForecastPage: React.FC = () => {
  const store = useBudgetStore();
  const {
    financialState,
    simulationDraft,
    setCurrentDay,
    deleteTransaction,
    addTransaction
  } = store;

  const trajectoryPoints = generateTrajectoryPoints(financialState, simulationDraft);
  const heatmapPoints = calculateDailySpendHeatmap(financialState);

  const endDayPoint = trajectoryPoints[trajectoryPoints.length - 1];
  const projectedSurplus: number = endDayPoint ? (endDayPoint.actualBalance ?? endDayPoint.projectedBalance ?? 0) : 0;
  const isSolvent = projectedSurplus >= 0;

  const handleApplyShock = (title: string, amount: number, category: ExpenseCategory) => {
    addTransaction({
      title,
      amount,
      day: financialState.currentDay,
      category
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" data-testid="forecast-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>30-Day Forward Trajectory & Stress-Testing Forecast</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive modeling of historical cash velocity, upcoming scheduled auto-debits, and
            month-end solvency margins.
          </p>
        </div>
      </div>

      {/* Projection Status Banner */}
      <div
        className={`rounded-2xl p-6 border flex flex-wrap items-center justify-between gap-4 ${
          isSolvent
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 aspect-square rounded-2xl flex items-center justify-center ${
              isSolvent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isSolvent ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projected Day-30 Solvency
            </div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                isSolvent ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isSolvent ? '+' : ''}₹{projectedSurplus.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Tracking Day {financialState.currentDay} of 30</span>
        </div>
      </div>

      {/* 30-Day Trajectory Curve */}
      <TrajectoryChart
        points={trajectoryPoints}
        currentDay={financialState.currentDay}
        isSimulating={simulationDraft !== null && simulationDraft.amount > 0}
      />

      {/* 30-Day Spending Intensity Matrix */}
      <SpendingHeatmap
        points={heatmapPoints}
        currentDay={financialState.currentDay}
        onSelectDay={setCurrentDay}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <TransactionLedger
            transactions={financialState.transactions}
            currentDay={financialState.currentDay}
            onDeleteTransaction={deleteTransaction}
            onAddManualTransaction={(t: any) => addTransaction({
              title: t.title,
              amount: t.amount,
              day: t.day,
              category: t.category
            })}
          />
        </div>

        <div className="lg:col-span-4">
          <ShockRoulette
            emergencyBuffer={financialState.emergencyBuffer}
            onApplyShock={handleApplyShock}
          />
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
