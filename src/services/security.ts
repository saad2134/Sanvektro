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

