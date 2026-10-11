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

  it('provides empirical audit evidence for each generated optimization tip', async () => {
    const { generateOptimizationTips } = await import('../utils/calculations');
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const tips = generateOptimizationTips(DEFAULT_HOSTEL_HUSTLER, metrics);

    expect(tips.length).toBeGreaterThan(0);
    tips.forEach(tip => {
      expect(tip.evidence).toBeDefined();
      expect(tip.evidence!.length).toBeGreaterThan(10);
    });
  });

  it('evaluates radial health gauge score and pillar percentage weights strictly', async () => {
    const { generateHealthScoreAudit } = await import('../utils/calculations');
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const audit = generateHealthScoreAudit(DEFAULT_HOSTEL_HUSTLER, metrics);

    expect(audit.overallScore).toBeGreaterThanOrEqual(5);
    expect(audit.overallScore).toBeLessThanOrEqual(100);

    const totalWeight =
      audit.pillars.runway.weightPct +
      audit.pillars.commitments.weightPct +
      audit.pillars.allowance.weightPct +
      audit.pillars.resilience.weightPct;
    expect(totalWeight).toBe(100);
  });

  it('guarantees safe floating-point arithmetic with safeAdd and safeSub', async () => {
    const { safeAdd, safeSub } = await import('../utils/calculations');
    expect(safeAdd(0.1, 0.2)).toBe(0.3);
    expect(safeAdd(199.99, 0.01)).toBe(200);
    expect(safeSub(100, 30.5)).toBe(69.5);
    expect(safeSub(10, 20)).toBe(0); // clamped at zero floor
  });

  it('calculates savings goal feasibility horizon and daily required amounts', async () => {
    const { calculateGoalFeasibility } = await import('../utils/calculations');
    const activeGoal = {
      id: 'g1',
      name: 'Goa Trip Fund',
      targetAmount: 3000,
      currentAmount: 2400,
      targetDay: 25,
      emoji: '🏖️',
      priority: 'HIGH' as const
    };

    const feasibility = calculateGoalFeasibility(activeGoal, 10, 2500, 200);
    expect(feasibility.dailyRequired).toBe(Math.ceil(600 / 15)); // ₹40/day
    expect(feasibility.onTrack).toBe(true); // 2500 surplus >= 600 needed
    expect(feasibility.projectedCompletionDay).toBe(25);

    // Far goal that exceeds 30-day horizon
    const farGoal = { ...activeGoal, currentAmount: 200 };
    const farFeas = calculateGoalFeasibility(farGoal, 10, 500, 200);
    expect(farFeas.projectedCompletionDay).toBeNull();

    // Completed goal
    const completedGoal = { ...activeGoal, currentAmount: 3000 };
    const completedFeas = calculateGoalFeasibility(completedGoal, 10, 2500, 200);
    expect(completedFeas.dailyRequired).toBe(0);
    expect(completedFeas.projectedCompletionDay).toBe(10);
    expect(completedFeas.onTrack).toBe(true);
  });

  it('classifies consequence diff severity and computes committed bills protection buffer', () => {
    const baseline = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    
    // Minor expense: ₹100
    const minorDraft: SimulationDraft = {
      title: 'Cafe Chai',
      amount: 100,
      category: 'Food & Dining',
      day: DEFAULT_HOSTEL_HUSTLER.currentDay
    };
    const minorSim = calculateMetrics(DEFAULT_HOSTEL_HUSTLER, minorDraft);
    const minorDiff = calculateConsequenceDiff(baseline, minorSim, minorDraft.amount, DEFAULT_HOSTEL_HUSTLER);
    expect(minorDiff.severity).toBe('NEGLIGIBLE');
    expect(minorDiff.committedBillsBuffer).toBeGreaterThan(0);
    expect(minorDiff.affectedGoals.length).toBe(DEFAULT_HOSTEL_HUSTLER.savingsGoals.length);

    // Critical expense: ₹8,000
    const majorDraft: SimulationDraft = {
      title: 'Luxury Watch',
      amount: 8000,
      category: 'Shopping & Quick-Commerce',
      day: DEFAULT_HOSTEL_HUSTLER.currentDay
    };
    const majorSim = calculateMetrics(DEFAULT_HOSTEL_HUSTLER, majorDraft);
    const majorDiff = calculateConsequenceDiff(baseline, majorSim, majorDraft.amount, DEFAULT_HOSTEL_HUSTLER);
    expect(['SEVERE', 'CRITICAL']).toContain(majorDiff.severity);
  });

  it('guarantees integer paise conversion and zero IEEE 754 floating precision drift', async () => {
    const { rupeesToPaise, paiseToRupees } = await import('../utils/calculations');

    // Standard conversions
    expect(rupeesToPaise(10000)).toBe(1000000); // ₹10,000 = 1,000,000 paise
    expect(rupeesToPaise(299)).toBe(29900);     // ₹299 = 29,900 paise
    expect(rupeesToPaise(15.5)).toBe(1550);     // ₹15.50 = 1,550 paise
    expect(rupeesToPaise(0)).toBe(0);

    // Inverse conversions
    expect(paiseToRupees(1000000)).toBe(10000);
    expect(paiseToRupees(29900)).toBe(299);
    expect(paiseToRupees(1550)).toBe(15.5);

    // IEEE 754 floating point arithmetic protection ✦ micro-transaction sum
    // Standard JS: 0.1 + 0.2 = 0.30000000000000004
    const paiseA = rupeesToPaise(0.1); // 10 paise
    const paiseB = rupeesToPaise(0.2); // 20 paise
    const sumPaise = paiseA + paiseB;  // 30 paise
    expect(sumPaise).toBe(30);
    expect(paiseToRupees(sumPaise)).toBe(0.3);

    // Iterative accumulation of 1,000 micro-transactions of ₹0.10
    let totalPaise = 0;
    for (let i = 0; i < 1000; i++) {
      totalPaise += rupeesToPaise(0.1);
    }
    expect(totalPaise).toBe(10000); // exactly 10,000 paise
    expect(paiseToRupees(totalPaise)).toBe(100); // exactly ₹100.00
  });

  it('diagnoses Gen Z Money Personality Archetype and enforces bounded 0-100 quantitative traits', async () => {
    const { calculateMoneyPersonality } = await import('../utils/calculations');
    const metrics = calculateMetrics(DEFAULT_HOSTEL_HUSTLER);
    const personality = calculateMoneyPersonality(DEFAULT_HOSTEL_HUSTLER, metrics);

    expect(['alchemist', 'fortress', 'softlife', 'thrillseeker']).toContain(personality.id);
    expect(personality.title).toBeTruthy();
    expect(personality.quote).toBeTruthy();
    expect(personality.survivalTip).toBeTruthy();

    // Verify 5-trait boundaries (0 to 100)
    expect(personality.traits.impulseResistance).toBeGreaterThanOrEqual(0);
    expect(personality.traits.impulseResistance).toBeLessThanOrEqual(100);

    expect(personality.traits.cushionLoyalty).toBeGreaterThanOrEqual(0);
    expect(personality.traits.cushionLoyalty).toBeLessThanOrEqual(100);

    expect(personality.traits.treatAllocation).toBeGreaterThanOrEqual(0);
    expect(personality.traits.treatAllocation).toBeLessThanOrEqual(100);

    expect(personality.traits.frugalEngineering).toBeGreaterThanOrEqual(0);
    expect(personality.traits.frugalEngineering).toBeLessThanOrEqual(100);

    expect(personality.traits.riskVelocity).toBeGreaterThanOrEqual(0);
    expect(personality.traits.riskVelocity).toBeLessThanOrEqual(100);

    // Strained state triggers Thrillseeker with urgent guidance
    const strainedState: FinancialState = {
      ...DEFAULT_HOSTEL_HUSTLER,
      currentDay: 20,
      emergencyBuffer: 100,
      savingsGoals: [],
      transactions: [
        { id: 'tx-big', title: 'Heavy Outflow', amount: 8000, day: 15, category: 'Shopping & Quick-Commerce' }
      ]
    };
    const strainedMetrics = calculateMetrics(strainedState);
    const strainedPersonality = calculateMoneyPersonality(strainedState, strainedMetrics);
    expect(strainedPersonality.id).toBe('thrillseeker');
    expect(strainedPersonality.traits.riskVelocity).toBeGreaterThanOrEqual(50);
  });

  it('calculates 7-day forward cash pressure radar for scheduled obligations', async () => {
    const { calculateCashPressureRadar } = await import('../utils/calculations');

    const sampleCommitments = [
      { id: 'c1', name: 'Hostel Wi-Fi', amount: 400, dueDay: 14, category: 'Utilities', isPaid: false, essential: true },
      { id: 'c2', name: 'Mess Food Fee', amount: 2200, dueDay: 16, category: 'Food', isPaid: false, essential: true },
      { id: 'c3', name: 'Gym Pass', amount: 500, dueDay: 28, category: 'Fitness', isPaid: false, essential: false },
      { id: 'c4', name: 'Early Paid Bill', amount: 800, dueDay: 12, category: 'Bills', isPaid: true, essential: true }
    ];

    // Current day = Day 10 (window is Day 11 to 17)
    // Bills in window: c1 (Day 14, ₹400), c2 (Day 16, ₹2200). Total = ₹2600 (> ₹2000 => ALERT)
    const radarAtDay10 = calculateCashPressureRadar(sampleCommitments, 10);
    expect(radarAtDay10.upcoming7DaysTotal).toBe(2600);
    expect(radarAtDay10.upcomingCount).toBe(2);
    expect(radarAtDay10.status).toBe('ALERT');
    expect(radarAtDay10.nextDueItem?.name).toBe('Hostel Wi-Fi');
    expect(radarAtDay10.nextDueItem?.dueDay).toBe(14);
    expect(radarAtDay10.descriptor).toContain('Severe Cash Pressure');

    // Current day = Day 17 (window is Day 18 to 24)
    // No bills in window (c3 is Day 28)
    const radarAtDay17 = calculateCashPressureRadar(sampleCommitments, 17);
    expect(radarAtDay17.upcoming7DaysTotal).toBe(0);
    expect(radarAtDay17.upcomingCount).toBe(0);
    expect(radarAtDay17.status).toBe('CLEAR');
    expect(radarAtDay17.nextDueItem).toBeNull();
    expect(radarAtDay17.descriptor).toContain('Clear Horizon');
  });

  it('calculates student opportunity cost and 24-hour cool-off splurge advisory', async () => {
    const { calculateOpportunityCost } = await import('../utils/calculations');

    // Major impulse: ₹1,500 hoodie with ₹250/day allowance (1500/150 = 10 hrs work, 1500/250 = 6.0 days allowance)
    const majorCost = calculateOpportunityCost(1500, 250, 150);
    expect(majorCost.hoursOfGigWork).toBe(10);
    expect(majorCost.daysOfDailyAllowance).toBe('6.0');
    expect(majorCost.isCoolOffRecommended).toBe(true);
    expect(majorCost.advice).toContain('24-hour cool-off rule');

    // Minor treat: ₹100 chai with ₹250/day allowance (100/150 = 1 hr work, 100/250 = 0.4 days allowance)
    const minorCost = calculateOpportunityCost(100, 250, 150);
    expect(minorCost.hoursOfGigWork).toBe(1);
    expect(minorCost.daysOfDailyAllowance).toBe('0.4');
    expect(minorCost.isCoolOffRecommended).toBe(false);
    expect(minorCost.advice).toContain('Fits comfortably');

    // Zero / edge amount
    const zeroCost = calculateOpportunityCost(0, 250, 150);
    expect(zeroCost.hoursOfGigWork).toBe(0);
    expect(zeroCost.isCoolOffRecommended).toBe(false);
  });
});


