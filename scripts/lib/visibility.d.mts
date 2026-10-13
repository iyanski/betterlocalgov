/** Types for visibility.mjs, the single content visibility policy. */

export declare const NATIONAL_SOURCE_TYPES: readonly string[];

export declare function isPubliclyVisible(
  publicationStatus: string,
  verificationStatus: string,
  allowSourced?: boolean
): boolean;

export declare function hasNationalSource(
  sources: ReadonlyArray<{ type?: string }> | undefined
): boolean;

export interface VisibilityRecord {
  publicationStatus: string;
  scope?: string;
  provenance?: {
    verificationStatus: string;
    sources: ReadonlyArray<{ type?: string }>;
  };
}

export declare function isRecordPublic(
  record: VisibilityRecord | undefined,
  allowSourced?: boolean
): boolean;

export declare function isRawRecordPublic(
  raw: unknown,
  allowSourced?: boolean
): boolean;

export declare function isIndexEntryPublic(
  page: unknown,
  allowSourced?: boolean
): boolean;

export declare function allowSourcedFromEnv(value: string | undefined): boolean;
