/**
 * Sanvektro ✦ Financial Decision Coach Evaluation Engine
 *
 * Deterministic mathematical query evaluator providing instant, zero-latency
 * advice for Gen Z financial dilemmas.
 */

import type { FinancialState, ConsequenceMetrics, CoachEvaluationResult, ExpenseCategory } from '../types/finance';
import { calculateMetrics, calculateConsequenceDiff } from './calculations';

/**
 * Parses user questions, detects prospective purchase amounts or financial topics,
 * and runs real-time mathematical consequence simulations.
 */
export function evaluateCoachQuery(
  state: FinancialState,
  queryText: string,
  baselineMetrics: ConsequenceMetrics
): CoachEvaluationResult {
  const normalized = queryText.toLowerCase().trim();
  const remainingDays = Math.max(1, 30 - state.currentDay + 1);

  // 1. Amount Extraction (supports ₹1,500, 1500, ₹450, 450rs, 500 rupees)
  const amountMatch = queryText.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(?:rs|rupees|bucks))?/i);
  let extractedAmount: number | undefined;

  if (amountMatch && amountMatch[1]) {
    const rawNum = parseInt(amountMatch[1].replace(/,/g, ''), 10);
    // Ignore days (like day 15 or 30 days) unless it's a monetary query
    if (rawNum > 0 && !normalized.includes(`day ${rawNum}`)) {
      extractedAmount = rawNum;
    }
  }

  // 2. Subscriptions & Recurring Bills Dilemma
  if (
    normalized.includes('subscription') ||
    normalized.includes('netflix') ||
    normalized.includes('spotify') ||
    normalized.includes('gym') ||
    normalized.includes('recurring')
  ) {
    const activeSubs = state.subscriptions.filter(s => s.isActive);
    const subMonthlyTotal = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    const annualRunRate = subMonthlyTotal * 12;
    const dailyRecovery = Math.round(subMonthlyTotal / remainingDays);
    const budgetPct = Math.round((subMonthlyTotal / state.startingBudget) * 100);

    return {
      verdict: activeSubs.length > 2 ? 'CAUTION' : 'SAFE',
      verdictLabel: activeSubs.length > 2 ? 'RECURRING DRAIN REVIEW' : 'SUBSCRIPTIONS OPTIMAL',
      response: `You currently hold ${activeSubs.length} active subscriptions costing ₹${subMonthlyTotal.toLocaleString('en-IN')}/month (${budgetPct}% of your ₹${state.startingBudget.toLocaleString('en-IN')} budget, or ₹${annualRunRate.toLocaleString('en-IN')} annually). Pausing non-essential subscriptions using the Subscription Guillotine can instantly unlock +₹${dailyRecovery}/day in safe daily allowance for the remaining ${remainingDays} days.`,
      dataSnippet: {
        currentBalance: baselineMetrics.balance,
        simulatedBalance: baselineMetrics.balance,
        currentAllowance: baselineMetrics.dailyAllowance,
        simulatedAllowance: baselineMetrics.dailyAllowance + dailyRecovery,
        allowanceDelta: dailyRecovery,
        projectedDay30Balance: baselineMetrics.projectedDay30Balance,
        goalsCompromised: 0,
        isOverdraft: false
      }
    };
  }

  // 3. Safe Daily Burn Allowance Dilemma
  if (
    normalized.includes('safest') ||
    normalized.includes('safe limit') ||
    normalized.includes('how much can i spend') ||
    normalized.includes('daily allowance') ||
    normalized.includes('today limit')
  ) {
    const pendingBills = state.commitments
      .filter(c => !c.isPaid && c.dueDay >= state.currentDay)
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      verdict: 'SAFE',
      verdictLabel: 'SAFE DAILY RUNWAY LIMIT',
      response: `Your exact safe daily spending limit for today (Day ${state.currentDay}) is ₹${baselineMetrics.dailyAllowance}/day. This already protects ₹${pendingBills.toLocaleString('en-IN')} in upcoming non-negotiable living bills and your vaulted savings goals. Spending under this threshold guarantees a projected Day 30 balance of ₹${baselineMetrics.projectedDay30Balance.toLocaleString('en-IN')}.`,
      dataSnippet: {
        currentBalance: baselineMetrics.balance,
        simulatedBalance: baselineMetrics.balance,
        currentAllowance: baselineMetrics.dailyAllowance,
        simulatedAllowance: baselineMetrics.dailyAllowance,
        allowanceDelta: 0,
        projectedDay30Balance: baselineMetrics.projectedDay30Balance,
        goalsCompromised: 0,
        isOverdraft: false
      }
    };
  }

  // 4. Savings Goals & Emergency Buffer Dilemma
  if (
    normalized.includes('save') ||
    normalized.includes('savings') ||
    normalized.includes('emergency') ||
    normalized.includes('goal')
  ) {
    const totalTarget = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const shortfall = Math.max(0, totalTarget - totalCurrent);
    const pendingBills = state.commitments
      .filter(c => !c.isPaid && c.dueDay >= state.currentDay)
      .reduce((sum, c) => sum + c.amount, 0);
    const uncommittedSurplus = Math.max(0, baselineMetrics.balance - pendingBills);

    const onTrack = uncommittedSurplus >= shortfall;
    const dailySaveNeeded = Math.ceil(shortfall / remainingDays);

    return {
      verdict: onTrack ? 'SAFE' : 'CAUTION',
      verdictLabel: onTrack ? 'SAVINGS ON TRACK' : 'SAVINGS SHORTFALL HAZARD',
      response: `You have ₹${totalCurrent.toLocaleString('en-IN')} vaulted across your savings goals out of ₹${totalTarget.toLocaleString('en-IN')} target (remaining: ₹${shortfall.toLocaleString('en-IN')}). ${
        onTrack
          ? `You have an uncommitted surplus of ₹${uncommittedSurplus.toLocaleString('en-IN')}, fully covering your remaining savings targets through Day 30.`
          : `At your current burn pace, you may fall ₹${(shortfall - uncommittedSurplus).toLocaleString('en-IN')} short. To guarantee your goals, set aside ₹${dailySaveNeeded}/day from your discretionary allowance.`
      }`,
      dataSnippet: {
        currentBalance: baselineMetrics.balance,
        simulatedBalance: baselineMetrics.balance,
        currentAllowance: baselineMetrics.dailyAllowance,
        simulatedAllowance: Math.max(0, baselineMetrics.dailyAllowance - dailySaveNeeded),
        allowanceDelta: -dailySaveNeeded,
        projectedDay30Balance: baselineMetrics.projectedDay30Balance,
        goalsCompromised: onTrack ? 0 : 1,
        isOverdraft: false
      }
    };
  }

  // 5. Prospective Purchase Evaluation (when an amount is identified)
  if (extractedAmount && extractedAmount > 0) {
    // Infer title and category
    let title = 'Prospective Purchase';
    let category: ExpenseCategory = 'Shopping & Quick-Commerce';

    if (normalized.includes('sneaker') || normalized.includes('shoe') || normalized.includes('clothes') || normalized.includes('hoodie')) {
      title = 'Fashion / Footwear Purchase';
      category = 'Shopping & Quick-Commerce';
    } else if (normalized.includes('swiggy') || normalized.includes('zomato') || normalized.includes('food') || normalized.includes('dinner') || normalized.includes('treat') || normalized.includes('cafe')) {
      title = 'Food & Dining Splurge';
      category = 'Food & Dining';
    } else if (normalized.includes('trip') || normalized.includes('cab') || normalized.includes('travel') || normalized.includes('metro') || normalized.includes('uber')) {
      title = 'Transit / Travel Expense';
      category = 'Transit & Commute';
    } else if (normalized.includes('headphone') || normalized.includes('game') || normalized.includes('gadget') || normalized.includes('concert') || normalized.includes('movie')) {
      title = 'Entertainment & Tech Gear';
      category = 'Academic & Tech';
    }

    const draft = {
      title,
      amount: extractedAmount,
      category,
      day: state.currentDay
    };

    const simulatedMetrics = calculateMetrics(state, draft);
    const diff = calculateConsequenceDiff(baselineMetrics, simulatedMetrics, extractedAmount, state);

    if (extractedAmount > baselineMetrics.balance || simulatedMetrics.isOverdraft) {
      const deficit = extractedAmount - baselineMetrics.balance;
      return {
        verdict: 'CRITICAL',
        verdictLabel: 'CRITICAL OVERDRAFT HAZARD',
        extractedAmount,
        extractedTitle: title,
        response: `Cannot afford this purchase right now. Your liquid cash is ₹${baselineMetrics.balance.toLocaleString('en-IN')}, and spending ₹${extractedAmount.toLocaleString('en-IN')} would immediately trigger a ₹${Math.abs(deficit).toLocaleString('en-IN')} deficit, exhausting your budget before Day 30.`,
        dataSnippet: {
          currentBalance: baselineMetrics.balance,
          simulatedBalance: simulatedMetrics.balance,
          currentAllowance: baselineMetrics.dailyAllowance,
          simulatedAllowance: simulatedMetrics.dailyAllowance,
          allowanceDelta: simulatedMetrics.dailyAllowance - baselineMetrics.dailyAllowance,
          projectedDay30Balance: simulatedMetrics.projectedDay30Balance,
          goalsCompromised: baselineMetrics.goalsAchievableCount - simulatedMetrics.goalsAchievableCount,
          isOverdraft: true
        }
      };
    }

    if (simulatedMetrics.dailyAllowance <= 40 || diff.severity === 'CRITICAL') {
      return {
        verdict: 'CRITICAL',
        verdictLabel: 'HIGH SOLVENCY RISK',
        extractedAmount,
        extractedTitle: title,
        response: `Spending ₹${extractedAmount.toLocaleString('en-IN')} is severe financial friction. It drops your safe daily allowance from ₹${baselineMetrics.dailyAllowance}/day to just ₹${simulatedMetrics.dailyAllowance}/day for the remaining ${remainingDays} days, eating ${(extractedAmount / Math.max(1, baselineMetrics.dailyAllowance)).toFixed(1)} days of living cushion.`,
        dataSnippet: {
          currentBalance: baselineMetrics.balance,
          simulatedBalance: simulatedMetrics.balance,
          currentAllowance: baselineMetrics.dailyAllowance,
          simulatedAllowance: simulatedMetrics.dailyAllowance,
          allowanceDelta: simulatedMetrics.dailyAllowance - baselineMetrics.dailyAllowance,
          projectedDay30Balance: simulatedMetrics.projectedDay30Balance,
          goalsCompromised: baselineMetrics.goalsAchievableCount - simulatedMetrics.goalsAchievableCount,
          isOverdraft: false
        }
      };
    }

    if (diff.severity === 'SEVERE' || diff.severity === 'MODERATE' || simulatedMetrics.dailyAllowance < 65) {
      return {
        verdict: 'CAUTION',
        verdictLabel: 'PROCEED WITH CAUTION',
        extractedAmount,
        extractedTitle: title,
        response: `You can absorb this ₹${extractedAmount.toLocaleString('en-IN')} purchase, but your daily allowance will tighten by ₹${Math.abs(simulatedMetrics.dailyAllowance - baselineMetrics.dailyAllowance)}/day (down to ₹${simulatedMetrics.dailyAllowance}/day). Consider waiting or using a budget alternative.`,
        dataSnippet: {
          currentBalance: baselineMetrics.balance,
          simulatedBalance: simulatedMetrics.balance,
          currentAllowance: baselineMetrics.dailyAllowance,
          simulatedAllowance: simulatedMetrics.dailyAllowance,
          allowanceDelta: simulatedMetrics.dailyAllowance - baselineMetrics.dailyAllowance,
          projectedDay30Balance: simulatedMetrics.projectedDay30Balance,
          goalsCompromised: baselineMetrics.goalsAchievableCount - simulatedMetrics.goalsAchievableCount,
          isOverdraft: false
        }
      };
    }

    return {
      verdict: 'SAFE',
      verdictLabel: 'SAFE TO COMMIT',
      extractedAmount,
      extractedTitle: title,
      response: `This ₹${extractedAmount.toLocaleString('en-IN')} purchase is within your safe discretionary cushion. Your safe allowance remains strong at ₹${simulatedMetrics.dailyAllowance}/day and all ${simulatedMetrics.goalsAchievableCount} savings goals remain solvent.`,
      dataSnippet: {
        currentBalance: baselineMetrics.balance,
        simulatedBalance: simulatedMetrics.balance,
        currentAllowance: baselineMetrics.dailyAllowance,
        simulatedAllowance: simulatedMetrics.dailyAllowance,
        allowanceDelta: simulatedMetrics.dailyAllowance - baselineMetrics.dailyAllowance,
        projectedDay30Balance: simulatedMetrics.projectedDay30Balance,
        goalsCompromised: 0,
        isOverdraft: false
      }
    };
  }

  // 6. Fallback / Educational Guidance
  return {
    verdict: 'SAFE',
    verdictLabel: 'SANVEKTRO ADVISOR',
    response: `I evaluate prospective purchases against your live ₹${state.startingBudget.toLocaleString('en-IN')} budget, remaining commitments, and daily safe allowance (₹${baselineMetrics.dailyAllowance}/day). Ask me if you can afford a specific purchase (e.g., "Can I afford ₹1,200 shoes?"), whether to pause subscriptions, or how to secure your savings targets!`,
    dataSnippet: {
      currentBalance: baselineMetrics.balance,
      simulatedBalance: baselineMetrics.balance,
      currentAllowance: baselineMetrics.dailyAllowance,
      simulatedAllowance: baselineMetrics.dailyAllowance,
      allowanceDelta: 0,
      projectedDay30Balance: baselineMetrics.projectedDay30Balance,
      goalsCompromised: 0,
      isOverdraft: false
    }
  };
}
