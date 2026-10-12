/** Utility to load repository-managed Markdown content by slug. */

import {
  PUBLICATION_STATUSES,
  SOURCE_TYPES,
  VERIFICATION_STATUSES,
  isSafeHttpUrl,
  type ContentProvenance,
  type PublicationStatus,
  type SourceReference,
} from './contentGovernance';

export type {
  ContentProvenance,
  PublicationStatus,
  SourceReference,
  VerificationStatus,
} from './contentGovernance';

/**
 * Replaces {PLACEHOLDER} tokens using JSON data first, then VITE_ env vars.
 */
function interpolate(
  content: string,
  data: Record<string, unknown> = {}
): string {
  return content.replace(/\{([A-Z0-9_]+)\}/g, (match, key) => {
    if (key in data) return String(data[key]);
    const value = import.meta.env[`VITE_${key}`];
    return value !== undefined ? String(value) : match;
  });
}

export interface MarkdownContent {
  content: string;
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
  provenance?: ContentProvenance;
  publicationStatus: PublicationStatus;
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseProvenance(value: unknown): ContentProvenance | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const candidate = value as Record<string, unknown>;
  const legacyStatus =
    candidate.status === 'pending' ? 'awaiting_verification' : candidate.status;
  const verificationStatus =
    typeof candidate.verificationStatus === 'string'
      ? candidate.verificationStatus
      : legacyStatus;
  if (
    !VERIFICATION_STATUSES.includes(
      verificationStatus as (typeof VERIFICATION_STATUSES)[number]
    )
  ) {
    return undefined;
  }

  const sources = Array.isArray(candidate.sources)
    ? candidate.sources.flatMap(source => {
        if (!source || typeof source !== 'object') return [];
        const entry = source as Record<string, unknown>;
        if (
          typeof entry.title !== 'string' ||
          typeof entry.organization !== 'string' ||
          typeof entry.url !== 'string' ||
          !isSafeHttpUrl(entry.url)
        ) {
          return [];
        }

        return [
          {
            title: entry.title,
            organization: entry.organization,
            url: entry.url,
            type: SOURCE_TYPES.includes(
              entry.type as (typeof SOURCE_TYPES)[number]
            )
              ? (entry.type as SourceReference['type'])
              : 'other_public_source',
            ...(isDate(entry.publishedAt)
              ? { publishedAt: entry.publishedAt }
              : {}),
            ...(isDate(entry.asOf) ? { asOf: entry.asOf } : {}),
          },
        ];
      })
    : [];

  return {
    verificationStatus:
      verificationStatus as ContentProvenance['verificationStatus'],
    ...(isDate(candidate.lastVerifiedAt)
      ? { lastVerifiedAt: candidate.lastVerifiedAt }
      : isDate(candidate.verifiedAt)
        ? { lastVerifiedAt: candidate.verifiedAt }
        : {}),
    ...(isDate(candidate.lastUpdatedAt)
      ? { lastUpdatedAt: candidate.lastUpdatedAt }
      : {}),
    ...(isDate(candidate.asOf) ? { asOf: candidate.asOf } : {}),
    sources,
  };
}

function parsePublicationStatus(value: unknown): PublicationStatus {
  if (PUBLICATION_STATUSES.includes(value as PublicationStatus)) {
    return value as PublicationStatus;
  }
  return 'draft';
}

/**
 * Loads markdown content from the appropriate content directory.
 * Also attempts to load a companion JSON file (same slug) for template
 * variable substitution and structured data.
 * @param documentSlug - The document slug (filename without .md extension)
 * @param categorySlug - The category slug (parent directory)
 * @param categoryType - Whether this is a 'service' or 'government' document
 */
export async function loadMarkdownContent(
  documentSlug: string,
  categorySlug: string,
  categoryType: 'service' | 'government'
): Promise<MarkdownContent> {
  try {
    const dir = categoryType === 'government' ? 'government' : 'services';

    // Try to load companion JSON for template data
    let data: Record<string, unknown> = {};
    try {
      const jsonModule = await import(
        `../../content/${dir}/${categorySlug}/${documentSlug}.json`
      );
      data = jsonModule.default;
    } catch {
      // No companion JSON — that's fine
    }

    const module = await import(
      `../../content/${dir}/${categorySlug}/${documentSlug}.md?raw`
    );
    const content = interpolate(module.default, data);

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : undefined;

    const descriptionMatch = content.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/s);
    const description = descriptionMatch
      ? descriptionMatch[1].replace(/^>\s*/, '').trim()
      : undefined;

    return {
      content,
      title,
      description,
      data,
      provenance: parseProvenance(data.provenance),
      publicationStatus: parsePublicationStatus(data.publicationStatus),
    };
  } catch (error) {
    console.error(
      `Failed to load markdown content for document: ${documentSlug}`,
      error
    );
    throw new Error(`Document not found: ${documentSlug}`, { cause: error });
  }
}
