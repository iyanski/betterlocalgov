/**
 * Builds a static search index (public/search-index.json) for the
 * client-side Fuse.js search page. No external search service or
 * subscription required — this runs at build/dev time, like
 * generate-seo-files.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const publicDir = path.join(root, 'public');

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function firstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function firstParagraph(markdown) {
  const withoutHeading = markdown.replace(/^#.*$/m, '').trim();
  const match = withoutHeading.match(/^([^\n#][^\n]*)/);
  return match ? match[1].trim().slice(0, 200) : '';
}

function readMarkdownEntry(section, categorySlug, pageSlug) {
  const filePath = path.join(
    root,
    'content',
    section,
    categorySlug,
    `${pageSlug}.md`
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  return {
    title: firstHeading(raw) ?? pageSlug,
    description: firstParagraph(raw),
    url: `/${section}/${categorySlug}/${pageSlug}`,
    section,
  };
}

function categoryEntries(section, yamlFile) {
  const data = readYaml(path.join(root, 'src', 'data', yamlFile));
  const entries = [];

  for (const category of data.categories ?? []) {
    entries.push({
      title: category.category,
      description: category.description ?? '',
      url: `/${section}/${category.slug}`,
      section,
    });

    const indexPath = path.join(
      root,
      'content',
      section,
      category.slug,
      'index.yaml'
    );

    if (!fs.existsSync(indexPath)) {
      continue;
    }

    const categoryIndex = readYaml(indexPath);

    for (const page of categoryIndex.pages ?? []) {
      const entry = readMarkdownEntry(section, category.slug, page.slug);
      entries.push(
        entry ?? {
          title: page.name,
          description: page.description ?? '',
          url: `/${section}/${category.slug}/${page.slug}`,
          section,
        }
      );
    }
  }

  return entries;
}

function indexSectionEntries(section) {
  const indexPath = path.join(root, 'content', section, 'index.yaml');

  if (!fs.existsSync(indexPath)) {
    return [];
  }

  const index = readYaml(indexPath);

  return (index.pages ?? []).map(page => ({
    title: page.name,
    description: page.description ?? '',
    url: `/${section}/${page.slug}`,
    section,
  }));
}

function updatesEntries() {
  const filePath = path.join(root, 'src', 'data', 'updates.ts');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  // Lightweight extraction: each update object is a flat literal with
  // simple quoted string fields (no nested braces in title/description).
  const objectPattern = /\{[^{}]*status:\s*'published'[^{}]*\}/g;
  const matches = raw.match(objectPattern) ?? [];

  for (const block of matches) {
    const id = block.match(/id:\s*'([^']*)'/)?.[1];
    const title = block.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1];
    const description = block.match(/description:\s*'((?:[^'\\]|\\.)*)'/)?.[1];

    if (id && title) {
      entries.push({
        title,
        description: (description ?? '').slice(0, 200),
        url: '/updates',
        section: 'updates',
      });
    }
  }

  return entries;
}

const entries = [
  ...categoryEntries('services', 'services.yaml'),
  ...categoryEntries('government', 'government.yaml'),
  ...indexSectionEntries('transparency'),
  ...indexSectionEntries('statistics'),
  ...updatesEntries(),
].map((entry, index) => ({ id: index, ...entry }));

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(
  path.join(publicDir, 'search-index.json'),
  JSON.stringify(entries),
  'utf8'
);

console.log(`Generated search index with ${entries.length} entries`);
