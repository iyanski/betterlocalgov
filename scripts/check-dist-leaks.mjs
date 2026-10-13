/**
 * Post-build check: fails when text from non-public content (drafts, archived
 * or unverified records, unfiled FOI request drafts, hidden index entries)
 * appears anywhere in dist/: JS chunks, pre-rendered HTML, the sitemap or
 * generated JSON. Runs after scripts/prerender.mjs in `npm run build`.
 *
 * Visibility comes from the shared policy (scripts/lib/visibility.mjs) with
 * the same VITE_ALLOW_SOURCED_CONTENT value the build used.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as yaml from 'js-yaml';
import { loadEnv } from 'vite';
import {
  classifyContentFile,
  filterIndexYaml,
} from './lib/content-visibility-plugin.mjs';
import { allowSourcedFromEnv, isIndexEntryPublic } from './lib/visibility.mjs';
import { buildFingerprints, findLeaks } from './lib/leak-check.mjs';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const dist = path.join(root, 'dist');
const mode = process.env.LEAK_CHECK_MODE ?? 'production';
const env = loadEnv(mode, root, 'VITE_');
const allowSourced = allowSourcedFromEnv(env.VITE_ALLOW_SOURCED_CONTENT);

/** Unfiled FOI drafts must never ship, whatever their status fields say. */
const ALWAYS_HIDDEN_DIRECTORIES = ['request-drafts'];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const hidden = [];
const publicTexts = [];

for (const file of walk(contentRoot)) {
  const label = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  const top = path.relative(contentRoot, file).split(path.sep)[0];
  const kind = file.endsWith('.json') ? 'json' : 'text';

  if (ALWAYS_HIDDEN_DIRECTORIES.includes(top)) {
    hidden.push({ label, text, kind });
    continue;
  }

  const classification = classifyContentFile(contentRoot, file, allowSourced);
  if (!classification) {
    publicTexts.push(text);
    continue;
  }

  if (classification.kind === 'index') {
    const filtered = filterIndexYaml(file, text, allowSourced);
    const kept = new Set(
      (yaml.load(filtered)?.pages ?? []).map(page => page.slug)
    );
    publicTexts.push(filtered);
    for (const page of yaml.load(text)?.pages ?? []) {
      if (kept.has(page.slug)) continue;
      const reason = isIndexEntryPublic(page, allowSourced)
        ? 'companion record not public'
        : 'index entry not public';
      hidden.push({
        label: `${label} (${page.slug}: ${reason})`,
        text: [page.name, page.description].filter(Boolean).join('\n'),
        kind: 'text',
      });
    }
    continue;
  }

  if (classification.public) publicTexts.push(text);
  else hidden.push({ label, text, kind });
}

// Application source and UI strings ship by design, so text that also
// appears there (an agency name, a shared disclaimer) is not a leak.
const shippedSources = [
  ...walk(path.join(root, 'src')),
  ...walk(path.join(root, 'public')),
];
for (const file of shippedSources) {
  if (/\.(tsx?|json|ya?ml|md)$/.test(file) && !/\.test\.tsx?$/.test(file)) {
    publicTexts.push(fs.readFileSync(file, 'utf8'));
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run `vite build` first.');
  process.exit(1);
}

const outputs = walk(dist)
  .filter(file => /\.(js|mjs|html|json|xml|txt|map)$/.test(file))
  .map(file => ({
    file: path.relative(root, file),
    text: fs.readFileSync(file, 'utf8'),
  }));

const fingerprints = buildFingerprints(hidden, publicTexts);
const leaks = findLeaks(fingerprints, outputs);

if (leaks.length > 0) {
  console.error('Non-public content found in build output:');
  for (const leak of leaks) {
    console.error(`  ${leak.file}: text from ${leak.label}`);
    console.error(`    "${leak.excerpt}"`);
  }
  process.exit(1);
}

console.log(
  `Leak check passed: ${hidden.length} non-public file(s) or entries, ` +
    `${fingerprints.length} fingerprint(s), ${outputs.length} output file(s) ` +
    `scanned (sourced content ${allowSourced ? 'allowed' : 'hidden'}).`
);
