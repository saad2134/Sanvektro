import type {
  FinancialState,
  ConsequenceMetrics,
  ConsequenceDiff,
  SimulationDraft,
  RiskLevel,
  HealthGrade,
  CapitalAllocation,
  CategoryOutflow,
  HealthScoreAudit,
  OptimizationTip,
  ExpenseCategory,
  ScenarioComparison,
  DailyHeatmapPoint,
  SavingsLockboxRipple,
  SavingsGoal,
  MoneyPersonality,
  Commitment,
  CashPressureRadar,
  OpportunityCostAnalysis
} from '../types/finance';

/**
 * Maps composite health score (0-100) to an academic letter grade and functional descriptor.
 */
export function getHealthLetterGrade(score: number): { grade: HealthGrade; descriptor: string } {
  if (score >= 90) {
    return {
      grade: 'A+',
      descriptor: 'Elite Solvency ✦ Exceptional Reserve Discipline'
    };
  }
  if (score >= 80) {
    return {
      grade: 'A',
      descriptor: 'Strong Solvency ✦ Healthy Discretionary Buffer'
    };
  }
  if (score >= 70) {
    return {
      grade: 'B',
      descriptor: 'Stable Pacing ✦ Moderate Burn Velocity'
    };
  }
  if (score >= 60) {
    return {
      grade: 'C',
      descriptor: 'Constrained Cushion ✦ Spending Caution Advised'
    };
  }
  if (score >= 50) {
    return {
      grade: 'D',
      descriptor: 'Deficit Hazard ✦ Tight Living Runway'
    };
  }
  return {
    grade: 'F',
    descriptor: 'Critical Insolvency ✦ Imminent Cash Exhaustion'
  };
}

/**
 * Computes recency-weighted burn velocity in ₹/day.
 * Gives 50% weight to recent 3 days, 30% to days 4-7, and 20% to older days.
 */
export function calculateWeightedBurnVelocity(
  transactions: { day: number; amount: number }[],
  currentDay: number
): number {
  if (currentDay <= 0) return 0;

  const dailySpends: number[] = [];
  for (let d = 1; d <= currentDay; d++) {
    const dayTotal = transactions
      .filter(tx => tx.day === d)
      .reduce((sum, tx) => sum + tx.amount, 0);
    dailySpends.push(dayTotal);
  }

  const last3 = dailySpends.slice(Math.max(0, dailySpends.length - 3));
  const avgLast3 = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

  const days4to7 = dailySpends.slice(
    Math.max(0, dailySpends.length - 7),
    Math.max(0, dailySpends.length - 3)
  );
  const avgDays4to7 = days4to7.length > 0 ? days4to7.reduce((a, b) => a + b, 0) / days4to7.length : avgLast3;

  const older = dailySpends.slice(0, Math.max(0, dailySpends.length - 7));
  const avgOlder = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avgDays4to7;

  if (dailySpends.length <= 3) {
    return Math.round(avgLast3);
  } else if (dailySpends.length <= 7) {
    return Math.round(0.65 * avgLast3 + 0.35 * avgDays4to7);
  } else {
    return Math.round(0.5 * avgLast3 + 0.3 * avgDays4to7 + 0.2 * avgOlder);
  }
}

/**
 * Calculates financial metrics for a given state, optionally applying a simulation draft.
 */
export function calculateMetrics(
  state: FinancialState,
  simulationDraft: SimulationDraft | null = null
): ConsequenceMetrics {
  const {
    currentDay,
    startingBudget,
    inflows,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    emergencyBuffer
  } = state;

  // 1. Calculate actual historical income up to currentDay
  const realizedInflows = inflows
    .filter(inf => inf.day <= currentDay)
    .reduce((sum, inf) => sum + inf.amount, 0);

  // 2. Realized transactions up to currentDay
  const realizedExpenses = transactions
    .filter(tx => tx.day <= currentDay)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Realized commitments up to currentDay that are marked paid or past due
  const realizedCommitments = commitments
    .filter(c => c.dueDay <= currentDay || c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  // 4. Realized subscriptions up to currentDay that are active
  const realizedSubscriptions = subscriptions
    .filter(sub => sub.isActive && sub.billingDay <= currentDay)
    .reduce((sum, sub) => sum + sub.amount, 0);

  // Current liquid cash balance right now (at currentDay)
  let currentBalance =
    startingBudget +
    realizedInflows -
    realizedExpenses -
    realizedCommitments -
    realizedSubscriptions;

  // If simulation draft is set for today or earlier, subtract it from current liquid balance
  if (simulationDraft && simulationDraft.day <= currentDay) {
    currentBalance -= simulationDraft.amount;
  }

  // 5. Calculate pending obligations from tomorrow to Day 30
  const pendingCommitments = commitments
    .filter(c => c.dueDay > currentDay && !c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingSubscriptions = subscriptions
    .filter(sub => sub.isActive && sub.billingDay > currentDay)
    .reduce((sum, sub) => sum + sub.amount, 0);


  const remainingDays = Math.max(1, 30 - currentDay + 1);

  // Simulation draft if scheduled in future
  const futureSimCost =
    simulationDraft && simulationDraft.day > currentDay ? simulationDraft.amount : 0;

  const pendingInflows = inflows
    .filter(inf => inf.day > currentDay)
    .reduce((sum, inf) => sum + inf.amount, 0);

  // Discretionary pool available across remaining days
  const discretionaryPool = Math.max(
    0,
    currentBalance +
      pendingInflows -
      pendingCommitments -
      pendingSubscriptions -
      emergencyBuffer -
      futureSimCost
  );

  // Dynamic Daily Safe-to-Spend Allowance
  const dailyAllowance = Math.round(discretionaryPool / remainingDays);

  // 6. Day-by-Day Forecast from Day 1 to 30 to determine runway depletion
  let simCash = startingBudget;
  let depletionDay: number | null = null;

  for (let day = 1; day <= 30; day++) {
    // Add inflows on this day
    const dayInflows = inflows
      .filter(inf => inf.day === day)
      .reduce((sum, inf) => sum + inf.amount, 0);
    simCash += dayInflows;

    // Deduct recorded transactions
    const dayTxs = transactions
      .filter(tx => tx.day === day)
      .reduce((sum, tx) => sum + tx.amount, 0);
    simCash -= dayTxs;

    // Deduct commitments
    const dayCommitments = commitments
      .filter(c => c.dueDay === day)
      .reduce((sum, c) => sum + c.amount, 0);
    simCash -= dayCommitments;

    // Deduct subscriptions
    const daySubs = subscriptions
      .filter(s => s.isActive && s.billingDay === day)
      .reduce((sum, s) => sum + s.amount, 0);
    simCash -= daySubs;

    // Deduct simulation draft if on this day
    if (simulationDraft && simulationDraft.day === day) {
      simCash -= simulationDraft.amount;
    }

    // For future days past currentDay, apply projected daily allowance spending
    if (day > currentDay) {
      simCash -= dailyAllowance;
    }

    if (simCash < 0 && depletionDay === null) {
      depletionDay = day;
    }
  }

  const projectedDay30Balance = Math.round(simCash);

  // 7. Savings Goals Achievability
  const projectedSurplus = Math.max(0, projectedDay30Balance);
  let accumulatedForGoals = projectedSurplus;
  let achievableCount = 0;

  savingsGoals.forEach(goal => {
    const needed = Math.max(0, goal.targetAmount - goal.currentAmount);
    if (accumulatedForGoals >= needed) {
      achievableCount++;
      accumulatedForGoals -= needed;
    }
  });

  // 8. Shock Resilience Score (how well user can absorb an unexpected ₹1,000 emergency)
  const resilienceBuffer = Math.max(0, currentBalance - pendingCommitments - pendingSubscriptions);
  const shockResilienceScore = Math.min(
    100,
    Math.round((resilienceBuffer / 2000) * 100)
  );

  // 9. Composite Financial Health Score (0 - 100)
  // Pillar A: Runway & Projected Day 30 health (35 pts)
  let runwayScore = 0;
  if (depletionDay === null) {
    runwayScore = Math.min(35, Math.max(10, (projectedDay30Balance / 2500) * 35));
  } else {
    runwayScore = Math.max(0, (depletionDay / 30) * 20);
  }

  // Pillar B: Commitment & Bill Coverage (25 pts)
  const obligationsTotal = pendingCommitments + pendingSubscriptions;
  let commitmentScore = 25;
  if (currentBalance < obligationsTotal) {
    commitmentScore = Math.max(0, Math.round((currentBalance / Math.max(1, obligationsTotal)) * 25));
  }

  // Pillar C: Daily Allowance Cushion (20 pts)
  // Gen Z benchmark: ₹250/day is comfortable, ₹120 is tight, <₹80 is survival
  let allowanceScore = 0;
  if (dailyAllowance >= 250) allowanceScore = 20;
  else if (dailyAllowance >= 160) allowanceScore = 15;
  else if (dailyAllowance >= 100) allowanceScore = 10;
  else if (dailyAllowance >= 50) allowanceScore = 5;
  else allowanceScore = 0;

  // Pillar D: Goals & Shock Resilience (20 pts)
  const goalsRatio = savingsGoals.length > 0 ? achievableCount / savingsGoals.length : 1;
  const bufferScore = (shockResilienceScore / 100) * 10 + goalsRatio * 10;

  const rawHealth = Math.round(runwayScore + commitmentScore + allowanceScore + bufferScore);
  const healthScore = Math.max(5, Math.min(100, rawHealth));

  // 10. Risk Level
  let riskLevel: RiskLevel = 'OPTIMAL';
  if (depletionDay !== null && depletionDay <= 28) {
    riskLevel = 'CRITICAL';
  } else if (healthScore < 45 || dailyAllowance < 90 || currentBalance < obligationsTotal) {
    riskLevel = 'ELEVATED';
  } else if (healthScore < 70 || dailyAllowance < 180) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'OPTIMAL';
  }

  const allTxsForVelocity = simulationDraft && simulationDraft.day <= currentDay
    ? [...transactions, { day: simulationDraft.day, amount: simulationDraft.amount }]
    : transactions;
  const weightedBurnVelocity = calculateWeightedBurnVelocity(allTxsForVelocity, currentDay);
  const { grade: letterGrade, descriptor: gradeDescriptor } = getHealthLetterGrade(healthScore);

  const isOverdraft = currentBalance < 0;
  const overdraftAmount = isOverdraft ? Math.abs(Math.round(currentBalance)) : 0;

  return {
    balance: Math.round(currentBalance),
    dailyAllowance,
    healthScore,
    letterGrade,
    gradeDescriptor,
    weightedBurnVelocity,
    riskLevel,
    runwayDepletionDay: depletionDay,
    projectedDay30Balance,
    goalsAchievableCount: achievableCount,
    totalGoalsCount: savingsGoals.length,
    shockResilienceScore,
    isOverdraft,
    overdraftAmount
  };
}

/**
 * Safe floating-point addition rounded to 2 decimal places.
 */
export function safeAdd(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}

/**
 * Safe floating-point subtraction rounded to 2 decimal places, never dropping below 0.
 */
export function safeSub(a: number, b: number): number {
  return Math.max(0, Math.round((a - b) * 100) / 100);
}

/**
 * Converts Indian Rupees to integer paise (1 INR = 100 paise).
 * Eliminates IEEE 754 floating-point rounding errors.
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise back to Indian Rupees (100 paise = 1 INR).
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Calculates feasibility metrics for a savings goal: daily required, completion horizon, and on-track status.
 */
export function calculateGoalFeasibility(
  goal: SavingsGoal,
  currentDay: number,
  projectedSurplus: number,
  dailyAllowance: number
): {
  dailyRequired: number;
  projectedCompletionDay: number | null;
  onTrack: boolean;
} {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remaining === 0) {
    return {
      dailyRequired: 0,
      projectedCompletionDay: currentDay,
      onTrack: true
    };
  }

  const daysLeft = Math.max(1, goal.targetDay - currentDay);
  const dailyRequired = Math.ceil(remaining / daysLeft);
  const onTrack = projectedSurplus >= remaining;

  let projectedCompletionDay: number | null = null;
  if (dailyAllowance > 0) {
    // Sustainable daily savings allocation (20% of safe daily allowance, min ₹25/day)
    const dailyAllocationRate = Math.max(25, Math.round(dailyAllowance * 0.2));
    const daysToFinish = Math.ceil(remaining / dailyAllocationRate);
    const estimatedDay = currentDay + daysToFinish;
    if (estimatedDay <= 30) {
      projectedCompletionDay = estimatedDay;
    }
  }

  return {
    dailyRequired,
    projectedCompletionDay,
    onTrack
  };
}

/**
 * Calculates consequence differences between baseline and a simulated transaction.
 * Includes severity classification, committed bills protection buffer, and affected goals.
 */
export function calculateConsequenceDiff(
  baseline: ConsequenceMetrics,
  simulated: ConsequenceMetrics,
  draftAmount: number,
  state?: FinancialState
): ConsequenceDiff {
  const balanceDelta = simulated.balance - baseline.balance;
  const allowanceDelta = simulated.dailyAllowance - baseline.dailyAllowance;
  const healthScoreDelta = simulated.healthScore - baseline.healthScore;
  const riskChanged = baseline.riskLevel !== simulated.riskLevel;

  const baselineDepletion = baseline.runwayDepletionDay ?? 30;
  const simDepletion = simulated.runwayDepletionDay ?? 30;
  const runwayDeltaDays = simDepletion - baselineDepletion;

  let impactVerdict = 'Low Financial Friction';
  if (simulated.riskLevel === 'CRITICAL') {
    impactVerdict = 'Severe Threat to 30-Day Solvency';
  } else if (healthScoreDelta <= -15 || riskChanged) {
    impactVerdict = 'Significant Negative Consequence';
  } else if (healthScoreDelta <= -5) {
    impactVerdict = 'Moderate Allowance Reduction';
  }

  // Gen Z Trade-off Translator
  const dailyAllowance = Math.max(1, baseline.dailyAllowance);
  const daysOfAllowanceEaten = (draftAmount / dailyAllowance).toFixed(1);

  let tradeOffSummary = `Consumes ${daysOfAllowanceEaten} days of your safe daily allowance.`;
  if (simulated.goalsAchievableCount < baseline.goalsAchievableCount) {
    tradeOffSummary += ` Compromises ${baseline.goalsAchievableCount - simulated.goalsAchievableCount} savings goal.`;
  }
  if (runwayDeltaDays < 0) {
    tradeOffSummary += ` Shortens monthly runway by ${Math.abs(runwayDeltaDays)} days.`;
  }

  // Multi-tier Consequence Severity Classification
  let severity: 'NEGLIGIBLE' | 'MODERATE' | 'SEVERE' | 'CRITICAL' = 'NEGLIGIBLE';
  if (simulated.runwayDepletionDay !== null || simulated.balance < 0 || simulated.dailyAllowance <= 40) {
    severity = 'CRITICAL';
  } else if (healthScoreDelta <= -15 || riskChanged || simulated.goalsAchievableCount < baseline.goalsAchievableCount || simulated.dailyAllowance < 75) {
    severity = 'SEVERE';
  } else if (healthScoreDelta <= -6 || allowanceDelta <= -25) {
    severity = 'MODERATE';
  } else {
    severity = 'NEGLIGIBLE';
  }

  // Committed Recurring Bills Protection Buffer
  let committedBillsBuffer = Math.max(0, simulated.balance);
  const affectedGoals: {
    goalId: string;
    goalName: string;
    delayDays: number;
    stillOnTrack: boolean;
  }[] = [];

  if (state) {
    const pendingCommitments = state.commitments
      .filter(c => c.dueDay > state.currentDay && !c.isPaid)
      .reduce((s, c) => s + c.amount, 0);

    const pendingSubs = state.subscriptions
      .filter(s => s.isActive && s.billingDay > state.currentDay)
      .reduce((sum, sub) => sum + sub.amount, 0);

    const totalUpcomingBills = pendingCommitments + pendingSubs;
    committedBillsBuffer = Math.max(0, simulated.balance - totalUpcomingBills);

    // Track goal impact ripple
    state.savingsGoals.forEach(goal => {
      const remainingTarget = Math.max(0, goal.targetAmount - goal.currentAmount);
      const isCompromised = simulated.projectedDay30Balance < remainingTarget && baseline.projectedDay30Balance >= remainingTarget;
      const delayDays = isCompromised ? Math.min(10, Math.ceil((draftAmount / Math.max(1, simulated.dailyAllowance)) * 0.5)) : 0;
      const stillOnTrack = simulated.projectedDay30Balance >= remainingTarget;

      affectedGoals.push({
        goalId: goal.id,
        goalName: goal.name,
        delayDays,
        stillOnTrack
      });
    });
  }

  return {
    balanceDelta,
    allowanceDelta,
    healthScoreDelta,
    riskChanged,
    priorRisk: baseline.riskLevel,
    newRisk: simulated.riskLevel,
    runwayDeltaDays,
    impactVerdict,
    tradeOffSummary,
    severity,
    committedBillsBuffer,
    affectedGoals
  };
}

/**
 * Generate 30-day forecast plot data for the trajectory chart
 */
export interface TrajectoryPoint {
  day: number;
  actualBalance?: number;
  projectedBalance: number;
  simulatedBalance?: number;
  bestCaseBalance?: number;
  worstCaseBalance?: number;
  safeCorridorMin: number;
  safeCorridorMax: number;
  eventNote?: string;
}

export function generateTrajectoryPoints(
  state: FinancialState,
  simulationDraft: SimulationDraft | null = null
): TrajectoryPoint[] {
  const { currentDay, startingBudget, inflows, transactions, commitments, subscriptions } = state;
  const baseMetrics = calculateMetrics(state);
  const simMetrics = simulationDraft ? calculateMetrics(state, simulationDraft) : null;

  const points: TrajectoryPoint[] = [];

  let curBal = startingBudget;
  let simBal = startingBudget;
  let bestBal = startingBudget;
  let worstBal = startingBudget;

  // Multi-cone scenario burn allowances
  const bestAllowance = Math.round(baseMetrics.dailyAllowance * 0.75);
  const worstAllowance = Math.round(baseMetrics.dailyAllowance * 1.35);

  for (let day = 1; day <= 30; day++) {
    const dayInflow = inflows.filter(i => i.day === day).reduce((s, i) => s + i.amount, 0);
    const dayTx = transactions.filter(t => t.day === day).reduce((s, t) => s + t.amount, 0);
    const dayCommitment = commitments.filter(c => c.dueDay === day).reduce((s, c) => s + c.amount, 0);
    const daySub = subscriptions.filter(s => s.isActive && s.billingDay === day).reduce((s, sub) => s + sub.amount, 0);

    let eventNote: string | undefined = undefined;
    if (dayCommitment > 0) eventNote = `Commitment Due: ₹${dayCommitment}`;
    else if (daySub > 0) eventNote = `Subscription Due: ₹${daySub}`;
    else if (dayInflow > 0) eventNote = `Inflow: +₹${dayInflow}`;

    curBal += dayInflow - dayTx - dayCommitment - daySub;
    simBal += dayInflow - dayTx - dayCommitment - daySub;

    if (day <= currentDay) {
      bestBal = curBal;
      worstBal = curBal;
    } else {
      bestBal += dayInflow - dayCommitment - daySub;
      worstBal += dayInflow - dayCommitment - daySub;
    }

    if (simulationDraft && simulationDraft.day === day) {
      simBal -= simulationDraft.amount;
      eventNote = (eventNote ? eventNote + ' | ' : '') + `Simulated: ₹${simulationDraft.amount}`;
    }

    // Future days burn rate
    if (day > currentDay) {
      curBal -= baseMetrics.dailyAllowance;
      bestBal -= bestAllowance;
      worstBal -= worstAllowance;
      if (simMetrics) {
        simBal -= simMetrics.dailyAllowance;
      }
    }

    // Benchmark safe linear burn: ₹10,000 down to ₹1,500 buffer on Day 30
    const safeLinear = Math.round(10000 - ((10000 - 1500) / 29) * (day - 1));
    const safeCorridorMin = Math.max(500, safeLinear - 800);
    const safeCorridorMax = safeLinear + 1000;

    points.push({
      day,
      actualBalance: day <= currentDay ? Math.round(curBal) : undefined,
      projectedBalance: Math.max(0, Math.round(curBal)),
      simulatedBalance: simMetrics ? Math.max(0, Math.round(simBal)) : undefined,
      bestCaseBalance: day >= currentDay ? Math.max(0, Math.round(bestBal)) : undefined,
      worstCaseBalance: day >= currentDay ? Math.max(0, Math.round(worstBal)) : undefined,
      safeCorridorMin,
      safeCorridorMax,
      eventNote
    });
  }

  return points;
}

/**
 * Calculates 4-way capital allocation across 30 days:
 * Spent to date, Locked in savings goals, Reserved for bills, and Free discretionary cushion.
 */
export function calculateCapitalAllocation(
  state: FinancialState,
  draft: SimulationDraft | null = null
): CapitalAllocation {
  const { startingBudget, inflows, transactions, commitments, subscriptions, savingsGoals, currentDay } = state;

  const totalInflows = inflows.reduce((sum, inf) => sum + inf.amount, 0);
  const totalCapital = startingBudget + totalInflows;

  // Realized expenses up to current day
  const realizedTxs = transactions
    .filter(t => t.day <= currentDay)
    .reduce((sum, t) => sum + t.amount, 0);

  const realizedCommitments = commitments
    .filter(c => c.dueDay <= currentDay && c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  const realizedSubs = subscriptions
    .filter(s => s.isActive && s.billingDay <= currentDay)
    .reduce((sum, s) => sum + s.amount, 0);

  const draftImmediate = draft && draft.day <= currentDay ? draft.amount : 0;
  const spentToDate = realizedTxs + realizedCommitments + realizedSubs + draftImmediate;

  // Capital committed into savings goals
  const lockedInGoals = savingsGoals.reduce((sum, g) => sum + Math.max(0, g.currentAmount), 0);

  // Reserved obligations due after current day
  const pendingCommitments = commitments
    .filter(c => c.dueDay > currentDay && !c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingSubs = subscriptions
    .filter(s => s.isActive && s.billingDay > currentDay)
    .reduce((sum, s) => sum + s.amount, 0);

  const draftFuture = draft && draft.day > currentDay ? draft.amount : 0;
  const reservedObligations = pendingCommitments + pendingSubs + draftFuture;

  // Free discretionary cushion
  const freeDiscretionary = Math.max(0, totalCapital - spentToDate - lockedInGoals - reservedObligations);

  const safeTotal = Math.max(1, totalCapital);
  const spentPct = Math.round((spentToDate / safeTotal) * 100);
  const lockedPct = Math.round((lockedInGoals / safeTotal) * 100);
  const reservedPct = Math.round((reservedObligations / safeTotal) * 100);
  const freePct = Math.max(0, 100 - spentPct - lockedPct - reservedPct);

  return {
    totalCapital,
    spentToDate,
    lockedInGoals,
    reservedObligations,
    freeDiscretionary,
    spentPct,
    lockedPct,
    reservedPct,
    freePct
  };
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food & Dining': '#f59e0b',
  'Transit & Commute': '#06b6d4',
  'Shopping & Quick-Commerce': '#ec4899',
  'Entertainment & Social': '#8b5cf6',
  'Academic & Tech': '#3b82f6',
  'Health & Emergency': '#ef4444',
  'Commitments': '#10b981',
  'Other': '#64748b'
};

export const CATEGORY_BUDGET_CAPS: Record<ExpenseCategory, number> = {
  'Food & Dining': 3500,
  'Transit & Commute': 1500,
  'Shopping & Quick-Commerce': 1500,
  'Entertainment & Social': 1000,
  'Academic & Tech': 1000,
  'Health & Emergency': 1000,
  'Commitments': 2000,
  'Other': 500
};

/**
 * Aggregates realized spending across categories with percentage distribution and budget cap utilization.
 */
export function calculateCategoryOutflow(state: FinancialState): CategoryOutflow[] {
  const { transactions } = state;
  const totals: Partial<Record<ExpenseCategory, { amount: number; count: number }>> = {};

  transactions.forEach(tx => {
    const cat = tx.category || 'Other';
    if (!totals[cat]) {
      totals[cat] = { amount: 0, count: 0 };
    }
    totals[cat]!.amount += tx.amount;
    totals[cat]!.count += 1;
  });

  const totalSpent = Object.values(totals).reduce((sum, item) => sum + (item?.amount ?? 0), 0);

  const outflows: CategoryOutflow[] = Object.entries(totals).map(([cat, data]) => {
    const category = cat as ExpenseCategory;
    const amount = data?.amount ?? 0;
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    const budgetCap = CATEGORY_BUDGET_CAPS[category] || 1000;
    const utilizationPct = budgetCap > 0 ? Math.round((amount / budgetCap) * 100) : 0;
    const isOverBudget = amount > budgetCap;
    const isNearBudget = !isOverBudget && utilizationPct >= 80;

    return {
      category,
      amount,
      percentage,
      transactionCount: data?.count ?? 0,
      color: CATEGORY_COLORS[category] || '#64748b',
      budgetCap,
      utilizationPct,
      isOverBudget,
      isNearBudget
    };
  });

  return outflows.sort((a, b) => b.amount - a.amount);
}

/**
 * Generates transparent mathematical audit for the 4 pillars of the Health Index.
 */
export function generateHealthScoreAudit(
  state: FinancialState,
  metrics: ConsequenceMetrics
): HealthScoreAudit {
  const { commitments, subscriptions, currentDay } = state;

  const pendingBills = commitments
    .filter(c => c.dueDay > currentDay && !c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingSubs = subscriptions
    .filter(s => s.isActive && s.billingDay > currentDay)
    .reduce((sum, s) => sum + s.amount, 0);

  const obligationsTotal = pendingBills + pendingSubs;

  // Pillar 1: Runway (35 pts)
  let runwayScore = 0;
  let runwayStatus = 'Deficit Hazard';
  if (metrics.runwayDepletionDay === null) {
    runwayScore = Math.min(35, Math.max(10, Math.round((metrics.projectedDay30Balance / 2500) * 35)));
    runwayStatus = 'Full 30-Day Runway';
  } else {
    runwayScore = Math.max(0, Math.round((metrics.runwayDepletionDay / 30) * 20));
    runwayStatus = `Depletes on Day ${metrics.runwayDepletionDay}`;
  }

  // Pillar 2: Commitments (25 pts)
  let commitmentScore = 25;
  let commitmentStatus = '100% Fully Covered';
  if (obligationsTotal > 0 && metrics.balance < obligationsTotal) {
    commitmentScore = Math.max(0, Math.round((metrics.balance / obligationsTotal) * 25));
    commitmentStatus = `Shortfall of ₹${obligationsTotal - metrics.balance}`;
  } else if (obligationsTotal === 0) {
    commitmentStatus = 'Zero Pending Bills';
  }

  // Pillar 3: Daily Allowance (20 pts)
  let allowanceScore = 0;
  let allowanceStatus = 'Survival Floor';
  if (metrics.dailyAllowance >= 250) {
    allowanceScore = 20;
    allowanceStatus = 'Abundant Cushion (₹250+/day)';
  } else if (metrics.dailyAllowance >= 160) {
    allowanceScore = 15;
    allowanceStatus = 'Comfortable (₹160+/day)';
  } else if (metrics.dailyAllowance >= 100) {
    allowanceScore = 10;
    allowanceStatus = 'Moderate Buffer (₹100+/day)';
  } else if (metrics.dailyAllowance >= 50) {
    allowanceScore = 5;
    allowanceStatus = 'Constrained (₹50+/day)';
  } else {
    allowanceScore = 0;
    allowanceStatus = 'Depleted Allowance';
  }

  // Pillar 4: Resilience & Goals (20 pts)
  const bufferPts = Math.round((metrics.shockResilienceScore / 100) * 10);
  const goalsRatio = metrics.totalGoalsCount > 0 ? metrics.goalsAchievableCount / metrics.totalGoalsCount : 1;
  const goalsPts = Math.round(goalsRatio * 10);
  const resilienceScore = bufferPts + goalsPts;
  const resilienceStatus = `${metrics.shockResilienceScore}% Shock Buffer`;

  // Highlights & Warnings
  const positiveHighlights: string[] = [];
  const riskWarnings: string[] = [];

  if (metrics.dailyAllowance >= 160) {
    positiveHighlights.push(`Robust daily safe burn of ₹${metrics.dailyAllowance}/day exceeds living baseline.`);
  }
  if (metrics.balance >= obligationsTotal && obligationsTotal > 0) {
    positiveHighlights.push(`All ₹${obligationsTotal} in upcoming commitments are 100% reserved and safe.`);
  } else if (obligationsTotal === 0) {
    positiveHighlights.push('All scheduled commitments for the month have been settled.');
  }
  if (metrics.runwayDepletionDay === null) {
    positiveHighlights.push(`Projected month-end cash surplus of ₹${metrics.projectedDay30Balance}.`);
  }
  if (metrics.shockResilienceScore >= 70) {
    positiveHighlights.push('Emergency cushion can absorb unexpected ₹1,000 crisis events.');
  }

  if (metrics.runwayDepletionDay !== null && metrics.runwayDepletionDay <= 28) {
    riskWarnings.push(`Critical cash exhaustion projected on Day ${metrics.runwayDepletionDay}.`);
  }
  if (metrics.balance < obligationsTotal) {
    riskWarnings.push(`Liquidity shortfall of ₹${obligationsTotal - metrics.balance} to cover scheduled obligations.`);
  }
  if (metrics.dailyAllowance < 90) {
    riskWarnings.push(`Daily discretionary allowance squeezed to ₹${metrics.dailyAllowance}/day.`);
  }

  return {
    overallScore: metrics.healthScore,
    riskLevel: metrics.riskLevel,
    pillars: {
      runway: {
        name: 'Runway & Month-End Surplus',
        score: runwayScore,
        maxScore: 35,
        weightPct: 35,
        status: runwayStatus,
        description: 'Projects solvency across Day 1 to Day 30 and rewards positive end-of-month cash reserves.'
      },
      commitments: {
        name: 'Mandatory Bill Coverage',
        score: commitmentScore,
        maxScore: 25,
        weightPct: 25,
        status: commitmentStatus,
        description: 'Verifies liquid cash covers upcoming unpaid commitments and active subscriptions.'
      },
      allowance: {
        name: 'Daily Allowance Cushion',
        score: allowanceScore,
        maxScore: 20,
        weightPct: 20,
        status: allowanceStatus,
        description: 'Evaluates daily purchasing power against living benchmarks for students and interns.'
      },
      resilience: {
        name: 'Emergency Buffer & Goals',
        score: resilienceScore,
        maxScore: 20,
        weightPct: 20,
        status: resilienceStatus,
        description: 'Measures capacity to absorb unexpected ₹1,000 expense shocks and sustain savings goals.'
      }
    },
    positiveHighlights,
    riskWarnings
  };
}

/**
 * Computes actionable context-aware optimization tips based on active financial state.
 */
export function generateOptimizationTips(
  state: FinancialState,
  metrics: ConsequenceMetrics
): OptimizationTip[] {
  const tips: OptimizationTip[] = [];
  const outflows = calculateCategoryOutflow(state);
  const remainingDays = Math.max(1, 30 - state.currentDay + 1);

  // Priority Tip: Runway Depletion Crisis
  if (metrics.runwayDepletionDay !== null && metrics.runwayDepletionDay <= 28) {
    tips.push({
      id: 'tip-runway-crisis',
      title: `Critical Solvency Warning ✦ Day ${metrics.runwayDepletionDay}`,
      type: 'DISCRETIONARY',
      impact: 'Avoid Insolvency',
      actionableText: `Your funds are projected to deplete on Day ${metrics.runwayDepletionDay}. Cut discretionary burn or pause subscriptions to ensure solvency through Day 30.`,
      evidence: `Projected cash-flow breaches ₹0 on Day ${metrics.runwayDepletionDay} with current burn velocity.`,
      badge: `Exhausts Day ${metrics.runwayDepletionDay}`
    });
  }

  // Tip 1: Top Category trim
  if (outflows.length > 0 && outflows[0].amount > 500) {
    const top = outflows[0];
    const savings15 = Math.round(top.amount * 0.15);
    const dailyBoost = Math.round(savings15 / remainingDays);
    tips.push({
      id: 'tip-trim-top',
      title: `Optimize Top Spend: ${top.category}`,
      type: 'DISCRETIONARY',
      impact: `+₹${dailyBoost}/day`,
      actionableText: `Trimming 15% (₹${savings15}) from ${top.category} lifts your daily allowance by +₹${dailyBoost}/day across remaining ${remainingDays} days.`,
      evidence: `${top.category} accounts for ${top.percentage}% (₹${top.amount}) of all realized outflow to date.`,
      badge: `${top.percentage}% of Spend`
    });
  }

  // Tip 2: Subscription Guillotine review
  const activeSubs = state.subscriptions.filter(s => s.isActive);
  const totalSubDrain = activeSubs.reduce((sum, s) => sum + s.amount, 0);
  if (activeSubs.length > 0) {
    const firstSub = activeSubs[0];
    const dailyReclaimed = Math.round(firstSub.amount / remainingDays);
    tips.push({
      id: 'tip-pause-sub',
      title: `Subscription Guillotine Review`,
      type: 'SUBSCRIPTION',
      impact: `+₹${dailyReclaimed}/day`,
      actionableText: `You have ${activeSubs.length} active recurring subscriptions (₹${totalSubDrain}/mo). Pausing ${firstSub.name} frees ₹${firstSub.amount} instantly.`,
      evidence: `${activeSubs.length} recurring services auto-debit ₹${totalSubDrain}/month (${Math.round((totalSubDrain / state.startingBudget) * 100)}% of initial budget).`,
      badge: `${activeSubs.length} Active`
    });
  }

  // Tip 3: Emergency Buffer Pacing
  if (state.emergencyBuffer < 1000) {
    const needed = 1000 - state.emergencyBuffer;
    tips.push({
      id: 'tip-emergency-buffer',
      title: `Emergency Cushion Milestone`,
      type: 'SAVINGS',
      impact: '100% Shock Shield',
      actionableText: `Reserving an extra ₹${needed} into your emergency buffer maximizes shock resilience against unexpected hospital, transit, or hardware crises.`,
      evidence: `Current buffer is ₹${state.emergencyBuffer}, leaving ₹${needed} vulnerability against unexpected emergency shocks.`,
      badge: `₹${state.emergencyBuffer}/₹1,000`
    });
  }

  return tips;
}

/**
 * Generates 3 Isolated Comparison Scenarios for any draft expense:
 * 1. Scenario A: Buy Now (immediate execution on current day)
 * 2. Scenario B: Delay 14 Days (liquidity preservation; scheduled on Day min(30, currentDay + 14))
 * 3. Scenario C: Smart Alternative (-55% thrift / curated refurbished discount at 45% price)
 */
export function generateComparisonScenarios(
  state: FinancialState,
  draft: SimulationDraft
): ScenarioComparison[] {
  const currentDay = state.currentDay || 1;
  const originalAmount = Math.max(0, draft.amount);
  const baseline = calculateMetrics(state, null);

  // Scenario A: Buy Now
  const draftBuyNow: SimulationDraft = {
    title: `${draft.title} (Immediate)`,
    amount: originalAmount,
    category: draft.category,
    day: currentDay
  };
  const metricsBuyNow = calculateMetrics(state, draftBuyNow);
  const diffBuyNow = calculateConsequenceDiff(baseline, metricsBuyNow, originalAmount, state);

  // Scenario B: Delay 14 Days
  const delayedDay = Math.min(30, currentDay + 14);
  const draftDelay: SimulationDraft = {
    title: `${draft.title} (Deferred to Day ${delayedDay})`,
    amount: originalAmount,
    category: draft.category,
    day: delayedDay
  };
  const metricsDelay = calculateMetrics(state, draftDelay);
  const diffDelay = calculateConsequenceDiff(baseline, metricsDelay, originalAmount, state);

  // Scenario C: Smart Alternative (-55%)
  const altAmount = Math.round(originalAmount * 0.45);
  const draftAlt: SimulationDraft = {
    title: `${draft.title} (Curated Alternative ✦ -55%)`,
    amount: altAmount,
    category: draft.category,
    day: currentDay
  };
  const metricsAlt = calculateMetrics(state, draftAlt);
  const diffAlt = calculateConsequenceDiff(baseline, metricsAlt, altAmount, state);

  return [
    {
      id: 'buy_now',
      title: 'Scenario A ✦ Buy Now',
      tagline: 'Immediate Execution',
      description: `Spend ₹${originalAmount.toLocaleString('en-IN')} right now on Day ${currentDay}. Direct liquid reduction.`,
      amount: originalAmount,
      day: currentDay,
      metrics: metricsBuyNow,
      diff: diffBuyNow,
      isRecommended: false
    },
    {
      id: 'delay_14d',
      title: 'Scenario B ✦ Delay 14 Days',
      tagline: 'Liquidity Preservation',
      description: `Defer purchase to Day ${delayedDay}. Protects immediate runway while scheduled bills and commitments clear.`,
      amount: originalAmount,
      day: delayedDay,
      metrics: metricsDelay,
      diff: diffDelay,
      isRecommended: false
    },
    {
      id: 'smart_alt',
      title: 'Scenario C ✦ Smart Alternative (-55%)',
      tagline: 'Optimized Value',
      description: `Opt for a refurbished, thrifted, or coupon-discounted alternative at ₹${altAmount.toLocaleString('en-IN')}. Saves ₹${(originalAmount - altAmount).toLocaleString('en-IN')} instantly.`,
      amount: altAmount,
      day: currentDay,
      metrics: metricsAlt,
      diff: diffAlt,
      isRecommended: true
    }
  ];
}

/**
 * Computes chronological 30-day spending intensity points for the matrix heatmap.
 */
export function calculateDailySpendHeatmap(state: FinancialState): DailyHeatmapPoint[] {
  const currentDay = state.currentDay || 1;
  const { transactions } = state;

  // Aggregate realized expenses per day
  const dayTotals: Record<number, { amount: number; count: number }> = {};
  for (let d = 1; d <= 30; d++) {
    dayTotals[d] = { amount: 0, count: 0 };
  }

  transactions.forEach(tx => {
    if (tx.day >= 1 && tx.day <= 30) {
      dayTotals[tx.day].amount += tx.amount;
      dayTotals[tx.day].count += 1;
    }
  });

  const points: DailyHeatmapPoint[] = [];

  for (let day = 1; day <= 30; day++) {
    const isToday = day === currentDay;
    const isPast = day < currentDay;
    const isFuture = day > currentDay;
    const amount = dayTotals[day].amount;
    const transactionCount = dayTotals[day].count;

    let intensity: 'none' | 'low' | 'moderate' | 'high' = 'none';
    if (!isFuture && amount > 0) {
      if (amount <= 300) {
        intensity = 'low';
      } else if (amount <= 600) {
        intensity = 'moderate';
      } else {
        intensity = 'high';
      }
    }

    points.push({
      day,
      amount,
      isPast,
      isToday,
      isFuture,
      intensity,
      transactionCount
    });
  }

  return points;
}

/**
 * Calculates ripple impact on daily allowance when locking funds into savings.
 */
export function calculateSavingsLockboxRipple(
  state: FinancialState,
  lockAmount: number
): SavingsLockboxRipple {
  const currentDay = state.currentDay || 1;
  const remainingDays = Math.max(1, 30 - currentDay + 1);
  const baselineMetrics = calculateMetrics(state);
  const currentDailyAllowance = baselineMetrics.dailyAllowance;

  // Hypothetical state with increased savings buffer or locked goal
  const safeLock = Math.max(0, lockAmount);
  
  // Calculate simulated daily allowance with additional locked funds
  // Discretionary pool reduces directly by safeLock
  const simulatedState: FinancialState = {
    ...state,
    emergencyBuffer: state.emergencyBuffer + safeLock
  };
  const simulatedMetrics = calculateMetrics(simulatedState);
  const simulatedDailyAllowance = simulatedMetrics.dailyAllowance;
  const allowanceDelta = simulatedDailyAllowance - currentDailyAllowance;
  const isSustainable = simulatedDailyAllowance >= 100;

  return {
    currentDailyAllowance,
    simulatedDailyAllowance,
    allowanceDelta,
    remainingDays,
    lockedAmount: safeLock,
    isSustainable
  };
}

/**
 * Diagnoses the user's Gen Z Money Personality Archetype and quantitative trait profile
 * based on live balance, burn velocity, emergency cushion adherence, and treat allocations.
 */
export function calculateMoneyPersonality(
  state: FinancialState,
  metrics: ConsequenceMetrics
): MoneyPersonality {
  const totalLockedGoals = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalSpent = state.transactions
    .filter(t => t.day <= state.currentDay)
    .reduce((sum, t) => sum + t.amount, 0);

  const discretionarySpent = state.transactions
    .filter(t => t.day <= state.currentDay && (
      t.category === 'Food & Dining' ||
      t.category === 'Shopping & Quick-Commerce' ||
      t.category === 'Entertainment & Social'
    ))
    .reduce((sum, t) => sum + t.amount, 0);

  // Quantitative Trait Ratios (0-100)
  // 1. Cushion Loyalty: Buffer + Locked Goals vs Starting Budget
  const cushionSum = state.emergencyBuffer + totalLockedGoals;
  const cushionLoyalty = Math.min(100, Math.max(10, Math.round((cushionSum / state.startingBudget) * 100 * 1.5)));

  // 2. Impulse Resistance: Inverse of risk and scaled with health score
  const baseResistance = Math.round(metrics.healthScore * 0.85);
  const impulseResistance = Math.min(100, Math.max(15, metrics.riskLevel === 'CRITICAL' ? Math.min(35, baseResistance) : baseResistance));

  // 3. Treat Allocation: Discretionary share of realized spend
  const treatPct = totalSpent > 0 ? (discretionarySpent / totalSpent) * 100 : 30;
  const treatAllocation = Math.min(100, Math.max(10, Math.round(treatPct)));

  // 4. Frugal Engineering: Efficiency of remaining allowance vs burn
  const frugalEngineering = Math.min(100, Math.max(20, Math.round(100 - (metrics.weightedBurnVelocity / Math.max(1, metrics.dailyAllowance)) * 30)));

  // 5. Risk Velocity: Burn pace speed vs allowance benchmark
  const riskVelocity = Math.min(100, Math.max(10, Math.round((metrics.weightedBurnVelocity / 350) * 100)));

  // Determine Archetype
  if (metrics.riskLevel === 'OPTIMAL' && cushionLoyalty >= 65 && metrics.goalsAchievableCount >= 1) {
    return {
      id: 'alchemist',
      title: 'The Strategic Alchemist',
      tagline: 'Turns ₹10,000 into a masterclass in disciplined resourcefulness.',
      quote: 'A rupee allocated before sunset is ten rupees saved in regret.',
      description: 'You calculate runway velocity before every swipe. You protect your emergency cushion like a locked vault, yet gracefully fund campus essentials without panicking.',
      avatarIcon: 'Sparkles',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      survivalTip: `For Day ${state.currentDay} through Day 30: Keep your daily burn at ₹${metrics.dailyAllowance}/day, and allocate ₹150 for guilt-free social treats once a week.`,
      traits: {
        impulseResistance,
        cushionLoyalty,
        treatAllocation,
        frugalEngineering,
        riskVelocity
      }
    };
  }

  if (totalLockedGoals >= 1500 || state.emergencyBuffer >= 1500) {
    return {
      id: 'fortress',
      title: 'The Fortress Builder',
      tagline: 'Builds unbreachable financial moats before touching discretionary wants.',
      quote: 'True peace of mind is knowing an unexpected ₹1,000 shock will bounce harmlessly.',
      description: 'You believe survival comes from ringfenced reserves. Fixed commitments and emergency buffers are non-negotiable moats protecting your student peace of mind.',
      avatarIcon: 'ShieldCheck',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      survivalTip: `Your buffer is formidable (₹${state.emergencyBuffer}). Ensure you do not overly restrict daily nutrition ✦ your ₹${metrics.dailyAllowance}/day cap is secure.`,
      traits: {
        impulseResistance: Math.max(75, impulseResistance),
        cushionLoyalty: Math.max(85, cushionLoyalty),
        treatAllocation: Math.min(40, treatAllocation),
        frugalEngineering: Math.max(70, frugalEngineering),
        riskVelocity: Math.min(45, riskVelocity)
      }
    };
  }

  if (metrics.dailyAllowance >= 160 && treatAllocation >= 35 && metrics.riskLevel !== 'CRITICAL') {
    return {
      id: 'softlife',
      title: 'The Soft Life Realist',
      tagline: 'Prioritizes daily joy and iced coffee, backed by strict mathematical limits.',
      quote: 'Survival is pointless if the coffee and campus hangouts do not spark joy.',
      description: 'You refuse to live in joyless student austerity. You sculpt your daily expenses around moments that nourish mental health while keeping the overall math in balance.',
      avatarIcon: 'Coffee',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      survivalTip: `Maintain your ₹${metrics.dailyAllowance}/day cap. Pair every discretionary weekend treat with a ₹50 transfer into your savings goals lockbox.`,
      traits: {
        impulseResistance: Math.max(50, impulseResistance),
        cushionLoyalty,
        treatAllocation: Math.max(65, treatAllocation),
        frugalEngineering,
        riskVelocity
      }
    };
  }

  return {
    id: 'thrillseeker',
    title: 'The Spontaneous Thrillseeker',
    tagline: 'Lives in the vibrant moment, dancing on the edge of the daily allowance limit.',
    quote: 'We will figure out tomorrow when tomorrow\'s canteen and quick-commerce bill arrives.',
    description: 'You love late-night food orders, sudden group splits, and spontaneous outings. You thrive on clutch turnarounds, but need strict guardrails to prevent Day 26 cash depletion.',
    avatarIcon: 'Zap',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    survivalTip: `Warning: Your burn velocity (₹${metrics.weightedBurnVelocity}/day) threatens the ₹${metrics.dailyAllowance}/day safe cap. Activate the Decision Simulator before any swipe above ₹200.`,
    traits: {
      impulseResistance: Math.min(50, impulseResistance),
      cushionLoyalty: Math.min(50, cushionLoyalty),
      treatAllocation: Math.max(60, treatAllocation),
      frugalEngineering: Math.min(45, frugalEngineering),
      riskVelocity: Math.max(70, riskVelocity)
    }
  };
}

/**
 * Calculates a forward-looking 7-day cash pressure radar for scheduled obligations.
 * Flags upcoming due dates, cumulative burden, and liquidity pressure status.
 */
export function calculateCashPressureRadar(
  commitments: Commitment[],
  currentDay: number
): CashPressureRadar {
  const upcoming7Days = commitments.filter(
    c => !c.isPaid && c.dueDay > currentDay && c.dueDay <= currentDay + 7
  );

  const upcoming7DaysTotal = upcoming7Days.reduce((sum, c) => sum + c.amount, 0);
  const upcomingCount = upcoming7Days.length;

  const sortedUpcoming = [...upcoming7Days].sort((a, b) => a.dueDay - b.dueDay);
  const nextDue = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

  const nextDueItem = nextDue ? {
    name: nextDue.name,
    amount: nextDue.amount,
    dueDay: nextDue.dueDay
  } : null;

  let status: 'CLEAR' | 'WATCH' | 'ALERT' = 'CLEAR';
  let descriptor = 'Clear Horizon ✦ Zero obligations due in the next 7 days';

  if (upcoming7DaysTotal > 2000) {
    status = 'ALERT';
    descriptor = `Severe Cash Pressure ✦ ₹${upcoming7DaysTotal.toLocaleString('en-IN')} due within 7 days`;
  } else if (upcoming7DaysTotal > 0) {
    status = 'WATCH';
    descriptor = `Moderate Pacing ✦ ₹${upcoming7DaysTotal.toLocaleString('en-IN')} due across ${upcomingCount} upcoming bill${upcomingCount === 1 ? '' : 's'}`;
  }

  return {
    upcoming7DaysTotal,
    upcomingCount,
    nextDueItem,
    status,
    descriptor
  };
}

/**
 * Computes Gen Z opportunity cost: student gig work hours, daily allowance consumption,
 * and 24-hour cool-off recommendations.
 */
export function calculateOpportunityCost(
  amount: number,
  dailyAllowance: number,
  hourlyWage: number = 150
): OpportunityCostAnalysis {
  const safeAmount = Math.max(0, amount);
  const hoursOfGigWork = Math.ceil(safeAmount / Math.max(1, hourlyWage));
  const daysVal = dailyAllowance > 0 ? (safeAmount / dailyAllowance).toFixed(1) : '∞';
  const isCoolOffRecommended = parseFloat(daysVal) >= 2.0 || safeAmount >= 1000;

  let advice = 'Fits comfortably within your daily spending runway.';
  if (isCoolOffRecommended) {
    advice = `Consumes ${daysVal} days of allowance! We recommend a 24-hour cool-off rule before swiping.`;
  } else if (parseFloat(daysVal) > 0.8) {
    advice = `Takes away ${daysVal} days of your daily allowance. Proceed with caution.`;
  }

  return {
    hoursOfGigWork,
    daysOfDailyAllowance: daysVal,
    isCoolOffRecommended,
    advice
  };
}

