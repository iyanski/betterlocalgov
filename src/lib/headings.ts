import { isValidElement, type ReactNode } from 'react';

export interface DocumentHeading {
  id: string;
  text: string;
}

/** GitHub-style slug: lowercase, ASCII letters/digits, hyphen-separated. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Plain text of rendered React children, used to derive heading ids. */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children);
  }
  return '';
}

/** Drop inline markdown syntax so source text matches the rendered text. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|`)/g, '')
    .trim();
}

/** Level-2 headings (`## Title`) in a markdown string, skipping code fences. */
export function extractHeadings(markdown: string): DocumentHeading[] {
  const headings: DocumentHeading[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (match) {
      const text = stripInlineMarkdown(match[1]);
      headings.push({ id: slugify(text), text });
    }
  }

  return headings;
}
