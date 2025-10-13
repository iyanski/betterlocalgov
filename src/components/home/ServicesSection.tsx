import Section from '../ui/Section';
import * as LucideIcons from 'lucide-react';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/Card';
import { Link } from 'react-router-dom';
import type { Category } from '../../services/api';

// Icon mapping for categories - you can customize this based on your category names
const categoryIconMap: Record<string, string> = {
  business: 'Briefcase',
  education: 'GraduationCap',
  health: 'Heart',
  environment: 'Leaf',
  infrastructure: 'Building',
  'social-welfare': 'Users',
  agriculture: 'Wheat',
  'disaster-preparedness': 'Shield',
  'garbage-waste': 'Trash2',
  housing: 'Home',
  // Add more mappings as needed
};

export default function ServicesSection({
  title,
  description,
  serviceCategories,
  loading = false,
  error = null,
}: {
  title?: string;
  description?: string;
  serviceCategories: Category[];
  loading?: boolean;
  error?: string | null;
}) {
  const { t } = useTranslation();

  const getIcon = (categorySlug: string) => {
    const iconName = categoryIconMap[categorySlug] || 'Folder';
    const IconComponent = LucideIcons[
      iconName as keyof typeof LucideIcons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  // Show loading state
  if (loading) {
    return (
      <Section>
        <Heading level={2}>{title || t('services.title')}</Heading>
        <Text className="text-gray-600 dark:text-gray-300 mb-6">
          {description || t('services.description')}
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="border-t-4 border-primary-500">
              <CardContent className="flex flex-col h-full p-6">
                <div className="animate-pulse">
                  <div className="flex gap-2">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-md mb-4 w-12 h-12"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-6 w-32 mb-4 rounded"></div>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    );
  }

  // Show error state
  if (error) {
    return (
      <Section>
        <Heading level={2}>{title || t('services.title')}</Heading>
        <Text className="text-gray-600 dark:text-gray-300 mb-6">
          {description || t('services.description')}
        </Text>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <Text className="text-red-600 dark:text-red-400">
            Failed to load services: {error}
          </Text>
        </div>
      </Section>
    );
  }

  const displayedCategories = serviceCategories;

  return (
    <Section>
      <Heading level={2}>{title || t('services.title')}</Heading>
      <Text className="text-gray-600 dark:text-gray-300 mb-6">
        {description || t('services.description')}
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map(category => (
          <Card
            key={category.id}
            hoverable
            className="border-t-4 border-primary-500"
          >
            <Link
              to={`/services/${category.slug}`}
              className="mt-auto text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors inline-flex items-center"
            >
              <CardContent className="flex flex-col h-full p-6">
                <div className="flex gap-2">
                  <div className="text-primary-600 dark:text-white p-3 rounded-md mb-4">
                    {getIcon(category.slug)}
                  </div>

                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white self-center">
                    {category.name}
                  </h3>
                </div>
                <Text>
                  {category.description || 'No description available'}
                </Text>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  );
}
