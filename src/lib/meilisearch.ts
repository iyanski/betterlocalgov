import { Meilisearch } from 'meilisearch';
import type { VerificationStatus } from './contentGovernance';

export const isMeilisearchEnabled = Boolean(
  import.meta.env.VITE_MEILISEARCH_HOST
);

export const searchClient = isMeilisearchEnabled
  ? new Meilisearch({
      host: import.meta.env.VITE_MEILISEARCH_HOST,
      apiKey: import.meta.env.VITE_MEILISEARCH_SEARCH_KEY,
    })
  : null;

export const SEARCH_INDEX = 'content';

export interface SearchHit {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'government' | 'hotline';
  category: string;
  categorySlug: string;
  slug: string;
  url: string;
  verificationStatus: VerificationStatus;
}
