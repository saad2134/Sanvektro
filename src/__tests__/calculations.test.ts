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

  it('calculates 30-day capital allocation distribution', async () => {
    const { calculateCapitalAllocation } = await import('../utils/calculations');
    const allocation = calculateCapitalAllocation(DEFAULT_HOSTEL_HUSTLER);

    expect(allocation.totalCapital).toBe(11200);
    expect(allocation.spentToDate).toBeGreaterThan(0);
    expect(allocation.lockedInGoals).toBeGreaterThan(0);
    expect(allocation.spentPct + allocation.lockedPct + allocation.reservedPct + allocation.freePct).toBeGreaterThanOrEqual(95);
    expect(allocation.spentPct + allocation.lockedPct + allocation.reservedPct + allocation.freePct).toBeLessThanOrEqual(105);
  });

  it('aggregates category outflow distribution and sorts descending', async () => {
    const { calculateCategoryOutflow } = await import('../utils/calculations');
    const outflows = calculateCategoryOutflow(DEFAULT_HOSTEL_HUSTLER);

    expect(outflows.length).toBeGreaterThan(0);
    expect(outflows[0].amount).toBeGreaterThanOrEqual(outflows[outflows.length - 1].amount);
    expect(outflows[0].percentage).toBeGreaterThan(0);
  });

  it('generates transparent 4-pillar health diagnostics and optimization tips', async () => {
    const { generateHealthScoreAudit, generateOptimizationTips } = await import('../utils/calculations');
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const audit = generateHealthScoreAudit(DEFAULT_HOSTEL_HUSTLER, metrics);
    const tips = generateOptimizationTips(DEFAULT_HOSTEL_HUSTLER, metrics);

    expect(audit.pillars.runway.maxScore).toBe(35);
    expect(audit.pillars.commitments.maxScore).toBe(25);
    expect(audit.pillars.allowance.maxScore).toBe(20);
    expect(audit.pillars.resilience.maxScore).toBe(20);
    expect(audit.positiveHighlights.length).toBeGreaterThan(0);
    expect(tips.length).toBeGreaterThan(0);
  });
});

