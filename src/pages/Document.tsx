import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Text } from '../components/ui/Text';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { createMarkdownComponents } from '../lib/markdownComponents';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { getTypographyTheme } from '../lib/typographyThemes';
import {
  serviceCategories,
  getCategorySubcategories,
} from '../data/yamlLoader';

interface DocumentProps {
  theme?: string; // Typography theme name
}

export default function Document({
  theme: initialTheme = 'default',
}: DocumentProps) {
  const { documentSlug } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  // Generate dynamic breadcrumb items based on document slug
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
  ]);

  useEffect(() => {
    if (!documentSlug) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load content
        const content = await loadMarkdownContent(documentSlug);
        setMarkdownContent(content);

        // Generate breadcrumbs
        if (documentSlug) {
          // Search through all categories to find which one contains this document
          for (const category of serviceCategories.categories) {
            try {
              const subcategories = await getCategorySubcategories(
                category.slug
              );
              const found = subcategories.find(
                sub => sub.slug === documentSlug
              );

              if (found) {
                const newBreadcrumbs = [
                  { label: 'Home', href: '/' },
                  { label: 'Services', href: '/services' },
                  {
                    label: category.category,
                    href: `/services/${category.slug}`,
                  },
                  { label: found.name, href: `/${found.slug}` },
                ];
                setBreadcrumbs(newBreadcrumbs);
                break;
              }
            } catch (error) {
              console.warn(
                `Error loading subcategories for category ${category.slug}:`,
                error
              );
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document'
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [documentSlug]);

  if (loading) {
    return (
      <Section className="p-3 mb-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading document...</div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Heading>Document Not Found</Heading>
        <Text className="text-red-600 mb-6">{error}</Text>
      </Section>
    );
  }

  if (!markdownContent) {
    return null;
  }

  return (
    <Section className="p-3 mb-12">
      <Breadcrumbs className="mb-8" items={breadcrumbs} />
      <Card className="mb-8 markdown-content">
        <CardHeader>
          {markdownContent.description && (
            <CardContent>{markdownContent.description}</CardContent>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {markdownContent.content}
          </ReactMarkdown>
        </CardHeader>
      </Card>
    </Section>
  );
}
