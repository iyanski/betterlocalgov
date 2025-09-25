/**
 * Utility to load markdown content dynamically based on slug
 */

import {
  serviceCategories,
  getCategorySubcategories,
} from '../data/yamlLoader';

export interface MarkdownContent {
  content: string;
  title?: string;
  description?: string;
}

/**
 * Finds the category slug for a given document slug by searching through the services YAML
 * @param documentSlug - The document slug to find
 * @returns The category slug or null if not found
 */
async function findCategorySlug(documentSlug: string): Promise<string | null> {
  // Search through all categories to find which one contains this document
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
}

/**
 * Loads markdown content from the content/category directory
 * @param documentSlug - The document slug (filename without .md extension)
 * @returns Promise with markdown content
 */
export async function loadMarkdownContent(
  documentSlug: string
): Promise<MarkdownContent> {
  try {
    console.log(`Loading markdown content for document: ${documentSlug}`);

    // Find the category slug from the YAML data
    const categorySlug = await findCategorySlug(documentSlug);
    console.log(`Found category slug: ${categorySlug}`);

    if (!categorySlug) {
      throw new Error(`Category not found for document slug: ${documentSlug}`);
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
  } catch (error) {
    console.error(
      `Failed to load markdown content for document: ${documentSlug}`,
      error
    );
    throw new Error(`Document not found: ${documentSlug}`);
  }
}
