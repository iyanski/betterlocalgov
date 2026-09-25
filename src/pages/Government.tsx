import Section from '../components/ui/Section';
import { useParams, Link } from 'react-router-dom';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  governmentCategories,
  getCategorySubcategories,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { Banner } from '@bettergov/kapwa/banner';
import { useState, useEffect } from 'react';
import BarangayCards from '../components/officials/BarangayCards';
import LeadershipOfficialsCards from '../components/officials/LeadershipOfficialsCards';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';

const RemixIcon: React.FC<{ iconClass: string; className?: string }> = ({
  iconClass,
  className = 'h-12 w-12',
}) => <i className={`${iconClass} ${className}`} />;

interface GovernmentProps {
  sectionType?: 'government' | 'transparency' | 'statistics';
}

type SectionCard = Subcategory & {
  icon?: string;
};

const sectionMeta = {
  government: {
    category: 'Government',
    slug: 'government',
    description:
      'Browse leadership information, barangay profiles, and local government records.',
    icon: 'ri-government-line',
  },
  transparency: {
    category: 'Transparency',
    slug: 'transparency',
    description:
      'Access fiscal transparency data, income reports, and financial documents.',
    icon: 'ri-file-shield-2-line',
  },
  statistics: {
    category: 'Statistics',
    slug: 'statistics',
    description:
      'Explore demographic data and competitiveness indicators for informed decision-making.',
    icon: 'ri-bar-chart-2-line',
  },
};

const Government: React.FC<GovernmentProps> = ({
  sectionType = 'government',
}) => {
  const { category } = useParams();
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [leadershipContent, setLeadershipContent] =
    useState<MarkdownContent | null>(null);
  const [loading, setLoading] = useState(false);
  const subcategories: Subcategory[] = categoryIndex.pages;

  const getCategory = () => {
    if (sectionType === 'government' && !category) {
      return sectionMeta.government;
    }

    if (sectionType === 'transparency' || sectionType === 'statistics') {
      return sectionMeta[sectionType];
    }

    return governmentCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  const isGovernmentRoot = sectionType === 'government' && !category;
  const activeCategory = sectionType === 'government' ? category : sectionType;
  const baseHref =
    sectionType === 'government'
      ? category
        ? `/government/${category}`
        : '/government'
      : `/${sectionType}`;
  const pageTitle = isGovernmentRoot
    ? categoryData?.category
    : categoryIndex.title || categoryData?.category || category;
  const pageDescription = isGovernmentRoot
    ? categoryData?.description || ''
    : categoryIndex.description || categoryData?.description || '';
  const rootGovernmentPages: SectionCard[] =
    governmentCategories.categories.map(item => ({
      name: item.category,
      slug: item.slug,
      description: item.description,
      icon: item.icon,
    }));
  const displayedPages: SectionCard[] = isGovernmentRoot
    ? rootGovernmentPages
    : subcategories;
  const pageLayout = isGovernmentRoot ? 'grid' : categoryIndex.layout;

  const UNGROUPED = '__ungrouped__';
  const hasGroups = displayedPages.some(page => page.group);
  const groupedPages: [string, SectionCard[]][] = hasGroups
    ? Array.from(
        displayedPages.reduce((groups, page) => {
          const key = page.group ?? UNGROUPED;
          const existing = groups.get(key) ?? [];
          existing.push(page);
          groups.set(key, existing);
          return groups;
        }, new Map<string, SectionCard[]>())
      )
    : [];

  useEffect(() => {
    if (activeCategory && categoryData) {
      setLoading(true);
      setLeadershipContent(null);

      const loadCategory =
        activeCategory === 'leadership'
          ? loadMarkdownContent('index', 'leadership', 'government').then(
              content => {
                setLeadershipContent(content);
                setCategoryIndex({ layout: 'list', pages: [] });
              }
            )
          : getCategorySubcategories(activeCategory).then(setCategoryIndex);

      loadCategory.catch(console.error).finally(() => setLoading(false));
    }
  }, [activeCategory, categoryData]);

  if (!categoryData) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Banner
          type="error"
          title="Category not found"
          description="The category you are looking for does not exist."
          icon
        />
      </Section>
    );
  }

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${categoryData.category}, government services, public services, local government`}
        pageType="CollectionPage"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: sectionMeta[sectionType].category, href: `/${sectionType}` },
          ...(category
            ? [{ label: pageTitle || category, href: baseHref }]
            : []),
        ]}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        {category !== 'leadership' && (
          <>
            <Heading className="mb-2 flex items-center gap-3">
              {categoryData?.icon && (
                <RemixIcon
                  iconClass={categoryData.icon}
                  className="md:text-5xl text-sm text-sky-600"
                />
              )}
              {pageTitle}
            </Heading>
            <Text className="text-gray-600 mb-6">{pageDescription}</Text>
          </>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Text>Loading information...</Text>
          </div>
        ) : category === 'leadership' && leadershipContent ? (
          <LeadershipOfficialsCards
            title={leadershipContent.title}
            description={leadershipContent.description}
            data={leadershipContent.data}
          />
        ) : category === 'barangays' ? (
          <BarangayCards
            title={categoryIndex.title}
            description={categoryIndex.description}
            pages={subcategories}
          />
        ) : (
          <>
            {pageLayout === 'grid' ? (
              hasGroups ? (
                <div className="space-y-10">
                  {groupedPages.map(([groupName, pages]) => (
                    <div key={groupName}>
                      {groupName !== UNGROUPED && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {groupName}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pages.map(subcategory => (
                          <Link
                            key={subcategory.slug}
                            to={`${baseHref}/${subcategory.slug}`}
                          >
                            <Card
                              hoverable
                              className="card-fade-in h-full border-t-4 border-primary-500"
                            >
                              <CardContent>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {subcategory.name}
                                </h4>
                                {subcategory.description && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    {subcategory.description}
                                  </p>
                                )}
                                <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                                  {categoryData.category || category}
                                </span>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedPages.map(subcategory => (
                    <Link
                      key={subcategory.slug}
                      to={`${baseHref}/${subcategory.slug}`}
                    >
                      <Card
                        hoverable
                        className="card-fade-in h-full border-t-4 border-primary-500"
                      >
                        <CardContent>
                          <h4 className="text-lg font-medium text-gray-900">
                            {subcategory.name}
                          </h4>
                          {subcategory.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {subcategory.description}
                            </p>
                          )}
                          <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                            {categoryData.category || category}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {displayedPages.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    to={`${baseHref}/${subcategory.slug}`}
                  >
                    <Card hoverable className="card-fade-in mb-4">
                      <CardContent>
                        <h4 className="text-lg font-medium text-gray-900">
                          {subcategory.name}
                        </h4>
                        {subcategory.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {subcategory.description}
                          </p>
                        )}
                        <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                          {categoryData.category || category}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default Government;
