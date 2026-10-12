import { describe, expect, it } from 'vitest';
import { collectPublicRoutes, loadDefaultInput } from './publicRoutes';
import { buildSiteWhatsNew } from './whatsNew';
import revisions from '../../governance/revisions.json';

describe('site What’s new', () => {
  it('never lists drafts and includes public records', async () => {
    const input = await loadDefaultInput();
    const routes = collectPublicRoutes(input);
    const data = buildSiteWhatsNew(routes, input);
    const ids = data.entries.map(entry => entry.contentId);

    // The repository history includes a draft record's revision.
    expect(
      revisions.revisions.some(r => r.contentId.endsWith('elected-officials'))
    ).toBe(true);
    expect(ids.some(id => id.endsWith('elected-officials'))).toBe(false);
    expect(ids).toContain('government/departments/municipality-overview');
    expect(ids).toContain('hotlines/national-emergency-911');
    expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
