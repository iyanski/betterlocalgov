import { describe, expect, it } from 'vitest';
import {
  hasNationalSource,
  isDueForReverification,
  isPubliclyVisible,
  isSafeHttpUrl,
  parseContentScope,
  sourcesMissingLocator,
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

  it('defaults unknown or missing scopes to local', () => {
    expect(parseContentScope(undefined)).toBe('local');
    expect(parseContentScope('national_applicable')).toBe(
      'national_applicable'
    );
    expect(parseContentScope('regional')).toBe('local');
  });

  it('requires a national government or official publication source', () => {
    expect(hasNationalSource([{ type: 'national_government' }])).toBe(true);
    expect(
      hasNationalSource([{ type: 'official_government_publication' }])
    ).toBe(true);
    expect(
      hasNationalSource([
        { type: 'provincial_government' },
        { type: 'other_public_source' },
      ])
    ).toBe(false);
    expect(hasNationalSource([])).toBe(false);
  });

  it('finds sources without a usable locator', () => {
    const missing = sourcesMissingLocator([
      { locator: 'p. 4' },
      { locator: '  ' },
      {},
    ]);
    expect(missing).toHaveLength(2);
  });
});
