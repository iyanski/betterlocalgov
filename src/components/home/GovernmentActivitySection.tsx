import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import CategoryGrid, { type CategoryGridItem } from './CategoryGrid';
import { useTranslation } from '../../hooks/useTranslation';
import { governmentCategories } from '../../data/yamlLoader';

interface GovernmentActivitySectionProps {
  title?: string;
  description?: string;
}

export default function GovernmentActivitySection({
  title,
  description,
}: GovernmentActivitySectionProps = {}) {
  const { t } = useTranslation();

  return (
    <Section id="government" tone="tint">
      <SectionHeader
        label="Government"
        title={title || t('governmentActivity.title')}
        description={description || t('governmentActivity.description')}
      />
      <CategoryGrid
        categories={governmentCategories.categories as CategoryGridItem[]}
        basePath="/government"
      />
    </Section>
  );
}
