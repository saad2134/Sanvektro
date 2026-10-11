import type {
  FinancialState,
  ConsequenceMetrics,
  ConsequenceDiff,
  SimulationDraft,
  RiskLevel
} from '../types/finance';

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

  return {
    balance: Math.round(currentBalance),
    dailyAllowance,
    healthScore,
    riskLevel,
    runwayDepletionDay: depletionDay,
    projectedDay30Balance,
    goalsAchievableCount: achievableCount,
    totalGoalsCount: savingsGoals.length,
    shockResilienceScore
  };
}

/**
 * Calculates consequence differences between baseline and a simulated transaction.
 */
export function calculateConsequenceDiff(
  baseline: ConsequenceMetrics,
  simulated: ConsequenceMetrics,
  draftAmount: number
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

  return {
    balanceDelta,
    allowanceDelta,
    healthScoreDelta,
    riskChanged,
    priorRisk: baseline.riskLevel,
    newRisk: simulated.riskLevel,
    runwayDeltaDays,
    impactVerdict,
    tradeOffSummary
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

    if (simulationDraft && simulationDraft.day === day) {
      simBal -= simulationDraft.amount;
      eventNote = (eventNote ? eventNote + ' | ' : '') + `Simulated: ₹${simulationDraft.amount}`;
    }

    // Future days burn rate
    if (day > currentDay) {
      curBal -= baseMetrics.dailyAllowance;
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
      safeCorridorMin,
      safeCorridorMax,
      eventNote
    });
  }

  return points;
}
