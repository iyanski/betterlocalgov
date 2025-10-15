import Section from '../components/ui/Section';
import { useParams } from 'react-router-dom';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  useServiceCategories,
  useCategorySubcategories,
} from '../hooks/useApiData';
import * as LucideIcons from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import ListItem from '../components/ui/ListItem';
import { LoadingState, ErrorState } from '../components/ui/LoadingSpinner';

const Services: React.FC = () => {
  const { category } = useParams();

  // Use API hooks for data loading
  const {
    data: serviceCategoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useServiceCategories();
  const {
    data: subcategories,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } = useCategorySubcategories(category || '');

  const getCategory = () => {
    return serviceCategoriesData?.categories.find(
      (c: { slug: string }) => c.slug === category
    );
  };

  const categoryData = getCategory();
  const Icon = LucideIcons[
    categoryData?.icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  // Show loading state while categories are loading
  if (categoriesLoading) {
    return <LoadingState message="Loading services..." />;
  }

  // Show error state if categories failed to load
  if (categoriesError) {
    return <ErrorState error={categoriesError} />;
  }

  if (!category) {
    return (
      <>
        <SEO
          title="Services"
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
          keywords="government services, public services, local government, civic services"
        />
        <ServicesSection
          title={`All local government services`}
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
          serviceCategories={[]}
          loading={categoriesLoading}
          error={categoriesError}
        />
      </>
    );
  }
  if (!categoryData) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Heading level={2}>Category not found</Heading>
          <Text className="text-gray-600 mb-6">
            The category you are looking for does not exist.
          </Text>
        </div>
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
        {Icon && <Icon className="h-8 w-8 mb-4 text-primary-600 rounded-md" />}
        <Heading>{categoryData.category}</Heading>
        <Text className="text-gray-600 mb-6">{categoryData.description}</Text>

        {subcategoriesLoading ? (
          <LoadingState message="Loading services..." />
        ) : subcategoriesError ? (
          <ErrorState error={subcategoriesError} />
        ) : (
          <div className="space-y-4">
            {subcategories?.map(
              (subcategory: {
                slug: string;
                name: string;
                description?: string;
              }) => (
                <ListItem
                  key={subcategory.slug}
                  title={subcategory.name}
                  category={categoryData.category || category}
                  description={subcategory.description || ''}
                  href={`/${subcategory.slug}`}
                />
              )
            )}
          </div>
        )}
      </Section>
    </>
  );
};

export default Services;
