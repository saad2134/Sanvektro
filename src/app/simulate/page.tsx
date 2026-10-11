/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { DecisionSimulator } from '../../components/DecisionSimulator';
import { OptimizationInsights } from '../../components/OptimizationInsights';
import { Sparkles, ArrowLeft } from 'lucide-react';
import {
  calculateConsequenceDiff,
  generateOptimizationTips
} from '../../utils/calculations';

interface SimulatePageProps {
  onBackToDashboard?: () => void;
}

export const SimulatePage: React.FC<SimulatePageProps> = ({ onBackToDashboard }) => {
  const store = useBudgetStore();
  const {
    financialState,
    simulationDraft,
    baselineMetrics,
    simulatedMetrics,
    setSimulationDraft,
    commitSimulationDraft
  } = store;

  const diff = simulationDraft
    ? calculateConsequenceDiff(baselineMetrics, simulatedMetrics, simulationDraft.amount, financialState)
    : null;

  const activeMetrics = simulationDraft ? simulatedMetrics : baselineMetrics;
  const optimizationTips = generateOptimizationTips(financialState, activeMetrics);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" data-testid="simulate-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>What-If Decision Simulator</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate financial ripples before you spend. Test purchases against your 30-day runway,
            velocity risk score, and locked savings goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
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
        </div>

        <div className="lg:col-span-4">
          <OptimizationInsights tips={optimizationTips} />
        </div>
      </div>
    </div>
  );
};

export default SimulatePage;
