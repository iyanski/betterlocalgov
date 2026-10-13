export const FOI_CHANNELS = ['efoi', 'letter', 'email'] as const;
export type FoiChannel = (typeof FOI_CHANNELS)[number];

export const FOI_STATUSES = [
  'pending',
  'acknowledged',
  'granted',
  'partially_granted',
  'denied',
  'no_response',
] as const;
export type FoiStatus = (typeof FOI_STATUSES)[number];

export const foiChannelLabels: Record<FoiChannel, string> = {
  efoi: 'eFOI (foi.gov.ph)',
  letter: 'Letter',
  email: 'Email',
};

export const foiStatusLabels: Record<FoiStatus, string> = {
  pending: 'Pending',
  acknowledged: 'Acknowledged',
  granted: 'Granted',
  partially_granted: 'Partially granted',
  denied: 'Denied',
  no_response: 'No response received',
};

export interface FoiRequest {
  id: string;
  agency: string;
  channel: FoiChannel;
  dateSent: string;
  subject: string;
  status: FoiStatus;
  responseDate?: string;
  /** Link to the public eFOI request page, when one exists. */
  publicRequestUrl?: string;
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Returns a request only when it is published and complete. Drafts, records
 * without a sent date, and malformed records are never returned.
 */
export function parseFoiRequest(
  id: string,
  data: Record<string, unknown>
): FoiRequest | undefined {
  if (data.publicationStatus !== 'published') return undefined;
  const request = data.request as Record<string, unknown> | undefined;
  if (!request) return undefined;

  const agency = text(request.agency);
  const subject = text(request.subject);
  const dateSent = text(request.dateSent);
  if (
    !agency ||
    !subject ||
    !dateSent ||
    !isoDate.test(dateSent) ||
    !FOI_CHANNELS.includes(request.channel as FoiChannel) ||
    !FOI_STATUSES.includes(request.status as FoiStatus)
  ) {
    return undefined;
  }

  const responseDate = text(request.responseDate);
  const publicRequestUrl = text(request.publicRequestUrl);
  return {
    id,
    agency,
    channel: request.channel as FoiChannel,
    dateSent,
    subject,
    status: request.status as FoiStatus,
    ...(responseDate && isoDate.test(responseDate) ? { responseDate } : {}),
    ...(publicRequestUrl && isHttpUrl(publicRequestUrl)
      ? { publicRequestUrl }
      : {}),
  };
}

export function sortFoiRequests(requests: FoiRequest[]): FoiRequest[] {
  return [...requests].sort((a, b) => b.dateSent.localeCompare(a.dateSent));
}

// Only content/requests/*.json is bundled. Unfiled seed drafts live in
// content/request-drafts/, a location the document loader's dynamic-import
// pattern (content/*/*/*.json) cannot match, so they stay out of the build.
const requestFiles = import.meta.glob('/content/requests/*.json', {
  import: 'default',
  eager: true,
}) as Record<string, Record<string, unknown>>;

export const publicFoiRequests = sortFoiRequests(
  Object.entries(requestFiles).flatMap(([path, data]) => {
    const id = path
      .replace(/^\/content\/requests\//, '')
      .replace(/\.json$/, '');
    const request = parseFoiRequest(id, data);
    return request ? [request] : [];
  })
);
