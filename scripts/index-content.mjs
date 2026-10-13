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
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import 'dotenv/config';
import {
  allowSourcedFromEnv,
  isIndexEntryPublic,
  isRawRecordPublic,
} from './lib/visibility.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INDEX_NAME = 'content';
// Same switch as the app (VITE_ALLOW_SOURCED_CONTENT); ALLOW_SOURCED_CONTENT
// still overrides it for existing indexing setups.
const ALLOW_SOURCED = allowSourcedFromEnv(
  process.env.ALLOW_SOURCED_CONTENT ?? process.env.VITE_ALLOW_SOURCED_CONTENT
);

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
    pages = (indexData.pages ?? []).filter(page =>
      isIndexEntryPublic(page, ALLOW_SOURCED)
    );
  } catch {
    return documents;
  }

  for (const page of pages) {
    const mdPath = join(ROOT, `content/${dir}/${categorySlug}/${page.slug}.md`);
    const jsonPath = join(
      ROOT,
      `content/${dir}/${categorySlug}/${page.slug}.json`
    );
    try {
      const companion = JSON.parse(readFileSync(jsonPath, 'utf8'));
      const companionStatus = companion.provenance?.verificationStatus;
      if (
        !isRawRecordPublic(companion, ALLOW_SOURCED) ||
        companionStatus !== page.verificationStatus
      ) {
        continue;
      }

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
        verificationStatus: companionStatus,
        url: `/${dir === 'services' ? 'services' : 'government'}/${categorySlug}/${page.slug}`,
      });
    } catch {
      // Content file doesn't exist yet — skip
    }
  }

  return documents;
}

function loadHotlines() {
  const directory = join(ROOT, 'content/hotlines');

  return readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .flatMap(file => {
      try {
        const record = JSON.parse(readFileSync(join(directory, file), 'utf8'));
        // Mirrors getPublicHotlines() in src/lib/hotlines.ts.
        const eligible =
          isRawRecordPublic(record, ALLOW_SOURCED) &&
          record.provenance.sources?.length > 0 &&
          Boolean(record.provenance.lastVerifiedAt) &&
          /^\+?\d{3,15}$/.test(record.phone);
        if (!eligible) return [];

        const slug = file.replace(/\.json$/, '');
        return [
          {
            id: `hotline-${slug}`,
            title: record.name,
            description: `Emergency contact: ${record.displayPhone}`,
            content: `${record.name} ${record.displayPhone}`,
            type: 'hotline',
            category: 'Emergency hotlines',
            categorySlug: 'hotlines',
            slug,
            url: `/hotlines#${slug}`,
            verificationStatus: record.provenance.verificationStatus,
          },
        ];
      } catch {
        return [];
      }
    });
}

function loadProjects() {
  const directory = join(ROOT, 'content/projects');

  return readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .flatMap(file => {
      try {
        const record = JSON.parse(readFileSync(join(directory, file), 'utf8'));
        const project = record.project;
        const sources = record.provenance?.sources ?? [];
        // Mirrors getPublicProjects() in src/lib/projects.ts.
        const eligible =
          isRawRecordPublic(record, ALLOW_SOURCED) &&
          sources.length > 0 &&
          sources.every(source => Boolean(source.locator)) &&
          typeof project?.name === 'string';
        if (!eligible) return [];

        const slug = file.replace(/\.json$/, '');
        return [
          {
            id: `project-${slug}`,
            title: project.name,
            description: [project.implementingAgency, project.location]
              .filter(Boolean)
              .join(' · '),
            content: [
              project.name,
              project.implementingAgency,
              project.location,
              project.status,
              project.contractor,
            ]
              .filter(Boolean)
              .join(' '),
            type: 'project',
            category: 'National government projects in Gattaran',
            categorySlug: 'projects',
            slug,
            url: '/government/projects',
            verificationStatus: record.provenance.verificationStatus,
          },
        ];
      } catch {
        return [];
      }
    });
}

async function indexContent() {
  const documents = [];

  // Index services
  const servicesYaml = readFileSync(
    join(ROOT, 'src/data/services.yaml'),
    'utf8'
  );
  const servicesData = yaml.load(servicesYaml);
  for (const cat of servicesData.categories) {
    documents.push(
      ...loadMarkdownPages('services', cat.slug, cat.category, 'service')
    );
  }

  // Index government
  const govYaml = readFileSync(join(ROOT, 'src/data/government.yaml'), 'utf8');
  const govData = yaml.load(govYaml);
  for (const cat of govData.categories) {
    documents.push(
      ...loadMarkdownPages('government', cat.slug, cat.category, 'government')
    );
    // Also check nested subcategory indexes registered in yamlLoader
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        documents.push(
          ...loadMarkdownPages(
            'government',
            `${cat.slug}/${sub.slug}`,
            sub.name,
            'government'
          )
        );
      }
    }
  }

  documents.push(...loadHotlines());
  documents.push(...loadProjects());

  if (documents.length === 0) {
    console.warn('No documents found to index. Check content/ directory.');
    return;
  }

  console.log(`Configuring index "${INDEX_NAME}"...`);
  const index = client.index(INDEX_NAME);

  await index.updateSettings({
    searchableAttributes: ['title', 'description', 'content', 'category'],
    filterableAttributes: ['type', 'categorySlug'],
    displayedAttributes: [
      'id',
      'title',
      'description',
      'type',
      'category',
      'categorySlug',
      'slug',
      'url',
      'verificationStatus',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
  });

  console.log(`Indexing ${documents.length} documents...`);
  const task = await index.addDocuments(documents, { primaryKey: 'id' });
  console.log(
    `Done! Task ID: ${task.taskUid}. ${documents.length} documents queued for indexing.`
  );
}

indexContent().catch(err => {
  console.error('Indexing failed:', err.message);
  process.exit(1);
});
