import { describe, expect, it } from 'vitest';
import {
  isIndexEntryPublic,
  isRawRecordPublic,
  isRecordPublic,
} from './lib/visibility.mjs';
import { isRecordPublic as appIsRecordPublic } from '../src/lib/contentGovernance';
import { buildMarkdownContent } from '../src/lib/markdownLoader';

const PUBLICATION = ['draft', 'published', 'archived', undefined];
const VERIFICATION = [
  'awaiting_verification',
  'sourced',
  'verified',
  'outdated',
  'not-a-status',
];
const SCOPES = ['local', 'national_applicable', undefined];
const SOURCE_TYPES = ['national_government', 'other_public_source'];

function rawRecord(
  publicationStatus: string | undefined,
  verificationStatus: string,
  scope: string | undefined,
  sourceType: string
) {
  return {
    ...(publicationStatus ? { publicationStatus } : {}),
    ...(scope ? { scope } : {}),
    provenance: {
      verificationStatus,
      sources: [
        {
          title: 'Source',
          organization: 'Agency',
          url: 'https://agency.gov.ph/page',
          type: sourceType,
        },
      ],
    },
  };
}

describe('shared visibility policy', () => {
  it('gives the same answer for raw JSON as the app does after parsing', () => {
    for (const publicationStatus of PUBLICATION) {
      for (const verificationStatus of VERIFICATION) {
        for (const scope of SCOPES) {
          for (const sourceType of SOURCE_TYPES) {
            for (const allowSourced of [true, false]) {
              const raw = rawRecord(
                publicationStatus,
                verificationStatus,
                scope,
                sourceType
              );
              const parsed = buildMarkdownContent('# Title\n\nBody', raw);
              expect(
                isRawRecordPublic(raw, allowSourced),
                JSON.stringify({ raw, allowSourced })
              ).toBe(appIsRecordPublic(parsed, allowSourced));
            }
          }
        }
      }
    }
  });

  it('never publishes a record without provenance', () => {
    expect(isRawRecordPublic({ publicationStatus: 'published' })).toBe(false);
    expect(isRawRecordPublic({})).toBe(false);
    expect(isRawRecordPublic(undefined)).toBe(false);
    expect(isRecordPublic(undefined)).toBe(false);
  });

  it('ignores sources without a usable URL when checking national scope', () => {
    const raw = rawRecord(
      'published',
      'verified',
      'national_applicable',
      'national_government'
    );
    raw.provenance.sources[0].url = 'javascript:alert(1)';
    expect(isRawRecordPublic(raw)).toBe(false);
  });

  it('maps the legacy pending status to awaiting verification', () => {
    expect(
      isRawRecordPublic({
        publicationStatus: 'published',
        provenance: { status: 'pending', sources: [] },
      })
    ).toBe(false);
  });

  it('applies the legacy published flag to index entries', () => {
    expect(isIndexEntryPublic({ slug: 'a', published: true })).toBe(true);
    expect(isIndexEntryPublic({ slug: 'a', published: false })).toBe(false);
    expect(isIndexEntryPublic({ slug: 'a' })).toBe(false);
    expect(
      isIndexEntryPublic(
        {
          slug: 'a',
          publicationStatus: 'published',
          verificationStatus: 'sourced',
        },
        false
      )
    ).toBe(false);
  });
});
