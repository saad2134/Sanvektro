import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  hasPrototypePollution,
  sanitizeObject,
  sanitizeAmount
} from '../services/security';

describe('Sanvektro Security & Data Sanitization', () => {
  it('strips malicious script tags from text inputs', () => {
    const malicious = '<script>alert("XSS")</script>Swiggy Order';
    const clean = sanitizeText(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Swiggy Order');
  });

  it('detects prototype pollution keys in payloads', () => {
    const badObject = JSON.parse('{"__proto__": {"admin": true}}');
    expect(hasPrototypePollution(badObject)).toBe(true);
  });

  it('safely sanitizes objects containing prototype pollution', () => {
    const badPayload = {
      title: 'Normal Title',
      __proto__: { injected: true }
    };
    const sanitized = sanitizeObject(badPayload);
    expect(hasPrototypePollution(sanitized)).toBe(false);
    expect((sanitized as Record<string, unknown>).title).toBe('Normal Title');
  });

  it('clamps and sanitizes budget amounts safely', () => {
    expect(sanitizeAmount(-500)).toBe(0);
    expect(sanitizeAmount(250.75)).toBe(251);
    expect(sanitizeAmount('invalid-NaN')).toBe(0);
    expect(sanitizeAmount(5000000, 0, 100000)).toBe(100000);
  });

  it('validates expense draft schemas and enforces bounds', async () => {
    const { validateExpenseDraft } = await import('../services/security');
    
    // Valid expense
    const valid = validateExpenseDraft({
      title: 'Cafe Coffee',
      amount: 250,
      category: 'Food & Dining',
      day: 5
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized?.title).toBe('Cafe Coffee');
    expect(valid.sanitized?.amount).toBe(250);

    // Negative amount rejected
    const negative = validateExpenseDraft({
      title: 'Invalid',
      amount: -100,
      category: 'Food & Dining',
      day: 5
    });
    expect(negative.isValid).toBe(false);
    expect(negative.errors).toContain('Amount must be a positive number');

    // Amount exceeding budget cap rejected
    const excess = validateExpenseDraft({
      title: 'Super Yacht',
      amount: 15000,
      category: 'Shopping & Quick-Commerce',
      day: 5
    });
    expect(excess.isValid).toBe(false);
    expect(excess.errors).toContain('Single transaction cannot exceed total budget cap of ₹10,000');

    // Missing title rejected
    const noTitle = validateExpenseDraft({
      title: '',
      amount: 100,
      category: 'Food & Dining',
      day: 5
    });
    expect(noTitle.isValid).toBe(false);
    expect(noTitle.errors).toContain('Expense title is required');
  });

  it('validates goal schemas and clamps target limits', async () => {
    const { validateGoalPayload } = await import('../services/security');
    const validGoal = validateGoalPayload({
      name: 'Keyboard Fund',
      targetAmount: 4500,
      currentAmount: 500,
      targetDay: 28,
      emoji: '⌨️',
      priority: 'HIGH'
    });
    expect(validGoal.isValid).toBe(true);
    expect(validGoal.sanitized?.name).toBe('Keyboard Fund');

    const invalidGoal = validateGoalPayload({
      name: '',
      targetAmount: -500
    });
    expect(invalidGoal.isValid).toBe(false);
  });

  it('validates full FinancialState schemas and imports JSON archives safely', async () => {
    const { validateFinancialStateSchema } = await import('../services/security');
    const { importStateFromJSON } = await import('../services/exportService');
    const { DEFAULT_HOSTEL_HUSTLER } = await import('../data/presets');

    // Valid state validation
    const validResult = validateFinancialStateSchema(DEFAULT_HOSTEL_HUSTLER);
    expect(validResult.isValid).toBe(true);

    // Corrupted state missing transactions
    const corrupted = { startingBudget: 10000, currentDay: 5 };
    const corruptResult = validateFinancialStateSchema(corrupted);
    expect(corruptResult.isValid).toBe(false);

    // Safe import from JSON
    const exportedJson = JSON.stringify({ financialState: DEFAULT_HOSTEL_HUSTLER });
    const imported = importStateFromJSON(exportedJson);
    expect(imported.valid).toBe(true);
    expect(imported.state?.startingBudget).toBe(10000);

    // Malformed JSON string
    const badJson = importStateFromJSON('{ bad json');
    expect(badJson.valid).toBe(false);
    expect(badJson.error).toBeDefined();
  });
});
