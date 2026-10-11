import DOMPurify from 'dompurify';

/**
 * Security Service for Sanvektro ✦ Data Sanitization & Prototype Pollution Defense
 * Ensures zero XSS injection vectors and safe state parsing.
 */

const DANGEROUS_PROTOTYPE_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Checks recursively whether an input contains prototype-pollution keys
 */
export function hasPrototypePollution(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => hasPrototypePollution(item));
  }

  const record = obj as Record<string, unknown>;
  const keys = Object.getOwnPropertyNames(record);

  for (const key of keys) {
    if (DANGEROUS_PROTOTYPE_KEYS.includes(key)) {
      return true;
    }
    const val = record[key];
    if (typeof val === 'object' && val !== null) {
      if (hasPrototypePollution(val)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Recursively deep-sanitizes an object by stripping prototype pollution keys
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item)) as unknown as T;
  }

  const result = Object.create(null) as Record<string, unknown>;
  const record = input as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (DANGEROUS_PROTOTYPE_KEYS.includes(key)) {
      continue;
    }
    result[key] = sanitizeObject(record[key]);
  }

  return result as T;
}

/**
 * Sanitizes user-entered text (titles, descriptions, categories) to prevent XSS
 */
export function sanitizeText(input: string | undefined | null, maxLength?: number): string {
  if (!input) return '';
  const cleaned = DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Validates and clamps numerical budget amounts safely
 */
export function sanitizeAmount(val: number | string, min = 0, max = 1000000): number {
  const parsed = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(parsed) || !isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export const VALID_CATEGORIES = [
  'Food & Dining',
  'Transit & Commute',
  'Shopping & Quick-Commerce',
  'Entertainment & Social',
  'Academic & Tech',
  'Health & Emergency',
  'Commitments',
  'Other'
] as const;

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  sanitized?: T;
}

/**
 * Validates transaction / simulation draft payload
 */
export function validateExpenseDraft(input: unknown): ValidationResult<{
  title: string;
  amount: number;
  category: string;
  day: number;
}> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['Expense payload must be an object'] };
  }

  const record = input as Record<string, unknown>;
  const rawTitle = typeof record.title === 'string' ? record.title : '';
  const title = sanitizeText(rawTitle, 100);
  if (!title || title.length < 1) {
    errors.push('Expense title is required');
  }

  const rawAmount = Number(record.amount);
  if (isNaN(rawAmount) || rawAmount <= 0) {
    errors.push('Amount must be a positive number');
  } else if (rawAmount > 10000) {
    errors.push('Single transaction cannot exceed total budget cap of ₹10,000');
  }

  const rawDay = Number(record.day);
  if (isNaN(rawDay) || rawDay < 1 || rawDay > 30) {
    errors.push('Day must be an integer between 1 and 30');
  }

  const rawCategory = typeof record.category === 'string' ? record.category : 'Other';
  const category = (VALID_CATEGORIES as readonly string[]).includes(rawCategory)
    ? rawCategory
    : 'Other';

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      title,
      amount: sanitizeAmount(rawAmount, 1, 10000),
      category,
      day: Math.floor(rawDay)
    }
  };
}

/**
 * Validates savings goal payload
 */
export function validateGoalPayload(input: unknown): ValidationResult<{
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay: number;
  emoji: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['Goal payload must be an object'] };
  }

  const record = input as Record<string, unknown>;
  const rawName = typeof record.name === 'string' ? record.name : '';
  const name = sanitizeText(rawName, 50);
  if (!name || name.length < 2) {
    errors.push('Goal name must be at least 2 characters');
  }

  const targetAmount = Number(record.targetAmount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.push('Target amount must be a positive number');
  } else if (targetAmount > 50000) {
    errors.push('Goal target cannot exceed ₹50,000');
  }

  const currentAmount = sanitizeAmount(Number(record.currentAmount) || 0, 0, targetAmount || 50000);
  const targetDay = Math.min(30, Math.max(1, Number(record.targetDay) || 30));
  const rawPriority = String(record.priority || 'MEDIUM').toUpperCase();
  const priority = (['HIGH', 'MEDIUM', 'LOW'].includes(rawPriority) ? rawPriority : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW';
  const emoji = sanitizeText(typeof record.emoji === 'string' ? record.emoji : '🎯', 8);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      id: typeof record.id === 'string' ? record.id : `goal-${Date.now()}`,
      name,
      targetAmount,
      currentAmount,
      targetDay,
      emoji,
      priority
    }
  };
}

/**
 * Validates full FinancialState schema for import / storage hydration
 */
export function validateFinancialStateSchema(input: unknown): ValidationResult<unknown> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['State payload must be a JSON object'] };
  }

  if (hasPrototypePollution(input)) {
    return { isValid: false, errors: ['Malicious prototype pollution keys detected in payload'] };
  }

  const clean = sanitizeObject(input as Record<string, unknown>);

  const startingBudget = Number(clean.startingBudget);
  if (isNaN(startingBudget) || startingBudget < 0) {
    errors.push('Invalid startingBudget: must be non-negative');
  }

  const currentDay = Number(clean.currentDay);
  if (isNaN(currentDay) || currentDay < 1 || currentDay > 30) {
    errors.push('Invalid currentDay: must be between 1 and 30');
  }

  if (!Array.isArray(clean.transactions)) {
    errors.push('Invalid transactions: must be an array');
  }

  if (!Array.isArray(clean.commitments)) {
    errors.push('Invalid commitments: must be an array');
  }

  if (!Array.isArray(clean.subscriptions)) {
    errors.push('Invalid subscriptions: must be an array');
  }

  if (!Array.isArray(clean.savingsGoals)) {
    errors.push('Invalid savingsGoals: must be an array');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: clean
  };
}

