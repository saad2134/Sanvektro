/**
 * Sanvektro ✦ Decision Coach Query Evaluator Test Suite
 *
 * Validates deterministic mathematical reasoning across:
 * 1. Prospective purchase dilemma evaluations (Safe, Caution, Critical Overdraft).
 * 2. Subscription pause analysis (monthly drain, annual run-rate, daily recovery).
 * 3. Safe daily burn limit queries.
 * 4. Savings target feasibility and shortfall pacing.
 * 5. Extraction of amounts and categories from natural language.
 */

import { describe, it, expect } from 'vitest';
import { evaluateCoachQuery } from '../utils/coachEvaluator';
import { calculateMetrics } from '../utils/calculations';
import { PERSONA_PRESETS } from '../data/presets';

describe('Sanvektro Decision Coach Evaluation Engine', () => {
  const hostelerState = PERSONA_PRESETS[0].state; // College Hosteler (₹10k budget, Day 10)
  const baselineMetrics = calculateMetrics(hostelerState);

  it('correctly evaluates affordable minor treats as SAFE', () => {
    const result = evaluateCoachQuery(hostelerState, 'Can I afford ₹150 for filter coffee and snacks today?', baselineMetrics);

    expect(result.verdict).toBe('SAFE');
    expect(result.extractedAmount).toBe(150);
    expect(result.dataSnippet).toBeDefined();
    expect(result.dataSnippet?.simulatedBalance).toBe(baselineMetrics.balance - 150);
    expect(result.dataSnippet?.isOverdraft).toBe(false);
  });

  it('identifies heavy discretionary purchase as CAUTION or CRITICAL when allowance tightens', () => {
    const result = evaluateCoachQuery(hostelerState, 'Can I buy ₹1,800 sneakers today?', baselineMetrics);

    expect(result.verdict).toMatch(/CAUTION|CRITICAL/);
    expect(result.extractedAmount).toBe(1800);
    expect(result.dataSnippet?.allowanceDelta).toBeLessThan(0);
    expect(result.response).toContain('₹1,800');
  });

  it('identifies massive purchase exceeding balance as CRITICAL OVERDRAFT HAZARD', () => {
    const result = evaluateCoachQuery(hostelerState, 'Can I afford ₹25,000 for a gaming laptop?', baselineMetrics);

    expect(result.verdict).toBe('CRITICAL');
    expect(result.verdictLabel).toContain('OVERDRAFT');
    expect(result.extractedAmount).toBe(25000);
    expect(result.dataSnippet?.isOverdraft).toBe(true);
    expect(result.response).toContain('Cannot afford this purchase');
  });

  it('evaluates subscription cancellation questions with annual run-rate calculation', () => {
    const result = evaluateCoachQuery(hostelerState, 'Should I pause my Netflix or Spotify subscription?', baselineMetrics);

    expect(result.verdict).toBeDefined();
    expect(result.response).toContain('active subscriptions');
    expect(result.response).toContain('annually');
    expect(result.dataSnippet?.allowanceDelta).toBeGreaterThanOrEqual(0);
  });

  it('evaluates safe spending limit queries with exact baseline allowance', () => {
    const result = evaluateCoachQuery(hostelerState, 'What is my exact safest spending limit for today?', baselineMetrics);

    expect(result.verdict).toBe('SAFE');
    expect(result.response).toContain(`₹${baselineMetrics.dailyAllowance}/day`);
    expect(result.response).toContain(`Day ${hostelerState.currentDay}`);
    expect(result.dataSnippet?.currentAllowance).toBe(baselineMetrics.dailyAllowance);
  });

  it('evaluates savings goals and emergency buffer feasibility', () => {
    const result = evaluateCoachQuery(hostelerState, 'How do I guarantee I save ₹2,000 this month?', baselineMetrics);

    expect(result.verdict).toMatch(/SAFE|CAUTION/);
    expect(result.response).toContain('savings');
    expect(result.dataSnippet).toBeDefined();
  });

  it('returns structured educational guidance for general queries without numbers', () => {
    const result = evaluateCoachQuery(hostelerState, 'How does the budgeting system work?', baselineMetrics);

    expect(result.verdict).toBe('SAFE');
    expect(result.verdictLabel).toBe('SANVEKTRO ADVISOR');
    expect(result.response).toContain('evaluate prospective purchases');
  });
});
