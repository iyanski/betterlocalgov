import { describe, expect, it } from 'vitest';
import { actionLabel, buildWhatsNew, type Revision } from './whatsNew';

const targets = new Map([
  [
    'government/departments/barangays',
    { title: 'Barangays', path: '/government/departments/barangays' },
  ],
  [
    'hotlines/national-emergency-911',
    {
      title: 'National Emergency Hotline',
      path: '/hotlines#national-emergency-911',
    },
  ],
]);

const revision = (
  contentId: string,
  timestamp: string,
  action = 'updated'
): Revision => ({
  contentId,
  action,
  timestamp,
  changedFields: ['provenance'],
});

describe('buildWhatsNew', () => {
  it('lists only revisions of publicly visible records', () => {
    const data = buildWhatsNew(
      [
        revision(
          'government/departments/barangays',
          '2026-09-23T10:00:00+08:00'
        ),
        revision(
          'government/departments/elected-officials',
          '2026-10-12T14:00:00+08:00',
          'created'
        ),
      ],
      targets
    );

    expect(data.entries.map(e => e.contentId)).toEqual([
      'government/departments/barangays',
    ]);
  });

  it('orders newest first and reports the latest date', () => {
    const data = buildWhatsNew(
      [
        revision(
          'government/departments/barangays',
          '2026-09-23T10:00:00+08:00'
        ),
        revision(
          'hotlines/national-emergency-911',
          '2026-10-01T09:00:00+08:00'
        ),
      ],
      targets
    );

    expect(data.entries.map(e => e.title)).toEqual([
      'National Emergency Hotline',
      'Barangays',
    ]);
    expect(data.lastUpdated).toBe('2026-10-01');
    expect(data.entries[0].date).toBe('2026-10-01');
  });

  it('applies the limit and handles an empty history', () => {
    const many = Array.from({ length: 5 }, (_, i) =>
      revision(
        'government/departments/barangays',
        `2026-09-0${i + 1}T00:00:00+08:00`
      )
    );
    expect(buildWhatsNew(many, targets, 2).entries).toHaveLength(2);
    expect(buildWhatsNew([], targets)).toEqual({
      lastUpdated: undefined,
      entries: [],
    });
  });

  it('skips revisions with an unusable timestamp', () => {
    expect(
      buildWhatsNew(
        [revision('government/departments/barangays', 'yesterday')],
        targets
      ).entries
    ).toEqual([]);
  });
});

describe('actionLabel', () => {
  it('uses plain labels', () => {
    expect(actionLabel('created')).toBe('Added');
    expect(actionLabel('updated')).toBe('Updated');
    expect(actionLabel('archived')).toBe('Archived');
  });
});
