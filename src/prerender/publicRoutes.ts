/**
 * Enumerates every publicly visible route using the same visibility policy as
 * the document viewer (`isRecordPublic`). Draft, archived, awaiting-verification
 * and policy-blocked records never appear here, so they cannot reach the
 * pre-rendered HTML, the sitemap, or robots rules.
 */
import {
  serviceCategories,
  governmentCategories,
  loadCategoryIndex,
  type Category,
  type CategoryIndex,
} from '../data/yamlLoader';
import {
  buildMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { isRecordPublic } from '../lib/contentGovernance';
import { getPublicHotlines, type HotlineRecord } from '../lib/hotlines';
import { publicProjects, type ProjectRecord } from '../lib/projects';
import { publicFoiRequests, type FoiRequest } from '../lib/foiRequests';
import { FOI_DESCRIPTION, FOI_TITLE } from '../lib/foiCopy';
import { PROJECTS_DESCRIPTION, PROJECTS_TITLE } from '../lib/projectsCopy';
import { contentGovernanceConfig } from '../config/contentGovernance';

export type RouteKind =
  | 'home'
  | 'about'
  | 'hotlines'
  | 'projects'
  | 'foi'
  | 'whats-new'
  | 'services'
  | 'government'
  | 'category'
  | 'document';

export interface PublicRoute {
  path: string;
  kind: RouteKind;
  title: string;
  description: string;
  /** Present for document routes. */
  document?: MarkdownContent;
  /** Present for category routes. */
  category?: Category;
  pages?: { name: string; description?: string; href: string }[];
  /** Latest `lastUpdatedAt` / `lastVerifiedAt` date, when known. */
  lastModified?: string;
}

export interface PublicContentInput {
  /** Markdown keyed by `/content/<dir>/<category>/<slug>.md`. */
  markdown: Record<string, string>;
  /** Companion JSON keyed by `/content/<dir>/<category>/<slug>.json`. */
  companions: Record<string, Record<string, unknown>>;
  /** Category index (already filtered by the index-level policy), by slug. */
  indexes: Record<string, CategoryIndex>;
  hotlines: HotlineRecord[];
  /** Already filtered by the project visibility policy. */
  projects: ProjectRecord[];
  /** Published requests only; drafts are never loaded. */
  foiRequests: FoiRequest[];
  allowSourced: boolean;
}

const markdownFiles = import.meta.glob(
  '/content/{services,government}/**/*.md',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
) as Record<string, string>;

const companionFiles = import.meta.glob(
  '/content/{services,government}/**/*.json',
  { import: 'default', eager: true }
) as Record<string, Record<string, unknown>>;

export async function loadDefaultInput(): Promise<PublicContentInput> {
  const slugs = [
    ...serviceCategories.categories,
    ...governmentCategories.categories,
  ].map(category => category.slug);
  const entries = await Promise.all(
    slugs.map(async slug => [slug, await loadCategoryIndex(slug)] as const)
  );

  return {
    markdown: markdownFiles,
    companions: companionFiles,
    indexes: Object.fromEntries(entries),
    hotlines: getPublicHotlines(),
    projects: publicProjects,
    foiRequests: publicFoiRequests,
    allowSourced: contentGovernanceConfig.allowSourcedContent,
  };
}

function latestDate(...values: (string | undefined)[]): string | undefined {
  return values
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

function collectDocuments(
  section: 'services' | 'government',
  categories: Category[],
  input: PublicContentInput
): PublicRoute[] {
  const routes: PublicRoute[] = [];

  for (const category of categories) {
    const index = input.indexes[category.slug];
    for (const page of index?.pages ?? []) {
      const base = `/content/${section}/${category.slug}/${page.slug}`;
      const raw = input.markdown[`${base}.md`];
      const companion = input.companions[`${base}.json`];
      if (raw === undefined || !companion) continue;

      const document = buildMarkdownContent(raw, companion);
      // The index entry and companion must agree, as the audit requires.
      if (
        document.provenance?.verificationStatus !== page.verificationStatus ||
        document.publicationStatus !== page.publicationStatus ||
        !isRecordPublic(document, input.allowSourced)
      ) {
        continue;
      }

      routes.push({
        path: `/${section}/${category.slug}/${page.slug}`,
        kind: 'document',
        title: document.title ?? page.name,
        description: document.description ?? page.description ?? '',
        document,
        lastModified: latestDate(
          document.provenance?.lastUpdatedAt,
          document.provenance?.lastVerifiedAt
        ),
      });
    }
  }
  return routes;
}

function collectCategoryRoute(
  section: 'services' | 'government',
  category: Category,
  input: PublicContentInput,
  documentRoutes: PublicRoute[]
): PublicRoute | undefined {
  const prefix = `/${section}/${category.slug}/`;
  const children = documentRoutes.filter(route =>
    route.path.startsWith(prefix)
  );
  if (children.length === 0) return undefined;

  return {
    path: `/${section}/${category.slug}`,
    kind: 'category',
    title: category.category,
    description:
      input.indexes[category.slug]?.description ?? category.description,
    category,
    pages: children.map(route => ({
      name: route.title,
      description: route.description,
      href: route.path,
    })),
    lastModified: latestDate(...children.map(route => route.lastModified)),
  };
}

export function collectPublicRoutes(input: PublicContentInput): PublicRoute[] {
  const serviceDocuments = collectDocuments(
    'services',
    serviceCategories.categories,
    input
  );
  const governmentDocuments = collectDocuments(
    'government',
    governmentCategories.categories,
    input
  );

  const categoryRoutes = [
    ...serviceCategories.categories.flatMap(category => {
      const route = collectCategoryRoute(
        'services',
        category,
        input,
        serviceDocuments
      );
      return route ? [route] : [];
    }),
    ...governmentCategories.categories.flatMap(category => {
      const route = collectCategoryRoute(
        'government',
        category,
        input,
        governmentDocuments
      );
      return route ? [route] : [];
    }),
  ];

  const documents = [...serviceDocuments, ...governmentDocuments];
  const newest = latestDate(...documents.map(route => route.lastModified));

  return [
    {
      path: '/',
      kind: 'home',
      title: '',
      description:
        'A community-driven civic information portal for Gattaran, Cagayan.',
      lastModified: newest,
    },
    {
      path: '/about',
      kind: 'about',
      title: 'About',
      description:
        'How Better Gattaran sources, labels and verifies civic information, and how it differs from the official municipal website.',
    },
    {
      path: '/hotlines',
      kind: 'hotlines',
      title: 'Verified emergency hotlines',
      description:
        'Verified national, Gattaran, and Cagayan emergency contact information with sources.',
      lastModified: latestDate(
        ...input.hotlines.map(
          hotline =>
            hotline.provenance.lastUpdatedAt ??
            hotline.provenance.lastVerifiedAt
        )
      ),
    },
    {
      path: '/services',
      kind: 'services',
      title: 'Services',
      description:
        'General service categories associated with the Municipality of Gattaran. Local requirements and procedures require verification.',
    },
    {
      path: '/government',
      kind: 'government',
      title: 'Municipal Government',
      description:
        'Verified public information about Gattaran and its municipal government.',
    },
    ...categoryRoutes,
    ...(input.projects.length > 0
      ? [
          {
            path: '/government/projects',
            kind: 'projects' as const,
            title: PROJECTS_TITLE,
            description: PROJECTS_DESCRIPTION,
            lastModified: latestDate(
              ...input.projects.map(
                record =>
                  record.provenance.lastUpdatedAt ??
                  record.provenance.lastVerifiedAt
              )
            ),
          },
        ]
      : []),
    ...(input.foiRequests.length > 0
      ? [
          {
            path: '/foi-requests',
            kind: 'foi' as const,
            title: FOI_TITLE,
            description: FOI_DESCRIPTION,
            lastModified: latestDate(
              ...input.foiRequests.map(
                request => request.responseDate ?? request.dateSent
              )
            ),
          },
        ]
      : []),
    ...documents,
  ];
}
