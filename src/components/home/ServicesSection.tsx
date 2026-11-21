import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import CategoryGrid, { type CategoryGridItem } from './CategoryGrid';
import { useTranslation } from '../../hooks/useTranslation';
import { serviceCategories } from '../../data/yamlLoader';

export default function ServicesSection({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();

  return (
    <Section>
      <SectionHeader
        label="Services"
        title={title || t('services.title')}
        description={description || t('services.description')}
      />
      <CategoryGrid
        categories={serviceCategories.categories as CategoryGridItem[]}
        basePath="/services"
      />
    </Section>
  );
}
