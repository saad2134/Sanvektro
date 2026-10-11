import React from 'react';
import { useSimulator } from '../../hooks/useSimulator';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBudgetStore } from '../../store/budgetStore';
import { DecisionCard } from './DecisionCard';
import { ImpactPreview } from './ImpactPreview';
import { ConsequenceList } from './ConsequenceList';

export const Simulator: React.FC = () => {
  const simulator = useSimulator();
  const { subscriptions } = useSubscriptions();
  const daysRemaining = useBudgetStore((state) => state.daysRemaining);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <DecisionCard
        decision={simulator.decision}
        onAmountChange={simulator.setAmount}
        onCategoryChange={simulator.setCategory}
        onDescriptionChange={simulator.setDescription}
        onApplyPreset={simulator.applyPreset}
      />

      <div className="space-y-6">
        <ImpactPreview
          currentBalance={simulator.currentBalance}
          currentDailyAllowance={simulator.currentDailyAllowance}
          currentHealthScore={simulator.currentHealthScore}
          currentRisk={simulator.currentRisk}
          simulationResult={simulator.simulationResult}
          onCommit={simulator.commitSimulation}
        />

        <ConsequenceList
          simulationResult={simulator.simulationResult}
          subscriptions={subscriptions}
          daysRemaining={daysRemaining}
        />
      </div>
    </div>
  );
};

export default Simulator;
