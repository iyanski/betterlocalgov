import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as yaml from 'js-yaml';
import {
  HIDDEN_MARKDOWN_MODULE,
  HIDDEN_RECORD_JSON,
  classifyContentFile,
  contentVisibilityPlugin,
  filterIndexYaml,
} from './lib/content-visibility-plugin.mjs';
import {
  buildFingerprints,
  findLeaks,
  normalizeForMatch,
} from './lib/leak-check.mjs';

const source = {
  title: 'Agency page',
  organization: 'Agency',
  url: 'https://agency.gov.ph/page',
  type: 'national_government',
};

function record(publicationStatus: string, verificationStatus: string) {
  return {
    publicationStatus,
    provenance: { verificationStatus, sources: [source] },
  };
}

const DRAFT_TEXT =
  'Unconfirmed draft wording that must never reach the production bundle.';
const PUBLIC_TEXT = 'Published wording that the bundle is expected to carry.';

let root: string;
let content: string;

function write(relative: string, text: string) {
  const target = path.join(content, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
  return target;
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'bg-visibility-'));
  content = path.join(root, 'content');
  write(
    'government/departments/public-page.md',
    `# Public\n\n${PUBLIC_TEXT}\n`
  );
  write(
    'government/departments/public-page.json',
    JSON.stringify(record('published', 'verified'))
  );
  write('government/departments/draft-page.md', `# Draft\n\n${DRAFT_TEXT}\n`);
  write(
    'government/departments/draft-page.json',
    JSON.stringify(record('draft', 'awaiting_verification'))
  );
  write(
    'services/health/sourced-page.json',
    JSON.stringify(record('published', 'sourced'))
  );
  write('services/health/no-companion.md', '# Orphan\n\nNo companion.\n');
  write(
    'projects/archived-project.json',
    JSON.stringify(record('archived', 'verified'))
  );
  write(
    'government/departments/index.yaml',
    yaml.dump({
      title: 'Departments',
      pages: [
        {
          name: 'Public page',
          slug: 'public-page',
          publicationStatus: 'published',
          verificationStatus: 'verified',
        },
        {
          name: 'Draft page',
          slug: 'draft-page',
          publicationStatus: 'draft',
          verificationStatus: 'awaiting_verification',
          description: 'Index description of a draft that should not ship.',
        },
        {
          // Index says published, but the companion record is a draft.
          name: 'Mismatched page',
          slug: 'draft-page',
          publicationStatus: 'published',
          verificationStatus: 'verified',
        },
      ],
    })
  );
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('classifyContentFile', () => {
  it('uses the companion record for Markdown visibility', () => {
    const at = (file: string) =>
      classifyContentFile(content, path.join(content, file), true);
    expect(at('government/departments/public-page.md')).toEqual({
      kind: 'markdown',
      public: true,
    });
    expect(at('government/departments/draft-page.md')).toEqual({
      kind: 'markdown',
      public: false,
    });
    expect(at('services/health/no-companion.md')).toEqual({
      kind: 'markdown',
      public: false,
    });
    expect(at('projects/archived-project.json')).toEqual({
      kind: 'json',
      public: false,
    });
    expect(at('government/departments/index.yaml')).toEqual({ kind: 'index' });
    expect(at('request-drafts/anything.json')).toBeUndefined();
  });

  it('follows the sourced-content switch', () => {
    const file = path.join(content, 'services/health/sourced-page.json');
    expect(classifyContentFile(content, file, true)?.public).toBe(true);
    expect(classifyContentFile(content, file, false)?.public).toBe(false);
  });

  it('ignores files outside content/', () => {
    expect(
      classifyContentFile(content, path.join(root, 'src/app.json'), true)
    ).toBeUndefined();
  });
});

describe('filterIndexYaml', () => {
  it('keeps only entries public in both the index and the companion', () => {
    const file = path.join(content, 'government/departments/index.yaml');
    const filtered = yaml.load(
      filterIndexYaml(file, fs.readFileSync(file, 'utf8'), true)
    ) as { title: string; pages: { name: string }[] };
    expect(filtered.title).toBe('Departments');
    expect(filtered.pages.map(page => page.name)).toEqual(['Public page']);
  });
});

describe('contentVisibilityPlugin', () => {
  const context = {
    error(message: string): never {
      throw new Error(message);
    },
  };

  function load(file: string, query = '') {
    const plugin = contentVisibilityPlugin({ root, allowSourced: true });
    const hook = plugin.load as (this: typeof context, id: string) => unknown;
    return hook.call(context, `${path.join(content, file)}${query}`);
  }

  it('runs only for production builds, before core plugins', () => {
    const plugin = contentVisibilityPlugin({ root, allowSourced: true });
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('pre');
  });

  it('stubs non-public Markdown and JSON', () => {
    expect(load('government/departments/draft-page.md', '?raw')).toBe(
      HIDDEN_MARKDOWN_MODULE
    );
    expect(load('government/departments/draft-page.json')).toBe(
      HIDDEN_RECORD_JSON
    );
    expect(JSON.parse(HIDDEN_RECORD_JSON)).toEqual({
      publicationStatus: 'draft',
    });
  });

  it('leaves public files to Vite', () => {
    expect(load('government/departments/public-page.md', '?raw')).toBeNull();
    expect(load('government/departments/public-page.json')).toBeNull();
  });

  it('serves a filtered index.yaml', () => {
    const code = load('government/departments/index.yaml', '?raw') as string;
    expect(code).toContain('Public page');
    expect(code).not.toContain('Draft page');
    expect(code).not.toContain('Mismatched page');
  });

  it('refuses a non-public Markdown import it cannot stub', () => {
    expect(() => load('government/departments/draft-page.md')).toThrow(
      /not public/
    );
  });
});

describe('leak check', () => {
  const hidden = [
    { label: 'draft', text: `# Draft\n\n${DRAFT_TEXT}`, kind: 'text' },
  ];

  it('finds hidden text in a minified bundle, whatever the escaping', () => {
    const fingerprints = buildFingerprints(hidden, [PUBLIC_TEXT]);
    const bundle = `var e=${JSON.stringify(DRAFT_TEXT).replace(/ /g, '\\x20')};`;
    expect(findLeaks(fingerprints, [{ file: 'a.js', text: bundle }])).toEqual([
      expect.objectContaining({ label: 'draft', file: 'a.js' }),
    ]);
  });

  it('matches non-ASCII characters written as escapes', () => {
    const text = 'Elected officials, 2025–2028 term, pending a source';
    const fingerprints = buildFingerprints(
      [{ label: 'dash', text, kind: 'text' }],
      []
    );
    const bundle = `x="${text.replace('–', '\\u2013')}"`;
    expect(
      findLeaks(fingerprints, [{ file: 'b.js', text: bundle }])
    ).toHaveLength(1);
  });

  it('passes a clean bundle', () => {
    const fingerprints = buildFingerprints(hidden, [PUBLIC_TEXT]);
    const bundle = `var e=${JSON.stringify(PUBLIC_TEXT)};`;
    expect(findLeaks(fingerprints, [{ file: 'a.js', text: bundle }])).toEqual(
      []
    );
  });

  it('skips text that also appears in public content', () => {
    const shared = 'A disclaimer line shared by public and draft pages alike.';
    const fingerprints = buildFingerprints(
      [{ label: 'draft', text: shared, kind: 'text' }],
      [`Intro\n${shared}`]
    );
    expect(fingerprints).toEqual([]);
  });

  it('fingerprints string values of JSON records', () => {
    const fingerprints = buildFingerprints(
      [
        {
          label: 'record',
          text: JSON.stringify({ request: { subject: DRAFT_TEXT, id: 'x' } }),
          kind: 'json',
        },
      ],
      []
    );
    expect(fingerprints.map(item => item.normalized)).toEqual([
      normalizeForMatch(DRAFT_TEXT),
    ]);
  });
});
