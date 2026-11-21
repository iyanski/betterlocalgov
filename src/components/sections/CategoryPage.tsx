import * as LucideIcons from 'lucide-react';
import Section from '../ui/Section';
import Container from '../ui/Container';
import Breadcrumbs from '../ui/Breadcrumbs';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import Notice from '../ui/Notice';
import PageList from './PageList';
import type { Category, CategoryIndex } from '../../data/yamlLoader';

interface CategoryPageProps {
  category: Category | undefined;
  index: CategoryIndex;
  loading: boolean;
  basePath: string;
}

/** Shared body for a single Services or Government category. */
export default function CategoryPage({
  category,
  index,
  loading,
  basePath,
}: CategoryPageProps) {
  if (!category) {
    return (
      <Section>
        <Breadcrumbs className="mb-8" />
        <Notice
          title="Category not found"
          description="The category you are looking for does not exist."
        />
      </Section>
    );
  }

  const Icon = LucideIcons[category.icon as keyof typeof LucideIcons] as
    React.ComponentType<{ className?: string }> | undefined;

  return (
    <>
      <section className="border-b border-ed-rule bg-ed-paper-2 py-10 md:py-14">
        <Container>
          <Breadcrumbs className="mb-8" />
          {Icon && <Icon className="mb-4 h-8 w-8 text-ed-navy" />}
          <div className="max-w-[850px]">
            <Heading>{category.category}</Heading>
            <Text size="lg" className="mb-0">
              {category.description}
            </Text>
          </div>
        </Container>
      </section>

      <Section>
        {loading ? (
          <Notice description="Loading pages…" />
        ) : (
          <>
            {(index.title || index.description) && (
              <div className="mb-8">
                {index.title && <Heading level={2}>{index.title}</Heading>}
                {index.description && <Text>{index.description}</Text>}
              </div>
            )}
            <PageList
              pages={index.pages}
              layout={index.layout}
              basePath={`${basePath}/${category.slug}`}
              eyebrow={category.category}
            />
          </>
        )}
      </Section>
    </>
  );
}
