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
});
