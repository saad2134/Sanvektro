import { BudgetState, Subscription } from '../types';
import { safeSub } from './budget-engine';

export interface DayForecastPoint {
  day: number;
  label: string;
  actualBalance?: number;
  projectedBalance: number;
  projectedBurn: number;
  subscriptionsDue: string[];
  isToday: boolean;
}

export function generateForecast(
  state: BudgetState,
  subscriptions: Subscription[] = []
): DayForecastPoint[] {
  const points: DayForecastPoint[] = [];
  const daysPassed = state.daysPassed;
  const avgDailySpentSoFar = daysPassed > 0 ? state.spent / daysPassed : 0;
  const currentDailyAllowance = state.dailyAllowance;

  let simulatedBalance = state.availableBalance;

  for (let day = 1; day <= 30; day++) {
    // Check for subscriptions due on this calendar day of the cycle
    const dueSubs = subscriptions.filter((s) => s.isActive && s.billingDate === day);
    const subCost = dueSubs.reduce((acc, curr) => acc + curr.amount, 0);

    if (day <= daysPassed) {
      // Historical actual / estimated pacing
      const pastSpent = avgDailySpentSoFar * day;
      const actual = Math.max(0, state.totalBudget - pastSpent - (state.savedToGoals * (day / 30)));

      points.push({
        day,
        label: `Day ${day}`,
        actualBalance: Math.round(actual),
        projectedBalance: Math.round(actual),
        projectedBurn: Math.round(avgDailySpentSoFar),
        subscriptionsDue: dueSubs.map((s) => `${s.name} (₹${s.amount})`),
        isToday: day === daysPassed,
      });
    } else {
      // Future projection
      // Deduct daily allowance pace plus any scheduled subscription that day
      simulatedBalance = safeSub(simulatedBalance, currentDailyAllowance + subCost);

      points.push({
        day,
        label: `Day ${day}`,
        projectedBalance: Math.round(simulatedBalance),
        projectedBurn: Math.round(currentDailyAllowance + subCost),
        subscriptionsDue: dueSubs.map((s) => `${s.name} (₹${s.amount})`),
        isToday: false,
      });
    }
  }

  return points;
}
