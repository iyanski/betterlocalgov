export const VERIFICATION_STATUSES = [
  'awaiting_verification',
  'sourced',
  'verified',
  'outdated',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const SOURCE_TYPES = [
  'lgu_official',
  'national_government',
  'provincial_government',
  'official_government_publication',
  'official_government_social_media',
  'public_document',
  'other_public_source',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const CONTENT_SCOPES = ['local', 'national_applicable'] as const;

export type ContentScope = (typeof CONTENT_SCOPES)[number];

export const DEFAULT_CONTENT_SCOPE: ContentScope = 'local';

/** Source types that can back a `national_applicable` record. */
export const NATIONAL_SOURCE_TYPES: readonly SourceType[] = [
  'national_government',
  'official_government_publication',
];

export const NATIONAL_SCOPE_NOTICE =
  'This is a national government procedure that applies in Gattaran. Local office locations, hours, contacts and any local fees have not been verified by Better Gattaran. Confirm with the issuing agency.';

export interface SourceReference {
  title: string;
  organization: string;
  url: string;
  type: SourceType;
  publishedAt?: string;
  asOf?: string;
  /** Page, table or section inside the source, e.g. "p. 47, Observation 3". */
  locator?: string;
}

export interface ContentProvenance {
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  lastUpdatedAt?: string;
  asOf?: string;
  sources: SourceReference[];
}

export const verificationStatusDetails: Record<
  VerificationStatus,
  { label: string; description: string; className: string }
> = {
  awaiting_verification: {
    label: 'Awaiting verification',
    description:
      'This information has not yet been confirmed against an authoritative source.',
    className: 'border-warning-300 bg-warning-50 text-warning-900',
  },
  sourced: {
    label: 'Sourced public information',
    description:
      'A public source is recorded, but Better Gattaran has not independently confirmed the information.',
    className: 'border-primary-200 bg-primary-50 text-primary-900',
  },
  verified: {
    label: 'Verified public information',
    description:
      'Better Gattaran checked this information against the sources shown below.',
    className: 'border-success-300 bg-success-50 text-success-900',
  },
  outdated: {
    label: 'Potentially outdated information',
    description:
      'This information is retained for context but may no longer be current.',
    className: 'border-warning-400 bg-warning-50 text-warning-900',
  },
};

export const sourceTypeLabels: Record<SourceType, string> = {
  lgu_official: 'LGU official source',
  national_government: 'National government agency',
  provincial_government: 'Provincial government',
  official_government_publication: 'Official government publication',
  official_government_social_media: 'Official government social media',
  public_document: 'Public document',
  other_public_source: 'Other public source',
};

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isPubliclyVisible(
  publicationStatus: PublicationStatus,
  verificationStatus: VerificationStatus,
  allowSourced = true
): boolean {
  if (publicationStatus !== 'published') return false;
  return (
    verificationStatus === 'verified' ||
    (allowSourced && verificationStatus === 'sourced') ||
    verificationStatus === 'outdated'
  );
}

export function isDueForReverification(
  lastVerifiedAt: string | undefined,
  intervalMonths: number,
  now = new Date()
): boolean {
  if (!lastVerifiedAt) return true;

  const verified = new Date(`${lastVerifiedAt}T00:00:00Z`);
  if (Number.isNaN(verified.getTime())) return true;

  const due = new Date(verified);
  due.setUTCMonth(due.getUTCMonth() + intervalMonths);
  return due <= now;
}

/** Unknown or missing scope values fall back to `local`. */
export function parseContentScope(value: unknown): ContentScope {
  return CONTENT_SCOPES.includes(value as ContentScope)
    ? (value as ContentScope)
    : DEFAULT_CONTENT_SCOPE;
}

export function hasNationalSource(
  sources: ReadonlyArray<Pick<SourceReference, 'type'>>
): boolean {
  return sources.some(source => NATIONAL_SOURCE_TYPES.includes(source.type));
}

/** Sources of a figures-bearing record that lack a non-empty locator. */
export function sourcesMissingLocator<
  T extends Pick<SourceReference, 'locator'>,
>(sources: readonly T[]): T[] {
  return sources.filter(source => !source.locator?.trim());
}

export interface PublicationCandidate {
  publicationStatus: PublicationStatus;
  scope?: ContentScope;
  provenance?: {
    verificationStatus: VerificationStatus;
    sources: ReadonlyArray<Pick<SourceReference, 'type'>>;
  };
}

/**
 * The single visibility policy for a content record: used by the document
 * viewer, the build-time pre-renderer, the sitemap, and What's new.
 */
export function isRecordPublic(
  record: PublicationCandidate,
  allowSourced = true
): boolean {
  if (!record.provenance) return false;
  if (
    record.scope === 'national_applicable' &&
    !hasNationalSource(record.provenance.sources)
  ) {
    return false;
  }
  return isPubliclyVisible(
    record.publicationStatus,
    record.provenance.verificationStatus,
    allowSourced
  );
}
