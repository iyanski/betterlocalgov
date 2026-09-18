/**
 * Indexes all markdown content into Meilisearch.
 *
 * Usage:
 *   MEILISEARCH_HOST=http://localhost:7700 \
 *   MEILISEARCH_ADMIN_KEY=your-admin-key \
 *   node scripts/index-content.mjs
 *
 * Reads MEILISEARCH_HOST and MEILISEARCH_ADMIN_KEY from the environment
 * (or from .env via dotenv). Does NOT use VITE_ prefixed vars because this
 * script runs outside the browser.
 */

import { Meilisearch } from 'meilisearch';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INDEX_NAME = 'content';

const client = new Meilisearch({
  host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractDescription(markdown) {
  const match = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/ms);
  if (!match) return '';
  return match[1].replace(/^>\s*/, '').trim();
}

function stripMarkdown(content) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\{[A-Z0-9_]+\}/g, '')
    .replace(/\|.+\|/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function loadMarkdownPages(dir, categorySlug, categoryName, type) {
  const documents = [];

  const indexPath = join(ROOT, `content/${dir}/${categorySlug}/index.yaml`);
  let pages = [];
  try {
    const indexYaml = readFileSync(indexPath, 'utf8');
    const indexData = yaml.load(indexYaml);
    pages = indexData.pages ?? [];
  } catch {
    return documents;
  }

  for (const page of pages) {
    const mdPath = join(ROOT, `content/${dir}/${categorySlug}/${page.slug}.md`);
    try {
      const raw = readFileSync(mdPath, 'utf8');
      const title = extractTitle(raw) || page.name;
      const description = extractDescription(raw) || page.description || '';
      documents.push({
        id: `${type}-${categorySlug}-${page.slug}`,
        title,
        description,
        content: stripMarkdown(raw),
        type,
        category: categoryName,
        categorySlug,
        slug: page.slug,
        url: `/${dir === 'services' ? 'services' : 'government'}/${categorySlug}/${page.slug}`,
      });
    } catch {
      // Content file doesn't exist yet — skip
    }
  }

  return documents;
}

async function indexContent() {
  const documents = [];

  // Index services
  const servicesYaml = readFileSync(join(ROOT, 'src/data/services.yaml'), 'utf8');
  const servicesData = yaml.load(servicesYaml);
  for (const cat of servicesData.categories) {
    documents.push(...loadMarkdownPages('services', cat.slug, cat.category, 'service'));
  }

  // Index government
  const govYaml = readFileSync(join(ROOT, 'src/data/government.yaml'), 'utf8');
  const govData = yaml.load(govYaml);
  for (const cat of govData.categories) {
    documents.push(...loadMarkdownPages('government', cat.slug, cat.category, 'government'));
    // Also check nested subcategory indexes registered in yamlLoader
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        documents.push(
          ...loadMarkdownPages('government', `${cat.slug}/${sub.slug}`, sub.name, 'government')
        );
      }
    }
  }

  if (documents.length === 0) {
    console.warn('No documents found to index. Check content/ directory.');
    return;
  }

  console.log(`Configuring index "${INDEX_NAME}"...`);
  const index = client.index(INDEX_NAME);

  await index.updateSettings({
    searchableAttributes: ['title', 'description', 'content', 'category'],
    filterableAttributes: ['type', 'categorySlug'],
    displayedAttributes: ['id', 'title', 'description', 'type', 'category', 'categorySlug', 'slug', 'url'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  });

  console.log(`Indexing ${documents.length} documents...`);
  const task = await index.addDocuments(documents, { primaryKey: 'id' });
  console.log(`Done! Task ID: ${task.taskUid}. ${documents.length} documents queued for indexing.`);
}

indexContent().catch(err => {
  console.error('Indexing failed:', err.message);
  process.exit(1);
});
