import { describe, expect, it, vi } from 'vitest';
import {
  findDueRecords,
  reverificationIssue,
  reverifyMonthsFor,
} from './lib/reverification.mjs';
import {
  checkAll,
  checkUrl,
  collectSourceUrls,
  isSkippedHost,
  sourceLinksIssue,
} from './lib/source-links.mjs';
import { upsertIssue } from './lib/github-issues.mjs';

const record = (
  contentId: string,
  lastVerifiedAt?: string,
  publicationStatus = 'published'
) => ({
  contentId,
  file: `content/${contentId}.json`,
  record: {
    publicationStatus,
    provenance: { lastVerifiedAt, sources: [] },
  },
});

describe('reverification', () => {
  const now = new Date('2026-12-24T00:00:00Z');

  it('uses 3 months for hotlines, officials and contacts, otherwise the default', () => {
    expect(reverifyMonthsFor('hotlines/cagayan-pdrrmo', 12)).toBe(3);
    expect(
      reverifyMonthsFor('government/departments/municipal-mayor', 12)
    ).toBe(3);
    expect(
      reverifyMonthsFor('government/departments/elected-officials', 12)
    ).toBe(3);
    expect(reverifyMonthsFor('government/departments/barangays', 12)).toBe(12);
    expect(reverifyMonthsFor('hotlines/x', 2)).toBe(2);
  });

  it('flags frequent records after 3 months but not other records', () => {
    const due = findDueRecords(
      [
        record('hotlines/national-emergency-911', '2026-09-23'),
        record('government/departments/barangays', '2026-09-23'),
      ],
      { now, defaultMonths: 12 }
    );
    expect(due.map(item => item.contentId)).toEqual([
      'hotlines/national-emergency-911',
    ]);
    expect(due[0].dueDate).toBe('2026-12-23');
  });

  it('honors the configured interval and skips drafts', () => {
    const due = findDueRecords(
      [
        record('government/departments/barangays', '2026-09-23'),
        record('government/departments/draft-page', '2020-01-01', 'draft'),
      ],
      { now, defaultMonths: 2 }
    );
    expect(due.map(item => item.contentId)).toEqual([
      'government/departments/barangays',
    ]);
  });

  it('treats a missing verification date as due', () => {
    const due = findDueRecords([record('government/departments/barangays')], {
      now,
    });
    expect(due).toHaveLength(1);
    expect(due[0].lastVerifiedAt).toBeUndefined();
    expect(reverificationIssue(due[0]).body).toContain(
      'no valid last-verified date'
    );
  });

  it('builds a stable issue title per record', () => {
    const [due] = findDueRecords([record('hotlines/a', '2020-01-01')], { now });
    expect(reverificationIssue(due)).toMatchObject({
      title: 'Reverify: hotlines/a',
      labels: ['reverification'],
    });
  });
});

describe('source URL collection and skipping', () => {
  it('lists each URL once with every content ID that cites it', () => {
    const sources = (url: string) => ({ provenance: { sources: [{ url }] } });
    const urls = collectSourceUrls([
      { contentId: 'a', record: sources('https://example.gov.ph/x') },
      { contentId: 'b', record: sources('https://example.gov.ph/x') },
      { contentId: 'c', record: { publicationStatus: 'draft' } },
    ]);
    expect(urls).toEqual([
      { url: 'https://example.gov.ph/x', contentIds: ['a', 'b'] },
    ]);
  });

  it('skips bot-blocking hosts and their subdomains only', () => {
    expect(isSkippedHost('https://dpwh.gov.ph/DPWH/news/1')).toBe(true);
    expect(isSkippedHost('https://www.coa.gov.ph/reports')).toBe(true);
    expect(isSkippedHost('https://hazardhunter.georisk.gov.ph/')).toBe(false);
    expect(isSkippedHost('https://notdpwh.gov.ph/')).toBe(false);
  });
});

describe('checkUrl', () => {
  const respond = (status: number) =>
    vi.fn().mockResolvedValue({ status, body: { cancel: vi.fn() } });

  it('classifies responses', async () => {
    expect(
      (await checkUrl('https://a.test', { fetchImpl: respond(200) })).status
    ).toBe('ok');
    expect(
      (await checkUrl('https://a.test', { fetchImpl: respond(404) })).status
    ).toBe('broken');
    expect(
      (await checkUrl('https://a.test', { fetchImpl: respond(410) })).status
    ).toBe('broken');
  });

  it('never treats bot-protection or server errors as broken', async () => {
    for (const status of [401, 403, 429, 500, 503]) {
      expect(
        (await checkUrl('https://a.test', { fetchImpl: respond(status) }))
          .status
      ).toBe('inconclusive');
    }
  });

  it('falls back to GET when HEAD is not allowed', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ status: 405, body: null })
      .mockResolvedValueOnce({ status: 200, body: null });
    expect((await checkUrl('https://a.test', { fetchImpl })).status).toBe('ok');
    expect(fetchImpl.mock.calls.map(call => call[1].method)).toEqual([
      'HEAD',
      'GET',
    ]);
  });

  it('sends an honest user agent', async () => {
    const fetchImpl = respond(200);
    await checkUrl('https://a.test', { fetchImpl });
    expect(fetchImpl.mock.calls[0][1].headers['user-agent']).toMatch(
      /BetterGattaranLinkChecker/
    );
  });

  it('treats DNS failure as broken and other errors as inconclusive', async () => {
    const dns = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('x'), { cause: { code: 'ENOTFOUND' } })
      );
    const timeout = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('x'), { name: 'TimeoutError' })
      );
    expect((await checkUrl('https://a.test', { fetchImpl: dns })).status).toBe(
      'broken'
    );
    expect(
      (await checkUrl('https://a.test', { fetchImpl: timeout })).status
    ).toBe('inconclusive');
  });
});

describe('checkAll', () => {
  it('rate limits per host and skips blocked hosts without requesting them', async () => {
    let clock = 0;
    const waits: number[] = [];
    const check = vi
      .fn()
      .mockResolvedValue({ status: 'ok', detail: 'HTTP 200' });
    const results = await checkAll(
      [
        { url: 'https://one.test/a', contentIds: ['a'] },
        { url: 'https://one.test/b', contentIds: ['b'] },
        { url: 'https://dpwh.gov.ph/x', contentIds: ['c'] },
        { url: 'https://two.test/c', contentIds: ['d'] },
      ],
      {
        delayMs: 2000,
        check,
        now: () => clock,
        wait: async (ms: number) => {
          waits.push(ms);
          clock += ms;
        },
      }
    );

    expect(check.mock.calls.map(call => call[0])).toEqual([
      'https://one.test/a',
      'https://one.test/b',
      'https://two.test/c',
    ]);
    expect(waits).toEqual([2000]);
    expect(results.find(r => r.url.includes('dpwh'))?.status).toBe('skipped');
  });
});

describe('sourceLinksIssue', () => {
  const entry = (status: string) => ({
    url: 'https://a.test/x',
    contentIds: ['a'],
    status,
    detail: 'HTTP 404',
  });

  it('reports problems only for broken links', () => {
    expect(sourceLinksIssue([entry('broken')]).hasProblems).toBe(true);
    expect(
      sourceLinksIssue([entry('inconclusive'), entry('skipped')]).hasProblems
    ).toBe(false);
    expect(sourceLinksIssue([entry('broken')]).body).toContain('## Broken');
  });
});

describe('upsertIssue', () => {
  const json = (data: unknown, status = 200) => ({
    ok: status < 300,
    status,
    json: async () => data,
  });

  function fakeGitHub(openIssues: unknown[]) {
    const calls: { method: string; path: string; body?: string }[] = [];
    const fetchImpl = vi.fn(
      async (url: string, init: { method?: string; body?: string }) => {
        const path = url.replace('https://api.github.com/repos/o/r', '');
        calls.push({ method: init.method ?? 'GET', path, body: init.body });
        if (path.startsWith('/issues?')) return json(openIssues);
        if (path === '/issues') return json({ number: 7 }, 201);
        return json({}, path === '/labels' ? 201 : 200);
      }
    );
    return { fetchImpl, calls };
  }

  const base = {
    repo: 'o/r',
    token: 't',
    title: 'T',
    body: 'B',
    labels: ['x'],
  };

  it('creates the issue when none is open', async () => {
    const { fetchImpl, calls } = fakeGitHub([]);
    expect(await upsertIssue(base, fetchImpl as never)).toEqual({
      action: 'created',
      number: 7,
    });
    expect(
      calls.some(call => call.method === 'POST' && call.path === '/issues')
    ).toBe(true);
  });

  it('updates the existing issue with the same title instead of duplicating it', async () => {
    const { fetchImpl, calls } = fakeGitHub([
      { number: 3, title: 'T' },
      { number: 4, title: 'Other' },
    ]);
    expect(await upsertIssue(base, fetchImpl as never)).toEqual({
      action: 'updated',
      number: 3,
    });
    expect(
      calls.filter(call => call.method === 'POST' && call.path === '/issues')
    ).toHaveLength(0);
  });

  it('closes the issue when the problem is resolved', async () => {
    const { fetchImpl } = fakeGitHub([{ number: 3, title: 'T' }]);
    const result = await upsertIssue(
      { ...base, closeWhenResolved: true, resolved: true },
      fetchImpl as never
    );
    expect(result).toEqual({ action: 'closed', number: 3 });
  });

  it('does nothing when resolved and no issue is open', async () => {
    const { fetchImpl } = fakeGitHub([]);
    const result = await upsertIssue(
      { ...base, closeWhenResolved: true, resolved: true },
      fetchImpl as never
    );
    expect(result).toEqual({ action: 'none' });
  });

  it('ignores pull requests that share the title', async () => {
    const { fetchImpl } = fakeGitHub([
      { number: 9, title: 'T', pull_request: {} },
    ]);
    expect((await upsertIssue(base, fetchImpl as never)).action).toBe(
      'created'
    );
  });
});
