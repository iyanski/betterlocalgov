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

export interface SourceReference {
  title: string;
  organization: string;
  url: string;
  type: SourceType;
  publishedAt?: string;
  asOf?: string;
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
