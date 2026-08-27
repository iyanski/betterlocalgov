import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Banner } from '@bettergov/kapwa/banner';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { createMarkdownComponents } from '../lib/markdownComponents';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { getTypographyTheme } from '../lib/typographyThemes';
import {
  serviceCategories,
  governmentCategories,
  getCategorySubcategories,
  isNestedCategory,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import SEO from '../components/SEO';
import {
  CompetitivenessDashboard,
  DemographicsDashboard,
} from '../components/statistics/StatisticsDashboard';
import {
  DisasterRiskReductionDashboard,
  DpwhProjectsDashboard,
  IncomeDependencyDashboard,
  ProcurementDashboard,
  StatementsReceiptsExpenditureDashboard,
} from '../components/statistics/FiscalTransparencyPages';

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government' | 'transparency' | 'statistics';
}

type DashboardDocument =
  | 'demographics'
  | 'competitiveness'
  | 'annual-regular-income-and-dependencies'
  | 'statements-of-receipts-and-expenditure'
  | 'disaster-risk-reduction-and-management'
  | 'dpwh-projects'
  | 'procurement';

const dashboardTitles: Record<DashboardDocument, string> = {
  demographics: 'Demographics',
  competitiveness: 'Competitiveness',
  'annual-regular-income-and-dependencies':
    'Annual Regular Income (ARI) and Dependencies',
  'statements-of-receipts-and-expenditure':
    'Statements of Receipts and Expenditure',
  'disaster-risk-reduction-and-management':
    'Disaster Risk Reduction and Management',
  'dpwh-projects': 'DPWH Projects in Aparri',
  procurement: 'Procurement',
};

function buildDocumentBreadcrumbs({
  sectionLabel,
  sectionHref,
  category,
  categoryLabel,
  documentLabel,
  documentHref,
}: {
  sectionLabel: string;
  sectionHref: string;
  category?: string;
  categoryLabel?: string;
  documentLabel: string;
  documentHref: string;
}) {
  const items = [
    { label: 'Home', href: '/' },
    { label: sectionLabel, href: sectionHref },
  ];

  if (category) {
    items.push({
      label: categoryLabel ?? category,
      href: `${sectionHref}/${category}`,
    });
  }

  items.push({ label: documentLabel, href: documentHref });

  return items;
}

function getDashboardDocument(
  categoryType: DocumentProps['categoryType'],
  category: string | undefined,
  documentSlug: string | undefined
): DashboardDocument | null {
  if (!categoryType || !documentSlug) {
    return null;
  }

  if (
    (categoryType === 'statistics' || category === 'statistics') &&
    (documentSlug === 'demographics' || documentSlug === 'competitiveness')
  ) {
    return documentSlug;
  }

  if (
    (categoryType === 'transparency' || category === 'transparency') &&
    (documentSlug === 'annual-regular-income-and-dependencies' ||
      documentSlug === 'statements-of-receipts-and-expenditure' ||
      documentSlug === 'disaster-risk-reduction-and-management' ||
      documentSlug === 'dpwh-projects' ||
      documentSlug === 'procurement')
  ) {
    return documentSlug;
  }

  return null;
}

function DashboardContent({ dashboard }: { dashboard: DashboardDocument }) {
  switch (dashboard) {
    case 'demographics':
      return <DemographicsDashboard />;
    case 'competitiveness':
      return <CompetitivenessDashboard />;
    case 'annual-regular-income-and-dependencies':
      return <IncomeDependencyDashboard />;
    case 'statements-of-receipts-and-expenditure':
      return <StatementsReceiptsExpenditureDashboard />;
    case 'disaster-risk-reduction-and-management':
      return <DisasterRiskReductionDashboard />;
    case 'dpwh-projects':
      return <DpwhProjectsDashboard />;
    case 'procurement':
      return <ProcurementDashboard />;
    default:
      return null;
  }
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
}: DocumentProps) {
  const { documentSlug, category } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  const [dashboardDocument, setDashboardDocument] =
    useState<DashboardDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
  ]);

  useEffect(() => {
    if (!documentSlug || !categoryType) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const isGovernmentSection = categoryType === 'government';
        const categories = isGovernmentSection
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel =
          categoryType === 'service'
            ? 'Services'
            : categoryType === 'government'
              ? 'Government'
              : categoryType === 'transparency'
                ? 'Transparency'
                : 'Statistics';
        const sectionHref =
          categoryType === 'service'
            ? '/services'
            : categoryType === 'government'
              ? '/government'
              : `/${categoryType}`;
        const categorySlug = category ?? categoryType;
        const categoryData = categories.find(c => c.slug === category);
        const dashboard = getDashboardDocument(
          categoryType,
          categorySlug,
          documentSlug
        );

        if (dashboard) {
          const documentHref = category
            ? `${sectionHref}/${category}/${documentSlug}`
            : `${sectionHref}/${documentSlug}`;

          setDashboardDocument(dashboard);
          setNestedIndex(null);
          setMarkdownContent(null);
          setBreadcrumbs(
            buildDocumentBreadcrumbs({
              sectionLabel,
              sectionHref,
              category,
              categoryLabel: categoryData?.category,
              documentLabel: dashboardTitles[dashboard],
              documentHref,
            })
          );
          return;
        }

        setDashboardDocument(null);

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const index = await getCategorySubcategories(documentSlug);
          const documentHref = category
            ? `${sectionHref}/${category}/${documentSlug}`
            : `${sectionHref}/${documentSlug}`;

          setNestedIndex(index);
          setBreadcrumbs(
            buildDocumentBreadcrumbs({
              sectionLabel,
              sectionHref,
              category,
              categoryLabel: categoryData?.category,
              documentLabel: documentSlug,
              documentHref,
            })
          );
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          categorySlug,
          categoryType
        );
        setMarkdownContent(content);

        setBreadcrumbs(
          buildDocumentBreadcrumbs({
            sectionLabel,
            sectionHref,
            category,
            categoryLabel: categoryData?.category,
            documentLabel: content.title ?? documentSlug,
            documentHref: category
              ? `${sectionHref}/${category}/${documentSlug}`
              : `${sectionHref}/${documentSlug}`,
          })
        );
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

  if (loading) {
    return (
      <Section className="p-3 mb-12">
        <Banner type="info" description="Loading document..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Banner
          type="error"
          title="Document Not Found"
          description={error}
          icon
        />
      </Section>
    );
  }

  if (nestedIndex) {
    const nestedPages: Subcategory[] = nestedIndex.pages;

    return (
      <>
        <SEO
          title={documentSlug}
          keywords={`${documentSlug}, government services, local government`}
          pageType="CollectionPage"
          breadcrumbs={breadcrumbs.filter(
            (breadcrumb): breadcrumb is { label: string; href: string } =>
              Boolean(breadcrumb.href)
          )}
        />
        <Section className="p-3 mb-12">
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          {nestedIndex.title && (
            <Heading level={2}>{nestedIndex.title}</Heading>
          )}
          {nestedIndex.description && (
            <Text className="text-gray-600 mb-4">
              {nestedIndex.description}
            </Text>
          )}
          {nestedIndex.layout === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nestedPages.map((page, i) => (
                <Card hoverable key={page.slug ?? i} className="h-full">
                  <CardContent>
                    <h4 className="text-lg font-medium text-gray-900">
                      {page.name}
                    </h4>
                    {page.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {page.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {nestedPages.map((page, i) => (
                <Card key={page.slug ?? i} className="mb-4">
                  <CardContent>
                    <h4 className="text-lg font-medium text-gray-900">
                      {page.name}
                    </h4>
                    {page.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {page.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </>
    );
  }

  if (dashboardDocument) {
    return (
      <>
        <SEO
          title={dashboardTitles[dashboardDocument]}
          keywords={`${dashboardTitles[dashboardDocument]}, statistics, transparency, local government`}
          pageType="Dataset"
          breadcrumbs={breadcrumbs.filter(
            (breadcrumb): breadcrumb is { label: string; href: string } =>
              Boolean(breadcrumb.href)
          )}
        />
        <Section className="p-3 mb-12">
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          <DashboardContent dashboard={dashboardDocument} />
        </Section>
      </>
    );
  }

  if (!markdownContent) {
    return null;
  }

  return (
    <>
      <SEO
        title={markdownContent.title || documentSlug}
        description={
          markdownContent.description ||
          `Government service information for ${documentSlug}`
        }
        keywords={`${documentSlug}, government services, public services, local government`}
        pageType={categoryType === 'service' ? 'GovernmentService' : 'WebPage'}
        breadcrumbs={breadcrumbs.filter(
          (breadcrumb): breadcrumb is { label: string; href: string } =>
            Boolean(breadcrumb.href)
        )}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Card className="mb-8 markdown-content">
          <CardHeader>
            {markdownContent.description && (
              <CardContent>{markdownContent.description}</CardContent>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdownContent.content}
            </ReactMarkdown>
          </CardHeader>
        </Card>
      </Section>
    </>
  );
}
