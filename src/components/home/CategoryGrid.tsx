import * as LucideIcons from 'lucide-react';
import LinkCard from '../ui/LinkCard';

export interface CategoryGridItem {
  category: string;
  slug: string;
  description: string;
  icon: string;
}

const getIcon = (name: string) => {
  const IconComponent = LucideIcons[
    name as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;
  return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
};

export default function CategoryGrid({
  categories,
  basePath,
}: {
  categories: CategoryGridItem[];
  basePath: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map(category => (
        <LinkCard
          key={category.slug}
          to={`${basePath}/${category.slug}`}
          icon={getIcon(category.icon)}
          title={category.category}
          description={category.description}
        />
      ))}
    </div>
  );
}
