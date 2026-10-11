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

  it('generates 3 isolated strategic scenarios for any draft expense', async () => {
    const { generateComparisonScenarios } = await import('../utils/calculations');
    const draft: SimulationDraft = {
      title: 'Sneaker Drop Pre-order',
      amount: 2000,
      category: 'Shopping & Quick-Commerce',
      day: DEFAULT_HOSTEL_HUSTLER.currentDay
    };

    const scenarios = generateComparisonScenarios(DEFAULT_HOSTEL_HUSTLER, draft);
    expect(scenarios).toHaveLength(3);

    const [scenarioA, scenarioB, scenarioC] = scenarios;
    // Scenario A: Buy Now (full price today)
    expect(scenarioA.id).toBe('buy_now');
    expect(scenarioA.amount).toBe(2000);
    expect(scenarioA.day).toBe(DEFAULT_HOSTEL_HUSTLER.currentDay);
    expect(scenarioA.isRecommended).toBe(false);

    // Scenario B: Delay 14 Days (full price at day + 14)
    expect(scenarioB.id).toBe('delay_14d');
    expect(scenarioB.amount).toBe(2000);
    expect(scenarioB.day).toBe(Math.min(30, DEFAULT_HOSTEL_HUSTLER.currentDay + 14));
    expect(scenarioB.metrics.balance).toBe(calculateMetrics(DEFAULT_HOSTEL_HUSTLER).balance); // current liquid balance untouched today!

    // Scenario C: Smart Alternative (-55% price = 45% of 2000 = 900)
    expect(scenarioC.id).toBe('smart_alt');
    expect(scenarioC.amount).toBe(900);
    expect(scenarioC.day).toBe(DEFAULT_HOSTEL_HUSTLER.currentDay);
    expect(scenarioC.isRecommended).toBe(true);
    expect(scenarioC.metrics.dailyAllowance).toBeGreaterThan(scenarioA.metrics.dailyAllowance);
  });

  it('computes category budget caps and triggers 80% amber and 100% breach flags', async () => {
    const { calculateCategoryOutflow } = await import('../utils/calculations');
    
    // State with Food spending exceeding budget cap
    const overspentState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      transactions: [
        { id: 'tx-food-1', title: 'Luxury Dineout', amount: 3800, day: 2, category: 'Food & Dining' },
        { id: 'tx-transit-1', title: 'Monthly Metro', amount: 1250, day: 3, category: 'Transit & Commute' }, // 1250/1500 = 83.3% (near budget)
        { id: 'tx-tech-1', title: 'Cable', amount: 300, day: 4, category: 'Academic & Tech' } // 300/1000 = 30% (normal)
      ]
    };

    const outflows = calculateCategoryOutflow(overspentState);
    const food = outflows.find(o => o.category === 'Food & Dining');
    const transit = outflows.find(o => o.category === 'Transit & Commute');
    const tech = outflows.find(o => o.category === 'Academic & Tech');

    expect(food).toBeDefined();
    expect(food!.isOverBudget).toBe(true);
    expect(food!.utilizationPct).toBeGreaterThan(100);

    expect(transit).toBeDefined();
    expect(transit!.isNearBudget).toBe(true);
    expect(transit!.isOverBudget).toBe(false);
    expect(transit!.utilizationPct).toBeGreaterThanOrEqual(80);

    expect(tech).toBeDefined();
    expect(tech!.isOverBudget).toBe(false);
    expect(tech!.isNearBudget).toBe(false);
  });

  it('guarantees daily allowance is never negative or NaN across extreme deficits', () => {
    const bankruptState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      currentDay: 28,
      startingBudget: 1000,
      emergencyBuffer: 2000,
      transactions: [
        { id: 'tx-huge', title: 'Catastrophic Drain', amount: 5000, day: 1, category: 'Other' }
      ],
      inflows: [],
      commitments: [],
      subscriptions: []
    };

    const metrics = calculateMetrics(bankruptState);
    expect(metrics.dailyAllowance).toBe(0);
    expect(isNaN(metrics.dailyAllowance)).toBe(false);
    expect(isFinite(metrics.dailyAllowance)).toBe(true);
  });

  it('preserves non-mutating immutability when evaluating simulation drafts', () => {
    const originalBalance = calculateMetrics(DEFAULT_HOSTEL_HUSTLER).balance;
    const testDraft: SimulationDraft = {
      title: 'Impulse Headphones',
      amount: 1500,
      category: 'Academic & Tech',
      day: DEFAULT_HOSTEL_HUSTLER.currentDay
    };

    const simMetrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER, testDraft);
    expect(simMetrics.balance).toBe(originalBalance - 1500);

    // Active state remains completely untouched
    const freshMetrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER, null);
    expect(freshMetrics.balance).toBe(originalBalance);
  });

  it('handles goal contribution allocations without double-counting expense burn', () => {
    const baseBalance = calculateMetrics(DEFAULT_HOSTEL_HUSTLER).balance;
    
    // Contributing to a goal increases goal currentAmount but does NOT duplicate a transaction
    const updatedGoalsState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      savingsGoals: DEFAULT_HOSTEL_HUSTLER.savingsGoals.map(g => 
        g.id === 'g1' ? { ...g, currentAmount: g.currentAmount + 500 } : g
      )
    };

    const metrics = calculateMetrics(updatedGoalsState);
    // Liquid balance remains unchanged because goal allocation protects cash
    expect(metrics.balance).toBe(baseBalance);
    expect(metrics.shockResilienceScore).toBeGreaterThanOrEqual(0);
  });

  it('cancelling a subscription removes future cycle obligations without fabricating income', () => {
    const activeSubCost = DEFAULT_HOSTEL_HUSTLER.subscriptions
      .filter(s => s.isActive && s.billingDay > DEFAULT_HOSTEL_HUSTLER.currentDay)
      .reduce((sum, s) => sum + s.amount, 0);

    const cancelledState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      subscriptions: DEFAULT_HOSTEL_HUSTLER.subscriptions.map(s => 
        s.billingDay > DEFAULT_HOSTEL_HUSTLER.currentDay ? { ...s, isActive: false } : s
      )
    };

    const baseMetrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const cancelledMetrics = calculateMetrics(cancelledState);

    // Liquid cash today is identical (no fake refund)
    expect(cancelledMetrics.balance).toBe(baseMetrics.balance);
    // Discretionary daily allowance improves because future drain is removed
    if (activeSubCost > 0) {
      expect(cancelledMetrics.dailyAllowance).toBeGreaterThanOrEqual(baseMetrics.dailyAllowance);
    }
  });

  it('adding realized expense lowers balance; adding inflow increases it', () => {
    const baseMetrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);

    // Add ₹1,200 expense today
    const withExpense: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      transactions: [
        ...DEFAULT_HOSTEL_HUSTLER.transactions,
        { id: 'tx-new', title: 'Books', amount: 1200, day: DEFAULT_HOSTEL_HUSTLER.currentDay, category: 'Academic & Tech' }
      ]
    };
    const afterExpense = calculateMetrics(withExpense);
    expect(afterExpense.balance).toBe(baseMetrics.balance - 1200);

    // Add ₹3,000 inflow today
    const withInflow: FinancialState = {
      ...withExpense,
      inflows: [
        ...withExpense.inflows,
        { id: 'inf-bonus', title: 'Freelance Gig', amount: 3000, day: DEFAULT_HOSTEL_HUSTLER.currentDay }
      ]
    };
    const afterInflow = calculateMetrics(withInflow);
    expect(afterInflow.balance).toBe(afterExpense.balance + 3000);
  });

  it('editing transaction amount correctly re-evaluates liquid runway', () => {
    const baseState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      transactions: [
        { id: 'tx-edit-1', title: 'Stationery', amount: 400, day: 2, category: 'Academic & Tech' }
      ]
    };
    const baseMetrics = calculateMetrics(baseState);

    // Edit from ₹400 to ₹900
    const editedState: FinancialState = {
      ...baseState,
      transactions: [
        { id: 'tx-edit-1', title: 'Stationery', amount: 900, day: 2, category: 'Academic & Tech' }
      ]
    };
    const editedMetrics = calculateMetrics(editedState);
    expect(editedMetrics.balance).toBe(baseMetrics.balance - 500);
  });

  it('deleting an expense transaction restores liquid purchasing power', () => {
    const baseState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      transactions: [
        { id: 'tx-del-1', title: 'Old Fee', amount: 800, day: 3, category: 'Other' }
      ]
    };
    const beforeDelete = calculateMetrics(baseState);

    const afterDeleteState: FinancialState = {
      ...baseState,
      transactions: []
    };
    const afterDelete = calculateMetrics(afterDeleteState);
    expect(afterDelete.balance).toBe(beforeDelete.balance + 800);
  });

  it('calculates 30-day spending matrix heatmap accurately across all cycle days', async () => {
    const { calculateDailySpendHeatmap } = await import('../utils/calculations');
    const points = calculateDailySpendHeatmap(DEFAULT_HOSTEL_HUSTLER);

    expect(points).toHaveLength(30);
    expect(points[0].day).toBe(1);
    expect(points[29].day).toBe(30);

    // Current day flag
    const todayPoint = points.find(p => p.day === DEFAULT_HOSTEL_HUSTLER.currentDay);
    expect(todayPoint).toBeDefined();
    expect(todayPoint!.isToday).toBe(true);
    expect(todayPoint!.isFuture).toBe(false);

    // Past vs future flags
    const pastPoint = points[0];
    expect(pastPoint.isPast).toBe(true);
    expect(pastPoint.isFuture).toBe(false);

    const futurePoint = points[29];
    expect(futurePoint.isFuture).toBe(true);
    expect(futurePoint.isPast).toBe(false);

    // Sum of past and today amounts matches realized spend
    const realizedHeatmapSum = points
      .filter(p => !p.isFuture)
      .reduce((sum, p) => sum + p.amount, 0);
    const expectedSum = DEFAULT_HOSTEL_HUSTLER.transactions
      .filter(t => t.day <= DEFAULT_HOSTEL_HUSTLER.currentDay)
      .reduce((sum, t) => sum + t.amount, 0);
    expect(realizedHeatmapSum).toBe(expectedSum);
  });

  it('evaluates savings lockbox ripple trade-off on daily burn allowance', async () => {
    const { calculateSavingsLockboxRipple } = await import('../utils/calculations');
    const ripple = calculateSavingsLockboxRipple(DEFAULT_HOSTEL_HUSTLER, 1000);

    expect(ripple.lockedAmount).toBe(1000);
    expect(ripple.currentDailyAllowance).toBeGreaterThan(0);
    expect(ripple.simulatedDailyAllowance).toBeLessThan(ripple.currentDailyAllowance);
    expect(ripple.allowanceDelta).toBeLessThan(0);
    expect(ripple.remainingDays).toBe(30 - DEFAULT_HOSTEL_HUSTLER.currentDay + 1);
    expect(typeof ripple.isSustainable).toBe('boolean');
  });

  it('classifies velocity risk levels aligned with Gen Z living benchmarks', () => {
    // Robust living baseline state
    const healthyMetrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    expect(['OPTIMAL', 'MODERATE']).toContain(healthyMetrics.riskLevel);

    // Strained state with depleted allowance
    const strainedState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      startingBudget: 10000,
      currentDay: 20,
      emergencyBuffer: 1000,
      transactions: [
        { id: 'tx-heavy', title: 'Severe Drain', amount: 7500, day: 2, category: 'Shopping & Quick-Commerce' }
      ]
    };
    const strainedMetrics = calculateMetrics(strainedState);
    expect(['ELEVATED', 'CRITICAL']).toContain(strainedMetrics.riskLevel);
  });

  it('preserves integer currency invariants and prevents floating point rounding drift', () => {
    const fractionalState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      startingBudget: 10000,
      currentDay: 15,
      transactions: [
        { id: 'tx-frac-1', title: 'Coffee', amount: 150.33, day: 2, category: 'Food & Dining' },
        { id: 'tx-frac-2', title: 'Cookie', amount: 49.67, day: 3, category: 'Food & Dining' }
      ]
    };
    const metrics = calculateMetrics(fractionalState);
    expect(Number.isFinite(metrics.balance)).toBe(true);
    expect(Number.isFinite(metrics.dailyAllowance)).toBe(true);
    expect(metrics.dailyAllowance % 1).toBe(0);
  });

  it('evaluates academic letter grade from A+ down to F with functional descriptors', async () => {
    const { getHealthLetterGrade } = await import('../utils/calculations');
    
    const gradeAplus = getHealthLetterGrade(95);
    expect(gradeAplus.grade).toBe('A+');
    expect(gradeAplus.descriptor).toContain('Elite Solvency');

    const gradeA = getHealthLetterGrade(85);
    expect(gradeA.grade).toBe('A');
    expect(gradeA.descriptor).toContain('Strong Solvency');

    const gradeB = getHealthLetterGrade(75);
    expect(gradeB.grade).toBe('B');
    expect(gradeB.descriptor).toContain('Stable Pacing');

    const gradeC = getHealthLetterGrade(65);
    expect(gradeC.grade).toBe('C');
    expect(gradeC.descriptor).toContain('Constrained Cushion');

    const gradeD = getHealthLetterGrade(55);
    expect(gradeD.grade).toBe('D');
    expect(gradeD.descriptor).toContain('Deficit Hazard');

    const gradeF = getHealthLetterGrade(35);
    expect(gradeF.grade).toBe('F');
    expect(gradeF.descriptor).toContain('Critical Insolvency');
  });

  it('computes recency-weighted burn velocity giving 50% weight to recent 3 days', async () => {
    const { calculateWeightedBurnVelocity } = await import('../utils/calculations');
    
    // Day 0 or negative
    expect(calculateWeightedBurnVelocity([], 0)).toBe(0);

    // Day 10 with high spend on recent 3 days (Day 8, 9, 10)
    const txs = [
      { day: 1, amount: 100 },
      { day: 2, amount: 100 },
      { day: 8, amount: 600 },
      { day: 9, amount: 400 },
      { day: 10, amount: 500 }
    ];
    const velocity = calculateWeightedBurnVelocity(txs, 10);
    expect(velocity).toBeGreaterThan(0);
    // Recent 3 days average is (600 + 400 + 500) / 3 = 500/d, so weighted burn reflects this elevated pace
    expect(velocity).toBeGreaterThan(200);
  });

  it('projects multi-cone forecast curves with best-case (0.75x) and worst-case (1.35x) cones', () => {
    const points = generateTrajectoryPoints(DEFAULT_HOSTEL_HUSTLER);
    const futurePoint = points[points.length - 1]; // Day 30

    expect(futurePoint.bestCaseBalance).toBeDefined();
    expect(futurePoint.worstCaseBalance).toBeDefined();
    expect(futurePoint.projectedBalance).toBeDefined();

    // Best-case balance at Day 30 is higher or equal to projected balance
    expect(futurePoint.bestCaseBalance!).toBeGreaterThanOrEqual(futurePoint.projectedBalance);
    // Worst-case balance at Day 30 is lower or equal to projected balance
    expect(futurePoint.worstCaseBalance!).toBeLessThanOrEqual(futurePoint.projectedBalance);

    // Current day point should connect seamlessly
    const currentDayPoint = points.find(p => p.day === DEFAULT_HOSTEL_HUSTLER.currentDay);
    expect(currentDayPoint?.bestCaseBalance).toBe(currentDayPoint?.actualBalance ?? currentDayPoint?.projectedBalance);
  });

  it('integrates letter grade and weighted burn velocity directly in ConsequenceMetrics', () => {
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    expect(['A+', 'A', 'B', 'C', 'D', 'F']).toContain(metrics.letterGrade);
    expect(metrics.gradeDescriptor).toBeDefined();
    expect(metrics.weightedBurnVelocity).toBeGreaterThanOrEqual(0);
  });
});


