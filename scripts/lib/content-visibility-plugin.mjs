/**
 * Vite build plugin: keeps non-public content out of the client bundle.
 *
 * The document viewer imports Markdown and companion JSON through dynamic
 * import patterns, so Vite bundles every matching file under content/ as a
 * lazy chunk, including drafts and archived records. The app hides those at
 * runtime, but the text is still downloadable from /assets/*.js.
 *
 * During `vite build` this plugin replaces each non-public file with an empty
 * stub before Vite processes it, and strips non-public entries from category
 * index.yaml files. The decision uses the shared policy in visibility.mjs.
 * Dev mode (`vite`) and the pre-renderer are unaffected, so maintainers can
 * still preview drafts locally.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { isIndexEntryPublic, isRawRecordPublic } from './visibility.mjs';

/** Directories whose files are visibility-gated. */
const DOCUMENT_SECTIONS = ['services', 'government'];
const RECORD_DIRECTORIES = ['hotlines', 'projects'];

/** JSON stub for a hidden record: parses as a draft with no provenance. */
export const HIDDEN_RECORD_JSON = '{"publicationStatus":"draft"}';
export const HIDDEN_MARKDOWN_MODULE = 'export default "";';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

/**
 * Classifies a content file. Returns `undefined` for files the plugin does
 * not gate, otherwise `{ kind, public }`.
 */
export function classifyContentFile(contentRoot, file, allowSourced) {
  const relative = path.relative(contentRoot, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return undefined;
  const parts = relative.split(path.sep);
  const [top] = parts;
  const extension = path.extname(file);

  if (DOCUMENT_SECTIONS.includes(top)) {
    if (path.basename(file) === 'index.yaml') return { kind: 'index' };
    if (extension === '.json') {
      return {
        kind: 'json',
        public: isRawRecordPublic(readJson(file), allowSourced),
      };
    }
    if (extension === '.md') {
      const companion = `${file.slice(0, -'.md'.length)}.json`;
      return {
        kind: 'markdown',
        public: isRawRecordPublic(readJson(companion), allowSourced),
      };
    }
    return undefined;
  }

  if (RECORD_DIRECTORIES.includes(top) && extension === '.json') {
    return {
      kind: 'json',
      public: isRawRecordPublic(readJson(file), allowSourced),
    };
  }

  return undefined;
}

/**
 * Returns the index.yaml text with only entries that are public both in the
 * index and in their companion record.
 */
export function filterIndexYaml(indexFile, source, allowSourced) {
  const data = yaml.load(source);
  if (!data || typeof data !== 'object' || !Array.isArray(data.pages)) {
    return source;
  }
  const directory = path.dirname(indexFile);
  const pages = data.pages.filter(
    page =>
      isIndexEntryPublic(page, allowSourced) &&
      typeof page.slug === 'string' &&
      isRawRecordPublic(
        readJson(path.join(directory, `${page.slug}.json`)),
        allowSourced
      )
  );
  return yaml.dump({ ...data, pages }, { lineWidth: -1 });
}

/**
 * @param {{ root: string, allowSourced: boolean }} options
 */
export function contentVisibilityPlugin({ root, allowSourced }) {
  const contentRoot = path.join(root, 'content');
  const hidden = new Set();

  return {
    name: 'better-gattaran:content-visibility',
    apply: 'build',
    enforce: 'pre',
    load(id) {
      const [file, query = ''] = id.split('?');
      const classification = classifyContentFile(
        contentRoot,
        path.normalize(file),
        allowSourced
      );
      if (!classification) return null;

      const isRaw = new URLSearchParams(query).has('raw');

      if (classification.kind === 'index') {
        const filtered = filterIndexYaml(
          file,
          fs.readFileSync(file, 'utf8'),
          allowSourced
        );
        return isRaw ? `export default ${JSON.stringify(filtered)};` : null;
      }

      if (classification.public) return null;
      hidden.add(path.relative(root, file));

      if (classification.kind === 'json') {
        // Returned as JSON text so Vite's JSON plugin still handles it.
        return HIDDEN_RECORD_JSON;
      }
      if (isRaw) return HIDDEN_MARKDOWN_MODULE;
      this.error(
        `${path.relative(root, file)} is not public and was imported ` +
          'without ?raw; the visibility plugin cannot stub it safely.'
      );
    },
    buildEnd() {
      if (hidden.size > 0) {
        console.log(
          `[content-visibility] Stubbed ${hidden.size} non-public content ` +
            `file(s): ${[...hidden].sort().join(', ')}`
        );
      }
    },
  };
}
