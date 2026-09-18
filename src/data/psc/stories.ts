/**
 * The registry of data stories.
 *
 * One source of truth for every surface that lists them: the /data index, the
 * navbar dropdown, the footer column, the home teaser, and the Meilisearch
 * indexer (which imports this file rather than parsing TSX, so a page and its
 * search record can never drift apart).
 *
 * `status` is load-bearing. Most of these pages are still being extracted from
 * scanned PDFs, and listing a story that does not exist yet as though it does
 * would be its own small dishonesty -- so the index shows them as forthcoming
 * and does not link them.
 */

export type StoryStatus = 'live' | 'building';

export interface StorySection {
  /** Running number, "01".."07". */
  index: string;
  label: string;
  title: string;
  blurb?: string;
}

export interface Story {
  slug: string;
  href: string;
  /** Short label for nav and footer. */
  navLabel: string;
  /** Headline, as it appears on the page and the index card. */
  title: string;
  /** One line: the argument the page makes. */
  standfirst: string;
  description: string;
  keywords: string;
  status: StoryStatus;
  /** Source series this page is built from, for the index card's provenance line. */
  sources: string[];
  /** Headline figure for the card. Omitted while a page is still being built. */
  stat?: { value: string; label: string };
  sections?: StorySection[];
}

export const stories: Story[] = [
  {
    slug: 'participation',
    href: '/data/participation',
    navLabel: 'Who plays',
    title: 'Who actually plays',
    standfirst:
      'Twenty thousand athletes across three national games, from a freedom of information request. The PSC publishes almost none of it.',
    description:
      '20,662 athletes across three national games — participation data the Philippine Sports Commission does not publish, obtained under freedom of information.',
    keywords:
      'Batang Pinoy, Philippine National Games, Philippine National Para Games, participation data, PSC, freedom of information',
    status: 'live',
    sources: ['FOI request #PSC-206383709560'],
    stat: { value: '20,662', label: 'athletes on record' },
  },
  {
    slug: 'budget',
    href: '/data/budget',
    navLabel: 'Budget & spending',
    // FY2017 is where the record starts, not where we chose to start it: the
    // PSC's own links for FY2013-FY2016 all point at a host it retired, so
    // nothing before 2017 resolves. Ten years, not thirteen.
    title: 'Ten years of money',
    standfirst:
      'The budget is not the story. The gap between what is appropriated, what is released, what is committed and what is actually paid — that is the story.',
    description:
      'Philippine Sports Commission appropriations, allotments, obligations and disbursements, FY2017–FY2026, extracted from the agency’s own quarterly FAR No. 1 reports.',
    keywords:
      'PSC budget, appropriations, obligations, disbursements, FAR No. 1, SAAOBDB, government spending Philippines',
    status: 'live',
    sources: ['FAR No. 1 (SAAOBDB)'],
    stat: { value: '₱2.7B', label: 'appropriated, never committed' },
  },
  {
    slug: 'revenue',
    href: '/data/revenue',
    navLabel: 'Where money comes from',
    title: 'Where the money comes from',
    standfirst:
      'Ninety-eight pesos in every hundred the agency raises are gambling money. When the casinos shut, so did the funding.',
    description:
      'Philippine Sports Commission revenue by source, FY2017–FY2026 — the PAGCOR and PCSO share, facility rent and other receipts, against the annual BESF target.',
    keywords:
      'PSC revenue, RA 6847, PAGCOR, PCSO, FAR No. 5, sports funding Philippines, internally generated funds',
    status: 'live',
    sources: ['FAR No. 5'],
    stat: { value: '98%', label: 'of income is gambling' },
  },
  {
    slug: 'delivery',
    href: '/data/delivery',
    navLabel: 'Promised vs delivered',
    title: 'Promised, and delivered',
    standfirst:
      'BAR No. 1 is where the agency sets its own targets and marks its own homework. Read ten years of it together and the pattern shows.',
    description:
      'Philippine Sports Commission physical targets against reported accomplishment, from the agency’s own quarterly BAR No. 1 reports.',
    keywords:
      'PSC targets, BAR No. 1, physical report of operation, performance, accountability',
    status: 'building',
    sources: ['BAR No. 1'],
  },
  {
    slug: 'programs',
    href: '/data/programs',
    navLabel: 'Programmes',
    title: 'Where the money actually goes',
    standfirst:
      'Grassroots, elite, para, Olympic preparation. Ten years of programme-level spending is the agency’s real priority ordering.',
    description:
      'Philippine Sports Commission spending by programme — grassroots, national games, para games and elite preparation — across a decade of FAR No. 1 reports.',
    keywords:
      'PSC programmes, Batang Pinoy budget, Philippine National Games budget, para games funding, grassroots sports spending',
    status: 'building',
    sources: ['FAR No. 1 (SAAOBDB)'],
  },
  {
    slug: 'procurement',
    href: '/data/procurement',
    navLabel: 'Procurement',
    title: 'What it buys, and how',
    standfirst:
      'Forty-odd procurement plans, including the mid-year revisions of the same year’s plan. The revisions are the interesting part.',
    description:
      'Philippine Sports Commission annual procurement plans FY2018–FY2026: what it plans to buy, from whom, and under which mode of procurement.',
    keywords:
      'PSC procurement, annual procurement plan, APP, competitive bidding, small value procurement, government contracts Philippines',
    status: 'building',
    sources: ['Annual Procurement Plan', 'Procurement Monitoring Report'],
  },
  {
    slug: 'sources',
    href: '/data/sources',
    navLabel: 'Sources & method',
    title: 'The paper trail',
    standfirst:
      'Every document behind these pages, how it was read, and how often the reading was wrong.',
    description:
      'The full document manifest behind betterPSC’s data pages: source URLs, checksums, retrieval dates, extraction method and accuracy.',
    keywords:
      'PSC transparency seal, data provenance, methodology, open data, checksums, extraction accuracy',
    status: 'building',
    sources: ['PSC Transparency Seal'],
  },
];

export const liveStories = stories.filter(s => s.status === 'live');

export const storyBySlug = (slug: string) => stories.find(s => s.slug === slug);

/**
 * Nav and footer link only to pages that exist. A route that is not registered
 * falls through to the catch-all document viewer and renders its "not found",
 * which reads as a broken site rather than as work in progress -- and on a site
 * whose subject is other people's broken links, that would be a poor look.
 *
 * The /data index lists the unfinished ones instead, clearly marked.
 */
export const storyNavLinks = stories
  .filter(s => s.status === 'live')
  .map(s => ({ label: s.navLabel, href: s.href }));
