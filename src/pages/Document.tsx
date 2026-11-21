import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import Notice from '../components/ui/Notice';
import PageList from '../components/sections/PageList';
import { useParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { createMarkdownComponents } from '../lib/markdownComponents';
import { getTypographyTheme } from '../lib/typographyThemes';
import {
  serviceCategories,
  governmentCategories,
  getCategorySubcategories,
  isNestedCategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import SEO from '../components/SEO';
import Container from '../components/ui/Container';
import OnThisPage from '../components/ui/OnThisPage';
import { extractHeadings } from '../lib/headings';

// A sidebar only earns its place once there is somewhere to jump to
const MIN_SIDEBAR_HEADINGS = 2;

const humanize = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government';
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
}: DocumentProps) {
  const { documentSlug, category } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
  ]);

  useEffect(() => {
    if (!documentSlug || !category || !categoryType) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const isGovernment = categoryType === 'government';
        const categories = isGovernment
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel = isGovernment ? 'Government' : 'Services';
        const sectionHref = isGovernment ? '/government' : '/services';
        const categoryData = categories.find(c => c.slug === category);

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const index = await getCategorySubcategories(documentSlug);
          setNestedIndex(index);
          setBreadcrumbs([
            { label: 'Home', href: '/' },
            { label: sectionLabel, href: sectionHref },
            {
              label: categoryData?.category ?? category,
              href: `${sectionHref}/${category}`,
            },
            {
              label: documentSlug,
              href: `${sectionHref}/${category}/${documentSlug}`,
            },
          ]);
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          category,
          categoryType
        );
        setMarkdownContent(content);

        setBreadcrumbs([
          { label: 'Home', href: '/' },
          { label: sectionLabel, href: sectionHref },
          {
            label: categoryData?.category ?? category,
            href: `${sectionHref}/${category}`,
          },
          {
            label: content.title ?? documentSlug,
            href: `${sectionHref}/${category}/${documentSlug}`,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document'
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [documentSlug, category, categoryType]);

  const headings = useMemo(
    () => (markdownContent ? extractHeadings(markdownContent.body) : []),
    [markdownContent]
  );

  // Content loads asynchronously, so the browser can't honour a #section in
  // the URL on its own; jump to it once the article is rendered.
  useEffect(() => {
    if (!markdownContent || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    document.getElementById(id)?.scrollIntoView();
  }, [markdownContent]);

  if (loading) {
    return (
      <Section>
        <Notice description="Loading document…" />
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Notice title="Document not found" description={error} />
      </Section>
    );
  }

  if (nestedIndex) {
    return (
      <>
        <SEO
          title={documentSlug}
          keywords={`${documentSlug}, government services, local government`}
        />
        <Section>
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          {(nestedIndex.title || nestedIndex.description) && (
            <div className="mb-8">
              {nestedIndex.title && <Heading>{nestedIndex.title}</Heading>}
              {nestedIndex.description && (
                <Text size="lg">{nestedIndex.description}</Text>
              )}
            </div>
          )}
          <PageList pages={nestedIndex.pages} layout={nestedIndex.layout} />
        </Section>
      </>
    );
  }

  if (!markdownContent) {
    return null;
  }

  const title = markdownContent.title ?? humanize(documentSlug ?? '');
  const showSidebar = headings.length >= MIN_SIDEBAR_HEADINGS;

  return (
    <>
      <SEO
        title={title}
        description={
          markdownContent.description
            ? plainText(markdownContent.description)
            : `Government service information for ${documentSlug}`
        }
        keywords={`${documentSlug}, government services, public services, local government`}
      />

      <section className="border-b border-ed-rule bg-ed-paper-2 py-10 md:py-14">
        <Container>
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          <div className="max-w-[850px]">
            <h1 className="font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em] text-ed-ink">
              {title}
            </h1>
            {markdownContent.description && (
              <div className="mt-5 max-w-[720px] text-lg leading-relaxed text-ed-ink-2 max-md:text-base">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ...markdownComponents,
                    p: ({ children }) => <p>{children}</p>,
                  }}
                >
                  {markdownContent.description}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-12 max-md:py-6">
        <div
          className={
            showSidebar
              ? 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-14'
              : undefined
          }
        >
          {showSidebar && <OnThisPage headings={headings} />}
          <article className="markdown-content min-w-0 max-w-[820px] [&>h2:first-child]:mt-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdownContent.body}
            </ReactMarkdown>
          </article>
        </div>
      </Container>
    </>
  );
}
