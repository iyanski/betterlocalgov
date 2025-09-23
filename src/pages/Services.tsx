import Section from '../components/ui/Section';
import { Link, useParams } from 'react-router-dom';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  serviceCategories,
  getCategorySubcategories,
  type Subcategory,
} from '../data/yamlLoader';
import * as LucideIcons from 'lucide-react';
import { CardContent } from '../components/ui/Card';
import { Card } from '../components/ui/Card';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';

const Services: React.FC = () => {
  const { category } = useParams();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  const getCategory = () => {
    return serviceCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  const Icon = LucideIcons[
    categoryData?.icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category)
        .then(setSubcategories)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData]);

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
        <Icon className="h-8 w-8 mb-4 text-primary-600 rounded-md" />
        <Heading>{categoryData.category || category}</Heading>
        <Text className="text-gray-600 mb-6">{categoryData.description}</Text>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Text>Loading services...</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {subcategories.map(subcategory => (
              <Card
                key={subcategory.slug}
                hoverable
                className="border-t-4 border-primary-500"
              >
                <Link
                  to={`/${subcategory.slug}`}
                  className="mt-auto text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center"
                >
                  <CardContent className="flex flex-col h-full p-6">
                    <Heading
                      level={6}
                      className="text-lg font-semibold mb-0 text-gray-900 self-center"
                    >
                      {subcategory.name}
                    </Heading>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Services;
