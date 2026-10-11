import { describe, it, expect } from 'vitest';
import { 
  calculateMetrics, 
  calculateConsequenceDiff, 
  generateTrajectoryPoints 
} from '../utils/calculations';
import { DEFAULT_HOSTEL_HUSTLER } from '../data/presets';
import type { FinancialState, SimulationDraft } from '../types/finance';

describe('Sanvektro Financial Calculations Engine', () => {
  it('correctly initializes ₹10,000 baseline budget', () => {
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    expect(DEFAULT_HOSTEL_HUSTLER.startingBudget).toBe(10000);
    expect(metrics.balance).toBeGreaterThan(0);
    expect(metrics.balance).toBeLessThan(10000); // reduced by realized transactions and paid commitments
  });

  it('calculates daily safe burn allowance across remaining days', () => {
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const remainingDays = 30 - DEFAULT_HOSTEL_HUSTLER.currentDay + 1; // 20 days
    expect(remainingDays).toBe(20);
    expect(metrics.dailyAllowance).toBeGreaterThan(0);
  });

  it('calculates accurate consequence diff when simulating an expense', () => {
    const baseline = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const draft: SimulationDraft = {
      title: 'Swiggy Dinner Treat',
      amount: 500,
      category: 'Food & Dining',
      day: DEFAULT_HOSTEL_HUSTLER.currentDay
    };

    const simulated = calculateMetrics(DEFAULT_HOSTEL_HUSTLER, draft);
    const diff = calculateConsequenceDiff(baseline, simulated, draft.amount);

    expect(simulated.balance).toBe(baseline.balance - 500);
    expect(diff.balanceDelta).toBe(-500);
    expect(diff.allowanceDelta).toBeLessThanOrEqual(0);
    expect(diff.healthScoreDelta).toBeLessThanOrEqual(0);
    expect(diff.tradeOffSummary).toContain('Consumes');
  });

  it('generates 30 trajectory forecast points spanning Day 1 to Day 30', () => {
    const points = generateTrajectoryPoints(DEFAULT_HOSTEL_HUSTLER);
    expect(points).toHaveLength(30);
    expect(points[0].day).toBe(1);
    expect(points[29].day).toBe(30);
    expect(points[0].projectedBalance).toBeGreaterThan(0);
  });

  it('triggers critical risk classification when balance depletes before Day 28', () => {
    const strainedState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      currentDay: 5,
      startingBudget: 10000,
      emergencyBuffer: 500,
      inflows: [],
      commitments: [
        { id: 'c1', name: 'Huge Rent', amount: 8500, dueDay: 6, category: 'Housing', isPaid: false, essential: true }
      ],
      subscriptions: [],
      savingsGoals: [],
      transactions: [
        { id: 't1', title: 'Heavy Spend', amount: 2000, day: 2, category: 'Food & Dining' }
      ]
    };

    const metrics = calculateMetrics(strainedState);
    expect(metrics.riskLevel).toBe('CRITICAL');
    expect(metrics.runwayDepletionDay).not.toBeNull();
  });
});
