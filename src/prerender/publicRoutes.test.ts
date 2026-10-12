import { describe, expect, it } from 'vitest';
import {
  collectPublicRoutes,
  loadDefaultInput,
  type PublicContentInput,
} from './publicRoutes';

const source = (type = 'provincial_government') => ({
  title: 'Source',
  organization: 'Agency',
  url: 'https://agency.gov.ph/page',
  type,
});

function companion(
  publicationStatus: string,
  verificationStatus: string,
  extra: Record<string, unknown> = {},
  sources = [source()]
) {
  return {
    publicationStatus,
    provenance: {
      verificationStatus,
      lastVerifiedAt: '2026-10-01',
      lastUpdatedAt: '2026-10-02',
      sources,
    },
    ...extra,
  };
}

function page(
  slug: string,
  publicationStatus: string,
  verificationStatus: string
) {
  return {
    name: slug,
    slug,
    description: `${slug} description`,
    publicationStatus,
    verificationStatus,
  };
}

function fixture(
  records: Record<string, ReturnType<typeof companion>>,
  statuses: Record<string, [string, string]>,
  allowSourced = true
): PublicContentInput {
  const base = '/content/government/departments';
  return {
    markdown: Object.fromEntries(
      Object.keys(records).map(slug => [
        `${base}/${slug}.md`,
        `# ${slug} title\n\n${slug} summary.`,
      ])
    ),
    companions: Object.fromEntries(
      Object.entries(records).map(([slug, record]) => [
        `${base}/${slug}.json`,
        record,
      ])
    ),
    indexes: {
      departments: {
        layout: 'grid',
        pages: Object.entries(statuses).map(([slug, [pub, ver]]) =>
          page(slug, pub, ver)
        ) as never,
      },
    },
    hotlines: [],
    projects: [],
    foiRequests: [],
    allowSourced,
  };
}

const paths = (input: PublicContentInput) =>
  collectPublicRoutes(input).map(route => route.path);

describe('collectPublicRoutes', () => {
  const records = {
    live: companion('published', 'verified'),
    sourced: companion('published', 'sourced'),
    draft: companion('draft', 'awaiting_verification'),
    archived: companion('archived', 'verified'),
    waiting: companion('published', 'awaiting_verification'),
  };
  const statuses: Record<string, [string, string]> = {
    live: ['published', 'verified'],
    sourced: ['published', 'sourced'],
    draft: ['draft', 'awaiting_verification'],
    archived: ['archived', 'verified'],
    waiting: ['published', 'awaiting_verification'],
  };

  it('includes only publicly visible records', () => {
    const result = paths(fixture(records, statuses));

    expect(result).toContain('/government/departments/live');
    expect(result).toContain('/government/departments/sourced');
    expect(result).not.toContain('/government/departments/draft');
    expect(result).not.toContain('/government/departments/archived');
    expect(result).not.toContain('/government/departments/waiting');
  });

  it('omits sourced records when sourced content is disabled', () => {
    const result = paths(fixture(records, statuses, false));

    expect(result).toContain('/government/departments/live');
    expect(result).not.toContain('/government/departments/sourced');
  });

  it('skips records whose index entry and companion disagree', () => {
    const result = paths(
      fixture(
        { live: companion('published', 'sourced') },
        { live: ['published', 'verified'] }
      )
    );

    expect(result).not.toContain('/government/departments/live');
  });

  it('skips records that are not listed in the category index', () => {
    const result = paths(
      fixture({ live: companion('published', 'verified') }, {})
    );

    expect(result).not.toContain('/government/departments/live');
  });

  it('withholds national_applicable records without a national source', () => {
    const national = companion(
      'published',
      'sourced',
      { scope: 'national_applicable' },
      [source('national_government')]
    );
    const withMedia = companion(
      'published',
      'sourced',
      { scope: 'national_applicable' },
      [source('other_public_source')]
    );
    const result = paths(
      fixture(
        { good: national, bad: withMedia },
        { good: ['published', 'sourced'], bad: ['published', 'sourced'] }
      )
    );

    expect(result).toContain('/government/departments/good');
    expect(result).not.toContain('/government/departments/bad');
  });

  it('adds a category route only when it has visible pages', () => {
    const withPage = paths(
      fixture(
        { live: companion('published', 'verified') },
        { live: ['published', 'verified'] }
      )
    );
    const withoutPage = paths(fixture({}, {}));

    expect(withPage).toContain('/government/departments');
    expect(withoutPage).not.toContain('/government/departments');
  });
});

describe('default public content', () => {
  it('pre-renders the required routes and no draft content', async () => {
    const routes = collectPublicRoutes(await loadDefaultInput());
    const result = routes.map(route => route.path);

    expect(result).toEqual(
      expect.arrayContaining([
        '/',
        '/hotlines',
        '/government/departments/municipality-overview',
        '/government/departments/municipal-mayor',
        '/government/projects',
      ])
    );
    expect(result).not.toContain('/government/departments/executive');
    expect(result).toContain('/services/social-welfare/dswd-aics');
    expect(result).not.toContain('/government/departments/elected-officials');
    // Categories without a visible page are not routes of their own.
    expect(result).not.toContain('/services/education');
  });
});

describe('projects route', () => {
  it('is added only when public project rows exist', () => {
    const none = fixture({}, {});
    const some: PublicContentInput = {
      ...none,
      projects: [
        {
          provenance: { lastUpdatedAt: '2026-10-12' },
        } as PublicContentInput['projects'][number],
      ],
    };

    expect(paths(none)).not.toContain('/government/projects');
    expect(paths(some)).toContain('/government/projects');
  });
});
