/**
 * Utility functions for generating URL-friendly slugs
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function generateSlugFromTitle(title: string): string {
  if (!title) return '';
  return generateSlug(title);
}
