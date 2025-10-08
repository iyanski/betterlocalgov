/**
 * Utility to load markdown content dynamically based on slug
 */

import {
  getServiceCategories,
  getCategorySubcategories,
} from '../data/yamlLoader';
import { apiService } from '../services/api';

export interface MarkdownContent {
  content: string;
  title?: string;
  description?: string;
}

/**
 * Finds the category slug for a given document slug by searching through the API
 * @param documentSlug - The document slug to find
 * @returns The category slug or null if not found
 */
async function findCategorySlug(documentSlug: string): Promise<string | null> {
  try {
    // First try to get the content directly from API to find its category
    try {
      const content = await apiService.getContentBySlug(documentSlug);
      if (content.categories && content.categories.length > 0) {
        return content.categories[0].category.slug;
      }
    } catch (apiError) {
      console.warn(`Failed to find content by slug from API:`, apiError);
    }

    // Fallback: Search through all categories to find which one contains this document
    const serviceCategories = await getServiceCategories();
    for (const category of serviceCategories.categories) {
      // Check if category has subcategories (backward compatibility)
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.slug === documentSlug) {
            return category.slug;
          }
        }
      } else {
        // Use the new async loading approach
        try {
          const subcategories = await getCategorySubcategories(category.slug);
          const found = subcategories.find(sub => sub.slug === documentSlug);
          if (found) {
            return category.slug;
          }
        } catch (error) {
          console.warn(
            `Error loading subcategories for category ${category.slug}:`,
            error
          );
        }
      }
    }
    return null;
  } catch (error) {
    console.error(
      `Error finding category slug for document ${documentSlug}:`,
      error
    );
    return null;
  }
}

/**
 * Loads markdown content from the API or fallback to static files
 * @param documentSlug - The document slug (filename without .md extension)
 * @returns Promise with markdown content
 */
export async function loadMarkdownContent(
  documentSlug: string
): Promise<MarkdownContent> {
  try {
    console.log(`Loading markdown content for document: ${documentSlug}`);

    // Try to get content from API first
    try {
      const content = await apiService.getContentBySlug(documentSlug);

      // Convert API content to markdown format
      const markdownContent = convertApiContentToMarkdown(content);

      return {
        content: markdownContent,
        title: content.title,
        description:
          content.content.excerpt || content.content.description || '',
      };
    } catch (apiError) {
      console.warn(
        `Failed to load content from API, trying fallback:`,
        apiError
      );

      // Fallback to static file loading
      const categorySlug = await findCategorySlug(documentSlug);
      console.log(`Found category slug: ${categorySlug}`);

      if (!categorySlug) {
        throw new Error(
          `Category not found for document slug: ${documentSlug}`
        );
      }

      // Import the markdown file dynamically from the services directory
      // Construct the path using the category slug and document slug
      const module = await import(
        `../../content/services/${categorySlug}/${documentSlug}.md?raw`
      );
      const content = module.default;

      // Extract title from the first heading (# Title)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : undefined;

      // Extract description from the first paragraph after the title
      const descriptionMatch = content.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/s);
      const description = descriptionMatch
        ? descriptionMatch[1].replace(/^>\s*/, '').trim()
        : undefined;

      return {
        content,
        title,
        description,
      };
    }
  } catch (error) {
    console.error(
      `Failed to load markdown content for document: ${documentSlug}`,
      error
    );
    throw new Error(`Document not found: ${documentSlug}`);
  }
}

/**
 * Converts API content to markdown format
 * @param content - API content object
 * @returns Markdown string
 */
function convertApiContentToMarkdown(content: Record<string, unknown>): string {
  let markdown = `# ${content.title}\n\n`;

  // Add description if available
  if (content.content.excerpt || content.content.description) {
    markdown += `> ${content.content.excerpt || content.content.description}\n\n`;
  }

  // Add main content
  if (content.content.body) {
    markdown += content.content.body;
  } else if (content.content.content) {
    markdown += content.content.content;
  } else {
    // Fallback: convert JSON content to markdown
    markdown += JSON.stringify(content.content, null, 2);
  }

  return markdown;
}
