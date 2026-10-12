import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as yaml from 'js-yaml';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const publicationStatuses = new Set(['draft', 'published', 'archived']);
const verificationStatuses = new Set([
  'awaiting_verification',
  'sourced',
  'verified',
  'outdated',
]);
const sourceTypes = new Set([
  'lgu_official',
  'national_government',
  'provincial_government',
  'official_government_publication',
  'official_government_social_media',
  'public_document',
  'other_public_source',
]);
const intervalMonths = Number.parseInt(
  process.env.CONTENT_REVERIFY_MONTHS || '12',
  10
);
const errors = [];
const warnings = [];
const metrics = {
  published: 0,
  draft: 0,
  archived: 0,
  awaiting_verification: 0,
  sourced: 0,
  verified: 0,
  outdated: 0,
  dueForReverification: 0,
};
const contentRegister = JSON.parse(
  fs.readFileSync(path.join(root, 'governance/content-register.json'), 'utf8')
);
const registeredContent = new Map(
  (contentRegister.records || []).map(record => [record.contentId, record])
);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function relative(file) {
  return path.relative(root, file);
}

function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isStale(dateValue) {
  if (!isDate(dateValue)) return true;
  const due = new Date(`${dateValue}T00:00:00Z`);
  due.setUTCMonth(due.getUTCMonth() + intervalMonths);
  return due <= new Date();
}

const files = walk(contentRoot);
const companionRecords = new Map();

for (const file of files.filter(file => file.endsWith('.json'))) {
  let record;
  try {
    record = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${relative(file)}: invalid JSON (${error.message})`);
    continue;
  }

  const id = file.slice(0, -'.json'.length);
  companionRecords.set(id, record);
  const publicationStatus = record.publicationStatus || 'draft';
  metrics[publicationStatus] = (metrics[publicationStatus] || 0) + 1;
  if (!publicationStatuses.has(publicationStatus)) {
    errors.push(`${relative(file)}: invalid publicationStatus`);
  }
  if (publicationStatus === 'published') {
    const contentId = path.relative(contentRoot, id);
    const governanceRecord = registeredContent.get(contentId);
    if (!governanceRecord) {
      errors.push(
        `${relative(file)}: published content needs an internal governance record`
      );
    } else if (
      !governanceRecord.verifiedBy ||
      !isDate(governanceRecord.createdAt) ||
      !isDate(governanceRecord.updatedAt)
    ) {
      errors.push(
        `${relative(file)}: internal governance record is incomplete`
      );
    }
    if (contentId.startsWith(`hotlines${path.sep}`)) {
      if (!record.name || !record.displayPhone) {
        errors.push(`${relative(file)}: hotline needs a name and displayPhone`);
      }
      if (
        typeof record.phone !== 'string' ||
        !/^\+?\d{3,15}$/.test(record.phone)
      ) {
        errors.push(
          `${relative(file)}: hotline needs a normalized phone value`
        );
      }
    }
  }

  const provenance = record.provenance;
  if (!provenance) {
    if (publicationStatus === 'published') {
      errors.push(`${relative(file)}: published content requires provenance`);
    }
    continue;
  }

  const status = provenance.verificationStatus;
  if (!verificationStatuses.has(status)) {
    errors.push(`${relative(file)}: invalid verificationStatus`);
    continue;
  }
  metrics[status] += 1;

  if (!isDate(provenance.lastUpdatedAt)) {
    errors.push(`${relative(file)}: provenance.lastUpdatedAt is required`);
  }
  if (status === 'verified' && !isDate(provenance.lastVerifiedAt)) {
    errors.push(`${relative(file)}: verified content needs lastVerifiedAt`);
  }
  if (publicationStatus === 'published' && status === 'awaiting_verification') {
    errors.push(
      `${relative(file)}: awaiting-verification content cannot publish`
    );
  }
  if (publicationStatus === 'published' && status !== 'outdated') {
    if (isStale(provenance.lastVerifiedAt)) {
      metrics.dueForReverification += 1;
      warnings.push(`${relative(file)}: due for reverification`);
    }
  }

  if (!Array.isArray(provenance.sources)) {
    errors.push(`${relative(file)}: provenance.sources must be an array`);
    continue;
  }
  if (
    (status === 'verified' || status === 'sourced') &&
    provenance.sources.length === 0
  ) {
    errors.push(
      `${relative(file)}: ${status} content needs at least one source`
    );
  }
  provenance.sources.forEach((source, index) => {
    const label = `${relative(file)}: source ${index + 1}`;
    if (!source.title || !source.organization) {
      errors.push(`${label} needs a title and organization`);
    }
    if (!isHttpUrl(source.url)) errors.push(`${label} has an invalid URL`);
    if (!sourceTypes.has(source.type))
      errors.push(`${label} has an invalid type`);
    if (source.publishedAt && !isDate(source.publishedAt)) {
      errors.push(`${label} has an invalid publishedAt date`);
    }
  });
}

for (const file of files.filter(file => file.endsWith('index.yaml'))) {
  const index = yaml.load(fs.readFileSync(file, 'utf8')) || {};
  for (const page of index.pages || []) {
    const publicationStatus =
      page.publicationStatus || (page.published ? 'published' : 'draft');
    const verificationStatus =
      page.verificationStatus ||
      (page.published ? 'verified' : 'awaiting_verification');
    if (!publicationStatuses.has(publicationStatus)) {
      errors.push(
        `${relative(file)} (${page.slug}): invalid publicationStatus`
      );
    }
    if (!verificationStatuses.has(verificationStatus)) {
      errors.push(
        `${relative(file)} (${page.slug}): invalid verificationStatus`
      );
    }
    if (publicationStatus !== 'published') continue;

    const companionId = path.join(path.dirname(file), page.slug);
    const companion = companionRecords.get(companionId);
    if (!companion) {
      errors.push(
        `${relative(file)} (${page.slug}): published page needs companion JSON`
      );
      continue;
    }
    if (companion.publicationStatus !== publicationStatus) {
      errors.push(
        `${relative(file)} (${page.slug}): publication status differs from companion`
      );
    }
    if (companion.provenance?.verificationStatus !== verificationStatus) {
      errors.push(
        `${relative(file)} (${page.slug}): verification status differs from companion`
      );
    }
  }
}

console.log('Content governance audit');
console.table(metrics);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (errors.length > 0) process.exitCode = 1;
