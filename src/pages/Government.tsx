import Section from '../components/ui/Section';
import { useParams, Link } from 'react-router';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  governmentCategories,
  getCategorySubcategories,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import SEO from '../components/SEO';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { Banner } from '@bettergov/kapwa/banner';
import { useState, useEffect } from 'react';
import { CategoryIcon } from '../lib/categoryIcons';
import VerificationBadge from '../components/content/VerificationBadge';

const emptyCategoryIndex: CategoryIndex = { layout: 'list', pages: [] };

const Government: React.FC = () => {
  const { category } = useParams();
  const [loadedCategory, setLoadedCategory] = useState<{
    slug: string;
    index: CategoryIndex;
  } | null>(null);
  const categoryIndex =
    loadedCategory && loadedCategory.slug === category
      ? loadedCategory.index
      : emptyCategoryIndex;
  const subcategories: Subcategory[] = categoryIndex.pages;

  const getCategory = () => {
    return governmentCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  const loading = Boolean(
    category && categoryData && loadedCategory?.slug !== category
  );

  useEffect(() => {
    if (category && categoryData) {
      let active = true;
      getCategorySubcategories(category)
        .then(index => {
          if (active) setLoadedCategory({ slug: category, index });
        })
        .catch(error => {
          console.error(error);
          if (active) {
            setLoadedCategory({ slug: category, index: emptyCategoryIndex });
          }
        });

      return () => {
        active = false;
      };
    }
  }, [category, categoryData]);

  if (!category) {
    return (
      <>
        <SEO
          title="Municipal Information"
          description={`Community-organized information about ${import.meta.env.VITE_GOVERNMENT_NAME}. Details are added after verification.`}
          keywords="Gattaran municipal information, local government, civic information"
        />
        <GovernmentActivitySection
          title="Municipal information"
          description={`Browse the portal's information structure for ${import.meta.env.VITE_GOVERNMENT_NAME}. Office, official, contact, and activity details will be added only after verification.`}
        />
      </>
    );
  }
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
        title={categoryData.category || category}
        description={categoryData.description}
        keywords={`${categoryData.category}, government services, public services, local government`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <CategoryIcon
          name={categoryData.icon}
          className="h-8 w-8 mb-4 text-primary-600 rounded-md"
        />
        <Heading>{categoryData.category || category}</Heading>
        <Text className="text-gray-600 mb-6">{categoryData.description}</Text>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Text>Loading services...</Text>
          </div>
        ) : (
          <>
            {categoryIndex.title && (
              <Heading level={3}>{categoryIndex.title}</Heading>
            )}
            {categoryIndex.description && (
              <Text className="text-gray-600 mb-4">
                {categoryIndex.description}
              </Text>
            )}
            {subcategories.length === 0 && (
              <Banner
                type="info"
                title="Information pending verification"
                description="No records are published in this section yet. Better Gattaran will add information only after it is checked against an authoritative public source."
                icon
              />
            )}
            {categoryIndex.layout === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    to={`/government/${category}/${subcategory.slug}`}
                  >
                    <Card
                      hoverable
                      className="h-full border-t-4 border-primary-500"
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
                        {subcategory.verificationStatus && (
                          <div className="mt-3">
                            <VerificationBadge
                              status={subcategory.verificationStatus}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    to={`/government/${category}/${subcategory.slug}`}
                  >
                    <Card hoverable className="mb-4">
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
                        {subcategory.verificationStatus && (
                          <div className="mt-3">
                            <VerificationBadge
                              status={subcategory.verificationStatus}
                            />
                          </div>
                        )}
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
