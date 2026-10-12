import { describe, expect, it } from 'vitest';
import type { HotlineRecord } from './hotlines';
import { getPublicHotlines, hasValidTelephoneValue } from './hotlines';

const base: HotlineRecord = {
  id: 'example',
  name: 'Example responder',
  phone: '+639171234567',
  displayPhone: '0917-123-4567',
  category: 'response',
  publicationStatus: 'published',
  provenance: {
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-09-23',
    lastUpdatedAt: '2026-09-23',
    sources: [
      {
        title: 'Official directory',
        organization: 'Government agency',
        url: 'https://agency.gov.ph/directory',
        type: 'national_government',
      },
    ],
  },
};

describe('hotline governance', () => {
  it('returns only publicly eligible sourced records', () => {
    const records: HotlineRecord[] = [
      base,
      { ...base, id: 'draft', publicationStatus: 'draft' },
      {
        ...base,
        id: 'unverified',
        provenance: {
          ...base.provenance,
          verificationStatus: 'awaiting_verification',
        },
      },
      {
        ...base,
        id: 'unsourced',
        provenance: { ...base.provenance, sources: [] },
      },
    ];

    expect(getPublicHotlines(records).map(record => record.id)).toEqual([
      'example',
    ]);
  });

  it('accepts normalized telephone values only', () => {
    expect(hasValidTelephoneValue('911')).toBe(true);
    expect(hasValidTelephoneValue('+639953234947')).toBe(true);
    expect(hasValidTelephoneValue('0995-323-4947')).toBe(false);
    expect(hasValidTelephoneValue('javascript:alert(1)')).toBe(false);
  });
});
