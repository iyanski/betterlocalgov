import { describe, expect, it } from 'vitest';
import {
  validateLocators,
  validateProject,
  validateRequest,
  validateScope,
} from './audit-rules.mjs';

const nationalSource = {
  title: 'Agency page',
  organization: 'Agency',
  url: 'https://agency.gov.ph/page',
  type: 'national_government',
};

describe('validateScope', () => {
  it('treats a missing scope as local', () => {
    expect(validateScope({})).toEqual([]);
  });

  it('rejects unknown scopes', () => {
    expect(validateScope({ scope: 'regional' })).toHaveLength(1);
  });

  it('requires a national source for national_applicable records', () => {
    expect(
      validateScope({
        scope: 'national_applicable',
        provenance: {
          sources: [{ ...nationalSource, type: 'other_public_source' }],
        },
      })
    ).toHaveLength(1);
    expect(validateScope({ scope: 'national_applicable' })).toHaveLength(1);
    expect(
      validateScope({
        scope: 'national_applicable',
        provenance: { sources: [nationalSource] },
      })
    ).toEqual([]);
    expect(
      validateScope({
        scope: 'national_applicable',
        provenance: {
          sources: [
            { ...nationalSource, type: 'official_government_publication' },
          ],
        },
      })
    ).toEqual([]);
  });
});

describe('validateLocators', () => {
  it('ignores records that do not contain figures', () => {
    expect(
      validateLocators({ provenance: { sources: [nationalSource] } })
    ).toEqual([]);
  });

  it('requires a locator on every source when containsFigures is true', () => {
    const record = {
      containsFigures: true,
      provenance: {
        sources: [
          { ...nationalSource, locator: 'Table 2' },
          { ...nationalSource, locator: ' ' },
          nationalSource,
        ],
      },
    };
    expect(validateLocators(record)).toEqual([
      'source 2 needs a locator (containsFigures)',
      'source 3 needs a locator (containsFigures)',
    ]);
  });

  it('requires at least one source', () => {
    expect(validateLocators({ containsFigures: true })).toHaveLength(1);
  });
});

describe('validateProject', () => {
  const valid = {
    containsFigures: true,
    project: {
      name: 'Bridge repair',
      implementingAgency: 'DPWH Example DEO',
      status: 'completed',
      location: 'Barangay Example',
      amount: {
        text: 'P2 million',
        value: 2000000,
        statement: 'costing P2 million',
      },
    },
  };

  it('accepts a complete record without a contractor', () => {
    expect(validateProject(valid)).toEqual([]);
  });

  it('flags missing fields, a non-numeric amount and missing containsFigures', () => {
    const errors = validateProject({
      project: { ...valid.project, name: '', amount: { text: 'P2 million' } },
    });
    expect(errors).toEqual(
      expect.arrayContaining([
        'project.name is required',
        'project.amount needs text, a numeric value and the source statement',
        'project records must set containsFigures to true',
      ])
    );
  });

  it('rejects an empty contractor instead of publishing a blank name', () => {
    expect(
      validateProject({
        ...valid,
        project: { ...valid.project, contractor: ' ' },
      })
    ).toHaveLength(1);
  });

  it('requires a project object', () => {
    expect(validateProject({})).toHaveLength(1);
  });
});

describe('validateRequest', () => {
  const draft = {
    publicationStatus: 'draft',
    request: {
      agency: 'Example Agency',
      channel: 'efoi',
      subject: 'Example records',
      status: 'pending',
    },
  };
  const published = {
    publicationStatus: 'published',
    request: { ...draft.request, dateSent: '2026-11-02' },
  };

  it('accepts a seed draft and a complete published request', () => {
    expect(validateRequest(draft)).toEqual([]);
    expect(validateRequest(published)).toEqual([]);
  });

  it('rejects unknown channel and status values', () => {
    const errors = validateRequest({
      ...draft,
      request: { ...draft.request, channel: 'fax', status: 'won' },
    });
    expect(errors).toHaveLength(2);
  });

  it('requires a sent date to publish but forbids one on unfiled drafts', () => {
    expect(
      validateRequest({ ...published, request: { ...draft.request } })
    ).toEqual(['published requests need request.dateSent (YYYY-MM-DD)']);
    expect(
      validateRequest({
        ...draft,
        request: { ...draft.request, dateSent: '2026-11-02' },
      })
    ).toEqual(['unpublished seed requests must not carry a sent date']);
  });

  it('validates optional response fields', () => {
    const errors = validateRequest({
      ...published,
      request: {
        ...published.request,
        responseDate: 'soon',
        publicRequestUrl: 'ftp://example.test',
      },
    });
    expect(errors).toHaveLength(2);
  });
});
