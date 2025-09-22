import Section from '../ui/Section';
import * as LucideIcons from 'lucide-react';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/Card';
import { Link } from 'react-router-dom';

import { governmentActivitCategories } from '../../data/yamlLoader';

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
  description: string;
}

export default function GovernmentActivitySection() {
  const { t } = useTranslation();

  const getIcon = (category: string) => {
    const iconMap: { [key: string]: keyof typeof LucideIcons } = {
      'business-trade': 'Building2',
      'childcare-and-parenting': 'Baby',
      'certificates-ids': 'FileCheck',
      contributions: 'Wallet',
      'disaster-weather': 'Cloud',
      education: 'GraduationCap',
      employment: 'Briefcase',
      'environment-waste': 'Recycle',
      health: 'Heart',
      housing: 'Home',
      'passport-travel': 'Plane',
      'social-services': 'Users',
      'special-populations': 'Users2',
      tax: 'Receipt',
      'transport-driving': 'Car',
    };

    const IconComponent = LucideIcons[
      iconMap[category] || 'FileText'
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  const displayedCategories =
    governmentActivitCategories.categories as Category[];

  return (
    <Section>
      <Heading level={2}>{t('governmentActivity.title')}</Heading>
      <Text className="text-gray-600 mb-6">
        {t('governmentActivity.description')}
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map(category => (
          <Card
            key={category.slug}
            hoverable
            className="border-t-4 border-primary-500"
          >
            <Link
              to={`/services?category=${category.slug}`}
              className="mt-auto text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center"
            >
              <CardContent className="flex flex-col h-full p-6">
                <div className="flex gap-2">
                  <div className="bg-primary-100 text-primary-600 p-3 rounded-md mb-4 self-start">
                    {getIcon(category.slug)}
                  </div>

                  <h3 className="text-lg font-semibold mb-4 text-gray-900 self-center">
                    {category.category}
                  </h3>
                </div>
                <Text className="text-gray-800">{category.description}</Text>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  );
}
