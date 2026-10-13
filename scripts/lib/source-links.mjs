export const USER_AGENT =
  'BetterGattaranLinkChecker/1.0 (+https://github.com/ginxFromYt/bettergattaran)';

/**
 * Hosts observed to refuse automated requests (HTTP 403, a bot challenge or a
 * failing certificate chain). They are skipped, never worked around, and
 * checked by a person instead.
 */
export const SKIPPED_HOSTS = [
  'dpwh.gov.ph',
  'psa.gov.ph',
  'philsys.gov.ph',
  'dole.gov.ph',
  'coa.gov.ph',
  'foi.gov.ph',
  'mgb.gov.ph',
  'nhfr.doh.gov.ph',
  'fdpp.dilg.gov.ph',
];

export function isSkippedHost(url, skipped = SKIPPED_HOSTS) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return skipped.some(entry => host === entry || host.endsWith(`.${entry}`));
}

/** Unique source URLs with the content IDs that cite them. */
export function collectSourceUrls(records) {
  const byUrl = new Map();
  for (const { contentId, record } of records) {
    for (const source of record.provenance?.sources ?? []) {
      if (typeof source.url !== 'string') continue;
      if (!byUrl.has(source.url)) byUrl.set(source.url, new Set());
      byUrl.get(source.url).add(contentId);
    }
  }
  return [...byUrl.entries()].map(([url, ids]) => ({
    url,
    contentIds: [...ids].sort(),
  }));
}

/**
 * Classifies one URL. Only a definite "gone" answer counts as broken.
 * Anything that might be bot protection, rate limiting or a transient fault
 * is inconclusive and left for a person to check.
 */
export async function checkUrl(
  url,
  { fetchImpl = fetch, timeoutMs = 15000 } = {}
) {
  const attempt = async method => {
    const response = await fetchImpl(url, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    });
    await response.body?.cancel?.();
    return response.status;
  };

  try {
    let status = await attempt('HEAD');
    if (status === 405 || status === 501) status = await attempt('GET');
    if (status >= 200 && status < 400)
      return { status: 'ok', detail: `HTTP ${status}` };
    if (status === 404 || status === 410) {
      return { status: 'broken', detail: `HTTP ${status}` };
    }
    return { status: 'inconclusive', detail: `HTTP ${status}` };
  } catch (error) {
    const code = error?.cause?.code ?? error?.code ?? error?.name;
    if (code === 'ENOTFOUND')
      return { status: 'broken', detail: 'host not found' };
    return { status: 'inconclusive', detail: String(code ?? 'request failed') };
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Checks URLs one at a time, at most one request per host per `delayMs`. */
export async function checkAll(
  entries,
  {
    delayMs = 2000,
    check = checkUrl,
    skipped = SKIPPED_HOSTS,
    now = Date.now,
    wait = sleep,
  } = {}
) {
  const results = [];
  const lastRequest = new Map();

  for (const entry of entries) {
    if (isSkippedHost(entry.url, skipped)) {
      results.push({
        ...entry,
        status: 'skipped',
        detail: 'host blocks automated access',
      });
      continue;
    }
    const host = new URL(entry.url).hostname;
    const elapsed = now() - (lastRequest.get(host) ?? -Infinity);
    if (elapsed < delayMs) await wait(delayMs - elapsed);
    lastRequest.set(host, now());
    results.push({ ...entry, ...(await check(entry.url)) });
  }
  return results;
}

export const SOURCE_ISSUE_TITLE = 'Source links need attention';

export function sourceLinksIssue(results) {
  const broken = results.filter(result => result.status === 'broken');
  const inconclusive = results.filter(
    result => result.status === 'inconclusive'
  );
  const skipped = results.filter(result => result.status === 'skipped');
  const list = items =>
    items.map(
      item =>
        `- ${item.url} (${item.detail}) — cited by ${item.contentIds.map(id => `\`${id}\``).join(', ')}`
    );

  const lines = [
    broken.length === 0
      ? 'The weekly check found no broken source links.'
      : `The weekly check found ${broken.length} broken source link${broken.length === 1 ? '' : 's'}.`,
    '',
  ];
  if (broken.length) lines.push('## Broken', ...list(broken), '');
  if (inconclusive.length) {
    lines.push(
      '## Could not be checked automatically (may be bot protection or a transient error)',
      ...list(inconclusive),
      ''
    );
  }
  if (skipped.length) {
    lines.push(
      `## Skipped hosts (${skipped.length} URLs)`,
      'These hosts refuse automated access and need a person to check them in a browser.',
      ...list(skipped),
      ''
    );
  }
  lines.push('Opened automatically by the weekly source check.');
  return {
    title: SOURCE_ISSUE_TITLE,
    labels: ['source-links'],
    body: lines.join('\n'),
    hasProblems: broken.length > 0,
  };
}
