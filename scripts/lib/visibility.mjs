/**
 * The single content visibility policy for Better Gattaran.
 *
 * Plain JavaScript so that every consumer can share it without a build step:
 * - the browser app, through src/lib/contentGovernance.ts (typed re-exports);
 * - the build-time draft exclusion plugin (content-visibility-plugin.mjs);
 * - the dist/ leak check (scripts/check-dist-leaks.mjs);
 * - the search indexer (scripts/index-content.mjs);
 * - the content audit (scripts/audit-rules.mjs).
 *
 * Do not copy these rules anywhere else. Change them here and the types in
 * visibility.d.mts together.
 */

export const NATIONAL_SOURCE_TYPES = Object.freeze([
  'national_government',
  'official_government_publication',
]);

/** Publication and verification status rule shared by records and indexes. */
export function isPubliclyVisible(
  publicationStatus,
  verificationStatus,
  allowSourced = true
) {
  if (publicationStatus !== 'published') return false;
  return (
    verificationStatus === 'verified' ||
    (allowSourced && verificationStatus === 'sourced') ||
    verificationStatus === 'outdated'
  );
}

export function hasNationalSource(sources) {
  return (sources ?? []).some(source =>
    NATIONAL_SOURCE_TYPES.includes(source?.type)
  );
}

/**
 * Visibility of a normalized record (provenance already parsed). A record
 * without provenance is never public, and a `national_applicable` record must
 * cite a national source.
 */
export function isRecordPublic(record, allowSourced = true) {
  if (!record?.provenance) return false;
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

const VERIFICATION_STATUSES = [
  'awaiting_verification',
  'sourced',
  'verified',
  'outdated',
];

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Visibility of a raw companion or record JSON object exactly as stored in
 * content/. Normalizes the same way the app's provenance parser does: legacy
 * `status: "pending"` maps to awaiting_verification, sources without a title,
 * organization or http(s) URL are ignored, and a missing publication status
 * means draft.
 */
export function isRawRecordPublic(raw, allowSourced = true) {
  if (!raw || typeof raw !== 'object') return false;
  const provenance = raw.provenance;
  if (!provenance || typeof provenance !== 'object') return false;

  const legacyStatus =
    provenance.status === 'pending'
      ? 'awaiting_verification'
      : provenance.status;
  const verificationStatus =
    typeof provenance.verificationStatus === 'string'
      ? provenance.verificationStatus
      : legacyStatus;
  if (!VERIFICATION_STATUSES.includes(verificationStatus)) return false;

  const sources = Array.isArray(provenance.sources)
    ? provenance.sources.filter(
        source =>
          source &&
          typeof source.title === 'string' &&
          typeof source.organization === 'string' &&
          isHttpUrl(source.url)
      )
    : [];

  return isRecordPublic(
    {
      publicationStatus: raw.publicationStatus ?? 'draft',
      scope: raw.scope ?? 'local',
      provenance: { verificationStatus, sources },
    },
    allowSourced
  );
}

/**
 * Visibility of a page entry in a category index.yaml. Supports the legacy
 * boolean `published` flag used by the starter kit.
 */
export function isIndexEntryPublic(page, allowSourced = true) {
  if (!page || typeof page !== 'object') return false;
  const publicationStatus =
    page.publicationStatus ?? (page.published ? 'published' : 'draft');
  const verificationStatus =
    page.verificationStatus ??
    (page.published ? 'verified' : 'awaiting_verification');
  return isPubliclyVisible(publicationStatus, verificationStatus, allowSourced);
}

/** Reads the sourced-content switch the same way the app config does. */
export function allowSourcedFromEnv(value) {
  return value !== 'false';
}
