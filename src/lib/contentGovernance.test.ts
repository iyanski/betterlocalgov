import { describe, expect, it } from 'vitest';
import {
  isDueForReverification,
  isPubliclyVisible,
  isSafeHttpUrl,
} from './contentGovernance';

describe('content governance', () => {
  it('publishes only eligible lifecycle combinations', () => {
    expect(isPubliclyVisible('published', 'verified')).toBe(true);
    expect(isPubliclyVisible('published', 'sourced')).toBe(true);
    expect(isPubliclyVisible('published', 'sourced', false)).toBe(false);
    expect(isPubliclyVisible('draft', 'verified')).toBe(false);
    expect(isPubliclyVisible('archived', 'verified')).toBe(false);
    expect(isPubliclyVisible('published', 'awaiting_verification')).toBe(false);
  });

  it('accepts only HTTP source URLs', () => {
    expect(isSafeHttpUrl('https://psa.gov.ph/example')).toBe(true);
    expect(isSafeHttpUrl('http://example.test/document')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('not a URL')).toBe(false);
  });

  it('flags missing and expired verification dates', () => {
    const now = new Date('2026-09-23T00:00:00Z');
    expect(isDueForReverification(undefined, 12, now)).toBe(true);
    expect(isDueForReverification('2025-09-22', 12, now)).toBe(true);
    expect(isDueForReverification('2026-04-01', 12, now)).toBe(false);
  });
});
