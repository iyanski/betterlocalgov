import { describe, expect, it } from 'vitest';
import {
  buildCorrectionIssueUrl,
  validateCorrectionReport,
} from './correctionReport';

const validReport = {
  page: '/government/departments/example',
  reason: 'Outdated information',
  correction: 'The displayed record has been replaced by a newer publication.',
  sourceUrl: 'https://agency.gov.ph/new-record',
  website: '',
};

describe('correction reports', () => {
  it('rejects invalid URLs, short reports, and honeypot submissions', () => {
    expect(
      validateCorrectionReport({
        ...validReport,
        correction: 'short',
        sourceUrl: 'javascript:alert(1)',
        website: 'spam.example',
      })
    ).toMatchObject({
      correction: expect.any(String),
      sourceUrl: expect.any(String),
      form: expect.any(String),
    });
  });

  it('prepares a timestamped, encoded issue without reporter identity', () => {
    const result = new URL(
      buildCorrectionIssueUrl(
        validReport,
        'https://github.com/example/project/issues/new',
        '2026-09-23T02:00:00.000Z'
      )
    );

    expect(result.origin + result.pathname).toBe(
      'https://github.com/example/project/issues/new'
    );
    expect(result.searchParams.get('title')).toContain(validReport.page);
    expect(result.searchParams.get('body')).toContain(validReport.sourceUrl);
    expect(result.searchParams.get('body')).toContain(
      '2026-09-23T02:00:00.000Z'
    );
    expect(result.searchParams.get('labels')).toBe('content-correction,new');
  });

  it('rejects an unsafe configured destination', () => {
    expect(() =>
      buildCorrectionIssueUrl(validReport, 'javascript:alert(1)')
    ).toThrow(/HTTP or HTTPS/);
  });
});
