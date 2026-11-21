/**
 * Utility to load markdown content dynamically based on slug
 */

/**
 * Replaces {PLACEHOLDER} tokens using JSON data first, then VITE_ env vars.
 */
function interpolate(
  content: string,
  data: Record<string, unknown> = {}
): string {
  return content.replace(/\{([A-Z0-9_]+)\}/g, (match, key) => {
    if (key in data) return String(data[key]);
    const value = import.meta.env[`VITE_${key}`];
    return value !== undefined ? String(value) : match;
  });
}

export interface MarkdownContent {
  content: string;
  /** Markdown with the leading `# Title`, lede paragraph and rule removed. */
  body: string;
  title?: string;
  /** First paragraph after the title (markdown, unrendered). */
  description?: string;
  data?: Record<string, unknown>;
}

/**
 * Splits a document into its title, lede paragraph and remaining body.
 * Only a `# Title` at the very top is lifted out; the lede is the paragraph
 * directly after it, unless that is a heading, list, table, code or rule.
 */
function splitHeader(content: string): {
  title?: string;
  description?: string;
  body: string;
} {
  const heading = content.match(/^\s*#\s+(.+)\n*/);
  if (!heading) return { body: content };

  let rest = content.slice(heading[0].length);
  let description: string | undefined;

  const lede = rest.match(
    /^(?!#|\||[-*+]\s|\d+\.\s|```|~~~|---|\*\*\*|___)(.+?)(?:\n{2,}|\n?$)/s
  );
  if (lede) {
    description = lede[1].replace(/^>\s?/gm, '').trim();
    rest = rest.slice(lede[0].length);
  }

  // A rule usually separates the lede from the first section
  rest = rest.replace(/^\s*(?:---|\*\*\*|___)\s*(?:\n|$)/, '');

  return { title: heading[1].trim(), description, body: rest };
}

/**
 * Loads markdown content from the appropriate content directory.
 * Also attempts to load a companion JSON file (same slug) for template
 * variable substitution and structured data.
 * @param documentSlug - The document slug (filename without .md extension)
 * @param categorySlug - The category slug (parent directory)
 * @param categoryType - Whether this is a 'service' or 'government' document
 */
export async function loadMarkdownContent(
  documentSlug: string,
  categorySlug: string,
  categoryType: 'service' | 'government'
): Promise<MarkdownContent> {
  try {
    const dir = categoryType === 'government' ? 'government' : 'services';

    // Try to load companion JSON for template data
    let data: Record<string, unknown> = {};
    try {
      const jsonModule = await import(
        `../../content/${dir}/${categorySlug}/${documentSlug}.json`
      );
      data = jsonModule.default;
    } catch {
      // No companion JSON — that's fine
    }

    const module = await import(
      `../../content/${dir}/${categorySlug}/${documentSlug}.md?raw`
    );
    const content = interpolate(module.default, data);

    const header = splitHeader(content);
    // Fall back to the first `# Heading` anywhere if the file doesn't open
    // with one
    const title = header.title ?? content.match(/^#\s+(.+)$/m)?.[1];

    return {
      content,
      body: header.body,
      title,
      description: header.description,
      data,
    };
  } catch (error) {
    console.error(
      `Failed to load markdown content for document: ${documentSlug}`,
      error
    );
    throw new Error(`Document not found: ${documentSlug}`, { cause: error });
  }
}
