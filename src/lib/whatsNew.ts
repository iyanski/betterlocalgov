/** Browser-safe types and helpers for the build-generated "What's new" list. */

export interface Revision {
  contentId: string;
  action: string;
  changedFields?: string[];
  timestamp: string;
}

export interface PublicTarget {
  title: string;
  path: string;
}

export interface WhatsNewEntry {
  contentId: string;
  title: string;
  path: string;
  action: string;
  /** Calendar date (YYYY-MM-DD) taken from the revision timestamp. */
  date: string;
  changedFields: string[];
}

export interface WhatsNewData {
  /** Most recent date among the entries; undefined when there are none. */
  lastUpdated?: string;
  entries: WhatsNewEntry[];
}

export const WHATS_NEW_TITLE = 'What’s new';

export const WHATS_NEW_DESCRIPTION =
  'Recent additions and updates to publicly visible records on Better Gattaran.';

const actionLabels: Record<string, string> = {
  created: 'Added',
  updated: 'Updated',
};

export function actionLabel(action: string): string {
  return (
    actionLabels[action] ?? action.charAt(0).toUpperCase() + action.slice(1)
  );
}

/**
 * Lists revisions of publicly visible records, newest first. Revisions whose
 * content is not in `targets` (drafts, archived or blocked records) are
 * dropped, so non-public changes never surface.
 */
export function buildWhatsNew(
  revisions: Revision[],
  targets: ReadonlyMap<string, PublicTarget>,
  limit = 50
): WhatsNewData {
  const entries = revisions
    .flatMap((revision, index) => {
      const target = targets.get(revision.contentId);
      if (!target || !/^\d{4}-\d{2}-\d{2}/.test(revision.timestamp)) return [];
      return [
        {
          index,
          entry: {
            contentId: revision.contentId,
            title: target.title,
            path: target.path,
            action: revision.action,
            date: revision.timestamp.slice(0, 10),
            changedFields: revision.changedFields ?? [],
          },
          timestamp: revision.timestamp,
        },
      ];
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.index - a.index)
    .slice(0, limit)
    .map(item => item.entry);

  return { lastUpdated: entries[0]?.date, entries };
}

let cached: Promise<WhatsNewData | null> | undefined;

/** Fetches the JSON written at build time; resolves to null when unavailable. */
export function loadWhatsNew(): Promise<WhatsNewData | null> {
  cached ??= fetch('/whats-new.json')
    .then(response => (response.ok ? response.json() : null))
    .then(data =>
      data && Array.isArray(data.entries) ? (data as WhatsNewData) : null
    )
    .catch(() => null);
  return cached;
}
