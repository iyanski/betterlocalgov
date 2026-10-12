import { describe, expect, it } from 'vitest';
import {
  parseFoiRequest,
  publicFoiRequests,
  sortFoiRequests,
} from './foiRequests';

const base = {
  publicationStatus: 'published',
  request: {
    agency: 'Example Agency',
    channel: 'efoi',
    dateSent: '2026-11-02',
    subject: 'Example records',
    status: 'pending',
  },
};

describe('parseFoiRequest', () => {
  it('parses a complete published request', () => {
    expect(parseFoiRequest('a', base)).toEqual({
      id: 'a',
      agency: 'Example Agency',
      channel: 'efoi',
      dateSent: '2026-11-02',
      subject: 'Example records',
      status: 'pending',
    });
  });

  it('never returns drafts', () => {
    expect(
      parseFoiRequest('a', { ...base, publicationStatus: 'draft' })
    ).toBeUndefined();
  });

  it('rejects an unknown status, channel or a missing sent date', () => {
    const withRequest = (patch: Record<string, unknown>) => ({
      ...base,
      request: { ...base.request, ...patch },
    });
    expect(
      parseFoiRequest('a', withRequest({ status: 'won' }))
    ).toBeUndefined();
    expect(
      parseFoiRequest('a', withRequest({ channel: 'fax' }))
    ).toBeUndefined();
    expect(
      parseFoiRequest('a', withRequest({ dateSent: undefined }))
    ).toBeUndefined();
    expect(
      parseFoiRequest('a', withRequest({ dateSent: 'November 2' }))
    ).toBeUndefined();
  });

  it('keeps only valid optional response fields', () => {
    const parsed = parseFoiRequest('a', {
      ...base,
      request: {
        ...base.request,
        status: 'granted',
        responseDate: '2026-11-20',
        publicRequestUrl: 'javascript:alert(1)',
      },
    });
    expect(parsed?.responseDate).toBe('2026-11-20');
    expect(parsed?.publicRequestUrl).toBeUndefined();
  });
});

describe('sortFoiRequests', () => {
  it('lists the newest request first without mutating its input', () => {
    const older = parseFoiRequest('older', {
      ...base,
      request: { ...base.request, dateSent: '2026-10-01' },
    })!;
    const newer = parseFoiRequest('newer', base)!;
    const input = [older, newer];

    expect(sortFoiRequests(input).map(r => r.id)).toEqual(['newer', 'older']);
    expect(input.map(r => r.id)).toEqual(['older', 'newer']);
  });
});

describe('repository requests', () => {
  it('does not publish the unfiled seed drafts', () => {
    expect(publicFoiRequests).toEqual([]);
  });
});
