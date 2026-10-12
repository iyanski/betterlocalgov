import { describe, expect, it } from 'vitest';
import {
  getPublicProjects,
  parseProjectRecord,
  publicProjects,
  sortProjects,
} from './projects';

const base = {
  publicationStatus: 'published',
  project: {
    name: 'Bridge repair',
    implementingAgency: 'DPWH Example DEO',
    fundSource: 'General Appropriations Act (GAA)',
    fundYear: '2023',
    amount: {
      text: 'P2 million',
      value: 2000000,
      statement: 'costing P2 million',
    },
    status: 'completed',
    location: 'Barangay Example',
  },
  provenance: {
    verificationStatus: 'sourced',
    lastUpdatedAt: '2026-10-12',
    sources: [
      {
        title: 'Release',
        organization: 'DPWH',
        url: 'https://dpwh.gov.ph/example',
        type: 'national_government',
        locator: 'Paragraph 2',
      },
    ],
  },
};

function record(id: string, overrides: Record<string, unknown> = {}) {
  const parsed = parseProjectRecord(id, { ...base, ...overrides });
  if (!parsed) throw new Error('fixture should parse');
  return parsed;
}

describe('parseProjectRecord', () => {
  it('parses a complete record and leaves the contractor unset', () => {
    const parsed = record('a');
    expect(parsed.project.contractor).toBeUndefined();
    expect(parsed.project.amount.text).toBe('P2 million');
  });

  it('rejects records with missing or mistyped fields', () => {
    const noAmount = { ...base.project, amount: { text: 'P2 million' } };
    expect(
      parseProjectRecord('x', { ...base, project: noAmount })
    ).toBeUndefined();
    expect(
      parseProjectRecord('x', { ...base, publicationStatus: 'live' })
    ).toBeUndefined();
    expect(
      parseProjectRecord('x', { ...base, project: undefined })
    ).toBeUndefined();
  });
});

describe('getPublicProjects', () => {
  it('keeps only visible records whose sources all carry a locator', () => {
    const visible = record('visible');
    const draft = record('draft', { publicationStatus: 'draft' });
    const noLocator = record('no-locator', {
      provenance: {
        ...base.provenance,
        sources: [{ ...base.provenance.sources[0], locator: undefined }],
      },
    });
    const waiting = record('waiting', {
      provenance: {
        ...base.provenance,
        verificationStatus: 'awaiting_verification',
      },
    });

    expect(
      getPublicProjects([visible, draft, noLocator, waiting]).map(r => r.id)
    ).toEqual(['visible']);
  });

  it('hides sourced records when sourced content is disabled', () => {
    expect(getPublicProjects([record('a')], false)).toEqual([]);
  });
});

describe('sortProjects', () => {
  const small = record('small', {
    project: {
      ...base.project,
      name: 'Zeta',
      amount: { text: 'P7.1 million', value: 7100000, statement: 's' },
    },
  });
  const large = record('large', {
    project: {
      ...base.project,
      name: 'Alpha',
      amount: { text: 'P50 million', value: 50000000, statement: 's' },
    },
  });

  it('sorts amounts numerically, not alphabetically', () => {
    expect(sortProjects([large, small], 'amount').map(r => r.id)).toEqual([
      'small',
      'large',
    ]);
    expect(
      sortProjects([small, large], 'amount', 'desc').map(r => r.id)
    ).toEqual(['large', 'small']);
  });

  it('sorts text columns and does not mutate the input', () => {
    const input = [small, large];
    expect(sortProjects(input, 'name').map(r => r.id)).toEqual([
      'large',
      'small',
    ]);
    expect(input.map(r => r.id)).toEqual(['small', 'large']);
  });
});

describe('repository project records', () => {
  it('publishes only DPWH-sourced rows with locators', () => {
    expect(publicProjects.length).toBeGreaterThan(0);
    for (const row of publicProjects) {
      expect(row.provenance.sources.every(s => s.locator)).toBe(true);
      expect(row.provenance.sources[0].type).toBe('national_government');
    }
  });
});
